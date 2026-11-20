/* Mecanismos Vivos — simulaciones de cinemática (sin dependencias) */
'use strict';

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const rad = d => d * Math.PI / 180;
const deg = r => r * 180 / Math.PI;
const TAU = Math.PI * 2;
const fmt = (x, d = 2) => (Math.round(x * 10 ** d) / 10 ** d).toString().replace('.', ',');

function colors() {
  const s = getComputedStyle(document.documentElement);
  const g = n => s.getPropertyValue(n).trim();
  return {
    ground: g('--c-ground'), input: g('--c-input'), coupler: g('--c-coupler'), output: g('--c-output'),
    accent: g('--accent'), soft: g('--accent-soft'), ink: g('--ink'), muted: g('--muted'),
    line: g('--line'), surface: g('--surface'), surface2: g('--surface2'),
    ok: g('--ok'), bad: g('--bad')
  };
}

function makeCanvas(el, W = 900, H = 480) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  el.width = W * dpr; el.height = H * dpr;
  el.style.aspectRatio = `${W} / ${H}`;
  const ctx = el.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W, H };
}

function mkControls(el, defs, onChange) {
  const vals = {}, inputs = {};
  defs.forEach(d => {
    const row = document.createElement('label');
    row.className = 'ctl';
    row.innerHTML = `<span class="ctl-name">${d.label}</span><input type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.val}"><output></output>`;
    const inp = row.querySelector('input'), out = row.querySelector('output');
    const upd = () => { vals[d.id] = +inp.value; out.textContent = fmt(+inp.value, d.dec ?? 1) + (d.unit || ''); };
    inputs[d.id] = { inp, upd };
    inp.addEventListener('input', () => { upd(); onChange(vals, d.id); });
    upd();
    el.appendChild(row);
  });
  return {
    vals,
    set(o) {
      for (const k in o) { inputs[k].inp.value = o[k]; inputs[k].upd(); }
      onChange(vals);
    }
  };
}

/* ---------- bucle de animación ---------- */
const state = { paused: false };
const demos = [];
/* una animación corre mientras sea visible cualquier parte de su figura (lienzo, gráfica o texto asociado), no solo el lienzo principal */
const io = new IntersectionObserver(es => es.forEach(e => { e.target._vis = e.isIntersecting; (e.target._ds || []).forEach(d => { d.vis = e.isIntersecting; }); }));
function register(canvas, tick) {
  const d = { tick, vis: false };
  const host = canvas.closest('figure, .card, .grid-2') || canvas;
  canvas._demo = d; demos.push(d);
  (host._ds = host._ds || []).push(d); d.vis = !!host._vis; io.observe(host);
  return d;
}
let lastT = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  if (!state.paused) demos.forEach(d => d.vis && d.tick(dt));
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
$('#pause').addEventListener('click', e => {
  state.paused = !state.paused;
  e.currentTarget.setAttribute('aria-pressed', state.paused);
  e.currentTarget.textContent = state.paused ? '▶ Reanudar' : '⏸ Pausar';
});
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) { state.paused = true; $('#pause').textContent = '▶ Reanudar'; $('#pause').setAttribute('aria-pressed', true); }

/* ---------- primitivas de dibujo ---------- */
function bar(ctx, p, q, color, w = 9) {
  ctx.lineCap = 'round'; ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
}
function pin(ctx, p, C, r = 7, filled = false) {
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU);
  ctx.fillStyle = filled ? C.ink : C.surface; ctx.fill();
  ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
}
function groundMark(ctx, p, C, w = 34) {
  ctx.strokeStyle = C.ground; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  const y = p.y + 14;
  ctx.beginPath(); ctx.moveTo(p.x - w / 2, y); ctx.lineTo(p.x + w / 2, y); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const x = p.x - w / 2 + i * (w / 4);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 7, y + 9); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(p.x, p.y + 7); ctx.lineTo(p.x, y); ctx.stroke();
}
function text(ctx, s, x, y, C, o = {}) {
  ctx.font = `${o.weight || 600} ${o.size || 15}px system-ui,sans-serif`;
  ctx.fillStyle = o.color || C.ink; ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
  ctx.fillText(s, x, y);
}
function tag(ctx, s, x, y, C, color) {
  ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fillStyle = color; ctx.fill();
  text(ctx, s, x, y + 0.5, C, { color: '#fff', size: 13, weight: 700 });
}
const lerp = (a, b, t) => a + (b - a) * t;
const mid = (p, q) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });

/* círculo-círculo: intersección (sign = ±1 elige rama). devuelve null si no se cortan */
function circInt(c0, r0, c1, r1, sign) {
  const dx = c1.x - c0.x, dy = c1.y - c0.y, d = Math.hypot(dx, dy);
  if (d < 1e-9 || d > r0 + r1 + 1e-7 || d < Math.abs(r0 - r1) - 1e-7) return null;
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r0 * r0 - a * a));
  const ux = dx / d, uy = dy / d;
  return { x: c0.x + a * ux - sign * h * uy, y: c0.y + a * uy + sign * h * ux };
}

/* barre un ángulo de entrada y devuelve el rango alcanzable (completo o arco continuo más largo) */
function sweepRange(reach, step = 0.5) {
  const n = Math.round(360 / step);
  const f = [];
  for (let i = 0; i < n; i++) f.push(reach(rad(i * step)));
  if (f.every(Boolean)) return { full: true, start: 0, end: 360 };
  if (!f.some(Boolean)) return { none: true };
  let best = { len: 0, s: 0 };
  for (let i = 0; i < n; i++) {
    if (f[i] && !f[(i - 1 + n) % n]) {
      let len = 0;
      while (f[(i + len) % n] && len < n) len++;
      if (len > best.len) best = { len, s: i };
    }
  }
  return { full: false, start: best.s * step, end: (best.s + best.len - 1) * step };
}

