// Bruitages synthétisés en attendant les vrais sons.

function ctxOf(scene) {
  const ctx = scene.sound && scene.sound.context;
  if (!ctx) return null;
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(ctx, { freq = 440, to = null, type = 'square', dur = 0.1, vol = 0.06, delay = 0 }) {
  const t0 = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function play(scene, fn) {
  const ctx = ctxOf(scene);
  if (ctx) fn(ctx);
}

export const sfx = {
  whistle: (s, times = 1) =>
    play(s, (c) => {
      for (let i = 0; i < times; i++) {
        tone(c, { freq: 2700, to: 2500, dur: 0.22, vol: 0.05, delay: i * 0.32 });
        tone(c, { freq: 2900, to: 2750, dur: 0.22, vol: 0.03, delay: i * 0.32 + 0.02 });
      }
    }),
  kick: (s) => play(s, (c) => tone(c, { freq: 180, to: 60, type: 'sine', dur: 0.12, vol: 0.2 })),
  tackle: (s) => play(s, (c) => tone(c, { freq: 400, to: 90, type: 'sawtooth', dur: 0.25, vol: 0.06 })),
  gain: (s) => play(s, (c) => tone(c, { freq: 660, to: 990, dur: 0.09, vol: 0.04 })),
  loss: (s) => play(s, (c) => tone(c, { freq: 300, to: 150, dur: 0.2, vol: 0.05 })),
  card: (s) => play(s, (c) => tone(c, { freq: 880, dur: 0.08, vol: 0.05 })),
  stamp: (s) => play(s, (c) => tone(c, { freq: 120, to: 40, type: 'sine', dur: 0.3, vol: 0.35 })),
  bark: (s) =>
    play(s, (c) => {
      tone(c, { freq: 420, to: 260, type: 'sawtooth', dur: 0.09, vol: 0.05 });
      tone(c, { freq: 420, to: 260, type: 'sawtooth', dur: 0.09, vol: 0.05, delay: 0.14 });
    }),
  alarm: (s) =>
    play(s, (c) => {
      for (let i = 0; i < 6; i++) tone(c, { freq: i % 2 ? 900 : 1300, dur: 0.14, vol: 0.03, delay: i * 0.15 });
    }),
  select: (s) => play(s, (c) => tone(c, { freq: 520, dur: 0.05, vol: 0.04 })),
};
