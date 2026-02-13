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

const AdmZip = require("adm-zip");
const archive = new AdmZip();
archive.addLocalFolder('app');
archive.writeZip('sw/app.zip');
console.log('Bundled symfony app to sw/app.zip');
