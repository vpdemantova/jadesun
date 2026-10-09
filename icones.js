/* ============================================================
   ÍCONES DO PORTAL SOLAR (08/out/2026, PERFIL.md item 73; novos em 09/out, item 74)
   Um sistema só, desenhado do zero, com regras de construção:
   · grade de 24, área viva de 3 a 21 (como as grades de Otl Aicher, Munique 1972);
   · só retas a 0°, 45° e 90° e arcos de círculo; nada de curva livre;
   · traço único de 1,75, terminais retos e cantos vivos (sem o "arredondado de sempre");
   · um elemento sólido por ícone quando ajuda a ler (cabeça, sol, porta, nó):
     a metáfora antes do enfeite (Susan Kare); simples porque a ideia é boa (Paul Rand).
   Uso: Icones.svg('casa')  →  <svg class="ico">…</svg>
   Os sólidos levam class="f" (preenchidos com a cor do texto).
   ============================================================ */
(function (raiz) {
  'use strict';

  var P = {
    /* ---------- as quatro portas ---------- */
    atlas: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13 13 0 0 1 0 18a13 13 0 0 1 0-18z"/><circle class="f" cx="8.5" cy="15.5" r="1.6"/>',
    hoje: '<circle class="f" cx="12" cy="12" r="4"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    eu: '<circle class="f" cx="12" cy="7.5" r="3.5"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
    casa: '<path d="M3 11.5L12 2.5l9 9"/><path d="M5.5 9v12h13V9"/><rect class="f" x="10" y="14.5" width="4" height="6.5"/>',

    /* ---------- lugares e coisas ---------- */
    jardim: '<path d="M12 21V8.5"/><path class="f" d="M12 13.5a6 6 0 0 0-6-6a6 6 0 0 0 6 6z"/><path class="f" d="M12 10a5 5 0 0 1 5-5a5 5 0 0 1-5 5z"/><path d="M6 21h12"/>',
    estante: '<path d="M3.5 3v18M20.5 3v18M3.5 21h17M3.5 12h17"/><path d="M7 12V5M10 12V6.5M12.5 12l4.5-4.5"/><rect class="f" x="14.5" y="14.5" width="3" height="6.5"/><path d="M7 21v-6M10 21v-4.5"/>',
    'guarda-roupa': '<path d="M12 7.5a2 2 0 1 1 2-2"/><path d="M12 7.5L4 15.5v2h16v-2z"/><rect class="f" x="10.75" y="17.5" width="2.5" height="3.5"/>',
    livro: '<path d="M3 5h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H3z"/><path d="M21 5h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
    roupa: '<path d="M8.5 3.5L3.5 8.5l2.5 2.5 2.5-2.5v12h7v-12l2.5 2.5 2.5-2.5-5-5a3.5 3.5 0 0 1-7 0z"/>',
    ficha: '<rect x="4" y="3" width="16" height="18"/><path d="M7.5 8h9M7.5 12h9M7.5 16h5"/><rect class="f" x="4" y="3" width="16" height="2.5"/>',
    lugar: '<path d="M12 21.5l-5.7-5.7a8 8 0 1 1 11.4 0z"/><circle class="f" cx="12" cy="10.2" r="2.8"/>',
    planeta: '<circle cx="12" cy="12" r="9"/><path class="f" d="M7.8 16.2a7 7 0 0 1 8.4-8.4a7 7 0 0 1-8.4 8.4z"/>',
    rede: '<path d="M5 12l7-7 7 7-7 7z"/><path d="M5 12h14"/><circle class="f" cx="12" cy="5" r="2.3"/><circle class="f" cx="5" cy="12" r="2"/><circle class="f" cx="19" cy="12" r="2"/><circle class="f" cx="12" cy="19" r="2"/>',
    mapa: '<rect class="f" x="3" y="3.5" width="5" height="5"/><rect class="f" x="16" y="3.5" width="5" height="5"/><rect class="f" x="9.5" y="15.5" width="5" height="5"/><path d="M8 6h8M12 6v9.5"/>',
    quando: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5V12h5"/><circle class="f" cx="12" cy="12" r="1.6"/>',
    domino: '<rect x="3.5" y="3.5" width="7" height="7"/><rect class="f" x="13.5" y="3.5" width="7" height="7"/><rect x="3.5" y="13.5" width="7" height="7"/><rect x="13.5" y="13.5" width="7" height="7"/>',
    biblioteca: '<path d="M3 5h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H3z"/><path d="M21 5h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
    museu: '<path d="M5 9.5l7-7 7 7"/><path d="M3 9.5h18M3 21h18"/><path d="M6 12v6.5M10 12v6.5M14 12v6.5M18 12v6.5"/>',
    musica: '<path d="M10 17.5V3.5h9.5v11"/><path d="M10 7.5h9.5"/><circle class="f" cx="7" cy="17.5" r="3"/><circle class="f" cx="16.5" cy="14.5" r="3"/>',
    estudos: '<path d="M2.5 13.5h19M5 13.5V21M19 13.5V21"/><path d="M8 13.5V9l4.5-4.5"/><path class="f" d="M11 6l3.5-3.5L19 7z"/>',
    protetor: '<rect x="3" y="4" width="18" height="12.5"/><path d="M9 21h6M12 16.5V21"/><path class="f" d="M8.5 13.5a3.5 3.5 0 0 1 7 0z"/>',
    copiar: '<path d="M15 4l5 5L9 20H4v-5z"/><path d="M12.5 6.5l5 5"/>',
    sistema: '<rect class="f" x="3.5" y="3.5" width="4.5" height="4.5"/><rect x="9.75" y="3.5" width="4.5" height="4.5"/><rect x="16" y="3.5" width="4.5" height="4.5"/><rect x="3.5" y="9.75" width="4.5" height="4.5"/><rect x="9.75" y="9.75" width="4.5" height="4.5"/><rect x="16" y="9.75" width="4.5" height="4.5"/><rect x="3.5" y="16" width="4.5" height="4.5"/><rect x="9.75" y="16" width="4.5" height="4.5"/><rect x="16" y="16" width="4.5" height="4.5"/>',
    carta: '<rect x="6" y="3.5" width="12" height="17"/><path d="M3 7v13.5"/><path d="M21 7v13.5"/><circle class="f" cx="12" cy="10" r="2.5"/><path d="M9 15h6"/>',

    /* ---------- ações ---------- */
    tudo: '<circle cx="10.5" cy="10.5" r="6.5"/><path class="f" d="M14.6 16.1l1.5-1.5 5.4 5.4-1.5 1.5z"/><path d="M10.5 7.5v6M7.5 10.5h6"/>',
    buscar: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.2 15.2L21 21"/>',
    pers: '<path d="M3 6h18M3 12h18M3 18h18"/><rect class="f" x="13" y="3.5" width="4.5" height="5"/><rect class="f" x="6" y="9.5" width="4.5" height="5"/><rect class="f" x="11" y="15.5" width="4.5" height="5"/>',
    voltar: '<path d="M10 5l-7 7 7 7"/><path d="M3 12h18"/>',
    seguir: '<path d="M14 5l7 7-7 7"/><path d="M21 12H3"/>',
    fechar: '<path d="M5 5l14 14M19 5L5 19"/>',
    mais: '<rect class="f" x="3.5" y="10.5" width="3" height="3"/><rect class="f" x="10.5" y="10.5" width="3" height="3"/><rect class="f" x="17.5" y="10.5" width="3" height="3"/>',
    adicionar: '<path d="M12 4v16M4 12h16"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    coracao: '<path d="M12 20.5L5.6 14.1a4.53 4.53 0 0 1 6.4-6.4 4.53 4.53 0 0 1 6.4 6.4z"/>',
    'coracao-cheio': '<path class="f" d="M12 20.5L5.6 14.1a4.53 4.53 0 0 1 6.4-6.4 4.53 4.53 0 0 1 6.4 6.4z"/>',
    compartilhar: '<path d="M5 11.5v9h14v-9"/><path d="M12 15V3.5"/><path d="M7.5 8L12 3.5 16.5 8"/>',
    baixar: '<path d="M12 3.5V15"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M4 17v3.5h16V17"/>',
    link: '<rect x="2.6" y="9" width="10" height="6" rx="3" transform="rotate(-45 7.6 12)"/><rect x="11.4" y="9" width="10" height="6" rx="3" transform="rotate(-45 16.4 12)"/><path d="M9.5 14.5l5-5"/>',
    'tela-cheia': '<path d="M3.5 9V3.5H9M15 3.5h5.5V9M20.5 15v5.5H15M9 20.5H3.5V15"/>',
    olho: '<path d="M2.5 12a10.5 10.5 0 0 1 19 0 10.5 10.5 0 0 1-19 0z"/><circle class="f" cx="12" cy="12" r="3"/>',
    'olho-fechado': '<path d="M2.5 12a10.5 10.5 0 0 1 19 0 10.5 10.5 0 0 1-19 0z"/><path d="M4 4l16 16"/>',
    arrastar: '<rect class="f" x="7.5" y="4" width="3" height="3"/><rect class="f" x="13.5" y="4" width="3" height="3"/><rect class="f" x="7.5" y="10.5" width="3" height="3"/><rect class="f" x="13.5" y="10.5" width="3" height="3"/><rect class="f" x="7.5" y="17" width="3" height="3"/><rect class="f" x="13.5" y="17" width="3" height="3"/>',
    'seta-cima': '<path d="M5 11l7-7 7 7"/><path d="M12 4v16"/>',
    'seta-baixo': '<path d="M5 13l7 7 7-7"/><path d="M12 20V4"/>',
    desfazer: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    refazer: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
    editar: '<path d="M15 4l5 5L9 20H4v-5z"/><path d="M12.5 6.5l5 5"/>',
    /* item 75: a régua do tempo (aproximar, afastar) e o caderno de notas (nota, pasta, arquivo, mover) */
    aproximar: '<path d="M12 5v14M5 12h14"/>',
    dados: '<path d="M3 20h18"/><rect x="5" y="11" width="3" height="6" rx=".6"/><rect x="10.5" y="5" width="3" height="12" rx=".6"/><rect x="16" y="8.5" width="3" height="8.5" rx=".6"/>',
    afastar: '<path d="M5 12h14"/>',
    nota: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18"/><path d="M12.5 8h3.5M12.5 12h3.5"/>',
    pasta: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H10l2 2.5h7.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"/>',
    arquivo: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/>',
    mover: '<path d="M4 12h11"/><path d="M11 7l5 5-5 5"/><path d="M20 5v14"/>',
    lixeira: '<path d="M3.5 6.5h17M9.5 6.5V3.5h5v3M6 6.5v14h12v-14"/><path d="M10 10.5v6M14 10.5v6"/>',
    filtro: '<path d="M3.5 4.5h17L14 11v8.5l-4-2V11z"/>',
    ajuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 2.5 2.5V14"/><rect class="f" x="10.75" y="16" width="2.5" height="2.5"/>',
    sobre: '<circle cx="12" cy="12" r="9"/><path d="M12 10.5V17"/><rect class="f" x="10.75" y="6.5" width="2.5" height="2.5"/>',
    relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5V12h5"/>',
    play: '<path class="f" d="M7 4.5v15L19 12z"/>',
    pausa: '<rect class="f" x="6" y="4.5" width="4" height="15"/><rect class="f" x="14" y="4.5" width="4" height="15"/>',
    alvo: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle class="f" cx="12" cy="12" r="1.8"/>',
    prazo: '<path d="M6 3h12M6 21h12"/><path d="M7 3v3.5l5 5 5-5V3M7 21v-3.5l5-5 5 5V21"/><path class="f" d="M9 21v-.5l3-3 3 3v.5z"/>',
    codigo: '<path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5"/>',
    lembrete: '<circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/>',
    baralho: '<rect x="3.5" y="6.5" width="12" height="14"/><path d="M8 3.5h12.5V17"/><circle class="f" cx="9.5" cy="13.5" r="2.2"/>',
    grade: '<rect x="3.5" y="3.5" width="7" height="7"/><rect x="13.5" y="3.5" width="7" height="7"/><rect x="3.5" y="13.5" width="7" height="7"/><rect x="13.5" y="13.5" width="7" height="7"/>',
    lista: '<path d="M8.5 6h12M8.5 12h12M8.5 18h12"/><rect class="f" x="3.5" y="4.5" width="3" height="3"/><rect class="f" x="3.5" y="10.5" width="3" height="3"/><rect class="f" x="3.5" y="16.5" width="3" height="3"/>',
    camadas: '<path d="M12 3.5L21 8l-9 4.5L3 8z"/><path d="M3 12l9 4.5 9-4.5M3 16l9 4.5 9-4.5"/>',
    arrumar: '<path d="M3.5 6h9M3.5 12h9M3.5 18h9"/><path d="M17.5 4v16"/><path d="M14.5 7l3-3 3 3M14.5 17l3 3 3-3"/>',
    restaurar: '<path d="M4 4v5.5h5.5"/><path d="M4.5 9A8.5 8.5 0 1 1 3.5 13"/>',
    sol: '<circle class="f" cx="12" cy="12" r="4.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
    lua: '<path d="M15 3.5a8.5 8.5 0 1 0 5.5 13 7 7 0 0 1-5.5-13z"/>',
    tag: '<path d="M3.5 3.5h8L20.5 12.5l-8 8-9-9z"/><rect class="f" x="6.5" y="6.5" width="3" height="3"/>',
    /* as ferramentas da planta da Casa e o que as cenas 3D pedem */
    mover: '<path d="M12 3v18M3 12h18"/><path d="M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>',
    comodo: '<rect x="3.5" y="4.5" width="17" height="15"/><path d="M3.5 12H11v7.5"/><rect class="f" x="14" y="7.5" width="3.5" height="3.5"/>',
    porta: '<path d="M6 21V3.5h11V21M3.5 21h17"/><rect class="f" x="13" y="11" width="2" height="2.5"/>',
    janela: '<rect x="3.5" y="4.5" width="17" height="15"/><path d="M12 4.5v15M3.5 12h17"/>',
    movel: '<path d="M3.5 17.5v-6h17v6M6 11.5V7h12v4.5M3.5 17.5h17M5 17.5v3M19 17.5v3"/>',
    apagar: '<path d="M3.5 6.5h17M9.5 6.5V3.5h5v3M6 6.5v14h12v-14"/><path d="M10 10.5v6M14 10.5v6"/>',
    progresso: '<rect class="f" x="4" y="13" width="3.5" height="7.5"/><rect class="f" x="10.25" y="4" width="3.5" height="16.5"/><rect class="f" x="16.5" y="9" width="3.5" height="11.5"/><path d="M2.5 21h19"/>',
    abaixo: '<path d="M6 9l6 6 6-6"/>',
    sortear: '<path d="M3.5 7H8l10 10h2.5M3.5 17H8L18 7h2.5"/><path d="M18 4.5l2.5 2.5-2.5 2.5M18 14.5l2.5 2.5-2.5 2.5"/>',
    acima: '<path d="M6 15l6-6 6 6"/>',
    'porta-armario': '<rect x="4.5" y="3" width="15" height="18"/><path d="M12 3v18"/><rect class="f" x="9" y="10.5" width="1.75" height="3"/><rect class="f" x="13.25" y="10.5" width="1.75" height="3"/>',

    /* ---------- 09/out/2026 (item 74): o Portal, o Manifesto, os Guias, a Curadoria, a Conta ---------- */
    /* o Portal: o Círculo Negro de Malevich (1915) e uma órbita que passa por ele */
    portal: '<circle class="f" cx="12" cy="12" r="4.25"/><path d="M12 3a9 9 0 1 1-9 9"/><circle class="f" cx="3" cy="12" r="1.75"/>',
    /* o Manifesto: o Quadrado Negro */
    manifesto: '<path class="f" d="M4.5 4.5h15v15h-15z"/>',
    /* os manifestos da humanidade: folhas umas sobre as outras */
    manifestos: '<path d="M8 3.5h12.5V16"/><path d="M3.5 8h12.5v12.5H3.5z"/><path class="f" d="M6.5 11h6.5v2H6.5z"/>',
    /* a filosofia: o círculo dividido (o que é seu e o que é de todos) */
    filosofia: '<circle cx="12" cy="12" r="8.5"/><path class="f" d="M12 3.5a8.5 8.5 0 0 1 0 17z"/>',
    /* os Guias: a bússola, com o norte cheio */
    guias: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v11"/><path class="f" d="M12 5l3.5 3.5h-7z"/>',
    /* a Curadoria: um quadro no cavalete, com o quadrado dentro */
    curadoria: '<path d="M4.5 3.5h15v12h-15z"/><path d="M8.5 20l3.5-3.5 3.5 3.5"/><path class="f" d="M10 7.5h4v4h-4z"/>',
    /* a Conta: a chave */
    conta: '<circle cx="8" cy="12" r="4"/><path d="M12 12h8.5M17 12v3.5M20.5 12v3.5"/>',
    /* a área de uma matéria: o mapa com o caminho */
    area: '<path d="M3.5 5.5l5.5-2 6 2 5.5-2v15l-5.5 2-6-2-5.5 2z"/><path d="M9 3.5v15M15 5.5v15"/>',
  };
  /* sinônimos: os nomes antigos usados pelo resto do código */
  var SIN = { agora: 'hoje', ver: 'olho', cheia: 'tela-cheia', x: 'fechar', aceitar: 'check', favorito: 'coracao', imagem: 'protetor', busca: 'buscar', ajustes: 'pers', seta: 'abaixo', livros: 'estante' };

  function svg(nome, classe) {
    var n = P[nome] ? nome : SIN[nome];
    var d = P[n] || P.sistema;
    return '<svg class="ico' + (classe ? ' ' + classe : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="8" aria-hidden="true" focusable="false">' + d + '</svg>';
  }

  /* A MARCA (09/out/2026, PERFIL.md item 74): o Quadrado Negro de Kazimir Malevich (1915), o ícone do
     Suprematismo — "o grau zero da forma". É um quadrado porque é um manifesto: sem mascote, sem marca
     registrada, a forma que qualquer um desenha à mão. Negro no claro, branco no escuro (a cor é a da
     tinta), e muda de cor em Personalizar → Marca, como o próprio Malevich fez: o Quadrado Vermelho (1915)
     e o Branco sobre Branco (1918). As três versões moram no mesmo SVG; o CSS (data-marca) escolhe. */
  function quadrado(extra) {
    return '<svg class="quadrado' + (extra ? ' ' + extra : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path class="q-negro" d="M2 2h20v20H2z"/>' +
      '<path class="q-vermelho" d="M2.6 3.1 21.2 2 21.6 21.4 2 22z"/>' +
      '<g class="q-branco"><path class="q-campo" d="M2 2h20v20H2z"/><path class="q-giro" d="M6.6 8.2 15.6 5.3 18.5 14.3 9.5 17.2z"/></g></svg>';
  }

  /* o logotipo: o quadrado + "Portal Solar" na Gabarito (brasileira, da Naipe Foundry), em HTML (nítido, na fonte da página) */
  function logotipo(extra) {
    return '<span class="logotipo' + (extra ? ' ' + extra : '') + '" role="img" aria-label="Portal Solar">' + quadrado() +
      '<span class="logotipo-nome" aria-hidden="true">Portal<span> Solar</span></span></span>';
  }

  /* o símbolo para aberturas e cartões: o quadrado (o portal) e o sol que passa por ele */
  function simbolo(fundo) {
    return '<svg class="simbolo" viewBox="0 0 48 48" aria-hidden="true">' + (fundo ? '<rect width="48" height="48" rx="11" fill="#F3EFE6"/>' : '') +
      '<path class="ma-q" d="M10 10h28v28H10z" fill="' + (fundo ? '#14130F' : 'currentColor') + '"/>' +
      '<circle class="ma-sol" cx="38" cy="10" r="5.5" fill="var(--sinal, #E9822A)"/></svg>';
  }

  var api = { svg: svg, quadrado: quadrado, logotipo: logotipo, simbolo: simbolo, nomes: Object.keys(P), P: P };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.Icones = api;
})(typeof window !== 'undefined' ? window : globalThis);
