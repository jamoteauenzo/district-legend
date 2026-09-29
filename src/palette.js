// Palette de la DA « L'Écho de Grandcour » : 4 encres + papier (voir DA/README.md).
export const C = {
  paper: 0xede5d3,
  paperDark: 0xd8cdb4,
  paperMid: 0xe4dac4,
  ink: 0x151515,
  red: 0xe1341e,
  blue: 0x2446b0,
  green: 0x7e9b45,
  greenLight: 0x8ba851,
  mud: 0x9c7a4e,
  salmon: 0xf0a28a,
  yellow: 0xf2c94c,
  white: 0xffffff,
  navy: 0x1d2747,
  orange: 0xec7a2e,
  gkGreen: 0x3f5a26,
  pastis: 0xf4e7a8,
  grey: 0x8a8a8a,
  metal: 0xc9c2b2,
  night: 0x1f1d1a,
  cream: 0xf3e6c4,
};

// Alias gardés pour le code existant
Object.assign(C, {
  grass: C.greenLight,
  grassDark: C.green,
  chalk: C.paper,
  outline: C.ink,
  beer: C.yellow,
  prefab: C.paperDark,
  sky: C.paperDark,
  skinLight: 0xf3cba8,
  skinMid: 0xd9a27e,
  skinDark: 0x7a4a2e,
  gkPurple: C.gkGreen,
});

export const CSS = {
  paper: '#EDE5D3',
  paperDark: '#D8CDB4',
  ink: '#151515',
  red: '#E1341E',
  blue: '#2446B0',
  yellow: '#F2C94C',
  white: '#FFFFFF',
  grey: '#6E675A',
  greyLight: '#A39C8C',
  navy: '#1D2747',
  // Alias
  cream: '#EDE5D3',
  chalk: '#EDE5D3',
  outline: '#151515',
  beer: '#F2C94C',
  sky: '#A39C8C',
  night: '#1F1D1A',
};

// Tenues d'équipe (maillot / liseré) : nom de kit utilisé pour les sprites
export const KITS = {
  stclou: 'stclou',
  stegluse: 'stegluse',
  premouille: 'premouille',
  anciens: 'anciens',
  chasuble: 'chasuble',
  gardien: 'gardien',
};
