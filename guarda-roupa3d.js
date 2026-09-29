import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/geometries/RoundedBoxGeometry.js';
import { criarPalco, criarSala, criarPlanta, texturaMadeira, texturaTecido, textoEmCanvas, hash, movel, clamp, AMBIENTES } from './cena3d.js';
import { LISTA_TIPOS, LISTA_CORES, CORES, tipoDe, corDaPeca, distribuir, vestir, nomeUnico, alturasDasPartes, norm } from './guarda-roupa-modelo.js';

const P = window.Perfil;
const esc = P.esc;
const $ = (id) => document.getElementById(id);
const H = { 'Content-Type': 'application/json', 'X-Perfil': '1' };

/* medidas do móvel, em metros */
const PROF = 0.58, ALT = 2.2, RODAPE = 0.08, TAMPO = 0.025, ESP = 0.02;
const FRENTE = PROF / 2;
const ANGULO_PORTA = 1.62;

const ESTACOES = ['verão', 'outono', 'inverno', 'primavera', 'o ano todo'];
const OCASIOES = ['dia a dia', 'estudo', 'trabalho', 'recital', 'festa', 'esporte', 'casa'];
const ESTADOS = ['limpa', 'para lavar', 'emprestada', 'doar'];
const TIPOS_PARTE = [['cabideiro', 'Cabideiro'], ['prateleira', 'Prateleira'], ['gaveta', 'Gaveta'], ['sapateira', 'Sapateira']];
const MOVEIS = [['branco', 'Branco e carvalho'], ['carvalho', 'Carvalho claro'], ['nogueira', 'Nogueira']];

