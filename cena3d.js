import * as THREE from './vendor/three.module.min.js';
import { EffectComposer } from './vendor/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from './vendor/postprocessing/ShaderPass.js';
import { OutputPass } from './vendor/postprocessing/OutputPass.js';
import { RoomEnvironment } from './vendor/environments/RoomEnvironment.js';

/* Palco 3D compartilhado pela Estante e pelo Guarda-roupa: luz física (reflexos de um
   estúdio, sombras suaves), antisserrilhado de verdade mesmo com pós-processamento,
   materiais procedurais (madeira, gesso, tecido, papel — gerados na hora, sem imagem
   de fora pra checar licença), sala trocável e uma câmera que desliza com inércia. */

export const movel = matchMedia('(pointer: coarse)').matches || innerWidth < 700;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

export function textoEmCanvas(w, h, desenhar, opcoes = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  desenhar(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (!opcoes.linear) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ---------- ruído (value noise suave + fbm), semeável: a mesma semente dá sempre a mesma textura ---------- */
function criarRuido(semente) {
  const P = new Uint8Array(512);
  let s = semente >>> 0 || 1;
  const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const base = new Float32Array(256);
  for (let i = 0; i < 256; i++) { P[i] = i; base[i] = rnd(); }
  for (let i = 255; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; const t = P[i]; P[i] = P[j]; P[j] = t; }
  for (let i = 0; i < 256; i++) P[i + 256] = P[i];
  const suave = (t) => t * t * (3 - 2 * t);
  function n2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const X = xi & 255, Y = yi & 255;
    const a = base[P[P[X] + Y]], b = base[P[P[X + 1] + Y]], c = base[P[P[X] + Y + 1]], d = base[P[P[X + 1] + Y + 1]];
    const u = suave(xf), v = suave(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, oit = 4) {
    let t = 0, amp = 0.5, f = 1;
    for (let i = 0; i < oit; i++) { t += amp * n2(x * f, y * f); f *= 2.03; amp *= 0.5; }
    return t / (1 - Math.pow(0.5, oit));
  }
  return { n2, fbm, rnd };
}

const hexRgb = (hex) => { const c = new THREE.Color(hex); return [c.r * 255, c.g * 255, c.b * 255]; };
const mistura = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/* gera cor + mapa de relevo (bump) + mapa de aspereza de uma vez, pixel a pixel */
function gerarPBR(w, h, semente, pixel) {
  const R = criarRuido(semente);
  const cc = document.createElement('canvas'); cc.width = w; cc.height = h;
  const cb = document.createElement('canvas'); cb.width = w; cb.height = h;
  const cr = document.createElement('canvas'); cr.width = w; cr.height = h;
  const gc = cc.getContext('2d'), gb = cb.getContext('2d'), gr = cr.getContext('2d');
  const ic = gc.createImageData(w, h), ib = gb.createImageData(w, h), ir = gr.createImageData(w, h);
  const saida = { cor: [0, 0, 0], relevo: 0.5, aspereza: 0.6 };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      pixel(x, y, R, saida);
      const i = (y * w + x) * 4;
      ic.data[i] = saida.cor[0]; ic.data[i + 1] = saida.cor[1]; ic.data[i + 2] = saida.cor[2]; ic.data[i + 3] = 255;
      const b = clamp(saida.relevo, 0, 1) * 255, r = clamp(saida.aspereza, 0, 1) * 255;
      ib.data[i] = ib.data[i + 1] = ib.data[i + 2] = b; ib.data[i + 3] = 255;
      ir.data[i] = ir.data[i + 1] = ir.data[i + 2] = r; ir.data[i + 3] = 255;
    }
  }
  gc.putImageData(ic, 0, 0); gb.putImageData(ib, 0, 0); gr.putImageData(ir, 0, 0);
  const tex = (c, srgb) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
  return { map: tex(cc, true), bumpMap: tex(cb, false), roughnessMap: tex(cr, false) };
}

