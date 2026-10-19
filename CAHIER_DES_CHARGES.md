# Jour 4/30 — 3logy, le hub geek du jour

> Stack : **HTML, CSS et JavaScript** (modules), **API RAWG** et **TMDB**, petit serveur **Node** sans dépendance · hébergement **Coolify** (Nixpacks, `npm start`), sous-domaine `3logy.projectp.fr`.
> Rédigé après la livraison, à partir du code : ce document décrit ce qui a été construit et sert de référence pour les évolutions.

## 1. L'idée

Un rendez-vous quotidien pour les geeks : **un peu de code, un jeu et un film**, renouvelés à minuit et les mêmes pour tout le monde. Un **défi du jour** alterne entre les trois thèmes, et une **recherche** couvre jeux, films, articles et astuces.

## 2. MVP — ce qui doit fonctionner

1. Une **vitrine** (`index.html`) : présentation, aperçu du programme du jour, rotation du défi.
2. Le **hub** (`hub.html`) en trois colonnes : Dev Daily, le jeu du jour, le film du jour.
3. Le **défi du jour** (`defi.html`) : 3 essais, 4 réponses, des indices, un résultat à partager.
4. La **recherche** (`recherche.html`) : jeux, films, articles, astuces.
5. Les clés d'API **ne sont jamais envoyées au navigateur**.
6. Sans clé, le site marche en **mode démo**.

### Périmètre volontairement limité

- Pas de compte : statistiques et série restent dans le navigateur.
- Pas de base de données : les réponses des API sont gardées en cache jusqu'à minuit.

## 3. Cahier des charges fonctionnel

### A. 💻 Dev Daily

- **Astuce du jour** (JavaScript, CSS, Git, terminal, VS Code, HTML) avec son bout de code.
- **Dépôts GitHub qui montent** : créés dans la semaine, triés par étoiles.
- **À lire sur DEV.to** et **la une de Hacker News** (API publiques, sans clé).

### B. 🎮 Le jeu du jour (RAWG)

- Tiré parmi les jeux au Metacritic supérieur à 80.
- Image, description, studio, genres, plateformes, durée moyenne, note, captures.

### C. 🎬 Le film du jour (TMDB)

- Tiré parmi les films les plus vus, fiche en français.
- Affiche, synopsis, réalisateur, casting, durée, genres, note, bande-annonce.

### D. 🏆 Le défi du jour

- **Un thème par jour, en rotation** : Dev → Jeu vidéo → Ciné.
  - Dev : *que va afficher ce code ?*
  - Jeu vidéo : *quel est ce jeu ?* d'après une capture floutée.
  - Ciné : *quel est ce film ?* d'après son image floutée, puis son résumé (titre masqué).
- **3 essais, 4 réponses** ; chaque erreur débloque un indice et rend l'image plus nette.
- Le jeu et le film du hub sont exclus du défi.
- Statistiques, **série 🔥**, résultat à partager (🟥🟩).

### E. 🔎 Recherche

- **Jeux** : les noms qui contiennent tous les mots cherchés d'abord, triés par popularité.
- **Films** (fiches en français), **articles** (Hacker News, plus DEV.to pour une recherche d'un mot), **astuces** (recherche locale, insensible aux accents).
- Filtres par catégorie, recherche pendant la frappe (requêtes précédentes annulées), recherche dans l'adresse (`?q=zelda`), raccourci `/`.

### Règle commune : le même programme pour tous

Les tirages utilisent un générateur pseudo-aléatoire initialisé par la date. Chaque source n'est appelée qu'une fois par jour (cache `localStorage` jusqu'à minuit).

## 4. Cahier des charges technique

### Architecture

```
index.html, hub.html, defi.html, recherche.html
server.mjs              Serveur Node : pages statiques + relais /api/rawg et /api/tmdb
css/style.css
js/
├── common.js           Dates, tirage du jour, appels d'API, cache, échappement
├── data.js             Astuces, quiz de code, jeux et films de démonstration
├── sources.js          Contenus du jour : RAWG, TMDB, GitHub, DEV.to, Hacker News
├── challenge-store.js  Partie du jour et statistiques
├── landing.js, hub.js, defi.js, search.js
netlify/functions/      Les deux relais (rawg.mjs, tmdb.mjs), branchés par server.mjs
```

### Les relais d'API

- `RAWG_KEY` et `TMDB_TOKEN` restent côté serveur ; les relais n'acceptent que les routes utilisées par le site.
- `server.mjs` ne sert que les fichiers du site (pages, `css/`, `js/`, `docs/`), jamais `.env` ni le code serveur.
- Toute donnée venant d'une API est échappée avant d'être affichée.

### Mise en ligne

Coolify lance `npm start` (port 3000) à chaque push sur `master` ; les deux clés sont dans les variables d'environnement de l'application. L'aperçu du lien vient des balises Open Graph et de `docs/og.png`.

## 5. Critères de réussite

- [x] Deux visiteurs voient le même jeu, le même film et le même défi le même jour.
- [x] Aucune clé d'API n'apparaît dans le code envoyé au navigateur.
- [x] Sans clé, le site s'affiche en mode démo, avec un bandeau.
- [x] Le défi ne propose jamais le jeu ou le film du hub.
- [x] La recherche ne laisse pas passer de réponse périmée quand on tape vite.

## 6. Pistes d'évolution

- Renommer `netlify/functions/` en `api/` (vestige de l'hébergement Netlify).
- Cache côté serveur, partagé entre visiteurs, pour moins solliciter les API.
- Tests unitaires du tirage du jour et des relais.

## 7. Définition du « terminé »

Les critères de la section 5 sont remplis, le site est en ligne sur `3logy.projectp.fr` avec ses clés, et le README explique comment le lancer.
