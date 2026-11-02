/* ============================================================
   GUARDAR AS EDIÇÕES DO INÍCIO (01/nov/2026, PS-91, registro 135)
   De onde veio: o pedido de um histórico no fim de cada parte da home ("porque ela sempre muda, pra
   ficar salvo os artigos passados … pra gente ver o progresso"). Este roteiro lê as mesmas fontes que
   o Início, pela régua comum (inicio-edicoes.js), e guarda em inicio-edicoes-dados.js uma edição nova
   de cada parte que mudou, com a data. Nada se apaga: uma edição guardada fica para sempre.

   Uso:  node guardar-edicoes.mjs                  a edição de agora (só as partes que mudaram)
         node guardar-edicoes.mjs "o que mudou"    a mesma coisa, com essa nota
         node guardar-edicoes.mjs --do-git         acrescenta o passado, tirado do git (o jadesun e o caderno)
         node guardar-edicoes.mjs --refazer        refaz tudo só pelo git (o que só existia no arquivo se perde)

   Quem chama sozinho: o exportar.mjs (cada exportação) e o servir.mjs (cada vez que o Portal abre).
   Para onde vai: inicio-edicoes-dados.js, que o Início mostra (edicoes.js).
   ============================================================ */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const SAIDA = join(RAIZ, 'inicio-edicoes-dados.js');
const E = createRequire(import.meta.url)('./inicio-edicoes.js');
/* as fontes do Início: a letra que a régua usa → [arquivo, o nome que ele põe na janela] */
const FONTES = { I: ['inicio-dados.js', 'INICIO'], M: ['mapa-dados.js', 'MAPA'], A: ['aviso-dados.js', 'AVISO'], G: ['guias-dados.js', 'GUIAS'], PL: ['planeta-dados.js', 'PLANETA'], H: ['humanidade-dados.js', 'HUMANIDADE'] };

/* roda os arquivos de dados (scripts de navegador) numa janela de mentira e devolve o que puseram nela */
function janela(textos) {
  const w = {};
  const ctx = vm.createContext({ window: w, console, navigator: {}, location: { search: '', hash: '' } });
  for (const [nome, src] of textos) {
    if (!src) continue;
    try { vm.runInContext(src, ctx, { filename: nome, timeout: 2000 }); } catch { /* uma versão antiga quebrada não derruba as outras */ }
  }
  return w;
}
/* a primeira tela antes de 01/nov morava dentro do inicio.js: tira as frases de lá */
function inicioDoCodigo(src) {
  if (!src) return null;
  const pega = (cls) => { const m = src.match(new RegExp('class="' + cls + '"[^>]*>([^<\'"]+)<')); return m ? m[1].trim() : ''; };
  const I = { ola: pega('in-ola'), nome: pega('in-nome'), reside: pega('in-reside'), lema: pega('in-lema') };
  return I.nome || I.lema ? I : null;
}
/* a frase da utopia: a terceira das "palavras" da Revolução Ontológica (o mesmo que o inicio.js escolhe) */
function fraseDaUtopia(texto) {
  if (!texto) return '';
  const w = janela([['ontologica.js', readFileSync(join(RAIZ, 'ontologica.js'), 'utf8')]]);
  if (!w.Ontologica) return '';
  const p = w.Ontologica.partes(texto);
  return p.palavras[2] || p.palavras[p.palavras.length - 1] || '';
}

/* as fontes de agora, do disco */
async function fontesAgora() {
  const ler = (a) => { try { return readFileSync(join(RAIZ, a), 'utf8'); } catch { return ''; } };
  const w = janela(Object.values(FONTES).map(([a]) => [a, ler(a)]));
  const f = {};
  for (const [k, [, g]] of Object.entries(FONTES)) f[k] = w[g] || null;
  if (!f.I) f.I = inicioDoCodigo(ler('inicio.js'));
  try {
    const { lerManifesto } = await import('./lib/manifesto.mjs');
    const m = await lerManifesto({ publico: false });
    f.frase = m.ontologica && m.ontologica.existe ? fraseDaUtopia(m.ontologica.texto) : '';
    f.utopiaRel = m.ontologica && m.ontologica.rel;
  } catch { f.frase = ''; }
  return f;
}

