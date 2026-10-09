/* ============================================================
   DOMÍNIO DOS CONCEITOS (09/out/2026, PERFIL.md item 74)
   O Checklist mede os itens que a prova cobra; cada estudo da Seleção tem também os seus
   conceitos (os subtópicos de "O que se estuda"). Marcar um conceito = "resolveria uma questão
   disto sem abrir o cursinho". As marcas moram num arquivo próprio do caderno, legível e
   editável à mão, ao lado do Checklist:

     Logboard/# Board/Focos/Domínio — conceitos.md

     ## QUI-01 · O que é Química e Materiais
     - [x] Matéria e materiais · 2026-10-09
     - [ ] Substâncias e misturas

   Só as caixinhas contam. O arquivo nasce na primeira marca; o Checklist e os estudos não mudam.
   Antes de cada gravação do dia, uma cópia vai para dados/backup-dominio-AAAA-MM-DD.md.
   ============================================================ */
import { readFile, writeFile, rename, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COFRE, CAMINHOS } from './vault.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
export const ARQUIVO_DOMINIO = CAMINHOS.focos + '/Domínio — conceitos.md';
const CAB_RE = /^##\s+([A-Z]{3}-\d{2})\s*·\s*(.*)$/;
const LINHA_RE = /^(\s*-\s+\[)( |x|X)(\]\s+)(.*?)(?:\s+·\s+(\d{4}-\d{2}-\d{2}))?\s*$/;
const INTRO = [
  '# Domínio — conceitos',
  '',
  '> Escrito pelo Portal Solar (página Domínio). Cada estudo da Seleção, com os seus conceitos (os subtópicos de "O que se estuda").',
  '> [x] = dominado: resolveria uma questão disto sem abrir o cursinho. A data depois do "·" é o dia da marca.',
  '> Pode editar à mão: só as caixinhas contam. Os itens da prova continuam no Checklist do Vestibular.',
  '',
];

const caminho = () => join(COFRE, ARQUIVO_DOMINIO);
const limpar = (t) => String(t || '').replace(/\s+/g, ' ').trim();

function ler(md) {
  const blocos = [];
  let atual = null;
  md.split(/\r?\n/).forEach((linha, i) => {
    const c = linha.match(CAB_RE);
    if (c) { atual = { codigo: c[1], titulo: c[2].trim(), linha: i, conceitos: [] }; blocos.push(atual); return; }
    if (/^#{1,2}\s/.test(linha)) { atual = null; return; }
    const m = atual && linha.match(LINHA_RE);
    if (m) atual.conceitos.push({ nome: limpar(m[4]), feito: m[2] !== ' ', data: m[5] || '', linha: i });
  });
  return blocos;
}

/** { existe, arquivo, marcas: { 'QUI-01': { 'Matéria e materiais': '2026-10-09' } } } — só os marcados */
export async function lerDominio() {
  const arq = caminho();
  if (!existsSync(arq)) return { existe: false, arquivo: ARQUIVO_DOMINIO, marcas: {} };
  const blocos = ler(await readFile(arq, 'utf8'));
  const marcas = {};
  for (const b of blocos) for (const c of b.conceitos) if (c.feito) (marcas[b.codigo] = marcas[b.codigo] || {})[c.nome] = c.data || 'sim';
  return { existe: true, arquivo: ARQUIVO_DOMINIO, marcas };
}

/** marca ou desmarca conceitos de um estudo. `conceitos`: os nomes a mudar; `todos`: a lista inteira do
 *  estudo (para escrever o bloco completo na primeira vez, com as caixinhas vazias também). */
export async function marcarConceitos({ codigo, titulo, conceitos, todos, feito }) {
  if (!/^[A-Z]{3}-\d{2}$/.test(codigo || '')) throw Object.assign(new Error('Código de estudo inválido.'), { status: 400 });
  const lista = (conceitos || []).map(limpar).filter(Boolean);
  if (!lista.length || lista.length > 60) throw Object.assign(new Error('Conceitos inválidos.'), { status: 400 });
  const arq = caminho();
  const existe = existsSync(arq);
  const bruto = existe ? await readFile(arq, 'utf8') : INTRO.join('\n');
  const eol = bruto.includes('\r\n') ? '\r\n' : '\n';
  const linhas = bruto.split(/\r?\n/);
  const hoje = new Date().toISOString().slice(0, 10);
  const blocos = ler(bruto);
  let b = blocos.find((x) => x.codigo === codigo);
  if (!b) {
    /* bloco novo no fim, com todos os conceitos do estudo (os outros desmarcados) */
    while (linhas.length && linhas[linhas.length - 1].trim() === '') linhas.pop();
    const nomes = [...new Set([...(todos || []).map(limpar).filter(Boolean), ...lista])];
    linhas.push('', `## ${codigo} · ${limpar(titulo) || codigo}`);
    for (const n of nomes) linhas.push(`- [${feito && lista.includes(n) ? 'x' : ' '}] ${n}${feito && lista.includes(n) ? ' · ' + hoje : ''}`);
    linhas.push('');
  } else {
    let ultima = b.conceitos.length ? b.conceitos[b.conceitos.length - 1].linha : b.linha;
    for (const n of lista) {
      const c = b.conceitos.find((x) => x.nome === n);
      const nova = `- [${feito ? 'x' : ' '}] ${n}${feito ? ' · ' + hoje : ''}`;
      if (c) {
        if (c.feito === feito) continue;
        linhas[c.linha] = nova;
      } else {
        linhas.splice(ultima + 1, 0, nova);
        ultima += 1;
        /* as linhas abaixo andaram uma posição: relê os blocos para não errar a próxima */
        b = ler(linhas.join('\n')).find((x) => x.codigo === codigo);
      }
    }
  }
  await mkdir(join(RAIZ, 'dados'), { recursive: true });
  if (existe) {
    const copia = join(RAIZ, 'dados', `backup-dominio-${hoje}.md`);
    if (!existsSync(copia)) await copyFile(arq, copia);
  } else {
    await mkdir(dirname(arq), { recursive: true });
  }
  await writeFile(`${arq}.tmp`, linhas.join(eol), 'utf8');
  await rename(`${arq}.tmp`, arq);
  return lerDominio();
}
