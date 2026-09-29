# Handoff : District Legend — Direction artistique « L'Écho de Grandcour »

## Vue d'ensemble
Jeu web mobile en portrait 9:16 (taille logique 360 × 640), moteur Phaser 3 en JavaScript, jouable à une main. Ce dossier contient la direction artistique retenue (1c, « L'Écho de Grandcour » : flat graphique, presse locale, papier découpé), le générateur de personnages et tous les assets exportés.

## À propos des fichiers
- `reference/*.dc.html` sont des **maquettes de référence en HTML**. Il ne faut pas les intégrer telles quelles : elles montrent le rendu et le comportement attendus, à **recréer dans Phaser**. Pour les ouvrir, lancer un serveur local dans `reference/` (`npx serve reference`) puis ouvrir les fichiers dans le navigateur.
  - `District Legend Personnages.dc.html` : **la bible de référence**. On y trouve les règles de construction, les 17 planches personnages, la scène de dialogue, 3 maquettes d'intégration, la vue match et les exports.
  - `District Legend DA.dc.html` : l'étape 1 (les 3 directions). Seule la **1c** fait foi.
- `src/characters.js` est **du code de production réutilisable**. Il génère chaque personnage en SVG, calque par calque. On peut l'importer tel quel dans le jeu.
- `assets/` contient les exports prêts à l'emploi (SVG et PNG).

## Fidélité
**Haute fidélité** pour les couleurs, la typo, les personnages, les bulles et le timing des animations. Il faut reproduire les valeurs exactes données ici. Les éléments de HUD (score, joystick, boutons) sont également en haute fidélité, en suivant les maquettes 360 × 640.

## Design tokens

### Encres (palette fermée : 4 encres + papier)
| Rôle | Hex |
|---|---|
| Papier journal (fond UI) | `#EDE5D3` |
| Papier foncé (fonds secondaires, jauges vides) | `#D8CDB4` / `#E4DAC4` |
| Noir d'imprimerie (texte, ombres) | `#151515` |
| Rouge une / PÉCAB / alerte | `#E1341E` |
| Bleu Saint-Clou | `#2446B0` |
| Vert terrain / bande claire | `#7E9B45` / `#8BA851` |
| Boue | `#9C7A4E` |
| Saumon Sainte-Gluse | `#F0A28A` |
| Jaune tombola / carton jaune / chasubles | `#F2C94C` |
| Blanc (bulles, bord de découpe) | `#FFFFFF` |

Couleurs dérivées, réservées aux personnages :
- marine coach `#1D2747`
- orange chantier `#EC7A2E`
- vert gardien `#3F5A26`
- pastis `#F4E7A8`
- doudoune `#8A8A8A`
- métal `#C9C2B2`

Peaux : `#F6D2B4` `#F3CBA8` `#E9B794` `#D9A27E` `#B97A52` `#7A4A2E`.

**Règle d'ombre :** toutes les ombres sont faites en `#151515` avec une opacité de 13 à 30 %, jamais avec une nouvelle teinte.

### Équipes (maillot / liseré)
- US Saint-Clou : `#2446B0` / `#FFFFFF`
- AS Sainte-Gluse : `#F0A28A` / `#1D2747`
- Racing Pré-Mouillé : `#E1341E` / `#151515`
- Les Anciens : `#F3E6C4` / `#9C7A4E`
- Chasubles : `#F2C94C` / `#151515`

### Typographie (Google Fonts, licence OFL)
- **Anton** : titres, chiffres, score, noms de personnages, boutons. Toujours en MAJUSCULES, letter-spacing .01 à .04em.
- **Newsreader** (400/600, romain et italique) : textes, dialogues (italique), objectifs.
- Échelle en 360 × 640 :

| Usage | Police et corps |
|---|---|
| Score | Anton 26 |
| Noms d'équipe | Anton 17 |
| Boutons | Anton 15–16 |
| Bandeau de nom | Anton 20 |
| Bulle normale | Newsreader italique 19 / 1.25 |
| Bulle qui gueule | Anton 34 / 0.95 |
| Pensée | Newsreader italique 17 |
| Murmure | Newsreader italique 15 |
| Objectif | Newsreader italique 15, papier sur fond noir |

### Texture
- Grain papier global : bruit fractal (fréquence ~0.85), noir, environ 15 % d'opacité moyenne, en multiply.
- Décalage de repérage : les calques d'ombre sont décalés de 1,5 px / 1 px.
- Lignes de craie en pointillés irréguliers : `stroke-dasharray: 40 6 14 9 64 4 24 8`, 3 px, couleur `#EDE5D3`.

## Personnages

### Système (voir `src/characters.js`)
- Gabarit portrait **240 × 320**, viewBox d'export `-12 -10 264 336` (la marge accueille le bord de découpe).
- Tête centrée en (120, 100), qui occupe 40 à 45 % de la hauteur. Le bas du buste est déchiré à y = 306.
- 12 calques, dans cet ordre (du fond vers l'avant) :
  `cheveux_arriere`, `corps`, `maillot`, `ombres`, `tete`, `cheveux`, `yeux`, `sourcils`, `nez`, `bouche`, `moustache`, `accessoires`.
  - Kaiser (chien) ajoute un calque `oreilles`.
  - Le Reporter utilise `corps`, `telephone`, `main`, `effets`.
- 5 expressions : `neutre`, `fier`, `gueule`, `choque`, `rire`. Seuls `yeux`, `sourcils`, `bouche` et `moustache` changent d'une expression à l'autre.
- 17 ids : `kevin`, `jordan`, `dylan`, `matheo`, `gege`, `coach`, `president`, `jeanmi`, `fred`, `loiseau`, `recruteur`, `lea`, `mere`, `patron`, `momo`, `reporter`, `kaiser`.

### Découpe collée (traitement de chaque portrait)
1. Aplats sans contour.
2. Bord blanc : le masque alpha est dilaté de 5 px, puis rendu irrégulier par un déplacement de 9 px (feTurbulence baseFrequency .045, seed fixe par personnage).
3. Ombre portée pleine décalée de 4 px / 5 px, `#151515` à 30 %, puis grain.
4. À l'affichage, rotation entre −4° et +4°.

Ce traitement est déjà inclus dans les PNG exportés.

### API
```js
// characters.js définit window.DL (ou globalThis.DL)
DL.portrait(id, expr, { kit, trim, only, sil, cut, crop, w, exportIds }) // → chaîne SVG
DL.top(id, { kit, trim, w, exportIds })                                  // → chaîne SVG 40×40, vue de dessus
DL.CHARS, DL.EXPR, DL.LAYERS
```
- `only: 'bouche'` rend un calque seul, pour animer en couches séparées.
- `kit` et `trim` recolorent le maillot.
- `cut: false` supprime la découpe collée.
- `sil: true` rend l'ombre chinoise.
- Le fichier définit aussi les web components `<dl-char>` et `<dl-top>` (rendu en shadow DOM), pratiques pour les menus en DOM.

### Intégration Phaser recommandée
- **Dialogues, cartes, interviews :** charger `assets/png/portraits/x3/{id}_{expr}.png` (792 × 1008) et l'afficher à 250 × 320 environ en logique.
- **Animations de visage** (clignement, bouche qui parle) :
  - au boot, générer les calques voulus via `DL.portrait(id, e, {only, cut:false})` ;
  - les convertir en textures (`this.textures.addBase64` après rastérisation sur canvas, ou `load.svg` à partir d'un blob URL) ;
  - les empiler dans un Container.
- **En match :** `assets/png/match/x3/{id}.png` (120 × 120), affiché à 44 px.
  - Les recolorations d'équipe se génèrent via `DL.top(id, {kit, trim})` au démarrage.
  - Ne pas utiliser de tint : la couleur doit rester fidèle à la palette.

## Écrans et comportements décrits dans la bible

### Scène de dialogue (360 × 640, par-dessus le jeu)
- Le jeu se met en pause.
- Voile `rgba(21,21,21,.3)` sur le terrain uniquement : de y = 50 (sous la barre de score) à y = 470.
- **Les 170 px du bas (commandes) ne sont jamais couverts.** Le bouton d'action devient « SUITE ».
- Personnage de 250 × 320, ancré à droite à −50 px (il déborde du cadre), top 150, rotation −2°. Il entre par la gauche s'il répond.
- Bandeau de nom : fond `#151515`, texte Anton 20 `#EDE5D3`, padding 4/12, rotation −3°, à right 92 / top 436.
- Bulle : left 14, top 90, largeur 206.

Les 4 bulles :
- **Normale :** fond blanc, padding 14/16, ombre `3px 4px 0 rgba(21,21,21,.3)`, rotation −2°, pointe triangulaire orientée vers la bouche.
- **Qui gueule :** polygone en éclat `#E1341E`, texte Anton 34 papier, rotation −4°, tremblement de l'écran de 3 px.
- **Pensée :** blanc, border-radius 48, texte `#3A3A3A`, pointe faite de 2 ronds (18 et 10 px).
- **Murmure :** fond papier, bord 2 px en pointillés `#151515`, radius 14, texte `#4A4A4A` 15 px.

### Timing entrée / sortie
| t (ms) | Événement |
|---|---|
| 0 | Voile 0 → 1 en 150 ms |
| 0–320 | Personnage : `translateX(120%) rotate(10°)` → `(-6%, -6°)` à 60 % → `(0, -2°)`, easing `cubic-bezier(.2,.8,.3,1)` |
| 260–460 | Nom : scale 1.8 → 0.94 → 1, opacité 0 → 1 |
| 280 | Tremblement de l'écran : 180 ms, 1,5 px (3 px si la bulle gueule) |
| 380–640 | Bulle : scale .5 → 1.07 → 1, origine sur la pointe (85 % 100 %) |
| Sortie (au tap) | Bulle et nom en 120 ms, personnage → `translateX(120%) rotate(8°)` en 220 ms ease-in, voile qui s'efface en 200 ms |

### Carte de décision (façon Reigns)
- En-tête : « L'ÉCHO DE GRANDCOUR » (Anton 15) et la date (Newsreader italique 12), filet de 2 px.
- 5 jauges verticales de 26 × 44, fond `#D8CDB4`, remplissage `#E1341E` : Coach, Vestiaire, Président, Famille, District.
- Carte de 256 × 290, légère rotation, fond blanc. Le portrait déborde de 52 px au-dessus. Bandeau de nom noir de 46 px en bas.
- Swipe : au-delà de 80 px la carte est validée, avec une rotation de dx/16 degrés. Les étiquettes de choix apparaissent à dx/70.

### Duel de chambrage (buvette la nuit)
- Fond `#1F1D1A`, guirlande d'ampoules jaune, rouge, papier et bleu.
- Adversaire en haut à droite, joueur en miroir en bas à gauche.
- Cartouches d'ego en papier avec une barre rouge (adversaire) ou bleue (joueur).
- Menu de 4 vannes en bas (hauteur 130).
- Sur un coup réussi : l'adversaire passe à l'expression `choque`, secousse de 380 ms, la barre descend en 500 ms.

### Match (vue de dessus)
Voir `reference/District Legend DA.dc.html`, direction 1c :
- terrain en bandes `#7E9B45` / `#8BA851`, boue devant les buts, panneaux de sponsors ;
- barre de score papier de 50 px en haut ;
- joystick en bas à gauche (112 px) ;
- 2 boutons en bas à droite (66 et 88 px), ombre `3px 3px 0 #151515`.

## Fichiers
- `reference/District Legend Personnages.dc.html` : la bible des personnages et des dialogues.
- `reference/District Legend DA.dc.html` : les 3 directions (seule la 1c fait foi).
- `src/characters.js` : générateur de personnages, à intégrer au jeu.
- `assets/svg/portraits/{id}_{expr}.svg` : 85 SVG avec des calques nommés (`<g id="bouche">`…).
- `assets/svg/match/{id}.svg` : 16 sprites de match.
- `assets/png/portraits/x2|x3/` et `assets/png/match/x2|x3/` : les PNG.

## Pas encore produit
Les maquettes des écrans suivants restent à faire :
- menu principal, choix du personnage, programme WhatsApp ;
- 10 mini-jeux, feuille de fin de match, interview du Reporter, fin de chapitre ;
- kit d'interface complet (chope, tampon PÉCAB) : il est seulement esquissé dans la 1c ;
- poses d'animation en match (course, tacle, chute, célébration, contestation) ;
- icône et visuel de partage.
