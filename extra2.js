/* Mecanismos Vivos — módulos 4, 5, 7, 8 (casos especiales, inversión, análisis, laboratorio, evaluación) */
'use strict';

const addStatic2 = fn => { addStatic(fn); };
const dual = (calc, obs, lc = 'M calculada (Grübler)', lo = 'M observada') =>
  `<div class="dual"><div class="calc"><small>${lc}</small><b>${calc}</b></div><div class="obs"><small>${lo}</small><b>${obs}</b></div></div>`;
const chip = (box, label, onClick, on) => {
  const b = document.createElement('button'); b.className = 'chip' + (on ? ' on' : ''); b.textContent = label; b.onclick = () => onClick(b); box.appendChild(b); return b;
};

/* ====================================================================
   4.5 CASOS ESPECIALES DE MOVILIDAD
   ==================================================================== */
(function coincident() {
  const cv = $('#cv-coinc'), { ctx, W, H } = makeCanvas(cv, 520, 340);
  let mode = 1;
  const box = $('#coinc-toggle'), btns = [];
  btns.push(chip(box, 'Contar 1 perno', () => { mode = 1; upd(); }, true));
  btns.push(chip(box, 'Contar 2 uniones (k − 1)', () => { mode = 2; upd(); }, false));
  function upd() {
    btns.forEach((b, i) => b.classList.toggle('on', i + 1 === mode));
    const n = 6, jp = 5 + mode, M = 3 * (n - 1) - 2 * jp;
    $('#coinc-eq').innerHTML = `n = 6, j<sub>p</sub> = 4 pernos + 1 corredera + ${mode} (perno central) = ${jp}<br>M = 3(5) − 2(${jp}) = <b>${M}</b>`;
    const v = $('#coinc-verdict');
    if (mode === 2) { v.className = 'verdict ok'; v.innerHTML = 'M = 1: coherente<small>Con el mango se posicionan todos los eslabones; es lo que hace la prensa real.</small>' + dual(M, 1); }
    else { v.className = 'verdict bad'; v.innerHTML = 'M = 3: no coincide con la máquina<small>Contar un solo perno para tres eslabones subestima las restricciones: el error está en el <i>modelo</i>. Regla: k eslabones en un perno → k − 1 uniones.</small>' + dual(M, 1, 'M calculada (conteo erróneo)'); }
    draw();
  }
  function draw() {
    const C = colors(); ctx.clearRect(0, 0, W, H);
    const E = { x: 260, y: 170 }, arms = [{ p: { x: 90, y: 80 }, n: 3, c: C.coupler }, { p: { x: 430, y: 90 }, n: 4, c: C.output }, { p: { x: 270, y: 300 }, n: 6, c: C.input }];
    arms.forEach(a => { bar(ctx, E, a.p, a.c, 12); pin(ctx, a.p, C, 7); tag(ctx, a.n, (E.x + a.p.x) / 2 + 16, (E.y + a.p.y) / 2 - 16, C, a.c); });
    if (mode === 2) { pin(ctx, { x: E.x - 8, y: E.y }, C, 13, true); pin(ctx, { x: E.x + 8, y: E.y }, C, 13, false); }
    else pin(ctx, E, C, 13, true);
    ctx.beginPath(); ctx.arc(E.x + 70, E.y - 62, 46, 0, TAU); ctx.fillStyle = mode === 2 ? C.surface : C.surface; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = mode === 2 ? C.ok : C.bad; ctx.stroke();
    text(ctx, '3 eslabones', E.x + 70, E.y - 76, C, { size: 12, color: C.muted, weight: 400 });
    text(ctx, mode === 2 ? '→ 2 uniones' : '→ 1 unión', E.x + 70, E.y - 56, C, { size: 15, color: mode === 2 ? C.ok : C.bad });
    text(ctx, 'Un solo perno físico atraviesa los tres brazos', 260, 330, C, { size: 13, color: C.muted, weight: 400 });
  }
  addStatic2(upd);
})();

(function exception() {
  const cv = $('#cv-exc'), { ctx, W, H } = makeCanvas(cv, 520, 340);
  const ctl = mkControls($('#ctl-exc'), [{ id: 'k', label: 'Long. central', min: 0.9, max: 1.1, step: 0.01, val: 1, dec: 2, unit: '×' }], () => upd());
  let t = 0;
  const same = () => Math.abs(ctl.vals.k - 1) < 0.005;
  function upd() {
    const v = $('#exc-verdict');
    if (same()) { v.className = 'verdict ok'; v.innerHTML = 'Se mueve con 1 GDL, aunque Gruebler da M = 0<small>Geometría especial: el eslabón central es redundante (todas las longitudes y separaciones son iguales); hay <b>ρ = 1</b> restricción redundante: M<sub>local</sub> = 0 + 1.</small>' + dual(0, 1); }
    else { v.className = 'verdict bad'; v.innerHTML = 'Bloqueado: M = 0<small>Al cambiar la longitud del eslabón central ya no es redundante (ρ = 0) y el mecanismo se traba.</small>' + dual(0, 0); }
  }
  upd();
  register(cv, dt => {
    t += dt; const C = colors(); ctx.clearRect(0, 0, W, H);
    const phi = rad(same() ? 38 + 50 * (0.5 + 0.5 * Math.sin(t * 1.3)) : 65);
    const xs = [130, 245, 360], yb = 290, L = 150, Lc = L * ctl.vals.k;
    const top = xs.map(x => ({ x: x + L * Math.cos(phi), y: yb - L * Math.sin(phi) }));
    bar(ctx, top[0], top[2], C.coupler, 10);
    xs.forEach((x, i) => {
      const base = { x, y: yb };
      if (i === 1) {
        const end = { x: x + Lc * Math.cos(phi), y: yb - Lc * Math.sin(phi) };
        bar(ctx, base, end, same() ? C.accent : C.bad, 9);
        if (!same()) { ctx.setLineDash([4, 4]); bar(ctx, end, top[1], C.bad, 3); ctx.setLineDash([]); text(ctx, '¡no cabe!', end.x + 44, end.y - 4, C, { color: C.bad, size: 13 }); }
      } else bar(ctx, base, top[i], C.input, 9);
    });
    bar(ctx, { x: xs[0], y: yb }, { x: xs[2], y: yb }, C.ground, 6);
    xs.forEach(x => groundMark(ctx, { x, y: yb }, C, 28));
    [...xs.map(x => ({ x, y: yb })), ...top].forEach(p => pin(ctx, p, C, 6));
    text(ctx, '5 eslabones · 6 pernos → M = 3(4) − 2(6) = 0', 260, 24, C, { size: 14, color: C.muted });
  });
})();

(function inactive() {
  const cv = $('#cv-inact'), { ctx, W, H } = makeCanvas(cv, 520, 340);
  const S = { x: 130, y: 215 }, e = 20, R = 54, rr = 18, P = { x: 370, y: 70 }, La = 235;
  let t = 0, spin = 0, lo = 1e9, hi = -1e9;
  $('#inact-eq').innerHTML = 'n = 4, j<sub>p</sub> = 3 pernos, j<sub>h</sub> = 1 (leva)<br>M = 3(3) − 2(3) − 1 = <b>2</b>' + dual(2, '2 (1 útil)', 'M calculada (modelo ideal)', 'GDL en el modelo / útiles');
  register(cv, dt => {
    t += dt * 1.2; spin += dt * 7; const C = colors(); ctx.clearRect(0, 0, W, H);
    const Cc = { x: S.x + e * Math.cos(t), y: S.y + e * Math.sin(t) };
    const r1 = circInt(Cc, R + rr, P, La, 1), r2 = circInt(Cc, R + rr, P, La, -1);
    const Rc = (r1 && r2) ? (r1.y < r2.y ? r1 : r2) : (r1 || r2);
    if (!Rc) return;
    const ang = deg(Math.atan2(Rc.y - P.y, Rc.x - P.x)); lo = Math.min(lo, ang); hi = Math.max(hi, ang);
    bar(ctx, P, Rc, C.output, 12);
    ctx.beginPath(); ctx.arc(Cc.x, Cc.y, R, 0, TAU); ctx.fillStyle = C.input; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(S.x, S.y); ctx.lineTo(Cc.x, Cc.y); ctx.stroke();
    ctx.beginPath(); ctx.arc(Rc.x, Rc.y, rr, 0, TAU); ctx.fillStyle = C.accent; ctx.fill(); ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5;
    for (let i = 0; i < 3; i++) { const a = spin + i * TAU / 3; ctx.beginPath(); ctx.moveTo(Rc.x, Rc.y); ctx.lineTo(Rc.x + Math.cos(a) * rr * .85, Rc.y + Math.sin(a) * rr * .85); ctx.stroke(); }
    groundMark(ctx, S, C); groundMark(ctx, P, C, 28);
    pin(ctx, S, C, 6, true); pin(ctx, P, C, 6, true); pin(ctx, Rc, C, 4, true);
    text(ctx, 'rodillo: gira libre (GDL inactivo)', Rc.x - 60, Rc.y - 34, C, { color: C.accent, size: 13 });
    $('#inact-out').innerHTML = `Entrada útil: giro de la leva · Salida útil: oscilación del brazo (≈ <b>${fmt(hi - lo, 0)}°</b>). El giro del rodillo no afecta la relación entrada-salida: el grado de libertad <b>útil</b> es <b>1</b>, aunque Gruebler dé 2.`;
  });
})();

