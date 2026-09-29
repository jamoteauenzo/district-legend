# Brief compléments DA — direction 1c « L'Écho de Grandcour »

Deuxième commande à Claude Design, après intégration de la v0.8 (tout le jeu tourne déjà avec le dossier `DA/`).
But : combler ce qui manque pour que le jeu soit complet et cohérent. Prompt à copier-coller tel quel.

---

## Prompt

Tu as déjà créé la DA de **District Legend** (direction 1c « L'Écho de Grandcour » : flat graphique, presse locale, papier découpé) et les 17 personnages (portraits 5 expressions + versions de match vues de dessus). Tout est intégré dans le jeu. Je te joins le dossier `DA/` que tu m'as livré et des captures du jeu actuel.

**Rappel du jeu.** Jeu mobile humoristique (Phaser, portrait 9:16). Tu fais la carrière d'un footballeur de district, le foot amateur français. Le jeu te fait croire qu'il faut être bon, mais le vrai score caché, la « Légende », monte quand tu es un cliché du district : tacles en retard, contestations, merguez au bord du terrain, excuses bidon. Quand tu fais un exploit bien district, un gros tampon rouge **PÉCAB** tombe sur l'écran.

**Ne change rien à ce qui existe** : palette, typos (Anton pour les titres, Newsreader pour les textes), grain, ombres pleines, style des portraits et des bulles. Tout ce que tu crées doit se poser à côté sans qu'on voie la différence.

Contraintes techniques : écran logique **360 × 640**, affiché en ×2. Exports **SVG** (calques nommés) et **PNG ×2**. Pour tout ce qui est personnage, étends si possible `characters.js` (même principe que `DL.top(id, {kit})`) plutôt que de livrer des images figées : je génère les fichiers depuis ton code.

### 1. Animations de match (vue de dessus) — priorité 1

Aujourd'hui les joueurs glissent sur le terrain sans bouger. Il me faut des poses pour les sprites vus de dessus (même taille, 40 × 40, même tenues : stclou, stegluse, premouille, anciens, chasuble, gardien) :

- **course** : 4 images en boucle (jambes et bras qui alternent)
- **tacle glissé** : 2 images (départ, glisse jambe tendue)
- **frappe** et **passe** : 2 images chacune
- **au sol** : allongé après une faute ou une simulation, avec les bras en croix
- **contestation** : bras levés vers l'arbitre (2 images qui s'agitent)
- **célébration** : bras en l'air, et la version genoux au sol
- **gardien** : plongeon à gauche et à droite, ballon capté
- **boude** : assis en tailleur, bras croisés
- **arbitre** : sort un carton (jaune, rouge), siffle
- **coach** au bord du terrain : regarde son téléphone, gueule mains en porte-voix

Donne une API du genre `DL.top(id, {kit, pose: 'course', frame: 2})`.

### 2. Personnages en pied, vue de côté — priorité 1

Trois mini-jeux sont vus de côté (jongles, étirements, tirs au but) et je n'ai que des portraits en buste. Il me faut les **5 joueurs jouables + le coach** en pied, même style découpé collé, hauteur environ 360 px en ×2 :

- **Jongles** : debout, pied gauche qui frappe, pied droit qui frappe, ballon raté (déséquilibre)
- **Étirements** : bras en l'air, toucher les pieds, quadriceps gauche, quadriceps droit, allongé par terre (la sieste), et la pose « claquage » (se tient la cuisse)
- **Tirs au but** : le tireur de dos, élan puis frappe ; Fred (gardien) de face, prêt, plongeon gauche, plongeon droit
- Le coach fait les mêmes postures d'étirement, en survêt, avec son sifflet

Visages en 5 expressions comme les portraits (neutre, fier, gueule, choque, rire), idéalement tête séparée du corps pour que je combine.

### 3. Maquettes des écrans qui n'en ont pas — priorité 2

Je les ai faites moi-même d'après ton style, reprends-les et améliore-les (captures jointes) :

1. **Menu** : une de journal *L'Écho de Grandcour*, titre DISTRICT LEGEND, boutons Nouvelle carrière / Continuer
2. **Choix du joueur** : cartes des 5 persos (portrait, nom, jauges de stats, trait de caractère), Tonton Gégé caché tant qu'il n'est pas débloqué
3. **Programme de la semaine** : groupe WhatsApp du coach (« Seniors B Saint-Clou ⚽🍺 »), messages, étapes de la semaine
4. **HUD des entraînements** : bandeau titre + chrono, objectif officiel, chope Légende, gros boutons ronds ; montre-le sur 3 mini-jeux (le 30/30 avec la buvette, le toro en cercle, le gonflage des ballons dans le local matériel)
5. **Feuille de fin** (match et entraînement) : style page de journal, stats absurdes, phrase du coach
6. **Interview du Reporter** : format story Instagram, question, 3 réponses, compteur de vues
7. **Fin de chapitre** : article qui résume ta carrière, photo, Tonton Gégé débloqué
8. **Tampon PÉCAB** : l'animation d'arrivée (écrasement, éclaboussures d'encre), en 3 ou 4 étapes

### 4. Décors — priorité 2

Éléments posables, vus de dessus (sauf mention), mêmes aplats :

- buvette (auvent rayé rouge et blanc), club-house, parking avec 3 voitures cabossées, local matériel (intérieur : filets à ballons, chasubles, pompe), main courante avec le public, banc de touche, poteau de corner
- **vue de côté** pour les jongles : façade du club-house avec sa vitre, parking, ciel, pelouse
- objets : plot, coupelle, échelle de rythme, mini-cage, sac à plots, pompe, manomètre, merguez, canette, Ricard, carton jaune ou rouge, téléphone

### 5. Kit UI — priorité 3

Une planche avec tous les composants et leurs états (normal, appuyé, désactivé) : bouton rectangulaire, bouton rond (grand rouge, moyen bleu, jaune), joystick, étiquette noire (compteurs), chrono, bandeau d'objectif, chope Légende (vide → pleine, qui déborde), jauges de relations, barre de puissance, bulles (4 types).

### 6. Icône et habillage — priorité 3

- Icône d'appli (1024 × 1024 + masque arrondi), favicon 32 px
- Écran de chargement
- Image de partage 1200 × 630 (quand on envoie le lien)

### Livrables

Même structure que le dossier `DA/` actuel : `src/characters.js` mis à jour, `assets/svg` et `assets/png` rangés par section (poses-match, en-pied, ecrans, decors, ui, icone), et un `README.md` qui liste les nouveautés, les dimensions et les ancres (point de pied, centre de rotation) de chaque élément.
