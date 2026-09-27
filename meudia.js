(function () {
  'use strict';

  var P = window.Perfil;
  var esc = P.esc;
  var K = 'jadesun-jardim';

  var LIGA = {
    'portal-solar-atlas': { txt: 'Um tijolo do Atlas é matéria-prima de curadoria e de escrita.', href: 'atlas.html#at-falta', rot: 'Ver o próximo tijolo' },
    lutheria: { txt: 'Música e lutheria: o ofício que paga sem diploma.', href: null },
    'o-corpo': { txt: 'A base de tudo o mais. Sagrado.', href: null },
  };

  function iso() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function base() { return { v: 1, atualizado: 0, orvalho: 0, plantas: {}, extras: [], regas: 0, podas: 0, sementesGanhas: 0, dias: {}, conquistas: {}, diario: [], vistos: {} }; }
  function ler() { try { return JSON.parse(localStorage.getItem(K) || 'null') || base(); } catch (e) { return base(); } }
  function feitos() { var d = ler(); return (d.meudia || {})[iso()] || {}; }
  function alternar(id) {
    var d = ler();
    d.meudia = d.meudia || {};
    var h = d.meudia[iso()] = d.meudia[iso()] || {};
    h[id] = !h[id];
    d.atualizado = Date.now();
    try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) { /* sem espaço */ }
    return h[id];
  }

  /* ---------- cronômetro por bloco do dia — pra ele dividir o tempo de verdade,
     não só marcar feito/não feito. Um cronômetro por tarefa, guardado por dia
     (chave = data + id do bloco), sobrevive a fechar o painel e a trocar de página. */
  function cronChave(id) { return iso() + '|' + id; }
  function cronAcumulado(id) {
    var d = ler();
    return (d.cronometros || {})[cronChave(id)] || 0;
  }
  function cronSalvar(id, segundos) {
    var d = ler();
    d.cronometros = d.cronometros || {};
    d.cronometros[cronChave(id)] = Math.max(0, segundos);
    d.atualizado = Date.now();
    try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) { /* sem espaço */ }
  }
  var cronRodando = {}; /* id -> { desde, intervalo } — só em memória: "rodando" não precisa sobreviver a recarregar a página */
  function fmtCrono(s) {
    s = Math.max(0, Math.round(s));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    var mm = String(m).padStart(2, '0'), ss = String(r).padStart(2, '0');
    return h ? h + ':' + mm + ':' + ss : mm + ':' + ss;
  }
  function cronTotalAgora(id) {
    var base_ = cronAcumulado(id);
    var r = cronRodando[id];
    return r ? base_ + (Date.now() - r.desde) / 1000 : base_;
  }
  function cronAtualizarTela(id) {
    var t = fmtCrono(cronTotalAgora(id));
    document.querySelectorAll('[data-crono-mostra="' + id + '"]').forEach(function (el) { el.textContent = t; });
  }
  function cronIniciar(id) {
    if (cronRodando[id]) return;
    cronRodando[id] = { desde: Date.now(), intervalo: setInterval(function () { cronAtualizarTela(id); }, 1000) };
    document.querySelectorAll('[data-crono-caixa="' + id + '"]').forEach(function (el) { el.classList.add('rodando'); });
    cronPintarBotoes(id);
  }
  function cronPausar(id) {
    var r = cronRodando[id];
    if (!r) return;
    clearInterval(r.intervalo);
    cronSalvar(id, cronAcumulado(id) + (Date.now() - r.desde) / 1000);
    delete cronRodando[id];
    document.querySelectorAll('[data-crono-caixa="' + id + '"]').forEach(function (el) { el.classList.remove('rodando'); });
    cronPintarBotoes(id);
    cronAtualizarTela(id);
  }
  function cronZerar(id) {
    cronPausar(id);
    cronSalvar(id, 0);
    cronAtualizarTela(id);
  }
  function cronPintarBotoes(id) {
    var rodando = !!cronRodando[id];
    document.querySelectorAll('[data-crono-alterna="' + id + '"]').forEach(function (b) {
      b.textContent = rodando ? 'Pausar' : (cronAcumulado(id) > 0.5 ? 'Continuar' : 'Iniciar');
      b.setAttribute('aria-pressed', String(rodando));
    });
  }
  /* se a página fechar ou navegar com um cronômetro rodando, salva o tempo até agora — senão perde */
  window.addEventListener('beforeunload', function () { Object.keys(cronRodando).forEach(cronPausar); });

  function htmlCronometro(id) {
    return '<div class="ad-cron" data-crono-caixa="' + esc(id) + '">' +
      '<span class="ad-cron-t mono" data-crono-mostra="' + esc(id) + '">' + fmtCrono(cronTotalAgora(id)) + '</span>' +
      '<button type="button" class="ad-cron-b" data-crono-alterna="' + esc(id) + '" aria-pressed="' + !!cronRodando[id] + '">' + (cronRodando[id] ? 'Pausar' : (cronAcumulado(id) > 0.5 ? 'Continuar' : 'Iniciar')) + '</button>' +
      '<button type="button" class="ad-cron-b leve" data-crono-zerar="' + esc(id) + '" aria-label="Zerar o cronômetro deste bloco">Zerar</button></div>';
  }

  function html(outras) {
    if (!outras.length) return '';
    var f = feitos();
    var n = outras.filter(function (t) { return f[norm(t.area)]; }).length;
    return '<details class="ag-outras ag-dia" id="meu-dia" open><summary>As outras ' + outras.length + ' — só se der<span class="ad-n" id="ad-n">' + n + '/' + outras.length + '</span></summary>' +
      '<p class="ad-regra">Uma linha basta. Se parar depois da primeira, o dia já valeu. Marque só o que fizer; cada bloco rega o jardim.</p>' +
      '<ul class="ad-lista">' + outras.map(function (t) {
        var id = norm(t.area);
        var lg = LIGA[id] || {};
        var on = !!f[id];
        return '<li class="' + (on ? 'on' : '') + '" data-id="' + esc(id) + '"><button type="button" class="ad-ck" data-ad="' + esc(id) + '" aria-pressed="' + on + '" aria-label="Marcar como feito: ' + esc(t.area) + '"></button>' +
          '<div><p class="rot">' + esc(t.area) + ' · ' + esc(t.tempo) + '</p><p class="ad-t">' + esc(t.tarefa) + '</p>' +
          (lg.txt ? '<p class="ad-l">' + esc(lg.txt) + (lg.href ? ' <a href="' + lg.href + '">' + esc(lg.rot) + '</a>' : '') + '</p>' : '') +
          htmlCronometro(id) + '</div></li>';
      }).join('') + '</ul>' +
      '<div class="ad-obj" id="ad-obj"></div>' +
      '<p class="ad-j"><a class="botao" href="jardim.html">Ver o jardim</a></p></details>';
  }

  var objetivosCarregados = false;
  function carregarObjetivos() {
    if (objetivosCarregados) return;
    objetivosCarregados = true;
    fetch('/api/perfil').then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      var el = document.getElementById('ad-obj');
      if (!el || !j || !j.arquivos || !j.arquivos.objetivos || !j.arquivos.objetivos.texto) return;
      var nomes = [];
      var re = /^\|\s*\*\*(.+?)\*\*/gm, m;
      while ((m = re.exec(j.arquivos.objetivos.texto))) nomes.push(m[1].replace(/\s*\(.*$/, '').trim());
      if (!nomes.length) return;
      el.innerHTML = '<p class="rot">Para onde vou · os quatro trabalhos, um por vez</p><p class="ad-chips">' + nomes.map(function (x) { return '<span class="chip pequeno">' + esc(x) + '</span>'; }).join('') + '</p>' +
        '<p class="ad-l">O vestibular vem antes. Depois dele, escolha um destes para o dia. <a href="eu.html#docs">Abrir Objetivos</a></p>';
    }).catch(function () { /* sem servidor */ });
  }

  function ligar(raiz) {
    var det = raiz.querySelector('#meu-dia');
    if (!det) return;
    det.addEventListener('toggle', function () { if (det.open) carregarObjetivos(); });
    if (det.open) carregarObjetivos();
    det.addEventListener('click', function (ev) {
      var bIni = ev.target.closest('[data-crono-alterna]');
      if (bIni) {
        var idI = bIni.getAttribute('data-crono-alterna');
        if (cronRodando[idI]) cronPausar(idI); else cronIniciar(idI);
        return;
      }
      var bZero = ev.target.closest('[data-crono-zerar]');
      if (bZero) {
        var idZ = bZero.getAttribute('data-crono-zerar');
        if (window.confirm('Zerar o cronômetro deste bloco?')) cronZerar(idZ);
        return;
      }
      var b = ev.target.closest('.ad-ck');
      if (!b) return;
      var on = alternar(b.getAttribute('data-ad'));
      b.setAttribute('aria-pressed', String(on));
      b.closest('li').classList.toggle('on', on);
      var f = feitos();
      var total = det.querySelectorAll('.ad-ck').length;
      var n = Object.keys(f).filter(function (k) { return f[k]; }).length;
      var el = document.getElementById('ad-n');
      if (el) el.textContent = n + '/' + total;
    });
  }

  window.MeuDia = { html: html, ligar: ligar, feitosHoje: function () { var f = feitos(); return Object.keys(f).filter(function (k) { return f[k]; }).length; } };
})();
