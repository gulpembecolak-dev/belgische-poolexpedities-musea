// Three.js scene factory — sky, water, ship, ice, lighting, post-fx

import * as THREE from 'three';
import { Sky }   from 'three/examples/jsm/objects/Sky.js';
import { Water } from 'three/examples/jsm/objects/Water.js';

import { loadShip }       from './ship-loader.js';
import { createIceRocks } from './ice-rocks.js';
import { createPostFX }   from './post-fx.js';

/* ──────────────────────────────────────────────────
   Procedural water-normals texture (the npm
   three package does not ship example textures)
   ────────────────────────────────────────────────── */

function generateWaterNormals(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  const d = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // Multi-octave sine ripple normal map
      const nx =
        Math.sin(x * 0.05) * Math.cos(y * 0.08) * 0.25 +
        Math.sin(x * 0.12 + y * 0.04) * 0.15;
      const ny =
        Math.cos(x * 0.07) * Math.sin(y * 0.06) * 0.25 +
        Math.cos(x * 0.03 + y * 0.11) * 0.15;
      // Encode normal [-1,1] → [0,255]
      d[i]     = ((nx * 0.5 + 0.5) * 255) | 0; // R
      d[i + 1] = ((ny * 0.5 + 0.5) * 255) | 0; // G
      d[i + 2] = 200;                            // B (mostly +Z)
      d[i + 3] = 255;                            // A
    }
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/* ──────────────────────────────────────────────────
   Async factory
   ────────────────────────────────────────────────── */

/**
 * Create the full 3D scene. Resolves once all assets are loaded.
 * @param {HTMLElement} container
 */
export async function createScene3D(container) {
  /* ---- Renderer ---- */
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  /* ---- Scene ---- */
  const scene = new THREE.Scene();

  /* ---- Camera ---- */
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(18, 3.5, 38);

  // Animatable lookAt target
  const lookAtTarget = new THREE.Object3D();
  lookAtTarget.position.set(0, 1.5, 0);
  scene.add(lookAtTarget);

  /* ---- Fog ---- */
  scene.fog = new THREE.FogExp2(0x0f1721, 0.011);

  /* ---- Lighting ---- */
  const dirLight = new THREE.DirectionalLight(0xffeacc, 0.95);
  dirLight.position.set(12, 22, 6);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(1024, 1024);
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 60;
  dirLight.shadow.camera.left = -15;
  dirLight.shadow.camera.right = 15;
  dirLight.shadow.camera.top = 15;
  dirLight.shadow.camera.bottom = -15;
  scene.add(dirLight);

  scene.add(new THREE.HemisphereLight(0xb1c8ff, 0x0a1828, 0.45));
  scene.add(new THREE.AmbientLight(0x6b7280, 0.15));

  /* ---- Sky ---- */
  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUni = sky.material.uniforms;
  skyUni.turbidity.value       = 8;
  skyUni.rayleigh.value        = 2.2;
  skyUni.mieCoefficient.value  = 0.005;
  skyUni.mieDirectionalG.value = 0.85;

  const phi   = THREE.MathUtils.degToRad(90 - 7);  // elevation 7°
  const theta = THREE.MathUtils.degToRad(205);      // azimuth 205°
  const sunPos = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
  skyUni.sunPosition.value.copy(sunPos);

  /* ---- Water ---- */
  const waterNormals = generateWaterNormals();

  const water = new Water(
    new THREE.PlaneGeometry(10000, 10000),
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: dirLight.position.clone().normalize(),
      sunColor:     0xffffff,
      waterColor:   0x002438,
      distortionScale: 2.8,
      alpha: 1.0,
    }
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.5;
  scene.add(water);

  /* ---- Load ice texture ---- */
  const texLoader = new THREE.TextureLoader();

  let iceTexture;
  try {
    iceTexture = await new Promise((res, rej) =>
      texLoader.load('/textures/ice_surface.jpg', res, undefined, rej)
    );
  } catch {
    // Fallback: a flat tinted texture so the scene still renders
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = 64;
    fallbackCanvas.height = 64;
    const fctx = fallbackCanvas.getContext('2d');
    fctx.fillStyle = '#d8e4f0';
    fctx.fillRect(0, 0, 64, 64);
    iceTexture = new THREE.CanvasTexture(fallbackCanvas);
    console.warn('ice_surface.jpg not found — using fallback colour');
  }

  /* ---- Ship ---- */
  let ship;
  try {
    ship = await loadShip('/models/belgica/schooner.glb');
  } catch {
    // Fallback: visible wireframe box so layout is still testable
    ship = new THREE.Mesh(
      new THREE.BoxGeometry(6, 4, 2),
      new THREE.MeshStandardMaterial({ color: 0x8b6914, wireframe: true })
    );
    ship.position.y = 2;
    console.warn('schooner.glb not found — using placeholder');
  }
  scene.add(ship);

  /* ---- Ice Rocks ---- */
  const iceRocks = createIceRocks({ count: 7, iceTexture });
  scene.add(iceRocks);

  /* ---- Post-FX ---- */
  const postFX = createPostFX(
    renderer, scene, camera,
    window.innerWidth, window.innerHeight
  );

  /* ---- Render loop ---- */
  let running = false;
  const clock = new THREE.Clock(false);
  let slowFrames = 0;

  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);

    const delta   = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // Performance monitor
    if (delta > 0.018) {
      slowFrames++;
      if (slowFrames >= 60) {
        console.warn(`Performance: ${slowFrames}+ consecutive slow frames`);
        slowFrames = 0;
      }
    } else {
      slowFrames = 0;
    }

    // Animate water
    water.material.uniforms.time.value = elapsed;

    // Camera tracks the lookAt target
    camera.lookAt(lookAtTarget.position);

    // Render through post-fx
    postFX.composer.render();
  }

  /* ---- Resize ---- */
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    postFX.onResize(w, h);
  }
  window.addEventListener('resize', onResize);

  /* ---- Public API ---- */
  return {
    scene,
    camera,
    renderer,
    ship,
    iceRocks,
    water,
    lookAtTarget,
    postFX,

    startLoop() {
      running = true;
      clock.start();
      tick();
    },

    setDesaturation: postFX.setDesaturation,
    setVignette:     postFX.setVignette,
    setBloom:        postFX.setBloom,

    onResize,

    destroy() {
      running = false;
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    },
  };
}
