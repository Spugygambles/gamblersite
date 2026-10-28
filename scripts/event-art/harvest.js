// The harvest scene's pieces: cloth, straw and wood as painted textures
// with bump maps, a scarecrow built from them with a crow on his arm and a
// lantern on the other, and the field round him: corn, bare trees, hills,
// pumpkins and leaves.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { canvasTex, seeded, shade } from "./objects.js";

const TAU = Math.PI * 2;

// ---- Textures --------------------------------------------------------------------

function speckle(ctx, w, h, n, rand, dark = "rgba(0,0,0,0.18)", light = "rgba(255,255,255,0.08)") {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = rand() > 0.5 ? dark : light;
    ctx.fillRect(rand() * w, rand() * h, 1 + rand() * 2, 1 + rand() * 2);
  }
}

/** Burlap: a coarse weave, with its bump map. */
export function burlap(seed = 1, base = "#a0825a") {
  const rand = seeded(seed);
  const draw = (bump) => (ctx, w, h) => {
    ctx.fillStyle = bump ? "#808080" : base;
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 5) {
      ctx.fillStyle = bump ? "rgba(0,0,0,0.45)" : "rgba(40,25,10,0.35)";
      ctx.fillRect(0, y, w, 2);
    }
    for (let x = 0; x < w; x += 5) {
      ctx.fillStyle = bump ? "rgba(0,0,0,0.45)" : "rgba(40,25,10,0.3)";
      ctx.fillRect(x, 0, 2, h);
      ctx.fillStyle = bump ? "rgba(255,255,255,0.25)" : "rgba(255,230,170,0.08)";
      ctx.fillRect(x + 2, 0, 1, h);
    }
    speckle(ctx, w, h, 2500, rand, bump ? "rgba(0,0,0,0.3)" : "rgba(30,20,10,0.25)", bump ? "rgba(255,255,255,0.2)" : "rgba(255,240,200,0.1)");
    if (!bump) {
      // grime
      for (let i = 0; i < 14; i++) {
        const g = ctx.createRadialGradient(rand() * w, rand() * h, 0, 0, 0, 0);
        ctx.fillStyle = `rgba(30,18,8,${0.08 + rand() * 0.12})`;
        ctx.beginPath();
        ctx.arc(rand() * w, rand() * h, 30 + rand() * 90, 0, TAU);
        ctx.fill();
        void g;
      }
    }
  };
  const map = canvasTex(512, 512, draw(false));
  const bump = canvasTex(512, 512, draw(true));
  map.wrapS = map.wrapT = bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  return { map, bump };
}

/** Plaid flannel in autumn reds, with a cloth bump, and a couple of
    patches stitched on. */
export function plaid(seed = 2, { base = "#7c2b23", dark = "#2a1714", thread = "#d08a5c" } = {}) {
  const rand = seeded(seed);
  const map = canvasTex(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = dark;
    for (let x = 0; x < w; x += 192) ctx.fillRect(x, 0, 84, h);
    for (let y = 0; y < h; y += 192) ctx.fillRect(0, y, w, 84);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = thread;
    for (let x = 128; x < w; x += 192) ctx.fillRect(x, 0, 6, h);
    for (let y = 128; y < h; y += 192) ctx.fillRect(0, y, w, 6);
    ctx.globalAlpha = 1;
    // the weave: fine diagonal twill lines
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 1;
    for (let d = -h; d < w; d += 4) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d + h, h);
      ctx.stroke();
    }
    speckle(ctx, w, h, 6000, rand, "rgba(0,0,0,0.2)", "rgba(255,220,180,0.08)");
    // patches: a square of other cloth, stitched round with thread
    for (const [px, py, pw, ph, col] of [[640, 300, 150, 130, "#3a4a6a"], [180, 700, 120, 150, "#c08a3a"]]) {
      ctx.fillStyle = col;
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.moveTo(px + rand() * pw, py);
        ctx.lineTo(px + rand() * pw, py + ph);
        ctx.stroke();
      }
      ctx.strokeStyle = "#f1e2c0";
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 10]);
      ctx.strokeRect(px + 6, py + 6, pw - 12, ph - 12);
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
    }
  });
  const bump = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, 5000, rand, "rgba(0,0,0,0.5)", "rgba(255,255,255,0.4)");
  });
  map.wrapS = map.wrapT = bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  return { map, bump };
}

