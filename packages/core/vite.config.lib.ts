import { defineConfig } from "vite";
import dts from 'vite-plugin-dts'

export default defineConfig({
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
