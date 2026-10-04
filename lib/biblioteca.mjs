import { readFile, readdir } from 'node:fs/promises';
import { join, posix } from 'node:path';
import { COFRE, PROIBIDO, normalizar } from './vault.mjs';

const BASE = '2 Academy';
const IMG_RE = /\.(jpe?g|png|gif|webp|svg)$/i;
const colador = new Intl.Collator('pt', { numeric: true, sensitivity: 'base' });

const ACERVOS = [
  { id: 'selecao', nome: 'Seleção', descricao: 'As doze matérias do vestibular: estudos com imagens, curiosidades, exercícios e conexões.' },
  { id: 'atlas', nome: 'Atlas', descricao: 'Elementos, matérias-primas, componentes, objetos, ofícios, espécies, mitologia, línguas, pessoas e obras.' },
  { id: 'guias', nome: 'Guias', descricao: 'Guias de expressão: como se faz música, escrita, arte.' },
  { id: 'fundacao', nome: 'Fundação', descricao: 'Outras bases científicas, fora da Seleção.' },
  { id: 'aulas', nome: 'Aulas', descricao: 'Aulas, lições e contexto: o seu método de estudo e os planos.' },
];

const ROTULOS_ATLAS = {
  '0 Tábuas': 'Tábuas',
  '1 Kingdoms': 'Reinos e países',
  '1 Maps': 'Mapas',
  '1 Timelines': 'Linhas do tempo (eras)',
  '2 Work': 'Obras',
  '3 People': 'Pessoas',
  '5 Groups': 'Escolas e grupos',
  'a Elements': 'Elementos',
  'b Raws': 'Matérias-primas',
  'c Components': 'Componentes',
  'cb Computers': 'Computação',
  'd Objects': 'Objetos e instrumentos',
  'f Ofícios': 'Ofícios',
  'g Species': 'Espécies',
  'h Mitologia': 'Mitologia',
  'i Línguas': 'Línguas',
  'j Conceitos': 'Conceitos',
};

const ROTULOS_HIERARQUIA = ['Acima', 'Pré-requisito', 'Ao lado', 'Abaixo', 'Abre'];

export function slug(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function limparPasta(nome) {
  return nome.replace(/^(\d+|[a-z]{1,2})\s+(?=\S)/, '').trim() || nome;
}

function limparMd(t) {
  return String(t)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]#]+)(?:#[^\]]*)?\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function urlMidia(rel) {
  return `/midia?p=${encodeURIComponent(rel)}`;
}

export function caminhoMidia(p) {
  const rel = posix.normalize(String(p || '').replace(/\\/g, '/'));
  if (!rel.startsWith(`${BASE}/`) || rel.includes('..') || !IMG_RE.test(rel) || PROIBIDO.test(rel)) return null;
  return join(COFRE, rel);
}

