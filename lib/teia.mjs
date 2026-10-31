/* lib/teia.mjs — a Teia: a rede de todas as pessoas, as famílias, as escolas e os grupos do Atlas.

   De onde veio: 31/out/2026, pedido dele ("uma rede, network, data visualization, de todas as pessoas, por área,
   místicos, teósofos, compositores, desde o primeiro registrado, as famílias, escolas, grupos, e tudo mais… que
   tudo se misture e fique integrado"). Junta três coisas:
     - o índice das fichas (lib/biblioteca.mjs): cada pessoa e cada grupo do Atlas é um nó, com a área, as
       datas e o retrato da própria ficha; ficha nova entra sozinha;
     - os elos colhidos no Wikidata (teia-wikidata.json, feito pelo colher-teia.mjs): quem aprendeu com quem,
       quem influenciou quem, a família, os movimentos, as escolas e os grupos;
     - o jogo Atlantis (D:/www/vale-serafim-3d/src/hall/portal.js, se estiver nesta máquina): quem também está
       no Hall da Fama do jogo ganha a marca de Atlantis.
   Quem não tem ficha entra como nó de fora só quando liga duas fichas ou mais (um mestre de dois, uma escola,
   um grupo, uma família em comum): na primeira colheita, com o mestre e a família de cada um sempre dentro, a
   teia teve 1.924 nós, 1.594 deles gente de fora, e virou poeira. Os elos de uma ficha só, com quem não tem
   ficha, continuam no painel dela (o campo "extras" de cada nó), sem desenhar.

   Para onde vai: servir.mjs (/api/teia), exportar.mjs (api/teia.json) e teia.js (o desenho). */
import { readFile } from 'node:fs/promises';
import { obterIndice, urlMidia } from './biblioteca.mjs';

/* as áreas das fichas (o campo "área"), com o nome que a Teia mostra */
const AREAS = {
  literatura: 'Literatura', escritores: 'Literatura', 'músicos': 'Música', musicos: 'Música', compositores: 'Música',
  cientistas: 'Ciência', 'filósofos': 'Filosofia', filosofos: 'Filosofia', pintores: 'Pintura', artistas: 'Pintura',
  'místicos': 'Mística', misticos: 'Mística', 'teósofos': 'Teosofia', teosofos: 'Teosofia',
  'história': 'História', historia: 'História', arte: 'Pintura', 'música': 'Música', musica: 'Música', filosofia: 'Filosofia',
  'ciência': 'Ciência', ciencia: 'Ciência', religião: 'Mística', religiao: 'Mística',
};
const ORDEM_AREAS = ['Mística', 'Teosofia', 'Filosofia', 'Ciência', 'Música', 'Literatura', 'Pintura', 'História', 'Outros'];

/* o que cada propriedade do Wikidata vira: o tipo do elo e a direção (de → para) */
const ELO = {
  P1066: { tipo: 'mestre', inverte: true },             // X foi aluno de Y: Y → X
  P802: { tipo: 'mestre' },                             // X teve o aluno Y: X → Y
  P737: { tipo: 'influencia', inverte: true },          // X foi influenciado por Y: Y → X
  P22: { tipo: 'familia', rel: 'pai', inverte: true },
  P25: { tipo: 'familia', rel: 'mãe', inverte: true },
  P40: { tipo: 'familia', rel: 'filho ou filha' },
  P26: { tipo: 'familia', rel: 'casamento', simetrico: true },
  P3373: { tipo: 'familia', rel: 'irmãos', simetrico: true },
  P1038: { tipo: 'familia', rel: 'parentes', simetrico: true },
  P135: { tipo: 'movimento' },
  P463: { tipo: 'grupo' },
  P69: { tipo: 'escola' },
};
export const TIPOS_DE_ELO = {
  mestre: 'Aprendeu com', influencia: 'Influência', familia: 'Família', movimento: 'Movimento', grupo: 'Grupo', escola: 'Escola', cita: 'A ficha cita',
};

/* o ano de "1815", "c. 1450", "384 a.C.", "-384" */
function anoDe(s) {
  if (s == null || s === '') return null;
  const t = String(s);
  const m = t.match(/-?\d{1,4}/);
  if (!m) return null;
  let n = parseInt(m[0], 10);
  if (/a\.?\s?C\.?|AC\b|BCE?\b/i.test(t) && n > 0) n = -n;
  return n;
}
function areaDe(meta) {
  const a = String(meta['área'] || meta.area || '').toLowerCase().trim();
  return AREAS[a] || (a ? a.charAt(0).toUpperCase() + a.slice(1) : 'Outros');
}

