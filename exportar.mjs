// Exporta o Jadesun como site estático (sem servidor).
//   node exportar.mjs publico   -> exportado/publico  (Biblioteca + linha do tempo; só o que pode ser publicado)
//   node exportar.mjs privado   -> exportado/privado  (tudo, com o seu progresso; para uso pessoal)
// Opções: --rapido (não reduz imagens)  --sem-fontes (não baixa fontes)
import { mkdir, writeFile, readFile, rm, copyFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { obterIndice, ficha, lacunas, estudosDosItens, fichaDaImagem } from './lib/biblioteca.mjs';
import { carregarEstado, COFRE, normalizar } from './lib/vault.mjs';
import { imagensParaEventos } from './lib/linha.mjs';
import { lerPerfil, numerosDoCaderno } from './lib/perfil.mjs';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const modo = process.argv.includes('privado') ? 'privado' : 'publico';
const rapido = process.argv.includes('--rapido');
const semFontes = process.argv.includes('--sem-fontes');
const limpo = process.argv.includes('--limpo');
const cfg = JSON.parse(readFileSync(join(RAIZ, 'publicar.json'), 'utf8'));
const SAIDA = join(RAIZ, 'exportado', modo);
const agora = new Date();
const GERADO = agora.toISOString();
const t0 = Date.now();
const log = (...a) => console.log(`[${Math.round((Date.now() - t0) / 1000)}s]`, ...a);

const PAGINAS = modo === 'publico'
  ? ['biblioteca', 'linha-do-tempo', 'copiar', 'sobre']
  : ['hoje', 'album', 'domino', 'jardim', 'atlas', 'linha-do-tempo', 'falta', 'biblioteca', 'eu', 'copiar', 'protetor'];
const SCRIPTS = modo === 'publico'
  ? ['tema', 'perfil', 'md', 'lenis', 'motion', 'biblioteca', 'mapa', 'copiar', 'linha-dados', 'linha-imagens', 'estatico']
  : ['tema', 'perfil', 'md', 'entradas', 'lenis', 'motion', 'jardim', 'cartao', 'modulos', 'meudia', 'protetor', 'ceu', 'ceu-dados', 'especies', 'j-ceu', 'j-plantas', 'j-estado', 'jardim3d', 'atlas', 'agora', 'domino', 'biblioteca', 'mapa', 'copiar', 'colecao', 'eu', 'falta', 'falta-mais', 'linha-dados', 'linha-imagens', 'estatico'];
const PERMITIDAS = modo === 'publico' ? ['biblioteca', 'quando', 'sobre'] : null;
const INICIO = modo === 'publico' ? 'biblioteca.html' : 'hoje.html';
const NOME = modo === 'publico' ? cfg.nome : 'Jadesun';

const sha = (t) => createHash('sha1').update(t).digest('hex').slice(0, 12);
const tamanho = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

let sharp = null;
if (!rapido) {
  try { sharp = (await import('sharp')).default; } catch { log('AVISO: sharp não instalado; as imagens serão copiadas sem reduzir. Rode "npm install" na pasta jadesun.'); }
}

/* ---------- limpar a saída (só a pasta gerada por este script) ---------- */
if (!SAIDA.startsWith(join(RAIZ, 'exportado'))) throw new Error('Saída inesperada.');
if (limpo) await rm(SAIDA, { recursive: true, force: true });
else if (existsSync(SAIDA)) {
  for (const nome of readdirSync(SAIDA)) if (nome !== 'midia' && nome !== 'fontes') await rm(join(SAIDA, nome), { recursive: true, force: true });
}
await mkdir(join(SAIDA, 'api', 'ficha'), { recursive: true });
log(`Exportando modo ${modo} para ${SAIDA}`);

/* ---------- escolha das fichas ---------- */
const ctx = await obterIndice(true);
const relatorio = { excluidas: [], avisos: [] };
const RISCO_EXCLUI = [
  ['CPF', /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/], ['chave privada', /BEGIN [A-Z ]*PRIVATE KEY/], ['senha explícita', /\b(senha|password|passwd)\s*[:=]\s*\S+/i], ['dado pessoal do autor', /vitordemantova/i],
];
const RISCO_AVISA = [
  ['e-mail', /[\w.+-]+@[\w-]+\.[\w.-]{2,}/], ['telefone', /\(?\b\d{2}\)?\s?9\d{4}[-\s]?\d{4}\b/], ['caminho local', /\b[A-Z]:\\(Users|www)\\/],
];
const permitidos = modo === 'publico' ? new Set(cfg.acervos) : null;
const itens = [];
for (const it of ctx.itens) {
  if (permitidos && !permitidos.has(it.cls.acervo)) continue;
  const vis = String(it.meta.visibilidade || '').toLowerCase();
  if (modo === 'publico' && (vis === 'privado' || vis === 'rascunho')) { relatorio.excluidas.push([it.rel, `visibilidade: ${vis}`]); continue; }
  if (modo === 'publico' && (cfg.excluirCaminhos || []).some((c) => it.rel.includes(c))) { relatorio.excluidas.push([it.rel, 'listada em excluirCaminhos']); continue; }
  if (modo === 'publico') {
    const alto = RISCO_EXCLUI.find(([, re]) => re.test(it.corpo));
    if (alto) { relatorio.excluidas.push([it.rel, `contém ${alto[0]}`]); continue; }
    for (const [nome, re] of RISCO_AVISA) { if (re.test(it.corpo)) relatorio.avisos.push([it.rel, nome]); }
  }
  itens.push(it);
}
const incl = new Set(itens.map((i) => i.id));
log(`${itens.length} fichas incluídas, ${relatorio.excluidas.length} excluídas, ${relatorio.avisos.length} com aviso`);

/* ---------- imagens: destinos e reescrita de URLs ---------- */
const PASTA_SEL = '2 Academy/1 Fundação - Base Científica/Selecao/_imagens/';
const destinos = new Map();
function destino(rel) {
  if (destinos.has(rel)) return destinos.get(rel);
  const ext = extname(rel).toLowerCase();
  const sel = rel.startsWith(PASTA_SEL);
  const h = sha(rel);
  const d = {
    rel, ext, precisaMini: false,
    completa: sel ? `midia/s/${basename(rel)}` : `midia/a/${h}${ext}`,
    mini: ext === '.svg' ? (sel ? `midia/s/${basename(rel)}` : `midia/a/${h}${ext}`) : `midia/t/${sel ? 's' : 'a'}-${h}.jpg`,
  };
  destinos.set(rel, d);
  return d;
}
const decodificar = (enc) => { try { return decodeURIComponent(enc); } catch { return null; } };

function reescrever(texto) {
  let t = texto.replace(/"capa":"(\/midia\?p=[^"]+)"/g, (m, u) => {
    const rel = decodificar(u.slice('/midia?p='.length));
    if (!rel || !ctx.imgs.has(rel)) return '"capa":null';
    const d = destino(rel); d.precisaMini = true;
    return `"capa":"${d.mini}"`;
  });
  t = t.replace(/\/midia\?p=([^)\s"\\<>]+)/g, (m, enc) => {
    const rel = decodificar(enc);
    if (!rel || !ctx.imgs.has(rel)) return m;
    return destino(rel).completa;
  });
  return t;
}

