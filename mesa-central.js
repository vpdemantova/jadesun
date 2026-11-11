/* A entrada pessoal da Mesa. Lê o registro Markdown; mudar a vista não muda o acervo. */
(function () {
  'use strict';
  var CHAVE = 'mesa.central.copia.v1';
  var dados = null, carregando = true, copia = false, falha = '', leitura = 0;
  try { var inicial = JSON.parse(localStorage.getItem(CHAVE) || 'null'); if (inicial && inicial.existe) { dados = inicial; copia = true; } } catch (e) {}
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function avisar() { window.dispatchEvent(new Event('mesa-central-atualizada')); }
  function atualizar() {
    var geracao = ++leitura;
    carregando = true; falha = ''; avisar();
    return fetch('/api/central', { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('Não consegui reler o registro neste computador.');
      return r.json();
    }).then(function (j) {
      if (geracao !== leitura) return;
      if (typeof j.existe !== 'boolean') throw new Error('O registro ainda não está disponível nesta versão.');
      dados = j; copia = false; carregando = false;
      try { if (j.existe) localStorage.setItem(CHAVE, JSON.stringify(j)); else localStorage.removeItem(CHAVE); } catch (e) {}
      avisar();
    }).catch(function (e) {
      if (geracao !== leitura) return;
      carregando = false; falha = e.message;
      if (!dados) try { var salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null'); if (salvo && salvo.existe) dados = salvo; } catch (erro) {}
      copia = !!dados; avisar();
    });
  }
  function botao(texto, acao, valor, classe) {
    return '<button type="button" class="botao ' + (classe || '') + '" data-acao="' + acao + '"' + (valor ? ' data-v="' + esc(valor) + '"' : '') + '>' + esc(texto) + '</button>';
  }
  function cab(rotulo, titulo, texto) {
    return '<header class="secao-cab ms-central-cab"><p class="rot">' + esc(rotulo) + '</p><h2 class="h2">' + esc(titulo) + '</h2>' + (texto ? '<p class="ms-texto">' + esc(texto) + '</p>' : '') + '</header>';
  }
  function dataTexto(valor) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor || '')) return new Date(valor + 'T12:00:00-03:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' });
    var d = new Date(valor || '');
    if (!isFinite(d.getTime())) return valor || 'data ainda não registrada';
    return d.toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  }
  function rodape() {
    var p = dados.painel || {};
    return '<footer class="ms-central-origem"><p class="ms-meta">' + (copia ? 'Cópia guardada neste aparelho. ' : 'Registro do caderno. ') +
      'Conferência: ' + esc(dataTexto(p.atualizado_em || dados.modificado)) + '.</p>' +
      '<div class="ms-botoes">' + botao(carregando ? 'Lendo…' : 'Reler registro', 'central-reler') +
      (!copia ? botao('Editar registro', 'central-registro') : '') + '</div></footer>';
  }
  function semRegistro() {
    return cab('A Mesa', 'Vamos continuar daqui', '') + '<section class="painel ms-central-vazia" role="status"><p class="ms-texto">' +
      esc(carregando ? 'Lendo o registro do seu caderno…' : falha || 'Este computador ainda não tem o registro central. O acervo e as outras vistas da Mesa continuam acessíveis.') +
      '</p><div class="ms-botoes">' + botao('Tentar ler de novo', 'central-reler') + '<a class="botao" href="atlas.html">Abrir o acervo</a>' + botao('Abrir o foco da Mesa', 'ir', 'agora') + '</div></section>';
  }
  function computadores() {
    return '<details class="painel ms-central-dobra"><summary>Como entram os dois computadores</summary><div class="ms-central-maquinas">' + (dados.computadores || []).map(function (c) {
      return '<article><h3>' + esc(c.nome) + '</h3><p class="ms-texto">' + esc(c.papel) + '</p><p class="ms-meta">' + esc(c.situacao) + '</p></article>';
    }).join('') + '</div><p class="ms-meta">Cada computador guarda suas cópias. A comparação entre elas e a sincronização do acervo continuam pendentes. Você pode acompanhar o trabalho pela conversa central.</p></details>';
  }
  function agora(op) {
    var p = dados.painel || {};
    var temSuaParte = p.sua_parte && p.sua_parte !== 'nenhuma';
    return cab('Agora', 'Uma coisa de cada vez', p.objetivo || 'O próximo passo do trabalho, com o restante ao alcance.') +
      '<section class="painel-inverso ms-central-foco"><p class="rot">' + esc(p.status || 'Situação registrada') + '</p><h3>' + esc(p.agora || p.objetivo || 'Conferir o próximo passo') + '</h3>' +
      (temSuaParte ? '<div class="ms-central-parte"><p class="rot">Sua parte agora</p><p>' + esc(p.sua_parte) + '</p></div>' : '<p>Não há uma intervenção sua registrada neste momento.</p>') +
      '<details' + (op.detalhe === 'amplo' ? ' open' : '') + '><summary>O trabalho que sigo conduzindo</summary><p>' + esc(p.minha_parte || 'As próximas entregas estão no Mapa.') + '</p></details></section>' +
      '<div class="ms-central-portas"><button type="button" class="painel" data-acao="ir" data-v="mapa"><span class="rot">Se quiser olhar mais longe</span><strong>Abrir o mapa das frentes <span aria-hidden="true">↗</span></strong></button>' +
      '<button type="button" class="painel" data-acao="ir" data-v="acervo"><span class="rot">O que já existe e o que falta</span><strong>Conferir o acervo <span aria-hidden="true">↗</span></strong></button></div>' + computadores() + rodape();
  }
  function mapa(op) {
    var todas = dados.frentes || [], tipos = [], filtro = op.filtro || '';
    todas.forEach(function (f) { if (f.tipo && tipos.indexOf(f.tipo) < 0) tipos.push(f.tipo); });
    var frentes = todas.filter(function (f) { return !filtro || f.tipo === filtro; });
    return cab('Mapa', 'As frentes da sua vida', 'Urgência, renda, educação, formação e projetos podem ser vistos separadamente.') +
      '<div class="ms-chips" aria-label="Filtrar as frentes">' + [''].concat(tipos).map(function (tipo) {
        return '<button type="button" class="chip' + (tipo === filtro ? ' on' : '') + '" data-acao="central-filtrar" data-v="' + esc(tipo) + '" aria-pressed="' + (tipo === filtro) + '">' + esc(tipo || 'Todas') + '</button>';
      }).join('') + '</div><div class="ms-central-itens ' + (op.layout === 'lista' ? 'em-lista' : '') + '">' +
      frentes.map(function (f) { return '<article class="painel ms-central-item"><p class="rot">' + esc(f.tipo) + '</p><h3>' + esc(f.nome) + '</h3><p class="ms-central-proxima">' + esc(f.proximaEntrega || 'Próxima entrega ainda a definir.') + '</p><details' + (op.detalhe === 'amplo' ? ' open' : '') + '><summary>Situação desta frente</summary><p class="ms-texto">' + esc(f.estado || 'Ainda em levantamento.') + '</p></details></article>'; }).join('') +
      (!frentes.length ? '<p class="ms-texto">Nenhuma frente está registrada neste filtro.</p>' : '') + '</div>' +
      '<p class="ms-meta">O mapa conserva as frentes abertas. Ele não transforma todas em tarefas para hoje.</p>' + rodape();
  }
  function acervo(op) {
    var q = (op.q || '').toLocaleLowerCase('pt-BR');
    var fontes = (dados.fontes || []).filter(function (f) { return !q || [f.nome, f.contexto, f.estado].join(' ').toLocaleLowerCase('pt-BR').indexOf(q) >= 0; });
    return cab('Acervo', 'Nada precisa sumir para caber', 'Este é o inventário das fontes conhecidas. A cobertura de cada uma continua visível.') +
      '<div class="ms-central-acervo-topo"><label class="ms-central-busca"><span class="ms-sr">Procurar uma fonte</span><input id="ms-central-busca" type="search" class="ms-campo" data-filtro value="' + esc(op.q || '') + '" placeholder="Procurar notas, chats, favoritos, papéis…"></label><a class="botao" href="atlas.html">Explorar o caderno</a></div>' +
      '<p class="ms-meta" role="status">' + fontes.length + ' fonte' + (fontes.length === 1 ? '' : 's') + ' nesta visão.</p><div class="ms-central-itens ' + (op.layout === 'lista' ? 'em-lista' : '') + '">' +
      fontes.map(function (f) { return '<article class="painel ms-central-item"><h3>' + esc(f.nome) + '</h3><p class="ms-central-proxima">' + esc(f.estado) + '</p><details' + (op.detalhe === 'amplo' ? ' open' : '') + '><summary>Ver o que sabemos</summary><p class="ms-texto">' + esc(f.contexto) + '</p></details></article>'; }).join('') + '</div>' + rodape();
  }
  function render(vista, op) {
    if (!dados || !dados.existe) return semRegistro();
    var aviso = copia ? '<p class="ms-central-copia" role="status">Sem confirmação atual do computador. Você está vendo uma cópia guardada; a data abaixo indica sua última conferência.</p>' : '';
    return aviso + (vista === 'mapa' ? mapa(op) : vista === 'acervo' ? acervo(op) : agora(op));
  }
  window.MesaCentral = { render: render, atualizar: atualizar, registro: function () { return dados && !copia ? dados.rel : null; } };
  atualizar();
})();
