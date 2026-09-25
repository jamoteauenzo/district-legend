import Phaser from 'phaser';
import { state, gainLegende, gainNiveau, save } from '../state.js';
import { getCharacter } from '../data/characters.js';
import { txt, floatText } from '../ui/text.js';
import { Controls } from '../ui/controls.js';
import { Mug } from '../ui/mug.js';
import { pecab } from '../ui/pecab.js';
import { sfx, crowdAmbience } from '../ui/sfx.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { C, CSS } from '../palette.js';

// Terrain vu de dessus. L'équipe A (la tienne, en bleu) attaque vers le haut.
const W = 360;
const H = 800;
const PITCH = { left: 16, right: 344, top: 40, bottom: 760 };
const GOAL = { left: 150, right: 210 };
const MATCH_SECONDS = 120; // 2 minutes réelles = 90 minutes
const SLIP_AT = 16; // secondes avant la glissade scriptée du premier match

const CONTEST_LINES = [
  'Mais arbitre !!',
  'Il est où le hors-jeu ?!',
  "T'as vu ça ou quoi ?",
  "Il m'a regardé mal !",
  "T'es de Sainte-Gluse ?",
  "C'est une honte !",
  'Je paye ma licence moi !',
  'Faute, faute, FAUTE !',
];

const PICKUPS = [
  { key: 'merguez', label: 'Merguez !' },
  { key: 'canette', label: 'Canette !' },
  { key: 'ricard', label: 'Le Ricard du président !' },
];

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const feet = (p) => ({ x: p.x, y: p.y + 10 });

export default class MatchScene extends Phaser.Scene {
  constructor() {
    super('Match');
  }

  create() {
    this.career = state.career;
    this.char = getCharacter(this.career.charId);
    this.elapsed = 0;
    this.freeze = 0;
    this.afterFreeze = null;
    this.over = false;
    this.cutscene = null;
    this.sentOff = false;
    this.annoyance = 0;
    this.slowUntil = 0;
    this.score = { A: 0, B: 0 };
    this.legendeStart = this.career.legende;
    this.stats = { distance: 0, contestations: 0, pickups: 0, yellow: 0, red: false, goals: 0, ownGoals: 0, parking: 0, fouls: 0, slip: false, sentOffMinute: null };

    this.drawPitch();

    this.players = [];
    this.user = this.makePlayer(`p_${this.char.id}`, 180, 520, 'A', 'user');
    this.mateGK = this.makePlayer('mateGK', 180, 745, 'A', 'gk');
    this.makePlayer('mate1', 90, 580, 'A', 'field');
    this.makePlayer('mate2', 270, 580, 'A', 'field');
    this.makePlayer('mate3', 180, 330, 'A', 'field');
    this.oppGK = this.makePlayer('oppGK', 180, 55, 'B', 'gk');
    this.makePlayer('opp1', 100, 230, 'B', 'field');
    this.makePlayer('opp2', 260, 230, 'B', 'field');
    this.makePlayer('opp3', 120, 440, 'B', 'field');
    this.makePlayer('opp4', 240, 440, 'B', 'field');

    this.referee = this.add.image(230, 420, 'ref').setScale(2);
    this.referee.facing = new Phaser.Math.Vector2(0, 1);

    this.ball = this.add.image(180, 400, 'ball').setScale(2).setDepth(5);
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.carrier = null;
    this.lastKicker = null;
    this.lastPass = null;

    this.pickups = [];
    this.nextPickupAt = 7;
    this.recruiter = null;

    const cam = this.cameras.main;
    cam.setBounds(0, -44, W, H + 44);
    cam.startFollow(this.user, true, 0.12, 0.12, 0, -60);

    this.createHud();
    this.controls = new Controls(this, { onA: () => this.pressA(), onB: () => this.pressB() });

    this.banner('MATCH AMICAL', 'Objectif : gagne le match.');
    sfx.whistle(this);
    music.play('match');
    crowdAmbience.start();
    this.events.once('shutdown', () => crowdAmbience.stop());
  }

  // ---------------------------------------------------------------- Décor

