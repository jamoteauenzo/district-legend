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
import { advanceWeek } from '../data/schedule.js';
import { C, CSS } from '../palette.js';

// Terrain vu de dessus. L'équipe A (la tienne, en bleu) attaque vers le haut.
const W = 360;
const H = 800;
const PITCH = { left: 16, right: 344, top: 40, bottom: 760 };
const GOAL = { left: 150, right: 210 };
// Les différents matchs : amical, Coupe de France, opposition du jeudi.
const MODES = {
  friendly: {
    banner: 'MATCH AMICAL',
    sub: 'Objectif : gagne le match.',
    home: 'ST-CLOU',
    away: 'STE-GLUSE',
    awayFull: 'Sainte-Gluse',
    resultTitle: 'Match amical',
    seconds: 120,
    cards: true,
    pickups: true,
    opp: ['opp1', 'opp2', 'opp3', 'opp4', 'oppGK'],
    ref: 'ref',
  },
  cup: {
    banner: 'COUPE DE FRANCE',
    sub: '1er tour. Objectif : qualifie-toi.',
    home: 'ST-CLOU',
    away: 'PRÉ-MOUILLÉ',
    awayFull: 'Racing Pré-Mouillé',
    resultTitle: 'Coupe de France, 1er tour',
    seconds: 120,
    cards: true,
    pickups: true,
    opp: ['cup1', 'cup2', 'cup3', 'cup4', 'cupGK'],
    ref: 'ref',
  },
  opposition: {
    banner: 'OPPOSITION DU JEUDI',
    sub: 'Sans chasuble contre chasubles. Objectif : gagne.',
    home: 'SANS',
    away: 'CHASUBLES',
    awayFull: 'Chasubles',
    resultTitle: "L'opposition du jeudi",
    seconds: 60,
    cards: false,
    pickups: false,
    opp: ['bibJeanmi', 'bibEnzo', 'bib3', 'bib4', 'mateGK'],
    ref: 'coach',
  },
};
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

  init(data) {
    this.mode = MODES[data?.mode] ? data.mode : 'friendly';
    this.cfg = MODES[this.mode];
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
    // Postes : lane = couloir (0 gauche → 1 droite), baseDepth = hauteur de base
    this.user = this.makePlayer(`p_${this.char.id}`, 180, 520, 'A', 'user', 'mid', 0.5);
    this.mateGK = this.makePlayer('mateGK', 180, 745, 'A', 'gk');
    this.makePlayer('mate1', 100, 620, 'A', 'field', 'def', 0.3);
    this.makePlayer('mate2', 260, 620, 'A', 'field', 'def', 0.7);
    this.makePlayer('mate3', 180, 440, 'A', 'field', 'att', 0.5);
    const o = this.cfg.opp;
    this.oppGK = this.makePlayer(o[4], 180, 55, 'B', 'gk');
    this.makePlayer(o[0], 100, 180, 'B', 'field', 'def', 0.3);
    this.makePlayer(o[1], 260, 180, 'B', 'field', 'def', 0.7);
    this.makePlayer(o[2], 130, 300, 'B', 'field', 'mid', 0.4);
    this.makePlayer(o[3], 220, 370, 'B', 'field', 'att', 0.6);

    this.referee = this.add.image(230, 420, this.cfg.ref).setScale(2);
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

    this.banner(this.cfg.banner, this.cfg.sub);
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

  makePlayer(key, x, y, team, role, pos = null, lane = 0.5) {
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
    p.pos = pos;
    p.lane = lane;
    p.baseDepth = { def: 0.2, mid: 0.42, att: 0.62 }[pos] ?? 0;
    p.maxDepth = { def: 0.55, mid: 0.78, att: 0.92 }[pos] ?? 1;
    p.runSpeed = Phaser.Math.Between(56, 70);
    p.chaseSpeed = Phaser.Math.Between(80, 92);
    p.vel = new Phaser.Math.Vector2();
    p.nextThink = 0;
    p.target = null;
    p.chasing = false;
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
    const minute = Math.min(90, Math.floor((this.elapsed / this.cfg.seconds) * 90));
    this.scoreText.setText(`${this.cfg.home} ${this.score.A} - ${this.score.B} ${this.cfg.away}`);
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
    if (this.elapsed >= this.cfg.seconds) return this.endMatch();

    this.checkSlipScript();
    if (this.cutscene) return;

    this.updateUser(dt);
    this.updateAI(dt);
    this.updateBall(dt);
    this.updateReferee(dt);
    if (this.cfg.pickups) this.updatePickups();
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
      this.bob(u, dt, speed);
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

    if (!this.cfg.cards) {
      sfx.whistle(this);
      this.targetBonus(opp);
      floatText(this, this.referee.x, this.referee.y - 24, 'DOUCEMENT !', CSS.red, 12);
      this.wait(0.9, () => this.freeKick(opp));
      return;
    }
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

  // Opposition du jeudi : tacler Jean-Mi ou le neveu du président, ça compte double.
  targetBonus(opp) {
    const key = opp.texture.key;
    if (key === 'bibJeanmi') {
      this.stats.revenge = (this.stats.revenge ?? 0) + 1;
      this.legende(30, 'Sur Jean-Mi !');
      floatText(this, opp.x, opp.y - 30, 'DE MON TEMPS ON TACLAIT PAS !', CSS.cream, 10);
      if (this.stats.revenge === 1) pecab(this);
    } else if (key === 'bibEnzo') {
      this.stats.revenge = (this.stats.revenge ?? 0) + 1;
      this.career.relations.president -= 1;
      this.legende(30, 'Sur le neveu du président !');
      floatText(this, opp.x, opp.y - 30, 'JE VAIS LE DIRE À TONTON !', CSS.cream, 10);
      if (this.stats.revenge === 1) pecab(this);
    }
  }

  tackleOnReferee() {
    if (!this.cfg.cards) {
      // En opposition, l'« arbitre » c'est le coach
      this.referee.setAngle(90);
      this.legende(50, 'TACLE SUR LE COACH');
      floatText(this, this.referee.x, this.referee.y - 30, 'DEHORS ! DOUCHE !', CSS.red, 13);
      sfx.laugh(this);
      pecab(this);
      this.sentOff = true;
      this.stats.red = true;
      this.stats.sentOffMinute = Math.floor((this.elapsed / this.cfg.seconds) * 90);
      this.wait(3, () => this.endMatch());
      return;
    }
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
    this.stats.sentOffMinute = Math.floor((this.elapsed / this.cfg.seconds) * 90);
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
    // Les ballons mal gonflés du jeudi deviennent une excuse en or
    const mou = (this.career.flags.ballonsMous ?? 0) > 0 && Math.random() < 0.35;
    const line = mou ? 'Le ballon est MOU arbitre !' : Phaser.Utils.Array.GetRandom(CONTEST_LINES);
    floatText(this, u.x, u.y - 30, line, CSS.cream, 11);
    this.legende(mou ? 15 : 10, mou ? 'Ballon mou' : null);
    if (!this.cfg.cards) {
      floatText(this, this.referee.x, this.referee.y - 24, 'Arrête de râler !', CSS.cream, 10);
      return;
    }
    this.annoyance++;
    floatText(this, this.referee.x, this.referee.y - 24, '!'.repeat(Math.min(this.annoyance, 4)), CSS.red, 14);
    if (this.annoyance >= 4) {
      this.annoyance = 0;
      sfx.whistle(this);
      this.giveYellow();
    }
  }

  // --------------------------------------------------------- Les autres
  // Chaque joueur a un poste (défenseur, milieu, attaquant). Il « réfléchit »
  // toutes les 0,25 à 0,6 s pour choisir où aller, puis s'y déplace avec de
  // l'inertie : ça évite les allers-retours robotiques.

  // 0 = sa propre ligne de but, 1 = le but adverse
  teamDepth(team, y) {
    const t = (y - PITCH.top) / (PITCH.bottom - PITCH.top);
    return team === 'A' ? 1 - t : t;
  }

  depthToY(team, d) {
    const t = team === 'A' ? 1 - d : d;
    return PITCH.top + t * (PITCH.bottom - PITCH.top);
  }

  isActive(p) {
    return !(p === this.user && this.sentOff) && this.time.now >= p.stunUntil;
  }

  nearestOpponent(p, pos = p) {
    let best = null;
    let bestD = Infinity;
    for (const q of this.players) {
      if (q.team === p.team || q.role === 'gk' || !this.isActive(q)) continue;
      const d = dist(q, pos);
      if (d < bestD) {
        bestD = d;
        best = q;
      }
    }
    return best;
  }

  updateAI(dt) {
    const ball = this.ball;
    // Classement des joueurs de champ par distance au ballon, pour savoir
    // qui presse et qui couvre. Le joueur humain compte dans son équipe.
    const ranking = {};
    for (const team of ['A', 'B']) {
      const list = this.players.filter((p) => p.team === team && p.role !== 'gk' && this.isActive(p));
      list.sort((a, b) => dist(feet(a), ball) - dist(feet(b), ball));
      ranking[team] = list;
    }

    for (const p of this.players) {
      if (p === this.user) continue;
      if (this.time.now < p.stunUntil) {
        p.vel.set(0, 0);
        continue;
      }
      if (p.angle !== 0) p.setAngle(0);
      if (p.role === 'gk') {
        this.updateKeeper(p, dt);
        continue;
      }
      if (this.carrier === p) {
        this.updateCarrier(p, dt);
        continue;
      }
      if (this.elapsed >= p.nextThink || !p.target) {
        p.nextThink = this.elapsed + Phaser.Math.FloatBetween(0.25, 0.6);
        p.target = this.think(p, ranking[p.team].indexOf(p));
      }
      if (p.chasing) this.steer(p, ball.x, ball.y - 10, p.chaseSpeed, dt);
      else this.steer(p, p.target.x, p.target.y, p.runSpeed, dt);
    }
  }

  think(p, rank) {
    const ball = this.ball;
    const attacking = this.carrier && this.carrier.team === p.team;
    p.chasing = false;

    if (!attacking) {
      // Le plus proche presse le ballon, le deuxième couvre devant son but.
      const chaseRange = p.team === 'A' ? 220 : 400;
      if (rank === 0 && dist(p, ball) < chaseRange) {
        p.chasing = true;
        return { x: ball.x, y: ball.y };
      }
      if (rank === 1) {
        const gy = this.depthToY(p.team, 0);
        const d = Math.hypot(180 - ball.x, gy - ball.y) || 1;
        if (!this.carrier && dist(p, ball) < 50) {
          p.chasing = true;
          return { x: ball.x, y: ball.y };
        }
        return this.clampTarget(ball.x + ((180 - ball.x) / d) * 60, ball.y + ((gy - ball.y) / d) * 60);
      }
    }

    // Position de base selon le poste, qui suit le jeu sans le coller.
    const prog = this.teamDepth(p.team, ball.y);
    const depth = Phaser.Math.Clamp(p.baseDepth + (prog - 0.5) * 0.45 + (attacking ? 0.1 : -0.05), 0.06, p.maxDepth);
    let x = PITCH.left + p.lane * (PITCH.right - PITCH.left) + (ball.x - 180) * 0.3;
    let y = this.depthToY(p.team, depth);

    if (attacking) {
      // Appel de balle : s'écarter du défenseur le plus proche.
      const opp = this.nearestOpponent(p, { x, y });
      if (opp) {
        const d = dist(opp, { x, y });
        if (d < 40) {
          x += ((x - opp.x) / (d || 1)) * (40 - d);
          y += ((y - opp.y) / (d || 1)) * (40 - d);
        }
      }
    } else if (p.pos === 'def' || p.pos === 'mid') {
      // Marquage : se placer entre l'attaquant adverse le plus proche et son but.
      const threat = this.nearestOpponent(p, { x, y });
      if (threat && dist(threat, { x, y }) < 90) {
        const toGoal = Math.sign(this.depthToY(p.team, 0) - threat.y);
        const w = p.pos === 'def' ? 0.65 : 0.4;
        x = x * (1 - w) + threat.x * w;
        y = y * (1 - w) + (threat.y + toGoal * 18) * w;
      }
    }
    return this.clampTarget(x + Phaser.Math.Between(-8, 8), y + Phaser.Math.Between(-8, 8));
  }

  clampTarget(x, y) {
    return {
      x: Phaser.Math.Clamp(x, PITCH.left + 12, PITCH.right - 12),
      y: Phaser.Math.Clamp(y, PITCH.top + 20, PITCH.bottom - 20),
    };
  }

  // Déplacement avec inertie et ralentissement à l'arrivée.
  steer(p, tx, ty, maxSpeed, dt) {
    const dx = tx - p.x;
    const dy = ty - p.y;
    const d = Math.hypot(dx, dy);
    let wantX = 0;
    let wantY = 0;
    if (d > 3) {
      const sp = maxSpeed * Math.min(1, d / 40);
      wantX = (dx / d) * sp;
      wantY = (dy / d) * sp;
    }
    // Ne pas se coller à un coéquipier
    for (const q of this.players) {
      if (q === p || q.team !== p.team) continue;
      const e = dist(p, q);
      if (e > 0 && e < 24) {
        wantX += ((p.x - q.x) / e) * 30;
        wantY += ((p.y - q.y) / e) * 30;
      }
    }
    const k = Math.min(1, 5 * dt);
    p.vel.x += (wantX - p.vel.x) * k;
    p.vel.y += (wantY - p.vel.y) * k;
    p.x += p.vel.x * dt;
    p.y += p.vel.y * dt;
    const sp = Math.hypot(p.vel.x, p.vel.y);
    if (sp > 12) {
      p.facing.set(p.vel.x / sp, p.vel.y / sp);
      if (Math.abs(p.vel.x) > 5) p.setFlipX(p.vel.x < 0);
      this.bob(p, dt, sp);
    }
    this.clampToPitch(p);
  }

  // Petit dandinement quand on court.
  bob(p, dt, speed) {
    p.bobT = (p.bobT ?? 0) + dt * speed * 0.22;
    p.setAngle(Math.sin(p.bobT) * 5);
  }

  updateCarrier(p, dt) {
    const held = this.elapsed - p.holdStart;
    const goalY = this.depthToY(p.team, 1);
    const toGoal = Math.hypot(180 - p.x, goalY - p.y);

    // Avancer vers le but en contournant le défenseur le plus proche.
    const opp = this.nearestOpponent(p);
    const od = opp ? dist(opp, p) : 999;
    let tx = 180 + (p.x - 180) * 0.7;
    if (opp && od < 55) tx = p.x + (p.x < opp.x ? -70 : 70);
    this.steer(p, tx, goalY, 72, dt);

    if (held < 0.5 || this.elapsed < p.nextThink) return;
    p.nextThink = this.elapsed + 0.3;

    if (toGoal < 150) return this.aiShoot(p, goalY);
    if (od < 30 || held > 2.6 || Math.random() < 0.12) {
      const mate = this.bestPassTarget(p);
      if (mate) return this.aiPass(p, mate);
      if (held > 3.5) this.aiShoot(p, goalY);
    }
  }

  // Le coéquipier le plus intéressant : démarqué, plutôt devant, pas trop loin.
  bestPassTarget(p) {
    let best = null;
    let bestScore = -Infinity;
    for (const m of this.players) {
      if (m === p || m.team !== p.team || m.role === 'gk' || !this.isActive(m)) continue;
      const d = dist(p, m);
      if (d < 40 || d > 210) continue;
      const opp = this.nearestOpponent(m);
      const open = opp ? dist(opp, m) : 99;
      if (open < 22) continue;
      const gain = this.teamDepth(p.team, m.y) - this.teamDepth(p.team, p.y);
      let score = gain * 220 + Math.min(open, 60) - Math.abs(d - 110) * 0.3;
      if (m === this.user) score += 30; // on fait jouer le joueur humain
      if (score > bestScore) {
        bestScore = score;
        best = m;
      }
    }
    return best;
  }

  aiPass(p, m) {
    // On vise un peu devant le receveur
    const lead = m === this.user ? this.controls.vector.clone().scale(35) : m.vel.clone().scale(0.35);
    const tx = m.x + lead.x;
    const ty = m.y + 10 + lead.y;
    const d = Math.hypot(tx - p.x, ty - p.y);
    this.kick(p, tx, ty, Phaser.Math.Clamp(150 + d * 0.6, 170, 250));
  }

  aiShoot(p, goalY) {
    this.kick(p, 180 + Phaser.Math.Between(-40, 40), goalY + (p.team === 'A' ? -20 : 20), 300);
  }

  updateKeeper(p, dt) {
    if (this.carrier === p) {
      if (this.elapsed - p.holdStart > 1) {
        const m = this.bestPassTarget(p);
        if (m) this.aiPass(p, m);
        else this.kick(p, Phaser.Math.Between(80, 280), this.depthToY(p.team, 0.55), 240);
      }
      return;
    }
    // Suit le ballon sur sa ligne et sort un peu quand il approche.
    const close = this.teamDepth(p.team, this.ball.y) < 0.2;
    const tx = Phaser.Math.Clamp(this.ball.x, GOAL.left - 6, GOAL.right + 6);
    const ty = p.home.y + (close ? (p.team === 'A' ? -14 : 14) : 0);
    this.steer(p, tx, ty, 70, dt);
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
    p.nextThink = this.elapsed + 0.4;
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
      this.banner('BUT', `Pour ${this.cfg.awayFull}.`);
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
      p.vel.set(0, 0);
      p.target = null;
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
    if (this.mode !== 'friendly' || this.career.flags.slipSeen || this.sentOff || this.elapsed < SLIP_AT) return;
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
    const st = this.stats;
    // Coupe : match nul = séance de tirs au but
    if (this.mode === 'cup' && this.score.A === this.score.B && !st.red) {
      save();
      this.time.delayedCall(900, () =>
        this.scene.start('TrainPenalty', { mode: 'cup', score: { ...this.score }, legendeStart: this.legendeStart }),
      );
      return;
    }
    if (this.mode === 'cup') this.career.flags.coupe1 = this.score.A > this.score.B ? 'qualifié' : 'éliminé';
    advanceWeek();
    save();
    const lines = [
      ['Distance parcourue', `${Math.round(st.distance / 3)} m`],
      ['Contestations', st.contestations],
      ['Fautes', st.fouls],
      ['Cartons', st.red ? `Rouge (${st.sentOffMinute}')` : st.yellow ? 'Jaune' : 'Aucun'],
      ['Merguez & co', st.pickups],
      ['Ballons dans le parking', st.parking],
      ['Contre son camp', st.ownGoals],
      ['Buts', st.goals],
    ];
    if (this.mode === 'opposition') lines.splice(4, 3, ['Tacles sur Jean-Mi ou le neveu', st.revenge ?? 0]);
    this.time.delayedCall(900, () =>
      this.scene.start('Result', {
        title: this.cfg.resultTitle,
        subtitle: 'Match',
        official: `${this.cfg.home === 'SANS' ? 'Sans chasuble' : 'Saint-Clou'} ${this.score.A} - ${this.score.B} ${this.cfg.awayFull}`,
        lines,
        coach: this.coachLine(st),
        legendeStart: this.legendeStart,
        reporter: true,
      }),
    );
  }

  coachLine(st) {
    if (this.mode === 'opposition') {
      if (st.revenge) return 'Jean-Mi : « Dimanche, on en reparle. »';
      return 'Coach Gérard : « Bon. On garde la même équipe pour dimanche. »';
    }
    if (this.mode === 'cup') {
      if (this.score.A > this.score.B) return 'Le président : « Le 2e tour ! On va être dans le journal ! »';
      return 'Le président : « Éliminés au 1er tour. Comme chaque année. La tradition est respectée. »';
    }
    if (st.red) return "Le président : « Viens, je t'offre un Ricard. »";
    if (st.goals >= 2) return 'Coach Gérard : « Hmm. Pas mal. » (il soupire)';
    if (st.ownGoals) return "Le vestiaire : « On t'en reparlera toute ta vie. »";
    if (st.contestations >= 5) return 'M. Loiseau : « Je te connais depuis les U11, toi. »';
    return 'Coach Gérard : « On joue simple, les gars. SIMPLE. »';
  }
}
