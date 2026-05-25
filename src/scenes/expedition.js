/**
 * expedition.js — data-driven expedition template.
 * Hero → Four-number poster → Moments timeline → Key figures → Map.
 */
import gsap from 'gsap';
import { getExpedition } from '../data/expeditions.js';
import { createNavBack } from '../ui/nav-back.js';
import { createFilterOverlay } from '../ui/filter-overlay.js';

/**
 * Animated count-up for poster numbers.
 */
function animateCountUp(el, target, duration = 2) {
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      el.textContent = Math.round(obj.val);
    },
  });
}

/**
 * Build SVG map for the expedition route.
 */
function buildMapSVG(route) {
  if (!route?.coordinates?.length) return '';

  // Simple Mercator-ish projection for the route
  const coords = route.coordinates;
  const lats = coords.map((c) => c.lat);
  const lngs = coords.map((c) => c.lng);
  const minLat = Math.min(...lats) - 5;
  const maxLat = Math.max(...lats) + 5;
  const minLng = Math.min(...lngs) - 10;
  const maxLng = Math.max(...lngs) + 10;

  const W = 800;
  const H = 500;
  const project = (lat, lng) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * W;
    const y = ((maxLat - lat) / (maxLat - minLat)) * H;
    return [x, y];
  };

  const points = coords.map((c) => project(c.lat, c.lng));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

  const dots = coords.map((c, i) => {
    const [x, y] = project(c.lat, c.lng);
    return `
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="var(--color-lantaarn)" opacity="0.8"/>
      <text x="${(x + 8).toFixed(1)}" y="${(y + 4).toFixed(1)}" class="map-label">${c.label}</text>
    `;
  }).join('');

  return `
    <svg class="expedition__map-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="route-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Route line -->
      <path d="${pathD}" fill="none" stroke="var(--color-lantaarn-glow)" stroke-width="3" opacity="0.4"/>
      <path d="${pathD}" fill="none" stroke="var(--color-lantaarn)" stroke-width="1.5"
            stroke-dasharray="6 4" filter="url(#route-glow)" class="route-animated"/>
      <!-- Dots & labels -->
      ${dots}
    </svg>
  `;
}

/**
 * Scene factory for the router.
 */
