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

  var ABAS = [['numeros', 'Perfil'], ['domino', 'Domínio'], ['obras', 'Obras'], ['feitos', 'Feitos'], ['vida', 'Linha da vida'], ['colecao', 'Coleção'], ['docs', 'Documentos']];
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
    ]).then(function (r) {
      dados = r[0];
      estadoVest = r[1];
      mapaEstudosG = r[2] || {};
      mapaMapasG = r[3] || {};
      if (r[4]) dadosObras = r[4];
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
    if (h === 'seguranca') return 'docs';
    return ABAS.some(function (a) { return a[0] === h; }) ? h : 'numeros';
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
      '<div class="cx"><p class="rot">Só os arquivos do perfil</p><p>O servidor só aceita gravar Feitos, Linha da vida, Capacidades, Objetivos, Estudos, Cidade a dois, Frases e os arquivos da Coleção (pasta d Recommendations). Nenhum outro arquivo do caderno é alterado por esta página, e pastas de senhas nunca são lidas.</p></div>' +
      '<div class="cx"><p class="rot">Sem sobrescrever por engano</p><p>Se o arquivo mudou no caderno depois que você abriu esta página, a gravação é recusada e pede que você recarregue. Nada é perdido em silêncio.</p></div>' +
      '</div></section>';
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
    var diz = $('eu-diz');
    diz.innerHTML = [cap, est].filter(function (t) { return t && !/^#|^>/.test(t); }).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '<p class="rot suave">as duas linhas acima são suas, escritas no topo dos arquivos Capacidades e Estudos</p>';
    /* tira do caderno inteiro, sempre visível — não precisa abrir aba pra ver "quem eu sou" em números */
    var stats = $('eu-stats');
    if (stats) {
      var x = dados.numeros;
      var feitosT = 0, todosT = 0;
      if (estadoVest) estadoVest.checklist.forEach(function (s) { feitosT += s.feitos; todosT += s.total; });
      stats.innerHTML = (estadoVest ? '<span><b>' + feitosT + '</b> de ' + todosT + ' dominados <a href="#domino">→</a></span>' : '') +
        '<span><b>' + n(x.notas) + '</b> notas</span><span><b>' + n(x.palavrasTotal) + '</b> palavras nas estantes</span><span><b>' + n((x.biblioteca || {}).estudosSelecao) + '</b> estudos na Seleção</span>';
    }
    var aba = function (id, conteudo) { return '<div class="eu-aba" data-aba="' + id + '">' + conteudo + '</div>'; };
    raiz.innerHTML = aba('numeros', numeros()) +
      aba('domino', dominio()) +
      aba('obras', obras()) +
      aba('feitos', secaoEntradas('feitos', 'Feitos', 'O que você já fez, do jeito que você conta. Os mais recentes primeiro.', 'feitos')) +
      aba('vida', secaoEntradas('vida', 'Linha da minha vida', 'Fatos da sua vida em ordem, do começo até o que vem aí.', 'vida')) +
      aba('colecao', window.Colecao ? window.Colecao.html() : '') +
      aba('docs', documentos() + seguranca());
    pintarAbas();
    if (window.Colecao) window.Colecao.aposDesenho();
    raiz.querySelectorAll('#domino .item-d details[open]').forEach(function (d) { montarItemDom(d.parentElement.id); });
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
