import { readFile, readdir, writeFile, mkdir, rename, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COFRE, normalizar } from './vault.mjs';
import { obterIndice } from './biblioteca.mjs';
import { limpar } from './estante.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

/* Lê a tabela "Catalogados" de Arrumar os Livros.md e devolve uma lista
   estruturada — usada pela Estante 3D. Não grava nada neste arquivo. */

const REL = 'Logboard/# Board/Focos/Arrumar os Livros.md';

export function slug(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function celula(s) {
  return String(s || '').trim().replace(/\*/g, '').trim();
}

function partirLinha(linha) {
  const s = linha.trim().replace(/^\|/, '').replace(/\|$/, '');
  const col = [];
  let atual = '', escapando = false;
  for (const ch of s) {
    if (escapando) { atual += ch; escapando = false; continue; }
    if (ch === '\\') { escapando = true; continue; }
    if (ch === '|') { col.push(atual); atual = ''; continue; }
    atual += ch;
  }
  col.push(atual);
  return col.map(celula);
}

const CORES = ['#c9564a', '#4a7fbf', '#3f9e6b', '#c99a2e', '#8a5abf', '#bf5a8a', '#5a8fa8', '#a86b3f'];
function corDe(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return CORES[h % CORES.length];
}

async function construir() {
  let texto;
  try { texto = await readFile(join(COFRE, REL), 'utf8'); } catch { return { livros: [], gerado: new Date().toISOString(), erro: 'arquivo não encontrado' }; }
  const linhas = texto.split(/\r?\n/);
  const livros = [];
  let dentro = false, colunas = null, i2 = 0;
  for (const linha of linhas) {
    if (/^###\s+Catalogados/i.test(linha)) { dentro = true; continue; }
    if (dentro && /^###\s+/.test(linha)) break;
    if (!dentro) continue;
    if (!/^\s*\|/.test(linha)) continue;
    const col = partirLinha(linha);
    if (/^-{2,}$/.test(col[0] || '') || col.every((c) => /^:?-{2,}:?$/.test(c))) continue;
    if (!colunas) { colunas = col.map((c) => c.toLowerCase()); continue; }
    if (col.length < 3) continue;
    const obj = {};
    colunas.forEach((c, idx) => { obj[c] = col[idx] || ''; });
    const titulo = obj['título'] || obj['titulo'] || '';
    if (!titulo) continue;
    const autor = obj['autor'] || '';
    const tags = (obj['tags'] || '').split(',').map((t) => t.trim()).filter(Boolean);
    const id = slug(titulo) + '-' + (i2++);
    const paginaAtual = +(obj['página atual'] || obj['pagina atual'] || '') || 0;
    const paginasTotal = +(obj['páginas totais'] || obj['paginas totais'] || '') || 0;
    livros.push({
      id,
      titulo,
      tituloOriginal: obj['título original'] || obj['titulo original'] || '',
      autor,
      autorSlug: slug(autor || 'desconhecido'),
      tags,
      status: obj['status'] || '',
      destino: obj['destino'] || '',
      prioridade: obj['prioridade'] || '',
      paginaAtual,
      paginasTotal,
      progresso: paginasTotal > 0 ? Math.max(0, Math.min(100, Math.round(paginaAtual / paginasTotal * 100))) : null,
      formato: obj['formato'] || '',
      tamanho: obj['tamanho'] || '',
      material: obj['material'] || '',
      medidas: obj['medidas'] || '',
      suporte: obj['físico ou digital'] || obj['fisico ou digital'] || '',
      tipoScan: obj['tipo do scan'] || obj['tipo de scan'] || '',
      comercial: obj['dados comerciais'] || '',
      secaoReal: obj['minha estante'] || '',
      listas: lerListas(obj['listas de leitura'] || ''),
      cor: corDe(autor || titulo),
    });
  }
  await ligarAtlas(livros);
  await ligarEstudos(livros);
  return { livros, gerado: new Date().toISOString() };
}

/* nomes que batem na mesma pessoa mas foram escritos diferente entre o catálogo (português)
   e a ficha do Atlas (às vezes em outra grafia/língua) — conferido manualmente, não chute
   automático: cada par foi checado que é a mesma pessoa antes de entrar aqui. */
const ALIAS_ATLAS = {
  [normalizar('Platão')]: normalizar('Plato'),
  [normalizar('Arnold Schoenberg')]: normalizar('Arnold Schönberg'),
};

/* liga cada livro à ficha de Pessoa do Atlas, quando o autor já tem uma — nunca cria
   ficha nova nem inventa link: só aponta quando o nome bate de verdade. Cobre "Sobrenome,
   Nome" e "Nome Sobrenome", já que o catálogo usa o primeiro formato e o Atlas o segundo. */
async function ligarAtlas(livros) {
  let ctx;
  try { ctx = await obterIndice(); } catch { return; }
  const pessoas = ctx.itens.filter((it) => it.cls.secao === 'Pessoas');
  const porNome = new Map();
  for (const p of pessoas) porNome.set(normalizar(p.titulo), p);
  for (const l of livros) {
    if (!l.autor) continue;
    const partes = l.autor.split(',').map((s) => s.trim()).filter(Boolean);
    const variantes = [l.autor, partes.length === 2 ? `${partes[1]} ${partes[0]}` : ''].filter(Boolean).map(normalizar);
    for (const v of variantes.slice()) if (ALIAS_ATLAS[v]) variantes.push(ALIAS_ATLAS[v]);
    const achado = variantes.map((v) => porNome.get(v)).find(Boolean);
    if (achado) { l.atlasId = achado.id; l.atlasTitulo = achado.titulo; }
  }
}

/* notas de estudo dos livros: um arquivo por livro em Books/ (mesmo nome do título), com uma seção
   "Leitura por partes" cheia de "- [ ]" — o progresso vem de contar os "- [x]". Só leitura. */
const PASTA_ESTUDOS = 'Logboard/# Board/_-!-_ Controle/_ Lessons _/a Readings/Books';

async function ligarEstudos(livros) {
  let nomes;
  try { nomes = (await readdir(join(COFRE, PASTA_ESTUDOS))).filter((n) => /\.md$/i.test(n)); } catch { return; }
  const porNome = new Map(nomes.map((n) => [normalizar(n.replace(/\.md$/i, '')), n]));
  for (const l of livros) {
    const arquivo = porNome.get(normalizar(l.titulo));
    if (!arquivo) continue;
    let texto = '';
    try { texto = await readFile(join(COFRE, PASTA_ESTUDOS, arquivo), 'utf8'); } catch { continue; }
    let dentro = false, total = 0, feitas = 0;
    for (const linha of texto.split(/\r?\n/)) {
      if (/^##\s/.test(linha)) { dentro = /^##\s+Leitura por partes/i.test(linha); continue; }
      if (!dentro) continue;
      const m = /^\s*-\s+\[( |x|X)\]/.exec(linha);
      if (m) { total++; if (m[1] !== ' ') feitas++; }
    }
    l.estudo = { arquivo, caminho: join(COFRE, PASTA_ESTUDOS, arquivo), total, feitas };
  }
}

let memo = null, memoEm = 0, emAndamento = null;

function reconstruir() {
  if (!emAndamento) emAndamento = construir().then((r) => { memo = r; memoEm = Date.now(); return r; }).finally(() => { emAndamento = null; });
  return emAndamento;
}

export async function obterLivros(forcar = false) {
  if (!forcar && memo) {
    if (Date.now() - memoEm >= 300000) reconstruir().catch(() => {});
    return memo;
  }
  return reconstruir();
}

/* busca em uma base bibliográfica real (Google Books, sem chave) — nunca inventa dado:
   só devolve o que a base tem, pra pessoa conferir antes de aceitar. */
const MAPA_CATEGORIAS = [
  [/science fiction/i, 'ficção científica'],
  [/poetry/i, 'poesia'],
  [/philosophy/i, 'filosofia'],
  [/body, mind|new age|occult/i, 'esoterismo'],
  [/religio/i, 'religião'],
  [/biograph/i, 'biografia'],
  [/histor/i, 'história'],
  [/psycholog/i, 'psicologia'],
  [/architect/i, 'arquitetura'],
  [/\bdesign\b/i, 'design'],
  [/\bart\b|aesthetic/i, 'estética'],
  [/social science|sociolog/i, 'sociedade'],
  [/political/i, 'política'],
  [/nature|ecolog/i, 'ecologia'],
  [/literary criticism|criticism/i, 'crítica'],
  [/short stories/i, 'contos'],
  [/\bmusic/i, 'música'],
  [/study aids|education/i, 'método de estudo'],
  [/reference/i, 'consulta'],
  [/essay/i, 'ensaio'],
  [/fiction/i, 'romance'],
];

function tagsDeCategoria(categorias) {
  const achadas = new Set();
  for (const c of categorias || []) {
    for (const [re, tag] of MAPA_CATEGORIAS) if (re.test(c)) achadas.add(tag);
  }
  return [...achadas];
}

export async function buscarDadosLivro(titulo) {
  const t = String(titulo || '').trim();
  if (!t) return { resultados: [] };
  const url = 'https://openlibrary.org/search.json?limit=6&fields=title,author_name,first_publish_year,subject&q=' + encodeURIComponent(t);
  let dados;
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) return { resultados: [], erro: 'A busca não respondeu (código ' + resp.status + ').' };
    dados = await resp.json();
  } catch {
    return { resultados: [], erro: 'Não consegui alcançar a base de livros agora — confira a internet.' };
  }
  const vistos = new Set();
  const resultados = [];
  for (const doc of dados.docs || []) {
    if (!doc.title) continue;
    const chave = doc.title.toLowerCase() + '|' + (doc.author_name || []).join(',').toLowerCase();
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    resultados.push({
      titulo: doc.title,
      autor: (doc.author_name || []).slice(0, 3).join(' e '),
      ano: doc.first_publish_year ? String(doc.first_publish_year) : '',
      tags: tagsDeCategoria(doc.subject),
    });
  }
  return { resultados };
}

/* "Nome da lista:3" = o livro está na lista, na posição 3 (sem número = sem posição ainda) */
const N_COLS = 18;
function lerListas(cel) {
  return String(cel || '').split(',').map((x) => x.trim()).filter(Boolean).map((x) => {
    const m = /^(.*?)(?::(\d+))?$/.exec(x);
    return { nome: m[1].trim(), pos: m[2] ? +m[2] : 0 };
  }).filter((x) => x.nome);
}
function escreverListas(arr) {
  return (arr || []).map((x) => (x.pos ? x.nome + ':' + x.pos : x.nome)).join(', ');
}
const lerTags = (cel) => String(cel || '').split(',').map((x) => x.trim()).filter(Boolean);
const nomeLista = (x) => limpar(String(x || '').replace(/[,:]/g, ' '), 60);
const nomeTag = (x) => limpar(String(x || '').replace(/,/g, ' '), 60);

function formatarCelula(s) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

function linhaDaTabela(l) {
  return '| ' + [
    l.titulo, l.tituloOriginal, l.autor, (l.tags || []).join(', '), l.status, l.destino,
    l.prioridade || '', l.paginaAtual || '', l.paginasTotal || '',
    l.formato || '', l.tamanho || '', l.material || '', l.medidas || '', l.suporte || '', l.tipoScan || '', l.comercial || '',
    l.secaoReal || '', escreverListas(l.listas),
  ].map(formatarCelula).join(' | ') + ' |';
}

async function garantirBackupDoDia(arquivo) {
  await mkdir(join(RAIZ, 'dados'), { recursive: true });
  const dia = new Date().toISOString().slice(0, 10);
  const copia = join(RAIZ, 'dados', `backup-livros-${dia}.md`);
  if (!existsSync(copia)) await copyFile(arquivo, copia);
}

/* a tabela ganhou uma 18ª coluna ("Listas de leitura"): na primeira gravação, acrescenta no
   cabeçalho e no separador. Linhas antigas, de 17 células, continuam valendo (célula faltando = vazia). */
function ajustarCabecalho(linhas) {
  let dentro = false, n = 0;
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    if (/^###\s+Catalogados/i.test(linha)) { dentro = true; continue; }
    if (dentro && /^###\s+/.test(linha)) break;
    if (!dentro || !/^\s*\|/.test(linha)) continue;
    n++;
    if (n === 1) {
      const col = partirLinha(linha);
      if (col.length !== 17 || /listas de leitura/i.test(linha)) return;
      linhas[i] = linha.replace(/\s*$/, '') + ' Listas de leitura |';
    } else if (n === 2) {
      linhas[i] = linha.replace(/\s*$/, '') + '---|';
      return;
    }
  }
}

/* percorre as linhas da tabela "Catalogados" chamando `sobre(col, i)` pra cada uma —
   compartilhado por salvarLivro e renomearValor, os dois jeitos de editar o arquivo. */
function percorrerTabela(linhas, sobre) {
  let dentro = false, temCabecalho = false, ultimaLinhaTabela = -1;
  linhas.forEach((linha, i) => {
    if (/^###\s+Catalogados/i.test(linha)) { dentro = true; return; }
    if (dentro && /^###\s+/.test(linha)) { dentro = false; return; }
    if (!dentro || !/^\s*\|/.test(linha)) return;
    const col = partirLinha(linha);
    if (col.every((c) => /^:?-{2,}:?$/.test(c))) return;
    if (!temCabecalho) { temCabecalho = true; return; }
    ultimaLinhaTabela = i;
    sobre(col, i);
  });
  return ultimaLinhaTabela;
}

/* adiciona (sem tituloAntigo) ou edita (com tituloAntigo+autorAntigo, a chave de antes de mudar)
   uma linha da tabela "Catalogados" — nunca toca o resto do arquivo (pilhas, "a confirmar", etc). */
export async function salvarLivro({ tituloAntigo, autorAntigo, titulo, tituloOriginal, autor, tags, status, destino, prioridade, paginaAtual, paginasTotal, formato, tamanho, material, medidas, suporte, tipoScan, comercial, secaoReal, listas }) {
  const t = String(titulo || '').trim();
  if (!t) throw Object.assign(new Error('Título é obrigatório.'), { status: 400 });
  const arquivo = join(COFRE, REL);
  if (!existsSync(arquivo)) throw Object.assign(new Error('Arrumar os Livros.md não encontrado no vault.'), { status: 404 });
  const bruto = await readFile(arquivo, 'utf8');
  const eol = bruto.includes('\r\n') ? '\r\n' : '\n';
  const linhas = bruto.split(/\r?\n/);

  let indiceEdicao = -1;
  const ultimaLinhaTabela = percorrerTabela(linhas, (col, i) => {
    if (tituloAntigo != null && col[0] === tituloAntigo && (autorAntigo == null || col[2] === autorAntigo)) indiceEdicao = i;
  });
  if (ultimaLinhaTabela < 0) throw Object.assign(new Error('Não achei a tabela "Catalogados" no arquivo — não mexi em nada.'), { status: 500 });

  const novaLinha = linhaDaTabela({ titulo: t, tituloOriginal, autor, tags, status, destino, prioridade, paginaAtual, paginasTotal, formato, tamanho, material, medidas, suporte, tipoScan, comercial, secaoReal, listas: (Array.isArray(listas) ? listas : []).map((x) => ({ nome: nomeLista(x && x.nome), pos: Math.max(0, parseInt(x && x.pos, 10) || 0) })).filter((x) => x.nome) });

  await garantirBackupDoDia(arquivo);

  const editado = indiceEdicao >= 0;
  if (editado) linhas[indiceEdicao] = novaLinha;
  else linhas.splice(ultimaLinhaTabela + 1, 0, novaLinha);
  ajustarCabecalho(linhas);

  await writeFile(`${arquivo}.tmp`, linhas.join(eol), 'utf8');
  await rename(`${arquivo}.tmp`, arquivo);
  await obterLivros(true);
  return { editado };
}

const COLUNA_DO_CAMPO = { status: 4, prioridade: 6, suporte: 13, secaoReal: 16 };

/* troca um valor por outro em toda a coluna (status ou prioridade) — usado pelo botão
   "renomear" na Estante: renomeia a categoria em todos os livros que a usam de uma vez,
   em vez de precisar editar livro por livro. */
export async function renomearValor(campo, de, para) {
  const idx = COLUNA_DO_CAMPO[campo];
  if (idx == null) throw Object.assign(new Error('Campo desconhecido.'), { status: 400 });
  const deT = String(de || '').trim();
  const paraT = String(para || '').trim();
  if (!deT || !paraT) throw Object.assign(new Error('Preciso do nome antigo e do novo.'), { status: 400 });
  const arquivo = join(COFRE, REL);
  if (!existsSync(arquivo)) throw Object.assign(new Error('Arrumar os Livros.md não encontrado no vault.'), { status: 404 });
  const bruto = await readFile(arquivo, 'utf8');
  const eol = bruto.includes('\r\n') ? '\r\n' : '\n';
  const linhas = bruto.split(/\r?\n/);

  let alterados = 0;
  percorrerTabela(linhas, (col, i) => {
    if ((col[idx] || '') !== deT) return;
    const novaCol = col.slice();
    novaCol[idx] = paraT;
    while (novaCol.length < N_COLS) novaCol.push('');
    linhas[i] = '| ' + novaCol.map(formatarCelula).join(' | ') + ' |';
    alterados++;
  });
  if (!alterados) return { alterados: 0 };
  ajustarCabecalho(linhas);

  await garantirBackupDoDia(arquivo);
  await writeFile(`${arquivo}.tmp`, linhas.join(eol), 'utf8');
  await rename(`${arquivo}.tmp`, arquivo);
  await obterLivros(true);
  return { alterados };
}

/* atribui uma seção da "Minha Estante" a vários livros de uma vez — usado pelo botão
   "Atribuir a estes" na Estante: filtra por tag (ex. "romance"), atribui a seção pra
   todo mundo que aparece filtrado, num só passo, em vez de abrir livro por livro. */
export async function atribuirSecao(pares, secaoReal) {
  const valor = String(secaoReal || '').trim();
  if (!valor) throw Object.assign(new Error('Preciso do nome da seção.'), { status: 400 });
  if (!Array.isArray(pares) || !pares.length) throw Object.assign(new Error('Nenhum livro selecionado.'), { status: 400 });
  const arquivo = join(COFRE, REL);
  if (!existsSync(arquivo)) throw Object.assign(new Error('Arrumar os Livros.md não encontrado no vault.'), { status: 404 });
  const bruto = await readFile(arquivo, 'utf8');
  const eol = bruto.includes('\r\n') ? '\r\n' : '\n';
  const linhas = bruto.split(/\r?\n/);

  const alvo = new Set(pares.map((p) => `${p.titulo}␟${p.autor}`));
  let alterados = 0;
  percorrerTabela(linhas, (col, i) => {
    if (!alvo.has(`${col[0]}␟${col[2]}`)) return;
    const novaCol = col.slice();
    while (novaCol.length < N_COLS) novaCol.push('');
    novaCol[16] = valor;
    linhas[i] = '| ' + novaCol.map(formatarCelula).join(' | ') + ' |';
    alterados++;
  });
  if (!alterados) return { alterados: 0 };

  await garantirBackupDoDia(arquivo);
  await writeFile(`${arquivo}.tmp`, linhas.join(eol), 'utf8');
  await rename(`${arquivo}.tmp`, arquivo);
  await obterLivros(true);
  return { alterados };
}

/* edições em lote sobre a tabela "Catalogados": um só passo de leitura/gravação, com a mesma
   cópia do dia e gravação atômica das outras. Cobre tags (adicionar/tirar de alguns livros,
   renomear/juntar/apagar em todos), o vão forçado de cada livro e as listas de leitura
   (entrar/sair, renomear, apagar, reordenar). Nunca muda título, autor nem os outros campos. */
async function editarTabela(fn, preparar) {
  const arquivo = join(COFRE, REL);
  if (!existsSync(arquivo)) throw Object.assign(new Error('Arrumar os Livros.md não encontrado no vault.'), { status: 404 });
  const bruto = await readFile(arquivo, 'utf8');
  const eol = bruto.includes('\r\n') ? '\r\n' : '\n';
  const linhas = bruto.split(/\r?\n/);
  if (preparar) percorrerTabela(linhas, (col) => preparar(col));
  let alterados = 0;
  percorrerTabela(linhas, (col, i) => {
    const c = col.slice();
    while (c.length < N_COLS) c.push('');
    if (!fn(c)) return;
    linhas[i] = '| ' + c.map(formatarCelula).join(' | ') + ' |';
    alterados++;
  });
  if (!alterados) return { alterados: 0 };
  ajustarCabecalho(linhas);
  await garantirBackupDoDia(arquivo);
  await writeFile(`${arquivo}.tmp`, linhas.join(eol), 'utf8');
  await rename(`${arquivo}.tmp`, arquivo);
  await obterLivros(true);
  return { alterados };
}

const chaveDoPar = (p) => `${p && p.titulo}␟${p && p.autor}`;
const erro400 = (m) => Object.assign(new Error(m), { status: 400 });

export async function editarLote(corpo) {
  const { acao } = corpo || {};
  const alvo = Array.isArray(corpo.itens) ? new Set(corpo.itens.map(chaveDoPar)) : null;
  const doAlvo = (c) => alvo && alvo.has(`${c[0]}␟${c[2]}`);
  const tag = nomeTag(corpo.tag), de = String(corpo.de || '').trim();
  const lista = nomeLista(corpo.lista);

  if (acao === 'tag+' || acao === 'tag-') {
    if (!alvo || !alvo.size) throw erro400('Nenhum livro escolhido.');
    if (!tag) throw erro400('Falta o nome da tag.');
    return editarTabela((c) => {
      if (!doAlvo(c)) return false;
      const tags = lerTags(c[3]);
      const tem = tags.includes(tag);
      if (acao === 'tag+' ? tem : !tem) return false;
      c[3] = (acao === 'tag+' ? [...tags, tag] : tags.filter((t) => t !== tag)).join(', ');
      return true;
    });
  }
  if (acao === 'tag-renomear') {
    const para = nomeTag(corpo.para);
    if (!de || !para) throw erro400('Preciso do nome antigo e do novo.');
    return editarTabela((c) => {
      const tags = lerTags(c[3]);
      if (!tags.includes(de)) return false;
      c[3] = [...new Set(tags.map((t) => (t === de ? para : t)))].join(', ');
      return true;
    });
  }
  if (acao === 'tag-apagar') {
    if (!de) throw erro400('Falta o nome da tag.');
    return editarTabela((c) => {
      const tags = lerTags(c[3]);
      if (!tags.includes(de)) return false;
      c[3] = tags.filter((t) => t !== de).join(', ');
      return true;
    });
  }
  if (acao === 'vao') {
    if (!alvo || !alvo.size) throw erro400('Nenhum livro escolhido.');
    const valor = limpar(corpo.valor, 60);
    return editarTabela((c) => {
      if (!doAlvo(c) || c[16] === valor) return false;
      c[16] = valor;
      return true;
    });
  }
  if (acao === 'vao-renomear') {
    const para = limpar(corpo.para, 60);
    if (!de || !para) throw erro400('Preciso do nome antigo e do novo.');
    return editarTabela((c) => {
      if (c[16] !== de) return false;
      c[16] = para;
      return true;
    });
  }
  if (acao === 'lista+') {
    if (!alvo || !alvo.size) throw erro400('Nenhum livro escolhido.');
    if (!lista) throw erro400('Falta o nome da lista.');
    let maior = 0;
    return editarTabela((c) => {
      if (!doAlvo(c)) return false;
      const ls = lerListas(c[17]);
      if (ls.some((x) => x.nome === lista)) return false;
      ls.push({ nome: lista, pos: ++maior });
      c[17] = escreverListas(ls);
      return true;
    }, (c) => { lerListas(c[17] || '').forEach((x) => { if (x.nome === lista && x.pos > maior) maior = x.pos; }); });
  }
  if (acao === 'lista-') {
    if (!alvo || !alvo.size) throw erro400('Nenhum livro escolhido.');
    if (!lista) throw erro400('Falta o nome da lista.');
    return editarTabela((c) => {
      if (!doAlvo(c)) return false;
      const ls = lerListas(c[17]);
      if (!ls.some((x) => x.nome === lista)) return false;
      c[17] = escreverListas(ls.filter((x) => x.nome !== lista));
      return true;
    });
  }
  if (acao === 'lista-renomear') {
    const para = nomeLista(corpo.para), origem = nomeLista(corpo.de);
    if (!origem || !para) throw erro400('Preciso do nome antigo e do novo.');
    return editarTabela((c) => {
      const ls = lerListas(c[17]);
      const antiga = ls.find((x) => x.nome === origem);
      if (!antiga) return false;
      const jaTem = ls.find((x) => x.nome === para);
      c[17] = escreverListas(jaTem ? ls.filter((x) => x !== antiga) : ls.map((x) => (x === antiga ? { nome: para, pos: x.pos } : x)));
      return true;
    });
  }
  if (acao === 'lista-apagar') {
    if (!lista) throw erro400('Falta o nome da lista.');
    return editarTabela((c) => {
      const ls = lerListas(c[17]);
      if (!ls.some((x) => x.nome === lista)) return false;
      c[17] = escreverListas(ls.filter((x) => x.nome !== lista));
      return true;
    });
  }
  if (acao === 'lista-ordem') {
    if (!lista || !Array.isArray(corpo.itens)) throw erro400('Falta a lista ou a ordem.');
    const ordem = new Map(corpo.itens.map((p, i) => [chaveDoPar(p), i + 1]));
    return editarTabela((c) => {
      const ls = lerListas(c[17]);
      const x = ls.find((y) => y.nome === lista);
      if (!x) return false;
      const nova = ordem.get(`${c[0]}␟${c[2]}`) || (ordem.size + 1);
      if (x.pos === nova) return false;
      x.pos = nova;
      c[17] = escreverListas(ls);
      return true;
    });
  }
  throw erro400('Ação desconhecida.');
}
