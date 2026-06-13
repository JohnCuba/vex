import { defineAPIRoute } from "@vex/core";

export default defineAPIRoute({
  get: (_, rep) => {
    rep.send({ id: 1, title: 'First post' })
  },
})
