import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

import { capture, theme } from "./theme.js";

// In capture mode there is no clock; scripts/render.mjs drives frames via window.__frame(t).
export { capture, theme };

export const LOOP_SECONDS = 8; // must match LOOP_MS in scripts/render.mjs
export const TAU = Math.PI * 2;
/** Smooth 0→1→0 over one loop; keeps every motion seamless. */
export const wave = (t, phase = 0) => 0.5 - 0.5 * Math.cos(TAU * (t + phase));
export const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/** Maquette palette: matte paper by day, graphite by night, one accent. */
export const palette =
  theme === "dark"
    ? { paper: 0x5a5b62, base: 0x404147, line: 0x8b8c95, sky: 0xc9d1e4, ground: 0x15151a, hemi: 1.6, key: 3.1, shadow: 0.55 }
    : { paper: 0xf4f2ed, base: 0xe9e6df, line: 0xa9a59d, sky: 0xffffff, ground: 0xd9d2c6, hemi: 1.5, key: 2.1, shadow: 0.16 };
export const ACCENT = 0xff4f1a;

/** Deterministic PRNG so every render is identical. */
export const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};

/**
 * Mount a transparent, softly shadowed scene in `stage`.
 *
 * @param {object} o
 * @param {HTMLElement} o.stage Element the canvas fills.
 * @param {number} o.fov
 * @param {(t: number, camera: THREE.PerspectiveCamera) => void} o.cameraPath Camera pose at loop phase t.
 * @param {THREE.Vector3} o.target Orbit target on the live page.
 * @param {(ctx: {scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, labels: CSS2DRenderer}) => Promise<(t: number) => void>} o.build
 */
export async function start({ stage, fov, cameraPath, target, build }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: capture });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(capture ? 1 : Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  stage.prepend(renderer.domElement);

  const labels = new CSS2DRenderer();
  labels.domElement.className = "labels";
  labels.domElement.style.overflow = "visible"; // annotations may sit above the canvas
  stage.appendChild(labels.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 1000);
  scene.add(new THREE.HemisphereLight(palette.sky, palette.ground, palette.hemi));
  const key = new THREE.DirectionalLight(0xfff3e4, palette.key);
  key.position.set(-6, 14, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 14;
  key.shadow.blurSamples = 20;
  key.shadow.bias = -0.0004;
  Object.assign(key.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 80 });
  scene.add(key);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.ShadowMaterial({ opacity: palette.shadow, color: theme === "dark" ? 0x000000 : 0x3b3226 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = stage;
    renderer.setSize(w, h);
    labels.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  cameraPath(0, camera);

  const update = await build({ scene, camera, renderer, labels });
  const draw = (t) => {
    update(t);
    renderer.render(scene, camera);
    labels.render(scene, camera);
  };

  if (capture) {
    window.__frame = (t) => {
      cameraPath(t, camera);
      draw(t);
    };
    await document.fonts.ready;
    window.__ready = true;
    return { camera, labels };
  }

  new ResizeObserver(resize).observe(stage);
  const controls = new OrbitControls(camera, labels.domElement);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.autoRotate = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  controls.autoRotateSpeed = 0.35;
  controls.update();
  const t0 = performance.now();
  renderer.setAnimationLoop(() => {
    controls.update();
    draw(((performance.now() - t0) / 1000 / LOOP_SECONDS) % 1);
  });
  return { camera, labels };
}
