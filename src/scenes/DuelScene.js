import Phaser from 'phaser';
import { state, gainLegende, save } from '../state.js';
import { advanceWeek } from '../data/schedule.js';
import { getCharacter } from '../data/characters.js';
import { txt, title, button, floatText } from '../ui/text.js';
import { pecab } from '../ui/pecab.js';
import { sfx } from '../ui/sfx.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { loadPortraits, portraitKey } from '../assets.js';
import { C, CSS } from '../palette.js';
import { setupCamera } from '../view.js';

// Boss du chapitre 1, phase 2 : le duel de chambrage à la buvette (DA 1c).
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
  age: ["Ton dernier but, c'était en francs.", 'Ta licence, elle est sur papyrus ?', "Tu t'échauffes depuis 1998 ?", "T'as connu le foot en noir et blanc ?"],
  gloire: ['En U15, on m\'appelait « le Messi du canton ».', "J'ai serré la main d'un joueur de Ligue 2.", "J'ai marqué contre Grandcour. En futsal, mais quand même.", "L'an dernier, retourné au tournoi de sixte."],
  physique: ["Ton bandeau, c'est pour tenir ton dernier cheveu ?", 'Tu cours comme un frigo qui descend un escalier.', 'Même Kaiser a de meilleurs appuis.', 'Ton genou fait plus de bruit que les supporters.'],
};

const HIS = {
  age: ["T'étais même pas né quand j'ai eu mon premier carton.", 'Retourne jouer à FIFA, le petit.', "À ton âge, je tenais déjà la buvette."],
  gloire: ['En 2011, retourné contre Sainte-Gluse. Lucarne.', "J'ai fait un essai à Guingamp. Enfin, j'ai vu le stade.", "J'ai 3 Coupes du District dans mon garage."],
  physique: ["T'as des jambes de flamant rose.", 'Tes crampons, tu les as eus au Lidl ?', 'Même tes protège-tibias ont peur.'],
};

// Ce que fait Jean-Mi avant de parler : l'indice
const TELLS = {
  age: 'Jean-Mi compte sur ses doigts…',
  gloire: 'Jean-Mi sort une vieille photo de son portefeuille…',
  physique: 'Jean-Mi te regarde de haut en bas…',
};

export default class DuelScene extends Phaser.Scene {
  constructor() {
    super('Duel');
  }

  init(data) {
    this.career = state.career;
    this.auraWin = !!data?.auraWin;
  }

  preload() {
    loadPortraits(this, ['jeanmi', this.career.charId]);
  }

  create() {
    setupCamera(this);
    const f = this.career.flags;
    const hard = f.jeanmiHostile || f.capitaine;
    const easy = f.jeanmiAllie || f.jeanmiRespect;
    this.ego = { me: this.auraWin ? 120 : 100, him: hard ? 120 : easy ? 80 : 100 };
    this.egoMax = { ...this.ego };
    this.busy = true;
    this.buttons = [];
    this.cameras.main.setBackgroundColor(C.night);

    this.drawBar();
    // Jean-Mi en haut à droite, le joueur en miroir en bas à gauche
    this.jeanmi = this.add.image(372, 318, portraitKey('jeanmi', 'fier')).setOrigin(1, 1).setDisplaySize(210, 269).setAngle(2).setDepth(3);
    this.me = this.add.image(-12, 496, portraitKey(this.career.charId, 'neutre')).setOrigin(0, 1).setDisplaySize(210, 269).setFlipX(true).setAngle(-2).setDepth(3);
    this.egoGfx = this.add.graphics().setDepth(10);
    this.cartouche(16, 62, 'Jean-Mi');
    this.cartouche(166, 420, getCharacter(this.career.charId).nom);
    this.drawEgo();

    this.tellText = txt(this, 180, 516, '', 14, CSS.paper, { italic: true, wrap: 330 }).setDepth(20);
    this.bubbles = this.add.container(0, 0).setDepth(21);

    muteButton(this, 340, 22, true);
    music.play('match');
    const intro = this.auraWin ? "Tu as gagné le duel d'aura : ton ego est gonflé à bloc." : "Jean-Mi a gagné le duel d'aura. Il est chaud.";
    this.banner('Duel à la buvette', intro);
    this.time.delayedCall(2400, () => this.nextRound());
  }

