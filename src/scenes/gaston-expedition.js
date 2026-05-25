/**
 * gaston-expedition.js — 2D full-page slide grid for Gaston de Gerlache page.
 *
 * Mirror of hubert-expedition.js. Same 6-row layout, same .hub__* class
 * namespace (CSS already loaded via hubert-expedition.css), same dispatcher.
 *
 * Sections:
 *   S1 — title + 3 narrative slides       (4 slides)
 *   S2 — polar map                         (1 slide)
 *   S3 — vader & zoon                      (1 slide)
 *   S4 — kerncijfers + 3 narrative slides  (4 slides)
 *   S5 — de terugkeer / PEA bridge         (1 slide)
 *   S6 — een vraag                         (1 slide)
 */
import gsap from 'gsap';
import { createNavBack } from '../ui/nav-back.js';
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
const PINCH_THRESHOLD = 60;
const SNOW_COUNT = 42;

const SLIDE_TITLES = [
  ['De zoon', 'Het vertrek', 'De aankomst', 'Koning Boudewijn'],
  ['Antarctica'],
  ['Vader & zoon'],
  ['In vier cijfers', 'De wereld bezoekt Antarctica', 'Achttien mannen', 'Onder de sneeuw'],
  ['Princess Elisabeth'],
  ['Een vraag'],
];

/* ---- Row 1 narrative slides ---- */
const NARRATIVE = [
  {
    header: 'NOV 1957 \u00b7 ANTWERPEN \u00b7 VERTREK',
    title: 'Het vertrek',
    body: [
      'Op een grijze namiddag in november 1957 vertrok de Polarhav uit Antwerpen. Aan boord: zeventien Belgische mannen, een prefab-basis in onderdelen, en zestig jaar familiegeschiedenis.',
      'De vader had het onbekende continent ontmoet. De zoon kwam terug om er te wonen.',
    ],
    facts: [
      { label: 'Vertrek', value: 'november 1957, Antwerpen' },
      { label: 'Schip', value: 'Polarhav (Noors expeditieschip)' },
      { label: 'Bestemming', value: 'Prinses Ragnhildkust, Koningin Maud-land' },
      { label: 'Doel', value: 'de eerste Belgische Antarctische basis' },
      { label: 'Kader', value: 'Internationaal Geofysisch Jaar 1957\u201358' },
    ],
    atmosphere: 'still',
  },
  {
    header: 'DEC 1957 \u00b7 70\u00b026\u2032 Z \u00b7 AANKOMST OP HET IJS',
    title: 'De aankomst',
    body: [
      'Eind december 1957 bereikt de Polarhav de Prinses Ragnhildkust. Drieduizend kilometer van de plek waar zijn vader zestig jaar eerder in het pakijs vastliep.',
      'Het is volle Antarctische zomer. Vierentwintig uur licht per dag. Temperatuur tussen min vijftien en min dertig graden. De mannen beginnen onmiddellijk te lossen.',
    ],
    facts: [
      { label: 'Co\u00f6rdinaten', value: '70\u00b026\u2032 Z \u00b7 24\u00b019\u2032 O' },
      { label: 'Locatie', value: 'Prinses Ragnhildkust, Koningin Maud-land' },
      { label: 'Temperatuur', value: '\u221215 \u00b0C tot \u221230 \u00b0C' },
      { label: 'Daglicht', value: '24 uur (Antarctische zomer)' },
      { label: 'Bemanning', value: '17 mannen' },
    ],
    atmosphere: 'snow',
  },
  {
    header: 'JAN 1958 \u00b7 KONING BOUDEWIJN \u00b7 DE BASIS OPENT',
    title: 'Koning Boudewijn',
    body: [
      'In drie weken bouwen ze de basis op. Een prefab-constructie van honderdvijftig vierkante meter, genoemd naar de Belgische koning.',
      'Begin januari 1958 wordt Koning Boudewijn-basis officieel geopend. Achttien mannen blijven achter om te overwinteren \u2014 de eerste Belgen die ooit een hele Antarctische winter zullen doorstaan in een eigen, vooraf gebouwde basis.',
    ],
    facts: [
      { label: 'Naam', value: 'Koning Boudewijn-basis' },
      { label: 'Genoemd naar', value: 'Koning Boudewijn van Belgi\u00eb' },
      { label: 'Grootte', value: '\u00b1150 vierkante meter' },
      { label: 'Overwinteraars', value: '18 mannen' },
      { label: 'Onderzoek', value: 'meteorologie \u00b7 glaciologie \u00b7 seismologie \u00b7 aurora' },
      { label: 'Partners', value: 'IGY \u2014 67 deelnemende landen' },
    ],
    atmosphere: 'still',
  },
];

