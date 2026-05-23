// Opening scene orchestrator — 5 phases from B&W still to post-narration pause

import { gsap } from 'gsap';
import { createScene3D }      from '../three/scene-3d.js';
import { createNarrator }     from '../audio/narrator.js';
import { createSubtitle }     from '../ui/subtitle.js';
import { createPauseOverlay } from '../ui/pause-overlay.js';
import { createPauseHint }    from '../ui/pause-hint.js';

/* ── Helpers ────────────────────────────────────── */

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function createLoaderEl(container) {
  const el = document.createElement('div');
  el.className = 'loader';
  el.innerHTML = '<div class="loader__dot"></div>';
  container.appendChild(el);
  return el;
}

function createCaptionEl(container) {
  const el = document.createElement('div');
  el.className = 'caption';
  el.textContent = 'ARHIVA EMIL RACOVI\u021A\u0102 \u00B7 1898';
  container.appendChild(el);
  return el;
}

function createFlashEl(container) {
  const el = document.createElement('div');
  el.id = 'white-flash';
  el.className = 'white-flash';
  container.appendChild(el);
  return el;
}

/* ── Font preload ──────────────────────────────── */

async function preloadFonts() {
  const faces = [
    "400 1em 'GT Sectra Fine'",
    "italic 400 1em 'GT Sectra Fine'",
    "400 1em 'Inter'",
    "500 1em 'Inter'",
  ];
  await Promise.allSettled(faces.map((f) => document.fonts.load(f)));
}

/* ────────────────────────────────────────────────
   Main factory
   ──────────────────────────────────────────────── */

/**
 * Build and return the opening-scene controller.
 * @param {HTMLElement} container  The #app element
 * @returns {Promise<{ start, pause, resume, destroy }>}
 */
