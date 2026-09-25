import Phaser from 'phaser';
import { txt } from './text.js';
import { C, CSS } from '../palette.js';

// Joystick virtuel à gauche + deux boutons d'action à droite.
// Au clavier : flèches / ZQSD / WASD pour bouger, X ou Espace = A, C = B.
export class Controls {
  constructor(scene, { onA, onB }) {
    this.scene = scene;
    this.onA = onA;
    this.onB = onB;
    this.vector = new Phaser.Math.Vector2();
    this.home = { x: 76, y: 560 };
    this.base = { ...this.home, r: 44 };
    this.knob = { x: this.base.x, y: this.base.y };
    this.joyId = null;
    this.btnA = { x: 302, y: 546, r: 32, flash: 0 };
    this.btnB = { x: 236, y: 598, r: 25, flash: 0 };

    this.gfx = scene.add.graphics().setScrollFactor(0).setDepth(200);
    this.labelA = txt(scene, this.btnA.x, this.btnA.y, '', 11, CSS.cream, { bold: true, stroke: CSS.outline })
      .setScrollFactor(0)
      .setDepth(201);
    this.labelB = txt(scene, this.btnB.x, this.btnB.y, '', 8, CSS.outline, { bold: true })
      .setScrollFactor(0)
      .setDepth(201);

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
    this.btnA.flash = 120;
    this.onA();
  }

  pressB() {
    this.btnB.flash = 120;
    this.onB();
  }

  down(p) {
    if (Phaser.Math.Distance.Between(p.x, p.y, this.btnA.x, this.btnA.y) < this.btnA.r + 10) return this.pressA();
    if (Phaser.Math.Distance.Between(p.x, p.y, this.btnB.x, this.btnB.y) < this.btnB.r + 10) return this.pressB();
    if (this.joyId === null && p.x < 200 && p.y > 330) {
      this.joyId = p.id;
      this.base.x = Phaser.Math.Clamp(p.x, 50, 150);
      this.base.y = Phaser.Math.Clamp(p.y, 400, 590);
      this.moveKnob(p);
    }
  }

  move(p) {
    if (p.id === this.joyId) this.moveKnob(p);
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
    if (len > this.base.r) {
      dx = (dx / len) * this.base.r;
      dy = (dy / len) * this.base.r;
    }
    this.knob.x = this.base.x + dx;
    this.knob.y = this.base.y + dy;
    const v = new Phaser.Math.Vector2(dx / this.base.r, dy / this.base.r);
    this.vector = v.length() < 0.2 ? v.set(0, 0) : v;
  }

  setLabels(a, b) {
    if (this.labelA.text !== a) this.labelA.setText(a);
    if (this.labelB.text !== b) this.labelB.setText(b);
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
    g.fillStyle(C.cream, 0.15);
    g.fillCircle(this.base.x, this.base.y, this.base.r);
    g.lineStyle(2, C.cream, 0.35);
    g.strokeCircle(this.base.x, this.base.y, this.base.r);
    g.fillStyle(C.cream, 0.5);
    g.fillCircle(this.knob.x, this.knob.y, 18);

    g.fillStyle(C.red, this.btnA.flash ? 1 : 0.75);
    g.fillCircle(this.btnA.x, this.btnA.y, this.btnA.r);
    g.lineStyle(3, C.outline, 0.8);
    g.strokeCircle(this.btnA.x, this.btnA.y, this.btnA.r);

    g.fillStyle(C.yellow, this.btnB.flash ? 1 : 0.75);
    g.fillCircle(this.btnB.x, this.btnB.y, this.btnB.r);
    g.strokeCircle(this.btnB.x, this.btnB.y, this.btnB.r);
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
