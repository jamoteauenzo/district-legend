import { audio, tone, noise } from './engine.js';

// Musique chiptune jouée en direct par un petit séquenceur.
// Une case = une croche. `null` = silence. Notes en MIDI (60 = do central).
const _ = null;

const SONGS = {
  // « Hymne du District » : fanfare de village, pour les matchs.
  match: {
    bpm: 132,
    lead: { wave: 'square', vol: 0.05 },
    bass: { wave: 'triangle', vol: 0.12 },
    melody: [
      [72, _, 76, 79, 76, _, 72, _],
      [77, _, 77, 76, 74, _, 72, _],
      [74, _, 79, _, 77, 76, 74, _],
      [72, _, _, _, 79, 77, 76, 74],
      [76, _, 72, _, 69, _, 72, 76],
      [77, _, 81, _, 79, _, 77, _],
      [79, 77, 76, 74, 76, _, 74, _],
      [71, _, 74, _, 79, _, _, _],
    ],
    roots: [48, 53, 55, 48, 45, 53, 55, 55],
    bassPattern: [0, 12, 0, 12, 0, 12, 0, 12],
    drums: 'k.h.s.h.k.h.s.hh',
  },
  // Thème du menu : plus posé, un dimanche matin sur le parking du stade.
  menu: {
    bpm: 96,
    lead: { wave: 'triangle', vol: 0.09 },
    bass: { wave: 'triangle', vol: 0.1 },
    melody: [
      [69, _, 72, _, 76, _, 74, 72],
      [72, _, _, 69, 65, _, 69, _],
      [67, _, 72, _, 76, _, 79, 77],
      [76, _, 74, _, 71, _, _, _],
    ],
    roots: [45, 41, 48, 43],
    bassPattern: [0, _, 7, _, 12, _, 7, _],
    drums: 'k...h...k.k.h...',
  },
};

// Petite fanfare de fin de match (jouée une fois).
const JINGLE = [
  [72, 0], [76, 0.12], [79, 0.24], [84, 0.36], [79, 0.6], [84, 0.72],
];

const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

function drum(ch, t) {
  if (ch === 'k') tone(audio.music, { freq: 150, to: 45, type: 'sine', dur: 0.16, vol: 0.5, at: t });
  else if (ch === 's') noise(audio.music, { dur: 0.13, vol: 0.18, type: 'highpass', freq: 1800, at: t });
  else if (ch === 'h') noise(audio.music, { dur: 0.035, vol: 0.05, type: 'highpass', freq: 7000, at: t });
}

export const music = {
  current: null,
  timer: null,

  play(name) {
    if (!audio.ctx || this.current === name) return;
    this.stop();
    const song = SONGS[name];
    this.current = name;
    this.song = song;
    this.bars = song.melody.length;
    this.step = 0;
    this.nextTime = audio.ctx.currentTime + 0.08;
    this.timer = setInterval(() => this.tick(), 25);
  },

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.current = null;
  },

  tick() {
    const ctx = audio.ctx;
    const stepDur = 60 / this.song.bpm / 2;
    // Onglet en arrière-plan : on saute plutôt que de tout jouer d'un coup.
    if (this.nextTime < ctx.currentTime - 0.2) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.12) {
      this.schedule(this.step, this.nextTime, stepDur);
      this.nextTime += stepDur;
      this.step = (this.step + 1) % (this.bars * 8);
    }
  },

  schedule(step, t, stepDur) {
    const s = this.song;
    const bar = Math.floor(step / 8);
    const i = step % 8;
    const note = s.melody[bar][i];
    if (note !== null) tone(audio.music, { freq: freq(note), type: s.lead.wave, dur: stepDur * 0.9, vol: s.lead.vol, at: t });
    const off = s.bassPattern[i];
    if (off !== null) tone(audio.music, { freq: freq(s.roots[bar] + off), type: s.bass.wave, dur: stepDur * 0.85, vol: s.bass.vol, at: t });
    drum(s.drums[(step % 16)], t);
  },

  jingle() {
    if (!audio.ready()) return;
    const t = audio.ctx.currentTime + 0.05;
    JINGLE.forEach(([m, d]) => {
      tone(audio.music, { freq: freq(m), type: 'square', dur: 0.2, vol: 0.07, at: t + d });
      tone(audio.music, { freq: freq(m - 12), type: 'triangle', dur: 0.2, vol: 0.1, at: t + d });
    });
  },
};
