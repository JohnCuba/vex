import { defineApp } from '@vex/core'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'vue-router/vite'

export default defineApp({
  vite: {
    plugins: [
      VueRouter({
        routesFolder: 'src/routes',
        extensions: ['.vue']
      }),
      vue(),
    ]
  }
})
