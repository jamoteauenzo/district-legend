import Phaser from 'phaser';
import { makeTextures, loadSprites } from '../ui/sprites.js';
import { audio } from '../audio/engine.js';
import { makeGrain, loadPortraits } from '../assets.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    if (window.__HAS_PECAB) this.load.audio('pecab', 'audio/pecab.mp3');
    // Les personnages les plus présents, chargés dès le départ
    loadPortraits(this, ['coach', 'president', 'jeanmi', 'kevin', 'jordan', 'dylan', 'matheo', 'gege']);
    loadSprites(this);
  }

  create() {
    makeTextures(this);
    makeGrain(this);
    audio.init(this.game);
    this.scene.start('Menu');
  }
}
