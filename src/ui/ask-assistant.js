/**
 * ask-assistant.js — Rich AI assistant experience for the "Een vraag" slide.
 *
 * Three zones:
 *   Left   — 3D penguin guide (GLB model, idle/listen/speak animations)
 *   Center — Answer display (typewriter, highlighted keywords, follow-ups)
 *   Right  — Audio controls (TTS toggle, waveform, speed)
 *   Bottom — Full-width input bar (text + microphone)
 *
 * Demo mode: pre-written Q&A pairs with fuzzy matching.
 */

import {
  Scene, PerspectiveCamera, WebGLRenderer,
  AmbientLight, DirectionalLight, SpotLight,
  AnimationMixer, Clock, LoopRepeat,
  Vector3, Color, Group, Box3,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

/* ================================================================
   Q&A DATABASE (demo mode)
   ================================================================ */
const QA_PAIRS = [
  {
    keywords: ['groenland', 'greenland', 'waarom groenland'],
    q: 'Waarom Groenland?',
    a: 'Dixie Dansercoer was gefascineerd door Groenland — het op één na grootste ijsoppervlak ter wereld. In <em>2002</em> stak hij de ijskap over van west naar oost, een tocht van <em>2.200 kilometer</em>. Voor hem was Groenland het laboratorium waar hij zijn technieken verfijnde: powerkiting, pulka-navigatie, en het overleven in totale isolatie. Zijn laatste reis, in <em>2021</em>, eindigde daar ook — op de gletsjer die hij zo goed kende.',
    followUps: ['Wat is een powerkite?', 'Hoe is Dixie gestorven?', 'Welke routes heeft hij gelopen?'],
  },
  {
    keywords: ['powerkite', 'kite', 'vlieger', 'wind'],
    q: 'Wat is een powerkite?',
    a: 'Een powerkite is een grote trekvlieger die de wind omzet in tractie. Dixie gebruikte powerkites van <em>12 tot 18 vierkante meter</em> om over sneeuw- en ijsvlaktes te zeilen. De techniek heet <em>kite-skiing</em> of <em>kite-sailing</em>. Met gunstige wind kon hij meer dan <em>200 kilometer per dag</em> afleggen — sneller dan een poolskiër ooit te voet zou kunnen. Het maakte Antarctische traverses mogelijk die eerder ondenkbaar waren.',
    followUps: ['Hoe snel ging hij?', 'Heeft hij de hele Zuidpool overgestoken?', 'Wie was zijn partner?'],
  },
  {
    keywords: ['alain', 'hubert', 'wie was alain'],
    q: 'Wie was Alain Hubert?',
    a: '<em>Alain Hubert</em> is een Belgische poolontdekkingsreiziger en ingenieur. Samen met Dixie Dansercoer voltooide hij in <em>1997–1998</em> de eerste onondersteunde oversteek van Antarctica — <em>3.924 kilometer</em> in <em>99 dagen</em>. Daarna richtte hij de <em>International Polar Foundation</em> op en bouwde hij <em>Prinses Elisabeth Antarctica</em>, het eerste zero-emissie poolstation ter wereld. Hubert is nog in leven en zet zich in voor klimaatwetenschap.',
    followUps: ['Wat is Prinses Elisabeth Antarctica?', 'Hoe lang duurde de oversteek?', 'Zijn ze nog vrienden?'],
  },
  {
    keywords: ['prinses elisabeth', 'pea', 'station', 'zero-emissie', 'onderzoeksstation'],
    q: 'Wat is Prinses Elisabeth Antarctica?',
    a: '<em>Prinses Elisabeth Antarctica</em> is het Belgische poolonderzoeksstation in <em>Koningin Maud-land</em>, geopend op <em>15 februari 2009</em>. Het is het eerste station ter wereld dat volledig draait op hernieuwbare energie — <em>zon en wind</em>. Ontworpen door Alain Hubert en de International Polar Foundation. Het station ligt op <em>71°57\u2032 Zuid</em>, op slechts <em>186 kilometer</em> van de plek waar de oude Koning Boudewijn-basis onder de sneeuw ligt.',
    followUps: ['Wie heeft het gebouwd?', 'Hoeveel wetenschappers werken er?', 'Waarom op die plek?'],
  },
  {
    keywords: ['gestorven', 'dood', 'overlijden', 'spleet', 'crevasse', 'hoe is dixie'],
    q: 'Hoe is Dixie gestorven?',
    a: 'Op <em>7 juni 2021</em> viel Dixie Dansercoer in een <em>gletsjerspleet</em> tijdens een oversteek van de Groenlandse ijskap, nabij <em>Kangerlussuaq</em>. Hij was <em>58 jaar</em> oud. De spleet was bedekt door een dunne sneeuwbrug die onder hem bezweek. Zijn expeditiegenoot probeerde hem te bereiken, maar de spleet was te diep. Dixie stierf op het ijs dat hij beter kende dan bijna iemand ter wereld.',
    followUps: ['Waar is het precies gebeurd?', 'Had hij een partner bij zich?', 'Hoeveel expedities heeft hij gemaakt?'],
  },
  {
    keywords: ['belgica', '1897', 'adrien', 'gerlache', 'vader'],
    q: 'Wat was de Belgica-expeditie?',
    a: 'De <em>Belgica-expeditie</em> van <em>1897–1899</em> was de eerste wetenschappelijke overwintering in Antarctica. Geleid door <em>Adrien de Gerlache de Gomery</em>, vertrok het schip vanuit Antwerpen met een internationale bemanning. Het schip raakte vast in het pakijs en de bemanning bracht <em>13 maanden</em> in totale duisternis door. Aan boord: <em>Frederick Cook</em> als arts en <em>Roald Amundsen</em> als eerste stuurman — beiden zouden later poolgeschiedenis schrijven.',
    followUps: ['Wie was Frederick Cook?', 'Hoeveel bemanningsleden waren er?', 'Is iemand gestorven?'],
  },
  {
    keywords: ['expeditie', 'route', 'routes', 'hoeveel', 'aantal'],
    q: 'Welke routes heeft Dixie gelopen?',
    a: 'Dixie Dansercoer voltooide meer dan <em>20 expedities</em> op vijf continenten. De belangrijkste: <em>Antarctica 1997–98</em> (3.924 km, met Hubert), <em>Groenland 2002</em> (2.200 km), <em>Antarctica 2008–09</em> (5.100 km rondomreis), <em>Arctisch 2007</em> (Siberië–Canada), en <em>Groenland 2014</em> (volledige circumnavigatie). Zijn totale poolkilometers: meer dan <em>15.000 kilometer</em>.',
    followUps: ['Wat was zijn langste reis?', 'Ging hij altijd alleen?', 'Hoe bereidde hij zich voor?'],
  },
];

const FALLBACK_ANSWER = {
  a: 'Goede vraag — die nemen we mee in het archief van bezoekersvragen. Het museum onderzoekt continu nieuwe verhalen uit de poolgeschiedenis.',
  followUps: ['Wie was Dixie Dansercoer?', 'Wat is Prinses Elisabeth Antarctica?', 'Waarom Groenland?'],
};

/* ================================================================
   FUZZY MATCH
   ================================================================ */
function findAnswer(query) {
  const q = query.toLowerCase().replace(/[?!.,]/g, '');
  const words = q.split(/\s+/);
  let best = null, bestScore = 0;
  for (const pair of QA_PAIRS) {
    let score = 0;
    for (const kw of pair.keywords) {
      if (q.includes(kw)) score += 3;
      for (const w of words) {
        if (kw.includes(w) && w.length > 2) score += 1;
      }
    }
    if (score > bestScore) { bestScore = score; best = pair; }
  }
  return bestScore >= 2 ? best : null;
}

/* ================================================================
   MODULE INIT
   ================================================================ */
export function initAskAssistant(root) {
  const canvas   = root.querySelector('.ask__penguin-canvas');
  const answerEl = root.querySelector('.ask__answer');
  const welcomeEl = root.querySelector('.ask__welcome');
  const thinkEl  = root.querySelector('.ask__thinking');
  const followEl = root.querySelector('.ask__followups');
  const form     = root.querySelector('.ask__input-form');
  const input    = root.querySelector('.ask__input-field');
  const micBtn   = root.querySelector('.ask__mic-btn');
  const sendBtn  = root.querySelector('.ask__send-btn');
  const audioBtn = root.querySelector('.ask__audio-btn');
  const waveEl   = root.querySelector('.ask__wave');
  const waveBars = root.querySelectorAll('.ask__wave-bar');
  if (!canvas || !form || !input) return { destroy() {} };

  let speaking = false;
  let audioEnabled = false;
  let penguinMixer = null;
  let penguinModel = null;
  let penguinClock = new Clock();
  let renderer, camera, scene3d;
  let animId;

  /* ---- Drag-to-rotate state ---- */
  const PITCH_LIMIT = 25 * Math.PI / 180;   // ±25°
  const ROT_SENS    = 0.008;
  const ROT_DAMPING = 0.92;
  const CLICK_PX    = 5;
  let dragging   = false;
  let prevX = 0, prevY = 0;
  let velY  = 0, velX  = 0;
  let startX = 0, startY = 0;
  let needsRender = false;

  /* ---- Penguin quote bank (anti-repeat) ---- */
  const penguinQuotes = [
    "Wat? Heb je nog nooit een pinguïn gezien ofzo?",
    "Niet zo hard duwen, ik val nog om!",
    "Ik werk hier, hè. Niet aanraken graag.",
    "Sorry, geen selfies vandaag.",
    "Jij hebt het warm? Probeer maar eens een smoking van veren.",
    "Pas op, ik bijt — nou ja, ik knabbel een beetje.",
    "Vraag het maar aan Dixie, die weet alles.",
    "Draai mij nog een keer en ik word zeeziek.",
    "Hallo daar! Beetje saai hier op de Zuidpool, eigenlijk.",
    "Ik ben geen knuffel, ik ben een wetenschappelijk model.",
    "Vis? Heb jij toevallig vis bij je?",
    "Psst… de overzicht-knop zit rechtsboven.",
  ];
  let lastQuoteIdx = -1;
  let bubbleTimer = null;

  /* ---- Speech bubble + sr-only live region ---- */
  const penguinZone = canvas.parentElement;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Pinguïn — sleep om te draaien, tik om te praten');

  const bubble = document.createElement('div');
  bubble.className = 'ask__penguin-bubble';
  bubble.setAttribute('aria-hidden', 'true');
  penguinZone.appendChild(bubble);

  const live = document.createElement('div');
  live.className = 'ask__penguin-live';
  live.setAttribute('aria-live', 'polite');
  penguinZone.appendChild(live);

  function showPenguinBubble() {
    let idx;
    do {
      idx = Math.floor(Math.random() * penguinQuotes.length);
    } while (idx === lastQuoteIdx && penguinQuotes.length > 1);
    lastQuoteIdx = idx;

    const quote = penguinQuotes[idx];
    bubble.textContent = quote;
    bubble.classList.add('ask__penguin-bubble--visible');
    live.textContent = quote;

    if (bubbleTimer) clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => {
      bubble.classList.remove('ask__penguin-bubble--visible');
    }, 3000);
  }

  /* ---- 3D Penguin setup ---- */
  function initPenguin() {
    scene3d = new Scene();
    scene3d.background = null;

    camera = new PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 50);
    // Frame tuned for ~2.6-unit-tall model (1.45× scale): center on model midpoint
    camera.position.set(0, 1.4, 6.0);
    camera.lookAt(0, 1.3, 0);

    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setClearColor(0x000000, 0);

    // Lighting — soft polar atmosphere
    const ambient = new AmbientLight(0x8899bb, 0.6);
    scene3d.add(ambient);

    const key = new DirectionalLight(0xffeedd, 1.2);
    key.position.set(2, 4, 3);
    scene3d.add(key);

    const rim = new SpotLight(0xCC7E33, 0.8, 15, Math.PI * 0.25);
    rim.position.set(-2, 2, -1);
    rim.target.position.set(0, 0.5, 0);
    scene3d.add(rim);
    scene3d.add(rim.target);

    // Load penguin
    const loader = new GLTFLoader();
    loader.load('/models/penguin/penguin.glb', (gltf) => {
      penguinModel = gltf.scene;

      // Auto-normalize to ~1.8 units tall, then enlarge ~45% (per spec)
      const box = new Box3().setFromObject(penguinModel);
      const size = new Vector3();
      box.getSize(size);
      const h = size.y || 1;
      const scale = (1.8 / h) * 1.45;
      penguinModel.scale.setScalar(scale);
      penguinModel.position.y = -box.min.y * scale;

      scene3d.add(penguinModel);

      // NOTE: idle/embedded animations intentionally disabled — model stays
      // static unless user drags. (Mixer kept null on purpose.)
      needsRender = true;
    }, undefined, (err) => {
      console.warn('[ask-penguin] Failed to load:', err);
    });

    // Render loop — only renders when something changed (drag / inertia)
    function tick() {
      const dt = penguinClock.getDelta();
      if (penguinMixer) penguinMixer.update(dt);

      // Inertia after release (yaw + clamped pitch)
      if (!dragging && penguinModel && (Math.abs(velY) > 0.0001 || Math.abs(velX) > 0.0001)) {
        penguinModel.rotation.y += velY;
        penguinModel.rotation.x = Math.max(
          -PITCH_LIMIT,
          Math.min(PITCH_LIMIT, penguinModel.rotation.x + velX),
        );
        velY *= ROT_DAMPING;
        velX *= ROT_DAMPING;
        // Stop tiny residual motion
        if (Math.abs(velY) < 0.0001) velY = 0;
        if (Math.abs(velX) < 0.0001) velX = 0;
        needsRender = true;
      }

      if (needsRender) {
        renderer.render(scene3d, camera);
        needsRender = false;
      }
      animId = requestAnimationFrame(tick);
    }
    tick();

    /* ---- Drag-to-rotate + click-to-speak handlers ---- */
    function onPointerDown(e) {
      if (!penguinModel) return;
      dragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      startX = e.clientX;
      startY = e.clientY;
      velY = 0;
      velX = 0;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    }

    function onPointerMove(e) {
      if (!dragging || !penguinModel) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      const yawDelta   = dx * ROT_SENS;
      const pitchDelta = dy * ROT_SENS;
      penguinModel.rotation.y += yawDelta;
      penguinModel.rotation.x = Math.max(
        -PITCH_LIMIT,
        Math.min(PITCH_LIMIT, penguinModel.rotation.x + pitchDelta),
      );
      velY = yawDelta;
      velX = pitchDelta;
      prevX = e.clientX;
      prevY = e.clientY;
      needsRender = true;
    }

    function onPointerEnd(e) {
      if (!dragging) return;
      dragging = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      const moved = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (moved < CLICK_PX) {
        // It was a tap, not a drag — speak
        velY = 0;
        velX = 0;
        showPenguinBubble();
      }
    }

    canvas.addEventListener('pointerdown',  onPointerDown);
    canvas.addEventListener('pointermove',  onPointerMove);
    canvas.addEventListener('pointerup',    onPointerEnd);
    canvas.addEventListener('pointercancel', onPointerEnd);
  }

  /* ---- Penguin reactions (no-op now — model is user-controlled via drag) ---- */
  function penguinListen() {} // intentionally empty
  function penguinSpeak()  {} // intentionally empty
  function penguinIdle()   {} // intentionally empty

  /* ---- Waveform animation ---- */
  let waveAnim = null;
  function startWave() {
    waveBars.forEach((bar, i) => {
      gsap.to(bar, {
        scaleY: () => 0.3 + Math.random() * 0.7,
        duration: 0.15 + Math.random() * 0.1,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.04,
      });
    });
  }
  function stopWave() {
    waveBars.forEach(bar => {
      gsap.killTweensOf(bar);
      gsap.to(bar, { scaleY: 0.15, duration: 0.4 });
    });
  }

  /* ---- Typewriter effect ---- */
  function typewrite(el, htmlContent, speed = 18) {
    return new Promise(resolve => {
      // Parse HTML to text with tags preserved
      const temp = document.createElement('div');
      temp.innerHTML = htmlContent;
      const fullText = temp.innerHTML;
      let idx = 0;
      let inTag = false;

      function step() {
        if (idx >= fullText.length) { resolve(); return; }
        // Skip through HTML tags instantly
        if (fullText[idx] === '<') inTag = true;
        if (inTag) {
          let chunk = '';
          while (idx < fullText.length && inTag) {
            chunk += fullText[idx];
            if (fullText[idx] === '>') inTag = false;
            idx++;
          }
          el.innerHTML = fullText.slice(0, idx);
          requestAnimationFrame(step);
        } else {
          idx++;
          el.innerHTML = fullText.slice(0, idx);
          setTimeout(step, speed);
        }
      }
      step();
    });
  }

  /* ---- Handle question ---- */
  async function handleQuestion(query) {
    if (speaking) return;
    speaking = true;

    // Hide welcome, show thinking
    if (welcomeEl) welcomeEl.hidden = true;
    answerEl.innerHTML = '';
    answerEl.hidden = true;
    followEl.innerHTML = '';
    followEl.hidden = true;
    thinkEl.hidden = false;

    penguinListen();

    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    thinkEl.hidden = true;
    answerEl.hidden = false;

    // Find answer
    const match = findAnswer(query);
    const answer = match || FALLBACK_ANSWER;

    penguinSpeak();
    if (audioEnabled) startWave();

    // Typewrite answer
    await typewrite(answerEl, answer.a, 20);

    stopWave();
    penguinIdle();

    // Show follow-ups
    if (answer.followUps?.length) {
      followEl.hidden = false;
      followEl.innerHTML = `
        <span class="ask__followup-label">Gerelateerd</span>
        ${answer.followUps.map(q => `
          <button type="button" class="ask__followup-chip">${q}</button>
        `).join('')}
      `;
      followEl.querySelectorAll('.ask__followup-chip').forEach(chip => {
        chip.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          input.value = chip.textContent.trim();
          speaking = false;
          handleQuestion(chip.textContent.trim());
        });
      });
    }

    speaking = false;
  }

  /* ---- Form submit ---- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    handleQuestion(q);
  });

  /* ---- Chip clicks (initial suggestions) ---- */
  root.querySelectorAll('.ask__chip').forEach(chip => {
    chip.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      input.value = chip.dataset.q || chip.textContent.trim();
      input.value = '';
      handleQuestion(chip.dataset.q || chip.textContent.trim());
    });
  });

  /* ---- Microphone (Web Speech API) ---- */
  let recognition = null;
  if (micBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.lang = 'nl-NL';
    recognition.continuous = false;
    recognition.interimResults = true;

    let listening = false;

    micBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (listening) { recognition.stop(); return; }
      listening = true;
      micBtn.classList.add('ask__mic-btn--active');
      input.placeholder = 'Luisteren...';
      recognition.start();
    });

    recognition.onresult = (ev) => {
      let transcript = '';
      for (const r of ev.results) transcript = r[0].transcript;
      input.value = transcript;
    };

    recognition.onend = () => {
      listening = false;
      micBtn.classList.remove('ask__mic-btn--active');
      input.placeholder = 'Typ je vraag of spreek...';
      const q = input.value.trim();
      if (q) {
        input.value = '';
        handleQuestion(q);
      }
    };

    recognition.onerror = () => {
      listening = false;
      micBtn.classList.remove('ask__mic-btn--active');
      input.placeholder = 'Typ je vraag of spreek...';
    };
  } else if (micBtn) {
    micBtn.style.opacity = '0.3';
    micBtn.style.pointerEvents = 'none';
  }

  /* ---- Audio toggle ---- */
  if (audioBtn) {
    audioBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      audioEnabled = !audioEnabled;
      audioBtn.classList.toggle('ask__audio-btn--on', audioEnabled);
      audioBtn.querySelector('.ask__audio-icon').textContent = audioEnabled ? '🔊' : '🔇';
    });
  }

  /* ---- Stop propagation on inputs ---- */
  input.addEventListener('pointerdown', (e) => e.stopPropagation());
  input.addEventListener('touchstart', (e) => e.stopPropagation());

  /* ---- Init penguin ---- */
  // Delay to let layout settle
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initPenguin();
    });
  });

  /* ---- Resize ---- */
  function onResize() {
    if (!renderer || !camera) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    needsRender = true;
  }
  window.addEventListener('resize', onResize);

  /* ---- Cleanup ---- */
  return {
    resize: onResize,
    destroy() {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      if (renderer) renderer.dispose();
      if (recognition) { try { recognition.stop(); } catch (_) {} }
      gsap.killTweensOf(waveBars);
      if (penguinModel) {
        scene3d?.traverse(o => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
            else o.material.dispose();
          }
        });
      }
    },
  };
}
