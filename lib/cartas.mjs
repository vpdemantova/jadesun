/* ============================================================
   CARTAS — o Fichário do Atlas, fase F1 (03/out/2026)
   Uma ficha do Atlas vista como carta colecionável (63 × 88 mm).
   Tudo vem da ficha e do índice da Biblioteca: nada é inventado.
   Plano: blessednotebook/Logboard/# Board/Focos/O Fichário — Plano.md
   ============================================================ */
import { obterIndice, urlMidia, ficha, resolverNome } from './biblioteca.mjs';
import { normalizar } from './vault.mjs';

const TIPOS = {
  pessoa: 'Pessoa', obra: 'Obra', leitura: 'Obra', 'estudo de obra': 'Obra', lugar: 'Lugar', elemento: 'Elemento',
  'elemento quimico': 'Elemento', especie: 'Ser vivo', instrumento: 'Instrumento', objeto: 'Objeto',
  'ferramenta industrial': 'Objeto', era: 'Era', conceito: 'Conceito', lingua: 'Língua', oficio: 'Ofício',
};
const AREAS = {
  musicos: ['Música', 'musica'], musica: ['Música', 'musica'], literatura: ['Literatura', 'letras'], escritores: ['Literatura', 'letras'],
  cientistas: ['Ciência', 'ciencia'], ciencias: ['Ciência', 'ciencia'], filosofos: ['Filosofia', 'filosofia'], pintores: ['Pintura', 'pintura'],
  elementos: ['Química', 'ciencia'], cosmos: ['Cosmos', 'ciencia'], historia: ['História', 'historia'], natureza: ['Natureza', 'natureza'],
};
const SECOES_FORA = new Set(['Coleções', 'Tábuas']);

const primeira = (s) => { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); };
/* sobrenomes em grafias diferentes: Tchaikovski/Tchaikovsky, Stravinski/Stravinsky */
const dobrar = (s) => normalizar(s).replace(/y/g, 'i');

