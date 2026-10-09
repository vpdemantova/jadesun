/* ============================================================
   A DIGITAL DO APARELHO (passkeys, WebAuthn) — 09/out/2026, PERFIL.md item 75
   Só as contas: ler o CBOR que o aparelho manda, tirar a chave pública e conferir a assinatura.
   Nada de biblioteca de fora: o node:crypto já sabe verificar ES256, RS256 e Ed25519.
   O estado (os desafios, as chaves ligadas, as sessões) mora em contas.mjs.
   ============================================================ */
import { createPublicKey, verify, constants, createHash } from 'node:crypto';

const erro = (msg, status = 400) => Object.assign(new Error(msg), { status });

/* ---------- CBOR (RFC 8949), o necessário para o WebAuthn: inteiros, bytes, texto, listas, mapas, simples ---------- */
export function cbor(buf, ini = 0) {
  let i = ini;
  const u8 = () => buf[i++];
  function tamanho(info) {
    if (info < 24) return info;
    if (info === 24) return u8();
    if (info === 25) { const v = buf.readUInt16BE(i); i += 2; return v; }
    if (info === 26) { const v = buf.readUInt32BE(i); i += 4; return v; }
    if (info === 27) { const v = buf.readBigUInt64BE(i); i += 8; if (v > BigInt(Number.MAX_SAFE_INTEGER)) throw erro('CBOR: número grande demais.'); return Number(v); }
    throw erro('CBOR: comprimento indefinido não é aceito.');
  }
  function ler() {
    if (i >= buf.length) throw erro('CBOR: acabou antes da hora.');
    const b = u8(), tipo = b >> 5, info = b & 31;
    if (tipo === 0) return tamanho(info);
    if (tipo === 1) return -1 - tamanho(info);
    if (tipo === 2) { const n = tamanho(info); const v = buf.subarray(i, i + n); i += n; return Buffer.from(v); }
    if (tipo === 3) { const n = tamanho(info); const v = buf.toString('utf8', i, i + n); i += n; return v; }
    if (tipo === 4) { const n = tamanho(info); const v = []; for (let k = 0; k < n; k++) v.push(ler()); return v; }
    if (tipo === 5) { const n = tamanho(info); const m = new Map(); for (let k = 0; k < n; k++) { const ch = ler(); m.set(ch, ler()); } return m; }
    if (tipo === 6) { tamanho(info); return ler(); } /* etiqueta: ignora e lê o valor */
    if (tipo === 7) {
      if (info === 20) return false; if (info === 21) return true; if (info === 22) return null; if (info === 23) return undefined;
      if (info === 25) { const v = buf.readUInt16BE(i); i += 2; return v; }
      if (info === 26) { const v = buf.readFloatBE(i); i += 4; return v; }
      if (info === 27) { const v = buf.readDoubleBE(i); i += 8; return v; }
    }
    throw erro('CBOR: tipo não esperado.');
  }
  const valor = ler();
  return { valor, fim: i };
}

/* ---------- authenticatorData: o que o aparelho assina ---------- */
export function lerAuthData(ad) {
  if (!Buffer.isBuffer(ad) || ad.length < 37) throw erro('Dados do aparelho curtos demais.');
  const r = { rpIdHash: ad.subarray(0, 32), flags: ad[32], contador: ad.readUInt32BE(33) };
  r.presente = !!(r.flags & 0x01); r.verificado = !!(r.flags & 0x04);
  if (r.flags & 0x40) {
    let i = 37;
    const aaguid = ad.subarray(i, i + 16); i += 16;
    const n = ad.readUInt16BE(i); i += 2;
    const id = Buffer.from(ad.subarray(i, i + n)); i += n;
    const { valor } = cbor(ad, i);
    r.credencial = { aaguid, id, cose: valor };
  }
  return r;
}

/* ---------- a chave pública: COSE → JWK ---------- */
const b64u = (b) => Buffer.from(b).toString('base64url');
export function coseParaJwk(cose) {
  if (!(cose instanceof Map)) throw erro('Chave do aparelho ilegível.');
  const kty = cose.get(1), alg = cose.get(3);
  if (kty === 2 && alg === -7 && cose.get(-1) === 1) return { alg, jwk: { kty: 'EC', crv: 'P-256', x: b64u(cose.get(-2)), y: b64u(cose.get(-3)) } };
  if (kty === 1 && alg === -8 && cose.get(-1) === 6) return { alg, jwk: { kty: 'OKP', crv: 'Ed25519', x: b64u(cose.get(-2)) } };
  if (kty === 3 && alg === -257) return { alg, jwk: { kty: 'RSA', n: b64u(cose.get(-1)), e: b64u(cose.get(-2)) } };
  throw erro('Este aparelho usa um tipo de chave que o Portal ainda não lê.');
}

export function verificarAssinatura({ jwk, alg }, dados, assinatura) {
  const chave = createPublicKey({ key: jwk, format: 'jwk' });
  if (alg === -7) return verify('sha256', dados, { key: chave, dsaEncoding: 'der' }, assinatura);
  if (alg === -257) return verify('sha256', dados, { key: chave, padding: constants.RSA_PKCS1_PADDING }, assinatura);
  if (alg === -8) return verify(null, dados, chave, assinatura);
  return false;
}

/* ---------- o clientDataJSON: o tipo, o desafio e a origem que o navegador viu ---------- */
export function lerClientData(b64, { tipo, desafio, origem }) {
  let c;
  try { c = JSON.parse(Buffer.from(String(b64 || ''), 'base64url').toString('utf8')); } catch { throw erro('Resposta do navegador ilegível.'); }
  if (c.type !== tipo) throw erro('Resposta do tipo errado.');
  if (c.challenge !== desafio) throw erro('O desafio não confere (a página ficou aberta tempo demais?). Tente de novo.');
  if (c.origin !== origem) throw erro('Esta digital é de outro endereço (' + c.origin + ').');
  return c;
}

export const sha256 = (b) => createHash('sha256').update(b).digest();
