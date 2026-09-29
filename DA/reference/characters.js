(function (root) {
var INK = '#151515', PAPER = '#EDE5D3', WH = '#FFFFFF', RED = '#E1341E', BLUE = '#2446B0', YEL = '#F2C94C', GRN = '#7E9B45', MUD = '#9C7A4E', SAL = '#F0A28A', NAVY = '#1D2747', ORA = '#EC7A2E', GKG = '#3F5A26', GREY = '#8A8A8A', PASTIS = '#F4E7A8', METAL = '#C9C2B2';
function hx(c) { c = c.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(c.substr(i, 2), 16); }); }
function mix(a, b, t) { var A = hx(a), B = hx(b); return '#' + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0'); }).join(''); }
function sh(c, t) { return mix(c, INK, t == null ? .22 : t); }
function ti(c, t) { return mix(c, WH, t == null ? .25 : t); }
function r(n) { return Math.round(n * 10) / 10; }

var CHARS = {
  kevin: { skin: '#F3CBA8', hair: '#F2C94C', hs: 'kevin', brow: '#C9A032', bt: 5, head: { w: 50, h: 64, s: .6, o: -.05, bw: .8 }, nose: 'pointu', browN: 'fier', mouth: { neutre: 'mini' }, body: { W: 90, Bl: 0, g: 'maillot', kit: BLUE, trim: WH }, acc: [], top: { hs: 'quiff' }, seed: 3 },
  jordan: { skin: '#7A4A2E', hair: INK, hs: 'rase', brow: INK, bt: 7, head: { w: 62, h: 64, s: .8, o: .12, tw: 1.05 }, nose: 'large', eyeN: 'mi', mouth: { gueule: 'serre' }, body: { W: 116, Bl: 4, nk: 30, g: 'maillot', kit: BLUE, trim: WH }, acc: [], top: { hs: 'rase', bw: 1.22 }, seed: 5 },
  dylan: { skin: '#D9A27E', hair: '#2A1E16', hs: 'quiff', brow: '#2A1E16', bt: 5.5, head: { w: 50, h: 66, s: .58, o: 0, bw: .85 }, nose: 'fin', eyeN: 'mi', cernes: true, stubble: '#2A1E16', mouth: { neutre: 'smirk' }, body: { W: 92, g: 'maillot', kit: BLUE, trim: WH }, acc: ['chaine'], top: { hs: 'quiff' }, seed: 8 },
  matheo: { skin: '#F6D2B4', hair: '#D9602B', hs: 'boucles', brow: '#B04A1E', bt: 5, head: { w: 56, h: 60, s: .56, o: .18, bw: 1.05 }, nose: 'fin', freckles: true, blush: true, mouth: { neutre: 'mini' }, body: { W: 88, Bl: 10, g: 'maillot', kit: BLUE, trim: WH }, acc: [], top: { hs: 'boucles', feet: YEL, belly: .3 }, seed: 11 },
  gege: { skin: '#E9B794', hair: '#B9B2A4', hs: 'gris_court', must: 'grosse', mc: '#9E978A', brow: '#8E877A', bt: 7, head: { w: 62, h: 62, s: .66, o: .3, bw: 1.1 }, ey: .1, nose: 'patate', noseC: '#D9826A', blush: true, body: { W: 96, Bl: 24, g: 'maillot', kit: BLUE, trim: WH }, acc: ['bob'], top: { hs: 'bob', belly: 1, bw: 1.1 }, seed: 14 },
  coach: { skin: '#E9B794', hair: '#B9B2A4', hs: 'gris_court', must: 'grosse', mc: '#A8A194', brow: '#8E877A', bt: 7, head: { w: 58, h: 62, s: .62, o: .2 }, ey: .14, nose: 'patate', noseC: '#DE9272', body: { W: 112, Bl: 12, g: 'survet', kit: NAVY, trim: WH }, acc: ['casquette', 'sifflet', 'telephone'], top: { hs: 'casquette', long: true, bw: 1.15, belly: .5, x: ['phone'] }, seed: 17 },
  president: { skin: '#F0BE9A', hair: '#9A8B78', hs: 'chauve', brow: '#8A7A68', bt: 6.5, head: { w: 60, h: 66, s: .64, o: .25, bw: 1.05 }, nose: 'patate', noseC: '#D9826A', blush: true, body: { W: 98, Bl: 28, g: 'polo', kit: RED, trim: WH }, acc: ['sacoche', 'ricard'], top: { hs: 'bald', belly: 1.3, bw: 1.1, x: ['ricard'] }, seed: 20 },
  jeanmi: { skin: '#E0AE88', hair: '#B9B2A4', hs: 'gris_court', brow: '#7E776A', bt: 7, stubble: '#8E877A', head: { w: 56, h: 66, s: .66, o: .08 }, nose: 'patate', body: { W: 98, Bl: 16, g: 'maillot', kit: BLUE, trim: WH }, acc: ['bandeau', 'brassard'], top: { hs: 'bandeau', belly: .7, x: ['brassard'] }, seed: 23 },
  fred: { skin: '#EBC09C', hair: '#6B4A2A', hs: 'fred', brow: '#5A3E22', bt: 6, stubble: '#6B4A2A', eyeN: 'mi', head: { w: 54, h: 62, s: .6, o: .1 }, nose: 'fin', body: { W: 100, Bl: 8, g: 'gk', kit: GKG, trim: YEL }, acc: ['gants'], top: { hs: 'fred', long: true, x: ['gants'] }, seed: 26 },
  loiseau: { skin: '#F0C4A2', hair: '#6A6A6A', hs: 'raie', must: 'fine', mc: '#3A3A3A', brow: '#4A4A4A', bt: 5, head: { w: 48, h: 70, s: .55, o: -.1, bw: .8 }, nose: 'long', body: { W: 86, Bl: 12, g: 'polo', kit: INK, trim: WH }, acc: ['carton'], top: { hs: 'raie', x: ['carton'] }, seed: 29 },
  recruteur: { skin: '#D9A27E', hair: INK, hs: 'plaque', brow: INK, bt: 6, head: { w: 54, h: 64, s: .72, o: .05 }, nose: 'fin', mouth: { neutre: 'plat', fier: 'mini', rire: 'mini', gueule: 'serre', choque: 'plat' }, body: { W: 104, g: 'doudoune', kit: INK, trim: GREY, inner: GREY }, acc: ['lunettes', 'carnet'], top: { hs: 'plaque', long: true, x: ['lunettes'] }, seed: 32 },
  lea: { skin: '#F3CBA8', hair: '#E9BE3A', hs: 'long', brow: '#B08A2A', bt: 4.5, head: { w: 48, h: 58, s: .56, o: .05, bw: .8 }, eyeN: 'mi', nose: 'fin', mouth: { neutre: 'mini' }, body: { W: 80, g: 'tee', kit: RED, trim: RED }, acc: ['creoles'], top: { hs: 'long' }, seed: 35 },
  mere: { skin: '#E9B794', hair: '#8A6440', hs: 'carre', brow: '#6A4A2A', bt: 5, blush: true, head: { w: 54, h: 60, s: .6, o: .18 }, nose: 'fin', body: { W: 98, Bl: 12, g: 'cardigan', kit: SAL, trim: PAPER }, acc: ['collier'], top: { hs: 'cap' }, seed: 38 },
  patron: { skin: '#D9A27E', hair: '#3A2A1E', hs: 'court', must: 'grosse', mc: '#3A2A1E', brow: '#2A1E16', bt: 7.5, head: { w: 60, h: 62, s: .8, o: .12 }, nose: 'patate', noseC: '#C9835E', body: { W: 112, Bl: 16, g: 'tee', kit: ORA, trim: ORA, pocket: true }, acc: ['crayon'], top: { hs: 'cap' }, seed: 41 },
  momo: { skin: '#B97A52', hair: INK, hs: 'fade', brow: INK, bt: 7, stubble: INK, stubOp: .7, head: { w: 50, h: 60, s: .7, o: .05 }, nose: 'large', body: { W: 118, Bl: 0, nk: 26, g: 'moulant', kit: INK, trim: INK }, acc: [], top: { hs: 'rase', bw: 1.25 }, seed: 44 },
  reporter: { special: 'reporter', skin: '#E9B794', hair: INK, body: { kit: INK, trim: RED }, seed: 47 },
  kaiser: { special: 'dog', skin: MUD, hair: sh(MUD, .35), body: { kit: RED, trim: YEL }, seed: 50 }
};

var n = 0;

function cutFilter(id, seed, stage) {
  var edge = '<feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="' + seed + '" result="n"/>' +
    '<feDisplacementMap in="d" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="dd"/>' +
    '<feFlood flood-color="#FFFFFF" result="w"/><feComposite in="w" in2="dd" operator="in" result="wb"/>';
  if (stage === 'bord') return '<filter id="' + id + '" x="-12%" y="-10%" width="124%" height="120%" color-interpolation-filters="sRGB">' + edge + '<feMerge><feMergeNode in="wb"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  return '<filter id="' + id + '" x="-12%" y="-10%" width="124%" height="120%" color-interpolation-filters="sRGB">' + edge +
    '<feOffset in="dd" dx="4" dy="5" result="so"/><feFlood flood-color="#151515" flood-opacity=".3"/><feComposite in2="so" operator="in" result="shd"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="' + (seed + 7) + '" result="g"/>' +
    '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 0 0.08  0.55 0 0 0 -0.24" result="ga"/>' +
    '<feComposite in="ga" in2="SourceAlpha" operator="in" result="gr"/>' +
    '<feMerge><feMergeNode in="shd"/><feMergeNode in="wb"/><feMergeNode in="SourceGraphic"/><feMergeNode in="gr"/></feMerge></filter>';
}

function headPath(X) {
  var cx = X.cx, cy = X.cy, w = X.w, h = X.h, H = X.c.head, s = H.s || .6, o = H.o || 0, tw = H.tw || 1, bw = H.bw || 1, ry = cy + h * o, a = h * (1 + o) * s, b = h * (1 - o) * s;
  return 'M' + cx + ',' + (cy - h) + ' C' + (cx + w * s * tw) + ',' + (cy - h) + ' ' + (cx + w) + ',' + (ry - a) + ' ' + (cx + w) + ',' + ry +
    ' C' + (cx + w) + ',' + (ry + b) + ' ' + (cx + w * s * bw) + ',' + (cy + h) + ' ' + cx + ',' + (cy + h) +
    ' C' + (cx - w * s * bw) + ',' + (cy + h) + ' ' + (cx - w) + ',' + (ry + b) + ' ' + (cx - w) + ',' + ry +
    ' C' + (cx - w) + ',' + (ry - a) + ' ' + (cx - w * s * tw) + ',' + (cy - h) + ' ' + cx + ',' + (cy - h) + 'Z';
}

function torso(X, ins, sleeve, swOver) {
  var cx = X.cx, T = X.T, nk = X.nk, sw = swOver || X.sw, bh = X.bh - ins, bw = X.bw2 - ins, bot = X.bot;
  var segs = [[nk + 20, T + 3, sw - 14, T + 8, sw - 2, T + 26]];
  if (sleeve) { segs.push([sw + 1, T + 34, sw + 2, T + 44, sw + 2, T + 54]); segs.push(['L', sw - ins, T + 58]); segs.push([sw - ins, T + 80, bh, 238, bh, 262]); }
  else segs.push([sw + 2, T + 50, bh, 236, bh, 262]);
  segs.push([bh, 284, bw, 294, bw, bot]);
  var s = 'M' + r(cx - nk) + ',' + r(T), pts = [[nk, T]];
  segs.forEach(function (g) {
    if (g[0] === 'L') { s += ' L' + r(cx - g[1]) + ',' + r(g[2]); pts.push([g[1], g[2]]); }
    else { s += ' C' + r(cx - g[0]) + ',' + r(g[1]) + ' ' + r(cx - g[2]) + ',' + r(g[3]) + ' ' + r(cx - g[4]) + ',' + r(g[5]); pts.push([g[4], g[5]]); }
  });
  for (var i = 1; i <= 10; i++) { var x = -bw + 2 * bw * i / 10; s += ' L' + r(cx + x) + ',' + r(bot + ((i * 37) % 5 - 2) * 1.3); }
  for (var k = segs.length - 1; k >= 0; k--) {
    var g = segs[k], p = pts[k];
    if (g[0] === 'L') s += ' L' + r(cx + p[0]) + ',' + r(p[1]);
    else s += ' C' + r(cx + g[2]) + ',' + r(g[3]) + ' ' + r(cx + g[0]) + ',' + r(g[1]) + ' ' + r(cx + p[0]) + ',' + r(p[1]);
  }
  return s + 'Z';
}

function capPath(X, sd, fy, ext) {
  var cx = X.cx, cy = X.cy, w = X.w, h = X.h, yc = cy - h * (1.05 + 0.25 * sd) / 0.75;
  return 'M' + r(cx - w * ext) + ',' + r(cy + h * sd) + ' C' + r(cx - w * (ext + .05)) + ',' + r(yc) + ' ' + r(cx + w * (ext + .05)) + ',' + r(yc) + ' ' + r(cx + w * ext) + ',' + r(cy + h * sd) +
    ' C' + r(cx + w * .88) + ',' + r(cy - h * (fy - .12)) + ' ' + r(cx + w * .5) + ',' + r(cy - h * fy) + ' ' + cx + ',' + r(cy - h * fy) +
    ' C' + r(cx - w * .5) + ',' + r(cy - h * fy) + ' ' + r(cx - w * .88) + ',' + r(cy - h * (fy - .12)) + ' ' + r(cx - w * ext) + ',' + r(cy + h * sd) + 'Z';
}

function hairBack(X) {
  var cx = X.cx, cy = X.cy, w = X.w, h = X.h, hc = sh(X.hc, .12);
  if (X.c.hs === 'long') return '<path fill="' + hc + '" d="M' + (cx - w * 1.12) + ',' + (cy - h * .3) + ' C' + (cx - w * 1.25) + ',' + (cy - h * 1.4) + ' ' + (cx + w * 1.25) + ',' + (cy - h * 1.4) + ' ' + (cx + w * 1.12) + ',' + (cy - h * .3) + ' C' + (cx + w * 1.2) + ',' + (cy + h * .6) + ' ' + (cx + w * 1.3) + ',' + (cy + h * 1.3) + ' ' + (cx + w * 1.35) + ',' + (cy + h * 1.6) + ' L' + (cx - w * 1.35) + ',' + (cy + h * 1.6) + ' C' + (cx - w * 1.3) + ',' + (cy + h * 1.3) + ' ' + (cx - w * 1.2) + ',' + (cy + h * .6) + ' ' + (cx - w * 1.12) + ',' + (cy - h * .3) + 'Z"/>';
  if (X.c.hs === 'carre') {
    var s = '<path fill="' + hc + '" d="M' + (cx - w * 1.15) + ',' + (cy - h * .2) + ' C' + (cx - w * 1.25) + ',' + (cy - h * 1.4) + ' ' + (cx + w * 1.25) + ',' + (cy - h * 1.4) + ' ' + (cx + w * 1.15) + ',' + (cy - h * .2) + ' C' + (cx + w * 1.2) + ',' + (cy + h * .5) + ' ' + (cx + w * 1.1) + ',' + (cy + h * .8) + ' ' + (cx + w * .9) + ',' + (cy + h * .85) + ' L' + (cx - w * .9) + ',' + (cy + h * .85) + ' C' + (cx - w * 1.1) + ',' + (cy + h * .8) + ' ' + (cx - w * 1.2) + ',' + (cy + h * .5) + ' ' + (cx - w * 1.15) + ',' + (cy - h * .2) + 'Z"/>';
    for (var i = 0; i < 6; i++) s += '<circle cx="' + r(cx + (i < 3 ? -1 : 1) * w * (0.95 + (i % 3) * .08)) + '" cy="' + r(cy + h * (.1 + (i % 3) * .3)) + '" r="' + r(w * .2) + '" fill="' + hc + '"/>';
    return s;
  }
  return '';
}

function hairFront(X) {
  var cx = X.cx, cy = X.cy, w = X.w, h = X.h, hc = X.hc, hs = X.c.hs, s = '', i, a;
  var cap = function (sd, fy, ext, col, op) { return '<path d="' + capPath(X, sd, fy, ext) + '" fill="' + (col || hc) + '"' + (op ? ' opacity="' + op + '"' : '') + '/>'; };
  switch (hs) {
    case 'kevin':
      s = cap(-.05, .5, 1.02) + '<path fill="' + hc + '" d="M' + (cx - w * .2) + ',' + (cy - h * .9) + ' C' + (cx + w * .4) + ',' + (cy - h * 1.35) + ' ' + (cx + w * 1.25) + ',' + (cy - h * 1.05) + ' ' + (cx + w * 1.12) + ',' + (cy - h * .35) + ' C' + (cx + w * .9) + ',' + (cy - h * .62) + ' ' + (cx + w * .4) + ',' + (cy - h * .6) + ' ' + (cx - w * .1) + ',' + (cy - h * .42) + ' C' + (cx - w * .3) + ',' + (cy - h * .55) + ' ' + (cx - w * .4) + ',' + (cy - h * .75) + ' ' + (cx - w * .2) + ',' + (cy - h * .9) + 'Z"/>' +
        '<path d="M' + (cx - w * .05) + ',' + (cy - h * .95) + ' C' + (cx + w * .4) + ',' + (cy - h * 1.12) + ' ' + (cx + w * .9) + ',' + (cy - h * .9) + ' ' + (cx + w * .95) + ',' + (cy - h * .55) + '" fill="none" stroke="' + ti(hc, .45) + '" stroke-width="4" stroke-linecap="round"/>';
      break;
    case 'rase':
      s = cap(-.15, .72, .98, hc, .38) + '<ellipse cx="' + (cx - w * .35) + '" cy="' + (cy - h * .72) + '" rx="' + (w * .22) + '" ry="' + (h * .07) + '" fill="#FFFFFF" opacity=".22" transform="rotate(-20 ' + (cx - w * .35) + ' ' + (cy - h * .72) + ')"/>';
      break;
    case 'quiff':
      s = cap(.05, .55, 1.02) + '<path fill="' + hc + '" d="M' + (cx - w * .8) + ',' + (cy - h * .6) + ' C' + (cx - w * .7) + ',' + (cy - h * 1.5) + ' ' + (cx + w * .5) + ',' + (cy - h * 1.6) + ' ' + (cx + w * .95) + ',' + (cy - h * 1.05) + ' C' + (cx + w * 1.05) + ',' + (cy - h * .85) + ' ' + (cx + w * .8) + ',' + (cy - h * .7) + ' ' + (cx + w * .5) + ',' + (cy - h * .62) + ' C' + cx + ',' + (cy - h * .8) + ' ' + (cx - w * .4) + ',' + (cy - h * .62) + ' ' + (cx - w * .8) + ',' + (cy - h * .6) + 'Z"/>' +
        '<rect x="' + (cx - w * .99) + '" y="' + (cy - h * .15) + '" width="' + (w * .1) + '" height="' + (h * .38) + '" fill="' + hc + '"/><rect x="' + (cx + w * .89) + '" y="' + (cy - h * .15) + '" width="' + (w * .1) + '" height="' + (h * .38) + '" fill="' + hc + '"/>' +
        '<path d="M' + (cx - w * .5) + ',' + (cy - h * 1.05) + ' C' + (cx - w * .1) + ',' + (cy - h * 1.35) + ' ' + (cx + w * .5) + ',' + (cy - h * 1.3) + ' ' + (cx + w * .75) + ',' + (cy - h * 1.05) + '" fill="none" stroke="' + ti(hc, .3) + '" stroke-width="3.5" stroke-linecap="round"/>';
      break;
    case 'boucles':
      s = cap(0, .5, 1.02);
      for (i = 0; i < 9; i++) { a = (190 + i * 20) * Math.PI / 180; s += '<circle cx="' + r(cx + Math.cos(a) * w * .92) + '" cy="' + r(cy - h * .2 + Math.sin(a) * h * .88) + '" r="' + r(w * .22) + '" fill="' + hc + '"/>'; }
      [-.4, 0, .4].forEach(function (k) { s += '<circle cx="' + r(cx + w * k) + '" cy="' + r(cy - h * (k === 0 ? .55 : .5)) + '" r="' + r(w * .18) + '" fill="' + hc + '"/>'; });
      break;
    case 'chauve':
      s = '<ellipse cx="' + (cx - w * .95) + '" cy="' + (cy - h * .12) + '" rx="' + (w * .15) + '" ry="' + (h * .2) + '" fill="' + hc + '"/><ellipse cx="' + (cx + w * .95) + '" cy="' + (cy - h * .12) + '" rx="' + (w * .15) + '" ry="' + (h * .2) + '" fill="' + hc + '"/>' +
        '<ellipse cx="' + (cx - w * .32) + '" cy="' + (cy - h * .72) + '" rx="' + (w * .22) + '" ry="' + (h * .08) + '" fill="#FFFFFF" opacity=".45" transform="rotate(-18 ' + (cx - w * .32) + ' ' + (cy - h * .72) + ')"/>';
      break;
    case 'gris_court':
      s = cap(-.1, .62, 1.0);
      [-.55, -.2, .15, .5].forEach(function (k) { s += '<circle cx="' + r(cx + w * k) + '" cy="' + r(cy - h * .6) + '" r="' + r(w * .13) + '" fill="' + hc + '"/>'; });
      break;
    case 'fred':
      s = cap(0, .55, 1.02);
      for (i = 0; i < 7; i++) {
        a = (200 + i * 23.3) * Math.PI / 180; var bx = cx + Math.cos(a) * w * .92, by = cy - h * .25 + Math.sin(a) * h * .98, dx = Math.cos(a + .35 * (i % 2 ? 1 : -1)), dy = Math.sin(a + .35 * (i % 2 ? 1 : -1)), px = -Math.sin(a) * w * .16, py = Math.cos(a) * w * .16;
        s += '<path d="M' + r(bx - px) + ',' + r(by - py) + ' L' + r(bx + dx * h * .3) + ',' + r(by + dy * h * .3) + ' L' + r(bx + px) + ',' + r(by + py) + 'Z" fill="' + hc + '"/>';
      }
      break;
    case 'raie':
      s = cap(-.05, .72, 1.0) + '<path d="M' + (cx - w * .35) + ',' + (cy - h * .98) + ' Q' + (cx - w * .42) + ',' + (cy - h * .82) + ' ' + (cx - w * .5) + ',' + (cy - h * .66) + '" fill="none" stroke="' + ti(X.skin, .1) + '" stroke-width="2.5"/>' +
        '<path d="M' + (cx - w * .25) + ',' + (cy - h * .95) + ' C' + (cx + w * .2) + ',' + (cy - h * 1.05) + ' ' + (cx + w * .7) + ',' + (cy - h * .9) + ' ' + (cx + w * .9) + ',' + (cy - h * .5) + '" fill="none" stroke="' + ti(hc, .25) + '" stroke-width="2.5"/>';
      break;
    case 'plaque':
      s = cap(-.05, .75, 1.0);
      [.1, .35, .6].forEach(function (k) { s += '<path d="M' + r(cx - w * (.5 - k)) + ',' + r(cy - h * .8) + ' C' + r(cx - w * (.4 - k)) + ',' + r(cy - h * 1.0) + ' ' + r(cx + w * k * .4) + ',' + r(cy - h * 1.05) + ' ' + r(cx + w * (k * .6)) + ',' + r(cy - h * 1.02) + '" fill="none" stroke="' + ti(hc, .35) + '" stroke-width="3" stroke-linecap="round"/>'; });
      break;
    case 'long':
      s = cap(.25, .45, 1.04) + '<path fill="' + hc + '" d="M' + (cx - w * .9) + ',' + (cy - h * .35) + ' C' + (cx - w * .6) + ',' + (cy - h * 1.1) + ' ' + (cx + w * .8) + ',' + (cy - h * 1.1) + ' ' + (cx + w * 1.0) + ',' + (cy - h * .2) + ' C' + (cx + w * .5) + ',' + (cy - h * .55) + ' ' + (cx - w * .2) + ',' + (cy - h * .6) + ' ' + (cx - w * .9) + ',' + (cy - h * .35) + 'Z"/>';
      break;
    case 'carre':
      s = cap(.1, .5, 1.04);
      [-.6, -.2, .2, .6].forEach(function (k) { s += '<circle cx="' + r(cx + w * k) + '" cy="' + r(cy - h * .52) + '" r="' + r(w * .16) + '" fill="' + hc + '"/>'; });
      break;
    case 'court': s = cap(0, .62, 1.0); break;
    case 'fade': s = cap(.08, .66, 1.0, hc, .35) + cap(-.2, .68, .92); break;
  }
  return s;
}

function eye(x, y, side, kind) {
  switch (kind) {
    case 'mi': return '<path d="M' + (x - 6.5) + ',' + (y - 1) + ' Q' + x + ',' + (y + 8) + ' ' + (x + 6.5) + ',' + (y - 1) + 'Z" fill="' + INK + '"/><path d="M' + (x - 8) + ',' + (y - 1.5) + ' L' + (x + 8) + ',' + (y - 1.5) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
    case 'petit': return '<ellipse cx="' + x + '" cy="' + (y + 1) + '" rx="3.8" ry="4.4" fill="' + INK + '"/>';
    case 'grand': return '<circle cx="' + x + '" cy="' + y + '" r="10.5" fill="' + WH + '"/><circle cx="' + (x - side) + '" cy="' + (y + 1) + '" r="3" fill="' + INK + '"/>';
    case 'rire': return '<path d="M' + (x - 7.5) + ',' + (y + 3) + ' Q' + x + ',' + (y - 7) + ' ' + (x + 7.5) + ',' + (y + 3) + '" fill="none" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round"/><path d="M' + (x + side * 11) + ',' + (y + 5) + ' q3,6 0,9 q-3,-3 0,-9Z" fill="' + BLUE + '"/>';
    default: return '<ellipse cx="' + x + '" cy="' + y + '" rx="4.6" ry="6.2" fill="' + INK + '"/><circle cx="' + (x - 1.5) + '" cy="' + (y - 2.2) + '" r="1.4" fill="' + WH + '"/>';
  }
}
function browsFor(e, c) {
  var k = e === 'neutre' && c.browN ? c.browN : e;
  return function (side) {
    switch (k) {
      case 'fier': return side < 0 ? [-6, -side * 10, 0] : [1, -side * 4, 0];
      case 'gueule': return [3, -side * 24, -side * 2];
      case 'choque': return [-9, side * 8, 0];
      case 'rire': return [-6, side * 6, 0];
      default: return [0, 0, 0];
    }
  };
}
function brows(X, e) {
  var c = X.c, bt = c.bt || 6, L = 18, col = c.brow || sh(X.hc, .3), f = browsFor(e, c), s = '';
  [-1, 1].forEach(function (side) { var v = f(side), bx = X.cx + side * X.ex + v[2], by = X.browY + v[0]; s += '<rect x="' + (bx - L / 2) + '" y="' + (by - bt / 2) + '" width="' + L + '" height="' + bt + '" rx="' + (bt / 2) + '" fill="' + col + '" transform="rotate(' + v[1] + ' ' + bx + ' ' + by + ')"/>'; });
  return s;
}
function mouth(X, kind) {
  var mx = X.cx + (X.c.mx || 0), my = X.mY, mw = X.mw, st = ' fill="none" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round"';
  switch (kind) {
    case 'plat': return '<path d="M' + (mx - mw * .42) + ',' + my + ' Q' + mx + ',' + (my + 3) + ' ' + (mx + mw * .42) + ',' + (my - 1) + '"' + st + '/>';
    case 'smirk': return '<path d="M' + (mx - mw * .45) + ',' + (my + 1) + ' Q' + (mx + mw * .05) + ',' + (my + 7) + ' ' + (mx + mw * .5) + ',' + (my - 7) + '"' + st + '/><path d="M' + (mx + mw * .56) + ',' + (my - 10) + ' l2,4"' + st.replace('3.6', '2.4') + '/>';
    case 'mini': return '<path d="M' + (mx - mw * .35) + ',' + my + ' L' + (mx + mw * .28) + ',' + my + ' Q' + (mx + mw * .4) + ',' + my + ' ' + (mx + mw * .44) + ',' + (my - 3.5) + '"' + st + '/>';
    case 'hurle': return '<path d="M' + (mx - mw * .62) + ',' + (my - 6) + ' Q' + mx + ',' + (my - 13) + ' ' + (mx + mw * .62) + ',' + (my - 6) + ' L' + (mx + mw * .42) + ',' + (my + 24) + ' Q' + mx + ',' + (my + 32) + ' ' + (mx - mw * .42) + ',' + (my + 24) + 'Z" fill="' + INK + '"/>' +
      '<path d="M' + (mx - mw * .52) + ',' + (my - 7) + ' Q' + mx + ',' + (my - 12.5) + ' ' + (mx + mw * .52) + ',' + (my - 7) + ' L' + (mx + mw * .49) + ',' + (my - 1.5) + ' Q' + mx + ',' + (my - 6.5) + ' ' + (mx - mw * .49) + ',' + (my - 1.5) + 'Z" fill="' + WH + '"/><ellipse cx="' + mx + '" cy="' + (my + 22) + '" rx="' + (mw * .28) + '" ry="6" fill="' + RED + '"/>';
    case 'o': return '<ellipse cx="' + mx + '" cy="' + (my + 5) + '" rx="' + (mw * .2) + '" ry="11" fill="' + INK + '"/><ellipse cx="' + mx + '" cy="' + (my + 11) + '" rx="' + (mw * .12) + '" ry="4" fill="' + RED + '"/>';
    case 'rire': return '<path d="M' + (mx - mw * .62) + ',' + (my - 3) + ' Q' + mx + ',' + (my + 1) + ' ' + (mx + mw * .62) + ',' + (my - 3) + ' Q' + (mx + mw * .5) + ',' + (my + 26) + ' ' + mx + ',' + (my + 27) + ' Q' + (mx - mw * .5) + ',' + (my + 26) + ' ' + (mx - mw * .62) + ',' + (my - 3) + 'Z" fill="' + INK + '"/>' +
      '<path d="M' + (mx - mw * .55) + ',' + (my - 2) + ' Q' + mx + ',' + (my + 2) + ' ' + (mx + mw * .55) + ',' + (my - 2) + ' L' + (mx + mw * .5) + ',' + (my + 4) + ' Q' + mx + ',' + (my + 8) + ' ' + (mx - mw * .5) + ',' + (my + 4) + 'Z" fill="' + WH + '"/><ellipse cx="' + mx + '" cy="' + (my + 19) + '" rx="' + (mw * .3) + '" ry="6" fill="' + RED + '"/>';
    case 'serre':
      var s = '<rect x="' + (mx - mw * .45) + '" y="' + (my - 6) + '" width="' + (mw * .9) + '" height="13" rx="4" fill="' + INK + '"/><rect x="' + (mx - mw * .4) + '" y="' + (my - 3.5) + '" width="' + (mw * .8) + '" height="8" rx="2" fill="' + WH + '"/><path d="M' + (mx - mw * .4) + ',' + (my + .5) + ' H' + (mx + mw * .4);
      for (var i = 1; i < 5; i++) s += ' M' + r(mx - mw * .4 + mw * .8 * i / 5) + ',' + (my - 3.5) + ' V' + (my + 4.5);
      return s + '" stroke="' + INK + '" stroke-width="1.6"/>';
  }
  return '';
}
function nose(X) {
  var cx = X.cx, y = X.noseY, w = X.w, h = X.h, sk = X.skin, nc = X.c.noseC || sh(sk, .14);
  switch (X.c.nose) {
    case 'patate': return '<ellipse cx="' + (cx + 3) + '" cy="' + y + '" rx="' + (w * .22) + '" ry="' + (h * .15) + '" fill="' + nc + '"/><ellipse cx="' + (cx + 3 + w * .09) + '" cy="' + (y + 2) + '" rx="' + (w * .1) + '" ry="' + (h * .09) + '" fill="' + INK + '" opacity=".1"/>';
    case 'pointu': case 'long':
      var k = X.c.nose === 'long' ? 1.35 : 1;
      return '<path d="M' + (cx - 2) + ',' + (y - h * .22 * k) + ' Q' + (cx + w * .3 * k) + ',' + (y + h * .05) + ' ' + (cx + w * .2 * k) + ',' + (y + h * .12 * k) + ' Q' + (cx + 4) + ',' + (y + h * .16 * k) + ' ' + (cx - 6) + ',' + (y + h * .1) + 'Z" fill="' + nc + '"/>';
    case 'large': return '<ellipse cx="' + cx + '" cy="' + (y + 3) + '" rx="' + (w * .22) + '" ry="' + (h * .11) + '" fill="' + sh(sk, .2) + '"/><ellipse cx="' + (cx - w * .08) + '" cy="' + (y + 6) + '" rx="2.6" ry="1.8" fill="' + INK + '" opacity=".5"/><ellipse cx="' + (cx + w * .08) + '" cy="' + (y + 6) + '" rx="2.6" ry="1.8" fill="' + INK + '" opacity=".5"/>';
    default: return '<ellipse cx="' + (cx + 2) + '" cy="' + (y + 2) + '" rx="' + (w * .1) + '" ry="' + (h * .1) + '" fill="' + nc + '"/>';
  }
}
function must(X, e) {
  var t = X.c.must; if (!t) return '';
  var mx = X.cx, mw = X.mw, col = X.c.mc || X.hc, dy = e === 'gueule' ? -4 : (e === 'rire' || e === 'choque') ? -2 : 0, y;
  if (t === 'grosse') {
    y = X.mY - 7 + dy; mw *= 1.08;
    return '<path fill="' + col + '" d="M' + mx + ',' + (y - 7) + ' C' + (mx - 8) + ',' + (y - 13) + ' ' + (mx - mw * .64) + ',' + (y - 10) + ' ' + (mx - mw * .74) + ',' + (y + 9) + ' C' + (mx - mw * .5) + ',' + (y + 4) + ' ' + (mx - mw * .25) + ',' + (y + 6) + ' ' + mx + ',' + (y + 1) + ' C' + (mx + mw * .25) + ',' + (y + 6) + ' ' + (mx + mw * .5) + ',' + (y + 4) + ' ' + (mx + mw * .74) + ',' + (y + 9) + ' C' + (mx + mw * .64) + ',' + (y - 10) + ' ' + (mx + 8) + ',' + (y - 13) + ' ' + mx + ',' + (y - 7) + 'Z"/>';
  }
  y = X.mY - 6 + dy;
  return '<path fill="' + col + '" d="M' + mx + ',' + y + ' C' + (mx - 10) + ',' + (y - 5) + ' ' + (mx - mw * .5) + ',' + (y - 4) + ' ' + (mx - mw * .62) + ',' + (y + 2) + ' C' + (mx - mw * .4) + ',' + y + ' ' + (mx - 10) + ',' + (y + 2) + ' ' + mx + ',' + (y + 3) + ' C' + (mx + 10) + ',' + (y + 2) + ' ' + (mx + mw * .4) + ',' + y + ' ' + (mx + mw * .62) + ',' + (y + 2) + ' C' + (mx + mw * .5) + ',' + (y - 4) + ' ' + (mx + 10) + ',' + (y - 5) + ' ' + mx + ',' + y + 'Z"/>';
}
function hand(x, y, sk, rot) { return '<g transform="translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')"><ellipse cx="0" cy="0" rx="16" ry="13" fill="' + sk + '"/><ellipse cx="-13" cy="-7" rx="6" ry="8.5" fill="' + sk + '"/><path d="M-4,-6 h14 M-2,1 h13" stroke="' + sh(sk, .18) + '" stroke-width="2" stroke-linecap="round"/></g>'; }

function garment(X, u) {
  var B = X.c.body, cx = X.cx, T = X.T, sw = X.sw, kit = X.kit, trim = X.trim, sk = X.skin, s = '', d = '';
  var full = torso(X, 0, false), short = torso(X, 16, true);
  var hem = '<path d="M' + (cx - sw - 2) + ',' + (T + 54) + ' L' + (cx - sw + 16) + ',' + (T + 58) + ' M' + (cx + sw + 2) + ',' + (T + 54) + ' L' + (cx + sw - 16) + ',' + (T + 58) + '" stroke="' + trim + '" stroke-width="4"/>';
  var ronde = '<path d="M' + (cx - 22) + ',' + (T - 3) + ' Q' + cx + ',' + (T + 16) + ' ' + (cx + 22) + ',' + (T - 3) + 'Z" fill="' + sk + '"/><path d="M' + (cx - 23) + ',' + (T - 3) + ' Q' + cx + ',' + (T + 17) + ' ' + (cx + 23) + ',' + (T - 3) + '" fill="none" stroke="' + sh(kit, .25) + '" stroke-width="4.5"/>';
  switch (B.g) {
    case 'maillot':
      s = '<path d="' + short + '" fill="' + kit + '"/>' + hem +
        '<path d="M' + (cx - 25) + ',' + (T - 3) + ' L' + cx + ',' + (T + 28) + ' L' + (cx + 25) + ',' + (T - 3) + 'Z" fill="' + trim + '"/><path d="M' + (cx - 17) + ',' + (T - 3) + ' L' + cx + ',' + (T + 18) + ' L' + (cx + 17) + ',' + (T - 3) + 'Z" fill="' + sk + '"/>' +
        '<path d="M' + (cx + 34) + ',' + (T + 34) + ' h17 v11 q0,9 -8.5,12 q-8.5,-3 -8.5,-12Z" fill="' + trim + '"/><path d="M' + (cx + 40) + ',' + (T + 36) + ' v19" stroke="' + kit + '" stroke-width="4"/>';
      break;
    case 'polo':
      s = '<path d="' + short + '" fill="' + kit + '"/>' + hem +
        '<rect x="' + (cx - 5) + '" y="' + (T + 6) + '" width="10" height="38" fill="' + sh(kit, .12) + '"/><circle cx="' + cx + '" cy="' + (T + 20) + '" r="2.4" fill="' + trim + '"/><circle cx="' + cx + '" cy="' + (T + 33) + '" r="2.4" fill="' + trim + '"/>' +
        '<path d="M' + (cx - 11) + ',' + (T - 4) + ' L' + cx + ',' + (T + 12) + ' L' + (cx + 11) + ',' + (T - 4) + 'Z" fill="' + sk + '"/>' +
        '<path d="M' + (cx - 30) + ',' + (T - 6) + ' L' + (cx - 3) + ',' + (T + 14) + ' L' + (cx - 16) + ',' + (T + 24) + ' L' + (cx - 36) + ',' + (T + 4) + 'Z M' + (cx + 30) + ',' + (T - 6) + ' L' + (cx + 3) + ',' + (T + 14) + ' L' + (cx + 16) + ',' + (T + 24) + ' L' + (cx + 36) + ',' + (T + 4) + 'Z" fill="' + trim + '"/>';
      break;
    case 'tee':
      s = '<path d="' + short + '" fill="' + kit + '"/>' + ronde + (B.pocket ? '<rect x="' + (cx + 24) + '" y="' + (T + 34) + '" width="24" height="22" fill="' + sh(kit, .14) + '"/>' : '');
      break;
    case 'moulant':
      s = '<path d="' + torso(X, 20, true) + '" fill="' + kit + '"/>' + ronde.replace(sh(kit, .25), ti(kit, .18)) +
        '<path d="M' + (cx - 46) + ',' + (T + 46) + ' Q' + (cx - 22) + ',' + (T + 60) + ' ' + (cx - 4) + ',' + (T + 44) + ' M' + (cx + 46) + ',' + (T + 46) + ' Q' + (cx + 22) + ',' + (T + 60) + ' ' + (cx + 4) + ',' + (T + 44) + ' M' + cx + ',' + (T + 70) + ' v40" fill="none" stroke="' + ti(kit, .2) + '" stroke-width="3" stroke-linecap="round"/>';
      break;
    case 'survet':
      s = '<path d="' + full + '" fill="' + kit + '"/>' +
        '<path d="M' + (cx - sw + 22) + ',' + (T + 6) + ' C' + (cx - sw + 6) + ',' + (T + 20) + ' ' + (cx - sw - 4) + ',' + (T + 60) + ' ' + (cx - X.bh + 4) + ',' + 262 + ' M' + (cx - sw + 32) + ',' + (T + 8) + ' C' + (cx - sw + 16) + ',' + (T + 22) + ' ' + (cx - sw + 6) + ',' + (T + 62) + ' ' + (cx - X.bh + 14) + ',' + 266 +
        ' M' + (cx + sw - 22) + ',' + (T + 6) + ' C' + (cx + sw - 6) + ',' + (T + 20) + ' ' + (cx + sw + 4) + ',' + (T + 60) + ' ' + (cx + X.bh - 4) + ',' + 262 + ' M' + (cx + sw - 32) + ',' + (T + 8) + ' C' + (cx + sw - 16) + ',' + (T + 22) + ' ' + (cx + sw - 6) + ',' + (T + 62) + ' ' + (cx + X.bh - 14) + ',' + 266 + '" fill="none" stroke="' + trim + '" stroke-width="4"/>' +
        '<path d="M' + cx + ',' + (T + 8) + ' V' + 310 + '" stroke="' + ti(kit, .3) + '" stroke-width="2.5"/><rect x="' + (cx - 3) + '" y="' + (T + 12) + '" width="6" height="12" rx="2" fill="' + METAL + '"/>' +
        '<path d="M' + (cx - 32) + ',' + (T - 12) + ' Q' + cx + ',' + (T - 4) + ' ' + (cx + 32) + ',' + (T - 12) + ' L' + (cx + 30) + ',' + (T + 4) + ' Q' + cx + ',' + (T + 12) + ' ' + (cx - 30) + ',' + (T + 4) + 'Z" fill="' + sh(kit, .15) + '"/>';
      break;
    case 'doudoune':
      var vest = torso(X, 20, false, sw - 24);
      d = '<clipPath id="' + u + 'v"><path d="' + vest + '"/></clipPath>';
      s = '<path d="' + full + '" fill="' + B.inner + '"/><path d="M' + (cx - X.nk - 20) + ',' + (T + 2) + ' Q' + cx + ',' + (T + 30) + ' ' + (cx + X.nk + 20) + ',' + (T + 2) + ' Q' + cx + ',' + (T - 12) + ' ' + (cx - X.nk - 20) + ',' + (T + 2) + 'Z" fill="' + sh(B.inner, .2) + '"/>' +
        '<path d="' + vest + '" fill="' + kit + '"/><g clip-path="url(#' + u + 'v)" fill="none" stroke="' + ti(kit, .16) + '" stroke-width="2.5"><path d="M0,' + (T + 40) + ' Q120,' + (T + 48) + ' 240,' + (T + 40) + ' M0,' + (T + 72) + ' Q120,' + (T + 80) + ' 240,' + (T + 72) + ' M0,' + (T + 104) + ' Q120,' + (T + 112) + ' 240,' + (T + 104) + ' M0,' + (T + 136) + ' Q120,' + (T + 144) + ' 240,' + (T + 136) + '"/><path d="M' + cx + ',' + (T + 14) + ' V320" stroke="' + METAL + '"/></g>';
      break;
    case 'cardigan':
      s = '<path d="' + full + '" fill="' + kit + '"/><path d="M' + (cx - 30) + ',' + (T - 2) + ' L' + (cx - 10) + ',320 L' + (cx + 10) + ',320 L' + (cx + 30) + ',' + (T - 2) + 'Z" fill="' + trim + '"/><path d="M' + (cx - 20) + ',' + (T - 2) + ' Q' + cx + ',' + (T + 10) + ' ' + (cx + 20) + ',' + (T - 2) + 'Z" fill="' + sk + '"/>' +
        '<circle cx="' + (cx + 14) + '" cy="' + (T + 70) + '" r="3" fill="' + sh(kit, .3) + '"/><circle cx="' + (cx + 12) + '" cy="' + (T + 100) + '" r="3" fill="' + sh(kit, .3) + '"/><circle cx="' + (cx + 11) + '" cy="' + (T + 128) + '" r="3" fill="' + sh(kit, .3) + '"/>';
      break;
    case 'gk':
      s = '<path d="' + full + '" fill="' + kit + '"/><path d="M' + (cx - X.bh) + ',' + (T + 80) + ' L' + (cx + X.bh) + ',' + (T + 40) + ' L' + (cx + X.bh) + ',' + (T + 58) + ' L' + (cx - X.bh) + ',' + (T + 98) + 'Z" fill="' + trim + '"/>' + ronde.replace(sh(kit, .25), trim);
      break;
  }
  return { s: s, d: d };
}

function accessories(X) {
  var cx = X.cx, cy = X.cy, w = X.w, h = X.h, T = X.T, sw = X.sw, bh = X.bh, sk = X.skin, s = '';
  (X.c.acc || []).forEach(function (a) {
    switch (a) {
      case 'sifflet': s += '<path d="M' + (cx - X.nk + 4) + ',' + (T + 2) + ' Q' + (cx - 8) + ',' + (T + 48) + ' ' + (cx + 4) + ',' + (T + 56) + ' M' + (cx + X.nk - 4) + ',' + (T + 2) + ' Q' + (cx + 12) + ',' + (T + 40) + ' ' + (cx + 4) + ',' + (T + 56) + '" fill="none" stroke="' + RED + '" stroke-width="3"/><g transform="translate(' + (cx + 4) + ',' + (T + 62) + ') rotate(-20)"><rect x="-12" y="-6" width="24" height="12" rx="6" fill="' + METAL + '"/><rect x="6" y="-8" width="11" height="7" rx="2" fill="' + METAL + '"/><circle cx="-4" cy="0" r="2.5" fill="' + INK + '"/></g>'; break;
      case 'chaine': s += '<path d="M' + (cx - X.nk - 2) + ',' + (T + 4) + ' Q' + cx + ',' + (T + 40) + ' ' + (cx + X.nk + 2) + ',' + (T + 4) + '" fill="none" stroke="' + YEL + '" stroke-width="4.5" stroke-dasharray="5 2.5" stroke-linecap="round"/><circle cx="' + cx + '" cy="' + (T + 27) + '" r="6" fill="' + YEL + '"/>'; break;
      case 'bandeau': s += '<path d="M' + (cx - w * 1.01) + ',' + (cy - h * .42) + ' Q' + cx + ',' + (cy - h * .66) + ' ' + (cx + w * 1.01) + ',' + (cy - h * .42) + ' L' + (cx + w * 1.0) + ',' + (cy - h * .22) + ' Q' + cx + ',' + (cy - h * .46) + ' ' + (cx - w * 1.0) + ',' + (cy - h * .22) + 'Z" fill="' + WH + '"/><path d="M' + (cx - w * .9) + ',' + (cy - h * .3) + ' Q' + cx + ',' + (cy - h * .52) + ' ' + (cx + w * .9) + ',' + (cy - h * .3) + '" fill="none" stroke="#D8D2C4" stroke-width="2" stroke-dasharray="3 3"/>'; break;
      case 'brassard': s += '<rect x="' + (cx + sw - 17) + '" y="' + (T + 60) + '" width="20" height="12" fill="' + YEL + '" transform="rotate(6 ' + (cx + sw - 7) + ' ' + (T + 66) + ')"/>'; break;
      case 'bob': s += '<path d="M' + (cx - w * .88) + ',' + (cy - h * .4) + ' C' + (cx - w * .84) + ',' + (cy - h * 1.3) + ' ' + (cx + w * .84) + ',' + (cy - h * 1.3) + ' ' + (cx + w * .88) + ',' + (cy - h * .4) + 'Z" fill="' + YEL + '"/><path d="M' + (cx - w * .88) + ',' + (cy - h * .42) + ' Q' + cx + ',' + (cy - h * .58) + ' ' + (cx + w * .88) + ',' + (cy - h * .42) + ' L' + (cx + w * .86) + ',' + (cy - h * .6) + ' Q' + cx + ',' + (cy - h * .76) + ' ' + (cx - w * .86) + ',' + (cy - h * .6) + 'Z" fill="' + BLUE + '"/><path d="M' + (cx - w * 1.32) + ',' + (cy - h * .28) + ' Q' + cx + ',' + (cy - h * .62) + ' ' + (cx + w * 1.32) + ',' + (cy - h * .28) + ' Q' + cx + ',' + (cy - h * .1) + ' ' + (cx - w * 1.32) + ',' + (cy - h * .28) + 'Z" fill="' + sh(YEL, .1) + '"/>'; break;
      case 'casquette': s += '<path d="M' + (cx - w * .96) + ',' + (cy - h * .35) + ' C' + (cx - w * .96) + ',' + (cy - h * 1.36) + ' ' + (cx + w * .96) + ',' + (cy - h * 1.36) + ' ' + (cx + w * .96) + ',' + (cy - h * .35) + ' Q' + cx + ',' + (cy - h * .5) + ' ' + (cx - w * .96) + ',' + (cy - h * .35) + 'Z" fill="' + X.kit + '"/><path d="M' + (cx - w * .96) + ',' + (cy - h * .38) + ' Q' + (cx - w * .1) + ',' + (cy - h * .56) + ' ' + (cx + w * 1.38) + ',' + (cy - h * .42) + ' Q' + (cx + w * 1.22) + ',' + (cy - h * .22) + ' ' + (cx + w * .3) + ',' + (cy - h * .22) + ' Q' + (cx - w * .5) + ',' + (cy - h * .24) + ' ' + (cx - w * .96) + ',' + (cy - h * .38) + 'Z" fill="' + sh(X.kit, .35) + '"/><path d="M' + (cx - 9) + ',' + (cy - h * .92) + ' h18 v9 q0,7 -9,9 q-9,-2 -9,-9Z" fill="' + WH + '"/><circle cx="' + cx + '" cy="' + (cy - h * 1.1) + '" r="3.5" fill="' + sh(X.kit, .3) + '"/>'; break;
      case 'telephone': s += '<g transform="translate(' + (cx - 60) + ',' + 262 + ') rotate(-12)"><rect x="-15" y="-28" width="30" height="52" rx="5" fill="' + INK + '"/><rect x="-12" y="-23" width="24" height="40" rx="2" fill="' + ti(BLUE, .35) + '"/></g>' + hand(cx - 58, 284, sk, -12); break;
      case 'sacoche': s += '<path d="M' + (cx + sw - 26) + ',' + (T + 12) + ' L' + (cx - bh + 44) + ',' + 280 + '" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><rect x="' + (cx - bh + 12) + '" y="266" width="70" height="32" rx="12" fill="' + INK + '"/><path d="M' + (cx - bh + 22) + ',276 H' + (cx - bh + 72) + '" stroke="' + GREY + '" stroke-width="2"/><circle cx="' + (cx - bh + 84) + '" cy="292" r="5" fill="none" stroke="' + YEL + '" stroke-width="2.5"/><rect x="' + (cx - bh + 82) + '" y="296" width="4" height="12" fill="' + YEL + '" transform="rotate(-15 ' + (cx - bh + 84) + ' 296)"/><rect x="' + (cx - bh + 86) + '" y="295" width="4" height="10" fill="' + METAL + '" transform="rotate(20 ' + (cx - bh + 88) + ' 295)"/>'; break;
      case 'ricard': s += '<g transform="translate(' + (cx + bh - 34) + ',250)"><path d="M-13,-32 L13,-32 L11,20 L-11,20Z" fill="' + PASTIS + '"/><rect x="-13" y="-32" width="26" height="5" fill="' + WH + '" opacity=".6"/><rect x="-8" y="-20" width="8" height="8" fill="' + WH + '" opacity=".75" transform="rotate(15 -4 -16)"/></g>' + hand(cx + bh - 34, 270, sk, 10); break;
      case 'lunettes': s += '<path d="M' + (cx - X.ex - 13) + ',' + (X.eyeY - 2) + ' L' + (cx - w * .98) + ',' + (X.eyeY - 4) + ' M' + (cx + X.ex + 13) + ',' + (X.eyeY - 2) + ' L' + (cx + w * .98) + ',' + (X.eyeY - 4) + '" stroke="' + INK + '" stroke-width="3"/><g fill="' + INK + '"><rect x="' + (cx - X.ex - 14) + '" y="' + (X.eyeY - 9) + '" width="28" height="18" rx="6"/><rect x="' + (cx + X.ex - 14) + '" y="' + (X.eyeY - 9) + '" width="28" height="18" rx="6"/><rect x="' + (cx - X.ex + 12) + '" y="' + (X.eyeY - 6) + '" width="' + (2 * X.ex - 24) + '" height="3.5"/></g><path d="M' + (cx - X.ex - 8) + ',' + (X.eyeY - 3) + ' l7,-4 M' + (cx + X.ex - 8) + ',' + (X.eyeY - 3) + ' l7,-4" stroke="' + WH + '" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>'; break;
      case 'carnet': s += '<g transform="translate(' + (cx + bh - 42) + ',266) rotate(8)"><rect x="-22" y="-30" width="44" height="58" rx="3" fill="' + PAPER + '"/><rect x="-22" y="-30" width="44" height="9" fill="' + RED + '"/><path d="M-14,-12 h28 M-14,-2 h28 M-14,8 h20" stroke="#9A9486" stroke-width="2"/></g>' + hand(cx + bh - 26, 288, sk, 20); break;
      case 'carton': s += '<g transform="translate(' + (cx + sw - 6) + ',' + (T + 8) + ') rotate(12)"><rect x="-15" y="-48" width="30" height="42" rx="3" fill="' + YEL + '"/></g>' + hand(cx + sw - 6, T + 10, sk, -30); break;
      case 'gants': [-1, 1].forEach(function (sd) { var gx = cx + sd * (bh - 26); s += '<g transform="translate(' + gx + ',282) rotate(' + (sd * 10) + ')"><rect x="-22" y="-28" width="44" height="42" rx="14" fill="' + PAPER + '"/><rect x="-22" y="6" width="44" height="12" rx="3" fill="' + INK + '"/><circle cx="' + (sd * -6) + '" cy="-12" r="4.5" fill="' + sk + '"/><circle cx="' + (sd * 8) + '" cy="-2" r="3" fill="' + sk + '"/><path d="M-10,-28 v10 M0,-28 v10 M10,-28 v10" stroke="' + sh(PAPER, .15) + '" stroke-width="2"/></g>'; }); break;
      case 'creoles': s += '<circle cx="' + (cx - w * .97) + '" cy="' + (cy + h * .3) + '" r="5" fill="none" stroke="' + YEL + '" stroke-width="2.5"/><circle cx="' + (cx + w * .97) + '" cy="' + (cy + h * .3) + '" r="5" fill="none" stroke="' + YEL + '" stroke-width="2.5"/>'; break;
      case 'collier': for (var i = 0; i <= 10; i++) { var t = i / 10, px = (1 - t) * (1 - t) * (cx - 22) + 2 * (1 - t) * t * cx + t * t * (cx + 22), py = (1 - t) * (1 - t) * (T) + 2 * (1 - t) * t * (T + 24) + t * t * T; s += '<circle cx="' + r(px) + '" cy="' + r(py) + '" r="2.6" fill="' + WH + '"/>'; } break;
      case 'crayon': s += '<g transform="rotate(-35 ' + (cx + w * .95) + ' ' + (cy - h * .05) + ')"><rect x="' + (cx + w * .95 - 3.5) + '" y="' + (cy - h * .05 - 26) + '" width="7" height="40" fill="' + YEL + '"/><path d="M' + (cx + w * .95 - 3.5) + ',' + (cy - h * .05 + 14) + ' l3.5,8 l3.5,-8Z" fill="' + PASTIS + '"/></g>'; break;
    }
  });
  return s;
}

function human(c, e, o, u) {
  var cx = 120, H = c.head, w = H.w, h = H.h, cy = H.cy || 100, B = c.body;
  var X = { c: c, cx: cx, cy: cy, w: w, h: h, skin: c.skin, hc: c.hair, kit: o.kit || B.kit, trim: o.trim || B.trim || PAPER };
  X.T = cy + h * .9 + 6; X.sw = Math.min(B.W, 116); X.bh = Math.min(B.W + (B.Bl || 0) * .9, 118); X.bw2 = Math.min(B.W - 6 + (B.Bl || 0) * .5, 116); X.bot = 306; X.nk = B.nk || w * .42;
  X.eyeY = cy + h * (c.ey || 0); X.ex = w * .38; X.browY = X.eyeY - 17; X.noseY = cy + h * .3; X.mY = cy + h * .58; X.mw = w * .55;
  var bodyD = torso(X, 0, false), hp = headPath(X), sk = c.skin, T = X.T, bh = X.bh, bot = X.bot;
  var g = garment(X, u);
  var defs = '<clipPath id="' + u + 'b"><path d="' + bodyD + '"/></clipPath><clipPath id="' + u + 'h"><path d="' + hp + '"/></clipPath>' + g.d;
  var corps = '<rect x="' + (cx - X.nk) + '" y="' + (cy + h * .4) + '" width="' + (2 * X.nk) + '" height="' + (T - cy - h * .4 + 16) + '" fill="' + sk + '"/><path d="' + bodyD + '" fill="' + sk + '"/>';
  var ombres = '<g transform="translate(1.5 1)"><g clip-path="url(#' + u + 'b)" fill="' + INK + '" opacity=".2"><ellipse cx="' + cx + '" cy="' + (T + 2) + '" rx="' + (w * .62) + '" ry="14"/><path d="M' + (cx + X.sw * .5) + ',' + T + ' C' + (cx + X.sw) + ',' + (T + 10) + ' ' + (cx + bh + 10) + ',250 ' + (cx + X.bw2) + ',' + (bot + 10) + ' L' + (cx + X.bw2 * .55) + ',' + (bot + 10) + ' C' + (cx + bh * .7) + ',250 ' + (cx + X.sw * .6) + ',' + (T + 30) + ' ' + (cx + X.sw * .5) + ',' + T + 'Z"/>' +
    ((B.Bl || 0) > 10 ? '<path d="M' + (cx - bh * .7) + ',282 Q' + cx + ',300 ' + (cx + bh * .7) + ',282 L' + (cx + bh * .7) + ',292 Q' + cx + ',312 ' + (cx - bh * .7) + ',292Z"/>' : '') + '</g></g>';
  var tete = '<ellipse cx="' + (cx - w * .97) + '" cy="' + (cy + h * .06) + '" rx="' + (h * .13) + '" ry="' + (h * .17) + '" fill="' + sk + '"/><ellipse cx="' + (cx + w * .97) + '" cy="' + (cy + h * .06) + '" rx="' + (h * .13) + '" ry="' + (h * .17) + '" fill="' + sk + '"/>' +
    '<ellipse cx="' + (cx - w * .97) + '" cy="' + (cy + h * .06) + '" rx="' + (h * .065) + '" ry="' + (h * .09) + '" fill="' + sh(sk, .18) + '"/><ellipse cx="' + (cx + w * .97) + '" cy="' + (cy + h * .06) + '" rx="' + (h * .065) + '" ry="' + (h * .09) + '" fill="' + sh(sk, .18) + '"/>' +
    '<path d="' + hp + '" fill="' + sk + '"/><g clip-path="url(#' + u + 'h)"><ellipse cx="' + (cx + w * 1.05) + '" cy="' + (cy + h * .1) + '" rx="' + (w * .45) + '" ry="' + (h * 1.2) + '" fill="' + INK + '" opacity=".13"/>' +
    (c.stubble ? '<path d="M' + (cx - w * .95) + ',' + (cy + h * .2) + ' C' + (cx - w * .9) + ',' + (cy + h * 1.05) + ' ' + (cx + w * .9) + ',' + (cy + h * 1.05) + ' ' + (cx + w * .95) + ',' + (cy + h * .2) + ' C' + (cx + w * .6) + ',' + (cy + h * .5) + ' ' + (cx - w * .6) + ',' + (cy + h * .5) + ' ' + (cx - w * .95) + ',' + (cy + h * .2) + 'Z" fill="' + c.stubble + '" opacity="' + (c.stubOp || .28) + '"/>' : '') + '</g>' +
    (c.blush ? '<ellipse cx="' + (cx - w * .55) + '" cy="' + (cy + h * .32) + '" rx="10" ry="6" fill="' + RED + '" opacity=".3"/><ellipse cx="' + (cx + w * .55) + '" cy="' + (cy + h * .32) + '" rx="10" ry="6" fill="' + RED + '" opacity=".3"/>' : '') +
    (c.freckles ? [[-.6, .22], [-.5, .3], [-.66, .34], [-.42, .24], [.6, .22], [.5, .3], [.66, .34], [.42, .24], [-.1, .16], [.1, .16]].map(function (p) { return '<circle cx="' + r(cx + w * p[0]) + '" cy="' + r(cy + h * p[1]) + '" r="1.8" fill="' + sh(sk, .3) + '"/>'; }).join('') : '') +
    (c.cernes ? '<path d="M' + (cx - X.ex - 7) + ',' + (X.eyeY + 9) + ' Q' + (cx - X.ex) + ',' + (X.eyeY + 14) + ' ' + (cx - X.ex + 7) + ',' + (X.eyeY + 9) + ' M' + (cx + X.ex - 7) + ',' + (X.eyeY + 9) + ' Q' + (cx + X.ex) + ',' + (X.eyeY + 14) + ' ' + (cx + X.ex + 7) + ',' + (X.eyeY + 9) + '" fill="none" stroke="' + sh(sk, .35) + '" stroke-width="2.5" stroke-linecap="round"/>' : '');
  var ek = { neutre: c.eyeN || 'point', fier: 'mi', gueule: 'petit', choque: 'grand', rire: 'rire' }[e];
  var yeux = eye(cx - X.ex, X.eyeY, -1, ek) + eye(cx + X.ex, X.eyeY, 1, ek);
  var mk = (c.mouth && c.mouth[e]) || { neutre: 'plat', fier: 'smirk', gueule: 'hurle', choque: 'o', rire: 'rire' }[e];
  return {
    defs: defs, layers: [
      ['cheveux_arriere', hairBack(X)], ['corps', corps], ['maillot', '<g clip-path="url(#' + u + 'b)">' + g.s + '</g>'], ['ombres', ombres], ['tete', tete], ['cheveux', hairFront(X)],
      ['yeux', yeux], ['sourcils', brows(X, e)], ['nez', nose(X)], ['bouche', mouth(X, mk)], ['moustache', must(X, e)], ['accessoires', accessories(X)]
    ]
  };
}

function dog(c, e) {
  var M = MUD, D = sh(MUD, .35), L = ti(MUD, .45);
  var earUp = function (sd) { var x = 120 + sd * 48; return '<path d="M' + x + ',96 C' + (x + sd * 12) + ',60 ' + (x + sd * 6) + ',40 ' + (x - sd * 6) + ',34 C' + (x - sd * 20) + ',52 ' + (x - sd * 24) + ',74 ' + (x - sd * 22) + ',92Z" fill="' + D + '"/>'; };
  var earDown = function (sd) { var x = 120 + sd * 50; return '<path d="M' + x + ',92 C' + (x + sd * 26) + ',96 ' + (x + sd * 36) + ',140 ' + (x + sd * 24) + ',168 C' + (x + sd * 12) + ',160 ' + x + ',130 ' + (x - sd * 12) + ',104Z" fill="' + D + '"/>'; };
  var ears = e === 'choque' ? earUp(-1) + earUp(1) : (e === 'fier' || e === 'rire') ? earDown(-1) + earUp(1) : earDown(-1) + earDown(1);
  var ek = { neutre: 'point', fier: 'mi', gueule: 'petit', choque: 'grand', rire: 'rire' }[e];
  var bf = browsFor(e, {}), br = '';
  [-1, 1].forEach(function (sd) { var v = bf(sd), bx = 120 + sd * 26 + v[2], by = 100 + v[0]; br += '<rect x="' + (bx - 7) + '" y="' + (by - 3) + '" width="14" height="6" rx="3" fill="' + (sd > 0 ? L : D) + '" transform="rotate(' + v[1] + ' ' + bx + ' ' + by + ')"/>'; });
  var tongue = '<path d="M112,174 Q111,200 122,202 Q133,200 131,174Z" fill="' + RED + '"/><path d="M121.5,178 v16" stroke="' + sh(RED, .25) + '" stroke-width="2"/>';
  var mouths = {
    neutre: '<path d="M102,170 Q111,179 120,170 Q129,179 138,170" fill="none" stroke="' + INK + '" stroke-width="3.2" stroke-linecap="round"/>',
    fier: tongue + '<path d="M100,168 Q110,178 120,170 Q130,178 140,168" fill="none" stroke="' + INK + '" stroke-width="3.2" stroke-linecap="round"/>',
    gueule: '<path d="M94,166 Q120,160 146,166 Q142,198 120,202 Q98,198 94,166Z" fill="' + INK + '"/><path d="M99,166 l5,9 l5,-9Z M131,166 l5,9 l5,-9Z" fill="' + WH + '"/><ellipse cx="120" cy="192" rx="12" ry="6" fill="' + RED + '"/>',
    choque: '<ellipse cx="120" cy="178" rx="7" ry="9" fill="' + INK + '"/>',
    rire: '<path d="M98,166 Q120,172 142,166 Q138,190 120,192 Q102,190 98,166Z" fill="' + INK + '"/>' + tongue
  };
  return {
    defs: '', layers: [
      ['corps', '<path d="M58,306 C54,240 80,194 120,190 C160,194 186,240 182,306Z" fill="' + M + '"/><path d="M96,306 C96,250 108,222 120,220 C132,222 144,250 144,306Z" fill="' + L + '"/><path d="M58,306 C54,270 60,250 70,236 L80,306Z" fill="' + INK + '" opacity=".12"/>'],
      ['accessoires', '<path d="M82,194 Q120,218 158,194 L160,206 Q120,232 80,206Z" fill="' + RED + '"/><circle cx="120" cy="222" r="8" fill="' + YEL + '"/>'],
      ['oreilles', ears],
      ['tete', '<ellipse cx="120" cy="126" rx="64" ry="56" fill="' + M + '"/><ellipse cx="146" cy="114" rx="24" ry="22" fill="' + D + '"/><ellipse cx="120" cy="160" rx="36" ry="26" fill="' + L + '"/><ellipse cx="156" cy="140" rx="26" ry="42" fill="' + INK + '" opacity=".08"/>'],
      ['yeux', eye(94, 118, -1, ek) + eye(146, 118, 1, ek)],
      ['sourcils', br],
      ['nez', '<ellipse cx="120" cy="146" rx="13" ry="9" fill="' + INK + '"/><ellipse cx="116" cy="143" rx="4" ry="2.2" fill="' + WH + '" opacity=".5"/>'],
      ['bouche', mouths[e]]
    ]
  };
}

function reporter(c, e) {
  var sk = c.skin, tilt = { neutre: 0, fier: -4, gueule: -12, choque: 18, rire: 6 }[e], tr = 'rotate(' + tilt + ' 120 170)';
  var screen = '<rect x="80" y="62" width="80" height="3" rx="1.5" fill="' + PAPER + '" opacity=".35"/><rect x="80" y="62" width="' + (e === 'fier' ? 80 : 30) + '" height="3" rx="1.5" fill="' + PAPER + '"/>' +
    '<circle cx="152" cy="80" r="5" fill="' + RED + '"/><path d="M84,90 v-10 h10 M156,210 v10 h-10 M84,210 v10 h10 M156,90 v-10" fill="none" stroke="' + PAPER + '" stroke-width="2.5" opacity=".7"/>' +
    '<path d="M90,204 h60 v-32 l-30,-16 l-30,16Z" fill="none" stroke="' + PAPER + '" stroke-width="2.5" opacity=".35"/>';
  if (e === 'fier') screen += '<path d="M120,150 C104,138 100,124 110,118 C116,114 120,120 120,124 C120,120 124,114 130,118 C140,124 136,138 120,150Z" fill="' + RED + '"/>';
  if (e === 'choque') screen += '<path d="M100,70 L118,110 L108,130 L130,170 M118,110 L140,120" fill="none" stroke="' + WH + '" stroke-width="2.5"/>';
  var motion = (e === 'gueule' || e === 'rire' || e === 'choque') ? '<path d="M44,100 l-14,-4 M40,130 l-16,0 M44,160 l-14,4 M196,100 l14,-4 M200,130 l16,0 M196,160 l14,4" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' : '';
  return {
    defs: '', layers: [
      ['corps', '<path d="M84,326 C90,290 98,262 104,236 L150,236 C150,270 150,300 156,326Z" fill="' + INK + '"/><path d="M84,326 L100,258 L108,326Z" fill="' + WH + '" opacity=".08"/>'],
      ['telephone', '<g transform="' + tr + '"><rect x="62" y="44" width="116" height="200" rx="18" fill="' + INK + '"/><rect x="69" y="54" width="102" height="180" rx="12" fill="#3B3A36"/>' + screen + '</g>'],
      ['main', '<g transform="' + tr + '"><ellipse cx="106" cy="238" rx="30" ry="22" fill="' + sk + '"/><ellipse cx="66" cy="196" rx="9" ry="18" fill="' + sk + '" transform="rotate(-12 66 196)"/><ellipse cx="178" cy="160" rx="10" ry="9" fill="' + sk + '"/><ellipse cx="180" cy="182" rx="10" ry="9" fill="' + sk + '"/><ellipse cx="178" cy="204" rx="10" ry="9" fill="' + sk + '"/><ellipse cx="172" cy="224" rx="10" ry="9" fill="' + sk + '"/></g>'],
      ['effets', motion]
    ]
  };
}

function portrait(id, e, o) {
  o = o || {}; var c = CHARS[id]; if (!c) return ''; e = e || 'neutre';
  var u = o.uid || ('dl' + (++n));
  var R = c.special === 'dog' ? dog(c, e) : c.special === 'reporter' ? reporter(c, e) : human(c, e, o, u);
  var body = R.layers.filter(function (l) { return !o.only || l[0] === o.only; }).map(function (l) { return '<g ' + (o.exportIds ? 'id="' + l[0] + '" ' : '') + 'data-calque="' + l[0] + '">' + l[1] + '</g>'; }).join('');
  var ghost = '';
  if (o.only) ghost = '<g opacity=".13">' + R.layers.filter(function (l) { return l[0] === 'tete' || l[0] === 'corps'; }).map(function (l) { return l[1]; }).join('') + '</g>';
  var defs = R.defs || '', filt = '';
  if (o.sil) { defs += '<filter id="' + u + 's"><feFlood flood-color="' + INK + '"/><feComposite in2="SourceAlpha" operator="in"/></filter>'; filt = ' filter="url(#' + u + 's)"'; }
  else if (!o.only && o.cut !== false) { defs += cutFilter(u + 'c', c.seed || 3, o.cut === 'bord' ? 'bord' : 'full'); filt = ' filter="url(#' + u + 'c)"'; }
  var vb = o.crop === 'face' ? '28 18 184 176' : '-12 -10 264 336';
  var wh = o.w ? ' width="' + o.w + '" height="' + Math.round(o.w * (o.crop === 'face' ? 176 / 184 : 336 / 264)) + '"' : ' width="100%" height="100%"';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '"' + wh + ' preserveAspectRatio="xMidYMax meet" style="display:block;overflow:visible"><defs>' + defs + '</defs>' + ghost + '<g' + filt + '>' + body + '</g></svg>';
}

var HS_TOP = { kevin: 'quiff', rase: 'rase', quiff: 'quiff', boucles: 'boucles', chauve: 'bald', gris_court: 'cap', fred: 'fred', raie: 'raie', plaque: 'plaque', long: 'long', carre: 'cap', court: 'cap', fade: 'rase' };
function top(id, o) {
  o = o || {}; var c = CHARS[id]; if (!c) return '';
  var W = o.w ? ' width="' + o.w + '" height="' + o.w + '"' : ' width="100%" height="100%"';
  var open = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"' + W + ' style="display:block;overflow:visible">', idA = function (nm) { return (o.exportIds ? 'id="' + nm + '" ' : '') + 'data-calque="' + nm + '"'; };
  if (c.special === 'dog') {
    return open + '<g ' + idA('ombre') + '><ellipse cx="21.5" cy="23" rx="7" ry="12" fill="' + INK + '" opacity=".3"/></g><g ' + idA('corps') + '><path d="M20,10 q2,-5 5,-6" fill="none" stroke="' + MUD + '" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="20" cy="19" rx="6" ry="10" fill="' + MUD + '"/><circle cx="20" cy="17" r="3" fill="' + sh(MUD, .35) + '"/></g><g ' + idA('tete') + '><ellipse cx="14.5" cy="30" rx="2.4" ry="4" fill="' + sh(MUD, .35) + '" transform="rotate(20 14.5 30)"/><ellipse cx="25.5" cy="30" rx="2.4" ry="4" fill="' + sh(MUD, .35) + '" transform="rotate(-20 25.5 30)"/><circle cx="20" cy="30" r="5.5" fill="' + MUD + '"/><ellipse cx="20" cy="34.5" rx="3" ry="2.2" fill="' + ti(MUD, .45) + '"/><circle cx="20" cy="36" r="1.3" fill="' + INK + '"/><rect x="15" y="25" width="10" height="2.2" rx="1" fill="' + RED + '"/></g></svg>';
  }
  if (c.special) return '';
  var t = c.top || {}, kit = o.kit || t.kit || c.body.kit, trim = o.trim || t.trim || c.body.trim || PAPER, sk = c.skin, hc = c.hair, bw = t.bw || 1, bl = t.belly || 0, arms = t.long ? kit : sk, feet = t.feet || INK, rx = 13 * bw, x = t.x || [];
  var hs = t.hs || HS_TOP[c.hs] || 'cap';
  var s = '<g ' + idA('ombre') + '><ellipse cx="22" cy="' + (27 + bl) + '" rx="' + (rx + 1) + '" ry="' + (9 + bl * 2.5) + '" fill="' + INK + '" opacity=".3"/></g>';
  s += '<g ' + idA('pieds') + '><ellipse cx="15.5" cy="' + (31 + bl * 2.2) + '" rx="3" ry="2.4" fill="' + feet + '"/><ellipse cx="24.5" cy="' + (31 + bl * 2.2) + '" rx="3" ry="2.4" fill="' + feet + '"/></g>';
  var armC = x.indexOf('gants') >= 0 ? PAPER : arms, ar = 3.9 * Math.max(1, bw * .95);
  s += '<g ' + idA('bras') + '><circle cx="' + (20 - rx - .5) + '" cy="24" r="' + ar + '" fill="' + armC + '"/><circle cx="' + (20 + rx + .5) + '" cy="24" r="' + ar + '" fill="' + armC + '"/>' + (x.indexOf('brassard') >= 0 ? '<circle cx="' + (20 + rx + .5) + '" cy="24" r="' + (ar - .6) + '" fill="none" stroke="' + YEL + '" stroke-width="1.8"/>' : '') + '</g>';
  s += '<g ' + idA('maillot') + '>' + (bl ? '<ellipse cx="20" cy="' + (27 + bl * 1.5) + '" rx="' + (rx * .7) + '" ry="' + (3 + bl * 3) + '" fill="' + kit + '"/>' : '') + '<ellipse cx="20" cy="24" rx="' + rx + '" ry="8.6" fill="' + kit + '"/><path d="M' + (20 - rx * .72) + ',21 Q20,15.5 ' + (20 + rx * .72) + ',21" fill="none" stroke="' + trim + '" stroke-width="2.6"/></g>';
  var hd = '<circle cx="20" cy="20" r="7" fill="' + sk + '"/>', capP = '<path d="M13,20 A7,7 0 0 1 27,20 Q20,15.5 13,20Z" fill="' + hc + '"/>';
  switch (hs) {
    case 'rase': hd += capP.replace('/>', ' opacity=".45"/>'); break;
    case 'bald': hd += '<path d="M13.2,19 a2,3 0 0 1 2,-3 M26.8,19 a2,3 0 0 0 -2,-3" fill="none" stroke="' + hc + '" stroke-width="2"/><ellipse cx="18" cy="17" rx="2.4" ry="1.4" fill="' + WH + '" opacity=".6"/>'; break;
    case 'bandeau': hd += capP + '<circle cx="20" cy="20" r="6.2" fill="none" stroke="' + WH + '" stroke-width="2.2"/>'; break;
    case 'casquette': hd += '<circle cx="20" cy="19.5" r="7.3" fill="' + kit + '"/><ellipse cx="20" cy="26.2" rx="5.6" ry="2.8" fill="' + sh(kit, .35) + '"/><circle cx="20" cy="19" r="1.3" fill="' + sh(kit, .3) + '"/>'; break;
    case 'bob': hd += '<circle cx="20" cy="20" r="9.6" fill="' + sh(YEL, .1) + '"/><circle cx="20" cy="20" r="6.4" fill="' + YEL + '"/><circle cx="20" cy="20" r="6.4" fill="none" stroke="' + BLUE + '" stroke-width="1.6"/>'; break;
    case 'quiff': hd += capP + '<ellipse cx="21" cy="14.6" rx="4.6" ry="2.4" fill="' + hc + '"/>'; break;
    case 'boucles': hd += capP; for (var i = 0; i < 7; i++) { var a = Math.PI * (1 + i / 6); hd += '<circle cx="' + r(20 + Math.cos(a) * 6.6) + '" cy="' + r(20 + Math.sin(a) * 6.6) + '" r="2.1" fill="' + hc + '"/>'; } break;
    case 'fred': hd += capP + '<path d="M13,17 l-2,-3 l3.5,.5Z M18,13.5 l0,-3.5 l3,2.6Z M24,14 l3,-2.5 l.2,3.4Z" fill="' + hc + '"/>'; break;
    case 'raie': hd += capP + '<path d="M17,13.6 Q16.6,16 16,18.4" fill="none" stroke="' + ti(sk, .1) + '" stroke-width="1"/>'; break;
    case 'plaque': hd += capP + '<path d="M16,15.5 Q20,13.6 24,15.5" fill="none" stroke="' + ti(hc, .35) + '" stroke-width="1.1"/>'; break;
    case 'long': hd = '<ellipse cx="20" cy="15" rx="7.5" ry="6.5" fill="' + hc + '"/>' + hd + capP; break;
    default: hd += capP;
  }
  s += '<g ' + idA('tete') + '>' + hd + '</g>';
  var ac = '';
  if (x.indexOf('lunettes') >= 0) ac += '<rect x="15" y="25.4" width="10" height="2.4" rx="1" fill="' + INK + '"/>';
  if (x.indexOf('phone') >= 0) ac += '<rect x="' + (20 - rx - 3) + '" y="27" width="4" height="6" rx="1" fill="' + INK + '"/>';
  if (x.indexOf('ricard') >= 0) ac += '<circle cx="' + (20 + rx + 1) + '" cy="29" r="2.6" fill="' + PASTIS + '"/>';
  if (x.indexOf('carton') >= 0) ac += '<rect x="' + (20 + rx) + '" y="14" width="4.5" height="6" rx=".6" fill="' + YEL + '" transform="rotate(12 ' + (22 + rx) + ' 17)"/>';
  s += '<g ' + idA('accessoires') + '>' + ac + '</g>';
  return open + s + '</svg>';
}

var API = { CHARS: CHARS, portrait: portrait, top: top, mix: mix, sh: sh, ti: ti, EXPR: ['neutre', 'fier', 'gueule', 'choque', 'rire'], LAYERS: ['cheveux_arriere', 'corps', 'maillot', 'ombres', 'tete', 'cheveux', 'yeux', 'sourcils', 'nez', 'bouche', 'moustache', 'accessoires'] };
root.DL = API;

if (typeof customElements !== 'undefined' && typeof HTMLElement !== 'undefined') {
  var mk = function (fn, attrs) {
    return class extends HTMLElement {
      static get observedAttributes() { return attrs; }
      connectedCallback() { this.r(); }
      attributeChangedCallback() { if (this.isConnected) this.r(); }
      r() {
        var root = this.shadowRoot || this.attachShadow({ mode: 'open' });
        var c = this.getAttribute('c'); if (!c || !CHARS[c]) { root.innerHTML = ''; this._k = ''; return; }
        var k = attrs.map(function (a) { return this.getAttribute(a); }, this).join('|'); if (k === this._k) return; this._k = k;
        root.innerHTML = '<style>:host{display:block}svg{width:100%;height:100%}</style>' + fn(this);
        if (!this.style.display) this.style.display = 'block';
      }
    };
  };
  if (!customElements.get('dl-char')) customElements.define('dl-char', mk(function (el) {
    var cut = el.getAttribute('cut');
    return portrait(el.getAttribute('c'), el.getAttribute('e') || 'neutre', { sil: el.getAttribute('sil') === '1', kit: el.getAttribute('kit'), trim: el.getAttribute('trim'), only: el.getAttribute('only'), crop: el.getAttribute('crop'), cut: cut === '0' ? false : cut === 'bord' ? 'bord' : true });
  }, ['c', 'e', 'sil', 'kit', 'trim', 'only', 'crop', 'cut']));
  if (!customElements.get('dl-top')) customElements.define('dl-top', mk(function (el) { return top(el.getAttribute('c'), { kit: el.getAttribute('kit'), trim: el.getAttribute('trim') }); }, ['c', 'kit', 'trim']));
}
})(typeof window !== 'undefined' ? window : globalThis);
