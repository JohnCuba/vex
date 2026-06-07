import { defineServerEntryPoint } from '@vex/core'
import { createSSRApp, type Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createHead } from '@unhead/vue/server'
import { createPinia } from 'pinia'
import { PiniaColada, useQueryCache, isQueryCache, serializeQueryCache } from '@pinia/colada'
import { stringifyAsync } from 'devalue'
import App from '../app/app.vue'
import { router } from '../app/router'

export default defineServerEntryPoint<Component>(async (_module, req, _rep) => {
  const ctx = {}

  const app = createSSRApp(App)
  const head = createHead()
  const pinia = createPinia()

  app.use(head)
  app.use(pinia)
  app.use(PiniaColada)
  app.use(router)

  await router.push(req.url)

  const appHtml = await renderToString(app, ctx)
  const stateHtml = await stringifyAsync(useQueryCache(pinia), {
    PiniaColada_TreeMapNode: (data: unknown) => isQueryCache(data) && serializeQueryCache(data),
  })

  return {
    head,
    appHtml,
    stateHtml,
    ctx,
  }
})
