import { defineConfig } from "vite";

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: [
        './cli/vex.ts'
      ],
      formats: ['es'],
    },
    outDir: './bin',
  }
})
