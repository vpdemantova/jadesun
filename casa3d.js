import * as THREE from './vendor/three.module.min.js';
import { criarPalco, textoEmCanvas, movel, clamp } from './cena3d.js';
import { criarConstrutor } from './casa3d-construir.js';
import { area, comodoNoPonto, corHex, tipoMovel, ajustar, limites, nomeUnico, norm, PISOS, PAREDES_ESPECIAIS, FORMAS, ESTILOS, CORES, LISTA_MOVEIS, MOVEIS, ehCilindro, ladoDoComodo } from './casa-modelo.js';

const P = window.Perfil;
const esc = P.esc;
const $ = (id) => document.getElementById(id);
const H = { 'Content-Type': 'application/json', 'X-Perfil': '1' };

const VISTAS = [['planta', 'Planta'], ['maquete', 'Maquete'], ['fachada', 'Fachada'], ['andar', 'Andar']];
const FERRAMENTAS = [['mover', 'Mover', '<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>'],
  ['comodo', 'Cômodo', '<rect x="4" y="5" width="16" height="14" rx="1"/><path d="M4 12h7v7"/>'],
  ['porta', 'Porta', '<path d="M6 20V4h9v16"/><path d="M15 20h4"/><circle cx="12.5" cy="12" r=".8"/>'],
  ['janela', 'Janela', '<rect x="4" y="5" width="16" height="14" rx="1"/><path d="M12 5v14M4 12h16"/>'],
  ['movel', 'Móvel', '<path d="M4 18v-6h16v6M6 12V8h12v4M4 18v2M20 18v2"/>'],
  ['apagar', 'Apagar', '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>']];
const AMB = [['dia', 'Dia'], ['entardecer', 'Entardecer'], ['estudio', 'Maquete branca']];
const PAREDES_MODOS = { frente: 'Frente aberta', baixas: 'Paredes baixas', inteiras: 'Paredes inteiras' };
const GRUPOS = ['quarto', 'estudo', 'música', 'estar', 'cozinha', 'banheiro', 'jardim'];

