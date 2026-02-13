const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['cgi-worker.mjs'],
  outfile: 'sw/cgi-worker.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['esnext'],
  external: ['events', 'worker_threads'],
  loader: {
    '.wasm': 'file',
    '.so':   'file'
  },
  minify: true,
});
console.log('Bundled service worker to sw/cgi-worker.js');
