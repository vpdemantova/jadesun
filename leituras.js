(function () {
  'use strict';

  /* ============================================================
     A PÁGINA LEITURAS (12/out/2026) — o seu perfil de leitura.
     Abertos · Grupos · Marcas · Links · Histórico. Lê o abertos.js
     (o navegador); "Levar para o caderno" grava Logboard/# Profile/
     Leituras.md pelo servidor da casa (no site público, baixa o .md).
     ============================================================ */

  var P = window.Perfil || {};
  var A = window.Abertos;
  var esc = P.esc || function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ic = function (n) { return P.icone ? P.icone(n) : ''; };
  var raiz = document.getElementById('leituras');
  var CH = 'portal-leituras-aba';
  var aba = 'abertos', agrupar = 'grupo', busca = '';
  try { aba = localStorage.getItem(CH) || 'abertos'; } catch (e) { /* ok */ }
  var ESTATICO = !!window.JADESUN_ESTATICO;
  if (location.hash === '#estante' && !ESTATICO) aba = 'estante';

  /* ── 13/out/2026: a Estante dentro das Leituras ("integrar a lista de leituras com a estante") ──
     Os livros de papel (Focos/Arrumar os Livros.md, pela mesma API da Estante 3D) ao lado dos textos
     do leitor: lendo agora com a página em que parou, as listas de leitura em ordem, quero ler e lidos.
     Quando a obra tem estudo no Atlas, ele abre no leitor (e aí ganha marcas, notas e o "parei aqui"). */
  var estante = null, listasEstante = [], obrasAtlas = null, pedindoEstante = false;
  function jsonOu(r) { return r && r.ok ? r.json() : null; }
  function carregarEstante() {
    if (ESTATICO || estante || pedindoEstante) return;
    pedindoEstante = true;
    Promise.all([fetch('/api/livros').then(jsonOu), fetch('/api/estante/layout').then(jsonOu), fetch('/api/biblioteca').then(jsonOu)].map(function (p) { return p.catch(function () { return null; }); }))
      .then(function (r) {
        estante = (r[0] && r[0].livros) || [];
        listasEstante = (r[1] && r[1].listas) || [];
        obrasAtlas = ((r[2] && r[2].itens) || []).filter(function (it) { return it[2] === 'atlas/obras'; });
        pedindoEstante = false; pintar();
      });
  }
  var PARADA = { de: 1, da: 1, do: 1, das: 1, dos: 1, e: 1, a: 1, o: 1, as: 1, os: 1, um: 1, uma: 1, the: 1, of: 1, el: 1, la: 1, le: 1, il: 1, estudo: 1, amplo: 1, obra: 1, livro: 1, edicoes: 1, edicao: 1, completo: 1, notas: 1, leitura: 1 };
  function palavras(t) { return String(t || '').split(' — ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(function (w) { return w.length > 1 && !PARADA[w] && !/^\d+$/.test(w); }); }
  /* a obra do Atlas que é este livro: as palavras importantes batem num sentido ou no outro (os títulos do caderno variam) */
  function obraDe(titulo) {
    if (!obrasAtlas) return null;
    var a = palavras(titulo); if (!a.length) return null;
    var melhor = null, nota = 0;
    obrasAtlas.forEach(function (it) {
      var b = palavras(it[1]); if (!b.length) return;
      var aEmB = a.filter(function (w) { return b.indexOf(w) >= 0; }).length, bEmA = b.filter(function (w) { return a.indexOf(w) >= 0; }).length;
      var longa = a.some(function (w) { return w.length >= 5 && b.indexOf(w) >= 0; });
      /* casa se todas as palavras do estudo estão no livro, ou se ao menos duas do livro estão no estudo ("I Ching" não é "Tao Te Ching") */
      var casa = longa && (bEmA === b.length || (a.length >= 2 && aEmB >= 2 && aEmB / a.length >= 0.66));
      if (!casa) return;
      var n = aEmB + bEmA;
      if (n > nota) { nota = n; melhor = it; }
    });
    return melhor;
  }
  function livroDoTexto(x) {
    if (!estante) return null;
    var a = palavras(x.titulo).join(' ');
    return a ? estante.filter(function (b) { var p = palavras(b.titulo).join(' '); return p && (p === a || obraDe(b.titulo) && obraDe(b.titulo)[0] === x.id); })[0] || null : null;
  }
  function porcento(b) { return b.paginasTotal ? Math.round(100 * Math.min(1, (b.paginaAtual || 0) / b.paginasTotal)) : null; }
  function livroCard(b) {
    var ob = obraDe(b.titulo), pct = porcento(b), e = b.estudo;
    return '<article class="lp-livro" style="--cor:' + esc(b.cor || '#8a6a4a') + '">' +
      '<span class="lp-lombada" aria-hidden="true"><b>' + esc(b.titulo) + '</b></span>' +
      '<div class="lp-livro-in">' +
        '<h3>' + esc(b.titulo) + '</h3>' +
        '<p class="lp-meta">' + (b.atlasId ? '<a href="biblioteca.html#f=' + encodeURI(b.atlasId) + '">' + esc(b.autor || '') + '</a>' : esc(b.autor || 'autor desconhecido')) + '</p>' +
        '<div class="lp-barra" aria-label="' + (pct == null ? 'sem páginas marcadas' : pct + '% lido') + '"><i style="transform:scaleX(' + ((pct || 0) / 100) + ')"></i></div>' +
        '<p class="lp-meta">' + (pct == null ? 'marque a página em que parou' : pct + '% lido · página ' + b.paginaAtual + ' de ' + b.paginasTotal) + (e && e.total ? ' · ' + e.feitas + ' de ' + e.total + ' partes do estudo' : '') + '</p>' +
        '<form class="lp-pag" data-livro="' + esc(b.id) + '"><label>Parei na página <input type="number" min="0" name="atual" value="' + (b.paginaAtual || '') + '" inputmode="numeric"></label><label>de <input type="number" min="0" name="total" value="' + (b.paginasTotal || '') + '" inputmode="numeric"></label><button type="submit" class="botao leve">Guardar</button></form>' +
        (ob ? '<a class="botao" href="biblioteca.html#f=' + encodeURI(ob[0]) + '">' + ic('livro') + 'O estudo no leitor</a>' : '') +
      '</div></article>';
  }
  var NOME_ST = { lendo: 'lendo', 'quero ler': 'quero ler', lido: 'lido' };
  function livroLinha(b) {
    var ob = obraDe(b.titulo);
    return '<li class="lp-livro-li" style="--cor:' + esc(b.cor || '#8a6a4a') + '"><i class="lp-cor" aria-hidden="true"></i><div><b>' + esc(b.titulo) + '</b><span>' + esc(b.autor || '') +
      (b.status ? ' · <em class="lp-st">' + esc(NOME_ST[b.status] || b.status) + '</em>' : '') + (porcento(b) != null ? ' · ' + porcento(b) + '%' : '') + '</span></div>' +
      (ob ? '<a class="lt-mini" href="biblioteca.html#f=' + encodeURI(ob[0]) + '" title="O estudo no leitor">' + ic('livro') + '</a>' : '') + '</li>';
  }
  function htmlEstante() {
    if (!estante) { carregarEstante(); return '<p class="rot suave">Abrindo a estante…</p>'; }
    if (!estante.length) return '<p class="lt-vazio">A estante ainda não tem livros catalogados. Eles moram em <span class="mono">Focos/Arrumar os Livros.md</span>.</p>';
    var lendo = estante.filter(function (b) { return b.status === 'lendo'; });
    var quero = estante.filter(function (b) { return b.status === 'quero ler'; });
    var lidos = estante.filter(function (b) { return b.status === 'lido'; });
    var pos = function (b, nome) { var l = (b.listas || []).filter(function (x) { return x && x.nome === nome; })[0]; return l ? +l.pos || 0 : 0; };
    var h = '<p class="lp-sub lp-est-intro">Os livros de papel da sua <a href="casa.html?area=estante">Estante</a>, ao lado dos textos do leitor. A página em que parou vai para o caderno (a mesma da Estante 3D); quando a obra tem estudo no Atlas, ele abre no leitor, com marcas e notas.</p>';
    h += '<h2 class="h3 lp-h">Lendo agora · ' + lendo.length + '</h2>' + (lendo.length ? '<div class="lp-livros">' + lendo.map(livroCard).join('') + '</div>' : '<p class="lt-vazio">Nenhum livro marcado como “lendo”. Na Estante, abra um livro e mude a situação.</p>');
    if (listasEstante.length) h += '<h2 class="h3 lp-h">As listas de leitura · ' + listasEstante.length + '</h2>' + listasEstante.map(function (l) {
      var membros = estante.filter(function (b) { return (b.listas || []).some(function (x) { return x && x.nome === l.nome; }); }).sort(function (a, b) { return pos(a, l.nome) - pos(b, l.nome); });
      return '<section class="lp-grupo-sec"><header><h2 class="h3">' + esc(l.nome) + '</h2><span class="rot">' + membros.length + '</span></header>' + (l.desc ? '<p class="lp-sub">' + esc(curta(l.desc, 220)) + '</p>' : '') +
        (membros.length ? '<ol class="lp-lista lp-lista-livros">' + membros.map(livroLinha).join('') + '</ol>' : '<p class="lt-vazio">Lista ainda vazia.</p>') + '</section>';
    }).join('');
    if (quero.length) h += '<h2 class="h3 lp-h">Quero ler · ' + quero.length + '</h2><ul class="lp-lista lp-lista-livros">' + quero.map(livroLinha).join('') + '</ul>';
    if (lidos.length) h += '<h2 class="h3 lp-h">Lidos · ' + lidos.length + '</h2><ul class="lp-lista lp-lista-livros">' + lidos.map(livroLinha).join('') + '</ul>';
    return h;
  }

  if (!A) { raiz.innerHTML = '<p class="lt-vazio">As leituras não carregaram (abertos.js).</p>'; return; }

  function quando(iso) {
    if (!iso) return '';
    var d = new Date(iso), hoje = new Date();
    var dias = Math.round((new Date(hoje.toDateString()) - new Date(d.toDateString())) / 864e5);
    var hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return dias === 0 ? 'hoje, ' + hora : dias === 1 ? 'ontem, ' + hora : d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  }
  function curta(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  function cartao(x) {
    return '<article class="lp-card' + (x.dormindo ? ' dormindo' : '') + '">' +
      (x.capa ? '<a class="lp-capa" href="' + esc(x.href || '#') + '" tabindex="-1" aria-hidden="true"><img src="' + esc(x.capa) + '" alt="" loading="lazy"></a>' : '<span class="lp-capa lp-capa-q" aria-hidden="true"></span>') +
      '<div class="lp-card-in">' +
        '<p class="rot">' + esc(x.tema || x.tipo || '') + '</p>' +
        '<h3><a href="' + esc(x.href || '#') + '">' + esc(x.titulo || x.id) + '</a></h3>' +
        (livroDoTexto(x) ? '<p class="lp-na-estante">' + ic('livro') + 'na sua estante · ' + esc(livroDoTexto(x).status || 'catalogado') + '</p>' : '') +
        '<div class="lp-barra" aria-label="' + (x.lidoPct || 0) + '% lido"><i style="transform:scaleX(' + ((x.lidoPct || 0) / 100) + ')"></i></div>' +
        '<p class="lp-meta">' + (x.lidoPct ? x.lidoPct + '% lido' : 'não começado') + (x.parei && x.parei.palavra ? ' · parou em “' + esc(x.parei.palavra) + '”' : '') + ' · ' + quando(x.vistoEm) + ((x.marcas || []).length ? ' · ' + x.marcas.length + ' marcas' : '') + '</p>' +
        '<div class="lp-acoes">' +
          '<a class="botao" href="' + esc(x.href || '#') + '">' + ic('seguir') + (x.lidoPct ? 'Continuar' : 'Ler') + '</a>' +
          (x.aberto ? '<button type="button" class="botao leve" data-a="' + (x.dormindo ? 'acordar' : 'dormir') + '" data-id="' + esc(x.id) + '">' + ic(x.dormindo ? 'sol' : 'dormir') + (x.dormindo ? 'Acordar' : 'Dormir') + '</button>' +
            '<button type="button" class="botao leve" data-a="fechar" data-id="' + esc(x.id) + '">' + ic('fechar') + 'Fechar</button>'
            : '<button type="button" class="botao leve" data-a="reabrir" data-id="' + esc(x.id) + '">' + ic('adicionar') + 'Reabrir</button>') +
        '</div>' +
        '<label class="lp-grupo"><span class="rot">Grupo</span><input type="text" list="lp-grupos" data-grupo="' + esc(x.id) + '" value="' + esc(x.grupo || '') + '" placeholder="tema, livro, projeto…"></label>' +
      '</div></article>';
  }

  function pintar() {
    /* lembra onde estava o foco, para devolver depois do redesenho (quem usa teclado não volta ao topo) */
    var f = document.activeElement, seletor = null;
    if (f && raiz.contains(f) && f.id !== 'lp-q') {
      seletor = ['data-a', 'data-id', 'data-aba', 'data-agrupar', 'data-grupo', 'data-g'].map(function (k) { var v = f.getAttribute(k); return v != null ? '[' + k + '="' + (window.CSS && CSS.escape ? CSS.escape(v) : v) + '"]' : ''; }).join('');
      if (seletor) seletor = f.tagName.toLowerCase() + seletor;
    }
    var todos = A.lista();
    var abertos = todos.filter(function (x) { return x.aberto && !x.dormindo; });
    var dormindo = todos.filter(function (x) { return x.aberto && x.dormindo; });
    var hist = todos.filter(function (x) { return !x.aberto; });
    var marcas = A.todasMarcas();
    var links = A.links();
    var abas = [['abertos', 'Abertos', abertos.length], ['grupos', 'Grupos', A.grupos().length], ['marcas', 'Marcas', marcas.length], ['links', 'Links', links.length], ['historico', 'Histórico', hist.length]];
    if (!ESTATICO) abas.push(['estante', 'Estante', estante ? estante.filter(function (b) { return b.status; }).length : '·']);
    if (aba === 'estante' && ESTATICO) aba = 'abertos';
    var html = '<div class="lp-topo"><div class="lt-seg lp-abas" role="tablist" aria-label="As leituras">' + abas.map(function (a) {
      return '<button type="button" role="tab" data-aba="' + a[0] + '" aria-selected="' + (aba === a[0]) + '">' + a[1] + ' <b>' + a[2] + '</b></button>';
    }).join('') + '</div><div class="lp-topo-acoes">' +
      '<button type="button" class="botao leve" data-a="baixar">' + ic('baixar') + 'Baixar .md</button>' +
      (ESTATICO ? '' : '<button type="button" class="botao" data-a="levar">' + ic('nota') + 'Levar para o caderno</button>') +
      '</div></div><p class="lp-aviso" id="lp-aviso" aria-live="polite"></p>' +
      '<datalist id="lp-grupos">' + A.grupos().map(function (g) { return '<option value="' + esc(g) + '">'; }).join('') + '</datalist>';

    if (aba === 'abertos') {
      html += abertos.length ? '<div class="lp-grade">' + abertos.map(cartao).join('') + '</div>' : '<p class="lt-vazio">Nenhum texto aberto. Abra uma ficha na <a href="biblioteca.html">Biblioteca</a>: ela entra aqui sozinha.</p>';
      if (dormindo.length) html += '<h2 class="h3 lp-h">Dormindo · ' + dormindo.length + '</h2><p class="lp-sub">Guardados como estavam, sem pesar. Acorde quando quiser.</p><div class="lp-grade">' + dormindo.map(cartao).join('') + '</div>';
    } else if (aba === 'grupos') {
      html += '<div class="lt-seg lp-agrupar" role="group" aria-label="Agrupar por">' + [['grupo', 'Os seus grupos'], ['tema', 'Tema'], ['livro', 'Livro']].map(function (o) { return '<button type="button" data-agrupar="' + o[0] + '" aria-pressed="' + (agrupar === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>';
      var grupos = {};
      todos.forEach(function (x) { var g = (agrupar === 'grupo' ? x.grupo : agrupar === 'tema' ? (x.tema || '').split(' › ')[0] : x.livro) || 'Sem ' + (agrupar === 'livro' ? 'livro' : agrupar === 'tema' ? 'tema' : 'grupo'); (grupos[g] = grupos[g] || []).push(x); });
      html += Object.keys(grupos).sort(function (a, b) { return a.localeCompare(b, 'pt'); }).map(function (g) {
        return '<section class="lp-grupo-sec"><header><h2 class="h3">' + esc(g) + '</h2><span class="rot">' + grupos[g].length + '</span>' +
          (agrupar === 'grupo' && A.grupos().indexOf(g) >= 0 ? '<button type="button" class="botao leve" data-a="renomear" data-g="' + esc(g) + '">' + ic('editar') + 'Renomear</button>' : '') + '</header>' +
          '<ul class="lp-lista">' + grupos[g].map(function (x) { return '<li><a href="' + esc(x.href || '#') + '"><b>' + esc(x.titulo || x.id) + '</b><span>' + (x.lidoPct || 0) + '% · ' + ((x.marcas || []).length) + ' marcas · ' + quando(x.vistoEm) + '</span></a></li>'; }).join('') + '</ul></section>';
      }).join('');
    } else if (aba === 'marcas') {
      html += '<label class="lp-busca">' + ic('buscar') + '<input type="search" id="lp-q" placeholder="Buscar nos destaques e nas notas" value="' + esc(busca) + '"></label>';
      var q = busca.toLowerCase();
      var porTexto = {};
      marcas.filter(function (m) { return !q || (m.marca.texto + ' ' + (m.marca.nota || '') + ' ' + m.texto.titulo).toLowerCase().indexOf(q) >= 0; })
        .forEach(function (m) { (porTexto[m.texto.id] = porTexto[m.texto.id] || { t: m.texto, ms: [] }).ms.push(m.marca); });
      var chaves = Object.keys(porTexto);
      html += chaves.length ? chaves.map(function (k) {
        var g = porTexto[k];
        return '<section class="lp-grupo-sec"><header><h2 class="h3"><a href="' + esc(g.t.href || '#') + '">' + esc(g.t.titulo || g.t.id) + '</a></h2><span class="rot">' + esc(g.t.grupo || g.t.livro || (g.t.tema || '').split(' › ')[0] || '') + '</span></header><ul class="lp-marcas">' +
          g.ms.map(function (m) { return '<li><i class="lt-cor lt-m-' + (m.cor || 'sol') + '"></i><div><p class="lp-trecho">' + esc(curta(m.texto, 320)) + '</p>' + (m.nota ? '<p class="lp-nota">' + esc(m.nota) + '</p>' : '') + '<span class="lp-meta">' + quando(m.em) + '</span></div><button type="button" class="lt-mini" data-a="apagar-marca" data-id="' + esc(g.t.id) + '" data-m="' + esc(m.id) + '" title="Apagar">' + ic('lixeira') + '</button></li>'; }).join('') + '</ul></section>';
      }).join('') : '<p class="lt-vazio">' + (q ? 'Nada com “' + esc(busca) + '”.' : 'Ainda sem marcas. No leitor, selecione um trecho para destacar ou anotar.') + '</p>';
    } else if (aba === 'estante') {
      html += htmlEstante();
    } else if (aba === 'links') {
      html += links.length ? '<ul class="lp-lista">' + links.slice().reverse().map(function (l) {
        return '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer"><b>' + esc(l.titulo) + '</b><span>' + esc(l.url.replace(/^https?:\/\//, '').slice(0, 70)) + (l.origem ? ' · de ' + esc(l.origem) : '') + ' · ' + quando(l.em) + '</span></a><button type="button" class="lt-mini" data-a="esquecer" data-url="' + esc(l.url) + '" title="Esquecer">' + ic('fechar') + '</button></li>';
      }).join('') + '</ul>' : '<p class="lt-vazio">Os links que você abrir de dentro de um texto entram aqui.</p>';
    } else {
      html += hist.length ? '<div class="lp-grade">' + hist.map(cartao).join('') + '</div>' : '<p class="lt-vazio">O que você fechar fica aqui, com as marcas.</p>';
    }
    raiz.innerHTML = html;
    if (seletor) { var novo = raiz.querySelector(seletor); if (novo) novo.focus({ preventScroll: true }); else { var t = raiz.querySelector('[role=tab][aria-selected="true"]'); if (t) t.focus({ preventScroll: true }); } }
  }

  raiz.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-aba], [data-a], [data-agrupar]');
    if (!b) return;
    if (b.hasAttribute('data-aba')) { aba = b.getAttribute('data-aba'); try { localStorage.setItem(CH, aba); } catch (e) { /* ok */ } pintar(); return; }
    if (b.hasAttribute('data-agrupar')) { agrupar = b.getAttribute('data-agrupar'); pintar(); return; }
    var a = b.getAttribute('data-a'), id = b.getAttribute('data-id');
    if (a === 'dormir') A.dormir(id, true);
    else if (a === 'acordar') A.dormir(id, false);
    else if (a === 'fechar') A.fechar(id);
    else if (a === 'reabrir') A.reabrir(id);
    else if (a === 'apagar-marca') A.desmarcar(id, b.getAttribute('data-m'));
    else if (a === 'esquecer') A.esquecerLink(b.getAttribute('data-url'));
    else if (a === 'renomear') { var g = b.getAttribute('data-g'); var novo = prompt('Novo nome do grupo “' + g + '”:', g); if (novo && novo.trim() && novo.trim() !== g) A.renomearGrupo(g, novo.trim()); }
    else if (a === 'baixar') {
      var blob = new Blob([A.exportarMd()], { type: 'text/markdown;charset=utf-8' });
      var url = URL.createObjectURL(blob), l = document.createElement('a');
      l.href = url; l.download = 'Leituras.md'; document.body.appendChild(l); l.click(); l.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    }
    else if (a === 'levar') {
      var aviso = document.getElementById('lp-aviso');
      if (!A.lista().length && !A.links().length) { aviso.textContent = 'Ainda não há nada para levar: abra e leia algum texto primeiro.'; return; }
      b.disabled = true; aviso.textContent = 'Gravando no caderno…';
      fetch('/api/leituras/levar', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify({ md: A.exportarMd() }) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.erro || r.status); return j; }); })
        .then(function (j) { aviso.textContent = (j.aviso ? j.aviso + ' ' : 'Gravado: ') + j.rel; })
        .catch(function (e) { aviso.textContent = 'Não gravou: ' + e.message; })
        .then(function () { b.disabled = false; });
    }
  });
  raiz.addEventListener('submit', function (ev) {
    var f = ev.target.closest('form.lp-pag');
    if (!f) return;
    ev.preventDefault();
    var l = (estante || []).filter(function (b) { return b.id === f.getAttribute('data-livro'); })[0];
    if (!l) return;
    var atual = Math.max(0, parseInt(f.elements.atual.value, 10) || 0), total = Math.max(0, parseInt(f.elements.total.value, 10) || 0);
    var aviso = document.getElementById('lp-aviso');
    var corpo = { tituloAntigo: l.titulo, autorAntigo: l.autor, titulo: l.titulo, tituloOriginal: l.tituloOriginal, autor: l.autor, tags: l.tags,
      status: l.status, destino: l.destino, prioridade: l.prioridade, paginaAtual: atual, paginasTotal: total, secaoReal: l.secaoReal, listas: l.listas || [],
      formato: l.formato, tamanho: l.tamanho, material: l.material, medidas: l.medidas, suporte: l.suporte, tipoScan: l.tipoScan, comercial: l.comercial };
    var b = f.querySelector('button'); if (b) b.disabled = true;
    fetch('/api/livros/salvar', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify(corpo) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.erro || r.status); return j; }); })
      .then(function (j) { if (j.livros) estante = j.livros; pintar(); var av = document.getElementById('lp-aviso'); if (av) av.textContent = 'Página guardada em “' + l.titulo + '” (Arrumar os Livros.md).'; })
      .catch(function (e) { if (aviso) aviso.textContent = 'Não guardei: ' + e.message; if (b) b.disabled = false; });
  });
  raiz.addEventListener('change', function (ev) {
    var i = ev.target.closest('[data-grupo]');
    if (i) A.grupo(i.getAttribute('data-grupo'), i.value.trim());
  });
  raiz.addEventListener('input', function (ev) {
    if (ev.target.id === 'lp-q') { busca = ev.target.value; var pos = ev.target.selectionStart; pintar(); var n = document.getElementById('lp-q'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
  });
  window.addEventListener('abertos:mudou', function () { var ativo = document.activeElement; if (ativo && ativo.matches && ativo.matches('input[data-grupo]')) return; pintar(); });
  pintar();
})();
