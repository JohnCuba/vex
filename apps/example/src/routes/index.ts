import { defineRoute } from '@webra/core'

export default defineRoute({
  get: (_, rep) => {
    rep.send('Hi from Get')
  },
})
