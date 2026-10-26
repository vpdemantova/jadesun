// Confere como a nuvem (nuvem.js) junta o que está no aparelho com o que veio do Drive: nada se perde,
// o que foi apagado não volta, o que mudou de um lado só vale esse lado.
// Uso: node testes/nuvem.mjs   (sai com código 1 se algo falhar)
import { createRequire } from 'node:module';
const N = createRequire(import.meta.url)('../nuvem.js');
let ok = true;
const conferir = (nome, passou, detalhe) => {
  if (!passou) ok = false;
  console.log(passou ? 'OK   ' : 'FALHA', nome, passou ? '' : '=> ' + JSON.stringify(detalhe).slice(0, 400));
};
const copia = (x) => JSON.parse(JSON.stringify(x));
const nota = (t, m) => ({ t, m, c: m });

/* ---------- as notas ---------- */
const base = { v: 1, notas: { 'Notas/A.md': nota('a', 10), 'Notas/B.md': nota('b', 10) }, pastas: [], fora: {} };
const B = N.baseDe('portal-notas', base);

let L = copia(base), R = copia(base);
R.notas['Notas/A.md'] = nota('a do outro aparelho', 20);
let r = N.combinar('portal-notas', L, R, B);
conferir('só o Drive mudou: vale o Drive', r.mudou && r.valor.notas['Notas/A.md'].t === 'a do outro aparelho', r);

L = copia(base); R = copia(base);
L.notas['Notas/A.md'] = nota('a daqui', 20);
r = N.combinar('portal-notas', L, R, B);
conferir('só daqui mudou: vale daqui, nada muda aqui', !r.mudou && r.valor.notas['Notas/A.md'].t === 'a daqui', r);

L = copia(base); R = copia(base);
L.notas['Notas/A.md'] = nota('a daqui', 30);
R.notas['Notas/A.md'] = nota('a de lá', 20);
R.notas['Notas/B.md'] = nota('b de lá', 25);
r = N.combinar('portal-notas', L, R, B);
const ns = r.valor.notas;
conferir('as duas mudaram a mesma nota: a mais nova fica no nome', ns['Notas/A.md'].t === 'a daqui', ns);
conferir('…e a outra fica ao lado, inteira', ns['Notas/A (outra versão).md'] && ns['Notas/A (outra versão).md'].t === 'a de lá', ns);
conferir('…e a nota que só lá mudou vale a de lá, sem cópia', ns['Notas/B.md'].t === 'b de lá' && !ns['Notas/B (outra versão).md'], ns);

L = copia(base); R = copia(base);
L.notas['Notas/C.md'] = nota('c', 40);
R.notas['Notas/D.md'] = nota('d', 41);
r = N.combinar('portal-notas', L, R, B);
conferir('notas novas dos dois lados: ficam as duas', r.valor.notas['Notas/C.md'] && r.valor.notas['Notas/D.md'], r.valor.notas);

L = copia(base); R = copia(base);
delete L.notas['Notas/A.md']; L.fora['Notas/A.md'] = 50;
R.notas['Notas/D.md'] = nota('d', 41);
r = N.combinar('portal-notas', L, R, B);
conferir('apagada aqui, intacta lá: some (não volta)', !r.valor.notas['Notas/A.md'] && r.valor.notas['Notas/D.md'], r.valor);

L = copia(base); R = copia(base);
delete L.notas['Notas/A.md']; L.fora['Notas/A.md'] = 50;
R.notas['Notas/A.md'] = nota('a escrita lá depois', 60);
r = N.combinar('portal-notas', L, R, B);
conferir('apagada aqui, escrita lá depois: fica a escrita', r.valor.notas['Notas/A.md'] && r.valor.notas['Notas/A.md'].t === 'a escrita lá depois', r.valor);

L = copia(base); R = copia(base);
L.notas['Projetos/A.md'] = L.notas['Notas/A.md']; delete L.notas['Notas/A.md']; L.fora['Notas/A.md'] = 55; L.pastas.push('Projetos');
R.notas['Notas/E.md'] = nota('e', 41);
r = N.combinar('portal-notas', L, R, B);
conferir('movida aqui: só o nome novo, nos dois', r.valor.notas['Projetos/A.md'] && !r.valor.notas['Notas/A.md'] && r.valor.pastas.includes('Projetos'), r.valor);

L = { v: 1, notas: { 'Notas/2026-10-25 20h31.md': nota('daqui', 70) }, pastas: [], fora: {} };
R = { v: 1, notas: { 'Notas/2026-10-25 20h31.md': nota('de lá', 71) }, pastas: [], fora: {} };
r = N.combinar('portal-notas', L, R, undefined);
conferir('o mesmo nome nascido nos dois aparelhos (sem versão combinada): as duas ficam', Object.values(r.valor.notas).map((x) => x.t).sort().join('|') === 'daqui|de lá', r.valor.notas);