async function iniciar() {
  const canvas = $('mundo'), ui = $('es-ui'), carregando = $('es-carregando');
  if (!canvas || !ui) return;
  let palco;
  try { palco = criarPalco(canvas); } catch (e) { if (carregando) carregando.textContent = 'Este navegador não desenha WebGL.'; return; }
  const { cena, camera, pbr } = palco;
  try {
    await Promise.race([Promise.all(['600 40px "Newsreader"', '500 20px "Archivo"'].map((f) => document.fonts.load(f))), new Promise((ok) => setTimeout(ok, 2000))]);
  } catch (e) { /* segue */ }

  const r0 = await fetch('/api/guarda-roupa').then((r) => (r.ok ? r.json() : null)).catch(() => null);
  if (carregando) carregando.hidden = true;
  canvas.closest('.es-palco').classList.add('es-pronto');

  /* ---------- estado ---------- */
  const estado = {
    dados: { movel: (r0 && r0.movel) || [], pecas: (r0 && r0.pecas) || [], looks: (r0 && r0.looks) || [] },
    versao: (r0 && r0.versao) || '',
    existe: !!(r0 && r0.existe),
    selecionada: null, lookAtivo: null, montando: null,
    filtro: { tipo: '', estacao: '', ocasiao: '', busca: '' }, filtroAberto: false, ajustesAbertos: false,
    fundo: 'estudio', estilo: 'branco', portasAbertas: true,
  };
  try { estado.fundo = localStorage.getItem('guarda-roupa-ambiente') || 'estudio'; } catch (e) { /* padrão */ }
  try { estado.estilo = localStorage.getItem('guarda-roupa-movel') || 'branco'; } catch (e) { /* padrão */ }
  if (!AMBIENTES.some((a) => a[0] === estado.fundo)) estado.fundo = 'estudio';
  if (!MOVEIS.some((m) => m[0] === estado.estilo)) estado.estilo = 'branco';
  estado.lookAtivo = estado.dados.looks[0] ? estado.dados.looks[0].nome : null;

  /* ---------- sala ---------- */
  const sala = criarSala(palco, { paredeZ: -0.33 });
  sala.aplicar(estado.fundo);
  /* a parede às costas de quem olha, com uma janela clara: nunca aparece de frente,
     mas é o que o espelho da porta reflete (sem ela, espelho vira placa de cor lisa) */
  const quarto = new THREE.Group();
  (() => {
    const gesso = pbr({ color: 0xeee7dc, emissive: 0x6b645b, roughness: 0.95, envMapIntensity: 0.5 });
    const parede = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), gesso); parede.position.set(0, 3, 6.5); parede.rotation.y = Math.PI;
    const JX = 0.25, JY = 1.45;
    const vidro = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.5), new THREE.MeshBasicMaterial({ color: 0xfff3dc })); vidro.position.set(JX, JY, 6.49); vidro.rotation.y = Math.PI;
    const caixilho = pbr({ color: 0xf4f0e8, roughness: 0.5 });
    const barras = [[1.7, 0.06, 0, 0.78], [1.7, 0.06, 0, -0.78], [0.06, 1.6, 0.83, 0], [0.06, 1.6, -0.83, 0], [0.04, 1.5, 0, 0], [1.6, 0.04, 0, 0.1]];
    barras.forEach(([w, h, dx, dy]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), caixilho); b.position.set(JX + dx, JY + dy, 6.46); quarto.add(b); });
    const cortina = pbr({ ...texturaTecido('plano'), color: 0xd8cbb5, emissive: 0x4a4236, roughness: 1, side: THREE.DoubleSide });
    [JX - 1.05, JX + 1.05].forEach((x) => { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 2.5), cortina); c.position.set(x, 1.4, 6.42); c.rotation.y = Math.PI; quarto.add(c); });
    const quadro = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.03), pbr({ color: 0x2d4768, roughness: 0.7 })); quadro.position.set(-1.9, 1.6, 6.47); quarto.add(quadro);
    quarto.add(parede, vidro);
  })();
  cena.add(quarto);

  /* ---------- materiais ---------- */
  function repetir(texs, rx, ry) {
    const o = {};
    ['map', 'bumpMap', 'roughnessMap'].forEach((k) => { const c = texs[k].clone(); c.repeat.set(rx, ry); c.needsUpdate = true; o[k] = c; });
    return o;
  }
  const MAT = {
    branco: pbr({ ...texturaMadeira('branco', true), color: 0xffffff, roughness: 0.9, bumpScale: 0.15 }),
    brancoH: pbr({ ...texturaMadeira('branco'), color: 0xffffff, roughness: 0.9, bumpScale: 0.15 }),
    carvalho: pbr({ ...texturaMadeira('carvalho', true), color: 0xffffff, roughness: 1, bumpScale: 0.3 }),
    carvalhoH: pbr({ ...texturaMadeira('carvalho'), color: 0xffffff, roughness: 1, bumpScale: 0.3 }),
    nogueira: pbr({ ...texturaMadeira('nogueira', true), color: 0xffffff, roughness: 1, bumpScale: 0.4 }),
    nogueiraH: pbr({ ...texturaMadeira('nogueira'), color: 0xffffff, roughness: 1, bumpScale: 0.4 }),
    interior: pbr({ ...repetir(texturaMadeira('carvalho'), 6, 6), color: 0xf3ece0, roughness: 1, bumpScale: 0.2 }),
    interiorBranco: pbr({ ...repetir(texturaMadeira('branco'), 3, 3), color: 0xfaf6ef, roughness: 0.9, bumpScale: 0.1 }),
    cromo: pbr({ color: 0xe8e8e8, metalness: 1, roughness: 0.18 }),
    latao: pbr({ color: 0xc9a45c, metalness: 1, roughness: 0.32 }),
    preto: pbr({ color: 0x1c1c1e, metalness: 0.5, roughness: 0.45 }),
    espelho: pbr({ color: 0xffffff, metalness: 1, roughness: 0.035, envMapIntensity: 1.4 }),
    cabide: pbr({ ...texturaMadeira('freijo'), color: 0xffffff, roughness: 0.7 }),
    borracha: pbr({ color: 0xf2f0ea, roughness: 0.7 }),
    solaEscura: pbr({ color: 0x2a221c, roughness: 0.6 }),
    palha: pbr({ ...texturaTecido('sarja'), color: 0xcfb07a, roughness: 1, bumpScale: 1.2, side: THREE.DoubleSide }),
    papelao: pbr({ color: 0xb58a5a, roughness: 0.95 }),
    manequim: pbr({ ...texturaTecido('plano'), color: 0xe9e1d2, roughness: 0.95 }),
    madeiraEscura: pbr({ ...texturaMadeira('nogueira'), color: 0xffffff, roughness: 0.6 }),
  };
  /* espelho: uma câmera cúbica no ponto do vidro fotografa o quarto (janela, cortinas, quadro)
     e isso vira o reflexo. Só refotografa quando a porta dele se mexe ou a cena muda. */
  const cuboRT = new THREE.WebGLCubeRenderTarget(movel ? 192 : 320, { type: THREE.HalfFloatType });
  const cuboCam = new THREE.CubeCamera(0.03, 30, cuboRT);
  MAT.espelhoCubo = pbr({ color: 0xf2f4f5, metalness: 1, roughness: 0.02, envMap: cuboRT.texture, envMapIntensity: 1.35 });
  let espelhoSujo = true;
  function fotografarEspelho() {
    const esp = espelhos[0];
    if (!esp) return;
    esp.visible = false;
    esp.getWorldPosition(cuboCam.position);
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(esp.getWorldQuaternion(new THREE.Quaternion()));
    cuboCam.position.addScaledVector(n, 0.03);
    cuboCam.update(palco.renderer, cena);
    esp.visible = true;
    espelhoSujo = false;
  }
  const matsMovel = () => ({
    branco: { corpo: MAT.branco, corpoH: MAT.brancoH, porta: MAT.branco, puxador: MAT.latao },
    carvalho: { corpo: MAT.carvalho, corpoH: MAT.carvalhoH, porta: MAT.carvalho, puxador: MAT.preto },
    nogueira: { corpo: MAT.nogueira, corpoH: MAT.nogueiraH, porta: MAT.nogueira, puxador: MAT.latao },
  })[estado.estilo];

  /* tecido: cor lisa sobre a trama, ou xadrez/listras desenhados na hora */
  const cacheTecidos = new Map();
  function tipoTecido(p) {
    const t = norm(p.tecido + ' ' + p.tipo);
    if (/jeans|sarja|denim/.test(t)) return 'sarja';
    if (/malha|moletom|la\b|trico|suéter|sueter|meia/.test(t)) return 'malha';
    return 'plano';
  }
  function materialDaPeca(p) {
    const cor = corDaPeca(p.cor);
    const tec = tipoTecido(p);
    const chave = cor.base + '|' + (cor.segunda || '') + '|' + cor.padrao + '|' + tec;
    if (cacheTecidos.has(chave)) return cacheTecidos.get(chave);
    const base = texturaTecido(tec);
    let m;
    if (cor.padrao === 'xadrez' || cor.padrao === 'listras') {
      const outra = cor.segunda || (new THREE.Color(cor.base).getHSL({}).l > 0.5 ? '#2a2a2a' : '#f1eee7');
      const mapa = textoEmCanvas(256, 256, (g, w, h) => {
        g.fillStyle = cor.base; g.fillRect(0, 0, w, h);
        g.fillStyle = outra;
        if (cor.padrao === 'listras') { for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 12); }
        else {
          g.globalAlpha = 0.55; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 22, h);
          for (let y = 0; y < h; y += 64) g.fillRect(0, y, w, 22);
          g.globalAlpha = 0.35; for (let x = 32; x < w; x += 64) g.fillRect(x, 0, 4, h);
          g.globalAlpha = 1;
        }
      });
      mapa.wrapS = mapa.wrapT = THREE.RepeatWrapping; mapa.repeat.set(4, 4);
      m = pbr({ map: mapa, bumpMap: base.bumpMap, roughnessMap: base.roughnessMap, roughness: 1, bumpScale: 0.8, side: THREE.DoubleSide });
    } else {
      m = pbr({ ...base, color: cor.base, roughness: 1, bumpScale: 0.8, side: THREE.DoubleSide });
    }
    cacheTecidos.set(chave, m);
    return m;
  }

  /* ---------- silhuetas das peças penduradas (desenhadas de frente; no cabide ficam de lado) ---------- */
  function silhueta(forma) {
    const s = new THREE.Shape();
    const reta = (pts) => { s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); };
    const gola = () => s.quadraticCurveTo(0, -0.085, -0.07, -0.03);
    if (forma === 'calca' || forma === 'bermuda') {
      const L = forma === 'calca' ? 0.98 : 0.52;
      reta([[-0.2, -0.05], [0.2, -0.05], [0.22, -0.22], [0.18, -L], [0.03, -L], [0, -0.34], [-0.03, -L], [-0.18, -L], [-0.22, -0.22]]);
      s.closePath(); return { shape: s, alt: L };
    }
    if (forma === 'saia') { reta([[-0.17, -0.05], [0.17, -0.05], [0.3, -0.62], [-0.3, -0.62]]); s.closePath(); return { shape: s, alt: 0.62 }; }
    if (forma === 'regata') {
      reta([[-0.07, -0.03], [-0.12, -0.04], [-0.14, -0.18], [-0.21, -0.26], [-0.21, -0.68], [0.21, -0.68], [0.21, -0.26], [0.14, -0.18], [0.12, -0.04], [0.07, -0.03]]);
      gola(); return { shape: s, alt: 0.68 };
    }
    if (forma === 'vestido') {
      reta([[-0.07, -0.03], [-0.13, -0.04], [-0.2, -0.13], [-0.2, -0.32], [-0.17, -0.45], [-0.36, -1.05], [0.36, -1.05], [0.17, -0.45], [0.2, -0.32], [0.2, -0.13], [0.13, -0.04], [0.07, -0.03]]);
      gola(); return { shape: s, alt: 1.05 };
    }
    const longa = forma === 'camisa' || forma === 'manga-longa' || forma === 'casaco' || forma === 'jaqueta';
    const L = forma === 'casaco' ? 0.98 : forma === 'jaqueta' ? 0.68 : forma === 'camisa' ? 0.76 : forma === 'manga-longa' ? 0.7 : 0.66;
    const larg = forma === 'casaco' || forma === 'jaqueta' ? 0.25 : forma === 'manga-longa' ? 0.24 : 0.22;
    if (longa) {
      reta([[-0.07, -0.03], [-0.21, -0.07], [-larg - 0.08, -0.62], [-larg - 0.02, -0.66], [-larg + 0.01, -0.28], [-larg, -L], [larg, -L], [larg - 0.01, -0.28], [larg + 0.02, -0.66], [larg + 0.08, -0.62], [0.21, -0.07], [0.07, -0.03]]);
    } else {
      reta([[-0.07, -0.03], [-0.2, -0.07], [-0.3, -0.21], [-0.24, -0.26], [-larg, -0.25], [-larg, -L], [larg, -L], [larg, -0.25], [0.24, -0.26], [0.3, -0.21], [0.2, -0.07], [0.07, -0.03]]);
    }
    gola();
    return { shape: s, alt: L };
  }
  const cacheGeoPeca = new Map();
  function geoPendurada(forma, espessura) {
    const k = forma + '|' + espessura;
    if (cacheGeoPeca.has(k)) return cacheGeoPeca.get(k);
    const { shape, alt } = silhueta(forma);
    const g = new THREE.ExtrudeGeometry(shape, { depth: espessura, bevelEnabled: true, bevelThickness: Math.min(0.012, espessura * 0.35), bevelSize: 0.008, bevelSegments: 3, curveSegments: 10 });
    g.translate(0, 0, -espessura / 2);
    g.computeVertexNormals();
    g.computeBoundingBox();
    const meia = Math.max(Math.abs(g.boundingBox.min.x), Math.abs(g.boundingBox.max.x));
    const v = { geo: g, alt, encaixe: Math.min(1, 0.24 / meia) };
    cacheGeoPeca.set(k, v);
    return v;
  }
  let geoCabide = null;
  function cabide() {
    if (!geoCabide) {
      const curva = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.2, -0.085, 0), new THREE.Vector3(-0.1, -0.06, 0), new THREE.Vector3(0, -0.045, 0), new THREE.Vector3(0.1, -0.06, 0), new THREE.Vector3(0.2, -0.085, 0)]);
      geoCabide = { barra: new THREE.TubeGeometry(curva, 20, 0.0075, 8), gancho: new THREE.TorusGeometry(0.016, 0.0022, 6, 18, Math.PI * 1.35) };
    }
    const g = new THREE.Group();
    const barra = new THREE.Mesh(geoCabide.barra, MAT.cabide); barra.castShadow = true;
    const gancho = new THREE.Mesh(geoCabide.gancho, MAT.cromo); gancho.position.set(0, -0.012, 0); gancho.rotation.z = -Math.PI * 0.18;
    g.add(barra, gancho);
    return g;
  }

  /* ---------- calçados: sola + cabedal + bico, em pares ---------- */
  function sapato(p) {
    const forma = tipoDe(p.tipo).forma;
    const g = new THREE.Group();
    const mat = materialDaPeca(p);
    const sola = forma === 'tenis' ? MAT.borracha : MAT.solaEscura;
    const s = new THREE.Mesh(new RoundedBoxGeometry(0.095, 0.022, 0.27, 1, 0.008), sola); s.position.y = 0.011;
    g.add(s);
    if (forma === 'sandalia') {
      [0.06, -0.04].forEach((z) => { const t = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.015, 0.03, 1, 0.006), mat); t.position.set(0, 0.03, z); g.add(t); });
    } else {
      const alto = forma === 'bota' ? 0.19 : forma === 'tenis' ? 0.075 : 0.06;
      const cab = new THREE.Mesh(new RoundedBoxGeometry(0.088, alto, 0.17, 2, 0.03), mat); cab.position.set(0, 0.022 + alto / 2, -0.04);
      const bico = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 10), mat); bico.scale.set(0.98, 0.72, 1.35); bico.position.set(0, 0.04, 0.07);
      g.add(cab, bico);
    }
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    const par = new THREE.Group();
    const e = g, d = g.clone();
    e.position.x = -0.058; d.position.x = 0.058; e.rotation.y = 0.05; d.rotation.y = -0.05;
    par.add(e, d);
    return par;
  }

  /* ---------- montagem do móvel e de tudo ---------- */
  const grupo = new THREE.Group();
  cena.add(grupo);
  let alvosClique = [], zonas = [], portas = [], gavetas = [], pecaObjs = new Map(), larguraTotal = 3, modulosX = [];
  let manequim = null;
  let M_INT = null;
  let espelhos = [];

  function descartar() {
    espelhos = [];
    grupo.traverse((o) => {
      if (o.geometry && !o.userData.geoCompartilhada) o.geometry.dispose();
      if (o.userData.matDescartavel) { o.material.dispose(); palco.materiaisPBR.delete(o.material); }
    });
    grupo.clear();
    alvosClique = []; zonas = []; portas = []; gavetas = []; pecaObjs = new Map(); modulosX = [];
  }
  function peca3d(geo, mat, x, y, z, pai = grupo) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    pai.add(m);
    return m;
  }
  const larguraModulo = (partes) => (partes.some((p) => p.tipo === 'cabideiro') ? 1.0 : 0.72);
  const passaFiltro = (p) => {
    const f = estado.filtro;
    if (f.tipo && norm(tipoDe(p.tipo).nome) !== norm(f.tipo)) return false;
    if (f.estacao && !norm(p.estacao).includes(norm(f.estacao))) return false;
    if (f.ocasiao && !norm(p.ocasiao).includes(norm(f.ocasiao))) return false;
    if (f.busca && !norm(p.nome + ' ' + p.tipo + ' ' + p.cor + ' ' + p.tags.join(' ')).includes(norm(f.busca))) return false;
    return true;
  };
  function registrarPeca(obj, p) {
    obj.userData.peca = p.nome;
    obj.traverse((o) => { if (o.isMesh) { o.userData.peca = p.nome; alvosClique.push(o); } });
    obj.userData.casa = obj.position.clone();
    obj.userData.casaRot = obj.rotation.clone();
    pecaObjs.set(p.nome, obj);
    if (!passaFiltro(p)) obj.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.18; o.userData.matDescartavel = true; } });
  }

  function montar() {
    descartar();
    const M = matsMovel();
    M_INT = estado.estilo === 'branco' ? MAT.interiorBranco : MAT.interior;
    const { movel: mv, pecas } = estado.dados;
    const modulos = mv.length ? mv : [[{ tipo: 'cabideiro', nome: 'Cabideiro' }]];
    const larguras = modulos.map(larguraModulo);
    const W = larguras.reduce((a, b) => a + b, 0) + ESP * (modulos.length + 1);
    larguraTotal = W;
    const { partes: porParte, cesto, doar, soltas } = distribuir(pecas, mv);
    const alturaUtil = ALT - RODAPE - TAMPO - ESP;

    // carcaça: laterais em cada divisa, tampo, base, costas, rodapé recuado
    let x = -W / 2;
    const bordas = [x];
    larguras.forEach((w) => { x += ESP + w; bordas.push(x); });
    bordas.forEach((bx, i) => peca3d(new RoundedBoxGeometry(ESP, ALT - RODAPE, PROF, 1, 0.004), i === 0 || i === bordas.length - 1 ? M.corpo : M_INT, bx + ESP / 2, RODAPE + (ALT - RODAPE) / 2, 0));
    peca3d(new RoundedBoxGeometry(W + 0.012, TAMPO, PROF + 0.012, 1, 0.006), M.corpoH, 0, ALT - TAMPO / 2, 0);
    peca3d(new THREE.BoxGeometry(W, ESP, PROF), M_INT, 0, RODAPE + ESP / 2, 0);
    peca3d(new THREE.BoxGeometry(W, ALT - RODAPE, 0.01), M_INT, 0, RODAPE + (ALT - RODAPE) / 2, -FRENTE + 0.005).castShadow = false;
    peca3d(new THREE.BoxGeometry(W - 0.02, RODAPE, 0.02), M.corpoH, 0, RODAPE / 2, FRENTE - 0.04);

    // cada módulo, de cima pra baixo
    let xm = -W / 2 + ESP;
    modulos.forEach((partes, m) => {
      const w = larguras[m];
      const cx = xm + w / 2;
      modulosX.push({ x: cx, w });
      const alturas = alturasDasPartes(partes, alturaUtil - 0.018 * (partes.length - 1));
      let topo = ALT - TAMPO;
      partes.forEach((parte, i) => {
        const h = alturas[i];
        const base = topo - h;
        const gente = (porParte.get(m + ':' + i) || []);
        // tábua embaixo de cada divisão (menos da última, que é a base)
        if (i < partes.length - 1) peca3d(new RoundedBoxGeometry(w, 0.018, PROF - 0.03, 1, 0.004), M_INT, cx, base - 0.009, -0.01);
        const zona = new THREE.Mesh(new THREE.BoxGeometry(w, h, PROF - 0.04), new THREE.MeshBasicMaterial({ visible: false }));
        zona.position.set(cx, base + h / 2, 0);
        zona.userData.parte = { m, i };
        grupo.add(zona); zonas.push(zona);
        if (parte.tipo === 'cabideiro') montarCabideiro(cx, w, topo, base, gente);
        else if (parte.tipo === 'prateleira') montarPrateleira(cx, w, topo, base, gente);
        else if (parte.tipo === 'gaveta') montarGaveta(cx, w, topo, base, gente, m, i, M);
        else montarSapateira(cx, w, topo, base, gente);
        topo = base - (i < partes.length - 1 ? 0.018 : 0);
      });
      // porta com dobradiça (a do meio ganha espelho)
      montarPorta(m, xm - ESP / 2, w, modulos.length, M);
      xm += w + ESP;
    });

    // cesto de roupa suja, caixa de doação, manequim, planta
    montarCesto(-W / 2 - 0.5, cesto);
    montarCaixaDoar(-W / 2 - 1.05, doar);
    montarManequim(W / 2 + 0.75);
    const planta = criarPlanta(pbr, 2.4); planta.position.set(W / 2 + 1.45, 0, -0.1); grupo.add(planta);
    if (soltas.length) montarPilhaSolta(W / 2 + 0.75, soltas);

    palco.ajustarSombra(0, ALT / 2, W + 3.2, ALT + 0.6);
    enquadrar();
    marcarSujo();
    pintarNavModulos();
  }

  function montarCabideiro(cx, w, topo, base, gente) {
    const yBarra = topo - 0.06;
    const barra = peca3d(new THREE.CylinderGeometry(0.011, 0.011, w - 0.01, 16), MAT.cromo, cx, yBarra, 0);
    barra.rotation.z = Math.PI / 2;
    const alturaMax = topo - base - 0.08;
    const esp = (p) => { const f = tipoDe(p.tipo).forma; return f === 'casaco' ? 0.06 : f === 'jaqueta' || f === 'manga-longa' ? 0.045 : 0.03; };
    const total = gente.reduce((s, p) => s + esp(p) + 0.02, 0);
    const aperto = Math.min(1, (w - 0.1) / Math.max(0.01, total));
    let xx = cx - Math.min(w - 0.1, total * aperto) / 2;
    gente.forEach((p) => {
      const e = esp(p);
      const passo = (e + 0.02) * aperto;
      xx += passo / 2;
      const { geo, alt, encaixe } = geoPendurada(tipoDe(p.tipo).forma, e);
      const g = new THREE.Group();
      const corpo = new THREE.Mesh(geo, materialDaPeca(p)); corpo.userData.geoCompartilhada = true;
      corpo.castShadow = true; corpo.receiveShadow = true;
      if (alt > alturaMax) corpo.scale.y = alturaMax / alt;
      corpo.scale.x = encaixe;
      corpo.userData.encaixe = encaixe;
      const cab = cabide();
      cab.children.forEach((c) => { c.userData.geoCompartilhada = true; });
      g.add(corpo, cab);
      g.rotation.y = Math.PI / 2;
      g.position.set(xx, yBarra + 0.03, 0);
      grupo.add(g);
      g.userData.pendurada = true;
      registrarPeca(g, p);
      xx += passo / 2;
    });
  }

  function montarPrateleira(cx, w, topo, base, gente) {
    const altMax = topo - base - 0.05;
    let x0 = cx - w / 2 + 0.03, pilhaAlt = 0;
    const largPilha = 0.3;
    gente.forEach((p) => {
      const t = tipoDe(p.tipo);
      const h = t.forma === 'rolinho' ? 0.06 : (t.dobra || 0.035);
      if (pilhaAlt + h > altMax && pilhaAlt > 0) { x0 += largPilha + 0.025; pilhaAlt = 0; }
      const obj = objetoDobrado(p, t, largPilha);
      obj.position.set(x0 + largPilha / 2, base + pilhaAlt + h / 2, 0.02);
      obj.rotation.y = ((hash(p.nome) % 7) - 3) * 0.008;
      grupo.add(obj);
      registrarPeca(obj, p);
      pilhaAlt += h;
    });
  }
  function objetoDobrado(p, t, larg) {
    if (tipoDe(p.tipo).grupo === 'pe') { const par = sapato(p); par.scale.setScalar(0.9); return par; }
    if (t.forma === 'rolinho') {
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.05, 4, 10), materialDaPeca(p));
      m.rotation.z = Math.PI / 2; m.castShadow = true; m.receiveShadow = true;
      const g = new THREE.Group(); g.add(m); return g;
    }
    const intima = t.grupo === 'intima';
    const h = t.dobra || 0.035;
    const m = new THREE.Mesh(new RoundedBoxGeometry(intima ? 0.16 : larg, h, intima ? 0.16 : 0.27, 1, Math.min(0.012, h * 0.35)), materialDaPeca(p));
    m.castShadow = true; m.receiveShadow = true;
    const g = new THREE.Group(); g.add(m); return g;
  }

  function montarGaveta(cx, w, topo, base, gente, m, i, M) {
    const h = topo - base;
    const g = new THREE.Group();
    g.position.set(cx, base, 0);
    const frente = peca3d(new RoundedBoxGeometry(w - 0.012, h - 0.012, 0.02, 1, 0.004), M.porta === MAT.branco ? MAT.brancoH : M.corpoH, 0, h / 2, FRENTE - 0.045, g);
    const puxador = peca3d(new RoundedBoxGeometry(Math.min(0.26, w * 0.4), 0.014, 0.016, 1, 0.005), M.puxador, 0, h / 2, FRENTE - 0.027, g);
    const fundoY = 0.012;
    [-1, 1].forEach((lado) => peca3d(new THREE.BoxGeometry(0.012, h * 0.7, PROF - 0.1), M_INT, lado * (w / 2 - 0.02), h * 0.35 + 0.004, -0.02, g));
    peca3d(new THREE.BoxGeometry(w - 0.04, 0.008, PROF - 0.1), M_INT, 0, fundoY, -0.02, g);
    peca3d(new THREE.BoxGeometry(w - 0.04, h * 0.7, 0.012), M_INT, 0, h * 0.35 + 0.004, -FRENTE + 0.06, g);
    // conteúdo deitado em grade
    const colunas = Math.max(1, Math.floor((w - 0.06) / 0.18));
    gente.forEach((p, k) => {
      const t = tipoDe(p.tipo);
      const obj = objetoDobrado(p, t, 0.16);
      const col = k % colunas, fila = Math.floor(k / colunas);
      const altItem = t.forma === 'rolinho' ? 0.06 : Math.min(t.dobra || 0.03, h * 0.5);
      obj.position.set(-w / 2 + 0.05 + (col + 0.5) * ((w - 0.1) / colunas), fundoY + altItem / 2 + 0.004, FRENTE - 0.16 - fila * 0.18);
      g.add(obj);
      registrarPeca(obj, p);
    });
    frente.userData.gaveta = { m, i }; puxador.userData.gaveta = { m, i };
    alvosClique.push(frente, puxador);
    g.userData.gaveta = { m, i };
    g.userData.aberta = 0; g.userData.alvo = 0;
    gavetas.push(g);
    grupo.add(g);
  }

  function montarSapateira(cx, w, topo, base, gente) {
    const g = new THREE.Group();
    g.position.set(cx, base + 0.05, 0.02);
    g.rotation.x = 0.28;
    peca3d(new THREE.BoxGeometry(w - 0.02, 0.012, PROF - 0.08), M_INT, 0, 0, 0, g);
    peca3d(new THREE.BoxGeometry(w - 0.02, 0.03, 0.012), MAT.cromo, 0, 0.012, (PROF - 0.08) / 2, g);
    const passo = Math.min(0.26, (w - 0.06) / Math.max(1, gente.length));
    gente.forEach((p, k) => {
      const par = tipoDe(p.tipo).grupo === 'pe' ? sapato(p) : objetoDobrado(p, tipoDe(p.tipo), 0.2);
      par.position.set(-w / 2 + 0.04 + passo * (k + 0.5), 0.006, 0);
      if (passo < 0.24) par.scale.setScalar(passo / 0.24);
      g.add(par);
      registrarPeca(par, p);
    });
    grupo.add(g);
  }

  function montarPorta(m, xEsq, w, n, M) {
    // metade esquerda abre pra esquerda, metade direita pra direita: nenhuma porta aberta cobre o vizinho
    const dobradicaEsq = m < Math.floor(n / 2) || (n % 2 === 1 && m === Math.floor(n / 2));
    const pivo = new THREE.Group();
    const altPorta = ALT - RODAPE - 0.01;
    pivo.position.set(dobradicaEsq ? xEsq : xEsq + w + ESP, RODAPE + 0.005, FRENTE + 0.012);
    const sinal = dobradicaEsq ? 1 : -1;
    const porta = peca3d(new RoundedBoxGeometry(w + ESP - 0.006, altPorta, 0.022, 1, 0.005), M.porta, sinal * (w + ESP) / 2, altPorta / 2, 0, pivo);
    const puxador = peca3d(new RoundedBoxGeometry(0.014, 0.34, 0.016, 1, 0.006), M.puxador, sinal * (w + ESP - 0.06), altPorta * 0.52, 0.03, pivo);
    [0.14, -0.14].forEach((dy) => peca3d(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 8), M.puxador, sinal * (w + ESP - 0.06), altPorta * 0.52 + dy, 0.017, pivo).rotation.x = Math.PI / 2);
    if (m === Math.floor((n - 1) / 2)) {
      const larguraEsp = (w + ESP) * 0.62, alturaEsp = altPorta * 0.78;
      const esp = peca3d(new THREE.PlaneGeometry(larguraEsp, alturaEsp), MAT.espelho, sinal * (w + ESP) / 2 - sinal * 0.02, altPorta * 0.53, 0.0125, pivo);
      esp.castShadow = false;
      esp.material = MAT.espelhoCubo;
      esp.userData.porta = m;
      espelhos.push(esp);
      espelhoSujo = true;
      const moldura = peca3d(new RoundedBoxGeometry((w + ESP) * 0.62 + 0.02, altPorta * 0.78 + 0.02, 0.004, 1, 0.002), M.puxador, sinal * (w + ESP) / 2 - sinal * 0.02, altPorta * 0.53, 0.0085, pivo);
      moldura.castShadow = false;
    }
    [porta, puxador].forEach((o) => { o.userData.porta = m; alvosClique.push(o); });
    pivo.traverse((o) => { if (o.isMesh) { o.userData.porta = m; if (!alvosClique.includes(o)) alvosClique.push(o); } });
    pivo.userData.sinal = sinal;
    pivo.userData.aberta = estado.portasAbertas ? 1 : 0;
    pivo.userData.alvo = pivo.userData.aberta;
    pivo.rotation.y = -sinal * ANGULO_PORTA * suave3(pivo.userData.aberta);
    portas.push(pivo);
    grupo.add(pivo);
  }

  function montarCesto(x, pecasCesto) {
    const g = new THREE.Group();
    g.position.set(x, 0, 0.1);
    const pts = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(new THREE.Vector2(0.2 + 0.03 * t + 0.006 * Math.sin(t * 20), t * 0.55)); }
    const corpo = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), MAT.palha); corpo.castShadow = true; corpo.receiveShadow = true;
    const fundo = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), MAT.palha); fundo.rotation.x = -Math.PI / 2; fundo.position.y = 0.01;
    const borda = new THREE.Mesh(new THREE.TorusGeometry(0.232, 0.012, 8, 40), MAT.palha); borda.rotation.x = Math.PI / 2; borda.position.y = 0.55;
    g.add(corpo, fundo, borda);
    pecasCesto.slice(0, 14).forEach((p, k) => {
      const bolo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 1), materialDaPeca(p));
      const a = hash(p.nome);
      bolo.scale.set(1.2, 0.55, 0.9);
      bolo.position.set(((a % 100) / 100 - 0.5) * 0.2, 0.08 + k * 0.035, (((a >> 8) % 100) / 100 - 0.5) * 0.2);
      bolo.rotation.set(a % 3, a % 5, a % 7);
      bolo.castShadow = true;
      g.add(bolo);
      registrarPeca(bolo, p);
    });
    corpo.userData.especial = 'cesto'; alvosClique.push(corpo);
    grupo.add(g);
    etiquetaFlutuante(g, 'Para lavar · ' + pecasCesto.length, 0.7);
  }
  function montarCaixaDoar(x, pecasDoar) {
    const g = new THREE.Group();
    g.position.set(x, 0, 0.05);
    const caixa = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.36), MAT.papelao); caixa.position.y = 0.17; caixa.castShadow = true; caixa.receiveShadow = true;
    const aba = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.005, 0.17), MAT.papelao); aba.position.set(0, 0.36, -0.24); aba.rotation.x = -0.7;
    const rotulo = textoEmCanvas(256, 96, (gg, w, h) => { gg.fillStyle = '#f3ecdc'; gg.fillRect(0, 0, w, h); gg.fillStyle = '#231b12'; gg.font = '700 44px "Archivo", sans-serif'; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText('DOAR', w / 2, h / 2 + 2); });
    const etq = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.075), pbr({ map: rotulo, roughness: 0.9 })); etq.position.set(0, 0.22, 0.181); etq.userData.matDescartavel = true;
    g.add(caixa, aba, etq);
    pecasDoar.slice(0, 8).forEach((p, k) => {
      const obj = objetoDobrado(p, tipoDe(p.tipo), 0.26);
      obj.position.set(0, 0.3 + k * 0.03, 0); obj.rotation.y = k * 0.3;
      g.add(obj); registrarPeca(obj, p);
    });
    caixa.userData.especial = 'doar'; alvosClique.push(caixa);
    grupo.add(g);
  }
  function montarPilhaSolta(x, soltas) {
    const g = new THREE.Group();
    g.position.set(x + 0.55, 0, 0.35);
    soltas.slice(0, 10).forEach((p, k) => {
      const obj = objetoDobrado(p, tipoDe(p.tipo), 0.3);
      obj.position.set(0, 0.02 + k * 0.045, 0); obj.rotation.y = k * 0.2;
      g.add(obj); registrarPeca(obj, p);
    });
    grupo.add(g);
    etiquetaFlutuante(g, 'Sem lugar · ' + soltas.length, 0.6);
  }
  function etiquetaFlutuante(pai, texto, y) {
    const tex = textoEmCanvas(512, 96, (g, w, h) => {
      g.fillStyle = 'rgba(24,20,16,.78)'; const r = 44; g.beginPath(); g.moveTo(r, 4); g.arcTo(w - 4, 4, w - 4, h - 4, r); g.arcTo(w - 4, h - 4, 4, h - 4, r); g.arcTo(4, h - 4, 4, 4, r); g.arcTo(4, 4, w - 4, 4, r); g.fill();
      g.fillStyle = '#f6f1e7'; g.font = '600 40px "Archivo", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(texto, w / 2, h / 2 + 2);
    });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    s.scale.set(0.4, 0.075, 1); s.position.set(0, y, 0.1);
    s.userData.matDescartavel = true;
    pai.add(s);
  }

  /* ---------- manequim: veste o look escolhido ---------- */
  function montarManequim(x) {
    const g = new THREE.Group();
    g.position.set(x, 0, 0.15);
    // pé e haste
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.025, 36), MAT.madeiraEscura); base.position.y = 0.0125; base.castShadow = true; base.receiveShadow = true;
    const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.0, 12), MAT.latao); haste.position.y = 0.52; haste.castShadow = true;
    g.add(base, haste);
    // tronco (busto de costureira)
    const perfil = [[0.0, 0], [0.11, 0.0], [0.155, 0.08], [0.14, 0.2], [0.125, 0.3], [0.15, 0.42], [0.17, 0.52], [0.15, 0.6], [0.07, 0.66], [0.05, 0.7], [0.05, 0.75], [0.0, 0.76]].map(([r, y]) => new THREE.Vector2(r, y));
    const tronco = new THREE.Mesh(new THREE.LatheGeometry(perfil, 40), MAT.manequim); tronco.position.y = 1.0; tronco.scale.set(1, 1, 0.72);
    tronco.castShadow = true; tronco.receiveShadow = true;
    const tampa = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 12), MAT.madeiraEscura); tampa.position.y = 1.77;
    g.add(tronco, tampa);
    tronco.userData.especial = 'manequim'; alvosClique.push(tronco);
    const roupa = new THREE.Group(); g.add(roupa);
    grupo.add(g);
    manequim = { grupo: g, roupa, x };
    vestirManequim();
    etiquetaFlutuante(g, estado.lookAtivo ? 'Look: ' + estado.lookAtivo : 'Looks', 1.96);
  }
  function vestirManequim() {
    if (!manequim) return;
    const { roupa } = manequim;
    const velhos = new Set();
    roupa.traverse((o) => { velhos.add(o); if (o.geometry) o.geometry.dispose(); });
    alvosClique = alvosClique.filter((o) => !velhos.has(o));
    roupa.clear();
    const look = estado.dados.looks.find((l) => l.nome === estado.lookAtivo);
    if (!look) return;
    const c = vestir(look, estado.dados.pecas);
    const casca = (perfil, y, escalaZ, p) => {
      const m = new THREE.Mesh(new THREE.LatheGeometry(perfil.map(([r, yy]) => new THREE.Vector2(r, yy)), 40, 0, Math.PI * 2), materialDaPeca(p));
      m.position.y = y; m.scale.z = escalaZ; m.castShadow = true;
      m.userData.peca = p.nome; alvosClique.push(m);
      roupa.add(m);
      return m;
    };
    const cima = c.cima || null;
    if (c.inteira) casca([[0.02, -0.55], [0.3, -0.55], [0.2, 0.0], [0.135, 0.3], [0.16, 0.42], [0.178, 0.52], [0.158, 0.6], [0.075, 0.65], [0.06, 0.66]], 1.0, 0.76, c.inteira);
    if (cima) casca([[0.0, 0.12], [0.148, 0.12], [0.132, 0.3], [0.158, 0.42], [0.18, 0.52], [0.16, 0.6], [0.078, 0.655], [0.062, 0.662]], 1.0, 0.76, cima);
    if (c.fora) casca([[0.0, 0.02], [0.17, 0.02], [0.15, 0.3], [0.172, 0.42], [0.194, 0.52], [0.172, 0.6], [0.09, 0.66], [0.07, 0.68]], 1.0, 0.8, c.fora);
    if (c.baixo) {
      const f = tipoDe(c.baixo.tipo).forma;
      if (f === 'saia') casca([[0.0, -0.45], [0.26, -0.45], [0.165, 0.08], [0.15, 0.14], [0.0, 0.14]], 1.0, 0.76, c.baixo);
      else {
        const comp = f === 'bermuda' ? 0.42 : 0.92;
        const mat = materialDaPeca(c.baixo);
        const quadril = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.16, 0.16, 32), mat); quadril.position.y = 1.07; quadril.scale.z = 0.76; quadril.castShadow = true;
        roupa.add(quadril); quadril.userData.peca = c.baixo.nome; alvosClique.push(quadril);
        [-0.075, 0.075].forEach((dx) => {
          const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.06, comp, 20), mat);
          perna.position.set(dx, 1.0 - comp / 2, 0); perna.castShadow = true;
          perna.userData.peca = c.baixo.nome; alvosClique.push(perna);
          roupa.add(perna);
        });
      }
    }
    if (c.pe) { const par = sapato(c.pe); par.position.set(0, 0.025, 0.22); roupa.add(par); par.traverse((o) => { if (o.isMesh) { o.userData.peca = c.pe.nome; alvosClique.push(o); } }); }
    marcarSujo();
  }

  /* ---------- animações de porta e gaveta ---------- */
  function suave3(t) { return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); }
  function abrirPorta(m, abrir) {
    const p = portas.find((x) => x.children[0] && x.children[0].userData.porta === m);
    if (!p) return;
    p.userData.alvo = abrir == null ? (p.userData.alvo ? 0 : 1) : (abrir ? 1 : 0);
    marcarSujo();
  }
  function todasAsPortas(abrir) {
    estado.portasAbertas = abrir;
    portas.forEach((p, k) => { setTimeout(() => { p.userData.alvo = abrir ? 1 : 0; marcarSujo(); }, k * 140); });
    pintarBarra();
  }
  function alternarGaveta(g) {
    const abrir = !g.userData.alvo;
    gavetas.forEach((x) => { if (x !== g) x.userData.alvo = 0; });
    g.userData.alvo = abrir ? 1 : 0;
    const m = g.userData.gaveta.m;
    abrirPorta(m, true);
    if (abrir) focar(g.position.x, g.position.y + 0.1, 1.25, 0.62);
    marcarSujo();
  }

  /* ---------- câmera: gira em volta do móvel (arrastar), aproxima (roda/pinça), foca ao tocar ---------- */
  const cam = { alvo: new THREE.Vector3(0, 1.1, 0), yaw: 0, pitch: 0.06, dist: 4.5 };
  const atual = { alvo: new THREE.Vector3(0, 1.3, 0), yaw: -0.35, pitch: 0.18, dist: 6.2 };
  let velYaw = 0, velPitch = 0, arrastando = false;
  function enquadrar() {
    const k = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const aspecto = Math.max(0.4, camera.aspect || 1.6);
    const emPe = aspecto < 0.9;
    const largVer = emPe ? larguraTotal * 0.55 + 0.3 : larguraTotal + 2.6;
    const util = emPe ? 0.66 : 0.82;
    cam.dist = clamp(Math.max((ALT + 0.4) / (k * util), largVer / (k * aspecto)), 2.2, 9);
    cam.alvo.set(0, ALT / 2 + cam.dist * k * (emPe ? 0.01 : 0.03), 0);
    cam.yaw = 0; cam.pitch = 0.05;
  }
  function focar(x, y, dist, pitch = 0.08) {
    cam.alvo.set(x, y, 0.05); cam.dist = dist; cam.pitch = pitch; cam.yaw = clamp(cam.yaw, -0.25, 0.25);
    marcarSujo();
  }
  function passoCamera(dt) {
    if (!arrastando && (Math.abs(velYaw) > 1e-4 || Math.abs(velPitch) > 1e-4)) {
      cam.yaw = clamp(cam.yaw + velYaw * dt, -0.85, 0.85); cam.pitch = clamp(cam.pitch + velPitch * dt, -0.05, 0.85);
      const f = Math.exp(-dt * 4.5); velYaw *= f; velPitch *= f;
    }
    const k = 1 - Math.exp(-dt * 6);
    const antes = camera.position.clone();
    atual.alvo.lerp(cam.alvo, k);
    atual.yaw += (cam.yaw - atual.yaw) * k;
    atual.pitch += (cam.pitch - atual.pitch) * k;
    atual.dist += (cam.dist - atual.dist) * (1 - Math.exp(-dt * 3.4));
    const cp = Math.cos(atual.pitch);
    camera.position.set(atual.alvo.x + atual.dist * Math.sin(atual.yaw) * cp, atual.alvo.y + atual.dist * Math.sin(atual.pitch), atual.alvo.z + atual.dist * Math.cos(atual.yaw) * cp);
    camera.lookAt(atual.alvo);
    return camera.position.distanceToSquared(antes) > 1e-10;
  }

  /* ---------- persistência ---------- */
  let timerSalvar = 0, salvando = Promise.resolve();
  function salvar() {
    clearTimeout(timerSalvar);
    timerSalvar = setTimeout(() => {
      salvando = salvando.then(async () => {
        // o corpo sai na hora do envio: assim leva a versão devolvida pela gravação anterior (sem 409 falso)
        const corpo = JSON.stringify({ ...estado.dados, versao: estado.versao });
        const r = await fetch('/api/guarda-roupa', { method: 'POST', headers: H, body: corpo });
        const j = await r.json().catch(() => ({}));
        if (r.status === 409 && j.atual) {
          estado.dados = { movel: j.atual.movel, pecas: j.atual.pecas, looks: j.atual.looks };
          estado.versao = j.atual.versao;
          aviso(j.erro, 'erro'); montar(); pintarBarra(); repintarPainelAberto();
          return;
        }
        if (!r.ok) throw new Error(j.erro || 'Não consegui salvar.');
        estado.versao = j.versao; estado.existe = true;
        aviso('Salvo no caderno ✓', 'ok');
      }).catch((e) => aviso(e.message || 'Não consegui salvar.', 'erro'));
    }, 350);
  }
  function mudou(refazer = true) { if (refazer) montar(); pintarBarra(); salvar(); }
  let timerAviso = 0;
  function aviso(texto, tipo) {
    const el = $('gr-aviso'); if (!el) return;
    el.textContent = texto; el.className = 'gr-aviso on ' + (tipo || 'ok');
    clearTimeout(timerAviso); timerAviso = setTimeout(() => el.classList.remove('on'), 2600);
  }

  /* ---------- interação ---------- */
  const ray = new THREE.Raycaster();
  let hoverObj = null;
  function alvoNoPonto(cx, cy) {
    const rct = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((cx - rct.left) / rct.width) * 2 - 1, -((cy - rct.top) / rct.height) * 2 + 1), camera);
    const hit = ray.intersectObjects(alvosClique, false)[0];
    if (hit) return hit.object;
    const z = ray.intersectObjects(zonas, false)[0];
    return z ? z.object : null;
  }
  function tocar(obj) {
    const u = obj.userData;
    if (estado.montando && u.peca) { alternarNoLook(u.peca); return; }
    if (u.peca) { selecionarPeca(u.peca); return; }
    if (u.gaveta != null) { const g = gavetas.find((x) => x.userData.gaveta.m === u.gaveta.m && x.userData.gaveta.i === u.gaveta.i); if (g) alternarGaveta(g); return; }
    if (u.porta != null) { abrirPorta(u.porta); return; }
    if (u.especial === 'manequim') { abrirLooks(); return; }
    if (u.especial === 'cesto' || u.especial === 'doar') { abrirLista(u.especial); return; }
    if (u.parte) { const mx = modulosX[u.parte.m]; if (mx) focar(mx.x, obj.position.y, 1.7, 0.08); abrirPorta(u.parte.m, true); }
  }
  const ponteiros = new Map();
  let px0 = 0, py0 = 0, moveu = false, distPinca = 0;
  canvas.addEventListener('pointerdown', (ev) => {
    ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    arrastando = true; moveu = false; px0 = ev.clientX; py0 = ev.clientY; velYaw = velPitch = 0;
    if (ponteiros.size === 2) { const [a, b] = [...ponteiros.values()]; distPinca = Math.hypot(a.x - b.x, a.y - b.y); }
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* teste */ }
    marcarSujo();
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (ponteiros.has(ev.pointerId)) ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (!arrastando) { hover(ev); return; }
    if (ponteiros.size === 2) {
      const [a, b] = [...ponteiros.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (distPinca) cam.dist = clamp(cam.dist * distPinca / Math.max(1, d), 0.9, 9);
      distPinca = d; moveu = true; marcarSujo(); return;
    }
    const dx = ev.clientX - px0, dy = ev.clientY - py0;
    if (Math.abs(dx) + Math.abs(dy) > 4) moveu = true;
    if (moveu) {
      if (ev.shiftKey || ev.buttons === 2) {
        const k = cam.dist * 0.0012;
        cam.alvo.x = clamp(cam.alvo.x - dx * k, -larguraTotal / 2 - 1.2, larguraTotal / 2 + 1.2);
        cam.alvo.y = clamp(cam.alvo.y + dy * k, 0.3, ALT);
      } else {
        const ny = clamp(cam.yaw - dx * 0.0045, -0.85, 0.85), np = clamp(cam.pitch + dy * 0.0035, -0.05, 0.85);
        velYaw = 0.6 * velYaw + 0.4 * (ny - cam.yaw) * 60; velPitch = 0.6 * velPitch + 0.4 * (np - cam.pitch) * 60;
        cam.yaw = ny; cam.pitch = np;
      }
      px0 = ev.clientX; py0 = ev.clientY;
      marcarSujo();
    }
  });
  const soltar = (ev) => {
    ponteiros.delete(ev.pointerId);
    if (ponteiros.size) return;
    arrastando = false; distPinca = 0;
    if (!moveu && ev.type === 'pointerup') { const alvo = alvoNoPonto(ev.clientX, ev.clientY); if (alvo) tocar(alvo); }
  };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);
  canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
  canvas.addEventListener('pointerleave', () => { if (!arrastando) definirHover(null); });
  canvas.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    cam.dist = clamp(cam.dist * (1 + clamp(ev.deltaY * 0.0011, -0.25, 0.25)), 0.9, 9);
    marcarSujo();
  }, { passive: false });
  canvas.addEventListener('dblclick', () => { enquadrar(); marcarSujo(); });

  function hover(ev) {
    if (ev.pointerType !== 'mouse') return;
    const alvo = alvoNoPonto(ev.clientX, ev.clientY);
    canvas.style.cursor = alvo && !alvo.userData.parte ? 'pointer' : '';
    definirHover(alvo && alvo.userData.peca ? alvo.userData.peca : null, ev);
  }
  function definirHover(nome, ev) {
    const obj = nome ? pecaObjs.get(nome) : null;
    if (obj === hoverObj) { if (obj && ev) moverTip(ev); return; }
    hoverObj = obj;
    const t = $('es-tip');
    if (!obj) { t.classList.remove('on'); marcarSujo(); return; }
    const p = estado.dados.pecas.find((x) => x.nome === nome);
    t.innerHTML = '<b>' + esc(nome) + '</b><span>' + esc([tipoDe(p.tipo).nome, p.cor].filter(Boolean).join(' · ')) + '</span>';
    moverTip(ev); t.classList.add('on');
    marcarSujo();
  }
  function moverTip(ev) {
    const rct = canvas.getBoundingClientRect();
    $('es-tip').style.transform = 'translate(' + Math.round(Math.min(ev.clientX - rct.left + 16, rct.width - 260)) + 'px,' + Math.round(ev.clientY - rct.top + 18) + 'px)';
  }

  /* ---------- painéis ---------- */
  const acharPeca = (nome) => estado.dados.pecas.find((p) => p.nome === nome);
  const opcoesLugar = (atual) => ['<option value="">— sem lugar —</option>'].concat(estado.dados.movel.flatMap((partes, m) => partes.map((pt) => '<option value="' + esc(pt.nome) + '"' + (norm(pt.nome) === norm(atual) ? ' selected' : '') + '>Módulo ' + (m + 1) + ' · ' + esc(pt.nome) + ' (' + pt.tipo + ')</option>'))).join('');
  const chips = (campo, valores, atual) => '<div class="gr-chips" data-campo="' + campo + '">' + valores.map((v) => '<button type="button" class="gr-chip' + (norm(atual).includes(norm(v)) ? ' on' : '') + '" data-valor="' + esc(v) + '">' + esc(v) + '</button>').join('') + '</div>';
  const corChips = (atual) => '<div class="gr-cores">' + LISTA_CORES.map((c) => '<button type="button" class="gr-cor' + (norm(atual) === norm(c) ? ' on' : '') + '" data-cor="' + esc(c) + '" title="' + esc(c) + '" style="--c:' + CORES[c] + '"></button>').join('') + '</div>';

  function fecharPaineis() { ['gr-peca', 'gr-looks', 'gr-org', 'es-guia'].forEach((id) => $(id) && $(id).classList.remove('aberto')); devolverPeca(); }
  function repintarPainelAberto() {
    if ($('gr-peca').classList.contains('aberto') && estado.selecionada) pintarPeca(estado.selecionada);
    if ($('gr-looks').classList.contains('aberto')) pintarLooks();
    if ($('gr-org').classList.contains('aberto')) pintarOrg();
  }

  // --- peça: ver e editar ---
  let pecaFora = null;
  function selecionarPeca(nome) {
    const p = acharPeca(nome);
    if (!p) return;
    devolverPeca();
    estado.selecionada = nome;
    const obj = pecaObjs.get(nome);
    if (obj) {
      pecaFora = obj;
      obj.userData.tirada = 1;
      const w = obj.getWorldPosition(new THREE.Vector3());
      // no computador o painel ocupa a direita: a câmera olha um pouco à direita da peça, que fica no espaço livre
      const desloc = movel ? 0 : (obj.userData.pendurada ? 0.42 : 0.3);
      focar(w.x + desloc, w.y - (obj.userData.pendurada ? 0.32 : 0), obj.userData.pendurada ? 2.5 : 1.5, 0.08);
    }
    ['gr-looks', 'gr-org', 'es-guia'].forEach((id) => $(id).classList.remove('aberto'));
    pintarPeca(nome);
    $('gr-peca').classList.add('aberto');
    marcarSujo();
  }
  function devolverPeca() { if (pecaFora) { pecaFora.userData.tirada = 0; pecaFora = null; marcarSujo(); } }
  function looksDaPeca(nome) { return estado.dados.looks.filter((l) => l.pecas.includes(nome)); }
  function pintarPeca(nome, nova) {
    const p = nova || acharPeca(nome);
    if (!p) return;
    const el = $('gr-peca');
    const cor = corDaPeca(p.cor);
    el.innerHTML = '<button type="button" class="es-x" data-a="fechar" aria-label="Fechar">×</button>' +
      '<div class="gr-cabeca"><span class="gr-amostra" style="--c:' + cor.base + '"></span><div><h2>' + esc(nova ? 'Nova peça' : p.nome) + '</h2><p class="es-autor">' + esc([tipoDe(p.tipo).nome, p.cor].filter(Boolean).join(' · ')) + '</p></div></div>' +
      '<label class="es-campo-form"><span class="es-rot">Nome</span><input id="gp-nome" value="' + esc(p.nome) + '" placeholder="ex.: Camisa branca de linho"></label>' +
      '<div class="es-campo"><p class="es-rot">Tipo</p><select id="gp-tipo" class="gr-sel">' + LISTA_TIPOS.map((t) => '<option' + (norm(tipoDe(p.tipo).nome) === norm(t) ? ' selected' : '') + '>' + esc(t) + '</option>').join('') + '</select></div>' +
      '<div class="es-campo"><p class="es-rot">Cor</p>' + corChips(p.cor) + '<input id="gp-cor" class="es-mini-in" value="' + esc(p.cor) + '" placeholder="ou escreva: xadrez vermelho e preto, listrado azul e branco, #1f2d48…"></div>' +
      '<label class="es-campo-form"><span class="es-rot">Tecido</span><input id="gp-tecido" value="' + esc(p.tecido) + '" placeholder="algodão, jeans, malha, linho, lã…"></label>' +
      '<div class="es-campo"><p class="es-rot">Onde fica</p><select id="gp-lugar" class="gr-sel">' + opcoesLugar(p.lugar) + '</select></div>' +
      '<div class="es-campo"><p class="es-rot">Estado</p>' + chips('estado', ESTADOS, p.estado || 'limpa') + '</div>' +
      '<div class="es-campo"><p class="es-rot">Estação</p>' + chips('estacao', ESTACOES, p.estacao) + '</div>' +
      '<div class="es-campo"><p class="es-rot">Ocasião</p>' + chips('ocasiao', OCASIOES, p.ocasiao) + '</div>' +
      '<label class="es-campo-form"><span class="es-rot">Tags</span><input id="gp-tags" value="' + esc(p.tags.join(', ')) + '" placeholder="separadas por vírgula"></label>' +
      '<label class="es-campo-form"><span class="es-rot">Notas</span><input id="gp-notas" value="' + esc(p.notas) + '" placeholder="onde comprou, cuidado na lavagem…"></label>' +
      (nova ? '' : '<div class="es-campo"><p class="es-rot">Nos looks</p><div class="es-tagslivres">' + (looksDaPeca(p.nome).map((l) => '<span>' + esc(l.nome) + '</span>').join('') || '<span class="gr-apagado">em nenhum ainda</span>') + '</div>' +
        '<div class="es-linha-bt"><select id="gp-look"><option value="">Pôr num look…</option>' + estado.dados.looks.filter((l) => !l.pecas.includes(p.nome)).map((l) => '<option>' + esc(l.nome) + '</option>').join('') + '<option value="__novo__">+ look novo com esta peça</option></select></div></div>') +
      '<div class="es-botoes-form"><button type="button" class="principal" data-a="salvar">' + (nova ? 'Adicionar peça' : 'Salvar') + '</button>' + (nova ? '<button type="button" data-a="fechar">Cancelar</button>' : '<button type="button" data-a="apagar" class="gr-perigo">Apagar peça</button>') + '</div>';
    const sel = {};
    ['estado', 'estacao', 'ocasiao'].forEach((c) => { sel[c] = c === 'estado' ? (p.estado || 'limpa') : p[c]; });
    el.querySelectorAll('.gr-chips').forEach((cx) => cx.addEventListener('click', (ev) => {
      const b = ev.target.closest('.gr-chip'); if (!b) return;
      const campo = cx.dataset.campo;
      if (campo === 'estado') { sel.estado = b.dataset.valor; cx.querySelectorAll('.gr-chip').forEach((x) => x.classList.toggle('on', x === b)); return; }
      b.classList.toggle('on');
      sel[campo] = [...cx.querySelectorAll('.gr-chip.on')].map((x) => x.dataset.valor).join(', ');
    }));
    el.querySelectorAll('.gr-cor').forEach((b) => b.addEventListener('click', () => { $('gp-cor').value = b.dataset.cor; el.querySelectorAll('.gr-cor').forEach((x) => x.classList.toggle('on', x === b)); }));
    el.querySelector('[data-a="salvar"]').addEventListener('click', () => {
      const dados = {
        nome: $('gp-nome').value.trim(), tipo: $('gp-tipo').value, cor: $('gp-cor').value.trim(), tecido: $('gp-tecido').value.trim(),
        lugar: $('gp-lugar').value, estado: sel.estado === 'limpa' ? '' : sel.estado, estacao: sel.estacao || '', ocasiao: sel.ocasiao || '',
        tags: $('gp-tags').value.split(',').map((x) => x.trim()).filter(Boolean), notas: $('gp-notas').value.trim(),
      };
      if (!dados.nome) { aviso('Dê um nome pra peça.', 'erro'); return; }
      if (nova) {
        dados.nome = nomeUnico(dados.nome, estado.dados.pecas);
        estado.dados.pecas.push(dados);
        mudou(); selecionarPeca(dados.nome); aviso('Peça adicionada ✓', 'ok'); return;
      }
      const alvo = acharPeca(nome);
      const antigo = alvo.nome;
      dados.nome = nomeUnico(dados.nome, estado.dados.pecas, alvo);
      Object.assign(alvo, dados);
      if (antigo !== dados.nome) estado.dados.looks.forEach((l) => { l.pecas = l.pecas.map((x) => (x === antigo ? dados.nome : x)); });
      estado.selecionada = dados.nome;
      mudou(); selecionarPeca(dados.nome);
    });
    el.querySelectorAll('[data-a="fechar"]').forEach((b) => b.addEventListener('click', () => { el.classList.remove('aberto'); estado.selecionada = null; devolverPeca(); }));
    const apagar = el.querySelector('[data-a="apagar"]');
    if (apagar) apagar.addEventListener('click', () => {
      if (!apagar.classList.contains('confirmar')) { apagar.classList.add('confirmar'); apagar.textContent = 'Confirmar?'; setTimeout(() => { apagar.classList.remove('confirmar'); apagar.textContent = 'Apagar peça'; }, 3500); return; }
      estado.dados.pecas = estado.dados.pecas.filter((x) => x.nome !== nome);
      estado.dados.looks.forEach((l) => { l.pecas = l.pecas.filter((x) => x !== nome); });
      el.classList.remove('aberto'); estado.selecionada = null; pecaFora = null;
      mudou(); aviso('Peça apagada.', 'ok');
    });
    const selLook = el.querySelector('#gp-look');
    if (selLook) selLook.addEventListener('change', () => {
      let alvoLook = selLook.value;
      if (!alvoLook) return;
      if (alvoLook === '__novo__') { alvoLook = nomeUnico('Look novo', estado.dados.looks); estado.dados.looks.push({ nome: alvoLook, pecas: [], ocasiao: '', notas: '' }); }
      const l = estado.dados.looks.find((x) => x.nome === alvoLook);
      if (l && !l.pecas.includes(nome)) l.pecas.push(nome);
      estado.lookAtivo = alvoLook;
      mudou(); pintarPeca(nome); aviso('"' + nome + '" entrou em "' + alvoLook + '".', 'ok');
    });
  }
  function novaPeca() {
    fecharPaineis();
    const primeiraParte = estado.dados.movel[0] && estado.dados.movel[0][0];
    pintarPeca(null, { nome: '', tipo: 'camiseta', cor: '', tecido: '', estacao: '', ocasiao: '', lugar: primeiraParte ? primeiraParte.nome : '', estado: '', tags: [], notas: '' });
    $('gr-peca').classList.add('aberto');
    setTimeout(() => $('gp-nome') && $('gp-nome').focus(), 350);
  }

  // --- looks ---
  function alternarNoLook(nomePeca) {
    const l = estado.dados.looks.find((x) => x.nome === estado.montando);
    if (!l) return;
    l.pecas = l.pecas.includes(nomePeca) ? l.pecas.filter((x) => x !== nomePeca) : [...l.pecas, nomePeca];
    estado.lookAtivo = l.nome;
    vestirManequim(); pintarBandeja(); aplicarDestaques(); salvar();
  }
  function abrirLooks() { fecharPaineis(); pintarLooks(); $('gr-looks').classList.add('aberto'); if (manequim) focar(manequim.x, 1.05, 2.4, 0.06); }
  function pintarLooks() {
    const el = $('gr-looks');
    el.innerHTML = '<button type="button" class="es-x" data-a="fechar" aria-label="Fechar">×</button><h2>Looks</h2>' +
      '<p class="gr-apagado">Um look é um conjunto de peças. Escolha um pra vesti-lo no manequim ao lado do guarda-roupa.</p>' +
      '<div class="eo-nova"><input id="gl-novo" placeholder="Nome do look, ex.: Dia de prova"><button type="button" class="eo-mini principal" data-a="novo">Criar e montar</button></div>' +
      (estado.dados.looks.length ? '' : '<p class="gr-apagado">Nenhum look ainda.</p>') +
      estado.dados.looks.map((l) => {
        const ps = l.pecas.map(acharPeca).filter(Boolean);
        const ativo = l.nome === estado.lookAtivo;
        return '<section class="gr-look' + (ativo ? ' ativo' : '') + '" data-look="' + esc(l.nome) + '">' +
          '<header><input class="eo-nome-lista" value="' + esc(l.nome) + '" data-a="renomear" data-look="' + esc(l.nome) + '" aria-label="Nome do look"><button type="button" class="eo-mini' + (ativo ? ' on' : '') + '" data-a="vestir" data-look="' + esc(l.nome) + '">' + (ativo ? 'No manequim ✓' : 'Vestir') + '</button></header>' +
          '<div class="gr-amostras">' + ps.map((p) => '<button type="button" class="gr-mini" data-a="peca" data-peca="' + esc(p.nome) + '" title="' + esc(p.nome) + '"><i style="--c:' + corDaPeca(p.cor).base + '"></i>' + esc(p.nome) + '</button>').join('') + (ps.length ? '' : '<span class="gr-apagado">sem peças</span>') + '</div>' +
          '<input class="eo-desc" value="' + esc(l.ocasiao) + '" placeholder="Ocasião (opcional)" data-a="ocasiao" data-look="' + esc(l.nome) + '">' +
          '<div class="eo-btns-lista"><button type="button" class="eo-mini" data-a="montar" data-look="' + esc(l.nome) + '">Escolher peças no guarda-roupa</button><button type="button" class="eo-mini" data-a="apagar" data-look="' + esc(l.nome) + '">Apagar look</button></div>' +
        '</section>';
      }).join('');
    const achar = (b) => estado.dados.looks.find((x) => x.nome === b.dataset.look);
    el.querySelector('[data-a="fechar"]').addEventListener('click', () => el.classList.remove('aberto'));
    el.querySelector('[data-a="novo"]').addEventListener('click', () => {
      const nome = nomeUnico($('gl-novo').value.trim() || 'Look novo', estado.dados.looks);
      estado.dados.looks.push({ nome, pecas: [], ocasiao: '', notas: '' });
      estado.lookAtivo = nome; salvar(); comecarMontagem(nome);
    });
    el.querySelectorAll('[data-a="vestir"]').forEach((b) => b.addEventListener('click', () => { estado.lookAtivo = b.dataset.look; montar(); pintarLooks(); }));
    el.querySelectorAll('[data-a="montar"]').forEach((b) => b.addEventListener('click', () => comecarMontagem(b.dataset.look)));
    el.querySelectorAll('[data-a="peca"]').forEach((b) => b.addEventListener('click', () => selecionarPeca(b.dataset.peca)));
    el.querySelectorAll('[data-a="apagar"]').forEach((b) => b.addEventListener('click', () => {
      if (!b.classList.contains('confirmar')) { b.classList.add('confirmar'); b.textContent = 'Confirmar?'; return; }
      estado.dados.looks = estado.dados.looks.filter((x) => x.nome !== b.dataset.look);
      if (estado.lookAtivo === b.dataset.look) estado.lookAtivo = estado.dados.looks[0] ? estado.dados.looks[0].nome : null;
      mudou(); pintarLooks();
    }));
    el.querySelectorAll('[data-a="renomear"]').forEach((inp) => inp.addEventListener('change', () => {
      const l = achar(inp); const novo = nomeUnico(inp.value.trim() || l.nome, estado.dados.looks, l);
      if (estado.lookAtivo === l.nome) estado.lookAtivo = novo;
      l.nome = novo; mudou(); pintarLooks();
    }));
    el.querySelectorAll('[data-a="ocasiao"]').forEach((inp) => inp.addEventListener('change', () => { const l = achar(inp); l.ocasiao = inp.value.trim(); salvar(); }));
  }
  function comecarMontagem(nome) {
    estado.montando = nome; estado.lookAtivo = nome;
    fecharPaineis(); todasAsPortas(true); enquadrar(); vestirManequim(); pintarBandeja(); aplicarDestaques();
  }
  function terminarMontagem() { estado.montando = null; pintarBandeja(); aplicarDestaques(); montar(); abrirLooks(); }
  function pintarBandeja() {
    const b = $('es-bandeja');
    if (!estado.montando) { b.hidden = true; return; }
    const l = estado.dados.looks.find((x) => x.nome === estado.montando);
    b.hidden = false;
    b.innerHTML = '<div class="eb-linha"><span class="eb-n">Montando <b>' + esc(l ? l.nome : '') + '</b> · ' + (l ? l.pecas.length : 0) + ' peças</span>' +
      '<span class="eb-msg" style="margin:0">toque nas peças do guarda-roupa pra pôr ou tirar</span>' +
      '<button type="button" class="fim" data-a="fim">Pronto</button></div>';
    b.querySelector('[data-a="fim"]').addEventListener('click', terminarMontagem);
  }
  function aplicarDestaques() {
    const l = estado.montando ? estado.dados.looks.find((x) => x.nome === estado.montando) : null;
    pecaObjs.forEach((obj, nome) => {
      const dentro = l && l.pecas.includes(nome);
      obj.traverse((o) => { if (o.isMesh && o.material && o.material.emissive) { if (dentro && !o.userData.matDescartavel) { o.material = o.material.clone(); o.userData.matDescartavel = true; } if (o.userData.matDescartavel) o.material.emissive.set(dentro ? 0x5a4410 : 0x000000); } });
    });
    marcarSujo();
  }

  // --- lista do cesto / doação ---
  function abrirLista(qual) {
    fecharPaineis();
    const el = $('gr-org');
    const itens = estado.dados.pecas.filter((p) => (qual === 'cesto' ? /lavar|suja/ : /doar/).test(norm(p.estado)));
    el.innerHTML = '<button type="button" class="es-x" data-a="fechar" aria-label="Fechar">×</button><h2>' + (qual === 'cesto' ? 'Para lavar' : 'Para doar') + '</h2>' +
      (itens.length ? itens.map((p) => '<div class="eo-item"><i class="gr-bolinha" style="--c:' + corDaPeca(p.cor).base + '"></i><button type="button" class="eo-livro" data-a="peca" data-peca="' + esc(p.nome) + '">' + esc(p.nome) + '<em>volta pra ' + esc(p.lugar || 'sem lugar') + '</em></button>' +
        '<button type="button" class="eo-mini" data-a="volta" data-peca="' + esc(p.nome) + '">' + (qual === 'cesto' ? 'Lavada ✓' : 'Desistir') + '</button></div>').join('') : '<p class="gr-apagado">Nada aqui.</p>');
    el.querySelector('[data-a="fechar"]').addEventListener('click', () => el.classList.remove('aberto'));
    el.querySelectorAll('[data-a="peca"]').forEach((b) => b.addEventListener('click', () => selecionarPeca(b.dataset.peca)));
    el.querySelectorAll('[data-a="volta"]').forEach((b) => b.addEventListener('click', () => { const p = acharPeca(b.dataset.peca); p.estado = ''; mudou(); abrirLista(qual); }));
    el.classList.add('aberto');
  }

  // --- organizar o móvel ---
  function abrirOrg() { fecharPaineis(); pintarOrg(); $('gr-org').classList.add('aberto'); }
  function pintarOrg() {
    const el = $('gr-org');
    const mv = estado.dados.movel;
    const cont = distribuir(estado.dados.pecas, mv).partes;
    const nExemplos = estado.dados.pecas.filter((p) => p.tags.some((t) => norm(t) === 'exemplo')).length;
    el.innerHTML = '<button type="button" class="es-x" data-a="fechar" aria-label="Fechar">×</button><h2>Organizar o móvel</h2>' +
      '<p class="gr-apagado">Módulos lado a lado (o 1 é o da esquerda); em cada um, as divisões de cima pra baixo. Cada peça diz em qual divisão mora (no painel dela, "Onde fica").</p>' +
      mv.map((partes, m) => '<section class="eo-andar"><header><b>Módulo ' + (m + 1) + '</b><span class="eo-btns">' +
        '<button type="button" class="eo-mini" data-a="mod-esq" data-m="' + m + '">◀</button><button type="button" class="eo-mini" data-a="mod-dir" data-m="' + m + '">▶</button>' +
        '<button type="button" class="eo-mini" data-a="mod-apaga" data-m="' + m + '">Apagar</button></span></header>' +
        partes.map((pt, i) => '<div class="gr-parte"><select data-a="tipo" data-m="' + m + '" data-i="' + i + '">' + TIPOS_PARTE.map(([v, r]) => '<option value="' + v + '"' + (pt.tipo === v ? ' selected' : '') + '>' + r + '</option>').join('') + '</select>' +
          '<input class="eo-nome" value="' + esc(pt.nome) + '" data-a="nome" data-m="' + m + '" data-i="' + i + '" aria-label="Nome da divisão">' +
          '<span class="gr-n">' + ((cont.get(m + ':' + i) || []).length) + '</span>' +
          '<button type="button" class="eo-mini" data-a="sobe" data-m="' + m + '" data-i="' + i + '">▲</button><button type="button" class="eo-mini" data-a="desce" data-m="' + m + '" data-i="' + i + '">▼</button>' +
          '<button type="button" class="eo-mini" data-a="tira" data-m="' + m + '" data-i="' + i + '">✕</button></div>').join('') +
        '<button type="button" class="eo-mais" data-a="parte-nova" data-m="' + m + '">+ divisão neste módulo</button></section>').join('') +
      '<button type="button" class="eo-mais" data-a="mod-novo">+ módulo à direita</button>' +
      (nExemplos ? '<div class="gr-exemplos"><p>' + nExemplos + ' peças de <b>exemplo</b> (tag "exemplo") estão aí só pra você ver funcionando.</p><button type="button" class="eo-mini" data-a="sem-exemplos">Apagar as ' + nExemplos + ' peças de exemplo</button></div>' : '');
    const n = (b) => [+b.dataset.m, +b.dataset.i];
    el.querySelector('[data-a="fechar"]').addEventListener('click', () => el.classList.remove('aberto'));
    const acoes = {
      'mod-esq': (m) => { if (m > 0) [mv[m - 1], mv[m]] = [mv[m], mv[m - 1]]; },
      'mod-dir': (m) => { if (m < mv.length - 1) [mv[m + 1], mv[m]] = [mv[m], mv[m + 1]]; },
      'mod-apaga': (m) => { if (mv.length > 1) mv.splice(m, 1); },
      'parte-nova': (m) => { mv[m].push({ tipo: 'prateleira', nome: nomeParteUnico('Prateleira') }); },
      sobe: (m, i) => { if (i > 0) [mv[m][i - 1], mv[m][i]] = [mv[m][i], mv[m][i - 1]]; },
      desce: (m, i) => { if (i < mv[m].length - 1) [mv[m][i + 1], mv[m][i]] = [mv[m][i], mv[m][i + 1]]; },
      tira: (m, i) => { if (mv[m].length > 1) mv[m].splice(i, 1); },
      'mod-novo': () => { mv.push([{ tipo: 'cabideiro', nome: nomeParteUnico('Cabideiro') }]); },
      'sem-exemplos': () => {
        const nomes = new Set(estado.dados.pecas.filter((p) => p.tags.some((t) => norm(t) === 'exemplo')).map((p) => p.nome));
        estado.dados.pecas = estado.dados.pecas.filter((p) => !nomes.has(p.nome));
        estado.dados.looks.forEach((l) => { l.pecas = l.pecas.filter((x) => !nomes.has(x)); });
      },
    };
    el.querySelectorAll('button[data-a]').forEach((b) => {
      const f = acoes[b.dataset.a]; if (!f) return;
      b.addEventListener('click', () => {
        if ((b.dataset.a === 'mod-apaga' || b.dataset.a === 'tira' || b.dataset.a === 'sem-exemplos') && !b.classList.contains('perigo')) { b.classList.add('perigo'); b.textContent = 'Confirmar?'; return; }
        f(...n(b)); mudou(); pintarOrg();
      });
    });
    el.querySelectorAll('select[data-a="tipo"]').forEach((s) => s.addEventListener('change', () => { const [m, i] = n(s); mv[m][i].tipo = s.value; mudou(); pintarOrg(); }));
    el.querySelectorAll('input[data-a="nome"]').forEach((inp) => inp.addEventListener('change', () => {
      const [m, i] = n(inp); const antigo = mv[m][i].nome; const novo = nomeParteUnico(inp.value.trim() || antigo, mv[m][i]);
      mv[m][i].nome = novo;
      estado.dados.pecas.forEach((p) => { if (norm(p.lugar) === norm(antigo)) p.lugar = novo; });
      mudou(); pintarOrg();
    }));
  }
  function nomeParteUnico(base, ignorar) {
    const usados = new Set(estado.dados.movel.flat().filter((p) => p !== ignorar).map((p) => norm(p.nome)));
    if (!usados.has(norm(base))) return base;
    for (let i = 2; i < 99; i++) if (!usados.has(norm(base + ' ' + i))) return base + ' ' + i;
    return base;
  }

  // --- guia ---
  function abrirGuia() {
    fecharPaineis();
    const sec = (t, x) => '<div class="es-campo"><p class="es-rot">' + t + '</p><p>' + x + '</p></div>';
    $('es-guia').innerHTML = '<button type="button" class="es-x" data-a="fechar" aria-label="Fechar">×</button><h2>Como usar o Guarda-roupa</h2>' +
      sec('Andar em volta', 'Arraste pra girar em volta do móvel; roda do mouse ou pinça pra aproximar; Shift+arraste (ou botão direito) pra deslizar. Dois cliques voltam à vista inteira. Os números à esquerda levam a cada módulo.') +
      sec('Portas e gavetas', 'Toque numa porta pra abrir ou fechar (a do meio tem espelho). Toque numa gaveta pra ela deslizar e a câmera olhar lá dentro. O botão de portas na barra abre ou fecha todas.') +
      sec('Peças', 'Toque numa peça: ela se destaca e abre o painel com nome, tipo, cor (paleta ou escrito: "xadrez vermelho e preto", "listrado azul e branco"), tecido, onde fica, estado, estação e ocasião. "+ Peça" adiciona uma nova.') +
      sec('Lavar e doar', 'Estado "para lavar" leva a peça pro cesto de palha; "doar", pra caixa de papelão. Toque no cesto pra marcar "Lavada ✓" e ela volta pro lugar.') +
      sec('Looks', 'Botão "Looks": crie um look e escolha as peças tocando nelas no guarda-roupa (ficam douradas). O manequim veste o look escolhido: parte de cima, de baixo, casaco e sapatos.') +
      sec('Organizar o móvel', 'Botão "Organizar": módulos lado a lado e divisões (cabideiro, prateleira, gaveta, sapateira), com nome, ordem e tipo. Renomear uma divisão leva as peças junto.') +
      sec('No caderno', 'Tudo fica em Logboard/# Board/Focos/Guarda-roupa.md, em tabelas — dá pra editar lá também.');
    $('es-guia').querySelector('[data-a="fechar"]').addEventListener('click', () => $('es-guia').classList.remove('aberto'));
    $('es-guia').classList.add('aberto');
  }

  /* ---------- barra de cima ---------- */
  const ICONE = {
    voltar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    busca: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    filtro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16l-6 7.5V18l-4 2v-7.5z"/></svg>',
    porta: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M12 3.5v17M9.5 11v2M14.5 11v2"/></svg>',
    ajustes: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/></svg>',
    ajuda: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.7"/><path d="M12 17h.01"/></svg>',
  };
  function pintarBarra() {
    ui.querySelector('.es-barra')?.remove();
    const barra = document.createElement('div');
    barra.className = 'es-barra';
    const f = estado.filtro;
    const nFiltros = [f.tipo, f.estacao, f.ocasiao].filter(Boolean).length;
    const icone = (id, ic, rot, on) => '<button type="button" class="es-btn es-icone' + (on ? ' on' : '') + '" id="' + id + '" title="' + rot + '" aria-label="' + rot + '">' + ic + '</button>';
    const tiposUsados = [...new Set(estado.dados.pecas.map((p) => tipoDe(p.tipo).nome))].sort((a, b) => a.localeCompare(b, 'pt'));
    barra.innerHTML = '<div class="eb-linha">' +
      '<a class="es-voltar" href="eu.html#colecao" title="Voltar para Eu" aria-label="Voltar para Eu">' + ICONE.voltar + '</a>' +
      '<div class="es-titulo"><b>Guarda-roupa</b><span>' + estado.dados.pecas.length + ' peças · ' + estado.dados.looks.length + ' looks</span></div>' +
      '<nav class="gr-troca" aria-label="Móveis"><a href="estante.html">Estante</a><a aria-current="page">Guarda-roupa</a><a href="casa.html">Casa</a></nav>' +
      '<label class="es-busca-cx">' + ICONE.busca + '<input type="search" class="es-busca" id="gr-busca" placeholder="Buscar peça, cor, tag…" value="' + esc(f.busca) + '"></label>' +
      '<div class="eb-acoes">' +
        '<button type="button" class="es-btn es-primario" id="gr-abrir-looks">Looks</button>' +
        '<button type="button" class="es-btn" id="gr-abrir-org">Organizar</button>' +
        '<button type="button" class="es-btn" id="gr-nova">+ Peça</button>' +
        '<span class="eb-sep" aria-hidden="true"></span>' +
        icone('gr-filtrar', ICONE.filtro + (nFiltros ? '<i class="es-badge">' + nFiltros + '</i>' : ''), 'Filtrar', estado.filtroAberto || nFiltros) +
        icone('gr-portas', ICONE.porta, estado.portasAbertas ? 'Fechar as portas' : 'Abrir as portas', !estado.portasAbertas) +
        icone('gr-ajustes', ICONE.ajustes, 'Aparência', estado.ajustesAbertos) +
        icone('gr-guia', ICONE.ajuda, 'Como usar') +
      '</div></div>' +
      ((estado.filtroAberto || nFiltros) ? '<div class="es-tags-cx gr-filtros">' +
        '<span class="es-rot-linha">Tipo</span><div class="es-tags">' + tiposUsados.map((t) => '<button type="button" class="es-tag' + (f.tipo === t ? ' on' : '') + '" data-f="tipo" data-v="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div>' +
        '<span class="es-rot-linha">Estação</span><div class="es-tags">' + ESTACOES.map((t) => '<button type="button" class="es-tag' + (f.estacao === t ? ' on' : '') + '" data-f="estacao" data-v="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div>' +
        '<span class="es-rot-linha">Ocasião</span><div class="es-tags">' + OCASIOES.map((t) => '<button type="button" class="es-tag' + (f.ocasiao === t ? ' on' : '') + '" data-f="ocasiao" data-v="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div>' +
        (nFiltros ? '<button type="button" class="es-limpar-tags" id="gr-limpar">limpar</button>' : '') + '</div>' : '') +
      '<div class="es-ajustes-cx' + (estado.ajustesAbertos ? ' aberto' : '') + '"><div class="eaj-grade">' +
        '<div><p class="es-rot">Ambiente</p><div class="es-fundo-cx">' + AMBIENTES.map((a) => '<button type="button" class="es-fundo-btn' + (estado.fundo === a[0] ? ' on' : '') + '" data-fundo="' + a[0] + '">' + a[1] + '</button>').join('') + '</div></div>' +
        '<div><p class="es-rot">Móvel</p><div class="es-fundo-cx">' + MOVEIS.map((m) => '<button type="button" class="es-fundo-btn' + (estado.estilo === m[0] ? ' on' : '') + '" data-estilo="' + m[0] + '">' + m[1] + '</button>').join('') + '</div></div>' +
      '</div></div>';
    ui.insertBefore(barra, ui.firstChild);
    barra.querySelector('#gr-busca').addEventListener('input', (ev) => { estado.filtro.busca = ev.target.value; montar(); });
    barra.querySelector('#gr-abrir-looks').addEventListener('click', abrirLooks);
    barra.querySelector('#gr-abrir-org').addEventListener('click', abrirOrg);
    barra.querySelector('#gr-nova').addEventListener('click', novaPeca);
    barra.querySelector('#gr-filtrar').addEventListener('click', () => { estado.filtroAberto = !estado.filtroAberto; pintarBarra(); });
    barra.querySelector('#gr-portas').addEventListener('click', () => todasAsPortas(!estado.portasAbertas));
    barra.querySelector('#gr-ajustes').addEventListener('click', () => { estado.ajustesAbertos = !estado.ajustesAbertos; pintarBarra(); });
    barra.querySelector('#gr-guia').addEventListener('click', abrirGuia);
    barra.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => { const c = b.dataset.f; estado.filtro[c] = estado.filtro[c] === b.dataset.v ? '' : b.dataset.v; pintarBarra(); montar(); }));
    const limpar = barra.querySelector('#gr-limpar');
    if (limpar) limpar.addEventListener('click', () => { estado.filtro.tipo = estado.filtro.estacao = estado.filtro.ocasiao = ''; pintarBarra(); montar(); });
    barra.querySelectorAll('[data-fundo]').forEach((b) => b.addEventListener('click', () => { estado.fundo = b.dataset.fundo; try { localStorage.setItem('guarda-roupa-ambiente', estado.fundo); } catch (e) { /* ok */ } sala.aplicar(estado.fundo); espelhoSujo = true; pintarBarra(); marcarSujo(); }));
    barra.querySelectorAll('[data-estilo]').forEach((b) => b.addEventListener('click', () => { estado.estilo = b.dataset.estilo; try { localStorage.setItem('guarda-roupa-movel', estado.estilo); } catch (e) { /* ok */ } montar(); pintarBarra(); }));
  }
  function pintarNavModulos() {
    const nav = $('es-andares-nav');
    if (!nav) return;
    nav.hidden = !modulosX.length;
    nav.innerHTML = '<button type="button" data-m="tudo" title="Ver tudo">⤢</button>' + modulosX.map((mx, m) => '<button type="button" data-m="' + m + '" title="Módulo ' + (m + 1) + '">' + (m + 1) + '</button>').join('') +
      '<button type="button" data-m="looks" title="Manequim e looks">◐</button>';
  }

  ui.innerHTML = '<p class="es-contagem" id="es-contagem"></p><p class="es-dica" id="es-dica">arraste pra girar · roda ou pinça pra aproximar · toque nas portas, gavetas e peças</p>' +
    '<nav class="es-andares-nav" id="es-andares-nav" aria-label="Ir para um módulo" hidden></nav>' +
    '<div class="es-livro" id="gr-peca"></div><div class="es-livro es-org" id="gr-looks"></div><div class="es-livro es-org" id="gr-org"></div><div class="es-livro es-progresso" id="es-guia"></div>' +
    '<div class="es-bandeja" id="es-bandeja" hidden></div><div class="es-tip" id="es-tip" aria-hidden="true"></div><div class="gr-aviso" id="gr-aviso" role="status"></div>';
  $('es-andares-nav').addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-m]'); if (!b) return;
    if (b.dataset.m === 'tudo') { enquadrar(); marcarSujo(); return; }
    if (b.dataset.m === 'looks') { abrirLooks(); return; }
    const mx = modulosX[+b.dataset.m]; if (!mx) return;
    abrirPorta(+b.dataset.m, true);
    focar(mx.x, ALT / 2, 2.6, 0.04);
  });
  window.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    if (estado.montando) { terminarMontagem(); return; }
    fecharPaineis(); estado.selecionada = null;
  });

  /* ---------- laço: desenha só quando algo muda ---------- */
  let sujo = 4;
  function marcarSujo() { sujo = Math.max(sujo, 3); }
  ['pointermove', 'pointerdown', 'pointerup', 'wheel', 'keydown', 'resize'].forEach((t) => window.addEventListener(t, marcarSujo, { passive: true }));
  window.addEventListener('resize', () => { palco.redimensionar(); enquadrar(); });
  palco.redimensionar();
  sala.aplicar(estado.fundo);
  pintarBarra();
  montar();
  const contagem = () => { const d = distribuir(estado.dados.pecas, estado.dados.movel); $('es-contagem').textContent = estado.dados.pecas.length + ' peças · ' + estado.dados.movel.length + ' módulos' + (d.cesto.length ? ' · ' + d.cesto.length + ' pra lavar' : ''); };
  contagem();
  // abre as portas uma a uma depois de entrar (a primeira coisa que se vê é o móvel fechado)
  if (estado.portasAbertas) { portas.forEach((p) => { p.userData.aberta = 0; p.userData.alvo = 0; p.rotation.y = 0; }); setTimeout(() => todasAsPortas(true), 900); }

  const relogio = new THREE.Clock();
  let ultimaFoto = 0;
  const tmp = new THREE.Vector3();
  function quadro() {
    requestAnimationFrame(quadro);
    const dt = Math.min(0.05, relogio.getDelta());
    let precisa = passoCamera(dt) || sujo > 0;
    const espPorta = espelhos[0] ? espelhos[0].userData.porta : -1;
    let espelhoMexendo = false;
    portas.forEach((p) => {
      const u = p.userData;
      if (u.aberta !== u.alvo) {
        u.aberta += (u.alvo - u.aberta) * (1 - Math.exp(-dt * 5));
        if (Math.abs(u.aberta - u.alvo) < 0.003) u.aberta = u.alvo;
        p.rotation.y = -u.sinal * ANGULO_PORTA * suave3(u.aberta); precisa = true;
        if (p.children[0] && p.children[0].userData.porta === espPorta) { espelhoMexendo = true; if (u.aberta === u.alvo) espelhoSujo = true; }
      }
    });
    gavetas.forEach((g) => {
      const u = g.userData;
      if (u.aberta !== u.alvo) { u.aberta += (u.alvo - u.aberta) * (1 - Math.exp(-dt * 7)); if (Math.abs(u.aberta - u.alvo) < 0.003) u.aberta = u.alvo; g.position.z = 0.36 * u.aberta; precisa = true; }
    });
    pecaObjs.forEach((obj) => {
      const u = obj.userData;
      if (!u.casa) return;
      const fora = u.tirada ? 1 : 0;
      const alvoZ = u.casa.z + (u.pendurada ? 0.34 : 0.08) * fora + (obj === hoverObj && !fora ? 0.03 : 0);
      const alvoY = u.casa.y + (u.pendurada ? 0 : 0.04) * fora;
      const alvoRot = u.casaRot.y + (u.pendurada ? -Math.PI / 2 * fora : 0);
      if (Math.abs(obj.position.z - alvoZ) > 5e-4 || Math.abs(obj.position.y - alvoY) > 5e-4 || Math.abs(obj.rotation.y - alvoRot) > 2e-3) {
        const k = 1 - Math.exp(-dt * 8);
        obj.position.z += (alvoZ - obj.position.z) * k; obj.position.y += (alvoY - obj.position.y) * k; obj.rotation.y += (alvoRot - obj.rotation.y) * k;
        const corpo = obj.children[0];
        if (u.pendurada && corpo && corpo.userData.encaixe) corpo.scale.x += ((fora ? 1 : corpo.userData.encaixe) - corpo.scale.x) * k;
        precisa = true;
      }
    });
    // o reflexo se refaz no máximo a cada 150 ms enquanto a porta dele gira, e uma vez quando ela para
    const agoraMs = performance.now();
    if (precisa && (espelhoSujo || (espelhoMexendo && agoraMs - ultimaFoto > 150))) { fotografarEspelho(); ultimaFoto = agoraMs; }
    if (precisa) { palco.renderizar(dt); if (sujo > 0) sujo--; contagemTalvez(); }
  }
  let ultimaContagem = '';
  function contagemTalvez() { const k = estado.dados.pecas.length + '|' + estado.dados.movel.length; if (k !== ultimaContagem) { ultimaContagem = k; contagem(); } }
  quadro();

  window.__guarda = { estado, cam, palco, get espelhos() { return espelhos; }, get portas() { return portas; }, get gavetas() { return gavetas; }, get pecaObjs() { return pecaObjs; }, tocar, selecionarPeca, abrirLooks, abrirOrg, enquadrar, atual, tmp };
}

iniciar();
