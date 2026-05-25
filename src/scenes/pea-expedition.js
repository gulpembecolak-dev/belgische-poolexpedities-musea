/**
 * pea-expedition.js — 5-row slide grid for Princess Elisabeth Antarctica.
 *
 * Row 1 — Title + hero image          (2 slides)
 * Row 2 — Polar map + fact strip       (2 slides)
 * Row 3 — Het gebouw                   (1 slide)
 * Row 4 — Science grid + live data     (2 slides)
 * Row 5 — Future + ask                 (2 slides)
 *
 * Same grid engine as hubert-expedition.js.
 */
import gsap from 'gsap';
import { createNavBack } from '../ui/nav-back.js';

/* ---- Grid layout ---- */
const ROWS = [
  { id: 'r1', cols: 2 },
  { id: 'r2', cols: 2 },
  { id: 'r3', cols: 1 },
  { id: 'r4', cols: 2 },
  { id: 'r5', cols: 2 },
];

const SLIDE_TITLES = [
  ['Het station', 'Panorama'],
  ['Drie expedities', 'De cijfers'],
  ['Het gebouw'],
  ['Zeven wetenschappen', 'Live meting'],
  ['2050', 'Vraag het station'],
];

const DURATION = 1.8;
const EASE = 'power3.inOut';
const SWIPE_THRESHOLD = 40;
const PINCH_THRESHOLD = 60;

/* ---- Day counter ---- */
const INAUGURATION = new Date('2009-02-15');
const MONTHS_NL = [
  'januari','februari','maart','april','mei','juni',
  'juli','augustus','september','oktober','november','december',
];

function getDayCount() {
  return Math.floor((Date.now() - INAUGURATION) / 86400000);
}

function getDateStr() {
  const d = new Date();
  return `${d.getDate()} ${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`;
}

function getSeasonLabel() {
  const m = new Date().getMonth();
  return (m >= 10 || m <= 1)
    ? 'BEMANNING ACTIEF \u00b7 22 MENSEN'
    : 'WINTERPAUZE \u00b7 AUTOMATISCHE METING';
}

/* ---- Science data ---- */
const SCIENCES = [
  { name: 'Astrofysica', icon: '\u2726', short: 'Kosmische straling boven de pool',
    detail: 'Het KATABATA-project bestudeert kosmische deeltjes die de atmosfeer boven Antarctica binnendringen. De pool biedt een uniek venster: het magnetisch veld stuurt geladen deeltjes naar de polen.' },
  { name: 'Klimatologie', icon: '\u25d0', short: 'PEACE-project \u2014 6 weerstations meten continu',
    detail: 'Zes automatische weerstations rond het station meten temperatuur, druk, wind en vochtigheid. De data voedt klimaatmodellen die voorspellen hoe snel het ijsplateau verandert.' },
  { name: 'Geodesie', icon: '\u25ce', short: 'Hoe schuift Antarctica?',
    detail: 'GPS-sensoren meten de beweging van de ijskap tot op de millimeter. Dit vertelt ons hoe snel het continent zich herstelt van de laatste ijstijd \u2014 en hoe het nu reageert op opwarming.' },
  { name: 'Geologie', icon: '\u25c7', short: 'Het gesteente onder het ijs',
    detail: 'Het nunatak Utsteinen \u2014 de granieten richel waarop het station staat \u2014 bevat gesteente van meer dan 500 miljoen jaar oud. Het is een van de weinige plekken in Oost-Antarctica waar de rots blootligt.' },
  { name: 'Geomorfologie', icon: '\u25b3', short: 'Hoe vormt wind het landschap?',
    detail: 'Katabatische winden \u2014 koude lucht die van het ijsplateau naar de kust stroomt \u2014 vormen het landschap rond het station. Onderzoekers meten sneeuwdrift, erosiepatronen en oppervlaktevormen.' },
  { name: 'Glaciologie', icon: '\u2744', short: 'De snelheid van de gletsjer',
    detail: 'De S\u00f8r Rondane-gletsjer beweegt zich langzaam naar de kust. Radarbeelden en boorkernen onthullen hoeveel sneeuw er jaarlijks valt en hoe het ijs zich door de eeuwen heeft opgebouwd.' },
  { name: 'Microbiologie', icon: '\u2b21', short: 'Leven in extreme kou',
    detail: 'In het smeltwater van het nunatak leven extremofiele bacteri\u00ebn die overleven bij \u221230\u00a0\u00b0C. Ze vertellen ons over de grenzen van het leven \u2014 en misschien over leven op Mars.' },
];

