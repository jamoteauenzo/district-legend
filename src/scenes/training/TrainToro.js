import Phaser from 'phaser';
import BaseTraining from './BaseTraining.js';
import { Controls } from '../../ui/controls.js';
import { txt, floatText } from '../../ui/text.js';
import { sfx } from '../../ui/sfx.js';
import { grass } from './decor.js';
import { C, CSS } from '../../palette.js';

// Le toro : les coéquipiers se font des passes en cercle, tu es au milieu.
// Officiellement : récupérer 3 ballons. En vrai : tacler les copains, se
// prendre des petits ponts et bouder rapportent bien plus.
const CX = 180;
const CY = 330;
const R = 120;
const TARGET = 3;
const PASSERS = ['mate1', 'mate2', 'mate3', 'bibJeanmi', 'bibEnzo'];
const NAMES = ['Fred', 'Momo', 'Kylian', 'Jean-Mi', 'Enzo'];

export default class TrainToro extends BaseTraining {
  constructor() {
    super('TrainToro');
  }

  create() {
    grass(this);
    const g = this.add.graphics().setDepth(1);
    g.lineStyle(2, C.chalk, 0.7);
    g.strokeCircle(CX, CY, R);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      this.add.image(CX + Math.cos(a) * (R + 16), CY + Math.sin(a) * (R + 16), 'coupelle').setScale(2).setDepth(1);
    }

    this.passers = PASSERS.map((key, i) => {
      const a = (i / PASSERS.length) * Math.PI * 2 - Math.PI / 2;
      const p = this.add.image(CX + Math.cos(a) * R, CY + Math.sin(a) * R, key).setScale(2).setDepth(4);
      p.name = NAMES[i];
      p.hitUntil = 0;
      return p;
    });
    this.user = this.add.image(CX, CY, `p_${this.char.id}`).setScale(2).setDepth(5);
    this.user.facing = new Phaser.Math.Vector2(0, -1);
    this.ball = this.add.image(0, 0, 'ball').setScale(2).setDepth(6);

    this.recovered = 0;
    this.tackles = 0;
    this.oles = 0;
    this.nutmegs = 0;
    this.sulks = 0;
    this.sulkUntil = 0;
    this.lastSulk = -99;
    this.slideUntil = 0;
    this.holder = this.passers[0];
    this.holdUntil = 0;
    this.flight = null;

    this.countText = txt(this, 180, 490, '', 12, CSS.cream, { stroke: CSS.outline }).setDepth(50);
    this.controls = new Controls(this, { onA: () => this.tackle(), onB: () => this.sulk() });
    this.controls.setLabels('TACLE', 'BOUDER');