function miniDe(rel) { const d = destino(rel); d.precisaMini = true; return d.mini; }
const escreverJson = async (caminho, obj) => {
  const abs = join(SAIDA, caminho);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, reescrever(JSON.stringify(obj)), 'utf8');
};

/* ---------- biblioteca.json, codigos.json, busca.json ---------- */
const acervos = ctx.acervos.map((a) => {
  const secoes = a.secoes.map((s) => {
    const its = itens.filter((i) => i.secaoId === s.id);
    if (!its.length) return null;
    const subs = new Map();
    its.forEach((i) => { if (i.cls.sub) subs.set(i.cls.sub, (subs.get(i.cls.sub) || 0) + 1); });
    return {
      id: s.id, nome: s.nome, total: its.length, imagens: its.reduce((n, i) => n + i.imagens.length, 0),
      subs: [...subs].map(([nome, total]) => ({ nome, total })),
      capas: its.filter((i) => i.capa).sort((x, y) => y.imagens.length - x.imagens.length).slice(0, 4).map((i) => miniDe(i.capa)),
    };
  }).filter(Boolean);
  return { id: a.id, nome: a.nome, descricao: a.descricao, total: secoes.reduce((n, s) => n + s.total, 0), secoes };
}).filter((a) => a.total > 0);

const totalImagens = new Set(itens.flatMap((i) => i.imagens.map((x) => x.rel))).size;
await escreverJson('api/biblioteca.json', {
  gerado: GERADO, total: itens.length, imagens: totalImagens, acervos,
  itens: itens.map((i) => [i.id, i.titulo, i.secaoId, i.cls.sub, i.tipo, i.capa ? miniDe(i.capa) : '', i.resumo.slice(0, 150), i.imagens.length]),
});

