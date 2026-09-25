import Phaser from 'phaser';
import { state, save } from '../state.js';
import { WEEKS, currentWeek, currentStep, weekDone, hasNextWeek, nextWeek, restartWeek } from '../data/schedule.js';
import { txt, button } from '../ui/text.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { C, CSS } from '../palette.js';

// Le programme de la semaine, envoyé par le coach sur le groupe WhatsApp.
const MATES = [
  'Fred : je serai à la bourre',
  "Jean-Mi : de mon temps on s'entraînait 4 fois",
  'Enzo : tonton a dit que je jouais dimanche',
  'Le président : qui ramène les chasubles ?',
  'Fred : quelqu\'un a vu mes protège-tibias ?',
];

export default class ProgrammeScene extends Phaser.Scene {
  constructor() {
    super('Programme');
  }

  create() {
    const week = WEEKS[currentWeek()];
    const step = currentStep();
    const done = weekDone();
    const rowH = 36;

    this.cameras.main.setBackgroundColor(0xe5ddd5);
    const g = this.add.graphics();
    g.fillStyle(0x1f6f5c, 1);
    g.fillRect(0, 0, 360, 60);
    txt(this, 20, 22, 'SENIORS B · ST-CLOU', 15, CSS.cream, { ox: 0, bold: true });
    txt(this, 20, 42, 'Coach Gérard, Fred, Jean-Mi, Le président, toi...', 10, '#CFE8E0', { ox: 0 });
    muteButton(this, 336, 30);

    // Bulle du coach
    const bubbleH = 78 + week.steps.length * rowH;
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(14, 72, 312, bubbleH, 8);
    txt(this, 28, 88, 'Coach Gérard', 12, '#1F6F5C', { ox: 0, bold: true });
    txt(this, 28, 100, `${week.titre} (${week.date}). Présence OBLIGATOIRE.`, 11, CSS.outline, { ox: 0, oy: 0, wrap: 285, align: 'left' });

    week.steps.forEach((s, i) => {
      const y = 140 + i * rowH;
      const isDone = i < step;
      const isNext = i === step;
      g.fillStyle(isDone ? 0x1f6f5c : isNext ? C.yellow : 0xdddddd, 1);
      g.fillCircle(38, y + 8, 9);
      if (isDone) txt(this, 38, y + 8, 'OK', 8, CSS.cream, { bold: true });
      txt(this, 56, y, s.jour, 10, isNext ? '#1F6F5C' : '#8C8C8C', { ox: 0, bold: true });
      txt(this, 56, y + 15, s.titre, 12, isNext ? CSS.outline : '#8C8C8C', { ox: 0, bold: isNext });
    });

    // Un message d'un coéquipier, pour l'ambiance
    const y2 = 84 + bubbleH;
    let line = Phaser.Utils.Array.GetRandom(MATES);
    if (done) line = state.career.flags.coupe1 === 'qualifié' && currentWeek() === 1
      ? 'Le président : 2E TOUR !!! Tournée générale au club-house'
      : 'Le président : bien joué les gars, 3e mi-temps au club-house';
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(14, y2, 312, 40, 8);
    txt(this, 28, y2 + 20, line, 11, CSS.outline, { ox: 0, wrap: 285, align: 'left' });

    if (!done) {
      const next = week.steps[step];
      const isMatch = next.scene === 'Match' && next.data?.mode !== 'opposition';
      button(this, 180, 566, 280, 50, isMatch ? 'JOUER LE MATCH' : 'Y ALLER', () => this.scene.start(next.scene, next.data ?? {}), { fill: C.yellow });
    } else if (hasNextWeek()) {
      button(this, 180, 566, 280, 50, 'SEMAINE SUIVANTE', () => {
        nextWeek();
        save();
        this.scene.restart();
      }, { fill: C.yellow });
    } else {
      txt(this, 180, 520, 'Fin du mois d\'août. La suite arrive bientôt.', 12, CSS.outline);
      button(this, 180, 566, 280, 46, 'REFAIRE LA SEMAINE', () => {
        restartWeek();
        save();
        this.scene.restart();
      });
    }
    button(this, 180, 616, 160, 32, 'MENU', () => this.scene.start('Menu'), { size: 12 });

    music.play('menu');
    save();
  }
}
