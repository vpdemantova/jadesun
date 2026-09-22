import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, resolve } from 'node:path';

const pasta = resolve(process.argv[2] || 'exportado/publico');
const porta = Number(process.argv[3] || 5000);

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
};

http.createServer(async (req, res) => {
  try {
    let caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (caminho.endsWith('/')) caminho += 'index.html';
    const arquivo = normalize(join(pasta, caminho));
    if (!arquivo.startsWith(pasta)) { res.writeHead(403); return res.end('Proibido'); }
    const info = await stat(arquivo);
    if (!info.isFile()) throw new Error('nao');
    const dados = await readFile(arquivo);
    res.writeHead(200, { 'Content-Type': TIPOS[extname(arquivo).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(dados);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Não encontrado.');
  }
}).listen(porta, '127.0.0.1', () => console.log(`Prévia de ${pasta}\nAbra http://127.0.0.1:${porta}/  (Ctrl+C para parar)`));
