(function () {
  'use strict';

  var P = window.Perfil;
  var esc = P.esc;

  function norm(t) {
    return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  var SECAO_DA_ETAPA = ['atlas/elementos', 'atlas/materias-primas', '', 'atlas/componentes', 'atlas/objetos-e-instrumentos', 'atlas/oficios', 'atlas/objetos-e-instrumentos'];

  function ligarCadeia(ind) {
    var todos = {};
    var porSecao = {};
    ind.itens.forEach(function (it) {
      var k = norm(it[1]);
      todos[k] = todos[k] || it[0];
      (porSecao[it[2]] = porSecao[it[2]] || {})[k] = it[0];
    });

    document.querySelectorAll('#cadeia .etapa').forEach(function (el, i) {
      var sec = SECAO_DA_ETAPA[i];
      var titulo = el.querySelector('.en');
      if (titulo && sec) titulo.innerHTML = '<a href="biblioteca.html#s=' + sec + '">' + titulo.innerHTML + '</a>';
      el.querySelectorAll('ul li').forEach(function (li) {
        var k = norm(li.textContent);
        var id = (porSecao[sec] && porSecao[sec][k]) || todos[k];
        if (id) li.innerHTML = '<a href="biblioteca.html#f=' + encodeURI(id) + '">' + esc(li.textContent) + '</a>';
      });
    });

    document.querySelectorAll('#fio .elo').forEach(function (el) {
      var b = el.querySelector('b');
      if (!b) return;
      var id = todos[norm(b.textContent)];
      if (id) b.innerHTML = '<a href="biblioteca.html#f=' + encodeURI(id) + '">' + b.innerHTML + '</a>';
    });
  }

  function ligarMuseu() {
    document.querySelectorAll('#galeria .foto').forEach(function (fig) {
      var img = fig.querySelector('img');
      if (!img) return;
      var nome = decodeURIComponent(img.getAttribute('src').split('/').pop());
      fetch('/api/imagem-ficha?nome=' + encodeURIComponent(nome)).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        if (!d) return;
        var a = document.createElement('a');
        a.href = 'biblioteca.html#f=' + encodeURI(d.ficha);
        a.title = 'Abrir a ficha: ' + d.titulo;
        img.parentNode.insertBefore(a, img);
        a.appendChild(img);
        var cap = fig.querySelector('.cap');
        var credito = [d.autor, d.licenca].filter(function (x) { return x; }).join(' · ');
        if (cap && credito) cap.insertAdjacentHTML('beforeend', '<span class="cred-f">' + esc(credito) + '</span>');
      }).catch(function () {});
    });
  }

  function secaoLacunas(d) {
    var main = document.querySelector('main.miolo');
    var s = document.createElement('section');
    s.id = 'lacunas';
    s.style.marginTop = 'calc(var(--g) * 2.4)';
    var sem = d.semFicha.length
      ? '<div class="chips lac-chips">' + d.semFicha.map(function (f) {
        var c = f.citadoPor[0];
        return '<a class="chip lac" href="biblioteca.html#f=' + encodeURI(c.id) + '" title="Citado em: ' + esc(f.citadoPor.map(function (x) { return x.titulo; }).join(', ')) + '">' + esc(f.nome) + (f.vezes > 1 ? ' <small>×' + f.vezes + '</small>' : '') + '</a>';
      }).join('') + '</div>'
      : '<p class="suave">Nenhum nome citado sem ficha.</p>';
    var curtas = d.curtas.map(function (c) {
      var pct = c.total ? Math.round((c.curtas / c.total) * 100) : 0;
      return '<div class="lac-sec"><header><a href="biblioteca.html#s=' + encodeURI(c.secaoId) + '"><b class="h3">' + esc(c.secao) + '</b></a><span class="rot suave">' + c.curtas + ' de ' + c.total + ' só com a introdução</span></header>' +
        '<div class="lac-barra"><i style="width:' + pct + '%"></i></div>' +
        (c.exemplos.length ? '<p class="lac-ex">' + c.exemplos.map(function (x) { return '<a href="biblioteca.html#f=' + encodeURI(x.id) + '">' + esc(x.titulo) + '</a>'; }).join(' · ') + (c.curtas > c.exemplos.length ? ' …' : '') + '</p>' : '') + '</div>';
    }).join('');
    s.innerHTML =
      '<h2 class="h2">Citados e ainda sem ficha</h2>' +
      '<p class="resposta" style="margin:.7rem 0 var(--g)">Nomes que aparecem nas seções “Elos” do Atlas (acima, abaixo, ao lado) mas não têm arquivo próprio. Quanto maior o número, mais fichas dependem dele. Clique para abrir uma ficha que o cita.</p>' + sem +
      '<h2 class="h2" style="margin-top:calc(var(--g) * 2)">Fichas ainda curtas</h2>' +
      '<p class="resposta" style="margin:.7rem 0 var(--g)">Fichas que hoje têm só a introdução (a maioria veio da Wikipédia). Abra uma e use “Copiar esqueleto” para completar com materiais, ferramentas, história e elos, como o Quartzo.</p>' +
      '<div class="lac-grade">' + curtas + '</div>';
    main.appendChild(s);
  }

  Promise.all([P.estado(), fetch('/api/biblioteca').then(function (r) { return r.json(); })]).then(function (r) {
    ligarCadeia(r[1]);
    ligarMuseu();
    return fetch('/api/lacunas').then(function (x) { return x.json(); }).then(secaoLacunas);
  }).catch(function () {});
})();
