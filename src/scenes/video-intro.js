/**
 * video-intro.js — full-screen hero video before expedition detail.
 * Autoplays with embedded audio. Skip control always visible.
 * On end or skip → fade to expedition view.
 */
import gsap from 'gsap';

/**
 * Scene factory for the router.
 * @param {HTMLElement} container
 * @param {{ id: string, videoSrc: string }} params
 * @param {object} router
 */
export async function createVideoIntroScene(container, params, router) {
  const { id, videoSrc, targetScene = 'expedition' } = params;

  const root = document.createElement('div');
  root.className = 'video-intro';

  root.innerHTML = `
    <video
      class="video-intro__player"
      src="${videoSrc}"
      playsinline
      preload="auto"
    ></video>
    <button type="button" class="video-intro__skip" aria-label="Overslaan">
      <span class="video-intro__skip-label">Overslaan</span>
      <svg class="video-intro__skip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M5 4l10 8-10 8V4z"/><line x1="19" y1="5" x2="19" y2="19"/>
      </svg>
    </button>
  `;

  container.appendChild(root);

  const video = root.querySelector('.video-intro__player');
  const skipBtn = root.querySelector('.video-intro__skip');
  let navigated = false;

  function goToExpedition() {
    if (navigated) return;
    navigated = true;

    // Fade out, then navigate
    gsap.to(root, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        video.pause();
        router.navigate(targetScene, { id }, { pushHistory: false });
      },
    });
  }

  // Video ended → go to expedition
  video.addEventListener('ended', goToExpedition);

  // Skip button
  skipBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    goToExpedition();
  });

  // Fade in + autoplay
  requestAnimationFrame(() => {
    root.classList.add('video-intro--visible');
    // Small delay to let fade-in start, then play
    setTimeout(() => {
      video.play().catch((err) => {
        console.warn('[video-intro] Autoplay blocked:', err);
        // If autoplay blocked, skip to expedition
        goToExpedition();
      });
    }, 300);
  });

  return {
    unmount() {
      video.pause();
      video.removeAttribute('src');
      video.load(); // release memory
      root.parentNode?.removeChild(root);
      return Promise.resolve();
    },
    destroy() {
      video.pause();
      video.removeAttribute('src');
      video.load();
      root.parentNode?.removeChild(root);
    },
  };
}
