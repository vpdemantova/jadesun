/* ============================================================
   A ficha que se compartilha (08/out/2026, PERFIL.md item 72)
   · vitrine({ tudo }) monta a ficha a partir dos arquivos do perfil.
     Sem "tudo", só entra o que está marcado como público: a Ficha.md com
     visibilidade: publico, e os itens (coleção, feitos, pessoas) públicos.
     Com "tudo" (só para o dono, na página Eu), entra tudo, marcado.
   · lerFichaRemota(url) abre a ficha de outra pessoa pelo link (outro
     Portal Solar, um site exportado, ou um arquivo .md que viaja).
   Usa os mesmos leitores do navegador (entradas.js e ficha.js).
   ============================================================ */
import { createRequire } from 'node:module';
import { lerPerfil } from './perfil.mjs';
import { obterObras } from './obras.mjs';

const require = createRequire(import.meta.url);
const E = require('../entradas.js');
const F = require('../ficha.js');

const GRUPOS = { ler: 'Ler', assistir: 'Assistir', ouvir: 'Ouvir', ver: 'Ver', aprender: 'Aprender', pessoas: 'Pessoas', lugares: 'Lugares', fazer: 'Fazer', palavras: 'Palavras', links: 'Links' };
const PADRAO = { 'col-ler': 'ler', 'col-filmes': 'assistir', 'col-series': 'assistir', 'col-ouvir': 'ouvir', 'col-ver': 'ver', 'col-palavras': 'palavras', 'col-aprender': 'aprender', 'col-lugares': 'lugares', 'col-fazer': 'fazer', 'col-links': 'links' };

function grupoDe(categoria, arq) {
  const s = String(categoria || '').trim();
  const g = (s.includes('/') ? s.slice(0, s.indexOf('/')) : s).trim().toLowerCase();
  return GRUPOS[g] || GRUPOS[PADRAO[arq]] || 'Estante';
}
const publico = (vis) => String(vis || 'privado').toLowerCase() === 'publico';

