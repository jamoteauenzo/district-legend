import { title } from '../../ui/text.js';
import { C, CSS } from '../../palette.js';

// Éléments de décor partagés par les entraînements (DA 1c : aplats,
// bord noir, ombre pleine décalée).

export function grass(scene, height = 640, band = 40) {
  const g = scene.add.graphics().setDepth(0);
  for (let i = 0; i * band < height; i++) {
    g.fillStyle(i % 2 ? C.grass : C.grassDark, 1);
    g.fillRect(0, i * band, 360, band);
  }
  return g;
}

function block(g, x, y, w, h, fill) {
  g.fillStyle(C.ink, 0.25);
  g.fillRect(x + 4, y + 4, w, h);
  g.fillStyle(fill, 1);
  g.fillRect(x, y, w, h);
  g.lineStyle(2, C.ink, 1);
  g.strokeRect(x, y, w, h);
}

export function buvette(scene, x, y) {
  const g = scene.add.graphics().setDepth(1);
  block(g, x, y, 76, 44, C.paper);
  for (let i = 0; i < 6; i++) {
    g.fillStyle(i % 2 ? C.paper : C.red, 1);
    g.fillRect(x - 4 + i * 14, y - 8, 14, 10);
  }
  g.lineStyle(2, C.ink, 1);
  g.strokeRect(x - 4, y - 8, 84, 10);
  g.fillStyle(C.ink, 1);
  g.fillRect(x + 8, y + 12, 60, 14);
  title(scene, x + 38, y + 36, 'BUVETTE', 9, CSS.ink).setDepth(2);
  return g;
}

export function clubhouse(scene, x, y, w = 110, h = 60) {
  const g = scene.add.graphics().setDepth(1);
  block(g, x, y, w, h, C.paperDark);
  g.fillStyle(C.ink, 1);
  g.fillRect(x - 4, y - 8, w + 8, 8);
  g.fillStyle(C.blue, 1);
  g.fillRect(x + 12, y + 14, 22, 16);
  g.fillRect(x + w - 34, y + 14, 22, 16);
  g.lineStyle(2, C.ink, 1);
  g.strokeRect(x + 12, y + 14, 22, 16);
  g.strokeRect(x + w - 34, y + 14, 22, 16);
  title(scene, x + w / 2, y + h - 11, 'CLUB-HOUSE', 10, CSS.ink).setDepth(2);
  return g;
}

export function parking(scene, x, y, w, h) {
  const g = scene.add.graphics().setDepth(1);
  g.fillStyle(0xa39c8c, 1);
  g.fillRect(x, y, w, h);
  g.fillStyle(C.ink, 0.12);
  for (let i = 0; i < 40; i++) g.fillRect(x + ((i * 37) % w), y + ((i * 23) % h), 2, 2);
  block(g, x + 10, y + h / 2 - 7, 30, 14, C.red);
  block(g, x + w - 44, y + h / 2 - 7, 30, 14, C.paper);
  return g;
}
