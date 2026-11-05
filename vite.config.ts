import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      'onnxruntime-web/wasm': path.resolve(import.meta.dirname, 'node_modules/onnxruntime-web/dist/ort.wasm.min.mjs'),
      'onnxruntime-web': path.resolve(import.meta.dirname, 'node_modules/onnxruntime-web/dist/ort.wasm.min.mjs'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
})
