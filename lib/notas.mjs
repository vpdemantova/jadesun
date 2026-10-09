/* ============================================================
   O CADERNO DE NOTAS (09/out/2026, PERFIL.md item 75)
   "Um editor de notas zen e minimalista, integrado como o blessednotebook: nota e somente nota, abre um
   plano e escreve, já salva e tem certeza de que aquilo fica armazenado e seguro logo de cara; se clicar,
   dá pra salvar em outro lugar (mover), acessar todos os outros arquivos, criar pastas e projetos."

   As notas são arquivos do caderno, em texto puro. A nota nova nasce na Entrada (Logboard/z Entrada).
   A segurança:
   · toda gravação é atômica (arquivo .tmp, depois troca de nome): ou grava inteiro, ou não grava;
   · nada se sobrescreve às cegas: quem grava manda o "hash" da versão que leu; se o arquivo mudou no
     caderno (o Obsidian, outro aparelho), a gravação não acontece e a página recebe a versão nova;
   · antes da primeira mudança do dia numa nota que já existia, uma cópia vai para dados/notas-backups;
   · mover e criar nunca passam por cima de um arquivo que já exista;
   · o b Studio (há senhas lá) e as pastas de sistema (.obsidian, .git) ficam de fora, para ler e para gravar.
   ============================================================ */
