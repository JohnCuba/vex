import { defineClientEntryPoint } from "@vex/core";
import { createSSRApp, type Component } from "vue";
import App from '../app/app.vue'
import { router } from '../app/router'

export default defineClientEntryPoint<Component>(async (_module) => {
  const app = createSSRApp(App)

  app.use(router)

  await router.isReady()

  app.mount("#app")
})
