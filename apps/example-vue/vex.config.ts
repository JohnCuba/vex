import { defineApp } from '@vex/core'
import vue from '@vitejs/plugin-vue'

export default defineApp({
  port: 3000,
  vite: {
    plugins: [vue()]
  }
})