function separar(texto) {
  const t = texto.replace(/^﻿/, '');
  const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, corpo: t };
  const meta = {};
  for (const l of m[1].split(/\r?\n/)) {
    const k = l.match(/^([^:#\s][^:]*):\s*(.*)$/);
    if (k) meta[k[1].trim()] = k[2].trim().replace(/^["']|["']$/g, '');
  }
  return { meta, corpo: t.slice(m[0].length) };
}

function semCodigo(corpo) {
  const linhas = corpo.split(/\r?\n/);
  let cerca = false;
  return linhas.map((l) => {
    if (/^\s*(```|~~~)/.test(l)) { cerca = !cerca; return null; }
    return cerca ? null : l;
  }).filter((l) => l !== null);
}

function resumir(corpo) {
  const frase = corpo.match(/\*\*Em uma frase:\*\*\s*([^\n]+)/);
  if (frase) return limparMd(frase[1]).slice(0, 220);
  let vistoTitulo = false;
  for (const l of semCodigo(corpo)) {
    const t = l.trim();
    if (!t) continue;
    if (/^#\s/.test(t)) { vistoTitulo = true; continue; }
    if (/^(#{2,}|!\[|\||---|<|\*\*?\s*$|>?\s*\*\*(Pré|Abre|Acima|Abaixo))/.test(t) || /^\*Da \[Wikip/.test(t)) continue;
    const limpo = limparMd(t.replace(/^[-*]\s+/, ''));
    if (limpo.length >= 30 || (vistoTitulo && limpo.length >= 12)) return limpo.slice(0, 220);
  }
  return '';
}

function classificar(rel) {
  const p = rel.split('/').slice(1);
  const nomeArq = p[p.length - 1].replace(/\.md$/i, '');
  let acervo = 'fundacao';
  let secao = '';
  let sub = '';
  const dirs = p.slice(0, -1);
  if (/^1 Fundação/.test(dirs[0] || '') && dirs[1] === 'Selecao') {
    acervo = 'selecao';
    secao = dirs[2] ? limparPasta(dirs[2]) : 'Mapa e guias';
    sub = dirs[3] ? limparPasta(dirs[3]) : '';
  } else if (/^3 Atlas/.test(dirs[0] || '')) {
    acervo = 'atlas';
    secao = dirs[1] ? (ROTULOS_ATLAS[dirs[1]] || limparPasta(dirs[1])) : 'Geral';
    sub = dirs[2] ? limparPasta(dirs[2]) : '';
  } else if (/^2 Guias/.test(dirs[0] || '')) {
    acervo = 'guias';
    secao = dirs[1] ? limparPasta(dirs[1]) : 'Geral';
    sub = dirs[2] ? limparPasta(dirs[2]) : '';
  } else if (/^0 Aulas/.test(dirs[0] || '')) {
    acervo = 'aulas';
    secao = dirs[1] ? limparPasta(dirs[1]) : 'Geral';
    sub = dirs[2] ? limparPasta(dirs[2]) : '';
  } else {
    secao = dirs[1] ? limparPasta(dirs[1]) : 'Geral';
    sub = dirs[2] ? limparPasta(dirs[2]) : '';
  }
  return { acervo, secao, sub, nomeArq, pasta: dirs.join('/') };
}

function idBase(rel) {
  const p = rel.replace(/\.md$/i, '').split('/').slice(1);
  const troca = { '3 Atlas - Referência e Contemplação': 'atlas', '2 Guias - Expressões Manifestas': 'guias', '0 Aulas - Lições e Contexto': 'aulas', '1 Fundação - Base Científica': 'fundacao' };
  const segs = p.map((s, i) => (i === 0 && troca[s]) || slug(s)).filter(Boolean);
  if (segs[0] === 'fundacao' && segs[1] === 'selecao') segs.splice(0, 2, 'selecao');
  return segs.join('/');
}

async function andar(relDir, mds, imgs) {
  if (PROIBIDO.test(relDir)) return;
  let entradas;
  try { entradas = await readdir(join(COFRE, relDir), { withFileTypes: true }); } catch { return; }
  for (const e of entradas) {
    if (e.name.startsWith('.')) continue;
    const r = `${relDir}/${e.name}`;
    if (PROIBIDO.test(r)) continue;
    if (e.isDirectory()) {
      if (/^zz\b/.test(e.name)) continue;
      await andar(r, mds, imgs);
    } else if (/\.md$/i.test(e.name)) mds.push(r);
    else if (IMG_RE.test(e.name)) imgs.add(r);
  }
}

async function lerCreditos(imgs) {
  const mapa = new Map();
  const rel = `${BASE}/1 Fundação - Base Científica/Selecao/03 Créditos das Imagens.md`;
  let texto = '';
  try { texto = await readFile(join(COFRE, rel), 'utf8'); } catch { return mapa; }
  for (const l of texto.split(/\r?\n/)) {
    const m = l.match(/^\|\s*`([^`]+)`\s*\|\s*\[([^\]]*)\]\(([^)]+)\)\s*\|\s*([^|]*)\|\s*([^|]*)\|/);
    if (m) mapa.set(m[1], { fonte: m[3], autor: m[4].trim(), licenca: m[5].trim() });
  }
  return mapa;
}

let memo = null;
let memoEm = 0;
let emAndamento = null;

async function construir() {
  const mds = [];
  const imgs = new Set();
  await andar(BASE, mds, imgs);
  const creditos = await lerCreditos(imgs);
  const porNomeImg = new Map();
  for (const r of imgs) { const n = r.split('/').pop().toLowerCase(); if (!porNomeImg.has(n)) porNomeImg.set(n, r); }

  const itens = [];
  const usados = new Set();
  for (let i = 0; i < mds.length; i += 40) {
    await Promise.all(mds.slice(i, i + 40).map(async (rel) => {
      let texto;
      try { texto = await readFile(join(COFRE, rel), 'utf8'); } catch { return; }
      const { meta, corpo } = separar(texto);
      const cls = classificar(rel);
      let id = idBase(rel);
      itens.push({ rel, id, meta, corpo, cls });
    }));
  }
  itens.sort((a, b) => colador.compare(a.rel, b.rel));
  for (const it of itens) {
    let id = it.id; let n = 2;
    while (usados.has(id)) id = `${it.id}-${n++}`;
    usados.add(id);
    it.id = id;
    it.nome = it.cls.nomeArq;
    const h1 = it.corpo.match(/^#\s+(.+)$/m);
    it.titulo = limparMd(h1 ? h1[1] : it.nome) || it.nome;
    it.tipo = it.meta.tipo || (it.meta.formato === 'wiki' ? 'estudo' : '');
    it.codigo = (it.meta.codigo || (it.nome.match(/^([A-Z]{3}-\d{2})\b/) || [])[1] || '').toUpperCase();
    it.resumo = resumir(it.corpo);
    it.busca = normalizar(`${it.titulo} ${it.corpo}`);
    it.imagens = imagensDe(it, it.corpo, imgs, porNomeImg, creditos);
    it.capa = it.imagens[0] ? it.imagens[0].rel : null;
  }

  const porNome = new Map();
  const porCodigo = new Map();
  const porSlug = new Map();
  const porRel = new Map();
  const juntar = (mapa, k, id) => { if (!k) return; if (!mapa.has(k)) mapa.set(k, []); mapa.get(k).push(id); };
  for (const it of itens) {
    juntar(porNome, normalizar(it.nome), it.id);
    if (it.codigo) porCodigo.set(normalizar(it.codigo), it.id);
    const partes = it.rel.replace(/\.md$/i, '').split('/');
    juntar(porSlug, `${slug(partes[partes.length - 2] || '')}/${slug(partes[partes.length - 1])}`, it.id);
    juntar(porSlug, slug(partes[partes.length - 1]), it.id);
    porRel.set(it.rel, it.id);
  }
  const contexto = { itens, porNome, porCodigo, porSlug, porRel, imgs, porNomeImg, creditos, porId: new Map(itens.map((x) => [x.id, x])) };

  for (const it of itens) {
    it.saem = new Set();
    for (const alvo of extrairAlvos(it.corpo)) {
      const id = resolverAlvo(contexto, it, alvo);
      if (id && id !== it.id) it.saem.add(id);
    }
  }
  for (const it of itens) it.chegam = new Set();
  for (const it of itens) for (const id of it.saem) contexto.porId.get(id).chegam.add(it.id);

  const secoes = new Map();
  for (const it of itens) {
    const chave = `${it.cls.acervo}/${slug(it.cls.secao)}`;
    it.secaoId = chave;
    if (!secoes.has(chave)) secoes.set(chave, { id: chave, acervo: it.cls.acervo, nome: it.cls.secao, ordem: it.rel, total: 0, imagens: 0, subs: new Map(), com: [] });
    const s = secoes.get(chave);
    s.total += 1;
    s.imagens += it.imagens.length;
    if (it.cls.sub) s.subs.set(it.cls.sub, (s.subs.get(it.cls.sub) || 0) + 1);
    if (it.capa) s.com.push(it);
  }

  const acervos = ACERVOS.map((a) => {
    const lista = [...secoes.values()].filter((s) => s.acervo === a.id).sort((x, y) => colador.compare(x.ordem, y.ordem));
    return {
      ...a,
      total: lista.reduce((n, s) => n + s.total, 0),
      secoes: lista.map((s) => ({
        id: s.id, nome: s.nome, total: s.total, imagens: s.imagens,
        subs: [...s.subs].map(([nome, total]) => ({ nome, total })),
        capas: s.com.slice().sort((x, y) => y.imagens.length - x.imagens.length).slice(0, 4).map((x) => urlMidia(x.capa)),
      })),
    };
  }).filter((a) => a.total > 0);

  return { ...contexto, acervos, gerado: new Date().toISOString(), totalImagens: imgs.size };
}

function imagensDe(item, texto, imgs, porNomeImg, creditos) {
  const dir = posix.dirname(item.rel);
  const vistas = new Map();
  const achar = (ref) => {
    const limpo = decodeURI(String(ref).trim().replace(/^<|>$/g, ''));
    if (/^(https?:|data:|\/)/i.test(limpo)) return null;
    const rel = posix.normalize(posix.join(dir, limpo));
    if (imgs.has(rel)) return rel;
    return porNomeImg.get(posix.basename(limpo).toLowerCase()) || null;
  };
  const somar = (rel, legenda, extra) => {
    if (!rel || vistas.has(rel)) return;
    const c = creditos.get(posix.basename(rel)) || {};
    vistas.set(rel, { rel, legenda: legenda || '', autor: c.autor || '', licenca: c.licenca || '', fonte: c.fonte || '', ...extra });
  };
  if (item.meta.retrato) {
    somar(achar(item.meta.retrato), item.titulo, {
      autor: item.meta['retrato-autor'] || '', licenca: item.meta['retrato-licença'] || item.meta['retrato-licenca'] || '', fonte: item.meta['retrato-fonte'] || '',
    });
  }
  let cerca = false;
  for (const l of texto.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(l)) { cerca = !cerca; continue; }
    if (cerca) continue;
    for (const m of l.matchAll(/!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) somar(achar(m[1]), '');
    for (const m of l.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) somar(achar(m[2]), m[1]);
  }
  return [...vistas.values()];
}

function extrairAlvos(corpo) {
  const alvos = [];
  for (const l of semCodigo(corpo)) {
    for (const m of l.matchAll(/(?<!!)\[\[([^\]]+)\]\]/g)) alvos.push({ tipo: 'wiki', texto: m[1] });
    for (const m of l.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)\)/g)) if (!/^(https?:|#|mailto:)/i.test(m[1])) alvos.push({ tipo: 'md', texto: m[1] });
  }
  return alvos;
}

function preferir(ctx, de, ids) {
  if (!ids || !ids.length) return null;
  if (ids.length === 1) return ids[0];
  return ids.find((id) => ctx.porId.get(id).cls.acervo === de.cls.acervo) || ids[0];
}

function resolverAlvo(ctx, de, alvo) {
  if (alvo.tipo === 'wiki') {
    const nome = alvo.texto.split('|')[0].split('#')[0].split('/').pop().replace(/\.md$/i, '');
    const n = normalizar(nome);
    if (!n) return null;
    if (ctx.porNome.has(n)) return preferir(ctx, de, ctx.porNome.get(n));
    if (ctx.porCodigo.has(n)) return ctx.porCodigo.get(n);
    return null;
  }
  let url = alvo.texto.split('#')[0].split('?')[0];
  try { url = decodeURI(url); } catch { /* mantém */ }
  if (/\.md$/i.test(url) && !url.startsWith('/')) {
    const rel = posix.normalize(posix.join(posix.dirname(de.rel), url));
    if (ctx.porRel.has(rel)) return ctx.porRel.get(rel);
  }
  const segs = url.replace(/\.md$/i, '').split('/').filter(Boolean);
  if (!segs.length) return null;
  const ultimo = slug(segs[segs.length - 1]);
  const pai = segs.length > 1 ? slug(segs[segs.length - 2]) : '';
  const chave = ctx.porSlug.get(`${pai}/${ultimo}`) || ctx.porSlug.get(ultimo);
  if (chave) return preferir(ctx, de, chave);
  const porNome = ctx.porNome.get(normalizar(segs[segs.length - 1].replace(/-/g, ' ')));
  return porNome ? preferir(ctx, de, porNome) : null;
}

function reconstruir() {
  if (!emAndamento) {
    emAndamento = construir().then((r) => { memo = r; memoEm = Date.now(); return r; }).finally(() => { emAndamento = null; });
  }
  return emAndamento;
}

export async function obterIndice(forcar = false) {
  if (!forcar && memo) {
    if (Date.now() - memoEm >= 300000) reconstruir().catch(() => {});
    return memo;
  }
  return reconstruir();
}

export function esquecerIndice() { memo = null; memoEm = 0; }

/* Para as Tábuas e as Grandes Obras do Domino (lib/tabuas.mjs, 02/out/2026): resolver um nome
 * a uma ficha e reescrever um trecho de markdown com os mesmos links e imagens da ficha. */
export function resolverNome(ctx, de, nome) { return resolverAlvo(ctx, de, { tipo: 'wiki', texto: nome }); }
export function ligarTrecho(ctx, de, texto) { return reescrever(ctx, de, texto); }

function cartao(ctx, it) {
  return { id: it.id, titulo: it.titulo, secao: it.cls.secao, acervo: it.cls.acervo, tipo: it.tipo, capa: it.capa ? urlMidia(it.capa) : null };
}

export async function indicePublico() {
  const ctx = await obterIndice();
  return {
    gerado: ctx.gerado,
    total: ctx.itens.length,
    imagens: ctx.totalImagens,
    acervos: ctx.acervos,
    itens: ctx.itens.map((it) => [it.id, it.titulo, it.secaoId, it.cls.sub, it.tipo, it.capa ? urlMidia(it.capa) : '', it.resumo.slice(0, 150), it.imagens.length]),
  };
}

function reescrever(ctx, item, corpo) {
  const dir = posix.dirname(item.rel);
  const achar = (ref) => {
    const limpo = decodeURI(String(ref).trim().replace(/^<|>$/g, ''));
    if (/^(https?:|data:|\/)/i.test(limpo)) return null;
    const rel = posix.normalize(posix.join(dir, limpo));
    if (ctx.imgs.has(rel)) return rel;
    return ctx.porNomeImg.get(posix.basename(limpo).toLowerCase()) || null;
  };
  let cerca = false;
  return corpo.split(/\r?\n/).map((l) => {
    if (/^\s*(```|~~~)/.test(l)) { cerca = !cerca; return l; }
    if (cerca) return l;
    return l
      .replace(/!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g, (m, nome) => { const rel = achar(nome); return rel ? `![](${urlMidia(rel)})` : ''; })
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, ref) => { const rel = achar(ref); return rel ? `![${alt}](${urlMidia(rel)})` : ''; })
      .replace(/(?<!!)\[\[([^\]]+)\]\]/g, (m, t) => {
        const [alvo, alias] = t.split('|');
        const id = resolverAlvo(ctx, item, { tipo: 'wiki', texto: alvo });
        const texto = (alias || alvo.split('#')[0].split('/').pop()).trim();
        return id ? `[${texto}](#f=${id})` : `[${texto}](#sem)`;
      })
      .replace(/(?<!!)\[([^\]]+)\]\(([^)\s]+)\)/g, (m, texto, url) => {
        if (/^(https?:|#|mailto:|\/midia)/i.test(url)) return m;
        const id = resolverAlvo(ctx, item, { tipo: 'md', texto: url });
        return id ? `[${texto}](#f=${id})` : `[${texto}](#sem)`;
      });
  }).join('\n');
}

function hierarquiaDe(ctx, item, corpo) {
  const grupos = new Map();
  const rotulo = /\*\*(Acima|Abaixo|Ao lado|Pré-requisitos?|Abre):\*\*/g;
  for (const l of semCodigo(corpo)) {
    const achados = [...l.matchAll(rotulo)];
    achados.forEach((m, i) => {
      const nome = m[1].replace(/s$/, '');
      const fim = i + 1 < achados.length ? achados[i + 1].index : l.length;
      const trecho = l.slice(m.index + m[0].length, fim);
      const lista = grupos.get(nome) || [];
      const vistos = new Set(lista.map((x) => x.id || x.titulo));
      const empurrar = (x) => { const k = x.id || x.titulo; if (!vistos.has(k)) { vistos.add(k); lista.push(x); } };
      for (const w of trecho.matchAll(/\[\[([^\]]+)\]\]/g)) {
        const id = resolverAlvo(ctx, item, { tipo: 'wiki', texto: w[1] });
        const nomeAlvo = w[1].split('|').pop().split('#')[0];
        empurrar(id ? { id, titulo: ctx.porId.get(id).titulo } : { titulo: nomeAlvo });
      }
      for (const w of trecho.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) {
        const id = resolverAlvo(ctx, item, { tipo: 'md', texto: w[2] });
        empurrar(id ? { id, titulo: ctx.porId.get(id).titulo } : { titulo: w[1] });
      }
      const resto = trecho
        .replace(/\[\[[^\]]+\]\]/g, '').replace(/\[[^\]]+\]\([^)]*\)/g, '')
        .replace(/\([^)]*\)/g, '').replace(/[*_`]/g, '').replace(/[·—–]/g, ',');
      for (const cand of resto.split(/[,;]| e /)) {
        const nome1 = cand.trim().replace(/^[:\s]+|[.\s]+$/g, '');
        if (nome1.length < 3 || nome1.length > 60) continue;
        const ids = ctx.porNome.get(normalizar(nome1));
        if (ids) { const id = preferir(ctx, item, ids); if (id !== item.id) empurrar({ id, titulo: ctx.porId.get(id).titulo }); }
        else if (nome1.split(/\s+/).length <= 4) empurrar({ titulo: nome1 });
      }
      if (lista.length) grupos.set(nome, lista);
    });
  }
  return ROTULOS_HIERARQUIA.filter((r) => grupos.has(r)).map((r) => ({ rotulo: r, itens: grupos.get(r) }));
}

function parecidosCom(ctx, item) {
  const vizinhosDe = (x) => new Set([...x.saem, ...x.chegam]);
  const grau = (x) => x.saem.size + x.chegam.size;
  const meus = vizinhosDe(item);
  const pontos = new Map();
  for (const v of meus) {
    const outro = ctx.porId.get(v);
    const peso = 1 / Math.log(2 + grau(outro));
    for (const w of vizinhosDe(outro)) {
      if (w === item.id) continue;
      pontos.set(w, (pontos.get(w) || 0) + peso);
    }
  }
  for (const [id] of pontos) {
    const x = ctx.porId.get(id);
    if (grau(x) > 80) { pontos.delete(id); continue; }
    if (item.tipo && x.tipo === item.tipo) pontos.set(id, pontos.get(id) + 0.3);
    if (meus.has(id)) pontos.set(id, pontos.get(id) - 0.4);
  }
  return [...pontos].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id]) => cartao(ctx, ctx.porId.get(id)));
}

function mencoesDe(ctx, item) {
  const t = normalizar(item.titulo.replace(/\s*\(.*\)\s*$/, ''));
  if (t.length < 4 || t.split(' ').length > 4 || item.codigo) return [];
  const agulha = ` ${t} `;
  const achados = [];
  for (const x of ctx.itens) {
    if (x.id === item.id || item.saem.has(x.id) || item.chegam.has(x.id)) continue;
    const palheiro = ` ${x.busca} `;
    let n = 0; let p = -1;
    while (n < 8 && (p = palheiro.indexOf(agulha, p + 1)) !== -1) n++;
    if (n) achados.push({ x, n });
  }
  achados.sort((a, b) => b.n - a.n);
  return achados.slice(0, 30).map(({ x, n }) => ({ ...cartao(ctx, x), vezes: n }));
}

export async function ficha(id) {
  const ctx = await obterIndice();
  let item = ctx.porId.get(id);
  if (!item) { const alvo = ctx.porCodigo.get(normalizar(id)); if (alvo) item = ctx.porId.get(alvo); }
  if (!item) return null;

  let texto;
  try { texto = await readFile(join(COFRE, item.rel), 'utf8'); } catch { return null; }
  const { meta, corpo } = separar(texto);
  const imagens = imagensDe(item, corpo, ctx.imgs, ctx.porNomeImg, ctx.creditos).map((i) => ({
    src: urlMidia(i.rel), legenda: i.legenda, autor: i.autor, licenca: i.licenca, fonte: i.fonte,
  }));

  const toc = [];
  let cerca = false;
  for (const l of corpo.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(l)) { cerca = !cerca; continue; }
    if (cerca) continue;
    const m = l.match(/^(#{2,3})\s+(.+)$/);
    if (m) toc.push({ nivel: m[1].length, texto: limparMd(m[2]) });
  }

  const irmaos = ctx.itens.filter((x) => x.cls.pasta === item.cls.pasta);
  const pos = irmaos.findIndex((x) => x.id === item.id);
  const nova = { ...meta };
  for (const k of Object.keys(nova)) if (/^retrato|^formato$|^visibilidade$/.test(k)) delete nova[k];

  return {
    id: item.id,
    titulo: item.titulo,
    acervo: item.cls.acervo,
    secao: item.cls.secao,
    secaoId: item.secaoId,
    sub: item.cls.sub,
    caminho: item.rel,
    tipo: item.tipo,
    codigo: item.codigo,
    fatos: nova,
    corpo: reescrever(ctx, item, corpo),
    imagens,
    toc,
    hierarquia: hierarquiaDe(ctx, item, corpo),
    saem: [...item.saem].map((x) => cartao(ctx, ctx.porId.get(x))),
    chegam: [...item.chegam].map((x) => cartao(ctx, ctx.porId.get(x))).slice(0, 60),
    parecidos: parecidosCom(ctx, item),
    mencoes: mencoesDe(ctx, item),
    vizinhos: irmaos.filter((x) => x.id !== item.id).slice(0, 80).map((x) => cartao(ctx, x)),
    anterior: pos > 0 ? cartao(ctx, irmaos[pos - 1]) : null,
    proximo: pos >= 0 && pos < irmaos.length - 1 ? cartao(ctx, irmaos[pos + 1]) : null,
  };
}

export async function buscar(consulta, limite = 40) {
  const ctx = await obterIndice();
  const tokens = normalizar(consulta).split(' ').filter((t) => t.length >= 2);
  if (!tokens.length) return [];
  const achados = [];
  for (const it of ctx.itens) {
    if (!tokens.every((t) => it.busca.includes(t))) continue;
    const titulo = normalizar(it.titulo);
    let pontos = 0;
    for (const t of tokens) {
      if (titulo.includes(t)) pontos += 50;
      if (titulo.startsWith(t)) pontos += 20;
      let n = 0; let p = -1;
      while (n < 10 && (p = it.busca.indexOf(t, p + 1)) !== -1) n++;
      pontos += n;
    }
    achados.push({ it, pontos });
  }
  achados.sort((a, b) => b.pontos - a.pontos);
  const topo = achados.slice(0, limite);
  return Promise.all(topo.map(async ({ it }) => {
    let trecho = it.resumo;
    try {
      const { corpo } = separar(await readFile(join(COFRE, it.rel), 'utf8'));
      const norm = normalizar(corpo);
      const pos = norm.indexOf(tokens[0]);
      if (pos > 0 && norm.length === corpo.length) trecho = limparMd(corpo.slice(Math.max(0, pos - 70), pos + 150));
    } catch { /* usa o resumo */ }
    return { ...cartao(ctx, it), trecho: trecho.slice(0, 220) };
  }));
}

const PARADAS_ITEM = new Set('para com como uma uns por que dos das nos nas seu sua mais mas foi ser sao pelo pela entre sobre quando onde ate apos antes depois desde cada todo toda todos nao sem tem'.split(' '));
const radicais = (t) => normalizar(t).split(' ').filter((x) => x.length >= 4 && !PARADAS_ITEM.has(x)).map((x) => x.slice(0, 5));

const AJUSTES_ITENS = [
  ['Matemática', 'Progressões aritméticas', ['MAT-03']],
  ['Matemática', 'Análise combinatória', ['MAT-08']],
  ['Matemática', 'Probabilidade', ['MAT-09']],
  ['História', 'Era Vargas', ['HIS-15']],
  ['História', 'Redemocratização', ['HIS-21', 'HIS-15']],
  ['História', 'Proclamação da República', ['HIS-15', 'HIS-13']],
  ['História', 'Revolução Inglesa', ['HIS-09']],
  ['História', 'Segunda Guerra', ['HIS-17']],
  ['Biologia', 'Imunologia', ['BIO-17', 'BIO-12']],
  ['Filosofia', 'Pré-socráticos', ['FIL-00']],
  ['Filosofia', 'Sócrates, Platão', ['FIL-02']],
  ['Filosofia', 'Kant', ['FIL-03']],
  ['Filosofia', 'Marx', ['FIL-06']],
  ['Filosofia', 'Nietzsche', ['FIL-04']],
  ['Filosofia', 'Existencialismo', ['FIL-04']],
  ['Filosofia', 'Teoria do conhecimento', ['FIL-01']],
  // Linguagens: rota manual para POR/LIT/RED (22/set/2026, dia em que essas 3 matérias
  // nasceram) — o casamento automático por radical de `chaveMateria` não cobre "Linguagens"
  // porque ela cruza 4 matérias (ING/POR/LIT/RED) com nomes que não compartilham prefixo.
  ['Linguagens', 'Gêneros textuais', ['POR-01']],
  ['Linguagens', 'Coesão e coerência textual', ['POR-01']],
  ['Linguagens', 'Funções da linguagem', ['POR-01']],
  ['Linguagens', 'Linguagem verbal, não-verbal e multimodal', ['POR-01']],
  ['Linguagens', 'Variação linguística', ['POR-01']],
  ['Linguagens', 'Intertextualidade e paródia/paráfrase', ['POR-01']],
  ['Linguagens', 'Denotação e conotação', ['POR-02']],
  ['Linguagens', 'Polissemia e ambiguidade', ['POR-02']],
  ['Linguagens', 'Figuras de linguagem', ['POR-02']],
  ['Linguagens', 'Figuras de sintaxe', ['POR-02']],
  ['Linguagens', 'Classes de palavras', ['POR-03']],
  ['Linguagens', 'Concordância verbal e nominal', ['POR-03']],
  ['Linguagens', 'Regência verbal e nominal, crase', ['POR-03']],
  ['Linguagens', 'Sintaxe do período composto', ['POR-03']],
  ['Linguagens', 'Pontuação', ['POR-03']],
  ['Linguagens', 'Barroco e Arcadismo', ['LIT-01']],
  ['Linguagens', 'Romantismo', ['LIT-02']],
  ['Linguagens', 'Realismo / Naturalismo / Parnasianismo', ['LIT-03']],
  ['Linguagens', 'Simbolismo', ['LIT-04']],
  ['Linguagens', 'Modernismo — 1ª fase', ['LIT-05']],
  ['Linguagens', 'Modernismo — 2ª fase', ['LIT-06']],
  ['Linguagens', 'Modernismo — 3ª fase', ['LIT-07']],
  ['Linguagens', 'Literatura contemporânea', ['LIT-08']],
  ['Linguagens', 'Estrutura dissertativo-argumentativa', ['RED-01']],
  ['Linguagens', 'Proposta de intervenção', ['RED-02']],
  ['Linguagens', 'Repertório sociocultural aplicado', ['RED-03']],
  ['Linguagens', 'Coesão entre parágrafos', ['RED-04']],
  ['Linguagens', 'Interpretação de texto em língua estrangeira', ['ING-01']],
  ['Linguagens', 'Falsos cognatos', ['ING-02']],
  ['Linguagens', 'Vocabulário de temas recorrentes', ['ING-02']],
];

const CODIGOS_DA_SECAO = {
  Linguagens: ['POR', 'LIT', 'RED', 'ING'],
  História: ['HIS'], Geografia: ['GEO'], Química: ['QUI'], Biologia: ['BIO'],
  Matemática: ['MAT'], Física: ['FIS'], Filosofia: ['FIL'], Sociologia: ['SOC'],
};

export async function estudosDosItens(checklist) {
  const ctx = await obterIndice();
  const estudos = ctx.itens.filter((i) => i.cls.acervo === 'selecao' && /^[A-Z]{3}-\d{2}$/.test(i.codigo) && !/-00$/.test(i.codigo)).map((i) => ({
    id: i.id, titulo: i.titulo, codigo: i.codigo, materia: normalizar(i.meta.materia || i.cls.secao),
    rads: new Set(radicais(`${i.titulo} ${i.meta.programa || ''} ${i.meta.unidade || ''}`)),
    corpo: new Set(radicais(i.corpo.slice(0, 3000))),
  }));
  const saida = {};
  for (const s of checklist) {
    const chaveMateria = normalizar(s.nome).slice(0, 4);
    const doGrupo = estudos.filter((e) => e.materia.startsWith(chaveMateria));
    if (!doGrupo.length) continue;
    // "Linguagens" cruza 4 matérias (ING/POR/LIT/RED): sem prefixo comum, o casamento
    // automático abaixo não serve para ela — por isso todo item de Linguagens que não for
    // de língua estrangeira precisa de uma linha em AJUSTES_ITENS (ver acima). O ajuste
    // manual é checado ANTES do filtro de "só inglês", para não ser pulado.
    const soIngles = chaveMateria === 'ling';
    for (const it of s.itens) {
      const ajuste = AJUSTES_ITENS.find((a) => a[0] === s.nome && it.texto.startsWith(a[1]));
      if (ajuste) {
        const lista = ajuste[2].map((cod) => ctx.porCodigo.get(normalizar(cod))).filter(Boolean).map((id) => ({ id, titulo: ctx.porId.get(id).titulo, codigo: ctx.porId.get(id).codigo }));
        if (lista.length) { saida[`${s.nome}|${it.texto}`] = lista; continue; }
      }
      if (soIngles && !/ingl[eê]s|english/i.test(it.texto)) continue;
      const rads = [...new Set(radicais(it.texto))];
      if (!rads.length) continue;
      const pontuados = doGrupo.map((e) => {
        let p = 0;
        for (const r of rads) { if (e.rads.has(r)) p += 3; else if (e.corpo.has(r)) p += 0.5; }
        return { e, p };
      }).filter((x) => x.p >= 3).sort((a, b) => b.p - a.p).slice(0, 2);
      if (pontuados.length) saida[`${s.nome}|${it.texto}`] = pontuados.map((x) => ({ id: x.e.id, titulo: x.e.titulo, codigo: x.e.codigo }));
    }
  }
  return saida;
}

/** O(s) Mapa(s) — ficha(s) `XXX-00` — de cada seção do Checklist. "Linguagens" devolve os
 * quatro (POR/LIT/RED/ING); as demais seções devolvem um só. Usado pelo card para oferecer
 * "ver o panorama da matéria", ao lado do link ao estudo específico que já existe. */
export async function mapasDasSecoes() {
  const ctx = await obterIndice();
  const mapas = ctx.itens.filter((i) => i.cls.acervo === 'selecao' && /^[A-Z]{3}-00$/.test(i.codigo));
  const porPrefixo = new Map(mapas.map((m) => [m.codigo.slice(0, 3), m]));
  const saida = {};
  for (const [secao, prefixos] of Object.entries(CODIGOS_DA_SECAO)) {
    const lista = prefixos.map((p) => porPrefixo.get(p)).filter(Boolean).map((m) => ({ id: m.id, titulo: m.titulo, codigo: m.codigo }));
    if (lista.length) saida[secao] = lista;
  }
  return saida;
}

export async function fichaDaImagem(nome) {
  const ctx = await obterIndice();
  const alvo = String(nome || '').toLowerCase();
  if (!alvo || /[\\/]/.test(alvo)) return null;
  for (const it of ctx.itens) {
    const im = it.imagens.find((x) => posix.basename(x.rel).toLowerCase() === alvo);
    if (im) return { ficha: it.id, titulo: it.titulo, legenda: im.legenda, autor: im.autor, licenca: im.licenca, fonte: im.fonte };
  }
  return null;
}

const SECOES_ATLAS_CURTAS = ['Ofícios', 'Matérias-primas', 'Elementos', 'Componentes', 'Objetos e instrumentos', 'Espécies', 'Conceitos', 'Pessoas', 'Línguas', 'Mitologia'];

export async function lacunas() {
  const ctx = await obterIndice();
  const faltando = new Map();
  for (const it of ctx.itens) {
    if (it.cls.acervo !== 'atlas') continue;
    for (const g of hierarquiaDe(ctx, it, it.corpo)) {
      for (const x of g.itens) {
        if (x.id) continue;
        const limpo = x.titulo.replace(/^(a|o|as|os|um|uma|de|do|da)\s+/i, '').trim();
        const chave = normalizar(limpo);
        if (!chave || chave.length < 4 || /\d|\bnao\b|\bnenhum|\bsem\b|reconhecid|aplica|\bque\b|\bquando\b|\bonde\b|\bpor\b/.test(chave) || chave.split(' ').length > 3) continue;
        if (!faltando.has(chave)) faltando.set(chave, { nome: limpo, vezes: 0, citadoPor: [] });
        const f = faltando.get(chave);
        f.vezes += 1;
        if (f.citadoPor.length < 3) f.citadoPor.push({ id: it.id, titulo: it.titulo });
      }
    }
  }
  const semFicha = [...faltando.values()].filter((f) => !ctx.porNome.has(normalizar(f.nome))).sort((a, b) => b.vezes - a.vezes).slice(0, 80);

  const curtas = SECOES_ATLAS_CURTAS.map((nome) => {
    const lista = ctx.itens.filter((i) => i.cls.acervo === 'atlas' && i.cls.secao === nome);
    const so = lista.filter((i) => i.corpo.length < 900 && !/^##\s/m.test(i.corpo));
    return {
      secao: nome, secaoId: lista[0] ? lista[0].secaoId : '', total: lista.length, curtas: so.length,
      exemplos: so.slice(0, 14).map((i) => ({ id: i.id, titulo: i.titulo })),
    };
  }).filter((s) => s.total > 0);
  return { semFicha, curtas };
}

export async function numerosDaBiblioteca() {
  const ctx = await obterIndice();
  const estudos = ctx.itens.filter((i) => i.cls.acervo === 'selecao' && /^[A-Z]{3}-\d{2}$/.test(i.codigo) && !/-00$/.test(i.codigo));
  return {
    fichas: ctx.itens.length,
    imagens: ctx.totalImagens,
    estudosSelecao: estudos.length,
    porAcervo: ctx.acervos.map((a) => ({ nome: a.nome, total: a.total })),
  };
}
