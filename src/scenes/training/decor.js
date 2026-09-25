import { txt } from '../../ui/text.js';
import { C, CSS } from '../../palette.js';

// Éléments de décor partagés par les entraînements.

export function grass(scene, height = 640, band = 40) {
  const g = scene.add.graphics().setDepth(0);
  for (let i = 0; i * band < height; i++) {
    g.fillStyle(i % 2 ? C.grass : C.grassDark, 1);
    g.fillRect(0, i * band, 360, band);
  }
  return g;
}

export function buvette(scene, x, y) {
  const g = scene.add.graphics().setDepth(1);
  g.fillStyle(C.prefab, 1);
  g.fillRect(x, y, 76, 44);
  g.fillStyle(C.red, 1);
  for (let i = 0; i < 6; i++) g.fillRect(x - 4 + i * 14, y - 8, 7, 10);
  g.fillStyle(C.cream, 1);
  for (let i = 0; i < 6; i++) g.fillRect(x + 3 + i * 14, y - 8, 7, 10);
  g.fillStyle(C.outline, 0.8);
  g.fillRect(x + 8, y + 14, 60, 14);
  txt(scene, x + 38, y + 38, 'BUVETTE', 9, CSS.outline, { bold: true }).setDepth(2);
  return g;
}

export function clubhouse(scene, x, y, w = 110, h = 60) {
  const g = scene.add.graphics().setDepth(1);
  g.fillStyle(C.prefab, 1);
  g.fillRect(x, y, w, h);
  g.fillStyle(0x8a7d5e, 1);
  g.fillRect(x - 4, y - 6, w + 8, 8);
  g.fillStyle(0x5aa0e6, 1);
  g.fillRect(x + 12, y + 16, 22, 16);
  g.fillRect(x + w - 34, y + 16, 22, 16);
  txt(scene, x + w / 2, y + h - 10, 'CLUB-HOUSE', 9, CSS.outline, { bold: true }).setDepth(2);
  return g;
}

export function parking(scene, x, y, w, h) {
  const g = scene.add.graphics().setDepth(1);
  g.fillStyle(0x9a9a9a, 1);
  g.fillRect(x, y, w, h);
  g.fillStyle(C.red, 1);
  g.fillRect(x + 10, y + h / 2 - 7, 30, 14);
  g.fillStyle(C.cream, 1);
  g.fillRect(x + w - 44, y + h / 2 - 7, 30, 14);
  return g;
}