const TONS_MADEIRA = {
  nogueira: { claro: '#7a5236', escuro: '#3f2616', aspereza: 0.55 },
  carvalho: { claro: '#dcc8a6', escuro: '#b39574', aspereza: 0.62, manchas: 0.12 },
  freijo: { claro: '#b98a5e', escuro: '#6d4a2c', aspereza: 0.58 },
  branco: { claro: '#f3efe7', escuro: '#ddd5c7', aspereza: 0.45 },
};
const cacheMadeira = new Map();
/* madeira com veio correndo ao longo de X (tábuas); `vertical` gira o veio pra painéis em pé */
export function texturaMadeira(tom = 'nogueira', vertical = false) {
  const chave = tom + (vertical ? ':v' : '');
  if (cacheMadeira.has(chave)) return cacheMadeira.get(chave);
  let base = cacheMadeira.get(tom);
  if (!base) {
    const T = TONS_MADEIRA[tom] || TONS_MADEIRA.nogueira;
    const claro = hexRgb(T.claro), escuro = hexRgb(T.escuro);
    base = gerarPBR(1024, 256, hash(tom), (x, y, R, s) => {
      const distorcao = R.fbm(x * 0.004, y * 0.02, 4);
      const t = y * 0.09 + distorcao * 9;
      const anel = Math.pow(0.5 + 0.5 * Math.sin(t), 3);
      const fibra = R.fbm(x * 0.05, y * 0.9, 3);
      const mancha = R.fbm(x * 0.002 + 3, y * 0.006, 3);
      const k = clamp(0.5 * anel + 0.3 * fibra + (T.manchas != null ? T.manchas : 0.35) * (mancha - 0.5), 0, 1);
      s.cor = mistura(claro, escuro, tom === 'branco' ? k * 0.25 : k * 0.72);
      s.relevo = 0.5 + (fibra - 0.5) * 0.9 - anel * 0.25;
      s.aspereza = T.aspereza + anel * 0.15 + (fibra - 0.5) * 0.1;
    });
    cacheMadeira.set(tom, base);
  }
  if (!vertical) return base;
  const girar = (t) => { const c = t.clone(); c.rotation = Math.PI / 2; c.center.set(0.5, 0.5); c.needsUpdate = true; return c; };
  const v = { map: girar(base.map), bumpMap: girar(base.bumpMap), roughnessMap: girar(base.roughnessMap) };
  cacheMadeira.set(chave, v);
  return v;
}

let cacheAssoalho = null;
export function texturaAssoalho() {
  if (cacheAssoalho) return cacheAssoalho;
  const claro = hexRgb('#d8bf98'), escuro = hexRgb('#a5825a');
  const TAB_H = 32, TAB_W = 256;
  cacheAssoalho = gerarPBR(512, 512, 77, (x, y, R, s) => {
    const fila = Math.floor(y / TAB_H);
    const desloc = (fila * 197) % TAB_W;
    const col = Math.floor((x + desloc) / TAB_W);
    const tabua = fila * 31 + col * 7;
    const tomTabua = (Math.sin(tabua * 12.9898) * 43758.5453) % 1;
    const yy = y % TAB_H, xx = (x + desloc) % TAB_W;
    const junta = yy < 2 || xx < 2;
    const distorcao = R.fbm(x * 0.006 + tabua, y * 0.05, 3);
    const anel = Math.pow(0.5 + 0.5 * Math.sin(y * 0.44 + distorcao * 7 + tabua), 3);
    const fibra = R.fbm(x * 0.06, y * 0.8, 2);
    const k = clamp(0.35 * anel + 0.25 * fibra + Math.abs(tomTabua) * 0.4, 0, 1);
    s.cor = junta ? mistura(escuro, [60, 40, 25], 0.6) : mistura(claro, escuro, k * 0.8);
    s.relevo = junta ? 0.15 : 0.55 + (fibra - 0.5) * 0.5;
    s.aspereza = junta ? 0.9 : 0.5 + anel * 0.2;
  });
  [cacheAssoalho.map, cacheAssoalho.bumpMap, cacheAssoalho.roughnessMap].forEach((t) => t.repeat.set(12, 12));
  return cacheAssoalho;
}

