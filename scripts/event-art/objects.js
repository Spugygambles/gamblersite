// Shared 3D builders for the event's pictures: the cases, maple leaves,
// coins, a gift box, a trophy, pumpkins, hay bales and farm pieces.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { DESIGNS } from "./designs.js";
import { pattern, emblem } from "./art.js";

export function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export const shade = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };

// ---- Cases -----------------------------------------------------------------

function caseTextures(d, i) {
  const rand = seeded(1234 + i * 977);
  const top = canvasTex(1024, 696, (ctx, w, h) => {
    ctx.fillStyle = d.base; ctx.fillRect(0, 0, w, h);
    pattern(ctx, d, w, h, rand);
    ctx.strokeStyle = d.accent; ctx.globalAlpha = 0.8; ctx.lineWidth = 10;
    ctx.strokeRect(46, 46, w - 92, h - 92);
    ctx.globalAlpha = 1;
    ctx.fillStyle = d.dark; ctx.beginPath(); ctx.arc(w / 2, h / 2 + 20, 250, 0, 6.283); ctx.fill();
    ctx.strokeStyle = d.accent; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(w / 2, h / 2 + 20, 232, 0, 6.283); ctx.stroke();
    emblem(ctx, d, w / 2, h / 2 + 20, 330, d.accent, d.dark);
  });
  const side = canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = d.base; ctx.fillRect(0, 0, w, h);
    pattern(ctx, d, w, h, seeded(99 + i));
  });
  const front = canvasTex(1024, 302, (ctx, w, h) => {
    ctx.fillStyle = d.base; ctx.fillRect(0, 0, w, h);
    pattern(ctx, d, w, h, seeded(7 + i));
    const pw = 700, ph = 124, px = (w - pw) / 2, py = (h - ph) / 2 + 18;
    ctx.fillStyle = d.dark; ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 14); ctx.fill();
    ctx.strokeStyle = d.accent; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(px + 9, py + 9, pw - 18, ph - 18, 9); ctx.stroke();
    ctx.fillStyle = d.accent;
    ctx.font = '800 76px "Saira Condensed"';
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(d.name.toUpperCase(), w / 2, py + ph / 2 + 4);
  });
  const lidFront = canvasTex(1024, 140, (ctx, w, h) => {
    ctx.fillStyle = d.dark; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = d.accent; ctx.globalAlpha = 0.85; ctx.fillRect(0, h * 0.42, w, 10);
  });
  return { top, side, front, lidFront };
}

/** A case by its design's id, shut, its front facing +z, sitting on y=0. */
export function buildCase(id) {
  const index = DESIGNS.findIndex((d) => d.id === id);
  const d = DESIGNS[index];
  const tx = caseTextures(d, index);
  const mat = (map, extra = {}) =>
    new THREE.MeshStandardMaterial({ map, roughness: d.gold ? 0.32 : 0.5, metalness: d.gold ? 0.75 : 0.06, envMapIntensity: d.gold ? 1.1 : 0.55, ...extra });
  const sideM = mat(tx.side), topM = mat(tx.top), frontM = mat(tx.front), lidFrontM = mat(tx.lidFront);
  const darkM = new THREE.MeshStandardMaterial({ color: d.dark, roughness: 0.6, metalness: 0.05 });
  const metalM = new THREE.MeshStandardMaterial({ color: d.gold ? 0xf1d27a : 0xcfc8ba, roughness: 0.28, metalness: 0.95, envMapIntensity: 1.2 });

  const g = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(3.4, 1.02, 2.3, 4, 0.15), [sideM, sideM, darkM, darkM, frontM, sideM]);
  body.position.y = 0.51;
  g.add(body);
  // the lid, its handle folded flat along the back
  const hinge = new THREE.Group();
  hinge.position.set(0, 1.065, -1.18);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(3.46, 0.48, 2.36, 4, 0.15), [sideM, sideM, topM, darkM, lidFrontM, sideM]);
  lid.position.set(0, 0.24, 1.18);
  hinge.add(lid);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.07, 14, 48, Math.PI), darkM);
  handle.rotation.x = -Math.PI / 2;
  handle.position.set(0, 0.535, 0.18);
  hinge.add(handle);
  for (const x of [-0.46, 0.46]) {
    const mount = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.12, 0.22, 2, 0.03), metalM);
    mount.position.set(x, 0.535, 0.18);
    hinge.add(mount);
  }
  g.add(hinge);
  for (const x of [-1.02, 1.02]) {
    const latch = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.46, 0.09, 2, 0.03), metalM);
    latch.position.set(x, 1.06, 1.19);
    g.add(latch);
  }
  return shade(g);
}

// ---- Leaves and coins --------------------------------------------------------

const MAPLE = "M50 4L58 22 67.5 14.7 64.8 35.1 79.2 31.2 79.2 41 98.3 45.5 80.7 58.3 84.8 66.7 65.8 66.3 65.7 77.2 53.3 65.5 52.2 64 53 92 47 92 47.8 64 46.7 65.5 34.3 77.2 34.2 66.3 15.2 66.7 19.3 58.3 1.7 45.5 20.8 41 20.8 31.2 35.2 35.1 32.5 14.7 42 22Z";

