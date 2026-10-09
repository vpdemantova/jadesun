/* ============================================================
   A CONTA (09/out/2026, PERFIL.md item 74) — a página entrar.html
   Três estados: (1) a casa ainda não tem conta → criar (só no computador); (2) tem conta e você
   não entrou → entrar (com senha ou rede social); (3) você entrou → a sua conta: sessões abertas,
   trocar a senha, ligar redes, sair. Ao lado, sempre: como a conta funciona (local-first).
   ============================================================ */
(function () {
  'use strict';

  var raiz = document.getElementById('ct');
  var H = { 'Content-Type': 'application/json', 'X-Perfil': '1' };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ic(n) { return window.Icones ? window.Icones.svg(n) : ''; }
  var GH = '<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path fill="currentColor" stroke="none" d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.7s.8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>';
  var GG = '<svg viewBox="0 0 24 24" aria-hidden="true" class="ico"><path fill="#EA4335" stroke="none" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8a6 6 0 0 1 0-12c1.9 0 3.1.8 3.8 1.5l2.6-2.5A9.4 9.4 0 0 0 12 2.5a9.5 9.5 0 0 0 0 19c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6z"/></svg>';
  var E = null;

  /* ---------- item 75: a digital do aparelho (passkeys) e o endereço de fora (o túnel https) ---------- */
  function b64uParaBuf(t) { t = String(t).replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; var b = atob(t), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u.buffer; }
  function bufParaB64u(buf) { var u = new Uint8Array(buf), t = ''; for (var i = 0; i < u.length; i++) t += String.fromCharCode(u[i]); return btoa(t).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function temDigital() { return !!(window.PublicKeyCredential && navigator.credentials && window.isSecureContext); }
  function noEnderecoDeFora() { return !!(E && E.endereco && location.origin === E.endereco); }
  function ligarDigital(bt) {
    bt.disabled = true;
    post('chave/opcoes', { tipo: 'ligar' }).then(function (o) {
      var pk = o.publicKey;
      pk.challenge = b64uParaBuf(pk.challenge); pk.user.id = b64uParaBuf(pk.user.id);
      pk.excludeCredentials = (pk.excludeCredentials || []).map(function (c) { return { type: c.type, id: b64uParaBuf(c.id) }; });
      return navigator.credentials.create({ publicKey: pk });
    }).then(function (cred) {
      if (!cred) throw new Error('O aparelho não criou a chave.');
      return post('chave/ligar', { id: cred.id, clientDataJSON: bufParaB64u(cred.response.clientDataJSON), attestationObject: bufParaB64u(cred.response.attestationObject) });
    }).then(function () { aviso('Pronto: este aparelho entra com a sua digital (ou o rosto).'); carregar(); })
      .catch(function (e) { aviso(e && e.name === 'NotAllowedError' ? 'Cancelado.' : (e.message || 'Não deu certo.'), true); bt.disabled = false; });
  }
  function entrarDigital(bt) {
    bt.disabled = true;
    post('chave/opcoes', { tipo: 'entrar' }).then(function (o) {
      var pk = o.publicKey;
      pk.challenge = b64uParaBuf(pk.challenge);
      pk.allowCredentials = (pk.allowCredentials || []).map(function (c) { return { type: c.type, id: b64uParaBuf(c.id) }; });
      return navigator.credentials.get({ publicKey: pk });
    }).then(function (cred) {
      if (!cred) throw new Error('O aparelho não respondeu.');
      return post('chave/entrar', { id: cred.id, clientDataJSON: bufParaB64u(cred.response.clientDataJSON), authenticatorData: bufParaB64u(cred.response.authenticatorData), signature: bufParaB64u(cred.response.signature) });
    }).then(function () { aviso('Entrou com a digital.'); carregar(); })
      .catch(function (e) { aviso(e && e.name === 'NotAllowedError' ? 'Cancelado.' : (e.message || 'Não deu certo.'), true); bt.disabled = false; });
  }

  function aviso(t, erro) {
    var el = document.querySelector('.ct-aviso');
    if (!el) { el = document.createElement('div'); el.className = 'ct-aviso dm2-aviso'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.innerHTML = '<span>' + esc(t) + '</span>'; el.classList.toggle('erro', !!erro); el.classList.add('on');
    clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('on'); }, 5200);
  }
  function post(rota, corpo) {
    return fetch('/api/conta/' + rota, { method: 'POST', headers: H, body: JSON.stringify(corpo || {}), credentials: 'same-origin' })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.erro || 'Não deu certo.'); return j; }); });
  }
  function carregar() {
    return fetch('/api/conta', { cache: 'no-store', credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) { E = j; desenhar(); })
      .catch(function () { raiz.innerHTML = '<div class="cx"><p class="rot">Servidor desligado</p><p>Abra o hoje.command (ou o hoje.bat).</p></div>'; });
  }

  /* a força da senha: comprimento e variedade, sem regra chata (uma frase longa é a melhor senha) */
  function forca(s) {
    var n = 0; if (s.length >= 10) n++; if (s.length >= 16) n++; if (s.length >= 24) n++;
    if (/[a-z]/.test(s) && /[A-Z]/.test(s)) n++; if (/\d/.test(s)) n++; if (/[^\w\s]/.test(s) || /\s/.test(s)) n++;
    return Math.min(4, Math.floor(n * 4 / 6));
  }
  var NOMES_FORCA = ['curta demais', 'fraca', 'boa', 'forte', 'ótima'];
  function campoSenha(nome, rotulo, auto) {
    return '<label class="ct-campo"><span>' + rotulo + '</span><span class="ct-senha"><input name="' + nome + '" type="password" autocomplete="' + auto + '" minlength="10" required>' +
      '<button type="button" class="ct-ver" data-ver aria-label="Mostrar a senha" title="Mostrar a senha">' + ic('olho') + '</button></span>' +
      (auto === 'new-password' ? '<span class="ct-forca" data-forca="0"><i></i><i></i><i></i><i></i><b>curta demais</b></span>' : '') + '</label>';
  }
  function botoesRedes(verbo) {
    var p = E.provedores;
    return '<div class="ct-redes"><a class="botao ct-rede' + (p.github ? '' : ' desligado') + '" href="' + (p.github ? '/auth/github' : '#redes') + '"' + (p.github ? '' : ' aria-disabled="true" title="Ainda não configurado: veja Redes sociais, abaixo"') + '>' + GH + verbo + ' com GitHub</a>' +
      '<a class="botao ct-rede' + (p.google ? '' : ' desligado') + '" href="' + (p.google ? '/auth/google' : '#redes') + '"' + (p.google ? '' : ' aria-disabled="true" title="Ainda não configurado: veja Redes sociais, abaixo"') + '>' + GG + verbo + ' com Google</a></div>' +
      (!p.github && !p.google ? '<p class="ct-nota">As redes sociais estão prontas e desligadas: ligue em <a href="#redes">Redes sociais</a>.</p>' : '');
  }

  function painelCriar() {
    if (!E.local) return '<div class="ct-cartao"><h2 class="ct-t">Esta casa ainda não tem conta</h2><p>A conta só nasce no computador onde o Portal Solar mora. Crie lá, e depois entre daqui.</p></div>';
    return '<form class="ct-cartao" id="ct-criar" autocomplete="on"><p class="rot">Primeira vez</p><h2 class="ct-t">Criar a sua conta</h2>' +
      '<p class="ct-lead">Uma conta só, a sua: a chave desta casa. Os seus dados continuam no caderno.</p>' +
      '<label class="ct-campo"><span>Seu nome</span><input name="nome" autocomplete="name" required maxlength="80" placeholder="Vitor de Mantova"></label>' +
      '<label class="ct-campo"><span>E-mail <small>(opcional: serve para entrar e para as redes)</small></span><input name="email" type="email" autocomplete="email" maxlength="120"></label>' +
      campoSenha('senha', 'Senha <small>(pelo menos 10 caracteres; uma frase é ótima)</small>', 'new-password') +
      campoSenha('senha2', 'A mesma senha de novo', 'new-password') +
      '<button class="botao pri ct-grande" type="submit">' + ic('conta') + 'Criar a conta</button>' +
      '<p class="ct-ou"><span>ou</span></p>' + botoesRedes('Criar') + '</form>';
  }
  function painelEntrar() {
    return '<form class="ct-cartao" id="ct-entrar" autocomplete="on"><p class="rot">' + (E.local ? 'Neste computador' : 'De outro aparelho') + '</p><h2 class="ct-t">Entrar</h2>' +
      (E.temChaves && noEnderecoDeFora() && temDigital() ? '<button type="button" class="botao pri ct-grande" data-digital-entrar>' + ic('conta') + 'Entrar com a digital</button><p class="ct-ou"><span>ou com a senha</span></p>' : '') +
      '<label class="ct-campo"><span>Nome ou e-mail</span><input name="quem" autocomplete="username webauthn" required></label>' +
      campoSenha('senha', 'Senha', 'current-password') +
      '<button class="botao pri ct-grande" type="submit">' + ic('conta') + 'Entrar</button>' +
      '<p class="ct-ou"><span>ou</span></p>' + botoesRedes('Entrar') +
      '<details class="ct-esqueci"><summary>Esqueci a senha</summary><p>No computador, apague o arquivo <code>dados/contas.json</code> da pasta do Portal Solar e crie a conta de novo. O caderno não muda nada: a conta é só a chave.</p></details></form>';
  }
  function painelConta() {
    var c = E.conta;
    var dt = function (t) { try { return new Date(t).toLocaleString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
    var redes = ['github', 'google'].map(function (p) {
      var lig = c.provedores.filter(function (x) { return x.provedor === p; })[0];
      var nome = p === 'github' ? 'GitHub' : 'Google';
      return '<li><span class="ct-rede-i">' + (p === 'github' ? GH : GG) + '</span><span><b>' + nome + '</b><small>' + (lig ? 'ligado: ' + esc(lig.quem) : E.provedores[p] ? 'pronto para ligar' : 'ainda não configurado') + '</small></span>' +
        (lig ? '<button type="button" class="botao leve" data-desligar="' + p + '">Desligar</button>' : E.provedores[p] ? '<a class="botao" href="/auth/' + p + '">Ligar</a>' : '<a class="botao leve" href="#redes">Como ligar</a>') + '</li>';
    }).join('');
    return '<div class="ct-cartao ct-dentro"><div class="ct-quem"><span class="ct-avatar" aria-hidden="true">' + esc(c.nome.split(/\s+/).slice(0, 2).map(function (x) { return x[0]; }).join('').toUpperCase()) + '</span>' +
        '<span><p class="rot">Você está na sua casa</p><h2 class="ct-t">' + esc(c.nome) + '</h2><small>' + esc(c.email || 'sem e-mail') + ' · conta criada em ' + esc(new Date(c.criada).toLocaleDateString('pt-BR')) + '</small></span></div>' +
        '<div class="ct-acoes"><a class="botao" href="eu.html">' + ic('eu') + 'A sua ficha</a><button type="button" class="botao leve" data-sair>' + ic('voltar') + 'Sair deste aparelho</button></div></div>' +
      '<section class="ct-cartao"><h3 class="ct-st">Onde a conta está aberta</h3><ul class="ct-sessoes">' + E.sessoes.map(function (s) {
        return '<li class="' + (s.esta ? 'esta' : '') + '"><b>' + esc(s.aparelho) + (s.esta ? ' · este aparelho' : '') + '</b><small>desde ' + esc(dt(s.desde)) + (s.ip ? ' · ' + esc(s.ip.replace(/^::ffff:/, '')) : '') + '</small></li>';
      }).join('') + '</ul><button type="button" class="botao leve" data-sair-todas>Sair de todos os aparelhos</button></section>' +
      painelDigital(c) +
      '<section class="ct-cartao"><h3 class="ct-st">Redes sociais</h3><ul class="ct-redes-l">' + redes + '</ul></section>' +
      '<form class="ct-cartao" id="ct-senha"><h3 class="ct-st">' + (c.temSenha ? 'Trocar a senha' : 'Criar uma senha') + '</h3>' +
        (c.temSenha && !E.local ? campoSenha('atual', 'Senha atual', 'current-password') : '') +
        campoSenha('nova', 'Senha nova', 'new-password') + '<button class="botao" type="submit">' + ic('check') + 'Gravar a senha</button></form>';
  }
  function painelDigital(c) {
    var dt = function (t) { try { return new Date(t).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } };
    var lista = (c.chaves || []).map(function (k) {
      return '<li><span class="ct-rede-i">' + ic('conta') + '</span><span><b>' + esc(k.aparelho || 'aparelho') + '</b><small>ligado em ' + esc(dt(k.criada)) + (k.usada ? ' · usado em ' + esc(dt(k.usada)) : '') + '</small></span><button type="button" class="botao leve" data-digital-apagar="' + esc(k.id) + '">Desligar</button></li>';
    }).join('');
    var acao = !E.endereco ? '<p class="ct-nota">A digital fica presa a um endereço https: primeiro configure <a href="#fora">o endereço de fora de casa</a>, no computador.</p>'
      : noEnderecoDeFora() && temDigital() ? '<button type="button" class="botao" data-digital-ligar>' + ic('conta') + 'Ligar a digital deste aparelho</button>'
      : '<p class="ct-nota">Para ligar, abra <a href="' + esc(E.endereco) + '/entrar.html">' + esc(E.endereco.replace(/^https?:\/\//, '')) + '</a> no aparelho que vai usar (o celular, por exemplo), entre com a senha e toque em "Ligar a digital".</p>';
    return '<section class="ct-cartao"><h3 class="ct-st">A digital dos aparelhos</h3>' +
      '<p class="ct-lead">Entrar com o dedo ou o rosto, sem senha: o aparelho guarda uma chave que nunca sai dele, e a casa guarda só a parte pública.</p>' +
      (lista ? '<ul class="ct-redes-l">' + lista + '</ul>' : '') + acao + '</section>';
  }
  function painelFora() {
    var ok = E.endereco;
    return '<section class="ct-cartao" id="fora"><p class="rot">De fora de casa</p><h3 class="ct-st">Abrir a sua casa de qualquer lugar</h3>' +
      '<p class="ct-lead">A casa continua neste computador. Um túnel privado dá a ela um endereço https que só os seus aparelhos alcançam: é ele que permite a digital e o Google, e tudo o que chega por ele pede para entrar.</p>' +
      (ok ? '<p class="ct-ok">' + ic('check') + '<span>Endereço de fora: <a href="' + esc(ok) + '/entrar.html">' + esc(ok.replace(/^https?:\/\//, '')) + '</a>' + (E.porTunel ? ' · você está entrando por ele agora' : '') + '</span></p>' : '') +
      (E.local ? '<ol class="ct-passos"><li>Instale o <a href="https://tailscale.com/download" target="_blank" rel="noopener">Tailscale</a> (gratuito) neste computador e no celular, com a mesma conta.</li>' +
        '<li>Neste computador, no Terminal: <code>tailscale serve --bg ' + esc(String(location.port || 4337)) + '</code><br><small>(no Mac com o aplicativo: <code>/Applications/Tailscale.app/Contents/MacOS/Tailscale serve --bg ' + esc(String(location.port || 4337)) + '</code>)</small></li>' +
        '<li>Ele mostra um endereço como <code>https://seu-mac.algo.ts.net</code>. Cole aqui:</li></ol>' +
        '<form class="ct-linha" id="ct-fora"><input name="endereco" type="url" inputmode="url" placeholder="https://seu-mac.algo.ts.net" value="' + esc(ok || '') + '" autocomplete="off" spellcheck="false"><button class="botao" type="submit">' + ic('check') + 'Gravar</button>' + (ok ? '<button class="botao leve" type="button" data-fora-limpar>Tirar</button>' : '') + '</form>' +
        '<p class="ct-nota">Fica em <code>dados/rede.json</code>, neste computador. Sem ele, a casa só abre aqui e na rede de casa (modo celular).</p>'
        : '<p class="ct-nota">O endereço de fora se configura no próprio computador, nesta mesma página.</p>') +
      '</section>';
  }
  function painelChavesRedes() {
    if (!E.local) return '';
    return '<form class="ct-cartao" id="ct-provedores"><p class="rot">GitHub e Google</p><h3 class="ct-st">As chaves das redes</h3>' +
      '<p class="ct-lead">Cole aqui o que o GitHub e o Google dão quando você cria o aplicativo (veja "Redes sociais: como ligar"). Campo vazio não muda nada.</p>' +
      ['github', 'google'].map(function (p) {
        var nome = p === 'github' ? 'GitHub' : 'Google';
        return '<fieldset class="ct-par"><legend>' + (p === 'github' ? GH : GG) + nome + (E.provedores[p] ? ' <small>· ligado</small>' : '') + '</legend>' +
          '<label class="ct-campo"><span>Client ID</span><input name="' + p + '-id" autocomplete="off" spellcheck="false" placeholder="' + (E.provedores[p] ? 'já gravado' : '') + '"></label>' +
          '<label class="ct-campo"><span>Client secret</span><input name="' + p + '-seg" type="password" autocomplete="off" spellcheck="false" placeholder="' + (E.provedores[p] ? 'já gravado' : '') + '"></label></fieldset>';
      }).join('') +
      '<button class="botao" type="submit">' + ic('check') + 'Gravar as chaves</button><p class="ct-nota">Ficam em <code>dados/provedores.json</code>, neste computador: nunca no caderno nem no site exportado.</p></form>';
  }
  function painelComo() {
    return '<aside class="ct-como"><div class="ct-cartao ct-escuro"><p class="rot">Como a conta funciona</p><h2 class="ct-t">A chave, não o cofre</h2><ul class="ct-lista">' +
      '<li><b>Os dados ficam no caderno.</b> A conta não leva nada para lugar nenhum: ela só abre esta casa de outro aparelho.</li>' +
      '<li><b>A senha nunca é guardada.</b> Fica só um resumo scrypt, que não se desfaz, em <code>dados/contas.json</code>, fora do caderno.</li>' +
      '<li><b>Uma casa, uma dona ou um dono.</b> A conta nasce no computador; cada amigo tem o próprio Portal e a própria ficha.</li>' +
      '<li><b>No celular</b>, com o modo celular ligado: entre com a senha, sem precisar do código do QR.</li>' +
      '<li><b>As redes sociais</b> só servem para entrar: o Portal Solar não lê nem publica nada nelas.</li></ul>' +
      '<p class="ct-nota"><a href="filosofia.html">A filosofia inteira →</a></p></div>' +
      '<details class="ct-cartao" id="redes"' + (location.hash === '#redes' ? ' open' : '') + '><summary class="ct-st">Redes sociais: como ligar</summary>' +
      '<ol class="ct-passos"><li>Crie um aplicativo OAuth: no GitHub em <i>Settings › Developer settings › OAuth Apps</i>; no Google em <i>Cloud Console › APIs e serviços › Credenciais</i>.</li>' +
      '<li>Como endereço de retorno, use exatamente:<br><code>' + esc(E.retorno.github) + '</code><br><code>' + esc(E.retorno.google) + '</code>' +
        (E.endereco ? '' : '<br><small>Sem o endereço de fora (o túnel https), estes retornos só funcionam neste computador, e o Google só aceita https: configure <a href="#fora">o endereço de fora</a> primeiro.</small>') + '</li>' +
      '<li>Cole o Client ID e o Client secret em "As chaves das redes", no computador. Pronto: sem reiniciar nada.</li></ol></details>' +
      '<div class="ct-cartao"><p class="rot">Convidar alguém</p><p>Cada pessoa tem o próprio Portal. Para convidar, mande o link do seu cartão: quem abre vê quem convidou, o que é o Portal Solar e como fazer a própria ficha.</p><a class="botao" href="eu.html#rede">' + ic('compartilhar') + 'O seu cartão</a></div></aside>';
  }

  function desenhar() {
    var q = new URLSearchParams(location.search);
    var principal = E.conta ? painelConta() : E.existe ? painelEntrar() : painelCriar();
    raiz.innerHTML = '<div class="ct-grade"><div class="ct-principal">' + principal + painelFora() + painelChavesRedes() + '</div>' + painelComo() + '</div>';
    if (q.get('erro')) aviso(q.get('erro'), true);
    if (q.get('ok')) aviso('Entrou com ' + (q.get('ok') === 'github' ? 'GitHub' : 'Google') + '.');
    if (q.get('erro') || q.get('ok')) try { history.replaceState(null, '', location.pathname); } catch (e) { /* ok */ }
  }

  raiz.addEventListener('click', function (ev) {
    var v = ev.target.closest('[data-ver]');
    if (v) { var inp = v.parentElement.querySelector('input'); var mostrar = inp.type === 'password'; inp.type = mostrar ? 'text' : 'password'; v.innerHTML = ic(mostrar ? 'olho-fechado' : 'olho'); v.setAttribute('aria-label', mostrar ? 'Esconder a senha' : 'Mostrar a senha'); return; }
    var d = ev.target.closest('[aria-disabled="true"]'); if (d) { ev.preventDefault(); var r = document.getElementById('redes'); if (r) { r.open = true; r.scrollIntoView({ behavior: 'smooth', block: 'start' }); } return; }
    if (ev.target.closest('[data-sair]')) { post('sair', {}).then(function () { aviso('Saiu deste aparelho.'); carregar(); }); return; }
    if (ev.target.closest('[data-sair-todas]')) { post('sair', { todas: true }).then(function () { aviso('Saiu de todos os aparelhos.'); carregar(); }); return; }
    var dg = ev.target.closest('[data-digital-ligar]'); if (dg) { ligarDigital(dg); return; }
    var de = ev.target.closest('[data-digital-entrar]'); if (de) { entrarDigital(de); return; }
    var da = ev.target.closest('[data-digital-apagar]'); if (da) { post('chave/apagar', { id: da.dataset.digitalApagar }).then(function () { aviso('Aparelho desligado.'); carregar(); }, function (e) { aviso(e.message, true); }); return; }
    if (ev.target.closest('[data-fora-limpar]')) { post('endereco', { endereco: '' }).then(function () { aviso('Endereço de fora tirado.'); carregar(); }, function (e) { aviso(e.message, true); }); return; }
    var dl = ev.target.closest('[data-desligar]'); if (dl) { post('desligar', { provedor: dl.dataset.desligar }).then(function () { aviso('Desligado.'); carregar(); }, function (e) { aviso(e.message, true); }); }
  });
  raiz.addEventListener('input', function (ev) {
    if (ev.target.type !== 'password' && !ev.target.closest('.ct-senha')) return;
    var lab = ev.target.closest('.ct-campo'), f = lab && lab.querySelector('.ct-forca'); if (!f) return;
    var n = ev.target.value.length < 10 ? 0 : Math.max(1, forca(ev.target.value));
    f.dataset.forca = n; f.querySelector('b').textContent = NOMES_FORCA[n];
  });
  raiz.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = ev.target, bt = f.querySelector('[type=submit]');
    var feito = function (msg) { aviso(msg); carregar(); };
    var falhou = function (e) { aviso(e.message, true); bt.disabled = false; };
    bt.disabled = true;
    if (f.id === 'ct-criar') {
      if (f.senha.value !== f.senha2.value) { falhou(new Error('As duas senhas não são iguais.')); return; }
      post('criar', { nome: f.nome.value, email: f.email.value, senha: f.senha.value }).then(function () { feito('Conta criada. Boas-vindas à sua casa.'); }, falhou);
    } else if (f.id === 'ct-entrar') {
      post('entrar', { quem: f.quem.value, senha: f.senha.value }).then(function () { feito('Entrou.'); }, falhou);
    } else if (f.id === 'ct-senha') {
      post('senha', { atual: f.atual ? f.atual.value : '', nova: f.nova.value }).then(function () { feito('Senha gravada.'); }, falhou);
    } else if (f.id === 'ct-fora') {
      post('endereco', { endereco: f.endereco.value }).then(function (j) { feito(j.endereco ? 'Endereço de fora gravado: ' + j.endereco : 'Endereço tirado.'); }, falhou);
    } else if (f.id === 'ct-provedores') {
      var v = function (n) { return (f[n] && f[n].value || '').trim(); };
      post('provedores', { github: { clientId: v('github-id'), clientSecret: v('github-seg') }, google: { clientId: v('google-id'), clientSecret: v('google-seg') } }).then(function () { feito('Chaves gravadas.'); }, falhou);
    }
  });

  if (raiz) carregar();
})();
