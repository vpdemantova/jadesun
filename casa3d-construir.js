import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/geometries/RoundedBoxGeometry.js';
import { criarPlanta, texturaMadeira, texturaAssoalho, texturaGesso, texturaTecido, textoEmCanvas, hash } from './cena3d.js';
import { paredesRetas, aberturasNaLinha, trechosSolidos, comodoNoPonto, corHex, tipoMovel, ESP_PAREDE, ehCilindro, ehPatio, norm } from './casa-modelo.js';

/* Constrói a casa em 3D a partir dos dados (cômodos, portas/janelas, móveis). Separado da
   página (casa3d.js) pra ficar legível: aqui só geometria e material, nada de interface. */

export function criarConstrutor(palco) {
  const { pbr } = palco;

  /* ---------- texturas de piso e parede (geradas na hora) ---------- */
  const cacheTex = new Map();
  const umaVez = (chave, f) => { if (!cacheTex.has(chave)) cacheTex.set(chave, f()); return cacheTex.get(chave); };
  const repetivel = (t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };

  const TEX = {
    ladrilho: () => umaVez('ladrilho', () => repetivel(textoEmCanvas(256, 256, (g, w, h) => {
      // ladrilho hidráulico: 4 peças de 20 cm com um motivo de quatro pétalas
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const x = i * 128, y = j * 128;
        g.fillStyle = '#e9dfcc'; g.fillRect(x, y, 128, 128);
        g.fillStyle = '#b5623f';
        g.beginPath(); g.arc(x, y, 44, 0, Math.PI / 2); g.lineTo(x, y); g.fill();
        g.beginPath(); g.arc(x + 128, y, 44, Math.PI / 2, Math.PI); g.lineTo(x + 128, y); g.fill();
        g.beginPath(); g.arc(x, y + 128, 44, -Math.PI / 2, 0); g.lineTo(x, y + 128); g.fill();
        g.beginPath(); g.arc(x + 128, y + 128, 44, Math.PI, Math.PI * 1.5); g.lineTo(x + 128, y + 128); g.fill();
        g.fillStyle = '#2f5a6e'; g.beginPath(); g.moveTo(x + 64, y + 30); g.lineTo(x + 98, y + 64); g.lineTo(x + 64, y + 98); g.lineTo(x + 30, y + 64); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, 126, 126);
      }
    }))),
    pastilha: () => umaVez('pastilha', () => repetivel(textoEmCanvas(256, 256, (g) => {
      g.fillStyle = '#e8eef2'; g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) {
        const v = ((i * 7 + j * 13) % 9) / 9;
        g.fillStyle = `hsl(${205 + v * 10}, ${55 + v * 15}%, ${38 + v * 14}%)`;
        g.fillRect(i * 16 + 1, j * 16 + 1, 14, 14);
      }
    }))),
    tatami: () => umaVez('tatami', () => repetivel(textoEmCanvas(256, 512, (g, w, h) => {
      g.fillStyle = '#cfc58f'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(90,80,30,${0.06 + ((y * 7) % 5) / 60})`; g.fillRect(0, y, w, 1); }
      g.fillStyle = '#2b2d2a'; g.fillRect(0, 0, 14, h); g.fillRect(w - 14, 0, 14, h);
    }))),
    pedra: () => umaVez('pedra', () => repetivel(textoEmCanvas(256, 256, (g) => {
      // cascalho miúdo cinza (jardim seco, entrada), com umas pedras maiores
      g.fillStyle = '#a19d94'; g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 2400; i++) {
        const x = (i * 97 + (i >> 3) * 13) % 256, y = (i * 53 + (i >> 5) * 29) % 256, v = 120 + ((i * 37) % 70);
        g.fillStyle = `rgba(${v},${v - 3},${v - 9},.8)`;
        g.fillRect(x, y, 2 + (i % 3), 2 + ((i >> 1) % 2));
      }
      for (let i = 0; i < 7; i++) {
        const x = (i * 71 + 30) % 256, y = (i * 113 + 50) % 256;
        g.fillStyle = `rgb(${96 + i * 6},${94 + i * 6},${90 + i * 5})`;
        g.beginPath(); g.ellipse(x, y, 9 + (i % 3) * 4, 7 + (i % 2) * 4, i, 0, Math.PI * 2); g.fill();
      }
    }))),
    grama: () => umaVez('grama', () => repetivel(textoEmCanvas(256, 256, (g) => {
      g.fillStyle = '#5c7d3c'; g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 2600; i++) {
        const x = (i * 73) % 256, y = (i * 151) % 256;
        g.fillStyle = `rgba(${40 + (i % 50)},${90 + (i % 60)},${30 + (i % 20)},.5)`;
        g.fillRect(x, y, 1, 3);
      }
    }))),
    tijolo: () => umaVez('tijolo', () => repetivel(textoEmCanvas(256, 256, (g) => {
      g.fillStyle = '#d7cfc3'; g.fillRect(0, 0, 256, 256);
      for (let r = 0; r < 8; r++) for (let c = -1; c < 5; c++) {
        const x = c * 64 + (r % 2 ? 32 : 0), y = r * 32;
        g.fillStyle = `rgb(${150 + ((r * 5 + c * 3) % 7) * 6},${76 + ((r + c) % 5) * 4},${52 + ((r * 3 + c) % 4) * 4})`;
        g.fillRect(x + 2, y + 2, 60, 28);
      }
    }))),
    shoji: () => umaVez('shoji', () => repetivel(textoEmCanvas(256, 256, (g) => {
      g.fillStyle = '#f5f0e2'; g.fillRect(0, 0, 256, 256);
      g.fillStyle = '#6b4a32';
      for (let x = 0; x <= 256; x += 64) g.fillRect(x - 3, 0, 6, 256);
      for (let y = 0; y <= 256; y += 42) g.fillRect(0, y - 3, 256, 6);
    }))),
  };

  /* materiais de piso por tipo e tamanho do cômodo (a textura repete em metros reais) */
  const cacheMat = new Map();
  function matPiso(tipo, larg, prof) {
    const n = norm(tipo) || 'madeira clara';
    const chave = n + '|' + Math.round(larg * 2) + 'x' + Math.round(prof * 2);
    if (cacheMat.has(chave)) return cacheMat.get(chave);
    let m;
    const rep = (texs, metros) => {
      const o = {};
      Object.entries(texs).forEach(([k, t]) => { if (!t || !t.isTexture) return; const c = t.clone(); c.repeat.set(Math.max(0.3, larg / metros), Math.max(0.3, prof / metros)); c.needsUpdate = true; o[k] = c; });
      return o;
    };
    if (n.includes('escura')) m = pbr({ ...rep(texturaAssoalho(), 40 / 12), color: 0x7a5a42, roughness: 0.85, bumpScale: 0.6 });
    else if (n.includes('cimento')) m = pbr({ ...rep(texturaGesso(), 2.5), color: 0xb9b6ae, roughness: 0.7, bumpScale: 0.3 });
    else if (n.includes('ladrilho')) m = pbr({ ...rep({ map: TEX.ladrilho() }, 0.4), roughness: 0.55 });
    else if (n.includes('pastilha')) m = pbr({ ...rep({ map: TEX.pastilha() }, 0.4), roughness: 0.35 });
    else if (n.includes('tatami')) m = pbr({ ...rep({ map: TEX.tatami() }, 0.9), roughness: 0.95 });
    else if (n.includes('pedra')) m = pbr({ ...rep({ map: TEX.pedra() }, 1.2), roughness: 0.9 });
    else if (n.includes('grama')) m = pbr({ ...rep({ map: TEX.grama() }, 1.5), roughness: 1 });
    else m = pbr({ ...rep(texturaAssoalho(), 40 / 12), color: 0xffffff, roughness: 1, bumpScale: 0.6 });
    cacheMat.set(chave, m);
    return m;
  }

  const MAT = {
    vidro: pbr({ color: 0xcfe3e8, metalness: 0.1, roughness: 0.04, transparent: true, opacity: 0.22, depthWrite: false, envMapIntensity: 1.6 }),
    caixilhoEscuro: pbr({ color: 0x2a2b2d, metalness: 0.7, roughness: 0.4 }),
    caixilhoClaro: pbr({ color: 0xf1eee7, roughness: 0.5 }),
    portaMadeira: pbr({ ...texturaMadeira('freijo', true), color: 0xffffff, roughness: 0.8 }),
    laje: pbr({ ...texturaGesso(), color: 0xe8e4dc, roughness: 0.9 }),
    concreto: pbr({ color: 0xbdb9b1, roughness: 0.85 }),
    pilar: pbr({ color: 0xf0ede6, roughness: 0.6 }),
    shoji: pbr({ map: TEX.shoji(), roughness: 0.9, transparent: true, opacity: 0.92, emissive: 0x2a2620 }),
    tijolo: pbr({ map: TEX.tijolo(), roughness: 0.95 }),
    madeiraParede: pbr({ ...texturaMadeira('freijo', true), color: 0xffffff, roughness: 0.85 }),
    hexVidro: pbr({ color: 0x3a4a55, metalness: 0.2, roughness: 0.1, envMapIntensity: 1.4 }),
    cromo: pbr({ color: 0xe8e8e8, metalness: 1, roughness: 0.18 }),
    tecidoBranco: pbr({ ...texturaTecido('plano'), color: 0xf4f1ea, roughness: 1 }),
    teclaBranca: pbr({ color: 0xf6f4ee, roughness: 0.4 }),
    teclaPreta: pbr({ color: 0x151515, roughness: 0.4 }),
    luz: new THREE.MeshBasicMaterial({ color: 0xfff1d6 }),
    folha: pbr({ color: 0x4f7a45, roughness: 0.7 }),
    tronco: pbr({ color: 0x5b4330, roughness: 0.95 }),
    porcelana: pbr({ color: 0xf7f7f5, roughness: 0.25 }),
    metal: pbr({ color: 0x9a9da2, metalness: 0.8, roughness: 0.35 }),
  };
  const cacheCor = new Map();
  function matParede(parede) {
    const n = norm(parede);
    if (n === 'vidro') return MAT.vidro;
    if (n === 'shoji') return MAT.shoji;
    if (n === 'tijolo') return MAT.tijolo;
    if (n === 'madeira') return MAT.madeiraParede;
    const hex = corHex(parede, '#f2efe8');
    if (!cacheCor.has('p' + hex)) cacheCor.set('p' + hex, pbr({ ...texturaGesso(), color: hex, roughness: 1, bumpScale: 0.35 }));
    return cacheCor.get('p' + hex);
  }
  function matCor(cor, padrao, rough = 0.6) {
    const hex = corHex(cor, corHex(padrao));
    const k = 'c' + hex + rough;
    if (!cacheCor.has(k)) cacheCor.set(k, pbr({ color: hex, roughness: rough }));
    return cacheCor.get(k);
  }
  function matTecido(cor, padrao) {
    const hex = corHex(cor, corHex(padrao));
    const k = 't' + hex;
    if (!cacheCor.has(k)) cacheCor.set(k, pbr({ ...texturaTecido('plano'), color: hex, roughness: 1, bumpScale: 0.6 }));
    return cacheCor.get(k);
  }
  function matMadeira(cor) {
    const n = norm(cor);
    if (n.includes('escura') || n.includes('nogueira')) return umaVez('mNog', () => pbr({ ...texturaMadeira('nogueira'), color: 0xffffff, roughness: 0.7 }));
    if (n.includes('freijo')) return umaVez('mFrei', () => pbr({ ...texturaMadeira('freijo'), color: 0xffffff, roughness: 0.7 }));
    if (n.includes('madeira')) return umaVez('mCarv', () => pbr({ ...texturaMadeira('carvalho'), color: 0xffffff, roughness: 0.75 }));
    return matCor(cor, 'madeira clara', 0.5);
  }

  const caixa = (w, h, d, mat, r = 0.004) => { const m = new THREE.Mesh(r ? new RoundedBoxGeometry(w, h, d, 1, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4)) : new THREE.BoxGeometry(w, h, d), mat); m.castShadow = true; m.receiveShadow = true; return m; };
  const cilindro = (rt, rb, h, mat, seg = 20) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.castShadow = true; m.receiveShadow = true; return m; };
  const em = (obj, x, y, z) => { obj.position.set(x, y, z); return obj; };

  /* ---------- móveis: cada um construído na origem, frente virada pra +z (S) ---------- */
  function construirMovel(m) {
    const t = tipoMovel(m.tipo);
    const g = new THREE.Group();
    const W = t.larg, D = t.prof, Hh = t.alt;
    const cor = m.cor || t.cor;
    const madeira = matMadeira(norm(cor).includes('madeira') || norm(cor).includes('freijo') ? cor : t.cor);
    const pintado = matCor(cor, t.cor, 0.55);
    const pernas = (w, d, h, esp, mat) => [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => g.add(em(caixa(esp, h, esp, mat, 0.003), sx * (w / 2 - esp), h / 2, sz * (d / 2 - esp))));
    switch (t.tipo) {
      case 'cama': case 'cama de solteiro': {
        g.add(em(caixa(W, 0.28, D, madeira), 0, 0.14, 0));
        g.add(em(caixa(W - 0.04, 0.2, D - 0.06, MAT.tecidoBranco, 0.05), 0, 0.38, 0.02));
        g.add(em(caixa(W, 0.9, 0.06, madeira), 0, 0.45, -D / 2 + 0.03));
        const nT = t.tipo === 'cama' ? 2 : 1;
        for (let i = 0; i < nT; i++) g.add(em(caixa(nT === 2 ? W / 2 - 0.12 : W - 0.2, 0.12, 0.38, MAT.tecidoBranco, 0.05), nT === 2 ? (i ? 1 : -1) * W / 4 : 0, 0.54, -D / 2 + 0.3));
        g.add(em(caixa(W + 0.02, 0.06, D * 0.55, matTecido(cor, 'terracota'), 0.03), 0, 0.5, D * 0.2));
        break;
      }
      case 'futon':
        g.add(em(caixa(W, 0.1, D, MAT.tecidoBranco, 0.04), 0, 0.05, 0));
        g.add(em(caixa(W * 0.9, 0.05, D * 0.55, matTecido(cor, 'papel de arroz'), 0.02), 0, 0.12, D * 0.18));
        g.add(em(caixa(0.5, 0.08, 0.3, MAT.tecidoBranco, 0.04), 0, 0.14, -D / 2 + 0.25));
        break;
      case 'criado-mudo': case 'cômoda': {
        const corpo = norm(cor).includes('madeira') || norm(cor).includes('freijo') ? madeira : pintado;
        g.add(em(caixa(W, Hh - 0.1, D, corpo), 0, 0.1 + (Hh - 0.1) / 2, 0));
        pernas(W, D, 0.1, 0.035, MAT.caixilhoEscuro);
        const gav = t.tipo === 'cômoda' ? 3 : 2;
        for (let i = 0; i < gav; i++) g.add(em(caixa(W * 0.3, 0.02, 0.015, MAT.metal, 0.005), 0, 0.1 + (Hh - 0.1) * (i + 0.5) / gav, D / 2 + 0.008));
        break;
      }
      case 'escrivaninha': case 'mesa': case 'mesa de centro': case 'mesa baixa':
        g.add(em(caixa(W, 0.035, D, madeira), 0, Hh - 0.0175, 0));
        pernas(W, D, Hh - 0.035, t.tipo === 'mesa baixa' ? 0.06 : 0.04, t.tipo === 'escrivaninha' ? MAT.caixilhoEscuro : madeira);
        break;
      case 'mesa redonda': {
        const tampo = cilindro(W / 2, W / 2, 0.035, madeira, 40); tampo.position.y = Hh - 0.0175; g.add(tampo);
        g.add(em(cilindro(0.04, 0.04, Hh - 0.035, MAT.caixilhoEscuro), 0, (Hh - 0.035) / 2, 0));
        g.add(em(cilindro(0.25, 0.28, 0.03, MAT.caixilhoEscuro, 30), 0, 0.015, 0));
        break;
      }
      case 'cadeira':
        g.add(em(caixa(W, 0.04, D, madeira), 0, 0.46, 0));
        pernas(W, D, 0.44, 0.03, madeira);
        g.add(em(caixa(W, 0.4, 0.03, madeira), 0, 0.46 + 0.22, -D / 2 + 0.015));
        break;
      case 'cadeira tubular': {
        // homenagem estilizada à poltrona de tubo de aço com tiras de couro (Breuer, Bauhaus, 1925)
        const tubo = (pts) => { const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.05); const m2 = new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.012, 8), MAT.cromo); m2.castShadow = true; return m2; };
        [-1, 1].forEach((s) => g.add(tubo([[s * W / 2, 0.02, D / 2], [s * W / 2, 0.02, -D / 2], [s * W / 2, 0.6, -D / 2], [s * W / 2, 0.6, D / 2 - 0.05], [s * W / 2, 0.02, D / 2]])));
        g.add(tubo([[-W / 2, 0.02, -D / 2], [W / 2, 0.02, -D / 2]]));
        const couro = matCor(cor, 'preto', 0.45);
        g.add(em(caixa(W - 0.04, 0.012, D * 0.7, couro, 0.004), 0, 0.38, 0.03));
        const enc = em(caixa(W - 0.04, 0.35, 0.012, couro, 0.004), 0, 0.55, -D / 2 + 0.05); enc.rotation.x = -0.25; g.add(enc);
        [-1, 1].forEach((s) => g.add(em(caixa(0.012, 0.08, D * 0.6, couro, 0.003), s * (W / 2 - 0.01), 0.58, 0.05)));
        break;
      }
      case 'estante de partitura': {
        g.add(em(cilindro(0.012, 0.012, 1.1, MAT.caixilhoEscuro), 0, 0.55, 0));
        [0, 2.1, 4.2].forEach((a) => { const p = em(caixa(0.3, 0.012, 0.012, MAT.caixilhoEscuro, 0), Math.cos(a) * 0.12, 0.05, Math.sin(a) * 0.12); p.rotation.y = -a; p.rotation.z = -0.35; g.add(p); });
        const prato = em(caixa(0.48, 0.34, 0.012, matCor(cor, 'preto', 0.5), 0.004), 0, 1.15, 0.02); prato.rotation.x = -0.35; g.add(prato);
        break;
      }
      case 'piano': {
        const laca = matCor(cor, 'preto', 0.18);
        g.add(em(caixa(W, Hh, D * 0.55, laca, 0.01), 0, Hh / 2, -D * 0.22));
        g.add(em(caixa(W, 0.06, D * 0.45, laca, 0.01), 0, 0.72, D * 0.2));
        g.add(em(caixa(W - 0.1, 0.02, 0.16, MAT.teclaBranca, 0.003), 0, 0.76, D * 0.2 + 0.02));
        for (let i = 0; i < 36; i++) if ([1, 3, 6, 8, 10].includes(i % 12)) g.add(em(caixa(0.012, 0.018, 0.09, MAT.teclaPreta, 0), -W / 2 + 0.07 + i * (W - 0.14) / 36, 0.785, D * 0.2 - 0.01));
        [-1, 1].forEach((s) => g.add(em(caixa(0.05, 0.72, 0.05, laca, 0.01), s * (W / 2 - 0.05), 0.36, D * 0.35)));
        break;
      }
      case 'piano de cauda': {
        const laca = matCor(cor, 'preto', 0.15);
        const s = new THREE.Shape();
        s.moveTo(-W / 2, D / 2); s.lineTo(W / 2, D / 2); s.lineTo(W / 2, D / 2 - 0.4);
        s.bezierCurveTo(W / 2, -D * 0.1, W * 0.1, -D / 2, -W * 0.2, -D / 2); s.bezierCurveTo(-W * 0.45, -D / 2, -W / 2, -D * 0.2, -W / 2, D / 2);
        const corpo = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 }), laca);
        corpo.rotation.x = Math.PI / 2; corpo.position.y = 0.95; corpo.castShadow = true; g.add(corpo);
        const tampa = new THREE.Mesh(new THREE.ShapeGeometry(s), laca); tampa.rotation.x = Math.PI / 2 - 0.55; tampa.position.set(0, 0.97, D / 2 - 0.05); tampa.material = laca; tampa.castShadow = true;
        tampa.geometry.translate(0, -D / 2 + 0.05, 0); g.add(tampa);
        g.add(em(caixa(W - 0.1, 0.03, 0.16, MAT.teclaBranca, 0.003), 0, 0.7, D / 2 + 0.05));
        [[-W / 2 + 0.1, D / 2 - 0.1], [W / 2 - 0.1, D / 2 - 0.1], [-W * 0.15, -D / 2 + 0.25]].forEach(([x, z]) => g.add(em(cilindro(0.05, 0.04, 0.65, laca), x, 0.33, z)));
        break;
      }
      case 'sofá': case 'poltrona': {
        const tec = matTecido(cor, t.cor);
        const bracos = t.tipo === 'sofá' ? 0.18 : 0.15;
        g.add(em(caixa(W, 0.25, D, tec, 0.05), 0, 0.22, 0));
        g.add(em(caixa(W - 2 * bracos, 0.14, D - 0.2, tec, 0.06), 0, 0.41, 0.08));
        g.add(em(caixa(W, 0.5, 0.2, tec, 0.07), 0, 0.5, -D / 2 + 0.1));
        [-1, 1].forEach((s2) => g.add(em(caixa(bracos, 0.36, D, tec, 0.06), s2 * (W / 2 - bracos / 2), 0.43, 0)));
        pernas(W, D, 0.1, 0.04, MAT.caixilhoEscuro);
        break;
      }
      case 'tapete': g.add(em(caixa(W, 0.012, D, matTecido(cor, 'terracota'), 0.004), 0, 0.006, 0)); break;
      case 'luminária': {
        g.add(em(cilindro(0.16, 0.18, 0.03, MAT.caixilhoEscuro, 28), 0, 0.015, 0));
        g.add(em(cilindro(0.012, 0.012, 1.4, MAT.caixilhoEscuro), 0, 0.72, 0));
        const cup = cilindro(0.1, 0.2, 0.25, matTecido('off-white', 'off-white'), 28); cup.position.y = 1.45; cup.material.side = THREE.DoubleSide; g.add(cup);
        const l = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), MAT.luz); l.position.y = 1.4; g.add(l);
        break;
      }
      case 'planta': { const p = criarPlanta(pbr, 2.4); g.add(p); break; }
      case 'árvore': {
        g.add(em(cilindro(0.12, 0.18, 2.4, MAT.tronco, 12), 0, 1.2, 0));
        for (let i = 0; i < 7; i++) {
          const a = hash('arv' + i) % 628 / 100;
          const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6 + (i % 3) * 0.18, 1), MAT.folha);
          c.position.set(Math.cos(a) * 0.55, 2.6 + (i % 3) * 0.45, Math.sin(a) * 0.55); c.castShadow = true; g.add(c);
        }
        break;
      }
      case 'estante': {
        const mad = madeira;
        g.add(em(caixa(W, Hh, 0.02, mad, 0), 0, Hh / 2, -D / 2 + 0.01));
        [-1, 1].forEach((s2) => g.add(em(caixa(0.025, Hh, D, mad, 0.003), s2 * (W / 2 - 0.0125), Hh / 2, 0)));
        const nPrat = 5;
        for (let i = 0; i <= nPrat; i++) {
          const y = 0.04 + i * (Hh - 0.08) / nPrat;
          g.add(em(caixa(W - 0.05, 0.025, D - 0.02, mad, 0.003), 0, y, 0.01));
          if (i === nPrat) break;
          let x = -W / 2 + 0.05;
          let k = 0;
          while (x < W / 2 - 0.08) {
            const hh = hash('liv' + i + '-' + k);
            const lw = 0.025 + (hh % 20) / 700, lh = 0.2 + (hh % 7) / 100;
            if ((hh % 11) === 0) { x += 0.12; k++; continue; }
            const cores = ['#8a3a31', '#2d4768', '#34594a', '#b3863a', '#4c4262', '#8e5a4c', '#4b6a76', '#efe6d2'];
            g.add(em(caixa(lw, lh, D - 0.08, matCor(cores[hh % cores.length], 'preto', 0.6), 0.002), x + lw / 2, y + 0.0125 + lh / 2, 0.02));
            x += lw + 0.003; k++;
          }
        }
        break;
      }
      case 'guarda-roupa': {
        const corpo = norm(cor).includes('madeira') || norm(cor).includes('freijo') ? madeira : pintado;
        g.add(em(caixa(W, Hh, D, corpo, 0.006), 0, Hh / 2, 0));
        const nP = Math.max(2, Math.round(W / 0.6));
        for (let i = 1; i < nP; i++) g.add(em(caixa(0.004, Hh - 0.1, 0.004, MAT.caixilhoEscuro, 0), -W / 2 + i * W / nP, Hh / 2, D / 2 + 0.002));
        for (let i = 0; i < nP; i++) g.add(em(caixa(0.012, 0.28, 0.02, pbr({ color: 0xc9a45c, metalness: 1, roughness: 0.3 }), 0.004), -W / 2 + (i + 0.5) * W / nP + (i % 2 ? -1 : 1) * (W / nP / 2 - 0.05), Hh * 0.52, D / 2 + 0.012));
        break;
      }
      case 'bancada': {
        g.add(em(caixa(W, 0.86, D, pintado, 0.004), 0, 0.43, 0));
        g.add(em(caixa(W + 0.02, 0.04, D + 0.02, MAT.concreto, 0.004), 0, 0.88, 0));
        g.add(em(caixa(0.5, 0.02, 0.36, MAT.metal, 0.01), W * 0.2, 0.9, 0));
        g.add(em(cilindro(0.012, 0.012, 0.3, MAT.cromo), W * 0.2, 1.05, -D / 2 + 0.08));
        for (let i = 1; i < Math.round(W / 0.5); i++) g.add(em(caixa(0.003, 0.7, 0.003, MAT.caixilhoEscuro, 0), -W / 2 + i * 0.5, 0.45, D / 2 + 0.002));
        break;
      }
      case 'fogão':
        g.add(em(caixa(W, 0.88, D, matCor(cor, 'cinza', 0.35), 0.006), 0, 0.44, 0));
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => g.add(em(cilindro(0.08, 0.08, 0.02, MAT.teclaPreta, 20), sx * W / 4, 0.89, sz * D / 4)));
        break;
      case 'geladeira':
        g.add(em(caixa(W, Hh, D, matCor(cor, 'branco', 0.3), 0.02), 0, Hh / 2, 0));
        g.add(em(caixa(0.02, 0.5, 0.03, MAT.metal, 0.008), W / 2 - 0.08, Hh * 0.65, D / 2 + 0.02));
        g.add(em(caixa(W - 0.02, 0.006, 0.006, MAT.caixilhoEscuro, 0), 0, Hh * 0.38, D / 2 + 0.003));
        break;
      case 'vaso': {
        const b = cilindro(0.17, 0.12, 0.38, MAT.porcelana, 24); b.position.set(0, 0.19, 0.08); g.add(b);
        g.add(em(caixa(0.36, 0.34, 0.16, MAT.porcelana, 0.02), 0, 0.55, -D / 2 + 0.08));
        break;
      }
      case 'pia':
        g.add(em(cilindro(0.08, 0.1, 0.78, MAT.porcelana), 0, 0.39, -0.05));
        g.add(em(caixa(W, 0.1, D, MAT.porcelana, 0.04), 0, 0.82, 0));
        g.add(em(cilindro(0.01, 0.01, 0.18, MAT.cromo), 0, 0.95, -D / 2 + 0.06));
        break;
      case 'chuveiro':
        g.add(em(caixa(W, 0.05, D, MAT.concreto, 0.01), 0, 0.025, 0));
        [[W / 2, 0, 0.008, D], [0, D / 2, W, 0.008]].forEach(([x, z, w2, d2]) => g.add(em(caixa(w2, Hh, d2, MAT.vidro, 0), x, Hh / 2, z)));
        g.add(em(cilindro(0.1, 0.1, 0.02, MAT.cromo, 20), -W / 2 + 0.25, Hh - 0.1, -D / 2 + 0.25));
        break;
      default:
        g.add(em(caixa(W, Hh, D, pintado, 0.01), 0, Hh / 2, 0));
    }
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    g.userData.tipo = t;
    return g;
  }

  /* ---------- a casa inteira ---------- */
  function construirCasa(dados, opcoes = {}) {
    const grupo = new THREE.Group();
    const { comodos, aberturas, moveis } = dados;
    const alvos = { comodos: [], moveis: [], aberturas: [] };
    const cortar = opcoes.paredesCortadas ? 1.1 : null;
    const comTeto = !!opcoes.teto;

    // pisos
    comodos.forEach((c, idx) => {
      const cil = ehCilindro(c);
      const espLaje = c.nivel > 0.3 ? 0.22 : 0.06;
      const mat = matPiso(c.piso || (ehPatio(c) ? 'grama' : 'madeira clara'), c.largura, c.profundidade);
      let piso;
      if (cil) {
        piso = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, espLaje, 48), [mat, mat, mat]);
        piso.scale.set(c.largura, 1, c.profundidade);
      } else piso = new THREE.Mesh(new THREE.BoxGeometry(c.largura, espLaje, c.profundidade), mat);
      piso.position.set(c.x + c.largura / 2, c.nivel - espLaje / 2 + 0.001 * (idx % 5), c.y + c.profundidade / 2);
      piso.receiveShadow = true; piso.castShadow = c.nivel > 0.3;
      piso.userData.comodo = idx;
      grupo.add(piso);
      alvos.comodos.push(piso);
      // pilotis sob cômodos elevados
      if (c.nivel > 0.3) {
        const passo = 3.2;
        const nx = Math.max(1, Math.round(c.largura / passo)), nz = Math.max(1, Math.round(c.profundidade / passo));
        for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) {
          const x = c.x + 0.25 + i * (c.largura - 0.5) / nx, z = c.y + 0.25 + j * (c.profundidade - 0.5) / nz;
          if (cil && (((x - c.x - c.largura / 2) / (c.largura / 2)) ** 2 + ((z - c.y - c.profundidade / 2) / (c.profundidade / 2)) ** 2 > 0.8)) continue;
          const p = cilindro(0.09, 0.09, c.nivel - espLaje, MAT.pilar, 16);
          p.position.set(x, (c.nivel - espLaje) / 2, z); grupo.add(p);
        }
      }
      // teto (vista de fachada)
      if (comTeto && !ehPatio(c)) {
        const laje = cil ? new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.22, 48), MAT.laje) : new THREE.Mesh(new RoundedBoxGeometry(c.largura + 0.3, 0.22, c.profundidade + 0.3, 1, 0.02), MAT.laje);
        if (cil) laje.scale.set(c.largura + 0.2, 1, c.profundidade + 0.2);
        laje.position.set(c.x + c.largura / 2, c.nivel + c.pe + 0.11, c.y + c.profundidade / 2);
        laje.castShadow = true; laje.receiveShadow = true; grupo.add(laje);
      }
    });

    // paredes retas com vãos
    const paredes = paredesRetas(comodos);
    const abs = aberturasNaLinha(comodos, aberturas);
    paredes.forEach((p) => {
      const donos = p.donos.map((d) => ({ ...d, c: comodos[d.dono] }));
      const nivel = Math.min(...donos.map((d) => d.c.nivel));
      const altura = cortar ? Math.min(cortar, Math.max(...donos.map((d) => d.c.pe))) : Math.max(...donos.map((d) => d.c.pe)) + (Math.max(...donos.map((d) => d.c.nivel)) - nivel);
      // material de cada face: o cômodo que a face enxerga
      const lado = (sentido) => { const d = donos.find((x) => x.lado === sentido); return d ? d.c : donos[0].c; };
      const [cPos, cNeg] = p.eixo === 'h' ? [lado('N'), lado('S')] : [lado('O'), lado('L')];
      const vidro = donos.every((d) => norm(d.c.parede) === 'vidro');
      let mPos = matParede(cPos.parede), mNeg = matParede(cNeg.parede);
      // divisa entre cômodos de alturas diferentes: o pedaço de cima é fachada do mais alto,
      // então a parede toda leva a cor dele (senão a cor de dentro do baixo apareceria por fora)
      if (!cortar && p.interna && cPos !== cNeg) {
        const tPos = cPos.nivel + cPos.pe, tNeg = cNeg.nivel + cNeg.pe;
        if (Math.abs(tPos - tNeg) > 0.05) { const alto = tPos > tNeg ? mPos : mNeg; if (alto !== MAT.vidro) mPos = mNeg = alto; }
      }
      // divisa entre um cômodo de vidro e um de alvenaria: a parede é de alvenaria dos dois lados
      if (!vidro && mPos === MAT.vidro) mPos = mNeg;
      if (!vidro && mNeg === MAT.vidro) mNeg = mPos;
      // vãos medidos a partir do piso do próprio cômodo (a parede começa no nível mais baixo)
      const absP = abs.map((a) => (a.nivel !== nivel ? { ...a, base: a.base + a.nivel - nivel, topo: a.topo + a.nivel - nivel } : a))
        .map((a) => (cortar && a.eixo === p.eixo && a.topo > altura ? { ...a, topo: Math.max(a.base, altura) } : a))
        .filter((a) => !(cortar && a.eixo === p.eixo && a.topo - a.base < 0.05));
      const { trechos, vaos } = trechosSolidos(p, absP, altura);
      // normal pra fora (paredes externas): a Maquete abaixa sozinha as que estão de frente pra câmera
      const ladoExt = donos[0].lado;
      const normal = p.interna ? null : ({ N: [0, -1], S: [0, 1], O: [-1, 0], L: [1, 0] })[ladoExt];
      const marcar = (obj, base, h) => { obj.userData.parede = { n: normal, interna: p.interna, nivel, base, h, y: obj.position.y }; };
      trechos.forEach((tr) => {
        const comp = tr.fim - tr.ini, h = tr.topo - tr.base;
        if (comp < 0.01 || h < 0.01) return;
        const topo = MAT.caixilhoClaro;
        let m;
        if (p.eixo === 'h') { m = new THREE.Mesh(new THREE.BoxGeometry(comp + ESP_PAREDE * 0.999, h, ESP_PAREDE), [mPos, mPos, topo, topo, mPos, mNeg]); m.position.set((tr.ini + tr.fim) / 2, nivel + tr.base + h / 2, p.pos); }
        else { m = new THREE.Mesh(new THREE.BoxGeometry(ESP_PAREDE, h, comp + ESP_PAREDE * 0.999), [mPos, mNeg, topo, topo, mPos, mPos]); m.position.set(p.pos, nivel + tr.base + h / 2, (tr.ini + tr.fim) / 2); }
        m.castShadow = !vidro; m.receiveShadow = true;
        if (vidro) m.renderOrder = 2;
        marcar(m, tr.base, h);
        grupo.add(m);
        // caixilhos verticais no vidro, a cada ~1,5 m
        if (vidro && tr.base < 0.01) {
          const n = Math.max(1, Math.round(comp / 1.5));
          for (let i = 0; i <= n; i++) {
            const pos = tr.ini + i * comp / n;
            const mont = caixa(0.05, h, 0.06, MAT.caixilhoEscuro, 0);
            if (p.eixo === 'h') mont.position.set(pos, nivel + h / 2, p.pos); else mont.position.set(p.pos, nivel + h / 2, pos);
            marcar(mont, 0, h);
            grupo.add(mont);
          }
        }
      });
      // portas e janelas deste trecho de parede
      vaos.forEach((v) => {
        const comp = v.fim - v.ini, h = v.topo - v.base, meio = (v.ini + v.fim) / 2;
        const g = new THREE.Group();
        if (v.porta) {
          const folha = caixa(comp - 0.04, h - 0.03, 0.04, MAT.portaMadeira, 0.004);
          folha.position.set(-comp / 2 + 0.02, v.base + h / 2, 0); folha.geometry.translate(comp / 2 - 0.02, 0, 0);
          // a folha abre pra dentro do cômodo dono da porta
          const lado = String(v.ref && v.ref.lado || 'S').toUpperCase();
          folha.rotation.y = lado === 'S' || lado === 'L' ? 0.9 : -0.9; g.add(folha);
          g.add(em(caixa(comp + 0.08, 0.06, ESP_PAREDE + 0.02, MAT.caixilhoClaro, 0.004), 0, v.base + h + 0.03, 0));
        } else {
          const vid = new THREE.Mesh(new THREE.BoxGeometry(comp - 0.06, h - 0.06, 0.012), MAT.vidro); vid.position.y = v.base + h / 2; vid.renderOrder = 2; g.add(vid);
          const moldura = norm(cPos.parede) === 'vidro' ? MAT.caixilhoEscuro : MAT.caixilhoClaro;
          [[0, v.base + 0.03, comp, 0.06], [0, v.topo - 0.03, comp, 0.06]].forEach(([x, y, w2, h2]) => g.add(em(caixa(w2, h2, ESP_PAREDE + 0.02, moldura, 0.004), x, y, 0)));
          [-1, 1].forEach((s) => g.add(em(caixa(0.05, h, ESP_PAREDE + 0.02, moldura, 0.004), s * (comp / 2 - 0.025), v.base + h / 2, 0)));
          g.add(em(caixa(0.03, h - 0.06, 0.04, moldura, 0), 0, v.base + h / 2, 0));
        }
        if (p.eixo === 'h') g.position.set(meio, nivel, p.pos);
        else { g.position.set(p.pos, nivel, meio); g.rotation.y = Math.PI / 2; }
        g.traverse((o) => { if (o.isMesh) o.userData.abertura = v.ref; });
        g.children.forEach((o) => alvos.aberturas.push(o));
        g.userData.parede = { n: normal, interna: p.interna, nivel, base: v.base, h: v.topo - v.base, vao: true };
        grupo.add(g);
      });
    });

    // paredes curvas (cilindros), com janelas hexagonais quando a forma pede
    comodos.forEach((c, idx) => {
      if (!ehCilindro(c)) return;
      const rx = c.largura / 2, rz = c.profundidade / 2, cx = c.x + rx, cz = c.y + rz;
      const alt = cortar ? Math.min(cortar, c.pe) : c.pe;
      const n = 56;
      const mat = matParede(c.parede);
      const outros = comodos.filter((o, j) => j !== idx && ehCilindro(o));
      // dois cilindros que se cruzam: o trecho de um dentro do outro some; se este for mais alto,
      // ele continua só acima do teto do outro (senão ficaria um buraco na torre mais alta)
      const topoDe = (o) => o.nivel + (cortar ? Math.min(cortar, o.pe) : o.pe);
      const baseNoPonto = (x, z) => {
        let b = 0;
        for (const o of outros) {
          if (((x - o.x - o.largura / 2) / (o.largura / 2)) ** 2 + ((z - o.y - o.profundidade / 2) / (o.profundidade / 2)) ** 2 >= 0.97) continue;
          if (topoDe(o) >= c.nivel + alt - 0.01) return null;
          b = Math.max(b, topoDe(o) - c.nivel);
        }
        return b;
      };
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2, am = (a0 + a1) / 2;
        const x = cx + Math.cos(am) * rx, z = cz + Math.sin(am) * rz;
        const b0 = baseNoPonto(x, z);
        if (b0 == null) continue;
        const comp = Math.hypot(Math.cos(a1) * rx - Math.cos(a0) * rx, Math.sin(a1) * rz - Math.sin(a0) * rz) + 0.02;
        const seg = new THREE.Mesh(new THREE.BoxGeometry(comp, alt - b0, ESP_PAREDE), mat);
        seg.position.set(x, c.nivel + b0 + (alt - b0) / 2, z);
        seg.rotation.y = -Math.atan2(Math.sin(am) * rz, Math.cos(am) * rx) + Math.PI / 2;
        seg.castShadow = true; seg.receiveShadow = true;
        const nx = Math.cos(am) / rx, nz = Math.sin(am) / rz, nl = Math.hypot(nx, nz) || 1;
        seg.userData.parede = { n: [nx / nl, nz / nl], interna: false, nivel: c.nivel, base: b0, h: alt - b0, y: seg.position.y };
        grupo.add(seg);
        if (norm(c.forma).includes('hex') && !cortar) {
          for (let lin = 0; lin < Math.floor((c.pe - 0.6) / 1.15); lin++) {
            if ((i + lin) % 3 || 0.9 + lin * 1.15 - 0.35 < b0) continue;
            const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, ESP_PAREDE + 0.04, 6), MAT.hexVidro);
            hex.rotation.z = Math.PI / 2;
            const quadro = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.03, 6, 6), MAT.caixilhoClaro);
            const hg = new THREE.Group(); hg.add(hex, quadro);
            quadro.rotation.y = Math.PI / 2; quadro.rotation.x = Math.PI / 6;
            hex.rotation.y = 0; hex.rotation.x = Math.PI / 6;
            hg.position.set(x, c.nivel + 0.9 + lin * 1.15, z);
            hg.rotation.y = seg.rotation.y + Math.PI / 2;
            hg.userData.parede = { n: seg.userData.parede.n, interna: false, nivel: c.nivel, base: 0.9 + lin * 1.15 - 0.33, h: 0.66, vao: true };
            grupo.add(hg);
          }
        }
      }
    });

    // móveis
    moveis.forEach((m, idx) => {
      const obj = construirMovel(m);
      const c = comodoNoPonto(comodos, m.x, m.y);
      const y = Math.max(m.nivel || 0, c ? c.nivel : 0);
      obj.position.set(m.x, y, m.y);
      obj.rotation.y = -(m.giro || 0) * Math.PI / 180;
      obj.userData.movel = idx;
      obj.traverse((o) => { if (o.isMesh) { o.userData.movel = idx; alvos.moveis.push(o); } });
      grupo.add(obj);
    });

    return { grupo, alvos };
  }

  return { construirCasa, construirMovel, matPiso, TEX };
}