let cache = null, cacheEm = 0;
async function lerColheita() {
  if (cache && Date.now() - cacheEm < 60000) return cache;
  try { cache = JSON.parse(await readFile(new URL('../teia-wikidata.json', import.meta.url), 'utf8')); }
  catch { cache = { colhido: null, fichas: {}, itens: {} }; }
  cacheEm = Date.now();
  return cache;
}
async function fichasDeAtlantis() {
  try {
    const t = await readFile(new URL('../../vale-serafim-3d/src/hall/portal.js', import.meta.url), 'utf8');
    return new Set([...t.matchAll(/"(atlas\/[^"]+)"/g)].map((m) => m[1]));
  } catch { return new Set(); }
}

/**
 * A teia inteira.
 * @param {{incluir?: (item) => boolean}} op  incluir: quais fichas entram (o site público passa o filtro dele)
 */
export async function teia({ incluir = () => true } = {}) {
  const [ctx, col, atl] = await Promise.all([obterIndice(), lerColheita(), fichasDeAtlantis()]);
  const fichas = ctx.itens.filter((i) => i.cls.acervo === 'atlas' && (i.tipo === 'pessoa' || /\/5 Groups/.test(i.cls.pasta || '')) && incluir(i));

  const nos = new Map(), porQid = new Map();
  for (const it of fichas) {
    const m = it.meta || {}, w = (col.fichas || {})[it.id] || {};
    const pessoa = it.tipo === 'pessoa';
    const no = {
      id: it.id, tipo: pessoa ? 'pessoa' : 'grupo', nome: it.titulo, area: areaDe(m),
      sub: pessoa ? [m['ofício'] || m.oficio, m.campo].filter(Boolean).join(' · ') : [m['domínio'] || m.dominio, m['período'] || m.periodo].filter(Boolean).join(' · '),
      origem: m.origem || '',
      nasc: pessoa ? (anoDe(m.nascimento) ?? w.nasc ?? null) : null,
      morte: pessoa ? (anoDe(m.morte) ?? w.morte ?? null) : null,
      capa: it.capa ? urlMidia(it.capa) : null,
      resumo: String(it.resumo || '').slice(0, 220),
    };
    if (atl.has(it.id)) no.atlantis = true;
    nos.set(it.id, no);
    if (w.qid) porQid.set(w.qid, it.id);
  }

  /* os elos crus, e quantas fichas apontam cada item de fora */
  const crus = [], contaFora = new Map();
  for (const it of fichas) {
    const w = (col.fichas || {})[it.id];
    if (!w || !w.elos) continue;
    for (const [p, lista] of Object.entries(w.elos)) {
      const e = ELO[p];
      if (!e) continue;
      for (const q of lista) {
        crus.push({ ficha: it.id, q, e });
        if (!porQid.has(q)) {
          const k = q + '|' + e.tipo;
          if (!contaFora.has(k)) contaFora.set(k, new Set());
          contaFora.get(k).add(it.id);
        }
      }
    }
  }

  const elos = new Map();
  function somar(de, para, tipo, rel, simetrico) {
    if (de === para) return;
    if (simetrico && de > para) [de, para] = [para, de];
    const k = de + '|' + para + '|' + tipo + '|' + (rel || '');
    if (!elos.has(k)) elos.set(k, { de, para, tipo, ...(rel ? { rel } : {}) });
  }
  for (const { ficha, q, e } of crus) {
    let alvo = porQid.get(q);
    if (!alvo) {
      const fora = (col.itens || {})[q];
      if (!fora) continue;
      const n = (contaFora.get(q + '|' + e.tipo) || new Set()).size;
      if (n < 2) {
        // um elo só, com quem não tem ficha: fica no painel da ficha (mestres, família), sem nó na teia
        if (e.tipo === 'mestre' || e.tipo === 'familia') {
          const no = nos.get(ficha);
          (no.extras = no.extras || []).push({ nome: fora.nome, tipo: e.tipo, rel: e.rel || '', ida: !e.inverte, wikidata: 'https://www.wikidata.org/wiki/' + q });
        }
        continue;
      }
      alvo = 'wd:' + q;
      if (!nos.has(alvo)) {
        nos.set(alvo, {
          id: alvo, fora: true, nome: fora.nome,
          tipo: fora.humano ? 'pessoa' : e.tipo === 'escola' ? 'escola' : 'grupo',
          area: null, nasc: fora.nasc ?? null, morte: fora.morte ?? null, capa: null, sub: '',
          wikidata: 'https://www.wikidata.org/wiki/' + q,
        });
      }
    }
    if (e.inverte) somar(alvo, ficha, e.tipo, e.rel, e.simetrico);
    else somar(ficha, alvo, e.tipo, e.rel, e.simetrico);
  }
  /* o que as próprias fichas citam umas das outras */
  for (const it of fichas) {
    for (const s of it.saem || []) {
      const alvo = typeof s === 'string' ? s : s && s.id;
      if (alvo && nos.has(alvo) && alvo !== it.id) somar(it.id, alvo, 'cita');
    }
  }

  /* os de fora herdam a área de quem eles mais tocam (para cair perto na teia) */
  const vizinhos = new Map();
  for (const l of elos.values()) {
    for (const [a, b] of [[l.de, l.para], [l.para, l.de]]) { if (!vizinhos.has(a)) vizinhos.set(a, []); vizinhos.get(a).push(b); }
  }
  for (const no of nos.values()) {
    if (no.area) continue;
    const conta = {};
    for (const v of vizinhos.get(no.id) || []) { const a = nos.get(v) && nos.get(v).area; if (a) conta[a] = (conta[a] || 0) + 1; }
    no.area = Object.entries(conta).sort((x, y) => y[1] - x[1])[0]?.[0] || 'Outros';
  }

  const contaArea = {};
  for (const no of nos.values()) if (!no.fora) contaArea[no.area] = (contaArea[no.area] || 0) + 1;
  const areas = Object.keys(contaArea)
    .sort((a, b) => (ORDEM_AREAS.indexOf(a) + 1 || 99) - (ORDEM_AREAS.indexOf(b) + 1 || 99) || a.localeCompare(b, 'pt'))
    .map((nome) => ({ id: nome, nome, fichas: contaArea[nome] }));

  return {
    colhido: col.colhido || null,
    fonte: 'Fichas do Atlas; elos do Wikidata (CC0)',
    tipos: TIPOS_DE_ELO,
    areas,
    nos: [...nos.values()],
    elos: [...elos.values()],
  };
}
