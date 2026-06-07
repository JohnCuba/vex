import { defineConfig } from "vite";
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
    }
  },
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
