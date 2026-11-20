/* Mecanismos Vivos — diagramas cinemáticos de los ejemplos resueltos (módulo 3, lección 3.3) */
'use strict';

(function exampleDiagrams() {
  const P = (x, y) => ({ x, y });
  const letter = (g, C, s, x, y) => text(g, s, x, y, C, { size: 15, color: C.accent });
  const slider = (g, C, at, ang, w = 44, h = 28) => {
    g.save(); g.translate(at.x, at.y); g.rotate(ang);
    g.fillStyle = C.surface; g.fillRect(-w / 2, -h / 2, w, h); g.lineWidth = 2.5; g.strokeStyle = C.ink; g.strokeRect(-w / 2, -h / 2, w, h); g.restore();
  };
  const dashed = (g, C, a, b) => { g.setLineDash([6, 5]); g.strokeStyle = C.muted; g.lineWidth = 2; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.setLineDash([]); };
  const mk = (id, draw) => {
    const el = document.getElementById(id); if (!el) return;
    const { ctx, W, H } = makeCanvas(el, 600, 380);
    addStatic(() => { const C = colors(); ctx.clearRect(0, 0, W, H); draw(ctx, C); });
  };

  /* A · prensa de corte: 3 pernos + 1 corredera */
  mk('cv-exA', (g, C) => {
    const A = P(130, 120), X = P(430, 80), B = P(225, 107), Cc = P(195, 250);
    dashed(g, C, P(195, 160), P(195, 350));
    bar(g, A, X, C.input, 9); bar(g, B, Cc, C.coupler, 8); slider(g, C, Cc, Math.PI / 2, 46, 34);
    groundMark(g, A, C); [A, B, Cc].forEach(p => pin(g, p, C, 6, p === A));
    tag(g, 2, 300, 78, C, C.input); tag(g, 4, 222, 180, C, C.coupler); tag(g, 3, 150, 250, C, C.output); tag(g, 1, 90, 160, C, C.ground);
    letter(g, C, 'A', A.x - 16, A.y - 16); letter(g, C, 'B', B.x + 4, B.y - 18); letter(g, C, 'C', Cc.x + 38, Cc.y - 16); letter(g, C, 'D', 232, 290);
    g.beginPath(); g.arc(X.x, X.y, 6, 0, TAU); g.fillStyle = C.accent; g.fill(); letter(g, C, 'X', X.x + 14, X.y - 12);
    text(g, 'M = 3(4 − 1) − 2(4) = 1', 450, 330, C, { size: 15, color: C.muted });
  });

  /* B · pinzas: 4 eslabones, 4 pernos, bancada arbitraria */
  mk('cv-exB', (g, C) => {
    const J1 = P(70, 150), D = P(210, 155), A = P(265, 215), H1 = P(480, 190), H2 = P(500, 320), B = P(185, 270), Cc = P(150, 195), J3 = P(60, 215);
    bar(g, J1, D, C.ground, 8); bar(g, D, A, C.ground, 8); bar(g, A, H1, C.ground, 8);
    bar(g, H2, A, C.input, 8); bar(g, A, B, C.input, 8);
    bar(g, B, Cc, C.output, 8); bar(g, Cc, J3, C.output, 8);
    bar(g, Cc, D, C.coupler, 8);
    groundMark(g, D, C, 30); groundMark(g, A, C, 30);
    [A, B, Cc, D].forEach(p => pin(g, p, C, 6));
    tag(g, 1, 140, 130, C, C.ground); tag(g, 2, 380, 270, C, C.input); tag(g, 3, 105, 240, C, C.output); tag(g, 4, 190, 165, C, C.coupler);
    letter(g, C, 'A', A.x + 4, A.y - 18); letter(g, C, 'B', B.x - 4, B.y + 20); letter(g, C, 'C', Cc.x - 18, Cc.y - 14); letter(g, C, 'D', D.x + 4, D.y - 18);
    [J3, H2].forEach((p, i) => { g.beginPath(); g.arc(p.x, p.y, 6, 0, TAU); g.fillStyle = C.accent; g.fill(); letter(g, C, i ? 'Y' : 'X', p.x + (i ? 14 : -4), p.y + (i ? -12 : 20)); });
    text(g, 'M = 3(4 − 1) − 2(4) = 1', 450, 360, C, { size: 15, color: C.muted });
  });

  /* C · prensa mecánica: perno triple (E y F superpuestos) */
  mk('cv-exC', (g, C) => {
    const base = 345, A = P(110, 305), B = P(130, 240), X = P(100, 120), Cc = P(255, 320), E = P(300, 225), D = P(300, 125);
    g.strokeStyle = C.ground; g.lineWidth = 6; g.beginPath(); g.moveTo(50, base); g.lineTo(520, base); g.stroke();
    dashed(g, C, P(300, 345), P(300, 60));
    bar(g, A, X, C.input, 9); bar(g, B, E, C.coupler, 8); bar(g, Cc, E, C.output, 8); bar(g, E, D, C.ground, 8);
    slider(g, C, D, Math.PI / 2, 52, 40);
    groundMark(g, A, C); groundMark(g, Cc, C, 28);
    [A, B, Cc, D].forEach(p => pin(g, p, C, 6, p === A || p === Cc));
    pin(g, P(E.x - 7, E.y), C, 8); pin(g, P(E.x + 7, E.y), C, 8);
    tag(g, 2, 90, 200, C, C.input); tag(g, 3, 215, 218, C, C.coupler); tag(g, 4, 285, 285, C, C.output); tag(g, 6, 320, 175, C, C.ground); tag(g, 5, 365, 125, C, C.ground);
    letter(g, C, 'A', A.x - 16, A.y - 14); letter(g, C, 'B', B.x + 16, B.y - 16); letter(g, C, 'C', Cc.x - 16, Cc.y - 14); letter(g, C, 'D', D.x - 18, D.y - 24);
    letter(g, C, 'E', E.x - 26, E.y + 20); letter(g, C, 'F', E.x + 26, E.y + 20); letter(g, C, 'G', D.x + 40, D.y - 40);
    g.beginPath(); g.arc(X.x, X.y, 6, 0, TAU); g.fillStyle = C.accent; g.fill(); letter(g, C, 'X', X.x - 14, X.y - 12);
    text(g, 'E y F: dos pernos superpuestos (k − 1 = 2)', 400, 262, C, { size: 13, color: C.muted, weight: 500 });
    text(g, 'M = 3(6 − 1) − 2(7) = 1', 470, 40, C, { size: 15, color: C.muted });
  });

  /* D · mesa levadiza de tijera con tornillo */
  mk('cv-exD', (g, C) => {
    const y0 = 330, y1 = 120, E = P(110, y0), A = P(320, y0), Dd = P(110, y1), Cc = P(320, y1), B = P(215, (y0 + y1) / 2);
    g.strokeStyle = C.ground; g.lineWidth = 6; g.beginPath(); g.moveTo(60, y0 + 14); g.lineTo(500, y0 + 14); g.stroke();
    g.strokeStyle = C.input; g.lineWidth = 3; g.beginPath(); g.moveTo(160, y0); g.lineTo(460, y0); g.stroke();
    bar(g, Dd, P(380, y1), C.ground, 8);
    bar(g, A, Dd, C.coupler, 8); bar(g, E, Cc, C.output, 8);
    slider(g, C, A, 0, 46, 24); slider(g, C, Cc, 0, 36, 18);
    groundMark(g, P(E.x, E.y - 8), C, 30);
    [E, A, B, Dd, Cc].forEach(p => pin(g, p, C, 6, p === E));
    tag(g, 2, A.x + 44, A.y - 30, C, C.input); tag(g, 3, 150, 180, C, C.coupler); tag(g, 4, 270, 280, C, C.output); tag(g, 5, 400, y1 - 22, C, C.ground); tag(g, 6, Cc.x + 30, Cc.y + 28, C, C.ground);
    letter(g, C, 'A', A.x + 18, A.y - 24); letter(g, C, 'B', B.x + 4, B.y - 16); letter(g, C, 'C', Cc.x - 18, Cc.y + 28); letter(g, C, 'D', Dd.x - 6, Dd.y - 22); letter(g, C, 'E', E.x - 18, E.y - 22);
    text(g, 'corredera tuerca–tornillo', 440, y0 - 26, C, { size: 12, color: C.muted, weight: 500 });
    text(g, 'corredera eslabón 6–mesa', 440, y1 + 34, C, { size: 12, color: C.muted, weight: 500 });
    text(g, 'M = 3(6 − 1) − 2(7) = 1', 470, 40, C, { size: 15, color: C.muted });
  });
})();
