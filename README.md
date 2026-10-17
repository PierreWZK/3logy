# 3logy · Le hub geek du jour

> Jour 04 du défi **30 jours, 30 projets** · HTML, CSS et JavaScript, API RAWG et TMDB, Netlify Functions

![Page d'accueil de 3logy](docs/preview.png)

3logy rassemble sur une page **un peu de code, un jeu et un film**, renouvelés chaque jour à minuit et les mêmes pour tout le monde. Un **défi du jour** alterne entre les trois thèmes, et une **recherche** couvre jeux, films, articles et astuces dev.

🔗 **Démo :** [3logy.projectp.fr](https://3logy.projectp.fr/)

## Pages

| Page | Contenu |
| --- | --- |
| `index.html` | Vitrine : présentation, aperçu du programme du jour, rotation du défi |
| `hub.html` | Le hub, en trois colonnes : Dev Daily, le jeu du jour, le film du jour |
| `defi.html` | Le défi du jour |
| `recherche.html` | Recherche de jeux, films, articles et astuces |

## Fonctionnalités

**💻 Dev Daily**

- **Astuce du jour** (JavaScript, CSS, Git, terminal, VS Code, HTML) avec son bout de code.
- **Dépôts GitHub qui montent** : les dépôts créés dans la semaine qui ont le plus d'étoiles.
- **À lire sur DEV.to** et **la une de Hacker News**.

**🎮 Le jeu du jour** (API RAWG)

- Tiré parmi des jeux au Metacritic supérieur à 80.
- Image, description, studio, genres, plateformes, durée moyenne, note Metacritic, captures d'écran.

**🎬 Le film du jour** (API TMDB)

- Tiré parmi les films les plus vus de TMDB, avec la fiche en français.
- Affiche, synopsis, réalisateur, casting, durée, genres, note, lien vers la bande-annonce.

**🏆 Le défi du jour**

- **Un thème par jour, en rotation** : Dev → Jeu vidéo → Ciné.
  - Dev : *que va afficher ce code ?*
  - Jeu vidéo : *quel est ce jeu ?* à partir d'une capture floutée.
  - Ciné : *quel est ce film ?* à partir de son image floutée, puis de son résumé (titre masqué).
- **3 essais et 4 réponses**. Chaque erreur débloque un indice et rend l'image plus nette.
- Le jeu et le film du hub sont exclus du défi, sinon ce serait trop facile.
- **Statistiques et série 🔥** gardées dans le navigateur, **résultat à partager** façon Wordle (🟥🟩).

**🔎 Recherche**

- **Jeux** (RAWG) : les jeux dont le nom contient tous les mots cherchés passent en premier, triés par popularité. La recherche de RAWG seule remonte surtout des jeux amateurs.
- **Films** (TMDB), avec les fiches en français.
- **Articles** : recherche dans Hacker News, plus les articles DEV.to du tag quand la recherche tient en un mot (`react`, `css`…).
- **Astuces dev** : recherche locale, insensible aux accents.
- Filtres par catégorie, recherche pendant la frappe (les requêtes précédentes sont annulées), recherche dans l'adresse (`recherche.html?q=zelda`) pour partager un lien, raccourci `/`. Le hub a aussi son champ de recherche.
- En mode démo, jeux et films sont cherchés dans les exemples.

**Le même programme pour tout le monde** : les tirages utilisent un générateur pseudo-aléatoire initialisé par la date. Les réponses des API sont gardées en cache jusqu'à minuit (`localStorage`), donc chaque source n'est appelée qu'une fois par jour.

## Clés d'API

RAWG et TMDB demandent une clé. Elles ne sont **jamais envoyées au navigateur** : deux fonctions Netlify (`/api/rawg`, `/api/tmdb`) font les appels en ajoutant la clé côté serveur, et n'acceptent que les routes utilisées par le site.

| Variable | Où l'obtenir |
| --- | --- |
| `RAWG_KEY` | [rawg.io/apidocs](https://rawg.io/apidocs), gratuit |
| `TMDB_TOKEN` | [themoviedb.org](https://www.themoviedb.org/settings/api) → Paramètres → API → **jeton d'accès en lecture** |

**Sans clé, le site fonctionne en mode démo** : un bandeau le signale, et des jeux et films d'exemple remplacent les données en ligne. Dev Daily n'a pas besoin de clé (API publiques de GitHub, DEV.to et Hacker News).

## Lancer en local

```bash
cp .env.example .env      # puis renseigner RAWG_KEY et TMDB_TOKEN
npx netlify dev           # site + fonctions sur http://localhost:8888
```

Sans Netlify, `npm start` lance `server.mjs` (Node 20 ou plus, aucune dépendance) : site et relais sur http://localhost:3000, avec les clés lues dans les variables d'environnement (`RAWG_KEY=… TMDB_TOKEN=… npm start`).

Les pages utilisent des modules JavaScript : il faut les servir, elles ne s'ouvrent pas directement depuis le fichier. Sans `netlify dev` (Live Server, `npx serve .`), le site marche en mode démo.

## Mise en ligne

Netlify publie le dossier tel quel (`netlify.toml`) et déploie les fonctions de `netlify/functions/`. Il reste à définir `RAWG_KEY` et `TMDB_TOKEN` dans **Site configuration → Environment variables**.

Sur un serveur (VPS avec Coolify, build pack Nixpacks) : `npm start` lance `server.mjs`, qui sert les pages et branche les deux mêmes fonctions sur `/api/rawg` et `/api/tmdb`. Port exposé : 3000. Définir `RAWG_KEY` et `TMDB_TOKEN` dans les variables d'environnement de l'application.

## Structure

```
index.html, hub.html, defi.html, recherche.html
server.mjs              Serveur Node hors Netlify (site + relais /api)
css/style.css
js/
├── common.js           Dates, tirage du jour, appels d'API, cache, échappement
├── data.js             Astuces, quiz de code, jeux et films de démonstration
├── sources.js          Contenus du jour : RAWG, TMDB, GitHub, DEV.to, Hacker News
├── challenge-store.js  Partie du jour et statistiques (localStorage)
├── landing.js          Page vitrine
├── hub.js              Le hub
├── defi.js             Le défi
└── search.js           La recherche
netlify/functions/
├── rawg.mjs            Relais RAWG (clé RAWG_KEY)
└── tmdb.mjs            Relais TMDB (jeton TMDB_TOKEN)
```

## Crédits

Données jeux : [RAWG](https://rawg.io/). Films : [TMDB](https://www.themoviedb.org/). Ce site utilise l'API TMDB sans être approuvé ni certifié par TMDB.
