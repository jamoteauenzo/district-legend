# District Legend

Jeu mobile en pixel art : fais la meilleure carrière de footballeur de district possible, de 18 à 40 ans. Le jeu ne te dit jamais que le but est d'être nul.

Game design complet : [document de game design](https://claude.ai/code/artifact/26fbcd9c-20ba-417f-b81e-75b7f7047459).

## Jouer en local

```bash
npm install
npm run dev
```

Ouvre l'adresse affichée (`http://localhost:5173`). Pour tester sur ton téléphone, ouvre l'adresse « Network » depuis le même Wi-Fi.

Au clavier : flèches ou ZQSD pour bouger, `X` ou `Espace` pour le bouton rouge, `C` pour le bouton jaune.

## Mettre en ligne (Vercel)

Importe ce dépôt sur [vercel.com/new](https://vercel.com/new). Vercel détecte Vite tout seul : aucune configuration à faire. Chaque envoi sur `main` met le jeu à jour.

## Le son PÉCAB

Dépose le fichier audio dans `public/audio/pecab.mp3`. Le jeu le détecte au lancement et l'utilise à chaque tampon PÉCAB. Sans fichier, un bruit de tampon le remplace.

## Contenu de la v0.2

- Menu façon feuille de match
- Choix du personnage (4 jouables + Tonton Gégé, secret)
- Le Match : joystick, tacle, tir, passe, contestation, cartons, bonus au bord du terrain, recruteur de R3
- La glissade scriptée devant le but vide (le déclic) et le tampon PÉCAB
- Écran de fin de match avec les stats absurdes et la chope Légende
- Sauvegarde automatique sur le téléphone
- Musique chiptune jouée en direct : thème du menu et « Hymne du District » en match, fanfare de fin de match
- Bruitages : sifflet, frappe, glissade, impact, public (murmure, « ooh », rires, huées, ovation), glou-glou, merguez, alarme de voiture, Kaiser, recruteur
- Bouton pour couper le son (retenu d'une partie à l'autre)
