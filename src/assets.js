import { Z } from './view.js';

// Portraits (dialogues, cartes, interviews) : public/assets/portraits/{id}_{expr}.webp
// Sprites de match (vue de dessus) : public/assets/match/{id}[_{kit}].svg
export const EXPRS = ['neutre', 'fier', 'gueule', 'choque', 'rire'];

export const portraitKey = (id, expr = 'neutre') => `pt_${id}_${expr}`;
export const matchKey = (id, kit) => `mt_${id}${kit ? '_' + kit : ''}`;

// À appeler dans preload() : charge ce qui manque encore.
// list = ['coach', ['president', 'rire'], …] (un id seul = toutes les expressions)
export function loadPortraits(scene, list) {
  for (const item of list) {
    const [id, expr] = Array.isArray(item) ? item : [item, null];
    for (const e of expr ? [expr] : EXPRS) {
      const key = portraitKey(id, e);
      if (!scene.textures.exists(key)) scene.load.image(key, `assets/portraits/${id}_${e}.webp`);
    }
  }
}

// list = [['jordan', 'stclou'], ['loiseau'], …]
export function loadMatchSprites(scene, list) {
  for (const [id, kit] of list) {
    const key = matchKey(id, kit);
    if (!scene.textures.exists(key)) {
      scene.load.svg(key, `assets/match/${id}${kit ? '_' + kit : ''}.svg`, { width: 48 * Z, height: 48 * Z });
    }
  }
}

// Grain papier : bruit noir semi-transparent, tuilé sur tout l'écran.
export function makeGrain(scene) {
  if (scene.textures.exists('grain')) return;
  const size = 128;
  const tex = scene.textures.createCanvas('grain', size, size);
  const ctx = tex.getContext();
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = Math.random();
    const a = v < 0.55 ? 0 : Math.round((v - 0.55) * 2.2 * 255);
    img.data[i * 4] = 21;
    img.data[i * 4 + 1] = 21;
    img.data[i * 4 + 2] = 21;
    img.data[i * 4 + 3] = a;
  }
  ctx.putImageData(img, 0, 0);
  tex.refresh();
}
