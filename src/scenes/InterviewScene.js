import Phaser from 'phaser';
import { state, gainLegende, save } from '../state.js';
import { QUESTIONS, REACTIONS, judge } from '../data/reporter.js';
import { txt, title, button } from '../ui/text.js';
import { Mug } from '../ui/mug.js';
import { pecab } from '../ui/pecab.js';
import { sfx } from '../ui/sfx.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { say } from '../ui/dialogue.js';
import { loadPortraits, portraitKey } from '../assets.js';
import { C, CSS } from '../palette.js';
import { setupCamera } from '../view.js';

// L'interview d'après-match, filmée en story par le Reporter.
// Une question, trois morceaux de réponse à choisir. Le jeu ne dit jamais
// ce qui fait un PÉCAB : le joueur le comprend en essayant.
const FACE = { sage: 'neutre', mytho: 'fier', ok: 'fier', pecab: 'rire' };

export default class InterviewScene extends Phaser.Scene {
  constructor() {
    super('Interview');
  }

  init(data) {
    this.career = state.career;
    this.red = !!data?.red;
  }

  preload() {
    loadPortraits(this, [this.career.charId, 'reporter']);
  }

  create() {
    setupCamera(this);
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
    this.optionObjs = [];

    this.drawVideo();
    this.drawStoryUi();

    this.caption(150, `« ${this.q.question} »`, 17);
    this.answerBg = this.add.rectangle(180, 452, 10, 10, C.ink, 0.85).setDepth(20).setVisible(false);
    this.answerText = txt(this, 180, 452, '', 15, CSS.yellow, { italic: true, bold: true, wrap: 316 }).setDepth(21);
    this.slotLabel = title(this, 180, 488, '', 13, CSS.paper, { stroke: CSS.ink, strokeThickness: 4 }).setDepth(22);

    this.mug = new Mug(this, 334, 104).setDepth(30);
    this.mug.setValue(this.career.legende, false);
    muteButton(this, 294, 104);

    this.time.delayedCall(900, () => this.showOptions());
  }

