/* Regras puras do Guarda-roupa (sem DOM, sem Three.js): tipos de peça, cores por nome,
   onde cada peça fica no móvel e como um look se distribui no manequim. Testável em Node. */

export const norm = (s) => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

/* grupo: onde a peça vai no corpo (manequim). forma: silhueta quando pendurada. dobra: altura da peça dobrada (m). */
export const TIPOS = {
  camisa: { grupo: 'cima', forma: 'camisa', dobra: 0.035 },
  camiseta: { grupo: 'cima', forma: 'camiseta', dobra: 0.028 },
  blusa: { grupo: 'cima', forma: 'camiseta', dobra: 0.028 },
  polo: { grupo: 'cima', forma: 'camiseta', dobra: 0.03 },
  regata: { grupo: 'cima', forma: 'regata', dobra: 0.022 },
  'suéter': { grupo: 'cima', forma: 'manga-longa', dobra: 0.06 },
  moletom: { grupo: 'cima', forma: 'manga-longa', dobra: 0.065 },
  calça: { grupo: 'baixo', forma: 'calca', dobra: 0.045 },
  bermuda: { grupo: 'baixo', forma: 'bermuda', dobra: 0.04 },
  short: { grupo: 'baixo', forma: 'bermuda', dobra: 0.03 },
  saia: { grupo: 'baixo', forma: 'saia', dobra: 0.03 },
  vestido: { grupo: 'inteira', forma: 'vestido', dobra: 0.04 },
  macacão: { grupo: 'inteira', forma: 'vestido', dobra: 0.05 },
  casaco: { grupo: 'fora', forma: 'casaco', dobra: 0.075 },
  jaqueta: { grupo: 'fora', forma: 'jaqueta', dobra: 0.06 },
  blazer: { grupo: 'fora', forma: 'jaqueta', dobra: 0.05 },
  pijama: { grupo: 'casa', forma: 'camiseta', dobra: 0.05 },
  meia: { grupo: 'intima', forma: 'rolinho', dobra: 0.03 },
  'roupa íntima': { grupo: 'intima', forma: 'dobrada', dobra: 0.02 },
  sapato: { grupo: 'pe', forma: 'sapato' },
  'tênis': { grupo: 'pe', forma: 'tenis' },
  sandália: { grupo: 'pe', forma: 'sandalia' },
  bota: { grupo: 'pe', forma: 'bota' },
  chinelo: { grupo: 'pe', forma: 'sandalia' },
  cinto: { grupo: 'acessorio', forma: 'dobrada', dobra: 0.02 },
  'boné': { grupo: 'acessorio', forma: 'dobrada', dobra: 0.06 },
  cachecol: { grupo: 'acessorio', forma: 'dobrada', dobra: 0.03 },
  bolsa: { grupo: 'acessorio', forma: 'dobrada', dobra: 0.1 },
  toalha: { grupo: 'casa', forma: 'dobrada', dobra: 0.05 },
};
export const LISTA_TIPOS = Object.keys(TIPOS);
export function tipoDe(tipo) {
  const n = norm(tipo);
  const k = LISTA_TIPOS.find((t) => norm(t) === n) || LISTA_TIPOS.find((t) => n.includes(norm(t)));
  return k ? { nome: k, ...TIPOS[k] } : { nome: tipo || 'peça', grupo: 'cima', forma: 'camiseta', dobra: 0.035 };
}
export const ehCalcado = (p) => tipoDe(p.tipo).grupo === 'pe';

export const CORES = {
  branco: '#f1eee7', cru: '#e6dcc8', 'off-white': '#ece6d8', preto: '#1c1c1e', grafite: '#44474c', cinza: '#8b8e93', 'cinza-claro': '#c3c5c8',
  'azul-marinho': '#1f2d48', azul: '#3a62a4', 'azul-claro': '#a8c3e0', jeans: '#3d5d85', 'jeans-claro': '#7b98ba',
  verde: '#3e7a50', 'verde-oliva': '#676839', 'verde-escuro': '#2f4a36', menta: '#a9d6c0',
  vinho: '#6b1f2c', vermelho: '#b0342c', rosa: '#e2a6b3', coral: '#e57f6a', laranja: '#d8762f', terracota: '#b25d3d',
  amarelo: '#e2c04e', mostarda: '#c4972c', bege: '#d8c29f', caqui: '#b3a176', caramelo: '#a5673a', marrom: '#5c3c25',
  roxo: '#5a4280', 'lilás': '#b7a2d5',
};
export const LISTA_CORES = Object.keys(CORES);

