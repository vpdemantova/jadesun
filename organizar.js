/* ============================================================
   ORGANIZAR — toda a organização pessoal num lugar só (08/out/2026, PERFIL.md item 72)
   "preciso que todos os meus menus de organização pessoal estejam em um só,
   pra lidar e ver tudo de um lugar". Monta, dentro do Hoje:
     · Meu dia (as outras tarefas, com cronômetro: o mesmo do painel de antes)
     · Prazos (a prova e os vídeos de Música, contados ao vivo)
     · Domínio por matéria (o Checklist, com o mapa de cada área)
     · Para onde vou (Objetivos, do arquivo do caderno)
     · Esperando você (as decisões pendentes)
   Nada novo é gravado aqui: tudo lê e escreve onde já lia e escrevia.
   ============================================================ */
(function () {
  'use strict';

  var P = window.Perfil;
  var esc = P.esc;

  function diasAte(iso, hora) {
    var a = new Date(iso + 'T' + (hora || '09:00') + ':00'); a.setHours(0, 0, 0, 0);
    var h = new Date(); h.setHours(0, 0, 0, 0);
    return Math.round((a - h) / 86400000);
  }
  function dataCurta(iso) { return iso.slice(8, 10) + '/' + iso.slice(5, 7); }

  function prazosHtml(e, musica) {
    var lista = [];
    if (e && e.contagem && e.contagem.prova) {
      var dp = diasAte(e.contagem.prova);
      lista.push({ n: Math.max(0, dp), rot: '1ª fase, Unicamp', sub: 'domingo ' + dataCurta(e.contagem.prova) + ', 9h · 72 questões', href: '#hj-dominio', urgente: dp <= 2 });
    }
    if (musica && musica.existe) {
      var feitosM = musica.itens.filter(function (i) { return i.feito; }).length;
      var dm = diasAte(musica.prazo, '23:59');
      if (dm >= 0 || feitosM < musica.itens.length) lista.push({ n: dm < 0 ? '!' : dm, rot: 'Vídeos de Música', sub: feitosM + ' de ' + musica.itens.length + ' feitos · envio ' + (dm < 0 ? 'era até ' : 'até ') + dataCurta(musica.prazo), href: 'casa.html?porta=musica', urgente: dm <= 1 && feitosM < musica.itens.length });
    }
    if (!lista.length) return '<p class="hj-vazio">Nenhum prazo à vista.</p>';
    return '<div class="hj-prazos">' + lista.map(function (p) {
      return '<a class="hj-prazo' + (p.urgente ? ' urgente' : '') + '" href="' + p.href + '"><b>' + (p.n === 0 ? 'hoje' : p.n) + '</b><span><em>' + esc(p.rot) + '</em>' + esc(p.sub) + '</span>' +
        (typeof p.n === 'number' && p.n > 0 ? '<small>' + (p.n === 1 ? 'dia' : 'dias') + '</small>' : '') + '</a>';
    }).join('') + '</div>';
  }

  function dominioHtml(e) {
    var feitos = 0, todos = 0;
    e.checklist.forEach(function (s) { feitos += s.feitos; todos += s.total; });
    var cor = function (nome) { return P.corDe ? P.corDe(nome) : ''; };
    return '<p class="hj-dom-total"><b>' + feitos + '</b> de ' + todos + ' itens dominados <span class="hj-barra"><i style="width:' + (todos ? Math.round(feitos / todos * 100) : 0) + '%"></i></span></p>' +
      '<ul class="hj-materias">' + e.checklist.map(function (s) {
        var pct = s.total ? Math.round(s.feitos / s.total * 100) : 0;
        return '<li class="' + cor(s.nome) + '"><a href="area.html?m=' + encodeURIComponent(s.nome) + '"><span class="hj-m-nome"><i aria-hidden="true"></i>' + esc(s.nome) + '</span>' +
          '<span class="hj-m-n">' + s.feitos + '/' + s.total + '</span><span class="hj-barra"><i style="width:' + pct + '%"></i></span></a></li>';
      }).join('') + '</ul>' +
      '<p class="hj-acoes"><a class="botao" href="domino.html">Abrir o Domínio</a><a class="botao leve" href="jardim.html">Ver o jardim crescer →</a></p>';
  }

  function objetivosHtml(perfil) {
    var nomes = [];
    var t = perfil && perfil.arquivos && perfil.arquivos.objetivos ? perfil.arquivos.objetivos.texto : '';
    var re = /^\|\s*\*\*(.+?)\*\*/gm, m;
    while ((m = re.exec(t))) nomes.push(m[1].replace(/\s*\(.*$/, '').trim());
    var eixos = [['Vestibular', 'a urgência, primeiro'], ['Atlas', 'um tijolo por dia'], ['Lutheria e música', 'respiro, sem cobrança'], ['O corpo', '15 minutos sagrados']];
    return '<ol class="hj-eixos">' + eixos.map(function (x, i) { return '<li><b>' + (i + 1) + '</b><span><strong>' + esc(x[0]) + '</strong>' + esc(x[1]) + '</span></li>'; }).join('') + '</ol>' +
      (nomes.length ? '<p class="rot">Os trabalhos, um por vez</p><p class="hj-chips">' + nomes.map(function (x) { return '<span class="chip pequeno">' + esc(x) + '</span>'; }).join('') + '</p>' : '') +
      '<p class="hj-acoes"><a class="botao leve" href="eu.html#arquivos">Abrir Objetivos →</a></p>';
  }

  function esperandoHtml() {
    var lista = (P.ESPERANDO || []);
    if (!lista.length) return '<p class="hj-vazio">Nada esperando.</p>';
    return '<ul class="hj-espera">' + lista.map(function (x) {
      return '<li>' + (x[2] ? '<a href="' + x[2] + '">' : '<span>') + '<b>' + esc(x[0]) + '</b><em>' + esc(x[1]) + '</em>' + (x[2] ? '</a>' : '</span>') + '</li>';
    }).join('') + '</ul>';
  }

  function montar(el, e) {
    if (!el) return;
    var outras = (e.tarefas || []).slice(1);
    var meuDia = window.MeuDia ? window.MeuDia.html(outras) : '';
    el.innerHTML =
      '<nav class="hj-indice" aria-label="Neste painel"><a href="#ag-principal">Agora</a><a href="#hj-dia">Meu dia</a><a href="#hj-prazos">Prazos</a><a href="#hj-dominio">Domínio</a><a href="#hj-objetivos">Para onde vou</a><a href="#hj-espera">Esperando</a></nav>' +
      '<div class="hj-painel">' +
      '<section class="hj-bloco hj-dia" id="hj-dia" aria-labelledby="hj-dia-t"><header><h2 class="h3" id="hj-dia-t">Meu dia</h2><span class="rot">o que vem depois do principal</span></header>' +
      (meuDia || '<p class="hj-vazio">Nada além do bloco principal hoje. Só ele já vale o dia.</p>') + '</section>' +
      '<section class="hj-bloco hj-prazos-b" id="hj-prazos" aria-labelledby="hj-prazos-t"><header><h2 class="h3" id="hj-prazos-t">Prazos</h2></header><div id="hj-prazos-c">' + prazosHtml(e, null) + '</div></section>' +
      '<section class="hj-bloco hj-dominio" id="hj-dominio" aria-labelledby="hj-dom-t"><header><h2 class="h3" id="hj-dom-t">Domínio por matéria</h2><span class="rot">toque numa matéria para abrir o mapa</span></header>' + dominioHtml(e) + '</section>' +
      '<section class="hj-bloco hj-obj" id="hj-objetivos" aria-labelledby="hj-obj-t"><header><h2 class="h3" id="hj-obj-t">Para onde vou</h2><span class="rot">os quatro eixos</span></header><div id="hj-obj-c">' + objetivosHtml(null) + '</div></section>' +
      '<section class="hj-bloco hj-espera-b" id="hj-espera" aria-labelledby="hj-esp-t"><header><h2 class="h3" id="hj-esp-t">Esperando você</h2><span class="rot">decisões só suas</span></header>' + esperandoHtml() + '</section>' +
      '</div>';
    /* o Meu dia vem aberto e sem o "só se der" dobrável: aqui ele é um bloco do painel */
    var det = el.querySelector('#meu-dia');
    if (det) { det.open = true; window.MeuDia.ligar(el); var ob = el.querySelector('#ad-obj'); if (ob) ob.remove(); }
    /* chegando por um atalho (#hj-painel, #hj-dominio…), rola até ele: o painel só existe depois que os dados chegam */
    if (/^#hj-/.test(location.hash)) {
      var alvo = document.getElementById(location.hash.slice(1));
      if (alvo) setTimeout(function () { alvo.scrollIntoView({ block: 'start' }); }, 60);
    }
    fetch('/api/musica').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (m) {
      var c = document.getElementById('hj-prazos-c'); if (c && m) c.innerHTML = prazosHtml(e, m);
    });
    fetch('/api/perfil').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (pf) {
      var c = document.getElementById('hj-obj-c'); if (c && pf) c.innerHTML = objetivosHtml(pf);
    });
  }

  window.Organizar = { montar: montar };
})();
