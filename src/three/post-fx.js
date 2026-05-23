// Post-processing pipeline: RenderPass → Desaturation → Bloom → Vignette

import { Vector2 } from 'three';
import { EffectComposer }  from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass }      from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/* ──────────────────────────────────────────────────
   Custom shaders
   ────────────────────────────────────────────────── */

const DesaturationShader = {
  uniforms: {
    tDiffuse:      { value: null },
    uDesaturation: { value: 1.0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uDesaturation;
    varying vec2 vUv;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      vec3 gray  = vec3(luma);
      gl_FragColor = vec4(mix(color.rgb, gray, uDesaturation), color.a);
    }
  `,
};

const VignetteShader = {
  uniforms: {
    tDiffuse:  { value: null },
    uVignette: { value: 0.95 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uVignette;
    varying vec2 vUv;
    void main() {
      vec4 color  = texture2D(tDiffuse, vUv);
      vec2 center = vec2(0.5);
      float dist  = distance(vUv, center);
      float vig   = smoothstep(0.8, 0.3, dist);
      vig = mix(1.0, vig, uVignette);
      gl_FragColor = vec4(color.rgb * vig, color.a);
    }
  `,
};

/* ──────────────────────────────────────────────────
   Factory
   ────────────────────────────────────────────────── */

/**
 * Build the EffectComposer pipeline.
 * @returns {{ composer, bloomPass, desatPass, vignettePass,
 *             setDesaturation, setBloom, setVignette, onResize }}
 */
export function createPostFX(renderer, scene, camera, width, height) {
  const composer = new EffectComposer(renderer);

  // 1. Render pass
  composer.addPass(new RenderPass(scene, camera));

  // 2. Desaturation
  const desatPass = new ShaderPass(DesaturationShader);
  composer.addPass(desatPass);

  // 3. Bloom
  const bloomPass = new UnrealBloomPass(
    new Vector2(width, height),
    0.4,  // strength
    0.6,  // radius
    0.85  // threshold
  );
  composer.addPass(bloomPass);

  // 4. Vignette
  const vignettePass = new ShaderPass(VignetteShader);
  composer.addPass(vignettePass);

  return {
    composer,
    bloomPass,
    desatPass,
    vignettePass,

    setDesaturation(v) { desatPass.uniforms.uDesaturation.value = v; },
    setBloom(v)        { bloomPass.strength = v; },
    setVignette(v)     { vignettePass.uniforms.uVignette.value = v; },

    onResize(w, h) {
      composer.setSize(w, h);
      bloomPass.setSize(w, h);
    },
  };
}
