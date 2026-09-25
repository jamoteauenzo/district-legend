import { C } from '../palette.js';

// Les personnages jouables (voir la section « Les personnages jouables » du GDD).
// Stats sur 5. `talent` correspond au « Niveau réel » de départ.
export const CHARACTERS = [
  {
    id: 'kevin',
    nom: 'Kevin',
    surnom: 'La Fusée',
    profil: "Ailier. L'ancien espoir du club.",
    stats: { foie: 1, bide: 1, mauvaiseFoi: 2, tacle: 1, excuses: 2, talent: 5 },
    trait: {
      id: 'tropFort',
      nom: 'Trop fort',
      desc: 'Le recruteur de R3 arrive deux fois plus vite. Il va devoir apprendre à être nul.',
    },
    look: { hair: C.yellow, skin: C.skinLight },
  },
  {
    id: 'jordan',
    nom: 'Jordan',
    surnom: 'Le Frigo',
    profil: 'Défenseur central, 1m92.',
    stats: { foie: 3, bide: 3, mauvaiseFoi: 2, tacle: 5, excuses: 1, talent: 3 },
    trait: {
      id: 'masse',
      nom: 'Masse critique',
      desc: "Ses tacles envoient l'adversaire trois mètres plus loin. Les cartons tombent plus facilement.",
    },
    look: { hair: C.skinDark, skin: C.skinDark, bald: true, bide: true },
  },
  {
    id: 'dylan',
    nom: 'Dylan',
    surnom: 'Le Roi de la Nuit',
    profil: 'Milieu, beau gosse, DJ le samedi.',
    stats: { foie: 5, bide: 1, mauvaiseFoi: 3, tacle: 1, excuses: 4, talent: 3 },
    trait: {
      id: 'afterwork',
      nom: 'Afterwork',
      desc: 'Légende doublée en 3e mi-temps, mais il arrive en retard à un match sur deux.',
    },
    look: { hair: 0x3b2a1e, skin: C.skinMid },
  },
  {
    id: 'matheo',
    nom: 'Mathéo',
    surnom: 'Le Pistonné',
    profil: 'Attaquant, fils du président.',
    stats: { foie: 2, bide: 2, mauvaiseFoi: 5, tacle: 1, excuses: 3, talent: 2 },
    trait: {
      id: 'pistonne',
      nom: 'Fils à papa',
      desc: 'Jamais remplaçant, quoi qu\'il fasse. En échange, le vestiaire le déteste au départ.',
    },
    look: { hair: 0xb5562b, skin: C.skinLight },
  },
  {
    id: 'gege',
    nom: 'Tonton Gégé',
    surnom: 'La Légende',
    profil: '52 ans, licencié depuis 1991.',
    stats: { foie: 5, bide: 5, mauvaiseFoi: 5, tacle: 4, excuses: 5, talent: 1 },
    trait: {
      id: 'legende',
      nom: "Lui, c'est une légende",
      desc: 'Commence avec la chope à moitié pleine, mais chaque sprint peut finir en claquage.',
    },
    look: { hair: 0x9a9a9a, skin: C.skinLight, moustache: true, bide: true },
    secret: true,
  },
];

export const STAT_LABELS = [
  ['foie', 'Foie'],
  ['bide', 'Bide'],
  ['mauvaiseFoi', 'Mauvaise foi'],
  ['tacle', 'Tacle'],
  ['excuses', 'Excuses'],
  ['talent', 'Talent'],
];

export function getCharacter(id) {
  return CHARACTERS.find((c) => c.id === id);
}
