import Phaser from 'phaser';
import { state, save } from '../state.js';
import { WEEK, currentStep, restartWeek } from '../data/schedule.js';
import { txt, button } from '../ui/text.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { C, CSS } from '../palette.js';

// Le programme de la semaine, envoyé par le coach sur le groupe WhatsApp.
const MATES = [
  'Fred : je serai à la bourre',
  'Jean-Mi : de mon temps on s\'entraînait 4 fois',
  'Enzo : tonton a dit que je jouais dimanche',
  'Le président : qui ramène les chasubles ?',
];

export default class ProgrammeScene extends Phaser.Scene {
  constructor() {
    super('Programme');
  }

  create() {
    const step = currentStep();
    const done = step >= WEEK.length;

    this.cameras.main.setBackgroundColor(0xe5ddd5);
    const g = this.add.graphics();
    // Barre du groupe
    g.fillStyle(0x1f6f5c, 1);
    g.fillRect(0, 0, 360, 60);
    txt(this, 20, 22, 'SENIORS B · ST-CLOU', 15, CSS.cream, { ox: 0, bold: true });
    txt(this, 20, 42, 'Coach Gérard, Fred, Jean-Mi, Le président, toi...', 10, '#CFE8E0', { ox: 0 });
    muteButton(this, 336, 30);

    // Bulle du coach
    const bubbleH = 64 + WEEK.length * 40;
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(14, 78, 300, bubbleH, 8);
    txt(this, 28, 94, 'Coach Gérard', 12, '#1F6F5C', { ox: 0, bold: true });
    txt(this, 28, 106, 'Programme de la semaine. Présence OBLIGATOIRE.', 11, CSS.outline, { ox: 0, oy: 0, wrap: 270 });

    WEEK.forEach((s, i) => {
      const y = 146 + i * 40;
      const isDone = i < step;
      const isNext = i === step;
      const color = isNext ? CSS.outline : '#8C8C8C';
      g.fillStyle(isDone ? 0x1f6f5c : isNext ? C.yellow : 0xdddddd, 1);
      g.fillCircle(38, y + 8, 9);
      if (isDone) txt(this, 38, y + 8, 'OK', 8, CSS.cream, { bold: true });
      txt(this, 56, y, s.jour, 10, isNext ? '#1F6F5C' : '#8C8C8C', { ox: 0, bold: true });
      txt(this, 56, y + 16, s.titre, 12, color, { ox: 0, bold: isNext });
    });

    // Un message d'un coéquipier, pour l'ambiance
    const y2 = 90 + bubbleH;
    const line = done ? 'Le président : bien joué les gars, 3e mi-temps au club-house' : Phaser.Utils.Array.GetRandom(MATES);
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(14, y2, 300, 40, 8);
    txt(this, 28, y2 + 20, line, 11, CSS.outline, { ox: 0, wrap: 280 });

    if (!done) {
      const next = WEEK[step];
      button(this, 180, 560, 280, 54, next.scene === 'Match' ? 'JOUER LE MATCH' : "Y ALLER", () => this.scene.start(next.scene), { fill: C.yellow });
    } else {
      txt(this, 180, 500, 'Semaine terminée. La suite arrive bientôt.', 12, CSS.outline);
      button(this, 180, 548, 280, 46, 'REFAIRE LA SEMAINE', () => {
        restartWeek();
        save();
        this.scene.restart();
      });
    }
    button(this, 180, 612, 160, 34, 'MENU', () => this.scene.start('Menu'), { size: 12 });

    music.play('menu');
    save();
    this.career = state.career;
  }
}