async function iniciar() {
  const canvas = $('mundo'), ui = $('es-ui'), carregando = $('es-carregando');
  if (!canvas || !ui) return;
  let palco;
  try { palco = criarPalco(canvas); } catch (e) { if (carregando) carregando.textContent = 'Este navegador não desenha WebGL.'; return; }
  const { cena, camera, pbr } = palco;
  camera.far = 600; camera.updateProjectionMatrix(); // casa inteira vista de cima fica longe
  const construtor = criarConstrutor(palco);
  try { await Promise.race([Promise.all(['600 40px "Newsreader"', '500 20px "Archivo"'].map((f) => document.fonts.load(f))), new Promise((ok) => setTimeout(ok, 2000))]); } catch (e) { /* segue */ }
  const [r0, rLivros, rRoupa] = await Promise.all(['/api/casa', '/api/livros', '/api/guarda-roupa'].map((u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null)));
  if (carregando) carregando.hidden = true;
  canvas.closest('.es-palco').classList.add('es-pronto');
  const contagens = { livros: (rLivros && rLivros.livros || []).length, pecas: (rRoupa && rRoupa.pecas || []).length };

  /* ---------- estado ---------- */
  const estado = {
    dados: { casas: (r0 && r0.casas) || [], comodos: (r0 && r0.comodos) || [], aberturas: (r0 && r0.aberturas) || [], moveis: (r0 && r0.moveis) || [] },
    versao: (r0 && r0.versao) || '',
    casa: '', vista: 'maquete', ferramenta: 'mover', tipoMovel: 'cama', sel: null, paredes: 'frente', amb: 'dia', ajustesAbertos: false,
  };
  if (!estado.dados.casas.length) estado.dados.casas.push({ nome: 'Minha casa', tipo: 'real', estilo: 'livre', referencia: '', notas: '' });
  try { estado.casa = localStorage.getItem('casa-atual') || ''; estado.amb = localStorage.getItem('casa-ambiente') || 'dia'; estado.paredes = localStorage.getItem('casa-paredes') || 'frente'; } catch (e) { /* padrão */ }
  if (!estado.dados.casas.some((c) => c.nome === estado.casa)) estado.casa = estado.dados.casas[0].nome;
  const casaAtual = () => estado.dados.casas.find((c) => c.nome === estado.casa);
  const daCasa = (k) => estado.dados[k].filter((x) => x.casa === estado.casa);
  const estiloAtual = () => ESTILOS[norm(casaAtual() && casaAtual().estilo)] || ESTILOS.livre;

  /* ---------- céu e terreno ---------- */
  const ceus = {
    dia: ['#8fb6d8', '#cfe0ea', '#efe6d6'], entardecer: ['#2f3b63', '#d98a64', '#f3c98b'], estudio: ['#e9e6e0', '#efece6', '#f3f1ec'],
  };
  const texCeu = {};
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), pbr({ map: construtor.TEX.grama(), roughness: 1 }));
  chao.material.map = chao.material.map.clone(); chao.material.map.repeat.set(160, 160); chao.material.map.needsUpdate = true;
  chao.rotation.x = -Math.PI / 2; chao.position.y = -0.005; chao.receiveShadow = true;
  cena.add(chao);
  const matChaoEstudio = pbr({ color: 0xe6e3dc, roughness: 0.95 });
  const matChaoGrama = chao.material;
  // de cima (planta) a câmera fica longe: a névoa recua pra não apagar a casa
  function ajustarNevoa() { if (cena.fog) { cena.fog.near = estado.vista === 'planta' ? 300 : 40; cena.fog.far = estado.vista === 'planta' ? 600 : 140; } }
  function aplicarAmbiente(tipo) {
    estado.amb = tipo;
    try { localStorage.setItem('casa-ambiente', tipo); } catch (e) { /* ok */ }
    const c = ceus[tipo] || ceus.dia;
    if (!texCeu[tipo]) texCeu[tipo] = textoEmCanvas(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, c[0]); gr.addColorStop(0.6, c[1]); gr.addColorStop(1, c[2]); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    cena.background = texCeu[tipo];
    cena.fog = new THREE.Fog(new THREE.Color(c[2]), 40, 140);
    ajustarNevoa();
    chao.material = tipo === 'estudio' ? matChaoEstudio : matChaoGrama;
    palco.definirLuz(tipo === 'entardecer' ? 0.55 : 0.8, tipo === 'entardecer' ? 1.05 : 1.0, tipo === 'entardecer' ? 2.2 : 2.6);
    palco.sol.color.set(tipo === 'entardecer' ? 0xffb27a : 0xfff4e8);
    palco.hemi.color.set(tipo === 'entardecer' ? 0xffc9a0 : 0xdfeaf5);
    palco.hemi.groundColor.set(tipo === 'estudio' ? 0xbdb6aa : 0x6f7a4a);
    palco.hemi.intensity = 0.45;
    marcarSujo();
  }

  /* ---------- montagem ---------- */
  let casa3d = null, alvos = { comodos: [], moveis: [], aberturas: [] };
  const selecao = new THREE.Group(); cena.add(selecao);
  function montar() {
    if (casa3d) { cena.remove(casa3d); casa3d.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
    const dados = { comodos: daCasa('comodos'), aberturas: daCasa('aberturas'), moveis: daCasa('moveis') };
    const r = construtor.construirCasa(dados, { paredesCortadas: estado.vista === 'planta' || (estado.vista === 'maquete' && estado.paredes === 'baixas'), teto: estado.vista === 'fachada' });
    casa3d = r.grupo; alvos = r.alvos;
    cena.add(casa3d);
    barreiras = []; // o Andar recalcula as paredes na próxima volta
    corteFeito = true; aplicarCorte();
    const b = limites(dados.comodos, dados.moveis);
    const cx = (b.x0 + b.x1) / 2, cz = (b.y0 + b.y1) / 2, larg = Math.max(4, b.x1 - b.x0), prof = Math.max(4, b.y1 - b.y0);
    palco.ajustarSombra(cx, 1.5, Math.max(larg, prof) + 4, 8, 4);
    if (estado.amb === 'entardecer') { palco.sol.position.copy(palco.sol.target.position).add(new THREE.Vector3(-6, 2.4, 3.5)); }
    pintarSelecao();
    marcarSujo();
    atualizarRotulos();
  }

  /* casa de bonecas: na Maquete, as paredes de fora viradas pra câmera descem até 1,1 m
     (portas e janelas delas somem), então dá pra ver dentro de qualquer lado que se olhe */
  const CORTE = 1.1;
  let corteFeito = false;
  function aplicarCorte() {
    if (!casa3d) return;
    const dinamico = estado.vista === 'maquete' && estado.paredes === 'frente';
    if (!dinamico && !corteFeito) return;
    corteFeito = dinamico;
    const cam = camera.position;
    for (const o of casa3d.children) {
      const u = o.userData.parede;
      if (!u) continue;
      const baixa = dinamico && u.n && (cam.x - o.position.x) * u.n[0] + (cam.z - o.position.z) * u.n[1] > 0;
      if (u.vao) { o.visible = !baixa; continue; }
      if (!baixa) { o.visible = true; o.scale.y = 1; o.position.y = u.y; continue; }
      if (u.base >= CORTE - 0.01) { o.visible = false; continue; }
      const topo = Math.min(u.base + u.h, CORTE);
      o.visible = true; o.scale.y = (topo - u.base) / u.h; o.position.y = u.nivel + u.base + (topo - u.base) / 2;
    }
  }

  /* ---------- câmeras: planta (de cima), órbita (maquete/fachada), andar (primeira pessoa) ---------- */
  const orb = { alvo: new THREE.Vector3(), yaw: 0.65, pitch: 0.75, dist: 18 };
  const orbAtual = { alvo: new THREE.Vector3(0, 0, 0), yaw: 0.2, pitch: 1.0, dist: 30 };
  const planta = { cx: 0, cz: 0, h: 20 }, plantaAtual = { cx: 0, cz: 0, h: 30 };
  const fps = { x: 0, z: 0, yaw: 0, pitch: -0.05, vx: 0, vz: 0 };
  const teclas = new Set();
  let velYaw = 0;
  function enquadrar() {
    const b = limites(daCasa('comodos'), daCasa('moveis'));
    const cx = (b.x0 + b.x1) / 2, cz = (b.y0 + b.y1) / 2;
    const larg = Math.max(3, b.x1 - b.x0), prof = Math.max(3, b.y1 - b.y0);
    const k = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const aspecto = Math.max(0.4, camera.aspect || 1.6);
    const cs = daCasa('comodos');
    const alto = cs.length ? Math.max(...cs.map((c) => c.nivel + c.pe)) : 3;
    const fachada = estado.vista === 'fachada';
    orb.alvo.set(cx, fachada ? alto * 0.42 : 0.8, cz);
    // na fachada a altura conta (torres, pilotis); na maquete, a planta
    const distPlanta = Math.max(larg, prof) * 1.35 / (k * Math.min(1, aspecto)) * 0.62 + 4;
    const distAltura = fachada ? alto * 1.5 / k + Math.max(larg, prof) / 2 : 0;
    orb.dist = clamp(Math.max(distPlanta, distAltura), 6, 90);
    orb.pitch = estado.vista === 'fachada' ? 0.28 : 0.82;
    orb.yaw = estado.vista === 'fachada' ? 0.35 : 0.6;
    planta.cx = cx; planta.cz = cz;
    const kp = 2 * Math.tan(THREE.MathUtils.degToRad(24 / 2));
    planta.h = clamp(Math.max(prof * 1.3 / kp, larg * 1.25 / (kp * aspecto)), 5, 150);
    marcarSujo();
  }
  function entrarAndar() {
    const cs = daCasa('comodos');
    // na casa de verdade, o quarto; nas dos sonhos, o primeiro cômodo da lista (o coração da casa)
    const real = casaAtual() && casaAtual().tipo === 'real';
    const quarto = (real && cs.find((c) => /quarto/i.test(c.nome))) || cs.find((c) => !ehCilindro(c) && norm(c.forma) !== 'patio') || cs[0];
    // entra pelo fundo do cômodo, olhando pro lado de lá: cabe o cômodo quase inteiro na tela
    if (quarto) { fps.x = quarto.x + quarto.largura / 2; fps.z = quarto.y + Math.max(quarto.profundidade * 0.5, quarto.profundidade - 0.45); fps.nivel = quarto.nivel; } else { fps.x = 0; fps.z = 3; fps.nivel = 0; }
    fps.yaw = 0; fps.pitch = -0.12;
    // com porta: entra por ela, um passo além da folha aberta, olhando pra dentro do cômodo
    const porta = quarto && !ehCilindro(quarto) && daCasa('aberturas').find((a) => a.tipo === 'porta' && norm(a.comodo) === norm(quarto.nome));
    if (porta) {
      const horiz = porta.lado === 'N' || porta.lado === 'S';
      const comp = horiz ? quarto.largura : quarto.profundidade;
      const larg = Math.min(porta.largura, comp - 0.1);
      const meio = Math.max(0.05, Math.min(comp - larg - 0.05, porta.posicao != null ? porta.posicao : (comp - larg) / 2)) + larg / 2;
      const dentro = Math.min(Math.max(1.0, 0.8 * larg + 0.3), (horiz ? quarto.profundidade : quarto.largura) - 0.4);
      if (porta.lado === 'S') { fps.x = quarto.x + meio; fps.z = quarto.y + quarto.profundidade - dentro; fps.yaw = 0; }
      if (porta.lado === 'N') { fps.x = quarto.x + meio; fps.z = quarto.y + dentro; fps.yaw = Math.PI; }
      if (porta.lado === 'L') { fps.z = quarto.y + meio; fps.x = quarto.x + quarto.largura - dentro; fps.yaw = Math.PI / 2; }
      if (porta.lado === 'O') { fps.z = quarto.y + meio; fps.x = quarto.x + dentro; fps.yaw = -Math.PI / 2; }
    }
  }
  function trocarVista(v) {
    estado.vista = v;
    camera.up.set(0, 1, 0);
    camera.fov = v === 'planta' ? 24 : v === 'andar' ? ((camera.aspect || 1.6) < 0.8 ? 84 : 68) : 38;
    camera.updateProjectionMatrix();
    ajustarNevoa();
    const contagem = $('es-contagem'); if (contagem) contagem.hidden = v === 'andar';
    if (v === 'andar') entrarAndar();
    enquadrar();
    montar();
    pintarBarra();
    pintarDica();
  }
  function passoCamera(dt) {
    const antes = camera.position.clone();
    const k = 1 - Math.exp(-dt * 6);
    if (estado.vista === 'planta') {
      plantaAtual.cx += (planta.cx - plantaAtual.cx) * k; plantaAtual.cz += (planta.cz - plantaAtual.cz) * k; plantaAtual.h += (planta.h - plantaAtual.h) * k;
      camera.up.set(0, 0, -1);
      camera.position.set(plantaAtual.cx, plantaAtual.h, plantaAtual.cz + 0.001);
      camera.lookAt(plantaAtual.cx, 0, plantaAtual.cz);
    } else if (estado.vista === 'andar') {
      const vel = teclas.has('shift') ? 3.2 : 1.6;
      let fx = 0, fz = 0;
      if (teclas.has('w') || teclas.has('arrowup')) fz -= 1;
      if (teclas.has('s') || teclas.has('arrowdown')) fz += 1;
      if (teclas.has('a') || teclas.has('arrowleft')) fx -= 1;
      if (teclas.has('d') || teclas.has('arrowright')) fx += 1;
      fx += joy.x; fz += joy.y;
      const len = Math.hypot(fx, fz);
      if (len > 0.01) {
        const s = Math.sin(fps.yaw), c = Math.cos(fps.yaw);
        const dx = (fx * c + fz * s) / Math.max(1, len) * vel * dt, dz = (-fx * s + fz * c) / Math.max(1, len) * vel * dt;
        andarCom(dx, dz);
      }
      const c = comodoNoPonto(daCasa('comodos'), fps.x, fps.z);
      fps.nivel += ((c ? c.nivel : 0) - fps.nivel) * k;
      camera.position.set(fps.x, fps.nivel + 1.6, fps.z);
      camera.lookAt(fps.x - Math.sin(fps.yaw) * Math.cos(fps.pitch), fps.nivel + 1.6 + Math.sin(fps.pitch), fps.z - Math.cos(fps.yaw) * Math.cos(fps.pitch));
    } else {
      if (Math.abs(velYaw) > 1e-4 && !arrastando) { orb.yaw += velYaw * dt; velYaw *= Math.exp(-dt * 4); }
      orbAtual.alvo.lerp(orb.alvo, k); orbAtual.yaw += (orb.yaw - orbAtual.yaw) * k; orbAtual.pitch += (orb.pitch - orbAtual.pitch) * k; orbAtual.dist += (orb.dist - orbAtual.dist) * (1 - Math.exp(-dt * 3.2));
      const cp = Math.cos(orbAtual.pitch);
      camera.position.set(orbAtual.alvo.x + orbAtual.dist * Math.sin(orbAtual.yaw) * cp, orbAtual.alvo.y + orbAtual.dist * Math.sin(orbAtual.pitch), orbAtual.alvo.z + orbAtual.dist * Math.cos(orbAtual.yaw) * cp);
      camera.lookAt(orbAtual.alvo);
    }
    return camera.position.distanceToSquared(antes) > 1e-10;
  }
  /* andar sem atravessar parede: testa o ponto novo contra os trechos sólidos (portas deixam passar) */
  let barreiras = [], nivelBarreiras = null;
  function calcularBarreiras() {
    barreiras = [];
    const nv = fps.nivel || 0;
    nivelBarreiras = nv;
    // só as peças de parede soltas no grupo da casa (móveis e portas moram em subgrupos)
    casa3d.children.forEach((o) => {
      if (!o.isMesh || o.geometry.type !== 'BoxGeometry' || !o.geometry.parameters) return;
      const p = o.geometry.parameters;
      const base = o.position.y - p.height / 2, topo = o.position.y + p.height / 2;
      if (base > nv + 1.2 || topo < nv + 0.45) return; // verga de porta, degrau baixo e parede de outro andar não barram
      if (Math.min(p.width, p.depth) > 0.3 || Math.max(p.width, p.depth) < 0.04) return;
      barreiras.push({ x: o.position.x, z: o.position.z, hx: p.width / 2 + 0.18, hz: p.depth / 2 + 0.18, c: Math.cos(o.rotation.y), s: Math.sin(o.rotation.y) });
    });
  }
  function andarCom(dx, dz) {
    const bloqueia = (x, z) => barreiras.some((b) => { const ax = x - b.x, az = z - b.z; return Math.abs(ax * b.c - az * b.s) < b.hx && Math.abs(ax * b.s + az * b.c) < b.hz; });
    if (!bloqueia(fps.x + dx, fps.z)) fps.x += dx;
    if (!bloqueia(fps.x, fps.z + dz)) fps.z += dz;
    marcarSujo();
  }

  /* ---------- interação ---------- */
  const ray = new THREE.Raycaster();
  const planoChao = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  function pontoNoChao(ev) {
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1), camera);
    const p = new THREE.Vector3();
    return ray.ray.intersectPlane(planoChao, p) ? { x: p.x, y: p.z } : null;
  }
  function alvoNoPonto(ev) {
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1), camera);
    const visivel = (o) => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
    const hit = ray.intersectObjects([...alvos.moveis, ...alvos.aberturas, ...alvos.comodos], false).find((h) => visivel(h.object));
    return hit ? hit.object.userData : null;
  }
  const moveisCasa = () => daCasa('moveis');
  /* na planta: o que está sob o cursor, na ordem móvel > porta/janela > borda de cômodo > cômodo */
  function acharNaPlanta(pt) {
    const ms = moveisCasa();
    for (let i = ms.length - 1; i >= 0; i--) {
      const m = ms[i], t = tipoMovel(m.tipo), a = -(m.giro || 0) * Math.PI / 180;
      const lx = (pt.x - m.x) * Math.cos(a) + (pt.y - m.y) * Math.sin(a), lz = -(pt.x - m.x) * Math.sin(a) + (pt.y - m.y) * Math.cos(a);
      if (Math.abs(lx) <= t.larg / 2 + 0.05 && Math.abs(lz) <= t.prof / 2 + 0.05) return { tipo: 'movel', ref: m };
    }
    const cs = daCasa('comodos');
    for (const ab of daCasa('aberturas')) {
      const c = cs.find((x) => norm(x.nome) === norm(ab.comodo)); if (!c) continue;
      const lado = ladoDoComodo(c, ab.lado); if (!lado) continue;
      const horiz = ab.lado === 'N' || ab.lado === 'S';
      const comp = horiz ? c.largura : c.profundidade;
      const ini = (ab.posicao != null ? ab.posicao : (comp - ab.largura) / 2);
      const [ax, ay] = lado.a;
      const x0 = horiz ? ax + ini : ax, y0 = horiz ? ay : ay + ini, x1 = horiz ? x0 + ab.largura : ax, y1 = horiz ? ay : y0 + ab.largura;
      if (pt.x >= Math.min(x0, x1) - 0.2 && pt.x <= Math.max(x0, x1) + 0.2 && pt.y >= Math.min(y0, y1) - 0.2 && pt.y <= Math.max(y0, y1) + 0.2) return { tipo: 'abertura', ref: ab };
    }
    const c = comodoNoPonto(cs, pt.x, pt.y) || cs.find((k) => pt.x >= k.x - 0.2 && pt.x <= k.x + k.largura + 0.2 && pt.y >= k.y - 0.2 && pt.y <= k.y + k.profundidade + 0.2);
    if (!c) return null;
    const tol = 0.22;
    const bordas = { O: Math.abs(pt.x - c.x) < tol, L: Math.abs(pt.x - (c.x + c.largura)) < tol, N: Math.abs(pt.y - c.y) < tol, S: Math.abs(pt.y - (c.y + c.profundidade)) < tol };
    const borda = Object.keys(bordas).filter((k) => bordas[k]);
    return { tipo: 'comodo', ref: c, borda: ehCilindro(c) ? [] : borda };
  }
  function ladoMaisPerto(c, pt) {
    const d = { N: Math.abs(pt.y - c.y), S: Math.abs(pt.y - (c.y + c.profundidade)), O: Math.abs(pt.x - c.x), L: Math.abs(pt.x - (c.x + c.largura)) };
    return Object.keys(d).sort((a, b) => d[a] - d[b])[0];
  }

  let arrastando = false, moveu = false, x0 = 0, y0 = 0, acao = null;
  const ponteiros = new Map();
  let distPinca = 0;
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('pointerdown', (ev) => {
    ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (ponteiros.size === 2) { const [a, b] = [...ponteiros.values()]; distPinca = Math.hypot(a.x - b.x, a.y - b.y); acao = null; return; }
    arrastando = true; moveu = false; x0 = ev.clientX; y0 = ev.clientY; velYaw = 0; acao = null;
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* teste */ }
    if (estado.vista === 'planta' && ev.button === 0 && !ev.shiftKey) {
      const pt = pontoNoChao(ev); if (!pt) return;
      const f = estado.ferramenta;
      if (f === 'comodo') acao = { tipo: 'desenhar', ini: { x: ajustar(pt.x), y: ajustar(pt.y) }, fim: { x: ajustar(pt.x), y: ajustar(pt.y) } };
      else if (f === 'mover') {
        const a = acharNaPlanta(pt);
        if (a && a.tipo === 'movel') acao = { tipo: 'mover-movel', ref: a.ref, dx: pt.x - a.ref.x, dy: pt.y - a.ref.y };
        else if (a && a.tipo === 'comodo' && a.borda.length) acao = { tipo: 'redimensionar', ref: a.ref, borda: a.borda, orig: { ...a.ref } };
        else if (a && a.tipo === 'comodo') acao = { tipo: 'mover-comodo', ref: a.ref, dx: pt.x - a.ref.x, dy: pt.y - a.ref.y, orig: { x: a.ref.x, y: a.ref.y }, moveis: moveisCasa().filter((m) => comodoNoPonto([a.ref], m.x, m.y)).map((m) => ({ m, x: m.x, y: m.y })) };
        else if (a) acao = { tipo: 'clicar', alvo: a };
      }
    }
    marcarSujo();
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (ponteiros.has(ev.pointerId)) ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (ponteiros.size === 2) {
      const [a, b] = [...ponteiros.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (distPinca) zoom(distPinca / Math.max(1, d)); distPinca = d; moveu = true; return;
    }
    if (!arrastando) { cursorPlanta(ev); return; }
    const dx = ev.clientX - x0, dy = ev.clientY - y0;
    if (Math.abs(dx) + Math.abs(dy) > 3) moveu = true;
    const pt = estado.vista === 'planta' ? pontoNoChao(ev) : null;
    if (acao && pt) {
      if (acao.tipo === 'desenhar') { acao.fim = { x: ajustar(pt.x), y: ajustar(pt.y) }; pintarRascunho(acao); }
      else if (acao.tipo === 'mover-movel') { acao.ref.x = ajustar(pt.x - acao.dx, 0.05); acao.ref.y = ajustar(pt.y - acao.dy, 0.05); montar(); }
      else if (acao.tipo === 'mover-comodo') {
        const nx = ajustar(pt.x - acao.dx), ny = ajustar(pt.y - acao.dy);
        const ddx = nx - acao.orig.x, ddy = ny - acao.orig.y;
        acao.ref.x = nx; acao.ref.y = ny;
        acao.moveis.forEach((k) => { k.m.x = k.x + ddx; k.m.y = k.y + ddy; });
        montar();
      } else if (acao.tipo === 'redimensionar') {
        const c = acao.ref, o = acao.orig;
        if (acao.borda.includes('L')) c.largura = Math.max(0.6, ajustar(pt.x) - o.x);
        if (acao.borda.includes('S')) c.profundidade = Math.max(0.6, ajustar(pt.y) - o.y);
        if (acao.borda.includes('O')) { const x1 = o.x + o.largura; c.x = Math.min(x1 - 0.6, ajustar(pt.x)); c.largura = x1 - c.x; }
        if (acao.borda.includes('N')) { const y1 = o.y + o.profundidade; c.y = Math.min(y1 - 0.6, ajustar(pt.y)); c.profundidade = y1 - c.y; }
        montar();
      }
      x0 = ev.clientX; y0 = ev.clientY;
      return;
    }
    if (!moveu) return;
    if (estado.vista === 'planta') {
      const k = planta.h * 2 * Math.tan(THREE.MathUtils.degToRad(12)) / Math.max(1, canvas.clientHeight);
      planta.cx -= dx * k; planta.cz -= dy * k;
    } else if (estado.vista === 'andar') {
      fps.yaw += dx * 0.004; fps.pitch = clamp(fps.pitch + dy * 0.003, -1.2, 1.2);
    } else if (ev.shiftKey || ev.buttons === 2) {
      const k = orb.dist * 0.0012;
      const s = Math.sin(orb.yaw), c = Math.cos(orb.yaw);
      orb.alvo.x -= (dx * c) * k; orb.alvo.z -= (-dx * s) * k; orb.alvo.y = clamp(orb.alvo.y + dy * k, 0, 20);
    } else {
      const ny = orb.yaw - dx * 0.005;
      velYaw = 0.6 * velYaw + 0.4 * (ny - orb.yaw) * 60;
      orb.yaw = ny; orb.pitch = clamp(orb.pitch + dy * 0.004, 0.05, 1.45);
    }
    x0 = ev.clientX; y0 = ev.clientY;
    marcarSujo();
  });
  const soltar = (ev) => {
    ponteiros.delete(ev.pointerId);
    if (ponteiros.size) return;
    arrastando = false; distPinca = 0;
    const a = acao; acao = null;
    if (a && a.tipo === 'desenhar') {
      limparRascunho();
      const x = Math.min(a.ini.x, a.fim.x), y = Math.min(a.ini.y, a.fim.y), w = Math.abs(a.fim.x - a.ini.x), d = Math.abs(a.fim.y - a.ini.y);
      if (w >= 0.8 && d >= 0.8) {
        const est = estiloAtual();
        const c = { casa: estado.casa, nome: nomeUnico('Cômodo', daCasa('comodos').map((k) => k.nome)), forma: 'retângulo', x, y, largura: w, profundidade: d, nivel: 0, pe: 2.7, piso: est.pisos[0], parede: est.cores[0] };
        estado.dados.comodos.push(c);
        selecionar({ tipo: 'comodo', ref: c });
        mudou(); aviso('Cômodo criado — dê um nome a ele no painel.');
      }
      return;
    }
    if (a && (a.tipo === 'mover-movel' || a.tipo === 'mover-comodo' || a.tipo === 'redimensionar')) {
      if (moveu) { salvar(); atualizarRotulos(); }
      selecionar({ tipo: a.tipo === 'mover-movel' ? 'movel' : 'comodo', ref: a.ref });
      return;
    }
    if (moveu || ev.type !== 'pointerup') return;
    clique(ev, a);
  };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);
  canvas.addEventListener('wheel', (ev) => { ev.preventDefault(); zoom(1 + clamp(ev.deltaY * 0.0012, -0.25, 0.25)); }, { passive: false });
  function zoom(f) {
    if (estado.vista === 'planta') planta.h = clamp(planta.h * f, 3, 200);
    else if (estado.vista !== 'andar') orb.dist = clamp(orb.dist * f, 2, 120);
    marcarSujo(); atualizarRotulos();
  }
  function cursorPlanta(ev) {
    if (estado.vista !== 'planta' || ev.pointerType !== 'mouse') { canvas.style.cursor = ''; return; }
    const f = estado.ferramenta;
    if (f !== 'mover') { canvas.style.cursor = f === 'apagar' ? 'not-allowed' : 'crosshair'; return; }
    const pt = pontoNoChao(ev); const a = pt && acharNaPlanta(pt);
    canvas.style.cursor = !a ? 'grab' : a.tipo === 'comodo' && a.borda.length ? (a.borda.some((b) => b === 'L' || b === 'O') && a.borda.some((b) => b === 'N' || b === 'S') ? 'nwse-resize' : a.borda.some((b) => b === 'L' || b === 'O') ? 'ew-resize' : 'ns-resize') : 'move';
  }
  function clique(ev, acaoAnterior) {
    if (estado.vista === 'planta') {
      const pt = pontoNoChao(ev); if (!pt) return;
      const f = estado.ferramenta;
      const cs = daCasa('comodos');
      if (f === 'porta' || f === 'janela') {
        const c = comodoNoPonto(cs, pt.x, pt.y) || cs.find((k) => pt.x >= k.x - 0.3 && pt.x <= k.x + k.largura + 0.3 && pt.y >= k.y - 0.3 && pt.y <= k.y + k.profundidade + 0.3);
        if (!c || ehCilindro(c)) { aviso('Toque perto da parede de um cômodo retangular.', 'erro'); return; }
        const lado = ladoMaisPerto(c, pt);
        const horiz = lado === 'N' || lado === 'S';
        const larg = f === 'porta' ? 0.9 : 1.2;
        const comp = horiz ? c.largura : c.profundidade;
        const pos = clamp(ajustar((horiz ? pt.x - c.x : pt.y - c.y) - larg / 2), 0.05, comp - larg - 0.05);
        const ab = { casa: estado.casa, comodo: c.nome, tipo: f, lado, posicao: pos, largura: larg, altura: f === 'porta' ? 2.1 : 1.2, peitoril: f === 'porta' ? null : 0.9 };
        estado.dados.aberturas.push(ab);
        selecionar({ tipo: 'abertura', ref: ab }); mudou(); return;
      }
      if (f === 'movel') {
        const t = tipoMovel(estado.tipoMovel);
        const m = { casa: estado.casa, nome: t.nome, tipo: t.tipo, x: ajustar(pt.x, 0.05), y: ajustar(pt.y, 0.05), nivel: 0, giro: 0, cor: '' };
        estado.dados.moveis.push(m);
        selecionar({ tipo: 'movel', ref: m }); mudou(); return;
      }
      if (f === 'apagar') { const a = acharNaPlanta(pt); if (a) apagar(a); return; }
      const a = (acaoAnterior && acaoAnterior.alvo) || acharNaPlanta(pt);
      if (a) selecionar(a); else { selecionar(null); }
      return;
    }
    const u = alvoNoPonto(ev);
    if (!u) { selecionar(null); return; }
    if (u.movel != null) {
      const m = moveisCasa()[u.movel];
      const t = tipoMovel(m.tipo);
      if (t.liga && estado.vista !== 'planta') { abrirLigado(t.liga, m); return; }
      selecionar({ tipo: 'movel', ref: m });
    } else if (u.abertura) selecionar({ tipo: 'abertura', ref: u.abertura });
    else if (u.comodo != null) { const c = daCasa('comodos')[u.comodo]; selecionar({ tipo: 'comodo', ref: c }); if (estado.vista !== 'andar') focarComodo(c); }
  }
  function focarComodo(c) {
    orb.alvo.set(c.x + c.largura / 2, c.nivel + 0.6, c.y + c.profundidade / 2);
    orb.dist = clamp(Math.max(c.largura, c.profundidade) * 2.1 + 2, 4, 40);
    orb.pitch = Math.max(orb.pitch, 0.7);
    marcarSujo();
  }
  function abrirLigado(liga, m) {
    const destino = liga === 'estante' ? 'estante.html' : 'guarda-roupa.html';
    const n = liga === 'estante' ? contagens.livros + ' livros' : contagens.pecas + ' peças';
    aviso('Abrindo ' + (liga === 'estante' ? 'a Estante' : 'o Guarda-roupa') + ' (' + n + ')…');
    setTimeout(() => { location.href = destino + '?de=casa'; }, 350);
  }
  function apagar(a) {
    if (a.tipo === 'movel') estado.dados.moveis = estado.dados.moveis.filter((m) => m !== a.ref);
    else if (a.tipo === 'abertura') estado.dados.aberturas = estado.dados.aberturas.filter((m) => m !== a.ref);
    else if (a.tipo === 'comodo') {
      estado.dados.comodos = estado.dados.comodos.filter((c) => c !== a.ref);
      estado.dados.aberturas = estado.dados.aberturas.filter((ab) => !(ab.casa === estado.casa && norm(ab.comodo) === norm(a.ref.nome)));
    }
    if (estado.sel && estado.sel.ref === a.ref) selecionar(null);
    mudou(); aviso('Apagado.');
  }

  /* rascunho do cômodo sendo desenhado + moldura da seleção */
  let rascunho = null;
  function pintarRascunho(a) {
    limparRascunho();
    const x = Math.min(a.ini.x, a.fim.x), y = Math.min(a.ini.y, a.fim.y), w = Math.abs(a.fim.x - a.ini.x), d = Math.abs(a.fim.y - a.ini.y);
    if (w < 0.05 || d < 0.05) return;
    rascunho = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), new THREE.MeshBasicMaterial({ color: 0xe6bf73, transparent: true, opacity: 0.45, depthWrite: false }));
    rascunho.position.set(x + w / 2, 0.03, y + d / 2);
    cena.add(rascunho);
    mostrarMedida(w, d);
    marcarSujo();
  }
  function limparRascunho() { if (rascunho) { cena.remove(rascunho); rascunho.geometry.dispose(); rascunho = null; } mostrarMedida(); }
  function mostrarMedida(w, d) { const el = $('cs-medida'); if (!el) return; el.hidden = w == null; if (w != null) el.textContent = w.toFixed(1).replace('.', ',') + ' × ' + d.toFixed(1).replace('.', ',') + ' m · ' + (w * d).toFixed(1).replace('.', ',') + ' m²'; }
  function pintarSelecao() {
    selecao.clear();
    const s = estado.sel; if (!s) return;
    const ouro = new THREE.LineBasicMaterial({ color: 0xe6bf73 });
    if (s.tipo === 'comodo') {
      const c = s.ref, y = c.nivel + 0.04;
      const pts = [[c.x, c.y], [c.x + c.largura, c.y], [c.x + c.largura, c.y + c.profundidade], [c.x, c.y + c.profundidade], [c.x, c.y]].map(([x, z]) => new THREE.Vector3(x, y, z));
      selecao.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ouro));
    } else if (s.tipo === 'movel') {
      const t = tipoMovel(s.ref.tipo);
      const b = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(t.larg + 0.08, t.alt + 0.04, t.prof + 0.08)), ouro);
      const c = comodoNoPonto(daCasa('comodos'), s.ref.x, s.ref.y);
      b.position.set(s.ref.x, Math.max(s.ref.nivel || 0, c ? c.nivel : 0) + t.alt / 2, s.ref.y); b.rotation.y = -(s.ref.giro || 0) * Math.PI / 180;
      selecao.add(b);
    }
    marcarSujo();
  }

  /* ---------- painel de propriedades ---------- */
  function selecionar(a) {
    estado.sel = a;
    pintarSelecao();
    const p = $('cs-painel');
    if (!a) { p.classList.remove('aberto'); return; }
    pintarPainel();
    p.classList.add('aberto');
  }
  const chipsCor = (atual, extras = []) => {
    const cores = [...new Set([...estiloAtual().cores, ...extras, ...Object.keys(CORES)])];
    return '<div class="cs-cores">' + cores.map((c) => '<button type="button" class="cs-cor' + (norm(atual) === norm(c) ? ' on' : '') + '" data-cor="' + esc(c) + '" title="' + esc(c) + '" style="--c:' + corHex(c) + '"></button>').join('') + '</div>';
  };
  const campoNum = (id, rot, v, passo = 0.1) => '<label class="cs-num"><span>' + rot + '</span><input type="number" step="' + passo + '" id="' + id + '" value="' + (Math.round(v * 100) / 100) + '"></label>';
  function pintarPainel() {
    const s = estado.sel, p = $('cs-painel');
    if (!s) return;
    let h = '<button type="button" class="es-x" data-a="fechar" aria-label="Fechar">×</button>';
    if (s.tipo === 'comodo') {
      const c = s.ref;
      h += '<p class="es-rot">Cômodo</p><input class="cs-titulo" id="cp-nome" value="' + esc(c.nome) + '">' +
        '<p class="cs-sub">' + area(c).toFixed(1).replace('.', ',') + ' m² · ' + c.largura.toFixed(1).replace('.', ',') + ' × ' + c.profundidade.toFixed(1).replace('.', ',') + ' m</p>' +
        '<div class="cs-grade">' + campoNum('cp-larg', 'Largura (m)', c.largura) + campoNum('cp-prof', 'Profundidade (m)', c.profundidade) + campoNum('cp-pe', 'Pé-direito (m)', c.pe) + campoNum('cp-nivel', 'Nível (m)', c.nivel) + '</div>' +
        '<p class="es-rot">Forma</p><div class="gr-chips">' + FORMAS.map((f) => '<button type="button" class="gr-chip' + (norm(c.forma) === norm(f) ? ' on' : '') + '" data-forma="' + esc(f) + '">' + esc(f) + '</button>').join('') + '</div>' +
        '<p class="es-rot">Piso</p><div class="gr-chips">' + PISOS.map((f) => '<button type="button" class="gr-chip' + (norm(c.piso) === norm(f) ? ' on' : '') + '" data-piso="' + esc(f) + '">' + esc(f) + '</button>').join('') + '</div>' +
        '<p class="es-rot">Paredes</p><div class="gr-chips">' + PAREDES_ESPECIAIS.map((f) => '<button type="button" class="gr-chip' + (norm(c.parede) === norm(f) ? ' on' : '') + '" data-parede="' + esc(f) + '">' + esc(f) + '</button>').join('') + '</div>' + chipsCor(c.parede) +
        '<div class="es-botoes-form"><button type="button" data-a="focar">Olhar este cômodo</button><button type="button" class="gr-perigo" data-a="apagar">Apagar cômodo</button></div>';
    } else if (s.tipo === 'movel') {
      const m = s.ref, t = tipoMovel(m.tipo);
      h += '<p class="es-rot">Móvel</p><input class="cs-titulo" id="cp-nome" value="' + esc(m.nome || t.nome) + '">' +
        '<p class="cs-sub">' + esc(t.nome) + ' · ' + t.larg.toString().replace('.', ',') + ' × ' + t.prof.toString().replace('.', ',') + ' m</p>' +
        (t.liga ? '<button type="button" class="cs-ligado" data-a="abrir">' + (t.liga === 'estante' ? 'Abrir a Estante (' + contagens.livros + ' livros) →' : 'Abrir o Guarda-roupa (' + contagens.pecas + ' peças) →') + '</button>' : '') +
        '<p class="es-rot">Girar</p><div class="gr-chips">' + [-90, -15, 15, 90].map((g) => '<button type="button" class="gr-chip" data-giro="' + g + '">' + (g > 0 ? '+' : '') + g + '°</button>').join('') + '</div>' +
        '<p class="es-rot">Cor</p>' + chipsCor(m.cor || t.cor) +
        '<p class="es-rot">Trocar por</p><select class="gr-sel" id="cp-tipo">' + LISTA_MOVEIS.map((k) => '<option value="' + esc(k) + '"' + (k === t.tipo ? ' selected' : '') + '>' + esc(MOVEIS[k].nome) + '</option>').join('') + '</select>' +
        '<div class="es-botoes-form"><button type="button" data-a="duplicar">Duplicar</button><button type="button" class="gr-perigo" data-a="apagar">Apagar</button></div>';
    } else if (s.tipo === 'abertura') {
      const ab = s.ref;
      h += '<p class="es-rot">' + (ab.tipo === 'janela' ? 'Janela' : 'Porta') + ' · ' + esc(ab.comodo) + '</p>' +
        '<div class="gr-chips">' + ['porta', 'janela'].map((k) => '<button type="button" class="gr-chip' + (ab.tipo === k ? ' on' : '') + '" data-abtipo="' + k + '">' + k + '</button>').join('') + '</div>' +
        '<div class="cs-grade">' + campoNum('cp-ablarg', 'Largura (m)', ab.largura) + campoNum('cp-abalt', 'Altura (m)', ab.altura) + (ab.tipo === 'janela' ? campoNum('cp-abpeit', 'Peitoril (m)', ab.peitoril != null ? ab.peitoril : 0.9) : '') + campoNum('cp-abpos', 'Posição (m)', ab.posicao || 0) + '</div>' +
        '<p class="es-rot">Parede</p><div class="gr-chips">' + [['N', 'fundo'], ['S', 'frente'], ['O', 'esquerda'], ['L', 'direita']].map(([k, r]) => '<button type="button" class="gr-chip' + (ab.lado === k ? ' on' : '') + '" data-ablado="' + k + '">' + r + '</button>').join('') + '</div>' +
        '<div class="es-botoes-form"><button type="button" class="gr-perigo" data-a="apagar">Apagar</button></div>';
    }
    p.innerHTML = h;
    const num = (id) => { const el = $(id); return el ? parseFloat(el.value) : NaN; };
    const ligar = (sel, f) => p.querySelectorAll(sel).forEach((b) => b.addEventListener('click', () => f(b)));
    p.querySelector('[data-a="fechar"]').addEventListener('click', () => selecionar(null));
    const nome = $('cp-nome');
    if (nome) nome.addEventListener('change', () => {
      const v = nome.value.trim(); if (!v) return;
      if (s.tipo === 'comodo') {
        const antigo = s.ref.nome;
        s.ref.nome = nomeUnico(v, daCasa('comodos').filter((c) => c !== s.ref).map((c) => c.nome));
        estado.dados.aberturas.forEach((ab) => { if (ab.casa === estado.casa && norm(ab.comodo) === norm(antigo)) ab.comodo = s.ref.nome; });
      } else s.ref.nome = v;
      mudou(false); atualizarRotulos(); pintarPainel();
    });
    p.querySelectorAll('input[type=number]').forEach((inp) => inp.addEventListener('change', () => {
      if (s.tipo === 'comodo') {
        const c = s.ref;
        c.largura = clamp(num('cp-larg') || c.largura, 0.6, 80); c.profundidade = clamp(num('cp-prof') || c.profundidade, 0.6, 80);
        c.pe = clamp(num('cp-pe') || c.pe, 2, 12); c.nivel = clamp(isNaN(num('cp-nivel')) ? c.nivel : num('cp-nivel'), -3, 30);
      } else if (s.tipo === 'abertura') {
        const ab = s.ref;
        ab.largura = clamp(num('cp-ablarg') || ab.largura, 0.3, 20); ab.altura = clamp(num('cp-abalt') || ab.altura, 0.3, 10); ab.posicao = clamp(isNaN(num('cp-abpos')) ? (ab.posicao || 0) : num('cp-abpos'), 0, 80);
        if (ab.tipo === 'janela') ab.peitoril = clamp(isNaN(num('cp-abpeit')) ? 0.9 : num('cp-abpeit'), 0, 5);
      }
      mudou(); pintarPainel();
    }));
    ligar('[data-forma]', (b) => { s.ref.forma = b.dataset.forma; mudou(); pintarPainel(); });
    ligar('[data-piso]', (b) => { s.ref.piso = b.dataset.piso; mudou(); pintarPainel(); });
    ligar('[data-parede]', (b) => { s.ref.parede = b.dataset.parede; mudou(); pintarPainel(); });
    ligar('[data-cor]', (b) => { if (s.tipo === 'comodo') s.ref.parede = b.dataset.cor; else s.ref.cor = b.dataset.cor; mudou(); pintarPainel(); });
    ligar('[data-giro]', (b) => { s.ref.giro = ((s.ref.giro || 0) + +b.dataset.giro + 360) % 360; mudou(); });
    ligar('[data-abtipo]', (b) => { s.ref.tipo = b.dataset.abtipo; if (s.ref.tipo === 'janela') { s.ref.peitoril = 0.9; s.ref.altura = 1.2; s.ref.largura = Math.max(s.ref.largura, 1.0); } else { s.ref.peitoril = null; s.ref.altura = 2.1; } mudou(); pintarPainel(); });
    ligar('[data-ablado]', (b) => { s.ref.lado = b.dataset.ablado; mudou(); pintarPainel(); });
    const tipo = $('cp-tipo');
    if (tipo) tipo.addEventListener('change', () => { const t = tipoMovel(tipo.value); s.ref.tipo = t.tipo; s.ref.nome = t.nome; mudou(); pintarPainel(); });
    ligar('[data-a="apagar"]', (b) => {
      if (!b.classList.contains('confirmar')) { b.classList.add('confirmar'); b.textContent = 'Confirmar?'; return; }
      apagar(s);
    });
    ligar('[data-a="duplicar"]', () => { const m = { ...s.ref, x: s.ref.x + 0.4, y: s.ref.y + 0.4 }; estado.dados.moveis.push(m); selecionar({ tipo: 'movel', ref: m }); mudou(); });
    ligar('[data-a="focar"]', () => { if (estado.vista === 'planta' || estado.vista === 'andar') trocarVista('maquete'); focarComodo(s.ref); });
    ligar('[data-a="abrir"]', () => abrirLigado(tipoMovel(s.ref.tipo).liga, s.ref));
  }

  /* ---------- casas: a real e as dos sonhos ---------- */
  function trocarCasa(nome) {
    estado.casa = nome;
    try { localStorage.setItem('casa-atual', nome); } catch (e) { /* ok */ }
    selecionar(null); fecharCasas();
    if (estado.vista === 'andar') entrarAndar();
    enquadrar(); montar(); pintarBarra();
  }
  function duplicarCasa(base, novoNome) {
    const nome = nomeUnico(novoNome || base + ' (cópia)', estado.dados.casas.map((c) => c.nome));
    const orig = estado.dados.casas.find((c) => c.nome === base);
    estado.dados.casas.push({ ...orig, nome, tipo: orig.tipo === 'real' ? 'sonho' : orig.tipo });
    ['comodos', 'aberturas', 'moveis'].forEach((k) => estado.dados[k].filter((x) => x.casa === base).forEach((x) => estado.dados[k].push({ ...x, casa: nome })));
    return nome;
  }
  function abrirCasas() {
    const p = $('cs-casas');
    const casas = estado.dados.casas;
    p.innerHTML = '<button type="button" class="es-x" data-a="fechar" aria-label="Fechar">×</button><h2>Casas</h2>' +
      '<p class="gr-apagado">A sua casa de verdade e as casas dos sonhos. Toque pra entrar; duplique uma casa-modelo pra desenhar em cima dela.</p>' +
      casas.map((c) => {
        const cs = estado.dados.comodos.filter((k) => k.casa === c.nome);
        const m2 = cs.reduce((s, k) => s + area(k), 0);
        const est = ESTILOS[norm(c.estilo)] || ESTILOS.livre;
        return '<section class="cs-casa' + (c.nome === estado.casa ? ' ativa' : '') + '">' +
          '<header><b>' + esc(c.nome) + '</b><span class="cs-tag">' + (c.tipo === 'real' ? 'de verdade' : 'dos sonhos') + '</span></header>' +
          '<div class="cs-paleta">' + est.cores.map((k) => '<i style="--c:' + corHex(k) + '"></i>').join('') + '<span>' + esc(est.nome) + ' · ' + cs.length + ' cômodos · ' + m2.toFixed(0) + ' m²</span></div>' +
          (c.referencia ? '<p class="cs-ref">' + esc(c.referencia) + '</p>' : '') +
          (c.notas ? '<p class="gr-apagado">' + esc(c.notas) + '</p>' : '') +
          '<div class="eo-btns-lista"><button type="button" class="eo-mini' + (c.nome === estado.casa ? ' on' : ' principal') + '" data-entrar="' + esc(c.nome) + '">' + (c.nome === estado.casa ? 'Você está aqui' : 'Entrar') + '</button>' +
          '<button type="button" class="eo-mini" data-duplicar="' + esc(c.nome) + '">Duplicar pra desenhar</button>' +
          (casas.length > 1 ? '<button type="button" class="eo-mini" data-apagar="' + esc(c.nome) + '">Apagar</button>' : '') + '</div></section>';
      }).join('') +
      '<div class="eo-nova"><input id="cs-nova" placeholder="Nome da casa nova, ex.: Casa na serra"><button type="button" class="eo-mini principal" data-a="nova">Criar em branco</button></div>' +
      '<p class="es-rot" style="margin-top:14px">Estilo desta casa</p><div class="gr-chips">' + Object.entries(ESTILOS).map(([k, v]) => '<button type="button" class="gr-chip' + (norm(casaAtual().estilo) === k ? ' on' : '') + '" data-estilo="' + k + '">' + esc(v.nome) + '</button>').join('') + '</div>' +
      '<p class="gr-apagado" style="margin-top:6px">O estilo muda as cores e pisos sugeridos nos painéis (nada é repintado sozinho).</p>';
    p.querySelector('[data-a="fechar"]').addEventListener('click', fecharCasas);
    p.querySelectorAll('[data-entrar]').forEach((b) => b.addEventListener('click', () => trocarCasa(b.dataset.entrar)));
    p.querySelectorAll('[data-duplicar]').forEach((b) => b.addEventListener('click', () => { const n = duplicarCasa(b.dataset.duplicar); salvar(); trocarCasa(n); aviso('Cópia criada: "' + n + '". Desenhe à vontade.'); }));
    p.querySelectorAll('[data-apagar]').forEach((b) => b.addEventListener('click', () => {
      if (!b.classList.contains('confirmar')) { b.classList.add('confirmar'); b.textContent = 'Confirmar?'; return; }
      const nome = b.dataset.apagar;
      estado.dados.casas = estado.dados.casas.filter((c) => c.nome !== nome);
      ['comodos', 'aberturas', 'moveis'].forEach((k) => { estado.dados[k] = estado.dados[k].filter((x) => x.casa !== nome); });
      salvar(); trocarCasa(estado.dados.casas[0].nome);
    }));
    p.querySelector('[data-a="nova"]').addEventListener('click', () => {
      const nome = nomeUnico(($('cs-nova').value || '').trim() || 'Casa nova', estado.dados.casas.map((c) => c.nome));
      estado.dados.casas.push({ nome, tipo: 'sonho', estilo: 'livre', referencia: '', notas: '' });
      salvar(); trocarCasa(nome); trocarVista('planta'); definirFerramenta('comodo');
      aviso('Casa nova. Arraste na planta pra desenhar o primeiro cômodo.');
    });
    p.querySelectorAll('[data-estilo]').forEach((b) => b.addEventListener('click', () => { casaAtual().estilo = b.dataset.estilo; salvar(); abrirCasas(); pintarBarra(); }));
    p.classList.add('aberto');
  }
  function fecharCasas() { $('cs-casas').classList.remove('aberto'); }

  /* ---------- rótulos (nome do cômodo + m²) projetados na tela ---------- */
  let rotulosSujos = true;
  function atualizarRotulos() { rotulosSujos = true; marcarSujo(); }
  function desenharRotulos() {
    const cx = $('cs-rotulos'); if (!cx) return;
    cx.classList.toggle('planta', estado.vista === 'planta');
    if (estado.vista === 'andar' || estado.vista === 'fachada') { cx.innerHTML = ''; return; }
    const r = canvas.getBoundingClientRect();
    const cs = daCasa('comodos');
    if (cx.childElementCount !== cs.length || rotulosSujos) {
      cx.innerHTML = cs.map((c, i) => '<button type="button" class="cs-rotulo" data-i="' + i + '"><b>' + esc(c.nome) + '</b>' + (estado.vista === 'planta' ? '<span>' + area(c).toFixed(1).replace('.', ',') + ' m²</span>' : '') + '</button>').join('');
      rotulosSujos = false;
    }
    cs.forEach((c, i) => {
      const el = cx.children[i]; if (!el) return;
      const v = new THREE.Vector3(c.x + c.largura / 2, c.nivel + (estado.vista === 'planta' ? 0 : 0.4), c.y + c.profundidade / 2).project(camera);
      const fora = v.z > 1 || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05;
      el.style.display = fora ? 'none' : '';
      el.style.transform = 'translate(' + Math.round((v.x + 1) / 2 * r.width) + 'px,' + Math.round((1 - v.y) / 2 * r.height) + 'px) translate(-50%,-50%)';
    });
  }

  /* ---------- persistência ---------- */
  let timer = 0, fila = Promise.resolve();
  function salvar() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fila = fila.then(async () => {
        // o corpo sai na hora do envio: assim leva a versão devolvida pela gravação anterior (sem 409 falso)
        const corpo = JSON.stringify({ ...estado.dados, versao: estado.versao });
        const r = await fetch('/api/casa', { method: 'POST', headers: H, body: corpo });
        const j = await r.json().catch(() => ({}));
        if (r.status === 409 && j.atual) {
          estado.dados = { casas: j.atual.casas, comodos: j.atual.comodos, aberturas: j.atual.aberturas, moveis: j.atual.moveis };
          estado.versao = j.atual.versao;
          if (!estado.dados.casas.some((c) => c.nome === estado.casa)) estado.casa = estado.dados.casas[0].nome;
          aviso(j.erro, 'erro'); selecionar(null); montar(); pintarBarra(); return;
        }
        if (!r.ok) throw new Error(j.erro || 'Não consegui salvar.');
        estado.versao = j.versao;
        aviso('Salvo no caderno ✓');
      }).catch((e) => aviso(e.message || 'Não consegui salvar.', 'erro'));
    }, 400);
  }
  function mudou(refazer = true) { if (refazer) montar(); pintarSelecao(); pintarBarra(); salvar(); }
  let timerAviso = 0;
  function aviso(t, tipo) { const el = $('gr-aviso'); if (!el) return; el.textContent = t; el.className = 'gr-aviso on ' + (tipo || 'ok'); clearTimeout(timerAviso); timerAviso = setTimeout(() => el.classList.remove('on'), 2800); }

  /* ---------- barra ---------- */
  function definirFerramenta(f) { if (f === 'movel' && estado.ferramenta !== 'movel') catalogoCheio = true; estado.ferramenta = f; pintarBarra(); pintarDica(); if (f === 'movel') abrirCatalogo(); else fecharCatalogo(); }
  let catalogoCheio = true;
  function abrirCatalogo() {
    const el = $('cs-catalogo');
    el.hidden = false;
    el.classList.toggle('mini', !catalogoCheio);
    if (!catalogoCheio) {
      // escolhido o móvel, o catálogo encolhe numa linha e a planta fica livre
      el.innerHTML = '<span class="cs-cat-escolhido"><b>' + esc(tipoMovel(estado.tipoMovel).nome) + '</b> toque na planta pra pôr</span><button type="button" class="gr-chip" data-a="trocar">trocar</button>';
      el.querySelector('[data-a="trocar"]').addEventListener('click', () => { catalogoCheio = true; abrirCatalogo(); });
      return;
    }
    el.innerHTML = '<p class="es-rot">Escolha um móvel e toque na planta pra pôr</p>' + GRUPOS.map((g) => {
      const itens = LISTA_MOVEIS.filter((k) => MOVEIS[k].grupo === g);
      return itens.length ? '<div class="cs-cat-g"><span>' + g + '</span>' + itens.map((k) => '<button type="button" class="gr-chip' + (estado.tipoMovel === k ? ' on' : '') + '" data-tipo="' + esc(k) + '">' + esc(MOVEIS[k].nome) + '</button>').join('') + '</div>' : '';
    }).join('');
    el.querySelectorAll('[data-tipo]').forEach((b) => b.addEventListener('click', () => { estado.tipoMovel = b.dataset.tipo; catalogoCheio = false; abrirCatalogo(); }));
  }
  function fecharCatalogo() { const el = $('cs-catalogo'); if (el) el.hidden = true; }
  function pintarDica() {
    const d = $('es-dica'); if (!d) return;
    const t = {
      planta: { mover: 'arraste um cômodo pra mover, a borda pra esticar, um móvel pra arrastar · arraste o vazio pra andar pela planta', comodo: 'arraste na planta pra desenhar um cômodo (as medidas aparecem)', porta: 'toque perto de uma parede pra pôr uma porta', janela: 'toque perto de uma parede pra pôr uma janela', movel: 'escolha o móvel embaixo e toque na planta', apagar: 'toque no que quer apagar' }[estado.ferramenta],
      maquete: 'arraste pra girar · roda ou pinça pra aproximar · toque num cômodo pra chegar perto · toque na estante ou no guarda-roupa pra abrir',
      fachada: 'a casa por fora, com telhado · arraste pra girar',
      andar: movel ? 'o círculo embaixo anda · arraste o resto da tela pra olhar' : 'W A S D ou setas pra andar (Shift corre) · arraste pra olhar',
    }[estado.vista];
    d.textContent = t;
  }
  function pintarBarra() {
    ui.querySelector('.es-barra')?.remove();
    const barra = document.createElement('div');
    barra.className = 'es-barra';
    const c = casaAtual();
    const cs = daCasa('comodos');
    const m2 = cs.reduce((s, k) => s + area(k), 0);
    const ic = (p) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>';
    barra.innerHTML = '<div class="eb-linha">' +
      '<a class="es-voltar" href="eu.html#colecao" title="Voltar para Eu" aria-label="Voltar para Eu">' + ic('<path d="M15 5l-7 7 7 7"/>') + '</a>' +
      '<div class="es-titulo"><b>Casa</b><span>' + cs.length + (cs.length === 1 ? ' cômodo · ' : ' cômodos · ') + m2.toFixed(0) + ' m²</span></div>' +
      '<nav class="gr-troca" aria-label="Móveis"><a href="estante.html">Estante</a><a href="guarda-roupa.html">Guarda-roupa</a><a aria-current="page">Casa</a></nav>' +
      '<button type="button" class="es-btn cs-qual" id="cs-abrir-casas">' + esc(c.nome) + ic('<path d="M7 10l5 5 5-5"/>') + '</button>' +
      '<div class="eb-acoes">' +
        '<div class="cs-vistas">' + VISTAS.map(([k, r]) => '<button type="button" data-vista="' + k + '" class="' + (estado.vista === k ? 'on' : '') + '">' + r + '</button>').join('') + '</div>' +
        '<span class="eb-sep" aria-hidden="true"></span>' +
        (estado.vista === 'maquete' ? '<button type="button" class="es-btn' + (estado.paredes !== 'inteiras' ? ' on' : '') + '" id="cs-cortar" title="Trocar o jeito das paredes">' + PAREDES_MODOS[estado.paredes] + '</button>' : '') +
        '<button type="button" class="es-btn es-icone' + (estado.ajustesAbertos ? ' on' : '') + '" id="cs-ajustes" title="Aparência" aria-label="Aparência">' + ic('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>') + '</button>' +
        '<button type="button" class="es-btn es-icone" id="cs-guia" title="Como usar" aria-label="Como usar">' + ic('<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.7"/><path d="M12 17h.01"/>') + '</button>' +
      '</div></div>' +
      (estado.vista === 'planta' ? '<div class="cs-ferramentas">' + FERRAMENTAS.map(([k, r, p]) => '<button type="button" data-ferr="' + k + '" class="' + (estado.ferramenta === k ? 'on' : '') + '">' + ic(p) + '<span>' + r + '</span></button>').join('') + '</div>' : '') +
      '<div class="es-ajustes-cx' + (estado.ajustesAbertos ? ' aberto' : '') + '"><div class="eaj-grade"><div><p class="es-rot">Céu</p><div class="es-fundo-cx">' + AMB.map(([k, r]) => '<button type="button" class="es-fundo-btn' + (estado.amb === k ? ' on' : '') + '" data-amb="' + k + '">' + r + '</button>').join('') + '</div></div></div></div>';
    ui.insertBefore(barra, ui.firstChild);
    barra.querySelectorAll('[data-vista]').forEach((b) => b.addEventListener('click', () => trocarVista(b.dataset.vista)));
    barra.querySelectorAll('[data-ferr]').forEach((b) => b.addEventListener('click', () => definirFerramenta(b.dataset.ferr)));
    barra.querySelectorAll('[data-amb]').forEach((b) => b.addEventListener('click', () => { aplicarAmbiente(b.dataset.amb); montar(); pintarBarra(); }));
    barra.querySelector('#cs-abrir-casas').addEventListener('click', abrirCasas);
    barra.querySelector('#cs-ajustes').addEventListener('click', () => { estado.ajustesAbertos = !estado.ajustesAbertos; pintarBarra(); });
    barra.querySelector('#cs-guia').addEventListener('click', abrirGuia);
    const cortar = barra.querySelector('#cs-cortar');
    if (cortar) cortar.addEventListener('click', () => {
      const ordem = Object.keys(PAREDES_MODOS);
      estado.paredes = ordem[(ordem.indexOf(estado.paredes) + 1) % ordem.length];
      try { localStorage.setItem('casa-paredes', estado.paredes); } catch (e) { /* ok */ }
      montar(); pintarBarra();
    });
  }
  function abrirGuia() {
    const g = $('es-guia');
    const sec = (t, x) => '<div class="es-campo"><p class="es-rot">' + t + '</p><p>' + x + '</p></div>';
    g.innerHTML = '<button type="button" class="es-x" data-a="fechar" aria-label="Fechar">×</button><h2>Como usar a Casa</h2>' +
      sec('As vistas', '<b>Planta</b>: de cima, pra desenhar. <b>Maquete</b>: a casa sem teto, girando. <b>Fachada</b>: por fora, com telhado. <b>Andar</b>: por dentro, na altura dos olhos.') +
      sec('Desenhar a sua casa', 'Na Planta, escolha <b>Cômodo</b> e arraste: as medidas aparecem enquanto você arrasta. Com <b>Mover</b>, arraste um cômodo (os móveis vão junto) ou puxe a borda pra esticar. <b>Porta</b> e <b>Janela</b>: toque perto de uma parede. Onde dois cômodos se encostam, vira uma parede só.') +
      sec('Móveis e cores', '<b>Móvel</b>: escolha no catálogo (cama, escrivaninha, piano, estante…) e toque na planta. Toque num cômodo ou móvel pra abrir o painel: nome, medidas, piso, cor das paredes, cor do móvel, girar, duplicar, apagar.') +
      sec('Tudo ligado', 'A <b>estante</b> e o <b>guarda-roupa</b> da casa são os seus de verdade: toque neles (na Maquete ou no Andar) e a página deles abre. A chave no topo leva entre Estante, Guarda-roupa e Casa.') +
      sec('Casas dos sonhos', 'No nome da casa (no topo), veja as casas-modelo — inspiradas na Bauhaus, na Casa Melnikov, na Casa de Vidro de Lina Bo Bardi, na casa japonesa. <b>Duplique</b> uma pra desenhar em cima dela; a original fica intacta.') +
      sec('No caderno', 'Tudo fica em Logboard/# Board/Focos/Minha Casa.md, em tabelas — dá pra editar lá também.');
    g.querySelector('[data-a="fechar"]').addEventListener('click', () => g.classList.remove('aberto'));
    g.classList.add('aberto');
  }

  ui.innerHTML = '<p class="es-contagem" id="es-contagem"></p><p class="es-dica" id="es-dica"></p>' +
    '<div class="cs-rotulos" id="cs-rotulos"></div><div class="cs-medida" id="cs-medida" hidden></div>' +
    '<div class="cs-catalogo" id="cs-catalogo" hidden></div>' +
    '<div class="cs-joy" id="cs-joy" hidden><i></i></div>' +
    '<div class="es-livro cs-painel" id="cs-painel"></div><div class="es-livro es-org" id="cs-casas"></div><div class="es-livro es-progresso" id="es-guia"></div>' +
    '<div class="gr-aviso" id="gr-aviso" role="status"></div>';
  $('cs-rotulos').addEventListener('click', (ev) => {
    const b = ev.target.closest('.cs-rotulo'); if (!b) return;
    const c = daCasa('comodos')[+b.dataset.i]; if (!c) return;
    selecionar({ tipo: 'comodo', ref: c }); if (estado.vista !== 'planta') focarComodo(c);
  });

  /* joystick do Andar no celular */
  const joy = { x: 0, y: 0 };
  const joyEl = $('cs-joy');
  let joyId = null;
  joyEl.addEventListener('pointerdown', (e) => { joyId = e.pointerId; joyEl.setPointerCapture(e.pointerId); moverJoy(e); });
  joyEl.addEventListener('pointermove', (e) => { if (e.pointerId === joyId) moverJoy(e); });
  const soltarJoy = () => { joyId = null; joy.x = joy.y = 0; joyEl.firstChild.style.transform = ''; };
  joyEl.addEventListener('pointerup', soltarJoy); joyEl.addEventListener('pointercancel', soltarJoy);
  function moverJoy(e) {
    const r = joyEl.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const l = Math.max(1, Math.hypot(dx, dy));
    joy.x = dx / l; joy.y = dy / l;
    joyEl.firstChild.style.transform = 'translate(' + joy.x * 28 + 'px,' + joy.y * 28 + 'px)';
    marcarSujo();
  }

  window.addEventListener('keydown', (ev) => {
    const digitando = ev.target && ev.target.matches && ev.target.matches('input, textarea, select');
    if (ev.key === 'Escape') { selecionar(null); fecharCasas(); $('es-guia').classList.remove('aberto'); return; }
    if (digitando) return;
    if (estado.vista === 'andar') { teclas.add(ev.key.toLowerCase()); if (ev.shiftKey) teclas.add('shift'); if (/^arrow/i.test(ev.key)) ev.preventDefault(); marcarSujo(); return; }
    if ((ev.key === 'r' || ev.key === 'R') && estado.sel && estado.sel.tipo === 'movel') { estado.sel.ref.giro = ((estado.sel.ref.giro || 0) + 90) % 360; mudou(); }
    if ((ev.key === 'Delete' || ev.key === 'Backspace') && estado.sel) apagar(estado.sel);
  });
  window.addEventListener('keyup', (ev) => { teclas.delete(ev.key.toLowerCase()); if (!ev.shiftKey) teclas.delete('shift'); });

  /* ---------- laço: desenha só quando precisa ---------- */
  let sujo = 4;
  function marcarSujo() { sujo = Math.max(sujo, 3); }
  ['pointermove', 'pointerdown', 'pointerup', 'wheel', 'keydown', 'resize'].forEach((t) => window.addEventListener(t, marcarSujo, { passive: true }));
  window.addEventListener('resize', () => { palco.redimensionar(); enquadrar(); atualizarRotulos(); });
  palco.redimensionar();
  aplicarAmbiente(estado.amb);
  // a primeira vista: a maquete; com ?vista= dá pra abrir direto noutra
  const pedida = (location.search.match(/[?&]vista=(\w+)/) || [])[1];
  estado.vista = VISTAS.some((v) => v[0] === pedida) ? pedida : 'maquete';
  trocarVista(estado.vista);
  $('es-contagem').textContent = estado.dados.casas.length + (estado.dados.casas.length === 1 ? ' casa' : ' casas');

  const relogio = new THREE.Clock();
  function quadro() {
    requestAnimationFrame(quadro);
    const dt = Math.min(0.05, relogio.getDelta());
    joyEl.hidden = !(estado.vista === 'andar' && movel);
    if (estado.vista === 'andar' && casa3d && (!barreiras.length || Math.abs((fps.nivel || 0) - nivelBarreiras) > 0.5)) calcularBarreiras();
    const andando = estado.vista === 'andar' && (teclas.size || joy.x || joy.y);
    const precisa = passoCamera(dt) || sujo > 0 || andando;
    if (precisa) { aplicarCorte(); palco.renderizar(dt); if (sujo > 0) sujo--; desenharRotulos(); }
  }
  quadro();

  window.__casa = { estado, palco, orb, orbAtual, planta, plantaAtual, fps, trocarVista, trocarCasa, selecionar, get alvos() { return alvos; }, enquadrar, andarCom, calcularBarreiras, montar: () => montar(), duplicarCasa };
}

iniciar();
