import { readFile, writeFile, mkdir, rename, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COFRE } from './vault.mjs';

/* A porta da Música (o piano da Casa): o checklist dos vídeos de Habilidades Específicas, lido e
   marcado direto no arquivo do caderno. Só as caixinhas da seção "Checklist rápido" mudam; o resto
   do arquivo fica como está. Cópia do dia em dados/ antes de gravar. */

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const REL = 'Logboard/# Board/Focos/Vídeos de Música — Habilidades Específicas.md';
// janela de envio confirmada na Comvest (ver CLAUDE.md): vídeos de 14 a 30/09/2026
export const PRAZO_VIDEOS = '2026-09-30';
const ITEM = /^(\s*[-*]\s+\[)([ xX])(\]\s+)(.*)$/;
const limparTexto = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

function secao(linhas) {
  const i = linhas.findIndex((l) => /^##\s+checklist/i.test(l.trim()));
  if (i < 0) return [];
  const idx = [];
  for (let j = i + 1; j < linhas.length; j++) {
    if (/^##\s/.test(linhas[j])) break;
    if (ITEM.test(linhas[j])) idx.push(j);
  }
  return idx;
}

export async function lerMusica() {
  const arquivo = join(COFRE, REL);
  if (!existsSync(arquivo)) return { existe: false, itens: [], prazo: PRAZO_VIDEOS, arquivo: REL };
  const linhas = (await readFile(arquivo, 'utf8')).split(/\r?\n/);
  const itens = secao(linhas).map((j) => { const m = linhas[j].match(ITEM); return { texto: limparTexto(m[4]), feito: m[2] !== ' ' }; });
  return { existe: true, itens, prazo: PRAZO_VIDEOS, arquivo: REL };
}

export async function marcarMusica({ texto, feito }) {
  const arquivo = join(COFRE, REL);
  if (!existsSync(arquivo)) throw Object.assign(new Error('O arquivo dos vídeos de Música não existe.'), { status: 404 });
  const bruto = await readFile(arquivo, 'utf8');
  const eol = bruto.includes('\r\n') ? '\r\n' : '\n';
  const linhas = bruto.split(/\r?\n/);
  const alvo = secao(linhas).find((j) => limparTexto(linhas[j].match(ITEM)[4]) === limparTexto(texto));
  if (alvo == null) throw Object.assign(new Error('Não achei esse item no checklist.'), { status: 404 });
  linhas[alvo] = linhas[alvo].replace(ITEM, (_, a, _b, c, d) => a + (feito ? 'x' : ' ') + c + d);
  await mkdir(join(RAIZ, 'dados'), { recursive: true });
  const copia = join(RAIZ, 'dados', `backup-musica-${new Date().toISOString().slice(0, 10)}.md`);
  if (!existsSync(copia)) await copyFile(arquivo, copia);
  await writeFile(`${arquivo}.tmp`, linhas.join(eol), 'utf8');
  await rename(`${arquivo}.tmp`, arquivo);
  return lerMusica();
}
