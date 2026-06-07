import { defineConfig } from "vite";
import dts from 'vite-plugin-dts'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
    }
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      exclude: ['cli', 'bin', 'vite.config.*']
    }),
  ],
  build: {
    ssr: true,
    lib: {
      entry: './lib/index.ts',
      formats: ['es'],
    },
    rolldownOptions: {
      external: [/^virtual:/],
    },
  }
})
