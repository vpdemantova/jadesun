import * as THREE from './vendor/three.module.min.js';

const Ceu = window.Ceu;
const RAD = Math.PI / 180;
const RAIO = 400;

const PONTOS = [
  [30, [0.22, 0.45, 0.80], [0.70, 0.84, 0.95]],
  [10, [0.22, 0.45, 0.80], [0.72, 0.85, 0.95]],
  [3, [0.25, 0.38, 0.62], [1.00, 0.72, 0.42]],
  [-3, [0.10, 0.14, 0.34], [0.86, 0.42, 0.30]],
  [-9, [0.04, 0.06, 0.16], [0.22, 0.16, 0.24]],
  [-18, [0.010, 0.016, 0.045], [0.030, 0.042, 0.085]],
];

function mistura(a, b, t) { return a.map((v, i) => v + (b[i] - v) * t); }

export function paleta(alt) {
  if (alt >= PONTOS[0][0]) return { z: PONTOS[0][1], h: PONTOS[0][2] };
  for (let i = 0; i < PONTOS.length - 1; i++) {
    const [a0, z0, h0] = PONTOS[i];
    const [a1, z1, h1] = PONTOS[i + 1];
    if (alt <= a0 && alt >= a1) {
      const t = (a0 - alt) / (a0 - a1);
      return { z: mistura(z0, z1, t), h: mistura(h0, h1, t) };
    }
  }
  const u = PONTOS[PONTOS.length - 1];
  return { z: u[1], h: u[2] };
}

export function vetor(alt, az, r = RAIO) {
  const c = Math.cos(alt * RAD);
  return new THREE.Vector3(r * c * Math.sin(az * RAD), r * Math.sin(alt * RAD), -r * c * Math.cos(az * RAD));
}

