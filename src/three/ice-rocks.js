/**
 * ice-rocks.js — procedural ice/rock cluster ringing the ship.
 * Avoids the camera approach corridor.
 */
import * as THREE from 'three';

const CAMERA_AZIMUTH = Math.atan2(32, 15);
const CAMERA_HALF_CONE = Math.PI / 6;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function isInForbiddenCone(angle) {
  let d = angle - CAMERA_AZIMUTH;
  while (d >  Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return Math.abs(d) < CAMERA_HALF_CONE;
}

function perturbGeometry(geo, amount = 0.15) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const factor = 1 + (Math.random() * 2 - 1) * amount;
    pos.setXYZ(i, x * factor, y * factor, z * factor);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

export function createIceRocks({ count = 7, iceTexture } = {}) {
  const group = new THREE.Group();
  group.name = 'ice-rocks';

  let placed = 0;
  let safety = 0;
  while (placed < count && safety < 200) {
    safety++;
    const angle = rand(0, Math.PI * 2);
    if (isInForbiddenCone(angle)) continue;

    const radius = rand(12, 28);
    const rockRadius = rand(1.5, 4);

    const geo = new THREE.IcosahedronGeometry(rockRadius, 1);
    perturbGeometry(geo, 0.15);

    const tex = iceTexture ? iceTexture.clone() : null;
    if (tex) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1.5, 1.5);
      tex.needsUpdate = true;
    }

    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      color: 0xe8eef5,
      roughness: 0.65,
      metalness: 0.05,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(
      Math.cos(angle) * radius,
      rand(0, 1.2),
      Math.sin(angle) * radius,
    );
    mesh.rotation.y = rand(0, Math.PI * 2);

    group.add(mesh);
    placed++;
  }

  return group;
}
