/* Regras puras da estante (sem DOM, sem Three.js): onde cada livro cai no desenho da estante
   da casa. Usado pela Estante 3D e pelo painel Organizar, e testável em Node. */

export const norm = (s) => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

/* valores antigos do campo "Minha Estante" vinham com número na frente ("2 Ensaios") */
export const semNumero = (s) => String(s || '').replace(/^\s*\d+\s*[·:.\-]?\s*/, '');

export const chaveDe = (l) => `${l.titulo}␟${l.autor}`;
export const parDe = (l) => ({ titulo: l.titulo, autor: l.autor });

export function limparNome(s, max = 60) {
  return String(s == null ? '' : s).replace(/[|\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}
export const limparTag = (s) => limparNome(String(s).replace(/,/g, ' '));
export const limparLista = (s) => limparNome(String(s).replace(/[,:]/g, ' '));

/* tag -> { a, v } (índices em layout.andares[a][v]); a primeira ocorrência vence, de baixo pra cima */
export function mapaDeTags(layout) {
  const m = new Map();
  (layout.andares || []).forEach((vaos, a) => vaos.forEach((vao, v) => vao.tags.forEach((t) => { if (!m.has(t)) m.set(t, { a, v }); })));
  return m;
}

export function acharVaoPorNome(layout, nome) {
  const alvo = norm(nome), alvo2 = norm(semNumero(nome));
  if (!alvo) return null;
  const andares = layout.andares || [];
  for (let a = 0; a < andares.length; a++) {
    for (let v = 0; v < andares[a].length; v++) {
      const n = norm(andares[a][v].nome);
      if (n === alvo || n === alvo2) return { a, v };
    }
  }
  return null;
}

/* onde o livro fica: o vão forçado (campo "Minha Estante" com o nome de um vão) manda mais que
   a tag; senão vale a tag MAIS ESPECÍFICA do livro que tem vão (a que tem menos livros no acervo:
   "romance" ganha de "literatura"; empate: a que vem primeiro nas tags do livro); senão, sem lugar. */
export function lugarDoLivro(l, layout, mapa, contagem) {
  if (l.secaoReal) {
    const f = acharVaoPorNome(layout, l.secaoReal);
    if (f) return { ...f, motivo: 'forcado' };
  }
  const cand = (l.tags || []).map((t, i) => ({ t, i, p: mapa.get(t) })).filter((x) => x.p);
  if (!cand.length) return null;
  const n = (t) => (contagem && contagem.get(t)) || 0;
  cand.sort((a, b) => n(a.t) - n(b.t) || a.i - b.i);
  return { ...cand[0].p, motivo: 'tag', tag: cand[0].t };
}

/* distribui os livros nas células do desenho: Map "a:v" -> livros (ordenados por título) + os soltos */
export function distribuir(livros, layout, contagem) {
  const mapa = mapaDeTags(layout);
  const celulas = new Map();
  const soltos = [];
  for (const l of livros) {
    const p = lugarDoLivro(l, layout, mapa, contagem);
    if (!p) { soltos.push(l); continue; }
    const k = p.a + ':' + p.v;
    if (!celulas.has(k)) celulas.set(k, []);
    celulas.get(k).push(l);
  }
  const porTitulo = (x, y) => x.titulo.localeCompare(y.titulo, 'pt');
  celulas.forEach((arr) => arr.sort(porTitulo));
  soltos.sort(porTitulo);
  return { celulas, soltos };
}

export function posNaLista(l, nome) {
  const x = (l.listas || []).find((y) => y.nome === nome);
  return x ? x.pos : null;
}
export function livrosDaLista(livros, nome) {
  return livros.filter((l) => (l.listas || []).some((y) => y.nome === nome))
    .sort((x, y) => (posNaLista(x, nome) || 1e9) - (posNaLista(y, nome) || 1e9) || x.titulo.localeCompare(y.titulo, 'pt'));
}

/* todas as listas que existem: as do arquivo da estante (com descrição) + as que só aparecem nos livros */
export function listasConhecidas(livros, listasDoArquivo) {
  const saida = (listasDoArquivo || []).map((x) => ({ nome: x.nome, desc: x.desc || '' }));
  const vistos = new Set(saida.map((x) => x.nome));
  for (const l of livros) for (const x of l.listas || []) if (!vistos.has(x.nome)) { vistos.add(x.nome); saida.push({ nome: x.nome, desc: '' }); }
  return saida;
}

export function contarTags(livros) {
  const c = new Map();
  for (const l of livros) for (const t of l.tags || []) c.set(t, (c.get(t) || 0) + 1);
  return c;
}

/* ponto de partida: as 12 tags mais usadas, três vãos por andar. Só uma sugestão pra ter o que mexer. */
export function layoutInicial(livros) {
  const tags = [...contarTags(livros).entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt')).slice(0, 12).map(([t]) => t);
  const andares = [];
  for (let i = 0; i < tags.length; i += 3) {
    andares.push(tags.slice(i, i + 3).map((t) => ({ nome: t.charAt(0).toUpperCase() + t.slice(1), tags: [t] })));
  }
  return { andares: andares.length ? andares : [[{ nome: 'Vão', tags: [] }]], listas: [] };
}

export function copiarLayout(layout) {
  return { andares: layout.andares.map((vaos) => vaos.map((v) => ({ nome: v.nome, tags: v.tags.slice() }))), listas: (layout.listas || []).map((x) => ({ ...x })) };
}
