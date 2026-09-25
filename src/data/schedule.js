import { state } from '../state.js';

// La semaine type du chapitre 1 : quatre entraînements, puis le match.
export const WEEK = [
  { scene: 'TrainPhysique', jour: 'MARDI 19H', titre: 'Physique : le 30/30' },
  { scene: 'TrainJongles', jour: 'MARDI 19H40', titre: 'Jongles' },
  { scene: 'TrainTechnique', jour: 'JEUDI 19H', titre: 'Technique : le circuit' },
  { scene: 'TrainFinition', jour: 'JEUDI 19H45', titre: 'Finition : centres et frappes' },
  { scene: 'Match', jour: 'DIMANCHE 15H', titre: 'Match amical contre Sainte-Gluse' },
];

export function currentStep() {
  return state.career?.step ?? 0;
}

export function advanceWeek() {
  state.career.step = currentStep() + 1;
}

export function restartWeek() {
  state.career.step = 0;
}
