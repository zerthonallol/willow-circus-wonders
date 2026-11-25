// @ts-nocheck -- instanced colour buffers are created on first setColorAt
import * as THREE from "three";
import { signTexture } from "./textures";

// "Grand Big Top": a round striped circus tent with tiered bleachers, a sawdust
// ring, king poles, trapeze rigging, sweeping follow-spots, a bulb-lit marquee
// entrance and painted animal wagons. Purely visual; collisions live in the grid.
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const GOLD = "#d8a83a";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")!] as const;
}
function tex(c: HTMLCanvasElement, rx = 1, ry = 1) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function weather(g: CanvasRenderingContext2D, w: number, h: number, k = 1) {
  for (let i = 0; i < 700 * k; i++) {
    g.fillStyle = `rgba(30,12,6,${Math.random() * 0.12})`;
    g.fillRect(Math.random() * w, Math.random() * h, rnd(1, 3), rnd(4, 22));
  }
  const gr = g.createLinearGradient(0, h * 0.7, 0, h);
  gr.addColorStop(0, "rgba(25,10,4,0)"); gr.addColorStop(1, "rgba(25,10,4,0.6)");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}

/** Canvas circus cloth: wide vertical stripes, gold rope trim and stars. */
export function circusCanvasTexture(a = "#b0141e", b = "#f1e3bf") {
  const [c, g] = canvas(512, 512);
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 64, 0, 64, 512); }
  // stitched seams
  g.strokeStyle = "rgba(60,20,10,0.35)"; g.setLineDash([6, 6]);
  for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 512); g.stroke(); }
  g.setLineDash([]);
  // gold scalloped valance with tassels
  g.fillStyle = GOLD; g.fillRect(0, 0, 512, 30);
  for (let i = 0; i < 16; i++) { g.beginPath(); g.arc(i * 32 + 16, 30, 16, 0, Math.PI); g.fill(); g.fillRect(i * 32 + 15, 44, 2, 14); g.beginPath(); g.arc(i * 32 + 16, 60, 4, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "#6b0d10"; g.fillRect(0, 6, 512, 5);
  // stars on cream stripes
  g.fillStyle = "rgba(216,168,58,0.85)";
  for (let i = 1; i < 8; i += 2) for (const y of [180, 330]) {
    const x = i * 64 + 32; g.beginPath();
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 6 : 14, an = (k / 10) * Math.PI * 2 - Math.PI / 2; g.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r); }
    g.fill();
  }
  g.fillStyle = "#3a0a08"; g.fillRect(0, 474, 512, 38);
  weather(g, 512, 512);
  return tex(c);
}
function radial(a: string, b: string, n: number) {
  const [c, g] = canvas(1024, 512);
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect((i * 1024) / n, 0, 1024 / n + 1, 512); }
  weather(g, 1024, 512, 0.6);
  return tex(c);
}
function sawdustTex() {
  const [c, g] = canvas(512, 512);
  g.fillStyle = "#8a5f33"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `hsla(${rnd(25, 40)},${rnd(35, 60)}%,${rnd(25, 55)}%,0.6)`; g.fillRect(Math.random() * 512, Math.random() * 512, rnd(1, 3), rnd(1, 3)); }
  g.strokeStyle = "rgba(240,210,150,0.35)"; g.lineWidth = 10;
  g.beginPath(); g.arc(256, 256, 200, 0, Math.PI * 2); g.stroke();
  return tex(c);
}
function woodTex(base = "#4a2a16") {
  const [c, g] = canvas(256, 256);
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 32) { g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(0, y, 256, 2); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,220,170,${Math.random() * 0.06})`; g.fillRect(Math.random() * 256, y + Math.random() * 30, rnd(20, 90), 1); } }
  return tex(c);
}
function wagonTex(name: string) {
  const [c, g] = canvas(512, 256);
  g.fillStyle = "#7a0f14"; g.fillRect(0, 0, 512, 256);
  g.strokeStyle = GOLD; g.lineWidth = 10; g.strokeRect(14, 14, 484, 228);
  g.lineWidth = 3; g.strokeRect(30, 30, 452, 196);
  g.fillStyle = GOLD; g.font = "bold 54px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(name, 256, 128);
  for (const [x, y] of [[50, 50], [462, 50], [50, 206], [462, 206]]) { g.beginPath(); g.arc(x, y, 12, 0, Math.PI * 2); g.fill(); }
  weather(g, 512, 256);
  return tex(c);
}

export interface BigTopOpts {
  center: THREE.Vector3;   // ring centre (world)
  radius: number;          // tent wall radius
  wallH: number;
  poles: THREE.Vector3[];  // king pole positions
  cages: THREE.Vector3[];  // animal wagon cells
  bounds: { w: number; d: number };
  lite?: boolean;
}

export function buildBigTop(scene: THREE.Scene, o: BigTopOpts) {
  const anim: ((t: number, dt: number) => void)[] = [];
  const root = new THREE.Group();
  root.position.copy(o.center).setY(0);
  scene.add(root);
  const R = o.radius, wallTop = o.wallH + 1.6, peak = 17;
  const gold = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.75, roughness: 0.3 });
  const iron = new THREE.MeshStandardMaterial({ color: "#2a2624", metalness: 0.7, roughness: 0.5 });
  const dummy = new THREE.Object3D();

  // ---------- tent wall with four entrances ----------
  const gap = 0.27; // half-angle of each doorway
  const wallTex = circusCanvasTexture(); wallTex.repeat.set(2, 1);
  const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, side: THREE.DoubleSide, roughness: 0.92 });
  for (let k = 0; k < 4; k++) {
    const start = k * Math.PI / 2 + gap, len = Math.PI / 2 - gap * 2;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(R, R, wallTop, 24, 1, true, start, len), wallMat);
    seg.position.y = wallTop / 2; seg.castShadow = seg.receiveShadow = true;
    root.add(seg);
  }
  // doorway awnings + curtains + marquee frames
  for (let k = 0; k < 4; k++) {
    const th = k * Math.PI / 2, dir = new THREE.Vector3(Math.sin(th), 0, Math.cos(th));
    const door = new THREE.Group();
    door.position.copy(dir.clone().multiplyScalar(R)); door.rotation.y = th;
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(R * gap * 2 + 0.6, 0.5, 0.5), gold);
    lintel.position.y = wallTop - 0.25; door.add(lintel);
    const top = new THREE.Mesh(new THREE.BoxGeometry(R * gap * 2 + 0.4, wallTop - o.wallH + 0.2, 0.2), wallMat);
    top.position.y = (wallTop + o.wallH) / 2 + 0.6; door.add(top);
    for (const s of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, wallTop, 10), gold);
      post.position.set(s * (R * gap + 0.2), wallTop / 2, 0); door.add(post);
      // drawn-back velvet curtain
      const cur = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.65, wallTop - 0.4, 10, 1, false), new THREE.MeshStandardMaterial({ color: "#5a0610", roughness: 0.7 }));
      cur.position.set(s * (R * gap - 0.45), (wallTop - 0.4) / 2, 0.2); door.add(cur);
    }
    // awning
    const aw = new THREE.Mesh(new THREE.CylinderGeometry(0.01, R * gap + 0.6, 1.6, 12, 1, true, Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ map: radial("#b0141e", "#f1e3bf", 12), side: THREE.DoubleSide }));
    aw.rotation.x = Math.PI / 2; aw.scale.set(1, 1, 0.45); aw.position.set(0, wallTop + 0.1, 0.7); door.add(aw);
    root.add(door);
  }

  // ---------- canopy: main cone + scalloped valance + peak ----------
  const canopyMat = new THREE.MeshStandardMaterial({ map: radial("#a3121b", "#efdfb6", 32), side: THREE.DoubleSide, roughness: 0.85 });
  // slightly concave roof: two stacked cones
  const lower = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.45, R + 0.6, (peak - wallTop) * 0.45, 32, 1, true), canopyMat);
  lower.position.y = wallTop + (peak - wallTop) * 0.225; root.add(lower);
  const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.5, R * 0.45, (peak - wallTop) * 0.55, 32, 1, true), canopyMat);
  upper.position.y = wallTop + (peak - wallTop) * 0.45 + (peak - wallTop) * 0.275; root.add(upper);
  const valance = new THREE.InstancedMesh(new THREE.CircleGeometry(0.55, 10, 0, Math.PI), new THREE.MeshStandardMaterial({ color: GOLD, side: THREE.DoubleSide, metalness: 0.4, roughness: 0.5 }), 64);
  for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2; dummy.position.set(Math.sin(a) * (R + 0.62), wallTop + 0.02, Math.cos(a) * (R + 0.62)); dummy.rotation.set(Math.PI, a, 0); dummy.updateMatrix(); valance.setMatrixAt(i, dummy.matrix); }
  root.add(valance);
  dummy.rotation.set(0, 0, 0);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12), gold); finial.position.y = peak + 0.5; root.add(finial);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3, 6), gold); mast.position.y = peak + 2; root.add(mast);
  const pennant = new THREE.Mesh(new THREE.PlaneGeometry(2, 1, 8, 1), new THREE.MeshStandardMaterial({ color: "#e0222c", side: THREE.DoubleSide }));
  pennant.position.set(1, peak + 3, 0); root.add(pennant);
  const pp = pennant.geometry.attributes.position, base = Float32Array.from(pp.array);
  anim.push((t) => { for (let i = 0; i < pp.count; i++) { const x = base[i * 3]; pp.setZ(i, Math.sin(t * 5 + x * 3) * 0.25 * (x + 1)); } pp.needsUpdate = true; });

  // guy ropes from the rim down to stakes outside
  const ropeMat = new THREE.LineBasicMaterial({ color: "#3a3024" });
  const ropes: THREE.Vector3[] = [];
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2 + 0.13; ropes.push(new THREE.Vector3(Math.sin(a) * (R + 0.5), wallTop, Math.cos(a) * (R + 0.5)), new THREE.Vector3(Math.sin(a) * (R + 4), 0, Math.cos(a) * (R + 4))); }
  root.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ropes), ropeMat));

  // ---------- inside: sawdust ring, curb, bleachers ----------
  const ringR = 7.2;
  const ring = new THREE.Mesh(new THREE.CircleGeometry(ringR, 64), new THREE.MeshStandardMaterial({ map: sawdustTex(), roughness: 1 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.015; ring.receiveShadow = true; root.add(ring);
  const arena = new THREE.Mesh(new THREE.RingGeometry(ringR, R, 64), new THREE.MeshStandardMaterial({ color: "#3a1d10", roughness: 0.95 }));
  arena.rotation.x = -Math.PI / 2; arena.position.y = 0.012; root.add(arena);
  const curb = new THREE.Mesh(new THREE.TorusGeometry(ringR, 0.28, 10, 96), new THREE.MeshStandardMaterial({ map: radial("#c0141e", "#f4e6c4", 48), roughness: 0.55 }));
  curb.rotation.x = -Math.PI / 2; curb.position.y = 0.2; root.add(curb);
  const goldRim = new THREE.Mesh(new THREE.TorusGeometry(ringR + 0.3, 0.06, 6, 96), gold);
  goldRim.rotation.x = -Math.PI / 2; goldRim.position.y = 0.4; root.add(goldRim);
  // painted star in the ring
  const star = new THREE.Shape();
  for (let k = 0; k < 10; k++) { const r = k % 2 ? 1.2 : 3, a = (k / 10) * Math.PI * 2; const f = k ? star.lineTo.bind(star) : star.moveTo.bind(star); f(Math.sin(a) * r, Math.cos(a) * r); }
  const starM = new THREE.Mesh(new THREE.ShapeGeometry(star), new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.6, metalness: 0.3 }));
  starM.rotation.x = -Math.PI / 2; starM.position.y = 0.02; root.add(starM);

  // tiered bleachers in the four quarters (on top of the solid wall band)
  const seatMat = new THREE.MeshStandardMaterial({ map: woodTex(), roughness: 0.9 });
  const riserMat = new THREE.MeshStandardMaterial({ color: "#1a0d08", roughness: 1 });
  const seatColors = ["#8e1018", "#1f4d9a", "#8e1018", "#1f4d9a"];
  for (let k = 0; k < 4; k++) {
    const start = k * Math.PI / 2 + gap + 0.05, len = Math.PI / 2 - gap * 2 - 0.1;
    for (let tier = 0; tier < 4; tier++) {
      const r0 = R - 2.6 + tier * 0.62, h = 0.35 + tier * 0.45;
      const riser = new THREE.Mesh(new THREE.CylinderGeometry(r0 + 0.62, r0 + 0.62, h, 24, 1, true, start, len), riserMat);
      riser.position.y = h / 2; root.add(riser);
      const seat = new THREE.Mesh(new THREE.RingGeometry(r0, r0 + 0.62, 24, 1, start - Math.PI / 2, len), tier % 2 ? seatMat : new THREE.MeshStandardMaterial({ color: seatColors[k], roughness: 0.7 }));
      seat.rotation.x = -Math.PI / 2; seat.rotation.z = Math.PI; seat.position.y = h; root.add(seat);
    }
    // front rail with red velvet skirt
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(R - 2.65, R - 2.65, 0.9, 24, 1, true, start, len), new THREE.MeshStandardMaterial({ map: radial("#7a0a12", "#5a0610", 40), side: THREE.DoubleSide }));
    skirt.position.y = 0.45; root.add(skirt);
  }
  // abandoned props in the stands: popcorn tubs and a fallen hoop
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2; if ((a % (Math.PI / 2)) < gap + 0.1 || (a % (Math.PI / 2)) > Math.PI / 2 - gap - 0.1) continue;
    const tub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.28, 10), new THREE.MeshStandardMaterial({ map: radial("#d81f26", "#ffffff", 8) }));
    const tr = R - 2.3 + Math.floor(rnd(0, 4)) * 0.62; const th = 0.35 + Math.round((tr - (R - 2.3)) / 0.62) * 0.45;
    tub.position.set(Math.sin(a) * tr, th + 0.14, Math.cos(a) * tr); root.add(tub);
  }

  // ---------- king poles, rigging, trapeze ----------
  const poleTex = radial("#c0141e", "#f4e6c4", 6); poleTex.repeat.set(1, 6); poleTex.rotation = 0.6;
  const poleMat = new THREE.MeshStandardMaterial({ map: poleTex, roughness: 0.5 });
  const localPoles = o.poles.map((p) => p.clone().sub(root.position).setY(0));
  for (const p of localPoles) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, peak - 1.2, 12), poleMat);
    pole.position.set(p.x, (peak - 1.2) / 2, p.z); pole.castShadow = true; root.add(pole);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.9, 20), new THREE.MeshStandardMaterial({ map: radial("#1f4d9a", "#f0c84a", 12), roughness: 0.6 }));
    drum.position.set(p.x, 0.45, p.z); root.add(drum);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.08, 20), gold); cap.position.set(p.x, 0.93, p.z); root.add(cap);
    // trapeze platform
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 16), iron); plat.position.set(p.x, 9.5, p.z); root.add(plat);
    const rail = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.03, 4, 24), gold); rail.rotation.x = Math.PI / 2; rail.position.set(p.x, 10.3, p.z); root.add(rail);
  }
  if (localPoles.length >= 2) {
    const [a, b] = localPoles;
    // tightrope between platforms
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a.x, 9.6, a.z), new THREE.Vector3((a.x + b.x) / 2, 9.35, (a.z + b.z) / 2), new THREE.Vector3(b.x, 9.6, b.z)]), new THREE.LineBasicMaterial({ color: "#d8c8a0" })));
    // swinging trapeze between them
    const tz = new THREE.Group(); tz.position.set((a.x + b.x) / 2, 13, (a.z + b.z) / 2 + 1.5);
    const ropeGeo = new THREE.CylinderGeometry(0.02, 0.02, 4, 4);
    for (const s of [-0.6, 0.6]) { const rp = new THREE.Mesh(ropeGeo, new THREE.MeshStandardMaterial({ color: "#d8c8a0" })); rp.position.set(s, -2, 0); tz.add(rp); }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 6), gold); bar.rotation.z = Math.PI / 2; bar.position.y = -4; tz.add(bar);
    root.add(tz);
    anim.push((t) => { tz.rotation.x = Math.sin(t * 0.9) * 0.45; });
    // safety net, sagging and torn
    const net = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(b.x - a.x) + 2, 4, 14, 6), new THREE.MeshBasicMaterial({ color: "#6a5a48", wireframe: true, transparent: true, opacity: 0.5 }));
    const np = net.geometry.attributes.position; for (let i = 0; i < np.count; i++) np.setZ(i, -Math.cos((np.getX(i) / (Math.abs(b.x - a.x) / 2 + 1)) * Math.PI / 2) * 0.6);
    net.rotation.x = -Math.PI / 2; net.position.set((a.x + b.x) / 2, 3.6, (a.z + b.z) / 2); root.add(net);
  }

  // ---------- light strings from the peak to the rim ----------
  const bulbs: THREE.Vector3[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    for (let k = 1; k <= 14; k++) { const f = k / 14; const r = (R - 0.4) * f; bulbs.push(new THREE.Vector3(Math.sin(a) * r, peak - 1.5 - f * (peak - 1.5 - wallTop + 0.3) - Math.sin(f * Math.PI) * 1.2, Math.cos(a) * r)); }
  }
  // rim garland
  for (let i = 0; i < 96; i++) { const a = (i / 96) * Math.PI * 2; bulbs.push(new THREE.Vector3(Math.sin(a) * (R + 0.7), wallTop - 0.3, Math.cos(a) * (R + 0.7))); }
  const bulbMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 6, 4), new THREE.MeshBasicMaterial({ toneMapped: false }), bulbs.length);
  const warm = new THREE.Color("#ffcd70").multiplyScalar(2.4), red = new THREE.Color("#ff4a3a").multiplyScalar(2), off = new THREE.Color("#160c06");
  bulbs.forEach((p, i) => { dummy.position.copy(p); dummy.updateMatrix(); bulbMesh.setMatrixAt(i, dummy.matrix); bulbMesh.setColorAt(i, warm); });
  root.add(bulbMesh);
  let chase = 0;
  anim.push((_, dt) => {
    chase += dt * 7;
    for (let i = 0; i < bulbs.length; i++) bulbMesh.setColorAt(i, (i + Math.floor(chase)) % 5 === 0 ? (Math.random() < 0.1 ? off : red) : Math.random() < 0.004 ? off : warm);
    bulbMesh.instanceColor.needsUpdate = true;
  });

  // ---------- lights: warm wash + sweeping follow-spots ----------
  const wash = new THREE.PointLight("#ffb070", o.lite ? 0 : 40, R * 1.6, 1.6); wash.position.y = 11; root.add(wash);
  const spotCols = ["#fff1d0", "#ff5a6a", "#6ac8ff"];
  const spots = spotCols.slice(0, o.lite ? 1 : 3).map((col, i) => {
    const s = new THREE.SpotLight(col, 140, 40, 0.16, 0.5, 1.2);
    const a = (i / 3) * Math.PI * 2;
    s.position.set(Math.sin(a) * (R - 2), 13, Math.cos(a) * (R - 2));
    root.add(s, s.target);
    return s;
  });
  // visible light cones
  const coneMat = new THREE.MeshBasicMaterial({ color: "#fff0c8", transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const cones = spots.map((s) => { const c = new THREE.Mesh(new THREE.ConeGeometry(2.2, 13, 20, 1, true), coneMat.clone()); (c.material as THREE.MeshBasicMaterial).color.copy(s.color); root.add(c); return c; });
  anim.push((t) => {
    spots.forEach((s, i) => {
      const a = t * (0.25 + i * 0.07) + i * 2.1;
      s.target.position.set(Math.sin(a) * (3 + Math.sin(t * 0.3 + i) * 2.5), 0, Math.cos(a * 1.3) * (3 + Math.cos(t * 0.4) * 2));
      s.intensity = Math.random() < 0.015 ? 10 : 140;
      const c = cones[i], mid = s.position.clone().lerp(s.target.position, 0.5);
      c.position.copy(mid); c.lookAt(s.target.position); c.rotateX(-Math.PI / 2);
      c.scale.y = s.position.distanceTo(s.target.position) / 13;
    });
    wash.intensity = o.lite ? 0 : 36 + Math.sin(t * 1.7) * 6;
  });

  // ---------- marquee arch at the south entrance ----------
  const mq = new THREE.Group();
  mq.position.set(0, 0, R + 2.4);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ map: signTexture("BIG TOP", "#ffc24a"), toneMapped: false, fog: false }));
  sign.position.y = wallTop + 2.1; mq.add(sign);
  const board = new THREE.Mesh(new THREE.BoxGeometry(8.6, 2.6, 0.2), new THREE.MeshStandardMaterial({ color: "#4a0a10", roughness: 0.6 }));
  board.position.set(0, wallTop + 2.1, -0.15); mq.add(board);
  const mBulbs: THREE.Vector3[] = [];
  for (let i = 0; i < 26; i++) { const t = i / 25; mBulbs.push(new THREE.Vector3(-4.3 + t * 8.6, wallTop + 3.4, 0.05), new THREE.Vector3(-4.3 + t * 8.6, wallTop + 0.8, 0.05)); }
  const mbm = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 6, 4), new THREE.MeshBasicMaterial({ toneMapped: false }), mBulbs.length);
  mBulbs.forEach((p, i) => { dummy.position.copy(p); dummy.updateMatrix(); mbm.setMatrixAt(i, dummy.matrix); mbm.setColorAt(i, warm); });
  mq.add(mbm);
  anim.push((t) => { for (let i = 0; i < mBulbs.length; i++) mbm.setColorAt(i, (Math.floor(t * 6) + (i >> 1)) % 3 === 0 ? off : warm); mbm.instanceColor.needsUpdate = true; });
  for (const s of [-1, 1]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, wallTop + 3.6, 12), poleMat);
    col.position.set(s * 4.6, (wallTop + 3.6) / 2, 0); mq.add(col);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), gold); ball.position.set(s * 4.6, wallTop + 3.9, 0); mq.add(ball);
  }
  const mqLight = new THREE.PointLight("#ffb050", o.lite ? 0 : 18, 14, 2); mqLight.position.set(0, wallTop + 1, 2); mq.add(mqLight);
  root.add(mq);

  // ---------- animal wagons (cage cells) ----------
  const names = ["LIONS", "BEAR", "TIGER", "APES", "WOLVES"];
  const eyeMat = new THREE.MeshBasicMaterial({ color: "#ffd040", toneMapped: false });
  const barMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.8, roughness: 0.35 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: "#c8a030", metalness: 0.4, roughness: 0.5 });
  o.cages.forEach((p, i) => {
    const w = new THREE.Group(); w.position.copy(p).setY(0);
    w.rotation.y = p.z > o.bounds.d / 2 ? Math.PI : 0;
    const floor = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.3, 2.4), new THREE.MeshStandardMaterial({ map: wagonTex(names[i % names.length]) }));
    floor.position.y = 0.75; w.add(floor);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.35, 2.6), new THREE.MeshStandardMaterial({ map: wagonTex(names[(i + 1) % names.length]) }));
    roof.position.y = 3.2; w.add(roof);
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.3, 0.1), new THREE.MeshStandardMaterial({ map: wagonTex("~"), roughness: 0.8 }));
    back.position.set(0, 1.95, -1.15); w.add(back);
    const bars = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.04, 0.04, 2.3, 6), barMat, 22);
    let n = 0;
    for (let k = 0; k < 11; k++) { dummy.position.set(-1.35 + k * 0.27, 1.95, 1.15); dummy.updateMatrix(); bars.setMatrixAt(n++, dummy.matrix); }
    for (let k = 0; k < 11; k++) { const s = k < 6 ? -1 : 1; dummy.position.set(s * 1.35, 1.95, -1.0 + (k % 6) * 0.4); dummy.updateMatrix(); bars.setMatrixAt(n++, dummy.matrix); }
    w.add(bars);
    for (const [x, z] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      const wh = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.08, 6, 16), wheelMat);
      wh.rotation.y = Math.PI / 2; wh.position.set(x * 1.45, 0.5, z * 0.85); w.add(wh);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), wheelMat); hub.rotation.z = Math.PI / 2; hub.position.copy(wh.position); w.add(hub);
    }
    // something still lives inside: two eyes that blink
    if (i % 2 === 0) {
      const eyes = new THREE.Group();
      for (const s of [-0.12, 0.12]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), eyeMat); e.position.set(s, 0, 0); eyes.add(e); }
      eyes.position.set(rnd(-0.8, 0.8), 1.4, -0.6); w.add(eyes);
      const ph = Math.random() * 10;
      anim.push((t) => { eyes.visible = Math.sin(t * 0.7 + ph) > -0.6 && (t * 3 + ph) % 4 > 0.15; eyes.position.x = Math.sin(t * 0.3 + ph) * 0.8; });
    }
    scene.add(w);
  });

  // ---------- outer bunting from the peak towards the park corners ----------
  const flagG = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.28, 0, 0), new THREE.Vector3(0.28, 0, 0), new THREE.Vector3(0, -0.6, 0)]);
  const fpts: { p: THREE.Vector3; ry: number }[] = [];
  const peakW = root.position.clone().setY(peak - 1);
  for (const [x, z] of [[2, 2], [o.bounds.w - 2, 2], [2, o.bounds.d - 2], [o.bounds.w - 2, o.bounds.d - 2], [o.center.x, o.bounds.d - 2], [o.center.x, 2]]) {
    const b = new THREE.Vector3(x, o.wallH + 0.5, z);
    const n = Math.floor(peakW.distanceTo(b) / 0.8), ry = Math.atan2(b.x - peakW.x, b.z - peakW.z) + Math.PI / 2;
    for (let i = 3; i <= n; i++) { const t = i / n; const p = peakW.clone().lerp(b, t); p.y -= Math.sin(t * Math.PI) * 2; fpts.push({ p, ry }); }
  }
  const fl = new THREE.InstancedMesh(flagG, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), fpts.length);
  const pal = ["#c8202a", "#f0c84a", "#1f4d9a", "#efe4c8", "#2a8a4a"].map((c) => new THREE.Color(c).multiplyScalar(0.6));
  fpts.forEach(({ p, ry }, i) => { dummy.position.copy(p); dummy.rotation.set(0, ry, 0); dummy.updateMatrix(); fl.setMatrixAt(i, dummy.matrix); fl.setColorAt(i, pal[i % pal.length]); });
  scene.add(fl);

  // ---------- small side tents and a carousel beyond the fence ----------
  const sideTent = (x: number, z: number, r: number, h: number, a: string, b: string) => {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16, 1, true), new THREE.MeshStandardMaterial({ map: radial(a, b, 16), side: THREE.DoubleSide }));
    wall.position.y = h / 2;
    const roofM = new THREE.Mesh(new THREE.ConeGeometry(r * 1.15, h, 16, 1, true), new THREE.MeshStandardMaterial({ map: radial(a, b, 16), side: THREE.DoubleSide }));
    roofM.position.y = h * 1.5;
    const tip = new THREE.Mesh(new THREE.SphereGeometry(r * 0.07, 8, 6), gold); tip.position.y = h * 2;
    g.add(wall, roofM, tip); scene.add(g);
  };
  sideTent(-14, o.bounds.d * 0.3, 7, 5, "#1f4d9a", "#efe4c8");
  sideTent(-16, o.bounds.d * 0.8, 8, 6, "#a3121b", "#f0c84a");
  sideTent(o.bounds.w + 14, o.bounds.d * 0.35, 7, 5, "#2f7a3a", "#efe4c8");
  sideTent(o.bounds.w * 0.3, -18, 9, 6, "#a3121b", "#efe4c8");
  sideTent(o.bounds.w * 0.8, o.bounds.d + 16, 6, 4.5, "#5a1f7a", "#f0c84a");
  const car = new THREE.Group(); car.position.set(o.bounds.w * 0.25, 0, o.bounds.d + 18);
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 0.6, 24), new THREE.MeshStandardMaterial({ color: "#5a2a14" })); deck.position.y = 0.3;
  const ctop = new THREE.Mesh(new THREE.ConeGeometry(7, 3, 24, 1, true), new THREE.MeshStandardMaterial({ map: radial("#b3121b", "#f2d36b", 24), side: THREE.DoubleSide })); ctop.position.y = 6.5;
  const spin = new THREE.Group();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.5, 6), gold); p.position.set(Math.cos(a) * 4.5, 2.9, Math.sin(a) * 4.5); const h = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 1.4), new THREE.MeshStandardMaterial({ color: i % 2 ? "#e8e0d0" : "#3a2418" })); h.position.set(Math.cos(a) * 4.5, 1.8, Math.sin(a) * 4.5); h.rotation.y = -a; spin.add(p, h); }
  car.add(deck, ctop, spin); scene.add(car);
  anim.push((t, dt) => { spin.rotation.y += dt * 0.12; spin.children.forEach((c, i) => { if (i % 2) c.position.y = 1.8 + Math.sin(t * 1.5 + i) * 0.3; }); });

  return { update: (t: number, dt: number) => anim.forEach((f) => f(t, dt)) };
}
