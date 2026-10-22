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

/* 21/out/2026 (registro 115): a função /api/agora, as manchetes e as vagas do dia de cada área.
   O motor é o mesmo do servidor de casa (lib/agora-motor.cjs) e lê a mesma lista (campos-dados.js).
   A Vercel guarda a resposta de cada área por meia hora (s-maxage) e a serve velha enquanto refaz:
   cada fonte recebe no máximo um pedido a cada meia hora por área, venha quanta gente vier. */
const FUNCAO = join(SAIDA, 'functions', 'api', 'agora.func');
mkdirSync(FUNCAO, { recursive: true });
cpSync(join(RAIZ, 'lib', 'agora-motor.cjs'), join(FUNCAO, 'agora-motor.cjs'));
cpSync(join(RAIZ, 'campos-dados.js'), join(FUNCAO, 'campos-dados.js'));
writeFileSync(join(FUNCAO, 'package.json'), JSON.stringify({ type: 'commonjs' }));
writeFileSync(join(FUNCAO, '.vc-config.json'), JSON.stringify({ runtime: 'nodejs22.x', handler: 'index.js', launcherType: 'Nodejs', shouldAddHelpers: false, maxDuration: 25 }, null, 2));
writeFileSync(join(FUNCAO, 'index.js'), `'use strict';
// gerado por vercel-montar.mjs: não edite aqui (o motor é lib/agora-motor.cjs; a lista, campos-dados.js)
const CAMPOS = require('./campos-dados.js');
const { agoraDe } = require('./agora-motor.cjs');
module.exports = async (req, res) => {
  const id = String(new URL(req.url, 'https://montagnedejade.org').searchParams.get('area') || '');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!CAMPOS.area(id)) { res.statusCode = 404; res.setHeader('Cache-Control', 'public, max-age=300'); return res.end(JSON.stringify({ erro: 'Área desconhecida.' })); }
  try {
    const dados = await agoraDe(CAMPOS, id);
    res.statusCode = 200;
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400');
    res.end(JSON.stringify(dados));
  } catch (e) {
    res.statusCode = 502; res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ erro: 'As fontes não responderam agora.' }));
  }
};
`);

/* o tamanho, para conferir */
let n = 0, bytes = 0;
(function andar(d) { for (const f of readdirSync(d)) { const p = join(d, f); const s = statSync(p); if (s.isDirectory()) andar(p); else { n++; bytes += s.size; } } })(join(SAIDA, 'static'));
console.log(`Pronto: ${n} arquivos, ${(bytes / 1048576).toFixed(0)} MB em exportado/vercel/.vercel/output`);
console.log(existsSync(join(PASTA, '.vercel', 'project.json')) ? 'Ligada ao projeto (project.json existe).' : 'Ainda não ligada ao projeto: o publicar-montagne.bat liga na primeira vez.');
