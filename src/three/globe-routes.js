/**
 * globe-routes.js — Stylized atlas globe with draggable rotation
 * and animated route curves for the Dansercoer expedition page.
 *
 * Usage:
 *   const globe = createGlobe(canvasElement, { activeIds: ['arctic-2007', ...] });
 *   globe.animateRoutes();   // draw-on entry animation
 *   globe.resize();          // call on viewport change
 *   globe.dispose();         // cleanup
 */
import {
  Scene, PerspectiveCamera, WebGLRenderer,
  Group, Mesh, Line,
  SphereGeometry, BufferGeometry,
  MeshBasicMaterial, LineBasicMaterial, LineDashedMaterial,
  Vector3,
} from 'three';
import gsap from 'gsap';

/* ---- Constants ---- */
const R = 2.8;
const ROUTE_R = R * 1.006;
const DEG = Math.PI / 180;
const DAMPING = 0.93;
const DRAG_SENS = 0.004;
const AUTO_SPEED = 0.0008;
const AUTO_RESUME = 5000;

/* ---- Coordinate conversion ---- */
function ll(lat, lon, r = R) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/* ---- Grid lines (lat/lon) ---- */
function createGrid() {
  const mat = new LineBasicMaterial({ color: 0x3a5070, transparent: true, opacity: 0.15 });
  const g = new Group();
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = [];
    for (let lon = -180; lon <= 180; lon += 3) pts.push(ll(lat, lon));
    g.add(new Line(new BufferGeometry().setFromPoints(pts), mat));
  }
  for (let lon = -180; lon < 180; lon += 30) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 3) pts.push(ll(lat, lon));
    g.add(new Line(new BufferGeometry().setFromPoints(pts), mat));
  }
  return g;
}

/* ---- Simplified continent outlines ---- */
const LAND = {
  antarctica: [
    [-65,-60],[-68,-25],[-72,5],[-70,35],[-66,65],[-70,95],
    [-73,125],[-70,155],[-67,-175],[-72,-145],[-75,-115],[-72,-85]
  ],
  greenland: [
    [60,-46],[64,-40],[68,-33],[73,-26],[78,-20],[81,-20],
    [83,-30],[82,-46],[80,-60],[77,-69],[73,-67],[69,-55],[65,-50],[62,-48]
  ],
  europe: [
    [36,-10],[39,0],[44,3],[48,6],[53,8],[57,12],[60,20],
    [65,28],[71,30],[72,27],[68,20],[58,13],[53,3],[46,-3],[40,-8]
  ],
  africa: [
    [35,-6],[32,10],[22,16],[12,16],[2,10],[-8,14],[-18,24],
    [-28,30],[-35,22],[-30,16],[-12,12],[0,4],[8,-6],[14,-17],[22,-15],[30,-6]
  ],
  southAmerica: [
    [12,-73],[4,-77],[-2,-80],[-8,-76],[-16,-70],[-24,-65],
    [-34,-56],[-42,-64],[-52,-72],[-56,-66],[-50,-55],[-38,-52],
    [-28,-44],[-16,-40],[-8,-52],[0,-68],[6,-75]
  ],
  northAmerica: [
    [10,-83],[18,-90],[28,-97],[32,-88],[38,-78],[45,-70],
    [50,-58],[56,-62],[62,-70],[68,-80],[72,-100],[70,-132],
    [64,-148],[56,-168],[62,-170],[70,-160],[68,-142],[52,-128],
    [42,-120],[30,-114],[22,-106]
  ],
  asia: [
    [40,28],[48,42],[54,58],[60,72],[66,88],[72,105],[70,138],
    [62,142],[52,134],[44,140],[38,126],[32,115],[26,92],
    [18,82],[10,78],[8,72],[14,58],[22,44],[30,32]
  ],
  australia: [
    [-12,130],[-17,123],[-24,114],[-30,115],[-35,120],[-36,138],
    [-38,146],[-34,151],[-26,154],[-18,146],[-13,136]
  ],
};

function createContinents() {
  const mat = new LineBasicMaterial({ color: 0xc8d4e0, transparent: true, opacity: 0.3 });
  const g = new Group();
  for (const coords of Object.values(LAND)) {
    const pts = coords.map(([la, lo]) => ll(la, lo, R * 1.001));
    pts.push(pts[0].clone());
    g.add(new Line(new BufferGeometry().setFromPoints(pts), mat));
  }
  return g;
}

