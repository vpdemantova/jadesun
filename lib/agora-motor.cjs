/* ============================================================
   O AGORA DE CADA ÁREA — o motor (21/out/2026, registro 115)
   As manchetes do dia (dos feeds das fontes da área, em campos-dados.js) e as vagas remotas
   abertas (da Jobicy, pelo setor da área). Sem algoritmo: só a data ordena.

   Um arquivo só, em CommonJS e sem dependências, para rodar nos dois lugares:
   · no servidor de casa (lib/agora.mjs o chama, com uma cópia em disco);
   · na função da Vercel do site público (vercel-montar.mjs copia este arquivo e o campos-dados.js).
   A Jobicy pede o crédito com o link e que a candidatura vá para o endereço original da vaga:
   o link de cada vaga é o dela, e a página diz de onde veio.
   ============================================================ */
'use strict';

const UA = 'Mozilla/5.0 (Portal Solar; leitor de feeds; +https://montagnedejade.org)';
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”' };
function texto(t) {
  return String(t || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (m, n) => { try { return String.fromCodePoint(+n); } catch (e) { return ' '; } })
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => { try { return String.fromCodePoint(parseInt(n, 16)); } catch (e) { return ' '; } })
    .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] || m)
    .replace(/\s+/g, ' ').trim();
}
const tag = (bloco, nome) => { const m = bloco.match(new RegExp(`<${nome}(?:\\s[^>]*)?>([\\s\\S]*?)</${nome}>`, 'i')); return m ? m[1] : ''; };
/* a data do item: inválida vira vazia; no futuro (feed com data errada) vira agora */
function dataDe(t) {
  if (!t) return '';
  const d = new Date(t);
  if (isNaN(d)) return '';
  return (d.getTime() > Date.now() + 36e5 ? new Date() : d).toISOString();
}

/** lê RSS 2.0, RDF (RSS 1.0) e Atom; devolve até 10 itens { titulo, link, data } */
function lerFeed(xml) {
  const itens = [];
  const blocos = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  for (const b of blocos.slice(0, 10)) {
    let link = texto(tag(b, 'link'));
    if (!/^https?:\/\//.test(link)) { const m = b.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i) || b.match(/<link[^>]*href=["']([^"']+)["']/i); link = m ? m[1].replace(/&amp;/g, '&') : ''; }
    const titulo = texto(tag(b, 'title'));
    const data = dataDe(texto(tag(b, 'pubDate') || tag(b, 'dc:date') || tag(b, 'published') || tag(b, 'updated')));
    if (titulo && /^https?:\/\//.test(link)) itens.push({ titulo: titulo.slice(0, 240), link, data });
  }
  return itens;
}

async function pegar(url, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms || 8000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/atom+xml, application/xml, application/json, text/xml;q=0.9, */*;q=0.5' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.text();
  } finally { clearTimeout(t); }
}

/* as manchetes de uma área: todas as fontes com feed, juntas, as mais novas primeiro (até 3 por fonte, para nenhuma tomar a lista) */
async function noticias(area) {
  const fontes = area.fontes.filter((f) => f[3]);
  const res = await Promise.allSettled(fontes.map((f) => pegar(f[3]).then(lerFeed)));
  const itens = [], falhas = [];
  res.forEach((r, i) => {
    const f = fontes[i];
    if (r.status !== 'fulfilled' || !r.value.length) { falhas.push(f[0]); return; }
    r.value.filter((it) => it.data).slice(0, 3).forEach((it) => itens.push({ titulo: it.titulo, link: it.link, data: it.data, fonte: f[0], site: f[1] }));
  });
  const vistos = new Set();
  return {
    itens: itens.filter((it) => !vistos.has(it.link) && vistos.add(it.link)).sort((a, b) => (a.data < b.data ? 1 : -1)).slice(0, 12),
    fontes: fontes.length - falhas.length, falhas,
  };
}

/* as vagas remotas abertas, pela Jobicy (os setores da área); sem setor, nenhuma */
async function vagas(area) {
  const setores = (area.jobicy || []).slice(0, 3);
  if (!setores.length) return { itens: [], de: null };
  const res = await Promise.allSettled(setores.map((s) => pegar('https://jobicy.com/api/v2/remote-jobs?count=12&industry=' + encodeURIComponent(s), 9000).then((t) => JSON.parse(t))));
  const itens = [];
  res.forEach((r) => {
    if (r.status !== 'fulfilled' || !r.value || !Array.isArray(r.value.jobs)) return;
    r.value.jobs.forEach((j) => {
      if (!j || !/^https?:\/\//.test(j.url || '')) return;
      itens.push({ titulo: texto(j.jobTitle).slice(0, 160), empresa: texto(j.companyName).slice(0, 80), link: j.url, lugar: texto(j.jobGeo).slice(0, 60), tipo: Array.isArray(j.jobType) ? j.jobType.join(', ') : texto(j.jobType), data: dataDe(j.pubDate) });
    });
  });
  const vistos = new Set();
  return { itens: itens.filter((v) => !vistos.has(v.link) && vistos.add(v.link)).sort((a, b) => (a.data < b.data ? 1 : -1)).slice(0, 10), de: ['Jobicy', 'https://jobicy.com/'] };
}

/** o agora de uma área: { area, em, noticias, vagas } */
async function agoraDe(CAMPOS, id) {
  const area = CAMPOS.area(id);
  if (!area) throw new Error('Área desconhecida.');
  const [n, v] = await Promise.all([noticias(area), vagas(area).catch(() => ({ itens: [], de: null }))]);
  return { area: id, em: new Date().toISOString(), noticias: n.itens, fontes: n.fontes, falhas: n.falhas, vagas: v.itens, vagasDe: v.de };
}

module.exports = { agoraDe, lerFeed, noticias, vagas };
