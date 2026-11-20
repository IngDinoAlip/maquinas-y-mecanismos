/* Mecanismos Vivos — capa visual: ilustraciones animadas por lección, mini-videos y texto plegable */
'use strict';
(function visual() {
  const TAU2 = Math.PI * 2, D2R = Math.PI / 180;
  const NS = 'http://www.w3.org/2000/svg';
  const C = { g: 'var(--c-ground)', i: 'var(--c-input)', c: 'var(--c-coupler)', o: 'var(--c-output)', k: 'var(--ink)', m: 'var(--muted)', a: 'var(--accent)', s: 'var(--surface)', s2: 'var(--surface2)', l: 'var(--line)' };
  const f1 = x => x.toFixed(1);
  const cl = (x, a, b) => Math.max(a, Math.min(b, x));

  /* ---------- utilidades SVG ---------- */
  const line = (k, col, w) => `<line data-k="${k}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  const dot = (k, r, fill) => `<circle data-k="${k}" r="${r}" fill="${fill || C.s}" stroke="${C.k}" stroke-width="2.5"/>`;
  const txt = (k, x, y, size, col, anchor, weight) => `<text data-k="${k}" x="${x}" y="${y}" font-size="${size || 13}" fill="${col || C.k}" text-anchor="${anchor || 'start'}" font-weight="${weight || 600}" font-family="system-ui,Segoe UI,sans-serif"></text>`;
  const T = (x, y, s, size, col, anchor, weight) => `<text x="${x}" y="${y}" font-size="${size || 13}" fill="${col || C.k}" text-anchor="${anchor || 'start'}" font-weight="${weight || 600}" font-family="system-ui,Segoe UI,sans-serif">${s}</text>`;
  const hatch = (x, y, w) => { let s = `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${C.k}" stroke-width="3"/>`; for (let p = x + 4; p < x + w; p += 9) s += `<line x1="${p}" y1="${y}" x2="${p - 7}" y2="${y + 9}" stroke="${C.m}" stroke-width="1.6"/>`; return s; };
  const wrap = (inner, label) => `<svg viewBox="0 0 400 240" role="img" aria-label="${label || 'Animación'}" stroke-linejoin="round">${inner}</svg>`;

  function gearPath(n, ro, ri) {
    const pts = [], step = TAU2 / n;
    for (let i = 0; i < n; i++) {
      const a = i * step;
      [[-0.30, ri], [-0.16, ro], [0.16, ro], [0.30, ri]].forEach(([d, r]) => pts.push(f1(Math.cos(a + d * step * 1.6) * r) + ',' + f1(Math.sin(a + d * step * 1.6) * r)));
    }
    return 'M' + pts.join('L') + 'Z';
  }

  function R(root) { // acceso con caché a elementos con data-k
    const cache = {};
    return k => cache[k] || (cache[k] = root.querySelector(`[data-k="${k}"]`));
  }
  const setL = (e, a, b) => { e.setAttribute('x1', f1(a[0])); e.setAttribute('y1', f1(a[1])); e.setAttribute('x2', f1(b[0])); e.setAttribute('y2', f1(b[1])); };
  const setC = (e, p) => { e.setAttribute('cx', f1(p[0])); e.setAttribute('cy', f1(p[1])); };
  const setT = (e, s) => { if (e.textContent !== s) e.textContent = s; };
  const rot = (e, deg, cx, cy) => e.setAttribute('transform', `rotate(${f1(deg)} ${f1(cx)} ${f1(cy)})`);

  /* ---------- cuatro barras (manivela-balancín) ---------- */
  const FB = { O2: [130, 190], O4: [270, 190], a: 36, b: 120, c: 96 };
  function fbSolve(th) {
    const B = [FB.O2[0] + FB.a * Math.cos(th), FB.O2[1] - FB.a * Math.sin(th)];
    const dx = FB.O4[0] - B[0], dy = FB.O4[1] - B[1], d = Math.hypot(dx, dy);
    const aa = (FB.b * FB.b - FB.c * FB.c + d * d) / (2 * d), h = Math.sqrt(Math.max(0, FB.b * FB.b - aa * aa));
    const M = [B[0] + aa * dx / d, B[1] + aa * dy / d];
    const c1 = [M[0] + h * dy / d, M[1] - h * dx / d], c2 = [M[0] - h * dy / d, M[1] + h * dx / d];
    const Cc = c1[1] < c2[1] ? c1 : c2;
    const ux = (Cc[0] - B[0]) / FB.b, uy = (Cc[1] - B[1]) / FB.b;
    const P = [B[0] + 0.5 * (Cc[0] - B[0]) - 26 * uy, B[1] + 0.5 * (Cc[1] - B[1]) + 26 * ux];
    return { B, C: Cc, P };
  }
  const fbTrace = (() => { let p = ''; for (let i = 0; i <= 90; i++) { const q = fbSolve(i / 90 * TAU2).P; p += (i ? 'L' : 'M') + f1(q[0]) + ',' + f1(q[1]); } return p + 'Z'; })();

  const scenes = {};
  scenes.fourbar = {
    svg: () => wrap(`${hatch(100, 199, 200)}
      <path data-k="trace" d="${fbTrace}" fill="none" stroke="${C.a}" stroke-width="2" stroke-dasharray="4 5" opacity=".75"/>
      <g data-k="gCoupler"><line data-k="coupler" stroke="${C.c}" stroke-width="10" stroke-linecap="round"/><circle data-k="P" r="5" fill="${C.a}"/></g>
      <g data-k="gCrank">${line('crank', C.i, 10)}</g><g data-k="gRocker">${line('rocker', C.o, 10)}</g>
      <circle data-k="pO2" r="6" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/><circle data-k="pO4" r="6" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/>
      <g data-k="gB">${dot('pB', 5)}</g><g data-k="gC">${dot('pC', 5)}</g>
      <path data-k="arc" fill="none" stroke="${C.i}" stroke-width="2" opacity="0"/>${txt('lab', 14, 24, 13, C.m)}
      ${T(130, 226, 'bancada', 12, C.m, 'middle')}`, 'Mecanismo de cuatro barras en movimiento'),
    upd(r, t, o = {}) {
      const th = o.theta !== undefined ? o.theta : (o.startAt !== undefined ? (t < o.startAt ? 0.9 : 0.9 + 1.3 * (t - o.startAt)) : 1.1 * t + 0.9);
      const s = fbSolve(th), v = (k, a) => { const g = r(k); if (g) g.setAttribute('opacity', a); };
      setL(r('crank'), FB.O2, s.B); setL(r('coupler'), s.B, s.C); setL(r('rocker'), FB.O4, s.C);
      setC(r('P'), s.P); setC(r('pO2'), FB.O2); setC(r('pO4'), FB.O4); setC(r('pB'), s.B); setC(r('pC'), s.C);
      if (o.reveal) { v('trace', t >= o.startAt ? 0.75 : 0); v('gCrank', t >= o.reveal[0] ? 1 : 0); v('gCoupler', t >= o.reveal[1] ? 1 : 0); v('gRocker', t >= o.reveal[2] ? 1 : 0); v('gB', t >= o.reveal[1] ? 1 : 0); v('gC', t >= o.reveal[2] ? 1 : 0); }
      const lab = r('lab');
      if (o.label === 'theta') { const deg = ((th / D2R) % 360 + 360) % 360; setT(lab, 'θ₂ = ' + Math.round(deg) + '°'); const arc = r('arc'); arc.setAttribute('opacity', 1); const e = [FB.O2[0] + 22 * Math.cos(th), FB.O2[1] - 22 * Math.sin(th)]; arc.setAttribute('d', `M${FB.O2[0] + 22},${FB.O2[1]} A22,22 0 ${th % TAU2 > Math.PI ? 1 : 0} 0 ${f1(e[0])},${f1(e[1])}`); }
      else if (o.label === 'grashof') setT(lab, 'Grashof: s + l = 176 < p + q = 216  ✔ manivela gira completa');
      else setT(lab, '');
    }
  };

  /* ---------- inversión cinemática ---------- */
  scenes.inversion = {
    svg: () => wrap(`<g data-k="gnd"></g>${line('l0', C.i, 9)}${line('l1', C.c, 9)}${line('l2', C.o, 9)}${line('l3', C.g, 9)}
      ${dot('p0', 5)}${dot('p1', 5)}${dot('p2', 5)}${dot('p3', 5)}${txt('lab', 200, 26, 15, C.k, 'middle', 700)}${txt('sub', 200, 46, 12.5, C.m, 'middle', 600)}`, 'Inversión cinemática del cuatro barras'),
    upd(r, t, o = {}) {
      const k = o.k !== undefined ? o.k : Math.floor(t / 4) % 4, th = 1.1 * t + 0.9, s = fbSolve(th);
      const P = [FB.O2, s.B, s.C, FB.O4], a = P[k], b = P[(k + 1) % 4], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const GY = 180, ox = 200 - len / 2;
      let q = P.map(p => { const x = p[0] - a[0], y = p[1] - a[1]; const c = Math.cos(-ang), sn = Math.sin(-ang); return [ox + x * c - y * sn, GY + x * sn + y * c]; });
      const others = q.filter((_, i) => i !== k && i !== (k + 1) % 4); if ((others[0][1] + others[1][1]) / 2 > GY) q = q.map(p => [p[0], 2 * GY - p[1]]);
      const links = ['l0', 'l1', 'l2', 'l3'], cols = [C.i, C.c, C.o, C.g]; // l0: O2-B, l1: B-C, l2: C-O4, l3: O4-O2
      const idx = [[0, 1], [1, 2], [2, 3], [3, 0]];
      links.forEach((n, i) => { setL(r(n), q[idx[i][0]], q[idx[i][1]]); });
      q.forEach((p, i) => setC(r('p' + i), p));
      const gl = r('gnd'); gl.innerHTML = hatch(Math.round(ox - 8), GY + 6, Math.round(len + 16));
      const names = ['Bancada = manivela (eslabón más corto)', 'Bancada = acoplador', 'Bancada = balancín', 'Bancada original'];
      const kinds = ['→ doble manivela (ambas giran completas)', '→ manivela-balancín', '→ doble balancín (ninguno gira completo)', '→ manivela-balancín'];
      const map = [3, 0, 1, 2]; // k índice (3 = ground original)
      const kk = k === 3 ? 3 : k; setT(r('lab'), names[kk] || ''); setT(r('sub'), kinds[kk] || '');
    }
  };

  /* ---------- manivela-corredera con gráfica ---------- */
  const SL = { O: [90, 100], r: 38, l: 128 };
  const slX = th => SL.O[0] + SL.r * Math.cos(th) + Math.sqrt(SL.l * SL.l - (SL.r * Math.sin(th)) ** 2);
  const slMin = SL.O[0] + SL.l - SL.r, slMax = SL.O[0] + SL.l + SL.r;
  const slGraph = (() => { let p = ''; for (let i = 0; i <= 90; i++) { const th = i / 90 * TAU2, x = 40 + th / TAU2 * 330, y = 222 - (slX(th) - slMin) / (slMax - slMin) * 36; p += (i ? 'L' : 'M') + f1(x) + ',' + f1(y); } return p; })();
  scenes.slider = {
    svg: () => wrap(`<rect x="${slMin - 28}" y="78" width="${slMax - slMin + 56}" height="8" fill="${C.g}"/><rect x="${slMin - 28}" y="114" width="${slMax - slMin + 56}" height="8" fill="${C.g}"/>
      <line x1="${slMin}" y1="62" x2="${slMin}" y2="140" stroke="${C.a}" stroke-dasharray="3 4"/><line x1="${slMax}" y1="62" x2="${slMax}" y2="140" stroke="${C.a}" stroke-dasharray="3 4"/>
      ${T((slMin + slMax) / 2, 150, 'carrera = 2r', 12, C.a, 'middle')}
      <circle cx="${SL.O[0]}" cy="${SL.O[1]}" r="${SL.r}" fill="none" stroke="${C.l}" stroke-width="2" stroke-dasharray="3 4"/>
      <rect data-k="blk" y="${SL.O[1] - 15}" width="46" height="30" rx="4" fill="${C.o}" stroke="${C.k}" stroke-width="2.5"/>${line('rod', C.c, 9)}${line('cr', C.i, 9)}
      ${dot('pO', 6)}${dot('pA', 5)}${dot('pB', 5)}
      <line x1="40" y1="222" x2="370" y2="222" stroke="${C.l}"/><line x1="40" y1="184" x2="40" y2="222" stroke="${C.l}"/>
      ${T(40, 178, 'posición del pistón', 11, C.m)}${T(370, 236, 'ángulo de la manivela →', 11, C.m, 'end')}
      <path d="${slGraph}" fill="none" stroke="${C.o}" stroke-width="2.5"/><circle data-k="gd" r="5" fill="${C.a}"/>`, 'Mecanismo manivela-corredera'),
    upd(r, t, o = {}) {
      const th = o.theta !== undefined ? o.theta : 1.1 * t + 0.3, A = [SL.O[0] + SL.r * Math.cos(th), SL.O[1] - SL.r * Math.sin(th)], Bx = slX(th), B = [Bx, SL.O[1]];
      setL(r('cr'), SL.O, A); setL(r('rod'), A, B); setC(r('pO'), SL.O); setC(r('pA'), A); setC(r('pB'), B);
      r('blk').setAttribute('x', f1(Bx - 8));
      const ph = ((th % TAU2) + TAU2) % TAU2; setC(r('gd'), [40 + ph / TAU2 * 330, 222 - (Bx - slMin) / (slMax - slMin) * 36]);
    }
  };

  /* ---------- engranes ---------- */
  scenes.gears = {
    svg: () => wrap(`<g data-k="g1" transform="translate(110 120)"><path d="${gearPath(10, 44, 34)}" fill="${C.i}" fill-opacity=".85" stroke="${C.k}" stroke-width="2.5"/><circle r="10" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/><circle cx="24" r="4" fill="${C.s}"/></g>
      <g data-k="g2" transform="translate(234 120)"><path d="${gearPath(20, 84, 74)}" fill="${C.o}" fill-opacity=".85" stroke="${C.k}" stroke-width="2.5"/><circle r="10" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/><circle cx="60" r="4" fill="${C.s}"/></g>
      ${T(110, 190, 'z = 10', 13, C.i, 'middle', 700)}${T(234, 232, 'z = 20', 13, C.o, 'middle', 700)}${txt('rpm1', 14, 24, 13, C.i, 'start', 700)}${txt('rpm2', 386, 24, 13, C.o, 'end', 700)}${T(200, 24, '', 12)}`, 'Dos engranes en contacto'),
    upd(r, t, o = {}) {
      const a = (o.w !== undefined ? o.w : 1.6) * t * 57.2958;
      r('g1').setAttribute('transform', `translate(110 120) rotate(${f1(a)})`);
      r('g2').setAttribute('transform', `translate(234 120) rotate(${f1(180 + 9 - a * 0.5)})`);
      setT(r('rpm1'), 'entrada: 120 rpm'); setT(r('rpm2'), 'salida: 60 rpm');
    }
  };

  /* ---------- cadena y piñones ---------- */
  scenes.chain = {
    svg: () => {
      const R1 = 46, R2 = 26, c1 = [120, 125], c2 = [290, 125], d = 170, b = Math.acos((R1 - R2) / d);
      const tp = (c, rr, s) => [c[0] + rr * Math.cos(s * b), c[1] + rr * Math.sin(s * b)];
      const a1 = tp(c1, R1, -1), a2 = tp(c2, R2, -1), b2 = tp(c2, R2, 1), b1 = tp(c1, R1, 1);
      const path = `M${f1(a1[0])},${f1(a1[1])}L${f1(a2[0])},${f1(a2[1])}A${R2},${R2} 0 0 1 ${f1(b2[0])},${f1(b2[1])}L${f1(b1[0])},${f1(b1[1])}A${R1},${R1} 0 1 1 ${f1(a1[0])},${f1(a1[1])}Z`;
      return wrap(`<path data-k="chain" d="${path}" fill="none" stroke="${C.k}" stroke-width="7" stroke-dasharray="7 5" opacity=".85"/>
      <g data-k="s1" transform="translate(120 125)"><circle r="${R1 - 6}" fill="${C.i}" fill-opacity=".8" stroke="${C.k}" stroke-width="2.5"/><circle r="8" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/><line x1="8" y1="0" x2="${R1 - 10}" y2="0" stroke="${C.s}" stroke-width="3"/></g>
      <g data-k="s2" transform="translate(290 125)"><circle r="${R2 - 4}" fill="${C.o}" fill-opacity=".8" stroke="${C.k}" stroke-width="2.5"/><circle r="6" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/><line x1="6" y1="0" x2="${R2 - 8}" y2="0" stroke="${C.s}" stroke-width="3"/></g>
      ${T(120, 200, 'piñón grande (entrada)', 12, C.i, 'middle', 700)}${T(290, 200, 'piñón pequeño (salida)', 12, C.o, 'middle', 700)}${T(205, 228, 'el piñón pequeño gira más rápido', 12, C.m, 'middle')}`, 'Transmisión por cadena');
    },
    upd(r, t) {
      const w = 40 * t, a = w; r('s1').setAttribute('transform', `translate(120 125) rotate(${f1(a)})`); r('s2').setAttribute('transform', `translate(290 125) rotate(${f1(a * 46 / 26)})`);
      r('chain').setAttribute('stroke-dashoffset', f1(-(a * 46 * D2R) % 12));
    }
  };

  /* ---------- tijera (plataforma elevadora) ---------- */
  scenes.scissor = {
    svg: () => wrap(`${hatch(60, 211, 280)}<g data-k="bars"></g><rect data-k="plat" x="90" width="220" height="9" rx="3" fill="${C.o}" stroke="${C.k}" stroke-width="2.5"/><rect data-k="load" width="40" height="30" rx="3" fill="${C.a}" stroke="${C.k}" stroke-width="2.5"/>${T(200, 232, '', 1)}${txt('lab', 200, 234, 13, C.m, 'middle')}`, 'Plataforma elevadora de tijera'),
    upd(r, t) {
      const th = (34 + 11 * Math.sin(0.9 * t)) * D2R, L = 68, w = L / 2 * Math.cos(th), h = L * Math.sin(th), cx = 200, y0 = 204;
      let s = ''; for (let i = 0; i < 3; i++) { const ya = y0 - i * h, yb = y0 - (i + 1) * h; s += `<line x1="${f1(cx - w)}" y1="${f1(ya)}" x2="${f1(cx + w)}" y2="${f1(yb)}" stroke="${C.i}" stroke-width="8" stroke-linecap="round"/><line x1="${f1(cx + w)}" y1="${f1(ya)}" x2="${f1(cx - w)}" y2="${f1(yb)}" stroke="${C.c}" stroke-width="8" stroke-linecap="round"/><circle cx="${cx}" cy="${f1((ya + yb) / 2)}" r="4" fill="${C.s}" stroke="${C.k}" stroke-width="2"/>`; }
      r('bars').innerHTML = s; const yt = y0 - 3 * h;
      r('plat').setAttribute('y', f1(yt - 9)); r('load').setAttribute('x', 180); r('load').setAttribute('y', f1(yt - 39));
      setT(r('lab'), 'altura ≈ ' + Math.round(3 * h * 0.04 * 100) / 100 + ' m  ·  1 grado de libertad');
    }
  };

  /* ---------- brazo de 3 articulaciones ---------- */
  scenes.arm = {
    svg: () => wrap(`${hatch(100, 214, 100)}<polyline data-k="trail" fill="none" stroke="${C.a}" stroke-width="2" opacity=".7"/>${line('a1', C.i, 9)}${line('a2', C.c, 9)}${line('a3', C.o, 9)}${dot('j0', 6)}${dot('j1', 5)}${dot('j2', 5)}<circle data-k="tip" r="6" fill="${C.a}" stroke="${C.k}" stroke-width="2"/>
      ${T(24, 24, 'q₁, q₂, q₃: tres motores', 13, C.m)}${T(24, 42, 'M = 3(4 − 1) − 2·3 = 3', 13, C.a, 'start', 700)}`, 'Brazo robótico plano de tres articulaciones'),
    trail: [],
    upd(r, t) {
      const base = [150, 212], q1 = (65 + 28 * Math.sin(0.8 * t)) * D2R, q2 = q1 + (-35 + 55 * Math.sin(1.1 * t + 1)) * D2R, q3 = q2 + (-20 + 45 * Math.sin(1.7 * t + 2)) * D2R;
      const p1 = [base[0] + 70 * Math.cos(q1), base[1] - 70 * Math.sin(q1)], p2 = [p1[0] + 62 * Math.cos(q2), p1[1] - 62 * Math.sin(q2)], p3 = [p2[0] + 46 * Math.cos(q3), p2[1] - 46 * Math.sin(q3)];
      setL(r('a1'), base, p1); setL(r('a2'), p1, p2); setL(r('a3'), p2, p3); setC(r('j0'), base); setC(r('j1'), p1); setC(r('j2'), p2); setC(r('tip'), p3);
      const tr = this.trail; tr.push(f1(p3[0]) + ',' + f1(p3[1])); if (tr.length > 70) tr.shift(); r('trail').setAttribute('points', tr.join(' '));
    }
  };

  /* ---------- uniones: perno y corredera ---------- */
  scenes.joints = {
    svg: () => wrap(`<line x1="35" y1="90" x2="165" y2="90" stroke="none"/>${hatch(40, 120, 70)}<g data-k="pl"><rect x="-5" y="-6" width="105" height="12" rx="6" fill="${C.i}" stroke="${C.k}" stroke-width="2.5"/></g>${dot('pin', 7, C.s)}
      ${T(75, 160, 'Perno (revoluta)', 13, C.i, 'middle', 700)}${T(75, 177, 'gira · 1 GDL', 12, C.m, 'middle')}
      <rect x="215" y="102" width="160" height="8" fill="${C.g}"/><rect data-k="sl" y="80" width="48" height="22" rx="4" fill="${C.o}" stroke="${C.k}" stroke-width="2.5"/><rect x="215" y="110" width="160" height="4" fill="${C.l}"/>
      ${T(295, 160, 'Corredera (prismática)', 13, C.o, 'middle', 700)}${T(295, 177, 'desliza · 1 GDL', 12, C.m, 'middle')}
      ${T(200, 222, 'cada unión permite un movimiento y bloquea el resto', 12, C.m, 'middle')}`, 'Unión de perno y de corredera'),
    upd(r, t) {
      r('pl').setAttribute('transform', `translate(75 112) rotate(${f1(-(35 + 45 * Math.sin(1.2 * t)))})`); setC(r('pin'), [75, 112]);
      r('sl').setAttribute('x', f1(222 + 100 * (0.5 + 0.5 * Math.sin(1.2 * t))));
    }
  };

  /* ---------- levas ---------- */
  scenes.cam = {
    svg: () => { let g = ''; for (let i = 0; i <= 60; i++) { const th = i / 60 * TAU2; g += (i ? 'L' : 'M') + f1(250 + th / TAU2 * 130) + ',' + f1(205 - 18 - 18 * Math.sin(th)); }
      return wrap(`<g data-k="cam"><circle r="40" fill="${C.i}" fill-opacity=".8" stroke="${C.k}" stroke-width="2.5"/><circle cx="14" r="4" fill="${C.s}"/></g>${dot('pv', 6)}
      <rect data-k="plate" x="86" width="88" height="7" rx="2" fill="${C.o}" stroke="${C.k}" stroke-width="2"/><line data-k="rod" x1="130" x2="130" stroke="${C.o}" stroke-width="8" stroke-linecap="round"/><rect x="104" y="30" width="52" height="14" rx="3" fill="${C.g}"/>
      <path d="${g}" fill="none" stroke="${C.o}" stroke-width="2.5"/><line x1="250" y1="205" x2="380" y2="205" stroke="${C.l}"/><circle data-k="gd" r="5" fill="${C.a}"/>
      ${T(250, 118, 'desplazamiento del seguidor', 11, C.m)}${T(380, 222, 'ángulo de la leva →', 11, C.m, 'end')}${T(130, 232, 'leva excéntrica + seguidor plano', 11, C.m, 'middle')}`, 'Leva y seguidor');
    },
    upd(r, t) {
      const th = 1.2 * t, px = 130, py = 160, e = 14, cx = px + e * Math.cos(th), cy = py - e * Math.sin(th), top = py - 40 - e * Math.sin(th);
      r('cam').setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) rotate(${f1(-th / D2R)})`); setC(r('pv'), [px, py]); r('pv').setAttribute('r', 4);
      r('plate').setAttribute('y', f1(top - 7)); r('rod').setAttribute('y1', f1(top - 7)); r('rod').setAttribute('y2', 44);
      const ph = ((th % TAU2) + TAU2) % TAU2; setC(r('gd'), [250 + ph / TAU2 * 130, 205 - 18 - 18 * Math.sin(ph)]);
    }
  };

  /* ---------- cilindro hidráulico ---------- */
  scenes.cylinder = {
    svg: () => wrap(`${hatch(50, 222, 300)}${line('boom', C.i, 12)}${line('barrel', C.g, 14)}${line('rod', C.c, 7)}${dot('P', 7)}${dot('A', 6)}${dot('Q', 5)}<rect data-k="load" width="40" height="28" rx="3" fill="${C.a}" stroke="${C.k}" stroke-width="2.5"/>${txt('lab', 14, 24, 13, C.m)}`, 'Pluma accionada por cilindro hidráulico'),
    upd(r, t) {
      const al = (38 + 24 * Math.sin(0.8 * t)) * D2R, P = [100, 186], A = [200, 214], L = 150, Bt = [P[0] + L * Math.cos(al), P[1] - L * Math.sin(al)], Q = [P[0] + 0.6 * L * Math.cos(al), P[1] - 0.6 * L * Math.sin(al)];
      const dx = Q[0] - A[0], dy = Q[1] - A[1], d = Math.hypot(dx, dy), mid = [A[0] + dx / d * 58, A[1] + dy / d * 58];
      setL(r('boom'), P, Bt); setL(r('barrel'), A, mid); setL(r('rod'), mid, Q); setC(r('P'), P); setC(r('A'), A); setC(r('Q'), Q);
      r('load').setAttribute('x', f1(Bt[0] - 6)); r('load').setAttribute('y', f1(Bt[1] - 30));
      setT(r('lab'), 'el cilindro se alarga ' + Math.round(d - 64) + ' px  →  la pluma sube');
    }
  };

  /* ---------- magnitudes: posición, velocidad, aceleración ---------- */
  scenes.motion = {
    svg: () => { let ticks = ''; for (let i = -5; i <= 5; i++) ticks += `<line x1="${200 + i * 26}" y1="150" x2="${200 + i * 26}" y2="${i % 5 === 0 ? 162 : 158}" stroke="${C.m}" stroke-width="1.5"/>` + (i % 5 === 0 ? T(200 + i * 26, 178, i + ' m', 11, C.m, 'middle') : '');
      return wrap(`<line x1="60" y1="150" x2="340" y2="150" stroke="${C.k}" stroke-width="3"/>${ticks}<circle data-k="ball" cy="136" r="14" fill="${C.i}" stroke="${C.k}" stroke-width="2.5"/>
      <line data-k="v" y1="136" y2="136" stroke="${C.o}" stroke-width="4" marker-end="url(#ah)"/><line data-k="a" y1="108" y2="108" stroke="${C.a}" stroke-width="4"/>
      <defs><marker id="ah" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L8,4L0,8Z" fill="${C.o}"/></marker></defs>
      ${txt('tx', 20, 30, 14, C.i, 'start', 700)}${txt('tv', 20, 52, 14, C.o, 'start', 700)}${txt('ta', 20, 74, 14, C.a, 'start', 700)}${T(200, 220, 'v = 0 en los extremos · a máxima en los extremos', 12, C.m, 'middle')}`, 'Posición, velocidad y aceleración de un cuerpo');
    },
    upd(r, t) {
      const w = 0.9, x = 5 * Math.sin(w * t), v = 5 * w * Math.cos(w * t), a = -5 * w * w * Math.sin(w * t), px = 200 + x * 26;
      r('ball').setAttribute('cx', f1(px)); const lv = r('v'); lv.setAttribute('x1', f1(px)); lv.setAttribute('x2', f1(px + v * 10)); const la = r('a'); la.setAttribute('x1', f1(px)); la.setAttribute('x2', f1(px + a * 10));
      setT(r('tx'), 'posición x = ' + x.toFixed(1).replace('.', ',') + ' m'); setT(r('tv'), 'velocidad v = ' + v.toFixed(1).replace('.', ',') + ' m/s (verde)'); setT(r('ta'), 'aceleración a = ' + a.toFixed(1).replace('.', ',') + ' m/s² (naranja)');
    }
  };

  /* ---------- cuerpo rígido: traslación, rotación, plano general ---------- */
  scenes.rigid = {
    svg: () => { const panel = (i, nm) => `<rect x="${12 + i * 128}" y="40" width="120" height="150" rx="10" fill="none" stroke="${C.l}"/>${T(72 + i * 128, 212, nm, 13, C.k, 'middle', 700)}<g data-k="b${i}"><rect x="-30" y="-6" width="60" height="12" rx="3" fill="${[C.i, C.o, C.c][i]}" stroke="${C.k}" stroke-width="2.5"/><circle cx="-30" r="4" fill="${C.s}" stroke="${C.k}" stroke-width="2"/><circle cx="30" r="4" fill="${C.s}" stroke="${C.k}" stroke-width="2"/></g>`;
      return wrap(`${panel(0, 'Traslación')}${panel(1, 'Rotación')}${panel(2, 'Plano general')}<circle cx="220" cy="115" r="4" fill="${C.k}"/>${T(200, 24, 'Todo cuerpo rígido plano se mueve de una de estas tres formas', 12.5, C.m, 'middle')}`, 'Tipos de movimiento del cuerpo rígido');
    },
    upd(r, t) {
      const s = Math.sin(1.4 * t);
      r('b0').setAttribute('transform', `translate(${f1(72 + 24 * s)} ${f1(115 - 22 * Math.sin(1.4 * t * 2))})`);
      r('b1').setAttribute('transform', `translate(${f1(200 + 20)} 115) rotate(${f1(70 * s)}) translate(-30 0)`);
      r('b2').setAttribute('transform', `translate(${f1(328 + 26 * s)} ${f1(110 + 12 * Math.sin(2.8 * t))}) rotate(${f1(40 * Math.cos(1.4 * t))})`);
    }
  };

  /* ---------- símbolos: dibujo real vs diagrama ---------- */
  scenes.symbols = {
    svg: () => wrap(`${T(100, 24, 'Dibujo real', 13, C.m, 'middle', 700)}${T(300, 24, 'Diagrama cinemático', 13, C.a, 'middle', 700)}<line x1="200" y1="34" x2="200" y2="206" stroke="${C.l}" stroke-dasharray="3 5"/>${T(200, 130, '→', 22, C.a, 'middle', 700)}
      <g data-k="r1"><rect x="-14" y="-14" width="120" height="28" rx="14" fill="${C.g}" fill-opacity=".45" stroke="${C.k}" stroke-width="2.5"/><circle r="9" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/><circle cx="92" r="9" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/></g>
      <g data-k="r2"><line x1="0" y1="0" x2="92" y2="0" stroke="${C.i}" stroke-width="5" stroke-linecap="round"/><circle r="6" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/><circle cx="92" r="6" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/></g>
      ${hatch(236, 106, 40)}${hatch(36, 106, 40)}
      <rect x="40" y="168" width="140" height="10" fill="${C.g}" fill-opacity=".5"/><rect data-k="s1" y="146" width="56" height="22" rx="5" fill="${C.o}" fill-opacity=".7" stroke="${C.k}" stroke-width="2.5"/>
      <line x1="230" y1="173" x2="370" y2="173" stroke="${C.k}" stroke-width="3"/><rect data-k="s2" y="161" width="30" height="24" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/>${T(110, 206, 'solo importa cómo se mueve', 12, C.m, 'middle')}${T(300, 206, 'barras, pernos y correderas', 12, C.m, 'middle')}`, 'Del dibujo real al diagrama cinemático'),
    upd(r, t) {
      const a = -(25 + 22 * Math.sin(1.3 * t)); r('r1').setAttribute('transform', `translate(60 112) rotate(${f1(a)})`); r('r2').setAttribute('transform', `translate(260 112) rotate(${f1(a)})`);
      const u = 0.5 + 0.5 * Math.sin(1.3 * t); r('s1').setAttribute('x', f1(44 + 78 * u)); r('s2').setAttribute('x', f1(236 + 100 * u));
    }
  };

  /* ---------- Grübler ---------- */
  scenes.gruebler = {
    svg: () => wrap(`${txt('nm', 200, 38, 17, C.k, 'middle', 700)}<g data-k="icons"></g>${txt('fm', 200, 150, 19, C.k, 'middle', 700)}${txt('res', 200, 190, 24, C.a, 'middle', 800)}${txt('mean', 200, 218, 13, C.m, 'middle', 600)}`, 'Ecuación de Grübler: cuenta eslabones y uniones'),
    upd(r, t) {
      const ex = [{ n: 'Cuatro barras', L: 4, J: 4, m: 'una sola entrada basta' }, { n: 'Manivela-corredera', L: 4, J: 4, m: 'una sola entrada basta' }, { n: 'Brazo de 3 articulaciones', L: 4, J: 3, m: 'necesita 3 motores' }, { n: 'Triángulo de barras', L: 3, J: 3, m: 'no se mueve: es una estructura' }];
      const i = Math.floor(t / 3.2) % ex.length, e = ex[i], M = 3 * (e.L - 1) - 2 * e.J, ph = (t % 3.2) / 3.2;
      setT(r('nm'), e.n);
      let ic = ''; for (let k = 0; k < e.L; k++) ic += `<rect x="${200 - e.L * 22 + k * 44 + 4}" y="62" width="36" height="14" rx="7" fill="${[C.g, C.i, C.c, C.o][k]}" stroke="${C.k}" stroke-width="2"/>`;
      ic += T(200, 102, 'n = ' + e.L + ' eslabones (con la bancada)   ·   j = ' + e.J + ' pernos', 13, C.m, 'middle');
      r('icons').innerHTML = ic;
      setT(r('fm'), 'M = 3(' + e.L + ' − 1) − 2·' + e.J + ' = ' + (3 * (e.L - 1)) + ' − ' + (2 * e.J));
      setT(r('res'), ph > 0.25 ? 'M = ' + M : ''); setT(r('mean'), ph > 0.4 ? e.m : '');
    }
  };

  /* ---------- métodos de análisis ---------- */
  scenes.methods = {
    svg: () => { const tiles = [['📐', 'Gráfico', 'regla y compás'], ['∑', 'Analítico', 'ecuaciones'], ['🔢', 'Numérico', 'iteración'], ['💻', 'Software', 'simulación']]; let s = '';
      tiles.forEach((tl, i) => { const x = 28 + (i % 2) * 180, y = 34 + Math.floor(i / 2) * 88; s += `<g data-k="t${i}"><rect x="${x}" y="${y}" width="164" height="76" rx="12" fill="${C.s}" stroke="${C.l}" stroke-width="2"/>${T(x + 14, y + 46, tl[0], 30, C.k)}${T(x + 62, y + 36, tl[1], 15, C.k, 'start', 700)}${T(x + 62, y + 56, tl[2], 12, C.m)}</g>`; });
      return wrap(s + T(200, 22, 'Un mismo problema, cuatro caminos', 13, C.m, 'middle') + T(200, 226, 'se combinan para verificar resultados', 12, C.m, 'middle'), 'Cuatro técnicas de análisis'); },
    upd(r, t) { const a = Math.floor(t / 1.6) % 4; for (let i = 0; i < 4; i++) { const g = r('t' + i), on = i === a; g.firstChild.setAttribute('stroke', on ? 'var(--accent)' : 'var(--line)'); g.firstChild.setAttribute('stroke-width', on ? 4 : 2); g.setAttribute('opacity', on ? 1 : 0.65); } }
  };

  /* ---------- lista de verificación ---------- */
  scenes.checklist = {
    svg: () => { const it = ['Definir el movimiento deseado', 'Elegir y dimensionar el mecanismo', 'Verificar Grashof y grados de libertad', 'Documentar en la memoria técnica']; let s = '';
      it.forEach((x, i) => { const y = 52 + i * 42; s += `<rect x="150" y="${y - 20}" width="230" height="32" rx="8" fill="${C.s}" stroke="${C.l}"/><circle data-k="c${i}" cx="170" cy="${y - 4}" r="10" fill="none" stroke="${C.m}" stroke-width="2"/><path data-k="k${i}" d="M164,${y - 4}l5,5l9,-10" fill="none" stroke="${C.o}" stroke-width="3.5" stroke-linecap="round"/>${T(190, y, x, 11.5, C.k, 'start', 600)}`; });
      return wrap(`<g data-k="gear" transform="translate(76 120)"><path d="${gearPath(12, 52, 42)}" fill="${C.a}" fill-opacity=".85" stroke="${C.k}" stroke-width="2.5"/><circle r="14" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/></g>${s}`, 'Pasos del reto de síntesis'); },
    upd(r, t) { r('gear').setAttribute('transform', `translate(76 120) rotate(${f1(t * 30)})`); const n = Math.floor((t % 8) / 1.7); for (let i = 0; i < 4; i++) r('k' + i).setAttribute('opacity', i < n ? 1 : 0); }
  };

  /* ===================== ESCENAS NUEVAS: fuerza, velocidad, transformación ===================== */
  const arrow = (k, col, w) => `<line data-k="${k}" stroke="${col}" stroke-width="${w || 4}" stroke-linecap="round" marker-end="url(#mk-${k})"/><defs><marker id="mk-${k}" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L8,4L0,8Z" fill="${col}"/></marker></defs>`;
  const meshA = (np, ap, nq) => Math.PI + (Math.PI - np * ap) / nq; // fase de engrane q en contacto (línea de centros sobre +x), ángulos SVG en radianes

  /* ---------- palancas (3 géneros) ---------- */
  scenes.lever = {
    svg: o => wrap(`${hatch(60, 214, 280)}<polygon data-k="fulc" fill="${C.g}" stroke="${C.k}" stroke-width="2.5"/>
      <g data-k="bar"><rect data-k="barr" x="-130" y="-7" width="260" height="14" rx="5" fill="${C.c}" stroke="${C.k}" stroke-width="2.5"/></g>
      <rect data-k="load" width="34" height="30" rx="3" fill="${C.a}" stroke="${C.k}" stroke-width="2.5"/>
      ${arrow('wF', C.a, 4)}${arrow('eF', C.i, 5)}
      ${txt('t1', 14, 24, 14, C.k, 'start', 700)}${txt('t2', 14, 44, 12.5, C.m, 'start', 600)}${txt('t3', 14, 64, 12.5, C.m, 'start', 600)}
      ${T(0, 0, '', 1)}${txt('lbF', 0, 0, 12, C.i, 'middle', 700)}${txt('lbR', 0, 0, 12, C.a, 'middle', 700)}`, 'Palanca'),
    upd(r, t, o = {}) {
      const cls = o.cls || 1, ang = 6 * Math.sin(1.2 * t) * D2R;
      const cfg = { 1: { p: 170, l: 60, e: 330, loadAt: 60, effAt: 330, name: '1.er género: el fulcro está en medio', ex: 'tijeras · alicates · balancín', eDir: 1 },
        2: { p: 50, l: 170, e: 350, loadAt: 170, effAt: 350, name: '2.º género: la carga está en medio', ex: 'carretilla · cascanueces · destapador', eDir: -1 },
        3: { p: 50, l: 340, e: 190, loadAt: 340, effAt: 190, name: '3.er género: el esfuerzo está en medio', ex: 'pinzas · caña de pescar · antebrazo', eDir: -1 } }[cls];
      const py = 150, p = cfg.p, c = Math.cos(ang), s = Math.sin(ang);
      const P = x => [p + (x - p) * c, py + (x - p) * s];
      const bar = r('bar'); bar.setAttribute('transform', `translate(${p} ${py}) rotate(${f1(ang / D2R)})`); const x0 = cls === 1 ? 50 : 40, x1 = cls === 1 ? 350 : 360; r('barr').setAttribute('x', x0 - p); r('barr').setAttribute('width', x1 - x0);
      const fc = r('fulc'); fc.setAttribute('points', `${p},${py + 2} ${p - 18},212 ${p + 18},212`);
      const L = P(cfg.loadAt), E = P(cfg.effAt);
      const ld = r('load'); ld.setAttribute('x', f1(L[0] - 17)); ld.setAttribute('y', f1(L[1] - 37));
      // flechas: carga (peso hacia abajo, encima de la barra) y esfuerzo
      const w = r('wF'); w.setAttribute('x1', f1(L[0])); w.setAttribute('x2', f1(L[0])); w.setAttribute('y1', f1(L[1] - 66)); w.setAttribute('y2', f1(L[1] - 40));
      const e = r('eF'); e.setAttribute('x1', f1(E[0])); e.setAttribute('x2', f1(E[0]));
      if (cfg.eDir === 1) { e.setAttribute('y1', f1(E[1] - 70)); e.setAttribute('y2', f1(E[1] - 12)); } else { e.setAttribute('y1', f1(E[1] + 52)); e.setAttribute('y2', f1(E[1] + 12)); }
      const bR = Math.abs(cfg.loadAt - p), bF = Math.abs(cfg.effAt - p), Rn = 60, F = Rn * bR / bF;
      setT(r('t1'), cfg.name); setT(r('t2'), 'F = R · bR / bF = ' + Math.round(F) + ' N   (carga R = 60 N)'); setT(r('t3'), 'ventaja mecánica = ' + (Rn / F).toFixed(2).replace('.', ',') + '   ·   ' + cfg.ex);
      const lf = r('lbF'); lf.setAttribute('x', f1(E[0] + 16)); lf.setAttribute('y', cfg.eDir === 1 ? f1(E[1] - 38) : f1(E[1] + 36)); setT(lf, 'F');
      const lr = r('lbR'); lr.setAttribute('x', f1(L[0] + 24)); lr.setAttribute('y', f1(L[1] - 52)); setT(lr, 'R');
    }
  };

  /* ---------- llave: momento = fuerza × brazo ---------- */
  scenes.wrench = {
    svg: () => wrap(`<g data-k="nut" transform="translate(90 120)"><polygon points="-22,0 -11,-19 11,-19 22,0 11,19 -11,19" fill="${C.g}" stroke="${C.k}" stroke-width="2.5"/><circle r="6" fill="${C.s}" stroke="${C.k}" stroke-width="2"/></g>
      <rect data-k="arm" x="90" y="113" height="14" rx="6" fill="${C.i}" stroke="${C.k}" stroke-width="2.5"/>${arrow('fa', C.a, 5)}
      <line x1="90" y1="168" x2="90" y2="176" stroke="${C.m}"/><line data-k="dim" y1="172" y2="172" x1="90" stroke="${C.m}" stroke-width="1.5" stroke-dasharray="4 3"/>${txt('dl', 0, 192, 13, C.m, 'middle', 700)}
      ${T(14, 24, 'Mismo momento, distinto brazo', 14, C.k, 'start', 700)}${txt('tF', 14, 46, 13, C.a, 'start', 700)}${txt('tM', 14, 66, 13, C.i, 'start', 700)}${txt('tc', 14, 222, 12, C.m, 'start', 600)}`, 'Momento de una fuerza: llave con brazo corto y largo'),
    upd(r, t) {
      const u = 0.5 + 0.5 * Math.sin(0.7 * t), d = 70 + 130 * u, M = 20, dm = d / 250, F = M / dm;
      r('arm').setAttribute('width', f1(d)); const fa = r('fa'); fa.setAttribute('x1', f1(90 + d)); fa.setAttribute('x2', f1(90 + d)); fa.setAttribute('y1', f1(60)); fa.setAttribute('y2', f1(108));
      fa.setAttribute('stroke-width', f1(3 + F / 12));
      const dim = r('dim'); dim.setAttribute('x2', f1(90 + d)); const dl = r('dl'); dl.setAttribute('x', f1(90 + d / 2)); setT(dl, 'brazo d = ' + dm.toFixed(2).replace('.', ',') + ' m');
      r('nut').setAttribute('transform', `translate(90 120) rotate(${f1(8 * Math.sin(0.7 * t))})`);
      setT(r('tF'), 'F = ' + Math.round(F) + ' N  (flecha naranja)'); setT(r('tM'), 'M = F · d = ' + (F * dm).toFixed(0) + ' N·m  (constante)');
      setT(r('tc'), d < 110 ? 'brazo corto → hace falta mucha fuerza' : d > 160 ? 'brazo largo → basta poca fuerza' : '');
    }
  };

  /* ---------- escala de fuerzas (orden de magnitud) ---------- */
  scenes.forcescale = {
    svg: () => {
      const it = [[-2, '⌚', 'Engrane de reloj', '≈ 0,01 N'], [0, '🖱️', 'Clic de ratón', '≈ 1 N'], [1, '🚪', 'Abrir una puerta', '≈ 10 N'], [3, '🚗', 'Empujar un auto', '≈ 1 kN'], [4, '🛞', 'Gato de auto', '≈ 10 kN'], [5.7, '🚜', 'Cilindro de excavadora', '≈ 500 kN'], [7, '🏭', 'Prensa industrial', '≈ 10 MN']];
      const X = v => 30 + (v + 2) / 9 * 340; let s = `<defs><linearGradient id="fsg" x1="0" x2="1"><stop offset="0" stop-color="${C.o}"/><stop offset=".55" stop-color="${C.c}"/><stop offset="1" stop-color="${C.a}"/></linearGradient></defs><rect x="30" y="120" width="340" height="14" rx="7" fill="url(#fsg)"/>`;
      it.forEach((a, i) => { s += `<g data-k="f${i}"><circle cx="${f1(X(a[0]))}" cy="127" r="9" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/>${T(X(a[0]), 104, a[1], 20, C.k, 'middle')}</g>`; });
      s += T(30, 160, 'fuerza pequeña', 11, C.o, 'start', 700) + T(370, 160, 'fuerza muy grande', 11, C.a, 'end', 700) + T(200, 22, 'Escala de fuerzas (cada marca ×10) — órdenes de magnitud', 13, C.k, 'middle', 700);
      s += txt('cap', 200, 196, 15, C.k, 'middle', 700) + txt('cap2', 200, 216, 13, C.m, 'middle', 600);
      return wrap(s, 'Escala de fuerzas, de un engrane de reloj a una prensa industrial');
    },
    upd(r, t) {
      const it = [['Engrane de reloj', '≈ 0,01 N · momento de mN·m: manda la precisión'], ['Clic de ratón', '≈ 1 N · fuerza baja'], ['Abrir una puerta', '≈ 10 N'], ['Empujar un auto', '≈ 1 kN'], ['Gato de auto', '≈ 10 kN: un mecanismo multiplica tu fuerza'], ['Cilindro de excavadora', '≈ 500 kN: fuerzas altas, manda la resistencia'], ['Prensa industrial', '≈ 10 MN: máquina de muy alta carga']];
      const a = Math.floor(t / 1.8) % it.length;
      for (let i = 0; i < it.length; i++) { const g = r('f' + i); g.setAttribute('opacity', i === a ? 1 : 0.45); g.firstChild.setAttribute('r', i === a ? 12 : 8); }
      setT(r('cap'), it[a][0]); setT(r('cap2'), it[a][1]);
    }
  };

  /* ---------- polea móvil (polipasto simple) ---------- */
  scenes.pulley = {
    svg: () => wrap(`${hatch(100, 20, 130)}<path data-k="rope" fill="none" stroke="${C.k}" stroke-width="3"/>
      <circle cx="172" cy="50" r="16" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/><circle cx="172" cy="50" r="3" fill="${C.k}"/>
      <circle data-k="mp" r="16" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/><circle data-k="mpc" r="3" fill="${C.k}"/>
      <line data-k="hang" stroke="${C.k}" stroke-width="3"/><rect data-k="load" width="50" height="34" rx="4" fill="${C.a}" stroke="${C.k}" stroke-width="2.5"/>${T(0, 0, '', 1)}${txt('lr', 0, 0, 13, C.k, 'middle', 700)}
      ${arrow('hand', C.i, 5)}${txt('lh', 232, 120, 13, C.i, 'start', 700)}
      ${T(228, 40, 'polea fija: solo cambia', 11.5, C.m)}${T(228, 55, 'la dirección', 11.5, C.m)}${T(30, 232, 'polea móvil: soporta la carga con 2 tramos de cuerda', 12, C.m)}
      ${txt('t1', 232, 160, 14, C.i, 'start', 700)}${txt('t2', 232, 182, 12.5, C.a, 'start', 700)}${txt('t3', 232, 202, 12.5, C.m, 'start', 600)}`, 'Polea móvil con polea fija'),
    upd(r, t) {
      const s = 0.5 - 0.5 * Math.cos(0.8 * t), yM = 150 - 50 * s, hy = 430 - 2 * yM;
      r('rope').setAttribute('d', `M124,22 L124,${f1(yM)} A16,16 0 0 0 156,${f1(yM)} L156,50 A16,16 0 0 0 188,50 L188,${f1(hy)}`);
      const mp = r('mp'); mp.setAttribute('cx', 140); mp.setAttribute('cy', f1(yM)); const mc = r('mpc'); mc.setAttribute('cx', 140); mc.setAttribute('cy', f1(yM));
      setL(r('hang'), [140, yM], [140, yM + 20]); const ld = r('load'); ld.setAttribute('x', 115); ld.setAttribute('y', f1(yM + 20)); const lr = r('lr'); lr.setAttribute('x', 140); lr.setAttribute('y', f1(yM + 43)); setT(lr, 'R');
      const h = r('hand'); h.setAttribute('x1', 188); h.setAttribute('x2', 188); h.setAttribute('y1', f1(hy + 14)); h.setAttribute('y2', f1(hy + 52)); setT(r('lh'), 'F');
      r('lh').setAttribute('x', 204); r('lh').setAttribute('y', f1(hy + 40));
      setT(r('t1'), 'F = R / 2'); setT(r('t2'), 'la carga sube ' + Math.round(50 * s) + ' px'); setT(r('t3'), 'tú jalas ' + Math.round(100 * s) + ' px (el doble)');
    }
  };

  /* ---------- plano inclinado ---------- */
  scenes.incline = {
    svg: () => wrap(`<polygon data-k="ramp" fill="${C.s2}" stroke="${C.k}" stroke-width="2.5"/>
      <g data-k="blk"><rect x="-22" y="-30" width="44" height="30" rx="3" fill="${C.a}" stroke="${C.k}" stroke-width="2.5"/></g>${arrow('wa', C.a, 3.5)}${arrow('fa', C.i, 4.5)}
      ${T(14, 24, 'Subir por una rampa en vez de levantar', 14, C.k, 'start', 700)}${txt('t1', 14, 46, 13, C.a, 'start', 700)}${txt('t2', 14, 66, 13, C.i, 'start', 700)}${txt('t3', 14, 86, 12, C.m, 'start', 600)}${T(40, 226, 'a cambio de recorrer más distancia', 12, C.m)}`, 'Plano inclinado'),
    upd(r, t) {
      const th = (28 + 14 * Math.sin(0.45 * t)) * D2R, Lr = 250, A = [50, 205], E = [50 + Lr * Math.cos(th), 205 - Lr * Math.sin(th)];
      r('ramp').setAttribute('points', `${A[0]},${A[1]} ${f1(E[0])},${f1(E[1])} ${f1(E[0])},${A[1]}`);
      const s = 50 + 130 * (0.5 + 0.5 * Math.sin(0.9 * t)), P = [A[0] + s * Math.cos(th), A[1] - s * Math.sin(th)];
      r('blk').setAttribute('transform', `translate(${f1(P[0])} ${f1(P[1])}) rotate(${f1(-th / D2R)})`);
      const c = [P[0] + 15 * Math.sin(th), P[1] - 15 * Math.cos(th)];
      const w = r('wa'); w.setAttribute('x1', f1(c[0])); w.setAttribute('x2', f1(c[0])); w.setAttribute('y1', f1(c[1])); w.setAttribute('y2', f1(c[1] + 58));
      const f = r('fa'); f.setAttribute('x1', f1(c[0] - 20 * Math.cos(th))); f.setAttribute('y1', f1(c[1] + 20 * Math.sin(th))); f.setAttribute('x2', f1(c[0] + 42 * Math.cos(th))); f.setAttribute('y2', f1(c[1] - 42 * Math.sin(th)));
      setT(r('t1'), 'peso W = 100 N (levantarlo directo)'); setT(r('t2'), 'F = W · sen θ = ' + Math.round(100 * Math.sin(th)) + ' N   (θ = ' + Math.round(th / D2R) + '°)'); setT(r('t3'), 'rampa más suave → menos fuerza, más recorrido');
    }
  };

  /* ---------- tornillo y tuerca ---------- */
  scenes.screw = {
    svg: () => { let th = ''; for (let i = 0; i < 17; i++) th += `<line data-k="th${i}" y1="102" y2="138" stroke="${C.k}" stroke-width="2" opacity=".75"/>`;
      return wrap(`<defs><clipPath id="clr"><rect x="60" y="102" width="290" height="36"/></clipPath></defs><rect x="60" y="102" width="290" height="36" rx="4" fill="${C.g}" fill-opacity=".45" stroke="${C.k}" stroke-width="2.5"/><g clip-path="url(#clr)">${th}</g>
      <g data-k="crank" transform="translate(44 120)"><circle r="16" fill="${C.i}" stroke="${C.k}" stroke-width="2.5"/><line x1="0" y1="0" x2="12" y2="0" stroke="${C.s}" stroke-width="3"/></g>
      <rect data-k="nut" y="88" width="34" height="64" rx="5" fill="${C.o}" stroke="${C.k}" stroke-width="2.5"/>${hatch(300, 160, 60)}
      ${T(14, 24, 'Giro → avance en línea recta', 14, C.k, 'start', 700)}${txt('t1', 14, 46, 13, C.i, 'start', 700)}${txt('t2', 14, 66, 13, C.o, 'start', 700)}${T(200, 218, 'un tornillo es un plano inclinado enrollado', 12, C.m, 'middle')}`, 'Tornillo y tuerca'); },
    upd(r, t) {
      const turns = 4.5 * Math.sin(0.7 * t), pitch = 18; // 4,5 vueltas
      for (let i = 0; i < 17; i++) { const x = 60 + ((i * pitch + turns * pitch) % (17 * pitch) + 17 * pitch) % (17 * pitch); const l = r('th' + i); l.setAttribute('x1', f1(x)); l.setAttribute('x2', f1(x + 9)); }
      r('crank').setAttribute('transform', `translate(44 120) rotate(${f1(turns * 360)})`);
      const nx = 200 + turns * pitch * 0.5; r('nut').setAttribute('x', f1(nx - 17));
      setT(r('t1'), 'giras ' + Math.abs(turns).toFixed(1).replace('.', ',') + ' vueltas ' + (Math.cos(0.7 * t) >= 0 ? '↻' : '↺')); setT(r('t2'), 'avance = vueltas × avance por vuelta');
    }
  };

  /* ---------- prensa hidráulica (Pascal) ---------- */
  scenes.hydraulic = {
    svg: () => wrap(`<rect x="70" y="150" width="270" height="40" fill="${C.i}" fill-opacity=".35"/>
      <rect data-k="lq1" x="80" width="40" fill="${C.i}" fill-opacity=".35"/><rect data-k="lq2" x="240" width="90" fill="${C.i}" fill-opacity=".35"/>
      <path d="M80,70 V190 H330 V90 M120,70 V150 H240 V90" fill="none" stroke="${C.k}" stroke-width="3"/><path d="M80,190 H330" stroke="${C.k}" stroke-width="3"/><path d="M240,90 V150 M330,90 V190" stroke="${C.k}" stroke-width="3"/>
      <rect data-k="p1" x="82" width="36" height="10" fill="${C.c}" stroke="${C.k}" stroke-width="2"/><line data-k="r1" x1="100" x2="100" stroke="${C.c}" stroke-width="6"/>
      <rect data-k="p2" x="242" width="86" height="10" fill="${C.o}" stroke="${C.k}" stroke-width="2"/><rect data-k="pl" x="250" width="70" height="8" fill="${C.o}" stroke="${C.k}" stroke-width="2"/><rect data-k="car" x="262" width="46" height="34" rx="3" fill="${C.a}" stroke="${C.k}" stroke-width="2.5"/>
      ${arrow('fin', C.i, 5)}${T(100, 28, 'F₁ = 10 N', 13, C.i, 'middle', 700)}${T(100, 216, 'área A₁', 12, C.m, 'middle')}${T(285, 216, 'área A₂ = 5 · A₁', 12, C.m, 'middle')}${txt('t1', 14, 236, 12.5, C.k, 'start', 700)}${txt('t2', 285, 28, 13, C.o, 'middle', 700)}`, 'Prensa hidráulica'),
    upd(r, t) {
      const u = 0.5 - 0.5 * Math.cos(0.9 * t), y1 = 92 + 50 * u, y2 = 120 - 10 * u; // émbolo pequeño baja 50, el grande sube 10
      r('p1').setAttribute('y', f1(y1)); const rd = r('r1'); rd.setAttribute('y1', 40); rd.setAttribute('y2', f1(y1));
      r('p2').setAttribute('y', f1(y2)); r('pl').setAttribute('y', f1(y2 - 8)); r('car').setAttribute('y', f1(y2 - 42));
      const l1 = r('lq1'); l1.setAttribute('y', f1(y1 + 10)); l1.setAttribute('height', f1(190 - y1 - 10)); const l2 = r('lq2'); l2.setAttribute('y', f1(y2 + 10)); l2.setAttribute('height', f1(190 - y2 - 10));
      const f = r('fin'); f.setAttribute('x1', 100); f.setAttribute('x2', 100); f.setAttribute('y1', f1(y1 - 50)); f.setAttribute('y2', f1(y1 - 12));
      setT(r('t1'), 'el émbolo pequeño baja ' + Math.round(50 * u) + ' px'); setT(r('t2'), 'F₂ = F₁ · A₂/A₁ = 50 N  ↑ sube ' + Math.round(10 * u) + ' px');
    }
  };

  /* ---------- tren de engranes con intermedio ---------- */
  scenes.geartrain = {
    svg: () => { const mk = (k, n, rp, cx, col) => `<g data-k="${k}" transform="translate(${cx} 118)"><path d="${gearPath(n, rp + 6, rp - 5)}" fill="${col}" fill-opacity=".85" stroke="${C.k}" stroke-width="2.5"/><circle r="7" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/><circle cx="${rp - 12}" r="3.5" fill="${C.s}"/></g>`;
      return wrap(`${mk('A', 8, 24, 70, C.i)}${mk('B', 12, 36, 130, C.c)}${mk('Cg', 20, 60, 226, C.o)}${T(70, 168, 'A · z = 8', 12, C.i, 'middle', 700)}${T(130, 190, 'B · z = 12', 12, C.c, 'middle', 700)}${T(226, 208, 'C · z = 20', 12, C.o, 'middle', 700)}
      ${T(14, 24, 'Tren de engranes: B es un engrane intermedio', 14, C.k, 'start', 700)}${txt('t1', 14, 46, 13, C.i, 'start', 700)}${txt('t2', 300, 90, 13, C.o, 'start', 700)}${T(300, 112, 'i = z₃/z₁ = 20/8', 12.5, C.m)}${T(300, 130, '= 2,5  (reductor)', 12.5, C.m)}${T(300, 154, 'B solo invierte', 12, C.m)}${T(300, 170, 'el sentido', 12, C.m)}`, 'Tren de engranes con engrane intermedio'); },
    upd(r, t) {
      const a = 1.8 * t, b = meshA(8, a, 12), c = meshA(12, b, 20);
      r('A').setAttribute('transform', `translate(70 118) rotate(${f1(a / D2R)})`); r('B').setAttribute('transform', `translate(130 118) rotate(${f1(b / D2R)})`); r('Cg').setAttribute('transform', `translate(226 118) rotate(${f1(c / D2R)})`);
      setT(r('t1'), 'entrada A: 100 rpm ↻'); setT(r('t2'), 'salida C: 40 rpm ↻');
    }
  };

  /* ---------- piñón y cremallera ---------- */
  scenes.rackpinion = {
    svg: () => { const p = 2 * Math.PI * 30 / 12; let rack = ''; for (let k = -2; k < 24; k++) { const x = k * p; rack += `M${f1(x)},138 L${f1(x + 3)},127 L${f1(x + 7)},127 L${f1(x + 10)},138 `; }
      return wrap(`<g data-k="rk"><path d="${rack}Z" fill="${C.o}" stroke="${C.k}" stroke-width="2"/><rect x="${-2 * p}" y="138" width="${26 * p}" height="24" fill="${C.o}" fill-opacity=".8" stroke="${C.k}" stroke-width="2"/><rect x="170" y="164" width="60" height="28" rx="4" fill="${C.a}" stroke="${C.k}" stroke-width="2.5"/>${T(200, 183, 'carga', 12, C.s, 'middle', 700)}</g>
      <g data-k="pn" transform="translate(200 100)"><path d="${gearPath(12, 36, 26)}" fill="${C.i}" fill-opacity=".9" stroke="${C.k}" stroke-width="2.5"/><circle r="8" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/><circle cx="18" r="3.5" fill="${C.s}"/></g>
      ${T(14, 24, 'Giro → traslación', 14, C.k, 'start', 700)}${txt('t1', 14, 46, 13, C.i, 'start', 700)}${txt('t2', 14, 66, 13, C.o, 'start', 700)}${T(200, 222, 'avance de la cremallera = radio del piñón × ángulo girado', 12, C.m, 'middle')}`, 'Piñón y cremallera'); },
    upd(r, t) {
      const al = 2.6 * Math.sin(0.6 * t), p = 2 * Math.PI * 30 / 12, off = -30 * al;
      r('pn').setAttribute('transform', `translate(200 100) rotate(${f1(90 + al / D2R)})`);
      const base = 200 + p / 2 - 2 * p * 6; r('rk').setAttribute('transform', `translate(${f1(base + off - 13 * p + 13 * p)} 0)`);
      setT(r('t1'), 'piñón: ' + Math.round(al / D2R) + '°'); setT(r('t2'), 'cremallera: ' + Math.round(-off) + ' px');
    }
  };

  /* ---------- trinquete ---------- */
  scenes.ratchet = {
    svg: () => { const n = 12, ro = 54, ri = 42; let p = ''; for (let i = 0; i < n; i++) { const a0 = i / n * TAU2, a1 = (i + 1) / n * TAU2; p += (i ? 'L' : 'M') + f1(ri * Math.cos(a0)) + ',' + f1(ri * Math.sin(a0)) + 'L' + f1(ro * Math.cos(a0)) + ',' + f1(ro * Math.sin(a0)) + 'L' + f1(ri * Math.cos(a1)) + ',' + f1(ri * Math.sin(a1)); }
      return wrap(`<g data-k="wh" transform="translate(150 125)"><path d="${p}Z" fill="${C.o}" fill-opacity=".85" stroke="${C.k}" stroke-width="2.5"/><circle r="9" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/><circle cx="22" r="4" fill="${C.s}"/></g>
      <g data-k="pawl"><line x1="0" y1="0" x2="-62" y2="12" stroke="${C.c}" stroke-width="8" stroke-linecap="round"/></g><circle cx="222" cy="62" r="7" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/>
      ${T(14, 24, 'Trinquete: gira en un solo sentido', 14, C.k, 'start', 700)}${txt('t1', 262, 100, 13, C.i, 'start', 700)}${T(262, 124, 'El garfio sube por', 12, C.m)}${T(262, 140, 'la cara inclinada y', 12, C.m)}${T(262, 156, 'bloquea el retroceso.', 12, C.m)}${T(150, 222, 'movimiento intermitente: paso a paso (30° por golpe)', 12, C.m, 'middle')}`, 'Trinquete'); },
    upd(r, t) {
      const per = 1.5, n = Math.floor(t / per), ph = (t % per) / per, st = Math.min(1, ph / 0.3), e = st * st * (3 - 2 * st), ang = (n + e) * 30;
      r('wh').setAttribute('transform', `translate(150 125) rotate(${f1(ang)})`);
      const lift = Math.sin(Math.PI * Math.min(1, st)) * (st < 1 ? 1 : 0) * 7; r('pawl').setAttribute('transform', `translate(222 62) rotate(${f1(-lift)})`);
      setT(r('t1'), 'golpes: ' + (n + (ph > 0.3 ? 1 : 0)));
    }
  };

  /* ---------- Ginebra (cruz de Malta) de 4 ranuras ---------- */
  scenes.geneva = {
    svg: () => { let sl = ''; for (let k = 0; k < 4; k++) sl += `<line x1="${f1(18.2 * Math.cos(k * Math.PI / 2))}" y1="${f1(18.2 * Math.sin(k * Math.PI / 2))}" x2="${f1(48 * Math.cos(k * Math.PI / 2))}" y2="${f1(48 * Math.sin(k * Math.PI / 2))}" stroke="${C.s2}" stroke-width="9" stroke-linecap="butt"/>`;
      return wrap(`<g transform="translate(120 125) scale(1.45)"><g data-k="drv"><circle r="18" fill="${C.i}" fill-opacity=".85" stroke="${C.k}" stroke-width="2"/><line x1="0" y1="0" x2="44" y2="0" stroke="${C.i}" stroke-width="5" stroke-linecap="round"/><circle cx="44" r="5" fill="${C.a}" stroke="${C.k}" stroke-width="1.5"/><circle r="3" fill="${C.s}"/></g>
      <g transform="translate(62.2 0)"><g data-k="drn"><circle r="44" fill="${C.o}" fill-opacity=".85" stroke="${C.k}" stroke-width="2"/>${sl}<circle r="6" fill="${C.s}" stroke="${C.k}" stroke-width="1.5"/></g></g></g>
      ${T(14, 24, 'Ginebra (cruz de Malta)', 14, C.k, 'start', 700)}${T(290, 90, 'entrada:', 12.5, C.i, 'start', 700)}${T(290, 106, 'gira continua', 12.5, C.i)}${T(290, 134, 'salida:', 12.5, C.o, 'start', 700)}${T(290, 150, 'avanza 90° y', 12.5, C.o)}${T(290, 166, 'se detiene', 12.5, C.o)}${txt('t1', 14, 222, 12, C.m, 'start', 600)}`, 'Mecanismo de Ginebra'); },
    upd(r, t) {
      const th = 1.25 * t; let c = Math.floor((th + Math.PI) / TAU2), psi = th - TAU2 * c; // psi en [-π, π)
      const eng = Math.abs(psi) < Math.PI / 4, ph = eng ? Math.atan2(Math.sin(psi), Math.SQRT2 - Math.cos(psi)) : (psi < 0 ? -Math.PI / 4 : Math.PI / 4);
      const alpha = Math.PI - ph - c * Math.PI / 2;
      r('drv').setAttribute('transform', `rotate(${f1(-psi / D2R)})`);
      r('drn').setAttribute('transform', `rotate(${f1(-(alpha - Math.PI) / D2R)})`);
      setT(r('t1'), eng ? 'engranado: la salida gira' : 'salida bloqueada: descansa');
    }
  };

  /* ---------- tiles genéricos (funciones de un mecanismo) ---------- */
  scenes.functions = {
    svg: () => { const tiles = [['💪', 'Fuerza', 'palanca · polea'], ['⚡', 'Velocidad', 'engranes · correas'], ['🔄', 'Movimiento', 'leva · biela'], ['➡️', 'Transmisión', 'ejes · cadenas']]; let s = '';
      tiles.forEach((tl, i) => { const x = 28 + (i % 2) * 180, y = 34 + Math.floor(i / 2) * 88; s += `<g data-k="t${i}"><rect x="${x}" y="${y}" width="164" height="76" rx="12" fill="${C.s}" stroke="${C.l}" stroke-width="2"/>${T(x + 14, y + 46, tl[0], 30, C.k)}${T(x + 62, y + 36, tl[1], 15, C.k, 'start', 700)}${T(x + 62, y + 56, tl[2], 10.5, C.m)}</g>`; });
      return wrap(s + T(200, 22, '¿Qué hace el mecanismo con la entrada?', 13, C.m, 'middle', 700) + T(200, 226, 'modifica fuerza, velocidad o movimiento, o lo transmite', 12, C.m, 'middle'), 'Funciones de un mecanismo'); },
    upd(r, t) { const a = Math.floor(t / 1.6) % 4; for (let i = 0; i < 4; i++) { const g = r('t' + i), on = i === a; g.firstChild.setAttribute('stroke', on ? 'var(--accent)' : 'var(--line)'); g.firstChild.setAttribute('stroke-width', on ? 4 : 2); g.setAttribute('opacity', on ? 1 : 0.65); } }
  };

  /* ---------- ruedas de fricción ---------- */
  scenes.friction = {
    svg: () => wrap(`<g data-k="fa" transform="translate(120 120)"><circle r="44" fill="${C.i}" fill-opacity=".85" stroke="${C.k}" stroke-width="3"/><circle r="7" fill="${C.s}" stroke="${C.k}" stroke-width="2"/><line x1="0" y1="0" x2="34" y2="0" stroke="${C.s}" stroke-width="4" stroke-linecap="round"/></g>
      <g data-k="fb" transform="translate(234 120)"><circle r="70" fill="${C.o}" fill-opacity=".85" stroke="${C.k}" stroke-width="3"/><circle r="7" fill="${C.s}" stroke="${C.k}" stroke-width="2"/><line x1="0" y1="0" x2="56" y2="0" stroke="${C.s}" stroke-width="4" stroke-linecap="round"/></g>
      ${T(14, 24, 'Ruedas de fricción', 14, C.k, 'start', 700)}${txt('t1', 14, 46, 13, C.i, 'start', 700)}${txt('t2', 14, 66, 13, C.o, 'start', 700)}${T(200, 224, 'transmiten por rozamiento: sin dientes, pueden patinar si hay mucha carga', 11.5, C.m, 'middle')}`, 'Ruedas de fricción'),
    upd(r, t) { const a = 1.6 * t / D2R; r('fa').setAttribute('transform', `translate(120 120) rotate(${f1(a)})`); r('fb').setAttribute('transform', `translate(234 120) rotate(${f1(-a * 44 / 70)})`); setT(r('t1'), 'entrada (pequeña): 160 rpm'); setT(r('t2'), 'salida (grande): 100 rpm'); }
  };

  /* ---------- tornillo sinfín y rueda dentada ---------- */
  scenes.worm = {
    svg: () => { let th = ''; for (let i = 0; i < 14; i++) th += `<line data-k="w${i}" y1="136" y2="164" stroke="${C.k}" stroke-width="2.2" opacity=".8"/>`;
      return wrap(`<g data-k="wh" transform="translate(200 88)"><path d="${gearPath(20, 58, 49)}" fill="${C.o}" fill-opacity=".85" stroke="${C.k}" stroke-width="2.5"/><circle r="8" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/><circle cx="30" r="4" fill="${C.s}"/></g>
      <defs><clipPath id="wcl"><rect x="110" y="136" width="180" height="28" rx="6"/></clipPath></defs><rect x="110" y="136" width="180" height="28" rx="6" fill="${C.i}" fill-opacity=".8" stroke="${C.k}" stroke-width="2.5"/><g clip-path="url(#wcl)">${th}</g><line x1="90" y1="150" x2="110" y2="150" stroke="${C.k}" stroke-width="5"/>
      ${T(14, 24, 'Tornillo sinfín y rueda dentada', 14, C.k, 'start', 700)}${txt('t1', 14, 46, 13, C.i, 'start', 700)}${txt('t2', 14, 66, 13, C.o, 'start', 700)}${T(200, 204, '1 vuelta del sinfín = 1 diente de la rueda (de 20 dientes)', 12, C.m, 'middle')}${T(200, 222, 'reducción grande en poco espacio · los ejes se cruzan a 90°', 12, C.m, 'middle')}`, 'Tornillo sinfín y rueda dentada'); },
    upd(r, t) {
      const n = 1.4 * t; for (let i = 0; i < 14; i++) { const x = 110 + (((i * 14 + n * 14) % 196) + 196) % 196 - 8; const l = r('w' + i); l.setAttribute('x1', f1(x)); l.setAttribute('x2', f1(x + 8)); }
      r('wh').setAttribute('transform', `translate(200 88) rotate(${f1(n * 18)})`);
      setT(r('t1'), 'sinfín: 200 rpm'); setT(r('t2'), 'rueda: 10 rpm');
    }
  };

  /* ---------- freno de tambor ---------- */
  scenes.brake = {
    svg: () => wrap(`<g data-k="dr" transform="translate(170 118)"><circle r="56" fill="${C.g}" fill-opacity=".55" stroke="${C.k}" stroke-width="3"/><circle r="40" fill="none" stroke="${C.s}" stroke-width="2"/><line x1="0" y1="0" x2="46" y2="0" stroke="${C.s}" stroke-width="5" stroke-linecap="round"/><line x1="0" y1="0" x2="0" y2="46" stroke="${C.s}" stroke-width="5" stroke-linecap="round"/><line x1="0" y1="0" x2="-46" y2="0" stroke="${C.s}" stroke-width="5" stroke-linecap="round"/><line x1="0" y1="0" x2="0" y2="-46" stroke="${C.s}" stroke-width="5" stroke-linecap="round"/><circle r="8" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/></g>
      <rect data-k="pad" y="96" width="22" height="44" rx="5" fill="${C.a}" stroke="${C.k}" stroke-width="2.5"/>${arrow('pf', C.a, 5)}
      ${T(14, 24, 'Freno: regula el movimiento', 14, C.k, 'start', 700)}${txt('t1', 14, 46, 13, C.i, 'start', 700)}${txt('t2', 14, 66, 13, C.a, 'start', 700)}${T(200, 224, 'la energía cinética se convierte en calor por rozamiento', 12, C.m, 'middle')}`, 'Freno de tambor'),
    upd(r, t) {
      const w0 = 7, T0 = 6, k = Math.floor(t / T0), tau = t - k * T0; let ang, w, press = 0;
      if (tau < 2.2) { ang = w0 * tau; w = w0; } else if (tau < 4.2) { const s = tau - 2.2; ang = w0 * 2.2 + w0 * (s - s * s / 4); w = w0 * (1 - s / 2); press = 1; } else { ang = w0 * 2.2 + w0; w = 0; press = tau < 5 ? 1 : 0; }
      ang += k * (w0 * 3.2);
      r('dr').setAttribute('transform', `translate(170 118) rotate(${f1(ang / D2R)})`);
      const g = press ? 0 : 20; r('pad').setAttribute('x', f1(228 + g)); const pf = r('pf'); pf.setAttribute('y1', 118); pf.setAttribute('y2', 118); pf.setAttribute('x1', f1(290 + g)); pf.setAttribute('x2', f1(254 + g)); pf.setAttribute('opacity', press ? 1 : 0);
      r('pad').setAttribute('fill', press && w > 0.3 ? 'var(--bad)' : 'var(--accent)');
      setT(r('t1'), 'giro: ' + Math.round(w / w0 * 100) + ' % de la velocidad'); setT(r('t2'), press ? (w > 0.1 ? 'frenando · se calienta' : 'detenido y sostenido') : 'freno suelto');
    }
  };

  /* ---------- embrague (acoplar / desacoplar ejes) ---------- */
  scenes.clutch = {
    svg: () => { let st = ''; for (let i = 0; i < 6; i++) st += `<line data-k="a${i}" x1="40" x2="150" stroke="${C.s}" stroke-width="3"/>`;
      return wrap(`<rect x="40" y="105" width="110" height="30" fill="${C.i}" fill-opacity=".85" stroke="${C.k}" stroke-width="2.5"/>${st}<rect x="150" y="75" width="12" height="90" fill="${C.i}" stroke="${C.k}" stroke-width="2.5"/>
      <g data-k="out"><rect x="0" y="75" width="12" height="90" fill="${C.o}" stroke="${C.k}" stroke-width="2.5"/><rect x="12" y="105" width="110" height="30" fill="${C.o}" fill-opacity=".85" stroke="${C.k}" stroke-width="2.5"/></g>
      ${T(14, 24, 'Embrague: acopla y desacopla ejes', 14, C.k, 'start', 700)}${txt('t1', 14, 46, 13, C.i, 'start', 700)}${txt('t2', 14, 66, 13, C.o, 'start', 700)}${txt('t3', 200, 216, 13, C.a, 'middle', 700)}${T(95, 186, 'eje motor', 12, C.i, 'middle', 700)}${T(290, 186, 'eje conducido', 12, C.o, 'middle', 700)}`, 'Embrague'); },
    upd(r, t) {
      const T0 = 6, tau = t % T0; let gap, wo; const wi = 6;
      if (tau < 1.5) { gap = 40; wo = 0; } else if (tau < 3) { gap = 40 * (1 - (tau - 1.5) / 1.5); wo = 0; } else if (tau < 4) { gap = 0; wo = wi * (tau - 3); } else if (tau < 5.2) { gap = 0; wo = wi; } else { gap = 40 * Math.min(1, (tau - 5.2) / 0.5); wo = Math.max(0, wi * (1 - (tau - 5.2) / 0.8)); }
      const dt = Math.min(0.1, Math.max(0, t - (this.lt === undefined ? t : this.lt))); this.lt = t; this.pa = (this.pa || 0) + wi * dt;
      r('out').setAttribute('transform', `translate(${f1(162 + gap)} 0)`);
      for (let i = 0; i < 6; i++) { const ya = 108 + (((i * 5 + this.pa * 3) % 30) + 30) % 30 - 3; const la = r('a' + i); la.setAttribute('y1', f1(ya)); la.setAttribute('y2', f1(ya)); }
      setT(r('t1'), 'entrada: ' + wi * 20 + ' rpm'); setT(r('t2'), 'salida: ' + Math.round(wo * 20) + ' rpm'); setT(r('t3'), gap > 1 ? 'desacoplado' : (wo < wi - 0.05 ? 'acoplando… (patina un instante)' : 'acoplado: giran juntos'));
    }
  };

  /* ---------- muelle y amortiguador ---------- */
  scenes.spring = {
    svg: () => wrap(`<rect x="22" y="70" width="10" height="110" fill="${C.g}"/><path data-k="sp" fill="none" stroke="${C.i}" stroke-width="4" stroke-linejoin="round"/><rect data-k="dm" x="32" y="150" width="90" height="14" fill="${C.g}" fill-opacity=".5" stroke="${C.k}" stroke-width="2"/><line data-k="dr" y1="157" y2="157" x1="100" stroke="${C.k}" stroke-width="5"/><rect data-k="ms" y="86" width="58" height="84" rx="5" fill="${C.a}" stroke="${C.k}" stroke-width="2.5"/>${txt('mt', 0, 134, 13, C.s, 'middle', 700)}
      <line x1="32" y1="180" x2="380" y2="180" stroke="${C.l}"/>${T(14, 24, 'Muelle y amortiguador', 14, C.k, 'start', 700)}${T(14, 46, 'muelle: acumula energía elástica', 12.5, C.i, 'start', 700)}${T(14, 64, 'amortiguador: la disipa (calor)', 12.5, C.m, 'start', 700)}${txt('t1', 200, 218, 13, C.k, 'middle', 700)}`, 'Muelle y amortiguador'),
    upd(r, t) {
      const tau = t % 7, x = 190 + 70 * Math.exp(-0.55 * tau) * Math.cos(4.2 * tau), x0 = 40, n = 10; let d = 'M32,110'; const L = x - x0;
      for (let i = 0; i <= n; i++) d += `L${f1(x0 + L * (i + 0.5) / (n + 1))},${i % 2 ? 126 : 94}`; d += `L${f1(x)},110`;
      r('sp').setAttribute('d', d); const ms = r('ms'); ms.setAttribute('x', f1(x)); const mt = r('mt'); mt.setAttribute('x', f1(x + 29)); setT(mt, 'm');
      const dr = r('dr'); dr.setAttribute('x2', f1(x));
      const E = Math.pow((x - 190) / 70, 2) * 100; setT(r('t1'), 'energía almacenada en el muelle: ' + Math.round(Math.min(100, E)) + ' %  (se va disipando)');
    }
  };

  /* ===================== ESCENAS NUEVAS: lecciones teóricas (2.ª capa visual) ===================== */

  /* ---------- distancia recorrida frente a desplazamiento (1.2) ---------- */
  scenes.trayecto = {
    svg: () => { let ticks = ''; for (let n = -1; n <= 4; n++) ticks += `<line x1="${90 + n * 60}" y1="150" x2="${90 + n * 60}" y2="158" stroke="${C.k}" stroke-width="2"/>${T(90 + n * 60, 174, n + ' m', 12, C.m, 'middle')}`;
      return wrap(`${T(14, 24, 'Un mismo viaje, dos magnitudes distintas', 14, C.k, 'start', 700)}
      <line x1="20" y1="150" x2="380" y2="150" stroke="${C.k}" stroke-width="2.5"/>${ticks}
      <line data-k="go" stroke="${C.i}" stroke-width="5" stroke-linecap="round"/><line data-k="back" stroke="${C.a}" stroke-width="5" stroke-linecap="round"/>
      <g data-k="car"><rect x="-20" y="-24" width="40" height="15" rx="4" fill="${C.c}" stroke="${C.k}" stroke-width="2"/><rect x="-11" y="-33" width="22" height="10" rx="3" fill="${C.s}" stroke="${C.k}" stroke-width="2"/><circle cx="-11" cy="-6" r="6" fill="${C.s}" stroke="${C.k}" stroke-width="2"/><circle cx="11" cy="-6" r="6" fill="${C.s}" stroke="${C.k}" stroke-width="2"/></g>
      ${arrow('dsp', C.o, 4)}${T(90, 210, 'origen', 12, C.m, 'middle')}
      ${txt('t1', 14, 60, 14, C.a, 'start', 700)}${txt('t2', 14, 82, 14, C.o, 'start', 700)}${T(200, 228, 'distancia = todo lo recorrido · desplazamiento = de dónde a dónde', 12, C.m, 'middle')}`, 'Distancia recorrida y desplazamiento'); },
    upd(r, t) {
      const ph = (t % 13), s = ph < 1 ? 0 : ph < 5 ? (ph - 1) / 4 * 3 : ph < 6 ? 3 : ph < 8 ? 3 + (ph - 6) / 2 : 4;
      const pos = s <= 3 ? s : 3 - (s - 3), X = u => 90 + 60 * u;
      r('car').setAttribute('transform', `translate(${f1(X(pos))} 150)`);
      const g = r('go'); g.setAttribute('x1', X(0)); g.setAttribute('x2', f1(X(Math.min(s, 3)))); g.setAttribute('y1', 140); g.setAttribute('y2', 140);
      const b = r('back'); b.setAttribute('x1', X(3)); b.setAttribute('x2', f1(X(pos))); b.setAttribute('y1', 130); b.setAttribute('y2', 130); b.setAttribute('opacity', s > 3 ? 1 : 0);
      const d = r('dsp'); d.setAttribute('x1', X(0)); d.setAttribute('y1', 190); d.setAttribute('x2', f1(X(pos) + (pos > 0.05 ? -2 : 0))); d.setAttribute('y2', 190); d.setAttribute('opacity', pos > 0.1 ? 1 : 0);
      setT(r('t1'), 'distancia recorrida: ' + s.toFixed(1).replace('.', ',') + ' m'); setT(r('t2'), 'desplazamiento: ' + (pos >= 0 ? '+' : '') + pos.toFixed(1).replace('.', ',') + ' m');
    }
  };

  /* ---------- grados de libertad de un cuerpo en el plano (2.2) ---------- */
  scenes.dof3 = {
    svg: () => wrap(`${T(14, 24, '¿Cuántos movimientos le quedan a la barra?', 13, C.k, 'start', 700)}
      <g data-k="gFree"><line x1="40" y1="206" x2="100" y2="206" stroke="${C.m}" stroke-width="2" marker-end="url(#mk-ax)"/><line x1="40" y1="206" x2="40" y2="150" stroke="${C.m}" stroke-width="2" marker-end="url(#mk-ax)"/>${T(104, 210, 'x', 12, C.m)}${T(34, 144, 'y', 12, C.m, 'end')}<defs><marker id="mk-ax" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L8,4L0,8Z" fill="${C.m}"/></marker></defs></g>
      <g data-k="gPin"><circle cx="200" cy="130" r="22" fill="none" stroke="${C.l}" stroke-dasharray="3 4"/>${hatch(170, 190, 60)}<line x1="200" y1="130" x2="200" y2="190" stroke="${C.k}" stroke-width="3"/></g>
      <g data-k="gSlide"><line x1="60" y1="160" x2="340" y2="160" stroke="${C.k}" stroke-width="3"/>${hatch(60, 168, 280)}</g>
      <g data-k="bar"><rect x="-50" y="-8" width="100" height="16" rx="5" fill="${C.i}" stroke="${C.k}" stroke-width="2.5"/><circle r="4" fill="${C.s}" stroke="${C.k}" stroke-width="2"/></g>
      ${txt('t1', 14, 52, 15, C.a, 'start', 700)}${txt('t2', 14, 74, 13, C.m, 'start', 600)}`, 'Grados de libertad en el plano'),
    upd(r, t, o = {}) {
      const m = o.mode || 'free', show = (k, v) => r(k).setAttribute('opacity', v ? 1 : 0);
      show('gFree', m === 'free'); show('gPin', m === 'pin'); show('gSlide', m === 'slide');
      const bar = r('bar'), s = Math.sin(1.6 * t);
      if (m === 'free') {
        const ph = Math.floor((t % 9) / 3), dx = ph === 0 ? 50 * s : 0, dy = ph === 1 ? 24 * s : 0, da = ph === 2 ? 40 * s : 0;
        bar.setAttribute('transform', `translate(${f1(200 + dx)} ${f1(120 + dy)}) rotate(${f1(-da)})`);
        setT(r('t1'), 'Cuerpo libre: 3 GDL'); setT(r('t2'), 'ahora se mueve en: ' + ['x (traslación horizontal)', 'y (traslación vertical)', 'θ (giro)'][ph]);
      } else if (m === 'pin') {
        bar.setAttribute('transform', `translate(200 130) rotate(${f1(-45 * s)}) translate(50 0)`);
        setT(r('t1'), 'Perno (revoluta): 1 GDL'); setT(r('t2'), 'impide x e y: solo queda libre el giro θ');
      } else {
        bar.setAttribute('transform', `translate(${f1(200 + 70 * s)} 148)`);
        setT(r('t1'), 'Corredera (prismático): 1 GDL'); setT(r('t2'), 'impide y y θ: solo queda libre la traslación x');
      }
    }
  };

  /* ---------- eslabones binario, ternario y cuaternario (2.1) ---------- */
  scenes.linktypes = {
    svg: () => { const shapes = [
        { n: 'Binario', s: '2 uniones', p: [[-44, 0], [44, 0]] },
        { n: 'Ternario', s: '3 uniones', p: [[-38, 26], [38, 26], [0, -36]] },
        { n: 'Cuaternario', s: '4 uniones', p: [[-36, -30], [36, -30], [36, 30], [-36, 30]] }];
      let o = ''; shapes.forEach((h, i) => { const cx = 70 + i * 130, pts = h.p.map(q => q.join(',')).join(' ');
        o += `<g data-k="e${i}" transform="translate(${cx} 118)">${h.p.length === 2 ? `<line x1="${h.p[0][0]}" y1="0" x2="${h.p[1][0]}" y2="0" stroke="${[C.i, C.c, C.o][i]}" stroke-width="12" stroke-linecap="round"/>` : `<polygon points="${pts}" fill="${[C.i, C.c, C.o][i]}" fill-opacity=".35" stroke="${[C.i, C.c, C.o][i]}" stroke-width="6" stroke-linejoin="round"/>`}${h.p.map((q, j) => `<circle data-k="j${i}${j}" cx="${q[0]}" cy="${q[1]}" r="7" fill="${C.s}" stroke="${C.k}" stroke-width="2.5"/>`).join('')}</g>${T(cx, 196, h.n, 14, C.k, 'middle', 700)}${T(cx, 214, h.s, 12, C.m, 'middle')}`; });
      return wrap(`${T(14, 24, 'Se nombran por el número de uniones que tienen', 13, C.k, 'start', 700)}${o}`, 'Eslabones binario, ternario y cuaternario'); },
    upd(r, t) { for (let i = 0; i < 3; i++) { r('e' + i).setAttribute('transform', `translate(${70 + i * 130} 118) rotate(${f1(14 * Math.sin(1.1 * t + i))})`); const n = [2, 3, 4][i], on = Math.floor(t * 1.4) % 4; for (let j = 0; j < n; j++) r('j' + i + j).setAttribute('r', j === on % n ? 10 : 7); } }
  };

  /* ---------- singularidad de un brazo de 2 articulaciones (4.4) ---------- */
  scenes.singular = {
    svg: () => wrap(`${T(14, 24, 'Cerca de una singularidad el brazo pierde una dirección', 13, C.k, 'start', 700)}${hatch(70, 206, 80)}
      ${line('l1', C.i, 9)}${line('l2', C.o, 9)}${arrow('v1', C.i, 3.5)}${arrow('v2', C.o, 3.5)}${dot('pB', 6)}${dot('pE', 6)}<circle data-k="pT" r="6" fill="${C.a}" stroke="${C.k}" stroke-width="2.5"/>
      ${txt('t1', 14, 48, 13, C.k, 'start', 700)}${txt('t2', 14, 66, 12.5, C.m, 'start', 600)}${txt('t3', 14, 232, 12, C.m, 'start', 600)}`, 'Singularidad de un brazo plano'),
    upd(r, t) {
      const B = [110, 200], L = 80, a1 = 1.05, q2 = 0.85 + 0.82 * Math.sin(0.8 * t);
      const E = [B[0] + L * Math.cos(a1), B[1] - L * Math.sin(a1)], T2 = [E[0] + L * Math.cos(a1 + q2), E[1] - L * Math.sin(a1 + q2)];
      setL(r('l1'), B, E); setL(r('l2'), E, T2); setC(r('pB'), B); setC(r('pE'), E); setC(r('pT'), T2);
      const v = (P, k) => { const dx = T2[0] - P[0], dy = T2[1] - P[1], e = r(k), s = 0.5; setL(e, T2, [T2[0] + s * dy, T2[1] - s * dx]); };
      v(B, 'v1'); v(E, 'v2');
      const det = Math.sin(q2), sing = Math.abs(det) < 0.2;
      setT(r('t1'), 'det J = L₁·L₂·sen q₂ = ' + (det * 6400 / 1000).toFixed(1).replace('.', ',') + (sing ? '  ⚠' : ''));
      setT(r('t2'), sing ? 'columnas casi paralelas: rango 1' : 'columnas independientes: rango 2');
      r('t1').setAttribute('fill', sing ? C.a : C.k);
      setT(r('t3'), 'Flechas: velocidad de la punta al girar cada articulación.');
    }
  };

  /* ---------- intersección de circunferencias: dos ramas de ensamblaje (5.4) ---------- */
  scenes.circles = {
    svg: () => wrap(`${T(14, 24, 'Cierre del lazo: dos circunferencias que se cortan', 12.5, C.k, 'start', 700)}${hatch(70, 206, 250)}
      <circle data-k="cA" fill="none" stroke="${C.c}" stroke-width="1.5" stroke-dasharray="5 5" opacity=".7"/><circle data-k="cO" fill="none" stroke="${C.o}" stroke-width="1.5" stroke-dasharray="5 5" opacity=".7"/>
      ${line('crank', C.i, 8)}${line('cp1', C.c, 8)}${line('rk1', C.o, 8)}<line data-k="cp2" stroke="${C.c}" stroke-width="5" stroke-dasharray="6 6" opacity=".35"/><line data-k="rk2" stroke="${C.o}" stroke-width="5" stroke-dasharray="6 6" opacity=".35"/>
      ${dot('p2', 6)}${dot('p4', 6)}${dot('pA', 5)}<circle data-k="b1" r="6" fill="${C.a}" stroke="${C.k}" stroke-width="2.5"/><circle data-k="b2" r="6" fill="none" stroke="${C.m}" stroke-width="2" stroke-dasharray="3 3"/>
      ${txt('t1', 14, 46, 13, C.a, 'start', 700)}${txt('t2', 14, 66, 12.5, C.m, 'start', 600)}${T(90, 226, 'O₂', 12, C.m, 'middle')}${T(300, 226, 'O₄', 12, C.m, 'middle')}`, 'Dos ramas de ensamblaje'),
    upd(r, t) {
      const O2 = [90, 190], O4 = [300, 190], a = 45, b = 140, c = 118, th = 0.8 * t + 0.6;
      const A = [O2[0] + a * Math.cos(th), O2[1] - a * Math.sin(th)], dx = O4[0] - A[0], dy = O4[1] - A[1], d = Math.hypot(dx, dy);
      const aa = (b * b - c * c + d * d) / (2 * d), h = Math.sqrt(Math.max(0, b * b - aa * aa)), M = [A[0] + aa * dx / d, A[1] + aa * dy / d];
      const p1 = [M[0] + h * dy / d, M[1] - h * dx / d], p2 = [M[0] - h * dy / d, M[1] + h * dx / d], up = p1[1] < p2[1] ? p1 : p2, dn = up === p1 ? p2 : p1;
      const cA = r('cA'), cO = r('cO'); setC(cA, A); cA.setAttribute('r', b); setC(cO, O4); cO.setAttribute('r', c);
      setL(r('crank'), O2, A); setL(r('cp1'), A, up); setL(r('rk1'), O4, up); setL(r('cp2'), A, dn); setL(r('rk2'), O4, dn);
      setC(r('p2'), O2); setC(r('p4'), O4); setC(r('pA'), A); setC(r('b1'), up); setC(r('b2'), dn);
      setT(r('t1'), 'θ₂ = ' + Math.round(((th / D2R) % 360 + 360) % 360) + '°  →  dos puntos B posibles');
      setT(r('t2'), 'Continua: rama 1 (la usada) · punteada: rama 2');
    }
  };

  /* ---------- manivela-corredera con cotas (6.2) ---------- */
  scenes.sliderdim = {
    svg: () => wrap(`${T(14, 22, 'Cotas del mecanismo', 13, C.k, 'start', 700)}
      <line x1="40" y1="118" x2="380" y2="118" stroke="${C.l}" stroke-width="3"/>${hatch(40, 130, 340)}
      <line data-k="vO" stroke="${C.m}" stroke-dasharray="4 4"/><line data-k="vB" stroke="${C.m}" stroke-dasharray="4 4"/>${arrow('xd', C.a, 3)}
      <circle cx="80" cy="170" r="40" fill="none" stroke="${C.l}" stroke-dasharray="3 4"/>
      ${line('cr', C.i, 8)}${line('rod', C.c, 8)}<rect data-k="blk" width="40" height="22" rx="4" fill="${C.o}" fill-opacity=".85" stroke="${C.k}" stroke-width="2.5"/>${dot('pO', 6)}${dot('pA', 5)}${dot('pB', 5)}
      <line x1="22" y1="118" x2="22" y2="170" stroke="${C.a}" stroke-width="2"/>${T(16, 148, 'e', 13, C.a, 'end', 700)}
      ${txt('lr', 0, 0, 13, C.i, 'middle', 700)}${txt('lL', 200, 100, 13, C.c, 'middle', 700)}${txt('lA', 0, 0, 12, C.m, 'middle', 700)}${T(80, 192, 'O', 12, C.m, 'middle')}
      ${txt('t1', 14, 232, 13, C.a, 'start', 700)}`, 'Manivela-corredera con cotas'),
    upd(r, t) {
      const O = [80, 170], rr = 40, l = 150, yg = 118 + 0, th = 1.0 * t + 0.5, A = [O[0] + rr * Math.cos(th), O[1] - rr * Math.sin(th)];
      const B = [A[0] + Math.sqrt(Math.max(0, l * l - (A[1] - yg) * (A[1] - yg))), yg];
      setL(r('cr'), O, A); setL(r('rod'), A, B); setC(r('pO'), O); setC(r('pA'), A); setC(r('pB'), B);
      r('blk').setAttribute('x', f1(B[0] - 20)); r('blk').setAttribute('y', yg - 11);
      setL(r('vO'), [O[0], 118], [O[0], 205]); setL(r('vB'), [B[0], 118], [B[0], 205]); setL(r('xd'), [O[0] + 3, 205], [B[0] - 3, 205]);
      const lr = r('lr'); lr.setAttribute('x', f1((O[0] + A[0]) / 2 - 10)); lr.setAttribute('y', f1((O[1] + A[1]) / 2 - 4)); setT(lr, 'r'); const lA = r('lA'); lA.setAttribute('x', f1(A[0] - 2)); lA.setAttribute('y', f1(A[1] - 10)); setT(lA, 'A'); const lL = r('lL'); lL.setAttribute('x', f1((A[0] + B[0]) / 2)); lL.setAttribute('y', f1((A[1] + B[1]) / 2 - 10)); setT(lL, 'l');
      setT(r('t1'), 'x = ' + ((B[0] - O[0]) / 10).toFixed(1).replace('.', ',') + ' cm   (θ = ' + Math.round(((th / D2R) % 360 + 360) % 360) + '°)');
    }
  };

  /* ---------- yugo escocés (6.4) ---------- */
  scenes.scotch = {
    svg: () => wrap(`${T(14, 22, 'Yugo escocés: x = r · cos θ exacto, sin biela', 13, C.k, 'start', 700)}
      <circle cx="110" cy="130" r="52" fill="none" stroke="${C.l}" stroke-dasharray="3 4"/><line x1="20" y1="214" x2="380" y2="214" stroke="${C.k}" stroke-width="2"/>${hatch(20, 218, 360)}
      <rect data-k="yk" y="78" width="16" height="104" rx="4" fill="${C.o}" fill-opacity=".8" stroke="${C.k}" stroke-width="2.5"/><line data-k="rodY" y1="130" y2="130" stroke="${C.o}" stroke-width="9" stroke-linecap="round"/>
      ${line('cr', C.i, 8)}${dot('pO', 6)}<circle data-k="pP" r="6" fill="${C.a}" stroke="${C.k}" stroke-width="2.5"/>
      <line data-k="proj" stroke="${C.a}" stroke-dasharray="4 4" stroke-width="2"/><circle data-k="mk" r="5" fill="${C.a}"/>
      ${txt('t1', 14, 46, 13, C.a, 'start', 700)}${T(200, 236, 'el pasador de la manivela desliza en la ranura vertical del yugo', 12, C.m, 'middle')}`, 'Mecanismo del yugo escocés'),
    upd(r, t) {
      const O = [110, 130], rr = 52, th = 1.1 * t, P = [O[0] + rr * Math.cos(th), O[1] - rr * Math.sin(th)];
      setL(r('cr'), O, P); setC(r('pO'), O); setC(r('pP'), P);
      const yk = r('yk'); yk.setAttribute('x', f1(P[0] - 8)); const ry = r('rodY'); ry.setAttribute('x1', f1(P[0] + 8)); ry.setAttribute('x2', 380); ry.setAttribute('y1', 130); ry.setAttribute('y2', 130);
      setL(r('proj'), P, [P[0], 214]); setC(r('mk'), [P[0], 214]);
      setT(r('t1'), 'x = r·cos θ = ' + (rr * Math.cos(th) / 10).toFixed(1).replace('.', ',') + ' cm');
    }
  };

  /* ---------- proceso de autoevaluación / modelado (8.2) ---------- */
  scenes.procflow = {
    svg: () => { const st = ['Identifica los eslabones', 'Elige la bancada', 'Cuenta las uniones', 'Define el modelo', 'Calcula', 'Verifica y justifica']; let o = '';
      st.forEach((s, i) => { const x = 14 + (i % 3) * 128, y = 56 + Math.floor(i / 3) * 84; o += `<g data-k="s${i}"><rect x="${x}" y="${y}" width="116" height="62" rx="10" fill="${C.s}" stroke="${C.l}" stroke-width="2"/><circle cx="${x + 18}" cy="${y + 18}" r="11" fill="${C.a}"/><text x="${x + 18}" y="${y + 23}" font-size="13" font-weight="800" fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif">${i + 1}</text>${T(x + 58, y + 46, s, 11.5, C.k, 'middle', 600)}</g>`; });
      return wrap(`${T(14, 24, 'Antes de responder, recorre siempre estos pasos', 13, C.k, 'start', 700)}${o}${txt('t1', 14, 232, 12.5, C.m, 'start', 600)}`, 'Pasos para resolver un problema'); },
    upd(r, t) { const n = Math.floor((t % 13) / 2); for (let i = 0; i < 6; i++) { const g = r('s' + i), rc = g.querySelector('rect'); rc.setAttribute('stroke', i === n ? C.a : C.l); rc.setAttribute('stroke-width', i === n ? 4 : 2); g.setAttribute('opacity', i <= n ? 1 : 0.5); } setT(r('t1'), 'No saltes pasos: la respuesta correcta sale del procedimiento, no de la intuición.'); }
  };

  /* ---------- mapa entrada → salida (9.1) ---------- */
  scenes.iomap = {
    svg: () => { const cells = [['⟳ → ⟳', 'engranes · cadena · correa'], ['⟳ → ↔', 'piñón-cremallera · tornillo · leva'], ['↔ → ⟳', 'biela-manivela · trinquete'], ['↔ → ↔', 'palanca · cuña · hidráulico']]; let o = '';
      cells.forEach((c, i) => { const x = 110 + (i % 2) * 140, y = 58 + Math.floor(i / 2) * 82; o += `<g data-k="c${i}"><rect x="${x}" y="${y}" width="132" height="74" rx="10" fill="${C.s}" stroke="${C.l}" stroke-width="2"/>${T(x + 66, y + 30, c[0], 20, C.a, 'middle', 800)}${T(x + 66, y + 54, c[1], 10, C.m, 'middle', 600)}</g>`; });
      return wrap(`${T(14, 24, 'Entrada → salida: de qué tipo de movimiento a cuál', 13, C.k, 'start', 700)}${T(176, 50, 'sale: gira', 11.5, C.o, 'middle', 700)}${T(316, 50, 'sale: va y viene', 11.5, C.o, 'middle', 700)}${T(100, 100, 'entra:', 11.5, C.i, 'end', 700)}${T(100, 114, 'gira', 11.5, C.i, 'end', 700)}${T(100, 182, 'entra:', 11.5, C.i, 'end', 700)}${T(100, 196, 'va y viene', 11.5, C.i, 'end', 700)}${o}${txt('t1', 14, 232, 12.5, C.m, 'start', 600)}`, 'Mapa de transmisión y transformación'); },
    upd(r, t) { const n = Math.floor((t % 8) / 2); for (let i = 0; i < 4; i++) { const rc = r('c' + i).querySelector('rect'); rc.setAttribute('stroke', i === n ? C.a : C.l); rc.setAttribute('stroke-width', i === n ? 4 : 2); rc.setAttribute('fill', i === n ? C.a2 || C.s2 : C.s); } setT(r('t1'), n === 0 || n === 3 ? 'Transmisión: el movimiento conserva su tipo.' : 'Transformación: el movimiento cambia de tipo.'); }
  };

  /* ---------- contenido por lección ---------- */
  const DATA = {
    'l1-4': ['forcescale', 'Entre un engrane de reloj y una prensa industrial hay nueve órdenes de magnitud de fuerza (valores aproximados).', ['⌚ Engranes de un reloj', '🚗 Motor de auto', '🚜 Excavadora'], 'La cinemática estudia el movimiento sin sus causas; la dinámica incluye las fuerzas y momentos que lo producen.'],
    'l1-5': ['joints', 'Un estudio tipológico analiza los elementos, su forma y número, las uniones, los movimientos y las leyes que los rigen.', ['🔗 Cadena cinemática', '🧱 Eslabones', '📌 Pares inferiores y superiores'], 'Una cadena cinemática es solo eslabones y pares; se convierte en mecanismo cuando fijas una bancada y defines la entrada.'],
    'l1-6': ['chain', 'La ficha tipológica ordena todo lo que sabes de un mecanismo: practica con la cadena de una bicicleta.', ['📋 Ficha en 5 apartados', '⚖️ Leyes que se repiten', '🚲 Practica con la bicicleta'], 'La misma ley (por ejemplo, la conservación del trabajo) explica poleas, rampas, tornillos y gatos.'],
    'l9-1': ['functions', 'Dos criterios de clasificación: por tipología (cómo está hecho) y por función (qué hace con la entrada).', ['🧩 Tipología', '🎯 Función', '🔁 Transmisión o transformación'], 'Transmitir conserva el tipo de movimiento (lineal→lineal, circular→circular); transformar lo cambia.'],
    'l9-2': ['lever', 'Grupo 1: mecanismos que modifican la fuerza de entrada: balancín, poleas, polipasto y manivela.', ['⚖️ Balancín', '🏗️ Polipasto', '🔧 Manivela y llave'], 'Lo que ganas en fuerza lo pagas en recorrido: el trabajo se conserva.', { cls: 1 }],
    'l9-3': ['geartrain', 'Grupo 2: mecanismos que modifican la velocidad: fricción, poleas, engranajes, cadenas y sinfín.', ['🚲 Bicicleta', '🔩 Taladro', '⌚ Reloj'], 'Si reduces la velocidad ganas par; si la multiplicas pierdes par. La potencia es la misma (sin pérdidas).'],
    'l9-4': ['rackpinion', 'Grupo 3: mecanismos que modifican el movimiento: tornillo, cremallera, biela, leva y trinquete.', ['🚗 Dirección de cremallera', '🔧 Motor de pistones', '🚪 Portón de garaje'], 'Transformar el movimiento permite que un motor giratorio produzca movimientos de vaivén o lineales.'],
    'l9-5': ['brake', 'Grupo 4: frenos, acoplamientos y acumuladores de energía.', ['🚗 Frenos', '🦶 Embrague', '🪁 Suspensión'], 'Un freno no destruye la energía: la convierte en calor.'],
    'l1-1': ['scissor', 'Una plataforma de tijera: pocas barras articuladas convierten el avance de un cilindro en altura.', ['🏗️ Plataforma elevadora', '🚗 Gato de auto', '📦 Montacargas'], 'Una plataforma de tijera tiene un solo grado de libertad: con un único actuador controlas toda la altura.'],
    'l1-2': ['motion', 'Observa cómo cambian la velocidad y la aceleración mientras la bola va y viene.', ['🚗 Auto en carretera', '🎢 Montaña rusa', '🏃 Atleta'], 'En cinemática solo describimos el movimiento (posición, velocidad, aceleración); las fuerzas llegan después, en la dinámica.'],
    'l1-3': ['rigid', 'Traslación, rotación y su combinación: los movimientos de un cuerpo rígido plano.', ['🛗 Ascensor (traslación)', '🚪 Puerta (rotación)', '🛞 Rueda rodando (plano general)'], 'En un cuerpo rígido la distancia entre dos puntos cualesquiera nunca cambia: es un modelo ideal que simplifica el análisis.'],
    'l2-1': ['joints', 'El perno permite girar; la corredera, deslizar. Cada unión deja libre un movimiento relativo y bloquea el resto.', ['🚪 Bisagra', '🗄️ Cajón', '✂️ Tijeras'], 'Una unión de perno en el plano quita 2 grados de libertad y deja 1.'],
    'l2-2': ['joints', 'El contacto entre dos eslabones (el par cinemático) decide qué movimientos relativos son posibles.', ['🔩 Tornillo', '🪑 Silla giratoria', '🛤️ Riel y carro'], 'Los pares inferiores tienen contacto por superficie; los superiores, por línea o punto (como los dientes de un engrane o una leva).'],
    'l2-3': ['gears', 'Engranes en contacto: giran en sentidos opuestos y la relación de dientes fija la relación de velocidades.', ['⌚ Reloj', '🚗 Caja de cambios', '🔧 Taladro'], 'Si el engrane de entrada tiene la mitad de dientes, la salida gira a la mitad de velocidad, pero con el doble de torque.'],
    'l2-4': ['chain', 'Cadena y piñones: llevan la potencia entre ejes separados.', ['🚲 Bicicleta', '🏍️ Moto', '🏭 Transportadores'], 'En una bicicleta, un piñón trasero grande facilita subir cuestas y uno pequeño da más velocidad.'],
    'l2-5': ['cylinder', 'Un cilindro hidráulico empuja la pluma: el actuador mueve, el mecanismo guía.', ['🚜 Excavadora', '🏗️ Grúa', '🚛 Volquete'], 'Los cilindros hidráulicos dan fuerzas enormes en carreras lineales porque el aceite es casi incompresible.'],
    'l3-1': ['symbols', 'Del dibujo real al diagrama cinemático: solo queda lo esencial para estudiar el movimiento.', ['✏️ Esquemas de ingeniería', '🗺️ Planos', '🧩 Simplificar'], 'Por convención la bancada es el eslabón 1 y se dibuja con rayado.'],
    'l3-2': ['symbols', 'Cada pieza se reduce a barras, pernos y correderas siguiendo un procedimiento.', ['🧰 Mango y cuchilla', '🪛 Abrazadera', '✂️ Cortador'], 'Un buen diagrama conserva longitudes y tipos de unión, no la forma real de las piezas.'],
    'l3-3': ['symbols', 'Practica: cada ejemplo resuelto aplica el mismo procedimiento paso a paso.', ['📝 Paso a paso', '🔍 Identifica eslabones', '🔗 Cuenta las uniones'], 'Un perno compartido por k eslabones cuenta como k − 1 uniones.'],
    'l4-1': ['gruebler', 'Cuenta eslabones y uniones: la ecuación de Grübler dice cuántas entradas necesita un mecanismo.', ['🔢 Cuenta n y j', '🎛️ M = nº de entradas', '🧱 M = 0 → estructura'], 'Para mecanismos planos: M = 3(n − 1) − 2·jp − jh.'],
    'l4-2': ['arm', 'Un brazo abierto con tres articulaciones tiene M = 3: necesita tres motores.', ['🤖 Brazo robótico', '🦾 Prótesis', '🚜 Pluma de excavadora'], 'Más grados de libertad dan más flexibilidad, pero exigen más motores y más control.'],
    'l4-3': ['gruebler', 'Algunos casos especiales engañan a la ecuación: hay que mirar también la geometría.', ['📐 Geometría especial', '⚠️ Restricciones redundantes', '🔍 Verifica con el modelo'], 'Ciertos mecanismos de geometría especial se mueven aunque la fórmula dé M = 0.'],
    'l4-4': ['gruebler', 'Profundización: la fórmula es válida bajo ciertas hipótesis, que el Jacobiano permite comprobar.', ['📊 Jacobiano', '📏 Rango de las restricciones', '🧮 Álgebra lineal'], 'Con el Jacobiano de las restricciones, M = (número de coordenadas) − rango(J).'],
    'l5-1': ['inversion', 'Con las mismas barras, cambiar cuál es la bancada produce mecanismos distintos.', ['🔄 Cuatro inversiones', '🚪 Doble manivela', '⚖️ Doble balancín'], 'Una cadena de cuatro barras tiene cuatro inversiones: las relaciones internas no cambian, pero sí lo que observas desde la bancada.'],
    'l5-2': ['fourbar', 'Criterio de Grashof: si s + l ≤ p + q, al menos un eslabón puede girar completo.', ['⚙️ Manivela-balancín', '🚗 Limpiaparabrisas', '🧰 Pinzas'], 's es el eslabón más corto y l el más largo; p y q son los otros dos.', { label: 'grashof' }],
    'l5-3': ['fourbar', 'Análisis de posición: dado θ₂, el cierre del lazo da la posición del resto.', ['📐 Dos circunferencias', '🪞 Dos ramas', '⚠️ Posiciones singulares'], 'La intersección de dos circunferencias da dos soluciones: las dos «ramas» o configuraciones del mecanismo.', { label: 'theta' }],
    'l5-4': ['fourbar', 'Verifica tu cálculo: compara con la solución gráfica o numérica.', ['✅ Compara métodos', '📏 Mide ángulos', '💻 Usa software'], 'Un cálculo de posición se valida comprobando que las longitudes de los eslabones se conservan.', { label: 'theta' }],
    'l6-1': ['slider', 'Manivela-corredera: la manivela gira y el pistón va y viene; la gráfica muestra su posición.', ['🚗 Motor de combustión', '🪚 Sierra mecánica', '🧵 Máquina de coser'], 'En un motor de combustión el mecanismo trabaja al revés: el pistón empuja y el cigüeñal gira.'],
    'l6-2': ['slider', 'Posición, carrera y relación de tiempos de la manivela-corredera.', ['📏 Carrera = 2r', '⏱️ Descentrado = retorno rápido', '📈 Posición x(θ)'], 'Con la corredera alineada con el centro de giro, la carrera del pistón es exactamente 2r.'],
    'l6-3': ['cam', 'Una leva convierte un giro continuo en subida y bajada con la ley de movimiento que diseñes.', ['🚗 Árbol de levas', '🧵 Máquinas automáticas', '🎠 Autómatas y juguetes'], 'Leva y seguidor forman un par superior: el contacto es por línea o por punto.'],
    'l6-4': ['cam', 'Demostraciones: observa en la gráfica el desplazamiento del seguidor mientras gira la leva.', ['📈 Desplazamiento', '🔁 Movimiento periódico', '🧪 Prueba y observa'], 'El perfil de la leva define el desplazamiento del seguidor para cada ángulo.'],
    'l7-1': ['methods', 'Cuatro técnicas de análisis: gráfica, analítica, numérica y con software.', ['📐 Gráfica', '∑ Analítica', '🔢 Numérica', '💻 Software'], 'Ninguna es «la mejor»: se combinan para verificar los resultados.'],
    'l7-2': ['methods', 'El mismo problema resuelto con tres métodos: compara su error.', ['⚖️ Compara', '📉 Mide el error', '🧪 Verifica'], 'Comparar con una solución numérica de doble precisión permite medir el error de los otros métodos.'],
    'l8-1': ['checklist', 'Reto de síntesis: de la necesidad al mecanismo documentado.', ['🎯 Define el movimiento', '🧪 Prueba el diseño', '📝 Memoria técnica'], 'Una memoria técnica documenta decisiones y verificaciones, no solo el resultado.'],
    'l8-2': ['checklist', 'Autoevaluación: aprende de cada respuesta con su retroalimentación.', ['✅ Retroalimentación razonada', '🔁 Repite', '📈 Revisa tu progreso'], 'Equivocarse en una autoevaluación es útil: la retroalimentación explica el porqué.']
  };

  const CLIPS = {
    'l1-1': { title: '¿Qué es un mecanismo?', dur: 24, scene: 'fourbar', opts: { reveal: [2, 6, 10], startAt: 14 }, caps: [[0, 'Todo mecanismo parte de una pieza que no se mueve: la bancada.'], [2, 'Añadimos la manivela: recibe el giro del motor (entrada).'], [6, 'El acoplador conecta la entrada con la salida.'], [10, 'El balancín es la salida: oscila de un lado a otro.'], [14, 'Un giro continuo se convierte en un vaivén. ¡Eso es un mecanismo! La curva punteada es la trayectoria de un punto del acoplador.']] },
    'l1-4': { title: 'Momento = fuerza × brazo', dur: 16, scene: 'wrench', caps: [[0, 'Una llave aprieta una tuerca con un momento M = F · d.'], [4, 'Con el brazo corto hace falta mucha fuerza.'], [9, 'Con el brazo largo basta poca fuerza para el mismo momento.'], [13, 'Por eso la palanca y la manivela son los mecanismos más simples para ganar fuerza.']] },
    'l9-2': { title: 'Polea móvil: la mitad de fuerza, el doble de cuerda', dur: 16, scene: 'pulley', caps: [[0, 'La carga cuelga de una polea móvil sostenida por dos tramos de cuerda.'], [5, 'Cada tramo soporta la mitad del peso: F = R / 2.'], [10, 'Pero para subir la carga 1 m debes jalar 2 m de cuerda: lo que ganas en fuerza lo pagas en recorrido.']] },
    'l9-5': { title: 'El embrague acopla y desacopla ejes', dur: 24, scene: 'clutch', caps: [[0, 'El eje motor gira siempre; el eje conducido está desacoplado y parado.'], [9, 'Al acercar los discos aparece el rozamiento: el eje conducido empieza a girar.'], [16, 'Acoplado: ambos ejes giran a la misma velocidad.'], [21, 'Al soltar, el eje conducido se va frenando solo.']] },
    'l2-3': { title: 'Engranes: velocidad o fuerza', dur: 24, scene: 'gears', caps: [[0, 'Dos engranes en contacto: el pequeño (10 dientes) mueve al grande (20).'], [6, 'Cada diente que empuja avanza un diente del otro: giran en sentidos opuestos.'], [12, 'Relación 2 : 1 → la salida gira a la mitad de velocidad (60 rpm).'], [18, '…pero entrega el doble de torque. Lo que ganas en fuerza lo pierdes en velocidad.']] },
    'l4-1': { title: 'Cuenta y calcula los grados de libertad', dur: 25.6, scene: 'gruebler', caps: [[0, 'Cuenta los eslabones (n), incluida la bancada, y los pernos (j).'], [6.4, 'Aplica M = 3(n − 1) − 2j.'], [12.8, 'Si M es 1, una sola entrada define el movimiento.'], [19.2, 'Si M es 0, no hay movimiento: es una estructura.']] },
    'l5-1': { title: 'Inversión cinemática', dur: 16, scene: 'inversion', caps: [[0, 'Fija un eslabón distinto cada vez: las barras son las mismas.'], [4, 'Cambia la bancada y cambia el comportamiento que observas.'], [8, 'Dependiendo de cuál fijes, obtienes manivela-balancín, doble manivela o doble balancín.'], [12, 'Cuatro bancadas posibles = cuatro inversiones.']] },
    'l6-1': { title: 'De girar a empujar', dur: 24, scene: 'slider', opts: {}, caps: [[0, 'La manivela gira con velocidad constante.'], [6, 'La biela empuja al pistón: la rotación se convierte en traslación.'], [12, 'La gráfica muestra la posición del pistón en cada ángulo.'], [18, 'Carrera = 2r: el pistón recorre el doble del radio de la manivela.']] }
  };

  /* ---------- ciclo de animación de las ilustraciones ---------- */
  const live = [];
  const vis = new IntersectionObserver(es => es.forEach(e => { e.target._vz.vis = e.isIntersecting; }));
  function mount(host, name, opts) {
    const sc = scenes[name]; host.innerHTML = sc.svg(); const svg = host.querySelector('svg'), r = R(svg);
    const inst = { sc, r, opts: opts || {}, vis: false, t: 0, ctx: Object.create(sc) };
    svg._vz = inst; vis.observe(svg); live.push(inst); inst.ctx.upd(r, 1, inst.opts); // primer fotograma (también con animaciones pausadas)
    return inst;
  }
  let last = performance.now();
  (function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const paused = typeof state !== 'undefined' && state.paused;
    if (!paused) live.forEach(i => { if (i.vis && !i.manual) { i.t += dt; i.ctx.upd(i.r, i.t + 1, i.opts); } });
    requestAnimationFrame(tick);
  })(last);

  /* ---------- banners ---------- */
  const lessons = [...document.querySelectorAll('article.lesson')];
  lessons.forEach(l => {
    const d = DATA[l.id]; if (!d) return;
    const head = l.querySelector('.lesson-head'); const sec = document.createElement('section'); sec.className = 'vz-banner';
    sec.innerHTML = `<figure class="vz-fig"><div class="vz-host"></div><figcaption>${d[1]}</figcaption></figure><div class="vz-side"><h4>En la vida real</h4><ul class="vz-chips">${d[2].map(c => `<li>${c}</li>`).join('')}</ul><p class="vz-fact"><b>¿Sabías que…?</b> ${d[3]}</p></div>`;
    (head ? head.after(sec) : l.prepend(sec));
    mount(sec.querySelector('.vz-host'), d[0], d[4]);
  });

  document.querySelectorAll('[data-scene]').forEach(h => { if (!scenes[h.dataset.scene]) return; let o = {}; try { o = JSON.parse(h.dataset.opts || '{}'); } catch (e) { o = {}; } mount(h, h.dataset.scene, o); });

  /* ---------- imágenes ilustrativas (generadas con IA, carpeta img/) ---------- */
  const PHOTOS = {
    'l5-2': [['limpiaparabrisas', 'Limpiaparabrisas: mecanismo de cuatro barras (manivela-balancín)']],
    'l9-5': [['freno-disco', 'Freno de disco: fricción entre pastillas y disco'], ['suspension', 'Suspensión: resorte helicoidal + amortiguador']],
    'l9-2': [['gato-tijera', 'Gato de tijera: tornillo + palanca multiplican la fuerza'], ['grua-polea', 'Polipasto: poleas múltiples reducen el esfuerzo'], ['subibaja', 'Subibaja: palanca de primer género']],
    'l1-4': [['motor', 'Motor de automóvil: una máquina que transforma energía; contiene varios mecanismos'], ['excavadora', 'Excavadora: máquina que realiza una función útil (excavar); su brazo es un mecanismo'], ['reloj', 'Reloj mecánico: sus engranes son un mecanismo que transmite y regula el movimiento']],
    'l1-6': [['gato-tijera', 'Gato de tijera: el modelo de la ficha tipológica'], ['bicicleta', 'Bicicleta: el sistema pedal-cadena-rueda de la ficha de práctica']],
    'l2-3': [['reloj', 'Los engranes de un reloj: relaciones de transmisión muy grandes'], ['engranes', 'Engranes rectos de ejes paralelos: piñón conductor, intermedio y conducido']],
    'l2-4': [['bicicleta', 'Plato, cadena y piñones de una bicicleta']],
    'l2-5': [['excavadora', 'Los cilindros hidráulicos mueven la pluma, el brazo y la cuchara']],
    'l4-2': [['excavadora', 'Cadena cinemática abierta: pluma, brazo y cuchara, cada uno con su actuador']],
    'l6-1': [['motor', 'Motor: pistón, biela y cigüeñal (manivela-corredera)']],
    'l9-3': [['bicicleta', 'Cadena y catarinas: cambian velocidad y par'], ['reloj', 'Reloj: trenes de engranes reductores'], ['engranes', 'Tren de engranes: cambia velocidad y par']],
    'l9-4': [['motor', 'Pistón-biela-cigüeñal: movimiento lineal ↔ giro'], ['cremallera-direccion', 'Dirección piñón-cremallera: giro ↔ movimiento lineal'], ['arbol-levas', 'Árbol de levas: la leva y el seguidor abren las válvulas']]
  };
  Object.keys(PHOTOS).forEach(id => {
    const l = document.getElementById(id); if (!l) return;
    const box = document.createElement('div'); box.className = 'vz-photos';
    box.innerHTML = PHOTOS[id].map(p => `<figure><a href="img/${p[0]}.jpg" target="_blank" rel="noopener" title="Ver en grande"><img src="img/${p[0]}.jpg" alt="${p[1]}" loading="lazy" width="600" height="450"></a><figcaption>${p[1]}</figcaption></figure>`).join('');
    const anchor = l.querySelector('.vz-banner'); anchor ? anchor.after(box) : l.prepend(box);
  });

  /* ---------- mini-videos ---------- */
  const fmtT = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  Object.keys(CLIPS).forEach(id => {
    const l = document.getElementById(id), cfg = CLIPS[id]; if (!l) return;
    const box = document.createElement('section'); box.className = 'vz-clip';
    box.innerHTML = `<div class="vz-clip-title">🎬 ${cfg.title}<span>mini-video · ${fmtT(cfg.dur)}</span></div><div class="vz-stage"><div class="vz-host"></div><div class="vz-big"><i>▶</i></div></div><div class="vz-sub" aria-live="polite"></div><div class="vz-ctl"><button type="button" data-play aria-label="Reproducir">▶</button><button type="button" data-rew aria-label="Reiniciar">↺</button><input type="range" min="0" max="1000" value="0" aria-label="Posición del video"><time>0:00 / ${fmtT(cfg.dur)}</time></div>`;
    const anchor = l.querySelector('.vz-banner'); anchor ? anchor.after(box) : l.prepend(box);
    const inst = mount(box.querySelector('.vz-host'), cfg.scene, cfg.opts); inst.manual = true;
    const range = box.querySelector('input'), tm = box.querySelector('time'), sub = box.querySelector('.vz-sub'), pb = box.querySelector('[data-play]');
    let t = 0, playing = false, lastTs = 0;
    const draw = () => { inst.ctx.upd(inst.r, t + 0.001, Object.assign({}, cfg.opts)); range.value = t / cfg.dur * 1000; tm.textContent = fmtT(t) + ' / ' + fmtT(cfg.dur); const c = cfg.caps.filter(x => x[0] <= t).pop(); sub.textContent = c ? c[1] : ''; };
    const setPlay = p => { playing = p; box.classList.toggle('playing', p); pb.textContent = p ? '⏸' : '▶'; pb.setAttribute('aria-label', p ? 'Pausar' : 'Reproducir'); if (p) { if (t >= cfg.dur) t = 0; lastTs = performance.now(); requestAnimationFrame(step); } };
    function step(now) { if (!playing) return; t += Math.min(0.1, (now - lastTs) / 1000); lastTs = now; if (t >= cfg.dur) { t = cfg.dur; draw(); setPlay(false); return; } draw(); requestAnimationFrame(step); }
    pb.onclick = () => setPlay(!playing);
    box.querySelector('.vz-stage').onclick = () => setPlay(!playing);
    box.querySelector('[data-rew]').onclick = () => { t = 0; draw(); setPlay(true); };
    range.oninput = () => { t = range.value / 1000 * cfg.dur; draw(); };
    draw();
  });

  /* ---------- texto plegable ("Leer más") ---------- */
  const skip = 'details,table,figure,.def,.worked,.check,.mini,.try,.note,.panel,.card,.memo,.row-btns,.vz-banner,.vz-clip';
  lessons.forEach(l => {
    l.querySelectorAll('.prose, .prose.wide').forEach(box => {
      if (box.closest(skip.replace('.card,', ''))) return;
      let run = [];
      const flush = () => {
        if (run.length >= 2) { // conserva el primer párrafo; pliega el resto de la serie si es largo
          const rest = run.slice(1), len = rest.reduce((n, p) => n + p.textContent.length, 0);
          if (len > 260) { const det = document.createElement('details'); det.className = 'more'; det.innerHTML = '<summary><span class="lbl">Leer más</span><span class="lbl-close">Ocultar detalle</span></summary>'; rest[0].before(det); rest.forEach(p => det.appendChild(p)); }
        }
        run = [];
      };
      [...box.children].forEach(ch => { if (ch.tagName === 'P' && !ch.closest('details')) run.push(ch); else flush(); });
      flush();
    });
  });
  // botón global para abrir/cerrar todo el texto plegado
  const pause = document.getElementById('pause');
  if (pause) {
    const b = document.createElement('button'); b.className = 'btn small'; b.id = 'more-all'; b.type = 'button'; b.textContent = '📖 Texto: resumen'; b.title = 'Mostrar u ocultar los párrafos de detalle';
    let open = false; b.onclick = () => { open = !open; document.querySelectorAll('details.more').forEach(d => { d.open = open; }); b.textContent = open ? '📖 Texto: completo' : '📖 Texto: resumen'; };
    pause.before(b);
  }
})();
