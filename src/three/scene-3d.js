/**
 * scene-3d.js — Three.js scene factory.
 * Builds renderer, scene, camera, lights, sky, water, composer.
 */
import * as THREE from 'three';
import gsap from 'gsap';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { createPostFX } from './post-fx.js';

/**
 * Procedural water-normal texture (npm three doesn't ship waternormals.jpg).
 */
function makeWaterNormals(size = 512) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const data = img.data;

  const eps = 0.01;
  const height = (u, v) =>
    Math.sin(u * 1.0) * Math.cos(v * 1.0) * 0.5 +
    Math.sin(u * 2.7 + 1.3) * Math.cos(v * 2.3 - 0.7) * 0.3 +
    Math.sin(u * 5.1 - 2.1) * Math.cos(v * 4.8 + 1.9) * 0.2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * Math.PI * 2;
      const v = (y / size) * Math.PI * 2;
      const h  = height(u, v);
      const hx = height(u + eps, v);
      const hy = height(u, v + eps);
      const nx = (h - hx) / eps;
      const ny = (h - hy) / eps;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const i = (y * size + x) * 4;
      data[i]     = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
      data[i + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
      data[i + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export async function createScene3D(container) {
  // ---- Renderer ----
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.30;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // ---- Scene ----
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0F1721, 0.013);

  // ---- Camera ----
  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
  );
  camera.position.set(15, 3.5, 32);

  const lookTarget = new THREE.Object3D();
  lookTarget.position.set(0, 1.5, 0);
  scene.add(lookTarget);

  // ---- Lights ----
  const sun = new THREE.DirectionalLight(0xffeacc, 0.7);
  sun.position.set(12, 22, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -25;
  sun.shadow.camera.right = 25;
  sun.shadow.camera.top = 25;
  sun.shadow.camera.bottom = -25;
  scene.add(sun);

  const hemi = new THREE.HemisphereLight(0xb1c8ff, 0x0a1828, 0.35);
  scene.add(hemi);

  const ambient = new THREE.AmbientLight(0x6b7280, 0.20);
  scene.add(ambient);

  // Front fill light — lifts ship from silhouette without breaking atmosphere
  const fillLight = new THREE.DirectionalLight(0xffd9a8, 0.5);
  fillLight.position.set(2, 5, 25);
  fillLight.target.position.set(0, 2, 0);
  fillLight.castShadow = false;
  scene.add(fillLight);
  scene.add(fillLight.target);

  // ---- Sky ----
  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyU = sky.material.uniforms;
  skyU.turbidity.value = 4;
  skyU.rayleigh.value = 0.5;
  skyU.mieCoefficient.value = 0.005;
  skyU.mieDirectionalG.value = 0.7;

  const sunPos = new THREE.Vector3();
  const elevation = 7;
  const azimuth = 145;
  const phi = THREE.MathUtils.degToRad(90 - elevation);
  const theta = THREE.MathUtils.degToRad(azimuth);
  sunPos.setFromSphericalCoords(1, phi, theta);
  skyU.sunPosition.value.copy(sunPos);

  // ---- Water ----
  const waterGeo = new THREE.PlaneGeometry(10000, 10000);
  const water = new Water(waterGeo, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: makeWaterNormals(512),
    sunDirection: sun.position.clone().normalize(),
    sunColor: 0xffffff,
    waterColor: 0x002438,
    distortionScale: 2.8,
    fog: scene.fog !== undefined,
    alpha: 1.0,
  });
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.5;
  scene.add(water);

  // ---- Post-FX ----
  const { composer, desaturationPass, bloomPass, vignettePass } =
    createPostFX(renderer, scene, camera);

  // ---- Resize ----
  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloomPass.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  // ---- Render loop ----
  let rafId = 0;
  let running = false;
  let animatedShip = null;
  let elapsed = 0;
  const clock = new THREE.Clock();

  const tick = () => {
    rafId = requestAnimationFrame(tick);
    const dt = clock.getDelta();
    elapsed += dt;
    water.material.uniforms['time'].value += dt;

    // Ship organic bobbing — multi-frequency sea motion
    if (animatedShip) {
      if (animatedShip.userData.baseY === undefined) {
        animatedShip.userData.baseY = animatedShip.position.y;
        animatedShip.userData.baseRotX = animatedShip.rotation.x;
        animatedShip.userData.baseRotZ = animatedShip.rotation.z;
      }
      const t = elapsed;
      animatedShip.position.y = animatedShip.userData.baseY
        + Math.sin(t * 0.55) * 0.18
        + Math.sin(t * 1.7 + 0.5) * 0.06;
      animatedShip.rotation.z = animatedShip.userData.baseRotZ + Math.sin(t * 0.42) * 0.028;
      animatedShip.rotation.x = animatedShip.userData.baseRotX + Math.sin(t * 0.78 + 1.2) * 0.018;
    }

    camera.lookAt(lookTarget.position);
    composer.render();
  };

  const registerAnimatedShip = (ship) => {
    animatedShip = ship;
  };

  const startLoop = () => {
    if (running) return;
    running = true;
    clock.start();
    tick();
  };

  const stopLoop = () => {
    running = false;
    cancelAnimationFrame(rafId);
  };

  // ---- Helpers ----
  const setDesaturation = (v) => { desaturationPass.uniforms.uDesaturation.value = v; };
  const setVignette     = (v) => { vignettePass.uniforms.uVignette.value = v; };
  const setBloom        = (v) => { bloomPass.strength = v; };

  const animateCamera = (toPos, lookY, duration, ease = 'power1.inOut') => {
    const tl = gsap.timeline();
    tl.to(camera.position, { x: toPos.x, y: toPos.y, z: toPos.z, duration, ease }, 0);
    if (lookY !== undefined) {
      tl.to(lookTarget.position, { y: lookY, duration, ease }, 0);
    }
    return tl;
  };

  const destroy = () => {
    stopLoop();
    window.removeEventListener('resize', onResize);
    renderer.dispose();
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };

  return {
    scene,
    camera,
    renderer,
    composer,
    lookTarget,
    setDesaturation,
    setVignette,
    setBloom,
    animateCamera,
    registerAnimatedShip,
    startLoop,
    stopLoop,
    destroy,
    passes: { desaturationPass, bloomPass, vignettePass },
  };
}
