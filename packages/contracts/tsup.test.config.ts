import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['test/*.test.ts'],
  format: ['esm'],
  outDir: 'dist/test',
  tsconfig: 'test/tsconfig.json',
  dts: false,
  clean: true,
  // node:test has no unprefixed module, so preserve Node's built-in imports.
  removeNodeProtocol: false,
});
