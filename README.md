```
        ██╗   ██╗███████╗██╗  ██╗
        ██║   ██║██╔════╝╚██╗██╔╝
        ██║   ██║█████╗   ╚███╔╝
        ╚██╗ ██╔╝██╔══╝   ██╔██╗
         ╚████╔╝ ███████╗██╔╝ ██╗
          ╚═══╝  ╚══════╝╚═╝  ╚═╝

    a minimal SSR runtime — vite + fastify + bun
```

---

```
> status ........... experimental, pre-release
> license .......... unlicensed (private)
> runtime .......... bun, node 20+
> stack ............ vite 8 · fastify 5 · pino · unhead
```

## ~ overview

`vex` is a thin SSR shell that wires three things together:

```
  vite           bundler · HMR · ssrLoadModule
  fastify        http server · logger · middie
  file-router    routes/ → pages & api endpoints
```

view-layer agnostic. bring your own Vue / React / Svelte renderer
via `defineServerEntryPoint` / `defineClientEntryPoint`.

## ~ install

```sh
$ bun install
$ bun run --filter '@vex/core' build
```

Used inside the workspace via `workspace:*`:

```json
"dependencies": {
  "@vex/core": "workspace:*"
}
```

## ~ quickstart

```sh
$ cd apps/example-vue
$ bun run dev          # vex dev    → http://localhost:3000
$ bun run build        # vex build  → dist/{client,server}
$ bun run start        # vex start  → production server
```

## ~ layout

```
.
├── apps/
│   └── example-vue/          reference app · Vue 3 + pinia/colada
│       ├── vex.config.ts
│       └── src/
│           ├── routes/       file-based router
│           ├── entryPoints/  server.ts · client.ts
│           └── app/
└── packages/
    └── core/
        ├── cli/              vex dev | build | start
        ├── lib/              public api (defineApp, defineRoute, …)
        └── src/              runtime — server, router, bundler
```

## ~ routing

drop files into `src/routes/`. naming dictates the URL:

```
  routes/index.vue          →  /
  routes/news.vue           →  /news
  routes/users/index.vue    →  /users
  routes/[id].vue           →  /:id
  routes/[...slug].vue      →  /*slug
```

`.vue` (or any view module) → SSR page.
`.ts` exporting `defineRoute({...})` → API handler.

```ts
// src/routes/post.ts
import { defineRoute } from '@vex/core'

export default defineRoute({
  get: (_, rep) => rep.send({ id: 1, title: 'First post' }),
})
```

dynamic > catch-all. specificity beats declaration order.

## ~ config

```ts
// vex.config.ts
import { defineApp } from '@vex/core'
import vue from '@vitejs/plugin-vue'

export default defineApp({
  port: 3000,
  logLevel: 'debug',
  paths: {
    routes: 'routes',
    entryServer: 'entryPoints/server',
  },
  vite: {
    plugins: [vue()],
  },
})
```

defaults:

```
  port           3000     (PORT env)
  logLevel       debug    (LOG_LEVEL env)
  routes         src/routes
  entryServer    src/entryPoints/server
```

## ~ entry points

server-side renderer — runs per request:

```ts
import { defineServerEntryPoint } from '@vex/core'
import { renderToString } from 'vue/server-renderer'

export default defineServerEntryPoint(async (_module, req, _rep) => {
  const app = createSSRApp(App)
  app.use(router)
  await router.push(req.url)

  return {
    head,
    appHtml: await renderToString(app),
    stateHtml,
    ctx: {},
  }
})
```

client-side hydration — runs in the browser:

```ts
import { defineClientEntryPoint } from '@vex/core'

export default defineClientEntryPoint(async (_module) => {
  const app = createSSRApp(App)
  app.use(router)
  await router.isReady()
  app.mount('#app')
})
```

HTML template uses placeholders:

```
  <!--SSR-STYLES-->     injected vite styles
  <!--SSR-APP-->        rendered app html
  <!--SSR-STATE-->      serialized state
  <!--SSR-ROUTES-->     ssr module preload hints
```

## ~ cli

```
$ vex dev          run vite middleware + fastify (HMR enabled)
$ vex build        bundle client → dist/client, ssr → dist/server
$ vex start        serve dist/ in production (no vite)
```

## ~ lifecycle

graceful shutdown wired by default:

```
  SIGINT / SIGTERM      →  stop fastify, close vite, exit 0
  uncaughtException     →  log fatal, shutdown, exit 1
  unhandledRejection    →  log fatal, shutdown, exit 1
  force timeout         →  10s
```

## ~ scripts

```sh
$ bun run --filter '@vex/core' test:code   # vitest
$ bun run --filter '@vex/core' test:types  # tsc --build
$ bun run --filter '@vex/core' fmt         # oxfmt
$ bun run --filter '@vex/core' build       # vite × 2 (lib + cli)
```

## ~ stack

```
  runtime        bun (workspace catalog)
  bundler        vite 8
  server         fastify 5 + @fastify/middie + @fastify/static
  logger         pino + pino-pretty (dev)
  head           unhead 3
  cli            yargs 18
  testing        vitest 4
  formatting     oxfmt
```

## ~ status

```
  [x] file-based routing (static · dynamic · catch-all)
  [x] api routes via defineRoute
  [x] vite SSR + HMR in dev
  [x] graceful shutdown
  [x] pluggable view layer (Vue example)
  [ ] publish package
  [ ] documentation site
  [ ] stable API surface
```

---

```
~ pre-release. interfaces will change without notice.
```