/* ---- Building layers ---- */
const BUILDING = [
  { id: 1, label: 'Zonnepanelen', desc: 'Op het dak: 150\u00a0m\u00b2 zonnepanelen. In de zomer produceren ze meer stroom dan het station verbruikt.', top: '10%', left: '50%' },
  { id: 2, label: 'Windturbines', desc: 'Negen turbines op de richel achter het station. Ze leveren 80% van de totale energie.', top: '18%', left: '86%' },
  { id: 3, label: 'Slim energienet', desc: 'Een geautomatiseerd netwerk verdeelt stroom over modules. Als de wind afneemt, worden niet-essenti\u00eble systemen gepauzeerd.', top: '48%', left: '50%' },
  { id: 4, label: 'Waterrecyclage', desc: 'Smeltwater wordt tot vijf keer gerecycled. Elke druppel telt op een continent zonder regen.', top: '50%', left: '28%' },
  { id: 5, label: 'Leefmodules', desc: 'Twee vleugels met slaapkamers, keuken, medische post. Twee\u00ebntwintig mensen, zeven maanden.', top: '38%', left: '18%' },
  { id: 6, label: 'Wetenschapsmodules', desc: 'Centraal gelegen laboratoria voor alle zeven disciplines. 24 uur per dag in bedrijf.', top: '38%', left: '80%' },
  { id: 7, label: 'Granietfundering', desc: 'Het station rust op het nunatak Utsteinen \u2014 een granieten richel die boven het ijs uitsteekt. Geen fundering in ijs.', top: '85%', left: '50%' },
];

const FACTS_R2 = [
  ['GEBOUWD', '2007\u20132008'],
  ['INGEHULDIGD', '15 februari 2009'],
  ['CO\u00d6RDINATEN', '71\u00b057\u2032 Z \u00b7 23\u00b020\u2032 O'],
  ['HOOGTE', '1.382 meter'],
  ['AFSTAND VAN ROI BAUDOUIN', '186 km'],
];

const FACTS_R3 = [
  ['MODULES', '52 prefab onderdelen'],
  ['ENERGIE', '100% wind + zon'],
  ['WINDTURBINES', '9 stuks'],
  ['BATTERIJ', '2 dagen autonomie'],
  ['WATER', 'tot 5\u00d7 gerecycled'],
  ['WINTERONDERHOUD', 'geen bezetting nodig'],
];

const ASK = {
  placeholder: 'Stel een vraag over het station\u2026',
  chips: ['Hoe is het weer nu?', 'Wie is er deze winter?', 'Wat ontdekken ze deze maand?'],
  stubReply: '(antwoord komt binnenkort \u2014 koppeling in voorbereiding)',
  closing: 'Honderdnegenentwintig jaar geleden vertrok er een schip uit Antwerpen.\nHet verhaal loopt nog.',
};

/* ================================================================
   Scene factory
   ================================================================ */
