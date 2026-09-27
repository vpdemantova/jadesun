import { readFile, writeFile, mkdir, rename, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COFRE, normalizar } from './vault.mjs';
import { obterIndice } from './biblioteca.mjs';

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
      cor: corDe(autor || titulo),
    });
  }
  await ligarAtlas(livros);
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

function formatarCelula(s) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

function linhaDaTabela(l) {
  return '| ' + [
    l.titulo, l.tituloOriginal, l.autor, (l.tags || []).join(', '), l.status, l.destino,
    l.prioridade || '', l.paginaAtual || '', l.paginasTotal || '',
    l.formato || '', l.tamanho || '', l.material || '', l.medidas || '', l.suporte || '', l.tipoScan || '', l.comercial || '',
    l.secaoReal || '',
  ].map(formatarCelula).join(' | ') + ' |';
}

async function garantirBackupDoDia(arquivo) {
  await mkdir(join(RAIZ, 'dados'), { recursive: true });
  const dia = new Date().toISOString().slice(0, 10);
  const copia = join(RAIZ, 'dados', `backup-livros-${dia}.md`);
  if (!existsSync(copia)) await copyFile(arquivo, copia);
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
export async function salvarLivro({ tituloAntigo, autorAntigo, titulo, tituloOriginal, autor, tags, status, destino, prioridade, paginaAtual, paginasTotal, formato, tamanho, material, medidas, suporte, tipoScan, comercial, secaoReal }) {
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

  const novaLinha = linhaDaTabela({ titulo: t, tituloOriginal, autor, tags, status, destino, prioridade, paginaAtual, paginasTotal, formato, tamanho, material, medidas, suporte, tipoScan, comercial, secaoReal });

  await garantirBackupDoDia(arquivo);

  const editado = indiceEdicao >= 0;
  if (editado) linhas[indiceEdicao] = novaLinha;
  else linhas.splice(ultimaLinhaTabela + 1, 0, novaLinha);

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
    while (novaCol.length < 17) novaCol.push('');
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
    while (novaCol.length < 17) novaCol.push('');
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