/* controlador de fase: giro completo o vaivén entre límites */
function phaser(range, speed = 70) {
  let t = 0;
  return dt => {
    t += dt * speed;
    if (range.full) return rad(t % 360);
    const L = range.end - range.start;
    if (L <= 0) return rad(range.start);
    const m = t % (2 * L);
    return rad(range.start + (m < L ? m : 2 * L - m));
  };
}

/* ====================================================================
   1) CUATRO BARRAS (reutilizable)
   ==================================================================== */
function solveFour(P, th, sign = 1) {
  const A = { x: P.a * Math.cos(th), y: P.a * Math.sin(th) };
  const O4 = { x: P.g, y: 0 };
  const B = circInt(A, P.b, O4, P.c, sign);
  return B ? { A, B, O4, O2: { x: 0, y: 0 } } : null;
}

function classifyFour(g, a, b, c) {
  const L = [{ n: 'bancada', v: g }, { n: 'entrada', v: a }, { n: 'acoplador', v: b }, { n: 'salida', v: c }];
  const s = [...L].sort((x, y) => x.v - y.v);
  const S = s[0], Lg = s[3], p = s[1], q = s[2];
  const lhs = S.v + Lg.v, rhs = p.v + q.v;
  const eq = Math.abs(lhs - rhs) < 1e-6;
  let cat, why;
  if (eq) { cat = 'Punto de cambio'; why = 'Las sumas son iguales: en algún momento todos los eslabones quedan alineados y el movimiento se vuelve indeterminado.'; return { cat, why, S, Lg, p, q, lhs, rhs, kind: 'warn' }; }
  if (lhs > rhs) { cat = 'Triple balancín'; why = 'No se cumple Grashof: ningún eslabón móvil puede dar una vuelta completa.'; return { cat, why, S, Lg, p, q, lhs, rhs, kind: 'bad' }; }
  if (S.n === 'bancada') { cat = 'Doble manivela'; why = 'Cumple Grashof y el eslabón más corto es la bancada: entrada y salida giran vueltas completas.'; }
  else if (S.n === 'acoplador') { cat = 'Doble balancín'; why = 'Cumple Grashof y el más corto es el acoplador (opuesto a la bancada): los dos eslabones fijos solo oscilan.'; }
  else { cat = 'Manivela-balancín'; why = `Cumple Grashof y el más corto (${S.n}) está junto a la bancada: ese eslabón gira completo y el otro oscila.`; }
  return { cat, why, S, Lg, p, q, lhs, rhs, kind: 'ok' };
}

function fourBarDemo(canvas, getP, opts = {}) {
  const { ctx, W, H } = makeCanvas(canvas, opts.W || 900, opts.H || 480);
  let key = '', cache = null, step = null;

  function build(P) {
    const k = JSON.stringify([P, !!opts.wiper, opts.fixed ? opts.fixed() : 0]);
    if (k === key) return cache;
    key = k;
    const range = sweepRange(th => !!solveFour(P, th, 1));
    if (range.none) { cache = { range }; step = null; return cache; }
    const trace = [], pts = [];
    const lo = range.start, hi = range.end;
    for (let a = lo; a <= hi + 1e-9; a += 1) {
      const s = framed(solveFour(P, rad(a), 1), P); if (!s) continue;
      trace.push(s.tip); pts.push(s.O2, s.O4, s.A, s.B, s.tip);
    }
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    pts.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); });
    const m = 50, sc = Math.min((W - 2 * m) / Math.max(x1 - x0, 1e-6), (H - 2 * m - 20) / Math.max(y1 - y0, 1e-6));
    const view = { sc, ox: (W - (x1 - x0) * sc) / 2 - x0 * sc, oy: (H - 20 - (y1 - y0) * sc) / 2 + y1 * sc + 4 };
    cache = { range, trace, view };
    step = phaser(range);
    return cache;
  }
  function tipOf(s, P) {
    if (opts.wiper) return { x: s.O4.x + (s.B.x - s.O4.x) * opts.wiper, y: s.O4.y + (s.B.y - s.O4.y) * opts.wiper };
    const ex = (s.B.x - s.A.x) / P.b, ey = (s.B.y - s.A.y) / P.b;
    const u = P.b * (opts.cpu ?? 0.5), v = P.b * (opts.cpv ?? 0.55);
    return { x: s.A.x + u * ex - v * ey, y: s.A.y + u * ey + v * ex };
  }
  function framed(s, P) {
    if (!s) return null;
    const k = opts.fixed ? opts.fixed() : 0;
    const J = [s.O2, s.A, s.B, s.O4];
    const raw = { O2: s.O2, A: s.A, B: s.B, O4: s.O4, tip: tipOf(s, P) };
    if (k === 0) return raw;
    const e = [[0, 3], [0, 1], [1, 2], [3, 2]][k];
    const p = J[e[0]], q = J[e[1]], ang = Math.atan2(q.y - p.y, q.x - p.x), c = Math.cos(-ang), sn = Math.sin(-ang);
    const f = pt => ({ x: (pt.x - p.x) * c - (pt.y - p.y) * sn, y: (pt.x - p.x) * sn + (pt.y - p.y) * c });
    return { O2: f(raw.O2), A: f(raw.A), B: f(raw.B), O4: f(raw.O4), tip: f(raw.tip) };
  }
  const T = (p, v) => ({ x: v.ox + p.x * v.sc, y: v.oy - p.y * v.sc });

  let th = 0;
  function draw() {
    const P = getP(), C = colors();
    const c = build(P);
    ctx.clearRect(0, 0, W, H);
    if (c.range.none) {
      text(ctx, 'Con estas longitudes los eslabones no se pueden ensamblar', W / 2, H / 2 - 10, C, { color: C.bad, size: 18 });
      text(ctx, 'Ningún eslabón puede ser mayor que la suma de los otros tres.', W / 2, H / 2 + 18, C, { color: C.muted, size: 14, weight: 400 });
      return;
    }
    const s = framed(solveFour(P, th, 1) || solveFour(P, rad(c.range.start), 1), P);
    const v = c.view;
    // rejilla
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.globalAlpha = .5;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.globalAlpha = 1;

    // trayectoria
    ctx.beginPath();
    c.trace.forEach((t, i) => { const q = T(t, v); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); });
    if (opts.wiper) {
      const o4 = T(s.O4, v);
      ctx.lineTo(o4.x, o4.y); ctx.closePath(); ctx.fillStyle = C.soft; ctx.fill();
    }
    ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.strokeStyle = C.accent; ctx.stroke(); ctx.setLineDash([]);

    const O2 = T(s.O2, v), O4 = T(s.O4, v), A = T(s.A, v), B = T(s.B, v), tip = T(s.tip, v);
    // bancada
    const fk = opts.fixed ? opts.fixed() : 0;
    bar(ctx, O2, O4, C.ground, fk ? 9 : 5);
    if (fk) { const e = [[0, 3], [0, 1], [1, 2], [3, 2]][fk], pts4 = [O2, A, B, O4]; groundMark(ctx, pts4[e[0]], C); groundMark(ctx, pts4[e[1]], C); }
    else { groundMark(ctx, O2, C); groundMark(ctx, O4, C); }
    if (opts.wiper) {
      bar(ctx, O4, tip, C.output, 8);
      bar(ctx, lerp2(O4, tip, .55), tip, C.ink, 5);
    } else {
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(tip.x, tip.y); ctx.closePath();
      ctx.fillStyle = 'rgba(124,58,237,.18)'; ctx.fill();
    }
    bar(ctx, A, B, C.coupler, 9);
    bar(ctx, O2, A, C.input, 11);
    if (!opts.wiper) bar(ctx, O4, B, C.output, 11);
    [O2, O4, A, B].forEach(p => pin(ctx, p, C));
    ctx.beginPath(); ctx.arc(tip.x, tip.y, 6, 0, TAU); ctx.fillStyle = C.accent; ctx.fill();
    if (opts.labels !== false) {
      const off = (p, q, k) => { const m = mid(p, q); const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1; return { x: m.x - dy / d * k, y: m.y + dx / d * k }; };
      const gm = mid(O2, O4);
      if (fk) { const q1 = off(O2, O4, 18); tag(ctx, '1', q1.x, q1.y, C, C.ground); } else tag(ctx, '1', gm.x, gm.y + 36, C, C.ground);
      let q = off(O2, A, -18); tag(ctx, '2', q.x, q.y, C, C.input);
      q = off(A, B, 18); tag(ctx, '3', q.x, q.y, C, C.coupler);
      q = off(O4, B, 18); if (!opts.wiper) tag(ctx, '4', q.x, q.y, C, C.output);
    }
  }
  const lerp2 = (p, q, t) => ({ x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t) });

  const demo = register(canvas, dt => { if (step) th = step(dt); draw(); });
  draw();
  return { redraw() { draw(); }, info() { build(getP()); return cache.range; }, demo, pose(a) { return framed(solveFour(getP(), rad(a), 1), getP()); } };
}