/* ---- Row 4 narrative slides ---- */
const S4_NARRATIVE = [
  {
    header: '1957\u201358 \u00b7 IGY \u00b7 ZEVENENZESTIG LANDEN',
    title: 'De wereld bezoekt Antarctica',
    body: [
      'Gastons expeditie maakt deel uit van het Internationaal Geofysisch Jaar \u2014 een onderzoeksprogramma waaraan zevenenzestig landen meedoen. Voor het eerst in de geschiedenis werken wetenschappers uit ideologisch verschillende kampen samen aan dezelfde planeet.',
      'Op Antarctica worden in deze periode twee\u00ebnveertig basissen gebouwd. Koning Boudewijn is er \u00e9\u00e9n van.',
    ],
    facts: [
      { label: 'Periode', value: '1 juli 1957 \u2014 31 december 1958' },
      { label: 'Landen', value: '67 deelnemende naties' },
      { label: 'Antarctische bases', value: '42 (Belgisch, Amerikaans, Sovjet, Frans, ...)' },
      { label: 'Thema', value: 'magneetveld \u00b7 ionosfeer \u00b7 gletsjers \u00b7 zwaartekracht' },
      { label: 'Erfenis', value: 'Antarctisch Verdrag (1959)' },
    ],
    atmosphere: 'still',
  },
  {
    header: '1958 \u00b7 OVERWINTERING \u00b7 \u221260 \u00b0C BUITEN, +20 \u00b0C BINNEN',
    title: 'Achttien mannen in de nacht',
    body: [
      'Begin maart 1958 vertrekt de Polarhav. Achttien mannen blijven achter \u2014 vijfhonderdtwintig kilometer van de dichtstbijzijnde andere mensen, in een prefab-basis op het ijs.',
      'Drie maanden polaire duisternis. Buitentemperaturen tot min zestig graden. Binnen: een leven van metingen, schrijven, koken, slapen, wachten op de zon. Geen van hen sterft. Geen van hen breekt.',
      'Het verschil met 1897.',
    ],
    facts: [
      { label: 'Periode', value: 'maart 1958 \u2013 november 1958' },
      { label: 'Duisternis', value: '\u00b190 dagen' },
      { label: 'Temperatuur', value: 'binnen +20 \u00b0C \u00b7 buiten tot \u221260 \u00b0C' },
      { label: 'Communicatie', value: 'radio, \u00e9\u00e9n keer per week naar Belgi\u00eb' },
      { label: 'Intern verlies', value: 'geen' },
    ],
    atmosphere: 'snow',
  },
  {
    header: '1967 \u00b7 KONING BOUDEWIJN \u00b7 ONDER DE SNEEUW',
    title: 'Onder de sneeuw',
    body: [
      'Twaalf jaar werkt Koning Boudewijn-basis. Belgische, Nederlandse en Zuid-Afrikaanse teams overwinteren er. Zeshonderd wetenschappers passeren.',
      'In 1967 sluit Belgi\u00eb de basis. De prefab-modules worden afgesloten en achtergelaten. Sneeuw stapelt zich op. Binnen tien jaar is er niets meer zichtbaar \u2014 het ijs heeft het gebouw geabsorbeerd.',
      'Belgi\u00eb verlaat Antarctica. Voor twee\u00ebnveertig jaar.',
    ],
    facts: [
      { label: 'Opening', value: 'januari 1958' },
      { label: 'Sluiting', value: '1967' },
      { label: 'Duur', value: '12 jaar continue operatie' },
      { label: 'Totaal wetenschappers', value: '\u00b1600' },
      { label: 'Huidige staat', value: 'onder de ijskap, niet meer bereikbaar' },
    ],
    atmosphere: 'somber',
  },
];

