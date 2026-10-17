// 3logy · le hub : Dev Daily, jeu du jour, film du jour

import { esc, initLayout, longDate, showDemoNotice, themeOfDay } from './common.js';
import { MAX_ATTEMPTS, loadGame } from './challenge-store.js';
import { devDaily, gameOfDay, movieOfDay, tipOfDay } from './sources.js';

initLayout();

const $ = (id) => document.getElementById(id);

const initials = (text) => text.split(/\s+/).filter((w) => /^[\p{L}\d]/u.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const image = (src, alt, fallbackText) => (src
  ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`
  : `<div class="placeholder">${esc(initials(fallbackText))}</div>`);

/** Liste « clé : valeur », sans les valeurs absentes. */
const facts = (rows) => `<dl class="facts">${rows
  .filter(([, value]) => value)
  .map(([label, value]) => `<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`)
  .join('')}</dl>`;

const unavailable = (source) => `<p class="unavailable">${esc(source)} n'a pas répondu, réessayez plus tard.</p>`;

$('hub-date').textContent = longDate();

// ---------- Rappel du défi ----------

const theme = themeOfDay();
const challenge = loadGame();
$('challenge-banner').classList.add(`theme-${theme.key}`);
$('challenge-banner-text').innerHTML = challenge.over
  ? `${theme.emoji} Défi <strong>${esc(theme.label)}</strong> du jour : ${challenge.solved ? `réussi en ${challenge.guesses.length} essai${challenge.guesses.length > 1 ? 's' : ''} ✓` : 'raté, revenez demain'}.`
  : `${theme.emoji} Défi du jour, thème <strong>${esc(theme.label)}</strong> : ${esc(theme.title)} ${MAX_ATTEMPTS} essais.`;
$('challenge-banner-cta').textContent = challenge.over ? 'Voir le résultat' : 'Jouer →';

// ---------- Dev Daily ----------

// L'astuce est locale : affichée sans attendre les sources en ligne
const tip = tipOfDay();
$('tip-topic').textContent = tip.topic;
$('tip-title').textContent = tip.title;
$('tip-text').textContent = tip.text;
$('tip-code').textContent = tip.code;

devDaily().then(({ repos, articles, news }) => {
  $('repos').innerHTML = repos
    ? `<ul class="links">${repos.map((r) => `
        <li><a href="${esc(r.url)}" target="_blank" rel="noopener">
          <strong>${esc(r.name)}</strong>
          <small>${esc(r.description || 'Pas de description')}</small>
          <small>★ ${r.stars.toLocaleString('fr-FR')}${r.language ? ` · ${esc(r.language)}` : ''}</small>
        </a></li>`).join('')}</ul>`
    : unavailable('GitHub');

  const linkList = (items) => `<ul class="links">${items.map((item) => `
      <li><a href="${esc(item.url)}" target="_blank" rel="noopener">
        <strong>${esc(item.title)}</strong>
        <small>${esc(item.meta)}</small>
      </a></li>`).join('')}</ul>`;

  $('articles').innerHTML = articles ? linkList(articles) : unavailable('DEV.to');
  $('news').innerHTML = news ? linkList(news) : unavailable('Hacker News');
});

// ---------- Jeu du jour ----------

gameOfDay().then(({ demo, game }) => {
  showDemoNotice(demo);

  $('game').innerHTML = `
    <article class="panel">
      <div class="media-visual">
        ${image(game.image, game.name, game.name)}
        ${game.metacritic ? `<span class="score" title="Note Metacritic">${game.metacritic}</span>` : ''}
      </div>
      <div class="panel-body">
        <h3>${esc(game.name)}</h3>
        <p class="media-sub">${[game.year, game.developer].filter(Boolean).map(esc).join(' · ')}</p>
        ${game.description ? `<p>${esc(game.description)}</p>` : ''}
        <div class="tags" style="margin-top: 14px">${game.genres.map((g) => `<span class="tag">${esc(g)}</span>`).join('')}</div>
        ${facts([
          ['Plateformes', game.platforms.join(', ')],
          ['Durée moyenne', game.playtime && `${game.playtime} h`],
          ['Metacritic', game.metacritic && `${game.metacritic} / 100`],
        ])}
        ${game.screenshots?.length ? `<div class="screenshots">${game.screenshots
          .map((src, i) => `<img src="${esc(src)}" alt="Capture ${i + 1} de ${esc(game.name)}" loading="lazy">`).join('')}</div>` : ''}
        <div class="media-actions">
          ${game.url ? `<a class="btn" href="${esc(game.url)}" target="_blank" rel="noopener">Fiche RAWG ↗</a>` : ''}
          ${game.website ? `<a class="btn" href="${esc(game.website)}" target="_blank" rel="noopener">Site officiel ↗</a>` : ''}
        </div>
      </div>
    </article>`;
});

// ---------- Film du jour ----------

movieOfDay().then(({ demo, movie }) => {
  showDemoNotice(demo);

  $('movie').innerHTML = `
    <article class="panel">
      <div class="media-visual">
        ${image(movie.backdrop, '', movie.title)}
        ${movie.vote ? `<span class="score" title="Note des spectateurs TMDB">★ ${movie.vote}</span>` : ''}
      </div>
      <div class="panel-body">
        <div class="media-head">
          <div class="poster">${image(movie.poster, `Affiche de ${movie.title}`, movie.title)}</div>
          <div>
            <h3>${esc(movie.title)}</h3>
            <p class="media-sub">${[movie.year, movie.runtime && `${Math.floor(movie.runtime / 60)} h ${String(movie.runtime % 60).padStart(2, '0')}`]
              .filter(Boolean).map(esc).join(' · ')}</p>
            ${movie.originalTitle ? `<p class="media-sub">Titre original : ${esc(movie.originalTitle)}</p>` : ''}
          </div>
        </div>
        ${movie.tagline ? `<p><em>${esc(movie.tagline)}</em></p>` : ''}
        <p>${esc(movie.overview)}</p>
        <div class="tags" style="margin-top: 14px">${movie.genres.map((g) => `<span class="tag">${esc(g)}</span>`).join('')}</div>
        ${facts([
          ['Réalisation', movie.director],
          ['Avec', movie.cast?.join(', ')],
          ['Note', movie.vote && `${movie.vote} / 10`],
        ])}
        <div class="media-actions">
          ${movie.trailer ? `<a class="btn" href="${esc(movie.trailer)}" target="_blank" rel="noopener">▶ Bande-annonce</a>` : ''}
          ${movie.url ? `<a class="btn" href="${esc(movie.url)}" target="_blank" rel="noopener">Fiche TMDB ↗</a>` : ''}
        </div>
      </div>
    </article>`;
});
