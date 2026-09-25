import Phaser from 'phaser';
import BaseTraining from './BaseTraining.js';
import { txt, floatText } from '../../ui/text.js';
import { sfx } from '../../ui/sfx.js';
import { clubhouse, parking } from './decor.js';
import { C, CSS } from '../../palette.js';

// Jongles, vue de côté. Le ballon retombe à gauche ou à droite : il faut
// taper avec le bon pied au bon moment. Officiellement : 20 d'affilée.
// En vrai : le ballon qui part sur le coach, le chien ou la vitre, c'est mieux.
const FOOT_Y = 520; // hauteur des pieds
const ZONE = [478, 540]; // fenêtre de frappe (ballon qui descend)
const LEFT_X = 166;
const RIGHT_X = 194;
const BALLS = 3;
const TARGET = 20;

const VICTIMS = [
  { id: 'coach', label: 'Sur le coach !', x: 62, y: 430, pts: 40 },
  { id: 'dog', label: 'Kaiser !', x: 312, y: 500, pts: 30 },
  { id: 'vitre', label: 'La vitre du club-house !', x: 60, y: 300, pts: 50 },
  { id: 'voiture', label: 'Sur une voiture !', x: 300, y: 405, pts: 30 },
];

export default class TrainJongles extends BaseTraining {
  constructor() {
    super('TrainJongles');
  }

  create() {
    // Décor vu de côté
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(C.sky, 1);
    g.fillRect(0, 0, 360, 440);
    g.fillStyle(C.grass, 1);
    g.fillRect(0, 440, 360, 200);
    g.fillStyle(C.grassDark, 1);
    for (let i = 0; i < 9; i++) g.fillRect(i * 44, 440, 22, 200);
    clubhouse(this, 10, 270, 120, 90);
    parking(this, 240, 380, 120, 50);

    this.coach = this.add.image(62, 470, 'coach').setScale(4).setDepth(3);
    this.dog = this.add.image(312, 510, 'dog').setScale(3).setDepth(3).setFlipX(true);
    this.user = this.add.image(180, FOOT_Y - 34, `p_${this.char.id}`).setScale(5).setDepth(4);
    this.shadow = this.add.ellipse(180, FOOT_Y + 6, 16, 5, C.outline, 0.3).setDepth(3);
    this.ball = this.add.image(180, 200, 'ball').setScale(3).setDepth(6);
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ballState = 'wait';

    this.streak = 0;
    this.best = 0;
    this.ballsLeft = BALLS;
    this.lost = 0;
    this.whiffs = 0;
    this.victims = {};
    this.gravity = 1100;

    this.streakText = txt(this, 180, 110, '', 40, CSS.cream, { bold: true, stroke: CSS.outline, strokeThickness: 5 }).setDepth(50);
    this.ballsText = txt(this, 180, 150, '', 12, CSS.cream, { stroke: CSS.outline }).setDepth(50);

    // Deux gros boutons : pied gauche, pied droit
    this.btnG = this.makeFootButton(80, 590, 'PIED G', 'L');
    this.btnD = this.makeFootButton(280, 590, 'PIED D', 'R');
    const kb = this.input.keyboard;
    if (kb) {
      for (const k of ['LEFT', 'Q', 'A']) kb.on(`keydown-${k}`, () => this.foot('L'));
      for (const k of ['RIGHT', 'D']) kb.on(`keydown-${k}`, () => this.foot('R'));
    }

    this.setup({ title: 'Jongles', objective: `${TARGET} jongles d'affilée`, duration: 50 });
    this.time.delayedCall(2300, () => this.newBall());
    this.refreshTexts();
  }

  makeFootButton(x, y, label, side) {
    const c = this.add.circle(x, y, 36, side === 'L' ? C.blue : C.red, 0.85).setStrokeStyle(3, C.outline).setDepth(60);
    txt(this, x, y, label, 12, CSS.cream, { bold: true, stroke: CSS.outline }).setDepth(61);
    c.setInteractive();
    c.on('pointerdown', () => {
      c.setScale(0.92);
      this.foot(side);
    });
    c.on('pointerup', () => c.setScale(1));
    c.on('pointerout', () => c.setScale(1));
    return c;
  }

  refreshTexts() {
    this.streakText.setText(this.streak ? String(this.streak) : '');
    this.ballsText.setText(`Ballon ${Math.min(BALLS, BALLS - this.ballsLeft + 1)}/${BALLS}   Record : ${this.best}`);
  }

