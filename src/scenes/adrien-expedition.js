/**
 * adrien-expedition.js — 2D full-page slide grid for Adrien de Gerlache page.
 *
 * Mirror of hubert-expedition.js. Same 6-row layout, same .hub__* class
 * namespace (CSS already loaded via hubert-expedition.css), same dispatcher
 * pattern. Differences:
 *   • Content adapted for Belgica expedition (1897-1899)
 *   • Globe shows belgica-1897 route (active), other 4 routes ghosted
 *
 * Sections:
 *   S1 — title + de overwintering          (4 slides)
 *   S2 — globe (1897 — 1899 route)         (1 slide)
 *   S3 — princess elisabeth                (1 slide, shared legacy)
 *   S4 — kerncijfers + de poolnacht        (4 slides)
 *   S5 — boeken & publicaties              (1 slide)
 *   S6 — een vraag                         (1 slide)
 */
import gsap from 'gsap';
import { createNavBack } from '../ui/nav-back.js';
import { createGlobe } from '../three/globe-routes.js';
import { initAskAssistant } from '../ui/ask-assistant.js';

/* ---- Section metadata ---- */
const ROWS = [
  { id: 's1', cols: 4 },
  { id: 's2', cols: 1 },
  { id: 's3', cols: 1 },
  { id: 's4', cols: 4 },
  { id: 's5', cols: 1 },
  { id: 's6', cols: 1 },
];

const DURATION = 1.8;
const EASE = 'power3.inOut';
const SWIPE_THRESHOLD = 40;

const SLIDE_TITLES = [
  /* S1 */ ['De eerste', '16 aug 1897', 'Vastgevroren', 'Bevrijding'],
  /* S2 */ ['1897 — 1899'],
  /* S3 */ ['Princess Elisabeth'],
  /* S4 */ ['In vier cijfers', 'Poolnacht', 'Laatste woorden', 'Émile Danco'],
  /* S5 */ ['Negen volumes'],
  /* S6 */ ['Een vraag'],
];

/* ---- OVERSTEEK data (3 slides: vertrek / vastgevroren / bevrijding) ---- */
const OVERSTEEK = [
  {
    day: 1,
    date: '16 AUG 1897',
    kicker: 'VERTREK',
    headline: { type: 'date', text: '16 AUG 1897' },
    body: [
      'Op een grijze augustusdag verlaat de Belgica de Scheldekaaien. Negentien mannen uit zes landen aan boord — onder hen een jonge Noorse stuurman genaamd Roald Amundsen, en een Amerikaanse arts: Frederick Cook.',
      'Niemand weet dat ze pas over twee jaar en twee maanden zullen terugkeren.',
    ],
    facts: [
      { label: 'Vertrekpunt',  value: 'Antwerpen · Scheldekaaien' },
      { label: 'Bemanning',    value: '19 mannen uit 6 landen' },
      { label: 'Schip',        value: 'Belgica (ex-Patria, 1884)' },
      { label: 'Bestemming',   value: 'het onbekende zuiden' },
    ],
    factsPlacement: 'before',
    atmosphere: 'still',
    aside: { kind: 'none' },
  },
  {
    day: 196,
    date: '28 FEB 1898',
    kicker: 'VAST IN HET PAKIJS',
    headline: { type: 'serif', text: '71° ZUID' },
    body: [
      'Op 71°30\' zuiderbreedte, nabij het afgelegen Peter I-eiland, sluit het pakijs zich rond de Belgica. Het schip zit muurvast.',
      'De Gerlache realiseert zich dat ze niet meer kunnen ontsnappen vóór de winter. Ze worden de eersten die onvrijwillig een Antarctische winter zullen doorbrengen — een beproeving waar niemand zich op heeft voorbereid.',
    ],
    facts: [
      { label: 'Positie',     value: '71°30\' Z · 85°15\' W' },
      { label: 'Locatie',     value: 'nabij Peter I-eiland' },
      { label: 'Status',      value: 'volledig vastgevroren' },
      { label: 'Voorraad',    value: 'voor ~13 maanden' },
      { label: 'Daglicht',    value: 'krimpend tot nul' },
    ],
    factsPlacement: 'before',
    atmosphere: 'snow',
    aside: { kind: 'none' },
  },
  {
    day: 576,
    date: '15 FEB 1899',
    kicker: 'BEVRIJDING',
    headline: { type: 'countup', target: 380, suffix: 'DAGEN VASTGEVROREN' },
    body: [
      'Na driehonderdtachtig dagen breekt de Belgica eindelijk vrij. Het moment is stil — geen gejuich, geen vlaggen. De bemanning is te uitgeput.',
      'Twee mannen kwamen om: Wiencke overboord in januari 1898, Danco aan hartfalen in juni. De rest keert terug met negen volumes wetenschap die de Antarctische ontdekking definiëren.',
    ],
    facts: [
      { label: 'Bevrijd',       value: '15 februari 1899' },
      { label: 'Sterfgevallen', value: '2 (Wiencke · Danco)' },
      { label: 'Methode',       value: 'kanaal door pakijs hakken' },
      { label: 'Terug Antwerpen', value: '5 november 1899' },
    ],
    factsPlacement: 'after',
    atmosphere: 'streaks',
    aside: { kind: 'bars' },
  },
];

