import { defineServerEntryPoint } from '@vex/core'
import { createSSRApp, type Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createHead } from '@unhead/vue/server'
import App from '../app/app.vue'
import { router } from '../app/router'

export default defineServerEntryPoint<Component>(async (_module, req, _rep) => {
  const ctx = {}

  const app = createSSRApp(App)
  const head = createHead()

  app.use(head)
  app.use(router)

  await router.push(req.url)

  const appHtml = await renderToString(app, ctx)

  return {
    head,
    appHtml,
    ctx,
  }
})
