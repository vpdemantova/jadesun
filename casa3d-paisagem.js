import * as THREE from './vendor/three.module.min.js';

/* ============================================================
   A PAISAGEM DA CASA (09/out/2026, PERFIL.md item 74)
   "os modelos estão bem ruins, assim como a cena: aprimore a modelagem, o processamento, toda a
   construção envolvida; altos níveis de render."
   · O céu é uma cúpula (shader): o zênite, o horizonte e o brilho do sol na direção da luz de verdade,
     casando com a névoa — em vez de um degradê chapado de fundo.
   · O chão tem variação natural (manchas de grama mais clara, mais escura, terra) pintadas por
     vértice sobre a textura de detalhe: acabou o tapete verde repetido.
   · Em volta da casa: árvores de copa facetada, arbustos e tufos de grama (instanciados: um desenho
     só, centenas de cópias), dispostos por uma semente fixa — a mesma casa tem sempre o mesmo jardim.
   Tudo leve: as árvores e os tufos não entram no cálculo do Andar (não são paredes).
   ============================================================ */

/* ruído suave e fbm (semeável), para as manchas do chão */
function ruido(semente) {
  let s = semente >>> 0 || 7;
  const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const P = new Uint8Array(512), base = new Float32Array(256);
  for (let i = 0; i < 256; i++) { P[i] = i; base[i] = rnd(); }
  for (let i = 255; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; const t = P[i]; P[i] = P[j]; P[j] = t; }
  for (let i = 0; i < 256; i++) P[i + 256] = P[i];
  const suave = (t) => t * t * (3 - 2 * t);
  const n2 = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
    const a = base[P[P[X] + Y]], b = base[P[P[X + 1] + Y]], c = base[P[P[X] + Y + 1]], d = base[P[P[X + 1] + Y + 1]];
    const u = suave(xf), v = suave(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const fbm = (x, y, o = 4) => { let t = 0, amp = 0.5, f = 1; for (let i = 0; i < o; i++) { t += amp * n2(x * f, y * f); f *= 2.03; amp *= 0.5; } return t / (1 - Math.pow(0.5, o)); };
  return { rnd, fbm };
}

/* ---------- o céu ---------- */
export function criarCeu() {
  const uniforms = {
    zenite: { value: new THREE.Color('#5f8fc4') }, horizonte: { value: new THREE.Color('#dfe8ee') }, baixo: { value: new THREE.Color('#c9cfc4') },
    dirSol: { value: new THREE.Vector3(0.4, 0.7, 0.5).normalize() }, corSol: { value: new THREE.Color('#fff2d6') }, forcaSol: { value: 1.0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }',
    fragmentShader: [
      'uniform vec3 zenite; uniform vec3 horizonte; uniform vec3 baixo; uniform vec3 dirSol; uniform vec3 corSol; uniform float forcaSol; varying vec3 vDir;',
      'void main(){',
      '  vec3 d = normalize(vDir); float h = d.y;',
      '  vec3 c = h > 0.0 ? mix(horizonte, zenite, pow(smoothstep(0.0, 0.75, h), 0.8)) : mix(horizonte, baixo, smoothstep(0.0, -0.18, h));',
      '  float s = max(dot(d, normalize(dirSol)), 0.0);',
      '  c += corSol * (pow(s, 900.0) * 6.0 + pow(s, 40.0) * 0.32 + pow(s, 6.0) * 0.12) * forcaSol;',
      '  c = mix(c, horizonte, 0.35 * exp(-abs(h) * 14.0));',
      '  gl_FragColor = vec4(c, 1.0);',
      '}',
    ].join('\n'),
  });
  const cupula = new THREE.Mesh(new THREE.SphereGeometry(420, 48, 24), mat);
  cupula.frustumCulled = false; cupula.renderOrder = -10; cupula.name = 'ceu';
  return {
    cupula,
    /* cores em hex (do jeito que a casa já define cada céu) e a direção da luz */
    definir(cores, dirSol, corSol, forca) {
      uniforms.zenite.value.set(cores[0]); uniforms.horizonte.value.set(cores[2]); uniforms.baixo.value.set(cores[3] || cores[2]);
      if (dirSol) uniforms.dirSol.value.copy(dirSol).normalize();
      if (corSol) uniforms.corSol.value.set(corSol);
      uniforms.forcaSol.value = forca == null ? 1 : forca;
    },
    seguir(camera) { cupula.position.copy(camera.position); },
    /* o brilho do sol no céu acompanha a luz do palco (a casa gira o sol ao entrar numa área) */
    definirSol(sol) { if (sol) uniforms.dirSol.value.copy(sol.position).sub(sol.target.position).normalize(); },
  };
}

/* ---------- o chão com manchas ---------- */
export function criarChao(pbr, texGrama) {
  const L = 260, seg = 140;
  const geo = new THREE.PlaneGeometry(L, L, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const R = ruido(1811);
  const pos = geo.attributes.position, cores = new Float32Array(pos.count * 3);
  const verde = new THREE.Color('#e3eed4'), escuro = new THREE.Color('#b9cf9f'), seco = new THREE.Color('#efe6c4'), terra = new THREE.Color('#d9ccb0');
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const n = R.fbm(x * 0.035 + 10, z * 0.035 - 4, 5), m = R.fbm(x * 0.012 - 3, z * 0.012 + 7, 3), t = R.fbm(x * 0.09, z * 0.09, 2);
    c.copy(verde).lerp(escuro, Math.max(0, Math.min(1, (n - 0.42) * 2.4)));
    c.lerp(seco, Math.max(0, Math.min(1, (m - 0.56) * 2.2)) * 0.8);
    c.lerp(terra, Math.max(0, (t - 0.74) * 2.8) * 0.5);
    /* bem longe, o chão vai clareando para casar com a névoa do horizonte */
    const d = Math.hypot(x, z) / (L / 2);
    c.lerp(seco, Math.max(0, d - 0.55) * 0.25);
    cores[i * 3] = c.r; cores[i * 3 + 1] = c.g; cores[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cores, 3));
  const mapa = texGrama.clone(); mapa.repeat.set(110, 110); mapa.needsUpdate = true;
  const mat = pbr({ map: mapa, vertexColors: true, roughness: 1, envMapIntensity: 0.55 });
  const chao = new THREE.Mesh(geo, mat);
  chao.position.y = -0.02; chao.receiveShadow = true; chao.name = 'chao';
  return chao;
}

