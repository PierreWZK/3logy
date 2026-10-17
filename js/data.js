// Trilogie · contenus locaux : astuces dev, quiz de code, et données de démo
// (utilisées quand les clés RAWG / TMDB ne sont pas configurées)

/** Astuces du jour de la colonne Dev Daily. */
export const DEV_TIPS = [
  {
    topic: 'JavaScript',
    title: 'structuredClone() copie vraiment un objet',
    text: 'Fini JSON.parse(JSON.stringify()) : structuredClone garde les dates, les Map, les Set et les références circulaires.',
    code: 'const copie = structuredClone(original);',
  },
  {
    topic: 'JavaScript',
    title: 'at(-1) pour le dernier élément',
    text: 'Array.prototype.at accepte les index négatifs. Plus lisible que tab[tab.length - 1].',
    code: "const dernier = commits.at(-1);\nconst avantDernier = commits.at(-2);",
  },
  {
    topic: 'JavaScript',
    title: 'Object.groupBy() regroupe une liste',
    text: 'Regrouper des éléments par clé sans reduce : la fonction renvoie la clé de chaque élément.',
    code: "const parGenre = Object.groupBy(jeux, (jeu) => jeu.genre);\n// { RPG: [...], Plateforme: [...] }",
  },
  {
    topic: 'JavaScript',
    title: '?? n\'écrase pas le 0',
    text: 'L\'opérateur ?? ne remplace que null et undefined, contrairement à || qui remplace aussi 0 et la chaîne vide.',
    code: "const volume = reglages.volume ?? 50; // 0 reste 0\nconst nom = saisie || 'Anonyme';",
  },
  {
    topic: 'JavaScript',
    title: 'Intl.RelativeTimeFormat pour « il y a 3 jours »',
    text: 'Le navigateur sait formater les durées relatives dans toutes les langues, sans bibliothèque.',
    code: "const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });\nrtf.format(-1, 'day'); // « hier »",
  },
  {
    topic: 'JavaScript',
    title: 'AbortController annule un fetch',
    text: 'Pratique pour une recherche au fil de la frappe : on annule la requête précédente avant d\'en lancer une nouvelle.',
    code: "controller?.abort();\ncontroller = new AbortController();\nfetch(url, { signal: controller.signal });",
  },
  {
    topic: 'JavaScript',
    title: 'Promise.allSettled n\'abandonne jamais',
    text: 'Contrairement à Promise.all, il attend toutes les promesses, même celles qui échouent, et donne le statut de chacune.',
    code: "const resultats = await Promise.allSettled([jeu(), film()]);\nresultats.filter((r) => r.status === 'fulfilled');",
  },
  {
    topic: 'CSS',
    title: ':has(), le sélecteur parent',
    text: 'Styler un élément selon ce qu\'il contient : une carte qui contient une image, un formulaire avec un champ invalide…',
    code: '.carte:has(img) { padding-top: 0; }\nform:has(:invalid) button { opacity: .5; }',
  },
  {
    topic: 'CSS',
    title: 'clamp() pour des tailles fluides',
    text: 'Une taille qui grandit avec l\'écran, entre un minimum et un maximum, sans media query.',
    code: 'h1 { font-size: clamp(2rem, 5vw + 1rem, 4.5rem); }',
  },
  {
    topic: 'CSS',
    title: 'aspect-ratio garde les proportions',
    text: 'Une vignette 16/9 ou un carré parfait, sans l\'ancienne astuce du padding-top en pourcentage.',
    code: '.vignette { aspect-ratio: 16 / 9; object-fit: cover; }',
  },
  {
    topic: 'CSS',
    title: 'inset: 0 remplace quatre lignes',
    text: 'Raccourci pour top, right, bottom et left. Idéal pour un calque qui couvre tout son parent.',
    code: '.calque { position: absolute; inset: 0; }',
  },
  {
    topic: 'CSS',
    title: 'Grille responsive sans media query',
    text: 'auto-fill et minmax créent autant de colonnes que la place le permet.',
    code: '.grille {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n}',
  },
  {
    topic: 'CSS',
    title: 'text-wrap: balance pour les titres',
    text: 'Le navigateur équilibre la longueur des lignes : plus de mot tout seul sur la dernière ligne d\'un titre.',
    code: 'h1, h2 { text-wrap: balance; }',
  },
  {
    topic: 'Git',
    title: 'git switch - revient à la branche précédente',
    text: 'Comme cd - dans le terminal : on alterne entre deux branches sans retaper leur nom.',
    code: 'git switch -',
  },
  {
    topic: 'Git',
    title: 'git commit --fixup puis autosquash',
    text: 'Corriger un ancien commit proprement : le correctif est fusionné automatiquement au bon endroit.',
    code: 'git commit --fixup=a1b2c3d\ngit rebase -i --autosquash main',
  },
  {
    topic: 'Git',
    title: 'git log -S retrouve qui a ajouté une ligne',
    text: 'Cherche les commits qui ont ajouté ou supprimé un texte précis, même s\'il n\'existe plus aujourd\'hui.',
    code: 'git log -S "ancienneFonction" --oneline',
  },
  {
    topic: 'Git',
    title: 'git stash -u garde aussi les nouveaux fichiers',
    text: 'Par défaut, stash ignore les fichiers non suivis. -u les met de côté avec le reste.',
    code: 'git stash -u\ngit stash pop',
  },
  {
    topic: 'Terminal',
    title: 'Ctrl + R cherche dans l\'historique',
    text: 'Tapez quelques lettres d\'une ancienne commande : le terminal la retrouve. Ctrl + R à nouveau pour la suivante.',
    code: '(reverse-i-search)`dock\': docker compose up -d',
  },
  {
    topic: 'Terminal',
    title: '!! relance la dernière commande',
    text: 'Oublié sudo ? sudo !! relance la commande précédente avec les droits administrateur.',
    code: 'apt install htop   # Permission denied\nsudo !!',
  },
  {
    topic: 'VS Code',
    title: 'Ctrl + D sélectionne l\'occurrence suivante',
    text: 'Plusieurs curseurs en un raccourci : renommez toutes les occurrences d\'un mot dans un bloc.',
    code: 'Ctrl + D        occurrence suivante\nCtrl + Maj + L  toutes les occurrences',
  },
  {
    topic: 'HTML',
    title: '<dialog> pour une fenêtre modale',
    text: 'Le navigateur gère le focus, la touche Échap et le fond assombri. showModal() suffit.',
    code: '<dialog id="aide">…</dialog>\n<script>aide.showModal();</script>',
  },
  {
    topic: 'HTML',
    title: 'loading="lazy" sur les images',
    text: 'Les images hors de l\'écran ne se chargent qu\'au moment où l\'on s\'en approche.',
    code: '<img src="affiche.jpg" alt="…" loading="lazy">',
  },
];

