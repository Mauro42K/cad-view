<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  AcApDocManager,
  applyUiTheme,
  eventBus
} from '@mlightcad/cad-simple-viewer'
import { registerSimpleUiPlugin } from '@mlightcad/cad-simple-ui-plugin/register'

type ViewerState = 'idle' | 'loading' | 'ready' | 'error'
type FontMapping = Record<string, string>
type FileOrigin = 'selected' | 'dropped'

interface PerfCheckpoint {
  key: string
  label: string
  detail: string
  at: number
  delta: number
  total: number
  count: number
}

interface PerfRun {
  fileName: string
  fileSizeText: string
  origin: FileOrigin
  startedAt: number
  arrayBufferStartAt?: number
  arrayBufferReadyAt?: number
  openDocumentStartAt?: number
  openDocumentResolvedAt?: number
  visualReadyAt?: number
  readyAt?: number
  errorAt?: number
  progressLabel?: string
  progressDetail?: string
  progressBucket?: string
  progressAt?: number
  finalMessage?: string
  currentProgressMessage?: string
  currentProgressKey?: string
  currentProgressPercentage?: number
  currentProgressStatus?: string
  checkpoints: PerfCheckpoint[]
}

const viewerHost = ref<HTMLElement | null>(null)
const status = ref<ViewerState>('idle')
const statusMessage = ref('Ready to open a local DWG or DXF file.')
const loadingNote = ref('')
const errorMessage = ref('')
const fileName = ref('')
const fileSizeText = ref('')
const isDropTargetActive = ref(false)
const viewerResetMessage = ref('')
const fontWarning = ref('')
const fontFallbackNote = ref('')
const perfPanelOpen = ref(true)
const perfRun = ref<PerfRun | null>(null)
const hasInitialized = ref(false)
const fileInputEl = ref<HTMLInputElement | null>(null)
const lastOpenedFile = ref<{ name: string; size: number; content: ArrayBuffer } | null>(null)
const appliedFontMapping: FontMapping = {}
const fallbackFontMap: FontMapping = {
  dutcheb: 'hztxt',
  isocteur: 'hztxt',
  owens_brwy_std: 'hztxt'
}

const workerUrls = {
  dxfParser: './assets/dxf-parser-worker.js',
  dwgParser: './assets/libredwg-parser-worker.js',
  mtextRender: './assets/mtext-renderer-worker.js'
}

const defaultFontBaseUrl = 'https://cdn.jsdelivr.net/gh/mlightcad/cad-data/'
const fontBaseUrl = ensureTrailingSlash(
  (import.meta.env.VITE_CAD_FONTS_BASE_URL as string | undefined)?.trim() ||
    defaultFontBaseUrl
)
const slowParseTimers: number[] = []

function ensureTrailingSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`
}

function normalizeFontName(fontName: string) {
  return fontName.trim().toLowerCase()
}

function getFallbackFont(fontName: string) {
  return fallbackFontMap[normalizeFontName(fontName)]
}

function getNow() {
  return performance.now()
}

function formatDuration(ms: number) {
  if (!Number.isFinite(ms)) return 'n/a'
  if (ms < 1000) return `${Math.round(ms)} ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}m ${seconds}s`
}

function clearSlowParseTimers() {
  while (slowParseTimers.length > 0) {
    const timerId = slowParseTimers.pop()
    if (timerId !== undefined) window.clearTimeout(timerId)
  }
}

function recordPerfCheckpoint(label: string, detail = '', key = label) {
  if (!perfRun.value) return
  const at = getNow()
  const checkpoints = perfRun.value.checkpoints
  const index = checkpoints.findIndex(entry => entry.key === key)
  if (index >= 0) {
    const existing = checkpoints[index]
    existing.label = label
    existing.detail = detail
    existing.at = at
    existing.total = at - perfRun.value.startedAt
    existing.count += 1
    return
  }

  const previous = checkpoints[checkpoints.length - 1]
  checkpoints.push({
    key,
    label,
    detail,
    at,
    delta: previous ? at - previous.at : at - perfRun.value.startedAt,
    total: at - perfRun.value.startedAt,
    count: 1
  })
}

function beginPerfRun(file: File, origin: FileOrigin) {
  clearSlowParseTimers()
  const startedAt = getNow()
  perfRun.value = {
    fileName: file.name,
    fileSizeText: formatFileSize(file.size),
    origin,
    startedAt,
    checkpoints: [
      {
        key: origin,
        label: origin === 'selected' ? 'file selected' : 'file dropped',
        detail: file.name,
        at: startedAt,
        delta: 0,
        total: 0,
        count: 1
      }
    ]
  }
  loadingNote.value = 'Preparing local file...'
}

function finalizePerfRun(state: 'ready' | 'error', message: string) {
  clearSlowParseTimers()
  if (!perfRun.value) return
  const endedAt = getNow()
  perfRun.value.finalMessage = message
  if (state === 'ready') {
    perfRun.value.visualReadyAt ??= endedAt
  } else {
    perfRun.value.errorAt = endedAt
  }
  recordPerfCheckpoint(state === 'ready' ? 'visual ready' : 'error', message, state)
}

function markVisuallyReady() {
  if (!perfRun.value || perfRun.value.visualReadyAt || perfRun.value.errorAt) return
  const endedAt = getNow()
  perfRun.value.visualReadyAt = endedAt
  perfRun.value.readyAt = endedAt
  const readElapsed =
    perfRun.value.arrayBufferStartAt !== undefined && perfRun.value.arrayBufferReadyAt !== undefined
      ? perfRun.value.arrayBufferReadyAt - perfRun.value.arrayBufferStartAt
      : undefined
  const openElapsed =
    perfRun.value.openDocumentStartAt !== undefined && perfRun.value.openDocumentResolvedAt !== undefined
      ? perfRun.value.openDocumentResolvedAt - perfRun.value.openDocumentStartAt
      : undefined
  const visualElapsed =
    perfRun.value.openDocumentResolvedAt !== undefined
      ? endedAt - perfRun.value.openDocumentResolvedAt
      : undefined
  const totalElapsed = endedAt - perfRun.value.startedAt
  const summaryParts = [
    readElapsed !== undefined ? `read ${formatDuration(readElapsed)}` : '',
    openElapsed !== undefined ? `openDocument ${formatDuration(openElapsed)}` : '',
    visualElapsed !== undefined ? `visual ${formatDuration(visualElapsed)}` : '',
    totalElapsed !== undefined ? `total ${formatDuration(totalElapsed)}` : ''
  ].filter(Boolean)
  const summary = summaryParts.length > 0 ? ` (${summaryParts.join(', ')})` : ''
  const readyMessage = `${perfRun.value.fileName} visually ready in the browser.${summary}`
  setStatus('ready', readyMessage)
  setLoadingNote('')
  recordPerfCheckpoint('visual ready', readyMessage, 'visual ready')
}

function setLoadingNote(note: string) {
  loadingNote.value = note
}

function describeProgress(data: {
  stage?: string
  subStage?: string
  percentage?: number
  stageStatus?: string
}) {
  const stage = data.stage?.toUpperCase()
  const subStage = data.subStage?.toUpperCase()
  const stageStatus = data.stageStatus?.toUpperCase()
  const percentage =
    typeof data.percentage === 'number' ? ` ${Math.round(data.percentage)}%` : ''
  if (stageStatus === 'ERROR') {
    return 'File open failed.'
  }
  if (stage === 'FETCH_FILE') {
    return `Fetching CAD file from source${percentage}`
  }
  if (stage === 'CONVERSION') {
    if (subStage === 'ENTITY' && (data.percentage ?? 0) >= 100) {
      return 'Finalizing CAD document...'
    }
    if (subStage === 'END') {
      return 'Finalizing CAD document...'
    }
    if (subStage) {
      if (subStage === 'OBJECT') return 'Parsing named dictionaries...'
      return `Processing CAD file… ${subStage.replace(/_/g, ' ').toLowerCase()}${percentage}`
    }
    return `Processing CAD file…${percentage}`
  }
  return `Processing CAD file…${percentage}`
}

function scheduleSlowParseHints() {
  clearSlowParseTimers()
  slowParseTimers.push(
    window.setTimeout(() => {
      if (!perfRun.value || perfRun.value.readyAt || perfRun.value.errorAt) return
      setLoadingNote('Parsing CAD file… complex DWG files can take several minutes.')
    }, 30_000)
  )
  slowParseTimers.push(
    window.setTimeout(() => {
      if (!perfRun.value || perfRun.value.readyAt || perfRun.value.errorAt) return
      setLoadingNote('Still parsing… this file may be complex.')
    }, 120_000)
  )
}

async function waitForViewerToSettle() {
  const start = getNow()
  while (AcApDocManager.instance?.curView?.isProcessingEntities) {
    if (getNow() - start > 600_000) {
      throw new Error('Viewer is still processing entities.')
    }
    await new Promise(resolve => window.setTimeout(resolve, 250))
  }
}

function describeProgressKey(payload: {
  stage?: string
  subStage?: string
  stageStatus?: string
}) {
  const stage = payload.stage?.toUpperCase() ?? 'UNKNOWN'
  if (stage === 'FETCH_FILE') return 'FETCH_FILE'
  const subStage = payload.subStage?.toUpperCase()
  if (!subStage) return stage
  return `${stage}:${subStage}`
}

function recordProgressMessage(payload: {
  stage?: string
  subStage?: string
  percentage?: number
  stageStatus?: string
}) {
  if (!perfRun.value) return
  const at = getNow()
  const key = describeProgressKey(payload)
  const label = payload.subStage?.toUpperCase() ?? payload.stage?.toUpperCase() ?? 'progress'
  const detail = describeProgress(payload)
  const percentage = typeof payload.percentage === 'number' ? Math.round(payload.percentage) : undefined
  perfRun.value.progressLabel = payload.stage?.toUpperCase()
  perfRun.value.progressDetail = payload.subStage?.toUpperCase() ?? payload.stageStatus?.toUpperCase() ?? ''
  perfRun.value.progressAt = at
  perfRun.value.currentProgressMessage = detail
  perfRun.value.currentProgressKey = key
  perfRun.value.currentProgressPercentage = percentage
  perfRun.value.currentProgressStatus = payload.stageStatus?.toUpperCase()

  const checkpoints = perfRun.value.checkpoints
  const index = checkpoints.findIndex(entry => entry.key === key)
  if (index >= 0) {
    const existing = checkpoints[index]
    existing.label = label
    existing.detail = detail
    existing.at = at
    existing.total = at - perfRun.value.startedAt
    existing.count += 1
    return
  }

  const previous = checkpoints[checkpoints.length - 1]
  checkpoints.push({
    key,
    label,
    detail,
    at,
    delta: previous ? at - previous.at : at - perfRun.value.startedAt,
    total: at - perfRun.value.startedAt,
    count: 1
  })
}

function applyFontMapping(fontName: string, mappedFont: string) {
  const normalizedName = normalizeFontName(fontName)
  if (appliedFontMapping[normalizedName] === mappedFont) return
  appliedFontMapping[normalizedName] = mappedFont

  const renderer = AcApDocManager.instance.curView.renderer as unknown as {
    setFontMapping?: (mapping: FontMapping) => void
  }
  renderer.setFontMapping?.({ ...appliedFontMapping })
  AcApDocManager.instance.regen()
}

function onViewerFontIssue(message: string) {
  fontWarning.value = message
}

function onViewerVisibilityChange() {
  if (document.visibilityState === 'visible' && status.value === 'ready') {
    void reopenLastFile('Viewer was paused or reset while inactive.')
  }
}

function onFontsNotFound(payload: { fonts: string[] }) {
  if (payload.fonts.length === 0) return
  onViewerFontIssue(
    `Some CAD fonts are missing: ${payload.fonts.slice(0, 3).join(', ')}${payload.fonts.length > 3 ? '…' : ''}. Text or dimensions may be incomplete.`
  )
}

function onFontsNotLoaded(payload: { fonts: Array<{ fontName: string; url: string }> }) {
  if (payload.fonts.length === 0) return
  const firstFont = payload.fonts[0]
  onViewerFontIssue(
    `Some CAD fonts could not be loaded from ${fontBaseUrl}. The viewer may render text or dimensions incompletely.`
  )
  console.debug('[CAD View] font loading failed', firstFont)
}

function onFontRepositoryUnavailable(payload: { url: string }) {
  onViewerFontIssue(`Font repository unavailable at ${payload.url}. Text or dimensions may be incomplete.`)
}

function onFontMissing(payload: { fontName: string; count: number }) {
  const fallbackFont = getFallbackFont(payload.fontName)
  if (fallbackFont) {
    applyFontMapping(payload.fontName, fallbackFont)
    fontFallbackNote.value = `Fallback font applied for ${payload.fontName} → ${fallbackFont}. Add the original font locally for higher fidelity.`
    fontWarning.value = ''
    return
  }

  const missingCount = payload.count > 1 ? ` (${payload.count} entities)` : ''
  fontWarning.value = `Some CAD fonts are missing: ${payload.fontName}${missingCount}. Text or dimensions may be incomplete.`
}

function onOpenFileProgress(payload: {
  stage?: string
  subStage?: string
  percentage?: number
  stageStatus?: string
}) {
  if (!perfRun.value || perfRun.value.visualReadyAt || perfRun.value.errorAt) return
  const progressMessage = describeProgress(payload)
  setLoadingNote(progressMessage)
  recordProgressMessage(payload)
}

function onFailedToOpenFile(payload: { fileName: string }) {
  if (!perfRun.value || perfRun.value.visualReadyAt || perfRun.value.errorAt) return
  const at = getNow()
  const message = `Viewer reported a file-open failure for ${payload.fileName}.`
  perfRun.value.errorAt = at
  perfRun.value.finalMessage = message
  recordPerfCheckpoint('viewer error', message, 'error')
}

function setStatus(next: ViewerState, message: string) {
  status.value = next
  statusMessage.value = message
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`
}

