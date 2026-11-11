/* ============================================================
   A MESA (02/nov/2026, registros 138 e 139)
   "faça um eisenhower da minha vida toda … tudo em um app só … que funcione!!!"
   "está muito feio … precisamos integrar tudo … um sistema perfeito e único" (a segunda versão)

   Uma página só para tudo o que é seu, na língua do Portal (sistema.css): o cabeçalho do Atlas,
   o explorador do Atlas (os botões em cima, o escolhido embaixo), a seção com rótulo e título, os
   painéis e o painel invertido (o "agora"). Dez vistas: Agora, Matriz, Dia, Semana, Mandala |
   Dinheiro, Roupas, Livros, Coleções | Guia.

   Das galerias de prompts, só a técnica: o foco em tela cheia com o fluido que respira (Flowstate,
   GetLayers), a estante sem fim com o livro puxado para fora e o título que sobe por máscara, sem
   esmaecer (Shelf Hero, MotionSites). Tudo só no gesto.

   Onde mora: no computador, "A Mesa.md" do caderno (lib/mesa.mjs); fora dele, este aparelho, com
   Levar e Trazer o mesmo arquivo. Os livros, no computador, são os do catálogo do caderno.
   ============================================================ */
(function () {
  'use strict';
  var F = window.MesaFormato;
  var G = window.MESA_TECNICAS || { FAMILIAS: [], lista: [] };
  var raiz = document.getElementById('mesa');
  if (!F || !raiz) return;

  var CHAVE = 'mesa.estado', CHAVE_TIMER = 'mesa.timer', CHAVE_CTX = 'mesa.ctx';
  var CENTRAIS = ['central', 'mapa', 'acervo'];
  var PREF = ler('mesa.visao.v1') || {};
  var VISTAS = [
    ['central', 'Agora', 'o próximo passo'], ['mapa', 'Mapa', 'o mapa das frentes'], ['acervo', 'Acervo', 'o inventário do acervo'],
    ['agora', 'Foco', 'o foco da Mesa'], ['matriz', 'Matriz', 'A matriz'], ['dia', 'Dia', 'O dia'], ['semana', 'Semana', 'A semana'], ['mandala', 'Mandala', 'A mandala'],
    ['dinheiro', 'Dinheiro', 'O dinheiro'], ['roupas', 'Roupas', 'As roupas'], ['livros', 'Livros', 'Os livros'], ['colecoes', 'Coleções', 'As coleções'], ['guia', 'Guia', 'O guia'],
  ];
  var QUAD = {
    1: ['Fazer', 'importante e urgente'],
    2: ['Marcar', 'importante, sem pressa'],
    3: ['Passar', 'urgente, não importante'],
    4: ['Soltar', 'nem um nem outro'],
  };
  var ENERGIA = { baixa: 1, media: 2, alta: 3 };
  var ENERGIA_NOME = { baixa: 'baixa', media: 'média', alta: 'alta' };
  var LUGARES = ['casa', 'computador', 'rua', 'telefone'];
  var SITUACAO = [['lendo', 'Lendo'], ['quero', 'Quero ler'], ['tenho', 'Tenho'], ['lido', 'Lido'], ['parei', 'Parei']];
  var GRUPOS = [['essencial', 'Essencial'], ['livre', 'Livre'], ['futuro', 'Futuro']];
  var URGENTE_DIAS = 3;
  var CALMO = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var E = F.vazio();
  var S = {
    modo: 'aparelho', hash: '', rel: '', guardadoEm: '', erro: '', pendente: false, gravando: false,
    vista: 'central', maisVistas: false, vistaAntes: '', sub: {}, pular: [], forcada: '', aberto: {}, quadMovel: 1,
    ctx: ler(CHAVE_CTX) || { min: 0, energia: '', onde: '' },
    timer: ler(CHAVE_TIMER),
    livrosCaderno: null, livrosCarregando: false,
    mes: F.hoje().slice(0, 7), revelar: null,
  };

  /* ---------- pequenos ---------- */
  function ler(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function gravarLocal(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem espaço ou bloqueado */ } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hoje() { return F.hoje(); }
  function dataDe(iso) { return new Date(iso + 'T12:00:00'); }
  function somarDias(iso, n) { var d = dataDe(iso); d.setDate(d.getDate() + n); return F.isoDeData(d); }
  function diasAte(iso) { return iso ? Math.round((dataDe(iso) - dataDe(hoje())) / 86400000) : null; }
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  function curta(iso) { if (!iso) return ''; var d = dataDe(iso); return d.getDate() + '/' + MESES[d.getMonth()].slice(0, 3); }
  function extenso(iso) { var d = dataDe(iso); return SEMANA[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()]; }
  function quando(iso) {
    var n = diasAte(iso);
    if (n == null) return '';
    if (n < -1) return 'venceu há ' + (-n) + ' dias';
    if (n === -1) return 'venceu ontem';
    if (n === 0) return 'hoje';
    if (n === 1) return 'amanhã';
    if (n < 7) return 'em ' + n + ' dias';
    return curta(iso);
  }
  function minutos(m) { if (!m) return ''; if (m < 60) return m + ' min'; var h = Math.floor(m / 60), r = m % 60; return h + ' h' + (r ? ' ' + r : ''); }
  function reais(n) { return (n < 0 ? '−' : '') + 'R$ ' + F.dinheiro(Math.abs(n || 0)); }
  function area(id) { return E.areas.filter(function (a) { return a.id === id; })[0] || null; }
  function nomeArea(id) { var a = area(id); return a ? a.nome : id; }
  function tarefa(id) { return E.tarefas.filter(function (t) { return t.id === id; })[0] || null; }
  function abertas() { return E.tarefas.filter(function (t) { return !t.feito; }); }
  function diaDe(iso) { return E.dias[iso] || (E.dias[iso] = { plano: [], sapo: '', bem: '', fez: '' }); }
  function semanaDe(k) { return E.semanas[k] || (E.semanas[k] = { resultados: [], revisada: '' }); }
  function filtrar(lista, q) {
    var t = F.semAcento(q || '');
    if (!t) return lista;
    return lista.filter(function (x) { return F.semAcento(JSON.stringify(x)).indexOf(t) >= 0; });
  }
  function botao(texto, acao, id, classe, v) {
    var c = classe === 'cheio' ? 'pri' : classe || '';
    return '<button type="button" class="botao' + (c ? ' ' + c : '') + '" data-acao="' + acao + '"' + (id ? ' data-id="' + esc(id) + '"' : '') + (v != null && v !== '' ? ' data-v="' + esc(v) + '"' : '') + '>' + texto + '</button>';
  }
  function chip(texto, acao, campo, v, on, extra) {
    return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-acao="' + acao + '"' + (campo ? ' data-campo="' + campo + '"' : '') + ' data-v="' + esc(v) + '" aria-pressed="' + !!on + '"' + (extra || '') + '>' + texto + '</button>';
  }
  function secao(rotulo, titulo, depois) {
    return '<header class="secao-cab ms-cab"><p class="rot">' + rotulo + '</p><div class="ms-cab-linha"><h2 class="h2" data-revela>' + titulo + '</h2>' + (depois || '') + '</div></header>';
  }
  function cruz(id, nome, aberto) {
    return '<button type="button" class="cruz-bt" data-acao="abrir" data-id="' + esc(id) + '" aria-expanded="' + !!aberto + '" aria-label="Abrir: ' + esc(nome) + '"><i class="cruz" aria-hidden="true"></i></button>';
  }

  /* ============================================================
     GUARDAR: o caderno no computador, o aparelho fora dele
     ============================================================ */
  var espera = null;
  function mudou(semPintar) {
    E._em = Date.now();
    gravarLocal(CHAVE, E);
    if (!semPintar) pintar();
    if (S.modo !== 'caderno') return;
    S.pendente = true;
    clearTimeout(espera);
    espera = setTimeout(gravarNoCaderno, 700);
    onde();
  }
  function gravarNoCaderno(forcar) {
    if (S.gravando) { espera = setTimeout(gravarNoCaderno, 400); return; }
    S.gravando = true;
    var texto = F.paraMarkdown(E);
    fetch('/api/mesa', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify({ texto: texto, base: forcar ? forcar : S.hash }) })
      .then(function (r) { return r.json().then(function (j) { return { r: r, j: j }; }); })
      .then(function (x) {
        S.gravando = false;
        if (x.r.status === 409 && x.j.atual) { conflito(x.j.atual); return; }
        if (!x.r.ok) throw new Error(x.j.erro || 'Não gravei.');
        S.hash = x.j.hash; S.rel = x.j.rel || S.rel; S.pendente = false; S.erro = '';
        S.guardadoEm = new Date().toTimeString().slice(0, 5).replace(':', 'h');
        onde();
      })
      .catch(function (e) { S.gravando = false; S.erro = e.message || 'Não gravei.'; onde(); });
  }
  function conflito(atual) {
    var f = folha('O arquivo mudou fora daqui', 'A Mesa',
      '<p class="ms-texto">"A Mesa.md" mudou no caderno (no Obsidian ou no outro computador) depois que esta tela o leu. Nada se perdeu: a cópia do dia está guardada.</p>' +
      '<div class="ms-botoes"><button type="button" class="botao pri" data-c="arquivo">Ficar com o do arquivo</button><button type="button" class="botao" data-c="tela">Ficar com o desta tela</button></div>');
    f.corpo.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-c]'); if (!b) return;
      if (b.getAttribute('data-c') === 'arquivo') { carregarTexto(atual.texto, atual.hash); S.pendente = false; f.fechar(); pintar(); }
      else { f.fechar(); gravarNoCaderno(atual.hash); }
    });
  }
  function carregarTexto(texto, hash) {
    E = F.deMarkdown(texto);
    S.hash = hash || '';
    gravarLocal(CHAVE, E);
  }
  function iniciar() {
    var local = ler(CHAVE);
    if (local && local.tarefas) E = Object.assign(F.vazio(), local);
    pintar();
    fetch('/api/mesa').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      if (typeof j.existe !== 'boolean') throw 0;
      S.modo = 'caderno';
      if (j.existe) { carregarTexto(j.texto, j.hash); S.rel = j.rel; S.guardadoEm = ''; }
      else if (local && (local.tarefas || []).length && CENTRAIS.indexOf(S.vista) < 0) mudou(true);   /* a primeira vez no computador: o que já estava neste aparelho vira o arquivo */
      carregarLivrosDoCaderno();
      pintar();
    }).catch(function () { S.modo = 'aparelho'; onde(); });
    /* voltou à aba: se o arquivo mudou fora (e nada está por gravar daqui), lê de novo */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden || S.modo !== 'caderno' || S.pendente || S.gravando) return;
      fetch('/api/mesa').then(function (r) { return r.json(); }).then(function (j) {
        if (j.existe && j.hash !== S.hash && !S.pendente) { carregarTexto(j.texto, j.hash); pintar(); aviso('Lido de novo do caderno.'); }
      }).catch(function () {});
    });
  }

  /* ---------- os livros do catálogo do caderno (no computador) ---------- */
  var DE_STATUS = { 'quero ler': 'quero', lendo: 'lendo', lido: 'lido', parei: 'parei', '': 'tenho' };
  var PARA_STATUS = { quero: 'quero ler', lendo: 'lendo', lido: 'lido', parei: 'parei', tenho: '' };
  function carregarLivrosDoCaderno() {
    S.livrosCarregando = true;
    fetch('/api/livros').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      S.livrosCarregando = false;
      if (!j || !Array.isArray(j.livros) || j.erro) return;
      S.livrosCaderno = j.livros;
      if (S.vista === 'livros') pintar();
    }).catch(function () { S.livrosCarregando = false; });
  }
  function livroDoCaderno(l) {
    return { id: l.id, titulo: l.titulo, autor: l.autor, situacao: DE_STATUS[String(l.status || '').toLowerCase().trim()] || 'tenho', pagina: l.paginaAtual || 0, paginas: l.paginasTotal || 0, tags: l.tags || [], _cat: l };
  }
  function livros() {
    if (S.modo !== 'caderno' || !S.livrosCaderno) return E.livros;
    var cat = S.livrosCaderno.map(livroDoCaderno), tem = {};
    cat.forEach(function (l) { tem[F.semAcento(l.titulo)] = 1; });
    return cat.concat(E.livros.filter(function (l) { return !tem[F.semAcento(l.titulo)]; }));
  }
  function gravarLivro(l, muda) {
    if (l._cat) {
      var c = l._cat;
      var corpo = { tituloAntigo: c.titulo, autorAntigo: c.autor, titulo: c.titulo, tituloOriginal: c.tituloOriginal, autor: c.autor, tags: c.tags,
        status: muda.situacao != null ? PARA_STATUS[muda.situacao] : c.status, destino: c.destino, prioridade: c.prioridade,
        paginaAtual: muda.pagina != null ? muda.pagina : c.paginaAtual, paginasTotal: muda.paginas != null ? muda.paginas : c.paginasTotal,
        secaoReal: c.secaoReal, listas: c.listas || [], formato: c.formato, tamanho: c.tamanho, material: c.material, medidas: c.medidas, suporte: c.suporte, tipoScan: c.tipoScan, comercial: c.comercial };
      if (muda.situacao != null) c.status = corpo.status;
      if (muda.pagina != null) c.paginaAtual = muda.pagina;
      if (muda.paginas != null) c.paginasTotal = muda.paginas;
      pintar();
      fetch('/api/livros/salvar', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify(corpo) })
        .then(function (r) { if (!r.ok) throw 0; aviso('Guardado no catálogo dos livros.'); })
        .catch(function () { aviso('Não guardei no catálogo. Tente de novo.'); carregarLivrosDoCaderno(); });
      return;
    }
    var m = E.livros.filter(function (x) { return x.id === l.id; })[0];
    if (!m) return;
    Object.assign(m, muda);
    if (muda.situacao === 'lendo' && !m.inicio) m.inicio = hoje();
    if (muda.situacao === 'lido' && !m.fim) m.fim = hoje();
    mudou();
  }

  /* ============================================================
     A LINHA DE CIMA: entende o que se escreve
     ============================================================ */
  var DIAS_SEMANA = { dom: 0, domingo: 0, seg: 1, segunda: 1, ter: 2, terca: 2, qua: 3, quarta: 3, qui: 4, quinta: 4, sex: 5, sexta: 5, sab: 6, sabado: 6 };
  function entender(texto, vista) {
    var t = String(texto || '').trim();
    if (!t) return null;
    var m;
    if ((m = /^livro:\s*(.+)$/i.exec(t)) || (vista === 'livros' && !/^(\+|-|tarefa:)/i.test(t) && (m = [t, t]))) {
      var p = m[1].split(/\s+[—–-]\s+/);
      return { tipo: 'livro', dados: { titulo: p[0].trim(), autor: (p[1] || '').trim() }, chips: ['Livro', p[1] ? p[1].trim() : 'sem autor'] };
    }
    if ((m = /^roupa:\s*(.+)$/i.exec(t)) || (vista === 'roupas' && !/^(\+|-|tarefa:)/i.test(t) && (m = [t, t]))) {
      var custo = null, nome = m[1].replace(/\s*R\$\s*([\d.,]+)\s*/i, function (_, v) { custo = F.numero(v); return ' '; }).trim();
      return { tipo: 'roupa', dados: { nome: nome, custo: custo }, chips: ['Roupa'].concat(custo != null ? [reais(custo)] : []) };
    }
    var col = /^(?:item|col)\s+([^:]+):\s*(.+)$/i.exec(t);
    if (col || (vista === 'colecoes' && S.sub.colecao && !/^(\+|-|tarefa:)/i.test(t))) {
      var nomeCol = col ? col[1].trim() : (E.colecoes.filter(function (c) { return c.id === S.sub.colecao; })[0] || {}).nome;
      var item = col ? col[2].trim() : t;
      return { tipo: 'item', dados: { colecao: nomeCol, nome: item }, chips: ['Coleção: ' + nomeCol] };
    }
    var din = /^([+-])\s*(?:R\$\s*)?([\d.,]+)\s*(.*)$/i.exec(t) || /^R\$\s*([\d.,]+)\s*(.*)$/i.exec(t);
    if (!din && vista === 'dinheiro') din = /^([\d.,]+)\s+(.*)$/.exec(t);
    if (din) {
      var sinal = din.length === 4 ? din[1] : '-', valor = F.numero(din.length === 4 ? din[2] : din[1]), resto = (din.length === 4 ? din[3] : din[2]) || '';
      if (valor != null) {
        var grupo = sinal === '+' ? 'renda' : 'essencial', cat = '';
        resto = resto.replace(/#([\p{L}\p{N}_-]+)/gu, function (_, g) {
          var s = F.semAcento(g);
          if (s === 'livre' || s === 'essencial' || s === 'futuro' || s === 'renda') grupo = s; else cat = g;
          return '';
        }).trim();
        return { tipo: 'dinheiro', dados: { valor: sinal === '+' ? valor : -valor, desc: resto, cat: cat || resto.split(/\s+/)[0] || '', grupo: grupo }, chips: [sinal === '+' ? 'Entrou' : 'Saiu', reais(valor), grupo === 'renda' ? 'renda' : grupo] };
      }
    }
    /* uma tarefa */
    var d = { titulo: '', q: 0, area: '', prazo: '', contexto: '', min: 0, para: '' }, chips = [];
    var imp = 0, resto2 = t.replace(/^tarefa:\s*/i, '');
    resto2 = resto2.replace(/(^|\s)(!!?)(?=\s|$)/g, function (_, a, b) { imp = Math.max(imp, b.length); return ' '; });
    resto2 = resto2.replace(/(^|\s)#([\p{L}\p{N}_-]+)/gu, function (_, a, g) {
      var s = F.semAcento(g), achou = E.areas.filter(function (x) { return x.id === s || F.semAcento(x.nome) === s; })[0];
      if (achou) { d.area = achou.id; return ' '; }
      return a + '#' + g;
    });
    resto2 = resto2.replace(/(^|\s)@([\p{L}]+)/gu, function (_, a, c) { d.contexto = F.semAcento(c); return ' '; });
    resto2 = resto2.replace(/(^|\s)(\d+)\s?(min|h)(\s?(\d+))?(?=\s|$)/gi, function (_, a, n, u, x, n2) { d.min = u.toLowerCase() === 'h' ? (+n) * 60 + (+(n2 || 0)) : +n; return ' '; });
    resto2 = resto2.replace(/(^|\s)para\s+([\p{Lu}][\p{L}]+)(?=\s|$)/u, function (_, a, n) { d.para = n; return ' '; });
    resto2 = resto2.replace(/(^|\s)(?:prazo\s+|até\s+|ate\s+)?(hoje|amanh[aã]|depois de amanh[aã]|(?:\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)|em (\d+) dias?|(?:na |no |nesta |neste |próxima |proxima )?(dom(?:ingo)?|seg(?:unda)?|ter(?:ça|ca)?|qua(?:rta)?|qui(?:nta)?|sex(?:ta)?|s[aá]b(?:ado)?)(?:-feira)?)(?=\s|$)/i, function (all, a, w, n) {
      var s = F.semAcento(w), iso = '';
      if (s === 'hoje') iso = hoje();
      else if (/^amanha$/.test(s)) iso = somarDias(hoje(), 1);
      else if (/^depois de amanha$/.test(s)) iso = somarDias(hoje(), 2);
      else if (n) iso = somarDias(hoje(), +n);
      else if (/\d/.test(s)) iso = F.iso(s);
      else {
        var nome = s.replace(/^(na|no|nesta|neste|proxima) /, '').replace(/-feira$/, '');
        var alvo = DIAS_SEMANA[nome.slice(0, 3)];
        if (alvo != null) { var h = dataDe(hoje()), dd = (alvo - h.getDay() + 7) % 7 || 7; iso = somarDias(hoje(), dd); }
      }
      if (!iso) return all;
      d.prazo = iso; return ' ';
    });
    d.titulo = resto2.replace(/\s+/g, ' ').trim();
    if (!d.titulo) return null;
    var urg = d.prazo && diasAte(d.prazo) <= URGENTE_DIAS;
    if (imp === 2 || (imp === 1 && urg)) d.q = 1;
    else if (imp === 1) d.q = 2;
    else if (d.para) d.q = 3;
    chips.push(d.q ? QUAD[d.q][0] : 'Entrada');
    if (d.area) chips.push(nomeArea(d.area));
    if (d.prazo) chips.push('prazo ' + quando(d.prazo));
    if (d.min) chips.push(minutos(d.min));
    if (d.contexto) chips.push('@' + d.contexto);
    if (d.para) chips.push('para ' + d.para);
    return { tipo: 'tarefa', dados: d, chips: chips };
  }
  function por(texto) {
    var x = entender(texto, S.vista);
    if (!x) return false;
    var d = x.dados;
    if (x.tipo === 'tarefa') {
      var t = F.novaTarefa(Object.assign({}, d, { id: F.novoId(E, 't'), criada: hoje() }));
      E.tarefas.push(t);
      aviso(t.q ? 'Na mesa, em ' + QUAD[t.q][0] + '.' : 'Na Entrada.');
    } else if (x.tipo === 'dinheiro') {
      E.dinheiro.lancamentos.push({ id: F.novoId(E, 'd'), data: hoje(), valor: d.valor, grupo: d.grupo, cat: d.cat, desc: d.desc });
      aviso((d.valor > 0 ? 'Entrou ' : 'Saiu ') + reais(Math.abs(d.valor)) + '.');
    } else if (x.tipo === 'livro') {
      if (S.modo === 'caderno' && S.livrosCaderno) {
        fetch('/api/livros/salvar', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify({ titulo: d.titulo, autor: d.autor, tags: [], status: 'quero ler' }) })
          .then(function (r) { if (!r.ok) throw 0; aviso('No catálogo dos livros.'); carregarLivrosDoCaderno(); })
          .catch(function () { aviso('Não guardei no catálogo.'); });
        return true;
      }
      E.livros.push({ id: F.novoId(E, 'l'), titulo: d.titulo, autor: d.autor, situacao: 'quero', pagina: 0, paginas: 0, inicio: '', fim: '', nota: 0, tags: [], notas: '' });
      aviso('Na estante, em Quero ler.');
    } else if (x.tipo === 'roupa') {
      E.roupas.push({ id: F.novoId(E, 'r'), nome: d.nome, tipo: '', cor: '', estacao: '', ocasiao: '', custo: d.custo, usos: 0, ultima: '', estado: 'ok', capsula: false, notas: '' });
      aviso('No guarda-roupa.');
    } else if (x.tipo === 'item') {
      var c = E.colecoes.filter(function (k) { return F.semAcento(k.nome) === F.semAcento(d.colecao); })[0];
      if (!c) { c = { id: F.novoId(E, 'c'), nome: d.colecao, itens: [] }; E.colecoes.push(c); }
      c.itens.push({ id: F.novoId(E, 'i'), nome: d.nome, detalhe: '', estado: 'tenho', notas: '' });
      S.sub.colecao = c.id;
      aviso('Em ' + c.nome + '.');
    }
    mudou();
    return true;
  }

  /* ============================================================
     O AGORA: uma tarefa só, escolhida
     ============================================================ */
  function nota(t) {
    var n = { 1: 1000, 2: 500, 3: 200, 4: -1000, 0: -1000 }[t.q || 0];
    var d = E.dias[hoje()];
    if (d) {
      if (d.sapo === t.id) n += 400;
      var i = (d.plano || []).indexOf(t.id);
      if (i >= 0) n += 250 - i * 15;
    }
    var p = diasAte(t.prazo);
    if (p != null) n += p < 0 ? 450 : Math.max(0, 160 - p * 12);
    if (t.dia === hoje()) n += 260;
    if (t.para && t.q === 3) n -= 150;
    if (t.focoMin) n += 20;
    return n;
  }
  function cabe(t, ctx) {
    if (ctx.min && t.min && t.min > ctx.min) return false;
    if (ctx.energia && t.energia && ENERGIA[t.energia] > ENERGIA[ctx.energia]) return false;
    if (ctx.onde && t.contexto && t.contexto !== ctx.onde && t.contexto !== 'qualquer') return false;
    return true;
  }
  function candidatas() {
    /* o que está marcado para um dia que ainda não chegou espera o dia (o "tickler" do GTD) */
    return abertas().filter(function (t) { return t.q >= 1 && t.q <= 3 && !(t.dia && t.dia > hoje()) && cabe(t, S.ctx); })
      .sort(function (a, b) { return nota(b) - nota(a); });
  }
  function porque(t) {
    var r = [QUAD[t.q] ? QUAD[t.q][0] : 'Entrada'];
    if (E.dias[hoje()] && E.dias[hoje()].sapo === t.id) r.push('o sapo de hoje');
    if (t.prazo) r.push('prazo ' + quando(t.prazo));
    if (t.dia === hoje()) r.push('marcada para hoje');
    if (t.area) r.push(nomeArea(t.area));
    if (t.min) r.push(minutos(t.min));
    return r.join(' · ');
  }
  function tarefaDoAgora() {
    var lista = candidatas();
    var fila = lista.filter(function (t) { return S.pular.indexOf(t.id) < 0; });
    if (!fila.length && lista.length) { S.pular = []; fila = lista; }
    var forc = S.forcada && tarefa(S.forcada) && !tarefa(S.forcada).feito ? tarefa(S.forcada) : null;
    var t = S.timer && tarefa(S.timer.id) && !tarefa(S.timer.id).feito ? tarefa(S.timer.id) : forc || fila[0];
    return { t: t, fila: fila };
  }
  function vistaAgora() {
    var x = tarefaDoAgora(), t = x.t;
    var entrada = abertas().filter(function (y) { return !y.q; }).length;
    var h = secao('O que importa agora, e só isso', 'Agora');
    h += '<div class="ms-agora">';
    if (!t) {
      h += '<article class="painel ms-foco ms-foco-vazio"><p class="ms-foco-titulo">' + (abertas().length ? 'Nada cabe neste tempo, nesta energia, neste lugar.' : 'A mesa está limpa.') + '</p>' +
        '<p class="ms-foco-prox">' + (abertas().length ? 'Mude o contexto ao lado, ou olhe a matriz.' : 'O que vier, vai para a linha de cima.') + '</p></article>';
    } else {
      var rodando = S.timer && S.timer.id === t.id;
      h += '<article class="painel-inverso ms-foco' + (rodando ? ' rodando' : '') + '" id="ms-foco" data-id="' + t.id + '">' +
        '<p class="rot">' + esc(porque(t)) + '</p>' +
        '<h3 class="ms-foco-titulo" data-revela-foco>' + esc(t.titulo) + '</h3>' +
        (t.proximo ? '<p class="ms-foco-prox">' + esc(t.proximo) + '</p>' : '') +
        '<div class="ms-foco-pe">' +
          '<button type="button" class="ms-relogio" data-acao="' + (rodando ? 'imersao' : 'focar') + '" data-id="' + t.id + '" data-v="25" aria-label="' + (rodando ? 'Abrir o foco' : 'Focar 25 minutos') + '">' +
            '<span class="ms-quadradinho" aria-hidden="true"><i id="ms-nivel"></i></span><span class="ms-relogio-t" id="ms-tempo">' + (rodando ? relogio() : '25:00') + '</span></button>' +
          '<div class="ms-botoes">' + (rodando
            ? botao('Feito', 'feito', t.id, 'cheio') + botao(S.timer.pausa ? 'Seguir' : 'Pausar', 'pausar', t.id) + botao('Tela cheia', 'imersao', t.id) + botao('Parar', 'parar', t.id)
            : botao('Feito', 'feito', t.id, 'cheio') + botao('Focar 25 min', 'focar', t.id, '', '25') + botao('5 min', 'focar', t.id, '', '5') + botao('Outra', 'pular', t.id)) +
          '</div></div>';
      if (t.passos && t.passos.length) {
        h += '<ol class="ms-passos">' + t.passos.map(function (p, i) {
          return '<li><button type="button" class="ms-caixa' + (p.f ? ' feita' : '') + '" data-acao="passo" data-id="' + t.id + '" data-i="' + i + '" aria-pressed="' + p.f + '" aria-label="' + esc(p.t) + '"></button><span' + (p.f ? ' class="riscado"' : '') + '>' + esc(p.t) + '</span></li>';
        }).join('') + '</ol>';
      }
      h += '</article>';
    }
    /* ao lado: o que vem depois, o contexto e os dois assistentes */
    h += '<aside class="ms-lado">';
    if (t) h += '<div class="ms-botoes ms-assistentes">' + botao('Destravar', 'destravar', t.id) + botao('Pedir à I.A.', 'ia', t.id) + '</div>';
    var depois = x.fila.filter(function (y) { return !t || y.id !== t.id; }).slice(0, 4);
    if (depois.length) h += '<section class="painel ms-depois"><p class="rot">Depois</p><ol class="lista-fio">' + depois.map(function (y) {
      return '<li><button type="button" class="ms-linha-t" data-acao="esta" data-id="' + y.id + '"><span class="ms-t-titulo">' + esc(y.titulo) + '</span><span class="ms-meta">' + esc(porque(y)) + '</span></button></li>';
    }).join('') + '</ol></section>';
    var abC = S.aberto._ctx;
    var resumo = [S.ctx.min ? 'tenho ' + minutos(S.ctx.min) : '', S.ctx.energia ? 'energia ' + ENERGIA_NOME[S.ctx.energia] : '', S.ctx.onde ? '@' + S.ctx.onde : ''].filter(Boolean).join(' · ') || 'qualquer tempo, energia e lugar';
    h += '<section class="painel ms-ctx"><div class="ms-ctx-cab"><div><p class="rot">O contexto</p><p class="ms-meta">' + esc(resumo) + '</p></div>' + cruz('_ctx', 'o contexto', abC) + '</div>' +
      (abC ? '<div class="ms-ctx-corpo">' +
        grupoChips('Tenho', 'min', [[5, '5 min'], [15, '15'], [30, '30'], [60, '1 h'], [0, 'mais']], S.ctx.min) +
        grupoChips('Energia', 'energia', [['baixa', 'baixa'], ['media', 'média'], ['alta', 'alta'], ['', 'tanto faz']], S.ctx.energia) +
        grupoChips('Onde', 'onde', LUGARES.map(function (l) { return [l, l]; }).concat([['', 'qualquer']]), S.ctx.onde) + '</div>' : '') + '</section>';
    if (entrada) h += '<p class="ms-nota-linha"><button type="button" class="ms-link" data-acao="triagem">' + entrada + (entrada === 1 ? ' coisa espera' : ' coisas esperam') + ' na Entrada</button></p>';
    h += '</aside></div>';
    return h;
  }
  function grupoChips(rotulo, campo, opcoes, atual) {
    return '<div class="ms-grupo" role="group" aria-label="' + rotulo + '"><span class="rot">' + rotulo + '</span><div class="ms-chips">' + opcoes.map(function (o) {
      return chip(o[1], 'ctx', campo, o[0], String(atual) === String(o[0]));
    }).join('') + '</div></div>';
  }

  /* ---------- o timer: o quadradinho esvazia; a tela cheia respira ---------- */
  var tique = null, somCtx = null;
  function restaMs() { return !S.timer ? 0 : Math.max(0, S.timer.pausa ? S.timer.resta : S.timer.fim - Date.now()); }
  function relogio() {
    var s = Math.round(restaMs() / 1000);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  function focar(id, min, tela) {
    try { somCtx = somCtx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { somCtx = null; }
    S.timer = { id: id, dur: min * 60000, fim: Date.now() + min * 60000, pausa: false, resta: 0 };
    gravarLocal(CHAVE_TIMER, S.timer);
    pintar();
    ligarTique();
    if (tela !== false) imersao();
  }
  function ligarTique() {
    clearInterval(tique);
    if (!S.timer) return;
    tique = setInterval(function () {
      if (!S.timer) { clearInterval(tique); return; }
      var r = restaMs(), fr = Math.max(0, r / S.timer.dur);
      ['ms-tempo', 'ms-im-tempo'].forEach(function (id) { var el = document.getElementById(id); if (el) el.textContent = relogio(); });
      var n = document.getElementById('ms-nivel'); if (n) n.style.transform = 'scaleY(' + fr.toFixed(4) + ')';
      var b = document.getElementById('ms-im-barra'); if (b) b.style.transform = 'scaleX(' + (1 - fr).toFixed(4) + ')';
      if (r <= 0 && !S.timer.pausa) acabou();
    }, 250);
  }
  function acabou() {
    var t = tarefa(S.timer.id), min = Math.round(S.timer.dur / 60000);
    clearInterval(tique);
    if (t) t.focoMin = (t.focoMin || 0) + min;
    S.timer = null; gravarLocal(CHAVE_TIMER, null);
    fecharImersao();
    tocar();
    try { if (navigator.vibrate) navigator.vibrate([120, 80, 120]); } catch (e) {}
    mudou();
    if (t) {
      var f = folha(min + ' minutos', 'O tempo acabou',
        '<p class="ms-texto">' + esc(t.titulo) + '</p><div class="ms-botoes">' + botao('Feito', 'feito', t.id, 'cheio') + botao('Mais 25', 'focar', t.id, '', '25') + botao('Uma pausa', 'pausa5', t.id) + '</div>');
      f.corpo.addEventListener('click', function (ev) {
        var b = ev.target.closest('[data-acao]'); if (!b) return;
        var a = b.getAttribute('data-acao');
        f.fechar();
        if (a === 'feito') feito(t); else if (a === 'focar') focar(t.id, 25); else aviso('Cinco minutos longe da tela.');
      });
    }
  }
  function tocar() {
    if (!somCtx) return;
    try {
      [0, 0.32].forEach(function (atraso, i) {
        var o = somCtx.createOscillator(), g = somCtx.createGain(), t0 = somCtx.currentTime + atraso;
        o.type = 'sine'; o.frequency.value = i ? 660 : 880;
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
        o.connect(g); g.connect(somCtx.destination); o.start(t0); o.stop(t0 + 0.65);
      });
    } catch (e) {}
  }

  /* a tela cheia do foco: a técnica do Flowstate (GetLayers): um fluido que respira atrás de uma linha só.
     Aqui em tinta e papel, um shader de ruído deformado (fbm) que anda devagar; só enquanto o foco está aberto. */
  var imEl = null, imGL = null, imRaf = 0;
  function imersao() {
    if (!S.timer) return;
    var t = tarefa(S.timer.id); if (!t) return;
    fecharImersao(true);
    imEl = document.createElement('div');
    imEl.className = 'ms-imersao';
    imEl.setAttribute('role', 'dialog'); imEl.setAttribute('aria-modal', 'true'); imEl.setAttribute('aria-label', 'Foco: ' + t.titulo);
    imEl.innerHTML = '<canvas class="ms-fluido" aria-hidden="true"></canvas><div class="ms-im-centro">' +
      '<p class="rot">Foco · ' + Math.round(S.timer.dur / 60000) + ' min</p><h2 class="ms-im-titulo">' + esc(t.titulo) + '</h2>' +
      (t.proximo ? '<p class="ms-im-prox">' + esc(t.proximo) + '</p>' : '') +
      '<p class="ms-im-tempo" id="ms-im-tempo">' + relogio() + '</p><div class="ms-im-trilho"><i id="ms-im-barra"></i></div>' +
      '<div class="ms-botoes"><button type="button" class="botao pri" data-im="feito">Feito</button><button type="button" class="botao" data-im="pausar">' + (S.timer.pausa ? 'Seguir' : 'Pausar') + '</button><button type="button" class="botao" data-im="sair">Sair da tela cheia</button></div></div>';
    document.body.appendChild(imEl);
    document.documentElement.classList.add('ms-em-foco');
    requestAnimationFrame(function () { if (imEl) imEl.classList.add('aberta'); });
    imEl.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-im]'); if (!b) return;
      var a = b.getAttribute('data-im');
      if (a === 'sair') fecharImersao();
      else if (a === 'pausar') { pausar(); b.textContent = S.timer && S.timer.pausa ? 'Seguir' : 'Pausar'; }
      else if (a === 'feito') { var tt = tarefa(S.timer && S.timer.id); fecharImersao(); if (tt) feito(tt); }
    });
    var foco = imEl.querySelector('[data-im="feito"]'); if (foco) foco.focus({ preventScroll: true });
    fluido(imEl.querySelector('canvas'));
  }
  function fecharImersao(ja) {
    cancelAnimationFrame(imRaf); imRaf = 0;
    if (imGL) { try { var ext = imGL.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); } catch (e) {} imGL = null; }
    if (!imEl) return;
    var el = imEl; imEl = null;
    document.documentElement.classList.remove('ms-em-foco');
    if (ja || CALMO) el.remove(); else { el.classList.remove('aberta'); setTimeout(function () { el.remove(); }, 420); }
  }
  function corDe(varNome) {
    var s = getComputedStyle(document.documentElement).getPropertyValue(varNome).trim();
    var c = document.createElement('canvas'); c.width = c.height = 1;
    var x = c.getContext('2d'); x.fillStyle = s || '#000'; x.fillRect(0, 0, 1, 1);
    var d = x.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
  }
  function fluido(canvas) {
    var gl = null;
    try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false }); } catch (e) { gl = null; }
    if (!gl) { canvas.classList.add('sem-gl'); return; }
    imGL = gl;
    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var fs = 'precision mediump float;uniform vec2 u_r;uniform float u_t;uniform vec3 u_a;uniform vec3 u_b;' +
      'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
      'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}' +
      'float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}' +
      'void main(){vec2 uv=gl_FragCoord.xy/u_r.y;float t=u_t*.04;' +
      'vec2 q=vec2(fb(uv*1.3+vec2(0.,t)),fb(uv*1.3+vec2(5.2,1.3)-t));' +
      'vec2 r=vec2(fb(uv*1.3+3.6*q+vec2(1.7,9.2)+t*.6),fb(uv*1.3+3.6*q+vec2(8.3,2.8)-t*.5));' +
      'float f=fb(uv*1.3+3.6*r);float m=smoothstep(.32,.98,f*f*1.6+.18*length(q));' +
      'vec2 c=gl_FragCoord.xy/u_r-.5;float clareira=smoothstep(.12,.62,length(c*vec2(u_r.x/u_r.y,1.)*.9));' +
      'gl_FragColor=vec4(mix(u_a,u_b,m*.5*clareira),1.);}';
    function sh(tipo, src) { var s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { canvas.classList.add('sem-gl'); return; }
    gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(pr, 'u_r'), uT = gl.getUniformLocation(pr, 'u_t');
    var a = corDe('--papel'), b = corDe('--tinta');
    gl.uniform3f(gl.getUniformLocation(pr, 'u_a'), a[0], a[1], a[2]);
    gl.uniform3f(gl.getUniformLocation(pr, 'u_b'), b[0], b[1], b[2]);
    var t0 = performance.now();
    function quadro(agora) {
      if (imGL !== gl) return;
      var dpr = Math.min(1.5, window.devicePixelRatio || 1), w = Math.round(canvas.clientWidth * dpr), hh = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== hh) { canvas.width = w; canvas.height = hh; gl.viewport(0, 0, w, hh); }
      gl.uniform2f(uR, w, hh); gl.uniform1f(uT, ((agora || t0) - t0) / 1000 + 20);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!CALMO) imRaf = requestAnimationFrame(quadro);
    }
    quadro(t0);
  }
  function pausar() {
    if (!S.timer) return;
    if (S.timer.pausa) { S.timer.fim = Date.now() + S.timer.resta; S.timer.pausa = false; }
    else { S.timer.resta = S.timer.fim - Date.now(); S.timer.pausa = true; }
    gravarLocal(CHAVE_TIMER, S.timer); pintar();
  }

  /* ============================================================
     A MATRIZ: quatro quadrados
     ============================================================ */
  function promover() {
    /* o prazo que chega sobe do Marcar para o Fazer (e do Soltar para o Passar): é a ideia de Covey.
       Uma vez por prazo: o que você puser de volta à mão fica onde pôs. */
    var mexeu = false, ja = ler('mesa.promovidas') || {};
    abertas().forEach(function (t) {
      if (!t.prazo || diasAte(t.prazo) > URGENTE_DIAS || ja[t.id] === t.prazo) return;
      if (t.q === 2) { t.q = 1; mexeu = true; }
      else if (t.q === 4) { t.q = 3; mexeu = true; }
      ja[t.id] = t.prazo;
    });
    gravarLocal('mesa.promovidas', ja);
    return mexeu;
  }
  function linhaTarefa(t, opcoes) {
    opcoes = opcoes || {};
    var meta = [];
    if (t.area) meta.push(esc(nomeArea(t.area)));
    if (t.prazo) meta.push('<span class="' + (diasAte(t.prazo) <= URGENTE_DIAS ? 'ms-urgente' : '') + '">' + quando(t.prazo) + '</span>');
    if (t.dia) meta.push('dia ' + curta(t.dia));
    if (t.min) meta.push(minutos(t.min));
    if (t.contexto) meta.push('@' + esc(t.contexto));
    if (t.para) meta.push('para ' + esc(t.para));
    if (t.passos && t.passos.length) meta.push(t.passos.filter(function (p) { return p.f; }).length + '/' + t.passos.length + ' passos');
    var aberto = S.aberto[t.id];
    var h = '<li class="ms-t' + (t.feito ? ' feita' : '') + '" data-id="' + t.id + '"' + (opcoes.arrastar !== false && !t.feito ? ' draggable="true"' : '') + '>' +
      '<button type="button" class="ms-caixa' + (t.feito ? ' feita' : '') + '" data-acao="' + (t.feito ? 'desfazer' : 'feito') + '" data-id="' + t.id + '" aria-pressed="' + !!t.feito + '" aria-label="' + (t.feito ? 'Desfazer: ' : 'Feito: ') + esc(t.titulo) + '"></button>' +
      '<div class="ms-t-corpo"><span class="ms-t-titulo">' + esc(t.titulo) + '</span>' + (meta.length ? '<span class="ms-meta">' + meta.join(' · ') + '</span>' : '') + '</div>' +
      cruz(t.id, t.titulo, aberto);
    if (aberto) h += detalhe(t);
    return h + '</li>';
  }
  function detalhe(t) {
    var h = '<div class="ms-det">';
    if (t.proximo) h += '<p class="ms-det-prox"><span class="rot">Próximo</span> ' + esc(t.proximo) + '</p>';
    if (t.notas) h += '<p class="ms-notas">' + esc(t.notas).replace(/\n/g, '<br>') + '</p>';
    if (t.fonte) h += '<p class="ms-meta">de onde veio: ' + esc(t.fonte) + '</p>';
    if (t.focoMin) h += '<p class="ms-meta">' + minutos(t.focoMin) + ' de foco até aqui</p>';
    if (!t.feito) {
      h += '<div class="ms-chips" role="group" aria-label="Mover">' + [1, 2, 3, 4].map(function (q) { return chip(QUAD[q][0], 'mover', '', q, t.q === q, ' data-id="' + t.id + '"'); }).join('') + '</div>';
      h += '<div class="ms-botoes">' + botao('Agora', 'esta', t.id) + botao('No dia de hoje', 'nodia', t.id) + botao('Editar', 'editar', t.id) + botao('Passos', 'passos', t.id) + botao('Apagar', 'apagar', t.id, 'leve') + '</div>';
    } else {
      h += '<div class="ms-botoes">' + botao('Desfazer', 'desfazer', t.id) + botao('Apagar', 'apagar', t.id, 'leve') + '</div>';
    }
    return h + '</div>';
  }
  function filtroTarefas(lista) {
    var f = S.sub;
    return filtrar(lista.filter(function (t) {
      if (f.area && t.area !== f.area) return false;
      return true;
    }), f.q);
  }
  function barraBusca(lugar, opcoes, fim) {
    return '<div class="ms-filtros"><input type="search" class="ms-busca" data-filtro="q" placeholder="' + lugar + '" value="' + esc(S.sub.q || '') + '" aria-label="' + lugar + '">' + (opcoes ? '<div class="ms-chips">' + opcoes + '</div>' : '') + (fim || '') + '</div>';
  }
  var GLIFO = { 1: 'cheio', 2: 'contorno', 3: 'trama', 4: 'tracejado' };
  function vistaMatriz() {
    var lista = filtroTarefas(abertas());
    var entrada = lista.filter(function (t) { return !t.q; });
    var usadas = {};
    abertas().forEach(function (t) { if (t.area) usadas[t.area] = 1; });
    var h = secao('Eisenhower, 1954: o urgente e o importante', 'A matriz', '<span class="ms-meta">' + lista.filter(function (t) { return t.q; }).length + ' abertas</span>');
    var abE = S.aberto._entrada;
    var mini = entrada.length ? '<div class="ms-entrada-mini"><button type="button" class="botao" data-acao="abrir" data-id="_entrada" aria-expanded="' + !!abE + '">A Entrada<small>' + entrada.length + '</small></button>' + botao('Triagem', 'triagem', '', 'cheio') + '</div>' : '';
    h += barraBusca('Buscar nas tarefas', chip('Todas', 'filtro', 'area', '', !S.sub.area) + E.areas.filter(function (a) { return usadas[a.id]; }).map(function (a) { return chip(esc(a.nome), 'filtro', 'area', a.id, S.sub.area === a.id); }).join(''), mini);
    if (entrada.length && abE) {
      h += '<section class="painel ms-entrada-lista"><ol class="ms-lista">' + entrada.map(function (t) { return linhaTarefa(t); }).join('') + '</ol></section>';
    }
    h += '<div class="ms-quadrantes" role="group" aria-label="O quadrante">' + [1, 2, 3, 4].map(function (q) {
      var n = lista.filter(function (t) { return t.q === q; }).length;
      return '<button type="button" class="ms-qbt q' + q + (S.quadMovel === q ? ' on' : '') + '" data-acao="quadmovel" data-q="' + q + '" aria-pressed="' + (S.quadMovel === q) + '"><span class="ms-glifo ' + GLIFO[q] + '" aria-hidden="true"></span><b>' + QUAD[q][0] + '</b><span class="ms-n">' + n + '</span></button>';
    }).join('') + '</div>';
    h += '<div class="ms-matriz"><span class="ms-eixo ms-ex1">Urgente</span><span class="ms-eixo ms-ex2">Sem pressa</span><span class="ms-eixo ms-ey1">Importante</span><span class="ms-eixo ms-ey2">Não importante</span>';
    [1, 2, 3, 4].forEach(function (q) {
      var itens = lista.filter(function (t) { return t.q === q; }).sort(function (a, b) { return nota(b) - nota(a); });
      h += '<section class="' + (q === 1 ? 'painel-inverso' : 'painel') + ' ms-quad q' + q + (S.quadMovel === q ? ' movel' : '') + '" data-q="' + q + '">' +
        '<header class="ms-quad-cab"><span class="ms-glifo ' + GLIFO[q] + '" aria-hidden="true"></span><h3>' + QUAD[q][0] + '</h3><span class="ms-meta">' + QUAD[q][1] + '</span><span class="ms-n">' + itens.length + '</span></header>' +
        '<ol class="ms-lista">' + (itens.length ? itens.map(function (t) { return linhaTarefa(t); }).join('') : '<li class="ms-vazio">' + ['', 'Nada pegando fogo.', 'Nada marcado.', 'Nada a passar.', 'Nada solto.'][q] + '</li>') + '</ol></section>';
    });
    h += '</div>';
    var feitas = E.tarefas.filter(function (t) { return t.feito; }).sort(function (a, b) { return String(b.feitoEm).localeCompare(String(a.feitoEm)); });
    if (feitas.length) {
      var ab = S.aberto._feitas;
      h += '<section class="painel ms-feitas"><div class="ms-entrada-cab"><div class="ms-t-corpo"><span class="ms-t-titulo">Feitas</span><span class="ms-meta">' + feitas.length + '</span></div>' + cruz('_feitas', 'as Feitas', ab) + '</div>' +
        (ab ? '<ol class="ms-lista">' + feitas.slice(0, 60).map(function (t) { return linhaTarefa(t, { arrastar: false }); }).join('') + '</ol>' : '') + '</section>';
    }
    return h;
  }

  /* ============================================================
     O DIA: que bem farei hoje?
     ============================================================ */
  function sequencia(h) {
    var n = 0, d = hoje();
    if ((E.marcas[d] || []).indexOf(h.id) < 0) d = somarDias(d, -1);
    while ((E.marcas[d] || []).indexOf(h.id) >= 0) { n++; d = somarDias(d, -1); }
    return n;
  }
  function vale(h, iso) {
    var q = F.semAcento(h.quando || 'todo dia'), dia = dataDe(iso).getDay();
    if (/seg.*sex|dias uteis|dia util/.test(q)) return dia >= 1 && dia <= 5;
    var nomes = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    var achou = nomes.filter(function (n) { return q.indexOf(n) >= 0; });
    if (achou.length && !/todo/.test(q)) return achou.indexOf(nomes[dia]) >= 0;
    return true;
  }
  function vistaDia() {
    var d = diaDe(hoje()), plano = d.plano.map(tarefa).filter(Boolean);
    var soma = plano.filter(function (t) { return !t.feito; }).reduce(function (s, t) { return s + (t.min || 0); }, 0);
    var h = secao(extenso(hoje()), 'O dia');
    h += '<div class="ms-dia">';
    h += '<section class="painel ms-bem"><label class="rot" for="ms-bem">De manhã, a pergunta de Franklin</label><input id="ms-bem" class="ms-escrever" data-campo-dia="bem" value="' + esc(d.bem) + '" placeholder="Que bem farei hoje?" autocomplete="off"></section>';
    h += '<section class="painel ms-plano-painel"><div class="ms-entrada-cab"><div class="ms-t-corpo"><span class="ms-t-titulo">O plano</span><span class="ms-meta">' +
      (plano.length ? (soma ? minutos(soma) + ' no plano; com a lei de Hofstadter, conte ' + minutos(Math.round(soma * 1.5)) + (soma * 1.5 > 360 ? '. Passa do que cabe num dia.' : '') : 'sem minutos marcados') : 'seis coisas, em ordem; a primeira é o sapo') +
      '</span></div>' + botao('Planejar o dia', 'planejar', '', plano.length ? '' : 'cheio') + '</div>';
    if (plano.length) {
      h += '<ol class="ms-plano">' + plano.map(function (t, i) {
        return '<li class="' + (t.feito ? 'feita' : '') + '"><span class="ms-ordem">' + (d.sapo === t.id ? 'sapo' : (i + 1)) + '</span>' +
          '<button type="button" class="ms-caixa' + (t.feito ? ' feita' : '') + '" data-acao="' + (t.feito ? 'desfazer' : 'feito') + '" data-id="' + t.id + '" aria-pressed="' + !!t.feito + '" aria-label="Feito: ' + esc(t.titulo) + '"></button>' +
          '<div class="ms-t-corpo"><span class="ms-t-titulo' + (t.feito ? ' riscado' : '') + '">' + esc(t.titulo) + '</span><span class="ms-meta">' + esc(porque(t)) + '</span></div>' +
          '<div class="ms-mini">' + (i ? '<button type="button" class="cruz-bt ms-seta" data-acao="subir" data-id="' + t.id + '" aria-label="Subir">↑</button>' : '') +
          '<button type="button" class="cruz-bt" data-acao="tirardodia" data-id="' + t.id + '" aria-label="Tirar do plano"><i class="cruz ms-x" aria-hidden="true"></i></button></div></li>';
      }).join('') + '</ol>';
    }
    h += '</section>';
    var habs = E.habitos.filter(function (x) { return vale(x, hoje()); });
    if (habs.length) {
      var feitos = E.marcas[hoje()] || [];
      h += '<section class="painel"><div class="ms-entrada-cab"><div class="ms-t-corpo"><span class="ms-t-titulo">Os hábitos de hoje</span><span class="ms-meta">' + feitos.filter(function (id) { return habs.some(function (x) { return x.id === id; }); }).length + ' de ' + habs.length + '</span></div></div><ol class="ms-lista">' + habs.map(function (x) {
        var ok = feitos.indexOf(x.id) >= 0, seq = sequencia(x);
        return '<li class="ms-t"><button type="button" class="ms-caixa' + (ok ? ' feita' : '') + '" data-acao="habito" data-id="' + x.id + '" aria-pressed="' + ok + '" aria-label="' + esc(x.nome) + '"></button>' +
          '<div class="ms-t-corpo"><span class="ms-t-titulo">' + esc(x.nome) + '</span><span class="ms-meta">' + [x.min ? minutos(x.min) : '', x.quando, seq ? seq + (seq === 1 ? ' dia seguido' : ' dias seguidos') : ''].filter(Boolean).join(' · ') + '</span></div></li>';
      }).join('') + '</ol></section>';
    }
    var prox = abertas().filter(function (t) { return t.prazo && diasAte(t.prazo) <= 7; }).sort(function (a, b) { return a.prazo.localeCompare(b.prazo); });
    if (prox.length) h += '<section class="painel"><div class="ms-entrada-cab"><div class="ms-t-corpo"><span class="ms-t-titulo">Os prazos da semana</span><span class="ms-meta">' + prox.length + '</span></div></div><ol class="ms-lista">' + prox.map(function (t) { return linhaTarefa(t, { arrastar: false }); }).join('') + '</ol></section>';
    h += '<section class="painel-inverso ms-noite"><label class="rot" for="ms-fez">À noite</label><input id="ms-fez" class="ms-escrever" data-campo-dia="fez" value="' + esc(d.fez) + '" placeholder="Que bem fiz hoje?" autocomplete="off">' +
      '<div class="ms-botoes">' + botao('Fechar o dia', 'fechardia', '', 'cheio') + '</div></section>';
    return h + '</div>';
  }

  /* ============================================================
     A SEMANA: a revisão em seis passos, e a tábua de Franklin
     ============================================================ */
  function vistaSemana() {
    var k = F.semana(hoje()), s = semanaDe(k);
    var seg = somarDias(hoje(), -((dataDe(hoje()).getDay() + 6) % 7)), dom = somarDias(seg, 6);
    var entrada = abertas().filter(function (t) { return !t.q; }).length;
    var duas = abertas().filter(function (t) { return t.prazo && diasAte(t.prazo) <= 14; }).sort(function (a, b) { return a.prazo.localeCompare(b.prazo); });
    var soltas = abertas().filter(function (t) { return t.q === 4; });
    var feitasSemana = E.tarefas.filter(function (t) { return t.feito && t.feitoEm >= seg && t.feitoEm <= dom; });
    var foco = feitasSemana.reduce(function (a, t) { return a + (t.focoMin || 0); }, 0);
    var h = secao('Semana ' + k.slice(-2) + ' · ' + curta(seg) + ' a ' + curta(dom) + (s.revisada ? ' · revista em ' + curta(s.revisada) : ''), 'A semana');
    h += '<div class="ms-semana"><div class="ms-numeros-grandes painel">' +
      '<div><span class="ms-grande">' + feitasSemana.length + '</span><span class="rot">feitas</span></div>' +
      '<div><span class="ms-grande">' + (minutos(foco) || '0 min') + '</span><span class="rot">de foco</span></div>' +
      '<div><span class="ms-grande">' + abertas().filter(function (t) { return t.q === 1; }).length + '</span><span class="rot">no Fazer</span></div></div>';
    var passos = [
      ['Esvaziar a Entrada', entrada ? '<p>' + entrada + ' esperando.</p><div class="ms-botoes">' + botao('Triagem', 'triagem', '', 'cheio') + '</div>' : '<p>Vazia.</p>'],
      ['Olhar o Fazer e o Marcar', '<p>' + abertas().filter(function (t) { return t.q === 1; }).length + ' no Fazer, ' + abertas().filter(function (t) { return t.q === 2; }).length + ' no Marcar.</p><div class="ms-botoes">' + botao('Abrir a matriz', 'ir', '', '', 'matriz') + '</div>'],
      ['Os prazos de duas semanas', duas.length ? '<ol class="ms-lista">' + duas.map(function (t) { return linhaTarefa(t, { arrastar: false }); }).join('') + '</ol>' : '<p>Nenhum.</p>'],
      ['Uma nota para cada área, de 0 a 10', '<div class="ms-notas-areas">' + E.areas.map(function (a) {
        return '<label class="ms-nota-area"><span>' + esc(a.nome) + '</span><input type="range" min="0" max="10" step="1" value="' + (a.nota == null ? 5 : a.nota) + '" data-nota-area="' + a.id + '" aria-label="Nota de ' + esc(a.nome) + '"><b>' + (a.nota == null ? '·' : a.nota) + '</b></label>';
      }).join('') + '</div>'],
      ['Três resultados para a semana', '<ol class="ms-resultados">' + [0, 1, 2].map(function (i) {
        var r = s.resultados[i] || { t: '', f: false };
        return '<li><button type="button" class="ms-caixa' + (r.f ? ' feita' : '') + '" data-acao="resultado" data-i="' + i + '" aria-pressed="' + r.f + '" aria-label="Alcançado"></button><input class="ms-campo" data-resultado="' + i + '" value="' + esc(r.t) + '" placeholder="um resultado que se possa conferir" autocomplete="off"></li>';
      }).join('') + '</ol>'],
      ['O Soltar: o que volta, o que sai de vez', soltas.length ? '<ol class="ms-lista">' + soltas.map(function (t) { return linhaTarefa(t, { arrastar: false }); }).join('') + '</ol>' : '<p>Nada solto.</p>'],
    ];
    h += '<section class="painel"><ol class="ms-revisao">' + passos.map(function (p, i) {
      var ab = S.aberto['passo' + i];
      return '<li><div class="ms-passo-cab"><span class="ms-ordem">' + (i + 1) + '</span><span class="ms-t-titulo">' + p[0] + '</span>' + cruz('passo' + i, p[0], ab) + '</div>' + (ab ? '<div class="ms-passo-corpo">' + p[1] + '</div>' : '') + '</li>';
    }).join('') + '</ol><div class="ms-botoes ms-revisada">' + botao(s.revisada === hoje() ? 'Revista hoje' : 'A semana está revista', 'revisada', '', s.revisada === hoje() ? '' : 'cheio') + '</div></section>';
    /* a tábua de Franklin: os hábitos nos sete dias */
    if (E.habitos.length) {
      var dias = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return somarDias(seg, i); });
      h += '<section class="painel"><div class="ms-entrada-cab"><div class="ms-t-corpo"><span class="ms-t-titulo">A tábua de Franklin</span><span class="ms-meta">os hábitos nos sete dias</span></div></div><div class="ms-franklin" role="table" aria-label="Hábitos da semana"><div class="ms-fr-linha ms-fr-cab" role="row"><span role="columnheader"></span>' +
        dias.map(function (d) { return '<span role="columnheader">' + 'DSTQQSS'.charAt(dataDe(d).getDay()) + '</span>'; }).join('') + '</div>' +
        E.habitos.map(function (x) {
          return '<div class="ms-fr-linha" role="row"><span class="ms-fr-nome" role="rowheader">' + esc(x.nome) + '</span>' + dias.map(function (d) {
            var ok = (E.marcas[d] || []).indexOf(x.id) >= 0, futuro = d > hoje();
            return '<span role="cell"><button type="button" class="ms-caixa pequena' + (ok ? ' feita' : '') + (vale(x, d) ? '' : ' fora') + '" data-acao="habito" data-id="' + x.id + '" data-dia="' + d + '" aria-pressed="' + ok + '" aria-label="' + esc(x.nome) + ', ' + extenso(d) + '"' + (futuro ? ' disabled' : '') + '></button></span>';
          }).join('') + '</div>';
        }).join('') + '</div></section>';
    }
    return h + '</div>';
  }

  /* ============================================================
     A MANDALA: o centro e as oito áreas
     ============================================================ */
  function vistaMandala() {
    var seg = somarDias(hoje(), -((dataDe(hoje()).getDay() + 6) % 7));
    var areas = E.areas.slice(0, 8);
    var ordem = [0, 1, 2, 7, -1, 3, 6, 5, 4];   /* em volta do centro, no sentido do relógio */
    var h = secao('Imaizumi, 1979: um centro, oito áreas', 'A mandala');
    h += '<div class="ms-mandala-grade"><div class="ms-mandala" role="group" aria-label="A Mandala">';
    ordem.forEach(function (i) {
      if (i === -1) {
        h += '<div class="ms-m-centro painel-inverso"><p class="rot">O centro</p><textarea class="ms-centro" data-centro rows="4" placeholder="o objetivo que segura o resto" aria-label="O centro">' + esc(E.centro) + '</textarea></div>';
        return;
      }
      var a = areas[i];
      if (!a) { h += '<div class="ms-m-area vazia"></div>'; return; }
      var ab = abertas().filter(function (t) { return t.area === a.id; });
      var fs = E.tarefas.filter(function (t) { return t.feito && t.area === a.id && t.feitoEm >= seg; }).length;
      var n = a.nota == null ? null : a.nota;
      h += '<button type="button" class="ms-m-area' + (S.sub.marea === a.id ? ' on' : '') + (n != null && n >= 6 ? ' escura' : '') + '" data-acao="marea" data-id="' + a.id + '" style="--peso:' + (n == null ? 0 : n / 10) + '" aria-expanded="' + (S.sub.marea === a.id) + '">' +
        '<span class="ms-m-nome">' + esc(a.nome) + '</span><span class="ms-m-nota">' + (n == null ? '' : n) + '</span>' +
        '<span class="ms-meta">' + ab.length + ' abertas' + (fs ? ' · ' + fs + ' na semana' : '') + (n == null ? ' · sem nota' : '') + '</span></button>';
    });
    h += '</div>';
    var a = area(S.sub.marea);
    if (a) {
      var lista = abertas().filter(function (t) { return t.area === a.id; }).sort(function (x, y) { return (x.q || 9) - (y.q || 9) || nota(y) - nota(x); });
      h += '<section class="painel ms-m-aberta"><p class="rot">' + esc(a.para || 'A área') + '</p><h3 class="ms-m-titulo" data-revela-foco>' + esc(a.nome) + '</h3>' +
        '<label class="ms-nota-area"><span>A nota desta semana</span><input type="range" min="0" max="10" step="1" value="' + (a.nota == null ? 5 : a.nota) + '" data-nota-area="' + a.id + '"><b>' + (a.nota == null ? '·' : a.nota) + '</b></label>';
      if ((a.acoes || []).length) {
        h += '<div class="ms-acoes-area"><p class="rot">As oito ações</p><ul class="lista-fio">' + a.acoes.map(function (x) {
          var ja = E.tarefas.some(function (t) { return !t.feito && F.semAcento(t.titulo) === F.semAcento(x); });
          return '<li><span>' + esc(x) + '</span>' + (ja ? '<span class="ms-meta">na mesa</span>' : '<button type="button" class="ms-link" data-acao="acaoarea" data-area="' + a.id + '" data-v="' + esc(x) + '">pôr na mesa</button>') + '</li>';
        }).join('') + '</ul></div>';
      }
      h += lista.length ? '<ol class="ms-lista">' + lista.map(function (t) { return linhaTarefa(t, { arrastar: false }); }).join('') + '</ol>' : '<p class="ms-texto">Nada aberto nesta área.</p>';
      h += '</section>';
    } else {
      h += '<section class="painel ms-m-aberta ms-m-convite"><p class="rot">As oito áreas</p><p class="ms-texto">Cada área abre aqui, com a nota da semana, as oito ações e o que está aberto nela. A tinta de cada quadrado cresce com a nota.</p></section>';
    }
    return h + '</div>';
  }

  /* ============================================================
     O DINHEIRO
     ============================================================ */
  function vistaDinheiro() {
    var D = E.dinheiro, mes = S.mes;
    var doMes = D.lancamentos.filter(function (x) { return String(x.data).slice(0, 7) === mes; }).sort(function (a, b) { return String(b.data).localeCompare(String(a.data)); });
    var entrou = doMes.filter(function (x) { return x.valor > 0; }).reduce(function (s, x) { return s + x.valor; }, 0);
    var saiu = doMes.filter(function (x) { return x.valor < 0; }).reduce(function (s, x) { return s - x.valor; }, 0);
    var porGrupo = { essencial: 0, livre: 0, futuro: 0 };
    doMes.forEach(function (x) { if (x.valor < 0 && porGrupo[x.grupo] != null) porGrupo[x.grupo] -= x.valor; });
    var d = dataDe(mes + '-15');
    var nav = '<div class="ms-mes"><button type="button" class="cruz-bt" data-acao="mes" data-v="-1" aria-label="Mês anterior">‹</button><span class="ms-meta">' + MESES[d.getMonth()] + ' de ' + d.getFullYear() + '</span><button type="button" class="cruz-bt" data-acao="mes" data-v="1" aria-label="Mês seguinte">›</button></div>';
    var h = secao('O livro-caixa e os três envelopes', 'O dinheiro', nav);
    h += '<div class="ms-dinheiro">';
    h += '<section class="painel-inverso ms-tres"><div><p class="rot">Entrou</p><p class="ms-grande">' + reais(entrou) + '</p></div><div><p class="rot">Saiu</p><p class="ms-grande">' + reais(saiu) + '</p></div><div><p class="rot">Sobra</p><p class="ms-grande">' + reais(entrou - saiu) + '</p></div></section>';
    h += '<section class="painel"><div class="ms-entrada-cab"><div class="ms-t-corpo"><span class="ms-t-titulo">Os três envelopes</span><span class="ms-meta">' + (entrou ? 'contra a renda do mês' : 'os tetos aparecem quando entra a renda do mês (+ valor na linha de cima)') + '</span></div></div><div class="ms-barras">' + GRUPOS.map(function (g) {
      var pct = D.grupos[g[0]] || 0, teto = entrou * pct / 100, gasto = porGrupo[g[0]];
      var fr = teto ? Math.min(1, gasto / teto) : 0;
      return '<div class="ms-barra"><div class="ms-barra-cab"><span>' + g[1] + ' · ' + pct + '%</span><span>' + reais(gasto) + (teto ? ' de ' + reais(teto) : '') + '</span></div>' +
        '<div class="ms-trilho"><i style="transform:scaleX(' + fr.toFixed(3) + ')" class="' + (teto && gasto > teto ? 'passou' : '') + '"></i></div></div>';
    }).join('') + '</div></section>';
    h += '<section class="painel"><div class="ms-entrada-cab"><div class="ms-t-corpo"><span class="ms-t-titulo">Lançamentos</span><span class="ms-meta">' + doMes.length + '</span></div></div>' + (doMes.length ? '<ol class="ms-lanc">' + doMes.map(function (x) {
      return '<li><span class="ms-meta">' + curta(x.data) + '</span><span class="ms-l-desc">' + esc(x.desc || x.cat || '—') + '</span><span class="ms-meta">' + esc(x.grupo) + '</span><span class="ms-valor' + (x.valor > 0 ? ' entra' : '') + '">' + F.dinheiro(x.valor, true) + '</span><button type="button" class="cruz-bt" data-acao="tirarlanc" data-id="' + x.id + '" aria-label="Apagar"><i class="cruz ms-x" aria-hidden="true"></i></button></li>';
    }).join('') + '</ol>' : '<p class="ms-texto">Nenhum lançamento neste mês. Na linha de cima: −35 mercado, +300 freela.</p>') + '</section>';
    var fixosMes = D.fixos.reduce(function (s, x) { return s + (x.valor == null ? 0 : x.cada === 'ano' ? x.valor / 12 : x.valor); }, 0);
    h += '<div class="ms-duas-col"><section class="painel"><div class="ms-entrada-cab"><div class="ms-t-corpo"><span class="ms-t-titulo">Fixos</span><span class="ms-meta">' + (D.fixos.length ? reais(fixosMes) + ' por mês' : 'contas e assinaturas') + '</span></div>' + botao('Novo', 'novofixo') + '</div>' +
      (D.fixos.length ? '<ol class="ms-lanc ms-fixos">' + D.fixos.map(function (x) {
        return '<li><span class="ms-l-desc">' + esc(x.nome) + '</span><span class="ms-meta">' + (x.cada === 'ano' ? 'por ano' : 'por mês') + (x.vence ? ' · vence ' + quando(x.vence) : '') + '</span><span class="ms-valor">' + (x.valor == null ? 'a conferir' : F.dinheiro(x.valor)) + '</span><button type="button" class="cruz-bt" data-acao="tirarfixo" data-id="' + x.id + '" aria-label="Apagar"><i class="cruz ms-x" aria-hidden="true"></i></button></li>';
      }).join('') + '</ol>' : '') + '</section>';
    h += '<section class="painel"><div class="ms-entrada-cab"><div class="ms-t-corpo"><span class="ms-t-titulo">Metas</span><span class="ms-meta">' + (D.metas.length ? D.metas.length : 'a reserva para o imprevisto é a primeira') + '</span></div>' + botao('Nova', 'novameta') + '</div>' + D.metas.map(function (m) {
      var fr = m.alvo ? Math.min(1, m.guardado / m.alvo) : 0;
      return '<div class="ms-barra"><div class="ms-barra-cab"><span>' + esc(m.nome) + '</span><span>' + reais(m.guardado) + ' de ' + reais(m.alvo) + '</span></div><div class="ms-trilho"><i style="transform:scaleX(' + fr.toFixed(3) + ')"></i></div>' +
        '<div class="ms-botoes">' + botao('Guardar', 'guardarmeta', m.id) + botao('Apagar', 'tirarmeta', m.id, 'leve') + '</div></div>';
    }).join('') + '</section></div>';
    return h + '</div>';
  }

  /* ============================================================
     AS ROUPAS
     ============================================================ */
  function vistaRoupas() {
    var f = S.sub.roupa || '';
    var tipos = {};
    E.roupas.forEach(function (r) { if (r.tipo) tipos[r.tipo] = 1; });
    var noventa = somarDias(hoje(), -90);
    var lista = filtrar(E.roupas.filter(function (r) {
      if (f === 'capsula') return r.capsula;
      if (f === 'paradas') return !r.ultima || r.ultima < noventa;
      if (f === 'doar') return r.estado === 'doar';
      if (f && f.indexOf('tipo:') === 0) return r.tipo === f.slice(5);
      return true;
    }), S.sub.q);
    var naCapsula = E.roupas.filter(function (r) { return r.capsula; }).length;
    var h = secao(E.roupas.length + ' peças · ' + naCapsula + ' de 33 na cápsula · ' + E.roupas.filter(function (r) { return !r.ultima || r.ultima < noventa; }).length + ' paradas há 90 dias', 'As roupas');
    h += barraBusca('Buscar nas roupas', [['', 'Todas'], ['capsula', 'A cápsula'], ['paradas', 'Paradas'], ['doar', 'Doar']].concat(Object.keys(tipos).sort().map(function (t) { return ['tipo:' + t, t]; })).map(function (o) { return chip(esc(o[1]), 'filtro', 'roupa', o[0], f === o[0]); }).join(''));
    if (!E.roupas.length) return h + '<section class="painel ms-convite"><p class="ms-texto">Nenhuma peça ainda. Uma por linha, na linha de cima: o nome e, se quiser, o preço (camisa de linho R$ 120). Cada peça ganha o custo por uso e entra na conta da cápsula de 33.</p></section>';
    h += '<ol class="ms-grade">' + lista.map(function (r) {
      var cpu = r.custo && r.usos ? r.custo / r.usos : null;
      return '<li class="ms-cartao"><div class="ms-cartao-cab"><span class="ms-t-titulo">' + esc(r.nome) + '</span>' + (r.capsula ? '<span class="ms-selo">cápsula</span>' : '') + '</div>' +
        '<span class="ms-meta">' + [r.tipo, r.cor, r.estacao, r.estado !== 'ok' ? r.estado : ''].filter(Boolean).map(esc).join(' · ') + '</span>' +
        '<span class="ms-meta">' + (r.usos || 0) + (r.usos === 1 ? ' uso' : ' usos') + (r.ultima ? ' · ' + quando(r.ultima).replace('venceu ', '') : '') + (cpu != null ? ' · ' + reais(cpu) + ' por uso' : '') + '</span>' +
        '<div class="ms-botoes">' + botao('Vesti hoje', 'vesti', r.id) + botao('Editar', 'editarroupa', r.id, 'leve') + '</div></li>';
    }).join('') + '</ol>';
    return h;
  }

  /* ============================================================
     OS LIVROS: a estante sem fim (a técnica do Shelf Hero): as lombadas lado a lado,
     o livro escolhido puxado para fora, e o título que sobe por máscara
     ============================================================ */
  function numHash(s) { var h = 0; s = String(s); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function vistaLivros() {
    var todos = livros();
    var f = S.sub.situacao || 'todos';
    var cont = {};
    todos.forEach(function (l) { cont[l.situacao] = (cont[l.situacao] || 0) + 1; });
    var lista = filtrar(todos.filter(function (l) { return f === 'todos' || l.situacao === f; }), S.sub.q);
    var nao = todos.filter(function (l) { return l.situacao === 'tenho' || l.situacao === 'quero'; }).length;
    var h = secao(todos.length + ' livros · ' + (cont.lendo || 0) + ' lendo · a antibiblioteca: ' + nao + ' esperando' + (S.modo === 'caderno' && S.livrosCaderno ? ' · o catálogo do caderno' : ''), 'Os livros');
    h += barraBusca('Buscar nos livros', [['todos', 'Todos']].concat(SITUACAO).map(function (o) {
      return chip(o[1] + (o[0] !== 'todos' ? ' <small>' + (cont[o[0]] || 0) + '</small>' : ' <small>' + todos.length + '</small>'), 'filtro', 'situacao', o[0], f === o[0]);
    }).join('') + (f === 'quero' || f === 'tenho' ? botao('O próximo', 'proximolivro', '', 'cheio') : ''));
    if (S.livrosCarregando && !todos.length) return h + '<p class="ms-meta">Lendo o catálogo…</p>';
    if (!lista.length) return h + '<section class="painel ms-convite"><p class="ms-texto">' + (todos.length ? 'Nenhum livro aqui.' : 'Nenhum livro ainda. Um por linha, na linha de cima: título — autor.') + '</p></section>';
    var ativo = lista.filter(function (l) { return String(l.id) === String(S.sub.livro); })[0] || lista.filter(function (l) { return l.situacao === 'lendo'; })[0] || lista[0];
    h += '<section class="painel ms-estante-painel"><div class="ms-estante" id="ms-estante" role="list" aria-label="A estante">' + lista.map(function (l) {
      var hh = numHash(l.titulo + l.autor);
      var larg = l.paginas ? Math.max(28, Math.min(64, Math.round(l.paginas / 11))) : 30 + (hh % 16);
      var alt = 74 + (hh % 24);
      var tom = l.situacao === 'lendo' ? 0 : 56 + ((hh >> 4) % 44);
      var fr = l.paginas ? Math.min(1, (l.pagina || 0) / l.paginas) : 0;
      return '<button type="button" role="listitem" class="ms-lombada' + (l === ativo ? ' fora' : '') + (l.situacao === 'lendo' ? ' lendo' : '') + (l.situacao === 'lido' ? ' lido' : '') + '" data-acao="livro" data-id="' + esc(l.id) + '" style="--larg:' + larg + 'px;--alt:' + alt + '%;--tom:' + tom + '%;--lido:' + fr.toFixed(3) + '" aria-pressed="' + (l === ativo) + '" aria-label="' + esc(l.titulo + (l.autor ? ', ' + l.autor : '')) + '">' +
        '<span class="ms-l-t">' + esc(l.titulo) + '</span>' + (l.autor ? '<span class="ms-l-a">' + esc(String(l.autor).split(',')[0]) + '</span>' : '') + '</button>';
    }).join('') + '</div></section>';
    var fr2 = ativo.paginas ? Math.min(1, (ativo.pagina || 0) / ativo.paginas) : 0;
    h += '<section class="painel-inverso ms-livro-aberto" data-id="' + esc(ativo.id) + '"><div class="ms-capa" aria-hidden="true"><span class="ms-capa-t">' + esc(ativo.titulo) + '</span><span class="ms-capa-a">' + esc(ativo.autor || '') + '</span></div>' +
      '<div class="ms-livro-info"><p class="rot">' + esc((SITUACAO.filter(function (s) { return s[0] === ativo.situacao; })[0] || ['', ''])[1]) + ((ativo.tags || []).length ? ' · ' + esc(ativo.tags.slice(0, 3).join(', ')) : '') + '</p>' +
      '<h3 class="ms-livro-titulo" data-revela-foco>' + esc(ativo.titulo) + '</h3><p class="ms-livro-autor">' + esc(ativo.autor || 'sem autor') + '</p>' +
      (ativo.situacao === 'lendo' ? '<div class="ms-trilho fino"><i style="transform:scaleX(' + fr2.toFixed(3) + ')"></i></div><p class="ms-meta">' + (ativo.paginas ? 'página ' + (ativo.pagina || 0) + ' de ' + ativo.paginas : 'sem o número de páginas') + '</p>' : '') +
      '<div class="ms-chips" role="group" aria-label="Situação">' + SITUACAO.map(function (s) { return chip(s[1], 'situacao', '', s[0], ativo.situacao === s[0], ' data-id="' + esc(ativo.id) + '"'); }).join('') + '</div>' +
      '<div class="ms-paginas"><label>Página <input type="number" min="0" inputmode="numeric" data-livro-pag="' + esc(ativo.id) + '" value="' + (ativo.pagina || '') + '"></label><label>de <input type="number" min="0" inputmode="numeric" data-livro-tot="' + esc(ativo.id) + '" value="' + (ativo.paginas || '') + '"></label></div></div></section>';
    return h;
  }

  /* ============================================================
     AS COLEÇÕES
     ============================================================ */
  function vistaColecoes() {
    if (!S.sub.colecao && E.colecoes.length) S.sub.colecao = E.colecoes[0].id;
    var c = E.colecoes.filter(function (k) { return k.id === S.sub.colecao; })[0];
    var h = secao('Um armário por coleção', 'As coleções', botao('Nova coleção', 'novacolecao'));
    if (!c) return h + '<section class="painel ms-convite"><p class="ms-texto">Discos, filmes, cubos, plantas, figurinhas: cada coleção é um armário, com o que se tem, o que se quer e o que se troca.</p></section>';
    var f = S.sub.estado || '';
    var itens = filtrar(c.itens.filter(function (i) { return !f || i.estado === f; }), S.sub.q);
    h += '<div class="ms-filtros"><div class="ms-chips">' + E.colecoes.map(function (k) { return chip(esc(k.nome) + ' <small>' + k.itens.length + '</small>', 'filtro', 'colecao', k.id, k.id === c.id); }).join('') + '</div></div>';
    h += barraBusca('Buscar em ' + esc(c.nome), [['', 'Tudo'], ['tenho', 'Tenho'], ['quero', 'Quero'], ['troca', 'Troca']].map(function (o) { return chip(o[1], 'filtro', 'estado', o[0], f === o[0]); }).join(''));
    h += itens.length ? '<ol class="ms-grade">' + itens.map(function (i) {
      return '<li class="ms-cartao"><span class="ms-t-titulo">' + esc(i.nome) + '</span><span class="ms-meta">' + esc(i.detalhe || '') + '</span>' +
        '<div class="ms-chips" role="group" aria-label="Estado">' + ['tenho', 'quero', 'troca'].map(function (s) { return chip(s, 'estadoitem', '', s, i.estado === s, ' data-id="' + i.id + '"'); }).join('') +
        '<button type="button" class="cruz-bt" data-acao="tiraritem" data-id="' + i.id + '" aria-label="Apagar"><i class="cruz ms-x" aria-hidden="true"></i></button></div></li>';
    }).join('') + '</ol>' : '<section class="painel ms-convite"><p class="ms-texto">Nada aqui ainda.</p></section>';
    return h;
  }

  /* ============================================================
     O GUIA: todas as técnicas
     ============================================================ */
  function vistaGuia() {
    var f = S.sub.familia || '';
    var lista = filtrar(G.lista.filter(function (t) { return !f || t.familia === f; }), S.sub.q);
    var h = secao(G.lista.length + ' técnicas, cada uma com a fonte e o lugar dela na Mesa', 'O guia');
    h += barraBusca('Buscar nas técnicas', [['', 'Todas']].concat(G.FAMILIAS).map(function (o) { return chip(o[1], 'filtro', 'familia', o[0], f === o[0]); }).join(''));
    h += '<section class="painel"><ol class="ms-tecnicas">' + lista.map(function (t) {
      var ab = S.aberto['g' + t.id];
      return '<li class="ms-tecnica"><div class="ms-tec-cab"><div class="ms-t-corpo"><span class="ms-t-titulo">' + esc(t.nome) + '</span><span class="ms-meta">' + esc(t.quem) + '</span></div>' + cruz('g' + t.id, t.nome, ab) + '</div>' +
        (ab ? '<div class="ms-det"><p class="ms-texto">' + esc(t.ideia) + '</p><p class="ms-det-prox"><span class="rot">Na Mesa</span> ' + esc(t.naMesa) + '</p>' +
          '<div class="ms-botoes">' + botao(nomeVista(t.ver), 'ir', '', '', t.ver) + '</div>' +
          (t.fontes.length ? '<p class="ms-fontes">' + t.fontes.map(function (x) { return '<a href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + esc(x[0]) + '</a>'; }).join(' · ') + '</p>' : '') + '</div>' : '') + '</li>';
    }).join('') + '</ol></section>';
    return h;
  }
  function nomeVista(id) { var v = VISTAS.filter(function (x) { return x[0] === id; })[0]; return v ? 'Abrir ' + v[2].toLowerCase() : id; }

  /* ============================================================
     OS ASSISTENTES (folhas)
     ============================================================ */
  function folha(titulo, sub, html, larga) {
    if (window.Perfil && window.Perfil.folha) return window.Perfil.folha({ titulo: esc(titulo), sub: esc(sub || ''), html: html, larga: larga });
    var el = document.createElement('div');
    el.className = 'ms-folha-solta';
    el.innerHTML = '<div class="ms-folha-cab"><p class="rot">' + esc(sub || '') + '</p><h2>' + esc(titulo) + '</h2><button type="button" class="cruz-bt" data-fechar aria-label="Fechar"><i class="cruz ms-x" aria-hidden="true"></i></button></div><div class="ms-folha-corpo">' + html + '</div>';
    document.body.appendChild(el);
    var api = { corpo: el.querySelector('.ms-folha-corpo'), fechar: function () { el.remove(); } };
    el.querySelector('[data-fechar]').addEventListener('click', api.fechar);
    return api;
  }

  /* a Triagem: uma coisa da Entrada de cada vez (o GTD, perguntado) */
  function triagem() {
    var fila = abertas().filter(function (t) { return !t.q; }).map(function (t) { return t.id; });
    if (!fila.length) { aviso('A Entrada está vazia.'); return; }
    var i = 0, r = {};
    var f = folha('Triagem', 'A Entrada', '', true);
    function passo(qual) {
      var t = tarefa(fila[i]);
      if (!t) { proxima(); return; }
      var cab = '<p class="rot">' + (i + 1) + ' de ' + fila.length + '</p><h3 class="ms-tri-titulo">' + esc(t.titulo) + '</h3>';
      var corpo = '';
      if (qual === 'acao') corpo = pergunta('Pede alguma ação sua?', [['sim', 'Sim'], ['algumdia', 'Não agora: algum dia'], ['apagar', 'Não: apagar']]);
      else if (qual === 'dois') corpo = pergunta('Leva menos de dois minutos?', [['agora', 'Sim: fazer agora'], ['nao', 'Não']]);
      else if (qual === 'quem') corpo = pergunta('É você quem faz?', [['eu', 'Sou eu'], ['outro', 'Outra pessoa']]) + '<label class="ms-campo-rot">Para quem<input class="ms-campo" data-tri="para" placeholder="nome" autocomplete="off"></label>';
      else if (qual === 'importa') corpo = pergunta('Serve ao centro, ou a uma área que importa?', [['sim', 'Sim, importa'], ['nao', 'Não muito']]);
      else if (qual === 'prazo') corpo = pergunta('Tem prazo?', [['hoje', 'Hoje'], ['amanha', 'Amanhã'], ['semana', 'Nesta semana'], ['nao', 'Sem prazo']]) + '<label class="ms-campo-rot">Ou um dia<input type="date" class="ms-campo" data-tri="data"></label>';
      else if (qual === 'area') corpo = '<p class="ms-pergunta">Qual área?</p><div class="ms-chips">' + E.areas.map(function (a) { return '<button type="button" class="chip" data-r="' + a.id + '">' + esc(a.nome) + '</button>'; }).join('') + '<button type="button" class="chip" data-r="">nenhuma</button></div>';
      else if (qual === 'proximo') corpo = '<p class="ms-pergunta">O primeiro movimento visível?</p><input class="ms-campo" data-tri="proximo" value="' + esc(t.proximo) + '" placeholder="abrir, ligar, escrever uma frase" autocomplete="off"><div class="ms-botoes"><button type="button" class="botao pri" data-r="ok">Pronto</button></div>';
      else if (qual === 'fazer2') corpo = '<p class="ms-pergunta">Então, agora.</p><div class="ms-botoes"><button type="button" class="botao pri" data-r="feito">Feito</button><button type="button" class="botao" data-r="depois">Ficou para depois</button></div>';
      f.corpo.innerHTML = '<div class="ms-tri" data-passo="' + qual + '">' + cab + corpo + '</div>';
      var campo = f.corpo.querySelector('input'); if (campo && qual !== 'quem') campo.focus();
    }
    function pergunta(texto, opcoes) {
      return '<p class="ms-pergunta">' + texto + '</p><div class="ms-botoes">' + opcoes.map(function (o, k) { return '<button type="button" class="botao' + (k ? '' : ' pri') + '" data-r="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>';
    }
    function proxima() {
      i++; r = {};
      if (i >= fila.length) { f.fechar(); mudou(); aviso('A Entrada está vazia.'); return; }
      passo('acao');
    }
    function fechar(t) {
      var urg = t.prazo && diasAte(t.prazo) <= URGENTE_DIAS;
      if (r.importa) t.q = urg ? 1 : 2; else t.q = (urg || t.para) ? 3 : 4;
      mudou(true);
      proxima();
    }
    f.corpo.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-r]'); if (!b) return;
      var v = b.getAttribute('data-r'), caixa = f.corpo.querySelector('.ms-tri'), qual = caixa.getAttribute('data-passo'), t = tarefa(fila[i]);
      if (!t) return proxima();
      if (qual === 'acao') { if (v === 'sim') passo('dois'); else if (v === 'algumdia') { t.q = 4; mudou(true); proxima(); } else { E.tarefas = E.tarefas.filter(function (x) { return x.id !== t.id; }); mudou(true); proxima(); } }
      else if (qual === 'dois') passo(v === 'agora' ? 'fazer2' : 'quem');
      else if (qual === 'fazer2') { if (v === 'feito') { t.feito = true; t.feitoEm = hoje(); t.q = 1; mudou(true); proxima(); } else passo('quem'); }
      else if (qual === 'quem') { if (v === 'outro') { var p = f.corpo.querySelector('[data-tri="para"]').value.trim(); t.para = p || 'alguém'; } passo('importa'); }
      else if (qual === 'importa') { r.importa = v === 'sim'; passo('prazo'); }
      else if (qual === 'prazo') {
        var dt = f.corpo.querySelector('[data-tri="data"]').value;
        t.prazo = dt || (v === 'hoje' ? hoje() : v === 'amanha' ? somarDias(hoje(), 1) : v === 'semana' ? somarDias(hoje(), 6 - ((dataDe(hoje()).getDay() + 6) % 7)) : '');
        passo('area');
      }
      else if (qual === 'area') { t.area = v; passo('proximo'); }
      else if (qual === 'proximo') { t.proximo = f.corpo.querySelector('[data-tri="proximo"]').value.trim(); fechar(t); }
    });
    passo('acao');
  }

  /* Planejar o dia: Ivy Lee (seis, em ordem) ou 1-3-5 */
  function planejar() {
    var d = diaDe(hoje());
    var escolha = d.plano.slice();
    var forma = S.sub.forma || 'seis';
    var f = folha('Planejar o dia', extenso(hoje()), '', true);
    function tamanho(t) { return !t.min ? 'media' : t.min >= 90 ? 'grande' : t.min >= 30 ? 'media' : 'pequena'; }
    function pintarF() {
      var cand = abertas().filter(function (t) { return t.q >= 1 && t.q <= 3 && !(t.dia && t.dia > hoje()); }).sort(function (a, b) { return nota(b) - nota(a); });
      var conta = { grande: 0, media: 0, pequena: 0 };
      escolha.forEach(function (id) { var t = tarefa(id); if (t) conta[tamanho(t)]++; });
      var h = '<div class="ms-chips">' + [['seis', 'Seis, em ordem (Ivy Lee)'], ['135', '1 grande, 3 médias, 5 pequenas']].map(function (o) {
        return '<button type="button" class="chip' + (forma === o[0] ? ' on' : '') + '" data-forma="' + o[0] + '" aria-pressed="' + (forma === o[0]) + '">' + o[1] + '</button>';
      }).join('') + '</div>';
      h += '<p class="ms-meta">' + (forma === 'seis' ? escolha.length + ' de 6' : conta.grande + ' de 1 grande · ' + conta.media + ' de 3 médias · ' + conta.pequena + ' de 5 pequenas') + '. A primeira é o sapo.</p>';
      h += '<ol class="ms-lista ms-escolha">' + cand.map(function (t) {
        var k = escolha.indexOf(t.id);
        return '<li class="ms-t"><button type="button" class="ms-caixa' + (k >= 0 ? ' feita' : '') + '" data-esc="' + t.id + '" aria-pressed="' + (k >= 0) + '" aria-label="' + esc(t.titulo) + '"></button><div class="ms-t-corpo"><span class="ms-t-titulo">' + (k >= 0 ? '<b>' + (k + 1) + '.</b> ' : '') + esc(t.titulo) + '</span><span class="ms-meta">' + esc(porque(t)) + (forma === '135' ? ' · ' + tamanho(t) : '') + '</span></div></li>';
      }).join('') + '</ol><div class="ms-botoes"><button type="button" class="botao pri" data-plan="ok">Este é o plano</button></div>';
      f.corpo.innerHTML = h;
    }
    f.corpo.addEventListener('click', function (ev) {
      var b;
      if ((b = ev.target.closest('[data-forma]'))) { forma = S.sub.forma = b.getAttribute('data-forma'); pintarF(); return; }
      if ((b = ev.target.closest('[data-esc]'))) {
        var id = b.getAttribute('data-esc'), k = escolha.indexOf(id);
        if (k >= 0) escolha.splice(k, 1);
        else if (forma === 'seis' ? escolha.length < 6 : escolha.length < 9) escolha.push(id);
        else aviso(forma === 'seis' ? 'Seis já é o dia inteiro.' : 'Nove já é o dia inteiro.');
        pintarF(); return;
      }
      if (ev.target.closest('[data-plan]')) { d.plano = escolha.slice(); d.sapo = escolha[0] || ''; f.fechar(); mudou(); }
    });
    pintarF();
  }

  /* Fechar o dia: o Registro (Sêneca e Franklin) */
  function fecharDia() {
    var d = diaDe(hoje()), reg = E.registros[hoje()] || {};
    var feitasHoje = E.tarefas.filter(function (t) { return t.feito && t.feitoEm === hoje(); });
    var sugestao = feitasHoje.map(function (t) { return t.titulo; }).join('; ');
    var h = '<p class="ms-meta">' + (feitasHoje.length ? feitasHoje.length + ' feitas hoje' : 'Nenhuma tarefa marcada hoje') + (S.modo === 'caderno' ? ' · vai para o Registro do dia, no caderno' : ' · fica neste aparelho') + '</p>' +
      '<label class="ms-campo-rot">A frase do dia<input class="ms-campo" data-reg="frase" value="' + esc(d.fez || '') + '" autocomplete="off"></label>' +
      F.REGISTRO.map(function (c) {
        var v = reg[c[0]] || (c[0] === 'pratiquei' ? sugestao : '');
        return '<label class="ms-campo-rot">' + c[1] + '<textarea class="ms-campo" rows="2" data-reg="' + c[0] + '">' + esc(v) + '</textarea></label>';
      }).join('') + '<div class="ms-botoes"><button type="button" class="botao pri" data-guardar>Guardar o dia</button></div>';
    var f = folha('Fechar o dia', extenso(hoje()), h, true);
    f.corpo.addEventListener('click', function (ev) {
      if (!ev.target.closest('[data-guardar]')) return;
      var campos = {};
      f.corpo.querySelectorAll('[data-reg]').forEach(function (el) { campos[el.getAttribute('data-reg')] = el.value.trim(); });
      d.fez = campos.frase || d.fez;
      var tags = {};
      feitasHoje.forEach(function (t) { if (t.area) tags[t.area] = 1; });
      if (S.modo === 'caderno') {
        fetch('/api/mesa/registro', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify({ dia: hoje(), campos: campos, frase: campos.frase, tags: Object.keys(tags) }) })
          .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.erro || 'Não gravei.'); return j; }); })
          .then(function () { f.fechar(); mudou(); aviso('O Registro de hoje está no caderno.'); })
          .catch(function (e) { E.registros[hoje()] = campos; f.fechar(); mudou(); aviso(e.message + ' Ficou guardado na Mesa.'); });
      } else {
        E.registros[hoje()] = campos; f.fechar(); mudou(); aviso('Guardado.');
      }
    });
  }

  /* Destravar: o primeiro movimento, o se-então, cinco minutos */
  function destravar(t) {
    var h = '<p class="ms-texto">' + esc(t.titulo) + '</p>' +
      '<label class="ms-campo-rot">O primeiro movimento do corpo, o menor possível<input class="ms-campo" data-d="proximo" value="' + esc(t.proximo) + '" placeholder="abrir o arquivo, pegar a trena, escrever uma frase" autocomplete="off"></label>' +
      '<label class="ms-campo-rot">Quando<input class="ms-campo" data-d="quando" placeholder="agora · depois do café · às 15h" autocomplete="off"></label>' +
      '<p class="ms-meta">Se travar no meio, o próximo passo fica ainda menor. Pedir ajuda cedo também é um passo.</p>' +
      '<div class="ms-botoes"><button type="button" class="botao pri" data-d5>Cinco minutos, agora</button><button type="button" class="botao" data-dg>Só guardar</button></div>';
    var f = folha('Destravar', 'Um passo pequeno', h);
    f.corpo.addEventListener('click', function (ev) {
      var cinco = ev.target.closest('[data-d5]'), so = ev.target.closest('[data-dg]');
      if (!cinco && !so) return;
      var p = f.corpo.querySelector('[data-d="proximo"]').value.trim(), q = f.corpo.querySelector('[data-d="quando"]').value.trim();
      if (p) t.proximo = p;
      if (q && !/^agora$/i.test(q)) t.notas = (t.notas ? t.notas + '\n' : '') + 'Quando: ' + q;
      f.fechar();
      mudou(true);
      if (cinco) { S.forcada = t.id; ir('agora'); focar(t.id, 5); } else pintar();
    });
  }

  /* Pedir à I.A.: um pedido pronto, com o contexto, para colar no Claude (a I.A. explica, a mão é sua) */
  function pedidoIA(t) {
    var a = area(t.area);
    var linhas = [
      'Estou com uma tarefa e quero ajuda para começar. Não faça por mim: explique, e eu faço.',
      '',
      'A tarefa: ' + t.titulo,
      t.proximo ? 'O primeiro passo que pensei: ' + t.proximo : '',
      a ? 'A área: ' + a.nome + (a.para ? ' (' + a.para + ')' : '') : '',
      E.centro ? 'O que segura tudo (o meu centro): ' + E.centro.replace(/\s+/g, ' ') : '',
      t.prazo ? 'O prazo: ' + F.br(t.prazo) + ' (' + quando(t.prazo) + ')' : '',
      t.min ? 'O tempo que eu tenho para ela: ' + minutos(t.min) : '',
      t.notas ? 'Notas: ' + t.notas.replace(/\n/g, ' / ') : '',
      (t.passos || []).length ? 'Passos que já escrevi: ' + t.passos.map(function (p) { return (p.f ? '[feito] ' : '') + p.t; }).join('; ') : '',
      '',
      'Me ajude assim:',
      '1. Divida em três passos pequenos; o primeiro tem de caber em cinco minutos.',
      '2. Diga o que eu preciso saber antes de começar, e onde ler (texto, não vídeo).',
      '3. Se houver um risco ou um erro comum, diga qual.',
    ].filter(function (l, i, arr) { return l || (arr[i - 1] && arr[i - 1] !== ''); });
    var texto = linhas.join('\n');
    var f = folha('Pedir à I.A.', 'Um pedido pronto', '<textarea class="ms-campo ms-pedido" rows="14" readonly>' + esc(texto) + '</textarea><div class="ms-botoes"><button type="button" class="botao pri" data-copiar>Copiar</button><a class="botao" href="https://claude.ai/new" target="_blank" rel="noopener">Abrir o Claude</a></div>');
    f.corpo.addEventListener('click', function (ev) {
      if (!ev.target.closest('[data-copiar]')) return;
      var ta = f.corpo.querySelector('textarea');
      (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(texto) : Promise.reject())
        .catch(function () { ta.select(); document.execCommand('copy'); })
        .then(function () { aviso('Copiado.'); });
    });
  }

  /* editar uma tarefa inteira */
  function editar(t) {
    var h = '<label class="ms-campo-rot">Tarefa<input class="ms-campo" data-e="titulo" value="' + esc(t.titulo) + '" autocomplete="off"></label>' +
      '<div class="ms-duas"><label class="ms-campo-rot">Prazo<input type="date" class="ms-campo" data-e="prazo" value="' + esc(t.prazo) + '"></label><label class="ms-campo-rot">Marcada para o dia<input type="date" class="ms-campo" data-e="dia" value="' + esc(t.dia) + '"></label></div>' +
      '<div class="ms-duas"><label class="ms-campo-rot">Área<select class="ms-campo" data-e="area"><option value="">nenhuma</option>' + E.areas.map(function (a) { return '<option value="' + a.id + '"' + (t.area === a.id ? ' selected' : '') + '>' + esc(a.nome) + '</option>'; }).join('') + '</select></label>' +
      '<label class="ms-campo-rot">Minutos<input type="number" min="0" step="5" class="ms-campo" data-e="min" value="' + (t.min || '') + '"></label></div>' +
      '<div class="ms-duas"><label class="ms-campo-rot">Energia<select class="ms-campo" data-e="energia"><option value="">—</option>' + Object.keys(ENERGIA_NOME).map(function (k) { return '<option value="' + k + '"' + (t.energia === k ? ' selected' : '') + '>' + ENERGIA_NOME[k] + '</option>'; }).join('') + '</select></label>' +
      '<label class="ms-campo-rot">Onde<select class="ms-campo" data-e="contexto"><option value="">qualquer</option>' + LUGARES.map(function (l) { return '<option' + (t.contexto === l ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select></label></div>' +
      '<label class="ms-campo-rot">Para quem (no Passar)<input class="ms-campo" data-e="para" value="' + esc(t.para) + '" autocomplete="off"></label>' +
      '<label class="ms-campo-rot">Próximo passo<input class="ms-campo" data-e="proximo" value="' + esc(t.proximo) + '" autocomplete="off"></label>' +
      '<label class="ms-campo-rot">Notas<textarea class="ms-campo" rows="3" data-e="notas">' + esc(t.notas) + '</textarea></label>' +
      '<div class="ms-botoes"><button type="button" class="botao pri" data-ok>Guardar</button></div>';
    var f = folha('Editar', QUAD[t.q] ? QUAD[t.q][0] : 'Entrada', h, true);
    f.corpo.addEventListener('click', function (ev) {
      if (!ev.target.closest('[data-ok]')) return;
      f.corpo.querySelectorAll('[data-e]').forEach(function (el) {
        var k = el.getAttribute('data-e'), v = el.value.trim();
        t[k] = k === 'min' ? (parseInt(v, 10) || 0) : v;
      });
      f.fechar(); mudou();
    });
  }
  function passos(t) {
    var h = '<p class="ms-texto">' + esc(t.titulo) + '</p><p class="ms-meta">Um passo por linha, na ordem em que precisam acontecer (o que tem de entrar primeiro).</p>' +
      '<textarea class="ms-campo" rows="8" data-p>' + esc((t.passos || []).map(function (p) { return (p.f ? '[x] ' : '') + p.t; }).join('\n')) + '</textarea><div class="ms-botoes"><button type="button" class="botao pri" data-ok>Guardar</button></div>';
    var f = folha('Os passos', 'Partir em pedaços', h);
    f.corpo.addEventListener('click', function (ev) {
      if (!ev.target.closest('[data-ok]')) return;
      t.passos = f.corpo.querySelector('[data-p]').value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
        var m = /^\[x\]\s*(.*)$/i.exec(l); return m ? { t: m[1], f: true } : { t: l, f: false };
      });
      f.fechar(); mudou();
    });
  }
  function editarRoupa(r) {
    var h = '<label class="ms-campo-rot">Peça<input class="ms-campo" data-e="nome" value="' + esc(r.nome) + '"></label>' +
      '<div class="ms-duas"><label class="ms-campo-rot">Tipo<input class="ms-campo" data-e="tipo" value="' + esc(r.tipo) + '" placeholder="camisa, calça…"></label><label class="ms-campo-rot">Cor<input class="ms-campo" data-e="cor" value="' + esc(r.cor) + '"></label></div>' +
      '<div class="ms-duas"><label class="ms-campo-rot">Estação<input class="ms-campo" data-e="estacao" value="' + esc(r.estacao) + '"></label><label class="ms-campo-rot">Ocasião<input class="ms-campo" data-e="ocasiao" value="' + esc(r.ocasiao) + '"></label></div>' +
      '<div class="ms-duas"><label class="ms-campo-rot">Custo (R$)<input type="number" min="0" step="0.01" class="ms-campo" data-e="custo" value="' + (r.custo == null ? '' : r.custo) + '"></label><label class="ms-campo-rot">Usos<input type="number" min="0" class="ms-campo" data-e="usos" value="' + (r.usos || 0) + '"></label></div>' +
      '<div class="ms-duas"><label class="ms-campo-rot">Estado<select class="ms-campo" data-e="estado">' + ['ok', 'lavar', 'consertar', 'doar'].map(function (s) { return '<option' + (r.estado === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></label>' +
      '<label class="ms-campo-rot ms-marcar"><input type="checkbox" data-e="capsula"' + (r.capsula ? ' checked' : '') + '> Na cápsula</label></div>' +
      '<div class="ms-botoes"><button type="button" class="botao pri" data-ok>Guardar</button><button type="button" class="botao leve" data-x>Apagar</button></div>';
    var f = folha('A peça', 'Roupas', h);
    f.corpo.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-x]')) { E.roupas = E.roupas.filter(function (x) { return x.id !== r.id; }); f.fechar(); mudou(); return; }
      if (!ev.target.closest('[data-ok]')) return;
      f.corpo.querySelectorAll('[data-e]').forEach(function (el) {
        var k = el.getAttribute('data-e');
        r[k] = k === 'capsula' ? el.checked : (k === 'custo' ? F.numero(el.value) : k === 'usos' ? (parseInt(el.value, 10) || 0) : el.value.trim());
      });
      f.fechar(); mudou();
    });
  }
  function perguntarValor(titulo, rotulos, aoOk) {
    var h = rotulos.map(function (r, i) { return '<label class="ms-campo-rot">' + r[0] + '<input class="ms-campo" data-v="' + i + '"' + (r[1] ? ' type="' + r[1] + '"' : '') + ' autocomplete="off"></label>'; }).join('') +
      '<div class="ms-botoes"><button type="button" class="botao pri" data-ok>Guardar</button></div>';
    var f = folha(titulo, 'A Mesa', h);
    var primeiro = f.corpo.querySelector('input'); if (primeiro) primeiro.focus();
    f.corpo.addEventListener('click', function (ev) {
      if (!ev.target.closest('[data-ok]')) return;
      var vs = [].map.call(f.corpo.querySelectorAll('[data-v]'), function (el) { return el.value.trim(); });
      if (aoOk(vs) !== false) { f.fechar(); mudou(); }
    });
  }

  /* ---------- levar e trazer o arquivo ---------- */
  function levar() {
    var texto = F.paraMarkdown(E);
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([texto], { type: 'text/markdown;charset=utf-8' }));
    a.download = 'A Mesa.md';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function trazer() {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.md,.txt,.json,text/markdown';
    inp.addEventListener('change', function () {
      var arq = inp.files && inp.files[0]; if (!arq) return;
      arq.text().then(function (t) {
        var novo = /^\s*\{/.test(t) ? Object.assign(F.vazio(), JSON.parse(t)) : F.deMarkdown(t);
        var n = novo.tarefas.length + novo.livros.length + novo.roupas.length + novo.dinheiro.lancamentos.length;
        if (!window.confirm('Trazer "' + arq.name + '" (' + n + ' coisas) no lugar do que está nesta Mesa? O que está aqui agora vai para um arquivo baixado antes.')) return;
        levar();
        E = novo; mudou(); aviso('Trazido.');
      }).catch(function () { aviso('Não consegui ler este arquivo.'); });
    });
    inp.click();
  }

  /* ============================================================
     PINTAR
     ============================================================ */
  var vistaEl, navEl, peEl, previaEl, entradaEl, avisoEl;
  function montar() {
    raiz.innerHTML =
      '<form class="ms-entrada" autocomplete="off"><label class="ms-sr" for="ms-linha">Pôr na mesa</label>' +
      '<input id="ms-linha" class="ms-linha" enterkeyhint="done" spellcheck="true"><button type="submit" class="botao pri ms-por" aria-label="Pôr na mesa"><span class="ms-por-longo">Pôr na mesa</span><span class="ms-por-curto" aria-hidden="true">Pôr</span></button>' +
      '<p class="ms-previa" id="ms-previa" aria-live="polite"></p></form>' +
      '<nav class="explorador ms-ver" role="tablist" aria-label="A Mesa"></nav>' +
      '<div class="ms-central-opcoes"><button type="button" class="ms-link" data-acao="central-vistas" aria-expanded="false" id="ms-mais-vistas">Outras vistas</button>' +
      '<details class="ms-central-ajustes"><summary>Ajustar visão</summary><div class="ms-central-ajustes-corpo"><label>Quantidade de informação<select data-central-pref="detalhe"><option value="enxuto">Enxuta</option><option value="amplo">Detalhada</option></select></label><label>Organização<select data-central-pref="layout"><option value="paineis">Painéis</option><option value="lista">Lista</option></select></label></div></details></div>' +
      '<div class="ms-vista" id="ms-vista" role="tabpanel"></div>' +
      '<footer class="ms-pe" id="ms-pe"></footer><p class="ms-aviso" id="ms-aviso" role="status" aria-live="polite"></p>';
    vistaEl = raiz.querySelector('#ms-vista'); navEl = raiz.querySelector('.ms-ver'); peEl = raiz.querySelector('#ms-pe');
    previaEl = raiz.querySelector('#ms-previa'); entradaEl = raiz.querySelector('#ms-linha'); avisoEl = raiz.querySelector('#ms-aviso');
    raiz.querySelector('.ms-entrada').addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (por(entradaEl.value)) { entradaEl.value = ''; previaEl.innerHTML = ''; }
    });
    entradaEl.addEventListener('input', function () {
      var x = entender(entradaEl.value, S.vista);
      previaEl.innerHTML = x ? x.chips.map(function (c) { return '<span class="ms-selo">' + esc(c) + '</span>'; }).join('') : '';
    });
    peEl.innerHTML = '<span class="ms-meta">O arquivo da Mesa</span>' + botao('Levar', 'levar', '', 'leve') + botao('Trazer', 'trazer', '', 'leve');
    var dataEl = document.getElementById('ms-data');
    if (dataEl) { var d = extenso(hoje()); dataEl.textContent = d.charAt(0).toUpperCase() + d.slice(1); }
  }
  var DICAS = {
    agora: 'Pôr na mesa: uma tarefa, #área, @lugar, amanhã, 30 min, !',
    matriz: 'Pôr na mesa: ! importante, !! urgente, para Fulano',
    dia: 'Pôr na mesa: uma tarefa para hoje, hoje 30 min',
    semana: 'Pôr na mesa: o que vier vai para a Entrada',
    mandala: 'Pôr na mesa: uma tarefa com #área',
    dinheiro: 'Pôr na mesa: −35 mercado · +300 freela · −40 cinema #livre',
    roupas: 'Pôr na mesa: uma peça, camisa de linho R$ 120',
    livros: 'Pôr na mesa: um livro, título — autor',
    colecoes: 'Pôr na mesa: um item da coleção aberta',
    guia: 'Pôr na mesa: o que vier',
  };
  function pintar() {
    if (!vistaEl) montar();
    var tabFocada = document.activeElement && navEl.contains(document.activeElement) ? document.activeElement.getAttribute('data-v') : null;
    var ehCentral = CENTRAIS.indexOf(S.vista) >= 0;
    /* Consultar a central não promove prazos nem grava A Mesa.md. */
    if (!ehCentral && promover()) mudou(true);
    var mais = S.maisVistas || !ehCentral;
    navEl.innerHTML = VISTAS.map(function (v) {
      var ativa = S.vista === v[0], escondida = !mais && CENTRAIS.indexOf(v[0]) < 0;
      return '<button type="button" role="tab" class="chip ms-central-tab" id="ms-tab-' + v[0] + '" data-acao="ir" data-v="' + v[0] + '" aria-controls="ms-vista" aria-selected="' + ativa + '" tabindex="' + (ativa ? '0' : '-1') + '"' + (escondida ? ' hidden' : '') + '>' + v[1] + '</button>';
    }).join('');
    if (tabFocada) { var restaurarTab = navEl.querySelector('[data-v="' + tabFocada + '"]:not([hidden])'); if (restaurarTab) restaurarTab.focus({ preventScroll: true }); }
    raiz.querySelector('.ms-entrada').hidden = ehCentral;
    peEl.hidden = ehCentral;
    var maisEl = raiz.querySelector('#ms-mais-vistas');
    maisEl.textContent = mais ? 'Recolher outras vistas' : 'Outras vistas';
    maisEl.setAttribute('aria-expanded', String(mais));
    raiz.querySelectorAll('[data-central-pref]').forEach(function (el) { el.value = PREF[el.getAttribute('data-central-pref')] || (el.getAttribute('data-central-pref') === 'layout' ? 'paineis' : 'enxuto'); });
    vistaEl.setAttribute('aria-labelledby', 'ms-tab-' + S.vista);
    entradaEl.placeholder = DICAS[S.vista] || 'Pôr na mesa';
    var fn = { central: vistaCentral, mapa: vistaCentral, acervo: vistaCentral, agora: vistaAgora, matriz: vistaMatriz, dia: vistaDia, semana: vistaSemana, mandala: vistaMandala, dinheiro: vistaDinheiro, roupas: vistaRoupas, livros: vistaLivros, colecoes: vistaColecoes, guia: vistaGuia }[S.vista] || vistaAgora;
    var foco = document.activeElement && vistaEl.contains(document.activeElement) && document.activeElement.matches('input[type="search"], .ms-campo, .ms-escrever') ? { sel: seletor(document.activeElement), ini: document.activeElement.selectionStart } : null;
    var acaoFocada = document.activeElement && vistaEl.contains(document.activeElement) ? document.activeElement.closest('[data-acao]') : null;
    var gestoFocado = acaoFocada ? { acao: acaoFocada.getAttribute('data-acao'), id: acaoFocada.getAttribute('data-id'), valor: acaoFocada.getAttribute('data-v') } : null;
    var chegou = S.vistaAntes !== S.vista;
    S.vistaAntes = S.vista;
    vistaEl.innerHTML = fn();
    vistaEl.setAttribute('data-vista', S.vista);
    if (foco) { var el = vistaEl.querySelector(foco.sel); if (el) { el.focus(); try { el.setSelectionRange(foco.ini, foco.ini); } catch (e) {} } }
    if (!foco && gestoFocado) { var gestoNovo = [].slice.call(vistaEl.querySelectorAll('[data-acao]')).filter(function (el) { return el.getAttribute('data-acao') === gestoFocado.acao && el.getAttribute('data-id') === gestoFocado.id && el.getAttribute('data-v') === gestoFocado.valor; })[0]; if (gestoNovo) gestoNovo.focus({ preventScroll: true }); }
    if (S.timer) { var n = document.getElementById('ms-nivel'); if (n) n.style.transform = 'scaleY(' + Math.max(0, restaMs() / S.timer.dur).toFixed(4) + ')'; }
    if (chegou && S.montada) compor();
    if (S.revelar) { revelarEm(vistaEl.querySelector('[data-revela-foco]')); S.revelar = null; }
    S.montada = true;
    onde();
  }
  function vistaCentral() { return window.MesaCentral ? window.MesaCentral.render(S.vista, { detalhe: PREF.detalhe || 'enxuto', layout: PREF.layout || 'paineis', filtro: S.sub.frente || '', q: S.sub.q || '' }) : '<p class="ms-texto">A entrada central ainda não foi carregada.</p>'; }
  /* a página que chega se compõe uma vez: o título sobe pela máscara, os painéis pousam um depois do outro */
  function compor() {
    if (CALMO) return;
    revelarEm(vistaEl.querySelector('[data-revela]'));
    [].slice.call(vistaEl.children, 1, 9).forEach(function (el, i) {
      if (el.animate) el.animate([{ transform: 'translateY(14px)', clipPath: 'inset(0 0 100% 0 round 24px)' }, { transform: 'none', clipPath: 'inset(0 0 0% 0 round 24px)' }],
        { duration: 520, delay: 60 + i * 55, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    });
  }
  /* o título que sobe por uma máscara, sem esmaecer (a regra do Shelf Hero) */
  function revelarEm(el) {
    if (!el || CALMO || !el.animate) return;
    el.innerHTML = '<span class="ms-mascara"><span>' + el.innerHTML + '</span></span>';
    el.firstChild.firstChild.animate([{ transform: 'translateY(105%)' }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
  }
  function seletor(el) {
    var attrs = ['data-filtro', 'data-campo-dia', 'data-resultado', 'data-livro-pag', 'data-livro-tot'];
    for (var i = 0; i < attrs.length; i++) if (el.hasAttribute(attrs[i])) return '[' + attrs[i] + '="' + el.getAttribute(attrs[i]) + '"]';
    return el.id ? '#' + el.id : 'input';
  }
  function onde() {
    var el = document.getElementById('ms-onde');
    if (!el) return;
    el.textContent = S.modo === 'caderno'
      ? 'No caderno, A Mesa.md' + (S.erro ? ' · ' + S.erro : S.pendente || S.gravando ? ' · guardando…' : S.guardadoEm ? ' · guardada às ' + S.guardadoEm : '')
      : 'Neste aparelho' + (window.Perfil && window.Perfil.ehPublico && window.Perfil.ehPublico() ? ' · o site não guarda nada seu' : '');
  }
  var avisoT = null;
  function aviso(t) {
    if (!avisoEl) return;
    avisoEl.textContent = t; avisoEl.classList.add('on');
    clearTimeout(avisoT); avisoT = setTimeout(function () { avisoEl.classList.remove('on'); }, 2600);
  }

  /* ============================================================
     OS GESTOS
     ============================================================ */
  function ir(vista, extra) {
    var mesma = vista === S.vista;
    S.vista = VISTAS.some(function (v) { return v[0] === vista; }) ? vista : 'agora';
    S.sub = Object.assign({}, extra || {});
    var h = '#ver=' + S.vista + Object.keys(S.sub).filter(function (k) { return S.sub[k] && k !== 'q' && k !== 'livro'; }).map(function (k) { return '&' + k + '=' + encodeURIComponent(S.sub[k]); }).join('');
    if (location.hash !== h) history[mesma ? 'replaceState' : 'pushState'](null, '', h);
    pintar();
    /* ao escolher uma vista, a página sobe até o explorador grudar no alto: a vista ganha a tela inteira */
    if (!mesma && S.montada) {
      var preso = parseFloat(getComputedStyle(navEl).top) || 64;
      var alvo = Math.max(0, scrollY + navEl.getBoundingClientRect().top - preso);
      if (Math.abs(scrollY - alvo) > 4) window.scrollTo({ top: alvo, behavior: CALMO ? 'auto' : 'smooth' });
    }
    if (window.Perfil && window.Perfil.lugarMudou) try { window.Perfil.lugarMudou(); } catch (e) {}
  }
  function lerEndereco() {
    var p = new URLSearchParams(location.hash.slice(1));
    var v = p.get('ver') || S.vista;
    S.vista = VISTAS.some(function (x) { return x[0] === v; }) ? v : 'agora';
    S.sub = {};
    p.forEach(function (val, k) { if (k !== 'ver') S.sub[k] = val; });
  }
  function feito(t) {
    t.feito = true; t.feitoEm = hoje();
    if (S.timer && S.timer.id === t.id) {
      t.focoMin = (t.focoMin || 0) + Math.max(1, Math.round((S.timer.dur - restaMs()) / 60000));
      S.timer = null; gravarLocal(CHAVE_TIMER, null); clearInterval(tique); fecharImersao();
    }
    S.pular = S.pular.filter(function (x) { return x !== t.id; });
    if (S.forcada === t.id) S.forcada = '';
    S.revelar = true;
    var li = raiz.querySelector('.ms-t[data-id="' + t.id + '"] .ms-t-titulo, .ms-foco[data-id="' + t.id + '"] .ms-foco-titulo');
    if (li && !CALMO) {
      li.classList.add('riscando');
      setTimeout(function () { mudou(); aviso('Feito.'); }, 420);
    } else { mudou(); aviso('Feito.'); }
  }

  raiz.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-acao]');
    if (!b || !raiz.contains(b)) return;
    var a = b.getAttribute('data-acao'), id = b.getAttribute('data-id'), v = b.getAttribute('data-v');
    var t = id ? tarefa(id) : null;
    switch (a) {
      case 'ir': ir(v || 'central'); break;
      case 'central-vistas': S.maisVistas = !(S.maisVistas || CENTRAIS.indexOf(S.vista) < 0); if (!S.maisVistas && CENTRAIS.indexOf(S.vista) < 0) ir('central'); else pintar(); break;
      case 'central-filtrar': S.sub.frente = v || ''; pintar(); break;
      case 'central-reler': if (window.MesaCentral) window.MesaCentral.atualizar(); break;
      case 'central-registro': if (window.MesaCentral && window.MesaCentral.registro() && window.Perfil && window.Perfil.abrirNota) window.Perfil.abrirNota({ rel: window.MesaCentral.registro() }); break;
      case 'feito': if (t) feito(t); break;
      case 'desfazer': if (t) { t.feito = false; t.feitoEm = ''; mudou(); } break;
      case 'abrir': S.aberto[id] = !S.aberto[id]; pintar(); break;
      case 'mover': if (t) { t.q = +v; mudou(); aviso('Em ' + QUAD[t.q][0] + '.'); } break;
      case 'apagar': if (t && window.confirm('Apagar "' + t.titulo + '"?')) { E.tarefas = E.tarefas.filter(function (x) { return x.id !== t.id; }); mudou(); } break;
      case 'editar': if (t) editar(t); break;
      case 'passos': if (t) passos(t); break;
      case 'passo': if (t) { var p = t.passos[+b.getAttribute('data-i')]; if (p) { p.f = !p.f; mudou(); } } break;
      case 'esta': if (t) { S.forcada = t.id; S.revelar = true; ir('agora'); } break;
      case 'nodia': if (t) { var d = diaDe(hoje()); if (d.plano.indexOf(t.id) < 0) d.plano.push(t.id); if (!d.sapo) d.sapo = t.id; mudou(); aviso('No plano de hoje.'); } break;
      case 'pular': if (id) { if (S.forcada === id) S.forcada = ''; S.pular.push(id); S.revelar = true; pintar(); } break;
      case 'focar': if (t) focar(t.id, +v || 25); break;
      case 'imersao': imersao(); break;
      case 'pausar': pausar(); if (S.timer) ligarTique(); break;
      case 'parar': if (S.timer) { var tt = tarefa(S.timer.id), gasto = Math.round((S.timer.dur - restaMs()) / 60000); if (tt && gasto > 0) tt.focoMin = (tt.focoMin || 0) + gasto; S.timer = null; gravarLocal(CHAVE_TIMER, null); clearInterval(tique); fecharImersao(); mudou(); } break;
      case 'pausa5': aviso('Cinco minutos longe da tela.'); break;
      case 'destravar': if (t) destravar(t); break;
      case 'ia': if (t) pedidoIA(t); break;
      case 'ctx': { var campo = b.getAttribute('data-campo'); S.ctx[campo] = campo === 'min' ? +v : v; gravarLocal(CHAVE_CTX, S.ctx); S.pular = []; S.revelar = true; pintar(); break; }
      case 'triagem': triagem(); break;
      case 'filtro': { var c = b.getAttribute('data-campo'); S.sub[c] = v; if (c === 'situacao') delete S.sub.livro; ir(S.vista, S.sub); break; }
      case 'quadmovel': S.quadMovel = +b.getAttribute('data-q'); pintar(); break;
      case 'planejar': planejar(); break;
      case 'subir': { var dd = diaDe(hoje()), k = dd.plano.indexOf(id); if (k > 0) { dd.plano.splice(k, 1); dd.plano.splice(k - 1, 0, id); if (k - 1 === 0) dd.sapo = id; mudou(); } break; }
      case 'tirardodia': { var d2 = diaDe(hoje()); d2.plano = d2.plano.filter(function (x) { return x !== id; }); if (d2.sapo === id) d2.sapo = d2.plano[0] || ''; mudou(); break; }
      case 'habito': { var dia = b.getAttribute('data-dia') || hoje(), m = E.marcas[dia] || (E.marcas[dia] = []), j = m.indexOf(id); if (j >= 0) m.splice(j, 1); else m.push(id); mudou(); break; }
      case 'fechardia': fecharDia(); break;
      case 'resultado': { var s = semanaDe(F.semana(hoje())), i = +b.getAttribute('data-i'); s.resultados[i] = s.resultados[i] || { t: '', f: false }; s.resultados[i].f = !s.resultados[i].f; mudou(); break; }
      case 'revisada': semanaDe(F.semana(hoje())).revisada = hoje(); mudou(); aviso('Semana revista.'); break;
      case 'marea': S.sub.marea = S.sub.marea === id ? '' : id; S.revelar = true; pintar(); break;
      case 'acaoarea': { var nt = F.novaTarefa({ id: F.novoId(E, 't'), titulo: v, area: b.getAttribute('data-area'), q: 2, criada: hoje() }); E.tarefas.push(nt); mudou(); aviso('Em Marcar.'); break; }
      case 'mes': { var md = dataDe(S.mes + '-15'); md.setMonth(md.getMonth() + (+v)); S.mes = F.isoDeData(md).slice(0, 7); pintar(); break; }
      case 'tirarlanc': E.dinheiro.lancamentos = E.dinheiro.lancamentos.filter(function (x) { return x.id !== id; }); mudou(); break;
      case 'tirarfixo': E.dinheiro.fixos = E.dinheiro.fixos.filter(function (x) { return x.id !== id; }); mudou(); break;
      case 'tirarmeta': E.dinheiro.metas = E.dinheiro.metas.filter(function (x) { return x.id !== id; }); mudou(); break;
      case 'novofixo': perguntarValor('Novo fixo', [['Nome'], ['Valor por mês (ou por ano, escrevendo "ano" depois do valor)'], ['Vence em', 'date']], function (vs) {
        if (!vs[0]) return false;
        E.dinheiro.fixos.push({ id: F.novoId(E, 'f'), nome: vs[0], valor: F.numero(vs[1]), cada: /ano/i.test(vs[1]) ? 'ano' : 'mes', grupo: 'essencial', vence: vs[2] || '' });
      }); break;
      case 'novameta': perguntarValor('Nova meta', [['Meta'], ['Quanto (R$)']], function (vs) {
        if (!vs[0]) return false;
        E.dinheiro.metas.push({ id: F.novoId(E, 'm'), nome: vs[0], alvo: F.numero(vs[1]) || 0, guardado: 0 });
      }); break;
      case 'guardarmeta': { var mt = E.dinheiro.metas.filter(function (x) { return x.id === id; })[0]; if (mt) perguntarValor('Guardar em ' + mt.nome, [['Quanto (R$)']], function (vs) {
        var n = F.numero(vs[0]); if (!n) return false;
        mt.guardado += n;
        E.dinheiro.lancamentos.push({ id: F.novoId(E, 'd'), data: hoje(), valor: -n, grupo: 'futuro', cat: 'guardar', desc: mt.nome });
      }); break; }
      case 'vesti': { var r = E.roupas.filter(function (x) { return x.id === id; })[0]; if (r) { r.usos = (r.usos || 0) + 1; r.ultima = hoje(); mudou(); aviso('+1 uso.'); } break; }
      case 'editarroupa': { var r2 = E.roupas.filter(function (x) { return x.id === id; })[0]; if (r2) editarRoupa(r2); break; }
      case 'livro': { S.sub.livro = id; S.revelar = true; pintar(); var fora = vistaEl.querySelector('.ms-lombada.fora'); if (fora && fora.scrollIntoView) fora.scrollIntoView({ block: 'nearest', inline: 'center', behavior: CALMO ? 'auto' : 'smooth' }); break; }
      case 'situacao': { var l = livros().filter(function (x) { return String(x.id) === id; })[0]; if (l) gravarLivro(l, { situacao: v }); break; }
      case 'proximolivro': {
        var pilha = livros().filter(function (x) { return x.situacao === (S.sub.situacao === 'tenho' ? 'tenho' : 'quero'); });
        if (!pilha.length) { aviso('A pilha está vazia.'); break; }
        var um = pilha[Math.floor(Math.random() * pilha.length)];
        S.sub.livro = um.id; S.revelar = true; pintar();
        var fl = folha(um.titulo, 'O próximo livro', '<p class="ms-texto">' + esc(um.autor || '') + '</p><div class="ms-botoes"><button type="button" class="botao pri" data-ler>Começar a ler</button><button type="button" class="botao" data-outro>Outro</button></div>');
        fl.corpo.addEventListener('click', function (e2) {
          if (e2.target.closest('[data-ler]')) { fl.fechar(); gravarLivro(um, { situacao: 'lendo' }); }
          else if (e2.target.closest('[data-outro]')) { fl.fechar(); var bb = raiz.querySelector('[data-acao="proximolivro"]'); if (bb) bb.click(); }
        });
        break;
      }
      case 'novacolecao': perguntarValor('Nova coleção', [['Nome']], function (vs) {
        if (!vs[0]) return false;
        var c2 = { id: F.novoId(E, 'c'), nome: vs[0], itens: [] }; E.colecoes.push(c2); S.sub.colecao = c2.id;
      }); break;
      case 'estadoitem': E.colecoes.forEach(function (c3) { c3.itens.forEach(function (i2) { if (i2.id === id) i2.estado = v; }); }); mudou(); break;
      case 'tiraritem': E.colecoes.forEach(function (c4) { c4.itens = c4.itens.filter(function (i3) { return i3.id !== id; }); }); mudou(); break;
      case 'levar': levar(); break;
      case 'trazer': trazer(); break;
    }
  });
  raiz.addEventListener('input', function (ev) {
    var el = ev.target;
    if (el.hasAttribute('data-filtro')) { S.sub.q = el.value; pintar(); return; }
    if (el.hasAttribute('data-nota-area')) {
      var a = area(el.getAttribute('data-nota-area')); if (!a) return;
      a.nota = +el.value; var b = el.parentNode.querySelector('b'); if (b) b.textContent = a.nota;
      var cel = raiz.querySelector('.ms-m-area[data-id="' + a.id + '"]'); if (cel) { cel.style.setProperty('--peso', a.nota / 10); cel.classList.toggle('escura', a.nota >= 6); cel.querySelector('.ms-m-nota').textContent = a.nota; }
      mudou(true);
    }
  });
  raiz.addEventListener('change', function (ev) {
    var el = ev.target, k;
    if ((k = el.getAttribute('data-central-pref'))) { var valor = el.value; if ((k === 'layout' && ['lista', 'paineis'].indexOf(valor) >= 0) || (k === 'detalhe' && ['amplo', 'enxuto'].indexOf(valor) >= 0)) { PREF[k] = valor; gravarLocal('mesa.visao.v1', PREF); pintar(); } return; }
    if ((k = el.getAttribute('data-campo-dia'))) { diaDe(hoje())[k] = el.value.trim(); mudou(true); return; }
    if ((k = el.getAttribute('data-resultado')) != null) { var s = semanaDe(F.semana(hoje())), i = +k; s.resultados[i] = s.resultados[i] || { t: '', f: false }; s.resultados[i].t = el.value.trim(); s.resultados = s.resultados.filter(function (r, j) { return r && (r.t || j < 3); }); mudou(true); return; }
    if (el.hasAttribute('data-centro')) { E.centro = el.value.trim(); mudou(true); return; }
    if ((k = el.getAttribute('data-livro-pag')) || (k = el.getAttribute('data-livro-tot'))) {
      var l = livros().filter(function (x) { return String(x.id) === k; })[0]; if (!l) return;
      var n = Math.max(0, parseInt(el.value, 10) || 0);
      gravarLivro(l, el.hasAttribute('data-livro-pag') ? { pagina: n } : { paginas: n });
    }
  });

  /* arrastar entre os quadrantes (no computador; no celular, a cruz abre o "mover") */
  var arrastando = null;
  raiz.addEventListener('dragstart', function (ev) {
    var li = ev.target.closest && ev.target.closest('.ms-t[draggable]'); if (!li) return;
    arrastando = li.getAttribute('data-id');
    ev.dataTransfer.effectAllowed = 'move';
    try { ev.dataTransfer.setData('text/plain', arrastando); } catch (e) {}
    li.classList.add('arrastando');
  });
  raiz.addEventListener('dragend', function () { arrastando = null; raiz.querySelectorAll('.arrastando, .alvo').forEach(function (x) { x.classList.remove('arrastando', 'alvo'); }); });
  raiz.addEventListener('dragover', function (ev) {
    var q = ev.target.closest && ev.target.closest('.ms-quad'); if (!q || !arrastando) return;
    ev.preventDefault(); ev.dataTransfer.dropEffect = 'move';
    raiz.querySelectorAll('.ms-quad.alvo').forEach(function (x) { if (x !== q) x.classList.remove('alvo'); });
    q.classList.add('alvo');
  });
  raiz.addEventListener('drop', function (ev) {
    var q = ev.target.closest && ev.target.closest('.ms-quad'); if (!q || !arrastando) return;
    ev.preventDefault();
    var t = tarefa(arrastando), nq = +q.getAttribute('data-q');
    arrastando = null;
    if (t && t.q !== nq) { t.q = nq; mudou(); aviso('Em ' + QUAD[nq][0] + '.'); var nq2 = raiz.querySelector('.ms-quad.q' + nq); if (nq2 && nq2.animate && !CALMO) nq2.animate([{ transform: 'scale(1.008)' }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' }); } else pintar();
  });

  /* "/" leva à linha de cima; Esc sai dela, ou da tela cheia do foco */
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && imEl) { ev.stopPropagation(); fecharImersao(); return; }
    if (ev.key === '/' && !ev.metaKey && !ev.ctrlKey && !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '') && !(document.activeElement || {}).isContentEditable && !document.querySelector('.folha.aberta')) {
      if (S.vista === 'acervo') { var buscaCentral = document.getElementById('ms-central-busca'); if (buscaCentral) { ev.preventDefault(); buscaCentral.focus(); } } else if (!entradaEl.hidden && !entradaEl.closest('[hidden]')) { ev.preventDefault(); entradaEl.focus(); }
    } else if (ev.key === 'Escape' && document.activeElement === entradaEl) entradaEl.blur();
  }, true);
  window.addEventListener('popstate', function () { lerEndereco(); pintar(); });
  window.addEventListener('hashchange', function () { lerEndereco(); pintar(); });

  window.addEventListener('mesa-central-atualizada', function () { if (CENTRAIS.indexOf(S.vista) >= 0) pintar(); });
  raiz.addEventListener('keydown', function (ev) {
    var tab = ev.target.closest('[role="tab"]');
    if (!tab || ['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(ev.key) < 0) return;
    var tabs = [].slice.call(navEl.querySelectorAll('[role="tab"]:not([hidden])'));
    var n = tabs.indexOf(tab);
    if (n < 0) return;
    ev.preventDefault();
    n = ev.key === 'Home' ? 0 : ev.key === 'End' ? tabs.length - 1 : (n + (ev.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    var alvo = tabs[n].getAttribute('data-v'); ir(alvo);
    var novo = navEl.querySelector('[data-v="' + alvo + '"]'); if (novo) novo.focus();
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && window.MesaCentral) window.MesaCentral.atualizar(); });
  lerEndereco();
  iniciar();
  if (S.timer) { if (!tarefa(S.timer.id)) S.timer = null; else if (CENTRAIS.indexOf(S.vista) < 0) ligarTique(); }
  /* para os testes */
  window.__mesa = { estado: function () { return E; }, S: S, entender: entender, por: por, candidatas: candidatas };
})();
