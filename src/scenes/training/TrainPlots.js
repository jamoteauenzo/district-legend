import Phaser from 'phaser';
import BaseTraining from './BaseTraining.js';
import { Controls } from '../../ui/controls.js';
import { txt, floatText } from '../../ui/text.js';
import { sfx } from '../../ui/sfx.js';
import { grass, clubhouse, parking } from './decor.js';
import { C, CSS } from '../../palette.js';

// La corvée de fin de séance : ramasser les plots et les ramener au sac.
// Officiellement : les 12. En vrai : les planquer derrière le club-house ou
// filer au parking avant que le coach ne te voie.
const COUNT = 12;
const CARRY_MAX = 4;
const BAG = { x: 300, y: 470 };

export default class TrainPlots extends BaseTraining {
  constructor() {
    super('TrainPlots');
  }

  create() {
    grass(this);
    clubhouse(this, 14, 60, 120, 60);
    this.hideZone = new Phaser.Geom.Rectangle(0, 44, 150, 30); // derrière le club-house
    parking(this, 220, 44, 140, 60);
    this.exitZone = new Phaser.Geom.Rectangle(220, 44, 140, 60);
    txt(this, 290, 112, 'PARKING', 9, CSS.cream, { bold: true, stroke: CSS.outline }).setDepth(2);
    txt(this, 75, 52, '(derrière)', 9, CSS.cream, { stroke: CSS.outline }).setDepth(2);

    // Le sac à plots
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(C.navy, 1);
    g.fillRoundedRect(BAG.x - 16, BAG.y - 10, 32, 22, 4);
    txt(this, BAG.x, BAG.y + 22, 'SAC', 9, CSS.cream, { bold: true, stroke: CSS.outline }).setDepth(3);

    this.plots = [];
    for (let i = 0; i < COUNT; i++) {
      const p = this.add.image(Phaser.Math.Between(30, 330), Phaser.Math.Between(160, 540), 'plot').setScale(2).setDepth(3);
      p.state = 'ground';
      this.plots.push(p);
    }

    this.coach = this.add.image(40, 470, 'coach').setScale(2).setDepth(5);
    this.cone = this.add.graphics().setDepth(2);
    this.coachAngle = -Math.PI / 2;
    this.coachSpin = 0.7;

    // Fred s'éclipse dès le début : l'indice
    this.fred = this.add.image(160, 300, 'mate1').setScale(2).setDepth(4);
    this.tweens.add({ targets: this.fred, x: 300, y: 70, duration: 5000, delay: 2600, onComplete: () => this.fred.setVisible(false) });
    this.time.delayedCall(2800, () => floatText(this, 160, 270, 'Fred : allez, salut les gars', CSS.cream, 10));

    this.user = this.add.image(180, 420, `p_${this.char.id}`).setScale(2).setDepth(5);
    this.carried = [];
    this.bagged = 0;
    this.hidden = 0;
    this.caught = 0;
    this.caughtAt = -99;
    this.escaped = false;

    this.countText = txt(this, 180, 140, '', 11, CSS.cream, { stroke: CSS.outline }).setDepth(50);
    this.controls = new Controls(this, { onA: () => this.drop(), onB: () => this.whistleInnocently() });
    this.controls.setLabels('POSER', 'SIFFLOTER');

    this.setup({ title: 'Corvée : les plots', objective: `ramène les ${COUNT} plots au sac`, duration: 40 });
    this.refresh();
  }

  refresh() {
    this.countText.setText(`Au sac : ${this.bagged}/${COUNT}   Dans les bras : ${this.carried.length}`);
  }

