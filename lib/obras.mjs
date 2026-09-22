import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { COFRE, PROIBIDO } from './vault.mjs';

/* Índice do acervo pessoal de obras — manifestos, crítica, pesquisas (inclui ativismo),
   filosofia, livro, poemas, música, roteiros, fotografia, design, arquitetura, pintura.
   Bem mais simples que lib/biblioteca.mjs (2 Academy): aqui não há hierarquia, código
   nem casamento de estudos — só ler o que já está estruturado em pastas e mostrar fiel. */

const BASE = 'Logboard/# Profile/# Work';
const colador = new Intl.Collator('pt', { numeric: true, sensitivity: 'base' });

export function slug(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function limparNome(nome) {
  return String(nome)
    .replace(/^[a-z]\.[a-z]\s+/i, '')
    .replace(/^[+]\s+/, '')
    .replace(/\s*\(\d+(?:,\s*\d+)?\)\s*$/, '')
    .replace(/^\d+\s+/, '')
    .replace(/^[xz]_/i, '')
    .trim() || nome;
}

function separarFrontmatter(texto) {
  const t = String(texto).replace(/^﻿/, '');
  const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, corpo: t };
  const meta = {};
  for (const l of m[1].split(/\r?\n/)) {
    const k = l.match(/^([^:#\s][^:]*):\s*(.*)$/);
    if (k) meta[k[1].trim()] = k[2].trim().replace(/^["']|["']$/g, '');
  }
  return { meta, corpo: t.slice(m[0].length) };
}

function resumirTexto(corpo) {
  for (const l of corpo.split(/\r?\n/)) {
    const t = l.trim().replace(/^#+\s*/, '').replace(/^[-*]\s+/, '').replace(/[*_`]/g, '');
    if (t.length >= 8) return t.slice(0, 200);
  }
  return '';
}

async function andar(relDir, arquivos) {
  if (PROIBIDO.test(relDir)) return;
  let entradas;
  try { entradas = await readdir(join(COFRE, relDir), { withFileTypes: true }); } catch { return; }
  entradas = entradas.filter((e) => !e.name.startsWith('.')).sort((a, b) => colador.compare(a.name, b.name));
  for (const e of entradas) {
    const r = `${relDir}/${e.name}`;
    if (PROIBIDO.test(r)) continue;
    if (e.isDirectory()) await andar(r, arquivos);
    else if (/\.md$/i.test(e.name)) arquivos.push(r);
  }
}

let memo = null;
let memoEm = 0;
let emAndamento = null;

async function construir() {
  const rels = [];
  await andar(BASE, rels);

  const pecas = [];
  for (const rel of rels) {
    let texto;
    try { texto = await readFile(join(COFRE, rel), 'utf8'); } catch { continue; }
    const { meta, corpo } = separarFrontmatter(texto);
    const partes = rel.split('/').slice(3);
    if (!partes.length) continue;
    const categoriaBruta = partes[0];
    const categoria = limparNome(categoriaBruta);
    const nomeArq = partes[partes.length - 1].replace(/\.md$/i, '');
    const projeto = partes.slice(1, -1).map(limparNome).join(' › ');
    const h1 = corpo.match(/^#\s+(.+)$/m);
    const titulo = (h1 ? h1[1].replace(/[*_`]/g, '').trim() : '') || nomeArq;
    const palavras = (corpo.match(/\S+/g) || []).length;
    pecas.push({
      id: slug(rel.replace(/\.md$/i, '')),
      rel,
      categoria,
      categoriaId: slug(categoria),
      projeto,
      titulo,
      nomeArq,
      resumo: resumirTexto(corpo),
      corpo,
      palavras,
      visibilidade: meta.visibilidade || 'privado',
    });
  }
  pecas.sort((a, b) => colador.compare(a.rel, b.rel));
  const usados = new Set();
  for (const p of pecas) {
    let id = p.id; let n = 2;
    while (usados.has(id)) id = `${p.id}-${n++}`;
    usados.add(id);
    p.id = id;
  }

  const porCategoria = new Map();
  for (const p of pecas) {
    if (!porCategoria.has(p.categoriaId)) porCategoria.set(p.categoriaId, { id: p.categoriaId, nome: p.categoria, pecas: [], palavras: 0, ordem: p.rel });
    const c = porCategoria.get(p.categoriaId);
    c.pecas.push(p);
    c.palavras += p.palavras;
  }
  const categorias = [...porCategoria.values()].sort((a, b) => colador.compare(a.ordem, b.ordem)).map((c) => { delete c.ordem; return c; });

  return { pecas, categorias, gerado: new Date().toISOString() };
}

function reconstruir() {
  if (!emAndamento) {
    emAndamento = construir().then((r) => { memo = r; memoEm = Date.now(); return r; }).finally(() => { emAndamento = null; });
  }
  return emAndamento;
}

export async function obterObras(forcar = false) {
  if (!forcar && memo) {
    if (Date.now() - memoEm >= 300000) reconstruir().catch(() => {});
    return memo;
  }
  return reconstruir();
}
