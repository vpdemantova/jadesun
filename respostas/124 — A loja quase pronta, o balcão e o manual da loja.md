# 124 · A loja quase pronta: a vitrine, o balcão e o manual da loja
#cubos #loja #negocio #balcao #privacidade #publicacao #espera-voce

> **Espera você:** pôr o número do WhatsApp da loja nos Ajustes do balcão (dois cliques em `balcao.command`) e publicar; os preços entram depois do cadastro nos distribuidores.

**O pedido de 26/out/2026:**

> *"estruture mais ainda a loja! quase que pronta! com instruções pra eu gerenciar e enviar e comprar tudo com melhores preços e mais, adicione o que falta no negocio.md, acho que está tudo lá?"*

## 1. Estava tudo lá? Quase

O `NEGOCIO.md` tinha **o plano**: onde comprar, a conta de cada cubo, os canais, a lei, os encontros. Faltava **o dia a dia**: como comprar barato, como pôr o preço, como cada pedido anda, como embalar e enviar, o que fazer com o dinheiro. Agora tem as duas partes, e a loja ganhou o lado de dentro.

## 2. A loja do site (no ar, ainda fechada)

**<https://cubos-five.vercel.app/loja>**

- **A vitrine** lê uma planilha (`dados/produtos.csv`): doze produtos em cinco prateleiras.
- **Cada produto** abre numa folha do lado, com o quebra-cabeça de verdade girando (o mesmo motor do site).
- **A sacola:** os produtos, a entrega (num encontro ou pelo correio, com o CEP) e o nome viram a mensagem pronta do pedido, mandada para o WhatsApp da loja.
- **As regras da loja,** na própria página: o Pix, a entrega, os 7 dias para desistir e os 90 dias de garantia.
- Fica fechada até o número do WhatsApp e os preços entrarem.

## 3. O balcão: a loja do lado de dentro, só no Mac

Dois cliques em `balcao.command`, e o navegador abre o balcão.

| Parte | Para quê |
|---|---|
| Produtos | o preço, o Pix e a situação (o que o site mostra); o custo, o frete e o estoque (só seus); a margem |
| Pedidos | do "Novo" ao "Entregue", com a mensagem de cada etapa pronta para colar no WhatsApp |
| Compras | o que comprar agora e os orçamentos, com o mais barato marcado (o frete dividido pelas peças) |
| Caixa | o que entrou e o que saiu, mês a mês |
| Ajustes | a loja aberta ou fechada, o WhatsApp, o desconto do Pix, o prazo |
| Publicar | a vitrine no ar em um minuto; a cópia de segurança, e a volta dela |

**Os dados dos clientes nunca saem do Mac:** os pedidos, os contatos, os custos e o caixa ficam fora do site e fora do git. Só a vitrine vai para o ar.

## 4. O que entrou no `NEGOCIO.md`

- **Os preços de referência** de cada produto da vitrine, nas páginas das lojas (26/out).
- **O manual da loja**, do 9 ao 22: o balcão; a primeira compra (a mesa de testar, seis cubos, no máximo R$ 375,60 no varejo); comprar bem; o preço (o mínimo para nunca vender no prejuízo); o pedido do começo ao fim; receber (o pedido só fica pago quando o Pix aparece no extrato, por causa do golpe do comprovante falso); embalar; enviar (pelo correio, sem nota, só com a declaração de conteúdo eletrônica, desde 6 de abril de 2026); o estoque; atender; as trocas e a garantia; o MEI (o DAS de R$ 82,05, a nota de 2027 ainda em mudança); os marketplaces, na conta (deixam de R$ 11 a R$ 15 a menos por cubo que o encontro); as rotinas e as datas (a Black Friday, o Natal, o FTO em 2 de janeiro, o Ano-Novo chinês).

## 5. Conferido e publicado

- `npm run verificar` passa inteiro, e o novo `npm run verificar-loja` confere a vitrine antes de cada publicação.
- O teste de ponta a ponta, numa cópia da pasta: o Pix sugerido acompanha o preço; o pedido de pronta entrega pula as etapas do fornecedor; o estoque baixa com o pagamento; a cópia de segurança volta; o aviso da sacola acompanha o nome; o link do WhatsApp sai certo. Sem erros.
- Consertado no caminho: a data dos pedidos (feitos depois das 21h, sairiam com a data do dia seguinte).
- A loja no ar, conferida na placa de vídeo do Mac.
- **No ar:** commit `0e592e2`, em ~/www/cubos.

## Fontes

- [Oncube: os preços](https://www.oncube.com.br/cubo-magico-3x3x3-moyu-rs3m-v5-magnetico) e [o atacado](https://www.oncube.com.br/pagina/cubo-magico-em-atacado.html)
- [El King: o atacado](https://elking.com.br/cubo-magico-atacado/)
- [A DC-e obrigatória desde abril de 2026 (Sefin-RO)](https://reformatributaria.sefin.ro.gov.br/noticias/confaz-e-correios-tornam-obrigatoria-a-declaracao-de-conteudo-eletronica-a-partir-de-abril-de-2026)
- [Melhor Envio: as etiquetas dos Correios](https://melhorenvio.com.br/blog/sobre-nos/etiqueta-correios)
- [InfinitePay: as taxas de 2026](https://www.infinitepay.io/blog/maquininha-de-cartao-menor-taxa)
- [O DAS de 2026 (O Povo)](https://www.opovo.com.br/noticias/economia/2026/01/02/contribuicao-mensal-do-mei-sobe-para-rs-8105-em-2026.html)
- [A nota do MEI em 2027 (Mix Vale, 23/out)](https://www.mixvale.com.br/2026/10/23/mei-fica-dispensado-de-emitir-nota-fiscal-eletronica-para-pessoa-fisica-a-partir-de-janeiro-de-2027/)
- [As taxas do Mercado Livre (Cargoos)](https://cargoos.com.br/blog/taxas-mercado-livre) e [da Shopee (Roilabs)](https://roilabs.com.br/blog/taxa-shopee-tabela-comissao/)
- [O Código de Defesa do Consumidor](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm)

---
[[0 Índice|Índice]] · ← [[123 — A prancha dos Cubos, três direções para a plataforma|123]] · [[125 — Por que os Cubos ficaram bons, e o motor em WebGL2|125]] →
