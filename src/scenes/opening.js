/**
 * opening.js — main orchestrator for the opening scene.
 * Loader → start prompt (audio unlock) → still → crossfade → narration → flash + hint.
 * Sluiten resets the scene back to the start prompt.
 */
import gsap from 'gsap';
import { Howler } from 'howler';

import { createScene3D } from '../three/scene-3d.js';
import { loadShip } from '../three/ship-loader.js';
import { createNarrator } from '../audio/narrator.js';
import { createSubtitle } from '../ui/subtitle.js';
import { createPauseOverlay } from '../ui/pause-overlay.js';
import { createPauseHint } from '../ui/pause-hint.js';

const SHIP_PATH      = '/models/belgica/schooner.glb';
const AUDIO_PATH     = '/audio/intro_narration_nl.mp3';
const NARRATION_DATA = '/data/narration_test.json';
const START_PROMPT_TEXT = 'Tik om te beginnen';

const STILL_DURATION     = 3.0;
const CROSSFADE_DURATION = 3.0;
const FLASH_TAIL         = 4.0;
const FLASH_HOLD_TAIL    = 1.5;
const POST_FLASH_DELAY   = 0.5;
const START_PROMPT_REVEAL_MS = 400;

const CAM_INITIAL  = { x: 15, y: 3.5, z: 32 };
const LOOK_INITIAL_Y = 1.5;

function wait(ms) {
  return new Promise((r) => window.setTimeout(r, ms));
}