let leafGeo = null;
function mapleGeometry() {
  if (leafGeo) return leafGeo;
  const nums = MAPLE.replace(/[MLZ]/g, " ").trim().split(/[\s,]+/).map(Number);
  const shape = new THREE.Shape();
  for (let i = 0; i < nums.length; i += 2) {
    const x = (nums[i] - 50) / 100, y = -(nums[i + 1] - 50) / 100;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  leafGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 2 });
  leafGeo.center();
  return leafGeo;
}

export const LEAF_COLORS = [0xe0662b, 0xc9452a, 0xe8a23a, 0xb8341f, 0xf0b54a];

/** A maple leaf about `size` across, lying in the xy plane. */
export function leaf(size, color) {
  const m = new THREE.Mesh(mapleGeometry(), new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0, side: THREE.DoubleSide, envMapIntensity: 0.5 }));
  m.scale.setScalar(size);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** A gold coin of radius r, flat on y=0 before it's turned. */
export function coin(r = 0.36) {
  const gold = new THREE.MeshStandardMaterial({ color: 0xf0c25a, roughness: 0.3, metalness: 0.9, envMapIntensity: 1.2 });
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * 0.22, 48), gold);
  g.add(disc);
  // a raised rim and a leaf stamped in the middle
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r * 0.86, r * 0.045, 8, 48), gold);
  rim.rotation.x = Math.PI / 2; rim.position.y = r * 0.11;
  g.add(rim);
  const mark = new THREE.Mesh(mapleGeometry(), gold);
  mark.scale.setScalar(r * 1.15); mark.rotation.x = -Math.PI / 2; mark.position.y = r * 0.115;
  g.add(mark);
  return shade(g);
}

// ---- Gift box ----------------------------------------------------------------

/** A wrapped present with its lid off: the lid floats at `lidAt`, turned
    by `lidTurn`, ribbon and bow in gold. */
export function giftBox({ color = 0x8f2335, ribbon = 0xf3d27a, lidAt = [0, 2.9, 0], lidTurn = [0.3, 0, 0.2] } = {}) {
  const paper = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.02 });
  const inside = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.35), roughness: 0.8 });
  const gold = new THREE.MeshStandardMaterial({ color: ribbon, roughness: 0.38, metalness: 0.35, envMapIntensity: 1.0 });
  const g = new THREE.Group();
  const S = 2.0, H = 1.7, wall = 0.1;
  // an open box: floor and four walls, so the inside reads
  const floor = new THREE.Mesh(new RoundedBoxGeometry(S, wall, S, 2, 0.04), paper); floor.position.y = wall / 2;
  g.add(floor);
  const walls = [[0, S / 2 - wall / 2, S, wall], [0, -S / 2 + wall / 2, S, wall], [S / 2 - wall / 2, 0, wall, S], [-S / 2 + wall / 2, 0, wall, S]];
  for (const [x, z, w, dpt] of walls) {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, H, dpt, 2, 0.04), paper);
    m.position.set(x, H / 2, z);
    g.add(m);
  }
  const floorIn = new THREE.Mesh(new THREE.PlaneGeometry(S - 2 * wall, S - 2 * wall), inside);
  floorIn.rotation.x = -Math.PI / 2; floorIn.position.y = wall + 0.002;
  g.add(floorIn);
  // ribbon bands down the four walls
  for (const [x, z, w, dpt] of [[0, S / 2 + 0.006, 0.36, 0.03], [S / 2 + 0.006, 0, 0.03, 0.36], [0, -S / 2 - 0.006, 0.36, 0.03], [-S / 2 - 0.006, 0, 0.03, 0.36]]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(w, H, dpt), gold);
    band.position.set(x, H / 2, z);
    g.add(band);
  }
  // the lid, with its ribbon and bow
  const lid = new THREE.Group();
  lid.add(new THREE.Mesh(new RoundedBoxGeometry(S + 0.16, 0.42, S + 0.16, 3, 0.06), paper));
  for (const [w, dpt] of [[0.38, S + 0.19], [S + 0.19, 0.38]]) lid.add(new THREE.Mesh(new THREE.BoxGeometry(w, 0.44, dpt), gold));
  for (const s of [-1, 1]) {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.1, 16, 40), gold);
    loop.position.set(s * 0.32, 0.46, 0);
    loop.rotation.set(0, s * 0.35, s * 0.55);
    loop.scale.set(1, 0.8, 1.25);
    lid.add(loop);
  }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), gold);
  knot.position.y = 0.3;
  lid.add(knot);
  lid.position.set(...lidAt);
  lid.rotation.set(...lidTurn);
  g.add(lid);
  return shade(g);
}

// ---- Trophy ------------------------------------------------------------------

