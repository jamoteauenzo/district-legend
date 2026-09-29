import Phaser from 'phaser';
import { CHARACTERS, STAT_LABELS } from '../data/characters.js';
import { state, newCareer, save } from '../state.js';
import { txt, title, button } from '../ui/text.js';
import { C, CSS } from '../palette.js';
import { sfx } from '../ui/sfx.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { portraitKey } from '../assets.js';
import { setupCamera, ptr } from '../view.js';

// Choix du joueur : une fiche par joueur, portrait découpé, stats en jauges.
export default class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelect');
  }

  create() {
    setupCamera(this);
    this.index = 0;
    this.cameras.main.setBackgroundColor(C.paper);
    title(this, 18, 30, 'Signe ta licence', 26, CSS.ink, { ox: 0 });
    txt(this, 18, 56, '18 ans. Sorti des U19 Régional. Choisis ton joueur.', 12, CSS.grey, { ox: 0, italic: true });
    this.add.rectangle(16, 70, 328, 2, C.ink).setOrigin(0);

    this.card = this.add.container(0, 0);
    button(this, 26, 196, 36, 44, '<', () => this.shift(-1), { size: 22 });
    button(this, 334, 196, 36, 44, '>', () => this.shift(1), { size: 22 });

    // Balayage gauche / droite
    this.input.on('pointerdown', (p) => (this.swipeX = ptr(p).x));
    this.input.on('pointerup', (raw) => {
      const p = ptr(raw);
      if (this.swipeX === undefined) return;
      const dx = p.x - this.swipeX;
      if (Math.abs(dx) > 50 && p.y > 80 && p.y < 540) {
        sfx.select();
        this.shift(dx < 0 ? 1 : -1);
      }
      this.swipeX = undefined;
    });

    muteButton(this, 338, 30);
    music.play('menu');
    this.render();
  }

  shift(d) {
    this.index = Phaser.Math.Wrap(this.index + d, 0, CHARACTERS.length);
    this.render();
  }

  render() {
    this.card.removeAll(true);
    if (this.signBtn) this.signBtn.destroy();
    const c = CHARACTERS[this.index];
    const locked = c.secret && !state.meta.unlockedGege;
    const add = (o) => this.card.add(o);

    // Fond de fiche + portrait découpé qui déborde
    const g = this.add.graphics();
    g.fillStyle(C.ink, 0.3);
    g.fillRect(63, 107, 234, 190);
    g.fillStyle(c.id === 'gege' ? C.yellow : C.blue, 1);
    g.fillRect(60, 104, 234, 190);
    add(g);
    const key = portraitKey(c.id, locked ? 'neutre' : this.index % 2 ? 'fier' : 'neutre');
    const img = this.add.image(177, 292, key).setOrigin(0.5, 1).setDisplaySize(186, 238).setAngle(-2);
    if (locked) img.setTintFill(C.ink);
    add(img);
    this.tweens.add({ targets: img, angle: 1, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Bandeau de nom
    const name = title(this, 0, 0, locked ? '???' : c.nom, 22, CSS.paper);
    const band = this.add.container(177, 300, [this.add.rectangle(0, 0, name.width + 26, 38, C.ink), name]).setAngle(-3);
    add(band);
    add(txt(this, 180, 334, locked ? 'Joueur secret' : `« ${c.surnom} » · ${c.profil}`, 13, CSS.ink, { italic: true, wrap: 320 }));

    // Stats en jauges
    STAT_LABELS.forEach(([k, label], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 22 + col * 170;
      const y = 370 + row * 26;
      add(txt(this, x, y, label, 12, CSS.ink, { ox: 0, bold: true }));
      const bars = this.add.graphics();
      for (let b = 0; b < 5; b++) {
        const on = !locked && b < c.stats[k];
        bars.fillStyle(on ? C.red : C.paperDark, 1);
        bars.fillRect(x + 92 + b * 13, y - 6, 10, 12);
      }
      add(bars);
    });

    if (locked) {
      add(txt(this, 180, 470, 'Termine le chapitre 1 pour le débloquer.', 13, CSS.grey, { italic: true }));
    } else {
      add(title(this, 22, 456, c.trait.nom, 15, CSS.red, { ox: 0 }));
      add(txt(this, 22, 488, c.trait.desc, 12, CSS.ink, { ox: 0, italic: true, wrap: 316, align: 'left' }));
    }

    // Pagination
    const dots = this.add.graphics();
    CHARACTERS.forEach((_, i) => {
      dots.fillStyle(i === this.index ? C.ink : C.paperDark, 1);
      dots.fillCircle(180 + (i - 2) * 16, 540, 4);
    });
    add(dots);

    this.signBtn = button(
      this,
      180,
      590,
      300,
      50,
      'Signer la licence',
      () => {
        newCareer(c.id);
        save();
        this.scene.start('Programme');
      },
      { disabled: locked, fill: C.red, size: 20 },
    );
  }
}