/* --- demo introductoria: limpiaparabrisas --- */
fourBarDemo($('#cv-wiper'), () => ({ g: 4, a: 1.1, b: 3.9, c: 3.0 }), { wiper: 2.1, W: 900, H: 480 });

/* --- demo con controles + Grashof --- */
const fbPresets = [
  { name: 'Manivela-balancín', v: { g: 4, a: 1, b: 3.8, c: 3 } },
  { name: 'Doble manivela', v: { g: 1, a: 3, b: 3.5, c: 3.2 } },
  { name: 'Doble balancín', v: { g: 3.5, a: 3, b: 1, c: 3.2 } },
  { name: 'Punto de cambio', v: { g: 3, a: 1.5, b: 3, c: 1.5 } },
  { name: 'Triple balancín', v: { g: 3, a: 2, b: 4, c: 2.5 } }
];
const fbCtl = mkControls($('#ctl-four'), [
  { id: 'g', label: 'Bancada (1)', min: 0.5, max: 8, step: 0.1, val: 4, unit: ' u' },
  { id: 'a', label: 'Entrada (2)', min: 0.5, max: 8, step: 0.1, val: 1, unit: ' u' },
  { id: 'b', label: 'Acoplador (3)', min: 0.5, max: 8, step: 0.1, val: 3.8, unit: ' u' },
  { id: 'c', label: 'Salida (4)', min: 0.5, max: 8, step: 0.1, val: 3, unit: ' u' }
], () => updateFB());
const fbDemo = fourBarDemo($('#cv-four'), () => fbCtl.vals, { cpu: 0.5, cpv: 0.6 });
const fbBtns = fbPresets.map(p => {
  const b = document.createElement('button');
  b.className = 'chip'; b.textContent = p.name;
  b.onclick = () => { fbCtl.set(p.v); };
  $('#fb-presets').appendChild(b);
  return b;
});
function updateFB() {
  const { g, a, b, c } = fbCtl.vals;
  const r = classifyFour(g, a, b, c);
  const f = x => fmt(x.v, 1);
  $('#fb-sum').innerHTML =
    `s = <b>${f(r.S)}</b> (${r.S.n}) · l = <b>${f(r.Lg)}</b> (${r.Lg.n})<br>p = <b>${f(r.p)}</b> · q = <b>${f(r.q)}</b><br>` +
    `s + l = <b>${fmt(r.lhs, 1)}</b> ${r.lhs < r.rhs - 1e-6 ? '&lt;' : (Math.abs(r.lhs - r.rhs) < 1e-6 ? '=' : '&gt;')} p + q = <b>${fmt(r.rhs, 1)}</b>`;
  const v = $('#fb-verdict');
  const impossible = Math.max(g, a, b, c) >= g + a + b + c - Math.max(g, a, b, c);
  if (impossible) { v.className = 'verdict bad'; v.innerHTML = 'No ensamblable<small>El eslabón más largo debe ser menor que la suma de los otros tres.</small>'; }
  else { v.className = 'verdict ' + r.kind; v.innerHTML = `${r.cat}<small>${r.why}</small>`; }
  fbBtns.forEach((bt, i) => { const p = fbPresets[i].v; bt.classList.toggle('on', p.g === g && p.a === a && p.b === b && p.c === c); });
  const rg = fbDemo.info();
  $('#fb-info').innerHTML = rg.none ? '' : rg.full
    ? 'La <b>entrada (2)</b> puede girar vueltas completas.'
    : `La <b>entrada (2)</b> solo puede oscilar entre <b>${fmt(rg.start, 0)}°</b> y <b>${fmt(rg.end, 0)}°</b> (no da vuelta completa).`;
  if (!rg.none && !rg.full && r.kind === 'ok' && r.S.n !== 'bancada') {
    $('#fb-info').innerHTML += ' Aquí el eslabón que sí puede dar la vuelta es otro (el más corto); si lo conectaras al motor, el mecanismo funcionaría como manivela-balancín.';
  }
}
updateFB();