/** Woven straw, for the hat: rings of strands. */
export function woven(seed = 3, base = "#b8914a") {
  const rand = seeded(seed);
  const draw = (bump) => (ctx, w, h) => {
    ctx.fillStyle = bump ? "#808080" : base;
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 7) {
      ctx.fillStyle = bump ? "rgba(0,0,0,0.5)" : "rgba(60,36,10,0.45)";
      ctx.fillRect(0, y, w, 3);
      ctx.fillStyle = bump ? "rgba(255,255,255,0.3)" : "rgba(255,230,160,0.14)";
      ctx.fillRect(0, y + 4, w, 1);
    }
    for (let x = 0; x < w; x += 14) {
      ctx.fillStyle = bump ? "rgba(0,0,0,0.25)" : "rgba(60,36,10,0.25)";
      ctx.fillRect(x + (rand() > 0.5 ? 0 : 7), 0, 2, h);
    }
    speckle(ctx, w, h, 1500, rand);
  };
  const map = canvasTex(512, 512, draw(false));
  const bump = canvasTex(512, 512, draw(true));
  map.wrapS = map.wrapT = bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  return { map, bump };
}

/** Weathered wood, grain running along y. */
export function wood(seed = 4, base = "#4e3521") {
  const rand = seeded(seed);
  const map = canvasTex(256, 1024, (ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = rand() * w;
      ctx.strokeStyle = rand() > 0.5 ? `rgba(20,10,4,${0.2 + rand() * 0.4})` : `rgba(150,110,70,${0.1 + rand() * 0.2})`;
      ctx.lineWidth = 1 + rand() * 3;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + (rand() - 0.5) * 30, h * 0.3, x + (rand() - 0.5) * 30, h * 0.7, x + (rand() - 0.5) * 20, h);
      ctx.stroke();
    }
    speckle(ctx, w, h, 1500, rand);
  });
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  return map;
}

/** Dark soil with a little straw in it. */
export function soil(seed = 5) {
  const rand = seeded(seed);
  const map = canvasTex(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = "#2b2118";
    ctx.fillRect(0, 0, w, h);
    speckle(ctx, w, h, 20000, rand, "rgba(0,0,0,0.35)", "rgba(120,90,50,0.25)");
    for (let i = 0; i < 300; i++) {
      ctx.strokeStyle = `rgba(170,130,70,${0.1 + rand() * 0.25})`;
      ctx.lineWidth = 1 + rand();
      const x = rand() * w, y = rand() * h, a = rand() * TAU, l = 8 + rand() * 30;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      ctx.stroke();
    }
  });
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  return map;
}

// ---- Small helpers --------------------------------------------------------------

// A cheap hash noise over space, for lumps.
function noise3(x, y, z) {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return s - Math.floor(s);
}

/** Pushes a geometry's vertices in and out along their normals a little,
    smoothly, so a shape stops looking turned on a lathe. */
export function lumpy(geo, amount = 0.03, scale = 3) {
  const p = geo.attributes.position, n = geo.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    // three octaves of smooth-ish noise, by sampling nearby cells and
    // mixing
    const cx = Math.floor(x * scale), cy = Math.floor(y * scale), cz = Math.floor(z * scale);
    const fx = x * scale - cx, fy = y * scale - cy, fz = z * scale - cz;
    let v = 0;
    for (const [dx, dy, dz] of [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]]) {
      const wgt = (dx ? fx : 1 - fx) * (dy ? fy : 1 - fy) * (dz ? fz : 1 - fz);
      v += wgt * noise3(cx + dx, cy + dy, cz + dz);
    }
    const d = (v - 0.5) * 2 * amount;
    p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d);
  }
  geo.computeVertexNormals();
  return geo;
}

/** A bundle of straw: `n` thin tapered stalks fanning out of a point
    along +y, bent a little each, as one mesh. */
