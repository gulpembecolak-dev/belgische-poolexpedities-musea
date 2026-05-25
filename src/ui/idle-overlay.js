/**
 * idle-overlay.js — auto-reset for museum kiosk.
 * After 2 minutes of no touch → warning → after 15s more → reset to opening.
 */

const IDLE_MS = 120_000;     // 2 minutes
const WARNING_MS = 15_000;   // 15 seconds warning before reset

export function createIdleTimer(container, onReset) {
  let idleTimeout = 0;
  let warningTimeout = 0;
  let warningEl = null;
  let active = false;

  function createWarning() {
    warningEl = document.createElement('div');
    warningEl.className = 'idle-warning';
    warningEl.innerHTML = `
      <div class="idle-warning__content">
        <div class="idle-warning__dot"></div>
        <p class="idle-warning__text">Tik om door te gaan</p>
        <p class="idle-warning__sub">De ervaring wordt binnenkort hersteld.</p>
      </div>
    `;
    container.appendChild(warningEl);
    requestAnimationFrame(() => {
      warningEl?.classList.add('idle-warning--visible');
    });
  }

  function removeWarning() {
    if (warningEl) {
      warningEl.classList.remove('idle-warning--visible');
      const ref = warningEl;
      setTimeout(() => ref?.parentNode?.removeChild(ref), 600);
      warningEl = null;
    }
  }

  function showWarning() {
    createWarning();
    warningTimeout = setTimeout(() => {
      removeWarning();
      onReset?.();
    }, WARNING_MS);
  }

  function resetTimer() {
    clearTimeout(idleTimeout);
    clearTimeout(warningTimeout);
    removeWarning();
    if (active) {
      idleTimeout = setTimeout(showWarning, IDLE_MS);
    }
  }

  const onTouch = () => resetTimer();

  return {
    start() {
      active = true;
      window.addEventListener('pointerdown', onTouch, { passive: true });
      window.addEventListener('pointermove', onTouch, { passive: true });
      resetTimer();
    },

    stop() {
      active = false;
      clearTimeout(idleTimeout);
      clearTimeout(warningTimeout);
      removeWarning();
      window.removeEventListener('pointerdown', onTouch);
      window.removeEventListener('pointermove', onTouch);
    },

    /** Call after any navigation to reset the timer */
    ping() {
      resetTimer();
    },

    /** Temporarily freeze — timeouts cleared, listeners stay. */
    pause() {
      clearTimeout(idleTimeout);
      clearTimeout(warningTimeout);
      removeWarning();
    },

    /** Restart after a pause (only if previously started). */
    resume() {
      if (active) resetTimer();
    },

    destroy() {
      this.stop();
    },
  };
}
