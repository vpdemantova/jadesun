/* Auditoria das áreas: `node auditar-areas.mjs` (VAULT=… para outro caderno).
   Grava `2 Academy/3 Atlas…/0 Áreas/Auditoria das áreas.md`; só esse arquivo é escrito. */
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { carregarEstado, COFRE } from './lib/vault.mjs';
import { auditarAreas, auditoriaMd } from './lib/areas.mjs';

const estado = await carregarEstado();
const r = await auditarAreas(estado.checklist);
const destino = join(COFRE, '2 Academy/3 Atlas - Referência e Contemplação/0 Áreas/Auditoria das áreas.md');
await writeFile(destino, auditoriaMd(r), 'utf8');
console.log(`Auditoria gravada em ${destino}`);
const t = (k) => r.duplicidades.filter((d) => d.tipo === k).length;
console.log(`duplicidades: ${t('mesma ficha')} mesma ficha, ${t('texto repetido')} texto repetido, ${t('mesmo nome, outro ângulo')} outro ângulo`);
console.log(`categorias: ${r.categorias.grupos.length} grupos canônicos, ${r.categorias.possiveis.length} aproximações fracas`);
console.log(`conceitos: ${r.conceitos.compartilhados.length} compartilhados, ${r.conceitos.genericos.length} rótulos genéricos`);
console.log(`sem lugar: ${r.semLugar.itensSemEstudo.length} itens sem estudo, ${r.semLugar.estudosSemItem.length} estudos sem item, ${r.semLugar.pecasSemEstudo.length} peças sem estudo`);
console.log(`pontes: ${r.pontes.mao.length} de mão única, ${r.pontes.fracas.length} pares fracos`);
