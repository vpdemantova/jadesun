import * as THREE from './vendor/three.module.min.js';

const PI = Math.PI;
const mats = new Map();
function mat(cor, extra) {
  const k = cor + (extra ? JSON.stringify(extra) : '');
  if (!mats.has(k)) mats.set(k, new THREE.MeshLambertMaterial(Object.assign({ color: cor, flatShading: true }, extra || {})));
  return mats.get(k);
}
const DUPLA = { side: THREE.DoubleSide };

function mulberry(seed) {
  let a = seed >>> 0;
  return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function cil(r0, r1, h, seg, m) {
  const g = new THREE.CylinderGeometry(r1, r0, h, seg);
  g.translate(0, h / 2, 0);
  const o = new THREE.Mesh(g, m);
  o.castShadow = true;
  return o;
}
function esf(r, m, det) {
  const o = new THREE.Mesh(new THREE.IcosahedronGeometry(r, det == null ? 1 : det), m);
  o.castShadow = true;
  return o;
}
function folha(comp, larg, m, curva) {
  const g = new THREE.PlaneGeometry(larg, comp, 1, 5);
  g.translate(0, comp / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = p.getY(i) / comp;
    p.setX(i, p.getX(i) * Math.max(0.06, Math.sin(PI * Math.min(1, 0.06 + 0.94 * t))));
    p.setZ(i, t * t * comp * (curva == null ? 0.25 : curva));
  }
  g.computeVertexNormals();
  const o = new THREE.Mesh(g, m || mat(0x4f8a34, DUPLA));
  o.castShadow = true;
  return o;
}
function pivo(filho, rx, ry, rz, y) {
  const g = new THREE.Group();
  g.add(filho);
  g.rotation.set(rx || 0, ry || 0, rz || 0);
  if (y) g.position.y = y;
  return g;
}

/* ---------- espécies ---------- */
const CONSTRUTORES = {
  girassol(rnd) {
    const c = new THREE.Group(), flores = [];
    c.add(cil(0.035, 0.028, 2.0, 6, mat(0x5c8a3a)));
    for (let i = 0; i < 7; i++) c.add(pivo(pivo(folha(0.55, 0.34, mat(0x4f8a34, DUPLA)), 1.0, 0, 0), 0, i * 2.4, 0, 0.3 + i * 0.22));
    const cab = new THREE.Group();
    cab.position.y = 2.0;
    cab.rotation.x = PI / 2 - 0.5;
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.07, 24), mat(0x4a2c14));
    cab.add(disco);
    for (let i = 0; i < 26; i++) {
      const pt = folha(0.24, 0.1, mat(0xf2b91f, DUPLA), 0.05);
      pt.rotation.x = PI / 2;
      pt.position.z = 0.33;
      const pv = new THREE.Group();
      pv.add(pt);
      pv.rotation.y = i / 26 * PI * 2;
      pv.position.y = 0.02;
      cab.add(pv);
    }
    const sem = new THREE.InstancedMesh(new THREE.SphereGeometry(0.014, 5, 4), mat(0x2b170a), 170);
    const d = new THREE.Object3D();
    for (let n = 0; n < 170; n++) {
      const r = 0.026 * Math.sqrt(n + 0.5), a = n * 137.508 * PI / 180;
      d.position.set(r * Math.cos(a), 0.04, r * Math.sin(a));
      d.updateMatrix();
      sem.setMatrixAt(n, d.matrix);
    }
    cab.add(sem);
    c.add(cab);
    flores.push(cab);
    return { corpo: c, flores, altura: 2.3, raio: 0.7 };
  },

  papiro(rnd) {
    const c = new THREE.Group();
    const verde = mat(0x6fa64a);
    const fio = new THREE.LineBasicMaterial({ color: 0x9bd05a });
    for (let i = 0; i < 9; i++) {
      const h = 2.0 + (i % 3) * 0.3 + rnd() * 0.2;
      const s = new THREE.Group();
      s.add(cil(0.024, 0.012, h, 5, verde));
      const pts = [];
      for (let k = 0; k < 26; k++) {
        const a = k / 26 * PI * 2, r = 0.32 + rnd() * 0.1;
        pts.push(0, h, 0, Math.cos(a) * r * 0.55, h + 0.14, Math.sin(a) * r * 0.55, Math.cos(a) * r * 0.55, h + 0.14, Math.sin(a) * r * 0.55, Math.cos(a) * r, h - 0.1, Math.sin(a) * r);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      s.add(new THREE.LineSegments(g, fio));
      const a = i / 9 * PI * 2;
      s.position.set(Math.cos(a) * (0.12 + rnd() * 0.2), 0, Math.sin(a) * (0.12 + rnd() * 0.2));
      s.rotation.set((rnd() - 0.5) * 0.25, 0, (rnd() - 0.5) * 0.25);
      c.add(s);
    }
    return { corpo: c, flores: [], altura: 2.6, raio: 0.7 };
  },

  'pau-brasil'(rnd) {
    const c = new THREE.Group(), flores = [];
    c.add(cil(0.2, 0.12, 3.0, 7, mat(0x7b3f2a)));
    const verde = [mat(0x3f7d3a), mat(0x4a8a3f), mat(0x35703a)];
    const copa = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const b = esf(0.9 + rnd() * 0.5, verde[i % 3]);
      b.position.set((rnd() - 0.5) * 1.3, 3.1 + rnd() * 0.9, (rnd() - 0.5) * 1.3);
      b.scale.y = 0.75;
      copa.add(b);
    }
    c.add(copa);
    const fl = new THREE.Group();
    for (let i = 0; i < 26; i++) {
      const b = esf(0.07, mat(0xf6c445), 0);
      const a = rnd() * PI * 2, e = rnd() * 1.1, r = 1.35;
      b.position.set(Math.cos(a) * Math.cos(e) * r, 3.6 + Math.sin(e) * r * 0.55, Math.sin(a) * Math.cos(e) * r);
      fl.add(b);
    }
    c.add(fl);
    flores.push(fl);
    return { corpo: c, flores, altura: 4.8, raio: 1.6 };
  },

  araucaria(rnd) {
    const c = new THREE.Group();
    c.add(cil(0.2, 0.11, 5.0, 7, mat(0x5b4030)));
    const verde = mat(0x2f6b46), verde2 = mat(0x3c7c50);
    for (let k = 0; k < 6; k++) {
      const y = 2.3 + k * 0.5, len = 1.5 - k * 0.12;
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * PI * 2 + k * 0.5;
        const ramo = cil(0.035, 0.02, len, 5, mat(0x5b4030));
        const pv = pivo(ramo, 0, 0, -1.15);
        const g = new THREE.Group();
        g.add(pv);
        const tufo = esf(0.2, k % 2 ? verde : verde2);
        tufo.scale.set(1.3, 0.55, 1.3);
        tufo.position.set(Math.cos(1.15 - PI / 2 + PI / 2) * 0, 0, 0);
        tufo.position.set(len * Math.sin(1.15), len * Math.cos(1.15), 0);
        g.add(tufo);
        g.rotation.y = a;
        g.position.y = y;
        c.add(g);
      }
    }
    const topo = esf(0.95, verde);
    topo.scale.set(1.6, 0.5, 1.6);
    topo.position.y = 5.2;
    c.add(topo);
    return { corpo: c, flores: [], altura: 5.6, raio: 1.8 };
  },

  lavanda(rnd) {
    const c = new THREE.Group(), flores = [];
    const cinza = mat(0x7f9a78, DUPLA);
    for (let i = 0; i < 12; i++) {
      const f = folha(0.34, 0.03, cinza, 0.3);
      c.add(pivo(f, 0.55 + rnd() * 0.3, rnd() * PI * 2, 0, 0.02));
    }
    const fl = new THREE.Group();
    for (let i = 0; i < 20; i++) {
      const a = rnd() * PI * 2, r = rnd() * 0.32, h = 0.5 + rnd() * 0.22;
      const g = new THREE.Group();
      g.add(cil(0.006, 0.005, h, 4, mat(0x7f9a78)));
      const esp = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.12, 3, 6), mat(0x8f6bd6));
      esp.position.y = h + 0.03;
      esp.castShadow = true;
      g.add(esp);
      g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      g.rotation.set((rnd() - 0.5) * 0.35, 0, (rnd() - 0.5) * 0.35);
      fl.add(g);
    }
    c.add(fl);
    flores.push(fl);
    return { corpo: c, flores, altura: 0.8, raio: 0.5 };
  },

  'vitoria-regia'(rnd) {
    const c = new THREE.Group(), flores = [];
    const anel = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.2, 6, 28), mat(0x8a8a82));
    anel.rotation.x = PI / 2;
    anel.position.y = 0.1;
    anel.castShadow = true;
    c.add(anel);
    const agua = new THREE.Mesh(new THREE.CircleGeometry(2.0, 32), new THREE.MeshLambertMaterial({ color: 0x2c7f86, transparent: true, opacity: 0.88 }));
    agua.rotation.x = -PI / 2;
    agua.position.y = 0.09;
    c.add(agua);
    const perfil = [new THREE.Vector2(0.001, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1.03, 0.09), new THREE.Vector2(1.0, 0.16)];
    const lat = new THREE.LatheGeometry(perfil, 26);
    const pos = [[-0.7, -0.5, 1.0], [0.75, -0.4, 0.85], [0.1, 0.85, 0.9], [-0.85, 0.55, 0.62], [0.95, 0.75, 0.55]];
    pos.forEach((p, i) => {
      const pad = new THREE.Mesh(lat, mat(i % 2 ? 0x3f9a46 : 0x35893f, DUPLA));
      pad.position.set(p[0], 0.12 + i * 0.004, p[1]);
      pad.scale.set(p[2], 1, p[2]);
      pad.receiveShadow = true;
      c.add(pad);
    });
    const fl = new THREE.Group();
    for (let i = 0; i < 14; i++) {
      const pt = folha(0.3, 0.11, mat(i % 2 ? 0xffffff : 0xf3b6d8, DUPLA), 0.35);
      const pv = pivo(pt, 0.5 + (i % 2) * 0.35, i / 14 * PI * 2, 0, 0);
      fl.add(pv);
    }
    fl.position.set(0.15, 0.2, 0.05);
    c.add(fl);
    flores.push(fl);
    return { corpo: c, flores, altura: 0.6, raio: 2.1, noiteFlor: true };
  },

  sequoia(rnd) {
    const c = new THREE.Group();
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.62, 7.5, 9), mat(0x7a4a32));
    tronco.position.y = 3.75;
    tronco.castShadow = true;
    c.add(tronco);
    const copa = new THREE.Mesh(new THREE.ConeGeometry(1.9, 6.5, 9), mat(0x2f5d3a));
    copa.position.y = 5.8;
    copa.castShadow = true;
    c.add(copa);
    const copa2 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.2, 9), mat(0x3a6b44));
    copa2.position.y = 8.5;
    copa2.castShadow = true;
    c.add(copa2);
    return { corpo: c, flores: [], altura: 10, raio: 2.0 };
  },

  oliveira(rnd) {
    const c = new THREE.Group(), flores = [];
    const madeira = mat(0x6f5d48);
    const curva = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.12, 0.5, 0.05), new THREE.Vector3(-0.08, 1.0, 0.12), new THREE.Vector3(0.1, 1.5, -0.06), new THREE.Vector3(0, 1.9, 0)]);
    const tubo = new THREE.Mesh(new THREE.TubeGeometry(curva, 12, 0.15, 6, false), madeira);
    tubo.castShadow = true;
    c.add(tubo);
    for (let i = 0; i < 3; i++) {
      const g = pivo(cil(0.07, 0.03, 0.9, 5, madeira), 0, i * 2.1, 0.8, 1.4 + i * 0.1);
      c.add(g);
    }
    const verde = [mat(0x8fa07a), mat(0x7d9068), mat(0x9bab86)];
    for (let i = 0; i < 6; i++) {
      const b = esf(0.75 + rnd() * 0.3, verde[i % 3]);
      b.scale.set(1.3, 0.65, 1.3);
      b.position.set((rnd() - 0.5) * 1.3, 2.0 + rnd() * 0.6, (rnd() - 0.5) * 1.3);
      c.add(b);
    }
    const fl = new THREE.Group();
    for (let i = 0; i < 22; i++) {
      const o = esf(0.045, mat(0x33301f), 0);
      const a = rnd() * PI * 2, r = 0.5 + rnd() * 0.9;
      o.position.set(Math.cos(a) * r, 1.85 + rnd() * 0.5, Math.sin(a) * r);
      fl.add(o);
    }
    c.add(fl);
    flores.push(fl);
    return { corpo: c, flores, altura: 3.0, raio: 1.6 };
  },

  bambu(rnd) {
    const c = new THREE.Group();
    const colmo = mat(0x7a9a3a), no = mat(0xb5c46a), folhaM = mat(0x5f9a3a, DUPLA);
    for (let i = 0; i < 11; i++) {
      const h = 4.6 + rnd() * 1.6;
      const g = new THREE.Group();
      const seg = 6;
      for (let s = 0; s < seg; s++) {
        const b = cil(0.055, 0.05, h / seg, 6, colmo);
        b.position.y = s * h / seg;
        g.add(b);
        const an = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.03, 6), no);
        an.position.y = s * h / seg;
        g.add(an);
      }
      for (let k = 0; k < 6; k++) g.add(pivo(folha(0.5, 0.07, folhaM, 0.3), 0.9 + rnd() * 0.5, rnd() * PI * 2, 0, h * (0.7 + rnd() * 0.3)));
      const a = rnd() * PI * 2, r = 0.1 + rnd() * 0.55;
      g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      g.rotation.set(Math.sin(a) * 0.1, 0, -Math.cos(a) * 0.1);
      c.add(g);
    }
    return { corpo: c, flores: [], altura: 6.2, raio: 0.9 };
  },

  ipe(rnd) {
    const c = new THREE.Group(), flores = [];
    c.add(cil(0.17, 0.11, 2.8, 7, mat(0x6b5240)));
    const verde = mat(0x5b8a3f);
    const g0 = esf(1.0, verde);
    g0.position.y = 3.2;
    g0.scale.y = 0.6;
    c.add(g0);
    const fl = new THREE.Group();
    for (let i = 0; i < 60; i++) {
      const b = esf(0.19 + rnd() * 0.12, mat(i % 3 ? 0xf5c518 : 0xf9d848), 0);
      const a = rnd() * PI * 2, e = rnd() * 1.2, r = 0.9 + rnd() * 0.6;
      b.position.set(Math.cos(a) * Math.cos(e) * r * 1.2, 3.3 + Math.sin(e) * r * 0.6, Math.sin(a) * Math.cos(e) * r * 1.2);
      fl.add(b);
    }
    c.add(fl);
    flores.push(fl);
    return { corpo: c, flores, altura: 4.4, raio: 1.7 };
  },

  samambaia(rnd) {
    const c = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const f = folha(1.1, 0.24, mat(i % 2 ? 0x3f8f3f : 0x4ea04a, DUPLA), 0.65);
      const seg = new THREE.Group();
      seg.add(pivo(f, 0.75 + rnd() * 0.35, 0, 0));
      seg.rotation.y = i / 16 * PI * 2 + rnd() * 0.3;
      c.add(seg);
    }
    return { corpo: c, flores: [], altura: 0.9, raio: 0.9 };
  },

  mandacaru(rnd) {
    const c = new THREE.Group(), flores = [];
    const verde = mat(0x4c7a4a);
    c.add(cil(0.14, 0.13, 2.4, 6, verde));
    [[0.5, 1.0], [-0.6, 1.4]].forEach((b, i) => {
      const g = new THREE.Group();
      const h = cil(0.09, 0.09, 0.4, 6, verde);
      h.rotation.z = -PI / 2 * Math.sign(b[0]);
      g.add(h);
      const v = cil(0.09, 0.08, 0.9 + i * 0.2, 6, verde);
      v.position.x = 0.4 * Math.sign(b[0]);
      g.add(v);
      g.position.y = b[1];
      c.add(g);
    });
    const fl = new THREE.Group();
    const petalas = mat(0xf7f3e8, DUPLA);
    for (let i = 0; i < 10; i++) fl.add(pivo(folha(0.2, 0.06, petalas, 0.3), 0.9, i / 10 * PI * 2, 0, 0));
    fl.position.set(0, 2.4, 0.05);
    c.add(fl);
    flores.push(fl);
    return { corpo: c, flores, altura: 2.6, raio: 0.9, noiteFlor: true };
  },

  orquidea(rnd) {
    const c = new THREE.Group(), flores = [];
    for (let i = 0; i < 3; i++) c.add(pivo(folha(0.42, 0.16, mat(0x3c7a3f, DUPLA), 0.4), 0.9, i * 2.1, 0, 0.02));
    const curva = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.02, 0.4, 0), new THREE.Vector3(0.2, 0.7, 0), new THREE.Vector3(0.42, 0.72, 0)]);
    c.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 10, 0.012, 4, false), mat(0x5c8a3a)));
    const fl = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const p = curva.getPoint(0.4 + t * 0.6);
      const f = new THREE.Group();
      for (let k = 0; k < 3; k++) f.add(pivo(folha(0.07, 0.06, mat(0xf2c6e8, DUPLA), 0.2), 1.2, k * 2.09, 0, 0));
      f.position.copy(p);
      fl.add(f);
    }
    c.add(fl);
    flores.push(fl);
    return { corpo: c, flores, altura: 0.8, raio: 0.5 };
  },

  cogumelo(rnd) {
    const c = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const h = 0.1 + rnd() * 0.16, r = 0.05 + rnd() * 0.05;
      const g = new THREE.Group();
      g.add(cil(r * 0.4, r * 0.32, h, 6, mat(0xe9dcc0)));
      const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 1.6, 8, 5, 0, PI * 2, 0, PI / 2), mat(0xc99a4b));
      cap.position.y = h;
      cap.castShadow = true;
      g.add(cap);
      const a = rnd() * PI * 2, d = rnd() * 0.22;
      g.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
      g.rotation.set((rnd() - 0.5) * 0.3, 0, (rnd() - 0.5) * 0.3);
      c.add(g);
    }
    return { corpo: c, flores: [], altura: 0.3, raio: 0.35 };
  },
};

