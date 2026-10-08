import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Repo deploy dưới dạng project page: https://thangvt-food.github.io/sugar-cane/
  base: '/sugar-cane/',
  plugins: [react()],
})
