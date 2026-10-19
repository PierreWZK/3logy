// 3logy · récupération des contenus du jour, avec repli sur les données de démo

import { api, cachedDaily, dateKey, dayNumber, fetchJson, normalize, pickDaily, truncate } from './common.js';
import { DEMO_GAMES, DEMO_MOVIES, DEV_TIPS } from './data.js';

/**
 * Pourquoi les données de démo remplacent l'API : « missing » (clé absente) ou « error ».
 * `demo` vaut false quand les données en ligne sont bien là.
 */
const demoReason = (error) => (error.missingKey ? 'missing' : 'error');

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
    added: g.added ?? 0, // nombre de joueurs qui l'ont dans leur bibliothèque RAWG : sa popularité
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
  } catch (error) {
    return { demo: demoReason(error), games: DEMO_GAMES };
  }
}

/** Le jeu du jour, avec sa description et son studio (appel de détail RAWG). */
export async function gameOfDay() {
  const pool = await gamePool();
  const game = pickDaily(pool.games, 'jeu');
  if (pool.demo) {
    return { demo: pool.demo, game };
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
  } catch (error) {
    return { demo: demoReason(error), movies: DEMO_MOVIES };
  }
}

/** Le film du jour, avec réalisateur, casting, durée et bande-annonce. */
export async function movieOfDay() {
  const pool = await moviePool();
  const movie = pickDaily(pool.movies, 'cine');
  if (pool.demo) {
    return { demo: pool.demo, movie };
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

// ---------- Recherche ----------

/** Tous les mots de la recherche sont présents dans au moins un des textes. */
function matches(query, texts) {
  const haystack = normalize(texts.filter(Boolean).join(' '));
  return normalize(query).split(/\s+/).filter(Boolean).every((word) => haystack.includes(word));
}

/**
 * Jeux (RAWG). En mode démo, la recherche se fait dans les jeux d'exemple.
 * Renvoie { demo, items }.
 */
export async function searchGames(query, signal) {
  try {
    // La pertinence de RAWG remonte beaucoup de jeux amateurs, le tri par popularité ignore
    // une partie des mots : on combine les deux listes.
    const params = { search: query, search_precise: true, page_size: 20 };
    const [relevant, popular] = await Promise.all([
      api('rawg', 'games', params, { signal }),
      api('rawg', 'games', { ...params, ordering: '-added' }, { signal }),
    ]);

    const games = new Map();
    [...relevant.results, ...popular.results]
      .filter((g) => g.background_image)
      .forEach((g) => games.set(g.id, normalizeGame(g)));

    // D'abord les jeux dont le nom contient tous les mots cherchés, puis les plus populaires
    const items = [...games.values()]
      .map((game) => ({ game, exact: matches(query, [game.name]) }))
      .sort((a, b) => b.exact - a.exact || b.game.added - a.game.added)
      .map(({ game }) => game)
      .slice(0, 8);

    return { demo: false, items };
  } catch (error) {
    if (!error.missingKey) throw error;
    return { demo: 'missing', items: DEMO_GAMES.filter((g) => matches(query, [g.name, g.developer, ...g.genres])) };
  }
}

/** Films (TMDB), fiches en français. */
export async function searchMovies(query, signal) {
  try {
    const data = await api('tmdb', 'search/movie', { query, language: 'fr-FR', include_adult: false }, { signal });
    return { demo: false, items: data.results.slice(0, 8).map(normalizeMovie) };
  } catch (error) {
    if (!error.missingKey) throw error;
    return { demo: 'missing', items: DEMO_MOVIES.filter((m) => matches(query, [m.title, m.director, ...m.genres, ...m.cast])) };
  }
}

/**
 * Articles : recherche plein texte dans Hacker News, et articles DEV.to du tag
 * correspondant quand la recherche tient en un mot (« react », « css »…).
 */
export async function searchArticles(query, signal) {
  const hn = fetchJson(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=6`, { signal })
    .then((data) => data.hits.filter((h) => h.title).map((h) => ({
      source: 'Hacker News',
      title: h.title,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      meta: `${h.points} points · ${new Date(h.created_at).getFullYear()}`,
    })));

  const tag = normalize(query).replace(/[^a-z0-9]/g, '');
  const devto = /^\S+$/.test(query.trim()) && tag
    ? fetchJson(`https://dev.to/api/articles?tag=${tag}&top=365&per_page=6`, { signal })
      .then((articles) => articles.map((a) => ({
        source: 'DEV.to',
        title: a.title,
        url: a.url,
        meta: `${a.user?.name ?? 'DEV'} · ${a.reading_time_minutes} min · ♥ ${a.positive_reactions_count}`,
      })))
    : Promise.resolve([]);

  const [devResults, hnResults] = await Promise.allSettled([devto, hn]);
  if (devResults.status === 'rejected' && hnResults.status === 'rejected') {
    throw hnResults.reason;
  }
  return [devResults, hnResults].flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}

/** Astuces dev : recherche locale, instantanée. */
export function searchTips(query) {
  return DEV_TIPS.filter((tip) => matches(query, [tip.topic, tip.title, tip.text, tip.code]));
}
