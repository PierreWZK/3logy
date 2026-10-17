// 3logy · recherche de jeux, films, articles et astuces dev

import { esc, initLayout, truncate } from './common.js';
import { searchArticles, searchGames, searchMovies, searchTips } from './sources.js';

initLayout();

const $ = (id) => document.getElementById(id);
const input = $('search-input');

/** Les quatre catégories, dans l'ordre d'affichage. */
const CATEGORIES = [
  { key: 'games', label: 'Jeux', emoji: '🎮', theme: 'jeu', search: searchGames },
  { key: 'movies', label: 'Films', emoji: '🎬', theme: 'cine', search: searchMovies },
  { key: 'articles', label: 'Articles', emoji: '📰', theme: 'dev', search: searchArticles },
  { key: 'tips', label: 'Astuces', emoji: '💡', theme: 'dev', search: searchTips },
];

const SUGGESTIONS = ['Zelda', 'Christopher Nolan', 'Hollow Knight', 'Miyazaki', 'CSS grid', 'git', 'JavaScript', 'Star Wars'];

/** En vue « Tout », chaque catégorie montre ses premiers résultats. */
const PREVIEW_COUNT = 4;
const MIN_LENGTH = 2;

let filter = 'all';
let query = '';
let controller = null;
let timer = null;
/** État de chaque catégorie : { status: 'loading' | 'done' | 'error', items, demo } */
let results = {};

