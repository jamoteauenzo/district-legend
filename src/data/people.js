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

// Légende sous le portrait (cartes de décision)
export const CAPTIONS = {
  coach: 'Entraîneur, diplôme de 1994',
  president: 'Roland · il tient la buvette',
  jeanmi: 'Capitaine depuis 2009',
  fred: 'Gardien, toujours en retard',
  loiseau: 'Arbitre bénévole',
  lea: 'Rencontrée samedi dernier',
  mere: 'Il y a le gigot',
  patron: 'Artisan, commence tôt',
  momo: 'Ton pote de la salle',
  recruteur: 'Il n\'a pas donné son nom',
};
