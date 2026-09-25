import Phaser from 'phaser';
import BaseTraining from './BaseTraining.js';
import { Controls } from '../../ui/controls.js';
import { floatText } from '../../ui/text.js';
import { sfx } from '../../ui/sfx.js';
import { grass, clubhouse, parking } from './decor.js';
import { C, CSS } from '../../palette.js';

// Le circuit technique : slalom entre les coupelles, échelle de rythme entre
// les plots, puis frappe dans la mini-cage. Officiellement : sans rien toucher.
// En vrai : chaque coupelle renversée compte, et le toit du club-house aussi.
const H = 1000;
const LIMIT = 45;
const CAGE = { x: 180, y: 120, w: 56 };

export default class TrainTechnique extends BaseTraining {
  constructor() {
    super('TrainTechnique');
  }

  create() {
    grass(this, H);
    // Toit du club-house en haut à droite, parking en haut à gauche
    clubhouse(this, 238, 18, 110, 70);
    this.roof = new Phaser.Geom.Rectangle(234, 0, 126, 90);
    parking(this, 0, 20, 110, 60);
    this.parkingZone = new Phaser.Geom.Rectangle(0, 0, 118, 88);

    // Mini-cage
    const g = this.add.graphics().setDepth(1);
    g.lineStyle(3, C.cream, 1);
    g.strokeRect(CAGE.x - CAGE.w / 2, CAGE.y - 14, CAGE.w, 14);
    g.fillStyle(C.cream, 0.2);
    g.fillRect(CAGE.x - CAGE.w / 2, CAGE.y - 14, CAGE.w, 14);

    // Échelle de rythme
    g.lineStyle(2, C.yellow, 0.9);
    g.strokeRect(160, 380, 40, 100);
    for (let y = 400; y < 480; y += 20) g.lineBetween(160, y, 200, y);

    this.obstacles = [];
    for (let i = 0; i < 10; i++) {
      const x = i % 2 ? 214 : 146;
      this.addObstacle('coupelle', x, 880 - i * 36);
    }
    for (let i = 0; i < 4; i++) {
      this.addObstacle('plot', 146, 390 + i * 28);
      this.addObstacle('plot', 214, 390 + i * 28);
    }

    this.coach = this.add.image(290, 180, 'coach').setScale(2).setDepth(5).setFlipX(true);

    this.user = this.add.image(180, 950, `p_${this.char.id}`).setScale(2).setDepth(5);
    this.user.facing = new Phaser.Math.Vector2(0, -1);
    this.ball = this.add.image(180, 940, 'ball').setScale(2).setDepth(6);
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.hasBall = true;
    this.knocked = 0;
    this.lastKnockAt = -99;
    this.contested = 0;
    this.roofDone = false;
    this.parkingShots = 0;
    this.lost = 0;

    const cam = this.cameras.main;
    cam.setBounds(0, -44, 360, H + 44);
    cam.startFollow(this.user, true, 0.12, 0.12, 0, 60);

    this.controls = new Controls(this, { onA: () => this.shoot(), onB: () => this.contest() });
    this.controls.setLabels('FRAPPE', 'CONTESTER');

    this.setup({ title: 'Technique : le circuit', objective: 'circuit propre en 40 s', duration: LIMIT });
  }

  addObstacle(key, x, y) {
    const o = this.add.image(x, y, key).setScale(2).setDepth(3);
    o.down = false;
    this.obstacles.push(o);
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.controls.update(delta);
    if (!this.tickTimer(dt)) {
      if (this.running && !this.over) this.end(false);
      return;
    }
    const u = this.user;
    const v = this.controls.vector;
    const speed = 100 * (1 - (this.career.stats.bide - 1) * 0.04);
    if (v.length() > 0.1) {
      u.facing.set(v.x, v.y).normalize();
      u.x = Phaser.Math.Clamp(u.x + v.x * speed * dt, 14, 346);
      u.y = Phaser.Math.Clamp(u.y + v.y * speed * dt, 20, H - 20);
      u.setAngle(Math.sin(this.elapsed * 16) * 5);
      if (v.x) u.setFlipX(v.x < 0);
    } else u.setAngle(0);

    const b = this.ball;
    if (this.hasBall) {
      // Le ballon colle au pied, avec un peu de retard
      b.x += (u.x + u.facing.x * 9 - b.x) * Math.min(1, 12 * dt);
      b.y += (u.y + 10 + u.facing.y * 7 - b.y) * Math.min(1, 12 * dt);
    } else {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      const f = Math.pow(0.35, dt);
      b.vx *= f;
      b.vy *= f;
      b.angle += (b.vx + b.vy) * dt * 3;
      this.checkBallZones();
      if (!this.over && Math.hypot(b.vx, b.vy) < 60 && Phaser.Math.Distance.Between(u.x, u.y + 10, b.x, b.y) < 12) this.hasBall = true;
    }

    // Coupelles et plots renversés, par le joueur ou le ballon
    for (const o of this.obstacles) {
      if (o.down) continue;
      if (Phaser.Math.Distance.Between(o.x, o.y, u.x, u.y + 8) < 11 || Phaser.Math.Distance.Between(o.x, o.y, b.x, b.y) < 9) this.knock(o);
    }
  }

