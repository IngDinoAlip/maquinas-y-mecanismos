/* Mecanismos Vivos — galería de pares cinemáticos con flechas de grados de libertad */
'use strict';
(function pares() {
  const INK = 'var(--ink)', FILL = 'var(--surface)', FILL2 = 'var(--surface2)', ACC = 'var(--accent)';
  let uid = 0;
  const f = x => x.toFixed(1);

  function fig() {
    const id = 'pa' + (++uid), parts = [];
    const api = {
      raw: s => { parts.push(s); return api; },
      // flecha recta (doble por defecto)
      lin: (x1, y1, x2, y2, both = true) => api.raw(`<line class="pa-arr" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ACC}" stroke-width="2.6" stroke-linecap="round" marker-end="url(#${id})"${both ? ` marker-start="url(#${id})"` : ''}/>`),
      // flecha curva: arco elíptico entre dos ángulos (grados)
      rot: (cx, cy, rx, ry, a0, a1) => {
        const p = a => [cx + rx * Math.cos(a * Math.PI / 180), cy + ry * Math.sin(a * Math.PI / 180)], s = p(a0), e = p(a1), large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 > a0 ? 1 : 0;
        return api.raw(`<path class="pa-arr" d="M${f(s[0])},${f(s[1])} A${rx},${ry} 0 ${large} ${sweep} ${f(e[0])},${f(e[1])}" fill="none" stroke="${ACC}" stroke-width="2.6" stroke-linecap="round" marker-end="url(#${id})"/>`);
      },
      solid: (tag, attrs) => api.raw(`<${tag} ${attrs} stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`),
      out: label => `<svg viewBox="0 0 220 150" role="img" aria-label="${label}"><defs><marker id="${id}" viewBox="0 0 8 8" refX="5" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L8,4L0,8Z" fill="${ACC}"/></marker></defs>${parts.join('')}</svg>`
    };
    return api;
  }
  const plane = g => g.solid('polygon', `points="25,118 150,118 205,88 80,88" fill="${FILL2}"`).solid('polygon', `points="25,118 150,118 150,128 25,128" fill="${FILL}"`).solid('polygon', `points="150,118 205,88 205,98 150,128" fill="${FILL}"`);

  const PAIRS = [
    { n: 'Giratorio (revoluta)', c: '1 GDL · clase 1', ex: 'Bisagra, articulación de pasador', draw: () => { const g = fig(); g.solid('rect', `x="40" y="63" width="130" height="24" fill="${FILL}"`).solid('ellipse', `cx="170" cy="75" rx="6" ry="12" fill="${FILL2}"`).solid('rect', `x="80" y="48" width="46" height="54" rx="4" fill="${FILL2}"`).rot(176, 75, 12, 34, -75, 75); return g.out('Par giratorio'); } },
    { n: 'Prismático', c: '1 GDL · clase 1', ex: 'Cajón, pistón en su camisa', draw: () => { const g = fig(); g.solid('path', `d="M40,44 H175 M40,106 H175 M40,44 V106" fill="none"`).solid('rect', `x="70" y="60" width="125" height="30" fill="${FILL2}"`).lin(60, 126, 190, 126); return g.out('Par prismático'); } },
    { n: 'Tornillo (helicoidal)', c: '1 GDL · clase 1', ex: 'Tornillo y tuerca (giro y avance ligados)', draw: () => { const g = fig(); g.solid('rect', `x="35" y="63" width="150" height="24" fill="${FILL}"`); for (let x = 48; x < 180; x += 13) g.raw(`<line x1="${x}" y1="63" x2="${x + 8}" y2="87" stroke="${INK}" stroke-width="1.5"/>`); g.solid('rect', `x="95" y="48" width="32" height="54" rx="3" fill="${FILL2}"`).lin(60, 126, 170, 126).rot(30, 75, 8, 30, 110, -110); return g.out('Par helicoidal'); } },
    { n: 'Cilíndrico', c: '2 GDL · clase 2', ex: 'Eje que gira y se desliza en un casquillo', draw: () => { const g = fig(); g.solid('rect', `x="40" y="46" width="90" height="58" rx="4" fill="${FILL2}"`).solid('rect', `x="70" y="63" width="115" height="24" fill="${FILL}"`).solid('ellipse', `cx="185" cy="75" rx="6" ry="12" fill="${FILL}"`).lin(55, 128, 165, 128).rot(192, 75, 12, 34, -75, 75); return g.out('Par cilíndrico'); } },
    { n: 'Esférico (rótula)', c: '3 GDL · clase 3', ex: 'Rótula de dirección, cadera', draw: () => { const g = fig(); g.solid('path', `d="M70,62 A44,44 0 0 0 150,62 Z" fill="${FILL2}"`).solid('circle', `cx="110" cy="66" r="28" fill="${FILL}"`).solid('line', `x1="110" y1="40" x2="110" y2="12"`).rot(110, 22, 34, 8, 200, 340).rot(46, 52, 16, 26, 200, 340).rot(176, 52, 16, 26, -20, 120); return g.out('Par esférico'); } },
    { n: 'Plano', c: '3 GDL · clase 3', ex: 'Bloque deslizando sobre una mesa (rara vez «sin disfraz»)', draw: () => { const g = plane(fig()); g.solid('rect', `x="100" y="94" width="40" height="20" rx="3" fill="${FILL2}"`).lin(30, 140, 140, 140).lin(168, 110, 190, 99).rot(120, 84, 24, 8, 200, 340); return g.out('Par plano'); } },
    { n: 'Esfera-cilindro', c: '4 GDL · clase 4', ex: 'Rótula que además desliza dentro de un tubo', draw: () => { const g = fig(); g.solid('rect', `x="30" y="48" width="125" height="54" rx="4" fill="${FILL2}"`).solid('circle', `cx="108" cy="75" r="22" fill="${FILL}"`).solid('line', `x1="130" y1="75" x2="190" y2="75"`).lin(40, 124, 150, 124).rot(196, 75, 10, 28, -75, 75).rot(100, 24, 32, 9, 200, 340).rot(206, 36, 12, 18, 220, 40); return g.out('Par esfera-cilindro'); } },
    { n: 'Plano-cilindro', c: '4 GDL · clase 4', ex: 'Rodillo apoyado sobre una mesa', draw: () => { const g = plane(fig()); g.raw(`<g transform="rotate(-18 120 94)"><rect x="82" y="84" width="76" height="20" fill="${FILL}" stroke="${INK}" stroke-width="2"/><ellipse cx="158" cy="94" rx="6" ry="10" fill="${FILL2}" stroke="${INK}" stroke-width="2"/></g>`).lin(52, 134, 138, 134).lin(168, 114, 196, 100).rot(100, 70, 26, 8, 200, 340).rot(172, 78, 8, 22, -70, 70); return g.out('Par plano-cilindro'); } },
    { n: 'Plano-esfera', c: '5 GDL · clase 5', ex: 'Esfera apoyada sobre un plano', draw: () => { const g = plane(fig()); g.solid('circle', `cx="115" cy="90" r="17" fill="${FILL2}"`).lin(40, 140, 150, 140).lin(166, 112, 192, 99).rot(115, 60, 26, 8, 200, 340).rot(150, 80, 8, 22, -70, 70).rot(78, 78, 16, 8, 160, 20); return g.out('Par plano-esfera'); } }
  ];

  document.querySelectorAll('[data-widget="pairs"]').forEach(h => {
    h.innerHTML = '<div class="pa-grid">' + PAIRS.map(p => `<figure class="pa-card">${p.draw()}<figcaption><b>${p.n}</b><span class="pa-c">${p.c}</span><span>${p.ex}</span></figcaption></figure>`).join('') + '</div><p class="note">Cada flecha naranja es un grado de libertad: las rectas son traslaciones y las curvas son giros. En el tornillo, giro y avance están ligados, por eso cuenta como un solo grado de libertad.</p>';
  });
})();
