/**
 * post-fx.js — EffectComposer pipeline.
 * RenderPass → Desaturation → UnrealBloom → Vignette
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const DesaturationShader = {
  uniforms: {
    tDiffuse:       { value: null },
    uDesaturation:  { value: 1.0 },
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
      vec4 c = texture2D(tDiffuse, vUv);
      float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
      vec3 desat = vec3(l);
      vec3 tinted = mix(desat, desat * vec3(0.88, 0.94, 1.05), 0.5);
      gl_FragColor = vec4(mix(c.rgb, tinted, uDesaturation), c.a);
    }
  `,
};

const VignetteShader = {
  uniforms: {
    tDiffuse:   { value: null },
    uVignette:  { value: 0.85 },
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
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 p = vUv - 0.5;
      float d = length(p);
      float v = smoothstep(0.85, 0.25, d);
      float k = mix(1.0, v, uVignette);
      gl_FragColor = vec4(c.rgb * k, c.a);
    }
  `,
};

export function createPostFX(renderer, scene, camera) {
  const size = renderer.getSize(new THREE.Vector2());

  const composer = new EffectComposer(renderer);
  composer.setSize(size.x, size.y);
  composer.setPixelRatio(renderer.getPixelRatio());

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const desaturationPass = new ShaderPass(DesaturationShader);
  composer.addPass(desaturationPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(size.x, size.y),
    0.15,
    0.6,
    1.5,
  );
  composer.addPass(bloomPass);

  const vignettePass = new ShaderPass(VignetteShader);
  vignettePass.renderToScreen = true;
  composer.addPass(vignettePass);

  return { composer, desaturationPass, bloomPass, vignettePass };
}