  newBall() {
    if (this.over) return;
    if (this.ballsLeft <= 0) return this.end();
    const side = Math.random() < 0.5 ? LEFT_X : RIGHT_X;
    this.ball.setPosition(side, 180).setAngle(0);
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ballState = 'play';
    this.streak = 0;
    this.refreshTexts();
    floatText(this, 62, 420, 'Allez, à toi !', CSS.cream, 10);
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    if (!this.tickTimer(dt)) {
      if (this.running && !this.over) this.end();
      return;
    }
    const b = this.ball;
    if (this.ballState !== 'play') return;
    b.vy += this.gravity * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.angle += b.vx * dt * 3;
    this.shadow.x = b.x;
    // Ballon raté : il tombe au sol et roule
    if (b.y > FOOT_Y + 20) this.drop();
  }

  foot(side) {
    if (!this.running || this.over || this.ballState !== 'play') return;
    const b = this.ball;
    const u = this.user;
    this.tweens.add({ targets: u, angle: side === 'L' ? -8 : 8, duration: 70, yoyo: true });
    const inZone = b.vy > 0 && b.y >= ZONE[0] && b.y <= ZONE[1];
    const need = b.x < 180 ? 'L' : 'R';

    if (!inZone) {
      // Pied dans le vide : ça fait rire le coach
      this.whiffs++;
      if (this.whiffs <= 3) this.legende(5, 'Dans le vide', u.x, u.y - 60);
      return;
    }
    if (side !== need) return this.wrongFoot();

    // Jongle réussi
    sfx.kick(this);
    this.streak++;
    this.best = Math.max(this.best, this.streak);
    this.niveau(0.35);
    const next = Math.random() < 0.5 ? LEFT_X : RIGHT_X;
    b.vy = -Phaser.Math.Between(560, 640);
    const air = (2 * -b.vy) / this.gravity;
    b.vx = (next - b.x) / air;
    this.gravity = 1100 + this.streak * 18; // de plus en plus rapide
    this.refreshTexts();
    if (this.streak === TARGET) {
      this.niveau(5);
      this.legende(-20, 'Record battu...', 180, 180);
      floatText(this, 62, 420, '*filme avec son téléphone*', CSS.cream, 10);
    }
  }

  // Mauvais pied : le ballon part n'importe où, et c'est ça qui paye.
  wrongFoot() {
    const b = this.ball;
    const v = Phaser.Utils.Array.GetRandom(VICTIMS);
    this.ballState = 'fly';
    sfx.kick(this);
    this.victims[v.id] = (this.victims[v.id] ?? 0) + 1;
    this.tweens.add({
      targets: b,
      x: v.x,
      y: v.y,
      angle: 720,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.legende(v.pts, v.label, v.x < 180 ? v.x + 70 : v.x - 50, v.y - 30);
        if (v.id === 'coach') {
          sfx.thud(this);
          floatText(this, 62, 400, 'AÏE ! MA TÊTE !', CSS.red, 12);
          this.tweens.add({ targets: this.coach, angle: -15, duration: 100, yoyo: true, repeat: 2 });
        } else if (v.id === 'dog') {
          sfx.bark(this);
          this.tweens.add({ targets: this.dog, x: 390, duration: 900 });
          this.time.delayedCall(2500, () => this.dog.setX(312));
        } else if (v.id === 'vitre') {
          sfx.stamp(this);
          floatText(this, 60, 280, 'CRAAASH', CSS.cream, 14);
        } else {
          sfx.alarm(this);
        }
        sfx.laugh(this);
        this.firstPecab();
        this.loseBall();
      },
    });
  }

  drop() {
    this.ballState = 'dead';
    this.lost++;
    sfx.loss(this);
    this.legende(5, 'Raté', this.user.x, this.user.y - 60);
    this.tweens.add({ targets: this.ball, x: this.ball.x + Phaser.Math.Between(-80, 80), y: FOOT_Y + 30, angle: 360, duration: 700 });
    this.loseBall();
  }

  loseBall() {
    this.ballsLeft--;
    this.streak = 0;
    this.refreshTexts();
    this.time.delayedCall(1300, () => this.newBall());
  }

  end() {
    const v = this.victims;
    const victimsCount = Object.values(v).reduce((a, b) => a + b, 0);
    let coach = 'Coach Gérard : « Le ballon, c\'est ton ami. Enfin, normalement. »';
    if (v.coach) coach = 'Coach Gérard : « Tu l\'as fait exprès, avoue. »';
    else if (v.vitre) coach = 'Le président : « Qui va payer la vitre ?! »';
    else if (this.best >= TARGET) coach = 'Coach Gérard : « Pas mal... Tu faisais du futsal ou quoi ? »';
    this.finish(
      [
        ['Meilleure série', `${this.best}/${TARGET}`],
        ['Ballons perdus', this.lost + victimsCount],
        ['Coups dans le vide', this.whiffs],
        ['Coach touché', v.coach ?? 0],
        ['Kaiser touché', v.dog ?? 0],
        ['Vitres cassées', v.vitre ?? 0],
        ['Voitures touchées', v.voiture ?? 0],
      ],
      coach,
    );
  }
}
