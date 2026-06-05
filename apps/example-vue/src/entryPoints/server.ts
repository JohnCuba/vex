import { defineServerEntryPoint } from "@vex/core";
import { createSSRApp, type Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from '../app/app.vue'
import { router } from '../app/router'

export default defineServerEntryPoint<Component>(async (_module, req, rep) => {
  const app = createSSRApp(App).use(router)

  return {
    appHtml: await renderToString(app),
  }
})