/* ====================================================================
   5.1 INVERSIÓN CINEMÁTICA
   ==================================================================== */
function invInfo(L, k) {
  const idx = [0, 1, 2, 3].sort((i, j) => L[i] - L[j]);
  const s = L[idx[0]], l = L[idx[3]], p = L[idx[1]], q = L[idx[2]], lhs = s + l, rhs = p + q, si = idx[0];
  const base = { lhs, rhs, s, l, p, q, si };
  if (Math.abs(lhs - rhs) < 1e-6) return { ...base, cat: 'Punto de cambio', kind: 'warn', why: 'Las sumas s + l y p + q son iguales: es una configuración límite en la que todos los eslabones llegan a quedar colineales y el movimiento es indeterminado.' };
  if (lhs > rhs) return { ...base, cat: 'Triple balancín', kind: 'bad', why: `s + l = ${fmt(lhs, 1)} es mayor que p + q = ${fmt(rhs, 1)}: no se cumple Grashof, así que ningún eslabón puede dar una vuelta completa.` };
  const names = ['la bancada original (1)', 'el eslabón de entrada (2)', 'el acoplador (3)', 'el eslabón de salida (4)'];
  if (si === k) return { ...base, cat: 'Doble manivela', kind: 'ok', why: `Cumple Grashof (${fmt(lhs, 1)} < ${fmt(rhs, 1)}) y el eslabón más corto es el que quedó fijo: los dos eslabones unidos a él giran vuelta completa.` };
  if (si === (k + 2) % 4) return { ...base, cat: 'Doble balancín', kind: 'ok', why: `Cumple Grashof (${fmt(lhs, 1)} < ${fmt(rhs, 1)}) y el eslabón más corto es el opuesto al fijo: los dos eslabones unidos a la bancada solo oscilan.` };
  return { ...base, cat: 'Manivela-balancín', kind: 'ok', why: `Cumple Grashof (${fmt(lhs, 1)} < ${fmt(rhs, 1)}) y el eslabón más corto (${names[si]}) es adyacente al fijo: ese eslabón gira completo y el otro oscila.` };
}

(function inversion() {
  const sets = [
    { name: 'Grashof (entrada corta)', v: { g: 4, a: 1.2, b: 3.8, c: 3 } },
    { name: 'Grashof 2', v: { g: 3.6, a: 1, b: 3, c: 3.4 } },
    { name: 'No cumple Grashof', v: { g: 3, a: 2, b: 4, c: 2.5 } }
  ];
  let cur = sets[0].v, fixed = 0;
  const demo = fourBarDemo($('#cv-inv'), () => cur, { fixed: () => fixed, cpu: 0.5, cpv: 0.6 });
  const fb = [], sb = [];
  ['Fijar eslabón 1', 'Fijar eslabón 2', 'Fijar eslabón 3', 'Fijar eslabón 4'].forEach((l, i) => fb.push(chip($('#inv-btns'), l, () => { fixed = i; upd(); }, i === 0)));
  sets.forEach((s, i) => sb.push(chip($('#inv-sets'), s.name, () => { cur = s.v; upd(); }, i === 0)));
  function upd() {
    fb.forEach((b, i) => b.classList.toggle('on', i === fixed));
    sb.forEach((b, i) => b.classList.toggle('on', sets[i].v === cur));
    const L = [cur.g, cur.a, cur.b, cur.c], r = invInfo(L, fixed);
    const v = $('#inv-verdict'); v.className = 'verdict ' + r.kind; v.innerHTML = `Con el eslabón ${fixed + 1} fijo: ${r.cat}<small>${r.why}</small>`;
    $('#inv-out').innerHTML = `Longitudes: eslabón 1 = <b>${fmt(L[0], 1)}</b>, 2 = <b>${fmt(L[1], 1)}</b>, 3 = <b>${fmt(L[2], 1)}</b>, 4 = <b>${fmt(L[3], 1)}</b>.<br>` +
      (r.kind === 'bad' ? 'Con cualquier bancada, el resultado es el mismo tipo: Grashof no se cumple.' : `El movimiento <b>relativo</b> entre los eslabones es siempre el mismo; lo que cambia es cuál de ellos se ve quieto y, por tanto, el movimiento <b>absoluto</b>.`);
  }
  upd();
})();

/* ====================================================================
   7) TÉCNICAS DE ANÁLISIS
   ==================================================================== */
