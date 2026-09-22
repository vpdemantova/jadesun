import * as THREE from './vendor/three.module.min.js';
import { criarCeu, vetor } from './j-ceu.js';
import { construir } from './j-plantas.js';
import { Estado, nivelDe, aguaDe, secasDe, CONQUISTAS, TOPICOS_POR_SEMENTE, hojeISO } from './j-estado.js';

const P = window.Perfil;
const Ceu = window.Ceu;
const ESP = window.ESPECIES;
const RAD = Math.PI / 180;
const esc = P.esc;
const $ = (id) => document.getElementById(id);
const movel = matchMedia('(pointer: coarse)').matches || innerWidth < 700;
const PONTOS_CARD = ['norte', 'nordeste', 'leste', 'sudeste', 'sul', 'sudoeste', 'oeste', 'noroeste'];

const ICO = {
  ver: '<path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  regar: '<path d="M4 10h10v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M14 12h3.5L21 7"/><path d="M8 10V7a2 2 0 0 1 2-2"/>',
  podar: '<circle cx="6" cy="18" r="2.5"/><circle cx="6" cy="6" r="2.5"/><path d="M8 7.5 20 17M8 16.5 20 7"/>',
  semear: '<path d="M12 21v-8"/><path d="M12 13c-4 0-6-2.5-6-6 4 0 6 2 6 6z"/><path d="M12 13c4 0 6-2.5 6-6-4 0-6 2-6 6z"/>',
  tele: '<path d="M3 13l12-6 2 4-12 6z"/><path d="M15 7l2-1 2 4-2 1"/><path d="M9 17l-3 4M11 16l3 5"/>',
  pulo: '<path d="M12 20V6"/><path d="M6 11l6-6 6 6"/>',
  agachar: '<path d="M12 4v14"/><path d="M6 13l6 6 6-6"/>',
};
const ico = (n) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[n] + '</svg>';
const FERR = [['ver', 'Ver', '1', 'Toque numa planta ou num astro para ler sobre ele.'], ['regar', 'Regar', '2', 'Toque numa planta para regar. Plantas sem água murcham.'], ['podar', 'Podar', '3', 'Toque numa planta com folhas secas (marrons) para podar.'], ['semear', 'Semear', '4', 'Toque num canteiro livre para plantar uma semente.'], ['tele', 'Telescópio', '5', 'Aproxima o céu. Roda do mouse ou dois dedos mudam o zoom.']];

