import Phaser from 'phaser';
import { state } from '../state.js';
import { txt, button } from '../ui/text.js';
import { Mug } from '../ui/mug.js';
import { C, CSS } from '../palette.js';
import { sfx } from '../ui/sfx.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';

// Feuille de fin de séance (match ou entraînement) : le résultat officiel,
// que personne ne regarde, et les vraies stats. Puis retour au programme.
// data = { title, subtitle, official?, lines: [[label, valeur]], coach, legendeStart, reporter? }
export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  create({ title, subtitle, official, lines, coach, legendeStart, reporter }) {
    const career = state.career;
    const g = this.add.graphics();
    g.fillStyle(C.cream, 1);
    g.fillRect(20, 24, 320, 520);
    g.lineStyle(3, C.outline, 1);
    g.strokeRect(20, 24, 320, 520);

    txt(this, 180, 50, subtitle === 'Match' ? 'FEUILLE DE MATCH' : "FICHE D'ENTRAÎNEMENT", 11, CSS.grey, { bold: true });
    txt(this, 180, 76, title, 16, CSS.outline, { bold: true });
    if (official) txt(this, 180, 104, official, 11, CSS.grey);

    const top = official ? 140 : 120;
    const rowH = Math.min(28, 230 / lines.length);
    lines.forEach(([label, value], i) => {
      const y = top + i * rowH;
      txt(this, 40, y, label, 13, CSS.outline, { ox: 0 });
      txt(this, 320, y, String(value), 13, CSS.outline, { ox: 1, bold: true });
      g.lineStyle(1, C.sky, 0.5);
      g.lineBetween(40, y + 13, 320, y + 13);
    });

    const mug = new Mug(this, 180, 404, 2.4, C.outline);
    mug.setValue(legendeStart, false);
    this.time.delayedCall(500, () => {
      mug.setValue(career.legende);
      if (career.legende > legendeStart) sfx.gain(this);
    });

    txt(this, 180, 478, coach, 12, CSS.outline, { wrap: 280 });

    if (reporter) {
      const t = txt(this, 180, 566, "Le Reporter s'approche avec son téléphone...", 12, CSS.cream);
      this.tweens.add({ targets: t, alpha: 0.3, yoyo: true, repeat: -1, duration: 700 });
    }

    muteButton(this, 338, 22);
    music.stop();
    music.jingle();
    this.time.delayedCall(2500, () => music.play('menu'));

    button(this, 180, 606, 240, 44, 'CONTINUER', () => this.scene.start('Programme'), { size: 14 });
  }
}
