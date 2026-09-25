import Phaser from 'phaser';
import { CHARACTERS, STAT_LABELS } from '../data/characters.js';
import { state, newCareer, save } from '../state.js';
import { txt, button } from '../ui/text.js';
import { C, CSS } from '../palette.js';
import { sfx } from '../ui/sfx.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';

export default class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelect');
  }

  create() {
    this.index = 0;
    this.cameras.main.setBackgroundColor(C.night);
    txt(this, 180, 34, 'SIGNE TA LICENCE', 22, CSS.yellow, { bold: true });
    txt(this, 180, 60, '18 ans. Sorti des U19 Régional.', 12, CSS.chalk);

    this.card = this.add.container(0, 0);

    button(this, 34, 250, 44, 44, '<', () => this.shift(-1), { size: 22 });
    button(this, 326, 250, 44, 44, '>', () => this.shift(1), { size: 22 });

    // Balayage gauche / droite
    this.input.on('pointerdown', (p) => (this.swipeX = p.x));
    this.input.on('pointerup', (p) => {
      if (this.swipeX === undefined) return;
      const dx = p.x - this.swipeX;
      if (Math.abs(dx) > 50 && p.y > 80 && p.y < 540) {
        sfx.select();
        this.shift(dx < 0 ? 1 : -1);
      }
      this.swipeX = undefined;
    });

    muteButton(this, 338, 22);
    music.play('menu');
    this.render();
  }

  shift(d) {
    this.index = Phaser.Math.Wrap(this.index + d, 0, CHARACTERS.length);
    this.render();
  }

  render() {
    this.card.removeAll(true);
    if (this.signBtn) {
      this.signBtn.bg.destroy();
      this.signBtn.t.destroy();
    }
    const c = CHARACTERS[this.index];
    const locked = c.secret && !state.meta.unlockedGege;
    const add = (o) => this.card.add(o);

    const g = this.add.graphics();
    g.fillStyle(C.cream, 1);
    g.fillRect(62, 84, 236, 150);
    g.lineStyle(3, C.outline, 1);
    g.strokeRect(62, 84, 236, 150);
    g.fillStyle(C.grass, 1);
    g.fillRect(66, 88, 228, 110);
    add(g);

    const portrait = this.add.image(180, 142, `p_${c.id}`).setScale(6);
    if (locked) portrait.setTintFill(C.outline);
    add(portrait);

    add(txt(this, 180, 212, locked ? '???' : c.nom.toUpperCase(), 18, CSS.outline, { bold: true }));
    add(txt(this, 180, 256, locked ? 'Perso secret' : `« ${c.surnom} »`, 15, CSS.yellow, { bold: true }));
    add(txt(this, 180, 278, locked ? 'Termine une carrière pour le débloquer.' : c.profil, 12, CSS.chalk, { wrap: 300 }));

    STAT_LABELS.forEach(([key, label], i) => {
      const y = 312 + i * 22;
      add(txt(this, 70, y, label, 12, CSS.chalk, { ox: 0 }));
      const bars = this.add.graphics();
      for (let b = 0; b < 5; b++) {
        const filled = !locked && b < c.stats[key];
        bars.fillStyle(filled ? C.yellow : C.cream, filled ? 1 : 0.15);
        bars.fillRect(190 + b * 20, y - 6, 16, 12);
      }
      add(bars);
    });

    if (!locked) {
      add(txt(this, 180, 452, c.trait.nom.toUpperCase(), 13, CSS.red, { bold: true }));
      add(txt(this, 180, 482, c.trait.desc, 12, CSS.chalk, { wrap: 300 }));
    }

    // Petits points de pagination
    const dots = this.add.graphics();
    CHARACTERS.forEach((_, i) => {
      dots.fillStyle(C.cream, i === this.index ? 1 : 0.3);
      dots.fillCircle(180 + (i - 2) * 14, 530, 4);
    });
    add(dots);

    this.signBtn = button(
      this,
      180,
      588,
      260,
      52,
      'SIGNER LA LICENCE',
      () => {
        newCareer(c.id);
        save();
        this.scene.start('Match');
      },
      { disabled: locked, fill: C.yellow },
    );
  }
}
