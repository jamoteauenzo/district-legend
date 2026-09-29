import Phaser from 'phaser';
import { state } from '../state.js';
import { txt, title, button } from '../ui/text.js';
import { C, CSS } from '../palette.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { portraitKey } from '../assets.js';
import { setupCamera } from '../view.js';

// Menu principal : la une de L'Écho de Grandcour.
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    setupCamera(this);
    this.cameras.main.setBackgroundColor(C.paper);
    const g = this.add.graphics();

    // Bandeau de une
    txt(this, 18, 26, "L'ÉCHO DE GRANDCOUR · ÉDITION DU DIMANCHE", 10, CSS.ink, { ox: 0, bold: true });
    txt(this, 342, 26, 'Page sport', 10, CSS.grey, { ox: 1, italic: true });
    g.fillStyle(C.ink, 1);
    g.fillRect(16, 36, 328, 3);
    title(this, 180, 88, 'DISTRICT', 72, CSS.red);
    title(this, 180, 160, 'LEGEND', 72, CSS.ink);
    g.fillRect(16, 204, 328, 2);
    g.fillRect(16, 209, 328, 1);
    txt(this, 180, 228, 'Ta carrière pro est derrière toi. Deviens une légende… du district.', 14, CSS.ink, { italic: true, wrap: 320 });

    // Collage : le coach et le président, découpés et collés
    const collage = [
      ['coach', 'fier', 18, 262, 170, -4],
      ['president', 'rire', 172, 270, 170, 3],
    ];
    for (const [id, expr, x, y, w, rot] of collage) {
      if (!this.textures.exists(portraitKey(id, expr))) continue;
      const img = this.add.image(x, y, portraitKey(id, expr)).setOrigin(0).setDisplaySize(w, w * 1.28).setAngle(rot);
      this.tweens.add({ targets: img, angle: rot + (rot > 0 ? 1.5 : -1.5), duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    // Légende de la photo
    g.fillStyle(C.ink, 1);
    g.fillRect(16, 486, 328, 22);
    txt(this, 24, 497, 'Coach Gérard et le président Roland, dimanche, au stade Marcel-Pinard.', 11, CSS.paper, { ox: 0, italic: true });

    button(this, 180, 540, 300, 46, 'Nouvelle carrière', () => this.scene.start('CharacterSelect'), { fill: C.red, size: 20 });
    button(this, 180, 596, 300, 40, 'Continuer', () => this.scene.start('Programme'), { disabled: !state.career, size: 17 });

    txt(this, 180, 628, 'v0.8 · Visa de l\'arbitre : M. Loiseau', 10, CSS.grey, { italic: true });
    muteButton(this, 338, 60);
    music.play('menu');
  }
}