export async function createPeaExpeditionScene(container, params, router) {
  let row = 0, col = 0, animating = false, locked = false;
  let ovOpen = false, ovAnimating = false;
  let mapAnimDone = false, sciInitDone = false, liveDataLoaded = false;
  let ovContainer = null;

  /* ---- DOM ---- */
  const root = document.createElement('div');
  root.className = 'hub';
  root.innerHTML = html();
  container.appendChild(root);

  const viewport = root.querySelector('.hub__vp');
  const tracks = [...root.querySelectorAll('.hub__track')];
  const vDots = [...root.querySelectorAll('.hub__vd')];
  const hWrap = root.querySelector('.hub__hw');

  const nav = createNavBack();
  nav.mount(container, () => router.back());

  /* ---- Dot navigation ---- */
  function updateDots() {
    vDots.forEach((d, i) => d.classList.toggle('hub__vd--on', i === row));
    hWrap.innerHTML = '';
    const maxCol = ROWS[row].cols;
    if (maxCol > 1) {
      for (let c = 0; c < maxCol; c++) {
        const d = document.createElement('button');
        d.className = 'hub__hd' + (c === col ? ' hub__hd--on' : '');
        d.addEventListener('pointerdown', e => { e.stopPropagation(); goTo(row, c); });
        hWrap.appendChild(d);
      }
    }
  }

  /* ---- Navigate ---- */
  function goTo(r, c) {
    if (animating || locked) return;
    if (r === row && c === col) return;
    animating = true;
    row = r; col = c;
    gsap.to(viewport, { y: -row * window.innerHeight, duration: DURATION, ease: EASE });
    tracks.forEach((t, i) => {
      gsap.to(t, { x: -(i === row ? col : 0) * window.innerWidth, duration: DURATION, ease: EASE });
    });
    updateDots();
    fireRowEntry(row, col);
    gsap.delayedCall(DURATION, () => { animating = false; });
  }

  function move(dir) {
    if (animating || locked || ovOpen) return;
    const maxCol = ROWS[row].cols;
    let nr = row, nc = col;
    if (dir === 'down' && row < ROWS.length - 1) { nr = row + 1; nc = 0; }
    else if (dir === 'up' && row > 0) { nr = row - 1; nc = 0; }
    else if (dir === 'right' && col < maxCol - 1) nc = col + 1;
    else if (dir === 'left' && col > 0) nc = col - 1;
    if (nr !== row || nc !== col) goTo(nr, nc);
  }

  /* ---- Touch ---- */
  let tx, ty, tt, isPinching = false, pinchStartDist = 0;

  function getPinchDist(e) {
    if (e.touches?.length >= 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }
    return 0;
  }

  function onTS(e) {
    if (e.touches.length === 2) { isPinching = true; pinchStartDist = getPinchDist(e); return; }
    if (ovOpen) return;
    isPinching = false;
    tx = e.touches[0].clientX; ty = e.touches[0].clientY; tt = Date.now();
  }

  function onTM(e) { if (e.touches.length === 2) isPinching = true; }

  function onTE(e) {
    if (isPinching) {
      const endDist = getPinchDist(e);
      if (endDist > 0) {
        const delta = endDist - pinchStartDist;
        if (delta > PINCH_THRESHOLD && !ovOpen) openOverview();
        if (delta < -PINCH_THRESHOLD && ovOpen) closeOverview();
      } else if (e.changedTouches?.length >= 1 && pinchStartDist > 0 && ovOpen) {
        closeOverview();
      }
      isPinching = false; pinchStartDist = 0;
      return;
    }
    if (ovOpen) return;
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Date.now() - tt > 800) return;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax < SWIPE_THRESHOLD && ay < SWIPE_THRESHOLD) return;
    if (ax > ay) move(dx > 0 ? 'left' : 'right');
    else move(dy > 0 ? 'up' : 'down');
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
    if (id === 'r2' && colIdx === 0 && !mapAnimDone) fireMapAnimation();
    if (id === 'r4' && colIdx === 0 && !sciInitDone) fireScienceGrid();
    if (id === 'r4' && colIdx === 1 && !liveDataLoaded) fireLiveData();
  }

  /* ---- Polar map animation ---- */
  function fireMapAnimation() {
    mapAnimDone = true;
    const paths = root.querySelectorAll('.pea-map__route');
    const dot = root.querySelector('.pea-map__convergence');
    paths.forEach((path, i) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.5,
        delay: 0.5 + i * 0.8,
        ease: 'power2.inOut',
      });
    });
    if (dot) {
      gsap.delayedCall(0.5 + paths.length * 0.8 + 0.5, () => {
        dot.classList.add('pea-map__convergence--on');
      });
    }
  }

  /* ---- Science grid entrance ---- */
  function fireScienceGrid() {
    sciInitDone = true;
    root.querySelectorAll('.pea-sci__card').forEach((card, i) => {
      gsap.fromTo(card, { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, delay: 0.3 + i * 0.12, ease: 'power2.out',
      });
    });
  }

  /* ---- Live data fetch ---- */
  async function fireLiveData() {
    liveDataLoaded = true;
    try {
      const res = await fetch('/data/pea-live.json');
      const data = await res.json();
      const el = root.querySelector('.pea-live__readings');
      if (el && data) {
        const lines = [
          `Temperatuur          ${data.temperature} \u00b0C`,
          `Windsnelheid         ${data.windSpeed} m/s, ${data.windDirection}`,
          `Luchtdruk            ${data.pressure} hPa`,
          `Sneeuwhoogte         +${data.snowChange} cm sinds gisteren`,
          `Zonkracht            ${data.solarPower} W/m\u00b2${data.solarPower === 0 ? ' (winternacht)' : ''}`,
        ];
        el.textContent = lines.join('\n');
      }
    } catch (e) {
      console.warn('[pea] live data fetch failed', e);
    }
  }

  /* ---- Science card expand/collapse ---- */
  function initScienceCards() {
    root.querySelectorAll('.pea-sci__card').forEach(card => {
      card.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        card.classList.toggle('pea-sci__card--open');
      });
    });
  }

  /* ---- Building layer tap ---- */
  function initBuildingLayers() {
    root.querySelectorAll('.pea-bldg__dot').forEach(dot => {
      dot.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const id = dot.dataset.layer;
        root.querySelectorAll('.pea-bldg__dot').forEach(d => d.classList.remove('pea-bldg__dot--on'));
        root.querySelectorAll('.pea-bldg__info').forEach(d => d.classList.remove('pea-bldg__info--on'));
        dot.classList.add('pea-bldg__dot--on');
        const info = root.querySelector(`.pea-bldg__info[data-layer="${id}"]`);
        if (info) info.classList.add('pea-bldg__info--on');
      });
    });
  }

  /* ---- Ask form ---- */
  function initAskForm() {
    const form = root.querySelector('.pea-ask__form');
    const input = root.querySelector('.pea-ask__input');
    const reply = root.querySelector('.pea-ask__reply');
    if (!form || !input) return;

    root.querySelectorAll('.pea-ask__chip').forEach(chip => {
      chip.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        input.value = chip.dataset.q || chip.textContent.trim();
        input.focus();
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      if (reply) {
        reply.hidden = false;
        reply.querySelector('p').textContent = ASK.stubReply;
      }
    });

    input.addEventListener('pointerdown', (e) => e.stopPropagation());
  }

  /* ---- Overview mode ---- */
  function buildOverview() {
    if (ovContainer) return;
    ovContainer = document.createElement('div');
    ovContainer.className = 'hub__ov';
    ovContainer.innerHTML = buildOverviewHTML();
    root.appendChild(ovContainer);

    ovContainer.querySelectorAll('.hub__ov-cell').forEach(cell => {
      cell.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        closeOverview(+cell.dataset.r, +cell.dataset.c);
      });
    });

    ovContainer.addEventListener('pointerdown', (e) => {
      if (e.target === ovContainer || e.target.classList.contains('hub__ov-grid')) {
        closeOverview();
      }
    });
  }

  function openOverview() {
    if (ovOpen || ovAnimating) return;
    ovAnimating = true;
    buildOverview();
    ovContainer.querySelectorAll('.hub__ov-cell').forEach(cell => {
      cell.classList.toggle('hub__ov-cell--current',
        +cell.dataset.r === row && +cell.dataset.c === col);
    });
    root.classList.add('hub--ov');
    gsap.fromTo(ovContainer, { opacity: 0 }, {
      opacity: 1, duration: 0.6, ease: 'power2.out',
      onComplete: () => { ovOpen = true; ovAnimating = false; },
    });
  }

  function closeOverview(targetR, targetC) {
    if (!ovOpen || ovAnimating) return;
    ovAnimating = true;
    gsap.to(ovContainer, {
      opacity: 0, duration: 0.4, ease: 'power2.in',
      onComplete: () => {
        root.classList.remove('hub--ov');
        ovOpen = false; ovAnimating = false;
        if (targetR !== undefined) goTo(targetR, targetC ?? 0);
      },
    });
  }

  /* Overview expand icon */
  const ovBtn = document.createElement('button');
  ovBtn.className = 'hub__ov-btn';
  ovBtn.innerHTML = '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="9" height="9" rx="1.5"/><rect x="16" y="3" width="9" height="9" rx="1.5"/><rect x="3" y="16" width="9" height="9" rx="1.5"/><rect x="16" y="16" width="9" height="9" rx="1.5"/></svg>';
  ovBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (ovOpen) closeOverview(); else openOverview();
  });
  root.appendChild(ovBtn);

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
  initScienceCards();
  initBuildingLayers();
  initAskForm();
  requestAnimationFrame(() => root.classList.add('hub--on'));

  /* ---- Lifecycle ---- */
  function cleanup() {
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
   Slide builders
   ================================================================ */

/* ---- Row 1A: Title ---- */
function slideTitle() {
  const days = getDayCount();
  const dateStr = getDateStr().toUpperCase();
  const season = getSeasonLabel();
  return `
    <section class="hub__sl hub__sl--pea-title">
      <div class="pea-title">
        <div class="pea-title__counter">
          <span class="pea-title__day">DAG ${days.toLocaleString('nl-NL')}</span>
          <span class="pea-title__since">SINDS 15 FEBRUARI 2009 \u00b7 ${dateStr} \u00b7 ${season}</span>
        </div>
        <h1 class="pea-title__name">Prinses Elisabeth Antarctica</h1>
        <p class="pea-title__sub"><em>het station dat blijft.</em></p>
        <p class="pea-title__body">
          In 2009 zette Belgi\u00eb een gebouw neer op een granieten richel in Antarctica.
          Het werkt op wind en zon. Het stoot niets uit. Zeven maanden per jaar wonen er
          mensen \u2014 soms twee\u00ebntwintig, soms twee. Vijf maanden is het leeg en blijft het meten.
        </p>
        <p class="pea-title__body pea-title__body--quiet">
          Dit is de derde Belgische voet op het continent. Adrien gaf zijn schip.
          Gaston gaf zijn naam. Hier blijft iets staan.
        </p>
      </div>
    </section>
  `;
}

/* ---- Row 1B: Hero image ---- */
function slideHero() {
  return `
    <section class="hub__sl hub__sl--pea-hero">
      <div class="pea-hero">
        <img src="/photos/pea-station.png"
             alt="Princess Elisabeth Antarctica \u2014 zero-emission onderzoeksstation"
             class="pea-hero__img" />
        <span class="pea-hero__badge">LIVE OP 71\u00b057\u2032 Z</span>
      </div>
    </section>
  `;
}

/* ---- Row 2A: Polar map ---- */
function slidePolarMap() {
  const cx = 200, cy = 200, s = 3.2;

  function xy(lat, lon) {
    const r = (90 + lat) * s;
    const rad = lon * Math.PI / 180;
    return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)];
  }

  function pp(coords) {
    return coords.map(([la, lo]) => {
      const [x, y] = xy(la, lo);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
  }

  const coast = [
    [-66,-60],[-68,-40],[-70,-20],[-69,0],[-69,20],[-70,30],[-69,50],
    [-67,70],[-67,90],[-66,110],[-67,130],[-70,150],[-72,170],[-73,-170],
    [-72,-150],[-70,-130],[-72,-110],[-74,-100],[-76,-85],[-78,-80],
    [-75,-70],[-70,-65],[-66,-60],
  ];
  const coastPath = 'M ' + pp(coast).join(' L ') + ' Z';

  const r1 = [[-62,-58],[-64,-60],[-66,-64],[-68,-68],[-70,-75],[-71,-85]];
  const r2 = [[-65,0],[-67,10],[-69,18],[-70.4,24.3]];
  const r3 = [[-80,-81],[-84,-60],[-88,-20],[-90,0],[-86,60],[-80,120],[-72,140]];

  const route1Path = 'M ' + pp(r1).join(' L ');
  const route2Path = 'M ' + pp(r2).join(' L ');
  const route3Path = 'M ' + pp(r3).join(' L ');

  const [peaX, peaY] = xy(-71.95, 23.33);
  const [lbl1X, lbl1Y] = xy(-61, -58);
  const [lbl2X, lbl2Y] = xy(-64, 0);
  const [lbl3X, lbl3Y] = xy(-79, -82);

  return `
    <section class="hub__sl hub__sl--pea-map">
      <div class="pea-map">
        <div class="pea-map__svg-wrap">
          <svg class="pea-map__svg" viewBox="0 0 400 400" aria-hidden="true">
            <circle cx="${cx}" cy="${cy}" r="${30 * s}" fill="none" stroke="rgba(232,230,225,0.08)" stroke-width="0.5"/>
            <circle cx="${cx}" cy="${cy}" r="${20 * s}" fill="none" stroke="rgba(232,230,225,0.08)" stroke-width="0.5"/>
            <circle cx="${cx}" cy="${cy}" r="${10 * s}" fill="none" stroke="rgba(232,230,225,0.06)" stroke-width="0.5"/>
            <path d="${coastPath}" fill="rgba(232,230,225,0.04)" stroke="rgba(232,230,225,0.2)" stroke-width="0.8"/>
            <path d="${route1Path}" class="pea-map__route" stroke="#D0563F" stroke-opacity="0.5" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="${route2Path}" class="pea-map__route" stroke="#CC7E33" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="${route3Path}" class="pea-map__route" stroke="rgba(255,255,255,0.7)" stroke-width="2" fill="none" stroke-linecap="round"/>
            <text x="${lbl1X}" y="${lbl1Y - 8}" class="pea-map__label" fill="#D0563F">1897</text>
            <text x="${lbl2X}" y="${lbl2Y - 8}" class="pea-map__label" fill="#CC7E33">1957</text>
            <text x="${lbl3X}" y="${lbl3Y - 8}" class="pea-map__label" fill="rgba(255,255,255,0.6)">1997</text>
            <circle cx="${peaX}" cy="${peaY}" r="12" class="pea-map__convergence-pulse" fill="none" stroke="#CC7E33" stroke-width="1"/>
            <circle cx="${peaX}" cy="${peaY}" r="5" class="pea-map__convergence" fill="#CC7E33" opacity="0"/>
          </svg>
        </div>
        <div class="pea-map__text">
          <p class="pea-map__quote"><em>Hier komen drie eeuwen samen.</em></p>
          <p class="pea-map__body">
            Adrien voer in 1897 langs Antarctica\u2019s kust. Gaston bouwde in 1957 een basis
            op de Koningin Maud-kust. Dixie skiede in 1997 over het continent.<br/><br/>
            Op 73 jaar afstand van Adriens passage staat nu Prinses Elisabeth Antarctica \u2014
            gebouwd door Alain Hubert, Dixie\u2019s expeditiepartner. De cirkel is rond.
          </p>
        </div>
      </div>
    </section>
  `;
}

/* ---- Row 2B: Fact strip ---- */
function slideFactStrip() {
  return `
    <section class="hub__sl hub__sl--pea-facts">
      <div class="pea-facts">
        <span class="hub__kick">HET DOSSIER</span>
        <div class="pea-facts__grid">
          ${FACTS_R2.map(([k, v]) => `
            <div class="pea-facts__row">
              <span class="pea-facts__key">${k}</span>
              <span class="pea-facts__val">${v}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

/* ---- Row 3: Building ---- */
function slideBuilding() {
  return `
    <section class="hub__sl hub__sl--pea-bldg">
      <div class="pea-bldg">
        <div class="pea-bldg__visual">
          <img src="/photos/pea-station.png" alt="Princess Elisabeth Antarctica \u2014 doorsnede"
               class="pea-bldg__img" />
          ${BUILDING.map(b => `
            <button class="pea-bldg__dot" data-layer="${b.id}"
                    style="top:${b.top};left:${b.left}"
                    aria-label="${b.label}">
              <span class="pea-bldg__dot-num">${b.id}</span>
            </button>
          `).join('')}
        </div>
        <div class="pea-bldg__panel">
          <h2 class="pea-bldg__heading">Een huis dat niets verbruikt.</h2>
          <p class="pea-bldg__body">
            Zonnepanelen op het dak. Negen windturbines op de richel. Een slim elektriciteitsnet
            dat weet wanneer de zon zwakker wordt en de wasmachine even moet wachten. Het station
            is gebouwd uit twee\u00ebenvijftig prefab modules \u2014 eerst in Brussel getest, dan op een
            schip naar Kaapstad, dan op een tractorconvoi over zeshonderd kilometer ijs.
          </p>
          <p class="pea-bldg__body pea-bldg__body--quiet">
            Het werkt al zeventien jaar. Nul uitstoot. Het is het enige polaire onderzoeksstation
            ter wereld dat zo werkt.
          </p>
          <div class="pea-bldg__layers">
            ${BUILDING.map(b => `
              <div class="pea-bldg__info" data-layer="${b.id}">
                <span class="pea-bldg__info-num">${b.id}</span>
                <div>
                  <strong>${b.label}</strong>
                  <p>${b.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="pea-facts__grid pea-facts__grid--compact">
            ${FACTS_R3.map(([k, v]) => `
              <div class="pea-facts__row">
                <span class="pea-facts__key">${k}</span>
                <span class="pea-facts__val">${v}</span>
              </div>
            `).join('')}
          </div>
          <p class="pea-bldg__anecdote">
            <em>In september 2007 stond het station vier dagen in Tour & Taxis in Brussel.
            Vijfendertigduizend mensen kwamen kijken. Daarna werd het uit elkaar gehaald,
            in containers gestopt, en op een schip gezet richting Kaapstad.</em>
          </p>
        </div>
      </div>
    </section>
  `;
}

/* ---- Row 4A: Science grid ---- */
function slideScienceGrid() {
  return `
    <section class="hub__sl hub__sl--pea-sci">
      <div class="pea-sci">
        <span class="hub__kick">WAT ZE NU DOEN</span>
        <h2 class="pea-sci__heading">Zeven wetenschappen, \u00e9\u00e9n meetlat.</h2>
        <p class="pea-sci__intro">
          Elk seizoen komen er twintig tot vijftig wetenschappers uit twaalf landen. Ze meten
          dezelfde dingen die hun overgrootouders nooit konden meten: hoe snel het ijs beweegt,
          wat de atmosfeer hier zegt over de rest van de wereld, hoe het magnetisch veld verschuift.
        </p>
        <div class="pea-sci__grid">
          ${SCIENCES.map(s => `
            <button type="button" class="pea-sci__card">
              <span class="pea-sci__icon">${s.icon}</span>
              <span class="pea-sci__name">${s.name}</span>
              <span class="pea-sci__short">${s.short}</span>
              <span class="pea-sci__detail">${s.detail}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

/* ---- Row 4B: Live data ---- */
function slideLiveData() {
  return `
    <section class="hub__sl hub__sl--pea-live">
      <div class="pea-live">
        <span class="hub__kick">LIVE METING</span>
        <div class="pea-live__frame">
          <div class="pea-live__header">
            LIVE METING \u2014 laatste update 8 uur geleden
          </div>
          <div class="pea-live__divider">\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500</div>
          <pre class="pea-live__readings">Laden\u2026</pre>
        </div>
        <p class="pea-live__source">
          Data source: AMRDC radiosonde dataset (CC-BY).<br/>
          De vertraging van 8 uur is ge\u00efen feature \u2014 het station staat op Antarctica.
        </p>
      </div>
    </section>
  `;
}

/* ---- Row 5A: Future ---- */
function slideFuture() {
  return `
    <section class="hub__sl hub__sl--pea-future">
      <div class="pea-future">
        <span class="hub__kick">2050</span>
        <h2 class="pea-future__heading">Wat zegt dit station tegen 2050?</h2>
        <p class="pea-future__body">
          Elke radiosondeballon die hier opstijgt, draagt bij aan klimaatmodellen die ons
          vertellen wat 2050 brengt. De drie kapiteins gingen om te ontdekken, om iets achter
          te laten, om de wind te volgen. Dit station blijft \u2014 niet om verder te gaan,
          maar om te begrijpen.
        </p>
        <p class="pea-future__body pea-future__body--quiet">
          Adrien stierf in 1934. Gaston in 2006. Dixie in 2021. Het station dat hun verhalen
          verbindt, draait nu op zon en wind. De prinses naar wie het is genoemd, is intussen
          vijfentwintig jaar oud.
        </p>
      </div>
    </section>
  `;
}

/* ---- Row 5B: Ask the station ---- */
function slideAsk() {
  return `
    <section class="hub__sl hub__sl--pea-ask">
      <div class="pea-ask">
        <h2 class="pea-ask__heading">Vraag het station iets</h2>
        <div class="pea-ask__chips">
          ${ASK.chips.map(q => `
            <button type="button" class="pea-ask__chip" data-q="${q}">${q}</button>
          `).join('')}
        </div>
        <form class="pea-ask__form" autocomplete="off">
          <input type="text" class="pea-ask__input" placeholder="${ASK.placeholder}" />
          <button type="submit" class="pea-ask__submit">\u2192</button>
        </form>
        <div class="pea-ask__reply" hidden>
          <p></p>
        </div>
        <p class="pea-ask__closing">${ASK.closing}</p>
      </div>
    </section>
  `;
}

/* ---- Composers ---- */
function row(slides) {
  return `<div class="hub__row"><div class="hub__track">${slides.join('')}</div></div>`;
}

function html() {
  return `
  <nav class="hub__vw" aria-label="Secties">
    ${ROWS.map((_, i) =>
      `<button class="hub__vd" data-r="${i}" aria-label="Sectie ${i + 1}"></button>`
    ).join('')}
  </nav>
  <div class="hub__hw" aria-label="Kolommen"></div>
  <div class="hub__vp">
    ${row([slideTitle(), slideHero()])}
    ${row([slidePolarMap(), slideFactStrip()])}
    ${row([slideBuilding()])}
    ${row([slideScienceGrid(), slideLiveData()])}
    ${row([slideFuture(), slideAsk()])}
  </div>`;
}

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
