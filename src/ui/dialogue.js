import Phaser from 'phaser';
import { portraitKey } from '../assets.js';
import { displayName } from '../data/people.js';
import { txt, title } from './text.js';
import { sfx } from './sfx.js';
import { C, CSS } from '../palette.js';

// Scène de dialogue de la DA : le personnage surgit en grand, en découpe
// collée, avec son nom tamponné et une bulle. Le jeu se met en pause, les
// 170 px du bas (commandes) restent visibles. On touche l'écran pour continuer.
//
// say(scene, { who, expr, text, type, side, auto, veil })
//   type : 'normal' | 'gueule' | 'pensee' | 'murmure'
//   side : 'right' (par défaut) ou 'left' (le personnage qui répond)
//   auto : fermeture automatique après n ms (sinon au toucher)
//   veil : 'field' (terrain seulement, par défaut) ou 'full'
const DEPTH = 4000;
const PW = 250;
const PH = 320;

export function say(scene, opts) {
  // Les dialogues s'enchaînent dans l'ordre
  scene._dlgChain = (scene._dlgChain ?? Promise.resolve()).then(() => show(scene, opts));
  return scene._dlgChain;
}

// Plusieurs répliques d'affilée
export async function conversation(scene, lines) {
  for (const l of lines) await say(scene, l);
}

function show(scene, { who, expr = 'neutre', text, type = 'normal', side = 'right', auto = null, veil = 'field', name }) {
  return new Promise((resolve) => {
    if (!scene.sys.isActive()) return resolve();
    const left = side === 'left';
    const objs = [];
    const add = (o) => {
      o.setScrollFactor(0).setDepth(DEPTH + objs.length * 0.01);
      objs.push(o);
      return o;
    };

    // Pause du jeu
    scene.talking = true;
    const wasRunning = scene.running === true;
    if (wasRunning) scene.running = false;

    // Voile sur le terrain (pas sur les commandes)
    const vTop = veil === 'full' ? 0 : 50;
    const vH = veil === 'full' ? 640 : 420;
    const veilRect = add(scene.add.rectangle(0, vTop, 360, vH, C.ink, 0.3).setOrigin(0).setAlpha(0).setInteractive());
    scene.tweens.add({ targets: veilRect, alpha: 1, duration: 150 });

    // Le personnage, ancré sur un bord et qui déborde du cadre
    const key = scene.textures.exists(portraitKey(who, expr)) ? portraitKey(who, expr) : portraitKey(who, 'neutre');
    const px = left ? -50 : 360 + 50 - PW;
    const portrait = add(scene.add.image(px, 150, key).setOrigin(0).setDisplaySize(PW, PH).setFlipX(left));
    const out = left ? -PW - 40 : 360 + 40;
    portrait.x = out;
    portrait.angle = left ? -10 : 10;
    scene.tweens.chain({
      targets: portrait,
      tweens: [
        { x: px + (left ? 15 : -15), angle: left ? 6 : -6, duration: 190, ease: 'Cubic.easeOut' },
        { x: px, angle: left ? 2 : -2, duration: 130, ease: 'Cubic.easeOut' },
      ],
    });
    sfx.select(scene);

    // Bandeau de nom, tamponné
    const label = title(scene, 0, 0, name ?? displayName(who), 20, CSS.paper);
    const nw = label.width + 24;
    const nx = left ? 92 + nw / 2 : 360 - 92 - nw / 2;
    const nameBox = scene.add.container(nx, 436 + 18, [scene.add.rectangle(0, 0, nw, 36, C.ink), label]);
    add(nameBox).setAngle(-3).setAlpha(0).setScale(1.8);
    scene.time.delayedCall(260, () =>
      scene.tweens.chain({
        targets: nameBox,
        tweens: [
          { scale: 0.94, alpha: 1, duration: 130, ease: 'Quad.easeIn' },
          { scale: 1, duration: 70 },
        ],
      }),
    );
    scene.time.delayedCall(280, () => {
      scene.cameras.main.shake(180, type === 'gueule' ? 0.006 : 0.003);
      sfx.stamp(scene);
    });

    // La bulle
    const bubble = makeBubble(scene, type, text, left);
    add(bubble).setScale(0.5).setAlpha(0);
    scene.time.delayedCall(380, () =>
      scene.tweens.chain({
        targets: bubble,
        tweens: [
          { scale: 1.07, alpha: 1, duration: 170, ease: 'Back.easeOut' },
          { scale: 1, duration: 90 },
        ],
      }),
    );
    if (type === 'gueule') scene.time.delayedCall(420, () => scene.cameras.main.shake(200, 0.008));

    // Sortie
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      scene.tweens.add({ targets: [bubble, nameBox], alpha: 0, duration: 120 });
      scene.tweens.add({ targets: portrait, x: out, angle: left ? -8 : 8, duration: 220, ease: 'Quad.easeIn' });
      scene.tweens.add({
        targets: veilRect,
        alpha: 0,
        duration: 200,
        delay: 60,
        onComplete: () => {
          objs.forEach((o) => o.destroy());
          scene.talking = false;
          if (wasRunning && !scene.over) scene.running = true;
          resolve();
        },
      });
    };
    scene.time.delayedCall(640, () => {
      if (closed) return;
      const tap = () => close();
      scene.input.once('pointerup', tap);
      scene.input.keyboard?.once('keydown', tap);
      if (auto) scene.time.delayedCall(auto, close);
    });
  });
}

