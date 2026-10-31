// Portal Solar · vida-gerar.mjs (22/out/2026, registro 116)
// Gera vida-arvore.js: a árvore da vida, dos domínios às ordens, a partir do Catalogue of Life
// (a edição em ChecklistBank, dataset 3LR, licença CC BY 4.0), com:
//   · as espécies aceitas de cada grupo: vivas (extinct=false) e todas (com as extintas);
//   · o nome em português, a imagem e o artigo da Wikipédia em português, do Wikidata (CC0),
//     casados pelo nome científico e pela categoria (reino, filo, classe, ordem);
//   · o autor e a licença de cada imagem, do Wikimedia Commons.
// Não edite vida-arvore.js à mão: rode de novo (precisa de internet; leva uns minutos).
// uso: node vida-gerar.mjs
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const COL = 'https://api.checklistbank.org/dataset/3LR';
const UA = 'PortalSolar/1.0 (montagnedejade.org; atlas da vida) node';
const PRINCIPAIS = ['domain', 'kingdom', 'phylum', 'class', 'order'];
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function json(url, tentativas = 4) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' } });
      if (r.status === 429 || r.status >= 500) { await dormir(1500 * (i + 1)); continue; }
      if (!r.ok) throw new Error(r.status + ' ' + url);
      return await r.json();
    } catch (e) { if (i === tentativas - 1) throw e; await dormir(1200 * (i + 1)); }
  }
}
async function filhos(id, vivas) {
  const out = []; let offset = 0;
  for (;;) {
    const d = await json(`${COL}/tree/${encodeURIComponent(id)}/children?limit=1000&offset=${offset}${vivas ? '&extinct=false' : ''}`);
    out.push(...(d.result || []));
    if (d.last || !d.result || !d.result.length) break;
    offset += d.result.length;
  }
  return out;
}

/* a árvore: guarda só as categorias principais; as do meio (subfilo, superclasse…) são atravessadas */
const fila = []; let feitos = 0;
async function expandir(no, profundidade) {
  const [todos, vivos] = await Promise.all([filhos(no.id, false), filhos(no.id, true)]);
  const vivosPorId = new Map(vivos.map((v) => [v.id, v.count || 0]));
  feitos++; if (feitos % 50 === 0) log(`${feitos} grupos abertos…`);
  const lista = [];
  for (const f of todos) {
    if (f.status && f.status !== 'accepted') continue;
    const n = { id: f.id, nome: f.name, cat: f.rank, total: f.count || 0, vivas: vivosPorId.get(f.id) || 0, filhos: [] };
    if (PRINCIPAIS.includes(f.rank)) {
      lista.push(n);
      if (f.rank !== 'order' && f.childCount) fila.push([n, profundidade + 1]);
    } else if (f.childCount && !['family', 'subfamily', 'genus', 'species', 'tribe', 'superfamily'].includes(f.rank)) {
      /* um nível do meio: os filhos dele sobem para cá */
      const sub = await expandir(n, profundidade);
      lista.push(...sub);
    }
  }
  return lista;
}
async function correrFila(conc = 6) {
  await Promise.all(Array.from({ length: conc }, async () => {
    while (fila.length) {
      const [n] = fila.shift();
      n.filhos = await expandir(n, 0);
    }
  }));
}

/* a árvore baixada fica em dados/vida-col.json (fora do git): rodar de novo só refaz o resto;
   para baixar outra edição do Catalogue of Life, apague o arquivo ou rode com --baixar */
const CACHE = join(RAIZ, 'dados', 'vida-col.json');
let info, arvore;
if (existsSync(CACHE) && !process.argv.includes('--baixar')) {
  ({ info, arvore } = JSON.parse(readFileSync(CACHE, 'utf8')));
  log(`árvore guardada em dados/ (edição ${info.version})`);
} else {
  log('lendo a raiz do Catalogue of Life…');
  info = await json(COL);
  const raizes = (await json(`${COL}/tree?limit=50`)).result.filter((r) => !r.status || r.status === 'accepted');
  const vivasRaiz = new Map((await json(`${COL}/tree?limit=50&extinct=false`)).result.map((r) => [r.id, r.count || 0]));
  arvore = raizes.map((r) => ({ id: r.id, nome: r.name, cat: r.rank === 'unranked' ? 'domain' : r.rank, total: r.count || 0, vivas: vivasRaiz.get(r.id) || 0, filhos: [] }));
  for (const r of arvore) fila.push([r, 0]);
  await correrFila();
  mkdirSync(join(RAIZ, 'dados'), { recursive: true });
  writeFileSync(CACHE, JSON.stringify({ info: { title: info.title, version: info.version, citation: info.citation }, arvore }));
}
/* a contagem da raiz vem vazia em alguns domínios: soma a dos filhos */
const somar = (n) => { for (const f of n.filhos) somar(f); if (!n.total && n.filhos.length) { n.total = n.filhos.reduce((s, f) => s + f.total, 0); n.vivas = n.filhos.reduce((s, f) => s + f.vivas, 0); } };
arvore.forEach(somar);
const todosNos = []; const andar = (n) => { todosNos.push(n); n.filhos.forEach(andar); }; arvore.forEach(andar);
log(`árvore: ${todosNos.length} grupos`);

