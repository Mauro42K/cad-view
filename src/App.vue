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
const hasInitialized = ref(false)

const workerUrls = {
  dxfParser: './assets/dxf-parser-worker.js',
  dwgParser: './assets/libredwg-parser-worker.js',
  mtextRender: './assets/mtext-renderer-worker.js'
}

function setStatus(next: ViewerState, message: string) {
  status.value = next
  statusMessage.value = message
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
  errorMessage.value = ''

  try {
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
        <label class="file-button">
          <input
            type="file"
            accept=".dwg,.dxf"
            @change="onFileChange"
          />
          <span>Open local CAD file</span>
        </label>
        <p class="status">{{ statusMessage }}</p>
        <p v-if="fileName" class="file-name">{{ fileName }}</p>
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

      <div ref="viewerHost" class="viewer-host" />
    </section>
  </main>
</template>
