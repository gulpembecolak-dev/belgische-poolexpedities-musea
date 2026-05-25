/**
 * router.js — lightweight scene state machine for kiosk mode.
 *
 * Scenes conform to: { mount(container, params), unmount(), destroy?.() }
 * No URL routing — this is a museum installation.
 */

/**
 * @param {HTMLElement} container  #app element
 * @param {Object} sceneFactories  { name: createFn(container, params, router) }
 */
export function createRouter(container, sceneFactories) {
  const history = [];
  let current = null;   // { name, instance, params }
  let transitioning = false;

  /** Fade container to black and back for scene transitions */
  const curtain = document.createElement('div');
  curtain.className = 'scene-curtain';
  container.appendChild(curtain);

  function fadeIn() {
    return new Promise((resolve) => {
      curtain.style.opacity = '1';
      curtain.style.pointerEvents = 'auto';
      curtain.addEventListener('transitionend', resolve, { once: true });
      // Fallback if transition doesn't fire
      setTimeout(resolve, 700);
    });
  }

  function fadeOut() {
    return new Promise((resolve) => {
      curtain.style.opacity = '0';
      curtain.addEventListener('transitionend', () => {
        curtain.style.pointerEvents = 'none';
        resolve();
      }, { once: true });
      setTimeout(resolve, 700);
    });
  }

  const router = {
    /**
     * Navigate to a scene. Fades to black, unmounts current, mounts new.
     * @param {string} name   Scene name
     * @param {object} params Scene-specific params (e.g. { id: 'adrien' })
     * @param {object} opts   { pushHistory: true, fade: true }
     */
    async navigate(name, params = {}, opts = {}) {
      const { pushHistory = true, fade = true } = opts;
      if (transitioning) return;
      transitioning = true;

      try {
        // Fade to black (skip for opening → initial mount)
        if (fade && current) await fadeIn();

        // Store previous scene in history
        if (pushHistory && current) {
          history.push({ name: current.name, params: current.params });
        }

        // Unmount current
        if (current?.instance) {
          await current.instance.unmount?.();
          current.instance.destroy?.();
        }

        // Mount new scene
        const factory = sceneFactories[name];
        if (!factory) throw new Error(`Unknown scene: ${name}`);

        const instance = await factory(container, params, router);
        current = { name, instance, params };

        // Fade from black
        if (fade && history.length > 0) await fadeOut();
        else curtain.style.opacity = '0';

      } finally {
        transitioning = false;
      }
    },

    /** Go back to previous scene in history */
    async back() {
      if (history.length === 0 || transitioning) return;
      const prev = history.pop();
      await router.navigate(prev.name, prev.params, { pushHistory: false });
    },

    /** Hard reset to opening (for idle timeout) */
    async reset() {
      if (transitioning) return;
      history.length = 0;
      await router.navigate('opening', {}, { pushHistory: false });
    },

    /** Read current scene name */
    get currentScene() {
      return current?.name ?? null;
    },

    /** Read history depth */
    get depth() {
      return history.length;
    },
  };

  return router;
}
