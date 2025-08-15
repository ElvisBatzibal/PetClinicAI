import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/owners': { target: 'http://localhost:5259', changeOrigin: true },
      '/pets': { target: 'http://localhost:5259', changeOrigin: true },
      '/appointments': { target: 'http://localhost:5259', changeOrigin: true },
    },
  },
})
