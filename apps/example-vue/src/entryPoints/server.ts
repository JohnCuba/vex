import { defineServerEntryPoint } from "@vex/core";
import { createSSRApp, type Component } from 'vue'
import { renderToString } from 'vue/server-renderer'

export default defineServerEntryPoint<Component>(async (module, req, rep) => {
  const app = createSSRApp(module)

  return {
    appHtml: await renderToString(app),
  }
})
