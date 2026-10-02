(function () {
  'use strict';

  var P = window.Perfil;
  var E = window.Entradas;
  var MD = window.MD;
  var esc = P.esc;

  var GRUPOS = [
    { id: 'ler', nome: 'Ler', cor: 'his', subs: ['Livros', 'Textos e artigos', 'Manifestos e documentos', 'Poesia', 'Quadrinhos', 'Partituras'], dica: 'livros, textos, manifestos' },
    { id: 'assistir', nome: 'Assistir', cor: 'lin', subs: ['Filmes', 'Séries', 'Documentários', 'Animações', 'Vídeos e palestras', 'Teatro e dança'], dica: 'filmes, séries, documentários' },
    { id: 'ouvir', nome: 'Ouvir', cor: 'mat', subs: ['Álbuns', 'Músicas', 'Repertório', 'Podcasts', 'Concertos e óperas'], dica: 'álbuns, repertório, podcasts' },
    { id: 'ver', nome: 'Ver', cor: 'bio', subs: ['Pinturas', 'Desenho', 'Fotografia', 'Arquitetura', 'Escultura', 'Design', 'Inspiração'], dica: 'pintura, desenho, arquitetura' },
    { id: 'aprender', nome: 'Aprender', cor: 'geo', subs: ['Cursos', 'Línguas', 'Aulas e mestres', 'Ofícios', 'Ferramentas'], dica: 'cursos, línguas, ofícios' },
    { id: 'pessoas', nome: 'Pessoas', cor: 'soc', subs: ['Autores', 'Artistas', 'Pensadores', 'Mestres', 'Amigos'], dica: 'quem me inspira' },
    { id: 'lugares', nome: 'Lugares', cor: 'fil', subs: ['Cidades', 'Museus e bibliotecas', 'Natureza', 'Viagens'], dica: 'cidades, museus, natureza' },
    { id: 'fazer', nome: 'Fazer', cor: 'qui', subs: ['Projetos', 'Receitas', 'Jogos', 'Práticas'], dica: 'projetos, receitas, jogos' },
    { id: 'palavras', nome: 'Palavras', cor: 'fis', subs: ['Frases', 'Termos', 'Palavras de outras línguas'], dica: 'frases, termos, línguas' },
  ];
  var ARQS = ['col-ler', 'col-filmes', 'col-series', 'col-ouvir', 'col-ver', 'col-palavras', 'col-aprender', 'col-pessoas', 'col-lugares', 'col-fazer'];
  var PADRAO = { 'col-ler': 'ler', 'col-filmes': 'assistir', 'col-series': 'assistir', 'col-ouvir': 'ouvir', 'col-ver': 'ver', 'col-palavras': 'palavras', 'col-aprender': 'aprender', 'col-pessoas': 'pessoas', 'col-lugares': 'lugares', 'col-fazer': 'fazer' };
  var TITULOS = { 'col-ler': 'Livros, textos e manifestos', 'col-filmes': 'Filmes, documentários e vídeos', 'col-series': 'Séries', 'col-ouvir': 'Música e sons', 'col-ver': 'Artes visuais e inspiração', 'col-palavras': 'Palavras e frases', 'col-aprender': 'Aprender', 'col-pessoas': 'Pessoas', 'col-lugares': 'Lugares', 'col-fazer': 'Fazer' };
  var STATUS = [['quero', 'Quero'], ['agora', 'Agora'], ['feito', 'Já fiz']];
  var IDIOMAS = ['pt', 'en', 'es', 'fr', 'it', 'de', 'la', 'grc', 'ja', 'ru', 'zh', 'ar', 'he', 'sa'];
  var ALBUM = 'album-atlas-v1';
  var ALBUM_FEITO = 'album-atlas-v1-importado';
  var LOG_PADRAO = ['A Linha do Tempo Universal ganha um protótipo interativo, cruzando as 9 matérias.', 'Nasce a Seleção: 123 estudos escritos, 9 matérias, do zero à Comvest.'];
  var LIDOS_PRE = '---\nformato: wiki\nvisibilidade: privado\n---\n\n# Lidos no Atlas\n\n> Uma figurinha por estudo da Seleção que você leu de verdade. Ler não é dominar: o domínio se marca no Domino. Linha: `- CÓDIGO · data — nota`.';

  var ctx = null;
  var est = { g: '', sub: '', st: '', fav: false, q: '', form: null };
  var msg = '';
  var IND = null;
  var indPend = null;
  var LIVROS = null;
  var livrosPend = null;
  var lidos = null;
  var sujo = false;
  var timer = null;
  var alvoEl = null;

  function grupo(id) { for (var i = 0; i < GRUPOS.length; i++) if (GRUPOS[i].id === id) return GRUPOS[i]; return null; }
  function arquivoDe(g, sub) {
    if (g === 'assistir') return sub === 'Séries' ? 'col-series' : 'col-filmes';
    return 'col-' + g;
  }
  function hojeISO() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function semWiki(t) { return String(t || '').replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, '$1'); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function partir(cat, arq) {
    var s = String(cat || '').trim();
    var i = s.indexOf('/');
    var g = i > 0 ? s.slice(0, i).trim().toLowerCase() : s.toLowerCase();
    var sub = i > 0 ? s.slice(i + 1).trim() : '';
    if (!grupo(g)) { sub = s.toLowerCase() === 'geral' ? '' : s; g = PADRAO[arq]; }
    return { g: g, sub: sub };
  }

  function modelo(arq) {
    var f = ctx.arquivos()[arq];
    if (!f || !f.existe || !f.texto.trim()) {
      var m = E.ler('---\nformato: wiki\nvisibilidade: privado\n---\n\n# ' + TITULOS[arq] + '\n\n> Cada item começa com `## quando · título`. Edite aqui ou na página Eu do Jadesun: é o mesmo arquivo.');
      m.entradas = [];
      return m;
    }
    return E.ler(f.texto);
  }

  function todos() {
    var lista = [];
    ARQS.forEach(function (arq) {
      var f = ctx.arquivos()[arq];
      if (!f || !f.existe || !f.texto.trim()) return;
      E.ler(f.texto).entradas.forEach(function (e, i) {
        var c = partir(e.categoria, arq);
        var x = e.extra || {};
        lista.push({ arq: arq, i: i, titulo: e.titulo, quando: e.quando, g: c.g, sub: c.sub, por: x.por || '', status: x.status || '', fav: x.favorito === 'sim', nota: +x.nota || 0, idioma: x.idioma || '', vis: e.visibilidade || 'privado', corpo: e.corpo || '' });
      });
    });
    return lista;
  }

  /* ---------- lidos no Atlas ---------- */
  function lerLidos() {
    var f = ctx.arquivos().lidos;
    var o = {};
    var pre = [];
    var texto = f && f.existe ? f.texto : '';
    texto.split('\n').forEach(function (l) {
      var m = l.match(/^-\s+([A-Z]{3}-\d{2})\b(?:\s*·\s*(\d{4}-\d{2}-\d{2}))?(?:\s*—\s*(.*))?$/);
      if (m) o[m[1]] = { data: m[2] || '', nota: (m[3] || '').trim() }; else pre.push(l);
    });
    return { mapa: o, pre: pre.join('\n').replace(/\s+$/, '') || LIDOS_PRE };
  }

  function escreverLidos(pre, mapa) {
    var linhas = Object.keys(mapa).sort().map(function (c) { return '- ' + c + (mapa[c].data ? ' · ' + mapa[c].data : '') + (mapa[c].nota ? ' — ' + mapa[c].nota : ''); });
    return pre.replace(/\s+$/, '') + '\n\n' + linhas.join('\n') + '\n';
  }

  function carregarIndice() {
    if (IND) return Promise.resolve(IND);
    if (!indPend) indPend = fetch('/api/biblioteca').then(function (r) { return r.json(); }).then(function (j) { IND = j; return j; }).catch(function () { indPend = null; return null; });
    return indPend;
  }

  function carregarLivros() {
    if (LIVROS) return Promise.resolve(LIVROS);
    if (!livrosPend) livrosPend = fetch('/api/livros').then(function (r) { return r.json(); }).then(function (j) { LIVROS = (j && j.livros) || []; return LIVROS; }).catch(function () { livrosPend = null; return null; });
    return livrosPend;
  }

  function livrosPreviewHtml() {
    if (!LIVROS) return '<div id="col-livros-prev"><p class="rot suave">Carregando seus livros…</p></div>';
    if (!LIVROS.length) return '<div id="col-livros-prev"></div>';
    var mostrar = LIVROS.slice(0, 18);
    var resto = LIVROS.length - mostrar.length;
    return '<div id="col-livros-prev" class="col-livros-grade">' +
      mostrar.map(function (l) {
        return '<a class="col-livro-mini" href="casa.html?area=estante&livro=' + encodeURIComponent(l.titulo) + '" style="--cor:' + esc(l.cor) + '"><b>' + esc(l.titulo) + '</b><span>' + esc(l.autor || 'autor desconhecido') + '</span></a>';
      }).join('') +
      (resto > 0 ? '<a class="col-livro-mais" href="casa.html?area=estante">+' + resto + '<small>ver todos</small></a>' : '') +
      '</div>';
  }

  function estudosDoAtlas() {
    if (!IND) return [];
    var nomeSec = {};
    IND.acervos.forEach(function (a) { a.secoes.forEach(function (s) { nomeSec[s.id] = s.nome; }); });
    var grupos = {};
    var ordem = [];
    IND.itens.forEach(function (it) {
      if (it[0].indexOf('selecao/') !== 0) return;
      var ult = it[0].split('/').pop();
      var m = ult.match(/^([a-z]{3})-(\d{2})/);
      if (!m) return;
      var chave = it[2];
      if (!grupos[chave]) { grupos[chave] = { nome: nomeSec[chave] || chave, itens: [] }; ordem.push(chave); }
      grupos[chave].itens.push({ cod: (m[1] + '-' + m[2]).toUpperCase(), id: it[0], titulo: it[1] });
    });
    return ordem.map(function (k) { var g = grupos[k]; g.itens.sort(function (a, b) { return a.cod < b.cod ? -1 : 1; }); return g; });
  }

  function salvarLidosAgora() {
    if (!sujo) return Promise.resolve();
    var l = lerLidos();
    var texto = escreverLidos(l.pre, lidos);
    sujo = false;
    return ctx.salvar('lidos', texto).then(function () { msg = 'Figurinhas gravadas em <b>Lidos no Atlas.md</b>.'; pintarMsg(); }).catch(function (e) { sujo = true; msg = '<b>Não gravei as figurinhas.</b> ' + esc(e.message); pintarMsg(); });
  }

  function agendarLidos() {
    sujo = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(salvarLidosAgora, 1200);
  }

  /* ---------- HTML ---------- */
  function estrelas(n) { var s = ''; for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '☆'; return s; }

  function cartaoItem(x) {
    var g = grupo(x.g);
    var st = x.status ? '<button type="button" class="col-st ' + esc(x.status) + '" data-col="status" data-arq="' + x.arq + '" data-i="' + x.i + '" title="Mudar: quero, agora, já fiz">' + esc(STATUS.filter(function (s) { return s[0] === x.status; }).map(function (s) { return s[1]; })[0] || x.status) + '</button>' : '';
    return '<article class="col-item ' + (g ? g.cor : 'ing') + '">' +
      '<header><span class="rot">' + esc(g ? g.nome : x.g) + (x.sub ? ' · ' + esc(x.sub) : '') + '</span>' +
      '<button type="button" class="col-fav" data-col="fav" data-arq="' + x.arq + '" data-i="' + x.i + '" aria-pressed="' + x.fav + '" aria-label="Favorito" title="Favorito">' + P.icone('coracao') + '</button></header>' +
      '<h3 class="h3">' + esc(x.titulo) + '</h3>' +
      (x.por || x.idioma ? '<p class="col-por">' + (x.por ? 'por ' + esc(x.por) : '') + (x.por && x.idioma ? ' · ' : '') + (x.idioma ? '<span class="mono">' + esc(x.idioma) + '</span>' : '') + '</p>' : '') +
      '<p class="col-meta">' + st + (x.nota ? '<span class="col-n" title="Nota ' + x.nota + ' de 5">' + estrelas(x.nota) + '</span>' : '') + (x.quando ? '<span class="rot">' + esc(x.quando) + '</span>' : '') + (x.vis && x.vis !== 'privado' ? '<span class="rot">' + esc(x.vis) + '</span>' : '') + '</p>' +
      (x.corpo ? '<div class="md">' + MD.render(semWiki(x.corpo)) + '</div>' : '') +
      '<p class="acoes"><button type="button" class="opt" data-col="editar" data-arq="' + x.arq + '" data-i="' + x.i + '">Editar</button><button type="button" class="opt" data-col="excluir" data-arq="' + x.arq + '" data-i="' + x.i + '">Excluir</button></p></article>';
  }

  function filtrar(lista) {
    var q = norm(est.q);
    return lista.filter(function (x) {
      if (est.g && x.g !== est.g) return false;
      if (est.sub && x.sub !== est.sub) return false;
      if (est.st && x.status !== est.st) return false;
      if (est.fav && !x.fav) return false;
      if (q && norm(x.titulo + ' ' + x.por + ' ' + x.corpo + ' ' + x.sub).indexOf(q) < 0) return false;
      return true;
    }).sort(function (a, b) {
      var oa = { agora: 0, quero: 1, feito: 2 }[a.status]; var ob = { agora: 0, quero: 1, feito: 2 }[b.status];
      if ((oa == null ? 3 : oa) !== (ob == null ? 3 : ob)) return (oa == null ? 3 : oa) - (ob == null ? 3 : ob);
      return E.ano(b.quando).chave - E.ano(a.quando).chave;
    });
  }

  function listaHtml(todosItens) {
    var v = filtrar(todosItens);
    if (!todosItens.length) return '<div class="cx col-vazio"><p class="rot">Nada aqui ainda</p><p>Sua coleção começa com o primeiro item. Toque em <b>Adicionar</b> e escreva o que você mais quer lembrar: um livro, um filme, uma música, uma pessoa, um lugar. Os textos soltos que você já tinha nos arquivos continuam intactos (veja em Documentos).</p></div>';
    if (!v.length) return '<div class="cx col-vazio"><p class="rot">Nenhum resultado</p><p>Nenhum item combina com estes filtros. <button type="button" class="opt" data-col="limpar">Limpar filtros</button></p></div>';
    return '<div class="col-grade">' + v.map(cartaoItem).join('') + '</div>';
  }

  function formHtml(x) {
    var novo = !x;
    var g = novo ? (est.g || 'ler') : x.g;
    var it = novo ? { titulo: '', g: g, sub: est.g && est.sub ? est.sub : '', por: '', status: 'quero', fav: false, nota: 0, idioma: '', quando: hojeISO(), vis: 'privado', corpo: '' } : x;
    var G = grupo(it.g) || GRUPOS[0];
    return '<form class="cx form-e col-form" id="col-f"><p class="rot">' + (novo ? 'Novo item' : 'Editando') + '</p>' +
      '<div class="f-grade">' +
      '<label class="f-larga">Título<input type="text" name="titulo" value="' + esc(it.titulo) + '" required placeholder="O que é?"></label>' +
      '<label>Prateleira<select name="g">' + GRUPOS.map(function (y) { return '<option value="' + y.id + '"' + (y.id === it.g ? ' selected' : '') + '>' + y.nome + ' — ' + y.dica + '</option>'; }).join('') + '</select></label>' +
      '<label>Tipo<input type="text" name="sub" list="col-subs" value="' + esc(it.sub) + '" placeholder="Livros, Filmes, Repertório…"><datalist id="col-subs">' + G.subs.map(function (s) { return '<option value="' + esc(s) + '">'; }).join('') + '</datalist></label>' +
      '<label>Quem fez<input type="text" name="por" value="' + esc(it.por) + '" placeholder="autor, diretor, artista…"></label>' +
      '<label>Situação<select name="status">' + STATUS.map(function (s) { return '<option value="' + s[0] + '"' + (it.status === s[0] ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select></label>' +
      '<label>Nota<select name="nota"><option value="0">sem nota</option>' + [1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + '"' + (it.nota === n ? ' selected' : '') + '>' + estrelas(n) + '</option>'; }).join('') + '</select></label>' +
      '<label>Idioma original<input type="text" name="idioma" list="col-idiomas" value="' + esc(it.idioma) + '" placeholder="pt, en, it…"><datalist id="col-idiomas">' + IDIOMAS.map(function (i) { return '<option value="' + i + '">'; }).join('') + '</datalist></label>' +
      '<label>Quando<input type="text" name="quando" value="' + esc(it.quando) + '" placeholder="2026-09-21 ou 2020"></label>' +
      '<label>Quem vê<select name="vis">' + ['privado', 'rascunho', 'publico'].map(function (v) { return '<option' + (it.vis === v ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select></label>' +
      '<label class="f-check"><input type="checkbox" name="fav"' + (it.fav ? ' checked' : '') + '> Amo este item (favorito)</label></div>' +
      '<label>Por que importa <small>(markdown; uma frase basta)</small><textarea name="corpo" rows="4">' + esc(it.corpo) + '</textarea></label>' +
      '<div class="acoes"><button class="botao sinal" type="submit">Gravar no caderno</button><button class="botao" type="button" data-col="cancelar">Cancelar</button></div></form>';
  }

  function albumAntigo() {
    try {
      if (localStorage.getItem(ALBUM_FEITO)) return null;
      var s = JSON.parse(localStorage.getItem(ALBUM) || 'null');
      if (!s) return null;
      var col = Object.keys(s.collected || {}).filter(function (k) { return s.collected[k]; });
      var fav = (s.favorites || []).filter(function (f) { return f && f.text; });
      var log = (s.log || []).filter(function (l) { return l && l.text && LOG_PADRAO.indexOf(l.text) < 0; });
      var notas = Object.keys(s.notes || {}).filter(function (k) { return s.notes[k]; });
      if (!col.length && !fav.length && !log.length && !notas.length) return null;
      return { s: s, col: col, fav: fav, log: log, notas: notas };
    } catch (e) { return null; }
  }

  function importarHtml() {
    var a = albumAntigo();
    if (!a) return '';
    return '<div class="cx col-import"><p class="rot">Álbum antigo encontrado neste navegador</p><p>O álbum de figurinhas guardava tudo só aqui, fora do caderno. Posso trazer para os seus arquivos: <b>' + a.col.length + '</b> ' + (a.col.length === 1 ? 'figurinha' : 'figurinhas') + ', <b>' + a.fav.length + '</b> ' + (a.fav.length === 1 ? 'favorito' : 'favoritos') + ', <b>' + a.log.length + '</b> ' + (a.log.length === 1 ? 'conquista' : 'conquistas') + (a.notas.length ? ', <b>' + a.notas.length + '</b> ' + (a.notas.length === 1 ? 'nota' : 'notas') : '') + '. Nada é apagado: a cópia antiga continua no navegador.</p>' +
      '<div class="acoes"><button class="botao sinal" type="button" data-col="importar">Trazer para o caderno</button><button class="opt" type="button" data-col="dispensar">Dispensar</button></div></div>';
  }

  function figurinhasHtml() {
    if (!IND) return '<div id="col-fig"><p class="rot suave">Carregando os estudos da Seleção…</p></div>';
    var gs = estudosDoAtlas();
    if (!lidos || !sujo) lidos = lerLidos().mapa;
    var total = 0; var feitos = 0;
    var corpo = gs.map(function (g) {
      var n = g.itens.filter(function (i) { return lidos[i.cod]; }).length;
      total += g.itens.length; feitos += n;
      var cor = P.corDe(g.nome);
      return '<details class="fig-g ' + cor + '"><summary><i class="q"></i><b>' + esc(g.nome) + '</b><span class="rot">' + n + '/' + g.itens.length + '</span><span class="fig-b"><i style="width:' + Math.round(n / g.itens.length * 100) + '%"></i></span></summary>' +
        '<div class="fig-grade">' + g.itens.map(function (i) {
          var on = !!lidos[i.cod];
          return '<div class="fig' + (on ? ' on' : '') + '"><button type="button" class="fig-x" data-col="lido" data-cod="' + i.cod + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Desmarcar' : 'Marcar como lido') + ' ' + esc(i.cod) + '"></button>' +
            '<a href="biblioteca.html#f=' + encodeURI(i.id) + '"><b>' + esc(i.cod) + '</b><span>' + esc(i.titulo.replace(/^[A-Z]{3}-\d{2}\s*/, '')) + '</span></a></div>';
        }).join('') + '</div></details>';
    }).join('');
    return '<div id="col-fig"><p class="rot suave col-fig-n"><b>' + feitos + '</b> de ' + total + ' estudos lidos. Toque no círculo para marcar; toque no nome para abrir a ficha.</p>' + corpo + '</div>';
  }

  function chipsGrupos(lista) {
    var cont = {};
    lista.forEach(function (x) { cont[x.g] = (cont[x.g] || 0) + 1; });
    return '<div class="col-prat"><button type="button" class="chip' + (!est.g ? ' on' : '') + '" data-col="g" data-v="">Tudo <small>' + lista.length + '</small></button>' +
      GRUPOS.map(function (g) { return '<button type="button" class="chip ' + g.cor + (est.g === g.id ? ' on' : '') + '" data-col="g" data-v="' + g.id + '" title="' + esc(g.dica) + '"><i class="q"></i>' + g.nome + ' <small>' + (cont[g.id] || 0) + '</small></button>'; }).join('') + '</div>';
  }

  function chipsSubs(lista) {
    if (!est.g) return '';
    var G = grupo(est.g);
    var cont = {};
    lista.filter(function (x) { return x.g === est.g; }).forEach(function (x) { cont[x.sub] = (cont[x.sub] || 0) + 1; });
    var extras = Object.keys(cont).filter(function (s) { return s && G.subs.indexOf(s) < 0; });
    return '<div class="col-subs">' + G.subs.concat(extras).map(function (s) { return '<button type="button" class="chip pequeno' + (est.sub === s ? ' on' : '') + '" data-col="sub" data-v="' + esc(s) + '">' + esc(s) + (cont[s] ? ' <small>' + cont[s] + '</small>' : '') + '</button>'; }).join('') + '</div>';
  }

  function html() {
    var lista = todos();
    var favs = lista.filter(function (x) { return x.fav; }).length;
    return '<section class="eu-sec col" id="colecao"><header><h2 class="h2">Coleção</h2><span class="rot suave">' + lista.length + (lista.length === 1 ? ' item' : ' itens') + ' · ' + favs + (favs === 1 ? ' favorito' : ' favoritos') + '</span></header>' +
      '<p class="eu-sub">Tudo o que você lê, assiste, ouve, vê, aprende e ama, em prateleiras. Os favoritos são o registro do que mais queremos lembrar.</p>' +
      '<p class="cx"><a href="casa.html?area=estante">Abrir a Estante em 3D →</a> — seus livros catalogados, um por um, pra pegar e virar (dentro da Casa).</p>' +
      '<p class="cx"><a href="casa.html?area=guarda-roupa">Abrir o Guarda-roupa em 3D →</a> — portas, gavetas, cabides e um manequim que veste os seus looks (dentro da Casa).</p>' +
      '<p class="cx"><a href="casa.html">Abrir a Casa em 3D →</a> — você desenha a planta e ela levanta a casa; o seu quarto, móveis e cores, e casas dos sonhos (Bauhaus, Melnikov, Lina Bo Bardi, japonesa).</p>' +
      livrosPreviewHtml() +
      '<details class="col-como cx"><summary>Como isto funciona</summary><ol>' +
      '<li><b>Escolha uma prateleira</b> (Ler, Assistir, Ouvir, Ver, Aprender, Pessoas, Lugares, Fazer, Palavras) e, se quiser, um tipo dentro dela: livros, manifestos, séries, documentários, repertório…</li>' +
      '<li><b>Adicione</b> o que importa: título, quem fez, se você quer, está fazendo ou já fez, uma nota e uma frase sobre por que importa. O coração marca o que você ama.</li>' +
      '<li><b>Tudo é gravado nos seus arquivos</b>, na pasta <span class="mono">Logboard/# Profile/d Recommendations</span> (um arquivo por prateleira). Abra no Obsidian e é o mesmo texto. Antes de gravar, a versão anterior fica guardada.</li>' +
      '<li><b>“Quem vê”</b> decide o futuro de cada item: privado fica só com você; público poderá aparecer na sua página quando houver publicação e troca com outras pessoas.</li>' +
      '<li><b>Figurinhas do Atlas</b> (abaixo) marcam quais estudos da Seleção você leu de verdade. Ler não é dominar: o domínio continua no Domino.</li></ol></details>' +
      chipsGrupos(lista) + chipsSubs(lista) +
      '<div class="col-filtros"><div class="col-st-chips">' + STATUS.map(function (s) { return '<button type="button" class="chip pequeno' + (est.st === s[0] ? ' on' : '') + '" data-col="st" data-v="' + s[0] + '">' + s[1] + '</button>'; }).join('') +
      '<button type="button" class="chip pequeno' + (est.fav ? ' on' : '') + '" data-col="favfiltro">' + P.icone('coracao') + ' Favoritos</button></div>' +
      '<input type="search" class="col-busca" id="col-q" placeholder="Buscar na coleção" value="' + esc(est.q) + '" aria-label="Buscar na coleção"></div>' +
      '<div class="acoes eu-barra"><button type="button" class="botao sinal" data-col="novo">Adicionar</button></div>' +
      '<div id="col-form">' + (est.form ? formHtml(est.form.novo ? null : lista.filter(function (x) { return x.arq === est.form.arq && x.i === est.form.i; })[0]) : '') + '</div>' +
      '<p class="msg" id="col-msg"' + (msg ? '' : ' hidden') + '>' + msg + '</p>' +
      importarHtml() +
      '<div id="col-lista">' + listaHtml(lista) + '</div>' +
      '<header class="col-sub-h"><h3 class="h3">Figurinhas do Atlas</h3><span class="rot suave">o que você já leu na Seleção</span></header>' + figurinhasHtml() +
      '<p class="rot suave caminho-a">Arquivos: d Recommendations/ (Books, Films, Series, Music, Inspiraion, _Word, Aprender, Pessoas, Lugares, Fazer, Lidos no Atlas)</p></section>';
  }

  /* ---------- gravação ---------- */
  function pintarMsg() {
    var m = document.getElementById('col-msg');
    if (!m) return;
    m.hidden = !msg;
    m.className = /Não gravei|Não consegui/.test(msg) ? 'msg erro' : 'msg';
    m.innerHTML = msg;
  }

  function redesenhar() { if (ctx) ctx.redesenhar(); }

  function itemDoForm(f) {
    var v = f.elements;
    var g = v.g.value;
    var sub = v.sub.value.trim();
    var extra = {};
    if (v.por.value.trim()) extra.por = v.por.value.trim();
    if (v.status.value) extra.status = v.status.value;
    if (v.fav.checked) extra.favorito = 'sim';
    if (+v.nota.value) extra.nota = v.nota.value;
    if (v.idioma.value.trim()) extra.idioma = v.idioma.value.trim();
    return { g: g, sub: sub, entrada: { quando: v.quando.value.trim(), titulo: v.titulo.value.trim(), categoria: g + (sub ? '/' + sub : ''), visibilidade: v.vis.value, extra: extra, corpo: v.corpo.value.replace(/\r\n?/g, '\n') } };
  }

  function gravarForm(f) {
    var r = itemDoForm(f);
    if (!r.entrada.titulo) return;
    var arqNovo = arquivoDe(r.g, r.sub);
    var edit = est.form && !est.form.novo ? est.form : null;
    var pronto;
    if (edit && edit.arq === arqNovo) {
      var m = modelo(arqNovo);
      m.entradas[edit.i] = r.entrada;
      pronto = ctx.salvar(arqNovo, E.escrever(m));
    } else {
      var m2 = modelo(arqNovo);
      m2.entradas.push(r.entrada);
      pronto = ctx.salvar(arqNovo, E.escrever(m2)).then(function () {
        if (!edit) return;
        var m3 = modelo(edit.arq);
        m3.entradas.splice(edit.i, 1);
        return ctx.salvar(edit.arq, E.escrever(m3));
      });
    }
    return pronto.then(function () {
      msg = (edit ? 'Item atualizado.' : 'Item adicionado.') + ' Gravado em <b>' + esc(ctx.arquivos()[arqNovo].titulo) + '.md</b>.';
      est.form = null;
      redesenhar();
    }).catch(function (e) { msg = '<b>Não gravei.</b> ' + esc(e.message); pintarMsg(); });
  }

  function alterarItem(arq, i, mudar, ok) {
    var m = modelo(arq);
    var e = m.entradas[i];
    if (!e) return;
    e.extra = e.extra || {};
    mudar(e);
    return ctx.salvar(arq, E.escrever(m)).then(function () { if (ok) msg = ok; redesenhar(); }).catch(function (er) { msg = '<b>Não gravei.</b> ' + esc(er.message); pintarMsg(); });
  }

  function importar() {
    var a = albumAntigo();
    if (!a) return;
    var MAPA = { Filme: ['assistir', 'Filmes'], Livro: ['ler', 'Livros'], 'Música': ['ouvir', 'Músicas'], Obra: ['ver', 'Obras'], Outro: ['ver', 'Inspiração'] };
    var porArq = {};
    a.fav.forEach(function (f) {
      var alvo = MAPA[f.cat] || MAPA.Outro;
      var arq = arquivoDe(alvo[0], alvo[1]);
      (porArq[arq] = porArq[arq] || []).push({ quando: '', titulo: String(f.text).trim(), categoria: alvo[0] + '/' + alvo[1], visibilidade: 'privado', extra: { status: 'feito', favorito: 'sim' }, corpo: '' });
    });
    var passos = [];
    Object.keys(porArq).forEach(function (arq) {
      passos.push(function () { var m = modelo(arq); porArq[arq].forEach(function (e) { m.entradas.push(e); }); return ctx.salvar(arq, E.escrever(m)); });
    });
    if (a.col.length || a.notas.length) {
      passos.push(function () {
        var l = lerLidos();
        var mapa = l.mapa;
        a.col.forEach(function (c) { if (!mapa[c]) mapa[c] = { data: '', nota: '' }; });
        a.notas.forEach(function (c) { if (!mapa[c]) mapa[c] = { data: '', nota: '' }; mapa[c].nota = String(a.s.notes[c]).replace(/\s*\n+\s*/g, ' ').trim(); });
        return ctx.salvar('lidos', escreverLidos(l.pre, mapa));
      });
    }
    if (a.log.length) {
      passos.push(function () {
        var f = ctx.arquivos().feitos;
        var m = E.ler(f.existe ? f.texto : '---\nformato: wiki\nvisibilidade: privado\n---\n\n# Feitos — o que já fiz');
        a.log.forEach(function (l) { m.entradas.push({ quando: String(l.date || ''), titulo: String(l.text).trim(), categoria: 'estudo', visibilidade: 'privado', extra: {}, corpo: '' }); });
        return ctx.salvar('feitos', E.escrever(m));
      });
    }
    return passos.reduce(function (p, fn) { return p.then(fn); }, Promise.resolve()).then(function () {
      try { localStorage.setItem(ALBUM_FEITO, '1'); } catch (e) {}
      lidos = null; sujo = false;
      msg = 'Álbum antigo trazido para o caderno: ' + a.col.length + ' figurinhas, ' + a.fav.length + ' favoritos, ' + a.log.length + ' conquistas (em Feitos).';
      redesenhar();
    }).catch(function (e) { msg = '<b>Não consegui trazer tudo.</b> ' + esc(e.message) + ' O que já foi gravado continua gravado; recarregue e tente de novo.'; pintarMsg(); });
  }

  /* ---------- eventos ---------- */
  function ligar(raiz, c) {
    ctx = c;
    if (raiz.__colLigado) return;
    raiz.__colLigado = true;
    raiz.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-col]');
      if (!b || !b.closest('#colecao')) return;
      var a = b.getAttribute('data-col');
      var v = b.getAttribute('data-v');
      var arq = b.getAttribute('data-arq');
      var i = +b.getAttribute('data-i');
      if (a === 'g') { est.g = v; est.sub = ''; return redesenhar(); }
      if (a === 'sub') { est.sub = est.sub === v ? '' : v; return redesenhar(); }
      if (a === 'st') { est.st = est.st === v ? '' : v; return redesenhar(); }
      if (a === 'favfiltro') { est.fav = !est.fav; return redesenhar(); }
      if (a === 'limpar') { est = { g: '', sub: '', st: '', fav: false, q: '', form: est.form }; return redesenhar(); }
      if (a === 'novo') { est.form = { novo: true }; return redesenhar(); }
      if (a === 'editar') { est.form = { arq: arq, i: i }; return redesenhar(); }
      if (a === 'cancelar') { est.form = null; return redesenhar(); }
      if (a === 'excluir') {
        var m = modelo(arq);
        var alvo = m.entradas[i];
        if (!alvo || !window.confirm('Excluir “' + alvo.titulo + '”?\n\nA versão anterior do arquivo fica guardada em dados/perfil-backups.')) return;
        m.entradas.splice(i, 1);
        return ctx.salvar(arq, E.escrever(m)).then(function () { msg = 'Item excluído.'; redesenhar(); }).catch(function (e) { msg = '<b>Não gravei.</b> ' + esc(e.message); pintarMsg(); });
      }
      if (a === 'fav') return alterarItem(arq, i, function (e) { if (e.extra.favorito === 'sim') delete e.extra.favorito; else e.extra.favorito = 'sim'; });
      if (a === 'status') return alterarItem(arq, i, function (e) { var ordem = ['quero', 'agora', 'feito']; var k = ordem.indexOf(e.extra.status); e.extra.status = ordem[(k + 1) % 3]; if (e.extra.status === 'feito' && !e.quando) e.quando = hojeISO(); });
      if (a === 'importar') return importar();
      if (a === 'dispensar') { try { localStorage.setItem(ALBUM_FEITO, '1'); } catch (e) {} return redesenhar(); }
      if (a === 'lido') {
        var cod = b.getAttribute('data-cod');
        if (!lidos) lidos = lerLidos().mapa;
        if (lidos[cod]) delete lidos[cod]; else lidos[cod] = { data: hojeISO(), nota: '' };
        var on = !!lidos[cod];
        b.setAttribute('aria-pressed', on);
        b.parentElement.classList.toggle('on', on);
        var det = b.closest('details');
        var todosDaMateria = det.querySelectorAll('.fig');
        var n = det.querySelectorAll('.fig.on').length;
        det.querySelector('summary .rot').textContent = n + '/' + todosDaMateria.length;
        det.querySelector('.fig-b i').style.width = Math.round(n / todosDaMateria.length * 100) + '%';
        var geral = raiz.querySelectorAll('#col-fig .fig.on').length;
        var nn = raiz.querySelector('.col-fig-n b');
        if (nn) nn.textContent = geral;
        return agendarLidos();
      }
    });
    raiz.addEventListener('input', function (ev) {
      if (ev.target.id !== 'col-q') return;
      est.q = ev.target.value;
      var l = document.getElementById('col-lista');
      if (l) l.innerHTML = listaHtml(todos());
    });
    raiz.addEventListener('change', function (ev) {
      if (ev.target.name !== 'g' || !ev.target.form || ev.target.form.id !== 'col-f') return;
      var G = grupo(ev.target.value);
      var dl = document.getElementById('col-subs');
      if (G && dl) dl.innerHTML = G.subs.map(function (s) { return '<option value="' + esc(s) + '">'; }).join('');
    });
    raiz.addEventListener('submit', function (ev) {
      if (ev.target.id !== 'col-f') return;
      ev.preventDefault();
      gravarForm(ev.target);
    });
    window.addEventListener('beforeunload', function () { if (sujo) salvarLidosAgora(); });
  }

  function aposDesenho() {
    carregarIndice().then(function (j) {
      var caixa = document.getElementById('col-fig');
      if (!caixa) return;
      if (!j) { caixa.innerHTML = '<p class="rot suave">Não consegui carregar a Biblioteca agora. As figurinhas voltam quando o servidor responder.</p>'; return; }
      if (caixa.querySelector('details') === null) caixa.outerHTML = figurinhasHtml();
    });
    carregarLivros().then(function (j) {
      var caixa = document.getElementById('col-livros-prev');
      if (!caixa) return;
      if (!j) { caixa.innerHTML = '<p class="rot suave">Não consegui carregar os livros agora.</p>'; return; }
      caixa.outerHTML = livrosPreviewHtml();
    });
    var f = document.getElementById('col-f');
    if (f && est.form) { f.elements.titulo.focus(); f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }

  window.Colecao = { html: html, ligar: ligar, aposDesenho: aposDesenho, arquivosDoCadernoDeColecao: ARQS.concat(['lidos']) };
})();
