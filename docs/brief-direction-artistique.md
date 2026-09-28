# Brief direction artistique — District Legend

Tu es directeur artistique de jeu vidéo. J'ai besoin que tu crées la direction artistique complète d'un jeu mobile, avant qu'on code quoi que ce soit.

## Le jeu en une phrase

**District Legend** : tu as 18 ans, ta carrière pro est derrière toi, et tu dois devenir une légende… du football de district. Le jeu inverse les codes des jeux de foot : on ne gagne pas en étant bon, on gagne en étant le joueur le plus « district » possible. Mais le jeu ne le dit jamais : le joueur le comprend tout seul.

## Le ton

- Humour trash mais bon enfant, jamais méchant ni dégueulasse. Une déclaration d'amour moqueuse au foot amateur français.
- L'univers : le club de village le dimanche à 15h, la buvette dans un préfabriqué, le Ricard du président, les merguez, la main courante rouillée, un projecteur sur quatre qui marche, le parking en gravier, le chien du terrain, le groupe WhatsApp des seniors B, la 3e mi-temps.
- Inspiration directe : un compte Instagram qui filme des joueurs de district et leur demande ce qu'ils ont bu la veille (« 5 pintes, 3 Ricard… »), et valide chaque réponse d'un « PÉCAB ». Cette réplique est le gimmick du jeu : un tampon « PÉCAB » s'écrase à l'écran à chaque exploit.
- Références d'humour : la BD franco-belge d'humour (Fluide Glacial, Gotlib, Les Bidochon, Titeuf), Groland, les pages sport de la presse locale.

## Ce que je veux (et ce que je ne veux plus)

- **Je ne veux plus de pixel art rétro.** Je veux une vraie DA de jeu vidéo moderne, avec de la profondeur, du caractère et de la finition. Quelque chose qu'on a envie de partager en story.
- Des personnages expressifs et caricaturaux (bides, moustaches, bandeaux, chaussettes baissées), avec de la tendresse.
- Un univers reconnaissable au premier coup d'œil par n'importe quel joueur ou ancien joueur de district.
- Pistes que j'imagine (à challenger) : 2D illustrée façon BD moderne avec gros contours, ou cartoon stylisé façon jeux mobiles premium (Brawl Stars, Clash Royale), ou flat illustré très graphique façon Reigns / Untitled Goose Game. Propose-moi **3 directions distinctes** avant d'en approfondir une.

## Contraintes techniques (important)