export async function vitrine({ tudo = false } = {}) {
  const a = await lerPerfil();
  const f = a.ficha && a.ficha.existe ? F.ler(a.ficha.texto) : null;
  const fichaPublica = !!(f && publico(f.visibilidade));
  if (!tudo && !fichaPublica) return { versao: 1, publica: false, existe: !!f, gerado: new Date().toISOString() };
  const vale = (vis) => tudo || publico(vis);

  const estante = [];
  for (const arq of Object.keys(PADRAO)) {
    const x = a[arq];
    if (!x || !x.existe || !x.texto.trim()) continue;
    for (const e of E.ler(x.texto).entradas) {
      if (!vale(e.visibilidade)) continue;
      const ex = e.extra || {};
      estante.push({ grupo: grupoDe(e.categoria, arq), titulo: e.titulo, por: ex.por || '', url: ex.url || '', nota: +ex.nota || 0, fav: ex.favorito === 'sim', corpo: (e.corpo || '').slice(0, 400), quando: e.quando || '', vis: e.visibilidade || 'privado' });
    }
  }
  estante.sort((x, y) => (y.fav - x.fav) || String(y.quando).localeCompare(String(x.quando)));

  const caminho = [];
  if (a.feitos && a.feitos.existe) for (const e of E.ler(a.feitos.texto).entradas) if (vale(e.visibilidade)) caminho.push({ quando: e.quando || '', titulo: e.titulo, corpo: (e.corpo || '').slice(0, 300), vis: e.visibilidade || 'privado' });
  caminho.sort((x, y) => E.ano(y.quando).chave - E.ano(x.quando).chave);

  const elos = [];
  if (a['col-pessoas'] && a['col-pessoas'].existe) for (const e of E.ler(a['col-pessoas'].texto).entradas) if (vale(e.visibilidade)) elos.push({ titulo: e.titulo, corpo: (e.corpo || '').slice(0, 300), url: (e.extra || {}).url || '', vis: e.visibilidade || 'privado' });

  let obra = [];
  try { obra = (await obterObras()).categorias.filter((c) => (Array.isArray(c.pecas) ? c.pecas.length : c.pecas) && !/\.md$/.test(c.nome)).map((c) => ({ nome: c.nome, pecas: Array.isArray(c.pecas) ? c.pecas.length : +c.pecas || 0 })); } catch { obra = []; }

  const linha1 = (t) => String(t || '').replace(/^---\n[\s\S]*?\n---\n?/, '').split('\n').map((l) => l.trim()).filter((l) => l && !/^[#>]/.test(l))[0] || '';
  return {
    versao: 1, publica: fichaPublica, existe: !!f, gerado: new Date().toISOString(),
    nome: f ? f.nome : '', oficio: f ? f.oficio : linha1(a.capacidades && a.capacidades.texto), area: f ? f.area : '', onde: f ? f.onde : '',
    frase: f ? f.frase : '', quemE: f ? f.quemE : [linha1(a.capacidades && a.capacidades.texto), linha1(a.estudos && a.estudos.texto)].filter(Boolean).join('\n\n'),
    voz: f ? f.voz : '', estante, caminho, obra, elos,
  };
}

/* ---------- a ficha de outra pessoa, pelo link ---------- */
const PRIVADO = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|\[?::1\]?$|.*\.local$)|^172\.(1[6-9]|2\d|3[01])\./i;

async function pegar(u) {
  const r = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json, text/markdown, text/plain, text/html' } });
  if (!r.ok) throw new Error(`O endereço respondeu ${r.status}.`);
  const tipo = r.headers.get('content-type') || '';
  const corpo = await r.text();
  if (corpo.length > 1_000_000) throw new Error('A resposta é grande demais para ser uma ficha.');
  return { tipo, corpo };
}

export async function lerFichaRemota(endereco) {
  let u;
  try { u = new URL(String(endereco || '').trim()); } catch { throw Object.assign(new Error('Isso não parece um link. Cole o endereço inteiro, com https://'), { status: 400 }); }
  if (!/^https?:$/.test(u.protocol)) throw Object.assign(new Error('Só links http ou https.'), { status: 400 });
  if (PRIVADO.test(u.hostname) && process.env.REDE_LOCAL !== '1') throw Object.assign(new Error('Por segurança, links de dentro da rede local não são abertos por aqui. Peça o arquivo .md da ficha e use "Receber um arquivo".'), { status: 400 });
  const tentativas = /\.(json|md)$/i.test(u.pathname) ? [u.href] : [new URL('api/vitrine.json', u).href, new URL('/api/vitrine', u).href, new URL('vitrine.json', u).href];
  let ultimoErro = null;
  for (const t of tentativas) {
    try {
      const { tipo, corpo } = await pegar(t);
      if (/json/.test(tipo) || /^\s*\{/.test(corpo)) {
        const v = JSON.parse(corpo);
        if (v && (v.nome !== undefined || v.publica !== undefined)) return { ...v, endereco: u.href };
      } else if (/^---\n[\s\S]*formato:\s*ficha/m.test(corpo.replace(/\r\n/g, '\n'))) {
        const f = F.ler(corpo);
        return { versao: 1, publica: true, nome: f.nome, oficio: f.oficio, area: f.area, onde: f.onde, frase: f.frase, quemE: f.quemE, voz: f.voz, estante: [], caminho: [], obra: [], elos: [], endereco: u.href, deArquivo: true };
      }
    } catch (e) { ultimoErro = e; }
  }
  throw Object.assign(new Error(ultimoErro && ultimoErro.message && !/JSON/.test(ultimoErro.message) ? `Não achei uma ficha nesse endereço (${ultimoErro.message})` : 'Não achei uma ficha nesse endereço. Ele precisa ser a página "vitrine" de um Portal Solar ou um arquivo .md de ficha.'), { status: 404 });
}
