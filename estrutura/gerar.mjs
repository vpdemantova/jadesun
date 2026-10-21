// Portal Solar · estrutura/gerar.mjs (21/out/2026, registro 114)
// Lê estrutura/dados.mjs (o mapa, as lentes, os moldes, os produtos) e os CSS de verdade
// (cores.css, forma.css, perfil.css) e escreve:
//   estrutura/figma/00-mapa.svg            o mapa do site (arraste para o Figma: vira camadas editáveis)
//   estrutura/figma/01-lentes.svg          as oito lentes, com um desenho de cada
//   estrutura/figma/02-produtos.svg        a escada da integração: ficha → casca → motor
//   estrutura/figma/03-moldes-1440.svg     os 15 moldes no computador, numa folha só
//   estrutura/figma/04-moldes-390.svg      os mesmos no celular
//   estrutura/figma/moldes-1440/*.svg, moldes-390/*.svg   um arquivo por molde (um quadro por arquivo)
//   estrutura/figma/variaveis.json            os tokens (W3C: $value/$type), que o Tokens Studio lê
//   e as tabelas do ESTRUTURA.md, entre os marcadores <!-- gerado:… --> e <!-- /gerado:… -->.
// uso: node estrutura/gerar.mjs
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LENTES, LENTE_DA_PAGINA, CENTRO, LADOS, MENU, FERRAMENTAS, MOLDES, PRODUTOS } from './dados.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..');
const SAIDA = join(AQUI, 'figma');