/* ---------- o arquivo das edições ---------- */
function lerGuardadas() {
  if (!existsSync(SAIDA)) return { partes: {} };
  const w = janela([['inicio-edicoes-dados.js', readFileSync(SAIDA, 'utf8')]]);
  return w.INICIO_EDICOES && w.INICIO_EDICOES.partes ? w.INICIO_EDICOES : { partes: {} };
}
const conteudo = (ed) => JSON.stringify([ed.l, ed.lc || null]);
function gravar(H) {
  const ordem = E.PARTES.map((p) => p[0]).filter((id) => H.partes[id] && H.partes[id].length);
  const corpo = ordem.map((id) => '    ' + JSON.stringify(id) + ': [\n' + H.partes[id].map((ed) => '      ' + JSON.stringify(ed)).join(',\n') + '\n    ]').join(',\n');
  const txt = '/* As edições de cada parte do Início (PS-91, registro 135): gerado por guardar-edicoes.mjs.\n' +
    '   Não edite à mão: rode `node guardar-edicoes.mjs` (o exportar.mjs e o servir.mjs também rodam). Nada aqui se apaga.\n' +
    '   Cada edição: d (a data), m (a nota: a leva em que mudou), c (o commit, quando veio do git), l (as linhas: [nível, texto]),\n' +
    '   lc (as linhas no computador da casa, quando diferem do site público). */\n' +
    'window.INICIO_EDICOES = {\n  "gerado": ' + JSON.stringify(H.gerado) + ',\n  "partes": {\n' + corpo + '\n  }\n};\n';
  writeFileSync(SAIDA, txt, 'utf8');
}
/* junta uma leva de partes (de uma data) às guardadas: só entra a parte cujo texto mudou desde a última edição */
function juntar(H, partes, meta) {
  let novas = 0;
  for (const [id, p] of Object.entries(partes)) {
    const lista = H.partes[id] || (H.partes[id] = []);
    const ed = { d: meta.d, m: meta.m || '', ...(meta.c ? { c: meta.c } : {}), l: p.l, ...(p.lc ? { lc: p.lc } : {}) };
    const ultima = lista[lista.length - 1];
    if (ultima && conteudo(ultima) === conteudo(ed)) continue;
    lista.push(ed); novas++;
  }
  return novas;
}

