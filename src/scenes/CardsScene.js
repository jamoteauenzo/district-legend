import Phaser from 'phaser';
import { state, gainLegende, gainNiveau, save } from '../state.js';
import { DECKS, SURNOMS } from '../data/cards.js';
import { advanceWeek } from '../data/schedule.js';
import { txt, button } from '../ui/text.js';
import { Mug } from '../ui/mug.js';
import { sfx } from '../ui/sfx.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { C, CSS } from '../palette.js';

// Les cartes de décision, façon Reigns. On glisse la carte à gauche ou à
// droite (ou on touche un des deux boutons). Les points au-dessus des
// jauges montrent ce qui va bouger, jamais dans quel sens.
const RELS = [
  ['coach', 'COACH'],
  ['vestiaire', 'VESTIAIRE'],
  ['president', 'PRÉSIDENT'],
  ['famille', 'FAMILLE'],
  ['district', 'DISTRICT'],
];
const CARD = { x: 180, y: 290, w: 270, h: 300 };

export default class CardsScene extends Phaser.Scene {
  constructor() {
    super('Cards');
  }

  init(data) {
    this.career = state.career;
    this.deck = DECKS[data?.deck] ?? DECKS.bizutage;
  }

  create() {
    const f = this.career.flags;
    this.cards = this.deck.cards.filter((c) => (!c.if || f[c.if]) && (!c.ifNot || !f[c.ifNot]));
    this.index = 0;
    this.busy = false;

    this.cameras.main.setBackgroundColor(C.night);
    // Le banc du vestiaire en fond
    const g = this.add.graphics();
    g.fillStyle(0x2a3350, 1);
    g.fillRect(0, 470, 360, 170);
    g.fillStyle(0x6b4a2f, 1);
    g.fillRect(0, 470, 360, 10);

    txt(this, 180, 18, this.deck.titre.toUpperCase(), 14, CSS.yellow, { bold: true });
    this.relGfx = this.add.graphics().setDepth(5);
    RELS.forEach(([, label], i) => txt(this, 36 + i * 66, 76, label, 8, CSS.chalk).setDepth(5));
    this.mug = new Mug(this, 334, 18).setDepth(10);
    this.mug.setValue(this.career.legende, false);
    muteButton(this, 298, 18);

    this.sayText = txt(this, 180, 470, '', 13, CSS.cream, { wrap: 320, stroke: CSS.outline }).setDepth(30);
    this.counter = txt(this, 180, 628, '', 10, CSS.grey).setDepth(5);

    this.input.on('pointermove', (p) => this.drag(p));
    this.input.on('pointerup', (p) => this.release(p));

    music.play('menu');
    this.drawRels([]);
    this.showCard();
  }

  // Jauges de relation (-3 à +3) avec des points sur celles qui vont bouger
  drawRels(affected) {
    const g = this.relGfx;
    g.clear();
    RELS.forEach(([key], i) => {
      const x = 36 + i * 66;
      const v = this.career.relations[key] ?? 0;
      g.fillStyle(C.cream, 0.15);
      g.fillRect(x - 26, 88, 52, 8);
      g.fillStyle(v >= 0 ? C.yellow : C.red, 1);
      const w = (Math.abs(v) / 3) * 26;
      g.fillRect(v >= 0 ? x : x - w, 88, w, 8);
      g.fillStyle(C.cream, 1);
      g.fillRect(x - 1, 86, 2, 12);
      if (affected.includes(key)) g.fillCircle(x, 58, 4);
    });
  }

