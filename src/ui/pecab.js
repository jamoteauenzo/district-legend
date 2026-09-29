import Phaser from 'phaser';
import { title } from './text.js';
import { sfx } from './sfx.js';
import { C, CSS } from '../palette.js';
import { audio } from '../audio/engine.js';

// Le tampon PÉCAB : tampon encreur rouge, penché, qui s'écrase avec un
// tremblement. Joue l'audio original s'il est présent.
export function pecab(scene) {
  const t = title(scene, 0, 0, 'PÉCAB', 64, CSS.red);
  const w = t.width + 36;
  const h = t.height + 10;
  const g = scene.add.graphics();
  g.lineStyle(6, C.red, 1);
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
  g.lineStyle(2, C.red, 1);
  g.strokeRoundedRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 5);
  const stamp = scene.add.container(180, 250, [g, t]).setScrollFactor(0).setDepth(4500).setAngle(-12).setScale(3).setAlpha(0);

  scene.tweens.add({
    targets: stamp,
    scale: 1,
    alpha: 0.95,
    duration: 170,
    ease: 'Quad.easeIn',
    onComplete: () => {
      scene.cameras.main.shake(180, 0.01);
      // Éclaboussures d'encre
      for (let i = 0; i < 10; i++) {
        const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const d = Phaser.Math.Between(70, 120);
        const dot = scene.add.circle(180, 250, Phaser.Math.Between(2, 4), C.red).setScrollFactor(0).setDepth(4499);
        scene.tweens.add({ targets: dot, x: 180 + Math.cos(a) * d, y: 250 + Math.sin(a) * d * 0.6, alpha: 0, duration: 450, onComplete: () => dot.destroy() });
      }
      scene.tweens.add({ targets: stamp, alpha: 0, delay: 1000, duration: 300, onComplete: () => stamp.destroy() });
    },
  });

  audio.duck(1.4);
  if (scene.cache.audio.exists('pecab')) scene.sound.play('pecab');
  else scene.time.delayedCall(160, () => sfx.stamp(scene));
}
