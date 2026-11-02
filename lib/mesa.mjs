/* ============================================================
   A MESA NO COMPUTADOR (02/nov/2026, registro 138)
   No computador, a Mesa mora num arquivo do caderno, "A Mesa.md": o caderno é a verdade, e o
   arquivo viaja com ele (o git, o juntar-tudo). Aqui só se lê e se grava o texto; quem entende
   o texto é o mesa-formato.js, no navegador.

   · o arquivo se acha pelo nome, em qualquer pasta (nenhum caminho do caderno mora no código);
   · se ainda não existe, nasce ao lado das "Tarefas Simples";
   · a gravação é a do caderno de notas (lib/notas.mjs): atômica, com a cópia do dia, e nunca às
     cegas: se o arquivo mudou fora daqui (o Obsidian, o outro computador), nada se grava e a
     página recebe a versão nova;
   · o "Fechar o dia" escreve o Registro do dia no lugar dos registros (ao lado do modelo), no
     formato do modelo; se o dia já tem registro, acrescenta no fim, nunca por cima.
   ============================================================ */
import { basename, dirname } from 'node:path';
import { arvore, lerNota, gravarNota } from './notas.mjs';

const NOME = 'A Mesa.md';
const VIZINHA = 'Tarefas Simples.md';
const MODELO_REGISTRO = '0 Modelo do Registro.md';
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const CAMPOS = [['pratiquei', 'Pratiquei'], ['aprendi', 'Aprendi'], ['travei', 'Travei em'], ['achados', 'Achados'], ['gratidao', 'Gratidão'], ['amanha', 'Amanhã']];

const erro = (msg, status = 400) => Object.assign(new Error(msg), { status });

/** a nota com este nome (a mais recente, se houver duas) */
async function acharPorNome(nome) {
  const { notas } = await arvore({ fresco: true });
  const achadas = notas.filter(([rel]) => basename(rel) === nome).sort((a, b) => b[1] - a[1]);
  return achadas.length ? achadas[0][0] : null;
}
const pastaDe = (rel) => (dirname(rel) === '.' ? '' : dirname(rel));

export async function lerMesa() {
  const rel = await acharPorNome(NOME);
  if (!rel) return { existe: false };
  const n = await lerNota(rel);
  return { existe: true, rel: n.rel, texto: n.texto, hash: n.hash, modificado: n.modificado };
}

export async function gravarMesa({ texto, base }) {
  if (typeof texto !== 'string' || !/^---\s*\nformato: mesa/m.test(texto.slice(0, 200)) && !/^# A Mesa/m.test(texto)) throw erro('Isto não parece o arquivo da Mesa.');
  let rel = await acharPorNome(NOME);
  if (!rel) {
    const vizinha = await acharPorNome(VIZINHA);
    rel = `${vizinha ? pastaDe(vizinha) + '/' : ''}${NOME}`;
    return { ...(await gravarNota({ rel, texto })), criada: true };
  }
  return gravarNota({ rel, texto, base });
}

/* ---------- o Registro do dia ---------- */
function nomeDoDia(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) throw erro('Dia inválido.');
  return { arquivo: `${m[1]}.${m[2]}.${m[3]}.md`, curto: `${+m[3]}/${MESES[+m[2] - 1]}` };
}
async function lugarDoRegistro(iso) {
  const modelo = await acharPorNome(MODELO_REGISTRO);
  if (!modelo) return null;
  return `${pastaDe(modelo) ? pastaDe(modelo) + '/' : ''}${nomeDoDia(iso).arquivo}`;
}

export async function lerRegistro(iso) {
  const rel = await lugarDoRegistro(iso);
  if (!rel) return { lugar: false };
  try {
    const n = await lerNota(rel);
    return { lugar: true, existe: true, texto: n.texto, hash: n.hash };
  } catch (e) {
    if (e.status === 404) return { lugar: true, existe: false };
    throw e;
  }
}

/** campos: { pratiquei, aprendi, travei, achados, gratidao, amanha }, frase, tags: ['codigo', …] */
export async function gravarRegistro({ dia, campos = {}, frase = '', tags = [] }) {
  const rel = await lugarDoRegistro(dia);
  if (!rel) throw erro('Não achei o lugar dos registros (o "0 Modelo do Registro").', 404);
  const linhas = CAMPOS.map(([k, rot]) => `**${rot}:** ${String(campos[k] || '').replace(/\s*\n\s*/g, ' ').trim()}`.trimEnd());
  const etiquetas = ['registro'].concat(tags.filter((t) => /^[\p{L}\p{N}_-]+$/u.test(t))).map((t) => '#' + t).join(' ');
  const hora = new Date().toTimeString().slice(0, 5).replace(':', 'h');
  let atual = null;
  try { atual = await lerNota(rel); } catch (e) { if (e.status !== 404) throw e; }
  if (!atual) {
    const texto = [`# ${nomeDoDia(dia).curto}${frase ? ' · ' + frase.trim() : ''}`, '', etiquetas, '', ...linhas, ''].join('\n');
    return { ...(await gravarNota({ rel, texto })), novo: true };
  }
  const bloco = ['', `## Fechar o dia (a Mesa, ${hora})`, '', ...(frase ? [`*${frase.trim()}*`, ''] : []), ...linhas, ''].join('\n');
  return gravarNota({ rel, texto: atual.texto.replace(/\s+$/, '') + '\n' + bloco, base: atual.hash });
}
