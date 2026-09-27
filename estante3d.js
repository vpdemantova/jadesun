import * as THREE from './vendor/three.module.min.js';
import { EffectComposer } from './vendor/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from './vendor/postprocessing/ShaderPass.js';
import { OutputPass } from './vendor/postprocessing/OutputPass.js';

const P = window.Perfil;
const esc = P.esc;
const $ = (id) => document.getElementById(id);
const movel = matchMedia('(pointer: coarse)').matches || innerWidth < 700;

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* mesma paleta e mesmo hash de lib/livros.mjs — pra "por tema"/"por título" gerarem
   cores estáveis (o mesmo tema sempre vira a mesma cor), não sorteadas a cada render. */
const CORES_PALETA = ['#c9564a', '#4a7fbf', '#3f9e6b', '#c99a2e', '#8a5abf', '#bf5a8a', '#5a8fa8', '#a86b3f'];
function corDeTexto(s) {
  let h = 0;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return CORES_PALETA[h % CORES_PALETA.length];
}

function textoEmCanvas(w, h, desenhar) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  desenhar(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function quebrarLinhas(g, texto, largMax) {
  const palavras = String(texto).split(/\s+/);
  const linhas = [];
  let atual = '';
  for (const p of palavras) {
    const tent = atual ? atual + ' ' + p : p;
    if (g.measureText(tent).width > largMax && atual) { linhas.push(atual); atual = p; }
    else atual = tent;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

function capaTextura(l) {
  return textoEmCanvas(320, 480, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, l.cor);
    grad.addColorStop(1, sombrear(l.cor, -0.28));
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 5;
    g.strokeRect(16, 16, w - 32, h - 32);
    g.fillStyle = '#fff9ec';
    g.textAlign = 'center';
    g.font = '700 30px Georgia, "Newsreader", serif';
    const linhas = quebrarLinhas(g, l.titulo, w - 70).slice(0, 5);
    const y0 = h * 0.36 - (linhas.length - 1) * 18;
    linhas.forEach((ln, i) => g.fillText(ln, w / 2, y0 + i * 36));
    if (l.tituloOriginal) {
      g.font = 'italic 17px Georgia, serif';
      g.fillStyle = 'rgba(255,249,236,.75)';
      quebrarLinhas(g, l.tituloOriginal, w - 90).slice(0, 2).forEach((ln, i) => g.fillText(ln, w / 2, y0 + linhas.length * 36 + 26 + i * 22));
    }
    g.font = 'italic 21px Georgia, serif';
    g.fillStyle = '#fff9ec';
    g.fillText(l.autor || 'autor desconhecido', w / 2, h * 0.86);
  });
}

function lombadaTextura(l) {
  return textoEmCanvas(96, 620, (g, w, h) => {
    g.fillStyle = l.cor; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(0, 0, 8, h); g.fillRect(w - 8, 0, 8, h);
    g.save();
    g.translate(w / 2, h / 2);
    g.rotate(Math.PI / 2);
    g.textAlign = 'center';
    g.fillStyle = '#fff9ec';
    let titulo = l.titulo, fonte = 30;
    g.font = '700 ' + fonte + 'px Georgia, serif';
    const limite = h * 0.82;
    while (g.measureText(titulo).width > limite && fonte > 14) { fonte -= 2; g.font = '700 ' + fonte + 'px Georgia, serif'; }
    while (g.measureText(titulo).width > limite && titulo.length > 4) { titulo = titulo.slice(0, -2) + '…'; }
    g.fillText(titulo, 8, -6);
    g.font = 'italic ' + Math.round(fonte * 0.62) + 'px Georgia, serif';
    g.fillStyle = 'rgba(255,249,236,.8)';
    let autor = l.autor || '';
    while (g.measureText(autor).width > limite && autor.length > 4) autor = autor.slice(0, -2) + '…';
    g.fillText(autor, 8, 26);
    g.restore();
  });
}

function sombrear(hex, qtd) {
  const c = new THREE.Color(hex);
  const h = {}; c.getHSL(h);
  c.setHSL(h.h, h.s, Math.max(0, Math.min(1, h.l + qtd)));
  return '#' + c.getHexString();
}

/* ---------- ambientes: texturas geradas na hora (sem imagem externa, sem licença pra
   checar) — concreto/pedra/madeira repetem no chão e na parede; paisagem é só o fundo. ---------- */
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
      g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        let x = Math.random() * w, y = 0;
        g.beginPath(); g.moveTo(x, y);
        for (let s = 0; s < 8; s++) { x += (Math.random() - 0.5) * 90; y += h / 8; g.lineTo(x, y); }
        g.stroke();
      }
    } else if (tipo === 'pedra') {
      g.fillStyle = '#a89474'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * w, y = Math.random() * h, rw = 30 + Math.random() * 90, rh = 20 + Math.random() * 60;
        g.fillStyle = 'rgba(' + (120 + Math.random() * 40 | 0) + ',' + (100 + Math.random() * 40 | 0) + ',' + (70 + Math.random() * 30 | 0) + ',' + (0.25 + Math.random() * 0.25).toFixed(3) + ')';
        g.beginPath(); g.ellipse(x, y, rw, rh, Math.random() * Math.PI, 0, Math.PI * 2); g.fill();
      }
      g.strokeStyle = 'rgba(60,50,35,.28)'; g.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        g.beginPath(); g.moveTo(Math.random() * w, Math.random() * h);
        g.lineTo(Math.random() * w, Math.random() * h); g.stroke();
      }
    } else if (tipo === 'madeira') {
      g.fillStyle = '#6b4a30'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 26; i++) {
        const y0 = i * (h / 26);
        g.strokeStyle = 'rgba(40,24,12,' + (0.15 + Math.random() * 0.18).toFixed(3) + ')';
        g.lineWidth = 1 + Math.random() * 2;
        let y = y0;
        g.beginPath(); g.moveTo(0, y);
        for (let x = 0; x <= w; x += 24) { y = y0 + Math.sin(x * 0.02 + i) * 6 + (Math.random() - 0.5) * 2; g.lineTo(x, y); }
        g.stroke();
      }
      for (let i = 0; i < 4; i++) {
        const x = Math.random() * w, y = Math.random() * h, r = 10 + Math.random() * 14;
        const grad = g.createRadialGradient(x, y, 1, x, y, r);
        grad.addColorStop(0, 'rgba(30,16,8,.55)'); grad.addColorStop(1, 'rgba(30,16,8,0)');
        g.fillStyle = grad; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
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
    [['#3c3350', 0.58], ['#2a2440', 0.66], ['#1c1830', 0.78]].forEach(([cor, baseY]) => {
      g.fillStyle = cor;
      let x = 0;
      const y0 = h * baseY;
      g.beginPath(); g.moveTo(0, h); g.lineTo(0, y0);
      while (x < w) { x += 60 + Math.random() * 90; g.lineTo(x, y0 - Math.random() * 70); }
      g.lineTo(w, h); g.closePath(); g.fill();
    });
    g.fillStyle = 'rgba(20,16,26,1)'; g.fillRect(0, h * 0.9, w, h * 0.1);
  });
}

const FUNDOS = [['nenhum', 'Sem fundo'], ['concreto', 'Concreto'], ['pedra', 'Pedra'], ['madeira', 'Madeira'], ['paisagem', 'Paisagem']];
const texturasFundo = {};
function texturaDoFundo(tipo) {
  if (!texturasFundo[tipo]) texturasFundo[tipo] = tipo === 'paisagem' ? texturaPaisagem() : texturaTileavel(tipo);
  return texturasFundo[tipo];
}

