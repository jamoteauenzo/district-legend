import Phaser from 'phaser';
import BaseTraining from './BaseTraining.js';
import { Controls } from '../../ui/controls.js';
import { txt, floatText } from '../../ui/text.js';
import { sfx } from '../../ui/sfx.js';
import { grass, buvette } from './decor.js';
import { C, CSS } from '../../palette.js';

// Le 30/30 : des allers-retours entre deux lignes de plots, en alternant
// course et récup. Officiellement il faut tenir le rythme. En vrai, on
// marche dès que le coach regarde son téléphone.
const FAR_Y = 150;
const START_Y = 520;
const RUN = 8; // secondes de course (le « 30 »)
const REST = 5; // secondes de récup
const REPS = 4;
const TARGET = 8; // allers-retours demandés
const LANES = [80, 140, 220, 280];

export default class TrainPhysique extends BaseTraining {
  constructor() {
    super('TrainPhysique');
  }

  create() {
    grass(this);
    const g = this.add.graphics().setDepth(1);
    g.lineStyle(2, C.chalk, 0.8);
    g.lineBetween(50, FAR_Y, 310, FAR_Y);
    g.lineBetween(50, START_Y, 310, START_Y);
    for (const x of [50, 110, 180, 250, 310]) {
      this.add.image(x, FAR_Y, 'plot').setScale(2).setDepth(2);
      this.add.image(x, START_Y, 'plot').setScale(2).setDepth(2);
    }
    buvette(this, 14, 62);
    this.buvetteZone = new Phaser.Geom.Rectangle(0, 50, 100, 70);

    this.coach = this.add.image(326, 340, 'coach').setScale(2).setDepth(5).setFlipX(true);
    this.phone = this.add.image(318, 338, 'phone').setScale(2).setDepth(6).setVisible(false);
    this.cone = this.add.graphics().setDepth(3);
    this.coachLooking = true;
    this.nextCoachSwitch = 3;

    // Les coéquipiers : Fred est le premier à tricher
    this.mates = ['mate1', 'mate2', 'mate3'].map((key, i) => {
      const x = [LANES[0], LANES[1], LANES[3]][i];
      const m = this.add.image(x, START_Y, key).setScale(2).setDepth(4);
      m.goingUp = true;
      m.speed = Phaser.Math.Between(88, 104);
      m.lazy = i === 0;
      return m;
    });

    this.user = this.add.image(LANES[2], START_Y, `p_${this.char.id}`).setScale(2).setDepth(4);
    this.needFar = true;
    this.laps = 0;
    this.walkTime = 0;
    this.walkReward = 0;
    this.caught = 0;
    this.caughtAt = -99;
    this.caughtContested = false;
    this.buvetteDone = false;
    this.laces = 0;
    this.lacesUntil = 0;
    this.lacesPhase = -1;
    this.fredHint = false;

    this.phaseText = txt(this, 210, 112, '', 22, CSS.yellow, { bold: true, stroke: CSS.outline }).setDepth(50);

    this.controls = new Controls(this, { onA: () => this.contest(), onB: () => this.tieLaces() });
    this.controls.setLabels('CONTESTER', 'LACETS');

    this.setup({ title: 'Physique : le 30/30', objective: `${TARGET} allers-retours`, duration: REPS * (RUN + REST) });
  }

  // Phase en cours : { run: bool, rep, left }
  phase() {
    const cycle = RUN + REST;
    const rep = Math.floor(this.elapsed / cycle);
    const t = this.elapsed - rep * cycle;
    return t < RUN ? { run: true, rep, left: RUN - t } : { run: false, rep, left: cycle - t };
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.controls.update(delta);
    if (!this.tickTimer(dt)) {
      if (this.running && !this.over) this.end();
      return;
    }
    const ph = this.phase();
    this.phaseText.setText(`${ph.run ? 'COURS !' : 'RÉCUP'}  ${Math.ceil(ph.left)}`).setColor(ph.run ? CSS.yellow : CSS.cream);
    const key = `${ph.rep}-${ph.run}`;
    if (this.lastPhase && key !== this.lastPhase) sfx.whistle(this);
    this.lastPhase = key;

    this.updateCoach(dt);
    this.updateMates(dt, ph);
    this.updateUser(dt, ph);
  }

  updateCoach(dt) {
    this.nextCoachSwitch -= dt;
    if (this.nextCoachSwitch <= 0) {
      this.coachLooking = !this.coachLooking;
      this.nextCoachSwitch = this.coachLooking ? Phaser.Math.FloatBetween(2.5, 4) : Phaser.Math.FloatBetween(2, 3.2);
      this.phone.setVisible(!this.coachLooking);
      if (!this.coachLooking) floatText(this, 300, 310, '*regarde son téléphone*', CSS.cream, 10);
      else floatText(this, 300, 310, 'ALLEZ ALLEZ !', CSS.yellow, 11);
    }
    this.cone.clear();
    if (this.coachLooking) {
      this.cone.fillStyle(C.yellow, 0.12);
      this.cone.fillTriangle(314, 340, 20, 120, 20, 560);
    }
  }

