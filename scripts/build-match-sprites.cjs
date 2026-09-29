// Génère les sprites de match (vue de dessus) dans chaque tenue, à partir du
// générateur de personnages de la DA (DA/src/characters.js).
// Usage : node scripts/build-match-sprites.cjs
const fs = require('fs');
const path = require('path');
require('../DA/src/characters.js');
const DL = globalThis.DL;

// Maillot / liseré (README de la DA)
const KITS = {
  stclou: ['#2446B0', '#FFFFFF'],
  stegluse: ['#F0A28A', '#1D2747'],
  premouille: ['#E1341E', '#151515'],
  anciens: ['#F3E6C4', '#9C7A4E'],
  chasuble: ['#F2C94C', '#151515'],
  gardien: ['#3F5A26', '#F2C94C'],
};
const OUT = path.join(__dirname, '../public/assets/match');
fs.mkdirSync(OUT, { recursive: true });

const ids = Object.keys(DL.CHARS).filter((id) => id !== 'reporter');
let n = 0;
const write = (name, svg) => {
  // Taille explicite : le chargeur SVG de Phaser en a besoin
  fs.writeFileSync(path.join(OUT, name + '.svg'), svg.replace('width="100%" height="100%"', 'width="40" height="40"'));
  n++;
};
for (const id of ids) {
  write(id, DL.top(id, {}));
  for (const [kit, [k, t]] of Object.entries(KITS)) write(`${id}_${kit}`, DL.top(id, { kit: k, trim: t }));
}
console.log(`${n} sprites de match générés`);
