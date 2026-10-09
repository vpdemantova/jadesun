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
      default: return resposta({ erro: 'Não existe neste site.' }, 404);
    }
  };

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* sem offline */ });
    });
  }
})();
