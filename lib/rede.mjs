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
export function autorizar(req, res, url) {
  if (ehLoopback(req)) return 'ok';
  if (!MODO_CELULAR) { res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Só o próprio computador pode abrir isto.'); return 'negado'; }
  const ip = req.socket.remoteAddress || '?';
  if (bloqueado(ip)) { res.writeHead(429, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Muitas tentativas. Espere 10 minutos.'); return 'negado'; }
  const t = tokenCelular();
  const enviado = url.searchParams.get('t');
  if (enviado !== null) {
    if (iguais(enviado, t)) {
      url.searchParams.delete('t');
      const resto = url.searchParams.toString();
      res.writeHead(302, {
        'Set-Cookie': `jt=${t}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`,
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
  res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:18px/1.5 system-ui;padding:2rem;max-width:32rem;margin:auto"><h1 style="font-weight:500">Falta o código</h1><p>Abra o link completo que aparece na tela do computador (ou aponte a câmera para o QR de <b>celular.bat</b>).</p></body>');
  return 'negado';
}
