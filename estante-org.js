import { norm, mapaDeTags, distribuir, contarTags, layoutInicial, listasConhecidas, livrosDaLista, posNaLista, parDe, chaveDe, limparNome, limparTag, limparLista } from './estante-modelo.js';

/* Painel "Organizar" (Andares · Tags · Listas) e a bandeja de seleção da Estante.
   Tudo aqui é clique: nada de convenção escondida (número na frente do nome, etc.).
   Quem desenha o 3D passa um `ctx` com o estado e alguns ganchos (ver estante3d.js). */

const H = { 'Content-Type': 'application/json', 'X-Perfil': '1' };

export function criarOrganizador(ctx) {
  const { estado, esc } = ctx;
  const p = ctx.painel;
  const o = { aba: 'andares', armada: null, foco: null, confirma: null, aviso: null };
  let fila = Promise.resolve();
  let avisoTimer = 0;

  const layout = () => estado.layout;
  const livros = () => ctx.livros();
  const ehVazio = () => !layout().andares.length;

  function dizer(texto, tipo) {
    o.aviso = texto ? { texto, tipo: tipo || 'ok' } : null;
    clearTimeout(avisoTimer);
    const el = p.querySelector('.eo-aviso');
    if (el) { el.textContent = texto || ''; el.className = 'eo-aviso ' + (tipo || 'ok'); el.hidden = !texto; }
    if (texto) avisoTimer = setTimeout(() => { o.aviso = null; const e2 = p.querySelector('.eo-aviso'); if (e2) e2.hidden = true; }, 5000);
  }

  function persistir() {
    const corpo = JSON.stringify({ andares: layout().andares, listas: layout().listas });
    fila = fila.then(async () => {
      const r = await fetch('/api/estante/layout', { method: 'POST', headers: H, body: corpo });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.erro || 'Não consegui salvar o desenho da estante.'); }
      layout().existe = true;
    }).catch((e) => dizer(e.message, 'erro'));
    return fila;
  }
  function mudou(msg) { ctx.refazer(); pintar(); persistir(); if (msg) dizer(msg); }

  async function lote(corpo) {
    try {
      const r = await fetch('/api/livros/lote', { method: 'POST', headers: H, body: JSON.stringify(corpo) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || 'Não consegui gravar.');
      return j;
    } catch (e) { dizer(e.message || 'Não consegui gravar agora.', 'erro'); return null; }
  }

  function todasTags() {
    const c = contarTags(livros());
    layout().andares.flat().forEach((v) => v.tags.forEach((t) => { if (!c.has(t)) c.set(t, 0); }));
    return c;
  }

  /* ---------- andares e vãos ---------- */
  function tirarDeTodos(tag) { layout().andares.forEach((vaos) => vaos.forEach((v) => { v.tags = v.tags.filter((t) => t !== tag); })); }
  function moverTag(tag, a, v) {
    const vao = layout().andares[a] && layout().andares[a][v];
    if (!vao) return;
    tirarDeTodos(tag);
    vao.tags.push(tag);
    o.armada = null;
    mudou('"' + tag + '" agora mora em "' + vao.nome + '".');
  }
  function tirarTag(tag) { tirarDeTodos(tag); o.armada = null; mudou('"' + tag + '" ficou sem lugar (os livros dela vão pra "sem lugar", a não ser que tenham outra tag com vão).'); }
  const vaoNovo = () => ({ nome: 'Novo vão', tags: [] });
  function andarNovo(noTopo) { if (noTopo) layout().andares.push([vaoNovo()]); else layout().andares.unshift([vaoNovo()]); mudou(noTopo ? 'Andar novo em cima.' : 'Andar novo embaixo (os outros subiram um).'); }
  function andarApagar(a) { layout().andares.splice(a, 1); mudou('Andar apagado. As tags que moravam nele voltaram pra "sem lugar".'); }
  function andarTrocar(a, b) {
    const A = layout().andares;
    if (b < 0 || b >= A.length) return;
    [A[a], A[b]] = [A[b], A[a]];
    o.foco = null;
    mudou('Andares trocados.');
  }
  function vaoNovoNoAndar(a) { layout().andares[a].push(vaoNovo()); mudou('Vão novo à direita, neste andar.'); }
  function vaoDividir(a, v) {
    const vaos = layout().andares[a], vao = vaos[v];
    const novo = vaoNovo();
    if (vao.tags.length >= 2) {
      const meio = Math.ceil(vao.tags.length / 2);
      novo.tags = vao.tags.slice(meio);
      vao.tags = vao.tags.slice(0, meio);
      novo.nome = novo.tags.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(' e ').slice(0, 40);
    }
    vaos.splice(v + 1, 0, novo);
    o.foco = { a, v: v + 1 };
    mudou(novo.tags.length ? 'Vão dividido: metade das tags foi pro vão novo, à direita.' : 'Vão dividido: o novo está à direita, vazio. Toque numa tag e depois nele.');
  }
  function vaoApagar(a, v) {
    const vaos = layout().andares[a];
    if (vaos.length === 1) return andarApagar(a);
    vaos.splice(v, 1);
    o.foco = null;
    mudou('Vão apagado. As tags dele voltaram pra "sem lugar".');
  }
  function vaoMover(a, v, d) {
    const vaos = layout().andares[a];
    const j = v + d;
    if (j < 0 || j >= vaos.length) return;
    [vaos[v], vaos[j]] = [vaos[j], vaos[v]];
    o.foco = { a, v: j };
    mudou();
  }
  async function vaoRenomear(a, v, nome) {
    const vao = layout().andares[a][v];
    nome = limparNome(nome) || 'Vão';
    if (nome === vao.nome) return;
    const antigo = vao.nome;
    vao.nome = nome;
    mudou();
    if (livros().some((l) => l.secaoReal === antigo)) { await lote({ acao: 'vao-renomear', de: antigo, para: nome }); await ctx.recarregar(); }
  }

  /* ---------- tags ---------- */
  async function tagRenomear(de, para) {
    para = limparTag(para);
    if (!para || para === de) return;
    if (!await lote({ acao: 'tag-renomear', de, para })) return;
    const jaLa = mapaDeTags(layout()).has(para);
    layout().andares.forEach((vaos) => vaos.forEach((vao) => {
      if (!vao.tags.includes(de)) return;
      vao.tags = jaLa ? vao.tags.filter((t) => t !== de) : vao.tags.map((t) => (t === de ? para : t));
    }));
    if (estado.tags.has(de)) { estado.tags.delete(de); estado.tags.add(para); }
    await persistir();
    await ctx.recarregar();
    pintar();
    dizer(jaLa ? '"' + de + '" foi juntada em "' + para + '".' : '"' + de + '" agora se chama "' + para + '" em todos os livros.');
  }
  async function tagApagar(tag) {
    if (!await lote({ acao: 'tag-apagar', de: tag })) return;
    tirarDeTodos(tag);
    estado.tags.delete(tag);
    await persistir();
    await ctx.recarregar();
    pintar();
    dizer('Tag "' + tag + '" tirada de todos os livros.');
  }

  /* ---------- listas de leitura ---------- */
  function garantirLista(nome) { if (!layout().listas.some((x) => x.nome === nome)) layout().listas.push({ nome, desc: '' }); }
  function listaNova(nome) {
    nome = limparLista(nome);
    if (!nome) return dizer('Escreva um nome pra lista.', 'erro');
    if (listasConhecidas(livros(), layout().listas).some((x) => norm(x.nome) === norm(nome))) return dizer('Já existe uma lista com esse nome.', 'erro');
    layout().listas.push({ nome, desc: '' });
    persistir(); pintar(); dizer('Lista "' + nome + '" criada. Agora acrescente livros a ela aqui embaixo, ou pela bandeja "Selecionar".');
  }
  async function listaRenomear(de, para) {
    para = limparLista(para);
    if (!para || para === de) return;
    garantirLista(de);
    await lote({ acao: 'lista-renomear', de, para });
    const A = layout().listas;
    const jaTem = A.some((x) => x.nome === para);
    layout().listas = jaTem ? A.filter((x) => x.nome !== de) : A.map((x) => (x.nome === de ? { ...x, nome: para } : x));
    if (estado.listaFiltro === de) estado.listaFiltro = para;
    await persistir(); await ctx.recarregar(); pintar();
  }
  function listaDesc(nome, desc) {
    garantirLista(nome);
    layout().listas.find((x) => x.nome === nome).desc = limparNome(desc, 240);
    persistir();
  }
  async function listaApagar(nome) {
    await lote({ acao: 'lista-apagar', lista: nome });
    layout().listas = layout().listas.filter((x) => x.nome !== nome);
    if (estado.listaFiltro === nome) estado.listaFiltro = null;
    await persistir(); await ctx.recarregar(); pintar();
    dizer('Lista "' + nome + '" apagada (os livros continuam na estante).');
  }
  async function listaAdd(nome, l) {
    garantirLista(nome);
    await persistir();
    if (await lote({ acao: 'lista+', itens: [parDe(l)], lista: nome })) { await ctx.recarregar(); pintar(); dizer('"' + l.titulo + '" entrou em "' + nome + '".'); }
  }
  async function listaTirar(nome, l) {
    if (await lote({ acao: 'lista-', itens: [parDe(l)], lista: nome })) { await ctx.recarregar(); pintar(); }
  }
  async function listaMover(nome, i, d) {
    const ordem = livrosDaLista(livros(), nome);
    const j = i + d;
    if (j < 0 || j >= ordem.length) return;
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
    if (await lote({ acao: 'lista-ordem', lista: nome, itens: ordem.map(parDe) })) { await ctx.recarregar(); pintar(); }
  }
  function achaLivroPorRotulo(txt) {
    const t = norm(txt);
    if (!t) return null;
    const exato = livros().find((l) => norm(l.titulo + ' — ' + l.autor) === t);
    if (exato) return exato;
    const cand = livros().filter((l) => norm(l.titulo) === t);
    return cand.length === 1 ? cand[0] : null;
  }

  /* ---------- desenho do painel ---------- */
  const chip = (t, n, extra) => '<span class="eo-tag' + (o.armada === t ? ' armada' : '') + '" draggable="true" data-tag="' + esc(t) + '"' + (extra || '') + '>' +
    '<button type="button" class="eo-tag-b" data-acao="armar" data-tag="' + esc(t) + '">' + esc(t) + (n != null ? ' <i>' + n + '</i>' : '') + '</button>';

  function htmlVazio() {
    return '<div class="eo-vazio"><p><b>Sua estante ainda não tem andares.</b></p>' +
      '<p class="eo-txt">Um <b>andar</b> é uma prateleira; cada andar se divide em <b>vãos</b> lado a lado. Cada <b>tag</b> mora em um vão, e os livros vão sozinhos pro vão da tag deles.</p>' +
      '<button type="button" class="eo-grande principal" data-acao="inicial">Montar uma estante inicial com as minhas tags</button>' +
      '<button type="button" class="eo-grande" data-acao="zero">Começar do zero (1 andar, 1 vão)</button></div>';
  }

  function htmlAndares() {
    if (ehVazio()) return htmlVazio();
    const lay = layout(), ls = livros();
    const { celulas, soltos } = distribuir(ls, lay, contarTags(ls));
    const mapa = mapaDeTags(lay), cont = contarTags(ls);
    const semLugar = [...cont.keys()].filter((t) => !mapa.has(t)).sort((x, y) => cont.get(y) - cont.get(x) || x.localeCompare(y, 'pt'));
    const conf = (chave, rotulo, acao, extra) => '<button type="button" class="eo-mini' + (o.confirma === chave ? ' perigo' : '') + '" data-acao="' + acao + '" ' + extra + '>' + (o.confirma === chave ? 'Confirmar?' : rotulo) + '</button>';

    let h = '<p class="eo-txt eo-ajuda">Cada tag mora em um vão. <b>Toque numa tag e depois no vão</b> onde ela vai ficar (ou arraste). O ✕ ao lado de uma tag, dentro do vão, tira ela de lá.</p>';
    h += '<div class="eo-fixo' + (o.armada ? ' tem-armada' : '') + '"><div class="eo-pool" data-pool="1"><p class="es-rot">Tags sem lugar (' + semLugar.length + ') — ' + soltos.length + ' livro' + (soltos.length === 1 ? '' : 's') + ' ' + (soltos.length === 1 ? 'está' : 'estão') + ' sem lugar</p><div class="eo-tags">' +
      (semLugar.length ? semLugar.map((t) => chip(t, cont.get(t)) + '</span>').join('') : '<span class="eo-txt">Todas as tags já têm um vão.</span>') + '</div></div>';
    if (o.armada) h += '<p class="eo-dica-armada">Agora toque no vão onde <b>' + esc(o.armada) + '</b> vai morar — ou em "sem lugar" pra soltá-la. <button type="button" class="eo-mini" data-acao="desarmar">cancelar</button></p>';
    h += '</div>';
    h += '<button type="button" class="eo-mais" data-acao="andar-topo">+ Novo andar em cima</button>';
    for (let a = lay.andares.length - 1; a >= 0; a--) {
      const vaos = lay.andares[a];
      h += '<section class="eo-andar"><header><b>Andar ' + (a + 1) + '</b><span class="eo-txt">' + (a === 0 ? 'o de baixo' : a === lay.andares.length - 1 ? 'o de cima' : '') + '</span><span class="eo-btns">' +
        '<button type="button" class="eo-mini" data-acao="andar-sobe" data-a="' + a + '" title="Subir este andar">▲</button>' +
        '<button type="button" class="eo-mini" data-acao="andar-desce" data-a="' + a + '" title="Descer este andar">▼</button>' +
        conf('andar:' + a, 'Apagar', 'andar-apaga', 'data-a="' + a + '"') + '</span></header><div class="eo-vaos">';
      vaos.forEach((vao, v) => {
        const gente = celulas.get(a + ':' + v) || [];
        const foco = o.foco && o.foco.a === a && o.foco.v === v;
        h += '<div class="eo-vao' + (foco ? ' foco' : '') + (o.armada ? ' pode' : '') + '" data-a="' + a + '" data-v="' + v + '">' +
          '<input class="eo-nome" value="' + esc(vao.nome) + '" data-acao="vao-nome" data-a="' + a + '" data-v="' + v + '" aria-label="Nome do vão">' +
          '<div class="eo-tags">' + (vao.tags.length ? vao.tags.map((t) => chip(t, cont.get(t) || 0) + '<button type="button" class="eo-tira" data-acao="tira" data-tag="' + esc(t) + '" title="Tirar do vão">✕</button></span>').join('') : '<span class="eo-txt">vazio — toque numa tag lá em cima</span>') + '</div>' +
          '<input class="eo-add" list="eo-dl-tags" placeholder="+ tag (digite)" data-acao="vao-tag" data-a="' + a + '" data-v="' + v + '" aria-label="Acrescentar tag">' +
          '<div class="eo-vpe"><span>' + gente.length + ' livro' + (gente.length === 1 ? '' : 's') + '</span>' +
          '<button type="button" class="eo-mini" data-acao="vao-esq" data-a="' + a + '" data-v="' + v + '" title="Mover pra esquerda">◀</button>' +
          '<button type="button" class="eo-mini" data-acao="vao-dir" data-a="' + a + '" data-v="' + v + '" title="Mover pra direita">▶</button>' +
          '<button type="button" class="eo-mini" data-acao="vao-divide" data-a="' + a + '" data-v="' + v + '" title="Dividir este vão em dois, lado a lado">Dividir</button>' +
          conf('vao:' + a + ':' + v, '✕', 'vao-apaga', 'data-a="' + a + '" data-v="' + v + '"') + '</div>' +
          (gente.length ? '<details class="eo-vlivros"' + (foco ? ' open' : '') + '><summary>ver os livros</summary>' + gente.map((l) => '<button type="button" class="eo-livro" data-acao="livro" data-k="' + esc(chaveDe(l)) + '">' + esc(l.titulo) + '</button>').join('') + '</details>' : '') +
          '</div>';
      });
      h += '</div><button type="button" class="eo-mais" data-acao="vao-novo" data-a="' + a + '">+ Dividir o andar: mais um vão à direita</button></section>';
    }
    h += '<button type="button" class="eo-mais" data-acao="andar-base">+ Novo andar embaixo</button>';
    h += '<datalist id="eo-dl-tags">' + [...todasTags().keys()].sort((x, y) => x.localeCompare(y, 'pt')).map((t) => '<option value="' + esc(t) + '">').join('') + '</datalist>';
    return h;
  }

  function htmlTags() {
    const c = todasTags();
    const mapa = mapaDeTags(layout());
    const nomes = [...c.keys()].sort((x, y) => x.localeCompare(y, 'pt'));
    let h = '<p class="eo-txt eo-ajuda">Renomear vale para <b>todos os livros</b> de uma vez. Escrever o nome de outra tag que já existe <b>junta as duas</b>. "Ver" mostra só os livros da tag.</p>';
    h += '<div class="eo-tabela">' + nomes.map((t) => {
      const onde = mapa.get(t);
      const vao = onde ? layout().andares[onde.a][onde.v] : null;
      return '<div class="eo-linha-tag"><input class="eo-nome-tag" value="' + esc(t) + '" data-acao="tag-nome" data-antigo="' + esc(t) + '" aria-label="Nome da tag">' +
        '<span class="eo-n">' + c.get(t) + '</span>' +
        '<span class="eo-onde">' + (vao ? 'andar ' + (onde.a + 1) + ' · ' + esc(vao.nome) : 'sem lugar') + '</span>' +
        '<button type="button" class="eo-mini" data-acao="tag-ver" data-tag="' + esc(t) + '">Ver</button>' +
        '<button type="button" class="eo-mini' + (o.confirma === 'tag:' + t ? ' perigo' : '') + '" data-acao="tag-apaga" data-tag="' + esc(t) + '">' + (o.confirma === 'tag:' + t ? 'Confirmar?' : 'Apagar') + '</button></div>';
    }).join('') + '</div>';
    return h;
  }

  function htmlListas() {
    const ls = livros();
    const listas = listasConhecidas(ls, layout().listas);
    let h = '<p class="eo-txt eo-ajuda">Uma <b>lista de leitura</b> é uma fila com nome: os livros que você quer ler, na ordem. Um livro pode estar em várias listas. Crie a lista, depois acrescente livros aqui embaixo (ou selecione livros na estante e use "+ lista").</p>';
    h += '<div class="eo-nova"><input id="eo-nova-lista" placeholder="Nome da lista, ex.: Gregos, Para este ano…" data-acao="lista-nova-in"><button type="button" class="eo-mini principal" data-acao="lista-nova">Criar lista</button></div>';
    if (!listas.length) h += '<p class="eo-txt">Nenhuma lista ainda.</p>';
    listas.forEach((lista) => {
      const itens = livrosDaLista(ls, lista.nome);
      const lidos = itens.filter((l) => l.status === 'lido').length;
      const pct = itens.length ? Math.round(lidos / itens.length * 100) : 0;
      h += '<section class="eo-lista"><header><input class="eo-nome-lista" value="' + esc(lista.nome) + '" data-acao="lista-nome" data-antigo="' + esc(lista.nome) + '" aria-label="Nome da lista">' +
        '<span class="eo-txt">' + lidos + ' de ' + itens.length + ' lidos</span></header>' +
        '<div class="es-progresso-barra"><i style="width:' + pct + '%"></i></div>' +
        '<input class="eo-desc" value="' + esc(lista.desc) + '" placeholder="Para que serve esta lista? (opcional)" data-acao="lista-desc" data-nome="' + esc(lista.nome) + '">' +
        '<div class="eo-btns-lista"><button type="button" class="eo-mini' + (estado.listaFiltro === lista.nome ? ' on' : '') + '" data-acao="lista-ver" data-nome="' + esc(lista.nome) + '">' + (estado.listaFiltro === lista.nome ? 'Vendo na estante ✓' : 'Ver na estante') + '</button>' +
        '<button type="button" class="eo-mini" data-acao="lista-sel" data-nome="' + esc(lista.nome) + '">Selecionar todos</button>' +
        '<button type="button" class="eo-mini' + (o.confirma === 'lista:' + lista.nome ? ' perigo' : '') + '" data-acao="lista-apaga" data-nome="' + esc(lista.nome) + '">' + (o.confirma === 'lista:' + lista.nome ? 'Confirmar?' : 'Apagar lista') + '</button></div>' +
        itens.map((l, i) => '<div class="eo-item"><span class="eo-pos">' + (i + 1) + '</span><button type="button" class="eo-livro" data-acao="livro" data-k="' + esc(chaveDe(l)) + '">' + esc(l.titulo) + '<em>' + esc(l.autor || '') + '</em></button>' +
          (l.status ? '<span class="eo-status s-' + esc(norm(l.status).replace(/\s+/g, '-')) + '">' + esc(l.status) + '</span>' : '') +
          '<button type="button" class="eo-mini" data-acao="lista-sobe" data-nome="' + esc(lista.nome) + '" data-i="' + i + '" title="Subir na fila">▲</button>' +
          '<button type="button" class="eo-mini" data-acao="lista-desce" data-nome="' + esc(lista.nome) + '" data-i="' + i + '" title="Descer na fila">▼</button>' +
          '<button type="button" class="eo-mini" data-acao="lista-tira" data-nome="' + esc(lista.nome) + '" data-k="' + esc(chaveDe(l)) + '" title="Tirar da lista">✕</button></div>').join('') +
        '<input class="eo-add eo-add-livro" list="eo-dl-livros" placeholder="+ acrescentar livro (digite o título)" data-acao="lista-add" data-nome="' + esc(lista.nome) + '" aria-label="Acrescentar livro à lista"></section>';
    });
    h += '<datalist id="eo-dl-livros">' + ls.map((l) => '<option value="' + esc(l.titulo + ' — ' + l.autor) + '">').join('') + '</datalist>';
    return h;
  }

  function pintar() {
    const rolagem = p.querySelector('.eo-corpo') ? p.querySelector('.eo-corpo').scrollTop : 0;
    const aba = (id, rot) => '<button type="button" data-aba="' + id + '" class="' + (o.aba === id ? 'on' : '') + '">' + rot + '</button>';
    p.innerHTML = '<button type="button" class="es-x" data-acao="fechar" aria-label="Fechar">×</button>' +
      '<h2>Organizar</h2>' +
      '<div class="eo-abas">' + aba('andares', 'Andares e vãos') + aba('tags', 'Tags') + aba('listas', 'Listas de leitura') + '</div>' +
      '<p class="eo-aviso ' + (o.aviso ? o.aviso.tipo : 'ok') + '"' + (o.aviso ? '' : ' hidden') + '>' + (o.aviso ? esc(o.aviso.texto) : '') + '</p>' +
      '<div class="eo-corpo">' + (o.aba === 'andares' ? htmlAndares() : o.aba === 'tags' ? htmlTags() : htmlListas()) + '</div>';
    const c = p.querySelector('.eo-corpo');
    if (c) c.scrollTop = rolagem;
  }

  /* ---------- eventos (um só ouvinte pro painel inteiro) ---------- */
  const numeros = (el) => ({ a: +el.dataset.a, v: +el.dataset.v });
  function acao(el) {
    const id = el.dataset.acao;
    const { a, v } = numeros(el);
    const chaveConf = { 'andar-apaga': 'andar:' + a, 'vao-apaga': 'vao:' + a + ':' + v, 'tag-apaga': 'tag:' + el.dataset.tag, 'lista-apaga': 'lista:' + el.dataset.nome }[id];
    if (chaveConf) {
      if (o.confirma !== chaveConf) { o.confirma = chaveConf; pintar(); setTimeout(() => { if (o.confirma === chaveConf) { o.confirma = null; pintar(); } }, 4000); return; }
      o.confirma = null;
    } else if (o.confirma) { o.confirma = null; }
    switch (id) {
      case 'fechar': return ctx.fechar();
      case 'inicial': { estado.layout = { ...layoutInicial(livros()), listas: layout().listas }; o.foco = null; return mudou('Estante inicial montada. Mexa à vontade: tudo aqui pode ser trocado.'); }
      case 'zero': { estado.layout = { andares: [[{ nome: 'Vão', tags: [] }]], listas: layout().listas }; return mudou('Um andar, um vão. Toque numa tag e depois no vão.'); }
      case 'armar': { o.armada = o.armada === el.dataset.tag ? null : el.dataset.tag; return pintar(); }
      case 'desarmar': { o.armada = null; return pintar(); }
      case 'tira': return tirarTag(el.dataset.tag);
      case 'andar-topo': return andarNovo(true);
      case 'andar-base': return andarNovo(false);
      case 'andar-sobe': return andarTrocar(a, a + 1);
      case 'andar-desce': return andarTrocar(a, a - 1);
      case 'andar-apaga': return andarApagar(a);
      case 'vao-novo': return vaoNovoNoAndar(a);
      case 'vao-divide': return vaoDividir(a, v);
      case 'vao-apaga': return vaoApagar(a, v);
      case 'vao-esq': return vaoMover(a, v, -1);
      case 'vao-dir': return vaoMover(a, v, 1);
      case 'livro': { const l = livros().find((x) => chaveDe(x) === el.dataset.k); if (l) ctx.segurar(l); return; }
      case 'tag-ver': return ctx.filtrarPorTag(el.dataset.tag);
      case 'tag-apaga': return tagApagar(el.dataset.tag);
      case 'lista-nova': { const inp = p.querySelector('#eo-nova-lista'); return listaNova(inp ? inp.value : ''); }
      case 'lista-ver': return ctx.verLista(estado.listaFiltro === el.dataset.nome ? null : el.dataset.nome);
      case 'lista-sel': return ctx.selecionar(livrosDaLista(livros(), el.dataset.nome));
      case 'lista-apaga': return listaApagar(el.dataset.nome);
      case 'lista-sobe': return listaMover(el.dataset.nome, +el.dataset.i, -1);
      case 'lista-desce': return listaMover(el.dataset.nome, +el.dataset.i, 1);
      case 'lista-tira': { const l = livros().find((x) => chaveDe(x) === el.dataset.k); if (l) listaTirar(el.dataset.nome, l); return; }
      default:
    }
  }
  function mudouCampo(el) {
    const id = el.dataset.acao;
    const { a, v } = numeros(el);
    switch (id) {
      case 'vao-nome': return vaoRenomear(a, v, el.value);
      case 'vao-tag': { const t = limparTag(el.value); el.value = ''; if (t) moverTag(t, a, v); return; }
      case 'tag-nome': return tagRenomear(el.dataset.antigo, el.value);
      case 'lista-nome': return listaRenomear(el.dataset.antigo, el.value);
      case 'lista-desc': return listaDesc(el.dataset.nome, el.value);
      case 'lista-add': { const l = achaLivroPorRotulo(el.value); el.value = ''; if (!l) return dizer('Não achei esse livro. Escolha um da lista que aparece ao digitar.', 'erro'); return listaAdd(el.dataset.nome, l); }
      default:
    }
  }
  p.addEventListener('click', (ev) => {
    const ab = ev.target.closest('[data-aba]');
    if (ab) { o.aba = ab.dataset.aba; o.armada = null; o.confirma = null; return pintar(); }
    const el = ev.target.closest('[data-acao]');
    if (el && !el.matches('input,select')) return acao(el);
    if (el && el.dataset.acao === 'lista-nova-in') return;
    const cartao = ev.target.closest('.eo-vao');
    if (cartao && o.armada && !ev.target.closest('input,button,summary,select,details')) return moverTag(o.armada, +cartao.dataset.a, +cartao.dataset.v);
    const pool = ev.target.closest('.eo-pool');
    if (pool && o.armada && !ev.target.closest('button')) return tirarTag(o.armada);
  });
  p.addEventListener('change', (ev) => { const el = ev.target.closest('[data-acao]'); if (el && el.matches('input,select')) mudouCampo(el); });
  p.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && ev.target.id === 'eo-nova-lista') { ev.preventDefault(); listaNova(ev.target.value); }
  });
  let arrastada = null;
  p.addEventListener('dragstart', (ev) => {
    const c = ev.target.closest && ev.target.closest('.eo-tag');
    if (!c) return;
    arrastada = c.dataset.tag;
    try { ev.dataTransfer.setData('text/plain', arrastada); ev.dataTransfer.effectAllowed = 'move'; } catch (e) { /* alguns navegadores */ }
  });
  p.addEventListener('dragover', (ev) => {
    if (!arrastada) return;
    const alvo = ev.target.closest('.eo-vao, .eo-pool');
    if (!alvo) return;
    ev.preventDefault();
    p.querySelectorAll('.alvo').forEach((x) => x.classList.remove('alvo'));
    alvo.classList.add('alvo');
  });
  p.addEventListener('drop', (ev) => {
    if (!arrastada) return;
    const cartao = ev.target.closest('.eo-vao');
    const pool = ev.target.closest('.eo-pool');
    if (!cartao && !pool) return;
    ev.preventDefault();
    const tag = arrastada; arrastada = null;
    if (cartao) moverTag(tag, +cartao.dataset.a, +cartao.dataset.v); else tirarTag(tag);
  });
  p.addEventListener('dragend', () => { arrastada = null; p.querySelectorAll('.alvo').forEach((x) => x.classList.remove('alvo')); });

  return {
    abrir(aba, foco) { if (aba) o.aba = aba; o.foco = foco || null; o.armada = null; o.confirma = null; pintar(); p.classList.add('aberto'); if (foco) setTimeout(() => { const el = p.querySelector('.eo-vao.foco'); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 60); },
    fechar() { p.classList.remove('aberto'); o.foco = null; },
    aberto: () => p.classList.contains('aberto'),
    pintar,
    foco: () => o.foco,
    dizerAviso: (t) => dizer(t, 'erro'),
  };
}

