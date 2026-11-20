/* Mecanismos Vivos — módulos 1-3 (progreso, uniones comunes, actuadores, taller de diagramas) */
'use strict';

const statics = [];
const addStatic = fn => { statics.push(fn); fn(); };
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => statics.forEach(f => f()));

/* ---------- 2.3 manivela excéntrica ---------- */
(function eccentric() {
  const cv = $('#cv-eccentric'), { ctx, W, H } = makeCanvas(cv, 440, 300);
  let t = 0;
  register(cv, dt => {
    t += dt * 1.6; const C = colors(); ctx.clearRect(0, 0, W, H);
    const S = { x: 110, y: 150 }, e = 26, R = 52, l = 190;
    const Cc = { x: S.x + e * Math.cos(t), y: S.y - e * Math.sin(t) };
    const B = { x: Cc.x + Math.sqrt(l * l - (Cc.y - S.y) ** 2), y: S.y };
    ctx.fillStyle = C.ground; ctx.fillRect(250, S.y - 34, 180, 5); ctx.fillRect(250, S.y + 29, 180, 5);
    ctx.fillStyle = C.output; ctx.fillRect(B.x - 26, S.y - 22, 52, 44);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(B.x - 26, S.y - 22, 52, 44);
    bar(ctx, Cc, B, C.coupler, 10);
    ctx.beginPath(); ctx.arc(Cc.x, Cc.y, R, 0, TAU); ctx.fillStyle = C.input; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.setLineDash([4, 4]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(S.x, S.y); ctx.lineTo(Cc.x, Cc.y); ctx.stroke(); ctx.setLineDash([]);
    groundMark(ctx, S, C); pin(ctx, S, C, 6, true); pin(ctx, Cc, C, 5); pin(ctx, B, C, 6);
    text(ctx, 'e', (S.x + Cc.x) / 2 - 4, (S.y + Cc.y) / 2 - 14, C, { color: C.accent, size: 16 });
    text(ctx, 'e = longitud efectiva de la manivela', 140, 272, C, { color: C.muted, size: 13, weight: 400 });
  });
})();

/* ---------- 2.3 perno en ranura ---------- */
(function slot() {
  const cv = $('#cv-slot'), { ctx, W, H } = makeCanvas(cv, 440, 300);
  let t = 0;
  function scene(C, ox, oy, s, model) {
    const O1 = { x: ox, y: oy }, O2 = { x: ox + 150 * s, y: oy - 10 * s }, rB = 80 * s;
    const phi = Math.PI * 0.92 + 0.55 * Math.sin(t * 1.3);
    const P = { x: O2.x + rB * Math.cos(phi), y: O2.y + rB * Math.sin(phi) };
    const a = Math.atan2(P.y - O1.y, P.x - O1.x), len = 200 * s;
    const end = { x: O1.x + len * Math.cos(a), y: O1.y + len * Math.sin(a) };
    const s0 = { x: O1.x + 0.35 * len * Math.cos(a), y: O1.y + 0.35 * len * Math.sin(a) };
    bar(ctx, O1, end, C.input, 20 * s + 6);
    bar(ctx, s0, end, C.surface2, 8 * s + 3);
    bar(ctx, O2, P, C.output, 12 * s + 2);
    if (model) {
      ctx.save(); ctx.translate(P.x, P.y); ctx.rotate(a);
      ctx.fillStyle = C.coupler; ctx.fillRect(-14, -10, 28, 20); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(-14, -10, 28, 20);
      ctx.restore();
    }
    groundMark(ctx, O1, C, 26); groundMark(ctx, O2, C, 26);
    pin(ctx, O1, C, 5, true); pin(ctx, O2, C, 5, true); pin(ctx, P, C, model ? 4 : 5, !model);
    return { P };
  }
  register(cv, dt => {
    t += dt; const C = colors(); ctx.clearRect(0, 0, W, H);
    scene(C, 40, 210, 0.62, false);
    const r = scene(C, 255, 210, 0.62, true);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(220, 20); ctx.lineTo(220, 280); ctx.stroke();
    text(ctx, 'Unión real', 110, 28, C, { size: 14 }); text(ctx, '(orden superior)', 110, 46, C, { size: 12, color: C.muted, weight: 400 });
    text(ctx, 'Modelo plano', 330, 28, C, { size: 14 }); text(ctx, 'perno + corredera + eslabón extra', 330, 46, C, { size: 12, color: C.muted, weight: 400 });
  });
})();

/* ---------- 2.3 unión de tornillo ---------- */
(function screw() {
  const cv = $('#cv-screw'), { ctx, W, H } = makeCanvas(cv, 440, 250);
  const ctl = mkControls($('#ctl-screw'), [
    { id: 'p', label: 'Paso axial p (mm)', min: 1, max: 8, step: 0.5, val: 3 },
    { id: 'ne', label: 'Entradas n_e', min: 1, max: 4, step: 1, val: 1, dec: 0 },
    { id: 'n', label: 'Giro (rpm)', min: 10, max: 120, step: 5, val: 60, dec: 0 }
  ], () => out());
  function out() {
    const { p, ne, n } = ctl.vals, L = p * ne;
    $('#out-screw').innerHTML = `Avance por revolución <b>L = n<sub>e</sub>·p = ${fmt(ne, 0)}·${fmt(p, 1)} = ${fmt(L, 1)} mm</b>. Para un giro θ: <b>Δx = L·θ/2π</b> (θ en rad). A ${fmt(n, 0)} rpm: v = L·n = <b>${fmt(L * n, 0)} mm/min</b>. Un solo grado de libertad independiente.`;
  }
  out();
  let th = 0;
  register(cv, dt => {
    const { p, ne, n } = ctl.vals, Lead = p * ne; const C = colors(); ctx.clearRect(0, 0, W, H);
    th += dt * (n / 60) * TAU * 0.35;
    // el sentido se invierte periódicamente para que la tuerca vaya y venga
    const turns = th / TAU, cyc = 6, m = ((turns % (2 * cyc)) + 2 * cyc) % (2 * cyc), tri = m < cyc ? m : 2 * cyc - m;
    const dir = m < cyc ? 1 : -1;
    const x0 = 50, x1 = 390, cy = 110, r = 24, pitchPx = p * 6;
    ctx.fillStyle = C.ground; ctx.fillRect(x0 - 14, cy - 40, 12, 80); ctx.fillRect(x1 + 2, cy - 40, 12, 80);
    ctx.fillStyle = C.input; ctx.fillRect(x0, cy - r, x1 - x0, 2 * r);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(x0, cy - r, x1 - x0, 2 * r);
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2;
    const ph = (dir * th / TAU * pitchPx) % pitchPx;
    for (let x = x0 - pitchPx + ((ph % pitchPx) + pitchPx) % pitchPx; x < x1; x += pitchPx) {
      if (x < x0) continue;
      ctx.beginPath(); ctx.moveTo(x, cy + r); ctx.lineTo(Math.min(x + 14, x1), cy - r); ctx.stroke();
    }
    const nx = x0 + 20 + tri * Lead * 6, nw = 46;
    ctx.fillStyle = C.output; ctx.fillRect(nx, cy - r - 12, nw, 2 * r + 24);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(nx, cy - r - 12, nw, 2 * r + 24);
    text(ctx, 'tornillo (gira)', 200, 190, C, { color: C.input, size: 13 });
    text(ctx, 'tuerca (avanza)', nx + nw / 2, 36, C, { color: C.output, size: 13 });
    text(ctx, `giro ${dir > 0 ? '↻' : '↺'}   →   tuerca ${dir > 0 ? '→' : '←'}`, 330, 225, C, { color: C.accent, size: 14 });
  });
})();

/* ---------- 2.5 cilindro = 2 eslabones + corredera ---------- */
(function cylinder() {
  const cv = $('#cv-cyl'), { ctx, W, H } = makeCanvas(cv, 760, 250);
  let t = 0;
  register(cv, dt => {
    t += dt; const C = colors(); ctx.clearRect(0, 0, W, H);
    const ext = 50 + 50 * Math.sin(t * 1.2); // 0..100
    // real
    const x0 = 40, y0 = 80, bodyW = 170, bodyH = 44;
    ctx.fillStyle = C.output; ctx.fillRect(x0, y0, bodyW, bodyH); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(x0, y0, bodyW, bodyH);
    ctx.fillStyle = C.coupler; ctx.fillRect(x0 + bodyW, y0 + 14, 40 + ext, 16);
    ctx.fillRect(x0 + bodyW - 40 + ext * 0.0, y0 + 6, 18, 32); // pistón
    ctx.strokeStyle = C.ink; ctx.strokeRect(x0 + bodyW, y0 + 14, 40 + ext, 16);
    pin(ctx, { x: x0 - 12, y: y0 + 22 }, C, 7); bar(ctx, { x: x0 - 12, y: y0 + 22 }, { x: x0, y: y0 + 22 }, C.ink, 4);
    pin(ctx, { x: x0 + bodyW + 40 + ext + 14, y: y0 + 22 }, C, 7);
    text(ctx, 'Cilindro real', 150, 40, C, { size: 14 });
    // esquema cinemático
    const kx = 410, ky = 120;
    text(ctx, 'Representación cinemática', 580, 40, C, { size: 14 });
    const A0 = { x: kx, y: ky }, A1 = { x: kx + 190, y: ky };
    const B0 = { x: kx + 110 + ext * 0.5, y: ky + 22 }, B1 = { x: kx + 110 + 160 + ext * 0.5, y: ky + 22 };
    bar(ctx, A0, A1, C.output, 8);
    bar(ctx, B0, { x: B1.x, y: B1.y }, C.coupler, 8);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(B0.x - 4, ky - 14, 56, 50);
    pin(ctx, A0, C, 7); pin(ctx, B1, C, 7);
    text(ctx, 'A (cilindro)', kx + 60, ky - 28, C, { color: C.output, size: 13 });
    text(ctx, 'B (pistón / varilla)', B1.x - 30, ky + 62, C, { color: C.coupler, size: 13 });
    text(ctx, 'corredera', B0.x + 24, ky - 28, C, { color: C.accent, size: 13 });
    text(ctx, 'perno', A0.x, ky + 26, C, { color: C.muted, size: 12, weight: 400 });
    text(ctx, 'perno', B1.x, ky + 44 + 18, C, { color: C.muted, size: 12, weight: 400 });
  });
})();

/* ---------- 2.5 galería de actuadores ---------- */
(function actuators() {
  const A = [
    { n: 'Motor eléctrico de CA', t: ['rot'], e: 'Electricidad alterna', m: 'Giro continuo', c: 'Velocidades discretas ligadas a la frecuencia de red (a 60 Hz: 3600, 1800, 1200, 900, 720, 600 rpm nominales)', u: 'Ventiladores, bombas, bandas transportadoras. Monofásico (1/50–2 hp, residencial); trifásico (1/4–500 hp, industrial, más eficiente).', k: 'Giro de entrada en un eslabón con perno a la bancada.' },
    { n: 'Motor eléctrico de CC', t: ['rot'], e: 'Electricidad continua (batería o fuente)', m: 'Giro continuo', c: 'Velocidad y sentido fáciles de variar; hasta ≈ 30 000 rpm', u: 'Vehículos, herramientas inalámbricas, máquinas de coser.', k: 'Giro de entrada en un eslabón con perno a la bancada.' },
    { n: 'Motor de gasolina', t: ['rot'], e: 'Combustible', m: 'Giro continuo', c: 'Regulable entre ≈ 1000 y 8000 rpm', u: 'Equipos portátiles y de exterior que requieren mucha potencia (sierra de cadena, generadores).', k: 'Giro de entrada; el cigüeñal suele ser una manivela excéntrica.' },
    { n: 'Servomotor', t: ['rot', 'pos'], e: 'Electricidad + controlador y sensores', m: 'Giro programado o posición fija', c: 'Realimentación de posición, velocidad y aceleración', u: 'Robots y máquinas de movimiento guiado con precisión. Menos potencia y más costo que otros motores.', k: 'Giro de entrada con posición controlada.' },
    { n: 'Motor neumático o hidráulico', t: ['rot'], e: 'Aire comprimido o fluido a presión', m: 'Giro continuo', c: 'Requiere una fuente de aire o de fluido a presión', u: 'Equipo de construcción y aeronaves, donde ya hay fluido a alta presión.', k: 'Giro de entrada en un eslabón con perno a la bancada.' },
    { n: 'Cilindro hidráulico / neumático', t: ['lin'], e: 'Fluido a presión', m: 'Lineal, carrera limitada', c: 'Se controla con válvulas; el hidráulico entrega fuerzas muy grandes', u: 'Plataformas elevadoras, estabilizadores de camión, excavadoras.', k: 'Dos eslabones (cilindro y pistón/varilla) unidos por una corredera; pernos en los extremos.' },
    { n: 'Actuador de tornillo', t: ['lin', 'pos'], e: 'Electricidad (motor + tornillo y tuerca)', m: 'Lineal, carrera limitada', c: 'Control preciso de posición; reemplaza directamente a un cilindro', u: 'Mesas levadizas, posicionadores. Más costoso que un cilindro aun si hay fuente de aire o fluido.', k: 'Mismo diagrama cinemático que un cilindro.' },
    { n: 'Solenoide', t: ['lin'], e: 'Electricidad', m: 'Lineal, carrera corta', c: 'Normalmente encendido/apagado', u: 'Cerraduras, válvulas, relevadores.', k: 'Corredera entre núcleo y cuerpo.' },
    { n: 'Actuación manual', t: ['rot', 'lin'], e: 'Energía humana', m: 'Complejo y variable', c: 'Movimientos de la mano o del cuerpo', u: 'Herramientas manuales, manivelas, pedales. Si el uso es repetitivo, vigilar fatiga y deformación.', k: 'Se modela como un eslabón de entrada (mango o pedal).' }
  ];
  const labels = { rot: 'Giro continuo', lin: 'Lineal limitado', pos: 'Posicionamiento controlado' };
  const g = $('#act-gallery'), fl = $('#act-filters');
  A.forEach(a => {
    const el = document.createElement('article'); el.className = 'act'; el.dataset.t = a.t.join(' ');
    el.innerHTML = `<h4>${a.n}</h4><div class="tags">${a.t.map(x => `<span class="tag ${x}">${labels[x]}</span>`).join('')}</div>
      <dl><dt>Energía</dt><dd>${a.e}</dd><dt>Movimiento</dt><dd>${a.m}</dd><dt>Control</dt><dd>${a.c}</dd><dt>Uso típico</dt><dd>${a.u}</dd><dt>En el diagrama</dt><dd>${a.k}</dd></dl>`;
    g.appendChild(el);
  });
  [['all', 'Todos'], ['rot', 'Giro continuo'], ['lin', 'Lineal limitado'], ['pos', 'Posicionamiento controlado']].forEach(([k, l], i) => {
    const b = document.createElement('button'); b.className = 'chip' + (i ? '' : ' on'); b.textContent = l; b.dataset.k = k;
    b.onclick = () => {
      fl.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b));
      g.querySelectorAll('.act').forEach(c => c.classList.toggle('hide', k !== 'all' && !c.dataset.t.split(' ').includes(k)));
    };
    fl.appendChild(b);
  });
})();

