const http = require('http');
const fs = require('fs');
const mime = require('mime-types');

const server = http.createServer((req, res) => {
  const path = (new URL(req.url, `http://${req.headers.host}/`)).pathname;
  res.setHeader('Content-Type', 'text/html');
//  res.setHeader('Service-Worker-Allowed', '/');
  const contentType = mime.lookup(req.url);
  if (contentType) {
    res.setHeader('Content-Type', contentType);
  }

  fs.readFile(path === '/' ? 'index.html' : path.slice(1), (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('404 Not Found');
    } else {
      res.writeHead(200);
      res.end(content);
    }
  });

});

server.listen(8080, () => {
  console.log('Server running at http://localhost:8080/');
});