/* ---------- utilidades ---------- */
function suave(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function altura(x, z) {
  const r = Math.hypot(x, z);
  const m = suave(17, 40, r);
  return m * (0.9 * Math.sin(x * 0.06 + 0.5) * Math.cos(z * 0.05) + 0.5 * Math.sin(x * 0.11 + z * 0.09 + 2) + 0.25 * Math.sin(x * 0.23) * Math.sin(z * 0.21));
}
function cardeal(az) { return PONTOS_CARD[Math.round(((az % 360) + 360) % 360 / 45) % 8]; }
function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function fmtHora(d) { return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }

async function iniciar() {
  const palco = $('palco');
  const canvas = $('mundo');
  if (!palco || !canvas) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !movel, powerPreference: 'high-performance' });
  } catch (e) { return semWebGL(); }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, movel ? 1.5 : 2));
  renderer.shadowMap.enabled = !movel;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const cena = new THREE.Scene();
  cena.fog = new THREE.Fog(0x9bb8d8, 26, 180);
  const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 1500);
  camera.rotation.order = 'YXZ';

  /* ---------- estado, matérias, fichas ---------- */
  const estado = new Estado();
  const [, checklist, indice] = await Promise.all([
    estado.carregar(),
    P.estado(true).then((e) => e.checklist).catch(() => []),
    fetch('/api/biblioteca').then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]);
  const totalFeitos = checklist.reduce((s, x) => s + x.feitos, 0);
  const totalItens = checklist.reduce((s, x) => s + x.total, 0);
  const dia0 = estado.dia();
  if (dia0.base == null) { dia0.base = totalFeitos; estado.mudou(); }
  const meuDiaHoje = () => { const m = (estado.d.meudia || {})[hojeISO()] || {}; return Object.keys(m).filter((k) => m[k]).length; };
  let avisoMeuDia = 0;
  { const n = meuDiaHoje(); const pago = dia0.meudiaPago || 0; if (n > pago) { estado.ganhar(n - pago); dia0.meudiaPago = n; avisoMeuDia = n - pago; estado.mudou(); } }

  function fichaDe(esp) {
    if (!indice) return null;
    const termos = esp.busca.map(norm);
    const acervo = indice.itens.filter((it) => it[0].indexOf('atlas/') === 0 || it[0].indexOf('atlas') === 0);
    const base = acervo.length ? acervo : indice.itens;
    for (const it of base) { if (termos.indexOf(norm(it[1])) >= 0) return it[0]; }
    for (const it of base) { const t = norm(it[1]); if (termos.some((q) => t.indexOf(q + ' (') === 0 || t.indexOf(q + '-') === 0 || (q.indexOf(' ') < 0 && /^[a-z]+dendron$/.test(q) && t.indexOf(q + ' ') === 0))) return it[0]; }
    return null;
  }
  const fichas = {};
  ESP.forEach((e) => { fichas[e.id] = fichaDe(e); });

  /* ---------- luzes e céu ---------- */
  const luzes = {
    sol: new THREE.DirectionalLight(0xffffff, 2.4),
    lua: new THREE.DirectionalLight(0x9fb4e8, 0.4),
    hemi: new THREE.HemisphereLight(0xbcd4f0, 0x2a2a1c, 0.9),
  };
  luzes.sol.castShadow = !movel;
  luzes.sol.shadow.mapSize.set(2048, 2048);
  const sc = luzes.sol.shadow.camera;
  sc.left = -26; sc.right = 26; sc.top = 26; sc.bottom = -26; sc.near = 1; sc.far = 220;
  luzes.sol.shadow.bias = -0.0006;
  luzes.sol.shadow.normalBias = 0.05;
  cena.add(luzes.sol, luzes.sol.target, luzes.lua, luzes.hemi);

  const ceu = criarCeu(cena, luzes, window.CEU_DADOS);
  cena.add(ceu.grupo);

  /* ---------- terreno ---------- */
  const NG = 110;
  const gTer = new THREE.PlaneGeometry(150, 150, NG, NG);
  gTer.rotateX(-Math.PI / 2);
  const pTer = gTer.attributes.position;
  const corTer = new Float32Array(pTer.count * 3);
  for (let i = 0; i < pTer.count; i++) {
    const x = pTer.getX(i), z = pTer.getZ(i);
    const y = altura(x, z);
    pTer.setY(i, y);
    const ruido = 0.5 + 0.5 * Math.sin(x * 0.9 + Math.sin(z * 0.7) * 2) * Math.cos(z * 0.8);
    const r = Math.hypot(x, z);
    const seco = suave(30, 70, r) * 0.25;
    corTer[i * 3] = 0.20 + 0.07 * ruido + seco * 0.5;
    corTer[i * 3 + 1] = 0.40 + 0.10 * ruido - seco * 0.1;
    corTer[i * 3 + 2] = 0.16 + 0.04 * ruido;
  }
  gTer.setAttribute('color', new THREE.BufferAttribute(corTer, 3));
  gTer.computeVertexNormals();
  const terreno = new THREE.Mesh(gTer, new THREE.MeshLambertMaterial({ vertexColors: true }));
  terreno.receiveShadow = true;
  cena.add(terreno);

  const chaoLonge = new THREE.Mesh(new THREE.CircleGeometry(700, 32), new THREE.MeshBasicMaterial({ color: 0x2c4a2c, fog: true }));
  chaoLonge.rotation.x = -Math.PI / 2;
  chaoLonge.position.y = -0.3;
  cena.add(chaoLonge);

  /* montanhas distantes e bosque */
  const montMat = new THREE.MeshBasicMaterial({ color: 0x3f5a52, fog: true });
  for (let i = 0; i < 34; i++) {
    const a = i / 34 * Math.PI * 2 + Math.sin(i * 12.9) * 0.05;
    const w = 22 + (Math.abs(Math.sin(i * 3.7)) * 26), h = 5 + Math.abs(Math.sin(i * 5.3)) * 8;
    const m = new THREE.Mesh(new THREE.ConeGeometry(w, h, 6), montMat);
    m.position.set(Math.sin(a) * 135, h / 2 - 1, -Math.cos(a) * 135);
    cena.add(m);
  }
  const copaMat = new THREE.MeshLambertMaterial({ color: 0x2d5a34, flatShading: true });
  const arvores = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 2.4, 6), copaMat, 110);
  const dm = new THREE.Object3D();
  for (let i = 0; i < 110; i++) {
    const a = Math.random() * Math.PI * 2, r = 52 + Math.random() * 18;
    const s = 2.5 + Math.random() * 3.5;
    dm.position.set(Math.sin(a) * r, altura(Math.sin(a) * r, -Math.cos(a) * r) + s * 1.2, -Math.cos(a) * r);
    dm.scale.set(s * 0.7, s, s * 0.7);
    dm.rotation.y = Math.random() * 6;
    dm.updateMatrix();
    arvores.setMatrixAt(i, dm.matrix);
  }
  cena.add(arvores);

  /* ---------- grama ---------- */
  const NGRAMA = movel ? 6000 : 15000;
  const gBlade = new THREE.BufferGeometry();
  /* duas lâminas cruzadas em X (mesma base, giradas 90°) em vez de uma só — de qualquer ângulo sempre há silhueta de grama; uma lâmina só "sumia de lado" ao girar a câmera */
  gBlade.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.035, 0, 0, 0.035, 0, 0, 0, 1, 0,
    0, 0, -0.035, 0, 0, 0.035, 0, 1, 0,
  ], 3));
  const matGrama = new THREE.ShaderMaterial({
    side: THREE.DoubleSide, fog: false,
    uniforms: { uTempo: { value: 0 }, uBase: { value: new THREE.Color(0.10, 0.27, 0.10) }, uPonta: { value: new THREE.Color(0.42, 0.66, 0.24) }, uFog: { value: new THREE.Color(0x9bb8d8) }, uLuz: { value: 1 }, uNear: { value: 26 }, uFar: { value: 180 } },
    vertexShader: 'uniform float uTempo; uniform vec3 uBase; uniform vec3 uPonta; uniform float uLuz; uniform float uNear; uniform float uFar; varying vec3 vCor; varying float vFog;' +
      'void main(){ float h = position.y; vec4 wp = modelMatrix * (instanceMatrix * vec4(position, 1.0));' +
      'float s = sin(uTempo * 1.7 + wp.x * 0.6 + wp.z * 0.45) * 0.14 * h * h; wp.x += s; wp.z += s * 0.6;' +
      'vec4 mv = viewMatrix * wp; float v = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898, 78.233))) * 43758.5453);' +
      'vCor = mix(uBase, uPonta, h) * (0.7 + 0.6 * v) * uLuz; vFog = smoothstep(uNear, uFar, length(mv.xyz)); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uFog; varying vec3 vCor; varying float vFog; void main(){ gl_FragColor = vec4(mix(vCor, uFog, vFog), 1.0); }',
  });
  const grama = new THREE.InstancedMesh(gBlade, matGrama, NGRAMA);
  grama.frustumCulled = false;
  const NB0 = Math.max(checklist.length, 1);
  const evitar = [];
  for (let i = 0; i < NB0; i++) { const a = i / NB0 * Math.PI * 2; evitar.push([Math.sin(a) * 11, -Math.cos(a) * 11, 2.6]); }
  for (let i = 0; i < 10; i++) { const a = (i + 0.5) / 10 * Math.PI * 2; evitar.push([Math.sin(a) * 19.5, -Math.cos(a) * 19.5, 1.7]); }
  const livre = (x, z) => evitar.every((e) => (x - e[0]) * (x - e[0]) + (z - e[1]) * (z - e[1]) > e[2] * e[2]);
  for (let i = 0; i < NGRAMA; i++) {
    let x, z, r;
    do { const a = Math.random() * Math.PI * 2; r = Math.sqrt(Math.random()) * 46; x = Math.cos(a) * r; z = Math.sin(a) * r; } while (r < 6.6 || !livre(x, z));
    const h = 0.24 + Math.random() * 0.42;
    const larg = 0.75 + Math.random() * 0.55;
    dm.position.set(x, altura(x, z), z);
    dm.scale.set(larg, h, larg);
    dm.rotation.set(0, Math.random() * 6.28, (Math.random() - 0.5) * 0.3);
    dm.updateMatrix();
    grama.setMatrixAt(i, dm.matrix);
  }
  cena.add(grama);

  /* ---------- praça, telescópio, caminhos ---------- */
  const pedra = new THREE.MeshLambertMaterial({ color: 0xb8ab8a, flatShading: true });
  const praca = new THREE.Mesh(new THREE.CircleGeometry(5.6, 40), pedra);
  praca.rotation.x = -Math.PI / 2; praca.position.y = 0.03; praca.receiveShadow = true;
  cena.add(praca);
  const anelPraca = new THREE.Mesh(new THREE.RingGeometry(5.6, 6.2, 40), new THREE.MeshLambertMaterial({ color: 0x8a7d62 }));
  anelPraca.rotation.x = -Math.PI / 2; anelPraca.position.y = 0.035; anelPraca.receiveShadow = true;
  cena.add(anelPraca);

  /* telescópio: grafite fosco + aço escovado (não latão+azul de brinquedo), com buscador, objetiva e ocular —
     as peças que fazem um telescópio parecer um instrumento de verdade, não um tubo com um anel */
  const telescopio = new THREE.Group();
  const metal = new THREE.MeshLambertMaterial({ color: 0x2b2f36, flatShading: true });
  const aco = new THREE.MeshLambertMaterial({ color: 0x8a95a3, flatShading: true });
  const lente = new THREE.MeshLambertMaterial({ color: 0x0c1c2e, flatShading: true });
  const cuboTopo = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.13, 6), aco);
  cuboTopo.position.y = 0.8; cuboTopo.castShadow = true;
  telescopio.add(cuboTopo);
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * Math.PI * 2;
    const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.036, 1.52, 5), metal);
    perna.position.set(Math.cos(a) * 0.4, 0.7, Math.sin(a) * 0.4);
    perna.rotation.set(Math.sin(a) * 0.24, 0, -Math.cos(a) * 0.24);
    perna.castShadow = true;
    telescopio.add(perna);
  }
  const bandeja = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 3), aco);
  bandeja.position.y = 0.4;
  telescopio.add(bandeja);
  const montagem = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.11, 0.15), aco);
  montagem.position.y = 0.88; montagem.castShadow = true;
  telescopio.add(montagem);

  const grupoTubo = new THREE.Group();
  const tubo = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.35, 16), metal);
  tubo.castShadow = true;
  grupoTubo.add(tubo);
  const objetiva = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.02, 16), lente);
  objetiva.position.y = 0.675;
  grupoTubo.add(objetiva);
  const aroObjetiva = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.012, 6, 16), aco);
  aroObjetiva.position.y = 0.675; aroObjetiva.rotation.x = Math.PI / 2;
  grupoTubo.add(aroObjetiva);
  const ocular = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 0.17, 10), aco);
  ocular.position.y = -0.71;
  grupoTubo.add(ocular);
  const buscador = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.46, 8), metal);
  buscador.position.set(0.17, 0.24, 0);
  grupoTubo.add(buscador);
  const suporteBuscador = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.03), aco);
  suporteBuscador.position.set(0.1, 0.05, 0);
  grupoTubo.add(suporteBuscador);
  grupoTubo.position.y = 1.55;
  grupoTubo.rotation.set(0.95, 0, 0.18);
  telescopio.add(grupoTubo);
  telescopio.position.set(0, 0.03, 0);
  cena.add(telescopio);

  const caminho = new THREE.MeshLambertMaterial({ color: 0xa89a78 });

  /* ---------- canteiros das matérias ---------- */
  const NB = Math.max(checklist.length, 1);
  const RB = 11;
  const canteiros = [];
  const hitboxes = [];
  const invisivel = new THREE.MeshBasicMaterial({ visible: false });
  const solo = new THREE.MeshLambertMaterial({ color: 0x4a3524 });

  function placa(texto, sub, cor) {
    const c = document.createElement('canvas');
    c.width = 384; c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(16,15,12,0.82)';
    g.beginPath(); g.roundRect(4, 4, 376, 120, 22); g.fill();
    g.fillStyle = cor; g.beginPath(); g.roundRect(4, 4, 16, 120, 8); g.fill();
    g.fillStyle = '#f4efe1'; g.font = '600 40px system-ui, sans-serif'; g.textBaseline = 'middle';
    g.fillText(texto, 38, 46);
    g.fillStyle = '#c9c2ad'; g.font = '500 28px system-ui, sans-serif';
    g.fillText(sub, 38, 92);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function anelDePedras(raio, n) {
    const g = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2 + Math.random() * 0.08, 0), pedra);
      p.position.set(Math.cos(a) * raio, 0.1, Math.sin(a) * raio);
      p.scale.y = 0.7;
      p.rotation.set(Math.random(), Math.random() * 6, Math.random());
      p.castShadow = true;
      g.add(p);
    }
    return g;
  }

  const CORES_MATERIA = { lin: '#f2b91f', his: '#e0553c', geo: '#8ec44a', qui: '#f38a2f', bio: '#3fbf8a', mat: '#9b7bea', fis: '#4b8df0', fil: '#e75bb0', soc: '#2ec5d6', ing: '#d0d0d0' };

  checklist.forEach((s, i) => {
    const esp = window.ESPECIES_POR_MATERIA(s.nome);
    if (!esp) return;
    const ang = i / NB * Math.PI * 2;
    const x = Math.sin(ang) * RB, z = -Math.cos(ang) * RB;
    const g = new THREE.Group();
    g.position.set(x, altura(x, z), z);
    const ehLago = esp.id === 'vitoria-regia';
    if (!ehLago) {
      const soloMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.7, 0.16, 20), solo);
      soloMesh.position.y = 0.06; soloMesh.receiveShadow = true;
      g.add(soloMesh);
      g.add(anelDePedras(1.72, 15));
    }
    const pl = construir(esp.id, hash(esp.id));
    g.add(pl.grupo);
    const cor = CORES_MATERIA[P.corDe(s.nome)] || '#dddddd';
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: placa(s.nome, s.feitos + '/' + s.total + ' dominados', cor), transparent: true, depthWrite: false }));
    spr.scale.set(1.7, 0.57, 1);
    spr.position.set(0, Math.max(1.5, pl.altura * 0.42 + 0.9) * 0.9 + (ehLago ? 0.6 : 0) - 0.15, ehLago ? 2.4 : 1.85);
    spr.position.y = ehLago ? 1.1 : 0.85;
    g.add(spr);
    cena.add(g);
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(0.9, pl.raio * 0.8), Math.max(0.9, pl.raio * 0.8), pl.altura + 0.6, 10), invisivel);
    hit.position.y = (pl.altura + 0.6) / 2;
    g.add(hit);
    const c = { tipo: 'nucleo', id: esp.id, esp, materia: s.nome, secao: s, planta: pl, grupo: g, hit, raioColisao: (ehLago ? 2.3 : Math.max(1.2, pl.raio * 0.55 + 0.5)), sprite: spr, ultimoTexto: s.feitos, cor };
    hit.userData.alvo = c;
    hitboxes.push(hit);
    canteiros.push(c);
    /* caminho da praça até o canteiro */
    const comp = RB - 5.9 - 2.0;
    const cam = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, comp), caminho);
    cam.position.set(Math.sin(ang) * (5.9 + comp / 2), 0.035, -Math.cos(ang) * (5.9 + comp / 2));
    cam.rotation.y = -ang;
    cam.receiveShadow = true;
    cena.add(cam);
  });

  /* ---------- canteiros livres ---------- */
  const NSLOTS = 10;
  const RSLOT = 19.5;
  const slots = [];
  const marcaSlot = new THREE.MeshLambertMaterial({ color: 0x5c4630 });
  for (let i = 0; i < NSLOTS; i++) {
    const ang = (i + 0.5) / NSLOTS * Math.PI * 2;
    const x = Math.sin(ang) * RSLOT, z = -Math.cos(ang) * RSLOT;
    const g = new THREE.Group();
    g.position.set(x, altura(x, z), z);
    const s = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.12, 16), marcaSlot);
    s.position.y = 0.05; s.receiveShadow = true;
    g.add(s);
    g.add(anelDePedras(1.15, 10));
    const broto = new THREE.Group();
    broto.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 5), new THREE.MeshLambertMaterial({ color: 0x8fbf5a })));
    const f1 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 4), new THREE.MeshLambertMaterial({ color: 0x8fbf5a }));
    f1.position.set(0.09, 0.3, 0); f1.scale.set(1.4, 0.5, 0.8);
    const f2 = f1.clone(); f2.position.x = -0.09;
    broto.add(f1, f2);
    broto.position.y = 0.11;
    g.add(broto);
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.4, 10), invisivel);
    hit.position.y = 0.7;
    g.add(hit);
    cena.add(g);
    const sl = { tipo: 'slot', i, grupo: g, hit, broto, extra: null, planta: null, raioColisao: 1.3 };
    hit.userData.alvo = sl;
    hitboxes.push(hit);
    slots.push(sl);
  }

  function montarExtra(sl, ex) {
    if (sl.planta) { sl.grupo.remove(sl.planta.grupo); sl.planta = null; }
    sl.extra = ex;
    sl.broto.visible = !ex;
    if (!ex) return;
    const esp = ESP.find((e) => e.id === ex.sp);
    const pl = construir(ex.sp, hash(ex.id));
    sl.planta = pl;
    sl.esp = esp;
    sl.grupo.add(pl.grupo);
    sl.hit.scale.y = Math.max(1, (pl.altura + 0.4) / 1.4);
    sl.hit.position.y = 0.7 * sl.hit.scale.y;
    sl.raioColisao = Math.max(1.3, pl.raio * 0.55 + 0.5);
  }
  (estado.d.extras || []).forEach((ex) => { if (slots[ex.slot]) montarExtra(slots[ex.slot], ex); });

  /* ---------- gotas ---------- */
  const gotas = [];
  const gotaGeo = new THREE.SphereGeometry(0.035, 5, 4);
  const gotaMat = new THREE.MeshBasicMaterial({ color: 0x8fd0ff });
  function lancarGotas(de, para) {
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(gotaGeo, gotaMat);
      m.position.copy(de);
      cena.add(m);
      const alvo = para.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.7, 0, (Math.random() - 0.5) * 0.7));
      gotas.push({ m, de: de.clone(), para: alvo, t: -i * 0.03, dur: 0.55 + Math.random() * 0.15 });
    }
  }

  /* ---------- estado do jogador e câmera ---------- */
  const ALTURA_PE = 1.65, ALTURA_AGACHADO = 1.05, GRAVIDADE_PULO = 15, VEL_PULO = 5.6;
  const jog = { x: 0, z: 16, yaw: 0, pitch: -0.05, y: 1.65, altura: ALTURA_PE, pulo: 0, pulaVel: 0, agachado: false };
  const cam3 = { alvoYaw: 0, alvoPitch: 0 };
  let modo = 'vitrine';
  let entrando = 0;
  let orbita = 0;
  let fov = 68, fovAlvo = 68;
  let ferramenta = 'ver';
  let tele = false;
  let cartas = false;
  let offsetMin = 0;
  let tempo = 0;
  let solInfo = { dia: 1, sol: { alt: 30 } };
  let visivel = true;

  function dataCeu() { return new Date(Date.now() + offsetMin * 60000); }

  function atualizarCeu() {
    const d = dataCeu();
    solInfo = ceu.atualizar(d, Ceu.LOCAL);
    const pal = solInfo.pal;
    const cor = new THREE.Color(pal.h[0], pal.h[1], pal.h[2]);
    cena.fog.color.copy(cor);
    matGrama.uniforms.uFog.value.copy(cor);
    chaoLonge.material.color.setRGB(0.17 * (0.25 + 0.75 * solInfo.dia), 0.29 * (0.25 + 0.75 * solInfo.dia), 0.17 * (0.25 + 0.75 * solInfo.dia));
    const luzM = 0.10 + 0.90 * solInfo.dia;
    montMat.color.setRGB((0.25 + 0.15 * solInfo.dia) * luzM, (0.34 + 0.12 * solInfo.dia) * luzM, (0.32 + 0.12 * solInfo.dia) * luzM).lerp(cor, 0.30);
    matGrama.uniforms.uLuz.value = 0.28 + 0.72 * solInfo.dia;
    ceu.tamanhoEstrelas(renderer.getPixelRatio() * (movel ? 0.9 : 1), 68 / fov);
    ceu.mostrarConstelacoes(cartas);
    renderer.toneMappingExposure = 0.85 + 0.25 * solInfo.dia;
    pintarHora();
    montarAlvoDoDia();
  }

  function pintarHora() {
    const d = dataCeu();
    const s = ceu.estado;
    const fase = s.fase ? s.fase.nome : '';
    const periodo = s.solAlt > 6 ? 'dia' : s.solAlt > -6 ? 'crepúsculo' : 'noite';
    $('jd-hora').textContent = fmtHora(d) + ' · ' + periodo;
    $('jd-fase').textContent = 'Lua: ' + fase.toLowerCase() + ' (' + Math.round((s.fase ? s.fase.iluminada : 0) * 100) + '%)';
    const off = $('jd-off');
    if (off) off.textContent = offsetMin === 0 ? 'agora' : (offsetMin > 0 ? '+' : '−') + Math.floor(Math.abs(offsetMin) / 60) + 'h' + String(Math.abs(offsetMin) % 60).padStart(2, '0');
  }

  /* ---------- HUD ---------- */
  const ui = $('jd-ui');
  ui.innerHTML =
    '<div class="jd-topo"><button type="button" class="jd-chip" id="jd-b-ceu" aria-expanded="false"><b id="jd-hora">--:--</b><small id="jd-fase"></small></button>' +
    '<div class="jd-recursos"><span class="jd-nivel" id="jd-nivel"></span><span id="jd-orv"></span><span id="jd-sem"></span><button type="button" class="jd-chip" id="jd-b-miss">Missões <b id="jd-miss-n"></b></button></div></div>' +
    '<div class="jd-painel jd-ceu" id="jd-ceu" hidden><p class="rot">Relógio do céu <span id="jd-off"></span></p>' +
    '<input type="range" id="jd-slider" min="-720" max="720" step="5" value="0" aria-label="Deslocar a hora do céu">' +
    '<div class="jd-bts"><button type="button" class="opt" data-h="agora">Agora</button><button type="button" class="opt" data-h="poente">Pôr do sol</button><button type="button" class="opt" data-h="noite">Noite (21h)</button><button type="button" class="opt" data-h="nascer">Amanhecer</button></div>' +
    '<div class="jd-bts"><button type="button" class="opt" id="jd-b-cartas" aria-pressed="false">Constelações e nomes (C)</button></div>' +
    '<p class="jd-nota">Céu calculado para Campinas, na hora escolhida. Posições reais dos planetas, da Lua e de 2.500 estrelas. Tamanhos da Lua e do Sol fora de escala.</p></div>' +
    '<div class="jd-painel jd-miss" id="jd-miss" hidden></div>' +
    '<div class="jd-ficha" id="jd-ficha" hidden></div>' +
    '<div class="jd-picker" id="jd-picker" hidden></div>' +
    '<div class="jd-mira" id="jd-mira" aria-hidden="true"></div><div class="jd-tele-mascara" id="jd-tele-mascara" aria-hidden="true"></div>' +
    '<div id="jd-rotulos" aria-hidden="true"></div>' +
    '<div class="jd-dica" id="jd-dica"></div>' +
    '<div class="jd-barra" id="jd-barra" role="toolbar" aria-label="Ferramentas">' + FERR.map((f) => '<button type="button" class="jd-fer" data-f="' + f[0] + '" aria-pressed="' + (f[0] === 'ver') + '" title="' + esc(f[1] + ' (' + f[2] + ')') + '">' + ico(f[0]) + '<span>' + f[1] + '</span></button>').join('') + '</div>' +
    '<div class="jd-toast" id="jd-toast" role="status" aria-live="polite"></div>' +
    '<button type="button" class="botao pri jd-entrar" id="jd-entrar">Entrar no jardim</button>' +
    '<button type="button" class="jd-sair" id="jd-sair" hidden>Sair</button>' +
    '<div class="jd-joy" id="jd-joy" hidden><i></i></div>' +
    '<div class="jd-salta" id="jd-salta" hidden><button type="button" id="jd-b-pulo" aria-label="Pular">' + ico('pulo') + '</button><button type="button" id="jd-b-agachar" aria-label="Agachar (segure)">' + ico('agachar') + '</button></div>';

  const toastEl = $('jd-toast');
  const filaToast = [];
  let toastAtivo = false;
  function proximoToast() {
    const t = filaToast.shift();
    if (!t) { toastAtivo = false; toastEl.classList.remove('on'); return; }
    toastAtivo = true;
    toastEl.textContent = t;
    toastEl.classList.add('on');
    setTimeout(proximoToast, filaToast.length ? 1700 : 3000);
  }
  function toast(t) {
    if (filaToast.length < 5) filaToast.push(t);
    if (!toastAtivo) proximoToast();
  }

  function sementesDisponiveis() { return Math.floor(totalFeitos / TOPICOS_POR_SEMENTE) + (estado.d.bonusSementes || 0) - (estado.d.extras || []).length; }

  function pintarRecursos() {
    const nv = nivelDe(estado.d.orvalho);
    $('jd-nivel').textContent = 'Nível ' + nv.n + ' · ' + nv.titulo;
    $('jd-orv').textContent = estado.d.orvalho + ' orvalho';
    const n = sementesDisponiveis();
    $('jd-sem').textContent = n + (n === 1 ? ' semente' : ' sementes');
    const ms = missoes();
    $('jd-miss-n').textContent = ms.filter((m) => m.feita).length + '/' + ms.length;
  }

  /* ---------- missões ---------- */
  let alvoDia = null;
  function montarAlvoDoDia() {
    const iso = hojeISO();
    if (alvoDia && alvoDia.iso === iso) return;
    const noite = new Date(); noite.setHours(21, 0, 0, 0);
    const cands = [];
    const objs = [];
    Ceu.planetas(noite).forEach((p) => { const h = Ceu.horizonte(p.ra, p.dec, noite, Ceu.LOCAL); if (h.alt > 18) objs.push({ tipo: 'planeta', id: p.id, nome: p.nome, alt: h.alt, az: h.az }); });
    const l = Ceu.lua(noite); const hl = Ceu.horizonte(l.ra, l.dec, noite, Ceu.LOCAL);
    if (hl.alt > 18) objs.push({ tipo: 'lua', id: 'lua', nome: 'a Lua', alt: hl.alt, az: hl.az });
    const nomes = ['Sirius', 'Canopus', 'Achernar', 'Arcturus', 'Vega', 'Antares', 'Altair', 'Fomalhaut', 'Spica', 'Betelgeuse', 'Rigel', 'Aldebaran', 'Procyon'];
    window.CEU_DADOS.estrelas.forEach((e) => { if (e[4] && nomes.indexOf(e[4]) >= 0) { const h = Ceu.horizonte(e[0], e[1], noite, Ceu.LOCAL); if (h.alt > 22) objs.push({ tipo: 'estrela', id: e[4], nome: e[4], alt: h.alt, az: h.az }); } });
    ['Cru', 'Ori', 'Sco', 'Sgr', 'CMa', 'Cen', 'Leo', 'Tau'].forEach((id) => {
      const c = window.CEU_DADOS.constelacoes.find((x) => x.id === id);
      const h = Ceu.horizonte(c.ra, c.dec, noite, Ceu.LOCAL);
      if (h.alt > 25) objs.push({ tipo: 'constel', id, nome: c.nome, alt: h.alt, az: h.az });
    });
    const lista = objs.length ? objs : [{ tipo: 'lua', id: 'lua', nome: 'a Lua', alt: 0, az: 0 }];
    const a = lista[hash(iso) % lista.length];
    alvoDia = Object.assign({ iso }, a);
  }

  function missoes() {
    const d = estado.dia();
    const feitasEstudo = Math.max(0, totalFeitos - (d.base == null ? totalFeitos : d.base));
    const lista = [
      { id: 'regar', txt: 'Regar 3 plantas', prog: Math.min(3, d.regas), meta: 3 },
      { id: 'ceu', txt: alvoDia ? 'Encontrar ' + alvoDia.nome + ' no céu' : 'Encontrar um astro no céu', prog: d.feitas.indexOf('ceu') >= 0 ? 1 : 0, meta: 1, dica: alvoDia ? dicaCeu() : '' },
      { id: 'estudar', txt: 'Dominar 1 tópico no Domino', prog: Math.min(1, feitasEstudo), meta: 1 },
    ];
    lista.forEach((m) => { m.feita = m.prog >= m.meta; });
    return lista;
  }

  function dicaCeu() {
    if (!alvoDia) return '';
    const hoje21 = new Date(); hoje21.setHours(21, 0, 0, 0);
    return 'Às 21h fica na direção ' + cardeal(alvoDia.az) + ', a cerca de ' + Math.round(alvoDia.alt) + '° de altura. Use o relógio do céu para ir até a noite.';
  }

  function verificarMissoes() {
    const d = estado.dia();
    missoes().forEach((m) => {
      if (m.feita && d.feitas.indexOf(m.id) < 0) {
        d.feitas.push(m.id);
        estado.ganhar(3);
        toast('Missão cumprida: ' + m.txt + '. +3 orvalho');
      }
    });
    if (d.feitas.length >= 3 && !d.completo) {
      d.completo = true;
      estado.d.bonusSementes = (estado.d.bonusSementes || 0) + 1;
      if (estado.conquista('missoes')) toast(CONQUISTAS.missoes[0] + '. +1 semente');
    }
    if (totalFeitos >= 10 && estado.conquista('dez')) toast(CONQUISTAS.dez[0]);
    if (totalFeitos >= 50 && estado.conquista('cinquenta')) toast(CONQUISTAS.cinquenta[0]);
    if (nivelDe(estado.d.orvalho).n >= 5 && estado.conquista('nivel5')) toast(CONQUISTAS.nivel5[0]);
  }

  function renderMissoes() {
    const el = $('jd-miss');
    const ms = missoes();
    const nv = nivelDe(estado.d.orvalho);
    el.innerHTML = '<p class="rot">Missões de hoje</p><ol class="jd-ml">' + ms.map((m) => '<li class="' + (m.feita ? 'ok' : '') + '"><b>' + esc(m.txt) + '</b><span class="rot">' + m.prog + '/' + m.meta + (m.feita ? ' · cumprida' : '') + '</span>' + (m.dica && !m.feita ? '<small>' + esc(m.dica) + '</small>' : '') + '</li>').join('') + '</ol>' +
      '<p class="jd-nota">Meu dia (página Agora): ' + meuDiaHoje() + ' bloco(s) marcado(s) hoje. Cada um rende 1 orvalho quando você abre o jardim.</p>' +
      '<p class="jd-nota">Nível ' + nv.n + ': ' + (estado.d.orvalho - nv.base) + ' de ' + (nv.proximo - nv.base) + ' orvalhos até o próximo. A cada ' + TOPICOS_POR_SEMENTE + ' tópicos dominados nasce uma semente (' + sementesDisponiveis() + ' disponível).</p>' +
      '<p class="rot">Conquistas</p><ul class="jd-cq">' + Object.keys(CONQUISTAS).map((k) => '<li class="' + (estado.d.conquistas[k] ? 'ok' : '') + '" title="' + esc(CONQUISTAS[k][1]) + '">' + esc(CONQUISTAS[k][0]) + '</li>').join('') + '</ul>' +
      '<p class="jd-nota">' + (estado.status === 'caderno' ? 'Gravado no caderno (Logboard/# Profile/Jardim.md).' : 'Guardado neste navegador' + (estado.servidor ? '; será gravado no caderno na próxima ação.' : '.')) + '</p>';
  }

  estado.aoMudar = () => { pintarRecursos(); if (!$('jd-miss').hidden) renderMissoes(); };

  /* ---------- plantas: estado visual ---------- */
  function regDe(c) { return c.tipo === 'nucleo' ? estado.registro(c.id) : c.extra; }
  function progDe(c) {
    if (c.tipo === 'nucleo') return c.secao.total ? c.secao.feitos / c.secao.total : 0;
    const dias = (c.extra.dias || []).length;
    return Math.min(1, 0.25 + dias * 0.12 + (c.extra.plantadoEm ? Math.min(0.2, (Date.now() - c.extra.plantadoEm) / (14 * 86400000)) : 0));
  }
  function atualizarPlanta(c, agora) {
    const pl = c.planta;
    if (!pl) return;
    const reg = regDe(c);
    const agua = aguaDe(reg, agora);
    const p = window.__forcarProgresso != null ? window.__forcarProgresso : progDe(c);
    const noite = Math.max(0, Math.min(1, (-solInfo.sol.alt - 2) / 12));
    pl.definir({ crescimento: c.tipo === 'nucleo' ? Math.sqrt(p) : p, floracao: c.tipo === 'nucleo' ? Math.max(0, Math.min(1, (p - 0.2) / 0.5)) : Math.max(0, (p - 0.45) / 0.4), agua, secas: secasDe(reg, agora), noite, tempo });
    c.agua = agua;
    c.secas = secasDe(reg, agora);
    c.prog = p;
  }

  function refrescarPlacas() {
    canteiros.forEach((c) => {
      if (c.ultimoTexto === c.secao.feitos) return;
      c.ultimoTexto = c.secao.feitos;
      c.sprite.material.map.dispose();
      c.sprite.material.map = placa(c.materia, c.secao.feitos + '/' + c.secao.total + ' dominados', c.cor);
      c.sprite.material.needsUpdate = true;
    });
  }

  /* ---------- ficha da planta e do astro ---------- */
  const fichaEl = $('jd-ficha');
  function abrirFicha(html) {
    fichaEl.innerHTML = '<button type="button" class="jd-x" data-fechar aria-label="Fechar">×</button>' + html;
    fichaEl.hidden = false;
    fichaEl.classList.remove('jd-abre');
    void fichaEl.offsetWidth; /* força reflow: reinicia a animação mesmo trocando de uma ficha pra outra sem fechar */
    fichaEl.classList.add('jd-abre');
  }
  function fecharFicha() { fichaEl.hidden = true; fichaEl.classList.remove('jd-abre'); }

  function fichaPlanta(c) {
    const esp = c.tipo === 'nucleo' ? c.esp : c.esp;
    const reg = regDe(c);
    const agua = c.agua == null ? 1 : c.agua;
    const link = fichas[esp.id];
    const d = estado.dia();
    if (d.visitas.indexOf(esp.id) < 0) { d.visitas.push(esp.id); estado.mudou(); }
    const nucleo = c.tipo === 'nucleo';
    abrirFicha('<p class="rot">' + (nucleo ? esc(c.materia) + ' · planta do canteiro' : 'Canteiro livre') + '</p><h3 class="h3">' + esc(esp.nome) + '</h3><p class="jd-cient">' + esc(esp.cient) + ' · ' + esc(esp.familia) + '</p>' +
      (nucleo ? '<div class="jd-prog"><i style="width:' + Math.round(c.prog * 100) + '%"></i></div><p class="rot">' + c.secao.feitos + ' de ' + c.secao.total + ' tópicos dominados · ' + Math.round(c.prog * 100) + '%</p>' : '') +
      '<p><b>Água</b> <span class="jd-agua"><i style="width:' + Math.round(agua * 100) + '%"></i></span> ' + (agua < 0.35 ? '<em>com sede</em>' : agua < 0.7 ? 'pedindo água em breve' : 'bem regada') + (c.secas ? ' · ' + c.secas + (c.secas === 1 ? ' folha seca' : ' folhas secas') : '') + '</p>' +
      (nucleo && esp.porque ? '<p class="jd-porque">' + esc(esp.porque) + '</p>' : '') +
      '<p>' + esc(esp.fato) + '</p><p class="rot">Origem: ' + esc(esp.origem) + '</p>' +
      '<p class="acoes">' + (link ? '<a class="botao" href="biblioteca.html#f=' + encodeURI(link) + '">Ler a ficha no Atlas</a>' : '<span class="rot suave">Ficha no Atlas: ainda não escrita (vira tijolo em Falta).</span>') +
      '<button type="button" class="botao pri" data-regar-ficha>Regar</button></p>' +
      '<p class="jd-nota">Fatos de memória, conservadores: confira antes de citar.</p>');
    fichaEl._alvo = c;
  }

  function fichaAstro(o) {
    const h = ceu.estado;
    let linhas = '';
    const alt = Math.round(o.alt), az = Math.round(o.az);
    if (o.tipo === 'planeta') linhas = '<p>Planeta do Sistema Solar, a cerca de <b>' + o.dist.toFixed(2).replace('.', ',') + ' UA</b> da Terra agora (1 UA é a distância Terra–Sol).</p>';
    else if (o.tipo === 'lua') linhas = '<p>' + esc(o.fase.nome) + ' · ' + Math.round(o.fase.iluminada * 100) + '% iluminada.</p>';
    else if (o.tipo === 'sol') linhas = '<p>Nunca aponte o telescópio de verdade para o Sol sem filtro solar próprio.</p>';
    else linhas = '<p>Estrela de magnitude <b>' + String(o.mag).replace('.', ',') + '</b> (quanto menor, mais brilhante).</p>';
    const nome = o.nome || 'Estrela sem nome';
    abrirFicha('<p class="rot">' + (o.tipo === 'planeta' ? 'Planeta' : o.tipo === 'lua' ? 'Lua' : o.tipo === 'sol' ? 'Sol' : 'Estrela') + '</p><h3 class="h3">' + esc(nome) + '</h3>' + linhas +
      '<p class="rot">' + (alt >= 0 ? 'Altura ' + alt + '° · direção ' + cardeal(az) + ' (' + az + '°)' : 'Abaixo do horizonte agora') + '</p>' +
      '<p class="acoes"><button type="button" class="botao pri" data-diario>Registrar no diário do céu</button></p>');
    fichaEl._astro = o;
  }

  fichaEl.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-fechar')) return fecharFicha();
    if (b.hasAttribute('data-regar-ficha') && fichaEl._alvo) { regar(fichaEl._alvo); fichaPlanta(fichaEl._alvo); return; }
    if (b.hasAttribute('data-diario') && fichaEl._astro) {
      const o = fichaEl._astro;
      const d = new Date();
      estado.d.diario.push({ q: hojeISO(d) + ' ' + fmtHora(d), t: 'Vi ' + (o.nome || 'uma estrela') + ' (altura ' + Math.round(o.alt) + '°, ' + cardeal(o.az) + ')' });
      estado.mudou();
      toast('Registrado no diário do céu.');
      b.disabled = true;
    }
  });

  /* ---------- ações das ferramentas ---------- */
  function posMundo(c) { const p = new THREE.Vector3(); c.grupo.getWorldPosition(p); return p; }

  function regar(c) {
    const reg = regDe(c);
    const agora = Date.now();
    reg.t = agora;
    reg.dias = reg.dias || [];
    const hoje = hojeISO();
    if (reg.dias.indexOf(hoje) < 0) reg.dias.push(hoje);
    const d = estado.dia();
    const primeiraDoDia = reg.regaDia !== hoje;
    reg.regaDia = hoje;
    if (primeiraDoDia) { d.regas += 1; estado.d.regas += 1; estado.ganhar(1); toast('Regada. +1 orvalho'); } else toast('Já regada hoje. Ela agradece.');
    if (estado.conquista('rega')) toast(CONQUISTAS.rega[0] + '. +3 orvalho');
    const de = camera.position.clone().add(new THREE.Vector3(0, -0.2, 0));
    const p = posMundo(c); p.y += 0.6;
    lancarGotas(de.add(new THREE.Vector3(0, 0.6, 0)), p);
    atualizarPlanta(c, agora);
    verificarMissoes();
    estado.mudou();
  }

  function podar(c) {
    const reg = regDe(c);
    const agora = Date.now();
    const n = secasDe(reg, agora);
    if (!n) { toast('Nenhuma folha seca aqui.'); return; }
    reg.poda = agora;
    estado.d.podas += n;
    estado.dia().podas += n;
    estado.ganhar(n);
    toast('Podou ' + n + (n === 1 ? ' folha seca' : ' folhas secas') + '. +' + n + ' orvalho');
    if (estado.conquista('poda')) toast(CONQUISTAS.poda[0] + '. +3 orvalho');
    atualizarPlanta(c, agora);
    verificarMissoes();
    estado.mudou();
  }

  const pickerEl = $('jd-picker');
  function abrirPicker(sl) {
    const n = sementesDisponiveis();
    const extras = ESP.filter((e) => e.tipo === 'extra');
    pickerEl.innerHTML = '<button type="button" class="jd-x" data-fechar-picker aria-label="Fechar">×</button><p class="rot">Canteiro livre</p><h3 class="h3">Plantar uma semente</h3><p>' + (n > 0 ? 'Você tem <b>' + n + '</b> ' + (n === 1 ? 'semente' : 'sementes') + '. Escolha o que plantar:' : 'Você ainda não tem sementes. A cada ' + TOPICOS_POR_SEMENTE + ' tópicos dominados nasce uma; cumprir as três missões do dia também dá uma.') + '</p>' +
      '<ul class="jd-esp">' + extras.map((e) => '<li><button type="button" class="opt" data-plantar="' + e.id + '"' + (n > 0 ? '' : ' disabled') + '><b>' + esc(e.nome) + '</b><small>' + esc(e.cient) + '</small></button></li>').join('') + '</ul>';
    pickerEl.hidden = false;
    pickerEl.classList.remove('jd-abre');
    void pickerEl.offsetWidth;
    pickerEl.classList.add('jd-abre');
    pickerEl._slot = sl;
  }
  pickerEl.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-fechar-picker')) { pickerEl.hidden = true; return; }
    if (b.hasAttribute('data-plantar')) {
      const sl = pickerEl._slot;
      if (sementesDisponiveis() <= 0 || !sl || sl.extra) return;
      const sp = b.getAttribute('data-plantar');
      const ex = { id: 'x' + Date.now().toString(36), sp, slot: sl.i, plantadoEm: Date.now(), t: Date.now(), poda: 0, dias: [hojeISO()] };
      estado.d.extras.push(ex);
      estado.dia().plantou += 1;
      montarExtra(sl, ex);
      atualizarPlanta(sl, Date.now());
      pickerEl.hidden = true;
      toast(ESP.find((e) => e.id === sp).nome + ' plantada.');
      if (estado.conquista('semente')) toast(CONQUISTAS.semente[0] + '. +3 orvalho');
      verificarMissoes();
      estado.mudou();
    }
  });

  /* ---------- seleção com toque/clique ---------- */
  const ray = new THREE.Raycaster();
  function alvoNoPonto(cx, cy, limite) {
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera);
    ray.far = limite;
    const hit = ray.intersectObjects(hitboxes, false)[0];
    return { alvo: hit ? hit.object.userData.alvo : null, dir: ray.ray.direction.clone() };
  }

  function astroNaDirecao(dir, graus) {
    let melhor = null, dmin = Math.cos(graus * RAD);
    ceu.estado.objetos.forEach((o) => {
      if (o.alt < -1 || (o.tipo === 'sol' && o.alt < -3) || o.visivel === false) return;
      const d = o.vetor.dot(dir);
      if (d > dmin) { dmin = d; melhor = o; }
    });
    if (melhor) return melhor;
    if (solInfo.dia > 0.55) return null;
    return ceu.estrelaMaisPerto(dir, graus);
  }

  function clique(cx, cy) {
    const { alvo, dir } = alvoNoPonto(cx, cy, modo === 'passeio' ? 14 : 60);
    const f = ferramenta;
    if (alvo && alvo.tipo === 'slot' && !alvo.extra) {
      if (f === 'semear' || f === 'ver') return abrirPicker(alvo);
      return toast('Canteiro livre. Use a ferramenta Semear (4).');
    }
    if (alvo && (alvo.planta)) {
      if (f === 'regar') return regar(alvo);
      if (f === 'podar') return podar(alvo);
      if (f === 'semear') return toast('Este canteiro já tem uma planta.');
      return fichaPlanta(alvo);
    }
    if (f === 'regar' || f === 'podar' || f === 'semear') return toast('Mire numa planta' + (f === 'semear' ? ' ou num canteiro livre' : '') + '.');
    const astro = astroNaDirecao(dir, tele ? Math.max(1.2, fov * 0.06) : 3.5);
    if (astro) return fichaAstro(astro);
    if (f === 'tele' || tele) toast('Nada encontrado aqui. Aproxime com a roda do mouse ou arraste o céu.');
    else fecharFicha();
  }

  /* ---------- ferramentas e botões ---------- */
  function escolherFerramenta(f) {
    ferramenta = f;
    document.querySelectorAll('.jd-fer').forEach((b) => b.setAttribute('aria-pressed', b.getAttribute('data-f') === f ? 'true' : 'false'));
    const def = FERR.find((x) => x[0] === f);
    $('jd-dica').textContent = def ? def[3] : '';
    $('jd-dica').classList.add('on');
    clearTimeout(escolherFerramenta._t);
    escolherFerramenta._t = setTimeout(() => $('jd-dica').classList.remove('on'), 4200);
    setTele(f === 'tele');
  }
  function setTele(on) {
    tele = on;
    palco.classList.toggle('jd-tele', on);
    fovAlvo = on ? 14 : 68;
    if (on) { cartas = true; $('jd-b-cartas').setAttribute('aria-pressed', 'true'); }
    ceu.mostrarConstelacoes(cartas);
  }

  $('jd-barra').addEventListener('click', (ev) => { const b = ev.target.closest('.jd-fer'); if (b) escolherFerramenta(b.getAttribute('data-f')); });
  $('jd-b-pulo').addEventListener('pointerdown', (ev) => { ev.preventDefault(); teclas[' '] = true; });
  $('jd-b-pulo').addEventListener('pointerup', () => { teclas[' '] = false; });
  $('jd-b-pulo').addEventListener('pointercancel', () => { teclas[' '] = false; });
  $('jd-b-agachar').addEventListener('pointerdown', (ev) => { ev.preventDefault(); teclas.x = true; });
  $('jd-b-agachar').addEventListener('pointerup', () => { teclas.x = false; });
  $('jd-b-agachar').addEventListener('pointercancel', () => { teclas.x = false; });
  $('jd-b-ceu').addEventListener('click', () => { const p = $('jd-ceu'); p.hidden = !p.hidden; $('jd-b-ceu').setAttribute('aria-expanded', String(!p.hidden)); });
  $('jd-b-miss').addEventListener('click', () => { const p = $('jd-miss'); if (p.hidden) renderMissoes(); p.hidden = !p.hidden; });
  $('jd-slider').addEventListener('input', (ev) => { offsetMin = +ev.target.value; atualizarCeu(); });
  $('jd-ceu').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.id === 'jd-b-cartas') { cartas = !cartas; b.setAttribute('aria-pressed', String(cartas)); ceu.mostrarConstelacoes(cartas); return; }
    const h = b.getAttribute('data-h');
    if (!h) return;
    const agora = new Date();
    const np = Ceu.nascerEPoente(agora, Ceu.LOCAL);
    let alvo = null;
    if (h === 'agora') offsetMin = 0;
    else {
      if (h === 'poente') alvo = np.poente;
      if (h === 'noite') { alvo = new Date(); alvo.setHours(21, 0, 0, 0); }
      if (h === 'nascer') { alvo = np.nascer ? new Date(np.nascer.getTime() - 30 * 60000) : null; }
      if (alvo) offsetMin = Math.round((alvo.getTime() - agora.getTime()) / 60000);
    }
    offsetMin = Math.max(-720, Math.min(720, offsetMin));
    $('jd-slider').value = offsetMin;
    atualizarCeu();
  });

  /* ---------- entrar e sair ---------- */
  function entrar() {
    if (modo === 'passeio') return;
    modo = 'passeio';
    entrando = 0;
    palco.classList.add('jd-cheio');
    document.body.classList.add('jd-imersivo');
    $('jd-entrar').hidden = true;
    $('jd-sair').hidden = false;
    if (movel) { $('jd-joy').hidden = false; $('jd-salta').hidden = false; }
    try { if (palco.requestFullscreen && !document.fullscreenElement) palco.requestFullscreen().catch(() => {}); } catch (e) { /* segue sem tela cheia */ }
    escolherFerramenta('ver');
    redimensionar();
  }
  function sair() {
    if (modo !== 'passeio') return;
    modo = 'vitrine';
    palco.classList.remove('jd-cheio');
    document.body.classList.remove('jd-imersivo');
    $('jd-entrar').hidden = false;
    $('jd-sair').hidden = true;
    $('jd-joy').hidden = true;
    $('jd-salta').hidden = true;
    setTele(false);
    fecharFicha();
    try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch (e) { /* ok */ }
    redimensionar();
  }
  $('jd-entrar').addEventListener('click', entrar);
  $('jd-sair').addEventListener('click', sair);
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && modo === 'passeio' && palco.classList.contains('jd-cheio')) { /* mantém em tela cheia simulada */ } redimensionar(); });

  /* ---------- controles ---------- */
  const teclas = {};
  window.addEventListener('keydown', (ev) => {
    if (modo !== 'passeio') return;
    const tg = ev.target && ev.target.tagName;
    if (tg === 'INPUT' || tg === 'TEXTAREA' || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const k = ev.key.toLowerCase();
    teclas[k] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(k) >= 0) ev.preventDefault();
    if (k >= '1' && k <= '5') escolherFerramenta(FERR[+k - 1][0]);
    if (k === 't') escolherFerramenta(tele ? 'ver' : 'tele');
    if (k === 'c') { cartas = !cartas; $('jd-b-cartas').setAttribute('aria-pressed', String(cartas)); ceu.mostrarConstelacoes(cartas); }
    if (k === 'escape') { if (!$('jd-ficha').hidden) fecharFicha(); else if (!$('jd-picker').hidden) $('jd-picker').hidden = true; else sair(); }
  });
  window.addEventListener('keyup', (ev) => { teclas[ev.key.toLowerCase()] = false; });
  window.addEventListener('blur', () => { Object.keys(teclas).forEach((k) => { teclas[k] = false; }); });

  const ponteiros = new Map();
  let joy = { ativo: false, id: null, x0: 0, y0: 0, dx: 0, dy: 0 };
  let dist0 = 0;
  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', (ev) => {
    canvas.setPointerCapture(ev.pointerId);
    const r = canvas.getBoundingClientRect();
    const p = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, x0: ev.clientX, y0: ev.clientY, t0: performance.now(), moveu: false, tipo: ev.pointerType, joy: false };
    if (ev.pointerType === 'touch' && modo === 'passeio' && ev.clientX - r.left < r.width * 0.38 && ev.clientY - r.top > r.height * 0.45 && !joy.ativo) {
      p.joy = true; joy = { ativo: true, id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, dx: 0, dy: 0 };
    }
    ponteiros.set(ev.pointerId, p);
    if (ponteiros.size === 2 && tele) { const a = Array.from(ponteiros.values()); dist0 = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); }
  });
  canvas.addEventListener('pointermove', (ev) => {
    const p = ponteiros.get(ev.pointerId);
    if (!p) return;
    const dx = ev.clientX - p.x, dy = ev.clientY - p.y;
    p.x = ev.clientX; p.y = ev.clientY;
    if (Math.hypot(ev.clientX - p.x0, ev.clientY - p.y0) > 6) p.moveu = true;
    if (p.joy) { joy.dx = Math.max(-1, Math.min(1, (ev.clientX - joy.x0) / 48)); joy.dy = Math.max(-1, Math.min(1, (ev.clientY - joy.y0) / 48)); const j = $('jd-joy').firstChild; if (j) j.style.transform = 'translate(' + joy.dx * 24 + 'px,' + joy.dy * 24 + 'px)'; return; }
    if (ponteiros.size === 2 && tele) {
      const a = Array.from(ponteiros.values()); const d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
      if (dist0) fovAlvo = Math.max(1.8, Math.min(45, fovAlvo * dist0 / d));
      dist0 = d; return;
    }
    if (!p.moveu) return;
    const k = 0.0032 * (fov / 68);
    if (modo === 'passeio') { jog.yaw += dx * k; jog.pitch = Math.max(-1.35, Math.min(1.35, jog.pitch - dy * k)); }
    else orbita += dx * 0.006;
  });
  function soltar(ev) {
    const p = ponteiros.get(ev.pointerId);
    if (!p) return;
    ponteiros.delete(ev.pointerId);
    if (p.joy) { joy = { ativo: false, id: null, x0: 0, y0: 0, dx: 0, dy: 0 }; const j = $('jd-joy').firstChild; if (j) j.style.transform = ''; return; }
    if (ev.type === 'pointerup' && !p.moveu && performance.now() - p.t0 < 450 && modo === 'passeio') clique(ev.clientX, ev.clientY);
  }
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);
  canvas.addEventListener('wheel', (ev) => {
    if (modo !== 'passeio') return;
    ev.preventDefault();
    if (tele) fovAlvo = Math.max(1.8, Math.min(45, fovAlvo * (ev.deltaY > 0 ? 1.12 : 0.89)));
  }, { passive: false });

  /* ---------- rótulos do céu ---------- */
  const rotulosEl = $('jd-rotulos');
  const pool = [];
  function rotulo(i) { if (!pool[i]) { const d = document.createElement('div'); d.className = 'jd-rot'; rotulosEl.appendChild(d); pool[i] = d; } return pool[i]; }
  const vTmp = new THREE.Vector3();
  let ultimoRot = 0;
  function atualizarRotulos(t) {
    if (t - ultimoRot < 0.05) return;
    ultimoRot = t;
    const lista = [];
    const noite = ceu.estado.vis;
    ceu.estado.objetos.forEach((o) => { if (o.alt > 1 && o.visivel !== false) lista.push({ n: o.nome, v: o.vetor, c: 'astro' }); });
    if (noite > 0.2 && (cartas || tele)) {
      ceu.constelacoesVisiveis(dataCeu(), Ceu.LOCAL).forEach((c) => lista.push({ n: c.nome, v: c.vetor, c: 'const' }));
      ceu.projetaveis(tele ? (fov < 20 ? 4.2 : 3) : 2.2).forEach((e) => lista.push({ n: e.nome, v: e.vetor, c: 'est' }));
    }
    const w = canvas.clientWidth, h = canvas.clientHeight;
    let n = 0;
    for (const item of lista) {
      if (n >= 140) break;
      vTmp.copy(item.v).multiplyScalar(300).project(camera);
      if (vTmp.z > 1 || Math.abs(vTmp.x) > 1.05 || Math.abs(vTmp.y) > 1.05) continue;
      const el = rotulo(n++);
      el.textContent = item.n;
      el.className = 'jd-rot ' + item.c;
      el.style.transform = 'translate(' + ((vTmp.x * 0.5 + 0.5) * w).toFixed(1) + 'px,' + ((-vTmp.y * 0.5 + 0.5) * h).toFixed(1) + 'px)';
      el.style.display = 'block';
    }
    for (let i = n; i < pool.length; i++) pool[i].style.display = 'none';
  }

  /* ---------- missão do céu: detecção ---------- */
  const dirCam = new THREE.Vector3();
  let mira = { t: 0 };
  function vetorAlvoCeu() {
    if (!alvoDia) return null;
    if (alvoDia.tipo === 'planeta' || alvoDia.tipo === 'lua') { const o = ceu.estado.objetos.find((x) => x.id === alvoDia.id); return o && o.alt > 3 && o.visivel !== false ? o.vetor : null; }
    if (alvoDia.tipo === 'estrela') { const e = ceu.projetaveis(5).find((x) => x.nome === alvoDia.id); return e ? e.vetor : null; }
    if (alvoDia.tipo === 'constel') { const c = ceu.centroDe(alvoDia.id, dataCeu(), Ceu.LOCAL); return c && c.alt > 3 ? c.vetor : null; }
    return null;
  }
  function checarMiraCeu(dt) {
    if (!alvoDia || modo !== 'passeio') return;
    if (estado.dia().feitas.indexOf('ceu') >= 0) return;
    if ((alvoDia.tipo === 'estrela' || alvoDia.tipo === 'constel') && ceu.estado.vis < 0.3) { mira.t = 0; return; }
    if (alvoDia.tipo === 'planeta' && ceu.estado.vis < 0.05 && solInfo.sol.alt > 0) { mira.t = 0; return; }
    const v = vetorAlvoCeu();
    if (!v) { mira.t = 0; return; }
    camera.getWorldDirection(dirCam);
    const lim = alvoDia.tipo === 'constel' ? (tele ? 9 : 14) : (tele ? 2.5 : 5);
    if (Math.acos(Math.min(1, dirCam.dot(v))) / RAD < lim) mira.t += dt; else mira.t = 0;
    if (mira.t > 1.1) {
      estado.dia().feitas.push('ceu');
      estado.ganhar(3);
      toast('Você encontrou ' + alvoDia.nome + '! +3 orvalho');
      const c = alvoDia.tipo === 'lua' ? 'lua' : alvoDia.tipo === 'planeta' ? 'planeta' : alvoDia.id === 'Cru' ? 'cruzeiro' : alvoDia.id === 'Ori' ? 'orion' : null;
      if (c && estado.conquista(c)) toast(CONQUISTAS[c][0] + '. +3 orvalho');
      verificarMissoes();
      estado.mudou();
    }
  }

  /* ---------- tamanho ---------- */
  function redimensionar() {
    const w = palco.clientWidth, h = palco.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(redimensionar).observe(palco);
  new IntersectionObserver((es) => { visivel = es[0].isIntersecting; }).observe(palco);

  /* ---------- laço principal ---------- */
  const relogio = new THREE.Clock();
  let tPlantas = 0, tCeu = 0;
  function colidir() {
    const lista = canteiros.concat(slots);
    for (const c of lista) {
      const p = c.grupo.position;
      const dx = jog.x - p.x, dz = jog.z - p.z;
      const d = Math.hypot(dx, dz);
      const r = c.raioColisao;
      if (d < r && d > 0.001) { jog.x = p.x + dx / d * r; jog.z = p.z + dz / d * r; }
    }
    if (Math.hypot(jog.x, jog.z) < 0.9) { const d = Math.hypot(jog.x, jog.z) || 1; jog.x = jog.x / d * 0.9; jog.z = jog.z / d * 0.9; }
    const rmax = 47;
    const r = Math.hypot(jog.x, jog.z);
    if (r > rmax) { jog.x *= rmax / r; jog.z *= rmax / r; }
  }

  function mover(dt) {
    let f = 0, s = 0;
    if (teclas.w || teclas.arrowup) f += 1;
    if (teclas.s || teclas.arrowdown) f -= 1;
    if (teclas.d) s += 1;
    if (teclas.a) s -= 1;
    if (teclas.arrowleft) jog.yaw -= 1.6 * dt;
    if (teclas.arrowright) jog.yaw += 1.6 * dt;
    if (joy.ativo) { f -= joy.dy; s += joy.dx; }
    jog.agachado = !!teclas.x;
    const v = (teclas.shift && !jog.agachado ? 6.0 : 3.2) * (tele ? 0.25 : 1) * (jog.agachado ? 0.55 : 1);
    if (f || s) {
      const sy = Math.sin(jog.yaw), cy = Math.cos(jog.yaw);
      jog.x += (sy * f + cy * s) * v * dt;
      jog.z += (-cy * f + sy * s) * v * dt;
      colidir();
    }
    /* pulo: arco de gravidade simples, somado por cima do acompanhamento do terreno */
    if (teclas[' '] && jog.pulo <= 0.01 && !jog.agachado) jog.pulaVel = VEL_PULO;
    jog.pulaVel -= GRAVIDADE_PULO * dt;
    jog.pulo = Math.max(0, jog.pulo + jog.pulaVel * dt);
    if (jog.pulo <= 0) { jog.pulo = 0; jog.pulaVel = 0; }
    const alturaAlvo = jog.agachado ? ALTURA_AGACHADO : ALTURA_PE;
    jog.altura += (alturaAlvo - jog.altura) * Math.min(1, dt * 10);
  }

  function quadro() {
    const dt = Math.min(0.05, relogio.getDelta());
    if (!visivel && modo !== 'passeio') return;
    tempo += dt;
    matGrama.uniforms.uTempo.value = tempo;

    if (modo === 'vitrine') {
      orbita += dt * 0.06;
      const r = 24;
      camera.position.set(Math.sin(orbita) * r, 9.5, -Math.cos(orbita) * r);
      camera.lookAt(0, 2.2, 0);
      fov = 62; camera.fov = 62; camera.updateProjectionMatrix();
    } else {
      mover(dt);
      const alvoY = altura(jog.x, jog.z) + jog.altura;
      jog.y += (alvoY - jog.y) * Math.min(1, dt * 8);
      const olhoY = jog.y + jog.pulo; /* o pulo soma direto, sem o suavizador do terreno — senão o arco fica mole */
      entrando = Math.min(1, entrando + dt / 1.4);
      const e = entrando * entrando * (3 - 2 * entrando);
      const rr = 24;
      const ox = Math.sin(orbita) * rr, oz = -Math.cos(orbita) * rr;
      camera.position.set(ox + (jog.x - ox) * e, 9.5 + (olhoY - 9.5) * e, oz + (jog.z - oz) * e);
      if (entrando < 1) {
        const q = new THREE.Quaternion().copy(camera.quaternion);
        camera.lookAt(0, 2.2, 0);
        const desde = camera.quaternion.clone();
        camera.rotation.set(jog.pitch, -jog.yaw, 0);
        const destino = camera.quaternion.clone();
        camera.quaternion.copy(desde).slerp(destino, e);
        void q;
      } else camera.rotation.set(jog.pitch, -jog.yaw, 0);
      fov += (fovAlvo - fov) * Math.min(1, dt * 7);
      if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); ceu.tamanhoEstrelas(renderer.getPixelRatio() * (movel ? 0.9 : 1), 68 / fov); }
      checarMiraCeu(dt);
    }

    tPlantas += dt;
    if (tPlantas > 0.06) {
      tPlantas = 0;
      const agora = Date.now();
      canteiros.forEach((c) => atualizarPlanta(c, agora));
      slots.forEach((s) => { if (s.planta) atualizarPlanta(s, agora); });
    }
    tCeu += dt;
    if (tCeu > 20 && offsetMin === 0) { tCeu = 0; atualizarCeu(); }

    for (let i = gotas.length - 1; i >= 0; i--) {
      const g = gotas[i];
      g.t += dt;
      if (g.t < 0) { g.m.visible = false; continue; }
      g.m.visible = true;
      const u = Math.min(1, g.t / g.dur);
      g.m.position.lerpVectors(g.de, g.para, u);
      g.m.position.y = g.de.y + (g.para.y - g.de.y) * u - Math.sin(u * Math.PI) * -0.4;
      if (u >= 1) { cena.remove(g.m); gotas.splice(i, 1); }
    }

    /* luzes seguem o jogador */
    const foco = modo === 'passeio' ? camera.position : new THREE.Vector3(0, 0, 0);
    luzes.sol.target.position.set(foco.x, 0, foco.z);
    luzes.sol.position.copy(foco).setY(0).add(ceu.estado.objetos.find((o) => o.id === 'sol').vetor.clone().multiplyScalar(80));
    ceu.grupo.position.copy(camera.position);

    if (modo === 'passeio') atualizarRotulos(tempo);
    renderer.render(cena, camera);
  }

  /* ---------- guia abaixo do palco ---------- */
  function montarGuia() {
    const g = $('jd-guia');
    if (!g) return;
    const nucleo = ESP.filter((e) => e.tipo === 'nucleo');
    const extras = ESP.filter((e) => e.tipo === 'extra');
    const card = (e) => {
      const s = checklist.find((x) => window.ESPECIES_POR_MATERIA(x.nome) === e);
      const link = fichas[e.id];
      return '<article class="cx jd-esp-c"><p class="rot">' + (e.materia ? esc(e.materia) : 'Canteiro livre') + '</p><h3 class="h3">' + esc(e.nome) + '</h3><p class="jd-cient">' + esc(e.cient) + '</p>' +
        (s ? '<div class="jd-prog"><i style="width:' + Math.round((s.total ? s.feitos / s.total : 0) * 100) + '%"></i></div><p class="rot">' + s.feitos + '/' + s.total + ' tópicos</p>' : '') +
        '<p>' + esc(e.fato) + '</p>' + (e.porque ? '<p class="jd-porque">' + esc(e.porque) + '</p>' : '') +
        '<p class="rot">' + esc(e.familia) + ' · ' + esc(e.origem) + '</p>' +
        (link ? '<a class="botao" href="biblioteca.html#f=' + encodeURI(link) + '">Ficha no Atlas</a>' : '<span class="rot suave">Ficha no Atlas ainda não escrita</span>') + '</article>';
    };
    g.innerHTML = '<section class="atlas-sec"><header><h2 class="h2">As plantas do jardim</h2><span class="rot suave">' + nucleo.length + ' matérias, ' + nucleo.length + ' espécies reais</span></header><div class="jd-esp-grade">' + nucleo.map(card).join('') + '</div></section>' +
      '<section class="atlas-sec"><header><h2 class="h2">Canteiros livres</h2><span class="rot suave">plante com as sementes que você ganha estudando</span></header><div class="jd-esp-grade">' + extras.map(card).join('') + '</div></section>' +
      '<section class="atlas-sec"><header><h2 class="h2">Como cuidar</h2><span class="rot suave">a mente você cuida no Domino; o jardim, aqui</span></header>' +
      '<div class="jd-como"><div class="cx"><p class="rot">O que faz o jardim crescer</p><p>Cada tópico que você domina no <b>Domino</b> faz a planta da matéria crescer e, depois de um quinto do caminho, florescer. A cada ' + TOPICOS_POR_SEMENTE + ' tópicos dominados nasce uma semente para um canteiro livre.</p></div>' +
      '<div class="cx"><p class="rot">Terra</p><p><b>Regar</b> (2) mantém a planta viva: sem água por cerca de dois dias e meio ela murcha. <b>Podar</b> (3) tira as folhas secas que aparecem com o tempo. As duas rendem orvalho, que sobe o nível do jardim.</p></div>' +
      '<div class="cx"><p class="rot">Céu</p><p>O <b>Telescópio</b> (5) aproxima o céu real de Campinas: Lua com a fase de verdade, planetas e estrelas. O <b>relógio do céu</b> leva você ao pôr do sol, à noite ou ao amanhecer. Toque num astro para ler sobre ele e registrar no diário.</p></div>' +
      '<div class="cx"><p class="rot">Teclas e toque</p><p>Computador: arraste para olhar, W A S D ou setas para andar, Shift corre, Espaço pula, X agacha (segure), 1 a 5 trocam de ferramenta, T telescópio, C constelações, Esc sai. Celular: arraste a metade direita para olhar, o polegar esquerdo para andar, os dois botões redondos perto do polegar pulam e agacham.</p></div></div>' +
      '<p class="jd-nota">Astronomia calculada no seu navegador com elementos orbitais de baixa precisão (erro de poucos minutos de arco nos planetas). Estrelas: catálogo Hipparcos/Bright Star via d3-celestial (BSD-3). Gráficos: Three.js (MIT). Fatos botânicos escritos de memória, de forma conservadora.</p></section>';
  }

  /* ---------- partida ---------- */
  redimensionar();
  atualizarCeu();
  canteiros.forEach((c) => atualizarPlanta(c, Date.now()));
  slots.forEach((s) => { if (s.planta) atualizarPlanta(s, Date.now()); });
  pintarRecursos();
  verificarMissoes();
  montarGuia();
  if (avisoMeuDia) setTimeout(() => toast('Meu dia regou o jardim: +' + avisoMeuDia + ' orvalho'), 1200);
  palco.classList.add('jd-pronto');
  renderer.setAnimationLoop(quadro);
  window.__jardim = { alvoNoPonto, hitboxes, plantarTeste: (i, sp) => { const ex = { id: 't' + i, sp, slot: i, plantadoEm: Date.now(), t: Date.now(), poda: 0, dias: [hojeISO()] }; montarExtra(slots[i], ex); atualizarPlanta(slots[i], Date.now()); }, jog, camera, ceu, estado, entrar, sair, escolherFerramenta, setOffset: (m) => { offsetMin = m; $('jd-slider').value = m; atualizarCeu(); }, canteiros, slots, cena, renderer, clique, alvoDia: () => alvoDia, get tele() { return tele; }, get modo() { return modo; }, apontar: (alt, az) => { jog.yaw = az * RAD; jog.pitch = alt * RAD; } };
  refrescarPlacas();
}

function semWebGL() {
  const palco = $('palco');
  if (palco) palco.innerHTML = '<div class="cx jd-sem"><p class="rot">Sem gráficos 3D</p><p>Este navegador não conseguiu abrir o modo 3D. O jardim continua crescendo na página <b>Agora</b>. Tente outro navegador ou ative a aceleração de hardware.</p><p><a class="botao" href="hoje.html">Ver o jardim na página Agora</a></p></div>';
}

iniciar().catch((e) => { console.error(e); const p = $('palco'); if (p && !p.classList.contains('jd-pronto')) semWebGL(); });
