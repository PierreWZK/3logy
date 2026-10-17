// Relais vers l'API TMDB : le jeton reste côté serveur (variable d'environnement TMDB_TOKEN,
// le « jeton d'accès en lecture » de l'API v4, envoyé en en-tête Authorization).
// Appel : /api/tmdb?path=discover/movie&page=2  →  https://api.themoviedb.org/3/discover/movie?page=2

// Seules les routes utilisées par le site sont autorisées
const ALLOWED = /^(discover\/movie|movie\/\d+)$/;

export default async (request) => {
  const token = process.env.TMDB_TOKEN;
  if (!token) {
    return Response.json({ error: 'TMDB_TOKEN manquant' }, { status: 503 });
  }

  const params = new URL(request.url).searchParams;
  const path = params.get('path') ?? '';
  if (!ALLOWED.test(path)) {
    return Response.json({ error: 'Route non autorisée' }, { status: 400 });
  }

  params.delete('path');

  const response = await fetch(`https://api.themoviedb.org/3/${path}?${params}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

export const config = { path: '/api/tmdb' };
