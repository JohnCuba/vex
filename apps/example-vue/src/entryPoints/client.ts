import { defineClientEntryPoint } from "@vex/core";
import { createSSRApp, type Component } from "vue";

export default defineClientEntryPoint<Component>(async (module) => {
  const app = createSSRApp(module)
  app.mount("#app")
})
