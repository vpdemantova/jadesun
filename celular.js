(function () {
  'use strict';

  var esc = window.Perfil.esc;
  var alvo = document.getElementById('cel');

  function qrSvg(texto) {
    var qr = window.qrcode(0, 'M');
    qr.addData(texto);
    qr.make();
    return qr.createSvgTag({ cellSize: 6, margin: 3, scalable: true });
  }

  function passos() {
    return '<div class="cx"><p class="rot">Como usar, em 4 passos</p><ol class="cel-passos">' +
      '<li><b>Mesmo Wi-Fi.</b> O celular e o computador precisam estar na mesma rede.</li>' +
      '<li><b>Aponte a câmera para o QR</b> (ou digite o link). A primeira vez guarda o código no aparelho.</li>' +
      '<li><b>Instale na tela inicial.</b> Android/Chrome: menu ⋮ e “Adicionar à tela inicial”. iPhone/Safari: compartilhar e “Adicionar à Tela de Início”.</li>' +
      '<li><b>Deixe o computador ligado</b> com a janela preta aberta. Se desligar o computador, o celular não abre.</li></ol></div>';
  }

  function fora() {
    return '<div class="cx"><p class="rot">Fora de casa</p><p>O modo acima funciona na sua rede. Para usar de qualquer lugar sem abrir nada para a internet, instale o <b>Tailscale</b> (gratuito) no computador e no celular, entre com a mesma conta e abra o link com o endereço do Tailscale do computador (começa com 100.). O código continua sendo pedido.</p></div>' +
      '<div class="cx"><p class="rot">Cuidados</p><p>Quem tem o link com o código consegue ler e marcar o seu caderno. Não compartilhe o link. Use só em redes de confiança. Para trocar o código, apague o arquivo <span class="mono">jadesun/dados/celular-token.txt</span> e abra o <b>celular.bat</b> de novo.</p></div>';
  }

  function ligado(d) {
    if (!d.enderecos.length) {
      alvo.innerHTML = '<div class="cx"><p class="rot">Sem rede</p><p>Não achei nenhuma rede local neste computador. Conecte-se a um Wi-Fi e abra o <b>celular.bat</b> de novo.</p></div>';
      return;
    }
    alvo.innerHTML = '<div class="cel-grade">' + d.enderecos.map(function (e) {
      return '<div class="cx cel-qr"><p class="rot">Rede: ' + esc(e.nome) + '</p><div class="cel-svg">' + qrSvg(e.url) + '</div>' +
        '<p class="mono cel-url" id="u-' + esc(e.ip) + '">' + esc(e.url) + '</p>' +
        '<div class="acoes"><button type="button" class="botao" data-c="' + esc(e.url) + '">Copiar link</button></div></div>';
    }).join('') + '</div>' + passos() + fora();
    alvo.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-c]');
      if (!b) return;
      var url = b.getAttribute('data-c');
      var ok = function () { b.textContent = 'Copiado'; setTimeout(function () { b.textContent = 'Copiar link'; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok);
    });
  }

  function desligado() {
    alvo.innerHTML = '<div class="cx"><p class="rot">Modo celular desligado</p>' +
      '<p>Para usar no celular ou no tablet, feche a janela preta atual e abra o <b>celular.bat</b> (na pasta <span class="mono">jadesun</span>), com duplo clique. Ele liga o mesmo perfil, mas aceita o celular na sua rede, protegido por um código.</p>' +
      '<p class="suave">Na primeira vez, o Windows pergunta sobre o firewall: marque “Rede privada” e permita.</p></div>' + passos() + fora();
  }

  fetch('/api/celular').then(function (r) { return r.json(); }).then(function (d) {
    if (d.ativo) ligado(d); else desligado();
  }).catch(function () {
    alvo.innerHTML = '<div class="cx"><p class="rot">Aberto de outro aparelho</p><p>Esta página só mostra o QR no computador. No celular, você já está usando o Portal Solar.</p></div>';
  });
})();
