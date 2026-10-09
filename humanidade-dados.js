/* ============================================================
   O MAPA DA HUMANIDADE — as dez partes do saber (08/out/2026, PERFIL.md item 73)
   Inspirado no "Círculo do Saber" da Propædia (Mortimer Adler, Encyclopædia
   Britannica, 1974), que dividiu todo o conhecimento humano em dez partes.
   Cada seção do acervo mora numa parte; os eventos da linha do tempo, pela área.
   Seção nova que não estiver aqui cai em "Os ramos do conhecimento".
   As frases são minhas; mude à vontade.
   ============================================================ */
window.HUMANIDADE = {
  partes: [
    { id: 'materia', nome: 'Matéria e energia', cor: '#2F7FD0', frase: 'Do átomo às galáxias: do que tudo é feito e as forças que movem tudo.',
      secoes: ['selecao/fisica', 'selecao/quimica', 'atlas/elementos', 'atlas/materias-primas', 'atlas/componentes', 'fundacao/physics-materials', 'fundacao/elements-chemistry', 'fundacao/phisics-laws'], areas: ['fis', 'qui'] },
    { id: 'terra', nome: 'A Terra', cor: '#7FA03A', frase: 'O planeta: as rochas, as águas, o ar, os climas e os mapas.',
      secoes: ['selecao/geografia', 'atlas/mapas', 'fundacao/geography-maps'], areas: ['geo'] },
    { id: 'vida', nome: 'A vida na Terra', cor: '#2E9E66', frase: 'Dos micróbios às baleias: como a vida funciona, evolui e se espalha.',
      secoes: ['selecao/biologia', 'atlas/especies', 'fundacao/biology-anatomies'], areas: ['bio'] },
    { id: 'humana', nome: 'A vida humana', cor: '#D9634A', frase: 'As pessoas: o corpo, a mente e as vidas que deixaram marca.',
      secoes: ['atlas/pessoas'], areas: [] },
    { id: 'sociedade', nome: 'A sociedade', cor: '#1C9AA6', frase: 'Como vivemos juntos: povos, países, grupos, leis e trabalho.',
      secoes: ['selecao/sociologia', 'atlas/reinos-e-paises', 'atlas/escolas-e-grupos', 'fundacao/socioly-society'], areas: ['soc'] },
    { id: 'arte', nome: 'A arte', cor: '#CC4B90', frase: 'O que fazemos para dizer o que não cabe em palavras: sons, imagens, espaços e a própria palavra.',
      secoes: ['selecao/literatura-brasileira', 'selecao/redacao', 'atlas/obras', 'guias/music', 'guias/design', 'guias/architecture', 'guias/literature', 'guias/1-0-manifestation', 'aulas/grad-ad-parnassun', 'aulas/curatorship'], areas: [] },
    { id: 'tecnica', nome: 'A técnica', cor: '#E0A800', frase: 'As mãos e as máquinas: ofícios, ferramentas, instrumentos e computação.',
      secoes: ['atlas/objetos-e-instrumentos', 'atlas/oficios', 'atlas/computacao', 'guias/computing', 'guias/woodwork'], areas: [] },
    { id: 'religiao', nome: 'O mito e o sagrado', cor: '#7E62D6', frase: 'As histórias sagradas e os deuses: como os povos explicaram o mundo.',
      secoes: ['atlas/mitologia'], areas: [] },
    { id: 'historia', nome: 'A história', cor: '#B0412F', frase: 'O que aconteceu, quando e por quê: das origens ao século XXI.',
      secoes: ['selecao/historia', 'atlas/linhas-do-tempo-eras', 'atlas/tabuas', 'fundacao/history-dates', 'aulas/great-tale', 'guias/0-0-heritage'], areas: ['his'] },
    { id: 'ramos', nome: 'Os ramos do saber', cor: '#1B5A44', frase: 'As ferramentas do pensar: matemática, lógica, filosofia e as línguas.',
      secoes: ['selecao/matematica', 'selecao/filosofia', 'selecao/lingua-portuguesa-e-linguistica', 'selecao/lingua-inglesa', 'selecao/mapa-e-guias', 'atlas/linguas', 'atlas/conceitos', 'atlas/areas', 'atlas/colecoes', 'fundacao/math-geometry', 'fundacao/linguistic', 'fundacao/philosohpy-individual', 'fundacao/indices', 'guias/geometry', 'aulas/geral', 'aulas/ciclo-fundacao', 'aulas/listas-estante-herdada', 'aulas/0-motivos-sob-a-verdade'], areas: ['mat', 'fil', 'ing'] },
  ],
  fonte: ['Propædia, Encyclopædia Britannica (Mortimer Adler, 1974): o "Círculo do Saber"', 'https://en.wikipedia.org/wiki/Prop%C3%A6dia'],
  fonteRosa: ['Florence Nightingale, o diagrama da "rosa" (1858)', 'https://en.wikipedia.org/wiki/Pie_chart#Polar_area_diagram'],
};
