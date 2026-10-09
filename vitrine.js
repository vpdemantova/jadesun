/* ============================================================
   O CARTÃO DE VISITA — a página pública da ficha (08/out/2026, item 72; convite em 09/out, item 74)
   1. Com ?convite=1: as boas-vindas (quem convidou, o que é o Portal Solar, o movimento).
   2. O cartão (gira; no verso, o QR do convite) e o que fazer com ele.
   3. A ficha inteira (só o que é público).
   4. "Faça a sua": a ficha de quem chegou, com o cartão se montando ao lado; vira um arquivo .md
      que a pessoa guarda e manda de volta (o rascunho fica neste navegador).
   ============================================================ */
(function () {
  'use strict';
  var F = window.Ficha, CV = window.CartaoVisita;
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var convite = /[?&]convite=1/.test(location.search);
  var linkConvite = CV.convite(location.origin + location.pathname);
  var dados = null;
  var CHAVE = 'portal-minha-ficha';

  function baixar(nome, texto, tipo) {
    var url = URL.createObjectURL(new Blob([texto], { type: tipo || 'text/markdown;charset=utf-8' }));
    var a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
  function nomeArquivo(n) { return (n || 'ficha').replace(/[\\/:*?"<>|]+/g, '').trim() + '.md'; }

  function boasVindas(v) {
    var quem = v && v.publica && v.nome ? v.nome : null;
    $('vt-boas').hidden = false;
    $('vt-boas').innerHTML = '<p class="rot">Um convite</p>' +
      '<h1 class="vt-boas-t">Boas-vindas!' + (quem ? '<span><b>' + esc(quem) + '</b> te convidou para o Portal Solar.</span>' : '<span>Alguém te convidou para o Portal Solar.</span>') + '</h1>' +
      '<div class="vt-boas-grade">' +
        '<div class="vt-boas-c"><b>O que é</b><p>Uma casa de conhecimento que mora no computador de cada pessoa: o Atlas do mundo, o dia de hoje, uma ficha de quem você é e uma casa em 3D. Os seus arquivos são seus: nada fica preso num servidor de alguém.</p></div>' +
        '<div class="vt-boas-c vt-boas-mov"><b>O movimento</b><p>Um movimento de ativismo máximo: agir em cada momento com o máximo de amor; dar a todos o acesso às obras preciosas da humanidade; contra marcas e falsidades.</p><q>A verdade pura é bem-vinda, e o que está em torno dela pode contemplá-la.</q></div>' +
        '<div class="vt-boas-c"><b>Como entrar</b><p>Veja o cartão' + (quem ? ' de ' + esc(quem.split(' ')[0]) : '') + ', logo abaixo. Depois, faça a sua ficha, em um minuto: ela vira um arquivo seu, que você guarda e manda de volta.</p><a class="botao pri" href="#vt-faca">Fazer a minha ficha</a></div>' +
      '</div>';
  }

  function cartao(v) {
    $('vt-cartao').innerHTML = '<div class="vt-cartao-grade"><div class="vt-cartao">' + CV.html(v, { link: linkConvite }) + '</div><div class="vt-cartao-txt">' +
      '<p class="rot">O cartão de</p><h2 class="vt-nome">' + esc(v.nome) + '</h2>' + (v.frase ? '<p class="vt-frase">' + esc(v.frase) + '</p>' : '') +
      '<div class="vt-acoes"><button type="button" class="botao pri" id="vt-copiar">Copiar o link do cartão</button><button type="button" class="botao" id="vt-baixar">Guardar esta pessoa (.md)</button></div>' +
      '<p class="vt-nota">Gire o cartão para ver o QR. Para guardar ' + esc(v.nome.split(' ')[0]) + ' na sua rede, baixe a ficha e abra na aba Rede do seu Portal Solar (ou no Obsidian: é texto).</p></div></div>';
    CV.ligar($('vt-cartao'));
    $('vt-baixar').addEventListener('click', function () { baixar(nomeArquivo(v.nome), F.md(Object.assign({}, v, { endereco: location.origin + location.pathname }))); });
    $('vt-copiar').addEventListener('click', function (ev) {
      var b = ev.currentTarget;
      (navigator.clipboard ? navigator.clipboard.writeText(linkConvite) : Promise.reject()).then(function () { b.textContent = 'Link copiado'; }).catch(function () { b.textContent = linkConvite; });
    });
  }

  /* ---------- faça a sua ---------- */
  function lerRascunho() { try { return JSON.parse(localStorage.getItem(CHAVE) || 'null') || {}; } catch (e) { return {}; } }
  function gravarRascunho(d) { try { localStorage.setItem(CHAVE, JSON.stringify(d)); } catch (e) { /* sem espaço */ } }
  function faca(v) {
    var d = lerRascunho(), quem = v && v.publica && v.nome ? v.nome.split(' ')[0] : null;
    var campo = function (n, rot, ph) { return '<label class="vt-campo"><span>' + rot + '</span><input name="' + n + '" value="' + esc(d[n] || '') + '" placeholder="' + esc(ph) + '" autocomplete="off"></label>'; };
    $('vt-faca').innerHTML = '<div class="vt-faca-grade"><form class="vt-faca-form" id="vt-faca-form"><p class="rot">A sua vez</p><h2 class="vt-faca-t">Faça a sua ficha</h2>' +
      '<p class="vt-nota">Nada sai deste navegador até você baixar. O arquivo é seu: guarde, mande' + (quem ? ' para ' + esc(quem) : '') + ', ou leve para o seu próprio Portal Solar.</p>' +
      campo('nome', 'Nome', 'Como você quer ser chamado') + '<div class="vt-campos-2">' + campo('oficio', 'Ofício', 'o que você faz') + campo('onde', 'Onde', 'cidade, país') + '</div>' +
      campo('frase', 'Uma frase', 'o que você faz existir que antes não existia') +
      '<label class="vt-campo"><span>A sua voz <small>(uma frase sua, nas suas palavras)</small></span><textarea name="voz" rows="2">' + esc(d.voz || '') + '</textarea></label>' +
      '<label class="vt-campo"><span>Quem é</span><textarea name="quemE" rows="4">' + esc(d.quemE || '') + '</textarea></label>' +
      '<div class="vt-acoes"><button type="submit" class="botao pri">Baixar a minha ficha (.md)</button>' + (navigator.share ? '<button type="button" class="botao" id="vt-enviar">Mandar' + (quem ? ' para ' + esc(quem) : '') + '…</button>' : '') + '<button type="button" class="botao leve" id="vt-limpar">Começar de novo</button></div></form>' +
      '<aside class="vt-faca-previa"><p class="rot">O seu cartão</p><div id="vt-meu-cartao">' + CV.html(d, { dica: 'o seu cartão, agora' }) + '</div></aside></div>';
    var form = $('vt-faca-form');
    var ler = function () { var e = form.elements; return { nome: e.nome.value.trim(), oficio: e.oficio.value.trim(), onde: e.onde.value.trim(), frase: e.frase.value.trim(), voz: e.voz.value.trim(), quemE: e.quemE.value.trim(), visibilidade: 'publico' }; };
    form.addEventListener('input', function () { var x = ler(); gravarRascunho(x); $('vt-meu-cartao').innerHTML = CV.html(x, { dica: 'o seu cartão, agora' }); });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault(); var x = ler(); if (!x.nome) { form.elements.nome.focus(); return; }
      baixar(nomeArquivo(x.nome), F.escrever(x));
    });
    var enviar = $('vt-enviar');
    if (enviar) enviar.addEventListener('click', function () {
      var x = ler(); if (!x.nome) { form.elements.nome.focus(); return; }
      var arq = new File([F.escrever(x)], nomeArquivo(x.nome), { type: 'text/markdown' });
      var pedido = navigator.canShare && navigator.canShare({ files: [arq] }) ? { files: [arq], title: 'A ficha de ' + x.nome, text: 'A minha ficha do Portal Solar' } : { title: 'A ficha de ' + x.nome, text: F.escrever(x) };
      navigator.share(pedido).catch(function () { /* cancelou */ });
    });
    $('vt-limpar').addEventListener('click', function () { gravarRascunho({}); faca(v); });
    CV.ligar($('vt-faca'));
  }

  function erro(t) { $('vt-cartao').innerHTML = '<div class="cx"><p class="rot">Cartão indisponível</p><p>' + t + '</p></div>'; }
  fetch('/api/vitrine', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(); return r.json(); }).then(function (v) {
    dados = v;
    if (convite) boasVindas(v);
    if (!v.publica) { erro(v.existe ? 'Esta ficha é privada: a pessoa ainda não escolheu compartilhar.' : 'Esta pessoa ainda não escreveu a ficha dela.'); faca(v); return; }
    document.title = (v.nome || 'Cartão') + ' — Portal Solar';
    cartao(v);
    $('vt').innerHTML = F.html(v, {});
    faca(v);
    if (convite && location.hash === '#vt-faca') $('vt-faca').scrollIntoView();
  }).catch(function () { erro('Não consegui abrir. Se for o seu computador, ligue o Portal Solar (hoje.command).'); faca(null); });
})();
