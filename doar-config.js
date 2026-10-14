/* Portal Solar · doar-config.js — a SUA parte da página Doar (doar.html).
   Tudo aqui é seu para mudar sem mexer no código.

   1. A chave Pix: e-mail, telefone (com +55 e DDD, ex.: +5519999999999), CPF/CNPJ (só números)
      ou a chave aleatória. Vazia = a bilheteria aparece, mas avisa "em breve" e não gera QR.
      O nome vai sem acento e com até 25 letras; a cidade, até 15. O banco mostra, na hora de pagar,
      o nome real da conta: estes dois campos só enfeitam o código.
   2. Outros jeitos de apoiar (Apoia.se, Ko-fi, Catarse, PayPal…): aparecem só os que tiverem link.
   3. Os ingressos simbólicos e o texto: troque à vontade. *itálico* e [^1] (nota) funcionam. */
window.DOAR_CONFIG = {
  pix: { chave: '', nome: 'Vitor P Demantova', cidade: 'Campinas' },

  apoio: [
    { nome: 'Apoia.se', url: '' },
    { nome: 'Ko-fi', url: '' },
  ],

  ingressos: [
    { nome: 'Plateia', valor: 5, linha: 'Fila A. Para ouvir de perto.' },
    { nome: 'Balcão', valor: 15, linha: 'Para ver a orquestra inteira.' },
    { nome: 'Camarote', valor: 50, linha: 'Com lugar para mais gente.' },
    { nome: 'Mecenas', valor: 0, linha: 'O valor é você quem escolhe.' },
  ],

  titulo: 'E, por fim, a minha',
  texto: [
    'O ideal seria um sistema mais humano: um mundo em que quem estuda, cria e reparte o que aprendeu não precisasse pedir nada, porque cuidar do saber seria tarefa de todos, e o governo seria dos sábios.[^1]',
    'Mas estamos assim. Cada um sustenta o que pode, do jeito que pode.',
    'O Portal Solar é gratuito e vai continuar gratuito, para qualquer pessoa, em qualquer lugar. Se ele te ajudou a ler, a atravessar um dia difícil ou a lembrar por que você começou, você pode levar um ingresso simbólico. Ele não abre nenhuma porta que já não esteja aberta para você. É só um jeito de dizer: continue.',
    'E se só puder escolher uma doação, escolha uma das causas lá de cima. Elas precisam mais.',
  ],
  notas: [
    'Platão, *A República*, livro V (473c–d): a passagem em que Sócrates diz que os males das cidades não terão fim enquanto os filósofos não governarem, ou os governantes não se tornarem filósofos.',
  ],
};
