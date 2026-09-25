import Phaser from 'phaser';
import { makeTextures } from '../ui/sprites.js';
import { audio } from '../audio/engine.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    if (window.__HAS_PECAB) this.load.audio('pecab', 'audio/pecab.mp3');
  }

  create() {
    makeTextures(this);
    audio.init(this.game);
    this.scene.start('Menu');
  }
}
