import Phaser from 'phaser';
import BaseTraining from './BaseTraining.js';
import { txt, floatText } from '../../ui/text.js';
import { sfx } from '../../ui/sfx.js';
import { C, CSS } from '../../palette.js';

// Gonfler les ballons avec la vieille pompe du club-house.
// Officiellement : 5 ballons à la bonne pression. En vrai : un ballon qui
// explose, c'est mieux, et un ballon mou devient une excuse pour dimanche.
const BALLS = 5;
const GOOD = [0.72, 0.86]; // zone verte
const BURST = 1;

export default class TrainGonflage extends BaseTraining {
  constructor() {
    super('TrainGonflage');
  }

  create() {
    // Intérieur du local matériel
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x5a4a3a, 1);
    g.fillRect(0, 0, 360, 640);
    g.fillStyle(0x6b5a48, 1);
    for (let y = 60; y < 640; y += 40) g.fillRect(0, y, 360, 2);
    g.fillStyle(C.prefab, 1);
    g.fillRect(0, 420, 360, 220);
    // Filets à ballons et chasubles sur les murs
    g.fillStyle(C.yellow, 1);
    g.fillRect(24, 90, 50, 70);
    txt(this, 49, 170, 'CHASUBLES', 8, CSS.cream, { stroke: CSS.outline }).setDepth(1);

    this.president = this.add.image(300, 380, 'coach').setScale(3).setDepth(3).setFlipX(true);
    txt(this, 300, 336, 'Le président', 9, CSS.cream, { stroke: CSS.outline }).setDepth(3);

    this.ballImg = this.add.image(180, 330, 'ball').setScale(6).setDepth(4);
    // Manomètre
    this.gauge = this.add.graphics().setDepth(5);
    this.pressureText = txt(this, 180, 470, '', 14, CSS.outline, { bold: true }).setDepth(6);
    this.countText = txt(this, 180, 110, '', 12, CSS.cream, { stroke: CSS.outline }).setDepth(6);

    this.ballNo = 0;
    this.pressure = 0;
    this.good = 0;
    this.burst = 0;
    this.soft = 0;
    this.hard = 0;

    this.makeBtn(100, 570, 44, 'POMPER', C.red, () => this.pump());
    this.makeBtn(260, 570, 36, 'VALIDER', C.yellow, () => this.validate(), CSS.outline);
    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown-X', () => this.pump());
      kb.on('keydown-SPACE', () => this.pump());
      kb.on('keydown-C', () => this.validate());
    }

    this.setup({ title: 'Gonfler les ballons', objective: `${BALLS} ballons à la bonne pression`, duration: 40 });
    this.nextBall();
  }

  makeBtn(x, y, r, label, fill, cb, color = CSS.cream) {
    const c = this.add.circle(x, y, r, fill, 0.9).setStrokeStyle(3, C.outline).setDepth(60).setInteractive();
    txt(this, x, y, label, 12, color, { bold: true, stroke: color === CSS.cream ? CSS.outline : undefined }).setDepth(61);
    c.on('pointerdown', () => {
      c.setScale(0.9);
      cb();
    });
    c.on('pointerup', () => c.setScale(1));
    c.on('pointerout', () => c.setScale(1));
  }

  nextBall() {
    if (this.ballNo >= BALLS) return this.end();
    this.ballNo++;
    this.pressure = 0.1;
    this.ballImg.setVisible(true).setScale(4);
    this.countText.setText(`Ballon ${this.ballNo}/${BALLS}   Bons : ${this.good}`);
  }

  pump() {
    if (!this.running || this.over || !this.ballImg.visible) return;
    this.pressure += Phaser.Math.FloatBetween(0.045, 0.075);
    sfx.pump(this);
    if (this.pressure >= BURST) this.explode();
  }

  explode() {
    this.burst++;
    this.ballImg.setVisible(false);
    sfx.stamp(this);
    this.cameras.main.shake(200, 0.02);
    floatText(this, 180, 300, 'BOUM', CSS.red, 30);
    floatText(this, 300, 320, "C'EST 25 € LE BALLON !", CSS.red, 11);
    this.legende(40, 'Ballon explosé', 180, 260);
    sfx.laugh(this);
    this.firstPecab();
    this.time.delayedCall(1000, () => this.nextBall());
  }

  validate() {
    if (!this.running || this.over || !this.ballImg.visible) return;
    const p = this.pressure;
    if (p >= GOOD[0] && p <= GOOD[1]) {
      this.good++;
      this.niveau(1);
      this.legende(-3, 'Parfait.', 180, 260);
    } else if (p < GOOD[0]) {
      this.soft++;
      this.career.flags.ballonsMous = (this.career.flags.ballonsMous ?? 0) + 1;
      this.legende(20, 'Ballon mou', 180, 260);
      floatText(this, 300, 320, 'Il est un peu mou non ?', CSS.cream, 10);
    } else {
      this.hard++;
      this.legende(10, 'Ballon en béton', 180, 260);
    }
    this.ballImg.setVisible(false);
    this.time.delayedCall(500, () => this.nextBall());
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    if (!this.tickTimer(dt)) {
      if (this.running && !this.over) this.end();
      return;
    }
    // La pompe fuit : la pression redescend doucement
    if (this.ballImg.visible) this.pressure = Math.max(0.05, this.pressure - 0.05 * dt);
    this.ballImg.setScale(3 + this.pressure * 4);

    const g = this.gauge;
    g.clear();
    const x = 60;
    const y = 440;
    const w = 240;
    g.fillStyle(C.cream, 1);
    g.fillRect(x, y, w, 16);
    g.fillStyle(0x3f9e4d, 1);
    g.fillRect(x + w * GOOD[0], y, w * (GOOD[1] - GOOD[0]), 16);
    g.fillStyle(C.red, 1);
    g.fillRect(x + w * 0.93, y, w * 0.07, 16);
    g.lineStyle(2, C.outline, 1);
    g.strokeRect(x, y, w, 16);
    g.fillStyle(C.outline, 1);
    g.fillRect(x + w * Math.min(1, this.pressure) - 2, y - 6, 4, 28);
    this.pressureText.setText(`${(this.pressure * 1.2).toFixed(2)} bar`);
  }

  end() {
    let coach = 'Le président : « Bon. On jouera avec ça dimanche. »';
    if (this.burst >= 2) coach = 'Le président : « Plus JAMAIS tu touches la pompe. »';
    else if (this.soft >= 2) coach = 'Coach Gérard : « Ils sont tout mous tes ballons. » (excuse toute trouvée pour dimanche)';
    else if (this.good === BALLS) coach = 'Le président : « Toi, tu gonfles les ballons toute la saison. »';
    this.finish(
      [
        ['Ballons parfaits', `${this.good}/${BALLS}`],
        ['Ballons explosés', this.burst],
        ['Ballons mous', this.soft],
        ['Ballons en béton', this.hard],
      ],
      coach,
    );
  }
}