const OVERSTEEK_SNOW_COUNT = 42;
const OVERSTEEK_STREAK_COUNT = 16;

/* ---- BIBLIOTHEEK data (books only — Belgica publications) ---- */
const BIBLIOTHEEK = {
  books: [
    {
      id: 'cook-night',
      title: 'Through the First Antarctic Night',
      year: 1900,
      author: 'Frederick A. Cook',
      tilt: -2.5,
      tone: 'sand',
      inside: 'De arts en fotograaf van de Belgica beschrijft de dertien maanden in het pakijs. Cooks waarnemingen redden de bemanning van scheurbuik.',
    },
    {
      id: 'lecointe-voyage',
      title: 'Au Pays des Manchots',
      year: 1904,
      author: 'Georges Lecointe',
      tilt: 1.5,
      tone: 'ink',
      inside: 'De eerste stuurman vertelt het verhaal van de expeditie vanuit Belgisch perspectief — astronomische metingen, navigatie, en het dagelijkse overleven.',
    },
    {
      id: 'racovita-belgica',
      title: 'Cetacea: Mysticeti',
      year: 1903,
      author: 'Emil Racoviță',
      tilt: -3,
      tone: 'cream',
      inside: 'De Roemeense zoöloog publiceert zijn waarnemingen van Antarctische walvissen — onderdeel van de 92 wetenschappelijke publicaties die de expeditie opleverde.',
    },
  ],
};

/* ---- LAATSTE ADEM data (3 slides: poolnacht / quote / danco) ---- */
const LAATSTE_ADEM = {
  plan: {
    kicker: 'MEI — JULI 1898',
    route: 'DE POOLNACHT',
    sub: '70 dagen zonder zon · −40 °C',
    body: 'Op 18 mei zakt de zon onder de horizon en komt zeventig dagen niet meer terug. Olielampen, ijzige stilte, mannen die langzaam wegglijden. Cook noteert: "De duisternis verstikt de ziel."',
  },
  quote: {
    kicker: 'LAATSTE WOORDEN',
    text: 'Het ijs sloot zich boven hem als een grafsteen van kristal.',
    attribution: '— Frederick Cook, journal, 5 juni 1898 — over Émile Danco',
    typeDuration: 5.0,
  },
  crevasse: {
    kicker: 'ÉMILE DANCO · 5 JUNI 1898',
    milestones: [
      { depth: '−40°', line: 'al wekenlang verzwakt' },
      { depth: '02:00', line: 'het hart geeft het op' },
      { depth: '00 m', line: 'door een gat in het ijs, in de zee' },
    ],
    closing: 'De bemanning staat in het maanlicht.\nGeen woorden. Alleen wind.',
    initialDelay: 1.0,
    stepDelay: 2.5,
    closingDelay: 1.5,
    closingHold: 2.5,
  },
};

