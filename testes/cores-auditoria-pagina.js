/* ============================================================
   Portal Solar · testes/cores-auditoria-pagina.js — a auditoria de cor que roda DENTRO de uma página.
   De onde veio: 14/out/2026, pedido dele: "tenha certeza que cada seção fica bem com as cores definidas,
   pois está quebrando… as cores não funcionam juntas e se opacam, se murcham e somem".
   O que faz: (1) contraste de todo texto visível contra o fundo real (WCAG: 4,5:1; 3:1 no texto grande),
   (2) toda cor com saturação acima do tom do tema (croma OKLab > 0,06): fundo, borda, texto, SVG, gradiente.
   Devolve um JSON { baixo: […], cor: […] }. Quem roda: testes/cores-auditoria.mjs (todas as páginas × cores).
   ============================================================ */
(() => {
  const parse = (s) => { const m = s && s.match(/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+%?))?\)/); if (!m) return null; let a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]); return [+m[1], +m[2], +m[3], a]; };
  const parseCor = (s) => {
    if (!s) return null;
    if (s.startsWith('rgb')) return parse(s);
    const m = s.match(/color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.]+))?\)/);
    if (m) return [m[1] * 255, m[2] * 255, m[3] * 255, m[4] === undefined ? 1 : +m[4]];
    return null;
  };
  const mistura = (fg, bg) => { const a = fg[3]; return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1]; };
  const lum = (c) => c.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const razao = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const oklabC = (c) => {
    const lin = c.slice(0, 3).map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    const l = Math.cbrt(0.4122214708 * lin[0] + 0.5363325363 * lin[1] + 0.0514459929 * lin[2]);
    const m = Math.cbrt(0.2119034982 * lin[0] + 0.6806995451 * lin[1] + 0.1073969566 * lin[2]);
    const s = Math.cbrt(0.0883024619 * lin[0] + 0.2817188376 * lin[1] + 0.6299787005 * lin[2]);
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return Math.hypot(A, B);
  };
  const ab = (c) => {
    const lin = c.slice(0, 3).map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    const l = Math.cbrt(0.4122214708 * lin[0] + 0.5363325363 * lin[1] + 0.0514459929 * lin[2]), m = Math.cbrt(0.2119034982 * lin[0] + 0.6806995451 * lin[1] + 0.1073969566 * lin[2]), s = Math.cbrt(0.0883024619 * lin[0] + 0.2817188376 * lin[1] + 0.6299787005 * lin[2]);
    return [1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  };
  const hex = (h) => { const n = parseInt(String(h).trim().replace('#', ''), 16); return isNaN(n) ? null : [n >> 16, (n >> 8) & 255, n & 255, 1]; };
  const raizCs = getComputedStyle(document.documentElement);
  const tons = ['--papel', '--papel-2', '--tinta', '--suave', '--fio'].map((n) => hex(raizCs.getPropertyValue(n))).filter(Boolean).map(ab).filter((v) => Math.hypot(v[0], v[1]) > 0.012);
  const tomTema = tons.length ? Math.atan2(tons.reduce((s, v) => s + v[1], 0), tons.reduce((s, v) => s + v[0], 0)) : null;
  const foraDoTom = (c) => { const v = ab(c), ch = Math.hypot(v[0], v[1]); if (ch <= 0.06) return false; if (tomTema === null || ch > 0.13) return true; let d = Math.abs(Math.atan2(v[1], v[0]) - tomTema); if (d > Math.PI) d = 2 * Math.PI - d; return d > 0.6; };
  const raizBg = parseCor(getComputedStyle(document.body).backgroundColor) || [255, 255, 255, 1];
  const pagBg = raizBg[3] > 0 ? raizBg : (parseCor(getComputedStyle(document.documentElement).backgroundColor) || [255, 255, 255, 1]);
  const ignorar = '.ga-mini, .ga-amostra, .pers .tema, .indice, .tudo, [hidden], script, style, canvas, video, img, iframe, svg defs, .protetor-sobre, .cor-propria';
  const desc = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '');
  const caminho = (el) => { const p = []; let e = el; for (let i = 0; e && e !== document.body && i < 3; i++, e = e.parentElement) p.unshift(desc(e)); return p.join(' > '); };
  function fundoDe(el) {
    let camadas = [], e = el, img = false;
    while (e && e.nodeType === 1) {
      const cs = getComputedStyle(e);
      const c = parseCor(cs.backgroundColor);
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && !/^linear-gradient\(rgba?\(0, 0, 0, 0\)/.test(cs.backgroundImage)) img = true;
      /* um véu desenhado num ::before/::after (texto sobre foto) ou uma foto de fundo posicionada: o fundo real não é a cor */
      if (!['::before', '::after'].every((p) => { const ps = getComputedStyle(e, p); return ps.content === 'none' || ps.backgroundImage === 'none'; })) img = true;
      const foto = e.querySelector(':scope > img');
      if (foto && getComputedStyle(foto).position === 'absolute') img = true;
      if (c && c[3] > 0) { camadas.push(c); if (c[3] >= 0.999) break; }
      e = e.parentElement;
    }
    let bg = pagBg.slice();
    for (let i = camadas.length - 1; i >= 0; i--) bg = mistura(camadas[i], bg);
    return { bg, img };
  }
  function opacidade(el) { let o = 1, e = el; while (e && e.nodeType === 1) { o *= parseFloat(getComputedStyle(e).opacity) || 0; e = e.parentElement; } return o; }
  const baixos = new Map(), coloridos = new Map();
  const todos = document.body.querySelectorAll('*');
  for (const el of todos) {
    if (el.closest(ignorar)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const op = opacidade(el);
    if (op < 0.05) continue;
    /* 1. o texto */
    const temTexto = [...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim().length > 1);
    if (temTexto) {
      /* no SVG, a cor que se vê é o preenchimento (fill), não o color */
      const fg0 = el instanceof SVGElement && parseCor(cs.fill) ? parseCor(cs.fill) : parseCor(cs.color);
      if (fg0) {
        const { bg, img } = fundoDe(el);
        const fg = mistura([fg0[0], fg0[1], fg0[2], fg0[3] * op], bg);
        const k = razao(fg, bg);
        const tam = parseFloat(cs.fontSize), negrito = parseInt(cs.fontWeight, 10) >= 600;
        const min = tam >= 24 || (tam >= 18.66 && negrito) ? 3 : 4.5;
        if (k < min && !img) {
          const chave = caminho(el);
          const v = baixos.get(chave) || { onde: chave, razao: k.toFixed(2), min, texto: el.textContent.trim().slice(0, 40), n: 0 };
          v.n++; baixos.set(chave, v);
        }
        if (foraDoTom(fg0) && fg0[3] > 0.3) { const chave = caminho(el) + ' [color ' + cs.color + ']'; coloridos.set(chave, (coloridos.get(chave) || 0) + 1); }
      }
    }
    /* 2. as cores fora do tema: fundo, borda, preenchimento de SVG */
    const props = [['background-color', cs.backgroundColor], ['border-top-color', parseFloat(cs.borderTopWidth) > 0 ? cs.borderTopColor : null], ['border-left-color', parseFloat(cs.borderLeftWidth) > 0 ? cs.borderLeftColor : null]];
    if (el instanceof SVGElement) { props.push(['fill', cs.fill], ['stroke', cs.stroke !== 'none' ? cs.stroke : null]); }
    for (const [p, v] of props) {
      const c = parseCor(v);
      if (!c || c[3] < 0.15) continue;
      if (foraDoTom(c)) { const chave = caminho(el) + ' [' + p + ' ' + v + ']'; coloridos.set(chave, (coloridos.get(chave) || 0) + 1); }
    }
    const bi = cs.backgroundImage;
    if (bi && bi !== 'none' && /gradient/.test(bi)) {
      const cores = (bi.match(/rgba?\([^)]+\)/g) || []).map(parse).filter((c) => c && c[3] > 0.15 && foraDoTom(c));
      if (cores.length) { const chave = caminho(el) + ' [gradiente]'; coloridos.set(chave, (coloridos.get(chave) || 0) + 1); }
    }
  }
  return JSON.stringify({ baixo: [...baixos.values()].sort((a, b) => a.razao - b.razao).slice(0, 25), cor: [...coloridos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, n]) => k + ' ×' + n) });
})()