r = N.combinar('portal-notas', copia(base), copia(base), B);
conferir('nada mudou: nada muda', !r.mudou, r);
r = N.combinar('portal-notas', undefined, copia(base), B);
conferir('nada aqui: vem tudo do Drive', r.mudou && r.valor.notas['Notas/B.md'], r);
r = N.combinar('portal-notas', copia(base), undefined, B);
conferir('nada no Drive: fica o daqui', !r.mudou && r.valor.notas['Notas/B.md'], r);

/* ---------- os lugares ---------- */
const lug = (fixadas, caminhos, soltas) => ({ v: 1, fixadas, caminhos, soltas: soltas || {} });
const fx = (ctx, ts, f) => ({ ctx, u: ctx, t: ctx, s: '', y: 0, ts, fx: f || ts });
const cam = (id, ts) => ({ id, ts, passos: [{ u: id + '.html', t: id, ts }] });
const LB = lug([fx('area.html?m=Geografia', 10)], [cam('a', 10)]);
L = lug([fx('area.html?m=Geografia', 30, 10)], [cam('a', 30), cam('b', 31)]);
R = lug([fx('area.html?m=Geografia', 20, 10), fx('atlas.html#ver=vida', 21)], [cam('a', 10), cam('c', 25)]);
r = N.combinar('portal-lugares', L, R, N.baseDe('portal-lugares', LB));
conferir('lugares: as fixadas dos dois somam, a mais recente vale', r.valor.fixadas.length === 2 && r.valor.fixadas[0].ts === 30, r.valor.fixadas);
conferir('lugares: os caminhos dos dois somam, do mais novo ao mais velho', r.valor.caminhos.map((c) => c.id).join() === 'b,a,c', r.valor.caminhos);
L = lug([], [cam('a', 40)], { 'area.html?m=Geografia': 35 });
R = lug([fx('area.html?m=Geografia', 38, 10)], [cam('c', 39)]);
r = N.combinar('portal-lugares', L, R, N.baseDe('portal-lugares', LB));
conferir('lugares: solta aqui, só visitada lá: não volta', r.valor.fixadas.length === 0, r.valor);
R = lug([fx('area.html?m=Geografia', 45, 44)], [cam('c', 45)]);
r = N.combinar('portal-lugares', L, R, N.baseDe('portal-lugares', LB));
conferir('lugares: solta aqui, fixada de novo lá depois: fica', r.valor.fixadas.length === 1, r.valor);

/* ---------- as leituras ---------- */
const item = (id, vistoEm, marcas, fora) => ({ id, titulo: id, vistoEm, marcas, ...(fora ? { fora } : {}) });
const marca = (id, em) => ({ id, p: 1, ini: 0, fim: 4, texto: id, em });
const LeB = { v: 1, itens: { x: item('x', '2026-10-20T10:00:00Z', [marca('m1', '2026-10-20T10:00:00Z')]) }, links: [], grupos: [] };
L = copia(LeB); R = copia(LeB);
L.itens.x = item('x', '2026-10-25T10:00:00Z', [], { m1: '2026-10-25T10:00:00Z' });
R.itens.x = item('x', '2026-10-24T10:00:00Z', [marca('m1', '2026-10-20T10:00:00Z'), marca('m2', '2026-10-24T09:00:00Z')]);
R.itens.y = item('y', '2026-10-24T11:00:00Z', []);
L.links = [{ url: 'https://a', titulo: 'a' }]; R.links = [{ url: 'https://a', titulo: 'a' }, { url: 'https://b', titulo: 'b' }];
r = N.combinar('portal-leituras', L, R, N.baseDe('portal-leituras', LeB));
const x = r.valor.itens.x;
conferir('leituras: a marca apagada aqui não volta', !x.marcas.some((m) => m.id === 'm1'), x);
conferir('leituras: a marca nova de lá chega', x.marcas.some((m) => m.id === 'm2'), x);
conferir('leituras: o texto aberto só lá chega', !!r.valor.itens.y, r.valor.itens);
conferir('leituras: os links somam sem repetir', r.valor.links.map((l) => l.url).join() === 'https://a,https://b', r.valor.links);

/* ---------- a ficha: sem regra, vale este aparelho ---------- */
r = N.combinar('portal-minha-ficha', { nome: 'aqui' }, { nome: 'lá' }, N.baseDe('portal-minha-ficha', { nome: 'antes' }));
conferir('a ficha mudou dos dois lados: vale a daqui', !r.mudou && r.valor.nome === 'aqui', r);
r = N.combinar('portal-minha-ficha', { nome: 'antes' }, { nome: 'lá' }, N.baseDe('portal-minha-ficha', { nome: 'antes' }));
conferir('a ficha mudou só lá: vale a de lá', r.mudou && r.valor.nome === 'lá', r);

console.log(ok ? '\nTudo certo.' : '\nHá falhas.');
process.exit(ok ? 0 : 1);
