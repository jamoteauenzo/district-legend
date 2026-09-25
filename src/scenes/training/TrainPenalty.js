import Phaser from 'phaser';
import BaseTraining from './BaseTraining.js';
import { txt, floatText } from '../../ui/text.js';
import { sfx } from '../../ui/sfx.js';
import { buvette, parking } from './decor.js';
import { C, CSS } from '../../palette.js';

// Tirs au but. Deux modes :
// - entraînement du jeudi contre Fred (5 tirs, objectif 4 buts)
// - séance de tirs au but de la Coupe de France après un match nul
// Viser (curseur qui bouge), puis doser la puissance. Mais la panenka
// arrêtée, la frappe dans la buvette et la célébration avant de tirer…
const GOAL = { left: 70, right: 290, top: 150, bottom: 220 };
const SHOTS = 5;

export default class TrainPenalty extends BaseTraining {
  constructor() {
    super('TrainPenalty');
  }

  init(data) {
    super.init();
    this.cup = data?.mode === 'cup';
    this.matchScore = data?.score;
    this.matchLegendeStart = data?.legendeStart;
  }

  create() {
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(C.sky, 1);
    g.fillRect(0, 40, 360, 110);
    for (let i = 0; i < 12; i++) {
      g.fillStyle(i % 2 ? C.grass : C.grassDark, 1);
      g.fillRect(0, 150 + i * 42, 360, 42);
    }
    parking(this, 0, 60, 110, 50);
    buvette(this, 272, 70);
    // Le but et son filet
    g.fillStyle(C.cream, 0.18);
    g.fillRect(GOAL.left, GOAL.top, GOAL.right - GOAL.left, GOAL.bottom - GOAL.top);
    g.lineStyle(1, C.cream, 0.35);
    for (let x = GOAL.left; x < GOAL.right; x += 12) g.lineBetween(x, GOAL.top, x, GOAL.bottom);
    for (let y = GOAL.top; y < GOAL.bottom; y += 12) g.lineBetween(GOAL.left, y, GOAL.right, y);
    g.fillStyle(C.cream, 1);
    g.fillRect(GOAL.left - 5, GOAL.top - 5, GOAL.right - GOAL.left + 10, 5);
    g.fillRect(GOAL.left - 5, GOAL.top, 5, GOAL.bottom - GOAL.top);
    g.fillRect(GOAL.right, GOAL.top, 5, GOAL.bottom - GOAL.top);
    g.lineStyle(2, C.chalk, 0.9);
    g.lineBetween(0, GOAL.bottom, 360, GOAL.bottom);
    g.fillStyle(C.chalk, 1);
    g.fillCircle(180, 470, 3);

    this.keeper = this.add.image(180, 196, this.cup ? 'cupGK' : 'mateGK').setScale(4).setDepth(4);
    this.user = this.add.image(180, 560, `p_${this.char.id}`).setScale(4).setDepth(5);
    this.ball = this.add.image(180, 470, 'ball').setScale(3).setDepth(6);
    this.cursor = this.add.graphics().setDepth(7);
    this.powerBar = this.add.graphics().setDepth(7);
    this.scoreText = txt(this, 180, 262, '', 13, CSS.cream, { bold: true, stroke: CSS.outline }).setDepth(8);
    this.infoText = txt(this, 180, 290, '', 11, CSS.cream, { stroke: CSS.outline }).setDepth(8);

    this.shot = 0;
    this.goals = 0;
    this.oppGoals = 0;
    this.oppShots = 0;
    this.panenkaSaved = 0;
    this.buvetteHits = 0;
    this.parkingHits = 0;
    this.posts = 0;
    this.celebrations = 0;
    this.slips = 0;
    this.phase = 'wait';

    this.makeBtn(180, 600, 34, 'TIRER', C.red, () => this.lock());
    this.makeBtn(70, 600, 28, 'PANENKA', C.blue, () => this.panenka(), 9);
    this.makeBtn(290, 600, 28, 'CÉLÉBRER', C.yellow, () => this.celebrate(), 9, CSS.outline);
    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown-X', () => this.lock());
      kb.on('keydown-SPACE', () => this.lock());
      kb.on('keydown-V', () => this.panenka());
      kb.on('keydown-C', () => this.celebrate());
    }