  showCard() {
    if (this.index >= this.cards.length) return this.end();
    const c = this.cards[this.index];
    this.card = c;
    this.counter.setText(`${this.index + 1} / ${this.cards.length}`);
    this.sayText.setText('');

    const cont = this.add.container(CARD.x, CARD.y + 40).setDepth(20).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(C.cream, 1);
    g.fillRoundedRect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 10);
    g.lineStyle(3, C.outline, 1);
    g.strokeRoundedRect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 10);
    g.fillStyle(C.grass, 1);
    g.fillRect(-CARD.w / 2 + 10, -CARD.h / 2 + 10, CARD.w - 20, 130);
    cont.add(g);
    cont.add(this.add.image(0, -CARD.h / 2 + 76, c.face).setScale(7));
    cont.add(txt(this, 0, -CARD.h / 2 + 158, c.who.toUpperCase(), 13, CSS.red, { bold: true }));
    cont.add(txt(this, 0, 50, c.text, 14, CSS.outline, { wrap: CARD.w - 30 }));
    // Libellé du choix qui apparaît quand on penche la carte
    this.hint = txt(this, 0, -CARD.h / 2 + 30, '', 14, CSS.cream, { bold: true, stroke: CSS.outline, strokeThickness: 4, wrap: CARD.w - 40 });
    cont.add(this.hint);
    this.cardObj = cont;
    this.tweens.add({ targets: cont, y: CARD.y, alpha: 1, duration: 250, ease: 'Back.easeOut' });

    this.clearButtons();
    if (c.options) {
      c.options.forEach((o, i) => this.addButton(180, 468 + i * 40, 300, 34, o.label, () => this.choose(o)));
    } else {
      for (const [side, x] of [['left', 92], ['right', 268]]) {
        const o = c[side];
        const locked = this.isLocked(o);
        const label = locked ? `${o.label} (${this.needText(o)})` : o.label;
        this.addButton(x, 560, 166, 58, `${side === 'left' ? '← ' : ''}${label}${side === 'right' ? ' →' : ''}`, () => this.choose(o), locked);
      }
    }
  }

  addButton(x, y, w, h, label, cb, disabled = false) {
    const b = button(this, x, y, w, h, label, () => !this.busy && cb(), { size: 11, disabled });
    b.t.setWordWrapWidth(w - 12).setAlign('center');
    b.bg.setDepth(25);
    b.t.setDepth(26);
    this.buttons.push(b);
  }

  clearButtons() {
    (this.buttons ?? []).forEach((b) => {
      b.bg.destroy();
      b.t.destroy();
    });
    this.buttons = [];
  }

  isLocked(o) {
    return !!o.need && Object.entries(o.need).some(([k, v]) => (this.career.stats[k] ?? 0) < v);
  }

  needText(o) {
    const names = { mauvaiseFoi: 'Mauvaise foi', foie: 'Foie', bide: 'Bide', tacle: 'Tacle', excuses: 'Excuses' };
    return Object.entries(o.need).map(([k, v]) => `${names[k] ?? k} ${v} requise`).join(', ');
  }

  // Glisser la carte
  drag(p) {
    if (this.busy || !this.card || this.card.options || !p.isDown || !this.cardObj) return;
    if (p.downY < CARD.y - CARD.h / 2 || p.downY > CARD.y + CARD.h / 2) return;
    const dx = Phaser.Math.Clamp(p.x - p.downX, -140, 140);
    this.cardObj.x = CARD.x + dx;
    this.cardObj.angle = dx * 0.08;
    const side = dx < -20 ? 'left' : dx > 20 ? 'right' : null;
    const o = side && this.card[side];
    this.hint.setText(o ? o.label : '');
    this.hint.setColor(o && this.isLocked(o) ? CSS.grey : CSS.cream);
    this.drawRels(o ? Object.keys(o.rel ?? {}) : []);
  }

  release(p) {
    if (this.busy || !this.card || this.card.options || !this.cardObj) return;
    const dx = this.cardObj.x - CARD.x;
    const o = dx < -70 ? this.card.left : dx > 70 ? this.card.right : null;
    if (o && !this.isLocked(o)) return this.choose(o, dx < 0 ? -1 : 1);
    this.tweens.add({ targets: this.cardObj, x: CARD.x, angle: 0, duration: 150 });
    this.hint.setText('');
    this.drawRels([]);
  }

  choose(o, dir = 0) {
    if (this.busy) return;
    this.busy = true;
    this.clearButtons();
    sfx.select(this);
    const out = dir || (o === this.card.left ? -1 : o === this.card.right ? 1 : 0);
    this.tweens.add({ targets: this.cardObj, x: CARD.x + out * 400, y: CARD.y + (out ? 40 : -300), angle: out * 25, duration: 280, onComplete: (tw, [obj]) => obj.destroy() });

    const say = this.apply(o);
    this.drawRels([]);
    this.sayText.setText(say ?? '');
    this.time.delayedCall(say ? 1900 : 500, () => {
      this.index++;
      this.busy = false;
      this.showCard();
    });
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
    this.counter.setText('');
    advanceWeek();
    save();
    this.sayText.setText('');
    txt(this, 180, 300, 'Fin de la discussion.', 16, CSS.cream, { bold: true });
    this.time.delayedCall(900, () => this.scene.start('Programme'));
  }
}