let cacheGesso = null;
export function texturaGesso() {
  if (cacheGesso) return cacheGesso;
  const base = hexRgb('#ece5da');
  cacheGesso = gerarPBR(512, 512, 5, (x, y, R, s) => {
    const baixa = R.fbm(x * 0.006, y * 0.006, 4);
    const fina = R.fbm(x * 0.12, y * 0.12, 3);
    const k = (baixa - 0.5) * 0.08 + (fina - 0.5) * 0.04;
    s.cor = [base[0] * (1 + k), base[1] * (1 + k), base[2] * (1 + k * 1.1)];
    s.relevo = 0.5 + (fina - 0.5) * 0.8;
    s.aspereza = 0.88;
  });
  [cacheGesso.map, cacheGesso.bumpMap, cacheGesso.roughnessMap].forEach((t) => t.repeat.set(5, 3));
  return cacheGesso;
}

/* tecido em tons de cinza quase branco: a cor da peça vem do material, a trama vem daqui */
const cacheTecido = new Map();
export function texturaTecido(tipo = 'plano') {
  if (cacheTecido.has(tipo)) return cacheTecido.get(tipo);
  const t = gerarPBR(256, 256, hash('tecido' + tipo), (x, y, R, s) => {
    let fio;
    if (tipo === 'sarja') fio = 0.5 + 0.5 * Math.sin((x + y) * 0.9);
    else if (tipo === 'malha') fio = 0.5 + 0.5 * Math.sin(x * 1.1) * Math.sin(y * 0.55 + Math.sin(x * 0.55) * 1.5);
    else fio = ((Math.floor(x / 3) + Math.floor(y / 3)) % 2) ? 0.65 : 0.35;
    const ruido = R.fbm(x * 0.08, y * 0.08, 3);
    const v = 0.86 + fio * 0.1 + (ruido - 0.5) * 0.08;
    s.cor = [v * 255, v * 255, v * 255];
    s.relevo = 0.4 + fio * 0.4;
    s.aspereza = 0.92;
  });
  const rep = tipo === 'plano' ? 3 : 4;
  [t.map, t.bumpMap, t.roughnessMap].forEach((x) => x.repeat.set(rep, rep));
  cacheTecido.set(tipo, t);
  return t;
}

let cachePaginas = null;
export function texturaPaginas() {
  if (cachePaginas) return cachePaginas;
  cachePaginas = textoEmCanvas(128, 64, (g, w, h) => {
    g.fillStyle = '#efe6d2'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 2) {
      g.fillStyle = 'rgba(120,100,70,' + (0.05 + ((x * 7919) % 13) / 13 * 0.12).toFixed(3) + ')';
      g.fillRect(x, 0, 1, h);
    }
  });
  return cachePaginas;
}

/* ---------- texturas antigas de ambiente (concreto, pedra, madeira rústica, paisagem) ---------- */
function texturaTileavel(tipo) {
  const w = 512, h = 512;
  return textoEmCanvas(w, h, (g) => {
    if (tipo === 'concreto') {
      g.fillStyle = '#8d8b84'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 220; i++) {
        const x = Math.random() * w, y = Math.random() * h, r = 8 + Math.random() * 38;
        g.fillStyle = 'rgba(0,0,0,' + (0.02 + Math.random() * 0.05).toFixed(3) + ')';
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
      for (let i = 0; i < 140; i++) {
        const x = Math.random() * w, y = Math.random() * h, r = 2 + Math.random() * 5;
        g.fillStyle = 'rgba(255,255,255,' + (0.02 + Math.random() * 0.04).toFixed(3) + ')';
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
    } else if (tipo === 'pedra') {
      g.fillStyle = '#a89474'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * w, y = Math.random() * h, rw = 30 + Math.random() * 90, rh = 20 + Math.random() * 60;
        g.fillStyle = 'rgba(' + (120 + Math.random() * 40 | 0) + ',' + (100 + Math.random() * 40 | 0) + ',' + (70 + Math.random() * 30 | 0) + ',' + (0.25 + Math.random() * 0.25).toFixed(3) + ')';
        g.beginPath(); g.ellipse(x, y, rw, rh, Math.random() * Math.PI, 0, Math.PI * 2); g.fill();
      }
    } else {
      g.fillStyle = '#6b4a30'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 26; i++) {
        const y0 = i * (h / 26);
        g.strokeStyle = 'rgba(40,24,12,' + (0.15 + Math.random() * 0.18).toFixed(3) + ')';
        g.lineWidth = 1 + Math.random() * 2;
        g.beginPath(); g.moveTo(0, y0);
        for (let x = 0; x <= w; x += 24) g.lineTo(x, y0 + Math.sin(x * 0.02 + i) * 6);
        g.stroke();
      }
    }
  });
}
function texturaPaisagem() {
  const w = 1024, h = 640;
  return textoEmCanvas(w, h, (g) => {
    const ceu = g.createLinearGradient(0, 0, 0, h * 0.62);
    ceu.addColorStop(0, '#2b3a5c'); ceu.addColorStop(0.45, '#7f6a8f'); ceu.addColorStop(0.75, '#e2916a'); ceu.addColorStop(1, '#f6c667');
    g.fillStyle = ceu; g.fillRect(0, 0, w, h * 0.62);
    g.fillStyle = 'rgba(255,238,200,.9)';
    g.beginPath(); g.arc(w * 0.72, h * 0.46, 54, 0, Math.PI * 2); g.fill();
    [['#3c3350', 0.58], ['#2a2440', 0.66], ['#1c1830', 0.78]].forEach(([cor, baseY], k) => {
      g.fillStyle = cor;
      let x = 0; const y0 = h * baseY;
      g.beginPath(); g.moveTo(0, h); g.lineTo(0, y0);
      while (x < w) { x += 60 + ((x * 13 + k * 97) % 90); g.lineTo(x, y0 - ((x * 7 + k * 31) % 70)); }
      g.lineTo(w, h); g.closePath(); g.fill();
    });
    g.fillStyle = '#14101a'; g.fillRect(0, h * 0.9, w, h * 0.1);
  });
}

