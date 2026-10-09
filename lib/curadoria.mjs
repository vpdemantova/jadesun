/* ============================================================
   CURADORIA NO CADERNO (09/out/2026, PERFIL.md item 74)
   Os posts de curadoria podem morar no caderno, como arquivos .md, na pasta que já existia:
     1 Villages/a Social/d. Curadoria/Posts/AAAA-MM-DD — Título.md
   com um cabeçalho simples:
     ---
     formato: curadoria
     slug: a-praca-o-pavao-e-o-eter
     titulo: A praça, o pavão e o éter
     data: 2026-10-09
     curador: Vitor de Mantova
     ---
   O app lê a pasta (só lê) e mostra cada post; "Levar para o caderno" cria o arquivo de um
   rascunho que ainda só existe no app — nunca sobrescreve um que já exista.
   ============================================================ */
import { readFile, writeFile, readdir, mkdir, rename, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { COFRE } from './vault.mjs';

export const PASTA_CURADORIA = '1 Villages/a Social/d. Curadoria/Posts';
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function cabecalho(texto) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, corpo: texto };
  const meta = {};
  for (const l of m[1].split(/\r?\n/)) { const k = l.match(/^([a-zçãéí]+):\s*(.*)$/i); if (k) meta[k[1].toLowerCase()] = k[2].trim(); }
  return { meta, corpo: texto.slice(m[0].length) };
}

export async function lerCuradoria() {
  const pasta = join(COFRE, PASTA_CURADORIA);
  if (!existsSync(pasta)) return { pasta: PASTA_CURADORIA, existe: false, posts: [] };
  const nomes = (await readdir(pasta)).filter((n) => n.toLowerCase().endsWith('.md'));
  const posts = [];
  for (const nome of nomes) {
    const abs = join(pasta, nome);
    const bruto = (await readFile(abs, 'utf8')).replace(/^﻿/, '');
    const { meta, corpo } = cabecalho(bruto);
    const h1 = (corpo.match(/^#\s+(.+)$/m) || [])[1];
    const titulo = (h1 || meta.titulo || nome.replace(/\.md$/i, '').replace(/^\d{4}-\d{2}-\d{2}\s*[—-]\s*/, '')).trim();
    posts.push({
      slug: SLUG_RE.test(meta.slug || '') ? meta.slug : titulo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      titulo, data: meta.data || (nome.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1] || '', curador: meta.curador || '', rel: `${PASTA_CURADORIA}/${nome}`,
      modificado: (await stat(abs)).mtime.toISOString(), texto: corpo,
      /* item 75: o arquivo inteiro, para a página ler de volta o post estruturado (curadoria-md.js) */
      bruto: bruto.replace(/\r\n/g, '\n'), abs,
    });
  }
  posts.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  return { pasta: PASTA_CURADORIA, existe: true, posts };
}

/** cria o arquivo de um post que ainda só existe no app; nunca sobrescreve */
export async function levarCuradoria({ slug, titulo, data, curador, md }) {
  if (!SLUG_RE.test(slug || '')) throw Object.assign(new Error('Slug inválido.'), { status: 400 });
  if (typeof md !== 'string' || md.length < 20 || md.length > 400_000) throw Object.assign(new Error('Texto inválido.'), { status: 400 });
  const limpo = (t) => String(t || '').replace(/[\\/:*?"<>|\r\n]+/g, ' ').trim().slice(0, 120);
  const dia = /^\d{4}-\d{2}-\d{2}$/.test(data || '') ? data : new Date().toISOString().slice(0, 10);
  const { posts } = await lerCuradoria();
  const ja = posts.find((p) => p.slug === slug);
  if (ja) throw Object.assign(new Error('Este post já está no caderno: ' + ja.rel), { status: 409, rel: ja.rel });
  const pasta = join(COFRE, PASTA_CURADORIA);
  await mkdir(pasta, { recursive: true });
  const nome = `${dia} — ${limpo(titulo) || slug}.md`;
  const abs = join(pasta, nome);
  if (existsSync(abs)) throw Object.assign(new Error('Já existe um arquivo com esse nome.'), { status: 409 });
  /* item 75: o post já vem com o seu cabeçalho completo (curadoria-md.js); só os antigos precisam do mínimo */
  const temTopo = /^---\r?\n[\s\S]*?\r?\n---\r?\n/.test(md.trimStart());
  const texto = temTopo ? md.trim() + '\n' : ['---', 'formato: curadoria', `slug: ${slug}`, `titulo: ${limpo(titulo)}`, `data: ${dia}`, `curador: ${limpo(curador)}`, '---', '', md.trim(), ''].join('\n');
  await writeFile(`${abs}.tmp`, texto, 'utf8');
  await rename(`${abs}.tmp`, abs);
  return { ok: true, rel: `${PASTA_CURADORIA}/${nome}` };
}
