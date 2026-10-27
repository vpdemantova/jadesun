/* ============================================================
   AS PASTAS (27/out/2026, registro 128)
   "quero saber em todos os projetos como eu tenho ordem e paro de depender de meu dia ser falar
   com você, quero ver minhas pastas e navegar nelas - e como melhorar cada um!"
   · A ordem: o que fazer hoje sem conversa nenhuma (os próximos passos "Em foco"), e o que corre
     risco (o que só existe neste computador, o que não foi guardado).
   · As vivas: um cartão por pasta; cada um abre a folha com o estado, o próximo passo, como
     melhorar, os papéis e os arquivos.
   · As paradas: a proposta do Grande Plano (arquivar, nunca apagar), esperando o "pode arquivar".
   · Todas as pastas: o explorador; o endereço guarda onde você está (#p=cubos/js).
   O estado vem das pastas (lib/pastas.mjs); o que fazer, do caderno (O Grande Plano, seções 5 e 9).
   ============================================================ */
(function () {
  'use strict';
  var P = window.Perfil || {};
  var raiz = document.getElementById('pastas');
  if (!raiz) return;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  /* o texto das células do caderno: o código entre crases, o negrito e os elos [[…]] */
  var linha = function (s) {
    var t = esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, function (_, a, __, b) { return '<span class="ps-elo">' + (b || a) + '</span>'; });
    return t;
  };
  var GRUPOS = ['Em foco', 'A obra', 'Projetos filhos', 'Trabalhos', 'Estudo'];
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  function quando(iso) {
    if (!iso) return '';
    var d = new Date(iso), hoje = new Date();
    var dias = Math.floor((new Date(hoje.toDateString()) - new Date(d.toDateString())) / 864e5);
    var data = d.getDate() + ' ' + MESES[d.getMonth()] + (d.getFullYear() !== hoje.getFullYear() ? ' ' + d.getFullYear() : '');
    var rel = dias <= 0 ? 'hoje' : dias === 1 ? 'ontem' : dias < 60 ? 'há ' + dias + ' dias' : dias < 730 ? 'há ' + Math.round(dias / 30) + ' meses' : 'há ' + Math.round(dias / 365) + ' anos';
    return { data: data, rel: rel, dias: dias };
  }
  function tamanho(n) {
    if (n == null) return '';
    return n < 1024 ? n + ' B' : n < 1048576 ? Math.round(n / 1024) + ' KB' : (n / 1048576).toFixed(1).replace('.', ',') + ' MB';
  }
  function api(caminho, opcoes) {
    return fetch(caminho, Object.assign({ cache: 'no-store' }, opcoes || {})).then(function (r) {
      return r.json().then(function (d) { if (!r.ok) throw new Error(d && d.erro || r.status); return d; });
    });
  }

  /* os sinais de cada pasta: o que corre risco e o que falta guardar */
  function sinais(p) {
    var s = [], g = p.git;
    if (!g) s.push(['risco', 'sem git: a pasta é a única cópia']);
    else {
      if (g.semRemoto) s.push(['risco', 'só neste computador']);
      if (g.sujos) s.push(['aviso', g.sujos + (g.sujos === 1 ? ' mudança não guardada' : ' mudanças não guardadas')]);
      if (g.frente) s.push(['aviso', g.frente + (g.frente === 1 ? ' commit não enviado' : ' commits não enviados')]);
      if (g.atras) s.push(['aviso', g.atras + ' para trazer']);
    }
    return s;
  }
  var chips = function (p) {
    return sinais(p).map(function (x) { return '<span class="ps-sinal ps-' + x[0] + '">' + esc(x[1]) + '</span>'; }).join('');
  };
  var ultimo = function (p) {
    var u = p.git && p.git.ultimo, q = u && quando(u.data);
    return q ? '<span class="ps-ultimo">' + esc(q.data) + ' · ' + esc(q.rel) + '</span>' : '<span class="ps-ultimo">sem commit</span>';
  };

  var D = null;
  function plano(p) { return (D.plano.pastas || {})[p.nome] || {}; }

  /* ---------- a ordem ---------- */
  function ordem(vivas, paradas) {
    var foco = vivas.filter(function (p) { return plano(p).grupo === 'Em foco' && plano(p).proximo; });
    var risco = D.pastas.filter(function (p) { return !p.git || p.git.semRemoto; });
    var sujas = D.pastas.filter(function (p) { return p.git && (p.git.sujos || p.git.frente); });
    return '<section class="ps-ordem" aria-labelledby="ps-ordem-t">' +
      '<h2 class="h2" id="ps-ordem-t">A ordem</h2>' +
      '<dl class="ps-numeros">' +
        '<div><dt>pastas em ' + esc(D.raiz.replace(/^\/Users\/[^/]+/, '~')) + '</dt><dd>' + D.pastas.length + '</dd></div>' +
        '<div><dt>vivas</dt><dd>' + vivas.length + '</dd></div>' +
        '<div><dt>paradas, para arquivar</dt><dd>' + paradas.length + '</dd></div>' +
        '<div><dt>só neste computador</dt><dd>' + risco.length + '</dd></div>' +
      '</dl>' +
      (foco.length ? '<div class="ps-hoje"><h3>Num dia sem conversa nenhuma, nesta ordem</h3><ol>' + foco.map(function (p) {
        return '<li><button type="button" class="ps-ir" data-pasta="' + esc(p.nome) + '"><b>' + esc(p.nome) + '</b></button> ' + linha(plano(p).proximo) + '</li>';
      }).join('') + '<li class="ps-depois">Depois, um passo de <b>A obra</b>; à noite, o Registro.</li></ol></div>' : '') +
      '<div class="ps-cuidado">' +
        (risco.length ? '<p><b>Só existem neste computador</b> (se o disco falhar, somem): ' + risco.map(function (p) { return '<button type="button" class="ps-ir" data-pasta="' + esc(p.nome) + '">' + esc(p.nome) + '</button>'; }).join(', ') + '.</p>' : '') +
        (sujas.length ? '<p><b>Com mudanças não guardadas ou não enviadas:</b> ' + sujas.map(function (p) { return '<button type="button" class="ps-ir" data-pasta="' + esc(p.nome) + '">' + esc(p.nome) + '</button>'; }).join(', ') + '.</p>' : '') +
        (D.plano.esperaArquivar ? '<p>As ' + paradas.length + ' paradas esperam o seu “pode arquivar” (O Grande Plano, seção 5): vão para <code>~/www/_Arquivo</code>, e nada se apaga.</p>' : '') +
      '</div>' +
    '</section>';
  }

  /* ---------- as vivas ---------- */
  function cartao(p) {
    var x = plano(p);
    return '<li><button type="button" class="ps-cartao" data-pasta="' + esc(p.nome) + '">' +
      '<span class="ps-c-cima"><b class="ps-c-nome">' + esc(p.nome) + '</b>' + ultimo(p) + '</span>' +
      '<span class="ps-c-oque">' + linha(x.oQueE || p.resumo || '') + '</span>' +
      (x.proximo ? '<span class="ps-c-prox"><small>O próximo passo</small><span>' + linha(x.proximo) + '</span></span>' : '') +
      '<span class="ps-c-sinais">' + chips(p) + '</span>' +
    '</button></li>';
  }
  function vivasHtml(vivas) {
    return '<section class="ps-vivas" aria-labelledby="ps-vivas-t"><h2 class="h2" id="ps-vivas-t">As vivas</h2>' +
      GRUPOS.map(function (g) {
        var lista = vivas.filter(function (p) { return plano(p).grupo === g; });
        if (!lista.length) return '';
        return '<div class="ps-grupo"><h3 class="ps-grupo-t">' + esc(g) + '<small>' + lista.length + '</small></h3><ul class="ps-grade">' + lista.map(cartao).join('') + '</ul></div>';
      }).join('') +
    '</section>';
  }

  /* ---------- as paradas ---------- */
  function paradasHtml(paradas) {
    if (!paradas.length) return '';
    var porCodigo = {};
    paradas.forEach(function (p) { var c = plano(p).codigo || '—'; (porCodigo[c] = porCodigo[c] || []).push(p); });
    var cods = Object.keys(porCodigo).sort(function (a, b) { return (parseInt(a.slice(1), 10) || 99) - (parseInt(b.slice(1), 10) || 99); });
    return '<section class="ps-paradas" aria-labelledby="ps-paradas-t"><h2 class="h2" id="ps-paradas-t">As paradas</h2>' +
      '<p class="ps-lead">A proposta do Grande Plano (21/out): arquivar, nunca apagar. O que tem GitHub continua lá.</p>' +
      '<ul class="ps-lista">' + cods.map(function (c) {
        var lista = porCodigo[c], x = plano(lista[0]);
        return '<li><span class="ps-cod">' + esc(c) + '</span><span class="ps-l-nomes">' + lista.map(function (p) { return '<button type="button" class="ps-ir" data-pasta="' + esc(p.nome) + '">' + esc(p.nome) + '</button>' + ultimo(p); }).join('') + '</span>' +
          '<span class="ps-l-porque">' + linha(x.porque || '') + '</span></li>';
      }).join('') + '</ul></section>';
  }

  /* ---------- todas as pastas: o explorador ---------- */
  var aqui = '';
  function migalhas(rel) {
    var partes = rel ? rel.split('/') : [], h = '<button type="button" class="ps-migalha" data-ir="">www</button>', acc = '';
    partes.forEach(function (x) { acc = acc ? acc + '/' + x : x; h += '<span aria-hidden="true">/</span><button type="button" class="ps-migalha" data-ir="' + esc(acc) + '">' + esc(x) + '</button>'; });
    return h;
  }
  function itensHtml(r) {
    if (!r.itens.length) return '<p class="ps-vazio">Pasta vazia.</p>';
    return '<ul class="ps-itens">' + r.itens.map(function (i) {
      var caminho = (r.rel ? r.rel + '/' : '') + i.nome, q = quando(i.mudou);
      return '<li><button type="button" class="ps-item' + (i.pasta ? ' ps-item-pasta' : '') + (i.pesada ? ' ps-item-pesada' : '') + '" ' + (i.pasta ? 'data-ir' : 'data-ler') + '="' + esc(caminho) + '">' +
        '<span class="ps-item-n">' + esc(i.nome) + (i.pasta ? '/' : '') + '</span><span class="ps-item-q">' + (i.pasta ? '' : esc(tamanho(i.tamanho))) + '</span><span class="ps-item-q">' + esc(q ? q.data : '') + '</span></button></li>';
    }).join('') + '</ul>';
  }
  function navegar(rel, alvo, guardar) {
    return api('/api/pastas/listar?rel=' + encodeURIComponent(rel || '')).then(function (r) {
      alvo.innerHTML = '<nav class="ps-migalhas" aria-label="Onde você está">' + migalhas(r.rel) + '</nav>' + itensHtml(r);
      alvo.setAttribute('data-rel', r.rel);
      if (guardar) { aqui = r.rel; try { history.replaceState(null, '', r.rel ? '#p=' + encodeURI(r.rel) : location.pathname); } catch (e) {} }
    }).catch(function (e) { alvo.innerHTML = '<p class="ps-vazio">' + esc(e.message) + '</p>'; });
  }
  function exploradorHtml() {
    return '<section class="ps-todas" aria-labelledby="ps-todas-t"><h2 class="h2" id="ps-todas-t">Todas as pastas</h2>' +
      '<div class="ps-explorador" id="ps-explorador"></div></section>';
  }

  /* ---------- ler um arquivo, na folha ---------- */
  function abrirFora(rel, como) {
    return api('/api/pastas/abrir', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify({ rel: rel, como: como }) });
  }
  var acoes = function (rel) {
    return '<p class="ps-acoes"><button type="button" class="ps-botao" data-fora="finder" data-rel="' + esc(rel) + '">Mostrar no Finder</button><button type="button" class="ps-botao" data-fora="code" data-rel="' + esc(rel) + '">Abrir no VS Code</button></p>';
  };
  function conteudo(r) {
    if (r.negado) return '<p class="ps-vazio">' + esc(r.motivo) + '</p>';
    if (r.ext === '.md' && window.MD) return '<div class="ps-md">' + window.MD.render(r.texto) + '</div>';
    return '<pre class="ps-codigo"><code>' + esc(r.texto) + '</code></pre>';
  }
  function lerArquivo(rel) {
    var nome = rel.split('/').pop();
    var f = P.folha && P.folha({ titulo: esc(nome), sub: esc(rel.split('/').slice(0, -1).join('/') || 'www'), larga: true, html: acoes(rel) + '<div class="ps-leitura"><p class="rot suave">Lendo…</p></div>' });
    if (!f) return;
    api('/api/pastas/ler?rel=' + encodeURIComponent(rel)).then(function (r) { f.corpo.querySelector('.ps-leitura').innerHTML = conteudo(r); })
      .catch(function (e) { f.corpo.querySelector('.ps-leitura').innerHTML = '<p class="ps-vazio">' + esc(e.message) + '</p>'; });
  }

  function lerAqui(rel, caixa) {
    caixa.hidden = false;
    caixa.innerHTML = '<header class="ps-f-leitor-cab"><b>' + esc(rel) + '</b><button type="button" class="folha-x" data-fechar-leitor aria-label="Fechar o arquivo"><i class="cruz" aria-hidden="true"></i></button></header><div class="ps-leitura"><p class="rot suave">Lendo…</p></div>';
    caixa.scrollIntoView({ block: 'start', behavior: 'smooth' });
    api('/api/pastas/ler?rel=' + encodeURIComponent(rel)).then(function (r) { caixa.querySelector('.ps-leitura').innerHTML = acoes(rel) + conteudo(r); })
      .catch(function (e) { caixa.querySelector('.ps-leitura').innerHTML = '<p class="ps-vazio">' + esc(e.message) + '</p>'; });
  }

  /* ---------- a folha de uma pasta ---------- */
  function folhaDaPasta(nome) {
    var p = D.pastas.filter(function (x) { return x.nome === nome; })[0];
    if (!p || !P.folha) return;
    var x = plano(p), g = p.git;
    var melhorar = (x.melhorar || '').split(/;\s*(?=\d+\.)/).map(function (s) { return s.replace(/^\d+\.\s*/, '').trim(); }).filter(Boolean);
    var estado = g ? '<dl class="ps-estado">' +
        '<div><dt>O último commit</dt><dd>' + (g.ultimo ? esc(quando(g.ultimo.data).data) + ' · ' + esc(g.ultimo.msg) : 'nenhum') + '</dd></div>' +
        '<div><dt>A cópia</dt><dd>' + (g.semRemoto ? '<b class="ps-risco-t">só neste computador</b>' : 'no GitHub (' + esc(g.remoto.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\.git$/, '')) + ')') + '</dd></div>' +
        '<div><dt>Não guardado</dt><dd>' + (g.sujos ? g.sujos + (g.sujos === 1 ? ' mudança' : ' mudanças') : 'nada') + (g.frente ? ' · ' + g.frente + ' não ' + (g.frente === 1 ? 'enviado' : 'enviados') : '') + '</dd></div>' +
      '</dl>' : '<p class="ps-risco-t"><b>Sem git:</b> esta pasta é a única cópia.</p>';
    var html = '<div class="ps-folha">' +
      (x.oQueE || p.resumo ? '<p class="ps-f-oque">' + linha(x.oQueE || p.resumo) + '</p>' : '') +
      (p.noAr ? '<p class="ps-f-noar"><a href="' + esc(p.noAr) + '" target="_blank" rel="noopener">' + esc(p.noAr.replace(/^https?:\/\//, '')) + '</a></p>' : '') +
      estado +
      (x.proximo ? '<h3>O próximo passo</h3><p>' + linha(x.proximo) + '</p>' : '') +
      (melhorar.length ? '<h3>Como melhorar</h3><ol class="ps-melhorar">' + melhorar.map(function (m) { return '<li>' + linha(m) + '</li>'; }).join('') + '</ol>' : '') +
      (x.codigo ? '<h3>A proposta (' + esc(x.codigo) + ')</h3><p>' + linha(x.proposta === '_Arquivo' ? 'Ir para `~/www/_Arquivo`' : x.proposta) + ': ' + linha(x.porque || '') + (x.risco ? ' Risco: ' + linha(x.risco) + '.' : '') + '</p>' : '') +
      acoes(p.nome) +
      (p.papeis.length ? '<h3>Os papéis</h3><p class="ps-papeis">' + p.papeis.map(function (pp) { return '<button type="button" class="ps-botao" data-ler="' + esc(p.nome + '/' + pp) + '">' + esc(pp.replace(/\.md$/, '')) + '</button>'; }).join('') + '</p>' : '') +
      '<div class="ps-f-leitor" hidden></div>' +
      '<h3>Os arquivos</h3><div class="ps-explorador ps-f-explorador"></div>' +
    '</div>';
    var f = P.folha({ titulo: esc(p.nome), sub: esc(x.grupo || (x.codigo ? 'Parada · ' + x.codigo : 'Pasta')), larga: true, html: html });
    if (f) navegar(p.nome, f.corpo.querySelector('.ps-f-explorador'), false);
  }

  /* ---------- os cliques: um só ouvinte para a página e as folhas ---------- */
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-pasta], [data-ir], [data-ler], [data-fora], [data-fechar-leitor]');
    if (!b) return;
    if (b.hasAttribute('data-pasta')) { folhaDaPasta(b.getAttribute('data-pasta')); return; }
    if (b.hasAttribute('data-ler')) {
      /* dentro da folha de uma pasta, o arquivo abre ali mesmo, sem fechar a folha */
      var folhaPasta = b.closest('.ps-folha');
      if (folhaPasta) lerAqui(b.getAttribute('data-ler'), folhaPasta.querySelector('.ps-f-leitor'));
      else lerArquivo(b.getAttribute('data-ler'));
      return;
    }
    if (b.hasAttribute('data-fechar-leitor')) { var lt = b.closest('.ps-f-leitor'); lt.hidden = true; lt.innerHTML = ''; return; }
    if (b.hasAttribute('data-fora')) { abrirFora(b.getAttribute('data-rel'), b.getAttribute('data-fora')); return; }
    if (b.hasAttribute('data-ir')) {
      var caixa = b.closest('.ps-explorador');
      if (caixa) navegar(b.getAttribute('data-ir'), caixa, caixa.id === 'ps-explorador');
    }
  });

  function montar(d) {
    D = d;
    var vivas = d.pastas.filter(function (p) { return plano(p).grupo; });
    var paradas = d.pastas.filter(function (p) { return !plano(p).grupo && plano(p).codigo; });
    var soltas = d.pastas.filter(function (p) { return !plano(p).grupo && !plano(p).codigo; });
    /* uma pasta nova, que o plano ainda não conhece, entra nas vivas sem grupo, para não sumir */
    soltas.forEach(function (p) { D.plano.pastas[p.nome] = { grupo: 'Sem lugar ainda' }; });
    if (soltas.length && GRUPOS.indexOf('Sem lugar ainda') < 0) GRUPOS.push('Sem lugar ainda');
    vivas = vivas.concat(soltas);
    document.getElementById('ps-lead').innerHTML = 'As ' + d.pastas.length + ' pastas de <code>' + esc(d.raiz.replace(/^\/Users\/[^/]+/, '~')) + '</code>, lidas agora: o estado de cada uma, o próximo passo e como melhorar. O que fazer vem do caderno, do <span class="ps-elo">O Grande Plano</span> (seções 5 e 9).';
    raiz.innerHTML = ordem(vivas, paradas) + vivasHtml(vivas) + paradasHtml(paradas) + exploradorHtml();
    var h = decodeURI((location.hash.match(/#p=(.*)$/) || [])[1] || '');
    navegar(h, document.getElementById('ps-explorador'), true);
    if (window.Movimento && window.Movimento.revalidar) window.Movimento.revalidar();
  }

  api('/api/pastas').then(montar).catch(function (e) {
    raiz.innerHTML = '<p class="ps-vazio">As pastas só se abrem no Portal deste computador (' + esc(e.message) + ').</p>';
  });
})();
