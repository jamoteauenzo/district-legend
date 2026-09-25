// Les cartes de décision, façon Reigns : glisse à gauche ou à droite.
// Une carte peut aussi proposer plusieurs choix (`options`), sans glisser.
//
// Effets possibles d'un choix :
//   legende, niveau        : jauges cachées
//   stats  : { foie: 1 }   : stats du perso (1 à 5)
//   rel    : { coach: -1 } : relations (-3 à +3)
//   flags  : { capitaine: true }
//   say    : la conséquence affichée après le choix
//   need   : { mauvaiseFoi: 4 } : choix verrouillé tant que la stat est trop basse
// Une carte peut exiger un drapeau (`if`) ou son absence (`ifNot`).

export const SURNOMS = ['Bouboule', 'Casquette', 'Merguez', 'Le Notaire', 'Tonton', 'Chips', 'Le Stagiaire', 'Pépito'];

export const DECKS = {
  bizutage: {
    titre: 'Le vestiaire',
    cards: [
      {
        who: 'Ton patron',
        face: 'patron',
        text: 'Bon, petit, ici on commence tôt. Tu fais quoi, déjà, comme boulot ?',
        options: [
          { label: 'Boulanger', stats: { foie: 1 }, flags: { job: 'boulanger' }, say: 'Le dimanche, tu bosses de 4h à 11h. Le match est à 15h.' },
          { label: 'Maçon', stats: { tacle: 1, bide: 1 }, flags: { job: 'maçon' }, say: 'Tu finis le samedi à 13h. Tes tacles sentent le béton.' },
          { label: 'Commercial', stats: { excuses: 2 }, flags: { job: 'commercial' }, say: 'Toujours en déplacement. Excuses illimitées.' },
          { label: 'Étudiant éternel', stats: { foie: 2 }, flags: { job: 'étudiant' }, say: 'Dispo pour toutes les 3e mi-temps. Zéro euro.' },
        ],
      },
      {
        who: 'Jean-Mi',
        face: 'jeanmi',
        text: 'Le nouveau ! Debout sur le banc. Tu chantes.',
        left: { label: 'Refuser', rel: { vestiaire: -2 }, legende: -10, say: 'On t\'appellera « Le Timide » jusqu\'à Noël.' },
        right: { label: 'Johnny, faux et fort', rel: { vestiaire: 1 }, legende: 25, say: '« Que je t\'aime », a cappella. Jean-Mi a une larme.' },
      },
      {
        who: 'Fred',
        face: 'mate1',
        text: 'C\'est ta tournée. C\'est la tradition.',
        left: { label: '« J\'ai oublié ma CB »', stats: { excuses: 1, mauvaiseFoi: 1 }, legende: 10, say: 'Personne n\'y croit. Tout le monde respecte.' },
        right: { label: 'Payer 14 pintes', rel: { vestiaire: 1 }, legende: 20, say: 'Ton compte en banque pleure. Le vestiaire t\'aime.' },
      },
      {
        who: 'Jean-Mi',
        face: 'jeanmi',
        text: 'T\'es à ma place. Ça fait 12 ans que je me change là.',
        left: { label: 'Lui laisser', flags: { jeanmiRespect: true }, say: 'Jean-Mi hoche la tête. Il s\'en souviendra.' },
        right: { label: '« Y a pas ton nom dessus »', legende: 20, flags: { jeanmiHostile: true }, say: 'Jean-Mi : « On en reparlera. »' },
      },
      {
        who: 'Le président',
        face: 'president',
        text: 'Qui m\'aide à tracer les lignes samedi matin à 8h ?',
        left: { label: 'Lever la main', rel: { president: 2 }, niveau: 2, say: 'Le président t\'appelle « mon grand » maintenant.' },
        right: { label: 'Relacer ses chaussures', stats: { excuses: 1 }, legende: 10, say: 'Fred a eu la même idée. Vous relacez ensemble.' },
      },
      {
        who: 'Fred',
        face: 'mate1',
        text: 'Il te faut un surnom. Tout le monde en a un ici.',
        left: { label: 'Choisir : « Le Mur »', legende: -5, say: 'Personne ne l\'utilisera jamais.' },
        right: { label: 'Laisser le vestiaire choisir', rel: { vestiaire: 1 }, legende: 15, surnom: true, say: 'Désormais, tu t\'appelles « {surnom} ».' },
      },
    ],
  },

  samedi: {
    titre: 'Samedi soir',
    cards: [
      {
        who: 'Fred',
        face: 'mate1',
        text: 'Samedi, 23h. On va en boîte à Grandcour. Match demain 15h.',
        left: { label: 'Dormir', niveau: 5, rel: { vestiaire: -1 }, legende: -10, say: 'Huit heures de sommeil. Le recruteur de R3 apprécie.' },
        right: { label: 'Y aller', legende: 30, say: 'Retour 5h12. Tu as perdu une chaussure.' },
      },
      {
        who: 'Ta mère',
        face: 'mere',
        text: 'Tu viens manger demain midi ? Il y a le gigot.',
        left: { label: '« J\'ai un tournoi »', rel: { famille: -1 }, legende: 15, say: 'Elle fait semblant d\'y croire.' },
        right: { label: 'Venir en crampons', rel: { famille: 1 }, legende: 10, say: 'Tu manges le gigot en protège-tibias.' },
      },
      {
        who: 'Léa',
        face: 'lea',
        text: 'Coucou c\'est Léa, de samedi dernier. On se revoit ?',
        left: { label: '« Focus saison »', rel: { vestiaire: 1 }, legende: 5, say: 'Le vestiaire applaudit. Ta mère soupire.' },
        right: { label: 'Répondre', rel: { famille: 1 }, flags: { enCouple: true }, say: 'Tu viens de débloquer : les courses du dimanche.' },
      },
      {
        who: 'Momo, ton pote',
        face: 'pote',
        text: 'Viens à la salle avec moi. L\'abonnement est à 19,99 €.',
        left: { label: '« Mon corps, c\'est mon style »', stats: { bide: 1 }, legende: 15, say: 'Ton bide te remercie.' },
        right: { label: 'S\'inscrire', niveau: 10, legende: -15, say: 'Quelque part, un recruteur de R3 sourit.' },
      },
      {
        who: 'Coach Gérard',
        face: 'coach',
        text: 'C\'est quoi ton poste préféré ?',
        left: { label: '« Là où je cours pas »', legende: 20, flags: { libero: true }, say: 'Le coach note : « libéro ». On n\'y joue plus depuis 1998.' },
        right: { label: '« Numéro 10 »', rel: { coach: -1 }, legende: -5, say: 'Le coach rit pendant trois minutes.' },
      },
      {
        who: 'M. Loiseau, l\'arbitre',
        face: 'ref',
        text: 'Tiens, le petit de Saint-Clou. Tu te tiendras bien demain ?',
        left: { label: '« Promis, monsieur »', rel: { district: 1 }, legende: -5, say: 'Il te croit. Pauvre homme.' },
        right: { label: '« Ça dépend de vous »', need: { mauvaiseFoi: 4 }, rel: { district: -1 }, legende: 30, say: 'Il sort déjà son carnet.' },
      },
    ],
  },

  veilleCoupe: {
    titre: 'La veille de la Coupe',
    cards: [
      {
        who: 'Le président',
        face: 'president',
        text: 'Jean-Mi se fait vieux. Le brassard, ça te dirait ?',
        left: { label: 'Refuser', flags: { jeanmiAllie: true }, say: 'Jean-Mi l\'apprend. Il te paie un demi.' },
        right: { label: 'Accepter', rel: { president: 1 }, legende: 20, flags: { capitaine: true }, say: 'Tu gères la caisse de bière. Jean-Mi ne te parle plus.' },
      },
      {
        who: 'Le président',
        face: 'president',
        text: 'Loto du club ce soir. Tu tiens la buvette ?',
        left: { label: 'Non, dodo', niveau: 3, legende: -5, say: 'Tu rates le carton plein de la mamie de Fred.' },
        right: { label: 'Oui, et je goûte tout', rel: { president: 1 }, legende: 25, say: 'Tu as gagné un jambon. Tu ne sais pas comment.' },
      },
      {
        who: 'Léa',
        face: 'lea',
        if: 'enCouple',
        text: 'Ce week-end on part à Center Parcs, j\'ai tout réservé !',
        left: { label: 'Center Parcs', rel: { famille: 2 }, legende: -20, say: 'Tu joueras quand même : tu as inventé le baptême de Fred.' },
        right: { label: '« Y a la Coupe de France »', rel: { famille: -2 }, legende: 20, say: 'Elle part avec sa sœur. Ambiance.' },
      },
      {
        who: 'Fred',
        face: 'mate1',
        ifNot: 'enCouple',
        text: 'Un gars de R3 veut s\'entraîner avec nous cette semaine.',
        left: { label: 'L\'accueillir', niveau: 5, say: 'Il te montre des exercices. Tu progresses. Dommage.' },
        right: { label: 'Le bizuter', legende: 25, flags: { bizuteR3: true }, say: 'Il est reparti en pleurant. Le vestiaire est fier.' },
      },
      {
        who: 'Coach Gérard',
        face: 'coach',
        text: 'Qui tire les penaltys dimanche ?',
        left: { label: '« Pas moi »', legende: 5, say: 'Sage décision. Trop sage.' },
        right: { label: '« Moi. En panenka. »', legende: 20, flags: { panenka: true }, say: 'Le coach devient tout pâle.' },
      },
    ],
  },
};
