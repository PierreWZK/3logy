// 3logy · le défi du jour : un thème par jour (dev, jeu, ciné), 3 essais, un indice par erreur

import { esc, initLayout, longDate, showDemoNotice, shuffleDaily, pickDaily, themeOfDay, untilMidnight } from './common.js';
import { MAX_ATTEMPTS, currentStreak, loadGame, loadStats, recordResult, saveGame } from './challenge-store.js';
import { DEV_QUIZ } from './data.js';
import { gameOfDay, gamePool, movieOfDay, moviePool } from './sources.js';

initLayout();

const $ = (id) => document.getElementById(id);
const theme = themeOfDay();

/** Flou de l'image selon le nombre d'erreurs : elle se dévoile peu à peu, puis entièrement à la fin. */
const BLUR = [28, 16, 7];

// ---------- Construction du défi du jour ----------

/**
 * Un défi : la question, l'image ou le code à montrer, les indices (le premier est visible
 * d'emblée, les suivants se débloquent à chaque erreur), les réponses proposées et la solution.
 */
async function buildChallenge() {
  if (theme.key === 'dev') {
    const quiz = pickDaily(DEV_QUIZ, 'defi-dev');
    return {
      demo: false,
      code: quiz.code,
      clues: ['Une mauvaise réponse est éliminée à chaque erreur.'],
      options: shuffleDaily(quiz.options, 'defi-dev-options').map((label) => ({ id: label, label })),
      answer: quiz.options[0],
      codeOptions: true,
      reveal: { title: quiz.options[0], text: quiz.explanation },
    };
  }

  if (theme.key === 'jeu') {
    const [{ demo, games }, { game: featured }] = await Promise.all([gamePool(), gameOfDay()]);
    // Le jeu du hub serait trop facile à reconnaître : on l'écarte
    const candidates = games.filter((g) => g.id !== featured.id);
    const answer = pickDaily(candidates, 'defi-jeu');
    const others = shuffleDaily(candidates.filter((g) => g.id !== answer.id), 'defi-jeu-autres').slice(0, 3);

    return {
      demo,
      image: answer.screenshots?.[0] ?? answer.image ?? null,
      clues: [
        `Genres : <strong>${esc(answer.genres.join(', '))}</strong>`,
        `Sorti en <strong>${esc(answer.year ?? '?')}</strong>${answer.metacritic ? `, noté <strong>${answer.metacritic}</strong> sur Metacritic` : ''}`,
        answer.developer
          ? `Développé par <strong>${esc(answer.developer)}</strong>`
          : `Disponible sur <strong>${esc(answer.platforms.join(', '))}</strong>`,
      ],
      options: shuffleDaily([answer, ...others], 'defi-jeu-options').map((g) => ({ id: String(g.id), label: g.name })),
      answer: String(answer.id),
      reveal: {
        title: answer.name,
        text: answer.description ?? [answer.year, answer.genres.join(', ')].filter(Boolean).join(' · '),
        link: answer.url,
        linkLabel: 'Voir sur RAWG ↗',
      },
    };
  }

  const [{ demo, movies }, { movie: featured }] = await Promise.all([moviePool(), movieOfDay()]);
  const candidates = movies.filter((m) => m.id !== featured.id);
  const answer = pickDaily(candidates, 'defi-cine');
  const others = shuffleDaily(candidates.filter((m) => m.id !== answer.id), 'defi-cine-autres').slice(0, 3);

  return {
    demo,
    image: answer.backdrop ?? null,
    clues: [
      `Genres : <strong>${esc(answer.genres.join(', '))}</strong>`,
      `Sorti en <strong>${esc(answer.year ?? '?')}</strong>${answer.director ? `, réalisé par <strong>${esc(answer.director)}</strong>` : ''}`,
      `Résumé : « ${esc(maskTitle(answer.overview, answer.title))} »`,
    ],
    options: shuffleDaily([answer, ...others], 'defi-cine-options').map((m) => ({ id: String(m.id), label: m.title })),
    answer: String(answer.id),
    reveal: {
      title: answer.title,
      text: answer.overview,
      link: answer.url,
      linkLabel: 'Voir sur TMDB ↗',
    },
  };
}

