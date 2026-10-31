/* ============================================================
   Portal Solar · testes/catalogo.mjs — confere o índice das ferramentas (catalogo.js) num Edge sem janela.

   De onde veio: 27/out/2026, a página ferramentas.html (o pedido dele: "tags e filtros … ver muito e
   mudar muito rapidamente … abrir o que interessa"). Segue a lição de 19/out ("testar com o mouse de
   verdade"): os cliques são do mouse, no meio do botão, e antes de clicar o teste confere com
   elementFromPoint que é mesmo o botão que está ali (nada por cima).

   O que confere: todos os itens do caderno chegam (o teste conta as linhas da lista); a etiqueta "com IA" filtra e vai para o endereço; duas facetas
   juntas apertam; o × tira o filtro; a busca acha; a tabela ordena pelo Nível; o "ao acaso" marca um;
   o link com filtros abre a busca pronta; no celular (390 px) não há rolagem para o lado; e nenhum erro
   no console.

   Uso (com o servidor de teste ligado; nunca a porta 4321 do dono):
     PORTA=4322 SEM_NAVEGADOR=1 node servir.mjs        (noutro terminal)
     node testes/catalogo.mjs 4322 [pasta-das-fotos]
   Para onde vai: TAREFAS.md (PS-38) e o registro em respostas/.
   ============================================================ */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [porta = '4322', fotos = ''] = process.argv.slice(2);
const BASE = `http://127.0.0.1:${porta}/ferramentas.html`;
const navegador = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].find((p) => existsSync(p));
if (!navegador) { console.error('Não achei o Edge nem o Chrome.'); process.exit(2); }

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const perfil = mkdtempSync(join(tmpdir(), 'portal-catalogo-'));
const temp = join(perfil, 'temp');
mkdirSync(temp, { recursive: true });
const PORTA_CDP = 9800 + Math.floor(Math.random() * 150);
const proc = spawn(navegador, ['--headless=new', `--remote-debugging-port=${PORTA_CDP}`, `--user-data-dir=${perfil}`, '--disable-extensions',
  '--disable-component-extensions-with-background-pages', '--disable-component-update', '--no-first-run', '--no-default-browser-check', '--disable-sync', 'about:blank'],
{ stdio: 'ignore', env: { ...process.env, TEMP: temp, TMP: temp } });

