/* A Mesa, o arquivo (registro 138): o que vai e volta sem perder nada.  node testes/mesa.mjs */
import assert from 'node:assert/strict';
import F from '../mesa-formato.js';

const ref = '2026-11-02';

/* datas e números */
assert.equal(F.iso('14/11/2026'), '2026-11-14');
assert.equal(F.iso('14/11', ref), '2026-11-14');
assert.equal(F.iso('10/01', ref), '2027-01-10');      /* janeiro escrito em novembro é do ano que vem */
assert.equal(F.iso('2026-11-14'), '2026-11-14');
assert.equal(F.iso('32/13/2026'), '');
assert.equal(F.br('2026-11-14'), '14/11/2026');
assert.equal(F.semana('2026-11-02'), '2026-S45');
assert.equal(F.semana('2027-01-01'), '2026-S53');
assert.equal(F.numero('-1.234,50'), -1234.5);
assert.equal(F.numero('R$ 35'), 35);
assert.equal(F.numero('35.5'), 35.5);
assert.equal(F.dinheiro(-1234.5, true), '-1.234,50');
assert.equal(F.dinheiro(300, true), '+300,00');

/* um estado cheio vai e volta igual */
const e = F.vazio();
e.centro = 'Um emprego numa agência, em dólar ou euro.';
e.areas = [{ id: 'codigo', nome: 'Código', para: 'o ofício | que a vaga pede', nota: 6, acoes: ['Three.js Journey', 'um commit por lição'] }, { id: 'obra', nome: 'A obra', para: '', nota: null, acoes: [] }];
e.tarefas.push(F.novaTarefa({ id: 't1', titulo: 'Renovar o domínio', q: 1, area: 'obra', prazo: '2026-11-14', contexto: 'computador', min: 30, energia: 'media', proximo: 'abrir a recuperação de conta', notas: 'linha um\nlinha dois', fonte: 'O Grande Plano', passos: [{ t: 'achar o e-mail', f: true }, { t: 'pedir o acesso', f: false }], criada: ref }));
e.tarefas.push(F.novaTarefa({ id: 't2', titulo: 'Estudar · a lição 5', q: 2, area: 'codigo', dia: '2026-11-04', min: 90 }));
e.tarefas.push(F.novaTarefa({ id: 't3', titulo: 'Copiar as conversas', q: 3, para: 'Claude', prazo: '2026-11-07' }));
e.tarefas.push(F.novaTarefa({ id: 't4', titulo: 'O Peacock Room', q: 4 }));
e.tarefas.push(F.novaTarefa({ id: 't5', titulo: 'Pegar os áudios', q: 0 }));
e.tarefas.push(F.novaTarefa({ id: 't6', titulo: 'Rotina feita', q: 1, feito: true, feitoEm: ref, focoMin: 25 }));
e.dias[ref] = { plano: ['t1', 't2'], sapo: 't1', bem: 'Renovar o domínio', fez: '' };
e.habitos.push({ id: 'h1', nome: 'Rotina da manhã', area: 'corpo', min: 15, quando: 'todo dia' });
e.marcas[ref] = ['h1'];
e.registros[ref] = { pratiquei: 'o piano', aprendi: 'a lição 3', travei: '', achados: 'Lissitzky', gratidao: 'a mãe', amanha: 'o domínio' };
e.semanas['2026-S45'] = { resultados: [{ t: 'o domínio renovado', f: false }, { t: 'a lição 5', f: true }], revisada: '' };
e.dinheiro.lancamentos.push({ id: 'd1', data: ref, valor: -35.5, grupo: 'essencial', cat: 'mercado', desc: 'a feira' });
e.dinheiro.lancamentos.push({ id: 'd2', data: '2026-11-01', valor: 300, grupo: 'renda', cat: 'freela', desc: '' });
e.dinheiro.fixos.push({ id: 'f1', nome: 'Domínio', valor: null, cada: 'ano', grupo: 'essencial', vence: '2026-11-14' });
e.dinheiro.metas.push({ id: 'm1', nome: 'Reserva', alvo: 3000, guardado: 120 });
e.roupas.push({ id: 'r1', nome: 'Camisa de linho', tipo: 'camisa', cor: 'branca', estacao: 'verão', ocasiao: 'dia a dia', custo: 120, usos: 12, ultima: '2026-10-30', estado: 'ok', capsula: true, notas: '' });
e.livros.push({ id: 'l1', titulo: 'Memórias Póstumas de Brás Cubas', autor: 'Assis, Machado de', situacao: 'lendo', pagina: 80, paginas: 240, inicio: '2026-10-20', fim: '', nota: 0, tags: ['literatura', 'romance'], notas: '' });
e.colecoes.push({ id: 'c1', nome: 'Discos', itens: [{ id: 'i1', nome: 'Clube da Esquina', detalhe: '1972', estado: 'quero', notas: '' }] });