let semente = 1;
export function construir(id, seed) {
  const fn = CONSTRUTORES[id];
  if (!fn) return null;
  const rnd = mulberry(seed || (semente++ * 7919));
  const parte = fn(rnd);
  const grupo = new THREE.Group();
  const corpo = parte.corpo;
  grupo.add(corpo);

  const secas = new THREE.Group();
  const seca = mat(0x8a6a2f, DUPLA);
  for (let i = 0; i < 5; i++) {
    const f = folha(0.32, 0.14, seca, 0.5);
    const pv = pivo(f, 1.25, rnd() * PI * 2, 0, 0.02);
    const a = i / 5 * PI * 2;
    pv.position.set(Math.cos(a) * (parte.raio * 0.5 + 0.15), 0.02, Math.sin(a) * (parte.raio * 0.5 + 0.15));
    pv.visible = false;
    secas.add(pv);
  }
  grupo.add(secas);

  const alvo = { rx: 0, sy: 1 };
  function definir(o) {
    const cresc = Math.max(0, Math.min(1, o.crescimento == null ? 1 : o.crescimento));
    const k = 0.3 + 0.7 * cresc;
    const agua = o.agua == null ? 1 : o.agua;
    const seco = Math.max(0, Math.min(1, (0.35 - agua) / 0.35));
    const sway = Math.sin((o.tempo || 0) * 0.9 + grupo.position.x * 0.7) * 0.012;
    corpo.scale.set(k, k * (1 - 0.14 * seco), k);
    corpo.rotation.x = seco * 0.2 + sway;
    corpo.rotation.z = sway * 0.7;
    const noite = o.noite == null ? 0 : o.noite;
    const flor = Math.max(0, Math.min(1, o.floracao == null ? 0 : o.floracao)) * (parte.noiteFlor ? 0.25 + 0.75 * noite : 1) * (1 - 0.5 * seco);
    parte.flores.forEach((f) => { f.visible = flor > 0.03; f.scale.setScalar(Math.max(0.001, flor)); });
    const n = Math.min(5, o.secas || 0);
    secas.children.forEach((s, i) => { s.visible = i < n; });
  }
  definir({ crescimento: 1 });
  return { grupo, corpo, definir, altura: parte.altura, raio: parte.raio, flores: parte.flores };
}

export const ESPECIES_3D = Object.keys(CONSTRUTORES);
