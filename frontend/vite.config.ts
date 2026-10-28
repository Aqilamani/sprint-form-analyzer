/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Used when mocks are off (VITE_USE_MOCKS=false): forward API calls to FastAPI.
  // Override the target with VITE_API_PROXY_TARGET if port 8000 is taken.
  server: {
    proxy: { '/api': process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8000' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
