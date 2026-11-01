# 133 · Os dois computadores numa história só, e como seguir no outro
#dois-computadores #copia #caderno #espera-voce

> **Espera você:** no outro PC, no terminal do VS Code: `cd D:\www\jadesun; git pull --ff-only; .\juntar-tudo.bat`

## O pedido (01/nov/2026)

> *"Bom Deus que esse seja meu ultimo prompt caotico pedindo ajuda. Me mostre aonde estao todos meus arquivos de ordem! e salve todas essas abas abertas aqui no vscode pra eu continuar no outro pc. me indique como seguir lá, fechei tudo aqui, tenho bookmarks no chrome caoticos, me esperando.. tanto! trabalho e revolucao pessoal e mundana.. esta impossivel pra mim, preciso de ajuda certa! como eu sigo lá?!?!? preciso dar merge mas meu claude code lá acabou os creditos pra eu pedir pra resolver os conflitos sem perder nada de neenhum computador.."*

## O que eu fiz

- **O Mac inteiro no GitHub.** Conferi as 29 pastas com git de `~/www`. O jadesun, o Vitor Petri V2 e o serafim-resistence trouxeram o que o outro PC publicou (4, 9 e 46 commits, sem conflito). O caderno e o jadesun subiram com o trabalho de hoje. O que sobrou de "mudado" no Mac é só `.DS_Store` e um arquivo que o Next gera sozinho.
- **As abas.** As 15 abas abertas no VS Code do Mac (14 arquivos, porque uma estava aberta duas vezes) viraram uma nota no caderno: um link para cada uma, na ordem da barra, e um comando que abre todas de uma vez. No VS Code, Ctrl+P e "abas" acham a nota. O currículo em PDF não vai pelo git do AI Job Search, que é público, então foi para o caderno como cópia.
- **A aba que não estava salva.** O arquivo onde você escreveu o pedido estava, na aba, numa versão sem o bloco dos projetos, que foi para a outra conversa. Fui pelo disco, que tinha tudo, e não salvei a aba: salvar teria apagado o bloco. Se o VS Code do Mac perguntar, escolha **Não salvar**.
- **A ordem.** A nota das abas lembra onde a ordem já mora: as cinco portas da página de cima do caderno, a seção 9 do Grande Plano (os projetos, um por linha) e este registro. Não abri porta nova.
- **O juntar-tudo (novo, aqui no jadesun):** `juntar-tudo.bat` no Windows e `juntar-tudo.command` no Mac. Com dois cliques, cada repositório da pasta www passa por quatro passos:
  1. **guarda:** o que mudou vira um commit. Ficam de fora `.DS_Store`, `.obsidian`, `node_modules` e arquivos acima de 95 MB, que o GitHub recusa; esses ficam no computador, e o relatório diz quais;
  2. **protege:** se os dois computadores mudaram, o lado deste sobe antes para um ramo próprio no GitHub (`windows-AAAA-MM-DD-HHMM` ou `mac-…`), onde não pode haver conflito;
  3. **junta:** nas notas (`.md`, `.txt`), onde os dois mexeram na mesma linha, ficam **as duas versões**, uma embaixo da outra. No caderno, os outros arquivos em conflito (uma imagem, por exemplo) ficam **lado a lado**: `nome (do Mac).jpg`. Num programa, se houver conflito de código, a junção é desfeita e nada muda, porque o seu lado já está no ramo do passo 2;
  4. **publica:** `git push`, sem forçar nunca e sem apagar ramo nenhum.

  Ele pula o que não deve tocar: pasta sem GitHub, ramo que nunca foi ao GitHub, repositório de outra pessoa, o AI Job Search e as cópias antigas de um mesmo repositório (como a `portal-solar`, que é o `interface`). Se achar uma junção pela metade (a que o Claude de lá deixou ao parar, por exemplo), ele copia os arquivos dela para dentro do `.git` e refaz a junção. `node juntar-tudo.mjs --ver` só olha e diz o que faria.
- **Conferido** num Mac e num Windows de mentira, com um GitHub numa pasta: a mesma linha mudada nos dois lados, nomes com `#` e acento, uma imagem mudada nos dois, uma nota apagada de um lado e mudada do outro, um conflito de código, uma junção pela metade com trabalho à mão dentro, um vídeo grande demais, a pasta `.obsidian`, uma cópia antiga, o AI Job Search e um repositório alheio. No fim, o Mac e o Windows ficaram iguais, sem perder uma linha. Depois rodei no `~/www` de verdade: tudo igual ao GitHub.

## Como seguir no outro PC

1. Abra o VS Code na pasta `D:\www` e o terminal (Ctrl + ').
2. Cole: `cd D:\www\jadesun; git pull --ff-only; .\juntar-tudo.bat`
3. Leia o relatório. "PRECISA DE AJUDA" quer dizer que nada mudou naquele repositório e que o seu trabalho está guardado; a junção dele espera o Claude.
4. Abra as abas: Ctrl+P, "abas", e o comando que está na nota.

Se o `git pull` reclamar (o PC tem no jadesun algo que ainda não foi ao GitHub), use esta linha no lugar da do passo 2. Ela baixa o juntar-tudo direto do GitHub e o roda na pasta `D:\www`:

```
cd D:\www; curl.exe -sLo juntar-tudo.mjs https://raw.githubusercontent.com/vpdemantova/jadesun/main/juntar-tudo.mjs; node juntar-tudo.mjs
```

**Daqui em diante, o gesto é um só:** dois cliques no `juntar-tudo` ao chegar num computador e antes de sair dele. Assim as duas cópias não viram duas histórias de novo.

## O que fica só no Mac

- **Cubos, Blocos e Casas**, e os antigos quantum, quantum-two e tgastudio, não têm GitHub. Para levá-los ao outro PC, basta um "pode subir os três", e eu crio os repositórios privados.
- **O AI Job Search:** o perfil fica só aqui, de propósito.

## Os favoritos do Chrome

Podem esperar, e nada quebra enquanto isso. Quando você quiser, eu os separo pelas áreas do seu plano, um favorito por linha, cada um com o motivo de estar ali.

## O que espera você

- **No outro PC:** `cd D:\www\jadesun; git pull --ff-only; .\juntar-tudo.bat`.

---
[[0 Índice|Índice]] · ← [[132 — A Montanha de Jade e a Teia de todas as pessoas|132]] · [[134 — O Scriptorium Studio e a prancha do folio|134]] →