(function analysis() {
  const P = { g: 4, a: 1.2, b: 3.8, c: 3 };
  const cv = $('#cv-an'), { ctx, W, H } = makeCanvas(cv, 640, 420);
  const ctl = mkControls($('#ctl-an'), [{ id: 'th', label: 'Ángulo θ', min: 0, max: 360, step: 1, val: 60, dec: 0, unit: '°' }], () => draw());
  let mode = 'graf';
  const modes = [['graf', 'Gráfico tradicional'], ['cad', 'CAD'], ['ana', 'Analítico'], ['comp', 'Computacional']];
  const tabs = $('#an-tabs');
  modes.forEach(([k, l]) => {
    const b = document.createElement('button'); b.className = 'tab'; b.setAttribute('role', 'tab'); b.textContent = l; b.setAttribute('aria-selected', k === mode);
    b.onclick = () => { mode = k; [...tabs.children].forEach(x => x.setAttribute('aria-selected', x === b)); draw(); };
    tabs.appendChild(b);
  });
  const sc = 62, ox = 150, oy = 210;
  const T = p => ({ x: ox + p.x * sc, y: oy - p.y * sc });
  const pose = th => solveFour(P, rad(th), 1);
  const phiOf = s => deg(Math.atan2(s.B.y, s.B.x - P.g));

  function arc(p, r, a0, a1, color, dash) {
    ctx.beginPath(); ctx.arc(p.x, p.y, r, -a1, -a0); ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
  }
  function draw() {
    const C = colors(), th = ctl.vals.th, s = pose(th); ctx.clearRect(0, 0, W, H);
    const O2 = T(s.O2), O4 = T(s.O4), A = T(s.A), B = T(s.B);
    $('#an-table-wrap').hidden = mode !== 'comp';
    const txt = $('#an-text'), out = $('#an-out');
    if (mode !== 'comp') {
      ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.globalAlpha = .5;
      for (let x = 0; x < W; x += 62) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 62) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    const links = () => { bar(ctx, O2, O4, C.ground, 5); bar(ctx, A, B, C.coupler, 8); bar(ctx, O2, A, C.input, 9); bar(ctx, O4, B, C.output, 9); [O2, O4, A, B].forEach(p => pin(ctx, p, C, 6)); groundMark(ctx, O2, C); groundMark(ctx, O4, C); };
    const dirAB = Math.atan2(-(B.y - A.y), B.x - A.x), dirO4B = Math.atan2(-(B.y - O4.y), B.x - O4.x);
    if (mode === 'graf') {
      ctx.beginPath(); ctx.arc(O2.x, O2.y, P.a * sc, 0, TAU); ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
      arc(A, P.b * sc, dirAB - .5, dirAB + .5, C.accent, [6, 4]);
      arc(O4, P.c * sc, dirO4B - .5, dirO4B + .5, C.accent, [6, 4]);
      links();
      ctx.beginPath(); ctx.arc(B.x, B.y, 7, 0, TAU); ctx.fillStyle = C.accent; ctx.fill();
      ctx.beginPath(); ctx.arc(O2.x, O2.y, 34, 0, -rad(th), true); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
      text(ctx, 'θ = ' + th + '°', O2.x + 48, O2.y - 14, C, { size: 13 });
      text(ctx, 'B', B.x + 14, B.y - 12, C, { color: C.accent, size: 15 });
      text(ctx, 'compás', A.x - 40, A.y - 34, C, { color: C.accent, size: 12, weight: 500 });
      txt.innerHTML = `<ol><li>Dibuja la bancada a escala: O₂O₄ = ${P.g}.</li><li>Con el transportador marca θ = ${th}° y mide a = ${P.a} desde O₂: obtienes A.</li><li>Con el compás abierto b = ${P.b}, traza un arco desde A.</li><li>Con el compás abierto c = ${P.c}, traza un arco desde O₄.</li><li>La intersección de los arcos (naranja) es B.</li></ol>`;
      out.innerHTML = '<b>Ventaja:</b> se ve el problema de inmediato. <b>Límite:</b> la precisión depende de la mano y de los instrumentos.';
    } else if (mode === 'cad') {
      links();
      const dim = (p, q, lab, off, color) => {
        const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy), nx = -dy / L * off, ny = dx / L * off;
        ctx.strokeStyle = color; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(p.x + nx, p.y + ny); ctx.lineTo(q.x + nx, q.y + ny); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + nx * 1.15, p.y + ny * 1.15); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x + nx * 1.15, q.y + ny * 1.15); ctx.stroke();
        const m = mid(p, q); text(ctx, lab, m.x + nx * 1.5, m.y + ny * 1.5, C, { size: 12, color });
      };
      dim(O2, O4, 'g = ' + fmt(P.g, 2), -34, C.ground); dim(O2, A, 'a = ' + fmt(P.a, 2), 24, C.input); dim(A, B, 'b = ' + fmt(P.b, 2), 24, C.coupler); dim(O4, B, 'c = ' + fmt(P.c, 2), -26, C.output);
      ctx.beginPath(); ctx.arc(O2.x, O2.y, 34, 0, -rad(th), true); ctx.strokeStyle = C.accent; ctx.lineWidth = 1.8; ctx.stroke();
      text(ctx, th + '°', O2.x + 48, O2.y - 12, C, { color: C.accent, size: 13 });
      txt.innerHTML = '<ol><li>Dibujas las barras como líneas con <b>restricciones</b>: longitud fija (3), punto fijo (2), ángulo (1).</li><li>El software resuelve la intersección automáticamente.</li><li>Puedes <b>arrastrar</b> la manivela y leer cualquier cota.</li></ol>';
      out.innerHTML = '<b>Ventaja:</b> precisión numérica y cambios rápidos de dimensiones. <b>Grados de libertad restantes:</b> 0 (posición única) — igual que M = 1 menos la entrada θ fijada.';
    } else if (mode === 'ana') {
      links();
      const d = Math.hypot(s.A.x - P.g, s.A.y), alpha = deg(Math.atan2(s.A.y, s.A.x - P.g)), gam = deg(Math.acos((P.c ** 2 + d * d - P.b ** 2) / (2 * P.c * d)));
      const cand = [alpha + gam, alpha - gam].map(a => ({ a, B: { x: P.g + P.c * Math.cos(rad(a)), y: P.c * Math.sin(rad(a)) } }));
      const pick = cand.reduce((u, v) => Math.hypot(u.B.x - s.B.x, u.B.y - s.B.y) < Math.hypot(v.B.x - s.B.x, v.B.y - s.B.y) ? u : v);
      ctx.beginPath(); ctx.arc(B.x, B.y, 7, 0, TAU); ctx.fillStyle = C.accent; ctx.fill();
      text(ctx, 'd', (A.x + O4.x) / 2, (A.y + O4.y) / 2 - 12, C, { size: 13, color: C.accent }); ctx.setLineDash([4, 4]); bar(ctx, A, O4, C.accent, 1.5); ctx.setLineDash([]);
      txt.innerHTML = `<ol><li>A = (a·cos θ, a·sen θ) = <b>(${fmt(s.A.x, 3)}, ${fmt(s.A.y, 3)})</b></li><li>d = |A − O₄| = <b>${fmt(d, 3)}</b></li><li>α = ángulo de O₄→A = <b>${fmt(alpha, 1)}°</b></li><li>Ley de cosenos: cos γ = (c² + d² − b²) / (2cd) → γ = <b>${fmt(gam, 1)}°</b></li><li>φ = α ± γ → φ = <b>${fmt(pick.a, 1)}°</b></li><li>B = O₄ + c(cos φ, sen φ) = <b>(${fmt(pick.B.x, 3)}, ${fmt(pick.B.y, 3)})</b></li></ol>`;
      out.innerHTML = `Comprobación: |B − A| = <b>${fmt(Math.hypot(pick.B.x - s.A.x, pick.B.y - s.A.y), 3)}</b> (debe ser b = ${P.b}). <b>Ventaja:</b> resultado exacto. <b>Límite:</b> laborioso a mano para mecanismos grandes.`;
    } else {
      links();
      txt.innerHTML = '<p>El mismo cálculo, repetido automáticamente para <b>muchas posiciones</b> (hoja de cálculo o programa). Cambia un dato y todo se actualiza.</p>';
      out.innerHTML = `Posición actual θ = <b>${th}°</b> → φ<sub>salida</sub> = <b>${fmt(phiOf(s), 1)}°</b>.`;
      const rows = []; for (let a = 0; a < 360; a += 30) { const q = pose(a); rows.push({ a, Bx: q.B.x, By: q.B.y, ph: phiOf(q) }); }
      const near = Math.round(th / 30) % 12;
      $('#an-table').innerHTML = '<thead><tr><th>θ (°)</th><th>B<sub>x</sub></th><th>B<sub>y</sub></th><th>φ salida (°)</th></tr></thead><tbody>' + rows.map((r, i) => `<tr${i === near ? ' class="hl"' : ''}><td>${r.a}</td><td>${fmt(r.Bx, 3)}</td><td>${fmt(r.By, 3)}</td><td>${fmt(r.ph, 1)}</td></tr>`).join('') + '</tbody>';
      // gráfica φ(θ)
      const L = 60, R = 20, Tp = 40, Bt = 50, w = W - L - R, h = H - Tp - Bt, ps = []; for (let a = 0; a <= 360; a += 2) ps.push(phiOf(pose(a)));
      const lo = Math.min(...ps), hi = Math.max(...ps), px = a => L + a / 360 * w, py = v => Tp + (1 - (v - lo) / (hi - lo || 1)) * h;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.fillStyle = C.muted; ctx.font = '12px system-ui'; ctx.textAlign = 'center';
      for (let a = 0; a <= 360; a += 90) { ctx.beginPath(); ctx.moveTo(px(a), Tp); ctx.lineTo(px(a), Tp + h); ctx.stroke(); ctx.fillText(a + '°', px(a), Tp + h + 18); }
      ctx.textAlign = 'right'; [lo, hi].forEach(v => { ctx.beginPath(); ctx.moveTo(L, py(v)); ctx.lineTo(L + w, py(v)); ctx.stroke(); ctx.fillText(fmt(v, 0) + '°', L - 6, py(v) + 4); });
      ctx.beginPath(); ps.forEach((v, i) => { const X = px(i * 2), Y = py(v); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.strokeStyle = C.output; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(px(th), py(phiOf(s)), 7, 0, TAU); ctx.fillStyle = C.accent; ctx.fill();
      text(ctx, 'Ángulo de salida φ en función de θ', W / 2, 18, C, { size: 14 });
      text(ctx, 'θ de entrada', W / 2, H - 8, C, { size: 12, color: C.muted, weight: 400 });
    }
  }
  addStatic(draw);
})();

/* ====================================================================
   5.4 ANALIZADOR DE POSICIÓN (ampliación matemática)
   ==================================================================== */