/* ---------- acabamento de imagem: vinheta suave, grão de filme quase imperceptível, calor leve ---------- */
const AcabamentoShader = {
  uniforms: { tDiffuse: { value: null }, uTempo: { value: 0 }, uVinheta: { value: 0.32 }, uGrao: { value: 0.028 }, uCalor: { value: new THREE.Vector3(1.008, 1.0, 0.99) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: [
    'uniform sampler2D tDiffuse; uniform float uTempo; uniform float uVinheta; uniform float uGrao; uniform vec3 uCalor; varying vec2 vUv;',
    'float rnd(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }',
    'void main(){',
    '  vec4 c = texture2D(tDiffuse, vUv);',
    '  vec2 d = vUv - 0.5;',
    '  c.rgb *= 1.0 - uVinheta * smoothstep(0.18, 0.75, dot(d, d) * 2.0);',
    '  c.rgb *= uCalor;',
    '  c.rgb += (rnd(vUv * 1000.0 + uTempo) - 0.5) * uGrao;',
    '  gl_FragColor = c;',
    '}',
  ].join('\n'),
};

/* ---------- o palco: renderizador, cena, câmera, luzes, pós-processamento ---------- */
export function criarPalco(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, movel ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 80);

  const hemi = new THREE.HemisphereLight(0xfff4e6, 0x8a7560, 0.35);
  cena.add(hemi);
  const sol = new THREE.DirectionalLight(0xfff4e8, 2.4);
  sol.castShadow = true;
  sol.shadow.mapSize.set(movel ? 1024 : 2048, movel ? 1024 : 2048);
  sol.shadow.bias = -0.0003;
  sol.shadow.normalBias = 0.015;
  sol.shadow.radius = 3;
  const DIR_SOL = new THREE.Vector3(2.4, 4.2, 3.6).normalize();
  cena.add(sol, sol.target);
  const preenchimento = new THREE.DirectionalLight(0xdfe8ff, 0.45);
  preenchimento.position.set(-4, 2.5, 3);
  cena.add(preenchimento);

  // alvo com MSAA: sem isso, todo pós-processamento perde o antisserrilhado e as bordas ficam em serra
  const alvo = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: movel ? 2 : 4 });
  const composer = new EffectComposer(renderer, alvo);
  composer.addPass(new RenderPass(cena, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), 0.14, 0.55, 0.93);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const acabamento = new ShaderPass(AcabamentoShader);
  composer.addPass(acabamento);

  const materiaisPBR = new Set();
  let intensidadeAmbiente = 0.75;
  function pbr(opcoes) {
    const m = new THREE.MeshStandardMaterial(opcoes);
    m.envMapIntensity = (opcoes.envMapIntensity != null ? opcoes.envMapIntensity : 1) * intensidadeAmbiente;
    m.userData.envBase = opcoes.envMapIntensity != null ? opcoes.envMapIntensity : 1;
    materiaisPBR.add(m);
    return m;
  }
  function definirLuz(env, exposicao, forcaSol) {
    intensidadeAmbiente = env;
    materiaisPBR.forEach((m) => { m.envMapIntensity = m.userData.envBase * env; });
    renderer.toneMappingExposure = exposicao;
    sol.intensity = forcaSol;
  }

  /* sombra do sol ajustada ao móvel: a caixa ortográfica cobre só o que importa (sombra nítida) */
  function ajustarSombra(centroX, centroY, largura, altura, profundidade = 1.2) {
    const c = sol.shadow.camera;
    const meia = Math.max(largura, altura) / 2 + 0.8;
    c.left = -meia; c.right = meia; c.top = meia; c.bottom = -meia;
    c.near = 0.5; c.far = 14 + profundidade;
    c.updateProjectionMatrix();
    sol.target.position.set(centroX, centroY, 0);
    sol.position.copy(sol.target.position).addScaledVector(DIR_SOL, 7);
    sol.shadow.needsUpdate = true;
  }

  function redimensionar() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(w, h);
  }

  /* qualidade adaptativa: se o computador não sustenta ~25 quadros/s enquanto a cena se mexe,
     desce um degrau (resolução 1x e sem brilho → sombra menor → sem sombra). "?qualidade=max" trava no máximo. */
  const travarQualidade = /[?&]qualidade=max/.test(location.search);
  let nivel = 0;
  const amostras = [];
  const NIVEL_MAX = 4;
  function aplicarNivel(n) {
    nivel = Math.min(NIVEL_MAX, n);
    if (nivel >= 1) { renderer.setPixelRatio(1); bloom.enabled = false; }
    if (nivel >= 2) { [composer.renderTarget1, composer.renderTarget2].forEach((rt) => { rt.samples = 0; rt.dispose(); }); }
    if (nivel >= 3) { sol.shadow.mapSize.set(1024, 1024); if (sol.shadow.map) { sol.shadow.map.dispose(); sol.shadow.map = null; } }
    if (nivel >= 4) { renderer.shadowMap.enabled = false; cena.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.needsUpdate = true; }); }); }
    redimensionar();
  }
  let ultimoRender = 0;
  let tempo = 0;
  function renderizar(dt) {
    const agora = performance.now();
    if (!travarQualidade && nivel < NIVEL_MAX && ultimoRender && agora - ultimoRender < 250) {
      amostras.push(agora - ultimoRender);
      if (amostras.length >= 40) {
        const mediana = amostras.sort((a, b) => a - b)[20];
        amostras.length = 0;
        if (mediana > 40) aplicarNivel(nivel + 1);
      }
    }
    ultimoRender = agora;
    tempo += dt;
    acabamento.uniforms.uTempo.value = (tempo * 7.13) % 100;
    composer.render();
  }
  const qualidade = () => nivel;
  if (/[?&]qualidade=min/.test(location.search)) aplicarNivel(NIVEL_MAX);

  return { THREE, renderer, cena, camera, composer, sol, hemi, pbr, definirLuz, ajustarSombra, redimensionar, renderizar, materiaisPBR, qualidade };
}

