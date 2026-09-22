(function () {
  'use strict';

  var P = window.Perfil;
  var esc = P.esc;
  var params = new URLSearchParams(location.search);
  var alvo = document.getElementById('copia');
  var estado = { titulo: '', voltar: '', grupos: [], marcados: {}, modelo: 'inteiro', linhas: 2, tam: 1.15 };

  function texto(t) {
    return String(t)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/\*\*|__|`/g, '')
      .replace(/(^|[^*\w])[*_]([^*_]+)[*_]/g, '$1$2')
      .replace(/<br\s*\/?>/gi, ' · ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function gruposDeMd(md) {
    var grupos = [{ titulo: 'Abertura', blocos: [] }];
    var g = grupos[0];
    var cerca = false;
    var par = [];
    var ultimo = -1;
    function fecharPar() { if (par.length) { var t = texto(par.join(' ')); if (t) g.blocos.push(t); par = []; } }
    md.replace(/\r\n?/g, '\n').split('\n').forEach(function (l) {
      var t = l.trim();
      if (/^(```|~~~)/.test(t)) { fecharPar(); ultimo = -1; cerca = !cerca; return; }
      if (cerca) return;
      var h = t.match(/^(#{2,3})\s+(.*)$/);
      if (h) { fecharPar(); ultimo = -1; g = { titulo: texto(h[2]), blocos: [] }; grupos.push(g); return; }
      if (/^#\s/.test(t) || /^(-{3,}|\*{3,})$/.test(t)) { fecharPar(); ultimo = -1; return; }
      if (!t) { fecharPar(); ultimo = -1; return; }
      if (/^\|/.test(t)) {
        fecharPar(); ultimo = -1;
        if (/^\|?\s*:?-{2,}/.test(t)) return;
        var cel = t.replace(/^\||\|$/g, '').split('|').map(texto).filter(function (c) { return c; });
        if (cel.length) g.blocos.push(cel.join(' · '));
        return;
      }
      var item = t.match(/^(?:[-*+]|\d+[.)])\s+(.*)$/);
      if (item) {
        fecharPar();
        var it = texto(item[1]);
        if (it) { g.blocos.push(it); ultimo = g.blocos.length - 1; } else ultimo = -1;
        return;
      }
      if (ultimo >= 0 && !par.length && /^\s+\S/.test(l)) { g.blocos[ultimo] += ' ' + texto(t); return; }
      ultimo = -1;
      par.push(t.replace(/^>\s?/, ''));
    });
    fecharPar();
    return grupos.filter(function (x) { return x.blocos.length; });
  }

  function gruposDeCarta(c) {
    var grupos = [];
    if (c.resumo) grupos.push({ titulo: 'Resumo', blocos: [c.resumo] });
    if (c.lembrar && c.lembrar.length) grupos.push({ titulo: 'O que lembrar', blocos: c.lembrar });
    if (c.testes && c.testes.length) {
      var b = [];
      c.testes.forEach(function (t) { b.push('Pergunta: ' + t.p); b.push('Resposta: ' + t.r); });
      grupos.push({ titulo: 'Perguntas e respostas', blocos: b });
    }
    return grupos;
  }

  function comeco(t) {
    var p = t.split(' ');
    return p.length <= 5 ? t : p.slice(0, 5).join(' ') + ' …';
  }

  function folha() {
    var n = 0;
    var html = '';
    estado.grupos.forEach(function (g, gi) {
      if (!estado.marcados[gi]) return;
      html += '<h2 class="fo-g">' + esc(g.titulo) + '</h2>';
      g.blocos.forEach(function (b) {
        n++;
        var modelo = estado.modelo === 'inteiro' ? b : estado.modelo === 'comeco' ? comeco(b) : '';
        html += '<div class="fo-b"><p class="fo-m"><i>' + n + '</i>' + (modelo ? esc(modelo) : '<span class="fo-vazio">escreva de memória</span>') + '</p>' +
          '<div class="fo-l" style="--n:' + estado.linhas + '"></div></div>';
      });
    });
    return html || '<p class="fo-vazio">Marque ao menos um trecho à esquerda.</p>';
  }

  function desenhar() {
    var f = document.getElementById('fo-conteudo');
    f.innerHTML = folha();
    f.style.setProperty('--tam', estado.tam + 'rem');
  }

  function montar() {
    document.getElementById('titulo').textContent = estado.titulo;
    document.title = 'Copiar à mão — ' + estado.titulo;
    document.getElementById('origem-rot').textContent = estado.grupos.length + ' trechos';
    estado.grupos.forEach(function (g, i) { estado.marcados[i] = i < 3; });
    alvo.innerHTML =
      '<div class="painel-copia cx">' +
        '<p class="rot">O que copiar</p>' +
        '<ul class="fo-lista">' + estado.grupos.map(function (g, i) {
          return '<li><label><input type="checkbox" data-g="' + i + '"' + (estado.marcados[i] ? ' checked' : '') + '> <span>' + esc(g.titulo) + '</span> <small>' + g.blocos.length + '</small></label></li>';
        }).join('') + '</ul>' +
        '<div class="fo-op"><label class="rot" for="fo-modelo">Modelo</label><select id="fo-modelo">' +
          '<option value="inteiro">Inteiro (copiar)</option><option value="comeco">Só o começo (completar)</option><option value="oculto">Oculto (de memória)</option></select></div>' +
        '<div class="fo-op"><label class="rot" for="fo-linhas">Linhas por trecho</label><select id="fo-linhas"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>6</option></select></div>' +
        '<div class="fo-op"><label class="rot" for="fo-tam">Tamanho da letra</label><select id="fo-tam"><option value="1">Pequeno</option><option value="1.15" selected>Médio</option><option value="1.4">Grande</option></select></div>' +
        '<div class="acoes"><button class="botao sinal" type="button" id="fo-imprimir">Imprimir</button>' +
        (estado.voltar ? '<a class="botao" href="' + esc(estado.voltar) + '">Voltar</a>' : '') + '</div>' +
      '</div>' +
      '<div class="folha"><div class="fo-cab"><span class="rot">' + esc(estado.titulo) + '</span><span class="rot">Data: ____/____/______</span></div><div id="fo-conteudo" class="fo-conteudo"></div></div>';

    alvo.querySelector('.fo-lista').addEventListener('change', function (e) {
      var i = e.target.getAttribute('data-g');
      if (i !== null) { estado.marcados[i] = e.target.checked; desenhar(); }
    });
    document.getElementById('fo-modelo').addEventListener('change', function (e) { estado.modelo = e.target.value; desenhar(); });
    document.getElementById('fo-linhas').addEventListener('change', function (e) { estado.linhas = +e.target.value; desenhar(); });
    document.getElementById('fo-tam').addEventListener('change', function (e) { estado.tam = +e.target.value; desenhar(); });
    document.getElementById('fo-imprimir').addEventListener('click', function () { window.print(); });
    desenhar();
  }

  function erro(msg) {
    alvo.innerHTML = '<div class="cx"><p class="rot">Não deu</p><p>' + esc(msg) + ' <a href="biblioteca.html">Ir à biblioteca</a></p></div>';
  }

  var id = params.get('f');
  var secao = params.get('c');
  var item = params.get('t');
  if (id) {
    estado.voltar = 'biblioteca.html#f=' + id;
    fetch('/api/ficha?id=' + encodeURIComponent(id)).then(function (r) {
      if (!r.ok) throw new Error('nf');
      return r.json();
    }).then(function (f) {
      estado.titulo = f.titulo;
      estado.grupos = gruposDeMd(f.corpo);
      if (!estado.grupos.length) return erro('Esta ficha não tem texto para copiar.');
      montar();
    }).catch(function () { erro('Não encontrei essa ficha.'); });
  } else if (secao && item) {
    estado.voltar = 'hoje.html';
    P.estado().then(function (e) {
      var s = e.checklist.filter(function (x) { return x.nome === secao; })[0];
      var it = s && s.itens.filter(function (x) { return x.texto === item; })[0];
      if (!it || !it.carta) return erro('Este item ainda não tem carta escrita.');
      estado.titulo = it.texto;
      estado.grupos = gruposDeCarta(it.carta);
      estado.voltar = 'domino.html';
      montar();
    }).catch(function () { erro('O servidor está desligado?'); });
  } else {
    erro('Nada para copiar. Abra uma ficha na biblioteca e clique em “Copiar à mão”.');
  }
})();
