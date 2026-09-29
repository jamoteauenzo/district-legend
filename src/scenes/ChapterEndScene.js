import Phaser from 'phaser';
import { state, save } from '../state.js';
import { getCharacter } from '../data/characters.js';
import { txt, title, button } from '../ui/text.js';
import { Mug } from '../ui/mug.js';
import { music } from '../audio/music.js';
import { muteButton } from '../ui/muteButton.js';
import { loadPortraits, portraitKey } from '../assets.js';
import { C, CSS } from '../palette.js';
import { setupCamera } from '../view.js';

// Fin du chapitre 1 : la page sportive de L'Écho de Grandcour.
export default class ChapterEndScene extends Phaser.Scene {
  constructor() {
    super('ChapterEnd');
  }

  preload() {
    loadPortraits(this, [[state.career.charId, 'fier'], ['jeanmi', 'choque']]);
  }

  create() {
    setupCamera(this);
    const c = state.career;
    const f = c.flags;
    state.meta.unlockedGege = true;
    f.chapitre1 = 'fini';
    save();

    const player = getCharacter(c.charId).nom;
    const name = f.surnom ?? player;
    const views = f.views ?? 0;
    let headline = `« ${name} » détrône Jean-Mi`;
    if (f.capitaine) headline = `« ${name} », nouveau capitaine de Saint-Clou`;

    this.cameras.main.setBackgroundColor(C.paper);
    const g = this.add.graphics();
    title(this, 180, 34, "L'Écho de Grandcour", 30, CSS.ink);
    txt(this, 180, 60, 'Page 14 · Sports · Football amateur', 11, CSS.grey, { italic: true });
    g.fillStyle(C.ink, 1);
    g.fillRect(16, 72, 328, 3);
    g.fillRect(16, 78, 328, 1);
    title(this, 16, 108, headline, 24, CSS.ink, { ox: 0, oy: 0.5, wrap: 328, lineSpacing: -4 });

    // Photo : le joueur fier, Jean-Mi choqué dans le coin
    g.fillStyle(C.ink, 0.3);
    g.fillRect(19, 153, 150, 170);
    g.fillStyle(C.salmon, 1);
    g.fillRect(16, 150, 150, 170);
    this.add.image(91, 320, portraitKey(c.charId, 'fier')).setOrigin(0.5, 1).setDisplaySize(150, 192);
    this.add.image(166, 322, portraitKey('jeanmi', 'choque')).setOrigin(1, 1).setDisplaySize(70, 90).setAngle(6);
    txt(this, 16, 332, `${player} (à gauche) et Jean-Mi (pas content).`, 10, CSS.grey, { ox: 0, italic: true });

    const lines = [];
    lines.push(`Arrivé cet été des U19 Régional, ${name} a marqué les esprits.`);
    if (f.job) lines.push(`Le ${f.job} de 18 ans s'est vite fait un nom au vestiaire.`);
    if (f.coupe1 === 'qualifié') lines.push('Saint-Clou jouera le 2e tour de la Coupe de France. Le président a payé sa tournée.');
    else if (f.coupe1 === 'éliminé') lines.push('Saint-Clou est sorti au 1er tour de la Coupe de France. « La tradition », dit le président.');
    txt(this, 180, 150, lines.join(' '), 12, CSS.ink, { ox: 0, oy: 0, wrap: 160, align: 'left' });

    const more = [];
    more.push(views >= 1000 ? `Ses interviews cumulent ${String(Math.round(views / 100) / 10).replace('.', ',')}k vues sur le compte du club.` : "Ses interviews n'ont pas encore trouvé leur public.");
    if (c.niveauReel >= 40) more.push('Un homme en lunettes de soleil a été aperçu en tribune. Il n\'a pas souhaité répondre.');
    more.push('Interrogé, Jean-Mi a simplement déclaré : « De mon temps… »');
    txt(this, 16, 352, more.join(' '), 12, CSS.ink, { ox: 0, oy: 0, wrap: 328, align: 'left' });

    g.fillStyle(C.ink, 1);
    g.fillRect(16, 470, 328, 2);
    const mug = new Mug(this, 314, 510, 1.6);
    mug.setValue(c.legende, false);
    title(this, 16, 500, 'Fin du chapitre 1', 22, CSS.red, { ox: 0 });
    txt(this, 16, 526, 'La Descente', 14, CSS.ink, { ox: 0, italic: true });

    title(this, 180, 562, 'Tonton Gégé est débloqué !', 15, CSS.blue);
    button(this, 180, 606, 300, 44, 'À suivre : chapitre 2', () => this.scene.start('Programme'), { size: 17, fill: C.red });
    muteButton(this, 340, 34);
    music.play('menu');
  }
}
