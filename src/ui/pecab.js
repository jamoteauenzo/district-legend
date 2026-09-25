import { txt } from './text.js';
import { sfx } from './sfx.js';
import { CSS } from '../palette.js';

// Le tampon PÉCAB. Joue l'audio original s'il a été déposé dans
// public/audio/pecab.mp3, sinon un bruit de tampon.
export function pecab(scene) {
  const cam = scene.cameras.main;
  const t = txt(scene, cam.width / 2, cam.height * 0.38, 'PÉCAB', 56, CSS.red, {
    stroke: CSS.cream,
    strokeThickness: 6,
    bold: true,
  })
    .setScrollFactor(0)
    .setDepth(300)
    .setAngle(-12)
    .setScale(3)
    .setAlpha(0);

  scene.tweens.add({
    targets: t,
    scale: 1,
    alpha: 1,
    duration: 180,
    ease: 'Back.easeIn',
    onComplete: () => {
      cam.shake(160, 0.012);
      scene.tweens.add({ targets: t, alpha: 0, delay: 900, duration: 300, onComplete: () => t.destroy() });
    },
  });

  if (scene.cache.audio.exists('pecab')) scene.sound.play('pecab');
  else scene.time.delayedCall(170, () => sfx.stamp(scene));
}
