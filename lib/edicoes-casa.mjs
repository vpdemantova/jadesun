/* ============================================================
   AS EDIÇÕES DA CASA (01/nov/2026, PS-91, registro 133) — só no computador
   De onde veio: o pedido de um histórico no fim de cada parte do Início ("pra gente ver o progresso").
   "O seu dia" mostra o próximo passo de cada pasta em foco (O Grande Plano, seção 9, no caderno). O
   histórico dele não precisa de arquivo novo: o caderno já guarda cada versão do plano no git. Cada
   commit do plano vira uma edição (os passos daquele dia); o texto de agora, se ainda não tem commit,
   entra no fim. Nada disto vai para o site público (o servidor só responde ao próprio computador).
   Para onde vai: /api/inicio-edicoes (servir.mjs) → edicoes.js, na folha de "O seu dia".
   ============================================================ */
import { readFile, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { COFRE } from './vault.mjs';
import { planoDoTexto, PLANO_REL } from './pastas.mjs';

const E = createRequire(import.meta.url)('../inicio-edicoes.js');
function git(args) {
  return new Promise((ok) => execFile('git', ['-C', COFRE, ...args], { timeout: 8000, maxBuffer: 16 * 1024 * 1024 }, (erro, saida) => ok(erro ? null : String(saida))));
}
/* os passos em foco de uma versão do plano, como o Início mostra: [[pasta, próximo]] */
function passos(texto) {
  const pl = planoDoTexto(texto || '');
  return Object.keys(pl.pastas).filter((n) => pl.pastas[n].grupo === 'Em foco' && pl.pastas[n].proximo).map((n) => [n, pl.pastas[n].proximo]);
}

let memo = null, memoEm = 0;
export async function edicoesDaCasa() {
  if (memo && Date.now() - memoEm < 60_000) return memo;
  const lista = [];
  const juntar = (ed) => {
    if (!ed.l) return;
    const u = lista[lista.length - 1];
    if (u && JSON.stringify(u.l) === JSON.stringify(ed.l)) return;
    lista.push(ed);
  };
  /* as últimas duzentas versões do plano, da mais velha para a mais nova */
  const log = await git(['log', '--reverse', '-n', '200', '--format=%H%x09%cI%x09%s', '--', PLANO_REL]);
  for (const linha of (log || '').split('\n').filter(Boolean)) {
    const [h, d, ...m] = linha.split('\t');
    const texto = await git(['show', h + ':' + PLANO_REL]);
    if (texto) juntar({ d, m: m.join('\t'), c: 'caderno ' + h.slice(0, 7), l: E.seuDia(passos(texto)) });
  }
  /* o de agora, se ainda não tem commit */
  try {
    const abs = join(COFRE, PLANO_REL);
    const [texto, st] = await Promise.all([readFile(abs, 'utf8'), stat(abs)]);
    juntar({ d: new Date(st.mtimeMs).toISOString(), m: 'no caderno, ainda sem commit', l: E.seuDia(passos(texto)) });
  } catch { /* sem o plano, só o que o git tem */ }
  memo = { partes: { 'seu-dia': lista } }; memoEm = Date.now();
  return memo;
}
