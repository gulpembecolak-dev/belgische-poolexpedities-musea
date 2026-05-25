/**
 * ship-loader.js — GLTF schooner loader with normalization.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const TARGET_SIZE = 8;

export async function loadShip(path) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(path);
  const root = gltf.scene;

  const rawBox = new THREE.Box3().setFromObject(root);
  const rawSize = rawBox.getSize(new THREE.Vector3());
  const longest = Math.max(rawSize.x, rawSize.y, rawSize.z) || 1;
  const scale = TARGET_SIZE / longest;
  root.scale.setScalar(scale);

  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;

  root.rotation.y = Math.PI / 2;

  root.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      const mat = child.material;
      if (mat) {
        mat.envMapIntensity = 0.5;
        if ('emissive' in mat) mat.emissive = new THREE.Color(0x000000);
        mat.transparent = false;
        mat.opacity = 1;
        mat.needsUpdate = true;
      }
    }
  });

  const debug = {
    rawSize: { x: +rawSize.x.toFixed(3), y: +rawSize.y.toFixed(3), z: +rawSize.z.toFixed(3) },
    scale:   +scale.toFixed(4),
    finalPosition: { x: +root.position.x.toFixed(3), y: +root.position.y.toFixed(3), z: +root.position.z.toFixed(3) },
  };

  return { ship: root, debug };
}