export function straw(n = 24, { length = 0.4, spread = 0.5, seed = 1, radius = 0.012 } = {}) {
  const rand = seeded(seed);
  const parts = [];
  for (let i = 0; i < n; i++) {
    const len = length * (0.6 + rand() * 0.7);
    const geo = new THREE.CylinderGeometry(radius * 0.4, radius, len, 5, 4);
    // bend: shift the upper vertices sideways, more the higher they are
    const p = geo.attributes.position;
    const bx = (rand() - 0.5) * 0.3, bz = (rand() - 0.5) * 0.3;
    for (let k = 0; k < p.count; k++) {
      const t = (p.getY(k) + len / 2) / len;
      p.setXYZ(k, p.getX(k) + bx * t * t * len, p.getY(k), p.getZ(k) + bz * t * t * len);
    }
    geo.translate(0, len / 2, 0);
    const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler((rand() - 0.5) * spread * 2, rand() * TAU, (rand() - 0.5) * spread * 2, "YXZ"));
    geo.applyMatrix4(m);
    // a tint per stalk, in the colour attribute
    const shade = 0.75 + rand() * 0.4;
    const colors = new Float32Array(p.count * 3);
    for (let k = 0; k < p.count; k++) colors.set([shade, shade * 0.92, shade * 0.6], k * 3);
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    parts.push(geo);
  }
  const mesh = new THREE.Mesh(mergeGeometries(parts), new THREE.MeshStandardMaterial({ color: 0xd9b56a, vertexColors: true, roughness: 0.9 }));
  mesh.castShadow = true;
  return mesh;
}

/** Straw sticking out all round a circle's edge, as one mesh: the fray on
    a hat's brim. */
function fringe(radius, n, length, seed = 1) {
  const rand = seeded(seed);
  const parts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + rand() * 0.08;
    const len = length * (0.5 + rand() * 0.9);
    const geo = new THREE.CylinderGeometry(0.003, 0.007, len, 4, 1);
    geo.translate(0, len / 2, 0);
    // +y turned outward along the edge, drooping a little
    geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, -a, -Math.PI / 2 - 0.1 - rand() * 0.35, "YZX")));
    geo.translate(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    const shade = 0.7 + rand() * 0.45;
    const colors = new Float32Array(geo.attributes.position.count * 3);
    for (let k = 0; k < geo.attributes.position.count; k++) colors.set([shade, shade * 0.9, shade * 0.55], k * 3);
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    parts.push(geo);
  }
  const mesh = new THREE.Mesh(mergeGeometries(parts), new THREE.MeshStandardMaterial({ color: 0xd9b56a, vertexColors: true, roughness: 0.9 }));
  mesh.castShadow = true;
  return mesh;
}

// ---- The scarecrow -----------------------------------------------------------------

/** A scarecrow on his pole, arms out on the crossbar, a crow on one arm
    and a lantern hung from the other. Faces +z; the pole stands on y=0. */
