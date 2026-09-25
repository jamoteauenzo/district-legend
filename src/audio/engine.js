// Moteur audio partagé : un contexte WebAudio (celui de Phaser), un volume
// général, un bus pour la musique et un bus pour les bruitages.
const MUTE_KEY = 'district-legend-muted';

export const audio = {
  ctx: null,
  master: null,
  music: null,
  sfx: null,
  noise: null,
  muted: false,
  game: null,

  init(game) {
    if (this.ctx) return;
    const ctx = game.sound && game.sound.context;
    if (!ctx) return;
    this.game = game;
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    this.music = ctx.createGain();
    this.music.gain.value = 0.32;
    this.music.connect(this.master);
    this.sfx = ctx.createGain();
    this.sfx.gain.value = 1;
    this.sfx.connect(this.master);

    // 2 secondes de bruit blanc, réutilisées pour batterie, foule, glissades…
    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    try {
      this.muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      this.muted = false;
    }
    this.applyMute();
  },

  // À appeler avant de jouer un son : débloque l'audio après le premier toucher.
  ready() {
    if (!this.ctx) return null;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem(MUTE_KEY, this.muted ? '1' : '0');
    } catch {
      // Pas de stockage : le choix ne sera pas retenu.
    }
    this.applyMute();
    return this.muted;
  },

  applyMute() {
    if (this.master) this.master.gain.value = this.muted ? 0 : 1;
    if (this.game) this.game.sound.mute = this.muted;
  },

  // Baisse la musique quelques instants (pendant le PÉCAB par exemple).
  duck(seconds = 1.2) {
    if (!this.ctx) return;
    const g = this.music.gain;
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(0.06, t, 0.03);
    g.setTargetAtTime(0.32, t + seconds, 0.3);
  },
};

// Une note simple (oscillateur + enveloppe).
export function tone(bus, { freq = 440, to = null, type = 'square', dur = 0.1, vol = 0.06, at = null, attack = 0.005 }) {
  const ctx = audio.ctx;
  const t0 = at ?? ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(bus);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

// Un souffle de bruit filtré (batterie, foule, glissade…).
export function noise(bus, { dur = 0.1, vol = 0.1, type = 'highpass', freq = 1000, to = null, q = 0.7, at = null, attack = 0.002, release = null }) {
  const ctx = audio.ctx;
  const t0 = at ?? ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = audio.noise;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t0);
  if (to) f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + attack);
  if (release) {
    g.gain.setValueAtTime(vol, t0 + dur - release);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  } else {
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  }
  src.connect(f).connect(g).connect(bus);
  src.start(t0, Math.random() * 1.5);
  src.stop(t0 + dur + 0.05);
}