  // Le regard du coach balaie le terrain
  coachSees(x, y) {
    const a = Math.atan2(y - this.coach.y, x - this.coach.x);
    let diff = Math.abs(Phaser.Math.Angle.Wrap(a - this.coachAngle));
    return diff < 0.45 && this.time.now > (this.whistleUntil ?? 0);
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.controls.update(delta);
    if (!this.tickTimer(dt)) {
      if (this.running && !this.over) this.end();
      return;
    }
    // Le coach tourne la tête (et change parfois de sens)
    this.coachAngle += this.coachSpin * dt;
    if (Math.random() < 0.01) this.coachSpin *= -1;
    this.coachAngle = Phaser.Math.Clamp(this.coachAngle, -Math.PI, 0);
    if (this.coachAngle <= -Math.PI || this.coachAngle >= 0) this.coachSpin *= -1;
    this.cone.clear();
    this.cone.fillStyle(C.yellow, 0.12);
    const L = 480;
    this.cone.fillTriangle(
      this.coach.x, this.coach.y,
      this.coach.x + Math.cos(this.coachAngle - 0.45) * L, this.coach.y + Math.sin(this.coachAngle - 0.45) * L,
      this.coach.x + Math.cos(this.coachAngle + 0.45) * L, this.coach.y + Math.sin(this.coachAngle + 0.45) * L,
    );

    const u = this.user;
    const v = this.controls.vector;
    const speed = 105 * (1 - this.carried.length * 0.08);
    u.x = Phaser.Math.Clamp(u.x + v.x * speed * dt, 10, 350);
    u.y = Phaser.Math.Clamp(u.y + v.y * speed * dt, 50, 560);
    u.setAngle(v.length() > 0.3 ? Math.sin(this.elapsed * 16) * 5 : 0);
    if (v.x) u.setFlipX(v.x < 0);

    // Ramassage automatique
    for (const p of this.plots) {
      if (p.state !== 'ground' || this.carried.length >= CARRY_MAX) continue;
      if (Phaser.Math.Distance.Between(u.x, u.y + 8, p.x, p.y) < 14) {
        p.state = 'carried';
        this.carried.push(p);
        sfx.select(this);
      }
    }
    // Les plots portés s'empilent sur la tête
    this.carried.forEach((p, i) => p.setPosition(u.x, u.y - 20 - i * 8).setDepth(6 + i));
    this.refresh();

    // Au sac
    if (this.carried.length && Phaser.Math.Distance.Between(u.x, u.y, BAG.x, BAG.y) < 24) {
      for (const p of this.carried) {
        p.state = 'bag';
        p.setVisible(false);
        this.bagged++;
        this.niveau(0.5);
      }
      this.legende(-2 * this.carried.length, null);
      this.carried = [];
      sfx.kick(this);
      if (this.bagged === COUNT) {
        floatText(this, BAG.x, BAG.y - 30, 'Merci, t\'es bien le seul', CSS.cream, 10);
        this.end();
      }
    }

    // Filer au parking
    if (!this.escaped && this.exitZone.contains(u.x, u.y)) {
      if (this.coachSees(u.x, u.y)) this.getCaught(u.x, u.y);
      else this.escape();
    }
  }

  // Poser : derrière le club-house, c'est planquer
  drop() {
    if (!this.running || this.over || !this.carried.length) return;
    const u = this.user;
    const behind = this.hideZone.contains(u.x, u.y) || (u.x < 150 && u.y < 140);
    if (behind && this.coachSees(u.x, u.y)) return this.getCaught(u.x, u.y);
    for (const p of this.carried) {
      p.state = behind ? 'hidden' : 'ground';
      p.setPosition(u.x + Phaser.Math.Between(-12, 12), u.y + Phaser.Math.Between(4, 16)).setDepth(3);
      if (behind) {
        this.hidden++;
        this.legende(10, 'Planqué', u.x, u.y - 30);
      }
    }
    if (behind && this.hidden >= 4 && !this.pecabDone) this.firstPecab();
    this.carried = [];
  }

  // Siffloter : le coach regarde ailleurs pendant 2 secondes
  whistleInnocently() {
    if (!this.running || this.over) return;
    if (this.time.now < (this.whistleReadyAt ?? 0)) return;
    this.whistleReadyAt = this.time.now + 6000;
    this.whistleUntil = this.time.now + 2000;
    this.coachSpin *= -1;
    floatText(this, this.user.x, this.user.y - 30, '♪ fiu fiu ♪', CSS.cream, 11);
    this.legende(5 + this.career.stats.excuses, 'Innocent', this.user.x, this.user.y - 46);
  }

  getCaught(x, y) {
    if (this.elapsed - this.caughtAt < 2) return;
    this.caught++;
    this.caughtAt = this.elapsed;
    sfx.whistle(this);
    floatText(this, this.coach.x + 70, this.coach.y - 30, 'OH ! REVIENS ICI !', CSS.red, 12);
    this.user.setPosition(Phaser.Math.Clamp(x, 40, 320), 300);
  }

  escape() {
    this.escaped = true;
    this.user.setVisible(false);
    this.carried.forEach((p) => p.setVisible(false));
    sfx.gain(this);
    this.legende(60, 'Disparu avant la corvée', 280, 140);
    this.firstPecab();
    floatText(this, 180, 300, '*démarre la voiture*', CSS.cream, 12);
    this.time.delayedCall(1500, () => this.end());
  }

  end() {
    let coach = 'Coach Gérard : « Il manque des plots. Comme chaque semaine. »';
    if (this.escaped) coach = 'Coach Gérard : « Quelqu\'un a vu le nouveau ? » (Fred non plus)';
    else if (this.bagged === COUNT) coach = 'Le président : « Enfin quelqu\'un de sérieux. » (le vestiaire se méfie)';
    else if (this.hidden >= 4) coach = 'Le président : « Pourquoi y a des plots derrière le club-house ? »';
    this.finish(
      [
        ['Plots au sac', `${this.bagged}/${COUNT}`],
        ['Plots planqués', this.hidden],
        ['Pris par le coach', this.caught],
        ['Parti avant la fin', this.escaped ? 'Oui' : 'Non'],
      ],
      coach,
    );
  }
}