export function scarecrow() {
  const g = new THREE.Group();
  const M = (opts) => new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0, envMapIntensity: 0.3, ...opts });
  const sack = burlap(11);
  const shirt = plaid(12);
  const hatCloth = woven(13);
  const trouser = burlap(14, "#4a3a2c");
  const poleTex = wood(15);
  const sackM = M({ map: sack.map, bumpMap: sack.bump, bumpScale: 0.012 });
  const shirtM = M({ map: shirt.map, bumpMap: shirt.bump, bumpScale: 0.006 });
  const hatM = M({ map: hatCloth.map, bumpMap: hatCloth.bump, bumpScale: 0.01 });
  const trouserM = M({ map: trouser.map, bumpMap: trouser.bump, bumpScale: 0.01 });
  const woodM = M({ map: poleTex, roughness: 0.85 });
  const ropeM = M({ color: 0xa98a5a, roughness: 0.95 });
  const inkM = M({ color: 0x1b1410, roughness: 0.6 });

  // the pole and crossbar
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 4.4, 14), woodM);
  pole.position.y = 1.5;
  poleTex.repeat.set(1, 4);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.1, 0.1), woodM);
  bar.position.set(0, 2.6, 0);
  bar.rotation.z = 0.025;
  g.add(pole, bar);

  // torso: a lathe from shoulders to hem, lumpy
  const torsoPts = [
    [0.0, 0], [0.33, 0], [0.37, 0.15], [0.35, 0.45], [0.33, 0.7], [0.36, 0.95], [0.42, 1.1], [0.46, 1.2], [0.3, 1.27], [0.0, 1.27],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const torso = new THREE.Mesh(lumpy(new THREE.LatheGeometry(torsoPts, 40), 0.03, 4), shirtM);
  torso.position.y = 1.4;
  shirt.map.repeat.set(1.2, 1.2);
  g.add(torso);

  // sleeves along the bar, sagging at the ends, with a cuff and straw
  for (const s of [-1, 1]) {
    const sleeve = new THREE.Mesh(lumpy(new THREE.CylinderGeometry(0.13, 0.19, 0.95, 20, 6), 0.02, 5), shirtM);
    sleeve.rotation.z = s * (Math.PI / 2 + 0.12);
    sleeve.position.set(s * 0.82, 2.58 - 0.03, 0);
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.03, 10, 24), M({ color: 0x3a1c18 }));
    cuff.rotation.y = Math.PI / 2;
    cuff.position.set(s * 1.28, 2.5, 0);
    const hand = straw(30, { length: 0.42, spread: 0.45, seed: 20 + s });
    hand.rotation.z = s * -Math.PI / 2;
    hand.position.set(s * 1.3, 2.5, 0);
    g.add(sleeve, cuff, hand);
  }

  // trousers: two legs hanging from the hem, straw at the bottom
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(lumpy(new THREE.CylinderGeometry(0.16, 0.19, 0.85, 20, 6), 0.02, 5), trouserM);
    leg.position.set(s * 0.19, 0.98, 0.02);
    leg.rotation.z = s * -0.08;
    const tuft = straw(22, { length: 0.3, spread: 0.35, seed: 30 + s });
    tuft.rotation.x = Math.PI;
    tuft.position.set(s * 0.22, 0.58, 0.02);
    g.add(leg, tuft);
  }
  // rope belt and straw at the waist
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.035, 10, 40), ropeM);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 1.42;
  const waist = straw(30, { length: 0.22, spread: 0.3, seed: 41 });
  waist.rotation.x = Math.PI;
  waist.position.set(0, 1.4, 0.2);
  waist.scale.set(1.6, 1, 0.6);
  g.add(belt, waist);

  // the head: a burlap sack, tied at the top, straw at the neck
  const head = new THREE.Mesh(lumpy(new THREE.SphereGeometry(0.37, 48, 36), 0.035, 3), sackM);
  head.scale.set(1, 1.12, 0.95);
  head.position.set(0, 3.05, 0.05);
  sack.map.repeat.set(2, 2);
  sack.bump.repeat.set(2, 2);
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.26, 16), sackM);
  top.position.set(0.03, 3.52, 0.02);
  top.rotation.z = -0.2;
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 8, 20), ropeM);
  tie.rotation.x = Math.PI / 2;
  tie.position.set(0.02, 3.44, 0.03);
  const collar = straw(40, { length: 0.26, spread: 0.6, seed: 51 });
  collar.position.set(0, 2.62, 0.1);
  collar.scale.set(1.5, 1, 1);
  g.add(head, top, tie, collar);

  // the face: button eyes, a stitched smile, a patch of a nose
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 20), inkM);
    eye.rotation.x = Math.PI / 2;
    eye.position.set(s * 0.14, 3.12, 0.39);
    g.add(eye);
    // the thread through the button
    for (const [dx, dy] of [[-0.02, -0.02], [0.02, 0.02]]) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.045, 0.006), ropeM);
      t.position.set(s * 0.14 + dx, 3.12 + dy, 0.405);
      t.rotation.z = dx < 0 ? 0.8 : -0.8;
      g.add(t);
    }
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.09, 3), M({ color: 0x6b2a22 }));
  nose.rotation.x = Math.PI;
  nose.position.set(0.0, 2.99, 0.38);
  g.add(nose);
  // the smile: short dark stitches along a curve
  for (let i = 0; i < 9; i++) {
    const t = -1 + (2 * i) / 8;
    const stitch = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.008), inkM);
    stitch.position.set(t * 0.17, 2.86 + 0.06 * t * t, 0.37 - 0.02 * t * t);
    stitch.rotation.z = -t * 0.7;
    g.add(stitch);
  }

  // the hat: a wide frayed brim and a low crown, tipped
  const hat = new THREE.Group();
  const brim = new THREE.Mesh(lumpy(new THREE.CylinderGeometry(0.74, 0.74, 0.025, 56, 1), 0.012, 2), hatM);
  const crownPts = [[0.4, 0], [0.42, 0.1], [0.4, 0.22], [0.33, 0.32], [0.2, 0.37], [0, 0.38]].map(([x, y]) => new THREE.Vector2(x, y));
  const crown = new THREE.Mesh(lumpy(new THREE.LatheGeometry(crownPts, 40), 0.015, 4), hatM);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.405, 0.035, 10, 48), M({ color: 0x5a1f1b }));
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.09;
  const fray = fringe(0.72, 110, 0.11, 61);
  hat.add(brim, crown, band, fray);
  hat.position.set(0.02, 3.4, 0.0);
  hat.rotation.set(-0.1, 0.1, 0.13);
  g.add(hat);

  // a crow on his left arm (the viewer's right)
  const crow = new THREE.Group();
  const crowM = new THREE.MeshStandardMaterial({ color: 0x0c0b12, roughness: 0.45, metalness: 0.15, envMapIntensity: 0.6 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), crowM);
  body.scale.set(1.5, 0.95, 0.9);
  body.rotation.z = 0.25;
  const crowHead = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 14), crowM);
  crowHead.position.set(-0.17, 0.11, 0);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.11, 10), M({ color: 0x2a2630, roughness: 0.5 }));
  beak.rotation.z = Math.PI / 2;
  beak.position.set(-0.27, 0.1, 0);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.09), crowM);
  tail.position.set(0.24, 0.02, 0);
  tail.rotation.z = -0.35;
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), M({ color: 0xffffff, roughness: 0.3 }));
  eye.position.set(-0.2, 0.13, 0.065);
  crow.add(body, crowHead, beak, tail, eye);
  crow.position.set(1.05, 2.76, 0.0);
  crow.rotation.y = 0.35;
  crow.scale.setScalar(1.3);
  g.add(crow);

  // a lantern hung from the other arm, glowing
  const lantern = new THREE.Group();
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.42, 6), M({ color: 0x3a3a40, metalness: 0.6, roughness: 0.5 }));
  chain.position.y = 0.42;
  const frameM = M({ color: 0x2a2a30, metalness: 0.7, roughness: 0.45 });
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.1, 8), frameM);
  cap.position.y = 0.23;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.06, 8), frameM);
  base.position.y = -0.14;
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.3, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xffb257, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
  glass.position.y = 0.03;
  for (let i = 0; i < 4; i++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.32, 0.014), frameM);
    rib.position.set(Math.cos((i / 4) * TAU + 0.4) * 0.1, 0.03, Math.sin((i / 4) * TAU + 0.4) * 0.1);
    lantern.add(rib);
  }
  const flame = new THREE.PointLight(0xffa040, 16, 10, 1.7);
  flame.position.y = 0.05;
  lantern.add(chain, cap, base, glass, flame);
  lantern.position.set(-1.2, 2.0, 0.1);
  lantern.rotation.z = 0.06;
  g.add(lantern);

  shade(g);
  // nothing see-through casts a shadow it shouldn't
  glass.castShadow = false;
  return g;
}