/* ---------- a sala: chão, parede, rodapé e o que aparece atrás; trocável ---------- */
export const AMBIENTES = [['estudio', 'Estúdio claro'], ['noite', 'Noite quente'], ['nenhum', 'Sem fundo'], ['concreto', 'Concreto'], ['pedra', 'Pedra'], ['madeira', 'Madeira'], ['paisagem', 'Paisagem']];

export function criarSala(palco, { paredeZ = -0.16 } = {}) {
  const { cena, pbr, definirLuz, hemi } = palco;
  const grupo = new THREE.Group();
  cena.add(grupo);
  const texturasVelhas = {};
  const velha = (tipo) => (texturasVelhas[tipo] || (texturasVelhas[tipo] = tipo === 'paisagem' ? texturaPaisagem() : texturaTileavel(tipo)));

  function limpar() {
    grupo.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material && o.userData.descartar) o.material.dispose(); });
    grupo.clear();
  }
  function plano(larg, alt, material, descartar) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(larg, alt), material);
    m.receiveShadow = true;
    m.userData.descartar = descartar;
    grupo.add(m);
    return m;
  }

  const gesso = texturaGesso();
  const assoalho = texturaAssoalho();
  const matParede = pbr({ ...gesso, color: 0xffffff, roughness: 1, bumpScale: 0.6, envMapIntensity: 0.5 });
  const matChao = pbr({ ...assoalho, color: 0xffffff, roughness: 1, bumpScale: 0.8, envMapIntensity: 0.9 });
  const matRodape = pbr({ color: 0xf4f0e8, roughness: 0.5 });

  function aplicar(tipo) {
    limpar();
    cena.fog = null;
    if (tipo === 'estudio' || tipo === 'noite') {
      const noite = tipo === 'noite';
      const fundo = noite ? 0x2a2019 : 0xe8e0d3;
      cena.background = new THREE.Color(fundo);
      cena.fog = new THREE.Fog(fundo, 9, 22);
      const chao = plano(40, 40, matChao); chao.rotation.x = -Math.PI / 2; chao.position.y = 0;
      const parede = plano(40, 12, noite ? pbr({ ...gesso, color: 0x9a8570, roughness: 1, bumpScale: 0.6, envMapIntensity: 0.4 }) : matParede, noite);
      parede.position.set(0, 6, paredeZ);
      const rodape = new THREE.Mesh(new THREE.BoxGeometry(40, 0.09, 0.02), matRodape);
      rodape.position.set(0, 0.045, paredeZ + 0.01);
      rodape.receiveShadow = true;
      grupo.add(rodape);
      hemi.color.set(noite ? 0xffc996 : 0xfff4e6);
      hemi.intensity = noite ? 0.2 : 0.35;
      definirLuz(noite ? 0.35 : 0.8, noite ? 0.95 : 1.0, noite ? 1.6 : 2.4);
      palco.sol.color.set(noite ? 0xffc08a : 0xfff4e8);
      return;
    }
    palco.sol.color.set(0xfff0dc);
    hemi.color.set(0xfff4e6);
    if (tipo === 'nenhum') {
      cena.background = new THREE.Color(0x241d16);
      cena.fog = new THREE.Fog(0x241d16, 4, 12);
      const chao = plano(40, 40, pbr({ color: 0x2a2119, roughness: 0.9, envMapIntensity: 0.3 }), true);
      chao.rotation.x = -Math.PI / 2;
      hemi.intensity = 0.25;
      definirLuz(0.4, 1.0, 1.9);
      return;
    }
    if (tipo === 'paisagem') {
      cena.background = velha('paisagem');
      cena.fog = new THREE.Fog(0x6a5a68, 6, 18);
      const chao = plano(40, 40, pbr({ color: 0x342c22, roughness: 0.95, envMapIntensity: 0.3 }), true);
      chao.rotation.x = -Math.PI / 2;
      hemi.intensity = 0.3;
      definirLuz(0.5, 1.0, 2.0);
      return;
    }
    const tex = velha(tipo);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(tipo === 'madeira' ? 2 : 5, tipo === 'madeira' ? 2 : 5);
    const corFundo = { concreto: 0x8d8b84, pedra: 0xa89474, madeira: 0x4a3320 }[tipo];
    cena.background = new THREE.Color(corFundo);
    cena.fog = new THREE.Fog(corFundo, 8, 20);
    const mat = pbr({ map: tex, roughness: 0.92, envMapIntensity: 0.5 });
    const chao = plano(40, 40, mat, true); chao.rotation.x = -Math.PI / 2;
    const parede = plano(40, 12, mat, false); parede.position.set(0, 6, paredeZ);
    hemi.intensity = 0.3;
    definirLuz(0.6, 1.0, 2.2);
  }
  return { aplicar };
}

