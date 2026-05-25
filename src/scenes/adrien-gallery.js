/**
 * adrien-gallery.js — Phantom.land–style curved 3D photo grid.
 * Entry / landing screen for Adrien de Gerlache before the detail page.
 *
 * CSS 3D transforms: cards placed on the inside of a cylinder.
 * Touch-drag / pointer-drag rotates the cylinder.
 * Auto-drift when idle. Dark background, glowing edges.
 */
import gsap from 'gsap';
import { Howl } from 'howler';
import { createNavBack } from '../ui/nav-back.js';

/* ---- Photo manifest (51 archival Belgica photos) ---- */
const PHOTOS = [
  'IMG_2352','IMG_2353','IMG_2356','IMG_2357','IMG_2358','IMG_2359',
  'IMG_2360','IMG_2361','IMG_2362','IMG_2363','IMG_2365','IMG_2366',
  'IMG_2367','IMG_2368','IMG_2369','IMG_2370','IMG_2371','IMG_2372',
  'IMG_2373','IMG_2374','IMG_2375','IMG_2376','IMG_2377','IMG_2378',
  'IMG_2379','IMG_2380','IMG_2381','IMG_2382','IMG_2383','IMG_2384',
  'IMG_2385','IMG_2386','IMG_2387','IMG_2388','IMG_2389','IMG_2390',
  'IMG_2392','IMG_2393','IMG_2394','IMG_2395','IMG_2396','IMG_2397',
  'IMG_2398','IMG_2399','IMG_2400','IMG_2401','IMG_2402','IMG_2403',
  'IMG_2404','IMG_2405','IMG_2406',
].map(f => `/photos/adrien/belgica /${f}.JPG`);

/* ---- Grid layout ---- */
const COLS = 18;
const ROWS_COUNT = 2;

/* ---- Config ---- */
const CARD_W = 180;
const CARD_H = 135;
const GAP = 14;
const CYLINDER_RADIUS = 800;
const AUTO_SPEED = 0.015;  // deg/frame (slow museum drift)
const DAMPING = 0.95;
const SENS_X = 0.08;
const SENS_Y = 0.05;

/* ================================================================
   Scene factory
   ================================================================ */
