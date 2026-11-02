// Os dois computadores numa história só, sem perder nada. Para cada repositório da pasta-mãe (a www):
//   1. guarda: o que mudou vira um commit (menos .DS_Store, Thumbs.db, desktop.ini, .obsidian, .trash,
//      node_modules e arquivos acima de 95 MB, que o GitHub recusa: esses ficam só aqui, e o relatório diz);
//   2. protege: se os dois computadores mudaram, o seu lado sobe antes para um ramo próprio do GitHub
//      (windows-AAAA-MM-DD-HHMM ou mac-…), que nunca dá conflito;
//   3. junta: nas notas (.md, .txt), onde os dois mexeram na mesma linha, ficam as duas versões, uma
//      embaixo da outra; no caderno (pasta sem package.json nem index.html), os outros arquivos em conflito
//      ficam lado a lado, "nome (do Mac).ext"; num programa, um conflito de código desfaz a junção e nada
//      muda (o seu lado já está no ramo do passo 2, à espera de ajuda);
//   4. publica: git push, sem forçar nunca e sem apagar ramo nenhum.
// Pula a pasta sem GitHub, o ramo que nunca foi ao GitHub, o repositório de outra pessoa, o ai-job-search
// (o perfil é só local) e as cópias antigas de um mesmo repositório (fica a pasta com o nome dele).
// Uso: node juntar-tudo.mjs [pasta] [--ver]   (sem pasta: a pasta-mãe deste repositório; --ver só olha)
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, statSync, mkdirSync, writeFileSync, copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname, basename, extname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const AQUI = dirname(fileURLToPath(import.meta.url));
const ARGS = process.argv.slice(2);
const SO_VER = ARGS.includes('--ver');
const RAIZ = resolve(ARGS.find((a) => !a.startsWith('--')) || (existsSync(join(AQUI, '.git')) ? join(AQUI, '..') : AQUI));
const LIMITE = Number(process.env.JUNTAR_LIMITE_MB || 95) * 1024 * 1024;
const MAQUINA = process.env.JUNTAR_MAQUINA || ({ win32: 'Windows', darwin: 'Mac' }[process.platform] || 'Linux');
const OUTRO = { Windows: 'do Mac', Mac: 'do Windows' }[MAQUINA] || 'do GitHub';
const NOTA = /\.(md|markdown|txt)$/i;
const RUIDO = ['**/.DS_Store', '**/Thumbs.db', '**/desktop.ini', '**/node_modules/**', '.obsidian/**', '.trash/**'];
const SEM_RUIDO = ['--', '.', ...RUIDO.map((g) => `:(exclude,glob)${g}`)];
const eRuido = (p) => /(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini)$|(^|\/)node_modules\/|^\.obsidian\/|^\.trash\//i.test(p);
const PROGRAMA = ['package.json', 'index.html'];

const d2 = (n) => String(n).padStart(2, '0');
const T = new Date();
const CARIMBO = `${T.getFullYear()}-${d2(T.getMonth() + 1)}-${d2(T.getDate())}-${d2(T.getHours())}${d2(T.getMinutes())}`;
const QUANDO = `${d2(T.getDate())}/${d2(T.getMonth() + 1)}, ${d2(T.getHours())}:${d2(T.getMinutes())}`;

const esperar = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const linha1 = (s) => String(s || '').trim().split('\n').pop().trim();