let ver = null;
for (let i = 0; i < 60 && !ver; i++) { await dormir(250); try { ver = await (await fetch(`http://127.0.0.1:${PORTA_CDP}/json/version`)).json(); } catch { /* ainda abrindo */ } }
if (!ver) { proc.kill(); console.error('O navegador não respondeu.'); process.exit(2); }
const aba = await (await fetch(`http://127.0.0.1:${PORTA_CDP}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(aba.webSocketDebuggerUrl);
await new Promise((ok, falha) => { ws.onopen = ok; ws.onerror = falha; });
let id = 0;
const pendentes = new Map();
const erros = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pendentes.has(m.id)) { pendentes.get(m.id)(m); pendentes.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') erros.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erros.push(m.params.args.map((a) => a.value || a.description).join(' '));
};
const cdp = (method, params = {}) => new Promise((ok) => { const n = ++id; pendentes.set(n, ok); ws.send(JSON.stringify({ id: n, method, params })); });
const val = async (expr) => (await cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
await cdp('Runtime.enable');
await cdp('Page.enable');

let falhas = 0;
const conferir = (ok, msg, extra = '') => { console.log(`${ok ? 'ok   ' : 'FALHA'} ${msg}${extra ? '  ' + extra : ''}`); if (!ok) falhas++; };
async function tela(largura, altura, movel) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: largura, height: altura, deviceScaleFactor: 1, mobile: movel });
}
async function ir(url) {
  await cdp('Page.navigate', { url });
  for (let i = 0; i < 80; i++) { await dormir(150); if (await val('document.querySelectorAll("#ct-res [data-i]").length > 0 || /Não achei/.test(document.getElementById("ct-res")?.textContent || "")')) break; }
  await dormir(300);
}
async function foto(nome) {
  if (!fotos) return;
  mkdirSync(fotos, { recursive: true });
  const r = await cdp('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(fotos, nome), Buffer.from(r.result.data, 'base64'));
}
/* clicar como gente: rola até o botão, mira no meio e confere que é ele que está debaixo do mouse */
async function clicar(seletor) {
  /* a página rola macio (Lenis e scroll-behavior: smooth): rolar de uma vez e esperar parar antes de mirar */
  const achou = await val(`(() => { const el = document.querySelector(${JSON.stringify(seletor)}); if (!el) return false;
    el.scrollIntoView({ block: 'center', behavior: 'instant' }); return true; })()`);
  if (!achou) { conferir(false, 'achar ' + seletor); return false; }
  await dormir(250);
  const p = await val(`(() => { const el = document.querySelector(${JSON.stringify(seletor)}); const r = el.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const em = document.elementFromPoint(x, y); return { x, y, mesmo: !!em && (em === el || el.contains(em)), em: em ? (em.id || em.className || em.tagName) : '' }; })()`);
    if (!p.mesmo) { conferir(false, 'nada por cima de ' + seletor, 'por cima: ' + p.em); return false; }
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
    await cdp('Input.dispatchMouseEvent', { type, x: p.x, y: p.y, button: 'left', clickCount: 1 });
    await dormir(25);
  }
  await dormir(120);
  return true;
}
const conta = () => val('document.querySelectorAll("#ct-res [data-i]").length');
/* quantos itens a lista do caderno tem: as linhas de tabela que não são cabeçalho nem separador */
const ESPERADO = await (async () => {
  const idx = await (await fetch(`http://127.0.0.1:${porta}/api/biblioteca`)).json();
  const a = idx.itens.find((i) => i[1] === 'Ferramentas e Plataformas');
  const f = await (await fetch(`http://127.0.0.1:${porta}/api/ficha?id=` + encodeURIComponent(a[0]))).json();
  return f.corpo.split(/\r?\n/).filter((l) => /^\|/.test(l.trim()) && !/^\|\s*:?-{2,}/.test(l.trim()) && !/^\|\s*Nome\s*\|/.test(l.trim())).length;
})();
const chip = (f, v) => `.ct-chip[data-f="${f}"][data-v="${v}"]`;

/* ---------- no computador ---------- */
await tela(1440, 900, false);
await ir(BASE);
const total = await conta();
conferir(total === ESPERADO && total > 100, `os ${ESPERADO} itens chegam do caderno`, `(${total})`);
conferir(new RegExp(String(ESPERADO)).test(await val('document.getElementById("ct-resumo").textContent')), 'o resumo conta os itens');
conferir(await val('document.documentElement.scrollWidth <= innerWidth'), 'sem rolagem para o lado (1440)');
const alturas = await val('[...document.querySelectorAll(".ct-cartao")].slice(0, 12).map((c) => Math.round(c.getBoundingClientRect().height))');
conferir(new Set(alturas).size === 1, 'as fichas da grade têm a mesma altura', JSON.stringify([...new Set(alturas)]));
await foto('ferramentas-grade.png');

await clicar(chip('IA', 'sim'));
const nIA = await conta();
conferir(nIA > 20 && nIA < ESPERADO, '"com IA" filtra', `(${nIA})`);
conferir(/ia=sim/.test(await val('location.hash')), 'o filtro vai para o endereço', await val('location.hash'));
const nCodigoIA = await val(`(() => { const b = document.querySelector('${chip('Área', 'Código')}'); return +b.querySelector('span').textContent; })()`);
await clicar(chip('Área', 'Código'));
const nE = await conta();
conferir(nE === nCodigoIA && nE > 0 && nE < nIA, 'duas facetas juntas apertam, e o número da etiqueta acerta', `(${nE} = ${nCodigoIA})`);
conferir(await val('document.querySelectorAll(".ct-chip[disabled]").length > 0'), 'as etiquetas que não trazem nada se apagam');
await clicar('.ct-ativo[data-f="Área"]');
conferir(await conta() === nIA, 'o × tira o filtro');
await clicar('#ct-limpar');
conferir(await conta() === ESPERADO && !(await val('location.hash')), 'Limpar tudo volta a todos e limpa o endereço');