// Les 4 bulles de la DA. Renvoie un conteneur dont l'origine est la pointe.
function makeBubble(scene, type, text, left) {
  const W = type === 'gueule' ? 236 : 206;
  const bx = left ? 360 - 14 - W : 14;
  const by = 90;
  let t;
  if (type === 'gueule') t = title(scene, 0, 0, text, 34, CSS.paper, { wrap: W - 40, lineSpacing: -6 });
  else {
    const size = type === 'murmure' ? 15 : type === 'pensee' ? 17 : 19;
    const color = type === 'pensee' ? '#3A3A3A' : type === 'murmure' ? '#4A4A4A' : CSS.ink;
    t = txt(scene, 0, 0, text, size, color, { italic: true, wrap: W - 32, lineSpacing: 2 });
  }
  const H = Math.max(56, t.height + 30);
  // Pointe : 85 % de la largeur, en bas (vers la bouche du personnage)
  const tipX = left ? W * 0.15 : W * 0.85;
  const cont = scene.add.container(bx + tipX, by + H);
  const g = scene.add.graphics();
  const ox = -tipX;
  const oy = -H;
  if (type === 'gueule') {
    // Éclat rouge sans pointe
    const pts = [];
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = i % 2 ? 0.78 : 1.08;
      pts.push(new Phaser.Math.Vector2(ox + W / 2 + Math.cos(a) * (W / 2) * r, oy + H / 2 + Math.sin(a) * (H / 2 + 14) * r));
    }
    g.fillStyle(C.ink, 0.3);
    g.fillPoints(pts.map((p) => new Phaser.Math.Vector2(p.x + 3, p.y + 4)), true);
    g.fillStyle(C.red, 1);
    g.fillPoints(pts, true);
    cont.setAngle(-4);
  } else if (type === 'pensee') {
    const r = Math.min(24, H / 2);
    g.fillStyle(C.white, 1);
    g.fillRoundedRect(ox, oy, W, H, r);
    g.fillCircle(0, 12, 9);
    g.fillCircle(left ? -10 : 10, 30, 5);
  } else if (type === 'murmure') {
    g.fillStyle(C.paper, 1);
    g.fillRoundedRect(ox, oy, W, H, 14);
    dashedRect(g, ox, oy, W, H);
  } else {
    // Normale : blanc, ombre portée, pointe vers la bouche
    g.fillStyle(C.ink, 0.3);
    g.fillRect(ox + 3, oy + 4, W, H);
    g.fillStyle(C.white, 1);
    g.fillRect(ox, oy, W, H);
    g.fillTriangle(-14, -1, 12, -1, left ? -26 : 26, 34);
    cont.setAngle(-2);
  }
  t.setPosition(ox + W / 2, oy + H / 2);
  cont.add([g, t]);
  return cont;
}

function dashedRect(g, x, y, w, h) {
  g.lineStyle(2, C.ink, 1);
  const seg = 7;
  const gap = 5;
  const line = (x1, y1, x2, y2) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    for (let d = 0; d < len; d += seg + gap) {
      const a = d / len;
      const b = Math.min(1, (d + seg) / len);
      g.lineBetween(x1 + (x2 - x1) * a, y1 + (y2 - y1) * a, x1 + (x2 - x1) * b, y1 + (y2 - y1) * b);
    }
  };
  line(x + 10, y, x + w - 10, y);
  line(x + w, y + 10, x + w, y + h - 10);
  line(x + w - 10, y + h, x + 10, y + h);
  line(x, y + h - 10, x, y + 10);
}
