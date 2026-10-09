import { readFile, writeFile, mkdir, rename, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COFRE } from './vault.mjs';

/* A Casa mora num arquivo do caderno (Minha Casa.md), em quatro tabelas legíveis e editáveis
   à mão: as casas (a real e as dos sonhos), os cômodos, as portas/janelas e os móveis.
   Mesmo contrato do Guarda-roupa: a página lê tudo e grava tudo; se o arquivo mudou por fora
   desde a leitura, a gravação é recusada (409) em vez de passar por cima. */

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const REL = 'Logboard/# Board/Focos/Minha Casa.md';
const T = { casas: 'Casas', comodos: 'Cômodos', aberturas: 'Portas e janelas', moveis: 'Móveis' };
const COLS = {
  casas: ['Casa', 'Tipo', 'Estilo', 'Referência', 'Notas'],
  comodos: ['Casa', 'Cômodo', 'Forma', 'x', 'y', 'Largura', 'Profundidade', 'Nível', 'Pé-direito', 'Piso', 'Parede'],
  aberturas: ['Casa', 'Cômodo', 'Tipo', 'Lado', 'Posição', 'Largura', 'Altura', 'Peitoril'],
  moveis: ['Casa', 'Móvel', 'Tipo', 'x', 'y', 'Nível', 'Giro', 'Cor'],
};

const limpar = (s, max = 80) => String(s == null ? '' : s).replace(/[|\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const num = (s, min, max, padrao) => { const v = parseFloat(String(s).replace(',', '.')); return Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v * 1000) / 1000)) : padrao; };
const fmt = (v) => (Number.isFinite(v) ? String(Math.round(v * 1000) / 1000).replace('.', ',') : '');
const versaoDe = (texto) => createHash('sha1').update(texto).digest('hex').slice(0, 16);
const erro = (m, status = 400) => Object.assign(new Error(m), { status });

function partir(linha) { return linha.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()); }
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
  const l = texto.split(/\r?\n/);
  const casas = tabela(l, T.casas).filter((c) => c[0]).map((c) => ({ nome: c[0], tipo: c[1] || 'sonho', estilo: c[2] || 'livre', referencia: c[3] || '', notas: c[4] || '' }));
  const comodos = tabela(l, T.comodos).filter((c) => c[0] && c[1]).map((c) => ({
    casa: c[0], nome: c[1], forma: c[2] || 'retângulo', x: num(c[3], -200, 200, 0), y: num(c[4], -200, 200, 0),
    largura: num(c[5], 0.3, 80, 3), profundidade: num(c[6], 0.3, 80, 3), nivel: num(c[7], -5, 30, 0), pe: num(c[8], 1.8, 12, 2.7), piso: c[9] || '', parede: c[10] || '',
  }));
  const aberturas = tabela(l, T.aberturas).filter((c) => c[0] && c[1]).map((c) => ({
    casa: c[0], comodo: c[1], tipo: c[2] || 'porta', lado: (c[3] || 'S').toUpperCase().slice(0, 1), posicao: c[4] === '' || c[4] == null ? null : num(c[4], 0, 80, 0),
    largura: num(c[5], 0.3, 20, 0.9), altura: num(c[6], 0.3, 10, 2.1), peitoril: c[7] === '' || c[7] == null ? null : num(c[7], 0, 5, 0.9),
  }));
  const moveis = tabela(l, T.moveis).filter((c) => c[0] && c[2]).map((c) => ({
    casa: c[0], nome: c[1] || c[2], tipo: c[2], x: num(c[3], -200, 200, 0), y: num(c[4], -200, 200, 0), nivel: num(c[5], -5, 30, 0), giro: num(c[6], -360, 360, 0), cor: c[7] || '',
  }));
  return { casas, comodos, aberturas, moveis };
}

export async function lerCasa() {
  const arquivo = join(COFRE, REL);
  if (!existsSync(arquivo)) return { existe: false, casas: [], comodos: [], aberturas: [], moveis: [], versao: '' };
  const texto = await readFile(arquivo, 'utf8');
  return { existe: true, ...interpretar(texto), versao: versaoDe(texto) };
}

