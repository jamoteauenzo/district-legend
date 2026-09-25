import Phaser from 'phaser';
import { state } from '../state.js';
import { txt, button } from '../ui/text.js';
import { Mug } from '../ui/mug.js';
import { C, CSS } from '../palette.js';
import { sfx } from '../ui/sfx.js';

// L'écran de fin de match : le score officiel, que personne ne regarde,
// et les vraies stats.
export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  create({ score, stats, legendeStart }) {
    const career = state.career;
    const g = this.add.graphics();
    g.fillStyle(C.cream, 1);
    g.fillRect(20, 24, 320, 520);
    g.lineStyle(3, C.outline, 1);
    g.strokeRect(20, 24, 320, 520);

    txt(this, 180, 50, 'FEUILLE DE MATCH', 11, CSS.grey, { bold: true });
    txt(this, 180, 76, 'Match amical', 16, CSS.outline, { bold: true });
    txt(this, 180, 104, `Saint-Clou ${score.A} - ${score.B} Sainte-Gluse`, 11, CSS.grey);

    const meters = Math.round(stats.distance / 3);
    const lines = [
      ['Distance parcourue', `${meters} m`],
      ['Contestations', stats.contestations],
      ['Fautes', stats.fouls],
      ['Cartons', stats.red ? `Rouge (${stats.sentOffMinute}')` : stats.yellow ? 'Jaune' : 'Aucun'],
      ['Merguez & co', stats.pickups],
      ['Ballons dans le parking', stats.parking],
      ['Contre son camp', stats.ownGoals],
      ['Buts', stats.goals],
    ];
    lines.forEach(([label, value], i) => {
      const y = 146 + i * 28;
      txt(this, 40, y, label, 13, CSS.outline, { ox: 0 });
      txt(this, 320, y, String(value), 13, CSS.outline, { ox: 1, bold: true });
      g.lineStyle(1, C.sky, 0.5);
      g.lineBetween(40, y + 13, 320, y + 13);
    });

    const mug = new Mug(this, 180, 404, 2.4, C.outline);
    mug.setValue(legendeStart, false);
    this.time.delayedCall(500, () => {
      mug.setValue(career.legende);
      if (career.legende > legendeStart) sfx.gain(this);
    });

    txt(this, 180, 470, this.coachLine(stats), 12, CSS.outline, { wrap: 280 });

    const reporter = txt(this, 180, 566, 'Le Reporter s\'approche avec son téléphone...', 12, CSS.cream);
    this.tweens.add({ targets: reporter, alpha: 0.3, yoyo: true, repeat: -1, duration: 700 });

    button(this, 180, 606, 240, 44, 'RETOUR AU VESTIAIRE', () => this.scene.start('Menu'), { size: 14 });
  }

  coachLine(stats) {
    if (stats.red) return 'Le président : « Viens, je t\'offre un Ricard. »';
    if (stats.goals >= 2) return 'Coach Gérard : « Hmm. Pas mal. » (il soupire)';
    if (stats.ownGoals) return 'Le vestiaire : « On t\'en reparlera toute ta vie. »';
    if (stats.contestations >= 5) return 'M. Loiseau : « Je te connais depuis les U11, toi. »';
    return 'Coach Gérard : « On joue simple, les gars. SIMPLE. »';
  }
}
