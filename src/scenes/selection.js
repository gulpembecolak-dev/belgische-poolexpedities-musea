/**
 * selection.js — captain selection screen (rebuilt).
 *
 * Three portrait slots emerging from a white storm.
 * Visitor feels chosen BY them, not picking from a menu.
 * Uses pointerdown for touch hardware.
 */
import gsap from 'gsap';
import { getExpeditionIds, getExpedition } from '../data/expeditions.js';

const SNOWFLAKE_COUNT = 18;
const SELECTED_DWELL_MS = 1400;

function buildSnowflakes(host, count) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const flake = document.createElement('div');
    flake.className = 'snowflake';
    const size = 2 + Math.random() * 5;
    flake.style.width = `${size}px`;
    flake.style.height = `${size}px`;
    flake.style.left = `${Math.random() * 100}%`;
    const dur = 14 + Math.random() * 16;
    flake.style.animationDuration = `${dur}s`;
    flake.style.animationDelay = `${-Math.random() * dur}s`;
    flake.style.setProperty('--drift', `${(Math.random() - 0.5) * 100}px`);
    frag.appendChild(flake);
  }
  host.appendChild(frag);
}

/**
 * Scene factory for the router.
 * @returns {{ unmount, destroy }}
 */
export async function createSelectionScene(container, _params, router) {
  const root = document.createElement('div');
  root.className = 'selection';

  const ids = getExpeditionIds();

  root.innerHTML = `
    <div class="selection__bg" aria-hidden="true"></div>
    <div class="selection__snow" aria-hidden="true"></div>
    <div class="selection__vignette" aria-hidden="true"></div>
    <div class="selection__scroll">
      <div class="selection__captains" role="radiogroup" aria-label="Kies een kapitein">
        ${ids.map((id) => {
          const exp = getExpedition(id);
          return `
            <button type="button" class="captain" role="radio" aria-checked="false" data-captain="${id}">
              <div class="captain__portrait">
                <div class="captain__photo-slot">
                  <img
                    src="${exp.portraitPath}"
                    alt="${exp.captain}"
                    class="captain__photo"
                    style="object-position: ${exp.portraitPosition || '50% 30%'}"
                    loading="eager"
                    onerror="this.style.display='none'"
                  />
                </div>
                <div class="captain__glow" aria-hidden="true"></div>
              </div>
              <div class="captain__meta">
                <span class="captain__year">${exp.yearShort}</span>
                <span class="captain__name">${exp.captain}</span>
                <span class="captain__motto"><em>${exp.motto}</em></span>
              </div>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Princess Elisabeth Antarctica — 4th portrait below the divider -->
      <div class="pea" aria-label="Prinses Elisabeth Antarctica">
        <div class="pea__divider">
          <span class="pea__divider-line"></span>
          <span class="pea__divider-caption"><em>112 jaar later</em></span>
          <span class="pea__divider-line"></span>
        </div>

        <button
          type="button"
          class="captain captain--pea"
          data-pea="true"
          aria-label="Prinses Elisabeth Antarctica · 2009"
        >
          <div class="captain__portrait">
            <div class="captain__photo-slot">
              <img
                src="/photos/pea-station.png"
                alt="Prinses Elisabeth Antarctica"
                class="captain__photo"
                style="object-position: 50% 35%"
                loading="lazy"
                onerror="this.style.display='none'"
              />
            </div>
            <div class="captain__glow" aria-hidden="true"></div>
          </div>
          <div class="captain__meta">
            <span class="captain__year">2009</span>
            <span class="captain__name">Prinses Elisabeth Antarctica</span>
            <span class="captain__motto"><em>om te blijven</em></span>
          </div>
        </button>
      </div>
    </div>
  `;

  buildSnowflakes(root.querySelector('.selection__snow'), SNOWFLAKE_COUNT);
  container.appendChild(root);

  const captainBtns = Array.from(root.querySelectorAll('.captain[data-captain]'));
  let resolved = false;

  // Staggered entrance
  requestAnimationFrame(() => {
    root.classList.add('selection--visible');
    captainBtns.forEach((btn, i) => {
      gsap.fromTo(btn, { y: 30, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        delay: 0.3 + i * 0.2,
        ease: 'power2.out',
      });
    });
  });

  // PEA section — IntersectionObserver entrance fade
  const peaSection = root.querySelector('.pea');
  if (peaSection) {
    const peaObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          peaSection.classList.add('pea--visible');
          peaObs.disconnect();
        }
      });
    }, { threshold: 0.15 });
    peaObs.observe(peaSection);
  }

  // PEA portrait — 4th circle navigates to /pea
  const peaBtn = root.querySelector('.captain--pea[data-pea]');
  if (peaBtn) {
    peaBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (resolved) return;
      resolved = true;
      router.navigate('pea', {});
    });
  }

  // Selection handler
  function handleSelect(id) {
    if (resolved) return;
    resolved = true;

    captainBtns.forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.captain === id) {
        btn.classList.add('captain--chosen');
        btn.setAttribute('aria-checked', 'true');
      } else {
        btn.classList.add('captain--fade');
      }
    });

    setTimeout(() => {
      const selected = getExpedition(id);
      if (selected?.videoIntroSrc) {
        router.navigate('video-intro', {
          id,
          videoSrc: selected.videoIntroSrc,
          targetScene: selected.customScene || 'expedition',
        });
      } else {
        const scene = selected?.customScene || 'expedition';
        router.navigate(scene, { id });
      }
    }, SELECTED_DWELL_MS);
  }

  captainBtns.forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      handleSelect(btn.dataset.captain);
    });
  });

  return {
    unmount() {
      root.classList.remove('selection--visible');
      return new Promise((resolve) => {
        setTimeout(() => {
          root.parentNode?.removeChild(root);
          resolve();
        }, 800);
      });
    },
    destroy() {
      root.parentNode?.removeChild(root);
    },
  };
}
