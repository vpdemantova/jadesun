# 109 · O botão do Laboratório e o Vitor Petri V2
#vitordemantova #laboratorio #correcao #vitor-petri #publicacao #pedido-grande #espera-voce

**O pedido de 16/out/2026:**
- "o botão no lab. golden hour e your walker não dão pra clicar";
- "faça uma cópia do projeto vitor-petri-2027 com o nome de vitor-petri-2027-V2, publique no github e trabalhe em todos os itens do tarefas.md um por um, atualizando e criando mais instruções dentro desse arquivo, otimizando e aprimorando tudo para lançarmos a melhor versão dele!"

> **Espera você:** os anos que faltam, uma foto sua, o teste do arrasto num celular, as 7 telas de referência e o domínio. Nada quebra enquanto isso.

## O Laboratório

- **A causa:** desde o "esconder a interface" (H, de 15/out), as peças do Laboratório moram numa camada que não recebe cliques. Os botões de dentro herdavam isso, e o cartão do título (a hora do céu e o "Seu boneco") ficou sem clique.
- **A correção:** as peças voltaram a receber o clique. O H continua escondendo tudo.
- **Conferido com a placa de vídeo, no computador e no celular:**
  - a hora troca;
  - o painel do boneco abre (no clique e no toque);
  - o arrasto no meio da tela continua chegando ao 3D.
- **No ar:** commit `0a8a599` (11h41), em www.vitordemantova.com.

## O Vitor Petri V2

- **A cópia:** `~/www/vitor-petri-2027-V2`, com o histórico. A V1 ficou intacta.
- **Código:** github.com/vpdemantova/vitor-petri-2027-V2 (público, como o da V1).
- **No ar:** https://vitor-petri-2027-v2.vercel.app, um projeto novo da Vercel (equipe vitordes-projects) ligado ao GitHub: um push publica, e antes a Vercel confere os tipos, o lint e os testes.
- **Commits:** `b83dc29`, `af8ee1c`, `752868d` e `64a287d`.
- **O TAREFAS.md** tem cada item com a situação, a data e o como, mais oito tarefas novas (VP-94 a VP-101).

### O que entrou

- **O conteúdo:** 21 projetos, cada um num arquivo Markdown, em inglês e português, com a fonte de cada dado:
  - entraram o Portal Solar e as seis obras do catálogo de música;
  - as obras têm a capa desenhada como a página de rosto de uma partitura, e a Chanson Antique toca a gravação;
  - fotos novas do vitordemantova de hoje;
  - o WhatsApp no contato, e o Behance antes das outras redes.
- **A interface:**
  - o botão PT/EN, com a troca animada;
  - os endereços de verdade (`/project/laboratorio`), cada um com a sua prévia para o WhatsApp;
  - os filtros do Índice valendo para a galeria, e a busca;
  - anterior e próximo na ficha, que nasce do cartão;
  - o contador, o cursor próprio, a dica da primeira visita, os atalhos (?) e o modo comparação.
- **O 3D:**
  - a onda na troca de cartão;
  - os de trás desfocados e espiando pelos cantos;
  - a inclinação pelo mouse;
  - o brilho que muda de tom com a hora de Campinas e com o cartão;
  - o bloom só no gesto;
  - as partículas que formam o logotipo na abertura;
  - a sala (um corredor para andar);
  - o som, desligado por padrão: uma nota por cartão.
- **A medida:**
  - Lighthouse 100 nas quatro notas, no computador e no celular simulado (no celular, o desempenho era 56: a abertura passou a vir pronta no HTML);
  - o axe-core sem nenhum problema nas dez telas;
  - 42 testes.

### O que ficou para depois, e por quê

- **Os vídeos nos cartões (VP-95):** precisam de gravação e do ffmpeg.
- **O KTX2 (VP-41), descartado por enquanto:** borra a letra das capturas, ou pesa 15 MB a mais.
- **O GitHub Actions (VP-98):** a chave do GitHub deste Mac não tem a permissão "workflow"; a Vercel faz a mesma conferência.

## Duas sessões ao mesmo tempo

Um "CONTINUE!" reabriu esta conversa num segundo processo enquanto o primeiro seguia trabalhando na mesma pasta. As duas escreveram o mesmo bloco de CSS. A retomada tirou a cópia, as duas combinaram por mensagem quem seguia, e uma só terminou.

---
[[0 Índice|Índice]] · ← [[108 — A espiral de volta, as barras espelhadas, as formas do Perfil e a fonte no gramado|108]] · [[110 — As barras do telefone mais leves, nas proporções do tablet|110]] →
