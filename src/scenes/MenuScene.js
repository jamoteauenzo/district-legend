import Phaser from 'phaser';
import { state } from '../state.js';
import { txt, button } from '../ui/text.js';
import { C, CSS } from '../palette.js';
import { sfx } from '../ui/sfx.js';

// Menu principal façon feuille de match.
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const g = this.add.graphics();
    // Terrain de nuit en fond
    for (let i = 0; i < 16; i++) {
      g.fillStyle(i % 2 ? C.grass : C.grassDark, 0.35);
      g.fillRect(0, i * 40, 360, 40);
    }
    // Projecteur (un sur deux ne marche pas)
    g.fillStyle(C.cream, 0.08);
    g.fillTriangle(20, 0, 0, 260, 200, 260);

    // Feuille de match
    g.fillStyle(C.cream, 1);
    g.fillRect(28, 70, 304, 460);
    g.lineStyle(3, C.outline, 1);
    g.strokeRect(28, 70, 304, 460);
    g.lineStyle(1, C.sky, 0.6);
    for (let y = 200; y < 510; y += 22) g.lineBetween(44, y, 316, y);

    txt(this, 180, 96, 'FEUILLE DE MATCH', 11, CSS.grey, { bold: true });
    txt(this, 180, 132, 'DISTRICT', 44, CSS.red, { bold: true });
    txt(this, 180, 172, 'LEGEND', 44, CSS.outline, { bold: true });
    txt(this, 180, 212, 'Saison 2026-2027 · Seniors B', 12, CSS.grey);
    txt(this, 180, 244, 'Ta carrière pro est derrière toi.', 13, CSS.outline);

    button(this, 180, 320, 240, 48, 'NOUVELLE CARRIÈRE', () => {
      sfx.select(this);
      this.scene.start('CharacterSelect');
    });
    button(
      this,
      180,
      384,
      240,
      48,
      'CONTINUER',
      () => {
        sfx.select(this);
        this.scene.start('Match');
      },
      { disabled: !state.career },
    );

    txt(this, 180, 470, 'Visa de l\'arbitre :', 11, CSS.grey);
    txt(this, 180, 492, '~ M. Loiseau ~', 14, CSS.outline);

    txt(this, 180, 612, 'v0.1 · prototype', 10, CSS.grey);

    // Kaiser, le chien du terrain
    const dog = this.add.image(-20, 570, 'dog').setScale(3);
    this.tweens.add({ targets: dog, x: 400, duration: 9000, repeat: -1, delay: 1500 });
  }
}
