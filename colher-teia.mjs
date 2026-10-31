/* colher-teia.mjs — colhe no Wikidata os elos das pessoas e dos grupos do Atlas, para a Teia (teia.html).

   De onde veio: 31/out/2026, pedido dele: "uma rede, network, data visualization, de todas as pessoas, por área,
   místicos, teósofos, compositores, desde o primeiro registrado, as famílias, escolas, grupos, e tudo mais".
   As fichas do Atlas não têm campos de relação; o Wikidata (dados abertos, CC0) tem:
     P1066 aluno de · P802 aluno · P737 influenciado por · P22 pai · P25 mãe · P40 filho · P26 cônjuge
     P3373 irmão · P1038 parente · P135 movimento · P463 membro de · P69 estudou em
   Para cada ficha de pessoa e de grupo, este script acha o item do Wikidata (pelo link da Wikipédia no pé da
   ficha ou, sem ele, pelo título), lê esses elos e, de quem eles apontam, o nome, se é uma pessoa e as datas.
   Grava teia-wikidata.json; o lib/teia.mjs monta a teia juntando esse arquivo com o índice das fichas.

   Rodar de novo quando entrarem fichas novas:  node colher-teia.mjs
   (Precisa de internet. Educado com os servidores: lotes de 50, um pedido por vez, com o nome do Portal.)

   Para onde vai: lib/teia.mjs (a teia ao vivo, /api/teia, e api/teia.json no site estático). */
import { writeFile } from 'node:fs/promises';
import { obterIndice } from './lib/biblioteca.mjs';

const UA = { 'User-Agent': 'PortalSolar/1.0 (https://montagnedejade.org; a Teia do Atlas)' };
const ELOS = ['P1066', 'P802', 'P737', 'P22', 'P25', 'P40', 'P26', 'P3373', 'P1038', 'P135', 'P463', 'P69'];
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function pedir(url, tentativas = 3) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (r.ok) return await r.json();
      if (r.status === 429 || r.status >= 500) { await espera(1500 * (i + 1)); continue; }
      throw new Error(`${r.status} em ${url.slice(0, 90)}`);
    } catch (e) { if (i === tentativas - 1) throw e; await espera(1200 * (i + 1)); }
  }
  return null;
}
const lotes = (lista, n) => Array.from({ length: Math.ceil(lista.length / n) }, (_, i) => lista.slice(i * n, i * n + n));

/* o ano de uma data do Wikidata ("+1815-12-10T00:00:00Z", "-0384-00-00T00:00:00Z") */
function ano(claims, p) {
  const s = claims && claims[p] && claims[p][0] && claims[p][0].mainsnak.datavalue;
  if (!s || !s.value || !s.value.time) return null;
  const m = s.value.time.match(/^([+-])(\d+)/);
  return m ? (m[1] === '-' ? -1 : 1) * parseInt(m[2], 10) : null;
}
function ids(claims, p) {
  return ((claims && claims[p]) || [])
    .filter((c) => c.rank !== 'deprecated' && c.mainsnak && c.mainsnak.datavalue && c.mainsnak.datavalue.value && c.mainsnak.datavalue.value.id)
    .map((c) => c.mainsnak.datavalue.value.id);
}

const ctx = await obterIndice(true);
const alvos = ctx.itens.filter((i) => i.cls.acervo === 'atlas' && (i.tipo === 'pessoa' || /\/5 Groups/.test(i.cls.pasta || '')));
console.log(`${alvos.length} fichas (pessoas e grupos)`);

/* 1. o título da Wikipédia de cada ficha */
const tituloDe = new Map();
for (const it of alvos) {
  const m = String(it.corpo || '').match(/pt\.wikipedia\.org\/wiki\/([^)\s"\]]+)/);
  let t = it.titulo;
  if (m) { try { t = decodeURIComponent(m[1]); } catch { t = m[1]; } }
  tituloDe.set(it.id, t.replace(/_/g, ' '));
}

/* 2. o item do Wikidata de cada título (com os redirecionamentos e as normalizações) */
const qidDoTitulo = new Map();
for (const lote of lotes([...new Set(tituloDe.values())], 50)) {
  const url = 'https://pt.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&format=json&titles=' + encodeURIComponent(lote.join('|'));
  const j = await pedir(url);
  const para = new Map();
  for (const n of (j.query.normalized || [])) para.set(n.from, n.to);
  for (const r of (j.query.redirects || [])) para.set(r.from, r.to);
  const porTitulo = new Map(Object.values(j.query.pages || {}).map((p) => [p.title, p.pageprops && p.pageprops.wikibase_item]));
  for (const t of lote) {
    let f = t;
    for (let k = 0; k < 3 && para.has(f); k++) f = para.get(f);
    if (porTitulo.get(f)) qidDoTitulo.set(t, porTitulo.get(f));
  }
}
const fichas = {};
let sem = 0;
for (const it of alvos) {
  const q = qidDoTitulo.get(tituloDe.get(it.id));
  if (!q) { sem++; continue; }
  fichas[it.id] = { qid: q, titulo: it.titulo };
}
console.log(`${Object.keys(fichas).length} com item no Wikidata, ${sem} sem`);

/* 3. os elos de cada ficha */
const qids = [...new Set(Object.values(fichas).map((f) => f.qid))];
const elosDoQid = new Map();
for (const lote of lotes(qids, 50)) {
  const j = await pedir('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=' + lote.join('|'));
  for (const [q, e] of Object.entries(j.entities || {})) {
    const elos = {};
    for (const p of ELOS) { const l = ids(e.claims, p); if (l.length) elos[p] = l; }
    elosDoQid.set(q, { elos, nasc: ano(e.claims, 'P569'), morte: ano(e.claims, 'P570') });
  }
  process.stdout.write('.');
}
for (const f of Object.values(fichas)) Object.assign(f, elosDoQid.get(f.qid) || { elos: {} });
console.log();

/* 4. quem os elos apontam: o nome (português, ou inglês), se é gente e as datas */
const deles = new Set(qids);
const apontados = new Set();
for (const f of Object.values(fichas)) for (const l of Object.values(f.elos || {})) for (const q of l) if (!deles.has(q)) apontados.add(q);
const itens = {};
for (const lote of lotes([...apontados], 50)) {
  const j = await pedir('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels|claims&languages=pt|pt-br|en&ids=' + lote.join('|'));
  for (const [q, e] of Object.entries(j.entities || {})) {
    if (!e.labels) continue;
    const l = e.labels;
    itens[q] = {
      nome: (l.pt || l['pt-br'] || l.en || {}).value || q,
      humano: ids(e.claims, 'P31').includes('Q5'),
      nasc: ano(e.claims, 'P569'), morte: ano(e.claims, 'P570'),
    };
  }
  process.stdout.write('.');
}
console.log(`\n${Object.keys(itens).length} itens apontados, com nome`);

const saida = {
  colhido: new Date().toISOString().slice(0, 10),
  fonte: 'Wikidata (dados abertos, CC0), lido pelo colher-teia.mjs',
  propriedades: Object.fromEntries(ELOS.map((p) => [p, p])),
  fichas,
  itens,
};
await writeFile(new URL('./teia-wikidata.json', import.meta.url), JSON.stringify(saida, null, 1) + '\n', 'utf8');
const nElos = Object.values(fichas).reduce((s, f) => s + Object.values(f.elos || {}).reduce((a, l) => a + l.length, 0), 0);
console.log(`gravado teia-wikidata.json: ${Object.keys(fichas).length} fichas, ${nElos} elos, ${Object.keys(itens).length} apontados`);