/* ---- Route helpers ---- */
function routePoints(waypoints, segments = 80) {
  const pts = [];
  for (let w = 0; w < waypoints.length - 1; w++) {
    const [la1, lo1] = waypoints[w];
    const [la2, lo2] = waypoints[w + 1];
    const n = Math.ceil(segments / (waypoints.length - 1));
    for (let i = 0; i <= (w < waypoints.length - 2 ? n - 1 : n); i++) {
      const t = i / n;
      pts.push(ll(la1 + (la2 - la1) * t, lo1 + (lo2 - lo1) * t, ROUTE_R));
    }
  }
  return pts;
}

function makeRouteLine(waypoints, color, opacity, dashed) {
  const pts = routePoints(waypoints);
  const geom = new BufferGeometry().setFromPoints(pts);
  const mat = dashed
    ? new LineDashedMaterial({ color, transparent: true, opacity, dashSize: 0.12, gapSize: 0.07 })
    : new LineBasicMaterial({ color, transparent: true, opacity });
  const line = new Line(geom, mat);
  if (dashed) line.computeLineDistances();
  line.userData.total = pts.length;
  return line;
}

function makeEndpoint(latLon, color, opacity) {
  const geom = new SphereGeometry(0.045, 8, 6);
  const mat = new MeshBasicMaterial({ color, transparent: true, opacity });
  const m = new Mesh(geom, mat);
  m.position.copy(ll(latLon[0], latLon[1], ROUTE_R));
  return m;
}

/* ---- Route configs (all expeditions, including Belgica 1897) ---- */
const ROUTES_CFG = [
  {
    id: 'belgica-1897',
    // Antwerpen → Madeira → Rio → Montevideo → Punta Arenas → Antarctisch Schiereiland
    // → 71°30′ Z (vastgevroren) → Bevrijding → Punta Arenas → Antwerpen
    waypoints: [
      [51.22, 4.40], [32.63, -16.90], [-22.91, -43.17], [-34.88, -56.16],
      [-53.16, -70.91], [-64.50, -62.00], [-71.50, -85.25],
      [-64.00, -63.00], [-53.16, -70.91], [51.22, 4.40],
    ],
    color: 0xCC7E33, active: 0.85, ghost: 0.1, dashed: false,
  },
  {
    id: 'antarctic-1997',
    waypoints: [[-80,-81],[-84,-48],[-88,-5],[-88,45],[-84,95],[-80,135],[-72,148]],
    color: 0xffffff, active: 0.85, ghost: 0.1, dashed: false,
  },
  {
    id: 'arctic-2007',
    waypoints: [[72,125],[76,100],[79,75],[81,50],[80,25],[78,0],[76,-18],[73,-38]],
    color: 0xD0563F, active: 0.85, ghost: 0.1, dashed: false,
  },
  {
    id: 'antarctic-2008',
    waypoints: [
      [-70,25],[-74,0],[-78,-25],[-82,-55],[-84,-85],[-82,-110],
      [-78,-130],[-74,-145],[-70,-130],[-68,-100],[-68,-65],
      [-70,-35],[-70,0],[-70,25],
    ],
    color: 0xE6B541, active: 0.85, ghost: 0.1, dashed: false,
  },
  {
    id: 'greenland-2014',
    waypoints: [
      [60,-46],[64,-40],[68,-33],[73,-26],[78,-20],[81,-20],
      [83,-30],[82,-46],[80,-60],[77,-69],[73,-67],[69,-55],
      [65,-50],[62,-48],[60,-46],
    ],
    color: 0x5A8BC4, active: 0.85, ghost: 0.1, dashed: false,
  },
  {
    id: 'greenland-2021',
    waypoints: [[61,-45],[65,-49],[69,-55],[73,-62],[76,-67],[77,-69]],
    color: 0xffffff, active: 0.85, ghost: 0.1, dashed: true,
  },
];

/* ================================================================
   Factory
   ================================================================ */
