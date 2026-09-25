import Phaser from 'phaser';
import BaseTraining from './BaseTraining.js';
import { Controls } from '../../ui/controls.js';
import { txt, floatText } from '../../ui/text.js';
import { sfx } from '../../ui/sfx.js';
import { grass, parking } from './decor.js';
import { C, CSS } from '../../palette.js';

// Finition : le coach centre depuis l'aile, tu reprends devant le but.
// Officiellement : 5 buts sur 10 centres. En vrai : la volée dans le
// parking et le pied dans le vide valent bien plus.
const GOAL = { left: 146, right: 214, y: 92 };
const CROSSES = 10;
const TARGET = 5;

export default class TrainFinition extends BaseTraining {
  constructor() {
    super('TrainFinition');
  }

  create() {
    grass(this);
    parking(this, 0, 44, 360, 30);
    const g = this.add.graphics().setDepth(1);
    g.lineStyle(2, C.chalk, 0.9);
    g.lineBetween(0, GOAL.y, 360, GOAL.y);
    g.strokeRect(80, GOAL.y, 200, 130);
    g.strokeRect(128, GOAL.y, 104, 50);
    g.fillStyle(C.chalk, 1);
    g.fillCircle(180, 200, 2);
    g.fillStyle(C.cream, 1);
    g.fillRect(GOAL.left - 3, GOAL.y - 16, 3, 16);
    g.fillRect(GOAL.right, GOAL.y - 16, 3, 16);
    g.fillRect(GOAL.left - 3, GOAL.y - 16, GOAL.right - GOAL.left + 6, 3);
    g.fillStyle(C.cream, 0.2);
    g.fillRect(GOAL.left, GOAL.y - 13, GOAL.right - GOAL.left, 13);

    this.keeper = this.add.image(180, GOAL.y + 10, 'mateGK').setScale(2).setDepth(4);
    this.coach = this.add.image(330, 320, 'coach').setScale(2).setDepth(4).setFlipX(true);
    this.user = this.add.image(180, 330, `p_${this.char.id}`).setScale(2).setDepth(5);
    this.user.fallUntil = 0;

    this.shadow = this.add.ellipse(0, 0, 8, 3, C.outline, 0.35).setDepth(5).setVisible(false);
    this.ball = this.add.image(-50, -50, 'ball').setScale(2).setDepth(7);
    this.ballState = 'idle';

    this.crossNo = 0;
    this.goals = 0;
    this.volleys = 0;
    this.whiffs = 0;
    this.parkingShots = 0;
    this.wide = 0;
    this.contested = 0;
    this.lastCrossAt = -99;

    this.countText = txt(this, 180, 250, '', 12, CSS.cream, { stroke: CSS.outline }).setDepth(50);
    this.controls = new Controls(this, { onA: () => this.shoot(), onB: () => this.contest() });
    this.controls.setLabels('FRAPPE', 'CONTESTER');

    this.setup({ title: 'Finition', objective: `${TARGET} buts sur ${CROSSES} centres`, duration: 80 });
    this.time.delayedCall(2600, () => this.nextCross());
    this.refresh();
  }

  refresh() {
    this.countText.setText(`Centre ${Math.min(this.crossNo, CROSSES)}/${CROSSES}   Buts : ${this.goals}`);
  }

  nextCross() {
    if (this.over) return;
    if (this.crossNo >= CROSSES) return this.end();
    this.crossNo++;
    this.refresh();
    const from = { x: this.coach.x - 10, y: this.coach.y + 10 };
    const to = { x: Phaser.Math.Between(130, 230), y: Phaser.Math.Between(150, 250) };
    this.cross = { from, to, t: 0, dur: 1.1, height: Phaser.Math.Between(36, 50) };
    this.ballState = 'air';
    this.lastCrossAt = this.elapsed;
    this.shadow.setVisible(true);
    sfx.kick(this);
    this.tweens.add({ targets: this.coach, angle: -10, duration: 90, yoyo: true });
  }

  // Hauteur actuelle du ballon (0 = au sol)
  height() {
    if (this.ballState !== 'air') return 0;
    const t = this.cross.t / this.cross.dur;
    return 4 * this.cross.height * t * (1 - t);
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.controls.update(delta);
    if (!this.tickTimer(dt)) {
      if (this.running && !this.over) this.end();
      return;
    }
    this.updateUser(dt);

    const b = this.ball;
    if (this.ballState === 'air') {
      const c = this.cross;
      c.t += dt;
      const k = Math.min(1, c.t / c.dur);
      this.ground = { x: c.from.x + (c.to.x - c.from.x) * k, y: c.from.y + (c.to.y - c.from.y) * k };
      if (k >= 1) {
        this.ballState = 'ground';
        b.vx = (c.to.x - c.from.x) * 0.25;
        b.vy = (c.to.y - c.from.y) * 0.25;
        this.landedAt = this.elapsed;
      }
    } else if (this.ballState === 'ground') {
      this.ground.x += b.vx * dt;
      this.ground.y += b.vy * dt;
      b.vx *= Math.pow(0.3, dt);
      b.vy *= Math.pow(0.3, dt);
      if (this.elapsed - this.landedAt > 2.2) {
        this.ballState = 'idle';
        floatText(this, 330, 290, 'Centre perdu...', CSS.cream, 10);
        this.hideBall();
        this.time.delayedCall(800, () => this.nextCross());
      }
    }
    if (this.ballState === 'air' || this.ballState === 'ground') {
      b.setPosition(this.ground.x, this.ground.y - this.height());
      this.shadow.setPosition(this.ground.x, this.ground.y + 3);
    }

    // Le gardien suit le ballon
    const tx = Phaser.Math.Clamp(this.ballState === 'shot' ? b.x : this.ground?.x ?? 180, GOAL.left + 6, GOAL.right - 6);
    this.keeper.x += (tx - this.keeper.x) * Math.min(1, 2 * dt);
  }

