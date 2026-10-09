/* ============================================================
   O CARTÃO DE VISITA (09/out/2026, PERFIL.md item 74)
   "no perfil, fique como um card de visita que eu posso mandar o link pra um amigo e ele possa
   fazer o dele, apareça uma boas-vindas e quem convidou"
   Um componente para três lugares: a prévia ao vivo da criação da ficha (Eu), a página pública
   (vitrine.html) e o "faça a sua" de quem foi convidado. Frente: a marca, o nome, o ofício, a voz.
   Verso: o QR do link de convite. Gira com o toque (ou Enter/Espaço).
     CartaoVisita.html(v, { link, dica }) → o HTML do cartão
     CartaoVisita.ligar(raiz)               → desenha os QR e liga o girar
     CartaoVisita.convite(link)             → o link com ?convite=1
   ============================================================ */
(function () {
  'use strict';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function iniciais(nome) { return String(nome || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p[0].toUpperCase(); }).join('') || '·'; }
  function Q() { return window.Icones ? window.Icones.quadrado() : '<i class="cv-q"></i>'; }
  function convite(link) { return String(link || '').split('#')[0].replace(/[?&]convite=1/, '') + (String(link).indexOf('?') >= 0 ? '&' : '?') + 'convite=1'; }

  function html(v, op) {
    v = v || {}; op = op || {};
    var nome = v.nome || 'O seu nome';
    var linha = [v.oficio, v.onde].filter(Boolean).join(' · ');
    var voz = (v.voz || v.frase || '').split('\n')[0];
    var link = op.link || '';
    return '<div class="rd-carta cv-carta' + (v.nome ? '' : ' cv-vazio') + '" tabindex="0" role="button" aria-label="O cartão de ' + esc(nome) + '. Toque para virar."><div class="rd-carta-in">' +
      '<div class="rd-face rd-frente"><span class="rd-sol" aria-hidden="true"></span><span class="rd-marca">' + Q() + 'Portal Solar</span>' +
        '<span class="rd-ini" aria-hidden="true">' + esc(iniciais(v.nome)) + '</span><b class="rd-nome">' + esc(nome) + '</b>' +
        '<span class="rd-oficio">' + esc(linha || (v.nome ? '' : 'o que você faz · onde')) + '</span>' +
        (voz ? '<q class="rd-voz">' + esc(voz) + '</q>' : '') + '<span class="rd-dica">' + esc(op.dica || 'toque para virar') + '</span></div>' +
      '<div class="rd-face rd-verso">' + (link ? '<div class="rd-qr" data-qr="' + esc(link) + '"></div><span class="rd-link">' + esc(link.replace(/^https?:\/\//, '').replace(/[?&]convite=1$/, '')) + '</span>' : '<div class="rd-qr cv-qr-vazio"></div>') +
        '<span class="rd-verso-t">Uma ficha de pessoa · sem feed, sem curtidas, sem seguidores</span></div></div></div>';
  }

  function ligar(raiz) {
    if (!raiz) return;
    raiz.querySelectorAll('[data-qr]').forEach(function (el) {
      if (!window.qrcode || el.dataset.qrFeito === el.dataset.qr) return;
      try { var q = window.qrcode(0, 'M'); q.addData(el.dataset.qr); q.make(); el.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); el.dataset.qrFeito = el.dataset.qr; } catch (e) { /* sem QR */ }
    });
    if (raiz._cvLigado) return;
    raiz._cvLigado = true;
    raiz.addEventListener('click', function (ev) { var c = ev.target.closest('.cv-carta'); if (c && !ev.target.closest('a, button')) c.classList.toggle('virada'); });
    raiz.addEventListener('keydown', function (ev) { var c = ev.target.closest && ev.target.closest('.cv-carta'); if (c && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); c.classList.toggle('virada'); } });
  }

  window.CartaoVisita = { html: html, ligar: ligar, convite: convite, iniciais: iniciais };
})();
