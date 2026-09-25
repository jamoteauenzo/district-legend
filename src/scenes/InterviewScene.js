import Phaser from 'phaser';
import { state, gainLegende, save } from '../state.js';
import { QUESTIONS, REACTIONS, judge } from '../data/reporter.js';
import { txt, button } from '../ui/text.js';
import { Mug } from '../ui/mug.js';
import { pecab } from '../ui/pecab.js';
import { sfx } from '../ui/sfx.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { C, CSS } from '../palette.js';

// L'interview d'après-match, filmée en story par le Reporter.
// Une question, trois morceaux de réponse à choisir. Le jeu ne dit jamais
// ce qui fait un PÉCAB : le joueur le comprend en essayant.
export default class InterviewScene extends Phaser.Scene {
  constructor() {
    super('Interview');
  }

  init(data) {
    this.career = state.career;
    this.red = !!data?.red;
  }

  create() {
    music.stop();
    const f = this.career.flags;
    f.interviews = (f.interviews ?? 0) + 1;

    // Quelle question ? La culte d'abord, puis on varie.
    let key = 'bu';
    if (this.red && Math.random() < 0.7) key = 'rouge';
    else if (f.interviews > 1 && Math.random() < 0.5) key = Phaser.Utils.Array.GetRandom(['mange', 'dormi']);
    this.q = QUESTIONS[key];
    this.parts = [];
    this.slot = 0;

    this.drawVideo();
    this.drawStoryUi();

    this.questionText = this.caption(150, `« ${this.q.question} »`, CSS.cream, 16);
    this.answerText = txt(this, 180, 420, '', 14, CSS.yellow, { bold: true, stroke: CSS.outline, strokeThickness: 4, wrap: 320 }).setDepth(20);
    this.slotLabel = txt(this, 180, 478, '', 12, CSS.cream, { stroke: CSS.outline }).setDepth(20);
    this.optionObjs = [];

    this.mug = new Mug(this, 334, 64).setDepth(30);
    this.mug.setValue(this.career.legende, false);
    muteButton(this, 298, 64);

    this.time.delayedCall(900, () => this.showOptions());
  }