/* ---------- bandeja de seleção: escolhe livros na estante e age em todos de uma vez ---------- */
export function criarBandeja(ctx) {
  const { estado, esc } = ctx;
  const el = ctx.bandeja;
  let modo = null, msg = null;

  const escolhidos = () => ctx.livros().filter((l) => estado.selecao.has(chaveDe(l)));

  function opcoesVao() {
    const o = ['<option value="">Escolha o vão…</option>'];
    estado.layout.andares.forEach((vaos, a) => vaos.forEach((v) => o.push('<option value="' + esc(v.nome) + '">Andar ' + (a + 1) + ' · ' + esc(v.nome) + '</option>')));
    o.push('<option value="__seguir__">Deixar seguir as tags (não forçar)</option>');
    return o.join('');
  }
  function segunda(sel) {
    if (!modo) return '';
    const todas = ctx.livros();
    const tagsDosEscolhidos = [...new Set(sel.flatMap((l) => l.tags))].sort((x, y) => x.localeCompare(y, 'pt'));
    const listas = ctx.listasNomes();
    const listasDosEscolhidos = listas.filter((n) => sel.some((l) => (l.listas || []).some((y) => y.nome === n)));
    const btn = (rot) => '<button type="button" class="principal" data-b="aplicar">' + rot + '</button>';
    if (modo === 'vao') return '<select id="eb-valor">' + opcoesVao() + '</select>' + btn('Levar pra lá');
    if (modo === 'tag+') return '<input id="eb-valor" list="eb-dl-tags" placeholder="nome da tag (existente ou nova)"><datalist id="eb-dl-tags">' + [...new Set(todas.flatMap((l) => l.tags))].sort().map((t) => '<option value="' + esc(t) + '">').join('') + '</datalist>' + btn('Pôr a tag');
    if (modo === 'tag-') return '<select id="eb-valor"><option value="">Qual tag tirar…</option>' + tagsDosEscolhidos.map((t) => '<option>' + esc(t) + '</option>').join('') + '</select>' + btn('Tirar a tag');
    if (modo === 'lista+') return '<input id="eb-valor" list="eb-dl-listas" placeholder="lista (existente ou nova)"><datalist id="eb-dl-listas">' + listas.map((n) => '<option value="' + esc(n) + '">').join('') + '</datalist>' + btn('Pôr na lista');
    if (modo === 'lista-') return '<select id="eb-valor"><option value="">De qual lista tirar…</option>' + listasDosEscolhidos.map((n) => '<option>' + esc(n) + '</option>').join('') + '</select>' + btn('Tirar da lista');
    return '';
  }

  function pintar() {
    const sel = escolhidos();
    el.hidden = !estado.selecionando;
    if (!estado.selecionando) return;
    const b = (id, rot, extra) => '<button type="button" data-b="' + id + '" class="' + (modo === id ? 'on' : '') + '"' + (sel.length || extra ? '' : ' disabled') + '>' + rot + '</button>';
    el.innerHTML = '<div class="eb-linha"><span class="eb-n"><b>' + sel.length + '</b> ' + (sel.length === 1 ? 'livro escolhido' : 'livros escolhidos') + '</span>' +
      b('vao', 'Levar pra um vão') + b('tag+', '+ tag') + b('tag-', '− tag') + b('lista+', '+ lista') + b('lista-', '− lista') +
      '<button type="button" data-b="todos">Todos os visíveis</button>' +
      '<button type="button" data-b="limpar"' + (sel.length ? '' : ' disabled') + '>Limpar</button>' +
      '<button type="button" data-b="fim" class="fim">Concluir</button></div>' +
      (sel.length ? '' : '<p class="eb-msg">Toque nos livros (ou no cartão de um vão) pra escolher. Eles ganham um brilho dourado.</p>') +
      (modo && sel.length ? '<div class="eb-linha eb-2">' + segunda(sel) + '</div>' : '') +
      (msg ? '<p class="eb-msg ' + msg.tipo + '">' + esc(msg.texto) + '</p>' : '');
  }

  async function aplicar() {
    const sel = escolhidos();
    const campo = el.querySelector('#eb-valor');
    let valor = campo ? campo.value.trim() : '';
    if (!sel.length || !valor) { msg = { texto: 'Escolha o valor primeiro.', tipo: 'erro' }; return pintar(); }
    let corpo;
    if (modo === 'vao') corpo = { acao: 'vao', itens: sel.map(parDe), valor: valor === '__seguir__' ? '' : valor };
    else if (modo === 'tag+') corpo = { acao: 'tag+', itens: sel.map(parDe), tag: limparTag(valor) };
    else if (modo === 'tag-') corpo = { acao: 'tag-', itens: sel.map(parDe), tag: valor };
    else if (modo === 'lista+') { valor = limparLista(valor); corpo = { acao: 'lista+', itens: sel.map(parDe), lista: valor }; }
    else corpo = { acao: 'lista-', itens: sel.map(parDe), lista: valor };
    msg = { texto: 'Gravando…', tipo: 'ok' }; pintar();
    const j = await ctx.lote(corpo);
    if (j) {
      if (modo === 'lista+') await ctx.garantirLista(valor);
      msg = { texto: j.alterados + ' livro(s) atualizados.', tipo: 'ok' };
      await ctx.recarregar();
    } else msg = { texto: 'Não consegui gravar.', tipo: 'erro' };
    modo = null;
    pintar();
  }

  el.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-b]');
    if (!b || b.disabled) return;
    const id = b.dataset.b;
    msg = null;
    if (id === 'aplicar') return aplicar();
    if (id === 'todos') { ctx.selecionar(ctx.visiveis()); return; }
    if (id === 'limpar') { estado.selecao.clear(); modo = null; ctx.aoMudarSelecao(); return; }
    if (id === 'fim') { modo = null; ctx.sairSelecao(); return; }
    modo = modo === id ? null : id;
    pintar();
  });

  return { pintar, resetar() { modo = null; msg = null; } };
}
