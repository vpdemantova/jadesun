import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/geometries/RoundedBoxGeometry.js';
import { criarPalco, criarSala, criarCameraSuave, criarPlanta, texturaMadeira, texturaPaginas, textoEmCanvas, hash, movel, AMBIENTES, caixaLocal } from './cena3d.js';
import { distribuir, mapaDeTags, lugarDoLivro, contarTags, livrosDaLista, listasConhecidas, chaveDe, parDe, limparTag, limparLista, norm } from './estante-modelo.js';
import { criarOrganizador, criarBandeja } from './estante-org.js';

const P = window.Perfil;
const esc = P.esc;
/* embutida na casa, a estante procura os seus elementos só dentro do contêiner dela
   (a casa e o guarda-roupa têm elementos com os mesmos ids) */
let raizUI = null;
const $ = (id) => (raizUI ? raizUI.querySelector('#' + id) : document.getElementById(id));

/* mesma paleta e mesmo hash de lib/livros.mjs — pra "por tema"/"por título" gerarem
   cores estáveis (o mesmo tema sempre vira a mesma cor), não sorteadas a cada render. */
const CORES_PALETA = ['#c9564a', '#4a7fbf', '#3f9e6b', '#c99a2e', '#8a5abf', '#bf5a8a', '#5a8fa8', '#a86b3f'];
/* as mesmas oito cores, traduzidas pra tons de encadernação de verdade (tecido e couro):
   vinho, marinho, verde-floresta, ocre, ameixa, rosa-antigo, ardósia, couro */
const PALETA_ENCADERNACAO = ['#8a3a31', '#2d4768', '#34594a', '#b3863a', '#4c4262', '#8e5a4c', '#4b6a76', '#7b5436'];
function corDeTexto(s) {
  let h = 0;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return CORES_PALETA[h % CORES_PALETA.length];
}
function corDeEncadernacao(cor, semente) {
  const i = CORES_PALETA.indexOf(String(cor).toLowerCase());
  const base = new THREE.Color(i >= 0 ? PALETA_ENCADERNACAO[i] : cor);
  const hsl = {}; base.getHSL(hsl);
  const variacao = ((semente % 100) / 100 - 0.5) * 0.12;
  base.setHSL(hsl.h + variacao * 0.08, Math.min(1, hsl.s * (0.9 + (semente % 7) / 30)), Math.max(0.12, Math.min(0.72, hsl.l + variacao)));
  return '#' + base.getHexString();
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

function sombrear(hex, qtd) {
  const c = new THREE.Color(hex);
  const h = {}; c.getHSL(h);
  c.setHSL(h.h, h.s, Math.max(0, Math.min(1, h.l + qtd)));
  return '#' + c.getHexString();
}

const SERIFA = '"Newsreader", Georgia, serif';
const SANS = '"Archivo", "Helvetica Neue", Arial, sans-serif';

/* trama de tecido de encadernação por cima da cor lisa */
function trama(g, w, h, forca = 0.07) {
  for (let y = 0; y < h; y += 2) { g.fillStyle = 'rgba(0,0,0,' + (forca * (0.4 + ((y * 7) % 5) / 8)).toFixed(3) + ')'; g.fillRect(0, y, w, 1); }
  for (let x = 0; x < w; x += 3) { g.fillStyle = 'rgba(255,255,255,' + (forca * 0.35).toFixed(3) + ')'; g.fillRect(x, 0, 1, h); }
}
const estiloDe = (l) => hash(l.titulo + '|' + l.autor) % 4;

function capaTextura(l) {
  const estilo = estiloDe(l);
  return textoEmCanvas(360, 540, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, sombrear(l.cor, 0.04));
    grad.addColorStop(1, sombrear(l.cor, -0.1));
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    trama(g, w, h, 0.06);
    const ouro = '#e2c27a';
    const clara = estilo === 1 ? '#2a2117' : '#f5ecd8';
    if (estilo === 0) { g.strokeStyle = ouro; g.lineWidth = 2; g.strokeRect(22, 22, w - 44, h - 44); g.strokeRect(30, 30, w - 60, h - 60); }
    if (estilo === 1) { g.fillStyle = '#efe5cf'; g.fillRect(40, h * 0.22, w - 80, h * 0.4); g.strokeStyle = 'rgba(0,0,0,.25)'; g.strokeRect(46, h * 0.22 + 6, w - 92, h * 0.4 - 12); }
    if (estilo === 3) { g.fillStyle = sombrear(l.cor, -0.22); g.fillRect(0, h * 0.62, w, h * 0.16); }
    g.fillStyle = estilo === 0 ? ouro : clara;
    g.textAlign = 'center';
    g.font = (estilo === 2 ? '700 28px ' + SANS : '600 32px ' + SERIFA);
    const titulo = estilo === 2 ? l.titulo.toUpperCase() : l.titulo;
    const linhas = quebrarLinhas(g, titulo, w - 96).slice(0, 5);
    const y0 = h * (estilo === 1 ? 0.34 : 0.36) - (linhas.length - 1) * 19;
    linhas.forEach((ln, i) => g.fillText(ln, w / 2, y0 + i * 38));
    if (l.tituloOriginal) {
      g.font = 'italic 17px ' + SERIFA;
      g.globalAlpha = 0.75;
      quebrarLinhas(g, l.tituloOriginal, w - 110).slice(0, 2).forEach((ln, i) => g.fillText(ln, w / 2, y0 + linhas.length * 38 + 22 + i * 22));
      g.globalAlpha = 1;
    }
    g.fillStyle = estilo === 0 ? ouro : '#f5ecd8';
    g.font = (estilo === 2 ? '500 18px ' + SANS : 'italic 22px ' + SERIFA);
    g.fillText(l.autor || 'autor desconhecido', w / 2, h * (estilo === 3 ? 0.715 : 0.86));
  });
}

function lombadaTextura(l) {
  const estilo = estiloDe(l);
  return textoEmCanvas(128, 800, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, sombrear(l.cor, -0.1));
    grad.addColorStop(0.35, sombrear(l.cor, 0.05));
    grad.addColorStop(1, sombrear(l.cor, -0.14));
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    trama(g, w, h, 0.07);
    const ouro = '#e2c27a';
    if (estilo === 0) {
      g.fillStyle = ouro;
      [44, 52, h - 56, h - 48].forEach((y) => g.fillRect(10, y, w - 20, 3));
    } else if (estilo === 1) {
      // etiqueta de biblioteca embaixo, com as três primeiras letras do sobrenome (como a cota de uma biblioteca)
      g.fillStyle = '#efe5cf'; g.fillRect(16, 632, w - 32, 96);
      g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 2; g.strokeRect(21, 637, w - 42, 86);
      const cota = (l.autor || l.titulo).split(',')[0].replace(/[^A-Za-zÀ-ú]/g, '').slice(0, 3).toUpperCase();
      g.fillStyle = '#2a2117'; g.font = '700 30px ' + SANS; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(cota, w / 2, 681);
    } else if (estilo === 3) {
      g.fillStyle = sombrear(l.cor, -0.25); g.fillRect(0, 590, w, 140);
      g.fillStyle = ouro; g.fillRect(0, 590, w, 3); g.fillRect(0, 727, w, 3);
    }
    g.save();
    g.translate(w / 2, h / 2);
    g.rotate(Math.PI / 2);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const corTitulo = estilo === 0 ? ouro : '#f5ecd8';
    const limite = 470;
    let titulo = estilo === 2 ? l.titulo.toUpperCase() : l.titulo;
    let fonte = 44;
    const fam = estilo === 2 ? SANS : SERIFA;
    const peso = estilo === 2 ? '700 ' : '600 ';
    g.font = peso + fonte + 'px ' + fam;
    while (g.measureText(titulo).width > limite && fonte > 22) { fonte -= 2; g.font = peso + fonte + 'px ' + fam; }
    while (g.measureText(titulo).width > limite && titulo.length > 4) titulo = titulo.slice(0, -2) + '…';
    g.fillStyle = corTitulo;
    const deslocTitulo = -80;
    g.fillText(titulo, deslocTitulo, -2);
    let autor = estilo === 1 ? '' : (l.autor || '').split(',')[0];
    g.font = (estilo === 2 ? '500 ' : 'italic 500 ') + Math.round(Math.min(fonte * 0.62, 26)) + 'px ' + fam;
    g.fillStyle = estilo === 0 ? ouro : '#f5ecd8';
    g.globalAlpha = 0.9;
    while (g.measureText(autor).width > 120 && autor.length > 4) autor = autor.slice(0, -2) + '…';
    g.fillText(autor, 255, 0);
    g.globalAlpha = 1;
    g.restore();
  });
}

/* montarEstante(ctx): sozinha (estante.html?sozinha=1) cria o próprio palco, sala e laço;
   embutida na casa (ctx.palco), desenha dentro de ctx.raiz, põe a interface em ctx.ui, só
   ouve mouse e teclado quando a área está ativa (ctx.ouvir) e deixa o laço com a casa. */
