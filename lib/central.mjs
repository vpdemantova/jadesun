import { arvore, lerNota } from './notas.mjs';

const SECOES = ['Painel', 'Frentes', 'Fontes a preservar', 'Computadores'];
const CAMPOS_PAINEL = ['objetivo', 'agora', 'minha_parte', 'sua_parte', 'status', 'atualizado_em'];
const NOME_ALTERNATIVO = /Recuperação e execução\.md$/iu;

const erro = (mensagem, status = 422) => Object.assign(new Error(mensagem), { status });
const normalizar = (texto) => texto.normalize('NFC').trim();

/** Separa uma linha de tabela, preservando o texto e reconhecendo \| como parte da célula. */
function celulas(linha) {
  const texto = linha.trim();
  const partes = [];
  let atual = '';
  let terminouEmSeparador = false;
  for (const caractere of texto) {
    if (caractere === '|') {
      const barras = atual.match(/\\+$/)?.[0].length || 0;
      if (barras % 2) {
        atual = atual.slice(0, -1) + '|';
        terminouEmSeparador = false;
        continue;
      }
      partes.push(atual.trim());
      atual = '';
      terminouEmSeparador = true;
    } else {
      atual += caractere;
      terminouEmSeparador = false;
    }
  }
  partes.push(atual.trim());
  if (texto.startsWith('|')) partes.shift();
  if (terminouEmSeparador) partes.pop();
  return partes;
}

function linhasDaTabela(linhas, colunas, secao) {
  const resultado = [];
  let encontrou = false;
  for (let indice = 0; indice < linhas.length; indice++) {
    if (!linhas[indice].includes('|')) continue;
    const cabecalho = celulas(linhas[indice]);
    const separador = celulas(linhas[indice + 1] || '');
    const cabecalhoCorreto = cabecalho.length === colunas.length
      && cabecalho.every((valor, coluna) => normalizar(valor).toLowerCase() === colunas[coluna].toLowerCase());
    const separadorCorreto = separador.length === colunas.length
      && separador.every((valor) => /^:?-{3,}:?$/.test(valor));
    if (!cabecalhoCorreto && !separadorCorreto) continue;
    if (!cabecalhoCorreto || !separadorCorreto) throw erro(`A tabela de ${secao} está com cabeçalho ou separador inválido.`);
    if (encontrou) throw erro(`Há mais de uma tabela na seção ${secao}.`);
    encontrou = true;
    indice += 2;
    for (; indice < linhas.length && linhas[indice].trim() && linhas[indice].includes('|'); indice++) {
      const valores = celulas(linhas[indice]);
      if (valores.every((valor) => !valor)) continue;
      if (valores.length !== colunas.length) throw erro(`Uma linha de ${secao} tem quantidade de colunas diferente do cabeçalho.`);
      resultado.push(valores);
    }
    indice--;
  }
  return resultado;
}

/** Lê somente as quatro tabelas da central. Os valores permanecem texto, a escapar na interface. */
export function parseCentral(texto) {
  if (typeof texto !== 'string') throw erro('O conteúdo da central precisa ser texto.');
  const secoes = {};
  let secao = null;
  let cerca = null;
  for (const linha of texto.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const abertura = linha.match(/^ {0,3}(`{3,}|~{3,})/);
    if (abertura) {
      const sinal = abertura[1][0];
      if (!cerca) cerca = { sinal, tamanho: abertura[1].length };
      else if (sinal === cerca.sinal && abertura[1].length >= cerca.tamanho) cerca = null;
      continue;
    }
    if (cerca) continue;
    const titulo = linha.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (titulo) {
      const nome = normalizar(titulo[2]);
      secao = titulo[1].length === 2 && SECOES.includes(nome) ? nome : null;
      if (secao) {
        if (secoes[secao]) throw erro(`A seção ${secao} está repetida.`);
        secoes[secao] = [];
      }
    } else if (secao) secoes[secao].push(linha);
  }

  const painel = Object.fromEntries(CAMPOS_PAINEL.map((campo) => [campo, null]));
  for (const [campoBruto, valor] of linhasDaTabela(secoes.Painel || [], ['Campo', 'Valor'], 'Painel')) {
    const campo = normalizar(campoBruto).toLowerCase();
    if (!CAMPOS_PAINEL.includes(campo)) continue;
    if (painel[campo] !== null) throw erro(`O campo ${campo} está repetido no Painel.`);
    painel[campo] = valor;
  }
  const frentes = linhasDaTabela(secoes.Frentes || [], ['Frente', 'Tipo', 'Próxima entrega', 'Estado'], 'Frentes')
    .map(([nome, tipo, proximaEntrega, estado]) => ({ nome, tipo, proximaEntrega, estado }));
  const fontes = linhasDaTabela(secoes['Fontes a preservar'] || [], ['Fonte', 'O que já sabemos', 'Estado'], 'Fontes a preservar')
    .map(([nome, contexto, estado]) => ({ nome, contexto, estado }));
  const computadores = linhasDaTabela(secoes.Computadores || [], ['Computador', 'Papel', 'Situação'], 'Computadores')
    .map(([nome, papel, situacao]) => ({ nome, papel, situacao }));
  return { painel, frentes, fontes, computadores };
}

function marcadaComoCentral(texto) {
  const cabecalho = texto.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  if (!cabecalho) return false;
  return /^central_execucao\s*:\s*true\s*(?:#.*)?$/im.test(cabecalho);
}

/** Procura a central no acervo permitido e entrega somente suas tabelas. Nunca grava no caderno. */
export async function lerCentral() {
  const { notas } = await arvore({ fresco: true });
  const caminhos = notas.map(([rel]) => rel).filter((rel) => /\.md$/i.test(rel));
  const marcadas = [];
  const alternativas = [];
  for (let indice = 0; indice < caminhos.length; indice += 16) {
    const lote = caminhos.slice(indice, indice + 16);
    const lidas = await Promise.all(lote.map(async (rel) => {
      try {
        return await lerNota(rel);
      } catch (falha) {
        if (falha.status === 404 || falha.code === 'ENOENT') return null;
        throw erro('Não foi possível conferir as notas disponíveis para localizar a central.', 503);
      }
    }));
    for (const nota of lidas) {
      if (!nota) continue;
      if (marcadaComoCentral(nota.texto)) marcadas.push(nota);
      if (NOME_ALTERNATIVO.test(nota.rel.normalize('NFC'))) alternativas.push(nota);
    }
  }
  const candidatas = marcadas.length ? marcadas : alternativas;
  if (candidatas.length > 1) throw erro('Há mais de uma nota identificada como central. Escolha uma antes de continuar.', 409);
  if (!candidatas.length) return { existe: false };
  const nota = candidatas[0];
  return {
    existe: true,
    rel: nota.rel,
    hash: nota.hash,
    modificado: nota.modificado,
    ...parseCentral(nota.texto),
  };
}