/**
 * Défis Dev : « que va afficher ce code ? ». La première option est la bonne réponse,
 * l'ordre est mélangé à l'affichage.
 */
export const DEV_QUIZ = [
  {
    code: 'console.log(0.1 + 0.2 === 0.3);',
    options: ['false', 'true', 'undefined', 'NaN'],
    explanation: 'Les nombres à virgule sont stockés en binaire : 0.1 + 0.2 vaut 0.30000000000000004.',
  },
  {
    code: 'console.log(typeof null);',
    options: ['"object"', '"null"', '"undefined"', 'null'],
    explanation: 'Un bug historique de JavaScript, gardé pour ne pas casser le web : typeof null vaut "object".',
  },
  {
    code: 'console.log([10, 1, 3].sort());',
    options: ['[1, 10, 3]', '[1, 3, 10]', '[10, 3, 1]', '[3, 10, 1]'],
    explanation: 'Sans fonction de comparaison, sort() compare des chaînes : "10" vient avant "3".',
  },
  {
    code: "console.log('5' - 2, '5' + 2);",
    options: ['3 "52"', '3 7', '"52" "52"', 'NaN "52"'],
    explanation: 'Le - convertit en nombre, le + colle des chaînes dès qu\'un des deux côtés en est une.',
  },
  {
    code: 'console.log(NaN === NaN);',
    options: ['false', 'true', 'NaN', 'TypeError'],
    explanation: 'NaN n\'est égal à rien, pas même à lui-même. On le teste avec Number.isNaN().',
  },
  {
    code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i));\n}',
    options: ['3 3 3', '0 1 2', '0 0 0', '2 2 2'],
    explanation: 'var n\'a qu\'une seule variable pour toute la boucle : quand les fonctions s\'exécutent, i vaut déjà 3. Avec let, on aurait 0 1 2.',
  },
  {
    code: 'console.log(Math.max());',
    options: ['-Infinity', 'Infinity', '0', 'undefined'],
    explanation: 'Sans argument, Math.max part de la plus petite valeur possible : -Infinity.',
  },
  {
    code: "console.log('b' + 'a' + +'a' + 'a');",
    options: ['"baNaNa"', '"baaa"', '"ba1a"', 'NaN'],
    explanation: "Le + devant 'a' tente de le convertir en nombre : NaN, collé au reste de la chaîne.",
  },
  {
    code: "console.log(parseInt('08px'));",
    options: ['8', 'NaN', '0', '"08"'],
    explanation: 'parseInt lit les chiffres du début et s\'arrête au premier caractère qui n\'en est pas un.',
  },
  {
    code: "console.log(['1', '2', '3'].map(parseInt));",
    options: ['[1, NaN, NaN]', '[1, 2, 3]', '[NaN, NaN, NaN]', '[1, 2, NaN]'],
    explanation: 'map passe aussi l\'index : parseInt("2", 1) et parseInt("3", 2) n\'ont pas de sens et donnent NaN.',
  },
  {
    code: 'const tab = [1, 2, 3];\ntab.length = 1;\nconsole.log(tab);',
    options: ['[1]', '[1, 2, 3]', '[3]', 'TypeError'],
    explanation: 'Réduire length supprime réellement les éléments en trop.',
  },
  {
    code: 'console.log([] + {});',
    options: ['"[object Object]"', '"{}"', '0', 'TypeError'],
    explanation: 'Les deux sont convertis en chaînes : "" pour le tableau, "[object Object]" pour l\'objet.',
  },
  {
    code: 'console.log(typeof typeof 42);',
    options: ['"string"', '"number"', '"typeof"', 'undefined'],
    explanation: 'typeof 42 donne la chaîne "number", et le typeof d\'une chaîne est "string".',
  },
  {
    code: "const user = {};\nconsole.log(user.profil?.pseudo ?? 'invité');",
    options: ['"invité"', 'undefined', 'TypeError', 'null'],
    explanation: '?. s\'arrête sans erreur sur une propriété absente et renvoie undefined, que ?? remplace.',
  },
  {
    code: 'console.log(1 < 2 < 3, 3 > 2 > 1);',
    options: ['true false', 'true true', 'false false', 'false true'],
    explanation: '3 > 2 donne true, puis true > 1 compare 1 > 1 : false.',
  },
];

