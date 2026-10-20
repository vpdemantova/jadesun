/* ============================================================
   Portal Solar · testes/cores-auditoria.mjs — confere as cores de todas as páginas, em todas as cores.
   De onde veio: 14/out/2026, o Portal ficou monocromático (cores.css) e ele pediu: "tenha certeza que
   cada seção fica bem com as cores definidas". Esta é a prova que se repete a cada mudança.
   Como: abre o Edge (ou o Chrome) sem janela, numa pasta de perfil temporária; em cada página e em cada
   cor (preto, branco, papel, floresta, azul noite) grava a escolha no localStorage, bloqueia toda gravação
   no servidor (só passa GET) e roda testes/cores-auditoria-pagina.js. No fim, o resumo; sai com código 1
   se algum texto ficar abaixo do contraste mínimo.
   Uso (com o servidor de teste ligado; nunca a porta 4321 do dono se ela estiver em uso por ele):
     PORTA=4322 SEM_NAVEGADOR=1 node servir.mjs        (noutro terminal)
     node testes/cores-auditoria.mjs 4322                (todas as páginas)
     node testes/cores-auditoria.mjs 4322 atlas doar     (só estas)
     ESTILO=casa node testes/cores-auditoria.mjs 4322    (no estilo Casa)
   Para onde vai: TAREFAS.md (Controles e "antes de dar uma tarefa por pronta").
   ============================================================ */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const [porta = '4322', ...soEstas] = process.argv.slice(2);
const PAGINAS = soEstas.length ? soEstas : ['atlas', 'guias', 'curadoria', 'museus', 'biblioteca', 'linha-do-tempo', 'dados', 'falta', 'manifesto', 'participe',
  'manifestos', 'filosofia', 'sistema', 'galeria', 'hoje', 'copiar', 'domino', 'area', 'leituras', 'eu', 'entrar', 'doar', 'celular', 'carta'];
const CORES = [['branco', 'light'], ['preto', 'dark'], ['papel', 'light'], ['floresta', 'dark'], ['azul-noite', 'dark']];
const ESTILO = process.env.ESTILO === 'casa' ? 'casa' : 'almanaque';
const AUDITORIA = readFileSync(join(AQUI, 'cores-auditoria-pagina.js'), 'utf8');

const navegador = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/usr/bin/google-chrome', '/usr/bin/chromium',
].find((p) => existsSync(p));
if (!navegador) { console.error('Não achei o Edge nem o Chrome.'); process.exit(2); }
const perfil = mkdtempSync(join(tmpdir(), 'portal-cores-'));
const PORTA_CDP = 9400 + Math.floor(Math.random() * 400);
const proc = spawn(navegador, ['--headless=new', `--remote-debugging-port=${PORTA_CDP}`, `--user-data-dir=${perfil}`, '--disable-extensions',
  '--disable-component-extensions-with-background-pages', '--no-first-run', '--no-default-browser-check', '--disable-sync', 'about:blank'], { stdio: 'ignore' });
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
let ver = null;
for (let i = 0; i < 60 && !ver; i++) { await dormir(250); try { ver = await (await fetch(`http://127.0.0.1:${PORTA_CDP}/json/version`)).json(); } catch { /* ainda abrindo */ } }
if (!ver) { console.error('O navegador não respondeu.'); proc.kill(); process.exit(2); }

const ws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); const ouvintes = [];
ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } else ouvintes.forEach((f) => f(d)); });
const cmd = (method, params = {}, sessionId) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const { result: { targetId } } = await cmd('Target.createTarget', { url: 'about:blank' });
const { result: { sessionId: s } } = await cmd('Target.attachToTarget', { targetId, flatten: true });
const c = (m, p) => cmd(m, p, s);
let carregou = false;
ouvintes.push((d) => {
  if (d.sessionId !== s) return;
  if (d.method === 'Page.loadEventFired') carregou = true;
  if (d.method === 'Fetch.requestPaused') {
    const req = d.params.request;
    if (req.method !== 'GET' && req.method !== 'HEAD') c('Fetch.failRequest', { requestId: d.params.requestId, errorReason: 'BlockedByClient' });
    else c('Fetch.continueRequest', { requestId: d.params.requestId });
  }
});
await c('Page.enable');
await c('Fetch.enable', { patterns: [{ urlPattern: '*/api/*', requestStage: 'Request' }] });
await c('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

let falhas = 0, avisos = 0, script = null;
for (const [cor, esquema] of CORES) {
  console.log(`\n== ${cor} (${ESTILO})`);
  await c('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: esquema }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
  if (script) await c('Page.removeScriptToEvaluateOnNewDocument', { identifier: script });
  const prefs = JSON.stringify({ v: 5, tema: cor, acabamento: ESTILO });
  script = (await c('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem('perfil-pers', ${JSON.stringify(prefs)})}catch(e){}` })).result.identifier;
  for (const p of PAGINAS) {
    carregou = false;
    await c('Page.navigate', { url: `http://127.0.0.1:${porta}/${p}.html` });
    for (let i = 0; i < 100 && !carregou; i++) await dormir(100);
    await dormir(2400);
    const r = await c('Runtime.evaluate', { expression: AUDITORIA, returnByValue: true });
    const v = r.result && r.result.result && r.result.result.value ? JSON.parse(r.result.result.value) : null;
    if (!v) { console.log(`  ${p}: não rodou`); falhas++; continue; }
    falhas += v.baixo.length; avisos += v.cor.length;
    if (!v.baixo.length && !v.cor.length) { console.log(`  ${p}: ok`); continue; }
    console.log(`  ${p}: ${v.baixo.length} contraste, ${v.cor.length} cor fora do tom`);
    v.baixo.slice(0, 4).forEach((b) => console.log(`     contraste ${b.razao} (mín. ${b.min})  ${b.onde.slice(-80)}  «${b.texto.slice(0, 30)}»`));
    v.cor.slice(0, 4).forEach((k) => console.log(`     cor  ${k.slice(-110)}`));
  }
}
console.log(`\nResumo: ${falhas} texto(s) abaixo do contraste, ${avisos} cor(es) fora do tom.`);
await cmd('Target.closeTarget', { targetId });
ws.close(); proc.kill();
await dormir(400);
try { rmSync(perfil, { recursive: true, force: true }); } catch { /* o Windows às vezes segura a pasta; o sistema limpa depois */ }
process.exit(falhas ? 1 : 0);
