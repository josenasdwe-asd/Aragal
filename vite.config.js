import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: './index.html'
    }
  },
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      // Asegurar que las rutas se resuelvan correctamente
      '/src': '/src'
    }
  }
})