// ---- The field ---------------------------------------------------------------------

/** A flat shape drawn with alpha, standing up as a plane: the far things,
    seen only as shapes. */
function cutout(draw, w, h, size, color = 0x0d0b17, seed = 1) {
  const tex = canvasTex(w, h, (ctx) => draw(ctx, w, h, seeded(seed)));
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size * (w / h), size),
    new THREE.MeshStandardMaterial({ map: tex, color, alphaTest: 0.5, roughness: 1, side: THREE.DoubleSide }),
  );
  m.castShadow = true;
  return m;
}

/** A bare tree: a trunk that forks and forks again, `size` tall. */
export function bareTree(size = 8, seed = 1) {
  return cutout((ctx, w, h, rand) => {
    ctx.strokeStyle = "#fff";
    ctx.lineCap = "round";
    const branch = (x, y, len, ang, width, depth) => {
      const x2 = x + Math.cos(ang) * len, y2 = y - Math.sin(ang) * len;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (depth === 0 || width < 1) return;
      const n = 2 + (rand() > 0.6 ? 1 : 0);
      for (let i = 0; i < n; i++) branch(x2, y2, len * (0.6 + rand() * 0.25), ang + (rand() - 0.5) * 1.3, width * 0.62, depth - 1);
    };
    branch(w / 2, h, h * 0.3, Math.PI / 2 + (rand() - 0.5) * 0.2, w * 0.05, 6);
  }, 512, 640, size, 0x0d0b17, seed);
}

