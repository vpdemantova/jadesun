(function () {
  'use strict';

  /* ============================================================
     LUZ — o motor de shaders do Portal Solar (12/out/2026).

     Um "shader" é um programa pequeno que roda na placa de vídeo,
     uma vez para CADA pixel, todos ao mesmo tempo. Ele recebe a
     posição do pixel e devolve uma cor. Com isso se desenham céus,
     fumaça, rachaduras e transições que nenhum CSS faz.

     Três camadas, na ordem (a melhor que o aparelho tiver):
       1. WebGPU (a placa de vídeo moderna, com WGSL);
       2. WebGL2 (a de antes, com GLSL), que quase todo navegador tem;
       3. nada: o canvas fica vazio e a página segue sem efeito.
     Cada efeito é escrito nas duas línguas (WGSL e GLSL) com a mesma
     conta; a biblioteca de funções (ruído, fbm, voronoi, paleta) está
     aqui embaixo, também nas duas.

     Respeito ao aparelho e a quem usa:
     - "reduzir movimento" ligado: desenha um quadro e para;
     - aba escondida ou canvas fora da tela: não desenha;
     - economia de dados ou bateria fraca: resolução menor;
     - se um quadro passa de ~22 ms várias vezes, a resolução cai sozinha.

     Uso:
       Luz.criar(canvas, { wgsl: 'fn efeito(p: vec2f, uv: vec2f) -> vec4f {…}',
                           glsl: 'vec4 efeito(vec2 p, vec2 uv) {…}' })
         .then(function (fx) { fx.animar(function (t) { return { p: [...] } }) })
     ============================================================ */

  var REDUZIR = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ECONOMIA = !!(navigator.connection && navigator.connection.saveData);

  /* ── a biblioteca de funções, nas duas línguas ── */
  var LIB_WGSL = [
    'fn hash21(p: vec2f) -> f32 { var q = fract(p * vec2f(123.34, 456.21)); q += dot(q, q + 45.32); return fract(q.x * q.y); }',
    'fn hash22(p: vec2f) -> vec2f { let n = hash21(p); return vec2f(n, hash21(p + n)); }',
    'fn ruido(p: vec2f) -> f32 { let i = floor(p); let f = fract(p); let u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash21(i), hash21(i + vec2f(1.0, 0.0)), u.x), mix(hash21(i + vec2f(0.0, 1.0)), hash21(i + vec2f(1.0, 1.0)), u.x), u.y); }',
    'fn fbm(p0: vec2f) -> f32 { var p = p0; var s = 0.0; var a = 0.5;',
    '  for (var i = 0; i < 5; i++) { s += a * ruido(p); p = mat2x2f(1.6, 1.2, -1.2, 1.6) * p; a *= 0.5; } return s; }',
    'fn rot(a: f32) -> mat2x2f { let c = cos(a); let s = sin(a); return mat2x2f(c, s, -s, c); }',
    'fn paleta(t: f32, a: vec3f, b: vec3f, c: vec3f, d: vec3f) -> vec3f { return a + b * cos(6.28318 * (c * t + d)); }',
    /* voronoi: a distância até a borda da célula mais perto (para rachaduras e favos) */
    'fn voronoiBorda(x: vec2f) -> f32 { let n = floor(x); let f = fract(x); var mr = vec2f(0.0); var md = 8.0;',
    '  for (var j = -1; j <= 1; j++) { for (var i = -1; i <= 1; i++) { let g = vec2f(f32(i), f32(j)); let o = hash22(n + g); let r = g + o - f; let d = dot(r, r); if (d < md) { md = d; mr = r; } } }',
    '  md = 8.0; for (var j = -2; j <= 2; j++) { for (var i = -2; i <= 2; i++) { let g = vec2f(f32(i), f32(j)); let o = hash22(n + g); let r = g + o - f;',
    '    if (dot(mr - r, mr - r) > 0.00001) { md = min(md, dot(0.5 * (mr + r), normalize(r - mr))); } } } return md; }',
    'fn caixa(p: vec2f, b: vec2f) -> f32 { let d = abs(p) - b; return length(max(d, vec2f(0.0))) + min(max(d.x, d.y), 0.0); }',
  ].join('\n');

  var LIB_GLSL = [
    'float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }',
    'vec2 hash22(vec2 p) { float n = hash21(p); return vec2(n, hash21(p + n)); }',
    'float ruido(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y); }',
    'float fbm(vec2 p) { float s = 0.0; float a = 0.5;',
    '  for (int i = 0; i < 5; i++) { s += a * ruido(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= 0.5; } return s; }',
    'mat2 rot(float a) { float c = cos(a); float s = sin(a); return mat2(c, s, -s, c); }',
    'vec3 paleta(float t, vec3 a, vec3 b, vec3 c, vec3 d) { return a + b * cos(6.28318 * (c * t + d)); }',
    'float voronoiBorda(vec2 x) { vec2 n = floor(x); vec2 f = fract(x); vec2 mr = vec2(0.0); float md = 8.0;',
    '  for (int j = -1; j <= 1; j++) { for (int i = -1; i <= 1; i++) { vec2 g = vec2(float(i), float(j)); vec2 o = hash22(n + g); vec2 r = g + o - f; float d = dot(r, r); if (d < md) { md = d; mr = r; } } }',
    '  md = 8.0; for (int j = -2; j <= 2; j++) { for (int i = -2; i <= 2; i++) { vec2 g = vec2(float(i), float(j)); vec2 o = hash22(n + g); vec2 r = g + o - f;',
    '    if (dot(mr - r, mr - r) > 0.00001) { md = min(md, dot(0.5 * (mr + r), normalize(r - mr))); } } } return md; }',
    'float caixa(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0); }',
  ].join('\n');

  /* Os valores que todo efeito recebe (iguais nas duas línguas):
     res (pixels), ponteiro (0..1), tempo (s), escala (dpr), progresso (0..1, para transições),
     semente, p[0..1] (oito números livres) e c[0..3] (quatro cores rgba). 128 bytes. */
  var WGSL_CABECA = [
    'struct Uniformes { res: vec2f, ponteiro: vec2f, tempo: f32, escala: f32, progresso: f32, semente: f32, p: array<vec4f, 2>, c: array<vec4f, 4> };',
    '@group(0) @binding(0) var<uniform> U: Uniformes;',
    'struct Saida { @builtin(position) pos: vec4f, @location(0) uv: vec2f };',
    '@vertex fn vs(@builtin(vertex_index) i: u32) -> Saida {',
    '  var q = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));',
    '  var s: Saida; s.pos = vec4f(q[i], 0.0, 1.0); s.uv = vec2f(q[i].x * 0.5 + 0.5, 0.5 - q[i].y * 0.5); return s; }',
  ].join('\n');
  var WGSL_PE = [
    '@fragment fn fs(e: Saida) -> @location(0) vec4f {',
    '  let px = e.uv * U.res;',
    '  let p = (px - 0.5 * U.res) / min(U.res.x, U.res.y);',
    '  let c = efeito(vec2f(p.x, -p.y), e.uv);',
    '  return vec4f(c.rgb * c.a, c.a); }',
  ].join('\n');

  var GLSL_VS = '#version 300 es\nout vec2 vUv;\nvoid main(){ vec2 q = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)) * 2.0 - 1.0; vUv = vec2(q.x * 0.5 + 0.5, 0.5 - q.y * 0.5); gl_Position = vec4(q, 0.0, 1.0); }';
  var GLSL_CABECA = [
    '#version 300 es', 'precision highp float;',
    'uniform vec2 uRes; uniform vec2 uPonteiro; uniform float uTempo; uniform float uEscala; uniform float uProgresso; uniform float uSemente;',
    'uniform vec4 uP[2]; uniform vec4 uC[4];', 'in vec2 vUv; out vec4 saida;',
  ].join('\n');
  var GLSL_PE = 'void main(){ vec2 px = vUv * uRes; vec2 p = (px - 0.5 * uRes) / min(uRes.x, uRes.y); vec4 c = efeito(vec2(p.x, -p.y), vUv); saida = vec4(c.rgb * c.a, c.a); }';

  /* ── a placa de vídeo moderna: um dispositivo só para a página inteira ── */
  var dispositivo = null;
  function pedirWebGPU() {
    if (dispositivo) return dispositivo;
    dispositivo = (async function () {
      if (!navigator.gpu || /[?&]webgl\b/.test(location.search)) return null;
      try {
        var adaptador = await navigator.gpu.requestAdapter({ powerPreference: ECONOMIA ? 'low-power' : 'high-performance' });
        if (!adaptador) return null;
        var d = await adaptador.requestDevice();
        var meu = dispositivo;
        d.lost.then(function () { if (dispositivo === meu) dispositivo = null; });
        return d;
      } catch (e) { return null; }
    })();
    return dispositivo;
  }

  var deteccao = null;
  /** o que este aparelho tem: 'webgpu', 'webgl2' ou 'nenhum' */
  function capacidade() {
    if (deteccao) return deteccao;
    deteccao = pedirWebGPU().then(function (d) {
      if (d) return 'webgpu';
      try { var c = document.createElement('canvas'); return c.getContext('webgl2') ? 'webgl2' : 'nenhum'; } catch (e) { return 'nenhum'; }
    });
    return deteccao;
  }

  function Efeito(canvas, opcoes) {
    this.canvas = canvas;
    this.o = opcoes || {};
    this.tipo = 'nenhum';
    this.escala = 1;
    this.lentos = 0;
    this.visivel = true;
    this.vivo = true;
    this.buf = new Float32Array(32);
    this.estado = { ponteiro: [0.5, 0.5], progresso: 0, semente: Math.random() * 100, p: [0, 0, 0, 0, 0, 0, 0, 0], c: [1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1] };
  }

  Efeito.prototype.iniciar = async function () {
    var self = this, o = this.o;
    var quero = o.prefer || 'auto';
    if (quero !== 'webgl2' && o.wgsl) {
      var d = await pedirWebGPU();
      if (d) {
        try {
          var ctx = this.canvas.getContext('webgpu');
          var formato = navigator.gpu.getPreferredCanvasFormat();
          ctx.configure({ device: d, format: formato, alphaMode: 'premultiplied' });
          var codigo = WGSL_CABECA + '\n' + LIB_WGSL + '\n' + o.wgsl + '\n' + WGSL_PE;
          var modulo = d.createShaderModule({ code: codigo });
          var info = await modulo.getCompilationInfo();
          var erros = info.messages.filter(function (m) { return m.type === 'error'; });
          if (erros.length) throw new Error('WGSL: ' + erros.map(function (m) { return m.lineNum + ': ' + m.message; }).join(' | '));
          this.pipe = await d.createRenderPipelineAsync({
            layout: 'auto',
            vertex: { module: modulo, entryPoint: 'vs' },
            fragment: { module: modulo, entryPoint: 'fs', targets: [{ format: formato, blend: { color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' } } }] },
            primitive: { topology: 'triangle-list' },
          });
          this.ubo = d.createBuffer({ size: 128, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
          this.grupo = d.createBindGroup({ layout: this.pipe.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: this.ubo } }] });
          this.d = d; this.ctx = ctx; this.tipo = 'webgpu';
          d.lost.then(function () { if (self.vivo && self.d === d) { self.tipo = 'nenhum'; self.parar(); if (typeof self.aoPerder === 'function') self.aoPerder(self); } });
        } catch (e) {
          console.warn('Luz: WebGPU não deu, indo para WebGL2.', e);
          this.tipo = 'nenhum';
          /* um canvas que já pediu "webgpu" não aceita "webgl2": troca por um novo, igual */
          var novo = this.canvas.cloneNode(false);
          this.canvas.replaceWith(novo); this.canvas = novo;
        }
      }
    }
    if (this.tipo === 'nenhum' && o.glsl) {
      try {
        var gl = this.canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false, powerPreference: ECONOMIA ? 'low-power' : 'default' });
        if (!gl) throw new Error('sem webgl2');
        var prog = gl.createProgram();
        [[gl.VERTEX_SHADER, GLSL_VS], [gl.FRAGMENT_SHADER, GLSL_CABECA + '\n' + LIB_GLSL + '\n' + o.glsl + '\n' + GLSL_PE]].forEach(function (par) {
          var s = gl.createShader(par[0]); gl.shaderSource(s, par[1]); gl.compileShader(s);
          if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('GLSL: ' + gl.getShaderInfoLog(s));
          gl.attachShader(prog, s);
        });
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
        this.gl = gl; this.prog = prog; this.tipo = 'webgl2';
        this.vao = gl.createVertexArray();
        var u = {};
        ['uRes', 'uPonteiro', 'uTempo', 'uEscala', 'uProgresso', 'uSemente', 'uP', 'uC'].forEach(function (n) { u[n] = gl.getUniformLocation(prog, n); });
        this.u = u;
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        this.canvas.addEventListener('webglcontextlost', function (ev) { ev.preventDefault(); self.tipo = 'nenhum'; }, false);
      } catch (e) { console.warn('Luz: WebGL2 não deu; a página segue sem o efeito.', e); this.tipo = 'nenhum'; }
    }
    this.canvas.dataset.luz = this.tipo;
    /* só desenha o que está na tela */
    if ('IntersectionObserver' in window) {
      this.io = new IntersectionObserver(function (es) { self.visivel = es[0].isIntersecting; });
      this.io.observe(this.canvas);
    }
    return this;
  };

  Efeito.prototype.medir = function () {
    var c = this.canvas;
    var teto = (this.o.dpr || 1.5) * (ECONOMIA ? 0.6 : 1);
    var dpr = Math.min(window.devicePixelRatio || 1, teto) * this.escala;
    var w = Math.max(2, Math.round(c.clientWidth * dpr)), h = Math.max(2, Math.round(c.clientHeight * dpr));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    return dpr;
  };

  /** desenha um quadro; "v" muda o estado (ponteiro, progresso, p, c) */
  Efeito.prototype.desenhar = function (tempo, v) {
    if (!this.vivo || this.tipo === 'nenhum') return;
    var e = this.estado;
    if (v) { for (var k in v) if (v[k] !== undefined) e[k] = v[k]; }
    var dpr = this.medir();
    var b = this.buf;
    b[0] = this.canvas.width; b[1] = this.canvas.height; b[2] = e.ponteiro[0]; b[3] = e.ponteiro[1];
    b[4] = tempo; b[5] = dpr; b[6] = e.progresso; b[7] = e.semente;
    for (var i = 0; i < 8; i++) b[8 + i] = e.p[i] || 0;
    for (var j = 0; j < 16; j++) b[16 + j] = e.c[j] === undefined ? 0 : e.c[j];
    if (this.tipo === 'webgpu') {
      var d = this.d;
      d.queue.writeBuffer(this.ubo, 0, b);
      var enc = d.createCommandEncoder();
      var passe = enc.beginRenderPass({ colorAttachments: [{ view: this.ctx.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 0 } }] });
      passe.setPipeline(this.pipe); passe.setBindGroup(0, this.grupo); passe.draw(3); passe.end();
      d.queue.submit([enc.finish()]);
    } else {
      var gl = this.gl, u = this.u;
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(this.prog); gl.bindVertexArray(this.vao);
      gl.uniform2f(u.uRes, b[0], b[1]); gl.uniform2f(u.uPonteiro, b[2], b[3]); gl.uniform1f(u.uTempo, b[4]);
      gl.uniform1f(u.uEscala, b[5]); gl.uniform1f(u.uProgresso, b[6]); gl.uniform1f(u.uSemente, b[7]);
      gl.uniform4fv(u.uP, b.subarray(8, 16)); gl.uniform4fv(u.uC, b.subarray(16, 32));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };

  /** anima: "cada" devolve o estado do quadro; com "reduzir movimento", um quadro só */
  Efeito.prototype.animar = function (cada) {
    var self = this, t0 = performance.now(), ultimo = t0;
    if (REDUZIR && !this.o.mesmoReduzido) {
      this.cada = cada;
      this.desenhar(0, cada ? cada(0, 0) : null);
      if ('ResizeObserver' in window && !this.ro) { this.ro = new ResizeObserver(function () { if (self.vivo) self.redesenhar(); }); this.ro.observe(this.canvas); }
      return this;
    }
    this.cada = cada;
    function quadro(agora) {
      if (!self.vivo) return;
      self.raf = requestAnimationFrame(quadro);
      if (document.hidden || !self.visivel) { ultimo = agora; return; }
      var dt = agora - ultimo; ultimo = agora;
      /* qualidade que se adapta: quadro lento demais, resolução menor */
      if (dt > 22) { if (++self.lentos > 30 && self.escala > 0.45) { self.escala *= 0.82; self.lentos = 0; } } else self.lentos = Math.max(0, self.lentos - 1);
      var t = (agora - t0) / 1000;
      self.desenhar(t, cada ? cada(t, dt / 1000) : null);
    }
    this.raf = requestAnimationFrame(quadro);
    return this;
  };

  Efeito.prototype.parar = function () { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; };
  /** um quadro novo agora (para quem está com "reduzir movimento" e mexeu num ajuste) */
  Efeito.prototype.redesenhar = function () { if (this.vivo && this.tipo !== 'nenhum') this.desenhar(0, this.cada ? this.cada(0, 0) : null); };
  Efeito.prototype.destruir = function () {
    this.vivo = false; this.parar();
    if (this.io) this.io.disconnect();
    if (this.ro) this.ro.disconnect();
    if (this.ubo) this.ubo.destroy();
    if (this.gl) { var ext = this.gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); }
  };

  /** cria o efeito no canvas; devolve uma promessa com o efeito pronto (ou com tipo "nenhum") */
  function criar(canvas, opcoes) { return new Efeito(canvas, opcoes).iniciar(); }

  /** cor CSS (#rrggbb) para [r, g, b] de 0 a 1 */
  function rgb(hex, a) {
    var h = String(hex || '#000').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (x) { return x + x; }).join('');
    var n = parseInt(h, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, a === undefined ? 1 : a];
  }
  /** a cor de um token CSS (ex.: '--tinta') já resolvida */
  function token(nome, padrao) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
    if (!v) return rgb(padrao || '#000');
    if (v[0] === '#') return rgb(v);
    var m = v.match(/[\d.]+/g);
    return m ? [m[0] / 255, m[1] / 255, m[2] / 255, m[3] === undefined ? 1 : +m[3]] : rgb(padrao || '#000');
  }

  window.Luz = { criar: criar, capacidade: capacidade, reduzir: REDUZIR, economia: ECONOMIA, rgb: rgb, token: token, LIB_WGSL: LIB_WGSL, LIB_GLSL: LIB_GLSL };
})();
