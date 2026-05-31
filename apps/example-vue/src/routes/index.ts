import { defineRoute } from '@vex/core'

export default defineRoute({
  get: (_, rep) => {
    rep.send('Hi from Get')
  },
})
