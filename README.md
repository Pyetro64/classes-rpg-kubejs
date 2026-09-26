# Server Scripts — RPG de Classes (KubeJS)

Pacote de scripts **KubeJS** (server-side) + configs para um modpack de Minecraft **1.20.1 Forge**. O propósito é transformar um servidor comum num RPG: ao entrar, o jogador escolhe uma entre 3 classes, cada uma presa a uma dimensão natal, uma raça obrigatória e um conjunto próprio de mods — criando especialização e dependência entre os jogadores, com um evento final ("O Colapso") que força todos a se enfrentarem.

Este repositório é **a implementação técnica** de parte do design descrito na *Wiki do Modpack v2.0* (lore, filosofia e balanceamento das classes). A wiki é o documento de design; este pacote de `config/` + `server_scripts/` + `startup_scripts/` é o que já virou código — e não é um modpack completo, é um overlay para colocar sobre uma instância que já tenha os mods necessários.

## Requisitos

KubeJS, FTB Quests, FTB Teams, e os mods: `mekanism`, `create` (+addons), `tempad`, `rats`, `tacz`, `irons_spellbooks`, `mahoutsukai`, `alshanex_familiars`, `toms_magic_extras`, `simplywings`, `astral_sorcery`, `projecte`, `occultism`, `botania`, `touhou_little_maid`, `goety`, `ars_nouveau`, `vampirism`, `werewolves`, `aether`.

## As 3 classes (resumo)

| Classe | Dimensão | Raça | Especialidade |
|---|---|---|---|
| Engenheiro | Overworld | Lobisomem | Tecnologia (Mekanism/Create), forte no late game |
| Mago | Aether | Vampiro | Magia de burst, forte no early/mid game |
| Alquimista | Nether | Caçador | Exército de invocações e debuffs, vence por desgaste |

## Estrutura

```
config/                 → configs de balanceamento (goety, occultism) e capítulos do FTB Quests
startup_scripts/registry.js   → registro de itens e blocos customizados
server_scripts/core/utils.js  → globals (mods por classe, getClasse(), cores)
server_scripts/systems/       → um arquivo por sistema de jogo (escolha de classe, kits,
                                 spawn, buffs por dimensão, maldições, raças, restrição de
                                 magia, mid game, colapso final, máquinas dimensionais, retorno)
```

`core/utils.js` precisa carregar antes dos outros arquivos de `systems/`.

## Correções aplicadas nesta revisão

- Renomeado `maldi[nome corrompido].js` → `maldicoes.js` (o arquivo estava com o nome ilegível por um problema de encoding no zip).
- `classes.js`: o bloqueio de craft era global (removia a receita de todos os mods de classe pra todo mundo). Agora o bloqueio acontece só no craft de quem não é da classe certa (`ItemEvents.crafted`), sem impedir a classe dona de craftar.
- `ars_restricao.js`: o bloqueio de craft dos glyphs ofensivos estava vazio (só comentários). Agora craftar esses glyphs é bloqueado especificamente para o Alquimista, sem afetar o Mago.
- `dimensoes.js`: corrigido bug que fazia a mensagem de boas-vindas ao mudar de dimensão sair sempre vazia.
- `crafts_dimensionais.js` → `registry.js`: os itens (`liga_infernal`, `blaze_steel` etc.) foram movidos pro registro central, como o próprio código já pedia. Também foram registrados os **blocos** das máquinas dimensionais (`forja_infernal`, `cristalizador_celestial` etc.), que não existiam antes — sem eles as máquinas citadas no código não existiam no jogo.
- `utils.js`: adicionado `astral_sorcery` aos mods do Mago (citado na wiki, mas ausente do código).
- `maldicoes.js`: corrigido typo `avisoChuvra` → `avisoChuva`.
- `racas.js`: adicionada a sincronização dos níveis de raça (Vampirism/Werewolves) que faltava — sem ela, `midgame.js` nunca detectava raça no nível máximo e o Colapso nunca era ativado. **Atenção**: os nomes de método usados (`getFactionPlayerHandler`, `getCurrentLevel` etc.) são a suposição mais provável para a API desses mods, mas não dá pra confirmar sem testar num servidor real — se não funcionarem, o console vai avisar (`[Racas] Não foi possível ler o nível de raça...`) e os nomes precisam ser ajustados na função `getNivelVampirism`/`getNivelWerewolf`.

Sintaxe de todos os `.js` revalidada com `node --check` após as mudanças — sem erros.

## O que ainda falta (não é bug de código, é decisão/config)

- Ajustar `ARENA` e `DURACAO_MS` em `contador_colapso.js` para o mapa real do servidor.
- Confirmar o ID `simplywings:feathered_wings` usado em `kits.js`.
- Confirmar os métodos de nível do Vampirism/Werewolves usados na correção acima.
- Criar `.toml` de balanceamento para os outros mods de classe (só `goety` e `occultism` têm hoje).
- As 9 combinações de PVP da wiki são balanceamento teórico pro mestre — não fazem sentido como código.
