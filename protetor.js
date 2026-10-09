(function () {
  'use strict';

  /* ============================================================
     GERADOR DE NÚMEROS PSEUDOALEATÓRIOS (mulberry32)
     Um computador não tem dados nem baralho: "aleatório" aqui é uma
     conta que embaralha tanto um número inicial (a semente) que o
     resultado PARECE imprevisível — mas a mesma semente sempre
     devolve a mesma sequência. É por isso que dá pra "repetir" uma
     obra generativa: guarde a semente, não a imagem.
     ============================================================ */
  function criarRng(semente) {
    var a = semente >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ============================================================
     RUÍDO DE VALOR 2D
     Em vez de um número aleatório por pixel (que dá estática, sem
     forma), sorteia-se um número só nos pontos inteiros de uma
     grade, e entre eles INTERPOLA-SE suavemente (smoothstep: uma
     curva em S que começa e termina devagar). O resultado é uma
     paisagem de colinas e vales suaves — a mesma ideia por trás do
     ruído de Perlin, na sua forma mais simples de explicar.
     ============================================================ */
  function criarRuido(semente) {
    var rng = criarRng(semente);
    var grade = new Map();
    function nodo(ix, iy) {
      var k = ix + ',' + iy;
      var v = grade.get(k);
      if (v === undefined) { v = rng(); grade.set(k, v); }
      return v;
    }
    function suave(t) { return t * t * (3 - 2 * t); }
    return function (x, y) {
      var x0 = Math.floor(x), y0 = Math.floor(y);
      var fx = suave(x - x0), fy = suave(y - y0);
      var a = nodo(x0, y0), b = nodo(x0 + 1, y0), c = nodo(x0, y0 + 1), d = nodo(x0 + 1, y0 + 1);
      var topo = a + (b - a) * fx, base = c + (d - c) * fx;
      return topo + (base - topo) * fy;
    };
  }

  /* ============================================================
     A SUPERFÓRMULA DE GIELIS (2003) — ver explicação e uso no modo "Formas"
     r(θ) = ( |cos(mθ/4)/a|^n2 + |sin(mθ/4)/b|^n3 ) ^ (−1/n1)
     ============================================================ */
  function superformula(theta, m, n1, n2, n3, a, b) {
    var t1 = Math.pow(Math.abs(Math.cos(m * theta / 4) / a), n2);
    var t2 = Math.pow(Math.abs(Math.sin(m * theta / 4) / b), n3);
    return Math.pow(t1 + t2, -1 / n1);
  }

  var ANGULO_OURO = Math.PI * (3 - Math.sqrt(5)); // = 137,5077...° em radianos (Vogel, 1979)

  /* ============================================================
     METADADOS DOS QUATRO MODOS — compartilhados por qualquer instância
     (rótulo, os parâmetros ajustáveis e a explicação matemática). O que
     cada modo REALMENTE desenha mora dentro de criar(), porque precisa
     do canvas de cada instância — mas o "de que ele é feito" é um só.
     ============================================================ */
  var MODOS = {
    traco: {
      rot: 'Traço',
      params: [
        { k: 'linhas', rot: 'Linhas por quadro', min: 5, max: 120, passo: 1, v: 40 },
        { k: 'passos', rot: 'Passos por linha', min: 20, max: 400, passo: 10, v: 140 },
        { k: 'escala', rot: 'Escala do ruído', min: 0.001, max: 0.02, passo: 0.001, v: 0.006 },
        { k: 'velocidade', rot: 'Velocidade', min: 0, max: 5, passo: 0.1, v: 1 },
        { k: 'semente', rot: 'Semente', min: 1, max: 9999, passo: 1, v: 7 },
      ],
      matematica: '<p>Cada ponto da tela pergunta ao <b>ruído de valor</b> (ver o código completo abaixo) "que ângulo eu sigo daqui?" — e o resultado nunca pula bruscamente de vizinho a vizinho, porque a interpolação (<code>suave</code>) garante uma transição em curva-S entre os quatro cantos da célula da grade mais próxima.</p><p>É o mesmo princípio que gera nuvens, veios de madeira e — aqui — um campo de linhas que lembra a caneta única de um <i>pen plotter</i>: milhares de traços curtos, cada um seguindo o relevo invisível do ruído.</p>',
    },
    flores: {
      rot: 'Flores',
      params: [
        { k: 'pontos', rot: 'Sementes', min: 50, max: 3000, passo: 50, v: 900 },
        { k: 'escala', rot: 'Espaçamento', min: 1, max: 12, passo: 0.5, v: 4.2 },
        { k: 'tamanho', rot: 'Tamanho do ponto', min: 1, max: 8, passo: 0.5, v: 3.5 },
        { k: 'desvio', rot: 'Desvio do ângulo de ouro', min: -0.05, max: 0.05, passo: 0.002, v: 0 },
        { k: 'velocidade', rot: 'Velocidade de crescimento', min: 0.2, max: 5, passo: 0.1, v: 1 },
      ],
      matematica: '<p>O <b>ângulo de ouro</b> é <span class="pt-num">137,5077...°</span> — o ângulo que sobra de um círculo depois de tirar a fração de ouro (φ = 1,618...). Ele é o número "mais difícil de aproximar por uma fração simples" que existe, e é exatamente por isso que a natureza o escolhe: qualquer outro ângulo, cedo ou tarde, alinharia as sementes em raios retos, deixando vãos. Com o ângulo de ouro, cada nova semente cai no maior vão livre.</p><p>O raio de cada semente cresce com a <b>raiz quadrada</b> do seu número (não linearmente) — é essa raiz que faz as sementes ficarem igualmente espaçadas mesmo com os círculos ficando maiores para fora (a área de um anel cresce com o raio, então o raio precisa desacelerar para compensar).</p>',
    },
    estrelas: {
      rot: 'Estrelas',
      params: [
        { k: 'brilho', rot: 'Brilho', min: 0.3, max: 2.5, passo: 0.1, v: 1 },
        { k: 'velocidade', rot: 'Velocidade de rotação', min: 0, max: 20, passo: 0.5, v: 1 },
        { k: 'nomes', rot: 'Mostrar nomes (0/1)', min: 0, max: 1, passo: 1, v: 1 },
      ],
      matematica: '<p>Cada estrela carrega duas coordenadas reais — <b>ascensão reta</b> (equivalente à longitude, mas no céu) e <b>declinação</b> (equivalente à latitude) — e uma <b>magnitude</b> (brilho aparente; quanto <i>menor</i> o número, mais brilhante — Sirius é −1,4, o Sol seria −26,7). A projeção aqui é polar, centrada no polo celeste norte: declinação 90° (o polo) cai no centro; −90° (o polo sul celeste) cairia na borda. Girar essa projeção com o tempo é desenhar, literalmente, a rotação da Terra.</p>',
    },
    formas: {
      rot: 'Formas',
      params: [
        { k: 'm', rot: 'm (simetria)', min: 1, max: 20, passo: 1, v: 6 },
        { k: 'n1', rot: 'n1', min: 0.1, max: 20, passo: 0.1, v: 3 },
        { k: 'n2', rot: 'n2', min: 0.1, max: 20, passo: 0.1, v: 8 },
        { k: 'n3', rot: 'n3', min: 0.1, max: 20, passo: 0.1, v: 8 },
        { k: 'camadas', rot: 'Camadas', min: 1, max: 40, passo: 1, v: 16 },
        { k: 'variacao', rot: 'Variação animada', min: 0, max: 4, passo: 0.1, v: 1.2 },
        { k: 'velocidade', rot: 'Velocidade', min: 0, max: 5, passo: 0.1, v: 1 },
      ],
      matematica: '<p>A <b>superfórmula</b> (Johan Gielis, 2003) generaliza a equação do círculo. Com <span class="pt-num">m</span> controlando quantos "lados" ou "pétalas" a curva tem, e <span class="pt-num">n1, n2, n3</span> controlando o quão pontiagudos ou arredondados eles ficam, a mesma linha de código produz círculos, estrelas, engrenagens, flores de cinco pétalas ou conchas do mar — as mesmas formas que aparecem, sem combinado prévio, em diatomáceas, ouriços-do-mar e flores de verdade.</p>',
    },
  };
  var ORDEM_MODOS = ['traco', 'flores', 'estrelas', 'formas'];

  /* ============================================================
     O MOTOR — uma instância por tela. Chame window.Protetor.criar(canvas)
     tanto para a página cheia (protetor.html) quanto para um card pequeno
     dentro de qualquer outra página — cada instância tem seu próprio
     ctx/tamanho/estado, então várias podem existir ao mesmo tempo sem
     uma atrapalhar a outra.
     ============================================================ */
  function criar(canvas, opcoes) {
    opcoes = opcoes || {};
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, raf = 0, vivo = true;

    function tamanho() {
      var r = opcoes.compacto ? canvas.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      W = Math.max(60, r.width); H = Math.max(60, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function aoRedimensionar() { tamanho(); }
    window.addEventListener('resize', aoRedimensionar);
    tamanho();

    /* ---- MODO 1 · TRAÇO — campo de fluxo, atmosfera de pen plotter ----
       Cada linha é uma "formiga cega": em cada passo, ela pergunta ao
       ruído "para que lado devo virar aqui?" e dá um passinho naquela
       direção. Milhares dessas formigas, sobrepostas, desenham um
       tecido de linhas que lembra o traço de uma caneta mecânica. */
    var traco = { ruido: null, offset: 0 };
    function iniciarTraco(p) { traco.ruido = criarRuido(p.semente | 0); traco.offset = 0; ctx.fillStyle = '#120D08'; ctx.fillRect(0, 0, W, H); }
    function desenharTraco(p, dt) {
      traco.offset += dt * 0.00006 * p.velocidade;
      ctx.fillStyle = 'rgba(18,13,8,0.05)';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(224,179,85,0.55)';
      ctx.lineWidth = 1;
      for (var i = 0; i < p.linhas; i++) {
        var x = Math.random() * W, y = Math.random() * H;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (var s = 0; s < p.passos; s++) {
          var ang = traco.ruido(x * p.escala + traco.offset, y * p.escala) * Math.PI * 4;
          x += Math.cos(ang) * 2.2; y += Math.sin(ang) * 2.2;
          if (x < 0 || x > W || y < 0 || y > H) break;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    /* ---- MODO 2 · FLORES — filotaxia (o ângulo de ouro) ----
       Fórmula (Vogel, 1979): ângulo = n × 137,5077°; raio = c × √n. */
    var flor = { crescendo: 0 };
    /* começa com um terço das sementes, para a flor já aparecer ao abrir */
    function iniciarFlor(p) { flor.crescendo = (p && p.pontos ? p.pontos : 900) * 0.35; }
    function desenharFlor(p, dt) {
      ctx.fillStyle = '#120D08'; ctx.fillRect(0, 0, W, H);
      flor.crescendo += dt * 0.02 * p.velocidade;
      if (flor.crescendo > p.pontos + 200) flor.crescendo = p.pontos * 0.15;
      var n = Math.min(p.pontos, Math.floor(flor.crescendo));
      var cx = W / 2, cy = H / 2;
      /* o "espaçamento" é relativo à tela: no valor padrão (4,2), a flor inteira ocupa ~42% do menor lado */
      var k = (Math.min(W, H) * 0.42 / Math.sqrt(p.pontos)) / 4.2, kt = Math.max(0.6, Math.min(W, H) / 700);
      for (var i = 0; i < n; i++) {
        var ang = i * (ANGULO_OURO + p.desvio);
        var r = p.escala * k * Math.sqrt(i);
        var x = cx + r * Math.cos(ang), y = cy + r * Math.sin(ang);
        var f = i / p.pontos;
        ctx.beginPath();
        ctx.fillStyle = 'hsl(' + (28 + f * 25) + ', ' + (55 + f * 20) + '%, ' + (45 + f * 25) + '%)';
        ctx.globalAlpha = 0.85;
        ctx.arc(x, y, p.tamanho * kt * (0.5 + f * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    /* ---- MODO 3 · ESTRELAS — o céu real, não inventado ----
       Catálogo real (Hipparcos/Bright Star, via ceu-dados.js). Projeção
       polar centrada no polo celeste norte; girar com o tempo é desenhar
       a rotação da Terra. */
    function desenharEstrelas(p, dt, tAcum) {
      ctx.fillStyle = '#0A0705'; ctx.fillRect(0, 0, W, H);
      var estrelas = (window.CEU_DADOS && window.CEU_DADOS.estrelas) || [];
      var cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.46;
      var giro = tAcum * 0.00002 * p.velocidade;
      ctx.textAlign = 'left';
      ctx.font = '600 12px Gabarito, system-ui, sans-serif';
      for (var i = 0; i < estrelas.length; i++) {
        var e = estrelas[i];
        var ra = (e[0] * Math.PI / 180) + giro, dec = e[1], mag = e[2];
        var raio = ((90 - dec) / 180) * R;
        var x = cx + raio * Math.cos(ra), y = cy + raio * Math.sin(ra);
        if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
        var tamanhoPt = Math.max(0.5, 3.4 - mag * 0.55) * p.brilho;
        ctx.globalAlpha = Math.max(0.15, 1 - mag * 0.16);
        ctx.fillStyle = e[3] > 0.6 ? '#E0B355' : e[3] < 0 ? '#9FC6FF' : '#EFE2C4';
        ctx.beginPath(); ctx.arc(x, y, tamanhoPt, 0, Math.PI * 2); ctx.fill();
        if (p.nomes && e[4] && mag < 1.3 && !opcoes.compacto) { ctx.globalAlpha = 0.75; ctx.fillStyle = '#C9A768'; ctx.fillText(e[4], x + 5, y - 4); }
      }
      ctx.globalAlpha = 1;
    }

    /* ---- MODO 4 · FORMAS — a superfórmula de Gielis (2003) ---- */
    function desenharFormas(p, dt, tAcum) {
      ctx.fillStyle = '#120D08'; ctx.fillRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2, escala = Math.min(W, H) * 0.34;
      var fase = tAcum * 0.0001 * p.velocidade;
      var camadas = p.camadas;
      for (var c = 0; c < camadas; c++) {
        var f = c / camadas;
        var n1 = p.n1 + Math.sin(fase + c) * p.variacao;
        var pontos = 260;
        ctx.beginPath();
        for (var i = 0; i <= pontos; i++) {
          var theta = (i / pontos) * Math.PI * 2;
          var r = superformula(theta, p.m, n1, p.n2, p.n3, 1, 1) * escala * (0.4 + f * 0.6);
          var x = cx + r * Math.cos(theta + fase * 0.3), y = cy + r * Math.sin(theta + fase * 0.3);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'hsla(' + (18 + f * 40) + ',70%,' + (55 + f * 15) + '%,' + (0.85 - f * 0.5) + ')';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }

    var MOTORES = {
      traco: { iniciar: iniciarTraco, desenhar: desenharTraco },
      flores: { iniciar: iniciarFlor, desenhar: desenharFlor },
      estrelas: { iniciar: function () {}, desenhar: desenharEstrelas },
      formas: { iniciar: function () {}, desenhar: desenharFormas },
    };

    var estado = { modo: (opcoes.modoInicial && MOTORES[opcoes.modoInicial]) ? opcoes.modoInicial : 'flores', params: {}, tempoAcum: 0, ultimo: performance.now() };
    ORDEM_MODOS.forEach(function (m) {
      estado.params[m] = {};
      MODOS[m].params.forEach(function (p) { estado.params[m][p.k] = p.v; });
    });

    function paramsAtuais() { return estado.params[estado.modo]; }

    function trocarModo(nome) {
      if (!MOTORES[nome]) return;
      estado.modo = nome;
      estado.tempoAcum = 0;
      MOTORES[nome].iniciar(paramsAtuais());
      if (opcoes.aoTrocar) opcoes.aoTrocar(nome);
    }

    var proxTroca = performance.now() + (opcoes.autoTrocaMs || 0);
    function laco(agora) {
      raf = 0;
      if (!vivo || !document.body.contains(canvas)) return;
      var dt = Math.min(48, agora - estado.ultimo);
      estado.ultimo = agora;
      estado.tempoAcum += dt;
      MOTORES[estado.modo].desenhar(paramsAtuais(), dt, estado.tempoAcum);
      if (opcoes.autoTrocaMs && agora > proxTroca) {
        var i = ORDEM_MODOS.indexOf(estado.modo);
        trocarModo(ORDEM_MODOS[(i + 1) % ORDEM_MODOS.length]);
        proxTroca = agora + opcoes.autoTrocaMs;
      }
      raf = requestAnimationFrame(laco);
    }

    MOTORES[estado.modo].iniciar(paramsAtuais()); // não usa trocarModo() aqui: dispararia aoTrocar antes de "motor" existir do lado de fora
    raf = requestAnimationFrame(laco);

    return {
      trocarModo: trocarModo,
      obterModo: function () { return estado.modo; },
      obterParams: function () { return paramsAtuais(); },
      definirParam: function (k, v) { paramsAtuais()[k] = v; },
      aleatorizar: function () {
        var p = paramsAtuais();
        MODOS[estado.modo].params.forEach(function (def) {
          if (def.k === 'velocidade' || def.k === 'nomes') return;
          var r = def.min + Math.random() * (def.max - def.min);
          p[def.k] = def.passo >= 1 ? Math.round(r) : Math.round(r / def.passo) * def.passo;
        });
        MOTORES[estado.modo].iniciar(p);
      },
      /* devolve o código-fonte de verdade do modo pedido (ou do atual) — o mesmo
         que está rodando, nunca uma cópia que possa desalinhar com o tempo */
      codigoDoModo: function (nome) {
        nome = nome && MOTORES[nome] ? nome : estado.modo;
        var m = MOTORES[nome];
        var fnIniciar = m.iniciar.toString();
        var semIniciar = /function\s*\(\s*\)\s*\{\s*\}/.test(fnIniciar);
        return (semIniciar ? '' : fnIniciar + '\n\n') + m.desenhar.toString();
      },
      destruir: function () {
        vivo = false;
        window.removeEventListener('resize', aoRedimensionar);
        if (raf) cancelAnimationFrame(raf);
      },
    };
  }

  /* ---------- conteúdo real e verificável: lembrete cósmico e mapas ----------
     Compartilhado entre a página cheia e qualquer outro lugar que queira
     mostrar os mesmos painéis (por enquanto, só protetor.html usa isto). */
  function html_lembrete() {
    var LATITUDE_CAMPINAS = -22.9; // graus — ver aviso de honestidade abaixo
    var vRotacaoEquador = 1670; // km/h, valor bem estabelecido (circunferência da Terra ÷ 24h)
    var vRotacaoLocal = Math.round(vRotacaoEquador * Math.cos(LATITUDE_CAMPINAS * Math.PI / 180));
    var vOrbital = 107000; // km/h ao redor do Sol (≈ 29,78 km/s), bem estabelecido
    var vGalatica = 828000; // km/h do Sol ao redor da Via Láctea (ordem de grandeza; ~230 km/s)
    return {
      fatos:
        '<div class="pt-fato"><b>' + vRotacaoLocal.toLocaleString('pt-BR') + ' km/h</b><span>girando com a Terra, na latitude de Campinas (rotação — um dia inteiro para dar a volta)</span></div>' +
        '<div class="pt-fato"><b>' + vOrbital.toLocaleString('pt-BR') + ' km/h</b><span>orbitando o Sol (translação — um ano inteiro para dar a volta)</span></div>' +
        '<div class="pt-fato"><b>~' + vGalatica.toLocaleString('pt-BR') + ' km/h</b><span>o Sol inteiro orbitando o centro da Via Láctea (ordem de grandeza; ~230 km/s)</span></div>',
      litania:
        '<p><span class="n">I</span>Uma tela é luz obedecendo a um número; um número é uma intenção que aprendeu a viajar sem corpo.</p>' +
        '<p><span class="n">II</span>Entre o que você quis dizer e o que a máquina fez, há sempre uma tradução — e toda tradução perde algo e ganha outra coisa.</p>' +
        '<p><span class="n">III</span>Você não está sobre a Terra: você está girando com ela, agora mesmo, mais rápido que qualquer coisa que já dirigiu.</p>' +
        '<p><span class="n">IV</span>O código que desenhou esta forma cabe numa tela. A forma que ele desenha não cabe na imaginação de quem o escreveu sozinho — precisou da sua atenção para existir de verdade.</p>' +
        '<p><span class="n">V</span>Um espírito humano, num planeta girando, decidindo, por um instante, olhar para o padrão em vez de olhar para o relógio.</p>',
      aviso: 'Velocidades de rotação/translação: valores padrão de astronomia (bem estabelecidos). Latitude usada: Campinas-SP, porque é a cidade do plano em Cidade a Dois.md — ajuste se você estiver em outro lugar quando ler isto.',
    };
  }

  function html_mapas() {
    var DEGRAUS = [
      ['Terra → Lua', 384400, 'km'],
      ['Terra → Sol (1 UA)', 149600000, 'km'],
      ['Diâmetro do Sistema Solar (até a Cintura de Kuiper)', 11000000000, 'km'],
      ['Sol → centro da Via Láctea', 26000, 'anos-luz'],
      ['Diâmetro da Via Láctea', 100000, 'anos-luz'],
      ['Via Láctea → Andrômeda', 2500000, 'anos-luz'],
      ['Diâmetro do universo observável', 93000000000, 'anos-luz'],
    ];
    var maxLog = Math.log10(DEGRAUS[DEGRAUS.length - 1][1]);
    return {
      escada: DEGRAUS.map(function (d) {
        var pct = Math.max(4, (Math.log10(d[1]) / maxLog) * 100);
        return '<div class="pt-degrau"><b>' + d[0] + '</b><div class="pt-barra"><i style="width:' + pct + '%"></i></div><span class="pt-dist">' + d[1].toLocaleString('pt-BR') + ' ' + d[2] + '</span></div>';
      }).join(''),
      cidade:
        '<p><b>Campinas, SP</b> — inferido de <span class="pt-num">Cidade a Dois.md</span> (Cenário A: cursar Música na Unicamp, 2027–2030). Ajuste este painel se sua cidade real for outra.</p>' +
        '<ul>' +
        '<li><b>Onde ir:</b> Unicamp (Barão Geraldo); Estação Cultura (antiga estação ferroviária, hoje centro cultural); Parque Portugal ("Lagoa do Taquaral").</li>' +
        '<li><b>Rodovias:</b> Anhanguera (SP-330) e Bandeirantes (SP-348) para São Paulo; Dom Pedro I (SP-065) para o Vale do Paraíba/Nordeste do estado.</li>' +
        '<li><b>Transporte:</b> Aeroporto de Viracopos — um dos maiores hubs de carga aérea da América Latina.</li>' +
        '<li><b>Economia:</b> um dos maiores polos tecnológicos e industriais do interior de São Paulo (CPqD, parque de empresas de TI, Unicamp como âncora de pesquisa). <i>Números exatos de PIB/renda per capita: confira IBGE/Seade antes de citar — não estão verificados aqui.</i></li>' +
        '</ul>',
    };
  }

  window.Protetor = { MODOS: MODOS, ORDEM: ORDEM_MODOS, criar: criar, htmlLembrete: html_lembrete, htmlMapas: html_mapas };

  /* ============================================================
     Se esta página tem a casca cheia (#pt-tela, de protetor.html),
     monta sozinho toda a interface de tela cheia: dock, parâmetros,
     painéis de código/lembrete/mapas, tela cheia de verdade e o
     "some depois de um tempo parado" de um protetor de tela real.
     Um card embutido noutra página NÃO tem essa casca — só usa
     window.Protetor.criar() com um canvas pequeno e cuida da sua
     própria interface mínima (ver protetor-card.js).
     ============================================================ */
  var telaCheia = document.getElementById('pt-tela');
  if (!telaCheia) return;

  var motor = criar(telaCheia, {
    modoInicial: 'flores',
    aoTrocar: function () { desenharControles(); },
  });
  var inativoDesde = performance.now();
  var painelAberto = null;

  function desenharControles() {
    var modos = ORDEM_MODOS.map(function (k) {
      return '<button type="button" class="pt-modo" data-modo="' + k + '" aria-pressed="' + (k === motor.obterModo()) + '">' + MODOS[k].rot + '</button>';
    }).join('');
    var params = MODOS[motor.obterModo()].params.map(function (p) {
      var v = motor.obterParams()[p.k];
      var vv = typeof v === 'number' ? (Math.round(v * 1000) / 1000).toLocaleString('pt-BR') : v;
      return '<div class="pt-param"><label for="pt-p-' + p.k + '">' + p.rot + ' <b>' + vv + '</b></label><input id="pt-p-' + p.k + '" type="range" data-k="' + p.k + '" min="' + p.min + '" max="' + p.max + '" step="' + p.passo + '" value="' + v + '"></div>';
    }).join('');
    document.getElementById('pt-modos').innerHTML = modos;
    document.getElementById('pt-params').innerHTML = params;
    document.getElementById('pt-ajustes-t').textContent = 'Ajustes de ' + MODOS[motor.obterModo()].rot;
  }

  document.getElementById('pt-modos').addEventListener('click', function (e) {
    var b = e.target.closest('[data-modo]');
    if (b) motor.trocarModo(b.getAttribute('data-modo'));
  });
  document.getElementById('pt-params').addEventListener('input', function (e) {
    var i = e.target.closest('input[data-k]');
    if (!i) return;
    motor.definirParam(i.getAttribute('data-k'), parseFloat(i.value));
    var b = i.parentNode.querySelector('label b');
    if (b) b.textContent = (Math.round(parseFloat(i.value) * 1000) / 1000).toLocaleString('pt-BR');
  });

  function abrirPainel(id) {
    document.querySelectorAll('.pt-painel').forEach(function (p) { p.hidden = p.id !== id; });
    painelAberto = id;
  }
  function fecharPaineis() { document.querySelectorAll('.pt-painel').forEach(function (p) { p.hidden = true; }); painelAberto = null; mostrarAjustes(false); }

  /* ajustes: os controles do modo, num painel que abre e fecha */
  var ajustes = document.getElementById('pt-ajustes'), botaoAjustes = document.getElementById('pt-abrir-ajustes');
  function mostrarAjustes(abrir) { ajustes.hidden = !abrir; botaoAjustes.setAttribute('aria-expanded', String(abrir)); }
  botaoAjustes.addEventListener('click', function () { mostrarAjustes(ajustes.hidden); });

  document.getElementById('pt-ver-codigo').addEventListener('click', function () {
    var nome = motor.obterModo();
    document.getElementById('pt-codigo-titulo').textContent = 'O código de "' + MODOS[nome].rot + '"';
    document.getElementById('pt-codigo-matematica').innerHTML = MODOS[nome].matematica;
    document.getElementById('pt-codigo-fonte').textContent = motor.codigoDoModo(nome);
    abrirPainel('pt-painel-codigo');
  });
  document.getElementById('pt-ver-lembrete').addEventListener('click', function () { abrirPainel('pt-painel-lembrete'); });
  document.getElementById('pt-ver-mapas').addEventListener('click', function () { abrirPainel('pt-painel-mapas'); });
  document.querySelectorAll('.pt-fechar').forEach(function (b) { b.addEventListener('click', fecharPaineis); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharPaineis(); });

  document.getElementById('pt-tela-cheia').addEventListener('click', function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(function () {});
  });
  document.getElementById('pt-aleatorizar').addEventListener('click', function () { motor.aleatorizar(); desenharControles(); });

  /* oculta o painel de controles depois de um tempo parado, como um protetor de tela de verdade */
  function marcarAtividade() { inativoDesde = performance.now(); document.body.classList.remove('pt-oculto'); }
  ['mousemove', 'pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, marcarAtividade, { passive: true }); });
  setInterval(function () { if (performance.now() - inativoDesde > 6000 && !painelAberto && ajustes.hidden) document.body.classList.add('pt-oculto'); }, 1000);

  var lembrete = html_lembrete();
  document.getElementById('pt-fatos').innerHTML = lembrete.fatos;
  document.getElementById('pt-litania').innerHTML = lembrete.litania;
  document.getElementById('pt-lembrete-aviso').textContent = lembrete.aviso;
  var mapas = html_mapas();
  document.getElementById('pt-escada').innerHTML = mapas.escada;
  document.getElementById('pt-cidade').innerHTML = mapas.cidade;

  desenharControles();

  /* ---------- o relógio, a data, os dias até a prova e as frases do caderno ---------- */
  var FRASES = ['Um tijolo sólido por dia', 'A ideia não foge — o dia é que foge', 'Sem julgar: só contar', 'A prova pergunta. O cursinho responde', 'Teste antes de estudar'];
  var prova = null, iFrase = 0;
  function atualizarRelogio() {
    var d = new Date();
    document.getElementById('pt-hora').textContent = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    var data = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    var resto = '';
    if (prova) {
      var dias = Math.ceil((prova - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5);
      if (dias > 0) resto = ' · faltam <b>' + dias + ' dia' + (dias > 1 ? 's' : '') + '</b> para a prova';
      else if (dias === 0) resto = ' · <b>hoje é a prova</b>';
    }
    document.getElementById('pt-data').innerHTML = data.charAt(0).toUpperCase() + data.slice(1) + resto;
  }
  function trocarFrase() {
    var el = document.getElementById('pt-frase');
    el.style.opacity = 0;
    setTimeout(function () { el.textContent = FRASES[iFrase++ % FRASES.length]; el.style.opacity = 1; }, 600);
  }
  fetch('/api/estado').then(function (r) { return r.ok ? r.json() : null; }).then(function (e) {
    if (!e) return;
    if (e.contagem && e.contagem.prova) { var p = e.contagem.prova.split('-'); prova = new Date(+p[0], +p[1] - 1, +p[2]); }
    if (e.frases && e.frases.length) FRASES = e.frases.map(function (f) { return f.texto; }).filter(Boolean).concat(FRASES);
    atualizarRelogio();
  }).catch(function () {});
  atualizarRelogio(); trocarFrase();
  setInterval(atualizarRelogio, 10000);
  setInterval(trocarFrase, 20000);
})();
