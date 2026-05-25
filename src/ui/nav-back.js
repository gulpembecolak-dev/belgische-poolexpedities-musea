/**
 * nav-back.js — fixed back button with lantaarn accent.
 * Touch target ≥ 88×88px.
 */

export function createNavBack() {
  let el = null;
  let handler = null;

  return {
    mount(container, onBack) {
      if (el) return;
      handler = onBack;

      el = document.createElement('button');
      el.type = 'button';
      el.className = 'nav-back';
      el.setAttribute('aria-label', 'Terug');
      el.innerHTML = `
        <svg class="nav-back__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span class="nav-back__label">Terug</span>
      `;

      el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        handler?.();
      });

      container.appendChild(el);

      // Fade in
      requestAnimationFrame(() => {
        el.classList.add('nav-back--visible');
      });
    },

    unmount() {
      if (!el) return;
      el.classList.remove('nav-back--visible');
      const ref = el;
      setTimeout(() => ref?.parentNode?.removeChild(ref), 400);
      el = null;
      handler = null;
    },
  };
}
