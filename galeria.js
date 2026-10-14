/* ============================================================
   Portal Solar · galeria.js (13/out/2026) — a Galeria de design.
   Pedido: "os designs vão ser públicos… uma galeria de design com opções
   pra todas as novas U.I. e sites com referências de designs e interfaces
   futuristas e timeless".

   1. Experimente: as opções que já existem, com uma página em miniatura;
      um toque aplica (as mesmas chaves do Personalizar, guardadas neste navegador).
   2. O sistema aberto: as cores de cada tema, as das matérias, as letras, a marca;
      e os tokens para baixar (formato W3C Design Tokens: $value e $type).
   3. As propostas da comunidade (galeria-dados.js), com autor e licença.
   4. As referências: atemporais e futuristas, só com nome, data e link.
   ============================================================ */
(function () {
  'use strict';
  var P = window.Perfil || {};
  var G = window.GALERIA || { opcoes: [], referencias: [], propostas: [] };
  var C = window.COLETIVO_CONFIG || {};
  var T = window.PersTema;
  var raiz = document.getElementById('galeria');
  if (!raiz) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ic(n) { return P.icone ? P.icone(n) : ''; }
  var filtro = 'todas';

  /* ── 1. experimente ── */
  function salvo() { return T ? T.salvo() : {}; }
  function emUso(chave, valor) {
    var s = salvo();
    if (chave === 'aparencia') { var p = valor.split('|'); return s.estilo === p[0] && (p[0] === 'classico' || s.acabamento === p[1]); }
    if (chave === 'movimento') { var pr = T && T.presets && T.presets[valor]; return !!pr && Object.keys(pr).every(function (k) { return s[k] === pr[k]; }); }
    return s[chave] === valor;
  }
  function mini(chave, valor, d) {
    var base = '<i class="ga-barra"></i><i class="ga-q"></i><i class="ga-t"></i><i class="ga-l1"></i><i class="ga-l2"></i><i class="ga-l3"></i><i class="ga-c"></i><i class="ga-s"></i>';
    if (chave === 'tema') return '<div class="ga-mini' + (d.meio ? ' ga-meio' : '') + '" style="--m-papel:' + d.papel + ';--m-tinta:' + d.tinta + ';--m-sinal:' + d.sinal + (d.meio ? ';--m-meio:' + d.meio : '') + '" aria-hidden="true">' + base + '</div>';
    if (chave === 'aparencia') return '<div class="ga-mini ap-' + (d.estilo === 'classico' ? 'classico' : d.acabamento) + '" style="--m-papel:var(--papel);--m-tinta:var(--tinta);--m-sinal:var(--sinal)" aria-hidden="true">' + base + '</div>';
    if (chave === 'marca') return '<div class="ga-mini ga-marca" style="--m-q:' + d.q + ';--m-fundo:' + d.fundo + '" aria-hidden="true"></div>';
    if (chave === 'menu') {
      var portas = valor === 'simetrico' ? [8, 18, 28, 64, 74, 84] : [6, 16, 26, 36, 46];
      return '<div class="ga-mini ga-menu" style="--m-papel:var(--papel);--m-tinta:var(--tinta);--m-sinal:var(--sinal)" aria-hidden="true"><i class="ga-barra"></i>' +
        (valor === 'simetrico' ? '<i class="ga-q"></i>' : '') + portas.map(function (x) { return '<i class="ga-p" style="left:' + x + '%"></i>'; }).join('') +
        '<i class="ga-t"></i><i class="ga-l1"></i><i class="ga-l2"></i><i class="ga-c"></i></div>';
    }
    /* movimento: o brilho diz quanto se mexe */
    var brilho = valor === 'imersivo' ? 'radial-gradient(40% 60% at 70% 40%, color-mix(in srgb, var(--sinal) 45%, transparent), transparent 70%)' : valor === 'fino' ? 'linear-gradient(90deg, transparent 40%, color-mix(in srgb, var(--sinal) 14%, transparent) 50%, transparent 60%)' : 'none';
    return '<div class="ga-mini" style="--m-papel:var(--papel);--m-tinta:var(--tinta);--m-sinal:var(--sinal);background-image:' + brilho + '" aria-hidden="true">' + base + '</div>';
  }
  function htmlOpcoes() {
    return G.opcoes.map(function (g) {
      return '<div class="ga-grupo"><h3>' + esc(g.grupo) + ' <small>' + esc(g.desc) + '</small></h3><div class="ga-opcoes">' + g.itens.map(function (it) {
        var uso = emUso(g.chave, it[0]);
        return '<div class="ga-op" data-uso="' + (uso ? 1 : 0) + '">' + mini(g.chave, it[0], it[3]) +
          '<b>' + esc(it[1]) + '</b><span>' + esc(it[2]) + '</span>' +
          '<button type="button" data-ch="' + g.chave + '" data-v="' + esc(it[0]) + '" aria-pressed="' + uso + '">' + (uso ? 'Em uso' : 'Experimentar') + '</button></div>';
      }).join('') + '</div></div>';
    }).join('');
  }
  function aplicar(chave, valor) {
    if (!T) return;
    var o = T.salvo(), recarregar = false;
    var g = G.opcoes.filter(function (x) { return x.chave === chave; })[0];
    var it = g && g.itens.filter(function (x) { return x[0] === valor; })[0];
    if (chave === 'aparencia' && it) { recarregar = o.estilo !== it[3].estilo; o.estilo = it[3].estilo; if (it[3].acabamento) o.acabamento = it[3].acabamento; }
    else if (chave === 'movimento') Object.assign(o, (T.presets || {})[valor] || {});
    else { if (chave === 'menu') recarregar = o.menu !== valor; o[chave] = valor; }
    T.gravar(o);
    if (recarregar) { location.reload(); return; }
    T.aplicar(T.efetivo());
    var cx = document.getElementById('ga-opcoes'); if (cx) cx.innerHTML = htmlOpcoes();
  }

  /* ── 2. o sistema aberto ── */
  var MATERIAS = [['lin', 'Linguagens'], ['his', 'História'], ['geo', 'Geografia'], ['qui', 'Química'], ['bio', 'Biologia'], ['mat', 'Matemática'], ['fis', 'Física'], ['fil', 'Filosofia'], ['soc', 'Sociologia']];
  function css(nome) { return getComputedStyle(document.documentElement).getPropertyValue(nome).trim(); }
  function fonte(nome) { return (css(nome) || '').split(',')[0].replace(/["']/g, '').trim(); }
  function htmlSistema() {
    var temas = (G.opcoes.filter(function (g) { return g.chave === 'tema'; })[0] || { itens: [] }).itens.filter(function (t) { return t[0] !== 'auto'; });
    return '<div class="ga-sistema">' +
      '<div class="ga-sis"><h3>As cores de cada tema</h3><div class="ga-amostras">' + temas.map(function (t) {
        return '<div class="ga-amostra"><i style="background:linear-gradient(90deg,' + t[3].papel + ' 0 50%,' + t[3].tinta + ' 50% 85%,' + t[3].sinal + ' 85%)"></i><span>' + esc(t[1]) + '</span><code>' + t[3].papel + ' · ' + t[3].tinta + ' · ' + t[3].sinal + '</code></div>';
      }).join('') + '</div></div>' +
      '<div class="ga-sis"><h3>As cores das matérias</h3><div class="ga-amostras">' + MATERIAS.map(function (m) {
        var v = css('--' + m[0]);
        return '<div class="ga-amostra"><i style="background:' + esc(v) + '"></i><span>' + esc(m[1]) + '</span><code>' + esc(v) + '</code></div>';
      }).join('') + '</div></div>' +
      '<div class="ga-sis ga-letras"><h3>As letras</h3>' +
        '<p><b>Títulos e botões</b><span style="font:800 1.4rem/1.1 var(--f-display)">' + esc(fonte('--f-display') || 'Gabarito') + '</span></p>' +
        '<p><b>Texto de ler</b><span style="font:400 1.15rem/1.4 var(--f-texto)">' + esc(fonte('--f-texto') || 'Newsreader') + ': o caderno aberto.</span></p>' +
        '<p><b>Código</b><span style="font:500 .95rem/1.4 \'JetBrains Mono\', monospace">JetBrains Mono</span></p>' +
        '<p class="ga-pe" style="margin:6px 0 0;border:0;padding:0">Todas do Google Fonts, com licença aberta (SIL Open Font License).</p></div>' +
      '<div class="ga-sis"><h3>A marca e a grade</h3>' +
        '<p style="margin:0 0 10px;font:400 .95rem/1.55 var(--f-texto)">O Quadrado Negro de Malevich (1915) no centro do menu. A leitura em três colunas: imagens, texto e navegação. Doze colunas por baixo de tudo.</p>' +
        '<p style="margin:0"><a href="sistema.html">O sistema, por inteiro: cor, letra, espaço e movimento →</a></p></div>' +
    '</div>' +
    '<div class="ga-acoes-topo" style="margin-top:14px"><button type="button" class="botao pri" data-ga="tokens">' + ic('baixar') + 'Baixar os tokens (JSON)</button>' +
      '<p>No formato dos Design Tokens do W3C (<code>$value</code> e <code>$type</code>), que plugins do Figma como o Tokens Studio leem.</p></div>';
  }
  function tokens() {
    var t = { $description: 'Portal Solar: tokens de design (cores, letras). Licença ' + (C.licenca || 'CC BY-SA 4.0') + '. Gerado em ' + new Date().toISOString().slice(0, 10) + '.', cor: {}, materia: {}, fonte: {} };
    (G.opcoes.filter(function (g) { return g.chave === 'tema'; })[0] || { itens: [] }).itens.forEach(function (it) {
      if (it[0] === 'auto') return;
      t.cor[it[0]] = { papel: { $type: 'color', $value: it[3].papel }, tinta: { $type: 'color', $value: it[3].tinta }, sinal: { $type: 'color', $value: it[3].sinal } };
    });
    MATERIAS.forEach(function (m) { var v = css('--' + m[0]); if (v) t.materia[m[0]] = { $type: 'color', $value: v, $description: m[1] }; });
    t.fonte = { titulo: { $type: 'fontFamily', $value: fonte('--f-display') || 'Gabarito' }, texto: { $type: 'fontFamily', $value: fonte('--f-texto') || 'Newsreader' }, codigo: { $type: 'fontFamily', $value: 'JetBrains Mono' } };
    t.marca = { quadrado: { $type: 'color', $value: '#100F0B', $description: 'O Quadrado Negro (Malevich, 1915); branco no escuro' } };
    return JSON.stringify(t, null, 2);
  }

  /* ── 3. as propostas ── */
  function htmlPropostas() {
    if (!G.propostas.length) return '<p class="cv-vazio">Ainda não há propostas: a primeira pode ser a sua. Redesenhe uma tela do Portal (uma ficha do Atlas é um ótimo começo), publique onde quiser, no Figma ou num site, e mande o link pela <a href="participe.html#design">página Faça parte</a>. Ela entra aqui com o seu nome e a licença que você escolher.</p>';
    return '<ul class="ga-refs">' + G.propostas.map(function (p) {
      return '<li class="ga-ref" data-g="atemporal">' + (p.imagem ? '<img src="' + esc(p.imagem) + '" alt="' + esc(p.titulo) + '" loading="lazy" style="width:100%;border-radius:10px">' : '') +
        '<h3>' + esc(p.titulo) + '</h3><span class="ga-quem">' + esc([p.autor, p.data, p.licenca].filter(Boolean).join(' · ')) + '</span>' +
        (p.descricao ? '<p>' + esc(p.descricao) + '</p>' : '') + (p.link ? '<div class="ga-links"><a href="' + esc(p.link) + '" target="_blank" rel="noopener">Ver a proposta ↗</a></div>' : '') + '</li>';
    }).join('') + '</ul>';
  }

  /* ── 4. as referências ── */
  function htmlRefs() {
    var lista = G.referencias.filter(function (r) { return filtro === 'todas' || r.grupo === filtro; });
    return '<ul class="ga-refs">' + lista.map(function (r) {
      return '<li class="ga-ref" data-g="' + r.grupo + '"><span class="ga-tag">' + (r.grupo === 'futurista' ? 'futurista' : 'atemporal') + '</span>' +
        '<span class="ga-ano">' + esc(r.ano) + '</span><h3>' + esc(r.nome) + '</h3><span class="ga-quem">' + esc(r.quem) + '</span><p>' + esc(r.porque) + '</p>' +
        '<div class="ga-links">' + r.links.map(function (l) { return '<a href="' + esc(l[1]) + '" target="_blank" rel="noopener">' + esc(l[0]) + ' ↗</a>'; }).join('') + '</div></li>';
    }).join('') + '</ul>';
  }

  var nAt = G.referencias.filter(function (r) { return r.grupo === 'atemporal'; }).length, nFu = G.referencias.length - nAt;
  raiz.innerHTML =
    '<section class="cv-sec" id="experimente" aria-labelledby="h-exp"><header><p class="rot">Experimente</p><h2 id="h-exp">As opções que já existem</h2>' +
      '<p>Cada cartão mostra a página em miniatura. Um toque aplica a opção em todo o Portal, só neste navegador; "Voltar ao padrão" desfaz tudo.</p></header>' +
      '<div class="ga-acoes-topo"><button type="button" class="botao" data-ga="padrao">' + ic('restaurar') + 'Voltar ao padrão</button><p>As mesmas escolhas ficam no Personalizar (o botão de ajustes, no alto).</p></div>' +
      '<div id="ga-opcoes">' + htmlOpcoes() + '</div></section>' +
    '<section class="cv-sec" id="sistema" aria-labelledby="h-sis"><header><p class="rot">O sistema aberto</p><h2 id="h-sis">As cores, as letras e a marca, para todo mundo usar</h2>' +
      '<p>É daqui que qualquer redesenho parte. Baixe os tokens, abra no Figma e proponha.</p></header>' + htmlSistema() + '</section>' +
    '<section class="cv-sec" id="propostas" aria-labelledby="h-pro"><header><p class="rot">As propostas</p><h2 id="h-pro">Os designs de quem participa</h2>' +
      '<p>Públicos, com o nome de quem fez e a licença. Cada proposta pode virar o Portal inteiro, ou uma parte dele.</p></header>' + htmlPropostas() + '</section>' +
    '<section class="cv-sec" id="referencias" aria-labelledby="h-ref"><header><p class="rot">As referências</p><h2 id="h-ref">Interfaces que não envelhecem e interfaces que apontam o futuro</h2>' +
      '<p>' + nAt + ' atemporais e ' + nFu + ' futuristas. Aqui só estão o nome, a data, quem fez, por que importa e o link, conferido em ' + (G.conferidoEm || 'outubro de 2026').split('-').reverse().join('/') + '. As obras são de quem as fez.</p></header>' +
      '<div class="ga-refs-filtro" role="group" aria-label="Mostrar">' + [['todas', 'Todas'], ['atemporal', 'Atemporais'], ['futurista', 'Futuristas']].map(function (f) { return '<button type="button" data-filtro="' + f[0] + '" aria-pressed="' + (filtro === f[0]) + '">' + f[1] + '</button>'; }).join('') + '</div>' +
      '<div id="ga-refs">' + htmlRefs() + '</div></section>' +
    '<p class="ga-pe">O Portal Solar é feito a muitas mãos. Quer propor um design, escrever código ou cuidar da ontologia? <a href="participe.html">Faça parte</a>. Mais referências de estética e design estão na nota Referências de Ouro do caderno do projeto.</p>';

  raiz.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-ch]');
    if (b) { aplicar(b.getAttribute('data-ch'), b.getAttribute('data-v')); var nv = raiz.querySelector('[data-ch="' + b.getAttribute('data-ch') + '"][data-v="' + (window.CSS && CSS.escape ? CSS.escape(b.getAttribute('data-v')) : b.getAttribute('data-v')) + '"]'); if (nv) nv.focus({ preventScroll: true }); return; }
    var f = ev.target.closest('[data-filtro]');
    if (f) {
      filtro = f.getAttribute('data-filtro');
      raiz.querySelectorAll('[data-filtro]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === f)); });
      document.getElementById('ga-refs').innerHTML = htmlRefs();
      return;
    }
    var g = ev.target.closest('[data-ga]');
    if (!g) return;
    if (g.getAttribute('data-ga') === 'padrao' && T) { T.gravar(T.padrao); location.reload(); }
    else if (g.getAttribute('data-ga') === 'tokens') {
      var url = URL.createObjectURL(new Blob([tokens()], { type: 'application/json;charset=utf-8' }));
      var a = document.createElement('a'); a.href = url; a.download = 'portal-solar-tokens.json'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    }
  });
})();