/* "azul-marinho", "#1f2d48", "xadrez vermelho", "listrado azul e branco": cor base + padrão */
export function corDaPeca(cor) {
  const s = String(cor || '').trim();
  const n = norm(s);
  const hex = /#[0-9a-f]{6}\b/i.exec(s);
  const padrao = n.includes('xadrez') ? 'xadrez' : n.includes('listr') ? 'listras' : n.includes('estamp') || n.includes('floral') ? 'estampa' : '';
  const achadas = LISTA_CORES.filter((c) => new RegExp('(^|[^a-z-])' + norm(c).replace(/-/g, '\\-') + '($|[^a-z-])').test(n))
    .sort((a, b) => n.indexOf(norm(a)) - n.indexOf(norm(b)));
  const base = hex ? hex[0] : achadas.length ? CORES[achadas[0]] : '#9a9690';
  const segunda = achadas.length > 1 ? CORES[achadas[1]] : null;
  return { base, segunda, padrao };
}

/* estado → onde a peça aparece fora do móvel */
export function destinoEspecial(p) {
  const e = norm(p.estado);
  if (e.includes('lavar') || e.includes('suja')) return 'cesto';
  if (e.includes('doar') || e.includes('doacao')) return 'doar';
  return null;
}

export function acharParte(movel, nome) {
  const alvo = norm(nome);
  if (!alvo) return null;
  for (let m = 0; m < movel.length; m++) for (let i = 0; i < movel[m].length; i++) if (norm(movel[m][i].nome) === alvo) return { m, i };
  return null;
}

/* distribui as peças: Map "m:i" -> peças, + cesto (para lavar), doar e soltas (sem lugar válido) */
export function distribuir(pecas, movel) {
  const partes = new Map(), cesto = [], doar = [], soltas = [];
  for (const p of pecas) {
    const esp = destinoEspecial(p);
    if (esp === 'cesto') { cesto.push(p); continue; }
    if (esp === 'doar') { doar.push(p); continue; }
    const lugar = acharParte(movel, p.lugar);
    if (!lugar) { soltas.push(p); continue; }
    const k = lugar.m + ':' + lugar.i;
    if (!partes.has(k)) partes.set(k, []);
    partes.get(k).push(p);
  }
  return { partes, cesto, doar, soltas };
}

/* um look no manequim: uma peça por camada (a primeira de cada grupo) */
export function vestir(look, pecas) {
  const porNome = new Map(pecas.map((p) => [p.nome, p]));
  const camadas = { cima: null, fora: null, baixo: null, inteira: null, pe: null, outros: [] };
  for (const nome of (look && look.pecas) || []) {
    const p = porNome.get(nome);
    if (!p) continue;
    const g = tipoDe(p.tipo).grupo;
    if (g in camadas && g !== 'outros' && !camadas[g]) camadas[g] = p;
    else camadas.outros.push(p);
  }
  if (camadas.inteira) { camadas.outros.push(...[camadas.cima, camadas.baixo].filter(Boolean)); camadas.cima = null; camadas.baixo = null; }
  return camadas;
}

export function nomeUnico(nome, pecas, ignorar) {
  const base = String(nome || 'Peça').trim() || 'Peça';
  const usados = new Set(pecas.filter((p) => p !== ignorar).map((p) => norm(p.nome)));
  if (!usados.has(norm(base))) return base;
  for (let i = 2; i < 999; i++) if (!usados.has(norm(base + ' ' + i))) return base + ' ' + i;
  return base + ' ' + Date.now();
}

/* altura de cada divisão dentro de um módulo: gavetas/prateleiras/sapateira têm altura própria,
   os cabideiros dividem o que sobra (mínimo 0,9 m pra caber uma camisa) */
const ALT_FIXA = { prateleira: 0.3, gaveta: 0.19, sapateira: 0.34 };
export function alturasDasPartes(partes, alturaUtil) {
  const fixas = partes.map((p) => ALT_FIXA[p.tipo] || 0);
  const nCab = partes.filter((p) => p.tipo === 'cabideiro').length;
  let soma = fixas.reduce((a, b) => a + b, 0);
  if (!nCab) { const k = alturaUtil / Math.max(0.01, soma); return fixas.map((f) => f * k); }
  let sobra = alturaUtil - soma;
  let escala = 1;
  if (sobra < 0.9 * nCab) { escala = Math.max(0.4, (alturaUtil - 0.9 * nCab) / Math.max(0.01, soma)); sobra = alturaUtil - soma * escala; }
  return partes.map((p, i) => (p.tipo === 'cabideiro' ? sobra / nCab : fixas[i] * escala));
}