  updateUser(dt) {
    const u = this.user;
    if (this.time.now < u.fallUntil) return;
    if (u.angle > 45) u.setAngle(0);
    const v = this.controls.vector;
    const speed = 100 * (1 - (this.career.stats.bide - 1) * 0.04);
    u.x = Phaser.Math.Clamp(u.x + v.x * speed * dt, 20, 340);
    u.y = Phaser.Math.Clamp(u.y + v.y * speed * dt, GOAL.y + 30, 560);
    u.setAngle(v.length() > 0.3 ? Math.sin(this.elapsed * 16) * 5 : 0);
    if (v.x) u.setFlipX(v.x < 0);
  }

  shoot() {
    if (!this.running || this.over) return;
    const u = this.user;
    if (this.time.now < u.fallUntil) return;
    if (this.ballState !== 'air' && this.ballState !== 'ground') return;
    const d = Phaser.Math.Distance.Between(u.x, u.y + 10, this.ground.x, this.ground.y);
    const h = this.height();

    if (d < 18 && h < 16) return this.strike(h);
    if (d < 45) {
      // Pied dans le vide : chute garantie
      this.whiffs++;
      u.fallUntil = this.time.now + 700;
      u.setAngle(90);
      sfx.tackle(this);
      this.legende(this.whiffs === 1 ? 35 : 15, 'Pied dans le vide', u.x, u.y - 30);
      if (this.whiffs === 1) {
        sfx.laugh(this);
        this.firstPecab();
      }
    }
  }

  strike(h) {
    const u = this.user;
    const b = this.ball;
    const volley = h > 5;
    if (volley) this.volleys++;
    sfx.kick(this);
    this.ballState = 'shot';
    this.shadow.setVisible(false);
    const talent = this.career.stats.talent;
    // Plus le talent est bas, plus ça part au-dessus
    const over = Math.random() < 0.4 - talent * 0.05 + (volley ? 0.15 : 0);
    const spread = 70 - talent * 9;
    const tx = 180 + Phaser.Math.Between(-spread, spread);
    if (volley) floatText(this, u.x, u.y - 30, 'Volée !', CSS.cream, 11);

    this.tweens.add({
      targets: b,
      x: over ? tx + Phaser.Math.Between(-30, 30) : tx,
      y: over ? 50 : GOAL.y - 6,
      scale: over ? 1.4 : 2,
      duration: over ? 650 : 380,
      ease: 'Quad.easeOut',
      onComplete: () => this.resolveShot(over, tx),
    });
  }

  resolveShot(over, tx) {
    const b = this.ball;
    b.setScale(2);
    if (over) {
      this.parkingShots++;
      sfx.alarm(this);
      this.legende(30, 'Dans le parking !', 180, 130);
      if (this.parkingShots === 1) this.firstPecab();
    } else if (tx < GOAL.left || tx > GOAL.right) {
      this.wide++;
      this.legende(10, 'À côté', 180, 130);
    } else if (Math.abs(this.keeper.x - tx) < 12) {
      floatText(this, this.keeper.x, this.keeper.y - 24, 'Arrêt', CSS.cream, 11);
      this.niveau(1);
    } else {
      this.goals++;
      this.niveau(4);
      this.legende(-15, 'But.', 180, 130);
      floatText(this, 330, 290, 'Bien.', CSS.cream, 10);
    }
    this.refresh();
    this.ballState = 'idle';
    this.time.delayedCall(500, () => this.hideBall());
    this.time.delayedCall(1300, () => this.nextCross());
  }

  hideBall() {
    this.ball.setPosition(-50, -50);
    this.shadow.setVisible(false);
  }

  contest() {
    if (!this.running || this.over) return;
    const u = this.user;
    if (this.elapsed - this.lastCrossAt < 3 && this.contested < 3) {
      this.contested++;
      floatText(this, u.x, u.y - 34, 'Centre pourri coach !', CSS.cream, 11);
      floatText(this, 320, 290, 'Il est parfait mon centre !', CSS.yellow, 10);
      this.legende(10, 'Mauvaise foi', u.x, u.y - 50);
    } else {
      floatText(this, u.x, u.y - 34, 'Le ballon est trop gonflé !', CSS.cream, 11);
    }
  }

  end() {
    let coach = 'Coach Gérard : « On a le droit de viser le cadre, hein. »';
    if (this.goals >= TARGET) coach = 'Coach Gérard : « Voilà ! Enfin un attaquant ! » (il a l\'air ému)';
    else if (this.parkingShots >= 2) coach = 'Le président : « Arrêtez de viser ma voiture ! »';
    else if (this.whiffs >= 2) coach = 'Coach Gérard : « Le ballon, il était LÀ. »';
    this.finish(
      [
        ['Buts', `${this.goals}/${CROSSES}`],
        ['Volées', this.volleys],
        ['Pieds dans le vide', this.whiffs],
        ['Ballons dans le parking', this.parkingShots],
        ['À côté', this.wide],
        ['Contestations', this.contested],
      ],
      coach,
    );
  }
}
