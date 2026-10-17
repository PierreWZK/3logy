// Relais vers l'API RAWG : la clé reste côté serveur (variable d'environnement RAWG_KEY).
// Appel : /api/rawg?path=games&page=2  →  https://api.rawg.io/api/games?page=2&key=…

// Seules les routes utilisées par le site sont autorisées
const ALLOWED = /^games(\/\d+)?$/;

export default async (request) => {
  const key = process.env.RAWG_KEY;
  if (!key) {
    return Response.json({ error: 'RAWG_KEY manquante' }, { status: 503 });
  }

  const params = new URL(request.url).searchParams;
  const path = params.get('path') ?? '';
  if (!ALLOWED.test(path)) {
    return Response.json({ error: 'Route non autorisée' }, { status: 400 });
  }

  params.delete('path');
  params.set('key', key);

  const response = await fetch(`https://api.rawg.io/api/${path}?${params}`);

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Le contenu change une fois par jour : le CDN Netlify peut le garder une heure
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

export const config = { path: '/api/rawg' };
