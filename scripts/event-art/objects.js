// The Thanksgiving cases in 3D: a rounded box and lid printed with each
// design's pattern, emblem and name plate, with metal latches and a
// handle.
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
