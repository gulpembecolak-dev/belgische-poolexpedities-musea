/**
 * subtitle.js — bottom-center caption overlay with fade.
 */
export function createSubtitle() {
  let el = null;
  let currentText = '';
  let hideTimer = 0;

  return {
    mount(container) {
      if (el) return;
      el = document.createElement('div');
      el.className = 'subtitle';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      container.appendChild(el);
    },

    show(text) {
      if (!el) return;
      if (text === currentText && el.classList.contains('subtitle--visible')) return;

      const apply = () => {
        currentText = text;
        el.textContent = text;
        // eslint-disable-next-line no-unused-expressions
        el.offsetWidth;
        el.classList.add('subtitle--visible');
      };

      if (el.classList.contains('subtitle--visible')) {
        el.classList.remove('subtitle--visible');
        clearTimeout(hideTimer);
        hideTimer = window.setTimeout(apply, 200);
      } else {
        apply();
      }
    },

    hide() {
      if (!el) return;
      el.classList.remove('subtitle--visible');
      currentText = '';
    },

    destroy() {
      clearTimeout(hideTimer);
      if (el && el.parentNode) el.parentNode.removeChild(el);
      el = null;
      currentText = '';
    },
  };
}
