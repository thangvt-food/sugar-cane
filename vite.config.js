import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths support both the project page and a custom root domain.
  base: './',
  plugins: [react()],
})