/** A gold cup on a dark wooden plinth, a maple leaf on its front. */
export function trophy() {
  const gold = new THREE.MeshStandardMaterial({ color: 0xffcf62, roughness: 0.3, metalness: 0.75, envMapIntensity: 1.6 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x3a2417, roughness: 0.55, metalness: 0.05 });
  const leafM = new THREE.MeshStandardMaterial({ color: 0xd8642a, roughness: 0.45, metalness: 0.1 });
  const g = new THREE.Group();
  const plinth = new THREE.Mesh(new RoundedBoxGeometry(1.9, 0.5, 1.5, 3, 0.07), wood); plinth.position.y = 0.25;
  const plinth2 = new THREE.Mesh(new RoundedBoxGeometry(1.45, 0.34, 1.12, 3, 0.06), wood); plinth2.position.y = 0.66;
  const plate = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.26, 0.04, 2, 0.02), gold); plate.position.set(0, 0.26, 0.76);
  g.add(plinth, plinth2, plate);
  // the cup, turned on a lathe: foot, stem, knop and bowl
  const pts = [
    [0.0, 0], [0.62, 0], [0.62, 0.08], [0.48, 0.14], [0.2, 0.3], [0.13, 0.6], [0.2, 0.7], [0.13, 0.8], [0.14, 0.95],
    [0.34, 1.1], [0.62, 1.32], [0.82, 1.62], [0.92, 2.0], [0.95, 2.36], [0.99, 2.42], [0.99, 2.48], [0.9, 2.48], [0.86, 2.36],
    [0.82, 2.0], [0.7, 1.68], [0.0, 1.5],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const cup = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), gold);
  cup.position.y = 0.83;
  g.add(cup);
  for (const s of [-1, 1]) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.075, 16, 48, Math.PI * 1.15), gold);
    handle.position.set(s * 0.92, 0.83 + 1.82, 0);
    handle.rotation.set(0, s > 0 ? 0 : Math.PI, -Math.PI * 0.57);
    g.add(handle);
  }
  const mark = new THREE.Mesh(mapleGeometry(), leafM);
  mark.scale.set(0.82, 0.82, 3);
  mark.position.set(0, 0.83 + 1.86, 0.86);
  mark.rotation.x = -0.12;
  g.add(mark);
  return shade(g);
}

// ---- Harvest ---------------------------------------------------------------------

/** A pumpkin of radius r: ribbed lobes round a short stem. */
export function pumpkin(r = 1, color = 0xd9772f, { lobes = 9, squash = 0.78 } = {}) {
  const skin = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0 });
  const stemM = new THREE.MeshStandardMaterial({ color: 0x5a4a26, roughness: 0.75 });
  const geo = new THREE.SphereGeometry(r, 72, 48);
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x);
    const rib = 1 - 0.07 * Math.pow(Math.abs(Math.cos((a * lobes) / 2)), 0.6);
    const flat = v.y / r;
    v.x *= rib; v.z *= rib;
    v.y *= squash;
    // dimple the top and bottom in towards the stem
    if (Math.abs(flat) > 0.9) v.y -= Math.sign(flat) * r * 0.12 * (Math.abs(flat) - 0.9) * 10;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const g = new THREE.Group();
  const body = new THREE.Mesh(geo, skin);
  body.position.y = r * squash;
  g.add(body);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.07, r * 0.11, r * 0.36, 12), stemM);
  stem.position.set(0, r * squash * 2 - r * 0.08, 0);
  stem.rotation.z = 0.25;
  g.add(stem);
  return shade(g);
}

/** A straw texture: streaks of light and dark gold. */
export function strawTex(seed = 1, w = 512, h = 512, base = "#c99a4a") {
  const rand = seeded(seed);
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) {
      const x = rand() * w, y = rand() * h, len = 20 + rand() * 60, a = (rand() - 0.5) * 0.5;
      ctx.strokeStyle = rand() > 0.5 ? "rgba(255,226,150,0.35)" : "rgba(90,60,20,0.3)";
      ctx.lineWidth = 1 + rand() * 2;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); ctx.stroke();
    }
  });
}

/** A round hay bale lying on its side, radius r, length l, along x. */
export function hayBale(r = 0.8, l = 1.1, seed = 3) {
  const side = new THREE.MeshStandardMaterial({ map: strawTex(seed), roughness: 0.9 });
  const faceTex = canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#c39345"; ctx.fillRect(0, 0, w, h);
    const rand = seeded(seed + 7);
    for (let rr = 250; rr > 4; rr -= 9) {
      ctx.strokeStyle = rand() > 0.5 ? "rgba(255,225,150,0.4)" : "rgba(95,62,22,0.35)";
      ctx.lineWidth = 3 + rand() * 4;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, rr, rand() * 6, rand() * 6 + 5.5); ctx.stroke();
    }
  });
  const face = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.9 });
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, 48, 1), [side, face, face]);
  m.rotation.z = Math.PI / 2;
  m.position.y = r;
  const g = new THREE.Group();
  g.add(m);
  return shade(g);
}