async function ensureViewer() {
  if (hasInitialized.value || !viewerHost.value) return

  hasInitialized.value = true
  setStatus('loading', 'Loading viewer engine...')

  try {
    applyUiTheme('dark', viewerHost.value)

    const ready = await AcApDocManager.checkWebworkerReadiness(workerUrls)
    if (!ready) {
      throw new Error('CAD worker scripts are not reachable.')
    }

    eventBus.on('fonts-not-found', onFontsNotFound)
    eventBus.on('fonts-not-loaded', onFontsNotLoaded)
    eventBus.on('failed-to-get-avaiable-fonts', onFontRepositoryUnavailable)
    eventBus.on('font-not-found', onFontMissing)

    AcApDocManager.createInstance({
      container: viewerHost.value,
      busyIndicatorHost: viewerHost.value,
      baseUrl: fontBaseUrl,
      webworkerFileUrls: workerUrls,
      checkWorkersOnInit: true
    })

    await registerSimpleUiPlugin(AcApDocManager.instance.pluginManager, {
      host: viewerHost.value,
      toolbar: {
        placement: 'right',
        items: 'default',
        collapsible: true
      },
      dockPanel: {
        defaultSide: 'left',
        defaultOpen: false
      }
    })

    setStatus('ready', 'Viewer ready. Open a local DWG or DXF file.')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown viewer error.'
    errorMessage.value = message
    setStatus('error', 'Viewer failed to initialize.')
  }
}

