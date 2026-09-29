/* Regras puras da Casa (sem DOM, sem Three.js): cômodos em planta, paredes que saem deles,
   portas e janelas, áreas, catálogo de móveis e paletas de estilo. Testável em Node.

   Coordenadas da planta, em metros: x cresce pra direita (leste), y cresce pra baixo na planta
   (vira +z no 3D, a frente). Lados de um cômodo: N (y menor, fundo), S (y maior, frente),
   L (x maior, leste), O (x menor, oeste). */

export const GRADE = 0.1;
export const ESP_PAREDE = 0.14;
export const norm = (s) => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
export const ajustar = (v, passo = GRADE) => Math.round(v / passo) * passo;
const r2 = (v) => Math.round(v * 1000) / 1000;

export const PISOS = ['madeira clara', 'madeira escura', 'cimento queimado', 'ladrilho hidráulico', 'pastilha azul', 'tatami', 'pedra', 'grama'];
export const PAREDES_ESPECIAIS = ['vidro', 'shoji', 'tijolo', 'madeira', 'nenhuma'];
export const FORMAS = ['retângulo', 'cilindro', 'cilindro hexagonal', 'pátio'];
export const ehCilindro = (c) => norm(c.forma).startsWith('cilindro');
export const ehPatio = (c) => norm(c.forma) === 'patio';

