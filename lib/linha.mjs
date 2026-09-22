import { obterIndice, urlMidia } from './biblioteca.mjs';
import { normalizar } from './vault.mjs';
import { posix } from 'node:path';

const PARADAS = new Set('para com como uma uns por que dos das nos nas seu sua seus suas mais mas foi ser sao pelo pela entre sobre quando onde ate apos antes depois desde cada todo toda todos nao sem tem mil ano anos como isso esse essa este esta primeiro primeira nova novo'.split(' '));

function tokens(t) {
  return normalizar(String(t)).split(' ').filter((x) => x.length >= 4 && !PARADAS.has(x));
}

const RADICAL = 5;
const radical = (t) => t.slice(0, RADICAL);

let corpus = null;
let corpusDe = null;

async function montarCorpus() {
  const ctx = await obterIndice();
  if (corpus && corpusDe === ctx.gerado) return { ctx, corpus };
  const lista = [];
  for (const it of ctx.itens) {
    if (!(it.cls.acervo === 'selecao' || it.cls.acervo === 'atlas')) continue;
    if (it.cls.acervo === 'atlas' && /^Reinos/.test(it.cls.secao)) continue;
    for (const im of it.imagens) {
      const base = posix.basename(im.rel).replace(/\.[a-z0-9]+$/i, '');
      const semPrefixo = base.replace(/^[a-z]{3}_/, '').replace(/[_-]+/g, ' ');
      const prefixo = (base.match(/^([a-z]{3})_/) || [])[1] || '';
      const leg = tokens(`${im.legenda} ${it.cls.acervo === 'atlas' ? it.titulo : ''}`);
      lista.push({
        rel: im.rel, legenda: im.legenda || it.titulo, autor: im.autor, licenca: im.licenca, fonte: im.fonte,
        item: it, prefixo, leg: new Set(leg), legRad: new Set(leg.map(radical)), arq: tokens(semPrefixo),
      });
    }
  }
  corpus = lista;
  corpusDe = ctx.gerado;
  return { ctx, corpus };
}

function pontuar(ev, im) {
  const [, , area, titulo, nota, ref] = ev;
  const tt = tokens(titulo);
  const tn = tokens(nota);
  let p = 0;
  for (const t of tt) {
    if (im.leg.has(t)) p += 4;
    else if (im.legRad.has(radical(t))) p += 2;
    if (im.arq.includes(t)) p += 4;
  }
  if (p === 0) return 0;
  for (const t of tn) if (im.leg.has(t)) p += 1;
  if (im.prefixo === area) p += 2;
  if (im.item.cls.acervo === 'selecao') p += 0.5;
  const cod = String(ref || '').toUpperCase();
  if (im.item.codigo && cod && im.item.codigo === cod) p += 1;
  else if (im.item.codigo && cod && im.item.codigo.slice(0, 3) === cod.slice(0, 3)) p += 0.5;
  return p;
}

const LIMIAR = 6;

const SOBRESCRITAS = new Map([
  ['Elementos e átomos', 'fil_democrito.jpg'],
  ['Inglês Antigo', null],
  ['Grandes Navegações', 'geo_waldseemuller.jpg'],
  ['Corte, Independência, Império', null],
  ['Teoria celular', 'bio_celula.png'],
  ['Conferência de Berlim', 'geo_berlim1884.jpg'],
  ['Guerras Mundiais e 1929', 'his_primeira_guerra.jpg'],
  ['Ditadura Civil-Militar', 'his_golpe_64.jpg'],
  ['Geografia crítica', 'geo_milton.jpg'],
  ['Ondas gravitacionais', 'fis_buraco_negro.jpg'],
  ['"I Have a Dream"', 'soc_mlk.jpg'],
  ['Molina-Rowland e Montreal', 'qui_ozonio.jpg'],
  ['Globalização e geotecnologias', 'fis_satelite.jpg'],
  ['Lewis e Pauling', 'qui_ligacao.png'],
].map(([t, f]) => [normalizar(t), f]));

const LIMITES_ERA = [[-Infinity, -600], [-600, 500], [500, 1450], [1450, 1600], [1600, 1700], [1700, 1789], [1789, 1900], [1900, 1945], [1945, 1991], [1991, Infinity]];

function anoDaLegenda(leg) {
  const m = String(leg).match(/(?:^|[\s(~c.])(\d{3,4})(?:\s*[–-]\s*\d{3,4})?(\s*a\.?\s?C)?/);
  if (!m) return null;
  return m[2] ? -Number(m[1]) : Number(m[1]);
}

const dadosImagem = (im, pontos) => ({ src: urlMidia(im.rel), legenda: im.legenda, autor: im.autor, licenca: im.licenca, fonte: im.fonte, ficha: im.item.id, pontos });

export async function imagensParaEventos(eventos) {
  const { ctx, corpus: c } = await montarCorpus();
  const feitos = new Map();
  const usadas = new Set();
  const reservados = new Set();

  eventos.forEach((ev, i) => {
    const k = normalizar(ev[3]);
    if (!SOBRESCRITAS.has(k)) return;
    reservados.add(i);
    const nome = SOBRESCRITAS.get(k);
    const im = nome ? c.find((x) => posix.basename(x.rel) === nome) : null;
    if (im) { feitos.set(i, { im, p: 99 }); usadas.add(im.rel); }
  });

  const candidatos = [];
  eventos.forEach((ev, i) => {
    if (reservados.has(i)) return;
    for (const im of c) {
      if (usadas.has(im.rel)) continue;
      const p = pontuar(ev, im);
      if (p >= LIMIAR) candidatos.push({ i, im, p });
    }
  });
  candidatos.sort((a, b) => b.p - a.p);
  for (const x of candidatos) {
    if (feitos.has(x.i) || usadas.has(x.im.rel)) continue;
    feitos.set(x.i, x);
    usadas.add(x.im.rel);
  }

  const eventosOut = eventos.map((ev, i) => {
    const x = feitos.get(i);
    const ficha = ctx.porCodigo.get(normalizar(String(ev[5] || ''))) || null;
    return { ficha, imagem: x ? dadosImagem(x.im, x.p) : null };
  });

  const eras = {};
  LIMITES_ERA.forEach((lim, idx) => {
    const porItem = new Map();
    for (const im of c) {
      if (usadas.has(im.rel) || im.item.cls.acervo !== 'selecao') continue;
      const ano = anoDaLegenda(im.legenda);
      if (ano === null || ano < lim[0] || ano >= lim[1]) continue;
      if (!porItem.has(im.item.id)) porItem.set(im.item.id, []);
      porItem.get(im.item.id).push(im);
    }
    const escolhidas = [];
    const grupos = [...porItem.values()].sort((a, b) => b.length - a.length);
    for (let rodada = 0; escolhidas.length < 4 && rodada < 3; rodada++) {
      for (const g of grupos) {
        if (g[rodada] && escolhidas.length < 4) escolhidas.push(g[rodada]);
      }
    }
    eras[idx + 1] = escolhidas.map((im) => dadosImagem(im, 0));
  });

  return { eventos: eventosOut, eras };
}
