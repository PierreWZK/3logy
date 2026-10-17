// Trilogie · page vitrine : aperçu du programme du jour et rotation du défi

import { THEMES, esc, initLayout, longDate, showDemoNotice, themeOfDay, truncate } from './common.js';
import { MAX_ATTEMPTS, currentStreak, loadGame } from './challenge-store.js';
import { gameOfDay, movieOfDay, tipOfDay } from './sources.js';

initLayout();

const $ = (id) => document.getElementById(id);

/** Initiales d'un titre, affichées quand il n'y a pas d'image. */
const initials = (text) => text.split(/\s+/).filter((w) => /^[\p{L}\d]/u.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const visual = (src, alt, fallbackText) => (src
  ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`
  : `<div class="placeholder">${esc(initials(fallbackText))}</div>`);

$('today-date').textContent = longDate();

// ---------- Dev : l'astuce du jour (locale, immédiate) ----------

const tip = tipOfDay();
$('today-dev-code').classList.remove('skeleton');
$('today-dev-code').textContent = tip.code;
$('today-dev-title').textContent = tip.title;
$('today-dev-text').textContent = `${tip.topic} · ${truncate(tip.text, 110)}`;

// ---------- Jeu et film du jour ----------

gameOfDay().then(({ demo, game }) => {
  if (demo) showDemoNotice();
  $('today-game-visual').innerHTML = visual(game.thumb, game.name, game.name);
  $('today-game-title').textContent = game.name;
  $('today-game-text').textContent = [game.year, game.genres.slice(0, 2).join(', '), game.metacritic && `Metacritic ${game.metacritic}`]
    .filter(Boolean).join(' · ');
});

movieOfDay().then(({ demo, movie }) => {
  if (demo) showDemoNotice();
  $('today-movie-visual').innerHTML = visual(movie.backdrop, movie.title, movie.title);
  $('today-movie-title').textContent = movie.title;
  $('today-movie-text').textContent = [movie.year, movie.director ?? movie.genres.slice(0, 2).join(', '), movie.vote && `★ ${movie.vote}`]
    .filter(Boolean).join(' · ');
});

// ---------- Défi : thème du jour et des deux jours suivants ----------

const today = themeOfDay();
const game = loadGame();
const streak = currentStreak();

$('teaser').className = `challenge-teaser theme-${today.key}`;
$('teaser-badge').textContent = `${today.emoji} Défi ${today.label}${streak ? ` · série de ${streak} 🔥` : ''}`;
$('teaser-title').textContent = `Aujourd'hui : ${today.title}`;

if (game.over) {
  const label = game.solved ? `Réussi en ${game.guesses.length} essai${game.guesses.length > 1 ? 's' : ''}` : 'Raté aujourd\'hui';
  $('teaser-cta').textContent = `${label} · voir le résultat`;
  $('hero-challenge').textContent = game.solved ? 'Défi réussi ✓' : 'Voir le défi';
} else if (game.guesses.length) {
  $('teaser-cta').textContent = `Reprendre (${MAX_ATTEMPTS - game.guesses.length} essai${MAX_ATTEMPTS - game.guesses.length > 1 ? 's' : ''} restant${MAX_ATTEMPTS - game.guesses.length > 1 ? 's' : ''}) →`;
}

const labels = ["Aujourd'hui", 'Demain', 'Après-demain'];
$('rotation').innerHTML = labels.map((label, offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const theme = themeOfDay(date);
  return `
    <li class="theme-${theme.key}${offset === 0 ? ' is-today' : ''}">
      <span>${theme.emoji} <strong>${esc(THEMES[theme.key].label)}</strong></span>
      <small>${esc(label)}</small>
    </li>`;
}).join('');
