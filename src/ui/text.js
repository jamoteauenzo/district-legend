import { CSS, C } from '../palette.js';
import { sfx } from './sfx.js';
import { Z } from '../view.js';

// Typographie de la DA : Anton (titres, chiffres, boutons, noms) en
// majuscules, Newsreader (textes, dialogues en italique).
export const FONT = '"Newsreader", Georgia, serif';
export const FONT_TITLE = '"Anton", Impact, sans-serif';

// Texte courant (Newsreader). opts : align, wrap, stroke, bold, italic, ox, oy, title
export function txt(scene, x, y, str, size = 14, color = CSS.ink, opts = {}) {
  const style = {
    fontFamily: opts.title ? FONT_TITLE : FONT,
    fontSize: `${size}px`,
    color,
    align: opts.align ?? 'center',
    resolution: Z,
  };
  if (opts.wrap) style.wordWrap = { width: opts.wrap, useAdvancedWrap: true };
  if (opts.stroke) {
    style.stroke = opts.stroke;
    style.strokeThickness = opts.strokeThickness ?? 3;
  }
  const weight = opts.bold && !opts.title ? '600' : '';
  const it = opts.italic ? 'italic' : '';
  style.fontStyle = `${it} ${weight}`.trim() || 'normal';
  if (opts.lineSpacing) style.lineSpacing = opts.lineSpacing;
  const t = scene.add.text(x, y, opts.title ? String(str).toUpperCase() : str, style);
  t.setOrigin(opts.ox ?? 0.5, opts.oy ?? 0.5);
  if (opts.title && opts.spacing !== 0) t.setLetterSpacing?.(opts.spacing ?? size * 0.02);
  return t;
}

// Titre en Anton majuscules
export function title(scene, x, y, str, size = 20, color = CSS.ink, opts = {}) {
  return txt(scene, x, y, str, size, color, { ...opts, title: true });
}

// Texte qui monte et disparaît (gains, réactions du public…)
export function floatText(scene, x, y, str, color = CSS.ink, size = 13) {
  const light = color === CSS.paper || color === CSS.yellow || color === CSS.white;
  const t = txt(scene, x, y, str, size, color, {
    italic: true,
    bold: true,
    stroke: light ? CSS.ink : CSS.paper,
    strokeThickness: 3,
  });
  t.setDepth(150);
  scene.tweens.add({
    targets: t,
    y: y - 28,
    alpha: 0,
    duration: 1400,
    ease: 'Cubic.easeOut',
    onComplete: () => t.destroy(),
  });
  return t;
}

// Bouton façon DA : aplat, bord noir, ombre pleine décalée de 3 px, Anton.
export function button(scene, x, y, w, h, label, onClick, opts = {}) {
  const fill = opts.fill ?? C.paper;
  const shadow = scene.add.rectangle(x + 3, y + 3, w, h, C.ink).setAlpha(opts.disabled ? 0.2 : 1);
  const bg = scene.add
    .rectangle(x, y, w, h, fill)
    .setStrokeStyle(2, C.ink)
    .setInteractive({ useHandCursor: true });
  const dark = fill === C.ink || fill === C.red || fill === C.blue;
  const textColor = opts.color ?? (dark ? CSS.paper : CSS.ink);
  const t = opts.plain
    ? txt(scene, x, y, label, opts.size ?? 14, textColor, { italic: true, wrap: w - 16 })
    : title(scene, x, y, label, opts.size ?? 16, textColor, { wrap: w - 16 });
  const parts = [shadow, bg, t];
  if (opts.disabled) {
    bg.setAlpha(0.45);
    t.setAlpha(0.45);
    bg.disableInteractive();
  }
  const press = (down) => {
    bg.setPosition(x + (down ? 2 : 0), y + (down ? 2 : 0));
    t.setPosition(x + (down ? 2 : 0), y + (down ? 2 : 0));
  };
  bg.on('pointerdown', () => press(true));
  bg.on('pointerout', () => press(false));
  bg.on('pointerup', () => {
    press(false);
    sfx.select();
    onClick();
  });
  const api = {
    bg,
    t,
    shadow,
    setDepth(d) {
      shadow.setDepth(d);
      bg.setDepth(d + 0.1);
      t.setDepth(d + 0.2);
      return api;
    },
    setScrollFactor(f) {
      parts.forEach((p) => p.setScrollFactor(f));
      return api;
    },
    destroy() {
      parts.forEach((p) => p.destroy());
    },
  };
  return api;
}