  drawBar() {
    const g = this.add.graphics().setDepth(0);
    // Mur et comptoir de la buvette
    g.fillStyle(0x2a2622, 1);
    g.fillRect(0, 90, 360, 250);
    g.fillStyle(C.yellow, 0.55);
    g.fillRect(24, 170, 70, 46);
    g.fillRect(24, 222, 70, 46);
    g.fillStyle(C.mud, 1);
    g.fillRect(0, 318, 360, 16);
    g.fillStyle(0x5c4a33, 1);
    g.fillRect(0, 334, 360, 30);
    // Guirlande lumineuse : jaune, rouge, papier, bleu
    const cols = [C.yellow, C.red, C.paper, C.blue];
    for (let i = 0; i < 12; i++) {
      const x = 12 + i * 31;
      const y = 26 + Math.sin(i * 0.9) * 8 + (i % 2) * 4;
      g.lineStyle(1, C.paper, 0.4);
      if (i) g.lineBetween(x - 31, 26 + Math.sin((i - 1) * 0.9) * 8 + ((i - 1) % 2) * 4, x, y);
      g.fillStyle(cols[i % 4], 0.22);
      g.fillCircle(x, y, 10);
      g.fillStyle(cols[i % 4], 1);
      g.fillCircle(x, y, 4.5);
    }
  }

  // Cartouche d'ego en papier : nom + barre
  cartouche(x, y, name) {
    const g = this.add.graphics().setDepth(9);
    g.fillStyle(C.ink, 0.5);
    g.fillRect(x + 3, y + 4, 180, 50);
    g.fillStyle(C.paper, 1);
    g.fillRect(x, y, 180, 50);
    title(this, x + 10, y + 16, name, 18, CSS.ink, { ox: 0 }).setDepth(10);
    title(this, x + 170, y + 16, 'Ego', 10, CSS.ink, { ox: 1 }).setDepth(10);
  }

  drawEgo() {
    const g = this.egoGfx;
    g.clear();
    const bar = (x, y, v, max, color) => {
      g.fillStyle(C.paperDark, 1);
      g.fillRect(x, y, 160, 10);
      g.fillStyle(color, 1);
      g.fillRect(x, y, 160 * Math.max(0, v / max), 10);
    };
    bar(26, 94, this.shownHim ?? this.ego.him, this.egoMax.him, C.red);
    bar(176, 452, this.shownMe ?? this.ego.me, this.egoMax.me, C.blue);
  }

