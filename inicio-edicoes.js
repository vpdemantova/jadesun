/* ============================================================
   AS EDIÇÕES DO INÍCIO — a régua comum (01/nov/2026, PS-91, registro 133)
   Pedido dele: "coloque um histórico no final de cada parte da home, porque ela sempre muda, pra ficar
   salvo os artigos passados, já que vamos mudar e atualizar, com um histórico dos textos e do que já
   foi mais importante, pra gente ver o progresso, de forma criativa e bem implementada!"

   De onde veio: as mesmas fontes que o Início lê (inicio-dados.js, mapa-dados.js, aviso-dados.js com
   as fontes do guias-dados.js, planeta-dados.js, humanidade-dados.js e a frase da Revolução Ontológica,
   no caderno). Daqui sai o texto de cada parte em linhas ([nível, texto]), igual para o navegador e
   para o Node; e a comparação de duas edições, linha a linha e palavra por palavra (a maior subsequência
   comum, o mesmo princípio do diff de Hunt e McIlroy, 1976).
   Para onde vai: o historico.mjs guarda as edições em inicio-historico.js; o edicoes.js mostra.
   ============================================================ */
(function (raiz) {
  'use strict';

  /* as partes do Início, na ordem da página: [id (o data-secao), o nome] */
  var PARTES = [
    ['boas-vindas', 'Boas-vindas'], ['portas', 'As portas'], ['terra', 'A Terra agora'], ['mundo', 'Como está o mundo'],
    ['fazer', 'O que fazer'], ['seu-dia', 'O seu dia'], ['saber', 'O saber inteiro'], ['utopia', 'O que queremos'],
  ];

  function L(n, t) { return [n, String(t == null ? '' : t).replace(/\s+/g, ' ').trim()]; }
  function sem(lista) { return lista.filter(function (l) { return l && l[1]; }); }

  /* ---------- o texto de cada parte ---------- */
  function boas(I) {
    if (!I) return null;
    return sem([L(0, (I.ola ? I.ola + ' ' : '') + (I.nome || 'Portal Solar')), L(1, I.reside), L(1, I.lema)]);
  }
  /* as portas como o Início mostra: cada lado, cada porta com a pergunta e as páginas (ou as vistas) */
  function portas(M, publico) {
    if (!M || !M.PORTAS) return null;
    var P = M.PORTAS;
    var mundo = publico ? (M.PUB_MUNDO || M.MUNDO) : M.MUNDO, voce = publico ? (M.PUB_VOCE || M.VOCE) : M.VOCE;
    var lados = publico ? [['O porquê', mundo], ['O que existe', voce]] : [['O mundo', mundo], ['Você', voce]];
    var out = [];
    lados.forEach(function (lado) {
      var ids = (lado[1] || []).filter(function (id) { return P[id] && !(publico && P[id].publico === false); });
      if (!ids.length) return;
      out.push(L(0, lado[0]));
      ids.forEach(function (id) {
        var po = P[id];
        var pags = (po.paginas || []).filter(function (p) { return p && !(publico && p[5] === false); });
        out.push(L(1, po.nome + (po.pergunta ? ' — ' + po.pergunta : '')));
        if (pags.length > 1) out.push(L(2, pags.map(function (p) { return p[2]; }).join(' · ')));
        else if (pags[0] && (pags[0][4] || []).length) out.push(L(2, pags[0][4].map(function (x) { return x[1]; }).join(' · ')));
      });
    });
    return sem(out);
  }
  /* Como está o mundo: as colunas de "O que importa agora", com as três fontes que o Início mostra */
  function mundo(A, G) {
    if (!A || !A.colunas) return null;
    var fonte = function (f) {
      if (Array.isArray(f)) return f[0];
      var g = f && G && G.fontes && G.fontes.filter(function (x) { return x[0] === f.guias; })[0];
      return g ? g[2] : null;
    };
    var out = [];
    A.colunas.forEach(function (c) {
      out.push(L(1, c[1] + (c[2] ? ' — ' + c[2] : '')));
      var fs = (c[3] || []).map(fonte).filter(Boolean).slice(0, 3);
      if (fs.length) out.push(L(2, fs.join(' · ')));
      var dentro = (c[4] || []).map(function (l) { return l && l[2]; }).filter(Boolean);
      if (dentro.length) out.push(L(2, 'No Portal: ' + dentro.join(' · ')));
    });
    if (A.texto && A.texto.assinatura) out.push(L(2, A.texto.assinatura));
    return sem(out);
  }
  function fazer(PL) {
    if (!PL || !PL.cinco) return null;
    return sem([L(1, PL.abertura)].concat(PL.cinco.map(function (c, i) { return L(1, (i + 1) + '. ' + c[0] + (c[1] ? ' — ' + c[1] : '')); })));
  }
  function saber(H) {
    if (!H || !H.partes) return null;
    return sem(H.partes.map(function (p, i) { return L(1, (i + 1) + '. ' + p.nome + (p.frase ? ' — ' + p.frase : '')); }));
  }
  function utopia(frase) { return frase ? [L(1, String(frase).replace(/\*\*?([^*]+)\*\*?/g, '$1'))] : null; }
  /* O seu dia (só no computador): o próximo passo de cada pasta em foco, [[nome, próximo]] */
  function seuDia(passos) {
    if (!passos || !passos.length) return null;
    return sem(passos.map(function (p) { return L(1, p[0] + ' — ' + String(p[1]).replace(/`([^`]+)`/g, '$1')); }));
  }

  /* todas as partes de uma vez, a partir das fontes: { I, M, A, G, PL, H, frase } */
  function tirar(f) {
    f = f || {};
    var r = {};
    var b = boas(f.I); if (b) r['boas-vindas'] = { l: b };
    var pp = portas(f.M, true), pc = portas(f.M, false);
    if (pp) { r.portas = { l: pp }; if (pc && JSON.stringify(pc) !== JSON.stringify(pp)) r.portas.lc = pc; }
    var m = mundo(f.A, f.G); if (m) r.mundo = { l: m };
    var fz = fazer(f.PL); if (fz) r.fazer = { l: fz };
    var s = saber(f.H); if (s) r.saber = { l: s };
    var u = utopia(f.frase); if (u) r.utopia = { l: u };
    return r;
  }

  /* ---------- a comparação ---------- */
  /* a maior subsequência comum de duas listas, pela igualdade dada: os pares [i, j] que ficam */
  function lcs(a, b, igual) {
    var n = a.length, m = b.length, t = [], i, j;
    for (i = 0; i <= n; i++) { t.push(new Array(m + 1).fill(0)); }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) t[i][j] = igual(a[i], b[j]) ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
    var pares = []; i = 0; j = 0;
    while (i < n && j < m) {
      if (igual(a[i], b[j])) { pares.push([i, j]); i++; j++; }
      else if (t[i + 1][j] >= t[i][j + 1]) i++; else j++;
    }
    return pares;
  }
  /* as palavras de uma linha, com o espaço junto (para remontar a frase igualzinha) */
  function palavras(t) { return String(t).match(/\S+\s*/g) || []; }
  /* uma lista ("A Terra agora · O tempo · A vida"): cada item é um pedaço, com o separador junto,
     para o que entrou ser "A vida" e não "vida, A" */
  var SEP = ' · ';
  function itens(t) { var p = String(t).split(SEP); return p.map(function (x, i) { return i < p.length - 1 ? x + SEP : x; }); }
  function pedacos(antes, depois) { var lista = antes.indexOf(SEP) >= 0 && depois.indexOf(SEP) >= 0; return [lista ? itens(antes) : palavras(antes), lista ? itens(depois) : palavras(depois)]; }
  var chave = function (x) { return x.replace(/ · $/, '').trim(); };
  /* uma linha que mudou: os pedaços iguais, os que saíram e os que entraram, em ordem */
  function palavraAPalavra(antes, depois) {
    var ab = pedacos(antes, depois), a = ab[0], b = ab[1];
    var pares = lcs(a, b, function (x, y) { return chave(x) === chave(y); });
    var out = [], i = 0, j = 0;
    var por = function (tipo, txt) { if (!txt) return; var u = out[out.length - 1]; if (u && u[0] === tipo) u[1] += txt; else out.push([tipo, txt]); };
    pares.concat([[a.length, b.length]]).forEach(function (p) {
      por('saiu', a.slice(i, p[0]).join('')); por('entrou', b.slice(j, p[1]).join(''));
      if (p[0] < a.length) por('igual', b[p[1]]);
      i = p[0] + 1; j = p[1] + 1;
    });
    return out;
  }
  function parecida(x, y) {
    var ab = pedacos(x[1], y[1]), a = ab[0].map(chave), b = ab[1].map(chave);
    if (!a.length || !b.length) return false;
    var comum = lcs(a, b, function (p, q) { return p === q; }).length;
    return comum / Math.max(a.length, b.length) >= 0.34;
  }
  /* duas edições de uma parte (listas de linhas): cada linha com o que aconteceu com ela */
  function comparar(antes, depois) {
    antes = antes || []; depois = depois || [];
    var pares = lcs(antes, depois, function (x, y) { return x[0] === y[0] && x[1] === y[1]; });
    var out = [], i = 0, j = 0;
    pares.concat([[antes.length, depois.length]]).forEach(function (p) {
      var saem = antes.slice(i, p[0]), entram = depois.slice(j, p[1]);
      /* o que sai e entra no mesmo lugar, e se parece, é a mesma linha mudada */
      while (saem.length && entram.length && parecida(saem[0], entram[0])) {
        var x = saem.shift(), y = entram.shift();
        out.push({ tipo: 'mudou', n: y[0], t: y[1], antes: x[1], partes: palavraAPalavra(x[1], y[1]) });
      }
      saem.forEach(function (x) { out.push({ tipo: 'saiu', n: x[0], t: x[1] }); });
      entram.forEach(function (y) { out.push({ tipo: 'entrou', n: y[0], t: y[1] }); });
      if (p[0] < antes.length) out.push({ tipo: 'igual', n: depois[p[1]][0], t: depois[p[1]][1] });
      i = p[0] + 1; j = p[1] + 1;
    });
    return out;
  }
  /* o que mudou, em poucas palavras: os pedaços que entraram e os que saíram */
  function resumo(dif) {
    var entrou = [], saiu = [];
    var limpa = function (s) { return String(s).replace(/^[\s·—,.;:]+|[\s·—,.;:]+$/g, '').trim(); };
    (dif || []).forEach(function (d) {
      if (d.tipo === 'entrou') entrou.push(limpa(d.t));
      else if (d.tipo === 'saiu') saiu.push(limpa(d.t));
      else if (d.tipo === 'mudou') d.partes.forEach(function (p) { if (p[0] === 'entrou') entrou.push(limpa(p[1])); else if (p[0] === 'saiu') saiu.push(limpa(p[1])); });
    });
    /* um pedaço com várias páginas ("Os créditos · Doar") vira um item por página, sem repetir */
    var itens = function (xs) { var vistos = {}; return [].concat.apply([], xs.map(function (x) { return x.split(/\s+·\s+/); })).map(limpa).filter(function (x) { if (!x || vistos[x]) return false; vistos[x] = 1; return true; }); };
    return { entrou: itens(entrou), saiu: itens(saiu) };
  }

  var api = { PARTES: PARTES, tirar: tirar, boas: boas, portas: portas, mundo: mundo, fazer: fazer, saber: saber, utopia: utopia, seuDia: seuDia, comparar: comparar, resumo: resumo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.EdicoesInicio = api;
})(typeof window !== 'undefined' ? window : globalThis);
