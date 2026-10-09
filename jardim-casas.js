import * as THREE from './vendor/three.module.min.js';
import { criarConstrutor } from './casa3d-construir.js';
import { norm, comodoNoPonto, limites } from './casa-modelo.js';

/* ============================================================
   AS CASAS NO JARDIM (09/out/2026, PERFIL.md item 75)
   "andar da Casa ao Jardim numa cena 3D só" (item 73) e, no discurso de 28/set, "planejar casas
   dos sonhos! referências da Bauhaus, VKHUTEMAS e mundo afora".
   As casas que você desenha na Casa (a sua e as dos sonhos) ficam de pé no Jardim, em tamanho
   real, numa rua que sai da praça: a primeira (a sua) antes do riacho, as outras depois da ponte,
   dos dois lados. A frente de cada uma (o lado com mais portas para fora) dá para a rua. Dá para
   entrar pela porta e andar lá dentro: as paredes barram como na vista "Andar" da Casa.
   Os móveis só se montam quando você chega perto (o Jardim continua leve de longe).
   ============================================================ */

export const ANGULO_RUA = 2.513;            /* entre dois canteiros extras, saindo da praça */
const TRECHOS = [{ de: 19.6, ate: 27.2, max: 1 }, { de: 35, ate: 68 }]; /* antes do riacho (só a sua) · depois da ponte */
const CALCADA = 2.4;                         /* da linha da rua até a frente da casa */
const FOLGA = 3.5;                           /* entre uma casa e a próxima, ao longo da rua */
const PERTO_MOVEIS = 30, LONGE_MOVEIS = 42;  /* os móveis aparecem a 30 m e somem depois de 42 m */

const D = [Math.sin(ANGULO_RUA), -Math.cos(ANGULO_RUA)]; /* para onde a rua vai */
const Q = [Math.cos(ANGULO_RUA), Math.sin(ANGULO_RUA)];  /* o lado da rua */
const NORMAL = { S: [0, 1], N: [0, -1], L: [1, 0], O: [-1, 0] };
const angulo = (v) => Math.atan2(v[0], v[1]);           /* a mesma convenção do rotation.y do three */
function girar(x, z, t) { const c = Math.cos(t), s = Math.sin(t); return [x * c + z * s, -x * s + z * c]; }

/* os dados de uma casa só (o arquivo da Casa guarda todas juntas) */
function daCasa(todos, nome) {
  const so = (l) => (l || []).filter((x) => norm(x.casa || todos.casas[0].nome) === norm(nome));
  return { comodos: so(todos.comodos), aberturas: so(todos.aberturas), moveis: so(todos.moveis) };
}

/* a frente: o lado em que há mais portas para fora (as que não dão para outro cômodo) */
function frenteDe(d) {
  const conta = { S: 0, N: 0, L: 0, O: 0 };
  d.aberturas.forEach((ab) => {
    if (norm(ab.tipo) !== 'porta') return;
    const c = d.comodos.find((x) => norm(x.nome) === norm(ab.comodo)); if (!c) return;
    const lado = String(ab.lado || 'S').toUpperCase(), n = NORMAL[lado]; if (!n) return;
    /* o ponto logo do lado de fora da porta: se cair noutro cômodo, é porta interna */
    const larg = ab.largura || 0.9;
    const meio = (lado === 'N' || lado === 'S') ? [c.x + (ab.posicao != null ? ab.posicao : (c.largura - larg) / 2) + larg / 2, lado === 'N' ? c.y : c.y + c.profundidade]
      : [lado === 'O' ? c.x : c.x + c.largura, c.y + (ab.posicao != null ? ab.posicao : (c.profundidade - larg) / 2) + larg / 2];
    const fora = comodoNoPonto(d.comodos.filter((x) => x !== c && (x.nivel || 0) <= 0.3), meio[0] + n[0] * 0.3, meio[1] + n[1] * 0.3);
    if (!fora) conta[lado] += 2;
  });
  const lado = Object.keys(conta).sort((a, b) => conta[b] - conta[a])[0];
  return conta[lado] ? lado : 'S';
}