/* ====================================================================
   2) UNIONES
   ==================================================================== */
(function joints() {
  // revoluta
  (function () {
    const cv = $('#cv-revolute'), { ctx, W, H } = makeCanvas(cv, 440, 260); let t = 0;
    register(cv, dt => {
      t += dt; const C = colors(); ctx.clearRect(0, 0, W, H);
      const o = { x: 150, y: 140 }, ang = Math.sin(t * 1.4) * 1.0 - 0.3;
      const q = { x: o.x + 150 * Math.cos(ang), y: o.y - 150 * Math.sin(ang) };
      bar(ctx, { x: o.x - 70, y: o.y }, o, C.ground, 12);
      bar(ctx, o, q, C.input, 12);
      groundMark(ctx, { x: o.x - 70, y: o.y }, C);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(o.x, o.y, 60, 0, -ang, ang > 0); ctx.stroke(); ctx.setLineDash([]);
      pin(ctx, o, C, 10, true);
      text(ctx, 'solo gira', 320, 40, C, { color: C.accent, size: 16 });
    });
  })();
  // prismática
  (function () {
    const cv = $('#cv-prismatic'), { ctx, W, H } = makeCanvas(cv, 440, 260); let t = 0;
    register(cv, dt => {
      t += dt; const C = colors(); ctx.clearRect(0, 0, W, H);
      const x = 220 + Math.sin(t * 1.6) * 110;
      ctx.fillStyle = C.ground; ctx.fillRect(50, 108, 340, 8); ctx.fillRect(50, 164, 340, 8);
      ctx.fillStyle = C.output; ctx.fillRect(x - 40, 118, 80, 44);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(x - 40, 118, 80, 44);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x - 70, 60); ctx.lineTo(x + 70, 60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 70, 60); ctx.lineTo(x + 58, 53); ctx.moveTo(x + 70, 60); ctx.lineTo(x + 58, 67); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 70, 60); ctx.lineTo(x - 58, 53); ctx.moveTo(x - 70, 60); ctx.lineTo(x - 58, 67); ctx.stroke();
      text(ctx, 'solo desliza', 220, 215, C, { color: C.accent, size: 16 });
    });
  })();
  // leva
  (function () {
    const cv = $('#cv-cam'), { ctx, W, H } = makeCanvas(cv, 440, 260); let t = 0;
    register(cv, dt => {
      t += dt * 1.8; const C = colors(); ctx.clearRect(0, 0, W, H);
      const cx = 220, cy = 170, R = 52, e = 22;
      const kx = cx + Math.cos(t) * e, ky = cy + Math.sin(t) * e;
      const topY = ky - R;
      // seguidor
      ctx.fillStyle = C.output; ctx.fillRect(cx - 5, topY - 100, 10, 100);
      ctx.fillRect(cx - 24, topY - 8, 48, 8);
      ctx.fillStyle = C.ground; ctx.fillRect(cx - 18, 42, 8, 30); ctx.fillRect(cx + 10, 42, 8, 30);
      // leva
      ctx.beginPath(); ctx.arc(kx, ky, R, 0, TAU); ctx.fillStyle = C.input; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(kx, ky); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      pin(ctx, { x: cx, y: cy }, C, 6, true);
      text(ctx, 'gira y desliza', 330, 38, C, { color: C.accent, size: 16 });
    });
  })();
  // engranes
  const gcv = $('#cv-gear'), G = makeCanvas(gcv, 440, 260);
  const gctl = mkControls($('#ctl-gear'), [
    { id: 'z2', label: 'Dientes salida', min: 8, max: 30, step: 1, val: 24, dec: 0 }
  ], () => gearOut());
  const z1 = 12, mod = 3.4;
  let th = 0;
  function gearPath(ctx, cx, cy, r, z, rot, color, C) {
    const ro = r + mod * 0.95, ri = r - mod * 0.95, step = TAU / z;
    ctx.beginPath();
    for (let i = 0; i < z; i++) {
      const a = rot + i * step;
      const pts = [[a - step * .27, ri], [a - step * .17, ro], [a + step * .17, ro], [a + step * .27, ri]];
      pts.forEach(([ang, rr], j) => { const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr; (i === 0 && j === 0) ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    }
    ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, TAU); ctx.fillStyle = C.ink; ctx.fill();
  }
  function gearOut() {
    const z2 = gctl.vals.z2, i = z2 / z1;
    $('#out-gear').innerHTML =
      `Con signo (engranes exteriores): <b>ω₂/ω₁ = −z₁/z₂ = −${z1}/${z2} = ${fmt(-z1 / z2, 3)}</b> (sentidos opuestos). En magnitud: <b>i = |ω₁/ω₂| = z₂/z₁ = ${fmt(i, 2)}</b> (${i >= 1 ? 'reducción: la salida gira más lento' : 'multiplicación: la salida gira más rápido'}). ` +
      `Con rendimiento η (&lt; 1): <b>|τ₂| = η·i·|τ₁| = ${fmt(i, 2)}·η·|τ₁|</b>; sin pérdidas (η = 1) se conserva el producto τ·ω.`;
  }
  gearOut();
  register(gcv, dt => {
    th += dt * 1.6; const C = colors(), { ctx, W, H } = G; ctx.clearRect(0, 0, W, H);
    const z2 = gctl.vals.z2, r1 = z1 * mod, r2 = z2 * mod, span = r1 * 1.3 + r1 + r2 + r2 * 1.3;
    const x1 = (W - span) / 2 + r1 * 1.3, x2 = x1 + r1 + r2, cy = H / 2;
    gearPath(ctx, x1, cy, r1, z1, th, C.input, C);
    gearPath(ctx, x2, cy, r2, z2, Math.PI - Math.PI / z2 - th * z1 / z2, C.output, C);
    text(ctx, 'entrada', x1, cy - r1 - 18, C, { color: C.input, size: 13 });
    text(ctx, 'salida', x2, cy + r2 + 22 > H - 8 ? 14 : cy + r2 + 22, C, { color: C.output, size: 13 });
  });
})();

