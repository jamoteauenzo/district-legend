import Phaser from 'phaser';
import BaseTraining from './BaseTraining.js';
import { txt, floatText } from '../../ui/text.js';
import { sfx } from '../../ui/sfx.js';
import { grass } from './decor.js';
import { C, CSS } from '../../palette.js';

// Étirements : le coach prend une posture, tu dois la copier à temps.
// Officiellement : suivre le coach. En vrai : la mauvaise posture, la sieste
// et le claquage en s'étirant, c'est bien plus district.
const POSES = {
  up: { label: 'Bras en l\'air', arrow: '↑' },
  down: { label: 'Toucher les pieds', arrow: '↓' },
  left: { label: 'Quadri gauche', arrow: '←' },
  right: { label: 'Quadri droit', arrow: '→' },
};
const KEYS = Object.keys(POSES);
const ROUNDS = 12;
const WINDOW = 1.7; // secondes par posture

const FREE_POSES = ['Yoga district', 'Posture interdite', 'Le flamant rose', 'Étirement du dos (en fait non)'];

export default class TrainEtirements extends BaseTraining {
  constructor() {
    super('TrainEtirements');
  }

  create() {
    grass(this);
    this.coach = this.add.image(110, 330, 'coach').setScale(6).setDepth(3);
    this.user = this.add.image(250, 330, `p_${this.char.id}`).setScale(6).setDepth(3);
    this.coachLabel = txt(this, 110, 420, '', 13, CSS.yellow, { bold: true, stroke: CSS.outline }).setDepth(5);
    this.userLabel = txt(this, 250, 420, '', 12, CSS.cream, { stroke: CSS.outline }).setDepth(5);
    this.arrow = txt(this, 110, 180, '', 54, CSS.yellow, { bold: true, stroke: CSS.outline, strokeThickness: 5 }).setDepth(5);
    this.counter = txt(this, 180, 470, '', 12, CSS.cream, { stroke: CSS.outline }).setDepth(5);
    this.bar = this.add.graphics().setDepth(5);

    this.round = 0;
    this.good = 0;
    this.free = 0;
    this.naps = 0;
    this.injured = false;
    this.lastPressAt = -99;
    this.lastPress = null;

    // Quatre flèches + « s'allonger »
    const btns = [
      ['left', 60, 560],
      ['up', 130, 530],
      ['down', 130, 596],
      ['right', 200, 560],
    ];
    for (const [pose, x, y] of btns) this.makeBtn(x, y, POSES[pose].arrow, () => this.press(pose), C.cream, CSS.outline);
    this.makeBtn(300, 560, "S'ALLONGER", () => this.press('lie'), C.red, CSS.cream, 38, 10);
    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown-UP', () => this.press('up'));
      kb.on('keydown-DOWN', () => this.press('down'));
      kb.on('keydown-LEFT', () => this.press('left'));
      kb.on('keydown-RIGHT', () => this.press('right'));
      kb.on('keydown-SPACE', () => this.press('lie'));
    }

