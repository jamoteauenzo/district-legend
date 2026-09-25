# District Legend : contexte pour Claude

Jeu web mobile (portrait, une main) en pixel art. Le joueur fait la meilleure carrière de footballeur de district possible. Le vrai score (la Légende) récompense le fait d'être nul : cartons, contestations, ratés, merguez. Le jeu ne l'explique jamais : le joueur doit le comprendre seul.

Source de vérité du game design : https://claude.ai/code/artifact/26fbcd9c-20ba-417f-b81e-75b7f7047459 (doc Claude). Le lire avant d'ajouter du contenu.

Le propriétaire ne code pas : expliquer simplement, en français, et tester chaque changement dans le navigateur avant de le pousser.

## Stack

- Phaser 3.90 + Vite, JavaScript (pas de TypeScript), hébergé sur Vercel.
- Résolution de jeu 360 × 640 (pixel art 180 × 320 affiché ×2), `Scale.FIT`.
- Sprites provisoires générés en code dans `src/ui/sprites.js` (grilles de caractères 10 × 15).
- Sons synthétisés dans `src/ui/sfx.js`. L'audio PÉCAB original est optionnel dans `public/audio/pecab.mp3`.

## Organisation

- `src/state.js` : état de la carrière (stats, légende 0-1000, niveau réel 0-100, relations, drapeaux) et sauvegarde localStorage.
- `src/data/` : contenu (personnages…). Le texte et l'équilibrage vont dans les données, pas dans les scènes.
- `src/scenes/` : Boot → Menu → CharacterSelect → Match → Result.
- `src/ui/` : texte, contrôles tactiles, chope Légende, tampon PÉCAB, sons.

## Règles de design à respecter

- Toujours afficher un objectif officiel ; ne jamais afficher de chiffre de Légende (seulement la chope et un mot).
- Jouer bien fait monter le Niveau réel ; le recruteur de R3 apparaît à 40.
- Ton : trash mais bon enfant, jamais méchant ni dégueu. Noms de clubs, villages et PNJ inventés ; vraies marques seulement pour la garde-robe.

## Commandes

- `npm run dev` : serveur de développement
- `npm run build` : build de production dans `dist/`
