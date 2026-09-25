import Phaser from 'phaser';
import { load } from './state.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import MatchScene from './scenes/MatchScene.js';
import ResultScene from './scenes/ResultScene.js';

// Le jeu tourne en 360 × 640 : du pixel art en 180 × 320 affiché ×2,
// pour que le texte reste lisible sur téléphone.
const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 360,
  height: 640,
  pixelArt: true,
  backgroundColor: '#1E2438',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, MenuScene, CharacterSelectScene, MatchScene, ResultScene],
};

// L'audio PÉCAB original est optionnel : on vérifie qu'il a bien été déposé.
async function hasPecabAudio() {
  try {
    const res = await fetch('audio/pecab.mp3', { method: 'HEAD' });
    return res.ok && (res.headers.get('content-type') ?? '').includes('audio');
  } catch {
    return false;
  }
}

async function start() {
  load();
  const fontReady = document.fonts ? document.fonts.load('16px "Pixelify Sans"') : Promise.resolve();
  const timeout = new Promise((resolve) => setTimeout(resolve, 2500));
  const [pecabAudio] = await Promise.all([hasPecabAudio(), Promise.race([fontReady, timeout])]);
  window.__HAS_PECAB = pecabAudio;
  window.game = new Phaser.Game(config);
}

start();