/* ---- Kerncijfers ---- */
const POSTER = [
  { idx: 0, n: 60,  label: 'jaar',                          detail: '(sinds zijn vader)',  anchor: false },
  { idx: 1, n: 600, label: 'wetenschappers',                 detail: '(over 12 jaar)',      anchor: false },
  { idx: 2, n: 12,  label: 'jaar operationeel',              detail: '',                    anchor: false },
  { idx: 3, n: 1,   label: 'zoon die het verhaal voortzet',  detail: '',                    anchor: true  },
];

const CASCADE = {
  numbers: [
    { startAt: 0.3, duration: 1.8 },
    { startAt: 2.8, duration: 1.6 },
    { startAt: 5.1, duration: 1.4 },
  ],
  labelDelayAfterNumber: 0.2,
  anchorStartAt: 7.5,
  anchorTicks: [
    { v: 0, t: 0 },
    { v: 0, t: 1.0 },
    { v: 0, t: 2.0 },
    { v: 1, t: 3.0 },
  ],
  anchorLabelDelay: 2.5,
  unlockDelayAfterFinalLabel: 1.0,
};

/* ---- Ask form ---- */
const WAT_BLIJFT = {
  ask: {
    kicker: 'EEN VRAAG',
    placeholder: 'Stel een vraag over Gaston\u2026',
    chips: [
      'Waarom verdween de basis onder de sneeuw?',
      'Wat heeft zijn zoon gedaan?',
      'Waar staat de basis nu \u2014 kunnen we hem zien?',
    ],
    micro: 'Wat zou je willen weten over Gaston?',
    stubReply: '(antwoord komt binnenkort \u2014 LLM-koppeling in voorbereiding)',
    closing: 'Hij ging niet om beroemd te worden.\nHij ging om iets achter te laten \u2014 en dat is gelukt.',
  },
};

/* ---- Helpers ---- */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function countUp(el, target, duration = 2.2, delay = 0) {
  if (target === 0) { el.textContent = '0'; return; }
  const o = { v: 0 };
  gsap.to(o, {
    v: target, duration, delay, ease: 'power2.out',
    onUpdate: () => { el.textContent = Math.round(o.v); },
  });
}

function tickAnchor(el, onDone) {
  CASCADE.anchorTicks.forEach(({ v, t }) => {
    gsap.delayedCall(t, () => { el.textContent = String(v); });
  });
  const lastT = CASCADE.anchorTicks[CASCADE.anchorTicks.length - 1].t;
  gsap.delayedCall(lastT, () => onDone?.());
}

/* ================================================================
   Scene factory
   ================================================================ */
