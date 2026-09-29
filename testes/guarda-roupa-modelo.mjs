import assert from 'node:assert/strict';
import { tipoDe, corDaPeca, distribuir, vestir, nomeUnico, alturasDasPartes, acharParte, CORES } from '../guarda-roupa-modelo.js';

assert.equal(tipoDe('Calça').grupo, 'baixo');
assert.equal(tipoDe('tenis').grupo, 'pe');
assert.equal(tipoDe('camiseta de banda').forma, 'camiseta');
assert.equal(tipoDe('coisa estranha').grupo, 'cima');

assert.equal(corDaPeca('azul-marinho').base, CORES['azul-marinho']);
assert.equal(corDaPeca('azul').base, CORES.azul);
assert.deepEqual(corDaPeca('xadrez vermelho e preto'), { base: CORES.vermelho, segunda: CORES.preto, padrao: 'xadrez' });
assert.equal(corDaPeca('listrado azul e branco').padrao, 'listras');
assert.equal(corDaPeca('#123456').base, '#123456');
assert.equal(corDaPeca('').base, '#9a9690');

const movel = [[{ tipo: 'cabideiro', nome: 'Camisas' }], [{ tipo: 'prateleira', nome: 'Camisetas' }, { tipo: 'gaveta', nome: 'Meias' }]];
assert.deepEqual(acharParte(movel, 'meias'), { m: 1, i: 1 });
const P = (nome, extra = {}) => ({ nome, tipo: 'camiseta', lugar: '', estado: '', ...extra });
const pecas = [P('a', { lugar: 'Camisas' }), P('b', { lugar: 'Meias' }), P('c', { lugar: 'Camisas', estado: 'para lavar' }), P('d', { estado: 'doar' }), P('e', { lugar: 'Nenhum' })];
const d = distribuir(pecas, movel);
assert.deepEqual(d.partes.get('0:0').map((x) => x.nome), ['a']);
assert.deepEqual(d.partes.get('1:1').map((x) => x.nome), ['b']);
assert.deepEqual(d.cesto.map((x) => x.nome), ['c']);
assert.deepEqual(d.doar.map((x) => x.nome), ['d']);
assert.deepEqual(d.soltas.map((x) => x.nome), ['e']);

const roupa = [P('Camiseta', { tipo: 'camiseta' }), P('Jeans', { tipo: 'calça' }), P('Tênis', { tipo: 'tênis' }), P('Casaco', { tipo: 'casaco' }), P('Vestido', { tipo: 'vestido' })];
const v = vestir({ pecas: ['Camiseta', 'Jeans', 'Tênis', 'Casaco'] }, roupa);
assert.equal(v.cima.nome, 'Camiseta'); assert.equal(v.baixo.nome, 'Jeans'); assert.equal(v.pe.nome, 'Tênis'); assert.equal(v.fora.nome, 'Casaco');
const v2 = vestir({ pecas: ['Camiseta', 'Vestido'] }, roupa);
assert.equal(v2.inteira.nome, 'Vestido'); assert.equal(v2.cima, null);

assert.equal(nomeUnico('Camiseta', roupa), 'Camiseta 2');
assert.equal(nomeUnico('Nova', roupa), 'Nova');

const alt = alturasDasPartes([{ tipo: 'prateleira' }, { tipo: 'cabideiro' }], 2);
assert.ok(Math.abs(alt[0] - 0.3) < 1e-9 && Math.abs(alt[1] - 1.7) < 1e-9);
const alt2 = alturasDasPartes([{ tipo: 'prateleira' }, { tipo: 'gaveta' }], 1);
assert.ok(Math.abs(alt2[0] + alt2[1] - 1) < 1e-9);
console.log('guarda-roupa-modelo: tudo certo');