  // La « vidéo » : le joueur filmé devant le club-house, caméra à l'épaule
  drawVideo() {
    this.video = this.add.container(0, 0).setDepth(0);
    const g = this.add.graphics();
    g.fillStyle(C.paperDark, 1);
    g.fillRect(-20, -20, 400, 700);
    // Club-house en préfabriqué
    g.fillStyle(C.cream, 1);
    g.fillRect(10, 170, 340, 230);
    g.fillStyle(C.ink, 0.15);
    g.fillRect(10, 170, 340, 12);
    g.fillStyle(C.blue, 1);
    g.fillRect(36, 214, 70, 52);
    g.fillRect(254, 214, 70, 52);
    g.fillStyle(C.white, 0.35);
    g.fillRect(40, 218, 20, 44);
    g.fillRect(258, 218, 20, 44);
    g.fillStyle(C.red, 1);
    g.fillRect(120, 196, 120, 24);
    // Pelouse
    g.fillStyle(C.green, 1);
    g.fillRect(-20, 400, 400, 300);
    this.video.add(g);
    this.video.add(title(this, 180, 208, 'Club-house', 14, CSS.paper));
    this.face = this.add.image(180, 548, portraitKey(this.career.charId, 'neutre')).setOrigin(0.5, 1).setDisplaySize(300, 384);
    this.video.add(this.face);
    // Caméra à l'épaule
    this.tweens.add({ targets: this.video, x: 3, y: -2, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // Assombrir le bas pour lire les choix
    this.add.rectangle(180, 580, 360, 140, C.ink, 0.55).setDepth(5);
  }

  drawStoryUi() {
    this.progress = this.add.graphics().setDepth(10);
    this.drawProgress();
    const avatar = this.add.graphics().setDepth(10);
    avatar.fillStyle(C.red, 1);
    avatar.fillCircle(28, 60, 13);
    avatar.lineStyle(2, C.paper, 1);
    avatar.strokeCircle(28, 60, 13);
    title(this, 50, 52, 'seniorsb.stclou', 14, CSS.ink, { ox: 0, spacing: 0 }).setDepth(10);
    txt(this, 50, 70, 'Le Reporter · en direct du parking', 11, CSS.ink, { ox: 0, italic: true }).setDepth(10);
    const rec = title(this, 344, 60, '● REC', 12, CSS.red, { ox: 1 }).setDepth(10);
    this.tweens.add({ targets: rec, alpha: 0.2, yoyo: true, repeat: -1, duration: 500 });
  }

  drawProgress() {
    const g = this.progress;
    g.clear();
    for (let i = 0; i < 3; i++) {
      g.fillStyle(C.ink, i < this.slot ? 1 : 0.25);
      g.fillRect(14 + i * 112, 26, 106, 4);
    }
  }

  // Sous-titre façon story : bandeau noir, texte papier
  caption(y, text, size = 15) {
    const t = txt(this, 180, y, text, size, CSS.paper, { italic: true, bold: true, wrap: 316 }).setDepth(21);
    this.add.rectangle(180, y, Math.min(340, t.width + 22), t.height + 12, C.ink, 0.9).setDepth(20);
    return t;
  }

  showOptions() {
    this.optionObjs.forEach((o) => o.destroy());
    this.optionObjs = [];
    const slot = this.q.slots[this.slot];
    this.slotLabel.setText(slot.label.toUpperCase());
    this.pickOptions(slot.pool).forEach((opt, i) => {
      const b = button(this, 180, 522 + i * 40, 320, 34, opt.t, () => this.choose(opt), { size: 14, plain: true });
      b.setDepth(22);
      this.optionObjs.push(b);
    });
  }

  // 3 propositions : une plutôt sage ou crédible, une plutôt énorme, une au hasard.
  pickOptions(pool) {
    const avail = pool.filter((p) => !p.who || p.who === this.career.charId);
    const chosen = [];
    const pick = (list) => Phaser.Utils.Array.GetRandom(list.filter((p) => !chosen.includes(p)));
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
    this.answerText.setText(`« ${this.parts.map((p) => p.t).join(' ')}${this.slot === 3 ? '.' : '…'} »`);
    this.answerBg.setVisible(true).setSize(Math.min(340, this.answerText.width + 22), this.answerText.height + 12).setOrigin(0.5);
    if (this.slot < 3) this.showOptions();
    else this.react();
  }

  react() {
    this.optionObjs.forEach((o) => o.destroy());
    this.slotLabel.setText('');
    const verdict = judge(this.parts);
    const r = REACTIONS[verdict];
    const views = Phaser.Math.Between(r.views[0], r.views[1]);
    const f = this.career.flags;
    f.views = (f.views ?? 0) + views;
    if (verdict === 'pecab') f.pecabs = (f.pecabs ?? 0) + 1;
    const key = portraitKey(this.career.charId, FACE[verdict]);
    if (this.textures.exists(key)) this.face.setTexture(key).setDisplaySize(300, 384);
    save();

    this.time.delayedCall(600, async () => {
      gainLegende(r.legende);
      this.mug.setValue(this.career.legende);
      if (r.legende > 0) sfx.gain(this);
      else if (r.legende < 0) sfx.loss(this);

      if (verdict === 'pecab') {
        pecab(this);
        sfx.laugh(this);
        await new Promise((res) => this.time.delayedCall(1500, res));
      } else {
        // Le Reporter répond, en personne (enfin, sa main et son téléphone)
        const expr = verdict === 'ok' ? 'rire' : verdict === 'mytho' ? 'gueule' : 'choque';
        await say(this, { who: 'reporter', expr, text: Phaser.Utils.Array.GetRandom(r.lines), side: 'left', veil: 'full', auto: 2200, type: verdict === 'sage' ? 'murmure' : 'normal' });
      }
      if (verdict === 'sage') {
        this.add.rectangle(180, 320, 360, 640, C.ink, 1).setDepth(40);
        txt(this, 180, 300, "La vidéo n'a pas été postée.", 16, CSS.paper, { italic: true }).setDepth(41);
      }
      this.finishButton(views);
    });
  }

  finishButton(views) {
    const label = views >= 1000 ? `${(views / 1000).toFixed(1).replace('.', ',')}k vues` : `${views} vues`;
    const t = title(this, 180, 400, `▶ ${label}`, 26, CSS.paper, { stroke: CSS.ink, strokeThickness: 6 }).setDepth(45);
    t.setScale(0.5);
    this.tweens.add({ targets: t, scale: 1, duration: 250, ease: 'Back.easeOut' });
    button(this, 180, 596, 300, 46, 'Continuer', () => this.scene.start('Programme'), { fill: C.red, size: 18 }).setDepth(46);
  }
}
