// Trilogie · récupération des contenus du jour, avec repli sur les données de démo

import { api, cachedDaily, dateKey, dayNumber, fetchJson, pickDaily, shuffleDaily, truncate } from './common.js';
import { DEMO_GAMES, DEMO_MOVIES, DEV_TIPS } from './data.js';

// ---------- Jeux (RAWG) ----------

/** Image RAWG redimensionnée par leur CDN : bien plus légère que l'original. */
const rawgImage = (url, width = 640) => url?.replace('/media/', `/media/resize/${width}/-/`) ?? null;

function normalizeGame(g) {
  return {
    id: g.id,
    name: g.name,
    slug: g.slug,
    year: g.released ? Number(g.released.slice(0, 4)) : null,
    image: rawgImage(g.background_image, 1280),
    thumb: rawgImage(g.background_image, 420),
    genres: (g.genres ?? []).map((genre) => genre.name),
    platforms: (g.parent_platforms ?? []).map((p) => p.platform.name),
    metacritic: g.metacritic ?? null,
    playtime: g.playtime || null,
    screenshots: (g.short_screenshots ?? []).slice(1, 5).map((s) => rawgImage(s.image, 640)),
    url: `https://rawg.io/games/${g.slug}`,
  };
}

/**
 * Une page de 40 jeux bien notés, différente chaque jour (5 pages en rotation).
 * Sert au jeu du jour et aux réponses du défi.
 */
export async function gamePool() {
  try {
    return await cachedDaily('rawg-pool', async () => {
      const data = await api('rawg', 'games', {
        metacritic: '80,100',
        ordering: '-added',
        page_size: 40,
        page: 1 + (dayNumber() % 5),
      });
      return { demo: false, games: data.results.filter((g) => g.background_image).map(normalizeGame) };
    });
  } catch {
    return { demo: true, games: DEMO_GAMES };
  }
}

/** Le jeu du jour, avec sa description et son studio (appel de détail RAWG). */
export async function gameOfDay() {
  const pool = await gamePool();
  const game = pickDaily(pool.games, 'jeu');
  if (pool.demo) {
    return { demo: true, game };
  }

  try {
    const details = await cachedDaily(`rawg-game-${game.id}`, () => api('rawg', `games/${game.id}`));
    return {
      demo: false,
      game: {
        ...game,
        description: truncate(details.description_raw, 420),
        developer: details.developers?.map((d) => d.name).join(', ') || null,
        website: details.website || null,
      },
    };
  } catch {
    return { demo: false, game };
  }
}

// ---------- Films (TMDB) ----------

const TMDB_IMAGE = 'https://image.tmdb.org/t/p';

/** Genres TMDB (identifiants stables), en français. */
const MOVIE_GENRES = {
  28: 'Action', 12: 'Aventure', 16: 'Animation', 35: 'Comédie', 80: 'Crime', 99: 'Documentaire',
  18: 'Drame', 10751: 'Familial', 14: 'Fantastique', 36: 'Histoire', 27: 'Horreur', 10402: 'Musique',
  9648: 'Mystère', 10749: 'Romance', 878: 'Science-Fiction', 10770: 'Téléfilm', 53: 'Thriller',
  10752: 'Guerre', 37: 'Western',
};

function normalizeMovie(m) {
  return {
    id: m.id,
    title: m.title,
    originalTitle: m.original_title !== m.title ? m.original_title : null,
    year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
    poster: m.poster_path ? `${TMDB_IMAGE}/w500${m.poster_path}` : null,
    backdrop: m.backdrop_path ? `${TMDB_IMAGE}/w1280${m.backdrop_path}` : null,
    genres: (m.genre_ids ?? m.genres?.map((g) => g.id) ?? []).map((id) => MOVIE_GENRES[id]).filter(Boolean),
    vote: m.vote_average ? Math.round(m.vote_average * 10) / 10 : null,
    overview: m.overview,
    url: `https://www.themoviedb.org/movie/${m.id}`,
  };
}

/** Une page de 20 films très vus, différente chaque jour (10 pages en rotation). */
export async function moviePool() {
  try {
    return await cachedDaily('tmdb-pool', async () => {
      const data = await api('tmdb', 'discover/movie', {
        language: 'fr-FR',
        sort_by: 'vote_count.desc',
        'vote_count.gte': 3000,
        include_adult: false,
        page: 1 + (dayNumber() % 10),
      });
      return { demo: false, movies: data.results.filter((m) => m.poster_path && m.overview).map(normalizeMovie) };
    });
  } catch {
    return { demo: true, movies: DEMO_MOVIES };
  }
}

/** Le film du jour, avec réalisateur, casting, durée et bande-annonce. */
export async function movieOfDay() {
  const pool = await moviePool();
  const movie = pickDaily(pool.movies, 'cine');
  if (pool.demo) {
    return { demo: true, movie };
  }

  try {
    const details = await cachedDaily(`tmdb-movie-${movie.id}`, () => api('tmdb', `movie/${movie.id}`, {
      language: 'fr-FR',
      append_to_response: 'credits,videos',
      include_video_language: 'fr,en',
    }));
    const trailer = details.videos?.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer');
    return {
      demo: false,
      movie: {
        ...movie,
        runtime: details.runtime || null,
        tagline: details.tagline || null,
        director: details.credits?.crew?.filter((p) => p.job === 'Director').map((p) => p.name).join(', ') || null,
        cast: details.credits?.cast?.slice(0, 4).map((p) => p.name) ?? [],
        trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      },
    };
  } catch {
    return { demo: false, movie };
  }
}

// ---------- Dev Daily ----------

/** L'astuce du jour : locale, pas d'appel réseau. */
export function tipOfDay() {
  return pickDaily(DEV_TIPS, 'astuce');
}

/** Les articles les plus appréciés de DEV.to ces derniers jours. */
async function devToArticles() {
  return cachedDaily('devto', async () => {
    const articles = await fetchJson('https://dev.to/api/articles?top=2&per_page=4');
    return articles.map((a) => ({
      title: a.title,
      url: a.url,
      meta: `${a.user?.name ?? 'DEV'} · ${a.reading_time_minutes} min · ♥ ${a.positive_reactions_count}`,
    }));
  });
}

/** La une de Hacker News. */
async function hackerNews() {
  return cachedDaily('hn', async () => {
    const data = await fetchJson('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=4');
    return data.hits.map((h) => ({
      title: h.title,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      discussion: `https://news.ycombinator.com/item?id=${h.objectID}`,
      meta: `${h.points} points · ${h.num_comments ?? 0} commentaires`,
    }));
  });
}

/** Les dépôts GitHub créés cette semaine qui gagnent le plus d'étoiles. */
async function risingRepos() {
  return cachedDaily('github', async () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const query = encodeURIComponent(`created:>${dateKey(weekAgo)}`);
    const data = await fetchJson(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=4`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    return data.items.map((r) => ({
      name: r.full_name,
      url: r.html_url,
      description: truncate(r.description, 110),
      language: r.language,
      stars: r.stargazers_count,
    }));
  });
}

/** Tout Dev Daily : chaque source peut échouer sans bloquer les autres. */
export async function devDaily() {
  const [articles, news, repos] = await Promise.allSettled([devToArticles(), hackerNews(), risingRepos()]);
  const value = (result) => (result.status === 'fulfilled' ? result.value : null);

  return {
    tip: tipOfDay(),
    articles: value(articles),
    news: value(news),
    repos: value(repos),
  };
}

/** Quelques éléments du jour mélangés (réponses du défi). */
export function dailyChoices(list, salt, count) {
  return shuffleDaily(list, salt).slice(0, count);
}
