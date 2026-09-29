import { audio } from '../audio/engine.js';
import { C } from '../palette.js';

// Petit haut-parleur pour couper / remettre le son. Fixe à l'écran.
export function muteButton(scene, x, y, dark = false) {
  const g = scene.add.graphics().setScrollFactor(0).setDepth(3900);
  const fg = dark ? C.paper : C.ink;
  const draw = () => {
    g.clear();
    g.fillStyle(fg, 1);
    g.fillRect(x - 8, y - 3, 4, 6);
    g.fillTriangle(x - 5, y - 3, x + 1, y - 8, x + 1, y + 8);
    g.fillTriangle(x - 5, y + 3, x - 5, y - 3, x + 1, y + 8);
    g.lineStyle(2, audio.muted ? C.red : fg, 1);
    if (audio.muted) {
      g.lineBetween(x + 4, y - 4, x + 10, y + 4);
      g.lineBetween(x + 10, y - 4, x + 4, y + 4);
    } else {
      g.beginPath();
      g.arc(x + 2, y, 5, -0.9, 0.9);
      g.strokePath();
      g.beginPath();
      g.arc(x + 2, y, 9, -0.8, 0.8);
      g.strokePath();
    }
  };
  draw();
  const zone = scene.add.zone(x, y, 34, 34).setScrollFactor(0).setDepth(3901).setInteractive({ useHandCursor: true });
  zone.on('pointerup', (p, lx, ly, e) => {
    audio.toggleMute();
    draw();
    if (e) e.stopPropagation();
  });
  return g;
}
