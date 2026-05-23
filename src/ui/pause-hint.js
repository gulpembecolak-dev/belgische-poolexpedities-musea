// "Tik om verder te gaan" hint element

/**
 * Create the post-scene pause-hint controller.
 * @returns {{ mount, show, hide, destroy }}
 */
export function createPauseHint() {
  /** @type {HTMLDivElement|null} */
  let el = null;

  return {
    mount(container) {
      el = document.createElement('div');
      el.id = 'pause-hint';
      el.className = 'pause-hint';

      el.innerHTML = `
        <span class="pause-hint__dot"></span>
        <span class="pause-hint__text">Tik om verder te gaan</span>
      `;

      container.appendChild(el);
    },

    show() {
      if (el) el.style.opacity = '1';
    },

    hide() {
      if (el) el.style.opacity = '0';
    },

    destroy() {
      if (el?.parentNode) el.parentNode.removeChild(el);
      el = null;
    },
  };
}
