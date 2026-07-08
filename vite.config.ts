import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@mlightcad/cad-simple-viewer/dist/dxf-parser-worker.js',
          dest: 'assets'
        },
        {
          src: 'node_modules/@mlightcad/cad-simple-viewer/dist/libredwg-parser-worker.js',
          dest: 'assets'
        },
        {
          src: 'node_modules/@mlightcad/cad-simple-viewer/dist/mtext-renderer-worker.js',
          dest: 'assets'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    target: 'es2022'
  }
})