export function createGlobe(canvas, opts = {}) {
  const { activeIds = ['arctic-2007', 'antarctic-2008', 'greenland-2014'] } = opts;

  /* ---- Scene setup ---- */
  const scene = new Scene();
  const camera = new PerspectiveCamera(
    46, canvas.clientWidth / canvas.clientHeight, 0.1, 100
  );
  camera.position.set(0, 1.2, 7);
  camera.lookAt(0, 0, 0);

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setClearColor(0x000000, 0);

  /* ---- Globe group ---- */
  const globe = new Group();

  // Sphere fill
  globe.add(new Mesh(
    new SphereGeometry(R * 0.997, 48, 48),
    new MeshBasicMaterial({ color: 0x0d1520, transparent: true, opacity: 0.55 })
  ));

  // Grid + continents
  globe.add(createGrid());
  globe.add(createContinents());

  // Routes + endpoints
  const lines = {};
  const dots = {};
  ROUTES_CFG.forEach(rc => {
    const isActive = activeIds.includes(rc.id);
    const op = isActive ? rc.active : rc.ghost;
    const line = makeRouteLine(rc.waypoints, rc.color, op, rc.dashed);
    lines[rc.id] = line;
    globe.add(line);
    const ep0 = makeEndpoint(rc.waypoints[0], rc.color, op);
    const ep1 = makeEndpoint(rc.waypoints[rc.waypoints.length - 1], rc.color, op);
    dots[rc.id] = [ep0, ep1];
    globe.add(ep0, ep1);
  });

  // Initial orientation — show Atlantic / Greenland
  globe.rotation.y = 0.55;
  globe.rotation.x = 0.2;
  scene.add(globe);

  /* ---- Interaction state ---- */
  let dragging = false, prevX = 0, prevY = 0;
  let velX = 0, velY = 0;
  let autoRotate = true;
  let autoTimer = null;
  let animId = null;

  /* ---- Render loop ---- */
  function tick() {
    if (!dragging) {
      velX *= DAMPING;
      velY *= DAMPING;
      globe.rotation.y += velY;
      globe.rotation.x += velX;
      globe.rotation.x = Math.max(-1.2, Math.min(1.2, globe.rotation.x));
    }
    if (autoRotate && !dragging) {
      globe.rotation.y += AUTO_SPEED;
    }
    renderer.render(scene, camera);
    animId = requestAnimationFrame(tick);
  }
  tick();

  /* ---- Drag rotation ---- */
  function pDown(e) {
    dragging = true;
    prevX = e.clientX; prevY = e.clientY;
    velX = velY = 0;
    autoRotate = false;
    clearTimeout(autoTimer);
  }
  function pMove(e) {
    if (!dragging) return;
    velY = (e.clientX - prevX) * DRAG_SENS;
    velX = (e.clientY - prevY) * DRAG_SENS;
    globe.rotation.y += velY;
    globe.rotation.x += velX;
    globe.rotation.x = Math.max(-1.2, Math.min(1.2, globe.rotation.x));
    prevX = e.clientX; prevY = e.clientY;
  }
  function pUp() {
    dragging = false;
    autoTimer = setTimeout(() => { autoRotate = true; }, AUTO_RESUME);
  }

  canvas.addEventListener('pointerdown', pDown);
  canvas.addEventListener('pointermove', pMove);
  canvas.addEventListener('pointerup', pUp);
  canvas.addEventListener('pointerleave', pUp);

  // Prevent slide swipe when dragging globe
  canvas.addEventListener('touchstart', e => e.stopPropagation());
  canvas.addEventListener('touchmove', e => e.stopPropagation());
  canvas.addEventListener('touchend', e => e.stopPropagation());

  /* ---- Route draw animation ---- */
  function animateRoutes() {
    const drawList = ROUTES_CFG.filter(
      rc => activeIds.includes(rc.id) && !rc.dashed
    );
    // Hide active lines initially
    drawList.forEach(rc => {
      lines[rc.id].geometry.setDrawRange(0, 0);
      dots[rc.id].forEach(d => { d.visible = false; });
    });
    // Staggered draw
    drawList.forEach((rc, i) => {
      const line = lines[rc.id];
      const total = line.userData.total;
      const obj = { n: 0 };
      gsap.to(obj, {
        n: total,
        duration: 0.8,
        delay: 1.0 + i * 0.5,
        ease: 'power2.inOut',
        onUpdate: () => { line.geometry.setDrawRange(0, Math.floor(obj.n)); },
        onComplete: () => { dots[rc.id].forEach(d => { d.visible = true; }); },
      });
    });
  }

  /* ---- Resize ---- */
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  /* ---- Dispose ---- */
  function dispose() {
    cancelAnimationFrame(animId);
    clearTimeout(autoTimer);
    canvas.removeEventListener('pointerdown', pDown);
    canvas.removeEventListener('pointermove', pMove);
    canvas.removeEventListener('pointerup', pUp);
    canvas.removeEventListener('pointerleave', pUp);
    renderer.dispose();
    scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
        else o.material.dispose();
      }
    });
  }

  return { animateRoutes, resize, dispose };
}