/* a porta principal da frente, para começar o passeio "saindo de casa" */
function portaDaFrente(d, lado) {
  for (const ab of d.aberturas) {
    if (norm(ab.tipo) !== 'porta' || String(ab.lado || 'S').toUpperCase() !== lado) continue;
    const c = d.comodos.find((x) => norm(x.nome) === norm(ab.comodo)); if (!c) continue;
    const larg = ab.largura || 0.9;
    if (lado === 'N' || lado === 'S') return [c.x + (ab.posicao != null ? ab.posicao : (c.largura - larg) / 2) + larg / 2, lado === 'N' ? c.y : c.y + c.profundidade];
    return [lado === 'O' ? c.x : c.x + c.largura, c.y + (ab.posicao != null ? ab.posicao : (c.profundidade - larg) / 2) + larg / 2];
  }
  return null;
}

/** onde cada casa fica: [{ nome, dados, ox, oz, rot, cx, cz, raio, saida: {x, z, yaw} }]; as que não couberem vão em "fora" */
export function planejarLotes(todos) {
  if (!todos || !todos.casas || !todos.casas.length) return { lotes: [], fora: [] };
  const lotes = [], fora = [];
  const cursor = TRECHOS.map((t) => ({ [1]: t.de, [-1]: t.de, n: 0 }));
  todos.casas.forEach((casa, i) => {
    const d = daCasa(todos, casa.nome);
    if (!d.comodos.length) return;
    const lim = limites(d.comodos);
    const lado = frenteDe(d), nL = NORMAL[lado];
    let feito = false;
    for (let t = 0; t < TRECHOS.length && !feito; t++) {
      if (i > 0 && t === 0) continue;                 /* antes do riacho, só a primeira casa (a sua) */
      if (TRECHOS[t].max && cursor[t].n >= TRECHOS[t].max) continue;
      for (const s of (i % 2 ? [-1, 1] : [1, -1])) {
        /* a frente olha para a rua: o normal da frente vira -s·Q */
        const rot = angulo([-s * Q[0], -s * Q[1]]) - angulo(nL);
        const cantos = [[lim.x0, lim.y0], [lim.x1, lim.y0], [lim.x0, lim.y1], [lim.x1, lim.y1]].map(([x, z]) => girar(x, z, rot));
        const ao = (v, eixo) => v[0] * eixo[0] + v[1] * eixo[1];
        const a0 = Math.min(...cantos.map((v) => ao(v, D))), a1 = Math.max(...cantos.map((v) => ao(v, D)));
        const p0 = Math.min(...cantos.map((v) => ao(v, Q))), p1 = Math.max(...cantos.map((v) => ao(v, Q)));
        const inicio = cursor[t][s];
        if (inicio + (a1 - a0) > TRECHOS[t].ate) continue;
        const od = inicio - a0, op = s > 0 ? CALCADA - p0 : -CALCADA - p1;
        const ox = od * D[0] + op * Q[0], oz = od * D[1] + op * Q[1];
        const meio = girar((lim.x0 + lim.x1) / 2, (lim.y0 + lim.y1) / 2, rot);
        const raio = Math.hypot(lim.x1 - lim.x0, lim.y1 - lim.y0) / 2 + 1;
        const porta = portaDaFrente(d, lado);
        let saida = null;
        if (porta) {
          const pw = girar(porta[0] + nL[0] * 1.6, porta[1] + nL[1] * 1.6, rot);
          saida = { x: ox + pw[0], z: oz + pw[1], yaw: Math.atan2(-s * Q[0], s * Q[1]) };
        }
        lotes.push({ nome: casa.nome, estilo: casa.estilo || '', dados: d, ox, oz, rot, cx: ox + meio[0], cz: oz + meio[1], raio, saida, lado: s, minha: i === 0 });
        cursor[t][s] = inicio + (a1 - a0) + FOLGA;
        cursor[t].n++;
        feito = true;
        break;
      }
    }
    if (!feito) fora.push(casa.nome);
  });
  return { lotes, fora };
}

