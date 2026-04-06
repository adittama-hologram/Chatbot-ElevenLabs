import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    host: '0.0.0.0',
    strictPort: true,
    cors: true,
    allowedHosts: true, // Required for Vite 6+ to allow custom domains
    hmr: false, // Disable HMR entirely for stability on remote custom domains
  },
})