/* ---------- os tokens, lidos dos CSS (nada copiado à mão) ---------- */
const cores = readFileSync(join(RAIZ, 'cores.css'), 'utf8');
const forma = readFileSync(join(RAIZ, 'forma.css'), 'utf8');
const perfil = readFileSync(join(RAIZ, 'perfil.css'), 'utf8');
function temas() {
  const t = {};
  for (const m of cores.matchAll(/:root\[data-tema="([a-z-]+)"\]\[data-estilo\]\[data-acabamento\][^{]*\{([^}]*)\}/g)) {
    if (t[m[1]] || m[1] === 'auto') continue;
    const v = {}; for (const p of m[2].matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) v[p[1]] = p[2].trim();
    if (v.papel) t[m[1]] = v;
  }
  return t;
}
const TEMAS = temas();
const C = TEMAS.branco || { papel: '#FFFFFF', 'papel-2': '#F2F2F2', tinta: '#0B0B0B', suave: '#575757', fio: '#D6D6D6' };
function regua() {
  const r = {};
  for (const m of forma.matchAll(/--((?:e|r|h|t|z)-[a-z0-9]+|curva):\s*([^;]+);/g)) if (!(m[1] in r)) r[m[1]] = m[2].trim();
  return r;
}
const R = regua();
const fonteDe = (nome) => ((perfil.match(new RegExp(`--${nome}:\\s*([^;]+);`)) || [])[1] || '').split(',')[0].replace(/["']/g, '').trim();
const F_TIT = fonteDe('f-display') || 'Archivo';
const F_TXT = fonteDe('f-texto') || 'Newsreader';

/* ---------- SVG: o mínimo ---------- */
const x = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FT = `${F_TIT}, Arial, sans-serif`;
const FX = `${F_TXT}, Georgia, serif`;
function quebrar(texto, largura, px) {
  const cabe = Math.max(8, Math.floor(largura / px));
  const linhas = []; let atual = '';
  for (const p of String(texto || '').split(/\s+/).filter(Boolean)) {
    if ((atual + ' ' + p).trim().length > cabe && atual) { linhas.push(atual); atual = p; } else atual = (atual + ' ' + p).trim();
  }
  if (atual) linhas.push(atual);
  return linhas;
}
function texto(xx, y, s, o = {}) {
  const tam = o.tam || 14, peso = o.peso || 400, cor = o.cor || C.tinta, fam = o.serif ? FX : FT;
  return `<text x="${xx}" y="${y}" font-family="${x(fam)}" font-size="${tam}" font-weight="${peso}"${o.italico ? ' font-style="italic"' : ''} fill="${cor}"${o.meio ? ' text-anchor="middle"' : o.fim ? ' text-anchor="end"' : ''}>${x(s)}</text>`;
}
function paragrafo(xx, y, s, largura, o = {}) {
  const tam = o.tam || 13, entre = o.entre || Math.round(tam * 1.4);
  const ls = quebrar(s, largura, tam * (o.serif === false ? 0.56 : 0.5));
  return { svg: ls.map((l, i) => texto(xx, y + i * entre, l, { ...o, tam })).join(''), alt: ls.length * entre };
}
const caixa = (xx, y, w, h, o = {}) => `<rect x="${xx}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 6}" fill="${o.fundo || C['papel-2']}" stroke="${o.linha || C.fio}" stroke-width="1"${o.tracejado ? ' stroke-dasharray="6 5"' : ''}/>`;
const svg = (w, h, corpo, nome) => `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n<title>${x(nome)}</title>\n<rect id="Fundo" width="${w}" height="${h}" fill="${C.papel}"/>\n${corpo}\n</svg>\n`;
const grupo = (id, corpo) => `<g id="${x(id)}">${corpo}</g>`;

/* ---------- os moldes ---------- */
const PORTAS_MUNDO = MENU.mundo.map((id) => LADOS[0].portas.find((p) => p.id === id).nome);
const PORTAS_VOCE = MENU.voce.map((id) => LADOS[1].portas.find((p) => p.id === id).nome);
function normal(b) { return Array.isArray(b) ? { s: b[0], h: b[1], n: b[2], d: b[3] } : b; }

function barraCima1440(W) {
  let s = `<rect x="0" y="0" width="${W}" height="64" fill="${C.papel}"/><line x1="0" y1="64" x2="${W}" y2="64" stroke="${C.fio}"/>`;
  s += caixa(60, 16, 96, 32, { rx: 16, fundo: C.papel }) + texto(78, 37, 'Buscar', { tam: 14, peso: 600 }) + texto(180, 37, 'Nota', { tam: 14, peso: 600, cor: C.suave });
  /* as portas com o mesmo vão entre as palavras, a partir do Quadrado (a largura é estimada: 8,6 px por letra) */
  const meio = W / 2, VAO = 34, lw = (n) => n.length * 8.6;
  let xe = meio - 56;
  [...PORTAS_MUNDO].reverse().forEach((n) => { s += texto(xe, 37, n, { tam: 15, peso: 600, cor: C.suave, fim: true }); xe -= lw(n) + VAO; });
  s += `<rect x="${meio - 11}" y="21" width="22" height="22" fill="${C.tinta}"/>`;
  let xd = meio + 56;
  PORTAS_VOCE.forEach((n) => { s += texto(xd, 37, n, { tam: 15, peso: 600, cor: C.suave }); xd += lw(n) + VAO; });
  s += texto(W - 140, 37, 'Corrido', { tam: 14, peso: 600, cor: C.suave, fim: true }) + texto(W - 60, 37, 'Ajustes', { tam: 14, peso: 600, cor: C.suave, fim: true });
  return grupo('Barra de cima', s);
}
function barraBaixo1440(W, y) {
  let s = `<rect x="0" y="${y}" width="${W}" height="64" fill="${C.papel}"/><line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.fio}"/>`;
  s += texto(60, y + 37, 'Dentro de <porta>:', { tam: 13, peso: 500, cor: C.suave }) + texto(196, y + 37, 'as páginas da porta, a atual marcada', { tam: 14, peso: 600 });
  s += `<line x1="${W / 2}" y1="${y + 18}" x2="${W / 2}" y2="${y + 46}" stroke="${C.fio}"/>`;
  s += texto(W / 2 + 40, y + 37, 'os tópicos desta página, o atual acompanha a rolagem', { tam: 14, peso: 600 }) + texto(W - 60, y + 37, 'Nesta página', { tam: 13, peso: 500, cor: C.suave, fim: true });
  return grupo('Barra de baixo', s);
}
function bloco(xx, y, w, h, b) {
  let s = caixa(xx, y, w, h, { rx: 8 });
  if (h < 60) {
    s += texto(xx + 16, y + Math.min(h, 48) / 2 + 5, b.n, { tam: 14, peso: 700 });
    /* a nota numa linha só: corta com reticências na borda do bloco (6,4 px por letra, estimado) */
    const dx = Math.min(260, b.n.length * 8.4 + 16), cabe = Math.floor((w - 32 - dx) / 6.4);
    const nota = b.d && b.d.length > cabe ? b.d.slice(0, Math.max(0, cabe - 1)).replace(/[\s·,;]+$/, '') + '…' : b.d;
    if (nota && cabe > 4) s += texto(xx + 16 + dx, y + Math.min(h, 48) / 2 + 5, nota, { tam: 13, serif: true, cor: C.suave });
  } else {
    s += texto(xx + 16, y + 30, b.n, { tam: 16, peso: 700 });
    if (b.d) s += paragrafo(xx + 16, y + 52, b.d, w - 32, { tam: 13, serif: true, cor: C.suave }).svg;
  }
  return grupo(b.n, s);
}
function molde1440(m) {
  const W = 1440, M = 60, CAL = 24, COL = (W - 2 * M - 11 * CAL) / 12;
  const xDe = (c) => M + c * (COL + CAL), larg = (s) => s * COL + (s - 1) * CAL;
  let y = 64 + 40, corpo = '';
  for (const linha of m.linhas) {
    let c = 0, alt = 0;
    for (const bb of linha) { const b = normal(bb); c += b.o || 0; corpo += bloco(xDe(c), y, larg(b.s), b.h, b); c += b.s; alt = Math.max(alt, b.h); }
    y += alt + CAL;
  }
  const H = y + 40 + 64;
  return { W, H, svg: svg(W, H, barraCima1440(W) + grupo('Conteúdo', corpo) + barraBaixo1440(W, H - 64), `${m.nome} · 1440`) };
}
function molde390(m) {
  const W = 390, M = 16, larg = W - 2 * M;
  let y = 56 + 20, corpo = '';
  for (const linha of m.linhas) for (const bb of linha) {
    const b = normal(bb); if (b.cel === false) continue;
    /* no celular, o que era estreito (3 colunas ou menos) encolhe; o que era largo fica quase igual */
    const h = b.h390 || (b.s <= 3 ? Math.max(44, Math.min(140, Math.round(b.h * 0.45))) : Math.max(44, Math.min(520, Math.round(b.h * (b.h > 300 ? 0.7 : 0.9)))));
    corpo += bloco(M, y, larg, h, b); y += h + 12;
  }
  const H = y + 20 + 50 + 12 + 64;
  let cima = `<rect x="0" y="0" width="${W}" height="56" fill="${C.papel}"/><line x1="0" y1="56" x2="${W}" y2="56" stroke="${C.fio}"/>` +
    caixa(M, 12, 80, 32, { rx: 16, fundo: C.papel }) + texto(M + 14, 33, 'Buscar', { tam: 13, peso: 600 }) +
    `<rect x="${W / 2 - 10}" y="18" width="20" height="20" fill="${C.tinta}"/>` + texto(W - M, 33, 'Ajustes', { tam: 13, peso: 600, cor: C.suave, fim: true });
  const yb = H - 64 - 12 - 50;
  let baixo = caixa(8, yb, (W - 24) / 2, 50, { rx: 14, fundo: C.papel }) + texto(22, yb + 22, 'Dentro de <porta>', { tam: 11, cor: C.suave }) + texto(22, yb + 39, 'a página atual', { tam: 13, peso: 600 }) +
    caixa(16 + (W - 24) / 2, yb, (W - 24) / 2, 50, { rx: 14, fundo: C.papel }) + texto(30 + (W - 24) / 2, yb + 22, 'Nesta página', { tam: 11, cor: C.suave }) + texto(30 + (W - 24) / 2, yb + 39, 'o tópico atual', { tam: 13, peso: 600 });
  const ya = H - 64;
  baixo += `<rect x="0" y="${ya}" width="${W}" height="64" fill="${C.papel}"/><line x1="0" y1="${ya}" x2="${W}" y2="${ya}" stroke="${C.fio}"/>`;
  const ab = [PORTAS_MUNDO[2], PORTAS_MUNDO[3], '■', PORTAS_VOCE[0], PORTAS_VOCE[1]];
  ab.forEach((n, i) => { const cx = 39 + i * 78; baixo += n === '■' ? `<rect x="${cx - 10}" y="${ya + 22}" width="20" height="20" fill="${C.tinta}"/>` : texto(cx, ya + 37, n, { tam: 13, peso: 600, cor: C.suave, meio: true }); });
  return { W, H, svg: svg(W, H, grupo('Barra de cima', cima) + grupo('Conteúdo', corpo) + grupo('Barras de baixo', baixo), `${m.nome} · 390`) };
}
/* várias telas numa folha só, com o nome em cima de cada uma */
function folha(telas, colunas, nome) {
  const W = Math.max(...telas.map((t) => t.W));
  /* o título e a descrição quebram na largura do quadro (no celular, 390 px) */
  const estreito = W < 600, TT = estreito ? 20 : 26, ESP = 120;
  const cabeca = (t, i, xx, y) => { const ti = paragrafo(xx, y + TT + 4, `${String(i + 1).padStart(2, '0')} · ${t.nome}`, t.W, { tam: TT, peso: 800, serif: false, entre: TT + 4 }); const pa = paragrafo(xx, y + TT + 4 + ti.alt + 6, t.para, t.W, { tam: 14, serif: true, cor: C.suave }); return { svg: ti.svg + pa.svg, alt: TT + 4 + ti.alt + pa.alt + 6 }; };
  const TOPO = Math.max(...telas.map((t, i) => cabeca(t, i, 0, 0).alt)) + 16;
  let xx = 80, y = 80, alt = 0, corpo = '', larguraTotal = 0;
  telas.forEach((t, i) => {
    if (i && i % colunas === 0) { xx = 80; y += alt + TOPO + ESP; alt = 0; }
    corpo += `<g id="${x(t.nome)}">` + cabeca(t, i, xx, y).svg +
      `<g transform="translate(${xx} ${y + TOPO})"><rect width="${t.W}" height="${t.H}" fill="${C.papel}" stroke="${C.fio}"/>${t.svg.replace(/^[\s\S]*?<rect id="Fundo"[^>]*\/>/, '').replace(/<\/svg>\s*$/, '')}</g></g>`;
    alt = Math.max(alt, t.H); larguraTotal = Math.max(larguraTotal, xx + t.W); xx += W + ESP;
  });
  return svg(larguraTotal + 80, y + alt + TOPO + 80, corpo, nome);
}

/* ---------- o mapa do site ---------- */
function mapa() {
  const COL = 236, CAL = 20, M = 60, MEIO = 120;
  const mundo = MENU.mundo.map((id) => LADOS[0].portas.find((p) => p.id === id));
  const voce = MENU.voce.map((id) => LADOS[1].portas.find((p) => p.id === id));
  const W = M * 2 + 8 * COL + 6 * CAL + MEIO + 2 * CAL;
  let corpo = '';
  /* a raiz */
  corpo += grupo('A raiz', texto(W / 2, 70, 'Portal Solar', { tam: 40, peso: 800, meio: true }) +
    texto(W / 2, 102, 'o hub: uma lente sobre uma pasta de arquivos, com todos os produtos num lugar só', { tam: 17, serif: true, italico: true, cor: C.suave, meio: true }));
  const yLado = 150, yPorta = 230;
  const xPorta = (i) => (i < 4 ? M + i * (COL + CAL) : M + 4 * (COL + CAL) + MEIO + CAL + (i - 4) * (COL + CAL));
  /* os dois lados */
  const lado = (l, x0, x1) => grupo(l.nome, `<line x1="${x0}" y1="${yLado + 34}" x2="${x1}" y2="${yLado + 34}" stroke="${C.tinta}" stroke-width="2"/>` +
    texto(x0, yLado + 20, l.nome, { tam: 22, peso: 800 }) + texto(x1, yLado + 20, `estantes ${l.estantes}`, { tam: 14, serif: true, italico: true, cor: C.suave, fim: true }));
  corpo += lado(LADOS[0], xPorta(0), xPorta(3) + COL) + lado(LADOS[1], xPorta(4), xPorta(7) + COL);
  /* o Quadrado */
  const qx = W / 2;
  corpo += grupo('O Quadrado', `<rect x="${qx - 28}" y="${yPorta}" width="56" height="56" fill="${C.tinta}"/>` +
    paragrafo(qx - MEIO / 2 + 4, yPorta + 84, 'O Quadrado: o Índice de tudo (M); segurar abre a esfera', MEIO - 8, { tam: 12, serif: true, cor: C.suave }).svg);
  /* as portas e as páginas */
  let fundo = 0;
  [...mundo, ...voce].forEach((p, i) => {
    const px = xPorta(i);
    let s = `<rect x="${px}" y="${yPorta}" width="${COL}" height="64" rx="10" fill="${C.tinta}"/>` +
      texto(px + 16, yPorta + 28, p.nome + (p.nova ? '  (nova)' : ''), { tam: 18, peso: 800, cor: C.papel }) + texto(px + 16, yPorta + 50, p.pergunta, { tam: 14, serif: true, italico: true, cor: C.papel });
    let y = yPorta + 64 + 16;
    for (const pg of p.paginas) {
      const d = paragrafo(px + 14, y + 44, pg[2], COL - 28, { tam: 12, serif: true, cor: C.suave });
      const lt = paragrafo(px + 14, y + 44 + d.alt + 4, 'lentes: ' + pg[3], COL - 28, { tam: 11, cor: C.suave, serif: false });
      const h = 44 + d.alt + lt.alt + 10;
      s += grupo(pg[1], caixa(px, y, COL, h, { rx: 8 }) + texto(px + 14, y + 26, pg[1], { tam: 15, peso: 700 }) + d.svg + lt.svg);
      s += `<line x1="${px + 8}" y1="${y - 16}" x2="${px + 8}" y2="${y}" stroke="${C.fio}"/>`;
      y += h + 16;
    }
    fundo = Math.max(fundo, y);
    corpo += grupo(`Porta: ${p.nome}`, s);
  });
  /* as ferramentas, em toda página */
  let y = fundo + 30;
  let f = `<line x1="${M}" y1="${y}" x2="${W - M}" y2="${y}" stroke="${C.tinta}" stroke-width="2"/>` + texto(M, y + 34, 'Em toda página', { tam: 22, peso: 800 });
  const fw = (W - 2 * M - (FERRAMENTAS.length - 1) * CAL) / FERRAMENTAS.length;
  FERRAMENTAS.forEach((t, i) => {
    const fx = M + i * (fw + CAL);
    const d = paragrafo(fx + 14, y + 104, t[2], fw - 28, { tam: 12, serif: true, cor: C.suave });
    f += caixa(fx, y + 56, fw, 60 + d.alt, { rx: 8 }) + texto(fx + 14, y + 82, t[0] + (t[1] ? '  ' + t[1] : ''), { tam: 15, peso: 700 }) + d.svg;
  });
  corpo += grupo('Em toda página', f);
  const H = y + 56 + 140;
  return svg(W, H, corpo, 'Portal Solar · o mapa do site');
}

/* ---------- as lentes ---------- */
function desenhoLente(id, xx, y, w, h) {
  const t = C.tinta, s = C.suave, fi = C.fio, c2 = C['papel-2'];
  const r = (a, b, c, d, cor = fi, rx = 2) => `<rect x="${xx + a}" y="${y + b}" width="${c}" height="${d}" rx="${rx}" fill="${cor}"/>`;
  let o = '';
  if (id === 'corrido') { o += r(0, 0, w * 0.6, 12, t); [1, .96, 1, .9, .98, .7].forEach((k, i) => { o += r(0, 30 + i * 18, w * k, 7, s); }); }
  if (id === 'lista') for (let i = 0; i < 6; i++) o += r(0, i * 24, 14, 14, t) + r(24, i * 24 + 3, w * (0.5 + (i % 3) * 0.12), 8, s) + `<line x1="${xx}" y1="${y + i * 24 + 19}" x2="${xx + w}" y2="${y + i * 24 + 19}" stroke="${fi}"/>`;
  if (id === 'grade') for (let i = 0; i < 6; i++) { const cw = (w - 16) / 3; o += r((i % 3) * (cw + 8), Math.floor(i / 3) * 68, cw, 44, i === 0 ? t : fi, 4) + r((i % 3) * (cw + 8), Math.floor(i / 3) * 68 + 50, cw * 0.7, 6, s); }
  if (id === 'tabua') { for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) o += r(j * (w / 4), i * 22, w / 4 - 8, i === 0 ? 9 : 7, i === 0 ? t : s); for (let i = 1; i < 6; i++) o += `<line x1="${xx}" y1="${y + i * 22 - 7}" x2="${xx + w}" y2="${y + i * 22 - 7}" stroke="${fi}"/>`; }
  if (id === 'tempo') { o += `<line x1="${xx}" y1="${y + h - 30}" x2="${xx + w}" y2="${y + h - 30}" stroke="${t}" stroke-width="2"/>`; [[.06, '1543'], [.3, '1789'], [.52, '1859'], [.74, '1915'], [.94, '2026']].forEach(([k, a], i) => { const px = xx + w * k; o += `<line x1="${px}" y1="${y + h - 36}" x2="${px}" y2="${y + h - 24}" stroke="${t}"/>` + `<circle cx="${px}" cy="${y + h - 52 - (i % 2) * 26}" r="5" fill="${t}"/>` + texto(px, y + h - 6, a, { tam: 10, cor: s, meio: true }); }); }
  if (id === 'mapa') { o += `<ellipse cx="${xx + w / 2}" cy="${y + h / 2 - 6}" rx="${w / 2}" ry="${h / 2 - 12}" fill="${c2}" stroke="${fi}"/>` + `<path d="M${xx + w / 2} ${y + 6} Q ${xx + w * 0.7} ${y + h / 2} ${xx + w / 2} ${y + h - 18}" fill="none" stroke="${fi}"/>`; [[.3, .35], [.42, .55], [.62, .3], [.7, .6], [.2, .6], [.55, .45]].forEach(([a, b], i) => { o += `<circle cx="${xx + w * a}" cy="${y + h * b}" r="${i === 1 ? 6 : 3.5}" fill="${t}"/>`; }); }
  if (id === 'rede') { const cx = xx + w / 2, cy = y + h / 2 - 6; const ps = [[-.36, -.3], [.34, -.32], [.4, .28], [-.3, .34], [0, -.44], [-.46, .02], [.46, -.02]].map(([a, b]) => [cx + a * w, cy + b * h]); ps.forEach(([a, b]) => { o += `<line x1="${cx}" y1="${cy}" x2="${a}" y2="${b}" stroke="${fi}"/>`; }); o += `<line x1="${ps[0][0]}" y1="${ps[0][1]}" x2="${ps[4][0]}" y2="${ps[4][1]}" stroke="${fi}"/>`; ps.forEach(([a, b]) => { o += `<circle cx="${a}" cy="${b}" r="6" fill="${C.papel}" stroke="${t}"/>`; }); o += `<circle cx="${cx}" cy="${cy}" r="10" fill="${t}"/>`; }
  if (id === 'espaco') { const cx = xx + w / 2, cy = y + h / 2 + 4, a = 54; o += `<polygon points="${cx},${cy - a} ${cx + a},${cy - a / 2} ${cx},${cy} ${cx - a},${cy - a / 2}" fill="${c2}" stroke="${t}"/>` + `<polygon points="${cx - a},${cy - a / 2} ${cx},${cy} ${cx},${cy + a} ${cx - a},${cy + a / 2}" fill="${fi}" stroke="${t}"/>` + `<polygon points="${cx + a},${cy - a / 2} ${cx},${cy} ${cx},${cy + a} ${cx + a},${cy + a / 2}" fill="${C.papel}" stroke="${t}"/>`; }
  return o;
}
function lentes() {
  const CW = 330, CH = 330, CAL = 24, M = 60, COLS = 4;
  const W = M * 2 + COLS * CW + (COLS - 1) * CAL;
  let corpo = texto(M, 70, 'As lentes', { tam: 40, peso: 800 }) + texto(M, 104, 'o mesmo arquivo, outro olhar, nunca outra coisa; o corrido está em toda lente: é a lente desligada', { tam: 17, serif: true, italico: true, cor: C.suave });
  LENTES.forEach((l, i) => {
    const xx = M + (i % COLS) * (CW + CAL), y = 140 + Math.floor(i / COLS) * (CH + CAL);
    let s = caixa(xx, y, CW, CH, { rx: 14, fundo: C.papel }) + desenhoLente(l[0], xx + 24, y + 24, CW - 48, 150);
    s += texto(xx + 24, y + 210, l[1], { tam: 22, peso: 800 });
    s += paragrafo(xx + 24, y + 236, l[2] + '; para ' + l[3] + '.', CW - 48, { tam: 13, serif: true }).svg;
    s += paragrafo(xx + 24, y + 290, 'precisa: ' + l[5] + ' · vale em: ' + l[4], CW - 48, { tam: 11, cor: C.suave, serif: false, entre: 15 }).svg;
    corpo += grupo(`Lente: ${l[1]}`, s);
  });
  const y = 140 + 2 * (CH + CAL) + 10;
  corpo += grupo('A lente da página', texto(M, y + 20, 'A lente da página (um arquivo só):', { tam: 16, peso: 700 }) +
    LENTE_DA_PAGINA.map((p, i) => texto(M + 290 + i * 520, y + 20, `${p[0]}: ${p[1]}`, { tam: 14, serif: true, cor: C.suave })).join(''));
  return svg(W, y + 60, corpo, 'Portal Solar · as lentes');
}

/* ---------- os produtos: a escada da integração ---------- */
function produtos() {
  const NIV = [['ficha', 'Ficha', 'o produto tem a sua ficha nas Obras: o que é, quem fez, o estado, o endereço'], ['casca', 'Casca', 'abre dentro do hub: a mesma barra, as mesmas letras, o Quadrado, a volta num gesto'], ['motor', 'Motor', 'lê e escreve a mesma pasta, pela mesma Porta: local-first de verdade']];
  const CW = 520, CAL = 40, M = 60, W = M * 2 + 3 * CW + 2 * CAL;
  let corpo = texto(M, 70, 'Os produtos no hub', { tam: 40, peso: 800 }) + texto(M, 104, 'cada produto sobe um degrau de cada vez; o primeiro custa um arquivo .md', { tam: 17, serif: true, italico: true, cor: C.suave });
  let fundo = 0;
  NIV.forEach((n, i) => {
    const xx = M + i * (CW + CAL);
    let s = `<rect x="${xx}" y="140" width="${CW}" height="96" rx="12" fill="${C.tinta}"/>` + texto(xx + 20, 176, `${i + 1}. ${n[1]}`, { tam: 24, peso: 800, cor: C.papel }) + paragrafo(xx + 20, 204, n[2], CW - 40, { tam: 13, serif: true, cor: C.papel }).svg;
    let y = 260;
    for (const p of PRODUTOS.filter((pp) => pp[2] === n[0])) {
      const d = paragrafo(xx + 18, y + 48, p[1], CW - 36, { tam: 13, serif: true, cor: C.suave });
      const a = paragrafo(xx + 18, y + 48 + d.alt + 6, '→ ' + p[3], CW - 36, { tam: 12, cor: C.tinta, serif: false });
      const h = 48 + d.alt + a.alt + 14;
      s += grupo(p[0], caixa(xx, y, CW, h, { rx: 8 }) + texto(xx + 18, y + 28, p[0], { tam: 16, peso: 700 }) + d.svg + a.svg);
      y += h + 14;
    }
    if (i < 2) s += `<path d="M${xx + CW + 8} 188 L${xx + CW + CAL - 8} 188 M${xx + CW + CAL - 16} 181 L${xx + CW + CAL - 8} 188 L${xx + CW + CAL - 16} 195" fill="none" stroke="${C.tinta}" stroke-width="2"/>`;
    fundo = Math.max(fundo, y);
    corpo += grupo(`Degrau: ${n[1]}`, s);
  });
  return svg(W, fundo + 60, corpo, 'Portal Solar · os produtos no hub');
}

/* ---------- os tokens (W3C) ---------- */
function tokens() {
  const dim = (v) => ({ $type: 'dimension', $value: v });
  const t = {
    $description: 'Portal Solar: os tokens de design, lidos de cores.css, forma.css e perfil.css por estrutura/gerar.mjs. Licença CC BY-SA 4.0.',
    cor: {}, espaco: {}, canto: {}, altura: {}, tempo: {}, camada: {},
    curva: { entrar: { $type: 'cubicBezier', $value: (R.curva || '').replace(/cubic-bezier\(|\)/g, '').split(',').map(Number) } },
    fonte: { titulo: { $type: 'fontFamily', $value: F_TIT }, texto: { $type: 'fontFamily', $value: F_TXT }, codigo: { $type: 'fontFamily', $value: 'JetBrains Mono' } },
  };
  for (const [tema, v] of Object.entries(TEMAS)) t.cor[tema] = Object.fromEntries(Object.entries(v).map(([k, val]) => [k, { $type: 'color', $value: val }]));
  for (const [k, v] of Object.entries(R)) {
    if (k.startsWith('e-')) t.espaco[k] = dim(v);
    else if (k.startsWith('r-')) t.canto[k] = dim(v);
    else if (k.startsWith('h-')) t.altura[k] = dim(v);
    else if (k.startsWith('t-')) t.tempo[k] = { $type: 'duration', $value: v };
    else if (k.startsWith('z-')) t.camada[k] = { $type: 'number', $value: Number(v) };
  }
  return JSON.stringify(t, null, 2) + '\n';
}

/* ---------- as tabelas do ESTRUTURA.md ---------- */
const md = (s) => String(s == null ? '' : s).replace(/\|/g, '\\|');
function tabelas() {
  const g = {};
  g.lentes = '| Lente | O que mostra | Para quê | Vale em | Precisa nos arquivos | De onde vem hoje |\n|---|---|---|---|---|---|\n' +
    LENTES.map((l) => `| **${l[1]}** | ${md(l[2])} | ${md(l[3])} | ${md(l[4])} | ${md(l[5])} | ${md(l[6])} |`).join('\n') +
    '\n\nA lente da página (um arquivo só): ' + LENTE_DA_PAGINA.map((p) => `**${p[0]}** (${p[1]})`).join(' · ') + '.';
  const porta = (p) => `#### ${p.nome}${p.nova ? ' (nova)' : ''} · ${p.pergunta}\n\n| Página | O que é | Lentes | Molde | De onde vem hoje |\n|---|---|---|---|---|\n` +
    p.paginas.map((pg) => `| **${pg[1]}** | ${md(pg[2])} | ${md(pg[3])} | ${MOLDES.find((m) => m.id === pg[4]) ? MOLDES.find((m) => m.id === pg[4]).nome : pg[4]} | ${md(pg[5])} |`).join('\n');
  g.mapa = `**${CENTRO.nome}** (o centro): ${CENTRO.o_que}. Gesto: ${CENTRO.gesto}. Hoje: ${CENTRO.hoje}.\n\n` +
    LADOS.map((l) => `### ${l.nome} · estantes ${l.estantes}${l.publico ? ' · vai ao site público' : ' · fica no aparelho (o que for marcado público vai à vitrine)'}\n\n` +
      MENU[l.id].map((id) => porta(l.portas.find((p) => p.id === id))).join('\n\n')).join('\n\n') +
    '\n\n### Em toda página\n\n| Ferramenta | Tecla | O que faz |\n|---|---|---|\n' + FERRAMENTAS.map((f) => `| **${f[0]}** | ${f[1] || '·'} | ${md(f[2])} |`).join('\n');
  g.moldes = MOLDES.map((m, i) => `**${String(i + 1).padStart(2, '0')} · ${m.nome}** (${m.id}): ${m.para}.  \n` +
    m.linhas.map((ln) => '  ' + ln.map((bb) => { const b = normal(bb); return `${b.n} [${b.o ? '+' + b.o + ' ' : ''}${b.s}/12${b.cel === false ? ', some no celular' : ''}]`; }).join(' · ')).join('  \n')).join('\n\n');
  g.produtos = '| Produto | O que é | Hoje | Alvo |\n|---|---|---|---|\n' + PRODUTOS.map((p) => `| **${p[0]}** | ${md(p[1])} | ${p[2]} | ${md(p[3])} |`).join('\n');
  return g;
}
function costurar(arquivo, g) {
  if (!existsSync(arquivo)) return false;
  let t = readFileSync(arquivo, 'utf8');
  for (const [k, v] of Object.entries(g)) {
    const re = new RegExp(`(<!-- gerado:${k} -->)[\\s\\S]*?(<!-- /gerado:${k} -->)`);
    if (re.test(t)) t = t.replace(re, `$1\n${v}\n$2`);
  }
  writeFileSync(arquivo, t, 'utf8');
  return true;
}

/* ---------- escrever ---------- */
rmSync(SAIDA, { recursive: true, force: true });
mkdirSync(join(SAIDA, 'moldes-1440'), { recursive: true });
mkdirSync(join(SAIDA, 'moldes-390'), { recursive: true });
writeFileSync(join(SAIDA, '00-mapa.svg'), mapa());
writeFileSync(join(SAIDA, '01-lentes.svg'), lentes());
writeFileSync(join(SAIDA, '02-produtos.svg'), produtos());
const t1440 = [], t390 = [];
MOLDES.forEach((m, i) => {
  const n = `${String(i + 1).padStart(2, '0')}-${m.id}.svg`;
  const a = molde1440(m), b = molde390(m);
  writeFileSync(join(SAIDA, 'moldes-1440', n), a.svg); writeFileSync(join(SAIDA, 'moldes-390', n), b.svg);
  t1440.push({ ...a, nome: m.nome, para: m.para }); t390.push({ ...b, nome: m.nome, para: m.para });
});
writeFileSync(join(SAIDA, '03-moldes-1440.svg'), folha(t1440, 3, 'Portal Solar · os moldes em 1440'));
writeFileSync(join(SAIDA, '04-moldes-390.svg'), folha(t390, 5, 'Portal Solar · os moldes em 390'));
writeFileSync(join(SAIDA, 'variaveis.json'), tokens());
const ok = costurar(join(RAIZ, 'ESTRUTURA.md'), tabelas());
console.log(`figma/: o mapa, as lentes, os produtos, ${MOLDES.length} moldes em 1440 e 390, variaveis.json (${Object.keys(TEMAS).length} cores, ${Object.keys(R).length} medidas)` + (ok ? '; ESTRUTURA.md costurado' : '; ESTRUTURA.md ainda não existe'));
