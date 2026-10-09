(function () {
  'use strict';

  /* ?embutido=1: a página está dentro de uma folha da Casa (o Atlas no quadro, o Eu no porta-retrato,
     o Agora na escrivaninha). A casca (menu de cima e de baixo) some: quem navega é a casa. */
  var EMBUTIDO = /[?&]embutido=1/.test(location.search) && window.top !== window;
  if (EMBUTIDO) {
    document.documentElement.classList.add('embutido');
    var estiloEmbutido = document.createElement('style');
    estiloEmbutido.textContent = 'html.embutido .trilho,html.embutido nav.abas,html.embutido .pers-fab,html.embutido #faixa,html.embutido .faixa{display:none!important}' +
      'html.embutido body{padding-top:0!important;padding-bottom:0!important;background-attachment:scroll}html.embutido .miolo{padding-top:18px!important}';
    (document.head || document.documentElement).appendChild(estiloEmbutido);
  }

  /* Domino saiu daqui em 22/set/2026: virou aba de dentro do Eu (ver PERFIL.md, seção 10),
     não mais página-irmã. O arquivo domino.html continua existindo e funcionando sozinho
     (só somar, nunca apagar), só não aparece mais navegação — por pedido direto do dono
     ("remova a aba domínio geral"). */
  /* 08/out/2026 (PERFIL.md item 72): quatro portas. O Atlas é a casa de entrada (o mundo e o planeta);
     o Hoje junta toda a organização pessoal (Agora, Meu dia, prazos, domínio, objetivos); o Eu é a
     sua ficha de pessoa, para compartilhar; a Casa reúne a casa e o jardim em 3D. As páginas antigas
     continuam abrindo pelo endereço: só a navegação mudou. */
  /* 09/out/2026 (item 74): a quinta porta, o Manifesto — o quadrado de Malevich, os manifestos da humanidade
     e a filosofia (local-first). O Atlas ganha os Guias e a Curadoria; o Eu, a Conta. */
  var PERGUNTAS = [
    ['atlas', 'atlas.html', 'Atlas', 'O mundo, o planeta, os guias e a curadoria'],
    ['agora', 'hoje.html', 'Hoje', 'Tudo o que é seu para hoje, num lugar só'],
    ['eu', 'eu.html', 'Eu', 'A sua ficha de pessoa, para compartilhar'],
    ['casa', 'casa.html', 'Casa', 'A casa e o jardim, em 3D'],
    ['manifesto', 'manifesto.html', 'Manifesto', 'O Portal Solar: o manifesto, os da humanidade e a filosofia'],
  ];

  var MAIS = [];

  /* o site público (lançamento, 09/out/2026, item 77): seis portas, as mesmas no alto e nas abas do celular.
     O Início explica o que é e leva a tudo; os Dados ficam ao lado (no celular, pelo Início) */
  var PUB_PERGUNTAS = [
    ['atlas', 'atlas.html', 'Início', 'O que é, a linha das revoluções e por onde começar'],
    ['biblioteca', 'biblioteca.html', 'Fichas', 'Tudo o que existe, em fichas'],
    ['quando', 'linha-do-tempo.html', 'Quando', 'Quando e quem?'],
    ['guias', 'guias.html', 'Guias', 'O mundo agora, os livros e as necessidades'],
    ['curadoria', 'curadoria.html', 'Curadoria', 'Toda escolha assinada'],
    ['manifesto', 'manifesto.html', 'Manifesto', 'O porquê: o manifesto, os da humanidade e a filosofia'],
  ];
  var PUB_MAIS = [['dados', 'dados.html', 'Dados', 'Os dados da Terra']];

  /* páginas que moram dentro de outra: aparecem marcadas na página-mãe.
     "copiar" mudou de família: o Domino de quem ela copiava agora mora dentro do Eu. */
  var FAMILIA = { biblioteca: 'atlas', quando: 'atlas', falta: 'atlas', museus: 'atlas', sistema: 'atlas', guias: 'atlas', curadoria: 'atlas', dados: 'atlas', copiar: 'agora', domino: 'agora', area: 'agora', li: 'eu', vitrine: 'eu', entrar: 'eu', jardim: 'casa', estante: 'casa', 'guarda-roupa': 'casa', manifestos: 'manifesto', filosofia: 'manifesto' };
  var SUBNAV_ATLAS = [
    ['atlas', 'atlas.html', 'Início', 'O mundo e o planeta'],
    ['guias', 'guias.html', 'Guias', 'Ler o mundo, agora'],
    ['curadoria', 'curadoria.html', 'Curadoria', 'Quem escolhe, e por quê'],
    ['biblioteca', 'biblioteca.html', 'Fichas', 'O que existe?'],
    ['dados', 'dados.html', 'Dados', 'O mundo em números'],
    ['quando', 'linha-do-tempo.html', 'Quando', 'Quando e quem?'],
    ['falta', 'falta.html', 'Falta', 'O que falta?'],
    ['museus', 'museus.html', 'Museus', 'Onde está o mundo guardado?'],
  ];

  var FAIXA = [
    'Um centro, um passo por dia',
    'A ideia não foge — o dia é que foge',
    'Sem julgar: só contar',
    'A prova pergunta. O cursinho responde',
    'Teste antes de estudar',
    'Um tijolo sólido por dia',
    'Cinco horas com prova na mão',
  ];

  var ICONES = {
    agora: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
    domino: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
    biblioteca: '<path d="M3.5 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2h-6z"/><path d="M20.5 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"/>',
    eu: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c0-3.9 3.4-6 7.5-6s7.5 2.1 7.5 6"/>',
    voltar: '<path d="M9 14 4 9l5-5"/><path d="M4 9h9.5a6 6 0 0 1 0 12H8"/>',
    coracao: '<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/>',
    baralho: '<rect x="3.5" y="6.5" width="12" height="14" rx="2"/><path d="M8 3.5h10.5a2 2 0 0 1 2 2V17"/>',
    jardim: '<path d="M12 21v-9"/><path d="M12 12c-3.6 0-5.4-2.2-5.4-5.4 3.6 0 5.4 2 5.4 5.4z"/><path d="M12 15.5c3.4 0 5.2-2 5.2-5-3.4 0-5.2 1.8-5.2 5z"/><path d="M6 21h12"/>',
    atlas: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.1-3.6-8.5S9.6 5.8 12 3.5z"/>',
    quando: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    sobre: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.01"/>',
    mais: '<circle cx="5.5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.5" cy="12" r="1.5"/>',
    pers: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9M4 12h13M21 12h-1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/><circle cx="19" cy="12" r="0.01"/>',
    protetor: '<rect x="2.5" y="4.5" width="19" height="13" rx="2"/><path d="M8 20.5h8M12 17.5v3"/><circle cx="12" cy="11" r="2.3"/><path d="M9.2 8.8c.9-1 1.9-1 2.8 0s1.9 1 2.8 0"/>',
    estante: '<path d="M4 4v16"/><path d="M9.3 4v16"/><path d="M14.6 6.5v13.5"/><path d="M19.5 4v16"/><path d="M3 20h18"/>',
    casa: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
    tudo: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/><path d="M8.5 11h5M11 8.5v5"/>',
  };
  /* 08/out/2026 (item 73): os ícones vêm do sistema novo (icones.js: grade de 24, só 0°/45°/90° e arcos);
     o mapa antigo fica como reserva, se o icones.js faltar */
  function icone(nome) {
    if (window.Icones) return window.Icones.svg(nome);
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONES[nome] || '') + '</svg>';
  }

  var cache = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function corDe(nome) {
    var n = String(nome).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    var mapa = [['lingu', 'lin'], ['hist', 'his'], ['geog', 'geo'], ['quim', 'qui'], ['biol', 'bio'],
                ['mat', 'mat'], ['fis', 'fis'], ['filos', 'fil'], ['socio', 'soc']];
    for (var i = 0; i < mapa.length; i++) if (n.indexOf(mapa[i][0]) === 0) return mapa[i][1];
    return 'ing';
  }

  var pendente = null;

  function estado(forcar) {
    if (cache && !forcar) return Promise.resolve(cache);
    if (pendente) return pendente;
    pendente = fetch('/api/estado', { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('O servidor respondeu ' + r.status);
      return r.json();
    }).then(function (e) { cache = e; pendente = null; return e; }, function (erro) { pendente = null; throw erro; });
    return pendente;
  }

  function marcar(secao, texto, feito) {
    return fetch('/api/marcar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' },
      body: JSON.stringify({ secao: secao, texto: texto, feito: feito }),
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.erro || 'Não foi possível marcar.');
        cache = j.estado;
        window.dispatchEvent(new CustomEvent('perfil:estado', { detail: j.estado }));
        return j.estado;
      });
    });
  }

  function contagem(e) {
    var p = e.contagem.inicio.split('-');
    var inicio = new Date(+p[0], +p[1] - 1, +p[2]);
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    var dia = Math.round((hoje - inicio) / 86400000) + 1;
    var total = e.contagem.dias;
    return { dia: dia, total: total, faltam: Math.max(0, total - dia), fase: dia < 1 ? 'antes' : dia > total ? 'depois' : 'dentro' };
  }

  function dataExtenso() {
    var t = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  /* ---------- preferências (Personalizar) ---------- */
  var TEMAS = [
    ['auto', 'Automático', '#F4F0E4', '#0F0E0B'],
    ['claro', 'Papel', '#F4F0E4', '#1C1B17'],
    ['escuro', 'Escuro', '#0F0E0B', '#ECE6D3'],
    ['pb-claro', 'Preto no branco', '#FFFFFF', '#000000'],
    ['pb-escuro', 'Branco no preto', '#000000', '#FFFFFF'],
    ['sepia', 'Sépia', '#F1E7D0', '#2E2416'],
    ['azul-noite', 'Azul noite', '#0A1020', '#E4EAF7'],
    ['floresta', 'Floresta', '#0C1510', '#E3EFDF'],
  ];
  var CORES = [
    ['tema', 'Do tema', null], ['vermelho', 'Vermelho', '#FF3B1D'], ['laranja', 'Laranja', '#FF7A00'], ['amarelo', 'Amarelo', '#FFC21A'],
    ['verde', 'Verde', '#2FBF71'], ['ciano', 'Ciano', '#16C6D6'], ['azul', 'Azul', '#3D74FF'], ['roxo', 'Roxo', '#9B6BFF'], ['rosa', 'Rosa', '#FF4FA3'],
  ];
  var PRESETS = [
    ['calmo', 'Calmo', 'Sem movimento. Só leitura.'],
    ['fino', 'Fino', 'Rolagem suave e transições leves.'],
    ['imersivo', 'Imersivo', 'Jardim, partículas, cursor luminoso.'],
  ];
  var GRUPOS = [
    ['Movimento', [
      ['rolagem', 'Rolagem', [['suave', 'Suave'], ['normal', 'Normal']]],
      ['anima', 'Animações', [['off', 'Nenhuma'], ['suave', 'Suaves'], ['imersivo', 'Imersivas']]],
      ['cursor', 'Cursor luminoso', [['on', 'Ligado'], ['off', 'Desligado']]],
      ['polen', 'Partículas de fundo', [['on', 'Ligadas'], ['off', 'Desligadas']]],
    ]],
    ['Leitura', [
      ['tam', 'Tamanho do texto', [['p', 'Pequeno'], ['m', 'Normal'], ['g', 'Grande'], ['xg', 'Enorme']]],
      ['fonte', 'Letra do texto', [['serifa', 'Serifada'], ['sem', 'Sem serifa'], ['mono', 'Mono'], ['sistema', 'Do sistema']]],
      ['dens', 'Espaçamento', [['c', 'Compacto'], ['n', 'Normal'], ['a', 'Amplo']]],
      ['img', 'Imagens', [['pb', 'Preto e branco'], ['cor', 'Coloridas']]],
    ]],
    ['Estilo', [
      ['marca', 'A marca: o quadrado de Malevich', [['auto', 'Negro (branco no escuro)'], ['vermelho', 'Vermelho (1915)'], ['branco', 'Branco sobre branco (1918)'], ['sol', 'Da cor do sol'], ['jade', 'Jade']]],
      ['estilo', 'Aparência', [['fino', 'Fino'], ['classico', 'Clássico']]],
      ['acabamento', 'Acabamento do Fino', [['solar', 'Solar (jade, sol e o céu de agora)'], ['almanaque', 'Almanaque (papel e fios)'], ['casa', 'Casa (vidro quente, como o 3D)'], ['simples', 'Simples']]],
      ['faixa', 'Faixa de frases no topo', [['on', 'Ligada'], ['off', 'Desligada']]],
      ['ruido', 'Textura de papel', [['on', 'Ligada'], ['off', 'Desligada']]],
    ]],
  ];

  function persAtual() { return window.PersTema ? window.PersTema.salvo() : {}; }
  function ehFino() { return persAtual().estilo !== 'classico'; }

  function persMudar(chave, valor) {
    if (!window.PersTema) return;
    var o = window.PersTema.salvo();
    o[chave] = valor;
    window.PersTema.gravar(o);
    if (chave === 'estilo') { location.reload(); return; }
    window.PersTema.aplicar(window.PersTema.efetivo());
    pintarPers();
    var bt = document.getElementById('b-tema');
    if (bt) bt.textContent = 'Tema: ' + nomeTema(o.tema);
  }

  function persPreset(nome) {
    var o = window.PersTema.salvo();
    var p = window.PersTema.presets[nome];
    Object.keys(p).forEach(function (k) { o[k] = p[k]; });
    window.PersTema.gravar(o);
    window.PersTema.aplicar(window.PersTema.efetivo());
    pintarPers();
  }

  function nomeTema(id) {
    for (var i = 0; i < TEMAS.length; i++) if (TEMAS[i][0] === id) return TEMAS[i][1];
    return id;
  }

  function alternarTema() {
    var atual = persAtual().tema || 'auto';
    var i = 0;
    for (var k = 0; k < TEMAS.length; k++) if (TEMAS[k][0] === atual) i = k;
    persMudar('tema', TEMAS[(i + 1) % TEMAS.length][0]);
  }

  function pintarPers() {
    var painel = document.getElementById('pers');
    if (!painel) return;
    var o = persAtual();
    painel.querySelectorAll('[data-k]').forEach(function (b) {
      b.setAttribute('aria-pressed', o[b.getAttribute('data-k')] === b.getAttribute('data-v') ? 'true' : 'false');
    });
    painel.querySelectorAll('[data-preset]').forEach(function (b) {
      var p = window.PersTema.presets[b.getAttribute('data-preset')];
      var igual = Object.keys(p).every(function (k) { return o[k] === p[k]; });
      b.setAttribute('aria-pressed', igual ? 'true' : 'false');
    });
    var g = painel.querySelector('[data-grade]');
    if (g) g.setAttribute('aria-pressed', document.body.classList.contains('ver-grade') ? 'true' : 'false');
  }

  function montarPers() {
    if (document.getElementById('pers')) return;
    var p = document.createElement('div');
    p.id = 'pers';
    p.className = 'pers';
    p.hidden = true;
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', 'Personalizar');
    p.setAttribute('data-lenis-prevent', '');
    var html = '<header><b>Personalizar</b><button type="button" class="pers-x" id="pers-x" aria-label="Fechar">×</button></header>' +
      '<section><p class="rot">Atalhos</p><div class="presets">' + PRESETS.map(function (x) {
        return '<button type="button" class="preset" data-preset="' + x[0] + '"><b>' + x[1] + '</b><span>' + x[2] + '</span></button>';
      }).join('') + '</div></section>' +
      '<section><p class="rot">Tema</p><div class="opts">' + TEMAS.map(function (t) {
        return '<button type="button" class="opt tema" data-k="tema" data-v="' + t[0] + '"><i style="--a:' + t[2] + ';--b:' + t[3] + '"></i>' + t[1] + '</button>';
      }).join('') + '</div></section>' +
      '<section><p class="rot">Cor de destaque</p><div class="opts">' + CORES.map(function (c) {
        return '<button type="button" class="sw' + (c[2] ? '' : ' padrao') + '" data-k="cor" data-v="' + c[0] + '" title="' + c[1] + '" aria-label="' + c[1] + '"' + (c[2] ? ' style="--sw:' + c[2] + '"' : '') + '></button>';
      }).join('') + '</div><p class="nota">Nos temas em preto e branco o destaque é sempre cinza.</p></section>' +
      GRUPOS.map(function (bloco) {
        return '<div class="pers-bloco"><h3 class="h3">' + bloco[0] + '</h3>' + bloco[1].map(function (g) {
          return '<section><p class="rot">' + g[1] + '</p><div class="opts">' + g[2].map(function (v) {
            return '<button type="button" class="opt" data-k="' + g[0] + '" data-v="' + v[0] + '">' + v[1] + '</button>';
          }).join('') + '</div></section>';
        }).join('') + '</div>';
      }).join('') +
      (window.JADESUN_ESTATICO ? '' : '<section><p class="rot">Levar comigo</p><div class="opts"><a class="opt" href="celular.html">Usar no celular ou tablet</a></div><p class="nota">Abra o celular.bat no computador. Para publicar ou ler offline, use o exportar.bat.</p></section>') +
      '<section><p class="rot">Contemplar</p><div class="opts"><a class="opt" href="protetor.html">Protetor de tela</a></div><p class="nota">Arte generativa, matemática explicada, e o lugar no cosmos.</p></section>' +
      '<section><p class="rot">Grade de colunas</p><div class="opts"><button type="button" class="opt" data-grade="1">Mostrar grade (tecla g)</button></div></section>' +
      '<section><button type="button" class="opt" id="pers-zera">Restaurar o padrão</button><p class="nota">Suas escolhas ficam guardadas neste navegador. Rolagem suave: biblioteca Lenis (MIT).</p></section>';
    p.innerHTML = html;
    document.body.appendChild(p);
    p.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.id === 'pers-x') return fecharPers();
      if (b.id === 'pers-zera') {
        var estilo = persAtual().estilo;
        window.PersTema.gravar(window.PersTema.padrao);
        window.PersTema.aplicar(window.PersTema.efetivo());
        document.body.classList.remove('ver-grade');
        pintarPers();
        var bt = document.getElementById('b-tema');
        if (bt) bt.textContent = 'Tema: ' + nomeTema('auto');
        if (estilo !== window.PersTema.padrao.estilo) location.reload();
        return;
      }
      if (b.hasAttribute('data-preset')) return persPreset(b.getAttribute('data-preset'));
      if (b.hasAttribute('data-grade')) { document.body.classList.toggle('ver-grade'); return pintarPers(); }
      if (b.hasAttribute('data-k')) persMudar(b.getAttribute('data-k'), b.getAttribute('data-v'));
    });
    pintarPers();
  }

  function abrirPers() { montarPers(); var p = document.getElementById('pers'); p.hidden = false; pintarPers(); document.getElementById('pers-x').focus(); }
  function fecharPers() { var p = document.getElementById('pers'); if (p) p.hidden = true; }

  /* ---------- painel "Meu dia", aberto a partir do selo Dia X/N da barra ---------- */
  function montarDiaPainel() {
    if (document.getElementById('dia-painel')) return;
    var p = document.createElement('div');
    p.id = 'dia-painel';
    p.className = 'pers';
    p.hidden = true;
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', 'Meu dia');
    p.setAttribute('data-lenis-prevent', '');
    p.innerHTML = '<header><b>Meu dia</b><button type="button" class="pers-x" id="dia-x" aria-label="Fechar">×</button></header><div id="dia-corpo"><p class="rot">Carregando…</p></div>';
    document.body.appendChild(p);
    p.addEventListener('click', function (ev) { if (ev.target.id === 'dia-x') fecharDiaPainel(); });
  }
  function abrirDiaPainel() {
    montarDiaPainel();
    var p = document.getElementById('dia-painel');
    p.hidden = false;
    var b = document.getElementById('tb-dia');
    if (b) b.setAttribute('aria-expanded', 'true');
    estado().then(function (e) {
      var corpo = document.getElementById('dia-corpo');
      if (!corpo) return;
      var outras = (e.tarefas || []).slice(1);
      if (!window.MeuDia) { corpo.innerHTML = '<p class="rot">Sem tarefas extras hoje.</p>'; return; }
      var html = window.MeuDia.html(outras);
      corpo.innerHTML = html || '<p class="rot">Nada além do bloco principal hoje — só ele já vale o dia.</p>';
      window.MeuDia.ligar(corpo);
    }).catch(function () { var corpo = document.getElementById('dia-corpo'); if (corpo) corpo.innerHTML = '<p class="rot">Servidor desligado.</p>'; });
    document.getElementById('dia-x').focus();
  }
  function fecharDiaPainel() {
    var p = document.getElementById('dia-painel');
    if (p) p.hidden = true;
    var b = document.getElementById('tb-dia');
    if (b) b.setAttribute('aria-expanded', 'false');
  }

  /* ---------- casca: barra superior (fino) ou painel lateral (clássico) ---------- */
  function estatico() { return window.JADESUN_ESTATICO || null; }
  function ehPublico() { var e = estatico(); return !!e && e.modo === 'publico'; }
  function permitida(id) { var e = estatico(); return !e || !e.paginas || e.paginas.indexOf(id) >= 0; }

  function paiDe(pagina) { return ehPublico() ? ({ manifestos: 'manifesto', filosofia: 'manifesto' }[pagina] || pagina) : (FAMILIA[pagina] || pagina); }

  function htmlTopo(pagina) {
    var pai = paiDe(pagina);
    /* o marcador de sol é um elemento próprio: com a transição entre páginas, ele desliza de uma porta à outra (item 73) */
    var link = function (p, i) {
      var atual = p[0] === pai;
      return '<a href="' + p[1] + '"' + (atual ? ' aria-current="page"' : '') + ' title="' + esc(p[3]) + '">' + p[2] + (atual ? '<i class="tb-sol" aria-hidden="true"></i>' : '') + '</a>';
    };
    var perguntas = (ehPublico() ? PUB_PERGUNTAS : PERGUNTAS).filter(function (p) { return permitida(p[0]); });
    var mais = (ehPublico() ? PUB_MAIS : MAIS).filter(function (p) { return permitida(p[0]) && !(estatico() && p[0] === 'casa'); });
    if (ehPublico() && permitida('sobre')) mais = mais.concat([['sobre', 'sobre.html', 'Sobre', 'Licença e créditos']]);
    var inicio = (estatico() && estatico().inicio) || 'atlas.html';
    var nome = (estatico() && estatico().nome) || 'Portal Solar';
    var separador = perguntas.length && mais.length ? '<span class="sep" aria-hidden="true"></span>' : '';
    /* a marca (09/out/2026, item 74): o Quadrado Negro de Malevich + "Portal Solar", em todos os acabamentos */
    var logo = window.Icones ? (/^portal solar$/i.test(nome) ? window.Icones.logotipo('marca-logo') : '<span class="logotipo marca-logo" role="img" aria-label="' + esc(nome) + '">' + window.Icones.quadrado() + '<span class="logotipo-nome" aria-hidden="true">' + esc(nome) + '</span></span>') : '';
    return '<div class="tb"><a class="marca" href="' + inicio + '" aria-label="' + esc(nome) + ', início">' + logo + '<b>' + esc(nome) + '</b></a>' +
      '<nav class="tb-nav" aria-label="Páginas">' + perguntas.map(link).join('') + separador + mais.map(link).join('') + '</nav>' +
      '<div class="tb-dir">' + (estatico() ? '' : '<button type="button" class="tb-tudo" data-tudo title="Tudo: a situação, os lugares, a busca (Ctrl+K)">' + icone('tudo') + '<span>Tudo</span><span class="tb-tudo-longo">Buscar em tudo</span><kbd>Ctrl K</kbd></button>') + (ehPublico() ? '' : '<button type="button" class="tb-dia" id="tb-dia" title="Dias até a prova · abre o Meu dia" aria-haspopup="true" aria-expanded="false"><span><b id="tb-n">—</b><em id="tb-f"></em></span><i class="tb-barra"><i id="tb-b"></i></i>' +
        '<svg class="tb-anel" viewBox="0 0 40 40" aria-hidden="true"><circle class="a0" cx="20" cy="20" r="16"/><circle class="a1" id="tb-anel" cx="20" cy="20" r="16" stroke-dasharray="0 101"/></svg><span class="tb-dias"><b id="tb-dn">—</b><small id="tb-ds"></small></span></button>') +
      /* item 75: os ícones da direita numa família só (forma.css); o protetor de tela mudou para o Personalizar */
      '<div class="tb-icones">' +
      (estatico() ? '' : '<button type="button" class="ic tb-nota" id="b-nota" aria-label="Nota: escrever agora" title="Nota: abre um plano e você escreve; já fica guardado no caderno (tecla N)">' + icone('nota') + '</button>') +
      (ehPublico() ? '' : '<button type="button" class="ic tb-portal" id="b-portal" aria-label="Portal: o site inteiro numa esfera" title="Portal: o site inteiro numa esfera (tecla O)">' + icone('portal') + '</button>') +
      '<button type="button" class="ic" id="b-arrumar" aria-label="Arrumar esta página" title="Arrumar: esconder e mudar a ordem das seções" hidden>' + icone('arrumar') + '</button>' +
      '<button type="button" class="ic" id="b-pers" aria-label="Personalizar" title="Personalizar">' + icone('pers') + '</button>' +
      '</div></div></div>';
  }

  function htmlAbas(pagina) {
    var aba = function (id, href, rotulo) {
      return '<a href="' + href + '"' + (id === paiDe(pagina) ? ' aria-current="page"' : '') + '>' + icone(id) + rotulo + '</a>';
    };
    if (ehPublico()) {
      /* item 75: as mesmas portas do menu de cima (o Manifesto, os Guias, a Curadoria, o tempo, a Biblioteca, o Sobre);
         os Ajustes ficam no botão do alto, como no app */
      var portas = PUB_PERGUNTAS.concat(PUB_MAIS, [['sobre', 'sobre.html', 'Sobre']]).filter(function (p) { return permitida(p[0]); });
      /* no celular cabem seis: o Sobre fica no menu de cima */
      portas = portas.length > 6 ? portas.filter(function (p) { return p[0] !== 'sobre'; }).slice(0, 6) : portas;
      return portas.map(function (p) { return aba(p[0], p[1], p[2]); }).join('') + (portas.length < 4 ? '<button type="button" id="b-pers-aba">' + icone('pers') + 'Ajustes</button>' : '');
    }
    // a Casa 3D e o menu Tudo precisam do servidor: no site exportado ficam de fora
    var extras = MAIS.filter(function (p) { return permitida(p[0]) && !(estatico() && p[0] === 'casa'); }).map(function (p) { return aba(p[0], p[1], p[2]); }).join('');
    return PERGUNTAS.map(function (p) { return aba(p[0], p[1], p[2]); }).join('') + extras + (estatico() ? '' : '<button type="button" data-tudo title="Tudo (Ctrl+K)">' + icone('tudo') + 'Tudo</button>');
  }

  function preencherTopo(e) {
    var c = contagem(e);
    var n = document.getElementById('tb-n');
    if (!n) return;
    n.textContent = c.fase === 'antes' ? 'Prova ' + e.contagem.prova.slice(8, 10) + '/' + e.contagem.prova.slice(5, 7) : 'Dia ' + Math.min(c.dia, c.total) + '/' + c.total;
    document.getElementById('tb-f').textContent = c.fase === 'depois' ? 'depois da prova' : c.fase === 'antes' ? '' : c.faltam === 0 ? 'hoje é a prova' : 'faltam ' + c.faltam;
    var b = document.getElementById('tb-b');
    b.style.width = (c.fase === 'antes' ? 0 : Math.min(100, Math.round((Math.min(c.dia, c.total) / c.total) * 100))) + '%';
    document.getElementById('tb-dia').title = 'Prova em ' + e.contagem.prova.slice(8, 10) + '/' + e.contagem.prova.slice(5, 7);
    /* o anel do Solar: a volta é o caminho inteiro (dia 1 ao dia da prova) */
    var anel = document.getElementById('tb-anel');
    if (anel) {
      var fr = c.fase === 'antes' ? 0 : Math.min(1, Math.min(c.dia, c.total) / c.total);
      anel.setAttribute('stroke-dasharray', (fr * 100.5).toFixed(1) + ' 101');
      document.getElementById('tb-dn').textContent = c.fase === 'depois' ? 'Prova feita' : c.fase === 'antes' ? 'Prova ' + e.contagem.prova.slice(8, 10) + '/' + e.contagem.prova.slice(5, 7) : c.faltam === 0 ? 'Hoje' : c.faltam + (c.faltam === 1 ? ' dia' : ' dias');
      document.getElementById('tb-ds').textContent = c.fase === 'dentro' ? (c.faltam === 0 ? 'é a prova' : 'até a prova') : '';
    }
  }

  function montarTopo(el) {
    var pagina = document.body.dataset.pagina;
    el.innerHTML = htmlTopo(pagina);
    document.getElementById('b-pers').addEventListener('click', abrirPers);
    var td = document.getElementById('tb-dia');
    /* 08/out/2026: o anel leva ao painel do Hoje, onde mora toda a organização (o painel flutuante segue no código, sem uso) */
    if (td) { td.title = 'Dias até a prova · abrir o painel do Hoje'; td.removeAttribute('aria-haspopup'); td.addEventListener('click', function () {
      var alvo = document.getElementById('hj-painel');
      if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' }); else location.href = 'hoje.html#hj-painel';
    }); }
    var abas = document.createElement('nav');
    abas.className = 'abas';
    abas.setAttribute('aria-label', 'Navegação principal');
    abas.innerHTML = htmlAbas(pagina);
    document.body.appendChild(abas);
    var pa = document.getElementById('b-pers-aba');
    if (pa) pa.addEventListener('click', abrirPers);
    if (ehPublico()) return;
    window.addEventListener('perfil:estado', function (ev) { preencherTopo(ev.detail); });
    estado().then(preencherTopo).catch(function (erro) {
      if (/ 401$/.test(String(erro && erro.message))) return; /* fora do computador, ainda sem entrar (página Conta): não é servidor desligado */
      var aviso = document.createElement('div');
      aviso.className = 'aviso-off';
      aviso.textContent = 'Servidor desligado. Abra hoje.bat';
      el.querySelector('.tb-dir').insertBefore(aviso, el.querySelector('.tb-dia'));
    });
  }

  function htmlTrilho(pagina) {
    var pai = paiDe(pagina);
    var itens = (ehPublico() ? PUB_PERGUNTAS : PERGUNTAS).filter(function (p) { return permitida(p[0]); }).map(function (p, i) {
      return '<li><a href="' + p[1] + '"' + (p[0] === pai ? ' aria-current="page"' : '') + '>' +
        '<i>0' + (i + 1) + '</i><b>' + p[2] + '</b><span>' + p[3] + '</span></a></li>';
    }).join('');
    var lista = (ehPublico() ? PUB_MAIS : MAIS).filter(function (p) { return permitida(p[0]); });
    var mais = lista.map(function (p) {
      return '<li><a href="' + p[1] + '"' + (p[0] === pai ? ' aria-current="page"' : '') + '>' +
        '<i>+</i><b>' + p[2] + '</b><span>' + p[3] + '</span></a></li>';
    }).join('');
    return '<a class="marca" href="atlas.html" aria-label="Portal Solar, início">' + (window.Icones ? window.Icones.logotipo('marca-logo') : '') + '<b>Portal Solar</b></a>' +
      '<button type="button" class="opt pers-btn" id="b-pers-topo">Personalizar · temas e cores</button>' +
      '<nav aria-label="As cinco perguntas"><ul class="perguntas">' + itens + '</ul>' +
      (mais ? '<p class="rot grupo-t">Consultar</p><ul class="perguntas mais">' + mais + '</ul>' : '') + '</nav>' +
      '<div class="relogio"><span class="rot suave" id="rel-rot">Prova</span>' +
      '<b class="dia" id="rel-dia">—<small>/40</small></b>' +
      '<div class="dias" id="rel-dias"></div><span class="rot" id="rel-faltam"></span></div>' +
      '<ul class="espectro" id="espectro"></ul>' +
      '<div class="trilho-pe"><button type="button" data-tudo>Tudo (Ctrl+K)</button><button type="button" id="b-pers">Personalizar</button><button type="button" id="b-tema">Tema</button><button type="button" id="b-grade">Grade</button></div>';
  }

  function preencherTrilho(e) {
    var c = contagem(e);
    var dia = document.getElementById('rel-dia');
    if (dia) dia.innerHTML = (c.fase === 'antes' ? '0' : Math.min(c.dia, c.total)) + '<small>/' + c.total + '</small>';
    var dias = document.getElementById('rel-dias');
    if (dias) {
      var s = '';
      for (var i = 0; i < c.total; i++) s += '<i class="' + (i + 1 < c.dia ? 'on' : i + 1 === c.dia ? 'hoje' : '') + '"></i>';
      dias.style.gridTemplateColumns = 'repeat(' + c.total + ', 1fr)';
      dias.innerHTML = s;
    }
    var rr = document.getElementById('rel-rot');
    if (rr && e.contagem.prova) rr.textContent = 'Prova · ' + e.contagem.prova.slice(8, 10) + '/' + e.contagem.prova.slice(5, 7);
    var f = document.getElementById('rel-faltam');
    if (f) f.textContent = c.fase === 'antes' ? 'o roteiro começa em ' + e.contagem.inicio.slice(8, 10) + '/' + e.contagem.inicio.slice(5, 7) : c.fase === 'depois' ? 'depois da prova' : c.faltam === 0 ? 'dia da prova' : 'faltam ' + c.faltam;
    var esp = document.getElementById('espectro');
    if (esp) {
      esp.innerHTML = e.checklist.map(function (s) {
        var pct = s.total ? Math.round((s.feitos / s.total) * 100) : 0;
        return '<li class="' + corDe(s.nome) + '"><i class="q"></i><span>' + esc(s.nome) + '</span><span>' + s.feitos + '/' + s.total + '</span>' +
          '<div class="b"><i style="width:' + pct + '%"></i></div></li>';
      }).join('');
    }
  }

  function montarTrilhoClassico(el) {
    el.innerHTML = htmlTrilho(document.body.dataset.pagina);
    var bt = document.getElementById('b-tema');
    bt.textContent = 'Tema: ' + nomeTema(persAtual().tema || 'auto');
    bt.addEventListener('click', alternarTema);
    document.getElementById('b-pers').addEventListener('click', abrirPers);
    document.getElementById('b-pers-topo').addEventListener('click', abrirPers);
    document.getElementById('b-grade').addEventListener('click', function () { document.body.classList.toggle('ver-grade'); });
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'pers-fab';
    fab.textContent = 'Personalizar';
    fab.addEventListener('click', abrirPers);
    document.body.appendChild(fab);
    window.addEventListener('perfil:estado', function (ev) { preencherTrilho(ev.detail); });
    estado().then(preencherTrilho).catch(function () {
      var aviso = document.createElement('div');
      aviso.className = 'aviso-off';
      aviso.textContent = 'Servidor desligado. Abra hoje.bat para ligar.';
      el.insertBefore(aviso, el.children[1]);
    });
  }

  function montarTrilho() {
    var el = document.getElementById('trilho');
    if (!el) return;
    if (ehFino()) montarTopo(el); else montarTrilhoClassico(el);
  }

  function montarFaixa() {
    var el = document.getElementById('faixa');
    if (!el) return;
    var um = FAIXA.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    el.innerHTML = '<div class="faixa-in">' + um + um + '</div>';
  }

  document.addEventListener('keydown', function (ev) {
    var t = ev.target && ev.target.tagName;
    if (ev.key === 'Escape') { fecharPers(); fecharDiaPainel(); }
    if (ev.key === 'g' && !ev.ctrlKey && !ev.metaKey && t !== 'INPUT' && t !== 'TEXTAREA') document.body.classList.toggle('ver-grade');
  });

  /* cada porta tem a sua família: a fileira de baixo do menu mostra as páginas de dentro */
  var SUBNAVS = {
    atlas: ['Dentro do Atlas', SUBNAV_ATLAS],
    agora: ['Dentro do Hoje', [
      ['agora', 'hoje.html', 'Hoje', 'Tudo num lugar só'],
      ['domino', 'domino.html', 'Domínio', 'O que já sei'],
      ['area', 'area.html', 'Áreas', 'O mapa de cada matéria'],
      ['copiar', 'copiar.html', 'Copiar à mão', 'Escrever para lembrar'],
    ]],
    eu: ['Dentro do Eu', [
      ['eu', 'eu.html', 'Eu', 'A ficha, a rede, a coleção'],
      ['entrar', 'entrar.html', 'Conta', 'Entrar, senha, convites'],
    ]],
    manifesto: ['Dentro do Manifesto', [
      ['manifesto', 'manifesto.html', 'Manifesto', 'O do Portal Solar'],
      ['manifestos', 'manifestos.html', 'Os manifestos', 'Da humanidade, por data'],
      ['filosofia', 'filosofia.html', 'A filosofia', 'Os seus arquivos, a sua casa'],
    ]],
    casa: ['Dentro da Casa', [
      ['casa', 'casa.html', 'Casa', 'A planta e os cômodos'],
      ['jardim', 'jardim.html', 'Jardim', 'O que cresceu'],
      ['estante', 'casa.html?area=estante', 'Estante', 'Os seus livros'],
      ['guarda-roupa', 'casa.html?area=guarda-roupa', 'Guarda-roupa', 'As suas roupas'],
    ]],
  };
  function montarSubnav() {
    var pagina = document.body.dataset.pagina;
    var fam = SUBNAVS[paiDe(pagina)];
    if (!fam || (ehPublico() && paiDe(pagina) !== 'manifesto')) return; /* no público, só a família do Manifesto (item 75) */
    var miolo = document.querySelector('.miolo');
    if (!miolo || miolo.querySelector('.subnav')) return;
    var nav = document.createElement('nav');
    nav.className = 'subnav';
    nav.setAttribute('aria-label', fam[0]);
    nav.innerHTML = fam[1].filter(function (p) { return permitida(p[0]); }).map(function (p) {
      var atual = p[0] === pagina;
      return '<a href="' + p[1] + '"' + (atual ? ' aria-current="page"' : '') + '><b>' + p[2] + '</b><span>' + esc(p[3]) + '</span>' + (atual ? '<i class="sub-sol" aria-hidden="true"></i>' : '') + '</a>';
    }).join('');
    miolo.insertBefore(nav, miolo.firstChild);
    /* no celular a fileira rola de lado: a página atual vem para o meio da vista,
       e a ponta só esmaece do lado em que ainda há mais (forma.css lê data-antes e data-depois) */
    var atual = nav.querySelector('[aria-current="page"]');
    var posto = -1;
    function pontas() {
      var resto = nav.scrollWidth - nav.clientWidth;
      nav.toggleAttribute('data-antes', nav.scrollLeft > 2);
      nav.toggleAttribute('data-depois', nav.scrollLeft < resto - 2);
    }
    function centrar() {
      if (!atual || nav.scrollWidth <= nav.clientWidth) return;
      var ra = atual.getBoundingClientRect(), rn = nav.getBoundingClientRect();
      nav.scrollLeft += (ra.left - rn.left) - (rn.width - ra.width) / 2;
      posto = nav.scrollLeft;
    }
    centrar(); pontas();
    nav.addEventListener('scroll', pontas, { passive: true });
    addEventListener('resize', pontas);
    /* as fontes mudam a largura das abas: centra de novo, se a pessoa ainda não rolou */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (nav.scrollLeft === posto || posto < 0) { centrar(); pontas(); } });
  }

  /* o Portal (item 74): o site inteiro numa esfera. portal.js e portal.css só vêm quando pedidos
     (botão ●, tecla O); ao passar o mouse no botão, já começam a vir. */
  var portalPedido = null;
  function carregarPortal() {
    if (window.Portal) return Promise.resolve(window.Portal);
    if (portalPedido) return portalPedido;
    portalPedido = new Promise(function (ok, falha) {
      var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'portal.css'; document.head.appendChild(css);
      var js = document.createElement('script'); js.src = 'portal.js';
      js.onload = function () { ok(window.Portal); }; js.onerror = falha;
      document.head.appendChild(js);
    });
    return portalPedido;
  }
  /* o caderno de notas (item 75): o plano zen, carregado só quando se pede */
  var notaPromessa = null;
  function carregarNota() {
    if (window.Nota) return Promise.resolve(window.Nota);
    if (notaPromessa) return notaPromessa;
    notaPromessa = new Promise(function (ok) {
      if (!document.querySelector('link[href="nota.css"]')) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'nota.css'; document.head.appendChild(l); }
      var s = document.createElement('script'); s.src = 'nota.js'; s.onload = function () { ok(window.Nota); }; s.onerror = function () { notaPromessa = null; ok(null); };
      document.head.appendChild(s);
    });
    return notaPromessa;
  }
  function abrirNota(op) { if (estatico()) return; carregarNota().then(function (N) { if (N) N.abrir(op); }); }
  document.addEventListener('click', function (ev) { if (ev.target.closest && ev.target.closest('#b-nota, [data-nota-abrir-global], a[href="#nota"]')) { ev.preventDefault(); if (window.Tudo && window.Tudo.fechar) window.Tudo.fechar(); abrirNota(); } });
  document.addEventListener('pointerover', function (ev) { if (ev.target.closest && ev.target.closest('#b-nota')) carregarNota(); }, { passive: true });
  document.addEventListener('keydown', function (ev) {
    if ((ev.key !== 'n' && ev.key !== 'N') || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    var t = ev.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    if (/^(casa|estante|guarda-roupa|jardim)$/.test(document.body.dataset.pagina || '') || document.querySelector('.folha.aberta, .pers:not([hidden])')) return;
    if (window.Nota && window.Nota.aberta()) return;
    ev.preventDefault(); abrirNota();
  });

  function abrirPortal() { carregarPortal().then(function (P2) { if (P2) P2.abrir(); }); }
  document.addEventListener('click', function (ev) { if (ev.target.closest && ev.target.closest('#b-portal, [data-portal], a[href="#portal"]')) { ev.preventDefault(); if (window.Tudo && window.Tudo.fechar) window.Tudo.fechar(); abrirPortal(); } });
  /* #portal no endereço (o menu Tudo, um link de fora) também abre */
  function portalPeloEndereco() { if (location.hash === '#portal') { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ok */ } abrirPortal(); } }
  window.addEventListener('hashchange', portalPeloEndereco);
  document.addEventListener('DOMContentLoaded', function () { setTimeout(portalPeloEndereco, 300); });
  document.addEventListener('pointerover', function (ev) { if (ev.target.closest && ev.target.closest('#b-portal')) carregarPortal(); }, { passive: true });
  document.addEventListener('keydown', function (ev) {
    var t = ev.target && ev.target.tagName;
    if ((ev.key === 'o' || ev.key === 'O') && !ev.ctrlKey && !ev.metaKey && !ev.altKey && t !== 'INPUT' && t !== 'TEXTAREA' && t !== 'SELECT' && !(ev.target && ev.target.isContentEditable) && !document.querySelector('.folha.aberta, .portal-aberto')) {
      if (document.body && /^(casa|estante|guarda-roupa|jardim)$/.test(document.body.dataset.pagina || '')) return; /* nas cenas 3D, o teclado anda pela casa */
      abrirPortal();
    }
  });
  function lugares() {
    var pagina = document.body ? document.body.dataset.pagina : '';
    return { portas: PERGUNTAS.slice(), familias: SUBNAVS, atual: pagina, pai: paiDe(pagina) };
  }

  function carregarTudo() {
    // o menu Tudo lê as rotas do servidor: no site exportado (estático) ele não existe
    if (estatico() || EMBUTIDO || window.Tudo) return;
    var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'tudo.css'; document.head.appendChild(css);
    var js = document.createElement('script'); js.src = 'tudo.js'; js.defer = true; document.head.appendChild(js);
  }

  /* navegação instantânea (item 73): ao passar o mouse num link, a página já é preparada (Speculation Rules).
     As cenas 3D e o protetor só são buscados (prefetch), nunca montados de antemão: são pesados. */
  function preparar() {
    try {
      if (!(window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules'))) return;
      if (document.querySelector('script[type="speculationrules"]')) return;
      var pesadas = { selector_matches: 'a[href*="casa.html"], a[href*="estante.html"], a[href*="guarda-roupa.html"], a[href*="jardim.html"], a[href*="protetor.html"], a[href*="album.html"], a[download], a[target="_blank"]' };
      var regras = {
        prerender: [{ where: { and: [{ href_matches: '/*' }, { not: pesadas }] }, eagerness: 'moderate' }],
        prefetch: [{ where: { and: [{ href_matches: '/*' }, pesadas] }, eagerness: 'moderate' }],
      };
      var sc = document.createElement('script');
      sc.type = 'speculationrules';
      sc.textContent = JSON.stringify(regras);
      document.head.appendChild(sc);
    } catch (e) { /* navegador sem suporte: navega normalmente */ }
  }

  /* o motor 3D começa a vir ao passar o mouse em Casa ou Jardim: a cena abre mais depressa */
  var motor3dPedido = false;
  document.addEventListener('pointerover', function (ev) {
    if (motor3dPedido) return;
    var a = ev.target.closest && ev.target.closest('a[href*="casa.html"], a[href*="jardim.html"], a[href*="estante.html"], a[href*="guarda-roupa.html"]');
    if (!a) return;
    motor3dPedido = true;
    var l = document.createElement('link'); l.rel = 'modulepreload'; l.href = 'vendor/three.module.min.js'; document.head.appendChild(l);
  }, { passive: true });

  document.addEventListener('DOMContentLoaded', function () { montarTrilho(); montarSubnav(); montarFaixa(); carregarTudo(); preparar(); });

  var estudosPend = null;
  function estudos() {
    if (!estudosPend) estudosPend = fetch('/api/estudos-dos-itens').then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; });
    return estudosPend;
  }

  var mapasPend = null;
  function mapas() {
    if (!mapasPend) mapasPend = fetch('/api/mapas-das-secoes').then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; });
    return mapasPend;
  }

  /* ---------- a folha (item 73): o conteúdo se abre num painel, nunca dentro da grade ----------
     Perfil.folha({ titulo, sub, html, aoAbrir(corpo), larga }) → { fechar(), corpo }.
     Sobe da direita no computador e de baixo no celular; Esc, o fundo e o × fecham; o foco volta
     para quem abriu. Uma folha por vez. */
  var folhaAtual = null;
  function folha(o) {
    if (folhaAtual) folhaAtual.fechar(true);
    var quem = document.activeElement;
    var fundo = document.createElement('div');
    fundo.className = 'folha-fundo';
    var el = document.createElement('aside');
    el.className = 'folha' + (o.larga ? ' folha-larga' : '');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'folha-t');
    el.setAttribute('data-lenis-prevent', '');
    el.innerHTML = '<header class="folha-cab"><div>' + (o.sub ? '<p class="rot">' + o.sub + '</p>' : '') + '<h2 id="folha-t">' + (o.titulo || '') + '</h2></div>' +
      '<button type="button" class="folha-x" data-folha-fechar aria-label="Fechar">' + icone('fechar') + '</button></header><div class="folha-corpo">' + (o.html || '') + '</div>';
    document.body.appendChild(fundo);
    document.body.appendChild(el);
    document.documentElement.classList.add('com-folha');
    void el.offsetWidth;
    fundo.classList.add('aberta'); el.classList.add('aberta');
    var corpo = el.querySelector('.folha-corpo');
    function tecla(ev) { if (ev.key === 'Escape') { ev.stopPropagation(); api.fechar(); } }
    var api = {
      corpo: corpo,
      fechar: function (ja) {
        if (folhaAtual !== api) return;
        folhaAtual = null;
        document.removeEventListener('keydown', tecla, true);
        el.classList.remove('aberta'); fundo.classList.remove('aberta');
        document.documentElement.classList.remove('com-folha');
        var tirar = function () { el.remove(); fundo.remove(); };
        if (ja) tirar(); else setTimeout(tirar, 460);
        if (quem && quem.focus && !ja) try { quem.focus({ preventScroll: true }); } catch (e) {}
        if (o.aoFechar) o.aoFechar();
      },
    };
    folhaAtual = api;
    fundo.addEventListener('click', function () { api.fechar(); });
    el.addEventListener('click', function (ev) { if (ev.target.closest('[data-folha-fechar]')) api.fechar(); });
    document.addEventListener('keydown', tecla, true);
    setTimeout(function () { var f = el.querySelector('.folha-x'); if (f) f.focus({ preventScroll: true }); }, 30);
    if (o.aoAbrir) o.aoAbrir(corpo, api);
    return api;
  }

  /* o que espera uma decisão sua: uma lista só, lida pelo Hoje e pelo menu Tudo (atualizar junto com o Mapa de Tudo) */
  var ESPERANDO = [
    ['As medidas do seu quarto', 'o quarto da Casa está com medidas de exemplo', 'casa.html?vista=planta'],
    ['Rever a XV, "A nova maré"', 'entrou no Manifesto com o seu sim (09/out): mude no Obsidian', 'manifesto.html#mf-xv'],
    ['As pastas (O Grande Plano)', 'depois de 18/10: o que arquivar, o que juntar', null],
    ['O commit e a união', 'os itens 69 a 75 estão só no Mac; o plano dos dois Portais está em UNIAO.md', null],
  ];

  window.Perfil = { abrirNota: abrirNota, estudos: estudos, mapas: mapas, estado: estado, marcar: marcar, esc: esc, corDe: corDe, contagem: contagem, dataExtenso: dataExtenso, abrirPers: abrirPers, icone: icone, ESPERANDO: ESPERANDO, folha: folha, lugares: lugares, abrirPortal: abrirPortal };
})();
