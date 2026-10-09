import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { carregarEstado, marcarItem, pastaImagens, COFRE } from './lib/vault.mjs';
import { indicePublico, ficha, buscar, caminhoMidia, esquecerIndice, fichaDaImagem, lacunas, estudosDosItens, mapasDasSecoes } from './lib/biblioteca.mjs';
import { lerPerfil, salvarPerfil, desfazerPerfil, numerosDoCaderno } from './lib/perfil.mjs';
import { obterObras } from './lib/obras.mjs';
import { obterLivros, salvarLivro, buscarDadosLivro, renomearValor, atribuirSecao, editarLote } from './lib/livros.mjs';
import { lerEstante, gravarEstante } from './lib/estante.mjs';
import { lerGuardaRoupa, gravarGuardaRoupa } from './lib/roupas.mjs';
import { lerCasa, gravarCasa } from './lib/casa.mjs';
import { lerMusica, marcarMusica } from './lib/musica.mjs';
import { imagensParaEventos } from './lib/linha.mjs';
import { tabuasEObras } from './lib/tabuas.mjs';
import { areas, marcarPratica, auditarAreas } from './lib/areas.mjs';
import { carta } from './lib/cartas.mjs';
import { vitrine, lerFichaRemota } from './lib/vitrine.mjs';
import { lerDominio, marcarConceitos } from './lib/dominio.mjs';
import { lerCuradoria, levarCuradoria } from './lib/curadoria.mjs';
import { guiasAgora } from './lib/guias.mjs';
import { lerManifesto } from './lib/manifesto.mjs';
import { arvore, lerNota, gravarNota, moverNota, criarPasta, buscarNotas } from './lib/notas.mjs';
import { sessaoDe, estadoConta, criarConta, entrar, sair, trocarSenha, iniciarOAuth, retornoOAuth, desligarProvedor, gravarProvedores, opcoesChave, ligarChave, entrarComChave, apagarChave } from './lib/contas.mjs';
import { MODO_CELULAR, enderecosLocais, tokenCelular, hostsPermitidos, ehLocal, hostAceito, gravarEndereco, autorizar } from './lib/rede.mjs';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const PORTA = Number(process.env.PORTA || 4321);
const HOSTS = hostsPermitidos(PORTA);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

function responder(res, status, tipo, corpo, cache = 'no-store') {
  res.writeHead(status, { 'Content-Type': tipo, 'Cache-Control': cache, 'X-Content-Type-Options': 'nosniff' });
  res.end(corpo);
}

const json = (res, status, dados) => responder(res, status, 'application/json; charset=utf-8', JSON.stringify(dados));
/* a resposta da Conta leva o cookie da sessão junto (item 74) */
function jsonComCookie(res, status, dados, cookie) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...(cookie ? { 'Set-Cookie': cookie } : {}) });
  res.end(JSON.stringify(dados));
}
/* fora do computador (modo celular), sem sessão, só a página Conta e o que ela precisa abrem: o resto pede o código ou a senha */
const PUBLICO_CONTA = new Set(['/entrar.html', '/conta.js', '/tema.js', '/icones.js', '/perfil.js', '/perfil.css', '/fino.css', '/solar.css', '/paginas.css', '/dominio.css', '/movimento.css', '/icone.svg', '/icone-192.png', '/manifest.webmanifest', '/api/conta', '/api/conta/entrar', '/api/conta/chave/opcoes', '/api/conta/chave/entrar']);

let memo = null;
let memoEm = 0;
let emAndamento = null;
let geracao = 0;

function estadoCache() {
  if (memo && Date.now() - memoEm < 3000) return Promise.resolve(memo);
  if (!emAndamento) {
    const g = geracao;
    emAndamento = carregarEstado()
      .then((e) => { if (g === geracao) { memo = e; memoEm = Date.now(); } return e; })
      .finally(() => { if (g === geracao) emAndamento = null; });
  }
  return emAndamento;
}

function esquecerEstado() {
  geracao += 1;
  memo = null;
  emAndamento = null;
}

function lerCorpo(req, limite = 10_000) {
  return new Promise((resolve, reject) => {
    let total = '';
    let cheio = false;
    req.on('data', (parte) => {
      if (cheio) return;
      total += parte;
      if (total.length > limite) { cheio = true; total = ''; reject(Object.assign(new Error('Corpo grande demais.'), { status: 413 })); }
    });
    req.on('end', () => resolve(total));
    req.on('error', reject);
  });
}

