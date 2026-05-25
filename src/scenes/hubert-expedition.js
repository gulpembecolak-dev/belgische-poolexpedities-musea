/**
 * hubert-expedition.js — 2D full-page slide grid for Dansercoer info page.
 *
 * Sections (vertical, 6 total):
 *   S1 — title + de oversteek            (4 slides: gidsen / begin / 34u rust / 271 km)
 *   S2 — globe (1997 — 2021)              (1 slide, standalone)
 *   S3 — princess elisabeth               (1 slide, standalone)
 *   S4 — kerncijfers + laatste adem      (4 slides: kerncijfers / mei 2021 / laatste woorden / 40 meter)
 *   S5 — bijna dertig boeken              (1 slide, standalone)
 *   S6 — een vraag                        (1 slide, standalone)
 *
 * Touch swipe + wheel + keyboard nav. GSAP transitions.
 * Kerncijfers + laatste-adem typewriter + crevasse lock navigation while their reveals play.
 */
import gsap from 'gsap';
import { createNavBack } from '../ui/nav-back.js';
import { createGlobe } from '../three/globe-routes.js';
import { initAskAssistant } from '../ui/ask-assistant.js';

/* ---- Section metadata (drives row count + dot indicators) ---- */
const ROWS = [
  { id: 's1', cols: 4 }, // title + oversteek (begin / pool / 271)
  { id: 's2', cols: 1 }, // globe — standalone
  { id: 's3', cols: 1 }, // princess elisabeth — standalone
  { id: 's4', cols: 4 }, // kerncijfers + laatste adem (plan / quote / crevasse)
  { id: 's5', cols: 1 }, // books — standalone
  { id: 's6', cols: 1 }, // AI vraag — standalone
];

const DURATION = 1.8;
const EASE = 'power3.inOut';
const SWIPE_THRESHOLD = 40;
const OV_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const PINCH_THRESHOLD = 60;

/* ---- Slide titles for overview mode ---- */
const SLIDE_TITLES = [
  /* S1 */ ['De gidsen', '4 nov 1997', '34 uur rust', '271 km in 24 uur'],
  /* S2 */ ['1997 — 2021'],
  /* S3 */ ['Princess Elisabeth'],
  /* S4 */ ['In vier cijfers', 'Mei 2021', 'Laatste woorden', '40 meter'],
  /* S5 */ ['Bijna dertig boeken'],
  /* S6 */ ['Een vraag'],
];

/* ---- DE OVERSTEEK data (3 slides, 1997-1998 crossing) ---- */
const OVERSTEEK = [
  {
    day: 1,
    date: '4 NOV 1997',
    kicker: 'BEGIN',
    headline: { type: 'date', text: '4 NOV 1997' },
    body: [
      "Hubert en Dansercoer zetten hun ski's op het ijs van het Berkner-eiland in de Weddell-zee. 3.924 kilometer naar de andere kust. Geen schip om naar terug te keren, geen voorraadlijnen, geen ondersteunende voertuigen — alleen wat ze konden trekken.",
      'Het begin van de Antarctische zomer. Honderd dagen tussen hen en thuis.',
    ],
    facts: [
      { label: 'Vertrekpunt',   value: 'Berkner-eiland · Weddell-zee' },
      { label: 'Bestemming',    value: 'Roosevelt-eiland · Ross-zee' },
      { label: 'Lading',        value: '~150 kg per slee' },
      { label: 'Ondersteuning', value: 'geen' },
    ],
    factsPlacement: 'before',
    atmosphere: 'ski',
    aside: { kind: 'none' },
  },
  {
    day: 60,
    date: '3 JAN 1998',
    kicker: 'DE GEOGRAFISCHE ZUIDPOOL',
    headline: { type: 'serif', text: '34 UUR RUST' },
    body: [
      'Dag 60. 1.924 kilometer afgelegd. Ze halen de Geografische Zuidpool — de plek waar Roald Amundsen achttachtig jaar eerder als eerste stond.',
      'Ze slapen vierendertig uur in het Amerikaanse Amundsen-Scott station. Hun lichaam vraagt om weken rust, maar er is geen tijd. Het Antarctische zomer-venster sluit zich. Tweeduizend kilometer voor zich.',
    ],
    facts: [
      { label: 'Afgelegd',    value: '1.924 km' },
      { label: 'Te gaan',     value: '2.000 km' },
      { label: 'Temperatuur', value: '−30°C (gevoel −50°C met wind)' },
      { label: 'Daglicht',    value: '24 uur' },
      { label: 'Ontmoeting',  value: 'Amundsen-Scott Station personeel' },
    ],
    factsPlacement: 'before',
    atmosphere: 'snow',
    aside: { kind: 'none' },
  },
  {
    day: 77,
    date: '20 JAN 1998',
    kicker: 'EÉN DAG',
    headline: { type: 'countup', target: 271, suffix: 'KM IN 24 UUR' },
    body: [
      'Dag 77. Eindelijk de wind in hun voordeel. Met hun powerkites trekken ze tweehonderdeenenzeventig kilometer in vierentwintig uur — de afstand tussen Brussel en Wenen, in één etmaal.',
      'Hun lichaam was hun schip geworden. De wind hun zeil. Op de andere drieënnegentig dagen sleurden ze gemiddeld negenendertig kilometer.',
    ],
    facts: [
      { label: 'Windsnelheid', value: '~60 km/u · zuidoost' },
      { label: 'Kite',         value: '~25 m²' },
      { label: 'Record',       value: 'nog onverbroken' },
    ],
    factsPlacement: 'after',
    atmosphere: 'streaks',
    aside: { kind: 'bars' },
  },
];

const OVERSTEEK_SNOW_COUNT = 42;
const OVERSTEEK_STREAK_COUNT = 16;

