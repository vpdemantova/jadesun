# 101 · Onde fica o Upstash, e a barra de cima com 22 px
#vitordemantova #publicacao #menus #erro-meu #espera-voce

> **Espera você:** criar o Upstash e ligar ao site: vercel.com/vitordes-projects/vitordemantova/stores › Create Database › Upstash › Upstash for Redis › plano Free, região Washington, D.C. (iad1) › Create › conectar ao projeto vitordemantova, sem mudar o prefixo das variáveis. Depois, um "pronto" para mim: eu faço o Redeploy e confiro.

**"não tem upstash for redis e só tem supabase fuchsia house desconectado.. no storage não achei o que você me disse, e o menu está corrigido? tem a altura antiga? o menu superior eu digo, está corrigido?"** (14/out/2026, à tarde)

## O Upstash

- **Erro meu:** o caminho que eu dei no 100 pulava um passo. O Upstash só aparece na lista do Storage depois de criado; antes, ele está no botão Create Database, entre os fornecedores do Marketplace.
- O "supabase-fuchsia-house" é de outro projeto (v0-knowledge-management-system) e está suspenso. Não serve aqui: o site foi feito para o Redis da Upstash. Fica como está.
- Na lista, o certo é "Upstash for Redis", não o "Redis" (de outra empresa, sem o acesso pela web que o site usa).
- A região: Washington, D.C. (iad1), onde rodam as funções do site. O plano Free é grátis.
- O código lê `KV_REST_API_URL` e `KV_REST_API_TOKEN` (ou `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`). Se as variáveis vierem com outro nome, eu ajusto.
- Se o botão Create Database não aparecer: vercel.com/marketplace/upstash › Install, e o resto igual.
- Conferido na sua conta, só lendo (nada criado nem mudado): a única loja é esse Supabase suspenso; o projeto vitordemantova não tem nenhuma variável de ambiente; o Upstash ainda não está instalado; no Marketplace, ele se chama "Upstash for Redis".

## A barra de cima

- Corrigida desde 12/out, às 23h52 ([[086 — A barra de cima pequena, os Serviços num ícone, o cartão e a pessoa|086]], commit `ba291de`): 22 px de altura (eram 48), no computador e no celular. Continua assim na versão que está no ar.
- Medida hoje, na build do mesmo código que está no ar, em 11 telas (do computador de 1440 px ao celular deitado de 667): 22 px em todas.
- No modo Editorial não há barra de cima: só a linha "Nº 01 · …" e o idioma.
- Se no seu aparelho ela aparecer alta, é uma aba aberta antes da mudança: recarregue (no computador, ⌘⇧R; no celular, feche a aba e abra de novo).

## Conferido

- A Vercel, só lendo: a publicação no ar em www.vitordemantova.com e vitordemantova.com é a do commit `04a6937`.
- O navegador: a barra medida nas 11 telas e fotografada no computador (1440 px) e no celular (390 px).

---
[[0 Índice|Índice]] · ← [[100 — A lista grande de 12 de outubro, inteira no ar|100]] · [[102 — As duas barras iguais e os desenhos no lugar dos nomes|102]] →
