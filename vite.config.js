import { defineConfig } from 'vite'

export default defineConfig({
  root: 'dev',
  /**
   * @see https://vitejs.dev/config/server-options.html
   */
  server: {
    host: 'localhost',
    port: 8080,
    hmr: true,
  },
  /**
   * When building in Library Mode (lib), the 'es' build contains
   * whitespaces and even JSDoc comments when minified.
   * When Rollup is used (via rollupOptions), it works as in only
   * Rollup is used.
   *
   * @see https://vitejs.dev/guide/build.html
   */
  build: {
    target: 'esnext',
    minify: 'esbuild',
    outDir: '../dist',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      // https://stackoverflow.com/questions/71500190/how-to-keep-root-level-export-when-building-with-vite-in-format-esm
      preserveEntrySignatures: 'exports-only',
      // https://rollupjs.org/guide/en/#big-list-of-options
      input: {
        bundle: 'lib/index.js',
      },
      output: [{
        entryFileNames: '[name].js',
        format: 'es',
        exports: 'named',
      }],
    },
  },
})
