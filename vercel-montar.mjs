// Portal Solar · vercel-montar.mjs (13/out/2026)
// Monta exportado/vercel/.vercel/output (o "Build Output" da Vercel) a partir de exportado/publico,
// para publicar no projeto portal-solar, o do montagnedejade.org, com:
//   npx vercel deploy --prebuilt --prod   (dentro de exportado/vercel)
// A raiz abre o Início direto (sem a página de redirecionar), e as imagens e as fontes
// ficam guardadas no aparelho de quem visita. Guarda o .vercel/project.json (a ligação ao projeto).
// uso: node vercel-montar.mjs        (rode antes: node exportar.mjs publico)
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const DE = join(RAIZ, 'exportado', 'publico');
const PASTA = join(RAIZ, 'exportado', 'vercel');
const SAIDA = join(PASTA, '.vercel', 'output');

if (!existsSync(join(DE, 'atlas.html'))) {
  console.error('Não achei exportado/publico/atlas.html. Rode antes: node exportar.mjs publico');
  process.exit(1);
}

/* só a saída é refeita; a ligação ao projeto (.vercel/project.json) fica */
rmSync(SAIDA, { recursive: true, force: true });
mkdirSync(join(SAIDA, 'static'), { recursive: true });
cpSync(DE, join(SAIDA, 'static'), { recursive: true });
/* o LEIA-ME e o relatório são para você, não para o site */
for (const f of ['LEIA-ME.txt', 'RELATORIO.md']) rmSync(join(SAIDA, 'static', f), { force: true });

const guardar = { 'cache-control': 'public, max-age=31536000, immutable' };
const config = {
  version: 3,
  routes: [
    { src: '^/midia/(.*)$', headers: guardar, continue: true },
    { src: '^/fontes/(.*)$', headers: guardar, continue: true },
    /* a raiz abre o Início direto, sem a página de redirecionar */
    { src: '^/$', dest: '/atlas.html' },
    { handle: 'filesystem' },
  ],
};
writeFileSync(join(SAIDA, 'config.json'), JSON.stringify(config, null, 2));

/* o tamanho, para conferir */
let n = 0, bytes = 0;
(function andar(d) { for (const f of readdirSync(d)) { const p = join(d, f); const s = statSync(p); if (s.isDirectory()) andar(p); else { n++; bytes += s.size; } } })(join(SAIDA, 'static'));
console.log(`Pronto: ${n} arquivos, ${(bytes / 1048576).toFixed(0)} MB em exportado/vercel/.vercel/output`);
console.log(existsSync(join(PASTA, '.vercel', 'project.json')) ? 'Ligada ao projeto (project.json existe).' : 'Ainda não ligada ao projeto: o publicar-montagne.bat liga na primeira vez.');
