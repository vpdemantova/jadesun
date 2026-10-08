/* ============================================================
   TÁBUAS E GRANDES OBRAS — os dois módulos extras do Domino (02/out/2026)
   Antes de cada matéria: a Tábua (o mapa da área: tabela periódica, países,
   espécies, nomes, conceitos, objetos), lida de
   `3 Atlas…/0 Tábuas/Tábua — <Matéria>.md` (frontmatter `materia:`).
   Depois de cada matéria: as Grandes Obras, um estudo completo por livro, em
   `3 Atlas…/2 Work/Books/Grandes Obras — <Matéria>/` (frontmatter
   `tipo: estudo de obra`, `materia:`, `autor:`, `ano:`).
   Tudo sai do índice da Biblioteca: nada é gravado, só lido.
   ============================================================ */
import { obterIndice, urlMidia, resolverNome, ligarTrecho } from './biblioteca.mjs';
import { normalizar } from './vault.mjs';

const colador = new Intl.Collator('pt', { numeric: true, sensitivity: 'base' });

/** "c. 300 a.C." → -300; "1845–1862" → 1845; sem número → fim da fila. */
export function anoNumero(v) {
  const s = String(v || '');
  const m = s.match(/(\d{1,4})/);
  if (!m) return 99999;
  return /a\.\s?C/i.test(s) ? -Number(m[1]) : Number(m[1]);
}

/** Linha e coluna de um elemento na tábua de 18 colunas, só pelo número atômico.
 * Lantanídeos e actinídeos vão para as duas linhas de baixo (8 e 9). */
export function posicaoNaTabua(z) {
  if (z === 1) return { linha: 1, coluna: 1 };
  if (z === 2) return { linha: 1, coluna: 18 };
  if (z <= 4) return { linha: 2, coluna: z - 2 };
  if (z <= 10) return { linha: 2, coluna: z + 8 };
  if (z <= 12) return { linha: 3, coluna: z - 10 };
  if (z <= 18) return { linha: 3, coluna: z };
  if (z <= 36) return { linha: 4, coluna: z - 18 };
  if (z <= 54) return { linha: 5, coluna: z - 36 };
  if (z <= 56) return { linha: 6, coluna: z - 54 };
  if (z <= 71) return { linha: 8, coluna: z - 54 };
  if (z <= 86) return { linha: 6, coluna: z - 68 };
  if (z <= 88) return { linha: 7, coluna: z - 86 };
  if (z <= 103) return { linha: 9, coluna: z - 86 };
  if (z <= 118) return { linha: 7, coluna: z - 100 };
  return null;
}

/* A ficha do In (49) veio da coleta automática com o título e o texto de "Indígenas"
 * (a Wikipédia desviou "Índio" para o povo). Até alguém corrigir a ficha, a tábua mostra o nome certo. */
const NOME_CERTO = { 49: 'Índio' };

const capaDe = (it) => (it && it.capa ? urlMidia(it.capa) : null);

function fichaCurta(it) {
  const extra = it.meta.anos || it.meta.ano || it.meta.capital || it.meta['nome científico'] || '';
  return { id: it.id, titulo: it.titulo, capa: capaDe(it), extra };
}

