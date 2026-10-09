/* ============================================================
   O MANIFESTO NO CADERNO (09/out/2026, PERFIL.md item 75)
   "SIM SIM SIM! FAÇA TUDO!": o 0 O Manifesto (I a XIV) e o discurso A Nova Maré (a XV) entram
   na porta do Manifesto, ao lado da sua voz (o Manifesto do Portal Solar, que já mora no caderno).

   Os dois primeiros moram em 1 Villages/b Studio, a pasta que o servidor nunca lê, porque lá há
   arquivos de senha (ver PROIBIDO em vault.mjs). A exceção é estreita: só estes dois arquivos,
   pelo nome exato, e só para ler. Nada aqui grava no b Studio; para mudar o texto, a página abre
   a nota no Obsidian. A sua voz continua gravando pelo caminho do Eu (perfil.mjs, chave "manifesto").
   ============================================================ */
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { COFRE } from './vault.mjs';
import { lerUm } from './perfil.mjs';

/* o nome exato e os lugares onde já morou (o caderno se reorganiza: se sair dos dois, procura pelo nome) */
const OBRA = { nome: '0 O Manifesto.md', onde: ['1 Villages/b Studio/0 Interface', '1 Villages/0 Interface'] };
const MARE = { nome: 'A Nova Maré — discurso de 28-set-2026.md', onde: ['1 Villages/b Studio/0 Interface/Entrada', '1 Villages/b Studio/0 Interface'] };

const achados = new Map();
async function procurar(nome, rel, fundo) {
  if (fundo > 5) return null;
  let entradas;
  try { entradas = await readdir(join(COFRE, rel), { withFileTypes: true }); } catch { return null; }
  for (const e of entradas) if (e.isFile() && e.name === nome) return `${rel}/${e.name}`;
  for (const e of entradas) {
    if (!e.isDirectory() || e.name.startsWith('.') || e.name === 'node_modules') continue;
    const r = await procurar(nome, `${rel}/${e.name}`, fundo + 1);
    if (r) return r;
  }
  return null;
}
async function localizar(alvo) {
  const lembrado = achados.get(alvo.nome);
  if (lembrado && existsSync(join(COFRE, lembrado))) return lembrado;
  let rel = alvo.onde.map((d) => `${d}/${alvo.nome}`).find((r) => existsSync(join(COFRE, r)));
  if (!rel) rel = await procurar(alvo.nome, '1 Villages', 0);
  if (rel) achados.set(alvo.nome, rel);
  return rel || null;
}

async function ler(alvo) {
  const rel = await localizar(alvo);
  if (!rel) return { existe: false, nome: alvo.nome };
  const abs = join(COFRE, rel);
  const bruto = (await readFile(abs, 'utf8')).replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const info = await stat(abs);
  return { existe: true, nome: alvo.nome, rel, abs, modificado: info.mtime.toISOString(), bruto };
}

const semTopo = (t) => t.replace(/^---\n[\s\S]*?\n---\n/, '');
function topo(t) {
  const m = t.match(/^---\n([\s\S]*?)\n---\n/);
  const o = {};
  if (m) for (const l of m[1].split('\n')) { const p = l.match(/^([\w-]+):\s*(.*)$/); if (p) o[p[1]] = p[2].trim(); }
  return o;
}
/* corta um Markdown nas seções de nível 2 (## …) */
function secoes(t) {
  const partes = [];
  let atual = null;
  for (const l of t.split('\n')) {
    const h = l.match(/^##\s+(.*?)\s*$/);
    if (h) { atual = { titulo: h[1], linhas: [] }; partes.push(atual); continue; }
    if (atual) atual.linhas.push(l);
  }
  return partes.map((p) => ({ titulo: p.titulo, texto: p.linhas.join('\n').trim() }));
}

/** o 0 O Manifesto: o texto sem o topo e sem os Elos (que apontam para o site público) */
function obra(a) {
  if (!a.existe) return { existe: false, nome: a.nome };
  const corpo = semTopo(a.bruto);
  const meta = topo(a.bruto);
  const texto = corpo.replace(/\n## Elos\n[\s\S]*$/, '\n').trim();
  return { existe: true, rel: a.rel, abs: a.abs, modificado: a.modificado, autor: meta.autor || '', texto };
}

/** A Nova Maré: as palavras como vieram (1), o rascunho lapidado (2) e o que o discurso pede (3) */
function mare(a, { publico = false } = {}) {
  if (!a.existe) return { existe: false, nome: a.nome };
  const meta = topo(a.bruto);
  const s = secoes(semTopo(a.bruto));
  const de = (re) => (s.find((x) => re.test(x.titulo)) || {}).texto || '';
  const palavras = de(/palavras/i);
  const lapidado = de(/lapidado|rascunho/i).replace(/^\*Rascunho:[^\n]*\*\s*/m, '').trim();
  const r = { existe: true, rel: a.rel, modificado: a.modificado, data: meta.data || '', titulo: 'A nova maré', lapidado };
  if (!publico) { r.abs = a.abs; r.palavras = palavras; }
  return r;
}

/** tudo o que a porta do Manifesto mostra (no site público: sem o caminho do disco e sem as palavras cruas) */
export async function lerManifesto({ publico = false } = {}) {
  const [o, m, v, on] = await Promise.all([ler(OBRA), ler(MARE), lerUm('manifesto'), lerUm('ontologica')]);
  const voz = v.existe
    ? { existe: true, rel: v.rel, modificado: v.modificado, texto: v.texto, hash: v.hash, ...(publico ? {} : { abs: join(COFRE, v.rel) }) }
    : { existe: false, rel: v.rel };
  const ob = obra(o);
  const ma = mare(m, { publico });
  /* no público, nem o caminho do disco nem o lugar dentro do caderno */
  /* item 75: a revolução ontológica (a XVI), "Quem fez" e as palavras: uma nota só, lida pela home e pelo Manifesto */
  const ontologica = on.existe ? { existe: true, rel: on.rel, modificado: on.modificado, texto: on.texto, ...(publico ? {} : { abs: join(COFRE, on.rel) }) } : { existe: false, rel: on.rel };
  if (publico) { delete ob.abs; delete ob.rel; delete ma.rel; delete voz.rel; delete ontologica.rel; }
  return { obra: ob, mare: ma, voz, ontologica };
}
