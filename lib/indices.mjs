/* ============================================================
   lib/indices.mjs — o índice dos índices (PS-85, 02/nov/2026).

   De onde veio: o pedido dele em 31/out/2026, "preciso que o portal solar seja o indice dos indices"
   (TAREFAS, PS-85: uma porta que reúne e busca todos os índices do Portal, com o que cada um tem e
   quando mudou). Cada índice do Portal vira um volume: o que ele tem (as contas), as partes, quando
   mudou e de onde vem. "Quando mudou" é a data do último commit que tocou a fonte; se a fonte mudou
   depois dele (ainda fora do git), vale a data do arquivo.

   A busca única: uma linha por item de cada índice, [volume, título, linha de baixo, endereço, texto
   da busca], com o endereço que abre o item lá dentro (teia.html#p=…, ferramentas.html#q=…,
   doar.html#o-…, curadoria.html#g-…). As fichas ficam de fora: a busca delas é a da Biblioteca
   (/api/buscar), que a página chama junto.

   Para onde vai: /api/indices (servir.mjs, ao vivo; só no computador entram os índices da casa) e
   api/indices.json (exportar.mjs, só com o que vai ao público). Quem desenha é o indices.js.
   ============================================================ */
import { readFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { COFRE, CAMINHOS } from './vault.mjs';
import { obterIndice } from './biblioteca.mjs';
import { teia } from './teia.mjs';
import { lerCuradoria } from './curadoria.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const E = createRequire(import.meta.url)('../inicio-edicoes.js');
const FICHAS = '2 Academy';

const norm = (s) => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
/* o mesmo slug do manifesto.js (o id de cada manifesto da humanidade) */
const slug = (s) => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48).replace(/-+$/, '');
const curto = (s, n) => { s = String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/\*\*?/g, '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };
const ano = (n) => (n == null ? '' : n < 0 ? `${-n} a.C.` : String(n));
const anos = (a, b) => (a != null && b != null ? `${ano(a)}–${ano(b)}` : a != null ? `n. ${ano(a)}` : b != null ? `m. ${ano(b)}` : '');
/* [volume, título, linha de baixo, endereço, o resto do texto da busca]; o título e a linha de baixo
   entram na busca do lado da página (indices.js), para não irem duas vezes no arquivo */
const item = (v, titulo, sub, href, extra, peso) => {
  const x = [v, curto(titulo, 90), curto(sub, 110), href, norm(curto(extra, 240))];
  if (peso) x.push(peso); /* o peso desempata a busca: na Teia, quem tem ficha e mais elos vem antes */
  return x;
};

/* ---------- quando cada fonte mudou ---------- */
const git = (repo, args) => new Promise((ok) => {
  execFile('git', ['-C', repo, ...args], { timeout: 15000, windowsHide: true, maxBuffer: 8 << 20 }, (e, out) => ok(e ? '' : String(out)));
});
async function quando(repo, rels) {
  rels = rels.filter(Boolean);
  if (!rels.length) return null;
  const [log, sujos] = await Promise.all([
    git(repo, ['log', '-1', '--format=%cI', '--', ...rels]),
    git(repo, ['status', '--porcelain', '-z', '--untracked-files=all', '--', ...rels]),
  ]);
  const datas = log.trim() ? [new Date(log.trim())] : [];
  /* mudou depois do último commit (ou nunca entrou no git): a data do arquivo */
  const nomes = sujos.split('\0').filter((x) => /^[ MADRCU?!]{2} /.test(x)).map((x) => x.slice(3)).slice(0, 400);
  await Promise.all(nomes.map(async (n) => { try { datas.push((await stat(join(repo, n))).mtime); } catch { /* apagado */ } }));
  /* fora de um repositório: a data do próprio arquivo */
  if (!datas.length) await Promise.all(rels.map(async (r) => { try { const s = await stat(join(repo, r)); if (s.isFile()) datas.push(s.mtime); } catch { /* não existe */ } }));
  return datas.length ? new Date(Math.max(...datas.map(Number))).toISOString() : null;
}
const maisNova = (...ds) => ds.filter(Boolean).sort().pop() || null;

/* ---------- os arquivos de dados das páginas (scripts de navegador), numa janela de mentira ---------- */
async function janela(nomes) {
  const w = {};
  const ctx = vm.createContext({ window: w, console, navigator: {}, location: { search: '', hash: '' } });
  for (const nome of nomes) {
    try { vm.runInContext(await readFile(join(RAIZ, nome), 'utf8'), ctx, { filename: nome, timeout: 3000 }); } catch { /* um arquivo quebrado não derruba os outros */ }
  }
  return w;
}

/* ---------- as tabelas do caderno (as mesmas regras do catalogo.js e do museus.js) ---------- */
const SEP = /^\s*\|\s*:?-{2,}/;
const celulas = (l) => l.trim().split('|').slice(1, -1).map((x) => x.trim());
function lerTabelas(corpo, campoGrupo) {
  const itens = [], linhas = String(corpo || '').split(/\r?\n/);
  let grupo = '', cab = null;
  linhas.forEach((l, i) => {
    const h2 = l.match(/^##\s+(.+)$/);
    if (h2) { grupo = h2[1].trim(); cab = null; return; }
    if (!/^\s*\|/.test(l)) { cab = null; return; }
    if (SEP.test(l)) return;
    const c = celulas(l);
    if (!cab) { if (SEP.test(linhas[i + 1] || '')) cab = c; return; }
    const it = {};
    cab.forEach((k, j) => { it[k] = (c[j] || '').replace(/\[\[|\]\]/g, ''); });
    if (campoGrupo) it[campoGrupo] = grupo;
    itens.push(it);
  });
  return itens;
}
function lerMuseus(corpo) {
  const itens = [];
  let tipo = '', grupo = '';
  for (const l of String(corpo || '').split(/\r?\n/)) {
    const h2 = l.match(/^##\s+(.+)$/), h3 = l.match(/^###\s+(.+)$/);
    if (h2) { tipo = /funda/i.test(h2[1]) ? 'fundacao' : 'museu'; grupo = ''; continue; }
    if (h3) { grupo = h3[1].trim(); continue; }
    if (!tipo || !/^\|/.test(l) || /^\|\s*-/.test(l) || /^\|\s*Nome\s*\|/i.test(l)) continue;
    const c = celulas(l);
    if (c.length < 5 || !c[0]) continue;
    itens.push({ tipo, grupo, nome: c[0].replace(/\[\[|\]\]/g, ''), cidade: c[1], pais: c[2], ano: c[3], acervo: c[4] });
  }
  return itens;
}
const distintos = (lista) => [...new Set(lista.filter(Boolean))];

/* ---------- os volumes ---------- */
let memo = null, memoEm = 0;

/**
 * publico: só o que vai ao site (permitidas = as páginas exportadas; incluir = as fichas que vão);
 * fichas: { total, imagens } no público; teiaDados: a Teia já montada (para não montar duas vezes);
 * estado: o estado da casa (o Checklist), para o Domínio, só no computador.
 */
export async function indices({ publico = false, permitidas = null, fichas = null, incluir = () => true, teiaDados = null, estado = null } = {}) {
  if (!publico && memo && Date.now() - memoEm < 120000) return memo;
  const w = await janela(['mapa-dados.js', 'linha-dados.js', 'doar-dados.js', 'manifesto-dados.js', 'campos-dados.js', 'curadoria-dados.js', 'guias-dados.js', 'galeria-dados.js', 'inicio-edicoes-dados.js']);
  const [ctx, cur, td] = await Promise.all([obterIndice(), lerCuradoria().catch(() => ({ posts: [] })), teiaDados || teia({ incluir: (it) => incluir(it.id) })]);
  const daColecao = (titulo) => ctx.itens.find((i) => i.titulo === titulo && incluir(i.id)) || null;
  const M = w.MAPA;
  const pagina = (id) => (M && M.todas().find((x) => x.id === id)) || null;
  const vale = (id) => !publico || ((!permitidas || permitidas.includes(id)) && (!pagina(id) || pagina(id).publico));
  const volumes = [], itens = [];
  const somar = (v, lista) => { if (!vale(v.pagina)) return; volumes.push(v); for (const x of lista || []) itens.push(x); };

  /* 1. as Fichas: a busca delas é a /api/buscar */
  {
    const sec = ((M && M.PORTAS.biblioteca.paginas[0][4]) || []).map((s) => s[1]);
    const total = fichas ? fichas.total : ctx.itens.length, imgs = fichas ? fichas.imagens : ctx.totalImagens;
    somar({
      id: 'fichas', pagina: 'biblioteca', nome: 'Fichas', href: 'biblioteca.html', busca: 'biblioteca.html#q={q}',
      desc: 'Tudo o que tem ficha no caderno, da matéria às obras, com as imagens, as fontes e os elos.',
      contas: [[total, 'ficha', 'fichas'], [imgs, 'imagem', 'imagens']], partes: sec,
      mudou: await quando(COFRE, [FICHAS]), fonte: 'o caderno: 2 Academy (o Atlas, as matérias da prova, as práticas, a fundação e as aulas)',
    });
  }

  /* 2. a Teia: as pessoas, as famílias, as escolas e os grupos */
  {
    const nos = td.nos || [];
    const pessoas = nos.filter((n) => !n.fora && n.tipo === 'pessoa'), grupos = nos.filter((n) => !n.fora && n.tipo !== 'pessoa');
    const lista = daColecao('A Teia — as pessoas de cada área');
    const grau = {};
    for (const l of td.elos || []) { grau[l.de] = (grau[l.de] || 0) + 1; grau[l.para] = (grau[l.para] || 0) + 1; }
    const lst = nos.map((n) => item('teia', n.nome,
      [n.area, anos(n.nasc, n.morte), n.fora ? 'citado nas fichas' : n.semente ? 'ainda sem ficha' : n.sub].filter(Boolean).join(' · '),
      'teia.html#p=' + encodeURIComponent(n.id), `${n.origem || ''} ${curto(n.resumo, 160)}`,
      (n.fora ? 0 : n.semente ? 5 : 30) + (grau[n.id] || 0)));
    somar({
      id: 'teia', pagina: 'teia', nome: 'A Teia', href: 'teia.html',
      desc: 'Quem aprendeu com quem: as pessoas, as famílias, as escolas e os grupos, desde o primeiro registro.',
      contas: [[pessoas.length, 'pessoa', 'pessoas'], [grupos.length, 'grupo', 'grupos'], [(td.elos || []).length, 'elo', 'elos']],
      partes: (td.areas || []).map((a) => a.nome),
      mudou: maisNova(await quando(RAIZ, ['teia-wikidata.json']), lista ? await quando(COFRE, [lista.rel]) : null),
      fonte: 'as fichas de pessoas e grupos do Atlas, a lista "A Teia — as pessoas de cada área" e os elos do Wikidata (CC0)',
    }, lst);
  }

  /* 3. Quando: a linha do tempo */
  if (w.LINHA) {
    const area = {}; (w.LINHA.AREAS || []).forEach((a) => { area[a.code] = a.name; });
    const ev = w.LINHA.EVENTS || [];
    somar({
      id: 'quando', pagina: 'quando', nome: 'Quando', href: 'linha-do-tempo.html', busca: 'linha-do-tempo.html#q={q}',
      desc: 'A linha do tempo: os marcos de cada matéria, do osso de Ishango ao agora.',
      contas: [[ev.length, 'marco', 'marcos'], [(w.LINHA.ERAS || []).length, 'era', 'eras']],
      partes: (w.LINHA.ERAS || []).map((e) => String(e.title || '').split(':')[0].replace(/<[^>]+>/g, '')),
      mudou: await quando(RAIZ, ['linha-dados.js']), fonte: 'linha-dados.js: cada marco com a ficha de onde vem',
    }, ev.map((e) => item('quando', e[3], `${e[1]} · ${area[e[2]] || ''}`, 'linha-do-tempo.html#q=' + encodeURIComponent(curto(e[3], 90).toLowerCase()), e[4])));
  }

  /* 4. as Ferramentas e plataformas (uma tabela por área, no caderno) */
  {
    const f = daColecao('Ferramentas e Plataformas');
    if (f) {
      const its = lerTabelas(f.corpo, 'Área').filter((x) => (x.Nome || '').trim());
      somar({
        id: 'ferramentas', pagina: 'ferramentas', nome: 'Ferramentas', href: 'ferramentas.html', busca: 'ferramentas.html#q={q}',
        desc: 'Os apps de IA, as ferramentas e as plataformas para aprender, criar e programar, com etiquetas e filtros.',
        contas: [[its.length, 'ferramenta', 'ferramentas'], [distintos(its.map((x) => x['Área'])).length, 'área', 'áreas'], [its.filter((x) => x.IA === 'sim').length, 'com IA', 'com IA']],
        partes: distintos(its.map((x) => x['Área'])),
        mudou: await quando(COFRE, [f.rel]), fonte: 'o caderno: Atlas › 0 Coleções › Ferramentas e Plataformas',
      }, its.map((x) => item('ferramentas', x.Nome, `${x['Área']} · ${x['O que faz'] || ''}`, 'ferramentas.html#q=' + encodeURIComponent(x.Nome), `${x['Para quê'] || ''} ${x['Preço'] || ''} ${x.Onde || ''}`)));
    }
  }

  /* 5. os Museus e as fundações (só no computador, como a página) */
  {
    const f = daColecao('Museus e Fundações da Humanidade');
    if (f) {
      const its = lerMuseus(f.corpo), nM = its.filter((x) => x.tipo === 'museu').length;
      somar({
        id: 'museus', pagina: 'museus', nome: 'Museus', href: 'museus.html', busca: 'museus.html#q={q}',
        desc: 'Onde o mundo está guardado: os museus, as fundações e os institutos, por continente.',
        contas: [[nM, 'museu', 'museus'], [its.length - nM, 'fundação', 'fundações'], [distintos(its.map((x) => x.pais)).length, 'país', 'países']],
        partes: distintos(its.map((x) => x.grupo)),
        mudou: await quando(COFRE, [f.rel]), fonte: 'o caderno: Atlas › 0 Coleções › Museus e Fundações da Humanidade',
      }, its.map((x) => item('museus', x.nome, [[x.cidade, x.pais].filter(Boolean).join(', '), x.ano && x.ano !== '—' ? 'desde ' + x.ano : ''].filter(Boolean).join(' · '), 'museus.html#q=' + encodeURIComponent(x.nome), x.acervo)));
    }
  }

  /* 6. Distribuir: as causas e as organizações (o id de cada uma é o mesmo do doar.js) */
  if (w.DOAR) {
    const lst = [];
    let nA = 0;
    for (const fam of w.DOAR.familias || []) {
      for (const a of fam.areas || []) {
        nA += 1;
        (a.orgs || []).forEach((o, i) => lst.push(item('distribuir', o.nome, `${a.nome}${o.onde ? ' · ' + o.onde : ''}`, `doar.html#o-${a.id}-${i + 1}`, `${o.oque || ''} ${(o.assuntos || []).join(' ')} ${fam.nome}`)));
      }
    }
    somar({
      id: 'distribuir', pagina: 'doar', nome: 'Distribuir', href: 'doar.html',
      desc: 'As causas primeiro: as organizações de cada área, com a prova de transparência ao lado.',
      contas: [[lst.length, 'organização', 'organizações'], [nA, 'área', 'áreas'], [(w.DOAR.familias || []).length, 'família', 'famílias']],
      partes: (w.DOAR.familias || []).map((f) => f.nome),
      mudou: await quando(RAIZ, ['doar-dados.js', 'doar-config.js']), fonte: 'doar-dados.js: a pesquisa de 12–13/out/2026, cada link aberto antes de entrar',
    }, lst);
  }

  /* 7. os manifestos da humanidade */
  if (w.MANIFESTO) {
    const fam = {}; (w.MANIFESTO.familias || []).forEach((f) => { fam[f[0]] = f[1]; });
    const ms = w.MANIFESTO.manifestos || [];
    somar({
      id: 'manifestos', pagina: 'manifestos', nome: 'Os manifestos', href: 'manifestos.html',
      desc: 'Os manifestos da humanidade, de Lutero ao local-first: quem escreveu, o que pedem e onde ler.',
      contas: [[ms.length, 'manifesto', 'manifestos'], [Object.keys(fam).length, 'família', 'famílias']],
      partes: Object.values(fam),
      mudou: await quando(RAIZ, ['manifesto-dados.js']), fonte: 'manifesto-dados.js',
    }, ms.map((m) => item('manifestos', m.titulo, `${m.ano} · ${m.quem}`, `manifestos.html#mv-${m.ano}-${slug(m.titulo)}`, `${m.onde || ''} ${m.pede || ''} ${fam[m.familia] || ''}`)));
  }

  /* 8. todas as áreas do trabalho e do saber */
  if (w.CAMPOS) {
    const g = {}; (w.CAMPOS.grandes || []).forEach((x) => { g[x[0]] = x[1]; });
    const as = w.CAMPOS.areas || [];
    somar({
      id: 'campos', pagina: 'campos', nome: 'Todas as áreas', href: 'campos.html',
      desc: 'O mundo do trabalho e do saber, área por área, com as subáreas, os nichos e onde entrar.',
      contas: [[as.length, 'área', 'áreas'], [Object.keys(g).length, 'grande área', 'grandes áreas'], [as.reduce((n, a) => n + (a.sub || []).length, 0), 'subárea', 'subáreas']],
      partes: Object.values(g),
      mudou: await quando(RAIZ, ['campos-dados.js']), fonte: 'campos-dados.js: a classificação da UNESCO para os campos de educação (ISCED-F 2013)',
    }, as.map((a) => item('campos', a.nome, `${g[a.g] || ''} · ${a.pergunta || ''}`, 'campos.html#area=' + a.id, `${(a.sub || []).map((s) => s[1]).join(' ')} ${(a.nichos || []).join(' ')}`)));
  }

  /* 9 e 10. a Curadoria e o glossário */
  if (w.CURADORIA) {
    const posts = (w.CURADORIA.posts || []).slice();
    for (const p of cur.posts || []) if (!posts.some((x) => x.slug === p.slug)) posts.push(p);
    const lst = [];
    for (const p of posts) {
      lst.push(item('curadoria', p.titulo, `${p.data || ''}${p.sub ? ' · ' + p.sub : ''}`, 'curadoria.html?p=' + encodeURIComponent(p.slug), p.curador && p.curador.nome ? p.curador.nome : p.curador));
      for (const x of p.partes || []) lst.push(item('curadoria', x.titulo, `${p.titulo}${x.lugar ? ' · ' + x.lugar : ''}`, 'curadoria.html?p=' + encodeURIComponent(p.slug) + '#' + x.id, x.lead));
    }
    const pastaCur = cur.pasta || null;
    const mudouCur = await quando(RAIZ, ['curadoria-dados.js']);
    somar({
      id: 'curadoria', pagina: 'curadoria', nome: 'Curadoria', href: 'curadoria.html',
      desc: 'Escolhas assinadas e datadas, com quem escolheu, como e com que fontes.',
      contas: [[posts.length, 'curadoria', 'curadorias'], [posts.reduce((n, p) => n + (p.partes || []).length, 0), 'assunto', 'assuntos']],
      partes: posts.map((p) => p.titulo),
      mudou: maisNova(mudouCur, pastaCur ? await quando(COFRE, [pastaCur]) : null), fonte: 'curadoria-dados.js e a pasta da Curadoria no caderno',
    }, lst);
    const area = {}; (w.CURADORIA.areas || []).forEach((a) => { area[a[0]] = a[1]; });
    const termos = [];
    for (const p of posts) for (const t of p.glossario || []) termos.push(item('glossario', t.termo, `${t.original ? t.original + ' · ' : ''}${t.quando || ''}`, 'curadoria.html?p=' + encodeURIComponent(p.slug) + '#g-' + t.id, `${area[t.area] || ''} ${t.sente || ''} ${curto(t.texto, 220)}`));
    if (termos.length) {
      somar({
        id: 'glossario', pagina: 'curadoria', nome: 'O glossário', href: 'curadoria.html#glossario',
        desc: 'As palavras que expandem, aproximam e conectam: cada uma com a origem, o ano e o que se sente.',
        contas: [[termos.length, 'palavra', 'palavras'], [Object.keys(area).length, 'área', 'áreas']],
        partes: Object.values(area),
        mudou: mudouCur, fonte: 'curadoria-dados.js',
      }, termos);
    }
  }

  /* 11. os Guias: os livros e os caminhos */
  if (w.GUIAS) {
    const lst = [];
    for (const g of w.GUIAS.livros || []) for (const l of g.livros || []) lst.push(item('guias', l[1], `${l[0]}${l[2] ? ' · ' + ano(l[2]) : ''}`, 'guias.html#livros', `${l[3] || ''} ${g.nome}`));
    for (const c of w.GUIAS.caminhos || []) lst.push(item('guias', c[2], c[3], c[0], ''));
    somar({
      id: 'guias', pagina: 'guias', nome: 'Guias', href: 'guias.html',
      desc: 'Ler o mundo a cada instante: as fontes de notícia, os livros para entender agora e os caminhos.',
      contas: [[(w.GUIAS.livros || []).reduce((n, g) => n + (g.livros || []).length, 0), 'livro', 'livros'], [(w.GUIAS.fontes || []).length, 'fonte de notícia', 'fontes de notícia'], [(w.GUIAS.caminhos || []).length, 'caminho', 'caminhos']],
      partes: (w.GUIAS.livros || []).map((g) => g.nome),
      mudou: await quando(RAIZ, ['guias-dados.js']), fonte: 'guias-dados.js',
    }, lst);
  }

  /* 12. o Atlas: as oito vistas (elas mesmas estão nas páginas) */
  {
    const vistas = ((M && M.PORTAS.atlas.paginas[0][4]) || []).map((s) => s[1]);
    somar({
      id: 'atlas', pagina: 'atlas', nome: 'O Atlas', href: 'atlas.html',
      desc: 'Onde estamos: a Terra, o tempo, a vida, as energias, a luz, o saber, o planeta e os números, numa página só.',
      contas: [[vistas.length, 'vista', 'vistas']], partes: vistas,
      mudou: await quando(RAIZ, ['atlas.js', 'terra-dados.js', 'dados-terra.js', 'vida-dados.js', 'energias-dados.js', 'iluminacao-dados.js', 'planeta-dados.js', 'humanidade-dados.js', 'revolucoes-dados.js', 'ceu-dados.js']),
      fonte: 'os dados de cada vista: terra, vida, energias, luz, planeta, humanidade e céu',
    });
  }

  /* 13. a Galeria de design: as referências */
  if (w.GALERIA) {
    const refs = w.GALERIA.referencias || [];
    somar({
      id: 'galeria', pagina: 'galeria', nome: 'Galeria de design', href: 'galeria.html',
      desc: 'As opções para experimentar, as propostas e as referências atemporais e futuristas do desenho do Portal.',
      contas: [[refs.length, 'referência', 'referências'], [(w.GALERIA.propostas || []).length, 'proposta', 'propostas'], [(w.GALERIA.opcoes || []).length, 'opção', 'opções']],
      partes: distintos(refs.map((r) => (r.grupo === 'atemporal' ? 'as atemporais' : r.grupo === 'futurista' ? 'as futuristas' : r.grupo))),
      mudou: await quando(RAIZ, ['galeria-dados.js']), fonte: 'galeria-dados.js',
    }, refs.map((r) => item('galeria', r.nome, `${r.ano} · ${r.quem}`, 'galeria.html#referencias', r.porque)));
  }

  /* 14. o Domínio: o Checklist da prova (só no computador) */
  if (!publico && estado && Array.isArray(estado.checklist)) {
    const ck = estado.checklist, lst = [];
    for (const s of ck) for (const i of s.itens || []) lst.push(item('dominio', i.texto, `${s.nome}${i.feito ? ' · feito' : ''}`, 'domino.html#m-' + slug(s.nome), ''));
    somar({
      id: 'dominio', pagina: 'domino', nome: 'Domínio', href: 'domino.html', casa: true,
      desc: 'O que já sei: as matérias da prova, item por item do Checklist, com as cartas de revisão.',
      contas: [[ck.length, 'matéria', 'matérias'], [lst.length, 'item', 'itens'], [ck.reduce((n, s) => n + (s.feitos || 0), 0), 'feito', 'feitos']],
      partes: ck.map((s) => s.nome),
      mudou: await quando(COFRE, [CAMINHOS.checklist]), fonte: 'o caderno: o Checklist e as Cartas',
    }, lst);
  }

  /* 15. as edições do Início (PS-91): o progresso da casa */
  if (w.INICIO_EDICOES && w.INICIO_EDICOES.partes) {
    const P = w.INICIO_EDICOES.partes, nomes = {};
    (E.PARTES || []).forEach((p) => { nomes[p[0]] = p[1]; });
    let total = 0, ultima = null;
    const dias = new Set(), partes = [];
    for (const [id, lista] of Object.entries(P)) {
      if (publico && id === 'seu-dia') continue;
      let antes = null, n = 0;
      for (const ed of lista || []) {
        const l = JSON.stringify(publico ? ed.l : ed.lc || ed.l);
        if (l === antes) continue;
        antes = l; n += 1;
        dias.add(String(ed.d).slice(0, 10));
        if (!ultima || ed.d > ultima) ultima = ed.d;
      }
      if (n) { total += n; partes.push(nomes[id] || id); }
    }
    somar({
      id: 'edicoes', pagina: 'inicio', nome: 'As edições do Início', href: 'inicio.html',
      desc: 'Cada parte da casa de entrada como ela estava em cada dia: o que entrou, o que saiu, o progresso.',
      contas: [[total, 'edição', 'edições'], [partes.length, 'parte', 'partes'], [dias.size, 'dia', 'dias']],
      partes, mudou: ultima ? new Date(ultima).toISOString() : null,
      fonte: 'o git do jadesun e do caderno, guardado pelo guardar-edicoes.mjs a cada exportação',
    });
  }

  /* 16. as páginas: o mapa do Portal (o Índice do Quadrado) */
  if (M) {
    const base = (x) => x.id.split('#')[0];
    const todas = M.todas().filter((x) => !publico || ((!permitidas || permitidas.includes(base(x))) && x.publico));
    const portas = distintos(M.MUNDO.concat(M.VOCE).filter((p) => todas.some((x) => x.porta === p)).map((p) => M.PORTAS[p].nome));
    somar({
      id: 'paginas', pagina: 'inicio', nome: 'As páginas', href: 'inicio.html', indice: true,
      desc: 'O mapa do Portal: cada porta, cada página e as seções de dentro (o mesmo do Índice, a tecla M).',
      contas: [[todas.filter((x) => !x.secao).length, 'página', 'páginas'], [todas.filter((x) => x.secao).length, 'seção', 'seções'], [portas.length, 'porta', 'portas']],
      partes: portas,
      mudou: await quando(RAIZ, ['mapa-dados.js']), fonte: 'mapa-dados.js: a fonte única da navegação',
    }, todas.map((x) => item('paginas', x.nome, `${x.portaNome} · ${x.desc || ''}`, x.href, '')));
  }

  /* no site, só os itens que levam a uma página que foi junto (um caminho dos Guias pode apontar o Domínio) */
  let saem = itens;
  if (publico && M) {
    const arquivos = new Set(['inicio.html']);
    M.todas().forEach((x) => { if (vale(x.id.split('#')[0])) arquivos.add(x.href.split(/[#?]/)[0]); });
    saem = itens.filter((x) => arquivos.has(String(x[3]).split(/[#?]/)[0]));
  }
  const r = { gerado: new Date().toISOString(), publico, volumes, itens: saem };
  if (!publico) { memo = r; memoEm = Date.now(); }
  return r;
}

export function esquecerIndices() { memo = null; memoEm = 0; }