    this.setup({ title: 'Étirements', objective: `copie le coach (${ROUNDS} postures)`, duration: ROUNDS * WINDOW + 3 });
    this.time.delayedCall(2400, () => this.nextRound());
  }

  makeBtn(x, y, label, cb, fill, color, r = 28, size = 22) {
    const c = this.add.circle(x, y, r, fill, 0.9).setStrokeStyle(3, C.outline).setDepth(60).setInteractive();
    txt(this, x, y, label, size, color, { bold: true }).setDepth(61);
    c.on('pointerdown', () => {
      c.setScale(0.9);
      cb();
    });
    c.on('pointerup', () => c.setScale(1));
    c.on('pointerout', () => c.setScale(1));
  }

  // Applique une posture à un sprite (transformations simples)
  pose(sprite, p) {
    sprite.setAngle(0).setScale(6).setY(330);
    if (p === 'up') sprite.setScale(6, 7);
    else if (p === 'down') sprite.setScale(6.6, 4.4).setY(355);
    else if (p === 'left') sprite.setAngle(-18);
    else if (p === 'right') sprite.setAngle(18);
    else if (p === 'lie') sprite.setAngle(90).setY(380);
  }

  nextRound() {
    if (this.over) return;
    if (this.round >= ROUNDS) return this.end();
    this.round++;
    this.target = Phaser.Utils.Array.GetRandom(KEYS);
    this.answered = false;
    this.roundStart = this.elapsed;
    this.pose(this.coach, this.target);
    this.coachLabel.setText(POSES[this.target].label);
    this.arrow.setText(POSES[this.target].arrow);
    this.counter.setText(`Posture ${this.round}/${ROUNDS}   Réussies : ${this.good}`);
    sfx.select(this);
    this.time.delayedCall(WINDOW * 1000, () => {
      if (!this.answered && !this.over) {
        this.userLabel.setText('...');
        floatText(this, 110, 250, 'TU DORS ?', CSS.red, 12);
      }
      this.nextRound();
    });
  }

  press(p) {
    if (!this.running || this.over || !this.target) return;
    const u = this.user;

    // Deux fois la même posture trop vite : claquage
    if (p === this.lastPress && this.elapsed - this.lastPressAt < 0.35 && !this.injured && p !== 'lie') {
      this.injured = true;
      this.pose(u, 'lie');
      this.userLabel.setText('AÏE');
      sfx.thud(this);
      this.legende(40, "Claquage en s'étirant", 250, 260);
      floatText(this, 110, 250, "Tu t'es claqué en t'ÉTIRANT ?!", CSS.red, 11);
      sfx.laugh(this);
      this.firstPecab();
      return;
    }
    this.lastPress = p;
    this.lastPressAt = this.elapsed;
    if (this.answered) return;
    this.answered = true;

    if (this.injured) {
      this.userLabel.setText('*boite*');
      return;
    }
    this.pose(u, p);
    if (p === 'lie') {
      this.naps++;
      this.userLabel.setText('Sieste');
      this.legende(12, 'Sieste', 250, 260);
      if (this.naps === 3) floatText(this, 110, 250, 'DEBOUT !', CSS.red, 14);
    } else if (p === this.target) {
      this.good++;
      this.niveau(0.5);
      this.legende(-2, null);
      this.userLabel.setText('Bien.');
    } else {
      this.free++;
      const label = Phaser.Utils.Array.GetRandom(FREE_POSES);
      this.userLabel.setText(label);
      this.legende(8, label, 250, 260);
    }
    this.counter.setText(`Posture ${this.round}/${ROUNDS}   Réussies : ${this.good}`);
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    if (!this.tickTimer(dt)) {
      if (this.running && !this.over) this.end();
      return;
    }
    // Barre de temps restant pour la posture en cours
    this.bar.clear();
    if (this.target && !this.over) {
      const left = Math.max(0, 1 - (this.elapsed - this.roundStart) / WINDOW);
      this.bar.fillStyle(C.yellow, 1);
      this.bar.fillRect(40, 210, 140 * left, 6);
    }
  }

  end() {
    let coach = 'Coach Gérard : « Souplesse zéro. Comme d\'habitude. »';
    if (this.injured) coach = 'Le kiné bénévole : « Première fois que je vois ça. »';
    else if (this.naps >= 3) coach = 'Coach Gérard : « On n\'est pas au camping ! »';
    else if (this.good >= ROUNDS - 1) coach = 'Coach Gérard : « Tu fais du yoga ou quoi ? » (Fred ricane)';
    this.finish(
      [
        ['Postures réussies', `${this.good}/${ROUNDS}`],
        ['Postures libres', this.free],
        ['Siestes', this.naps],
        ["Claquage en s'étirant", this.injured ? 'Oui' : 'Non'],
      ],
      coach,
    );
  }
}
