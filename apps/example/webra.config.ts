import { defineApp } from '@webra/core'
import vue from '@vitejs/plugin-vue'

export default defineApp({
  port: 3000,
  vite: {
    plugins: [vue()]
  }
})
