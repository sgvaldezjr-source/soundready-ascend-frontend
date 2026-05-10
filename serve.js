import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT) || 4173;
const DIST = join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

createServer((req, res) => {
  let filePath = join(DIST, req.url === '/' ? 'index.html' : req.url);
  filePath = filePath.split('?')[0];
  if (!existsSync(filePath) || !extname(filePath)) {
    filePath = join(DIST, 'index.html');
  }
  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 
      'Content-Type': MIME[ext] || 'text/plain',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'max-age=31536000'
    });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`SoundReady Ascend running on port ${PORT}`);
});
