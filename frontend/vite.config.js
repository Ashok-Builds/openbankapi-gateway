import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: 'all',
    proxy: {
      '/api/gateway': {
        target: 'http://localhost:8243',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api\/gateway/, ''),
      },
      '/api/token': {
        target: 'http://localhost:9443',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api\/token/, ''),
      },
    },
  },
})