  updateMates(dt, ph) {
    for (const m of this.mates) {
      let speed = ph.run ? m.speed : 25;
      // Fred marche dès que le coach ne regarde pas
      if (m.lazy && ph.run && !this.coachLooking) {
        speed = 18;
        if (!this.fredHint) {
          this.fredHint = true;
          floatText(this, m.x, m.y - 30, 'Tranquille, il est sur son tel', CSS.cream, 10);
        }
      }
      const ty = m.goingUp ? FAR_Y : START_Y;
      const d = ty - m.y;
      m.y += Math.sign(d) * Math.min(Math.abs(d), speed * dt);
      if (Math.abs(d) < 2) m.goingUp = !m.goingUp;
      m.setAngle(speed > 30 ? Math.sin(this.elapsed * 14 + m.x) * 5 : 0);
    }
  }

  updateUser(dt, ph) {
    const u = this.user;
    if (this.time.now < this.lacesUntil) {
      u.setAngle(0);
      return;
    }
    const v = this.controls.vector;
    const speed = 118 * (1 - (this.career.stats.bide - 1) * 0.05);
    u.x = Phaser.Math.Clamp(u.x + v.x * speed * dt, 12, 348);
    u.y = Phaser.Math.Clamp(u.y + v.y * speed * dt, 60, 560);
    const moving = v.length() > 0.5;
    u.setAngle(moving ? Math.sin(this.elapsed * 16) * 5 : 0);
    if (v.x) u.setFlipX(v.x < 0);

    // Allers-retours comptés entre les deux lignes
    if (this.needFar && u.y <= FAR_Y + 6) this.needFar = false;
    if (!this.needFar && u.y >= START_Y - 6) {
      this.needFar = true;
      this.laps++;
      this.niveau(1.5);
      this.legende(-3, `${this.laps}/${TARGET}`, u.x, u.y - 24);
    }

    // Pause buvette
    if (!this.buvetteDone && this.buvetteZone.contains(u.x, u.y)) {
      this.buvetteDone = true;
      sfx.gulp(this);
      this.legende(40, 'Pause buvette', u.x + 40, u.y);
      this.firstPecab();
      if (ph.run && this.coachLooking) this.getCaught();
    }

    // Marcher pendant la course
    if (ph.run && !moving) {
      if (this.coachLooking) {
        if (this.elapsed - this.caughtAt > 2.5) this.getCaught();
      } else {
        this.walkTime += dt;
        this.walkReward += dt;
        if (this.walkReward > 1.5) {
          this.walkReward = 0;
          this.legende(8, Phaser.Utils.Array.GetRandom(['Pépouze', 'Économie', 'Tranquille']), u.x, u.y - 24);
        }
      }
    }
  }

  getCaught() {
    this.caught++;
    this.caughtAt = this.elapsed;
    this.caughtContested = false;
    sfx.whistle(this);
    floatText(this, 300, 290, 'ON NE MARCHE PAS !', CSS.red, 13);
    this.cameras.main.shake(120, 0.006);
  }

  contest() {
    if (!this.running) return;
    const u = this.user;
    if (this.elapsed - this.caughtAt < 2.5 && !this.caughtContested) {
      this.caughtContested = true;
      floatText(this, u.x, u.y - 34, "J'AI UNE CRAMPE COACH !", CSS.cream, 11);
      this.legende(15 + this.career.stats.mauvaiseFoi * 2, 'Mauvaise foi', u.x, u.y - 50);
    } else {
      floatText(this, u.x, u.y - 34, "C'est trop dur !", CSS.cream, 11);
    }
  }

  // Refaire ses lacets : l'excuse parfaite, une fois par phase de course.
  tieLaces() {
    const ph = this.phase();
    if (!this.running || !ph.run || this.lacesPhase === ph.rep) return;
    this.lacesPhase = ph.rep;
    this.laces++;
    this.lacesUntil = this.time.now + 2000;
    const u = this.user;
    floatText(this, u.x, u.y - 30, '*refait ses lacets*', CSS.cream, 10);
    this.legende(5 + this.career.stats.excuses * 2, 'Excuse valable', u.x, u.y - 46);
  }

  end() {
    const walked = Math.round(this.walkTime);
    let coach = 'Coach Gérard : « On reprend jeudi. Soyez à l\'heure. »';
    if (this.laps >= TARGET) coach = 'Coach Gérard : « Enfin un qui court. » (le vestiaire te regarde bizarrement)';
    else if (this.buvetteDone) coach = 'Le président : « Tu reprendras bien une pression ? »';
    else if (this.caught >= 2) coach = 'Coach Gérard : « Toi, je t\'ai à l\'œil. »';
    this.finish(
      [
        ['Allers-retours', `${this.laps}/${TARGET}`],
        ['Temps passé à marcher', `${walked} s`],
        ['Pause buvette', this.buvetteDone ? 'Oui' : 'Non'],
        ['Engueulades du coach', this.caught],
        ['Lacets refaits', this.laces],
      ],
      coach,
    );
  }
}