/* ---------- câmera que desliza: amortecimento, inércia ao soltar, paralaxe leve com o mouse ----------
   `cfg` guarda o ALVO (x, altoAlvo, dist, limites); a câmera persegue suavemente. `travado`
   posiciona na hora, sem suavizar (usado pra enquadrar um objeto com exatidão). */
export function criarCameraSuave(camera, cfg) {
  const atual = { x: cfg.x, y: cfg.altoAlvo, d: cfg.dist + 1.4 };
  const vel = { x: 0, y: 0 };
  let arrastando = false, ultimo = 0;
  const mouse = { x: 0, y: 0, ax: 0, ay: 0 };
  if (!movel) window.addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; }, { passive: true });
  return {
    arrastar(dx, dy) {
      const agora = performance.now();
      const dt = Math.max(0.008, (agora - (ultimo || agora - 16)) / 1000);
      ultimo = agora;
      arrastando = true;
      const nx = clamp(cfg.x + dx, cfg.xMin, cfg.xMax), ny = clamp(cfg.altoAlvo + dy, cfg.altoMin, cfg.altoMax);
      vel.x = 0.6 * vel.x + 0.4 * ((nx - cfg.x) / dt);
      vel.y = 0.6 * vel.y + 0.4 * ((ny - cfg.altoAlvo) / dt);
      cfg.x = nx; cfg.altoAlvo = ny;
    },
    soltar() {
      arrastando = false;
      if (performance.now() - ultimo > 90) { vel.x = 0; vel.y = 0; }
    },
    parar() { vel.x = 0; vel.y = 0; },
    ja() { atual.x = cfg.x; atual.y = cfg.altoAlvo; atual.d = cfg.dist; },
    passo(dt) {
      if (cfg.travado) {
        const t = cfg.travado;
        const mexeu = Math.abs(atual.x - t.x) + Math.abs(atual.y - t.y) + Math.abs(atual.d - t.dist) > 1e-5;
        camera.position.set(t.x, t.y, t.dist);
        camera.lookAt(t.x, t.y, 0);
        atual.x = t.x; atual.y = t.y; atual.d = t.dist;
        return mexeu;
      }
      const antes = camera.position.clone();
      if (!arrastando && (Math.abs(vel.x) > 0.002 || Math.abs(vel.y) > 0.002)) {
        cfg.x = clamp(cfg.x + vel.x * dt, cfg.xMin, cfg.xMax);
        cfg.altoAlvo = clamp(cfg.altoAlvo + vel.y * dt, cfg.altoMin, cfg.altoMax);
        const f = Math.exp(-dt * 4.5);
        vel.x *= f; vel.y *= f;
      }
      const k = 1 - Math.exp(-dt * 7.5);
      atual.x += (cfg.x - atual.x) * k;
      atual.y += (cfg.altoAlvo - atual.y) * k;
      atual.d += (cfg.dist - atual.d) * (1 - Math.exp(-dt * 3.2));
      const km = 1 - Math.exp(-dt * 3);
      mouse.ax += (mouse.x - mouse.ax) * km; mouse.ay += (mouse.y - mouse.ay) * km;
      camera.position.set(atual.x + mouse.ax * 0.06, atual.y + 0.1 - mouse.ay * 0.04, atual.d);
      camera.lookAt(atual.x, atual.y, 0);
      return camera.position.distanceToSquared(antes) > 1e-10;
    },
  };
}

