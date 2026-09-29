import { readFile, writeFile, mkdir, rename, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COFRE } from './vault.mjs';

/* O guarda-roupa mora num arquivo do caderno (Guarda-roupa.md), em três tabelas legíveis e
   editáveis à mão no Obsidian: o móvel (módulos e divisões), as peças e os looks.
   A página lê tudo e grava tudo de uma vez; se o arquivo mudou por fora desde que a página
   leu (ex.: você editou no Obsidian), a gravação é recusada em vez de passar por cima. */

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const REL = 'Logboard/# Board/Focos/Guarda-roupa.md';
const T_MOVEL = 'Móvel', T_PECAS = 'Peças', T_LOOKS = 'Looks';

export const TIPOS_PARTE = ['cabideiro', 'prateleira', 'gaveta', 'sapateira'];
const COLS_PECAS = ['Peça', 'Tipo', 'Cor', 'Tecido', 'Estação', 'Ocasião', 'Lugar', 'Estado', 'Tags', 'Notas'];

const limpar = (s, max = 80) => String(s == null ? '' : s).replace(/[|\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const lista = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
const versaoDe = (texto) => createHash('sha1').update(texto).digest('hex').slice(0, 16);
const erro = (m, status = 400) => Object.assign(new Error(m), { status });

function partir(linha) {
  return linha.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}
function tabela(linhas, titulo) {
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
function substituirTabela(linhas, titulo, novas) {
  const i = linhas.findIndex((l) => l.trim().toLowerCase() === ('## ' + titulo).toLowerCase());
  if (i < 0) { linhas.push('', '## ' + titulo, '', ...novas, ''); return; }
  let ini = -1, fim = -1;
  for (let j = i + 1; j < linhas.length; j++) {
    if (/^##\s/.test(linhas[j])) break;
    if (/^\s*\|/.test(linhas[j])) { if (ini < 0) ini = j; fim = j; } else if (ini >= 0) break;
  }
  if (ini < 0) { linhas.splice(i + 1, 0, '', ...novas, ''); return; }
  linhas.splice(ini, fim - ini + 1, ...novas);
}

function interpretar(texto) {
  const linhas = texto.split(/\r?\n/);
  const porModulo = new Map();
  for (const c of tabela(linhas, T_MOVEL)) {
    const m = parseInt(c[0], 10), o = parseInt(c[1], 10);
    const tipo = String(c[2] || '').toLowerCase();
    if (!(m >= 1) || !TIPOS_PARTE.includes(tipo)) continue;
    if (!porModulo.has(m)) porModulo.set(m, []);
    porModulo.get(m).push({ ordem: o || 99, tipo, nome: c[3] || tipo });
  }
  const movel = [...porModulo.keys()].sort((a, b) => a - b).map((k) => porModulo.get(k).sort((a, b) => a.ordem - b.ordem).map(({ tipo, nome }) => ({ tipo, nome })));
  const pecas = tabela(linhas, T_PECAS).filter((c) => c[0]).map((c) => ({
    nome: c[0], tipo: c[1] || '', cor: c[2] || '', tecido: c[3] || '', estacao: c[4] || '', ocasiao: c[5] || '',
    lugar: c[6] || '', estado: c[7] || '', tags: lista(c[8]), notas: c[9] || '',
  }));
  const looks = tabela(linhas, T_LOOKS).filter((c) => c[0]).map((c) => ({
    nome: c[0], pecas: String(c[1] || '').split('+').map((x) => x.trim()).filter(Boolean), ocasiao: c[2] || '', notas: c[3] || '',
  }));
  return { movel, pecas, looks };
}

export async function lerGuardaRoupa() {
  const arquivo = join(COFRE, REL);
  if (!existsSync(arquivo)) return { existe: false, movel: [], pecas: [], looks: [], versao: '' };
  const texto = await readFile(arquivo, 'utf8');
  return { existe: true, ...interpretar(texto), versao: versaoDe(texto) };
}

function validar(corpo) {
  const movel = Array.isArray(corpo.movel) ? corpo.movel : null;
  if (!movel || movel.length > 12) throw erro('Móvel inválido.');
  const okMovel = movel.map((partes) => {
    if (!Array.isArray(partes) || !partes.length || partes.length > 10) throw erro('Cada módulo precisa de 1 a 10 divisões.');
    return partes.map((p) => {
      const tipo = String(p && p.tipo || '').toLowerCase();
      if (!TIPOS_PARTE.includes(tipo)) throw erro('Tipo de divisão desconhecido: ' + tipo);
      return { tipo, nome: limpar(p.nome, 50) || tipo };
    });
  });
  const vistos = new Set();
  const okPecas = (Array.isArray(corpo.pecas) ? corpo.pecas : []).slice(0, 800).map((p) => ({
    nome: limpar(p && p.nome, 70).replace(/\+/g, ' '), tipo: limpar(p.tipo, 30), cor: limpar(p.cor, 30), tecido: limpar(p.tecido, 40),
    estacao: limpar(p.estacao, 40), ocasiao: limpar(p.ocasiao, 50), lugar: limpar(p.lugar, 50), estado: limpar(p.estado, 30),
    tags: [...new Set((Array.isArray(p.tags) ? p.tags : lista(p.tags)).map((t) => limpar(String(t).replace(/,/g, ' '), 30)).filter(Boolean))].slice(0, 20),
    notas: limpar(p.notas, 240),
  })).filter((p) => p.nome && !vistos.has(p.nome.toLowerCase()) && vistos.add(p.nome.toLowerCase()));
  const nomes = new Set(okPecas.map((p) => p.nome));
  const vistosL = new Set();
  const okLooks = (Array.isArray(corpo.looks) ? corpo.looks : []).slice(0, 200).map((l) => ({
    nome: limpar(l && l.nome, 60), pecas: (Array.isArray(l.pecas) ? l.pecas : []).map((x) => limpar(x, 70)).filter((x) => nomes.has(x)),
    ocasiao: limpar(l.ocasiao, 50), notas: limpar(l.notas, 240),
  })).filter((l) => l.nome && !vistosL.has(l.nome.toLowerCase()) && vistosL.add(l.nome.toLowerCase()));
  return { movel: okMovel, pecas: okPecas, looks: okLooks };
}

const MODELO = `# Guarda-roupa

O seu guarda-roupa, do jeito que a página **Guarda-roupa** monta em 3D. Dá pra mexer clicando na página ou editando as tabelas aqui — as duas formas valem.

- **Móvel:** módulos lado a lado (o 1 é o da esquerda); cada módulo tem divisões de cima pra baixo: \`cabideiro\`, \`prateleira\`, \`gaveta\` ou \`sapateira\`.
- **Peças:** a coluna *Lugar* é o nome de uma divisão. *Estado* "para lavar" manda a peça pro cesto; "doar" manda pra caixa de doação.
- **Looks:** as peças de um look separadas por \` + \` (o nome exato de cada peça).

## ${T_MOVEL}

| Módulo | Ordem | Tipo | Nome |
|---|---|---|---|

## ${T_PECAS}

| ${COLS_PECAS.join(' | ')} |
|${COLS_PECAS.map(() => '---').join('|')}|

## ${T_LOOKS}

| Look | Peças | Ocasião | Notas |
|---|---|---|---|
`;

export async function gravarGuardaRoupa(corpo) {
  const dados = validar(corpo || {});
  const arquivo = join(COFRE, REL);
  let bruto = MODELO;
  if (existsSync(arquivo)) {
    bruto = await readFile(arquivo, 'utf8');
    if (corpo.versao && corpo.versao !== versaoDe(bruto)) throw erro('O arquivo Guarda-roupa.md mudou fora da página (no Obsidian?). Recarreguei o que está lá — refaça a última mudança.', 409);
    await mkdir(join(RAIZ, 'dados'), { recursive: true });
    const copia = join(RAIZ, 'dados', `backup-guarda-roupa-${new Date().toISOString().slice(0, 10)}.md`);
    if (!existsSync(copia)) await copyFile(arquivo, copia);
  }
  const eol = bruto.includes('\r\n') ? '\r\n' : '\n';
  const linhas = bruto.split(/\r?\n/);
  const linhaDe = (cels) => '| ' + cels.join(' | ') + ' |';
  substituirTabela(linhas, T_MOVEL, ['| Módulo | Ordem | Tipo | Nome |', '|---|---|---|---|',
    ...dados.movel.flatMap((partes, m) => partes.map((p, o) => linhaDe([m + 1, o + 1, p.tipo, p.nome])))]);
  substituirTabela(linhas, T_PECAS, [linhaDe(COLS_PECAS), '|' + COLS_PECAS.map(() => '---').join('|') + '|',
    ...dados.pecas.map((p) => linhaDe([p.nome, p.tipo, p.cor, p.tecido, p.estacao, p.ocasiao, p.lugar, p.estado, p.tags.join(', '), p.notas]))]);
  substituirTabela(linhas, T_LOOKS, ['| Look | Peças | Ocasião | Notas |', '|---|---|---|---|',
    ...dados.looks.map((l) => linhaDe([l.nome, l.pecas.join(' + '), l.ocasiao, l.notas]))]);
  const texto = linhas.join(eol);
  await writeFile(`${arquivo}.tmp`, texto, 'utf8');
  await rename(`${arquivo}.tmp`, arquivo);
  return { ok: true, versao: versaoDe(texto) };
}