const norm180 = a => { a = ((a % 360) + 360) % 360; return a > 180 ? a - 360 : a; };
function fourPose(P, thDeg, sg) {
  const t = rad(thDeg), A = { x: P.a * Math.cos(t), y: P.a * Math.sin(t) }, O4 = { x: P.g, y: 0 };
  const dx = O4.x - A.x, dy = O4.y - A.y, d = Math.hypot(dx, dy);
  if (d > P.b + P.c + 1e-9 || d < Math.abs(P.b - P.c) - 1e-9) return { ok: false, A, d };
  const B = circInt(A, P.b, O4, P.c, sg);
  const t3 = Math.atan2(B.y - A.y, B.x - A.x), t4 = Math.atan2(B.y - O4.y, B.x - O4.x);
  const mu = deg(Math.acos(Math.max(-1, Math.min(1, (P.b * P.b + P.c * P.c - d * d) / (2 * P.b * P.c)))));
  return { ok: true, A, B, O4, d, t2: t, t3, t4, mu };
}
function newtonLoop(P, t2, t3, t4) {
  let x = t3 + 0.12, y = t4 - 0.12;
  for (let i = 0; i < 40; i++) {
    const f1 = P.a * Math.cos(t2) + P.b * Math.cos(x) - P.c * Math.cos(y) - P.g, f2 = P.a * Math.sin(t2) + P.b * Math.sin(x) - P.c * Math.sin(y);
    const j11 = -P.b * Math.sin(x), j12 = P.c * Math.sin(y), j21 = P.b * Math.cos(x), j22 = -P.c * Math.cos(y), det = j11 * j22 - j12 * j21;
    if (Math.abs(det) < 1e-12) return null;
    const dx = (-j22 * f1 + j12 * f2) / det, dy = (j21 * f1 - j11 * f2) / det; x += dx; y += dy;
    if (Math.hypot(dx, dy) < 1e-14) break;
  }
  return { t3: x, t4: y, B: { x: P.g + P.c * Math.cos(y), y: P.c * Math.sin(y) } };
}