  drawPitch() {
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(C.prefab, 1);
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 18; i++) {
      g.fillStyle(i % 2 ? C.grass : C.grassDark, 1);
      g.fillRect(PITCH.left - 8, PITCH.top + i * 40, PITCH.right - PITCH.left + 16, 40);
    }
    // Boue devant les buts
    g.fillStyle(C.mud, 0.8);
    g.fillEllipse(180, PITCH.top + 26, 90, 36);
    g.fillEllipse(180, PITCH.bottom - 26, 90, 36);
    g.fillEllipse(110, 420, 50, 22);
    // Lignes
    g.lineStyle(2, C.chalk, 0.9);
    g.strokeRect(PITCH.left, PITCH.top, PITCH.right - PITCH.left, PITCH.bottom - PITCH.top);
    g.lineBetween(PITCH.left, 400, PITCH.right, 400);
    g.strokeCircle(180, 400, 42);
    g.strokeRect(90, PITCH.top, 180, 90);
    g.strokeRect(90, PITCH.bottom - 90, 180, 90);
    // Buts
    g.fillStyle(C.cream, 1);
    g.fillRect(GOAL.left - 3, PITCH.top - 14, 3, 14);
    g.fillRect(GOAL.right, PITCH.top - 14, 3, 14);
    g.fillRect(GOAL.left - 3, PITCH.top - 14, GOAL.right - GOAL.left + 6, 3);
    g.fillRect(GOAL.left - 3, PITCH.bottom, 3, 14);
    g.fillRect(GOAL.right, PITCH.bottom, 3, 14);
    g.fillRect(GOAL.left - 3, PITCH.bottom + 11, GOAL.right - GOAL.left + 6, 3);
    g.fillStyle(C.cream, 0.25);
    g.fillRect(GOAL.left, PITCH.top - 11, GOAL.right - GOAL.left, 11);
    g.fillRect(GOAL.left, PITCH.bottom, GOAL.right - GOAL.left, 11);

    // Panneaux de sponsors en haut
    const sponsors = ['BOUCHERIE MOREL', 'GARAGE DUPUIS', 'LE BALTO'];
    sponsors.forEach((s, i) => {
      const x = 8 + i * 118;
      g.fillStyle([C.red, C.blue, C.yellow][i], 1);
      g.fillRect(x, 4, 110, 16);
      txt(this, x + 55, 12, s, 9, i === 2 ? CSS.outline : CSS.cream, { bold: true }).setDepth(1);
    });
    // Parking en bas
    g.fillStyle(0x9a9a9a, 1);
    g.fillRect(0, H - 22, W, 22);
    g.fillStyle(C.red, 1);
    g.fillRect(40, H - 18, 30, 12);
    g.fillStyle(C.cream, 1);
    g.fillRect(250, H - 18, 30, 12);