async function openLocalFile(file: File, origin: FileOrigin = 'selected') {
  await ensureViewer()
  if (status.value === 'error') return

  const manager = AcApDocManager.instance
  if (!(await manager.areWorkersReady())) {
    errorMessage.value = 'Viewer workers are unavailable.'
    setStatus('error', 'Cannot open file.')
    return
  }

  status.value = 'loading'
  statusMessage.value = `Opening ${file.name}...`
  setLoadingNote('Reading local file into memory...')
  fileName.value = file.name
  fileSizeText.value = formatFileSize(file.size)
  errorMessage.value = ''
  viewerResetMessage.value = ''
  fontWarning.value = ''
  fontFallbackNote.value = ''

  try {
    if (!perfRun.value || perfRun.value.fileName !== file.name) {
      beginPerfRun(file, origin)
    }
    if (perfRun.value && !perfRun.value.arrayBufferStartAt) {
      perfRun.value.arrayBufferStartAt = getNow()
      recordPerfCheckpoint('arrayBuffer read started', file.name)
    }
    const content = await file.arrayBuffer()
    if (perfRun.value && !perfRun.value.arrayBufferReadyAt) {
      perfRun.value.arrayBufferReadyAt = getNow()
      recordPerfCheckpoint('arrayBuffer ready', formatFileSize(file.size))
    }
    lastOpenedFile.value = { name: file.name, size: file.size, content }
    console.debug('[CAD View] opening local file', {
      name: file.name,
      size: file.size,
      type: file.type || 'unknown'
    })
    if (perfRun.value && !perfRun.value.openDocumentStartAt) {
      perfRun.value.openDocumentStartAt = getNow()
      recordPerfCheckpoint('openDocument started', file.name)
      scheduleSlowParseHints()
      setLoadingNote('Parsing CAD file...')
    }
    const opened = await manager.openDocument(file.name, content, {
      mode: 0
    })
    if (!opened) {
      throw new Error('The viewer rejected the selected file.')
    }
    if (perfRun.value && !perfRun.value.openDocumentResolvedAt) {
      perfRun.value.openDocumentResolvedAt = getNow()
      recordPerfCheckpoint('openDocument resolved', file.name, 'openDocument resolved')
      setLoadingNote(
        perfRun.value.currentProgressMessage ??
          'Finalizing CAD document...'
      )
    }
    await waitForViewerToSettle()
    const totalElapsed =
      perfRun.value?.startedAt !== undefined ? getNow() - perfRun.value.startedAt : undefined
    const readElapsed =
      perfRun.value?.arrayBufferStartAt !== undefined &&
      perfRun.value?.arrayBufferReadyAt !== undefined
        ? perfRun.value.arrayBufferReadyAt - perfRun.value.arrayBufferStartAt
        : undefined
    const openElapsed =
      perfRun.value?.openDocumentStartAt !== undefined
        ? (perfRun.value.openDocumentResolvedAt ?? getNow()) - perfRun.value.openDocumentStartAt
        : undefined
    const settleElapsed =
      perfRun.value?.openDocumentResolvedAt !== undefined
        ? getNow() - perfRun.value.openDocumentResolvedAt
        : undefined
    const summaryParts = [
      readElapsed !== undefined ? `read ${formatDuration(readElapsed)}` : '',
      openElapsed !== undefined ? `openDocument ${formatDuration(openElapsed)}` : '',
      settleElapsed !== undefined ? `settle ${formatDuration(settleElapsed)}` : '',
      totalElapsed !== undefined ? `total ${formatDuration(totalElapsed)}` : ''
    ].filter(Boolean)
    const summary = summaryParts.length > 0 ? ` (${summaryParts.join(', ')})` : ''
    const readyMessage = `${file.name} parsed and waiting for visual ready confirmation.${summary}`
    setStatus('loading', readyMessage)
    setLoadingNote(perfRun.value?.currentProgressMessage ?? 'Finalizing CAD document...')
    if (perfRun.value && !perfRun.value.visualReadyAt) {
      recordPerfCheckpoint(
        'awaiting visual ready',
        'Click Mark visually ready when the drawing looks usable.',
        'awaiting-visual-ready'
      )
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not open the selected file.'
    errorMessage.value = message
    setStatus('error', 'File open failed.')
    setLoadingNote('')
    finalizePerfRun('error', message)
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return
  beginPerfRun(file, 'selected')
  void openLocalFile(file, 'selected')
  if (input) input.value = ''
}

function triggerFilePicker() {
  const input = fileInputEl.value
  if (!input) return
  if (typeof input.showPicker === 'function') {
    input.showPicker()
    return
  }
  input.click()
}

function onViewerDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDropTargetActive.value = true
}

function onViewerDragLeave(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDropTargetActive.value = false
}

function onViewerDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDropTargetActive.value = false

  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  if (!/\.(dwg|dxf)$/i.test(file.name)) {
    errorMessage.value = 'Only .dwg and .dxf files are accepted.'
    setStatus('error', 'Unsupported file type.')
    return
  }

  beginPerfRun(file, 'dropped')
  void openLocalFile(file, 'dropped')
}

