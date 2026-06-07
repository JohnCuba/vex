import { defineClientEntryPoint } from "@vex/core";
import { createSSRApp, type Component } from "vue";
import { createHead } from '@unhead/vue/client'
import App from '../app/app.vue'
import { router } from '../app/router'

export default defineClientEntryPoint<Component>(async (_module) => {
  const app = createSSRApp(App)
  const head = createHead()

  app.use(head)
  app.use(router)

  await router.isReady()

  app.mount("#app")
})