    // Les 12 spectateurs et Kaiser
    this.crowd = [];
    for (let i = 0; i < 12; i++) {
      const side = i % 2 ? 6 : 354;
      const y = 120 + i * 50;
      g.fillStyle([C.red, C.blue, C.yellow, C.cream][i % 4], 1);
      g.fillRect(side - 3, y, 6, 8);
      g.fillStyle(C.skinLight, 1);
      g.fillRect(side - 2, y - 4, 4, 4);
      this.crowd.push({ x: side, y });
    }
    this.dog = this.add.image(350, 300, 'dog').setScale(2).setDepth(3);
  }

  makePlayer(key, x, y, team, role) {
    const p = this.add.image(x, y, key).setScale(2).setDepth(4);
    p.team = team;
    p.role = role;
    p.home = { x, y };
    p.facing = new Phaser.Math.Vector2(0, team === 'A' ? -1 : 1);
    p.cooldownUntil = 0;
    p.stunUntil = 0;
    p.holdStart = 0;
    p.slideUntil = 0;
    p.recoverUntil = 0;
    p.contestUntil = 0;
    p.contestReadyAt = 0;
    this.players.push(p);
    return p;
  }

  // ------------------------------------------------------------------ HUD

  createHud() {
    const fix = (o, d = 100) => o.setScrollFactor(0).setDepth(d);
    fix(this.add.rectangle(0, 0, 360, 40, C.outline, 0.85).setOrigin(0));
    this.scoreText = fix(txt(this, 10, 13, '', 13, CSS.cream, { ox: 0, bold: true }), 101);
    this.timeText = fix(txt(this, 10, 30, '', 11, CSS.chalk, { ox: 0 }), 101);
    this.cardText = fix(txt(this, 250, 13, '', 11, CSS.yellow, { bold: true }), 101);
    this.objective = fix(txt(this, 180, 31, 'OBJECTIF : GAGNE LE MATCH', 9, CSS.cream, { stroke: CSS.outline }), 101);
    this.mug = new Mug(this, 334, 20).setScrollFactor(0).setDepth(101);
    this.mug.setValue(this.career.legende, false);
    muteButton(this, 298, 20);
  }

  updateHud() {
    const minute = Math.min(90, Math.floor((this.elapsed / MATCH_SECONDS) * 90));
    this.scoreText.setText(`ST-CLOU ${this.score.A} - ${this.score.B} STE-GLUSE`);
    this.timeText.setText(`${minute}'`);
    const cards = this.stats.red ? 'ROUGE' : this.stats.yellow ? 'JAUNE' : '';
    this.cardText.setText(cards).setColor(this.stats.red ? CSS.red : CSS.yellow);
    const hasBall = this.carrier === this.user;
    this.controls.setLabels(hasBall ? 'TIR' : 'TACLE', hasBall ? 'PASSE' : 'CONTESTER');
  }

  banner(title, sub) {
    const cam = this.cameras.main;
    const bg = this.add.rectangle(cam.width / 2, 250, 360, 70, C.outline, 0.8).setScrollFactor(0).setDepth(250);
    const t1 = txt(this, 180, 238, title, 22, CSS.yellow, { bold: true }).setScrollFactor(0).setDepth(251);
    const t2 = txt(this, 180, 266, sub ?? '', 12, CSS.cream).setScrollFactor(0).setDepth(251);
    this.tweens.add({
      targets: [bg, t1, t2],
      alpha: 0,
      delay: 1800,
      duration: 400,
      onComplete: () => [bg, t1, t2].forEach((o) => o.destroy()),
    });
  }

  // La Légende n'affiche jamais de chiffre : seulement la chope et un mot.
  legende(n, label) {
    gainLegende(n);
    this.mug.setValue(this.career.legende);
    if (n > 0) sfx.gain(this);
    else sfx.loss(this);
    if (label) floatText(this, this.user.x, this.user.y - 22, label, n > 0 ? CSS.yellow : CSS.grey);
  }

  cheer(lines) {
    lines.forEach((line, i) => {
      const spot = Phaser.Utils.Array.GetRandom(this.crowd);
      this.time.delayedCall(i * 180, () => floatText(this, spot.x < 180 ? 40 : 320, Phaser.Math.Clamp(this.cameras.main.scrollY + 120 + i * 40, 60, 740), line, CSS.cream, 11));
    });
  }

  // --------------------------------------------------------------- Boucle

  update(time, delta) {
    if (this.over) return;
    const dt = Math.min(delta, 50) / 1000;
    this.controls.update(delta);

    if (this.cutscene) {
      this.updateCutscene(dt);
      this.updateHud();
      return;
    }

    if (this.freeze > 0) {
      this.freeze -= dt;
      if (this.freeze <= 0) {
        this.freeze = 0;
        const cb = this.afterFreeze;
        this.afterFreeze = null;
        if (cb) cb();
      }
      if (this.sentOff) this.user.x += 50 * dt;
      this.updateHud();
      return;
    }

    this.elapsed += dt;
    if (this.elapsed >= MATCH_SECONDS) return this.endMatch();

    this.checkSlipScript();
    if (this.cutscene) return;

    this.updateUser(dt);
    this.updateAI(dt);
    this.updateBall(dt);
    this.updateReferee(dt);
    this.updatePickups();
    this.checkRecruiter();
    this.updateHud();

    for (const p of this.players) p.setDepth(4 + p.y / 1000);
    this.referee.setDepth(4 + this.referee.y / 1000);
  }

  wait(seconds, cb) {
    this.freeze = seconds;
    this.afterFreeze = cb;
  }

  clampToPitch(p) {
    p.x = Phaser.Math.Clamp(p.x, PITCH.left + 4, PITCH.right - 4);
    p.y = Phaser.Math.Clamp(p.y, PITCH.top + 4, PITCH.bottom - 4);
  }

  // ------------------------------------------------------------ Le joueur

  speedFactor() {
    const bide = 1 - (this.career.stats.bide - 1) * 0.04;
    return bide * (this.time.now < this.slowUntil ? 0.6 : 1);
  }

  updateUser(dt) {
    const u = this.user;
    const now = this.time.now;
    if (this.sentOff) return;

    if (now < u.slideUntil) {
      u.x += u.slideV.x * dt;
      u.y += u.slideV.y * dt;
      this.clampToPitch(u);
      this.checkTackleHits();
      return;
    }
    if (now < u.recoverUntil) return;
    if (u.angle !== 0) u.setAngle(0);
    if (now < u.contestUntil) return;

    const v = this.controls.vector;
    if (v.x || v.y) {
      u.facing.set(v.x, v.y).normalize();
      const speed = 95 * this.speedFactor();
      const dx = v.x * speed * dt;
      const dy = v.y * speed * dt;
      u.x += dx;
      u.y += dy;
      this.stats.distance += Math.hypot(dx, dy);
      if (v.x) u.setFlipX(v.x < 0);
    }
    this.clampToPitch(u);
  }

  pressA() {
    if (this.over || this.sentOff) return;
    if (this.cutscene) {
      if (this.cutscene.phase === 'ready') this.doSlip();
      return;
    }
    if (this.freeze) return;
    if (this.carrier === this.user) this.shoot();
    else if (this.time.now > this.user.recoverUntil) this.tackle();
  }

  pressB() {
    if (this.over || this.sentOff || this.cutscene || this.freeze) return;
    if (this.carrier === this.user) this.pass();
    else this.contest();
  }

  kick(p, tx, ty, speed) {
    const d = Math.hypot(tx - this.ball.x, ty - this.ball.y) || 1;
    this.carrier = null;
    this.ball.vx = ((tx - this.ball.x) / d) * speed;
    this.ball.vy = ((ty - this.ball.y) / d) * speed;
    this.lastKicker = p;
    p.cooldownUntil = this.time.now + 350;
    sfx.kick(this);
  }

  shoot() {
    const spread = 80 - this.career.stats.talent * 10;
    const tx = 180 + Phaser.Math.Between(-spread, spread);
    this.kick(this.user, tx, PITCH.top - 20, 330);
  }

  pass() {
    const u = this.user;
    const mates = this.players.filter((p) => p.team === 'A' && p.role === 'field');
    mates.sort((a, b) => dist(a, u) + (a.y > u.y ? 80 : 0) - (dist(b, u) + (b.y > u.y ? 80 : 0)));
    const m = mates[0];
    this.kick(u, m.x, m.y + 10, 230);
    this.lastPass = { at: this.elapsed };
  }

  tackle() {
    const u = this.user;
    const now = this.time.now;
    u.slideUntil = now + 280;
    u.recoverUntil = now + 280 + 450;
    u.slideV = u.facing.clone().scale(230);
    u.setAngle(u.facing.x < 0 ? -90 : 90);
    u.tackleHit = false;
    sfx.tackle(this);
  }

  checkTackleHits() {
    const u = this.user;
    if (u.tackleHit) return;
    if (dist(u, this.referee) < 14) {
      u.tackleHit = true;
      return this.tackleOnReferee();
    }
    const victim = this.players.find((p) => p.team === 'B' && p.role === 'field' && this.time.now > p.stunUntil && dist(u, p) < 15);
    if (!victim) return;
    u.tackleHit = true;
    this.resolveTackle(victim);
  }

  resolveTackle(opp) {
    const s = this.career.stats;
    const masse = this.char.trait.id === 'masse';
    if (this.carrier === opp && Math.random() < 0.4 + s.tacle * 0.05) {
      // Tacle propre : ça fait monter le niveau réel, pas la légende.
      this.carrier = null;
      this.ball.vx = this.user.facing.x * 120;
      this.ball.vy = this.user.facing.y * 120;
      this.lastKicker = this.user;
      gainNiveau(2);
      floatText(this, this.user.x, this.user.y - 22, 'Propre.', CSS.grey);
      return;
    }

    // Faute
    this.stats.fouls++;
    sfx.thud(this);
    sfx.ooh(this);
    opp.stunUntil = this.time.now + 1300;
    opp.setAngle(90);
    if (masse) opp.x += this.user.facing.x * 26;
    if (this.carrier === opp) this.carrier = null;
    this.legende(20, 'Tacle en retard');

    const red = 0.08 + s.tacle * 0.03 + (masse ? 0.1 : 0);
    const yellow = 0.35 + s.tacle * 0.05 + (masse ? 0.15 : 0);
    const r = Math.random();
    sfx.whistle(this);
    if (r < red) this.giveRed();
    else if (r < red + yellow) this.giveYellow();
    else floatText(this, this.referee.x, this.referee.y - 24, 'Avantage...', CSS.cream);

    if (!this.sentOff) this.wait(0.9, () => this.freeKick(opp));
  }

  freeKick(opp) {
    this.ball.vx = this.ball.vy = 0;
    const taker = this.players.find((p) => p.team === 'B' && p.role === 'field' && p !== opp) ?? opp;
    this.giveBall(taker);
  }

  tackleOnReferee() {
    this.career.flags.tacleArbitre = true;
    this.career.relations.district -= 2;
    this.referee.setAngle(90);
    this.cheer(['OH NON', "L'ARBITRE !", 'WOUF']);
    floatText(this, this.user.x, this.user.y - 36, "TACLE SUR L'ARBITRE", CSS.red, 14);
    this.time.delayedCall(900, () => this.referee.setAngle(0));
    this.giveRed();
  }

  showCard(key) {
    sfx.card(this);
    const card = this.add.image(this.referee.x + 8, this.referee.y - 26, key).setScale(3).setDepth(160);
    this.tweens.add({ targets: card, y: card.y - 10, duration: 250, yoyo: true, hold: 700, onComplete: () => card.destroy() });
  }

  giveYellow() {
    this.stats.yellow++;
    this.showCard('cardYellow');
    sfx.ooh(this);
    this.legende(50, 'Carton jaune');
    if (this.stats.yellow >= 2) this.time.delayedCall(700, () => this.giveRed());
  }

  giveRed() {
    if (this.sentOff) return;
    this.sentOff = true;
    this.stats.red = true;
    this.stats.sentOffMinute = Math.floor((this.elapsed / MATCH_SECONDS) * 90);
    this.showCard('cardRed');
    if (this.carrier === this.user) this.carrier = null;
    this.user.setAngle(0);
    this.time.delayedCall(500, () => {
      this.legende(150, 'CARTON ROUGE');
      pecab(this);
      sfx.bark(this);
      sfx.cheer(this, true);
      this.cheer(['BRAVOOO', 'LÉGENDE', 'WOUF WOUF', 'Ricard offert !']);
    });
    this.wait(3.5, () => this.endMatch());
  }

  contest() {
    const u = this.user;
    const now = this.time.now;
    if (now < u.contestReadyAt) return;
    u.contestUntil = now + 600;
    u.contestReadyAt = now + 800;
    this.stats.contestations++;
    floatText(this, u.x, u.y - 30, Phaser.Utils.Array.GetRandom(CONTEST_LINES), CSS.cream, 11);
    this.legende(10);
    this.annoyance++;
    floatText(this, this.referee.x, this.referee.y - 24, '!'.repeat(Math.min(this.annoyance, 4)), CSS.red, 14);
    if (this.annoyance >= 4) {
      this.annoyance = 0;
      sfx.whistle(this);
      this.giveYellow();
    }
  }

  // --------------------------------------------------------- Les autres

  updateAI(dt) {
    const now = this.time.now;
    const ball = this.ball;
    const chaser = {};
    for (const team of ['A', 'B']) {
      const candidates = this.players.filter((p) => p.team === team && p.role === 'field' && now > p.stunUntil);
      candidates.sort((a, b) => dist(feet(a), ball) - dist(feet(b), ball));
      chaser[team] = candidates[0];
    }

    for (const p of this.players) {
      if (p === this.user) continue;
      if (now < p.stunUntil) continue;
      if (p.angle !== 0) p.setAngle(0);

      if (p.role === 'gk') {
        this.updateKeeper(p, dt);
        continue;
      }
      if (this.carrier === p) {
        this.updateCarrier(p, dt);
        continue;
      }

      const ownTeamHasBall = this.carrier && this.carrier.team === p.team;
      const chase = !ownTeamHasBall && chaser[p.team] === p && (p.team === 'B' || dist(p, ball) < 150);
      if (chase) this.moveToward(p, ball.x, ball.y - 10, 82, dt);
      else {
        const tx = p.home.x + (ball.x - 180) * 0.3;
        const ty = Phaser.Math.Clamp(p.home.y + (ball.y - 400) * 0.45, PITCH.top + 30, PITCH.bottom - 30);
        this.moveToward(p, tx, ty, 60, dt);
      }
    }
  }

  moveToward(p, tx, ty, speed, dt) {
    const dx = tx - p.x;
    const dy = ty - p.y;
    const d = Math.hypot(dx, dy);
    if (d < 2) return;
    const step = Math.min(d, speed * dt);
    p.x += (dx / d) * step;
    p.y += (dy / d) * step;
    p.facing.set(dx / d, dy / d);
    if (Math.abs(dx) > 1) p.setFlipX(dx < 0);
    this.clampToPitch(p);
  }

  updateCarrier(p, dt) {
    const held = this.elapsed - p.holdStart;
    if (p.team === 'B') {
      const tx = 180 + Math.sin(this.elapsed * 2 + p.home.x) * 50;
      this.moveToward(p, tx, PITCH.bottom, 72, dt);
      if (p.y > PITCH.bottom - 170 || held > 4) this.kick(p, 180 + Phaser.Math.Between(-40, 40), PITCH.bottom + 20, 300);
      return;
    }
    this.moveToward(p, p.x + (180 - p.x) * 0.2, PITCH.top, 70, dt);
    if (held < 1.2) return;
    if (p.y < PITCH.top + 170) this.kick(p, 180 + Phaser.Math.Between(-35, 35), PITCH.top - 20, 300);
    else if (!this.sentOff) this.kick(p, this.user.x, this.user.y + 10, 230);
    else {
      const other = this.players.find((q) => q.team === 'A' && q.role === 'field' && q !== p && q !== this.user);
      this.kick(p, other.x, other.y + 10, 230);
    }
  }

  updateKeeper(p, dt) {
    if (this.carrier === p) {
      if (this.elapsed - p.holdStart > 1) {
        const mates = this.players.filter((q) => q.team === p.team && q.role === 'field' && !(q === this.user && this.sentOff));
        const m = Phaser.Utils.Array.GetRandom(mates);
        this.kick(p, m.x, m.y + 10, 240);
      }
      return;
    }
    const tx = Phaser.Math.Clamp(this.ball.x, GOAL.left - 6, GOAL.right + 6);
    this.moveToward(p, tx, p.home.y, 65, dt);
  }

  updateReferee(dt) {
    const r = this.referee;
    const tx = Phaser.Math.Clamp(this.ball.x + 50, PITCH.left, PITCH.right);
    const ty = Phaser.Math.Clamp(this.ball.y + 40, PITCH.top, PITCH.bottom);
    const d = Math.hypot(tx - r.x, ty - r.y);
    if (d > 20) {
      r.x += ((tx - r.x) / d) * 70 * dt;
      r.y += ((ty - r.y) / d) * 70 * dt;
    }
  }

  // ------------------------------------------------------------- Ballon

  giveBall(p) {
    const b = this.ball;
    const speed = Math.hypot(b.vx, b.vy);
    if (p.role === 'gk' && this.lastKicker === this.user && speed > 150) {
      floatText(this, p.x, p.y - 22, 'Arrêt du gardien', CSS.cream);
      gainNiveau(1);
    }
    this.carrier = p;
    p.holdStart = this.elapsed;
    b.vx = b.vy = 0;
  }

  updateBall(dt) {
    const b = this.ball;
    if (this.carrier) {
      const c = this.carrier;
      b.x = c.x + c.facing.x * 8;
      b.y = c.y + 10 + c.facing.y * 6;
      this.checkSteal();
      return;
    }

    b.x += b.vx * dt;
    b.y += b.vy * dt;
    const friction = Math.pow(0.4, dt);
    b.vx *= friction;
    b.vy *= friction;
    b.angle += (b.vx + b.vy) * dt * 4;

    if (this.checkOut()) return;

    const speed = Math.hypot(b.vx, b.vy);
    const now = this.time.now;
    for (const p of this.players) {
      if (now < p.stunUntil || now < p.cooldownUntil) continue;
      if (p === this.user && (this.sentOff || now < p.slideUntil)) continue;
      const reach = p.role === 'gk' ? 16 : 10;
      if (dist(feet(p), b) < reach && (speed < 260 || p.role === 'gk')) {
        this.giveBall(p);
        break;
      }
    }
  }

  checkSteal() {
    const c = this.carrier;
    if (c.role === 'gk') return;
    const now = this.time.now;
    for (const p of this.players) {
      if (p.team === c.team || p.role === 'gk' || now < p.stunUntil || now < p.cooldownUntil) continue;
      if (p === this.user && this.sentOff) continue;
      if (dist(p, c) > 12) continue;
      const chance = c === this.user ? 0.02 : p === this.user ? 0.05 : 0.03;
      if (Math.random() < chance) {
        c.cooldownUntil = now + 600;
        this.carrier = p;
        p.holdStart = this.elapsed;
        return;
      }
    }
  }

  // Renvoie true si le ballon est sorti (et gère la suite).
  checkOut() {
    const b = this.ball;
    const inGoal = b.x > GOAL.left && b.x < GOAL.right;
    if (b.y < PITCH.top) {
      if (inGoal) this.goal('A');
      else this.outOfPlay('top');
      return true;
    }
    if (b.y > PITCH.bottom) {
      if (inGoal) this.goal('B');
      else this.outOfPlay('bottom');
      return true;
    }
    if (b.x < PITCH.left || b.x > PITCH.right) {
      this.outOfPlay('side');
      return true;
    }
    return false;
  }

  goal(team) {
    const b = this.ball;
    b.vx = b.vy = 0;
    this.score[team]++;
    const byUser = this.lastKicker === this.user;

    if (team === 'A' && byUser) {
      // Un but propre : le public s'en fiche, le recruteur prend des notes.
      this.stats.goals++;
      this.legende(-30, 'But.');
      gainNiveau(8);
      this.banner('BUT', '...');
      this.cheer(['...', 'bof', '*tousse*']);
      sfx.boo(this);
    } else if (team === 'A') {
      this.banner('BUT', 'Pour Saint-Clou.');
      sfx.cheer(this);
      if (this.lastPass && this.elapsed - this.lastPass.at < 4) {
        this.legende(-10, 'Passe décisive');
        gainNiveau(5);
      }
    } else if (byUser) {
      this.stats.ownGoals++;
      this.banner('CSC !', 'Contre son camp.');
      this.legende(80, 'CONTRE SON CAMP');
      pecab(this);
      sfx.laugh(this);
      sfx.cheer(this, true);
      this.cheer(['MDRRR', 'LÉGENDE', 'WOUF']);
    } else {
      this.banner('BUT', 'Pour Sainte-Gluse.');
      sfx.boo(this);
    }
    sfx.whistle(this);
    this.wait(2, () => this.kickoff(team === 'A' ? 'B' : 'A'));
  }

  kickoff(team) {
    for (const p of this.players) {
      if (p === this.user && this.sentOff) continue;
      p.x = p.home.x;
      p.y = p.home.y;
      p.setAngle(0);
    }
    this.ball.x = 180;
    this.ball.y = 400;
    this.ball.vx = this.ball.vy = 0;
    const taker = this.players.find((p) => p.team === team && p.role === 'field' && p !== this.user);
    taker.x = 180;
    taker.y = team === 'A' ? 412 : 388;
    this.giveBall(taker);
  }

  outOfPlay(where) {
    const b = this.ball;
    const speed = Math.hypot(b.vx, b.vy);
    if (this.lastKicker === this.user && speed > 120) {
      this.stats.parking++;
      this.legende(30, 'Dans le parking !');
      sfx.alarm(this);
      sfx.laugh(this);
      floatText(this, Phaser.Math.Clamp(b.x, 60, 300), Phaser.Math.Clamp(b.y, 60, 740), 'WIIOU WIIOU', CSS.red, 13);
    }
    b.vx = b.vy = 0;

    if (where === 'top') {
      b.x = this.oppGK.x;
      b.y = this.oppGK.y + 10;
      this.wait(0.8, () => this.giveBall(this.oppGK));
    } else if (where === 'bottom') {
      b.x = this.mateGK.x;
      b.y = this.mateGK.y + 10;
      this.wait(0.8, () => this.giveBall(this.mateGK));
    } else {
      b.x = Phaser.Math.Clamp(b.x, PITCH.left + 8, PITCH.right - 8);
      b.y = Phaser.Math.Clamp(b.y, PITCH.top + 8, PITCH.bottom - 8);
      const team = this.lastKicker && this.lastKicker.team === 'A' ? 'B' : 'A';
      const takers = this.players.filter((p) => p.team === team && p.role === 'field' && !(p === this.user && this.sentOff));
      takers.sort((p, q) => dist(p, b) - dist(q, b));
      const t = takers[0];
      this.wait(0.6, () => {
        t.x = b.x;
        t.y = b.y - 10;
        this.giveBall(t);
      });
    }
  }

  // ------------------------------------------------------------- Bonus

  updatePickups() {
    if (this.elapsed > this.nextPickupAt) {
      this.nextPickupAt = this.elapsed + Phaser.Math.Between(9, 14);
      const def = Phaser.Utils.Array.GetRandom(PICKUPS);
      const x = Math.random() < 0.5 ? 26 : 334;
      const y = Phaser.Math.Clamp(this.user.y + Phaser.Math.Between(-150, 150), PITCH.top + 30, PITCH.bottom - 30);
      const img = this.add.image(x, y, def.key).setScale(2).setDepth(3);
      this.tweens.add({ targets: img, y: y - 4, yoyo: true, repeat: -1, duration: 400 });
      this.pickups.push({ img, def, until: this.elapsed + 12 });
    }
    this.pickups = this.pickups.filter((pk) => {
      if (this.elapsed > pk.until) {
        pk.img.destroy();
        return false;
      }
      if (!this.sentOff && dist(this.user, pk.img) < 16) {
        this.stats.pickups++;
        this.slowUntil = this.time.now + 10000;
        this.legende(15, pk.def.label);
        if (pk.def.key === 'merguez') sfx.munch(this);
        else sfx.gulp(this);
        pk.img.destroy();
        return false;
      }
      return true;
    });
  }

  // ------------------------------------------------ Le recruteur de R3

  checkRecruiter() {
    if (this.recruiter || this.career.niveauReel < 40) return;
    const y = Phaser.Math.Clamp(this.user.y, 100, 700);
    this.recruiter = this.add.image(390, y, 'recruiter').setScale(2).setDepth(3).setFlipX(true);
    this.tweens.add({ targets: this.recruiter, x: 350, duration: 1500 });
    sfx.ominous(this);
    const note = txt(this, 180, 70, 'Un homme en lunettes de soleil vous regarde.', 10, CSS.cream, { stroke: CSS.outline })
      .setScrollFactor(0)
      .setDepth(120);
    this.tweens.add({ targets: note, alpha: 0, delay: 3000, duration: 500, onComplete: () => note.destroy() });
  }

  // --------------------------------------- La glissade scriptée (le déclic)

  checkSlipScript() {
    if (this.career.flags.slipSeen || this.sentOff || this.elapsed < SLIP_AT) return;
    const u = this.user;
    this.cutscene = { phase: 'ready', t: 0 };
    u.setAngle(0);
    u.x = 180;
    u.y = 150;
    u.facing.set(0, -1);
    this.oppGK.x = 305;
    this.oppGK.y = 60;
    this.oppGK.setFlipX(true);
    floatText(this, 305, 40, '*refait ses lacets*', CSS.cream, 10);
    this.carrier = u;
    this.ball.x = u.x;
    this.ball.y = u.y + 4;
    this.cameras.main.centerOn(180, 150);
    this.banner('SEUL FACE AU BUT VIDE !', 'Appuie sur TIR.');
  }

  updateCutscene(dt) {
    const cs = this.cutscene;
    cs.t += dt;
    if (cs.phase === 'ready') {
      this.ball.x = this.user.x;
      this.ball.y = this.user.y + 4;
      if (cs.t > 3.5) this.doSlip();
    }
  }

  doSlip() {
    const u = this.user;
    this.cutscene.phase = 'slip';
    this.carrier = null;
    sfx.tackle(this);
    this.tweens.add({ targets: u, angle: -100, y: u.y - 14, duration: 250, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: this.ball, x: 34, y: 26, angle: -540, duration: 1500, ease: 'Sine.easeOut' });

    this.time.delayedCall(1100, () => {
      this.stats.slip = true;
      this.career.flags.slipSeen = true;
      this.cheer(['HAHAHAHA', 'MDRRR', 'OH LE LOOOSER', 'WOUF WOUF']);
      sfx.bark(this);
      sfx.laugh(this);
      this.legende(50);
      pecab(this);
    });

    this.time.delayedCall(3600, () => {
      u.setAngle(0);
      this.oppGK.x = this.oppGK.home.x;
      this.oppGK.y = this.oppGK.home.y;
      this.ball.x = this.oppGK.x;
      this.ball.y = this.oppGK.y + 10;
      this.giveBall(this.oppGK);
      this.cutscene = null;
    });
  }

  // -------------------------------------------------------------- Fin

  endMatch() {
    if (this.over) return;
    this.over = true;
    music.stop();
    sfx.whistle(this, 3);
    save();
    this.time.delayedCall(900, () =>
      this.scene.start('Result', {
        score: this.score,
        stats: this.stats,
        legendeStart: this.legendeStart,
      }),
    );
  }
}