export async function createAdrienGalleryScene(container, params, router) {

  /* ---- Root ---- */
  const root = document.createElement('div');
  root.className = 'agal';
  root.innerHTML = `
    <div class="agal__stage">
      <div class="agal__cylinder" id="agal-cyl"></div>
    </div>
    <div class="agal__header">
      <div class="agal__tags">
        <span class="agal__tag">ARCHIEF</span>
        <span class="agal__tag">FOTOGRAFIE</span>
        <span class="agal__tag">1897\u20131899</span>
      </div>
      <h1 class="agal__title">Adrien de Gerlache</h1>
      <p class="agal__sub">Belgica-expeditie \u2014 Antarctisch archief</p>
    </div>
    <div class="agal__footer">
      <span class="agal__count">${PHOTOS.length} ARCHIEF FOTO\u2019S</span>
      <span class="agal__sep">\u00b7</span>
      <span class="agal__credit">ARHIVA EMIL RACOVI\u021a\u0102</span>
    </div>
    <div class="agal__enter-wrap">
      <button class="agal__enter" type="button">
        Ontdek het verhaal <span class="agal__enter-arrow">\u2192</span>
      </button>
    </div>
    <div class="agal__vignette"></div>
  `;
  container.appendChild(root);

  /* ---- Audio ---- */
  let audio = null;
  try {
    audio = new Howl({
      src: ['/audio/adrien.mp3'],
      loop: true,
      volume: 0.8,
      html5: false,
      onloaderror: (id, err) => {
        console.warn('[adrien-gallery] audio load failed:', err);
      },
    });
  } catch (e) {
    console.warn('[adrien-gallery] audio init failed:', e);
  }

  const nav = createNavBack();
  nav.mount(container, () => router.back());
  const cylinder = root.querySelector('#agal-cyl');

  /* ---- Build cards (pad to fill full grid) ---- */
  const TOTAL_SLOTS = COLS * ROWS_COUNT; // 54
  const padded = [];
  for (let i = 0; i < TOTAL_SLOTS; i++) padded.push(PHOTOS[i % PHOTOS.length]);

  const anglePerCol = 360 / COLS; // 20° — fills the full circle seamlessly
  const rowHeight = CARD_H + GAP;
  const totalGridH = ROWS_COUNT * rowHeight;

  padded.forEach((src, i) => {
    const c = i % COLS;
    const r = Math.floor(i / COLS);

    const angle = c * anglePerCol;
    const yOff = (r - (ROWS_COUNT - 1) / 2) * rowHeight;

    const card = document.createElement('div');
    card.className = 'agal__card';
    card.style.cssText = `
      --a: ${angle}deg;
      --y: ${yOff}px;
      --r: ${CYLINDER_RADIUS}px;
    `;

    card.innerHTML = `
      <div class="agal__card-inner">
        <img src="${src}" alt="" class="agal__card-img" loading="lazy" draggable="false" />
        <div class="agal__card-shine"></div>
      </div>
    `;

    cylinder.appendChild(card);
  });

  /* ---- State ---- */
  let rotX = -5;
  let rotY = 0;
  let velX = 0;
  let velY = 0;
  let dragging = false;
  let lastPX = 0, lastPY = 0;
  let autoOn = true;
  let autoTimer = null;
  let rafId = null;

  /* ---- Render loop ---- */
  function render() {
    if (!dragging) {
      if (autoOn) rotY += AUTO_SPEED;
      velX *= DAMPING;
      velY *= DAMPING;
      rotX += velX;
      rotY += velY;
    }
    // Clamp vertical
    const maxTilt = (totalGridH / 2) * 0.04;
    rotX = Math.max(-maxTilt, Math.min(maxTilt, rotX));

    cylinder.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    rafId = requestAnimationFrame(render);
  }

  /* ---- Drag ---- */
  function dStart(x, y) {
    dragging = true;
    autoOn = false;
    lastPX = x; lastPY = y;
    velX = velY = 0;
    clearTimeout(autoTimer);
  }
  function dMove(x, y) {
    if (!dragging) return;
    const dx = x - lastPX;
    const dy = y - lastPY;
    lastPX = x; lastPY = y;
    rotY += dx * SENS_X;
    rotX -= dy * SENS_Y;
    velY = dx * SENS_X;
    velX = -dy * SENS_Y;
  }
  function dEnd() {
    dragging = false;
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => { autoOn = true; }, 5000);
  }

  /* ---- Pointer events ---- */
  function onPD(e) {
    if (e.target.closest('.agal__enter') || e.target.closest('.nav-back')) return;
    root.setPointerCapture(e.pointerId);
    dStart(e.clientX, e.clientY);
  }
  function onPM(e) { dMove(e.clientX, e.clientY); }
  function onPU() { dEnd(); }

  /* ---- Wheel ---- */
  function onWheel(e) {
    e.preventDefault();
    autoOn = false;
    clearTimeout(autoTimer);
    rotY += (e.deltaX + e.deltaY) * 0.08;
    autoTimer = setTimeout(() => { autoOn = true; }, 5000);
  }

  /* ---- Enter button → detail page ---- */
  const enterBtn = root.querySelector('.agal__enter');
  enterBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    // Navigate to the Adrien detail page
    router.navigate('adrien-expedition', { id: 'adrien' });
  });

  /* ---- Bind ---- */
  root.addEventListener('pointerdown', onPD);
  root.addEventListener('pointermove', onPM);
  root.addEventListener('pointerup', onPU);
  root.addEventListener('pointercancel', onPU);
  root.addEventListener('wheel', onWheel, { passive: false });

  /* ---- Entrance animation ---- */
  gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' });

  /* ---- Audio autoplay on first interaction ---- */
  let audioStarted = false;
  const startAudio = () => {
    if (!audioStarted && audio) {
      audioStarted = true;
      audio.play();
    }
  };

  root.addEventListener('pointerdown', startAudio, { once: true });
  root.addEventListener('touchstart', startAudio, { once: true });
  root.addEventListener('wheel', startAudio, { once: true });

  // Cards stagger in
  const allCards = root.querySelectorAll('.agal__card');
  allCards.forEach((card, i) => {
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    const dist = Math.sqrt(c * c + r * r);
    gsap.fromTo(card, { opacity: 0 }, {
      opacity: 1,
      duration: 0.9,
      delay: 0.3 + dist * 0.08,
      ease: 'power2.out',
    });
  });

  rafId = requestAnimationFrame(render);

  /* ---- Lifecycle ---- */
  function cleanup() {
    cancelAnimationFrame(rafId);
    clearTimeout(autoTimer);
    root.removeEventListener('pointerdown', onPD);
    root.removeEventListener('pointermove', onPM);
    root.removeEventListener('pointerup', onPU);
    root.removeEventListener('pointercancel', onPU);
    root.removeEventListener('wheel', onWheel);
    if (audio) {
      audio.stop();
      audio.unload();
    }
    nav.unmount();
    root.parentNode?.removeChild(root);
  }

  return {
    unmount() {
      gsap.to(root, { opacity: 0, duration: 0.6 });
      return new Promise(r => setTimeout(() => { cleanup(); r(); }, 600));
    },
    destroy: cleanup,
  };
}