/* ---- DE BIBLIOTHEEK data ---- */
const BIBLIOTHEEK = {
  books: [
    {
      id: 'tanden',
      title: 'De tanden van de wind',
      year: 1998,
      author: 'Hubert · Dansercoer · Brent',
      tilt: -2.5,
      tone: 'sand',
      inside: 'In honderd dagen over Antarctica. Drie auteurs, één tocht. Het werd een bestseller en inspireerde een generatie poolverkenners.',
    },
    {
      id: 'chaos',
      title: 'Chaos op het ijs',
      year: 2003,
      author: 'Dixie Dansercoer',
      tilt: 1.5,
      tone: 'ink',
      inside: 'De Noordpool met kites. De wind zelden meewerkend. Een verslag van geduld, uitputting en het ritme van het Arctische ijs.',
    },
    {
      id: 'voetsporen',
      title: 'In de voetsporen van Adrien de Gerlache',
      year: 2008,
      author: 'Dixie Dansercoer',
      tilt: -3,
      tone: 'cream',
      inside: 'Honderdtien jaar na de Belgica. Een solo-eerbetoon aan de eerste Belgische Antarctische expeditie. Eén man, één continent.',
    },
  ],
  routes: [
    { id: 'arctic-2007',    year: '2007', color: '#D0563F', label: 'Arctische IJszee', sub: 'Siberië → Groenland',                 km: '— ' },
    { id: 'antarctic-2008', year: '2008', color: '#E6B541', label: 'Antarctica',         sub: 'solo in voetsporen van De Gerlache',  km: '5 000 km' },
    { id: 'greenland-2014', year: '2014', color: '#5A8BC4', label: 'Groenland',          sub: 'circumnavigatie',                     km: '4 040 km' },
  ],
};

/* ---- DE LAATSTE ADEM data ---- */
const LAATSTE_ADEM = {
  plan: {
    kicker: 'MEI 2021',
    route: 'NARSARSUAQ → QAANAAQ',
    sub: '2200 km · ~30 dagen',
    body: 'Een nieuwe oversteek. Een jongere tochtgenoot, Sébastien Audy. Wetenschappelijke ijsmonsters voor Kopenhagen. Het zou dertig dagen duren.',
  },
  quote: {
    kicker: 'LAATSTE WOORDEN',
    text: 'Nice temperatures, terrain wonderful and perfect visibility.',
    attribution: '— Dixie Dansercoer, journal, 7 juni 2021, 443 km voor Qaanaaq',
    typeDuration: 5.0,
  },
  crevasse: {
    kicker: '40 METER',
    milestones: [
      { depth: '0 m',  line: 'het ijs opent' },
      { depth: '25 m', line: 'de slee wordt gevonden' },
      { depth: '40 m', line: 'verder dan elke kabel' },
    ],
    closing: 'De zoekactie eindigt.\nZijn lichaam is nooit teruggevonden.',
    initialDelay: 1.0,
    stepDelay: 2.5,
    closingDelay: 1.5,
    closingHold: 2.5,
  },
};

/* ---- WAT BLIJFT data ---- */
const WAT_BLIJFT = {
  ask: {
    kicker: 'EEN VRAAG',
    placeholder: 'Stel een vraag over Dixie…',
    chips: ['Waarom Groenland?', 'Wat is een powerkite?', 'Wie was Alain Hubert?'],
    micro: 'Een installatie gebouwd op de vragen van bezoekers. Wat zou jij hem hebben gevraagd?',
    stubReply: '(antwoord komt binnenkort — LLM-koppeling in voorbereiding)',
  },
};

/* ---- Kerncijfers data (4 stacked tiles) ---- */
const POSTER = [
  { idx: 0, n: 100, label: 'dagen',                detail: '(de oversteek)',   anchor: false },
  { idx: 1, n: 30,  label: 'boeken',               detail: '(de bibliotheek)', anchor: false },
  { idx: 2, n: 24,  label: 'jaren',                detail: '(samen)',          anchor: false },
  { idx: 3, n: 0,   label: 'lichaam teruggevonden', detail: '(2021)',           anchor: true  },
];

/* ---- Cascade timing (museum tempo, deliberate silence) ---- */
const CASCADE = {
  numbers: [
    { startAt: 0.3, duration: 1.8 }, // 100
    { startAt: 2.8, duration: 1.6 }, // 30
    { startAt: 5.1, duration: 1.4 }, // 24
  ],
  labelDelayAfterNumber: 0.2,
  zeroStartAt: 7.5,
  zeroTicks: [
    { v: 100, t: 0    },
    { v: 50,  t: 0.6  },
    { v: 10,  t: 1.4  },
    { v: 1,   t: 2.4  },
    { v: 0,   t: 3.5  },
  ],
  zeroLabelDelay: 2.5,
  unlockDelayAfterFinalLabel: 1.0,
};

/* ---- Helpers ---- */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function countUp(el, target, duration = 2.2, delay = 0) {
  if (target === 0) { el.textContent = '0'; return; }
  const o = { v: 0 };
  gsap.to(o, {
    v: target,
    duration,
    delay,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = Math.round(o.v); },
  });
}

function tickDownToZero(el, onDone) {
  CASCADE.zeroTicks.forEach(({ v, t }) => {
    gsap.delayedCall(t, () => { el.textContent = String(v); });
  });
  const lastT = CASCADE.zeroTicks[CASCADE.zeroTicks.length - 1].t;
  gsap.delayedCall(lastT, () => onDone?.());
}

/* ================================================================
   Scene factory
   ================================================================ */