function git(cwd, args, { binario = false } = {}) {
  for (let volta = 0; ; volta++) {
    const r = spawnSync('git', args, { cwd, encoding: binario ? 'buffer' : 'utf8', maxBuffer: 1 << 28, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
    if (r.error) throw r.error;
    const err = String(r.stderr || '').trim();
    if (r.status !== 0 && /index\.lock/.test(err) && volta < 3) { esperar(1500); continue; } // o VS Code segura o índice por um instante
    return { ok: r.status === 0, codigo: r.status, out: binario ? r.stdout : String(r.stdout || ''), err };
  }
}

const lista0 = (s) => s.split('\0').filter(Boolean);
const conflitos = (pasta) => lista0(git(pasta, ['diff', '--name-only', '--diff-filter=U', '-z']).out);
const existe = (pasta, ref) => git(pasta, ['rev-parse', '-q', '--verify', ref]).ok;
function contar(pasta, remoto) {
  const [meus, deles] = git(pasta, ['rev-list', '--left-right', '--count', `HEAD...${remoto}`]).out.trim().split(/\s+/).map(Number);
  return { meus, deles };
}

/* dono e nome de um endereço do GitHub, para reconhecer o que é seu e as cópias de um mesmo repositório */
function doGitHub(url) {
  const m = String(url).trim().match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?\/?$/i);
  return m ? { dono: m[1].toLowerCase(), nome: m[2].toLowerCase() } : null;
}
const DONO = doGitHub(git(AQUI, ['config', '--get', 'remote.origin.url']).out)?.dono || 'vpdemantova';

/* o que fica ao lado: "nome (do Mac).ext", "nome (do Mac 2).ext"… */
function vizinho(caminho) {
  const ext = extname(caminho), base = caminho.slice(0, caminho.length - ext.length);
  for (let n = 1; ; n++) {
    const c = `${base} (${OUTRO}${n > 1 ? ' ' + n : ''})${ext}`;
    if (!existsSync(c)) return c;
  }
}

/* cada arquivo em conflito: as duas versões juntas (notas), lado a lado (caderno) ou à espera (código) */
function resolver(pasta, lista, r) {
  const programa = PROGRAMA.some((f) => existsSync(join(pasta, f)));
  const codigo = [];
  const tmp = mkdtempSync(join(tmpdir(), 'juntar-'));
  const blob = (sha) => (sha ? git(pasta, ['cat-file', 'blob', sha], { binario: true }).out : Buffer.alloc(0));
  try {
    for (const p of lista) {
      const st = {};
      for (const e of lista0(git(pasta, ['ls-files', '-u', '-z', '--', p]).out)) {
        const [info] = e.split('\t');
        const [, sha, n] = info.split(' ');
        st[n] = sha;
      }
      const caminho = join(pasta, p);
      if (st[2] && st[3]) {
        const meu = blob(st[2]), dele = blob(st[3]), base = blob(st[1]);
        if (NOTA.test(p) && ![meu, dele, base].some((b) => b.includes(0))) {
          const [a, o, b] = ['meu', 'base', 'dele'].map((n) => join(tmp, n));
          writeFileSync(a, meu); writeFileSync(o, base); writeFileSync(b, dele);
          const u = git(pasta, ['merge-file', '--union', '-p', a, o, b], { binario: true });
          if (u.codigo === 0 && u.out.length) {
            writeFileSync(caminho, u.out);
            if (git(pasta, ['add', '--', p]).ok) { r.notas.push(p); continue; }
          }
          codigo.push(p);
          continue;
        }
        if (programa) { codigo.push(p); continue; }
        const outro = vizinho(caminho);
        writeFileSync(outro, dele);
        writeFileSync(caminho, meu);
        const rel = relative(pasta, outro).split('\\').join('/');
        if (git(pasta, ['add', '--', p, rel]).ok) r.lado.push(rel); else codigo.push(p);
        continue;
      }
      /* um lado apagou e o outro mudou: fica o que mudou */
      if (!existsSync(caminho)) git(pasta, ['checkout', st[2] ? '--ours' : '--theirs', '--', p]);
      if (git(pasta, ['add', '--', p]).ok) r.mantidos.push(p); else codigo.push(p);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  return codigo;
}

function juntar(pasta) {
  const r = { feito: [], notas: [], lado: [], mantidos: [], grandes: [], ajuda: false };
  const fim = (texto, ajuda = false) => { if (texto) r.feito.push(texto); r.ajuda ||= ajuda; return r; };
  const gitdir = git(pasta, ['rev-parse', '--absolute-git-dir']).out.trim();
  if (['rebase-merge', 'rebase-apply', 'CHERRY_PICK_HEAD', 'REVERT_HEAD'].some((f) => existsSync(join(gitdir, f)))) return fim('há um rebase ou cherry-pick pela metade: não mexi', true);
  const ramo = git(pasta, ['symbolic-ref', '--short', '-q', 'HEAD']).out.trim();
  if (!ramo) return fim('fora de um ramo (HEAD solto): não mexi', true);
  if (!existe(pasta, 'HEAD')) return fim('repositório ainda vazio');

  /* 0. uma junção pela metade: copia os arquivos em conflito (com o que você já tiver escolhido) e desfaz */
  if (existsSync(join(gitdir, 'MERGE_HEAD'))) {
    if (SO_VER) r.feito.push('há uma junção pela metade (seria copiada, desfeita e refeita)');
    else {
      const copia = join(gitdir, 'juntar-tudo', CARIMBO);
      for (const p of conflitos(pasta)) {
        if (!existsSync(join(pasta, p))) continue;
        mkdirSync(dirname(join(copia, p)), { recursive: true });
        copyFileSync(join(pasta, p), join(copia, p));
      }
      const ab = git(pasta, ['merge', '--abort']);
      if (!ab.ok) return fim(`a junção pela metade não se desfez (${linha1(ab.err)})`, true);
      r.feito.push(`a junção pela metade foi desfeita e refeita (o que estava nela: ${copia})`);
    }
  }

  /* 1. guarda */
  for (const p of lista0(git(pasta, ['ls-files', '-o', '--exclude-standard', '-z']).out)) {
    if (eRuido(p)) continue;
    try { if (statSync(join(pasta, p)).size > LIMITE) r.grandes.push(p); } catch { /* sumiu no meio */ }
  }
  const sujos = git(pasta, ['status', '--porcelain', ...SEM_RUIDO]).out.split('\n').filter(Boolean).length;
  if (!SO_VER) {
    const add = git(pasta, ['add', '-A', ...SEM_RUIDO, ...r.grandes.map((p) => `:(exclude,literal)${p}`)]);
    if (!add.ok) return fim(`não consegui guardar (${linha1(add.err)})`, true);
    if (!git(pasta, ['diff', '--cached', '--quiet']).ok) {
      const c = git(pasta, ['commit', '-q', '--no-verify', '-m', `O que estava no ${MAQUINA} em ${QUANDO}, guardado antes de juntar`]);
      if (!c.ok) return fim(`não consegui fazer o commit (${linha1(c.err || c.out)})`, true);
      r.feito.push('guardado');
    }
  } else if (sujos) r.feito.push(`${sujos} arquivo${sujos > 1 ? 's' : ''} mudado${sujos > 1 ? 's' : ''} para guardar`);

  /* o que o GitHub tem */
  const f = git(pasta, ['fetch', '-q', 'origin']);
  if (!f.ok) return fim(`sem rede ou sem acesso ao GitHub (${linha1(f.err)})`, true);
  const remoto = `refs/remotes/origin/${ramo}`;
  if (!existe(pasta, remoto)) return fim(`o ramo ${ramo} nunca foi ao GitHub: ficou só aqui`);
  let { meus, deles } = contar(pasta, remoto);

  if (SO_VER) {
    if (meus && deles) {
      const mt = git(pasta, ['merge-tree', '--write-tree', '--name-only', '--no-messages', 'HEAD', remoto]);
      const lista = mt.codigo === 1 ? mt.out.split('\n').slice(1).filter(Boolean) : [];
      const previsao = mt.codigo > 1 ? '; este git não prevê os conflitos' : lista.length ? `; conflito provável em: ${lista.join(', ')}` : '; sem conflito à vista';
      r.feito.push(`os dois mudaram (${meus} daqui, ${deles} do GitHub)${previsao}`);
    } else if (deles) r.feito.push(`${deles} commit${deles > 1 ? 's' : ''} do GitHub para trazer`);
    else if (meus) r.feito.push(`${meus} commit${meus > 1 ? 's' : ''} daqui para publicar`);
    if (!r.feito.length) r.feito.push('igual ao GitHub');
    return r;
  }

  /* 2. protege */
  let protecao = '';
  if (meus && deles) {
    const prefixo = `origin/${MAQUINA.toLowerCase()}-`;
    const ja = git(pasta, ['for-each-ref', '--points-at', 'HEAD', '--format=%(refname:short)', 'refs/remotes/origin/']).out.split('\n').find((n) => n.startsWith(prefixo));
    const nome = ja ? ja.slice('origin/'.length) : `${MAQUINA.toLowerCase()}-${CARIMBO}`;
    const p = ja ? { ok: true } : git(pasta, ['push', '-q', 'origin', `HEAD:refs/heads/${nome}`]);
    if (p.ok) { protecao = nome; r.feito.push(`protegido no ramo ${nome}`); } else r.feito.push(`o ramo de proteção não subiu (${linha1(p.err)})`);
  }

  /* 3. junta */
  if (deles) {
    /* .DS_Store e afins não são trabalho: se o GitHub muda um deles, o daqui sai do caminho */
    const vindos = new Set(lista0(git(pasta, ['diff', '--name-only', '-z', 'HEAD', remoto]).out));
    const ruido = lista0(git(pasta, ['diff', '--name-only', '-z']).out).filter((p) => vindos.has(p) && /(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini)$/i.test(p));
    if (ruido.length) git(pasta, ['checkout', '--', ...ruido]);
    const m = git(pasta, ['merge', '--ff', '--no-verify', '--no-edit', '-m', `Junta o ${MAQUINA} e o GitHub em ${QUANDO} (juntar-tudo)`, remoto]);
    if (!m.ok) {
      const lista = conflitos(pasta);
      if (!lista.length) {
        if (existsSync(join(gitdir, 'MERGE_HEAD'))) git(pasta, ['merge', '--abort']);
        return fim(`não juntei (${linha1(m.err || m.out)})`, true);
      }
      const codigo = resolver(pasta, lista, r);
      if (codigo.length || conflitos(pasta).length) {
        git(pasta, ['merge', '--abort']);
        r.notas = []; r.lado = []; r.mantidos = [];
        return fim(`conflito no código (${codigo.join(', ')}): nada mudou aqui; o seu lado ${protecao ? `está no ramo ${protecao} do GitHub` : 'está no commit de agora'}`, true);
      }
      const corpo = [
        r.notas.length && ['Notas com as duas versões (onde os dois mexeram na mesma linha):', ...r.notas.map((p) => `- ${p}`)].join('\n'),
        r.lado.length && ['Lado a lado (o deste computador no lugar, o outro ao lado):', ...r.lado.map((p) => `- ${p}`)].join('\n'),
        r.mantidos.length && ['Apagados de um lado e mudados do outro (ficaram):', ...r.mantidos.map((p) => `- ${p}`)].join('\n'),
      ].filter(Boolean).join('\n\n');
      const c = git(pasta, ['commit', '-q', '--no-verify', '-m', `Junta o ${MAQUINA} e o GitHub em ${QUANDO} (juntar-tudo)`, ...(corpo ? ['-m', corpo] : [])]);
      if (!c.ok) { git(pasta, ['merge', '--abort']); return fim(`não consegui fechar a junção (${linha1(c.err || c.out)})`, true); }
    }
    r.feito.push(meus ? `juntado com ${deles} commit${deles > 1 ? 's' : ''} do GitHub` : `atualizado (${deles} commit${deles > 1 ? 's' : ''} do GitHub)`);
    if (r.notas.length) r.feito.push(`${r.notas.length} nota${r.notas.length > 1 ? 's' : ''} com as duas versões`);
    if (r.lado.length) r.feito.push(`${r.lado.length} arquivo${r.lado.length > 1 ? 's' : ''} lado a lado`);
    if (r.mantidos.length) r.feito.push(`${r.mantidos.length} apagado${r.mantidos.length > 1 ? 's' : ''} de um lado e mudado${r.mantidos.length > 1 ? 's' : ''} do outro (ficou)`);
  }

  /* 4. publica */
  ({ meus } = contar(pasta, remoto));
  if (meus) {
    const p = git(pasta, ['push', '-q', 'origin', `HEAD:refs/heads/${ramo}`]);
    if (p.ok) r.feito.push('publicado');
    else {
      git(pasta, ['fetch', '-q', 'origin']);
      const mudou = contar(pasta, remoto).deles > 0;
      return fim(mudou ? 'o GitHub mudou no meio: rode de novo' : `não publiquei (${linha1(p.err)})`, true);
    }
  }
  if (r.grandes.length) r.feito.push(`grande demais para o GitHub, ficou só aqui: ${r.grandes.join(', ')}`);
  if (!r.feito.length) r.feito.push('igual ao GitHub');
  return r;
}

/* as pastas, e quem fica de fora */
const pastas = readdirSync(RAIZ, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(RAIZ, d.name, '.git')))
  .map((d) => ({ nome: d.name, pasta: join(RAIZ, d.name), gh: doGitHub(git(join(RAIZ, d.name), ['config', '--get', 'remote.origin.url']).out) }))
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
const porRepo = new Map();
for (const p of pastas) if (p.gh) porRepo.set(`${p.gh.dono}/${p.gh.nome}`, [...(porRepo.get(`${p.gh.dono}/${p.gh.nome}`) || []), p]);
function porQueNao(p) {
  if (!p.gh) return 'só neste computador (sem GitHub)';
  if (p.gh.dono !== DONO) return `é de ${p.gh.dono}, não seu: não mexi`;
  if (p.gh.nome.includes('ai-job-search')) return 'o perfil é só deste computador: nunca envio';
  const iguais = porRepo.get(`${p.gh.dono}/${p.gh.nome}`);
  if (iguais.length > 1 && p.nome.toLowerCase() !== p.gh.nome) {
    return iguais.some((q) => q.nome.toLowerCase() === p.gh.nome) ? `cópia antiga de ${p.gh.nome}: não mexi` : `outra pasta também é ${p.gh.nome}: não mexi em nenhuma`;
  }
  return '';
}

console.log(`\nJuntar tudo · ${MAQUINA} · ${QUANDO} · ${RAIZ}${SO_VER ? ' · só olhando, nada muda' : ''}\n`);
const largura = Math.max(...pastas.map((p) => p.nome.length), 4) + 2;
const todos = [];
for (const p of pastas) {
  const nao = porQueNao(p);
  let r;
  try {
    r = nao ? { feito: [nao], notas: [], lado: [], mantidos: [], ajuda: false } : juntar(p.pasta);
  } catch (e) {
    if (e.code === 'ENOENT') { console.log('O git não foi encontrado. Ele está instalado? Rode: git --version'); process.exit(2); }
    r = { feito: [`erro: ${e.message}`], notas: [], lado: [], mantidos: [], ajuda: true };
  }
  todos.push({ ...p, ...r });
  console.log(`  ${p.nome.padEnd(largura)}${r.ajuda ? 'PRECISA DE AJUDA · ' : ''}${r.feito.join(' · ')}`);
}

const notas = todos.flatMap((t) => t.notas.map((n) => `${t.nome}/${n}`));
const lado = todos.flatMap((t) => t.lado.map((n) => `${t.nome}/${n}`));
const mantidos = todos.flatMap((t) => t.mantidos.map((n) => `${t.nome}/${n}`));
if (notas.length) console.log(`\nNotas com as duas versões (as linhas dos dois computadores, uma embaixo da outra; arrume quando quiser):\n${notas.map((n) => `  ${n}`).join('\n')}`);
if (lado.length) console.log(`\nLado a lado (o deste computador no lugar, o outro ao lado):\n${lado.map((n) => `  ${n}`).join('\n')}`);
if (mantidos.length) console.log(`\nUm lado apagou, o outro mudou, e ficaram:\n${mantidos.map((n) => `  ${n}`).join('\n')}`);
const ajuda = todos.filter((t) => t.ajuda);
if (SO_VER) console.log('\nSó olhei. Sem o --ver, eu guardo, protejo, junto e publico.');
else if (!ajuda.length) console.log(`\nPronto: tudo dos dois computadores está nesta pasta e no GitHub.`);
else console.log(`\n${ajuda.length === 1 ? 'Um repositório espera' : `${ajuda.length} repositórios esperam`} ajuda (${ajuda.map((t) => t.nome).join(', ')}). Nada se perdeu: o que é deste computador está guardado aqui${ajuda.some((t) => t.feito.some((x) => x.includes('ramo '))) ? ' e no ramo de proteção' : ''}.`);
process.exitCode = ajuda.length ? 1 : 0;
