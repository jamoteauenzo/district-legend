import Phaser from 'phaser';

// Le jeu raisonne en 360 × 640 (taille logique de la DA), mais il est rendu
// en ×Z pour que les illustrations et les textes restent nets sur téléphone.
export const Z = 2;
export const WIDTH = 360;
export const HEIGHT = 640;

// À appeler au début de chaque scène : caméra zoomée depuis le coin haut
// gauche, et grain papier par-dessus tout.
export function setupCamera(scene, { grain = true } = {}) {
  const cam = scene.cameras.main;
  cam.setOrigin(0, 0).setZoom(Z);
  if (grain && scene.textures.exists('grain')) {
    scene.add
      .tileSprite(0, 0, WIDTH, HEIGHT, 'grain')
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(5000)
      .setAlpha(0.16)
      .setBlendMode(Phaser.BlendModes.MULTIPLY);
  }
  return cam;
}

// Coordonnées d'un pointeur en unités logiques (écran 360 × 640)
export const ptr = (p) => ({ x: p.x / Z, y: p.y / Z, downX: p.downX / Z, downY: p.downY / Z });

// Suivi vertical de la caméra (fait main : les bornes de Phaser supposent une
// caméra centrée).
export function followY(scene, target, { top, bottom, offset = 0, lerp = 0.12 }) {
  const cam = scene.cameras.main;
  const want = Phaser.Math.Clamp(target.y + offset - HEIGHT / 2, top, bottom - HEIGHT);
  cam.scrollX = 0;
  cam.scrollY += (want - cam.scrollY) * lerp;
}

export function snapY(scene, target, { top, bottom, offset = 0 }) {
  const cam = scene.cameras.main;
  cam.scrollX = 0;
  cam.scrollY = Phaser.Math.Clamp(target.y + offset - HEIGHT / 2, top, bottom - HEIGHT);
}