- Jeu **web mobile**, format **portrait 9:16**, jouable à une main. Taille logique de l'écran : 360 × 640, affichée en plein écran sur téléphone.
- Moteur **2D** (Phaser, JavaScript). Pas de 3D temps réel. Les assets seront des **PNG avec transparence** (sprites, sprite sheets) ou du **SVG**.
- Je développe seul avec une IA : la DA doit être **produisible et déclinable**. Il faut donc des personnages modulaires (corps + tête + coiffure + maillot recoloriable), un nombre d'animations limité et des décors réutilisables.
- Deux échelles de personnages :
  - **En match**, vue de dessus, avec des joueurs petits (environ 40 à 60 px de haut à l'écran) qui doivent rester lisibles : silhouette claire, couleur d'équipe évidente.
  - **En portrait**, pour les cartes de décision, les interviews et les dialogues : grands bustes expressifs.
- Animations nécessaires en match : attente, course, tacle glissé, chute, célébration, contestation (bras en l'air).
- L'interface doit laisser la place à un joystick virtuel en bas à gauche et à deux gros boutons d'action en bas à droite.

## Les personnages

Joueurs jouables, tous 18 ans, sortis des U19 Régional :

- **Kevin « La Fusée »** : ailier, l'ancien espoir, blond, trop fort pour le district.
- **Jordan « Le Frigo »** : défenseur central, 1m92, crâne rasé, masse.
- **Dylan « Le Roi de la Nuit »** : milieu, beau gosse, DJ le samedi.
- **Mathéo « Le Pistonné »** : attaquant, roux, fils du président.
- **Tonton Gégé** (secret) : 52 ans, licencié depuis 1991, moustache, bide légendaire.

Personnages non jouables :

- **Coach Gérard** : survêtement trop grand, sifflet, diplôme de 1994.
- **Le président** : chauve, bide, polo, sacoche banane, tient la buvette.
- **Jean-Mi** : capitaine de 38 ans avec un bandeau éponge. C'est le boss du chapitre 1.
- **Fred** : le gardien toujours en retard.
- **M. Loiseau** : l'arbitre bénévole à moustache.
- **Le recruteur de R3** : lunettes de soleil et doudoune sans manches. C'est le seul vrai « danger » du jeu.
- **Kaiser** : le chien du terrain.
- **Léa** (la copine potentielle), **la mère**, **le patron**, **Momo** (le pote de la salle de muscu).
- **Le Reporter** : on ne voit jamais son visage, seulement son téléphone.

Équipes : **US Saint-Clou** (bleu roi et blanc), **AS Sainte-Gluse**, le rival (rose saumon et marine), **Racing Pré-Mouillé** en Coupe de France (rouge et noir), **les Anciens** (maillots crème vintage de 1998), les chasubles jaunes de l'entraînement.

## Les écrans à designer

1. **Menu principal**, façon feuille de match.
2. **Choix du personnage** : une carte par joueur, avec stats (Foie, Bide, Mauvaise foi, Tacle, Excuses, Talent) et un trait spécial.
3. **Programme de la semaine** : parodie de conversation WhatsApp du groupe « Seniors B », le coach liste les séances.
4. **Le match**, vue de dessus : terrain de district fatigué (boue devant les buts, lignes de craie usées, panneaux de sponsors locaux « Boucherie Morel », « Garage Dupuis », « Le Balto »), score et chrono en haut, joystick et boutons en bas.
5. **Les entraînements**, 10 mini-jeux : le 30/30 (le coach regarde son téléphone), les jongles vus de côté, le circuit de coupelles, la finition sur centres, les étirements, le toro, la corvée de plots, le gonflage des ballons, l'opposition en chasubles, les tirs au but.
6. **La feuille de fin de match** : le score officiel, que personne ne regarde, et les vraies stats absurdes (distance parcourue 340 m, contestations 14, merguez 3).
7. **L'interview du Reporter** : parodie de story Instagram. Le joueur filmé devant le club-house, la question en sous-titre (« T'as bu quoi hier ? »), la réponse composée en 3 morceaux, un compteur de vues.
8. **Les cartes de décision** façon Reigns : une carte avec le portrait d'un personnage, on la glisse à gauche ou à droite, avec 5 jauges de relation en haut (Coach, Vestiaire, Président, Famille, District).
9. **Le duel de chambrage** contre le boss, à la buvette la nuit sous une guirlande lumineuse, en tour par tour façon Pokémon avec des barres d'ego.
10. **La fin de chapitre** : une page de la presse locale, *L'Écho de Grandcour*.

## Les éléments d'interface signature

- **La chope de bière** : c'est la jauge cachée « Légende ». Elle se remplit sans aucun chiffre, et c'est le vrai score du jeu. Elle doit être iconique.
- **Le tampon PÉCAB** : rouge, penché, il s'écrase à l'écran avec un tremblement. C'est le moment le plus partagé du jeu.
- **L'objectif officiel**, toujours affiché (« Objectif : gagne le match »), alors que le jeu récompense l'inverse.
- Les cartons jaunes et rouges, le sifflet, la feuille de match, les post-its du tableau blanc du vestiaire.

## Ce que j'attends de toi

1. **3 directions artistiques** différentes, chacune avec : un nom, un moodboard, des références, une palette, une typographie et un exemple de l'écran de match et d'une carte de décision.
2. Pour la direction retenue :
   - la **palette complète** (couleurs d'univers, d'équipes, d'interface, des états) ;
   - la **typographie** (titres, textes, chiffres), avec des polices libres de droits ;
   - la **planche de personnages** : les 5 jouables et les principaux PNJ, en version portrait et en version match (vue de dessus), avec les règles de construction pour décliner facilement ;
   - le **kit d'interface** : boutons, cartes, jauges, bulles de dialogue, la chope, le tampon PÉCAB, les icônes ;
   - les **maquettes des 10 écrans** listés plus haut, au format 9:16 ;
   - les **principes d'animation et d'effets** (impacts, particules, transitions, feedback des gains cachés) ;
   - une **icône d'application** et un **visuel de partage** pour les réseaux.
3. Des indications de **production** : format et taille des fichiers, découpage en sprite sheets, ce qui peut être généré ou décliné, et ce qui doit être fait à la main.

Pose-moi des questions si un point n'est pas clair avant de te lancer.
