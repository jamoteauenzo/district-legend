import Phaser from 'phaser';
import { state } from '../state.js';
import { txt, title, button } from '../ui/text.js';
import { Mug } from '../ui/mug.js';
import { C, CSS } from '../palette.js';
import { sfx } from '../ui/sfx.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { portraitKey, loadPortraits } from '../assets.js';
import { setupCamera } from '../view.js';

// Qui parle dans la réplique de fin (« Coach Gérard : « … » »)
const SPEAKERS = [
  ['Coach Gérard', 'coach'],
  ['Le président', 'president'],
  ['Jean-Mi', 'jeanmi'],
  ['M. Loiseau', 'loiseau'],
  ['Fred', 'fred'],
  ['Le kiné', 'patron'],
  ['Le vestiaire', 'fred'],
];

// Feuille de fin (match ou entraînement), façon page de journal : le résultat
// officiel, les vraies stats, la chope, et le personnage qui commente.
// data = { title, subtitle, official?, lines, coach, legendeStart, reporter?, interview? }
export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  init(data) {
    this.data_ = data;
    const line = data.coach ?? '';
    const found = SPEAKERS.find(([n]) => line.startsWith(n));
    this.speaker = found ? found[1] : 'coach';
    this.quote = found ? line.slice(found[0].length).replace(/^\s*:\s*/, '') : line;
  }

  preload() {
    loadPortraits(this, [[this.speaker, 'rire'], [this.speaker, 'fier'], [this.speaker, 'choque']]);
  }

  create() {
    setupCamera(this);
    const { title: name, subtitle, official, lines, legendeStart, reporter, interview } = this.data_;
    const career = state.career;
    this.cameras.main.setBackgroundColor(C.paper);

    title(this, 16, 24, subtitle === 'Match' ? 'Feuille de match' : "Fiche d'entraînement", 13, CSS.red, { ox: 0 });
    txt(this, 344, 26, "L'Écho de Grandcour", 12, CSS.grey, { ox: 1, italic: true });
    this.add.rectangle(16, 38, 328, 3, C.ink).setOrigin(0);
    title(this, 16, 66, name, 30, CSS.ink, { ox: 0, wrap: 328 });
    if (official) txt(this, 16, 98, `${official} (score officiel)`, 13, CSS.grey, { ox: 0, italic: true });

    const top = official ? 128 : 112;
    const rowH = Math.min(27, 215 / lines.length);
    const g = this.add.graphics();
    lines.forEach(([label, value], i) => {
      const y = top + i * rowH;
      txt(this, 16, y, label, 15, CSS.ink, { ox: 0 });
      title(this, 344, y, String(value), 17, CSS.ink, { ox: 1 });
      g.fillStyle(C.ink, 0.25);
      g.fillRect(16, y + rowH / 2 - 1, 328, 1);
    });

    // La chope (le vrai score), grande, à gauche
    const mug = new Mug(this, 58, 384, 2.4);
    mug.setValue(legendeStart, false);
    this.time.delayedCall(500, () => {
      mug.setValue(career.legende);
      if (career.legende > legendeStart) sfx.gain(this);
    });

    // Le personnage qui commente, en découpe, avec sa bulle
    const up = career.legende > legendeStart + 40;
    const expr = up ? 'rire' : career.legende < legendeStart ? 'choque' : 'fier';
    const key = this.textures.exists(portraitKey(this.speaker, expr)) ? portraitKey(this.speaker, expr) : portraitKey(this.speaker, 'neutre');
    if (this.textures.exists(key)) this.add.image(214, 548, key).setOrigin(0, 1).setDisplaySize(160, 205).setAngle(2);
    const q = txt(this, 0, 0, this.quote, 14, CSS.ink, { italic: true, wrap: 150 });
    const bh = q.height + 24;
    const bx = 118;
    const by = 484 - bh / 2;
    const b = this.add.graphics();
    b.fillStyle(C.ink, 0.3);
    b.fillRect(bx - 84 + 3, by + 4, 174, bh);
    b.fillStyle(C.white, 1);
    b.fillRect(bx - 84, by, 174, bh);
    b.fillTriangle(bx + 70, by + bh - 1, bx + 90, by + bh - 1, bx + 110, by + bh + 20);
    q.setPosition(bx + 3, by + bh / 2);
    q.setDepth(1);

    if (reporter) {
      const t = txt(this, 16, 572, "Le Reporter s'approche avec son téléphone…", 12, CSS.red, { ox: 0, italic: true });
      this.tweens.add({ targets: t, alpha: 0.3, yoyo: true, repeat: -1, duration: 700 });
    }

    muteButton(this, 338, 572);
    music.stop();
    music.jingle();
    this.time.delayedCall(2500, () => music.play('menu'));

    button(this, 180, 612, 300, 42, 'Continuer', () => (reporter ? this.scene.start('Interview', interview ?? {}) : this.scene.start('Programme')), { fill: C.red, size: 18 });
  }
}