  // Les barres descendent en 500 ms
  animateEgo() {
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 500,
      onUpdate: (tw) => {
        const k = tw.getValue();
        this.shownHim = this.fromHim + (this.ego.him - this.fromHim) * k;
        this.shownMe = this.fromMe + (this.ego.me - this.fromMe) * k;
        this.drawEgo();
      },
    });
  }

  banner(head, sub) {
    const bg = this.add.rectangle(180, 380, 360, 80, C.ink, 0.92).setDepth(50);
    const t1 = title(this, 180, 364, head, 26, CSS.yellow).setDepth(51);
    const t2 = txt(this, 180, 394, sub, 13, CSS.paper, { italic: true, wrap: 330 }).setDepth(51);
    this.tweens.add({ targets: [bg, t1, t2], alpha: 0, delay: 1900, duration: 400, onComplete: () => [bg, t1, t2].forEach((o) => o.destroy()) });
  }

  setFace(sprite, id, expr) {
    const key = portraitKey(id, expr);
    if (this.textures.exists(key)) sprite.setTexture(key).setDisplaySize(210, 269);
  }

  nextRound() {
    if (this.ego.him <= 0) return this.win();
    if (this.ego.me <= 0) return this.lose();
    this.hisType = Phaser.Utils.Array.GetRandom(Object.keys(TYPES));
    this.bubbles.removeAll(true);
    this.setFace(this.jeanmi, 'jeanmi', 'fier');
    this.setFace(this.me, this.career.charId, 'neutre');
    this.tellText.setText(TELLS[this.hisType]);
    this.tweens.add({ targets: this.jeanmi, angle: 4, yoyo: true, duration: 220 });
    this.showChoices();
    this.busy = false;
  }

  showChoices() {
    this.clearChoices();
    this.buttons.push(title(this, 16, 544, 'À toi de chambrer', 13, CSS.red, { ox: 0 }).setDepth(30));
    Object.entries(TYPES).forEach(([type, t], i) => {
      const line = Phaser.Utils.Array.GetRandom(MINE[type]);
      const b = button(this, 180, 568 + i * 26, 328, 22, `« ${line} »`, () => this.play(type, line), { size: 12, plain: true });
      b.setDepth(30);
      this.buttons.push(b);
    });
  }

  clearChoices() {
    this.buttons.forEach((b) => b.destroy());
    this.buttons = [];
  }

  // Bulle blanche à ombre pleine, pointe vers celui qui parle
  bubble(x, y, text, tipRight) {
    const t = txt(this, 0, 0, text, 14, CSS.ink, { italic: true, wrap: 180 });
    const w = 200;
    const h = t.height + 22;
    const g = this.add.graphics();
    g.fillStyle(C.ink, 0.35);
    g.fillRect(x + 3, y + 4, w, h);
    g.fillStyle(C.white, 1);
    g.fillRect(x, y, w, h);
    const tx = tipRight ? x + w - 1 : x + 1;
    g.fillTriangle(tx, y + h * 0.35, tx, y + h * 0.7, tx + (tipRight ? 18 : -18), y + h * 0.75);
    t.setPosition(x + w / 2, y + h / 2);
    const c = this.add.container(0, 0, [g, t]).setAngle(tipRight ? -1.5 : 1.5).setAlpha(0);
    this.bubbles.add(c);
    this.tweens.add({ targets: c, alpha: 1, duration: 150 });
  }

  play(myType, myText) {
    if (this.busy) return;
    this.busy = true;
    this.clearChoices();
    this.tellText.setText('');
    const hisText = Phaser.Utils.Array.GetRandom(HIS[this.hisType]);
    this.bubble(16, 150, `« ${hisText} »`, true);
    sfx.select(this);
    this.time.delayedCall(1100, () => {
      this.bubble(150, 346, `« ${myText} »`, false);
      sfx.select(this);
      this.time.delayedCall(900, () => this.resolve(myType));
    });
  }

  resolve(myType) {
    const st = this.career.stats;
    let result = 'draw';
    if (TYPES[myType].beats === this.hisType) result = 'win';
    else if (TYPES[this.hisType].beats === myType) result = 'lose';
    this.fromHim = this.shownHim ?? this.ego.him;
    this.fromMe = this.shownMe ?? this.ego.me;

    if (result === 'win') {
      // Les anecdotes inventées font plus mal avec de la mauvaise foi
      const dmg = 30 + (myType === 'gloire' ? st.mauvaiseFoi * 3 : 0) + (myType === 'physique' ? st.bide : 0);
      this.ego.him -= dmg;
      this.setFace(this.jeanmi, 'jeanmi', 'choque');
      this.setFace(this.me, this.career.charId, 'rire');
      this.hit(this.jeanmi);
      sfx.cheer(this);
      floatText(this, 250, 140, 'OHHHHH', CSS.yellow, 22);
      this.tellText.setText('Touché ! Le vestiaire hurle.');
    } else if (result === 'lose') {
      this.ego.me -= 25;
      this.setFace(this.jeanmi, 'jeanmi', 'rire');
      this.setFace(this.me, this.career.charId, 'choque');
      this.hit(this.me);
      sfx.laugh(this);
      this.tellText.setText('Aïe. Même le président rigole.');
    } else {
      this.ego.me -= 8;
      this.ego.him -= 8;
      this.setFace(this.jeanmi, 'jeanmi', 'neutre');
      sfx.ooh(this);
      this.tellText.setText('Égalité. Personne ne rit. Malaise.');
    }
    this.animateEgo();
    this.time.delayedCall(1700, () => this.nextRound());
  }

  hit(sprite) {
    this.tweens.add({ targets: sprite, x: sprite.x + 8, duration: 47, yoyo: true, repeat: 3 });
    this.cameras.main.shake(380, 0.006);
  }

  win() {
    const f = this.career.flags;
    f.bossJeanmi = 'gagné';
    this.tellText.setText('');
    this.bubbles.removeAll(true);
    this.setFace(this.jeanmi, 'jeanmi', 'choque');
    this.setFace(this.me, this.career.charId, 'rire');
    pecab(this);
    sfx.cheer(this, true);
    gainLegende(150);
    let line = 'Jean-Mi retire son bandeau et te le tend : « Prends soin de lui. »';
    if (f.capitaine) line += ' Il te donne aussi les clés de la caisse de bière.';
    else if (f.jeanmiAllie) line += ' Puis il te paie un demi. Vous chantez du Johnny.';
    this.time.delayedCall(1400, () => {
      this.setFace(this.jeanmi, 'jeanmi', 'fier');
      this.bubble(16, 150, line, true);
      button(this, 180, 590, 300, 48, 'Fin du chapitre 1', () => {
        advanceWeek();
        save();
        this.scene.start('ChapterEnd');
      }, { fill: C.red, size: 19 }).setDepth(45);
    });
    save();
  }

  lose() {
    this.tellText.setText('');
    this.bubbles.removeAll(true);
    this.setFace(this.jeanmi, 'jeanmi', 'rire');
    this.setFace(this.me, this.career.charId, 'choque');
    sfx.laugh(this);
    this.bubble(16, 150, "« Reviens quand t'auras du poil au menton. »", true);
    button(this, 180, 590, 300, 48, 'Retenter le duel', () => this.scene.restart({ auraWin: this.auraWin }), { fill: C.red, size: 19 }).setDepth(45);
  }
}