const initials = (text) => text.split(/\s+/).filter((w) => /^[\p{L}\d]/u.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const thumb = (src, alt, fallbackText) => (src
  ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`
  : `<div class="placeholder">${esc(initials(fallbackText))}</div>`);

// ---------- Rendu des résultats ----------

const renderers = {
  games: (g) => `
    <a class="result-card" href="${esc(g.url ?? '#')}" target="_blank" rel="noopener">
      <div class="result-thumb">${thumb(g.thumb, g.name, g.name)}</div>
      <div class="result-body">
        <strong>${esc(g.name)}</strong>
        <small>${[g.year, g.genres.slice(0, 2).join(', ')].filter(Boolean).map(esc).join(' · ')}</small>
        ${g.metacritic ? `<span class="score">${g.metacritic}</span>` : ''}
      </div>
    </a>`,

  movies: (m) => `
    <a class="result-card is-poster" href="${esc(m.url ?? '#')}" target="_blank" rel="noopener">
      <div class="result-thumb">${thumb(m.poster, `Affiche de ${m.title}`, m.title)}</div>
      <div class="result-body">
        <strong>${esc(m.title)}</strong>
        <small>${[m.year, m.genres.slice(0, 2).join(', ')].filter(Boolean).map(esc).join(' · ')}</small>
        ${m.overview ? `<p>${esc(truncate(m.overview, 120))}</p>` : ''}
        ${m.vote ? `<span class="score">★ ${m.vote}</span>` : ''}
      </div>
    </a>`,

  articles: (a) => `
    <li><a href="${esc(a.url)}" target="_blank" rel="noopener">
      <strong>${esc(a.title)}</strong>
      <small>${esc(a.source)} · ${esc(a.meta)}</small>
    </a></li>`,

  tips: (t) => `
    <article class="panel">
      <div class="panel-body">
        <p class="panel-title">${esc(t.topic)}</p>
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.text)}</p>
        <pre class="code"><code>${esc(t.code)}</code></pre>
      </div>
    </article>`,
};

/** Conteneur de chaque catégorie : grille de cartes, liste de liens ou panneaux. */
function wrap(key, html) {
  if (key === 'articles') return `<div class="panel"><div class="panel-body"><ul class="links">${html}</ul></div></div>`;
  if (key === 'tips') return `<div class="tip-grid">${html}</div>`;
  return `<div class="result-grid">${html}</div>`;
}

function renderSection(category) {
  const state = results[category.key];
  const visible = filter === 'all' || filter === category.key;
  if (!state || !visible) return '';

  let body;
  if (state.status === 'loading') {
    body = '<div class="skeleton" style="height: 120px"></div>';
  } else if (state.status === 'error') {
    body = '<p class="unavailable">Cette source n\'a pas répondu, réessayez dans un instant.</p>';
  } else if (!state.items.length) {
    // En vue « Tout », une catégorie vide n'encombre pas la page
    if (filter === 'all') return '';
    body = '<p class="unavailable">Aucun résultat.</p>';
  } else {
    const items = filter === 'all' ? state.items.slice(0, PREVIEW_COUNT) : state.items;
    body = wrap(category.key, items.map(renderers[category.key]).join(''));
    if (filter === 'all' && state.items.length > PREVIEW_COUNT) {
      body += `<button type="button" class="btn see-all" data-filter="${category.key}">Voir les ${state.items.length} ${category.label.toLowerCase()} →</button>`;
    }
  }

  const demoNote = state.demo ? '<span class="badge">Exemples (mode démo)</span>' : '';
  const count = state.status === 'done' ? `<span class="count">${state.items.length}</span>` : '';

  return `
    <section class="search-section theme-${category.theme}">
      <h2>${category.emoji} ${category.label} ${count} ${demoNote}</h2>
      ${body}
    </section>`;
}

function render() {
  const searching = query.length >= MIN_LENGTH;
  $('suggestions').hidden = searching;
  $('filters').hidden = !searching;

  // Filtres, avec le nombre de résultats de chaque catégorie
  const total = CATEGORIES.reduce((sum, c) => sum + (results[c.key]?.items?.length ?? 0), 0);
  $('filters').innerHTML = [{ key: 'all', label: 'Tout', emoji: '' }, ...CATEGORIES].map((c) => {
    const count = c.key === 'all' ? total : results[c.key]?.items?.length;
    return `<button type="button" class="chip${filter === c.key ? ' is-active' : ''}" data-filter="${c.key}" aria-pressed="${filter === c.key}">
      ${c.emoji} ${c.label}${count !== undefined ? ` <span class="count">${count}</span>` : ''}
    </button>`;
  }).join('');

  $('results').innerHTML = searching ? CATEGORIES.map(renderSection).join('') : '';

  const loading = CATEGORIES.some((c) => results[c.key]?.status === 'loading');
  $('search-status').textContent = !searching
    ? ''
    : loading
      ? `Recherche de « ${query} »…`
      : total
        ? `${total} résultat${total > 1 ? 's' : ''} pour « ${query} »`
        : `Aucun résultat pour « ${query} ». Essayez un autre mot, ou en anglais pour les jeux et les articles.`;
}

// ---------- Recherche ----------

function run() {
  query = input.value.trim();

  // La recherche est dans l'adresse : le lien se partage et survit au rechargement
  const url = new URL(location.href);
  if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
  history.replaceState(null, '', url);

  // Annule les requêtes de la recherche précédente
  controller?.abort();
  results = {};

  if (query.length < MIN_LENGTH) {
    render();
    return;
  }

  controller = new AbortController();
  const { signal } = controller;
  const current = query;

  for (const category of CATEGORIES) {
    results[category.key] = { status: 'loading', items: [] };
    Promise.resolve(category.search(current, signal))
      .then((value) => {
        const { demo = false, items } = Array.isArray(value) ? { items: value } : value;
        results[category.key] = { status: 'done', items, demo };
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        results[category.key] = { status: 'error', items: [] };
      })
      .finally(() => {
        // Une réponse arrivée après une nouvelle frappe est ignorée
        if (current === query) render();
      });
  }

  render();
}

// Recherche au fil de la frappe, après une courte pause
input.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(run, 350);
});

$('search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  clearTimeout(timer);
  run();
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (button) {
    filter = button.dataset.filter;
    render();
    if (button.classList.contains('see-all')) {
      $('filters').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const suggestion = event.target.closest('[data-suggestion]');
  if (suggestion) {
    input.value = suggestion.dataset.suggestion;
    run();
  }
});

// « / » place le curseur dans la barre de recherche, comme sur GitHub
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== input) {
    event.preventDefault();
    input.focus();
  }
});

$('suggestion-chips').innerHTML = SUGGESTIONS
  .map((s) => `<button type="button" class="chip" data-suggestion="${esc(s)}">${esc(s)}</button>`)
  .join('');

// Recherche passée dans l'adresse (lien partagé, champ du hub)
input.value = new URLSearchParams(location.search).get('q') ?? '';
run();