/* a primeira frase da ficha, sem parênteses (datas, pronúncia), sem notas [1] e sem marcação */
function frase(corpo, resumo) {
  const blocos = String(corpo || '').split(/\r?\n\s*\r?\n/).map((p) => p.trim());
  const par = blocos.find((p) => p && !/^(#|!|>|\||---|\*Da )/.test(p)) || String(resumo || '');
  let t = par
    .replace(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  for (let i = 0; i < 4; i++) t = t.replace(/\s*\([^()]*\)/g, '');
  t = t.replace(/\[[^\]]*\]/g, '').replace(/[*_]/g, '').replace(/\s+,/g, ',').replace(/\s+/g, ' ').trim();
  const fim = t.search(/\.\s+[A-ZÁÉÍÓÚÂÊÔÃÕ]/);
  if (fim > 40) t = t.slice(0, fim + 1);
  if (t.length <= 130) return t;
  t = t.slice(0, 130);
  return t.slice(0, t.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '…';
}

/* o autor da imagem como o Commons o escreve, às vezes com marcação: fica só o nome legível */
function limparCredito(s) {
  let t = String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/\[\s*\d+\s*\]/g, '')
    .replace(/^[^:]*\.(jpe?g|png|tiff?)\s*:\s*/i, '')
    .replace(/\s*derivative work:.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  t = t.replace(/^(.+?) \1$/, '$1');
  return t.length > 70 ? t.slice(0, 70).replace(/\s+\S*$/, '') + '…' : t;
}

function dadosDe(m) {
  const tipo = normalizar(m.tipo || '');
  const juntar = (...xs) => xs.filter(Boolean).map(String);
  const vida = m.nascimento ? (m.morte ? `${m.nascimento}–${m.morte}` : `nascido em ${m.nascimento}`) : '';
  if (tipo === 'pessoa') return juntar(vida, m.origem, m['ofício']);
  if (tipo === 'instrumento') return juntar(m['família'] && `família: ${m['família'].toLowerCase()}`, m.origem);
  if (tipo === 'lugar') return juntar(m.continente, m.capital && `capital: ${m.capital}`);
  if (/elemento/.test(tipo)) return juntar(m['símbolo'] || m.simbolo, (m['número'] || m['numero atomico']) && `nº ${m['número'] || m['numero atomico']}`, m.categoria);
  if (/obra|leitura/.test(tipo)) return juntar(m.compositor || m.autor || m.artista, m.ano);
  if (tipo === 'especie') return juntar(m['nome científico'], m.categoria);
  return juntar(m.ano || m.anos, m.categoria, m.origem).slice(0, 3);
}

function feitosDe(ctx, it) {
  if (normalizar(it.meta.tipo || '') !== 'pessoa') return [];
  const partes = dobrar(it.titulo).split(' ').filter((p) => p.length > 2);
  const sobrenome = partes[partes.length - 1];
  if (!sobrenome) return [];
  const achados = [];
  for (const x of ctx.itens) {
    if (x.cls.acervo !== 'atlas' || x.id === it.id || SECOES_FORA.has(x.cls.secao)) continue;
    const quem = x.meta.compositor || x.meta.autor || x.meta.artista || x.meta.pintor;
    if (!quem) continue;
    if (!dobrar(quem).split(' ').includes(sobrenome)) continue;
    achados.push({ id: x.id, titulo: x.meta.obra || x.titulo, ano: x.meta.ano || '' });
  }
  const n = (a) => { const m = String(a).match(/\d{3,4}/); return m ? +m[0] : 9999; };
  return achados.sort((a, b) => n(a.ano) - n(b.ano)).slice(0, 2);
}

function colecaoDe(ctx, it) {
  for (const c of ctx.itens) {
    if (normalizar(c.meta.tipo || '') !== 'colecao') continue;
    const linhas = c.corpo.split(/\r?\n/).filter((l) => /^- \d{1,3} · /.test(l));
    for (const l of linhas) {
      const m = l.match(/^- (\d{1,3}) · \[\[([^\]|#]+)/);
      if (m && resolverNome(ctx, c, m[2].trim()) === it.id) {
        return { id: c.id, nome: c.meta.colecao || c.titulo, sigla: c.meta.sigla || '', numero: m[1].padStart(3, '0'), total: String(linhas.length).padStart(3, '0') };
      }
    }
  }
  return null;
}

export async function carta({ id = '', nome = '' } = {}) {
  const ctx = await obterIndice();
  let it = id ? ctx.porId.get(id) : null;
  if (!it && nome) {
    const ids = ctx.porNome.get(normalizar(nome)) || [];
    it = ids.map((x) => ctx.porId.get(x)).find((x) => x.cls.acervo === 'atlas') || (ids[0] && ctx.porId.get(ids[0]));
  }
  if (!it) return null;

  const m = it.meta;
  const tipoN = normalizar(m.tipo || '');
  const area = AREAS[normalizar(m['área'] || m.area || '')] || null;
  const img = it.imagens[0] || null;
  const feitos = feitosDe(ctx, it);

  const f = await ficha(it.id);
  const vistos = new Set([it.id, ...feitos.map((x) => x.id)]);
  const elos = [];
  for (const x of [...(f ? f.chegam : []), ...(f ? f.mencoes : []), ...(f ? f.saem : [])]) {
    if (elos.length >= 3) break;
    if (!x || vistos.has(x.id) || x.acervo !== 'atlas' || SECOES_FORA.has(x.secao) || /^\d/.test(x.titulo)) continue;
    vistos.add(x.id);
    elos.push({ id: x.id, titulo: x.titulo });
  }

  return {
    id: it.id,
    titulo: it.titulo,
    tipo: TIPOS[tipoN] || primeira(m.tipo || it.cls.secao),
    area: area ? area[0] : (m['área'] ? primeira(m['área']) : it.cls.secao),
    classe: 'k-' + (area ? area[1] : (tipoN === 'lugar' ? 'lugar' : 'geral')),
    raridade: 'comum',
    imagem: img ? urlMidia(img.rel) : null,
    credito: img ? { autor: limparCredito(img.autor), licenca: img.licenca || '', fonte: img.fonte || '' } : null,
    dados: dadosDe(m),
    feitos,
    elos,
    frase: frase(it.corpo, it.resumo),
    colecao: colecaoDe(ctx, it),
  };
}
