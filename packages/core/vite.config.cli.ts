import { defineConfig } from "vite";

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: [
        './cli/dev.ts'
      ],
      formats: ['es'],
    },
    outDir: './bin',
  }
})
