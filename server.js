const http = require('http');
const fs = require('fs');
const path = require('path');

const defaultPort = Number(process.env.PORT) || 4173;
const root = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function createServer() {
  return http.createServer((req, res) => {
    const urlPath = req.url === '/' ? '/index.html' : req.url;
    const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(root, safePath);

    if (!filePath.startsWith(root)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const type = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type });
      res.end(data);
    });
  });
}

function startServer(preferredPort) {
  const server = createServer();
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = preferredPort + 1;
      console.warn(`Port ${preferredPort} is in use. Trying ${fallbackPort}...`);
      startServer(fallbackPort);
      return;
    }
    console.error('Server failed to start:', err.message);
    process.exit(1);
  });

  server.listen(preferredPort, () => {
    console.log(`Sales Sheet Builder running at http://localhost:${preferredPort}`);
  });
}

startServer(defaultPort);