(function position() {
  const cv = $('#cv-pos'), { ctx, W, H } = makeCanvas(cv, 760, 460);
  const ctl = mkControls($('#ctl-pos'), [
    { id: 'g', label: 'Bancada r₁', min: 1, max: 8, step: 0.1, val: 4, unit: ' cm' },
    { id: 'a', label: 'Entrada r₂', min: 0.5, max: 8, step: 0.1, val: 1.2, unit: ' cm' },
    { id: 'b', label: 'Acoplador r₃', min: 0.5, max: 8, step: 0.1, val: 3.8, unit: ' cm' },
    { id: 'c', label: 'Salida r₄', min: 0.5, max: 8, step: 0.1, val: 3, unit: ' cm' },
    { id: 'th', label: 'Entrada θ₂', min: 0, max: 360, step: 1, val: 60, dec: 0, unit: '°' }
  ], () => draw());
  let sg = 1, play = false;
  const bb = [chip($('#pos-branch'), 'Rama +', () => { sg = 1; bb[0].classList.add('on'); bb[1].classList.remove('on'); draw(); }, true),
              chip($('#pos-branch'), 'Rama −', () => { sg = -1; bb[1].classList.add('on'); bb[0].classList.remove('on'); draw(); }, false)];
  const pl = chip($('#pos-branch'), '▶ Animar θ₂', () => { play = !play; pl.textContent = play ? '⏸ Detener' : '▶ Animar θ₂'; }, false);
  register(cv, dt => { if (play) ctl.set({ th: (ctl.vals.th + dt * 30) % 360 }); });

  function limits(P) {
    const f = th => !!fourPose(P, rad(th) * 180 / Math.PI, sg).ok;
    const rng = sweepRange(t => !!fourPose(P, deg(t), sg).ok, 1);
    if (rng.none) return '<b>No hay ensamble</b> para ningún θ₂ con estas longitudes.';
    let html = rng.full ? 'La entrada θ₂ puede girar <b>vueltas completas</b> (todas las posiciones son ensamblables).' : `La entrada solo es ensamblable para θ₂ ∈ <b>[${fmt(rng.start, 0)}°, ${fmt(rng.end % 360, 0)}°]</b> (posiciones límite de la entrada).`;
    let prev = null, cum = 0, mn = 0, mx = 0, tmn = rng.start, tmx = rng.start, mumin = 999, mumax = -1;
    for (let a = rng.start; a <= rng.end + 1e-9; a += 0.5) {
      const q = fourPose(P, a, sg); if (!q.ok) continue;
      const ph = q.t4; if (prev !== null) { let df = ph - prev; while (df > Math.PI) df -= TAU; while (df < -Math.PI) df += TAU; cum += df; } prev = ph;
      if (cum < mn) { mn = cum; tmn = a; } if (cum > mx) { mx = cum; tmx = a; }
      mumin = Math.min(mumin, q.mu); mumax = Math.max(mumax, q.mu);
    }
    const amp = deg(mx - mn);
    html += `<br>Amplitud de la salida durante el ciclo: <b>${amp > 340 ? 'gira completa' : fmt(amp, 1) + '°'}</b>` + (amp > 340 ? '' : ` (extremos en θ₂ ≈ ${fmt(tmn % 360, 0)}° y ${fmt(tmx % 360, 0)}°)`) + '.';
    html += `<br>Ángulo de transmisión: <b>${fmt(mumin, 1)}° a ${fmt(mumax, 1)}°</b> ${mumin < 40 || mumax > 140 ? '<span style="color:var(--bad)">(sale del rango recomendado 40°–140°)</span>' : '<span style="color:var(--ok)">(dentro de 40°–140°)</span>'}.`;
    const dead = [];
    [P.b + P.c, Math.abs(P.b - P.c)].forEach((D, i) => { const cs = (P.a * P.a + P.g * P.g - D * D) / (2 * P.a * P.g); if (Math.abs(cs) <= 1) { const t = deg(Math.acos(cs)); dead.push(`θ₂ = ${fmt(t, 1)}° y ${fmt(360 - t, 1)}° (d = ${i ? '|r₃ − r₄|' : 'r₃ + r₄'}: ${i ? 'acoplador y salida plegados' : 'acoplador y salida alineados'})`); } });
    html += `<br><b>Puntos muertos (acoplador y salida colineales):</b> ` + (dead.length ? '<br>• ' + dead.join('<br>• ') : 'no se alcanzan en este mecanismo.');
    return html;
  }

  function draw() {
    const C = colors(), P = ctl.vals, q = fourPose(P, P.th, sg); ctx.clearRect(0, 0, W, H);
    const xmin = -P.a - 0.6, xmax = Math.max(P.g, P.a) + Math.max(P.c, 1) + 0.8, ym = Math.max(P.a, P.c) + 0.7;
    const sc = Math.min((W - 80) / (xmax - xmin), (H - 100) / (2 * ym)), ox = 40 - xmin * sc, oy = H / 2 + 10;
    const T = p => ({ x: ox + p.x * sc, y: oy - p.y * sc });
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.globalAlpha = .5;
    ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke(); ctx.globalAlpha = 1;
    const O2 = T({ x: 0, y: 0 }), O4 = T({ x: P.g, y: 0 }), A = T(q.A);
    $('#pos-branch').style.opacity = 1;
    if (!q.ok) {
      ctx.setLineDash([5, 5]); ctx.strokeStyle = C.coupler; ctx.beginPath(); ctx.arc(A.x, A.y, P.b * sc, 0, TAU); ctx.stroke();
      ctx.strokeStyle = C.output; ctx.beginPath(); ctx.arc(O4.x, O4.y, P.c * sc, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      bar(ctx, O2, O4, C.ground, 5); bar(ctx, O2, A, C.input, 9); [O2, O4, A].forEach(p => pin(ctx, p, C, 6));
      text(ctx, 'No hay ensamble para este θ₂', W / 2, 30, C, { color: C.bad, size: 17 });
      $('#pos-out').innerHTML = `d = ${fmt(q.d, 3)} no cumple |r₃ − r₄| = ${fmt(Math.abs(P.b - P.c), 3)} ≤ d ≤ r₃ + r₄ = ${fmt(P.b + P.c, 3)}: las circunferencias de radios r₃ y r₄ no se cortan.`;
      $('#pos-jac').innerHTML = ''; $('#pos-rank').innerHTML = ''; $('#pos-lim').innerHTML = limits(P); return;
    }
    const B = T(q.B);
    bar(ctx, O2, O4, C.ground, 5); groundMark(ctx, O2, C); groundMark(ctx, O4, C);
    bar(ctx, A, B, C.coupler, 9); bar(ctx, O2, A, C.input, 11); bar(ctx, O4, B, C.output, 11);
    // arcos de ángulo
    ctx.lineWidth = 1.8; ctx.strokeStyle = C.input; ctx.beginPath(); ctx.arc(O2.x, O2.y, 36, 0, -q.t2, true); ctx.stroke();
    ctx.strokeStyle = C.output; ctx.beginPath(); ctx.arc(O4.x, O4.y, 30, 0, -q.t4, q.t4 > 0); ctx.stroke();
    // ángulo de transmisión en B
    const aBA = Math.atan2(-(q.A.y - q.B.y), q.A.x - q.B.x), aBO = Math.atan2(-(q.O4.y - q.B.y), q.O4.x - q.B.x);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.2; ctx.beginPath();
    let a1 = aBA, a2 = aBO; let da = a2 - a1; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
    ctx.arc(B.x, B.y, 26, a1, a1 + da, da < 0); ctx.stroke();
    [O2, O4, A, B].forEach(p => pin(ctx, p, C, 6));
    text(ctx, 'θ₂', O2.x + 50, O2.y - 16, C, { color: C.input, size: 13 }); text(ctx, 'θ₄', O4.x + 44, O4.y - 18, C, { color: C.output, size: 13 });
    text(ctx, 'μ', B.x + (A.x > B.x ? 34 : -34), B.y + 4, C, { color: C.accent, size: 14 });
    text(ctx, 'A', A.x - 14, A.y - 14, C, { size: 14 }); text(ctx, 'B', B.x + 14, B.y - 14, C, { size: 14 });
    text(ctx, 'd', (A.x + O4.x) / 2, (A.y + O4.y) / 2 - 12, C, { size: 12, color: C.muted, weight: 500 });
    ctx.setLineDash([4, 4]); bar(ctx, A, O4, C.muted, 1.2); ctx.setLineDash([]);
    // verificación independiente (Newton-Raphson)
    const nw = newtonLoop(P, q.t2, q.t3, q.t4);
    const err = nw ? Math.hypot(nw.B.x - q.B.x, nw.B.y - q.B.y) : null;
    const s3 = P.b * P.c * Math.sin(q.t3 - q.t4), s23 = P.a * P.b * Math.sin(q.t3 - q.t2), s24 = P.a * P.c * Math.sin(q.t2 - q.t4);
    const tol = 1e-6, rank = (Math.abs(s3) > tol || Math.abs(s23) > tol || Math.abs(s24) > tol) ? 2 : 1;
    const ratio = Math.abs(s3) > 1e-9 ? (P.a * Math.sin(q.t3 - q.t2)) / (P.c * Math.sin(q.t3 - q.t4)) : Infinity;
    const a_ = (P.b * P.b - P.c * P.c + q.d * q.d) / (2 * q.d), h = Math.sqrt(Math.max(0, P.b * P.b - a_ * a_));
    $('#pos-out').innerHTML =
      `<b>A</b> = (${fmt(q.A.x, 3)}, ${fmt(q.A.y, 3)}) · <b>d</b> = ${fmt(q.d, 3)} (existe: ${fmt(Math.abs(P.b - P.c), 2)} ≤ d ≤ ${fmt(P.b + P.c, 2)} ✔)<br>` +
      `a = ${fmt(a_, 3)} · h = ${fmt(h, 3)} · <b>B</b> = (${fmt(q.B.x, 3)}, ${fmt(q.B.y, 3)}) (rama ${sg > 0 ? '+' : '−'})<br>` +
      `θ₃ = <b>${fmt(norm180(deg(q.t3)), 2)}°</b> · θ₄ = <b>${fmt(norm180(deg(q.t4)), 2)}°</b><br>` +
      `Ángulo de transmisión <b>μ = ${fmt(q.mu, 2)}°</b> ${q.mu < 40 || q.mu > 140 ? '<span style="color:var(--bad)">(fuera de 40°–140°)</span>' : '<span style="color:var(--ok)">(adecuado)</span>'}<br>` +
      `ω₄/ω₂ = ${isFinite(ratio) ? '<b>' + fmt(ratio, 4) + '</b>' : '<b>∞</b> (posición límite)'}<br>` +
      `<b>Verificación (Newton-Raphson):</b> ${err === null ? 'no converge' : '|ΔB| = ' + err.toExponential(1) + ' (debe ser ≈ 10⁻¹⁵)'}`;
    $('#pos-jac').innerHTML = `<tbody><tr><td>${fmt(-P.a * Math.sin(q.t2), 3)}</td><td>${fmt(-P.b * Math.sin(q.t3), 3)}</td><td>${fmt(P.c * Math.sin(q.t4), 3)}</td></tr><tr><td>${fmt(P.a * Math.cos(q.t2), 3)}</td><td>${fmt(P.b * Math.cos(q.t3), 3)}</td><td>${fmt(-P.c * Math.cos(q.t4), 3)}</td></tr></tbody>`;
    $('#pos-rank').innerHTML = `Menores: M₃₄ = r₃r₄ sen(θ₃−θ₄) = <b>${fmt(s3, 3)}</b> · M₂₃ = ${fmt(s23, 3)} · M₂₄ = ${fmt(s24, 3)}<br><b>rango(J) = ${rank}</b> → M<sub>local</sub> = 3 − ${rank} = <b>${3 - rank}</b>${rank < 2 ? ' <span style="color:var(--bad)">· singularidad: todos los eslabones colineales</span>' : ''}${Math.abs(s3) < 0.05 && rank === 2 ? '<br><span style="color:var(--warn)">M₃₄ ≈ 0: posición límite respecto a la entrada (μ ≈ 0° ó 180°).</span>' : ''}`;
    $('#pos-lim').innerHTML = limits(P);
  }
  draw();
})();

/* ====================================================================
   7.5 MISMO PROBLEMA, TRES MÉTODOS
   ==================================================================== */
(function compare() {
  const P = { g: 4, a: 1.2, b: 3.8, c: 3 };
  const cv = $('#cv-cmp'), { ctx, W, H } = makeCanvas(cv, 520, 320);
  const ctl = mkControls($('#ctl-cmp'), [
    { id: 'th', label: 'Ángulo θ₂', min: 0, max: 360, step: 1, val: 60, dec: 0, unit: '°' },
    { id: 'rl', label: 'Resol. long. (mm)', min: 0.2, max: 2, step: 0.1, val: 1 },
    { id: 'ra', label: 'Resol. ángulo (°)', min: 0.25, max: 2, step: 0.25, val: 1, dec: 2 }
  ], () => draw());
  const sig3 = x => Number(x.toPrecision(3)), rnd = (x, r) => Math.round(x / r) * r;
  function exact(th) { return solveFour(P, rad(th), 1).B; }
  function analytic3(th) {
    const t = rad(th), Ax = sig3(P.a * Math.cos(t)), Ay = sig3(P.a * Math.sin(t));
    const dx = sig3(P.g - Ax), d = sig3(Math.hypot(dx, Ay)), a_ = sig3((P.b * P.b - P.c * P.c + d * d) / (2 * d)), h = sig3(Math.sqrt(Math.max(0, P.b * P.b - a_ * a_)));
    const ux = sig3(dx / d), uy = sig3(-Ay / d);
    return { x: sig3(Ax + a_ * ux - h * uy), y: sig3(Ay + a_ * uy + h * ux) };
  }
  function graphic(th, rl, ra) {
    const r = rl / 10, Q = { g: rnd(P.g, r), a: rnd(P.a, r), b: rnd(P.b, r), c: rnd(P.c, r) };
    const s = solveFour(Q, rad(rnd(th, ra)), 1); if (!s) return null;
    return { x: rnd(s.B.x, r), y: rnd(s.B.y, r) };
  }
  function draw() {
    const C = colors(), { th, rl, ra } = ctl.vals; ctx.clearRect(0, 0, W, H);
    const E = exact(th), N = analytic3(th), G = graphic(th, rl, ra), px = 40;
    const cx = W / 2, cy = H / 2;
    const mm = (B, k) => (B[k] - E[k]) * 10;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.fillStyle = C.muted; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
    for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(cx + i * px, 0); ctx.lineTo(cx + i * px, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, cy + i * px); ctx.lineTo(W, cy + i * px); ctx.stroke(); }
    ctx.fillText('1 mm', cx + px, cy + 14);
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, TAU); ctx.strokeStyle = C.ok; ctx.lineWidth = 3; ctx.stroke();
    const mark = (B, color, ch) => { if (!B) return; const X = cx + mm(B, 'x') * px, Y = cy - mm(B, 'y') * px; text(ctx, ch, X, Y, C, { color, size: 22, weight: 800 }); };
    mark(N, C.input, '×'); mark(G, C.bad, '+');
    const err = B => B ? Math.hypot(B.x - E.x, B.y - E.y) * 10 : NaN;
    const phi = B => deg(Math.atan2(B.y, B.x - P.g));
    const rows = [['Numérico (referencia)', E, 0], ['Analítico (3 cifras)', N, err(N)], ['Gráfico', G, err(G)]];
    $('#cmp-table').innerHTML = '<thead><tr><th>Método</th><th>B<sub>x</sub> (cm)</th><th>B<sub>y</sub> (cm)</th><th>φ₄ (°)</th><th>Error (mm)</th></tr></thead><tbody>' +
      rows.map(([n, B, e]) => B ? `<tr><td>${n}</td><td>${fmt(B.x, 3)}</td><td>${fmt(B.y, 3)}</td><td>${fmt(phi(B), 2)}</td><td><b>${fmt(e, 2)}</b></td></tr>` : `<tr><td>${n}</td><td colspan="4">sin solución</td></tr>`).join('') + '</tbody>';
    $('#cmp-out').innerHTML = `<span style="color:var(--ok)">○</span> exacto · <span style="color:var(--input,#2563eb)">×</span> analítico (3 cifras) · <span style="color:var(--bad)">+</span> gráfico.<br>` +
      `El error del método gráfico depende de la resolución de lectura (regla ${fmt(rl, 1)} mm, transportador ${fmt(ra, 2)}°) y de que se propaga a través de varias construcciones. El analítico con 3 cifras acumula errores de redondeo. El numérico es la referencia.`;
  }
  draw();
})();