function validar(c) {
  const lista = (x, max) => (Array.isArray(x) ? x.slice(0, max) : []);
  const vistos = new Set();
  const casas = lista(c.casas, 30).map((k) => ({ nome: limpar(k && k.nome, 60), tipo: limpar(k.tipo, 20) || 'sonho', estilo: limpar(k.estilo, 30) || 'livre', referencia: limpar(k.referencia, 200), notas: limpar(k.notas, 400) }))
    .filter((k) => k.nome && !vistos.has(k.nome.toLowerCase()) && vistos.add(k.nome.toLowerCase()));
  if (!casas.length) throw erro('Precisa haver ao menos uma casa.');
  const nomes = new Set(casas.map((k) => k.nome));
  const comodos = lista(c.comodos, 600).filter((k) => k && nomes.has(k.casa)).map((k) => ({
    casa: k.casa, nome: limpar(k.nome, 50) || 'Cômodo', forma: limpar(k.forma, 20) || 'retângulo', x: num(k.x, -200, 200, 0), y: num(k.y, -200, 200, 0),
    largura: num(k.largura, 0.3, 80, 3), profundidade: num(k.profundidade, 0.3, 80, 3), nivel: num(k.nivel, -5, 30, 0), pe: num(k.pe, 1.8, 12, 2.7), piso: limpar(k.piso, 30), parede: limpar(k.parede, 30),
  }));
  const aberturas = lista(c.aberturas, 1200).filter((k) => k && nomes.has(k.casa)).map((k) => ({
    casa: k.casa, comodo: limpar(k.comodo, 50), tipo: /jan/i.test(k.tipo) ? 'janela' : 'porta', lado: String(k.lado || 'S').toUpperCase().slice(0, 1).replace(/[^NSLO]/, 'S'),
    posicao: k.posicao == null || k.posicao === '' ? null : num(k.posicao, 0, 80, 0), largura: num(k.largura, 0.3, 20, 0.9), altura: num(k.altura, 0.3, 10, 2.1),
    peitoril: k.peitoril == null || k.peitoril === '' ? null : num(k.peitoril, 0, 5, 0.9),
  }));
  const moveis = lista(c.moveis, 2000).filter((k) => k && nomes.has(k.casa) && k.tipo).map((k) => ({
    casa: k.casa, nome: limpar(k.nome, 50), tipo: limpar(k.tipo, 40), x: num(k.x, -200, 200, 0), y: num(k.y, -200, 200, 0), nivel: num(k.nivel, -5, 30, 0), giro: num(k.giro, -360, 360, 0), cor: limpar(k.cor, 30),
  }));
  return { casas, comodos, aberturas, moveis };
}

const MODELO = `# Minha Casa

A casa, do jeito que a página **Casa** do Portal Solar monta em 3D: você desenha a planta e ela levanta as paredes, as portas, as janelas e os móveis. Dá pra mexer clicando na página ou aqui nas tabelas — as duas formas valem.

- Medidas em metros. \`x\` cresce pra direita e \`y\` pra baixo na planta (pra frente da casa). Lados: N (fundo), S (frente), L (direita), O (esquerda).
- Cada cômodo é um retângulo (ou um \`cilindro\`, ou um \`pátio\` sem paredes). Onde dois cômodos se encostam, vira uma parede só.
- \`Parede\` pode ser uma cor (\`branco\`, \`azul bauhaus\`, \`#1f4ea8\`…) ou \`vidro\`, \`shoji\`, \`tijolo\`, \`madeira\`, \`nenhuma\`.
- Os móveis \`estante\` e \`guarda-roupa\` são a sua Estante e o seu Guarda-roupa de verdade: tocar neles na casa abre as páginas deles.

## ${T.casas}

| ${COLS.casas.join(' | ')} |
|${COLS.casas.map(() => '---').join('|')}|

## ${T.comodos}

| ${COLS.comodos.join(' | ')} |
|${COLS.comodos.map(() => '---').join('|')}|

## ${T.aberturas}

| ${COLS.aberturas.join(' | ')} |
|${COLS.aberturas.map(() => '---').join('|')}|

## ${T.moveis}

| ${COLS.moveis.join(' | ')} |
|${COLS.moveis.map(() => '---').join('|')}|
`;

export async function gravarCasa(corpo) {
  const d = validar(corpo || {});
  const arquivo = join(COFRE, REL);
  let bruto = MODELO;
  if (existsSync(arquivo)) {
    bruto = await readFile(arquivo, 'utf8');
    if (corpo.versao && corpo.versao !== versaoDe(bruto)) throw erro('O arquivo Minha Casa.md mudou fora da página (no Obsidian?). Recarreguei o que está lá — refaça a última mudança.', 409);
    await mkdir(join(RAIZ, 'dados'), { recursive: true });
    const copia = join(RAIZ, 'dados', `backup-casa-${new Date().toISOString().slice(0, 10)}.md`);
    if (!existsSync(copia)) await copyFile(arquivo, copia);
  }
  const eol = bruto.includes('\r\n') ? '\r\n' : '\n';
  const linhas = bruto.split(/\r?\n/);
  const linha = (cels) => '| ' + cels.join(' | ') + ' |';
  const cab = (k) => [linha(COLS[k]), '|' + COLS[k].map(() => '---').join('|') + '|'];
  substituirTabela(linhas, T.casas, [...cab('casas'), ...d.casas.map((k) => linha([k.nome, k.tipo, k.estilo, k.referencia, k.notas]))]);
  substituirTabela(linhas, T.comodos, [...cab('comodos'), ...d.comodos.map((k) => linha([k.casa, k.nome, k.forma, fmt(k.x), fmt(k.y), fmt(k.largura), fmt(k.profundidade), fmt(k.nivel), fmt(k.pe), k.piso, k.parede]))]);
  substituirTabela(linhas, T.aberturas, [...cab('aberturas'), ...d.aberturas.map((k) => linha([k.casa, k.comodo, k.tipo, k.lado, k.posicao == null ? '' : fmt(k.posicao), fmt(k.largura), fmt(k.altura), k.peitoril == null ? '' : fmt(k.peitoril)]))]);
  substituirTabela(linhas, T.moveis, [...cab('moveis'), ...d.moveis.map((k) => linha([k.casa, k.nome, k.tipo, fmt(k.x), fmt(k.y), fmt(k.nivel), fmt(k.giro), k.cor]))]);
  const texto = linhas.join(eol);
  await writeFile(`${arquivo}.tmp`, texto, 'utf8');
  await rename(`${arquivo}.tmp`, arquivo);
  return { ok: true, versao: versaoDe(texto) };
}
