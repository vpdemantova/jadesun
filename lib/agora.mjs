/* ============================================================
   O AGORA DE CADA ÁREA — no servidor de casa (21/out/2026, registro 115)
   O motor é o lib/agora-motor.cjs (o mesmo da função da Vercel); aqui ficam só a memória de
   meia hora e a cópia em dados/agora-cache.json, para abrir sem internet com o que veio da última vez.
   ============================================================ */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAMPOS = require('../campos-dados.js');
const { agoraDe } = require('./agora-motor.cjs');
const ARQ = join(RAIZ, 'dados', 'agora-cache.json');
const VALIDADE = 30 * 60 * 1000;

let memoria = null;
function ler() { try { return existsSync(ARQ) ? JSON.parse(readFileSync(ARQ, 'utf8')) : {}; } catch { return {}; } }
function gravar() { try { mkdirSync(dirname(ARQ), { recursive: true }); writeFileSync(ARQ, JSON.stringify(memoria), 'utf8'); } catch { /* sem disco, segue */ } }

/** o agora de uma área (da memória, se tiver menos de meia hora; senão, das fontes; sem internet, a última cópia) */
export async function agora(id, { fresco = false } = {}) {
  if (!memoria) memoria = ler();
  const velho = memoria[id];
  if (!fresco && velho && Date.now() - Date.parse(velho.em) < VALIDADE) return velho;
  try {
    const novo = await agoraDe(CAMPOS, id);
    if (!novo.noticias.length && velho) return { ...velho, semInternet: true };
    memoria[id] = novo;
    gravar();
    return novo;
  } catch (e) {
    if (velho) return { ...velho, semInternet: true };
    throw e;
  }
}

/** todas as áreas (para a cópia do site estático): seis de cada vez, para não abrir 140 conexões juntas */
export async function agoraDeTodas() {
  const tudo = {}, fila = CAMPOS.areas.map((a) => a.id);
  async function trabalhar() { while (fila.length) { const id = fila.shift(); try { tudo[id] = await agora(id); } catch { /* fica sem */ } } }
  await Promise.all(Array.from({ length: 6 }, trabalhar));
  return tudo;
}
