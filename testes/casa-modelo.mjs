import assert from 'node:assert/strict';
import { paredesRetas, aberturasNaLinha, trechosSolidos, comodoNoPonto, area, corHex, tipoMovel, ajustar, limites, CORES } from '../casa-modelo.js';

// dois cômodos lado a lado: a divisa vira UMA parede interna
const sala = { nome: 'Sala', forma: 'retângulo', x: 0, y: 0, largura: 4, profundidade: 3 };
const quarto = { nome: 'Quarto', forma: 'retângulo', x: 4, y: 0, largura: 3, profundidade: 3 };
const ps = paredesRetas([sala, quarto]);
const internas = ps.filter((p) => p.interna);
assert.equal(internas.length, 1);
assert.deepEqual([internas[0].eixo, internas[0].pos, internas[0].ini, internas[0].fim], ['v', 4, 0, 3]);
// o topo (y=0) é uma linha externa contínua de 0 a 7, mas com donos diferentes → 2 trechos
const topo = ps.filter((p) => p.eixo === 'h' && p.pos === 0);
assert.equal(topo.length, 2);
assert.equal(ps.length, 7); // 2 topos, 2 bases, oeste, leste, divisa

// cômodo menor encostado num maior: a divisa só cobre o trecho comum
const cozinha = { nome: 'Cozinha', forma: 'retângulo', x: 0, y: 3, largura: 2, profundidade: 2 };
const ps2 = paredesRetas([sala, cozinha]);
const divisa = ps2.filter((p) => p.interna);
assert.equal(divisa.length, 1);
assert.deepEqual([divisa[0].ini, divisa[0].fim], [0, 2]);

// cilindro e pátio não geram parede reta
assert.equal(paredesRetas([{ nome: 'Torre', forma: 'cilindro', x: 0, y: 0, largura: 5, profundidade: 5 }]).length, 0);

// porta e janela na parede sul da sala; trechos sólidos em volta do vão
const abs = aberturasNaLinha([sala], [{ comodo: 'Sala', tipo: 'porta', lado: 'S', posicao: 1, largura: 0.9 }, { comodo: 'Sala', tipo: 'janela', lado: 'N', largura: 1.2 }]);
assert.equal(abs.length, 2);
const porta = abs.find((a) => a.porta);
assert.deepEqual([porta.eixo, porta.pos, porta.ini, porta.fim, porta.base, porta.topo], ['h', 3, 1, 1.9, 0, 2.1]);
const sul = ps.find((p) => p.eixo === 'h' && p.pos === 3 && p.ini === 0);
const { trechos, vaos } = trechosSolidos(sul, abs, 2.7);
assert.equal(vaos.length, 1);
assert.deepEqual(trechos.map((t) => [t.ini, t.fim, t.base, t.topo]), [[0, 1, 0, 2.7], [1, 1.9, 2.1, 2.7], [1.9, 4, 0, 2.7]]);
const janela = abs.find((a) => !a.porta);
assert.ok(Math.abs(janela.ini - 1.4) < 1e-9 && janela.base === 0.9);

assert.equal(comodoNoPonto([sala, quarto], 5, 1).nome, 'Quarto');
assert.equal(comodoNoPonto([sala, quarto], 9, 1), null);
assert.ok(Math.abs(area({ forma: 'cilindro', largura: 2, profundidade: 2 }) - Math.PI) < 1e-9);
assert.equal(corHex('azul pastilha'), CORES['azul pastilha']);
assert.equal(corHex('#123abc'), '#123abc');
assert.equal(tipoMovel('Estante').liga, 'estante');
assert.equal(tipoMovel('coisa').grupo, 'outros');
assert.ok(Math.abs(ajustar(1.234) - 1.2) < 1e-9);
assert.deepEqual(limites([sala, quarto]), { x0: 0, y0: 0, x1: 7, y1: 3 });
console.log('casa-modelo: tudo certo');