/** A corn stalk: a stem, leaves hanging off it, a tassel on top. */
export function cornStalk(size = 2.8, seed = 1) {
  return cutout((ctx, w, h, rand) => {
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#fff";
    ctx.lineCap = "round";
    const x = w / 2;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.quadraticCurveTo(x + (rand() - 0.5) * 20, h * 0.5, x + (rand() - 0.5) * 14, h * 0.1);
    ctx.stroke();
    // long strap leaves, arching up and out then drooping at the tip
    for (let i = 0; i < 7; i++) {
      const y = h * (0.22 + i * 0.11), s = i % 2 ? 1 : -1, reach = 90 + rand() * 50, lift = 60 + rand() * 50;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + s * 30, y - lift * 0.9, x + s * reach * 0.8, y - lift, x + s * reach, y - lift * 0.3 + rand() * 50);
      ctx.bezierCurveTo(x + s * reach * 0.7, y - lift * 0.55, x + s * 22, y - lift * 0.35, x, y + 8);
      ctx.fill();
    }
    // the tassel
    for (let i = 0; i < 7; i++) {
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x, h * 0.12);
      ctx.quadraticCurveTo(x + (rand() - 0.5) * 60, h * 0.04, x + (rand() - 0.5) * 90, 6 + rand() * 20);
      ctx.stroke();
    }
  }, 300, 640, size, 0x1c1a10, seed);
}

/** A rolling hill, as a half ellipse on the ground. */
export function hill(width, height, color = 0x120f1f) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, TAU, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color, roughness: 1 }));
  m.scale.set(width / 2, height, width / 6);
  return m;
}

/** A pumpkin of radius r: ribbed lobes round a short stem. */
export function pumpkin(r = 1, color = 0xc96a2a, { lobes = 9, squash = 0.78 } = {}) {
  const skin = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0 });
  const stemM = new THREE.MeshStandardMaterial({ color: 0x4a3a20, roughness: 0.8 });
  const geo = new THREE.SphereGeometry(r, 72, 48);
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x);
    const rib = 1 - 0.07 * Math.pow(Math.abs(Math.cos((a * lobes) / 2)), 0.6);
    const flat = v.y / r;
    v.x *= rib;
    v.z *= rib;
    v.y *= squash;
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

// ---- Leaves ---------------------------------------------------------------------------

const MAPLE =
  "M50 4L58 22 67.5 14.7 64.8 35.1 79.2 31.2 79.2 41 98.3 45.5 80.7 58.3 84.8 66.7 65.8 66.3 65.7 77.2 53.3 65.5 52.2 64 53 92 47 92 47.8 64 46.7 65.5 34.3 77.2 34.2 66.3 15.2 66.7 19.3 58.3 1.7 45.5 20.8 41 20.8 31.2 35.2 35.1 32.5 14.7 42 22Z";

let leafGeo = null;
function mapleGeometry() {
  if (leafGeo) return leafGeo;
  const nums = MAPLE.replace(/[MLZ]/g, " ").trim().split(/[\s,]+/).map(Number);
  const shape = new THREE.Shape();
  for (let i = 0; i < nums.length; i += 2) {
    const x = (nums[i] - 50) / 100, y = -(nums[i + 1] - 50) / 100;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  leafGeo = new THREE.ShapeGeometry(shape, 4);
  leafGeo.center();
  return leafGeo;
}

export const LEAF_COLORS = [0xb34a22, 0x8e2f1e, 0xc48a2a, 0x7a2a16, 0xa8661f];

/** A maple leaf about `size` across, its face in the xy plane, dished. */
export function leaf(size, color, curl = 0.2) {
  const geo = mapleGeometry().clone();
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, curl * (x * x + y * y) + 0.3 * curl * x * y);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.7, side: THREE.DoubleSide }));
  m.scale.setScalar(size);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
