/* ============================================================
   OS GUIAS — o mundo agora (09/out/2026, PERFIL.md item 74)
   "que eu possa me direcionar e a cada instante ler sobre o mundo das melhores fontes"
   O servidor de casa busca as manchetes direto das fontes (RSS/Atom), sem algoritmo: só a data
   ordena. Guarda uma cópia em dados/guias-cache.json para abrir sem internet. Nada do caderno
   sai daqui: o pedido é o mesmo que o navegador faria ao abrir cada site.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARQ_CACHE = join(RAIZ, 'dados', 'guias-cache.json');
const VALIDADE = 20 * 60 * 1000;

/* as fontes (a lista é a mesma do guias-dados.js; aqui só o que o servidor precisa) */
export const FONTES = [
  ['bbc', 'https://feeds.bbci.co.uk/news/world/rss.xml'],
  ['aljazeera', 'https://www.aljazeera.com/xml/rss/all.xml'],
  ['guardian', 'https://www.theguardian.com/world/rss'],
  ['dw', 'https://rss.dw.com/rdf/rss-en-all'],
  ['onu', 'https://news.un.org/feed/subscribe/pt/news/all/rss.xml'],
  ['bbcbrasil', 'https://feeds.bbci.co.uk/portuguese/rss.xml'],
  ['publica', 'https://apublica.org/feed/'],
  ['agenciabrasil', 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml'],
  ['nexo', 'https://www.nexojornal.com.br/rss.xml'],
  ['piaui', 'https://piaui.folha.uol.com.br/feed/'],
  ['nature', 'https://www.nature.com/nature.rss'],
  ['quanta', 'https://www.quantamagazine.org/feed/'],
  ['nasa', 'https://www.nasa.gov/news-release/feed/'],
  ['fapesp', 'https://revistapesquisa.fapesp.br/feed/'],
  ['jornalusp', 'https://jornal.usp.br/feed/'],
  ['carbonbrief', 'https://www.carbonbrief.org/feed/'],
  ['mongabay', 'https://news.mongabay.com/feed/'],
  ['oeco', 'https://oeco.org.br/feed/'],
  ['owid', 'https://ourworldindata.org/atom.xml'],
  ['aeon', 'https://aeon.co/feed.rss'],
  ['pdr', 'https://publicdomainreview.org/rss.xml'],
  ['openculture', 'https://www.openculture.com/feed'],
];

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”' };
function texto(t) {
  return String(t || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] || m)
    .replace(/\s+/g, ' ').trim();
}
const tag = (bloco, nome) => { const m = bloco.match(new RegExp(`<${nome}(?:\\s[^>]*)?>([\\s\\S]*?)</${nome}>`, 'i')); return m ? m[1] : ''; };

/** lê RSS 2.0, RDF (RSS 1.0) e Atom; devolve até 8 itens { titulo, link, data, resumo } */
export function lerFeed(xml) {
  const itens = [];
  const blocos = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  for (const b of blocos.slice(0, 8)) {
    let link = texto(tag(b, 'link'));
    if (!link) { const m = b.match(/<link[^>]*href="([^"]+)"/i); link = m ? m[1] : ''; }
    const data = texto(tag(b, 'pubDate') || tag(b, 'dc:date') || tag(b, 'updated') || tag(b, 'published'));
    const titulo = texto(tag(b, 'title'));
    const resumo = texto(tag(b, 'description') || tag(b, 'summary')).slice(0, 220);
    if (titulo && /^https?:\/\//.test(link)) itens.push({ titulo, link, data: data ? new Date(data).toISOString() : '', resumo });
  }
  return itens;
}

async function buscar(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Portal Solar; leitor de feeds local)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return lerFeed(await r.text());
  } finally { clearTimeout(t); }
}

let memoria = null;
function lerCache() { try { return existsSync(ARQ_CACHE) ? JSON.parse(readFileSync(ARQ_CACHE, 'utf8')) : null; } catch { return null; } }

/** as manchetes de agora (ou a última cópia, se a internet faltar) */
export async function guiasAgora({ fresco = false } = {}) {
  if (!memoria) memoria = lerCache();
  if (!fresco && memoria && Date.now() - memoria.em < VALIDADE) return { ...memoria, deCache: false };
  const resultados = await Promise.allSettled(FONTES.map(([id, url]) => buscar(url).then((itens) => ({ id, itens }))));
  const fontes = {};
  let ok = 0;
  resultados.forEach((r, i) => {
    const id = FONTES[i][0];
    if (r.status === 'fulfilled' && r.value.itens.length) { fontes[id] = { itens: r.value.itens, em: Date.now() }; ok++; }
    else if (memoria && memoria.fontes && memoria.fontes[id]) fontes[id] = { ...memoria.fontes[id], velho: true };
    else fontes[id] = { itens: [], erro: r.status === 'rejected' ? String(r.reason && r.reason.message || r.reason) : 'vazio' };
  });
  if (!ok && memoria) return { ...memoria, deCache: true, semInternet: true };
  memoria = { em: Date.now(), fontes };
  try { mkdirSync(dirname(ARQ_CACHE), { recursive: true }); writeFileSync(ARQ_CACHE, JSON.stringify(memoria), 'utf8'); } catch { /* sem disco, segue */ }
  return { ...memoria, deCache: false };
}