export async function createOpeningScene(container) {
  /* ---- Loader (Phase 0) ---- */
  const loaderEl = createLoaderEl(container);

  /* ---- Scene container ---- */
  const sceneBox = document.createElement('div');
  sceneBox.className = 'scene-container';
  container.appendChild(sceneBox);

  /* ---- Preload everything in parallel ---- */
  const narrator = createNarrator();

  const [scene3d] = await Promise.all([
    createScene3D(sceneBox),
    narrator
      .load('/audio/intro_narration_nl.mp3', '/data/narration_test.json')
      .catch(() => {
        console.warn('Audio/narration data not found — narration will be silent');
      }),
    preloadFonts(),
  ]);

  /* ---- Mount UI ---- */
  const subtitle     = createSubtitle();
  const pauseOverlay = createPauseOverlay();
  const pauseHint    = createPauseHint();

  subtitle.mount(container);
  pauseHint.mount(container);

  /* ---- State ---- */
  let currentPhase = 0;
  let isPaused = false;
  let cameraTimeline = null;

  const totalDuration = narrator.getDuration();

  /* ---- Pause overlay wiring ---- */
  pauseOverlay.mount(container, {
    onResume() {
      isPaused = false;
      narrator.resume();
      if (cameraTimeline) cameraTimeline.resume();
      gsap.globalTimeline.resume();
      pauseOverlay.hide();
    },
    onClose() {
      console.log('close — would return to selection in full project');
    },
  });

  /* ---- Pointer handler (pause on tap) ---- */
  function onPointerDown(e) {
    if (currentPhase < 3 || isPaused) return;
    if (e.target.closest('#pause-overlay')) return;
    if (e.target.closest('.pause-btn')) return;

    isPaused = true;
    narrator.pause();
    if (cameraTimeline) cameraTimeline.pause();
    gsap.globalTimeline.pause();
    pauseOverlay.show();
  }
  container.addEventListener('pointerdown', onPointerDown);

  /* ── Phase helpers ─────────────────────────── */

  function hideLoader() {
    loaderEl.style.opacity = '0';
    setTimeout(() => loaderEl.remove(), 500);
  }

  let phase4Started = false;
  let flashEl = null;

  function startPhase4() {
    if (phase4Started) return;
    phase4Started = true;
    currentPhase = 4;

    // Bloom ramp-up for dramatic overexposure
    gsap.to(scene3d.postFX.bloomPass, {
      strength: 1.5,
      duration: 1.5,
      ease: 'power2.in',
    });

    // White flash 2.5 s after phase-4 trigger (i.e. at totalDuration − 1.5)
    setTimeout(() => {
      flashEl = createFlashEl(container);
      gsap.to(flashEl, { opacity: 1, duration: 1.0 });
    }, 2500);
  }

  function startPhase5() {
    currentPhase = 5;

    // Fade out flash
    if (flashEl) {
      gsap.to(flashEl, {
        opacity: 0,
        duration: 1.5,
        onComplete: () => flashEl?.remove(),
      });
    }

    subtitle.hide();

    // Return bloom to gentle level
    gsap.to(scene3d.postFX.bloomPass, {
      strength: 0.5,
      duration: 1.5,
      ease: 'power2.out',
    });

    // Show hint
    pauseHint.show();
  }

  /* ────────────────────────────────────────────
     start()  — kicks off Phase 1 → 5
     ──────────────────────────────────────────── */
  async function start() {
    hideLoader();
    scene3d.startLoop();

    // Initial post-fx state
    scene3d.setDesaturation(1.0);
    scene3d.setVignette(0.95);
    scene3d.setBloom(0.4);

    /* ---- PHASE 1 — STILL (0 s – 3 s) ---- */
    currentPhase = 1;
    const captionEl = createCaptionEl(container);
    gsap.to(captionEl, { opacity: 1, duration: 0.6, ease: 'power2.out' });

    await delay(3000);

    /* ---- PHASE 2 — CROSSFADE TO COLOR (3 s – 6 s) ---- */
    currentPhase = 2;

    gsap.to(scene3d.postFX.desatPass.uniforms.uDesaturation, {
      value: 0.0,
      duration: 3,
      ease: 'power2.inOut',
    });

    gsap.to(scene3d.postFX.vignettePass.uniforms.uVignette, {
      value: 0.55,
      duration: 3,
      ease: 'power2.inOut',
    });

    // Fade caption at ~2 s into phase 2
    gsap.to(captionEl, {
      opacity: 0,
      duration: 0.8,
      delay: 2.0,
      onComplete: () => captionEl.remove(),
    });

    await delay(3000);

    /* ---- PHASE 3 — NARRATION + CAMERA ---- */
    currentPhase = 3;
    narrator.play();

    const audioDur  = totalDuration;
    const stageADur = audioDur * 0.8;
    const stageBDur = audioDur * 0.2;

    // Camera position timeline
    cameraTimeline = gsap.timeline();

    cameraTimeline.to(scene3d.camera.position, {
      x: 4, y: 2, z: 11,
      duration: stageADur,
      ease: 'power1.inOut',
    });

    cameraTimeline.to(scene3d.camera.position, {
      x: 0, y: 3, z: 5,
      duration: stageBDur,
      ease: 'power2.in',
    });

    // LookAt target rises
    gsap.to(scene3d.lookAtTarget.position, {
      y: 2.5,
      duration: audioDur,
      ease: 'power1.inOut',
    });

    // Bloom slowly increases
    gsap.to(scene3d.postFX.bloomPass, {
      strength: 0.7,
      duration: audioDur,
      ease: 'none',
    });

    // Subtitle sync via time-update polling
    narrator.onTimeUpdate((time) => {
      const seg = narrator.getSegmentAt(time);
      if (seg) {
        subtitle.show(seg.text);
      } else {
        subtitle.hide();
      }

      // Trigger Phase 4 when close to end
      if (time >= totalDuration - 4.0 && currentPhase < 4) {
        startPhase4();
      }
    });

    // When audio finishes → Phase 5
    narrator.onEnd(() => {
      setTimeout(() => startPhase5(), 500);
    });
  }

  /* ---- Public API ---- */
  return {
    start,

    pause() {
      isPaused = true;
      narrator.pause();
      if (cameraTimeline) cameraTimeline.pause();
    },

    resume() {
      isPaused = false;
      narrator.resume();
      if (cameraTimeline) cameraTimeline.resume();
    },

    destroy() {
      container.removeEventListener('pointerdown', onPointerDown);
      narrator.destroy();
      subtitle.destroy();
      pauseOverlay.destroy();
      pauseHint.destroy();
      scene3d.destroy();
    },
  };
}