  knock(o) {
    o.down = true;
    this.knocked++;
    this.lastKnockAt = this.elapsed;
    sfx.kick(this);
    this.tweens.add({ targets: o, x: o.x + Phaser.Math.Between(-30, 30), y: o.y - 20, angle: Phaser.Math.Between(-200, 200), alpha: 0.6, duration: 350 });
    this.legende(10, o.texture.key === 'plot' ? 'Plot !' : 'Coupelle !', o.x, o.y - 16);
    const total = this.obstacles.length;
    if (this.knocked === total) {
      this.legende(100, 'STRIKE', 180, this.user.y - 60);
      sfx.cheer(this, true);
      this.firstPecab();
    }
  }

  shoot() {
    if (!this.running || this.over || !this.hasBall) return;
    const u = this.user;
    this.hasBall = false;
    this.ball.vx = u.facing.x * 360;
    this.ball.vy = u.facing.y * 360;
    sfx.kick(this);
  }

  checkBallZones() {
    const b = this.ball;
    // Dans la mini-cage : fin du circuit
    if (b.y <= CAGE.y && b.y > CAGE.y - 16 && Math.abs(b.x - CAGE.x) < CAGE.w / 2) return this.end(true);
    if (this.roof.contains(b.x, b.y) && Math.hypot(b.vx, b.vy) > 80) {
      b.vx = b.vy = 0;
      b.setVisible(false);
      if (!this.roofDone) {
        this.roofDone = true;
        this.legende(60, 'Sur le toit !', 280, 110);
        floatText(this, 290, 150, 'Le président va chercher l\'échelle...', CSS.cream, 10);
        sfx.laugh(this);
        this.firstPecab();
      }
      return this.respawnBall();
    }
    if (this.parkingZone.contains(b.x, b.y) && Math.hypot(b.vx, b.vy) > 80) {
      b.vx = b.vy = 0;
      this.parkingShots++;
      sfx.alarm(this);
      this.legende(30, 'Dans le parking !', 90, 110);
      return this.respawnBall();
    }
    if (b.x < 0 || b.x > 360 || b.y < 0 || b.y > H) {
      b.vx = b.vy = 0;
      this.respawnBall();
    }
  }

  // Le coach relance un ballon
  respawnBall() {
    this.lost++;
    const b = this.ball;
    b.vx = b.vy = 0;
    b.setPosition(-50, -50);
    this.time.delayedCall(900, () => {
      if (this.over) return;
      b.setVisible(true);
      b.setPosition(this.user.x + 20, this.user.y + 10);
      floatText(this, this.user.x, this.user.y - 30, 'Tiens, un autre ballon', CSS.cream, 10);
    });
  }

  contest() {
    if (!this.running || this.over) return;
    const u = this.user;
    if (this.elapsed - this.lastKnockAt < 2 && this.contested < 3) {
      this.contested++;
      floatText(this, u.x, u.y - 34, "C'est la coupelle qui a bougé !", CSS.cream, 11);
      this.legende(10, 'Mauvaise foi', u.x, u.y - 50);
    } else {
      floatText(this, u.x, u.y - 34, "Il est mal fait ton circuit coach", CSS.cream, 11);
    }
  }

  end(scored) {
    if (this.over) return;
    const time = Math.round(this.elapsed);
    const clean = scored && this.knocked === 0 && time <= 40;
    if (scored) sfx.cheer(this);
    if (clean) {
      this.niveau(8);
      this.legende(-20, 'Circuit parfait', 180, this.user.y - 40);
    } else if (scored) this.niveau(3);
    let coach = 'Coach Gérard : « On le refera. Plusieurs fois. »';
    if (clean) coach = 'Coach Gérard : « Parfait. Tu peux montrer aux autres ? » (personne ne veut)';
    else if (this.roofDone) coach = 'Le président : « C\'est le 3e ballon sur le toit cette saison. »';
    else if (this.knocked >= 10) coach = 'Coach Gérard : « Tu as tout rasé. TOUT. »';
    this.finish(
      [
        ['Temps', scored ? `${time} s` : 'Pas fini'],
        ['Coupelles et plots renversés', `${this.knocked}/${this.obstacles.length}`],
        ['Ballons sur le toit', this.roofDone ? 1 : 0],
        ['Ballons dans le parking', this.parkingShots],
        ['Contestations', this.contested],
      ],
      coach,
    );
  }
}
