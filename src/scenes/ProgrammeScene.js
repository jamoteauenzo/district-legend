import Phaser from 'phaser';
import { state, save } from '../state.js';
import { WEEKS, currentWeek, currentStep, weekDone, hasNextWeek, nextWeek, restartWeek } from '../data/schedule.js';
import { txt, title, button } from '../ui/text.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { portraitKey, loadPortraits } from '../assets.js';
import { C, CSS } from '../palette.js';
import { setupCamera } from '../view.js';

// Le programme de la semaine : le groupe WhatsApp des seniors B, version 1c.
const MATES = [
  ['fred', 'Fred', 'je serai à la bourre'],
  ['jeanmi', 'Jean-Mi', "de mon temps on s'entraînait 4 fois"],
  ['president', 'Le président', 'qui ramène les chasubles ?'],
  ['fred', 'Fred', "quelqu'un a vu mes protège-tibias ?"],
  ['jeanmi', 'Jean-Mi', 'on prend ma voiture dimanche, pas celle du petit'],
];

export default class ProgrammeScene extends Phaser.Scene {
  constructor() {
    super('Programme');
  }

  preload() {
    loadPortraits(this, [['fred', 'neutre'], ['jeanmi', 'neutre'], ['president', 'neutre'], ['coach', 'neutre']]);
  }

  create() {
    setupCamera(this);
    const week = WEEKS[currentWeek()];
    const step = currentStep();
    const done = weekDone();
    const rowH = 34;
    this.cameras.main.setBackgroundColor(C.paperMid);

    // En-tête du groupe
    this.add.rectangle(0, 0, 360, 60, C.ink).setOrigin(0);
    title(this, 16, 24, 'Seniors B · St-Clou', 20, CSS.paper, { ox: 0 });
    txt(this, 16, 45, 'Coach Gérard, Fred, Jean-Mi, le président, toi…', 11, CSS.paperDark, { ox: 0, italic: true });
    muteButton(this, 336, 30, true);

    // Message du coach
    const bubbleH = 70 + week.steps.length * rowH;
    this.avatar(34, 96, 'coach');
    this.bubble(62, 74, 284, bubbleH);
    title(this, 76, 90, 'Coach Gérard', 13, CSS.red, { ox: 0 });
    txt(this, 76, 102, `${week.titre} (${week.date}). Présence OBLIGATOIRE.`, 12, CSS.ink, { ox: 0, oy: 0, wrap: 258, align: 'left', italic: true });

    const g = this.add.graphics();
    week.steps.forEach((s, i) => {
      const y = 142 + i * rowH;
      const isDone = i < step;
      const isNext = i === step;
      g.fillStyle(isDone ? C.ink : isNext ? C.red : C.paperDark, 1);
      g.fillRect(76, y - 1, 16, 16);
      if (isDone) title(this, 84, y + 7, 'OK', 8, CSS.paper);
      title(this, 100, y + 3, s.jour, 10, isNext ? CSS.red : CSS.grey, { ox: 0 });
      txt(this, 100, y + 18, s.titre, 13, isNext ? CSS.ink : CSS.grey, { ox: 0, italic: true, bold: isNext });
    });

    // Un message d'un coéquipier
    const y2 = 86 + bubbleH;
    let [who, name, line] = Phaser.Utils.Array.GetRandom(MATES);
    if (done) {
      [who, name] = ['president', 'Le président'];
      line = state.career.flags.coupe1 === 'qualifié' && currentWeek() === 1 ? '2E TOUR !!! Tournée générale au club-house' : 'bien joué les gars, 3e mi-temps au club-house';
    }
    this.avatar(34, y2 + 22, who);
    this.bubble(62, y2, 284, 48);
    title(this, 76, y2 + 14, name, 12, CSS.blue, { ox: 0 });
    txt(this, 76, y2 + 32, line, 12, CSS.ink, { ox: 0, italic: true, wrap: 258, align: 'left' });

    if (!done) {
      const next = week.steps[step];
      const isMatch = next.scene === 'Match' && next.data?.mode !== 'opposition';
      const isBoss = next.data?.mode === 'anciens';
      button(this, 180, 566, 300, 50, isBoss ? 'Affronter Jean-Mi' : isMatch ? 'Jouer le match' : 'Y aller', () => this.scene.start(next.scene, next.data ?? {}), { fill: C.red, size: 20 });
    } else if (hasNextWeek()) {
      button(this, 180, 566, 300, 50, 'Semaine suivante', () => {
        nextWeek();
        save();
        this.scene.restart();
      }, { fill: C.red, size: 20 });
    } else {
      txt(this, 180, 518, 'Fin du chapitre 1. Le chapitre 2 arrive bientôt.', 13, CSS.ink, { italic: true });
      button(this, 180, 566, 300, 46, 'Refaire la semaine', () => {
        restartWeek();
        save();
        this.scene.restart();
      });
    }
    button(this, 180, 618, 150, 30, 'Menu', () => this.scene.start('Menu'), { size: 13 });

    music.play('menu');
    save();
  }

  // Bulle blanche à ombre pleine
  bubble(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(C.ink, 0.3);
    g.fillRect(x + 3, y + 4, w, h);
    g.fillStyle(C.white, 1);
    g.fillRect(x, y, w, h);
    g.fillTriangle(x, y + 12, x - 9, y + 16, x, y + 24);
  }

  // Avatar rond : la tête du portrait, recadrée
  avatar(x, y, id) {
    const key = portraitKey(id, 'neutre');
    this.add.circle(x + 1, y + 2, 21, C.ink, 0.3);
    this.add.circle(x, y, 21, C.paperDark);
    if (!this.textures.exists(key)) return;
    const img = this.add.image(x, y + 26, key).setDisplaySize(84, 107);
    const shape = this.make.graphics({ add: false });
    shape.fillCircle(x, y, 20);
    img.setMask(shape.createGeometryMask());
  }
}