export const CORES = {
  branco: '#f2efe8', 'off-white': '#ebe4d6', creme: '#efe6d2', cinza: '#9a9c9f', grafite: '#45484d', preto: '#1c1c1e',
  vermelho: '#c9302a', 'vermelho vkhutemas': '#b8231d', amarelo: '#efbf2c', 'amarelo bauhaus': '#f2c12e', azul: '#2f5fae', 'azul bauhaus': '#1f4ea8',
  'azul pastilha': '#2e6fb5', 'azul-claro': '#a9c4e2', verde: '#3f7a52', 'verde-oliva': '#6b6a3a', 'verde tropical': '#2f6b43',
  terracota: '#b5623f', ocre: '#c79a45', rosa: '#dfa9a4', lilás: '#b6a3d3', 'madeira clara': '#c9a67a', 'madeira escura': '#6b4a32', freijó: '#b98a5e',
  'papel de arroz': '#f4efe2', tatami: '#c9bf8b', sumi: '#26221f',
};
export function corHex(cor, padrao = '#d9d2c5') {
  const s = String(cor || '').trim();
  if (/^#[0-9a-f]{6}$/i.test(s)) return s;
  const n = norm(s);
  const k = Object.keys(CORES).find((c) => norm(c) === n) || Object.keys(CORES).find((c) => n.includes(norm(c)));
  return k ? CORES[k] : padrao;
}

/* paletas de estilo: pra pintar paredes, pisos e móveis de uma vez (e pra inspirar) */
export const ESTILOS = {
  livre: { nome: 'Livre', cores: ['branco', 'off-white', 'madeira clara', 'verde', 'azul-claro', 'terracota', 'grafite'], pisos: ['madeira clara', 'cimento queimado'] },
  bauhaus: { nome: 'Bauhaus', cores: ['branco', 'preto', 'vermelho', 'amarelo bauhaus', 'azul bauhaus', 'cinza'], pisos: ['cimento queimado', 'madeira escura'] },
  vkhutemas: { nome: 'VKHUTEMAS / construtivismo', cores: ['creme', 'preto', 'vermelho vkhutemas', 'cinza', 'ocre'], pisos: ['madeira escura', 'cimento queimado'] },
  modernismo: { nome: 'Modernismo brasileiro', cores: ['branco', 'azul pastilha', 'freijó', 'verde tropical', 'terracota'], pisos: ['pastilha azul', 'madeira clara', 'pedra'] },
  japonesa: { nome: 'Japonesa', cores: ['papel de arroz', 'madeira clara', 'tatami', 'sumi', 'verde-oliva'], pisos: ['tatami', 'madeira clara'] },
};

/* ---------- móveis: medidas reais aproximadas (m), cor padrão e grupo ---------- */
export const MOVEIS = {
  cama: { nome: 'Cama de casal', larg: 1.45, prof: 2.0, alt: 0.5, cor: 'branco', grupo: 'quarto' },
  'cama de solteiro': { nome: 'Cama de solteiro', larg: 0.95, prof: 2.0, alt: 0.5, cor: 'branco', grupo: 'quarto' },
  futon: { nome: 'Futon', larg: 1.0, prof: 2.0, alt: 0.12, cor: 'papel de arroz', grupo: 'quarto' },
  'criado-mudo': { nome: 'Criado-mudo', larg: 0.45, prof: 0.4, alt: 0.55, cor: 'madeira clara', grupo: 'quarto' },
  cômoda: { nome: 'Cômoda', larg: 1.0, prof: 0.5, alt: 0.85, cor: 'madeira clara', grupo: 'quarto' },
  escrivaninha: { nome: 'Escrivaninha', larg: 1.2, prof: 0.6, alt: 0.75, cor: 'madeira clara', grupo: 'estudo' },
  cadeira: { nome: 'Cadeira', larg: 0.46, prof: 0.5, alt: 0.85, cor: 'madeira clara', grupo: 'estudo' },
  'cadeira tubular': { nome: 'Poltrona tubular (Bauhaus)', larg: 0.78, prof: 0.7, alt: 0.73, cor: 'preto', grupo: 'estar' },
  'estante de partitura': { nome: 'Estante de partitura', larg: 0.5, prof: 0.45, alt: 1.3, cor: 'preto', grupo: 'música' },
  piano: { nome: 'Piano vertical', larg: 1.5, prof: 0.62, alt: 1.25, cor: 'preto', grupo: 'música' },
  'piano de cauda': { nome: 'Piano de cauda', larg: 1.5, prof: 1.9, alt: 1.0, cor: 'preto', grupo: 'música' },
  sofá: { nome: 'Sofá', larg: 2.1, prof: 0.9, alt: 0.8, cor: 'grafite', grupo: 'estar' },
  poltrona: { nome: 'Poltrona', larg: 0.85, prof: 0.85, alt: 0.8, cor: 'terracota', grupo: 'estar' },
  'mesa de centro': { nome: 'Mesa de centro', larg: 1.0, prof: 0.6, alt: 0.4, cor: 'madeira escura', grupo: 'estar' },
  'mesa baixa': { nome: 'Mesa baixa (chabudai)', larg: 1.1, prof: 0.75, alt: 0.33, cor: 'madeira clara', grupo: 'estar' },
  mesa: { nome: 'Mesa de jantar', larg: 1.6, prof: 0.9, alt: 0.75, cor: 'madeira clara', grupo: 'cozinha' },
  'mesa redonda': { nome: 'Mesa redonda', larg: 1.1, prof: 1.1, alt: 0.75, cor: 'madeira escura', grupo: 'cozinha' },
  tapete: { nome: 'Tapete', larg: 2.0, prof: 1.4, alt: 0.01, cor: 'terracota', grupo: 'estar' },
  luminária: { nome: 'Luminária de pé', larg: 0.35, prof: 0.35, alt: 1.6, cor: 'preto', grupo: 'estar' },
  planta: { nome: 'Planta', larg: 0.5, prof: 0.5, alt: 1.0, cor: 'verde', grupo: 'estar' },
  árvore: { nome: 'Árvore', larg: 2.0, prof: 2.0, alt: 5.0, cor: 'verde tropical', grupo: 'jardim' },
  estante: { nome: 'Estante (seus livros)', larg: 1.6, prof: 0.35, alt: 2.0, cor: 'madeira clara', grupo: 'estudo', liga: 'estante' },
  'guarda-roupa': { nome: 'Guarda-roupa (suas roupas)', larg: 1.8, prof: 0.6, alt: 2.2, cor: 'branco', grupo: 'quarto', liga: 'guarda-roupa' },
  bancada: { nome: 'Bancada com pia', larg: 2.0, prof: 0.6, alt: 0.9, cor: 'branco', grupo: 'cozinha' },
  fogão: { nome: 'Fogão', larg: 0.6, prof: 0.6, alt: 0.9, cor: 'cinza', grupo: 'cozinha' },
  geladeira: { nome: 'Geladeira', larg: 0.7, prof: 0.7, alt: 1.8, cor: 'branco', grupo: 'cozinha' },
  vaso: { nome: 'Vaso sanitário', larg: 0.4, prof: 0.65, alt: 0.4, cor: 'branco', grupo: 'banheiro' },
  pia: { nome: 'Pia de banheiro', larg: 0.6, prof: 0.45, alt: 0.85, cor: 'branco', grupo: 'banheiro' },
  chuveiro: { nome: 'Box com chuveiro', larg: 0.9, prof: 0.9, alt: 2.0, cor: 'branco', grupo: 'banheiro' },
};
export const LISTA_MOVEIS = Object.keys(MOVEIS);
export const tipoMovel = (t) => {
  const n = norm(t);
  const k = LISTA_MOVEIS.find((x) => norm(x) === n) || LISTA_MOVEIS.find((x) => n.includes(norm(x)));
  return k ? { tipo: k, ...MOVEIS[k] } : { tipo: t || 'caixa', nome: t || 'Objeto', larg: 0.6, prof: 0.6, alt: 0.6, cor: 'cinza', grupo: 'outros' };
};

/* ---------- geometria ---------- */
export const area = (c) => (ehCilindro(c) ? Math.PI * (c.largura / 2) * (c.profundidade / 2) : c.largura * c.profundidade);
export function comodoNoPonto(comodos, x, y) {
  // o menor cômodo que contém o ponto (se houver sobreposição, o mais específico vence)
  let melhor = null;
  for (const c of comodos) {
    if (x < c.x || x > c.x + c.largura || y < c.y || y > c.y + c.profundidade) continue;
    if (ehCilindro(c)) {
      const cx = c.x + c.largura / 2, cy = c.y + c.profundidade / 2;
      if (((x - cx) / (c.largura / 2)) ** 2 + ((y - cy) / (c.profundidade / 2)) ** 2 > 1) continue;
    }
    if (!melhor || area(c) < area(melhor)) melhor = c;
  }
  return melhor;
}

/* o segmento de um lado do cômodo, na planta */
export function ladoDoComodo(c, lado) {
  const x0 = c.x, y0 = c.y, x1 = c.x + c.largura, y1 = c.y + c.profundidade;
  return { N: { a: [x0, y0], b: [x1, y0] }, S: { a: [x0, y1], b: [x1, y1] }, O: { a: [x0, y0], b: [x0, y1] }, L: { a: [x1, y0], b: [x1, y1] } }[lado];
}

/* Paredes retas: cada lado de cada cômodo retangular vira trechos; um trecho que dois cômodos
   dividem vira UMA parede interna (não duas grudadas); o resto é parede externa.
   Cômodos "cilindro" e "pátio" não entram aqui (o cilindro tem parede curva própria; o pátio não tem). */
export function paredesRetas(comodos) {
  const linhas = new Map(); // "h:y" ou "v:x" -> lista de { ini, fim, dono, lado }
  const soma = (chave, item) => { if (!linhas.has(chave)) linhas.set(chave, []); linhas.get(chave).push(item); };
  comodos.forEach((c, idx) => {
    if (ehCilindro(c) || ehPatio(c) || norm(c.parede) === 'nenhuma') return;
    const x0 = r2(c.x), y0 = r2(c.y), x1 = r2(c.x + c.largura), y1 = r2(c.y + c.profundidade);
    soma('h:' + y0, { ini: x0, fim: x1, dono: idx, lado: 'N' });
    soma('h:' + y1, { ini: x0, fim: x1, dono: idx, lado: 'S' });
    soma('v:' + x0, { ini: y0, fim: y1, dono: idx, lado: 'O' });
    soma('v:' + x1, { ini: y0, fim: y1, dono: idx, lado: 'L' });
  });
  const paredes = [];
  linhas.forEach((itens, chave) => {
    const [eixo, pos] = [chave[0], +chave.slice(2)];
    const cortes = [...new Set(itens.flatMap((i) => [i.ini, i.fim]))].sort((a, b) => a - b);
    let atual = null;
    for (let k = 0; k < cortes.length - 1; k++) {
      const a = cortes[k], b = cortes[k + 1];
      const meio = (a + b) / 2;
      const donos = itens.filter((i) => i.ini <= meio && i.fim >= meio).map((i) => ({ dono: i.dono, lado: i.lado }));
      const assinatura = donos.map((d) => d.dono + d.lado).sort().join(',');
      if (!donos.length) { if (atual) { paredes.push(atual); atual = null; } continue; }
      if (atual && atual.assinatura === assinatura && Math.abs(atual.fim - a) < 1e-6) { atual.fim = b; continue; }
      if (atual) paredes.push(atual);
      atual = { eixo, pos, ini: a, fim: b, donos, assinatura, interna: new Set(donos.map((d) => d.dono)).size > 1 };
    }
    if (atual) paredes.push(atual);
  });
  return paredes.map(({ assinatura, ...p }) => p);
}

/* aberturas (portas/janelas) de um cômodo, convertidas pra coordenadas da linha da parede */
export function aberturasNaLinha(comodos, aberturas) {
  const out = [];
  aberturas.forEach((ab) => {
    const c = comodos.find((x) => norm(x.nome) === norm(ab.comodo));
    if (!c) return;
    const lado = String(ab.lado || 'S').toUpperCase();
    const horizontal = lado === 'N' || lado === 'S';
    const pos = horizontal ? (lado === 'N' ? c.y : c.y + c.profundidade) : (lado === 'O' ? c.x : c.x + c.largura);
    const base = horizontal ? c.x : c.y;
    const comprimento = horizontal ? c.largura : c.profundidade;
    const larg = Math.min(ab.largura || 0.9, comprimento - 0.1);
    const ini = base + Math.max(0.05, Math.min(comprimento - larg - 0.05, ab.posicao != null ? ab.posicao : (comprimento - larg) / 2));
    const porta = norm(ab.tipo) === 'porta';
    out.push({
      eixo: horizontal ? 'h' : 'v', pos: r2(pos), ini: r2(ini), fim: r2(ini + larg), porta, nivel: c.nivel || 0,
      base: porta ? 0 : (ab.peitoril != null ? ab.peitoril : 0.9), topo: porta ? (ab.altura || 2.1) : (ab.peitoril != null ? ab.peitoril : 0.9) + (ab.altura || 1.2),
      ref: ab,
    });
  });
  return out;
}

/* trechos sólidos de uma parede com vãos: [{ ini, fim, base, topo }] */
export function trechosSolidos(parede, aberturas, altura) {
  const vaos = aberturas.filter((a) => a.eixo === parede.eixo && Math.abs(a.pos - parede.pos) < 1e-6 && a.fim > parede.ini && a.ini < parede.fim)
    .map((a) => ({ ...a, ini: Math.max(a.ini, parede.ini), fim: Math.min(a.fim, parede.fim) })).sort((a, b) => a.ini - b.ini);
  const trechos = [];
  let x = parede.ini;
  for (const v of vaos) {
    if (v.ini > x + 1e-6) trechos.push({ ini: x, fim: v.ini, base: 0, topo: altura });
    if (v.base > 1e-6) trechos.push({ ini: v.ini, fim: v.fim, base: 0, topo: v.base });
    if (v.topo < altura - 1e-6) trechos.push({ ini: v.ini, fim: v.fim, base: v.topo, topo: altura });
    x = Math.max(x, v.fim);
  }
  if (x < parede.fim - 1e-6) trechos.push({ ini: x, fim: parede.fim, base: 0, topo: altura });
  return { trechos, vaos };
}

/* limites da casa (pra enquadrar câmera e sombra) */
export function limites(comodos, moveis = []) {
  if (!comodos.length) return { x0: -3, y0: -3, x1: 3, y1: 3 };
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  comodos.forEach((c) => { x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y); x1 = Math.max(x1, c.x + c.largura); y1 = Math.max(y1, c.y + c.profundidade); });
  moveis.forEach((m) => { x0 = Math.min(x0, m.x - 0.5); y0 = Math.min(y0, m.y - 0.5); x1 = Math.max(x1, m.x + 0.5); y1 = Math.max(y1, m.y + 0.5); });
  return { x0, y0, x1, y1 };
}

export function nomeUnico(base, usados) {
  const u = new Set(usados.map(norm));
  if (!u.has(norm(base))) return base;
  for (let i = 2; i < 999; i++) if (!u.has(norm(base + ' ' + i))) return base + ' ' + i;
  return base + ' ' + Date.now();
}
