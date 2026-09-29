import { readFile, writeFile, mkdir, rename, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COFRE } from './vault.mjs';

/* O desenho da estante da casa dele: quais andares existem, como cada andar se divide em
   vãos (lado a lado) e quais tags moram em cada vão. Mora num arquivo do caderno
   (Minha Estante.md), em tabela de Markdown — legível e editável à mão no Obsidian.
   As listas de leitura têm aqui só o nome e "pra que serve"; quem está em cada lista (e
   em que ordem) fica na tabela de livros. */

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const REL = 'Logboard/# Board/Focos/Minha Estante.md';

const T_ANDARES = 'Andares e vãos';
const T_LISTAS = 'Listas de leitura';

const MODELO = `# Minha Estante

A estante da sua casa, do jeito que a página Estante monta. Você pode mexer clicando na página (botão "Organizar") ou editando as tabelas aqui — as duas formas valem.

- **Andar 1 é o de baixo.** Cada andar se divide em **vãos**, lado a lado, separados por divisórias verticais (o vão 1 é o da esquerda).
- **Cada tag mora em um vão.** Se um livro tem duas tags com vão, ele vai para a mais específica (a que tem menos livros; "romance" ganha de "literatura"). Não se escreve número na frente de nada: o andar e o vão são as duas primeiras colunas.
- Um livro específico pode ser forçado num vão pela coluna "Minha Estante" da tabela de [[Arrumar os Livros]] (escrevendo o nome do vão).

## ${T_ANDARES}

| Andar | Vão | Nome | Tags |
|---|---|---|---|

## ${T_LISTAS}

Quem está em cada lista, e em que ordem, fica na coluna "Listas de leitura" da tabela de [[Arrumar os Livros]] (assim: \`Nome da lista:3\`, o número é a posição). Aqui ficam o nome e a razão de cada lista.

| Lista | Para que serve |
|---|---|
`;

export function limpar(s, max = 80) {
  return String(s == null ? '' : s).replace(/[|\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}
const limparTag = (s) => limpar(String(s).replace(/,/g, ' '), 60);

function tabelaAndares(andares) {
  const linhas = ['| Andar | Vão | Nome | Tags |', '|---|---|---|---|'];
  andares.forEach((vaos, a) => vaos.forEach((v, i) => {
    linhas.push('| ' + (a + 1) + ' | ' + (i + 1) + ' | ' + limpar(v.nome, 60) + ' | ' + v.tags.join(', ') + ' |');
  }));
  return linhas;
}
function tabelaListas(listas) {
  const linhas = ['| Lista | Para que serve |', '|---|---|'];
  listas.forEach((l) => linhas.push('| ' + limpar(l.nome, 60) + ' | ' + limpar(l.desc, 240) + ' |'));
  return linhas;
}

function partir(linha) {
  return linha.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

/* linhas da primeira tabela logo abaixo de "## titulo" (sem cabeçalho nem separador) */
function linhasDaTabela(linhas, titulo) {
  const i = linhas.findIndex((l) => l.trim().toLowerCase() === ('## ' + titulo).toLowerCase());
  if (i < 0) return [];
  const saida = [];
  let viu = 0;
  for (let j = i + 1; j < linhas.length; j++) {
    if (/^##\s/.test(linhas[j])) break;
    if (!/^\s*\|/.test(linhas[j])) { if (viu) break; continue; }
    viu++;
    if (viu <= 2) continue;
    saida.push(partir(linhas[j]));
  }
  return saida;
}

export async function lerEstante() {
  const arquivo = join(COFRE, REL);
  if (!existsSync(arquivo)) return { existe: false, andares: [], listas: [] };
  const linhas = (await readFile(arquivo, 'utf8')).split(/\r?\n/);
  const porAndar = new Map();
  for (const c of linhasDaTabela(linhas, T_ANDARES)) {
    const a = parseInt(c[0], 10), v = parseInt(c[1], 10);
    if (!(a >= 1) || !(v >= 1)) continue;
    if (!porAndar.has(a)) porAndar.set(a, []);
    porAndar.get(a).push({ ordem: v, nome: c[2] || '', tags: (c[3] || '').split(',').map((t) => t.trim()).filter(Boolean) });
  }
  const andares = [...porAndar.keys()].sort((x, y) => x - y).map((k) => porAndar.get(k).sort((x, y) => x.ordem - y.ordem).map(({ nome, tags }) => ({ nome, tags })));
  const listas = linhasDaTabela(linhas, T_LISTAS).filter((c) => c[0]).map((c) => ({ nome: c[0], desc: c[1] || '' }));
  return { existe: true, andares, listas };
}

/* troca a tabela de uma seção pelo texto novo, sem tocar no resto do arquivo */
function substituirTabela(linhas, titulo, novas) {
  const i = linhas.findIndex((l) => l.trim().toLowerCase() === ('## ' + titulo).toLowerCase());
  if (i < 0) { linhas.push('', '## ' + titulo, '', ...novas, ''); return; }
  let ini = -1, fim = -1;
  for (let j = i + 1; j < linhas.length; j++) {
    if (/^##\s/.test(linhas[j])) break;
    if (/^\s*\|/.test(linhas[j])) { if (ini < 0) ini = j; fim = j; }
    else if (ini >= 0) break;
  }
  if (ini < 0) { linhas.splice(i + 1, 0, '', ...novas, ''); return; }
  linhas.splice(ini, fim - ini + 1, ...novas);
}

function validar({ andares, listas }) {
  if (!Array.isArray(andares) || andares.length > 30) throw Object.assign(new Error('Andares inválidos.'), { status: 400 });
  const okAndares = andares.map((vaos) => {
    if (!Array.isArray(vaos) || vaos.length < 1 || vaos.length > 12) throw Object.assign(new Error('Cada andar precisa de 1 a 12 vãos.'), { status: 400 });
    return vaos.map((v) => ({
      nome: limpar(v && v.nome, 60) || 'Vão',
      tags: [...new Set(((v && v.tags) || []).map(limparTag).filter(Boolean))].slice(0, 80),
    }));
  });
  const vistos = new Set();
  const okListas = (Array.isArray(listas) ? listas : []).slice(0, 60).map((l) => ({ nome: limpar(String((l && l.nome) || '').replace(/[,:]/g, ' '), 60), desc: limpar(l && l.desc, 240) }))
    .filter((l) => l.nome && !vistos.has(l.nome.toLowerCase()) && vistos.add(l.nome.toLowerCase()));
  return { andares: okAndares, listas: okListas };
}

export async function gravarEstante(corpo) {
  const { andares, listas } = validar(corpo || {});
  const arquivo = join(COFRE, REL);
  let bruto = MODELO;
  if (existsSync(arquivo)) {
    bruto = await readFile(arquivo, 'utf8');
    await mkdir(join(RAIZ, 'dados'), { recursive: true });
    const copia = join(RAIZ, 'dados', `backup-estante-${new Date().toISOString().slice(0, 10)}.md`);
    if (!existsSync(copia)) await copyFile(arquivo, copia);
  }
  const eol = bruto.includes('\r\n') ? '\r\n' : '\n';
  const linhas = bruto.split(/\r?\n/);
  substituirTabela(linhas, T_ANDARES, tabelaAndares(andares));
  substituirTabela(linhas, T_LISTAS, tabelaListas(listas));
  await writeFile(`${arquivo}.tmp`, linhas.join(eol), 'utf8');
  await rename(`${arquivo}.tmp`, arquivo);
  return { ok: true, andares: andares.length };
}
