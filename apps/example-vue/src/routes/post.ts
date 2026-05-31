import { defineRoute } from "@vex/core";

export default defineRoute({
  get: (_, rep) => {
    rep.send('Yo it\'s POST')
  },
})
