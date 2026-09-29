import Phaser from 'phaser';
import BaseTraining from './BaseTraining.js';
import { txt, title, floatText, tag, roundBtn } from '../../ui/text.js';
import { sfx } from '../../ui/sfx.js';
import { grass } from './decor.js';
import { C, CSS } from '../../palette.js';
import { portraitKey } from '../../assets.js';

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
    // Deux découpages papier : le coach montre, tu copies.
    this.coach = this.cutout('coach', 100);
    this.user = this.cutout(this.char.id, 262);
    this.coachLabel = tag(this, 100, 446, '', 13, CSS.yellow).setDepth(5);
    this.userLabel = tag(this, 262, 446, '', 12, CSS.paper).setDepth(5);
    this.arrow = title(this, 100, 160, '', 54, CSS.yellow, { stroke: CSS.ink, strokeThickness: 6 }).setDepth(5);
    this.counter = tag(this, 180, 470, '', 12, CSS.paper).setDepth(5);
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
    for (const [pose, x, y] of btns) this.makeBtn(x, y, POSES[pose].arrow, () => this.press(pose), C.paper);
    this.makeBtn(300, 560, "S'ALLONGER", () => this.press('lie'), C.red, 38, 13);
    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown-UP', () => this.press('up'));
      kb.on('keydown-DOWN', () => this.press('down'));
      kb.on('keydown-LEFT', () => this.press('left'));
      kb.on('keydown-RIGHT', () => this.press('right'));
      kb.on('keydown-SPACE', () => this.press('lie'));
    }

    this.setup({ title: 'Étirements', objective: `copie le coach (${ROUNDS} postures)`, duration: ROUNDS * WINDOW + 3, intro: { text: 'Étirements. Tu fais comme moi. Et on ne s\'allonge pas.' } });
    this.time.delayedCall(2400, () => this.nextRound());
  }

  makeBtn(x, y, label, cb, fill, r = 28, size = 22) {
    return roundBtn(this, x, y, r, label, fill, cb, { size });
  }

  // Portrait découpé, posé au sol (origine en bas), avec son ombre
  cutout(id, x) {
    this.add.ellipse(x, 432, 120, 14, C.ink, 0.18).setDepth(2);
    const img = this.add.image(x, 430, portraitKey(id, 'neutre')).setOrigin(0.5, 1).setDepth(3);
    img.id = id;
    img.base = 128 / img.width;
    img.setScale(img.base);
    return img;
  }

  // Applique une posture au découpage (et l'expression qui va avec)
  pose(sprite, p, expr = 'neutre') {
    const b = sprite.base;
    const key = portraitKey(sprite.id, expr);
    if (this.textures.exists(key)) sprite.setTexture(key);
    this.tweens.killTweensOf(sprite);
    let to = { angle: 0, scaleX: b, scaleY: b, y: 430 };
    if (p === 'up') to = { ...to, scaleY: b * 1.18, scaleX: b * 0.94 };
    else if (p === 'down') to = { ...to, scaleX: b * 1.12, scaleY: b * 0.7 };
    else if (p === 'left') to.angle = -16;
    else if (p === 'right') to.angle = 16;
    else if (p === 'lie') to = { ...to, angle: 90, y: 440 };
    this.tweens.add({ targets: sprite, ...to, duration: 160, ease: 'Back.easeOut' });
  }

  nextRound() {
    if (this.over) return;
    // On attend la fin des dialogues (intro du coach, claquage…)
    if (this.talking || !this.running) {
      this.time.delayedCall(200, () => this.nextRound());
      return;
    }
    if (this.round >= ROUNDS) return this.end();
    this.round++;
    this.target = Phaser.Utils.Array.GetRandom(KEYS);
    this.answered = false;
    this.roundStart = this.elapsed;
    this.pose(this.coach, this.target, 'fier');
    this.coachLabel.setText(POSES[this.target].label);
    this.arrow.setText(POSES[this.target].arrow);
    this.counter.setText(`Posture ${this.round}/${ROUNDS}   Réussies : ${this.good}`);
    sfx.select(this);
    this.time.delayedCall(WINDOW * 1000, () => {
      if (!this.answered && !this.over) {
        this.userLabel.setText('...');
        floatText(this, 100, 250, 'TU DORS ?', CSS.red, 12);
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
      this.pose(u, 'lie', 'choque');
      this.userLabel.setText('AÏE');
      sfx.thud(this);
      this.legende(40, "Claquage en s'étirant", 250, 260);
      this.talk('coach', "Tu t'es claqué… en t'ÉTIRANT ?", { expr: 'choque', auto: 1800 });
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
    this.pose(u, p, p === 'lie' ? 'rire' : p === this.target ? 'fier' : 'gueule');
    if (p === 'lie') {
      this.naps++;
      this.userLabel.setText('Sieste');
      this.legende(12, 'Sieste', 250, 260);
      if (this.naps === 3) floatText(this, 100, 250, 'DEBOUT !', CSS.red, 14);
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
      this.bar.fillStyle(C.ink, 1);
      this.bar.fillRect(28, 198, 148, 10);
      this.bar.fillStyle(C.yellow, 1);
      this.bar.fillRect(30, 200, 144 * left, 6);
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
