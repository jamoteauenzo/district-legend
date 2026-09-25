import { getCharacter } from './data/characters.js';

const SAVE_KEY = 'district-legend-save-v1';

export const LEGENDE_MAX = 1000;
export const NIVEAU_MAX = 100;

// État global du jeu. `career` = la partie en cours, `meta` = ce qui survit
// d'une carrière à l'autre (fins débloquées, perso secret).
export const state = {
  career: null,
  meta: { unlockedGege: false, endings: [] },
};

export function newCareer(charId) {
  const char = getCharacter(charId);
  state.career = {
    charId,
    stats: { ...char.stats },
    legende: char.trait.id === 'legende' ? 500 : 0,
    niveauReel: char.stats.talent * 6,
    relations: { coach: 0, vestiaire: 0, president: 0, famille: 0, district: 0 },
    flags: {},
    chapter: 1,
    level: '1.6',
  };
  return state.career;
}

export function gainLegende(n) {
  const c = state.career;
  c.legende = Math.max(0, Math.min(LEGENDE_MAX, c.legende + n));
  return c.legende;
}

export function gainNiveau(n) {
  const c = state.career;
  const mult = n > 0 && getCharacter(c.charId).trait.id === 'tropFort' ? 2 : 1;
  c.niveauReel = Math.max(0, Math.min(NIVEAU_MAX, c.niveauReel + n * mult));
  return c.niveauReel;
}

export function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Stockage indisponible (navigation privée…) : on joue sans sauvegarde.
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.career = data.career ?? null;
    state.meta = { ...state.meta, ...(data.meta ?? {}) };
  } catch {
    // Sauvegarde illisible : on repart de zéro.
  }
}
