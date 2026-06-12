import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.lib.json',
      insertTypesEntry: true,
      exclude: ['cli', 'bin', 'vite.config.*'],
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
  },
});
