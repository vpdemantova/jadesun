/* ============================================================
   A NUVEM (25/out/2026, registro 119) — entrar com o Google e guardar o que é seu no seu Drive.
   "já planeje ou faça o login com google pra rede social oficial! e integre as funções do offline ao
   online pouco a pouco!"
   O plano inteiro, em cinco fases, está na ESTRUTURA.md (seção 2, "A conta do site e a rede"). Aqui
   moram as fases 2 e 3:
   · Entrar com o Google (Google Identity Services). O nome e o retrato ficam só neste aparelho: o
     Portal não tem servidor de contas e não guarda nada de ninguém.
   · Guardar no seu Drive, se a pessoa ligar: as notas, os lugares, as leituras e a ficha vão para a
     pasta escondida do Drive dela (appDataFolder, que só este site abre) e voltam em outro aparelho.
   Como as duas cópias se juntam sem perder nada: para cada chave fica o resumo da versão em que os dois
   lados concordaram da última vez. Mudou só de um lado, vale esse lado; mudou dos dois, junta (as notas
   por nome, os lugares por contexto, as leituras por texto e marca; o que foi apagado deixa a data em
   que saiu). O que chega do Drive só entra no começo da página seguinte, antes de qualquer parte do
   site ler o aparelho, para ninguém gravar por cima com uma memória velha.
   Carrega no <head> (o exportar.mjs põe), e só quando há o Client ID em publicar.json ("google").
   window.Nuvem = { abrir, rotulo, rotuloDrive, sincronizar }
   ============================================================ */
