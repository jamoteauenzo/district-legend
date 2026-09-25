// L'interview du Reporter : une question, trois morceaux de réponse à choisir.
// Chaque morceau a une étiquette cachée :
//   sage    : réponse raisonnable, le Reporter coupe la caméra
//   ok      : crédible
//   enorme  : énorme mais possible
//   absurde : personne n'y croit
// et `local: true` quand il contient un détail familial ou du coin.
//
// Règle du PÉCAB (jamais expliquée au joueur) : aucun morceau sage, aucun
// absurde, exactement un morceau énorme, et au moins un détail local.
// `who` réserve un morceau à un personnage.

export const QUESTIONS = {
  bu: {
    question: "T'as bu quoi hier ?",
    slots: [
      {
        label: 'Combien ?',
        pool: [
          { t: 'Un fond de', tag: 'sage' },
          { t: 'Deux', tag: 'ok' },
          { t: 'Six', tag: 'ok' },
          { t: 'Trois et demi', tag: 'ok' },
          { t: "J'ai arrêté de compter à 11", tag: 'enorme' },
          { t: 'Toute la tireuse de', tag: 'enorme' },
          { t: '40 litres de', tag: 'absurde' },
        ],
      },
      {
        label: 'De quoi ?',
        pool: [
          { t: 'Perrier', tag: 'sage' },
          { t: 'bière sans alcool', tag: 'sage' },
          { t: 'pintes', tag: 'ok' },
          { t: 'Ricard', tag: 'ok' },
          { t: 'cidre de mon grand-père', tag: 'ok', local: true },
          { t: 'Get 27 de ma tante', tag: 'ok', local: true },
          { t: 'mojitos maison du président', tag: 'enorme', local: true },
          { t: 'champagne du Lidl', tag: 'enorme' },
          { t: 'potion magique', tag: 'absurde' },
        ],
      },
      {
        label: 'Où ça ?',
        pool: [
          { t: 'devant Koh-Lanta', tag: 'sage' },
          { t: 'chez moi, tranquille', tag: 'sage' },
          { t: 'au Balto', tag: 'ok', local: true },
          { t: 'au mariage de mon cousin', tag: 'ok', local: true },
          { t: 'à la communion de ma nièce', tag: 'ok', local: true },
          { t: 'au loto du club', tag: 'ok', local: true },
          { t: 'à la fête de la moule de Bourg-la-Motte', tag: 'enorme', local: true },
          { t: 'dans le vestiaire des vétérans', tag: 'enorme', local: true },
          { t: 'sur un bateau avec Zidane', tag: 'absurde' },
          { t: 'à ma soirée DJ', tag: 'ok', local: true, who: 'dylan' },
          { t: 'avec tonton le président', tag: 'ok', local: true, who: 'matheo' },
          { t: 'comme tous les samedis depuis 1991', tag: 'enorme', local: true, who: 'gege' },
        ],
      },
    ],
  },
  mange: {
    question: "T'as mangé quoi avant le match ?",
    slots: [
      {
        label: 'Combien ?',
        pool: [
          { t: 'Une', tag: 'sage' },
          { t: 'Deux', tag: 'ok' },
          { t: 'Trois', tag: 'ok' },
          { t: 'Une douzaine de', tag: 'enorme' },
          { t: '48', tag: 'absurde' },
        ],
      },
      {
        label: 'De quoi ?',
        pool: [
          { t: 'bananes', tag: 'sage' },
          { t: 'assiettes de pâtes complètes', tag: 'sage' },
          { t: 'kebabs', tag: 'ok' },
          { t: 'merguez', tag: 'ok' },
          { t: 'croissants', tag: 'ok' },
          { t: 'parts de tartiflette de ma mère', tag: 'ok', local: true },
          { t: 'andouillettes du boucher Morel', tag: 'enorme', local: true },
          { t: 'steaks de mammouth', tag: 'absurde' },
        ],
      },
      {
        label: 'Où ça ?',
        pool: [
          { t: 'bien équilibré', tag: 'sage' },
          { t: 'à 14h45 sur le parking', tag: 'ok', local: true },
          { t: 'au McDo de la zone commerciale', tag: 'ok', local: true },
          { t: 'dans la voiture en roulant', tag: 'ok' },
          { t: 'au repas des anciens', tag: 'enorme', local: true },
          { t: 'pendant la causerie du coach', tag: 'enorme', local: true },
          { t: 'avec le Président de la République', tag: 'absurde' },
        ],
      },
    ],
  },
  dormi: {
    question: "T'as dormi combien d'heures ?",
    slots: [
      {
        label: 'Combien ?',
        pool: [
          { t: 'Huit heures', tag: 'sage' },
          { t: 'Trois heures', tag: 'ok' },
          { t: 'Deux heures et quart', tag: 'ok' },
          { t: 'Quarante minutes', tag: 'enorme' },
          { t: 'Trois jours', tag: 'absurde' },
        ],
      },
      {
        label: 'Où ça ?',
        pool: [
          { t: 'dans mon lit', tag: 'sage' },
          { t: 'sur le canapé', tag: 'ok' },
          { t: 'dans la voiture', tag: 'ok' },
          { t: 'chez Fred', tag: 'ok', local: true },
          { t: 'sur une table de la salle des fêtes', tag: 'enorme', local: true },
          { t: 'dans la cage aux lions', tag: 'absurde' },
        ],
      },
      {
        label: 'Pourquoi ?',
        pool: [
          { t: 'pour être en forme', tag: 'sage' },
          { t: 'à cause du mariage de mon cousin', tag: 'ok', local: true },
          { t: 'le chien des voisins aboyait', tag: 'ok', local: true },
          { t: 'on a fini la fête de la moule', tag: 'enorme', local: true },
          { t: 'j\'ai fait la fermeture du Balto', tag: 'enorme', local: true },
          { t: 'je m\'entraînais en secret', tag: 'absurde' },
        ],
      },
    ],
  },
  rouge: {
    question: "Pourquoi t'as pris rouge ?",
    slots: [
      {
        label: 'Il a fait quoi ?',
        pool: [
          { t: 'Il a rien fait,', tag: 'sage' },
          { t: "Il m'a regardé,", tag: 'ok' },
          { t: "Il m'a chambré,", tag: 'ok' },
          { t: 'Il a parlé de ma mère,', tag: 'ok', local: true },
          { t: 'Il a dit que Saint-Clou c\'était nul,', tag: 'enorme', local: true },
        ],
      },
      {
        label: 'Et toi ?',
        pool: [
          { t: "j'ai demandé pardon", tag: 'sage' },
          { t: "je l'ai juste effleuré", tag: 'ok' },
          { t: "j'ai pris le ballon d'abord", tag: 'ok' },
          { t: "je lui ai fait une prise de catch", tag: 'enorme' },
          { t: "je l'ai envoyé sur la lune", tag: 'absurde' },
        ],
      },
      {
        label: 'Et alors ?',
        pool: [
          { t: 'et je regrette', tag: 'sage' },
          { t: 'devant ma grand-mère', tag: 'ok', local: true },
          { t: "et l'arbitre est de Sainte-Gluse", tag: 'ok', local: true },
          { t: 'comme mon père en 1998', tag: 'enorme', local: true },
          { t: 'et Zidane aurait fait pareil', tag: 'absurde' },
        ],
      },
    ],
  },
};

// Les réactions du Reporter, et les vues de la story.
export const REACTIONS = {
  sage: { lines: ['... T\'es sérieux ?', 'Bon. On coupe.', 'Personne va regarder ça.'], legende: -20, views: [12, 60] },
  mytho: { lines: ['Arrête de mytho.', 'Même Fred il y croit pas.', 'Tu nous prends pour qui ?'], legende: 0, views: [150, 400] },
  ok: { lines: ['Ok ok.', 'Pas mal.', 'Ça passe.'], legende: 20, views: [900, 2500] },
  pecab: { lines: ['PÉCAB'], legende: 100, views: [9000, 48000] },
};

// Juge la réponse composée (tableau de 3 morceaux).
export function judge(parts) {
  const tags = parts.map((p) => p.tag);
  if (tags.includes('absurde') || tags.filter((t) => t === 'enorme').length >= 2) return 'mytho';
  if (tags.includes('sage')) return 'sage';
  const enorme = tags.filter((t) => t === 'enorme').length;
  const local = parts.some((p) => p.local);
  return enorme === 1 && local ? 'pecab' : 'ok';
}
