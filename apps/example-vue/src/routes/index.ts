import { defineAPIRoute } from '@vex/core'

export default defineAPIRoute({
  get: (_, rep) => {
    rep.send('Hi from Get')
  },
})
