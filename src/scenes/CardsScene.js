import Phaser from 'phaser';
import { state, gainLegende, gainNiveau, save } from '../state.js';
import { DECKS, SURNOMS } from '../data/cards.js';
import { advanceWeek, WEEKS, currentWeek } from '../data/schedule.js';
import { displayName, CAPTIONS } from '../data/people.js';
import { txt, title, button } from '../ui/text.js';
import { Mug } from '../ui/mug.js';
import { sfx } from '../ui/sfx.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { loadPortraits, portraitKey } from '../assets.js';
import { C, CSS } from '../palette.js';
import { setupCamera, ptr } from '../view.js';

// Les cartes de décision (DA 1c) : en-tête de journal, 5 jauges verticales,
// la réplique en italique, la carte avec le portrait qui déborde, et
// l'objectif officiel en bas. On glisse la carte ou on touche un choix.
const RELS = [
  ['coach', 'Coach'],
  ['vestiaire', 'Vestiaire'],
  ['president', 'Président'],
  ['famille', 'Famille'],
  ['district', 'District'],
];
const CARD = { x: 180, y: 392, w: 232, h: 250 };

export default class CardsScene extends Phaser.Scene {
  constructor() {
    super('Cards');
  }

  init(data) {
    this.career = state.career;
    this.deck = DECKS[data?.deck] ?? DECKS.bizutage;
  }

  preload() {
    loadPortraits(this, [...new Set(this.deck.cards.map((c) => c.face))]);
  }

  create() {
    setupCamera(this);
    const f = this.career.flags;
    this.cards = this.deck.cards.filter((c) => (!c.if || f[c.if]) && (!c.ifNot || !f[c.ifNot]));
    this.index = 0;
    this.busy = false;
    this.buttons = [];
    this.cameras.main.setBackgroundColor(C.paper);

    // En-tête de journal
    title(this, 16, 24, "L'Écho de Grandcour", 16, CSS.ink, { ox: 0 });
    const week = WEEKS[currentWeek()];
    txt(this, 344, 26, `${week.titre.split('·')[0].trim()} · ${this.deck.titre.toLowerCase()}`, 12, CSS.ink, { ox: 1, italic: true });
    this.add.rectangle(16, 40, 328, 2, C.ink).setOrigin(0);

    this.relGfx = this.add.graphics();
    RELS.forEach(([, label], i) => title(this, 44 + i * 62, 116, label, 10, CSS.ink));
    this.mug = new Mug(this, 338, 82, 1);
    this.mug.setValue(this.career.legende, false);
    muteButton(this, 338, 130);

    this.quote = txt(this, 180, 164, '', 16, CSS.ink, { italic: true, wrap: 320 });
    this.caption = txt(this, 180, 530, '', 13, CSS.ink, { italic: true });
    this.sayBox = this.add.container(180, 392).setDepth(40);

    // Objectif officiel, en bas
    this.add.rectangle(16, 606, 328, 2, C.ink).setOrigin(0);
    title(this, 16, 624, 'Objectif', 14, CSS.ink, { ox: 0 });
    title(this, 344, 624, 'Sois un joueur exemplaire', 14, CSS.red, { ox: 1 });

    this.input.on('pointermove', (p) => this.drag(p));
    this.input.on('pointerup', () => this.release());

    music.play('menu');
    this.drawRels([]);
    this.showCard();
  }

  // Jauges verticales 26 × 44 : fond papier foncé, remplissage rouge
  drawRels(affected) {
    const g = this.relGfx;
    g.clear();
    RELS.forEach(([key], i) => {
      const x = 44 + i * 62 - 13;
      const y = 58;
      const v = (this.career.relations[key] ?? 0) + 3; // 0..6
      g.fillStyle(C.paperDark, 1);
      g.fillRect(x, y, 26, 44);
      g.fillStyle(C.red, 1);
      const h = Math.round((v / 6) * 44);
      g.fillRect(x, y + 44 - h, 26, h);
      if (affected.includes(key)) {
        g.fillStyle(C.ink, 1);
        g.fillCircle(x + 13, y - 8, 4);
      }
    });
  }

