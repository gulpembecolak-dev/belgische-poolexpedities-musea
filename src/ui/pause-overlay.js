// Pause overlay — resume / close controls

/**
 * Create the pause-overlay controller.
 * @returns {{ mount, show, hide, isVisible, destroy }}
 */
export function createPauseOverlay() {
  /** @type {HTMLDivElement|null} */
  let el = null;
  let visible = false;

  return {
    /**
     * Mount the overlay into `container`.
     * @param {HTMLElement} container
     * @param {{ onResume: Function, onClose: Function }} callbacks
     */
    mount(container, { onResume, onClose }) {
      el = document.createElement('div');
      el.id = 'pause-overlay';
      el.className = 'pause-overlay';
      el.style.display = 'none';

      el.innerHTML = `
        <div class="pause-overlay__content">
          <button id="btn-resume" class="pause-btn pause-btn--primary">▶ Hervatten</button>
          <button id="btn-close"  class="pause-btn pause-btn--secondary">✕ Sluiten</button>
        </div>
      `;

      container.appendChild(el);

      el.querySelector('#btn-resume').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        onResume();
      });

      el.querySelector('#btn-close').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        onClose();
      });
    },

    show() {
      if (!el) return;
      visible = true;
      el.style.display = 'flex';
      // Trigger reflow before opacity transition
      void el.offsetHeight;
      el.style.opacity = '1';
    },

    hide() {
      if (!el) return;
      visible = false;
      el.style.opacity = '0';
      setTimeout(() => {
        if (el) el.style.display = 'none';
      }, 200);
    },

    get isVisible() {
      return visible;
    },

    destroy() {
      if (el?.parentNode) el.parentNode.removeChild(el);
      el = null;
      visible = false;
    },
  };
}
