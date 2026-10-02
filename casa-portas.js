/* O que aparece quando a câmera chega num móvel-porta da casa. Tudo lê e grava no caderno pelas
   mesmas rotas das páginas (nada duplicado): /api/estado e /api/marcar (estudos), /api/musica (música).
   Atlas e Eu abrem a própria página numa folha por cima da casa (?embutido=1 esconde o menu dela). */

const H = { 'Content-Type': 'application/json', 'X-Perfil': '1' };
const esc = (s) => (window.Perfil ? window.Perfil.esc(s) : String(s == null ? '' : s));
const ic = (p) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>';
const VOLTAR = ic('<path d="M15 5l-7 7 7 7"/>');
const FORA = ic('<path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5"/>');

function isoLocal(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function diasAte(iso, hora = '09:00') {
  const alvo = new Date(iso + 'T' + hora + ':00');
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const a = new Date(alvo); a.setHours(0, 0, 0, 0);
  return Math.round((a - hoje) / 86400000);
}
const dataCurta = (iso) => iso.slice(8, 10) + '/' + iso.slice(5, 7);

/* barra de cima das portas: voltar, onde estou, o nome */
function barra(titulo, migalha, resumo) {
  return '<div class="es-barra cs-porta-barra"><div class="eb-linha">' +
    '<button type="button" class="es-voltar" data-porta-fechar title="Voltar pra casa (Esc)" aria-label="Voltar pra casa">' + VOLTAR + '</button>' +
    '<div class="es-titulo"><small class="es-migalha">' + esc(migalha) + '</small><b>' + esc(titulo) + '</b>' + (resumo ? '<span>' + esc(resumo) + '</span>' : '') + '</div>' +
    '</div></div>';
}

/* folha: a página inteira do Jadesun por cima da casa */
function folha(camada, url, titulo, migalha, fechar) {
  const sep = url.includes('?') ? '&' : '?';
  camada.innerHTML =
    '<div class="cs-folha cs-folha-interna aberta" role="dialog" aria-label="' + esc(titulo) + '">' +
      '<header><button type="button" class="es-voltar" data-porta-fechar title="Voltar pra casa (Esc)" aria-label="Voltar pra casa">' + VOLTAR + '</button>' +
      '<div class="es-titulo"><small class="es-migalha">' + esc(migalha) + '</small><b>' + esc(titulo) + '</b></div>' +
      '<a class="cs-folha-fora" href="' + esc(url) + '" title="Abrir a página inteira">' + FORA + '<span>Página inteira</span></a>' +
      '<button type="button" class="es-x" data-porta-fechar aria-label="Fechar">×</button></header>' +
      '<div class="cs-folha-corpo"><div class="cs-folha-carregando">Abrindo ' + esc(titulo.toLowerCase()) + '…</div><iframe src="' + esc(url + sep + 'embutido=1') + '" title="' + esc(titulo) + '" loading="eager"></iframe></div>' +
    '</div>';
  const ifr = camada.querySelector('iframe');
  ifr.addEventListener('load', () => { const c = camada.querySelector('.cs-folha-carregando'); if (c) c.remove(); });
  camada.querySelectorAll('[data-porta-fechar]').forEach((b) => b.addEventListener('click', fechar));
  return null;
}

/* ---------- escrivaninha: hoje ---------- */
async function pintarEstudos(corpo, ctx) {
  corpo.innerHTML = '<p class="gr-apagado">Abrindo o dia…</p>';
  let e;
  const musicaP = fetch('/api/musica').then((r) => (r.ok ? r.json() : null)).catch(() => null);
  try { e = await window.Perfil.estado(true); } catch (erro) {
    corpo.innerHTML = '<p class="gr-apagado">Não consegui ler o dia (' + esc(erro.message || 'servidor') + ').</p><button type="button" class="eo-mini principal" data-a="de-novo">Tentar de novo</button>';
    corpo.querySelector('[data-a="de-novo"]').addEventListener('click', () => pintarEstudos(corpo, ctx));
    return;
  }
  const prova = e.contagem && e.contagem.prova;
  const faltam = prova ? diasAte(prova) : null;
  const hoje = isoLocal(new Date());
  const dia = (e.roteiro || []).find((d) => d.data === hoje);
  const pendentes = [];
  let total = 0, feitos = 0;
  (e.checklist || []).forEach((s) => s.itens.forEach((i) => { total++; if (i.feito) feitos++; else pendentes.push({ secao: s.nome, texto: i.texto, grupo: i.grupo }); }));
  // o prazo que vem antes da prova: os vídeos de Música (só aparece enquanto falta algo e a janela está aberta)
  const mus = await musicaP;
  const musFaltam = mus && mus.prazo ? diasAte(mus.prazo, '23:59') : null;
  const musFeitos = mus ? mus.itens.filter((i) => i.feito).length : 0;
  const mostrarMusica = mus && mus.existe && musFaltam != null && musFaltam >= 0 && musFeitos < mus.itens.length;
  corpo.innerHTML =
    (faltam != null ? '<div class="cs-contagem"><b>' + Math.max(0, faltam) + '</b><span>' + (faltam === 0 ? 'hoje é a 1ª fase' : faltam === 1 ? 'dia pra 1ª fase' : 'dias pra 1ª fase') + '<br>domingo ' + dataCurta(prova) + ', 9h</span></div>' : '') +
    (mostrarMusica ? '<button type="button" class="cs-alerta" data-a="musica"><b>Vídeos de Música</b> · ' + musFeitos + ' de ' + mus.itens.length + ' feitos · envio até ' + dataCurta(mus.prazo) + (musFaltam === 0 ? ' — é hoje' : ' — faltam ' + musFaltam + (musFaltam === 1 ? ' dia' : ' dias')) + ' →</button>' : '') +
    '<section class="cs-sec"><p class="es-rot">O roteiro de hoje</p>' +
      (dia ? '<ol class="cs-blocos">' + [dia.bloco1, dia.bloco2, dia.treino].filter(Boolean).map((b, i) => '<li><i>' + ['1º bloco', '2º bloco', 'treino'][i] + '</i>' + esc(b) + '</li>').join('') + '</ol>'
        : '<p class="gr-apagado">Nada no roteiro pra hoje (' + dataCurta(hoje) + ').</p>') +
    '</section>' +
    ((e.tarefas || []).length ? '<section class="cs-sec"><p class="es-rot">Tarefas simples</p><ul class="cs-tarefas">' + e.tarefas.slice(0, 5).map((t) => '<li><b>' + esc(t.tarefa) + '</b><span>' + esc([t.area, t.tempo].filter(Boolean).join(' · ')) + '</span></li>').join('') + '</ul></section>' : '') +
    '<section class="cs-sec"><p class="es-rot">Próximos do Checklist <em class="cs-conta">' + feitos + ' de ' + total + '</em></p>' +
      '<div class="cs-barrinha"><i style="width:' + (total ? Math.round((feitos / total) * 100) : 0) + '%"></i></div>' +
      '<ul class="cs-check">' + pendentes.slice(0, 6).map((p, k) => '<li><label><input type="checkbox" data-k="' + k + '"><span><em>' + esc(p.secao) + '</em>' + esc(p.texto) + '</span></label></li>').join('') + '</ul>' +
      (pendentes.length ? '' : '<p class="gr-apagado">Tudo marcado. ✓</p>') +
    '</section>' +
    '<div class="es-botoes-form"><button type="button" class="principal" data-a="agora">Abrir o Agora inteiro</button></div>';
  corpo.querySelectorAll('.cs-check input').forEach((inp) => inp.addEventListener('change', async () => {
    const p = pendentes[+inp.dataset.k];
    inp.disabled = true;
    try {
      await window.Perfil.marcar(p.secao, p.texto, inp.checked);
      ctx.aviso(inp.checked ? 'Marcado no Checklist ✓' : 'Desmarcado.');
    } catch (erro) { inp.checked = !inp.checked; ctx.aviso(erro.message || 'Não consegui marcar.', 'erro'); }
    inp.disabled = false;
  }));
  const bm = corpo.querySelector('[data-a="musica"]'); if (bm) bm.addEventListener('click', () => ctx.irPara('musica'));
  corpo.querySelector('[data-a="agora"]').addEventListener('click', () => ctx.folha('hoje.html', 'Agora'));
}

/* ---------- piano: os vídeos de Música ---------- */
async function pintarMusica(corpo, ctx) {
  corpo.innerHTML = '<p class="gr-apagado">Abrindo…</p>';
  let d;
  try { d = await fetch('/api/musica').then((r) => { if (!r.ok) throw new Error('servidor ' + r.status); return r.json(); }); } catch (erro) {
    corpo.innerHTML = '<p class="gr-apagado">Não consegui ler o checklist dos vídeos (' + esc(erro.message) + ').</p><button type="button" class="eo-mini principal" data-a="de-novo">Tentar de novo</button>';
    corpo.querySelector('[data-a="de-novo"]').addEventListener('click', () => pintarMusica(corpo, ctx));
    return;
  }
  const faltam = diasAte(d.prazo, '23:59');
  const feitos = d.itens.filter((i) => i.feito).length;
  corpo.innerHTML =
    '<div class="cs-contagem' + (faltam <= 1 ? ' urgente' : '') + '"><b>' + (faltam < 0 ? '—' : faltam) + '</b><span>' + (faltam < 0 ? 'a janela de envio fechou' : faltam === 0 ? 'último dia pra enviar' : faltam === 1 ? 'dia pra enviar' : 'dias pra enviar') + '<br>vídeos até ' + dataCurta(d.prazo) + '</span></div>' +
    '<section class="cs-sec"><p class="es-rot">Habilidades Específicas — Licenciatura <em class="cs-conta">' + feitos + ' de ' + d.itens.length + '</em></p>' +
      '<div class="cs-barrinha"><i style="width:' + (d.itens.length ? Math.round((feitos / d.itens.length) * 100) : 0) + '%"></i></div>' +
      (d.existe ? '<ul class="cs-check">' + d.itens.map((i, k) => '<li><label><input type="checkbox" data-k="' + k + '"' + (i.feito ? ' checked' : '') + '><span>' + esc(i.texto) + '</span></label></li>').join('') + '</ul>'
        : '<p class="gr-apagado">O arquivo dos vídeos não está no caderno.</p>') +
    '</section>' +
    '<p class="gr-apagado">O guia completo (o que gravar, regras, critérios) está no caderno, em <b>Focos/Vídeos de Música — Habilidades Específicas</b>.</p>';
  corpo.querySelectorAll('.cs-check input').forEach((inp) => inp.addEventListener('change', async () => {
    const item = d.itens[+inp.dataset.k];
    inp.disabled = true;
    try {
      const r = await fetch('/api/musica', { method: 'POST', headers: H, body: JSON.stringify({ texto: item.texto, feito: inp.checked }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.erro || 'Não consegui marcar.');
      ctx.aviso(inp.checked ? 'Marcado no caderno ✓' : 'Desmarcado.');
      pintarMusica(corpo, ctx);
    } catch (erro) { inp.checked = !inp.checked; inp.disabled = false; ctx.aviso(erro.message, 'erro'); }
  }));
}

/* ---------- a porta ---------- */
export function preencherPorta(liga, camada, ctx) {
  // ctx: { titulo, migalha, fechar, aviso, irPara, prazoMusica }
  const abrirFolha = (url, titulo) => folha(camada, url, titulo, ctx.migalha + ' ' + ctx.titulo + ' ›', ctx.fechar);
  if (liga === 'atlas') return folha(camada, 'atlas.html', 'Atlas', ctx.migalha, ctx.fechar);
  if (liga === 'eu') return folha(camada, 'eu.html', 'Eu', ctx.migalha, ctx.fechar);
  const titulos = { estudos: ['Escrivaninha', 'os estudos de hoje'], musica: ['Música', 'os vídeos e a prática'] };
  const [titulo, resumo] = titulos[liga] || [ctx.titulo, ''];
  camada.innerHTML = barra(titulo, ctx.migalha, resumo) +
    '<div class="es-livro cs-porta aberto" role="dialog" aria-label="' + esc(titulo) + '">' +
      '<button type="button" class="es-x" data-porta-fechar aria-label="Fechar">×</button>' +
      '<h2>' + esc(liga === 'estudos' ? 'Hoje na escrivaninha' : 'Música') + '</h2><div class="cs-porta-corpo"></div>' +
    '</div>';
  camada.querySelectorAll('[data-porta-fechar]').forEach((b) => b.addEventListener('click', ctx.fechar));
  const corpo = camada.querySelector('.cs-porta-corpo');
  const c2 = Object.assign({}, ctx, { folha: abrirFolha });
  if (liga === 'estudos') pintarEstudos(corpo, c2);
  else if (liga === 'musica') pintarMusica(corpo, c2);
  return null;
}
