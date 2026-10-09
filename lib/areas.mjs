/* ============================================================
   ÁREAS — o percurso inteiro de cada matéria (08/out/2026, PERFIL.md item 69)
   Mapa → Museu → Tábua → itens do Domino → Grandes Obras → Práticas → Horizonte.

   O MAPA não é escrito à mão: sai dos 129 estudos da Seleção (unidade = pasta,
   elos ← → ↔ e "Pré-requisito/Abre" = arestas, "O que se estuda" = conceitos,
   códigos de outras matérias = pontes) e do Checklist (progresso).
   O MUSEU, o HORIZONTE e as PRÁTICAS são arquivos do caderno, um por matéria,
   em `3 Atlas…/0 Áreas/<Matéria> — Museu|Horizonte|Práticas.md`
   (frontmatter `tipo: museu da matéria | horizonte da matéria | práticas da matéria`).
   Museu e Horizonte usam o mesmo formato da Tábua (## abas, - "nome — texto").
   A Tábua e as Grandes Obras continuam em lib/tabuas.mjs: aqui só se conta e se liga.
   Só a marca "Feita" das práticas é gravada (marcarPratica), no próprio arquivo.
   ============================================================ */
import { readFile, writeFile, rename, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { obterIndice, ligarTrecho, urlMidia, estudosDosItens, CODIGOS_DA_SECAO, esquecerIndice } from './biblioteca.mjs';
import { lerTabua } from './tabuas.mjs';
import { normalizar, COFRE } from './vault.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const COD_RE = /\b([A-Z]{3})-(\d{2})\b/g;
const ESTUDO_RE = /^[A-Z]{3}-\d{2}$/;
const colador = new Intl.Collator('pt', { numeric: true, sensitivity: 'base' });

/* nomes de cada prefixo, para as pontes entre áreas */
const PREFIXO_MATERIA = {};
for (const [m, ps] of Object.entries(CODIGOS_DA_SECAO)) for (const p of ps) PREFIXO_MATERIA[p] = m;

function secao(corpo, re) {
  const linhas = corpo.split(/\r?\n/);
  const i = linhas.findIndex((l) => /^##\s/.test(l) && re.test(l));
  if (i < 0) return '';
  let f = linhas.findIndex((l, k) => k > i && /^##\s/.test(l));
  if (f < 0) f = linhas.length;
  return linhas.slice(i + 1, f).join('\n').trim();
}

const limpo = (s) => String(s || '').replace(/\*\*|__|`|\*/g, '').replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/\s+/g, ' ').trim();

/** Conceitos de um estudo: as cabeças em negrito de "O que se estuda" ("**a) Leis ponderais**",
 * "**Composição.**"); se não houver, as cabeças dos itens de lista ("- **Balanceamento:** …"). */
function conceitosDe(corpo) {
  const s = secao(corpo, /O que se estuda/i);
  const cab = [];
  for (const l of s.split(/\r?\n/)) {
    const m = l.match(/^\*\*([^*]{2,80}?)\*\*/);
    if (m) cab.push(m[1]);
  }
  if (cab.length < 2) {
    for (const l of s.split(/\r?\n/)) {
      const m = l.match(/^[-*]\s+\*\*([^*]{2,60}?)\*\*/);
      if (m) cab.push(m[1]);
    }
  }
  const vistos = new Set();
  return cab.map((c) => limpo(c).replace(/^[a-z]\)\s*/i, '').replace(/[.:;,]+$/, '').trim())
    .filter((c) => c && c.length <= 70 && !vistos.has(normalizar(c)) && vistos.add(normalizar(c)))
    .slice(0, 9);
}

/** As arestas de um estudo. A linha "> **Pré-requisito:** … · **Abre:** …" diz a dependência de
 * verdade; o "**Elos:** ← [[A]] · → [[B]] · ↔ [[C]]" é só o anterior/seguinte da fila, e por isso
 * vale apenas quando a linha de pré-requisito não existe. ↔ é sempre "ao lado". */
function elosDe(corpo) {
  const pre = new Set(); const abre = new Set(); const lado = new Set();
  const ePre = new Set(); const eAbre = new Set();
  const codigos = (t) => [...t.matchAll(/\[\[([A-Z]{3}-\d{2})\b[^\]]*\]\]/g)].map((m) => m[1]).filter((c) => !c.endsWith('-00'));
  const elos = corpo.match(/^\*\*Elos:\*\*(.*)$/m);
  if (elos) {
    let modo = null;
    for (const parte of elos[1].split('·')) {
      if (parte.includes('←')) modo = ePre; else if (parte.includes('→')) modo = eAbre; else if (parte.includes('↔')) modo = lado;
      if (modo) codigos(parte).forEach((c) => modo.add(c));
    }
  }
  const p = corpo.match(/\*\*Pré-requisito:?\*\*([^\n]*?)(?:·\s*\*\*Abre|$)/m);
  if (p) codigos(p[1]).forEach((c) => pre.add(c));
  const a = corpo.match(/\*\*Abre:?\*\*([^\n]*)/m);
  if (a) codigos(a[1]).forEach((c) => abre.add(c));
  if (!p) ePre.forEach((c) => pre.add(c));
  if (!a) eAbre.forEach((c) => abre.add(c));
  return { pre, abre, lado };
}

function contarExercicios(corpo) {
  return (secao(corpo, /Exerc/i).match(/^\s*\d+\.\s/gm) || []).length;
}

function frase(corpo) {
  const m = corpo.match(/Em uma frase:\*\*\s*(.+)$/m);
  return m ? m[1].trim() : '';
}

function ordemPasta(rel, nivel) {
  const dirs = rel.split('/');
  const nome = dirs[nivel] || '';
  const m = nome.match(/^(\d+)/);
  return m ? Number(m[1]) : 99;
}

/** Profundidade de cada estudo no grafo de pré-requisitos (só dentro da área; ciclos ignorados). */
function niveis(nos) {
  const por = new Map(nos.map((n) => [n.codigo, n]));
  const memo = new Map();
  const fundo = (c, pilha) => {
    if (memo.has(c)) return memo.get(c);
    if (pilha.has(c)) return 0;
    pilha.add(c);
    const n = por.get(c);
    let d = 0;
    for (const p of n.pre) if (por.has(p)) d = Math.max(d, fundo(p, pilha) + 1);
    pilha.delete(c);
    memo.set(c, d);
    return d;
  };
  for (const n of nos) n.nivel = fundo(n.codigo, new Set());
}

/** Caminho de estudo: ordem topológica, desempate pela ordem da unidade e do código. */
function caminho(nos) {
  const por = new Map(nos.map((n) => [n.codigo, n]));
  const feitos = new Set(); const saida = [];
  const pendentes = [...nos].sort((a, b) => (a.uOrdem - b.uOrdem) || colador.compare(a.codigo, b.codigo));
  while (saida.length < nos.length) {
    const pronto = pendentes.find((n) => !feitos.has(n.codigo) && [...n.pre].every((p) => !por.has(p) || feitos.has(p)))
      || pendentes.find((n) => !feitos.has(n.codigo));
    feitos.add(pronto.codigo); saida.push(pronto.codigo);
  }
  return saida;
}

/* ---------------- Práticas ---------------- */

const FEITA_RE = /^\*Feita:\*\s*(.*)$/;
const RESPOSTA_RE = /^\*\*(Resposta|Gabarito|Como conferir|Critérios?(?: de correção)?|Para conferir)\b[^*]*\*\*\s*:?\s*(.*)$/i;

export function lerPraticas(ctx, it) {
  const niveisP = []; let nivel = null; let p = null; let intro = [];
  const fechar = () => {
    if (!p) return;
    const corpo = []; const resp = []; let destino = corpo;
    for (const l of p.linhas) {
      const f = l.match(FEITA_RE);
      if (f) { p.feita = /^(n[aã]o|—|-|)$/i.test(f[1].trim()) ? '' : f[1].trim(); continue; }
      const r = l.match(RESPOSTA_RE);
      if (r && destino === corpo) { destino = resp; p.rotuloResposta = r[1]; if (r[2]) resp.push(r[2]); continue; }
      /* os códigos da linha "*Liga:*" viram botões no cabeçalho da prática; no corpo fica só o resto (tempo, material) */
      if (/^\*Liga:\*/.test(l)) {
        const resto = l.replace(/^\*Liga:\*\s*/, '').replace(/\[\[[A-Z]{3}-\d{2}[^\]]*\]\]\s*(·\s*)?/g, '').replace(/^·\s*/, '').trim();
        if (resto) destino.push(resto);
        continue;
      }
      destino.push(l);
    }
    const bruto = p.linhas.join('\n');
    nivel.praticas.push({
      id: p.id, titulo: p.titulo, feita: p.feita || '',
      md: ligarTrecho(ctx, it, corpo.join('\n').trim()),
      resposta: ligarTrecho(ctx, it, resp.join('\n').trim()),
      rotuloResposta: p.rotuloResposta || 'Resposta',
      liga: [...new Set([...bruto.matchAll(COD_RE)].map((m) => m[0]))].filter((c) => !c.endsWith('-00')),
    });
    p = null;
  };
  for (const l of it.corpo.split(/\r?\n/)) {
    let m;
    if (/^#\s/.test(l)) continue;
    if ((m = l.match(/^##\s+(.+)$/))) { fechar(); nivel = { nome: m[1].trim(), intro: '', praticas: [], _intro: [] }; niveisP.push(nivel); continue; }
    if ((m = l.match(/^###\s+(\S+)\s*·\s*(.+)$/)) && nivel) { fechar(); p = { id: m[1].trim(), titulo: m[2].trim(), linhas: [] }; continue; }
    if (p) p.linhas.push(l); else if (nivel) nivel._intro.push(l); else intro.push(l);
  }
  fechar();
  for (const n of niveisP) { n.intro = ligarTrecho(ctx, it, n._intro.join('\n').trim()); delete n._intro; }
  return { id: it.id, titulo: it.titulo, intro: ligarTrecho(ctx, it, intro.join('\n').trim()), niveis: niveisP.filter((n) => n.praticas.length) };
}

/** Marca (ou desmarca) uma prática como feita, no próprio arquivo do caderno. */
export async function marcarPratica({ materia, id, feita }) {
  const ctx = await obterIndice();
  const arq = ctx.itens.find((i) => i.cls.acervo === 'atlas' && normalizar(i.meta.tipo || '') === 'praticas da materia' && String(i.meta.materia || '').trim() === materia);
  if (!arq) throw Object.assign(new Error('Arquivo de práticas não encontrado.'), { status: 404 });
  const caminhoArq = join(COFRE, arq.rel);
  const bruto = await readFile(caminhoArq, 'utf8');
  const eol = bruto.includes('\r\n') ? '\r\n' : '\n';
  const linhas = bruto.split(/\r?\n/);
  const ini = linhas.findIndex((l) => { const m = l.match(/^###\s+(\S+)\s*·/); return m && m[1] === id; });
  if (ini < 0) throw Object.assign(new Error('Prática não encontrada.'), { status: 404 });
  let fim = linhas.findIndex((l, k) => k > ini && /^#{1,3}\s/.test(l));
  if (fim < 0) fim = linhas.length;
  const valor = feita ? new Date().toISOString().slice(0, 10) : 'não';
  const k = linhas.slice(ini, fim).findIndex((l) => FEITA_RE.test(l));
  if (k >= 0) linhas[ini + k] = `*Feita:* ${valor}`;
  else linhas.splice(ini + 1, 0, `*Feita:* ${valor}`);
  await mkdir(join(RAIZ, 'dados'), { recursive: true });
  const copia = join(RAIZ, 'dados', `backup-praticas-${normalizar(materia).replace(/ /g, '-')}-${valor === 'não' ? new Date().toISOString().slice(0, 10) : valor}.md`);
  if (!existsSync(copia)) await copyFile(caminhoArq, copia);
  await writeFile(`${caminhoArq}.tmp`, linhas.join(eol), 'utf8');
  await rename(`${caminhoArq}.tmp`, caminhoArq);
  esquecerIndice();
  return { ok: true, feita: feita ? valor : '' };
}

/* ---------------- montagem ---------------- */

export async function areas(checklist, { resumo = false, so = '', mapa = false } = {}) {
  const ctx = await obterIndice();
  const itensDosEstudos = checklist ? await estudosDosItens(checklist) : {};
  const porCodigoItens = {};
  for (const s of checklist || []) {
    for (const it of s.itens) {
      for (const e of itensDosEstudos[`${s.nome}|${it.texto}`] || []) {
        (porCodigoItens[e.codigo] = porCodigoItens[e.codigo] || []).push({ texto: it.texto, feito: !!it.feito });
      }
    }
  }

  const estudos = ctx.itens.filter((i) => i.cls.acervo === 'selecao' && ESTUDO_RE.test(i.codigo) && !i.codigo.endsWith('-00'));
  const mapasGerais = ctx.itens.filter((i) => i.cls.acervo === 'selecao' && /^[A-Z]{3}-00$/.test(i.codigo));
  const titulo = (c) => { const id = ctx.porCodigo.get(normalizar(c)); return id ? ctx.porId.get(id).titulo : c; };
  const idDe = (c) => ctx.porCodigo.get(normalizar(c)) || null;

  /* arquivos escritos à mão, por matéria */
  const escritos = {};
  for (const it of ctx.itens) {
    if (it.cls.acervo !== 'atlas' || !it.meta.materia) continue;
    const tipo = normalizar(it.meta.tipo || '');
    const m = String(it.meta.materia).trim();
    const e = (escritos[m] = escritos[m] || {});
    if (tipo === 'museu da materia') e.museu = it;
    else if (tipo === 'horizonte da materia') e.horizonte = it;
    else if (tipo === 'praticas da materia') e.praticas = it;
    else if (tipo === 'tabua da materia') e.tabua = it;
    else if (tipo === 'estudo de obra') (e.obras = e.obras || []).push(it);
  }

  const saida = {};
  for (const [nome, prefixos] of Object.entries(CODIGOS_DA_SECAO)) {
    if (so && so !== nome) continue;
    const daArea = estudos.filter((i) => prefixos.includes(i.codigo.slice(0, 3)));
    const dentro = new Set(daArea.map((i) => i.codigo));
    const unidades = new Map();
    const nos = daArea.map((i) => {
      /* Linguagens: a unidade é a sub-matéria (Língua Portuguesa, Literatura…); nas outras, a pasta da unidade */
      const multi = prefixos.length > 1;
      const unidade = multi ? i.cls.secao : (i.cls.sub || i.meta.unidade || i.cls.secao);
      const uOrdem = multi ? prefixos.indexOf(i.codigo.slice(0, 3)) : ordemPasta(i.rel, 4);
      if (!unidades.has(unidade)) unidades.set(unidade, { nome: unidade, ordem: uOrdem });
      const { pre, abre, lado } = elosDe(i.corpo);
      const fora = new Map();
      for (const m of i.corpo.matchAll(/\[\[([A-Z]{3}-\d{2})\b[^\]]*\]\]/g)) {
        const c = m[1];
        if (c.endsWith('-00') || dentro.has(c) || !PREFIXO_MATERIA[c.slice(0, 3)]) continue;
        fora.set(c, (fora.get(c) || 0) + 1);
      }
      const itensCk = porCodigoItens[i.codigo] || [];
      return {
        codigo: i.codigo, id: i.id, titulo: i.titulo.replace(/^[A-Z]{3}-\d{2}\s*·\s*/, ''),
        unidade, uOrdem,
        frase: ligarTrecho(ctx, i, frase(i.corpo)),
        programa: i.meta.programa || '', prioridade: i.meta.prioridade || '',
        conceitos: conceitosDe(i.corpo),
        pre: [...pre].filter((c) => dentro.has(c) && c !== i.codigo),
        abre: [...abre].filter((c) => dentro.has(c) && c !== i.codigo),
        lado: [...lado].filter((c) => dentro.has(c) && c !== i.codigo),
        fora: [...fora].sort((a, b) => b[1] - a[1]).map(([c]) => ({ codigo: c, titulo: titulo(c).replace(/^[A-Z]{3}-\d{2}\s*·\s*/, ''), id: idDe(c), materia: PREFIXO_MATERIA[c.slice(0, 3)] })),
        exercicios: contarExercicios(i.corpo),
        capa: i.capa ? urlMidia(i.capa) : null,
        itens: itensCk,
        museu: [], praticas: [],
      };
    });
    /* arestas sempre nos dois sentidos */
    const por = new Map(nos.map((n) => [n.codigo, n]));
    for (const n of nos) {
      for (const c of n.pre) { const o = por.get(c); if (o && !o.abre.includes(n.codigo)) o.abre.push(n.codigo); }
      for (const c of n.abre) { const o = por.get(c); if (o && !o.pre.includes(n.codigo)) o.pre.push(n.codigo); }
    }
    niveis(nos);
    nos.sort((a, b) => (a.uOrdem - b.uOrdem) || colador.compare(a.codigo, b.codigo));

    const e = escritos[nome] || {};
    const museu = e.museu ? lerTabua(ctx, e.museu) : null;
    const horizonte = e.horizonte ? lerTabua(ctx, e.horizonte) : null;
    const praticas = e.praticas ? lerPraticas(ctx, e.praticas) : null;

    /* liga peças do museu e práticas aos estudos do mapa */
    if (museu) {
      museu.categorias.forEach((cat, ci) => cat.blocos.forEach((b) => {
        if (b.t !== 'lista') return;
        for (const en of b.entradas) {
          for (const m of String(en.texto || '').matchAll(COD_RE)) {
            const n = por.get(m[0]);
            if (n && !n.museu.some((x) => x.nome === en.nome)) n.museu.push({ nome: en.nome || limpo(en.nomeMd), sala: ci });
          }
        }
      }));
    }
    if (praticas) {
      for (const nv of praticas.niveis) for (const p of nv.praticas) for (const c of p.liga) { const n = por.get(c); if (n) n.praticas.push({ id: p.id, titulo: p.titulo }); }
    }

    /* galeria: as imagens que os estudos da área já têm, com crédito, sem repetir */
    const vistas = new Set(); const galeria = [];
    for (const i of daArea.sort((a, b) => colador.compare(a.codigo, b.codigo))) {
      for (const img of i.imagens) {
        if (vistas.has(img.rel)) continue;
        vistas.add(img.rel);
        galeria.push({ src: urlMidia(img.rel), legenda: limpo(img.legenda), autor: img.autor, licenca: img.licenca, fonte: img.fonte, codigo: i.codigo });
      }
    }

    /* horizonte gerado: onde vive no mundo real, leituras acadêmicas e pontes, estudo a estudo */
    const mundo = []; const leituras = [];
    for (const i of daArea) {
      const s6 = secao(i.corpo, /mundo real/i);
      if (s6) mundo.push({ codigo: i.codigo, id: i.id, titulo: titulo(i.codigo), md: ligarTrecho(ctx, i, s6) });
      const ac = secao(i.corpo, /^##\s.*Fontes/).match(/^\*\*Acad[êe]micas:?\*\*:?\s*(.+)$/m);
      if (ac) leituras.push({ codigo: i.codigo, id: i.id, md: ligarTrecho(ctx, i, ac[1]) });
    }
    const pontes = {};
    for (const n of nos) for (const f of n.fora) {
      const p = (pontes[f.materia] = pontes[f.materia] || { materia: f.materia, total: 0, pares: [] });
      p.total += 1;
      if (p.pares.length < 40) p.pares.push({ de: n.codigo, deTitulo: n.titulo, para: f.codigo, paraTitulo: f.titulo });
    }

    const tot = nos.reduce((a, n) => { a.itens += n.itens.length; a.feitos += n.itens.filter((x) => x.feito).length; a.ex += n.exercicios; return a; }, { itens: 0, feitos: 0, ex: 0 });
    const pratTot = praticas ? praticas.niveis.reduce((a, nv) => { a.total += nv.praticas.length; a.feitas += nv.praticas.filter((p) => p.feita).length; return a; }, { total: 0, feitas: 0 }) : { total: 0, feitas: 0 };

    /* próximo passo: o primeiro estudo do caminho com item do Checklist ainda não dominado;
       se todos os itens ligados estão dominados, a primeira prática ainda não feita */
    const situacao = (n) => (!n.itens.length ? 'sem-item' : n.itens.every((x) => x.feito) ? 'dominado' : n.itens.some((x) => x.feito) ? 'parcial' : 'pendente');
    for (const n of nos) n.situacao = situacao(n);
    let proximo = null;
    const alvo = caminho(nos).map((c) => por.get(c)).find((n) => n.situacao === 'pendente' || n.situacao === 'parcial');
    if (alvo) {
      /* a base sem item no Checklist (o progresso dela não é medido) que vem antes do alvo */
      const ante = new Set(); const pilha = [...alvo.pre];
      while (pilha.length) { const c = pilha.pop(); if (ante.has(c)) continue; ante.add(c); pilha.push(...(por.get(c) ? por.get(c).pre : [])); }
      const base = caminho(nos).filter((c) => ante.has(c) && por.get(c).situacao === 'sem-item');
      proximo = { tipo: 'estudo', codigo: alvo.codigo, titulo: alvo.titulo, id: alvo.id, base };
    }
    else if (praticas) {
      for (const nv of praticas.niveis) { const p = nv.praticas.find((x) => !x.feita); if (p) { proximo = { tipo: 'pratica', codigo: p.id, titulo: p.titulo }; break; } }
    }

    saida[nome] = {
      proximo,
      nome, prefixos,
      gerais: prefixos.map((p) => mapasGerais.find((m) => m.codigo === `${p}-00`)).filter(Boolean).map((m) => ({ id: m.id, titulo: m.titulo })),
      unidades: [...unidades.values()].sort((a, b) => a.ordem - b.ordem),
      nos, caminho: caminho(nos),
      museu, galeria,
      horizonte, mundo, leituras, pontes: Object.values(pontes).sort((a, b) => b.total - a.total),
      praticas,
      tem: { tabua: !!e.tabua, obras: (e.obras || []).length },
      contas: { estudos: nos.length, itens: tot.itens, dominados: tot.feitos, exercicios: tot.ex, praticas: pratTot.total, praticasFeitas: pratTot.feitas, imagens: galeria.length },
    };
  }
  if (resumo) {
    for (const m of Object.values(saida)) {
      saida[m.nome] = { nome: m.nome, proximo: m.proximo, contas: m.contas, unidades: m.unidades.length, tem: m.tem,
        escritos: { museu: !!m.museu, horizonte: !!m.horizonte, praticas: !!m.praticas } };
    }
  }
  /* ?mapa=1 (item 74): só o esqueleto que o Domínio precisa — unidades, estudos, conceitos, itens e ligações
     (sem museu, galeria e horizonte, que pesam mais de 1 MB) */
  if (mapa) {
    for (const m of Object.values(saida)) {
      saida[m.nome] = {
        nome: m.nome, proximo: m.proximo, contas: m.contas, unidades: m.unidades, caminho: m.caminho, gerais: m.gerais,
        nos: m.nos.map((n) => ({
          codigo: n.codigo, id: n.id, titulo: n.titulo, unidade: n.unidade, uOrdem: n.uOrdem, frase: n.frase, programa: n.programa,
          prioridade: n.prioridade, conceitos: n.conceitos, pre: n.pre, abre: n.abre, lado: n.lado,
          fora: (n.fora || []).map((f) => ({ codigo: f.codigo, titulo: f.titulo, materia: f.materia })),
          exercicios: n.exercicios, capa: n.capa, itens: n.itens, nivel: n.nivel, situacao: n.situacao,
          museu: (n.museu || []).length, praticas: (n.praticas || []).length,
        })),
      };
    }
  }
  return { gerado: ctx.gerado, ordem: Object.keys(CODIGOS_DA_SECAO), materias: saida };
}

/* ============================================================
   AUDITORIA (08/out/2026) — só LÊ e PROPÕE; nunca move nem apaga conteúdo.
   `node auditar-areas.mjs` grava o relatório em `0 Áreas/Auditoria das áreas.md`;
   `/api/areas/auditoria` devolve o mesmo em JSON.
   1. Duplicidades: entradas com o mesmo nome em Tábua, Museu e Horizonte, classificadas
      em "mesma ficha" (as duas apontam para a mesma ficha do Atlas), "texto repetido"
      ou "mesmo nome, outro ângulo", com a origem de cada uma e uma proposta reversível
      (qual fica como principal e qual vira referência), mais a confiança.
   2. Categorias: uma proposta de categoria canônica + aliases, por sobreposição de
      palavras e de um pequeno dicionário de sinônimos, com a origem e a confiança.
   3. Sem lugar: só PEÇAS (museu) contam como "sem estudo"; profissões, caminhos
      acadêmicos, recursos e fronteiras se ligam à área e não precisam de código.
   4. Pontes entre áreas.
   ============================================================ */
const PARADAS = new Set(['o', 'a', 'os', 'as', 'de', 'da', 'do', 'das', 'dos', 'e', 'no', 'na', 'nos', 'nas', 'em', 'que', 'para', 'com', 'ir', 'mais', 'um', 'uma', 'ao', 'por', 'the']);
/* o dicionário é curto de propósito: cada linha é uma decisão que dá para rever */
const SINONIMOS = {
  nomes: 'pessoas', pessoas: 'pessoas', obras: 'obras', livros: 'obras', leituras: 'obras', leitura: 'obras',
  objetos: 'objetos', objeto: 'objetos', instrumentos: 'objetos', tecnicas: 'objetos', laboratorio: 'objetos',
  lugares: 'lugares', lugar: 'lugares', monumentos: 'lugares', acervos: 'lugares', memoria: 'lugares',
  momentos: 'momentos', experimentos: 'momentos', documentos: 'documentos', fontes: 'documentos',
  conceitos: 'conceitos', ideias: 'conceitos', profissoes: 'profissoes', mercado: 'profissoes',
  caminhos: 'academia', academicos: 'academia', graduacao: 'academia', fundo: 'aprofundar', fronteira: 'pontes',
  casa: 'cotidiano', rua: 'cotidiano', dia: 'cotidiano', bolso: 'cotidiano', fundamentos: 'fundamentos',
};
/* cabeças de seção que não nomeiam um assunto (lista revisável) */
const GENERICOS = new Set(['contexto', 'conceitos', 'autores', 'aplicacoes', 'operacoes', 'economia', 'politica', 'sociedade', 'cultura', 'periodos', 'caracteristicas', 'exemplos', 'definicao', 'tipos', 'origem', 'classificacao', 'introducao', 'resumo', 'obras', 'religiao']);
const chaveNome = (s) => normalizar(limpo(s)).replace(/^(o|a|os|as) /, '');
const palavras = (s) => normalizar(limpo(s)).split(' ').filter((w) => w && !PARADAS.has(w));
const ideias = (s) => new Set(palavras(s).map((w) => SINONIMOS[w] || w.slice(0, 6)));
const jaccard = (a, b) => { const A = new Set(a), B = new Set(b); let i = 0; for (const x of A) if (B.has(x)) i++; return i / (A.size + B.size - i || 1); };

/* o papel de cada entrada, pela aba em que ela está */
function papelDe(fonte, aba) {
  if (fonte === 'Tábua') return 'nome da tábua';
  if (fonte === 'Museu') return 'peça';
  const n = normalizar(aba);
  if (/profiss|mercado/.test(n)) return 'profissão';
  if (/caminho|academ/.test(n)) return 'caminho acadêmico';
  if (/fundo|leitura|livro|curso|dado|ferrament/.test(n)) return 'recurso';
  if (/fronteira|ponte/.test(n)) return 'fronteira';
  return 'outro';
}
/* a proposta segue a vocação de cada módulo: nomes e livros na Tábua; coisas com endereço no Museu; trabalho e estudo no Horizonte */
const VOCACAO = { 'nome da tábua': 3, peça: 2, profissão: 1, 'caminho acadêmico': 1, recurso: 1, fronteira: 1, outro: 0 };

export async function auditarAreas(checklist) {
  const { tabuasEObras } = await import('./tabuas.mjs');
  const [{ materias }, tes, itensEstudos] = await Promise.all([areas(checklist), tabuasEObras(), estudosDosItens(checklist || [])]);
  const nomes = Object.keys(materias);
  const r = { gerado: new Date().toISOString(), duplicidades: [], categorias: { grupos: [], possiveis: [] }, conceitos: { genericos: [], compartilhados: [] }, semLugar: {}, ligadosAArea: {}, pontes: {} };

  const entradasDe = (doc, fonte, materia) => {
    const out = [];
    for (const c of (doc && doc.categorias) || []) {
      let sub = '';
      for (const b of c.blocos) {
        if (b.t === 'h') sub = b.texto;
        if (b.t !== 'lista') continue;
        for (const e of b.entradas) {
          const nome = e.nome || limpo(String(e.nomeMd || '').replace(/\]\(#[^)]*\)/g, ']').replace(/[[\]]/g, ''));
          if (!nome) continue;
          out.push({ materia, fonte, aba: c.nome, sub, nome, id: e.id || (/\(#f=/.test(e.nomeMd || '') ? 'composto' : null), texto: limpo(String(e.texto || '').replace(/\]\(#[^)]*\)/g, ']').replace(/[[\]]/g, '')), papel: papelDe(fonte, c.nome + ' ' + sub) });
        }
      }
    }
    return out;
  };
  const todas = [];
  const docs = {};
  for (const m of nomes) {
    docs[m] = { 'Tábua': tes.materias[m] && tes.materias[m].tabua, Museu: materias[m].museu, Horizonte: materias[m].horizonte };
    for (const [f, d] of Object.entries(docs[m])) todas.push(...entradasDe(d, f, m));
  }

  /* 1. duplicidades: mesmo nome em módulos diferentes da mesma área */
  for (const m of nomes) {
    const grupos = new Map();
    for (const e of todas.filter((x) => x.materia === m)) { const k = chaveNome(e.nome); if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(e); }
    for (const g of grupos.values()) {
      if (new Set(g.map((e) => e.fonte)).size < 2) continue;
      const ids = g.map((e) => e.id).filter((x) => x && x !== 'composto');
      const mesmaFicha = ids.length === g.length && new Set(ids).size === 1;
      const parecido = jaccard(palavras(g[0].texto), palavras(g[1].texto));
      const tipo = mesmaFicha ? 'mesma ficha' : parecido >= 0.45 ? 'texto repetido' : 'mesmo nome, outro ângulo';
      const ordem = [...g].sort((a, b) => VOCACAO[b.papel] - VOCACAO[a.papel]);
      r.duplicidades.push({
        materia: m, nome: g[0].nome, tipo, parecido: Math.round(parecido * 100) / 100,
        confianca: mesmaFicha ? 'alta' : parecido >= 0.45 ? 'alta' : 'média',
        origens: g.map((e) => `${e.fonte} › ${e.aba}${e.sub ? ` › ${e.sub}` : ''} (${e.papel})`),
        proposta: tipo === 'mesmo nome, outro ângulo'
          ? `manter as duas (falam de coisas diferentes) e ligar uma à outra: em ${ordem[1].fonte}, acrescentar "ver também ${ordem[0].fonte} › ${ordem[0].aba}"`
          : `principal: ${ordem[0].fonte} › ${ordem[0].aba}; em ${ordem.slice(1).map((e) => `${e.fonte} › ${e.aba}`).join(', ')}, a entrada viraria referência ("→ ${ordem[0].fonte}") com o texto atual guardado`,
      });
    }
  }

  /* 2. categorias canônicas + aliases, por sobreposição (unidades, abas e subtítulos) */
  const rotulos = [];
  for (const m of nomes) {
    for (const u of materias[m].unidades) rotulos.push({ rotulo: u.nome, origem: `${m} · unidade do mapa` });
    for (const [f, d] of Object.entries(docs[m])) for (const c of (d && d.categorias) || []) {
      rotulos.push({ rotulo: c.nome, origem: `${m} · ${f} › aba` });
      for (const b of c.blocos) if (b.t === 'h') rotulos.push({ rotulo: limpo(b.texto), origem: `${m} · ${f} › ${c.nome} › subtítulo` });
    }
  }
  /* sem encadeamento: um grupo = rótulos com exatamente as mesmas ideias */
  const assinatura = (x) => [...ideias(x)].sort().join(' ');
  const porAss = new Map();
  for (const x of rotulos) { const a = assinatura(x.rotulo); if (!a) continue; if (!porAss.has(a)) porAss.set(a, []); porAss.get(a).push(x); }
  for (const lista of porAss.values()) {
    if (lista.length < 2) continue;
    const conta = new Map();
    for (const x of lista) { const k = chaveNome(x.rotulo); conta.set(k, (conta.get(k) || 0) + 1); }
    const canonica = lista.map((x) => x.rotulo).sort((a, b) => (conta.get(chaveNome(b)) - conta.get(chaveNome(a))) || (a.length - b.length))[0];
    const confianca = conta.size === 1 ? 'alta' : 'média';
    r.categorias.grupos.push({ canonica, confianca, motivo: confianca === 'alta' ? 'mesmo rótulo' : `mesmas ideias (${[...ideias(canonica)].join(', ')}), por sinônimo`, aliases: lista });
  }
  /* sobreposição parcial: só pares, entre grupos diferentes, para revisar à mão */
  const ass = [...porAss.entries()];
  for (let i2 = 0; i2 < ass.length && r.categorias.possiveis.length < 30; i2++) for (let j2 = i2 + 1; j2 < ass.length && r.categorias.possiveis.length < 30; j2++) {
    const A = new Set(ass[i2][0].split(' ')), B = new Set(ass[j2][0].split(' '));
    const jac = jaccard(A, B);
    const comuns = [...A].filter((x) => B.has(x)).length;
    if (comuns >= 2 || jac >= 0.67) r.categorias.possiveis.push({ a: ass[i2][1][0], b: ass[j2][1][0], jac: Math.round(jac * 100) / 100 });
  }
  r.categorias.grupos.sort((a, b) => b.aliases.length - a.aliases.length);

  /* conceitos repetidos: rótulo genérico (não é ponte) × conceito compartilhado (ponte candidata) */
  const conceitos = new Map();
  for (const m of nomes) for (const n of materias[m].nos) for (const c of n.conceitos) {
    const k = chaveNome(c); if (k.length < 4) continue;
    if (!conceitos.has(k)) conceitos.set(k, { conceito: c, estudos: [] });
    conceitos.get(k).estudos.push(n.codigo);
  }
  for (const c of conceitos.values()) {
    if (c.estudos.length < 2) continue;
    (GENERICOS.has(chaveNome(c.conceito)) ? r.conceitos.genericos : r.conceitos.compartilhados).push(c);
  }

  /* 3. sem lugar (só o que deveria ter estudo) e o que se liga à área sem ficha */
  r.semLugar.itensSemEstudo = [];
  for (const s of checklist || []) for (const it of s.itens) if (!itensEstudos[`${s.nome}|${it.texto}`]) r.semLugar.itensSemEstudo.push({ materia: s.nome, item: it.texto });
  r.semLugar.estudosSemItem = []; r.semLugar.poucosConceitos = []; r.semLugar.semPonte = []; r.semLugar.semMuseuNemPratica = [];
  r.semLugar.pecasSemEstudo = []; r.semLugar.praticasSemResposta = []; r.semLugar.tabuaSemFicha = {};
  for (const m of nomes) {
    const a = materias[m];
    for (const n of a.nos) {
      if (!n.itens.length) r.semLugar.estudosSemItem.push(n.codigo);
      if (n.conceitos.length < 3) r.semLugar.poucosConceitos.push(`${n.codigo} (${n.conceitos.length})`);
      if (!n.fora.length) r.semLugar.semPonte.push(n.codigo);
      if (!n.museu.length && !n.praticas.length) r.semLugar.semMuseuNemPratica.push(n.codigo);
    }
    const daArea = todas.filter((e) => e.materia === m);
    for (const e of daArea) {
      const temCod = /\b[A-Z]{3}-\d{2}\b/.test(e.texto);
      if (e.papel === 'peça' && !temCod) r.semLugar.pecasSemEstudo.push(e);
      if (e.fonte === 'Horizonte') {
        const l = (r.ligadosAArea[m] = r.ligadosAArea[m] || {});
        const t = (l[e.papel] = l[e.papel] || { total: 0, comEstudo: 0 });
        t.total += 1; if (temCod) t.comEstudo += 1;
      }
    }
    for (const nv of (a.praticas && a.praticas.niveis) || []) for (const p of nv.praticas) if (!p.resposta) r.semLugar.praticasSemResposta.push(p.id);
    const tab = daArea.filter((e) => e.fonte === 'Tábua');
    const sem = tab.filter((e) => !e.id);
    r.semLugar.tabuaSemFicha[m] = { total: tab.length, semFicha: sem.length, exemplos: sem.slice(0, 8).map((e) => e.nome) };
  }

  /* 4. pontes */
  const matriz = {};
  for (const m of nomes) { matriz[m] = {}; for (const o of nomes) matriz[m][o] = 0; }
  for (const m of nomes) for (const n of materias[m].nos) for (const f of n.fora) matriz[m][f.materia] += 1;
  r.pontes.matriz = matriz;
  r.pontes.mao = []; r.pontes.fracas = [];
  for (const m of nomes) for (const o of nomes) {
    if (m >= o) continue;
    if ((matriz[m][o] === 0) !== (matriz[o][m] === 0)) r.pontes.mao.push({ de: matriz[m][o] ? m : o, para: matriz[m][o] ? o : m, n: matriz[m][o] || matriz[o][m] });
    if (matriz[m][o] + matriz[o][m] < 3) r.pontes.fracas.push({ a: m, b: o, n: matriz[m][o] + matriz[o][m] });
  }
  return r;
}

export function auditoriaMd(r) {
  const L = ['---', 'formato: wiki', 'tipo: auditoria das áreas', '---', '', '# Auditoria das áreas', '',
    `> Gerada pelo Portal Solar em ${r.gerado.slice(0, 10)} (\`node auditar-areas.mjs\`). **Só registra e propõe: nada aqui moveu, apagou ou renomeou conteúdo.** Cada proposta é reversível e espera a sua revisão. O arquivo é refeito a cada auditoria; para guardar uma decisão, copie-a para o PERFIL.md do Portal Solar ou para o arquivo da área.`, ''];
  const lista = (arr, f) => (arr.length ? arr.map((x) => `- ${f(x)}`) : ['- nada encontrado']);
  const porTipo = (t) => r.duplicidades.filter((d) => d.tipo === t);

  L.push('## 1. Duplicidades entre Tábua, Museu e Horizonte', '',
    'Três tipos, do mais ao menos sério. Nenhuma entrada foi tocada.', '',
    `### Mesma ficha (${porTipo('mesma ficha').length}): as duas apontam para a mesma ficha do Atlas`, '',
    ...lista(porTipo('mesma ficha'), (d) => `**${d.nome}** (${d.materia}) — ${d.origens.join(' · ')}. *Proposta (confiança ${d.confianca}):* ${d.proposta}.`), '',
    `### Texto repetido (${porTipo('texto repetido').length}): o mesmo nome e um texto parecido`, '',
    ...lista(porTipo('texto repetido'), (d) => `**${d.nome}** (${d.materia}, semelhança ${d.parecido}) — ${d.origens.join(' · ')}. *Proposta (confiança ${d.confianca}):* ${d.proposta}.`), '',
    `### Mesmo nome, outro ângulo (${porTipo('mesmo nome, outro ângulo').length}): o mesmo nome, mas cada entrada diz outra coisa`, '',
    'Por exemplo: o livro na Tábua e o mesmo livro como leitura de fôlego no Horizonte; ou a pessoa na Tábua e o lugar ou o momento dela no Museu. Candidatos a **alias ou referência cruzada**, não a remoção.', '',
    ...lista(porTipo('mesmo nome, outro ângulo'), (d) => `**${d.nome}** (${d.materia}, semelhança ${d.parecido}) — ${d.origens.join(' · ')}. *Proposta (confiança ${d.confianca}):* ${d.proposta}.`), '');

  L.push('## 2. Proposta: categorias canônicas e aliases', '',
    'Rótulos (unidades do mapa, abas e subtítulos de Tábua, Museu e Horizonte) que dizem a mesma coisa. A canônica é o rótulo mais frequente (ou o mais curto); os outros seriam aliases. **Nada foi renomeado.** Se aprovar, o caminho reversível é um arquivo de aliases que o Portal Solar leia para agrupar e buscar, deixando os textos como estão.', '',
    `Confiança: **alta** = mesmo rótulo; **média** = as mesmas ideias com palavras diferentes (pelo dicionário de sinônimos); **baixa** = sobreposição parcial, listada em pares e nunca agrupada. Dicionário de sinônimos usado: ${Object.entries(SINONIMOS).filter(([k, v]) => k !== v).map(([k, v]) => `${k}→${v}`).join(', ')}.`, '',
    ...r.categorias.grupos.flatMap((g) => [`### ${g.canonica} · confiança ${g.confianca} · ${g.aliases.length} ocorrências`, '', `Motivo: ${g.motivo}.`, '', ...g.aliases.map((a) => `- "${a.rotulo}" — ${a.origem}`), '']),
    `### Sobreposição parcial (confiança baixa, ${r.categorias.possiveis.length} pares): duas ideias em comum ou dois terços de sobreposição, sem agrupar; decida à mão`, '',
    ...lista(r.categorias.possiveis, (p) => `"${p.a.rotulo}" (${p.a.origem}) ~ "${p.b.rotulo}" (${p.b.origem}) · ${p.jac}`), '');

  L.push('## 3. Conceitos repetidos entre estudos', '',
    `### Conceitos compartilhados (${r.conceitos.compartilhados.length}): a mesma ideia em dois estudos, pontes candidatas`, '',
    ...lista(r.conceitos.compartilhados, (c) => `**${c.conceito}** — ${c.estudos.join(', ')}`), '',
    `### Rótulos genéricos (${r.conceitos.genericos.length}): cabeças que não nomeiam um assunto ("Contexto", "Conceitos"), que não indicam ponte; a lista \`GENERICOS\` em lib/areas.mjs é revisável`, '',
    'Não são duplicatas de conteúdo. Se incomodarem no mapa, a correção é no estudo: dar à cabeça um nome que diga o assunto.', '',
    ...lista(r.conceitos.genericos, (c) => `${c.conceito} — ${c.estudos.join(', ')}`), '');

  L.push('## 4. Sem lugar', '',
    `### Itens do Checklist sem estudo ligado (${r.semLugar.itensSemEstudo.length})`, '', ...lista(r.semLugar.itensSemEstudo, (i) => `${i.materia}: ${i.item}`), '',
    `### Estudos sem item do Checklist (${r.semLugar.estudosSemItem.length}): o progresso deles não é medido`, '', r.semLugar.estudosSemItem.join(', ') || 'nenhum', '',
    `### Estudos com menos de 3 conceitos extraídos (${r.semLugar.poucosConceitos.length}): faltam cabeças em negrito em "O que se estuda"`, '', r.semLugar.poucosConceitos.join(', ') || 'nenhum', '',
    `### Estudos sem peça de museu e sem prática (${r.semLugar.semMuseuNemPratica.length})`, '', r.semLugar.semMuseuNemPratica.join(', ') || 'nenhum', '',
    `### Peças do museu sem estudo ligado (${r.semLugar.pecasSemEstudo.length})`, '',
    'Só peças contam aqui. Profissões, caminhos acadêmicos, recursos e fronteiras se ligam à área e não precisam ser fichas (ver a contagem abaixo).', '',
    ...lista(r.semLugar.pecasSemEstudo, (p) => `${p.materia} › Museu › ${p.aba}: ${p.nome}`), '',
    '### Ligados à área, sem precisar de estudo (Horizonte)', '',
    '| Área | profissões | caminhos acadêmicos | recursos | fronteiras |', '|---|---|---|---|---|',
    ...Object.entries(r.ligadosAArea).map(([m, l]) => `| ${m} | ${['profissão', 'caminho acadêmico', 'recurso', 'fronteira'].map((k) => (l[k] ? `${l[k].total} (${l[k].comEstudo} com estudo)` : '0')).join(' | ')} |`), '',
    `### Práticas sem resposta ou critério (${r.semLugar.praticasSemResposta.length})`, '', r.semLugar.praticasSemResposta.join(', ') || 'nenhuma', '',
    '### Nomes da Tábua sem ficha no Atlas', '', 'Informativo: a Tábua liga sozinha quando a ficha passa a existir.', '',
    ...Object.entries(r.semLugar.tabuaSemFicha).map(([m, t]) => `- ${m}: ${t.semFicha} de ${t.total}${t.exemplos.length ? ` (ex.: ${t.exemplos.join(', ')})` : ''}`), '');

  const ns = Object.keys(r.pontes.matriz);
  L.push('## 5. Pontes entre áreas', '', 'Quantas vezes os estudos da área da linha citam estudos da área da coluna.', '',
    `| | ${ns.map((n) => n.slice(0, 3)).join(' | ')} |`, `|---|${ns.map(() => '---').join('|')}|`,
    ...ns.map((m) => `| **${m}** | ${ns.map((o) => (m === o ? '·' : r.pontes.matriz[m][o])).join(' | ')} |`), '',
    '### Pontes de mão única', '', ...lista(r.pontes.mao, (p) => `${p.de} cita ${p.para} (${p.n}×), mas ${p.para} nunca cita ${p.de}`), '',
    '### Pares de áreas quase sem ponte (menos de 3 elos nos dois sentidos)', '', ...lista(r.pontes.fracas, (p) => `${p.a} ↔ ${p.b}: ${p.n}`), '',
    `### Estudos sem nenhuma ponte para fora (${r.semLugar.semPonte.length})`, '', r.semLugar.semPonte.join(', ') || 'nenhum', '');
  return L.join('\n');
}
