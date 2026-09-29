import { C } from '../palette.js';
import { LEGENDE_MAX } from '../state.js';

// La jauge Légende : une chope qui se remplit, sans chiffre ni explication.
// Style 1c : verre blanc, bière jaune tombola, mousse blanche, ombre pleine.
export class Mug {
  constructor(scene, x, y, scale = 1) {
    this.scene = scene;
    this.level = 0;
    this.baseScale = scale;
    this.container = scene.add.container(x, y).setScale(scale);
    this.gfx = scene.add.graphics();
    this.container.add(this.gfx);
    this.draw();
  }

  setScrollFactor(v) {
    this.container.setScrollFactor(v);
    return this;
  }

  setDepth(v) {
    this.container.setDepth(v);
    return this;
  }

  setValue(legende, animate = true) {
    const target = legende / LEGENDE_MAX;
    if (!animate) {
      this.level = target;
      this.draw();
      return;
    }
    this.scene.tweens.addCounter({
      from: this.level,
      to: target,
      duration: 500,
      onUpdate: (tw) => {
        this.level = tw.getValue();
        this.draw();
      },
    });
    this.scene.tweens.killTweensOf(this.container);
    this.container.setScale(this.baseScale).setAngle(0);
    this.scene.tweens.add({ targets: this.container, scale: this.baseScale * 1.25, angle: -8, yoyo: true, duration: 120 });
  }

  draw() {
    const g = this.gfx;
    const w = 20;
    const h = 28;
    g.clear();
    // Ombre pleine décalée (règle de la DA)
    g.fillStyle(C.ink, 0.3);
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 3, w, h, 3);
    g.fillRect(w / 2 + 2, -h / 2 + 9, 7, 12);
    // Anse
    g.fillStyle(C.white, 1);
    g.fillRoundedRect(w / 2 - 2, -h / 2 + 6, 9, 14, 4);
    g.fillStyle(C.paperDark, 1);
    g.fillRoundedRect(w / 2 + 1, -h / 2 + 9, 3, 8, 2);
    // Verre
    g.fillStyle(C.white, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    // Bière et mousse
    const inner = h - 6;
    const fillH = Math.round(inner * this.level);
    if (fillH > 0) {
      g.fillStyle(C.yellow, 1);
      g.fillRect(-w / 2 + 3, h / 2 - 3 - fillH, w - 6, fillH);
      g.fillStyle(C.white, 1);
      g.fillCircle(-w / 2 + 6, h / 2 - 3 - fillH, 3.5);
      g.fillCircle(0, h / 2 - 4 - fillH, 4);
      g.fillCircle(w / 2 - 6, h / 2 - 3 - fillH, 3.5);
      g.fillStyle(C.ink, 0.12);
      g.fillRect(w / 2 - 7, h / 2 - 3 - fillH + 3, 4, Math.max(0, fillH - 3));
    } else {
      g.fillStyle(C.paperDark, 1);
      g.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
    }
  }
}
