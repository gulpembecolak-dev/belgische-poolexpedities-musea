/**
 * moment.js — deep-zoom view into a single historical moment.
 * Full-screen: large photo + date/place + narrative body + credit.
 */
import gsap from 'gsap';
import { getExpedition, getMoment } from '../data/expeditions.js';
import { createNavBack } from '../ui/nav-back.js';

/**
 * Scene factory for the router.
 */
export async function createMomentScene(container, params, router) {
  const { expeditionId, momentId } = params;
  const exp = getExpedition(expeditionId);
  const moment = getMoment(expeditionId, momentId);

  if (!exp || !moment) {
    console.error(`[moment] Not found: ${expeditionId}/${momentId}`);
    router.back();
    return { unmount() {}, destroy() {} };
  }

  // Find prev/next moments for navigation
  const momentIdx = exp.moments.findIndex((m) => m.id === momentId);
  const prevMoment = momentIdx > 0 ? exp.moments[momentIdx - 1] : null;
  const nextMoment = momentIdx < exp.moments.length - 1 ? exp.moments[momentIdx + 1] : null;

  const root = document.createElement('div');
  root.className = 'moment-view';
  root.style.setProperty('--exp-accent', exp.aesthetic.accent);

  root.innerHTML = `
    <div class="moment__photo-section">
      <img
        src="${moment.photoPath}"
        alt="${moment.title}"
        class="moment__photo"
        loading="eager"
        onerror="this.style.display='none'"
      />
      <div class="moment__photo-fallback" aria-hidden="true">
        <div class="moment__photo-gradient"></div>
      </div>
      <div class="moment__photo-overlay"></div>
    </div>

    <div class="moment__content">
      <div class="moment__header">
        <span class="moment__date">${moment.date}</span>
        ${moment.place ? `<span class="moment__place">${moment.place}</span>` : ''}
        <span class="moment__expedition">${exp.captain} · ${exp.ship || exp.yearShort}</span>
      </div>

      <h1 class="moment__title">${moment.title}</h1>

      <div class="moment__body">
        <p>${moment.body}</p>
      </div>

      ${moment.photoCredit ? `
        <p class="moment__credit">${moment.photoCredit}</p>
      ` : ''}

      <nav class="moment__nav" aria-label="Moment navigatie">
        ${prevMoment ? `
          <button type="button" class="moment__nav-btn moment__nav-btn--prev" data-moment="${prevMoment.id}">
            <span class="moment__nav-arrow">←</span>
            <span class="moment__nav-label">${prevMoment.title}</span>
          </button>
        ` : '<div></div>'}
        ${nextMoment ? `
          <button type="button" class="moment__nav-btn moment__nav-btn--next" data-moment="${nextMoment.id}">
            <span class="moment__nav-label">${nextMoment.title}</span>
            <span class="moment__nav-arrow">→</span>
          </button>
        ` : '<div></div>'}
      </nav>
    </div>
  `;

  container.appendChild(root);

  // ---- Nav back ----
  const nav = createNavBack();
  nav.mount(container, () => router.back());

  // ---- Prev/Next moment navigation ----
  root.querySelectorAll('.moment__nav-btn').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      router.navigate('moment', {
        expeditionId,
        momentId: btn.dataset.moment,
      }, { pushHistory: false });
    });
  });

  // ---- Entrance animation ----
  requestAnimationFrame(() => {
    root.classList.add('moment-view--visible');

    gsap.fromTo(root.querySelector('.moment__content'), {
      y: 30,
      opacity: 0,
    }, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      delay: 0.2,
      ease: 'power2.out',
    });
  });

  return {
    unmount() {
      root.classList.remove('moment-view--visible');
      nav.unmount();
      return new Promise((resolve) => {
        setTimeout(() => {
          root.parentNode?.removeChild(root);
          resolve();
        }, 500);
      });
    },
    destroy() {
      nav.unmount();
      root.parentNode?.removeChild(root);
    },
  };
}
