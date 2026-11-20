/* Mecanismos Vivos — glosario interactivo, prerrequisitos, «qué no confundir» y ejercicios por lección */
'use strict';
(function repaso() {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- prerrequisitos ---------- */
  const PRE = {
    'l1-2': ['1.1'], 'l1-3': ['1.2'], 'l1-4': ['1.1', '1.3'], 'l1-5': ['1.3'], 'l1-6': ['1.5'],
    'l2-1': ['1.5'], 'l2-2': ['2.1'], 'l2-3': ['2.2'], 'l2-4': ['2.2', '2.3'], 'l2-5': ['2.1'],
    'l3-1': ['2.1'], 'l3-2': ['2.2', '3.1'], 'l3-3': ['3.2'],
    'l4-1': ['2.2', '3.2'], 'l4-2': ['4.1'], 'l4-3': ['4.2'], 'l4-4': ['4.3'],
    'l5-1': ['4.1'], 'l5-2': ['5.1'], 'l5-3': ['5.2'], 'l5-4': ['5.3'],
    'l6-1': ['4.1', '5.1'], 'l6-2': ['6.1'], 'l6-3': ['6.1'], 'l6-4': ['6.3'],
    'l7-1': ['5.4', '6.2'], 'l7-2': ['7.1'], 'l8-1': ['5.2', '7.1'], 'l8-2': ['4.1', '5.2'],
    'l9-1': ['1.1', '2.1'], 'l9-2': ['9.1'], 'l9-3': ['9.1', '2.3'], 'l9-4': ['9.1'], 'l9-5': ['9.1']
  };

  /* ---------- «qué no debes confundir» ---------- */
  const CONF = {
    'l1-1': 'El motor no es el mecanismo: el actuador entrega movimiento o esfuerzo; el mecanismo determina cómo se transmite o se transforma.',
    'l1-2': 'No confundir velocidad con rapidez, ni desplazamiento con distancia recorrida. Un punto que vuelve al origen tiene desplazamiento cero aunque haya recorrido una distancia positiva.',
    'l1-3': 'La forma exterior de una pieza no determina por sí sola su movimiento. Importan sus conexiones y sus dimensiones geométricas.',
    'l1-4': 'Un mecanismo no es sinónimo de «dispositivo de baja fuerza»: una prensa industrial incorpora mecanismos que soportan cargas enormes. Máquina y mecanismo se distinguen por su función, no por la magnitud de las fuerzas.',
    'l1-5': 'La clase de un par se puede definir por los movimientos que permite (GDL) o por las restricciones que impone (6 − GDL). Este curso usa los GDL; comprueba qué criterio usa tu libro antes de comparar tablas.',
    'l1-6': 'No digas que el tornillo «avanza»: puede girar sin desplazarse axialmente mientras las tuercas se trasladan. Y el número de eslabones depende del modelo: se enumera, no se describe como «varios».',
    'l2-1': 'Un perno no bloquea todo el movimiento: impide las traslaciones relativas del punto articulado, pero permite la rotación relativa.',
    'l2-2': 'No mezcles las restricciones de un par plano con las de un par espacial. El mismo nombre de par debe analizarse dentro del modelo y del sistema de coordenadas elegidos.',
    'l2-3': 'El engranaje no crea potencia: lo que ganas en par lo pierdes en velocidad, y además hay pérdidas por fricción.',
    'l2-4': 'No confundas paso con avance por vuelta en roscas de varias entradas (avance = n.º de entradas × paso). El sentido del avance depende de la mano de la rosca y de qué pieza se inmoviliza.',
    'l2-5': 'Un actuador no siempre es un eslabón único: un cilindro incluye al menos dos cuerpos móviles entre sí (cuerpo y vástago).',
    'l3-1': 'Dibujar una barra delgada no significa que la pieza real sea delgada: el esquema elimina los detalles que no cambian la geometría del movimiento.',
    'l3-2': 'No elijas la bancada solo por ser la pieza más grande: es la referencia adoptada para el análisis, no necesariamente un cuerpo fijo a la Tierra.',
    'l3-3': 'La movilidad calculada no garantiza que todo el recorrido sea posible: hay que comprobar la geometría, los topes y las ramas de ensamblaje.',
    'l4-1': 'M = 1 no significa que cualquier ángulo de cualquier eslabón pueda elegirse libremente en todo el recorrido: puede haber límites y singularidades.',
    'l4-2': 'El conteo de movilidad dice cuántas coordenadas independientes hay; no informa de velocidades, fuerzas ni interferencias.',
    'l4-3': 'No confundas movilidad finita, movilidad instantánea y ensamblabilidad: un conjunto que no puede montarse no tiene trayectoria real que analizar.',
    'l4-4': 'El Jacobiano describe movimientos infinitesimales. En una singularidad, esa libertad instantánea adicional no siempre se mantiene como movimiento finito.',
    'l5-1': 'En una inversión no se cambian las barras, solo cuál es la referencia fija. Compara siempre la misma rama de ensamblaje.',
    'l5-2': 'Grashof no describe fuerzas ni garantiza ausencia de interferencias, ni basta por sí solo para asegurar una trayectoria útil en todo el recorrido.',
    'l5-3': 'Una raíz cuadrada puede dar dos posiciones. No es un error: son ramas de ensamblaje distintas que se interpretan geométricamente.',
    'l5-4': 'Una cifra precisa no está validada solo porque coincida con la animación: verifica unidades, redondeo y residuales geométricos.',
    'l6-1': 'La manivela no siempre puede girar 360° con cualquier longitud: hay que comprobar que el mecanismo exista en todo el ciclo (r + e ≤ l).',
    'l6-2': 'Retorno rápido significa que una carrera tarda menos que la otra (con manivela a velocidad constante); no significa que la corredera tenga velocidad constante en cada carrera.',
    'l6-3': 'No todas las trayectorias que parecen rectas lo son: algunos mecanismos solo generan una aproximación en un intervalo.',
    'l6-4': 'La exactitud geométrica ideal no elimina los efectos reales: holguras, deformaciones y tolerancias introducen errores de trayectoria.',
    'l7-1': 'Un resultado calculado por software no es correcto solo por aparecer en pantalla: valida unidades, condiciones de frontera y residuales.',
    'l7-2': 'Precisión (dispersión entre medidas) y exactitud (cercanía a una referencia) no significan lo mismo.',
    'l8-1': 'Un diseño no se aprueba por estética: debe poder ensamblarse, funcionar en el recorrido previsto y cumplir sus restricciones.',
    'l8-2': 'Acertar un número por casualidad no demuestra comprensión: la respuesta debe incluir el procedimiento y la interpretación física.',
    'l9-1': 'Un sistema puede pertenecer a varias categorías. No fuerces a clasificar un engranaje solo como «transmisor» o solo como «modificador de velocidad».',
    'l9-2': 'En una carretilla que se levanta, la fuerza en los mangos es hacia arriba. Además, el trabajo no siempre es F·d: solo si la fuerza es constante y está alineada con el desplazamiento.',
    'l9-3': 'No intercambies número de dientes y diámetros en cualquier sistema, ni supongas que todo sinfín es irreversible: depende del ángulo de la hélice y del rozamiento.',
    'l9-4': 'No toda leva produce movimiento lineal ni todo mecanismo de biela produce rotación continua: depende de la geometría y de cuál elemento es la entrada.',
    'l9-5': 'El amortiguador no acumula energía: la disipa en calor. Y no toda cruz de Malta gira 90° por paso: son 360°/n según el número de ranuras.'
  };

  /* ---------- ejercicios: [pregunta, respuesta] ---------- */
  const EX = {
    'l1-1': ['En un limpiaparabrisas, identifica la entrada, la salida y la estructura de apoyo.', 'Entrada: el giro del motor. Salida: la oscilación de la escobilla. Estructura de apoyo (bancada): la carrocería.'],
    'l1-2': ['Un carro va 3 m a la derecha y luego 1 m a la izquierda. Calcula la distancia recorrida y el desplazamiento.', 'Distancia recorrida: 3 + 1 = 4 m. Desplazamiento: +3 − 1 = +2 m (2 m a la derecha del origen).'],
    'l1-3': ['Clasifica la puerta, el cajón de un escritorio y la biela de una manivela-corredera según su movimiento.', 'Puerta: rotación pura. Cajón: traslación rectilínea. Biela: movimiento plano general (se traslada y gira a la vez).'],
    'l1-4': ['Para diseñar una prensa, ¿qué pregunta es cinemática y cuál es de fuerzas?', 'Cinemática: ¿qué recorrido hace el punzón y a qué velocidad? De fuerzas: ¿qué esfuerzo se necesita para cortar o prensar y qué carga soportan los eslabones?'],
    'l1-5': ['En una cadena de cuatro barras identifica los eslabones, las uniones y la bancada.', 'Cuatro eslabones (bancada, manivela, acoplador y balancín) unidos por cuatro pares de revoluta (R). La bancada es el eslabón elegido como referencia fija.'],
    'l1-6': ['Describe qué parte gira, qué parte se aproxima a otra y qué parte sube al accionar un gato de tijera.', 'Gira el tornillo (con la manivela); los bloques roscados se acercan entre sí a lo largo del tornillo; el plato superior sube porque los brazos se enderezan.'],
    'l2-1': ['¿Una puerta con bisagra conserva la traslación relativa o la rotación? Justifica.', 'Conserva la rotación: la bisagra (perno) impide las traslaciones relativas entre puerta y marco, pero permite el giro alrededor de su eje.'],
    'l2-2': ['Compara un perno, una corredera y una rótula: ¿qué movimientos relativos permite cada uno?', 'Perno: 1 rotación (1 GDL). Corredera: 1 traslación (1 GDL). Rótula: 3 rotaciones (3 GDL, par esférico en el espacio).'],
    'l2-3': ['Un piñón de 15 dientes impulsa una rueda de 45 dientes a 900 rpm… ¿a qué velocidad gira la salida y en qué sentido? (el piñón es la entrada)', 'i = 45/15 = 3 → la salida gira a 900/3 = 300 rpm, en sentido opuesto (engranes exteriores).'],
    'l2-4': ['Una rosca de dos entradas y paso de 2 mm, ¿cuánto avanza en 3 vueltas?', 'Avance por vuelta = entradas × paso = 2 × 2 = 4 mm. En 3 vueltas: 12 mm de desplazamiento relativo.'],
    'l2-5': ['Propón un actuador para elevar lentamente una carga grande y di qué magnitud debes conocer antes de elegirlo.', 'Un cilindro hidráulico (o un husillo con motorreductor). Hay que conocer la fuerza o carga a vencer y la carrera y velocidad requeridas (y la presión disponible).'],
    'l3-1': ['¿Por qué un cuerpo soldado a una base se considera parte de la misma bancada en el diagrama?', 'Porque no hay movimiento relativo entre ellos: soldados forman un único cuerpo rígido, es decir, un solo eslabón.'],
    'l3-2': ['Toma unas tijeras: ¿cuántos cuerpos rígidos principales hay y qué unión comparten?', 'Dos cuerpos (cada hoja con su mango) unidos por un único perno: un par de revoluta.'],
    'l3-3': ['¿Qué cambiaría si la barra de unión estuviera soldada al mango de la prensa?', 'Pasaría a ser parte del mango: un eslabón menos y una unión menos. Hay que volver a contar n y j y recalcular la movilidad.'],
    'l4-1': ['Calcula M para una barra articulada a una bancada: n = 2, j₁ = 1.', 'M = 3(2 − 1) − 2·1 = 1: un único giro es posible.'],
    'l4-2': ['Explica por qué agregar una articulación controlada a una cadena abierta suele agregar un GDL.', 'Cada articulación nueva añade un eslabón móvil (+3) y una unión R (−2): ΔM = +1.'],
    'l4-3': ['Si un rodillo gira sin que cambie la posición del seguidor, ¿por qué ese giro puede considerarse pasivo?', 'Porque es un GDL inactivo: no modifica la relación entrada-salida. Se puede excluir al calcular la movilidad útil, anotando que existe.'],
    'l4-4': ['Antes de operar con el Jacobiano, indica en palabras qué variables se pueden ajustar y qué condiciones deben cumplirse.', 'Las variables son las coordenadas generalizadas (ángulos y posiciones); las condiciones son las ecuaciones de restricción (cierre de los lazos) que deben seguir cumpliéndose.'],
    'l5-1': ['Con cuatro barras de las mismas longitudes en dos casos, ¿qué cambia al fijar un eslabón diferente?', 'No cambian las longitudes; cambia la referencia, y con ella qué eslabón gira, cuál oscila y qué movimiento se observa (manivela-balancín, doble manivela, doble balancín…).'],
    'l5-2': ['Longitudes 3, 4, 5 y 6 cm: s + l = 9 y p + q = 9. ¿Cómo se clasifica?', 'Es el caso límite (s + l = p + q), no un Grashof estricto: aparecen configuraciones colineales, donde el movimiento puede continuar de varias formas.'],
    'l5-3': ['Dibuja dos circunferencias de radios r₃ y r₄ desde A y O₄. ¿Qué significa que no se corten?', 'Que no existe posición B: con esa entrada el mecanismo no se puede ensamblar. Si se cortan en dos puntos, hay dos ramas de ensamblaje.'],
    'l5-4': ['Antes de usar el simulador, ¿qué dos distancias deben mantenerse para aceptar un punto B?', 'Que |AB| = r₃ (longitud del acoplador) y |O₄B| = r₄ (longitud del balancín).'],
    'l6-1': ['¿Qué cambia si aumentas el radio r manteniendo l y e: la carrera, la velocidad o ambas?', 'Ambas: la carrera crece (≈ 2r) y, con la misma velocidad angular, la velocidad de la corredera también. Pero r + e ≤ l debe seguir cumpliéndose.'],
    'l6-2': ['Con r = 5 cm, l = 15 cm y e = 3 cm, verifica si la manivela puede girar completa.', 'r + e = 5 + 3 = 8 cm ≤ 15 cm = l: sí, la manivela puede dar vueltas completas.'],
    'l6-3': ['¿Cuál escogerías para convertir un giro uniforme en traslación sinusoidal exacta: yugo escocés o cuatro barras genérico?', 'El yugo escocés: su salida es exactamente x = r·cos θ; el cuatro barras genérico solo la aproxima.'],
    'l6-4': ['Explica con palabras por qué el yugo escocés no necesita una biela de longitud l para obtener x = r cos θ.', 'Porque la corredera con ranura se mueve solo en horizontal: su desplazamiento es la proyección horizontal del pasador de la manivela, sin biela intermedia.'],
    'l7-1': ['¿Qué método usarías para explorar 500 ángulos de entrada y por qué?', 'El computacional (hoja de cálculo o script): repite el mismo cálculo automáticamente; a mano o gráficamente sería inviable.'],
    'l7-2': ['Si calculas 10,2 mm y la referencia es 10,0 mm, indica el error absoluto y el relativo.', 'Absoluto: 0,2 mm. Relativo: 0,2/10,0 = 2 %.'],
    'l8-1': ['Formula un requisito verificable: «la salida oscilará entre 60° y 100° de amplitud». ¿Cómo lo comprobarías?', 'Calculando (analítica o numéricamente) el ángulo de salida en todo el recorrido de la entrada y verificando que el máximo y el mínimo estén dentro del intervalo.'],
    'l8-2': ['Antes de responder una pregunta sobre movilidad, ¿qué debes identificar?', 'Los eslabones, la bancada, las uniones (y su tipo) y el modelo cinemático adoptado.'],
    'l9-1': ['Clasifica una cremallera: ¿qué movimiento recibe, cuál entrega y qué transformación realiza?', 'Recibe un giro (el piñón) y entrega una traslación: es una transformación de movimiento circular a lineal.'],
    'l9-2': ['Si el brazo del esfuerzo es 1,0 m y el de la resistencia 0,25 m, ¿qué esfuerzo ideal equilibra 200 N?', 'F · 1,0 = 200 · 0,25 → F = 50 N (ventaja mecánica 4).'],
    'l9-3': ['Una rueda de 60 dientes es impulsada por una de 20. Calcula i, la velocidad de salida con 1200 rpm de entrada y el sentido.', 'i = 60/20 = 3; salida: 1200/3 = 400 rpm; sentido contrario (engranes exteriores).'],
    'l9-4': ['¿Qué mecanismo elegirías para transformar un giro en desplazamiento lineal de ajuste fino? Explica por qué.', 'Tornillo-tuerca con rosca fina: el avance por vuelta es pequeño (entradas × paso) y la reducción es muy grande.'],
    'l9-5': ['Clasifica resorte, amortiguador y volante de inercia según cómo almacenan o disipan energía.', 'Resorte: almacena energía elástica. Volante de inercia: almacena energía cinética de rotación. Amortiguador: no almacena, disipa la energía en calor.']
  };

  /* ---------- glosario ---------- */
  const G = [
    ['Máquina', 'máquinas?', 'Sistema diseñado para realizar una tarea útil integrando componentes mecánicos y, a menudo, eléctricos o de control.'],
    ['Mecanismo', 'mecanismos?', 'Conjunto de eslabones conectados cuyas uniones imponen un movimiento relativo determinado; transmite o transforma movimiento.'],
    ['Eslabón', 'eslab[oó]n(?:es)?', 'Cuerpo, o conjunto de piezas, que se modela como un elemento rígido dentro de un mecanismo.'],
    ['Bancada', 'bancada', 'Eslabón escogido como referencia fija para describir el movimiento del resto. No tiene por qué estar fija a la Tierra.'],
    ['Par cinemático', 'pares? cinem[aá]ticos?|pares?', 'Conexión idealizada entre dos eslabones que permite algunos movimientos relativos e impide otros.'],
    ['Revoluta (R)', 'revoluta', 'Par que permite una rotación relativa alrededor de un eje (bisagra, perno).'],
    ['Prismático (P)', 'prism[aá]tico', 'Par que permite una traslación relativa a lo largo de una guía (corredera).'],
    ['Cuerpo rígido', 'cuerpo r[ií]gido', 'Idealización: un cuerpo cuyos puntos conservan siempre la distancia entre sí, sin deformarse.'],
    ['Grado de libertad (GDL)', 'grados? de libertad|GDL', 'Cada movimiento independiente posible, o cada variable independiente necesaria para describir la configuración.'],
    ['Movilidad (M)', 'movilidad', 'Número de coordenadas independientes necesarias para describir localmente la configuración de un mecanismo.'],
    ['Restricción', 'restricci[oó]n|restricciones', 'Relación geométrica o cinemática que limita los movimientos posibles.'],
    ['Coordenada generalizada', 'coordenadas? generalizadas?', 'Variable (ángulo, distancia) elegida para describir la configuración de un sistema.'],
    ['Cadena cinemática', 'cadenas? cinem[aá]ticas?', 'Conjunto de eslabones unidos por pares. Es cerrada si forma lazos y abierta si no.'],
    ['Manivela', 'manivela', 'Eslabón que puede dar vueltas completas respecto a un pivote de referencia.'],
    ['Balancín', 'balanc[ií]n', 'Eslabón que oscila angularmente dentro de un intervalo.'],
    ['Acoplador', 'acoplador|biela', 'Eslabón móvil que conecta otros dos y no está unido a la bancada (en el motor, la biela).'],
    ['Actuador', 'actuadores?', 'Elemento que convierte energía disponible (eléctrica, hidráulica, neumática) en movimiento y esfuerzo mecánico.'],
    ['Cinemática', 'cinem[aá]tica', 'Descripción geométrica del movimiento (posición, velocidad, aceleración) sin estudiar sus causas.'],
    ['Cinética', 'cin[eé]tica', 'Relación entre las fuerzas, la masa y el movimiento resultante.'],
    ['Estática', 'est[aá]tica', 'Estudio del equilibrio de fuerzas y momentos.'],
    ['Par motor', 'par motor|torque', 'Momento aplicado en torno a un eje que tiende a producir giro.'],
    ['Potencia', 'potencia', 'Trabajo realizado por unidad de tiempo. En rotación: P = M·ω; en traslación: P = F·v.'],
    ['Rendimiento', 'rendimiento', 'Cociente entre la potencia útil de salida y la potencia suministrada (η, siempre ≤ 1).'],
    ['Relación de transmisión', 'relaci[oó]n de transmisi[oó]n', 'Cociente i = ω_entrada / ω_salida. Si i > 1 reduce la velocidad y aumenta el par.'],
    ['Ventaja mecánica', 'ventaja mec[aá]nica', 'Cociente entre la fuerza de salida (carga) y la de entrada (esfuerzo) en el modelo ideal.'],
    ['Inversión cinemática', 'inversi[oó]n(?:es)? cinem[aá]ticas?', 'Cambio del eslabón que se toma como bancada en una misma cadena cinemática.'],
    ['Grashof', 'Grashof', 'Condición entre las longitudes de un cuatro barras (s + l ≤ p + q) que permite que algún eslabón dé vueltas completas.'],
    ['Rama de ensamblaje', 'ramas? de ensamblaje', 'Una de las posibles formas de montar el mecanismo para la misma entrada (por ejemplo, «codo arriba» o «codo abajo»).'],
    ['Singularidad', 'singularidad(?:es)?', 'Configuración donde las restricciones pierden independencia o la relación entrada-salida es excepcional.'],
    ['Jacobiano', 'jacobiano', 'Matriz de derivadas parciales de las ecuaciones de restricción; su rango indica los movimientos infinitesimales posibles.'],
    ['Ángulo de transmisión', '[aá]ngulo de transmisi[oó]n', 'Ángulo entre acoplador y salida; indica qué parte de la fuerza del acoplador mueve realmente la salida.'],
    ['Carrera', 'carrera', 'Distancia lineal entre las posiciones extremas de un elemento alternativo.'],
    ['Desfase (excentricidad)', 'desfase', 'Separación perpendicular entre la guía de una corredera y el eje de la manivela.']
  ];
  const termHtml = g => `<dt>${g[0]}</dt><dd>${g[2]}</dd>`;

  /* ---------- 1) bloques por lección ---------- */
  const lessons = $$('article.lesson');
  const numOf = id => id.replace('l', '').replace('-', '.');
  const titleOf = n => { const l = document.getElementById('l' + n.replace('.', '-')); return l ? l.dataset.title : ''; };

  lessons.forEach(l => {
    const id = l.id, obj = $('.obj', l);
    if (obj && PRE[id]) {
      const p = document.createElement('p'); p.className = 'prereq';
      p.innerHTML = '<b>Antes de empezar:</b> ' + PRE[id].map(n => `<a href="#l${n.replace('.', '-')}" title="${titleOf(n)}">lección ${n}</a>`).join(' · ');
      obj.after(p);
    }
  });

  /* ---------- 2) términos del glosario con definición emergente ---------- */
  const pop = document.createElement('div'); pop.className = 'gl-pop'; pop.hidden = true; pop.setAttribute('role', 'tooltip'); document.body.appendChild(pop);
  let popFor = null;
  const hidePop = () => { pop.hidden = true; popFor = null; };
  const showPop = el => {
    if (popFor === el) return hidePop();
    popFor = el; pop.innerHTML = `<b>${el.dataset.t}</b><span>${el.dataset.d}</span>`; pop.hidden = false;
    const r = el.getBoundingClientRect(), w = Math.min(320, innerWidth - 24);
    pop.style.width = w + 'px';
    pop.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.left + scrollX)) + 'px';
    pop.style.top = (r.bottom + scrollY + 8) + 'px';
  };
  document.addEventListener('click', e => { const t = e.target.closest('.gl'); if (t) { e.preventDefault(); showPop(t); } else if (!e.target.closest('.gl-pop')) hidePop(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hidePop(); if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('gl')) { e.preventDefault(); showPop(e.target); } });
  addEventListener('hashchange', hidePop);

  const SKIP = 'svg,a,button,.gl,.vz-host,.vz-banner,.vz-clip,.vz-photos,.lesson-head,.eq,.eq-i,.ck,.confuse,.exercise,.prereq,.lesson-foot,summary,script,style,h1,h2,h3,code,figcaption';
  const rxs = G.map(g => ({ g, rx: new RegExp('(?<![\\p{L}\\d_])(' + g[1] + ')(?![\\p{L}\\d_])', 'iu') }));
  lessons.forEach(l => {
    const done = new Set();
    const walker = document.createTreeWalker(l, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.nodeValue.trim().length > 2 && !n.parentElement.closest(SKIP)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      let node = n;
      for (const { g, rx } of rxs) {
        if (done.has(g[0]) || !node.parentNode) continue;
        const m = rx.exec(node.nodeValue); if (!m) continue;
        const rest = node.splitText(m.index), after = rest.splitText(m[0].length);
        const sp = document.createElement('span'); sp.className = 'gl'; sp.tabIndex = 0; sp.setAttribute('role', 'button'); sp.dataset.t = g[0]; sp.dataset.d = g[2]; sp.textContent = m[0];
        rest.replaceWith(sp); done.add(g[0]); node = after;
      }
    });
  });

  /* ---------- 3) «Qué no debes confundir» + ejercicio (antes del pie de cada lección) ---------- */
  lessons.forEach(l => {
    const id = l.id, foot = $('.lesson-foot', l); if (!CONF[id] && !EX[id]) return;
    const box = document.createElement('div'); box.className = 'recap';
    let html = '';
    if (CONF[id]) html += `<div class="confuse"><b>⚠ Qué no debes confundir</b><p>${CONF[id]}</p></div>`;
    if (EX[id]) html += `<details class="exercise"><summary><b>✏️ Ejercicio corto</b> <span>— intenta responder antes de abrir</span></summary><p class="ex-q">${EX[id][0]}</p><p class="ex-a"><b>Respuesta:</b> ${EX[id][1]}</p></details>`;
    box.innerHTML = html; foot ? foot.before(box) : l.appendChild(box);
  });

  /* ---------- 4) panel de glosario ---------- */
  const panel = document.createElement('aside'); panel.className = 'gl-panel'; panel.hidden = true; panel.setAttribute('aria-label', 'Glosario');
  panel.innerHTML = `<div class="gl-head"><b>📚 Glosario</b><button type="button" class="btn small" id="gl-close" aria-label="Cerrar glosario">✕</button></div><input type="search" id="gl-q" placeholder="Buscar término…" aria-label="Buscar en el glosario"><dl id="gl-list">${G.slice().sort((a, b) => a[0].localeCompare(b[0], 'es')).map(termHtml).join('')}</dl><p class="gl-hint">En cada lección, las palabras subrayadas con puntos muestran su definición al tocarlas.</p>`;
  document.body.appendChild(panel);
  const open = v => { panel.hidden = !v; if (v) $('#gl-q', panel).focus(); };
  $('#gl-close', panel).onclick = () => open(false);
  $('#gl-q', panel).addEventListener('input', e => {
    const q = e.target.value.trim().toLocaleLowerCase('es');
    $$('#gl-list dt', panel).forEach(dt => { const dd = dt.nextElementSibling, ok = !q || (dt.textContent + ' ' + dd.textContent).toLocaleLowerCase('es').includes(q); dt.hidden = dd.hidden = !ok; });
  });
  const pause = document.getElementById('pause');
  if (pause) { const b = document.createElement('button'); b.className = 'btn small'; b.id = 'gl-open'; b.type = 'button'; b.textContent = '📚 Glosario'; b.onclick = () => open(panel.hidden); pause.before(b); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) open(false); });
})();
