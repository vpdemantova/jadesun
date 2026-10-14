/* AS LEITURAS NO CADERNO (12/out/2026)
   A página Leituras guarda tudo no navegador; "Levar para o caderno" grava uma nota legível
   em Logboard/# Profile/Leituras.md. Regras da casa:
   - só reescreve a nota se ela está como o app a deixou da última vez (o hash fica em
     dados/leituras-ultimo.json); se você mudou a nota no Obsidian, a versão nova vai para um
     arquivo ao lado, com a data no nome, e nada do que você escreveu é sobrescrito;
   - antes de reescrever, a versão anterior vai para dados/leituras-backups/;
   - a gravação é atômica (escreve num .tmp e renomeia). */
import { readFile, writeFile, rename, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { COFRE } from './vault.mjs';

const AQUI = dirname(dirname(fileURLToPath(import.meta.url)));
const REL = 'Logboard/# Profile/Leituras.md';
const DADOS = join(AQUI, 'dados');
const ULTIMO = join(DADOS, 'leituras-ultimo.json');

const hash = (t) => createHash('sha256').update(String(t)).digest('hex');

async function gravarAtomico(abs, texto) {
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(`${abs}.tmp`, texto, 'utf8');
  await rename(`${abs}.tmp`, abs);
}

export async function levarLeituras({ md }) {
  if (typeof md !== 'string' || md.length < 10 || md.length > 1_000_000) throw Object.assign(new Error('Texto inválido.'), { status: 400 });
  const texto = md.replace(/\r\n?/g, '\n').trim() + '\n';
  const abs = join(COFRE, REL);
  let ultimo = null;
  try { ultimo = JSON.parse(await readFile(ULTIMO, 'utf8')); } catch { ultimo = null; }
  if (existsSync(abs)) {
    const atual = await readFile(abs, 'utf8');
    const mexido = !ultimo || ultimo.hash !== hash(atual.replace(/\r\n?/g, '\n'));
    if (mexido) {
      /* a nota foi mudada fora do app (ou nunca foi do app): não sobrescreve */
      const d = new Date();
      const carimbo = d.toISOString().slice(0, 10) + ' ' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
      const relNovo = `Logboard/# Profile/Leituras (Portal Solar, ${carimbo}).md`;
      await gravarAtomico(join(COFRE, relNovo), texto);
      return { ok: true, rel: relNovo, ao_lado: true, aviso: 'A nota Leituras.md foi mudada fora do Portal Solar; a versão nova foi para um arquivo ao lado, e a sua ficou intacta.' };
    }
    /* 13/out: outro navegador (ou um vazio) não apaga meses de marcas: se a versão nova tem menos da
       metade dos itens da que está no caderno, ela vai para um arquivo ao lado, para comparar */
    const itens = (t) => (String(t).match(/^- /gm) || []).length;
    const antes = itens(atual), depois = itens(texto);
    if (antes >= 6 && depois < antes / 2) {
      const d = new Date();
      const carimbo = d.toISOString().slice(0, 10) + ' ' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
      const relNovo = `Logboard/# Profile/Leituras (Portal Solar, ${carimbo}).md`;
      await gravarAtomico(join(COFRE, relNovo), texto);
      return { ok: true, rel: relNovo, ao_lado: true, aviso: `Este navegador tem bem menos leituras (${depois} itens) do que a nota do caderno (${antes}). Gravei ao lado, para você comparar; a nota antiga ficou intacta.` };
    }
    await mkdir(join(DADOS, 'leituras-backups'), { recursive: true });
    await copyFile(abs, join(DADOS, 'leituras-backups', `Leituras-${Date.now()}.md`));
  }
  await gravarAtomico(abs, texto);
  await mkdir(DADOS, { recursive: true });
  await writeFile(ULTIMO, JSON.stringify({ hash: hash(texto), em: new Date().toISOString() }), 'utf8');
  return { ok: true, rel: REL };
}
