(function () {
  'use strict';

  var P = window.Perfil;
  var C = window.Cartao;
  var esc = P.esc;
  var raiz = document.getElementById('conteudo');

  var CHAVES = [['port', 'Linguagens'], ['liter', 'Linguagens'], ['gramat', 'Linguagens'], ['ingles', 'Linguagens'],
    ['interpret', 'Linguagens'], ['historia', 'História'], ['geograf', 'Geografia'], ['matem', 'Matemática'],
    ['filosof', 'Filosofia'], ['sociolog', 'Sociologia'], ['biolog', 'Biologia'], ['fisica', 'Física'], ['quimic', 'Química']];

  var jardim = null;
  var cartao = null;
  var teia = null;
  var modulos = null;
  var dadosAnteriores = null;
  var indicePend = null;
  function indice() {
    if (!indicePend) indicePend = fetch('/api/biblioteca').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    return indicePend;
  }

  function normalizar(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ');
  }

  function secaoDoTexto(texto) {
    var n = ' ' + normalizar(texto);
    var melhor = null, pos = 1e9;
    CHAVES.forEach(function (c) {
      var i = n.indexOf(' ' + c[0]);
      if (i >= 0 && i < pos) { pos = i; melhor = c[1]; }
    });
    return melhor;
  }

  function isoLocal(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function dicaDoBloco(texto) {
    var n = normalizar(texto);
    if (n.indexOf('simulado') >= 0) return 'Cronometrado, sem consulta. Depois, corrija: cada erro vira uma linha no Caderno de Erros.';
    if (n.indexOf('corrig') >= 0) return 'Refaça cada questão errada sem olhar a resposta. A regra, em uma frase, vai para o Caderno de Erros.';
    if (n.indexOf('prova') >= 0) return 'Chegue às 8h. Comece pelas que domina; marque as difíceis e volte.';
    return '';
  }

  function fila(e, secaoNome) {
    var lista = [];
    e.checklist.forEach(function (s) {
      if (secaoNome && s.nome !== secaoNome) return;
      s.itens.forEach(function (i) { if (!i.feito) lista.push({ secao: s.nome, item: i }); });
    });
    var rev = {};
    C.revisoesDeHoje().forEach(function (x) { rev[x.chave] = 1; });
    lista.sort(function (a, b) { return (rev[C.chave(b.secao, b.item.texto)] ? 1 : 0) - (rev[C.chave(a.secao, a.item.texto)] ? 1 : 0); });
    return lista;
  }

  function achar(e, k) {
    for (var i = 0; i < e.checklist.length; i++) {
      var s = e.checklist[i];
      for (var j = 0; j < s.itens.length; j++) if (C.chave(s.nome, s.itens[j].texto) === k) return { secao: s.nome, item: s.itens[j] };
    }
    return null;
  }

  function ss(nome, v) { try { if (v === undefined) return sessionStorage.getItem(nome); if (v === null) sessionStorage.removeItem(nome); else sessionStorage.setItem(nome, v); } catch (x) {} return null; }
  function lerSalto() { return +ss('agora-salto') || 0; }
  function gravarSalto(n) { ss('agora-salto', String(n)); }
  function lerHist() { try { return JSON.parse(ss('agora-hist') || '[]'); } catch (x) { return []; } }
  function gravarHist(h) { ss('agora-hist', JSON.stringify(h.slice(-30))); }
  function empilhar(atual) { if (!atual) return; var h = lerHist(); var k = C.chave(atual.secao, atual.item.texto); if (h[h.length - 1] !== k) { h.push(k); gravarHist(h); } }

  function linhaRoteiro(numero, rotulo, texto, agora) {
    var secao = secaoDoTexto(texto);
    return '<li class="' + (secao ? P.corDe(secao) : '') + (agora ? ' agora' : '') + '"><b>' + numero + '</b><div><span class="rot">' + rotulo + '</span><p>' + esc(texto) + '</p></div></li>';
  }

  function dadosJardim(e) {
    return e.checklist.map(function (s) { return { nome: s.nome, cor: P.corDe(s.nome), feitos: s.feitos, total: s.total }; });
  }

  function progressoPorNome(dados) {
    var o = {};
    dados.forEach(function (d) { o[d.nome] = d.total ? d.feitos / d.total : 0; });
    return o;
  }

  function desenhar(e) {
    var c = P.contagem(e);
    var principal = e.tarefas[0];
    var hoje = new Date();
    var diaDoAno = Math.floor((hoje - new Date(hoje.getFullYear(), 0, 0)) / 86400000);
    var frase = e.frases[diaDoAno % e.frases.length];
    var feitos = 0, todos = 0;
    e.checklist.forEach(function (s) { feitos += s.feitos; todos += s.total; });

    var linha = (e.roteiro || []).filter(function (r) { return r.data === isoLocal(hoje); })[0] || null;
    var alvo = linha ? secaoDoTexto(linha.bloco1) : null;
    var modoBloco = !!(linha && !alvo);
    var pendentes = modoBloco ? [] : fila(e, alvo);
    if (!modoBloco && !pendentes.length) pendentes = fila(e, null);

    var salto = pendentes.length ? lerSalto() % pendentes.length : 0;
    var forcado = ss('agora-alvo') ? achar(e, ss('agora-alvo')) : null;
    var atual = modoBloco ? null : (forcado || pendentes[salto]);
    var h = hoje.getHours();
    var saud = h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    /* a manchete do almanaque: a data, o dia da contagem e o que fazer agora (08/out/2026) */
    var topo = document.querySelector('.topo-pg');
    if (topo) {
      var data = P.dataExtenso();
      var virg = data.indexOf(',');
      var contaTxt = c.fase === 'dentro' ? (c.faltam === 0 ? 'Hoje é a prova.' : 'Faltam <b>' + c.faltam + '</b> dia' + (c.faltam === 1 ? '' : 's') + ' para a prova.') : c.fase === 'antes' ? '' : 'A prova passou.';
      var agoraTxt = atual ? ' Agora: <b>' + esc(atual.secao) + '</b>, ' + esc(atual.item.texto.replace(/\s*\(.*$/, '')) + '.' : linha ? ' Agora: o bloco 1 do roteiro.' : '';
      topo.innerHTML = '<p class="rot"><span>Dia ' + diaDoAno + ' do ano · Campinas</span>' +
        '<span>' + feitos + ' / ' + todos + ' dominados</span></p>' +
        '<h1 class="mega ag-data">' + (virg > 0 ? esc(data.slice(0, virg)) + ',<br><em>' + esc(data.slice(virg + 1).trim()) + '</em>' : esc(data)) + '</h1>' +
        '<p class="resposta">' + saud + '. ' + contaTxt + agoraTxt + '</p>' +
        '<svg class="ag-arco" id="ag-arco" viewBox="0 0 560 220" role="img"></svg>';
      if (window.Solar) window.Solar.arco(document.getElementById('ag-arco'));
    }

    /* logo abaixo: a ficha do momento, sozinha — sem rolar, em desktop e celular */
    var html = '<section class="c-12 ag-principal" id="ag-principal" aria-label="Sua tarefa agora" data-secao="agora" data-rotulo="O estudo de agora">';
    if (modoBloco) {
      var dica = dicaDoBloco(linha.bloco1);
      html += '<article class="cx ag-cartao"><header class="ag-cab"><span class="ag-mat"><i class="q"></i>Bloco 1 · hoje no roteiro</span></header>' +
        '<h2 class="ag-titulo tarefa-t">' + esc(linha.bloco1) + '</h2>' + (dica ? '<p class="ag-resumo">' + esc(dica) + '</p>' : '') + '</article>';
    } else if (atual) {
      html += '<div id="ag-cartao-mount"></div>';
    } else {
      html += '<article class="cx ag-cartao"><header class="ag-cab"><span class="ag-mat">Checklist</span></header><h2 class="ag-titulo tarefa-t">Tudo marcado.</h2><p class="ag-resumo">Reler o Centro e regá-lo.</p></article>';
    }
    html += '</section>';

    if (linha) {
      html += '<div class="c-12 cx ag-roteiro" data-secao="roteiro" data-rotulo="O roteiro do dia"><p class="rot">Hoje no roteiro · ' + esc(linha.rotulo) + '</p><ol>' +
        linhaRoteiro(1, 'Bloco 1', linha.bloco1, true) + linhaRoteiro(2, 'Bloco 2', linha.bloco2, false) + linhaRoteiro(3, 'Treino', linha.treino, false) + '</ol></div>';
    }

    /* toda a organização pessoal num lugar só (08/out/2026): Meu dia, prazos, domínio, objetivos, esperando */
    html += '<div class="c-12 hj" id="hj-painel" data-secao="painel" data-rotulo="Meu dia, prazos, domínio e objetivos"></div>';

    /* abaixo da dobra: primeiro a teia de conexões, depois os módulos */
    if (atual) {
      html += '<div class="c-12 cx mapa-cx ag-teia" id="ag-teia-cx" hidden data-secao="teia" data-rotulo="A teia de conexões"><p class="rot">Teia de conexões · ' + esc(atual.secao) + '</p><canvas id="ag-mapa" class="mapa-tela"></canvas>' +
        '<p class="mapa-leg"><span><i class="a"></i>acima</span><span><i class="b"></i>abaixo</span><span><i class="l"></i>ao lado</span><span><i class="c"></i>cita</span><span><i class="d"></i>citada por</span><span><i class="s"></i>sem ficha</span></p>' +
        '<p class="rot suave" id="ag-teia-info"></p></div>';
    }
    html += '<div class="c-12" id="ag-modulos-mount" style="min-width:0" data-secao="modulos" data-rotulo="O que estudar agora, matéria por matéria"></div>';

    html += '<blockquote class="c-12 ag-frase" data-secao="frase" data-rotulo="A frase do dia">' + esc(frase.texto) + (frase.fonte ? '<cite>— ' + esc(frase.fonte) + '</cite>' : '') + '</blockquote>';

    /* no fim, para respirar: o jardim e o protetor de tela (antes ficavam no topo; 08/out/2026 o topo é o que fazer) */
    html += '<div class="c-12 ag-respiro" data-secao="respiro" data-rotulo="Para respirar: o jardim e o protetor"><h2 class="h3 ag-respiro-t">Para respirar</h2><div class="ag-hero" id="ag-hero" data-ver="jardim">' +
      '<div class="ag-alterna" role="group" aria-label="Mostrar"><button type="button" class="on" data-ver-hero="jardim">Jardim</button><button type="button" data-ver-hero="protetor">Protetor de tela</button></div>' +
      '<div class="cx ag-jardim" aria-label="Seu jardim"><p class="rot">Seu jardim</p><canvas id="jardim" class="jardim-tela" width="320" height="200"></canvas>' +
      '<p class="ag-jardim-n"><b>' + feitos + '</b> de ' + todos + ' dominados' + (c.fase === 'dentro' ? ' · dia ' + Math.min(c.dia, c.total) + ' de ' + c.total : '') + '</p>' +
      '<p class="ag-jardim-ir"><a class="botao" href="jardim.html">Entrar no jardim</a></p></div>' +
      '<div class="cx pt-mini" id="pt-mini-cx" data-protetor-mini></div></div></div>';


    raiz.innerHTML = html;
    if (window.Organizar) window.Organizar.montar(document.getElementById('hj-painel'), e);
    if (window.Arrumar) window.Arrumar.aplicar();
    var hero = document.getElementById('ag-hero');
    if (hero) hero.addEventListener('click', function (ev) { var b = ev.target.closest('[data-ver-hero]'); if (!b) return; hero.dataset.ver = b.dataset.verHero; hero.querySelectorAll('[data-ver-hero]').forEach(function (x) { x.classList.toggle('on', x === b); }); });

    /* ---- jardim ---- */
    var novos = dadosJardim(e);
    var tela = document.getElementById('jardim');
    if (jardim) jardim.destruir();
    if (dadosAnteriores) {
      var jaTinha = dadosAnteriores.map(function (d) { return { nome: d.nome, cor: d.cor, feitos: d.feitos, total: d.total }; });
      jardim = window.Jardim.montar(tela, jaTinha, { de: progressoPorNome(dadosAnteriores) });
      jardim.atualizar(novos, true);
    } else {
      jardim = window.Jardim.montar(tela, novos, {});
    }
    dadosAnteriores = novos;

    /* ---- módulos (o que estudar agora, vestibular ou Atlas) ---- */
    var montModulos = document.getElementById('ag-modulos-mount');
    if (modulos) { modulos.destruir(); modulos = null; }
    if (montModulos) {
      indice().then(function (ind) {
        if (!ind || !montModulos || !document.body.contains(montModulos)) return;
        modulos = window.Modulos.montar(montModulos, {
          estado: e, indice: ind,
          aoVestibular: function (d) {
            C.baralho(e, d.nome, function (secao, item) { ss('agora-alvo', C.chave(secao, item.texto)); desenhar(e); });
          },
          aoAtlas: function (d) {
            var itens = ind.itens.filter(function (it) { return it[2] === d.secaoId; }).map(function (it) {
              return { id: it[0], titulo: it[1], sub: it[3], capa: it[5] };
            });
            C.baralhoAtlas(d.nome, itens, function (item) { location.href = 'biblioteca.html#f=' + encodeURI(item.id); });
          },
        });
      });
    }

    /* ---- card de estudo ---- */
    if (cartao) { cartao.destruir(); cartao = null; }
    if (teia) { teia.destruir(); teia = null; }
    if (!atual) return;
    var iSecao = e.checklist.findIndex(function (s) { return s.nome === atual.secao; });
    var ha = lerHist().length > 0;
    function irOutro() { empilhar(atual); ss('agora-alvo', null); gravarSalto(forcado ? salto : salto + 1); desenhar(e); }
    function voltar() { var h = lerHist(); var k = h.pop(); gravarHist(h); if (!k) return; ss('agora-alvo', k); desenhar(e); }
    cartao = C.montar(document.getElementById('ag-cartao-mount'), {
      secao: atual.secao, item: atual.item, cor: P.corDe(atual.secao), tempo: principal ? principal.tempo : '', contexto: 'agora',
      todos: todos, iSecao: iSecao, estudos: [],
      irOutro: pendentes.length > 1 || forcado ? irOutro : null,
      voltar: ha ? voltar : null,
      baralho: function () { C.baralho(e, atual.secao, function (secao, item) { empilhar(atual); ss('agora-alvo', C.chave(secao, item.texto)); desenhar(e); }); },
      dominar: function (feito) {
        return P.marcar(atual.secao, atual.item.texto, feito).then(function (novo) { empilhar(atual); ss('agora-alvo', null); gravarSalto(0); desenhar(novo); });
      },
    });
    var estudosDeAgora = P.estudos();
    estudosDeAgora.then(function (m) { if (cartao) cartao.estudos(m[atual.secao + '|' + atual.item.texto]); });
    P.mapas().then(function (m) { if (cartao) cartao.mapas(m[atual.secao]); });

    /* ---- teia de conexões: a "página geral" em forma de mapa, não só de link ---- */
    var caixaTeia = document.getElementById('ag-teia-cx');
    estudosDeAgora.then(function (m) {
      var lista = m[atual.secao + '|' + atual.item.texto];
      if (!lista || !lista.length || !caixaTeia || !document.body.contains(caixaTeia) || !window.Mapa) return;
      return fetch('/api/ficha?id=' + encodeURIComponent(lista[0].id)).then(function (r) { return r.ok ? r.json() : null; });
    }).then(function (f) {
      if (!f || !caixaTeia || !document.body.contains(caixaTeia)) return;
      var tem = f.saem.length || f.chegam.length || f.hierarquia.length || f.parecidos.length;
      if (!tem) return;
      caixaTeia.hidden = false;
      var tela = document.getElementById('ag-mapa');
      var ir = function (id) { location.href = 'biblioteca.html#f=' + encodeURI(id); };
      teia = window.Mapa.montar(tela, f, { ir: ir });
      document.getElementById('ag-teia-info').textContent = teia.total + ' ligações' + (teia.semFicha ? ' · ' + teia.semFicha + ' sem ficha' : '') + ' — clique para abrir';
    }).catch(function () {});
  }

  P.estado(true).then(desenhar).catch(function () {
    raiz.innerHTML = '<article class="cx c-12"><p class="rot">Servidor desligado</p>' +
      '<p class="sem-carta">Abra <b>hoje.bat</b> (na pasta jadesun) e deixe a janelinha preta aberta enquanto usa.</p></article>';
  });
})();
