import Phaser from 'phaser';
import { title } from './text.js';
import { C, CSS } from '../palette.js';
import { ptr } from '../view.js';

// Commandes de la DA 1c : joystick de 112 px en pointillés à gauche, bouton
// rouge (88 px) et bouton bleu (66 px) à droite, ombre pleine de 3 px.
// Au clavier : flèches / ZQSD / WASD pour bouger, X ou Espace = A, C = B.
export class Controls {
  constructor(scene, { onA, onB }) {
    this.scene = scene;
    this.onA = onA;
    this.onB = onB;
    this.vector = new Phaser.Math.Vector2();
    this.home = { x: 82, y: 560 };
    this.base = { ...this.home, r: 56 };
    this.knob = { x: this.base.x, y: this.base.y };
    this.joyId = null;
    this.btnA = { x: 298, y: 572, r: 44, flash: 0 };
    this.btnB = { x: 226, y: 522, r: 33, flash: 0 };

    this.gfx = scene.add.graphics().setScrollFactor(0).setDepth(200);
    this.labelA = title(scene, this.btnA.x, this.btnA.y, '', 17, CSS.paper).setScrollFactor(0).setDepth(201);
    this.labelB = title(scene, this.btnB.x, this.btnB.y, '', 12, CSS.paper).setScrollFactor(0).setDepth(201);

    scene.input.addPointer(2);
    scene.input.on('pointerdown', this.down, this);
    scene.input.on('pointermove', this.move, this);
    scene.input.on('pointerup', this.up, this);
    scene.input.on('pointerupoutside', this.up, this);

    const kb = scene.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys('W,A,S,D,Z,Q,UP,DOWN,LEFT,RIGHT');
      kb.on('keydown-X', this.pressA, this);
      kb.on('keydown-SPACE', this.pressA, this);
      kb.on('keydown-C', this.pressB, this);
    }

    scene.events.once('shutdown', () => this.destroy());
  }

  pressA() {
    if (this.scene.talking) return;
    this.btnA.flash = 120;
    this.onA();
  }

  pressB() {
    if (this.scene.talking) return;
    this.btnB.flash = 120;
    this.onB();
  }

  down(raw) {
    const p = { ...ptr(raw), id: raw.id };
    if (Phaser.Math.Distance.Between(p.x, p.y, this.btnA.x, this.btnA.y) < this.btnA.r + 8) return this.pressA();
    if (Phaser.Math.Distance.Between(p.x, p.y, this.btnB.x, this.btnB.y) < this.btnB.r + 8) return this.pressB();
    if (this.joyId === null && p.x < 190 && p.y > 330) {
      this.joyId = p.id;
      this.base.x = Phaser.Math.Clamp(p.x, 60, 150);
      this.base.y = Phaser.Math.Clamp(p.y, 420, 580);
      this.moveKnob(p);
    }
  }

  move(raw) {
    if (raw.id === this.joyId) this.moveKnob(ptr(raw));
  }

  up(p) {
    if (p.id !== this.joyId) return;
    this.joyId = null;
    this.base.x = this.home.x;
    this.base.y = this.home.y;
    this.knob.x = this.base.x;
    this.knob.y = this.base.y;
    this.vector.set(0, 0);
  }

  moveKnob(p) {
    let dx = p.x - this.base.x;
    let dy = p.y - this.base.y;
    const len = Math.hypot(dx, dy);
    const max = this.base.r - 12;
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    this.knob.x = this.base.x + dx;
    this.knob.y = this.base.y + dy;
    const v = new Phaser.Math.Vector2(dx / max, dy / max);
    this.vector = v.length() < 0.2 ? v.set(0, 0) : v;
  }

  setLabels(a, b) {
    if (this.labelA.text !== a.toUpperCase()) this.labelA.setText(a.toUpperCase());
    if (this.labelB.text !== b.toUpperCase()) this.labelB.setText(b.toUpperCase());
  }

  update(delta) {
    if (this.keys && this.joyId === null) {
      const k = this.keys;
      const x = (k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown || k.Q.isDown ? 1 : 0);
      const y = (k.DOWN.isDown || k.S.isDown ? 1 : 0) - (k.UP.isDown || k.W.isDown || k.Z.isDown ? 1 : 0);
      if (x || y) this.vector.set(x, y).normalize();
      else this.vector.set(0, 0);
    }
    this.btnA.flash = Math.max(0, this.btnA.flash - delta);
    this.btnB.flash = Math.max(0, this.btnB.flash - delta);
    this.draw();
  }

  draw() {
    const g = this.gfx;
    g.clear();
    // Joystick : cercle en pointillés papier, bouton papier à ombre pleine
    g.lineStyle(3, C.paper, 0.9);
    const { x, y, r } = this.base;
    for (let a = 0; a < Math.PI * 2; a += 0.32) {
      g.beginPath();
      g.arc(x, y, r, a, a + 0.18);
      g.strokePath();
    }
    g.fillStyle(C.ink, 1);
    g.fillCircle(this.knob.x + 3, this.knob.y + 3, 22);
    g.fillStyle(C.paper, 1);
    g.fillCircle(this.knob.x, this.knob.y, 22);

    // Boutons : ombre pleine décalée, enfoncés quand on les touche
    const btn = (b, color) => {
      const d = b.flash ? 2 : 0;
      g.fillStyle(C.ink, 1);
      g.fillCircle(b.x + 3, b.y + 3, b.r);
      g.fillStyle(color, 1);
      g.fillCircle(b.x + d, b.y + d, b.r);
    };
    btn(this.btnA, C.red);
    btn(this.btnB, C.blue);
    this.labelA.setPosition(this.btnA.x + (this.btnA.flash ? 2 : 0), this.btnA.y + (this.btnA.flash ? 2 : 0));
    this.labelB.setPosition(this.btnB.x + (this.btnB.flash ? 2 : 0), this.btnB.y + (this.btnB.flash ? 2 : 0));
  }

  destroy() {
    const s = this.scene;
    s.input.off('pointerdown', this.down, this);
    s.input.off('pointermove', this.move, this);
    s.input.off('pointerup', this.up, this);
    s.input.off('pointerupoutside', this.up, this);
    if (s.input.keyboard) {
      s.input.keyboard.off('keydown-X', this.pressA, this);
      s.input.keyboard.off('keydown-SPACE', this.pressA, this);
      s.input.keyboard.off('keydown-C', this.pressB, this);
    }
  }
}
