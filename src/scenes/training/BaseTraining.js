import Phaser from 'phaser';
import { state, gainLegende, gainNiveau, save } from '../../state.js';
import { getCharacter } from '../../data/characters.js';
import { advanceWeek } from '../../data/schedule.js';
import { txt, floatText } from '../../ui/text.js';
import { Mug } from '../../ui/mug.js';
import { pecab } from '../../ui/pecab.js';
import { sfx } from '../../ui/sfx.js';
import { music } from '../../audio/music.js';
import { muteButton } from '../../ui/muteButton.js';
import { C, CSS } from '../../palette.js';

// Socle commun des entraînements : barre du haut (titre, chrono, objectif
// officiel, chope), intro, gains de Légende et écran de fin.
export default class BaseTraining extends Phaser.Scene {
  // Appelé par Phaser avant create() : la carrière est dispo dès le décor.
  init() {
    this.career = state.career;
    this.char = getCharacter(this.career.charId);
  }

  setup({ title, objective, duration }) {
    this.legendeStart = this.career.legende;
    this.title = title;
    this.duration = duration;
    this.elapsed = 0;
    this.running = false;
    this.over = false;
    this.pecabDone = false;

    const fix = (o, d = 100) => o.setScrollFactor(0).setDepth(d);
    fix(this.add.rectangle(0, 0, 360, 40, C.outline, 0.85).setOrigin(0));
    fix(txt(this, 10, 13, title.toUpperCase(), 13, CSS.cream, { ox: 0, bold: true }), 101);
    this.timerText = fix(txt(this, 10, 30, '', 11, CSS.chalk, { ox: 0 }), 101);
    fix(txt(this, 180, 31, `OBJECTIF : ${objective.toUpperCase()}`, 9, CSS.cream, { stroke: CSS.outline }), 101);
    this.mug = new Mug(this, 334, 20).setScrollFactor(0).setDepth(101);
    this.mug.setValue(this.career.legende, false);
    muteButton(this, 298, 20);

    music.play('training');
    this.banner(title.toUpperCase(), `Objectif : ${objective}.`);
    this.time.delayedCall(2200, () => {
      this.running = true;
      sfx.whistle(this);
    });
  }

  tickTimer(dt) {
    if (!this.running || this.over) return false;
    this.elapsed += dt;
    this.timerText.setText(`${Math.max(0, Math.ceil(this.duration - this.elapsed))} s`);
    return this.elapsed < this.duration;
  }

  banner(title, sub) {
    const bg = this.add.rectangle(180, 250, 360, 70, C.outline, 0.8).setScrollFactor(0).setDepth(250);
    const t1 = txt(this, 180, 238, title, 20, CSS.yellow, { bold: true }).setScrollFactor(0).setDepth(251);
    const t2 = txt(this, 180, 266, sub ?? '', 12, CSS.cream, { wrap: 330 }).setScrollFactor(0).setDepth(251);
    this.tweens.add({
      targets: [bg, t1, t2],
      alpha: 0,
      delay: 1800,
      duration: 400,
      onComplete: () => [bg, t1, t2].forEach((o) => o.destroy()),
    });
  }

  // Comme en match : la chope bouge, jamais de chiffre.
  legende(n, label, x, y) {
    gainLegende(n);
    this.mug.setValue(this.career.legende);
    if (n > 0) sfx.gain(this);
    else sfx.loss(this);
    if (label) floatText(this, x ?? 180, y ?? 300, label, n > 0 ? CSS.yellow : CSS.grey);
  }

  niveau(n) {
    gainNiveau(n);
  }

  // Le premier gros exploit « district » de la séance déclenche le PÉCAB.
  firstPecab() {
    if (this.pecabDone) return;
    this.pecabDone = true;
    pecab(this);
  }

  say(who, x, y, line, color = CSS.cream) {
    return floatText(this, x, y, line, color, 11);
  }

  finish(lines, coach) {
    if (this.over) return;
    this.over = true;
    this.running = false;
    music.stop();
    sfx.whistle(this, 2);
    advanceWeek();
    save();
    this.time.delayedCall(900, () =>
      this.scene.start('Result', {
        title: this.title,
        subtitle: 'Entraînement',
        lines,
        coach,
        legendeStart: this.legendeStart,
      }),
    );
  }
}
