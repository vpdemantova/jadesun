/* ============================================================
   Portal Solar · participe.js (13/out/2026) — "Faça parte".
   Pedido: "o novo projeto é coletivo e necessário e precisa de muito
   auxílio e cooperação… coloque um lugar pra candidatos a fazer design,
   código e outras funções, como ontologia e tudo mais."

   O que fica e o que se refaz; as funções (cada uma com um primeiro passo
   de verdade); a candidatura, que vira uma ficha .md da própria pessoa
   (nada sai do navegador até ela enviar); como funciona; os princípios.
   O envio usa coletivo-config.js (e-mail ou link); vazio = baixar e copiar.
   ============================================================ */
(function () {
  'use strict';
  var P = window.Perfil || {};
  var C = window.COLETIVO_CONFIG || { contato: {} };
  var raiz = document.getElementById('participe');
  if (!raiz) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ic(n) { return P.icone ? P.icone(n) : ''; }
  var ESTATICO = !!window.JADESUN_ESTATICO;
  var CH = 'portal-candidatura';

  /* id, nome, ícone, o que é, o primeiro passo, do que precisa */
  var FUNCOES = [
    ['design', 'Design de interface', 'grade', 'Redesenhar as telas, os componentes e o sistema de cores, letras e espaço. Cada proposta vai para a galeria, com o seu nome.', 'Redesenhe uma ficha do Atlas (imagem, texto e navegação) a partir da galeria e das referências.', 'olho para hierarquia e tipografia; Figma, outro programa ou papel'],
    ['movimento', 'Movimento e luz', 'sol', 'Transições, shaders e animações que ajudam a ler e a entender, nunca a distrair.', 'Proponha a passagem entre páginas em que a tela que sai e a que entra se misturam a partir do Quadrado.', 'GLSL ou WGSL, ou só boas ideias de movimento'],
    ['codigo', 'Código: a interface', 'codigo', 'HTML, CSS e JavaScript sem framework: rápido, acessível, funcionando até sem internet.', 'Pegue uma tarefa pequena da lista do projeto, como o botão de pausar o movimento.', 'JavaScript e CSS; cuidado com acessibilidade'],
    ['dados', 'Código: dados e servidor', 'dados', 'O leitor de Markdown, a busca, a exportação do site e o caminho das fichas até a tela.', 'Melhore a busca do Índice ou a exportação do site estático.', 'Node.js e gosto por arquivos de texto'],
    ['ontologia', 'Ontologia', 'rede', 'Como o conhecimento se organiza: os tipos de ficha, as relações entre elas (vem antes, abre, cita, está ao lado) e um vocabulário comum.', 'Proponha as relações entre as fichas de uma área, como a Música, e os nomes de cada uma.', 'pensamento de sistema; biblioteconomia, filosofia ou ciência da informação ajudam'],
    ['curadoria', 'Curadoria', 'curadoria', 'Escolher fontes, obras e imagens com licença aberta, e assinar e datar cada escolha.', 'Traga três referências para uma área, cada uma com o porquê e o link conferido.', 'repertório e honestidade'],
    ['checagem', 'Pesquisa e checagem', 'alvo', 'Conferir fatos, datas e fontes. Aqui nada é inventado: o que não se sabe fica vazio.', 'Confira dez fichas do Atlas contra as fontes e anote o que precisa mudar.', 'paciência e rigor'],
    ['escrita', 'Escrita e revisão', 'editar', 'Fichas, guias e textos claros em português, sem jargão.', 'Reescreva uma ficha para que alguém de doze anos entenda tudo.', 'boa escrita e gosto por explicar'],
    ['traducao', 'Tradução', 'lista', 'Levar o Portal a outras línguas, com o mesmo cuidado.', 'Traduza o Manifesto ou uma trilha de estudo.', 'domínio de outra língua'],
    ['acessibilidade', 'Acessibilidade', 'olho', 'Leitor de tela, teclado, contraste, linguagem simples: o Portal tem de ser de todo mundo.', 'Navegue o site só pelo teclado e com um leitor de tela, e anote onde trava.', 'experiência com tecnologias assistivas, ou vontade de aprender'],
    ['imagem', 'Imagem e ilustração', 'camadas', 'Pranchas, ícones, diagramas e mapas, com licença aberta.', 'Desenhe o diagrama de uma trilha de estudo, da primeira ficha à última.', 'desenho, à mão ou no computador'],
    ['musica', 'Música e som', 'musica', 'A parte musical do Atlas, os sons da interface e as trilhas.', 'Proponha os sons do protetor de tela, ou escreva a ficha de uma obra musical.', 'ouvido e cuidado'],
    ['educacao', 'Educação', 'estudos', 'Trilhas de estudo, exercícios com gabarito, a ordem dos pré-requisitos: aprender de verdade.', 'Monte a trilha de uma matéria, com exercícios e gabarito.', 'experiência de ensinar'],
    ['comunidade', 'Comunidade e cuidado', 'coracao', 'Acolher quem chega, mediar as conversas, organizar encontros.', 'Escreva o guia de boas-vindas para quem chega.', 'escuta e paciência'],
  ];
  var nomeDe = {}; FUNCOES.forEach(function (f) { nomeDe[f[0]] = f[1]; });

  function ler() { try { return JSON.parse(localStorage.getItem(CH) || '{}') || {}; } catch (e) { return {}; } }
  function gravar(o) { try { localStorage.setItem(CH, JSON.stringify(o)); } catch (e) { /* ok */ } }
  var dados = ler();
  dados.funcoes = dados.funcoes || [];
  var doEndereco = location.hash.slice(1);
  if (doEndereco && nomeDe[doEndereco] && dados.funcoes.indexOf(doEndereco) < 0) dados.funcoes.push(doEndereco);

  var tem = !!(C.contato && (C.contato.email || C.contato.link));

  raiz.innerHTML =
    '<section class="cv-sec" id="fica" aria-labelledby="h-fica"><header><p class="rot">O que fica e o que se refaz</p><h2 id="h-fica">O nome continua. O desenho, a gente refaz junto.</h2></header>' +
      '<div class="pa-fica">' +
        '<div><h3>Fica</h3><ul>' +
          '<li>O nome: <b>Portal Solar</b>.</li>' +
          '<li>O Quadrado Negro no centro, de onde se chega a tudo.</li>' +
          '<li>O Atlas como mapa do conhecimento, aberto a qualquer pessoa.</li>' +
          '<li>Fichas em vez de perfis: sem feed, sem curtidas, sem seguidores.</li>' +
          '<li>As três colunas de leitura: imagens, texto e navegação.</li>' +
          '<li>A fonte ao lado de cada frase. Nada inventado.</li>' +
          '<li>Funcionar para todo mundo: no celular, sem internet, pelo teclado, com leitor de tela.</li>' +
        '</ul></div>' +
        '<div><h3>Se refaz, junto</h3><ul>' +
          '<li>O desenho de cada tela, das cores às letras, dos botões aos menus.</li>' +
          '<li>Os caminhos entre as páginas e as trilhas de estudo.</li>' +
          '<li>A ontologia: como as fichas se ligam e como as relações se chamam.</li>' +
          '<li>As línguas, os sons, as imagens e as explicações.</li>' +
          '<li>O que mais a comunidade achar que falta.</li>' +
        '</ul></div>' +
      '</div>' +
      '<p class="cv-lead">Os designs são públicos: cada proposta vai para a <a href="galeria.html">galeria de design</a>, com o nome de quem fez e a licença aberta do Portal (' + esc(C.licenca || 'CC BY-SA 4.0') + ').</p>' +
    '</section>' +

    '<section class="cv-sec" id="funcoes" aria-labelledby="h-funcoes"><header><p class="rot">As funções</p><h2 id="h-funcoes">Precisamos de muita gente, e de gente diferente</h2>' +
      '<p>Escolha uma ou mais funções. Cada uma tem um primeiro passo pequeno e de verdade, para começar sem pedir licença.</p></header>' +
      '<ul class="pa-funcoes">' + FUNCOES.map(function (f) {
        var on = dados.funcoes.indexOf(f[0]) >= 0;
        return '<li class="pa-f' + (on ? ' escolhida' : '') + '" id="' + f[0] + '">' +
          '<div class="pa-f-cab">' + ic(f[2]) + '<h3>' + esc(f[1]) + '</h3></div>' +
          '<p>' + esc(f[3]) + '</p>' +
          '<p class="pa-passo"><span class="pa-rot">O primeiro passo</span>' + esc(f[4]) + '</p>' +
          '<p class="pa-precisa"><span class="pa-rot">Precisa de</span>' + esc(f[5]) + '</p>' +
          '<button type="button" class="pa-quero" data-f="' + f[0] + '" aria-pressed="' + on + '">' + (on ? 'Escolhida' : 'Quero esta') + '</button></li>';
      }).join('') + '</ul></section>' +

    '<section class="cv-sec" id="candidatura" aria-labelledby="h-cand"><header><p class="rot">A candidatura</p><h2 id="h-cand">A sua ficha de candidatura</h2>' +
      '<p>Ela é um arquivo seu, como todas as fichas do Portal. Nada sai deste navegador até você enviar; dá para baixar, copiar e mandar por onde quiser.</p></header>' +
      '<form class="pa-form" id="pa-form" novalidate>' +
        '<div class="pa-campos">' +
          '<label>Nome<input type="text" name="nome" autocomplete="name" value="' + esc(dados.nome || '') + '"></label>' +
          '<label>Onde você vive <small>cidade e país</small><input type="text" name="onde" value="' + esc(dados.onde || '') + '"></label>' +
          '<div><span class="pa-rot" style="display:block;font:700 .8rem/1.2 var(--f-display)">As funções escolhidas</span><div class="pa-escolhidas" id="pa-escolhidas"></div></div>' +
          '<label>Links do seu trabalho <small>portfólio, GitHub, Behance, Figma: um por linha</small><textarea name="links" rows="3">' + esc(dados.links || '') + '</textarea></label>' +
          '<label>Por que você quer participar <small>e o que gostaria de fazer primeiro</small><textarea name="porque" rows="5">' + esc(dados.porque || '') + '</textarea></label>' +
          '<label>Tempo por semana<select name="tempo">' + ['', 'até 2 horas', '2 a 5 horas', '5 a 10 horas', 'mais de 10 horas'].map(function (t) { return '<option value="' + esc(t) + '"' + (dados.tempo === t ? ' selected' : '') + '>' + (t || 'escolha') + '</option>'; }).join('') + '</select></label>' +
          '<label>Línguas<input type="text" name="linguas" value="' + esc(dados.linguas || '') + '" placeholder="português, inglês…"></label>' +
          '<label>Como prefere ser contatado <small>e-mail, telefone ou rede: é você quem escolhe</small><input type="text" name="contato" value="' + esc(dados.contato || '') + '"></label>' +
        '</div>' +
        '<aside class="pa-previa" aria-label="A ficha que vai ser enviada"><p class="rot">A sua ficha, como vai ser enviada</p><pre id="pa-md"></pre>' +
          '<div class="pa-acoes">' +
            (tem ? '<button type="button" class="botao pri" data-pa="enviar">' + ic('seguir') + 'Enviar a candidatura</button>' : '') +
            '<button type="button" class="botao' + (tem ? '' : ' pri') + '" data-pa="baixar">' + ic('baixar') + 'Baixar (.md)</button>' +
            '<button type="button" class="botao" data-pa="copiar">' + ic('copiar') + 'Copiar</button>' +
            '<button type="button" class="botao leve" data-pa="limpar">Limpar</button>' +
          '</div>' +
          '<p class="pa-aviso" id="pa-aviso" role="status">' + (tem ? '' : 'O envio pelo site abre em breve. Baixe ou copie a sua ficha: quando o canal abrir, ela já está pronta.' + (ESTATICO ? '' : ' (Para abrir o envio: um e-mail ou link em <code>coletivo-config.js</code>.)')) + '</p>' +
        '</aside>' +
      '</form>' +
    '</section>' +

    '<section class="cv-sec" id="como" aria-labelledby="h-como"><header><p class="rot">Como funciona</p><h2 id="h-como">Do primeiro passo à galeria</h2></header>' +
      '<ol class="pa-passos">' +
        '<li>Você manda a sua ficha, com as funções que escolheu.</li>' +
        '<li>A gente combina um primeiro passo pequeno, como os desta página.</li>' +
        '<li>O que você fizer entra no Portal, ou na galeria, com o seu nome.</li>' +
        '<li>As decisões grandes ficam por escrito e abertas, para todos verem por quê.</li>' +
      '</ol>' +
      '<h3 class="h3" style="margin:22px 0 8px">Os princípios</h3>' +
      '<ul class="pa-principios">' +
        '<li>Nada inventado: o que não se sabe fica vazio, e cada frase leva a sua fonte.</li>' +
        '<li>Sem feed, sem curtidas, sem seguidores: as pessoas se ligam por um porquê escrito.</li>' +
        '<li>Feito para todos: celular, sem internet, teclado, leitor de tela, linguagem simples.</li>' +
        '<li>Aberto: o que se faz aqui vai com licença ' + esc(C.licenca || 'CC BY-SA 4.0') + ' e o nome de quem fez.</li>' +
        '<li>É trabalho voluntário, por enquanto. Se um dia houver dinheiro, a regra de como dividir vai ser escrita e aberta antes.</li>' +
      '</ul>' +
      (C.organizador ? '<p class="cv-lead" style="font-size:1rem">Quem começou o Portal Solar e organiza este chamado: ' + (C.site ? '<a href="' + esc(C.site) + '" target="_blank" rel="noopener">' + esc(C.organizador) + '</a>' : esc(C.organizador)) + '.</p>' : '') +
    '</section>';

  var form = document.getElementById('pa-form');
  var pre = document.getElementById('pa-md');
  var aviso = document.getElementById('pa-aviso');

  function hoje() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function umaLinha(t) { return String(t || '').replace(/\s*\n\s*/g, ' ').trim(); }
  function ficha() {
    var v = form.elements;
    var links = String(v.links.value || '').split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    return '---\ntipo: candidatura\nprojeto: Portal Solar\ndata: ' + hoje() + '\nfuncoes: [' + dados.funcoes.join(', ') + ']\n---\n\n' +
      '# ' + (umaLinha(v.nome.value) || 'Seu nome') + '\n\n' +
      '- **Onde:** ' + (umaLinha(v.onde.value) || '—') + '\n' +
      '- **Funções:** ' + (dados.funcoes.map(function (f) { return nomeDe[f]; }).join(', ') || '—') + '\n' +
      '- **Tempo por semana:** ' + (v.tempo.value || '—') + '\n' +
      '- **Línguas:** ' + (umaLinha(v.linguas.value) || '—') + '\n' +
      '- **Contato:** ' + (umaLinha(v.contato.value) || '—') + '\n' +
      (links.length ? '\n## Trabalhos\n\n' + links.map(function (l) { return '- ' + l; }).join('\n') + '\n' : '') +
      '\n## Por que quero participar\n\n' + (String(v.porque.value || '').trim() || '—') + '\n';
  }
  function pintarEscolhidas() {
    var el = document.getElementById('pa-escolhidas');
    el.innerHTML = dados.funcoes.length ? dados.funcoes.map(function (f) { return '<span>' + esc(nomeDe[f]) + '</span>'; }).join('') : '<em>Nenhuma ainda: escolha acima, em "Quero esta".</em>';
  }
  function atualizar() {
    var v = form.elements;
    ['nome', 'onde', 'links', 'porque', 'tempo', 'linguas', 'contato'].forEach(function (k) { dados[k] = v[k].value; });
    gravar(dados);
    pre.textContent = ficha();
    pintarEscolhidas();
  }
  form.addEventListener('input', atualizar);
  form.addEventListener('change', atualizar);
  atualizar();
  if (doEndereco && nomeDe[doEndereco]) setTimeout(function () { var el = document.getElementById(doEndereco); if (el) el.scrollIntoView({ block: 'center' }); }, 300);

  raiz.addEventListener('click', function (ev) {
    var q = ev.target.closest('.pa-quero');
    if (q) {
      var id = q.getAttribute('data-f'), k = dados.funcoes.indexOf(id);
      if (k >= 0) dados.funcoes.splice(k, 1); else dados.funcoes.push(id);
      var on = k < 0;
      q.setAttribute('aria-pressed', String(on)); q.textContent = on ? 'Escolhida' : 'Quero esta';
      q.closest('.pa-f').classList.toggle('escolhida', on);
      atualizar();
      return;
    }
    var b = ev.target.closest('[data-pa]');
    if (!b) return;
    var o = b.getAttribute('data-pa'), md = ficha();
    var nome = (umaLinha(form.elements.nome.value) || 'candidatura').replace(/[\\/:*?"<>|]+/g, '').trim();
    if (o === 'baixar') {
      var url = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
      var a = document.createElement('a'); a.href = url; a.download = 'Candidatura — ' + nome + '.md'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      aviso.textContent = 'Baixada: “Candidatura — ' + nome + '.md”.';
    } else if (o === 'copiar') {
      copiar(md, function (ok) { aviso.textContent = ok ? 'Copiada. Agora é só colar onde quiser mandar.' : 'Não consegui copiar sozinho: selecione o texto da ficha e copie.'; });
    } else if (o === 'enviar') {
      if (!form.elements.nome.value.trim() || !dados.funcoes.length) { aviso.textContent = 'Faltam o seu nome e ao menos uma função.'; return; }
      if (C.contato.email) {
        location.href = 'mailto:' + encodeURIComponent(C.contato.email) + '?subject=' + encodeURIComponent('Candidatura · Portal Solar · ' + nome) + '&body=' + encodeURIComponent(md);
        aviso.textContent = 'Abri o seu programa de e-mail com a ficha. Se não abriu, baixe ou copie e mande para ' + C.contato.email + '.';
      } else if (C.contato.link) {
        copiar(md, function () { window.open(C.contato.link, '_blank', 'noopener'); aviso.textContent = 'A ficha foi copiada; cole no formulário que abriu.'; });
      }
    } else if (o === 'limpar') {
      if (!window.confirm('Apagar o que você escreveu nesta ficha?')) return;
      dados = { funcoes: [] }; gravar(dados);
      form.reset(); ['nome', 'onde', 'links', 'porque', 'linguas', 'contato'].forEach(function (k) { form.elements[k].value = ''; });
      raiz.querySelectorAll('.pa-quero').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); x.textContent = 'Quero esta'; x.closest('.pa-f').classList.remove('escolhida'); });
      atualizar(); aviso.textContent = 'Ficha limpa.';
    }
  });
  function copiar(t, fim) {
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(function () { fim(true); }, function () { manual(); });
    else manual();
    function manual() {
      var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove(); fim(ok);
    }
  }
})();