/* ---------- o jardim em volta: árvores, arbustos e tufos ---------- */
export function criarJardim(pbr, limites, semente = 42) {
  const grupo = new THREE.Group(); grupo.name = 'jardim-da-casa';
  const R = ruido(semente);
  const cx = (limites.x0 + limites.x1) / 2, cz = (limites.y0 + limites.y1) / 2;
  const meia = Math.max(3, (limites.x1 - limites.x0) / 2, (limites.y1 - limites.y0) / 2);
  const tronco = pbr({ color: 0x6b513b, roughness: 0.95 });
  const copas = [0x3f6b34, 0x4f7a3c, 0x365f30, 0x5b8442].map((h) => pbr({ color: h, roughness: 1, flatShading: true, envMapIntensity: 0.35 }));
  const fora = (x, z, folga) => Math.abs(x - cx) > meia + folga || Math.abs(z - cz) > meia + folga;

  /* árvores: num anel em volta, sem encostar na casa */
  const nArv = 9;
  for (let i = 0; i < nArv; i++) {
    const ang = (i / nArv) * Math.PI * 2 + R.rnd() * 0.5, raio = meia + 5 + R.rnd() * 10;
    const x = cx + Math.cos(ang) * raio, z = cz + Math.sin(ang) * raio;
    if (!fora(x, z, 3)) continue;
    const arv = new THREE.Group(), alt = 2.6 + R.rnd() * 2.2, esc = 0.8 + R.rnd() * 0.6;
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * esc, 0.16 * esc, alt, 8), tronco);
    t.position.y = alt / 2; t.castShadow = true; arv.add(t);
    const nCopa = 3 + Math.floor(R.rnd() * 3), mat = copas[Math.floor(R.rnd() * copas.length)];
    for (let k = 0; k < nCopa; k++) {
      const r = (0.8 + R.rnd() * 0.7) * esc;
      const copa = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat);
      copa.position.set((R.rnd() - 0.5) * 1.1 * esc, alt + (R.rnd() * 0.9 - 0.1) * esc, (R.rnd() - 0.5) * 1.1 * esc);
      copa.rotation.set(R.rnd() * 3, R.rnd() * 3, R.rnd() * 3);
      copa.castShadow = true; copa.receiveShadow = true; arv.add(copa);
    }
    arv.position.set(x, 0, z); arv.rotation.y = R.rnd() * Math.PI * 2;
    grupo.add(arv);
  }

  /* arbustos: perto das paredes de fora, em grupos */
  const arbusto = new THREE.IcosahedronGeometry(0.35, 1);
  for (let i = 0; i < 14; i++) {
    const lado = Math.floor(R.rnd() * 4), u = R.rnd() * 2 - 1, d = meia + 1.1 + R.rnd() * 0.8;
    const x = cx + (lado < 2 ? u * meia : (lado === 2 ? -d : d)), z = cz + (lado < 2 ? (lado === 0 ? -d : d) : u * meia);
    const a = new THREE.Mesh(arbusto, copas[i % copas.length]);
    const s = 0.7 + R.rnd() * 0.8; a.scale.set(s * 1.2, s * 0.8, s);
    a.position.set(x, 0.18 * s, z); a.castShadow = true; a.receiveShadow = true;
    grupo.add(a);
  }

  /* tufos de grama: um desenho, muitas cópias (instanciado) */
  /* (a cor vem do material: a cor por instância não pegava no shader e os tufos saíam brancos) */
  const tufo = new THREE.ConeGeometry(0.03, 0.16, 4, 1); tufo.translate(0, 0.08, 0);
  const matTufo = pbr({ color: 0x55783f, roughness: 1, envMapIntensity: 0.3 });
  const N = 900, inst = new THREE.InstancedMesh(tufo, matTufo, N);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), cor = new THREE.Color();
  let n = 0;
  for (let i = 0; i < N * 3 && n < N; i++) {
    const ang = R.rnd() * Math.PI * 2, raio = meia + 1 + Math.pow(R.rnd(), 0.6) * 22;
    const x = cx + Math.cos(ang) * raio, z = cz + Math.sin(ang) * raio;
    if (!fora(x, z, 0.9)) continue;
    e.set((R.rnd() - 0.5) * 0.5, R.rnd() * Math.PI, (R.rnd() - 0.5) * 0.5); q.setFromEuler(e);
    const s = 0.5 + R.rnd() * 0.8; sc.set(s, s * (0.6 + R.rnd() * 0.7), s);
    m4.compose(v.set(x, -0.02, z), q, sc); inst.setMatrixAt(n, m4);
    n++;
  }
  inst.count = n; inst.instanceMatrix.needsUpdate = true;
  inst.receiveShadow = true; inst.castShadow = false;
  grupo.add(inst);
  grupo.traverse((o) => { o.userData.paisagem = true; });
  return grupo;
}
