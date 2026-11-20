/* Mecanismos Vivos — ajustes de maquetación: columnas desiguales y ampliación de imágenes */
'use strict';

(function layout() {
  /* 1) Si en una rejilla una columna es mucho más corta que otra, queda pegada a la pantalla (sticky) y no deja un hueco. */
  function balance() {
    document.querySelectorAll('.grid-2,.grid-3').forEach(g => {
      const cs = [...g.children];
      cs.forEach(c => c.classList.remove('stick'));
      if (!cs.length || g.offsetParent === null) return;
      const rows = {};
      cs.forEach(c => { const r = c.getBoundingClientRect(); if (r.height < 1) return; const k = Math.round(r.top / 6); (rows[k] = rows[k] || []).push({ c, h: r.height, l: Math.round(r.left) }); });
      Object.values(rows).forEach(row => {
        if (row.length < 2 || new Set(row.map(x => x.l)).size < 2) return;
        const mx = Math.max(...row.map(x => x.h));
        row.forEach(x => { if (mx - x.h > 140) x.c.classList.add('stick'); });
      });
    });
  }
  let t = 0; const later = () => { clearTimeout(t); t = setTimeout(balance, 120); };
  addEventListener('resize', later); addEventListener('hashchange', () => { later(); setTimeout(balance, 700); });
  document.addEventListener('toggle', later, true); document.addEventListener('load', later, true);
  if ('ResizeObserver' in window) new ResizeObserver(later).observe(document.querySelector('main'));
  later();

  /* 2) Clic en una imagen para verla grande */
  const lb = document.createElement('div'); lb.className = 'lb'; lb.hidden = true; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Imagen ampliada');
  lb.innerHTML = '<img alt=""><button type="button" aria-label="Cerrar">✕</button>'; document.body.appendChild(lb);
  const big = lb.querySelector('img'), close = () => { lb.hidden = true; big.removeAttribute('src'); };
  lb.addEventListener('click', close); addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) close(); });
  document.addEventListener('click', e => {
    const im = e.target.closest('main img'); if (!im || im.closest('a,button') || im.naturalWidth < 200) return;
    big.src = im.currentSrc || im.src; big.alt = im.alt || ''; lb.hidden = false;
  });
})();