/** "Do Atlas: Elementos, como tábua periódica" · "Do Atlas: Reinos e países, por continente, onde categoria = país". */
function gerar(ctx, diretiva) {
  const partes = diretiva.split(',').map((s) => s.trim()).filter(Boolean);
  const secao = partes[0] || '';
  const opcoes = partes.slice(1).join(', ');
  let lista = ctx.itens.filter((i) => i.cls.acervo === 'atlas' && normalizar(i.cls.secao) === normalizar(secao));
  if (!lista.length) return { tipo: 'vazio', secao };

  if (/t[aá]bua peri[oó]dica/i.test(opcoes)) {
    const elementos = [];
    for (const it of lista) {
      const m = it.meta;
      const z = Number(m['número'] || m.numero || m['numero atomico'] || m['número atômico']);
      const pos = posicaoNaTabua(z);
      if (!pos) continue;
      const categoria = m.categoria || ({ metaloide: 'semimetal' })[m.familia] || m.familia || '';
      const massa = m.massa || String(m['massa atomica'] || m['massa atômica'] || '').replace(/\s*u$/, '');
      elementos.push({ z, ...pos, simbolo: m['símbolo'] || m.simbolo || '', nome: NOME_CERTO[z] || it.titulo, id: it.id, categoria, massa });
    }
    elementos.sort((a, b) => a.z - b.z);
    return { tipo: 'periodica', secao, total: elementos.length, elementos };
  }

  const onde = opcoes.match(/onde\s+([^=,]+?)\s*=\s*([^,]+)/i);
  if (onde) lista = lista.filter((i) => normalizar(i.meta[onde[1].trim()] || '') === normalizar(onde[2]));
  const por = (opcoes.match(/\bpor\s+([^,]+)/i) || [])[1];
  const chave = (i) => (por ? String(i.meta[por.trim()] || 'Outros') : (i.cls.sub || ''));
  const grupos = new Map();
  for (const it of lista) {
    const k = chave(it);
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(it);
  }
  const ordenar = (a, b) => {
    const da = a.meta.anos || a.meta.ano; const db = b.meta.anos || b.meta.ano;
    if (da || db) return anoNumero(da) - anoNumero(db);
    return colador.compare(a.titulo, b.titulo);
  };
  return {
    tipo: 'fichas', secao, total: lista.length,
    grupos: [...grupos].sort((a, b) => (b[1].length - a[1].length) || colador.compare(a[0], b[0]))
      .map(([nome, its]) => ({ nome, itens: its.sort(ordenar).map(fichaCurta) })),
  };
}

/** Uma linha de lista: "cabeça — texto". A cabeça pode ser um nome só ("[[Alvo|Rótulo]]",
 * "**Nome**", "Nome"), um nome com datas ("[[Euclides]] (c. 300 a.C.)") ou vários nomes
 * ("[[Resistor]], [[Capacitor]]…"), que viram um título composto, com os links resolvidos. */
