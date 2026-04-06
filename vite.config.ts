import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import nodePolyfills from '@rolldown/plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait({
      // Promise export name for top-level await
      promiseExportName: '__tla',
      promiseImportName: (i) => `__tla_${i}`,
    }),
    nodePolyfills(),
  ],
  define: {
    // Manually define globals to satisfy dependencies that expect them
    'global': 'globalThis',
    'process.env': '{}',
  },
  resolve: {
    alias: {
      // Alias 'buffer' and 'process' to their installed polyfills
      'buffer': 'buffer',
      'process': 'process/browser',
    },
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    // Explicitly include buffer and process for optimization
    include: ['buffer', 'process'],
  },
})
