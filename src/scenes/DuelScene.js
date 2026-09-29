import Phaser from 'phaser';
import { state, gainLegende, save } from '../state.js';
import { advanceWeek } from '../data/schedule.js';
import { txt, button, floatText } from '../ui/text.js';
import { pecab } from '../ui/pecab.js';
import { sfx } from '../ui/sfx.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { C, CSS } from '../palette.js';
import { setupCamera } from '../view.js';

// Boss du chapitre 1, phase 2 : le duel de chambrage à la buvette.
// Tour par tour. Jean-Mi prépare une réplique (on devine laquelle à son
// attitude), tu réponds avec une vanne. Comme pierre-feuille-ciseaux :
//   la vanne sur l'âge bat l'anecdote de gloire,
//   l'anecdote de gloire bat la vanne sur le physique,
//   la vanne sur le physique bat la vanne sur l'âge.
const TYPES = {
  age: { label: "Vanne sur l'âge", beats: 'gloire' },
  gloire: { label: 'Anecdote de gloire', beats: 'physique' },
  physique: { label: 'Vanne sur le physique', beats: 'age' },
};

const MINE = {
  age: ['Ton dernier but, c\'était en francs.', 'Ta licence, elle est sur papyrus ?', 'Tu t\'échauffes depuis 1998 ?', 'T\'as connu le foot en noir et blanc ?'],
  gloire: ['En U15, on m\'appelait « le Messi du canton ».', 'J\'ai serré la main d\'un joueur de Ligue 2.', 'J\'ai marqué contre Grandcour. En futsal, mais quand même.', 'L\'an dernier, retourné au tournoi de sixte.'],
  physique: ['Ton bandeau, c\'est pour tenir ton dernier cheveu ?', 'Tu cours comme un frigo qui descend un escalier.', 'Même Kaiser a de meilleurs appuis.', 'Ton genou fait plus de bruit que les supporters.'],
};

const HIS = {
  age: ['T\'étais même pas né quand j\'ai eu mon premier carton.', 'Retourne jouer à FIFA, le petit.', 'À ton âge, je tenais déjà la buvette.'],
  gloire: ['En 2011, retourné contre Sainte-Gluse. Lucarne.', 'J\'ai fait un essai à Guingamp. Enfin, j\'ai vu le stade.', 'J\'ai 3 Coupes du District dans mon garage.'],
  physique: ['T\'as des jambes de flamant rose.', 'Tes crampons, tu les as eus au Lidl ?', 'Même tes protège-tibias ont peur.'],
};

// Ce que fait Jean-Mi avant de parler : l'indice
const TELLS = {
  age: 'Jean-Mi compte sur ses doigts...',
  gloire: 'Jean-Mi sort une vieille photo de son portefeuille...',
  physique: 'Jean-Mi te regarde de haut en bas...',
};

export default class DuelScene extends Phaser.Scene {
  constructor() {
    super('Duel');
  }

  init(data) {
    this.career = state.career;
    this.auraWin = !!data?.auraWin;
  }

  create() {
    setupCamera(this);
    const f = this.career.flags;
    const hard = f.jeanmiHostile || f.capitaine;
    const easy = f.jeanmiAllie || f.jeanmiRespect;
    this.ego = { me: this.auraWin ? 120 : 100, him: hard ? 120 : easy ? 80 : 100 };
    this.egoMax = { ...this.ego };
    this.round = 0;
    this.busy = true;

    this.drawBar();
    this.jeanmi = this.add.image(262, 206, 'jeanmi').setScale(7).setDepth(3);
    this.me = this.add.image(96, 356, `p_${this.career.charId}`).setScale(7).setDepth(3).setFlipX(true);
    this.egoGfx = this.add.graphics().setDepth(10);
    txt(this, 24, 66, 'JEAN-MI', 13, CSS.yellow, { ox: 0, bold: true }).setDepth(10);
    txt(this, 336, 440, 'TOI', 13, CSS.cream, { ox: 1, bold: true }).setDepth(10);
    this.drawEgo();

    this.tellText = txt(this, 180, 470, '', 12, CSS.cream, { wrap: 320, stroke: CSS.outline }).setDepth(20);
    this.hisLine = txt(this, 180, 126, '', 12, CSS.outline, { wrap: 300 }).setDepth(21);
    this.myLine = txt(this, 180, 270, '', 12, CSS.outline, { wrap: 300 }).setDepth(21);
    this.bubbles = this.add.graphics().setDepth(20);
    this.buttons = [];

    muteButton(this, 336, 20);
    music.play('match');
    const intro = this.auraWin ? 'Tu as gagné le duel d\'aura : ton ego est gonflé à bloc.' : 'Jean-Mi a gagné le duel d\'aura. Il est chaud.';
    this.banner('DUEL À LA BUVETTE', intro);
    this.time.delayedCall(2400, () => this.nextRound());
  }

