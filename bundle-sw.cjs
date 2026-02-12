const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['cgi-worker.mjs'],
  outfile: 'dist/cgi-worker.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2022'],
  external: ['events', 'worker_threads'],
  // Prefer browser-friendly fields when resolving package entries
  mainFields: ['browser', 'module', 'main'],
  conditions: ['browser', 'import', 'default'],
  loader: {
    '.wasm': 'file',
    '.so':   'file'
  },
  sourcemap: false,
  legalComments: 'none',
  define: { 'process.env.NODE_ENV': '"production"' },
});
console.log('Bundled Service Worker → dist/cgi-worker.js');
