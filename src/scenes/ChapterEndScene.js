import Phaser from 'phaser';
import { state, save } from '../state.js';
import { txt, button } from '../ui/text.js';
import { Mug } from '../ui/mug.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { C, CSS } from '../palette.js';

// Fin du chapitre 1 : la page sportive de L'Écho de Grandcour.
export default class ChapterEndScene extends Phaser.Scene {
  constructor() {
    super('ChapterEnd');
  }

  create() {
    const c = state.career;
    const f = c.flags;
    state.meta.unlockedGege = true;
    f.chapitre1 = 'fini';
    save();

    const name = f.surnom ?? 'le petit nouveau';
    const views = f.views ?? 0;
    let headline = `SAINT-CLOU : « ${name.toUpperCase()} » DÉTRÔNE JEAN-MI`;
    if (f.capitaine) headline = `NOUVEAU CAPITAINE À SAINT-CLOU : C'EST « ${name.toUpperCase()} »`;

    this.cameras.main.setBackgroundColor(0x1e2438);
    const g = this.add.graphics();
    g.fillStyle(0xf1ead6, 1);
    g.fillRect(16, 16, 328, 540);
    g.lineStyle(2, C.outline, 1);
    g.strokeRect(16, 16, 328, 540);
    g.lineBetween(28, 72, 332, 72);
    g.lineBetween(28, 76, 332, 76);

    txt(this, 180, 40, "L'ÉCHO DE GRANDCOUR", 22, CSS.outline, { bold: true });
    txt(this, 180, 62, 'Page 14 · Sports · Football amateur', 9, CSS.grey);
    txt(this, 180, 106, headline, 15, CSS.outline, { bold: true, wrap: 300 });

    const lines = [];
    lines.push(`Arrivé cet été des U19 Régional, ${name} a marqué les esprits au club.`);
    if (f.job) lines.push(`Le ${f.job} de 18 ans s'est vite fait un nom au vestiaire.`);
    if (f.coupe1 === 'qualifié') lines.push('Saint-Clou s\'est qualifié pour le 2e tour de la Coupe de France. Le président a payé sa tournée.');
    else if (f.coupe1 === 'éliminé') lines.push('Saint-Clou a été éliminé au 1er tour de la Coupe de France. « La tradition », selon le président.');
    lines.push(views >= 1000 ? `Ses interviews d'après-match cumulent déjà ${String(Math.round(views / 100) / 10).replace('.', ',')}k vues sur le compte du club.` : 'Ses interviews d\'après-match n\'ont pas encore trouvé leur public.');
    if (c.niveauReel >= 40) lines.push('Un homme en lunettes de soleil a été aperçu en tribune. Il n\'a pas souhaité répondre.');
    lines.push('Interrogé, Jean-Mi a simplement déclaré : « De mon temps... »');
    txt(this, 180, 160, lines.join('\n\n'), 11, CSS.outline, { wrap: 296, align: 'left', oy: 0 });

    const mug = new Mug(this, 290, 500, 2, C.outline);
    mug.setValue(c.legende, false);
    txt(this, 40, 500, 'FIN DU CHAPITRE 1\nLa Descente', 12, CSS.red, { ox: 0, bold: true, align: 'left' });

    txt(this, 180, 574, 'Tonton Gégé est débloqué !', 12, CSS.yellow, { bold: true });
    button(this, 180, 612, 280, 40, 'À SUIVRE : CHAPITRE 2', () => this.scene.start('Programme'), { size: 13, fill: C.yellow });
    muteButton(this, 24, 574);
    music.play('menu');
  }
}
