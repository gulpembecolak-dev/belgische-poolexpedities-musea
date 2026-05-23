// Ship loader — GLTFLoader wrapper with auto-normalization

import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const TARGET_SIZE = 8; // longest dimension in world units

/**
 * Load a GLB ship model, normalize its scale and prepare for scene.
 * @param {string} path  URL to the .glb file
 * @returns {Promise<import('three').Group>}
 */
export async function loadShip(path) {
  const loader = new GLTFLoader();

  const gltf = await new Promise((resolve, reject) => {
    loader.load(path, resolve, undefined, reject);
  });

  const ship = gltf.scene;

  // Measure bounding box and log dimensions
  const box = new Box3().setFromObject(ship);
  const size = new Vector3();
  box.getSize(size);
  console.log(
    `Ship dimensions (raw): ${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)}`
  );

  // Normalize so the longest axis equals TARGET_SIZE
  const maxDim = Math.max(size.x, size.y, size.z);
  const scaleFactor = TARGET_SIZE / maxDim;
  ship.scale.setScalar(scaleFactor);

  // Re-center after scaling — sit the hull on y = 0
  const scaledBox = new Box3().setFromObject(ship);
  const center = new Vector3();
  scaledBox.getCenter(center);
  ship.position.set(-center.x, -scaledBox.min.y, -center.z);

  // Rotate so port side faces +X (camera approaches from upper-right)
  ship.rotation.y = Math.PI * 0.25;

  // Shadows & env map
  ship.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        child.material.envMapIntensity = 0.5;
      }
    }
  });

  return ship;
}