/* funde as peças paradas de um grupo, uma malha por material: a mesma imagem com muito menos chamadas de desenho
   (as cinco casas eram ~1.600 peças a mais por quadro; fundidas, poucas dezenas). O que tem mais de um material fica como está. */
function fundir(grupo) {
  grupo.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(grupo.matrixWorld).invert();
  const porMat = new Map(), sair = [];
  const balde = (mat, o) => {
    if (!porMat.has(mat.uuid)) porMat.set(mat.uuid, { mat, geos: [], sombra: false, ordem: o.renderOrder });
    const item = porMat.get(mat.uuid); item.sombra = item.sombra || o.castShadow; return item;
  };
  /* um pedaço [ini, ini + n) de uma geometria sem índice */
  const fatia = (geo, ini, n) => {
    const out = new THREE.BufferGeometry();
    ['position', 'normal', 'uv'].forEach((k) => { const a = geo.attributes[k]; out.setAttribute(k, new THREE.BufferAttribute(a.array.slice(ini * a.itemSize, (ini + n) * a.itemSize), a.itemSize)); });
    return out;
  };
  grupo.traverse((o) => {
    if (!o.isMesh || o === grupo) return;
    const g = o.geometry, at = g.attributes;
    if (!at.position || !at.normal || !at.uv || Object.keys(at).length !== 3) return;
    const geo = (g.index ? g.toNonIndexed() : g.clone());
    geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    if (Array.isArray(o.material)) {
      /* uma parede com um material por face: cada face vai para o balde do seu material */
      if (!geo.groups.length) { geo.dispose(); return; }
      geo.groups.forEach((gr) => { const mat = o.material[gr.materialIndex]; if (mat) balde(mat, o).geos.push(fatia(geo, gr.start, Math.min(gr.count, geo.attributes.position.count - gr.start))); });
      geo.dispose();
    } else balde(o.material, o).geos.push(geo);
    sair.push(o);
  });
  sair.forEach((o) => { if (o.parent) o.parent.remove(o); });
  porMat.forEach(({ mat, geos, sombra, ordem }) => {
    const n = geos.reduce((t, g) => t + g.attributes.position.count, 0);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    let k = 0;
    geos.forEach((g) => { pos.set(g.attributes.position.array, k * 3); nor.set(g.attributes.normal.array, k * 3); uv.set(g.attributes.uv.array, k * 2); k += g.attributes.position.count; g.dispose(); });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.computeBoundingSphere();
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = sombra; m.receiveShadow = true; m.renderOrder = ordem;
    grupo.add(m);
  });
}