export async function createGastonExpeditionScene(container, params, router) {
  let row = 0, col = 0, animating = false;
  let kerncijfersDone = false;
  let locked = false;
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
     OVERVIEW MODE
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

  // S6 col 0 = in-hub "Een vraag" slide (used as fallback for data-route="ask")
  const ASK_ROW = SLIDE_TITLES.length - 1;

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
  ovBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (ovOpen) closeOverview(); else openOverview(); });

  /* ---- Pinch detection ---- */
  let pinchStartDist = 0, isPinching = false;
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
    if (r !== row) {
      gsap.to(viewport, { y: -r * window.innerHeight, duration: DURATION, ease: EASE });
      row = r;
    }
    gsap.to(tracks[r], {
      x: -c * window.innerWidth, duration: DURATION, ease: EASE,
      onComplete() { animating = false; fireRowEntry(r, c); },
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
  function onTS(e) {
    if (e.touches.length === 2) { isPinching = true; pinchStartDist = getPinchDist(e); return; }
    if (ovOpen) return;
    isPinching = false; tx = e.touches[0].clientX; ty = e.touches[0].clientY; tt = Date.now();
  }
  function onTM(e) { if (e.touches.length === 2) isPinching = true; }
  function onTE(e) {
    if (isPinching) {
      const endDist = getPinchDist(e);
      if (endDist > 0) {
        const delta = endDist - pinchStartDist;
        if (delta > PINCH_THRESHOLD && !ovOpen) openOverview();
        if (delta < -PINCH_THRESHOLD && ovOpen) closeOverview();
      } else if (ovOpen) { closeOverview(); }
      isPinching = false; pinchStartDist = 0; return;
    }
    if (ovOpen) return;
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Date.now() - tt > 800) return;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax < SWIPE_THRESHOLD && ay < SWIPE_THRESHOLD) return;
    if (ax > ay) move(dx > 0 ? 'left' : 'right');
    else         move(dy > 0 ? 'up' : 'down');
  }

  /* ---- Wheel ---- */
  let wCool = false;
  function onWheel(e) {
    e.preventDefault();
    if (ovOpen || wCool || animating || locked) return;
    wCool = true; setTimeout(() => { wCool = false; }, 600);
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) move(e.deltaX > 0 ? 'right' : 'left');
    else move(e.deltaY > 0 ? 'down' : 'up');
  }

  /* ---- Keyboard ---- */
  function onKey(e) {
    if (e.key === 'Escape' && ovOpen) { closeOverview(); return; }
    if (locked || ovOpen) return;
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
  }

  /* ---- Row entry dispatcher ---- */
  function fireRowEntry(rowIdx, colIdx) {
    const id = ROWS[rowIdx]?.id;
    if (id === 's4' && colIdx === 0 && !kerncijfersDone) fireKerncijfers();
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
    gsap.delayedCall(CASCADE.anchorStartAt, () => {
      tickAnchor(anchorEl, () => {
        gsap.delayedCall(CASCADE.anchorLabelDelay, () => {
          anchorTile.classList.add('hub__pc--label-on');
          gsap.delayedCall(CASCADE.unlockDelayAfterFinalLabel, () => {
            locked = false;
            root.classList.remove('hub--locked');
          });
        });
      });
    });
  }

  /* ---- Snow particles ---- */
  function initSnow() {
    root.querySelectorAll('.hub__gst-snow').forEach(host => {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < SNOW_COUNT; i++) {
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
    });
  }

  /* ---- Ask form (rich AI assistant with 3D penguin) ---- */
  function initWatBlijftAsk() {
    askInstance = initAskAssistant(root);
  }

  /* ---- PEA bridge — Dixie-style "Bezoek →" button on PE slide ---- */
  function initPeaBridge() {
    const btn = root.querySelector('.hub__lib-station-visit');
    if (!btn) return;
    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      router.navigate('pea', {});
    });
  }

  /* ---- Resize ---- */
  function onResize() {
    gsap.set(viewport, { y: -row * window.innerHeight });
    tracks.forEach((t, i) => gsap.set(t, { x: -(i === row ? col : 0) * window.innerWidth }));
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
  initSnow();
  initWatBlijftAsk();
  initPeaBridge();
  requestAnimationFrame(() => root.classList.add('hub--on'));

  /* ---- Lifecycle ---- */
  function cleanup() {
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    nav.unmount();
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
        src="/photos/gaston/portrait.jpg"
        alt=""
        loading="lazy"
        decoding="async"
        aria-hidden="true"
        onerror="this.style.display='none'"
      />
      <div class="hub__title-vignette" aria-hidden="true"></div>
      <span class="hub__kick hub__title-kick">DE ZOON</span>
      <h1 class="hub__names">
        <span class="hub__nm hub__nm--a">Gaston</span>
        <span class="hub__nx">de Gerlache</span>
      </h1>
      <p class="hub__tag"><em>om een spoor achter te laten</em></p>
      <p class="hub__sub">1957 \u2014 1967 \u00b7 Koning Boudewijn-basis</p>
    </section>
  `;
}

/* ---- Narrative slides (shared builder for Row 1 + Row 4) ---- */
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
    return `<div class="hub__os-atmo-snow" aria-hidden="true"><div class="hub__gst-snow"></div></div>`;
  }
  if (kind === 'somber') {
    return `<div class="hub__os-atmo-still" aria-hidden="true" style="background:linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.4) 100%)"></div>`;
  }
  return `<div class="hub__os-atmo-still" aria-hidden="true"></div>`;
}

function slideNarrative(idx) {
  const s = NARRATIVE[idx];
  const bodyHtml = s.body.map(p => `<p class="hub__os-body">${p}</p>`).join('');
  return `
    <section class="hub__sl hub__sl--oversteek hub__sl--oversteek--${s.atmosphere}">
      ${osAtmosphere(s.atmosphere)}
      <div class="hub__os-daycount" aria-hidden="true">
        <span class="hub__os-day-kicker">${s.header}</span>
      </div>
      <div class="hub__os-content">
        <div class="hub__os-headline hub__os-headline--serif">${s.title}</div>
        ${bodyHtml}
        ${osFacts(s.facts)}
      </div>
    </section>
  `;
}

function slideS4Narrative(idx) {
  const s = S4_NARRATIVE[idx];
  const bodyHtml = s.body.map(p => `<p class="hub__os-body">${p}</p>`).join('');
  return `
    <section class="hub__sl hub__sl--oversteek hub__sl--oversteek--${s.atmosphere}">
      ${osAtmosphere(s.atmosphere)}
      <div class="hub__os-daycount" aria-hidden="true">
        <span class="hub__os-day-kicker">${s.header}</span>
      </div>
      <div class="hub__os-content">
        <div class="hub__os-headline hub__os-headline--serif">${s.title}</div>
        ${bodyHtml}
        ${osFacts(s.facts)}
      </div>
    </section>
  `;
}

/* ---- Kerncijfers ---- */
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

/* ---- Row 2 — Polar map ---- */
function slideMap() {
  return `
    <section class="hub__sl hub__sl--lib hub__sl--gst-map">
      <div class="hub__gst-map">
        <svg class="hub__gst-map-svg" viewBox="0 0 500 500">
          <!-- Concentric circles (latitude rings) -->
          <circle cx="250" cy="250" r="200" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
          <circle cx="250" cy="250" r="150" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" />
          <circle cx="250" cy="250" r="100" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="0.5" />
          <circle cx="250" cy="250" r="50" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="0.5" />

          <!-- Adrien's Belgica route (Antarctic Peninsula, west side) -->
          <path class="hub__gst-map-adrien" d="M 180 100 Q 160 140 155 180 Q 150 200 160 220" fill="none" stroke="#D0563F" stroke-width="2" opacity="0.4" stroke-dasharray="6 4" />
          <text x="115" y="90" class="hub__gst-map-label" fill="#D0563F" opacity="0.5" font-size="10">ADRIEN \u00b7 BELGICA \u00b7 1897</text>

          <!-- Gaston's Koning Boudewijn basis (east side, Queen Maud Land) -->
          <circle class="hub__gst-map-gaston" cx="340" cy="130" r="6" fill="#CC7E33" />
          <circle class="hub__gst-map-gaston-pulse" cx="340" cy="130" r="6" fill="#CC7E33" opacity="0" />
          <text x="355" y="120" class="hub__gst-map-label" fill="#CC7E33" font-size="10">GASTON</text>
          <text x="355" y="135" class="hub__gst-map-label" fill="#CC7E33" font-size="9" opacity="0.6">KONING BOUDEWIJN \u00b7 1957</text>

          <!-- Distance line between the two -->
          <line x1="170" y1="180" x2="340" y2="130" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="4 6" />
        </svg>

        <p class="hub__gst-map-quote"><em>Zestig jaar. Vierduizend kilometer. Dezelfde naam.</em></p>

        <div class="hub__gst-map-annotation">
          <span>DEZE PLEK</span>
          <span>zal in 2009 opnieuw belangrijk worden</span>
          <span>voor Belgi\u00eb.</span>
        </div>
      </div>
    </section>
  `;
}

/* ---- Row 3 — Vader & Zoon ---- */
function slideVaderZoon() {
  return `
    <section class="hub__sl hub__sl--gst-vz">
      <div class="hub__gst-vz">
        <div class="hub__gst-vz-left">
          <div class="hub__gst-vz-portrait">
            <img src="/photos/adrien/portrait.jpg" alt="Adrien de Gerlache" class="hub__gst-vz-img" loading="lazy" />
          </div>
          <div class="hub__gst-vz-meta">ADRIEN \u00b7 1897 \u00b7 DERTIG JAAR</div>
        </div>
        <div class="hub__gst-vz-center">
          <span class="hub__gst-vz-gap">zestig jaar</span>
        </div>
        <div class="hub__gst-vz-right">
          <div class="hub__gst-vz-portrait">
            <img src="/photos/gaston/portrait.jpg" alt="Gaston de Gerlache" class="hub__gst-vz-img" loading="lazy" />
          </div>
          <div class="hub__gst-vz-meta">GASTON \u00b7 1957 \u00b7 ACHTENDERTIG JAAR</div>
        </div>
      </div>
      <p class="hub__gst-vz-body">Vader en zoon. Twee expedities. Beide naar hetzelfde continent \u2014 maar nooit naar dezelfde plek. Adrien voer langs het Antarctisch Schiereiland. Gaston bouwde aan de andere kant van het continent.<br/>Geen overdracht. Geen re\u00fcnie. Adrien stierf in 1934. Gaston was vijftien.</p>
    </section>
  `;
}

/* ---- Row 5 — De Terugkeer ---- */
function slideReturn() {
  return `
    <section class="hub__sl hub__sl--gst-return">
      <div class="hub__gst-return">
        <div class="hub__gst-return-text">
          <span class="hub__kick">DE TERUGKEER</span>
          <h2 class="hub__gst-return-title">De terugkeer</h2>
          <p class="hub__gst-return-body">Na 1967 verdwijnt Belgi\u00eb van Antarctica. Twee\u00ebnveertig jaar lang geen Belgische basis, geen Belgische winteroverleving, geen Belgisch onderzoeksstation.</p>
          <p class="hub__gst-return-body">Tot 2009.</p>
          <p class="hub__gst-return-body">Op vijftien februari van dat jaar opent Prinses Elisabeth Antarctica de deuren. Een zero-emissie-station, gebouwd op zonne- en windenergie. Locatie: 71\u00b057\u2032 Zuid, 23\u00b020\u2032 Oost \u2014 honderdzesentachtig kilometer van waar Koning Boudewijn-basis nog steeds onder de sneeuw ligt.</p>
          <p class="hub__gst-return-body">Gaston was toen al drie jaar overleden. Maar het spoor dat hij achterliet, was nooit echt verdwenen. Het lag te wachten.</p>
          <dl class="hub__os-facts">
            <dt class="hub__os-fact-label">Gaston sterft</dt><dd class="hub__os-fact-value">november 2006</dd>
            <dt class="hub__os-fact-label">PEA opening</dt><dd class="hub__os-fact-value">15 februari 2009</dd>
            <dt class="hub__os-fact-label">Tussen basissen</dt><dd class="hub__os-fact-value">42 jaar Belgische afwezigheid</dd>
            <dt class="hub__os-fact-label">Afstand KB \u2014 PEA</dt><dd class="hub__os-fact-value">186 km</dd>
            <dt class="hub__os-fact-label">Samenwerking</dt><dd class="hub__os-fact-value">IPF (gesticht door Alain Hubert)</dd>
          </dl>
        </div>
        <div class="hub__gst-return-map">
          <p class="hub__gst-return-map-header"><em>Dezelfde regio. Twee\u00ebnveertig jaar later.</em></p>
          <svg class="hub__gst-return-svg" viewBox="0 0 400 300">
            <path d="M 20 40 Q 100 30 200 50 Q 300 70 380 45" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
            <!-- Koning Boudewijn -->
            <circle cx="160" cy="120" r="5" fill="rgba(255,255,255,0.3)" />
            <text x="175" y="115" class="hub__gst-map-label" fill="rgba(255,255,255,0.4)" font-size="10">KONING BOUDEWIJN</text>
            <text x="175" y="130" class="hub__gst-map-label" fill="rgba(255,255,255,0.25)" font-size="9">1957\u20131967 \u00b7 onder de sneeuw</text>
            <!-- PEA -->
            <circle class="hub__gst-map-pea" cx="200" cy="200" r="6" fill="#CC7E33" />
            <circle class="hub__gst-map-pea-pulse" cx="200" cy="200" r="6" fill="#CC7E33" opacity="0" />
            <text x="215" y="195" class="hub__gst-map-label" fill="#CC7E33" font-size="10">PRINSES ELISABETH</text>
            <text x="215" y="210" class="hub__gst-map-label" fill="#CC7E33" font-size="9" opacity="0.6">2009 \u2192 nu</text>
            <!-- Distance -->
            <line x1="160" y1="125" x2="200" y2="195" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="4 6" />
            <text x="138" y="165" class="hub__gst-map-label" fill="rgba(255,255,255,0.3)" font-size="10">186 km</text>
          </svg>
          <button type="button" class="hub__gst-pea-btn">Bezoek Prinses Elisabeth \u2192</button>
        </div>
      </div>
    </section>
  `;
}

/* ---- Row 5 — Princess Elisabeth (Dixie-style full-bleed photo) ---- */
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
        <p class="hub__lib-body">Tweeenveertig jaar na de sluiting van Koning Boudewijn opent Prinses Elisabeth Antarctica. Het eerste zero-emissie poolstation, gebouwd op zon en wind. Het spoor dat Gaston achterliet, lag te wachten.</p>
        <p class="hub__lib-sub">Honderdzesentachtig kilometer van de oude basis. Hetzelfde continent, een nieuwe eeuw.</p>
      </div>
      <button type="button" class="hub__lib-station-visit" data-goto="pea">Bezoek -></button>
    </section>
  `;
}

/* ---- Row 6 — Ask (rich 3-zone layout with 3D penguin) ---- */
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
          <p class="ask__welcome-sub">${ask.micro || 'Stel een vraag over Gaston of de poolexpedities'}</p>
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
    <!-- S1 — title + narrative -->
    ${row([slideTitle(), slideNarrative(0), slideNarrative(1), slideNarrative(2)])}

    <!-- S2 — polar map -->
    ${row([slideMap()])}

    <!-- S3 — vader & zoon -->
    ${row([slideVaderZoon()])}

    <!-- S4 — kerncijfers + narrative -->
    ${row([slideKerncijfers(), slideS4Narrative(0), slideS4Narrative(1), slideS4Narrative(2)])}

    <!-- S5 — Princess Elisabeth (Dixie-style) -->
    ${row([slideLibStation()])}

    <!-- S6 — een vraag (rich, 3D penguin) -->
    ${row([slideWbAsk()])}
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