/* ====================================================================
   3) MOVILIDAD (Gruebler)
   ==================================================================== */
(function mobility() {
  const presets = [
    { name: 'Cuatro barras', n: 4, jp: 4, jh: 0, cap: 'Cuatro barras: 4 eslabones y 4 pernos.' },
    { name: 'Manivela-corredera', n: 4, jp: 4, jh: 0, cap: 'Manivela-corredera: 3 pernos + 1 corredera cuentan como 4 uniones principales.' },
    { name: 'Prensa con engrane', n: 3, jp: 2, jh: 1, cap: 'Prensa de corte con engrane: 2 pernos y una unión de engranes (orden superior).' },
    { name: 'Armadura triangular', n: 3, jp: 3, jh: 0, cap: 'Tres barras unidas en triángulo: no se mueve, es una estructura.' },
    { name: 'Bloqueado', n: 4, jp: 5, jh: 0, cap: 'Una unión de más: el mecanismo queda sobrerrestringido.' },
    { name: 'Brazo robótico (2 art.)', n: 3, jp: 2, jh: 0, cap: 'Cadena abierta con 2 articulaciones: necesita 2 actuadores.' },
    { name: 'Brazo robótico (3 art.)', n: 4, jp: 3, jh: 0, cap: 'Cadena abierta con 3 articulaciones: necesita 3 actuadores.' }
  ];
  const cv = $('#cv-mob'), { ctx, W, H } = makeCanvas(cv, 520, 360);
  const ctl = mkControls($('#ctl-mob'), [
    { id: 'n', label: 'Eslabones (n)', min: 2, max: 8, step: 1, val: 4, dec: 0 },
    { id: 'jp', label: 'Uniones princ. (jₚ)', min: 0, max: 12, step: 1, val: 4, dec: 0 },
    { id: 'jh', label: 'Orden sup. (jₕ)', min: 0, max: 4, step: 1, val: 0, dec: 0 }
  ], () => upd());
  const btns = presets.map(p => {
    const b = document.createElement('button'); b.className = 'chip'; b.textContent = p.name;
    b.onclick = () => { ctl.set(p); $('#mob-cap').textContent = p.cap; };
    $('#mob-presets').appendChild(b); return b;
  });
  function upd() {
    const { n, jp, jh } = ctl.vals;
    const M = 3 * (n - 1) - 2 * jp - jh;
    $('#mob-eq').innerHTML = `M = 3(${n} − 1) − 2(${jp}) − ${jh} = <b>${M}</b>`;
    const v = $('#mob-verdict');
    if (M === 1) { v.className = 'verdict ok'; v.innerHTML = 'M = 1: una entrada independiente<small>Una sola coordenada de entrada (un motor, un cilindro o la mano en un mango) posiciona todos los eslabones.</small>'; }
    else if (M > 1) { v.className = 'verdict warn'; v.innerHTML = `M = ${M}: varias entradas independientes<small>Se requieren ${M} coordenadas de entrada (p. ej. una por articulación en un brazo robótico). Cuántos actuadores se usan realmente depende de la arquitectura y del control.</small>`; }
    else if (M === 0) { v.className = 'verdict warn'; v.innerHTML = 'M = 0: estructura (análisis convencional)<small>Sin movimiento finito en el modelo, como una armadura. Puede tener flexibilidad infinitesimal en posiciones singulares, y existen excepciones geométricas.</small>'; }
    else { v.className = 'verdict warn'; v.innerHTML = `M = ${M}: restricciones en exceso<small>Hay más restricciones contabilizadas que grados de libertad iniciales: indica restricciones redundantes o incompatibles. No demuestra por sí solo que el ensamble exista ni que esté bloqueado; decide la geometría.</small>`; }
    btns.forEach((b, i) => b.classList.toggle('on', presets[i].n === n && presets[i].jp === jp && presets[i].jh === jh));
    draw(n, jp, jh, M);
  }
  function draw(n, jp, jh, M) {
    const C = colors(); ctx.clearRect(0, 0, W, H);
    const total = 3 * (n - 1), removed = 2 * jp + jh;
    const cols = 12, s = 34, gap = 6, x0 = 28;
    text(ctx, `Grados de libertad iniciales: 3·(n−1) = ${total}`, x0, 30, C, { align: 'left', size: 14, color: C.muted });
    let y = 52;
    const sq = (i, kind) => {
      const r = Math.floor(i / cols), c = i % cols, x = x0 + c * (s + gap), yy = y + r * (s + gap);
      ctx.fillStyle = kind === 'free' ? C.output : kind === 'cut' ? C.surface2 : C.bad;
      ctx.fillRect(x, yy, s, s);
      ctx.strokeStyle = kind === 'cut' ? C.muted : C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x, yy, s, s);
      if (kind === 'cut') { ctx.beginPath(); ctx.moveTo(x + 6, yy + 6); ctx.lineTo(x + s - 6, yy + s - 6); ctx.moveTo(x + s - 6, yy + 6); ctx.lineTo(x + 6, yy + s - 6); ctx.stroke(); }
    };
    const rows = Math.max(1, Math.ceil(Math.max(total, 1) / cols));
    for (let i = 0; i < total; i++) sq(i, i < Math.min(removed, total) ? 'cut' : 'free');
    y += rows * (s + gap) + 14;
    text(ctx, `Restricciones: 2·${jp} + ${jh} = ${removed}`, x0, y, C, { align: 'left', size: 14, color: C.muted });
    y += 18;
    const extra = Math.max(0, removed - total);
    if (extra) {
      for (let i = 0; i < extra; i++) sq(i, 'bad');
      y += Math.ceil(extra / cols) * (s + gap) + 6;
      text(ctx, `${extra} restricción(es) en exceso → redundantes o incompatibles`, x0, y, C, { align: 'left', size: 14, color: C.bad });
    } else {
      text(ctx, `Libres: ${M}`, x0, y + 8, C, { align: 'left', size: 22, color: M === 1 ? C.ok : C.ink, weight: 700 });
      text(ctx, M === 0 ? 'Ninguno: estructura' : (M === 1 ? 'Una entrada independiente' : `${M} entradas independientes`), x0 + 120, y + 8, C, { align: 'left', size: 14, color: C.muted, weight: 400 });
    }
  }
  upd();
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', upd);
})();

