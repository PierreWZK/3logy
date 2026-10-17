// Serveur pour héberger 3logy hors de Netlify (VPS avec Coolify) : sert le site statique
// et branche les deux fonctions de netlify/functions/ sur /api/rawg et /api/tmdb.
// Aucune dépendance : node server.mjs (Node 20 ou plus). Port : variable PORT, 3000 par défaut.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import rawg from './netlify/functions/rawg.mjs';
import tmdb from './netlify/functions/tmdb.mjs';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const API = { '/api/rawg': rawg, '/api/tmdb': tmdb };

// Seuls les fichiers du site sont servis (jamais .env, netlify/, server.mjs…)
const PUBLIC = /^\/(?:[\w-]+\.html|(?:css|js|docs)\/[\w.-]+)$/;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

  try {
    const handler = API[url.pathname];
    if (handler) {
      const response = await handler(new Request(url, { method: req.method }));
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }

    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    if (!PUBLIC.test(pathname) || !TYPES[extname(pathname)]) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Page introuvable');
      return;
    }

    const body = await readFile(join(ROOT, normalize(pathname)));
    res.writeHead(200, { 'Content-Type': TYPES[extname(pathname)] });
    res.end(body);
  } catch (error) {
    const notFound = error.code === 'ENOENT';
    if (!notFound) console.error(error);
    res.writeHead(notFound ? 404 : 502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(notFound ? 'Page introuvable' : 'Erreur du serveur');
  }
});

server.listen(PORT, () => console.log(`3logy sur http://localhost:${PORT}`));
