import { defineConfig } from "vite";

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: [
        './cli/webra.ts'
      ],
      formats: ['es'],
    },
    outDir: './bin',
  }
})
