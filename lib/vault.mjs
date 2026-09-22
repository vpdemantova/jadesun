import { readFile, writeFile, mkdir, readdir, stat, rename, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
export const COFRE = process.env.VAULT || 'D:/www/blessednotebook';
export const CONTAGEM = { inicio: '2026-09-21', dias: 28, prova: '2026-10-18' };
export const PROIBIDO = /(^|[\\/])1 Villages[\\/]b Studio([\\/]|$)|senha|pass|secret|token/i;

const ATLAS = '2 Academy/3 Atlas - Referência e Contemplação';
export const CAMINHOS = {
  focos: 'Logboard/# Board/Focos',
  tarefas: 'Logboard/# Board/Focos/Tarefas Simples.md',
  checklist: 'Logboard/# Board/Focos/Checklist do Vestibular.md',
  roteiro: 'Logboard/# Board/Focos/Roteiro — Reta Final.md',
  frases: 'Logboard/# Profile/Frases.md',
  imagens: '2 Academy/1 Fundação - Base Científica/Selecao/_imagens',
};

const SECAO_RE = /^##\s+\d+\s*·\s*([^(]+?)\s*(?:\((.*)\))?\s*$/;
const ITEM_RE = /^(\s*-\s+\[)( |x|X)(\]\s+)(.*)$/;

const FRASES_PADRAO = [
  { texto: 'Não estou perdido — estou espalhado. Um centro, um passo por dia.', fonte: 'seu Centro' },
  { texto: 'A ideia não foge — o dia é que foge.', fonte: 'seu Centro' },
  { texto: 'Se parar depois da primeira, o dia já valeu.', fonte: 'Tarefas Simples' },
  { texto: 'Cinco horas com prova na mão valem mais que dez horas de vídeo.', fonte: 'seu Centro' },
  { texto: 'Um tijolo sólido por dia. 30 minutos. E o dia está ganho.', fonte: 'seu Centro' },
];

const FIO = [
  { etapa: 'Matéria-prima', nome: 'Madeira' },
  { etapa: 'Processo', nome: 'Secagem e serragem' },
  { etapa: 'Máquina', nome: 'Serra' },
  { etapa: 'Ofício', nome: 'Marcenaria' },
];

export function pastaImagens() {
  return join(COFRE, CAMINHOS.imagens);
}

function lerArquivo(relativo) {
  if (PROIBIDO.test(relativo)) throw new Error(`Caminho proibido: ${relativo}`);
  return readFile(join(COFRE, relativo), 'utf8');
}

function limpar(texto) {
  return texto
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*|`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function lerTarefas(md) {
  const tarefas = [];
  for (const linha of md.split(/\r?\n/)) {
    if (!linha.trim().startsWith('|')) continue;
    const c = linha.trim().replace(/^\||\|$/g, '').split('|').map((s) => s.trim());
    if (c.length < 3) continue;
    if (/^[-:\s]+$/.test(c[0])) continue;
    if (/^área$/i.test(limpar(c[0]))) continue;
    tarefas.push({ area: limpar(c[0]), tarefa: limpar(c[1]), tempo: limpar(c[2]) });
  }
  return tarefas;
}

function lerChecklist(md) {
  const secoes = [];
  let secao = null;
  let grupo = '';
  for (const bruta of md.split(/\r?\n/)) {
    const linha = bruta.trimEnd();
    let m = linha.match(SECAO_RE);
    if (m) {
      secao = { nome: m[1].trim(), nota: (m[2] || '').trim(), itens: [] };
      secoes.push(secao);
      grupo = '';
      continue;
    }
    if (/^##\s/.test(linha)) { secao = null; continue; }
    if (!secao) continue;
    m = linha.match(/^###\s+(.*)$/);
    if (m) { grupo = limpar(m[1]); continue; }
    m = linha.match(ITEM_RE);
    if (m) secao.itens.push({ grupo, texto: limpar(m[4]), feito: m[2] !== ' ' });
  }
  return secoes;
}

function lerCartas(md) {
  const mapa = new Map();
  let carta = null;
  for (const bruta of md.split(/\r?\n/)) {
    const linha = bruta.trim();
    let m = linha.match(/^##\s+(.*)$/);
    if (m) {
      carta = { titulo: limpar(m[1]), resumo: '', lembrar: [], testes: [] };
      mapa.set(normalizar(carta.titulo), carta);
      continue;
    }
    if (!carta || !linha) continue;
    if ((m = linha.match(/^>\s*(.*)$/))) { carta.resumo += (carta.resumo ? ' ' : '') + limpar(m[1]); continue; }
    if ((m = linha.match(/^\d+\.\s+(.+?)\s*(?:→|=>)\s*(.+)$/))) { carta.testes.push({ p: limpar(m[1]), r: limpar(m[2]) }); continue; }
    if ((m = linha.match(/^[-*]\s+(.*)$/))) { carta.lembrar.push(limpar(m[1])); continue; }
  }
  return mapa;
}

function lerRoteiro(md) {
  const ano = CONTAGEM.prova.slice(0, 4);
  const dias = [];
  for (const linha of md.split(/\r?\n/)) {
    if (!linha.trim().startsWith('|')) continue;
    const c = linha.trim().replace(/^\||\|$/g, '').split('|').map((s) => s.trim());
    if (c.length < 4) continue;
    const m = c[0].match(/(\d{1,2})\/(\d{2})/);
    if (!m) continue;
    dias.push({ data: `${ano}-${m[2]}-${m[1].padStart(2, '0')}`, rotulo: limpar(c[0]), bloco1: limpar(c[1]), bloco2: limpar(c[2]), treino: limpar(c[3]) });
  }
  return dias;
}

function lerFrases(md) {
  const frases = [];
  let cabecalho = false;
  for (const [i, bruta] of md.split(/\r?\n/).entries()) {
    const linha = bruta.trim();
    if (i === 0 && linha === '---') { cabecalho = true; continue; }
    if (cabecalho) { if (linha === '---') cabecalho = false; continue; }
    if (!linha || linha.startsWith('#')) continue;
    const texto = limpar(linha.replace(/^[-*>]\s*/, ''));
    if (texto) frases.push({ texto, fonte: '' });
  }
  return frases;
}

async function carregarCartas() {
  const mapa = new Map();
  const pasta = join(COFRE, CAMINHOS.focos);
  if (!existsSync(pasta)) return mapa;
  for (const nome of await readdir(pasta)) {
    if (!/^Cartas.*\.md$/i.test(nome)) continue;
    const md = await readFile(join(pasta, nome), 'utf8');
    for (const [chave, carta] of lerCartas(md)) mapa.set(chave, { ...carta, arquivo: nome });
  }
  return mapa;
}

async function listarMd(pasta) {
  if (PROIBIDO.test(pasta)) throw new Error(`Caminho proibido: ${pasta}`);
  const achados = [];
  async function andar(rel) {
    for (const e of await readdir(join(COFRE, rel), { withFileTypes: true })) {
      const r = `${rel}/${e.name}`;
      if (e.isDirectory()) await andar(r);
      else if (e.name.endsWith('.md')) achados.push({ nome: e.name.replace(/\.md$/, ''), rel: r, bytes: (await stat(join(COFRE, r))).size });
    }
  }
  if (existsSync(join(COFRE, pasta))) await andar(pasta);
  return achados;
}

async function tipoDe(rel) {
  const texto = await readFile(join(COFRE, rel), 'utf8');
  return (texto.split(/\r?\n/).slice(0, 15).find((l) => /^tipo:/.test(l)) || '').replace(/^tipo:\s*/, '').trim();
}

const mediaKB = (lista) => (lista.length ? Math.round((lista.reduce((n, a) => n + a.bytes, 0) / lista.length / 1024) * 10) / 10 : 0);
const dos = (lista, nomes) => nomes.filter((n) => lista.some((a) => a.nome === n));
const nomesDe = (lista, max = 6) => lista.map((a) => a.nome).slice(0, max);
const dentro = (todos, pasta) => todos.filter((a) => a.rel.startsWith(`${ATLAS}/${pasta}/`));

async function montarCadeia() {
  const todos = await listarMd(ATLAS);
  const elementos = dentro(todos, 'a Elements');
  const materiasPrimas = dentro(todos, 'b Raws');
  const componentes = dentro(todos, 'c Components');
  const objetos = dentro(todos, 'd Objects');
  const oficios = dentro(todos, 'f Ofícios');
  const ferramentas = [];
  const instrumentosEObjetos = [];
  for (const o of objetos) ((await tipoDe(o.rel)).includes('ferramenta') ? ferramentas : instrumentosEObjetos).push(o);

  const cadeia = [
    { etapa: 'Elementos', total: elementos.length, media: mediaKB(elementos), exemplos: dos(elementos, ['Ferro', 'Cobre', 'Carbono', 'Silício', 'Ouro']) },
    { etapa: 'Matérias-primas', total: materiasPrimas.length, media: mediaKB(materiasPrimas), exemplos: nomesDe(materiasPrimas) },
    { etapa: 'Transformações e processos', total: 0, media: 0, exemplos: [], semPasta: true },
    { etapa: 'Componentes', total: componentes.length, media: mediaKB(componentes), exemplos: nomesDe(componentes) },
    { etapa: 'Máquinas e ferramentas', total: ferramentas.length, media: mediaKB(ferramentas), exemplos: nomesDe(ferramentas, 8) },
    { etapa: 'Ofícios', total: oficios.length, media: mediaKB(oficios), exemplos: dos(oficios, ['Marcenaria', 'Ferreiro', 'Cerâmica', 'Vidreiro', 'Tecelagem', 'Joalharia']) },
    { etapa: 'Instrumentos e objetos', total: instrumentosEObjetos.length, media: mediaKB(instrumentosEObjetos), exemplos: dos(instrumentosEObjetos, ['Violino', 'Piano', 'Sitar', 'Sun']) },
  ];

  const base = (nome) => normalizar(nome.replace(/\s*\(.*\)\s*$/, ''));
  const conhecidos = new Set(todos.map((a) => base(a.nome)));
  const fio = FIO.map((f) => ({ ...f, existe: conhecidos.has(normalizar(f.nome)) }));
  return { cadeia, fio };
}

export async function carregarEstado() {
  const [tarefasMd, checkMd, cartas, atlas] = await Promise.all([
    lerArquivo(CAMINHOS.tarefas),
    lerArquivo(CAMINHOS.checklist),
    carregarCartas(),
    montarCadeia(),
  ]);

  const checklist = lerChecklist(checkMd).map((s) => {
    const itens = s.itens.map((i) => ({ ...i, carta: cartas.get(normalizar(i.texto)) || null }));
    return { ...s, itens, total: itens.length, feitos: itens.filter((i) => i.feito).length };
  });

  let frases = FRASES_PADRAO;
  if (existsSync(join(COFRE, CAMINHOS.frases))) {
    const proprias = lerFrases(await lerArquivo(CAMINHOS.frases));
    if (proprias.length) frases = proprias;
  }

  const roteiro = existsSync(join(COFRE, CAMINHOS.roteiro)) ? lerRoteiro(await lerArquivo(CAMINHOS.roteiro)) : [];

  return {
    gerado: new Date().toISOString(),
    contagem: CONTAGEM,
    roteiro,
    tarefas: lerTarefas(tarefasMd),
    checklist,
    frases,
    cadeia: atlas.cadeia,
    fio: atlas.fio,
    cartas: cartas.size,
  };
}

export async function marcarItem({ secao, texto, feito }) {
  const arquivo = join(COFRE, CAMINHOS.checklist);
  const bruto = await readFile(arquivo, 'utf8');
  const eol = bruto.includes('\r\n') ? '\r\n' : '\n';
  const linhas = bruto.split(/\r?\n/);

  let secaoAtual = null;
  const achadas = [];
  linhas.forEach((linha, i) => {
    const s = linha.match(SECAO_RE);
    if (s) { secaoAtual = s[1].trim(); return; }
    if (/^##\s/.test(linha)) { secaoAtual = null; return; }
    const it = linha.match(ITEM_RE);
    if (it && secaoAtual === secao && limpar(it[4]) === texto) achadas.push({ i, it });
  });
  if (achadas.length === 0) throw new Error('Item não encontrado no Checklist.');
  if (achadas.length > 1) throw new Error('Item ambíguo: há dois iguais nesta matéria.');

  const { i, it } = achadas[0];
  if ((it[2] !== ' ') === feito) return { mudou: false };

  const dia = new Date().toISOString().slice(0, 10);
  await mkdir(join(RAIZ, 'dados'), { recursive: true });
  const copia = join(RAIZ, 'dados', `backup-checklist-${dia}.md`);
  if (!existsSync(copia)) await copyFile(arquivo, copia);

  linhas[i] = it[1] + (feito ? 'x' : ' ') + it[3] + it[4];
  await writeFile(`${arquivo}.tmp`, linhas.join(eol), 'utf8');
  await rename(`${arquivo}.tmp`, arquivo);
  return { mudou: true };
}
