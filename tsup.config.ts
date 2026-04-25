import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    node: 'src/node.ts',
    'webhooks/index': 'src/webhooks/index.ts',
  },
  format: ['esm'],
  dts: { resolve: true },
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  target: 'es2022',
  platform: 'neutral',
  external: [],
  minify: false,
  outDir: 'dist',
})
