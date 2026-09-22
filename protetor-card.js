(function () {
  'use strict';
  /* O protetor de tela, em miniatura, dentro de um card comum — em qualquer
     página que tiver um <div data-protetor-mini>. Mesmo motor de protetor.js,
     só que pequeno, sem os painéis de código/lembrete/mapas (esses moram na
     versão de tela cheia, um clique adiante). */

  function montarUm(caixa) {
    if (!window.Protetor || caixa.querySelector('canvas')) return;
    var modos = window.Protetor.ORDEM;
    caixa.innerHTML =
      '<p class="rot">Protetor de tela<a class="pt-mini-cheia" href="protetor.html" title="Abrir em tela cheia, com código, matemática e mapas">Tela cheia ↗</a></p>' +
      '<canvas class="pt-mini-tela"></canvas>' +
      '<div class="pt-mini-modos">' + modos.map(function (k) {
        return '<button type="button" class="pt-mini-modo" data-modo="' + k + '" title="' + window.Protetor.MODOS[k].rot + '"><span></span></button>';
      }).join('') + '</div>';

    var canvas = caixa.querySelector('canvas');
    var instancia = window.Protetor.criar(canvas, {
      compacto: true,
      modoInicial: modos[Math.floor(Math.random() * modos.length)],
      autoTrocaMs: 16000,
      aoTrocar: marcarModo,
    });
    function marcarModo() {
      caixa.querySelectorAll('.pt-mini-modo').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-modo') === instancia.obterModo()));
      });
    }
    marcarModo();
    caixa.querySelector('.pt-mini-modos').addEventListener('click', function (e) {
      var b = e.target.closest('[data-modo]');
      if (b) instancia.trocarModo(b.getAttribute('data-modo'));
    });
  }

  function montarTodos() { document.querySelectorAll('[data-protetor-mini]').forEach(montarUm); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montarTodos);
  else montarTodos();
  /* páginas como Agora redesenham o conteúdo depois de carregar os dados —
     um observador cobre o card aparecendo tarde, sem precisar mexer em cada página */
  new MutationObserver(montarTodos).observe(document.body, { childList: true, subtree: true });
})();