    const title = this.cup ? 'Tirs au but' : 'Tirs au but';
    const objective = this.cup ? 'qualifie Saint-Clou' : `marque 4 tirs sur ${SHOTS}`;
    this.setup({ title, objective, duration: 999 });
    if (this.cup && this.matchLegendeStart !== undefined) this.legendeStart = this.matchLegendeStart;
    this.timerText.setVisible(false);
    this.time.delayedCall(2300, () => this.nextShot());
    this.refresh();
  }

  makeBtn(x, y, r, label, fill, cb, size = 12, color = CSS.cream) {
    const c = this.add.circle(x, y, r, fill, 0.9).setStrokeStyle(3, C.outline).setDepth(60).setInteractive();
    txt(this, x, y, label, size, color, { bold: true, stroke: color === CSS.cream ? CSS.outline : undefined }).setDepth(61);
    c.on('pointerdown', () => {
      c.setScale(0.9);
      cb();
    });
    c.on('pointerup', () => c.setScale(1));
    c.on('pointerout', () => c.setScale(1));
  }

  refresh() {
    if (this.cup) this.scoreText.setText(`ST-CLOU ${this.goals} - ${this.oppGoals} PRÉ-MOUILLÉ`);
    else this.scoreText.setText(`Tir ${Math.min(this.shot, SHOTS)}/${SHOTS}   Buts : ${this.goals}`);
  }

  nextShot() {
    if (this.over) return;
    if (this.isFinished()) return this.end();
    this.shot++;
    this.phase = 'aim';
    this.aimT = 0;
    this.celebrated = false;
    this.keeper.setPosition(180, 196).setAngle(0);
    this.ball.setPosition(180, 470).setScale(3).setVisible(true);
    this.user.setPosition(180, 560).setAngle(0);
    this.infoText.setText('Vise... puis TIRER');
    this.refresh();
  }

  isFinished() {
    if (!this.cup) return this.shot >= SHOTS;
    const n = this.shot;
    // Séance classique en 5, puis mort subite
    if (n >= SHOTS && this.oppShots >= n && this.goals !== this.oppGoals) return true;
    if (n < SHOTS) {
      const left = SHOTS - n;
      if (this.goals > this.oppGoals + left || this.oppGoals > this.goals + left) return true;
    }
    return n >= 10;
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.cursor.clear();
    this.powerBar.clear();
    if (this.phase === 'aim') {
      this.aimT += dt;
      this.aimX = 180 + Math.sin(this.aimT * (this.celebrated ? 4.2 : 2.6)) * 130;
      this.cursor.lineStyle(3, C.red, 1);
      this.cursor.strokeCircle(this.aimX, 185, 10);
      this.cursor.lineBetween(this.aimX - 14, 185, this.aimX + 14, 185);
    } else if (this.phase === 'power') {
      this.powerT += dt;
      this.power = (Math.sin(this.powerT * (this.celebrated ? 5.5 : 3.6) - Math.PI / 2) + 1) / 2;
      this.cursor.lineStyle(3, C.red, 1);
      this.cursor.strokeCircle(this.aimX, 185, 10);
      const x = 320;
      const y = 330;
      const h = 120;
      this.powerBar.fillStyle(C.cream, 0.9);
      this.powerBar.fillRect(x, y, 16, h);
      this.powerBar.fillStyle(C.red, 1);
      this.powerBar.fillRect(x, y, 16, h * 0.1);
      this.powerBar.fillStyle(C.yellow, 1);
      this.powerBar.fillRect(x, y + h * (1 - this.power), 16, h * this.power);
      this.powerBar.lineStyle(2, C.outline, 1);
      this.powerBar.strokeRect(x, y, 16, h);
    }
  }

  lock() {
    if (!this.running || this.over) return;
    if (this.phase === 'aim') {
      this.phase = 'power';
      this.powerT = 0;
      this.infoText.setText('Dose la frappe... TIRER');
    } else if (this.phase === 'power') {
      this.phase = 'shoot';
      this.shoot(this.aimX, this.power, false);
    }
  }

  celebrate() {
    if (!this.running || this.over || this.phase !== 'aim' || this.celebrated) return;
    this.celebrated = true;
    this.celebrations++;
    const moves = ['*fait le SIUUU*', '*mime un avion*', '*embrasse son écusson*', '*fait le téléphone*'];
    floatText(this, this.user.x, this.user.y - 50, Phaser.Utils.Array.GetRandom(moves), CSS.yellow, 12);
    this.tweens.add({ targets: this.user, angle: 360, duration: 500 });
    this.legende(30, 'Célébration avant de tirer', 180, 380);
    sfx.cheer(this);
  }

  panenka() {
    if (!this.running || this.over || this.phase !== 'aim') return;
    this.phase = 'shoot';
    this.shoot(180, 0.5, true);
  }

  shoot(aimX, power, isPanenka) {
    this.infoText.setText('');
    const u = this.user;
    // Course d'élan
    this.tweens.add({
      targets: u,
      y: 492,
      duration: 350,
      onComplete: () => {
        // Glissade au moment de frapper
        if (!isPanenka && Math.random() < 0.08) return this.slip();
        sfx.kick(this);
        this.resolve(aimX, power, isPanenka);
      },
    });
  }

  slip() {
    this.slips++;
    this.user.setAngle(90);
    sfx.tackle(this);
    this.tweens.add({ targets: this.ball, x: 200, y: 400, duration: 900, ease: 'Sine.easeOut' });
    this.legende(60, 'Glissade au moment de frapper', 180, 380);
    sfx.laugh(this);
    this.firstPecab();
    this.afterShot(false);
  }

  resolve(aimX, power, isPanenka) {
    const b = this.ball;
    // Le gardien plonge d'un côté (ou reste au milieu)
    const dives = ['left', 'center', 'right'];
    const dive = isPanenka ? (Math.random() < 0.33 ? 'center' : Math.random() < 0.5 ? 'left' : 'right') : Phaser.Utils.Array.GetRandom(dives);
    const diveX = { left: 110, center: 180, right: 250 }[dive];
    this.tweens.add({ targets: this.keeper, x: diveX, angle: dive === 'left' ? -70 : dive === 'right' ? 70 : 0, duration: 300 });

    const zone = aimX < 140 ? 'left' : aimX > 220 ? 'right' : 'center';
    let result;
    if (isPanenka) result = dive === 'center' ? 'panenkaSaved' : 'panenkaGoal';
    else if (power > 0.9) result = aimX > 180 ? 'buvette' : 'parking';
    else if (aimX < GOAL.left - 4 || aimX > GOAL.right + 4) result = 'wide';
    else if (aimX < GOAL.left + 8 || aimX > GOAL.right - 8) result = 'post';
    else if (power < 0.3) result = 'weak';
    else result = zone === dive ? 'saved' : 'goal';

    const dest = {
      buvette: { x: 305, y: 90, s: 1.6 },
      parking: { x: 55, y: 85, s: 1.6 },
      wide: { x: aimX, y: 170, s: 2 },
      post: { x: aimX < 180 ? GOAL.left : GOAL.right, y: 185, s: 2 },
      weak: { x: diveX, y: 205, s: 2.4 },
      saved: { x: diveX, y: 196, s: 2.2 },
      goal: { x: aimX, y: 180, s: 2 },
      panenkaSaved: { x: 180, y: 190, s: 2.2 },
      panenkaGoal: { x: 180, y: 172, s: 2 },
    }[result];
    this.tweens.add({
      targets: b,
      x: dest.x,
      y: dest.y,
      scale: dest.s,
      duration: isPanenka ? 900 : result === 'weak' ? 800 : 380,
      ease: isPanenka ? 'Sine.easeInOut' : 'Quad.easeOut',
      onComplete: () => this.outcome(result),
    });
  }

  outcome(result) {
    let scored = false;
    if (result === 'goal' || result === 'panenkaGoal') {
      scored = true;
      this.goals++;
      this.niveau(result === 'panenkaGoal' ? 6 : 3);
      this.legende(result === 'panenkaGoal' ? -20 : -10, result === 'panenkaGoal' ? 'Panenka réussie...' : 'But.', 180, 380);
      if (this.cup) sfx.cheer(this, true);
    } else if (result === 'panenkaSaved') {
      this.panenkaSaved++;
      this.legende(120, 'PANENKA ARRÊTÉE', 180, 380);
      floatText(this, 180, 240, 'Le gardien a même pas bougé', CSS.cream, 11);
      sfx.laugh(this);
      this.firstPecab();
    } else if (result === 'buvette') {
      this.buvetteHits++;
      sfx.stamp(this);
      floatText(this, 305, 60, 'CRAAASH', CSS.cream, 13);
      this.legende(80, 'Dans la buvette !', 180, 380);
      sfx.laugh(this);
      this.firstPecab();
    } else if (result === 'parking') {
      this.parkingHits++;
      sfx.alarm(this);
      this.legende(30, 'Dans le parking !', 180, 380);
    } else if (result === 'post') {
      this.posts++;
      sfx.thud(this);
      this.legende(15, 'POTEAU', 180, 380);
    } else if (result === 'wide') {
      this.legende(10, 'À côté', 180, 380);
    } else if (result === 'weak') {
      this.legende(10, 'Trop mou', 180, 380);
    } else {
      floatText(this, this.keeper.x, 150, 'Arrêt', CSS.cream, 12);
      this.niveau(1);
    }
    if (!scored && this.celebrated) this.legende(100, 'Célébré... puis raté', 180, 410);
    this.afterShot(scored);
  }

  afterShot() {
    this.refresh();
    if (!this.cup) {
      this.time.delayedCall(1500, () => this.nextShot());
      return;
    }
    // L'adversaire tire à son tour
    this.time.delayedCall(1300, () => {
      if (this.over) return;
      this.oppShots++;
      const ok = Math.random() < 0.72;
      if (ok) this.oppGoals++;
      sfx.kick(this);
      this.infoText.setText(ok ? 'Pré-Mouillé : MARQUÉ' : 'Pré-Mouillé : RATÉ !');
      if (!ok) sfx.cheer(this);
      this.refresh();
      this.time.delayedCall(1300, () => this.nextShot());
    });
  }

  end() {
    const lines = [
      ['Tirs au but marqués', `${this.goals}/${this.shot}`],
      ['Panenkas arrêtées', this.panenkaSaved],
      ['Dans la buvette', this.buvetteHits],
      ['Dans le parking', this.parkingHits],
      ['Poteaux', this.posts],
      ['Célébrations avant de tirer', this.celebrations],
      ['Glissades', this.slips],
    ];
    if (!this.cup) {
      let coach = 'Coach Gérard : « Dimanche, tu ne tires pas. »';
      if (this.goals >= 4) coach = 'Coach Gérard : « Toi, tu tires le premier dimanche. »';
      else if (this.panenkaSaved) coach = 'Fred : « Je te remercie pour la panenka. »';
      else if (this.buvetteHits) coach = 'Le président : « La BUVETTE ?! »';
      return this.finish(lines, coach);
    }
    const qualified = this.goals > this.oppGoals;
    this.career.flags.coupe1 = qualified ? 'qualifié' : 'éliminé';
    const coach = qualified
      ? 'Le président : « Le 2e tour ! On va être dans le journal ! »'
      : 'Le président : « Éliminés aux tirs au but. Comme en 2019. Et en 2014. »';
    this.finish(lines, coach, {
      title: 'Coupe de France, 1er tour',
      subtitle: 'Match',
      official: `Saint-Clou ${this.matchScore.A} - ${this.matchScore.B} Pré-Mouillé (${this.goals} - ${this.oppGoals} tab)`,
      reporter: true,
    });
  }
}
