import { getCharacter } from './characters.js';

// Noms affichés dans le bandeau des dialogues (id des portraits de la DA)
const NAMES = {
  coach: 'Coach Gérard',
  president: 'Le président',
  jeanmi: 'Jean-Mi',
  fred: 'Fred',
  loiseau: 'M. Loiseau',
  recruteur: 'Le recruteur',
  lea: 'Léa',
  mere: 'Ta mère',
  patron: 'Ton patron',
  momo: 'Momo',
  reporter: 'Le Reporter',
  kaiser: 'Kaiser',
};

export function displayName(id) {
  return NAMES[id] ?? getCharacter(id)?.nom ?? id;
}
