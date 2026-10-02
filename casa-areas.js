import * as THREE from './vendor/three.module.min.js';
import { tipoMovel, comodoNoPonto, norm } from './casa-modelo.js';

/* As áreas da casa: a Estante e o Guarda-roupa de verdade, montados dentro dos móveis ligados
   (liga: 'estante' / 'guarda-roupa') em vez de caixas genéricas. Entrar numa área:
     1. a câmera voa (no referencial da casa) até a vista da área;
     2. na chegada, troca-se o referencial — a casa passa a ser desenhada em volta da área, que fica
        na origem — e a área assume a câmera e o mouse com o código dela, sem reescrever nada;
     3. sair desfaz a troca; como tudo se move junto, a tela não pula.
   As paredes e os móveis que ficam entre a câmera e a área somem enquanto ela está aberta. */

const EIXO_Y = new THREE.Vector3(0, 1, 0);
const suave = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const DEFS = [
  ['estante', () => import('./estante3d.js').then((m) => m.montarEstante), 'Estante'],
  ['guarda-roupa', () => import('./guarda-roupa3d.js').then((m) => m.montarGuardaRoupa), 'Guarda-roupa'],
];

export function criarAreas(h) {
  const { palco, canvas, ui, mundo } = h;
  const { camera, cena } = palco;
  const REG = new Map();
  let ativa = null;
  let voo = null;
  const ouvirPara = (reg) => (alvo, tipo, fn, op) => alvo.addEventListener(tipo, (ev) => { if (ativa === reg && !voo) fn(ev); }, op);

  // luz de dentro, pra área não ficar na sombra das paredes; existe desde o começo (acendê-la depois
  // recompilaria todos os materiais), só muda de força
  const luz = new THREE.PointLight(0xfff0dc, 0, 9, 1.6);
  cena.add(luz);

  function migalha(reg) {
    const partes = [h.casaNome()];
    if (reg.movel) { const c = comodoNoPonto(h.comodos(), reg.movel.x, reg.movel.y); if (c) partes.push(c.nome); }
    return partes.join(' › ') + ' ›';
  }

  /* carrega uma por uma (a casa aparece antes, as áreas chegam em seguida) */
  async function carregar() {
    for (const [nome, imp, rotulo] of DEFS) {
      const raiz = new THREE.Group();
      raiz.name = 'area:' + nome;
      raiz.visible = false;
      mundo.add(raiz);
      const camada = document.createElement('div');
      camada.className = 'ui-camada';
      camada.hidden = true;
      ui.appendChild(camada);
      const reg = { nome, rotulo, raiz, camada, api: null, movel: null, medidas: null };
      REG.set(nome, reg);
      try {
        const montar = await imp();
        reg.api = await montar({ palco, canvas, ui: camada, raiz, ouvir: ouvirPara(reg), migalha: () => migalha(reg) });
      } catch (e) {
        console.error('área ' + nome + ' não montou', e);
      }
      posicionar();
      h.aoCarregar(nome);
    }
  }

  /* cada área vai pro primeiro móvel ligado a ela na casa atual; o centro dela cai no centro do móvel */
  function posicionar() {
    if (ativa || voo) return;
    const moveis = h.moveis();
    REG.forEach((reg) => {
      if (!reg.api) return;
      const m = moveis.find((x) => tipoMovel(x.tipo).liga === reg.nome) || null;
      reg.movel = m;
      reg.raiz.visible = !!m;
      reg.caixaCasa = null;
      reg.ocultaPelaArea = false;
      if (!m) return;
      const md = reg.api.medidas();
      reg.medidas = md;
      const c = comodoNoPonto(h.comodos(), m.x, m.y);
      const a = -(m.giro || 0) * Math.PI / 180;
      reg.raiz.rotation.set(0, a, 0);
      const meio = new THREE.Vector3((md.xMin + md.xMax) / 2, 0, (md.zTras + md.zFrente) / 2).applyAxisAngle(EIXO_Y, a);
      reg.raiz.position.set(m.x - meio.x, Math.max(m.nivel || 0, c ? c.nivel : 0), m.y - meio.z);
      reg.raiz.updateMatrix();
      reg.raiz.updateMatrixWorld(true);
    });
  }

  /* medidas reais do móvel ligado (a planta desenha e seleciona com elas) */
  function dimsDe(m) {
    for (const reg of REG.values()) {
      if (reg.movel === m && reg.medidas) return { larg: reg.medidas.largura, prof: reg.medidas.zFrente - reg.medidas.zTras, alt: reg.medidas.altura };
    }
    return null;
  }
  const areaDoMovel = (m) => { for (const reg of REG.values()) if (reg.movel === m && reg.api) return reg.nome; return null; };

  /* clique na casa: acertou uma área? devolve o nome e a distância */
  function acertar(ray) {
    let melhor = null;
    REG.forEach((reg) => {
      if (!reg.raiz.visible || !reg.api) return;
      const hit = ray.intersectObject(reg.raiz, true).find((x) => visivel(x.object));
      if (hit && (!melhor || hit.distance < melhor.distancia)) melhor = { nome: reg.nome, distancia: hit.distance };
    });
    return melhor;
  }
  function visivel(o) { for (; o; o = o.parent) if (!o.visible) return false; return true; }

  /* ---------- voo da câmera ---------- */
  function alvoAtual(dist) {
    const d = new THREE.Vector3(); camera.getWorldDirection(d);
    return camera.position.clone().addScaledVector(d, dist);
  }
  function voar(pos, alvo, fov, aoFim) {
    const distVoo = camera.position.distanceTo(pos);
    const de = { pos: camera.position.clone(), alvo: alvoAtual(Math.max(1, camera.position.distanceTo(alvo))), fov: camera.fov };
    camera.up.set(0, 1, 0);
    voo = { t: 0, inicio: performance.now(), dur: Math.min(1.5, Math.max(0.75, distVoo / 7)), de, para: { pos, alvo, fov }, arco: Math.min(1.4, distVoo * 0.12), aoFim };
  }
  const tmpP = new THREE.Vector3(), tmpA = new THREE.Vector3();
  function passoVoo(dt) {
    if (!voo) return false;
    // pelo relógio, não pelos quadros: num computador lento o voo pula quadros mas chega na hora
    voo.t = Math.min(1, (performance.now() - voo.inicio) / 1000 / voo.dur);
    const e = suave(voo.t);
    tmpP.lerpVectors(voo.de.pos, voo.para.pos, e);
    tmpP.y += Math.sin(Math.PI * e) * voo.arco;
    tmpA.lerpVectors(voo.de.alvo, voo.para.alvo, e);
    camera.position.copy(tmpP);
    camera.lookAt(tmpA);
    camera.fov = voo.de.fov + (voo.para.fov - voo.de.fov) * e;
    camera.updateProjectionMatrix();
    if (voo.t >= 1) { const f = voo.aoFim; voo = null; if (f) f(); }
    return true;
  }

  /* ---------- troca de referencial ---------- */
  function referencialDaArea(reg) {
    const T = reg.raiz.matrix.clone();
    const Ti = T.clone().invert();
    mundo.matrixAutoUpdate = false;
    mundo.matrix.copy(Ti);
    mundo.updateMatrixWorld(true);
    camera.position.applyMatrix4(Ti);
    camera.quaternion.premultiply(new THREE.Quaternion().setFromRotationMatrix(Ti));
    camera.updateMatrixWorld(true);
    const giro = new THREE.Quaternion().setFromRotationMatrix(Ti);
    const md = reg.medidas || reg.api.medidas();
    palco.ajustarSombra((md.xMin + md.xMax) / 2, md.altura / 2, md.largura + 3, md.altura + 1, 3, { z: 0.6, dir: palco.dirSol.clone().applyQuaternion(giro) });
    luz.position.set((md.xMin + md.xMax) / 2, Math.min(2.4, md.altura + 0.35), md.zFrente + 1.7);
    luz.intensity = 2.6;
  }
  function referencialDaCasa(reg) {
    const T = reg.raiz.matrix.clone();
    camera.position.applyMatrix4(T);
    camera.quaternion.premultiply(new THREE.Quaternion().setFromRotationMatrix(T));
    camera.updateMatrixWorld(true);
    mundo.matrix.identity();
    mundo.updateMatrixWorld(true);
    luz.intensity = 0;
  }

  /* quanto espaço há na frente do móvel até a parede do cômodo (pra câmera não sair do quarto) */
  function distanciaLivre(m) {
    const c = m && comodoNoPonto(h.comodos(), m.x, m.y);
    if (!c) return 6;
    const a = -(m.giro || 0) * Math.PI / 180;
    const fx = Math.sin(a), fz = Math.cos(a);
    const tx = fx > 1e-6 ? (c.x + c.largura - m.x) / fx : fx < -1e-6 ? (c.x - m.x) / fx : Infinity;
    const tz = fz > 1e-6 ? (c.y + c.profundidade - m.y) / fz : fz < -1e-6 ? (c.y - m.y) / fz : Infinity;
    return Math.max(1.6, Math.min(tx, tz) - 0.32);
  }

  /* ---------- entrar e sair ---------- */
  function entrar(nome, opcoes = {}) {
    const reg = REG.get(nome);
    if (!reg || !reg.api) { h.aviso('Ainda montando ' + (reg ? reg.rotulo.toLowerCase() : 'a área') + '… um instante.'); return false; }
    if (!reg.movel) { h.aviso('Esta casa não tem ' + (nome === 'estante' ? 'uma estante' : 'um guarda-roupa') + ' ligado. Ponha um pelo catálogo de móveis.', 'erro'); return false; }
    if (ativa === reg) return true;
    if (voo) return false;
    const vindoDeOutra = !!ativa;
    if (ativa) sair({ semVolta: true });
    h.aoEntrar(nome, vindoDeOutra);
    // a câmera da área não recua além da parede em frente ao móvel (a vista fica dentro do cômodo)
    if (reg.api.limitar) reg.api.limitar(distanciaLivre(reg.movel));
    // a vista da área é calculada com a lente dela (38°); o voo faz a transição da lente
    const fovAntes = camera.fov;
    camera.fov = 38; camera.updateProjectionMatrix();
    const v = reg.api.vistaInicial();
    if (!opcoes.instante) { camera.fov = fovAntes; camera.updateProjectionMatrix(); }
    posicionar();
    reg.raiz.updateMatrixWorld(true);
    const pos = reg.raiz.localToWorld(v.pos.clone()), alvo = reg.raiz.localToWorld(v.alvo.clone());
    const chegar = () => {
      referencialDaArea(reg);
      ativa = reg;
      reg.camada.hidden = false;
      reg.api.entrar();
      h.aoChegar(nome);
      if (opcoes.depois) opcoes.depois(reg.api);
      h.marcarSujo();
    };
    if (opcoes.instante) {
      camera.up.set(0, 1, 0);
      camera.position.copy(pos); camera.lookAt(alvo); camera.fov = 38; camera.updateProjectionMatrix();
      chegar();
    } else voar(pos, alvo, 38, chegar);
    return true;
  }
  function sair(opcoes = {}) {
    if (!ativa) return;
    const reg = ativa;
    ativa = null;
    try { reg.api.sair(); } catch (e) { console.error(e); }
    reg.camada.hidden = true;
    const md = reg.medidas || reg.api.medidas();
    const centroLocal = new THREE.Vector3((md.xMin + md.xMax) / 2, md.altura * 0.45, (md.zTras + md.zFrente) / 2);
    referencialDaCasa(reg);
    const centro = centroLocal.applyMatrix4(reg.raiz.matrix);
    if (reg.api.refotografar) reg.api.refotografar();
    posicionar();
    h.aoSair(reg.nome, centro, !!opcoes.semVolta);
    h.marcarSujo();
  }

  /* ---------- as portas da vida: a câmera vai até o móvel e a vista fica ali ----------
     (a escrivaninha abre os estudos, o piano a música, o quadro o Atlas, o porta-retrato o Eu).
     Não trocam de referencial: a câmera só voa, e um cartão (ou uma folha) aparece por cima. */
  const camadaPorta = document.createElement('div');
  camadaPorta.className = 'ui-camada';
  camadaPorta.hidden = true;
  ui.appendChild(camadaPorta);
  let porta = null;
  let alvoOcultar = null; // ponto (no referencial da casa) que a câmera precisa enxergar
  function abrirPorta(nome, pose, preencher) {
    if (voo || ativa) return false;
    // de uma porta direto pra outra (a escrivaninha manda pro piano): sem voltar pra casa no meio
    if (porta) {
      const p = porta;
      porta = null;
      camadaPorta.hidden = true;
      try { if (p.limpar) p.limpar(); } catch (e) { console.error(e); }
      camadaPorta.innerHTML = '';
    } else h.aoEntrar('porta:' + nome, false);
    alvoOcultar = pose.alvo.clone();
    voar(pose.pos, pose.alvo, 38, () => {
      porta = { nome, centro: pose.alvo.clone(), limpar: null };
      camadaPorta.innerHTML = '';
      camadaPorta.hidden = false;
      porta.limpar = preencher(camadaPorta, () => fecharPorta()) || null;
      h.aoChegar('porta:' + nome);
      h.marcarSujo();
    });
    return true;
  }
  function fecharPorta() {
    if (!porta) return;
    const p = porta;
    porta = null;
    alvoOcultar = null;
    camadaPorta.hidden = true;
    try { if (p.limpar) p.limpar(); } catch (e) { console.error(e); }
    camadaPorta.innerHTML = '';
    h.aoSair('porta:' + p.nome, p.centro, false);
    h.marcarSujo();
  }

  /* ---------- o que fica entre a câmera e o que ela olha, some ---------- */
  const caixa = new THREE.Box3(), raioSeg = new THREE.Ray(), pontoSaida = new THREE.Vector3();
  function centroDaArea(reg) {
    const md = reg.medidas || reg.api.medidas();
    return new THREE.Vector3((md.xMin + md.xMax) / 2, Math.min(1.2, md.altura / 2), md.zFrente).applyMatrix4(reg.raiz.matrix);
  }
  function ocultarNoCaminho(casa3d) {
    if (!casa3d) return;
    const alvo = ativa ? centroDaArea(ativa) : (porta ? porta.centro : alvoOcultar);
    if (!alvo) {
      casa3d.children.forEach((o) => { if (o.userData.ocultoPelaArea) { o.visible = true; o.userData.ocultoPelaArea = false; } });
      return;
    }
    // tudo no referencial da casa
    const cam = camera.position.clone();
    if (ativa) cam.applyMatrix4(ativa.raiz.matrix);
    /* dentro de uma área, o que é alto e fica entre a câmera e o móvel (outro guarda-roupa, uma parede
       lateral de móvel) também some: a vista fica limpa, o resto da casa continua em volta */
    let volume = null;
    if (ativa) {
      const md = ativa.medidas || ativa.api.medidas();
      const camLocal = camera.position;
      const zPerto = Math.max(md.zFrente + 0.25, camLocal.z + 0.3);
      const cantos = [];
      [md.xMin - 0.15, md.xMax + 0.15].forEach((x) => [0.05, md.altura + 0.4].forEach((y) => [md.zFrente + 0.12, zPerto].forEach((z) => cantos.push(new THREE.Vector3(x, y, z).applyMatrix4(ativa.raiz.matrix)))));
      volume = new THREE.Box3().setFromPoints(cantos);
      REG.forEach((reg) => {
        if (reg === ativa || !reg.api || !reg.movel) return;
        if (!reg.caixaCasa) reg.caixaCasa = new THREE.Box3().setFromObject(reg.raiz).applyMatrix4(new THREE.Matrix4().copy(mundo.matrix).invert());
        const tapa = reg.caixaCasa.max.y - reg.caixaCasa.min.y > 1.3 && reg.caixaCasa.intersectsBox(volume);
        reg.raiz.visible = !tapa;
        reg.ocultaPelaArea = tapa;
      });
    }
    const invMundo = new THREE.Matrix4().copy(mundo.matrix).invert();
    // paredes recém-montadas ainda não têm a posição no mundo calculada: calcula antes de medir
    if (!casa3d.userData.medido) { mundo.updateWorldMatrix(true, false); casa3d.updateWorldMatrix(false, true); casa3d.userData.medido = true; }
    const dir = alvo.clone().sub(cam);
    const comp = dir.length();
    raioSeg.set(cam, dir.normalize());
    for (const o of casa3d.children) {
      const eParede = !!o.userData.parede, eMovel = o.userData.movel != null && !o.userData.escondidoPorArea;
      if (!eParede && !eMovel) continue;
      // a caixa é guardada no referencial da casa, mesmo se medida com a casa girada em volta de uma área
      if (!o.userData.caixa) o.userData.caixa = new THREE.Box3().setFromObject(o).applyMatrix4(invMundo);
      caixa.copy(o.userData.caixa).expandByScalar(eParede ? 0.12 : 0.05);
      // o próprio móvel que se olha não some
      if (eMovel && caixa.containsPoint(alvo)) continue;
      // dentro de uma área, móvel que não é rente ao chão (cadeira, mesa, cama) e fica na frente dela some
      const alto = o.userData.caixa.max.y - o.userData.caixa.min.y > 0.3;
      const bate = caixa.containsPoint(cam) || (raioSeg.intersectBox(caixa, pontoSaida) && pontoSaida.distanceTo(cam) < comp - 0.05) ||
        (volume && eMovel && alto && o.userData.caixa.intersectsBox(volume));
      if (bate) { if (o.visible) { o.visible = false; o.userData.ocultoPelaArea = true; } }
      else if (o.userData.ocultoPelaArea) { o.visible = true; o.userData.ocultoPelaArea = false; }
    }
  }

  /* ---------- laço ---------- */
  function passo(dt) {
    let precisa = false;
    if (voo) precisa = passoVoo(dt) || precisa;
    REG.forEach((reg) => {
      if (!reg.api || !reg.raiz.visible) return;
      const ehAtiva = reg === ativa && !voo;
      if (reg.api.passo(dt, ehAtiva)) precisa = true;
    });
    return precisa;
  }

  const api = {
    carregar,
    posicionar,
    dimsDe,
    areaDoMovel,
    acertar,
    entrar(nome, op) {
      const reg = REG.get(nome);
      if (reg && reg.api && reg.movel && !voo) { posicionar(); alvoOcultar = centroDaArea(reg); }
      const ok = entrar(nome, op);
      if (!ok && !ativa) alvoOcultar = null;
      return ok;
    },
    sair(op) { if (porta) { fecharPorta(); return; } sair(op); alvoOcultar = null; },
    abrirPorta,
    fecharPorta,
    passo,
    ocultarNoCaminho,
    ativa: () => (ativa ? ativa.nome : porta ? 'porta:' + porta.nome : null),
    voando: () => !!voo,
    temAlgoAberto: () => !!(ativa && ativa.api.temAlgoAberto && ativa.api.temAlgoAberto()) || !!(porta && camadaPorta.querySelector('.cs-folha-interna.aberta')),
    pronta: (nome) => !!(REG.get(nome) && REG.get(nome).api),
    lista: () => [...REG.values()].filter((r) => r.api && r.movel).map((r) => ({ nome: r.nome, rotulo: r.rotulo, resumo: r.api.resumo ? r.api.resumo() : '' })),
    resumo: (nome) => { const r = REG.get(nome); return r && r.api && r.api.resumo ? r.api.resumo() : ''; },
    api: (nome) => (REG.get(nome) || {}).api || null,
    norm,
  };
  return api;
}