  drawBar() {
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x151a2c, 1);
    g.fillRect(0, 0, 360, 640);
    // Guirlande lumineuse
    for (let i = 0; i < 12; i++) {
      g.fillStyle([C.yellow, C.red, C.blue, C.cream][i % 4], 0.9);
      g.fillCircle(15 + i * 30, 40 + Math.sin(i) * 6, 4);
    }
    // Comptoir de la buvette
    g.fillStyle(C.prefab, 1);
    g.fillRect(0, 250, 360, 16);
    g.fillStyle(0x6b4a2f, 1);
    g.fillRect(0, 266, 360, 40);
    g.fillStyle(C.beer, 1);
    g.fillRect(40, 228, 14, 22);
    g.fillRect(300, 228, 14, 22);
    g.fillStyle(C.cream, 1);
    g.fillRect(40, 224, 14, 5);
    g.fillRect(300, 224, 14, 5);
    // Les coéquipiers qui regardent
    ['mate1', 'mate2', 'mate3', 'president'].forEach((k, i) => this.add.image(40 + i * 90, 580, k).setScale(3).setAlpha(0.5).setDepth(1));
  }

  drawEgo() {
    const g = this.egoGfx;
    g.clear();
    const bar = (x, y, v, max, color) => {
      g.fillStyle(C.outline, 1);
      g.fillRect(x, y, 150, 10);
      g.fillStyle(color, 1);
      g.fillRect(x, y, 150 * Math.max(0, v / max), 10);
      g.lineStyle(2, C.cream, 1);
      g.strokeRect(x, y, 150, 10);
    };
    bar(24, 78, this.ego.him, this.egoMax.him, C.yellow);
    bar(186, 452, this.ego.me, this.egoMax.me, C.blue);
  }

  banner(title, sub) {
    const bg = this.add.rectangle(180, 300, 360, 76, C.outline, 0.85).setDepth(50);
    const t1 = txt(this, 180, 286, title, 20, CSS.yellow, { bold: true }).setDepth(51);
    const t2 = txt(this, 180, 314, sub, 11, CSS.cream, { wrap: 330 }).setDepth(51);
    this.tweens.add({ targets: [bg, t1, t2], alpha: 0, delay: 1900, duration: 400, onComplete: () => [bg, t1, t2].forEach((o) => o.destroy()) });
  }

  nextRound() {
    if (this.ego.him <= 0) return this.win();
    if (this.ego.me <= 0) return this.lose();
    this.round++;
    this.hisType = Phaser.Utils.Array.GetRandom(Object.keys(TYPES));
    this.hisLine.setText('');
    this.myLine.setText('');
    this.bubbles.clear();
    this.tellText.setText(TELLS[this.hisType]);
    this.tweens.add({ targets: this.jeanmi, scaleY: 7.4, yoyo: true, duration: 200 });
    this.showChoices();
    this.busy = false;
  }

  showChoices() {
    this.clearChoices();
    Object.entries(TYPES).forEach(([type, t], i) => {
      const line = Phaser.Utils.Array.GetRandom(MINE[type]);
      const b = button(this, 180, 506 + i * 42, 320, 36, `${t.label} : « ${line} »`, () => this.play(type, line), { size: 10 });
      b.t.setWordWrapWidth(300).setAlign('center');
      b.bg.setDepth(30);
      b.t.setDepth(31);
      this.buttons.push(b);
    });
  }

  clearChoices() {
    this.buttons.forEach((b) => {
      b.bg.destroy();
      b.t.destroy();
    });
    this.buttons = [];
  }

  bubble(x, y, w, h) {
    this.bubbles.fillStyle(C.cream, 1);
    this.bubbles.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    this.bubbles.lineStyle(2, C.outline, 1);
    this.bubbles.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
  }

  play(myType, myText) {
    if (this.busy) return;
    this.busy = true;
    this.clearChoices();
    this.tellText.setText('');
    const hisText = Phaser.Utils.Array.GetRandom(HIS[this.hisType]);

    // Jean-Mi parle, puis toi
    this.bubble(180, 126, 320, 44);
    this.hisLine.setText(`« ${hisText} »`);
    sfx.select(this);
    this.time.delayedCall(1100, () => {
      this.bubble(180, 270, 320, 48);
      this.myLine.setText(`« ${myText} »`);
      sfx.select(this);
      this.time.delayedCall(900, () => this.resolve(myType));
    });
  }

  resolve(myType) {
    const st = this.career.stats;
    let result = 'draw';
    if (TYPES[myType].beats === this.hisType) result = 'win';
    else if (TYPES[this.hisType].beats === myType) result = 'lose';

    if (result === 'win') {
      // Les anecdotes inventées font plus mal avec de la mauvaise foi
      const dmg = 30 + (myType === 'gloire' ? st.mauvaiseFoi * 3 : 0) + (myType === 'physique' ? st.bide : 0);
      this.ego.him -= dmg;
      this.hit(this.jeanmi);
      sfx.cheer(this);
      floatText(this, 262, 160, 'OHHHHH', CSS.yellow, 16);
      this.tellText.setText('Touché ! Le vestiaire hurle.');
    } else if (result === 'lose') {
      this.ego.me -= 25;
      this.hit(this.me);
      sfx.laugh(this);
      this.tellText.setText('Aïe. Même le président rigole.');
    } else {
      this.ego.me -= 8;
      this.ego.him -= 8;
      sfx.ooh(this);
      this.tellText.setText('Égalité. Personne ne rit. Malaise.');
    }
    this.drawEgo();
    this.time.delayedCall(1500, () => this.nextRound());
  }

  hit(sprite) {
    this.tweens.add({ targets: sprite, x: sprite.x + 8, duration: 50, yoyo: true, repeat: 3 });
    this.cameras.main.shake(120, 0.008);
  }

  win() {
    const f = this.career.flags;
    f.bossJeanmi = 'gagné';
    this.tellText.setText('');
    this.hisLine.setText('');
    this.myLine.setText('');
    this.bubbles.clear();
    this.tweens.add({ targets: this.jeanmi, angle: -10, duration: 300 });
    pecab(this);
    sfx.cheer(this, true);
    gainLegende(150);
    let line = 'Jean-Mi retire son bandeau et te le tend : « Prends soin de lui. »';
    if (f.capitaine) line += ' Il te donne aussi les clés de la caisse de bière.';
    else if (f.jeanmiAllie) line += ' Puis il te paie un demi. Vous chantez du Johnny.';
    this.time.delayedCall(1300, () => {
      txt(this, 180, 300, line, 13, CSS.cream, { wrap: 320, stroke: CSS.outline, strokeThickness: 4 }).setDepth(40);
      const b = button(this, 180, 560, 260, 50, 'FIN DU CHAPITRE 1', () => {
        advanceWeek();
        save();
        this.scene.start('ChapterEnd');
      }, { fill: C.yellow });
      b.bg.setDepth(45);
      b.t.setDepth(46);
    });
    save();
  }

  lose() {
    this.tellText.setText('');
    this.bubbles.clear();
    this.hisLine.setText('');
    this.myLine.setText('');
    sfx.laugh(this);
    txt(this, 180, 300, 'Jean-Mi garde son bandeau. « Reviens quand t\'auras du poil au menton. »', 13, CSS.cream, { wrap: 320, stroke: CSS.outline, strokeThickness: 4 }).setDepth(40);
    const b = button(this, 180, 560, 260, 50, 'RETENTER LE DUEL', () => this.scene.restart({ auraWin: this.auraWin }), { fill: C.yellow });
    b.bg.setDepth(45);
    b.t.setDepth(46);
  }
}