/* ---- WAT BLIJFT (just ask form for Adrien) ---- */
const WAT_BLIJFT = {
  ask: {
    kicker: 'EEN VRAAG',
    placeholder: 'Stel een vraag over de Belgica…',
    chips: ['Wie was Adrien de Gerlache?', 'Hoe overleefden ze de poolnacht?', 'Wat ontdekten ze?'],
    micro: 'Een installatie gebouwd op de vragen van bezoekers. Wat zou jij hem hebben gevraagd?',
    stubReply: '(antwoord komt binnenkort — LLM-koppeling in voorbereiding)',
  },
};

/* ---- Kerncijfers (Belgica's 4 key numbers) ---- */
const POSTER = [
  { idx: 0, n: 19,  label: 'mannen',       detail: '(uit 6 landen)',  anchor: false },
  { idx: 1, n: 88,  label: 'ontdekkingen', detail: '(geografisch)',   anchor: false },
  { idx: 2, n: 92,  label: 'publicaties',  detail: '(9 volumes)',     anchor: false },
  { idx: 3, n: 380, label: 'dagen',        detail: '(vastgevroren)',  anchor: true  },
];

/* ---- Cascade timing (same as Dansercoer page) ---- */
const CASCADE = {
  numbers: [
    { startAt: 0.3, duration: 1.8 },
    { startAt: 2.8, duration: 1.6 },
    { startAt: 5.1, duration: 1.4 },
  ],
  labelDelayAfterNumber: 0.2,
  zeroStartAt: 7.5,
  // Anchor for Adrien: count UP dramatically to 380 (not down to 0)
  zeroTicks: [
    { v: 1,   t: 0    },
    { v: 50,  t: 0.6  },
    { v: 150, t: 1.4  },
    { v: 280, t: 2.4  },
    { v: 380, t: 3.5  },
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

function tickAnchor(el, onDone) {
  CASCADE.zeroTicks.forEach(({ v, t }) => {
    gsap.delayedCall(t, () => { el.textContent = String(v); });
  });
  const lastT = CASCADE.zeroTicks[CASCADE.zeroTicks.length - 1].t;
  gsap.delayedCall(lastT, () => onDone?.());
}

/* ================================================================
   Scene factory
   ================================================================ */
export async function createAdrienExpeditionScene(container, params, router) {
  let row = 0, col = 0, animating = false;
  let kerncijfersDone = false;
  let oversteekSlideCDone = false;
  let laatsteAdemBDone = false;
  let laatsteAdemCDone = false;
  let locked = false;
  let globeInitDone = false;
  let globeInstance = null;
  let laPlanGlobeDone = false;
  let laPlanGlobeInstance = null;
  let ovOpen = false;
  let ovAnimating = false;
  let askInstance = null;

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
     OVERVIEW MODE (grid of all slides + cross-scene shortcuts)
     ============================================================ */
  const ovEl = document.createElement('div');
  ovEl.className = 'hub__ov';
  ovEl.innerHTML = buildOverviewHTML();
  root.appendChild(ovEl);

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
  const ASK_ROW = SLIDE_TITLES.length - 1; // S6 col 0 = in-hub Een vraag

  function openOverview() {
    if (ovOpen || ovAnimating || locked) return;
    ovAnimating = true; ovOpen = true;
    root.classList.add('hub--ov');
    ovCells.forEach(c => {
      c.classList.toggle('hub__ov-cell--current', +c.dataset.r === row && +c.dataset.c === col);
    });
    gsap.fromTo(ovEl, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out', onComplete: () => { ovAnimating = false; } });
    gsap.fromTo('.hub__ov-grid', { scale: 0.85 }, { scale: 1, duration: 0.6, ease: 'power2.out' });
  }

  function closeOverview(targetRow, targetCol) {
    if (!ovOpen || ovAnimating) return;
    ovAnimating = true;
    const navigating = targetRow !== undefined;
    if (navigating) {
      ovCells.forEach(c => {
        if (+c.dataset.r !== targetRow || +c.dataset.c !== targetCol) {
          gsap.to(c, { opacity: 0, duration: 0.3, ease: 'power2.in' });
        }
      });
    }
    gsap.to(ovEl, {
      opacity: 0, duration: navigating ? 0.5 : 0.4, delay: navigating ? 0.15 : 0, ease: 'power2.in',
      onComplete: () => {
        ovOpen = false; ovAnimating = false;
        root.classList.remove('hub--ov');
        ovCells.forEach(c => { c.style.opacity = ''; });
        if (navigating) goTo(targetRow, targetCol, true);
      },
    });
  }

  ovCells.forEach(cell => {
    cell.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const route = cell.dataset.route;
      if (route === 'pea') { router.navigate('pea'); return; }
      if (route === 'ask') { closeOverview(ASK_ROW, 0); return; }
      closeOverview(+cell.dataset.r, +cell.dataset.c);
    });
  });
  ovEl.addEventListener('pointerdown', (e) => {
    if (e.target === ovEl || e.target.classList.contains('hub__ov-grid')) { e.stopPropagation(); closeOverview(); }
  });
  ovBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (ovOpen) closeOverview(); else openOverview();
  });

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

  /* ---- Touch ---- */
  let tx = 0, ty = 0, tt = 0;
  function onTS(e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; tt = Date.now(); }
  function onTE(e) {
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
    if (wCool || animating || locked) return;
    wCool = true; setTimeout(() => { wCool = false; }, 600);
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) move(e.deltaX > 0 ? 'right' : 'left');
    else move(e.deltaY > 0 ? 'down' : 'up');
  }

  /* ---- Keyboard ---- */
  function onKey(e) {
    if (locked) return;
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (map[e.key]) { e.preventDefault(); map[e.key] && move(map[e.key]); }
  }

  /* ---- Row entry dispatcher ---- */
  function fireRowEntry(rowIdx, colIdx) {
    const id = ROWS[rowIdx]?.id;
    if (id === 's1' && colIdx === 3 && !oversteekSlideCDone) fireOversteekSlideC();
    if (id === 's2' && colIdx === 0 && !globeInitDone) fireGlobeInit();
    if (id === 's4' && colIdx === 0 && !kerncijfersDone) fireKerncijfers();
    if (id === 's4' && colIdx === 1 && !laPlanGlobeDone) fireLaPlanGlobe();
    if (id === 's4' && colIdx === 2 && !laatsteAdemBDone) fireLaatsteAdemSlideB();
    if (id === 's4' && colIdx === 3 && !laatsteAdemCDone) fireLaatsteAdemSlideC();
  }

  /* ---- Globe init (S2) — Belgica route active ---- */
  function fireGlobeInit() {
    globeInitDone = true;
    const canvas = root.querySelector('.hub__globe-canvas');
    if (!canvas) return;
    requestAnimationFrame(() => {
      try {
        globeInstance = createGlobe(canvas, { activeIds: ['belgica-1897'] });
        globeInstance.animateRoutes();
      } catch (e) {
        console.warn('[adrien-globe] init failed:', e);
      }
    });
  }

  /* ---- Plan mini-globe (S4 col 1) — same Belgica route, smaller ---- */
  function fireLaPlanGlobe() {
    laPlanGlobeDone = true;
    const canvas = root.querySelector('.hub__la-mini-globe-canvas');
    if (!canvas) return;
    requestAnimationFrame(() => {
      try {
        laPlanGlobeInstance = createGlobe(canvas, { activeIds: ['belgica-1897'] });
      } catch (e) {
        console.warn('[adrien-la-plan] mini globe init failed:', e);
      }
    });
  }

  /* ---- Laatste woorden — typewriter ---- */
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

  /* ---- Crevasse-equivalent — Danco sequence ---- */
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

  /* ---- Slide C (bevrijding) — 380 count-up + bar reveal ---- */
  function fireOversteekSlideC() {
    oversteekSlideCDone = true;
    const slide = root.querySelector('.hub__sl--oversteek[data-os-slide="2"]');
    if (!slide) return;
    const numEl = slide.querySelector('.hub__os-num');
    const bars  = slide.querySelector('.hub__os-bars');
    if (numEl) countUp(numEl, +numEl.dataset.t, 1.8);
    if (bars) gsap.delayedCall(0.5, () => bars.classList.add('hub__os-bars--on'));
  }

  /* ---- Ask form (rich AI assistant with 3D penguin) ---- */
  function initWatBlijftAsk() {
    askInstance = initAskAssistant(root);
  }

  /* ---- Books tap-to-open ---- */
  function initBibliotheekBooks() {
    root.querySelectorAll('.hub__lib-book').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        btn.classList.toggle('hub__lib-book--open');
      });
    });
  }

  /* ---- Snow particles ---- */
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

  /* ---- Kerncijfers cascade ---- */
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

    const anchorTile = tiles[3];
    const anchorEl = anchorTile.querySelector('.hub__pn');
    gsap.delayedCall(CASCADE.zeroStartAt, () => {
      tickAnchor(anchorEl, () => {
        gsap.delayedCall(CASCADE.zeroLabelDelay, () => {
          anchorTile.classList.add('hub__pc--label-on');
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
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    nav.unmount();
    if (globeInstance) { globeInstance.dispose(); globeInstance = null; }
    if (laPlanGlobeInstance) { laPlanGlobeInstance.dispose(); laPlanGlobeInstance = null; }
    if (askInstance) { askInstance.destroy(); askInstance = null; }
    root.parentNode?.removeChild(root);
  }

  return {
    unmount() { root.classList.remove('hub--on'); cleanup(); return Promise.resolve(); },
    destroy: cleanup,
  };
}

/* ================================================================
   Per-slide builders
   ================================================================ */

function slideTitle() {
  return `
    <section class="hub__sl hub__sl--title">
      <div class="hub__title-atmosphere" aria-hidden="true"></div>
      <img
        class="hub__title-photo"
        src="/photos/adrien/portrait.jpg"
        alt=""
        loading="lazy"
        decoding="async"
        aria-hidden="true"
        onerror="this.style.display='none'"
      />
      <div class="hub__title-vignette" aria-hidden="true"></div>
      <span class="hub__kick hub__title-kick">DE EERSTE</span>
      <h1 class="hub__names">
        <span class="hub__nm hub__nm--a">Belgica</span>
        <span class="hub__nx">×</span>
        <span class="hub__nm hub__nm--d">Adrien de Gerlache</span>
      </h1>
      <p class="hub__tag"><em>De eerste Belgische zuidpoolreis — en de eerste mensheid die overwinterde in Antarctica</em></p>
      <p class="hub__sub">1897 — 1899 · 380 dagen vastgevroren in het pakijs</p>
    </section>
  `;
}

/* ---- OVERSTEEK helpers ---- */
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
      <span class="hub__os-day-num">${String(day).padStart(3, '0')}</span>
      <span class="hub__os-day-meta">/ 815</span>
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
  return `<div class="hub__os-atmo-still" aria-hidden="true"></div>`;
}

function osAside(a) {
  if (a.kind === 'bars') {
    // For Adrien: 815-day expedition timeline, 380-day frozen segment in amber
    const TOTAL_DAYS = 99;        // visual compression of 815 days
    const FROZEN_START = 24;      // ~day 196 of 815 → visual idx 24 of 99
    const FROZEN_END = 70;        // ~day 576 of 815 → visual idx 70 of 99
    const BAR_W = 2;
    const GAP = 1;
    const BASELINE = 90;
    const REG_H = 22;
    const PEAK_H = REG_H * 2;
    const STAGGER_MS = 8;
    const PEAK_EXTRA = 300;

    const bars = [];
    for (let i = 0; i < TOTAL_DAYS; i++) {
      const inFrozen = i >= FROZEN_START && i <= FROZEN_END;
      const x = i * (BAR_W + GAP);
      const h = inFrozen ? PEAK_H : REG_H;
      const y = BASELINE - h;
      const cls = inFrozen ? 'hub__os-histo-bar hub__os-histo-bar--peak' : 'hub__os-histo-bar';
      const delay = inFrozen ? (i * STAGGER_MS + PEAK_EXTRA) : (i * STAGGER_MS);
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

/* ---- Globe slide (standalone, S2) — same 2-col layout as Dixie page ---- */
function slideGlobe() {
  const routes = [
    { year: '1897', color: '#E8DDC8', label: 'Heenreis',     sub: 'Antwerpen → Antarctisch Schiereiland', km: 14000 },
    { year: '1898', color: '#CC7E33', label: 'Vastgevroren', sub: '380 dagen in het pakijs',              km: 0, badge: '13 maanden' },
    { year: '1899', color: '#8DA8C8', label: 'Terugreis',    sub: 'Bevrijding → Antwerpen',                km: 13500 },
  ];
  const maxKm = 14000;

  return `
    <section class="hub__sl hub__sl--lib hub__sl--lib-routes">
      <div class="hub__globe-wrap">
        <canvas class="hub__globe-canvas"></canvas>
      </div>
      <div class="hub__routes-panel">
        <span class="hub__kick">1897 — 1899</span>
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
                <span class="hub__route-km">${r.km > 0 ? r.km.toLocaleString('nl-NL') + ' km' : '— '}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <p class="hub__lib-tag"><em>Antwerpen — Antarctica — Antwerpen. Twee jaar tussen vertrek en thuiskomst.</em></p>
      </div>
    </section>
  `;
}

/* ---- Books slide ---- */
function slideLibBooks() {
  return `
    <section class="hub__sl hub__sl--lib hub__sl--lib-books">
      <span class="hub__kick">NEGEN VOLUMES · 92 PUBLICATIES</span>
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
      <p class="hub__lib-tag"><em>De wetenschap die ze meebrachten vergde meer dan veertig jaar om samen te stellen.</em></p>
    </section>
  `;
}

/* ---- Princess Elisabeth — shared legacy slide ---- */
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

/* ---- LAATSTE ADEM slides ---- */
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

/* ---- AI vraag slide — rich 3-zone layout (penguin + center + input bar) ---- */
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
          <p class="ask__welcome-sub">${ask.micro || 'Stel een vraag over Adrien, de Belgica of de poolexpedities'}</p>
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
  <nav class="hub__vw" aria-label="Secties">
    ${ROWS.map((_, i) =>
      `<button class="hub__vd" data-r="${i}" aria-label="Sectie ${i + 1}"></button>`
    ).join('')}
  </nav>

  <div class="hub__hw" aria-label="Kolommen"></div>

  <div class="hub__vp">

    <!-- S1 — title + vertrek / vastgevroren / bevrijding -->
    ${row([
      slideTitle(),
      slideOversteek(0),
      slideOversteek(1),
      slideOversteek(2),
    ])}

    <!-- S2 — globe (Belgica 1897-1899 route) -->
    ${row([
      slideGlobe(),
    ])}

    <!-- S3 — princess elisabeth -->
    ${row([
      slideLibStation(),
    ])}

    <!-- S4 — kerncijfers + de poolnacht trio -->
    ${row([
      slideKerncijfers(),
      slideLaPlan(),
      slideLaQuote(),
      slideLaCrevasse(),
    ])}

    <!-- S5 — boeken -->
    ${row([
      slideLibBooks(),
    ])}

    <!-- S6 — AI vraag -->
    ${row([
      slideWbAsk(),
    ])}

  </div>`;
}

/* ---- Overview grid builder ---- */
function buildOverviewHTML() {
  const extraStart = SLIDE_TITLES.length;
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
      <!-- Cross-scene cells -->
      <div class="hub__ov-row">
        <button type="button" class="hub__ov-cell" data-r="${extraStart}" data-c="0" data-route="pea">
          <span class="hub__ov-cell-title">Princess Elisabeth</span>
        </button>
      </div>
      <div class="hub__ov-row">
        <button type="button" class="hub__ov-cell" data-r="${extraStart + 1}" data-c="0" data-route="ask">
          <span class="hub__ov-cell-title">Een vraag</span>
        </button>
      </div>
    </div>
  `;
}