    this.setup({ title: 'Le toro', objective: `récupère ${TARGET} ballons`, duration: 45 });
    this.refresh();
  }

  refresh() {
    this.countText.setText(`Ballons récupérés : ${this.recovered}/${TARGET}`);
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.controls.update(delta);
    if (!this.tickTimer(dt)) {
      if (this.running && !this.over) this.end();
      if (!this.running) this.placeBallAtHolder();
      return;
    }
    this.updateUser(dt);
    this.updateBall(dt);
  }

  placeBallAtHolder() {
    this.ball.setPosition(this.holder.x, this.holder.y + 10);
  }

  updateUser(dt) {
    const u = this.user;
    const now = this.time.now;
    if (now < this.sulkUntil) return;
    if (now < this.slideUntil) {
      u.x += u.slideV.x * dt;
      u.y += u.slideV.y * dt;
      this.checkTackle();
    } else {
      if (u.angle !== 0) u.setAngle(0);
      const v = this.controls.vector;
      const speed = 105 * (1 - (this.career.stats.bide - 1) * 0.05);
      if (v.length() > 0.1) {
        u.facing.set(v.x, v.y).normalize();
        u.x += v.x * speed * dt;
        u.y += v.y * speed * dt;
        u.setAngle(Math.sin(this.elapsed * 16) * 5);
        if (v.x) u.setFlipX(v.x < 0);
      }
    }
    // Rester dans le cercle
    const d = Phaser.Math.Distance.Between(u.x, u.y, CX, CY);
    if (d > R - 24) {
      u.x = CX + ((u.x - CX) / d) * (R - 24);
      u.y = CY + ((u.y - CY) / d) * (R - 24);
    }
  }

  updateBall(dt) {
    const b = this.ball;
    if (!this.flight) {
      this.placeBallAtHolder();
      if (this.elapsed > this.holdUntil) this.pass();
      return;
    }
    const f = this.flight;
    f.t += dt;
    const k = Math.min(1, f.t / f.dur);
    b.x = f.from.x + (f.to.x - f.from.x) * k;
    b.y = f.from.y + (f.to.y - f.from.y) * k;
    b.angle += 20;

    const u = this.user;
    const du = Phaser.Math.Distance.Between(u.x, u.y + 10, b.x, b.y);
    // Interception (pas pendant qu'on boude)
    if (du < 11 && this.time.now > this.sulkUntil) {
      if (Math.random() < 0.25 && !f.nutmegChecked) {
        // Petit pont !
        f.nutmegChecked = true;
        this.nutmegs++;
        this.legende(15, 'PETIT PONT !', u.x, u.y - 30);
        this.cheerRing('OLÉÉÉ');
        sfx.laugh(this);
        if (this.nutmegs === 1) this.firstPecab();
      } else if (!f.nutmegChecked) return this.intercept();
    } else if (du < 26 && !f.oleDone) {
      f.oleDone = true;
      this.oles++;
      this.legende(4, 'Olé', u.x, u.y - 30);
      this.cheerRing('OLÉ !');
    }
    if (k >= 1) {
      this.holder = f.target;
      this.flight = null;
      this.holdUntil = this.elapsed + Phaser.Math.FloatBetween(0.35, 0.7);
    }
  }

  pass() {
    const others = this.passers.filter((p) => p !== this.holder && this.time.now > p.hitUntil);
    if (!others.length) return;
    const target = Phaser.Utils.Array.GetRandom(others);
    const from = { x: this.holder.x, y: this.holder.y + 10 };
    const to = { x: target.x, y: target.y + 10 };
    const len = Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);
    this.flight = { from, to, t: 0, dur: len / 230, target };
    sfx.kick(this);
  }

  intercept() {
    this.recovered++;
    this.niveau(3);
    this.legende(-5, 'Récupéré', this.user.x, this.user.y - 30);
    this.flight = null;
    // Celui qui a perdu la balle va au milieu… en théorie. Ici on relance.
    this.holder = Phaser.Utils.Array.GetRandom(this.passers);
    this.holdUntil = this.elapsed + 0.8;
    floatText(this, this.holder.x, this.holder.y - 26, 'Bon ok...', CSS.cream, 10);
    this.refresh();
    if (this.recovered >= TARGET) {
      this.niveau(3);
      floatText(this, 180, 120, 'Le coach hoche la tête...', CSS.cream, 11);
    }
  }

  tackle() {
    if (!this.running || this.over) return;
    const u = this.user;
    const now = this.time.now;
    if (now < this.slideUntil + 400 || now < this.sulkUntil) return;
    this.slideUntil = now + 280;
    u.slideV = u.facing.clone().scale(230);
    u.setAngle(u.facing.x < 0 ? -90 : 90);
    u.tackleHit = false;
    sfx.tackle(this);
  }

  checkTackle() {
    const u = this.user;
    if (u.tackleHit) return;
    // Le ballon en vol : interception au tacle
    if (this.flight && Phaser.Math.Distance.Between(u.x, u.y, this.ball.x, this.ball.y) < 16) {
      u.tackleHit = true;
      return this.intercept();
    }
    const victim = this.passers.find((p) => Phaser.Math.Distance.Between(u.x, u.y, p.x, p.y) < 20 && this.time.now > p.hitUntil);
    if (!victim) return;
    u.tackleHit = true;
    this.tackles++;
    victim.hitUntil = this.time.now + 1500;
    victim.setAngle(90);
    this.time.delayedCall(1400, () => victim.setAngle(0));
    sfx.thud(this);
    const lines = ['OH ÇA VA PAS ?!', "C'EST UN TORO !", 'T\'ES MALADE ?'];
    floatText(this, victim.x, victim.y - 28, Phaser.Utils.Array.GetRandom(lines), CSS.red, 11);
    this.legende(25, `Tacle sur ${victim.name}`, u.x, u.y - 40);
    if (this.tackles === 1) this.firstPecab();
    if (this.tackles === 3) {
      this.legende(40, 'Jean-Mi veut se battre', 180, 150);
      floatText(this, 180, 130, 'Jean-Mi : « VIENS DERRIÈRE LE CLUB-HOUSE »', CSS.cream, 10);
    }
  }

  // Bouder : assis au milieu, bras croisés
  sulk() {
    if (!this.running || this.over) return;
    if (this.elapsed - this.lastSulk < 6) return;
    this.lastSulk = this.elapsed;
    this.sulks++;
    this.sulkUntil = this.time.now + 2500;
    this.user.setAngle(0);
    floatText(this, this.user.x, this.user.y - 30, '*boude*', CSS.cream, 11);
    this.legende(15, 'Boude', this.user.x, this.user.y - 46);
  }

  cheerRing(text) {
    const p = Phaser.Utils.Array.GetRandom(this.passers);
    floatText(this, p.x, p.y - 26, text, CSS.yellow, 11);
  }

  end() {
    let coach = 'Coach Gérard : « Tu étais au milieu pendant 45 secondes. Record du club. »';
    if (this.tackles >= 3) coach = 'Coach Gérard : « C\'est un TORO. Pas un combat de rue. »';
    else if (this.recovered >= TARGET) coach = 'Fred : « Il est chaud lui... trop chaud. »';
    else if (this.sulks >= 2) coach = 'Jean-Mi : « Il boude encore le petit ? »';
    this.finish(
      [
        ['Ballons récupérés', `${this.recovered}/${TARGET}`],
        ['Olés subis', this.oles],
        ['Petits ponts subis', this.nutmegs],
        ['Tacles sur les copains', this.tackles],
        ['Bouderies', this.sulks],
      ],
      coach,
    );
  }
}
