import { C } from '../palette.js';
import { Z } from '../view.js';
import { CHARACTERS } from '../data/characters.js';

// Sprites du jeu (DA 1c).
// - Personnages : sprites de match de la DA (vue de dessus), chargés en SVG
//   sous les noms historiques du code ('p_kevin', 'mate1', 'ref'…).
// - Objets : dessinés en aplats, sans contour, ombre pleine.
//
// Les scènes créent les images avec fit(image, k) : k est l'ancienne échelle,
// fit() la convertit selon la résolution de la texture.

const CHAR_TEX = 48 * Z; // taille des textures de personnages (px)
const CHAR_SIZE = 22; // taille logique pour k = 1 (44 px pour k = 2)
const ITEM_RES = 2 * Z; // résolution des objets par « pixel » historique

// Correspondance nom historique → fichier de public/assets/match
const LEGACY = {
  mate1: 'fred',
  mate2: 'momo_stclou',
  mate3: 'patron_stclou',
  mateGK: 'fred',
  opp1: 'momo_stegluse',
  opp2: 'patron_stegluse',
  opp3: 'gege_stegluse',
  opp4: 'president_stegluse',
  oppGK: 'jordan_gardien',
  cup1: 'momo_premouille',
  cup2: 'patron_premouille',
  cup3: 'gege_premouille',
  cup4: 'president_premouille',
  cupGK: 'dylan_gardien',
  anc1: 'gege_anciens',
  anc2: 'president_anciens',
  anc3: 'patron_anciens',
  ancJeanmi: 'jeanmi_anciens',
  ancGK: 'momo_gardien',
  bibJeanmi: 'jeanmi_chasuble',
  bibEnzo: 'momo_chasuble',
  bib3: 'patron_chasuble',
  bib4: 'gege_chasuble',
  ref: 'loiseau',
  coach: 'coach',
  recruiter: 'recruteur',
  dog: 'kaiser',
};

// À appeler dans le preload() du Boot
export function loadSprites(scene) {
  const files = { ...LEGACY };
  for (const c of CHARACTERS) files[`p_${c.id}`] = `${c.id}_stclou`;
  for (const [key, file] of Object.entries(files)) {
    scene.load.svg(key, `assets/match/${file}.svg`, { width: CHAR_TEX, height: CHAR_TEX });
  }
}

const isChar = (key) => key in LEGACY || key.startsWith('p_');

// Met une image à la bonne taille : k = ancienne échelle (2 = taille de jeu)
export function fit(img, k = 2, ky = null) {
  const unit = isChar(img.texture.key) ? CHAR_SIZE / CHAR_TEX : 1 / ITEM_RES;
  return img.setScale(k * unit, (ky ?? k) * unit);
}

export function unitOf(key) {
  return isChar(key) ? CHAR_SIZE / CHAR_TEX : 1 / ITEM_RES;
}

// Dessine une texture à partir d'une fonction (coordonnées en « pixels
// historiques », multipliées par ITEM_RES pour la netteté).
function draw(scene, key, w, h, fn) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const g = scene.add.graphics();
  const R = ITEM_RES;
  fn({
    fill: (c, a = 1) => g.fillStyle(c, a),
    rect: (x, y, ww, hh) => g.fillRect(x * R, y * R, ww * R, hh * R),
    rrect: (x, y, ww, hh, r) => g.fillRoundedRect(x * R, y * R, ww * R, hh * R, r * R),
    circle: (x, y, r) => g.fillCircle(x * R, y * R, r * R),
    ellipse: (x, y, ww, hh) => g.fillEllipse(x * R, y * R, ww * R, hh * R),
    tri: (x1, y1, x2, y2, x3, y3) => g.fillTriangle(x1 * R, y1 * R, x2 * R, y2 * R, x3 * R, y3 * R),
  });
  g.generateTexture(key, Math.ceil(w * R), Math.ceil(h * R));
  g.destroy();
}

export function makeTextures(scene) {
  // Ballon : blanc, taches noires, ombre
  draw(scene, 'ball', 5, 5, (d) => {
    d.fill(C.ink, 0.3);
    d.circle(2.7, 2.8, 2);
    d.fill(C.white);
    d.circle(2.3, 2.3, 2);
    d.fill(C.ink);
    d.circle(2.3, 2.3, 0.6);
    d.circle(1.2, 1.6, 0.35);
    d.circle(3.3, 1.5, 0.35);
    d.circle(1.7, 3.5, 0.35);
    d.circle(3.2, 3.3, 0.35);
  });
  draw(scene, 'merguez', 9, 4, (d) => {
    d.fill(C.ink, 0.3);
    d.rrect(0.6, 0.9, 8, 2.8, 1.4);
    d.fill(0x8e3b24);
    d.rrect(0, 0.4, 8, 2.8, 1.4);
    d.fill(C.white, 0.35);
    d.rrect(1, 0.9, 5, 0.6, 0.3);
  });
  draw(scene, 'canette', 5, 7, (d) => {
    d.fill(C.ink, 0.3);
    d.rrect(1, 1, 4, 6, 0.8);
    d.fill(C.metal);
    d.rrect(0.5, 0.3, 3.5, 6, 0.8);
    d.fill(C.red);
    d.rect(0.5, 1.3, 3.5, 4);
    d.fill(C.white);
    d.rect(1.2, 2.6, 2, 1.2);
  });
  draw(scene, 'ricard', 5, 9, (d) => {
    d.fill(C.ink, 0.3);
    d.rrect(1, 3, 4, 6, 0.8);
    d.fill(C.pastis);
    d.rrect(0.5, 2.5, 3.5, 6, 0.8);
    d.rect(1.3, 0.3, 1.9, 2.5);
    d.fill(C.blue);
    d.rect(0.5, 4.3, 3.5, 2);
    d.fill(C.yellow);
    d.circle(2.25, 5.3, 0.6);
  });
  draw(scene, 'cardYellow', 4, 6, (d) => {
    d.fill(C.ink, 0.3);
    d.rect(0.5, 0.5, 3.5, 5.5);
    d.fill(C.yellow);
    d.rect(0, 0, 3.5, 5.5);
  });
  draw(scene, 'cardRed', 4, 6, (d) => {
    d.fill(C.ink, 0.3);
    d.rect(0.5, 0.5, 3.5, 5.5);
    d.fill(C.red);
    d.rect(0, 0, 3.5, 5.5);
  });
  draw(scene, 'coupelle', 7, 3, (d) => {
    d.fill(C.ink, 0.3);
    d.ellipse(3.8, 2, 6, 2);
    d.fill(C.orange);
    d.ellipse(3.3, 1.5, 6, 2);
    d.fill(C.ink, 0.25);
    d.ellipse(3.3, 1.3, 2, 0.8);
  });
  draw(scene, 'plot', 5, 6, (d) => {
    d.fill(C.ink, 0.3);
    d.ellipse(2.8, 5.3, 4.6, 1.4);
    d.fill(C.orange);
    d.tri(2.5, 0.2, 0.6, 5, 4.4, 5);
    d.fill(C.white);
    d.rect(1.5, 2.6, 2, 0.8);
  });
  draw(scene, 'phone', 3, 4, (d) => {
    d.fill(C.ink);
    d.rrect(0, 0, 2.6, 3.8, 0.4);
    d.fill(C.blue);
    d.rect(0.3, 0.4, 2, 2.8);
  });
}
