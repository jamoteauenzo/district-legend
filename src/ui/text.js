import { CSS } from '../palette.js';
import { sfx } from './sfx.js';

export const FONT = '"Pixelify Sans", monospace';

// Raccourci pour créer un texte au style du jeu.
export function txt(scene, x, y, str, size = 14, color = CSS.cream, opts = {}) {
  const style = {
    fontFamily: FONT,
    fontSize: `${size}px`,
    color,
    align: opts.align ?? 'center',
  };
  if (opts.wrap) style.wordWrap = { width: opts.wrap };
  if (opts.stroke) {
    style.stroke = opts.stroke;
    style.strokeThickness = opts.strokeThickness ?? 3;
  }
  if (opts.bold) style.fontStyle = 'bold';
  const t = scene.add.text(x, y, str, style);
  t.setOrigin(opts.ox ?? 0.5, opts.oy ?? 0.5);
  return t;
}

// Texte qui monte et disparaît (gains, réactions du public…).
export function floatText(scene, x, y, str, color = CSS.yellow, size = 12) {
  const t = txt(scene, x, y, str, size, color, { stroke: CSS.outline, strokeThickness: 3 });
  t.setDepth(150);
  scene.tweens.add({
    targets: t,
    y: y - 28,
    alpha: 0,
    duration: 1300,
    ease: 'Cubic.easeOut',
    onComplete: () => t.destroy(),
  });
  return t;
}

// Bouton rectangulaire façon feuille de match.
export function button(scene, x, y, w, h, label, onClick, opts = {}) {
  const bg = scene.add
    .rectangle(x, y, w, h, opts.fill ?? 0xf4eedb)
    .setStrokeStyle(3, 0x1a1a1a)
    .setInteractive({ useHandCursor: true });
  const t = txt(scene, x, y, label, opts.size ?? 16, opts.color ?? CSS.outline, { bold: true });
  if (opts.disabled) {
    bg.setAlpha(0.4);
    t.setAlpha(0.4);
    bg.disableInteractive();
  }
  bg.on('pointerdown', () => bg.setScale(0.96));
  bg.on('pointerout', () => bg.setScale(1));
  bg.on('pointerup', () => {
    bg.setScale(1);
    sfx.select();
    onClick();
  });
  return { bg, t };
}