async function servirArquivo(res, arquivo, cache) {
  try {
    const dados = await readFile(arquivo);
    responder(res, 200, TIPOS[extname(arquivo).toLowerCase()] || 'application/octet-stream', dados, cache);
  } catch {
    responder(res, 404, 'text/plain; charset=utf-8', 'Não encontrado.');
  }
}

const servidor = http.createServer(async (req, res) => {
  try {
    /* item 75: além do computador e da rede de casa, o endereço do túnel (se você configurou um na Conta) */
    if (!hostAceito(req.headers.host || '', PORTA)) return responder(res, 403, 'text/plain; charset=utf-8', 'Host inválido. (Se é o endereço do seu túnel, acrescente-o na página Conta, no computador.)');
    const url = new URL(req.url, `http://${req.headers.host}`);
    const caminho = decodeURIComponent(url.pathname);
    if (autorizar(req, res, url, { sessao: () => !!sessaoDe(req), publico: () => PUBLICO_CONTA.has(caminho) || /^\/auth\/(github|google)(\/retorno)?$/.test(caminho) }) !== 'ok') return;

    /* ---------- a Conta (item 74): senha (scrypt) e redes sociais (OAuth), local-first ---------- */
    if (caminho === '/api/conta' && req.method === 'GET') return json(res, 200, estadoConta(req, { local: ehLocal(req), porta: PORTA }));
    if (caminho.startsWith('/api/conta/') && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      const corpo = JSON.parse((await lerCorpo(req, caminho.startsWith('/api/conta/chave/') ? 24_000 : 4000)) || '{}');
      const local = ehLocal(req);
      if (caminho === '/api/conta/criar') { const r = await criarConta(corpo, req, { local }); return jsonComCookie(res, 200, { conta: r.conta }, r.cookie); }
      if (caminho === '/api/conta/entrar') { const r = await entrar(corpo, req); return jsonComCookie(res, 200, { conta: r.conta }, r.cookie); }
      if (caminho === '/api/conta/sair') { const r = sair(req, { todas: !!corpo.todas }); return jsonComCookie(res, 200, { ok: true }, r.cookie); }
      if (caminho === '/api/conta/senha') return json(res, 200, await trocarSenha(corpo, req, { local }));
      if (caminho === '/api/conta/desligar') return json(res, 200, desligarProvedor(String(corpo.provedor || ''), req));
      /* item 75: o endereço de fora (o túnel) e as chaves das redes só se gravam no próprio computador */
      if (caminho === '/api/conta/endereco') { if (!local) return json(res, 403, { erro: 'Só no computador.' }); return json(res, 200, gravarEndereco(corpo.endereco)); }
      if (caminho === '/api/conta/provedores') { if (!local) return json(res, 403, { erro: 'Só no computador.' }); return json(res, 200, gravarProvedores(corpo)); }
      /* a digital do aparelho (passkeys) */
      if (caminho === '/api/conta/chave/opcoes') return json(res, 200, opcoesChave(corpo.tipo === 'ligar' ? 'ligar' : 'entrar', req));
      if (caminho === '/api/conta/chave/ligar') return json(res, 200, ligarChave(corpo, req));
      if (caminho === '/api/conta/chave/entrar') { const r = entrarComChave(corpo, req); return jsonComCookie(res, 200, { conta: r.conta }, r.cookie); }
      if (caminho === '/api/conta/chave/apagar') return json(res, 200, apagarChave(corpo, req, { local }));
      return json(res, 404, { erro: 'Não existe.' });
    }
    const auth = caminho.match(/^\/auth\/(github|google)(\/retorno)?$/);
    if (auth && req.method === 'GET') {
      try {
        if (!auth[2]) { res.writeHead(302, { Location: iniciarOAuth(auth[1], req, { porta: PORTA }), 'Cache-Control': 'no-store' }); return res.end(); }
        const r = await retornoOAuth(auth[1], url, req, { local: ehLocal(req), porta: PORTA });
        res.writeHead(302, { Location: '/entrar.html?ok=' + auth[1], 'Set-Cookie': r.cookie, 'Cache-Control': 'no-store' }); return res.end();
      } catch (e) {
        res.writeHead(302, { Location: '/entrar.html?erro=' + encodeURIComponent(e.message), 'Cache-Control': 'no-store' }); return res.end();
      }
    }

    if (caminho === '/api/celular' && req.method === 'GET') {
      if (!ehLocal(req)) return json(res, 403, { erro: 'Só no computador.' });
      if (!MODO_CELULAR) return json(res, 200, { ativo: false });
      const t = tokenCelular();
      return json(res, 200, { ativo: true, porta: PORTA, token: t, enderecos: enderecosLocais().map((e) => ({ ...e, url: `http://${e.ip}:${PORTA}/?t=${t}` })) });
    }

    if (caminho === '/api/estado' && req.method === 'GET') return json(res, 200, await estadoCache());

    if (caminho === '/api/marcar' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      const { secao, texto, feito } = JSON.parse(await lerCorpo(req));
      if (typeof secao !== 'string' || typeof texto !== 'string' || typeof feito !== 'boolean') return json(res, 400, { erro: 'Pedido inválido.' });
      const resultado = await marcarItem({ secao, texto, feito });
      esquecerEstado();
      return json(res, 200, { ...resultado, estado: await estadoCache() });
    }

    /* o domínio dos conceitos (item 74): as marcas dos subtópicos de cada estudo, num arquivo próprio do caderno */
    if (caminho === '/api/dominio' && req.method === 'GET') return json(res, 200, await lerDominio());
    if (caminho === '/api/dominio/marcar' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      const { codigo, titulo, conceitos, todos, feito } = JSON.parse(await lerCorpo(req, 60_000));
      if (typeof feito !== 'boolean' || !Array.isArray(conceitos)) return json(res, 400, { erro: 'Pedido inválido.' });
      return json(res, 200, await marcarConceitos({ codigo, titulo, conceitos, todos: Array.isArray(todos) ? todos : [], feito }));
    }

    /* o caderno de notas (item 75): o editor zen grava direto no caderno, sem sobrescrever às cegas */
    if (caminho === '/api/notas/arvore' && req.method === 'GET') return json(res, 200, await arvore({ fresco: url.searchParams.get('fresco') === '1' }));
    if (caminho === '/api/notas/ler' && req.method === 'GET') return json(res, 200, await lerNota(url.searchParams.get('rel')));
    if (caminho === '/api/notas/buscar' && req.method === 'GET') return json(res, 200, await buscarNotas(url.searchParams.get('q')));
    if (caminho.startsWith('/api/notas/') && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      const corpo = JSON.parse((await lerCorpo(req, 2_100_000)) || '{}');
      try {
        if (caminho === '/api/notas/gravar') return json(res, 200, await gravarNota(corpo));
        if (caminho === '/api/notas/mover') return json(res, 200, await moverNota(corpo));
        if (caminho === '/api/notas/pasta') return json(res, 200, await criarPasta(corpo));
      } catch (e) { if (e.status === 409 && e.atual) return json(res, 409, { erro: e.message, atual: e.atual }); throw e; }
      return json(res, 404, { erro: 'Não existe.' });
    }

    /* o Manifesto (item 75): o 0 O Manifesto e a XV (lidos do b Studio, só eles e só para ler) e a sua voz */
    if (caminho === '/api/manifesto' && req.method === 'GET') return json(res, 200, await lerManifesto());

    /* os Guias (item 74): as manchetes das fontes, agora (com cópia para quando faltar internet) */
    if (caminho === '/api/guias/agora' && req.method === 'GET') return json(res, 200, await guiasAgora({ fresco: url.searchParams.get('fresco') === '1' }));

    /* a curadoria (item 74): os posts que moram no caderno; "levar" cria o arquivo de um rascunho do app */
    if (caminho === '/api/curadoria' && req.method === 'GET') return json(res, 200, await lerCuradoria());
    if (caminho === '/api/curadoria/levar' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      try { return json(res, 200, await levarCuradoria(JSON.parse(await lerCorpo(req, 420_000)))); }
      catch (e) { if (e.status === 409) return json(res, 409, { erro: e.message, rel: e.rel || '' }); throw e; }
    }

    if (caminho === '/api/areas/pratica' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      const { materia, id, feita } = JSON.parse(await lerCorpo(req));
      if (typeof materia !== 'string' || typeof id !== 'string' || typeof feita !== 'boolean') return json(res, 400, { erro: 'Pedido inválido.' });
      return json(res, 200, await marcarPratica({ materia, id, feita }));
    }

    if (caminho === '/api/perfil/salvar' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      const { chave, texto, base } = JSON.parse(await lerCorpo(req, 400_000));
      return json(res, 200, await salvarPerfil({ chave, texto, base }));
    }

    if (caminho === '/api/linha' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      const { eventos } = JSON.parse(await lerCorpo(req, 120_000));
      if (!Array.isArray(eventos) || eventos.length > 500 || eventos.some((e) => !Array.isArray(e) || e.length < 6)) return json(res, 400, { erro: 'Eventos inválidos.' });
      return json(res, 200, await imagensParaEventos(eventos));
    }

    if (caminho === '/api/perfil/desfazer' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      const { chave } = JSON.parse(await lerCorpo(req));
      return json(res, 200, await desfazerPerfil({ chave }));
    }

    if (caminho === '/api/livros/salvar' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      const corpo = JSON.parse(await lerCorpo(req));
      const r = await salvarLivro(corpo);
      return json(res, 200, { ...r, livros: await obterLivros() });
    }

    if (caminho === '/api/livros/renomear' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      const { campo, de, para } = JSON.parse(await lerCorpo(req));
      const r = await renomearValor(campo, de, para);
      return json(res, 200, { ...r, livros: await obterLivros() });
    }

    if (caminho === '/api/livros/atribuir-secao' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      const { itens, secaoReal } = JSON.parse(await lerCorpo(req, 400_000));
      const r = await atribuirSecao(itens, secaoReal);
      return json(res, 200, { ...r, livros: await obterLivros() });
    }

    if (caminho === '/api/livros/lote' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      const r = await editarLote(JSON.parse(await lerCorpo(req, 400_000)));
      return json(res, 200, { ...r, livros: await obterLivros() });
    }

    if (caminho === '/api/estante/layout' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      return json(res, 200, await gravarEstante(JSON.parse(await lerCorpo(req, 200_000))));
    }

    if (caminho === '/api/guarda-roupa' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      try {
        return json(res, 200, await gravarGuardaRoupa(JSON.parse(await lerCorpo(req, 400_000))));
      } catch (e) {
        if (e.status === 409) return json(res, 409, { erro: e.message, atual: await lerGuardaRoupa() });
        throw e;
      }
    }

    if (caminho === '/api/musica' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      return json(res, 200, await marcarMusica(JSON.parse(await lerCorpo(req, 10_000))));
    }

    if (caminho === '/api/casa' && req.method === 'POST') {
      if (req.headers['x-perfil'] !== '1') return json(res, 403, { erro: 'Cabeçalho ausente.' });
      try {
        return json(res, 200, await gravarCasa(JSON.parse(await lerCorpo(req, 600_000))));
      } catch (e) {
        if (e.status === 409) return json(res, 409, { erro: e.message, atual: await lerCasa() });
        throw e;
      }
    }

    if (req.method !== 'GET') return json(res, 405, { erro: 'Método não permitido.' });

    if (caminho === '/api/perfil') {
      let cartas = 0;
      try { cartas = (await estadoCache()).cartas; } catch { /* segue sem cartas */ }
      return json(res, 200, { arquivos: await lerPerfil(), numeros: await numerosDoCaderno(cartas) });
    }
    if (caminho === '/favicon.ico') return responder(res, 204, 'text/plain', '');

    if (caminho === '/api/biblioteca') {
      if (url.searchParams.get('fresco') === '1') esquecerIndice();
      return json(res, 200, await indicePublico());
    }

    if (caminho === '/api/ficha') {
      const f = await ficha(url.searchParams.get('id') || '');
      return f ? json(res, 200, f) : json(res, 404, { erro: 'Ficha não encontrada.' });
    }

    if (caminho === '/api/imagem-ficha') {
      const r = await fichaDaImagem(url.searchParams.get('nome'));
      return r ? json(res, 200, r) : json(res, 404, { erro: 'Imagem sem ficha.' });
    }

    /* a ficha que se compartilha (só o público) e, para o dono, a ficha inteira (?tudo=1); item 72 */
    if (caminho === '/api/vitrine') return json(res, 200, await vitrine({ tudo: url.searchParams.get('tudo') === '1' }));
    if (caminho === '/api/rede/ficha') return json(res, 200, await lerFichaRemota(url.searchParams.get('url') || ''));
    if (caminho === '/api/lacunas') return json(res, 200, await lacunas());

    if (caminho === '/api/obras') return json(res, 200, await obterObras(url.searchParams.get('fresco') === '1'));

    if (caminho === '/api/livros') return json(res, 200, await obterLivros(url.searchParams.get('fresco') === '1'));

    if (caminho === '/api/estante/layout') return json(res, 200, await lerEstante());

    if (caminho === '/api/guarda-roupa') return json(res, 200, await lerGuardaRoupa());

    if (caminho === '/api/casa') return json(res, 200, await lerCasa());

    if (caminho === '/api/musica') return json(res, 200, await lerMusica());

    // onde está o caderno (o menu Tudo abre o Mapa de Tudo no Obsidian com isso)
    if (caminho === '/api/cofre') return json(res, 200, { cofre: COFRE, mapa: '2 Academy/0 Aulas - Lições e Contexto/00 Mapa de Tudo.md' });

    if (caminho === '/api/livros/buscar') return json(res, 200, await buscarDadosLivro(url.searchParams.get('titulo') || ''));

    if (caminho === '/api/estudos-dos-itens') return json(res, 200, await estudosDosItens((await estadoCache()).checklist));

    if (caminho === '/api/mapas-das-secoes') return json(res, 200, await mapasDasSecoes());

    if (caminho === '/api/carta') {
      const c = await carta({ id: url.searchParams.get('id') || '', nome: url.searchParams.get('nome') || '' });
      return c ? json(res, 200, c) : json(res, 404, { erro: 'Carta não encontrada.' });
    }

    if (caminho === '/api/areas/auditoria') return json(res, 200, await auditarAreas((await estadoCache()).checklist));

    if (caminho === '/api/areas' && req.method === 'GET') {
      if (url.searchParams.get('fresco') === '1') esquecerIndice();
      return json(res, 200, await areas((await estadoCache()).checklist, { resumo: url.searchParams.get('resumo') === '1', mapa: url.searchParams.get('mapa') === '1', so: url.searchParams.get('m') || '' }));
    }

    if (caminho === '/api/tabuas-e-obras') {
      if (url.searchParams.get('fresco') === '1') esquecerIndice();
      return json(res, 200, await tabuasEObras());
    }

    if (caminho === '/api/buscar') {
      return json(res, 200, await buscar(url.searchParams.get('q') || '', 40));
    }

    if (caminho === '/midia') {
      const arquivo = caminhoMidia(url.searchParams.get('p'));
      if (!arquivo) return responder(res, 400, 'text/plain; charset=utf-8', 'Caminho inválido.');
      return servirArquivo(res, arquivo, 'public, max-age=3600');
    }

    if (caminho.startsWith('/imagens/')) {
      const nome = caminho.slice('/imagens/'.length);
      if (!nome || /[\\/]/.test(nome) || nome.includes('..')) return responder(res, 400, 'text/plain; charset=utf-8', 'Nome inválido.');
      return servirArquivo(res, join(pastaImagens(), nome));
    }

    if (caminho.startsWith('/vendor/')) {
      const nome = caminho.slice('/vendor/'.length);
      if (!/^([A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*\.(js|txt)$/.test(nome) || nome.includes('..')) return responder(res, 404, 'text/plain; charset=utf-8', 'Não encontrado.');
      return servirArquivo(res, join(RAIZ, 'vendor', nome), 'public, max-age=3600');
    }

    const pagina = caminho === '/' ? '/atlas.html' : caminho; /* 08/out/2026: a casa de entrada é o Atlas (PERFIL.md item 72) */
    if (!/^\/[a-z0-9-]+\.(html|css|js|svg|png|webmanifest)$/i.test(pagina)) return responder(res, 404, 'text/plain; charset=utf-8', 'Não encontrado.');
    return servirArquivo(res, join(RAIZ, pagina.slice(1)));
  } catch (erro) {
    json(res, erro.status || 500, { erro: erro.message });
  }
});

function abrirNavegador() {
  if (process.env.SEM_NAVEGADOR) return;
  const url = `http://127.0.0.1:${PORTA}/${MODO_CELULAR ? 'celular.html' : ''}`;
  exec(process.platform === 'win32' ? `start "" ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`);
}

servidor.on('error', (erro) => {
  if (erro.code === 'EADDRINUSE') {
    console.log(`Já existe um Perfil ligado em http://127.0.0.1:${PORTA}/.`);
    console.log(`Use a aba que já está aberta; esta execução não abrirá outra. Se não encontrar a aba, acesse http://127.0.0.1:${PORTA}/.`);
    if (MODO_CELULAR) console.log('Para ligar o modo celular: feche a outra janela preta (hoje.bat) e abra celular.bat de novo.');
    setTimeout(() => process.exit(0), 400);
  } else {
    throw erro;
  }
});

servidor.listen(PORTA, MODO_CELULAR ? '0.0.0.0' : '127.0.0.1', () => {
  estadoCache().catch(() => {});
  indicePublico().catch(() => {});
  console.log(`Perfil no ar em http://127.0.0.1:${PORTA}/`);
  console.log('Deixe esta janela aberta enquanto usa. Feche-a para desligar.');
  if (MODO_CELULAR) {
    const t = tokenCelular();
    console.log('\nMODO CELULAR LIGADO. No celular ou tablet (mesmo Wi-Fi), abra um destes links:');
    for (const e of enderecosLocais()) console.log(`   http://${e.ip}:${PORTA}/?t=${t}   (${e.nome})`);
    console.log('Ou aponte a câmera para o QR que abriu no navegador do computador.');
    console.log('Se o Windows perguntar sobre o firewall, marque REDE PRIVADA e permita.');
  }
  abrirNavegador();
});
