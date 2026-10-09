(function () {
  'use strict';

  var P = window.Perfil;
  var MD = window.MD;
  var E = window.Entradas;
  var esc = P.esc;
  var $ = function (id) { return document.getElementById(id); };
  var raiz = $('eu');
  var dados = null;
  var estadoVest = null;
  var mapaEstudosG = {};
  var mapaMapasG = {};
  var vivosDom = {};
  var abertos = {};
  var msgs = {};

  /* 08/out/2026 (item 72): de sete abas para cinco. O Domínio foi para o Hoje (organização);
     Feitos, Linha da vida e Obras viraram o Caminho; Números e Documentos viraram Arquivos.
     Os endereços antigos (#feitos, #docs, #numeros…) continuam abrindo a aba certa. */
  var ABAS = [['ficha', 'Ficha'], ['colecao', 'Coleção'], ['caminho', 'Caminho'], ['rede', 'Rede'], ['arquivos', 'Arquivos']];
  var ANTIGAS = { numeros: 'arquivos', docs: 'arquivos', seguranca: 'arquivos', feitos: 'caminho', vida: 'caminho', obras: 'caminho' };
  if (location.hash === '#domino') location.replace('domino.html');
  var F = window.Ficha;
  var vitrineDono = null, redeAtual = null, redeMsg = '';
  var ORDEM_OBRAS = ['manifestos', 'pesquisas', 'critica', 'filosofia', 'livro', 'poemas', 'music', 'roteiros', 'photography', 'design', 'architecture', 'painting'];
  var dadosObras = null;
  var CORES = ['lin', 'his', 'geo', 'qui', 'bio', 'mat', 'fis', 'fil', 'soc', 'ing'];
  var CATEGORIAS = ['obra', 'escrita', 'música', 'design', 'estudo', 'vida', 'superação'];
  var DOCS = [['capacidades', 'As provas do que sei fazer'], ['objetivos', 'Para onde vou'], ['estudos', 'Onde cada estudo mora'], ['cidade', 'A cidade que quero, a dois'], ['frases', 'Minhas frases (aparecem no Agora)']];

  var PREAMBULO = {
    feitos: '---\nformato: wiki\nvisibilidade: privado\n---\n\n# Feitos — o que já fiz\n\n> Cada feito começa com `## quando · título`.',
    vida: '---\nformato: wiki\nvisibilidade: privado\n---\n\n# Linha da minha vida\n\n> Cada fato começa com `## quando · título`.',
  };

  function cor(cat) {
    var h = 0;
    String(cat || 'geral').split('').forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) >>> 0; });
    return CORES[h % CORES.length];
  }

  function n(v) { return v == null ? '—' : Number(v).toLocaleString('pt-BR'); }

  function hojeChave() {
    var d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  function semWiki(t) {
    return String(t || '').replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, '$1');
  }

  function corpoMd(texto) {
    return MD.render(semWiki(String(texto || '').replace(/^---\n[\s\S]*?\n---\n?/, '')));
  }

  function api(rota, corpo) {
    return fetch(rota, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify(corpo) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.erro || 'Não foi possível gravar.'); return j; }); });
  }

  function recarregar() {
    return Promise.all([
      fetch('/api/perfil', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('servidor'); return r.json(); }),
      P.estado(true),
      P.estudos(),
      P.mapas(),
      fetch('/api/obras', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch('/api/vitrine?tudo=1', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
    ]).then(function (r) {
      dados = r[0];
      estadoVest = r[1];
      mapaEstudosG = r[2] || {};
      mapaMapasG = r[3] || {};
      if (r[4]) dadosObras = r[4];
      vitrineDono = r[5];
    });
  }

  function salvar(chave, texto) {
    var f = dados.arquivos[chave];
    return api('/api/perfil/salvar', { chave: chave, texto: texto, base: f.hash }).then(function (r) {
      f.hash = r.hash; f.texto = texto; f.existe = true; f.modificado = new Date().toISOString();
      return r;
    });
  }

  function abaDoHash() {
    var h = location.hash.replace(/^#/, '');
    if (ANTIGAS[h]) return ANTIGAS[h];
    return ABAS.some(function (a) { return a[0] === h; }) ? h : 'ficha';
  }

  function pintarAbas() {
    var atual = abaDoHash();
    var nav = document.querySelector('.eu-nav');
    if (nav) {
      nav.innerHTML = ABAS.map(function (a) { return '<a href="#' + a[0] + '"' + (a[0] === atual ? ' aria-current="page"' : '') + '>' + a[1] + '</a>'; }).join('');
    }
    raiz.querySelectorAll('.eu-aba').forEach(function (d) { d.hidden = d.getAttribute('data-aba') !== atual; });
  }

  function docsLista() {
    var lista = DOCS.slice();
    if (window.Colecao) {
      window.Colecao.arquivosDoCadernoDeColecao.forEach(function (k) {
        var f = dados.arquivos[k];
        if (f && f.existe && f.texto.trim()) lista.push([k, 'Coleção · ' + f.rel.split('/').pop()]);
      });
    }
    return lista;
  }

  /* ---------- NÚMEROS ---------- */
  function numeros() {
    var x = dados.numeros;
    var b = x.biblioteca || {};
    var maior = Math.max.apply(null, [1].concat(x.obras.map(function (o) { return o.palavras; })));
    var grandes = [
      [n(x.notas), 'notas no caderno'],
      [n(b.fichas), 'fichas na biblioteca'],
      [n(b.imagens), 'imagens guardadas'],
      [n(b.estudosSelecao), 'estudos da Seleção'],
      [n(x.cartas), 'cartas de revisão'],
      [n(x.palavrasTotal), 'palavras nas suas estantes'],
      [n(x.commits), 'registros de mudança (git)'],
    ];
    return '<section class="eu-sec" id="numeros"><header><h2 class="h2">Números do caderno</h2><span class="rot suave">medidos agora, não estimados</span></header>' +
      '<div class="numeros">' + grandes.map(function (g) { return '<div class="num-c"><b class="num">' + g[0] + '</b><span class="rot">' + g[1] + '</span></div>'; }).join('') + '</div>' +
      '<div class="cx nota-honesta"><p class="rot">Sobre os seis anos</p><p>O histórico versionado do caderno' + (x.primeiroCommit ? ' começa em <b>' + esc(x.primeiroCommit) + '</b>' : ' não pôde ser lido agora') + '. Os seis anos que vieram antes não estão em arquivos deste computador: estão em cadernos de papel, chats e versões antigas. O que você conta da sua história vale tanto quanto o que o git mostra, por isso a <a href="#vida">linha da vida</a> abaixo é sua para preencher.</p></div>' +
      '<div class="cx"><p class="rot">Estantes de escrita e música</p><ul class="estantes">' + x.obras.map(function (o) {
        return '<li class="' + cor(o.nome) + '"><span>' + esc(o.nome) + '</span><span class="mono">' + n(o.md) + ' arq · ' + n(o.palavras) + ' pal</span><div class="b"><i style="width:' + Math.max(2, Math.round(o.palavras / maior * 100)) + '%"></i></div></li>';
      }).join('') + '</ul></div></section>';
  }

  /* ---------- DOMÍNIO (o antigo domino.html, agora uma aba daqui — 22/set/2026) ---------- */
  function primeiroPendenteVest(e) {
    for (var s = 0; s < e.checklist.length; s++) {
      for (var i = 0; i < e.checklist[s].itens.length; i++) if (!e.checklist[s].itens[i].feito) return { s: s, i: i };
    }
    return null;
  }

  function destruirVivosDom() { Object.keys(vivosDom).forEach(function (k) { vivosDom[k].destruir(); }); vivosDom = {}; }

  function abrirItemDom(idAlvo) {
    var el = $(idAlvo);
    if (!el) return;
    abertos['dom-' + idAlvo] = true;
    el.querySelector('details').open = true;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function montarItemDom(id) {
    if (vivosDom[id] || !estadoVest) return;
    var caixa = $(id);
    var alvo = caixa && caixa.querySelector('.ce-mount');
    if (!alvo) return;
    var si = +alvo.getAttribute('data-s'), ii = +alvo.getAttribute('data-i');
    var s = estadoVest.checklist[si], it = s.itens[ii];
    var pro = -1;
    for (var k = 1; k < s.itens.length && pro < 0; k++) { var j = (ii + k) % s.itens.length; if (!s.itens[j].feito) pro = j; }
    vivosDom[id] = window.Cartao.montar(alvo, {
      secao: s.nome, item: it, cor: P.corDe(s.nome), contexto: 'domino', compacto: true, iSecao: si,
      irOutro: pro >= 0 ? function () { abrirItemDom('i' + si + '-' + pro); } : null,
      baralho: function () { window.Cartao.baralho(estadoVest, s.nome, function (_, alvoItem) { abrirItemDom('i' + si + '-' + s.itens.indexOf(alvoItem)); }); },
      dominar: function (feito) {
        return P.marcar(s.nome, it.texto, feito).then(function (novo) {
          estadoVest = novo;
          window.dispatchEvent(new CustomEvent('perfil:estado', { detail: novo }));
          desenhar();
        });
      },
    });
    var listaE = mapaEstudosG[s.nome + '|' + it.texto];
    if (listaE) vivosDom[id].estudos(listaE);
    var mapasE = mapaMapasG[s.nome];
    if (mapasE) vivosDom[id].mapas(mapasE);
  }

  function dominio() {
    if (!estadoVest) return '<section class="eu-sec" id="domino"><header><h2 class="h2">Domínio</h2></header><p class="rot suave">Carregando o Checklist…</p></section>';
    var e = estadoVest;
    var atualP = primeiroPendenteVest(e);
    var feitosT = 0, todosT = 0;
    e.checklist.forEach(function (s) { feitosT += s.feitos; todosT += s.total; });
    var mosaico = '<section class="mosaico entra" aria-label="Mosaico de itens">' + e.checklist.map(function (s, si) {
      return '<div class="m-linha ' + P.corDe(s.nome) + '"><div class="m-nome"><i></i>' + esc(s.nome) + '</div><div class="celulas">' +
        s.itens.map(function (it, ii) {
          var cls = 'cel' + (it.feito ? ' feito' : '') + (atualP && atualP.s === si && atualP.i === ii ? ' atual' : '');
          return '<button type="button" class="' + cls + '" data-a="dom-abrir" data-s="' + si + '" data-i="' + ii + '" title="' + esc(it.texto) + '" aria-label="' + esc(it.texto) + '"></button>';
        }).join('') + '</div><div class="m-conta">' + s.feitos + '/' + s.total + '</div></div>';
    }).join('') + '</section>';
    var listaHtml = e.checklist.map(function (s, si) {
      var ultimoGrupo = null, corpo = '';
      s.itens.forEach(function (it, ii) {
        if (it.grupo !== ultimoGrupo) { corpo += it.grupo ? '<div class="grupo-d">' + esc(it.grupo) + '</div>' : ''; ultimoGrupo = it.grupo; }
        var id = 'i' + si + '-' + ii;
        corpo += '<div class="item-d' + (it.feito ? ' feito' : '') + '" id="' + id + '" data-dom="' + id + '">' +
          '<button type="button" class="marca-i" data-a="dom-marcar" aria-pressed="' + it.feito + '" data-s="' + si + '" data-i="' + ii + '" aria-label="Marcar como dominado: ' + esc(it.texto) + '"></button>' +
          '<details' + (abertos['dom-' + id] ? ' open' : '') + '><summary>' + esc(it.texto) + (it.carta ? '<span class="tag">carta</span>' : '') + '</summary>' +
          '<div class="corpo ce-mount" data-s="' + si + '" data-i="' + ii + '"></div></details></div>';
      });
      return '<section class="secao-d ' + P.corDe(s.nome) + ' revela" id="s' + si + '"><header><h2 class="h2">' + esc(s.nome) + '</h2>' +
        '<span class="rot">' + (s.nota ? esc(s.nota) + ' · ' : '') + s.feitos + '/' + s.total + '</span>' +
        '<button type="button" class="ic bx-abre" data-a="dom-baralho" data-bx="' + si + '" aria-label="Ver o baralho de ' + esc(s.nome) + '" title="Ver o baralho">' + P.icone('baralho') + '</button></header>' + corpo + '</section>';
    }).join('');
    return '<section class="eu-sec" id="domino"><header><h2 class="h2">Domínio</h2><span class="rot suave">' + feitosT + ' / ' + todosT + ' dominados</span></header>' +
      '<p class="eu-sub">Cada quadrado é um item do seu Checklist. Marcar significa: <b>resolveria uma questão disto sem abrir o cursinho</b>. Clique num quadrado para abrir o item e estudar.</p>' +
      mosaico + '<div class="lista-d">' + listaHtml + '</div></section>';
  }

  /* ---------- OBRAS (o acervo pessoal: manifestos, pesquisas/ativismo, crítica, filosofia,
     livro, poemas, música, roteiros, design, pintura — lido de Logboard/# Profile/# Work) ---------- */
  function obraPeca(p) {
    return '<details class="obra-p"><summary><b>' + esc(p.titulo) + '</b><span>' + n(p.palavras) + ' pal</span></summary>' +
      '<div class="md">' + MD.render(semWiki(p.corpo)) + '</div></details>';
  }

  function obraCategoria(c) {
    var porProjeto = {}, ordem = [];
    c.pecas.forEach(function (p) {
      var k = p.projeto || '';
      if (!(k in porProjeto)) { porProjeto[k] = []; ordem.push(k); }
      porProjeto[k].push(p);
    });
    var corpo = ordem.map(function (k) {
      var lista = porProjeto[k].map(obraPeca).join('');
      return '<div class="obra-proj">' + (k ? '<p class="rot suave obra-proj-t">' + esc(k) + '</p>' : '') + lista + '</div>';
    }).join('');
    return '<section class="cx cor obra-cat ' + cor(c.nome) + '"><header><h3 class="h3">' + esc(c.nome) + '</h3>' +
      '<span class="rot suave">' + c.pecas.length + (c.pecas.length === 1 ? ' peça' : ' peças') + ' · ' + n(c.palavras) + ' pal</span></header>' + corpo + '</section>';
  }

  function obras() {
    if (!dadosObras) return '<section class="eu-sec" id="obras"><header><h2 class="h2">Obras</h2></header><p class="rot suave">Carregando o acervo…</p></section>';
    var cats = dadosObras.categorias.slice().sort(function (a, b) {
      var ia = ORDEM_OBRAS.indexOf(a.id), ib = ORDEM_OBRAS.indexOf(b.id);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    var totalPalavras = cats.reduce(function (s, c) { return s + c.palavras; }, 0);
    return '<section class="eu-sec" id="obras"><header><h2 class="h2">Obras</h2><span class="rot suave">' + dadosObras.pecas.length + ' peças · ' + n(totalPalavras) + ' palavras</span></header>' +
      '<p class="eu-sub">Manifestos, pesquisas (inclui ativismo), crítica, filosofia, o livro, poemas, música, roteiros, design e pintura — lido direto do que já está escrito e organizado em <span class="mono">Logboard/# Profile/# Work</span>, fiel ao original.</p>' +
      '<div class="obras-grade">' + cats.map(obraCategoria).join('') + '</div></section>';
  }

  /* ---------- ENTRADAS (feitos e vida) ---------- */
  function modeloDe(chave) {
    var f = dados.arquivos[chave];
    var m = E.ler(f.existe ? f.texto : PREAMBULO[chave]);
    if (!f.existe) m.entradas = [];
    return m;
  }

  function cartao(chave, item, indice, modo) {
    var futuro = modo === 'vida' && E.ano(item.quando).chave > hojeChave();
    return '<article class="fe-item ' + cor(item.categoria) + '" data-i="' + indice + '">' +
      '<div class="f-q rot">' + esc(item.quando || 'sem data') + (futuro ? ' <em>vem aí</em>' : '') + '</div>' +
      '<div class="f-c"><h3 class="h3">' + esc(item.titulo) + '</h3>' +
      '<p class="f-tags rot">' + (item.categoria ? '<span>' + esc(item.categoria) + '</span>' : '') + (item.visibilidade ? '<span>' + esc(item.visibilidade) + '</span>' : '') + '</p>' +
      (item.corpo ? '<div class="md">' + MD.render(semWiki(item.corpo)) + '</div>' : '') +
      '<p class="acoes f-a"><button type="button" class="opt" data-a="editar" data-c="' + chave + '" data-i="' + indice + '">Editar</button><button type="button" class="opt" data-a="excluir" data-c="' + chave + '" data-i="' + indice + '">Excluir</button></p></div></article>';
  }

  function secaoEntradas(chave, titulo, subt, modo) {
    var f = dados.arquivos[chave];
    var m = modeloDe(chave);
    var lista = m.entradas.map(function (e, i) { return { e: e, i: i }; });
    lista.sort(function (a, b) {
      var d = E.ano(a.e.quando).chave - E.ano(b.e.quando).chave;
      return modo === 'feitos' ? -d : d;
    });
    var cats = {};
    m.entradas.forEach(function (e) { if (e.categoria) cats[e.categoria] = (cats[e.categoria] || 0) + 1; });
    var filtro = abertos['filtro-' + chave] || '';
    var visiveis = lista.filter(function (x) { return !filtro || x.e.categoria === filtro; });
    return '<section class="eu-sec" id="' + (chave === 'feitos' ? 'feitos' : 'vida') + '"><header><h2 class="h2">' + titulo + '</h2><span class="rot suave">' + m.entradas.length + ' ' + (m.entradas.length === 1 ? 'registro' : 'registros') + '</span></header>' +
      '<p class="eu-sub">' + subt + '</p>' +
      '<div class="acoes eu-barra"><button type="button" class="botao sinal" data-a="novo" data-c="' + chave + '">Adicionar</button>' +
      Object.keys(cats).map(function (c) { return '<button type="button" class="chip' + (filtro === c ? ' on' : '') + '" data-a="filtro" data-c="' + chave + '" data-v="' + esc(c) + '">' + esc(c) + ' <small>' + cats[c] + '</small></button>'; }).join('') +
      (filtro ? '<button type="button" class="chip" data-a="filtro" data-c="' + chave + '" data-v="">limpar</button>' : '') + '</div>' +
      '<div id="form-' + chave + '"></div><p class="msg" id="msg-' + chave + '"' + (msgs[chave] ? '' : ' hidden') + '>' + (msgs[chave] || '') + '</p>' +
      '<div class="' + (modo === 'vida' ? 'vida-l' : 'feitos-l') + '">' + visiveis.map(function (x) { return cartao(chave, x.e, x.i, modo); }).join('') + '</div>' +
      '<p class="rot suave caminho-a">Arquivo: ' + esc(f.rel) + '</p></section>';
  }

  function formulario(chave, indice) {
    var m = modeloDe(chave);
    var e = indice == null ? { quando: '', titulo: '', categoria: '', visibilidade: 'privado', corpo: '' } : m.entradas[indice];
    var alvo = $('form-' + chave);
    alvo.innerHTML = '<form class="cx form-e" id="f-' + chave + '"><p class="rot">' + (indice == null ? 'Novo registro' : 'Editando') + '</p>' +
      '<div class="f-grade"><label>Quando<input type="text" name="quando" value="' + esc(e.quando) + '" placeholder="2026-09-21, 2020 ou ~2020"></label>' +
      '<label>Título<input type="text" name="titulo" value="' + esc(e.titulo) + '" required></label>' +
      '<label>Categoria<input type="text" name="categoria" list="cats" value="' + esc(e.categoria) + '"><datalist id="cats">' + CATEGORIAS.map(function (c) { return '<option value="' + c + '">'; }).join('') + '</datalist></label>' +
      '<label>Quem vê<select name="visibilidade">' + ['privado', 'rascunho', 'publico'].map(function (v) { return '<option' + (e.visibilidade === v || (!e.visibilidade && v === 'privado') ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select></label></div>' +
      '<label>Texto <small>(markdown: **negrito**, *itálico*, listas com -)</small><textarea name="corpo" rows="6">' + esc(e.corpo) + '</textarea></label>' +
      '<div class="acoes"><button class="botao sinal" type="submit">Gravar no caderno</button><button class="botao" type="button" data-a="cancelar" data-c="' + chave + '">Cancelar</button></div></form>';
    var f = $('f-' + chave);
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = f.elements;
      var novo = { quando: v.quando.value.trim(), titulo: v.titulo.value.trim(), categoria: v.categoria.value.trim(), visibilidade: v.visibilidade.value, corpo: v.corpo.value.replace(/\r\n?/g, '\n') };
      if (!novo.titulo) return;
      var mod = modeloDe(chave);
      if (indice == null) mod.entradas.push(novo); else mod.entradas[indice] = novo;
      gravar(chave, E.escrever(mod), indice == null ? 'Registro adicionado.' : 'Registro atualizado.');
    });
    f.elements.titulo.focus();
    alvo.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function gravar(chave, texto, ok) {
    var f = dados.arquivos[chave];
    return api('/api/perfil/salvar', { chave: chave, texto: texto, base: f.hash }).then(function (r) {
      msgs[chave] = esc(ok) + ' Gravado em <b>' + esc(f.titulo) + '.md</b>' + (r.backup ? '; a versão anterior ficou em <span class="mono">' + esc(r.backup) + '</span>.' : '.');
      return recarregar().then(desenhar).then(function () { return true; });
    }).catch(function (err) {
      msgs[chave] = '<b>Não gravei.</b> ' + esc(err.message);
      var m = $('msg-' + chave);
      if (m) { m.hidden = false; m.className = 'msg erro'; m.innerHTML = msgs[chave]; }
      return false;
    });
  }

  /* ---------- DOCUMENTOS ---------- */
  function documentos() {
    return '<section class="eu-sec" id="docs"><header><h2 class="h2">Documentos do perfil</h2><span class="rot suave">edite aqui ou no Obsidian: é o mesmo arquivo</span></header>' +
      docsLista().map(function (d) {
        var f = dados.arquivos[d[0]];
        var aberto = abertos['doc-' + d[0]];
        var editando = abertos['ed-' + d[0]];
        return '<details class="doc cx" data-c="' + d[0] + '"' + (aberto ? ' open' : '') + '><summary><b class="h3">' + esc(f.titulo) + '</b><span>' + esc(d[1]) + '</span>' + (f.existe ? '' : '<em class="rot">ainda não existe</em>') + '</summary>' +
          (editando
            ? '<label class="rot" for="ta-' + d[0] + '">Texto completo (inclui o cabeçalho ---)</label><textarea id="ta-' + d[0] + '" rows="18" class="mono">' + esc(f.existe ? f.texto : (d[0] === 'frases' ? 'Uma frase por linha, sem título.\n' : '')) + '</textarea>' +
              '<div class="acoes"><button class="botao sinal" type="button" data-a="doc-salvar" data-c="' + d[0] + '">Gravar no caderno</button><button class="botao" type="button" data-a="doc-cancelar" data-c="' + d[0] + '">Cancelar</button></div>'
            : (f.existe ? '<div class="md">' + corpoMd(f.texto) + '</div>' : '<p class="suave">Este arquivo ainda não existe. Clique em “Editar” para criá-lo.</p>') +
              '<div class="acoes"><button class="opt" type="button" data-a="doc-editar" data-c="' + d[0] + '">Editar</button><button class="opt" type="button" data-a="doc-desfazer" data-c="' + d[0] + '">Desfazer a última gravação</button></div>') +
          '<p class="msg" id="msg-' + d[0] + '"' + (msgs[d[0]] ? '' : ' hidden') + '>' + (msgs[d[0]] || '') + '</p>' +
          '<p class="rot suave caminho-a">' + esc(f.rel) + (f.modificado ? ' · alterado em ' + new Date(f.modificado).toLocaleString('pt-BR') : '') + '</p></details>';
      }).join('') + '</section>';
  }

  function seguranca() {
    return '<section class="eu-sec" id="seguranca"><header><h2 class="h2">Se eu mudar aqui, muda no arquivo?</h2><span class="rot suave">sim, e com rede de proteção</span></header>' +
      '<div class="seguro">' +
      '<div class="cx"><p class="rot">Sim</p><p>Cada botão “Gravar” reescreve o arquivo <span class="mono">.md</span> do caderno. Abra o mesmo arquivo no Obsidian e a mudança está lá. O que você escrever no Obsidian também aparece aqui ao recarregar a página.</p></div>' +
      '<div class="cx"><p class="rot">Cópia antes de gravar</p><p>Antes de cada gravação, a versão anterior é copiada para <span class="mono">jadesun/dados/perfil-backups/</span> com data e hora. O botão “Desfazer a última gravação” devolve essa cópia.</p></div>' +
      '<div class="cx"><p class="rot">Só os arquivos do perfil</p><p>O servidor só aceita gravar Feitos, Linha da vida, Capacidades, Objetivos, Estudos, Cidade a dois, Frases, a sua Ficha e os arquivos da Coleção (pasta d Recommendations, com Links e Pessoas). Nenhum outro arquivo do caderno é alterado por esta página, e pastas de senhas nunca são lidas.</p></div>' +
      '<div class="cx"><p class="rot">Sem sobrescrever por engano</p><p>Se o arquivo mudou no caderno depois que você abriu esta página, a gravação é recusada e pede que você recarregue. Nada é perdido em silêncio.</p></div>' +
      '</div></section>';
  }

  /* ---------- FICHA: a sua ficha de pessoa (Logboard/# Profile/Ficha.md) ---------- */
  function linha1(chave) {
    var f = dados.arquivos[chave];
    return f && f.existe ? (f.texto.replace(/^---\n[\s\S]*?\n---\n?/, '').split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l && !/^[#>]/.test(l); })[0] || '') : '';
  }
  function fichaAtual() {
    var f = dados.arquivos.ficha;
    if (f && f.existe) return F.ler(f.texto);
    /* rascunho: sugerido a partir do que você já escreveu, nada é gravado até "Criar" */
    var voz = estadoVest && estadoVest.frases && estadoVest.frases[0] ? estadoVest.frases[0].texto : '';
    return { nome: '', oficio: linha1('capacidades'), area: '', onde: '', frase: '', quemE: [linha1('capacidades'), linha1('estudos')].filter(Boolean).join('\n\n'), voz: voz, visibilidade: 'privado', rascunho: true };
  }
  function contagemPublica() {
    var v = vitrineDono || {};
    var pub = function (l) { return (l || []).filter(function (x) { return x.vis === 'publico'; }).length; };
    return { estante: pub(v.estante), caminho: pub(v.caminho), elos: pub(v.elos) };
  }
  function linkVitrine() { return location.origin + location.pathname.replace(/[^/]*$/, '') + 'vitrine.html'; }

  /* 09/out/2026 (item 74): criar a ficha em cinco passos curtos, com o cartão se montando ao lado.
     Os campos são os mesmos de antes (o "submit" de #fi-form continua igual); só a forma mudou. */
  var PASSOS_FICHA = [['quem', 'Quem é você'], ['frase', 'A sua frase'], ['voz', 'A sua voz'], ['texto', 'Quem é, por inteiro'], ['vis', 'Quem vê']];
  function fichaForm(d) {
    var campo = function (nome, rot, valor, ph, dica) { return '<label class="fi-m-campo">' + rot + (dica ? '<small>' + dica + '</small>' : '') + '<input type="text" name="' + nome + '" value="' + esc(valor || '') + '" placeholder="' + esc(ph) + '" autocomplete="off"></label>'; };
    var passo = abertos.fichaPasso || 0;
    var sugestoes = (estadoVest && estadoVest.frases ? estadoVest.frases.slice(0, 4) : []).map(function (f) { return '<button type="button" class="chip" data-a="fi-sugerir" data-campo="voz" data-texto="' + esc(f.texto) + '">' + esc(f.texto.length > 70 ? f.texto.slice(0, 69) + '…' : f.texto) + '</button>'; }).join('');
    var exemplosFrase = ['Faço a música que ainda não tinha sido escrita.', 'Organizo o conhecimento para que chegue a quem precisa.', 'Cuido de um jardim e de quem passa por ele.'];
    return '<form class="cx fi-mago" id="fi-form" data-passo="' + passo + '"><div class="fi-mago-grade"><div class="fi-mago-passos">' +
      '<p class="rot">' + (d.rascunho ? 'Criar a sua ficha' : 'Editar a ficha') + ' · grava em <span class="mono">Logboard/# Profile/Ficha.md</span></p>' +
      '<ol class="fi-mago-trilho">' + PASSOS_FICHA.map(function (x, i) { return '<li><button type="button" data-a="fi-ir" data-i="' + i + '"' + (i === passo ? ' aria-current="step"' : '') + '><span>' + (i + 1) + '</span>' + x[1] + '</button></li>'; }).join('') + '</ol>' +
      '<fieldset data-p="0"' + (passo === 0 ? '' : ' hidden') + '><legend>Quem é você</legend>' +
        campo('nome', 'Nome', d.nome, 'Como você quer ser chamado', 'como aparece no cartão') + campo('oficio', 'Ofício', d.oficio, 'compositor, estudante, jardineira…', 'o que você faz') +
        campo('area', 'Área', d.area, 'música, filosofia, design…', '') + campo('onde', 'Onde', d.onde, 'Campinas, Brasil', 'cidade, país') + '</fieldset>' +
      '<fieldset data-p="1"' + (passo === 1 ? '' : ' hidden') + '><legend>A sua frase</legend><p class="fi-m-dica">O que você faz existir que antes não existia, em uma frase. Ela vai no alto da ficha.</p>' +
        '<label class="fi-m-campo">Uma frase<input type="text" name="frase" value="' + esc(d.frase || '') + '" placeholder="Em uma frase." autocomplete="off"></label>' +
        '<div class="fi-m-sug"><span class="rot">exemplos</span>' + exemplosFrase.map(function (t) { return '<button type="button" class="chip" data-a="fi-sugerir" data-campo="frase" data-texto="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div></fieldset>' +
      '<fieldset data-p="2"' + (passo === 2 ? '' : ' hidden') + '><legend>A sua voz</legend><p class="fi-m-dica">Uma frase sua, nas suas palavras: é o que separa uma rede de pessoas de um catálogo. Ela vai na frente do cartão.</p>' +
        '<label class="fi-m-campo">A voz<textarea name="voz" rows="3">' + esc(d.voz || '') + '</textarea></label>' +
        (sugestoes ? '<div class="fi-m-sug"><span class="rot">das suas Frases</span>' + sugestoes + '</div>' : '') + '</fieldset>' +
      '<fieldset data-p="3"' + (passo === 3 ? '' : ' hidden') + '><legend>Quem é, por inteiro</legend><p class="fi-m-dica">Algumas linhas: o que você estuda, o que ama, o que está fazendo agora. O caminho, a obra e os elos entram sozinhos (vêm dos seus Feitos, Obras e Pessoas).</p>' +
        '<label class="fi-m-campo">Quem é<textarea name="quemE" rows="6">' + esc(d.quemE || '') + '</textarea></label></fieldset>' +
      '<fieldset data-p="4"' + (passo === 4 ? '' : ' hidden') + '><legend>Quem vê</legend>' +
        '<div class="fi-m-vis"><label class="fi-m-op"><input type="radio" name="visibilidade" value="privado"' + (d.visibilidade !== 'publico' ? ' checked' : '') + '><span><b>Só eu</b><small>A ficha fica no caderno. O link mostra só um aviso.</small></span></label>' +
        '<label class="fi-m-op"><input type="radio" name="visibilidade" value="publico"' + (d.visibilidade === 'publico' ? ' checked' : '') + '><span><b>Quem tiver o link</b><small>O cartão e o que estiver marcado como público. É o que você manda a um amigo, com o convite.</small></span></label></div></fieldset>' +
      '<div class="acoes fi-m-acoes"><button type="button" class="botao" data-a="fi-ant"' + (passo === 0 ? ' disabled' : '') + '>Anterior</button>' +
        (passo < PASSOS_FICHA.length - 1 ? '<button type="button" class="botao pri" data-a="fi-prox">Próximo</button>' : '<button class="botao pri" type="submit">' + (d.rascunho ? 'Criar a minha ficha' : 'Gravar a ficha') + '</button>') +
        '<button class="botao leve" type="button" data-a="ficha-cancelar">Cancelar</button></div></div>' +
      '<aside class="fi-mago-previa"><p class="rot">Assim fica o seu cartão</p><div class="fi-previa">' + (window.CartaoVisita ? window.CartaoVisita.html(d, { link: window.CartaoVisita.convite(linkVitrine()), dica: 'é este o cartão que o seu amigo recebe' }) : '') + '</div>' +
        '<p class="fi-m-dica">Gire o cartão: no verso, o QR do convite. Quem abre vê uma boas-vindas, quem convidou e como fazer a própria ficha.</p></aside></div></form>';
  }
  /* a prévia segue o que você escreve */
  function atualizarPrevia(form) {
    if (!form || !window.CartaoVisita) return;
    var v = form.elements, d = { nome: v.nome.value.trim(), oficio: v.oficio.value.trim(), onde: v.onde.value.trim(), frase: v.frase.value.trim(), voz: v.voz.value.trim() };
    var p = form.querySelector('.fi-previa'); if (!p) return;
    var virada = p.querySelector('.cv-carta.virada');
    p.innerHTML = window.CartaoVisita.html(d, { link: window.CartaoVisita.convite(linkVitrine()), dica: 'é este o cartão que o seu amigo recebe' });
    if (virada) p.querySelector('.cv-carta').classList.add('virada');
    window.CartaoVisita.ligar(p);
  }
  function irPassoFicha(i) {
    var form = document.getElementById('fi-form'); if (!form) return;
    i = Math.max(0, Math.min(PASSOS_FICHA.length - 1, i));
    if (i > 0 && !form.elements.nome.value.trim()) { form.elements.nome.focus(); msgs.ficha = 'Comece pelo nome: é o que aparece no cartão.'; return; }
    /* guarda o que foi escrito antes de redesenhar (o redesenho reconstrói o formulário) */
    rascunhoFicha = lerFormFicha(form);
    abertos.fichaPasso = i;
    desenhar();
    var novo = document.getElementById('fi-form');
    if (novo) { var campo = novo.querySelector('fieldset:not([hidden]) input, fieldset:not([hidden]) textarea'); if (campo) campo.focus({ preventScroll: true }); }
  }
  var rascunhoFicha = null;
  function lerFormFicha(form) {
    var v = form.elements, vis = form.querySelector('[name=visibilidade]:checked');
    return { nome: v.nome.value, oficio: v.oficio.value, area: v.area.value, onde: v.onde.value, frase: v.frase.value, quemE: v.quemE.value, voz: v.voz.value, visibilidade: vis ? vis.value : 'privado', rascunho: !(dados.arquivos.ficha && dados.arquivos.ficha.existe) };
  }

  function fichaAba() {
    if (!F) return '';
    var d = fichaAtual(), existe = !d.rascunho, publica = existe && d.visibilidade === 'publico', c = contagemPublica();
    var estado = !existe ? 'Você ainda não tem uma ficha. Ela é um arquivo seu: quem você é, a sua voz, e se ela é pública.'
      : publica ? 'Pública. Quem tiver o link vê a ficha e o que está marcado como público: ' + c.estante + (c.estante === 1 ? ' item' : ' itens') + ' da coleção, ' + c.caminho + (c.caminho === 1 ? ' feito' : ' feitos') + ', ' + c.elos + (c.elos === 1 ? ' elo' : ' elos') + '.'
      : 'Privada: só você vê. Para compartilhar, edite e escolha “Pública”.';
    var h = '<section class="eu-sec fi-aba" id="ficha">' +
      '<div class="fi-barra"><div><p class="rot">A sua ficha · ' + (publica ? '<span class="fi-pub">pública</span>' : existe ? 'privada' : 'ainda não criada') + '</p><p class="fi-estado">' + esc(estado) + '</p></div>' +
      '<div class="acoes"><button type="button" class="botao pri" data-a="ficha-editar">' + (existe ? 'Editar' : 'Criar a minha ficha') + '</button>' +
      (existe ? '<button type="button" class="botao" data-a="compartilhar" aria-expanded="' + !!abertos.compartilhar + '">Compartilhar</button><a class="botao leve" href="vitrine.html" target="_blank" rel="noopener">Ver como os outros veem ↗</a>' : '') + '</div></div>' +
      '<p class="msg" id="msg-ficha"' + (msgs.ficha ? '' : ' hidden') + '>' + (msgs.ficha || '') + '</p>';
    if (abertos.compartilhar && existe) {
      h += '<div class="cx fi-partilha"><div class="fi-partilha-grade"><div class="fi-partilha-cartao">' + (window.CartaoVisita ? window.CartaoVisita.html(vitrineDono || d, { link: window.CartaoVisita.convite(linkVitrine()) }) : '') + '</div><div>' +
        '<p class="rot">Mandar o seu cartão</p><h3 class="fi-partilha-t">Um convite, não um perfil</h3>' +
        '<p class="eu-sub">Quem abre o link vê o seu cartão, uma boas-vindas dizendo que foi você quem convidou, o que é o Portal Solar e o movimento, e um jeito de fazer a própria ficha ali mesmo.</p>' +
        (publica ? '' : '<p class="msg">A ficha está <b>privada</b>: o link mostra só um aviso. Edite e escolha “Quem tiver o link” para que ele mostre o cartão.</p>') +
        '<div class="acoes"><button type="button" class="botao pri" data-a="ficha-copiar">Copiar o convite</button><a class="botao" href="vitrine.html?convite=1" target="_blank" rel="noopener">Ver o que o amigo vê ↗</a><button type="button" class="botao" data-a="ficha-baixar">Baixar a ficha (.md)</button>' +
        (navigator.share ? '<button type="button" class="botao" data-a="ficha-partilhar">Enviar…</button>' : '') + '</div>' +
        '<p class="eu-sub">O <b>link</b> abre o cartão de quem alcança este Portal Solar (no celular, pelo modo celular; para o mundo, pelo site exportado). O <b>arquivo .md</b> viaja por qualquer caminho: mensagem, e-mail, pendrive. Quem recebe abre na aba Rede, ou no próprio Obsidian.</p>' +
        '</div></div></div>';
    }
    if (abertos.fichaEditar) h += fichaForm(rascunhoFicha || d);
    var v = vitrineDono ? Object.assign({}, vitrineDono, existe ? {} : { nome: '', frase: '', voz: d.voz, quemE: d.quemE, oficio: d.oficio }) : null;
    h += v ? F.html(v, { dono: true }) : '<p class="rot suave">Abrindo a ficha…</p>';
    return h + '</section>';
  }

  /* ---------- REDE DA VIDA (item 73): a sua carta, a sua mesa, receber cartas e quem já foi ----------
     Segue a nota "A Rede da Vida": fichas em vez de perfis, sem feed, sem curtidas, sem seguidores;
     os elos são nomes com um porquê; "uma rede da vida não separa quem está vivo de quem já foi". */
  var pessoasAtlas = null, encontro = 0, ordemEncontro = null;
  function elosLista() {
    var f = dados.arquivos['col-pessoas'];
    if (!f || !f.existe || !f.texto.trim()) return [];
    return E.ler(f.texto).entradas.map(function (e) { return { titulo: e.titulo, corpo: e.corpo || '', url: (e.extra || {}).url || '', vis: e.visibilidade || 'privado', quando: e.quando || '', categoria: e.categoria || '' }; });
  }
  function iniciais(nome) { return String(nome || '·').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p[0].toUpperCase(); }).join(''); }
  function cartaHtml(v, dono) {
    var semFicha = dono && !(dados.arquivos.ficha && dados.arquivos.ficha.existe);
    var nome = v.nome || (semFicha ? 'A sua carta' : 'Sem nome');
    return '<div class="rd-carta" tabindex="0" role="button" aria-label="Virar a carta"><div class="rd-carta-in">' +
      '<div class="rd-face rd-frente"><span class="rd-sol" aria-hidden="true"></span><span class="rd-marca">' + (window.Icones ? window.Icones.quadrado() : '') + 'Portal Solar</span>' +
      '<span class="rd-ini">' + (semFicha && window.Icones ? window.Icones.simbolo(false) : esc(iniciais(nome))) + '</span><b class="rd-nome">' + esc(nome) + '</b>' +
      '<span class="rd-oficio">' + esc([v.oficio, v.onde].filter(Boolean).join(' · ') || (semFicha ? 'nasce quando você cria a ficha' : '')) + '</span>' +
      (v.voz ? '<q class="rd-voz">' + esc(v.voz.split('\n')[0]) + '</q>' : '') + '<span class="rd-dica">toque para virar</span></div>' +
      '<div class="rd-face rd-verso"><div class="rd-qr" data-qr="' + esc(linkVitrine()) + '"></div><span class="rd-link">' + esc(linkVitrine().replace(/^https?:\/\//, '')) + '</span>' +
      '<span class="rd-verso-t">Uma ficha de pessoa · sem feed, sem curtidas, sem seguidores</span></div></div></div>';
  }
  function mesaHtml(elos) {
    if (!elos.length) return '<div class="rd-mesa vazia"><span></span><span></span><span></span><p>Os seus elos aparecem aqui, como cartas na mesa. Um elo nasce quando você recebe a carta de alguém, ou escolhe alguém do Atlas, e escreve por que essa pessoa importa.</p></div>';
    return '<div class="rd-mesa" style="--n:' + elos.length + '">' + elos.map(function (e, i) {
      return '<button type="button" class="rd-mini" data-a="rede-elo" data-i="' + i + '" style="--k:' + i + '"><span class="rd-mini-ini">' + esc(iniciais(e.titulo)) + '</span><b>' + esc(e.titulo) + '</b><span>' + esc((e.corpo || 'sem o porquê ainda').split('\n')[0]) + '</span></button>';
    }).join('') + '</div>';
  }
  function encontroHtml() {
    if (!pessoasAtlas) return '<div class="rd-baralho"><p class="rot suave">Embaralhando as pessoas do Atlas…</p></div>';
    if (!pessoasAtlas.length) return '';
    var p = pessoasAtlas[ordemEncontro[encontro % ordemEncontro.length]];
    var prox = [1, 2].map(function (k) { return pessoasAtlas[ordemEncontro[(encontro + k) % ordemEncontro.length]]; });
    return '<div class="rd-baralho">' + prox.reverse().map(function (x, k) { return '<div class="rd-atras" style="--k:' + (2 - k) + '"></div>'; }).join('') +
      '<article class="rd-pessoa" data-chave="' + esc(p[0]) + '">' + (p[5] ? '<img src="' + esc(p[5]) + '" alt="" loading="lazy">' : '<span class="rd-pessoa-ini">' + esc(iniciais(p[1])) + '</span>') +
      '<div class="rd-pessoa-t"><b>' + esc(p[1]) + '</b><p>' + esc(resumo(p[6])) + '</p></div></article></div>' +
      '<div class="rd-baralho-acoes"><button type="button" class="botao" data-a="encontro-ant" aria-label="Anterior">' + P.icone('voltar') + '</button>' +
      '<button type="button" class="botao" data-a="encontro-prox">' + P.icone('sortear') + 'Outra pessoa</button>' +
      '<a class="botao leve" href="biblioteca.html#f=' + encodeURI(p[0]) + '">Abrir a ficha</a>' +
      '<button type="button" class="botao pri" data-a="encontro-elo">' + P.icone('rede') + 'Fazer um elo</button></div>';
  }
  /* o resumo do índice vem cortado em ~150 caracteres: tira os parênteses e fecha com reticências se parou no meio */
  function resumo(t) {
    var r = String(t || '').replace(/\s*\([^)]*\)?\s*/g, ' ').replace(/\s+/g, ' ').trim();
    if (r.length > 170) r = r.slice(0, 170);
    return r && !/[.!?…]$/.test(r) ? r.replace(/[\s,;:–-]+$/, '') + '…' : r;
  }
  function carregarPessoas() {
    if (pessoasAtlas) return;
    fetch('/api/biblioteca').then(function (r) { return r.ok ? r.json() : null; }).then(function (ind) {
      pessoasAtlas = ((ind && ind.itens) || []).filter(function (it) { return it[2] === 'atlas/pessoas' && it[4] === 'pessoa'; });
      ordemEncontro = pessoasAtlas.map(function (_, i) { return i; });
      for (var k = ordemEncontro.length - 1; k > 0; k--) { var r = Math.floor(Math.random() * (k + 1)), t = ordemEncontro[k]; ordemEncontro[k] = ordemEncontro[r]; ordemEncontro[r] = t; }
      var cx = document.getElementById('rd-encontro'); if (cx) cx.innerHTML = encontroHtml();
    }).catch(function () { pessoasAtlas = []; });
  }
  function redeAba() {
    var elos = elosLista(), v = vitrineDono || {};
    setTimeout(carregarPessoas, 0);
    setTimeout(desenharQR, 0);
    return '<section class="eu-sec rede" id="rede">' +
      '<header class="rd-cab"><div><p class="rot">A Rede da Vida</p><h2 class="h2">Fichas em vez de perfis</h2></div>' +
      '<p class="rd-manifesto">“Sem feed, sem curtidas, sem seguidores: os elos são nomes com um porquê escrito. Uma rede da vida não separa quem está vivo de quem já foi.” <small>da sua nota <i>A Rede da Vida</i></small></p></header>' +
      '<div class="rd-grade">' +
      '<div class="rd-bloco rd-sua"><h3 class="rd-t">A sua carta</h3>' + cartaHtml(v, true) +
      '<div class="rd-acoes">' + (dados.arquivos.ficha && dados.arquivos.ficha.existe
        ? '<button type="button" class="botao pri" data-a="carta-png">' + P.icone('baixar') + 'Baixar a carta</button><button type="button" class="botao" data-a="ficha-copiar">' + P.icone('link') + 'Copiar o link</button><button type="button" class="botao leve" data-a="ficha-baixar">Arquivo .md</button>'
        : '<button type="button" class="botao pri" data-a="rede-criar">Criar a minha ficha</button>') + '</div></div>' +
      '<div class="rd-bloco rd-mesa-cx"><h3 class="rd-t">A sua mesa <small>' + elos.length + (elos.length === 1 ? ' elo' : ' elos') + '</small></h3>' + mesaHtml(elos) +
      '<h3 class="rd-t rd-t2">Receber uma carta</h3>' +
      '<form class="rede-abrir" id="rede-form"><input type="url" name="url" placeholder="Cole o link da ficha de alguém (https://…/vitrine.html)" aria-label="Link da ficha" required>' +
      '<button class="botao pri" type="submit">Abrir</button><label class="botao rede-arq">' + P.icone('baixar') + 'Arquivo .md<input type="file" accept=".md,text/markdown,text/plain" id="rede-arquivo" hidden></label></form>' +
      '<p class="msg" id="rede-msg"' + (redeMsg ? '' : ' hidden') + '>' + redeMsg + '</p>' +
      '<p class="msg" id="msg-col-pessoas"' + (msgs['col-pessoas'] && /Não gravei/.test(msgs['col-pessoas']) ? '' : ' hidden') + '>' + (msgs['col-pessoas'] || '') + '</p>' +
      '<div id="rede-res">' + (redeAtual ? redeResultado() : '') + '</div></div>' +
      '</div>' +
      '<div class="rd-bloco rd-encontro-cx"><header class="rd-enc-cab"><div><h3 class="rd-t">Quem já foi</h3><p>As pessoas do seu Atlas, uma carta de cada vez. Folheie (setas do teclado também) e faça um elo com quem conversa com você.</p></div></header><div id="rd-encontro">' + encontroHtml() + '</div></div>' +
      '</section>';
  }
  function desenharQR() {
    document.querySelectorAll('.rd-qr[data-qr]').forEach(function (el) {
      if (el.firstChild || !window.qrcode) return;
      try { var qr = window.qrcode(0, 'M'); qr.addData(el.getAttribute('data-qr')); qr.make(); el.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) {}
    });
  }
  function redeResultado() {
    var v = redeAtual;
    if (v.publica === false) return '<div class="cx"><p class="rot">Ficha privada</p><p>Essa pessoa tem um Portal Solar, mas a ficha dela ainda não é pública.</p></div>';
    var jaTem = elosLista().some(function (e) { return e.titulo === v.nome; });
    return '<div class="rede-ficha rd-chegou">' + F.html(v, {}) +
      '<div class="cx rede-guardar">' + (jaTem ? '<p class="rot">Já está na sua mesa</p>' :
        '<form id="rede-guardar-f"><label>Por que essa pessoa importa? <small>(um elo sem porquê é só uma lista)</small><textarea name="porque" rows="3" required></textarea></label>' +
        '<div class="acoes"><button class="botao pri" type="submit">Pôr na mesa</button><button class="botao" type="button" data-a="rede-fechar">Fechar</button></div></form>') +
      '<p class="rot suave">' + (v.endereco ? 'de ' + esc(v.endereco) : 'de um arquivo recebido') + '</p></div></div>';
  }
  /* a carta como imagem (744 × 1039, o 63 × 88 mm a 300 dpi), desenhada com as fontes da página */
  function cartaPNG() {
    var v = vitrineDono || {}, W = 744, H = 1039, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var c = cv.getContext('2d');
    var rr = function (x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
    var quebra = function (texto, x, y, larg, alt, max) { var pal = String(texto || '').split(/\s+/), linha = '', n = 0; for (var i = 0; i < pal.length; i++) { var t = linha ? linha + ' ' + pal[i] : pal[i]; if (c.measureText(t).width > larg && linha) { c.fillText(linha, x, y + n * alt); n++; linha = pal[i]; if (n >= max) return n; } else linha = t; } if (linha && n < max) { c.fillText(linha, x, y + n * alt); n++; } return n; };
    return document.fonts.ready.then(function () {
      rr(0, 0, W, H, 44); c.fillStyle = '#1B5A44'; c.fill();
      rr(18, 18, W - 36, H - 36, 32); c.strokeStyle = 'rgba(244,251,247,.22)'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#E9822A'; c.beginPath(); c.arc(W - 110, 120, 54, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(244,251,247,.9)'; c.fillRect(56, 66, 30, 30); c.font = '800 34px Gabarito, Futura, sans-serif'; c.fillText('Portal Solar', 100, 92);
      c.fillStyle = '#F4FBF7'; c.font = '800 86px Gabarito, Futura, sans-serif';
      var linhas = quebra(v.nome || 'Sem nome', 56, 330, W - 112, 88, 3);
      var y = 330 + linhas * 88 + 10;
      c.font = '600 32px Gabarito, Futura, sans-serif'; c.fillStyle = 'rgba(244,251,247,.78)';
      y += quebra([v.oficio, v.onde].filter(Boolean).join(' · '), 56, y, W - 112, 40, 2) * 40 + 30;
      if (v.voz) { c.font = 'italic 400 40px Newsreader, Georgia, serif'; c.fillStyle = '#F4FBF7'; quebra('“' + v.voz.split('\n')[0] + '”', 56, y, W - 112, 52, 4); }
      var qrEl = window.qrcode ? (function () { var q = window.qrcode(0, 'M'); q.addData(linkVitrine()); q.make(); return q; })() : null;
      if (qrEl) {
        var nmod = qrEl.getModuleCount(), tam = 210, cel = tam / nmod, qx = W - 56 - tam - 20, qy = H - 56 - tam - 20;
        rr(qx - 20, qy - 20, tam + 40, tam + 40, 20); c.fillStyle = '#F4FBF7'; c.fill(); c.fillStyle = '#14201B';
        for (var r = 0; r < nmod; r++) for (var k = 0; k < nmod; k++) if (qrEl.isDark(r, k)) c.fillRect(qx + k * cel, qy + r * cel, Math.ceil(cel), Math.ceil(cel));
      }
      c.font = '500 24px Gabarito, Futura, sans-serif'; c.fillStyle = 'rgba(244,251,247,.7)';
      quebra('uma ficha de pessoa · sem feed, sem curtidas, sem seguidores', 56, H - 150, 360, 32, 3);
      return new Promise(function (ok) { cv.toBlob(ok, 'image/png'); });
    });
  }

  function abrirRede(url) {
    redeMsg = 'Abrindo…'; redeAtual = null; desenhar();
    return fetch('/api/rede/ficha?url=' + encodeURIComponent(url)).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.erro || 'Não consegui abrir.'); return j; }); })
      .then(function (v) { redeAtual = v; redeMsg = ''; desenhar(); })
      .catch(function (e) { redeMsg = '<b>Não abri.</b> ' + esc(e.message); desenhar(); });
  }
  function guardarElo(porque, categoria) {
    var v = redeAtual, f = dados.arquivos['col-pessoas'];
    var m = E.ler(f && f.existe && f.texto.trim() ? f.texto : '---\nformato: wiki\nvisibilidade: privado\n---\n\n# Pessoas\n\n> Cada pessoa começa com `## quando · nome`. Os elos da Rede moram aqui, cada um com o seu porquê.');
    if (!(f && f.existe && f.texto.trim())) m.entradas = [];
    var hoje = new Date(); var iso = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
    var extra = {}; if (v.endereco && /^https?:/.test(v.endereco)) extra.url = v.endereco; if (v.oficio) extra.por = v.oficio;
    m.entradas.push({ quando: iso, titulo: v.nome || 'Sem nome', categoria: categoria || 'pessoas/Amigos', visibilidade: 'privado', extra: extra, corpo: porque.trim() });
    return gravar('col-pessoas', E.escrever(m), 'Elo guardado em Pessoas.md.').then(function (ok) { if (ok) { redeMsg = 'Na sua mesa, com o porquê.'; redeAtual = null; desenhar(); } });
  }

  /* ---------- DESENHO ---------- */
  function desenhar() {
    destruirVivosDom();
    var quando = $('eu-quando');
    if (quando) quando.textContent = P.dataExtenso();
    var avatar = $('eu-avatar');
    if (avatar && !avatar.innerHTML) avatar.innerHTML = P.icone('eu');
    var cap = dados.arquivos.capacidades.texto.replace(/^---\n[\s\S]*?\n---\n?/, '').split('\n').filter(function (l) { return l.trim(); })[0] || '';
    var est = dados.arquivos.estudos.texto.replace(/^---\n[\s\S]*?\n---\n?/, '').split('\n').filter(function (l) { return l.trim(); })[0] || '';
    var nomeEl = document.querySelector('.eu-nome');
    var fichaArq = dados.arquivos.ficha && dados.arquivos.ficha.existe && F ? F.ler(dados.arquivos.ficha.texto) : null;
    if (nomeEl) nomeEl.textContent = fichaArq && fichaArq.nome ? fichaArq.nome : 'Eu';
    if (avatar && fichaArq && fichaArq.nome) avatar.innerHTML = '<span class="eu-inicial">' + esc(fichaArq.nome.trim()[0].toUpperCase()) + '</span>';
    var diz = $('eu-diz');
    diz.innerHTML = [cap, est].filter(function (t) { return t && !/^#|^>/.test(t); }).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '';
    /* tira do caderno inteiro, sempre visível — não precisa abrir aba pra ver "quem eu sou" em números */
    var stats = $('eu-stats');
    if (stats) {
      var x = dados.numeros;
      var feitosT = 0, todosT = 0;
      if (estadoVest) estadoVest.checklist.forEach(function (s) { feitosT += s.feitos; todosT += s.total; });
      stats.innerHTML = (estadoVest ? '<span><b>' + feitosT + '</b> de ' + todosT + ' dominados <a href="hoje.html#hj-dominio" aria-label="Ver o domínio no Hoje">→</a></span>' : '') +
        '<span><b>' + n(x.notas) + '</b> notas</span><span><b>' + n(x.palavrasTotal) + '</b> palavras nas estantes</span><span><b>' + n((x.biblioteca || {}).estudosSelecao) + '</b> estudos na Seleção</span>';
    }
    /* as abas sem seção de mesmo nome levam o id no próprio invólucro (para o #caminho e o #arquivos funcionarem) */
    var aba = function (id, conteudo) { return '<div class="eu-aba" data-aba="' + id + '"' + (id === 'caminho' || id === 'arquivos' ? ' id="' + id + '"' : '') + '>' + conteudo + '</div>'; };
    raiz.innerHTML = aba('ficha', fichaAba()) +
      aba('colecao', window.Colecao ? window.Colecao.html() : '') +
      aba('caminho', '<p class="eu-sub eu-intro">O que você fez, a sua vida em ordem e o que já escreveu. Cada registro pode ser público (entra na ficha compartilhada) ou só seu.</p>' +
        secaoEntradas('feitos', 'Feitos', 'O que você já fez, do jeito que você conta. Os mais recentes primeiro.', 'feitos') +
        secaoEntradas('vida', 'Linha da minha vida', 'Fatos da sua vida em ordem, do começo até o que vem aí.', 'vida') + obras()) +
      aba('rede', redeAba()) +
      aba('arquivos', numeros() + documentos() + seguranca());
    pintarAbas();
    if (window.Colecao) window.Colecao.aposDesenho();
    raiz.querySelectorAll('#domino .item-d details[open]').forEach(function (d) { montarItemDom(d.parentElement.id); });
    if (window.CartaoVisita) window.CartaoVisita.ligar(raiz); /* os QR dos cartões (a prévia da ficha) */
  }

  function irParaAba(hash) {
    if (location.hash !== hash) history.pushState(null, '', hash);
    pintarAbas();
    if (window.Movimento) window.Movimento.topo(); else window.scrollTo(0, 0);
    window.scrollTo(0, 0); /* reforça: sem isto, o salto nativo do navegador pro #ancora às vezes vence a corrida com o Lenis e trava no meio da página */
  }

  /* qualquer link "#aba" dentro do miolo (a barra de abas, "→ dominados", "linha da vida"…)
     usa pushState em vez de deixar o navegador saltar pro id — é o salto nativo que deixa
     a página "no meio", sem a barra de cima, ao trocar de aba */
  document.querySelector('.miolo').addEventListener('click', function (ev) {
    var a = ev.target.closest('a[href^="#"]');
    if (!a) return;
    var hash = a.getAttribute('href');
    if (hash.length < 2 || !document.getElementById(hash.slice(1))) return;
    ev.preventDefault();
    irParaAba(hash);
  });

  window.addEventListener('hashchange', function () {
    pintarAbas();
    if (window.Movimento) window.Movimento.topo(); else window.scrollTo(0, 0);
  });
  window.addEventListener('popstate', function () { pintarAbas(); });

  if (window.Colecao) {
    window.Colecao.ligar(raiz, {
      arquivos: function () { return dados.arquivos; },
      salvar: salvar,
      redesenhar: function () { return recarregar().then(desenhar); },
    });
  }

  raiz.addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-a]');
    if (!b) return;
    var a = b.getAttribute('data-a');
    var c = b.getAttribute('data-c');
    var i = b.getAttribute('data-i');
    if (a === 'dom-abrir') return abrirItemDom('i' + b.getAttribute('data-s') + '-' + b.getAttribute('data-i'));
    if (a === 'dom-marcar') {
      var sD = estadoVest.checklist[+b.getAttribute('data-s')];
      var itD = sD.itens[+b.getAttribute('data-i')];
      b.disabled = true;
      return P.marcar(sD.nome, itD.texto, !itD.feito).then(function (novo) {
        estadoVest = novo;
        window.dispatchEvent(new CustomEvent('perfil:estado', { detail: novo }));
        desenhar();
      }).catch(function (erro) { b.disabled = false; alert(erro.message); });
    }
    if (a === 'dom-baralho') {
      var secD = estadoVest.checklist[+b.getAttribute('data-bx')];
      return window.Cartao.baralho(estadoVest, secD.nome, function (_, alvoItem) { abrirItemDom('i' + b.getAttribute('data-bx') + '-' + secD.itens.indexOf(alvoItem)); });
    }
    if (a === 'ficha-editar') { abertos.fichaEditar = !abertos.fichaEditar; abertos.fichaPasso = 0; rascunhoFicha = null; return desenhar(); }
    if (a === 'ficha-cancelar') { abertos.fichaEditar = false; abertos.fichaPasso = 0; rascunhoFicha = null; return desenhar(); }
    if (a === 'compartilhar') { abertos.compartilhar = !abertos.compartilhar; msgs.ficha = ''; return desenhar(); }
    if (a === 'fi-prox' || a === 'fi-ant' || a === 'fi-ir') { var fp = document.getElementById('fi-form'); var atual = fp ? +fp.dataset.passo : 0; return irPassoFicha(a === 'fi-ir' ? +b.dataset.i : atual + (a === 'fi-prox' ? 1 : -1)); }
    if (a === 'fi-sugerir') { var ff = document.getElementById('fi-form'); if (ff && ff.elements[b.dataset.campo]) { ff.elements[b.dataset.campo].value = b.dataset.texto; atualizarPrevia(ff); } return; }
    if (a === 'ficha-copiar') {
      var link = window.CartaoVisita ? window.CartaoVisita.convite(linkVitrine()) : linkVitrine();
      var feito = function () { msgs.ficha = 'Link copiado: <span class="mono">' + esc(link) + '</span>'; desenhar(); };
      return (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(feito).catch(function () { msgs.ficha = 'Copie este link: <span class="mono">' + esc(link) + '</span>'; desenhar(); });
    }
    if (a === 'ficha-baixar' || a === 'ficha-partilhar') {
      return fetch('/api/vitrine').then(function (r) { return r.json(); }).then(function (pub) {
        var base = pub && pub.publica ? pub : Object.assign({}, vitrineDono || {}, { estante: [], caminho: [], elos: [] });
        var texto = F.md(Object.assign({}, base, { endereco: linkVitrine() }));
        var nome = (base.nome || 'ficha').replace(/[\\/:*?"<>|]+/g, '').trim() + '.md';
        if (a === 'ficha-partilhar' && navigator.share) {
          var arq = typeof File !== 'undefined' ? new File([texto], nome, { type: 'text/markdown' }) : null;
          var dadosPartilha = arq && navigator.canShare && navigator.canShare({ files: [arq] }) ? { files: [arq], title: base.nome } : { title: base.nome, text: base.frase || base.nome, url: linkVitrine() };
          return navigator.share(dadosPartilha).catch(function () {});
        }
        var url = URL.createObjectURL(new Blob([texto], { type: 'text/markdown;charset=utf-8' }));
        var el = document.createElement('a'); el.href = url; el.download = nome; document.body.appendChild(el); el.click(); el.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
        msgs.ficha = 'Baixado: <b>' + esc(nome) + '</b>. ' + (pub && pub.publica ? 'Só o que é público foi junto.' : 'A ficha está privada: foram só o nome, a frase, quem é e a voz.'); desenhar();
      });
    }
    if (a === 'rede-reabrir') { var el2 = elosLista()[+i]; if (el2 && el2.url) return abrirRede(el2.url); return; }
    if (a === 'rede-criar') { abertos.fichaEditar = true; return irParaAba('#ficha'); }
    if (a === 'encontro-prox' || a === 'encontro-ant') {
      if (!pessoasAtlas || !pessoasAtlas.length) return;
      encontro = (encontro + (a === 'encontro-prox' ? 1 : -1) + pessoasAtlas.length) % pessoasAtlas.length;
      var cxE = document.getElementById('rd-encontro');
      cxE.classList.remove('vai', 'volta'); void cxE.offsetWidth; cxE.classList.add(a === 'encontro-prox' ? 'vai' : 'volta');
      cxE.innerHTML = encontroHtml(); return;
    }
    if (a === 'encontro-elo') {
      var pp = pessoasAtlas[ordemEncontro[encontro % ordemEncontro.length]];
      return P.folha({ titulo: esc(pp[1]), sub: 'Fazer um elo', html: '<form id="rd-elo-f" class="form-e"><p class="eu-sub">Um elo é um nome com um porquê. O que essa pessoa tem a ver com você?</p><label>Por que importa<textarea name="porque" rows="4" required></textarea></label><div class="acoes"><button class="botao pri" type="submit">Pôr na mesa</button></div></form>',
        aoAbrir: function (corpo, folhaApi) {
          corpo.querySelector('form').addEventListener('submit', function (ev) {
            ev.preventDefault();
            redeAtual = { nome: pp[1], oficio: '', endereco: location.origin + location.pathname.replace(/[^/]*$/, '') + 'biblioteca.html#f=' + encodeURI(pp[0]) };
            guardarElo(ev.target.elements.porque.value, 'pessoas/Mestres').then(function () { folhaApi.fechar(); });
          });
        } });
    }
    if (a === 'rede-elo') {
      var eE = elosLista()[+i]; if (!eE) return;
      return P.folha({ titulo: esc(eE.titulo), sub: 'Um elo da sua mesa' + (eE.quando ? ' · desde ' + esc(eE.quando) : ''),
        html: '<blockquote class="rd-f-porque">' + esc(eE.corpo || 'Sem o porquê ainda.') + '</blockquote>' + (eE.url ? '<p class="acoes"><a class="botao pri" href="' + esc(eE.url) + '"' + (/vitrine/.test(eE.url) ? ' data-a="rede-reabrir" data-i="' + i + '"' : '') + '>Abrir a ficha</a></p>' : '') +
          '<p class="eu-sub">Para mudar o porquê ou tirar o elo da mesa, vá em Coleção → Pessoas.</p>' });
    }
    if (a === 'carta-png') {
      return cartaPNG().then(function (blob) {
        var url = URL.createObjectURL(blob), el3 = document.createElement('a');
        el3.href = url; el3.download = 'carta-' + ((vitrineDono && vitrineDono.nome) || 'portal-solar').replace(/[\\/:*?"<>|]+/g, '').trim() + '.png';
        document.body.appendChild(el3); el3.click(); el3.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      });
    }
    if (a === 'rede-fechar') { redeAtual = null; return desenhar(); }
    if (a === 'novo') return formulario(c, null);
    if (a === 'editar') return formulario(c, +i);
    if (a === 'cancelar') { $('form-' + c).innerHTML = ''; return; }
    if (a === 'filtro') { abertos['filtro-' + c] = b.getAttribute('data-v'); return desenhar(); }
    if (a === 'excluir') {
      var m = modeloDe(c);
      var alvo = m.entradas[+i];
      if (!alvo || !window.confirm('Excluir “' + alvo.titulo + '”?\n\nA versão anterior do arquivo fica guardada em dados/perfil-backups.')) return;
      m.entradas.splice(+i, 1);
      return gravar(c, E.escrever(m), 'Registro excluído.');
    }
    if (a === 'doc-editar') { abertos['ed-' + c] = true; abertos['doc-' + c] = true; return desenhar(); }
    if (a === 'doc-cancelar') { abertos['ed-' + c] = false; return desenhar(); }
    if (a === 'doc-salvar') {
      var texto = $('ta-' + c).value.replace(/\r\n?/g, '\n');
      return gravar(c, texto, 'Texto atualizado.').then(function (ok) { if (ok) { abertos['ed-' + c] = false; desenhar(); } });
    }
    if (a === 'doc-desfazer') {
      if (!window.confirm('Voltar este arquivo para a versão de antes da última gravação?')) return;
      return api('/api/perfil/desfazer', { chave: c }).then(function (r) {
        msgs[c] = 'Restaurado: <span class="mono">' + esc(r.restaurado) + '</span>.';
        return recarregar().then(desenhar);
      }).catch(function (err) { msgs[c] = '<b>Não desfiz.</b> ' + esc(err.message); desenhar(); });
    }
  });

  /* a carta vira ao toque (e com Enter); o baralho anda com as setas */
  raiz.addEventListener('click', function (ev) { var c = ev.target.closest('.rd-carta'); if (c) c.classList.toggle('virada'); });
  raiz.addEventListener('keydown', function (ev) {
    var c = ev.target.closest && ev.target.closest('.rd-carta');
    if (c && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); c.classList.toggle('virada'); }
  });
  document.addEventListener('keydown', function (ev) {
    if (abaDoHash() !== 'rede' || /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '') || document.documentElement.classList.contains('com-folha')) return;
    var b = ev.key === 'ArrowRight' ? raiz.querySelector('[data-a="encontro-prox"]') : ev.key === 'ArrowLeft' ? raiz.querySelector('[data-a="encontro-ant"]') : null;
    if (b) { ev.preventDefault(); b.click(); }
  });

  raiz.addEventListener('submit', function (ev) {
    var f = ev.target;
    if (f.id === 'fi-form') {
      ev.preventDefault();
      var v = f.elements, d = { nome: v.nome.value.trim(), oficio: v.oficio.value.trim(), area: v.area.value.trim(), onde: v.onde.value.trim(), frase: v.frase.value.trim(), quemE: v.quemE.value.replace(/\r\n?/g, '\n').trim(), voz: v.voz.value.replace(/\r\n?/g, '\n').trim(), visibilidade: v.visibilidade.value };
      if (!d.nome) { v.nome.focus(); return; }
      return gravar('ficha', F.escrever(d), 'Ficha gravada. O seu cartão está pronto para mandar.').then(function (ok) { if (ok) { abertos.fichaEditar = false; abertos.fichaPasso = 0; rascunhoFicha = null; desenhar(); } });
    }
    if (f.id === 'rede-form') { ev.preventDefault(); return abrirRede(f.elements.url.value.trim()); }
    if (f.id === 'rede-guardar-f') { ev.preventDefault(); return guardarElo(f.elements.porque.value); }
  });
  /* a prévia do cartão segue o que se escreve; Enter num campo avança o passo (sem gravar no meio) */
  raiz.addEventListener('input', function (ev) { var f = ev.target.form; if (f && f.id === 'fi-form') atualizarPrevia(f); });
  raiz.addEventListener('keydown', function (ev) {
    var f = ev.target.form; if (!f || f.id !== 'fi-form' || ev.key !== 'Enter' || ev.target.tagName === 'TEXTAREA') return;
    if (+f.dataset.passo < PASSOS_FICHA.length - 1) { ev.preventDefault(); irPassoFicha(+f.dataset.passo + 1); }
  });
  raiz.addEventListener('change', function (ev) {
    if (ev.target.id !== 'rede-arquivo' || !ev.target.files[0]) return;
    var leitor = new FileReader();
    leitor.onload = function () {
      var x = F.ler(String(leitor.result || ''));
      if (!x.nome) { redeMsg = '<b>Esse arquivo não parece uma ficha.</b> Uma ficha começa com <span class="mono">formato: ficha</span> e tem um nome.'; return desenhar(); }
      redeAtual = { publica: true, nome: x.nome, oficio: x.oficio, area: x.area, onde: x.onde, frase: x.frase, quemE: x.quemE, voz: x.voz,
        estante: [], caminho: (x.secoes['O caminho'] || '').split('\n').filter(function (l) { return /^-\s/.test(l); }).map(function (l) { return { titulo: l.replace(/^-\s+/, '') }; }),
        obra: [], elos: (x.secoes['Os elos'] || '').split('\n').filter(function (l) { return /^-\s/.test(l); }).map(function (l) { var m = l.replace(/^-\s+/, '').match(/^\[\[(.+?)\]\]\s*(?:—\s*(.*))?$/); return m ? { titulo: m[1], corpo: m[2] || '' } : { titulo: l.replace(/^-\s+/, '') }; }),
        endereco: (x.secoes && x.endereco) || '' };
      redeMsg = ''; desenhar();
    };
    leitor.readAsText(ev.target.files[0]);
  });

  raiz.addEventListener('toggle', function (ev) {
    var d = ev.target;
    if (d.tagName !== 'DETAILS') return;
    if (d.dataset.c) { abertos['doc-' + d.dataset.c] = d.open; return; }
    if (d.parentElement && d.parentElement.dataset.dom) {
      abertos['dom-' + d.parentElement.dataset.dom] = d.open;
      if (d.open) montarItemDom(d.parentElement.id);
    }
  }, true);

  recarregar().then(desenhar).catch(function () {
    raiz.innerHTML = '<div class="cx"><p class="rot">Servidor desligado</p><p>Abra <b>hoje.bat</b> para ligar o perfil.</p></div>';
  });
})();