await clicar('#ct-busca');
await cdp('Input.insertText', { text: 'partitura' });
await dormir(200);
const achados = await val('[...document.querySelectorAll("#ct-res .ct-nome")].map((n) => n.textContent.replace("↗", "").trim())');
conferir(achados.includes('MuseScore') && achados.includes('IMSLP'), 'a busca acha (partitura)', JSON.stringify(achados));
await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
await dormir(150);
conferir(await conta() === ESPERADO, 'Esc na busca limpa');

await clicar('.ct-vistas button[data-vista="tabela"]');
conferir(await val('!!document.querySelector(".ct-tabela")') && /vista=tabela/.test(await val('location.hash')), 'a vista Tabela abre e vai para o endereço');
await clicar('.ct-tabela th button[data-ordem="Nível"]');
const nivel1 = await val('[...document.querySelectorAll(".ct-tabela tbody tr")].map((r) => r.children[7].textContent)');
conferir(nivel1[0] === 'para começar' && nivel1[nivel1.length - 1] === 'avançado', 'a tabela ordena pelo Nível');
await clicar('.ct-tabela th button[data-ordem="Nível"]');
const nivel2 = await val('[...document.querySelectorAll(".ct-tabela tbody tr")].map((r) => r.children[7].textContent)');
conferir(nivel2[0] === 'avançado', 'e ao contrário no segundo clique');
conferir(await val('document.documentElement.scrollWidth <= innerWidth'), 'a tabela não empurra a página para o lado');
await foto('ferramentas-tabela.png');
await clicar('.ct-vistas button[data-vista="lista"]');
conferir(await val('document.querySelectorAll(".ct-linha-item").length') === ESPERADO, 'a vista Lista mostra todos');
await clicar('#ct-acaso');
conferir(await val('!!document.querySelector(".ct-acaso")'), 'o "ao acaso" marca um item');

await ir(BASE + '#preco=aberto&vista=tabela');
const precos = await val('[...new Set([...document.querySelectorAll(".ct-tabela tbody tr")].map((r) => r.children[5].textContent))]');
conferir(JSON.stringify(precos) === '["código aberto"]', 'o link com filtros abre a busca pronta', JSON.stringify(precos));
await ir(BASE + '#vista=grade');

/* ---------- no celular ---------- */
await tela(390, 844, true);
await ir(BASE);
conferir(await val('document.documentElement.scrollWidth <= innerWidth'), 'sem rolagem para o lado (390)', `(${await val('document.documentElement.scrollWidth')})`);
conferir(await val('!document.getElementById("ct-filtros").open'), 'no celular os filtros começam fechados');
await foto('ferramentas-celular.png');
await clicar('#ct-filtros > summary');
await clicar(chip('Nível', 'começar'));
conferir(await conta() > 0 && await conta() < ESPERADO, 'no celular a etiqueta filtra');
await foto('ferramentas-celular-filtros.png');

conferir(!erros.length, 'console sem erro', erros.slice(0, 3).join(' | '));
try { ws.close(); } catch { /* já fechou */ }
proc.kill();
await dormir(600);
try { rmSync(perfil, { recursive: true, force: true, maxRetries: 6, retryDelay: 250 }); } catch { /* o navegador às vezes segura um arquivo */ }
console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo');
process.exit(falhas ? 1 : 0);
