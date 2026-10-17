// 3logy · outils partagés par les trois pages : dates, hasard du jour, appels d'API, cache

// ---------- Dates ----------

/** « 2026-10-17 » pour la date locale du jour. */
export function dateKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Numéro du jour depuis le 1er janvier 1970 : la même valeur pour tout le monde à une date donnée. */
export function dayNumber(date = new Date()) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

/** « vendredi 17 octobre » */
export function longDate(date = new Date()) {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Temps restant avant minuit, « 4 h 12 min ». */
export function untilMidnight(now = new Date()) {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const minutes = Math.ceil((next - now) / 60000);
  const h = Math.floor(minutes / 60);
  return h ? `${h} h ${String(minutes % 60).padStart(2, '0')} min` : `${minutes} min`;
}

// ---------- Hasard du jour ----------

/** Nombre entier tiré d'un texte (hachage FNV-1a). */
function hash(text) {
  let h = 2166136261;
  for (const char of text) {
    h ^= char.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Générateur pseudo-aléatoire initialisé par la date et un « sel » : tout le monde
 * obtient la même suite de nombres le même jour (mulberry32).
 */
export function dailyRandom(salt, date = new Date()) {
  let seed = hash(`${dateKey(date)}:${salt}`);
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Élément du jour dans une liste. */
export function pickDaily(list, salt, date = new Date()) {
  return list[Math.floor(dailyRandom(salt, date)() * list.length)];
}

/** Copie mélangée d'une liste, dans le même ordre pour tout le monde ce jour-là. */
export function shuffleDaily(list, salt, date = new Date()) {
  const random = dailyRandom(salt, date);
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ---------- Thème du défi ----------

export const THEMES = {
  dev: { key: 'dev', label: 'Dev', emoji: '💻', title: 'Que va afficher ce code ?' },
  jeu: { key: 'jeu', label: 'Jeu vidéo', emoji: '🎮', title: 'Quel est ce jeu ?' },
  cine: { key: 'cine', label: 'Ciné', emoji: '🎬', title: 'Quel est ce film ?' },
};

/** Le défi alterne entre les trois thèmes, un par jour. */
export function themeOfDay(date = new Date()) {
  return Object.values(THEMES)[dayNumber(date) % 3];
}

// ---------- Appels d'API ----------

/**
 * RAWG et TMDB passent par les fonctions Netlify (/api/rawg, /api/tmdb), qui ajoutent
 * les clés côté serveur : elles n'apparaissent jamais dans le navigateur.
 */
export async function api(service, path, params = {}, { signal } = {}) {
  const query = new URLSearchParams({ path, ...params });
  const response = await fetch(`/api/${service}?${query}`, { signal });
  if (response.ok) {
    return response.json();
  }

  const body = await response.json().catch(() => ({}));
  const error = new Error(`${service} : ${response.status}`);
  // Clé absente, ou site servi sans les fonctions Netlify (404) : c'est le mode démo.
  // Toute autre erreur vient de l'API elle-même (panne, quota…).
  error.missingKey = body.reason === 'missing_key' || response.status === 404;
  return Promise.reject(error);
}

export async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`${url} : ${response.status}`);
  }
  return response.json();
}

// ---------- Cache du jour ----------

const CACHE_PREFIX = '3logy:cache:';

/**
 * Garde le résultat d'une requête jusqu'à minuit : les trois pages partagent les mêmes
 * données et les API ne sont appelées qu'une fois par jour.
 */
export async function cachedDaily(name, load) {
  const key = `${CACHE_PREFIX}${dateKey()}:${name}`;
  const stored = storage.get(key);
  if (stored !== null) {
    return stored;
  }

  const value = await load();
  storage.set(key, value);
  return value;
}

/** Supprime le cache des jours précédents. */
function pruneCache() {
  const today = `${CACHE_PREFIX}${dateKey()}:`;
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(CACHE_PREFIX) && !key.startsWith(today))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // stockage indisponible (navigation privée…) : rien à nettoyer
  }
}

/** localStorage sans erreur : navigation privée ou stockage plein ne cassent pas la page. */
export const storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : JSON.parse(raw);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // tant pis : la valeur ne sera simplement pas gardée
    }
  },
};

pruneCache();

// ---------- Affichage ----------

/** Échappe un texte avant de l'insérer dans le HTML. */
export function esc(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/** Texte comparable : minuscules, sans accents (« Élden » → « elden »). */
export function normalize(text) {
  return String(text ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/** Coupe un texte trop long à la fin d'un mot. */
export function truncate(text, max) {
  if (!text || text.length <= max) {
    return text ?? '';
  }
  return `${text.slice(0, text.lastIndexOf(' ', max)).replace(/[,.;:]$/, '')}…`;
}

/**
 * Bandeau affiché quand les exemples remplacent les données en ligne :
 * « Mode démo » si les clés d'API ne sont pas configurées, sinon l'API n'a pas répondu.
 */
export function showDemoNotice(reason) {
  const notice = document.querySelector('[data-demo-notice]');
  if (!notice || !reason) {
    return;
  }
  // Une clé manquante l'emporte sur une panne passagère
  if (notice.hidden || reason === 'missing') {
    notice.innerHTML = reason === 'missing'
      ? '<strong>Mode démo :</strong> les clés des API jeux et films ne sont pas configurées, des exemples sont affichés à la place.'
      : '<strong>Données indisponibles :</strong> RAWG ou TMDB ne répond pas pour le moment, des exemples sont affichés à la place.';
  }
  notice.hidden = false;
}

/** Année en cours dans le pied de page, lien actif dans la navigation. */
export function initLayout() {
  const page = document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.dataset.nav === page) {
      link.setAttribute('aria-current', 'page');
    }
  });
}
