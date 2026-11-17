// serve.ts — a tiny static server for local play-testing (Node 22, standard
// library only). Serves game/ at the root and the screenshots at /shots/.
// Run `node serve.ts`, then open http://localhost:8080 in a desktop browser.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 8080);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function serve(root, req, res) {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const path = normalize(join(root, url === '/' ? 'index.html' : url));
  if (!path.startsWith(root) || !existsSync(path) || !statSync(path).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found: ' + url);
    return true;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
  res.end(readFileSync(path));
  return true;
}

createServer((req, res) => {
  if (req.url.startsWith('/shots/')) {
    const rest = req.url.slice('/shots/'.length).split('?')[0];
    const path = normalize(join(here, 'screenshots', rest));
    if (path.startsWith(join(here, 'screenshots')) && existsSync(path) && statSync(path).isFile()) {
      res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
      res.end(readFileSync(path));
      return;
    }
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  serve(join(here, 'game'), req, res);
}).listen(port, () => {
  console.log('NOVA DRIFT at http://localhost:' + port);
});
