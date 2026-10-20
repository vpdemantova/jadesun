// Refaz o índice de respostas/ ("0 Índice.md") e os links de anterior e próximo no fim de cada arquivo.
// Cada resposta é um arquivo "NNN — Título.md": na 1ª linha "# N · Título", na 2ª as #tags,
// e, se precisar de uma ação do dono, uma linha "> **Espera você:** …". Uso: node indice-respostas.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PASTA = join(dirname(fileURLToPath(import.meta.url)), 'respostas');
const INDICE = '0 Índice';
const LEGENDA = [
  ['fundacao', 'as decisões do começo (20 e 21 set)'], ['arquitetura', 'como o código é feito'], ['caderno', 'o que lê ou grava no seu caderno'],
  ['seguranca', 'segurança'], ['privacidade', 'o que é privado e o que sai'], ['design', 'o visual'], ['marca', 'o nome e o Quadrado Negro'],
  ['personalizar', 'o painel Personalizar'], ['movimento', 'animação e rolagem'], ['menus', 'a navegação: menus, abas, portas'], ['celular', 'o celular'],
  ['home', 'a página inicial'], ['atlas', 'o Atlas'], ['fichas', 'a Biblioteca e as fichas'], ['linha-do-tempo', 'a linha do tempo'], ['revolucoes', 'a linha das revoluções'],
  ['museus', 'museus e fundações'], ['dados', 'os dados da Terra'], ['manifesto', 'o Manifesto'], ['curadoria', 'a Curadoria'], ['guias', 'os Guias'],
  ['estudo', 'vestibular, Domínio, áreas e cartas'], ['hoje', 'o Agora e o Meu dia'], ['eu', 'o Eu'], ['rede', 'a rede (fichas, sem curtidas)'], ['colecao', 'a Coleção'],
  ['estante', 'a Estante'], ['casa', 'a Casa'], ['jardim', 'o Jardim'], ['3d', 'as cenas em 3D'], ['notas', 'o caderno de notas'], ['conta', 'a conta e o login'],
  ['publicacao', 'o site público, a exportação e a publicação'], ['tweak', 'o painel /tweak'], ['protetor', 'o protetor de tela'], ['ajuda', 'a ajuda'],
  ['desempenho', 'a velocidade'], ['copia', 'cópias para voltar atrás'], ['registro', 'este registro de respostas'], ['pedido-original', 'o pedido do começo'],
  ['pedido-grande', 'muitos pedidos numa mensagem'], ['correcao', 'um defeito achado e corrigido'], ['erro-meu', 'um erro meu, assumido'],
  ['espera-voce', 'precisa de uma ação sua agora'],
  ['vitordemantova', 'o site pessoal (vitordemantova.com)'], ['idiomas', 'os idiomas e as traduções'],
  ['doar', 'a página escondida de doação'], ['leitor', 'o leitor em três colunas e as Leituras'], ['referencias', 'as referências de design e de código'],
  ['laboratorio', 'o Laboratório do site pessoal'], ['editorial', 'o modo Editorial do site pessoal'],
];

const nomes = readdirSync(PASTA).filter((f) => f.endsWith('.md') && f !== INDICE + '.md').sort();
const itens = nomes.map((arquivo) => {
  const texto = readFileSync(join(PASTA, arquivo), 'utf8').replace(/\r\n/g, '\n'); // no Windows, o git entrega com CRLF
  const linhas = texto.split('\n');
  const nome = arquivo.slice(0, -3);
  const pre = nome.split(' — ')[0];
  const titulo = linhas[0].replace(/^#\s*/, '').replace(/^\d+\s*·\s*/, '').trim();
  const tags = (linhas[1] || '').split(/\s+/).filter((t) => /^#[\w-]+$/.test(t)).map((t) => t.slice(1));
  const espera = (linhas.find((l) => l.startsWith('> **Espera você:**')) || '').replace('> **Espera você:**', '').trim().replace(/\.$/, '');
  return { arquivo, nome, pre, titulo, tags, espera, texto };
});
const link = (it) => `[[${it.nome}|${it.pre} · ${it.titulo}]]`;

/* os links de anterior e próximo, no fim de cada arquivo */
let mudados = 0;
itens.forEach((it, k) => {
  const nav = [`[[${INDICE}|Índice]]`];
  if (k > 0) nav.push(`← [[${itens[k - 1].nome}|${itens[k - 1].pre}]]`);
  if (k + 1 < itens.length) nav.push(`[[${itens[k + 1].nome}|${itens[k + 1].pre}]] →`);
  const rodape = `---\n${nav.join(' · ')}\n`;
  /* saem todos os rodapés do fim, não só o último (com CRLF, o de antes não era reconhecido e cada volta somava um) */
  const PE = /\n---\n\[\[0 Índice\|Índice\]\][^\n]*$/;
  let corpo = it.texto.replace(/\s+$/, '');
  while (PE.test(corpo)) corpo = corpo.replace(PE, '').replace(/\s+$/, '');
  const novo = `${corpo}\n\n${rodape}`;
  if (novo !== it.texto) { writeFileSync(join(PASTA, it.arquivo), novo, 'utf8'); mudados++; }
});

/* o índice */
const porTag = new Map();
for (const it of itens) for (const t of it.tags) { if (!porTag.has(t)) porTag.set(t, []); porTag.get(t).push(it); }
const desc = new Map(LEGENDA);
const ordemTags = [...LEGENDA.map(([t]) => t).filter((t) => porTag.has(t)), ...[...porTag.keys()].filter((t) => !desc.has(t)).sort()];
const L = ['# Respostas: o índice', '#indice', '',
  'Cada pedido seu e o que eu fiz com ele: **um arquivo por resposta**, em ordem, desde 20/set/2026. Logo abaixo do título de cada arquivo ficam as **#tags** (várias por resposta). No Obsidian, clicar numa tag mostra todos os arquivos que a têm; aqui embaixo elas estão listadas por tag e em ordem.', '',
  'Os arquivos `00-…` são a fundação (o pedido do começo e as decisões de antes dos itens numerados). Uma resposta nova é um arquivo novo: o próximo número, o título e, na segunda linha, as tags; depois, `node indice-respostas.mjs` refaz este índice.', '',
  '## O que espera você agora', ''];
for (const it of itens) if (it.tags.includes('espera-voce')) L.push(`- ${link(it)}${it.espera ? ': ' + it.espera + '.' : ''}`);
L.push('', '## As tags', '');
for (const t of ordemTags) L.push(`- #${t}: ${desc.get(t) || 'sem descrição'} (${porTag.get(t).length})`);
L.push('', '## Por tag', '');
for (const t of ordemTags) {
  const d = desc.get(t) || 'sem descrição';
  L.push(`### #${t}`, `${d[0].toUpperCase()}${d.slice(1)}.`, '');
  for (const it of porTag.get(t)) L.push(`- ${link(it)}`);
  L.push('');
}
L.push('## Em ordem', '');
for (const it of itens) L.push(`- ${link(it)} · ${it.tags.map((t) => '#' + t).join(' ')}`);
L.push('', 'Também moram no repositório: [[../SISTEMA|SISTEMA.md]] (o sistema de design, as fontes e como voltar atrás) e [[../UNIAO|UNIAO.md]] (o plano de juntar os dois Portal Solar).', '');
writeFileSync(join(PASTA, INDICE + '.md'), L.join('\n'), 'utf8');
console.log(`índice: ${itens.length} arquivos, ${porTag.size} tags; rodapés atualizados: ${mudados}`);
