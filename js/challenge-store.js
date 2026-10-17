// 3logy · sauvegarde des défis dans le navigateur : partie du jour et statistiques

import { dateKey, storage } from './common.js';

export const MAX_ATTEMPTS = 3;

const gameKey = (date = new Date()) => `3logy:defi:${dateKey(date)}`;
const STATS_KEY = '3logy:stats';

/**
 * Partie du jour : { guesses: [id, …], solved, over }.
 * guesses garde l'ordre des réponses données, pour reconstruire l'écran au rechargement.
 */
export function loadGame(date = new Date()) {
  return storage.get(gameKey(date)) ?? { guesses: [], solved: false, over: false };
}

export function saveGame(game, date = new Date()) {
  storage.set(gameKey(date), game);
}

/** Statistiques : parties jouées, gagnées, série en cours et record. */
export function loadStats() {
  return storage.get(STATS_KEY) ?? { played: 0, won: 0, streak: 0, best: 0, lastWon: null };
}

/** Met à jour les statistiques à la fin de la partie du jour. */
export function recordResult(solved, date = new Date()) {
  const stats = loadStats();
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);

  stats.played += 1;
  if (solved) {
    stats.won += 1;
    // La série continue seulement si le défi d'hier a aussi été réussi
    stats.streak = stats.lastWon === dateKey(yesterday) ? stats.streak + 1 : 1;
    stats.best = Math.max(stats.best, stats.streak);
    stats.lastWon = dateKey(date);
  } else {
    stats.streak = 0;
  }

  storage.set(STATS_KEY, stats);
  return stats;
}

/** Série affichée : elle tombe à 0 si le défi d'hier n'a pas été réussi. */
export function currentStreak(date = new Date()) {
  const stats = loadStats();
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return [dateKey(date), dateKey(yesterday)].includes(stats.lastWon) ? stats.streak : 0;
}