function entrada(ctx, de, bruto) {
  const corte = bruto.search(/\s[—–]\s/);
  const cabeca = (corte >= 0 ? bruto.slice(0, corte) : bruto).trim();
  const texto = corte >= 0 ? bruto.slice(corte).replace(/^\s*[—–]\s*/, '') : '';
  const fichas = [...cabeca.matchAll(/\[\[[^\]]+\]\]|\*\*[^*]+\*\*/g)];
  let nome = ''; let alvo = ''; let extra = ''; let nomeMd = '';
  const resto = fichas.length === 1 && fichas[0].index === 0 ? cabeca.slice(fichas[0][0].length).trim() : null;
  if (resto !== null && (!resto || /^\([^()]*\)$/.test(resto))) {
    const tok = fichas[0][0];
    const m = tok.match(/^\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]$/);
    if (m) { alvo = m[1].trim(); nome = (m[2] || m[1]).trim(); } else { nome = tok.slice(2, -2).trim(); alvo = nome; }
    extra = resto;
  } else if (!fichas.length && corte >= 0 && cabeca.length <= 60 && !/[`[]/.test(cabeca)) {
    nome = cabeca; alvo = cabeca;
  } else if (corte >= 0 || fichas.length) {
    nomeMd = ligarTrecho(ctx, de, cabeca);
  }
  if (!nome && !nomeMd) return { nome: '', id: null, capa: null, texto: ligarTrecho(ctx, de, bruto) };
  const id = alvo ? resolverNome(ctx, de, alvo) : null;
  const f = id ? ctx.porId.get(id) : null;
  return { nome, nomeMd, extra, id: id || null, capa: capaDe(f), texto: ligarTrecho(ctx, de, texto) };
}

export function lerTabua(ctx, it) {
  const intro = [];
  const categorias = [];
  let cat = null;
  let md = [];
  let lista = null;
  let cerca = false;
  const fecharMd = () => {
    const t = md.join('\n').trim();
    if (t && cat) cat.blocos.push({ t: 'md', md: ligarTrecho(ctx, it, t) });
    md = [];
  };
  for (const l of it.corpo.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(l)) cerca = !cerca;
    if (cerca || /^\s*(```|~~~)/.test(l)) { (cat ? md : intro).push(l); lista = null; continue; }
    let m;
    if (/^#\s/.test(l)) continue;
    if ((m = l.match(/^##\s+(.+)$/))) { fecharMd(); cat = { nome: m[1].trim(), blocos: [] }; categorias.push(cat); lista = null; continue; }
    if (!cat) { intro.push(l); continue; }
    if ((m = l.match(/^###\s+(.+)$/))) { fecharMd(); cat.blocos.push({ t: 'h', texto: m[1].trim() }); lista = null; continue; }
    if ((m = l.match(/^Do Atlas:\s*(.+)$/i))) { fecharMd(); cat.blocos.push({ t: 'gerado', ...gerar(ctx, m[1]) }); lista = null; continue; }
    if ((m = l.match(/^[-*]\s+(.+)$/))) {
      fecharMd();
      if (!lista) { lista = { t: 'lista', entradas: [] }; cat.blocos.push(lista); }
      lista.entradas.push(entrada(ctx, it, m[1]));
      continue;
    }
    if (lista && /^\s{2,}\S/.test(l)) { const u = lista.entradas[lista.entradas.length - 1]; u.texto += ' ' + ligarTrecho(ctx, it, l.trim()); continue; }
    if (!l.trim()) { if (!lista) md.push(l); continue; }
    lista = null;
    md.push(l);
  }
  fecharMd();
  return {
    id: it.id, titulo: it.titulo,
    intro: ligarTrecho(ctx, it, intro.join('\n').trim()),
    categorias: categorias.filter((c) => c.blocos.length),
  };
}

function lerObra(ctx, it) {
  const autor = it.meta.autor || '';
  const nomeFicha = it.meta['autor-ficha'] || autor.split(/\s+e\s+|,|;/)[0].trim();
  const idAutor = nomeFicha ? resolverNome(ctx, it, nomeFicha) : null;
  const fAutor = idAutor ? ctx.porId.get(idAutor) : null;
  return {
    id: it.id, titulo: it.titulo,
    obra: it.meta.obra || it.titulo,
    original: it.meta['título original'] || it.meta['titulo original'] || '',
    autor, ano: it.meta.ano || '', anoN: anoNumero(it.meta['ano-ordem'] || it.meta.ano),
    frase: it.resumo || '',
    autorId: fAutor ? fAutor.id : null,
    retrato: capaDe(it) || capaDe(fAutor),
    itens: (it.meta.itens || '').split(/\s*;\s*/).filter(Boolean),
  };
}

export async function tabuasEObras() {
  const ctx = await obterIndice();
  const materias = {};
  const de = (nome) => { const k = String(nome).trim(); if (!materias[k]) materias[k] = { tabua: null, obras: [] }; return materias[k]; };
  for (const it of ctx.itens) {
    if (it.cls.acervo !== 'atlas' || !it.meta.materia) continue;
    const tipo = normalizar(it.meta.tipo || '');
    if (tipo === 'tabua da materia') de(it.meta.materia).tabua = lerTabua(ctx, it);
    else if (tipo === 'estudo de obra') de(it.meta.materia).obras.push(lerObra(ctx, it));
  }
  for (const m of Object.values(materias)) m.obras.sort((a, b) => (a.anoN - b.anoN) || colador.compare(a.titulo, b.titulo));
  return { gerado: ctx.gerado, materias };
}