const codigos = {};
for (const i of itens) if (i.codigo) codigos[normalizar(i.codigo)] = i.id;
await escreverJson('api/codigos.json', codigos);

await escreverJson('api/busca.json', itens.map((i) => {
  const titulos = [...i.corpo.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1]).join(' ');
  return [i.id, i.titulo, i.cls.secao, i.cls.acervo, i.capa ? miniDe(i.capa) : '', i.resumo.slice(0, 200), normalizar(`${i.titulo} ${titulos} ${i.corpo.slice(0, 1800)}`)];
}));
log('índice, códigos e busca gravados');

/* ---------- uma ficha por arquivo ---------- */
let feitas = 0;
for (const it of itens) {
  const f = await ficha(it.id);
  if (!f) continue;
  if (modo === 'publico') {
    const ok = (c) => c && incl.has(c.id);
    f.saem = f.saem.filter(ok); f.chegam = f.chegam.filter(ok); f.parecidos = f.parecidos.filter(ok); f.mencoes = f.mencoes.filter(ok); f.vizinhos = f.vizinhos.filter(ok);
    f.anterior = ok(f.anterior) ? f.anterior : null; f.proximo = ok(f.proximo) ? f.proximo : null;
    f.hierarquia = f.hierarquia.map((g) => ({ rotulo: g.rotulo, itens: g.itens.map((x) => (x.id && !incl.has(x.id) ? { titulo: x.titulo } : x)) }));
    f.corpo = f.corpo.replace(/\]\(#f=([^)]+)\)/g, (m, id) => (incl.has(id) ? m : '](#sem)'));
    f.caminho = '';
  }
  await escreverJson(`api/ficha/${it.id}.json`, f);
  if (++feitas % 250 === 0) log(`  ${feitas} fichas…`);
}
log(`${feitas} fichas gravadas`);

/* ---------- linha do tempo ---------- */
const dadosLinha = readFileSync(join(RAIZ, 'linha-dados.js'), 'utf8');
const EVENTOS = new Function(`return ${dadosLinha.match(/var EVENTS = (\[[\s\S]*?\n  \]);/)[1]}`)();
const lin = await imagensParaEventos(EVENTOS);
if (modo === 'publico') {
  lin.eventos = lin.eventos.map((e) => ({ ficha: e.ficha && incl.has(e.ficha) ? e.ficha : null, imagem: e.imagem && incl.has(e.imagem.ficha) ? e.imagem : null }));
  for (const k of Object.keys(lin.eras)) lin.eras[k] = lin.eras[k].filter((im) => incl.has(im.ficha));
}
await escreverJson('api/linha.json', lin);
log('linha do tempo gravada');

/* ---------- dados só do modo privado ---------- */
if (modo === 'privado') {
  const estado = await carregarEstado();
  await escreverJson('api/estado.json', estado);
  await escreverJson('api/estudos.json', await estudosDosItens(estado.checklist));
  await escreverJson('api/lacunas.json', await lacunas());
  await escreverJson('api/perfil.json', { arquivos: await lerPerfil(), numeros: await numerosDoCaderno(estado.cartas) });
  const nomes = [...readFileSync(join(RAIZ, 'falta.js'), 'utf8').matchAll(/\['([a-z0-9_]+\.(?:jpg|jpeg|png))'/g)].map((m) => m[1]);
  const mapa = {};
  for (const n of nomes) { const r = await fichaDaImagem(n); if (r) mapa[n] = r; destino(PASTA_SEL + n); }
  await escreverJson('api/imagem-ficha.json', mapa);
  const album = readFileSync(join(RAIZ, 'album.html'), 'utf8');
  for (const m of album.matchAll(/IMGDIR\+"([a-z0-9_]+\.(?:jpg|jpeg|png))"/g)) destino(PASTA_SEL + m[1]);
  log('estado, estudos, lacunas e perfil gravados');
}

/* ---------- imagens ---------- */
let bytesOriginais = 0;
let bytesFinais = 0;
const lista = [...destinos.values()].filter((d) => existsSync(join(COFRE, d.rel)));
async function emLotes(itensLista, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < itensLista.length) { const x = itensLista[i++]; await fn(x); } }));
}
let processadas = 0;
await emLotes(lista, 6, async (d) => {
  const src = join(COFRE, d.rel);
  const dest = join(SAIDA, d.completa);
  await mkdir(dirname(dest), { recursive: true });
  const infoSrc = await stat(src);
  bytesOriginais += infoSrc.size;
  const feitoAntes = existsSync(dest) && (await stat(dest)).mtimeMs >= infoSrc.mtimeMs && (!d.precisaMini || d.mini === d.completa || existsSync(join(SAIDA, d.mini)));
  if (feitoAntes) {
    bytesFinais += (await stat(dest)).size + (d.precisaMini && d.mini !== d.completa ? (await stat(join(SAIDA, d.mini))).size : 0);
    if (++processadas % 300 === 0) log(`  ${processadas}/${lista.length} imagens…`);
    return;
  }
  try {
    if (!sharp || d.ext === '.svg' || d.ext === '.gif') await copyFile(src, dest);
    else {
      let p = sharp(src, { failOn: 'none' }).rotate().resize({ width: cfg.larguraMax, withoutEnlargement: true });
      p = d.ext === '.png' ? p.png({ compressionLevel: 9, palette: true, quality: 82 }) : d.ext === '.webp' ? p.webp({ quality: 78 }) : p.jpeg({ quality: 78, mozjpeg: true });
      await p.toFile(dest);
    }
  } catch { await copyFile(src, dest); }
  bytesFinais += (await stat(dest)).size;
  if (d.precisaMini && d.mini !== d.completa) {
    const m = join(SAIDA, d.mini);
    await mkdir(dirname(m), { recursive: true });
    try {
      if (!sharp) await copyFile(src, m);
      else await sharp(src, { failOn: 'none' }).rotate().resize({ width: cfg.larguraMiniatura, withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 70 }).toFile(m);
    } catch { await copyFile(src, m); }
    bytesFinais += (await stat(m)).size;
  }
  if (++processadas % 300 === 0) log(`  ${processadas}/${lista.length} imagens…`);
});
function pesoPasta(dir) {
  let total = 0;
  if (!existsSync(dir)) return 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    total += e.isDirectory() ? pesoPasta(p) : statSync(p).size;
  }
  return total;
}
bytesOriginais = lista.reduce((n, d) => n + statSync(join(COFRE, d.rel)).size, 0);
bytesFinais = pesoPasta(join(SAIDA, 'midia'));
log(`${lista.length} imagens: ${tamanho(bytesOriginais)} originais viraram ${tamanho(bytesFinais)} (com miniaturas)`);