export async function montarEstante(ctx = {}) {
  const embutida = !!ctx.palco;
  if (embutida) raizUI = ctx.ui;
  const canvas = ctx.canvas || $('mundo');
  const ui = ctx.ui || $('es-ui');
  const carregando = embutida ? null : $('es-carregando');
  if (!canvas || !ui) return null;
  const ouvir = ctx.ouvir || ((alvo, tipo, fn, op) => alvo.addEventListener(tipo, fn, op));

  let palco = ctx.palco;
  if (!palco) {
    try { palco = criarPalco(canvas); } catch (e) { if (carregando) carregando.textContent = 'Este navegador não desenha WebGL.'; return null; }
  }
  // embutida, quem cuida do sol é a casa (a sombra dela não pode pular pra cá)
  const ajustarSombra = (...a) => { if (!embutida) palco.ajustarSombra(...a); };
  const { cena, camera } = palco;
  // as lombadas são desenhadas com as fontes da página: espera elas carregarem (no máximo 2,5 s)
  try {
    await Promise.race([
      Promise.all(['600 40px "Newsreader"', 'italic 500 20px "Newsreader"', '700 30px "Archivo"', '500 20px "Archivo"'].map((f) => document.fonts.load(f))),
      new Promise((ok) => setTimeout(ok, 2500)),
    ]);
  } catch (e) { /* segue com a fonte reserva */ }

  const r = await fetch('/api/livros').then((res) => (res.ok ? res.json() : null)).catch(() => null);
  let livros = (r && r.livros) || [];
  const rl = await fetch('/api/estante/layout').then((res) => (res.ok ? res.json() : null)).catch(() => null);
  if (carregando) carregando.hidden = true;
  if (!embutida) canvas.closest('.es-palco').classList.add('es-pronto');

  /* ---------- estado ---------- */
  const layoutInicialDoArquivo = { andares: (rl && rl.andares) || [], listas: (rl && rl.listas) || [], existe: !!(rl && rl.existe) };
  const estado = {
    modo: 'secaoReal', tags: new Set(), busca: '', segurando: null, arrastou: false, fundo: 'estudio', mobilia: 'madeira', corModo: 'autor', tamanhoModo: 'aleatorio', titulosModo: 'ocultos', ajustesAbertos: false,
    layout: layoutInicialDoArquivo, selecionando: false, selecao: new Set(), listaFiltro: null, vaoFoco: null, filtroAberto: false,
  };
  try { estado.mobilia = localStorage.getItem('estante-movel') || 'carvalho'; } catch (e) { /* segue com o padrão */ }
  try { estado.corModo = localStorage.getItem('estante-cor') || 'autor'; } catch (e) { /* segue com o padrão */ }
  try { estado.tamanhoModo = localStorage.getItem('estante-tamanho') || 'aleatorio'; } catch (e) { /* segue com o padrão */ }
  try { estado.titulosModo = localStorage.getItem('estante-titulos') || 'ocultos'; } catch (e) { /* segue com o padrão */ }
  const MOBILIAS = [['carvalho', 'Carvalho claro'], ['madeira', 'Nogueira clássica'], ['cubos', 'Cubos modulares'], ['suspensa', 'Suspensa minimalista']];
  if (!MOBILIAS.some((m) => m[0] === estado.mobilia)) estado.mobilia = 'carvalho';
  function aplicarMobilia(tipo) {
    estado.mobilia = tipo;
    try { localStorage.setItem('estante-movel', tipo); } catch (e) { /* modo privado, sem problema */ }
    montarPrateleira();
  }
  const CORES_MODO = [['autor', 'Por autor (padrão)'], ['categoria', 'Por tema'], ['titulo', 'Por título']];
  const TAMANHOS_MODO = [['aleatorio', 'Variado (padrão)'], ['real', 'Real (pelas páginas)'], ['padronizado', 'Todos iguais']];
  const TITULOS_MODO = [['ocultos', 'Ocultos nos cartões (padrão)'], ['mostrar', 'Mostrar nos cartões']];
  const CHAVE_LOCAL = { corModo: 'cor', tamanhoModo: 'tamanho', titulosModo: 'titulos' };
  function aplicarAjuste(campo, valor) {
    estado[campo] = valor;
    try { localStorage.setItem('estante-' + CHAVE_LOCAL[campo], valor); } catch (e) { /* modo privado, sem problema */ }
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
    if (org && org.aberto()) org.pintar();
    bandeja.pintar();
  }

  function livrosVisiveis() {
    const q = estado.busca.trim().toLowerCase();
    return livros.filter((l) => {
      if (estado.listaFiltro && !(l.listas || []).some((x) => x.nome === estado.listaFiltro)) return false;
      if (estado.tags.size && ![...estado.tags].every((t) => l.tags.includes(t))) return false;
      if (q && !(l.titulo + ' ' + l.autor).toLowerCase().includes(q)) return false;
      return true;
    });
  }

  /* ---------- móveis: três desenhos reais de estante, pra poder trocar de forma ----------
     "Clássica" é madeira maciça (nogueira), com costas, rodapé e laterais. "Cubos" evoca o
     sistema modular USM Haller (painéis laqueados num reticulado cromado). "Suspensa" evoca o
     Vitsœ 606 de Dieter Rams (tábuas finas de carvalho em trilhos de alumínio presos à parede).
     Homenagem estilizada, não réplica licenciada. */
  const { pbr } = palco;
  const MAT = {
    tabua: pbr({ ...texturaMadeira('nogueira'), color: 0xffffff, roughness: 1, bumpScale: 0.45 }),
    lateral: pbr({ ...texturaMadeira('nogueira', true), color: 0xffffff, roughness: 1, bumpScale: 0.45 }),
    costas: pbr({ ...repetido(texturaMadeira('nogueira', true), 3, 4), color: 0xb9ab9c, roughness: 1, bumpScale: 0.2 }),
    carvalho: pbr({ ...texturaMadeira('carvalho'), color: 0xffffff, roughness: 1, bumpScale: 0.35 }),
    carvalhoV: pbr({ ...texturaMadeira('carvalho', true), color: 0xffffff, roughness: 1, bumpScale: 0.35 }),
    aluminio: pbr({ color: 0xd8d9dc, metalness: 1, roughness: 0.3 }),
    cromo: pbr({ color: 0xeeeeee, metalness: 1, roughness: 0.16 }),
    latao: pbr({ color: 0xc9a45c, metalness: 1, roughness: 0.3 }),
  };
  /* o fundo do móvel é um painel grande: repete o veio em vez de esticar (esticado vira mancha) */
  function repetido(texs, rx, ry) {
    const o = {};
    ['map', 'bumpMap', 'roughnessMap'].forEach((k) => { const c = texs[k].clone(); c.repeat.set(rx, ry); c.needsUpdate = true; o[k] = c; });
    return o;
  }
  const MAT_CARVALHO = {
    tabua: pbr({ ...texturaMadeira('carvalho'), color: 0xffffff, roughness: 1, bumpScale: 0.35 }),
    lateral: pbr({ ...texturaMadeira('carvalho', true), color: 0xffffff, roughness: 1, bumpScale: 0.35 }),
    costas: pbr({ ...repetido(texturaMadeira('carvalho', true), 3, 4), color: 0xeee4d4, roughness: 1, bumpScale: 0.2 }),
  };
  const madeiraDe = (estilo) => (estilo === 'carvalho' ? MAT_CARVALHO : MAT);
  const MAT_APARADOR = pbr({ color: 0x1d1d1f, metalness: 0.6, roughness: 0.45 });
  const MATS_CUBOS = [0xb8352c, 0x1f4f8f, 0xf1ede3, 0x262626].map((c) => pbr({ color: c, roughness: 0.3, metalness: 0 }));

  function peca(geo, mat, x, y, z, sombra = true) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = sombra; m.receiveShadow = true;
    grupoEstante.add(m);
    return m;
  }

  function montarTabua(estilo, i, y, largura) {
    if (estilo === 'cubos') {
      peca(new RoundedBoxGeometry(largura, 0.03, 0.24, 1, 0.004), MATS_CUBOS[i % MATS_CUBOS.length], 0, y - 0.015, 0.02);
      const tubo = peca(new THREE.CylinderGeometry(0.0065, 0.0065, largura + 0.02, 14), MAT.cromo, 0, y - 0.015, 0.145);
      tubo.rotation.z = Math.PI / 2;
      return;
    }
    if (estilo === 'suspensa') {
      peca(new RoundedBoxGeometry(largura, 0.018, 0.23, 1, 0.003), MAT.carvalho, 0, y - 0.009, 0.015);
      return;
    }
    peca(new RoundedBoxGeometry(largura, 0.03, 0.26, 1, 0.005), madeiraDe(estilo).tabua, 0, y - 0.015, 0.02);
  }

  function montarLaterais(estilo, altura, largura, ys) {
    if (estilo === 'cubos') {
      // reticulado cromado: montantes verticais + travessas em cada divisa entre andares
      const meioX = largura / 2 + 0.035;
      const cortes = [ys[0] - 0.015, ...ys.slice(1).map((y) => y - 0.015), altura - 0.015];
      [-1, 1].forEach((lado) => {
        [-0.1, 0.145].forEach((z) => {
          peca(new THREE.CylinderGeometry(0.009, 0.009, altura + 0.02, 14), MAT.cromo, lado * meioX, (altura + 0.02) / 2, z);
        });
        cortes.forEach((y) => {
          const t = peca(new THREE.CylinderGeometry(0.0065, 0.0065, 0.245, 12), MAT.cromo, lado * meioX, y, 0.0225);
          t.rotation.x = Math.PI / 2;
          const esfera = peca(new THREE.SphereGeometry(0.013, 16, 12), MAT.cromo, lado * meioX, y, 0.145);
          esfera.castShadow = false;
        });
      });
      return;
    }
    if (estilo === 'suspensa') {
      // trilhos de alumínio presos na parede + mãos-francesas finas sob cada tábua
      const meioX = largura / 2 - 0.25;
      [-1, 1].forEach((lado) => {
        peca(new THREE.BoxGeometry(0.03, altura + 0.35, 0.012), MAT.aluminio, lado * meioX, (altura + 0.35) / 2, -0.135);
        ys.concat([altura]).forEach((y) => {
          peca(new THREE.BoxGeometry(0.006, 0.035, 0.24), MAT.aluminio, lado * meioX, y - 0.036, 0.0);
        });
      });
      return;
    }
    // Clássica: laterais inteiras até o chão, costas de compensado, rodapé recuado
    const M = madeiraDe(estilo);
    const meioX = largura / 2 + 0.02;
    const alturaTotal = altura + 0.01;
    [-1, 1].forEach((lado) => peca(new RoundedBoxGeometry(0.04, alturaTotal, 0.27, 1, 0.006), M.lateral, lado * meioX, alturaTotal / 2, 0.02));
    peca(new THREE.BoxGeometry(largura + 0.04, alturaTotal, 0.012), M.costas, 0, alturaTotal / 2, -0.108, false);
    const rodape = Math.max(0.04, ys[0] - 0.035);
    peca(new THREE.BoxGeometry(largura, rodape, 0.02), M.lateral, 0, rodape / 2, 0.115);
  }

  function montarDivisoria(estilo, x, yBase, alt) {
    const mat = estilo === 'cubos' ? MAT.cromo : estilo === 'suspensa' ? MAT.carvalhoV : madeiraDe(estilo).lateral;
    const larg = estilo === 'suspensa' ? 0.012 : estilo === 'cubos' ? 0.008 : 0.02;
    peca(new THREE.BoxGeometry(larg, alt - 0.03, estilo === 'cubos' ? 0.2 : 0.24), mat, x, yBase + (alt - 0.03) / 2, 0.02);
  }

  function montarAparador(x, y) {
    const base = peca(new THREE.BoxGeometry(0.075, 0.004, 0.13), MAT_APARADOR, x + 0.03, y + 0.002, 0.04);
    const encosto = peca(new THREE.BoxGeometry(0.004, 0.16, 0.13), MAT_APARADOR, x + 0.002, y + 0.08, 0.04);
    base.castShadow = encosto.castShadow = true;
  }

  /* um toque de casa em cima do móvel: uma planta e uma pilha de livros deitados */
  function decorarTopo(largura) {
    const planta = criarPlanta(pbr, 1.15);
    planta.position.set(-largura / 2 + 0.22, alturaTopo + (estado.mobilia === 'suspensa' ? 0 : 0.0), 0.02);
    grupoEstante.add(planta);
    const cores = ['#2d4768', '#8a3a31', '#b3863a'];
    let yy = alturaTopo;
    cores.forEach((c, i) => {
      const alt = 0.03 + i * 0.004;
      const m = peca(new RoundedBoxGeometry(0.2 - i * 0.02, alt, 0.15 - i * 0.01, 1, 0.003), pbr({ color: c, roughness: 0.6 }), largura / 2 - 0.25 + i * 0.006, yy + alt / 2, 0.02);
      m.rotation.y = (i - 1) * 0.12;
      m.userData.decoracao = true;
      yy += alt;
    });
  }

  /* ---------- ambiente: a sala inteira (chão, parede, luz) trocável ---------- */
  const sala = embutida ? null : criarSala(palco, { paredeZ: -0.16 });
  function aplicarFundo(tipo) {
    estado.fundo = tipo;
    try { localStorage.setItem('estante-ambiente', tipo); } catch (e) { /* modo privado, sem problema */ }
    if (sala) sala.aplicar(tipo);
    if (typeof marcarSujo === 'function') try { marcarSujo(); } catch (e) { /* ainda iniciando */ }
  }
  let fundoInicial = 'estudio';
  try { fundoInicial = localStorage.getItem('estante-ambiente') || 'estudio'; } catch (e) { /* segue com o padrão */ }
  if (!AMBIENTES.some((a) => a[0] === fundoInicial)) fundoInicial = 'estudio';

  const grupoEstante = new THREE.Group();
  (ctx.raiz || cena).add(grupoEstante);
  aplicarFundo(fundoInicial);
  const matPaginas = pbr({ map: texturaPaginas(), color: 0xffffff, roughness: 0.85, envMapIntensity: 0.6 });

  /* as texturas das capas e lombadas ficam em cache: a estante se refaz a cada edição
     (tag, vão, lista) e recriar 160+ canvases toda vez encheria a memória da placa de vídeo. */
  const cacheTex = new Map();
  function materiaisDoLivro(l, corEfetiva) {
    const chave = [l.titulo, l.autor, l.tituloOriginal, corEfetiva].join('␟');
    let m = cacheTex.get(chave);
    if (!m) {
      if (cacheTex.size > 500) {
        cacheTex.forEach((arr) => { [arr[0], arr[1], arr[4]].forEach((mat) => { if (mat.map) mat.map.dispose(); mat.dispose(); palco.materiaisPBR.delete(mat); }); });
        cacheTex.clear();
      }
      const lPintado = { ...l, cor: corDeEncadernacao(corEfetiva, hash(l.titulo + l.autor)) };
      m = [
        pbr({ map: capaTextura(lPintado), roughness: 0.62 }),
        pbr({ color: sombrear(lPintado.cor, -0.1), roughness: 0.7 }),
        matPaginas, matPaginas,
        pbr({ map: lombadaTextura(lPintado), roughness: 0.55 }),
        matPaginas,
      ];
      cacheTex.set(chave, m);
    }
    return m;
  }

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
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(largura, altura, profundidade, 1, 0.0035), materiaisDoLivro(l, corEfetiva));
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData.livro = l;
    mesh.userData.chave = chaveDe(l);
    mesh.userData.largura = largura;
    mesh.userData.altura = altura;
    mesh.userData.prof = profundidade;
    return mesh;
  }
  /* lombada a ~2 cm da borda da tábua, como numa estante arrumada de verdade */
  const zDoLivro = (mesh) => 0.128 - mesh.userData.prof / 2;
  const Z_BORDA = 0.152;

  const LARG_LINHA = 3.4;
  const DIVISOR_LARG = 0.03;
  const GAP = 0.004;
  let livroMeshes = [];
  let placas = [];
  let alturaTopo = 1.2;

  /* ---------- etiquetas ---------- */
  const PX_UNID = 480;                                   // pixels de textura por unidade do mundo (cartões grandes)
  const PX_ETQ = 1800;                                   // etiquetas de borda: pequenas, precisam de mais pixels
  const PLACA_MAX = 9, PLACA_LINHA = 30, PLACA_CAB = 64, PLACA_RODAPE = 10;
  const alturaDaPlaca = (n) => (PLACA_CAB + (Math.min(Math.max(n, 1), PLACA_MAX) + (n > PLACA_MAX ? 1 : 0)) * PLACA_LINHA + PLACA_RODAPE) / PX_UNID;
  const medidor = document.createElement('canvas').getContext('2d');

  function encurtar(g, texto, max) {
    let t = String(texto);
    if (g.measureText(t).width <= max) return t;
    while (t.length > 3 && g.measureText(t + '…').width > max) t = t.slice(0, -1);
    return t.trimEnd() + '…';
  }
  function papel(g, w, h, foco) {
    g.fillStyle = '#f2ebda'; g.fillRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(120,90,40,.12)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (foco) { g.strokeStyle = '#3b6fd4'; g.lineWidth = Math.max(4, h * 0.06); g.strokeRect(2, 2, w - 4, h - 4); }
  }
  function descartavel(mesh, tex) { mesh.userData.texDescartavel = tex; return mesh; }

  /* cartão grande (só com "Títulos nos cartões" ligado): a lista dos títulos do vão, acima dos livros */
  function criarPlacaDoVao(larg, d) {
    const n = d.total;
    const alt = alturaDaPlaca(n);
    const w = Math.round(larg * PX_UNID), h = Math.round(alt * PX_UNID);
    const tex = textoEmCanvas(w, h, (g) => {
      papel(g, w, h, d.foco);
      g.strokeStyle = 'rgba(166,124,46,.55)'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
      g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      let fonte = 22;
      g.font = '600 ' + fonte + 'px ' + SERIFA;
      while (g.measureText(d.nome).width > w - 30 && fonte > 15) { fonte -= 1; g.font = '600 ' + fonte + 'px ' + SERIFA; }
      g.fillStyle = '#231b12'; g.fillText(encurtar(g, d.nome, w - 30), 16, 32);
      g.font = '500 15px ' + SANS; g.fillStyle = '#7a6848';
      g.fillText(encurtar(g, d.sub, w - 30), 16, 52);
      g.strokeStyle = 'rgba(166,124,46,.6)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(16, 58); g.lineTo(w - 16, 58); g.stroke();
      g.font = '500 20px ' + SERIFA;
      if (!d.titulos.length) { g.fillStyle = '#8a7a5c'; g.fillText(d.vazio || 'vazio', 16, PLACA_CAB + 22); }
      d.titulos.forEach((t, i) => {
        const topo = PLACA_CAB + i * PLACA_LINHA;
        g.fillStyle = t.cor; g.fillRect(16, topo + 7, 10, 16);
        g.fillStyle = '#231b12';
        g.fillText(encurtar(g, t.titulo, w - 62), 36, topo + 22);
      });
      if (n > d.titulos.length) { g.fillStyle = '#7a5a1c'; g.font = '600 18px ' + SANS; g.fillText('+ ' + (n - d.titulos.length) + ' — toque no cartão pra ver todos', 16, PLACA_CAB + d.titulos.length * PLACA_LINHA + 22); }
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(larg, alt), pbr({ map: tex, roughness: 0.9, envMapIntensity: 0.5 }));
    m.receiveShadow = true;
    m.userData.altura = alt;
    return descartavel(m, tex);
  }

  /* etiqueta de borda, como numa biblioteca: um cartão de papel num porta-etiqueta de latão,
     preso na frente da tábua, logo abaixo dos livros que ele nomeia */
  function criarEtiquetaBorda(larg, alt, nome, sub, foco, userData) {
    const w = Math.round(larg * PX_ETQ), h = Math.round(alt * PX_ETQ);
    const tex = textoEmCanvas(w, h, (g) => {
      papel(g, w, h, foco);
      g.textAlign = 'left'; g.textBaseline = 'middle';
      const fSub = Math.round(h * 0.3);
      g.font = '500 ' + fSub + 'px ' + SANS;
      const largSub = sub ? g.measureText('  ·  ' + sub).width : 0;
      let f = Math.round(h * 0.56);
      g.font = '600 ' + f + 'px ' + SERIFA;
      const cabe = w * 0.9 - largSub;
      while (g.measureText(nome).width > cabe && f > h * 0.3) { f -= 1; g.font = '600 ' + f + 'px ' + SERIFA; }
      const txtNome = encurtar(g, nome, cabe);
      const largNome = g.measureText(txtNome).width;
      let x = (w - largNome - largSub) / 2;
      g.fillStyle = '#231b12'; g.fillText(txtNome, x, h * 0.53);
      if (sub) { g.font = '500 ' + fSub + 'px ' + SANS; g.fillStyle = '#8a7652'; g.fillText('  ·  ' + sub, x + largNome, h * 0.55); }
    });
    const moldura = new THREE.Mesh(new RoundedBoxGeometry(larg + 0.012, alt + 0.01, 0.006, 1, 0.0025), MAT.latao);
    moldura.castShadow = true;
    const cartao = new THREE.Mesh(new THREE.PlaneGeometry(larg, alt), pbr({ map: tex, roughness: 0.85, envMapIntensity: 0.45 }));
    cartao.position.z = 0.0032;
    descartavel(cartao, tex);
    const grupo = new THREE.Group();
    grupo.add(moldura, cartao);
    Object.assign(moldura.userData, userData || {}); Object.assign(cartao.userData, userData || {});
    return { grupo, alvos: [moldura, cartao] };
  }
  function larguraDaEtiqueta(texto, alt) {
    medidor.font = '600 ' + Math.round(alt * 0.56 * PX_ETQ) + 'px ' + SERIFA;
    return Math.min(1.2, medidor.measureText(texto).width / PX_ETQ + 0.05);
  }

  function limparGrupo() {
    grupoEstante.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.userData.texDescartavel) { obj.userData.texDescartavel.dispose(); obj.material.dispose(); palco.materiaisPBR.delete(obj.material); }
      if (obj.userData.decoracao && obj.material) { obj.material.dispose(); palco.materiaisPBR.delete(obj.material); }
      if (obj.userData.halo) { obj.userData.halo.geometry.dispose(); obj.userData.halo.material.dispose(); }
    });
    grupoEstante.clear();
  }

  /* brilho dourado nos livros escolhidos na seleção (sem refazer a estante inteira a cada toque) */
  function aplicarSelecaoNosMeshes() {
    livroMeshes.forEach((mesh) => {
      const sel = estado.selecionando && estado.selecao.has(mesh.userData.chave);
      let halo = mesh.userData.halo;
      if (sel && !halo) {
        const u = mesh.userData;
        halo = new THREE.Mesh(new THREE.BoxGeometry(u.largura + 0.012, u.altura + 0.012, u.prof + 0.012), new THREE.MeshBasicMaterial({ color: 0xffc94d, transparent: true, opacity: 0.42, depthWrite: false }));
        halo.raycast = () => {};
        mesh.add(halo);
        u.halo = halo;
      }
      if (halo) halo.visible = !!sel;
      mesh.userData.selecionado = !!sel;
    });
  }

  /* ---------- Minha estante: o desenho da casa dele (andares > vãos > tags) ---------- */
  const LARG_MIN_VAO = 1.0, PAD_VAO = 0.05, DIV_LARG = 0.02;
  const ALT_ETQ = 0.072;
  const baseDoMovel = () => (estado.mobilia === 'suspensa' ? 0.26 : 0.1);

  /* desenha andares de vãos. `def.andares` = [[{ nome, sub, gente, ref, numerado, vazio, foco }]]
     (de baixo pra cima); `def.soltos` = livros sem lugar, que viram andares extras no topo. */
  function desenharAndares(def) {
    const corDoLivro = (l) => corDeEncadernacao(estado.corModo === 'categoria' ? corDeTexto(l.tags[0] || 'sem tema') : estado.corModo === 'titulo' ? corDeTexto(l.titulo) : l.cor, hash(l.titulo + l.autor));
    const mostrarLista = estado.titulosModo === 'mostrar';

    // 1) cada vão com seus livros e a largura que o conteúdo pede
    const andares = def.andares.map((vaos) => vaos.map((vao) => {
      const meshes = vao.gente.map(criarLivro);
      const conteudo = meshes.reduce((s, m) => s + m.userData.largura + GAP, 0);
      return { ...vao, meshes, base: Math.max(LARG_MIN_VAO, conteudo + 2 * PAD_VAO), placa: true };
    }));
    const largDe = (vs) => vs.reduce((s, x) => s + x.base, 0) + (vs.length - 1) * DIV_LARG;
    let W = Math.max(2.2, ...andares.map(largDe));

    // 2) livros sem lugar: andares extras em cima, empacotados pela largura
    const soltos = def.soltos;
    const limiteSolto = Math.max(3.0, W);
    const linhasSoltas = [];
    let atual = null, usado = 0;
    for (const l of soltos) {
      const mesh = criarLivro(l);
      const larg = mesh.userData.largura + GAP;
      if (!atual || usado + larg > limiteSolto - 2 * PAD_VAO) { atual = { solto: true, meshes: [], gente: [], placa: !linhasSoltas.length }; linhasSoltas.push(atual); usado = 0; }
      atual.meshes.push(mesh); atual.gente.push(l); usado += larg;
    }
    linhasSoltas.forEach((s) => { s.base = Math.max(LARG_MIN_VAO, s.meshes.reduce((t, m) => t + m.userData.largura + GAP, 0) + 2 * PAD_VAO); W = Math.max(W, s.base); });
    const linhas = [...andares, ...linhasSoltas.map((s) => [s])];

    // 3) altura de cada andar: livros + folga; com a lista de títulos ligada, + o cartão mais cheio
    const ys = [], dys = [];
    let acum = baseDoMovel();
    linhas.forEach((vs) => {
      let ph = 0;
      if (mostrarLista) vs.forEach((x) => { if (x.placa) ph = Math.max(ph, alturaDaPlaca(x.solto ? soltos.length : x.gente.length)); });
      const dy = Math.max(0.4, ph ? 0.34 + ph + 0.03 : 0);
      ys.push(acum); dys.push(dy); acum += dy;
    });
    alturaTopo = acum;
    const LT = W + 0.06;

    // 4) desenha
    linhas.forEach((vs, i) => {
      const y = ys[i], dy = dys[i];
      montarTabua(estado.mobilia, i, y, LT + 0.04);
      const esticar = (W - (vs.length - 1) * DIV_LARG) / vs.reduce((s, x) => s + x.base, 0);
      let xL = -W / 2;
      vs.forEach((x, j) => {
        const w = x.base * esticar;
        let cx = xL + PAD_VAO;
        x.meshes.forEach((mesh) => {
          const u = mesh.userData;
          mesh.position.set(cx + u.largura / 2, y + u.altura / 2, zDoLivro(mesh));
          u.casaPos = mesh.position.clone();
          grupoEstante.add(mesh);
          livroMeshes.push(mesh);
          cx += u.largura + GAP;
        });
        if (x.meshes.length && xL + w - cx > 0.12) montarAparador(cx + 0.004, y);
        if (x.placa) {
          const gente = x.solto ? soltos : x.gente;
          const alvoDados = { vao: x.solto ? { solto: true } : x.ref, gente };
          const nome = x.solto ? def.soltoNome : x.nome;
          // etiqueta de borda: sempre
          const largEtq = Math.min(w - 0.1, 0.6);
          const et = criarEtiquetaBorda(largEtq, ALT_ETQ, nome, nLivros(gente.length), !x.solto && x.foco, alvoDados);
          et.grupo.position.set(xL + w / 2, y - ALT_ETQ / 2 - 0.004, Z_BORDA);
          grupoEstante.add(et.grupo);
          placas.push(...et.alvos);
          // cartão com a lista de títulos: só quando ligado em ⚙
          if (mostrarLista) {
            const numerar = !x.solto && x.numerado;
            const titulos = gente.slice(0, PLACA_MAX).map((l, k) => ({ titulo: (numerar ? (k + 1) + '. ' : '') + l.titulo, cor: corDoLivro(l) }));
            const placa = criarPlacaDoVao(w - 0.06, {
              nome, sub: x.solto ? def.soltoSub(gente.length) : x.sub,
              titulos, total: gente.length, foco: !x.solto && x.foco, vazio: x.solto ? 'nada aqui' : x.vazio,
            });
            placa.position.set(xL + w / 2, y + dy - 0.045 - placa.userData.altura / 2, 0.1);
            Object.assign(placa.userData, alvoDados);
            grupoEstante.add(placa);
            placas.push(placa);
          }
        }
        if (j < vs.length - 1) montarDivisoria(estado.mobilia, xL + w + DIV_LARG / 2, y, dy);
        xL += w + DIV_LARG;
      });
    });
    montarTabua(estado.mobilia, linhas.length, alturaTopo, LT + 0.04);
    montarLaterais(estado.mobilia, alturaTopo, LT, ys);
    decorarTopo(LT);
    ajustarSombra(0, alturaTopo / 2, LT + 0.4, alturaTopo + 0.5);

    $('es-contagem').textContent = def.contagem(soltos.length);
    andaresParaNavegar = linhas.map((vs, i) => ({ rot: vs[0] && vs[0].solto ? '?' : String(i + 1), titulo: vs[0] && vs[0].solto ? def.soltoNome : def.tituloAndar(i), y: ys[i] + dys[i] / 2, sem: !!(vs[0] && vs[0].solto && !vs[0].placa) })).filter((x) => !x.sem).reverse();
    enquadrar(LT + 0.1, true);
  }

  const nLivros = (n) => n + (n === 1 ? ' livro' : ' livros');

  function montarPorLayout(visiveis) {
    const lay = estado.layout;
    const { celulas, soltos } = distribuir(visiveis, lay, contarTags(livros));
    const fc = org && org.aberto() ? org.foco() : null;
    const nVaos = lay.andares.reduce((s, vs) => s + vs.length, 0);
    desenharAndares({
      andares: lay.andares.map((vaos, a) => vaos.map((vao, v) => {
        const gente = celulas.get(a + ':' + v) || [];
        return {
          nome: vao.nome, gente, ref: { a, v }, foco: !!(fc && fc.a === a && fc.v === v), vazio: 'vazio — coloque uma tag neste vão',
          sub: nLivros(gente.length) + (vao.tags.length ? ' · ' + vao.tags.join(', ') : ' · sem tags ainda'),
        };
      })),
      soltos, soltoNome: 'Ainda sem lugar', soltoSub: (n) => nLivros(n) + ' · dê um vão às tags deles no Organizar',
      tituloAndar: (i) => 'Andar ' + (i + 1),
      contagem: (nSoltos) => nLivros(visiveis.length) + ' · ' + lay.andares.length + (lay.andares.length === 1 ? ' andar' : ' andares') + ' · ' + nVaos + (nVaos === 1 ? ' vão' : ' vãos') + (nSoltos ? ' · ' + nSoltos + ' sem lugar' : ''),
    });
  }

  /* modo "Listas de leitura": cada lista é um vão com os títulos numerados na ordem da fila */
  function montarPorListas(visiveis) {
    const nomes = listasConhecidas(livros, estado.layout.listas).map((x) => x.nome);
    const usados = new Set();
    const grupos = nomes.map((nome) => {
      const gente = livrosDaLista(visiveis, nome);   // um livro em duas listas aparece nas duas
      gente.forEach((l) => usados.add(chaveDe(l)));
      return { nome, gente };
    });
    const soltos = visiveis.filter((l) => !usados.has(chaveDe(l))).sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt'));
    const andares = [];
    for (let i = 0; i < grupos.length; i += 3) {
      andares.push(grupos.slice(i, i + 3).map((g) => ({
        nome: g.nome, gente: g.gente, ref: { lista: g.nome }, numerado: true, vazio: 'lista vazia — acrescente livros no Organizar',
        sub: nLivros(g.gente.length) + ' · na ordem da fila',
      })));
    }
    desenharAndares({
      andares, soltos, soltoNome: 'Fora das listas', soltoSub: (n) => nLivros(n) + (grupos.length ? '' : ' · crie uma lista no Organizar'),
      tituloAndar: (i) => 'Listas, fileira ' + (i + 1),
      contagem: () => nLivros(visiveis.length) + ' · ' + grupos.length + (grupos.length === 1 ? ' lista' : ' listas'),
    });
  }

  let andaresParaNavegar = [];

  /* ---------- prateleira automática: todos os outros modos de agrupar ---------- */
  function montarFlat(visiveis) {
    const modo = estado.modo === 'secaoReal' ? 'autor' : estado.modo;
    const grupos = new Map();
    for (const l of visiveis) {
      const chave = modo === 'tema' ? (l.tags[0] || 'sem tema')
        : modo === 'status' ? (l.status || 'sem status')
        : modo === 'prioridade' ? (l.prioridade || 'sem prioridade')
        : modo === 'suporte' ? (l.suporte || 'sem suporte definido')
        : (l.autor || 'autor desconhecido');
      if (!grupos.has(chave)) grupos.set(chave, []);
      grupos.get(chave).push(l);
    }
    const chaves = [...grupos.keys()].sort((a, b) => a.localeCompare(b, 'pt'));

    // empacota tudo numa sequência só, por ordem de grupo — a prateleira só quebra
    // linha quando o espaço acaba, não a cada grupo novo. É isso que mantém o número
    // de andares proporcional à quantidade de livros, não à quantidade de autores/temas.
    const sequencia = [];
    for (const chave of chaves) {
      const itens = grupos.get(chave).slice().sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt'));
      // só grupos com mais de 1 livro ganham etiqueta — com quase todo autor sendo único
      // no acervo, escrever o nome em cada divisória viraria uma sopa de letrinhas.
      const rotulo = itens.length > 1 ? chave : '';
      itens.forEach((liv, i) => sequencia.push({ livro: liv, novoGrupo: i === 0, rotulo }));
    }

    const linhas = [];
    let linha = null;
    let largAtual = LARG_LINHA + 1; // força a primeira iteração a abrir uma linha
    for (const item of sequencia) {
      const mesh = criarLivro(item.livro);
      const precisaDivisor = item.novoGrupo && item.rotulo && linha && linha.itens.length;
      const largComDivisor = mesh.userData.largura + (precisaDivisor ? DIVISOR_LARG + GAP : 0);
      if (!linha || largAtual + largComDivisor > LARG_LINHA) {
        linha = { itens: [], marcas: [] };
        linhas.push(linha);
        largAtual = 0;
      } else if (precisaDivisor) {
        linha.marcas.push({ x: largAtual, rotulo: item.rotulo });
        largAtual += DIVISOR_LARG + GAP;
      }
      if (item.novoGrupo && !linha.itens.length) linha.marcas.push({ x: 0, rotulo: item.rotulo });
      linha.itens.push({ mesh, xEsq: largAtual });
      largAtual += mesh.userData.largura + GAP;
    }

    // cada andar é centrado no próprio conteúdo — uma prateleira com poucos livros não fica perdida
    linhas.forEach((ln) => {
      const ultimo = ln.itens[ln.itens.length - 1];
      ln.largura = ultimo ? ultimo.xEsq + ultimo.mesh.userData.largura : 0;
    });
    const maiorLinha = Math.max(0.9, ...linhas.map((ln) => ln.largura));
    const LARG_TABUA = Math.min(LARG_LINHA + 0.1, maiorLinha + 0.4);

    const ESPACO_Y = 0.4;
    const ALT_ETQ_CURTA = 0.06;
    const ys = [];
    let acumulado = baseDoMovel();
    linhas.forEach(() => { ys.push(acumulado); acumulado += ESPACO_Y; });
    alturaTopo = acumulado;
    linhas.forEach((ln, i) => {
      const y = ys[i];
      const offX = -ln.largura / 2;
      montarTabua(estado.mobilia, i, y, LARG_TABUA);
      ln.itens.forEach(({ mesh, xEsq }) => {
        mesh.position.set(offX + xEsq + mesh.userData.largura / 2, y + mesh.userData.altura / 2, zDoLivro(mesh));
        mesh.userData.casaPos = mesh.position.clone();
        grupoEstante.add(mesh);
        livroMeshes.push(mesh);
      });
      // etiquetas de latão na borda da tábua; se uma não cabe sem tocar a anterior, é pulada
      let direita = -Infinity;
      ln.marcas.sort((a, b) => a.x - b.x).forEach(({ x, rotulo }) => {
        if (x > 0.001) montarDivisoria(estado.mobilia, offX + x + DIVISOR_LARG / 2, y, 0.32);
        if (!rotulo) return;
        const larg = larguraDaEtiqueta(rotulo, ALT_ETQ_CURTA);
        const esq = offX + x;
        if (esq < direita + 0.03) return;
        direita = esq + larg;
        const et = criarEtiquetaBorda(larg, ALT_ETQ_CURTA, rotulo, '', false, {});
        et.grupo.position.set(esq + larg / 2, y - ALT_ETQ_CURTA / 2 - 0.004, Z_BORDA);
        grupoEstante.add(et.grupo);
      });
    });
    montarTabua(estado.mobilia, linhas.length, alturaTopo, LARG_TABUA);
    montarLaterais(estado.mobilia, alturaTopo, LARG_TABUA, ys);
    decorarTopo(LARG_TABUA);
    ajustarSombra(0, alturaTopo / 2, LARG_TABUA + 0.4, alturaTopo + 0.5);

    $('es-contagem').textContent = visiveis.length + (visiveis.length === 1 ? ' livro' : ' livros') + ' · ' + linhas.length + (linhas.length === 1 ? ' andar' : ' andares');
    andaresParaNavegar = [];
    enquadrar(LARG_TABUA + 0.1, false);
  }

  /* enquadra a estante inteira no espaço útil da tela (abaixo da barra de cima), a não ser
     que a pessoa já tenha mexido na câmera com a mão */
  let larguraCena = 3;
  function enquadrar(larguraMax) {
    larguraCena = larguraMax;
    camCfg.altoMin = 0.45; camCfg.altoMax = Math.max(0.8, alturaTopo - 0.15);
    const meiaLargAlvo = Math.max(0, larguraMax / 2 - 0.45);
    camCfg.xMin = -meiaLargAlvo; camCfg.xMax = meiaLargAlvo;
    if (camCfg.altoAlvo < camCfg.altoMin) camCfg.altoAlvo = camCfg.altoMin;
    camCfg.x = Math.max(camCfg.xMin, Math.min(camCfg.xMax, camCfg.x));
    if (estado.arrastou) return;
    camCfg.x = 0;
    const k = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const aspecto = Math.max(0.4, camera.aspect || 1.6);
    const util = movel ? 0.66 : 0.82;                       // fração da altura da tela livre (sem barra em cima nem pílulas embaixo)
    const distAltura = (alturaTopo + 0.75) / (k * util);
    const distLargura = (Math.min(larguraMax, 3.6) + 0.5) / (k * aspecto);
    // tela em pé (celular): mostra a altura inteira e mais ou menos um vão de largura; o resto é arrastar
    const emPe = aspecto < 0.9;
    camCfg.dist = emPe
      ? Math.max(1.5, Math.min(distMaxCam, Math.max(distAltura * 0.92, (Math.min(larguraMax, 1.3) + 0.3) / (k * aspecto))))
      : Math.max(1.5, Math.min(distMaxCam, Math.max(distAltura, distLargura)));
    // olha um pouco acima do centro: o conteúdo desce pro espaço livre embaixo da barra
    const visivel = camCfg.dist * k;
    camCfg.altoAlvo = (alturaTopo + 0.35) / 2 + visivel * (movel ? 0.015 : 0.03);
    camCfg.altoMax = Math.max(camCfg.altoMax, camCfg.altoAlvo);
  }

  function montarPrateleira() {
    limparGrupo();
    livroMeshes = []; placas = []; hoverMesh = null;
    const visiveis = livrosVisiveis();
    const semDesenho = estado.modo === 'secaoReal' && !estado.layout.andares.length;
    const convite = $('es-convite');
    if (convite) convite.hidden = !semDesenho;
    if (estado.modo === 'secaoReal' && !semDesenho) montarPorLayout(visiveis);
    else if (estado.modo === 'lista') montarPorListas(visiveis);
    else montarFlat(visiveis);
    aplicarSelecaoNosMeshes();
    pintarTrilhoAndares();
    marcarSujo();
  }

  let paginaTrilho = '';
  function pintarTrilhoAndares() {
    const t = $('es-andares-nav');
    if (!t) return;
    const html = andaresParaNavegar.map((x) => '<button type="button" data-y="' + x.y + '" title="' + esc(x.titulo) + '">' + esc(x.rot) + '</button>').join('');
    t.hidden = !andaresParaNavegar.length;
    if (html !== paginaTrilho) { t.innerHTML = html; paginaTrilho = html; }
  }

  /* ---------- câmera: anda ao longo da estante, com inércia e amortecimento ---------- */
  const camCfg = { x: 0, altoAlvo: 0.9, dist: 2.2, altoMin: 0.45, altoMax: 2, xMin: -1.3, xMax: 1.3 };
  // embutida, a casa limita o recuo da câmera à parede em frente (a vista não sai do quarto)
  let distMaxCam = 7;
  const suave = criarCameraSuave(camera, camCfg);
  /* só deixa arrastar de lado o que não cabe na tela: de longe a estante inteira aparece e não
     há o que rolar; de perto, dá pra andar até as pontas */
  function atualizarLimites() {
    const k = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const meiaVisivel = camCfg.dist * k * Math.max(0.4, camera.aspect || 1.6) / 2;
    const folga = Math.max(0, larguraCena / 2 - meiaVisivel + 0.25);
    camCfg.xMin = -folga; camCfg.xMax = folga;
    camCfg.x = Math.max(camCfg.xMin, Math.min(camCfg.xMax, camCfg.x));
  }
  let hoverMesh = null;
  let sujo = 4;
  function marcarSujo() { sujo = Math.max(sujo, 3); }

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
      status: l.status, destino: l.destino, prioridade: l.prioridade, paginaAtual: l.paginaAtual, paginasTotal: l.paginasTotal, secaoReal: l.secaoReal, listas: l.listas || [],
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
      naEstanteHtml(l) +
      tagsEditaveisHtml(l) +
      listasDoLivroHtml(l) +
      estudoHtml(l) +
      chipsCampo('status', l) +
      chipsCampo('prioridade', l) +
      chipsCampo('suporte', l) +
      progressoHtml(l) +
      (l.destino ? '<div class="es-campo"><p class="es-rot">Destino</p><p>' + esc(l.destino) + '</p></div>' : '') +
      fichaTecnicaHtml(l) +
      '<button type="button" class="es-editar-lapis" id="es-editar">Editar este livro</button>' +
      '<div class="es-campo" style="margin-top:1rem"><p class="es-rot">Em breve</p><p class="rot suave">Ler, grifar e anotar aqui mesmo, salvando no seu perfil.</p></div>';
    $('es-fechar').addEventListener('click', fecharLivro);
    $('es-editar').addEventListener('click', () => abrirForm(l));
    ligarChipsCampo(p, l);
    ligarProgresso(p, l);
    ligarEdicaoDoLivro(p, l);
  }

  /* ---------- no painel de um livro: onde ele mora na estante, suas tags e listas ---------- */
  function lugarTexto(l) {
    if (!estado.layout.andares.length) return null;
    const pos = lugarDoLivro(l, estado.layout, mapaDeTags(estado.layout), contarTags(livros));
    if (!pos) return null;
    const vao = estado.layout.andares[pos.a][pos.v];
    return 'Andar ' + (pos.a + 1) + ' · ' + vao.nome + (pos.motivo === 'forcado' ? ' (forçado por você)' : ' (pela tag "' + pos.tag + '")');
  }
  function naEstanteHtml(l) {
    if (!estado.layout.andares.length) return '<div class="es-campo"><p class="es-rot">Na estante</p><p class="rot suave">Você ainda não montou os andares. Toque em "Organizar" na barra de cima.</p></div>';
    const onde = lugarTexto(l);
    const opcoes = estado.layout.andares.map((vaos, a) => vaos.map((v) => '<option value="' + esc(v.nome) + '">Andar ' + (a + 1) + ' · ' + esc(v.nome) + '</option>').join('')).join('');
    return '<div class="es-campo"><p class="es-rot">Na estante</p><p>' + (onde ? esc(onde) : 'Sem lugar: nenhuma tag deste livro mora em um vão.') + '</p>' +
      '<div class="es-linha-bt"><select id="ep-vao"><option value="">Forçar este livro em outro vão…</option>' + opcoes + '</select>' +
      (l.secaoReal ? '<button type="button" class="es-mini-bt" id="ep-vao-solta">Soltar (seguir as tags)</button>' : '') + '</div></div>';
  }
  function tagsEditaveisHtml(l) {
    return '<div class="es-campo"><p class="es-rot">Tags</p><div class="es-tagslivres">' +
      l.tags.map((t) => '<span>' + esc(t) + '<button type="button" class="es-tag-x" data-tag-x="' + esc(t) + '" aria-label="Tirar a tag ' + esc(t) + '">×</button></span>').join('') +
      '</div><input id="ep-tag-nova" class="es-mini-in" list="ep-dl-tags" placeholder="+ tag (digite e Enter)"><datalist id="ep-dl-tags">' +
      TODAS_TAGS.map((t) => '<option value="' + esc(t) + '">').join('') + '</datalist></div>';
  }
  function listasDoLivroHtml(l) {
    const nomes = listasConhecidas(livros, estado.layout.listas).map((x) => x.nome);
    return '<div class="es-campo"><p class="es-rot">Listas de leitura</p><div class="es-tagslivres">' +
      (l.listas || []).map((x) => '<span>' + esc(x.nome) + (x.pos ? ' <i>nº ' + x.pos + '</i>' : '') + '<button type="button" class="es-tag-x" data-lista-x="' + esc(x.nome) + '" aria-label="Tirar da lista ' + esc(x.nome) + '">×</button></span>').join('') +
      '</div><input id="ep-lista-nova" class="es-mini-in" list="ep-dl-listas" placeholder="+ pôr numa lista (existente ou nova)"><datalist id="ep-dl-listas">' +
      nomes.map((n) => '<option value="' + esc(n) + '">').join('') + '</datalist></div>';
  }
  function estudoHtml(l) {
    const e = l.estudo;
    if (!e) return '';
    const pct = e.total ? Math.round(e.feitas / e.total * 100) : 0;
    return '<div class="es-campo"><p class="es-rot">Estudo e leitura por partes</p>' +
      (e.total
        ? '<div class="es-progresso-barra"><i style="width:' + pct + '%"></i></div><p class="eo-txt" style="margin-top:.35rem !important">' + e.feitas + ' de ' + e.total + ' partes lidas (' + pct + '%)</p>'
        : '<p class="eo-txt">A nota ainda não tem a seção "Leitura por partes" com caixinhas.</p>') +
      '<p style="margin-top:.4rem !important"><a class="es-link-nota" href="obsidian://open?path=' + encodeURIComponent(e.caminho) + '">Abrir a nota de estudo no Obsidian →</a></p>' +
      '<p class="eo-txt" style="margin-top:.3rem !important">Marque as partes lidas na nota (troque [&nbsp;] por [x]). Edições, comentários e grifos ficam lá; o progresso aparece aqui.</p></div>';
  }
  async function loteNoLivro(l, corpo) {
    const chave = chaveDe(l);
    try {
      const resp = await fetch('/api/livros/lote', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify({ ...corpo, itens: [parDe(l)] }) });
      if (!resp.ok) throw 0;
    } catch { /* recarregarLivros mostra o estado real do arquivo */ }
    await recarregarLivros();
    const novo = livros.find((x) => chaveDe(x) === chave);
    const mesh = novo && livroMeshes.find((m) => m.userData.livro === novo);
    if (mesh) { estado.segurando = mesh; pintarPainel(novo); $('es-livro').classList.add('aberto'); }
    else fecharLivro();
  }
  function ligarEdicaoDoLivro(p, l) {
    p.querySelectorAll('[data-tag-x]').forEach((b) => b.addEventListener('click', () => loteNoLivro(l, { acao: 'tag-', tag: b.dataset.tagX })));
    p.querySelectorAll('[data-lista-x]').forEach((b) => b.addEventListener('click', () => loteNoLivro(l, { acao: 'lista-', lista: b.dataset.listaX })));
    const tagIn = p.querySelector('#ep-tag-nova');
    if (tagIn) tagIn.addEventListener('change', () => { const t = limparTag(tagIn.value); if (t) loteNoLivro(l, { acao: 'tag+', tag: t }); });
    const listaIn = p.querySelector('#ep-lista-nova');
    if (listaIn) listaIn.addEventListener('change', async () => {
      const nome = limparLista(listaIn.value);
      if (!nome) return;
      await garantirLista(nome);
      loteNoLivro(l, { acao: 'lista+', lista: nome });
    });
    const vaoSel = p.querySelector('#ep-vao');
    if (vaoSel) vaoSel.addEventListener('change', () => { if (vaoSel.value) loteNoLivro(l, { acao: 'vao', valor: vaoSel.value }); });
    const solta = p.querySelector('#ep-vao-solta');
    if (solta) solta.addEventListener('click', () => loteNoLivro(l, { acao: 'vao', valor: '' }));
  }
  async function garantirLista(nome) {
    if (estado.layout.listas.some((x) => x.nome === nome)) return;
    estado.layout.listas.push({ nome, desc: '' });
    try { await fetch('/api/estante/layout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify({ andares: estado.layout.andares, listas: estado.layout.listas }) }); estado.layout.existe = true; } catch { /* a lista continua valendo pelos livros */ }
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
    const sec = (t, txt) => '<div class="es-campo"><p class="es-rot">' + t + '</p><p>' + txt + '</p></div>';
    return '<button type="button" class="es-x" id="es-guia-fechar" aria-label="Fechar">×</button>' +
      '<h2>Como usar a Estante</h2>' +
      sec('A ideia, em três palavras', '<b>Andar</b> é uma prateleira (o 1 é o de baixo). Cada andar se divide em <b>vãos</b>, lado a lado, com divisórias. E cada <b>tag</b> mora em um vão: os livros vão sozinhos pro vão da tag deles. Nada de número na frente do nome.') +
      sec('Montar a estante da sua casa', 'Botão dourado <b>Organizar</b> → aba "Andares e vãos". Na primeira vez, toque em "Montar uma estante inicial" (ou "Começar do zero"). Depois: <b>toque numa tag e depois no vão</b> onde ela vai morar (ou arraste). "Dividir" parte um vão em dois, lado a lado; "+ Novo andar" empilha; ▲ ▼ trocam andares de lugar; ◀ ▶ trocam vãos; o nome de cada vão é só clicar e escrever.') +
      sec('As etiquetas na estante', 'Cada vão tem um cartão de papel em cima dos livros, com o nome do vão, quantos livros, as tags e os títulos (cada um com a cor da lombada). <b>Toque no cartão</b> pra abrir aquele vão no Organizar. Os botões numerados à esquerda pulam pra cada andar.') +
      sec('Escolher vários livros de uma vez', 'Botão <b>Selecionar</b>: toque nos livros (ou no cartão de um vão, que escolhe todos dele) e eles ganham um brilho dourado. A bandeja embaixo deixa: levar pra um vão, pôr ou tirar tag, pôr ou tirar de uma lista. "Concluir" sai.') +
      sec('Tags', 'No Organizar → aba "Tags": renomeie (vale pra todos os livros), junte duas escrevendo o nome da outra, apague, ou toque em "Ver" pra ver só os livros dela. Dentro de um livro, o × tira uma tag e o campo "+ tag" põe outra.') +
      sec('Listas de leitura', 'Organizar → aba "Listas de leitura": crie uma lista, acrescente livros (digite o título), mude a ordem com ▲ ▼ e veja quantos já foram lidos. "Ver na estante" mostra só os livros dela, em fila. O modo "Listas de leitura" na barra mostra todas de uma vez. Um livro pode estar em várias listas.') +
      sec('Um livro específico num vão diferente', 'Dentro do livro, "Na estante" mostra onde ele mora e por quê. Se quiser, force ele em outro vão; "Soltar" devolve ao vão da tag.') +
      sec('Andar pela estante', 'Arraste na horizontal pra andar de lado, na vertical pra subir e descer. Roda do mouse (ou pinça) faz zoom. A bolinha embaixo também arrasta. Com um livro na mão, ← → pulam pro anterior e o próximo.') +
      sec('Pegar e ver um livro', 'Toque no livro: ele vem até você, com todos os dados. Toque fora, ou Esc, pra guardar.') +
      sec('Adicionar um livro', 'Botão "+ Livro". Digite só o título e "Buscar dados": ele procura numa base real e você escolhe uma opção pra preencher autor e tags.') +
      sec('Status, prioridade, progresso', 'Dentro do livro: toque num valor (ex. "lendo") pra marcar; o lápis ✎ renomeia aquele valor em todos os livros. Página atual e total calculam a porcentagem; o botão "Progresso" mostra o resumo.') +
      sec('Aparência', 'A engrenagem ⚙ abre: cor dos livros, tamanho, se os cartões mostram a lista de títulos (oculta por padrão — o cartão sempre mostra nome e quantidade; toque nele pra ver os livros no Organizar), ambiente (fundo) e móvel. É só visual, não muda seus dados.') +
      sec('Buscar e filtrar', 'A busca procura por título ou autor. "Filtrar por tag" mostra só os livros daquela tag (toque de novo pra soltar). Os modos "Por autor / tema / status…" reagrupam a estante sem mexer nos seus andares.');
  }
  function ligarGuia() { $('es-guia-fechar')?.addEventListener('click', fecharGuia); }
  function abrirGuia() { $('es-guia').innerHTML = guiaHtml(); ligarGuia(); $('es-guia').classList.add('aberto'); }
  function fecharGuia() { $('es-guia').classList.remove('aberto'); }

  function pintarProgresso() {
    const painel = $('es-progresso');
    painel.innerHTML = resumoProgressoHtml();
    $('es-progresso-fechar')?.addEventListener('click', fecharProgresso);
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
    $('es-form-fechar').addEventListener('click', fecharForm);
    $('ef-cancelar').addEventListener('click', fecharForm);
    $('ef-salvar').addEventListener('click', () => salvarForm(livroExistente));
    $('ef-buscar').addEventListener('click', buscarDados);
    if (estado.segurando) fecharLivro();
    f.classList.add('aberto');
  }

  /* digite só o título, busque numa base real (Google Books) e confira antes de aceitar —
     nunca preenche sozinho: só sugere, e só entra no formulário se você clicar "usar". */
  async function buscarDados() {
    const titulo = $('ef-titulo').value.trim();
    const caixa = $('ef-resultados');
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
      $('ef-titulo').value = rr.titulo;
      if (rr.autor) $('ef-autor').value = rr.autor;
      if (rr.tags.length) $('ef-tags').value = rr.tags.join(', ');
      caixa.hidden = true; caixa.innerHTML = '';
    }));
  }
  function fecharForm() { $('es-form').classList.remove('aberto'); }

  async function salvarForm(livroExistente) {
    const msg = $('ef-msg');
    const titulo = $('ef-titulo').value.trim();
    if (!titulo) { msg.hidden = false; msg.className = 'es-msg erro'; msg.textContent = 'O título é obrigatório.'; return; }
    const corpo = {
      tituloAntigo: livroExistente ? livroExistente.titulo : null,
      autorAntigo: livroExistente ? livroExistente.autor : null,
      titulo,
      tituloOriginal: $('ef-original').value.trim(),
      autor: $('ef-autor').value.trim(),
      tags: $('ef-tags').value.split(',').map((t) => t.trim()).filter(Boolean),
      status: $('ef-status').value.trim(),
      destino: $('ef-destino').value.trim(),
      prioridade: $('ef-prioridade').value.trim(),
      paginaAtual: +$('ef-pagina').value || 0,
      paginasTotal: +$('ef-paginas').value || 0,
      formato: $('ef-formato').value.trim(),
      tamanho: $('ef-tamanho').value.trim(),
      material: $('ef-material').value.trim(),
      medidas: $('ef-medidas').value.trim(),
      suporte: $('ef-suporte').value.trim(),
      tipoScan: $('ef-scan').value.trim(),
      comercial: $('ef-comercial').value.trim(),
      secaoReal: livroExistente ? livroExistente.secaoReal : '',
      listas: livroExistente ? (livroExistente.listas || []) : [],
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
  /* quanto o mundo anda por pixel arrastado: 1:1 com o conteúdo, perto ou longe */
  const mundoPorPixel = () => camCfg.dist * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / Math.max(1, canvas.clientHeight);

  function alvoNoPonto(cx, cy) {
    const rct = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((cx - rct.left) / rct.width) * 2 - 1, -((cy - rct.top) / rct.height) * 2 + 1), camera);
    const hit = ray.intersectObjects([...livroMeshes, ...placas], false)[0];
    if (!hit) return null;
    return hit.object.userData.livro ? { tipo: 'livro', mesh: hit.object } : { tipo: 'placa', vao: hit.object.userData.vao, gente: hit.object.userData.gente };
  }

  /* passar o mouse: o livro sai um dedo da prateleira e um cartãozinho diz o que é */
  function definirHover(mesh, ev) {
    hoverMesh = mesh;
    const t = $('es-tip');
    if (!t) return;
    if (!mesh) { t.classList.remove('on'); return; }
    const l = mesh.userData.livro;
    const rct = canvas.getBoundingClientRect();
    t.innerHTML = '<b>' + esc(l.titulo) + '</b><span>' + esc(l.autor || 'autor desconhecido') + '</span>';
    const x = Math.min(ev.clientX - rct.left + 16, rct.width - 260);
    t.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(ev.clientY - rct.top + 18) + 'px)';
    t.classList.add('on');
  }
  function atualizarHover(ev) {
    if (ev.pointerType !== 'mouse' || estado.segurando) { definirHover(null); canvas.style.cursor = ''; return; }
    const alvo = alvoNoPonto(ev.clientX, ev.clientY);
    definirHover(alvo && alvo.tipo === 'livro' ? alvo.mesh : null, ev);
    canvas.style.cursor = alvo ? 'pointer' : '';
  }

  /* ---------- selecionar vários livros (brilho dourado + bandeja de ações) ---------- */
  function aoMudarSelecao() { aplicarSelecaoNosMeshes(); bandeja.pintar(); }
  function selecionar(arr) {
    estado.selecionando = true;
    arr.forEach((l) => estado.selecao.add(chaveDe(l)));
    if (org.aberto()) org.fechar();
    fecharLivro();
    pintarBarra();
    aoMudarSelecao();
  }
  function ligarSelecao(ligar) {
    estado.selecionando = ligar;
    if (!ligar) estado.selecao.clear();
    if (ligar) { fecharLivro(); bandeja.resetar(); }
    pintarBarra();
    aoMudarSelecao();
  }
  function sairSelecao() { ligarSelecao(false); }
  function alternarSelecao(l) {
    const k = chaveDe(l);
    if (estado.selecao.has(k)) estado.selecao.delete(k); else estado.selecao.add(k);
    aoMudarSelecao();
  }
  function selecionarDoVao(gente) {
    if (!gente || !gente.length) return;
    if (gente.every((l) => estado.selecao.has(chaveDe(l)))) gente.forEach((l) => estado.selecao.delete(chaveDe(l)));
    else gente.forEach((l) => estado.selecao.add(chaveDe(l)));
    aoMudarSelecao();
  }

  function abrirVaoNoOrganizar(vao) {
    fecharLivro(); fecharGuia(); fecharProgresso();
    if (vao.lista) org.abrir('listas', null);
    else org.abrir('andares', vao.solto ? null : vao);
  }
  /* botões de andar: chega perto daquele andar, com a câmera deslizando até lá */
  function irParaAltura(y) {
    estado.arrastou = true;
    suave.parar();
    camCfg.dist = Math.min(camCfg.dist, movel ? 2.4 : 1.9);
    camCfg.altoAlvo = Math.max(camCfg.altoMin, Math.min(camCfg.altoMax, y));
  }

  ouvir(canvas, 'pointerdown', (ev) => {
    arrastando = true; moveu = false; px0 = ev.clientX; py0 = ev.clientY;
    suave.parar();
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* toque sintético em teste, ou ponteiro já solto */ }
  });
  ouvir(canvas, 'pointermove', (ev) => {
    if (!arrastando) { atualizarHover(ev); return; }
    const dx = ev.clientX - px0, dy = ev.clientY - py0;
    if (Math.abs(dx) + Math.abs(dy) > 4) { moveu = true; definirHover(null); }
    if (estado.segurando) {
      if (ultimoPX != null) { swingY += (ev.clientX - ultimoPX) * 0.0026; swingX += (ev.clientY - ultimoPY) * 0.0022; }
    } else {
      estado.arrastou = true;
      const k = mundoPorPixel();
      suave.arrastar(-dx * k, dy * k);
    }
    ultimoPX = ev.clientX; ultimoPY = ev.clientY;
    px0 = ev.clientX; py0 = ev.clientY;
  });
  ouvir(canvas, 'pointerleave', () => { if (!arrastando) { definirHover(null); canvas.style.cursor = ''; } });
  ouvir(canvas, 'pointerup', (ev) => {
    arrastando = false; ultimoPX = null; ultimoPY = null;
    suave.soltar();
    if (moveu) return;
    const alvo = alvoNoPonto(ev.clientX, ev.clientY);
    if (alvo && alvo.tipo === 'livro') {
      if (estado.selecionando) alternarSelecao(alvo.mesh.userData.livro); else abrirLivro(alvo.mesh);
    } else if (alvo && alvo.tipo === 'placa') {
      if (estado.selecionando) selecionarDoVao(alvo.gente); else abrirVaoNoOrganizar(alvo.vao);
    } else if (estado.segurando) fecharLivro();
  });
  ouvir(canvas, 'wheel', (ev) => {
    ev.preventDefault();
    estado.arrastou = true;
    // trackpad/mouse com rolagem horizontal já anda a prateleira de lado (deltaX);
    // rolagem vertical é o zoom — proporcional, então é igual de suave de perto e de longe.
    if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) {
      camCfg.x = Math.max(camCfg.xMin, Math.min(camCfg.xMax, camCfg.x + ev.deltaX * mundoPorPixel()));
    } else {
      camCfg.dist = Math.max(0.9, Math.min(distMaxCam + 0.5, camCfg.dist * (1 + Math.max(-0.25, Math.min(0.25, ev.deltaY * 0.0011)))));
    }
  }, { passive: false });
  ouvir(window, 'keydown', (ev) => {
    const digitando = ev.target && ev.target.matches && ev.target.matches('input, textarea, select');
    if (ev.key === 'Escape') {
      if ($('es-form').classList.contains('aberto')) fecharForm();
      else if (org.aberto()) org.fechar();
      else if ($('es-guia').classList.contains('aberto')) fecharGuia();
      else if ($('es-progresso').classList.contains('aberto')) fecharProgresso();
      else if (estado.segurando) fecharLivro();
      else if (estado.selecionando) sairSelecao();
      return;
    }
    if (digitando) return;
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

  /* ---------- painéis: Organizar (andares, tags, listas) e a bandeja de seleção ---------- */
  function filtrarPorTag(tag) {
    estado.tags = new Set([tag]);
    org.fechar();
    estado.arrastou = false;
    pintarBarra(); montarPrateleira();
  }
  function verLista(nome) {
    estado.listaFiltro = nome;
    if (nome) estado.modo = 'lista';
    org.fechar();
    estado.arrastou = false;
    pintarBarra(); montarPrateleira();
  }
  function segurarLivro(l) {
    const mesh = livroMeshes.find((m) => m.userData.livro === l);
    if (!mesh) { org.dizerAviso('Esse livro está escondido pelo filtro de tag/busca/lista. Limpe o filtro pra vê-lo.'); return; }
    org.fechar();
    estado.arrastou = true;
    camCfg.x = Math.max(camCfg.xMin, Math.min(camCfg.xMax, mesh.position.x));
    camCfg.altoAlvo = Math.max(camCfg.altoMin, Math.min(camCfg.altoMax, mesh.position.y + 0.1));
    abrirLivro(mesh);
  }

  /* ---------- barra de cima: poucos botões à vista, o resto em menus ---------- */
  /* ícones do sistema único (icones.js, item 73) */
  const I3 = (n) => (window.Icones ? window.Icones.svg(n) : '');
  const ICONE = {
    voltar: I3('voltar'),
    busca: I3('busca'),
    filtro: I3('filtro'),
    progresso: I3('progresso'),
    ajustes: I3('ajustes'),
    ajuda: I3('ajuda'),
    seta: I3('seta'),
  };
  const MODOS = [['secaoReal', 'Minha estante'], ['autor', 'Por autor'], ['tema', 'Por tema'], ['status', 'Por status'], ['prioridade', 'Por prioridade'], ['suporte', 'Físico ou digital'], ['lista', 'Listas de leitura']];

  function dicaDoModo() {
    if (estado.selecionando) return 'toque nos livros (ou na etiqueta de um vão) pra escolher · "Concluir" sai';
    if (estado.modo === 'secaoReal') return estado.layout.andares.length ? 'arraste pra andar · roda ou pinça pra aproximar · toque na etiqueta de latão pra organizar o vão' : 'ainda sem andares: toque em "Organizar"';
    if (estado.modo === 'lista') return 'cada vão é uma lista de leitura, na ordem da fila';
    return 'arraste pra andar · toque num livro pra pegar · setas: livro seguinte';
  }
  function pintarBarra() {
    ui.querySelector('.es-barra')?.remove();
    const barra = document.createElement('div');
    barra.className = 'es-barra';
    const rotuloModo = (MODOS.find((m) => m[0] === estado.modo) || MODOS[0])[1];
    const nTags = estado.tags.size;
    const mostrarTags = TODAS_TAGS.length && (estado.filtroAberto || nTags);
    const icone = (id, ic, rot, extra = '') => '<button type="button" class="es-btn es-icone' + extra + '" id="' + id + '" title="' + rot + '" aria-label="' + rot + '">' + ic + '</button>';
    barra.innerHTML =
      '<div class="eb-linha">' +
        (embutida
          ? '<button type="button" class="es-voltar" data-mundo-sair title="Voltar pra casa (Esc)" aria-label="Voltar pra casa">' + ICONE.voltar + '</button>'
          : '<a class="es-voltar" href="eu.html#colecao" title="Voltar para Eu" aria-label="Voltar para Eu">' + ICONE.voltar + '</a>') +
        '<div class="es-titulo">' + (embutida && ctx.migalha ? '<small class="es-migalha">' + esc(ctx.migalha()) + '</small>' : '') + '<b>Estante</b><span>' + livros.length + ' livros</span></div>' +
        (embutida
          ? '<nav class="gr-troca-es" aria-label="Áreas da casa"><a data-mundo-ir="casa">Casa</a><a aria-current="page">Estante</a><a data-mundo-ir="guarda-roupa">Guarda-roupa</a></nav>'
          : '<nav class="gr-troca-es" aria-label="Móveis"><a aria-current="page">Estante</a><a href="guarda-roupa.html">Guarda-roupa</a><a href="casa.html">Casa</a></nav>') +
        '<div class="eb-menu-cx">' +
          '<button type="button" class="es-btn es-vista" id="es-vista-btn" aria-haspopup="true" aria-expanded="false">' + rotuloModo + ICONE.seta + '</button>' +
          '<div class="es-menu es-grupo" id="es-vista-menu" role="menu">' +
            MODOS.map((m) => '<button type="button" role="menuitemradio" aria-checked="' + (estado.modo === m[0]) + '" data-modo="' + m[0] + '" class="' + (estado.modo === m[0] ? 'on' : '') + '">' + m[1] + '</button>').join('') +
          '</div>' +
        '</div>' +
        '<label class="es-busca-cx">' + ICONE.busca + '<input type="search" class="es-busca" id="es-busca" placeholder="Buscar título ou autor" value="' + esc(estado.busca) + '"></label>' +
        '<div class="eb-acoes">' +
          '<button type="button" class="es-btn es-primario" id="es-abrir-org">Organizar</button>' +
          '<button type="button" class="es-btn' + (estado.selecionando ? ' ligado' : '') + '" id="es-alternar-sel">' + (estado.selecionando ? 'Selecionando ✓' : 'Selecionar') + '</button>' +
          '<button type="button" class="es-btn" id="es-abrir-add">+ Livro</button>' +
          '<span class="eb-sep" aria-hidden="true"></span>' +
          icone('es-filtrar', ICONE.filtro + (nTags ? '<i class="es-badge">' + nTags + '</i>' : ''), 'Filtrar por tag', (estado.filtroAberto || nTags) ? ' on' : '') +
          icone('es-abrir-progresso', ICONE.progresso, 'Progresso de leitura') +
          icone('es-abrir-ajustes', ICONE.ajustes, 'Aparência', estado.ajustesAbertos ? ' on' : '') +
          icone('es-abrir-guia', ICONE.ajuda, 'Como usar') +
        '</div>' +
      '</div>' +
      (estado.listaFiltro ? '<button type="button" class="es-filtro-ativo" id="es-limpar-lista">Só a lista "' + esc(estado.listaFiltro) + '" ✕</button>' : '') +
      (mostrarTags ? '<div class="es-tags-cx"><span class="es-rot-linha">Filtrar por tag</span><div class="es-tags">' + TODAS_TAGS.map((t) => '<button type="button" class="es-tag' + (estado.tags.has(t) ? ' on' : '') + '" data-tag="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div>' + (nTags ? '<button type="button" class="es-limpar-tags" id="es-limpar-tags">limpar</button>' : '') + '</div>' : '') +
      '<div class="es-ajustes-cx' + (estado.ajustesAbertos ? ' aberto' : '') + '" id="es-ajustes-cx">' +
        '<div class="eaj-grade">' +
          (embutida ? '' : '<div><p class="es-rot">Ambiente</p><div class="es-fundo-cx">' + AMBIENTES.map((f) => '<button type="button" class="es-fundo-btn' + (estado.fundo === f[0] ? ' on' : '') + '" data-fundo="' + f[0] + '">' + f[1] + '</button>').join('') + '</div></div>') +
          '<div><p class="es-rot">Móvel</p><div class="es-fundo-cx">' + MOBILIAS.map((m) => '<button type="button" class="es-fundo-btn' + (estado.mobilia === m[0] ? ' on' : '') + '" data-movel="' + m[0] + '">' + m[1] + '</button>').join('') + '</div></div>' +
          '<div><p class="es-rot">Cor dos livros</p><div class="es-grupo es-grupo-ajuste">' + CORES_MODO.map((m) => '<button type="button" data-cor="' + m[0] + '" class="' + (estado.corModo === m[0] ? 'on' : '') + '">' + m[1] + '</button>').join('') + '</div></div>' +
          '<div><p class="es-rot">Tamanho dos livros</p><div class="es-grupo es-grupo-ajuste">' + TAMANHOS_MODO.map((m) => '<button type="button" data-tamanho="' + m[0] + '" class="' + (estado.tamanhoModo === m[0] ? 'on' : '') + '">' + m[1] + '</button>').join('') + '</div>' +
            '<p class="es-nota">"Real" só vale pros livros com páginas totais preenchidas.</p></div>' +
          '<div><p class="es-rot">Títulos nos cartões</p><div class="es-grupo es-grupo-ajuste">' + TITULOS_MODO.map((m) => '<button type="button" data-titulos="' + m[0] + '" class="' + (estado.titulosModo === m[0] ? 'on' : '') + '">' + m[1] + '</button>').join('') + '</div>' +
            '<p class="es-nota">A etiqueta de latão de cada vão sempre mostra o nome e quantos livros; ligando aqui, um cartão com todos os títulos aparece acima deles.</p></div>' +
        '</div>' +
      '</div>';
    ui.insertBefore(barra, ui.firstChild);
    const dica = $('es-dica'); if (dica) dica.textContent = dicaDoModo();

    const vistaBtn = barra.querySelector('#es-vista-btn'), vistaMenu = barra.querySelector('#es-vista-menu');
    vistaBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const abrir = !vistaMenu.classList.contains('aberto');
      vistaMenu.classList.toggle('aberto', abrir);
      vistaBtn.setAttribute('aria-expanded', String(abrir));
    });
    barra.querySelectorAll('[data-modo]').forEach((b) => b.addEventListener('click', () => { estado.modo = b.dataset.modo; estado.arrastou = false; pintarBarra(); montarPrateleira(); }));
    barra.querySelectorAll('[data-tag]').forEach((b) => b.addEventListener('click', () => {
      const t = b.dataset.tag;
      if (estado.tags.has(t)) estado.tags.delete(t); else estado.tags.add(t);
      estado.filtroAberto = true;
      estado.arrastou = false;
      pintarBarra(); montarPrateleira();
    }));
    const limparTags = barra.querySelector('#es-limpar-tags');
    if (limparTags) limparTags.addEventListener('click', () => { estado.tags.clear(); estado.arrastou = false; pintarBarra(); montarPrateleira(); });
    barra.querySelector('#es-filtrar').addEventListener('click', () => { estado.filtroAberto = !estado.filtroAberto; pintarBarra(); });
    barra.querySelectorAll('[data-fundo]').forEach((b) => b.addEventListener('click', () => { estado.ajustesAbertos = true; aplicarFundo(b.dataset.fundo); pintarBarra(); }));
    barra.querySelectorAll('[data-movel]').forEach((b) => b.addEventListener('click', () => { estado.ajustesAbertos = true; aplicarMobilia(b.dataset.movel); pintarBarra(); }));
    barra.querySelector('#es-busca').addEventListener('input', (ev) => { estado.busca = ev.target.value; estado.arrastou = false; montarPrateleira(); });
    barra.querySelector('#es-abrir-org').addEventListener('click', () => { fecharLivro(); fecharGuia(); fecharProgresso(); org.abrir('andares', null); });
    barra.querySelector('#es-alternar-sel').addEventListener('click', () => ligarSelecao(!estado.selecionando));
    barra.querySelector('#es-abrir-add').addEventListener('click', () => abrirForm(null));
    barra.querySelector('#es-abrir-progresso').addEventListener('click', abrirProgresso);
    barra.querySelector('#es-abrir-guia').addEventListener('click', abrirGuia);
    barra.querySelector('#es-abrir-ajustes').addEventListener('click', () => { estado.ajustesAbertos = !estado.ajustesAbertos; pintarBarra(); });
    const limpaLista = barra.querySelector('#es-limpar-lista');
    if (limpaLista) limpaLista.addEventListener('click', () => { estado.listaFiltro = null; estado.arrastou = false; pintarBarra(); montarPrateleira(); });
    barra.querySelectorAll('[data-cor]').forEach((b) => b.addEventListener('click', () => { estado.ajustesAbertos = true; aplicarAjuste('corModo', b.dataset.cor); pintarBarra(); }));
    barra.querySelectorAll('[data-tamanho]').forEach((b) => b.addEventListener('click', () => { estado.ajustesAbertos = true; aplicarAjuste('tamanhoModo', b.dataset.tamanho); pintarBarra(); }));
    barra.querySelectorAll('[data-titulos]').forEach((b) => b.addEventListener('click', () => { estado.ajustesAbertos = true; aplicarAjuste('titulosModo', b.dataset.titulos); pintarBarra(); }));
  }
  ouvir(document, 'click', (ev) => {
    const menu = $('es-vista-menu');
    if (menu && menu.classList.contains('aberto') && !ev.target.closest('.eb-menu-cx')) {
      menu.classList.remove('aberto');
      $('es-vista-btn')?.setAttribute('aria-expanded', 'false');
    }
  });

  ui.innerHTML = '<p class="es-contagem" id="es-contagem"></p><p class="es-dica" id="es-dica">arraste: anda de lado / sobe e desce · roda: zoom · clique: pega</p>' +
    '<div class="es-rolo" id="es-rolo" hidden><div class="es-rolo-trilho"></div><div class="es-rolo-bola" id="es-rolo-bola"></div></div>' +
    '<nav class="es-andares-nav" id="es-andares-nav" aria-label="Ir para um andar" hidden></nav>' +
    '<div class="es-convite" id="es-convite" hidden><b>Sua estante ainda não tem andares</b><span>Monte a estante da sua casa: andares, vãos lado a lado e a tag que mora em cada um.</span><button type="button" class="es-add es-destaque" id="es-convite-btn">Abrir o Organizar</button></div>' +
    '<div class="es-livro" id="es-livro"></div><div class="es-form" id="es-form"></div><div class="es-livro es-progresso" id="es-progresso"></div><div class="es-livro es-progresso" id="es-guia"></div>' +
    '<div class="es-livro es-org" id="es-org"></div><div class="es-bandeja" id="es-bandeja" hidden></div><div class="es-tip" id="es-tip" aria-hidden="true"></div>';
  const org = criarOrganizador({
    painel: $('es-org'), estado, esc,
    livros: () => livros,
    refazer: () => { montarPrateleira(); },
    recarregar: recarregarLivros,
    segurar: segurarLivro,
    filtrarPorTag, verLista, selecionar,
    fechar: () => org.fechar(),
  });
  async function loteNaBandeja(corpo) {
    try {
      const resp = await fetch('/api/livros/lote', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify(corpo) });
      return resp.ok ? await resp.json() : null;
    } catch { return null; }
  }
  const bandeja = criarBandeja({
    bandeja: $('es-bandeja'), estado, esc,
    livros: () => livros, visiveis: livrosVisiveis,
    listasNomes: () => listasConhecidas(livros, estado.layout.listas).map((x) => x.nome),
    lote: loteNaBandeja, garantirLista, recarregar: recarregarLivros,
    selecionar, aoMudarSelecao, sairSelecao,
  });
  $('es-convite-btn').addEventListener('click', () => org.abrir('andares', null));
  $('es-andares-nav').addEventListener('click', (ev) => { const b = ev.target.closest('button[data-y]'); if (b) irParaAltura(+b.dataset.y); });
  redimensionar();
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
    camCfg, grupoEstante, camera, palco, suave,
    get livroMeshes() { return livroMeshes; },
    olharPara(i, dist) {
      const l = livroMeshes[i];
      camCfg.travado = { x: l.position.x, y: l.position.y, dist: dist || 0.3 };
    },
  };

  /* ---------- redimensionar ---------- */
  function redimensionar() { palco.redimensionar(); }
  ouvir(window, 'resize', () => { if (!embutida) redimensionar(); if (!estado.arrastou) montarPrateleira(); });
  redimensionar();

  /* ---------- laço de render ---------- */
  const relogio = new THREE.Clock();
  ['pointermove', 'pointerdown', 'pointerup', 'wheel', 'keydown', 'resize'].forEach((t) => ouvir(window, t, marcarSujo, { passive: true }));
  const alvoCasa = new THREE.Vector3();
  const QUAT_ZERO = new THREE.Quaternion();
  /* passo(dt, ativa): ativa, a câmera é dela; inativa (vista da casa), só os livros voltam ao lugar */
  function passo(dt, ativa = true) {
    atualizarLimites();
    let precisa = (ativa ? suave.passo(dt) : false) || sujo > 0 || (ativa && !!estado.segurando);
    sincronizarRolo();
    grupoEstante.children.forEach((obj) => {
      if (!obj.userData.livro) return;
      if (ativa && obj === estado.segurando) {
        const dirCam = new THREE.Vector3(); camera.getWorldDirection(dirCam);
        // no celular o painel sobe do fundo cobrindo boa parte da tela — o livro segurado
        // precisa ficar menor e mais alto, cabendo inteiro na faixa que sobra em cima dele.
        const distSegurar = movel ? 1.3 : 0.62;
        const alturaTela = movel ? 0.2 : -0.08;
        heldAlvo.copy(camera.position).addScaledVector(dirCam, distSegurar).add(new THREE.Vector3(0, alturaTela, 0));
        // no computador o painel ocupa a direita: o livro fica no meio do espaço que sobra à esquerda
        if (!movel) heldAlvo.add(new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).multiplyScalar(-0.12));
        obj.position.lerp(heldAlvo, Math.min(1, dt * 9));
        const euler = new THREE.Euler(swingX * 0.5, -Math.PI / 2 + swingY * 0.6, 0, 'YXZ');
        heldQuat.setFromEuler(euler);
        obj.quaternion.slerp(heldQuat, Math.min(1, dt * 10));
        swingX *= Math.max(0, 1 - dt * 4); swingY *= Math.max(0, 1 - dt * 4);
      } else if (obj.userData.casaPos) {
        const u = obj.userData;
        alvoCasa.copy(u.casaPos);
        if (obj === hoverMesh) { alvoCasa.z += 0.045; alvoCasa.y += 0.004; }
        else if (u.selecionado) alvoCasa.z += 0.02;
        if (obj.position.distanceToSquared(alvoCasa) > 1e-9 || Math.abs(obj.quaternion.w) < 0.99999) {
          obj.position.lerp(alvoCasa, 1 - Math.exp(-dt * 12));
          obj.quaternion.slerp(QUAT_ZERO, 1 - Math.exp(-dt * 10));
          precisa = true;
        }
      }
    });
    // desenha só quando algo muda: parada, a estante não gasta nada da máquina
    if (precisa && sujo > 0) sujo--;
    return precisa;
  }
  if (!embutida) {
    (function quadro() {
      requestAnimationFrame(quadro);
      const dt = Math.min(0.05, relogio.getDelta());
      if (passo(dt)) palco.renderizar(dt);
    })();
  }

  /* ---------- o que a casa usa pra embutir a estante ---------- */
  return {
    nome: 'estante',
    grupo: grupoEstante,
    passo,
    marcarSujo,
    resumo: () => livros.length + (livros.length === 1 ? ' livro' : ' livros'),
    /* caixa do móvel no espaço dele (x ao longo da estante, z pra frente), sem o livro na mão */
    medidas() {
      const naMao = estado.segurando; if (naMao) naMao.visible = false;
      const caixa = caixaLocal(grupoEstante);
      if (naMao) naMao.visible = true;
      if (caixa.isEmpty()) return { largura: 1.6, altura: 2, zTras: -0.15, zFrente: 0.2, xMin: -0.8, xMax: 0.8 };
      return { largura: caixa.max.x - caixa.min.x, altura: caixa.max.y, zTras: Math.min(caixa.min.z, -0.12), zFrente: caixa.max.z, xMin: caixa.min.x, xMax: caixa.max.x };
    },
    /* onde a câmera fica ao entrar: a vista inteira, como a estante sozinha abre */
    vistaInicial() {
      estado.arrastou = false;
      camCfg.travado = null;
      enquadrar(larguraCena);
      atualizarLimites();
      return { pos: new THREE.Vector3(camCfg.x, camCfg.altoAlvo + 0.1, camCfg.dist), alvo: new THREE.Vector3(camCfg.x, camCfg.altoAlvo, 0) };
    },
    entrar() { suave.ja(); pintarBarra(); marcarSujo(); },
    limitar(d) { distMaxCam = Math.max(1.5, Math.min(7, d)); },
    temAlgoAberto: () => ['es-form', 'es-org', 'es-guia', 'es-progresso'].some((id) => $(id) && $(id).classList.contains('aberto')) || !!estado.segurando || estado.selecionando,
    sair() {
      fecharLivro(); fecharForm(); fecharGuia(); fecharProgresso();
      if (org.aberto()) org.fechar();
      if (estado.selecionando) sairSelecao();
      definirHover(null);
    },
    segurarPorTitulo(titulo) {
      const l = livros.find((x) => norm(x.titulo) === norm(titulo));
      if (l) segurarLivro(l);
      return !!l;
    },
    livros: () => livros,
  };
}

// a página sozinha (estante.html?sozinha=1) se monta; embutida, quem chama é a casa
if (document.body && document.body.dataset.pagina === 'estante') montarEstante();