/* ====================================================================
   8.1 LABORATORIO DE SÍNTESIS CON MEMORIA TÉCNICA
   ==================================================================== */
(function lab() {
  const ctl = mkControls($('#ctl-lab'), [
    { id: 'g', label: 'Bancada r₁', min: 1, max: 10, step: 0.1, val: 4, unit: ' cm' },
    { id: 'a', label: 'Entrada r₂', min: 0.5, max: 10, step: 0.1, val: 1, unit: ' cm' },
    { id: 'b', label: 'Acoplador r₃', min: 1, max: 10, step: 0.1, val: 3.8, unit: ' cm' },
    { id: 'c', label: 'Salida r₄', min: 1, max: 10, step: 0.1, val: 3, unit: ' cm' },
    { id: 'L', label: 'Longitud máx. (cm)', min: 4, max: 10, step: 0.5, val: 6 },
    { id: 'mu', label: 'μ mínimo admisible', min: 20, max: 60, step: 5, val: 40, dec: 0, unit: '°' },
    { id: 'th0', label: 'Config. inicial θ₂', min: 0, max: 360, step: 5, val: 0, dec: 0, unit: '°' }
  ], () => check());
  fourBarDemo($('#cv-lab'), () => ctl.vals, { cpu: 0.5, cpv: 0.6 });
  let last = null;
  function metrics(P) {
    const r = sweepRange(th => !!solveFour(P, th, 1));
    if (r.none) return { asm: false };
    let prev = null, cum = 0, mn = 0, mx = 0, mumin = 999, mumax = -1;
    for (let d = 0; d < 360; d += 1) {
      const s = solveFour(P, rad(d), 1); if (!s) continue;
      const ph = Math.atan2(s.B.y, s.B.x - P.g);
      if (prev !== null) { let df = ph - prev; while (df > Math.PI) df -= TAU; while (df < -Math.PI) df += TAU; cum += df; }
      prev = ph; mn = Math.min(mn, cum); mx = Math.max(mx, cum);
      const dd = Math.hypot(s.A.x - P.g, s.A.y), mu = deg(Math.acos(Math.max(-1, Math.min(1, (P.b * P.b + P.c * P.c - dd * dd) / (2 * P.b * P.c)))));
      mumin = Math.min(mumin, mu); mumax = Math.max(mumax, mu);
    }
    return { asm: true, full: r.full, amp: deg(mx - mn), mumin, mumax };
  }
  function check() {
    const P = ctl.vals, m = metrics(P), cl = classifyFour(P.g, P.a, P.b, P.c);
    const rows = [], res = {};
    const row = (k, ok, t) => { res[k] = ok; rows.push(`<div><b class="${ok ? 'y' : 'n'}">${ok ? '✔' : '✖'}</b><span>${t}</span></div>`); };
    const asm = m.asm; row('asm', asm, 'El mecanismo se puede ensamblar');
    const full = asm && m.full; row('full', full, 'La entrada (2) gira vueltas completas');
    const rocks = full && m.amp < 340; row('rocks', rocks, 'La salida (4) oscila (no da vueltas completas)');
    const amp = full ? m.amp : 0; const okAmp = rocks && amp >= 60 && amp <= 100;
    row('amp', okAmp, `Amplitud de la salida entre 60° y 100° (actual: ${full ? fmt(amp, 0) + '°' : '—'})`);
    const Lmax = Math.max(P.g, P.a, P.b, P.c); row('len', Lmax <= P.L + 1e-9, `Ningún eslabón mayor que ${fmt(P.L, 1)} cm (mayor actual: ${fmt(Lmax, 1)} cm)`);
    const okMu = full && m.mumin >= P.mu && m.mumax <= 180 - P.mu;
    row('mu', okMu, `Ángulo de transmisión entre ${fmt(P.mu, 0)}° y ${fmt(180 - P.mu, 0)}° (actual: ${full ? fmt(m.mumin, 0) + '° a ' + fmt(m.mumax, 0) + '°' : '—'})`);
    $('#lab-checks').innerHTML = rows.join('');
    const all = Object.values(res).every(Boolean), v = $('#lab-verdict');
    last = { P: { ...P }, m, cl, res, all };
    if (all) { v.className = 'verdict ok'; v.innerHTML = `Cumple todas las especificaciones<small>${cl.cat}: oscilación de ${fmt(amp, 0)}° y μ entre ${fmt(m.mumin, 0)}° y ${fmt(m.mumax, 0)}°. Genera la memoria técnica.</small>`; }
    else {
      let hint;
      if (!asm) hint = 'El eslabón más largo debe ser menor que la suma de los otros tres.';
      else if (!full) hint = 'Para que la entrada gire completa debe ser el eslabón más corto y cumplirse s + l ≤ p + q (Grashof).';
      else if (!rocks) hint = 'La salida gira completa: con la entrada más corta que la bancada, la salida debería oscilar.';
      else if (!okAmp) hint = amp < 60 ? 'Amplitud pequeña: prueba cambiar la longitud de la salida o de la bancada y observa cuál la aumenta.' : 'Amplitud excesiva: modifica el acoplador o la salida.';
      else if (!res.len) hint = 'Reduce el eslabón más largo o aumenta la longitud máxima permitida.';
      else hint = 'El ángulo de transmisión baja demasiado en alguna posición: prueba acercar acoplador y salida en longitud, o aumentar la bancada.';
      v.className = 'verdict warn'; v.innerHTML = `Aún no cumple<small>${hint}</small>`;
    }
  }
  check();

  let memoHTML = '';
  $('#lab-memo-btn').addEventListener('click', () => {
    check(); const { P, m, cl, res, all } = last, now = new Date().toLocaleDateString('es');
    const q = fourPose(P, P.th0, 1), yn = ok => ok ? '✔ Cumple' : '✖ No cumple';
    let img = ''; try { img = `<img alt="Diagrama del mecanismo" src="${$('#cv-lab').toDataURL('image/png')}">`; } catch (e) { img = '<p>(no se pudo incrustar el diagrama)</p>'; }
    const f = (x, d = 2) => fmt(x, d);
    memoHTML = `<h2>Memoria técnica — Diseño de un mecanismo de cuatro barras</h2><p>Fecha: ${now}</p>
      <h3>1. Especificaciones y verificación</h3>
      <table><thead><tr><th>Requisito</th><th>Valor exigido</th><th>Valor obtenido</th><th>Resultado</th></tr></thead><tbody>
        <tr><td>Ensamblable</td><td>Sí</td><td>${m.asm ? 'Sí' : 'No'}</td><td>${yn(res.asm)}</td></tr>
        <tr><td>Entrada con giro completo</td><td>Sí</td><td>${m.full ? 'Sí' : 'No'}</td><td>${yn(res.full)}</td></tr>
        <tr><td>Salida oscilante</td><td>Sí</td><td>${res.rocks ? 'Sí' : 'No'}</td><td>${yn(res.rocks)}</td></tr>
        <tr><td>Amplitud de la salida</td><td>60° – 100°</td><td>${m.full ? f(m.amp, 1) + '°' : '—'}</td><td>${yn(res.amp)}</td></tr>
        <tr><td>Longitud máxima de eslabón</td><td>≤ ${f(P.L, 1)} cm</td><td>${f(Math.max(P.g, P.a, P.b, P.c), 1)} cm</td><td>${yn(res.len)}</td></tr>
        <tr><td>Ángulo de transmisión μ</td><td>${f(P.mu, 0)}° – ${f(180 - P.mu, 0)}°</td><td>${m.full ? f(m.mumin, 1) + '° – ' + f(m.mumax, 1) + '°' : '—'}</td><td>${yn(res.mu)}</td></tr></tbody></table>
      <h3>2. Parámetros de diseño</h3>
      <p>Bancada r₁ = ${f(P.g, 1)} cm; entrada r₂ = ${f(P.a, 1)} cm; acoplador r₃ = ${f(P.b, 1)} cm; salida r₄ = ${f(P.c, 1)} cm. Configuración inicial θ₂ = ${f(P.th0, 0)}°.</p>
      <p>Orden de longitudes: s = ${f(cl.S.v, 1)} (${cl.S.n}), l = ${f(cl.Lg.v, 1)} (${cl.Lg.n}), p = ${f(cl.p.v, 1)}, q = ${f(cl.q.v, 1)}. s + l = ${f(cl.lhs, 1)} ${cl.lhs < cl.rhs - 1e-6 ? '&lt;' : (Math.abs(cl.lhs - cl.rhs) < 1e-6 ? '=' : '&gt;')} p + q = ${f(cl.rhs, 1)}. Clasificación: <b>${cl.cat}</b>.</p>
      <h3>3. Ecuaciones utilizadas</h3>
      <ul><li>Criterio de Grashof: s + l ≤ p + q.</li>
        <li>Movilidad: M = 3(n − 1) − 2j<sub>p</sub> − j<sub>h</sub> = 3(3) − 2(4) = 1.</li>
        <li>Cierre del lazo: r₂ e<sup>iθ₂</sup> + r₃ e<sup>iθ₃</sup> − r₄ e<sup>iθ₄</sup> − r₁ = 0.</li>
        <li>Existencia: |r₃ − r₄| ≤ d ≤ r₃ + r₄, con d = |A − O₄|.</li>
        <li>Ángulo de transmisión: cos μ = (r₃² + r₄² − d²)/(2 r₃ r₄).</li></ul>
      <h3>4. Resultados en la configuración inicial</h3>
      ${q.ok ? `<p>A = (${f(q.A.x, 3)}; ${f(q.A.y, 3)}) cm · B = (${f(q.B.x, 3)}; ${f(q.B.y, 3)}) cm · θ₃ = ${f(norm180(deg(q.t3)), 1)}° · θ₄ = ${f(norm180(deg(q.t4)), 1)}° · d = ${f(q.d, 3)} cm · μ = ${f(q.mu, 1)}°.</p>` : '<p>La configuración inicial elegida no es ensamblable.</p>'}
      <h3>5. Diagrama</h3>${img}
      <h3>6. Justificación del diseño</h3>
      <textarea id="memo-just" rows="4" style="width:100%;font:inherit;padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--surface2);color:var(--ink)" placeholder="Explica por qué elegiste estas longitudes y cómo cumplen cada requisito."></textarea>
      <h3>7. Conclusión</h3>
      <p><b>${all ? 'El diseño cumple todas las especificaciones.' : 'El diseño NO cumple todas las especificaciones.'}</b> ${all ? '' : 'Requisitos pendientes: ' + Object.entries({ asm: 'ensamblaje', full: 'giro completo de la entrada', rocks: 'oscilación de la salida', amp: 'amplitud', len: 'longitud máxima', mu: 'ángulo de transmisión' }).filter(([k]) => !res[k]).map(([, v]) => v).join(', ') + '.'}</p>`;
    const el = $('#memo'); el.innerHTML = memoHTML; el.hidden = false; $('#lab-dl-btn').disabled = false;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#lab-dl-btn').addEventListener('click', () => {
    const just = ($('#memo-just') || {}).value || '(sin justificación)';
    const body = memoHTML.replace(/<textarea[\s\S]*?<\/textarea>/, `<p>${just.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}</p>`);
    const doc = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Memoria técnica</title><style>body{font:16px/1.5 system-ui,sans-serif;max-width:800px;margin:24px auto;padding:0 16px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:6px 10px;text-align:left}img{max-width:100%}</style><body>${body}</body></html>`;
    const url = URL.createObjectURL(new Blob([doc], { type: 'text/html' })), a = document.createElement('a');
    a.href = url; a.download = 'memoria-tecnica-cuatro-barras.html'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();

/* ====================================================================
   8.2 EVALUACIÓN CON RETROALIMENTACIÓN RAZONADA
   ==================================================================== */
(function quizzes() {
  let okc = 0, total = 0;
  const area = $('#quiz-area'), rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const sc = () => { $('#score').textContent = `Aciertos: ${okc} de ${total}`; };
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function card(title) {
    const d = document.createElement('div'); d.className = 'panel quiz';
    d.innerHTML = `<h3>${title}</h3><p class="q"></p><div class="opts"></div><p class="fb" role="status"></p><div class="why" hidden></div><button class="btn ghost" style="margin-top:10px">Otra pregunta</button>`;
    area.appendChild(d);
    return { q: d.querySelector('.q'), opts: d.querySelector('.opts'), fb: d.querySelector('.fb'), why: d.querySelector('.why'), next: d.querySelector('button'), root: d };
  }
  function mcq(title, gen) {
    const c = card(title);
    function load() {
      const g = gen(); let answered = false, solved = false;
      c.q.innerHTML = g.q; c.opts.innerHTML = ''; c.fb.textContent = ''; c.why.hidden = true;
      g.options.forEach((o, i) => {
        const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = o;
        b.onclick = () => {
          if (solved) return;
          if (!answered) { answered = true; total++; if (i === g.correct) okc++; sc(); }
          if (i === g.correct) {
            solved = true; b.classList.add('right'); c.fb.style.color = 'var(--ok)'; c.fb.textContent = '¡Correcto!';
            c.why.hidden = false; c.why.innerHTML = '<b>Por qué:</b> ' + g.explain;
          } else {
            b.classList.add('wrong'); b.disabled = true; c.fb.style.color = 'var(--bad)'; c.fb.textContent = 'Todavía no.';
            c.why.hidden = false; c.why.innerHTML = (g.wrong && g.wrong[i] ? '<b>Revisa:</b> ' + g.wrong[i] : '<b>Pista:</b> relee el criterio del módulo correspondiente.');
          }
        };
        c.opts.appendChild(b);
      });
    }
    c.next.onclick = load; load();
  }

  /* 1 movilidad (numérica) */
  (function () {
    const c = card('Calcula la movilidad'); let M, n, jp, jh, answered;
    c.opts.remove(); c.next.textContent = 'Otra pregunta';
    const row = document.createElement('div'); row.className = 'qin';
    row.innerHTML = '<input type="number" inputmode="numeric" aria-label="Respuesta de movilidad"><button class="btn">Comprobar</button>';
    c.q.after(row); const inp = row.querySelector('input'), btn = row.querySelector('button');
    function load() {
      n = rnd(3, 7); jp = rnd(2, 8); jh = Math.random() < .3 ? rnd(1, 2) : 0; M = 3 * (n - 1) - 2 * jp - jh; answered = false;
      c.q.innerHTML = `Un mecanismo plano tiene <b>${n}</b> eslabones (incluida la bancada), <b>${jp}</b> uniones principales y <b>${jh}</b> uniones de orden superior. ¿Cuánto vale M?`;
      inp.value = ''; c.fb.textContent = ''; c.why.hidden = true;
    }
    btn.onclick = () => {
      if (inp.value === '') return;
      if (!answered) { answered = true; total++; if (+inp.value === M) okc++; sc(); }
      const steps = `M = 3(n − 1) − 2j<sub>p</sub> − j<sub>h</sub> = 3(${n} − 1) − 2(${jp}) − ${jh} = ${3 * (n - 1)} − ${2 * jp} − ${jh} = <b>${M}</b>.`;
      const read = M === 1 ? 'Una entrada independiente basta.' : M > 1 ? `Se necesitan ${M} entradas independientes.` : M === 0 ? 'Estructura en el análisis convencional.' : 'Restricciones en exceso (redundantes o incompatibles): revisa la geometría.';
      c.why.hidden = false;
      if (+inp.value === M) { c.fb.style.color = 'var(--ok)'; c.fb.textContent = '¡Correcto!'; c.why.innerHTML = `<b>Procedimiento:</b> ${steps} ${read}`; }
      else {
        c.fb.style.color = 'var(--bad)'; c.fb.textContent = 'No coincide.';
        const t = 3 * (n - 1), hints = [];
        if (+inp.value === 3 * n - 2 * jp - jh) hints.push('Parece que usaste n en vez de (n − 1): la bancada no aporta grados de libertad.');
        if (+inp.value === t - jp - jh) hints.push('Cada unión principal quita 2 grados de libertad, no 1.');
        c.why.innerHTML = `<b>Revisa:</b> ${hints.join(' ') || 'Cuenta primero 3(n − 1), luego resta 2 por cada unión principal y 1 por cada unión de orden superior.'}<br>${steps}`;
      }
    };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
    c.next.onclick = load; load();
  })();

  /* 2 Grashof */
  const CATS = ['Doble manivela', 'Manivela-balancín', 'Doble balancín', 'Punto de cambio', 'Triple balancín'];
  mcq('Clasifica el cuatro barras (Grashof)', () => {
    let g, a, b, c, r;
    do { g = rnd(2, 12); a = rnd(2, 12); b = rnd(2, 12); c = rnd(2, 12); r = invInfo([g, a, b, c], 0); } while (Math.max(g, a, b, c) >= g + a + b + c - Math.max(g, a, b, c));
    const o = [...CATS];
    return {
      q: `Bancada = <b>${g}</b>, entrada = <b>${a}</b>, acoplador = <b>${b}</b>, salida = <b>${c}</b> (cm). ¿Qué tipo de mecanismo es?`,
      options: o, correct: o.indexOf(r.cat),
      explain: `Ordenadas, s = ${r.s}, p = ${r.p}, q = ${r.q}, l = ${r.l}. s + l = ${r.lhs}; p + q = ${r.rhs}. ${r.why}`,
      wrong: Object.fromEntries(o.map((x, i) => [i, 'Calcula s + l y p + q: si s + l > p + q es triple balancín; si son iguales, punto de cambio; si es menor, depende de dónde está el eslabón más corto.']))
    };
  });

  /* 3 inversión */
  mcq('Inversión cinemática', () => {
    let L, k, r;
    do { L = [rnd(2, 12), rnd(2, 12), rnd(2, 12), rnd(2, 12)]; r = invInfo(L, 0); } while (Math.max(...L) >= L.reduce((x, y) => x + y) - Math.max(...L) || r.kind === 'bad' || r.cat === 'Punto de cambio');
    k = rnd(0, 3); const res = invInfo(L, k), o = ['Doble manivela', 'Manivela-balancín', 'Doble balancín'];
    return {
      q: `Una cadena de cuatro barras tiene eslabones de <b>${L.join(', ')}</b> cm (en orden 1-2-3-4). Fijas el <b>eslabón ${k + 1}</b> como bancada. ¿Qué tipo de mecanismo resulta?`,
      options: o, correct: o.indexOf(res.cat),
      explain: res.why + ' La inversión no cambia el movimiento relativo, solo cuál eslabón se toma como referencia.',
      wrong: { 0: 'Doble manivela requiere que el eslabón más corto sea precisamente el que está fijo.', 1: 'Manivela-balancín: el eslabón más corto debe ser adyacente al fijo.', 2: 'Doble balancín: el eslabón más corto debe ser el opuesto al fijo.' }
    };
  });

  /* 4 uniones */
  const U = [
    ['Una puerta unida al marco con bisagras', 0, 'solo puede girar respecto al marco: unión de perno.'],
    ['Un cajón que se desliza por sus guías rectas', 1, 'solo se desplaza en línea recta: corredera.'],
    ['Un pistón dentro de su cilindro', 1, 'el pistón solo desliza dentro del cilindro: corredera (el cilindro son dos eslabones).'],
    ['La rueda de una bicicleta respecto a su eje', 0, 'solo gira: unión de perno.'],
    ['Un seguidor que sube y baja siguiendo el contorno de una leva', 2, 'el contacto es de línea o punto con giro y deslizamiento: unión de orden superior (leva).'],
    ['Dos ruedas dentadas que se transmiten el giro', 3, 'los dientes ruedan y se deslizan: unión de orden superior (engranes).']
  ];
  mcq('Identifica la unión', () => {
    const [d, ans, why] = U[rnd(0, U.length - 1)];
    return {
      q: `¿Qué tipo de unión se modela entre las piezas? <b>${d}</b>.`,
      options: ['Perno (revoluta)', 'Corredera (prismática)', 'Leva (orden superior)', 'Engranes (orden superior)'], correct: ans,
      explain: why[0].toUpperCase() + why.slice(1),
      wrong: { 0: 'El perno solo permite rotación pura.', 1: 'La corredera solo permite deslizamiento recto.', 2: 'La leva implica contacto con rotación y deslizamiento combinados.', 3: 'Los engranes ruedan y deslizan entre dientes.' }
    };
  });

  /* 5 conceptos */
  const K = [
    ['Tres eslabones comparten un solo perno. ¿Cuántas uniones debes contar para Gruebler?', ['1', '2', '3', '0'], 1, 'Una unión de perno conecta por definición dos eslabones; con k eslabones en un perno se cuentan k − 1 uniones.'],
    ['¿Cómo se modela un cilindro hidráulico en un diagrama cinemático?', ['Un eslabón con un perno', 'Dos eslabones unidos por una corredera', 'Un resorte', 'Una leva'], 1, 'El cuerpo y el pistón/varilla son dos cuerpos rígidos que deslizan uno respecto al otro.'],
    ['En un diagrama cinemático, ¿qué eslabón se numera como 1?', ['El actuador', 'El eslabón más largo', 'La bancada', 'El acoplador'], 2, 'La bancada es el marco de referencia y se numera 1 por convención.'],
    ['¿Cómo se modela una unión de perno en una ranura para el análisis plano?', ['Como un engrane', 'Como un perno más una corredera, con un eslabón extra', 'Se ignora', 'Como un resorte'], 1, 'Es una unión de orden superior; el modelo con uniones principales produce el mismo movimiento relativo y facilita el análisis.'],
    ['Una leva con seguidor de rodillo da M = 2 con Gruebler. ¿Por qué el diseñador considera solo 1 GDL?', ['La fórmula está mal', 'El giro del rodillo es un grado de libertad inactivo', 'La leva no cuenta', 'El rodillo es la bancada'], 1, 'El rodillo gira libremente sin afectar la relación entrada-salida; reduce desgaste, pero no es un movimiento útil.'],
    ['Con la ecuación de Gruebler, M = 0. ¿Qué conclusión es más prudente?', ['Siempre está bloqueado', 'Es una estructura en general; revisa excepciones geométricas', 'Siempre se mueve', 'Tiene 3 grados de libertad'], 1, 'Gruebler solo cuenta eslabones y uniones, no la geometría; casos especiales (eslabones redundantes) pueden moverse.'],
    ['En una manivela-corredera con desfase (e ≠ 0), ¿qué puede aparecer?', ['Movimiento en línea recta perfecta', 'Avance y retorno de distinta duración', 'Cero grados de libertad', 'Ya no hay biela'], 1, 'Al descentrar la guía, los puntos muertos ya no están a 180°, y avance y retorno duran distinto (retorno rápido).']
  ];
  mcq('Conceptos del capítulo', () => {
    const [q, o, c, e] = K[rnd(0, K.length - 1)], idx = shuffle(o.map((t, i) => i));
    return { q, options: idx.map(i => o[i]), correct: idx.indexOf(c), explain: e, wrong: {} };
  });
  sc();
})();
