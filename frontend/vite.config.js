import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8000',
      '/categories': 'http://localhost:8000',
      '/transactions': 'http://localhost:8000',
      '/budgets': 'http://localhost:8000',
      '/goals': 'http://localhost:8000',
      '/analytics': 'http://localhost:8000',
      '/rules': 'http://localhost:8000',
    }
  }
})
