# 139 · Um sistema só, e a Mesa na língua do Portal
#design #menus #mesa #publicacao #pedido-grande #espera-voce

> **Espera você:** o domínio montagnedejade.org vence em 14/nov; a renovação precisa da conta da Squarespace, que só você recupera

## O pedido

> *"está MUITO FEIO! e ruim de usar e visualizar - precisamos integrar tudo, para que a plataforma fique fazendo sentido e pareça uma plataforma feita por 10 das melhores agências juntas. está um fiasco e uma tragédia assim! sem sistema de design próprio, sem nada na verdade! recapitule tudo que eu preciso fazer aqui pra gente publicar ela com a versão final que você vai me entregar agora! não deixa nada provisório e publique tudo, com as pendências que eu precisar fazer, conte comigo, agora vai! finalmente! vamos reduzir as inconsistências e poluições! tudo limpo e desenhado com um sistema perfeito e único. bons espaços, bons menus, e acima de tudo uma unicidade extrema! … parece que nada dos sites foram usados, não sei, se foi foi pouco, porque o resultado está péssimo"* (02/nov/2026)

## O que estava errado (o diagnóstico, nas fotos)

- **Não havia um sistema; havia dez camadas.** Dez folhas de estilo de épocas diferentes (4.820 linhas), cada página com a sua língua.
- **Os mesmos filtros, de dois jeitos.** Quadrados no Atlas, nas Fichas e nos Guias; pílulas nos Índices, nas Ferramentas e nas Leituras; cada um com uma altura e uma letra.
- **A Mesa era um corpo estranho** dentro da casca: o quadrado gigante, as próprias abas, o título em outra escala.
- **O menu tinha dez portas**, e o "provisório" ainda aparecia nos créditos e no aviso.

## O que eu fiz

**O sistema** (`sistema.css`), carregado por último nas 42 páginas com a casca. Ele decide:
- as letras: Newsreader é a voz, Archivo é a interface;
- os controles: tudo o que se aperta é pílula, ou círculo se for só um sinal;
- o explorador: um só, preso no alto ao rolar, o mesmo no Atlas, nas Fichas, nos Guias e na Mesa;
- duas cabeças: a capa, nas páginas de ler; a ferramenta, nas de fazer;
- a seção, o painel e o painel invertido (o "agora"), a lista de fios, a cruz e o foco.

Os cantos e os fios das camadas antigas passam a valer os do sistema. Nenhuma cor nova: tinta e papel.

**Os menus: de dez portas para oito.** A Curadoria (com os Museus e as Ferramentas) mora nos Guias; o Domínio mora no Hoje. Nenhum endereço mudou.
- No computador: Manifesto · Guias · Fichas · Atlas ■ Hoje · Leituras · Eu · Casa.
- No site: Manifesto · Guias · Fichas ■ Atlas · Leituras · Hoje. O Hoje é a Mesa, guardada no aparelho de cada pessoa.

**Nada provisório.** Saiu o "interface provisória" dos créditos, e o aviso virou "O que importa agora".

**A página O sistema** (`sistema.html`) foi refeita como vitrine viva: a regra em dez linhas, as letras, o espaço e as formas, os controles, o explorador, os painéis, a gramática e o que mudou. Cada peça é a peça de verdade.

**A Mesa refeita na língua do Portal:**
- o cabeçalho de ferramenta, numa linha, com o dia e onde está guardada;
- o explorador do sistema, e a vista ganhando a tela inteira ao ser escolhida;
- a seção com rótulo e título, e os painéis;
- o Agora no painel invertido, com o título na voz e o quadradinho que é o timer;
- a matriz em quatro painéis, cada um com o seu sinal (o quadrado cheio, o contorno, a trama, o tracejado), e a Entrada na mesma linha dos filtros.

**Os dois sites, agora de verdade:**
- **O foco em tela cheia** é a técnica do Flowstate (GetLayers): um fluido de tinta que respira atrás de uma linha só (um shader de ruído, em tinta e papel), só enquanto o foco está aberto.
- **Os Livros viraram uma estante** (a técnica do Shelf Hero, MotionSites):
  - as lombadas lado a lado, em tons de tinta, com a altura e a grossura de cada livro;
  - o livro em leitura puxado para fora;
  - a capa tipográfica e o título que sobe por uma máscara, sem esmaecer.
- **A página que chega se compõe uma vez:** o título sobe pela máscara, e os painéis pousam um depois do outro.

## Conferido

- **No ar** em montagnedejade.org (publicação `dpl_D7QUqpXcYx2vZCtCKFsLCVQbSB7r`, do Mac): o `sistema.css` em todas as páginas, o menu de oito portas (no site, o Hoje é a Mesa) e O sistema v4.
- O teste de ponta a ponta da Mesa, num clone do caderno: 30 de 30, entre eles o foco em tela cheia, o quadradinho que esvazia, a estante com os 85 livros do catálogo e, no celular (390 px), nada passando da tela.
- `node testes/mesa.mjs`: o arquivo vai e volta igual.
- As fotos, em 1440 × 900 e em 390 × 844: a Mesa (cada vista), o Atlas, as Fichas, os Guias, o Início e O sistema. Três defeitos achados e corrigidos:
  - a fileira de filtros passava da tela no celular;
  - a entrada dos painéis cortava os cantos da Mandala;
  - o aviso escondido deixava uma ponta à mostra.

## Os arquivos

`sistema.css` (novo); `sistema.html`, `mesa.html`, `mesa.css`, `mesa.js`, `mapa-dados.js` (oito portas), `perfil.js` (os créditos), `aviso-dados.js`, `exportar.mjs`, `SISTEMA.md`, `TAREFAS.md` (PS-98 e PS-99), e a linha do sistema em 42 páginas `.html`.

## O que espera você

1. **O domínio, até 14/nov.** O montagnedejade.org vence em 14/nov, e a renovação precisa da conta da Squarespace (antes Google Domains), num e-mail a que você não tem mais acesso. Sem ela, o site sai do ar nesse dia. Os passos estão na Mesa, no Fazer.
2. **No Windows, antes de mexer ou publicar:** dois cliques no `juntar-tudo.bat`. Sem isso, o Windows não tem esta versão, e uma publicação de lá voltaria o site ao desenho antigo.
3. **Quando quiser (não trava nada):**
   - o Client ID do Google (PS-72), para a Mesa e as notas irem com você de um aparelho a outro pelo seu Drive (PS-95);
   - uma conta grátis no GetLayers, para copiar os 11 prompts grátis (PS-97).

---
[[0 Índice|Índice]] · ← [[138 — A Mesa, a matriz e todas as técnicas numa página só|138]]
