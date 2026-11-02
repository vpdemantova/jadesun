/* ============================================================
   A MESA, O ARQUIVO (02/nov/2026, registro 138)
   "faça um eisenhower da minha vida toda … tudo em um app só … que funcione!"

   A Mesa guarda tudo num arquivo .md que se lê em qualquer editor (e no Obsidian, com as caixas
   de marcar funcionando): as tarefas em listas, uma seção por quadrante; o dinheiro, as roupas,
   os livros e as coleções em tabelas. O que se escreve no arquivo aparece na Mesa, e o que se
   marca na Mesa volta para o arquivo.

   A segurança do texto:
   · as colunas das tabelas se acham pelo nome (mudar a ordem à mão não quebra nada);
   · uma linha que a Mesa não entende não se perde: volta para o fim da mesma seção;
   · uma seção que a Mesa não conhece volta inteira, no mesmo lugar;
   · o que vem antes da primeira seção (o cabeçalho, a apresentação) volta como estava.

   Roda no navegador (window.MesaFormato) e no Node (require), sem dependências.
   ============================================================ */
(function (raiz, fabrica) {
  var F = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = F;
  else raiz.MesaFormato = F;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var QUADRANTES = [
    { q: 0, id: 'entrada', titulo: 'Entrada' },
    { q: 1, id: 'fazer', titulo: 'Fazer' },
    { q: 2, id: 'marcar', titulo: 'Marcar' },
    { q: 3, id: 'passar', titulo: 'Passar' },
    { q: 4, id: 'soltar', titulo: 'Soltar' },
  ];
  /* as áreas de quem chega: as oito da roda da vida; quem já tem as suas escreve na tabela do arquivo */
  var AREAS_PADRAO = [
    ['trabalho', 'Trabalho', 'o ofício e o sustento'],
    ['estudo', 'Estudo', 'o que se aprende'],
    ['dinheiro', 'Dinheiro', 'o que entra, o que sai, o que se guarda'],
    ['saude', 'Saúde', 'o corpo, o sono, a comida'],
    ['casa', 'Casa', 'onde se mora e o que se tem'],
    ['pessoas', 'Pessoas', 'família, amigos, amor'],
    ['obra', 'Obra', 'o que se cria'],
    ['descanso', 'Descanso', 'o lazer e o silêncio'],
  ];
  var REGISTRO = [['pratiquei', 'Pratiquei'], ['aprendi', 'Aprendi'], ['travei', 'Travei em'], ['achados', 'Achados'], ['gratidao', 'Gratidão'], ['amanha', 'Amanhã']];

  /* ---------- datas: no arquivo DD/MM/AAAA; por dentro, AAAA-MM-DD ---------- */
  function p2(n) { return String(n).padStart(2, '0'); }
  function isoDeData(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function hoje() { return isoDeData(new Date()); }
  function iso(texto, ref) {
    var t = String(texto || '').trim();
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
    if (m) return t;
    m = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/.exec(t);
    if (!m) return '';
    var dia = +m[1], mes = +m[2], ano = m[3] ? +m[3] : 0;
    if (ano && ano < 100) ano += 2000;
    if (!ano) {
      /* sem o ano: o mais perto de hoje (um prazo de janeiro escrito em novembro é do ano que vem) */
      var r = ref ? new Date(ref + 'T12:00:00') : new Date();
      ano = r.getFullYear();
      var cand = new Date(ano, mes - 1, dia);
      if (cand - r < -1000 * 60 * 60 * 24 * 183) ano += 1;
    }
    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return '';
    return ano + '-' + p2(mes) + '-' + p2(dia);
  }
  function br(isoTexto) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoTexto || ''));
    return m ? m[3] + '/' + m[2] + '/' + m[1] : '';
  }
  /* a semana ISO (segunda a domingo): "2026-S45" */
  function semana(isoTexto) {
    var d = new Date((isoTexto || hoje()) + 'T12:00:00');
    var dia = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dia + 3);
    var primeira = new Date(d.getFullYear(), 0, 4);
    var n = 1 + Math.round(((d - primeira) / 86400000 - 3 + ((primeira.getDay() + 6) % 7)) / 7);
    return d.getFullYear() + '-S' + p2(n);
  }

  /* ---------- números: no arquivo "1.234,50"; por dentro, 1234.5 ---------- */
  function numero(texto) {
    var t = String(texto == null ? '' : texto).replace(/R\$|\s/g, '');
    if (!t) return null;
    if (t.indexOf(',') >= 0) t = t.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(t);
    return isFinite(n) ? n : null;
  }
  function dinheiro(n, comSinal) {
    if (n == null || !isFinite(n)) return '';
    var s = Math.abs(n).toFixed(2).split('.');
    var inteiro = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (n < 0 ? '-' : comSinal && n > 0 ? '+' : '') + inteiro + ',' + s[1];
  }

  /* ---------- tabelas: colunas pelo nome ---------- */
  function semAcento(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
  function celulas(linha) {
    var t = linha.trim();
    if (t.charAt(0) === '|') t = t.slice(1);
    if (t.charAt(t.length - 1) === '|' && t.charAt(t.length - 2) !== '\\') t = t.slice(0, -1);
    var out = [], atual = '';
    for (var i = 0; i < t.length; i++) {
      var c = t.charAt(i);
      if (c === '\\' && t.charAt(i + 1) === '|') { atual += '|'; i++; continue; }
      if (c === '|') { out.push(atual.trim()); atual = ''; continue; }
      atual += c;
    }
    out.push(atual.trim());
    return out.map(function (x) { return x.replace(/<br\s*\/?>/gi, '\n'); });
  }
  function celula(v) { return String(v == null ? '' : v).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>').trim(); }
  function ehSeparador(linha) { return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(linha); }
  /* lê as tabelas de um bloco de linhas: [{ cab: ['titulo', …], linhas: [[…]] }], e o que sobrou */
  function tabelasDe(linhas) {
    var tabelas = [], resto = [], i = 0;
    while (i < linhas.length) {
      if (/^\s*\|/.test(linhas[i]) && i + 1 < linhas.length && ehSeparador(linhas[i + 1])) {
        var cab = celulas(linhas[i]).map(semAcento), corpo = [];
        i += 2;
        while (i < linhas.length && /^\s*\|/.test(linhas[i])) { corpo.push(celulas(linhas[i])); i++; }
        tabelas.push({ cab: cab, linhas: corpo });
        continue;
      }
      resto.push(linhas[i]);
      i++;
    }
    return { tabelas: tabelas, resto: resto };
  }
  function lerTabela(t, nomes) {
    /* nomes: { campo: ['nome da coluna', 'outro nome'] } → [{ campo: valor }] */
    var idx = {};
    Object.keys(nomes).forEach(function (campo) {
      var alvos = nomes[campo].map(semAcento);
      idx[campo] = t.cab.findIndex(function (c) { return alvos.indexOf(c) >= 0; });
    });
    return t.linhas.map(function (l) {
      var o = {};
      Object.keys(idx).forEach(function (campo) { o[campo] = idx[campo] >= 0 ? (l[idx[campo]] || '') : ''; });
      return o;
    });
  }
  function escreverTabela(cab, linhas) {
    var out = ['| ' + cab.join(' | ') + ' |', '|' + cab.map(function () { return '---'; }).join('|') + '|'];
    linhas.forEach(function (l) { out.push('| ' + l.map(celula).join(' | ') + ' |'); });
    return out;
  }

  /* ---------- o estado vazio ---------- */
  function vazio() {
    return {
      versao: 1,
      centro: '',
      areas: AREAS_PADRAO.map(function (a) { return { id: a[0], nome: a[1], para: a[2], nota: null, acoes: [] }; }),
      tarefas: [],
      dias: {},
      habitos: [],
      marcas: {},
      registros: {},
      semanas: {},
      dinheiro: { lancamentos: [], fixos: [], metas: [], grupos: { essencial: 50, livre: 30, futuro: 20 } },
      roupas: [],
      livros: [],
      colecoes: [],
      _preambulo: null,
      _extras: {},
      _soltas: [],
    };
  }

  /* ---------- as tarefas: uma linha de lista, campos separados por " · " ---------- */
  var ENERGIAS = { alta: 'alta', media: 'média', baixa: 'baixa' };
  function lerCampos(t, partes, ref) {
    t.extras = [];
    partes.forEach(function (p) {
      var s = p.trim(), m;
      if (!s) return;
      if ((m = /^prazo (.+)$/i.exec(s)) && iso(m[1], ref)) t.prazo = iso(m[1], ref);
      else if ((m = /^dia (.+)$/i.exec(s)) && iso(m[1], ref)) t.dia = iso(m[1], ref);
      else if ((m = /^feita (.+)$/i.exec(s)) && iso(m[1], ref)) t.feitoEm = iso(m[1], ref);
      else if ((m = /^criada (.+)$/i.exec(s)) && iso(m[1], ref)) t.criada = iso(m[1], ref);
      else if ((m = /^#([\p{L}\p{N}_-]+)$/u.exec(s))) t.area = semAcento(m[1]);
      else if ((m = /^@(.+)$/.exec(s))) t.contexto = m[1].trim().toLowerCase();
      else if ((m = /^foco (\d+) ?min$/i.exec(s))) t.focoMin = +m[1];
      else if ((m = /^(\d+) ?min$/i.exec(s))) t.min = +m[1];
      else if ((m = /^(\d+) ?h(?: ?(\d+)(?: ?min)?)?$/i.exec(s))) t.min = (+m[1]) * 60 + (+(m[2] || 0));
      else if ((m = /^energia (.+)$/i.exec(s)) && ENERGIAS[semAcento(m[1])]) t.energia = semAcento(m[1]);
      else if ((m = /^para (.+)$/i.exec(s))) t.para = m[1].trim();
      else if ((m = /^de (entrada|fazer|marcar|passar|soltar)$/i.exec(s))) t.de = m[1].toLowerCase();
      else t.extras.push(s);
    });
  }
  function camposDe(t) {
    var c = [];
    if (t.prazo) c.push('prazo ' + br(t.prazo));
    if (t.dia) c.push('dia ' + br(t.dia));
    if (t.area) c.push('#' + t.area);
    if (t.contexto) c.push('@' + t.contexto);
    if (t.min) c.push(t.min >= 60 && t.min % 30 === 0 ? (t.min / 60 | 0) + ' h' + (t.min % 60 ? ' ' + (t.min % 60) : '') : t.min + ' min');
    if (t.energia) c.push('energia ' + ENERGIAS[t.energia]);
    if (t.para) c.push('para ' + t.para);
    if (t.focoMin) c.push('foco ' + t.focoMin + ' min');
    if (t.criada) c.push('criada ' + br(t.criada));
    if (t.feito && t.feitoEm) c.push('feita ' + br(t.feitoEm));
    if (t.feito) c.push('de ' + QUADRANTES[t.q || 0].id);
    (t.extras || []).forEach(function (x) { c.push(x); });
    return c;
  }
  function novaTarefa(o) {
    return Object.assign({ id: '', titulo: '', q: 0, feito: false, feitoEm: '', area: '', prazo: '', dia: '', contexto: '', energia: '', min: 0, para: '', proximo: '', notas: '', fonte: '', passos: [], focoMin: 0, criada: '', extras: [] }, o || {});
  }
  function linhaDeTarefa(t) {
    var titulo = String(t.titulo || '').replace(/\s+·\s+/g, ' - ').replace(/\s*\^[\w-]+\s*$/, '').trim();
    var out = ['- [' + (t.feito ? 'x' : ' ') + '] ' + [titulo].concat(camposDe(t)).join(' · ') + (t.id ? ' ^' + t.id : '')];
    if (t.proximo) out.push('  - próximo: ' + umaLinha(t.proximo));
    if (t.notas) out.push('  - nota: ' + umaLinha(t.notas));
    if (t.fonte) out.push('  - fonte: ' + umaLinha(t.fonte));
    (t.passos || []).forEach(function (p) { out.push('  - [' + (p.f ? 'x' : ' ') + '] ' + umaLinha(p.t)); });
    return out;
  }
  function umaLinha(s) { return String(s || '').replace(/\r?\n/g, '<br>').trim(); }
  function deUmaLinha(s) { return String(s || '').replace(/<br\s*\/?>/gi, '\n'); }

  /* ---------- ler o arquivo ---------- */
  function deMarkdown(texto, ref) {
    var e = vazio();
    var linhas = String(texto || '').replace(/^﻿/, '').split(/\r?\n/);
    ref = ref || hoje();
    /* as seções de segundo nível, na ordem */
    var secoes = [], atual = null, pre = [];
    linhas.forEach(function (l) {
      var m = /^## (.+?)\s*$/.exec(l);
      if (m) { atual = { titulo: m[1], linhas: [] }; secoes.push(atual); return; }
      if (atual) atual.linhas.push(l); else pre.push(l);
    });
    if (pre.some(function (l) { return l.trim(); })) e._preambulo = pre.join('\n').replace(/\s+$/, '');
    var vistas = {};
    e.areas = [];
    var temAreas = false;
    secoes.forEach(function (s) {
      var nome = semAcento(s.titulo), sobra = [];
      var quad = QUADRANTES.filter(function (x) { return semAcento(x.titulo) === nome; })[0];
      if (quad || nome === 'feitas') { lerTarefas(e, s.linhas, quad ? quad.q : -1, ref, sobra); }
      else if (nome === 'o centro') { e.centro = s.linhas.filter(function (l) { return l.trim() && !/^\s*>/.test(l); }).join('\n').trim(); }
      else if (nome === 'as areas') { temAreas = true; lerAreas(e, s.linhas, sobra); }
      else if (nome === 'o dia') lerDias(e, s.linhas, ref, sobra);
      else if (nome === 'habitos') lerHabitos(e, s.linhas, ref, sobra);
      else if (nome === 'registros') lerRegistros(e, s.linhas, ref, sobra);
      else if (nome === 'semanas') lerSemanas(e, s.linhas, ref, sobra);
      else if (nome === 'dinheiro') lerDinheiro(e, s.linhas, ref, sobra);
      else if (nome === 'roupas') lerRoupas(e, s.linhas, ref, sobra);
      else if (nome === 'livros') lerLivros(e, s.linhas, ref, sobra);
      else if (nome === 'colecoes') lerColecoes(e, s.linhas, sobra);
      else { e._soltas.push({ titulo: s.titulo, texto: s.linhas.join('\n').replace(/\s+$/, ''), depois: Object.keys(vistas).pop() || '' }); return; }
      vistas[nome] = 1;
      var util = sobra.filter(function (l) { return l.trim(); });
      if (util.length) e._extras[nome] = (e._extras[nome] || []).concat(util);
    });
    if (!temAreas) e.areas = vazio().areas;
    return normalizar(e);
  }

  function lerTarefas(e, linhas, q, ref, sobra) {
    var atual = null;
    linhas.forEach(function (l) {
      var m = /^- \[( |x|X)\] (.*)$/.exec(l);
      if (m) {
        var corpo = m[2], id = '';
        var mi = /\s\^([\w-]+)\s*$/.exec(corpo);
        if (mi) { id = mi[1]; corpo = corpo.slice(0, mi.index); }
        var partes = corpo.split(' · ');
        atual = novaTarefa({ id: id, titulo: partes.shift().trim(), feito: m[1] !== ' ' });
        lerCampos(atual, partes, ref);
        if (q >= 0) atual.q = q;
        else atual.q = QUADRANTES.filter(function (x) { return x.id === atual.de; }).map(function (x) { return x.q; })[0] || 0;
        if (q < 0) atual.feito = true;
        delete atual.de;
        e.tarefas.push(atual);
        return;
      }
      var sub = /^(?:\t|\s{2,})\s*- (.*)$/.exec(l);
      if (sub && atual) {
        var s = sub[1], ms;
        if ((ms = /^\[( |x|X)\] (.*)$/.exec(s))) atual.passos.push({ t: deUmaLinha(ms[2]), f: ms[1] !== ' ' });
        else if ((ms = /^pr[oó]ximo:\s*(.*)$/i.exec(s))) atual.proximo = deUmaLinha(ms[1]);
        else if ((ms = /^nota:\s*(.*)$/i.exec(s))) atual.notas = (atual.notas ? atual.notas + '\n' : '') + deUmaLinha(ms[1]);
        else if ((ms = /^fonte:\s*(.*)$/i.exec(s))) atual.fonte = deUmaLinha(ms[1]);
        else atual.notas = (atual.notas ? atual.notas + '\n' : '') + deUmaLinha(s);
        return;
      }
      if (l.trim()) { atual = null; sobra.push(l); }
    });
  }
  function lerAreas(e, linhas, sobra) {
    var t = tabelasDe(linhas);
    t.tabelas.forEach(function (tab) {
      lerTabela(tab, { id: ['área', 'area', 'id'], nome: ['nome'], para: ['para quê', 'para que'], nota: ['nota'], acoes: ['ações', 'acoes'] }).forEach(function (a) {
        if (!a.id && !a.nome) return;
        e.areas.push({ id: semAcento(a.id || a.nome).replace(/\s+/g, '-'), nome: a.nome || a.id, para: a.para, nota: numero(a.nota), acoes: a.acoes.split(/;\s*/).map(function (x) { return x.trim(); }).filter(Boolean) });
      });
    });
    t.resto.forEach(function (l) { sobra.push(l); });
  }
  function lerDias(e, linhas, ref, sobra) {
    var t = tabelasDe(linhas);
    t.tabelas.forEach(function (tab) {
      lerTabela(tab, { dia: ['dia'], plano: ['plano'], sapo: ['sapo'], bem: ['que bem farei hoje?', 'que bem farei hoje', 'intencao'], fez: ['que bem fiz hoje?', 'que bem fiz hoje'] }).forEach(function (d) {
        var k = iso(d.dia, ref);
        if (!k) return;
        e.dias[k] = { plano: lista(d.plano), sapo: d.sapo.trim(), bem: d.bem, fez: d.fez };
      });
    });
    t.resto.forEach(function (l) { sobra.push(l); });
  }
  function lerHabitos(e, linhas, ref, sobra) {
    var t = tabelasDe(linhas);
    t.tabelas.forEach(function (tab) {
      if (tab.cab.indexOf('habito') >= 0) {
        lerTabela(tab, { nome: ['hábito', 'habito'], area: ['área', 'area'], min: ['minutos'], quando: ['quando'], id: ['id'] }).forEach(function (h) {
          if (!h.nome) return;
          e.habitos.push({ id: h.id, nome: h.nome, area: semAcento(h.area), min: numero(h.min) || 0, quando: h.quando || 'todo dia' });
        });
      } else if (tab.cab.indexOf('feitos') >= 0) {
        lerTabela(tab, { dia: ['dia'], feitos: ['feitos'] }).forEach(function (m) {
          var k = iso(m.dia, ref);
          if (k) e.marcas[k] = lista(m.feitos);
        });
      }
    });
    t.resto.forEach(function (l) { if (!/^###\s/.test(l)) sobra.push(l); });
  }
  function lerRegistros(e, linhas, ref, sobra) {
    var atual = null;
    linhas.forEach(function (l) {
      var m = /^###\s+(.+)$/.exec(l);
      if (m) {
        var k = iso(m[1].trim(), ref);
        atual = k ? (e.registros[k] = e.registros[k] || {}) : null;
        if (!k) sobra.push(l);
        return;
      }
      var c = /^- ([^:]+):\s?(.*)$/.exec(l);
      if (c && atual) {
        var campo = REGISTRO.filter(function (r) { return semAcento(r[1]) === semAcento(c[1]); })[0];
        if (campo) { atual[campo[0]] = deUmaLinha(c[2]); return; }
      }
      if (l.trim()) sobra.push(l);
    });
  }
  function lerSemanas(e, linhas, ref, sobra) {
    var t = tabelasDe(linhas);
    t.tabelas.forEach(function (tab) {
      lerTabela(tab, { semana: ['semana'], resultados: ['resultados'], revisada: ['revisada'] }).forEach(function (s) {
        if (!/^\d{4}-S\d{2}$/.test(s.semana)) return;
        e.semanas[s.semana] = {
          resultados: s.resultados.split(/;\s*/).filter(Boolean).map(function (r) {
            var m = /^\[( |x|X)\]\s*(.*)$/.exec(r.trim());
            return m ? { t: m[2], f: m[1] !== ' ' } : { t: r.trim(), f: false };
          }),
          revisada: iso(s.revisada, ref),
        };
      });
    });
    t.resto.forEach(function (l) { sobra.push(l); });
  }
  function lerDinheiro(e, linhas, ref, sobra) {
    var t = tabelasDe(linhas);
    t.tabelas.forEach(function (tab) {
      if (tab.cab.indexOf('valor') >= 0 && tab.cab.indexOf('data') >= 0) {
        lerTabela(tab, { data: ['data'], valor: ['valor'], grupo: ['grupo'], cat: ['categoria'], desc: ['descrição', 'descricao'], id: ['id'] }).forEach(function (x) {
          var v = numero(x.valor);
          if (v == null) return;
          e.dinheiro.lancamentos.push({ id: x.id, data: iso(x.data, ref) || ref, valor: v, grupo: semAcento(x.grupo) || (v > 0 ? 'renda' : 'essencial'), cat: x.cat, desc: x.desc });
        });
      } else if (tab.cab.indexOf('cada') >= 0) {
        lerTabela(tab, { nome: ['nome'], valor: ['valor'], cada: ['cada'], grupo: ['grupo'], vence: ['vence'], id: ['id'] }).forEach(function (x) {
          if (!x.nome) return;
          e.dinheiro.fixos.push({ id: x.id, nome: x.nome, valor: numero(x.valor), cada: semAcento(x.cada) === 'ano' ? 'ano' : 'mes', grupo: semAcento(x.grupo) || 'essencial', vence: iso(x.vence, ref) });
        });
      } else if (tab.cab.indexOf('alvo') >= 0) {
        lerTabela(tab, { nome: ['meta'], alvo: ['alvo'], guardado: ['guardado'], id: ['id'] }).forEach(function (x) {
          if (!x.nome) return;
          e.dinheiro.metas.push({ id: x.id, nome: x.nome, alvo: numero(x.alvo) || 0, guardado: numero(x.guardado) || 0 });
        });
      } else if (tab.cab.indexOf('%') >= 0 || tab.cab.indexOf('parte') >= 0) {
        var g = {};
        lerTabela(tab, { grupo: ['grupo'], parte: ['%', 'parte'] }).forEach(function (x) { if (x.grupo) g[semAcento(x.grupo)] = numero(x.parte) || 0; });
        if (Object.keys(g).length) e.dinheiro.grupos = g;
      }
    });
    t.resto.forEach(function (l) { if (!/^###\s/.test(l)) sobra.push(l); });
  }
  function lerRoupas(e, linhas, ref, sobra) {
    var t = tabelasDe(linhas);
    t.tabelas.forEach(function (tab) {
      lerTabela(tab, { nome: ['peça', 'peca'], tipo: ['tipo'], cor: ['cor'], estacao: ['estação', 'estacao'], ocasiao: ['ocasião', 'ocasiao'], custo: ['custo'], usos: ['usos'], ultima: ['última vez', 'ultima vez'], estado: ['estado'], capsula: ['cápsula', 'capsula'], notas: ['notas'], id: ['id'] }).forEach(function (r) {
        if (!r.nome) return;
        e.roupas.push({ id: r.id, nome: r.nome, tipo: r.tipo, cor: r.cor, estacao: r.estacao, ocasiao: r.ocasiao, custo: numero(r.custo), usos: numero(r.usos) || 0, ultima: iso(r.ultima, ref), estado: semAcento(r.estado) || 'ok', capsula: /^(sim|s|x|1)$/i.test(r.capsula.trim()), notas: r.notas });
      });
    });
    t.resto.forEach(function (l) { sobra.push(l); });
  }
  var SITUACOES = ['quero', 'lendo', 'lido', 'parei', 'tenho'];
  function lerLivros(e, linhas, ref, sobra) {
    var t = tabelasDe(linhas);
    t.tabelas.forEach(function (tab) {
      lerTabela(tab, { titulo: ['título', 'titulo'], autor: ['autor'], situacao: ['situação', 'situacao'], pagina: ['página', 'pagina'], paginas: ['páginas', 'paginas'], inicio: ['início', 'inicio'], fim: ['fim'], nota: ['nota'], tags: ['tags'], notas: ['notas'], id: ['id'] }).forEach(function (l) {
        if (!l.titulo) return;
        var s = semAcento(l.situacao);
        e.livros.push({ id: l.id, titulo: l.titulo, autor: l.autor, situacao: SITUACOES.indexOf(s) >= 0 ? s : 'tenho', pagina: numero(l.pagina) || 0, paginas: numero(l.paginas) || 0, inicio: iso(l.inicio, ref), fim: iso(l.fim, ref), nota: numero(l.nota) || 0, tags: lista(l.tags), notas: l.notas });
      });
    });
    t.resto.forEach(function (l) { sobra.push(l); });
  }
  function lerColecoes(e, linhas, sobra) {
    var atual = null, bloco = [];
    function fechar() {
      if (!atual) { bloco.forEach(function (l) { if (l.trim()) sobra.push(l); }); bloco = []; return; }
      var t = tabelasDe(bloco);
      t.tabelas.forEach(function (tab) {
        lerTabela(tab, { nome: ['item', 'nome'], detalhe: ['detalhe'], estado: ['estado'], notas: ['notas'], id: ['id'] }).forEach(function (i) {
          if (!i.nome) return;
          var est = semAcento(i.estado);
          atual.itens.push({ id: i.id, nome: i.nome, detalhe: i.detalhe, estado: ['tenho', 'quero', 'troca'].indexOf(est) >= 0 ? est : 'tenho', notas: i.notas });
        });
      });
      t.resto.forEach(function (l) { if (l.trim()) sobra.push(l); });
      bloco = [];
    }
    linhas.forEach(function (l) {
      var m = /^###\s+(.+)$/.exec(l);
      if (m) { fechar(); atual = { id: '', nome: m[1].trim(), itens: [] }; e.colecoes.push(atual); return; }
      bloco.push(l);
    });
    fechar();
  }
  function lista(t) { return String(t || '').split(/[,;]\s*/).map(function (x) { return x.trim(); }).filter(Boolean); }

  /* ---------- ids e arrumação ---------- */
  function normalizar(e) {
    var usados = {};
    function dar(prefixo, o) {
      if (o.id && !usados[o.id]) { usados[o.id] = 1; return; }
      var n = 1;
      while (usados[prefixo + n]) n++;
      o.id = prefixo + n;
      usados[o.id] = 1;
    }
    e.tarefas.forEach(function (t) { dar('t', t); });
    e.habitos.forEach(function (h) { dar('h', h); });
    e.dinheiro.lancamentos.forEach(function (x) { dar('d', x); });
    e.dinheiro.fixos.forEach(function (x) { dar('f', x); });
    e.dinheiro.metas.forEach(function (x) { dar('m', x); });
    e.roupas.forEach(function (x) { dar('r', x); });
    e.livros.forEach(function (x) { dar('l', x); });
    e.colecoes.forEach(function (c) { dar('c', c); c.itens.forEach(function (i) { dar('i', i); }); });
    return e;
  }
  function novoId(e, prefixo) {
    var usados = {};
    e.tarefas.concat(e.habitos, e.dinheiro.lancamentos, e.dinheiro.fixos, e.dinheiro.metas, e.roupas, e.livros, e.colecoes)
      .forEach(function (o) { usados[o.id] = 1; });
    e.colecoes.forEach(function (c) { c.itens.forEach(function (i) { usados[i.id] = 1; }); });
    var n = 1;
    while (usados[prefixo + n]) n++;
    return prefixo + n;
  }

  /* ---------- escrever o arquivo ---------- */
  var PREAMBULO = [
    '---',
    'formato: mesa',
    'visibilidade: privado',
    '---',
    '',
    '# A Mesa',
    '',
    '> Tudo o que é seu, numa mesa só. Este arquivo é a Mesa do Portal Solar: o que se escreve aqui aparece lá, e o que se marca lá volta para cá. As tarefas ficam numa seção por quadrante (Fazer, Marcar, Passar, Soltar); o resto, em tabelas.',
  ].join('\n');

  function paraMarkdown(e) {
    var out = [e._preambulo || PREAMBULO, ''];
    var soltas = (e._soltas || []).slice();
    function secao(titulo, linhas) {
      out.push('## ' + titulo, '');
      if (linhas.length) out.push.apply(out, linhas);
      var extra = (e._extras || {})[semAcento(titulo)];
      if (extra && extra.length) { if (linhas.length) out.push(''); out.push.apply(out, extra); }
      out.push('');
      /* as seções que a Mesa não conhece voltam logo depois da seção que vinha antes delas */
      var nome = semAcento(titulo);
      soltas = soltas.filter(function (s) {
        if (s.depois !== nome) return true;
        out.push('## ' + s.titulo);
        if (s.texto) out.push(s.texto);
        out.push('');
        return false;
      });
    }
    soltas = soltas.filter(function (s) {
      if (s.depois) return true;
      out.push('## ' + s.titulo);
      if (s.texto) out.push(s.texto);
      out.push('');
      return false;
    });
    secao('O centro', e.centro ? [e.centro] : []);
    secao('As áreas', escreverTabela(['Área', 'Nome', 'Para quê', 'Nota', 'Ações'], e.areas.map(function (a) { return [a.id, a.nome, a.para, a.nota == null ? '' : String(a.nota), (a.acoes || []).join('; ')]; })));
    var abertas = e.tarefas.filter(function (t) { return !t.feito; });
    QUADRANTES.forEach(function (Q) {
      var ls = [];
      abertas.filter(function (t) { return (t.q || 0) === Q.q; }).forEach(function (t) { ls.push.apply(ls, linhaDeTarefa(t)); });
      secao(Q.titulo, ls);
    });
    var feitas = [];
    e.tarefas.filter(function (t) { return t.feito; })
      .sort(function (a, b) { return String(b.feitoEm || '').localeCompare(String(a.feitoEm || '')); })
      .forEach(function (t) { feitas.push.apply(feitas, linhaDeTarefa(t)); });
    secao('Feitas', feitas);
    var dias = Object.keys(e.dias).sort().reverse().filter(function (k) {
      var d = e.dias[k]; return d && ((d.plano && d.plano.length) || d.sapo || d.bem || d.fez);
    });
    secao('O dia', dias.length ? escreverTabela(['Dia', 'Plano', 'Sapo', 'Que bem farei hoje?', 'Que bem fiz hoje?'], dias.map(function (k) {
      var d = e.dias[k]; return [br(k), (d.plano || []).join(', '), d.sapo || '', d.bem || '', d.fez || ''];
    })) : []);
    var hab = escreverTabela(['Hábito', 'Área', 'Minutos', 'Quando', 'Id'], e.habitos.map(function (h) { return [h.nome, h.area, h.min ? String(h.min) : '', h.quando, h.id]; }));
    var marcasDias = Object.keys(e.marcas).filter(function (k) { return (e.marcas[k] || []).length; }).sort().reverse();
    if (marcasDias.length) hab = hab.concat(['', '### Marcas', ''], escreverTabela(['Dia', 'Feitos'], marcasDias.map(function (k) { return [br(k), e.marcas[k].join(', ')]; })));
    secao('Hábitos', e.habitos.length || marcasDias.length ? hab : []);
    var regs = [];
    Object.keys(e.registros).sort().reverse().forEach(function (k) {
      var r = e.registros[k];
      if (!REGISTRO.some(function (c) { return r[c[0]]; })) return;
      if (regs.length) regs.push('');
      regs.push('### ' + br(k));
      REGISTRO.forEach(function (c) { regs.push('- ' + c[1] + ': ' + umaLinha(r[c[0]] || '')); });
    });
    secao('Registros', regs);
    var sem = Object.keys(e.semanas).sort().reverse();
    secao('Semanas', sem.length ? escreverTabela(['Semana', 'Resultados', 'Revisada'], sem.map(function (k) {
      var s = e.semanas[k]; return [k, (s.resultados || []).map(function (r) { return '[' + (r.f ? 'x' : ' ') + '] ' + r.t; }).join('; '), br(s.revisada)];
    })) : []);
    var d = e.dinheiro, din = [];
    din.push('### Lançamentos', '');
    din = din.concat(escreverTabela(['Data', 'Valor', 'Grupo', 'Categoria', 'Descrição', 'Id'], d.lancamentos.slice().sort(function (a, b) { return String(b.data).localeCompare(String(a.data)); }).map(function (x) {
      return [br(x.data), dinheiro(x.valor, true), x.grupo, x.cat, x.desc, x.id];
    })));
    din.push('', '### Fixos', '');
    din = din.concat(escreverTabela(['Nome', 'Valor', 'Cada', 'Grupo', 'Vence', 'Id'], d.fixos.map(function (x) {
      return [x.nome, x.valor == null ? '' : dinheiro(x.valor), x.cada === 'ano' ? 'ano' : 'mês', x.grupo, br(x.vence), x.id];
    })));
    din.push('', '### Metas', '');
    din = din.concat(escreverTabela(['Meta', 'Alvo', 'Guardado', 'Id'], d.metas.map(function (x) { return [x.nome, dinheiro(x.alvo), dinheiro(x.guardado), x.id]; })));
    din.push('', '### Grupos', '');
    din = din.concat(escreverTabela(['Grupo', '%'], Object.keys(d.grupos).map(function (g) { return [g, String(d.grupos[g])]; })));
    secao('Dinheiro', din);
    secao('Roupas', escreverTabela(['Peça', 'Tipo', 'Cor', 'Estação', 'Ocasião', 'Custo', 'Usos', 'Última vez', 'Estado', 'Cápsula', 'Notas', 'Id'], e.roupas.map(function (r) {
      return [r.nome, r.tipo, r.cor, r.estacao, r.ocasiao, r.custo == null ? '' : dinheiro(r.custo), r.usos ? String(r.usos) : '', br(r.ultima), r.estado, r.capsula ? 'sim' : '', r.notas, r.id];
    })));
    secao('Livros', escreverTabela(['Título', 'Autor', 'Situação', 'Página', 'Páginas', 'Início', 'Fim', 'Nota', 'Tags', 'Notas', 'Id'], e.livros.map(function (l) {
      return [l.titulo, l.autor, l.situacao, l.pagina ? String(l.pagina) : '', l.paginas ? String(l.paginas) : '', br(l.inicio), br(l.fim), l.nota ? String(l.nota) : '', (l.tags || []).join(', '), l.notas, l.id];
    })));
    var col = [];
    e.colecoes.forEach(function (c, i) {
      if (i) col.push('');
      col.push('### ' + c.nome, '');
      col = col.concat(escreverTabela(['Item', 'Detalhe', 'Estado', 'Notas', 'Id'], c.itens.map(function (x) { return [x.nome, x.detalhe, x.estado, x.notas, x.id]; })));
    });
    secao('Coleções', col);
    soltas.forEach(function (s) { out.push('## ' + s.titulo); if (s.texto) out.push(s.texto); out.push(''); });
    return out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '') + '\n';
  }

  return {
    QUADRANTES: QUADRANTES, AREAS_PADRAO: AREAS_PADRAO, REGISTRO: REGISTRO,
    vazio: vazio, deMarkdown: deMarkdown, paraMarkdown: paraMarkdown, normalizar: normalizar, novoId: novoId, novaTarefa: novaTarefa,
    hoje: hoje, iso: iso, br: br, semana: semana, isoDeData: isoDeData, numero: numero, dinheiro: dinheiro, semAcento: semAcento,
  };
});