import { readFile, writeFile, readdir, mkdir, rename, stat, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, basename, extname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { COFRE, PROIBIDO } from './vault.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PASTA_BACKUPS = join(RAIZ, 'dados', 'notas-backups');
export const ENTRADA = 'Logboard/z Entrada';
const LIMITE = 2_000_000;
const EXT = /\.(md|txt)$/i;

const erro = (msg, status = 400) => Object.assign(new Error(msg), { status });
const hashDe = (t) => createHash('sha256').update(t, 'utf8').digest('hex').slice(0, 16);
const fora = (rel) => /(^|\/)\.(obsidian|git|trash)(\/|$)/i.test(rel) || /(^|\/)node_modules(\/|$)/.test(rel);

/** um caminho do caderno, conferido: dentro do caderno, sem "..", fora do b Studio e das pastas de sistema */
function caminho(rel, { pasta = false } = {}) {
  const r = String(rel || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
  if (r.split('/').some((p) => p === '..' || p === '.')) throw erro('Caminho inválido.');
  if (r && (PROIBIDO.test(r) || fora(r))) throw erro('Esta pasta fica de fora do caderno de notas.', 403);
  if (!pasta && !EXT.test(r)) throw erro('Só notas de texto (.md ou .txt).');
  const abs = join(COFRE, r);
  const dentro = relative(COFRE, abs);
  if (dentro.startsWith('..') || dentro.includes(`..${sep}`)) throw erro('Fora do caderno.', 403);
  return { rel: r, abs };
}
function nomeLimpo(t) {
  return String(t || '').replace(/^#+\s*/, '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/[. ]+$/, '').slice(0, 90);
}
function carimbo(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}h${p(d.getMinutes())}`;
}
async function livre(pastaAbs, base, ext = '.md') {
  let nome = `${base}${ext}`, n = 2;
  while (existsSync(join(pastaAbs, nome))) nome = `${base} ${n++}${ext}`;
  return nome;
}
async function gravarAtomico(abs, texto) {
  await mkdir(dirname(abs), { recursive: true });
  const tmp = `${abs}.${process.pid}.tmp`;
  await writeFile(tmp, texto, 'utf8');
  await rename(tmp, abs);
}

/* ---------- a árvore: todas as pastas e notas (sem o que fica de fora) ---------- */
let memo = null, memoEm = 0;
export async function arvore({ fresco = false } = {}) {
  if (!fresco && memo && Date.now() - memoEm < 4000) return memo;
  const pastas = [], notas = [];
  async function andar(rel, fundo) {
    if (fundo > 12) return;
    let entradas;
    try { entradas = await readdir(join(COFRE, rel), { withFileTypes: true }); } catch { return; }
    for (const e of entradas) {
      if (e.name.startsWith('.')) continue;
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (PROIBIDO.test(r) || fora(r)) continue;
      if (e.isDirectory()) { pastas.push(r); await andar(r, fundo + 1); }
      else if (EXT.test(e.name)) {
        try { const s = await stat(join(COFRE, r)); notas.push([r, s.mtimeMs, s.size]); } catch { /* sumiu no meio */ }
      }
    }
  }
  await andar('', 0);
  pastas.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  memo = { entrada: ENTRADA, pastas, notas };
  memoEm = Date.now();
  return memo;
}

export async function lerNota(rel) {
  const c = caminho(rel);
  if (!existsSync(c.abs)) throw erro('Esta nota não existe mais (foi movida ou apagada?).', 404);
  const bruto = await readFile(c.abs, 'utf8');
  const s = await stat(c.abs);
  return { rel: c.rel, texto: bruto.replace(/^﻿/, ''), hash: hashDe(bruto), modificado: s.mtime.toISOString() };
}

const copiados = new Set(); /* "rel|dia": a cópia de segurança de hoje já foi feita */
async function copiaDoDia(c) {
  const dia = new Date().toISOString().slice(0, 10), chave = `${c.rel}|${dia}`;
  if (copiados.has(chave) || !existsSync(c.abs)) return;
  await mkdir(PASTA_BACKUPS, { recursive: true });
  const nome = `${dia} ${c.rel.replace(/[\\/]/g, ' › ')}`;
  await copyFile(c.abs, join(PASTA_BACKUPS, nome.slice(-200)));
  copiados.add(chave);
}

/** grava: sem rel, cria a nota (na pasta pedida ou na Entrada); com rel, grava por cima só se o hash bater */
export async function gravarNota({ rel, texto, base, pasta }) {
  if (typeof texto !== 'string') throw erro('Texto inválido.');
  if (texto.length > LIMITE) throw erro('Nota grande demais.', 413);
  if (!rel) {
    const p = caminho(pasta || ENTRADA, { pasta: true });
    await mkdir(p.abs, { recursive: true });
    const nome = await livre(p.abs, carimbo());
    const c = caminho(`${p.rel ? p.rel + '/' : ''}${nome}`);
    await gravarAtomico(c.abs, texto);
    memo = null;
    return { rel: c.rel, hash: hashDe(texto), criada: true, modificado: new Date().toISOString() };
  }
  const c = caminho(rel);
  if (existsSync(c.abs)) {
    const atual = await readFile(c.abs, 'utf8');
    if ((base || '') !== hashDe(atual)) {
      const e = erro('Esta nota mudou fora daqui (no Obsidian ou em outro aparelho). Nada foi perdido: veja a versão nova antes de continuar.', 409);
      e.atual = { rel: c.rel, texto: atual, hash: hashDe(atual) };
      throw e;
    }
    if (atual === texto) return { rel: c.rel, hash: hashDe(texto), igual: true };
    await copiaDoDia(c);
  } else if (base) {
    throw erro('Esta nota não existe mais (foi movida ou apagada?). O texto continua aqui: use "Mover" para guardar em outro lugar.', 404);
  }
  await gravarAtomico(c.abs, texto);
  memo = null;
  return { rel: c.rel, hash: hashDe(texto), modificado: new Date().toISOString() };
}

/** move (ou dá nome): nunca passa por cima de outro arquivo */
export async function moverNota({ rel, pasta, nome }) {
  const c = caminho(rel);
  if (!existsSync(c.abs)) throw erro('Esta nota não existe mais.', 404);
  const destPasta = caminho(pasta != null ? pasta : dirname(c.rel) === '.' ? '' : dirname(c.rel), { pasta: true });
  await mkdir(destPasta.abs, { recursive: true });
  const ext = extname(c.rel) || '.md';
  const base = nomeLimpo(nome != null ? nome : basename(c.rel, ext)) || basename(c.rel, ext);
  const alvoRel = `${destPasta.rel ? destPasta.rel + '/' : ''}${base}${ext}`;
  if (alvoRel === c.rel) return { rel: c.rel };
  const final = existsSync(join(COFRE, alvoRel)) ? `${destPasta.rel ? destPasta.rel + '/' : ''}${await livre(destPasta.abs, base, ext)}` : alvoRel;
  const d = caminho(final);
  await rename(c.abs, d.abs);
  memo = null;
  return { rel: d.rel };
}

/** cria uma pasta; "projeto" cria também a nota de entrada dele (o índice do projeto) */
export async function criarPasta({ pai, nome, projeto }) {
  const p = caminho(pai || '', { pasta: true });
  const n = nomeLimpo(nome);
  if (!n) throw erro('Dê um nome.');
  const alvo = caminho(`${p.rel ? p.rel + '/' : ''}${n}`, { pasta: true });
  if (existsSync(alvo.abs)) throw erro('Já existe uma pasta com esse nome aqui.', 409);
  await mkdir(alvo.abs, { recursive: true });
  let nota = null;
  if (projeto) {
    const c = caminho(`${alvo.rel}/${n}.md`);
    const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    await gravarAtomico(c.abs, `# ${n}\n\nProjeto começado em ${hoje}.\n\n## Por quê\n\n\n## O que já existe\n\n\n## Os próximos passos\n\n- \n`);
    nota = c.rel;
  }
  memo = null;
  return { rel: alvo.rel, nota };
}

/** procura nos nomes e no texto das notas (as que batem no nome vêm primeiro) */
export async function buscarNotas(q) {
  const t = String(q || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  if (t.length < 2) return { q, achados: [] };
  const { notas } = await arvore();
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const achados = [];
  for (const [rel, mt] of notas) if (norm(rel).includes(t)) achados.push({ rel, modificado: mt, onde: 'nome' });
  if (achados.length < 60) {
    for (const [rel, mt, tam] of notas) {
      if (achados.length >= 60) break;
      if (tam > 400_000 || achados.some((a) => a.rel === rel)) continue;
      try {
        const txt = await readFile(join(COFRE, rel), 'utf8'), n = norm(txt), i = n.indexOf(t);
        if (i >= 0) achados.push({ rel, modificado: mt, onde: 'texto', trecho: txt.slice(Math.max(0, i - 60), i + 80).replace(/\s+/g, ' ') });
      } catch { /* ilegível */ }
    }
  }
  return { q, achados };
}