/** monta as casas na cena do Jardim: as cascas já; os móveis quando você chega perto */
export function montarCasas({ cena, lotes, altura, placa }) {
  const construtor = criarConstrutor({ pbr: (o) => { const m = new THREE.MeshStandardMaterial(o); m.envMapIntensity = 0; return m; } });
  const barreiras = [];
  const casas = lotes.map((l) => {
    const { grupo } = construtor.construirCasa({ comodos: l.dados.comodos, aberturas: l.dados.aberturas, moveis: [] }, { teto: true });
    const y0 = altura(l.cx, l.cz) + 0.02;
    grupo.position.set(l.ox, y0, l.oz);
    grupo.rotation.y = l.rot;
    grupo.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    cena.add(grupo);
    /* as paredes que barram: as peças finas, de pé, no térreo (a mesma regra da vista Andar da Casa) */
    grupo.children.forEach((o) => {
      if (!o.isMesh || o.geometry.type !== 'BoxGeometry' || !o.geometry.parameters) return;
      const p = o.geometry.parameters;
      const base = o.position.y - p.height / 2, topo = o.position.y + p.height / 2;
      if (base > 1.2 || topo < 0.45) return;
      if (Math.min(p.width, p.depth) > 0.3 || Math.max(p.width, p.depth) < 0.04) return;
      const w = girar(o.position.x, o.position.z, l.rot), t = l.rot + o.rotation.y;
      /* folga: pouca nas pontas (senão o vão da porta fecha), mais na espessura (o olho não encosta na parede) */
      const longo = p.width >= p.depth;
      barreiras.push({ x: l.ox + w[0], z: l.oz + w[1], hx: p.width / 2 + (longo ? 0.05 : 0.24), hz: p.depth / 2 + (longo ? 0.24 : 0.05), c: Math.cos(t), s: Math.sin(t), lote: l });
    });
    fundir(grupo);
    /* a placa da casa, na calçada */
    if (placa) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: placa(l.nome, l.minha ? 'a sua casa · entre pela porta' : 'a casa dos sonhos · entre pela porta', l.minha ? '#E9822A' : '#c9a227'), transparent: true, depthWrite: false }));
      sp.scale.set(2.1, 0.7, 1);
      /* na beira da rua, na altura da porta (fora de beirais e varandas) */
      const px = l.saida ? l.saida.x : l.cx, pz = l.saida ? l.saida.z : l.cz;
      const aoLongo = px * D[0] + pz * D[1];
      const fx = aoLongo * D[0] + l.lado * Q[0] * 1.5, fz = aoLongo * D[1] + l.lado * Q[1] * 1.5;
      sp.position.set(fx, altura(fx, fz) + 2.3, fz);
      cena.add(sp);
    }
    return { lote: l, grupo, moveis: null, y0 };
  });

  /* os móveis: montados na primeira vez que você chega perto, depois só aparecem e somem */
  function moveisDe(c) {
    const g = new THREE.Group();
    c.lote.dados.moveis.forEach((m) => {
      const obj = construtor.construirMovel(m);
      const com = comodoNoPonto(c.lote.dados.comodos, m.x, m.y);
      obj.position.set(m.x, Math.max(m.nivel || 0, com ? com.nivel : 0), m.y);
      obj.rotation.y = -(m.giro || 0) * Math.PI / 180;
      obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      g.add(obj);
    });
    c.grupo.add(g);
    fundir(g);
    return g;
  }
  function atualizar(x, z) {
    for (const c of casas) {
      const d = Math.hypot(x - c.lote.cx, z - c.lote.cz) - c.lote.raio;
      if (d < PERTO_MOVEIS && !c.moveis) c.moveis = moveisDe(c);
      if (c.moveis) c.moveis.visible = d < LONGE_MOVEIS;
    }
  }
  /* as paredes barram (cada eixo separado, como na Casa: você escorrega pela parede em vez de grudar) */
  function bloqueia(x, z) {
    for (const b of barreiras) {
      if (Math.abs(x - b.x) > 8 || Math.abs(z - b.z) > 8) continue;
      const ax = x - b.x, az = z - b.z;
      if (Math.abs(ax * b.c - az * b.s) < b.hx && Math.abs(ax * b.s + az * b.c) < b.hz) return true;
    }
    return false;
  }
  /* em que casa (ou na frente de qual) você está */
  function onde(x, z) {
    let melhor = null, dm = Infinity;
    for (const c of casas) { const d = Math.hypot(x - c.lote.cx, z - c.lote.cz); if (d < c.lote.raio + 2.5 && d < dm) { dm = d; melhor = c.lote; } }
    return melhor;
  }
  return { casas, bloqueia, onde, atualizar };
}

/** a rua: a distância de um ponto até ela (para o terreno, a grama e as árvores) */
export function distRua(x, z) {
  const a = Math.atan2(x, -z), r = Math.hypot(x, z);
  let d = (a - ANGULO_RUA) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
  return r * Math.sin(Math.min(Math.abs(d), Math.PI / 2));
}
