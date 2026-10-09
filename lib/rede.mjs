import os from 'node:os';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARQ_TOKEN = join(RAIZ, 'dados', 'celular-token.txt');

export const MODO_CELULAR = process.env.LAN === '1';

export function enderecosLocais() {
  const lista = [];
  for (const [nome, itens] of Object.entries(os.networkInterfaces())) {
    for (const i of itens || []) if (i.family === 'IPv4' && !i.internal) lista.push({ nome, ip: i.address });
  }
  return lista;
}

let token = null;
export function tokenCelular() {
  if (token) return token;
  if (existsSync(ARQ_TOKEN)) {
    const t = readFileSync(ARQ_TOKEN, 'utf8').trim();
    if (/^[0-9a-f]{12}$/.test(t)) { token = t; return token; }
  }
  token = randomBytes(6).toString('hex');
  mkdirSync(dirname(ARQ_TOKEN), { recursive: true });
  writeFileSync(ARQ_TOKEN, `${token}\n`, 'utf8');
  return token;
}

export function hostsPermitidos(porta) {
  const h = new Set([`127.0.0.1:${porta}`, `localhost:${porta}`]);
  if (MODO_CELULAR) {
    for (const { ip } of enderecosLocais()) h.add(`${ip}:${porta}`);
    h.add(`${os.hostname().toLowerCase()}:${porta}`);
  }
  return h;
}

export function ehLoopback(req) {
  const a = req.socket.remoteAddress || '';
  return a === '127.0.0.1' || a === '::1' || a === '::ffff:127.0.0.1';
}

/* ---------- item 75: abrir de fora de casa, por um túnel https ----------
   O jeito local-first de abrir a casa de qualquer lugar: o Portal continua neste computador, e um túnel
   privado (o Tailscale Serve, por exemplo) dá a ele um endereço https que só os seus aparelhos alcançam.
   A regra de segurança: TUDO o que chega por um proxy é "de fora", mesmo que o túnel entregue o pedido
   pelo 127.0.0.1. Só o navegador deste próprio computador, falando direto com o servidor, é "de casa". */
const PASTA_DADOS = process.env.CONTAS_DIR || join(RAIZ, 'dados');
const ARQ_REDE = join(PASTA_DADOS, 'rede.json');
const CABECALHOS_DE_PROXY = ['x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto', 'forwarded', 'x-real-ip', 'cf-connecting-ip', 'tailscale-user-login'];
export function viaProxy(req) { return CABECALHOS_DE_PROXY.some((h) => req.headers[h] != null); }
/** o pedido é do navegador deste computador, direto (sem túnel nem proxy no meio) */
export function ehLocal(req) { return ehLoopback(req) && !viaProxy(req); }

let memoRede = null, memoRedeEm = 0;
/** o endereço público da casa (https://…), se você configurou um túnel; null se não */
export function enderecoPublico() {
  if (memoRede !== null && Date.now() - memoRedeEm < 5000) return memoRede || null;
  let e = '';
  try {
    const j = JSON.parse(readFileSync(ARQ_REDE, 'utf8'));
    const u = new URL(j.endereco);
    const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
    if (u.protocol === 'https:' || (u.protocol === 'http:' && local)) e = u.origin;
  } catch { e = ''; }
  memoRede = e; memoRedeEm = Date.now();
  return e || null;
}
export function gravarEndereco(texto) {
  const t = String(texto || '').trim();
  if (!t) { try { writeFileSync(ARQ_REDE, JSON.stringify({ endereco: '' }, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 }); } catch { /* sem disco */ } memoRede = null; return { endereco: null }; }
  let u;
  try { u = new URL(/^https?:\/\//i.test(t) ? t : 'https://' + t); } catch { throw Object.assign(new Error('Esse endereço não parece certo.'), { status: 400 }); }
  const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  if (u.protocol !== 'https:' && !local) throw Object.assign(new Error('O endereço de fora precisa ser https (é o que o túnel dá).'), { status: 400 });
  mkdirSync(PASTA_DADOS, { recursive: true });
  writeFileSync(ARQ_REDE, JSON.stringify({ endereco: u.origin, desde: new Date().toISOString() }, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 });
  memoRede = null;
  return { endereco: u.origin };
}
/** o Host do pedido é um dos nossos (o computador, a rede de casa no modo celular, ou o endereço do túnel) */
export function hostAceito(host, porta) {
  if (hostsPermitidos(porta).has(host)) return true;
  const e = enderecoPublico();
  return !!e && new URL(e).host === host;
}
/** o pedido veio por https (pelo túnel): os cookies ganham "Secure" */
export function porHttps(req) {
  const p = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  if (p) return p === 'https';
  const e = enderecoPublico();
  return viaProxy(req) && !!e && e.startsWith('https:');
}

function iguais(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

function cookieDe(req, nome) {
  const c = req.headers.cookie || '';
  for (const parte of c.split(';')) {
    const [k, ...v] = parte.trim().split('=');
    if (k === nome) return v.join('=');
  }
  return '';
}

const falhas = new Map();

function bloqueado(ip) {
  const f = falhas.get(ip);
  return !!f && f.n >= 15 && Date.now() - f.t < 10 * 60 * 1000;
}

function registrarFalha(ip) {
  const f = falhas.get(ip) || { n: 0, t: 0 };
  f.n += 1;
  f.t = Date.now();
  falhas.set(ip, f);
}

// 'ok' segue; 'redirecionou' e 'negado' já responderam.
// op.sessao(): há uma sessão de conta válida (item 74: entrar com senha vale como o código do QR);
// op.publico(): o pedido é da página Conta (que precisa abrir para alguém poder entrar).
export function autorizar(req, res, url, op = {}) {
  if (ehLocal(req)) return 'ok';
  /* de fora: pela rede de casa (modo celular) ou pelo túnel (item 75); fora disso, só o próprio computador */
  if (!MODO_CELULAR && !viaProxy(req)) { res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Só o próprio computador pode abrir isto.'); return 'negado'; }
  if ((op.sessao && op.sessao()) || (op.publico && op.publico())) return 'ok';
  const ip = req.socket.remoteAddress || '?';
  if (bloqueado(ip)) { res.writeHead(429, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Muitas tentativas. Espere 10 minutos.'); return 'negado'; }
  const t = tokenCelular();
  const enviado = url.searchParams.get('t');
  if (enviado !== null) {
    if (iguais(enviado, t)) {
      url.searchParams.delete('t');
      const resto = url.searchParams.toString();
      res.writeHead(302, {
        'Set-Cookie': `jt=${t}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${porHttps(req) ? '; Secure' : ''}`,
        Location: url.pathname + (resto ? `?${resto}` : '') + url.hash,
        'Cache-Control': 'no-store',
      });
      res.end();
      return 'redirecionou';
    }
    registrarFalha(ip);
  } else if (iguais(cookieDe(req, 'jt'), t)) {
    return 'ok';
  }
  res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:18px/1.5 system-ui;padding:2rem;max-width:32rem;margin:auto"><h1 style="font-weight:500">Falta o código</h1><p>Abra o link completo que aparece na tela do computador (ou aponte a câmera para o QR de <b>celular.bat</b>).</p><p>Ou <a href="/entrar.html">entre com a sua senha</a>.</p></body>');
  return 'negado';
}
