/* The 3D project spiral. Geometry follows the Studio Dialect original:
   90 curved ribbon tiles on a helix (20 tiles per turn), a gentle radius wave,
   scroll-driven rotation, cursor tilt, radial pop-out on hover, click to open. */
import * as THREE from "./vendor/three.module.min.js";

const stage = document.getElementById("stage");
const mount = document.getElementById("spiral");
const tag = document.getElementById("spiralTag");
const C = window.BPS;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover:hover) and (pointer:fine)").matches;

const E = 90, F = 64, TURN = 20;           // tiles, segments per tile, tiles per turn
const R0 = 1.1, SPAN = E / (15 / R0);      // base radius, total helix height
const WAVE_LEN = 0.8, WAVE_AMP = 0.15;
const lerp = THREE.MathUtils.lerp, clamp = THREE.MathUtils.clamp;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
} catch (e) { renderer = null; }
if (!renderer) throw new Error("no webgl");

renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.appendChild(renderer.domElement);
renderer.domElement.style.touchAction = "pan-y";

stage.classList.add("on");   // must be displayed before we measure it
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);

/* lights: soft fill, a white key, orange rim and mint kick like the original */
scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 4, 8); scene.add(key);
const rim = new THREE.PointLight(0xff7a29, 14, 30); rim.position.set(-4, -4, 4); scene.add(rim);
const mint = new THREE.PointLight(0xc3f0cc, 18, 30); mint.position.set(4, 1, 2); scene.add(mint);

const tilt = new THREE.Group();   // cursor tilt
const helix = new THREE.Group();  // scroll rotation + lift
tilt.add(helix); scene.add(tilt);

/* textures: each project contributes its tiles; 90 ribbons cycle through them */
const loader = new THREE.TextureLoader();
const items = [];
C.spiral.forEach(p => { for (let i = 1; i <= p.count; i++) items.push({ id: p.id, label: p.label, src: `media/spiral/${p.id}-${i}.jpg` }); });
/* interleave projects so neighbours differ */
const byProj = C.spiral.map(p => items.filter(x => x.id === p.id));
const order = [];
for (let i = 0; i < Math.max(...byProj.map(a => a.length)); i++) byProj.forEach(a => a[i] && order.push(a[i]));
order.forEach(it => {
  it.tex = loader.load(it.src);
  it.tex.colorSpace = THREE.SRGBColorSpace;
  it.tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
});

