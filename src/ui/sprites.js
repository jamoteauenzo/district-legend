import { C } from '../palette.js';
import { CHARACTERS } from '../data/characters.js';

// Sprites provisoires dessinés pixel par pixel (10 × 15), affichés ×2.
// H cheveux · S peau · E yeux · J maillot · N numéro · P short · W chaussettes · K crampons · M moustache
const BODY = [
  '...HHHH...',
  '..HHHHHH..',
  '..HSSSSH..',
  '..SESSES..',
  '...SSSS...',
  '....SS....',
  '.JJJJJJJJ.',
  'SJJJNNJJJS',
  'SJJJJJJJJS',
  'S.JJJJJJ.S',
  '..PPPPPP..',
  '..PP..PP..',
  '..SS..SS..',
  '..WW..WW..',
  '..KK..KK..',
];

function paint(scene, key, rows, colors) {
  const g = scene.add.graphics();
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const col = colors[ch];
      if (col === undefined) return;
      g.fillStyle(col, 1);
      g.fillRect(x, y, 1, 1);
    });
  });
  g.generateTexture(key, rows[0].length, rows.length);
  g.destroy();
}

function player(scene, key, look) {
  const rows = BODY.slice();
  if (look.bald) {
    rows[0] = '...SSSS...';
    rows[1] = '..SSSSSS..';
    rows[2] = '..SSSSSS..';
  }
  if (look.moustache) rows[4] = '...MMMM...';
  if (look.glasses) rows[3] = '..EEEEEE..';
  if (look.bide) rows[9] = '.JJJJJJJJ.';
  paint(scene, key, rows, {
    H: look.hair,
    M: look.hair,
    S: look.skin,
    E: C.outline,
    J: look.jersey,
    N: look.number ?? C.cream,
    P: look.shorts,
    W: look.socks,
    K: C.outline,
  });
}

export function makeTextures(scene) {
  const teamA = { jersey: C.blue, shorts: C.cream, socks: C.blue };
  const teamB = { jersey: C.salmon, shorts: C.navy, socks: C.salmon };

  CHARACTERS.forEach((c) => player(scene, `p_${c.id}`, { ...c.look, ...teamA }));

  player(scene, 'mate1', { hair: 0x3b2a1e, skin: C.skinMid, ...teamA });
  player(scene, 'mate2', { hair: C.outline, skin: C.skinDark, ...teamA });
  player(scene, 'mate3', { hair: 0xb5562b, skin: C.skinLight, bide: true, ...teamA });
  player(scene, 'mateGK', { hair: 0x6b4a2f, skin: C.skinLight, jersey: C.gkGreen, shorts: C.outline, socks: C.gkGreen });

  player(scene, 'opp1', { hair: C.outline, skin: C.skinMid, ...teamB });
  player(scene, 'opp2', { hair: 0xe8e4d4, skin: C.skinLight, bide: true, ...teamB });
  player(scene, 'opp3', { hair: 0x3b2a1e, skin: C.skinDark, ...teamB });
  player(scene, 'opp4', { hair: C.yellow, skin: C.skinLight, ...teamB });
  player(scene, 'oppGK', { hair: C.outline, skin: C.skinLight, moustache: true, jersey: C.gkPurple, shorts: C.outline, socks: C.gkPurple });

  player(scene, 'ref', { hair: 0x6b4a2f, skin: C.skinLight, moustache: true, jersey: C.outline, number: C.yellow, shorts: C.outline, socks: C.outline });
  player(scene, 'recruiter', { hair: C.outline, skin: C.skinLight, glasses: true, jersey: 0x2b2b2b, number: 0x2b2b2b, shorts: 0x3a3a5a, socks: 0x3a3a5a });

  paint(scene, 'ball', ['.WW.', 'WWWW', 'WWKW', '.WW.'], { W: C.cream, K: C.outline });
  paint(scene, 'merguez', ['.RRRRRR.', 'RRRRRRRR', '.RRRRRR.'], { R: 0x8e3b24 });
  paint(scene, 'canette', ['.SS.', 'RRRR', 'RWWR', 'RRRR', 'RRRR', '.SS.'], { S: 0xbbbbbb, R: C.red, W: C.cream });
  paint(scene, 'ricard', ['.KK.', '.YY.', 'YYYY', 'YBBY', 'YYYY', 'YYYY', 'YYYY', 'YYYY'], { K: C.outline, Y: C.yellow, B: C.blue });
  paint(scene, 'cardYellow', ['YYYY', 'YYYY', 'YYYY', 'YYYY', 'YYYY', 'YYYY'], { Y: C.yellow });
  paint(scene, 'cardRed', ['RRRR', 'RRRR', 'RRRR', 'RRRR', 'RRRR', 'RRRR'], { R: C.red });
  paint(scene, 'dog', ['......KK', '.....KKK', 'KBBBBBBK', 'BBBBBBB.', 'B.B..B.B'], { K: 0x3b2a1e, B: 0x8e5b34 });
}
