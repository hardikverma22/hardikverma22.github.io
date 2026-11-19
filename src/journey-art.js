// The journey's backdrops: one wide panorama per city, built like a layered illustration. The far town and
// mid city are soft haze (atmospheric perspective: further = lighter, flatter, less detail); the landmarks
// and the near palms, trees and water carry real colour. No ink outlines; depth comes from the layers, a
// shaded side on each block, and mist at the foot of each plane. 1600×400, ground at y=400, anchored right
// so a phone sees the landmark end.
// Night: .ja-tint dims everything, then lights sit above it: warm windows (.lit), bulb strings on the
// landmarks, a city glow on the horizon, reflections on the water and the lighthouse beam.
// All motion is slow CSS ("journey art" in style.css) and stops for reduced motion.

const INK = 'var(--ink)';
const s = (w = 2.5) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const f1 = (n) => n.toFixed(1);
const SHADE = 'rgba(30,20,60,.16)', CREAM = '#f6ead2';

// windows: panes by day, a stable subset glowing at night
function wins(x, y, cols, rows, { w = 5, h = 7, gx = 12, gy = 16, fill = 'rgba(255,255,255,.4)', k = 0, lit = 0.55, rx = 1, skip = [] } = {}) {
  let base = '', glow = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const X = x + c * gx, Y = y + r * gy, q = k + r * 13 + c * 5;
    if (skip.some(([x0, y0, x1, y1]) => X + w > x0 && X < x1 && Y + h > y0 && Y < y1)) continue;
    base += `<rect x="${f1(X)}" y="${f1(Y)}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
    if (rnd(q) < lit) glow += `<rect class="lit${rnd(q + 2) < 0.1 ? ' flk' : ''}" style="--wd:${(rnd(q + 4) * 1.6).toFixed(2)}s;--d:-${(rnd(q + 6) * 11).toFixed(1)}s" x="${f1(X)}" y="${f1(Y)}" width="${w}" height="${h}" rx="${rx}"/>`;
  }
  return { base, glow };
}
// a string of bulbs along a list of points (night only), twinkling softly
const bulbs = (pts, k = 0, r = 1.9) => pts.map(([x, y], i) => `<circle class="ja-bulb" style="--wd:${(0.3 + i * 0.012).toFixed(2)}s;--bd:-${(rnd(k + i) * 3).toFixed(1)}s" cx="${f1(x)}" cy="${f1(y)}" r="${r}"/>`).join('');
const line = (x1, y1, x2, y2, n) => Array.from({ length: n + 1 }, (_, i) => [x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]);
const arc = (cx, cy, rx, ry, n, a0 = Math.PI, a1 = 2 * Math.PI) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
// points along a quadratic curve (for domes drawn with Q)
const quad = (x0, y0, cx, cy, x1, y1, n) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * x0 + 2 * t * u * cx + t * t * x1, u * u * y0 + 2 * t * u * cy + t * t * y1]; });
// vertical shimmering streaks on water under a light (night only)
const refl = (pts, y0, P) => pts.map(([x], i) => `<rect class="ja-refl" style="--rd:-${(rnd(i + x) * 3).toFixed(1)}s" x="${x - 1.5}" y="${y0 + 2}" width="3" height="${14 + (i % 3) * 5}" rx="1.5" fill="url(#${P}-refl)"/>`).join('');

// the hazy planes every city sits in
function haze(seed, top = 330) {
  let far = '';
  for (let x = -10, k = seed; x < 1610; k++) { const w = 30 + rnd(k) * 60, h = 30 + rnd(k + 1) * 60; far += `M${x.toFixed(0)} 400 V${(top - h * 0.6).toFixed(0)} h${w.toFixed(0)} V400 Z `; x += w + 3; }
  return far;
}
function midCity(blocks, k0) {
  let d = '', base = '', glow = '';
  blocks.forEach(([x, w, h, tank], i) => {
    d += `M${x} 400 V${400 - h} h${w} V400 Z `;
    if (tank) d += `M${x + w - 22} ${400 - h} v-12 h16 v12 Z `;
    const g = wins(x + 8, 400 - h + 14, Math.floor((w - 12) / 12), Math.floor((h - 40) / 16), { k: k0 + i * 37, fill: 'var(--jlw)', w: 4, h: 6 });
    base += g.base; glow += g.glow;
  });
  return { d, base, glow };
}
const mist = (P, y, o) => `<rect x="-200" y="${y}" width="2000" height="${400 - y}" fill="url(#${P}-mist)" opacity="${o}"/>`;
const drift = () => `<g class="ja-mist"><ellipse cx="400" cy="372" rx="420" ry="22" fill="var(--jlh)" opacity=".45"/><ellipse cx="1200" cy="380" rx="380" ry="18" fill="var(--jlh)" opacity=".4"/></g>`;
const defs = (P, extra = '') => `<defs>
  <linearGradient id="${P}-mist" x1="0" y1="1" x2="0" y2="0"><stop offset="0" style="stop-color:var(--jlh)"/><stop offset="1" style="stop-color:var(--jlh);stop-opacity:0"/></linearGradient>
  <radialGradient id="${P}-glow" cx=".5" cy="1" r=".6"><stop offset="0" stop-color="#ff9e6e" stop-opacity=".75"/><stop offset=".5" stop-color="#c46aa8" stop-opacity=".3"/><stop offset="1" stop-color="#c46aa8" stop-opacity="0"/></radialGradient>
  <linearGradient id="${P}-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ad6ee"/><stop offset="1" stop-color="#4f9ec8"/></linearGradient>
  <linearGradient id="${P}-refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd98a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></linearGradient>${extra}</defs>`;
const tint = '<rect class="ja-tint" x="-100" y="-60" width="1800" height="520"/>';
const glowBand = (P) => `<rect class="ja-hglow" x="-100" y="150" width="1800" height="260" fill="url(#${P}-glow)"/>`;

// a coconut palm in colour, its crown breathing in the breeze
const palm = (x, h, k, lean = 1) => {
  const tx = x + lean * 12, ty = 400 - h;
  return `<path d="M${x - 3.5} 400 Q${x + lean * 3} ${400 - h / 2} ${tx - 2} ${ty} h4 Q${x + lean * 3 + 4} ${400 - h / 2} ${x + 3.5} 400 Z" fill="#8a6a4a"/>
    <g class="ja-breathe" style="--sd:-${(rnd(k) * 6).toFixed(1)}s;transform-origin:${tx}px ${ty}px">${[[-1, -0.1], [-0.8, 0.5], [1, -0.15], [0.85, 0.5], [-0.2, -1], [0.35, -0.9]].map(([dx, dy], i) => {
      const ex = tx + dx * 52, ey = ty + dy * 22 + (Math.abs(dx) > 0.5 ? 22 : 0);
      return `<path d="M${tx} ${ty} Q${f1(tx + dx * 30)} ${f1(ty + dy * 26 - 16)} ${f1(ex)} ${f1(ey)} Q${f1(tx + dx * 26)} ${f1(ty + dy * 8 - 2)} ${tx} ${ty + 3} Z" fill="${i % 2 ? '#3f8f6a' : '#2f7a5c'}"/>`;
    }).join('')}<circle cx="${tx - 3}" cy="${ty + 5}" r="3.4" fill="#a2703e"/><circle cx="${tx + 4}" cy="${ty + 6}" r="3.4" fill="#a2703e"/></g>`;
};
// a round tree in colour (gulmohar when it blooms)
const tree = (x, r, k, bloom = false) => `<g class="ja-breathe" style="--sd:-${(rnd(k) * 6).toFixed(1)}s;transform-origin:${x}px 400px">
  <path d="M${x - 3} 400 L${x - 2} ${400 - r - 6} h4 L${x + 3} 400 Z" fill="#7a5a3e"/>
  <ellipse cx="${x}" cy="${400 - r * 1.6}" rx="${r * 1.15}" ry="${r * 0.9}" fill="${bloom ? '#f06a3c' : '#4f9a5b'}"/>
  <ellipse cx="${x - r * 0.35}" cy="${400 - r * 1.85}" rx="${r * 0.6}" ry="${r * 0.42}" fill="${bloom ? '#ff9a4d' : '#6fb36a'}"/>
  ${bloom ? [0, 1, 2, 3].map((i) => `<circle cx="${f1(x - r * 0.7 + rnd(k + i) * r * 1.4)}" cy="${f1(400 - r * 1.2 - rnd(k + i + 7) * r * 0.8)}" r="2.4" fill="#ffd27a"/>`).join('') : ''}</g>`;
const shimmer = (x0, x1, y, k = 0) => `<g class="ja-shimmer">${Array.from({ length: Math.round((x1 - x0) / 40) }, (_, i) => `<path d="M${f1(x0 + i * 40 + rnd(k + i) * 20)} ${f1(y + (i % 3) * 7)} h${14 + (i % 3) * 6}" stroke="#fff" stroke-width="2" stroke-linecap="round" style="animation-delay:-${(rnd(k + i + 3) * 3).toFixed(1)}s"/>`).join('')}</g>`;

/* ---------------- Chennai: Central Station, the Kapaleeshwarar gopuram, the lighthouse on the Marina ---------------- */
function chennai() {
  const P = 'jc';
  const mid = midCity([[60, 70, 130, 1], [150, 56, 96, 1], [440, 64, 150, 1], [520, 48, 110, 1], [770, 70, 120, 1], [860, 54, 160, 1], [930, 60, 100], [1250, 66, 140, 1], [1330, 50, 100], [1540, 60, 120, 1]], 100);
  let stL = '', gopL = '', lhL = '';
  // Central Station: red brick, white trim, corner turrets, the clock tower
  const BR = '#c8553d';
  let st = `<path d="M330 400 V300 H720 V400 Z" fill="${BR}"/><path d="M620 400 V300 H720 V400 Z" fill="${SHADE}"/><path d="M326 300 H724 V290 H326 Z M326 356 H724 V350 H326 Z" fill="${CREAM}"/>`;
  [338, 404, 646, 712].forEach((x) => { st += `<path d="M${x - 10} 290 v-24 h20 v24 Z" fill="${BR}"/><path d="M${x - 12} 266 h24 v-4 h-24 Z" fill="${CREAM}"/><path d="M${x - 10} 262 q10 -18 20 0 Z" fill="${BR}"/>`; });
  st += `<path d="M500 400 V196 H560 V400 Z" fill="${BR}"/><path d="M540 400 V196 H560 V400 Z" fill="${SHADE}"/><path d="M494 196 h72 v-10 h-72 Z M494 250 h72 v-6 h-72 Z" fill="${CREAM}"/>
    <path d="M504 186 V160 h52 v26 Z" fill="${BR}"/><path d="M500 160 h60 v-5 h-60 Z" fill="${CREAM}"/><path d="M504 155 Q530 110 556 155 Z" fill="${BR}"/><path d="M528.5 134 h3 v-34 h-3 Z" fill="${CREAM}"/><circle cx="530" cy="99" r="3" fill="#f2c14e"/>
    <circle cx="530" cy="222" r="13" fill="${CREAM}"/><path d="M530 222 v-8 M530 222 l5 3" stroke="#5a2a20" stroke-width="2" stroke-linecap="round"/>
    <path d="M516 400 v-30 a14 14 0 0 1 28 0 v30 Z" fill="#5a2a20"/>`;
  const sw = wins(347, 312, 15, 2, { w: 8, h: 14, gx: 25, gy: 46, fill: CREAM, k: 300, rx: 4, skip: [[492, 180, 568, 400]] });
  st += sw.base; stL += sw.glow;
  stL += bulbs(line(326, 290, 724, 290, 60), 1) + bulbs([...line(494, 186, 566, 186, 10), ...quad(504, 155, 530, 110, 556, 155, 12)], 2);
  // the gopuram: eight painted tiers with niches, a barrel roof, five gold kalasams
  const GX = 1110, TC = ['#e8b04a', '#ef6a5b', '#5fb3a1', '#f2c14e', '#e07a52', '#b9a6f2', '#f2c14e', '#ef6a5b'];
  let gop = `<path d="M${GX - 78} 400 V320 H${GX + 78} V400 Z" fill="#e8b04a"/><path d="M${GX + 30} 400 V320 H${GX + 78} V400 Z" fill="${SHADE}"/><path d="M${GX - 15} 400 V362 a15 15 0 0 1 30 0 V400 Z" fill="#5a3020"/>`;
  gop += [0, 1, 2, 3].map((i) => `<rect x="${GX - 70 + i * 12}" y="330" width="5" height="22" rx="2" fill="${CREAM}"/><rect x="${GX + 65 - i * 12}" y="330" width="5" height="22" rx="2" fill="${CREAM}"/>`).join('');
  let y = 320; const edges = [];
  TC.forEach((c, i) => {
    const w = 150 - i * 15, w2 = w - 12, h = 25 - i;
    gop += `<path d="M${GX - w / 2} ${y} L${GX - w2 / 2} ${y - h} H${GX + w2 / 2} L${GX + w / 2} ${y} Z" fill="${c}"/><path d="M${GX + w2 / 4} ${y - h} H${GX + w2 / 2} L${GX + w / 2} ${y} H${GX + w / 4} Z" fill="${SHADE}"/>`;
    const n = Math.max(3, Math.round(w2 / 13));
    for (let j = 0; j < n; j++) { const nx = GX - w2 / 2 + 6 + j * ((w2 - 12) / (n - 1)); gop += `<path d="M${f1(nx - 2.5)} ${y - 3} v-${h - 10} a2.5 2.5 0 0 1 5 0 v${h - 10} z" fill="${j % 2 ? CREAM : '#7a3e26'}"/>`; }
    gop += `<path d="M${GX - w / 2 - 3} ${y} h${w + 6} v-3 h-${w + 6} Z" fill="${CREAM}"/>`;
    edges.push(...line(GX - w / 2, y - 1, GX - w2 / 2, y - h, 3), ...line(GX + w / 2, y - 1, GX + w2 / 2, y - h, 3));
    y -= h;
  });
  gop += `<path d="M${GX - 34} ${y} Q${GX} ${y - 40} ${GX + 34} ${y} Z" fill="#ef6a5b"/>`;
  // five kalasams standing on the curve of the barrel roof (its surface: y − 20·(1 − (d/34)²))
  [-24, -12, 0, 12, 24].forEach((d) => { const yb = y - 20 * (1 - (d / 34) ** 2) + 1, st = d === 0 ? 7 : 5;
    gop += `<rect x="${GX + d - 1.6}" y="${f1(yb - st)}" width="3.2" height="${st}" fill="#c99a2e"/><ellipse cx="${GX + d}" cy="${f1(yb - st - 2)}" rx="4.2" ry="3.4" fill="#f2c14e"/><path d="M${GX + d - 1} ${f1(yb - st - 5)} l1 -4 l1 4 z" fill="#f2c14e"/>`; });
  gop += `<g class="ja-flag" style="transform-origin:${GX + 30}px ${y - 8}px"><rect x="${GX + 29}" y="${y - 34}" width="2" height="30" fill="#7a3e26"/><path d="M${GX + 31} ${y - 34} l15 5 l-15 6 Z" fill="#ef6a5b"/></g>`;
  gopL += bulbs(edges, 3) + bulbs(Array.from({ length: 11 }, (_, i) => { const d = -34 + i * 6.8; return [GX + d, y - 20 * (1 - (d / 34) ** 2) - 1]; }), 4);
  // the lighthouse: white with red bands, a glowing lantern
  const lh = `<path d="M1424 400 L1434 190 H1462 L1472 400 Z" fill="#fbf6ec"/><path d="M1452 400 L1458 190 H1462 L1472 400 Z" fill="${SHADE}"/>
    <path d="M1431 250 h34 l.6 14 h-35.2 Z M1428 316 h40 l.8 14 h-41.6 Z" fill="#e0533f"/><path d="M1426 192 h44 v-12 h-44 Z" fill="#2f2d4a"/><path d="M1434 180 V160 h28 v20 Z" fill="#ffe9a8"/>
    <path d="M1430 160 L1448 144 L1466 160 Z" fill="#e0533f"/><rect x="1442" y="214" width="12" height="14" rx="5" fill="#9fd3ea"/><path d="M1438 400 v-22 a10 10 0 0 1 20 0 v22 Z" fill="#7a4a2a"/>`;
  lhL += '<rect class="lit" style="--wd:.4s" x="1436" y="162" width="24" height="16" rx="2"/>';
  const beam = `<path class="ja-beam" d="M1448 170 L1760 128 L1760 214 Z" fill="url(#${P}-beam)"/>`;
  // near: the mandapam, the Marina, a catamaran, palms
  const near = `<path d="M1190 400 V356 H1250 V400 Z" fill="${CREAM}"/><path d="M1184 356 h72 l-10 -14 h-52 Z" fill="#e07a52"/>${[1198, 1212, 1226, 1240].map((x) => `<rect x="${x}" y="362" width="4" height="38" fill="#c9b48a"/>`).join('')}
    <path d="M1300 400 V368 H1660 V400 Z" fill="url(#${P}-water)"/>${shimmer(1310, 1600, 376, 5)}
    <g class="ja-bob" style="transform-origin:1530px 372px"><path d="M1506 372 h46 l-8 7 h-30 z" fill="#c8553d"/><path d="M1528 372 v-30 l18 26 z" fill="${CREAM}"/></g>
    ${[palm(40, 160, 1), palm(120, 120, 2, -1), palm(250, 140, 3), palm(760, 150, 4, -1), palm(830, 118, 5), palm(990, 170, 6, -1), palm(1250, 132, 7), palm(1330, 150, 8, -1), palm(1580, 124, 9)].join('')}`;
  const nightWater = refl([[1448, '#fff3c4'], [1460, '#fff3c4'], [1340], [1380], [1520], [1560]], 368, P);
  return `<svg viewBox="0 0 1600 400" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
    ${defs(P, `<linearGradient id="${P}-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff3c4" stop-opacity=".55"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></linearGradient>`)}
    <g transform="translate(0 -16)">
      <path d="${haze(1)}M240 400 V250 h22 V400 Z M1010 400 V236 h26 V400 Z" fill="var(--jl1)"/>${mist(P, 320, 0.7)}${drift()}
      <path d="${mid.d}" fill="var(--jl2)"/>${mid.base}${mid.glow}${mist(P, 340, 0.55)}
      <g class="ja-dim">${st}</g>${stL}<g class="ja-dim">${gop}</g>${gopL}<g class="ja-dim">${lh}</g>${lhL}
      <g class="ja-dim">${near}</g>${nightWater}${glowBand(P)}${beam}
    </g></svg>`;
}

/* ---------------- Stockholm: Gamla Stan, Riddarholmen's spire, Gröna Lund's wheel, City Hall across the water ---------------- */
function stockholm() {
  const P = 'js';
  let houseL = '', chL = '', wheelL = '', hallL = '';
  const mid = midCity([[40, 60, 110, 0], [700, 70, 90, 0], [1180, 60, 100, 0], [1500, 70, 120, 0]], 500);
  // Gamla Stan: painted gabled houses, each a different gable, a shaded side, white-framed windows
  const cols = ['#e2a33b', '#c2593a', '#f2d27a', '#7a9e6f', '#e07a52', '#f4e7d3', '#b0473a', '#f0b98a', '#d9c25a', '#9cb7c9'];
  let houses = '', x = 120;
  cols.forEach((c, i) => {
    const w = 52 + (i % 3) * 8, h = 120 + ((i * 37) % 60), top = 372 - h, kind = i % 3;
    const roof = kind === 0 ? `h6 v-10 h8 v-10 h8 v-10 h${w - 44} v10 h8 v10 h8 v10 h6`
      : kind === 1 ? `q4 -16 ${w * 0.2} -18 q${w * 0.05} -14 ${w * 0.3} -16 q${w * 0.25} 2 ${w * 0.3} 16 q${w * 0.16} 2 ${w * 0.2} 18`
        : `l${w / 2} -${w * 0.55} l${w / 2} ${w * 0.55}`;
    houses += `<path d="M${x} 372 V${top} ${roof} V372 Z" fill="${c}"/><path d="M${x + w - 9} 372 V${top} h9 V372 Z" fill="${SHADE}"/>`;
    houses += `<path d="M${x + w / 2 - 7} 372 v-18 a7 7 0 0 1 14 0 v18 Z" fill="#5a3a28"/>`;
    const win = wins(x + 9, top + 14, 2, Math.floor((372 - 30 - (top + 14) - 15) / 28) + 1, { w: 11, h: 15, gx: w - 29, gy: 28, fill: '#fdf8ee', k: 60 + i * 13, lit: 0.6, rx: 2, skip: [[x + w / 2 - 9, 340, x + w / 2 + 9, 372]] });
    houses += win.base.replaceAll('fill="#fdf8ee"', 'fill="#fdf8ee"') + win.base.replace(/<rect x="([\d.]+)" y="([\d.]+)" width="11" height="15" rx="2" fill="#fdf8ee"\/>/g, (m, X, Y) => `<rect x="${+X + 2}" y="${+Y + 2}" width="7" height="11" rx="1" fill="#8fb8d4"/>`);
    houseL += win.glow;
    if (kind !== 2) houses += `<circle cx="${x + w / 2}" cy="${top - 13}" r="4.5" fill="#fdf8ee"/>`;
    if (i % 4 === 1) houses += `<path d="M${x + w - 16} ${top - 4} v-20 h9 v20 Z" fill="#7a4a3a"/><g class="ja-smoke">${[0, 1, 2].map((p) => `<circle cx="${x + w - 11.5}" cy="${top - 28}" r="5" fill="#f2eef6" opacity=".9" style="animation-delay:-${p * 1.3 + i}s"/>`).join('')}</g>`;
    x += w + 2;
  });
  // Riddarholmen church: brick nave, the black openwork iron spire
  const church = `<path d="M860 372 V250 H930 V372 Z" fill="#b0473a"/><path d="M910 372 V250 H930 V372 Z" fill="${SHADE}"/><path d="M870 250 L895 70 L920 250 Z" fill="#3b3a5a"/>
    ${[110, 140, 170, 200, 228].map((y) => `<rect x="${f1(895 - (y - 70) * 0.139)}" y="${y}" width="${f1((y - 70) * 0.278)}" height="2" fill="#8a84a8"/>`).join('')}
    <rect x="894" y="54" width="2" height="16" fill="#3b3a5a"/><circle cx="895" cy="290" r="10" fill="#fdf8ee"/><circle cx="895" cy="290" r="7" fill="#8fb8d4"/><path d="M884 372 v-30 a11 11 0 0 1 22 0 v30 Z" fill="#5a3a28"/>`;
  chL += '<circle class="lit" style="--wd:.8s" cx="895" cy="290" r="7"/>';
  // Gröna Lund's Ferris wheel, turning slowly, gondolas upright, ringed with bulbs at night
  const WX = 1010, WY = 262, WR = 64;
  const gondCols = ['#ef6a5b', '#f2c14e', '#6fb6ff', '#5fb3a1', '#b9a6f2'];
  const wheel = `<path d="M${WX - 36} 372 L${WX - 3} ${WY} h6 L${WX + 36} 372 h-6 L${WX} ${WY + 10} L${WX - 30} 372 Z" fill="#e8e2d6"/>
    <g class="ja-wheel" style="transform-origin:${WX}px ${WY}px"><circle cx="${WX}" cy="${WY}" r="${WR}" fill="none" stroke="#efe9de" stroke-width="5"/><circle cx="${WX}" cy="${WY}" r="${WR - 10}" fill="none" stroke="#efe9de" stroke-width="2"/>
      ${Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2, gx = WX + Math.cos(a) * WR, gy = WY + Math.sin(a) * WR;
        return `<path d="M${WX} ${WY} L${f1(gx)} ${f1(gy)}" stroke="#efe9de" stroke-width="2"/><g class="ja-gondola" style="transform-origin:${f1(gx)}px ${f1(gy)}px"><rect x="${f1(gx - 7)}" y="${f1(gy + 3)}" width="14" height="11" rx="4" fill="${gondCols[i % 5]}"/><rect x="${f1(gx - 0.8)}" y="${f1(gy)}" width="1.6" height="4" fill="#efe9de"/></g>`; }).join('')}
      <circle cx="${WX}" cy="${WY}" r="7" fill="#f2c14e"/></g>`;
  wheelL += `<g class="ja-wheel" style="transform-origin:${WX}px ${WY}px">${bulbs(arc(WX, WY, WR, WR, 28, 0, Math.PI * 2), 9, 2.2)}${Array.from({ length: 10 }, (_, i) => bulbs(line(WX, WY, WX + Math.cos(i / 5 * Math.PI) * (WR - 6), WY + Math.sin(i / 5 * Math.PI) * (WR - 6), 4).slice(1), 60 + i, 1.4)).join('')}</g>`;
  // City Hall: red brick, arcade, the square tower with its copper lantern and three gold crowns
  const BR = '#b5523a';
  const hw = wins(1110, 300, 10, 2, { w: 10, h: 14, gx: 22, gy: 30, fill: '#fdf8ee', k: 140, lit: 0.5, rx: 2 });
  const tw = wins(1386, 160, 2, 6, { w: 9, h: 14, gx: 22, gy: 30, fill: '#fdf8ee', k: 170, lit: 0.6, rx: 2 });
  hallL += hw.glow + tw.glow;
  const hall = `<path d="M1100 372 V286 H1380 V372 Z" fill="${BR}"/><path d="M1096 286 H1384 L1370 270 H1110 Z" fill="#6aa58a"/>
    ${[1120, 1170, 1220, 1270, 1320].map((x) => `<path d="M${x} 372 v-12 a12 12 0 0 1 24 0 v12 Z" fill="#7a3a2a"/>`).join('')}${hw.base}
    <path d="M1376 372 V140 H1430 V372 Z" fill="${BR}"/><path d="M1414 372 V140 H1430 V372 Z" fill="${SHADE}"/><path d="M1370 140 H1436 V128 H1370 Z" fill="#e2c26a"/>${tw.base}
    <path d="M1380 128 V104 H1426 V128 Z" fill="#6aa58a"/>${[1388, 1403, 1418].map((x) => `<path d="M${x - 4} 124 v-10 a4 4 0 0 1 8 0 v10 Z" fill="#2f5a4a"/>`).join('')}
    <path d="M1384 104 Q1403 74 1422 104 Z" fill="#6aa58a"/><rect x="1402" y="62" width="2" height="29" fill="#2f5a4a"/>
    ${[-10, 0, 10].map((dx, i) => `<path d="M${1403 + dx - 4} ${i === 1 ? 58 : 64} l2 -6 l2 4 l2 -4 l2 6 z" fill="#ffd34d"/>`).join('')}
    <g class="ja-flag" style="transform-origin:1340px 250px"><rect x="1339" y="226" width="2" height="44" fill="#5a3a28"/><path d="M1341 226 h26 v16 h-26 z" fill="#3d7fd1"/><path d="M1341 232 h26 v4 h-26 z M1349 226 h4 v16 h-4 z" fill="#ffd34d"/></g>`;
  hallL += bulbs([...line(1096, 286, 1384, 286, 48), ...line(1370, 140, 1436, 140, 10), ...quad(1384, 104, 1403, 74, 1422, 104, 8)], 11);
  // water across the front: ferry, sailboat, shimmer and (at night) the lights reflected
  const water = `<path d="M0 430 V372 H1600 V430 Z" fill="url(#${P}-water)"/>${shimmer(10, 1590, 382, 21)}
    <g class="ja-ferry"><g class="ja-bob" style="transform-origin:0 380px"><path d="M-60 380 h120 l-12 14 h-96 z" fill="#fdf8ee"/><path d="M-60 386 h116 l-3 4 h-110 z" fill="#2f5a7a"/><path d="M-44 380 v-14 h80 v14" fill="#ffffff"/>
      ${[-36, -22, -8, 6, 20].map((x) => `<rect x="${x}" y="369" width="9" height="7" rx="1.5" fill="#8fb8d4"/>`).join('')}<path d="M8 366 v-14 h12 v14 z" fill="#2f2d3b"/><rect x="8" y="355" width="12" height="3" fill="#ffd34d"/></g></g>
    <g class="ja-bob" style="transform-origin:1520px 376px;--bd:-1.4s"><path d="M1494 376 h52 l-8 9 h-36 z" fill="#3b3a5a"/><path d="M1518 376 v-44 l24 38 z" fill="#fff"/><path d="M1516 376 v-36 l-16 32 z" fill="#f2c14e"/></g>`;
  const birches = [60, 1070, 1470].map((x, i) => `<g class="ja-breathe" style="--sd:-${i}s;transform-origin:${x}px 372px"><path d="M${x - 2.5} 372 v-56 h5 v56 Z" fill="#f4f0e6"/><path d="M${x - 2.5} 340 h3 M${x} 356 h2.5" stroke="#3b3a5a" stroke-width="1.6"/><ellipse cx="${x}" cy="330" rx="20" ry="30" fill="${i % 2 ? '#8fc46a' : '#6fb36a'}"/><ellipse cx="${x - 6}" cy="318" rx="10" ry="14" fill="#a6dc8f"/></g>`).join('');
  const nightWater = refl([[180], [260], [340], [420], [560], [895], [1010, '#fff3c4'], [1130], [1210], [1300], [1403], [1340]], 372, P);
  return `<svg viewBox="0 0 1600 400" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">${defs(P)}
    <g transform="translate(0 -26)">
      <path d="M-10 400 V300 Q200 270 420 296 T860 288 T1300 280 T1640 296 V400 Z" fill="var(--jl1)"/><path d="${haze(41, 300)}" fill="var(--jl1)"/>${mist(P, 300, 0.7)}${drift()}
      <path d="${mid.d}" fill="var(--jl2)"/>${mid.base}${mid.glow}${mist(P, 330, 0.5)}
      <g class="ja-dim">${houses}</g>${houseL}<g class="ja-dim">${church}</g>${chL}<g class="ja-dim">${wheel}</g>${wheelL}<g class="ja-dim">${hall}</g>${hallL}<g class="ja-dim">${birches}${water}</g>${nightWater}${glowBand(P)}
    </g></svg>`;
}

/* ---------------- Bengaluru: glass towers, Vidhana Soudha lit up, the purple metro, a crane, gulmohar trees ---------------- */
function bengaluru() {
  const P = 'jb';
  let towers = '', towerL = '', craneL = '', soL = '';
  const mid = midCity([[20, 50, 150, 1], [420, 60, 120, 1], [560, 50, 170, 0], [1280, 54, 140, 1], [1370, 46, 110, 0]], 700);
  // glass towers: a cool gradient, mullions, a reflected streak, red aviation lights
  [[150, 70, 220, 0], [232, 56, 160, 1], [300, 64, 260, 0], [1430, 74, 270, 0], [1516, 58, 190, 1]].forEach(([x, w, h, alt], i) => {
    const top = 400 - h;
    towers += `<path d="M${x} 400 V${top} h${w} V400 Z" fill="url(#${P}-glass${alt})"/><path d="M${x + w - 14} 400 V${top} h14 V400 Z" fill="${SHADE}"/>`;
    for (let yy = top + 12; yy < 396; yy += 16) towers += `<rect x="${x + 4}" y="${yy}" width="${w - 8}" height="1.6" fill="rgba(255,255,255,.35)"/>`;
    towers += `<path d="M${x + 8} ${top + 30} l${w * 0.5} -${w * 0.35} v14 l-${w * 0.5} ${w * 0.35} Z" fill="rgba(255,255,255,.28)"/>`;
    const g = wins(x + 6, top + 14, Math.floor((w - 12) / 10), Math.floor((h - 30) / 16), { w: 5, h: 8, gx: 10, gy: 16, fill: 'transparent', k: 900 + i * 41, lit: 0.45 });
    towerL += g.glow;
    if (h > 200) { towers += `<rect x="${x + w / 2 - 1}" y="${top - 22}" width="2" height="22" fill="#5a5a7a"/>`; towerL += `<circle class="blink-r" cx="${x + w / 2}" cy="${top - 24}" r="3.4" fill="#ff4d4d" style="animation-delay:-${i * 0.4}s"/>`; }
    else towers += `<g transform="translate(${x + w - 22} ${top})"><path d="M-9 0 v-6 M9 0 v-6 M-9 -3 h18" stroke="#6a6a84" stroke-width="1.6"/><rect x="-10" y="-8" width="20" height="2.5" rx="1" fill="#6a6a84"/><path d="M-8 -8 v-11 q0 -3 3 -3 h10 q3 0 3 3 v11 z" fill="#3a3a4c"/><path d="M-8 -12 h16 M-8 -16 h16" stroke="#55556a" stroke-width="1"/><path d="M-4 -22 q4 -3 8 0 z" fill="#3a3a4c"/><rect x="-6" y="-20" width="2" height="10" rx="1" fill="rgba(255,255,255,.25)"/></g>`;
  });
  towers += `<path d="M1430 130 L1467 96 L1504 130 Z" fill="#e8dcc0"/><rect x="1466" y="78" width="2" height="18" fill="#5a5a7a"/>`;
  towerL += `<circle class="blink-r" cx="1467" cy="76" r="3.4" fill="#ff4d4d"/>` + bulbs(line(1430, 130, 1467, 96, 8).concat(line(1467, 96, 1504, 130, 8)), 30);
  // the crane over a half-built block, its jib swinging slowly
  const crane = `<path d="M640 400 V292 H730 V400 Z" fill="#d8d2c4"/><path d="M640 292 h90 v4 h-90 Z M640 326 h90 v3 h-90 Z M640 360 h90 v3 h-90 Z" fill="#b8b0a0"/>
    <path d="M757 400 V130 h7 V400 Z" fill="#f2b134"/>${Array.from({ length: 10 }, (_, i) => `<path d="M757 ${390 - i * 26} l7 -13" stroke="#c9861a" stroke-width="1.6"/>`).join('')}
    <g class="ja-jib" style="transform-origin:760px 132px"><path d="M700 128 H900 v6 H700 Z" fill="#f2b134"/><path d="M760 128 L780 104 L800 128 M780 104 L900 128 M780 104 L712 128" fill="none" stroke="#c9861a" stroke-width="1.6"/><rect x="696" y="126" width="20" height="16" fill="#8a84a0"/>
      <g class="ja-hook" style="transform-origin:860px 134px"><rect x="859.3" y="134" width="1.4" height="76" fill="#5a5a7a"/><rect x="846" y="210" width="28" height="10" rx="2" fill="#ef6a5b"/></g></g>`;
  craneL += `<circle class="blink-r" cx="760" cy="126" r="3" fill="#ff4d4d"/>`;
  // Vidhana Soudha: granite front, colonnade, the great dome; outlined in bulbs at night
  const VX = 1050, GR = '#efe2c4', GR2 = '#e3cf9d';
  const vw = wins(VX - 170, 336, 7, 2, { w: 8, h: 12, gx: 14, gy: 24, fill: '#fdf8ee', k: 300, rx: 3 });
  const vw2 = wins(VX + 66, 336, 7, 2, { w: 8, h: 12, gx: 14, gy: 24, fill: '#fdf8ee', k: 330, rx: 3 });
  soL += vw.glow + vw2.glow;
  const soudha = `<path d="M${VX - 180} 400 V324 H${VX + 180} V400 Z" fill="${GR}"/><path d="M${VX + 120} 400 V324 H${VX + 180} V400 Z" fill="${SHADE}"/><path d="M${VX - 186} 324 H${VX + 186} V312 H${VX - 186} Z" fill="${GR2}"/>${vw.base}${vw2.base}
    <path d="M${VX - 62} 400 V300 H${VX + 62} V400 Z" fill="${GR}"/><path d="M${VX - 68} 300 H${VX + 68} L${VX + 52} 284 H${VX - 52} Z" fill="${GR2}"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${VX - 54 + i * 13}" y="306" width="5" height="88" fill="#d8c79f"/>`).join('')}<path d="M${VX - 54} 306 h108 v8 h-108 Z" fill="rgba(90,70,40,.18)"/>
    <path d="M${VX - 44} 284 V252 H${VX + 44} V284 Z" fill="${GR}"/>${[-30, -15, 0, 15, 30].map((d) => `<path d="M${VX + d - 4} 280 v-18 a4 4 0 0 1 8 0 v18 Z" fill="#c9b48a"/>`).join('')}
    <path d="M${VX - 40} 252 A40 44 0 0 1 ${VX + 40} 252 Z" fill="${GR2}"/><path d="M${VX + 6} 252 A40 44 0 0 0 ${VX} 208 A40 44 0 0 1 ${VX + 40} 252 Z" fill="${SHADE}"/>
    <rect x="${VX - 1.5}" y="194" width="3" height="14" fill="#c99a2e"/><circle cx="${VX}" cy="191" r="5" fill="#f2c14e"/>
    ${[-150, 150].map((d) => `<path d="M${VX + d - 16} 312 V296 H${VX + d + 16} V312 Z" fill="${GR}"/><path d="M${VX + d - 16} 296 A16 16 0 0 1 ${VX + d + 16} 296 Z" fill="${GR2}"/>`).join('')}`;
  soL += bulbs([...line(VX - 186, 312, VX + 186, 312, 56), ...line(VX - 68, 300, VX - 52, 284, 3), ...line(VX - 52, 284, VX + 52, 284, 16), ...line(VX + 52, 284, VX + 68, 300, 3),
    ...line(VX - 44, 252, VX + 44, 252, 12), ...arc(VX, 252, 40, 44, 16), ...arc(VX - 150, 296, 16, 16, 6), ...arc(VX + 150, 296, 16, 16, 6),
    ...Array.from({ length: 9 }, (_, i) => line(VX - 51.5 + i * 13, 310, VX - 51.5 + i * 13, 392, 7)).flat()], 50, 1.7);
  // the purple metro on its viaduct
  const viaduct = `${[60, 300, 540, 780, 1020, 1260, 1500].map((x) => `<path d="M${x - 9} 400 V378 h18 V400 Z" fill="#bdb5c9"/><path d="M${x - 24} 378 h48 l-10 -4 h-28 Z" fill="#cfc8d8"/><path d="M${x + 3} 400 V378 h6 V400 Z" fill="${SHADE}"/>`).join('')}
    <path d="M-10 352 H1610 V374 H-10 Z" fill="#d9d3e0"/><path d="M-10 366 H1610 V374 H-10 Z" fill="#b7aec4"/><path d="M-10 348 H1610 V353 H-10 Z" fill="#ece8f2"/>
    ${Array.from({ length: 40 }, (_, i) => `<rect x="${i * 40 + 18}" y="354" width="1.4" height="12" fill="rgba(60,50,90,.12)"/>`).join('')}`;
  // Namma Metro: a six-car set, stainless body with the purple band, a dark window strip, sliding doors,
  // gangways between cars, bogies on the deck, sloped cabs with a headlight at the front and a tail lamp behind
  const CAR = 118, TOP = 318, BOT = 346, N = 6;
  const bogie = (x) => `<rect x="${x}" y="${BOT - 1}" width="22" height="5" rx="2" fill="#2f2d3b"/><circle cx="${x + 5}" cy="${BOT + 3}" r="2.6" fill="#55556a"/><circle cx="${x + 17}" cy="${BOT + 3}" r="2.6" fill="#55556a"/>`;
  let tb = '', tl = '';
  for (let c = 0; c < N; c++) {
    const x = c * (CAR + 4), first = c === N - 1, last = c === 0; // it runs left → right, so the cab leading is on the right
    const L = x + (last ? 14 : 0), Rr = x + CAR - (first ? 14 : 0);
    // body: rounded box, sloped nose on the end cars
    let body = `M${L} ${BOT} V${TOP + 6} q0 -6 6 -6 H${Rr - 6} q6 0 6 6 V${BOT} Z`;
    if (first) body += ` M${Rr - 1} ${BOT} V${TOP + 4} q6 0 10 6 l4 10 q1 6 0 ${BOT - TOP - 20} Z`;
    if (last) body += ` M${L + 1} ${BOT} V${TOP + 4} q-6 0 -10 6 l-4 10 q-1 6 0 ${BOT - TOP - 20} Z`;
    tb += `<path d="${body}" fill="#e3e7ee"/>`;
    tb += `<rect x="${L}" y="${TOP + 1}" width="${Rr - L}" height="2.5" fill="#f6f8fb"/>`; // roof highlight
    tb += `<rect x="${x + 30}" y="${TOP - 4}" width="22" height="4" rx="1.5" fill="#c9ced8"/><rect x="${x + 66}" y="${TOP - 4}" width="22" height="4" rx="1.5" fill="#c9ced8"/>`; // roof AC units
    tb += `<rect x="${L}" y="${TOP + 7}" width="${Rr - L}" height="10" fill="#2e3550"/>`; // window strip
    tb += `<rect x="${L}" y="${BOT - 9}" width="${Rr - L}" height="4" fill="#7b3fb8"/><rect x="${L}" y="${BOT - 5}" width="${Rr - L}" height="1.6" fill="#b48ae0"/>`; // purple band
    tb += `<rect x="${L}" y="${BOT - 3}" width="${Rr - L}" height="3" fill="#c3c8d2"/>`; // skirt
    // windows between two sets of doors
    const panes = [[x + 8, 14], [x + 40, 18], [x + 60, 18], [x + 96, 14]];
    panes.forEach(([px, pw]) => { if (px >= L && px + pw <= Rr) { tb += `<rect x="${px}" y="${TOP + 8.5}" width="${pw}" height="7" rx="1.2" fill="#9cc1dc"/>`; tl += `<rect class="lit" style="--wd:.2s" x="${px}" y="${TOP + 8.5}" width="${pw}" height="7" rx="1.2"/>`; } });
    [x + 24, x + 82].forEach((dx) => { tb += `<rect x="${dx}" y="${TOP + 5}" width="12" height="${BOT - TOP - 9}" rx="1" fill="#d3d8e1"/><path d="M${dx + 6} ${TOP + 5} V${BOT - 4}" stroke="#aeb4c0" stroke-width="1"/><rect x="${dx + 1.5}" y="${TOP + 8.5}" width="3.5" height="7" rx="1" fill="#9cc1dc"/><rect x="${dx + 7}" y="${TOP + 8.5}" width="3.5" height="7" rx="1" fill="#9cc1dc"/>`; });
    tb += bogie(x + 10) + bogie(x + CAR - 32);
    if (c < N - 1) tb += `<rect x="${x + CAR}" y="${TOP + 6}" width="4" height="${BOT - TOP - 8}" fill="#3b3a5a"/>`; // gangway
    if (first) { tb += `<path d="M${Rr + 2} ${TOP + 7} l7 0 l4 9 h-11 z" fill="#1f2438"/>`; tl += `<circle cx="${Rr + 11}" cy="${BOT - 7}" r="1.8" fill="#fff6cf"/><path class="ja-headbeam" d="M${Rr + 12} ${BOT - 7} l60 -8 v16 z" fill="#fff3c4"/>`; tb += `<circle cx="${Rr + 11}" cy="${BOT - 7}" r="1.8" fill="#fff6cf"/>`; }
    if (last) { tb += `<path d="M${L - 2} ${TOP + 7} l-7 0 l-4 9 h11 z" fill="#1f2438"/><circle cx="${L - 11}" cy="${BOT - 7}" r="1.8" fill="#e0533f"/>`; tl += `<circle class="blink-r" cx="${L - 11}" cy="${BOT - 7}" r="2" fill="#ff4d4d"/>`; }
  }
  const train = `<g class="ja-metro"><g class="ja-dim">${tb}</g>${tl}</g>`;
  const trees = [tree(90, 26, 1, true), tree(400, 24, 2), tree(600, 26, 3, true), tree(820, 28, 4), tree(1250, 30, 5, true), tree(1395, 22, 6), tree(1590, 26, 7, true)].join('');
  const petals = `<g class="ja-petals">${[0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="${[90, 600, 1250][i % 3] + (i > 2 ? 14 : -10)}" cy="340" rx="3" ry="2" fill="#f06a3c" style="--pd:-${(i * 1.7).toFixed(1)}s"/>`).join('')}</g>`;
  return `<svg viewBox="0 0 1600 400" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
    ${defs(P, `<linearGradient id="${P}-glass0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec3e6"/><stop offset="1" stop-color="#5f9ccc"/></linearGradient><linearGradient id="${P}-glass1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8d8de"/><stop offset="1" stop-color="#6fb2bd"/></linearGradient>`)}
    <g transform="translate(0 -24)">
      <path d="${haze(77, 300)}M700 400 V210 h30 V400 Z M1180 400 V220 h26 V400 Z" fill="var(--jl1)"/>${mist(P, 300, 0.7)}${drift()}
      <path d="${mid.d}" fill="var(--jl2)"/>${mid.base}${mid.glow}${mist(P, 330, 0.5)}
      <g class="ja-dim">${towers}</g>${towerL}<g class="ja-dim">${crane}</g>${craneL}
      ${train}<g class="ja-dim">${viaduct}</g>
      <g class="ja-dim">${soudha}</g>${soL}<g class="ja-dim">${trees}${petals}</g>${glowBand(P)}
    </g></svg>`;
}

export const journeyScenes = { Chennai: chennai(), Stockholm: stockholm(), Bengaluru: bengaluru() };

export function journeySky() {
  const cloud = (x, y, k, sc) => `<g class="ja-cloud" style="--cd:${(140 + rnd(k) * 90).toFixed(0)}s;--cdl:-${(rnd(k + 1) * 140).toFixed(0)}s"><g transform="translate(${x} ${y}) scale(${sc})">
    <path d="M0 30 a20 18 0 0 1 22 -24 a28 26 0 0 1 50 -2 a20 18 0 0 1 30 26 z" fill="var(--cloud)" opacity=".92"/><path d="M6 30 h92 a4 4 0 0 1 0 0 q-46 -10 -92 0 z" fill="var(--cloud-shade)" opacity=".7"/></g></g>`;
  const stars = Array.from({ length: 40 }, (_, i) => `<circle class="st" style="--sd:${(rnd(i) * 1.6).toFixed(2)}s;--d:-${(rnd(i + 2) * 3).toFixed(1)}s" cx="${(rnd(i + 4) * 1600).toFixed(0)}" cy="${(rnd(i + 6) * 260).toFixed(0)}" r="${(1 + rnd(i + 8) * 1.4).toFixed(1)}" fill="#fff6d6"/>`).join('');
  const sun = `<g class="ja-sun"><circle class="ja-halo" cx="1110" cy="300" r="80" fill="url(#jsky-halo)"/><circle cx="1110" cy="300" r="26" fill="#ffd45e"/><circle cx="1110" cy="300" r="20" fill="#ffe08a"/></g>`;
  const moon = `<g class="ja-moon"><circle cx="1110" cy="300" r="70" fill="url(#jsky-mhalo)"/><path d="M1122 274 a28 28 0 1 0 18 48 a23 23 0 1 1 -18 -48 z" fill="#fff4cf"/></g>`;
  return `<svg viewBox="0 0 1600 400" preserveAspectRatio="xMidYMin meet" aria-hidden="true"><defs>
    <radialGradient id="jsky-halo"><stop offset=".25" stop-color="#fff1bd" stop-opacity=".9"/><stop offset="1" stop-color="#fff1bd" stop-opacity="0"/></radialGradient>
    <radialGradient id="jsky-mhalo"><stop offset=".3" stop-color="#b9b4ff" stop-opacity=".35"/><stop offset="1" stop-color="#b9b4ff" stop-opacity="0"/></radialGradient></defs>
    <g class="stars">${stars}</g>${sun}${moon}
    ${cloud(140, 60, 1, 1.1)}${cloud(620, 150, 2, 0.8)}${cloud(1050, 40, 3, 1.25)}${cloud(1400, 190, 4, 0.7)}${cloud(380, 250, 5, 0.6)}</svg>`;
}

// the rolling hills along the road: a far ridge with tiny villages, a near one with trees, bushes, flowers and lamps
export function journeyHills() {
  let near = 'M0 260 ', far = 'M0 214 ';
  for (let x = 0; x <= 6000; x += 200) near += `Q${x + 100} ${200 + ((x / 200) % 3) * 30} ${x + 200} 240 `;
  for (let x = 0; x <= 6000; x += 340) far += `Q${x + 170} ${178 + ((x / 340) % 4) * 10} ${x + 340} 208 `;
  near += 'V400 H0 Z'; far += 'V400 H0 Z';
  let farBits = '', nearBits = '';
  for (let x = 140, k = 0; x < 6000; x += 260 + rnd(k) * 260, k++) {
    const y = 200 + rnd(k + 1) * 8;
    farBits += rnd(k + 2) < 0.5
      ? `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><path d="M-9 0 v-12 l9 -8 l9 8 v12 z" fill="#f4e7d3" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M-11 -11 l11 -10 l11 10" fill="none" stroke="${INK}" stroke-width="1.8"/><rect class="lit" style="--wd:${(rnd(k) * 1.5).toFixed(2)}s" x="-3" y="-9" width="5" height="5"/></g>`
      : `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><path d="M0 0 v-8" stroke="${INK}" stroke-width="2"/><circle cy="-14" r="8" fill="var(--leaf-2)" stroke="${INK}" stroke-width="1.8"/></g>`;
  }
  for (let x = 60, k = 50; x < 6000; x += 90 + rnd(k) * 110, k++) {
    const y = 236 - ((x / 13) % 18), r = rnd(k + 1);
    if (r < 0.42) nearBits += `<g class="ja-sway" style="--sd:-${(rnd(k + 2) * 4).toFixed(1)}s;transform-origin:${x.toFixed(0)}px ${y.toFixed(0)}px"><g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><path d="M0 0 v-20" stroke="${INK}" stroke-width="4"/><circle cy="-34" r="${(16 + rnd(k + 3) * 8).toFixed(0)}" fill="${rnd(k + 4) < 0.25 ? 'var(--bloom)' : 'var(--leaf-1)'}" stroke="${INK}" stroke-width="3"/><path d="M-8 -42 q4 -5 10 -5" stroke="var(--leaf-hi)" stroke-width="3" fill="none" stroke-linecap="round"/></g></g>`;
    else if (r < 0.6) nearBits += `<g class="ja-sway" style="--sd:-${(rnd(k + 2) * 4).toFixed(1)}s;transform-origin:${x.toFixed(0)}px ${y.toFixed(0)}px"><g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><path d="M0 0 v-10" stroke="${INK}" stroke-width="4"/><path d="M0 -62 C14 -46 14 -18 0 -10 C-14 -18 -14 -46 0 -62 Z" fill="var(--leaf-2)" stroke="${INK}" stroke-width="3"/></g></g>`;
    else if (r < 0.8) nearBits += `<path transform="translate(${x.toFixed(0)} ${(y + 4).toFixed(0)})" d="M-18 0 a10 9 0 0 1 9 -12 a12 11 0 0 1 20 -1 a9 8 0 0 1 8 13 z" fill="var(--leaf-2)" stroke="${INK}" stroke-width="2.6"/>`
      + [0, 1, 2].map((f) => `<circle cx="${(x - 10 + f * 9).toFixed(0)}" cy="${(y - 4 - (f % 2) * 4).toFixed(0)}" r="2.4" fill="${['#ffb347', '#fff4e0', '#ff8fa3'][f]}"/>`).join('');
    else if (r < 0.9) nearBits += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><path d="M0 0 v-46 q0 -6 8 -6 h6" fill="none" stroke="${INK}" stroke-width="3.2"/><circle cx="16" cy="-50" r="4" fill="#fff4e0" stroke="${INK}" stroke-width="2"/><circle class="lit" style="--wd:${(rnd(k) * 1.2).toFixed(2)}s" cx="16" cy="-50" r="3"/><circle class="ja-glow" cx="16" cy="-50" r="14" fill="#ffe9a8"/></g>`;
    else nearBits += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})" stroke="${INK}" stroke-width="2.4"><path d="M-20 0 v-16 M-6 0 v-16 M8 0 v-16 M22 0 v-16"/><path d="M-24 -11 h50 M-24 -4 h50" stroke-width="2"/></g>`;
  }
  return `<svg viewBox="0 0 6000 400" preserveAspectRatio="none"><path d="${far}" fill="var(--hill-far)" stroke="${INK}" stroke-width="2.5"/>${farBits}<path d="${near}" fill="var(--hill-near)" stroke="${INK}" stroke-width="3"/>${nearBits}</svg>`;
}
