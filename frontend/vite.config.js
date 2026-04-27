import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/gateway': {
        target: 'https://localhost:8243',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api\/gateway/, ''),
      },
      '/api/token': {
        target: 'https://localhost:9443',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api\/token/, ''),
      },
    },
  },
})