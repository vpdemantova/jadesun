// Confere o motor do céu (ceu.js) contra fatos astronômicos conhecidos.
// Uso: node testes/ceu.mjs   (sai com código 1 se algo falhar)
import { createRequire } from 'node:module';
const C = createRequire(import.meta.url)('../ceu.js');
const R = Math.PI / 180;
const rev = (x) => x - Math.floor(x / 360) * 360;
let ok = true;
const conferir = (nome, valor, esperado, tol) => {
  const passou = Math.abs(valor - esperado) <= tol;
  if (!passou) ok = false;
  console.log(passou ? 'OK   ' : 'FALHA', nome, '=>', valor.toFixed(3), `(esperado ${esperado} ± ${tol})`);
};
const sep = (a, b) => Math.acos(Math.max(-1, Math.min(1, Math.sin(a.dec * R) * Math.sin(b.dec * R) + Math.cos(a.dec * R) * Math.cos(b.dec * R) * Math.cos((a.ra - b.ra) * R)))) / R;
const eclLon = (p, d) => { const e = 23.4393 - 3.563e-7 * C.dias(d); return rev(Math.atan2(Math.sin(p.ra * R) * Math.cos(e * R) + Math.tan(p.dec * R) * Math.sin(e * R), Math.cos(p.ra * R)) / R); };

const t1 = new Date(Date.UTC(2020, 11, 21, 18, 20));
conferir('Grande Conjunção 2020-12-21: separação Júpiter–Saturno (graus)', sep(C.planeta('jupiter', t1), C.planeta('saturno', t1)), 0.1, 0.2);
const t2 = new Date(Date.UTC(2020, 9, 13, 23, 19));
conferir('Oposição de Marte 2020-10-13: diferença de longitude eclíptica Marte–Sol', rev(eclLon(C.planeta('marte', t2), t2) - eclLon(C.sol(t2), t2)), 180, 0.5);
const t3 = new Date(Date.UTC(2020, 2, 24, 12, 0));
conferir('Vênus, maior elongação leste 2020-03-24', sep(C.planeta('venus', t3), C.sol(t3)), 46.1, 1.2);
for (const [dia, esperado] of [['2020-02-10', 18.2], ['2020-03-24', 27.8], ['2020-10-01', 25.8], ['2020-11-10', 19.1]]) {
  const d = new Date(`${dia}T12:00:00Z`);
  conferir(`Mercúrio, elongação máxima ${dia}`, sep(C.planeta('mercurio', d), C.sol(d)), esperado, 0.8);
}
const nova = new Date(Date.UTC(2024, 3, 8, 18, 21));
const cheia = new Date(Date.UTC(2024, 2, 25, 7, 0));
const en = C.lua(nova).elong;
conferir('Lua nova 2024-04-08 18:21 UTC: elongação', Math.min(en, 360 - en), 0, 1);
conferir('Lua cheia 2024-03-25 07:00 UTC: elongação', C.lua(cheia).elong, 180, 1.5);
const eq = C.sol(new Date(Date.UTC(2024, 2, 20, 3, 6)));
conferir('Equinócio 2024-03-20: RA do Sol', Math.min(eq.ra, 360 - eq.ra), 0, 0.1);
conferir('Equinócio 2024-03-20: declinação do Sol', eq.dec, 0, 0.1);
conferir('Solstício 2024-12-21: declinação do Sol', C.sol(new Date(Date.UTC(2024, 11, 21, 9, 20))).dec, -23.44, 0.1);
let alto = -99;
for (let m = 0; m < 1440; m += 2) alto = Math.max(alto, C.horizonte(101.287, -16.716, new Date(Date.UTC(2026, 0, 15, 0, m)), C.LOCAL).alt);
conferir('Sirius: altura máxima em Campinas', alto, 90 - Math.abs(-22.9056 + 16.716), 0.2);
console.log(ok ? 'TUDO OK' : 'HÁ FALHAS');
process.exit(ok ? 0 : 1);
