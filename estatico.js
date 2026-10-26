(function () {
  'use strict';

  var cfg = window.JADESUN_ESTATICO;
  if (!cfg) return;

  var buscaCache = null;
  var codigosCache = null;
  var realFetch = window.fetch.bind(window);

  function resposta(obj, status) {
    return Promise.resolve(new Response(JSON.stringify(obj), { status: status || 200, headers: { 'Content-Type': 'application/json' } }));
  }

  function normalizar(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function json(caminho) {
    return realFetch(caminho).then(function (r) { if (!r.ok) throw new Error(caminho); return r.json(); });
  }

  function marcas() {
    try { return JSON.parse(localStorage.getItem('jadesun-marcas') || '{}') || {}; } catch (e) { return {}; }
  }

  /* as marcas de conceito feitas neste navegador, por cima das do arquivo exportado */
  function marcasConceitos() { try { return JSON.parse(localStorage.getItem('portal-dominio-marcas') || '{}') || {}; } catch (e) { return {}; } }
  function comConceitos(d) {
    var m = marcasConceitos(), saida = { existe: d.existe, arquivo: d.arquivo, marcas: JSON.parse(JSON.stringify(d.marcas || {})) };
    Object.keys(m).forEach(function (k) {
      var p = k.indexOf('|'), cod = k.slice(0, p), c = k.slice(p + 1);
      if (m[k]) (saida.marcas[cod] = saida.marcas[cod] || {})[c] = 'neste navegador';
      else if (saida.marcas[cod]) delete saida.marcas[cod][c];
    });
    return saida;
  }

  function comMarcas(estado) {
    var m = marcas();
    estado.checklist.forEach(function (s) {
      s.itens.forEach(function (i) {
        var k = s.nome + '|' + i.texto;
        if (Object.prototype.hasOwnProperty.call(m, k)) i.feito = !!m[k];
      });
      s.feitos = s.itens.filter(function (i) { return i.feito; }).length;
    });
    return estado;
  }

  function buscar(q) {
    var tokens = normalizar(q).split(' ').filter(function (t) { return t.length >= 2; });
    if (!tokens.length) return Promise.resolve([]);
    var pronto = buscaCache ? Promise.resolve(buscaCache) : json('api/busca.json').then(function (d) { buscaCache = d; return d; });
    return pronto.then(function (docs) {
      var achados = [];
      docs.forEach(function (d) {
        var texto = d[6];
        for (var i = 0; i < tokens.length; i++) if (texto.indexOf(tokens[i]) < 0) return;
        var titulo = normalizar(d[1]);
        var p = 0;
        tokens.forEach(function (t) {
          if (titulo.indexOf(t) >= 0) p += 50;
          if (titulo.indexOf(t) === 0) p += 20;
          var n = 0, pos = -1;
          while (n < 10 && (pos = texto.indexOf(t, pos + 1)) !== -1) n++;
          p += n;
        });
        achados.push({ p: p, d: d });
      });
      achados.sort(function (a, b) { return b.p - a.p; });
      return achados.slice(0, 40).map(function (x) {
        return { id: x.d[0], titulo: x.d[1], secao: x.d[2], acervo: x.d[3], tipo: '', capa: x.d[4], trecho: x.d[5] };
      });
    });
  }

  function ficha(id) {
    var direto = 'api/ficha/' + id + '.json';
    return realFetch(direto).then(function (r) {
      if (r.ok) return r;
      var pronto = codigosCache ? Promise.resolve(codigosCache) : json('api/codigos.json').then(function (d) { codigosCache = d; return d; });
      return pronto.then(function (mapa) {
        var alvo = mapa[normalizar(id)];
        return alvo ? realFetch('api/ficha/' + alvo + '.json') : new Response('{"erro":"Ficha não encontrada."}', { status: 404, headers: { 'Content-Type': 'application/json' } });
      });
    });
  }

  /* ---------- AS NOTAS NESTE APARELHO (25/out/2026, registro 119) ----------
     "integre as funções do offline ao online pouco a pouco": a Nota da casa (lib/notas.mjs) também no
     site, com as mesmas rotas, respondidas aqui mesmo. As notas moram neste navegador (portal-notas):
     { v, notas: { "Notas/2026-10-25 20h31.md": { t: texto, m: mudada, c: criada } }, pastas, fora }.
     "fora" guarda quando uma nota saiu de um nome (apagada ou movida), para o Drive (nuvem.js) saber o
     que apagar no outro aparelho. Nada vai para um servidor nosso. */
  var NOTAS = 'portal-notas', ENTRADA_NOTAS = 'Notas';
  function notasLer() {
    try {
      var o = JSON.parse(localStorage.getItem(NOTAS) || 'null');
      if (o && o.v === 1) { o.notas = o.notas || {}; o.pastas = o.pastas || []; o.fora = o.fora || {}; return o; }
    } catch (e) { /* ilegível: começa vazio */ }
    return { v: 1, notas: {}, pastas: [], fora: {} };
  }
  function notasGravar(o) {
    try { localStorage.setItem(NOTAS, JSON.stringify(o)); }
    catch (e) { var x = new Error('Não coube neste aparelho: baixe as notas (.zip) e apague as que não precisa mais.'); x.status = 507; throw x; }
    try { window.dispatchEvent(new CustomEvent('portal:mudou', { detail: NOTAS })); } catch (e) { /* ok */ }
  }
  function resumoNota(t) {
    var a = 0x811c9dc5, b = 0x9747b28c; t = String(t);
    for (var i = 0; i < t.length; i++) { var c = t.charCodeAt(i); a = Math.imul(a ^ c, 16777619); b = Math.imul(b ^ c, 2246822507); }
    return ('0000000' + (a >>> 0).toString(16)).slice(-8) + ('0000000' + (b >>> 0).toString(16)).slice(-8);
  }
  function carimbo(d) {
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + 'h' + p(d.getMinutes());
  }
  function nomeLimpo(t) { return String(t || '').replace(/^#+\s*/, '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/[. ]+$/, '').slice(0, 90); }
  function relLimpo(r) {
    r = String(r || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
    if (r.split('/').some(function (p) { return p === '..' || p === '.'; })) { var x = new Error('Caminho inválido.'); x.status = 400; throw x; }
    return r;
  }
  function livreEm(o, pasta, base, ext) {
    var pre = pasta ? pasta + '/' : '', nome = base + ext, n = 2;
    while (o.notas[pre + nome]) nome = base + ' ' + (n++) + ext;
    return pre + nome;
  }
  function pastasDe(o) {
    var s = {};
    var subir = function (r, comUltimo) { var ps = r.split('/'), acc = ''; if (!comUltimo) ps.pop(); ps.forEach(function (x) { if (!x) return; acc = acc ? acc + '/' + x : x; s[acc] = 1; }); };
    s[ENTRADA_NOTAS] = 1;
    o.pastas.forEach(function (p) { subir(p, true); });
    Object.keys(o.notas).forEach(function (r) { subir(r, false); });
    return Object.keys(s).sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
  }
  function semAcento(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function notasRota(rota, q, corpo) {
    try {
      var o = notasLer(), agora = Date.now();
      if (rota === 'arvore') return resposta({ entrada: ENTRADA_NOTAS, pastas: pastasDe(o), notas: Object.keys(o.notas).map(function (r) { return [r, o.notas[r].m, o.notas[r].t.length]; }) });
      if (rota === 'ler') {
        var rl = relLimpo(q.get('rel')), x = o.notas[rl];
        if (!x) return resposta({ erro: 'Esta nota não existe mais (foi movida ou apagada?).' }, 404);
        return resposta({ rel: rl, texto: x.t, hash: resumoNota(x.t), modificado: new Date(x.m).toISOString() });
      }
      if (rota === 'buscar') {
        var t = semAcento(q.get('q')).trim(), achados = [];
        if (t.length < 2) return resposta({ q: q.get('q'), achados: [] });
        Object.keys(o.notas).forEach(function (r) { if (semAcento(r).indexOf(t) >= 0) achados.push({ rel: r, modificado: o.notas[r].m, onde: 'nome' }); });
        Object.keys(o.notas).forEach(function (r) {
          if (achados.length >= 60 || achados.some(function (a) { return a.rel === r; })) return;
          var tx = o.notas[r].t, i = semAcento(tx).indexOf(t);
          if (i >= 0) achados.push({ rel: r, modificado: o.notas[r].m, onde: 'texto', trecho: tx.slice(Math.max(0, i - 60), i + 80).replace(/\s+/g, ' ') });
        });
        return resposta({ q: q.get('q'), achados: achados });
      }
      if (rota === 'gravar') {
        if (typeof corpo.texto !== 'string') return resposta({ erro: 'Texto inválido.' }, 400);
        if (corpo.texto.length > 2000000) return resposta({ erro: 'Nota grande demais.' }, 413);
        if (!corpo.rel) {
          var nova = livreEm(o, relLimpo(corpo.pasta || ENTRADA_NOTAS), carimbo(new Date(agora)), '.md');
          o.notas[nova] = { t: corpo.texto, m: agora, c: agora }; delete o.fora[nova];
          notasGravar(o);
          return resposta({ rel: nova, hash: resumoNota(corpo.texto), criada: true, modificado: new Date(agora).toISOString() });
        }
        var r = relLimpo(corpo.rel), atual = o.notas[r];
        if (!/\.(md|txt)$/i.test(r)) return resposta({ erro: 'Só notas de texto (.md ou .txt).' }, 400);
        if (atual) {
          if ((corpo.base || '') !== resumoNota(atual.t)) return resposta({ erro: 'Esta nota mudou em outro aparelho. Nada foi perdido: veja a outra versão antes de continuar.', atual: { rel: r, texto: atual.t, hash: resumoNota(atual.t) } }, 409);
          if (atual.t === corpo.texto) return resposta({ rel: r, hash: resumoNota(atual.t), igual: true });
          atual.t = corpo.texto; atual.m = agora;
        } else if (corpo.base) {
          return resposta({ erro: 'Esta nota não existe mais (foi movida ou apagada?). O texto continua aqui: use "Mover" para guardar em outro lugar.' }, 404);
        } else { o.notas[r] = { t: corpo.texto, m: agora, c: agora }; delete o.fora[r]; }
        notasGravar(o);
        return resposta({ rel: r, hash: resumoNota(corpo.texto), modificado: new Date(agora).toISOString() });
      }
      if (rota === 'mover') {
        var de = relLimpo(corpo.rel), nota = o.notas[de];
        if (!nota) return resposta({ erro: 'Esta nota não existe mais.' }, 404);
        var dir = corpo.pasta != null ? relLimpo(corpo.pasta) : de.split('/').slice(0, -1).join('/');
        var ext = (de.match(/\.(md|txt)$/i) || ['.md'])[0], velho = de.split('/').pop().slice(0, -ext.length);
        var base = nomeLimpo(corpo.nome != null ? corpo.nome : velho) || velho, alvo = (dir ? dir + '/' : '') + base + ext;
        if (alvo === de) return resposta({ rel: de });
        if (o.notas[alvo]) alvo = livreEm(o, dir, base, ext);
        o.notas[alvo] = nota; delete o.notas[de]; o.fora[de] = agora; delete o.fora[alvo];
        if (dir && o.pastas.indexOf(dir) < 0) o.pastas.push(dir);
        notasGravar(o);
        return resposta({ rel: alvo });
      }
      if (rota === 'pasta') {
        var pai = relLimpo(corpo.pai || ''), nm = nomeLimpo(corpo.nome);
        if (!nm) return resposta({ erro: 'Dê um nome.' }, 400);
        var pasta = (pai ? pai + '/' : '') + nm, notaProjeto = null;
        if (pastasDe(o).indexOf(pasta) >= 0) return resposta({ erro: 'Já existe uma pasta com esse nome aqui.' }, 409);
        o.pastas.push(pasta);
        if (corpo.projeto) {
          notaProjeto = pasta + '/' + nm + '.md';
          var hoje = new Date(agora).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
          o.notas[notaProjeto] = { t: '# ' + nm + '\n\nProjeto começado em ' + hoje + '.\n\n## Por quê\n\n\n## O que já existe\n\n\n## Os próximos passos\n\n- \n', m: agora, c: agora };
        }
        notasGravar(o);
        return resposta({ rel: pasta, nota: notaProjeto });
      }
      return resposta({ erro: 'Não existe neste site.' }, 404);
    } catch (e) { return resposta({ erro: e.message || 'Não deu certo.' }, e.status || 400); }
  }

  window.fetch = function (entrada, opcoes) {
    var url = typeof entrada === 'string' ? entrada : (entrada && entrada.url) || '';
    if (url.indexOf('/api/') !== 0) return realFetch(entrada, opcoes);
    var u = new URL(url, 'http://x');
    var q = u.searchParams;
    switch (u.pathname) {
      case '/api/biblioteca': return realFetch('api/biblioteca.json');
      case '/api/ficha': return ficha(q.get('id') || '');
      case '/api/buscar': return buscar(q.get('q') || '').then(function (l) { return resposta(l); });
      case '/api/lacunas': return realFetch('api/lacunas.json');
      case '/api/vitrine': return realFetch('api/vitrine.json'); /* só o público, gravado na exportação (item 72) */
      /* item 74: as manchetes e os posts como estavam no dia da exportação; a conta só existe no computador */
      case '/api/guias/agora': return realFetch('api/guias.json').catch(function () { return resposta({ em: 0, fontes: {} }); });
      /* registro 115: o agora de cada área vem da função /api/agora (no site da Vercel); sem ela, da cópia gravada na exportação */
      case '/api/agora': {
        var area = String(q.get('area') || '').replace(/[^a-z-]/g, '');
        return realFetch('/api/agora?area=' + area).then(function (r) { if (!r.ok) throw new Error('sem a função'); return r; })
          .catch(function () { return realFetch('api/agora-' + area + '.json'); });
      }
      case '/api/curadoria': return realFetch('api/curadoria.json').catch(function () { return resposta({ posts: [] }); });
      case '/api/manifesto': return realFetch('api/manifesto.json').then(function (r) { if (!r.ok) throw new Error('sem manifesto'); return r; }).catch(function () { return resposta({}, 404); });
      case '/api/conta': return resposta({ conta: null, existe: false, local: false, provedores: { github: false, google: false }, retorno: {}, sessoes: [] });
      case '/api/linha': return realFetch('api/linha.json');
      case '/api/imagem-ficha':
        return json('api/imagem-ficha.json').then(function (m) { var r = m[q.get('nome') || '']; return r ? resposta(r) : resposta({ erro: 'Imagem sem ficha.' }, 404); }).catch(function () { return resposta({ erro: 'Sem dados.' }, 404); });
      case '/api/estudos-dos-itens': return realFetch('api/estudos.json');
      case '/api/tabuas-e-obras': return realFetch('api/tabuas-e-obras.json');
      case '/api/areas': return realFetch(q.get('m') ? 'api/area/' + normalizar(q.get('m')).replace(/ /g, '-') + '.json' : q.get('mapa') ? 'api/areas-mapa.json' : 'api/areas-resumo.json');
      /* o Domínio dos conceitos (item 74): fora do computador, as marcas novas ficam neste navegador */
      case '/api/dominio':
        if (cfg.modo !== 'privado') return resposta({ existe: false, marcas: {} });
        return json('api/dominio.json').then(function (d) { return resposta(comConceitos(d)); }).catch(function () { return resposta(comConceitos({ existe: false, marcas: {} })); });
      case '/api/dominio/marcar': {
        if (cfg.modo !== 'privado') return resposta({ erro: 'Somente leitura.' }, 405);
        var pc = {};
        try { pc = JSON.parse((opcoes && opcoes.body) || '{}'); } catch (e) { /* vazio */ }
        var mc = marcasConceitos();
        (pc.conceitos || []).forEach(function (c) { mc[pc.codigo + '|' + c] = !!pc.feito; });
        try { localStorage.setItem('portal-dominio-marcas', JSON.stringify(mc)); } catch (e) { /* sem espaço */ }
        return json('api/dominio.json').catch(function () { return { existe: false, marcas: {} }; }).then(function (d) { return resposta(comConceitos(d)); });
      }
      case '/api/areas/pratica': return resposta({ erro: 'Somente leitura fora do computador: marque a prática no computador, o caderno é a fonte.' }, 405);
      case '/api/estado':
        if (cfg.modo !== 'privado') return resposta({ erro: 'Sem estado neste site.' }, 404);
        return json('api/estado.json').then(function (e) { return resposta(comMarcas(e)); });
      case '/api/marcar': {
        if (cfg.modo !== 'privado') return resposta({ erro: 'Somente leitura.' }, 405);
        var corpo = {};
        try { corpo = JSON.parse((opcoes && opcoes.body) || '{}'); } catch (e) { /* vazio */ }
        var m = marcas();
        m[corpo.secao + '|' + corpo.texto] = !!corpo.feito;
        try { localStorage.setItem('jadesun-marcas', JSON.stringify(m)); } catch (e) { /* sem espaço */ }
        return json('api/estado.json').then(function (e) { return resposta({ mudou: true, estado: comMarcas(e) }); });
      }
      case '/api/perfil':
        if (cfg.modo !== 'privado') return resposta({ erro: 'Sem perfil neste site.' }, 404);
        return realFetch('api/perfil.json');
      case '/api/perfil/salvar':
      case '/api/perfil/desfazer':
        return resposta({ erro: 'Somente leitura fora do computador. Edite no computador; o seu caderno é a fonte.' }, 405);
      /* registro 119: a Nota, com as notas neste aparelho */
      case '/api/notas/arvore': case '/api/notas/ler': case '/api/notas/buscar':
        return notasRota(u.pathname.slice(11), q, {});
      case '/api/notas/gravar': case '/api/notas/mover': case '/api/notas/pasta': {
        var cn = {};
        try { cn = JSON.parse((opcoes && opcoes.body) || '{}') || {}; } catch (e) { /* vazio */ }
        return notasRota(u.pathname.slice(11), q, cn);
      }
      default: return resposta({ erro: 'Não existe neste site.' }, 404);
    }
  };

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* sem offline */ });
    });
  }
})();
