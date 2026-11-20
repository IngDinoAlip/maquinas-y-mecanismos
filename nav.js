/* Mecanismos Vivos — navegación por lecciones, progreso y comprobaciones */
'use strict';

(function nav() {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const lessons = $$('article.lesson'), mods = $$('section.module'), hero = $('#inicio');
  const total = lessons.length;
  let done = {}, last = null;
  try { done = JSON.parse(localStorage.getItem('mv-lessons') || '{}'); last = localStorage.getItem('mv-last'); } catch (e) { done = {}; }
  const save = () => { try { localStorage.setItem('mv-lessons', JSON.stringify(done)); } catch (e) { /* sin almacenamiento */ } };
  const modInfo = {};
  mods.forEach(m => { modInfo[m.dataset.module] = { title: m.dataset.title, ls: lessons.filter(l => l.dataset.mod === m.dataset.module) }; });
  const lnum = l => `${l.dataset.mod}.${l.dataset.les}`;
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---- comprobaciones por lección ---- */
  const CK = {
    'l1-1': ['¿Cuál describe mejor a un <b>mecanismo</b>?', ['La parte mecánica que transmite movimiento y fuerza de una entrada a una salida', 'El dispositivo completo con su carcasa y su motor', 'Una estructura que no se mueve', 'El estudio de las fuerzas que actúan sobre una máquina'], 'Una máquina es el dispositivo completo; el mecanismo es su parte mecánica que transmite movimiento y fuerza. El estudio de fuerzas es dinámica/estática.'],
    'l1-2': ['Una pieza va de x = 2 m a x = 10 m y luego regresa a x = 6 m. ¿Cuánto valen el desplazamiento y la distancia recorrida?', ['Desplazamiento 4 m; distancia 12 m', 'Desplazamiento 4 m; distancia 4 m', 'Desplazamiento 12 m; distancia 4 m', 'Desplazamiento 8 m; distancia 12 m'], 'Δx = 6 − 2 = 4 m (solo depende de inicio y fin). La distancia sumó 8 m de ida y 4 m de regreso: 12 m (≥ |Δx|).'],
    'l1-3': ['La plataforma de un paralelogramo sube y baja sin girar. ¿Qué movimiento tiene?', ['Traslación curvilínea', 'Rotación pura', 'Movimiento plano general con rotación', 'Reposo'], 'Conserva su orientación (no rota) y sus puntos describen arcos idénticos: traslación curvilínea.'],
    'l2-1': ['¿Cuántas restricciones impone una unión de perno en el plano?', ['2', '1', '3', '0'], 'Elimina las dos traslaciones relativas y deja solo la rotación (1 GDL relativo): impone 3 − 1 = 2 restricciones.'],
    'l2-2': ['Un par con f = 2 grados de libertad relativos en el plano impone…', ['1 restricción', '2 restricciones', '3 restricciones', 'ninguna'], 'En el plano, un par con f GDL relativos impone 3 − f restricciones: 3 − 2 = 1 (par superior: leva o engranes).'],
    'l2-3': ['Dos engranes exteriores con z₁ = 20 y z₂ = 60. Si el 1 gira a 300 rpm, el 2 gira a…', ['100 rpm en sentido opuesto', '900 rpm en el mismo sentido', '100 rpm en el mismo sentido', '300 rpm en sentido opuesto'], 'ω₂/ω₁ = −z₁/z₂ = −20/60: la salida gira a un tercio de la velocidad y en sentido opuesto.'],
    'l2-4': ['Un tornillo de 2 entradas y paso axial de 1,5 mm avanza por vuelta…', ['3 mm', '1,5 mm', '0,75 mm', '2 mm'], 'L = nₑ·p = 2 · 1,5 = 3 mm por revolución.'],
    'l2-5': ['Para una carrera lineal limitada con fuerzas muy grandes, el actuador más típico es…', ['un cilindro hidráulico', 'un motor eléctrico de CA', 'un servomotor de giro', 'un resorte'], 'Los cilindros hidráulicos entregan movimiento lineal de carrera limitada y fuerzas elevadas.'],
    'l3-1': ['En un diagrama cinemático, ¿qué número recibe la bancada?', ['1', '2', 'El mayor de todos', 'Ninguno'], 'Por convención, la bancada es el eslabón 1; los demás se numeran 2, 3, 4…'],
    'l3-2': ['En el diagrama cinemático, un cilindro hidráulico se representa como…', ['dos eslabones unidos por una corredera', 'un solo eslabón con un perno', 'una leva', 'un resorte'], 'El cuerpo del cilindro y el pistón/varilla son dos cuerpos rígidos que deslizan uno respecto al otro.'],
    'l3-3': ['Tres eslabones comparten un único perno. ¿Cuántas uniones debes contar?', ['2', '1', '3', '0'], 'k eslabones en un perno equivalen a k − 1 uniones de revoluta superpuestas: 3 − 1 = 2.'],
    'l4-1': ['Con n = 4, j<sub>p</sub> = 4 y j<sub>h</sub> = 0, ¿cuánto vale M?', ['1', '0', '2', '3'], 'M = 3(4 − 1) − 2(4) − 0 = 9 − 8 = 1.'],
    'l4-2': ['Un brazo plano abierto con 3 articulaciones tiene M = 3. Significa que…', ['necesita 3 entradas independientes para fijar su configuración', 'está bloqueado', 'es una estructura', 'solo puede moverse con 3 motores iguales'], 'M cuenta coordenadas de entrada independientes. Cuántos actuadores se usen depende del diseño y del control.'],
    'l4-3': ['La leva con seguidor de rodillo da M = 2 con Gruebler, pero el diseñador considera 1 GDL útil porque…', ['el giro del rodillo es un grado de libertad inactivo', 'la fórmula es incorrecta', 'la leva no cuenta como eslabón', 'el rodillo es la bancada'], 'El rodillo gira libremente sin afectar la relación entrada-salida; en el modelo ideal sí es un GDL, pero es pasivo.'],
    'l4-4': ['En una configuración regular, la movilidad local es…', ['N<sub>q</sub> − rango(J)', 'N<sub>q</sub> + rango(J)', 'rango(J)', '3(n − 1) siempre'], 'M_local = N_q − rango(J), con J = ∂Φ/∂q. Si hay restricciones redundantes, el rango es menor que el número de restricciones contabilizadas.'],
    'l5-1': ['Al cambiar la bancada en una cadena cinemática se conserva…', ['el movimiento relativo entre cada pareja de eslabones', 'la trayectoria de cada punto respecto al suelo', 'la velocidad de todos los puntos', 'nada'], 'Las relaciones geométricas internas no cambian; sí cambian las trayectorias vistas desde el marco fijo elegido.'],
    'l5-2': ['Un cuatro barras con eslabones 5, 6, 8 y 9 cm: s + l = 14 y p + q = 14. Es un mecanismo de…', ['punto de cambio', 'doble manivela', 'triple balancín', 'manivela-balancín'], 'Con s + l = p + q es la condición de cambio: aparecen configuraciones colineales.'],
    'l5-3': ['Dado θ₂, el cierre del lazo del cuatro barras tiene en general…', ['dos soluciones (ramas) si existe ensamble', 'una única solución siempre', 'cuatro soluciones', 'infinitas soluciones'], 'La intersección de dos circunferencias da dos puntos (imágenes especulares respecto a la recta A–O₄), si |r₃ − r₄| ≤ d ≤ r₃ + r₄.'],
    'l5-4': ['Un ángulo de transmisión μ ≈ 87° indica…', ['transmisión casi ideal de fuerza al seguidor', 'posición límite del mecanismo', 'mecanismo bloqueado', 'un error de cálculo'], 'La componente útil es proporcional a sen μ; con μ cerca de 90° es máxima.'],
    'l6-1': ['En una manivela-corredera en línea con r = 4 cm y l = 12 cm (e = 0), la carrera es…', ['8 cm', '4 cm', '12 cm', '16 cm'], 'Con e = 0, la carrera es 2r = 8 cm.'],
    'l6-2': ['¿Qué condición garantiza que la manivela pueda dar vueltas completas?', ['r + |e| ≤ l', 'r ≥ l', 'e = 0', 'l ≤ r'], 'La raíz de x(θ) debe ser real siempre: |r sen θ − e| ≤ l para todo θ, peor caso r + |e| ≤ l.'],
    'l6-3': ['El yugo escocés convierte el giro uniforme en un movimiento…', ['armónico simple exacto', 'uniforme', 'parabólico', 'con retorno rápido'], 'x = r cos ωt: es una senoide exacta.'],
    'l6-4': ['En el Peaucellier-Lipkin, C describe una recta exacta cuando…', ['la manivela cumple PA = PO (A recorre una circunferencia que pasa por O)', 'siempre', 'PA es mayor que PO', 'OB es distinto de OD'], 'C es el inverso de A respecto a O; el inverso de una circunferencia que pasa por O es una recta.'],
    'l7-1': ['Para iterar un diseño con muchas posiciones y variaciones conviene sobre todo…', ['el método computacional', 'el gráfico con regla y compás', 'el analítico a mano', 'ninguno'], 'Hojas de cálculo y programas recalculan automáticamente al cambiar un dato.'],
    'l7-2': ['En el comparador, ¿cuál se toma como referencia de exactitud?', ['el cálculo numérico de doble precisión', 'el método gráfico', 'el analítico con 3 cifras', 'ninguno'], 'Los otros métodos se evalúan midiendo su error respecto a él.'],
    'l1-4': ['Con una llave de 0,4 m aplicas una fuerza de 50 N perpendicular a ella. ¿Qué momento ejerces?', ['20 N·m', '125 N·m', '2 N·m', '200 N·m'], 'M = F · d = 50 · 0,4 = 20 N·m.'],
    'l1-5': ['Un par cinemático con dos grados de libertad relativos, como el cilíndrico (giro y deslizamiento independientes), es de…', ['clase 2', 'clase 1', 'clase 3', 'clase 5'], 'Con el criterio de grados de libertad, la clase coincide con ellos: el cilíndrico es de clase 2.'],
    'l1-6': ['En el gato de tijera, la unión entre el tornillo y los bloques roscados es…', ['un par helicoidal: giro y avance ligados', 'una corredera pura', 'un perno sin avance', 'un contacto de dientes'], 'Tornillo y tuerca forman un par helicoidal de 1 GDL: cada vuelta produce un avance igual al paso.'],
    'l9-1': ['Un mecanismo de piñón y cremallera convierte un giro en un avance en línea recta. Por su función es de…', ['transformación del movimiento', 'transmisión circular a circular', 'regulación de energía', 'modificación de la velocidad angular'], 'Cambia el tipo de movimiento (circular → lineal): es una transformación.'],
    'l9-2': ['Una palanca de 1.er género tiene brazo de carga de 20 cm y brazo de esfuerzo de 80 cm. Para equilibrar 100 N de carga necesitas…', ['25 N', '400 N', '80 N', '100 N'], 'F · 80 = 100 · 20 → F = 25 N: la ventaja mecánica es 4 (y tu mano recorre 4 veces más).'],
    'l9-3': ['Un engrane de 20 dientes mueve a uno de 60. Si el pequeño gira a 300 rpm y transmite 6 N·m, el grande (ideal) gira a…', ['100 rpm y 18 N·m', '900 rpm y 2 N·m', '100 rpm y 2 N·m', '300 rpm y 6 N·m'], 'i = 60/20 = 3: la velocidad baja a 300/3 = 100 rpm y el par sube ×3 = 18 N·m (sin pérdidas).'],
    'l9-4': ['El sistema pedal → cadena → rueda de una bicicleta es principalmente…', ['una transmisión de movimiento circular a circular', 'una transformación de giro en traslación', 'un mecanismo de movimiento intermitente', 'un freno'], 'Entra un giro y sale un giro: es transmisión (con cambio de velocidad según los piñones).'],
    'l9-5': ['Un mecanismo de Ginebra de 4 ranuras convierte cada vuelta de la entrada en…', ['un giro de 90° de la salida y una parada', 'un giro continuo de la salida', 'un movimiento lineal', 'un giro de 180°'], 'Con 4 ranuras la salida avanza 360°/4 = 90° por vuelta y queda bloqueada el resto del ciclo.'],
    'l8-1': ['Una condición necesaria para que algún eslabón dé vueltas completas es…', ['s + l ≤ p + q', 's + l > p + q', 'todos los eslabones iguales', 'p = q'], 'Es el criterio de Grashof; además importa cuál eslabón es el más corto respecto a la bancada.'],
    'l10-1': ['En el motor, ¿qué pieza hace de bancada (eslabón fijo)?', ['La base: bloque, cilindros y soportes', 'El cigüeñal', 'El árbol de levas', 'El pistón'], 'La bancada es el eslabón que no se mueve y sostiene a todos los demás: la base (bloque, cilindros, culata y soportes).'],
    'l10-2': ['Para que una válvula se abra una sola vez cada dos vueltas del cigüeñal (cuatro tiempos), el engrane del árbol de levas debe tener…', ['el doble de dientes que el del cigüeñal (Zc/Zk = 0,5)', 'los mismos dientes que el del cigüeñal', 'la mitad de dientes que el del cigüeñal', 'cualquier número de dientes'], 'ω_levas/ω_cigüeñal = Zc/Zk. Si Zk = 2·Zc, la leva gira a la mitad de la velocidad y cada lóbulo actúa una vez cada 720° del cigüeñal.'],
    'l10-3': ['El mecanismo pistón-biela-cigüeñal, por su función, es…', ['una transformación del movimiento: circular ↔ lineal', 'una transmisión de movimiento circular a circular', 'un modificador de la velocidad, como un engrane', 'un acumulador de energía'], 'El giro del cigüeñal se convierte en un vaivén lineal del pistón (y al revés): cambia el tipo de movimiento, así que es una transformación (grupo 3, biela-manivela).'],
    'l10-4': ['El balancín recibe el movimiento lineal del empujador y entrega movimiento lineal a la válvula. ¿Qué hace por su función?', ['Lo transmite invirtiendo el sentido y puede modificar fuerza y recorrido (palanca)', 'Lo transforma en movimiento circular continuo', 'Lo detiene y lo almacena como energía', 'No hace nada: solo une dos piezas'], 'Entra y sale un movimiento lineal (transmisión); internamente gira un pequeño ángulo y por eso invierte el sentido. Es una palanca de 1.er género (grupo 1).'],
    'l10-5': ['Con n = 13, j_p = 14 y j_h = 7, ¿cuánto vale la movilidad del motor?', ['1: basta mover el cigüeñal para fijar todo el mecanismo', '0: es una estructura', '2: necesita dos motores', '3: es un mecanismo plano libre'], 'M = 3(13 − 1) − 2(14) − 7 = 36 − 28 − 7 = 1. Un grado de libertad: la entrada es el cigüeñal.'],
    'l10-6': ['El cigüeñal gira a 120 °/s. ¿Cuánto dura una vuelta, y por tanto un ciclo completo de cada pistón?', ['3 s', '1,75 s', '0,33 s', '12 s'], 'T = 360° / 120 °/s = 3 s, el periodo que se ve en las gráficas de los pistones. El árbol de levas (206 °/s) tarda 360/206 ≈ 1,75 s.']
  };

  /* ---- numeración de encabezados, cabecera y pie de cada lección ---- */
  lessons.forEach(l => {
    $$('h3', l).forEach((h, i) => { const s = document.createElement('span'); s.className = 'hn'; s.textContent = `${lnum(l)}.${i + 1}`; h.prepend(s); });
    const n = modInfo[l.dataset.mod].ls.length;
    const hd = document.createElement('header'); hd.className = 'lesson-head';
    hd.innerHTML = `<p class="eyebrow">Módulo ${l.dataset.mod} · ${modInfo[l.dataset.mod].title} · Lección ${l.dataset.les} de ${n}</p><h1>${lnum(l)} ${l.dataset.title}</h1><p class="obj"><b>Objetivo:</b> ${l.dataset.obj}</p>`;
    l.prepend(hd);
    const ft = document.createElement('footer'); ft.className = 'lesson-foot';
    const ck = CK[l.id];
    if (ck) {
      const c = document.createElement('div'); c.className = 'check';
      c.innerHTML = `<h3>Comprobación</h3><p class="q">${ck[0]}</p><div class="opts"></div><p class="fb" role="status"></p><div class="why" hidden></div>`;
      const opts = c.querySelector('.opts'), fb = c.querySelector('.fb'), why = c.querySelector('.why');
      let tries = 0, solved = false;
      shuffle(ck[1].map((t, i) => ({ t, ok: i === 0 }))).forEach(o => {
        const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = o.t;
        b.onclick = () => {
          if (solved) return;
          if (o.ok) { solved = true; b.classList.add('right'); fb.style.color = 'var(--ok)'; fb.textContent = '¡Correcto! Lección completada.'; why.hidden = false; why.innerHTML = '<b>Por qué:</b> ' + ck[2]; done[l.id] = true; save(); refresh(); }
          else { tries++; b.classList.add('wrong'); b.disabled = true; fb.style.color = 'var(--bad)'; fb.textContent = 'No exactamente.'; if (tries >= 2) { why.hidden = false; why.innerHTML = '<b>Pista:</b> ' + ck[2]; } else { why.hidden = false; why.innerHTML = '<b>Pista:</b> vuelve a la teoría de esta lección e inténtalo de nuevo.'; } }
        };
        opts.appendChild(b);
      });
      ft.appendChild(c);
    }
    const nv = document.createElement('div'); nv.className = 'lesson-nav';
    nv.innerHTML = '<a class="btn ghost" data-prev>← Anterior</a><button class="btn ghost" data-mark aria-pressed="false">☐ Marcar como completada</button><span class="sp"></span><a class="btn" data-next>Siguiente →</a>';
    ft.appendChild(nv); l.appendChild(ft);
    nv.querySelector('[data-mark]').onclick = () => { done[l.id] = !done[l.id]; save(); refresh(); };
  });

  /* ---- tus intentos antes de ver la solución ---- */
  $$('details.answer').forEach(d => {
    const w = document.createElement('div'); w.className = 'attempt';
    w.innerHTML = '<label>Tu intento (escribe tu resultado o tu razonamiento):<input type="text" placeholder="Ej.: M = 2, porque…"></label><p class="hint-s" role="status"></p>';
    d.parentNode.insertBefore(w, d);
    const inp = w.querySelector('input'), msg = w.querySelector('.hint-s'), sum = d.querySelector('summary');
    sum.textContent = 'Ver la solución razonada (después de intentar)';
    sum.addEventListener('click', e => {
      if (d.open) return;
      if (!inp.value.trim()) { e.preventDefault(); msg.textContent = 'Primero escribe tu intento; después podrás compararlo con la solución.'; inp.focus(); return; }
      msg.textContent = '';
      let y = d.querySelector('.yours'); if (!y) { y = document.createElement('p'); y.className = 'yours'; d.appendChild(y); }
      y.textContent = 'Tu respuesta: ' + inp.value.trim();
    });
  });

  /* ---- barra lateral ---- */
  const side = $('#side-nav');
  side.innerHTML = '<a class="side-nav-home" href="#inicio" data-home>⌂ Portada y ruta</a>';
  Object.keys(modInfo).forEach(k => {
    const m = modInfo[k], div = document.createElement('div'); div.className = 'mod'; div.dataset.mod = k;
    div.innerHTML = `<button aria-expanded="false"><span class="mn">${k}</span><span>${m.title}</span><span class="mc"></span></button><ul>${m.ls.map(l => `<li><a href="#${l.id}" data-id="${l.id}"><span class="tick">○</span><span>${lnum(l)} ${l.dataset.title}</span></a></li>`).join('')}</ul>`;
    div.querySelector('button').onclick = e => { const o = div.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
    side.appendChild(div);
  });

  function progress() { return Object.values(done).filter(Boolean).length; }
  function refresh() {
    const c = progress();
    $('#prog-mini').textContent = `${c}/${total}`;
    $('#prog-text').textContent = `${c} de ${total} lecciones completadas`;
    $('#prog-bar i').style.width = (c / total * 100) + '%';
    $('#prog-bar').setAttribute('aria-valuenow', c); $('#prog-bar').setAttribute('aria-valuemax', total);
    $$('.mod', side).forEach(d => { const m = modInfo[d.dataset.mod]; d.querySelector('.mc').textContent = `${m.ls.filter(l => done[l.id]).length}/${m.ls.length}`; });
    $$('a[data-id]', side).forEach(a => { const ok = !!done[a.dataset.id]; a.classList.toggle('done', ok); a.querySelector('.tick').textContent = ok ? '✔' : '○'; });
    lessons.forEach(l => { const b = l.querySelector('[data-mark]'); const ok = !!done[l.id]; b.setAttribute('aria-pressed', ok); b.textContent = ok ? '☑ Completada' : '☐ Marcar como completada'; });
    const ol = $('#path-steps'); ol.innerHTML = '';
    Object.keys(modInfo).forEach(k => {
      const m = modInfo[k], dn = m.ls.filter(l => done[l.id]).length, li = document.createElement('li'); li.className = dn === m.ls.length ? 'done' : '';
      li.innerHTML = `<a href="#${m.ls[0].id}"><b>${k}</b>${m.title}<small>${dn}/${m.ls.length}</small></a>`; ol.appendChild(li);
    });
    const nxt = lessons.find(l => !done[l.id]) || lessons[0], cta = $('#cta');
    cta.href = '#' + (last && document.getElementById(last) && !done[last] ? last : nxt.id);
    cta.textContent = c ? 'Continuar donde lo dejaste' : 'Comenzar';
  }

  /* ---- enrutador ---- */
  const shell = document.querySelector('.shell'), mb = $('#menu-btn');
  const small = () => matchMedia('(max-width:980px)').matches;
  function setMenu(open) {
    if (small()) shell.classList.toggle('drawer', open); else shell.classList.toggle('collapsed', !open);
    mb.setAttribute('aria-expanded', open);
  }
  mb.onclick = () => setMenu(small() ? !shell.classList.contains('drawer') : shell.classList.contains('collapsed'));
  $('#scrim').onclick = () => setMenu(false);

  function route() {
    const id = location.hash.replace('#', ''), cur = lessons.find(l => l.id === id);
    hero.hidden = !!cur;
    mods.forEach(m => { m.hidden = !(cur && m.dataset.module === cur.dataset.mod); });
    lessons.forEach(l => { l.hidden = l !== cur; });
    $$('a[data-id]', side).forEach(a => a.classList.toggle('cur', cur && a.dataset.id === cur.id));
    $('[data-home]', side).classList.toggle('cur', !cur);
    $$('.mod', side).forEach(d => { const o = !!cur && d.dataset.mod === cur.dataset.mod; if (o) { d.classList.add('open'); d.querySelector('button').setAttribute('aria-expanded', true); } });
    if (cur) {
      const i = lessons.indexOf(cur), pv = lessons[i - 1], nx = lessons[i + 1];
      const a = cur.querySelector('[data-prev]'), b = cur.querySelector('[data-next]');
      a.hidden = !pv; if (pv) { a.href = '#' + pv.id; a.textContent = '← ' + lnum(pv) + ' ' + pv.dataset.title; }
      if (nx) { b.href = '#' + nx.id; b.textContent = lnum(nx) + ' ' + nx.dataset.title + ' →'; } else { b.href = '#inicio'; b.textContent = 'Terminar y volver a la portada'; }
      $('#crumb').textContent = `Módulo ${cur.dataset.mod} · ${lnum(cur)} ${cur.dataset.title}`;
      document.title = `${lnum(cur)} ${cur.dataset.title} — Mecanismos Vivos`;
      last = cur.id; try { localStorage.setItem('mv-last', last); } catch (e) { /* sin almacenamiento */ }
    } else { $('#crumb').textContent = ''; document.title = 'Máquinas y Mecanismos — laboratorio interactivo'; }
    if (small()) setMenu(false);
    refresh();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  if (small()) { shell.classList.remove('collapsed'); mb.setAttribute('aria-expanded', false); } else mb.setAttribute('aria-expanded', true);
  route();
})();
