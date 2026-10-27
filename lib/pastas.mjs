/* ============================================================
   AS PASTAS (27/out/2026): "quero saber em todos os projetos como eu tenho ordem e paro de depender
   de meu dia ser falar com você, quero ver minhas pastas e navegar nelas - e como melhorar cada um!"

   Lê a pasta que tem o jadesun dentro (no Mac, ~/www; no Windows, D:\www): cada pasta, o git dela
   (o ramo, o que não foi guardado, o que não foi enviado, o último commit), os papéis que a explicam
   (LEIA-ME, README, TAREFAS…) e o endereço no ar. O que fazer com cada uma vem do caderno, do
   "O Grande Plano — Uma Plataforma": a seção 5 (a tabela das pastas do Mac, para arquivar) e a
   seção 9 (as vivas, uma a uma). Mudou lá, muda aqui.

   Só no computador (o servidor recusa de fora). Nada disto vai para o site público.
   ============================================================ */
import { readdir, stat, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile, exec } from 'node:child_process';
import { join, resolve, sep, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COFRE } from './vault.mjs';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
export const WWW = resolve(RAIZ, '..');
const PLANO = join(COFRE, 'Logboard', '# Board', 'Focos', 'O Grande Plano — Uma Plataforma.md');
const PAPEIS = ['LEIA-ME.md', 'README.md', 'TAREFAS.md', 'CLAUDE.md', 'NEGOCIO.md', 'ESTRUTURA.md', 'SISTEMA.md', 'UNIAO.md'];
/* o que não se lê aqui nem de passagem: senhas, chaves, tokens */
const SENSIVEL = /(^|[\\/])\.env|senha|password|passw|secret|token|credential|\.pem$|\.key$|id_rsa|\.p12$/i;
const TEXTO = new Set(['.md', '.txt', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.css', '.html', '.json', '.csv', '.yml', '.yaml', '.toml', '.py', '.sh', '.bat', '.command', '.gd', '.tscn', '.svg', '.xml', '.sql', '.rb', '.wgsl', '.glsl', '.ini', '.cfg']);

function git(pasta, args) {
  return new Promise((ok) => {
    execFile('git', ['-C', pasta, ...args], { timeout: 6000, maxBuffer: 4 * 1024 * 1024 }, (erro, saida) => ok(erro ? null : String(saida)));
  });
}

async function estadoGit(pasta) {
  if (!existsSync(join(pasta, '.git'))) return null;
  const [st, ultimo, remoto] = await Promise.all([
    git(pasta, ['status', '--porcelain=v1', '-b']),
    git(pasta, ['log', '-1', '--format=%cI%x09%s']),
    git(pasta, ['remote', 'get-url', 'origin']),
  ]);
  const linhas = (st || '').split('\n').filter(Boolean);
  const cab = linhas[0] && linhas[0].startsWith('## ') ? linhas.shift() : '';
  const ramo = (cab.match(/^## ([^.\s]+)/) || [])[1] || '';
  const frente = Number((cab.match(/ahead (\d+)/) || [])[1] || 0);
  const atras = Number((cab.match(/behind (\d+)/) || [])[1] || 0);
  const [data, ...msg] = (ultimo || '').trim().split('\t');
  return {
    ramo, frente, atras,
    sujos: linhas.length,
    semRemoto: !remoto,
    remoto: remoto ? remoto.trim().replace(/\/\/[^/@]*@/, '//') : '',
    ultimo: data ? { data, msg: msg.join('\t') } : null,
  };
}

/* o primeiro parágrafo de verdade de um LEIA-ME ou README (sem títulos, selos ou imagens) */
function resumoDe(texto) {
  const blocos = texto.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  for (const b of blocos) {
    const t = b.trim();
    if (!t || /^(#|!\[|<|\||```|---|\[!\[)/.test(t)) continue;
    return t.replace(/\s+/g, ' ').slice(0, 360);
  }
  return '';
}
/* o endereço no ar: o da linha que diz "no ar", senão o primeiro da Vercel ou um domínio próprio */
function noArDe(texto) {
  const linha = texto.split('\n').find((l) => /no ar/i.test(l) && /https?:\/\//.test(l));
  const achar = (s) => (s.match(/https?:\/\/[^\s)>`'"\]]+/) || [])[0];
  return (linha && achar(linha)) || (texto.match(/https?:\/\/[a-z0-9-]+\.vercel\.app[^\s)>`'"\]]*/i) || [])[0] || '';
}

async function umaPasta(nome) {
  const pasta = join(WWW, nome);
  const papeis = PAPEIS.filter((p) => existsSync(join(pasta, p)));
  let resumo = '', noAr = '';
  for (const p of ['LEIA-ME.md', 'README.md']) {
    if (!papeis.includes(p)) continue;
    try {
      const t = await readFile(join(pasta, p), 'utf8');
      resumo = resumo || resumoDe(t);
      noAr = noAr || noArDe(t);
    } catch {}
  }
  const st = await stat(pasta).catch(() => null);
  return { nome, papeis, resumo, noAr, git: await estadoGit(pasta), mudou: st ? st.mtimeMs : 0 };
}

/* ---------- o que o caderno diz de cada pasta (O Grande Plano, seções 5 e 9) ---------- */
function celulas(linha) {
  return linha.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}
const nomesNaCelula = (c) => (c.match(/`([^`]+)`/g) || []).map((x) => x.slice(1, -1).trim());

async function lerPlano() {
  let texto = '';
  try { texto = await readFile(PLANO, 'utf8'); } catch { return { existe: false, pastas: {}, ficam: [] }; }
  const pastas = {}, ficam = [];
  const linhas = texto.replace(/\r\n/g, '\n').split('\n');
  let secao = '', mac = false;
  for (const l of linhas) {
    const s = l.match(/^## (\d+)\./);
    if (s) { secao = s[1]; mac = false; continue; }
    /* na seção 5, a tabela do Mac vem depois da linha "No Mac (~/www)" (antes dela, as do Windows e do caderno) */
    if (secao === '5' && /^\*\*No Mac/.test(l)) mac = true;
    if (!l.startsWith('|') || /^\|\s*-/.test(l)) continue;
    const c = celulas(l);
    if (secao === '5' && /^M\d+$/.test(c[0])) {
      for (const n of nomesNaCelula(c[1])) pastas[n] = { ...(pastas[n] || {}), codigo: c[0], proposta: c[2].replace(/`/g, ''), porque: c[3], risco: c[4] };
    } else if (secao === '5' && mac && c[0] === '—' && /ficam/i.test(c[2] || '')) {
      ficam.push(...nomesNaCelula(c[1]));
    } else if (secao === '9' && c.length >= 5 && !/^Pasta$/i.test(c[0])) {
      for (const n of nomesNaCelula(c[0])) pastas[n] = { ...(pastas[n] || {}), grupo: c[1], oQueE: c[2], proximo: c[3], melhorar: c[4] };
    }
  }
  const espera = /- \[ \] \*\*M1–M12/.test(texto);
  return { existe: true, pastas, ficam, esperaArquivar: espera, arquivo: 'Logboard/# Board/Focos/O Grande Plano — Uma Plataforma.md' };
}

let memo = null, memoEm = 0;
export async function pastas({ fresco = false } = {}) {
  if (!fresco && memo && Date.now() - memoEm < 30_000) return memo;
  const entradas = await readdir(WWW, { withFileTypes: true });
  const nomes = entradas.filter((d) => d.isDirectory() && !d.name.startsWith('.')).map((d) => d.name);
  const [lista, plano] = await Promise.all([Promise.all(nomes.map(umaPasta)), lerPlano()]);
  memo = { raiz: WWW, computador: process.platform === 'darwin' ? 'Mac' : process.platform === 'win32' ? 'Windows' : 'este computador', pastas: lista, plano, lido: Date.now() };
  memoEm = Date.now();
  return memo;
}

/* ---------- navegar: dentro de ~/www, nunca fora ---------- */
function dentro(rel) {
  const alvo = resolve(WWW, String(rel || '').replace(/^[\\/]+/, ''));
  if (alvo !== WWW && !alvo.startsWith(WWW + sep)) throw Object.assign(new Error('Fora das pastas.'), { status: 400 });
  return alvo;
}

export async function listar(rel) {
  const alvo = dentro(rel);
  const entradas = await readdir(alvo, { withFileTypes: true });
  const itens = [];
  for (const d of entradas) {
    if (d.name.startsWith('.')) continue;
    const pasta = d.isDirectory();
    const st = await stat(join(alvo, d.name)).catch(() => null);
    itens.push({ nome: d.name, pasta, tamanho: !pasta && st ? st.size : null, mudou: st ? st.mtimeMs : 0, pesada: pasta && /^(node_modules|\.next|dist|build|exportado|vendor)$/.test(d.name) });
  }
  itens.sort((a, b) => (a.pasta !== b.pasta ? (a.pasta ? -1 : 1) : a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true })));
  return { rel: alvo.slice(WWW.length).replace(/^[\\/]/, '').split(sep).join('/'), itens };
}

export async function ler(rel) {
  const alvo = dentro(rel);
  if (SENSIVEL.test(alvo.slice(WWW.length))) return { negado: true, motivo: 'Este arquivo guarda senha ou chave: ele não abre aqui.' };
  const ext = extname(alvo).toLowerCase();
  if (!TEXTO.has(ext)) return { negado: true, motivo: 'Não é um arquivo de texto.' };
  const st = await stat(alvo);
  if (st.size > 600_000) return { negado: true, motivo: 'Grande demais para ler aqui.' };
  return { rel, ext, texto: await readFile(alvo, 'utf8'), mudou: st.mtimeMs };
}

/* abrir no Finder (ou no Explorador) ou no VS Code, no próprio computador */
export function abrir(rel, como) {
  const alvo = dentro(rel);
  const q = (s) => '"' + s.replace(/(["\\$`])/g, '\\$1') + '"';
  let cmd;
  if (process.platform === 'darwin') cmd = como === 'code' ? `open -a "Visual Studio Code" ${q(alvo)}` : `open -R ${q(alvo)}`;
  else if (process.platform === 'win32') cmd = como === 'code' ? `code ${q(alvo)}` : `explorer /select,${q(alvo)}`;
  else cmd = `xdg-open ${q(dirname(alvo))}`;
  return new Promise((ok) => exec(cmd, (erro) => ok({ ok: !erro })));
}
