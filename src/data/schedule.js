import { state } from '../state.js';

// Le calendrier : une semaine = une liste de séances, la dernière est un match.
// `data` est passé à la scène (ex. le type de match).
export const WEEKS = [
  {
    titre: 'Semaine 1 · La reprise',
    date: 'Fin juillet',
    steps: [
      { scene: 'TrainPhysique', jour: 'MARDI 19H', titre: 'Physique : le 30/30' },
      { scene: 'TrainJongles', jour: 'MARDI 19H40', titre: 'Jongles' },
      { scene: 'TrainTechnique', jour: 'JEUDI 19H', titre: 'Technique : le circuit' },
      { scene: 'TrainFinition', jour: 'JEUDI 19H45', titre: 'Finition : centres et frappes' },
      { scene: 'Match', data: { mode: 'friendly' }, jour: 'DIMANCHE 15H', titre: 'Match amical contre Sainte-Gluse' },
    ],
  },
  {
    titre: 'Semaine 2 · Coupe de France',
    date: 'Début août',
    steps: [
      { scene: 'TrainEtirements', jour: 'MARDI 19H', titre: 'Étirements' },
      { scene: 'TrainToro', jour: 'MARDI 19H15', titre: 'Le toro' },
      { scene: 'TrainPlots', jour: 'MARDI 20H30', titre: 'Corvée : ramasser les plots' },
      { scene: 'TrainGonflage', jour: 'JEUDI 18H45', titre: 'Gonfler les ballons' },
      { scene: 'Match', data: { mode: 'opposition' }, jour: 'JEUDI 19H', titre: "L'opposition du jeudi" },
      { scene: 'TrainPenalty', jour: 'JEUDI 20H', titre: 'Tirs au but' },
      { scene: 'Match', data: { mode: 'cup' }, jour: 'DIMANCHE 15H', titre: 'Coupe de France, 1er tour' },
    ],
  },
];

export function currentWeek() {
  return Math.min(state.career?.week ?? 0, WEEKS.length - 1);
}

export function currentStep() {
  return state.career?.step ?? 0;
}

export function weekDone() {
  return currentStep() >= WEEKS[currentWeek()].steps.length;
}

export function hasNextWeek() {
  return currentWeek() < WEEKS.length - 1;
}

// La séance qui se termine fait avancer le calendrier.
export function advanceWeek() {
  state.career.step = currentStep() + 1;
}

export function nextWeek() {
  state.career.week = currentWeek() + 1;
  state.career.step = 0;
}

export function restartWeek() {
  state.career.step = 0;
}
