(function () {
  'use strict';

  var eventos = window.LINHA_EVENTOS;
  if (!eventos) return;
  var esc = window.Perfil ? window.Perfil.esc : function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function credito(im) {
    var t = [im.autor, im.licenca].filter(function (x) { return x; }).join(' · ');
    return t || 'Wikimedia Commons';
  }

  function ligacao(im) { return 'biblioteca.html#f=' + encodeURI(im.ficha); }

  function fig(im) {
    return '<figure><a href="' + ligacao(im) + '"><img src="' + esc(im.src) + '" alt="' + esc(im.legenda) + '" loading="lazy" decoding="async"></a>' +
      '<figcaption><b>' + esc(im.legenda) + '</b><span>' + esc(credito(im)) + '</span></figcaption></figure>';
  }

  fetch('/api/linha', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify({ eventos: eventos }) })
    .then(function (r) { if (!r.ok) throw new Error('linha'); return r.json(); })
    .then(function (d) {
      document.querySelectorAll('.card').forEach(function (card) {
        var e = d.eventos[+card.dataset.idx];
        if (!e) return;
        if (e.imagem) {
          var a = document.createElement('a');
          a.className = 'ev-img';
          a.href = ligacao(e.imagem);
          a.title = e.imagem.legenda + ' — ' + credito(e.imagem);
          a.innerHTML = '<img src="' + esc(e.imagem.src) + '" alt="' + esc(e.imagem.legenda) + '" loading="lazy" decoding="async"><span class="ev-cred">' + esc(credito(e.imagem)) + '</span>';
          card.insertBefore(a, card.firstChild);
        }
        var ref = card.querySelector('span.ref');
        if (ref && e.ficha) {
          var l = document.createElement('a');
          l.className = 'ref';
          l.href = 'biblioteca.html#f=' + encodeURI(ref.textContent.trim());
          l.textContent = ref.textContent.trim() + ' →';
          l.title = 'Abrir a ficha completa';
          ref.parentNode.replaceChild(l, ref);
        }
      });
      Object.keys(d.eras).forEach(function (k) {
        var sec = document.getElementById('e' + k);
        var imgs = d.eras[k];
        if (!sec || !imgs || !imgs.length) return;
        var m = document.createElement('div');
        m.className = 'era-mosaico n' + imgs.length;
        m.innerHTML = imgs.map(fig).join('');
        var cabeca = sec.querySelector('.era-head');
        if (cabeca) cabeca.parentNode.insertBefore(m, cabeca.nextSibling);
      });
    })
    .catch(function () { /* sem servidor, a linha do tempo segue só com texto */ });
})();