function texturaBrilho(cor, tamanho = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = tamanho;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(tamanho / 2, tamanho / 2, 0, tamanho / 2, tamanho / 2, tamanho / 2);
  grad.addColorStop(0, cor);
  grad.addColorStop(0.18, cor);
  grad.addColorStop(0.5, cor.replace(/[\d.]+\)$/, '0.22)'));
  grad.addColorStop(1, cor.replace(/[\d.]+\)$/, '0)'));
  g.fillStyle = grad;
  g.fillRect(0, 0, tamanho, tamanho);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function criarCeu(cena, luzes, dados) {
  const grupo = new THREE.Group();
  cena.add(grupo);

  const cupulaMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    uniforms: { uZenite: { value: new THREE.Color() }, uHorizonte: { value: new THREE.Color() }, uSolDir: { value: new THREE.Vector3(0, 1, 0) }, uSolCor: { value: new THREE.Color(1, 0.8, 0.5) }, uBrilho: { value: 0 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'varying vec3 vP; uniform vec3 uZenite; uniform vec3 uHorizonte; uniform vec3 uSolCor; uniform vec3 uSolDir; uniform float uBrilho;' +
      'void main(){ float h = clamp(vP.y, 0.0, 1.0); float t = pow(1.0 - h, 2.2); vec3 c = mix(uZenite, uHorizonte, t);' +
      'float s = max(dot(normalize(vP), normalize(uSolDir)), 0.0); c += uSolCor * (pow(s, 6.0) * 0.30 + pow(s, 48.0) * 0.45) * uBrilho; gl_FragColor = vec4(c, 1.0); }',
  });
  const cupula = new THREE.Mesh(new THREE.SphereGeometry(RAIO * 1.05, 32, 16), cupulaMat);
  cupula.renderOrder = -100;
  cupula.frustumCulled = false;
  grupo.add(cupula);

  /* estrelas */
  const est = dados.estrelas;
  const n = est.length;
  const pos = new Float32Array(n * 3);
  const mag = new Float32Array(n);
  const cor = new Float32Array(n * 3);
  est.forEach((e, i) => {
    mag[i] = e[2];
    const c = Ceu.corBV(e[3]);
    cor[i * 3] = c[0]; cor[i * 3 + 1] = c[1]; cor[i * 3 + 2] = c[2];
  });
  const geoEst = new THREE.BufferGeometry();
  geoEst.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geoEst.setAttribute('aMag', new THREE.BufferAttribute(mag, 1));
  geoEst.setAttribute('aCor', new THREE.BufferAttribute(cor, 3));
  const matEst = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, fog: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uVis: { value: 0 }, uEsc: { value: 1 }, uZoom: { value: 1 } },
    vertexShader: 'attribute float aMag; attribute vec3 aCor; varying vec3 vC; varying float vA; uniform float uEsc; uniform float uZoom;' +
      'void main(){ vC = aCor; float b = clamp((6.2 - aMag) / 7.5, 0.05, 1.0); vA = 0.6 + 0.4 * b;' +
      'gl_PointSize = (2.6 + 6.0 * b * b + 2.2 * b) * uEsc * (0.75 + 0.25 * uZoom); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying vec3 vC; varying float vA; uniform float uVis; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; float a = pow(max(0.0, 1.0 - r), 1.4); gl_FragColor = vec4(vC, min(1.0, a * 1.15) * vA * uVis); }',
  });
  const estrelas = new THREE.Points(geoEst, matEst);
  estrelas.frustumCulled = false;
  estrelas.renderOrder = -90;
  grupo.add(estrelas);

  /* Via Láctea: nuvem de pontos suaves ao longo do equador galáctico, mais densa rumo ao centro (l = 0) */
  const NV = 4200;
  const RAD_ = Math.PI / 180;
  const GP = { ra: 192.85948 * RAD_, dec: 27.12825 * RAD_, lncp: 122.93192 * RAD_ };
  function galEq(l, b) {
    const d = GP.lncp - l;
    const sd = Math.sin(b) * Math.sin(GP.dec) + Math.cos(b) * Math.cos(GP.dec) * Math.cos(d);
    const dec = Math.asin(sd);
    const y = Math.cos(b) * Math.sin(d);
    const x = Math.sin(b) * Math.cos(GP.dec) - Math.cos(b) * Math.sin(GP.dec) * Math.cos(d);
    return [((GP.ra + Math.atan2(y, x)) / RAD_ % 360 + 360) % 360, dec / RAD_];
  }
  const vlEq = [];
  const vlPos = new Float32Array(NV * 3);
  const vlTam = new Float32Array(NV);
  const vlAlfa = new Float32Array(NV);
  const vlCor = new Float32Array(NV * 3);
  let semente = 12345;
  const rnd = () => { semente = (semente * 1664525 + 1013904223) >>> 0; return semente / 4294967296; };
  const gauss = () => { let s = 0; for (let i = 0; i < 4; i++) s += rnd(); return (s - 2) * 1.73; };
  for (let i = 0; i < NV; i++) {
    const l = rnd() * 360;
    const dl = Math.min(l, 360 - l);
    const f = 0.30 + 0.70 * Math.exp(-(dl * dl) / (2 * 55 * 55));
    if (rnd() > f) { i--; continue; }
    const b = gauss() * (3.5 + 4.5 * f);
    vlEq.push(galEq(l * RAD_, b * RAD_));
    vlTam[i] = 16 + rnd() * 34 * (0.6 + f);
    vlAlfa[i] = (0.030 + 0.045 * f) * (0.5 + rnd()) * Math.max(0.35, 1 - Math.abs(b) / 16);
    const q = Math.min(1, f);
    vlCor[i * 3] = 0.70 + 0.30 * q; vlCor[i * 3 + 1] = 0.78 + 0.10 * q; vlCor[i * 3 + 2] = 1.0 - 0.25 * q;
  }
  const geoVL = new THREE.BufferGeometry();
  geoVL.setAttribute('position', new THREE.BufferAttribute(vlPos, 3));
  geoVL.setAttribute('aTam', new THREE.BufferAttribute(vlTam, 1));
  geoVL.setAttribute('aAlfa', new THREE.BufferAttribute(vlAlfa, 1));
  geoVL.setAttribute('aCor', new THREE.BufferAttribute(vlCor, 3));
  const matVL = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, fog: false, blending: THREE.AdditiveBlending,
    uniforms: { uVis: { value: 0 }, uEsc: { value: 1 } },
    vertexShader: 'attribute float aTam; attribute float aAlfa; attribute vec3 aCor; varying vec3 vC; varying float vA; uniform float uEsc;' +
      'void main(){ vC = aCor; vA = aAlfa; gl_PointSize = aTam * uEsc; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying vec3 vC; varying float vA; uniform float uVis; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; float a = max(0.0, 1.0 - r); a = a * a; gl_FragColor = vec4(vC, a * vA * uVis); }',
  });
  const viaLactea = new THREE.Points(geoVL, matVL);
  viaLactea.frustumCulled = false;
  viaLactea.renderOrder = -95;
  grupo.add(viaLactea);

  /* constelações */
  const segs = [];
  dados.constelacoes.forEach((c) => c.linhas.forEach((l) => { for (let i = 0; i < l.length - 1; i++) segs.push(l[i], l[i + 1]); }));
  const posLin = new Float32Array(segs.length * 3);
  const geoLin = new THREE.BufferGeometry();
  geoLin.setAttribute('position', new THREE.BufferAttribute(posLin, 3));
  const matLin = new THREE.LineBasicMaterial({ color: 0x6f8fd6, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false });
  const linhas = new THREE.LineSegments(geoLin, matLin);
  linhas.frustumCulled = false;
  linhas.renderOrder = -89;
  grupo.add(linhas);

  /* sol, lua, planetas */
  const spriteSol = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaBrilho('rgba(255,236,190,1)'), transparent: true, depthTest: false, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  spriteSol.scale.setScalar(150);
  spriteSol.renderOrder = -85;
  grupo.add(spriteSol);

  const luaMat = new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false, fog: false, transparent: true,
    uniforms: { uSol: { value: new THREE.Vector3(1, 0, 0) } },
    vertexShader: 'varying vec3 vN; void main(){ vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying vec3 vN; uniform vec3 uSol; void main(){ float l = dot(normalize(vN), normalize(uSol)); float luz = smoothstep(-0.02, 0.10, l);' +
      'vec3 c = mix(vec3(0.05, 0.055, 0.075), vec3(1.0, 0.97, 0.88), luz); gl_FragColor = vec4(c, 1.0); }',
  });
  const lua = new THREE.Mesh(new THREE.SphereGeometry(7, 24, 16), luaMat);
  lua.renderOrder = -84;
  lua.frustumCulled = false;
  grupo.add(lua);

  const corPlaneta = { mercurio: 'rgba(210,200,190,1)', venus: 'rgba(255,248,225,1)', marte: 'rgba(255,150,110,1)', jupiter: 'rgba(255,236,205,1)', saturno: 'rgba(255,225,160,1)' };
  const planetas = {};
  ['mercurio', 'venus', 'marte', 'jupiter', 'saturno'].forEach((id) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaBrilho(corPlaneta[id], 64), transparent: true, depthTest: false, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(id === 'venus' ? 30 : id === 'jupiter' ? 24 : 16);
    s.renderOrder = -86;
    grupo.add(s);
    planetas[id] = s;
  });

  const estado = { data: new Date(), solAlt: 0, luaAlt: 0, fase: null, objetos: [], vis: 0 };
  const azEst = new Float32Array(n);
  const altEst = new Float32Array(n);

  function atualizar(data, local) {
    estado.data = data;
    local = local || Ceu.LOCAL;
    const sol = Ceu.sol(data);
    const hs = Ceu.horizonte(sol.ra, sol.dec, data, local);
    estado.solAlt = hs.alt;
    const pal = paleta(hs.alt);
    cupulaMat.uniforms.uZenite.value.setRGB(pal.z[0], pal.z[1], pal.z[2]);
    cupulaMat.uniforms.uHorizonte.value.setRGB(pal.h[0], pal.h[1], pal.h[2]);
    const vSol = vetor(hs.alt, hs.az);
    cupulaMat.uniforms.uSolDir.value.copy(vSol).normalize();
    cupulaMat.uniforms.uBrilho.value = Math.max(0, Math.min(1, (hs.alt + 8) / 14));
    spriteSol.position.copy(vSol);
    spriteSol.visible = hs.alt > -4;
    const vis = Math.max(0, Math.min(1, (-4 - hs.alt) / 10));
    estado.vis = vis;
    matEst.uniforms.uVis.value = vis;
    matLin.opacity = 0;

    for (let i = 0; i < n; i++) {
      const h = Ceu.horizonte(est[i][0], est[i][1], data, local);
      altEst[i] = h.alt; azEst[i] = h.az;
      const c = Math.cos(h.alt * RAD);
      const r = RAIO * 0.98;
      pos[i * 3] = r * c * Math.sin(h.az * RAD);
      pos[i * 3 + 1] = r * Math.sin(h.alt * RAD);
      pos[i * 3 + 2] = -r * c * Math.cos(h.az * RAD);
    }
    geoEst.attributes.position.needsUpdate = true;

    matVL.uniforms.uVis.value = vis * 0.9;
    for (let i = 0; i < NV; i++) {
      const h = Ceu.horizonte(vlEq[i][0], vlEq[i][1], data, local);
      const c = Math.cos(h.alt * RAD);
      const r = RAIO * 0.99;
      vlPos[i * 3] = r * c * Math.sin(h.az * RAD);
      vlPos[i * 3 + 1] = r * Math.sin(h.alt * RAD);
      vlPos[i * 3 + 2] = -r * c * Math.cos(h.az * RAD);
    }
    geoVL.attributes.position.needsUpdate = true;

    for (let i = 0; i < segs.length; i++) {
      const h = Ceu.horizonte(segs[i][0], segs[i][1], data, local);
      const c = Math.cos(h.alt * RAD);
      const r = RAIO * 0.97;
      posLin[i * 3] = r * c * Math.sin(h.az * RAD);
      posLin[i * 3 + 1] = r * Math.sin(h.alt * RAD);
      posLin[i * 3 + 2] = -r * c * Math.cos(h.az * RAD);
    }
    geoLin.attributes.position.needsUpdate = true;

    const l = Ceu.lua(data);
    const hl = Ceu.horizonte(l.ra, l.dec, data, local);
    estado.luaAlt = hl.alt;
    estado.fase = Ceu.faseDaLua(data);
    lua.position.copy(vetor(hl.alt, hl.az, RAIO * 0.96));
    lua.visible = hl.alt > -2;
    luaMat.uniforms.uSol.value.copy(vetor(hs.alt, hs.az, 1));

    const objetos = [];
    Ceu.planetas(data).forEach((p) => {
      const h = Ceu.horizonte(p.ra, p.dec, data, local);
      const s = planetas[p.id];
      s.position.copy(vetor(h.alt, h.az, RAIO * 0.955));
      const op = Math.max(0, Math.min(1, (1 - hs.alt) / 8));
      s.material.opacity = op;
      s.visible = h.alt > 0.5 && op > 0.02;
      objetos.push({ id: p.id, nome: p.nome, tipo: 'planeta', alt: h.alt, az: h.az, mag: p.mag, dist: p.dist, visivel: op > 0.25, vetor: s.position.clone().normalize() });
    });
    objetos.push({ id: 'lua', nome: 'Lua', tipo: 'lua', alt: hl.alt, az: hl.az, mag: -10, fase: estado.fase, vetor: vetor(hl.alt, hl.az, 1) });
    objetos.push({ id: 'sol', nome: 'Sol', tipo: 'sol', alt: hs.alt, az: hs.az, mag: -26, vetor: vetor(hs.alt, hs.az, 1) });
    estado.objetos = objetos;

    /* luzes */
    const luzSol = Math.max(0, Math.min(1, (hs.alt + 4) / 22));
    luzes.sol.position.copy(vSol).normalize().multiplyScalar(80);
    luzes.sol.intensity = 2.6 * luzSol;
    luzes.sol.color.setRGB(1, 0.84 + 0.16 * Math.min(1, Math.max(0, hs.alt / 25)), 0.66 + 0.34 * Math.min(1, Math.max(0, hs.alt / 25)));
    const luzLua = hl.alt > 0 ? Math.min(1, hl.alt / 20) * (0.15 + 0.85 * estado.fase.iluminada) * (1 - luzSol) : 0;
    luzes.lua.position.copy(vetor(Math.max(hl.alt, 5), hl.az, 80));
    luzes.lua.intensity = 1.0 * luzLua;
    luzes.hemi.intensity = 0.55 + 0.6 * luzSol + 0.2 * luzLua;
    luzes.hemi.color.setRGB(pal.z[0] * 0.6 + 0.4, pal.z[1] * 0.6 + 0.4, pal.z[2] * 0.6 + 0.4);
    luzes.hemi.groundColor.setRGB(0.16 + 0.12 * luzSol, 0.15 + 0.12 * luzSol, 0.10 + 0.08 * luzSol);
    return { pal, dia: luzSol, sol: hs, lua: hl };
  }

  function mostrarConstelacoes(on) { matLin.opacity = on ? 0.55 * Math.max(0.35, estado.vis) : 0; }
  function tamanhoEstrelas(escala, zoom) { matEst.uniforms.uEsc.value = escala; matEst.uniforms.uZoom.value = zoom; matVL.uniforms.uEsc.value = escala * (0.8 + 0.2 * Math.min(3, zoom)) / (1 + 0.25 * Math.max(0, zoom - 1)); }

  function estrelaMaisPerto(dir, limiteGraus) {
    let melhor = null, dmin = Math.cos(limiteGraus * RAD);
    for (let i = 0; i < n; i++) {
      if (altEst[i] < 0) continue;
      const c = Math.cos(altEst[i] * RAD);
      const vx = c * Math.sin(azEst[i] * RAD), vy = Math.sin(altEst[i] * RAD), vz = -c * Math.cos(azEst[i] * RAD);
      const d = vx * dir.x + vy * dir.y + vz * dir.z;
      const peso = d + (6 - est[i][2]) * 0.00004;
      if (d > dmin && (!melhor || peso > melhor.peso)) melhor = { i, d, peso };
    }
    if (!melhor) return null;
    const e = est[melhor.i];
    return { tipo: 'estrela', nome: e[4] || '', mag: e[2], alt: altEst[melhor.i], az: azEst[melhor.i], ra: e[0], dec: e[1], graus: Math.acos(Math.min(1, melhor.d)) / RAD, indice: melhor.i };
  }

  function projetaveis(limiteMag) {
    const lista = [];
    for (let i = 0; i < n; i++) {
      if (est[i][2] > limiteMag || !est[i][4] || altEst[i] < 2) continue;
      lista.push({ tipo: 'estrela', nome: est[i][4], mag: est[i][2], alt: altEst[i], az: azEst[i], vetor: vetor(altEst[i], azEst[i], 1) });
    }
    return lista;
  }

  const rotulosConstel = dados.constelacoes.filter((c) => c.ra != null).map((c) => ({ id: c.id, nome: c.nome, ra: c.ra, dec: c.dec }));
  function constelacoesVisiveis(data, local) {
    return rotulosConstel.map((c) => {
      const h = Ceu.horizonte(c.ra, c.dec, data, local || Ceu.LOCAL);
      return { id: c.id, nome: c.nome, alt: h.alt, az: h.az, vetor: vetor(h.alt, h.az, 1) };
    }).filter((c) => c.alt > 3);
  }

  function centroDe(id, data, local) {
    const c = dados.constelacoes.find((x) => x.id === id);
    if (!c) return null;
    const h = Ceu.horizonte(c.ra, c.dec, data, local || Ceu.LOCAL);
    return { alt: h.alt, az: h.az, vetor: vetor(h.alt, h.az, 1) };
  }

  return { grupo, atualizar, estado, mostrarConstelacoes, tamanhoEstrelas, estrelaMaisPerto, projetaveis, constelacoesVisiveis, centroDe, luaMat };
}
