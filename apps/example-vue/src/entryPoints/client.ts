import { defineClientEntryPoint } from "@vex/core";
import { createSSRApp, type Component } from "vue";
import { createHead } from '@unhead/vue/client'
import { createPinia } from 'pinia'
import { PiniaColada, hydrateQueryCache, useQueryCache, serializeQueryCache } from '@pinia/colada'
import { parse } from 'devalue'
import App from '../app/app.vue'
import { router } from '../app/router'

export default defineClientEntryPoint<Component>(async (_module) => {
  const app = createSSRApp(App)
  const head = createHead()
  const pinia = createPinia()

  app.use(head)
  app.use(pinia)
  app.use(PiniaColada)
  app.use(router)

  const stateEl = document.getElementById('__VEX_STATE__')
  if (stateEl?.textContent) {
    const revivedData = parse(stateEl.textContent, {
      PiniaColada_TreeMapNode: (data: ReturnType<typeof serializeQueryCache>) =>
        data,
    })
    hydrateQueryCache(useQueryCache(pinia), revivedData)
  }

  await router.isReady()

  app.mount("#app")
})
