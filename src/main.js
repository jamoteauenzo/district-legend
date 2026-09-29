import Phaser from 'phaser';
import '@fontsource/anton';
import '@fontsource/newsreader/400.css';
import '@fontsource/newsreader/600.css';
import '@fontsource/newsreader/400-italic.css';
import '@fontsource/newsreader/600-italic.css';
import { Z, WIDTH, HEIGHT } from './view.js';
import { load } from './state.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import MatchScene from './scenes/MatchScene.js';
import ResultScene from './scenes/ResultScene.js';
import ProgrammeScene from './scenes/ProgrammeScene.js';
import InterviewScene from './scenes/InterviewScene.js';
import CardsScene from './scenes/CardsScene.js';
import DuelScene from './scenes/DuelScene.js';
import ChapterEndScene from './scenes/ChapterEndScene.js';
import TrainPhysique from './scenes/training/TrainPhysique.js';
import TrainJongles from './scenes/training/TrainJongles.js';
import TrainTechnique from './scenes/training/TrainTechnique.js';
import TrainFinition from './scenes/training/TrainFinition.js';
import TrainEtirements from './scenes/training/TrainEtirements.js';
import TrainToro from './scenes/training/TrainToro.js';
import TrainPlots from './scenes/training/TrainPlots.js';
import TrainGonflage from './scenes/training/TrainGonflage.js';
import TrainPenalty from './scenes/training/TrainPenalty.js';

// Taille logique 360 × 640 (DA), rendue en ×Z pour la netteté (voir view.js).
const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH * Z,
  height: HEIGHT * Z,
  antialias: true,
  backgroundColor: '#EDE5D3',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [
    BootScene,
    MenuScene,
    CharacterSelectScene,
    ProgrammeScene,
    TrainPhysique,
    TrainJongles,
    TrainTechnique,
    TrainFinition,
    TrainEtirements,
    TrainToro,
    TrainPlots,
    TrainGonflage,
    TrainPenalty,
    MatchScene,
    ResultScene,
    InterviewScene,
    CardsScene,
    DuelScene,
    ChapterEndScene,
  ],
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
  const fontReady = document.fonts
    ? Promise.all(['20px "Anton"', '16px "Newsreader"', 'italic 16px "Newsreader"', '600 16px "Newsreader"'].map((f) => document.fonts.load(f)))
    : Promise.resolve();
  const timeout = new Promise((resolve) => setTimeout(resolve, 2500));
  const [pecabAudio] = await Promise.all([hasPecabAudio(), Promise.race([fontReady, timeout])]);
  window.__HAS_PECAB = pecabAudio;
  window.game = new Phaser.Game(config);
}

start();