/* ---------- fontes locais ---------- */
let fontesOk = false;
if (!semFontes) {
  try {
    const href = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@400;500;700&family=Newsreader:ital,opsz,wght@0,6..72,300..800;1,6..72,300..800&display=swap';
    const css = await (await fetch(href, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' } })).text();
    const blocos = [...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*(@font-face\s*\{[^}]+\})/g)].filter((m) => m[1] === 'latin' || m[1] === 'latin-ext');
    let saida = '';
    const baixados = new Map();
    for (const [, , bloco] of blocos) {
      const url = bloco.match(/url\((https:[^)]+\.woff2)\)/)[1];
      if (!baixados.has(url)) {
        const nome = `fontes/${sha(url)}.woff2`;
        await mkdir(join(SAIDA, 'fontes'), { recursive: true });
        await writeFile(join(SAIDA, nome), Buffer.from(await (await fetch(url)).arrayBuffer()));
        baixados.set(url, nome);
      }
      saida += bloco.replace(url, baixados.get(url)) + '\n';
    }
    await writeFile(join(SAIDA, 'fontes.css'), saida, 'utf8');
    fontesOk = baixados.size > 0;
    log(`fontes locais: ${baixados.size} arquivos`);
  } catch (e) { log('AVISO: não consegui baixar as fontes (o site usará as do Google, se houver internet):', e.message); }
}