async function reopenLastFile(reason: string) {
  if (!lastOpenedFile.value) {
    viewerResetMessage.value = reason
    return
  }

  viewerResetMessage.value = reason
  try {
    setStatus('loading', `${reason} Reopening ${lastOpenedFile.value.name}...`)
    const opened = await AcApDocManager.instance.openDocument(
      lastOpenedFile.value.name,
      lastOpenedFile.value.content,
      { mode: 0 }
    )
    if (!opened) {
      throw new Error('The viewer rejected the reloaded file.')
    }
    setStatus('ready', `${lastOpenedFile.value.name} restored after viewer reset.`)
    viewerResetMessage.value = ''
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not restore the last file.'
    errorMessage.value = message
    setStatus('error', 'Viewer reset recovery failed.')
  }
}

onMounted(() => {
  void ensureViewer()
  document.addEventListener('visibilitychange', onViewerVisibilityChange)
  eventBus.on('open-file-progress', onOpenFileProgress)
  eventBus.on('failed-to-open-file', onFailedToOpenFile)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onViewerVisibilityChange)
  eventBus.off('open-file-progress', onOpenFileProgress)
  eventBus.off('failed-to-open-file', onFailedToOpenFile)
  eventBus.off('fonts-not-found', onFontsNotFound)
  eventBus.off('fonts-not-loaded', onFontsNotLoaded)
  eventBus.off('failed-to-get-avaiable-fonts', onFontRepositoryUnavailable)
  eventBus.off('font-not-found', onFontMissing)
  clearSlowParseTimers()
  AcApDocManager.instance?.dispose?.()
})
</script>

