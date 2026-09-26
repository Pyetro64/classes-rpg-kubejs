// =============================================================
// systems/midgame.js — Detecção de condições de Mid Game
// Depende de: core/utils.js
//
// Engenheiro  → set completo Mekanism armor + Lobisomem max
// Mago        → Spellbook tier 4 Ars Nouveau + Iron's Spells max + Vampiro max
// Alquimista  → Pedra Filosofal + Marid invocado + Caçador max
// =============================================================

// ── IDs dos itens de condição ─────────────────────────────────

const ITENS_ENG = [
  'mekanism:mekasuit_helmet',
  'mekanism:mekasuit_bodyarmor',
  'mekanism:mekasuit_leggings',
  'mekanism:mekasuit_boots',
]

const ITENS_MAG = [
  'ars_nouveau:archmage_spellbook',    // tier 4 / máximo Ars Nouveau
  'irons_spellbooks:archmage_spellbook', // tier máximo Iron's Spells
]

const ITENS_ALQ = [
  'projecte:philosophers_stone',
]

// ── IDs de entidades invocadas ────────────────────────────────
const ENTIDADE_MARID = 'occultism:marid'

// ── Verifica se tem todos os itens no inventário ──────────────
function temTodosItens(player, lista) {
  return lista.every(itemId =>
    player.inventory.allItems.some(item => item && item.id === itemId)
  )
}

// ── Verifica nível de raça ────────────────────────────────────
function racaMaxima(player, classe) {
  try {
    if (classe === 'engenheiro') {
      // Werewolves — nível máximo é 14 na maioria das configs
      const level = player.persistentData.werewolfLevel || 0
      return level >= 14
    }
    if (classe === 'mago') {
      // Vampirism — nível máximo é 14
      const level = player.persistentData.vampireLevel || 0
      return level >= 14
    }
    if (classe === 'alquimista') {
      // Caçador — nível máximo é 14
      const level = player.persistentData.hunterLevel || 0
      return level >= 14
    }
  } catch(e) {
    console.warn('[MidGame] Erro ao verificar raça: ' + e)
  }
  return false
}

// ── Verifica Marid invocado (Alquimista) ──────────────────────
function verificarMarid(player) {
  // Verifica se o Alquimista já invocou um Marid pelo menos uma vez
  return player.persistentData.maridInvocado === true
}

// ── Tick de verificação ───────────────────────────────────────
PlayerEvents.tick(event => {
  const player = event.player
  if (player.age % 100 !== 0) return // A cada 5 segundos

  const classe = global.getClasse(player)
  if (classe === 'nenhum') return

  // Já atingiu o mid game?
  if (player.persistentData['midgame_' + classe]) return

  let atingiu = false

  if (classe === 'engenheiro') {
    const temSet  = temTodosItens(player, ITENS_ENG)
    const temRaca = racaMaxima(player, 'engenheiro')
    atingiu = temSet && temRaca

    if (temSet && !temRaca) {
      player.tell('§6⚙ Set Mekanism completo! Agora maximize sua raça Lobisomem.')
    }
  }

  if (classe === 'mago') {
    const temSpells = temTodosItens(player, ITENS_MAG)
    const temRaca   = racaMaxima(player, 'mago')
    atingiu = temSpells && temRaca

    if (temSpells && !temRaca) {
      player.tell('§b Spellbooks no máximo! Agora maximize sua raça Vampiro.')
    }
  }

  if (classe === 'alquimista') {
    const temPedra = temTodosItens(player, ITENS_ALQ)
    const temMarid = verificarMarid(player)
    const temRaca  = racaMaxima(player, 'alquimista')
    atingiu = temPedra && temMarid && temRaca

    if (temPedra && !temMarid) {
      player.tell('§5⚗ Pedra Filosofal obtida! Agora invoque seu primeiro Marid.')
    }
    if (temPedra && temMarid && !temRaca) {
      player.tell('§5⚗ Marid invocado! Agora maximize sua raça Caçador.')
    }
  }

  if (atingiu) {
    player.persistentData['midgame_' + classe] = true

    const cor = global.COR_POR_CLASSE[classe]
    player.tell(cor + '⚔ Mid Game atingido! Você está pronto para o Colapso.')
    player.server.tell(cor + '⚔ ' + player.username + ' atingiu o Mid Game!')

    // Verifica se todos atingiram
    const players = player.server.playerList.players
    const todos   = players.every(p => {
      const c = global.getClasse(p)
      return c === 'nenhum' || p.persistentData['midgame_' + c]
    })

    if (todos) {
      player.server.tell('§4☠ TODOS ATINGIRAM O MID GAME. O COLAPSO SE APROXIMA...')
    }
  }
})

// ── Detecta invocação de Marid ────────────────────────────────
EntityEvents.spawned(event => {
  const entity = event.entity
  if (entity.type !== ENTIDADE_MARID) return

  // Encontra o Alquimista mais próximo (dono da invocação)
  const server = event.server
  server.playerList.players.forEach(player => {
    if (global.getClasse(player) !== 'alquimista') return
    if (player.persistentData.maridInvocado) return

    // Verifica se está perto o suficiente (30 blocos)
    const dist = player.distanceTo(entity)
    if (dist < 30) {
      player.persistentData.maridInvocado = true
      player.tell('§5⚗ Você invocou seu primeiro Marid. O inferno te obedece.')
    }
  })
})

console.info('[MidGame] systems/midgame.js carregado.')