function ribbonGeometry(k) {
  const pos = [], nor = [], uv = [], idx = [];
  const pt = t => {
    const a = (t / TURN) * Math.PI * 2 + Math.PI / 2;
    const y = -(t / E) * SPAN - 1.5;
    const r = R0 * 2 * ((1.5 * Math.sin(WAVE_LEN * (-y / SPAN) * 2 * Math.PI) * WAVE_AMP + WAVE_AMP) * 0.5 + 1);
    return { x: Math.cos(a) * r, y, z: Math.sin(a) * r };
  };
  const h = 1 / F;
  for (let s = 0; s < F; s++) {
    const t0 = k + s * h, c = pt(t0), n = pt(k + (s + 1) * h), p = pt(k + (s - 1) * h);
    const jn = 0.8 * Math.hypot(F * (n.x - c.x), F * (n.z - c.z));
    const jc = 0.8 * Math.hypot(F * (c.x - p.x), F * (c.z - p.z));
    pos.push(n.x, n.y - jn, n.z, c.x, c.y - jc, c.z, n.x, n.y + jn, n.z, c.x, c.y + jc, c.z);
    const nn = new THREE.Vector3(n.x, 0, n.z).normalize(), nc = new THREE.Vector3(c.x, 0, c.z).normalize();
    nor.push(nn.x, nn.y, nn.z, nc.x, nc.y, nc.z, nn.x, nn.y, nn.z, nc.x, nc.y, nc.z);
    const u0 = s / F, u1 = (s + 1) / F;
    uv.push(1 - u1, 0, 1 - u0, 0, 1 - u1, 1, 1 - u0, 1);
    const o = s * 4; idx.push(o, o + 2, o + 1, o + 1, o + 2, o + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

const tiles = [], meshes = [];
for (let k = 0; k < E; k++) {
  const item = order[k % order.length];
  const mat = new THREE.MeshStandardMaterial({ map: item.tex, side: THREE.DoubleSide, transparent: true, toneMapped: false, roughness: 0.85, metalness: 0 });
  const mesh = new THREE.Mesh(ribbonGeometry(k), mat);
  mesh.frustumCulled = false; mesh.userData.k = k;
  const g = new THREE.Group(); g.add(mesh); helix.add(g);
  const ang = ((k + 0.5) / TURN) * Math.PI * 2 + Math.PI / 2;
  tiles.push({ g, mesh, mat, item, dir: new THREE.Vector2(Math.cos(ang), Math.sin(ang)), out: 0 });
  meshes.push(mesh);
}

/* responsive camera, same rules as the original */
let camBase = -1, camRange = 3;
function resize() {
  const w = mount.clientWidth, h = mount.clientHeight, a = w / h;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  camera.aspect = a;
  camera.fov = 50 * (1 - Math.max(0, 1 - w / 1400) * 0.2);
  camera.position.z = a > 1 ? 9.6 : 14;
  camBase = a < 1 ? -(1 - a) * 2 - 2 : -2.6;
  camRange = a < 1 ? 5 + (1 - a) * 6 : 3.4;
  camera.updateProjectionMatrix();
}
resize();
addEventListener("resize", resize);

/* scroll progress through the pinned stage */
function progress() {
  const r = stage.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
}

/* pointer: tilt + hover raycast */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let mx = innerWidth / 2, my = innerHeight / 2, tx = 0, ty = 0, hover = -1, pendingRay = false;
addEventListener("pointermove", e => {
  if (e.pointerType === "touch") return;
  mx = e.clientX; my = e.clientY; pendingRay = true;
}, { passive: true });

function doRay(clientX, clientY) {
  const r = renderer.domElement.getBoundingClientRect();
  if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return -1;
  ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(meshes, false)[0];
  return hit ? hit.object.userData.k : -1;
}

function showTag(k) {
  if (k < 0) { tag.hidden = true; renderer.domElement.style.cursor = ""; return; }
  tag.hidden = false;
  tag.firstElementChild.textContent = tiles[k].item.label;
  tag.classList.toggle("right", mx > innerWidth / 2);
  tag.style.left = mx + "px"; tag.style.top = my + "px";
  renderer.domElement.style.cursor = "pointer";
}

renderer.domElement.addEventListener("click", e => {
  if (introT < 3 && !reduced) return;
  const k = (finePointer && hover >= 0) ? hover : doRay(e.clientX, e.clientY);
  if (k >= 0) document.dispatchEvent(new CustomEvent("bps:open", { detail: tiles[k].item.id }));
});

/* render loop, only while the stage is on screen */
let visible = false, raf = 0, introT = reduced ? 9 : 0, introStart = 0;
const ease = x => 1 - Math.pow(1 - x, 3);

function frame(now) {
  raf = requestAnimationFrame(frame);
  if (!introStart) introStart = now;
  if (!reduced) introT = (now - introStart) / 1000;
  const p = progress();

  /* helix: scroll rotation and lift, plus a slow idle drift */
  helix.rotation.y = 0.8 + p * 2.6 * Math.PI * 2 * 0.5 * 2 + (reduced ? 0 : now * 2e-5);
  helix.position.y = p * 3.6;

  /* cursor tilt */
  if (finePointer && !reduced) {
    tx = lerp(tx, (mx / innerWidth - 0.5) * Math.PI, 0.1);
    ty = lerp(ty, -(my / innerHeight - 0.5) * Math.PI, 0.1);
    tilt.rotation.z = lerp(tilt.rotation.z, -tx / 20, 0.15);
    tilt.rotation.x = lerp(tilt.rotation.x, ty / 20, 0.15);
  }

  /* camera follows scroll a little */
  const targetY = lerp(camBase, camBase - camRange * 0.35, p);
  camera.position.y += (targetY - camera.position.y) * 0.1;
  camera.lookAt(0, camera.position.y, 0);

  /* intro: tiles drop in one after another, then settle */
  tiles.forEach((t, k) => {
    const e = ease(clamp((introT - k * 0.018) / 0.9, 0, 1));
    t.mat.opacity = e;
    t.g.position.y = (1 - e) * 4;
    const out = k === hover && introT > 3 ? 0.25 : 0;
    t.out = lerp(t.out, out, 0.1);
    t.mesh.position.set(t.dir.x * t.out, 0, t.dir.y * t.out);
  });

  if (pendingRay && introT > 3 && finePointer) {
    pendingRay = false;
    hover = doRay(mx, my);
  }
  if (hover >= 0 || !tag.hidden) showTag(hover);

  renderer.render(scene, camera);
}

new IntersectionObserver(es => {
  visible = es[0].isIntersecting;
  if (visible && !raf) { raf = requestAnimationFrame(frame); }
  if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; hover = -1; showTag(-1); }
}, { rootMargin: "200px" }).observe(stage);

document.dispatchEvent(new CustomEvent("bps:spiral-ready"));
