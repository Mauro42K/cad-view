<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  AcApDocManager,
  applyUiTheme
} from '@mlightcad/cad-simple-viewer'
import { registerSimpleUiPlugin } from '@mlightcad/cad-simple-ui-plugin/register'

type ViewerState = 'idle' | 'loading' | 'ready' | 'error'

const viewerHost = ref<HTMLElement | null>(null)
const status = ref<ViewerState>('idle')
const statusMessage = ref('Ready to open a local DWG or DXF file.')
const errorMessage = ref('')
const fileName = ref('')
const fileSizeText = ref('')
const isDropTargetActive = ref(false)
const hasInitialized = ref(false)
const fileInputEl = ref<HTMLInputElement | null>(null)

const workerUrls = {
  dxfParser: './assets/dxf-parser-worker.js',
  dwgParser: './assets/libredwg-parser-worker.js',
  mtextRender: './assets/mtext-renderer-worker.js'
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

    AcApDocManager.createInstance({
      container: viewerHost.value,
      busyIndicatorHost: viewerHost.value,
      webworkerFileUrls: workerUrls,
      notLoadDefaultFonts: true,
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

async function openLocalFile(file: File) {
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
  fileName.value = file.name
  fileSizeText.value = formatFileSize(file.size)
  errorMessage.value = ''

  try {
    console.debug('[CAD View] opening local file', {
      name: file.name,
      size: file.size,
      type: file.type || 'unknown'
    })
    await manager.openFile(file)
    setStatus('ready', `${file.name} opened locally in the browser.`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not open the selected file.'
    errorMessage.value = message
    setStatus('error', 'File open failed.')
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return
  void openLocalFile(file)
  if (input) input.value = ''
}

function triggerFilePicker() {
  fileInputEl.value?.click()
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

  void openLocalFile(file)
}

onMounted(() => {
  void ensureViewer()
})

onBeforeUnmount(() => {
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
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
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
    </section>
  </main>
</template>
