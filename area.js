/* ============================================================
   ÁREA — o percurso inteiro de uma matéria (08/out/2026, PERFIL.md item 69)

   COMPONENTE, NÃO PÁGINA. Não lê a URL e não conhece os nomes das páginas:
     var a = Area.montar(elemento, {
       materia: 'Química',
       rotas: { area(m, alvo), ficha(id), domino(alvo) },  // quem monta decide os endereços
       aoMudar(estado),        // { materia, modulo, estudo } — quem monta decide se vira URL
       topo: true,             // o cabeçalho com nome, progresso e próximo passo
       ids: true,              // ids nas seções (#mapa, #museu…) para links diretos
     });
     a.ir('museu'); a.selecionar('QUI-07'); a.destruir();
   area.html é só uma casca: lê ?m= e #n=, monta e escreve o hash.
   Trocar rotas e navegação = trocar a casca, sem mexer aqui.

   Módulos: 1 Mapa · 2 Museu · 3 Tábua · 4 Itens · 5 Obras · 6 Práticas · 7 Horizonte.
   Dois arranjos: "corrido" (um embaixo do outro, como texto) e "lado a lado"
   (painéis em duas colunas). Cada módulo se recolhe e se alarga sozinho.
   O mapa sai dos estudos da Seleção (lib/areas.mjs); o painel do estudo tem
   lentes: Resumo, Texto corrido (o próprio estudo, que é a fonte) e Papel.
   A Tábua e as Grandes Obras são os mesmos módulos do Domino (domino-mais.js).
   ============================================================ */
