import { defineServerEntryPoint } from "@vex/core";
import { createSSRApp, type Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from '../app/app.vue'
import { router } from '../app/router'

export default defineServerEntryPoint<Component>(async (_module, req, rep) => {
  const ctx = {}

  const app = createSSRApp(App)
  app.use(router)

  await router.push(req.url)

  const appHtml = await renderToString(app, ctx)

  return {
    appHtml,
    ctx,
  }
})