export async function createExpeditionScene(container, params, router) {
  const exp = getExpedition(params.id);
  if (!exp) {
    console.error(`[expedition] Unknown ID: ${params.id}`);
    router.back();
    return { unmount() {}, destroy() {} };
  }

  const root = document.createElement('div');
  root.className = 'expedition';
  root.style.setProperty('--exp-accent', exp.aesthetic.accent);

  root.innerHTML = `
    <!-- Hero -->
    <header class="exp__hero">
      <div class="exp__hero-bg" aria-hidden="true"></div>
      <div class="exp__hero-content">
        <span class="exp__hero-year">${exp.year}</span>
        ${exp.ship ? `<span class="exp__hero-ship">${exp.ship}</span>` : ''}
        <h1 class="exp__hero-captain">${exp.captain}</h1>
        <p class="exp__hero-motto"><em>${exp.motto}</em></p>
      </div>
    </header>

    <!-- Intro -->
    <section class="exp__intro">
      <p class="exp__intro-text">${exp.intro}</p>
    </section>

    <!-- Four-number poster -->
    <section class="exp__poster" aria-label="Kerncijfers">
      ${exp.poster.map((p) => `
        <div class="poster-tile">
          <span class="poster-tile__number" data-target="${p.number}">0</span>
          <span class="poster-tile__label">${p.label}</span>
          <span class="poster-tile__detail">${p.detail}</span>
        </div>
      `).join('')}
    </section>

    <!-- Moments timeline -->
    <section class="exp__moments" aria-label="Sleutelmomenten">
      <h2 class="exp__section-title">Sleutelmomenten</h2>
      <div class="exp__moments-strip">
        ${exp.moments.map((m) => `
          <button type="button" class="moment-card" data-moment="${m.id}">
            <div class="moment-card__thumb">
              <img
                src="${m.photoPath}"
                alt="${m.title}"
                class="moment-card__img"
                loading="lazy"
                onerror="this.style.display='none'"
              />
              <div class="moment-card__fallback" aria-hidden="true"></div>
            </div>
            <span class="moment-card__date">${m.date}</span>
            <span class="moment-card__title">${m.title}</span>
            ${m.place ? `<span class="moment-card__place">${m.place}</span>` : ''}
          </button>
        `).join('')}
      </div>
    </section>

    <!-- Key figures -->
    <section class="exp__figures" aria-label="Sleutelfiguren">
      <h2 class="exp__section-title">Sleutelfiguren</h2>
      <div class="exp__figures-grid">
        ${exp.figures.map((f) => `
          <div class="figure-card">
            <span class="figure-card__name">${f.name}</span>
            <span class="figure-card__role">${f.role}</span>
            <span class="figure-card__detail">${f.detail}</span>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Map -->
    <section class="exp__map" aria-label="Route">
      <h2 class="exp__section-title">${exp.route?.label ?? 'Route'}</h2>
      <div class="exp__map-container">
        ${buildMapSVG(exp.route)}
      </div>
    </section>
  `;

  container.appendChild(root);

  // ---- Nav back ----
  const nav = createNavBack();
  nav.mount(container, () => router.back());

  // ---- Search trigger ----
  const searchBtn = document.createElement('button');
  searchBtn.type = 'button';
  searchBtn.className = 'search-trigger';
  searchBtn.setAttribute('aria-label', 'Zoeken');
  searchBtn.innerHTML = `
    <svg class="search-trigger__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  `;
  container.appendChild(searchBtn);
  requestAnimationFrame(() => searchBtn.classList.add('search-trigger--visible'));

  // ---- Filter overlay ----
  const filter = createFilterOverlay();
  filter.mount(container, {
    onSelectResult({ expeditionId, momentId }) {
      filter.hide();
      if (expeditionId === exp.id) {
        // Same expedition — navigate to moment
        router.navigate('moment', { expeditionId, momentId });
      } else {
        // Different expedition — go there then to moment
        router.navigate('expedition', { id: expeditionId });
      }
    },
  });

  searchBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    filter.show();
  });

  // ---- Moment card tap ----
  root.querySelectorAll('.moment-card').forEach((card) => {
    card.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      router.navigate('moment', {
        expeditionId: exp.id,
        momentId: card.dataset.moment,
      });
    });
  });

  // ---- Entrance animations ----
  requestAnimationFrame(() => {
    root.classList.add('expedition--visible');

    // Animate poster numbers
    root.querySelectorAll('.poster-tile__number').forEach((el, i) => {
      const target = parseInt(el.dataset.target, 10);
      gsap.delayedCall(0.6 + i * 0.15, () => animateCountUp(el, target, 1.8));
    });

    // Stagger sections
    gsap.utils.toArray(root.querySelectorAll('.exp__intro, .exp__poster, .exp__moments, .exp__figures, .exp__map')).forEach((section, i) => {
      gsap.fromTo(section, { y: 40, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.3 + i * 0.2,
        ease: 'power2.out',
      });
    });
  });

  return {
    unmount() {
      root.classList.remove('expedition--visible');
      nav.unmount();
      searchBtn.classList.remove('search-trigger--visible');
      filter.destroy();
      return new Promise((resolve) => {
        setTimeout(() => {
          root.parentNode?.removeChild(root);
          searchBtn.parentNode?.removeChild(searchBtn);
          resolve();
        }, 600);
      });
    },
    destroy() {
      nav.unmount();
      filter.destroy();
      root.parentNode?.removeChild(root);
      searchBtn.parentNode?.removeChild(searchBtn);
    },
  };
}