(function (raiz) {
  'use strict';

  /* ---------- as contas puras: sem tela e sem rede (testes/nuvem.test.mjs) ---------- */
  var CHAVES = ['portal-notas', 'portal-lugares', 'portal-leituras', 'portal-minha-ficha'];
  function resumo(v) {
    var t = v === undefined ? '' : JSON.stringify(v), a = 0x811c9dc5, b = 0x9747b28c;
    for (var i = 0; i < t.length; i++) { var c = t.charCodeAt(i); a = Math.imul(a ^ c, 16777619); b = Math.imul(b ^ c, 2246822507); }
    return (a >>> 0).toString(16) + '.' + (b >>> 0).toString(16);
  }
  function unicos(l) { return l.filter(function (x, i) { return l.indexOf(x) === i; }); }
  /* datas de saída dos dois lados: fica a mais nova de cada uma */
  function maximos(a, b) {
    var o = {};
    [a || {}, b || {}].forEach(function (f) { Object.keys(f).forEach(function (k) { if (!(k in o) || f[k] > o[k]) o[k] = f[k]; }); });
    return o;
  }
  var JUNTAR = {
    /* as notas, por nome. Mudou de um lado só (o outro ainda é a versão combinada), vale esse; mudou dos
       dois, a mais nova fica no nome e a outra ao lado, "(outra versão)": nada se perde */
    'portal-notas': function (L, R, base) {
      var ln = L.notas || {}, rn = R.notas || {}, o = { v: 1, notas: {}, pastas: [], fora: maximos(L.fora, R.fora) };
      unicos(Object.keys(ln).concat(Object.keys(rn))).forEach(function (r) {
        var a = ln[r], b = rn[r];
        if (!a || !b) { var so = a || b; if ((o.fora[r] || 0) < (so.m || 0)) o.notas[r] = so; return; }
        if (a.t === b.t) { o.notas[r] = (a.m || 0) >= (b.m || 0) ? a : b; return; }
        var h = base[r];
        if (h && resumo(a.t) === h) { o.notas[r] = b; return; }
        if (h && resumo(b.t) === h) { o.notas[r] = a; return; }
        var nova = (a.m || 0) >= (b.m || 0) ? a : b, outra = nova === a ? b : a;
        o.notas[r] = nova;
        var ext = (r.match(/\.(md|txt)$/i) || ['.md'])[0], semExt = r.slice(0, r.length - ext.length) + ' (outra versão)', nome = semExt + ext, n = 2;
        while (ln[nome] || rn[nome] || o.notas[nome]) nome = semExt + ' ' + (n++) + ext;
        o.notas[nome] = { t: outra.t, m: outra.m, c: outra.c || outra.m };
      });
      o.pastas = unicos((L.pastas || []).concat(R.pastas || [])).sort();
      var velho = Date.now() - 180 * 864e5;
      Object.keys(o.fora).forEach(function (k) { if (o.fora[k] < velho) delete o.fora[k]; });
      return o;
    },
    /* os lugares: as fixadas por contexto (uma soltura mais nova que a fixação tira a fixada), os caminhos por visita */
    'portal-lugares': function (L, R) {
      var soltas = maximos(L.soltas, R.soltas), fix = {}, ordem = [], cam = {};
      (L.fixadas || []).concat(R.fixadas || []).forEach(function (x) {
        if (!x || !x.ctx || (soltas[x.ctx] || 0) >= (x.fx || x.ts || 0)) return;
        if (!fix[x.ctx]) { fix[x.ctx] = x; ordem.push(x.ctx); } else if ((x.ts || 0) > (fix[x.ctx].ts || 0)) fix[x.ctx] = x;
      });
      (L.caminhos || []).concat(R.caminhos || []).forEach(function (c) { if (c && c.id && (!cam[c.id] || (c.ts || 0) > (cam[c.id].ts || 0))) cam[c.id] = c; });
      return { v: 1, fixadas: ordem.map(function (k) { return fix[k]; }).slice(0, 12),
        caminhos: Object.keys(cam).map(function (k) { return cam[k]; }).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); }).slice(0, 8), soltas: soltas };
    },
    /* as leituras, por texto: vale o lado visto por último, e as marcas se somam (menos as apagadas depois) */
    'portal-leituras': function (L, R) {
      var li = L.itens || {}, ri = R.itens || {}, o = { v: 1, itens: {}, links: [], grupos: [] }, urls = {};
      unicos(Object.keys(li).concat(Object.keys(ri))).forEach(function (id) {
        var a = li[id], b = ri[id];
        if (!a || !b) { o.itens[id] = a || b; return; }
        var novo = String(a.vistoEm || '') >= String(b.vistoEm || '') ? a : b, velho = novo === a ? b : a;
        var x = JSON.parse(JSON.stringify(novo)), fora = maximos(velho.fora, novo.fora), vistas = {};
        x.marcas = (novo.marcas || []).concat(velho.marcas || []).filter(function (m) {
          if (!m || !m.id || vistas[m.id]) return false;
          vistas[m.id] = 1;
          return !(fora[m.id] && fora[m.id] >= String(m.em || ''));
        });
        if (Object.keys(fora).length) x.fora = fora;
        o.itens[id] = x;
      });
      o.links = (L.links || []).concat(R.links || []).filter(function (l) { if (!l || !l.url || urls[l.url]) return false; urls[l.url] = 1; return true; }).slice(-300);
      o.grupos = unicos((L.grupos || []).concat(R.grupos || []));
      return o;
    },
  };
  /* uma chave: mudou só de um lado, vale esse lado; dos dois, JUNTAR (sem regra, vale este aparelho) */
  function combinar(k, L, R, B) {
    if (R === undefined || R === null) return { valor: L, mudou: false };
    if (L === undefined || L === null) return { valor: R, mudou: true };
    var hL = resumo(L), hR = resumo(R), hB = B && B.h;
    if (hL === hR || hR === hB) return { valor: L, mudou: false };
    if (hL === hB) return { valor: R, mudou: true };
    var v = JUNTAR[k] ? JUNTAR[k](L, R, (B && B.i) || {}) : L;
    return { valor: v, mudou: resumo(v) !== hL };
  }
  /* a versão combinada de uma chave; nas notas, também a de cada nota (para saber quem mudou) */
  function baseDe(k, v) {
    var b = { h: resumo(v) };
    if (k === 'portal-notas' && v && v.notas) { b.i = {}; Object.keys(v.notas).forEach(function (r) { b.i[r] = resumo(v.notas[r].t); }); }
    return b;
  }
  if (typeof module === 'object' && module.exports) { module.exports = { CHAVES: CHAVES, resumo: resumo, combinar: combinar, baseDe: baseDe, JUNTAR: JUNTAR }; return; }

  var CFG = raiz.JADESUN_ESTATICO || {}, CLIENTE = CFG.google || '';
  if (!CLIENTE || !raiz.localStorage) return;
  var ESTADO = 'portal-nuvem', CHEGOU = 'portal-nuvem-chegou', ACESSO = 'portal-nuvem-acesso', ANTES = 'portal-nuvem-antes';
  var ARQUIVO = 'portal-solar.json', ESCOPO = 'https://www.googleapis.com/auth/drive.appdata';
  var API = 'https://www.googleapis.com/drive/v3/files', SOBE = 'https://www.googleapis.com/upload/drive/v3/files';

  function ler(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function por(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function estado() { var s = ler(ESTADO) || {}; s.v = 1; s.base = s.base || {}; return s; }
  function gravarEstado(s) { por(ESTADO, s); }
  function local(k) { var b = localStorage.getItem(k); if (b == null) return undefined; try { return JSON.parse(b); } catch (e) { return undefined; } }

  /* ---------- 1. o que chegou do Drive (ou de um arquivo trazido) entra no começo da página ---------- */
  function aplicar() {
    var c = ler(CHEGOU);
    if (!c || !c.dados) return;
    var s = estado(), antes = {}, mudou = [];
    CHAVES.forEach(function (k) {
      if (!(k in c.dados)) return;
      var r = combinar(k, local(k), c.dados[k], c.importado ? null : s.base[k]);
      if (r.mudou) { antes[k] = localStorage.getItem(k); if (por(k, r.valor)) mudou.push(k); }
      if (!c.importado) s.base[k] = baseDe(k, c.dados[k]);
    });
    if (!c.importado) { s.visto = c.visto; if (c.arquivo) s.arquivo = c.arquivo; }
    if (mudou.length) por(ANTES, { em: Date.now(), dados: antes });
    gravarEstado(s);
    por(CHEGOU, null);
    /* quem guarda uma cópia na memória (as Leituras) lê de novo, como quando outra aba muda */
    mudou.forEach(function (k) { try { raiz.dispatchEvent(new StorageEvent('storage', { key: k })); } catch (e) { /* ok */ } });
  }
  /* numa página preparada de antemão, só quando ela vira a de verdade (a anterior já gravou tudo) */
  if (document.prerendering) document.addEventListener('prerenderingchange', aplicar, { once: true }); else aplicar();

  /* ---------- 2. a conta: o nome e o retrato, só neste aparelho ---------- */
  function conta() { return estado().conta || null; }
  function rotulo() { var c = conta(); return c ? (c.primeiro || String(c.nome || '').split(' ')[0] || 'Você') : 'Entrar'; }
  var gis = null;
  function carregarGIS() {
    if (raiz.google && raiz.google.accounts && raiz.google.accounts.id) return Promise.resolve(raiz.google);
    if (gis) return gis;
    gis = new Promise(function (ok, falha) {
      var s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = function () { if (raiz.google && raiz.google.accounts) ok(raiz.google); else { gis = null; falha(new Error('O Google não respondeu.')); } };
      s.onerror = function () { gis = null; falha(new Error('O Google não respondeu (sem internet?).')); };
      document.head.appendChild(s);
    });
    return gis;
  }
  function lerCredencial(jwt) {
    var p = String(jwt || '').split('.')[1] || '';
    p = p.replace(/-/g, '+').replace(/_/g, '/');
    while (p.length % 4) p += '=';
    var bin = atob(p), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  var iniciado = false;
  function iniciarEntrar(g) {
    if (iniciado) return;
    iniciado = true;
    g.accounts.id.initialize({ client_id: CLIENTE, callback: aoEntrar, auto_select: false, cancel_on_tap_outside: true, ux_mode: 'popup', context: 'signin', itp_support: true });
  }
  function aoEntrar(resp) {
    var d = null;
    try { d = lerCredencial(resp && resp.credential); } catch (e) { d = null; }
    if (!d || !d.sub || (d.aud && d.aud !== CLIENTE)) { aviso = 'Não deu para entrar.'; pintarTudo(); return; }
    var s = estado();
    /* outra pessoa neste aparelho: o Drive dela é outro, a ligação começa do zero */
    if (s.conta && s.conta.sub !== d.sub) { s = { v: 1, base: {} }; por(ACESSO, null); por(CHEGOU, null); }
    s.conta = { sub: d.sub, nome: d.name || d.email || 'Você', primeiro: d.given_name || '', email: d.email || '', foto: d.picture || '' };
    gravarEstado(s);
    aviso = '';
    pintarTudo();
  }
  function sair() {
    try { if (raiz.google && raiz.google.accounts && raiz.google.accounts.id) raiz.google.accounts.id.disableAutoSelect(); } catch (e) { /* ok */ }
    por(ACESSO, null); por(CHEGOU, null);
    gravarEstado({ v: 1, base: {} });
    aviso = 'Você saiu deste aparelho. O que está aqui continua aqui.';
    pintarTudo();
  }

  /* ---------- 3. o Drive: uma pasta escondida, só deste site ---------- */
  function acessoValido() { var a = ler(ACESSO); return a && a.a && a.ate > Date.now() ? a.a : null; }
  /* a janela do Google precisa nascer de um gesto (o botão): por isso o acesso só é pedido no botão */
  function pedirAcesso() {
    return carregarGIS().then(function (g) {
      return new Promise(function (ok, falha) {
        var c = conta();
        g.accounts.oauth2.initTokenClient({
          client_id: CLIENTE, scope: ESCOPO, hint: (c && c.email) || undefined,
          callback: function (r) {
            if (r && r.access_token && g.accounts.oauth2.hasGrantedAllScopes(r, ESCOPO)) {
              por(ACESSO, { a: r.access_token, ate: Date.now() + (Number(r.expires_in) || 3600) * 1000 - 60000 });
              ok(r.access_token);
            } else falha(new Error('O Drive não foi liberado.'));
          },
          error_callback: function (e) {
            falha(new Error(e && e.type === 'popup_closed' ? 'A janela do Google fechou antes do fim.' : e && e.type === 'popup_failed_to_open' ? 'O navegador não deixou abrir a janela do Google.' : 'O Google não respondeu.'));
          },
        }).requestAccessToken({ prompt: '' });
      });
    });
  }
  function drive(url, op) {
    var a = acessoValido();
    if (!a) return Promise.reject(Object.assign(new Error('Sem acesso ao Drive.'), { semAcesso: true }));
    op = op || {};
    op.headers = Object.assign({ Authorization: 'Bearer ' + a }, op.headers || {});
    return fetch(url, op).then(function (r) {
      if (r.status === 401) { por(ACESSO, null); throw Object.assign(new Error('Sem acesso ao Drive.'), { semAcesso: true }); }
      if (r.status === 403) throw new Error('O Drive recusou (a API do Drive está ligada no projeto do Google?).');
      if (!r.ok) throw new Error('O Drive respondeu ' + r.status + '.');
      return r.status === 204 ? null : r.json();
    });
  }
  function acharArquivo() {
    return drive(API + '?spaces=appDataFolder&pageSize=10&fields=' + encodeURIComponent('files(id,modifiedTime)') + '&q=' + encodeURIComponent("name = '" + ARQUIVO + "'"))
      .then(function (j) { return (j.files || []).sort(function (a, b) { return String(b.modifiedTime).localeCompare(String(a.modifiedTime)); })[0] || null; });
  }
  function pacote() {
    var d = {};
    CHAVES.forEach(function (k) { var v = local(k); if (v !== undefined) d[k] = v; });
    return { v: 1, app: 'Portal Solar', em: new Date().toISOString(), dados: d };
  }
  function subir(id, corpo) {
    var txt = JSON.stringify(corpo);
    if (id) return drive(SOBE + '/' + encodeURIComponent(id) + '?uploadType=media&fields=id,modifiedTime', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: txt });
    var b = 'portal-' + Math.random().toString(36).slice(2);
    return drive(SOBE + '?uploadType=multipart&fields=id,modifiedTime', {
      method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + b },
      body: '--' + b + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify({ name: ARQUIVO, parents: ['appDataFolder'], mimeType: 'application/json' }) +
        '\r\n--' + b + '\r\nContent-Type: application/json\r\n\r\n' + txt + '\r\n--' + b + '--',
    });
  }
  function localMudou() {
    var s = estado();
    return CHAVES.some(function (k) { var v = local(k); return v !== undefined && resumo(v) !== (s.base[k] && s.base[k].h); });
  }
  /* sincronizar: o Drive não mudou desde a última vez → sobe o que mudou aqui; mudou → desce e espera a
     próxima página para entrar (ver aplicar); nunca sobe por cima de uma versão que ainda não entrou */
  var correndo = null;
  function sincronizar() {
    if (correndo) return correndo;
    var s = estado();
    if (!s.conta || !s.drive) return Promise.resolve({ desligado: true });
    if (ler(CHEGOU)) return Promise.resolve({ chegou: true });
    ocupado = true; pintarTudo();
    correndo = acharArquivo().then(function (f) {
      if (f && f.modifiedTime !== s.visto) {
        return drive(API + '/' + encodeURIComponent(f.id) + '?alt=media').then(function (remoto) {
          por(CHEGOU, { visto: f.modifiedTime, arquivo: f.id, dados: (remoto && remoto.dados) || {} });
          return { chegou: true };
        });
      }
      if (f && !localMudou()) return { igual: true };
      var corpo = pacote();
      return subir(f && f.id, corpo).then(function (j) {
        var s2 = estado();
        s2.arquivo = j.id; s2.visto = j.modifiedTime;
        CHAVES.forEach(function (k) { s2.base[k] = baseDe(k, corpo.dados[k]); });
        gravarEstado(s2);
        return { subiu: true };
      });
    }).then(function (r) {
      var s2 = estado(); s2.ultima = Date.now(); s2.erro = ''; gravarEstado(s2);
      correndo = null; ocupado = false; pintarTudo();
      return r;
    }, function (e) {
      var s2 = estado(); s2.erro = e.semAcesso ? '' : e.message; gravarEstado(s2);
      correndo = null; ocupado = false; pintarTudo();
      throw e;
    });
    return correndo;
  }
  /* sozinho, só com um acesso ainda válido (a primeira janela do dia nasce de um gesto) */
  function automatico() {
    if (document.prerendering) return;
    var s = estado();
    if (!s.conta || !s.drive || !acessoValido() || correndo) return;
    if (s.ultima && Date.now() - s.ultima < 15000 && !localMudou()) return;
    sincronizar().catch(function () { /* o estado já mostra */ });
  }
  addEventListener('load', function () { setTimeout(automatico, 1500); });
  document.addEventListener('prerenderingchange', function () { setTimeout(automatico, 1500); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) automatico(); });
  var tMudou = 0;
  addEventListener('portal:mudou', function () { clearTimeout(tMudou); tMudou = setTimeout(automatico, 8000); });

  function apagarNoDrive() {
    return acharArquivo().then(function (f) { return f ? drive(API + '/' + encodeURIComponent(f.id), { method: 'DELETE' }) : null; }).then(function () {
      var a = acessoValido();
      try { if (a && raiz.google && raiz.google.accounts.oauth2) raiz.google.accounts.oauth2.revoke(a, function () {}); } catch (e) { /* ok */ }
      var s = estado(); s.drive = false; s.arquivo = null; s.visto = null; s.base = {}; s.ultima = 0; gravarEstado(s);
      por(ACESSO, null); por(CHEGOU, null);
    });
  }

  /* ---------- 4. levar e trazer num arquivo (com ou sem o Drive) ---------- */
  function baixar() {
    var url = URL.createObjectURL(new Blob([JSON.stringify(pacote(), null, 1)], { type: 'application/json' }));
    var a = document.createElement('a'); a.href = url; a.download = 'portal-solar-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
  function trazer(arquivo) {
    if (!arquivo) return;
    arquivo.text().then(function (t) {
      var j = JSON.parse(t);
      if (!j || !j.dados || typeof j.dados !== 'object') throw new Error('Este arquivo não é do Portal Solar.');
      por(CHEGOU, { importado: true, dados: j.dados });
      location.reload();
    }).catch(function (e) { aviso = e.message && e.message.indexOf('Portal') >= 0 ? e.message : 'Este arquivo não abriu.'; pintarTudo(); });
  }

  /* ---------- 5. a folha da conta ---------- */
  var folha = null, aviso = '', ocupado = false, confirmar = false;
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function quando(ms) {
    var d = new Date(ms), h = new Date(), hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return d.toDateString() === h.toDateString() ? 'às ' + hora : 'em ' + d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) + ', ' + hora;
  }
  function rotuloDrive() {
    var s = estado();
    if (!s.conta || !s.drive) return 'Guardar no seu Drive';
    return s.ultima ? 'No seu Drive, ' + quando(s.ultima) : 'No seu Drive';
  }
  function situacao(s) {
    if (!s.drive) return 'Desligado: tudo fica só neste aparelho.';
    if (ocupado) return 'Sincronizando…';
    if (ler(CHEGOU)) return 'Chegou do Drive: entra na próxima página.';
    if (!s.ultima) return 'Ligado, ainda sem a primeira cópia.';
    return localMudou() && !acessoValido() ? 'Há mudanças daqui fora do Drive (a última cópia foi ' + quando(s.ultima) + ').' : 'Guardado no Drive ' + quando(s.ultima) + '.';
  }
  function html() {
    var s = estado(), c = s.conta;
    var onde = '<dl class="nv-onde">' +
      '<div><dt>Neste aparelho</dt><dd>Tudo o que você faz aqui, sempre, com conta ou sem.</dd></div>' +
      '<div><dt>No seu Google Drive</dt><dd>Uma cópia das notas, dos lugares, das leituras e da ficha, numa pasta escondida que só o Portal Solar abre. Só com o Drive ligado.</dd></div>' +
      '<div><dt>No Portal Solar</dt><dd>Nada seu. Não existe servidor de contas: o nome e o retrato ficam só neste aparelho.</dd></div></dl>';
    var rede = '<section class="nv-rede" aria-labelledby="nv-rede-t"><h3 id="nv-rede-t">A rede</h3>' +
      '<p>O que vem depois: a sua ficha pública e os seus elos, cada um com o porquê. Sem curtidas, sem seguidores, sem anúncio.</p>' +
      '<a href="vitrine.html#vt-faca">A sua ficha</a></section>';
    var pe = '<p class="nv-pe"><button type="button" class="botao leve" data-nv="baixar">Baixar tudo (.json)</button>' +
      '<button type="button" class="botao leve" data-nv="trazer">Trazer de um arquivo</button>' +
      (c ? '<button type="button" class="botao leve" data-nv="sair">Sair</button>' : '') +
      '<input type="file" accept=".json,application/json" hidden data-nv-arquivo></p>';
    var av = '<p class="nv-aviso" role="status"' + (aviso || s.erro ? '' : ' hidden') + '>' + esc(aviso || s.erro || '') + '</p>';
    if (!c) {
      return '<p class="nv-lede">Com a sua conta do Google, o que é seu vai junto de um aparelho a outro: as notas, os lugares, as leituras e a sua ficha.</p>' +
        '<div class="nv-google" id="nv-google" aria-label="Entrar com o Google"></div>' + av + onde + rede + pe;
    }
    var retrato = c.foto ? '<img class="nv-foto" src="' + esc(c.foto) + '" alt="" referrerpolicy="no-referrer" width="48" height="48">'
      : '<span class="nv-foto nv-ini" aria-hidden="true">' + esc(String(c.nome || '?').trim().charAt(0).toUpperCase()) + '</span>';
    return '<div class="nv-quem">' + retrato + '<div><b>' + esc(c.nome) + '</b><small>' + esc(c.email) + '</small></div></div>' +
      '<div class="nv-drive"><button type="button" class="nv-chave" role="switch" aria-checked="' + !!s.drive + '" data-nv="drive"' + (ocupado ? ' disabled' : '') + '>' +
        '<span><b>Guardar no seu Drive</b><small>' + esc(situacao(s)) + '</small></span><i aria-hidden="true"></i></button>' +
        (s.drive ? '<p class="nv-acoes"><button type="button" class="botao" data-nv="agora"' + (ocupado ? ' disabled' : '') + '>Sincronizar agora</button>' +
          '<button type="button" class="nv-apagar" data-nv="apagar">' + (confirmar ? 'Apagar mesmo? A cópia some do Drive, em todos os aparelhos' : 'Apagar a cópia no Drive') + '</button></p>' : '') +
      '</div>' + av + onde + rede + pe;
  }
  function escuro() {
    var m = (getComputedStyle(document.body).backgroundColor.match(/\d+(\.\d+)?/g) || [255, 255, 255]).map(Number);
    return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2] < 128;
  }
  function pintar() {
    if (!folha) return;
    var corpo = folha.corpo.querySelector('.nv'), c = conta(), t = document.getElementById('folha-t');
    if (t) t.textContent = c ? c.nome : 'Entrar';
    corpo.innerHTML = html();
    var lugar = corpo.querySelector('#nv-google');
    if (lugar) carregarGIS().then(function (g) {
      iniciarEntrar(g);
      g.accounts.id.renderButton(lugar, { type: 'standard', theme: escuro() ? 'filled_black' : 'outline', size: 'large', shape: 'pill', text: 'signin_with', logo_alignment: 'left', locale: 'pt-BR', width: Math.min(320, lugar.clientWidth || 320) });
    }).catch(function (e) { aviso = e.message; var a = corpo.querySelector('.nv-aviso'); if (a) { a.textContent = aviso; a.hidden = false; } });
  }
  function pintarTudo() {
    document.querySelectorAll('[data-conta-rotulo]').forEach(function (b) { b.textContent = rotulo(); });
    pintar();
  }
  function depois(p) {
    return p.then(function (r) { if (r && r.chegou) { aviso = 'Trazendo o que está no seu Drive…'; pintar(); setTimeout(function () { location.reload(); }, 400); } })
      .catch(function (e) { aviso = e.message; ocupado = false; pintarTudo(); });
  }
  function aoClicar(ev) {
    var b = ev.target.closest('[data-nv]');
    if (!b) return;
    var o = b.getAttribute('data-nv');
    if (o !== 'apagar') confirmar = false;
    aviso = '';
    if (o === 'baixar') baixar();
    if (o === 'trazer') folha.corpo.querySelector('[data-nv-arquivo]').click();
    if (o === 'sair') sair();
    if (o === 'drive') {
      var s = estado();
      if (s.drive) { s.drive = false; gravarEstado(s); pintar(); return; }
      ocupado = true; pintar();
      depois((acessoValido() ? Promise.resolve() : pedirAcesso()).then(function () {
        var s2 = estado(); s2.drive = true; gravarEstado(s2); ocupado = false;
        return sincronizar();
      }));
    }
    if (o === 'agora') {
      ocupado = true; pintar();
      depois((acessoValido() ? Promise.resolve() : pedirAcesso()).then(function () { ocupado = false; return sincronizar(); }));
    }
    if (o === 'apagar') {
      if (!confirmar) { confirmar = true; pintar(); return; }
      confirmar = false; ocupado = true; pintar();
      (acessoValido() ? Promise.resolve() : pedirAcesso()).then(apagarNoDrive).then(function () {
        ocupado = false; aviso = 'A cópia no Drive foi apagada. Tudo continua neste aparelho.'; pintarTudo();
      }).catch(function (e) { ocupado = false; aviso = e.message; pintarTudo(); });
    }
  }
  function carregarCss() {
    if (document.querySelector('link[href="nuvem.css"]')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'nuvem.css'; document.head.appendChild(l);
  }
  function abrir() {
    var P = raiz.Perfil;
    if (!P || !P.folha) return;
    if (folha) { folha.fechar(); return; }
    carregarCss();
    carregarGIS().catch(function () { /* a folha mostra */ });
    aviso = ''; confirmar = false;
    folha = P.folha({ titulo: esc(conta() ? conta().nome : 'Entrar'), sub: 'A conta', html: '<div class="nv"></div>',
      aoFechar: function () { folha = null; },
      aoAbrir: function (corpo) {
        corpo.addEventListener('click', aoClicar);
        corpo.addEventListener('change', function (ev) { if (ev.target.matches('[data-nv-arquivo]')) trazer(ev.target.files && ev.target.files[0]); });
      } });
    pintar();
  }

  raiz.Nuvem = { abrir: abrir, rotulo: rotulo, rotuloDrive: rotuloDrive, sincronizar: sincronizar };
})(typeof window !== 'undefined' ? window : globalThis);
