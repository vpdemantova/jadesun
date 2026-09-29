import assert from 'node:assert/strict';
import { norm, semNumero, lugarDoLivro, distribuir, mapaDeTags, layoutInicial, livrosDaLista, listasConhecidas, acharVaoPorNome } from '../estante-modelo.js';

assert.equal(norm('  Ação  Última '), 'acao ultima');
assert.equal(semNumero('2 Ensaios'), 'Ensaios');
assert.equal(semNumero('1 · Literarios'), 'Literarios');
assert.equal(semNumero('Mediunicos'), 'Mediunicos');

const layout = { andares: [
  [{ nome: 'Espiritualidade', tags: ['espiritualidade', 'esoterismo'] }, { nome: 'Poesia', tags: ['poesia'] }],
  [{ nome: 'Romances', tags: ['romance', 'literatura'] }],
], listas: [] };
const L = (titulo, tags, extra = {}) => ({ titulo, autor: 'X', tags, secaoReal: '', listas: [], ...extra });
const livros = [
  L('A', ['literatura', 'poesia']),       // primeira tag com lugar: literatura -> Romances
  L('B', ['poesia', 'literatura']),       // poesia -> Poesia
  L('C', ['ensaio']),                     // solto
  L('D', ['romance'], { secaoReal: '1 Poesia' }), // forçado, número antigo ignorado
  L('E', ['romance'], { secaoReal: 'Vão que não existe' }), // forçado inválido -> cai na tag
];
const m = mapaDeTags(layout);
assert.deepEqual(m.get('poesia'), { a: 0, v: 1 });
assert.deepEqual(lugarDoLivro(livros[0], layout, m), { a: 1, v: 0, motivo: 'tag', tag: 'literatura' });
assert.deepEqual(lugarDoLivro(livros[1], layout, m), { a: 0, v: 1, motivo: 'tag', tag: 'poesia' });
assert.equal(lugarDoLivro(livros[2], layout, m), null);
assert.deepEqual(lugarDoLivro(livros[3], layout, m), { a: 0, v: 1, motivo: 'forcado' });
assert.equal(lugarDoLivro(livros[4], layout, m).motivo, 'tag');
const { celulas, soltos } = distribuir(livros, layout);
assert.equal(celulas.get('1:0').length, 2);   // A e E
assert.equal(celulas.get('0:1').length, 2);   // B e D
assert.deepEqual(soltos.map((x) => x.titulo), ['C']);
assert.deepEqual(acharVaoPorNome(layout, 'ROMANCES'), { a: 1, v: 0 });

const ini = layoutInicial([L('1', ['a', 'b']), L('2', ['a']), L('3', ['c']), L('4', ['d', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o'])]);
assert.equal(ini.andares.flat().length, 12);
assert.equal(ini.andares[0].length, 3);
assert.equal(ini.andares[0][0].tags[0], 'a');
assert.deepEqual(layoutInicial([]).andares, [[{ nome: 'Vão', tags: [] }]]);

const ls = [L('x', [], { listas: [{ nome: 'Gregos', pos: 2 }] }), L('y', [], { listas: [{ nome: 'Gregos', pos: 1 }, { nome: 'Outra', pos: 0 }] }), L('z', [])];
assert.deepEqual(livrosDaLista(ls, 'Gregos').map((x) => x.titulo), ['y', 'x']);
assert.deepEqual(listasConhecidas(ls, [{ nome: 'Gregos', desc: 'd' }]).map((x) => x.nome), ['Gregos', 'Outra']);
console.log('estante-modelo: tudo certo');