const md = F.paraMarkdown(e);
const volta = F.deMarkdown(md, ref);
/* o arquivo agrupa as tarefas por quadrante: a ordem que volta é a das seções */
const limpo = (x) => { const o = JSON.parse(JSON.stringify({ ...x, _preambulo: null, _extras: {}, _soltas: [] })); o.tarefas.sort((a, b) => a.id.localeCompare(b.id)); return o; };
const t2 = { ...limpo(e) };
t2.tarefas = t2.tarefas.map((t) => (t.id === 't2' ? { ...t, titulo: 'Estudar - a lição 5' } : t));
assert.deepEqual(limpo(volta), t2, 'o estado volta igual');
assert.equal(F.paraMarkdown(volta), md, 'escrever de novo dá o mesmo texto');

/* o que a Mesa não conhece não se perde */
const comMao = md
  .replace('## Fazer\n', '## Fazer\n\nUma frase minha no meio da seção.\n')
  .replace('## Roupas\n', '## Uma seção minha\n\nTexto que é só meu.\n\n## Roupas\n');
const v2 = F.deMarkdown(comMao, ref);
const md2 = F.paraMarkdown(v2);
assert.ok(md2.includes('Uma frase minha no meio da seção.'), 'a linha solta fica');
assert.ok(md2.includes('## Uma seção minha\n\nTexto que é só meu.'), 'a seção desconhecida fica');
assert.ok(md2.indexOf('## Uma seção minha') < md2.indexOf('## Roupas'), 'no mesmo lugar');
assert.ok(md2.indexOf('## Uma seção minha') > md2.indexOf('## Dinheiro'), 'depois da seção que vinha antes');

/* marcar no Obsidian: a caixa marcada vai para as Feitas, lembrando de onde veio */
const marcada = md.replace('- [ ] Renovar o domínio', '- [x] Renovar o domínio');
const v3 = F.deMarkdown(marcada, ref);
const t1 = v3.tarefas.find((t) => t.id === 't1');
assert.equal(t1.feito, true);
assert.equal(t1.q, 1);
const md3 = F.paraMarkdown(v3);
assert.ok(/## Feitas[\s\S]*Renovar o domínio[^\n]*de fazer/.test(md3), 'vai para as Feitas com "de fazer"');

/* as colunas se acham pelo nome: trocar a ordem à mão não quebra */
const trocada = ['## Livros', '', '| Autor | Título | Situação |', '|---|---|---|', '| Rosa, Guimarães | Grande Sertão: Veredas | quero |', ''].join('\n');
const v4 = F.deMarkdown(trocada, ref);
assert.equal(v4.livros[0].titulo, 'Grande Sertão: Veredas');
assert.equal(v4.livros[0].autor, 'Rosa, Guimarães');
assert.equal(v4.livros[0].situacao, 'quero');
assert.equal(v4.livros[0].id, 'l1', 'ganha um id');

/* uma tarefa escrita à mão, com tabulação e campos fora de ordem */
const mao = ['## Marcar', '', '- [ ] Medir o quarto · @casa · #3d · 1 h 30 · prazo 15/11 · energia baixa · uma coisa minha', '\t- próximo: pegar a trena', '\t- [ ] as paredes', ''].join('\n');
const v5 = F.deMarkdown(mao, ref);
const q = v5.tarefas[0];
assert.equal(q.q, 2);
assert.equal(q.min, 90);
assert.equal(q.prazo, '2026-11-15');
assert.equal(q.contexto, 'casa');
assert.equal(q.area, '3d');
assert.equal(q.energia, 'baixa');
assert.equal(q.proximo, 'pegar a trena');
assert.deepEqual(q.passos, [{ t: 'as paredes', f: false }]);
assert.deepEqual(q.extras, ['uma coisa minha']);
assert.ok(F.paraMarkdown(v5).includes('uma coisa minha'), 'o campo desconhecido volta');

/* vazio: as oito áreas de quem chega */
assert.equal(F.deMarkdown('').areas.length, 8);

console.log('mesa: tudo certo');