/* ---------- pequenos objetos de cena, compartilhados ---------- */
export function criarPlanta(pbr, escala = 1) {
  const g = new THREE.Group();
  const vaso = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.12, 28), pbr({ color: 0xe9e2d6, roughness: 0.45 }));
  vaso.position.y = 0.06; vaso.castShadow = true; vaso.receiveShadow = true;
  g.add(vaso);
  const terra = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.064, 0.01, 24), pbr({ color: 0x3b2b1e, roughness: 1 }));
  terra.position.y = 0.115; g.add(terra);
  const folhaMat = pbr({ color: 0x4f7a45, roughness: 0.6, side: THREE.DoubleSide });
  const R = criarRuido(42);
  for (let i = 0; i < 11; i++) {
    const folha = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), folhaMat);
    const ang = (i / 11) * Math.PI * 2 + R.rnd();
    const alt = 0.16 + R.rnd() * 0.16;
    folha.scale.set(0.45, 1.5 + R.rnd() * 0.8, 0.12);
    folha.position.set(Math.cos(ang) * 0.035, alt, Math.sin(ang) * 0.035);
    folha.rotation.set(Math.sin(ang) * 0.5, -ang, Math.cos(ang) * 0.5);
    folha.castShadow = true;
    g.add(folha);
  }
  g.scale.setScalar(escala);
  return g;
}
