# Os dois Portal Solar viram um só

> **09/out/2026.** Você disse sim ("SIM SIM SIM! FAÇA TUDO!") à pergunta *"este app e o do repositório `interface` viram um só?"*. Este arquivo diz o que já ficou um, o que falta e em que ordem, com os comandos. **Nada aqui foi commitado nem empurrado**: os passos 1 e 2 mexem no git, e o git é seu.

## Quem é quem, hoje

| | **A casa** (este repositório, `jadesun`) | **A porta pública** (o repositório `interface`) |
|---|---|---|
| O que é | o app de todo dia: Atlas, Hoje, Eu, Casa 3D, Manifesto | o site, o Portátil (PWA) e o Aplicativo (Tauri + APK) |
| Onde mora | Windows `D:\www\jadesun` · Mac `~/www/jadesun` | Windows `D:\www\interface` · Mac `~/www/interface` |
| Como lê o caderno | `VAULT` → `servir.mjs` (servidor de casa) | `VAULT` → `lib/vault.ts` (ou a semente `vault/`) |
| Lei principal | o caderno é o banco de dados | **os três são um** (site, Portátil e Aplicativo mudam juntos) |
| Estado do git | Mac: itens 69 a 75 **sem commit**; GitHub igual ao de 08/out | Mac: limpo, último commit 22/set |

## O que já é um (feito em 08 e 09/out)

- **O nome e a marca.** A casa se chama Portal Solar e usa o Quadrado Negro.
- **O mesmo Manifesto, lido do mesmo arquivo.** A página Manifesto da casa lê o `0 O Manifesto.md` do caderno, o mesmo texto que a semente do `interface` leva ao site. Não há cópia: quando você muda o arquivo, as duas portas mudam.
- **O mesmo caderno.** As duas leem `blessednotebook` pelo `VAULT`. Nada do caderno foi copiado para dentro de nenhum dos dois códigos.
- **A mesma filosofia** escrita nos dois: arquivo de texto primeiro, nada inventado, só somar, o público só leva o que você escolhe.

## O que falta, na ordem

### 1. Salvar as duas cópias da casa (só com o seu sim)

A casa existe em duas cabeças, a do Windows e a do Mac. **Antes de qualquer junção, as duas precisam virar uma**, senão juntamos uma cópia velha.

No Mac (onde está o trabalho de 08 e 09/out):

```sh
cd ~/www/jadesun
git status                 # ~120 arquivos: os itens 69 a 75
git add -A && git commit -m "Itens 69 a 75: Áreas, Domínio, Portal, Curadoria, Guias, Manifesto, Conta"
git push
```

No Windows (se houver algo seu sem commit lá, ele entra primeiro, com um commit seu):

```sh
cd D:\www\jadesun
git status
git pull
```

**Prova:** `git log -1` igual nos dois.

### 2. Juntar as raízes: a casa entra no `interface` como `casa/`

É o mesmo gesto de 23/ago (`uniao.md` do `interface`): o Vale Serafim entrou como `vale/` e o engines como `oficina/`, por *subtree*, com o histórico. A casa entra igual:

```sh
cd ~/www/interface
git tag antes-da-casa                  # o ponto de volta
git subtree add --prefix=casa https://github.com/vpdemantova/jadesun.git main
```

- **Por que `casa/` e não dentro de `app/`:** a casa tem servidor próprio (`servir.mjs`) e grava no caderno; os três aplicativos não gravam fora do disco deles. Como o `vale/`, ela é uma obra com lei própria, e **não entra na lei dos três** até que você queira.
- **Para abrir:** `npm run casa` no `interface` (um `package.json` com `"casa": "node casa/servir.mjs"`, a acrescentar no mesmo commit).
- **Para voltar atrás:** `git reset --hard antes-da-casa`; o repositório `jadesun` continua no GitHub, intacto.
- **Depois da junção, o `jadesun` vira só leitura** (arquivado no GitHub): *nada mora em dois lugares*.

### 3. Uma porta pública só

Hoje há duas saídas públicas preparadas: o site do `interface` (Vercel, `montagnedejade.org`) e o site estático da casa (`node exportar.mjs publico`, que desde o item 75 leva o Manifesto, os Guias e a Curadoria).

**A minha recomendação:** a porta pública é o site do `interface`. As três páginas novas entram nele em duas etapas:

1. **Já no dia do botão:** o estático da casa vai junto, numa pasta (`montagnedejade.org/casa/`), com um link no site. Zero código novo nos três.
2. **Depois de 18/10:** o Manifesto, os Guias e a Curadoria viram rotas do site, **com a lei dos três** (site, Portátil e Aplicativo na mesma obra). A lógica que hoje está no navegador da casa (`curadoria-md.js`, `manifesto.js`) desce para `lib/motor/`, para nascer nos três de uma vez.

### 4. O motor comum: o que hoje está escrito duas vezes

| A mesma coisa | Na casa | No `interface` | Para onde vai |
|---|---|---|---|
| ler o caderno | `lib/vault.mjs` | `lib/vault.ts`, `lib/motor/porta-*` | o motor |
| a ficha de pessoa e o convite | `eu.js`, `ficha.js`, `vitrine.js`, `cartao-visita.js` | `app/perfil`, `app/convite`, `lib/motor/perfil.ts` | um formato só (o `Ficha.md`, da Rede da Vida) |
| a busca nas fichas | `lib/biblioteca.mjs` | `lib/motor/busca.ts`, `galeria.ts` | o motor |
| o Hoje e o estudo | `agora.js`, `domino.js`, `dominio.js` | `lib/motor/agora.ts`, `estudo.ts`, `calendario.ts` | decidir caso a caso |
| a cena 3D | `cena3d.js`, `casa3d*.js` | — (a lei do feitio pede geometria à mão) | fica na casa |

Cada linha desta tabela é uma obra separada, com o seu commit e a sua linha na `CRONICA.md`.

## O que não muda

- O **caderno** continua separado e privado.
- A **lei dos três** continua mandando no `interface`.
- **Nada do b Studio vai ao público**: a semente nunca copia `1 Villages/b Studio`. A exceção é o texto do Manifesto, que já é público, e que a casa lê só para ler.
- **Quem aperta o botão é você**, depois de 18/10 (ver `1 Lançamento.md`, no caderno).

## O que eu preciso de você

1. **"Pode commitar"**, no Mac e no Windows: o passo 1.
2. **"Pode juntar"**: o passo 2, que eu faço em minutos depois do 1.
3. Se a porta pública é mesmo o site do `interface` (o passo 3). Se preferir o contrário, a casa como porta pública, os passos 1 e 2 continuam iguais.