  // La « vidéo » : le joueur filmé devant le club-house, caméra à l'épaule.
  drawVideo() {
    this.video = this.add.container(0, 0).setDepth(0);
    const g = this.add.graphics();
    g.fillStyle(C.sky, 1);
    g.fillRect(-20, -20, 400, 330);
    g.fillStyle(C.prefab, 1);
    g.fillRect(40, 190, 280, 130);
    g.fillStyle(0x8a7d5e, 1);
    g.fillRect(30, 180, 300, 12);
    g.fillStyle(0x5aa0e6, 1);
    g.fillRect(70, 220, 50, 34);
    g.fillRect(240, 220, 50, 34);
    g.fillStyle(C.grass, 1);
    g.fillRect(-20, 310, 400, 360);
    this.video.add(g);
    const face = this.add.image(180, 350, `p_${this.career.charId}`).setScale(10);
    this.video.add(face);
    // Caméra à l'épaule
    this.tweens.add({ targets: this.video, x: 3, y: -2, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // Assombrir le bas pour lire les boutons
    this.add.rectangle(180, 560, 360, 180, C.outline, 0.55).setDepth(5);
  }

  drawStoryUi() {
    const g = this.add.graphics().setDepth(10);
    this.progress = g;
    this.drawProgress();
    const avatar = this.add.graphics().setDepth(10);
    avatar.fillStyle(C.red, 1);
    avatar.fillCircle(28, 60, 12);
    avatar.lineStyle(2, C.cream, 1);
    avatar.strokeCircle(28, 60, 12);
    txt(this, 48, 52, 'seniorsb.stclou', 12, CSS.cream, { ox: 0, bold: true, stroke: CSS.outline }).setDepth(10);
    txt(this, 48, 68, 'Le Reporter · en direct du parking', 10, CSS.cream, { ox: 0, stroke: CSS.outline }).setDepth(10);
    const rec = txt(this, 330, 100, '● REC', 11, CSS.red, { bold: true, stroke: CSS.outline }).setDepth(10);
    this.tweens.add({ targets: rec, alpha: 0.2, yoyo: true, repeat: -1, duration: 500 });
  }

  drawProgress() {
    const g = this.progress;
    g.clear();
    for (let i = 0; i < 3; i++) {
      g.fillStyle(C.cream, i < this.slot ? 1 : 0.35);
      g.fillRect(14 + i * 112, 26, 106, 4);
    }
  }

  caption(y, text, color, size = 14) {
    const t = txt(this, 180, y, text, size, color, { bold: true, wrap: 320 }).setDepth(21);
    const bg = this.add.rectangle(180, y, Math.min(340, t.width + 20), t.height + 12, C.outline, 0.75).setDepth(20);
    t.bg = bg;
    return t;
  }

  showOptions() {
    this.optionObjs.forEach((o) => {
      o.bg.destroy();
      o.t.destroy();
    });
    this.optionObjs = [];
    const slot = this.q.slots[this.slot];
    this.slotLabel.setText(slot.label);
    this.pickOptions(slot.pool).forEach((opt, i) => {
      const b = button(this, 180, 512 + i * 44, 320, 38, opt.t, () => this.choose(opt), { size: 12 });
      b.bg.setDepth(22);
      b.t.setDepth(23);
      this.optionObjs.push(b);
    });
  }

  // 3 propositions : une plutôt sage ou crédible, une plutôt énorme, une au hasard.
  pickOptions(pool) {
    const avail = pool.filter((p) => !p.who || p.who === this.career.charId);
    const pick = (list) => Phaser.Utils.Array.GetRandom(list.filter((p) => !chosen.includes(p)));
    const chosen = [];
    chosen.push(pick(avail.filter((p) => p.tag === 'sage' || p.tag === 'ok')));
    const big = avail.filter((p) => p.tag === 'enorme' || p.tag === 'absurde');
    if (big.length) chosen.push(pick(big));
    while (chosen.length < 3) {
      const p = pick(avail);
      if (!p) break;
      chosen.push(p);
    }
    return Phaser.Utils.Array.Shuffle(chosen.filter(Boolean));
  }

  choose(opt) {
    if (this.slot >= 3) return;
    this.parts.push(opt);
    this.slot++;
    this.drawProgress();
    this.answerText.setText(`« ${this.parts.map((p) => p.t).join(' ')}${this.slot === 3 ? '.' : '...'} »`);
    if (this.slot < 3) this.showOptions();
    else this.react();
  }

  react() {
    this.optionObjs.forEach((o) => {
      o.bg.destroy();
      o.t.destroy();
    });
    this.slotLabel.setText('');
    const verdict = judge(this.parts);
    const r = REACTIONS[verdict];
    const views = Phaser.Math.Between(r.views[0], r.views[1]);
    const f = this.career.flags;
    f.views = (f.views ?? 0) + views;
    if (verdict === 'pecab') f.pecabs = (f.pecabs ?? 0) + 1;

    this.time.delayedCall(700, () => {
      if (verdict === 'pecab') {
        pecab(this);
        sfx.laugh(this);
      } else {
        sfx.select(this);
        this.caption(230, `Le Reporter : « ${Phaser.Utils.Array.GetRandom(r.lines)} »`, verdict === 'ok' ? CSS.yellow : CSS.cream, 13);
      }
      gainLegende(r.legende);
      this.mug.setValue(this.career.legende);
      if (r.legende > 0) sfx.gain(this);
      else if (r.legende < 0) sfx.loss(this);

      if (verdict === 'sage') {
        // La caméra se coupe
        this.time.delayedCall(900, () => {
          this.add.rectangle(180, 320, 360, 640, C.outline, 1).setDepth(40);
          txt(this, 180, 300, "La vidéo n'a pas été postée.", 14, CSS.grey).setDepth(41);
          this.finishButton(views);
        });
      } else {
        this.time.delayedCall(verdict === 'pecab' ? 1400 : 600, () => this.finishButton(views));
      }
    });
    save();
  }

  finishButton(views) {
    const label = views >= 1000 ? `${(views / 1000).toFixed(1).replace('.', ',')}k vues` : `${views} vues`;
    txt(this, 180, 470, `▶ ${label}`, 16, CSS.cream, { bold: true, stroke: CSS.outline, strokeThickness: 4 }).setDepth(45);
    const b = button(this, 180, 580, 240, 46, 'CONTINUER', () => this.scene.start('Programme'), { size: 14 });
    b.bg.setDepth(46);
    b.t.setDepth(47);
  }
}
