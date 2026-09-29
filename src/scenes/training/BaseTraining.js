import Phaser from 'phaser';
import { state, gainLegende, gainNiveau, save } from '../../state.js';
import { getCharacter } from '../../data/characters.js';
import { advanceWeek } from '../../data/schedule.js';
import { txt, title, floatText } from '../../ui/text.js';
import { Mug } from '../../ui/mug.js';
import { pecab } from '../../ui/pecab.js';
import { sfx } from '../../ui/sfx.js';
import { music } from '../../audio/music.js';
import { muteButton } from '../../ui/muteButton.js';
import { say } from '../../ui/dialogue.js';
import { loadPortraits } from '../../assets.js';
import { C, CSS } from '../../palette.js';
import { setupCamera } from '../../view.js';

// Socle commun des entraînements : barre du haut façon 1c (titre, chrono,
// objectif officiel sur bandeau noir, chope), intro par un personnage,
// gains de Légende et écran de fin.
// 0:45, 1:20…
const clock = (s) => {
  const t = Math.max(0, Math.ceil(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

export default class BaseTraining extends Phaser.Scene {
  // Appelé par Phaser avant create() : la carrière est dispo dès le décor.
  init() {
    this.career = state.career;
    this.char = getCharacter(this.career.charId);
  }

  // Les portraits utiles à la séance (surchargé si besoin)
  portraits() {
    return ['coach'];
  }

  preload() {
    loadPortraits(this, this.portraits());
  }

  // intro = { who, expr, text, type } : le personnage qui présente la séance
  setup({ title: name, objective, duration, intro }) {
    setupCamera(this);
    this.legendeStart = this.career.legende;
    this.title = name;
    this.duration = duration;
    this.elapsed = 0;
    this.running = false;
    this.over = false;
    this.pecabDone = false;

    const fix = (o, d = 100) => o.setScrollFactor(0).setDepth(d);
    // Barre papier de 50 px, filet noir
    fix(this.add.rectangle(0, 0, 360, 50, C.paper).setOrigin(0));
    fix(this.add.rectangle(0, 48, 360, 3, C.ink).setOrigin(0), 101);
    fix(title(this, 12, 25, name, 18, CSS.ink, { ox: 0 }), 101);
    this.timerBox = fix(this.add.rectangle(292, 25, 46, 26, C.red), 101);
    this.timerText = fix(title(this, 292, 25, clock(duration), 15, CSS.paper), 102);
    // Objectif officiel : bandeau noir, italique papier
    const obj = fix(txt(this, 16, 66, `Objectif : ${objective}`, 13, CSS.paper, { italic: true, ox: 0 }), 102);
    fix(this.add.rectangle(10, 66, obj.width + 12, 20, C.ink).setOrigin(0, 0.5), 101);
    this.mug = new Mug(this, 338, 86, 1).setScrollFactor(0).setDepth(101);
    this.mug.setValue(this.career.legende, false);
    muteButton(this, 336, 25);

    music.play('training');
    const start = () => {
      this.running = true;
      sfx.whistle(this);
    };
    if (intro) {
      this.time.delayedCall(300, () => say(this, { who: 'coach', ...intro }).then(start));
    } else {
      this.banner(name.toUpperCase(), `Objectif : ${objective}.`);
      this.time.delayedCall(2200, start);
    }
  }

  tickTimer(dt) {
    if (!this.running || this.over) return false;
    this.elapsed += dt;
    this.timerText.setText(clock(this.duration - this.elapsed));
    return this.elapsed < this.duration;
  }

  banner(head, sub) {
    const bg = this.add.rectangle(180, 250, 360, 76, C.ink, 0.92).setScrollFactor(0).setDepth(250);
    const t1 = title(this, 180, 236, head, 24, CSS.paper).setScrollFactor(0).setDepth(251);
    const t2 = txt(this, 180, 266, sub ?? '', 14, CSS.paper, { italic: true, wrap: 330 }).setScrollFactor(0).setDepth(251);
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
    if (label) floatText(this, x ?? 180, y ?? 300, label, n > 0 ? CSS.red : CSS.grey);
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

  // Un personnage réagit en grand (le jeu se met en pause)
  talk(who, text, opts = {}) {
    return say(this, { who, text, ...opts });
  }

  say(who, x, y, line, color = CSS.ink) {
    return floatText(this, x, y, line, color, 12);
  }

  finish(lines, coach, extra = {}) {
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
        ...extra,
      }),
    );
  }
}