/* ---------- o passado, pelo git ---------- */
function git(pasta, args) { try { return execFileSync('git', ['-C', pasta, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return null; } }
function commits(pasta, arquivos) {
  const s = git(pasta, ['log', '--reverse', '--format=%H%x09%cI%x09%s', '--', ...arquivos]);
  return (s || '').split('\n').filter(Boolean).map((l) => { const [h, d, ...m] = l.split('\t'); return { h, d, m: m.join('\t') }; });
}
/* a linha principal do site: de agora para trás, e em cada junção de duas janelas, o lado com mais trabalho
   desde que se separaram (o que estava no ar). Em 28/out, um commit de outra janela partiu da versão de 19/out;
   pela data, ele parecia um retrocesso no meio do trabalho de 21 a 27/out. O que veio do outro lado entra na
   data da junção, que é quando chegou ao site. */
function linhaPrincipal(pasta) {
  const pais = new Map();
  for (const l of (git(pasta, ['log', '--format=%H %P', 'HEAD']) || '').split('\n').filter(Boolean)) { const [h, ...p] = l.split(' '); pais.set(h, p); }
  const cadeia = new Set();
  let h = (git(pasta, ['rev-parse', 'HEAD']) || '').trim();
  while (h && !cadeia.has(h)) {
    cadeia.add(h);
    const p = pais.get(h) || [];
    if (p.length < 2) { h = p[0]; continue; }
    const base = (git(pasta, ['merge-base', p[0], p[1]]) || '').trim();
    const trabalho = (x) => +((git(pasta, ['rev-list', '--count', base ? base + '..' + x : x]) || '0').trim());
    h = trabalho(p[1]) > trabalho(p[0]) ? p[1] : p[0];
  }
  return cadeia;
}
function doGit(cofre, utopiaRel) {
  const levas = [];
  const arquivos = Object.values(FONTES).map(([a]) => a).concat(['inicio.js']);
  const principal = linhaPrincipal(RAIZ);
  /* as datas e as notas da linha principal; as junções entram sempre (trazem o que veio do outro lado) */
  const info = new Map();
  for (const l of (git(RAIZ, ['log', '--format=%H%x09%cI%x09%P%x09%s', 'HEAD']) || '').split('\n').filter(Boolean)) {
    const [h, d, p, ...m] = l.split('\t');
    if (principal.has(h)) info.set(h, { h, d, m: m.join('\t'), juncao: p.split(' ').length > 1 });
  }
  const tocam = new Set(commits(RAIZ, arquivos).map((c) => c.h));
  const lista = [...info.values()].filter((c) => tocam.has(c.h) || c.juncao).sort((a, b) => a.d.localeCompare(b.d));
  for (const c of lista) {
    const mostra = (a) => git(RAIZ, ['show', c.h + ':' + a]) || '';
    const w = janela(Object.values(FONTES).map(([a]) => [a, mostra(a)]));
    const f = {};
    for (const [k, [, g]] of Object.entries(FONTES)) f[k] = w[g] || null;
    if (!f.I) f.I = inicioDoCodigo(mostra('inicio.js'));
    const partes = E.tirar(f);
    levas.push({ d: c.d, m: c.m, c: c.h.slice(0, 7), partes });
  }
  if (cofre && utopiaRel) {
    for (const c of commits(cofre, [utopiaRel])) {
      const frase = fraseDaUtopia(git(cofre, ['show', c.h + ':' + utopiaRel]) || '');
      if (frase) levas.push({ d: c.d, m: c.m === '.' ? 'o caderno' : c.m, c: 'caderno ' + c.h.slice(0, 7), partes: { utopia: { l: E.utopia(frase) } } });
    }
  }
  return levas.sort((a, b) => a.d.localeCompare(b.d));
}

/* ---------- guardar ---------- */
export async function guardarEdicoes({ nota = '', doGit: comGit = false, refazer = false, silencio = false } = {}) {
  const H = lerGuardadas();
  const f = await fontesAgora();
  let novas = 0;
  if (comGit) {
    /* o passado entra por baixo do que já estava guardado: junta tudo, em ordem de data, sem repetir.
       Com --refazer, só o git conta (as edições que só existiam neste arquivo se perdem: use com cuidado) */
    const { COFRE } = await import('./lib/vault.mjs');
    const velhas = refazer ? {} : H.partes; H.partes = {};
    const todas = doGit(COFRE, f.utopiaRel).map((lv) => ({ d: lv.d, m: lv.m, c: lv.c, partes: lv.partes }));
    for (const [id, lista] of Object.entries(velhas)) for (const ed of lista) todas.push({ d: ed.d, m: ed.m, c: ed.c, partes: { [id]: { l: ed.l, lc: ed.lc } } });
    todas.sort((a, b) => a.d.localeCompare(b.d));
    for (const lv of todas) novas += juntar(H, lv.partes, lv);
  }
  const agora = new Date();
  const d = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000).toISOString().slice(0, 19) + fusoISO(agora);
  novas += juntar(H, E.tirar(f), { d, m: nota });
  if (novas || comGit || !existsSync(SAIDA)) { H.gerado = d; gravar(H); }
  if (!silencio) {
    const total = Object.values(H.partes).reduce((s, l) => s + l.length, 0);
    console.log((novas ? novas + ' edição(ões) nova(s)' : 'nada mudou desde a última edição') + ' · ' + total + ' edições em ' + Object.keys(H.partes).length + ' partes · ' + SAIDA);
  }
  return novas;
}
function fusoISO(d) { const m = -d.getTimezoneOffset(), s = m >= 0 ? '+' : '-', a = Math.abs(m); return s + String(Math.floor(a / 60)).padStart(2, '0') + ':' + String(a % 60).padStart(2, '0'); }

/* rodado direto: node guardar-edicoes.mjs [--do-git] ["nota"] */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  await guardarEdicoes({ doGit: args.includes('--do-git') || args.includes('--refazer'), refazer: args.includes('--refazer'), nota: args.filter((a) => !a.startsWith('--')).join(' ') });
}