(function () {
  'use strict';

  var P = window.Perfil;
  var esc = P.esc;
  var DM = window.DominoMais;
  var ORDEM = ['Linguagens', 'História', 'Geografia', 'Química', 'Biologia', 'Matemática', 'Física', 'Filosofia', 'Sociologia'];
  var SITUACAO = { dominado: 'dominado', parcial: 'em parte', pendente: 'a estudar', 'sem-item': 'sem item no Checklist' };
  var MODULOS = [
    ['mapa', '1', 'Ver o todo', 'O mapa da área', 'Cada caixa é um estudo da Seleção; as linhas são os pré-requisitos. Toque num estudo para ver os conceitos, de onde ele vem, o que ele abre e com que outras áreas conversa.'],
    ['museu', '2', 'Dar corpo aos conceitos', 'O museu da área', 'Objetos, obras, lugares e exemplos reais, cada um ligado ao estudo que ele ilumina. Depois, a galeria: as imagens que os estudos já trazem, com crédito.'],
    ['tabua', '3', 'Os nomes e as coisas', 'A Tábua', 'A mesma Tábua do Domino: o atlas da área por categoria.'],
    ['itens', '4', 'Entender cada conceito', 'Os itens do Checklist', 'O que a prova cobra. Estude e marque no Domino; o mapa acompanha.'],
    ['obras', '5', 'As fontes', 'Grandes Obras', 'Os mesmos estudos de livros do Domino, em ordem de data.'],
    ['praticas', '6', 'Relacionar e aplicar', 'Práticas', 'Do papel ao mundo, em três níveis. Cada prática diz o que fazer e como conferir. A marca "feita" fica gravada no caderno.'],
    ['horizonte', '7', 'Ir além', 'O horizonte', 'Onde esta área vira trabalho, pesquisa e vida: profissões, caminhos acadêmicos, leituras de fôlego e pontes com as outras áreas.'],
  ];
  var CURTO = { mapa: 'Mapa', museu: 'Museu', tabua: 'Tábua', itens: 'Itens', obras: 'Obras', praticas: 'Práticas', horizonte: 'Horizonte' };
  var ROTAS_PADRAO = {
    area: function (m, alvo) { return 'area.html?m=' + encodeURIComponent(m) + (alvo ? '#' + alvo : ''); },
    ficha: function (id) { return 'biblioteca.html#f=' + encodeURI(id); },
    domino: function (alvo) { return 'domino.html' + (alvo ? '#' + alvo : ''); },
  };

  function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function bloco(md) { return DM ? DM.bloco(md) : '<p>' + esc(md) + '</p>'; }
  function inl(md) { return DM ? DM.inl(md) : esc(md); }
  function mov() { return document.documentElement.getAttribute('data-mov') === 'off' ? 'auto' : 'smooth'; }
  function daMateria(n) { return (n === 'Linguagens' ? 'das ' : 'da ') + n; }
  function ler(k, padrao) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? padrao : v; } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem espaço */ } }
  function quebrar(t, max) {
    var pal = String(t).split(/\s+/), linhas = [], l = '';
    pal.forEach(function (p) { if ((l + ' ' + p).trim().length > max && l) { linhas.push(l); l = p; } else l = (l + ' ' + p).trim(); });
    if (l) linhas.push(l);
    return linhas;
  }

  function montar(raiz, op) {
    op = op || {};
    var nome = ORDEM.indexOf(op.materia) >= 0 ? op.materia : 'Linguagens';
    var R = {};
    Object.keys(ROTAS_PADRAO).forEach(function (k) { R[k] = (op.rotas && op.rotas[k]) || ROTAS_PADRAO[k]; });
    var aoMudar = op.aoMudar || function () {};
    var fonte = op.fonte || function (m) { return '/api/areas?m=' + encodeURIComponent(m); };

    var A = null, por = {}, sel = null, vista = 'mapa', busca = '', soFalta = false, lente = 'resumo', textos = {};
    var arranjo = ler('jadesun-area-arranjo', { layout: 'corrido', fechados: {}, largos: {} });
    var vivo = true;
    var $ = function (s) { return raiz.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(raiz.querySelectorAll(s)); };
    var linkFicha = function (id, txt, cls) { return '<a class="' + (cls || '') + '" href="' + esc(R.ficha(id)) + '">' + txt + '</a>'; };

    /* ---------------- esqueleto ---------------- */

    raiz.classList.add('ar-app', P.corDe(nome));
    raiz.innerHTML =
      (op.topo !== false ? '<header class="topo-pg ar-topo">' +
        '<p class="rot"><a href="' + esc(R.domino()) + '" class="ar-volta">Domino</a><span aria-hidden="true"> · </span><span>a área inteira</span></p>' +
        '<h1 class="mega ar-nome">' + esc(nome) + '</h1><p class="resposta ar-resposta">Carregando a área…</p>' +
        '<div class="ar-prox" aria-live="polite"></div><nav class="ar-materias" aria-label="Outras áreas"></nav></header>' : '') +
      '<nav class="ar-passos" aria-label="Módulos da área">' +
        MODULOS.map(function (m) { return '<button type="button" data-ir-mod="' + m[0] + '"><i>' + m[1] + '</i>' + esc(CURTO[m[0]]) + '</button>'; }).join('') +
        '<span class="ar-arranjo" role="group" aria-label="Arranjo dos módulos"><button type="button" data-layout="corrido">Corrido</button><button type="button" data-layout="lado">Lado a lado</button></span>' +
      '</nav>' +
      '<div class="ar-mods">' + MODULOS.map(function (m) {
        return '<section class="ar-sec ar-mod" data-mod="' + m[0] + '"' + (op.ids !== false ? ' id="' + m[0] + '"' : '') + '>' +
          '<header class="ar-cab"><p class="ar-etapa">' + m[1] + ' · ' + esc(m[2]) + '</p>' +
          '<div class="ar-cab-l"><h2 class="h2">' + esc(m[3]) + '</h2><span class="ar-mod-acoes">' +
          '<button type="button" class="ar-mod-bt" data-largo aria-pressed="false">largo</button>' +
          '<button type="button" class="ar-mod-bt" data-fechar aria-expanded="true">recolher</button></span></div>' +
          '<p class="ar-lead">' + esc(m[4]) + '</p></header><div class="ar-mod-corpo"></div></section>';
      }).join('') + '</div><div class="ar-impressao" aria-hidden="true"></div>';

    var corpo = function (mod) { return $('.ar-mod[data-mod="' + mod + '"] .ar-mod-corpo'); };
    corpo('mapa').innerHTML =
      '<div class="ar-ferr" role="toolbar" aria-label="Ferramentas do mapa">' +
        '<div class="ar-vistas" role="group" aria-label="Vista"><button type="button" class="on" data-vista="mapa" aria-pressed="true">Mapa</button><button type="button" data-vista="caminho" aria-pressed="false">Caminho</button><button type="button" data-vista="papel" aria-pressed="false">Papel</button></div>' +
        '<label class="ar-busca"><span class="sr">Buscar no mapa</span><input type="search" class="ar-busca-in" placeholder="Buscar estudo ou conceito" autocomplete="off"></label>' +
        '<label class="ar-check"><input type="checkbox" class="ar-falta-in"> Só o que falta</label>' +
        '<div class="ar-acoes"><button type="button" class="dmx-bt" data-acao="imprimir">Imprimir</button><button type="button" class="dmx-bt" data-acao="md">Baixar texto</button><button type="button" class="dmx-bt" data-acao="svg">Baixar desenho</button></div>' +
      '</div><p class="ar-legenda"></p>' +
      '<div class="ar-vista ar-v-mapa"><div class="ar-rolo" data-lenis-prevent><div class="ar-grafo"></div></div><aside class="ar-detalhe" aria-live="polite"></aside></div>' +
      '<div class="ar-vista ar-v-caminho" hidden></div><div class="ar-vista ar-v-papel" hidden></div>';

    function aplicarArranjo() {
      raiz.setAttribute('data-layout', arranjo.layout);
      $$('button[data-layout]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-layout') === arranjo.layout); });
      $$('.ar-mod').forEach(function (s) {
        var m = s.getAttribute('data-mod'), f = !!arranjo.fechados[m], l = !!arranjo.largos[m];
        s.classList.toggle('fechado', f); s.classList.toggle('largo', l);
        var bf = s.querySelector('[data-fechar]'); bf.textContent = f ? 'abrir' : 'recolher'; bf.setAttribute('aria-expanded', !f);
        s.querySelector('[data-largo]').setAttribute('aria-pressed', l);
      });
      requestAnimationFrame(fios);
    }
    function salvarArranjo() { gravar('jadesun-area-arranjo', arranjo); aplicarArranjo(); }

    /* ---------------- topo ---------------- */

    function desenharTopo() {
      if (op.topo === false) return;
      var c = A.contas;
      $('.ar-resposta').innerHTML =
        '<b>' + c.estudos + ' estudos</b> em ' + A.unidades.length + ' unidades · <b>' + c.dominados + '/' + c.itens + '</b> ligações a itens do Checklist já dominadas · ' +
        (A.praticas ? '<b>' + c.praticasFeitas + '/' + c.praticas + '</b> práticas feitas · ' : '') + c.exercicios + ' exercícios com gabarito nos estudos.';
      var px = A.proximo, prox = $('.ar-prox');
      if (!px) prox.innerHTML = '<p><b>Tudo o que o Checklist liga a esta área está dominado.</b> Siga pelas práticas e pelo horizonte.</p>';
      else if (px.tipo === 'estudo') {
        prox.innerHTML = '<p class="ar-prox-t">Próximo passo</p>' +
          '<p><button type="button" class="ar-link" data-ir="' + esc(px.codigo) + '"><b>' + esc(px.codigo) + ' · ' + esc(px.titulo) + '</b></button>' +
          (px.base && px.base.length ? ' <span class="ar-suave">— antes, a base: ' + px.base.map(function (c2) { return '<button type="button" class="ar-link" data-ir="' + esc(c2) + '">' + esc(c2) + '</button>'; }).join(', ') + ' (sem item no Checklist, por isso não medida)</span>' : '') +
          '</p><p class="ar-suave">É o primeiro estudo do caminho com item ainda não dominado. Estude, faça os exercícios do estudo e marque no Domino.</p>';
      } else {
        prox.innerHTML = '<p class="ar-prox-t">Próximo passo</p><p><button type="button" class="ar-link" data-ir-pratica="' + esc(px.codigo) + '"><b>Prática ' + esc(px.codigo) + ' · ' + esc(px.titulo) + '</b></button></p>';
      }
      $('.ar-materias').innerHTML = ORDEM.map(function (m) {
        return '<a class="chip ' + P.corDe(m) + (m === nome ? ' on' : '') + '" href="' + esc(R.area(m)) + '"' + (m === nome ? ' aria-current="page"' : '') + '><i class="q"></i>' + esc(m) + '</a>';
      }).join('');
    }

    /* ---------------- 1. o mapa ---------------- */

    function casa(n) {
      if (!busca) return true;
      var alvo = norm(n.codigo + ' ' + n.titulo + ' ' + n.conceitos.join(' ') + ' ' + n.programa);
      return busca.split(' ').every(function (t) { return alvo.indexOf(t) >= 0; });
    }
    function some(n) { return (soFalta && n.situacao === 'dominado') || !casa(n); }
    function realce(texto) {
      if (!busca) return esc(texto);
      var t = esc(texto);
      busca.split(' ').forEach(function (b) {
        if (b.length < 2) return;
        var n = norm(texto), i = n.indexOf(b);
        if (i >= 0 && n.length === texto.length) t = esc(texto.slice(0, i)) + '<mark>' + esc(texto.slice(i, i + b.length)) + '</mark>' + esc(texto.slice(i + b.length));
      });
      return t;
    }
    function cadeia(codigo, campo) {
      var vistos = {}, pilha = (por[codigo] ? por[codigo][campo] : []).slice();
      while (pilha.length) { var c = pilha.pop(); if (vistos[c] || !por[c]) continue; vistos[c] = 1; pilha.push.apply(pilha, por[c][campo]); }
      return vistos;
    }
    function nosDa(u) { return A.nos.filter(function (n) { return n.unidade === u.nome; }).sort(function (a, b) { return (a.nivel - b.nivel) || (a.codigo < b.codigo ? -1 : 1); }); }

    function desenharGrafo() {
      var g = $('.ar-grafo');
      g.style.setProperty('--cols', A.unidades.length);
      var ante = sel ? cadeia(sel, 'pre') : {}, desc = sel ? cadeia(sel, 'abre') : {};
      g.innerHTML = '<svg class="ar-fios" aria-hidden="true"></svg>' + A.unidades.map(function (u, ui) {
        return '<div class="ar-col" role="group" aria-label="Unidade ' + (ui + 1) + ': ' + esc(u.nome) + '"><p class="ar-col-t"><i>' + (ui + 1) + '</i>' + esc(u.nome) + '</p>' +
          nosDa(u).map(function (n) {
            var cls = 'ar-no s-' + n.situacao + (sel === n.codigo ? ' on' : '') + (ante[n.codigo] ? ' ante' : '') + (desc[n.codigo] ? ' desc' : '') +
              (sel && sel !== n.codigo && !ante[n.codigo] && !desc[n.codigo] ? ' longe' : '') + (some(n) ? ' apagado' : '');
            return '<button type="button" class="' + cls + '" data-no="' + esc(n.codigo) + '" aria-pressed="' + (sel === n.codigo) + '" aria-label="' + esc(n.codigo + ' ' + n.titulo + ', ' + SITUACAO[n.situacao]) + '">' +
              '<span class="ar-no-cab"><code>' + esc(n.codigo) + '</code><i class="ar-pt" title="' + esc(SITUACAO[n.situacao]) + '"></i>' +
              (n.praticas.length ? '<small title="práticas">P' + n.praticas.length + '</small>' : '') + (n.museu.length ? '<small title="peças no museu">M' + n.museu.length + '</small>' : '') + '</span>' +
              '<b class="ar-no-t">' + realce(n.titulo) + '</b>' +
              (n.conceitos.length ? '<span class="ar-no-c">' + n.conceitos.map(function (c) { return '<span>' + realce(c) + '</span>'; }).join('') + '</span>' : '') + '</button>';
          }).join('') + '</div>';
      }).join('');
      requestAnimationFrame(fios);
    }

    function fios() {
      var g = $('.ar-grafo'), svg = g && g.querySelector('.ar-fios');
      if (!svg || vista !== 'mapa' || !g.offsetParent) return;
      var b0 = g.getBoundingClientRect();
      svg.setAttribute('width', g.scrollWidth); svg.setAttribute('height', g.scrollHeight);
      svg.setAttribute('viewBox', '0 0 ' + g.scrollWidth + ' ' + g.scrollHeight);
      var caixa = {};
      g.querySelectorAll('.ar-no').forEach(function (el) {
        var r = el.getBoundingClientRect();
        caixa[el.getAttribute('data-no')] = { x: r.left - b0.left, y: r.top - b0.top, w: r.width, h: r.height, col: el.parentElement };
      });
      var ante = sel ? cadeia(sel, 'pre') : {}, desc = sel ? cadeia(sel, 'abre') : {}, linhas = [];
      A.nos.forEach(function (n) {
        n.pre.forEach(function (p) {
          var a = caixa[p], b = caixa[n.codigo], d;
          if (!a || !b) return;
          if (a.col === b.col) {
            var x = a.x - 2, y1 = a.y + a.h / 2, y2 = b.y + b.h / 2, cv = Math.min(26, 10 + Math.abs(y2 - y1) / 14);
            d = 'M' + x + ' ' + y1 + ' C' + (x - cv) + ' ' + y1 + ' ' + (x - cv) + ' ' + y2 + ' ' + x + ' ' + y2;
          } else if (a.x < b.x) {
            var x1 = a.x + a.w, ya = a.y + Math.min(a.h / 2, 28), x2 = b.x, yb = b.y + Math.min(b.h / 2, 28), m = (x2 - x1) / 2;
            d = 'M' + x1 + ' ' + ya + ' C' + (x1 + m) + ' ' + ya + ' ' + (x2 - m) + ' ' + yb + ' ' + x2 + ' ' + yb;
          } else {
            var x3 = a.x, y3 = a.y + Math.min(a.h / 2, 28), x4 = b.x + b.w, y4 = b.y + Math.min(b.h / 2, 28), m2 = (x3 - x4) / 2;
            d = 'M' + x3 + ' ' + y3 + ' C' + (x3 - m2) + ' ' + y3 + ' ' + (x4 + m2) + ' ' + y4 + ' ' + x4 + ' ' + y4;
          }
          var quente = sel && ((p === sel || ante[p]) && (n.codigo === sel || ante[n.codigo]) || (p === sel || desc[p]) && (n.codigo === sel || desc[n.codigo]));
          linhas.push('<path d="' + d + '" class="' + (quente ? 'quente' : sel ? 'frio' : '') + '" marker-end="url(#ar-seta-' + (quente ? 'q' : 'n') + ')"/>');
        });
      });
      svg.innerHTML = '<defs><marker id="ar-seta-n" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L8 4L0 8z" class="ponta"/></marker>' +
        '<marker id="ar-seta-q" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L8 4L0 8z" class="ponta q"/></marker></defs>' + linhas.join('');
    }

    function chipNo(c) {
      var n = por[c];
      return '<button type="button" class="ar-chip ' + (n ? 's-' + n.situacao : '') + '" data-ir="' + esc(c) + '"><code>' + esc(c) + '</code>' + (n ? esc(n.titulo) : '') + '</button>';
    }

    /* o painel do estudo: três lentes sobre a mesma fonte (o estudo da Seleção) */
    function lenteResumo(n) {
      var bloco2 = function (t, h) { return h ? '<div class="ar-det-b"><p class="dmx-rot">' + t + '</p>' + h + '</div>' : ''; };
      var itens = n.itens.length ? '<ul class="ar-itens-l">' + n.itens.map(function (i) { return '<li class="' + (i.feito ? 'feito' : '') + '"><i aria-hidden="true"></i>' + esc(i.texto) + '<span class="sr">' + (i.feito ? ' (dominado)' : ' (a estudar)') + '</span></li>'; }).join('') + '</ul>'
        : '<p class="ar-suave">Nenhum item do Checklist está ligado a este estudo, por isso o progresso dele não é medido.</p>';
      return (n.frase ? '<div class="md ar-det-frase">' + bloco(n.frase) + '</div>' : '') +
        bloco2('Conceitos (de "O que se estuda")', n.conceitos.length ? '<ol class="ar-conc">' + n.conceitos.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ol>' : '') +
        bloco2('Vem de', n.pre.map(chipNo).join('')) + bloco2('Abre', n.abre.map(chipNo).join('')) + bloco2('Ao lado', n.lado.map(chipNo).join('')) +
        bloco2('Itens do Checklist', itens) +
        bloco2('No museu', n.museu.map(function (m) { return '<button type="button" class="ar-chip" data-sala="' + m.sala + '">' + esc(m.nome) + '</button>'; }).join('')) +
        bloco2('Práticas', n.praticas.map(function (p) { return '<button type="button" class="ar-chip" data-ir-pratica="' + esc(p.id) + '"><code>' + esc(p.id) + '</code>' + esc(p.titulo) + '</button>'; }).join('')) +
        bloco2('Pontes com outras áreas', n.fora.slice(0, 10).map(function (f) { return '<a class="ar-chip ' + P.corDe(f.materia) + '" href="' + esc(R.area(f.materia, 'n=' + f.codigo)) + '"><i class="q"></i><code>' + esc(f.codigo) + '</code>' + esc(f.titulo) + '</a>'; }).join(''));
    }
    function lenteTexto(n) {
      var t = textos[n.id];
      if (!t) {
        textos[n.id] = 'carregando';
        fetch('/api/ficha?id=' + encodeURIComponent(n.id)).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
          .then(function (f) { textos[n.id] = f && f.corpo ? f.corpo : 'erro'; if (vivo && sel === n.codigo && lente === 'texto') desenharDetalhe(); });
        return '<p class="ar-suave">Abrindo o estudo…</p>';
      }
      if (t === 'carregando') return '<p class="ar-suave">Abrindo o estudo…</p>';
      if (t === 'erro') return '<p class="ar-suave">Não consegui abrir o texto agora. ' + linkFicha(n.id, 'Abrir na Biblioteca', 'ar-link') + '.</p>';
      return '<p class="ar-suave ar-fonte">Este é o texto corrido do estudo, a fonte de tudo o que o mapa mostra. Para mudar o mapa, mude o estudo.</p>' +
        '<div class="md ar-texto">' + bloco(String(t).replace(/^\s*#\s[^\n]*\n/, '')) + '</div>';
    }
    function lentePapel(n) {
      return '<div class="ar-papel ar-papel-mini"><div class="ar-papel-n"><p class="ar-papel-t"><span class="ar-caixinha">' + (n.situacao === 'dominado' ? '✓' : '') + '</span><b>' + esc(n.codigo) + ' · ' + esc(n.titulo) + '</b></p>' +
        '<p class="ar-papel-l">' + (n.pre.length ? 'vem de ' + n.pre.join(', ') : 'ponto de partida') + (n.abre.length ? ' · abre ' + n.abre.join(', ') : '') + '</p>' +
        (n.conceitos.length ? '<ul>' + n.conceitos.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' : '') + '</div></div>' +
        '<p class="ar-suave">A caixa como ela entra na folha do mapa: copie-a e complete à mão com um exemplo seu para cada conceito.</p>';
    }

    function desenharDetalhe() {
      var el = $('.ar-detalhe'), n = sel && por[sel];
      if (!n) {
        el.innerHTML = '<div class="ar-det-vazio"><p class="dmx-rot">Como ler</p><ul>' +
          '<li>As colunas são as unidades, na ordem do curso. Dentro delas, de cima para baixo, vem o que depende de menos coisas.</li>' +
          '<li>A seta vai do pré-requisito ao estudo que ele abre.</li>' +
          '<li>O ponto colorido mostra o Checklist: cheio = dominado; meio = em parte; vazio = a estudar; tracejado = sem item ligado.</li>' +
          '<li>P e M contam as práticas e as peças do museu ligadas ao estudo.</li>' +
          '<li>Com o teclado: Tab passa pelas caixas; ← e → seguem o caminho de estudo; Esc limpa.</li></ul></div>';
        return;
      }
      var LENTES = [['resumo', 'Resumo'], ['texto', 'Texto corrido'], ['papel', 'Papel']];
      el.innerHTML = '<article aria-label="' + esc(n.codigo + ' ' + n.titulo) + '">' +
        '<p class="dmx-rot">' + esc(n.codigo) + ' · ' + esc(n.unidade) + ' · ' + esc(SITUACAO[n.situacao]) + '</p>' +
        '<h3 class="ar-det-t">' + esc(n.titulo) + '</h3>' +
        '<div class="ar-lentes" role="tablist" aria-label="Lentes">' + LENTES.map(function (l) { return '<button type="button" role="tab" data-lente="' + l[0] + '" aria-selected="' + (lente === l[0]) + '"' + (lente === l[0] ? ' class="on"' : '') + '>' + l[1] + '</button>'; }).join('') + '</div>' +
        '<div class="ar-lente" role="tabpanel">' + (lente === 'texto' ? lenteTexto(n) : lente === 'papel' ? lentePapel(n) : lenteResumo(n)) + '</div>' +
        '<p class="ar-det-acoes">' + linkFicha(n.id, 'Abrir o estudo' + (n.exercicios ? ' · ' + n.exercicios + ' exercícios com gabarito' : ''), 'dmx-bt') +
        '<button type="button" class="dmx-bt" data-limpar>Limpar</button></p></article>';
    }

    function selecionar(c, rolar) {
      sel = c && por[c] ? c : null;
      if (vista !== 'mapa') trocarVista('mapa');
      if (arranjo.fechados.mapa) { arranjo.fechados.mapa = false; salvarArranjo(); }
      desenharGrafo(); desenharDetalhe();
      aoMudar({ materia: nome, modulo: 'mapa', estudo: sel });
      if (sel && rolar) {
        var b = $('.ar-no[data-no="' + sel + '"]');
        if (b) { b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: mov() }); b.focus({ preventScroll: true }); }
        var sec = $('.ar-mod[data-mod="mapa"]'), t = sec.getBoundingClientRect().top;
        if (t < -40 || t > innerHeight * .6) sec.scrollIntoView({ block: 'start', behavior: mov() });
      }
    }

    function ir(mod) {
      var s = $('.ar-mod[data-mod="' + mod + '"]');
      if (!s) return;
      if (arranjo.fechados[mod]) { arranjo.fechados[mod] = false; salvarArranjo(); }
      s.scrollIntoView({ block: 'start', behavior: mov() });
      aoMudar({ materia: nome, modulo: mod, estudo: sel });
    }
    function irPratica(id) {
      ir('praticas');
      var p = $('[data-pratica-id="' + id + '"]');
      if (p) { p.scrollIntoView({ block: 'start', behavior: mov() }); p.classList.add('alvo'); setTimeout(function () { p.classList.remove('alvo'); }, 1600); }
    }

    /* ---------------- caminho e papel ---------------- */

    function desenharCaminho() {
      var etapas = {};
      A.caminho.forEach(function (c) { var n = por[c]; (etapas[n.nivel] = etapas[n.nivel] || []).push(n); });
      var html = '<p class="ar-suave">A ordem em que cada estudo já tem os seus pré-requisitos antes dele. Na mesma etapa, a ordem não importa.</p><ol class="ar-caminho">';
      Object.keys(etapas).sort(function (a, b) { return a - b; }).forEach(function (k) {
        html += '<li class="ar-etapa-l"><p class="dmx-rot">Etapa ' + (+k + 1) + '</p><ul>' + etapas[k].map(function (n) {
          return '<li class="s-' + n.situacao + (some(n) ? ' apagado' : '') + '"><i class="ar-pt" aria-hidden="true"></i><div><button type="button" class="ar-link" data-ir="' + esc(n.codigo) + '"><code>' + esc(n.codigo) + '</code> ' + realce(n.titulo) + '</button>' +
            '<span class="ar-suave"> · ' + esc(SITUACAO[n.situacao]) + (n.pre.length ? ' · depois de ' + n.pre.join(', ') : '') + '</span>' +
            (n.conceitos.length ? '<p class="ar-cam-c">' + n.conceitos.map(realce).join(' · ') + '</p>' : '') + '</div></li>';
        }).join('') + '</ul></li>';
      });
      $('.ar-v-caminho').innerHTML = html + '</ol>';
    }

    function svgPapel() {
      var W = 236, GAP = 46, M = 24, TOPO = 80, caixa = {}, partes = [], altura = 0;
      var cols = A.unidades.map(nosDa);
      cols.forEach(function (lista, ci) {
        var x = M + ci * (W + GAP), y = TOPO + 30;
        quebrar((ci + 1) + ' · ' + A.unidades[ci].nome, 28).slice(0, 2).forEach(function (t, k) { partes.push('<text x="' + x + '" y="' + (TOPO + 2 + k * 15) + '" class="u">' + esc(t) + '</text>'); });
        lista.forEach(function (n) {
          var tl = quebrar(n.titulo, 30).slice(0, 3), cl = n.conceitos.map(function (c) { return c.length > 38 ? c.slice(0, 37) + '…' : c; });
          var h = 22 + tl.length * 15 + cl.length * 13 + 8;
          caixa[n.codigo] = { x: x, y: y, h: h };
          partes.push('<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + h + '" rx="6" class="b"/>' +
            '<text x="' + (x + 10) + '" y="' + (y + 16) + '" class="c">' + esc(n.codigo) + (n.situacao === 'dominado' ? '  ✓' : '') + '</text>' +
            tl.map(function (t, i) { return '<text x="' + (x + 10) + '" y="' + (y + 33 + i * 15) + '" class="t">' + esc(t) + '</text>'; }).join('') +
            cl.map(function (t, i) { return '<text x="' + (x + 14) + '" y="' + (y + 33 + tl.length * 15 + i * 13) + '" class="k">· ' + esc(t) + '</text>'; }).join(''));
          y += h + 16;
        });
        altura = Math.max(altura, y);
      });
      var fiosP = [];
      A.nos.forEach(function (n) {
        n.pre.forEach(function (p) {
          var a = caixa[p], b = caixa[n.codigo], d;
          if (!a || !b) return;
          if (a.x === b.x) { var x = a.x - 2; d = 'M' + x + ' ' + (a.y + 14) + ' C' + (x - 18) + ' ' + (a.y + 14) + ' ' + (x - 18) + ' ' + (b.y + 14) + ' ' + x + ' ' + (b.y + 14); }
          else if (a.x < b.x) { var x1 = a.x + W, x2 = b.x, m = (x2 - x1) / 2; d = 'M' + x1 + ' ' + (a.y + 14) + ' C' + (x1 + m) + ' ' + (a.y + 14) + ' ' + (x2 - m) + ' ' + (b.y + 14) + ' ' + x2 + ' ' + (b.y + 14); }
          else { var x3 = a.x, x4 = b.x + W, m2 = (x3 - x4) / 2; d = 'M' + x3 + ' ' + (a.y + 14) + ' C' + (x3 - m2) + ' ' + (a.y + 14) + ' ' + (x4 + m2) + ' ' + (b.y + 14) + ' ' + x4 + ' ' + (b.y + 14); }
          fiosP.push('<path d="' + d + '" class="f" marker-end="url(#s)"/>');
        });
      });
      var largura = M * 2 + cols.length * W + (cols.length - 1) * GAP;
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + largura + ' ' + (altura + M) + '" width="' + largura + '" height="' + (altura + M) + '" font-family="Archivo, Arial, sans-serif">' +
        '<style>.b{fill:#fff;stroke:#222;stroke-width:1}.c{font:700 11px monospace;fill:#222}.t{font-weight:650;font-size:13px;fill:#111}.k{font-size:10.5px;fill:#444}.u{font-weight:700;font-size:13px;letter-spacing:.06em;text-transform:uppercase;fill:#111}.f{fill:none;stroke:#777;stroke-width:1.1}.h{font-weight:750;font-size:24px;fill:#111}.s{font-size:12px;fill:#555}</style>' +
        '<defs><marker id="s" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8z" fill="#777"/></marker></defs>' +
        '<rect width="100%" height="100%" fill="#fff"/>' +
        '<text x="' + M + '" y="36" class="h">Mapa ' + esc(daMateria(nome)) + '</text>' +
        '<text x="' + M + '" y="56" class="s">' + A.nos.length + ' estudos em ' + A.unidades.length + ' unidades. Seta: do pré-requisito ao que ele abre. ✓ = dominado no Checklist. Gerado pelo jadesun em ' + new Date().toLocaleDateString('pt-BR') + '.</text>' +
        fiosP.join('') + partes.join('') + '</svg>';
    }

    function papelHtml() {
      return '<div class="ar-papel"><header class="ar-papel-cab"><h2>Mapa ' + esc(daMateria(nome)) + '</h2><p>' + A.nos.length + ' estudos · ' + A.unidades.length + ' unidades · para copiar à mão: uma caixa por estudo, os conceitos dentro, as setas do que vem antes ao que vem depois.</p></header>' +
        '<figure class="ar-papel-fig">' + svgPapel() + '</figure>' +
        A.unidades.map(function (u, i) {
          return '<section class="ar-papel-u"><h3>' + (i + 1) + ' · ' + esc(u.nome) + '</h3>' + A.nos.filter(function (n) { return n.unidade === u.nome; }).map(function (n) {
            return '<div class="ar-papel-n"><p class="ar-papel-t"><span class="ar-caixinha">' + (n.situacao === 'dominado' ? '✓' : '') + '</span><b>' + esc(n.codigo) + ' · ' + esc(n.titulo) + '</b></p>' +
              '<p class="ar-papel-l">' + (n.pre.length ? 'vem de ' + n.pre.join(', ') : 'ponto de partida') + (n.abre.length ? ' · abre ' + n.abre.join(', ') : '') + (n.fora.length ? ' · pontes: ' + n.fora.slice(0, 5).map(function (f) { return f.codigo; }).join(', ') : '') + '</p>' +
              (n.conceitos.length ? '<ul>' + n.conceitos.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
          }).join('') + '</section>';
        }).join('') +
        '<section class="ar-papel-u"><h3>Caminho de estudo</h3><p class="ar-papel-l">' + A.caminho.join(' → ') + '</p></section></div>';
    }

    function textoMd() {
      var l = ['# Mapa ' + daMateria(nome), '', '> ' + A.nos.length + ' estudos em ' + A.unidades.length + ' unidades. Gerado pelo jadesun em ' + new Date().toLocaleDateString('pt-BR') + ', a partir dos estudos da Seleção.', ''];
      A.unidades.forEach(function (u, i) {
        l.push('## ' + (i + 1) + ' · ' + u.nome, '');
        A.nos.filter(function (n) { return n.unidade === u.nome; }).forEach(function (n) {
          l.push('- [' + (n.situacao === 'dominado' ? 'x' : ' ') + '] **' + n.codigo + ' · ' + n.titulo + '**' + (n.pre.length ? ' — vem de ' + n.pre.join(', ') : '') + (n.abre.length ? '; abre ' + n.abre.join(', ') : ''));
          n.conceitos.forEach(function (c) { l.push('    - ' + c); });
          if (n.fora.length) l.push('    - pontes: ' + n.fora.slice(0, 6).map(function (f) { return f.codigo + ' (' + f.materia + ')'; }).join(', '));
        });
        l.push('');
      });
      l.push('## Caminho de estudo', '', A.caminho.join(' → '), '');
      return l.join('\n');
    }

    function baixar(nomeArq, tipo, conteudo) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([conteudo], { type: tipo })); a.download = nomeArq;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }

    function trocarVista(v) {
      vista = v;
      ['mapa', 'caminho', 'papel'].forEach(function (k) {
        $('.ar-v-' + k).hidden = k !== v;
        var b = $('[data-vista="' + k + '"]'); b.classList.toggle('on', k === v); b.setAttribute('aria-pressed', k === v);
      });
      if (v === 'caminho') desenharCaminho();
      if (v === 'papel') $('.ar-v-papel').innerHTML = papelHtml();
      if (v === 'mapa') requestAnimationFrame(fios);
    }

    function legenda() {
      var c = { dominado: 0, parcial: 0, pendente: 0, 'sem-item': 0 };
      A.nos.forEach(function (n) { c[n.situacao]++; });
      $('.ar-legenda').innerHTML = Object.keys(c).map(function (k) { return '<span class="s-' + k + '"><i class="ar-pt"></i>' + esc(SITUACAO[k]) + ' <b>' + c[k] + '</b></span>'; }).join('');
    }

    /* ---------------- 2. museu ---------------- */

    var GAL_PASSO = 18, galMostra = GAL_PASSO, galFiltro = '';
    function desenharGaleria() {
      var lista = A.galeria.filter(function (x) { return !galFiltro || x.codigo === galFiltro; });
      $('.ar-galeria').innerHTML = lista.slice(0, galMostra).map(function (x) {
        return '<figure class="ar-gal-i"><img src="' + esc(x.src) + '" alt="' + esc(x.legenda) + '" loading="lazy" decoding="async">' +
          '<figcaption>' + (x.legenda ? '<span>' + esc(x.legenda.length > 160 ? x.legenda.slice(0, 157) + '…' : x.legenda) + '</span>' : '') +
          '<small>' + [x.autor, x.licenca].filter(Boolean).map(esc).join(' · ') + (x.fonte ? ' · <a href="' + esc(x.fonte) + '" rel="noopener" target="_blank">fonte</a>' : '') +
          ' · <button type="button" class="ar-link" data-ir="' + esc(x.codigo) + '">' + esc(x.codigo) + '</button></small></figcaption></figure>';
      }).join('');
      var mais = $('.ar-gal-mais');
      mais.hidden = lista.length <= galMostra;
      mais.textContent = 'Mostrar mais (' + (lista.length - galMostra) + ')';
    }

    function falta(arquivo, tipo) {
      return '<p class="ar-falta">Ainda não escrito: crie <code>3 Atlas…/0 Áreas/' + esc(nome) + ' — ' + arquivo + '.md</code> com <code>tipo: ' + tipo + '</code> (o formato está em "0 Como estas páginas funcionam").</p>';
    }

    function desenharMuseu() {
      var html = A.museu ? '<div class="ar-cartao">' + DM.abas('museu|' + nome, A.museu, { link: 'Abrir o museu na Biblioteca', onde: 'o arquivo mora no caderno, em Atlas › Áreas.' }) + '</div>' : falta('Museu', 'museu da matéria');
      var cods = {};
      A.galeria.forEach(function (x) { cods[x.codigo] = (cods[x.codigo] || 0) + 1; });
      html += '<div class="ar-gal-cab"><h3 class="ar-h3">Galeria dos estudos <small>' + A.galeria.length + ' imagens</small></h3>' +
        '<label class="ar-sel">Estudo <select class="ar-gal-filtro"><option value="">todos</option>' + Object.keys(cods).sort().map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + ' · ' + esc(por[c] ? por[c].titulo : '') + ' (' + cods[c] + ')</option>'; }).join('') + '</select></label></div>' +
        '<div class="ar-galeria"></div><p><button type="button" class="dmx-bt ar-gal-mais" hidden>Mostrar mais</button></p>';
      corpo('museu').innerHTML = html;
      desenharGaleria();
    }

    /* ---------------- 4. itens ---------------- */

    function desenharItens(estado) {
      var si = -1;
      (estado && estado.checklist || []).forEach(function (s, i) { if (s.nome === nome) si = i; });
      if (si < 0) { corpo('itens').innerHTML = '<p class="ar-falta">Não achei esta matéria no Checklist.</p>'; return; }
      var s = estado.checklist[si], estudoDe = {};
      A.nos.forEach(function (n) { n.itens.forEach(function (i) { (estudoDe[i.texto] = estudoDe[i.texto] || []).push(n.codigo); }); });
      var grupo = null, html = '<p class="ar-suave"><b>' + s.feitos + '/' + s.total + '</b> dominados. Marcar continua sendo no <a href="' + esc(R.domino('s' + si)) + '">Domino</a>, com a régua de sempre: resolveria uma questão disto sem abrir o cursinho.</p><ul class="ar-itens">';
      s.itens.forEach(function (it, ii) {
        if (it.grupo !== grupo) { grupo = it.grupo; if (grupo) html += '<li class="ar-itens-g">' + esc(grupo) + '</li>'; }
        html += '<li class="' + (it.feito ? 'feito' : '') + '"><i aria-hidden="true"></i><a href="' + esc(R.domino('i' + si + '-' + ii)) + '">' + esc(it.texto) + '</a><span class="sr">' + (it.feito ? ' (dominado)' : ' (a estudar)') + '</span>' +
          ((estudoDe[it.texto] || []).length ? '<span class="ar-itens-e">' + estudoDe[it.texto].map(function (c) { return '<button type="button" class="ar-link" data-ir="' + esc(c) + '">' + esc(c) + '</button>'; }).join(' ') + '</span>' : '<span class="ar-itens-e ar-suave">sem estudo</span>') + '</li>';
      });
      corpo('itens').innerHTML = html + '</ul>';
    }

    /* ---------------- 6. práticas ---------------- */

    function desenharPraticas() {
      var html = '';
      if (A.praticas) {
        var c = A.contas;
        html += '<div class="ar-barra" role="img" aria-label="' + c.praticasFeitas + ' de ' + c.praticas + ' práticas feitas"><i style="width:' + (c.praticas ? Math.round(100 * c.praticasFeitas / c.praticas) : 0) + '%"></i></div>' +
          (A.praticas.intro ? '<div class="md ar-intro">' + bloco(A.praticas.intro) + '</div>' : '');
        A.praticas.niveis.forEach(function (nv) {
          html += '<div class="ar-nivel"><h3 class="ar-h3">' + esc(nv.nome) + '</h3>' + (nv.intro ? '<div class="md ar-suave">' + bloco(nv.intro) + '</div>' : '') +
            nv.praticas.map(function (p) {
              return '<article class="ar-pratica' + (p.feita ? ' feita' : '') + '" data-pratica-id="' + esc(p.id) + '"' + (op.ids !== false ? ' id="p-' + esc(p.id) + '"' : '') + '>' +
                '<header><label class="ar-feita"><input type="checkbox" data-pratica="' + esc(p.id) + '"' + (p.feita ? ' checked' : '') + '><span>' + (p.feita ? 'feita em ' + esc(p.feita) : 'feita?') + '</span></label>' +
                '<p class="dmx-rot">' + esc(p.id) + '</p><h4>' + esc(p.titulo) + '</h4>' +
                (p.liga.length ? '<p class="ar-liga">' + p.liga.map(function (cd) { return '<button type="button" class="ar-link" data-ir="' + esc(cd) + '">' + esc(cd) + '</button>'; }).join(' ') + '</p>' : '') + '</header>' +
                '<div class="md">' + bloco(p.md) + '</div>' +
                (p.resposta ? '<details class="ar-resp"><summary>' + esc(p.rotuloResposta) + '</summary><div class="md">' + bloco(p.resposta) + '</div></details>' : '') + '</article>';
            }).join('') + '</div>';
        });
      } else html += falta('Práticas', 'práticas da matéria');
      var comEx = A.nos.filter(function (n) { return n.exercicios; });
      html += '<details class="ar-mais"><summary>Os exercícios com gabarito que já estão nos estudos <small>' + A.contas.exercicios + ' em ' + comEx.length + ' estudos</small></summary><ul class="ar-ex">' +
        comEx.map(function (n) { return '<li>' + linkFicha(n.id, '<code>' + esc(n.codigo) + '</code> ' + esc(n.titulo)) + ' <span class="ar-suave">' + n.exercicios + '</span></li>'; }).join('') + '</ul></details>';
      corpo('praticas').innerHTML = html;
    }

    function marcarPratica(caixa) {
      var id = caixa.getAttribute('data-pratica'), feita = caixa.checked;
      caixa.disabled = true;
      fetch('/api/areas/pratica', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify({ materia: nome, id: id, feita: feita }) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.erro || 'Não consegui gravar.'); return j; }); })
        .then(function (j) {
          A.contas.praticasFeitas = 0;
          A.praticas.niveis.forEach(function (nv) { nv.praticas.forEach(function (p) { if (p.id === id) p.feita = j.feita; if (p.feita) A.contas.praticasFeitas++; }); });
          desenharPraticas(); desenharTopo();
          var de = $('[data-pratica="' + id + '"]'); if (de) de.focus({ preventScroll: true });
        })
        .catch(function (e) { caixa.checked = !feita; caixa.disabled = false; var s = caixa.nextElementSibling; if (s) s.textContent = e.message; });
    }

    /* ---------------- 7. horizonte ---------------- */

    function desenharHorizonte() {
      var html = A.horizonte ? '<div class="ar-cartao">' + DM.abas('horizonte|' + nome, A.horizonte, { link: 'Abrir o horizonte na Biblioteca', onde: 'o arquivo mora no caderno, em Atlas › Áreas.' }) + '</div>' : falta('Horizonte', 'horizonte da matéria');
      if (A.pontes.length) {
        html += '<h3 class="ar-h3">Pontes com as outras áreas <small>contadas nos elos dos estudos</small></h3><div class="ar-pontes">' + A.pontes.map(function (p) {
          return '<div class="ar-ponte ' + P.corDe(p.materia) + '"><p class="ar-ponte-t"><a href="' + esc(R.area(p.materia)) + '"><i class="q"></i>' + esc(p.materia) + '</a> <small>' + p.total + ' elos</small></p><ul>' +
            p.pares.slice(0, 5).map(function (x) { return '<li><button type="button" class="ar-link" data-ir="' + esc(x.de) + '">' + esc(x.de) + '</button> → <a href="' + esc(R.area(p.materia, 'n=' + x.para)) + '">' + esc(x.para) + ' · ' + esc(x.paraTitulo) + '</a></li>'; }).join('') + '</ul></div>';
        }).join('') + '</div>';
      }
      if (A.mundo.length) {
        html += '<details class="ar-mais"><summary>Onde cada estudo vive no mundo real <small>' + A.mundo.length + ' estudos</small></summary>' + A.mundo.map(function (m) {
          return '<details class="ar-sub"><summary><code>' + esc(m.codigo) + '</code> ' + esc(por[m.codigo] ? por[m.codigo].titulo : m.titulo) + '</summary><div class="md">' + bloco(m.md) + '</div></details>';
        }).join('') + '</details>';
      }
      if (A.leituras.length) {
        html += '<details class="ar-mais"><summary>Leituras acadêmicas, estudo por estudo <small>das Fontes de cada estudo</small></summary><ul class="ar-leit">' + A.leituras.map(function (l) {
          return '<li><button type="button" class="ar-link" data-ir="' + esc(l.codigo) + '">' + esc(l.codigo) + '</button> <span class="md">' + inl(l.md) + '</span></li>';
        }).join('') + '</ul></details>';
      }
      corpo('horizonte').innerHTML = html;
    }

    /* ---------------- eventos (todos presos à raiz) ---------------- */

    function aoClicar(ev) {
      var t = ev.target, b;
      if ((b = t.closest('.ar-no'))) { var c = b.getAttribute('data-no'); selecionar(sel === c ? null : c, false); return; }
      if ((b = t.closest('[data-ir]'))) { ev.preventDefault(); selecionar(b.getAttribute('data-ir'), true); return; }
      if ((b = t.closest('[data-ir-pratica]'))) { irPratica(b.getAttribute('data-ir-pratica')); return; }
      if ((b = t.closest('[data-ir-mod]'))) { ir(b.getAttribute('data-ir-mod')); return; }
      if ((b = t.closest('button[data-layout]'))) { arranjo.layout = b.getAttribute('data-layout'); salvarArranjo(); return; }
      if ((b = t.closest('[data-fechar]'))) { var m = b.closest('.ar-mod').getAttribute('data-mod'); arranjo.fechados[m] = !arranjo.fechados[m]; salvarArranjo(); return; }
      if ((b = t.closest('[data-largo]'))) { var m2 = b.closest('.ar-mod').getAttribute('data-mod'); arranjo.largos[m2] = !arranjo.largos[m2]; salvarArranjo(); return; }
      if ((b = t.closest('[data-lente]'))) { lente = b.getAttribute('data-lente'); desenharDetalhe(); var nb = $('[data-lente="' + lente + '"]'); if (nb) nb.focus(); return; }
      if (t.closest('[data-limpar]')) { var era = sel; selecionar(null); var x = era && $('.ar-no[data-no="' + era + '"]'); if (x) x.focus(); return; }
      if ((b = t.closest('[data-vista]'))) { trocarVista(b.getAttribute('data-vista')); return; }
      if ((b = t.closest('[data-sala]'))) {
        ir('museu');
        var aba = $('[data-dmx-host^="museu|"] [data-dmx-aba="' + b.getAttribute('data-sala') + '"]');
        if (aba) aba.click();
        return;
      }
      if (t.closest('.ar-gal-mais')) { galMostra += GAL_PASSO * 2; desenharGaleria(); return; }
      if ((b = t.closest('[data-acao]'))) {
        var a = b.getAttribute('data-acao');
        if (a === 'imprimir') {
          $('.ar-impressao').innerHTML = papelHtml();
          document.body.classList.add('ar-imprimindo');
          setTimeout(function () { window.print(); }, 50);
        } else if (a === 'md') baixar('Mapa ' + daMateria(nome) + '.md', 'text/markdown;charset=utf-8', textoMd());
        else if (a === 'svg') baixar('Mapa ' + daMateria(nome) + '.svg', 'image/svg+xml;charset=utf-8', svgPapel());
      }
    }
    function aoMudarCampo(ev) {
      var t = ev.target;
      if (t.classList.contains('ar-falta-in')) { soFalta = t.checked; desenharGrafo(); if (vista === 'caminho') desenharCaminho(); }
      if (t.classList.contains('ar-gal-filtro')) { galFiltro = t.value; galMostra = GAL_PASSO; desenharGaleria(); }
      if (t.matches && t.matches('[data-pratica]')) marcarPratica(t);
    }
    var tBusca = null;
    function aoDigitar(ev) {
      if (!ev.target.classList.contains('ar-busca-in')) return;
      clearTimeout(tBusca);
      tBusca = setTimeout(function () { busca = norm(ev.target.value); desenharGrafo(); if (vista === 'caminho') desenharCaminho(); }, 120);
    }
    function aoTeclar(ev) {
      var b = ev.target.closest && ev.target.closest('.ar-no');
      if (b && (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft')) {
        ev.preventDefault();
        var i = A.caminho.indexOf(b.getAttribute('data-no'));
        selecionar(A.caminho[Math.max(0, Math.min(A.caminho.length - 1, i + (ev.key === 'ArrowRight' ? 1 : -1)))], true);
      } else if (ev.key === 'Escape' && sel) {
        var era = sel; selecionar(null); var x = $('.ar-no[data-no="' + era + '"]'); if (x) x.focus();
      }
    }
    function depoisDeImprimir() { document.body.classList.remove('ar-imprimindo'); var i = $('.ar-impressao'); if (i) i.innerHTML = ''; }

    raiz.addEventListener('click', aoClicar);
    raiz.addEventListener('change', aoMudarCampo);
    raiz.addEventListener('input', aoDigitar);
    raiz.addEventListener('keydown', aoTeclar);
    window.addEventListener('afterprint', depoisDeImprimir);
    var obs = window.ResizeObserver ? new ResizeObserver(function () { requestAnimationFrame(fios); }) : null;
    if (obs) obs.observe($('.ar-grafo'));
    aplicarArranjo();

    /* ---------------- dados ---------------- */

    var pronto = Promise.all([
      fetch(fonte(nome)).then(function (r) { return r.ok ? r.json() : null; }),
      P.estado().catch(function () { return null; }),
    ]).then(function (r) {
      A = r[0] && r[0].materias && r[0].materias[nome];
      if (!A || !vivo) throw new Error('sem dados');
      A.nos.forEach(function (n) { por[n.codigo] = n; });
      desenharTopo(); legenda(); desenharGrafo(); desenharDetalhe(); desenharMuseu();
      corpo('tabua').innerHTML = A.tem.tabua ? '<div class="ar-dmx"><div class="dmx-antes" data-mat="' + esc(nome) + '"></div></div>' : '<p class="ar-falta">Esta área ainda não tem Tábua.</p>';
      corpo('obras').innerHTML = A.tem.obras ? '<div class="ar-dmx"><div class="dmx-depois" data-mat="' + esc(nome) + '"></div></div>' : '<p class="ar-falta">Esta área ainda não tem Grandes Obras.</p>';
      if (DM) DM.preencher(raiz, { semPercurso: true });
      desenharItens(r[1]); desenharPraticas(); desenharHorizonte();
      if (op.estudo) selecionar(op.estudo, true);
    }).catch(function () {
      if (!vivo) return;
      $('.ar-grafo').innerHTML = '<div class="cx"><p class="rot">Servidor desligado</p><p>Abra <b>hoje.bat</b> e deixe a janelinha preta aberta.</p></div>';
    });

    return {
      pronto: pronto,
      ir: ir,
      selecionar: function (c) { selecionar(c, true); },
      irPratica: irPratica,
      destruir: function () {
        vivo = false;
        raiz.removeEventListener('click', aoClicar); raiz.removeEventListener('change', aoMudarCampo);
        raiz.removeEventListener('input', aoDigitar); raiz.removeEventListener('keydown', aoTeclar);
        window.removeEventListener('afterprint', depoisDeImprimir);
        if (obs) obs.disconnect();
        raiz.innerHTML = ''; raiz.classList.remove('ar-app');
      },
    };
  }

  window.Area = { montar: montar, materias: ORDEM.slice(), modulos: MODULOS.map(function (m) { return m[0]; }) };
})();
