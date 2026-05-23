// Procedural ice-rock mesh factory

import {
  Group,
  IcosahedronGeometry,
  MeshStandardMaterial,
  Mesh,
  RepeatWrapping,
} from 'three';

/**
 * Create a group of irregularly-shaped ice rocks arranged in a
 * partial ring around the origin, avoiding the camera approach angle.
 *
 * @param {object}  opts
 * @param {number}  opts.count            Number of rocks (default 7)
 * @param {import('three').Texture} opts.iceTexture  Loaded ice surface texture
 * @param {number[]} opts.avoidAngleRange  [minDeg, maxDeg] to skip (default [-30, 30])
 * @returns {Group}
 */
export function createIceRocks({
  count = 7,
  iceTexture,
  avoidAngleRange = [-30, 30],
} = {}) {
  const group = new Group();
  group.name = 'ice-rocks';

  // Camera is roughly at (18, 3.5, 38) → its angle from +Z:
  const cameraAngle = Math.atan2(18, 38); // ≈ 0.44 rad ≈ 25°
  const avoidHalf =
    ((avoidAngleRange[1] - avoidAngleRange[0]) / 2) * (Math.PI / 180);

  for (let i = 0; i < count; i++) {
    // Random radius between 1.5 and 4.0
    const geoRadius = 1.5 + Math.random() * 2.5;
    const geometry = new IcosahedronGeometry(geoRadius, 1);

    // Perturb vertices ±15 % along their direction for irregular shapes
    const pos = geometry.attributes.position;
    for (let j = 0; j < pos.count; j++) {
      const factor = 1 + (Math.random() - 0.5) * 0.3;
      pos.setXYZ(
        j,
        pos.getX(j) * factor,
        pos.getY(j) * factor,
        pos.getZ(j) * factor
      );
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();

    // Clone texture so each rock can have its own repeat
    const tex = iceTexture.clone();
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    tex.repeat.set(1.5, 1.5);
    tex.needsUpdate = true;

    const material = new MeshStandardMaterial({
      map: tex,
      roughness: 0.65,
      metalness: 0.05,
      color: 0xe8eef5,
    });

    const mesh = new Mesh(geometry, material);

    // Distribute in a partial circle, skip the camera approach cone
    let angle;
    do {
      angle = Math.random() * Math.PI * 2;
    } while (Math.abs(angle - cameraAngle) < avoidHalf);

    const dist = 12 + Math.random() * 16; // [12, 28]
    mesh.position.set(
      Math.sin(angle) * dist,
      Math.random() * 1.2,
      Math.cos(angle) * dist
    );

    mesh.rotation.y = Math.random() * Math.PI * 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    group.add(mesh);
  }

  return group;
}