async function iniciar() {
  const canvas = $('mundo');
  const ui = $('es-ui');
  const carregando = $('es-carregando');
  if (!canvas || !ui) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !movel, powerPreference: 'high-performance' });
  } catch (e) { if (carregando) carregando.textContent = 'Este navegador não desenha WebGL.'; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, movel ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  /* pós-processamento: brilho suave (bloom) + vinheta — passes prontas do Three.js,
     não shader escrito na mão por cima de material existente (lição de outro projeto:
     isso quebra silenciosamente; aqui é tudo pass isolada, fácil de tirar se pesar). */
  const composer = new EffectComposer(renderer);
  const passeBloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.32, 0.7, 0.86);
  const vinhetaShader = {
    uniforms: { tDiffuse: { value: null }, uForca: { value: 0.38 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'uniform sampler2D tDiffuse; uniform float uForca; varying vec2 vUv; void main(){ vec4 cor=texture2D(tDiffuse,vUv); vec2 c=vUv-0.5; float vin=1.0-dot(c,c)*uForca*2.2; gl_FragColor=vec4(cor.rgb*vin, cor.a); }',
  };
  const passeVinheta = new ShaderPass(vinhetaShader);

  const cena = new THREE.Scene();
  cena.background = new THREE.Color(0x241d16);
  cena.fog = new THREE.Fog(0x241d16, 3.6, 11);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.05, 40);

  cena.add(new THREE.AmbientLight(0xfff2df, 0.85));
  const luz = new THREE.DirectionalLight(0xfff2df, 1.15);
  luz.position.set(2.2, 4.5, 3.4);
  cena.add(luz, luz.target);
  const luz2 = new THREE.DirectionalLight(0x8fb0ff, 0.3);
  luz2.position.set(-3, 2, -2);
  cena.add(luz2);

  composer.addPass(new RenderPass(cena, camera));
  composer.addPass(passeBloom);
  composer.addPass(passeVinheta);
  composer.addPass(new OutputPass());

  const r = await fetch('/api/livros').then((res) => (res.ok ? res.json() : null)).catch(() => null);
  let livros = (r && r.livros) || [];
  if (carregando) carregando.hidden = true;
  canvas.closest('.es-palco').classList.add('es-pronto');

  /* ---------- estado ---------- */
  const estado = { modo: 'autor', tags: new Set(), busca: '', segurando: null, arrastou: false, fundo: 'nenhum', mobilia: 'madeira', corModo: 'autor', tamanhoModo: 'aleatorio', ajustesAbertos: false };
  try { estado.mobilia = localStorage.getItem('estante-mobilia') || 'madeira'; } catch (e) { /* segue com o padrão */ }
  try { estado.corModo = localStorage.getItem('estante-cor') || 'autor'; } catch (e) { /* segue com o padrão */ }
  try { estado.tamanhoModo = localStorage.getItem('estante-tamanho') || 'aleatorio'; } catch (e) { /* segue com o padrão */ }
  const MOBILIAS = [['madeira', 'Clássica'], ['cubos', 'Cubos modulares'], ['suspensa', 'Suspensa minimalista']];
  function aplicarMobilia(tipo) {
    estado.mobilia = tipo;
    try { localStorage.setItem('estante-mobilia', tipo); } catch (e) { /* modo privado, sem problema */ }
    montarPrateleira();
  }
  const CORES_MODO = [['autor', 'Por autor (padrão)'], ['categoria', 'Por tema'], ['titulo', 'Por título']];
  const TAMANHOS_MODO = [['aleatorio', 'Variado (padrão)'], ['real', 'Real (pelas páginas)'], ['padronizado', 'Todos iguais']];
  function aplicarAjuste(campo, valor) {
    estado[campo] = valor;
    try { localStorage.setItem('estante-' + (campo === 'corModo' ? 'cor' : 'tamanho'), valor); } catch (e) { /* modo privado, sem problema */ }
    montarPrateleira();
  }

  let TODAS_TAGS = [];
  function recomputarTags() { TODAS_TAGS = [...new Set(livros.flatMap((l) => l.tags))].sort((a, b) => a.localeCompare(b, 'pt')); }
  recomputarTags();

  async function recarregarLivros() {
    const rr = await fetch('/api/livros?fresco=1').then((res) => (res.ok ? res.json() : null)).catch(() => null);
    livros = (rr && rr.livros) || livros;
    recomputarTags();
    pintarBarra();
    montarPrateleira();
  }

  function livrosVisiveis() {
    const q = estado.busca.trim().toLowerCase();
    return livros.filter((l) => {
      if (estado.tags.size && ![...estado.tags].every((t) => l.tags.includes(t))) return false;
      if (q && !(l.titulo + ' ' + l.autor).toLowerCase().includes(q)) return false;
      return true;
    });
  }

  /* ---------- chão e estrutura da estante ---------- */
  const madeira = new THREE.MeshLambertMaterial({ color: 0x5a4632, flatShading: true });
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshLambertMaterial({ color: 0x2a2119 }));
  chao.rotation.x = -Math.PI / 2; chao.position.y = -0.02;
  cena.add(chao);

  /* ---------- móveis: três desenhos reais de estante, pra poder trocar de forma ----------
     "Clássica" é a de sempre (tábua de madeira maciça). "Cubos" evoca o sistema modular
     USM Haller (painéis coloridos num reticulado metálico, um dos móveis mais premiados
     do design industrial). "Suspensa" evoca o Vitsœ 606 de Dieter Rams (tábuas finas
     flutuando em trilhos de alumínio, sem parede lateral nenhuma). Homenagem estilizada,
     não réplica licenciada — dá pra reconhecer a linguagem, não é o produto exato. */
  const METAL_CUBOS = new THREE.MeshLambertMaterial({ color: 0x8f8f8f });
  const CORES_CUBOS = [0xc23b32, 0x1d4f91, 0xf2efe4, 0x1a1a1a];
  const MATS_CUBOS = CORES_CUBOS.map((c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true }));
  const madeiraClara = new THREE.MeshLambertMaterial({ color: 0xcbb896, flatShading: true });
  const ALUMINIO = new THREE.MeshStandardMaterial({ color: 0xd7d7da, metalness: 0.6, roughness: 0.35 });

  function montarTabua(estilo, i, y, largura) {
    if (estilo === 'cubos') {
      const cor = MATS_CUBOS[i % MATS_CUBOS.length];
      const painel = new THREE.Mesh(new THREE.BoxGeometry(largura, 0.03, 0.22), cor);
      painel.position.set(0, y - 0.008, 0.02);
      grupoEstante.add(painel);
      const moldura = new THREE.Mesh(new THREE.BoxGeometry(largura + 0.02, 0.012, 0.02), METAL_CUBOS);
      moldura.position.set(0, y + 0.008, 0.13);
      grupoEstante.add(moldura);
      return;
    }
    if (estilo === 'suspensa') {
      const tabua = new THREE.Mesh(new THREE.BoxGeometry(largura, 0.014, 0.2), madeiraClara);
      tabua.position.set(0, y - 0.004, 0.02);
      grupoEstante.add(tabua);
      return;
    }
    const tabua = new THREE.Mesh(new THREE.BoxGeometry(largura, 0.025, 0.22), madeira);
    tabua.position.set(0, y - 0.008, 0.02);
    grupoEstante.add(tabua);
  }

  function montarLaterais(estilo, altura, largura, linhas, espacoY) {
    const meioX = largura / 2 + 0.06;
    if (estilo === 'cubos') {
      // reticulado metálico: montantes verticais + travessas horizontais, igual um
      // sistema de hastes e conectores — não uma parede sólida.
      [-1, 1].forEach((lado) => {
        const montante = new THREE.Mesh(new THREE.BoxGeometry(0.03, altura + 0.2, 0.03), METAL_CUBOS);
        montante.position.set(lado * meioX, altura / 2, 0.02);
        grupoEstante.add(montante);
        const montante2 = montante.clone(); montante2.position.z = 0.2; grupoEstante.add(montante2);
        for (let i = 0; i <= linhas; i++) {
          const y = 0.34 + i * espacoY - espacoY / 2;
          const travessa = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.2), METAL_CUBOS);
          travessa.position.set(lado * meioX, Math.max(0.05, y), 0.11);
          grupoEstante.add(travessa);
        }
      });
      return;
    }
    if (estilo === 'suspensa') {
      // sem parede: só os trilhos finos de alumínio e um pino em cada andar.
      [-1, 1].forEach((lado) => {
        const trilho = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, altura + 0.2, 12), ALUMINIO);
        trilho.position.set(lado * meioX, altura / 2, 0.02);
        grupoEstante.add(trilho);
        for (let i = 0; i < linhas; i++) {
          const y = 0.34 + i * espacoY;
          const pino = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 10), ALUMINIO);
          pino.rotation.z = Math.PI / 2;
          pino.position.set(lado * meioX, y, 0.02);
          grupoEstante.add(pino);
        }
      });
      return;
    }
    const laterais = new THREE.Mesh(new THREE.BoxGeometry(0.05, altura + 0.2, 0.24), madeira);
    laterais.position.set(-meioX, altura / 2, 0.02);
    grupoEstante.add(laterais.clone().translateX(0));
    const dir = laterais.clone(); dir.position.x = meioX;
    grupoEstante.add(dir);
  }

  /* ---------- ambiente: fundo e chão trocáveis, só pra dar mais prazer de mexer ---------- */
  let paredeFundo = null;
  function aplicarFundo(tipo) {
    estado.fundo = tipo;
    try { localStorage.setItem('estante-fundo', tipo); } catch (e) { /* modo privado, sem problema */ }
    if (paredeFundo) { cena.remove(paredeFundo); paredeFundo.geometry.dispose(); paredeFundo = null; }
    if (tipo === 'nenhum') {
      cena.background = new THREE.Color(0x241d16);
      cena.fog.color.set(0x241d16);
      chao.material.map = null; chao.material.color.set(0x2a2119); chao.material.needsUpdate = true;
      return;
    }
    const tex = texturaDoFundo(tipo);
    if (tipo === 'paisagem') {
      cena.background = tex;
      cena.fog.color.set(0x6a5a68);
      chao.material.map = null; chao.material.color.set(0x342c22); chao.material.needsUpdate = true;
    } else {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(tipo === 'madeira' ? 1.4 : 4, tipo === 'madeira' ? 1.8 : 4);
      const corFundo = { concreto: 0x8d8b84, pedra: 0xa89474, madeira: 0x4a3320 }[tipo];
      cena.background = new THREE.Color(corFundo);
      cena.fog.color.set(corFundo);
      chao.material.map = tex; chao.material.color.set(0xffffff); chao.material.needsUpdate = true;
      paredeFundo = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), new THREE.MeshLambertMaterial({ map: tex }));
      paredeFundo.position.set(0, 3.5, -3.4);
      cena.add(paredeFundo);
    }
  }
  let fundoInicial = 'nenhum';
  try { fundoInicial = localStorage.getItem('estante-fundo') || 'nenhum'; } catch (e) { /* segue com o padrão */ }
  aplicarFundo(fundoInicial);

  const grupoEstante = new THREE.Group();
  cena.add(grupoEstante);
  const corPaginas = new THREE.MeshLambertMaterial({ color: 0xe9decb });

  function criarLivro(l) {
    const s = hash(l.titulo + l.autor);
    let largura, altura, profundidade;
    if (estado.tamanhoModo === 'padronizado') {
      largura = 0.038; altura = 0.245; profundidade = 0.165;
    } else if (estado.tamanhoModo === 'real' && l.paginasTotal > 0) {
      // espessura de verdade: ~140 páginas por cm é uma média razoável de papel de livro comum.
      largura = Math.max(0.016, Math.min(0.11, l.paginasTotal / 140 * 0.01));
      altura = 0.22 + ((s >> 8) % 100) / 100 * 0.05;
      profundidade = 0.15 + ((s >> 16) % 100) / 100 * 0.03;
    } else {
      largura = 0.028 + (s % 100) / 100 * 0.026;
      altura = 0.22 + ((s >> 8) % 100) / 100 * 0.05;
      profundidade = 0.15 + ((s >> 16) % 100) / 100 * 0.03;
    }
    const corEfetiva = estado.corModo === 'categoria' ? corDeTexto(l.tags[0] || 'sem tema')
      : estado.corModo === 'titulo' ? corDeTexto(l.titulo)
      : l.cor;
    const lPintado = corEfetiva === l.cor ? l : { ...l, cor: corEfetiva };
    const matCapa = new THREE.MeshLambertMaterial({ map: capaTextura(lPintado) });
    const matSpine = new THREE.MeshLambertMaterial({ map: lombadaTextura(lPintado) });
    const matPlano = new THREE.MeshLambertMaterial({ color: sombrear(corEfetiva, -0.15) });
    const materiais = [matCapa, matPlano, corPaginas, corPaginas, matSpine, corPaginas];
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(largura, altura, profundidade), materiais);
    mesh.userData.livro = l;
    mesh.userData.largura = largura;
    mesh.userData.altura = altura;
    return mesh;
  }

  const LARG_LINHA = 4.6;
  const DIVISOR_LARG = 0.03;
  const GAP = 0.006;
  let livroMeshes = [];
  let alturaTopo = 1.2;

  const divisorMat = new THREE.MeshLambertMaterial({ color: 0x2c2116, flatShading: true });

  /* "Minha Estante": se o nome da seção começa com um número ("1 · Romances", "2 Espiritualidade"),
     esse número vira o ANDAR de verdade — a prateleira quebra linha ali, sempre, ainda que
     coubesse tudo na mesma (o oposto da regra de todo outro modo). É o dono controlando a
     forma da estante, não o algoritmo economizando espaço. Sem número, cai num andar "solto"
     no fim, empacotado do jeito automático de sempre. */
  function analisarSecao(chave) {
    const m = /^\s*(\d+)\s*[·:.\-]?\s*(.*)$/.exec(chave);
    if (!m || !m[1]) return { andar: null, rotulo: chave };
    return { andar: +m[1], rotulo: m[2] || ('Andar ' + m[1]) };
  }

  function montarPrateleira() {
    grupoEstante.clear();
    livroMeshes = [];
    const visiveis = livrosVisiveis();
    const grupos = new Map();
    for (const l of visiveis) {
      const chave = estado.modo === 'tema' ? (l.tags[0] || 'sem tema')
        : estado.modo === 'status' ? (l.status || 'sem status')
        : estado.modo === 'prioridade' ? (l.prioridade || 'sem prioridade')
        : estado.modo === 'suporte' ? (l.suporte || 'sem suporte definido')
        : estado.modo === 'secaoReal' ? (l.secaoReal || 'ainda sem seção')
        : (l.autor || 'autor desconhecido');
      if (!grupos.has(chave)) grupos.set(chave, []);
      grupos.get(chave).push(l);
    }
    const ehMinhaEstante = estado.modo === 'secaoReal';
    const chaves = [...grupos.keys()].sort((a, b) => {
      if (!ehMinhaEstante) return a.localeCompare(b, 'pt');
      const pa = analisarSecao(a), pb = analisarSecao(b);
      if (pa.andar == null && pb.andar == null) return a.localeCompare(b, 'pt');
      if (pa.andar == null) return 1;
      if (pb.andar == null) return -1;
      return pa.andar - pb.andar || pa.rotulo.localeCompare(pb.rotulo, 'pt');
    });

    // empacota tudo numa sequência só, por ordem de grupo — a prateleira só quebra
    // linha quando o espaço acaba, não a cada grupo novo. É isso que mantém o número
    // de andares proporcional à quantidade de livros, não à quantidade de autores/temas.
    // Exceção: "Minha Estante" com seções numeradas força quebra por andar (item 55).
    const sequencia = [];
    for (const chave of chaves) {
      const itens = grupos.get(chave).slice().sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt'));
      const analise = ehMinhaEstante ? analisarSecao(chave) : null;
      // só grupos com mais de 1 livro ganham legenda — com quase todo autor sendo único
      // no acervo, escrever o nome em cada divisória vira uma sopa de letrinhas ilegível.
      // "Minha Estante" com andar sempre ganha legenda: é o dono nomeando a seção de propósito.
      const ganhaRotulo = ehMinhaEstante ? (analise.andar != null || itens.length > 1) : itens.length > 1;
      const rotulo = ehMinhaEstante ? analise.rotulo : chave;
      const titulos = itens.map((x) => x.titulo);
      itens.forEach((liv, i) => sequencia.push({
        livro: liv, novoGrupo: i === 0, rotulo: ganhaRotulo ? rotulo : '',
        andarForcado: analise ? analise.andar : null, titulos,
      }));
    }

    const linhas = [];
    let linha = null;
    let largAtual = LARG_LINHA + 1; // força a primeira iteração a abrir uma linha
    const marcasDeGrupo = [];
    for (const item of sequencia) {
      const mesh = criarLivro(item.livro);
      const trocaDeAndar = linha && linha.andarForcado !== item.andarForcado && (linha.andarForcado != null || item.andarForcado != null);
      const precisaDivisor = item.novoGrupo && item.rotulo && linha && linha.itens.length && !trocaDeAndar;
      const largComDivisor = mesh.userData.largura + (precisaDivisor ? DIVISOR_LARG + GAP : 0);
      if (!linha || trocaDeAndar || largAtual + largComDivisor > LARG_LINHA) {
        linha = { itens: [], marcas: [], andarForcado: item.andarForcado };
        linhas.push(linha);
        largAtual = 0;
      } else if (precisaDivisor) {
        linha.marcas.push({ x: largAtual, rotulo: item.rotulo, titulos: item.titulos });
        largAtual += DIVISOR_LARG + GAP;
      }
      if (item.novoGrupo && !linha.itens.length) linha.marcas.push({ x: 0, rotulo: item.rotulo, titulos: item.titulos });
      linha.itens.push({ mesh, xEsq: largAtual });
      largAtual += mesh.userData.largura + GAP;
    }

    // cada andar é centrado no próprio conteúdo (não no vão inteiro de 4.6) — assim uma
    // prateleira com poucos livros não fica um cantinho perdido num tabuleiro vazio.
    linhas.forEach((ln) => {
      const ultimo = ln.itens[ln.itens.length - 1];
      ln.largura = ultimo ? ultimo.xEsq + ultimo.mesh.userData.largura : 0;
    });
    const maiorLinha = Math.max(0.9, ...linhas.map((ln) => ln.largura));
    const LARG_TABUA = Math.min(LARG_LINHA + 0.1, maiorLinha + 0.5);

    // legendas têm um tamanho fixo no mundo — se dois grupos rotulados caem perto
    // demais um do outro (comum com vários autores de 2-3 livros lado a lado), os
    // textos se atropelam. Mantém só a primeira de cada aglomerado apertado.
    const SEPARACAO_MIN = 0.62;
    linhas.forEach((ln) => {
      ln.marcas.sort((a, b) => a.x - b.x);
      let ultimoX = -Infinity;
      ln.marcas.forEach((m) => {
        if (!m.rotulo) return;
        if (m.x - ultimoX < SEPARACAO_MIN) { m.rotulo = ''; return; }
        ultimoX = m.x;
      });
    });

    const ESPACO_Y = 0.46;
    alturaTopo = 0.34 + linhas.length * ESPACO_Y;
    linhas.forEach((ln, i) => {
      const y = 0.34 + i * ESPACO_Y;
      const offX = -ln.largura / 2;
      montarTabua(estado.mobilia, i, y, LARG_TABUA);
      ln.itens.forEach(({ mesh, xEsq }) => {
        mesh.position.set(offX + xEsq + mesh.userData.largura / 2, y + mesh.userData.altura / 2, 0);
        mesh.userData.casaPos = mesh.position.clone();
        grupoEstante.add(mesh);
        livroMeshes.push(mesh);
      });
      ln.marcas.forEach(({ x, rotulo, titulos }) => {
        if (!rotulo) return;
        if (x > 0.001) {
          const divisor = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.3, 0.2), divisorMat);
          divisor.position.set(offX + x + DIVISOR_LARG / 2, y + 0.15, 0);
          grupoEstante.add(divisor);
        }
        const placa = new THREE.Sprite(new THREE.SpriteMaterial({ map: textoEmCanvas(360, 80, (g, w, h) => {
          g.fillStyle = '#ffd15d'; g.font = '700 34px "Archivo", sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
          g.fillText(rotulo, 4, h / 2);
        }), transparent: true, depthWrite: false }));
        placa.scale.set(0.62, 0.14, 1);
        placa.position.set(offX + x + 0.32, y - 0.13, 0.12);
        grupoEstante.add(placa);

        // "em cima de cada seção, todos os títulos" — uma lista legível flutuando
        // acima do andar, não só a etiqueta com o nome do grupo. Só faz sentido em
        // "Minha Estante" (poucas seções, escolhidas por ele) — nos outros modos
        // (ex. "por autor", com 40+ grupos de 2 livros) viraria uma parede de caixas
        // de texto competindo umas com as outras, a mesma bagunça de antes.
        if (ehMinhaEstante && titulos && titulos.length) {
          const MOSTRAR = 14;
          const mostrados = titulos.slice(0, MOSTRAR);
          const sobra = titulos.length - mostrados.length;
          const LINHA_PX = 30, PAD_PX = 14, LARG_PX = 460;
          const altPx = PAD_PX * 2 + (mostrados.length + (sobra > 0 ? 1 : 0)) * LINHA_PX;
          const texListaTitulos = textoEmCanvas(LARG_PX, altPx, (g, w, h) => {
            g.fillStyle = 'rgba(18,14,9,.78)'; g.fillRect(0, 0, w, h);
            g.strokeStyle = 'rgba(255,209,93,.4)'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
            g.font = '500 20px "Archivo", sans-serif'; g.textAlign = 'left'; g.textBaseline = 'top';
            mostrados.forEach((t, i) => {
              let texto = t;
              while (g.measureText(texto).width > w - PAD_PX * 2 && texto.length > 4) texto = texto.slice(0, -2) + '…';
              g.fillStyle = '#f4efe1';
              g.fillText(texto, PAD_PX, PAD_PX + i * LINHA_PX);
            });
            if (sobra > 0) { g.fillStyle = '#ffd15d'; g.fillText('+ ' + sobra + ' mais…', PAD_PX, PAD_PX + mostrados.length * LINHA_PX); }
          });
          const escalaMundo = 1.05;
          const largMundo = escalaMundo, altMundo = escalaMundo * (altPx / LARG_PX);
          const listaSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texListaTitulos, transparent: true, depthWrite: false }));
          listaSprite.scale.set(largMundo, altMundo, 1);
          listaSprite.position.set(offX + x + largMundo / 2 - 0.1, y + 0.3 + altMundo / 2, 0.1);
          grupoEstante.add(listaSprite);
        }
      });
    });
    montarLaterais(estado.mobilia, alturaTopo, LARG_TABUA, linhas.length, ESPACO_Y);

    document.getElementById('es-contagem').textContent = visiveis.length + (visiveis.length === 1 ? ' livro' : ' livros') + ' · ' + linhas.length + (linhas.length === 1 ? ' andar' : ' andares');
    camCfg.altoMin = 0.55; camCfg.altoMax = Math.max(0.9, alturaTopo - 0.2);
    const meiaLargAlvo = Math.max(0, maiorLinha / 2 - 0.5);
    camCfg.xMin = -meiaLargAlvo; camCfg.xMax = meiaLargAlvo;
    if (camCfg.altoAlvo < camCfg.altoMin) camCfg.altoAlvo = camCfg.altoMin;
    camCfg.x = Math.max(camCfg.xMin, Math.min(camCfg.xMax, camCfg.x));

    // enquanto a pessoa não arrastou a câmera com a mão, cada nova prateleira (troca de
    // filtro/modo) já nasce enquadrada nela mesma: nada de vão vazio nem livro cortado.
    if (!estado.arrastou) {
      camCfg.x = 0;
      camCfg.altoAlvo = Math.min(camCfg.altoMax, Math.max(camCfg.altoMin, 0.16 + alturaTopo / 2));
      camCfg.dist = Math.max(1.35, 1.05 + linhas.length * 0.45);
    }
  }

  /* ---------- câmera: anda ao longo da estante (lateralidade de verdade) ---------- */
  const camCfg = { x: 0, altoAlvo: 0.9, dist: 1.55, altoMin: 0.5, altoMax: 2, xMin: -1.3, xMax: 1.3 };
  function atualizarCamera() {
    if (camCfg.travado) {
      camera.position.set(camCfg.travado.x, camCfg.travado.y, camCfg.travado.dist);
      camera.lookAt(camCfg.travado.x, camCfg.travado.y, 0);
      return;
    }
    camera.position.set(camCfg.x, camCfg.altoAlvo + 0.1, camCfg.dist);
    camera.lookAt(camCfg.x, camCfg.altoAlvo, 0);
  }

  /* ---------- segurar um livro ---------- */
  const heldAlvo = new THREE.Vector3();
  const heldQuat = new THREE.Quaternion();
  let swingX = 0, swingY = 0, ultimoPX = null, ultimoPY = null;

  function abrirLivro(mesh) {
    if (estado.segurando === mesh) return;
    estado.segurando = mesh;
    pintarPainel(mesh.userData.livro);
    $('es-livro').classList.add('aberto');
  }
  function fecharLivro() {
    estado.segurando = null;
    $('es-livro').classList.remove('aberto');
  }

  /* ---------- status, prioridade, suporte e a sua estante real: toca pra marcar, lápis pra
     renomear a categoria inteira, "+novo" cria uma seção que ainda não existe. ---------- */
  const VALORES_PADRAO = { status: ['quero ler', 'lendo', 'lido'], prioridade: ['alta', 'média', 'baixa'], suporte: ['físico', 'digital'], secaoReal: [] };
  function valoresConhecidos(campo) {
    const vistos = new Set(VALORES_PADRAO[campo]);
    livros.forEach((x) => { if (x[campo]) vistos.add(x[campo]); });
    return [...vistos];
  }
  function corpoDoLivro(l) {
    return {
      tituloAntigo: l.titulo, autorAntigo: l.autor, titulo: l.titulo, tituloOriginal: l.tituloOriginal, autor: l.autor, tags: l.tags,
      status: l.status, destino: l.destino, prioridade: l.prioridade, paginaAtual: l.paginaAtual, paginasTotal: l.paginasTotal, secaoReal: l.secaoReal,
      formato: l.formato, tamanho: l.tamanho, material: l.material, medidas: l.medidas, suporte: l.suporte, tipoScan: l.tipoScan, comercial: l.comercial,
    };
  }
  async function salvarCampoRapido(l, campo, novoValor) {
    const antigo = l[campo];
    l[campo] = novoValor;
    montarPrateleira();
    const novoMesh = livroMeshes.find((m) => m.userData.livro === l);
    if (novoMesh) { estado.segurando = novoMesh; pintarPainel(l); $('es-livro').classList.add('aberto'); }
    try {
      const corpo = corpoDoLivro(l);
      const resp = await fetch('/api/livros/salvar', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify(corpo) });
      if (!resp.ok) throw 0;
    } catch {
      l[campo] = antigo;
      montarPrateleira();
      const meshDeVolta = livroMeshes.find((m) => m.userData.livro === l);
      if (meshDeVolta) { estado.segurando = meshDeVolta; pintarPainel(l); }
    }
  }
  async function renomearCampo(campo, de, para) {
    const livroAntesDoRename = estado.segurando ? estado.segurando.userData.livro : null;
    try {
      await fetch('/api/livros/renomear', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify({ campo, de, para }) });
    } catch { /* segue mesmo assim — recarregarLivros mostra o estado real do arquivo */ }
    await recarregarLivros();
    if (livroAntesDoRename) {
      const novo = livros.find((x) => x.titulo === livroAntesDoRename.titulo && x.autor === livroAntesDoRename.autor);
      const novoMesh = novo && livroMeshes.find((m) => m.userData.livro === novo);
      if (novoMesh) { estado.segurando = novoMesh; pintarPainel(novo); $('es-livro').classList.add('aberto'); }
      else fecharLivro();
    }
  }
  const ROTULO_CAMPO = { status: 'Status', prioridade: 'Prioridade', suporte: 'Físico ou digital', secaoReal: 'Minha estante (seção real)' };
  function chipsCampo(campo, l) {
    const rotulo = ROTULO_CAMPO[campo] || campo;
    const valores = valoresConhecidos(campo);
    return '<div class="es-campo"><p class="es-rot">' + rotulo + '</p><div class="es-chips-campo" data-campo="' + campo + '">' +
      valores.map((v) => (
        '<span class="es-chip-editavel' + (l[campo] === v ? ' on' : '') + '" data-valor="' + esc(v) + '">' +
        '<button type="button" class="es-chip-clicar" data-valor="' + esc(v) + '">' + esc(v) + '</button>' +
        '<button type="button" class="es-chip-lapis" data-valor="' + esc(v) + '" title="Renomear ' + esc(v) + '" aria-label="Renomear ' + esc(v) + '">✎</button>' +
        '</span>'
      )).join('') +
      '<button type="button" class="es-chip-novo" data-campo="' + campo + '">+ novo</button>' +
      '</div></div>';
  }
  function ligarChipsCampo(p, l) {
    p.querySelectorAll('.es-chips-campo').forEach((cx) => {
      const campo = cx.dataset.campo;
      cx.querySelectorAll('.es-chip-clicar').forEach((b) => b.addEventListener('click', () => {
        salvarCampoRapido(l, campo, l[campo] === b.dataset.valor ? '' : b.dataset.valor);
      }));
      cx.querySelectorAll('.es-chip-lapis').forEach((b) => b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const atual = b.dataset.valor;
        const span = b.closest('.es-chip-editavel');
        span.innerHTML = '<input type="text" class="es-chip-input" value="' + esc(atual) + '">';
        const inp = span.querySelector('input'); inp.focus(); inp.select();
        let feito = false;
        const commit = () => {
          if (feito) return; feito = true;
          const novoNome = inp.value.trim();
          if (novoNome && novoNome !== atual) renomearCampo(campo, atual, novoNome);
          else pintarPainel(l);
        };
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { feito = true; pintarPainel(l); } });
        inp.addEventListener('blur', commit);
      }));
      const bNovo = cx.querySelector('.es-chip-novo');
      if (bNovo) bNovo.addEventListener('click', () => {
        const nome = prompt('Nome novo em "' + (ROTULO_CAMPO[campo] || campo) + '":');
        if (nome && nome.trim()) salvarCampoRapido(l, campo, nome.trim());
      });
    });
  }

  /* ---------- progresso de leitura ---------- */
  function progressoHtml(l) {
    const pct = l.paginasTotal > 0 ? Math.max(0, Math.min(100, Math.round((l.paginaAtual || 0) / l.paginasTotal * 100))) : null;
    return '<div class="es-campo"><p class="es-rot">Progresso de leitura</p>' +
      '<div class="es-progresso-linha">' +
      '<input type="number" min="0" id="ep-atual" value="' + (l.paginaAtual || '') + '" placeholder="pág. atual">' +
      '<span>de</span>' +
      '<input type="number" min="0" id="ep-total" value="' + (l.paginasTotal || '') + '" placeholder="total">' +
      '</div>' +
      '<div class="es-progresso-barra"><i style="width:' + (pct || 0) + '%"></i></div>' +
      '<p class="rot suave es-progresso-pct">' + (pct != null ? pct + '% lido' : 'preencha as duas páginas pra calcular a porcentagem') + '</p>' +
      '</div>';
  }
  function ligarProgresso(p, l) {
    const salvar = () => {
      const atual = +p.querySelector('#ep-atual').value || 0;
      const total = +p.querySelector('#ep-total').value || 0;
      if (atual === (l.paginaAtual || 0) && total === (l.paginasTotal || 0)) return;
      l.paginaAtual = atual; l.paginasTotal = total;
      fetch('/api/livros/salvar', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify(corpoDoLivro(l)) }).catch(() => {});
      const bloco = p.querySelector('.es-campo:has(#ep-atual)');
      if (bloco) bloco.outerHTML = progressoHtml(l);
      ligarProgresso(p, l);
      atualizarResumoProgresso();
    };
    const at = p.querySelector('#ep-atual'), to = p.querySelector('#ep-total');
    if (at) at.addEventListener('change', salvar);
    if (to) to.addEventListener('change', salvar);
  }

  function fichaTecnicaHtml(l) {
    const campos = [['Formato', l.formato], ['Físico/digital', l.suporte], ['Tamanho', l.tamanho], ['Medidas', l.medidas], ['Material', l.material], ['Tipo do scan', l.tipoScan], ['Dados comerciais', l.comercial]].filter(([, v]) => v);
    if (!campos.length) return '';
    return '<div class="es-campo"><p class="es-rot">Ficha técnica</p><div class="es-ficha-grade">' +
      campos.map(([rot, v]) => '<div><span>' + esc(rot) + '</span><b>' + esc(v) + '</b></div>').join('') +
      '</div></div>';
  }

  function pintarPainel(l) {
    const p = $('es-livro');
    p.innerHTML = '<button type="button" class="es-x" id="es-fechar" aria-label="Fechar">×</button>' +
      '<h2>' + esc(l.titulo) + '</h2>' +
      (l.tituloOriginal ? '<p class="es-original">' + esc(l.tituloOriginal) + '</p>' : '') +
      '<p class="es-autor">' + esc(l.autor || 'autor desconhecido') + '</p>' +
      (l.atlasId ? '<p class="cx" style="margin:-.6rem 0 1rem"><a href="biblioteca.html#f=' + esc(l.atlasId) + '">Ver ' + esc(l.atlasTitulo) + ' no Atlas →</a></p>' : '') +
      (l.tags.length ? '<div class="es-campo"><p class="es-rot">Tags</p><div class="es-tagslivres">' + l.tags.map((t) => '<span>' + esc(t) + '</span>').join('') + '</div></div>' : '') +
      chipsCampo('status', l) +
      chipsCampo('prioridade', l) +
      chipsCampo('suporte', l) +
      chipsCampo('secaoReal', l) +
      progressoHtml(l) +
      (l.destino ? '<div class="es-campo"><p class="es-rot">Destino</p><p>' + esc(l.destino) + '</p></div>' : '') +
      fichaTecnicaHtml(l) +
      '<button type="button" class="es-editar-lapis" id="es-editar">Editar este livro</button>' +
      '<div class="es-campo" style="margin-top:1rem"><p class="es-rot">Em breve</p><p class="rot suave">Ler, grifar e anotar aqui mesmo, salvando no seu perfil.</p></div>';
    document.getElementById('es-fechar').addEventListener('click', fecharLivro);
    document.getElementById('es-editar').addEventListener('click', () => abrirForm(l));
    ligarChipsCampo(p, l);
    ligarProgresso(p, l);
  }

  /* ---------- progresso de todos: visão geral, um botão na barra ---------- */
  function resumoProgressoHtml() {
    const total = livros.length;
    const contagem = { 'quero ler': 0, lendo: 0, lido: 0, 'sem status': 0 };
    livros.forEach((l) => { contagem[l.status && contagem[l.status] != null ? l.status : 'sem status']++; });
    const lendoComPagina = livros.filter((l) => l.status === 'lendo').sort((a, b) => (b.progresso || 0) - (a.progresso || 0));
    return '<button type="button" class="es-x" id="es-progresso-fechar" aria-label="Fechar">×</button>' +
      '<h2>Progresso da estante</h2>' +
      '<div class="es-resumo-grade">' +
      [['lido', 'Lidos'], ['lendo', 'Lendo'], ['quero ler', 'Quero ler'], ['sem status', 'Sem status']].map(([k, rot]) => (
        '<div class="es-resumo-cel"><b>' + contagem[k] + '</b><span>' + rot + '</span></div>'
      )).join('') +
      '</div>' +
      '<p class="rot suave" style="margin-top:.6rem">' + total + ' livros no total · ' + Math.round(contagem.lido / total * 100) + '% da estante já foi lida</p>' +
      '<p class="rot suave">' + livros.filter((l) => l.atlasId).length + ' de ' + total + ' autores já ligados a uma ficha do Atlas</p>' +
      (lendoComPagina.length ? '<p class="es-rot" style="margin-top:1.1rem">Lendo agora</p>' + lendoComPagina.map((l) => (
        '<div class="es-resumo-livro"><span>' + esc(l.titulo) + '</span>' +
        (l.progresso != null ? '<div class="es-progresso-barra pequena"><i style="width:' + l.progresso + '%"></i></div><b>' + l.progresso + '%</b>' : '<span class="rot suave">sem página marcada</span>') +
        '</div>'
      )).join('') : '');
  }
  function guiaHtml() {
    return '<button type="button" class="es-x" id="es-guia-fechar" aria-label="Fechar">×</button>' +
      '<h2>Como usar a Estante</h2>' +
      '<div class="es-campo"><p class="es-rot">Andar pela estante</p><p>Arraste o dedo/mouse na horizontal pra andar de lado, na vertical pra subir/descer de andar. Roda do mouse (ou pinça no celular) faz zoom. A bolinha embaixo também arrasta. Com um livro na mão, as setas ← → do teclado pulam pro anterior/próximo.</p></div>' +
      '<div class="es-campo"><p class="es-rot">Pegar e ver um livro</p><p>Toque no livro: ele vem até você, com todos os dados. Toque fora, ou Esc, pra guardar de volta.</p></div>' +
      '<div class="es-campo"><p class="es-rot">Adicionar um livro</p><p>Botão "+ Adicionar" na barra de cima. Digite só o título e clique "Buscar dados" — ele procura numa base real e mostra opções; escolha uma pra preencher autor/tags sozinho, ou preencha tudo à mão. "Ficha técnica" (formato, tamanho, material...) fica recolhida, dentro do formulário.</p></div>' +
      '<div class="es-campo"><p class="es-rot">Status, Prioridade, Físico/digital</p><p>Dentro do livro: toque num valor (ex. "lendo") pra marcar; toque de novo pra desmarcar. O lápis ✎ ao lado renomeia aquele valor em <b>todos</b> os livros de uma vez. "+ novo" cria um valor que ainda não existe.</p></div>' +
      '<div class="es-campo"><p class="es-rot">Minha Estante — igual a sua de casa (o jeito rápido)</p><p><b>Não abra livro por livro.</b> Toque numa tag (embaixo, ex. "espiritualidade") pra filtrar só os livros daquele assunto, depois toque no botão azul "Atribuir \'Minha Estante\' a estes N" — ele abre um formulário com dois campos separados: o <b>andar</b> (um número) e o <b>nome da seção</b>. Livros com o mesmo andar dividem a mesma prateleira (ex. andar 1 = Romances + Poesia, lado a lado); andares diferentes nunca dividem espaço. Repita pra cada assunto (uns 5-6 toques organizam a estante inteira). Se nenhuma tag estiver marcada, ele avisa antes de marcar TUDO — leia o aviso.</p></div>' +
      '<div class="es-campo"><p class="es-rot">Minha Estante — livro a livro (o jeito manual)</p><p>Dentro de um livro, o mesmo toque/lápis/"+ novo" de Status/Prioridade também existe pro campo "Minha Estante", pra corrigir um livro específico sem refazer o filtro todo.</p></div>' +
      '<div class="es-campo"><p class="es-rot">Progresso de leitura</p><p>Dentro do livro, preencha página atual e páginas totais — a porcentagem calcula sozinha. O botão "Progresso" na barra mostra o resumo de tudo.</p></div>' +
      '<div class="es-campo"><p class="es-rot">Ambiente e Móvel</p><p>As duas fileiras de botões (Sem fundo/Concreto/Pedra/Madeira/Paisagem e Clássica/Cubos/Suspensa) trocam o cenário e o desenho físico da estante — só visual, não muda os dados.</p></div>' +
      '<div class="es-campo"><p class="es-rot">Buscar e filtrar</p><p>O campo de busca procura por título ou autor. As etiquetas (tags) embaixo filtram por assunto — toque em quantas quiser.</p></div>';
  }
  function ligarGuia() { document.getElementById('es-guia-fechar')?.addEventListener('click', fecharGuia); }
  function abrirGuia() { $('es-guia').innerHTML = guiaHtml(); ligarGuia(); $('es-guia').classList.add('aberto'); }
  function fecharGuia() { $('es-guia').classList.remove('aberto'); }

  function pintarProgresso() {
    const painel = $('es-progresso');
    painel.innerHTML = resumoProgressoHtml();
    document.getElementById('es-progresso-fechar')?.addEventListener('click', fecharProgresso);
  }
  function atualizarResumoProgresso() {
    const painel = $('es-progresso');
    if (painel && painel.classList.contains('aberto')) pintarProgresso();
  }
  function abrirProgresso() {
    pintarProgresso();
    $('es-progresso').classList.add('aberto');
  }
  function fecharProgresso() { $('es-progresso').classList.remove('aberto'); }

  /* ---------- formulário: adicionar ou editar ---------- */
  function abrirForm(livroExistente) {
    const f = $('es-form');
    const l = livroExistente || { titulo: '', tituloOriginal: '', autor: '', tags: [], status: '', destino: '', prioridade: '', paginaAtual: '', paginasTotal: '', formato: '', tamanho: '', material: '', medidas: '', suporte: '', tipoScan: '', comercial: '' };
    f.innerHTML = '<button type="button" class="es-x" id="es-form-fechar" aria-label="Fechar">×</button>' +
      '<h2>' + (livroExistente ? 'Editar livro' : 'Adicionar livro') + '</h2>' +
      '<label class="es-campo-form"><span class="es-rot">Título</span>' +
      '<div class="es-titulo-busca"><input id="ef-titulo" value="' + esc(l.titulo) + '" required placeholder="digite só o título…"><button type="button" id="ef-buscar">Buscar dados</button></div>' +
      '</label>' +
      '<div class="es-resultados" id="ef-resultados" hidden></div>' +
      '<label class="es-campo-form"><span class="es-rot">Título original</span><input id="ef-original" value="' + esc(l.tituloOriginal) + '" placeholder="idioma, ano, tradutor..."></label>' +
      '<label class="es-campo-form"><span class="es-rot">Autor</span><input id="ef-autor" value="' + esc(l.autor) + '" placeholder="Sobrenome, Nome"></label>' +
      '<label class="es-campo-form"><span class="es-rot">Tags</span><input id="ef-tags" value="' + esc(l.tags.join(', ')) + '" placeholder="separadas por vírgula"></label>' +
      '<div class="es-linha2">' +
      '<label class="es-campo-form"><span class="es-rot">Status</span><input id="ef-status" value="' + esc(l.status) + '" placeholder="quero ler / lendo / lido"></label>' +
      '<label class="es-campo-form"><span class="es-rot">Destino</span><input id="ef-destino" value="' + esc(l.destino) + '" placeholder="ficar / doar / vender"></label>' +
      '</div>' +
      '<div class="es-linha2">' +
      '<label class="es-campo-form"><span class="es-rot">Prioridade</span><input id="ef-prioridade" value="' + esc(l.prioridade) + '" placeholder="alta / média / baixa"></label>' +
      '<label class="es-campo-form"><span class="es-rot">Página atual / total</span><span class="es-linha2"><input type="number" min="0" id="ef-pagina" value="' + esc(l.paginaAtual) + '"><input type="number" min="0" id="ef-paginas" value="' + esc(l.paginasTotal) + '"></span></label>' +
      '</div>' +
      '<details class="es-ficha-tecnica"><summary>Ficha técnica — formato, tamanho, material...</summary>' +
      '<div class="es-linha2">' +
      '<label class="es-campo-form"><span class="es-rot">Formato</span><input id="ef-formato" value="' + esc(l.formato) + '" placeholder="capa dura / brochura / e-book"></label>' +
      '<label class="es-campo-form"><span class="es-rot">Físico ou digital</span><input id="ef-suporte" value="' + esc(l.suporte) + '" placeholder="físico / digital"></label>' +
      '</div>' +
      '<div class="es-linha2">' +
      '<label class="es-campo-form"><span class="es-rot">Tamanho</span><input id="ef-tamanho" value="' + esc(l.tamanho) + '" placeholder="A5, bolso, grande..."></label>' +
      '<label class="es-campo-form"><span class="es-rot">Medidas</span><input id="ef-medidas" value="' + esc(l.medidas) + '" placeholder="21 × 14 cm"></label>' +
      '</div>' +
      '<div class="es-linha2">' +
      '<label class="es-campo-form"><span class="es-rot">Material</span><input id="ef-material" value="' + esc(l.material) + '" placeholder="papel, couro..."></label>' +
      '<label class="es-campo-form"><span class="es-rot">Tipo do scan</span><input id="ef-scan" value="' + esc(l.tipoScan) + '" placeholder="se for digitalizado"></label>' +
      '</div>' +
      '<label class="es-campo-form"><span class="es-rot">Dados comerciais</span><input id="ef-comercial" value="' + esc(l.comercial) + '" placeholder="onde comprou, preço, edição..."></label>' +
      '</details>' +
      '<div class="es-botoes-form"><button type="button" class="principal" id="ef-salvar">Salvar</button><button type="button" id="ef-cancelar">Cancelar</button></div>' +
      '<p class="es-msg" id="ef-msg" hidden></p>';
    document.getElementById('es-form-fechar').addEventListener('click', fecharForm);
    document.getElementById('ef-cancelar').addEventListener('click', fecharForm);
    document.getElementById('ef-salvar').addEventListener('click', () => salvarForm(livroExistente));
    document.getElementById('ef-buscar').addEventListener('click', buscarDados);
    if (estado.segurando) fecharLivro();
    f.classList.add('aberto');
  }

  /* digite só o título, busque numa base real (Google Books) e confira antes de aceitar —
     nunca preenche sozinho: só sugere, e só entra no formulário se você clicar "usar". */
  async function buscarDados() {
    const titulo = document.getElementById('ef-titulo').value.trim();
    const caixa = document.getElementById('ef-resultados');
    caixa.hidden = false;
    if (!titulo) { caixa.innerHTML = '<p class="es-msg erro">Digite o título primeiro.</p>'; return; }
    caixa.innerHTML = '<p class="rot suave">Buscando…</p>';
    let r;
    try { r = await fetch('/api/livros/buscar?titulo=' + encodeURIComponent(titulo)).then((x) => x.json()); }
    catch { r = null; }
    if (!r) { caixa.innerHTML = '<p class="es-msg erro">Não consegui buscar agora.</p>'; return; }
    if (r.erro) { caixa.innerHTML = '<p class="es-msg erro">' + esc(r.erro) + '</p>'; return; }
    if (!r.resultados.length) { caixa.innerHTML = '<p class="rot suave">Nada encontrado — preencha à mão mesmo.</p>'; return; }
    caixa.innerHTML = '<p class="es-rot">Achei isto — confira e escolha</p>' + r.resultados.map((rr, i) => (
      '<div class="es-resultado" data-i="' + i + '"><b>' + esc(rr.titulo) + '</b><span>' + esc(rr.autor || 'autor não informado') + (rr.ano ? ' · ' + esc(rr.ano) : '') + '</span>' +
      (rr.tags.length ? '<span class="es-resultado-tags">' + rr.tags.map(esc).join(', ') + '</span>' : '') +
      '<button type="button">Usar estes dados</button></div>'
    )).join('');
    caixa.querySelectorAll('.es-resultado button').forEach((b, i) => b.addEventListener('click', () => {
      const rr = r.resultados[i];
      document.getElementById('ef-titulo').value = rr.titulo;
      if (rr.autor) document.getElementById('ef-autor').value = rr.autor;
      if (rr.tags.length) document.getElementById('ef-tags').value = rr.tags.join(', ');
      caixa.hidden = true; caixa.innerHTML = '';
    }));
  }
  function fecharForm() { $('es-form').classList.remove('aberto'); }

  async function salvarForm(livroExistente) {
    const msg = document.getElementById('ef-msg');
    const titulo = document.getElementById('ef-titulo').value.trim();
    if (!titulo) { msg.hidden = false; msg.className = 'es-msg erro'; msg.textContent = 'O título é obrigatório.'; return; }
    const corpo = {
      tituloAntigo: livroExistente ? livroExistente.titulo : null,
      autorAntigo: livroExistente ? livroExistente.autor : null,
      titulo,
      tituloOriginal: document.getElementById('ef-original').value.trim(),
      autor: document.getElementById('ef-autor').value.trim(),
      tags: document.getElementById('ef-tags').value.split(',').map((t) => t.trim()).filter(Boolean),
      status: document.getElementById('ef-status').value.trim(),
      destino: document.getElementById('ef-destino').value.trim(),
      prioridade: document.getElementById('ef-prioridade').value.trim(),
      paginaAtual: +document.getElementById('ef-pagina').value || 0,
      paginasTotal: +document.getElementById('ef-paginas').value || 0,
      formato: document.getElementById('ef-formato').value.trim(),
      tamanho: document.getElementById('ef-tamanho').value.trim(),
      material: document.getElementById('ef-material').value.trim(),
      medidas: document.getElementById('ef-medidas').value.trim(),
      suporte: document.getElementById('ef-suporte').value.trim(),
      tipoScan: document.getElementById('ef-scan').value.trim(),
      comercial: document.getElementById('ef-comercial').value.trim(),
    };
    msg.hidden = false; msg.className = 'es-msg'; msg.textContent = 'Salvando…';
    try {
      const resp = await fetch('/api/livros/salvar', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify(corpo) });
      const j = await resp.json();
      if (!resp.ok) throw new Error(j.erro || 'Não consegui salvar.');
      msg.className = 'es-msg ok'; msg.textContent = 'Salvo!';
      await recarregarLivros();
      setTimeout(fecharForm, 500);
    } catch (e) {
      msg.className = 'es-msg erro'; msg.textContent = e.message || 'Não consegui salvar.';
    }
  }

  /* ---------- interação de ponteiro ---------- */
  const ray = new THREE.Raycaster();
  let arrastando = false, moveu = false, px0 = 0, py0 = 0;

  function alvoNoPonto(cx, cy) {
    const rct = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((cx - rct.left) / rct.width) * 2 - 1, -((cy - rct.top) / rct.height) * 2 + 1), camera);
    const hit = ray.intersectObjects(livroMeshes, false)[0];
    return hit ? hit.object : null;
  }

  canvas.addEventListener('pointerdown', (ev) => {
    arrastando = true; moveu = false; px0 = ev.clientX; py0 = ev.clientY;
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* toque sintético em teste, ou ponteiro já solto */ }
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (!arrastando) return;
    const dx = ev.clientX - px0, dy = ev.clientY - py0;
    if (Math.abs(dx) + Math.abs(dy) > 4) moveu = true;
    if (estado.segurando) {
      if (ultimoPX != null) { swingY += (ev.clientX - ultimoPX) * 0.0026; swingX += (ev.clientY - ultimoPY) * 0.0022; }
    } else {
      estado.arrastou = true;
      camCfg.x = Math.max(camCfg.xMin, Math.min(camCfg.xMax, camCfg.x - dx * 0.0034));
      camCfg.altoAlvo = Math.max(camCfg.altoMin, Math.min(camCfg.altoMax, camCfg.altoAlvo + dy * 0.0032));
    }
    ultimoPX = ev.clientX; ultimoPY = ev.clientY;
    px0 = ev.clientX; py0 = ev.clientY;
  });
  canvas.addEventListener('pointerup', (ev) => {
    arrastando = false; ultimoPX = null; ultimoPY = null;
    if (!moveu) {
      const alvo = alvoNoPonto(ev.clientX, ev.clientY);
      if (alvo) abrirLivro(alvo);
      else if (estado.segurando) fecharLivro();
    }
  });
  canvas.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    estado.arrastou = true;
    // trackpad/mouse com rolagem horizontal já anda a prateleira de lado (deltaX);
    // rolagem vertical continua sendo o zoom, como sempre foi.
    if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) {
      camCfg.x = Math.max(camCfg.xMin, Math.min(camCfg.xMax, camCfg.x + ev.deltaX * 0.0028));
    } else {
      camCfg.dist = Math.max(1.1, Math.min(4.2, camCfg.dist + ev.deltaY * 0.0015));
    }
  }, { passive: false });
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      if ($('es-form').classList.contains('aberto')) fecharForm();
      else if ($('es-atribuir').classList.contains('aberto')) fecharAtribuir();
      else if ($('es-guia').classList.contains('aberto')) fecharGuia();
      else if ($('es-progresso').classList.contains('aberto')) fecharProgresso();
      else if (estado.segurando) fecharLivro();
      return;
    }
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
      if (!estado.segurando || !livroMeshes.length || $('es-form').classList.contains('aberto')) return;
      ev.preventDefault();
      const iAtual = livroMeshes.indexOf(estado.segurando);
      const passo = ev.key === 'ArrowRight' ? 1 : -1;
      const iProximo = (iAtual + passo + livroMeshes.length) % livroMeshes.length;
      abrirLivro(livroMeshes[iProximo]);
      estado.arrastou = true;
      camCfg.x = Math.max(camCfg.xMin, Math.min(camCfg.xMax, livroMeshes[iProximo].position.x));
    }
  });

  /* ---------- barra de filtros ---------- */
  function pintarBarra() {
    const modos = [['autor', 'Por autor'], ['tema', 'Por tema'], ['status', 'Por status'], ['prioridade', 'Por prioridade'], ['suporte', 'Físico/digital'], ['secaoReal', 'Minha estante']];
    ui.querySelector('.es-barra')?.remove();
    const barra = document.createElement('div');
    barra.className = 'es-barra';
    barra.innerHTML = '<a class="es-voltar" href="eu.html#colecao">← Eu</a>' +
      '<div class="es-titulo"><b>A estante</b><span>' + (estado.modo === 'secaoReal' ? 'filtre por tag e toque em "Atribuir" pra organizar rápido, sem abrir livro por livro' : 'segure, vire, leia os dados · setas: livro seguinte') + '</span></div>' +
      '<div class="es-grupo">' + modos.map((m) => '<button type="button" data-modo="' + m[0] + '" class="' + (estado.modo === m[0] ? 'on' : '') + '">' + m[1] + '</button>').join('') + '</div>' +
      '<input type="search" class="es-busca" id="es-busca" placeholder="Buscar título ou autor" value="' + esc(estado.busca) + '">' +
      '<button type="button" class="es-add" id="es-abrir-add">+ Adicionar</button>' +
      '<button type="button" class="es-add" id="es-abrir-progresso">Progresso</button>' +
      '<button type="button" class="es-add es-ajuda-btn" id="es-abrir-guia" aria-label="Como usar">?</button>' +
      '<button type="button" class="es-add es-ajuda-btn" id="es-abrir-ajustes" aria-label="Ajustes de aparência">⚙</button>' +
      '<div class="es-fundo-cx">' + FUNDOS.map((f) => '<button type="button" class="es-fundo-btn' + (estado.fundo === f[0] ? ' on' : '') + '" data-fundo="' + f[0] + '">' + f[1] + '</button>').join('') + '</div>' +
      '<div class="es-fundo-cx es-movel-cx">' + MOBILIAS.map((m) => '<button type="button" class="es-fundo-btn' + (estado.mobilia === m[0] ? ' on' : '') + '" data-movel="' + m[0] + '">' + m[1] + '</button>').join('') + '</div>' +
      (TODAS_TAGS.length ? '<div class="es-tags-cx"><div class="es-tags">' + TODAS_TAGS.map((t) => '<button type="button" class="es-tag' + (estado.tags.has(t) ? ' on' : '') + '" data-tag="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div></div>' : '') +
      '<button type="button" class="es-add es-atribuir-btn" id="es-atribuir-secao">Atribuir "Minha Estante" a estes ' + livrosVisiveis().length + '</button>' +
      '<div class="es-ajustes-cx' + (estado.ajustesAbertos ? ' aberto' : '') + '" id="es-ajustes-cx">' +
      '<p class="es-rot">Cor dos livros</p><div class="es-grupo es-grupo-ajuste">' + CORES_MODO.map((m) => '<button type="button" data-cor="' + m[0] + '" class="' + (estado.corModo === m[0] ? 'on' : '') + '">' + m[1] + '</button>').join('') + '</div>' +
      '<p class="es-rot">Tamanho dos livros</p><div class="es-grupo es-grupo-ajuste">' + TAMANHOS_MODO.map((m) => '<button type="button" data-tamanho="' + m[0] + '" class="' + (estado.tamanhoModo === m[0] ? 'on' : '') + '">' + m[1] + '</button>').join('') + '</div>' +
      '<p class="rot suave" style="margin-top:.4rem">"Real" só funciona nos livros com páginas totais preenchidas — os outros continuam variados. Combine com qualquer modo de agrupar: uma hora por tema, outra por tamanho, outra por cor.</p>' +
      '</div>';
    ui.insertBefore(barra, ui.firstChild);
    barra.querySelectorAll('[data-modo]').forEach((b) => b.addEventListener('click', () => { estado.modo = b.dataset.modo; pintarBarra(); montarPrateleira(); }));
    barra.querySelectorAll('[data-tag]').forEach((b) => b.addEventListener('click', () => {
      const t = b.dataset.tag;
      if (estado.tags.has(t)) estado.tags.delete(t); else estado.tags.add(t);
      pintarBarra(); montarPrateleira();
    }));
    barra.querySelectorAll('[data-fundo]').forEach((b) => b.addEventListener('click', () => { aplicarFundo(b.dataset.fundo); pintarBarra(); }));
    barra.querySelectorAll('[data-movel]').forEach((b) => b.addEventListener('click', () => { aplicarMobilia(b.dataset.movel); pintarBarra(); }));
    barra.querySelector('#es-busca').addEventListener('input', (ev) => {
      estado.busca = ev.target.value; montarPrateleira();
      const btn = barra.querySelector('#es-atribuir-secao');
      if (btn) btn.textContent = 'Atribuir "Minha Estante" a estes ' + livrosVisiveis().length;
    });
    barra.querySelector('#es-abrir-add').addEventListener('click', () => abrirForm(null));
    barra.querySelector('#es-abrir-progresso').addEventListener('click', abrirProgresso);
    barra.querySelector('#es-abrir-guia').addEventListener('click', abrirGuia);
    barra.querySelector('#es-atribuir-secao').addEventListener('click', abrirAtribuir);
    barra.querySelector('#es-abrir-ajustes').addEventListener('click', () => { estado.ajustesAbertos = !estado.ajustesAbertos; pintarBarra(); });
    barra.querySelectorAll('[data-cor]').forEach((b) => b.addEventListener('click', () => { estado.ajustesAbertos = true; aplicarAjuste('corModo', b.dataset.cor); pintarBarra(); }));
    barra.querySelectorAll('[data-tamanho]').forEach((b) => b.addEventListener('click', () => { estado.ajustesAbertos = true; aplicarAjuste('tamanhoModo', b.dataset.tamanho); pintarBarra(); }));
  }

  /* atalho pra não precisar abrir livro por livro: filtra por busca/tag (ex. a tag
     "romance"), toca aqui, e todo mundo que está aparecendo na tela agora ganha a
     mesma seção da "Minha Estante" de uma vez — é assim que 82 livros viram uma
     estante organizada em minutos, não em uma tarde tocando livro a livro.
     O andar é um campo separado, sempre — nunca depende de lembrar de digitar um
     número na frente do nome (isso confundiu na primeira versão). */
  function abrirAtribuir() {
    const visiveis = livrosVisiveis();
    const semFiltro = visiveis.length === livros.length;
    const p = $('es-atribuir');
    p.innerHTML = '<button type="button" class="es-x" id="es-atribuir-fechar" aria-label="Fechar">×</button>' +
      '<h2>Atribuir "Minha Estante" em massa</h2>' +
      (semFiltro
        ? '<p class="es-msg erro"><b>Nenhum filtro ativo — isto vai marcar a ESTANTE INTEIRA</b> (' + visiveis.length + ' livros). Se você queria só uma parte, feche isto e toque numa tag (embaixo, na barra) antes.</p>'
        : '<p class="rot suave">Vai marcar exatamente os <b>' + visiveis.length + ' livros</b> que estão filtrados agora' + (estado.tags.size ? ' (tag: ' + [...estado.tags].join(', ') + ')' : '') + (estado.busca ? ' (busca: "' + esc(estado.busca) + '")' : '') + '.</p>') +
      '<label class="es-campo-form"><span class="es-rot">Andar (número — livros com o mesmo andar dividem a mesma prateleira)</span><input type="number" min="1" id="ea-andar" placeholder="1"></label>' +
      '<label class="es-campo-form"><span class="es-rot">Nome da seção</span><input id="ea-nome" placeholder="ex. Romances"></label>' +
      '<p class="rot suave" id="ea-preview">Vai gravar como: <b>—</b></p>' +
      '<div class="es-botoes-form"><button type="button" class="principal" id="ea-confirmar">Atribuir aos ' + visiveis.length + '</button><button type="button" id="ea-cancelar">Cancelar</button></div>' +
      '<p class="es-msg" id="ea-msg" hidden></p>';
    const atualizarPreview = () => {
      const andar = document.getElementById('ea-andar').value.trim();
      const nome = document.getElementById('ea-nome').value.trim();
      document.getElementById('ea-preview').innerHTML = 'Vai gravar como: <b>' + esc((andar ? andar + ' ' : '') + nome || '—') + '</b>' + (andar ? '' : ' <span class="es-msg erro" style="display:inline">(sem andar — fica solto, não vira prateleira própria)</span>');
    };
    document.getElementById('ea-andar').addEventListener('input', atualizarPreview);
    document.getElementById('ea-nome').addEventListener('input', atualizarPreview);
    document.getElementById('es-atribuir-fechar').addEventListener('click', fecharAtribuir);
    document.getElementById('ea-cancelar').addEventListener('click', fecharAtribuir);
    document.getElementById('ea-confirmar').addEventListener('click', () => confirmarAtribuir(visiveis));
    p.classList.add('aberto');
  }
  function fecharAtribuir() { $('es-atribuir').classList.remove('aberto'); }
  async function confirmarAtribuir(visiveis) {
    const andar = document.getElementById('ea-andar').value.trim();
    const nome = document.getElementById('ea-nome').value.trim();
    const msg = document.getElementById('ea-msg');
    if (!nome) { msg.hidden = false; msg.className = 'es-msg erro'; msg.textContent = 'Digite o nome da seção.'; return; }
    const valor = (andar ? andar + ' ' : '') + nome;
    const itens = visiveis.map((l) => ({ titulo: l.titulo, autor: l.autor }));
    msg.hidden = false; msg.className = 'es-msg'; msg.textContent = 'Gravando…';
    try {
      const resp = await fetch('/api/livros/atribuir-secao', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' },
        body: JSON.stringify({ itens, secaoReal: valor }),
      });
      const j = await resp.json();
      if (!resp.ok) throw new Error(j.erro || 'Não consegui atribuir.');
      await recarregarLivros();
      msg.className = 'es-msg ok'; msg.textContent = j.alterados + ' livro(s) marcados!';
      setTimeout(fecharAtribuir, 700);
    } catch (e) {
      msg.className = 'es-msg erro'; msg.textContent = e.message || 'Não consegui atribuir agora.';
    }
  }

  ui.innerHTML = '<p class="es-contagem" id="es-contagem"></p><p class="es-dica" id="es-dica">arraste: anda de lado / sobe e desce · roda: zoom · clique: pega</p>' +
    '<div class="es-rolo" id="es-rolo" hidden><div class="es-rolo-trilho"></div><div class="es-rolo-bola" id="es-rolo-bola"></div></div>' +
    '<div class="es-livro" id="es-livro"></div><div class="es-form" id="es-form"></div><div class="es-livro es-progresso" id="es-progresso"></div><div class="es-livro es-progresso" id="es-guia"></div><div class="es-form" id="es-atribuir"></div>';
  pintarBarra();
  montarPrateleira();

  /* ---------- rolo horizontal: um jeito óbvio de "rolar" a prateleira inteira,
     pra quem não descobre de cara que dá pra arrastar dentro do 3D ---------- */
  const rolo = $('es-rolo'), rolobola = $('es-rolo-bola');
  function sincronizarRolo() {
    const alcance = camCfg.xMax - camCfg.xMin;
    if (alcance < 0.05) { rolo.hidden = true; return; }
    rolo.hidden = false;
    const t = Math.max(0, Math.min(1, (camCfg.x - camCfg.xMin) / alcance));
    rolobola.style.left = (t * 100) + '%';
  }
  let arrastandoRolo = false;
  rolo.addEventListener('pointerdown', (ev) => {
    arrastandoRolo = true;
    try { rolo.setPointerCapture(ev.pointerId); } catch (e) { /* toque sintético em teste */ }
    moverRolo(ev.clientX);
  });
  rolo.addEventListener('pointermove', (ev) => { if (arrastandoRolo) moverRolo(ev.clientX); });
  rolo.addEventListener('pointerup', () => { arrastandoRolo = false; });
  rolo.addEventListener('pointercancel', () => { arrastandoRolo = false; });
  function moverRolo(clientX) {
    estado.arrastou = true;
    const rct = rolo.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (clientX - rct.left) / rct.width));
    camCfg.x = camCfg.xMin + t * (camCfg.xMax - camCfg.xMin);
  }
  window.__estante = {
    camCfg, grupoEstante, camera,
    get livroMeshes() { return livroMeshes; },
    olharPara(i, dist) {
      const l = livroMeshes[i];
      camCfg.travado = { x: l.position.x, y: l.position.y, dist: dist || 0.3 };
    },
  };

  /* ---------- redimensionar ---------- */
  function redimensionar() {
    const r2 = canvas.getBoundingClientRect();
    camera.aspect = r2.width / Math.max(1, r2.height);
    camera.updateProjectionMatrix();
    renderer.setSize(r2.width, r2.height, false);
    composer.setSize(r2.width, r2.height);
    passeBloom.setSize(r2.width, r2.height);
  }
  window.addEventListener('resize', redimensionar);
  redimensionar();

  /* ---------- laço de render ---------- */
  const relogio = new THREE.Clock();
  function quadro() {
    requestAnimationFrame(quadro);
    const dt = Math.min(0.05, relogio.getDelta());
    atualizarCamera();
    sincronizarRolo();
    grupoEstante.children.forEach((obj) => {
      if (!obj.userData.livro) return;
      if (obj === estado.segurando) {
        const dirCam = new THREE.Vector3(); camera.getWorldDirection(dirCam);
        // no celular o painel sobe do fundo cobrindo boa parte da tela — o livro segurado
        // precisa ficar menor e mais alto, cabendo inteiro na faixa que sobra em cima dele.
        const distSegurar = movel ? 1.3 : 0.62;
        const alturaTela = movel ? 0.2 : -0.08;
        heldAlvo.copy(camera.position).addScaledVector(dirCam, distSegurar).add(new THREE.Vector3(0, alturaTela, 0));
        obj.position.lerp(heldAlvo, Math.min(1, dt * 9));
        const euler = new THREE.Euler(swingX * 0.5, -Math.PI / 2 + swingY * 0.6, 0, 'YXZ');
        heldQuat.setFromEuler(euler);
        obj.quaternion.slerp(heldQuat, Math.min(1, dt * 10));
        swingX *= Math.max(0, 1 - dt * 4); swingY *= Math.max(0, 1 - dt * 4);
      } else if (obj.userData.casaPos) {
        obj.position.lerp(obj.userData.casaPos, Math.min(1, dt * 8));
        const alvoQuat = new THREE.Quaternion();
        obj.quaternion.slerp(alvoQuat, Math.min(1, dt * 8));
      }
    });
    composer.render();
  }
  quadro();
}

iniciar();