export async function createOpeningScene(container) {
  // ---- Loader DOM ----
  const loaderEl = document.createElement('div');
  loaderEl.className = 'loader';
  const loaderDot = document.createElement('div');
  loaderDot.className = 'loader__dot';
  loaderEl.appendChild(loaderDot);
  container.appendChild(loaderEl);

  // ---- White-flash DOM ----
  const flashEl = document.createElement('div');
  flashEl.className = 'white-flash';
  container.appendChild(flashEl);

  // ---- Start prompt DOM ----
  const startPromptEl = document.createElement('div');
  startPromptEl.className = 'start-prompt';
  const startDot = document.createElement('span');
  startDot.className = 'start-prompt__dot';
  const startLabel = document.createElement('span');
  startLabel.textContent = START_PROMPT_TEXT;
  startPromptEl.appendChild(startDot);
  startPromptEl.appendChild(startLabel);
  container.appendChild(startPromptEl);

  // ---- UI overlays ----
  const subtitle = createSubtitle();
  const pauseOverlay = createPauseOverlay();
  const pauseHint = createPauseHint();
  subtitle.mount(container);

  // ---- Build 3D ----
  const stage = await createScene3D(container);

  // ---- Preload ----
  const fontPromises = [
    document.fonts.load("400 1em 'GT Sectra Fine'"),
    document.fonts.load("500 1em 'GT Sectra Fine'"),
    document.fonts.load("400 1em 'Inter'"),
    document.fonts.load("500 1em 'Inter'"),
  ];

  const narrator = createNarrator();

  const [ , shipResult, audioMeta] = await Promise.all([
    Promise.all(fontPromises),
    loadShip(SHIP_PATH),
    narrator.load(AUDIO_PATH, NARRATION_DATA),
  ]);

  const { ship, debug: shipDebug } = shipResult;
  stage.scene.add(ship);
  stage.registerAnimatedShip(ship);

  const totalDuration = audioMeta.totalDuration;

  console.log('[opening] ship', shipDebug);
  console.log('[opening] narration totalDuration:', totalDuration);
  console.log('[opening] audio duration:', audioMeta.audioDuration);

  stage.startLoop();

  // ---- State ----
  let pauseable = false;
  let phase3Timeline = null;
  let bloomTimeline = null;
  let crossfadeTimeline = null;
  let lookTimeline = null;
  let flashTriggered = false;
  let flashWhiteTriggered = false;
  let scenePhase = 'idle'; // 'idle' | 'running' | 'post'
  let continueable = false;
  let continueHandler = null;

  const resetVisualState = () => {
    stage.setDesaturation(1.0);
    stage.setVignette(0.85);
    stage.setBloom(0.15);
    stage.camera.position.set(CAM_INITIAL.x, CAM_INITIAL.y, CAM_INITIAL.z);
    stage.lookTarget.position.set(0, LOOK_INITIAL_Y, 0);
    gsap.set(flashEl, { opacity: 0 });
  };

  resetVisualState();

  // Browser autoplay policy: AudioContext starts suspended until a user gesture.
  // Resume it explicitly inside the start-prompt tap handler.
  const unlockAudio = async () => {
    try {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        await Howler.ctx.resume();
      }
    } catch (e) {
      console.warn('[opening] audio context resume failed:', e);
    }
  };

  // ---- Pause handlers ----
  const handlePause = () => {
    if (scenePhase !== 'running') return;
    narrator.pause();
    if (!gsap.globalTimeline.paused()) gsap.globalTimeline.pause();
    pauseOverlay.show();
  };

  const handleResume = () => {
    pauseOverlay.hide();
    gsap.globalTimeline.resume();
    narrator.resume();
  };

  const resetToIdle = () => {
    narrator.stop();
    crossfadeTimeline?.kill();
    phase3Timeline?.kill();
    bloomTimeline?.kill();
    lookTimeline?.kill();
    if (gsap.globalTimeline.paused()) gsap.globalTimeline.resume();

    flashTriggered = false;
    flashWhiteTriggered = false;
    pauseable = false;
    continueable = false;
    scenePhase = 'idle';

    pauseOverlay.hide();
    pauseHint.hide();
    subtitle.hide();

    resetVisualState();
    showStartPrompt();
  };

  const handleClose = () => {
    resetToIdle();
  };

  pauseOverlay.mount(container, { onResume: handleResume, onClose: handleClose });

  // ---- Pointer-down anywhere ----
  const onPointerDown = (e) => {
    // Post-flash: any tap continues to next scene
    if (continueable) {
      if (e.target.closest('.start-prompt')) return;
      if (e.target.closest('.pause-btn')) return;
      continueable = false;
      continueHandler?.();
      return;
    }
    // Running phase: any tap opens pause overlay
    if (!pauseable) return;
    if (pauseOverlay.isVisible()) return;
    if (e.target.closest('.pause-btn')) return;
    if (e.target.closest('.start-prompt')) return;
    handlePause();
  };
  window.addEventListener('pointerdown', onPointerDown);

  // ---- Narrator-driven side effects (subtitles + flash buildup) ----
  narrator.onTimeUpdate((t) => {
    const seg = narrator.getSegmentAt(t);
    if (seg && seg.type === 'narration' && seg.text) {
      subtitle.show(seg.text);
    } else {
      subtitle.hide();
    }

    if (totalDuration > 0 && t >= totalDuration - FLASH_TAIL && !flashTriggered) {
      flashTriggered = true;
      gsap.to({}, {
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate() {
          const k = this.progress();
          stage.setBloom(0.30 + (0.80 - 0.30) * k);
        },
      });
    }
    if (totalDuration > 0 && t >= totalDuration - FLASH_HOLD_TAIL && !flashWhiteTriggered) {
      flashWhiteTriggered = true;
      gsap.to(flashEl, { opacity: 1, duration: 1.0, ease: 'power2.inOut' });
    }
  });

  narrator.onEnd(() => {
    scenePhase = 'post';
    pauseable = false;
    subtitle.hide();
    // Keep flash white — navigate immediately so the ship never reappears
    window.setTimeout(() => {
      continueHandler?.();
    }, POST_FLASH_DELAY * 1000);
  });

  // ---- Start prompt control ----
  const showStartPrompt = () => {
    const onStartTap = async (e) => {
      e.stopPropagation();
      startPromptEl.removeEventListener('pointerdown', onStartTap);
      startPromptEl.classList.remove('start-prompt--visible');
      await unlockAudio();
      runScene();
    };
    startPromptEl.addEventListener('pointerdown', onStartTap);
    startPromptEl.classList.add('start-prompt--visible');
  };

  // ---- Run one full scene cycle (Phase 1 → 5) ----
  const runScene = async () => {
    scenePhase = 'running';
    pauseable = false;
    flashTriggered = false;
    flashWhiteTriggered = false;
    resetVisualState();

    // Phase 1 — STILL (3s)
    await wait(STILL_DURATION * 1000);

    // Phase 2 — CROSSFADE (3s)
    crossfadeTimeline = gsap.timeline();
    crossfadeTimeline.to(stage.passes.desaturationPass.uniforms.uDesaturation, {
      value: 0.0,
      duration: CROSSFADE_DURATION,
      ease: 'power2.inOut',
    }, 0);
    crossfadeTimeline.to(stage.passes.vignettePass.uniforms.uVignette, {
      value: 0.45,
      duration: CROSSFADE_DURATION,
      ease: 'power2.inOut',
    }, 0);

    await wait(CROSSFADE_DURATION * 1000);

    // Abort if Sluiten interrupted during phase 2
    if (scenePhase !== 'running') return;

    // Phase 3 — NARRATION + CAMERA
    pauseable = true;
    narrator.play();

    const stageADur = totalDuration * 0.8;
    const stageBDur = totalDuration * 0.2;

    phase3Timeline = gsap.timeline();
    phase3Timeline.to(stage.camera.position, {
      x: 4, y: 2, z: 10,
      duration: stageADur,
      ease: 'power1.inOut',
    });
    phase3Timeline.to(stage.camera.position, {
      x: 0, y: 3, z: 5,
      duration: stageBDur,
      ease: 'power2.in',
    });

    lookTimeline = gsap.to(stage.lookTarget.position, {
      y: 2.5,
      duration: totalDuration,
      ease: 'sine.inOut',
    });

    bloomTimeline = gsap.to({}, {
      duration: Math.max(totalDuration - FLASH_TAIL, 0.1),
      ease: 'none',
      onUpdate() {
        if (flashTriggered) return;
        const k = this.progress();
        stage.setBloom(0.15 + (0.30 - 0.15) * k);
      },
    });
  };

  // ============================================================
  //  Lifecycle
  // ============================================================
  const start = async () => {
    loaderEl.classList.add('loader--hidden');
    window.setTimeout(() => {
      if (loaderEl.parentNode) loaderEl.parentNode.removeChild(loaderEl);
    }, 700);

    window.setTimeout(() => showStartPrompt(), START_PROMPT_REVEAL_MS);
  };

  const pause = () => handlePause();
  const resume = () => handleResume();

  const onContinue = (fn) => {
    continueHandler = fn;
  };

  const freeze = () => {
    stage.stopLoop();
  };

  const destroy = () => {
    pauseable = false;
    continueable = false;
    window.removeEventListener('pointerdown', onPointerDown);
    crossfadeTimeline?.kill();
    phase3Timeline?.kill();
    bloomTimeline?.kill();
    lookTimeline?.kill();
    narrator.destroy();
    subtitle.destroy();
    pauseOverlay.destroy();
    pauseHint.destroy();
    stage.destroy();
    // Remove DOM elements created by this scene
    flashEl?.parentNode?.removeChild(flashEl);
    startPromptEl?.parentNode?.removeChild(startPromptEl);
    loaderEl?.parentNode?.removeChild(loaderEl);
  };

  return { start, pause, resume, destroy, onContinue, freeze };
}
