(function () {
  'use strict';

  var P = window.Perfil;
  var esc = P.esc;

  var MUSEU = [
    ['qui_ouro.jpg', 'Ouro', 'Elemento nobre — QUI-04'],
    ['qui_diamante.jpg', 'Diamante', 'Carbono em rede covalente — QUI-06'],
    ['qui_grafeno.jpg', 'Grafeno', 'Uma folha de carbono, um átomo de espessura — QUI-06'],
    ['qui_petroleo.jpg', 'Petróleo', 'Matéria-prima fóssil — QUI-13 / QUI-15'],
    ['qui_mercurio.jpg', 'Mercúrio', 'O metal líquido — QUI-15'],
    ['fis_hidreletrica.jpg', 'Hidrelétrica', 'Energia gravitacional em elétrica — FIS-05'],
    ['fis_usina_eolica.jpg', 'Energia eólica', 'O vento como fonte — FIS-05 / GEO-08'],
    ['fis_painel_solar.jpg', 'Energia solar', 'Luz do Sol em eletricidade — FIS-10'],
    ['geo_pangeia.png', 'Pangeia', 'O supercontinente — GEO-04'],
    ['fis_sol.jpg', 'O Sol', 'A estrela que sustenta tudo — FIS-07'],
  ];

  document.getElementById('galeria').innerHTML = MUSEU.map(function (m) {
    return '<figure class="foto"><img src="/imagens/' + m[0] + '" alt="' + esc(m[1]) + '" loading="lazy">' +
      '<figcaption class="cap"><b>' + esc(m[1]) + '</b><span>' + esc(m[2]) + '</span></figcaption></figure>';
  }).join('');

  function desenhar(e) {
    document.getElementById('cadeia').innerHTML = e.cadeia.map(function (c, i) {
      var cls = c.total === 0 ? 'vazia' : c.total <= 1 ? 'rala' : '';
      var aviso = c.semPasta ? 'ainda sem pasta' : c.total <= 1 ? 'quase vazia' : '';
      return '<div class="etapa ' + cls + '"><span class="k">0' + (i + 1) + '</span>' +
        '<div class="en">' + esc(c.etapa) + '</div>' +
        '<div class="n num">' + c.total + '</div>' +
        (c.total ? '<div class="m">ficha média ' + String(c.media).replace('.', ',') + ' KB</div>' : '') +
        (aviso ? '<div class="aviso">' + aviso + '</div>' : '') +
        (c.exemplos && c.exemplos.length ? '<ul>' + c.exemplos.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
        '</div>';
    }).join('');

    document.getElementById('fio').innerHTML = e.fio.map(function (f, i) {
      return '<div class="elo ' + (f.existe ? 'tem' : 'falta') + '"><span class="en">0' + (i + 1) + ' · ' + esc(f.etapa) + '</span>' +
        '<b>' + esc(f.nome) + '</b><span class="st">' + (f.existe ? 'ficha existe' : 'falta escrever') + '</span></div>';
    }).join('');
  }

  P.estado(true).then(desenhar).catch(function () {
    document.getElementById('cadeia').innerHTML = '<div class="etapa" style="grid-column:1/-1;min-height:0"><p class="rot">Servidor desligado</p><p>Abra <b>hoje.bat</b>.</p></div>';
  });
})();