/* ---------- páginas, código e ícones ---------- */
const ARQ_ESTATICOS = ['perfil.css', 'fino.css', 'paginas.css', 'cartao.css', 'jardim.css', 'protetor.css', 'icone.svg', 'icone-192.png', 'icone-512.png'];
const gancho = `<script>window.JADESUN_ESTATICO=${JSON.stringify({ modo, gerado: GERADO, paginas: PERMITIDAS, inicio: INICIO, nome: NOME })}</script>\n  <script src="estatico.js"></script>\n  `;
function transformar(html) {
  let t = html;
  t = t.replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, fontesOk ? '<link rel="stylesheet" href="fontes.css">' : '$&');
  t = t.replace('<script src="tema.js"></script>', gancho + '<script src="tema.js"></script>');
  t = t.replace(/(["'])\/imagens\//g, '$1midia/s/');
  t = t.replace(/<script src="(?!(?:tema|perfil|md|entradas|lenis|motion|jardim|cartao|modulos|meudia|protetor|colecao|ceu|ceu-dados|especies|j-ceu|j-plantas|j-estado|jardim3d|atlas|agora|domino|biblioteca|mapa|copiar|eu|falta|falta-mais|linha-dados|linha-imagens|estatico)\.js")[^"]+"[^>]*><\/script>\s*/g, '');
  return t;
}
for (const p of PAGINAS) {
  if (p === 'sobre') continue;
  await writeFile(join(SAIDA, `${p}.html`), transformar(readFileSync(join(RAIZ, `${p}.html`), 'utf8')), 'utf8');
}
for (const s of SCRIPTS) {
  let js = readFileSync(join(RAIZ, `${s}.js`), 'utf8');
  if (s === 'falta' || s === 'album') js = js.replace(/(["'])\/imagens\//g, '$1midia/s/');
  await writeFile(join(SAIDA, `${s}.js`), js, 'utf8');
}
for (const a of ARQ_ESTATICOS) await copyFile(join(RAIZ, a), join(SAIDA, a));
const VENDOR = modo === 'privado' ? ['three.module.min.js', 'THREE-LICENSE.txt', 'D3-CELESTIAL-LICENSE.txt', 'LEIA-ME.txt'] : [];
if (VENDOR.length) {
  await mkdir(join(SAIDA, 'vendor'), { recursive: true });
  for (const a of VENDOR) await copyFile(join(RAIZ, 'vendor', a), join(SAIDA, 'vendor', a));
}
await writeFile(join(SAIDA, 'index.html'), `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${INICIO}"><title>${NOME}</title><a href="${INICIO}">Abrir</a>\n`, 'utf8');

if (modo === 'publico') {
  const sobre = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="tema.js"></script>
  <link rel="manifest" href="manifest.webmanifest">
  <meta name="theme-color" content="#0F0E0B">
  <link rel="icon" href="icone.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="icone-192.png">
  <title>Sobre — ${NOME}</title>
  <link rel="stylesheet" href="perfil.css">
  <link rel="stylesheet" href="fino.css">
  <script src="perfil.js" defer></script>
  <script src="lenis.js" defer></script>
  <script src="motion.js" defer></script>
</head>
<body data-pagina="sobre">
  <div class="casca">
    <aside class="trilho" id="trilho"></aside>
    <main class="miolo">
      <header class="topo-pg">
        <p class="rot"><span>Licença e créditos</span><span>${agora.toLocaleDateString('pt-BR')}</span></p>
        <h1 class="mega">Sobre</h1>
        <p class="resposta">${cfg.descricao}</p>
      </header>
      <div class="grade">
        <section class="cx c-6"><p class="rot">Licença</p><p>O conteúdo autoral deste atlas está sob <b>${cfg.licenca}</b>. Você pode copiar, adaptar e compartilhar, dando crédito e mantendo a mesma licença.</p></section>
        <section class="cx c-6"><p class="rot">Textos e imagens de terceiros</p><p>Muitas fichas do Atlas partem de verbetes da Wikipédia (CC BY-SA 4.0), com o link e a data da coleta no rodapé de cada uma. As imagens vêm em sua maioria do Wikimedia Commons; autoria, licença e origem aparecem junto de cada imagem.</p></section>
        <section class="cx c-6"><p class="rot">Como foi feito</p><p>Estudos escritos com apoio de IA, sob direção e revisão do autor. Nada aqui é conselho médico, jurídico ou financeiro. Se achar um erro, avise.</p></section>
        <section class="cx c-6"><p class="rot">Autoria e contato</p><p>${cfg.autor ? `Autor: ${cfg.autor}.` : 'Autor: a preencher em publicar.json.'} ${cfg.contato ? `Contato: ${cfg.contato}.` : ''}</p></section>
      </div>
    </main>
  </div>
</body>
</html>
`;
  await writeFile(join(SAIDA, 'sobre.html'), sobre, 'utf8');
}

const manifesto = JSON.parse(readFileSync(join(RAIZ, 'manifest.webmanifest'), 'utf8'));
manifesto.name = NOME; manifesto.short_name = NOME.slice(0, 12); manifesto.start_url = INICIO; manifesto.description = cfg.descricao;
await writeFile(join(SAIDA, 'manifest.webmanifest'), JSON.stringify(manifesto, null, 2), 'utf8');

/* ---------- service worker (offline) ---------- */
const nucleo = ['./', 'index.html', ...PAGINAS.map((p) => `${p}.html`), ...ARQ_ESTATICOS, ...SCRIPTS.map((s) => `${s}.js`), ...VENDOR.filter((v) => v.endsWith('.js')).map((v) => `vendor/${v}`), 'manifest.webmanifest', 'api/biblioteca.json', 'api/codigos.json', 'api/linha.json'];
if (fontesOk) nucleo.push('fontes.css');
await writeFile(join(SAIDA, 'sw.js'), `const VERSAO = 'jadesun-${modo}-${agora.getTime()}';
const NUCLEO = ${JSON.stringify(nucleo)};
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(NUCLEO)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.match(r).then((c) => c || fetch(r).then((resp) => {
    if (resp.ok) { const copia = resp.clone(); caches.open(VERSAO).then((cx) => cx.put(r, copia)); }
    return resp;
  }).catch(() => caches.match('${INICIO}'))));
});
`, 'utf8');

/* ---------- relatório e leia-me ---------- */
const relatorioMd = `# Relatório da exportação (${modo})

Gerado em ${GERADO}.

- Fichas incluídas: **${itens.length}** (de ${ctx.itens.length} no caderno)
- Imagens: **${lista.length}** arquivos, ${tamanho(bytesOriginais)} originais -> ${tamanho(bytesFinais)} no site
- Fontes locais: ${fontesOk ? 'sim' : 'não (usa Google Fonts)'}
- Acervos: ${acervos.map((a) => `${a.nome} (${a.total})`).join(', ')}

## Excluídas (${relatorio.excluidas.length})
${relatorio.excluidas.length ? relatorio.excluidas.map(([f, m]) => `- ${f}: ${m}`).join('\n') : '- nenhuma'}

## Avisos para conferir antes de publicar (${relatorio.avisos.length})
${relatorio.avisos.length ? relatorio.avisos.slice(0, 200).map(([f, m]) => `- ${f}: contém ${m}`).join('\n') : '- nenhum'}
`;
await writeFile(join(SAIDA, 'RELATORIO.md'), relatorioMd, 'utf8');
await writeFile(join(SAIDA, 'LEIA-ME.txt'), `JADESUN — exportação ${modo}
Gerada em ${GERADO}

COMO VER AQUI NO COMPUTADOR
  node servir-estatico.mjs exportado/${modo} 5000   (na pasta jadesun)
  e abra http://127.0.0.1:5000/

COMO PUBLICAR (só a pasta exportado/publico)
  Cloudflare Pages (grátis): em pages.cloudflare.com, "Create a project" > "Upload assets" e envie esta pasta.
  Netlify: em app.netlify.com/drop, arraste esta pasta.
  GitHub Pages: coloque esta pasta num repositório público e ative Pages.
  Depois de publicar, o site funciona offline depois da primeira visita (Android/Chrome: "Instalar app").

ANTES DE PUBLICAR: leia RELATORIO.md, preencha "autor" e "contato" em publicar.json e gere de novo.
`, 'utf8');
log(`Pronto: ${SAIDA}`);