/* ---------- o Wikidata: nome em português, imagem, artigo ---------- */
const CAT_WD = { domain: 'Q146481', kingdom: 'Q36732', phylum: 'Q38348', class: 'Q37517', order: 'Q36602' };
/* em POST: com centenas de nomes, o endereço passava do limite (erro 414) */
async function sparql(q) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch('https://query.wikidata.org/sparql', { method: 'POST', headers: { 'user-agent': UA, accept: 'application/sparql-results+json', 'content-type': 'application/x-www-form-urlencoded' }, body: 'query=' + encodeURIComponent(q) });
    if (r.ok) return r.json();
    if (r.status === 429 || r.status >= 500) { await dormir(3000 * (i + 1)); continue; }
    throw new Error('wikidata ' + r.status);
  }
  throw new Error('wikidata sem resposta');
}
const wd = new Map();
/* o rótulo em português às vezes é um sinônimo latino (Larvacea, Alcyonaria): só vale se parecer português */
function pareceNomeComum(t) {
  if (!t) return false;
  if (/[áéíóúâêôãõç\- ]/i.test(t)) return !/(ales|aceae|idae|inae|oidea|phyta|mycota|opsida)$/i.test(t);
  return /(os|as|es|is|eiro|eira|o|e|or)$/i.test(t) && !/(ales|aceae|idae|inae|oidea|ae|ia|ea|ida|ina|on|us|um|a)$/i.test(t);
}
const maiuscula = (t) => t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
const nomes = todosNos.filter((n) => CAT_WD[n.cat]);
for (let i = 0; i < nomes.length; i += 150) {
  const lote = nomes.slice(i, i + 150);
  const valores = lote.map((n) => `("${n.nome.replace(/"/g, '')}" wd:${CAT_WD[n.cat]})`).join(' ');
  /* o nome comum em português (P1843) vale mais que o rótulo, que muitas vezes repete o nome científico */
  const q = `SELECT ?nome ?item ?comum ?rot ?img ?art WHERE { VALUES (?nome ?cat) { ${valores} } ?item wdt:P225 ?nome ; wdt:P105 ?cat .
    OPTIONAL { ?item wdt:P1843 ?comum . FILTER(lang(?comum) = "pt" || lang(?comum) = "pt-br") }
    OPTIONAL { ?item rdfs:label ?rot FILTER(lang(?rot) = "pt") } OPTIONAL { ?item wdt:P18 ?img }
    OPTIONAL { ?art schema:about ?item ; schema:isPartOf <https://pt.wikipedia.org/> } }`;
  try {
    const d = await sparql(q);
    for (const b of d.results.bindings) {
      /* um item volta em várias linhas (um nome comum por linha): junta o que cada uma traz */
      const k = b.nome.value, v = wd.get(k) || { item: b.item.value.split('/').pop(), comum: '', rot: '', img: '', art: '' };
      if (v.item !== b.item.value.split('/').pop()) continue;
      if (!v.comum && b.comum) v.comum = b.comum.value;
      if (!v.rot && b.rot) v.rot = b.rot.value;
      if (!v.img && b.img) v.img = decodeURIComponent(b.img.value.split('/').pop());
      if (!v.art && b.art) v.art = b.art.value;
      v.pt = v.comum || (pareceNomeComum(v.rot) ? v.rot : '');
      wd.set(k, v);
    }
  } catch (e) { log('wikidata falhou num lote:', e.message); }
  await dormir(400);
}
log(`wikidata: ${wd.size} grupos casados`);