/* ====================================================================
   4) MANIVELA-CORREDERA
   ==================================================================== */
(function slider() {
  const cv = $('#cv-slider'), S = makeCanvas(cv, 900, 360);
  const cp = $('#cv-slider-plot'), PL = makeCanvas(cp, 900, 220);
  const ctl = mkControls($('#ctl-slider'), [
    { id: 'r', label: 'Manivela (r)', min: 0.5, max: 3, step: 0.1, val: 1.5, unit: ' cm' },
    { id: 'l', label: 'Biela (l)', min: 2, max: 8, step: 0.1, val: 5, unit: ' cm' },
    { id: 'e', label: 'Desfase (e)', min: -3, max: 3, step: 0.1, val: 0, unit: ' cm' }
  ], () => recompute());
  let data = null, th = 0;
  const xOf = (P, t) => P.r * Math.cos(t) + Math.sqrt(P.l * P.l - (P.r * Math.sin(t) - P.e) ** 2);
  function recompute() {
    const P = ctl.vals;
    if (P.l < P.r + Math.abs(P.e) - 1e-9) {
      data = null;
      $('#slider-out').innerHTML = '<b style="color:var(--bad)">No ensamblable:</b> la biela debe ser al menos r + |e|.';
      return;
    }
    const xs = []; let mx = -Infinity, mn = Infinity, tmx = 0, tmn = 0;
    for (let i = 0; i < 720; i++) {
      const t = rad(i / 2), x = xOf(P, t); xs.push(x);
      if (x > mx) { mx = x; tmx = i / 2; } if (x < mn) { mn = x; tmn = i / 2; }
    }
    const ida = ((tmx - tmn) % 360 + 360) % 360, reg = 360 - ida;
    const Q = Math.max(ida, reg) / Math.max(1e-9, Math.min(ida, reg)), alpha = Math.abs(ida - 180);
    const xmaxF = Math.sqrt((P.l + P.r) ** 2 - P.e ** 2), xminF = Math.sqrt((P.l - P.r) ** 2 - P.e ** 2);
    data = { xs, mx, mn };
    $('#slider-out').innerHTML =
      `<b>Existencia:</b> r + |e| = ${fmt(P.r + Math.abs(P.e), 2)} ≤ l = ${fmt(P.l, 2)} ✔<br>` +
      `<b>Extremos (fórmula):</b> x<sub>máx</sub> = √((l+r)² − e²) = ${fmt(xmaxF, 3)} · x<sub>mín</sub> = √((l−r)² − e²) = ${fmt(xminF, 3)}<br>` +
      `<b>Carrera:</b> s = ${fmt(xmaxF - xminF, 3)} ${Math.abs(P.e) < 0.05 ? '(= 2r)' : ''}<br>` +
      `<b>Ida</b> (x crece, giro antihorario): ${fmt(ida, 1)}° · <b>regreso</b> (x decrece): ${fmt(reg, 1)}°<br>` +
      `<b>α</b> = |β<sub>ida</sub> − 180°| = ${fmt(alpha, 1)}° → <b>Q = (180° + α)/(180° − α) = ${fmt(Q, 3)}</b> ${Q < 1.005 ? '(ida y regreso tardan igual)' : '(retorno rápido: la carrera que barre más de 180° es la lenta)'}`;
  }
  recompute();
  function draw() {
    const P = ctl.vals, C = colors(), { ctx, W, H } = S;
    ctx.clearRect(0, 0, W, H);
    if (!data) { text(ctx, 'Aumenta la biela o reduce r / |e|', W / 2, H / 2, C, { color: C.bad, size: 18 }); return; }
    const xmin = -P.r - 0.4, xmax = data.mx + 1.2, ymax = Math.max(P.r, Math.abs(P.e)) + 0.9;
    const sc = Math.min((W - 80) / (xmax - xmin), (H - 60) / (2 * ymax)), ox = 40 - xmin * sc, oy = H / 2 + 10;
    const T = p => ({ x: ox + p.x * sc, y: oy - p.y * sc });
    const O = T({ x: 0, y: 0 });
    const A = T({ x: P.r * Math.cos(th), y: P.r * Math.sin(th) });
    const sx = xOf(P, th), B = T({ x: sx, y: P.e });
    // guía
    const gy = T({ x: 0, y: P.e }).y;
    ctx.fillStyle = C.ground;
    ctx.fillRect(T({ x: data.mn - 0.3, y: 0 }).x, gy + 22, (data.mx - data.mn + 0.6) * sc + 40, 6);
    ctx.fillRect(T({ x: data.mn - 0.3, y: 0 }).x, gy - 28, (data.mx - data.mn + 0.6) * sc + 40, 6);
    ctx.setLineDash([5, 5]); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(O.x, O.y); ctx.lineTo(W - 20, O.y); ctx.stroke(); ctx.setLineDash([]);
    if (Math.abs(P.e) > 0.05) {
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(O.x - 14, O.y); ctx.lineTo(O.x - 14, gy); ctx.stroke();
      text(ctx, 'e', O.x - 26, (O.y + gy) / 2, C, { color: C.accent, size: 14 });
    }
    // límites de carrera
    ctx.strokeStyle = C.accent; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    [data.mn, data.mx].forEach(x => { const q = T({ x, y: 0 }); ctx.beginPath(); ctx.moveTo(q.x, gy - 40); ctx.lineTo(q.x, gy + 40); ctx.stroke(); });
    ctx.setLineDash([]);
    // corredera
    ctx.fillStyle = C.output; ctx.fillRect(B.x - 30, B.y - 20, 60, 40);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(B.x - 30, B.y - 20, 60, 40);
    bar(ctx, A, B, C.coupler, 9);
    bar(ctx, O, A, C.input, 11);
    groundMark(ctx, O, C);
    pin(ctx, O, C, 8, true); pin(ctx, A, C); pin(ctx, B, C);
    ctx.strokeStyle = C.input; ctx.globalAlpha = .35; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(O.x, O.y, P.r * sc, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    text(ctx, `θ = ${fmt(deg(th) % 360, 0)}°`, 70, 24, C, { align: 'left', size: 14, color: C.muted });

    // gráfica x(θ)
    const g = PL.ctx; g.clearRect(0, 0, PL.W, PL.H);
    const L = 56, R = 16, Tt = 16, Bt = 36, w = PL.W - L - R, h = PL.H - Tt - Bt;
    const lo = data.mn - 0.2, hi = data.mx + 0.2;
    const px = a => L + a / 360 * w, py = x => Tt + (1 - (x - lo) / (hi - lo)) * h;
    g.strokeStyle = C.line; g.lineWidth = 1; g.fillStyle = C.muted; g.font = '12px system-ui'; g.textAlign = 'center';
    for (let a = 0; a <= 360; a += 90) { g.beginPath(); g.moveTo(px(a), Tt); g.lineTo(px(a), Tt + h); g.stroke(); g.fillText(a + '°', px(a), Tt + h + 18); }
    g.textAlign = 'right';
    [data.mn, data.mx].forEach(v => { g.beginPath(); g.moveTo(L, py(v)); g.lineTo(L + w, py(v)); g.stroke(); g.fillText(fmt(v, 1), L - 6, py(v) + 4); });
    g.beginPath(); data.xs.forEach((x, i) => { const X = px(i / 2), Y = py(x); i ? g.lineTo(X, Y) : g.moveTo(X, Y); });
    g.strokeStyle = C.output; g.lineWidth = 3; g.stroke();
    // referencia senoidal pura
    g.beginPath(); for (let i = 0; i <= 360; i += 4) { const X = px(i), Y = py((data.mx + data.mn) / 2 + (data.mx - data.mn) / 2 * Math.cos(rad(i))); i ? g.lineTo(X, Y) : g.moveTo(X, Y); }
    g.setLineDash([4, 4]); g.strokeStyle = C.muted; g.lineWidth = 1.5; g.stroke(); g.setLineDash([]);
    const cx = px(deg(th) % 360), cy = py(sx);
    g.beginPath(); g.arc(cx, cy, 6, 0, TAU); g.fillStyle = C.accent; g.fill();
    g.fillStyle = C.muted; g.textAlign = 'left'; g.fillText('— posición de la corredera   - - senoide pura (referencia)', L + 8, Tt + 12);
  }
  register(cv, dt => { th = (th + dt * 1.1) % TAU; draw(); });
  draw();
})();

/* ====================================================================
   5) ESPECIALES
   ==================================================================== */
(function special() {
  /* yugo escocés */
  (function () {
    const cv = $('#cv-scotch'), { ctx, W, H } = makeCanvas(cv, 560, 340);
    const ctl = mkControls($('#ctl-scotch'), [{ id: 'r', label: 'Manivela (r)', min: 20, max: 80, step: 1, val: 55, dec: 0, unit: '' }], () => { });
    let th = 0; const hist = [];
    register(cv, dt => {
      th = (th + dt * 1.6) % TAU; const C = colors(), r = ctl.vals.r;
      ctx.clearRect(0, 0, W, H);
      const cx = 120, cy = 190, px = cx + r * Math.cos(th), py = cy - r * Math.sin(th);
      // guías
      ctx.fillStyle = C.ground; ctx.fillRect(cx - 100, cy - 98, 300, 6); ctx.fillRect(cx - 100, cy + 92, 300, 6);
      // yugo
      ctx.fillStyle = C.output; ctx.fillRect(px - 8, cy - 92, 16, 184);
      ctx.fillRect(px - 8, cy - 4, 210 - (px - 8) + 110, 8);
      ctx.fillStyle = C.surface2; ctx.fillRect(px - 3, cy - 80, 6, 160); // ranura
      // manivela
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.strokeStyle = C.input; ctx.globalAlpha = .3; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1;
      bar(ctx, { x: cx, y: cy }, { x: px, y: py }, C.input, 9);
      pin(ctx, { x: cx, y: cy }, C, 7, true); pin(ctx, { x: px, y: py }, C, 6);
      // historial
      hist.unshift(px - cx); if (hist.length > 210) hist.pop();
      const gx = 330, gh = r;
      ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, cy - 90); ctx.lineTo(gx, cy + 90); ctx.stroke();
      ctx.beginPath(); hist.forEach((v, i) => { const X = gx + i, Y = cy - 40 - v * 0.9; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
      ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.stroke();
      text(ctx, 'posición del yugo en el tiempo (senoide perfecta)', 440, 310, C, { size: 12, color: C.muted, weight: 400 });
    });
  })();
  /* paralelogramo */
  (function () {
    const cv = $('#cv-para'), { ctx, W, H } = makeCanvas(cv, 560, 340);
    const ctl = mkControls($('#ctl-para'), [
      { id: 'L', label: 'Brazos', min: 80, max: 170, step: 1, val: 130, dec: 0 },
      { id: 'w', label: 'Separación', min: 60, max: 200, step: 1, val: 120, dec: 0 }
    ], () => { });
    let t = 0;
    register(cv, dt => {
      t += dt; const C = colors(), { L, w } = ctl.vals; ctx.clearRect(0, 0, W, H);
      const a = rad(10 + 50 * (0.5 + 0.5 * Math.sin(t * 1.4)));
      const x0 = (W - w) / 2 - 40, yb = 290;
      const p1 = { x: x0, y: yb }, p2 = { x: x0 + w, y: yb };
      const q1 = { x: p1.x + L * Math.cos(a), y: p1.y - L * Math.sin(a) }, q2 = { x: p2.x + L * Math.cos(a), y: p2.y - L * Math.sin(a) };
      groundMark(ctx, p1, C); groundMark(ctx, p2, C);
      bar(ctx, p1, p2, C.ground, 5);
      bar(ctx, q1, q2, C.coupler, 9);
      bar(ctx, p1, q1, C.input, 9); bar(ctx, p2, q2, C.input, 9);
      // plataforma + objeto
      const m = mid(q1, q2);
      ctx.fillStyle = C.output; ctx.fillRect(m.x - 50, m.y - 22, 100, 8);
      ctx.beginPath(); ctx.arc(m.x, m.y - 36, 14, 0, TAU); ctx.fillStyle = C.accent; ctx.fill();
      [p1, p2, q1, q2].forEach(p => pin(ctx, p, C, 6));
      text(ctx, 'Inclinación de la plataforma: 0°', 280, 24, C, { size: 14, color: C.muted });
    });
  })();
  /* Peaucellier-Lipkin */
  (function () {
    const cv = $('#cv-peau'), { ctx, W, H } = makeCanvas(cv, 560, 340);
    const ctl = mkControls($('#ctl-peau'), [{ id: 'd', label: 'Distancia OP', min: 1.8, max: 3.2, step: 0.1, val: 2.5 }, { id: 'k', label: 'PA / PO', min: 0.9, max: 1.1, step: 0.01, val: 1, dec: 2, unit: '×' }], () => rebuild());
    const Lr = 5, s = 2; let range, step, th = 0, trace = [], view;
    const O = { x: 0, y: 0 };
    function pose(t) {
      const d = ctl.vals.d, Pp = { x: d, y: 0 };
      const A = { x: Pp.x + ctl.vals.k * d * Math.cos(t), y: ctl.vals.k * d * Math.sin(t) };
      const B = circInt(O, Lr, A, s, 1), D = circInt(O, Lr, A, s, -1);
      if (!B || !D) return null;
      return { P: Pp, A, B, D, C: { x: B.x + D.x - A.x, y: B.y + D.y - A.y } };
    }
    function rebuild() {
      range = sweepRange(t => !!pose(t)); trace = [];
      if (range.none) return;
      let x0 = -2, x1 = 6, y0 = -4, y1 = 4;
      for (let a = range.start; a <= range.end; a += 1) { const p = pose(rad(a)); if (p) { trace.push(p.C); y0 = Math.min(y0, p.C.y, p.B.y, p.D.y); y1 = Math.max(y1, p.C.y, p.B.y, p.D.y); x1 = Math.max(x1, p.C.x); } }
      const sc = Math.min((W - 60) / (x1 - x0), (H - 60) / (y1 - y0));
      view = { sc, ox: 30 - x0 * sc, oy: H / 2 + (y1 + y0) / 2 * sc };
      step = phaser(range, 40);
    }
    rebuild();
    const T = p => ({ x: view.ox + p.x * view.sc, y: view.oy - p.y * view.sc });
    register(cv, dt => {
      const C = colors(); ctx.clearRect(0, 0, W, H);
      if (range.none) { text(ctx, 'No se puede ensamblar', W / 2, H / 2, C, { color: C.bad }); return; }
      th = step(dt); const p = pose(th) || pose(rad(range.start));
      ctx.beginPath(); trace.forEach((q, i) => { const t = T(q); i ? ctx.lineTo(t.x, t.y) : ctx.moveTo(t.x, t.y); });
      ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([]);
      const o = T(O), P = T(p.P), A = T(p.A), B = T(p.B), D = T(p.D), Cc = T(p.C);
      bar(ctx, P, A, C.input, 8);
      bar(ctx, o, B, C.output, 6); bar(ctx, o, D, C.output, 6);
      [[A, B], [B, Cc], [Cc, D], [D, A]].forEach(([u, v]) => bar(ctx, u, v, C.coupler, 6));
      groundMark(ctx, o, C); groundMark(ctx, P, C);
      [o, P, A, B, D].forEach(q => pin(ctx, q, C, 5));
      ctx.beginPath(); ctx.arc(Cc.x, Cc.y, 7, 0, TAU); ctx.fillStyle = C.accent; ctx.fill();
      text(ctx, 'C', Cc.x + 16, Cc.y, C, { color: C.accent });
    });
  })();
})();