export async function createHubertExpeditionScene(container, params, router) {
  /* ---- State ---- */
  let row = 0, col = 0, animating = false;
  let kerncijfersDone = false;
  let oversteekSlideCDone = false;
  let laatsteAdemBDone = false;
  let laatsteAdemCDone = false;
  let locked = false;
  let ovOpen = false;           // overview mode flag
  let ovAnimating = false;      // overview transition in progress
  let globeInitDone = false;
  let globeInstance = null;
  let askInstance = null;
  let laPlanGlobeDone = false;
  let laPlanGlobeInstance = null;

  /* ---- DOM ---- */
  const root = document.createElement('div');
  root.className = 'hub';
  root.innerHTML = html();
  container.appendChild(root);

  const viewport = root.querySelector('.hub__vp');
  const tracks   = [...root.querySelectorAll('.hub__track')];
  const vDots    = [...root.querySelectorAll('.hub__vd')];
  const hWrap    = root.querySelector('.hub__hw');

  /* ---- Nav back ---- */
  const nav = createNavBack();
  nav.mount(container, () => router.back());

  /* ============================================================
     OVERVIEW MODE — zoom out to see all slides, tap to navigate
     ============================================================ */

  /* Build overview DOM once, reuse forever */
  const ovEl = document.createElement('div');
  ovEl.className = 'hub__ov';
  ovEl.innerHTML = buildOverviewHTML();
  root.appendChild(ovEl);

  /* Expand icon (top-right corner) */
  const ovBtn = document.createElement('button');
  ovBtn.className = 'hub__ov-btn';
  ovBtn.setAttribute('aria-label', 'Overzicht');
  ovBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
    <rect x="3" y="3" width="8" height="8" rx="1.5" opacity="0.85"/>
    <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.85"/>
    <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.85"/>
    <rect x="13" y="13" width="8" height="8" rx="1.5" opacity="0.85"/>
  </svg>`;
  root.appendChild(ovBtn);

  const ovCells = [...ovEl.querySelectorAll('.hub__ov-cell')];

  function openOverview() {
    if (ovOpen || ovAnimating || locked) return;
    ovAnimating = true;
    ovOpen = true;
    root.classList.add('hub--ov');

    // Mark current slide
    ovCells.forEach(c => {
      c.classList.toggle('hub__ov-cell--current',
        +c.dataset.r === row && +c.dataset.c === col);
    });

    // Animate in
    gsap.fromTo(ovEl, { opacity: 0 }, {
      opacity: 1, duration: 0.6,
      ease: 'power2.out',
      onComplete: () => { ovAnimating = false; },
    });
    gsap.fromTo('.hub__ov-grid', { scale: 0.85 }, {
      scale: 1, duration: 0.6,
      ease: 'power2.out',
    });
  }

  function closeOverview(targetRow, targetCol) {
    if (!ovOpen || ovAnimating) return;
    ovAnimating = true;

    const navigating = targetRow !== undefined;

    // Fade out non-selected cells if navigating
    if (navigating) {
      ovCells.forEach(c => {
        if (+c.dataset.r !== targetRow || +c.dataset.c !== targetCol) {
          gsap.to(c, { opacity: 0, duration: 0.3, ease: 'power2.in' });
        }
      });
    }

    gsap.to(ovEl, {
      opacity: 0,
      duration: navigating ? 0.5 : 0.4,
      delay: navigating ? 0.15 : 0,
      ease: 'power2.in',
      onComplete: () => {
        ovOpen = false;
        ovAnimating = false;
        root.classList.remove('hub--ov');
        // Reset cell opacities for next open
        ovCells.forEach(c => { c.style.opacity = ''; });

        if (navigating) goTo(targetRow, targetCol, true);
      },
    });
  }

  /* Cell click → zoom into that slide */
  ovCells.forEach(cell => {
    cell.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      closeOverview(+cell.dataset.r, +cell.dataset.c);
    });
  });

  /* Tap background → return to current slide */
  ovEl.addEventListener('pointerdown', (e) => {
    if (e.target === ovEl || e.target.classList.contains('hub__ov-grid')) {
      e.stopPropagation();
      closeOverview();
    }
  });

  /* Expand icon click */
  ovBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (ovOpen) closeOverview();
    else openOverview();
  });

  /* ---- Pinch detection ---- */
  let pinchStartDist = 0;
  let isPinching = false;

  function getPinchDist(e) {
    if (e.touches.length < 2) return 0;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* ---- Navigation ---- */
  function goTo(r, c, force = false) {
    if ((animating || locked) && !force) return;
    r = clamp(r, 0, ROWS.length - 1);
    c = clamp(c, 0, ROWS[r].cols - 1);
    if (r === row && c === col) return;

    animating = true;
    const rowChanged = r !== row;

    if (rowChanged) {
      gsap.to(viewport, { y: -r * window.innerHeight, duration: DURATION, ease: EASE });
      row = r;
    }

    gsap.to(tracks[r], {
      x: -c * window.innerWidth,
      duration: DURATION,
      ease: EASE,
      onComplete() {
        animating = false;
        fireRowEntry(r, c);
      },
    });
    col = c;
    updateDots();
  }

  function move(dir) {
    switch (dir) {
      case 'up':    goTo(row - 1, 0); break;
      case 'down':  goTo(row + 1, 0); break;
      case 'left':  goTo(row, col - 1); break;
      case 'right': goTo(row, col + 1); break;
    }
  }

  /* ---- Dot indicators ---- */
  function updateDots() {
    vDots.forEach((d, i) => d.classList.toggle('hub__vd--on', i === row));

    const n = ROWS[row].cols;
    if (n > 1) {
      hWrap.style.opacity = '1';
      hWrap.innerHTML = Array.from({ length: n }, (_, i) =>
        `<button class="hub__hd ${i === col ? 'hub__hd--on' : ''}" data-c="${i}" aria-label="Kolom ${i + 1}"></button>`
      ).join('');
      hWrap.querySelectorAll('.hub__hd').forEach(d =>
        d.addEventListener('pointerdown', e => { e.stopPropagation(); goTo(row, +d.dataset.c); })
      );
    } else {
      hWrap.style.opacity = '0';
    }
  }

  /* ---- Touch (swipe + pinch) ---- */
  let tx = 0, ty = 0, tt = 0;

  function onTS(e) {
    if (e.touches.length === 2) {
      isPinching = true;
      pinchStartDist = getPinchDist(e);
      return;
    }
    if (ovOpen) return; // no swipe nav while overview is open
    isPinching = false;
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
    tt = Date.now();
  }

  function onTM(e) {
    if (e.touches.length === 2) {
      isPinching = true;
    }
  }

  function onTE(e) {
    if (isPinching) {
      const endDist = getPinchDist(e);
      // If we still have 2+ touches, measure; otherwise use last known
      if (endDist > 0) {
        const delta = endDist - pinchStartDist;
        if (delta > PINCH_THRESHOLD && !ovOpen) openOverview();
        if (delta < -PINCH_THRESHOLD && ovOpen) closeOverview();
      } else if (e.changedTouches.length >= 1 && pinchStartDist > 0) {
        // Fingers lifted — use the changedTouches approximation
        // For pinch-in during overview, just close
        if (ovOpen) closeOverview();
      }
      isPinching = false;
      pinchStartDist = 0;
      return;
    }
    if (ovOpen) return;
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Date.now() - tt > 800) return;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax < SWIPE_THRESHOLD && ay < SWIPE_THRESHOLD) return;
    if (ax > ay) move(dx > 0 ? 'left' : 'right');
    else         move(dy > 0 ? 'up'   : 'down');
  }

  /* ---- Wheel ---- */
  let wCool = false;
  function onWheel(e) {
    e.preventDefault();
    if (ovOpen) return; // no wheel nav during overview
    if (wCool || animating || locked) return;
    wCool = true; setTimeout(() => { wCool = false; }, 600);
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) move(e.deltaX > 0 ? 'right' : 'left');
    else move(e.deltaY > 0 ? 'down' : 'up');
  }

  /* ---- Keyboard ---- */
  function onKey(e) {
    if (e.key === 'Escape' && ovOpen) { closeOverview(); return; }
    if (locked || ovOpen) return;
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (map[e.key]) { e.preventDefault(); map[e.key] && move(map[e.key]); }
  }

  /* ---- Row entry dispatcher (slide-level triggers, mapped to new sections) ---- */
  function fireRowEntry(rowIdx, colIdx) {
    const id = ROWS[rowIdx]?.id;
    // S1 col 3 = 271 km slide → count-up + bar chart
    if (id === 's1' && colIdx === 3 && !oversteekSlideCDone) fireOversteekSlideC();
    // S2 = globe standalone → Three.js globe init
    if (id === 's2' && colIdx === 0 && !globeInitDone) fireGlobeInit();
    // S4 col 0 = kerncijfers → locked cascade
    if (id === 's4' && colIdx === 0 && !kerncijfersDone) fireKerncijfers();
    // S4 col 1 = mei 2021 plan → mini globe init (greenland-2021 route only)
    if (id === 's4' && colIdx === 1 && !laPlanGlobeDone) fireLaPlanGlobe();
    // S4 col 2 = laatste woorden → typewriter
    if (id === 's4' && colIdx === 2 && !laatsteAdemBDone) fireLaatsteAdemSlideB();
    // S4 col 3 = crevasse → cascade + fade-to-black closing
    if (id === 's4' && colIdx === 3 && !laatsteAdemCDone) fireLaatsteAdemSlideC();
  }

  /* ---- Mei 2021 plan mini-globe (only the Greenland 2021 dashed route) ---- */
  function fireLaPlanGlobe() {
    laPlanGlobeDone = true;
    const canvas = root.querySelector('.hub__la-mini-globe-canvas');
    if (!canvas) return;
    requestAnimationFrame(() => {
      try {
        laPlanGlobeInstance = createGlobe(canvas, { activeIds: ['greenland-2021'] });
      } catch (e) {
        console.warn('[la-plan] mini globe init failed:', e);
      }
    });
  }

  /* ---- Globe init (Three.js globe + bar animation) ---- */
  function fireGlobeInit() {
    globeInitDone = true;
    const canvas = root.querySelector('.hub__globe-canvas');
    if (!canvas) return;

    // Wait one frame for layout to settle
    requestAnimationFrame(() => {
      globeInstance = createGlobe(canvas);
      // Force resize to pick up the correct container dimensions
      globeInstance.resize();
      // Second resize after layout fully settles (slide transition)
      requestAnimationFrame(() => globeInstance.resize());

      globeInstance.animateRoutes();

      // Animate distance bars in sync with route drawing
      root.querySelectorAll('.hub__route-bar').forEach((bar, i) => {
        gsap.to(bar, {
          width: bar.dataset.w,
          duration: 1.2,
          delay: 1.3 + i * 0.5,
          ease: 'power2.out',
        });
      });
    });
  }

  /* ---- DE LAATSTE ADEM Slide B — typewriter quote (5s) then cursor blink ---- */
  function fireLaatsteAdemSlideB() {
    laatsteAdemBDone = true;
    const slide = root.querySelector('.hub__sl--la-quote');
    if (!slide) return;
    const textEl = slide.querySelector('.hub__la-quote-text');
    const cursorEl = slide.querySelector('.hub__la-cursor');
    const attribEl = slide.querySelector('.hub__la-quote-attrib');
    if (!textEl) return;

    const fullText = textEl.dataset.text || '';
    textEl.textContent = '';
    const chars = [...fullText];
    const duration = LAATSTE_ADEM.quote.typeDuration;
    const step = duration / Math.max(chars.length, 1);

    locked = true;
    root.classList.add('hub--locked');
    if (cursorEl) cursorEl.classList.add('hub__la-cursor--typing');

    chars.forEach((ch, i) => {
      gsap.delayedCall(i * step, () => { textEl.textContent += ch; });
    });

    gsap.delayedCall(duration + 0.3, () => {
      if (cursorEl) cursorEl.classList.remove('hub__la-cursor--typing');
      if (attribEl) attribEl.classList.add('hub__la-quote-attrib--on');
      locked = false;
      root.classList.remove('hub--locked');
    });
  }

  /* ---- DE LAATSTE ADEM Slide C — crevasse cascade + fade-to-black closing ---- */
  function fireLaatsteAdemSlideC() {
    laatsteAdemCDone = true;
    const slide = root.querySelector('.hub__sl--la-crevasse');
    if (!slide) return;
    const milestones = slide.querySelectorAll('.hub__la-milestone');
    const closing = slide.querySelector('.hub__la-closing');
    if (milestones.length === 0) return;

    const cfg = LAATSTE_ADEM.crevasse;

    locked = true;
    root.classList.add('hub--locked');

    milestones.forEach((m, i) => {
      gsap.delayedCall(cfg.initialDelay + i * cfg.stepDelay, () => {
        m.classList.add('hub__la-milestone--on');
      });
    });

    const lastMsTime = cfg.initialDelay + (milestones.length - 1) * cfg.stepDelay;
    const closingTime = lastMsTime + cfg.closingDelay;

    gsap.delayedCall(closingTime, () => {
      if (closing) closing.classList.add('hub__la-closing--on');
    });

    gsap.delayedCall(closingTime + cfg.closingHold, () => {
      locked = false;
      root.classList.remove('hub--locked');
    });
  }

  /* ---- DE OVERSTEEK Slide C — 271 km count-up + bar chart reveal ---- */
  function fireOversteekSlideC() {
    oversteekSlideCDone = true;
    const slide = root.querySelector('.hub__sl--oversteek[data-os-slide="2"]');
    if (!slide) return;
    const numEl = slide.querySelector('.hub__os-num');
    const bars  = slide.querySelector('.hub__os-bars');
    if (numEl) countUp(numEl, +numEl.dataset.t, 1.5);
    if (bars) gsap.delayedCall(0.5, () => bars.classList.add('hub__os-bars--on'));
  }

  /* ---- WAT BLIJFT — ask form (chips fill input, submit shows stub reply) ---- */
  function initWatBlijftAsk() {
    askInstance = initAskAssistant(root);
  }

  /* ---- DE BIBLIOTHEEK book tap-to-open ---- */
  function initBibliotheekBooks() {
    root.querySelectorAll('.hub__lib-book').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        btn.classList.toggle('hub__lib-book--open');
      });
    });
  }

  /* ---- Snow particles on DE OVERSTEEK slide B ---- */
  function initOversteekSnow() {
    const host = root.querySelector('.hub__os-snow');
    if (!host) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < OVERSTEEK_SNOW_COUNT; i++) {
      const flake = document.createElement('div');
      flake.className = 'hub__os-snowflake';
      const size = 3 + Math.random() * 4;
      const dur = 18 + Math.random() * 18;
      flake.style.width = `${size}px`;
      flake.style.height = `${size}px`;
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.animationDuration = `${dur}s`;
      flake.style.animationDelay = `${-Math.random() * dur}s`;
      flake.style.setProperty('--drift', `${(Math.random() - 0.5) * 100}px`);
      frag.appendChild(flake);
    }
    host.appendChild(frag);
  }

  /* ---- Kerncijfers cascade (locks navigation for ~16s) ---- */
  function fireKerncijfers() {
    kerncijfersDone = true;
    locked = true;
    root.classList.add('hub--locked');

    const tiles = [...root.querySelectorAll('.hub__sl--kerncijfers .hub__pc')];
    if (tiles.length !== 4) return;

    CASCADE.numbers.forEach((cfg, i) => {
      const tile = tiles[i];
      const numEl = tile.querySelector('.hub__pn');
      const target = +numEl.dataset.t;
      gsap.delayedCall(cfg.startAt, () => {
        countUp(numEl, target, cfg.duration);
        gsap.delayedCall(cfg.duration + CASCADE.labelDelayAfterNumber, () => {
          tile.classList.add('hub__pc--label-on');
        });
      });
    });

    const zeroTile = tiles[3];
    const zeroEl = zeroTile.querySelector('.hub__pn');
    gsap.delayedCall(CASCADE.zeroStartAt, () => {
      tickDownToZero(zeroEl, () => {
        gsap.delayedCall(CASCADE.zeroLabelDelay, () => {
          zeroTile.classList.add('hub__pc--label-on');
          gsap.delayedCall(CASCADE.unlockDelayAfterFinalLabel, () => {
            locked = false;
            root.classList.remove('hub--locked');
          });
        });
      });
    });
  }

  /* ---- Resize ---- */
  function onResize() {
    gsap.set(viewport, { y: -row * window.innerHeight });
    tracks.forEach((t, i) => gsap.set(t, { x: -(i === row ? col : 0) * window.innerWidth }));
    if (globeInstance) globeInstance.resize();
    if (laPlanGlobeInstance) laPlanGlobeInstance.resize();
  }

  /* ---- Bind ---- */
  root.addEventListener('touchstart', onTS, { passive: true });
  root.addEventListener('touchmove', onTM, { passive: true });
  root.addEventListener('touchend', onTE, { passive: true });
  root.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);

  vDots.forEach((d, i) =>
    d.addEventListener('pointerdown', e => { e.stopPropagation(); goTo(i, 0); })
  );

  updateDots();
  initOversteekSnow();
  initBibliotheekBooks();
  initWatBlijftAsk();

  /* ---- "Bezoek" button on PEA station slide ---- */
  const visitBtn = root.querySelector('.hub__lib-station-visit');
  if (visitBtn) {
    visitBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      router.navigate('pea');
    });
  }

  requestAnimationFrame(() => root.classList.add('hub--on'));

  /* ---- Lifecycle ---- */
  function cleanup() {
    if (globeInstance) { globeInstance.dispose(); globeInstance = null; }
    if (laPlanGlobeInstance) { laPlanGlobeInstance.dispose(); laPlanGlobeInstance = null; }
    if (askInstance) { askInstance.destroy(); askInstance = null; }
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    nav.unmount();
    root.parentNode?.removeChild(root);
  }

  return {
    unmount() { root.classList.remove('hub--on'); cleanup(); return Promise.resolve(); },
    destroy: cleanup,
  };
}

/* ================================================================
   Per-slide builders — composed into sections by html()
   ================================================================ */

/* ---- Title / DE GIDSEN slide ---- */
function slideTitle() {
  return `
    <section class="hub__sl hub__sl--title">
      <div class="hub__title-atmosphere" aria-hidden="true"></div>
      <img
        class="hub__title-photo"
        src="/assets/title-explorers.jpg"
        alt=""
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />
      <div class="hub__title-vignette" aria-hidden="true"></div>
      <span class="hub__kick hub__title-kick">DE GIDSEN</span>
      <h1 class="hub__names">
        <span class="hub__nm hub__nm--a">Alain Hubert</span>
        <span class="hub__nx">×</span>
        <span class="hub__nm hub__nm--d">Dixie Dansercoer</span>
      </h1>
      <p class="hub__tag"><em>Honderd jaar na de Belgica — twee benen, één wind</em></p>
      <p class="hub__sub">1997 — 2021 · 24 jaar samen op het ijs</p>
    </section>
  `;
}

/* ---- DE OVERSTEEK helpers + slide ---- */
function osHeadline(h) {
  if (h.type === 'countup') {
    return `
      <div class="hub__os-headline hub__os-headline--countup">
        <span class="hub__os-num" data-t="${h.target}">0</span>
        <span class="hub__os-suffix">${h.suffix}</span>
      </div>
    `;
  }
  return `<div class="hub__os-headline hub__os-headline--${h.type}">${h.text}</div>`;
}

function osDayCounter(day, date, kicker) {
  return `
    <div class="hub__os-daycount" aria-hidden="true">
      <span class="hub__os-day-num">${String(day).padStart(2, '0')}</span>
      <span class="hub__os-day-meta">/ 99</span>
      <span class="hub__os-day-dot">·</span>
      <span class="hub__os-day-date">${date}</span>
      <span class="hub__os-day-dot">·</span>
      <span class="hub__os-day-kicker">${kicker}</span>
    </div>
  `;
}

function osFacts(facts) {
  if (!facts || !facts.length) return '';
  return `
    <dl class="hub__os-facts">
      ${facts.map(f => `
        <dt class="hub__os-fact-label">${f.label}</dt>
        <dd class="hub__os-fact-value">${f.value}</dd>
      `).join('')}
    </dl>
  `;
}

function osAtmosphere(kind) {
  if (kind === 'snow') {
    return `<div class="hub__os-atmo-snow" aria-hidden="true"><div class="hub__os-snow"></div></div>`;
  }
  if (kind === 'streaks') {
    // Horizontal wind streaks flying right→left (pure CSS, slide 4)
    const streaks = [];
    for (let i = 0; i < OVERSTEEK_STREAK_COUNT; i++) {
      const top = (4 + Math.random() * 92).toFixed(1);
      const speed = (1.3 + Math.random() * 1.8).toFixed(2);
      const delay = (-Math.random() * 3).toFixed(2);
      const len = (60 + Math.random() * 110).toFixed(0);
      const op = (0.18 + Math.random() * 0.32).toFixed(2);
      streaks.push(
        `<span class="hub__os-streak" style="--top:${top}%;--speed:${speed}s;--delay:${delay}s;--len:${len}px;--op:${op}"></span>`
      );
    }
    return `<div class="hub__os-atmo-streaks" aria-hidden="true">${streaks.join('')}</div>`;
  }
  if (kind === 'ski') {
    // Skiing landscape photo + horizontal band gradient (slide 2)
    return `
      <div class="hub__os-atmo-ski" aria-hidden="true">
        <img class="hub__os-atmo-ski-img" src="/assets/dddd.avif" alt="" loading="lazy" decoding="async" />
        <div class="hub__os-atmo-ski-vignette"></div>
      </div>
    `;
  }
  // 'still' — subtle horizon gradient via CSS, no extra element
  return `<div class="hub__os-atmo-still" aria-hidden="true"></div>`;
}

function osAside(a) {
  if (a.kind === 'photo') {
    return `
      <figure class="hub__os-photo">
        <div class="hub__os-photo-frame" aria-hidden="true"></div>
        ${a.caption ? `<figcaption class="hub__os-photo-cap">${a.caption}</figcaption>` : ''}
      </figure>
    `;
  }
  if (a.kind === 'bars') {
    // 99-day histogram: 99 gray bars + 1 amber spike (the 271 km day)
    const TOTAL_DAYS = 99;
    const PEAK_DAY   = 77;   // late in the journey, after the wind shifted
    const BAR_W      = 2;
    const GAP        = 1;
    const BASELINE   = 90;
    const REG_H      = 22;
    const PEAK_H     = REG_H * 2;
    const STAGGER_MS = 8;
    const PEAK_EXTRA = 300;

    const bars = [];
    for (let i = 0; i < TOTAL_DAYS; i++) {
      const isPeak = i === PEAK_DAY;
      const x = i * (BAR_W + GAP);
      const h = isPeak ? PEAK_H : REG_H;
      const y = BASELINE - h;
      const cls = isPeak ? 'hub__os-histo-bar hub__os-histo-bar--peak' : 'hub__os-histo-bar';
      const delay = (isPeak ? PEAK_DAY * STAGGER_MS + PEAK_EXTRA : i * STAGGER_MS);
      bars.push(
        `<rect class="${cls}" x="${x}" y="${y}" width="${BAR_W}" height="${h}" style="transition-delay: ${delay}ms"/>`
      );
    }

    const svgW = TOTAL_DAYS * (BAR_W + GAP) - GAP;

    return `
      <div class="hub__os-bars" aria-hidden="true">
        <svg class="hub__os-histo" viewBox="0 0 ${svgW} 100" preserveAspectRatio="none">
          ${bars.join('')}
        </svg>
      </div>
    `;
  }
  return '';
}

function slideOversteek(idx) {
  const s = OVERSTEEK[idx];
  const paragraphs = Array.isArray(s.body) ? s.body : [s.body];
  const bodyHtml = paragraphs.map(p => `<p class="hub__os-body">${p}</p>`).join('');
  const factsHtml = osFacts(s.facts);
  const asideHtml = s.aside.kind !== 'none' ? `<div class="hub__os-aside">${osAside(s.aside)}</div>` : '';
  const orderedTail = s.factsPlacement === 'after'
    ? `${asideHtml}${factsHtml}`
    : `${factsHtml}${asideHtml}`;
  return `
    <section class="hub__sl hub__sl--oversteek hub__sl--oversteek--${s.atmosphere}" data-os-slide="${idx}">
      ${osAtmosphere(s.atmosphere)}
      ${osDayCounter(s.day, s.date, s.kicker)}
      <div class="hub__os-content">
        ${osHeadline(s.headline)}
        ${bodyHtml}
        ${orderedTail}
      </div>
    </section>
  `;
}

/* ---- Kerncijfers slide ---- */
function slideKerncijfers() {
  return `
    <section class="hub__sl hub__sl--kerncijfers">
      <div class="hub__poster">
        ${POSTER.map(p => `
          <div class="hub__pc ${p.anchor ? 'hub__pc--anchor' : ''}" data-idx="${p.idx}">
            <span class="hub__pn" data-t="${p.n}">0</span>
            <span class="hub__pl">${p.label}</span>
            ${p.detail ? `<span class="hub__pd">${p.detail}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

/* ---- DE BIBLIOTHEEK slides ---- */
function slideLibBooks() {
  return `
    <section class="hub__sl hub__sl--lib hub__sl--lib-books">
      <span class="hub__kick">BIJNA DERTIG BOEKEN</span>
      <div class="hub__lib-shelf">
        ${BIBLIOTHEEK.books.map((b, i) => `
          <button
            type="button"
            class="hub__lib-book hub__lib-book--${b.tone}"
            style="--tilt: ${b.tilt}deg; --delay: ${0.4 + i * 0.18}s"
            data-book="${b.id}"
            aria-label="${b.title}, ${b.year}"
          >
            <div class="hub__lib-book-face hub__lib-book-cover">
              <span class="hub__lib-book-spine" aria-hidden="true"></span>
              <span class="hub__lib-book-title">${b.title}</span>
              <span class="hub__lib-book-year">${b.year}</span>
              <span class="hub__lib-book-author">${b.author}</span>
            </div>
            <div class="hub__lib-book-face hub__lib-book-inside">
              <p>${b.inside}</p>
            </div>
          </button>
        `).join('')}
      </div>
      <p class="hub__lib-tag"><em>Wat hun lichaam deed, schreven hun handen op.</em></p>
    </section>
  `;
}

function slideLibRoutes() {
  const routes = [
    { year: '2007', color: '#D0563F', label: 'Arctische IJszee', sub: 'Siberië → Groenland', km: 3000 },
    { year: '2008', color: '#E6B541', label: 'Antarctica', sub: 'solo in voetsporen van De Gerlache', km: 5000 },
    { year: '2014', color: '#5A8BC4', label: 'Groenland', sub: 'circumnavigatie', km: 4040, badge: 'wereldrecord' },
  ];
  const maxKm = 5000;

  return `
    <section class="hub__sl hub__sl--lib hub__sl--lib-routes">
      <div class="hub__globe-wrap">
        <canvas class="hub__globe-canvas"></canvas>
      </div>
      <div class="hub__routes-panel">
        <span class="hub__kick">1997 — 2021</span>
        <div class="hub__routes-list">
          ${routes.map(r => `
            <div class="hub__route-item">
              <div class="hub__route-head">
                <span class="hub__route-dot" style="background:${r.color}"></span>
                <span class="hub__route-year">${r.year}</span>
                <div class="hub__route-meta">
                  <span class="hub__route-label">${r.label}</span>
                  <span class="hub__route-sub">${r.sub}</span>
                </div>
                ${r.badge ? `<span class="hub__route-badge">${r.badge}</span>` : ''}
              </div>
              <div class="hub__route-bar-wrap">
                <div class="hub__route-bar" data-w="${(r.km / maxKm * 100).toFixed(0)}%" style="background:${r.color}"></div>
                <span class="hub__route-km">${r.km.toLocaleString('nl-NL')} km</span>
              </div>
            </div>
          `).join('')}
        </div>
        <p class="hub__lib-tag"><em>Vijf continenten. Eén richting. De wind.</em></p>
      </div>
    </section>
  `;
}

function slideLibStation() {
  return `
    <section class="hub__sl hub__sl--lib hub__sl--lib-station">
      <img
        class="hub__lib-station-bg"
        src="/photos/pea/station-dusk.jpg"
        alt="Princess Elisabeth Antarctica at dusk"
        loading="lazy"
        decoding="async"
      />
      <div class="hub__lib-station-vignette" aria-hidden="true"></div>
      <span class="hub__kick hub__lib-station-title">PRINCESS ELISABETH ANTARCTICA</span>
      <div class="hub__lib-station-vertical" aria-hidden="true">
        <span>100% HERNIEUWBARE ENERGIE</span>
      </div>
      <div class="hub__lib-station-caption">
        <p class="hub__lib-body">Terwijl Dixie bleef gaan, bouwde Alain. Het eerste polaire onderzoeksstation dat volledig op zon en wind draait. Vandaag de basis voor klimaatwetenschap op het ijs.</p>
        <p class="hub__lib-sub">Hubert is nog in leven. Het verhaal gaat door, half verloren, half levend.</p>
      </div>
      <button type="button" class="hub__lib-station-visit" data-goto="pea">Bezoek →</button>
    </section>
  `;
}

/* ---- DE LAATSTE ADEM slides ---- */
function slideLaPlan() {
  const { plan } = LAATSTE_ADEM;
  return `
    <section class="hub__sl hub__sl--la hub__sl--la-plan">
      <span class="hub__kick">${plan.kicker}</span>
      <div class="hub__la-plan-stage">
        <div class="hub__la-mini-globe-wrap">
          <canvas class="hub__la-mini-globe-canvas" aria-hidden="true"></canvas>
        </div>
        <div class="hub__la-plan-meta">
          <div class="hub__la-route-name">${plan.route}</div>
          <div class="hub__la-route-sub">${plan.sub}</div>
          <p class="hub__la-plan-body">${plan.body}</p>
        </div>
      </div>
    </section>
  `;
}

function slideLaQuote() {
  const { quote } = LAATSTE_ADEM;
  return `
    <section class="hub__sl hub__sl--la hub__sl--la-quote">
      <span class="hub__kick">${quote.kicker}</span>
      <blockquote class="hub__la-quote-block">
        <p class="hub__la-quote-text" data-text="${quote.text.replace(/"/g, '&quot;')}"></p>
        <span class="hub__la-cursor" aria-hidden="true">▍</span>
      </blockquote>
      <p class="hub__la-quote-attrib">${quote.attribution}</p>
    </section>
  `;
}

function slideLaCrevasse() {
  const { crevasse } = LAATSTE_ADEM;
  return `
    <section class="hub__sl hub__sl--la hub__sl--la-crevasse">
      <span class="hub__kick">${crevasse.kicker}</span>
      <div class="hub__la-fall">
        ${crevasse.milestones.map(m => `
          <div class="hub__la-milestone">
            <span class="hub__la-depth">${m.depth}</span>
            <span class="hub__la-line">${m.line}</span>
          </div>
        `).join('')}
      </div>
      <div class="hub__la-closing" aria-hidden="true">
        <p>${crevasse.closing.replace(/\n/g, '<br/>')}</p>
      </div>
    </section>
  `;
}

/* ---- WAT BLIJFT slides ---- */
function slideWbAsk() {
  const { ask } = WAT_BLIJFT;
  return `
    <section class="hub__sl hub__sl--wb hub__sl--wb-ask">
      <!-- LEFT: Penguin -->
      <div class="ask__penguin">
        <canvas class="ask__penguin-canvas"></canvas>
      </div>

      <!-- CENTER: Answer zone -->
      <div class="ask__center">
        <div class="ask__welcome">
          <h2 class="ask__welcome-title">Stel een vraag</h2>
          <p class="ask__welcome-sub">Stel een vraag over Dixie, Alain of de poolexpedities</p>
          <div class="ask__chips">
            ${ask.chips.map(q => `
              <button type="button" class="ask__chip" data-q="${q}">${q}</button>
            `).join('')}
          </div>
        </div>

        <div class="ask__thinking" hidden>
          <div class="ask__thinking-dots">
            <div class="ask__thinking-dot"></div>
            <div class="ask__thinking-dot"></div>
            <div class="ask__thinking-dot"></div>
          </div>
          <span class="ask__thinking-label">denken...</span>
        </div>

        <p class="ask__answer" hidden></p>
        <div class="ask__followups" hidden></div>
      </div>

      <!-- BOTTOM: Input bar -->
      <div class="ask__input-bar">
        <form class="ask__input-form" autocomplete="off">
          <button type="button" class="ask__mic-btn" aria-label="Microfoon">
            <svg class="ask__mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <rect x="9" y="1" width="6" height="11" rx="3"/>
              <path d="M19 10v1a7 7 0 01-14 0v-1"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>
          <input
            type="text"
            class="ask__input-field"
            placeholder="Typ je vraag of spreek..."
            aria-label="Typ je vraag"
          />
          <button type="submit" class="ask__send-btn" aria-label="Stuur">
            <svg class="ask__send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </form>
      </div>
    </section>
  `;
}

/* ---- Section composer ---- */
function row(slides) {
  return `<div class="hub__row"><div class="hub__track">${slides.join('')}</div></div>`;
}

/* ---- Page builder ---- */
function html() {
  return `
  <!-- Vertical dots (6 sections) -->
  <nav class="hub__vw" aria-label="Secties">
    ${ROWS.map((_, i) =>
      `<button class="hub__vd" data-r="${i}" aria-label="Sectie ${i + 1}"></button>`
    ).join('')}
  </nav>

  <!-- Horizontal dots -->
  <div class="hub__hw" aria-label="Kolommen"></div>

  <!-- Viewport -->
  <div class="hub__vp">

    <!-- S1 — title + de oversteek (4 slides) -->
    ${row([
      slideTitle(),
      slideOversteek(0),
      slideOversteek(1),
      slideOversteek(2),
    ])}

    <!-- S2 — globe 1997-2021 (standalone) -->
    ${row([
      slideLibRoutes(),
    ])}

    <!-- S3 — princess elisabeth (standalone) -->
    ${row([
      slideLibStation(),
    ])}

    <!-- S4 — kerncijfers + de laatste adem (4 slides) -->
    ${row([
      slideKerncijfers(),
      slideLaPlan(),
      slideLaQuote(),
      slideLaCrevasse(),
    ])}

    <!-- S5 — bijna dertig boeken (standalone) -->
    ${row([
      slideLibBooks(),
    ])}

    <!-- S6 — AI vraag (standalone) -->
    ${row([
      slideWbAsk(),
    ])}

  </div>`;
}

/* ---- Overview grid builder (called once) ---- */
function buildOverviewHTML() {
  return `
    <div class="hub__ov-grid">
      ${SLIDE_TITLES.map((cols, ri) => `
        <div class="hub__ov-row">
          ${cols.map((title, ci) => `
            <button type="button" class="hub__ov-cell" data-r="${ri}" data-c="${ci}">
              <span class="hub__ov-cell-title">${title}</span>
            </button>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
}
