/* ============================================================
   A CONTA (09/out/2026, PERFIL.md item 74) — "prepara o login com senha ou redes sociais;
   vamos bolar o melhor jeito pra lidar com o local-first o quanto é possível."

   A conta é chave, não cofre: ela abre a SUA casa (este computador) de outro aparelho; os dados
   continuam no caderno. Uma casa, uma dona (ou dono): a conta só nasce no próprio computador.
   · Senha: guardada como resumo scrypt (N=16384, r=8, p=1, sal aleatório), em dados/contas.json.
     O caderno nunca vê a senha (e o PROIBIDO do vault já recusa "senha|pass|secret|token").
   · Sessão: um token aleatório de 32 bytes num cookie HttpOnly + SameSite=Lax; no disco fica só
     o sha256 dele (dados/sessoes.json), com o aparelho, o IP e a validade (30 dias).
   · Redes sociais (GitHub e Google, OAuth 2.0 com "state" e, no Google, PKCE): ficam prontas e
     desligadas até você pôr as chaves em dados/provedores.json (o modelo está na página Conta).
   · Tentativas erradas: 10 por IP em 10 minutos, depois espera.
   Item 75 (09/out): de fora de casa por um túnel https (lib/rede.mjs); a digital do aparelho (passkeys,
   WebAuthn: lib/chaves.mjs faz as contas, aqui ficam os desafios e as chaves ligadas); o retorno do
   GitHub e do Google pelo endereço do túnel; e as chaves dos dois gravadas pela própria página.
   ============================================================ */
