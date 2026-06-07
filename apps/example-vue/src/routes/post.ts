import { defineRoute } from "@vex/core";

export default defineRoute({
  get: (_, rep) => {
    rep.send({ id: 1, title: 'First post' })
  },
})