/** Jeux de démonstration (sans clé RAWG). */
export const DEMO_GAMES = [
  { id: 'd1', name: 'The Witcher 3: Wild Hunt', year: 2015, genres: ['RPG', 'Action'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], developer: 'CD Projekt Red', metacritic: 92, description: 'Geralt de Riv, chasseur de monstres, part à la recherche de sa fille adoptive dans un monde ouvert ravagé par la guerre.' },
  { id: 'd2', name: 'Portal 2', year: 2011, genres: ['Puzzle', 'Plateforme'], platforms: ['PC', 'PlayStation', 'Xbox'], developer: 'Valve', metacritic: 95, description: 'Armé d\'un pistolet à portails, on résout des salles de test imaginées par une intelligence artificielle aussi drôle que menaçante.' },
  { id: 'd3', name: 'Hollow Knight', year: 2017, genres: ['Action', 'Plateforme'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], developer: 'Team Cherry', metacritic: 87, description: 'Un petit chevalier explore Hallownest, un royaume d\'insectes en ruine, dans un metroidvania exigeant et dessiné à la main.' },
  { id: 'd4', name: 'Celeste', year: 2018, genres: ['Plateforme', 'Indie'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], developer: 'Maddy Makes Games', metacritic: 92, description: 'Madeline escalade une montagne en affrontant ses angoisses, dans un jeu de plateforme précis et touchant.' },
  { id: 'd5', name: 'Hades', year: 2020, genres: ['Action', 'Roguelike'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], developer: 'Supergiant Games', metacritic: 93, description: 'Zagreus, fils du dieu des Enfers, tente de s\'échapper du royaume de son père, une tentative après l\'autre.' },
  { id: 'd6', name: 'Red Dead Redemption 2', year: 2018, genres: ['Action', 'Aventure'], platforms: ['PC', 'PlayStation', 'Xbox'], developer: 'Rockstar Games', metacritic: 96, description: 'Arthur Morgan et la bande de Dutch van der Linde tentent de survivre à la fin de l\'Ouest sauvage, en 1899.' },
  { id: 'd7', name: 'Elden Ring', year: 2022, genres: ['RPG', 'Action'], platforms: ['PC', 'PlayStation', 'Xbox'], developer: 'FromSoftware', metacritic: 96, description: 'Un Sans-éclat parcourt l\'Entre-terre à la recherche des fragments du Cercle d\'Elden, dans un monde ouvert impitoyable.' },
  { id: 'd8', name: 'Stardew Valley', year: 2016, genres: ['Simulation', 'RPG'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'], developer: 'ConcernedApe', metacritic: 89, description: 'On reprend la vieille ferme de son grand-père : cultures, élevage, pêche et vie de village au fil des saisons.' },
  { id: 'd9', name: 'The Legend of Zelda: Breath of the Wild', year: 2017, genres: ['Action', 'Aventure'], platforms: ['Nintendo'], developer: 'Nintendo', metacritic: 97, description: 'Link se réveille après cent ans de sommeil et explore librement un Hyrule dévasté pour vaincre Ganon.' },
  { id: 'd10', name: 'Minecraft', year: 2011, genres: ['Bac à sable', 'Survie'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'], developer: 'Mojang', metacritic: 93, description: 'Un monde fait de cubes à miner, explorer et construire, seul ou à plusieurs, sans autre limite que l\'imagination.' },
  { id: 'd11', name: 'Outer Wilds', year: 2019, genres: ['Aventure', 'Exploration'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], developer: 'Mobius Digital', metacritic: 85, description: 'Un système solaire miniature pris dans une boucle de 22 minutes, à explorer pour percer le mystère d\'une civilisation disparue.' },
  { id: 'd12', name: 'Disco Elysium', year: 2019, genres: ['RPG', 'Enquête'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], developer: 'ZA/UM', metacritic: 91, description: 'Un inspecteur amnésique enquête sur un meurtre dans une ville portuaire en ruine, en dialoguant avec ses propres pensées.' },
];

/** Films de démonstration (sans clé TMDB). */
export const DEMO_MOVIES = [
  { id: 'm1', title: 'Inception', year: 2010, genres: ['Science-Fiction', 'Action'], director: 'Christopher Nolan', cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'], runtime: 148, vote: 8.4, overview: 'Dom Cobb vole des secrets dans les rêves de ses cibles. On lui propose une mission inverse : implanter une idée dans l\'esprit d\'un héritier.' },
  { id: 'm2', title: 'Le Fabuleux Destin d\'Amélie Poulain', year: 2001, genres: ['Comédie', 'Romance'], director: 'Jean-Pierre Jeunet', cast: ['Audrey Tautou', 'Mathieu Kassovitz', 'Rufus'], runtime: 122, vote: 7.9, overview: 'Serveuse dans un café de Montmartre, une jeune femme décide de changer en secret la vie des gens qui l\'entourent.' },
  { id: 'm3', title: 'Parasite', year: 2019, genres: ['Thriller', 'Drame'], director: 'Bong Joon-ho', cast: ['Song Kang-ho', 'Choi Woo-shik', 'Park So-dam'], runtime: 132, vote: 8.5, overview: 'Une famille pauvre de Séoul s\'infiltre, membre après membre, au service d\'une famille riche, jusqu\'au point de rupture.' },
  { id: 'm4', title: 'Le Voyage de Chihiro', year: 2001, genres: ['Animation', 'Fantastique'], director: 'Hayao Miyazaki', cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'], runtime: 125, vote: 8.5, overview: 'Une fillette se retrouve piégée dans un monde peuplé d\'esprits, où ses parents ont été transformés en cochons.' },
  { id: 'm5', title: 'Interstellar', year: 2014, genres: ['Science-Fiction', 'Drame'], director: 'Christopher Nolan', cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'], runtime: 169, vote: 8.4, overview: 'Alors que la Terre se meurt, un ancien pilote part à travers un trou de ver chercher une nouvelle planète habitable.' },
  { id: 'm6', title: 'Pulp Fiction', year: 1994, genres: ['Crime', 'Thriller'], director: 'Quentin Tarantino', cast: ['John Travolta', 'Samuel L. Jackson', 'Uma Thurman'], runtime: 154, vote: 8.5, overview: 'Deux tueurs à gages, un boxeur, la femme d\'un gangster et deux braqueurs se croisent à Los Angeles.' },
  { id: 'm7', title: 'Matrix', year: 1999, genres: ['Science-Fiction', 'Action'], director: 'Lana et Lilly Wachowski', cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'], runtime: 136, vote: 8.2, overview: 'Un pirate informatique découvre que le monde qu\'il connaît est une simulation, et rejoint ceux qui la combattent.' },
  { id: 'm8', title: 'Intouchables', year: 2011, genres: ['Comédie', 'Drame'], director: 'Olivier Nakache et Éric Toledano', cast: ['François Cluzet', 'Omar Sy', 'Anne Le Ny'], runtime: 112, vote: 8.3, overview: 'Un riche aristocrate tétraplégique engage comme auxiliaire de vie un jeune de banlieue tout juste sorti de prison.' },
  { id: 'm9', title: 'Mad Max: Fury Road', year: 2015, genres: ['Action', 'Aventure'], director: 'George Miller', cast: ['Tom Hardy', 'Charlize Theron', 'Nicholas Hoult'], runtime: 120, vote: 7.6, overview: 'Dans un désert post-apocalyptique, Furiosa fuit un tyran avec ses épouses, et Max se retrouve embarqué dans la course.' },
  { id: 'm10', title: 'Retour vers le futur', year: 1985, genres: ['Science-Fiction', 'Comédie'], director: 'Robert Zemeckis', cast: ['Michael J. Fox', 'Christopher Lloyd', 'Lea Thompson'], runtime: 116, vote: 8.3, overview: 'Un adolescent est propulsé en 1955 à bord d\'une DeLorean et doit faire en sorte que ses parents tombent amoureux.' },
  { id: 'm11', title: 'Le Seigneur des anneaux : La Communauté de l\'anneau', year: 2001, genres: ['Fantastique', 'Aventure'], director: 'Peter Jackson', cast: ['Elijah Wood', 'Ian McKellen', 'Viggo Mortensen'], runtime: 178, vote: 8.4, overview: 'Un jeune hobbit hérite d\'un anneau maléfique et part, avec huit compagnons, pour le détruire.' },
  { id: 'm12', title: 'Whiplash', year: 2014, genres: ['Drame', 'Musique'], director: 'Damien Chazelle', cast: ['Miles Teller', 'J.K. Simmons', 'Melissa Benoist'], runtime: 107, vote: 8.4, overview: 'Un jeune batteur de jazz intègre le meilleur conservatoire du pays, sous la coupe d\'un professeur tyrannique.' },
];
