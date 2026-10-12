# 80 · A publicação: o site pessoal no ar, o Portal Solar em montagnedejade.org
#publicacao #vitordemantova #registro #espera-voce

> **Espera você:** antes de 14/nov/2026, recuperar a conta da Squarespace (o e-mail antigo não abre mais) para garantir a renovação do montagnedejade.org.

**"publique e dê push em tudo"** (12/out/2026)

## O site pessoal

- **No ar em www.vitordemantova.com:** o commit `a734d99` foi para a `main` do GitHub, com tudo de 11/out (os 22 idiomas, a Malha e o gerador, nenhum oval, o endereço dos modos, o Perfil, os portfólios). Antes do push, o build rodou de novo numa cópia limpa e passou. No ar, as bandeiras respondem e o código publicado é o mesmo do build.
- **O aviso do GitHub não chegou à Vercel:** o push não disparou a publicação automática, e em 12 minutos nada aconteceu. Pedi então à Vercel que publicasse aquele mesmo commit, direto do GitHub e sem subir arquivos deste computador; às 12h18 estava no ar. Se o próximo push também não publicar sozinho, a ligação do GitHub com a Vercel pode precisar ser refeita (Vercel › vitordemantova › Settings › Git). Até lá, eu publico do mesmo jeito.

## O Portal Solar

- **O login na Vercel neste Mac:** a conta vitorpetri, na equipe "vitorde's projects". Você aprovou no navegador.
- **O site público está no ar** no projeto portal-solar da Vercel. É a exportação de 09/out (a do 077, com a privacidade conferida); desde então, nada do site público mudou. São 4.074 arquivos e 218 MB. Endereços:
  - **https://montagnedejade.org** (o domínio voltou);
  - https://montagnedejade.vercel.app;
  - www.montagnedejade.org leva ao endereço principal.
- **Por que o domínio voltou:** o montagnedejade.org continua registrado na Squarespace (que comprou o Google Domains), mas os registros dele já apontavam para a Vercel. O domínio também já estava na sua conta da Vercel, só que solto, sem projeto, por isso dava "DEPLOYMENT_NOT_FOUND". Bastou ligá-lo ao projeto portal-solar, sem passar pelo e-mail perdido. O certificado (o https) saiu na hora e a Vercel o renova sozinha.
- **O que ainda depende da Squarespace:** o registro do domínio vence em **14/nov/2026**. Se a renovação automática estiver ligada e o cartão valer, renova sozinho; sem o e-mail, porém, não dá para ver se deu certo. Se não renovar, o site sai do ar nesse endereço (o montagnedejade.vercel.app continua). Por isso o passo é recuperar a conta (pelo suporte da Squarespace) antes dessa data.
- **Um cuidado:** o projeto portal-solar da Vercel está ligado ao repositório `interface` (o Portal Solar antigo), e um push na `main` do interface publicaria a versão antiga por cima. A versão nova veio da pasta `exportado/vercel` do jadesun; para publicar de novo, basta `npx vercel deploy --prebuilt --prod` nessa pasta.
- **O montaignedejade.org** (com "ai"), que também é do projeto portal-solar, não abre porque os registros dele não apontam para a Vercel. Ficou como estava.

## O git

- **Portal Solar:** os itens 69 a 78 você mesmo já tinha enviado (o commit "." de 11/out, às 17h40). Agora subiram o 079, este 080 e o índice.
- **Site pessoal:** o commit `a734d99` e, depois, um commit de registro: o `CHANGELOG.md` e o `ESTADO-DO-SITE.md` dizem que tudo está no ar e que o domínio voltou.

## Pode esperar (nada quebra)

- **O Mural:** o passo do 079 (Vercel › Storage › Upstash for Redis › ligar ao projeto › Redeploy) continua valendo. Sem ele, o Mural mostra "abre em breve".
- **A prancha:** a sua escolha (078).
- **No Windows:** antes de mexer no Portal Solar lá, um `git pull` traz tudo (o GitHub agora tem os itens até o 080).
- **O teste do push automático:** o commit de registro do site pessoal (`aae783b`) foi enviado para ver se a Vercel publica sozinha; na hora, a Vercel não respondia deste computador. Ele só mexe em documentos, então o site não muda com ele. No próximo push confiro de novo.

---
[[0 Índice|Índice]] · ← [[079 — O site pessoal, a Malha e o gerador, nenhum oval, 22 idiomas|079]]