/* ====================================================================
   3.3 TALLER DE DIAGRAMAS CINEMÁTICOS
   ==================================================================== */
(function workshop() {
  const cv = $('#cv-ws'), { ctx, W, H } = makeCanvas(cv, 600, 400);
  const cd = $('#cv-ws-diagram'), D = makeCanvas(cd, 600, 400);
  const pt = a => ({ x: a[0], y: a[1] });

  const machines = [
    {
      id: 'trit', name: 'Trituradora de latas',
      parts: [
        { num: 1, name: 'Base y columna', ground: true, lp: [100, 345], paths: [{ pts: [[70, 370], [330, 370]], w: 20 }, { pts: [[190, 370], [190, 150], [130, 110]], w: 14 }] },
        { num: 2, name: 'Mango', lp: [300, 74], paths: [{ pts: [[130, 110], [420, 70]], w: 14 }] },
        { num: 3, name: 'Bloque triturador', lp: [140, 232], paths: [{ pts: [[165, 245], [215, 245]], w: 44 }] },
        { num: 4, name: 'Barra de unión', lp: [232, 170], paths: [{ pts: [[220, 98], [190, 245]], w: 10 }] }
      ],
      joints: [
        { id: 'A', p: [130, 110], type: 'perno', links: [1, 2] },
        { id: 'B', p: [220, 98], type: 'perno', links: [2, 4] },
        { id: 'C', p: [190, 245], type: 'perno', links: [4, 3] },
        { id: 'D', p: [190, 305], type: 'corredera', links: [3, 1], dp: [226, 275] }
      ],
      interest: { id: 'X', p: [420, 70], name: 'extremo del mango' },
      diag: {
        links: [{ num: 2, pts: [[130, 110], [420, 70]], color: 'input' }, { num: 4, pts: [[220, 98], [190, 245]], color: 'coupler' }],
        sliders: [{ at: [190, 245], ang: Math.PI / 2, num: 3 }],
        guides: [[[190, 150], [190, 340]]], ground: [[130, 110]]
      },
      why: 'El bloque triturador solo puede moverse en vertical dentro de la guía de la columna: es una unión de corredera. Los otros tres pares de piezas giran uno respecto al otro: pernos.'
    },
    {
      id: 'estab', name: 'Pie estabilizador de camión',
      parts: [
        { num: 1, name: 'Camión', ground: true, lp: [500, 100], paths: [{ pts: [[40, 60], [560, 60]], w: 30 }] },
        { num: 2, name: 'Pierna estabilizadora', lp: [236, 252], paths: [{ pts: [[160, 70], [300, 330]], w: 16 }, { pts: [[268, 336], [332, 336]], w: 12 }] },
        { num: 3, name: 'Cilindro', lp: [385, 122], paths: [{ pts: [[430, 70], [314, 130]], w: 28 }] },
        { num: 4, name: 'Pistón / varilla', lp: [262, 128], paths: [{ pts: [[314, 130], [219, 179]], w: 10 }] }
      ],
      joints: [
        { id: 'A', p: [160, 70], type: 'perno', links: [1, 2] },
        { id: 'B', p: [219, 179], type: 'perno', links: [2, 4] },
        { id: 'C', p: [430, 70], type: 'perno', links: [3, 1] },
        { id: 'D', p: [314, 130], type: 'corredera', links: [3, 4] }
      ],
      interest: { id: 'X', p: [300, 336], name: 'parte inferior del pie' },
      diag: {
        links: [{ num: 2, pts: [[160, 70], [300, 336]], color: 'input' }, { num: 4, pts: [[219, 179], [314, 130]], color: 'coupler' }, { num: 3, pts: [[314, 130], [430, 70]], color: 'output' }],
        sliders: [{ at: [314, 130], ang: Math.atan2(70 - 130, 430 - 314), num: 0 }],
        guides: [], ground: [[160, 70], [430, 70]]
      },
      why: 'El cilindro no es una sola pieza cinemática: el cuerpo y el pistón/varilla son dos eslabones unidos por una corredera (la unión D). Los tres extremos que pivotan son pernos.'
    },
    {
      id: 'prensa', name: 'Prensa cortadora con engrane',
      parts: [
        { num: 1, name: 'Base', ground: true, lp: [330, 342], paths: [{ pts: [[60, 360], [420, 360]], w: 20 }, { pts: [[120, 360], [120, 250]], w: 16 }, { pts: [[230, 360], [230, 290]], w: 14 }, { pts: [[190, 290], [270, 290]], w: 10 }] },
        { num: 2, name: 'Engrane / mango', lp: [310, 124], paths: [{ circle: [229, 238], r: 46 }, { pts: [[229, 238], [340, 70]], w: 12 }] },
        { num: 3, name: 'Palanca cortadora', lp: [385, 246], paths: [{ pts: [[120, 250], [440, 215]], w: 14 }] }
      ],
      joints: [
        { id: 'A', p: [120, 250], type: 'perno', links: [1, 3] },
        { id: 'B', p: [229, 238], type: 'perno', links: [3, 2] },
        { id: 'C', p: [229, 285], type: 'engrane', links: [2, 1] }
      ],
      interest: { id: 'X', p: [340, 70], name: 'extremo del mango' },
      diag: {
        links: [{ num: 3, pts: [[120, 250], [440, 215]], color: 'coupler' }, { num: 2, pts: [[229, 238], [340, 70]], color: 'input' }],
        sliders: [], guides: [], ground: [[120, 250]], gear: { c: [229, 238], r: 46 }, rack: [[190, 290], [270, 290]]
      },
      why: 'El engrane del mango rueda y se desliza sobre los dientes de la base: contacto de línea → unión de <b>orden superior</b> (la única de este mecanismo). Las otras dos son pernos.'
    }
  ];

  const STEPS = ['1 Bancada', '2 Eslabones', '3 Uniones', '4 Punto de interés', '5 Diagrama y movilidad'];
  const TYPES = ['?', 'perno', 'corredera', 'engrane'];
  let M, step, sel, jt, solved;

  function load(i) {
    M = machines[i]; step = 0; sel = null; solved = false;
    jt = {}; M.joints.forEach(j => jt[j.id] = '?');
    $('#ws-machines').querySelectorAll('.chip').forEach((b, k) => b.classList.toggle('on', k === i));
    $('#ws-result').hidden = true; $('#ws-fb').textContent = '';
    render();
  }
  const mk = $('#ws-machines');
  machines.forEach((m, i) => { const b = document.createElement('button'); b.className = 'chip'; b.textContent = m.name; b.onclick = () => load(i); mk.appendChild(b); });

  function distSeg(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.y - a[1]) * dy) / L)) : 0;
    return Math.hypot(p.x - (a[0] + t * dx), p.y - (a[1] + t * dy));
  }
  function partAt(p) {
    let best = null, bd = 1e9;
    M.parts.forEach(pr => pr.paths.forEach(pa => {
      let d;
      if (pa.circle) d = Math.max(0, Math.hypot(p.x - pa.circle[0], p.y - pa.circle[1]) - pa.r);
      else { d = 1e9; for (let i = 0; i < pa.pts.length - 1; i++) d = Math.min(d, distSeg(p, pa.pts[i], pa.pts[i + 1])); d = Math.max(0, d - pa.w / 2); }
      if (d < bd) { bd = d; best = pr; }
    }));
    return bd < 10 ? best : null;
  }
  function jointAt(p) { let b = null, bd = 18; M.joints.forEach(j => { const d = Math.hypot(p.x - j.p[0], p.y - j.p[1]); if (d < bd) { bd = d; b = j; } }); return b; }

  function pathStroke(g, pa, fill, outline) {
    if (pa.circle) {
      g.beginPath(); g.arc(pa.circle[0], pa.circle[1], pa.r, 0, TAU); g.fillStyle = fill; g.fill(); g.lineWidth = 3; g.strokeStyle = outline; g.stroke();
      // dientes
      g.strokeStyle = outline; g.lineWidth = 2;
      for (let i = 0; i < 24; i++) { const a = i * TAU / 24; g.beginPath(); g.moveTo(pa.circle[0] + Math.cos(a) * pa.r, pa.circle[1] + Math.sin(a) * pa.r); g.lineTo(pa.circle[0] + Math.cos(a) * (pa.r + 6), pa.circle[1] + Math.sin(a) * (pa.r + 6)); g.stroke(); }
      return;
    }
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); pa.pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]));
    g.strokeStyle = outline; g.lineWidth = pa.w + 5; g.stroke();
    g.strokeStyle = fill; g.lineWidth = pa.w; g.stroke();
  }

  function drawMain() {
    const C = colors(); ctx.clearRect(0, 0, W, H);
    M.parts.forEach(pr => {
      const isSel = sel === pr.num;
      const fill = pr.ground ? C.ground : '#b79872';
      pr.paths.forEach(pa => pathStroke(ctx, pa, fill, isSel ? C.accent : C.ink));
    });
    // numeración (desde el paso 2)
    if (step >= 2) M.parts.forEach(pr => tag(ctx, pr.num, pr.lp[0], pr.lp[1], C, pr.ground ? C.ground : C.accent));
    // uniones
    if (step >= 2) M.joints.forEach(j => {
      const t = jt[j.id]; const p = pt(j.p);
      ctx.beginPath(); ctx.arc(p.x, p.y, 13, 0, TAU); ctx.fillStyle = C.surface; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = t === '?' ? C.accent : C.ink; ctx.stroke();
      text(ctx, j.id, p.x, p.y + 0.5, C, { size: 13 });
      if (step === 2) text(ctx, t === '?' ? 'toca' : t, p.x, p.y - 24, C, { size: 12, color: t === '?' ? C.accent : C.ink, weight: 700 });
    });
    if (step >= 3) {
      const q = pt(M.interest.p);
      ctx.beginPath(); ctx.arc(q.x, q.y, 9, 0, TAU); ctx.fillStyle = step > 3 ? C.accent : 'transparent'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.accent; ctx.stroke();
      if (step > 3) text(ctx, M.interest.id, q.x + 18, q.y - 12, C, { color: C.accent, size: 16 });
    }
  }

  function drawDiagram() {
    const g = D.ctx, C = colors(); g.clearRect(0, 0, D.W, D.H);
    const d = M.diag, col = { input: C.input, coupler: C.coupler, output: C.output };
    g.setLineDash([6, 5]); g.strokeStyle = C.muted; g.lineWidth = 2;
    (d.guides || []).forEach(gd => { g.beginPath(); g.moveTo(gd[0][0], gd[0][1]); g.lineTo(gd[1][0], gd[1][1]); g.stroke(); });
    g.setLineDash([]);
    if (d.rack) { g.strokeStyle = C.ground; g.lineWidth = 6; g.beginPath(); g.moveTo(d.rack[0][0], d.rack[0][1]); g.lineTo(d.rack[1][0], d.rack[1][1]); g.stroke(); groundMark(g, { x: (d.rack[0][0] + d.rack[1][0]) / 2, y: d.rack[0][1] - 5 }, C, 40); }
    if (d.gear) { g.beginPath(); g.arc(d.gear.c[0], d.gear.c[1], d.gear.r, 0, TAU); g.strokeStyle = C.input; g.lineWidth = 3; g.setLineDash([3, 4]); g.stroke(); g.setLineDash([]); }
    d.links.forEach(l => {
      for (let i = 0; i < l.pts.length - 1; i++) bar(g, pt(l.pts[i]), pt(l.pts[i + 1]), col[l.color], 8);
      const m = mid(pt(l.pts[0]), pt(l.pts[1])); const dx = l.pts[1][0] - l.pts[0][0], dy = l.pts[1][1] - l.pts[0][1], L = Math.hypot(dx, dy) || 1;
      tag(g, l.num, m.x - dy / L * 22, m.y + dx / L * 22, C, col[l.color]);
    });
    (d.sliders || []).forEach(s => {
      g.save(); g.translate(s.at[0], s.at[1]); g.rotate(s.ang);
      g.fillStyle = C.surface; g.fillRect(-18, -13, 36, 26); g.lineWidth = 2.5; g.strokeStyle = C.ink; g.strokeRect(-18, -13, 36, 26); g.restore();
      if (s.num) tag(g, s.num, s.at[0] - 34, s.at[1] - 4, C, C.output);
    });
    (d.ground || []).forEach(p => groundMark(g, pt(p), C));
    M.joints.forEach(j => {
      const p = pt(j.p); pin(g, p, C, 6, d.ground.some(q => q[0] === j.p[0] && q[1] === j.p[1]));
      const lp = j.dp || [j.p[0] + 16, j.p[1] - 16];
      text(g, j.id, lp[0], lp[1], C, { size: 15, color: C.accent });
    });
    const q = pt(M.interest.p); g.beginPath(); g.arc(q.x, q.y, 6, 0, TAU); g.fillStyle = C.accent; g.fill();
    text(g, M.interest.id, q.x + 16, q.y - 10, C, { size: 15, color: C.accent });
    text(g, 'Diagrama cinemático', 300, 24, C, { size: 15, color: C.muted });
  }

  const hints = [
    'Haz clic sobre la pieza que usarías como bancada (eslabón 1).',
    'Cuenta los eslabones móviles (sin la bancada) e ingresa el número.',
    'Haz clic en cada unión (A, B, C…) para asignar su tipo: perno, corredera o engrane.',
    'Haz clic en el punto de interés indicado.',
    'Listo: compara la máquina con su diagrama cinemático.'
  ];

  function render() {
    $('#ws-steps').innerHTML = STEPS.map((s, i) => `<span class="${i < step ? 'ok' : i === step ? 'on' : ''}">${s}</span>`).join('');
    $('#ws-hint').textContent = hints[step] || '';
    const b = $('#ws-body'); b.innerHTML = '';
    const fb = $('#ws-fb');
    if (step === 0) b.innerHTML = '<p><b>Paso 1.</b> ¿Qué parte es la <b>bancada</b>? Es el marco de referencia: normalmente la pieza que está fija al suelo, a la mesa o al vehículo.</p>';
    if (step === 1) {
      b.innerHTML = `<p><b>Paso 2.</b> Además de la bancada, ¿cuántas partes <b>móviles</b> (eslabones) ves?</p>
        <div class="row"><input type="number" id="ws-n" min="0" max="12" inputmode="numeric" aria-label="Número de eslabones móviles"><button class="btn" id="ws-n-ok">Comprobar</button></div>`;
      $('#ws-n-ok').onclick = checkN; $('#ws-n').onkeydown = e => { if (e.key === 'Enter') checkN(); };
    }
    if (step === 2) {
      b.innerHTML = `<p><b>Paso 3.</b> Hay <b>${M.joints.length}</b> uniones marcadas con letras. Toca cada una para asignarle un tipo (perno → corredera → engrane).</p>
        <div class="row"><button class="btn" id="ws-j-ok">Comprobar uniones</button></div>`;
      $('#ws-j-ok').onclick = checkJ;
    }
    if (step === 3) b.innerHTML = `<p><b>Paso 4.</b> Marca el <b>punto de interés ${M.interest.id}</b>: ${M.interest.name}.</p>`;
    if (step === 4) {
      const n = M.parts.length, jp = M.joints.filter(j => j.type !== 'engrane').length, jh = M.joints.length - jp, Mo = 3 * (n - 1) - 2 * jp - jh;
      b.innerHTML = `<p><b>Paso 5.</b> ${M.why}</p><div class="row"><button class="btn ghost" id="ws-reset">Reiniciar esta máquina</button></div>`;
      $('#ws-reset').onclick = () => load(machines.indexOf(M));
      $('#ws-result').hidden = false;
      $('#ws-calc').innerHTML = `<h3>Movilidad</h3>
        <p>n = <b>${n}</b> eslabones · j<sub>p</sub> = <b>${jp}</b> uniones principales · j<sub>h</sub> = <b>${jh}</b> de orden superior</p>
        <div class="mob-eq">M = 3(${n} − 1) − 2(${jp}) − ${jh} = <b>${Mo}</b></div>
        <p>${Mo === 1 ? 'Una sola entrada independiente (mover el mango o el pistón) posiciona todos los eslabones: el modelo es coherente con lo que hace la máquina.' : 'Revisa el modelo.'}</p>`;
      drawDiagram();
    }
    drawMain();
  }
  function ok(msg) { const fb = $('#ws-fb'); fb.style.color = 'var(--ok)'; fb.textContent = msg; }
  function bad(msg) { const fb = $('#ws-fb'); fb.style.color = 'var(--bad)'; fb.textContent = msg; }

  function checkN() {
    const v = +$('#ws-n').value, want = M.parts.length - 1;
    if (v === want) { ok(`Correcto: ${want} eslabones móviles. Quedan numerados 2 a ${M.parts.length}.`); step = 2; render(); }
    else if (v === M.parts.length) bad('Esa cifra incluye la bancada. Cuéntala aparte: es el eslabón 1.');
    else bad('Todavía no. Recorre la máquina pieza por pieza; si una parte se mueve respecto a la bancada, es un eslabón.' + (M.id === 'estab' ? ' Pista: el cilindro y el pistón son dos piezas distintas.' : ''));
  }
  function checkJ() {
    const wrong = M.joints.filter(j => jt[j.id] !== j.type);
    if (!wrong.length) { ok('¡Todas las uniones están bien clasificadas!'); step = 3; render(); return; }
    const tips = { perno: 'solo giran una respecto a la otra', corredera: 'una desliza en línea recta sobre la otra', engrane: 'los dientes ruedan y se deslizan (orden superior)' };
    bad('Revisa: ' + wrong.map(j => jt[j.id] === '?' ? `${j.id} (sin asignar)` : `${j.id} (no es ${jt[j.id]})`).join(', ') + '. Pista: en el perno ' + tips.perno + '; en la corredera ' + tips.corredera + '.');
  }

  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect(), p = { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
    if (step === 0) {
      const pr = partAt(p); if (!pr) return;
      sel = pr.num;
      if (pr.ground) { ok(`Correcto: «${pr.name}» es la bancada. Es la parte fija; el movimiento de todo lo demás se mide respecto a ella. Se numera 1.`); step = 1; render(); }
      else { bad(`«${pr.name}» se mueve respecto al resto, así que no sirve como marco fijo en este caso. (En un mecanismo sin pieza fija la elección es libre; aquí hay una pieza apoyada en el suelo o el vehículo.)`); drawMain(); }
    } else if (step === 2) {
      const j = jointAt(p); if (!j) return;
      jt[j.id] = TYPES[(TYPES.indexOf(jt[j.id]) + 1) % TYPES.length]; $('#ws-fb').textContent = ''; drawMain();
    } else if (step === 3) {
      if (Math.hypot(p.x - M.interest.p[0], p.y - M.interest.p[1]) < 24) { ok('Punto de interés marcado.'); step = 4; render(); }
      else bad(`Ese no es el punto ${M.interest.id}: busca el ${M.interest.name}.`);
    }
  });
  addStatic(() => { if (M) { drawMain(); if (step === 4) drawDiagram(); } });
  load(0);
})();
