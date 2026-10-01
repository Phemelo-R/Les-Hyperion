import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const release = '2026-09-29-r3';
const port = Number(process.env.PORT || 4186);
const address = `http://127.0.0.1:${port}/carbon.html?release=${release}`;
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT must be a whole number between 1 and 65535.');
  process.exit(1);
}
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ipynb': 'application/x-ipynb+json',
  '.pdf': 'application/pdf',
};
const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400);
    response.end();
    return;
  }
  if (pathname === '/__les_hyperion_release') {
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });
    response.end(JSON.stringify({ release }));
    return;
  }
  const filename = path.resolve(
    root,
    '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''),
  );
  if (!filename.startsWith(root + path.sep)) {
    response.writeHead(403);
    response.end();
    return;
  }
  fs.stat(filename, (error, stat) => {
    if (error || !stat.isFile()) {
      response.writeHead(404);
      response.end('Page not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type':
        mime[path.extname(filename).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(filename).pipe(response);
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${port} is already in use. Stop the previous preview with Ctrl+C in its terminal, then start this one again.`,
    );
    console.error('No existing server or browser tab has been changed.');
  } else {
    console.error(error.message);
  }
  process.exitCode = 1;
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Les Hyperion — Carbon R3 (${release})`);
  console.log(`Serving this folder: ${root}`);
  console.log(`Open: ${address}`);
  console.log('Keep this terminal open. Press Ctrl+C to stop the preview.');

  if (process.argv.includes('--open')) {
    const opener =
      process.platform === 'darwin'
        ? ['open', [address]]
        : process.platform === 'win32'
          ? ['rundll32.exe', ['url.dll,FileProtocolHandler', address]]
          : ['xdg-open', [address]];
    const browser = spawn(opener[0], opener[1], {
      detached: true,
      stdio: 'ignore',
    });
    browser.on('error', () =>
      console.log(`Open this address in your browser: ${address}`),
    );
    browser.unref();
  }
});
