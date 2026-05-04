import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: 'all',
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
      '/health/3001': { target: 'http://localhost:3001', changeOrigin: true, rewrite: path => path.replace(/^\/health\/3001/, '') },
      '/health/3002': { target: 'http://localhost:3002', changeOrigin: true, rewrite: path => path.replace(/^\/health\/3002/, '') },
      '/health/3003': { target: 'http://localhost:3003', changeOrigin: true, rewrite: path => path.replace(/^\/health\/3003/, '') },
      '/health/3004': { target: 'http://localhost:3004', changeOrigin: true, rewrite: path => path.replace(/^\/health\/3004/, '') },
    },
  },
})