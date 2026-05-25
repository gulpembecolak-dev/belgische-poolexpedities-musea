/**
 * pause-overlay.js — full-viewport pause overlay with Hervatten/Sluiten.
 */
export function createPauseOverlay() {
  let root = null;
  let resumeBtn = null;
  let closeBtn = null;
  let onResume = null;
  let onClose = null;

  return {
    mount(container, handlers = {}) {
      if (root) return;
      onResume = handlers.onResume;
      onClose = handlers.onClose;

      root = document.createElement('div');
      root.className = 'pause-overlay';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');

      resumeBtn = document.createElement('button');
      resumeBtn.type = 'button';
      resumeBtn.className = 'pause-btn pause-btn--primary';
      resumeBtn.textContent = '▶  Hervatten';

      closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'pause-btn pause-btn--secondary';
      closeBtn.textContent = '✕  Sluiten';

      const stop = (e) => e.stopPropagation();
      resumeBtn.addEventListener('pointerdown', stop);
      closeBtn.addEventListener('pointerdown', stop);
      resumeBtn.addEventListener('click', () => onResume?.());
      closeBtn.addEventListener('click', () => onClose?.());

      root.appendChild(resumeBtn);
      root.appendChild(closeBtn);
      container.appendChild(root);
    },

    show() {
      if (!root) return;
      root.classList.add('pause-overlay--visible');
    },

    hide() {
      if (!root) return;
      root.classList.remove('pause-overlay--visible');
    },

    isVisible() {
      return !!root && root.classList.contains('pause-overlay--visible');
    },

    destroy() {
      if (root && root.parentNode) root.parentNode.removeChild(root);
      root = null;
      resumeBtn = null;
      closeBtn = null;
      onResume = null;
      onClose = null;
    },
  };
}
