/* ============================================================
   A PORTA DO MANIFESTO (09/out/2026, PERFIL.md item 74)
   Um script para três páginas (body[data-pagina]):
   · manifesto  — duas leituras (item 75): O Manifesto (o 0 O Manifesto, I a XIV, e a XV, a nova maré)
                  e a sua voz (o Manifesto do Portal Solar: lê o arquivo do caderno se existir; senão, o
                  rascunho de manifesto-dados.js; "Editar aqui" grava com cópia de segurança antes).
   · manifestos — os manifestos da humanidade, por século, com filtros.
   · filosofia  — os princípios do Portal Solar, como ele guarda as coisas, e as leituras.
   ============================================================ */
(function () {
  'use strict';

  var M = window.MANIFESTO, P = window.Perfil;
  var pagina = document.body.dataset.pagina;
  var raiz = document.getElementById('mv');
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ic(n) { return window.Icones ? window.Icones.svg(n) : ''; }
  function Q() { return window.Icones ? window.Icones.quadrado() : ''; }
  var H = { 'Content-Type': 'application/json', 'X-Perfil': '1' };
  function aviso(t, erro) {
    var el = document.querySelector('.mv-aviso');
    if (!el) { el = document.createElement('div'); el.className = 'mv-aviso dm2-aviso'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.innerHTML = '<span>' + esc(t) + '</span>'; el.classList.toggle('erro', !!erro); el.classList.add('on');
    clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('on'); }, 4600);
  }
  function baixar(nome, texto) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([texto], { type: 'text/markdown;charset=utf-8' }));
    a.download = nome; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- o Markdown do manifesto, com as propostas [entre colchetes] marcadas ---------- */
  function render(md) {
    md = String(md || '').replace(/^\s*#\s[^\n]*\n/, ''); /* o título já está no alto da página */
    var html = window.MD ? window.MD.render(md) : '<pre>' + esc(md) + '</pre>';
    /* [proposta] → realce com a explicação; links [texto](url) já foram convertidos pelo MD antes */
    return html.replace(/\[([^\]<>]{2,400})\]/g, '<span class="mv-proposta" title="Proposta para você aceitar, mudar ou apagar">$1</span>');
  }

  /* =============== 1. o Manifesto =============== */
  /* Duas leituras numa porta (item 75, "SIM SIM SIM! FAÇA TUDO!"):
     · O Manifesto — o 0 O Manifesto (I a XIV) e a XV, a nova maré (o discurso de 28/set, lapidado).
       Os dois moram no b Studio: o servidor só os lê (lib/manifesto.mjs); para mudar, abre no Obsidian.
     · A sua voz — o Manifesto do Portal Solar, montado das suas frases; mora em Manifestos e grava
       pelo caminho do Eu (com cópia de segurança antes). */
  var estatico = window.JADESUN_ESTATICO || null;
  var publico = !!(estatico && estatico.modo === 'publico');
  var dados = null;      /* /api/manifesto: { obra, mare, voz } */
  var arquivo = null;    /* a voz (o mesmo formato de /api/perfil) */
  var leitura = lerLeitura();
  function lerLeitura() { try { return localStorage.getItem('manifesto:leitura') === 'voz' ? 'voz' : 'obra'; } catch (e) { return 'obra'; } }
  function guardarLeitura(v) { try { localStorage.setItem('manifesto:leitura', v); } catch (e) { /* sem memória, segue */ } }
  function obsidian(abs) { return abs ? 'obsidian://open?path=' + encodeURIComponent(String(abs).replace(/\\/g, '/')) : ''; }
  function data(iso, longa) { var d = new Date(iso); if (isNaN(d)) return ''; return d.toLocaleDateString('pt-BR', longa ? { day: 'numeric', month: 'long', year: 'numeric' } : undefined); }

  var R = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  function paraRomano(n) { var s = ''; R.forEach(function (x) { while (n >= x[0]) { s += x[1]; n -= x[0]; } }); return s; }
  function deRomano(r) { var n = 0, i = 0; R.forEach(function (x) { while (r.indexOf(x[1], i) === i) { n += x[0]; i += x[1].length; } }); return n; }

  /* o 0 O Manifesto, cortado nas seções ## (a abertura, as numeradas, as fontes) */
  function partesDaObra(texto) {
    var partes = [], atual = { titulo: '', linhas: [] };
    String(texto || '').replace(/^\s*#\s[^\n]*\n/, '').split('\n').forEach(function (l) {
      var h = l.match(/^##\s+(.*?)\s*$/);
      if (h) { partes.push(atual); atual = { titulo: h[1], linhas: [] }; return; }
      atual.linhas.push(l);
    });
    partes.push(atual);
    return partes.filter(function (p) { return p.titulo || p.linhas.join('').trim(); }).map(function (p) {
      var m = p.titulo.match(/^([IVXLC]+)\.\s+(.*)$/);
      return { num: m ? m[1] : '', titulo: m ? m[2] : p.titulo, texto: p.linhas.join('\n').trim().replace(/\n-{3,}\s*$/, '') };
    });
  }
  function md(t) { return window.MD ? window.MD.render(t) : '<pre>' + esc(t) + '</pre>'; }

  function montarObra() {
    var o = dados.obra, m = dados.mare;
    var partes = partesDaObra(o.texto);
    var abertura = partes.filter(function (p) { return !p.num && !/fontes/i.test(p.titulo); })[0];
    var numeradas = partes.filter(function (p) { return p.num; });
    var fontes = partes.filter(function (p) { return !p.num && /fontes/i.test(p.titulo); })[0];
    /* a XV entra depois da última seção; se um dia ela for escrita dentro do próprio arquivo, não repete */
    var xv = null;
    if (m && m.existe && m.lapidado && !numeradas.some(function (p) { return /nova mar/i.test(p.titulo); })) {
      xv = { num: paraRomano((numeradas.length ? deRomano(numeradas[numeradas.length - 1].num) : 14) + 1), titulo: 'A nova maré', texto: m.lapidado, mare: true };
    }
    /* item 75: a XVI, a revolução ontológica (a nota Manifestos/A Revolução Ontológica.md, a mesma que a home lê) */
    var on = dados.ontologica && dados.ontologica.existe && window.Ontologica ? window.Ontologica.partes(dados.ontologica.texto) : null;
    var base = numeradas.concat(xv ? [xv] : []);
    var xvi = on && on.corpo && !numeradas.some(function (p) { return /ontol/i.test(p.titulo); }) ? { num: paraRomano((base.length ? deRomano(base[base.length - 1].num) : 15) + 1), titulo: 'A revolução ontológica', texto: on.corpo, ontologica: true } : null;
    var todas = base.concat(xvi ? [xvi] : []);
    var id = function (p) { return 'mf-' + p.num.toLowerCase(); };

    var sumario = '<nav class="mf-sumario" aria-label="Sumário do Manifesto"><p class="rot">Sumário</p><ol>' +
      todas.map(function (p) { var nova = p.mare || p.ontologica; return '<li' + (nova ? ' class="mf-nova"' : '') + '><a href="#' + id(p) + '"><span class="mf-n">' + p.num + '</span><span class="mf-t">' + esc(p.titulo) + '</span>' + (nova ? '<small>nova</small>' : '') + '</a></li>'; }).join('') +
      (fontes ? '<li><a href="#mf-fontes"><span class="mf-n" aria-hidden="true">·</span><span class="mf-t">As fontes</span></a></li>' : '') + '</ol></nav>';

    var corpo = (abertura ? '<div class="mf-abertura">' + (abertura.titulo ? '<p class="mf-sub">' + esc(abertura.titulo) + '</p>' : '') + md(abertura.texto) + '</div>' : '') +
      todas.map(function (p) {
        if (p.ontologica) return '<section class="mf-sec mf-ontologica" id="' + id(p) + '"><h2><span class="mf-n">' + p.num + '</span><span>' + esc(p.titulo) + '</span></h2>' +
          '<p class="mf-mare-de">Escrita com o Claude a partir deste Manifesto, da nova maré e das suas palavras, em 9 de outubro de 2026. Mora no caderno, ao lado dos seus manifestos: mude lá.</p>' +
          (on.resumo ? '<div class="mf-on-resumo">' + md(on.resumo) + '</div>' : '') + md(p.texto) +
          (dados.ontologica.abs ? '<p class="mf-mare-pe"><a href="' + esc(obsidian(dados.ontologica.abs)) + '">' + ic('editar') + 'Abrir no Obsidian</a></p>' : '') + '</section>';
        if (!p.mare) return '<section class="mf-sec" id="' + id(p) + '"><h2><span class="mf-n">' + p.num + '</span><span>' + esc(p.titulo) + '</span></h2>' + md(p.texto) + '</section>';
        return '<section class="mf-sec mf-mare" id="' + id(p) + '"><h2><span class="mf-n">' + p.num + '</span><span>' + esc(p.titulo) + '</span></h2>' +
          '<p class="mf-mare-de">Do discurso de ' + esc(data(m.data + 'T12:00:00', true) || '28 de setembro de 2026') + ', lapidado na mesma voz. Entrou no Manifesto com o seu sim, em 9 de outubro de 2026.</p>' +
          md(p.texto) +
          (m.palavras ? '<details class="mf-cru"><summary>As palavras como vieram</summary>' + md(m.palavras) + '</details>' : '') +
          (m.abs ? '<p class="mf-mare-pe"><a href="' + esc(obsidian(m.abs)) + '">' + ic('editar') + 'Abrir o discurso no Obsidian</a></p>' : '') +
        '</section>';
      }).join('') +
      (fontes ? '<section class="mf-fontes" id="mf-fontes"><h2>' + esc(fontes.titulo) + '</h2>' + md(fontes.texto) + '</section>' : '');

    if (on) corpo += '<div class="mf-quem">' + window.Ontologica.htmlQuemFez(on) + '</div>';
    return { sumario: sumario, corpo: corpo, xv: !!xv, total: todas.length };
  }

  function textoObraParaBaixar() {
    var t = dados.obra.texto;
    var m = dados.mare;
    if (m && m.existe && m.lapidado && !/##\s+[IVXLC]+\.\s+A nova mar/i.test(t)) {
      var corte = t.search(/\n## As fontes/);
      var xv = '\n## XV. A nova maré\n\n*Do discurso de 28/set/2026, lapidado na mesma voz.*\n\n' + m.lapidado + '\n';
      t = corte > 0 ? t.slice(0, corte) + '\n' + xv + t.slice(corte) : t + '\n' + xv;
    }
    var on = dados.ontologica && dados.ontologica.existe && window.Ontologica ? window.Ontologica.partes(dados.ontologica.texto) : null;
    if (on && on.corpo && !/##\s+[IVXLC]+\.\s+A revolução ontológica/i.test(t)) {
      var corte2 = t.search(/\n## As fontes/);
      var xvi = '\n## XVI. A revolução ontológica\n\n' + (on.resumo ? on.resumo + '\n\n' : '') + on.corpo + '\n';
      t = corte2 > 0 ? t.slice(0, corte2) + '\n' + xvi + t.slice(corte2) : t + '\n' + xvi;
    }
    return t;
  }

  function montarManifesto() {
    raiz.innerHTML =
      '<section class="mv-heroi" data-secao="heroi" data-rotulo="O quadrado">' +
        '<div class="mv-tela" aria-hidden="true"><i class="mv-tela-q"></i></div>' +
        '<div class="mv-heroi-txt"><p class="rot">O Portal Solar</p><h1 class="mv-titulo">Manifesto</h1>' +
          '<blockquote class="mv-epigrafe">A verdade pura é bem-vinda, e o que está em torno dela pode contemplá-la.</blockquote>' +
          '<p class="mv-estado" id="mv-estado"></p>' +
          '<div class="mv-acoes" id="mv-acoes"></div></div>' +
      '</section>' +
      '<div class="mf-leituras" role="tablist" aria-label="Qual texto ler" id="mf-leituras" hidden>' +
        '<button type="button" role="tab" data-mf-ler="obra"><b>O Manifesto</b><small id="mf-l-obra">I a XV</small></button>' +
        '<button type="button" role="tab" data-mf-ler="voz"><b>' + (publico ? 'Em uma página' : 'A sua voz') + '</b><small>' + (publico ? 'as frases de Vitor de Mantova' : 'as suas frases, no caderno') + '</small></button>' +
      '</div>' +
      '<div class="mv-corpo" id="mf-corpo"><p class="mv-nota mf-abrindo">Abrindo o manifesto…</p></div>';
    var pronto = function (d) { dados = d; arquivo = d && d.voz ? vozComoArquivo(d.voz) : arquivo; pintar(); };
    fetch('/api/manifesto', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (d) {
      if (d && d.obra) return pronto(d);
      /* servidor antigo (sem /api/manifesto): só a voz, pelo Eu */
      return fetch('/api/perfil', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (p) {
        arquivo = p && p.arquivos && p.arquivos.manifesto ? p.arquivos.manifesto : null; pintar();
      });
    });
    raiz.addEventListener('click', function (ev) {
      var l = ev.target.closest('[data-mf-ler]');
      if (l) { leitura = l.dataset.mfLer; guardarLeitura(leitura); pintar(); var alvo = document.getElementById('mf-leituras'); if (alvo && alvo.getBoundingClientRect().top < 0 && window.Movimento) window.Movimento.rolarPara(alvo, { deslocamento: -84 }); return; }
      var b = ev.target.closest('[data-mv]'); if (!b) return;
      var o = b.dataset.mv;
      if (o === 'baixar') { if (leitura === 'obra' && temObra()) baixar('O Manifesto (com a XV).md', textoObraParaBaixar()); else baixar('Manifesto do Portal Solar.md', textoAtual()); }
      if (o === 'levar') levar(b);
      if (o === 'editar') editar();
    });
    raiz.addEventListener('keydown', function (ev) {
      var t = ev.target.closest && ev.target.closest('[data-mf-ler]'); if (!t || (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft')) return;
      var outro = raiz.querySelector('[data-mf-ler="' + (t.dataset.mfLer === 'obra' ? 'voz' : 'obra') + '"]'); if (outro) { outro.focus(); outro.click(); }
    });
  }
  /* no público, "…/Manifestos/Solar.md" vira "Solar": o nome da nota, sem as pastas do caderno */
  function semPasta(t) { return String(t).split(/\s*\(/)[0].split('/').pop().replace(/\.md$/i, '') + (/\(([^)]*)\)\s*$/.test(t) ? ' (' + t.match(/\(([^)]*)\)\s*$/)[1] + ')' : ''); }
  function vozComoArquivo(v) { return { chave: 'manifesto', existe: !!v.existe, rel: v.rel, texto: v.texto || '', hash: v.hash || '', modificado: v.modificado || null, abs: v.abs || '' }; }
  function temObra() { return !!(dados && dados.obra && dados.obra.existe); }
  function textoAtual() { return arquivo && arquivo.existe ? arquivo.texto : M.rascunho; }

  var observador = null;
  function pintar() {
    var obra = temObra();
    if (!obra) leituraEfetiva = 'voz'; else leituraEfetiva = leitura;
    var abas = document.getElementById('mf-leituras');
    abas.hidden = !obra;
    abas.querySelectorAll('[data-mf-ler]').forEach(function (b) { var on = b.dataset.mfLer === leituraEfetiva; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
    var corpo = document.getElementById('mf-corpo');
    corpo.classList.toggle('mf-de-obra', leituraEfetiva === 'obra');
    if (observador) { observador.disconnect(); observador = null; }
    if (leituraEfetiva === 'obra') pintarObra(corpo); else pintarVoz(corpo);
    if (window.Movimento && window.Movimento.revalidar) window.Movimento.revalidar();
  }
  var leituraEfetiva = 'obra';

  function pintarObra(corpo) {
    var o = dados.obra, m = dados.mare, partes = montarObra();
    document.getElementById('mf-l-obra').textContent = 'I a ' + paraRomano(partes.total) + (o.autor ? ' · ' + o.autor : '');
    corpo.innerHTML = '<article class="mv-texto md mf-obra" data-secao="texto" data-rotulo="O texto">' + partes.corpo + '</article>' +
      '<aside class="mv-lado" data-secao="sumario" data-rotulo="Sumário">' + partes.sumario + maisLinks() + '</aside>';
    document.getElementById('mv-estado').textContent = (o.autor ? o.autor + ' · ' : '') + (publico ? 'livre para copiar, traduzir e contradizer' : 'no caderno: ' + o.rel) + (partes.xv ? ' · a XV é de ' + (data((m.data || '2026-09-28') + 'T12:00:00') || '28/09/2026') : '');
    document.getElementById('mv-acoes').innerHTML = (o.abs ? '<a class="botao" href="' + esc(obsidian(o.abs)) + '">' + ic('editar') + 'Abrir no Obsidian</a>' : '') +
      '<button type="button" class="botao leve" data-mv="baixar">' + ic('baixar') + 'Baixar .md</button>';
    /* o sumário acende a seção que está na tela */
    if ('IntersectionObserver' in window) {
      var links = {};
      corpo.querySelectorAll('.mf-sumario a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
      observador = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (!e.isIntersecting) return; Object.keys(links).forEach(function (k) { links[k].classList.toggle('na-tela', k === e.target.id); }); });
      }, { rootMargin: '-30% 0px -60% 0px' });
      corpo.querySelectorAll('.mf-sec, .mf-fontes').forEach(function (s) { observador.observe(s); });
    }
  }

  function maisLinks() {
    return '<nav class="mv-mais"><a class="mv-mais-a" href="manifestos.html">' + ic('manifestos') + '<span><b>Os manifestos da humanidade</b><small>de Lutero ao local-first</small></span></a>' +
      '<a class="mv-mais-a" href="filosofia.html">' + ic('filosofia') + '<span><b>A filosofia</b><small>os seus arquivos, a sua casa</small></span></a>' +
      '<a class="mv-mais-a" href="curadoria.html">' + ic('curadoria') + '<span><b>A Curadoria</b><small>toda escolha assinada</small></span></a></nav>';
  }

  /* a voz: as propostas [entre colchetes] aparecem marcadas */
  function render(md) {
    md = String(md || '').replace(/^\s*#\s[^\n]*\n/, ''); /* o título já está no alto da página */
    var html = window.MD ? window.MD.render(md) : '<pre>' + esc(md) + '</pre>';
    return html.replace(/\[([^\]<>]{2,400})\]/g, '<span class="mv-proposta" title="Proposta para você aceitar, mudar ou apagar">$1</span>');
  }
  function pintarVoz(corpo) {
    var noCaderno = !!(arquivo && arquivo.existe);
    var onV = dados && dados.ontologica && dados.ontologica.existe && window.Ontologica ? window.Ontologica.partes(dados.ontologica.texto) : null;
    corpo.innerHTML = '<article class="mv-texto md" id="mv-texto" data-secao="texto" data-rotulo="O texto">' + render(textoAtual()) + (onV ? '<div class="mf-quem">' + window.Ontologica.htmlQuemFez(onV) + '</div>' : '') + '</article>' +
      '<aside class="mv-lado" data-secao="fontes" data-rotulo="De onde vem">' +
        '<div class="cx mv-cx"><p class="rot">De onde vem cada frase</p><ul class="mv-fontes">' + M.fontes.map(function (f) { return '<li><b>' + esc(f[0]) + '</b><span>' + esc(publico ? semPasta(f[1]) : f[1]) + '</span></li>'; }).join('') + '</ul>' +
        '<p class="mv-nota">O que aparece <span class="mv-proposta">assim</span> é proposta, não fala ' + (publico ? 'do autor' : 'sua') + (publico ? '.' : ': aceite, mude ou apague.') + '</p>' +
        (temObra() ? '<p class="mv-nota">O texto longo, de I a XV, está na outra leitura: <button type="button" class="mf-link" data-mf-ler="obra">O Manifesto</button>.</p>' : '') + '</div>' +
        maisLinks() +
      '</aside>';
    document.getElementById('mv-estado').textContent = noCaderno ? (publico ? 'Escrito por Vitor de Mantova · ' + data(arquivo.modificado) : 'No caderno: ' + arquivo.rel + ' · editado em ' + data(arquivo.modificado)) : 'Rascunho de 9 de outubro de 2026 · as frases são suas · a assinatura vem com o seu sim';
    var podeGravar = !publico && !estatico && (arquivo || dados);
    document.getElementById('mv-acoes').innerHTML = (podeGravar ? (noCaderno ? '' : '<button type="button" class="botao pri" data-mv="levar">' + ic('livro') + 'Levar para o caderno</button>') +
      '<button type="button" class="botao" data-mv="editar">' + ic('editar') + 'Editar aqui</button>' : '') +
      (noCaderno && arquivo.abs ? '<a class="botao leve" href="' + esc(obsidian(arquivo.abs)) + '">' + ic('livro') + 'Abrir no Obsidian</a>' : '') +
      '<button type="button" class="botao leve" data-mv="baixar">' + ic('baixar') + 'Baixar .md</button>';
  }
  function salvar(texto, base) {
    return fetch('/api/perfil/salvar', { method: 'POST', headers: H, body: JSON.stringify({ chave: 'manifesto', texto: texto, base: base || '' }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.erro || 'Não consegui gravar.'); return j; }); });
  }
  function recarregar() {
    return fetch('/api/manifesto', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (d) {
      if (d && d.voz) { dados = d; arquivo = vozComoArquivo(d.voz); return pintar(); }
      return fetch('/api/perfil', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (p) { arquivo = p.arquivos.manifesto; pintar(); });
    });
  }
  function levar(b) {
    b.disabled = true;
    salvar(M.rascunho, '').then(function () { aviso('Pronto: o manifesto agora mora no seu caderno, ao lado dos outros manifestos.'); return recarregar(); })
      .catch(function (e) { aviso(e.message, true); b.disabled = false; });
  }
  function editar() {
    if (!P || !P.folha) return;
    var base = arquivo && arquivo.existe ? arquivo.hash : '';
    var f = P.folha({ titulo: 'Editar a sua voz', sub: arquivo && arquivo.existe ? esc(arquivo.rel) : 'Ao salvar, ele vai para o caderno', larga: true,
      html: '<form class="mv-edicao"><textarea name="t" rows="24" spellcheck="true">' + esc(textoAtual()) + '</textarea><p class="mv-nota">Markdown simples: # títulos, **negrito**, *itálico*, &gt; citação. O que estiver [entre colchetes] aparece como proposta. Antes de gravar, a versão anterior é copiada para dados/perfil-backups/.</p>' +
        '<div class="acoes"><button class="botao pri" type="submit">' + ic('check') + 'Salvar no caderno</button><button class="botao leve" type="button" data-folha-fechar>Cancelar</button></div></form>' });
    var form = f.corpo.querySelector('form');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var bt = form.querySelector('[type=submit]'); bt.disabled = true;
      salvar(form.t.value, base).then(function (j) { aviso('Salvo no caderno' + (j.backup ? ' (cópia anterior em ' + j.backup + ')' : '') + '.'); f.fechar(); return recarregar(); })
        .catch(function (e) { aviso(e.message, true); bt.disabled = false; });
    });
  }

  /* =============== 2. os manifestos da humanidade =============== */
  function montarManifestos() {
    var filtro = { familia: '', br: false };
    var nomeFam = {}; M.familias.forEach(function (f) { nomeFam[f[0]] = f[1]; });
    var seculo = function (a) { return Math.floor((a - 1) / 100) + 1; };
    var romano = function (n) { var v = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']], s = ''; v.forEach(function (x) { while (n >= x[0]) { s += x[1]; n -= x[0]; } }); return s; };
    raiz.innerHTML =
      '<div class="mv-filtros" data-secao="filtros" data-rotulo="Filtros"><div class="mv-chips" role="group" aria-label="Famílias"><button type="button" class="chip on" data-fam="">Todos</button>' +
        M.familias.map(function (f) { return '<button type="button" class="chip" data-fam="' + f[0] + '">' + esc(f[1]) + '</button>'; }).join('') +
        '<button type="button" class="chip mv-br" data-br aria-pressed="false">Só os do Brasil</button></div>' +
        '<div class="mv-densidade" aria-hidden="true"></div></div>' +
      '<div class="mv-linha" data-secao="linha" data-rotulo="Os manifestos"></div>';
    function desenhar() {
      var lista = M.manifestos.filter(function (m) { return (!filtro.familia || m.familia === filtro.familia) && (!filtro.br || m.br); });
      var porSec = {}; lista.forEach(function (m) { (porSec[seculo(m.ano)] = porSec[seculo(m.ano)] || []).push(m); });
      raiz.querySelector('.mv-linha').innerHTML = Object.keys(porSec).map(Number).sort(function (a, b) { return a - b; }).map(function (s) {
        return '<section class="mv-seculo"><h2 class="mv-sec-t"><span>século</span>' + romano(s) + '<small>' + porSec[s].length + (porSec[s].length === 1 ? ' manifesto' : ' manifestos') + '</small></h2><div class="mv-cards">' +
          porSec[s].map(function (m) {
            return '<article class="mv-card' + (m.nosso ? ' mv-nosso' : '') + (m.marca ? ' mv-marca' : '') + '" data-fam="' + m.familia + '">' +
              '<p class="mv-card-ano">' + m.ano + (m.br ? '<span class="mv-card-br">Brasil</span>' : '') + '</p>' +
              '<h3>' + esc(m.titulo) + '</h3><p class="mv-card-quem">' + esc(m.quem) + ' · ' + esc(m.onde) + '</p>' +
              '<p class="mv-card-pede"><span class="rot">pede</span>' + esc(m.pede) + '</p>' +
              (m.frase ? '<blockquote>' + esc(m.frase) + '</blockquote>' : '') +
              '<p class="mv-card-pe"><span class="mv-card-fam">' + esc(nomeFam[m.familia]) + '</span><a href="' + esc(m.url) + '"' + (/^https?:/.test(m.url) ? ' target="_blank" rel="noopener"' : '') + '>' + (m.nosso ? 'Ler o nosso' : 'Ler') + ' →</a></p>' +
              (m.marca ? '<p class="mv-card-nota">' + Q() + 'É daqui que vem a marca do Portal Solar.</p>' : '') + '</article>';
          }).join('') + '</div></section>';
      }).join('') || '<p class="cx">Nenhum manifesto com esses filtros.</p>';
      /* a densidade: quantos por século, num risco só */
      var cont = {}; M.manifestos.forEach(function (m) { var s = seculo(m.ano); cont[s] = (cont[s] || 0) + 1; });
      var max = Math.max.apply(null, Object.keys(cont).map(function (k) { return cont[k]; }));
      raiz.querySelector('.mv-densidade').innerHTML = Object.keys(cont).map(Number).sort(function (a, b) { return a - b; }).map(function (s) { return '<span style="--n:' + (cont[s] / max).toFixed(2) + '"><i></i><b>' + romano(s) + '</b><small>' + cont[s] + '</small></span>'; }).join('');
    }
    raiz.addEventListener('click', function (ev) {
      var f = ev.target.closest('[data-fam].chip'); if (f) { filtro.familia = f.dataset.fam; raiz.querySelectorAll('[data-fam].chip').forEach(function (b) { b.classList.toggle('on', b === f); }); desenhar(); return; }
      var br = ev.target.closest('[data-br]'); if (br) { filtro.br = !filtro.br; br.classList.toggle('on', filtro.br); br.setAttribute('aria-pressed', String(filtro.br)); desenhar(); }
    });
    desenhar();
  }

  /* =============== 3. a filosofia =============== */
  function montarFilosofia() {
    raiz.innerHTML =
      '<section class="mv-principios" data-secao="principios" data-rotulo="Os princípios"><h2 class="h2">Os princípios</h2><ol>' +
        M.principios.map(function (p, i) { return '<li id="' + p.id + '"><span class="mv-p-n">' + (i + 1) + '</span><div><h3>' + esc(p.titulo) + '</h3><p>' + esc(p.texto) + '</p><p class="mv-p-de">de: ' + esc(p.de) + '</p></div></li>'; }).join('') + '</ol></section>' +
      '<section class="mv-como" data-secao="como" data-rotulo="Como guarda"><h2 class="h2">Como o Portal Solar guarda as coisas</h2>' +
        '<div class="mv-fluxo">' +
          '<div class="mv-f-caixa mv-f-caderno"><b>O seu caderno</b><span>pastas e arquivos .md no seu computador: a fonte de tudo</span></div><i class="mv-f-seta" aria-hidden="true"></i>' +
          '<div class="mv-f-caixa"><b>O servidor de casa</b><span>um programa pequeno (servir.mjs) que só roda no seu computador e lê o caderno</span></div><i class="mv-f-seta" aria-hidden="true"></i>' +
          '<div class="mv-f-caixa"><b>O navegador</b><span>as páginas que você vê; as preferências ficam nele</span></div>' +
        '</div>' +
        '<div class="mv-fluxo mv-fluxo-2">' +
          '<div class="mv-f-caixa mv-f-chave"><b>A conta</b><span>uma chave para abrir a sua casa do celular ou de outro computador; a senha fica só como um resumo (scrypt), em dados/, fora do caderno</span></div>' +
          '<div class="mv-f-caixa"><b>A ficha</b><span>o que você escolhe mostrar; vira página pública só se você exportar</span></div>' +
          '<div class="mv-f-caixa"><b>A rede</b><span>fichas que viajam como arquivos ou links, com elos e porquês, sem servidor central</span></div>' +
        '</div><p class="mv-nota">Se o Portal Solar sumir amanhã, o caderno continua inteiro, legível em qualquer editor de texto.' + (estatico ? '' : ' <a href="entrar.html">Ver a Conta →</a>') + '</p></section>' +
      '<section class="mv-leituras" data-secao="leituras" data-rotulo="As leituras"><h2 class="h2">As leituras</h2><ul>' +
        M.leituras.map(function (l) { return '<li><span class="mv-l-ano">' + l[2] + '</span><div><b>' + esc(l[1]) + '</b><span>' + esc(l[0]) + '</span><small>' + esc(l[3]) + '</small></div></li>'; }).join('') + '</ul></section>';
  }

  if (!M || !raiz) return;
  if (pagina === 'manifesto') montarManifesto();
  else if (pagina === 'manifestos') montarManifestos();
  else if (pagina === 'filosofia') montarFilosofia();
  if (window.Arrumar) window.Arrumar.aplicar();
})();
