/* Mecanismos Vivos — Módulo 10: simulador cinemático del motor bicilíndrico */
'use strict';

(function motor() {
  const cv = $('#cv-motor');
  if (!cv) return;
  const S = makeCanvas(cv, 900, 520);
  const cg = $('#cv-motor-gears'), G = makeCanvas(cg, 900, 300);
  const cp = $('#cv-motor-plot'), PL = makeCanvas(cp, 900, 270);

  const ctl = mkControls($('#ctl-motor'), [
    { id: 'w', label: 'Velocidad del cigüeñal (ω)', min: 20, max: 360, step: 10, val: 120, unit: ' °/s', dec: 0 },
    { id: 'r', label: 'Radio de la manivela (r)', min: 3, max: 7, step: 0.5, val: 5, unit: ' mm' },
    { id: 'l', label: 'Longitud de la biela (l)', min: 14, max: 26, step: 1, val: 20, unit: ' mm', dec: 0 },
    { id: 'zc', label: 'Dientes del engrane del cigüeñal', min: 10, max: 60, step: 1, val: 34, dec: 0 },
    { id: 'zk', label: 'Dientes del engrane del árbol de levas', min: 10, max: 60, step: 1, val: 20, dec: 0 },
    { id: 'H', label: 'Alzada de la leva', min: 0.5, max: 3, step: 0.1, val: 2, unit: ' mm' }
  ], () => { recompute(); draw(); });

  const K = 5.5;                 // px por mm
  const ARM = 70;                // brazos del balancín (px) — relación 1:1
  const RB = 22;                 // radio base de la leva (px)
  const BETA = rad(50);          // semiancho del lóbulo
  const PHASE = [rad(40), rad(150)]; // posición angular de cada lóbulo en el árbol de levas
  const wrapPi = a => { a %= TAU; if (a > Math.PI) a -= TAU; if (a < -Math.PI) a += TAU; return a; };
  const lobe = phi => { phi = wrapPi(phi); if (Math.abs(phi) >= BETA) return 0; const c = (1 + Math.cos(Math.PI * phi / BETA)) / 2; return c * c; };

  let th = 0, data = null, mode = { body: 'piston', q: 'pos' };

  /* ---- modelo cinemático (th = ángulo del cigüeñal) ---- */
  function pos(i, th, P) {
    const t = th + i * Math.PI;                               // cigüeñal a 180° entre cilindros
    const y = P.r * Math.cos(t) + Math.sqrt(P.l * P.l - (P.r * Math.sin(t)) ** 2);
    const psi = -(P.zc / P.zk) * th + PHASE[i];               // el árbol de levas gira en sentido opuesto
    const lift = P.H * lobe(psi);
    const alpha = Math.asin(Math.min(1, lift * K / ARM));     // giro del balancín
    return { t, y, psi, lift, alpha };
  }
  const val = (i, th, P, body) => { const s = pos(i, th, P); return body === 'piston' ? s.y : body === 'valve' ? s.lift : deg(s.alpha); };

  function recompute() {
    const P = ctl.vals, N = 720, h = rad(0.05), w = rad(P.w);
    const ser = [[], []]; let mn = Infinity, mx = -Infinity;
    for (let i = 0; i < 2; i++) {
      for (let k = 0; k <= N; k++) {
        const a = k / N * 2 * TAU;
        let v;
        if (mode.q === 'pos') v = val(i, a, P, mode.body);
        else if (mode.q === 'vel') v = (val(i, a + h, P, mode.body) - val(i, a - h, P, mode.body)) / (2 * h) * w;
        else v = (val(i, a + h, P, mode.body) - 2 * val(i, a, P, mode.body) + val(i, a - h, P, mode.body)) / (h * h) * w * w;
        ser[i].push(v); if (v < mn) mn = v; if (v > mx) mx = v;
      }
    }
    if (mx - mn < 1e-9) { mx += 1; mn -= 1; }
    data = { ser, mn, mx };
  }

  /* ---- dibujo del motor ---- */
  function gearPath(ctx, cx, cy, z, M, ang) {
    const R = z * M / 2, add = M, ded = 1.25 * M, p = Math.PI / z;
    ctx.beginPath();
    for (let k = 0; k < z; k++) {
      const c = ang + 2 * p * k;
      [[-1, R - ded], [-.55, R - ded], [-.3, R + add], [.3, R + add], [.55, R - ded]].forEach(([f, r], j) => {
        const a = c + f * p, x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
        (k === 0 && j === 0) ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
    }
    ctx.closePath();
  }

  function drawCyl(ctx, C, ox, i, P) {
    const s = pos(i, th, P);
    const O = { x: ox + 235, y: 450 }, Cc = { x: ox + 105, y: 440 };
    const seat = 450 - (P.r + P.l) * K - 46, pv = { x: ox + 175, y: seat - 125 }, vx = ox + 245;
    const A = { x: O.x - P.r * K * Math.sin(s.t), y: O.y - P.r * K * Math.cos(s.t) };
    const B = { x: O.x, y: O.y - s.y * K };
    const sa = Math.sin(s.alpha), ca = Math.cos(s.alpha);
    const L = { x: pv.x - ARM * ca, y: pv.y - ARM * sa }, Rr = { x: pv.x + ARM * ca, y: pv.y + ARM * sa };
    const liftPx = Rr.y - pv.y;                               // la válvula baja lo mismo que el extremo del balancín

    // bloque y culata
    ctx.strokeStyle = C.ground; ctx.lineWidth = 5; ctx.lineCap = 'butt';
    [-37, 37].forEach(d => { ctx.beginPath(); ctx.moveTo(O.x + d, seat); ctx.lineTo(O.x + d, 412); ctx.stroke(); });
    ctx.fillStyle = C.ground; ctx.globalAlpha = .28; ctx.fillRect(ox + 150, seat - 36, 175, 36); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.ground; ctx.lineWidth = 3; ctx.strokeRect(ox + 150, seat - 36, 175, 36);
    ctx.beginPath(); ctx.moveTo(pv.x, pv.y); ctx.lineTo(pv.x, seat - 36); ctx.stroke();      // apoyo del eje de balancines
    groundMark(ctx, O, C, 40); groundMark(ctx, Cc, C, 40);

    // pistón y biela
    ctx.fillStyle = C.output; ctx.fillRect(B.x - 33, B.y - 24, 66, 42);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(B.x - 33, B.y - 24, 66, 42);
    ctx.lineWidth = 1.5; [-16, -8].forEach(d => { ctx.beginPath(); ctx.moveTo(B.x - 33, B.y + d); ctx.lineTo(B.x + 33, B.y + d); ctx.stroke(); });
    ctx.strokeStyle = C.input; ctx.globalAlpha = .3; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(O.x, O.y, P.r * K, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    bar(ctx, A, B, C.coupler, 9); bar(ctx, O, A, C.input, 11);
    pin(ctx, O, C, 8, true); pin(ctx, A, C); pin(ctx, B, C, 6);

    // leva (perfil con un lóbulo) y empujador
    ctx.beginPath();
    for (let k = 0; k < 120; k++) {
      const phi = k / 120 * TAU - Math.PI, rho = RB + P.H * K * lobe(phi);
      const a = phi + s.psi, x = Cc.x - rho * Math.sin(a), y = Cc.y - rho * Math.cos(a);
      k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.fillStyle = C.soft; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
    pin(ctx, Cc, C, 5, true);
    const top = { x: Cc.x, y: Cc.y - RB - s.lift * K };
    ctx.fillStyle = C.coupler; ctx.fillRect(top.x - 3, L.y, 6, top.y - L.y);                // empujador
    ctx.fillStyle = C.ink; ctx.fillRect(top.x - 9, top.y - 2, 18, 4);

    // balancín
    bar(ctx, L, Rr, C.coupler, 10); pin(ctx, pv, C, 7, true); pin(ctx, L, C, 4); pin(ctx, Rr, C, 4);

    // válvula y resorte
    const vy = seat + liftPx;
    ctx.fillStyle = C.output; ctx.fillRect(vx - 3, Rr.y, 6, vy - Rr.y);
    ctx.fillRect(vx - 17, vy - 3, 34, 7); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(vx - 17, vy - 3, 34, 7);
    const ret = Rr.y + 26, bot = seat - 36;
    ctx.fillStyle = C.ink; ctx.fillRect(vx - 10, ret - 2, 20, 4);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(vx, ret);
    for (let k = 1; k <= 8; k++) ctx.lineTo(vx + (k % 2 ? 9 : -9), ret + (bot - ret) * k / 8);
    ctx.stroke();

    // etiquetas
    text(ctx, i === 0 ? 'Cilindro 1 · θ' : 'Cilindro 2 · θ + 180°', ox + 225, 20, C, { size: 17 });
    if (i === 0) {
      const lb = (s, x, y, al) => text(ctx, s, x, y, C, { size: 14, color: C.muted, align: al || 'center', weight: 600 });
      lb('pistón', B.x + 40, B.y - 8, 'left'); lb('biela', A.x + 18, (A.y + B.y) / 2, 'left'); lb('cigüeñal', O.x + 44, O.y + 14, 'left');
      lb('árbol de levas', Cc.x - 6, Cc.y + 46); lb('empujador', top.x - 12, (L.y + top.y) / 2, 'right');
      lb('balancín', pv.x, pv.y - 22); lb('válvula', vx + 22, vy - 20, 'left'); lb('resorte', vx + 18, (ret + bot) / 2, 'left');
    }
    return s;
  }

  function drawGears(C) {
    const P = ctl.vals, g = G.ctx, { W, H } = G;
    g.clearRect(0, 0, W, H);
    const z1 = P.zc, z2 = P.zk, M = Math.min(6, 640 / (z1 + z2), 250 / Math.max(z1, z2));
    const R1 = z1 * M / 2, R2 = z2 * M / 2, x1 = (W - (R1 + R2)) / 2, x2 = x1 + R1 + R2, cy = H / 2 + 4;
    const a1 = th, a2 = Math.PI + Math.PI / z2 - th * z1 / z2;
    gearPath(g, x1, cy, z1, M, a1); g.fillStyle = C.input; g.globalAlpha = .75; g.fill(); g.globalAlpha = 1; g.strokeStyle = C.ink; g.lineWidth = 2; g.stroke();
    gearPath(g, x2, cy, z2, M, a2); g.fillStyle = C.soft; g.fill(); g.stroke();
    [[x1, a1], [x2, a2]].forEach(([x, a], k) => {
      const r = (k ? R2 : R1) * 0.7; g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(x, cy); g.lineTo(x + r * Math.cos(a), cy - r * Math.sin(a)); g.stroke(); pin(g, { x, y: cy }, C, 6, true);
    });
    text(g, `Cigüeñal · Z = ${z1}`, x1, 22, C, { size: 14 }); text(g, `Árbol de levas · Z = ${z2}`, x2, 22, C, { size: 14 });
    text(g, `↺ ${fmt(P.w, 0)} °/s`, x1, H - 18, C, { size: 14, color: C.accent });
    text(g, `↻ ${fmt(P.w * z1 / z2, 0)} °/s`, x2, H - 18, C, { size: 14, color: C.accent });
    text(g, `ω levas / ω cigüeñal = Zc / Zk = ${z1}/${z2} = ${fmt(z1 / z2, 3)}`, 20, 22, C, { align: 'left', size: 13, color: C.muted, weight: 500 });
  }

  const UN = { pos: { piston: 'mm', valve: 'mm', rocker: '°' }, vel: { piston: 'mm/s', valve: 'mm/s', rocker: '°/s' }, acc: { piston: 'mm/s²', valve: 'mm/s²', rocker: '°/s²' } };
  const NM = { pos: 'Posición', vel: 'Velocidad', acc: 'Aceleración' }, BN = { piston: 'pistones', valve: 'válvulas', rocker: 'balancines' };
  const nice = v => { const a = Math.abs(v); return a >= 100 ? fmt(v, 0) : a >= 10 ? fmt(v, 1) : fmt(v, 2); };

  function drawPlot(C) {
    const g = PL.ctx, { W, H } = PL; g.clearRect(0, 0, W, H);
    if (!data) return;
    const m = { l: 64, r: 16, t: 34, b: 34 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const pad = (data.mx - data.mn) * 0.08, lo = data.mn - pad, hi = data.mx + pad;
    const X = a => m.l + a / (2 * TAU) * pw, Y = v => m.t + (hi - v) / (hi - lo) * ph;
    g.strokeStyle = C.line; g.lineWidth = 1; g.font = '12px system-ui,sans-serif';
    for (let k = 0; k <= 4; k++) { const x = X(k * Math.PI); g.beginPath(); g.moveTo(x, m.t); g.lineTo(x, m.t + ph); g.stroke(); text(g, `${k * 180}°`, x, H - 14, C, { size: 12, color: C.muted, weight: 500 }); }
    for (let k = 0; k <= 4; k++) { const v = lo + (hi - lo) * k / 4, y = Y(v); g.beginPath(); g.moveTo(m.l, y); g.lineTo(m.l + pw, y); g.stroke(); text(g, nice(v), m.l - 8, y, C, { size: 12, color: C.muted, align: 'right', weight: 500 }); }
    if (lo < 0 && hi > 0) { g.strokeStyle = C.muted; g.lineWidth = 1.5; g.beginPath(); g.moveTo(m.l, Y(0)); g.lineTo(m.l + pw, Y(0)); g.stroke(); }
    [[0, C.input], [1, C.output]].forEach(([i, col]) => {
      g.strokeStyle = col; g.lineWidth = 2.5; g.beginPath();
      data.ser[i].forEach((v, k) => { const x = X(k / 720 * 2 * TAU), y = Y(v); k ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
    });
    const xm = X(th % (2 * TAU)); g.strokeStyle = C.accent; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(xm, m.t); g.lineTo(xm, m.t + ph); g.stroke(); g.setLineDash([]);
    const sw = mode.body === 'piston' ? ['Pistón 1', 'Pistón 2'] : mode.body === 'valve' ? ['Válvula 1', 'Válvula 2'] : ['Balancín 1', 'Balancín 2'];
    text(g, `${NM[mode.q]} de los ${BN[mode.body]} (${UN[mode.q][mode.body]}) frente al ángulo del cigüeñal (2 vueltas)`, m.l, 14, C, { align: 'left', size: 14 });
    g.fillStyle = C.input; g.fillRect(W - 220, 8, 14, 4); g.fillStyle = C.output; g.fillRect(W - 110, 8, 14, 4);
    text(g, sw[0], W - 202, 10, C, { align: 'left', size: 12, weight: 500 }); text(g, sw[1], W - 92, 10, C, { align: 'left', size: 12, weight: 500 });
  }

  let tOut = 0;
  function draw() {
    const P = ctl.vals, C = colors(), { ctx, W, H } = S;
    ctx.clearRect(0, 0, W, H);
    const s0 = drawCyl(ctx, C, 0, 0, P), s1 = drawCyl(ctx, C, 450, 1, P);
    ctx.setLineDash([6, 5]); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(450, 40); ctx.lineTo(450, H - 10); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, `θ = ${fmt(deg(th) % 360, 0)}° (cigüeñal)  ·  levas = ${fmt(((deg(-(P.zc / P.zk) * th) % 360) + 360) % 360, 0)}°`, W / 2, H - 14, C, { size: 13, color: C.muted, weight: 500 });
    drawGears(C); drawPlot(C);
    const now = performance.now();
    if (now - tOut > 90) {
      tOut = now; const w = rad(P.w), r = P.r, l = P.l, lam = r / l, t = s0.t;
      const v = -r * w * (Math.sin(t) + lam / 2 * Math.sin(2 * t)), a = -r * w * w * (Math.cos(t) + lam * Math.cos(2 * t));
      $('#motor-out').innerHTML =
        `<b>Pistón 1:</b> y = ${fmt(s0.y, 2)} mm · v ≈ ${fmt(v, 2)} mm/s · a ≈ ${fmt(a, 2)} mm/s²<br>` +
        `<b>Carrera:</b> 2r = ${fmt(2 * r, 1)} mm · <b>λ = r/l</b> = ${fmt(lam, 3)} · v<sub>máx</sub> ≈ rω = ${fmt(r * w, 2)} mm/s<br>` +
        `<b>Válvula 1:</b> alzada ${fmt(s0.lift, 2)} mm · balancín ${fmt(deg(s0.alpha), 1)}° &nbsp;|&nbsp; <b>Válvula 2:</b> alzada ${fmt(s1.lift, 2)} mm<br>` +
        `<b>Árbol de levas:</b> ${fmt(P.w * P.zc / P.zk, 0)} °/s (${P.zc / P.zk > 0.75 && P.zc / P.zk < 1.25 ? 'casi igual' : P.zc / P.zk > 1 ? 'más rápido' : 'más lento'} que el cigüeñal, sentido opuesto)`;
    }
  }

  /* ---- botones de variable y de elemento ---- */
  function btns(host, items, key) {
    const wrap = $(host);
    items.forEach(([id, label]) => {
      const b = document.createElement('button'); b.className = 'btn small ghost'; b.textContent = label; b.setAttribute('aria-pressed', mode[key] === id);
      b.onclick = () => { mode[key] = id; [...wrap.children].forEach(x => x.setAttribute('aria-pressed', x === b)); recompute(); draw(); };
      wrap.appendChild(b);
    });
  }
  btns('#motor-body', [['piston', 'Pistones'], ['valve', 'Válvulas'], ['rocker', 'Balancines']], 'body');
  btns('#motor-q', [['pos', 'Posición'], ['vel', 'Velocidad'], ['acc', 'Aceleración']], 'q');
  const presets = $('#motor-presets');
  [['Modelo medido (≈ 1,72)', 34, 20], ['Cuatro tiempos real (0,5)', 20, 40], ['Relación 1 : 1', 20, 20]].forEach(([n, a, b]) => {
    const x = document.createElement('button'); x.className = 'btn small'; x.textContent = n; x.onclick = () => ctl.set({ zc: a, zk: b }); presets.appendChild(x);
  });

  recompute(); draw();
  /* la animación corre mientras la lección esté en pantalla (simulador, engranes y gráfica a la vez) */
  const d = { vis: false, tick: dt => { th += rad(ctl.vals.w) * dt; draw(); } };
  demos.push(d);
  new IntersectionObserver(es => es.forEach(e => { d.vis = e.isIntersecting; })).observe(cv.closest('article.lesson') || cv);
})();
