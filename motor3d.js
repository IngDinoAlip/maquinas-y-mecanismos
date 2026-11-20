/* Mecanismos Vivos — visor 3D del motor (model-viewer + estudio de movimiento exportado a .glb).
   Se carga bajo demanda: ni el visor ni el modelo se descargan hasta que la lección está en pantalla.
   El modelo va en base64 dentro de motor/motor-glb.js para que funcione también al abrir index.html desde el disco. */
'use strict';

(function motor3d() {
  const fig = $('#mm3d'); if (!fig) return;
  const mv = $('#mm3d-mv'), ph = $('.mm-3d-ph', fig), bar = $('.mm-3d-bar', fig);
  const btnPlay = $('#mm3d-play'), sl = $('#mm3d-t'), out = $('#mm3d-time'), sp = $('#mm3d-speed'), rot = $('#mm3d-rot'), rst = $('#mm3d-reset');
  let started = false, playing = !reduceMotion, home = null, lastGlobal = state.paused, drag = false;

  const loadScript = src => new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => ko(new Error(src)); document.head.appendChild(s); });
  const fail = msg => { ph.hidden = false; ph.textContent = msg; };

  async function start() {
    if (started) return; started = true;
    try {
      const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
      if (!gl) throw new Error('webgl');
      await loadScript('motor/vendor/model-viewer-umd.min.js');
      await loadScript('motor/motor-glb.js');
      mv.addEventListener('load', () => {
        ph.hidden = true; bar.hidden = false;
        sl.max = String(mv.duration || 10);
        try { home = mv.getCameraOrbit().toString(); } catch (e) { home = null; }
        if (!playing) mv.pause();
      }, { once: true });
      mv.addEventListener('error', () => fail('No se pudo mostrar el modelo 3D. Recarga la página o prueba con otro navegador.'));
      mv.src = window.MOTOR_GLB;
    } catch (e) {
      fail(e.message === 'webgl' ? 'Tu navegador no tiene WebGL activo, así que no puede mostrar el modelo 3D. Prueba con otro navegador o activa la aceleración por hardware.' : 'No se pudo cargar el visor 3D. Recarga la página o prueba con otro navegador.');
    }
  }
  new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) start(); }, { rootMargin: '300px' }).observe(fig);

  const setPlay = p => { playing = p; btnPlay.setAttribute('aria-pressed', p); btnPlay.textContent = p ? '⏸ Pausar' : '▶ Reproducir'; p ? mv.play() : mv.pause(); };
  btnPlay.onclick = () => setPlay(!playing);
  sl.addEventListener('input', () => { drag = true; mv.pause(); mv.currentTime = +sl.value; out.textContent = fmt(+sl.value, 2) + ' s'; });
  sl.addEventListener('change', () => { drag = false; if (playing) mv.play(); });
  sp.onchange = () => { mv.timeScale = +sp.value; };
  rot.onclick = () => { mv.autoRotate = !mv.autoRotate; rot.setAttribute('aria-pressed', mv.autoRotate); };
  rst.onclick = () => { if (home) { mv.cameraOrbit = home; mv.fieldOfView = 'auto'; mv.jumpCameraToGoal(); } };

  /* el botón general «Pausar» también detiene el modelo; el control de tiempo sigue al modelo */
  (function sync(now) {
    if (state.paused !== lastGlobal) { lastGlobal = state.paused; if (!bar.hidden) { if (state.paused) mv.pause(); else if (playing) mv.play(); } }
    if (!bar.hidden && !drag && playing && !state.paused) { sl.value = mv.currentTime; out.textContent = fmt(mv.currentTime, 2) + ' s'; }
    requestAnimationFrame(sync);
  })();
})();
