/* Mecanismos Vivos — widgets interactivos de las lecciones 1.4 y del módulo 9 */
'use strict';
(function tipos() {
  const fmt = (x, d = 1) => (Math.round(x * 10 ** d) / 10 ** d).toString().replace('.', ',');
  const mk = (host, html) => { host.innerHTML = html; return host; };
  const slider = (id, label, min, max, step, val, unit) => `<label class="w-row"><span>${label}</span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><output id="${id}-o">${val} ${unit}</output></label>`;
  const bind = (host, ids, units, fn) => {
    const upd = () => { ids.forEach((id, i) => { host.querySelector('#' + id + '-o').textContent = fmt(+host.querySelector('#' + id).value, 2).replace(/,00$/, '') + ' ' + units[i]; }); fn(ids.map(id => +host.querySelector('#' + id).value)); };
    ids.forEach(id => host.querySelector('#' + id).addEventListener('input', upd)); upd();
  };

  /* ---- 1.4: ¿mecanismo o máquina? (momento y fuerza) ---- */
  document.querySelectorAll('[data-widget="moment"]').forEach(h => {
    mk(h, `${slider('mF', 'Fuerza F', 1, 5000, 1, 50, 'N')}${slider('mD', 'Brazo d', 0.01, 2, 0.01, 0.4, 'm')}<div class="w-out" role="status" aria-live="polite"></div>`);
    bind(h, ['mF', 'mD'], ['N', 'm'], ([F, d]) => {
      const M = F * d, rk = Math.max(F < 10 ? 0 : F < 1000 ? 1 : 2, M < 1 ? 0 : M < 100 ? 1 : 2);
      const lv = [['Bajo', 'manda la geometría del movimiento: para empezar basta la <b>cinemática</b>', 'ok'], ['Intermedio', 'importan a la vez el movimiento y la resistencia: conviene añadir un análisis de fuerzas', 'warn'], ['Alto', 'hay que calcular fuerzas, esfuerzos y potencia desde el principio (dinámica y resistencia de materiales)', 'bad']][rk];
      h.querySelector('.w-out').innerHTML = `<div class="mini ${lv[2]}"><b>M = F · d = ${fmt(M, 1)} N·m → carga ${lv[0].toLowerCase()}</b><span>${lv[1]}.</span></div>`;
    });
  });

  /* ---- 9.2: calculadora de palanca ---- */
  document.querySelectorAll('[data-widget="lever"]').forEach(h => {
    mk(h, `<div class="w-title">Calculadora de palanca (ideal, sin fricción)</div>${slider('lR', 'Carga R', 10, 500, 10, 100, 'N')}${slider('lbR', 'Brazo de la carga', 5, 100, 5, 20, 'cm')}${slider('lbF', 'Brazo del esfuerzo', 5, 100, 5, 80, 'cm')}<div class="w-out" role="status" aria-live="polite"></div>`);
    bind(h, ['lR', 'lbR', 'lbF'], ['N', 'cm', 'cm'], ([R, bR, bF]) => {
      const F = R * bR / bF, vm = R / F;
      h.querySelector('.w-out').innerHTML = `<div class="mini ${vm >= 1 ? 'ok' : 'warn'}"><b>F = R · bR / bF = ${fmt(F, 1)} N · ventaja mecánica = ${fmt(vm, 2)}</b><span>${vm > 1.001 ? 'Multiplicas la fuerza ' + fmt(vm, 2) + ' veces, pero tu mano recorre ' + fmt(vm, 2) + ' veces más distancia que la carga.' : vm < 0.999 ? 'Pierdes fuerza (necesitas ' + fmt(1 / vm, 2) + ' veces más), pero la carga recorre más y más rápido.' : 'Ni ganas ni pierdes: solo cambias la dirección.'}</span></div>`;
    });
  });

  /* ---- 9.3: calculadora de engranes ---- */
  document.querySelectorAll('[data-widget="gearcalc"]').forEach(h => {
    mk(h, `<div class="w-title">Calculadora de reducción o multiplicación</div>${slider('gz1', 'Dientes de entrada z₁', 8, 60, 1, 20, '')}${slider('gz2', 'Dientes de salida z₂', 8, 60, 1, 60, '')}${slider('gn', 'Velocidad de entrada', 50, 3000, 50, 300, 'rpm')}${slider('gm', 'Par de entrada', 1, 100, 1, 6, 'N·m')}${slider('ge', 'Rendimiento η', 80, 100, 1, 95, '%')}<div class="w-out" role="status" aria-live="polite"></div>`);
    bind(h, ['gz1', 'gz2', 'gn', 'gm', 'ge'], ['', '', 'rpm', 'N·m', '%'], ([z1, z2, n, m, e]) => {
      const i = z2 / z1, n2 = n / i, m2 = m * i * e / 100, kind = i > 1.001 ? 'reductor' : i < 0.999 ? 'multiplicador' : '1 : 1';
      h.querySelector('.w-out').innerHTML = `<div class="mini ${i > 1.001 ? 'ok' : i < 0.999 ? 'warn' : ''}"><b>i = ${fmt(i, 2)} (${kind}) · salida: ${fmt(n2, 0)} rpm y ${fmt(m2, 1)} N·m</b><span>${i > 1.001 ? 'La velocidad baja ' + fmt(i, 2) + ' veces y el par sube casi lo mismo.' : i < 0.999 ? 'La velocidad sube ' + fmt(1 / i, 2) + ' veces y el par baja.' : 'Misma velocidad y mismo par (salvo pérdidas).'} Potencia: entrada ${fmt(m * n * Math.PI / 30, 0)} W, salida ${fmt(m2 * n2 * Math.PI / 30, 0)} W.</span></div>`;
    });
  });

  /* ---- 9.1: clasificador ---- */
  document.querySelectorAll('[data-widget="classifier"]').forEach(h => {
    const G = ['Grupo 1 · Fuerza', 'Grupo 2 · Velocidad', 'Grupo 3 · Movimiento', 'Grupo 4 · Otros'];
    const items = [['Polea móvil', 0, 'Reparte la carga en dos tramos de cuerda: F = R/2.'], ['Balancín (palanca)', 0, 'Una palanca modifica la fuerza según sus brazos.'], ['Polipasto', 0, 'Varios tramos de cuerda dividen la fuerza necesaria.'],
      ['Poleas con correa de distinto diámetro', 1, 'Cambian la velocidad según la relación de diámetros.'], ['Tornillo sinfín y rueda dentada', 1, 'Reducción grande de velocidad (y aumento de par).'], ['Cadena entre plato y piñón', 1, 'Con catarinas de distinto tamaño modifica la velocidad.'],
      ['Piñón-cremallera', 2, 'Transforma giro en traslación (o al revés).'], ['Leva con seguidor', 2, 'Convierte el giro en un vaivén con la ley del perfil.'], ['Manivela-biela-cigüeñal', 2, 'Transforma el movimiento lineal alternativo del pistón en giro.'],
      ['Freno de disco', 3, 'Regula el movimiento disipando energía.'], ['Embrague', 3, 'Acopla o desacopla dos ejes.'], ['Amortiguador', 3, 'Disipa energía: es de los «otros» mecanismos.']];
    mk(h, `<div class="w-list">${items.map((it, i) => `<div class="w-item"><span>${it[0]}</span><select data-i="${i}" aria-label="Grupo de ${it[0]}"><option value="">elige…</option>${G.map((g, k) => `<option value="${k}">${g}</option>`).join('')}</select><em class="w-fb" role="status"></em></div>`).join('')}</div><p class="w-score" role="status"></p>`);
    const score = () => { const ok = [...h.querySelectorAll('.w-fb.ok')].length; h.querySelector('.w-score').textContent = `Aciertos: ${ok} de ${items.length}`; };
    h.querySelectorAll('select').forEach(sel => sel.addEventListener('change', () => {
      const it = items[+sel.dataset.i], fb = sel.parentNode.querySelector('.w-fb'); if (sel.value === '') { fb.textContent = ''; fb.className = 'w-fb'; score(); return; }
      const ok = +sel.value === it[1]; fb.className = 'w-fb ' + (ok ? 'ok' : 'no'); fb.textContent = ok ? '✔ ' + it[2] : '✘ Piénsalo otra vez: ¿qué hace con la entrada?'; score();
    }));
    score();
  });
})();