import { scrypt as scryptCb, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { enderecoPublico, porHttps, viaProxy } from './rede.mjs';
import { cbor, lerAuthData, coseParaJwk, verificarAssinatura, lerClientData, sha256 } from './chaves.mjs';

const scrypt = promisify(scryptCb);
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
/* CONTAS_DIR permite testar com outra pasta (os testes nunca tocam a conta de verdade) */
const PASTA = process.env.CONTAS_DIR || join(RAIZ, 'dados');
const ARQ_CONTAS = join(PASTA, 'contas.json');
const ARQ_SESSOES = join(PASTA, 'sessoes.json');
const ARQ_PROVEDORES = join(PASTA, 'provedores.json');
const COOKIE = 'ps_sessao';
const DIAS = 30;
const PARAMS = { N: 16384, r: 8, p: 1, tam: 64 };

const erro = (msg, status = 400) => Object.assign(new Error(msg), { status });
const sha = (t) => createHash('sha256').update(String(t)).digest('hex');
const agora = () => Date.now();

function lerJson(arq, padrao) { try { return existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8')) : padrao; } catch { return padrao; } }
function gravarJson(arq, v) {
  mkdirSync(dirname(arq), { recursive: true });
  writeFileSync(`${arq}.tmp`, JSON.stringify(v, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 });
  renameSync(`${arq}.tmp`, arq);
}

let contas = lerJson(ARQ_CONTAS, { versao: 1, contas: [] });
let sessoes = lerJson(ARQ_SESSOES, {});
for (const [k, s] of Object.entries(sessoes)) if (!s || s.expira < agora()) delete sessoes[k];

export function provedores() {
  const p = lerJson(ARQ_PROVEDORES, {});
  const ok = (x) => !!(x && x.clientId && x.clientSecret);
  return { github: ok(p.github) ? p.github : null, google: ok(p.google) ? p.google : null };
}

function cookieDe(req, nome) {
  for (const parte of String(req.headers.cookie || '').split(';')) {
    const [k, ...v] = parte.trim().split('=');
    if (k === nome) return decodeURIComponent(v.join('='));
  }
  return '';
}
function publico(c) { return c ? { id: c.id, nome: c.nome, email: c.email || '', criada: c.criada, temSenha: !!c.senha, provedores: Object.keys(c.provedores || {}).map((k) => ({ provedor: k, quem: c.provedores[k].quem })), chaves: (c.chaves || []).map((k) => ({ id: k.id, aparelho: k.aparelho, criada: k.criada, usada: k.usada || null })) } : null; }
function contaDona() { return contas.contas[0] || null; }

/** a conta da sessão deste pedido (ou null) */
export function sessaoDe(req) {
  const t = cookieDe(req, COOKIE); if (!t || t.length < 40) return null;
  const s = sessoes[sha(t)]; if (!s || s.expira < agora()) return null;
  return contas.contas.find((c) => c.id === s.conta) || null;
}

function abrirSessao(conta, req) {
  const token = randomBytes(32).toString('base64url');
  const ua = String(req.headers['user-agent'] || '');
  const aparelho = /iPhone|iPad/.test(ua) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : /Macintosh/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'navegador';
  sessoes[sha(token)] = { conta: conta.id, criada: agora(), expira: agora() + DIAS * 864e5, aparelho, ip: req.socket.remoteAddress || '' };
  gravarJson(ARQ_SESSOES, sessoes);
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${DIAS * 86400}; HttpOnly; SameSite=Lax${porHttps(req) ? '; Secure' : ''}`;
}
const fecharCookie = () => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;

async function resumo(senha, sal) { return (await scrypt(senha, sal, PARAMS.tam, { N: PARAMS.N, r: PARAMS.r, p: PARAMS.p, maxmem: 64 * 1024 * 1024 })).toString('base64'); }
function validarSenha(senha) {
  if (typeof senha !== 'string' || senha.length < 10) throw erro('A senha precisa de pelo menos 10 caracteres (uma frase curta é ótima).');
  if (senha.length > 200) throw erro('Senha longa demais.');
}

/* tentativas erradas por IP */
const falhas = new Map();
function checarBloqueio(ip) { const f = falhas.get(ip); if (f && f.n >= 10 && agora() - f.t < 10 * 60 * 1000) throw erro('Muitas tentativas. Espere 10 minutos.', 429); }
function falhou(ip) { const f = falhas.get(ip) || { n: 0, t: 0 }; f.n += 1; f.t = agora(); falhas.set(ip, f); }

/* ---------- o que a página Conta precisa saber ---------- */
export function estadoConta(req, { local, porta }) {
  const c = sessaoDe(req), p = provedores();
  const minhas = c ? Object.entries(sessoes).filter(([, s]) => s.conta === c.id && s.expira > agora()).map(([k, s]) => ({ id: k.slice(0, 12), desde: s.criada, aparelho: s.aparelho, ip: s.ip, esta: k === sha(cookieDe(req, COOKIE)) })) : [];
  return {
    conta: publico(c), existe: contas.contas.length > 0, local,
    provedores: { github: !!p.github, google: !!p.google },
    retorno: { github: `${baseRetorno(porta)}/auth/github/retorno`, google: `${baseRetorno(porta)}/auth/google/retorno` },
    sessoes: minhas,
    endereco: enderecoPublico(), porTunel: viaProxy(req), temChaves: contas.contas.some((x) => (x.chaves || []).length > 0),
  };
}

export async function criarConta({ nome, email, senha }, req, { local }) {
  if (!local) throw erro('A conta só nasce no computador onde o Portal Solar mora.', 403);
  if (contas.contas.length) throw erro('Esta casa já tem dona (ou dono). Entre com a senha.', 409);
  nome = String(nome || '').trim().slice(0, 80); email = String(email || '').trim().toLowerCase().slice(0, 120);
  if (!nome) throw erro('Diga o seu nome.');
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw erro('Esse e-mail não parece certo.');
  validarSenha(senha);
  const sal = randomBytes(16).toString('base64');
  const conta = { id: randomBytes(9).toString('base64url'), nome, email, criada: new Date().toISOString(), senha: { alg: 'scrypt', ...PARAMS, sal, resumo: await resumo(senha, sal) }, provedores: {} };
  contas.contas.push(conta);
  gravarJson(ARQ_CONTAS, contas);
  return { conta: publico(conta), cookie: abrirSessao(conta, req) };
}

export async function entrar({ quem, senha }, req) {
  const ip = req.socket.remoteAddress || '?';
  checarBloqueio(ip);
  const q = String(quem || '').trim().toLowerCase();
  const c = contas.contas.find((x) => (x.email && x.email === q) || x.nome.toLowerCase() === q);
  if (!c || !c.senha) { falhou(ip); await resumo(String(senha || 'x'), 'sal-falso'); throw erro('Nome, e-mail ou senha não conferem.', 401); }
  const tentado = Buffer.from(await resumo(String(senha || ''), c.senha.sal), 'base64'), certo = Buffer.from(c.senha.resumo, 'base64');
  if (tentado.length !== certo.length || !timingSafeEqual(tentado, certo)) { falhou(ip); throw erro('Nome, e-mail ou senha não conferem.', 401); }
  falhas.delete(ip);
  return { conta: publico(c), cookie: abrirSessao(c, req) };
}

export function sair(req, { todas } = {}) {
  const c = sessaoDe(req);
  const t = sha(cookieDe(req, COOKIE));
  if (todas && c) { for (const [k, s] of Object.entries(sessoes)) if (s.conta === c.id) delete sessoes[k]; }
  else delete sessoes[t];
  gravarJson(ARQ_SESSOES, sessoes);
  return { cookie: fecharCookie() };
}

export async function trocarSenha({ atual, nova }, req, { local }) {
  const c = sessaoDe(req) || (local ? contaDona() : null);
  if (!c) throw erro('Entre primeiro.', 401);
  if (c.senha && !local) {
    const t = Buffer.from(await resumo(String(atual || ''), c.senha.sal), 'base64'), certo = Buffer.from(c.senha.resumo, 'base64');
    if (t.length !== certo.length || !timingSafeEqual(t, certo)) throw erro('A senha atual não confere.', 401);
  }
  validarSenha(nova);
  const sal = randomBytes(16).toString('base64');
  c.senha = { alg: 'scrypt', ...PARAMS, sal, resumo: await resumo(nova, sal) };
  gravarJson(ARQ_CONTAS, contas);
  return { ok: true };
}

/* ---------- redes sociais (OAuth 2.0) ---------- */
const pendentes = new Map(); /* state → { provedor, verificador, ligar, expira } */
const b64url = (b) => Buffer.from(b).toString('base64url');

/* o endereço de retorno das redes: o do túnel, se houver (de fora de casa, "localhost" seria o próprio celular) */
function baseRetorno(porta) { return enderecoPublico() || `http://localhost:${porta}`; }

export function iniciarOAuth(provedor, req, { porta }) {
  const p = provedores()[provedor];
  if (!p) throw erro('Esta rede ainda não foi configurada (veja "Redes sociais" na página Conta).', 404);
  const state = randomBytes(18).toString('base64url');
  const verificador = randomBytes(32).toString('base64url');
  const retorno = `${baseRetorno(porta)}/auth/${provedor}/retorno`;
  pendentes.set(state, { provedor, verificador, ligar: sessaoDe(req) ? sessaoDe(req).id : null, expira: agora() + 10 * 60 * 1000 });
  if (provedor === 'github') return `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(p.clientId)}&redirect_uri=${encodeURIComponent(retorno)}&scope=${encodeURIComponent('read:user user:email')}&state=${state}&allow_signup=true`;
  const desafio = b64url(createHash('sha256').update(verificador).digest());
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(p.clientId)}&redirect_uri=${encodeURIComponent(retorno)}&response_type=code&scope=${encodeURIComponent('openid email profile')}&state=${state}&code_challenge=${desafio}&code_challenge_method=S256&prompt=select_account`;
}

async function identidade(provedor, code, verificador, porta) {
  const p = provedores()[provedor];
  const retorno = `${baseRetorno(porta)}/auth/${provedor}/retorno`;
  if (provedor === 'github') {
    const r = await fetch('https://github.com/login/oauth/access_token', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: p.clientId, client_secret: p.clientSecret, code, redirect_uri: retorno }) });
    const j = await r.json(); if (!j.access_token) throw erro('O GitHub não confirmou a entrada.', 401);
    const u = await (await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${j.access_token}`, 'User-Agent': 'Portal-Solar', Accept: 'application/vnd.github+json' } })).json();
    return { id: String(u.id), quem: u.login, nome: u.name || u.login, email: (u.email || '').toLowerCase() };
  }
  const corpo = new URLSearchParams({ code, client_id: p.clientId, client_secret: p.clientSecret, redirect_uri: retorno, grant_type: 'authorization_code', code_verifier: verificador });
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: corpo });
  const j = await r.json(); if (!j.access_token) throw erro('O Google não confirmou a entrada.', 401);
  const u = await (await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${j.access_token}` } })).json();
  if (!u.sub) throw erro('O Google não devolveu quem é você.', 401);
  return { id: String(u.sub), quem: u.email || u.name, nome: u.name || u.email, email: (u.email || '').toLowerCase() };
}

/** volta do provedor: liga a identidade à conta (se já estava dentro), entra (se já ligada) ou cria a conta (só no computador) */
export async function retornoOAuth(provedor, url, req, { local, porta }) {
  const state = url.searchParams.get('state') || '', code = url.searchParams.get('code') || '';
  const pend = pendentes.get(state); pendentes.delete(state);
  if (!pend || pend.provedor !== provedor || pend.expira < agora() || !code) throw erro('O pedido de entrada expirou ou não é deste computador. Tente de novo.', 400);
  const id = await identidade(provedor, code, pend.verificador, porta);
  let c = contas.contas.find((x) => x.provedores && x.provedores[provedor] && x.provedores[provedor].id === id.id);
  if (!c && pend.ligar) {
    c = contas.contas.find((x) => x.id === pend.ligar);
    if (c) { c.provedores = c.provedores || {}; c.provedores[provedor] = { id: id.id, quem: id.quem, ligado: new Date().toISOString() }; gravarJson(ARQ_CONTAS, contas); }
  }
  if (!c && !contas.contas.length && local) {
    c = { id: randomBytes(9).toString('base64url'), nome: id.nome, email: id.email, criada: new Date().toISOString(), senha: null, provedores: { [provedor]: { id: id.id, quem: id.quem, ligado: new Date().toISOString() } } };
    contas.contas.push(c); gravarJson(ARQ_CONTAS, contas);
  }
  if (!c) throw erro('Essa conta de ' + provedor + ' não está ligada a esta casa. Entre com a senha e ligue a rede na página Conta.', 403);
  return { cookie: abrirSessao(c, req) };
}

/** grava as chaves dos aplicativos OAuth (só no computador; campo vazio = deixa como está; "apagar" = tira) */
export function gravarProvedores(corpo) {
  const atual = lerJson(ARQ_PROVEDORES, {});
  for (const k of ['github', 'google']) {
    const v = corpo && corpo[k];
    if (!v) continue;
    if (v.apagar) { delete atual[k]; continue; }
    const id = String(v.clientId || '').trim(), seg = String(v.clientSecret || '').trim();
    if (!id && !seg) continue;
    if (id.length > 200 || seg.length > 200 || /\s/.test(id + seg)) throw erro('Chave estranha para ' + k + ': copie de novo, sem espaços.');
    atual[k] = { clientId: id || (atual[k] && atual[k].clientId) || '', clientSecret: seg || (atual[k] && atual[k].clientSecret) || '' };
  }
  gravarJson(ARQ_PROVEDORES, atual);
  const p = provedores();
  return { github: !!p.github, google: !!p.google };
}

/* ---------- a digital do aparelho (passkeys) ----------
   Ligar: você já entrou (com a senha) pelo endereço do túnel, e o aparelho cria uma chave só para
   este endereço. Entrar: o aparelho assina um desafio com ela. O servidor guarda só a chave pública. */
const desafios = new Map(); /* desafio → { tipo, conta, expira } */
function lugarDasChaves() {
  const base = enderecoPublico();
  if (!base) throw erro('Primeiro o endereço de fora de casa (o túnel https): a digital fica presa a ele.', 409);
  return { origem: base, rpId: new URL(base).hostname };
}
function limparDesafios() { for (const [k, d] of desafios) if (d.expira < agora()) desafios.delete(k); }

export function opcoesChave(tipo, req) {
  limparDesafios();
  const { rpId } = lugarDasChaves();
  const desafio = randomBytes(32).toString('base64url');
  if (tipo === 'ligar') {
    const c = sessaoDe(req); if (!c) throw erro('Entre primeiro (com a senha), depois ligue a digital deste aparelho.', 401);
    desafios.set(desafio, { tipo, conta: c.id, expira: agora() + 5 * 60 * 1000 });
    return { publicKey: {
      challenge: desafio, rp: { id: rpId, name: 'Portal Solar' },
      user: { id: Buffer.from(c.id).toString('base64url'), name: c.email || c.nome, displayName: c.nome },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -8 }, { type: 'public-key', alg: -257 }],
      timeout: 120000, attestation: 'none', authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
      excludeCredentials: (c.chaves || []).map((k) => ({ type: 'public-key', id: k.id })),
    } };
  }
  const todas = contas.contas.flatMap((x) => (x.chaves || []));
  if (!todas.length) throw erro('Nenhum aparelho com a digital ligada ainda: entre com a senha e ligue na página Conta.', 404);
  desafios.set(desafio, { tipo: 'entrar', expira: agora() + 5 * 60 * 1000 });
  return { publicKey: { challenge: desafio, rpId, timeout: 120000, userVerification: 'preferred', allowCredentials: todas.map((k) => ({ type: 'public-key', id: k.id })) } };
}
function tirarDesafio(clientDataJSON, tipo) {
  let c; try { c = JSON.parse(Buffer.from(String(clientDataJSON || ''), 'base64url').toString('utf8')); } catch { throw erro('Resposta do navegador ilegível.'); }
  const d = desafios.get(c.challenge); desafios.delete(c.challenge);
  if (!d || d.tipo !== tipo || d.expira < agora()) throw erro('O pedido expirou. Tente de novo.', 400);
  return { ...d, desafio: c.challenge };
}

export function ligarChave({ id, clientDataJSON, attestationObject, aparelho }, req) {
  const c = sessaoDe(req); if (!c) throw erro('Entre primeiro.', 401);
  const { origem, rpId } = lugarDasChaves();
  const d = tirarDesafio(clientDataJSON, 'ligar');
  if (d.conta !== c.id) throw erro('Este pedido é de outra sessão.', 403);
  lerClientData(clientDataJSON, { tipo: 'webauthn.create', desafio: d.desafio, origem });
  const { valor: att } = cborDe(attestationObject);
  const ad = lerAuthData(att.get('authData'));
  if (!ad.rpIdHash.equals(sha256(rpId))) throw erro('A chave é de outro endereço.');
  if (!ad.presente) throw erro('O aparelho não confirmou a sua presença.');
  if (!ad.credencial) throw erro('O aparelho não mandou a chave.');
  const idB64 = ad.credencial.id.toString('base64url');
  if (id && id !== idB64) throw erro('A chave não confere.');
  if (contas.contas.some((x) => (x.chaves || []).some((k) => k.id === idB64))) throw erro('Este aparelho já está ligado.', 409);
  const { jwk, alg } = coseParaJwk(ad.credencial.cose);
  c.chaves = c.chaves || [];
  c.chaves.push({ id: idB64, jwk, alg, contador: ad.contador, aparelho: String(aparelho || '').slice(0, 60) || aparelhoDe(req), criada: new Date().toISOString() });
  gravarJson(ARQ_CONTAS, contas);
  return { conta: publico(c) };
}
function cborDe(b64) { return cbor(Buffer.from(String(b64 || ''), 'base64url')); }

export function entrarComChave({ id, clientDataJSON, authenticatorData, signature }, req) {
  const ip = req.socket.remoteAddress || '?';
  checarBloqueio(ip);
  const { origem, rpId } = lugarDasChaves();
  const d = tirarDesafio(clientDataJSON, 'entrar');
  const c = contas.contas.find((x) => (x.chaves || []).some((k) => k.id === id));
  const k = c && c.chaves.find((x) => x.id === id);
  if (!k) { falhou(ip); throw erro('Este aparelho não está ligado a esta casa.', 401); }
  lerClientData(clientDataJSON, { tipo: 'webauthn.get', desafio: d.desafio, origem });
  const adBuf = Buffer.from(String(authenticatorData || ''), 'base64url');
  const ad = lerAuthData(adBuf);
  if (!ad.rpIdHash.equals(sha256(rpId))) { falhou(ip); throw erro('A digital é de outro endereço.', 401); }
  if (!ad.presente) { falhou(ip); throw erro('O aparelho não confirmou a sua presença.', 401); }
  const dados = Buffer.concat([adBuf, sha256(Buffer.from(String(clientDataJSON), 'base64url'))]);
  if (!verificarAssinatura(k, dados, Buffer.from(String(signature || ''), 'base64url'))) { falhou(ip); throw erro('A assinatura não confere.', 401); }
  if ((ad.contador || k.contador) && ad.contador <= k.contador) { falhou(ip); throw erro('Este aparelho parece clonado (o contador voltou). Por segurança, entre com a senha.', 401); }
  k.contador = ad.contador; k.usada = new Date().toISOString();
  gravarJson(ARQ_CONTAS, contas);
  falhas.delete(ip);
  return { conta: publico(c), cookie: abrirSessao(c, req) };
}

export function apagarChave({ id }, req, { local }) {
  const c = sessaoDe(req) || (local ? contaDona() : null);
  if (!c) throw erro('Entre primeiro.', 401);
  const antes = (c.chaves || []).length;
  c.chaves = (c.chaves || []).filter((k) => k.id !== id);
  if (c.chaves.length === antes) throw erro('Não achei esse aparelho.', 404);
  gravarJson(ARQ_CONTAS, contas);
  return { conta: publico(c) };
}
function aparelhoDe(req) { const ua = String(req.headers['user-agent'] || ''); return /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Macintosh/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'aparelho'; }

export function desligarProvedor(provedor, req) {
  const c = sessaoDe(req); if (!c) throw erro('Entre primeiro.', 401);
  if (!c.provedores || !c.provedores[provedor]) return { ok: true };
  if (!c.senha && Object.keys(c.provedores).length === 1) throw erro('Crie uma senha antes: senão você fica sem como entrar.', 409);
  delete c.provedores[provedor]; gravarJson(ARQ_CONTAS, contas);
  return { ok: true };
}
