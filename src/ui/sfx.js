import { audio, tone, noise } from '../audio/engine.js';

// Bruitages synthétisés en direct. Chaque fonction prend la scène en premier
// argument (inutilisé pour l'instant, gardé pour plus tard).

function play(fn) {
  if (!audio.ready()) return;
  fn(audio.sfx, audio.ctx.currentTime);
}

export const sfx = {
  whistle: (_s, times = 1) =>
    play((b, t) => {
      for (let i = 0; i < times; i++) {
        const d = i * 0.32;
        tone(b, { freq: 2700, to: 2500, dur: 0.22, vol: 0.05, at: t + d });
        tone(b, { freq: 2900, to: 2750, dur: 0.22, vol: 0.03, at: t + d + 0.02 });
      }
    }),
  kick: () => play((b, t) => {
    tone(b, { freq: 180, to: 60, type: 'sine', dur: 0.12, vol: 0.25, at: t });
    noise(b, { dur: 0.04, vol: 0.08, type: 'bandpass', freq: 900, at: t });
  }),
  // Glissade dans l'herbe mouillée
  tackle: () => play((b, t) => noise(b, { dur: 0.32, vol: 0.14, type: 'bandpass', freq: 2500, to: 600, q: 1.2, at: t })),
  // Impact sur un adversaire
  thud: () => play((b, t) => {
    tone(b, { freq: 110, to: 50, type: 'sine', dur: 0.2, vol: 0.35, at: t });
    noise(b, { dur: 0.08, vol: 0.12, type: 'lowpass', freq: 800, at: t });
  }),
  gain: () => play((b, t) => {
    tone(b, { freq: 660, to: 990, dur: 0.08, vol: 0.04, at: t });
    tone(b, { freq: 990, to: 1320, dur: 0.08, vol: 0.03, at: t + 0.07 });
  }),
  loss: () => play((b, t) => tone(b, { freq: 300, to: 150, dur: 0.22, vol: 0.05, at: t })),
  card: () => play((b, t) => tone(b, { freq: 880, dur: 0.08, vol: 0.05, at: t })),
  stamp: () => play((b, t) => {
    tone(b, { freq: 120, to: 40, type: 'sine', dur: 0.3, vol: 0.4, at: t });
    noise(b, { dur: 0.1, vol: 0.2, type: 'lowpass', freq: 1200, at: t });
  }),
  bark: () => play((b, t) => {
    for (const d of [0, 0.15]) {
      tone(b, { freq: 460, to: 260, type: 'sawtooth', dur: 0.09, vol: 0.05, at: t + d });
      noise(b, { dur: 0.06, vol: 0.05, type: 'bandpass', freq: 900, q: 2, at: t + d });
    }
  }),
  alarm: () => play((b, t) => {
    for (let i = 0; i < 8; i++) tone(b, { freq: i % 2 ? 900 : 1300, dur: 0.14, vol: 0.03, at: t + i * 0.15 });
  }),
  select: () => play((b, t) => {
    tone(b, { freq: 520, dur: 0.05, vol: 0.05, at: t });
    tone(b, { freq: 780, dur: 0.05, vol: 0.04, at: t + 0.05 });
  }),
  // Canette ou Ricard : glou glou
  gulp: () => play((b, t) => {
    for (let i = 0; i < 3; i++) tone(b, { freq: 500 - i * 60, to: 200, type: 'sine', dur: 0.09, vol: 0.12, at: t + i * 0.12 });
  }),
  // La vieille pompe à main : pfff
  pump: () => play((b, t) => noise(b, { dur: 0.14, vol: 0.12, type: 'bandpass', freq: 1800, to: 900, q: 1.5, at: t })),
  // Merguez : croc croc
  munch: () => play((b, t) => {
    for (let i = 0; i < 3; i++) noise(b, { dur: 0.06, vol: 0.14, type: 'lowpass', freq: 1400, at: t + i * 0.13 });
  }),
  // Le recruteur arrive : deux notes inquiétantes
  ominous: () => play((b, t) => {
    tone(b, { freq: 110, type: 'sawtooth', dur: 0.6, vol: 0.05, at: t, attack: 0.1 });
    tone(b, { freq: 104, type: 'sawtooth', dur: 0.8, vol: 0.05, at: t + 0.5, attack: 0.1 });
  }),

  // ---- La foule (12 spectateurs et un chien, mais bruyants)
  cheer: (_s, big = false) => play((b, t) => {
    noise(b, { dur: big ? 2 : 1.2, vol: big ? 0.2 : 0.12, type: 'bandpass', freq: 1100, to: 1500, q: 0.6, at: t, attack: 0.15, release: 0.8 });
    if (big) for (let i = 0; i < 4; i++) tone(b, { freq: 1800 + i * 150, to: 2400, type: 'sine', dur: 0.3, vol: 0.015, at: t + 0.2 + i * 0.25 });
  }),
  ooh: () => play((b, t) => noise(b, { dur: 0.9, vol: 0.12, type: 'bandpass', freq: 350, to: 650, q: 4, at: t, attack: 0.2, release: 0.5 })),
  boo: () => play((b, t) => {
    for (const f of [140, 147, 155]) tone(b, { freq: f, to: f * 0.9, type: 'sawtooth', dur: 1.1, vol: 0.025, at: t, attack: 0.3 });
  }),
  laugh: () => play((b, t) => {
    for (let i = 0; i < 7; i++) {
      const d = i * 0.13 + Math.random() * 0.03;
      noise(b, { dur: 0.09, vol: 0.13, type: 'bandpass', freq: 900 + Math.random() * 400, q: 3, at: t + d });
      tone(b, { freq: 320 - i * 12, type: 'triangle', dur: 0.08, vol: 0.04, at: t + d });
    }
  }),
};

// Murmure de fond du public pendant les matchs.
export const crowdAmbience = {
  nodes: null,
  start() {
    if (!audio.ready() || this.nodes) return;
    const ctx = audio.ctx;
    const src = ctx.createBufferSource();
    src.buffer = audio.noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 700;
    f.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.value = 0.025;
    // Le murmure monte et descend doucement
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.15;
    lfoGain.gain.value = 0.01;
    lfo.connect(lfoGain).connect(g.gain);
    src.connect(f).connect(g).connect(audio.sfx);
    src.start();
    lfo.start();
    this.nodes = { src, lfo };
  },
  stop() {
    if (!this.nodes) return;
    this.nodes.src.stop();
    this.nodes.lfo.stop();
    this.nodes = null;
  },
};
