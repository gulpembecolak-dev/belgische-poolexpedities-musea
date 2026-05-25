/**
 * pause-hint.js — pulsing dot + "Tik om verder te gaan".
 */
export function createPauseHint() {
  let root = null;

  return {
    mount(container) {
      if (root) return;
      root = document.createElement('div');
      root.className = 'pause-hint';

      const dot = document.createElement('span');
      dot.className = 'pause-hint__dot';

      const label = document.createElement('span');
      label.textContent = 'Tik om verder te gaan';

      root.appendChild(dot);
      root.appendChild(label);
      container.appendChild(root);
    },

    show() {
      if (!root) return;
      root.classList.add('pause-hint--visible');
    },

    hide() {
      if (!root) return;
      root.classList.remove('pause-hint--visible');
    },

    destroy() {
      if (root && root.parentNode) root.parentNode.removeChild(root);
      root = null;
    },
  };
}