  makeCard(c) {
    const cont = this.add.container(CARD.x, CARD.y).setDepth(20);
    const g = this.add.graphics();
    g.fillStyle(C.ink, 0.3);
    g.fillRect(-CARD.w / 2 + 4, -CARD.h / 2 + 5, CARD.w, CARD.h);
    g.fillStyle(C.white, 1);
    g.fillRect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h);
    g.fillStyle(C.salmon, 1);
    g.fillRect(-CARD.w / 2 + 12, -CARD.h / 2 + 12, CARD.w - 24, CARD.h - 70);
    cont.add(g);
    this.face = this.add.image(0, CARD.h / 2 - 46, portraitKey(c.face, c.expr ?? 'neutre')).setOrigin(0.5, 1).setDisplaySize(212, 272);
    cont.add(this.face);
    const band = this.add.rectangle(0, CARD.h / 2 - 23, CARD.w - 24, 46, C.ink);
    cont.add(band);
    cont.add(title(this, 0, CARD.h / 2 - 23, displayName(c.face) === c.who ? c.who : c.who, 22, CSS.paper));
    // Étiquette de choix, visible quand on penche la carte
    this.hintBg = this.add.rectangle(0, -CARD.h / 2 - 20, 10, 30, C.ink).setAlpha(0);
    this.hint = txt(this, 0, -CARD.h / 2 - 20, '', 14, CSS.paper, { italic: true, wrap: 200 }).setAlpha(0);
    cont.add([this.hintBg, this.hint]);
    cont.setAngle(-2);
    return cont;
  }

  showCard() {
    if (this.index >= this.cards.length) return this.end();
    const c = this.cards[this.index];
    this.card = c;
    this.sayBox.removeAll(true);
    this.quote.setText(`« ${c.text} »`);
    this.caption.setText(CAPTIONS[c.face] ?? '');

    this.cardObj = this.makeCard(c);
    this.cardObj.y += 60;
    this.cardObj.setAlpha(0);
    this.tweens.add({ targets: this.cardObj, y: CARD.y, alpha: 1, duration: 260, ease: 'Back.easeOut' });

    this.clearButtons();
    if (c.options) {
      c.options.forEach((o, i) => this.addButton(96 + (i % 2) * 168, 556 + Math.floor(i / 2) * 44, 160, 38, o.label, () => this.choose(o)));
    } else {
      for (const [side, x] of [['left', 96], ['right', 264]]) {
        const o = c[side];
        const locked = this.isLocked(o);
        const label = `${side === 'left' ? '← ' : ''}${o.label}${side === 'right' ? ' →' : ''}${locked ? `\n(${this.needText(o)})` : ''}`;
        this.addButton(x, 572, 160, 52, label, () => this.choose(o), locked);
      }
    }
  }

  addButton(x, y, w, h, label, cb, disabled = false) {
    const b = button(this, x, y, w, h, label, () => !this.busy && cb(), { size: 13, disabled, plain: true });
    b.setDepth(25);
    this.buttons.push(b);
  }

  clearButtons() {
    this.buttons.forEach((b) => b.destroy());
    this.buttons = [];
  }

  isLocked(o) {
    return !!o.need && Object.entries(o.need).some(([k, v]) => (this.career.stats[k] ?? 0) < v);
  }

  needText(o) {
    const names = { mauvaiseFoi: 'Mauvaise foi', foie: 'Foie', bide: 'Bide', tacle: 'Tacle', excuses: 'Excuses' };
    return Object.entries(o.need).map(([k, v]) => `${names[k] ?? k} ${v} requise`).join(', ');
  }

  // Glisser la carte : rotation dx/16, étiquette qui apparaît vers dx/70
  drag(raw) {
    if (this.busy || !this.card || this.card.options || !raw.isDown || !this.cardObj) return;
    const p = ptr(raw);
    if (p.downY < CARD.y - CARD.h / 2 - 60 || p.downY > CARD.y + CARD.h / 2) return;
    const dx = Phaser.Math.Clamp(p.x - p.downX, -150, 150);
    this.cardObj.x = CARD.x + dx;
    this.cardObj.angle = -2 + dx / 16;
    const side = dx < 0 ? 'left' : 'right';
    const o = Math.abs(dx) > 10 ? this.card[side] : null;
    const a = Math.min(1, Math.abs(dx) / 70);
    this.hint.setText(o ? o.label : '').setAlpha(a);
    this.hintBg.setSize(this.hint.width + 20, this.hint.height + 10).setOrigin(0.5).setAlpha(o ? a : 0).setFillStyle(o && this.isLocked(o) ? C.grey : C.ink);
    this.drawRels(o ? Object.keys(o.rel ?? {}) : []);
  }

  release() {
    if (this.busy || !this.card || this.card.options || !this.cardObj) return;
    const dx = this.cardObj.x - CARD.x;
    const o = dx < -80 ? this.card.left : dx > 80 ? this.card.right : null;
    if (o && !this.isLocked(o)) return this.choose(o, dx < 0 ? -1 : 1);
    this.tweens.add({ targets: this.cardObj, x: CARD.x, angle: -2, duration: 150 });
    this.hint.setAlpha(0);
    this.hintBg.setAlpha(0);
    this.drawRels([]);
  }

  // Expression du personnage selon l'effet du choix
  reaction(o) {
    if (o.expr) return o.expr;
    if ((o.legende ?? 0) >= 20) return 'rire';
    if (Object.values(o.rel ?? {}).some((v) => v < 0)) return 'gueule';
    if ((o.legende ?? 0) < 0) return 'choque';
    return 'fier';
  }

  choose(o, dir = 0) {
    if (this.busy) return;
    this.busy = true;
    this.clearButtons();
    sfx.select(this);
    const card = this.cardObj;
    const key = portraitKey(this.card.face, this.reaction(o));
    if (this.textures.exists(key)) this.face.setTexture(key).setDisplaySize(212, 272);
    this.tweens.add({ targets: card, scale: 1.05, duration: 120, yoyo: true });
    const out = dir || (o === this.card.left ? -1 : o === this.card.right ? 1 : 1);
    this.time.delayedCall(550, () =>
      this.tweens.add({ targets: card, x: CARD.x + out * 420, angle: out * 25, duration: 300, ease: 'Quad.easeIn', onComplete: () => card.destroy() }),
    );

    const say = this.apply(o);
    this.drawRels([]);
    this.time.delayedCall(700, () => {
      this.quote.setText('');
      this.caption.setText('');
      if (say) this.showSay(say);
    });
    this.time.delayedCall(say ? 2600 : 900, () => {
      this.index++;
      this.busy = false;
      this.showCard();
    });
  }

  // La conséquence, en encadré de journal
  showSay(text) {
    const t = txt(this, 0, 0, text, 17, CSS.ink, { italic: true, wrap: 270 });
    const g = this.add.graphics();
    g.fillStyle(C.ink, 1);
    g.fillRect(-150 + 3, -t.height / 2 - 18 + 4, 300, t.height + 36);
    g.fillStyle(C.white, 1);
    g.fillRect(-150, -t.height / 2 - 18, 300, t.height + 36);
    this.sayBox.add([g, t]).setAngle(-1.5).setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: this.sayBox, scale: 1, alpha: 1, duration: 200, ease: 'Back.easeOut' });
  }

  // Applique les effets d'un choix, renvoie le texte de conséquence
  apply(o) {
    const c = this.career;
    if (o.legende) {
      gainLegende(o.legende);
      this.mug.setValue(c.legende);
      if (o.legende > 0) sfx.gain(this);
      else sfx.loss(this);
    }
    if (o.niveau) gainNiveau(o.niveau);
    for (const [k, v] of Object.entries(o.stats ?? {})) c.stats[k] = Phaser.Math.Clamp((c.stats[k] ?? 1) + v, 1, 5);
    for (const [k, v] of Object.entries(o.rel ?? {})) c.relations[k] = Phaser.Math.Clamp((c.relations[k] ?? 0) + v, -3, 3);
    Object.assign(c.flags, o.flags ?? {});
    let say = o.say;
    if (o.surnom) {
      c.flags.surnom = Phaser.Utils.Array.GetRandom(SURNOMS);
      say = say.replace('{surnom}', c.flags.surnom);
    }
    save();
    return say;
  }

  end() {
    advanceWeek();
    save();
    this.sayBox.removeAll(true);
    title(this, 180, 380, 'Fin de la discussion', 26, CSS.ink);
    this.time.delayedCall(900, () => this.scene.start('Programme'));
  }
}
