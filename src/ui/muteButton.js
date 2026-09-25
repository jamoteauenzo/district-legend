import { audio } from '../audio/engine.js';
import { C } from '../palette.js';

// Petit haut-parleur pour couper / remettre le son. Fixe à l'écran.
export function muteButton(scene, x, y) {
  const g = scene.add.graphics().setScrollFactor(0).setDepth(210);
  const draw = () => {
    g.clear();
    g.fillStyle(C.outline, 0.6);
    g.fillCircle(x, y, 13);
    g.fillStyle(C.cream, 1);
    g.fillRect(x - 7, y - 3, 4, 6);
    g.fillTriangle(x - 4, y - 3, x + 1, y - 7, x + 1, y + 7);
    g.fillTriangle(x - 4, y + 3, x - 4, y - 3, x + 1, y + 7);
    g.lineStyle(2, audio.muted ? C.red : C.cream, 1);
    if (audio.muted) {
      g.lineBetween(x + 3, y - 4, x + 9, y + 4);
      g.lineBetween(x + 9, y - 4, x + 3, y + 4);
    } else {
      g.beginPath();
      g.arc(x + 2, y, 5, -0.9, 0.9);
      g.strokePath();
    }
  };
  draw();
  const zone = scene.add.zone(x, y, 34, 34).setScrollFactor(0).setDepth(211).setInteractive({ useHandCursor: true });
  zone.on('pointerup', (p, lx, ly, e) => {
    audio.toggleMute();
    draw();
    if (e) e.stopPropagation();
  });
  return g;
}