<template>
  <main class="app-shell">
    <section class="hero">
      <div class="copy">
        <p class="eyebrow">CAD View</p>
        <h1>CAD View</h1>
        <p class="subtitle">Private DWG/DXF Browser Viewer</p>
        <p class="note">
          Local files open directly in the browser. Nothing is uploaded to a
          server.
        </p>
      </div>

      <div class="controls">
        <input
          ref="fileInputEl"
          class="file-input"
          type="file"
          accept=".dwg,.dxf"
          @change="onFileChange"
        />
        <button type="button" class="file-button" @click="triggerFilePicker">
          Open Local CAD file
        </button>
        <p class="status">{{ statusMessage }}</p>
        <p v-if="fileName" class="file-name">{{ fileName }}</p>
        <p v-if="fileSizeText" class="file-size">{{ fileSizeText }}</p>
        <p v-if="viewerResetMessage" class="warning">{{ viewerResetMessage }}</p>
        <p v-if="fontFallbackNote" class="info">{{ fontFallbackNote }}</p>
        <p v-if="fontWarning" class="warning">{{ fontWarning }}</p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="loadingNote" class="loading-note">{{ loadingNote }}</p>
      </div>
    </section>

    <section class="viewer-card">
      <div class="viewer-header">
        <div>
          <h2>Viewer</h2>
          <p>Open a local DWG or DXF to render it here.</p>
        </div>
        <span class="state-pill" :data-state="status">{{ status }}</span>
      </div>

      <div
        ref="viewerHost"
        class="viewer-host"
        :class="{ 'is-drop-active': isDropTargetActive }"
        @dragover="onViewerDragOver"
        @dragleave="onViewerDragLeave"
        @drop="onViewerDrop"
      />

      <details class="perf-panel" :open="perfPanelOpen">
        <summary @click.prevent="perfPanelOpen = !perfPanelOpen">
          Performance baseline
          <span v-if="perfRun" class="perf-pill">{{ perfRun.origin }}</span>
        </summary>
        <div v-if="perfRun" class="perf-grid">
          <div>
            <span>File</span>
            <strong>{{ perfRun.fileName }}</strong>
          </div>
          <div>
            <span>Size</span>
            <strong>{{ perfRun.fileSizeText }}</strong>
          </div>
          <div>
            <span>Selected</span>
            <strong>{{ formatDuration(perfRun.arrayBufferStartAt ? perfRun.arrayBufferStartAt - perfRun.startedAt : 0) }}</strong>
          </div>
          <div>
            <span>Read</span>
            <strong>{{ perfRun.arrayBufferStartAt && perfRun.arrayBufferReadyAt ? formatDuration(perfRun.arrayBufferReadyAt - perfRun.arrayBufferStartAt) : 'n/a' }}</strong>
          </div>
          <div>
            <span>openDocument</span>
            <strong>{{ perfRun.openDocumentStartAt && perfRun.openDocumentResolvedAt ? formatDuration(perfRun.openDocumentResolvedAt - perfRun.openDocumentStartAt) : 'n/a' }}</strong>
          </div>
          <div>
            <span>Visual</span>
            <strong>
              {{
                perfRun.visualReadyAt && perfRun.openDocumentResolvedAt
                  ? formatDuration(perfRun.visualReadyAt - perfRun.openDocumentResolvedAt)
                  : perfRun.openDocumentResolvedAt
                    ? formatDuration(getNow() - perfRun.openDocumentResolvedAt)
                    : 'n/a'
              }}
            </strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{{ perfRun.visualReadyAt || perfRun.errorAt ? formatDuration(((perfRun.visualReadyAt ?? perfRun.errorAt) - perfRun.startedAt)) : 'running' }}</strong>
          </div>
          <div>
            <span>Pipeline</span>
            <strong>{{ perfRun.currentProgressMessage ?? 'waiting...' }}</strong>
          </div>
        </div>
        <button
          v-if="perfRun && perfRun.openDocumentResolvedAt && !perfRun.visualReadyAt && !perfRun.errorAt"
          type="button"
          class="perf-ready-button"
          @click="markVisuallyReady"
        >
          Mark visually ready
        </button>
        <ul v-if="perfRun" class="perf-timeline">
          <li v-for="event in perfRun.checkpoints" :key="`${event.key}-${event.at}`">
            <strong>{{ event.label }}</strong>
            <span>{{ formatDuration(event.total) }}</span>
            <small>+{{ formatDuration(event.delta) }}</small>
            <small v-if="event.count > 1">{{ event.count }} updates</small>
            <small v-if="event.detail">{{ event.detail }}</small>
          </li>
        </ul>
        <p v-else class="perf-empty">Open a local DWG or DXF to capture a performance baseline.</p>
      </details>
    </section>
  </main>
</template>
