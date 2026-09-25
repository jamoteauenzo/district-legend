import { C } from '../palette.js';
import { LEGENDE_MAX } from '../state.js';

// La jauge Légende : une chope qui se remplit, sans chiffre ni explication.
export class Mug {
  constructor(scene, x, y, scale = 1, color = C.cream) {
    this.scene = scene;
    this.level = 0;
    this.baseScale = scale;
    this.color = color;
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
    this.container.setScale(this.baseScale);
    this.scene.tweens.add({ targets: this.container, scale: this.baseScale * 1.25, yoyo: true, duration: 110 });
  }

  draw() {
    const g = this.gfx;
    const w = 16;
    const h = 22;
    g.clear();
    // Verre
    g.fillStyle(this.color, 0.25);
    g.fillRect(-w / 2, -h / 2, w, h);
    // Bière
    const fillH = Math.round((h - 2) * this.level);
    if (fillH > 0) {
      g.fillStyle(C.beer, 1);
      g.fillRect(-w / 2 + 1, h / 2 - 1 - fillH, w - 2, fillH);
      g.fillStyle(C.cream, 1);
      g.fillRect(-w / 2 + 1, h / 2 - 1 - fillH - 3, w - 2, 3);
    }
    // Contour et anse
    g.lineStyle(2, this.color, 1);
    g.strokeRect(-w / 2, -h / 2, w, h);
    g.strokeRect(w / 2, -h / 2 + 5, 5, 10);
  }
}
