const CHAVE = 'jadesun-jardim';
const HORA = 3600 * 1000;
export const AGUA_ZERO_H = 60;
export const SECA_CADA_H = 14;
export const TOPICOS_POR_SEMENTE = 5;

function hojeISO(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function vazio() {
  return { v: 1, atualizado: 0, orvalho: 0, plantas: {}, extras: [], regas: 0, podas: 0, sementesGanhas: 0, dias: {}, conquistas: {}, diario: [], vistos: {} };
}

export const CONQUISTAS = {
  rega: ['Primeira rega', 'Você regou uma planta pela primeira vez.'],
  poda: ['Primeira poda', 'Uma folha seca a menos.'],
  semente: ['Primeira semente plantada', 'Um canteiro livre virou jardim.'],
  lua: ['Olhei a Lua', 'Você apontou o telescópio para a Lua.'],
  planeta: ['Vi um planeta', 'Um ponto que não pisca: um mundo do Sistema Solar.'],
  cruzeiro: ['Achei o Cruzeiro do Sul', 'A constelação mais famosa do céu do hemisfério sul.'],
  orion: ['Achei Órion', 'O caçador, com o cinturão das Três Marias.'],
  missoes: ['Dia completo', 'As três missões do dia cumpridas.'],
  dez: ['Dez tópicos dominados', 'O jardim já tem raízes.'],
  cinquenta: ['Cinquenta tópicos dominados', 'Um pomar de estudo.'],
  nivel5: ['Nível 5 do jardim', 'Você cuida com constância.'],
  florida: ['Uma planta em flor', 'Estudar também floresce.'],
};

const TITULOS = ['Semente', 'Broto', 'Muda', 'Jardineiro', 'Botânico', 'Guardião do jardim', 'Mestre das estações'];

export function nivelDe(orv) {
  const n = Math.floor(Math.sqrt(orv / 6)) + 1;
  return { n, titulo: TITULOS[Math.min(TITULOS.length - 1, Math.floor((n - 1) / 2))], proximo: 6 * n * n, base: 6 * (n - 1) * (n - 1) };
}

export function aguaDe(reg, agora) {
  if (!reg || !reg.t) return 1;
  const h = (agora - reg.t) / HORA;
  return Math.max(0, 1 - h / AGUA_ZERO_H);
}

export function secasDe(reg, agora) {
  const base = reg && (reg.poda || reg.t) ? (reg.poda || reg.t) : agora;
  return Math.min(5, Math.floor((agora - base) / HORA / SECA_CADA_H));
}

export class Estado {
  constructor() {
    this.d = vazio();
    this.hash = '';
    this.existe = false;
    this.servidor = false;
    this.aoMudar = null;
    this.status = 'navegador';
    this.timer = null;
    this.gravando = false;
    this.sujo = false;
  }

  async carregar() {
    let local = null;
    try { local = JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch (e) { local = null; }
    let remoto = null;
    try {
      const r = await fetch('/api/perfil', { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        const f = j.arquivos && j.arquivos.jardim;
        if (f) {
          this.servidor = true;
          this.hash = f.hash || '';
          this.existe = !!f.existe;
          const m = f.existe && f.texto.match(/```json\s*\n([\s\S]*?)\n```/);
          if (m) { try { remoto = JSON.parse(m[1]); } catch (e) { remoto = null; } }
        }
      }
    } catch (e) { /* sem servidor */ }
    const melhor = [local, remoto].filter(Boolean).sort((a, b) => (b.atualizado || 0) - (a.atualizado || 0))[0];
    this.d = Object.assign(vazio(), melhor || {});
    this.status = this.servidor ? (remoto ? 'caderno' : 'navegador') : 'navegador';
    if (this.servidor && local && (!remoto || (local.atualizado || 0) > (remoto.atualizado || 0))) {
      this.sujo = true;
      this.timer = setTimeout(() => this.gravar(), 3000);
    }
    return this.d;
  }

  dia(iso) {
    iso = iso || hojeISO();
    if (!this.d.dias[iso]) this.d.dias[iso] = { regas: 0, podas: 0, plantou: 0, viu: [], base: null, feitas: [], visitas: [] };
    return this.d.dias[iso];
  }

  registro(id) {
    if (!this.d.plantas[id]) this.d.plantas[id] = { t: 0, poda: 0, dias: [] };
    return this.d.plantas[id];
  }

  mudou() {
    this.d.atualizado = Date.now();
    try { localStorage.setItem(CHAVE, JSON.stringify(this.d)); } catch (e) { /* cheio */ }
    this.sujo = true;
    if (this.aoMudar) this.aoMudar();
    if (this.servidor) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => this.gravar(), 6000);
    }
  }

  ganhar(n) { this.d.orvalho += n; }

  conquista(id) {
    if (this.d.conquistas[id]) return false;
    this.d.conquistas[id] = Date.now();
    this.ganhar(3);
    return true;
  }

  texto() {
    const nv = nivelDe(this.d.orvalho);
    const linhas = this.d.diario.slice(-40).reverse().map((x) => '- ' + x.q + ' · ' + x.t);
    return '---\nformato: wiki\nvisibilidade: privado\n---\n\n# Jardim — estado do jogo\n\n' +
      '> Escrito pelo Jadesun (página Jardim). Você pode ler à vontade. Se editar o bloco JSON, mantenha-o válido; se estragar, apague o arquivo e o jardim recomeça do que estiver no navegador.\n\n' +
      'Nível ' + nv.n + ' (' + nv.titulo + ') · ' + this.d.orvalho + ' orvalhos · ' + this.d.regas + ' regas · ' + this.d.podas + ' podas · ' + (this.d.extras || []).length + ' canteiros extras\n\n' +
      '```json\n' + JSON.stringify(this.d) + '\n```\n\n## Diário do céu\n\n' + (linhas.length ? linhas.join('\n') : 'Ainda sem registros. No jardim, aponte o telescópio para algo e toque em “Registrar no diário”.') + '\n';
  }

  async gravar() {
    if (!this.servidor || this.gravando) return;
    this.gravando = true;
    try {
      const r = await fetch('/api/perfil/salvar', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify({ chave: 'jardim', texto: this.texto(), base: this.hash }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || 'erro');
      this.hash = j.hash;
      this.existe = true;
      this.status = 'caderno';
      this.sujo = false;
    } catch (e) {
      this.status = 'navegador';
      if (/mudou/.test(String(e.message))) {
        try {
          const r2 = await fetch('/api/perfil', { cache: 'no-store' });
          const j2 = await r2.json();
          this.hash = (j2.arquivos.jardim && j2.arquivos.jardim.hash) || '';
          this.timer = setTimeout(() => this.gravar(), 2000);
        } catch (e2) { /* tenta na próxima mudança */ }
      }
    }
    this.gravando = false;
    if (this.aoMudar) this.aoMudar();
  }

  semTinta() { return this.d; }
}

export { hojeISO };
