// Subtitle DOM overlay

/**
 * Create a subtitle controller.
 * @returns {{ mount, show, hide, destroy }}
 */
export function createSubtitle() {
  /** @type {HTMLDivElement|null} */
  let el = null;
  let currentText = '';

  return {
    /** Append the subtitle element to `container`. */
    mount(container) {
      el = document.createElement('div');
      el.id = 'subtitle-overlay';
      el.className = 'subtitle';
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('role', 'status');
      container.appendChild(el);
    },

    /**
     * Display `text`. If `text` is already showing, skip.
     * Fades out 200 ms then fades in the new text.
     */
    show(text) {
      if (!el || text === currentText) return;
      currentText = text;
      el.style.opacity = '0';
      setTimeout(() => {
        if (!el) return;
        el.textContent = text;
        el.style.opacity = '1';
      }, 200);
    },

    /** Fade the subtitle out. */
    hide() {
      if (!el) return;
      el.style.opacity = '0';
      currentText = '';
    },

    destroy() {
      if (el?.parentNode) el.parentNode.removeChild(el);
      el = null;
      currentText = '';
    },
  };
}
