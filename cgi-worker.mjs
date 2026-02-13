const { PHP, loadPHPRuntime } = require('./node_modules/@php-wasm/universal/index.js');
const { getPHPLoaderModule } = require('./node_modules/@php-wasm/web-8-4/index.js');

/**
 * A cached copy of the PHP runtime.
 */
let runtime = null;

/**
 * Gets a PHP runtime with the symfony application installed within it.
 *
 * @returns {PHP}
 */
async function getRuntime() {

  // The Symfony application to install is roughly 3mb compressed, so this
  // setup is a fairly hefty operation when we're looking to achieve minimal
  // latency for updating stories.  The runtime is cached for the current
  // navigation and should be recycled across various AJAX requests to the
  // server for re-rendering stories.
  if (!runtime) {

    runtime = new PHP(await loadPHPRuntime(await getPHPLoaderModule()));

    // The Symfony application is going to live at /app within the runtime.
    await runtime.mkdir('/app');

    // Fetch the archive from the static file at the static site root.
    const response = await fetch('app.zip');

    // Write the archive into the runtime under /app.
    await runtime.writeFile(
      '/app/app.zip',
      new Uint8Array(await response.arrayBuffer())
    );

    // Extract the archive into /app.
    await runtime.runStream({
      code: `<?php
        $zip = new ZipArchive();
        if ($zip->open('/app/app.zip', ZipArchive::RDONLY) === TRUE) {
          $zip->extractTo('/app');
          $zip->close();
        }`
    })
  }

  return runtime;
}

// Immediately activate this service worker.
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Immediately claim as to not require a page refresh.
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Finally, respond to all fetch events in scope.
self.addEventListener('fetch', event => {

  const url = new URL(event.request.url);

  // This service worker has to be broadly scoped in order to deal with the
  // nature of Storybook's iframe.  As such, given this intercepts all requests
  // to the entire application, it becomes necessary to take the ones we
  // actually care about handling.  This might be a little fragile, but in all
  // honestly, it's probably okay given the VERY limited scope of the worker.
  if (!url.pathname.includes('/app/')) {
    return;
  }

  // Enter the world's dumbest CGI.  As far as Symfony is concerned, its root
  // is located at /app, so the for the REQUEST_URI, we'll strip the leading
  // content all the way up to, and including, /app.
  //
  // For example, the full pathname from the browser's perspective could be
  // something like "/storybook-twig-bridge/app/twig/heading", but the part
  // that matters to the Symfony routing is only "/twig/heading".
  const request_uri = url.pathname.replace(/^.*\/app/, '');

  // Query strings are a direct pass-through.
  const query_string = url.search;

  // The PHP runtime has the Symfony application copied to the /app directory,
  // so the Symfony front controller is always relative to that.
  const script_filename = '/app/public/index.php';

  // Finally respond to the event by feeding the request to the underlying
  // Symfony application.  The request to the underlying application should
  // always return a text/HTML response.
  event.respondWith((async () => {
      const runtime = await getRuntime();
      const response = await runtime.runStream({
        code: `<?php
          // Manually populate minimum required super-globals.
          $_SERVER['REQUEST_URI'] = '${request_uri}';
          $_SERVER['QUERY_STRING'] = '${query_string}';
          $_SERVER['SCRIPT_FILENAME'] = '${script_filename}';

          // Extract $_SERVER['QUERY_STRING'] into $_GET.
          if (empty($_GET) && !empty($_SERVER['QUERY_STRING'])) {
            parse_str($_SERVER['QUERY_STRING'], $_GET);
          }

          // Pass things off to the Symfony front controller.
          require_once('/app/public/index.php');`
      });
      return new Response(await response.stdoutText, {
        status: await response.httpStatusCode,
        headers: await response.headers,
      });
  })());
});