/** Masque les mots du titre dans le résumé, pour ne pas donner la réponse. */
function maskTitle(text, title) {
  const words = title.split(/[\s:'’,.-]+/).filter((w) => w.length > 2);
  // \b ignore les lettres accentuées : on vérifie à la main qu'aucune lettre n'entoure le mot
  return words.reduce(
    (masked, word) => masked.replace(
      new RegExp(`(?<![\\p{L}\\d])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\d])`, 'giu'),
      '▇▇▇',
    ),
    text,
  );
}

// ---------- Affichage ----------

let challenge;
let state = loadGame();

function render() {
  const misses = state.guesses.filter((id) => id !== challenge.answer).length;

  // Essais : rouge pour une erreur, vert pour la bonne réponse
  $('attempts').innerHTML = Array.from({ length: MAX_ATTEMPTS }, (_, i) => {
    const guess = state.guesses[i];
    const cls = guess === undefined ? '' : guess === challenge.answer ? 'is-hit' : 'is-miss';
    return `<span class="${cls}"></span>`;
  }).join('');

  // Image floutée (jeu, ciné) ou bloc de code (dev)
  if (challenge.code) {
    $('challenge-visual').innerHTML = `<pre class="challenge-code"><code>${esc(challenge.code)}</code></pre>`;
  } else {
    const blur = state.over ? 0 : BLUR[Math.min(misses, BLUR.length - 1)];
    const current = $('challenge-visual').querySelector('img');
    if (current) {
      current.parentElement.style.setProperty('--blur', `${blur}px`);
    } else {
      $('challenge-visual').innerHTML = `
        <div class="mystery" style="--blur: ${blur}px">
          ${challenge.image ? `<img src="${esc(challenge.image)}" alt="Image mystère, floutée">` : '<div class="placeholder">?</div>'}
        </div>`;
    }
  }

  // Indices : un de plus à chaque erreur, tous visibles à la fin
  const unlocked = state.over ? challenge.clues.length : Math.min(1 + misses, challenge.clues.length);
  $('clues').innerHTML = challenge.clues.map((clue, i) => (i < unlocked
    ? `<li>${clue}</li>`
    : `<li class="is-locked">Indice ${i + 1} : débloqué après une erreur</li>`)).join('');

  // Réponses
  $('options').innerHTML = challenge.options.map((option) => {
    const guessed = state.guesses.includes(option.id);
    const isAnswer = option.id === challenge.answer;
    const cls = [
      'option',
      challenge.codeOptions ? 'is-code' : '',
      guessed && !isAnswer ? 'is-wrong' : '',
      (guessed || state.over) && isAnswer ? 'is-right' : '',
    ].filter(Boolean).join(' ');
    return `<button type="button" class="${cls}" data-id="${esc(option.id)}" ${guessed || state.over ? 'disabled' : ''}>${esc(option.label)}</button>`;
  }).join('');

  renderResult();
  renderStats();
}

function renderResult() {
  if (!state.over) {
    $('result').innerHTML = '';
    return;
  }

  const { reveal } = challenge;
  const tries = state.guesses.length;
  $('result').innerHTML = `
    <div class="result">
      <h2>${state.solved ? `Bravo, trouvé en ${tries} essai${tries > 1 ? 's' : ''} !` : 'Raté pour aujourd\'hui'}</h2>
      <p>La réponse : <strong>${esc(reveal.title)}</strong></p>
      ${reveal.text ? `<p>${esc(reveal.text)}</p>` : ''}
      <div class="media-actions">
        <button type="button" class="btn btn-primary" id="share">Partager mon résultat</button>
        ${reveal.link ? `<a class="btn" href="${esc(reveal.link)}" target="_blank" rel="noopener">${esc(reveal.linkLabel)}</a>` : ''}
        <a class="btn" href="hub.html">Retour au hub</a>
      </div>
    </div>`;

  $('share').addEventListener('click', share);
}

function renderStats() {
  const stats = loadStats();
  $('stats').innerHTML = `
    <div><dt>Joués</dt><dd>${stats.played}</dd></div>
    <div><dt>Réussis</dt><dd>${stats.played ? Math.round((stats.won / stats.played) * 100) : 0} %</dd></div>
    <div><dt>Série 🔥</dt><dd>${currentStreak()}</dd></div>`;
  $('next-challenge').textContent = state.over
    ? `Prochain défi dans ${untilMidnight()} · demain : ${themeOfDay(new Date(Date.now() + 86400000)).label}`
    : '';
}

// ---------- Jouer ----------

function guess(id) {
  if (state.over || state.guesses.includes(id)) {
    return;
  }

  state.guesses.push(id);
  state.solved = id === challenge.answer;
  state.over = state.solved || state.guesses.length >= MAX_ATTEMPTS;
  saveGame(state);

  if (state.over) {
    recordResult(state.solved);
  }
  render();
}

$('options').addEventListener('click', (event) => {
  const button = event.target.closest('.option');
  if (button && !button.disabled) {
    guess(button.dataset.id);
  }
});

/**
 * Téléphone ou tablette : écran tactile sans survol. Windows et macOS proposent aussi
 * navigator.share, mais sur ordinateur on préfère copier le lien.
 */
const isMobile = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

/**
 * Sur téléphone : feuille de partage du système, avec le résultat façon Wordle
 * (les cases de chaque essai, sans dévoiler la réponse). Sur ordinateur : copie du lien.
 */
async function share() {
  const button = $('share');
  const url = `${location.origin}${location.pathname}`;

  if (isMobile() && navigator.share) {
    const squares = state.guesses.map((id) => (id === challenge.answer ? '🟩' : '🟥')).join('');
    const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const score = state.solved ? `${state.guesses.length}/${MAX_ATTEMPTS}` : `X/${MAX_ATTEMPTS}`;
    try {
      await navigator.share({ text: `3logy · défi ${theme.label} ${theme.emoji} du ${date}\n${squares} ${score}`, url });
      return;
    } catch (error) {
      // Feuille de partage fermée sans rien choisir : rien à signaler
      if (error.name === 'AbortError') return;
      // Autre échec : on se rabat sur la copie du lien
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    button.textContent = 'Lien copié !';
  } catch {
    button.textContent = 'Copie impossible';
  }
  setTimeout(() => (button.textContent = 'Partager mon résultat'), 2000);
}

// ---------- Démarrage ----------

$('challenge').classList.add(`theme-${theme.key}`);
$('challenge-badge').textContent = `${theme.emoji} Défi ${theme.label} · ${longDate()}`;
$('challenge-title').textContent = theme.title;
$('challenge-sub').textContent = `${MAX_ATTEMPTS} essais. Chaque erreur débloque un indice${theme.key === 'dev' ? '' : ' et rend l\'image plus nette'}.`;

challenge = await buildChallenge();
showDemoNotice(challenge.demo);

// Une partie sauvegardée avec une réponse qui n'existe plus (données changées) repart de zéro
if (state.guesses.some((id) => !challenge.options.some((o) => o.id === id))) {
  state = { guesses: [], solved: false, over: false };
}

render();
