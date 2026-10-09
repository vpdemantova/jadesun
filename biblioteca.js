(function () {
  'use strict';

  const P = window.Perfil;
  const MD = window.MD;
  const esc = P.esc;
  const $ = (id) => document.getElementById(id);
  const topo = $('topo');
  const vista = $('vista');

  let IND = null;
  const secaoPorId = new Map();
  const acervoDaSecao = new Map();
  const nomeAcervo = new Map();
  let imagensDaFicha = [];
  let mapaInst = null;
  let mapaGrande = null;
  let lbIndice = 0;
  let debounce = 0;

  const PAGINA = 60;

  function corDaSecao(acervoId, nome) {
    if (acervoId !== 'selecao') return '';
    if (/ingl/i.test(nome)) return 'ing';
    return P.corDe(nome);
  }

  function capa(url, titulo, cls) {
    if (url) return '<span class="' + (cls || 'th') + '"><img src="' + esc(url) + '" alt="" loading="lazy" decoding="async"></span>';
    return '<span class="' + (cls || 'th') + ' ph"><b>' + esc((titulo || '?').replace(/^[^A-Za-zÀ-ÿ0-9]+/, '').charAt(0).toUpperCase()) + '</b></span>';
  }

  function migalhas(itens) {
    return '<nav class="migalhas" aria-label="Onde estou">' + itens.map(function (m, i) {
      const ult = i === itens.length - 1;
      return m.href && !ult ? '<a href="' + m.href + '">' + esc(m.txt) + '</a>' : '<span>' + esc(m.txt) + '</span>';
    }).join('<i>›</i>') + '</nav>';
  }

  function cabecalho(rot, titulo, resposta, extra) {
    topo.innerHTML = '<p class="rot"><span>' + esc(rot[0]) + '</span><span>' + esc(rot[1] || '') + '</span></p>' +
      '<h1 class="' + (extra && extra.pequeno ? 'ficha-t' : 'mega') + '">' + esc(titulo) + '</h1>' +
      (resposta ? '<p class="resposta">' + esc(resposta) + '</p>' : '');
  }

  function cartaoItem(it) {
    const secao = secaoPorId.get(it[2]);
    const cor = secao ? corDaSecao(secao.acervo, secao.nome) : '';
    return '<a class="fc ' + cor + '" href="#f=' + encodeURI(it[0]) + '">' + capa(it[5], it[1], 'fc-img') +
      '<b>' + esc(it[1]) + '</b>' +
      '<span class="rot suave">' + esc(it[4] || (secao ? secao.nome : '')) + (it[7] ? ' · ' + it[7] + ' img' : '') + '</span>' +
      (it[6] ? '<small>' + esc(it[6]) + '</small>' : '') + '</a>';
  }

  function miniCartao(c) {
    return '<a class="mc" href="#f=' + encodeURI(c.id) + '">' + capa(c.capa, c.titulo, 'mc-img') +
      '<b>' + esc(c.titulo) + '</b><span class="rot suave">' + esc(c.secao) + (c.vezes ? ' · ' + c.vezes + '×' : '') + '</span></a>';
  }

  /* ---------- HOME ---------- */
  function home() {
    document.title = 'Biblioteca — Portal Solar';
    cabecalho(['+ / Biblioteca', IND.total.toLocaleString('pt-BR') + ' fichas · ' + IND.imagens.toLocaleString('pt-BR') + ' imagens'], 'Biblioteca',
      'Tudo o que você guardou, num só lugar: matérias, elementos, ofícios, objetos, línguas, mitologia, pessoas. Clique em qualquer coisa e abra a ficha completa, com imagens e tudo o que se liga a ela.');
    vista.innerHTML =
      '<div class="cx bib-busca"><label class="rot" for="q">Buscar em todas as fichas <span class="suave">(tecla /)</span></label>' +
      '<input id="q" type="search" autocomplete="off" placeholder="quartzo, Kepler, marcenaria, juros compostos…"></div>' +
      '<div id="achados"></div>' +
      IND.acervos.map(function (a) {
        return '<section class="acervo"><header><h2 class="h2">' + esc(a.nome) + '</h2><p>' + esc(a.descricao) + '</p><span class="rot suave">' + a.total + ' fichas</span></header>' +
          '<div class="secoes">' + a.secoes.map(function (s) {
            const cor = corDaSecao(a.id, s.nome);
            const capas = s.capas.length ? '<span class="tile-capas n' + Math.min(4, s.capas.length) + '">' + s.capas.map(function (c) { return '<img src="' + esc(c) + '" alt="" loading="lazy" decoding="async">'; }).join('') + '</span>' : '<span class="tile-capas vazio"></span>';
            return '<a class="tile ' + cor + '" href="#s=' + encodeURI(s.id) + '">' + capas + '<b>' + esc(s.nome) + '</b><span class="rot">' + s.total + ' fichas' + (s.imagens ? ' · ' + s.imagens + ' img' : '') + '</span></a>';
          }).join('') + '</div></section>';
      }).join('');
    ligarBusca('');
  }

  /* ---------- BUSCA ---------- */
  function ligarBusca(valor) {
    const q = $('q');
    if (!q) return;
    q.value = valor || '';
    q.addEventListener('input', function () {
      clearTimeout(debounce);
      const v = q.value.trim();
      debounce = setTimeout(function () { buscar(v); }, 220);
    });
    if (valor) buscar(valor);
  }

  function buscar(v) {
    const alvo = $('achados');
    if (!alvo) return;
    if (v.length < 2) { alvo.innerHTML = ''; return; }
    alvo.innerHTML = '<p class="rot suave" style="margin:1rem 0">Procurando…</p>';
    fetch('/api/buscar?q=' + encodeURIComponent(v)).then(function (r) { return r.json(); }).then(function (lista) {
      if (($('q') || {}).value.trim() !== v) return;
      alvo.innerHTML = lista.length
        ? '<div class="res-lista"><p class="rot suave">' + lista.length + (lista.length === 40 ? '+' : '') + ' resultados</p>' + lista.map(function (r) {
          return '<a class="res" href="#f=' + encodeURI(r.id) + '">' + capa(r.capa, r.titulo, 'th') + '<div><b>' + esc(r.titulo) + '</b> <span class="rot suave">' + esc(nomeAcervo.get(r.acervo) || '') + ' › ' + esc(r.secao) + '</span><p>' + esc(r.trecho) + '</p></div></a>';
        }).join('') + '</div>'
        : '<p class="vazio-msg">Nada com “' + esc(v) + '”. Tente outra palavra, ou sem acento.</p>';
    }).catch(function () { alvo.innerHTML = '<p class="vazio-msg">Não consegui buscar. O servidor está ligado?</p>'; });
  }

  /* ---------- SEÇÃO ---------- */
  function secaoView(id) {
    const s = secaoPorId.get(id);
    if (!s) { vista.innerHTML = '<p class="vazio-msg">Seção não encontrada. <a href="#">Voltar</a></p>'; return; }
    const ac = nomeAcervo.get(s.acervo);
    document.title = s.nome + ' — Biblioteca';
    cabecalho([ac, s.total + ' fichas'], s.nome, '');
    const todos = IND.itens.filter(function (x) { return x[2] === id; });
    let sub = '';
    let filtro = '';
    let quantas = PAGINA;

    vista.innerHTML = migalhas([{ txt: 'Biblioteca', href: '#' }, { txt: ac }, { txt: s.nome }]) +
      '<div class="barra-sec"><input id="filtro" type="search" placeholder="Filtrar dentro de ' + esc(s.nome) + '…" autocomplete="off">' +
      (s.subs.length > 1 ? '<div class="chips" id="subs"><button type="button" class="chip on" data-sub="">Tudo</button>' + s.subs.map(function (u) { return '<button type="button" class="chip" data-sub="' + esc(u.nome) + '">' + esc(u.nome) + ' <small>' + u.total + '</small></button>'; }).join('') + '</div>' : '') +
      '</div><div class="fc-grade" id="lista"></div><p class="mais" id="mais"></p>';

    function desenhar() {
      const nt = filtro.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const lista = todos.filter(function (x) {
        if (sub && x[3] !== sub) return false;
        if (!nt) return true;
        return (x[1] + ' ' + x[6]).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').indexOf(nt) >= 0;
      });
      $('lista').innerHTML = lista.slice(0, quantas).map(cartaoItem).join('') || '<p class="vazio-msg">Nenhuma ficha com esse filtro.</p>';
      const m = $('mais');
      m.innerHTML = lista.length > quantas ? '<button class="botao" type="button" id="b-mais">Mostrar mais ' + Math.min(PAGINA, lista.length - quantas) + ' (' + (lista.length - quantas) + ' restam)</button>' : '<span class="rot suave">' + lista.length + ' ' + (lista.length === 1 ? 'ficha' : 'fichas') + '</span>';
      const b = $('b-mais');
      if (b) b.addEventListener('click', function () { quantas += PAGINA; desenhar(); });
    }
    $('filtro').addEventListener('input', function (e) { filtro = e.target.value; quantas = PAGINA; desenhar(); });
    const subs = $('subs');
    if (subs) subs.addEventListener('click', function (e) {
      const b = e.target.closest('button');
      if (!b) return;
      sub = b.dataset.sub;
      quantas = PAGINA;
      subs.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c === b); });
      desenhar();
    });
    desenhar();
  }

  /* ---------- FICHA ---------- */
  const ROTULOS = { materia: 'Matéria', codigo: 'Código', unidade: 'Unidade', programa: 'Programa', prioridade: 'Prioridade', tipo: 'Tipo', formula: 'Fórmula', fonte: 'Fonte', dominio: 'Domínio', 'domínio': 'Domínio', 'área': 'Área', area: 'Área' };
  function rotuloFato(k) { return ROTULOS[k] || k.charAt(0).toUpperCase() + k.slice(1); }

  function credito(i) {
    const partes = [];
    if (i.autor) partes.push(esc(i.autor));
    if (i.licenca) partes.push(esc(i.licenca));
    if (i.fonte && /^https?:\/\//.test(i.fonte)) partes.push('<a href="' + esc(i.fonte) + '" target="_blank" rel="noopener noreferrer">origem</a>');
    return partes.join(' · ');
  }

  function grupoRel(titulo, lista, dica) {
    if (!lista || !lista.length) return '';
    return '<section class="rel"><header><h3 class="h3">' + esc(titulo) + '</h3><span class="rot suave">' + lista.length + (dica ? ' · ' + esc(dica) : '') + '</span></header><div class="mc-grade">' + lista.map(miniCartao).join('') + '</div></section>';
  }

  function hierarquiaHtml(f) {
    const por = {};
    f.hierarquia.forEach(function (g) { por[g.rotulo] = g.itens; });
    const chip = function (x) {
      return x.id ? '<a class="chip-h" href="#f=' + encodeURI(x.id) + '">' + esc(x.titulo) + '</a>' : '<span class="chip-h sem" title="Citado, mas ainda sem ficha no caderno">' + esc(x.titulo) + '</span>';
    };
    const bloco = function (rotulo, lista) { return lista && lista.length ? '<div class="h-bloco"><span class="rot suave">' + esc(rotulo) + '</span><div class="h-chips">' + lista.map(chip).join('') + '</div></div>' : ''; };
    const cima = bloco(por['Pré-requisito'] ? 'Antes (pré-requisito)' : 'Acima — o que a contém', por['Acima'] || por['Pré-requisito']);
    const baixo = bloco(por['Abre'] ? 'Depois (o que abre)' : 'Abaixo — o que a compõe', por['Abaixo'] || por['Abre']);
    const lado = bloco('Ao lado — análogos', por['Ao lado']);
    if (!cima && !baixo && !lado) return '';
    return '<div class="cx hier"><p class="rot">Hierarquia</p>' + cima + (cima ? '<span class="seta">↓</span>' : '') +
      '<div class="h-esta">' + esc(f.titulo) + '</div>' + (baixo ? '<span class="seta">↓</span>' : '') + baixo + lado + '</div>';
  }

  function fichaView(id) {
    if (mapaInst) { mapaInst.destruir(); mapaInst = null; }
    vista.innerHTML = '<p class="rot suave" style="padding:2rem 0">Abrindo a ficha…</p>';
    fetch('/api/ficha?id=' + encodeURIComponent(id)).then(function (r) {
      if (!r.ok) throw new Error('nf');
      return r.json();
    }).then(function (f) {
      document.title = f.titulo + ' — Biblioteca';
      imagensDaFicha = f.imagens;
      const cor = corDaSecao(f.acervo, f.secao);
      const palavras = f.corpo.split(/\s+/).length;
      cabecalho([nomeAcervo.get(f.acervo) + ' › ' + f.secao, f.codigo || f.tipo || ''], f.titulo, '', { pequeno: true });

      const corpoHtml = MD.render(f.corpo.replace(/^\s*#\s+.*\n?/, ''));
      const heroSrc = f.imagens[0] && f.corpo.indexOf(f.imagens[0].src) < 0 ? f.imagens[0] : null;
      const fatos = Object.keys(f.fatos).filter(function (k) { return f.fatos[k]; });

      vista.innerHTML =
        migalhas([{ txt: 'Biblioteca', href: '#' }, { txt: nomeAcervo.get(f.acervo) }, { txt: f.secao, href: '#s=' + encodeURI(f.secaoId) }].concat(f.sub ? [{ txt: f.sub }] : [], [{ txt: f.titulo }])) +
        '<div class="ficha-acoes acoes">' +
        '<a class="botao sinal" href="copiar.html?f=' + encodeURIComponent(f.id) + '">Copiar à mão</a>' +
        (f.anterior ? '<a class="botao leve" href="#f=' + encodeURI(f.anterior.id) + '" title="' + esc(f.anterior.titulo) + '">← Anterior</a>' : '') +
        (f.proximo ? '<a class="botao leve" href="#f=' + encodeURI(f.proximo.id) + '" title="' + esc(f.proximo.titulo) + '">Próxima →</a>' : '') +
        (f.caminho ? '<button class="botao leve" type="button" id="b-caminho" title="Copiar o caminho do arquivo no caderno">Onde está no caderno</button>' : '') +
        '</div>' +
        '<p class="caminho mono" id="caminho" hidden>' + esc(f.caminho) + '</p>' +
        '<div class="grade ficha ' + cor + '">' +
          '<article class="c-8 md" id="md">' +
            (heroSrc ? '<figure class="hero"><img src="' + esc(heroSrc.src) + '" alt="' + esc(heroSrc.legenda) + '" data-zoom="1"><figcaption>' + credito(heroSrc) + '</figcaption></figure>' : '') +
            corpoHtml +
            '<p class="rot suave leitura">' + palavras.toLocaleString('pt-BR') + ' palavras · ~' + Math.max(1, Math.round(palavras / 200)) + ' min de leitura</p>' +
          '</article>' +
          '<aside class="c-4 lateral">' +
            (fatos.length ? '<div class="cx"><p class="rot">Ficha técnica</p><dl class="fatos">' + fatos.map(function (k) { return '<dt>' + esc(rotuloFato(k)) + '</dt><dd>' + esc(f.fatos[k]) + '</dd>'; }).join('') + '</dl></div>' : '') +
            hierarquiaHtml(f) + mapaHtml(f) +
            (f.imagens.length ? '<div class="cx"><p class="rot">Imagens · ' + f.imagens.length + '</p><div class="gal">' + f.imagens.slice(0, 12).map(function (i, n) { return '<button type="button" class="gal-b" data-i="' + n + '" title="' + esc(i.legenda) + '"><img src="' + esc(i.src) + '" alt="' + esc(i.legenda) + '" loading="lazy"></button>'; }).join('') + '</div>' + (f.imagens.length > 12 ? '<p class="rot suave" style="margin-top:.6rem">+ ' + (f.imagens.length - 12) + ' no texto</p>' : '') + '</div>' : '') +
            '<div class="cx toc-cx" id="toc-cx" hidden><p class="rot">Neste texto</p><ul class="toc" id="toc"></ul></div>' +
          '</aside>' +
        '</div>' +
        grupoRel('Esta ficha cita', f.saem) +
        grupoRel('Citada por', f.chegam, 'quem aponta para cá') +
        grupoRel('Parecidas e análogas', f.parecidos, 'ligações em comum') +
        grupoRel('Mencionada no texto de', f.mencoes, 'sem link ainda') +
        (f.vizinhos.length ? '<section class="rel"><header><h3 class="h3">Na mesma pasta</h3><span class="rot suave">' + esc(f.sub || f.secao) + ' · ' + (f.vizinhos.length + 1) + '</span></header><div class="mc-grade">' + f.vizinhos.map(miniCartao).join('') + '</div></section>' : '');

      const toc = $('toc');
      const hs = $('md').querySelectorAll('h2, h3');
      if (hs.length > 2) {
        toc.innerHTML = Array.prototype.map.call(hs, function (h, n) {
          h.id = h.id || 'h' + n;
          var e = h.querySelector('.md-emo');
          var rotulo = h.textContent.slice(e ? e.textContent.length : 0);
          return '<li class="n' + h.tagName.slice(1) + '"><button type="button" data-a="' + h.id + '">' + (e ? '<span class="md-emo" aria-hidden="true">' + esc(e.textContent) + '</span>' : '') + esc(rotulo) + '</button></li>';
        }).join('');
        $('toc-cx').hidden = false;
        toc.addEventListener('click', function (e) {
          const b = e.target.closest('button');
          if (b) var alvoH = document.getElementById(b.dataset.a); if (window.Movimento) window.Movimento.rolarPara(alvoH); else alvoH.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
      if ($('b-caminho')) $('b-caminho').addEventListener('click', function () { $('caminho').hidden = !$('caminho').hidden; });
      montarMapa(f);
      if (f.acervo === 'atlas' && f.corpo.length < 900 && !/^##\s/m.test(f.corpo)) {
        const eOficio = /ofício/i.test(f.fatos.tipo || '') || /Ofícios/.test(f.secao);
        const partes = eOficio
          ? ['O que é', 'Materiais e matérias-primas', 'Ferramentas e máquinas', 'Como se faz', 'História', 'Mestres e obras', 'Usos e cadeias']
          : ['O que é', 'Composição', 'Estrutura', 'Leis de formação', 'Extração e obtenção', 'Ferramentas', 'Usos e cadeias'];
        const esqueleto = partes.map(function (p) { return '## ' + p + '\n\n(escreva aqui)\n'; }).join('\n') + '\n## Elos\n\n- **Acima:** \n- **Abaixo:** \n- **Ao lado:** \n';
        const caixa = document.createElement('div');
        caixa.className = 'cx curta';
        caixa.innerHTML = '<p class="rot">Ficha curta: só a introdução</p><p>Para virar uma ficha completa, como a do Quartzo, faltam: ' + partes.map(esc).join(', ') + ' e os elos (acima, abaixo, ao lado). Copie o esqueleto, cole no arquivo desta ficha no Obsidian e preencha uma parte por vez.</p>' +
          '<div class="acoes"><button class="botao" type="button" id="b-esq">Copiar esqueleto</button><span class="rot suave" id="msg-esq"></span></div>';
        $('md').appendChild(caixa);
        $('b-esq').addEventListener('click', function () {
          const fim = function (ok) { $('msg-esq').textContent = ok ? 'Copiado. Cole no arquivo: ' + f.caminho : 'Não consegui copiar; selecione e copie à mão.'; };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(esqueleto).then(function () { fim(true); }, function () { fim(false); });
          else fim(false);
        });
      }
      $('md').addEventListener('click', function (e) {
        const im = e.target.closest('img[data-zoom]');
        if (!im) return;
        const n = imagensDaFicha.findIndex(function (x) { return im.src.indexOf(x.src) >= 0 || decodeURIComponent(im.src).indexOf(decodeURIComponent(x.src)) >= 0; });
        abrirLb(n >= 0 ? n : 0);
      });
      vista.querySelectorAll('.gal-b').forEach(function (b) { b.addEventListener('click', function () { abrirLb(+b.dataset.i); }); });
    }).catch(function () {
      vista.innerHTML = '<div class="cx"><p class="rot">Ficha não encontrada</p><p>Esta ficha não existe mais ou o servidor está desligado. <a href="#">Voltar à biblioteca</a></p></div>';
    });
  }

  /* ---------- MAPA DE CONCEITOS ---------- */
  function temMapa(f) { return !!(f.saem.length || f.chegam.length || f.hierarquia.length || f.parecidos.length); }

  function mapaHtml(f) {
    if (!window.Mapa || !temMapa(f)) return '';
    return '<div class="cx mapa-cx"><p class="rot">Mapa de conceitos</p><canvas id="mapa" class="mapa-tela"></canvas>' +
      '<p class="mapa-leg"><span><i class="a"></i>acima</span><span><i class="b"></i>abaixo</span><span><i class="l"></i>ao lado</span><span><i class="c"></i>cita</span><span><i class="d"></i>citada por</span><span><i class="s"></i>sem ficha</span></p>' +
      '<div class="acoes"><button class="botao leve" type="button" id="b-mapa-g">Ampliar o mapa</button><span class="rot suave" id="mapa-info"></span></div></div>';
  }

  function montarMapa(f) {
    const tela = $('mapa');
    if (!tela) return;
    const ir = function (id) { fecharMapaGrande(); location.hash = '#f=' + id; };
    mapaInst = window.Mapa.montar(tela, f, { ir: ir });
    $('mapa-info').textContent = mapaInst.total + ' ligações' + (mapaInst.semFicha ? ' · ' + mapaInst.semFicha + ' sem ficha' : '');
    $('b-mapa-g').addEventListener('click', function () {
      fecharMapaGrande();
      const caixa = document.createElement('div');
      caixa.className = 'lb mapa-lb';
      caixa.innerHTML = '<button type="button" class="lb-x" aria-label="Fechar">×</button><canvas class="mapa-grande"></canvas>';
      document.body.appendChild(caixa);
      caixa.addEventListener('click', function (e) { if (e.target === caixa || e.target.classList.contains('lb-x')) fecharMapaGrande(); });
      mapaGrande = { caixa: caixa, inst: window.Mapa.montar(caixa.querySelector('canvas'), f, { ir: ir }) };
    });
  }

  function fecharMapaGrande() {
    if (!mapaGrande) return;
    mapaGrande.inst.destruir();
    mapaGrande.caixa.remove();
    mapaGrande = null;
  }

  /* ---------- LIGHTBOX ---------- */
  let lb;
  function montarLb() {
    lb = document.createElement('div');
    lb.className = 'lb';
    lb.hidden = true;
    lb.innerHTML = '<button type="button" class="lb-x" aria-label="Fechar">×</button><button type="button" class="lb-p" aria-label="Anterior">‹</button><button type="button" class="lb-n" aria-label="Próxima">›</button><figure><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(lb);
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-x')) fecharLb(); });
    lb.querySelector('.lb-p').addEventListener('click', function () { mudarLb(-1); });
    lb.querySelector('.lb-n').addEventListener('click', function () { mudarLb(1); });
  }
  function abrirLb(n) {
    if (!imagensDaFicha.length) return;
    if (!lb) montarLb();
    lbIndice = (n + imagensDaFicha.length) % imagensDaFicha.length;
    const i = imagensDaFicha[lbIndice];
    lb.querySelector('img').src = i.src;
    lb.querySelector('figcaption').innerHTML = '<b>' + esc(i.legenda) + '</b><span>' + credito(i) + ' · ' + (lbIndice + 1) + '/' + imagensDaFicha.length + '</span>';
    lb.hidden = false;
  }
  function fecharLb() { if (lb) lb.hidden = true; }
  function mudarLb(d) { abrirLb(lbIndice + d); }

  document.addEventListener('keydown', function (e) {
    const t = e.target && e.target.tagName;
    if (lb && !lb.hidden) {
      if (e.key === 'Escape') fecharLb();
      if (e.key === 'ArrowLeft') mudarLb(-1);
      if (e.key === 'ArrowRight') mudarLb(1);
      return;
    }
    if (e.key === '/' && t !== 'INPUT' && t !== 'TEXTAREA') {
      const q = $('q') || $('filtro');
      if (q) { e.preventDefault(); q.focus(); }
    }
  });

  /* ---------- ROTAS ---------- */
  function rota() {
    const h = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (h.indexOf('f=') === 0) return { t: 'f', v: h.slice(2) };
    if (h.indexOf('s=') === 0) return { t: 's', v: h.slice(2) };
    if (h.indexOf('q=') === 0) return { t: 'q', v: h.slice(2) };
    return { t: 'h' };
  }

  function desenhar() {
    if (!IND) return;
    const r = rota();
    if (window.Movimento) window.Movimento.topo(); else window.scrollTo(0, 0);
    if (r.t === 'f') fichaView(r.v);
    else if (r.t === 's') secaoView(r.v);
    else { home(); if (r.t === 'q') ligarBusca(r.v); }
  }

  fetch('/api/biblioteca').then(function (r) { return r.json(); }).then(function (ind) {
    IND = ind;
    ind.acervos.forEach(function (a) {
      nomeAcervo.set(a.id, a.nome);
      a.secoes.forEach(function (s) { secaoPorId.set(s.id, { id: s.id, nome: s.nome, total: s.total, subs: s.subs, acervo: a.id }); });
    });
    window.addEventListener('hashchange', desenhar);
    desenhar();
  }).catch(function () {
    topo.innerHTML = '<h1 class="mega">Biblioteca</h1>';
    vista.innerHTML = '<div class="cx"><p class="rot">Servidor desligado</p><p>Abra <b>hoje.bat</b> para ligar.</p></div>';
  });
})();
