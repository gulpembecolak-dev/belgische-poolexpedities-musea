// Entry point — Belgische Poolexpedities

import './styles/tokens.css';
import './styles/base.css';
import './styles/selection.css';
import './styles/expedition.css';
import './styles/moment.css';
import './styles/video-intro.css';
import './styles/hubert-expedition.css';
import './styles/pea-expedition.css';
import './styles/adrien-gallery.css';
import './styles/gaston-expedition.css';
import './styles/ask-assistant.css';
import './styles/components.css';

import { createRouter } from './router.js';
import { createOpeningScene } from './scenes/opening.js';
import { createSelectionScene } from './scenes/selection.js';
import { createExpeditionScene } from './scenes/expedition.js';
import { createMomentScene } from './scenes/moment.js';
import { createVideoIntroScene } from './scenes/video-intro.js';
import { createHubertExpeditionScene } from './scenes/hubert-expedition.js';
import { createAdrienExpeditionScene } from './scenes/adrien-expedition.js';
import { createAdrienGalleryScene } from './scenes/adrien-gallery.js';
import { createGastonExpeditionScene } from './scenes/gaston-expedition.js';
import { createPeaExpeditionScene } from './scenes/pea-expedition.js';
import { createIdleTimer } from './ui/idle-overlay.js';

const app = document.getElementById('app');

// ---- Scene factories (router-compatible wrappers) ----

async function openingFactory(container, _params, router) {
  const opening = await createOpeningScene(container);

  opening.onContinue(() => {
    opening.freeze();
    router.navigate('selection', {}, { fade: false });
  });

  await opening.start();

  return {
    unmount() {
      opening.destroy();
      return Promise.resolve();
    },
    destroy() {
      opening.destroy();
    },
  };
}

// ---- Idle timer (museum kiosk auto-reset) ----

const idle = createIdleTimer(app, () => {
  router.reset();
});

// ---- Video-intro wrapper (pauses idle timer during playback) ----

async function videoIntroFactory(container, params, router) {
  idle.pause();
  const scene = await createVideoIntroScene(container, params, router);
  return {
    unmount() {
      idle.resume();
      return scene.unmount();
    },
    destroy() {
      idle.resume();
      scene.destroy();
    },
  };
}

// ---- Router ----

const router = createRouter(app, {
  opening: openingFactory,
  selection: createSelectionScene,
  expedition: createExpeditionScene,
  moment: createMomentScene,
  'video-intro': videoIntroFactory,
  'hubert-expedition': createHubertExpeditionScene,
  'adrien-expedition': createAdrienExpeditionScene,
  'adrien-gallery': createAdrienGalleryScene,
  'gaston-expedition': createGastonExpeditionScene,
  pea: createPeaExpeditionScene,
});

idle.start();

// ---- Launch ----

router.navigate('opening', {}, { fade: false });
