const { PHP, loadPHPRuntime } = require('./node_modules/@php-wasm/universal/index.js');
const { getPHPLoaderModule } = require('./node_modules/@php-wasm/web-8-4/index.js');

let php;

// --- Boot the PHP runtime once ---
self.addEventListener('install', (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });

async function bootPhp() {
  if (php) return php;
  if (!getPHPLoaderModule || !loadPHPRuntime || !PHP) {
    throw new Error('Failed to import @php-wasm modules.');
  }
  const loaderModule = await getPHPLoaderModule();
  const runtimeId = await loadPHPRuntime(loaderModule);
  php = new PHP(runtimeId);

  await php.mkdir('/app');

  const response = await fetch('app.zip');
  const app = await response.arrayBuffer();
  await php.writeFile('/app/app.zip', new Uint8Array(app));

  await php.runStream({
    code: `<?php
      $zip = new ZipArchive();
      if ($zip->open('/app/app.zip', ZipArchive::RDONLY) === TRUE) {
        $zip->extractTo('/app');
        $zip->close();
      }
      `
  })

  return php;
}

// --- Helpers ---
const RESERVED_PREFIXES = new Set([
  '/vendor', '/php-wasm', '/cgi-worker.js', '/favicon.ico', '/robots.txt'
]);

function isStaticAsset(pathname) {
  // Treat any last-segment containing a dot as a static file: /img/logo.svg, /app.js, /styles/site.css
  const seg = pathname.split('/').pop() || '';
  return seg.includes('.');
}



// --- Fetch handler with rewrites ---
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Allow the raw-source bypass
  if (url.searchParams.has('__src')) {
    return;
  }

  // Ignore our own runtime assets and obvious non-app paths
  for (const prefix of RESERVED_PREFIXES) {
    if (url.pathname === prefix || url.pathname.startsWith(prefix + '/')) {
      return; // let default network fetch handle it
    }
  }

  // 1) Direct PHP file under /app → run as-is (no rewrite)
  const isDirectPhp = url.pathname.startsWith('/app/') && url.pathname.endsWith('.php');

  // 2) Static assets (any dot in last segment) → pass through
  if (!isDirectPhp && isStaticAsset(url.pathname)) {
    return; // don't intercept; let network serve the file
  }

  event.respondWith((async () => {
    try {
      const php = await bootPhp();
      const run = await php.runStream({
        code: `<?php
          $_SERVER['REQUEST_URI'] = '${url.pathname.replace('/app', '')}';
          $_SERVER['SCRIPT_FILENAME'] = '/app/public/index.php';
          require_once('/app/public/index.php');
        `
      });
      return new Response(await run.stdoutText, { status: 200, headers: await run.headers });
    } catch (err) {
      return new Response('PHP runtime error: ' + err, { status: 500, headers: { 'Content-Type': 'text/plain' } });
    }
  })());
});