/* ---------- o Commons: o autor e a licença de cada imagem ---------- */
const arquivos = [...new Set([...wd.values()].map((v) => v.img).filter(Boolean))];
const credito = new Map();
const limpar = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
for (let i = 0; i < arquivos.length; i += 50) {
  const lote = arquivos.slice(i, i + 50);
  const u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata|url&iiurlwidth=360&titles=' + encodeURIComponent(lote.map((a) => 'File:' + a).join('|'));
  try {
    let d = await json(u);
    if (!d || !d.query) { await dormir(2500); d = await json(u); }
    if (!d || !d.query) throw new Error('sem resposta do Commons');
    const norm = new Map((d.query.normalized || []).map((x) => [x.to, x.from]));
    for (const p of Object.values(d.query.pages || {})) {
      const ii = p.imageinfo && p.imageinfo[0]; if (!ii) continue;
      const m = ii.extmetadata || {};
      const titulo = (norm.get(p.title) || p.title).replace(/^File:/, '');
      credito.set(titulo, { url: String(ii.thumburl || ii.url).replace(/\?utm_.*$/, ''), autor: limpar(m.Artist && m.Artist.value).slice(0, 80), lic: limpar(m.LicenseShortName && m.LicenseShortName.value), pag: ii.descriptionurl });
    }
  } catch (e) { log('commons falhou num lote:', e.message); }
  await dormir(300);
}
log(`commons: ${credito.size} imagens com crédito`);

/* ---------- escrever (compacto: [id, nome, categoria, vivas, total, pt, imagem, artigo, filhos]) ---------- */
const CAT = { domain: 'd', kingdom: 'r', phylum: 'f', class: 'c', order: 'o' };
const imagens = []; const idxImg = new Map();
function compacto(n) {
  const w = wd.get(n.nome) || {};
  let im = -1;
  const c = w.img && (credito.get(w.img) || credito.get(w.img.replace(/_/g, ' ')));
  if (c && c.url && c.lic) { if (!idxImg.has(c.url)) { idxImg.set(c.url, imagens.length); imagens.push([c.url, c.autor, c.lic, c.pag]); } im = idxImg.get(c.url); }
  /* sem nome comum no Wikidata, o título do artigo da Wikipédia em português, se for um nome comum (Besouro, Morcego, Tatu) */
  const titulo = w.art ? decodeURIComponent(w.art.replace('https://pt.wikipedia.org/wiki/', '')).replace(/_/g, ' ').replace(/\s*\(.*\)$/, '') : '';
  const candidato = w.pt || (pareceNomeComum(titulo) ? titulo : '');
  const pt = candidato && candidato.toLowerCase() !== n.nome.toLowerCase() ? maiuscula(candidato) : '';
  return [n.id, n.nome, CAT[n.cat] || n.cat, n.vivas, n.total, pt, im, w.art ? decodeURIComponent(w.art.replace('https://pt.wikipedia.org/wiki/', '')) : '', n.filhos.sort((a, b) => b.vivas - a.vivas || b.total - a.total).map(compacto)];
}
const dados = {
  fonte: { nome: info.title, versao: info.version, licenca: 'CC BY 4.0', citacao: info.citation || '', url: 'https://www.catalogueoflife.org/', gerado: new Date().toISOString().slice(0, 10) },
  arvore: arvore.sort((a, b) => b.vivas - a.vivas).map(compacto),
  imagens,
};
const js = `/* GERADO por vida-gerar.mjs em ${dados.fonte.gerado}: não edite à mão.\n   A árvore da vida do ${dados.fonte.nome} (${dados.fonte.versao}, ${dados.fonte.licenca}); nomes e imagens do Wikidata (CC0) e do Wikimedia Commons (licença de cada imagem).\n   Nó: [id no COL, nome científico, categoria (d domínio, r reino, f filo, c classe, o ordem), espécies vivas, espécies com as extintas, nome em português, imagem (índice), artigo da Wikipédia, filhos] */\n` +
  `(function (r) { r.VIDA_ARVORE = ${JSON.stringify(dados)}; })(typeof window !== 'undefined' ? window : globalThis);\n`;
writeFileSync(join(RAIZ, 'vida-arvore.js'), js);
log(`vida-arvore.js: ${Math.round(js.length / 1024)} KB, ${todosNos.length} grupos, ${imagens.length} imagens`);
