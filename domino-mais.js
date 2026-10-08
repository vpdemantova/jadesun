/* ============================================================
   DOMINO — os dois módulos extras de cada matéria (02/out/2026)
   ANTES dos itens: a Tábua da matéria (o mapa da área inteira:
   tabela periódica, países, espécies, nomes, conceitos, objetos).
   DEPOIS dos itens: as Grandes Obras (os livros que fundaram a área,
   cada um com o estudo completo, lido aqui mesmo).
   Os dados vêm de /api/tabuas-e-obras (lib/tabuas.mjs), que lê o caderno.
   domino.js deixa os lugares (.dmx-antes / .dmx-depois) e chama
   DominoMais.preencher(lista) depois de cada desenho.
   ============================================================ */
(function () {
  'use strict';

  var P = window.Perfil;
  var esc = P.esc;
  var MD = window.MD;
  var dados = null;
  var pedido = null;
  var fichas = {};
  var aberto = {};
  var aba = {};
  var livro = {};
  var ultimaLista = null;

  try { var salvo = JSON.parse(localStorage.getItem('jadesun-domino-mais') || '{}'); aba = salvo.aba || {}; } catch (e) { /* sem memória */ }
  function lembrar() { try { localStorage.setItem('jadesun-domino-mais', JSON.stringify({ aba: aba })); } catch (e) { /* sem espaço */ } }

  function carregar() {
    if (!pedido) {
      pedido = fetch('/api/tabuas-e-obras').then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { dados = d && d.materias ? d : { materias: {} }; return dados; })
        .catch(function () { dados = { materias: {} }; return dados; });
    }
    return pedido;
  }

  /* links do caderno (#f=id) levam para a Biblioteca */
  /* os endereços das outras páginas ficam num lugar só (DominoMais.rotas): quem remodelar as rotas troca aqui ou de fora */
  var rotas = {
    ficha: function (id) { return 'biblioteca.html#f=' + encodeURI(id); },
    area: function (m, alvo) { return 'area.html?m=' + encodeURIComponent(m) + (alvo ? '#' + alvo : ''); },
  };
  function paraBiblioteca(html) { return String(html).replace(/href="#f=([^"]*)"/g, function (m, id) { return 'href="' + esc(rotas.ficha(decodeURI(id))) + '"'; }); }
  function inl(t) { return paraBiblioteca(MD ? MD.inline(t || '') : esc(t || '')); }
  function bloco(t) { return paraBiblioteca(MD ? MD.render(t || '') : '<p>' + esc(t || '') + '</p>'); }
  function linkFicha(id, conteudo, cls) {
    return id ? '<a class="' + (cls || '') + '" href="' + esc(rotas.ficha(id)) + '">' + conteudo + '</a>' : '<span class="' + (cls || '') + '">' + conteudo + '</span>';
  }

  /* o título já está no topo do leitor: tira o '# Título' do começo do estudo */
  function semTitulo(corpo) { return String(corpo || '').replace(/^\s*#\s[^\n]*\n/, ''); }
  function maiuscula(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }

  /* artigo certo antes do nome da matéria: "da Química", "do Português"… */
  function daMateria(nome) { return (/^(Linguagens)$/.test(nome) ? 'das ' : 'da ') + nome; }

  /* ---------------- ANTES: a Tábua ---------------- */

  var ROTULO_CAT = {
    'metal alcalino': 'Metais alcalinos', 'metal alcalinoterroso': 'Alcalinoterrosos', 'metal de transição': 'Metais de transição',
    'metal pós-transição': 'Outros metais', 'semimetal': 'Semimetais', 'ametal': 'Ametais', 'halogênio': 'Halogênios',
    'gás nobre': 'Gases nobres', 'lantanídeo': 'Lantanídeos', 'actinídeo': 'Actinídeos', 'desconhecida': 'Propriedades ainda incertas',
  };
  function catClasse(c) { return 'k-' + (MD ? MD.slug(c || 'desconhecida') : 'x'); }

  function htmlPeriodica(g) {
    var cel = g.elementos.map(function (e) {
      var titulo = e.nome + ' · nº ' + e.z + (e.massa ? ' · massa ' + e.massa : '') + (e.categoria ? ' · ' + e.categoria : '');
      var linha = e.linha >= 8 ? e.linha + 1 : e.linha;
      return '<a class="dmx-el ' + catClasse(e.categoria) + '" style="grid-row:' + linha + ';grid-column:' + e.coluna + '" href="' + esc(rotas.ficha(e.id)) + '" title="' + esc(titulo) + '">' +
        '<small>' + e.z + '</small><b>' + esc(e.simbolo) + '</b><i>' + esc(e.nome) + '</i></a>';
    }).join('');
    cel += '<span class="dmx-el dmx-el-vao k-lantanideo" style="grid-row:6;grid-column:3">57–71</span>';
    cel += '<span class="dmx-el dmx-el-vao k-actinideo" style="grid-row:7;grid-column:3">89–103</span>';
    var cats = [];
    g.elementos.forEach(function (e) { if (e.categoria && cats.indexOf(e.categoria) < 0) cats.push(e.categoria); });
    var legenda = cats.map(function (c) { return '<span class="dmx-leg ' + catClasse(c) + '"><i></i>' + esc(ROTULO_CAT[c] || c) + '</span>'; }).join('');
    return '<p class="dmx-nota dmx-so-celular">Deslize a tabela para o lado para ver todas as colunas.</p>' +
      '<div class="dmx-pt-rolo" data-lenis-prevent><div class="dmx-pt" role="list" aria-label="Tábua periódica com ' + g.total + ' elementos">' + cel + '</div></div>' +
      '<div class="dmx-legenda">' + legenda + '</div>' +
      '<p class="dmx-nota">' + g.total + ' elementos, cada um com a sua ficha no Atlas. Toque num quadrado para abrir.</p>';
  }

  function htmlFichas(g) {
    return '<p class="dmx-nota">' + g.total + ' fichas do Atlas (' + esc(g.secao) + '). Toque numa para abrir.</p>' +
      g.grupos.map(function (gr) {
        return '<div class="dmx-grupo">' + (gr.nome ? '<p class="dmx-grupo-t">' + esc(gr.nome) + ' <small>' + gr.itens.length + '</small></p>' : '') +
          '<div class="dmx-chips">' + gr.itens.map(function (f) {
            return '<a class="dmx-chip" href="' + esc(rotas.ficha(f.id)) + '">' +
              (f.capa ? '<img src="' + esc(f.capa) + '" alt="" loading="lazy">' : '') +
              '<span>' + esc(f.titulo) + (f.extra ? '<small>' + esc(f.extra) + '</small>' : '') + '</span></a>';
          }).join('') + '</div></div>';
      }).join('');
  }

  function htmlBloco(b) {
    if (b.t === 'md') return '<div class="md dmx-md">' + bloco(b.md) + '</div>';
    if (b.t === 'h') return '<h4 class="dmx-h">' + inl(b.texto) + '</h4>';
    if (b.t === 'lista') {
      return '<ul class="dmx-lista">' + b.entradas.map(function (e) {
        var nome = e.nomeMd ? '<b class="dmx-nome dmx-nome-md">' + inl(e.nomeMd) + '</b>'
          : (e.nome ? linkFicha(e.id, esc(e.nome), 'dmx-nome' + (e.id ? ' tem' : '')) : '');
        if (nome && e.extra) nome = '<span class="dmx-cab">' + nome + ' <small class="dmx-extra">' + inl(e.extra) + '</small></span>';
        return '<li class="dmx-e' + (e.capa ? ' com-capa' : '') + '">' +
          (e.capa ? linkFicha(e.id, '<img src="' + esc(e.capa) + '" alt="" loading="lazy">', 'dmx-mini') : '') +
          '<div>' + nome + (e.texto ? '<span class="dmx-texto">' + inl(e.texto) + '</span>' : '') + '</div></li>';
      }).join('') + '</ul>';
    }
    if (b.t === 'gerado') {
      if (b.tipo === 'periodica') return htmlPeriodica(b);
      if (b.tipo === 'fichas') return htmlFichas(b);
    }
    return '';
  }

  function corpoTabua(nome, t, pe) {
    var cats = t.categorias;
    var a = Math.max(0, Math.min(aba[nome] || 0, cats.length - 1));
    return (t.intro ? '<div class="md dmx-intro">' + bloco(t.intro) + '</div>' : '') +
      '<div class="dmx-abas" role="tablist" aria-label="Partes da tábua">' + cats.map(function (c, i) {
        return '<button type="button" role="tab" class="dmx-aba' + (i === a ? ' on' : '') + '" aria-selected="' + (i === a) + '" data-dmx-aba="' + i + '">' + esc(c.nome) + '</button>';
      }).join('') + '</div>' +
      '<div class="dmx-painel" role="tabpanel">' + (cats[a] ? cats[a].blocos.map(htmlBloco).join('') : '') + '</div>' +
      '<p class="dmx-pe"><a href="' + esc(rotas.ficha(t.id)) + '">' + esc((pe && pe.link) || 'Abrir a tábua inteira na Biblioteca') + '</a> · ' + esc((pe && pe.onde) || 'o arquivo mora no caderno, em Atlas › Tábuas.') + '</p>';
  }

  /* o mesmo leitor de abas, fora do <details> do Domino: usado pela página da área
     (area.js) para o Museu e o Horizonte, que têm o formato da Tábua */
  var hosts = {};
  function abas(chave, t, pe) {
    hosts[chave] = { t: t, pe: pe };
    return '<div class="dmx-host" data-dmx-host="' + esc(chave) + '">' + corpoTabua(chave, t, pe) + '</div>';
  }

  /* ---------------- o percurso da área, no topo de cada matéria ---------------- */

  var resumo = null;
  var pedidoResumo = null;
  function carregarResumo() {
    if (!pedidoResumo) {
      pedidoResumo = fetch('/api/areas?resumo=1').then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { resumo = d && d.materias ? d.materias : {}; return resumo; })
        .catch(function () { resumo = {}; return resumo; });
    }
    return pedidoResumo;
  }

  function percursoHtml(nome) {
    var a = resumo && resumo[nome];
    if (!a) return '';
    var url = rotas.area(nome);
    var c = a.contas;
    var px = a.proximo;
    var passos = [
      ['mapa', 'Mapa', c.estudos + ' estudos'],
      ['museu', 'Museu', a.escritos.museu ? 'peças e galeria' : 'galeria'],
      ['praticas', 'Práticas', a.escritos.praticas ? c.praticasFeitas + '/' + c.praticas + ' feitas' : c.exercicios + ' exercícios'],
      ['horizonte', 'Horizonte', 'mercado e academia'],
    ];
    return '<nav class="dmx-percurso" aria-label="Percurso ' + esc(daMateria(nome)) + '">' +
      '<a class="dmx-perc-tudo" href="' + esc(url) + '"><span class="dmx-rot">O percurso da área</span><b>Ver a área inteira</b></a>' +
      '<div class="dmx-perc-passos">' + passos.map(function (p) {
        return '<a href="' + esc(rotas.area(nome, p[0])) + '"><b>' + esc(p[1]) + '</b><small>' + esc(p[2]) + '</small></a>';
      }).join('') + '</div>' +
      (px ? '<p class="dmx-perc-prox">Próximo passo: <a href="' + esc(rotas.area(nome, 'n=' + px.codigo)) + '">' + esc(px.codigo) + ' · ' + esc(px.titulo) + '</a></p>' : '') +
      '</nav>';
  }

  /* ---------------- DEPOIS: as Grandes Obras ---------------- */

  function htmlEstante(nome, obras) {
    var on = livro[nome];
    return '<div class="dmx-estante">' + obras.map(function (o, i) {
      return '<button type="button" class="dmx-livro' + (on === o.id ? ' on' : '') + '" data-dmx-livro="' + esc(o.id) + '" style="--n:' + i + '" aria-expanded="' + (on === o.id) + '">' +
        '<span class="dmx-ano">' + esc(o.ano) + '</span>' +
        (o.retrato ? '<img class="dmx-ret" src="' + esc(o.retrato) + '" alt="" loading="lazy">' : '') +
        '<b class="dmx-obra">' + esc(o.obra) + '</b>' +
        '<span class="dmx-autor">' + esc(o.autor) + '</span>' +
        (o.frase ? '<span class="dmx-frase">' + esc(maiuscula(o.frase)) + '</span>' : '') +
        '</button>';
    }).join('') + '</div>';
  }

  function htmlLeitor(o, f) {
    if (!f) return '<div class="dmx-leitor"><p class="dmx-nota">Abrindo o estudo…</p></div>';
    if (f.erro) return '<div class="dmx-leitor"><p class="dmx-nota">Não consegui abrir este estudo agora. Tente pela <a href="' + esc(rotas.ficha(o.id)) + '">Biblioteca</a>.</p></div>';
    var toc = (f.toc || []).filter(function (x) { return x.nivel === 2; });
    return '<article class="dmx-leitor" aria-label="Estudo: ' + esc(o.obra) + '">' +
      '<header class="dmx-leitor-topo"><div><p class="dmx-rot">Estudo completo</p><h3 class="dmx-leitor-t">' + esc(o.obra) + '</h3>' +
      '<p class="dmx-leitor-sub">' + esc(o.autor) + (o.ano ? ' · ' + esc(o.ano) : '') + (o.original ? ' · <i>' + esc(o.original) + '</i>' : '') + '</p></div>' +
      '<div class="dmx-leitor-acoes"><a class="dmx-bt" href="' + esc(rotas.ficha(o.id)) + '">Abrir na Biblioteca</a><button type="button" class="dmx-bt" data-dmx-fechar>Fechar</button></div></header>' +
      (toc.length > 1 ? '<nav class="dmx-toc" aria-label="Partes do estudo">' + toc.map(function (x, i) { return '<button type="button" data-dmx-toc="' + i + '">' + esc(x.texto) + '</button>'; }).join('') + '</nav>' : '') +
      '<div class="md dmx-estudo">' + paraBiblioteca(MD ? MD.render(semTitulo(f.corpo)) : esc(f.corpo)) + '</div>' +
      '<p class="dmx-pe"><button type="button" class="dmx-bt" data-dmx-fechar>Fechar o estudo</button></p></article>';
  }

  function corpoObras(nome, obras) {
    var o = null;
    obras.forEach(function (x) { if (x.id === livro[nome]) o = x; });
    return '<p class="dmx-nota">Os livros que fundaram a área, em ordem de data. Toque num livro para ler o estudo completo aqui mesmo: quem escreveu, o que diz, o que cai na prova e um exercício com gabarito.</p>' +
      htmlEstante(nome, obras) + (o ? htmlLeitor(o, fichas[o.id]) : '');
  }

  /* ---------------- montagem ---------------- */

  function resumoCats(t) { return t.categorias.map(function (c) { return c.nome; }).slice(0, 6).join(' · '); }

  function intervalo(obras) {
    if (!obras.length) return '';
    var a = obras[0].ano, b = obras[obras.length - 1].ano;
    return a === b ? a : a + ' a ' + b;
  }

  function moduloHtml(lado, nome, m) {
    var chave = nome + '|' + lado;
    var abre = !!aberto[chave];
    if (lado === 'antes') {
      var t = m.tabua;
      return '<details class="dmx dmx-tabua"' + (abre ? ' open' : '') + ' data-dmx="' + esc(chave) + '">' +
        '<summary><span class="dmx-rot">Antes de estudar · o mapa</span><b class="dmx-titulo">' + esc(t.titulo) + '</b>' +
        '<span class="dmx-sub">' + esc(resumoCats(t)) + '</span><span class="dmx-seta" aria-hidden="true"></span></summary>' +
        '<div class="dmx-corpo">' + (abre ? corpoTabua(nome, t) : '') + '</div></details>';
    }
    return '<details class="dmx dmx-obras"' + (abre ? ' open' : '') + ' data-dmx="' + esc(chave) + '">' +
      '<summary><span class="dmx-rot">Depois de estudar · os livros</span><b class="dmx-titulo">Grandes Obras ' + esc(daMateria(nome)) + '</b>' +
      '<span class="dmx-sub">' + m.obras.length + ' livros, de ' + esc(intervalo(m.obras)) + ' · estudo completo de cada um</span><span class="dmx-seta" aria-hidden="true"></span></summary>' +
      '<div class="dmx-corpo">' + (abre ? corpoObras(nome, m.obras) : '') + '</div></details>';
  }

  function preencherCorpo(det) {
    var k = det.getAttribute('data-dmx').split('|');
    var nome = k[0], lado = k[1];
    var m = dados && dados.materias[nome];
    if (!m) return;
    det.querySelector('.dmx-corpo').innerHTML = lado === 'antes' ? corpoTabua(nome, m.tabua) : corpoObras(nome, m.obras);
  }

  function preencher(lista, opcoes) {
    ultimaLista = lista;
    var semPercurso = opcoes && opcoes.semPercurso;
    Promise.all([carregar(), semPercurso ? null : carregarResumo()]).then(function () {
      if (lista !== ultimaLista) return;
      lista.querySelectorAll('.dmx-antes, .dmx-depois').forEach(function (lugar) {
        var nome = lugar.getAttribute('data-mat');
        var m = dados.materias[nome];
        var lado = lugar.classList.contains('dmx-antes') ? 'antes' : 'depois';
        var perc = lado === 'antes' && !semPercurso ? percursoHtml(nome) : '';
        if (!m || (lado === 'antes' && !m.tabua) || (lado === 'depois' && !m.obras.length)) { lugar.innerHTML = perc; return; }
        lugar.innerHTML = perc + moduloHtml(lado, nome, m);
      });
    });
  }

  function abrirLivro(det, nome, id) {
    livro[nome] = livro[nome] === id ? null : id;
    if (livro[nome] && !fichas[id]) {
      fetch('/api/ficha?id=' + encodeURIComponent(id)).then(function (r) { return r.ok ? r.json() : { erro: true }; })
        .catch(function () { return { erro: true }; })
        .then(function (f) {
          fichas[id] = f;
          if (livro[nome] === id && det.isConnected) { preencherCorpo(det); rolarAoLeitor(det); }
        });
    }
    preencherCorpo(det);
    if (livro[nome] && fichas[id]) rolarAoLeitor(det);
  }

  function rolarAoLeitor(det) {
    var l = det.querySelector('.dmx-leitor');
    if (l) l.scrollIntoView({ block: 'start', behavior: document.documentElement.getAttribute('data-mov') === 'off' ? 'auto' : 'smooth' });
  }

  document.addEventListener('toggle', function (ev) {
    var det = ev.target;
    if (!det.classList || !det.classList.contains('dmx')) return;
    var chave = det.getAttribute('data-dmx');
    aberto[chave] = det.open;
    if (det.open && !det.querySelector('.dmx-corpo').innerHTML) preencherCorpo(det);
  }, true);

  document.addEventListener('click', function (ev) {
    var host = ev.target.closest && ev.target.closest('[data-dmx-host]');
    var bAba = host && ev.target.closest('[data-dmx-aba]');
    if (bAba) {
      var ch = host.getAttribute('data-dmx-host');
      var h = hosts[ch];
      if (!h) return;
      aba[ch] = +bAba.getAttribute('data-dmx-aba');
      lembrar();
      host.innerHTML = corpoTabua(ch, h.t, h.pe);
      var nova = host.querySelector('[data-dmx-aba="' + aba[ch] + '"]');
      if (nova) nova.focus({ preventScroll: true });
      return;
    }
    var det = ev.target.closest && ev.target.closest('details.dmx');
    if (!det) return;
    var nome = det.getAttribute('data-dmx').split('|')[0];
    var b;
    if ((b = ev.target.closest('[data-dmx-aba]'))) {
      aba[nome] = +b.getAttribute('data-dmx-aba');
      lembrar();
      preencherCorpo(det);
      return;
    }
    if ((b = ev.target.closest('[data-dmx-livro]'))) { abrirLivro(det, nome, b.getAttribute('data-dmx-livro')); return; }
    if (ev.target.closest('[data-dmx-fechar]')) {
      var id = livro[nome];
      livro[nome] = null;
      preencherCorpo(det);
      var bt = id && det.querySelector('[data-dmx-livro="' + id + '"]');
      if (bt) { bt.scrollIntoView({ block: 'center', behavior: 'auto' }); bt.focus({ preventScroll: true }); }
      return;
    }
    if ((b = ev.target.closest('[data-dmx-toc]'))) {
      var alvo = det.querySelectorAll('.dmx-estudo h3')[+b.getAttribute('data-dmx-toc')];
      if (alvo) alvo.scrollIntoView({ block: 'start', behavior: document.documentElement.getAttribute('data-mov') === 'off' ? 'auto' : 'smooth' });
    }
  });

  window.DominoMais = { preencher: preencher, carregar: carregar, abas: abas, bloco: bloco, inl: inl, rotas: rotas };
  carregar();
})();
