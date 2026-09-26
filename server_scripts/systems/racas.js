// =============================================================
// systems/racas.js — Controle de raças por classe
// Depende de: core/utils.js
//
// Regras:
//   Mago       → só pode ser Vampiro
//   Engenheiro → só pode ser Lobisomem
//   Alquimista → só pode ser Caçador
//
// Punição progressiva se tentar raça errada:
//   1ª tentativa → aviso
//   2ª tentativa → /kill
//   3ª tentativa → aviso + /kill + perde metade dos itens
// =============================================================

// ── Raças permitidas por classe ───────────────────────────────

const RACA_PERMITIDA = {
  mago:       'vampiro',
  engenheiro: 'lobisomem',
  alquimista: 'cacador'
}

// ── IDs de raça do Vampirism/Werewolves ──────────────────────

const FACTIONS = {
  vampiro:    'vampirism:vampire',
  lobisomem:  'werewolves:werewolf',
  cacador:    'vampirism:hunter',
  humano:     'vampirism:human'
}

// ── Helper: pega tentativas de infração ───────────────────────

function getTentativas(player) {
  if (!player.persistentData.racaInfracao) {
    player.persistentData.racaInfracao = 0
  }
  return player.persistentData.racaInfracao
}

function incrementarTentativas(player) {
  player.persistentData.racaInfracao = getTentativas(player) + 1
  return player.persistentData.racaInfracao
}

// ── Punição progressiva ───────────────────────────────────────

function punir(player) {
  const classe = global.getClasse(player)
  const cor = global.COR_POR_CLASSE[classe]
  const racaCorreta = RACA_PERMITIDA[classe]
  const tentativas = incrementarTentativas(player)

  if (tentativas === 1) {
    // 1ª tentativa — só aviso
    player.tell(cor + '⚠ AVISO: Você não pode se transformar nessa raça!')
    player.tell('§7Como ' + classe + ' sua raça é: §e' + racaCorreta)
    player.tell('§cSe tentar novamente você morrerá.')

  } else if (tentativas === 2) {
    // 2ª tentativa — morte
    player.tell(cor + '☠ Você foi avisado.')
    player.server.runCommandSilent('kill ' + player.username)

  } else {
    // 3ª tentativa em diante — morte + perde metade dos itens
    player.tell(cor + '☠ Última chance desperdiçada. Você perde metade de seus itens.')

    // Coleta todos os itens do inventário
    const itens = []
    player.inventory.allItems.forEach(item => {
      if (!item || item.count === 0) return
      itens.push({ id: item.id, count: item.count, nbt: item.nbt })
    })

    // Remove metade de cada stack
    player.inventory.allItems.forEach(item => {
      if (!item || item.count === 0) return
      item.count = Math.floor(item.count / 2)
    })

    // Mata o player
    player.server.runCommandSilent('kill ' + player.username)

    player.tell('§c⚠ Continuando assim você perderá TODOS os itens.')
  }
}

// ── Verifica se a raça atual é permitida ─────────────────────

function racaEPermitida(player, factionId) {
  const classe = global.getClasse(player)
  if (classe === 'nenhum') return true // Sem classe, não interfere

  const racaPermitida = RACA_PERMITIDA[classe]
  const factionPermitida = FACTIONS[racaPermitida]

  // Humano é sempre permitido (estado neutro)
  if (factionId === FACTIONS.humano) return true

  return factionId === factionPermitida
}

// ── Evento: mudança de facção/raça ────────────────────────────

VampirismEvents.factionChanged(event => {
  const player = event.player
  const novaFaction = event.newFaction ? event.newFaction.id : FACTIONS.humano

  // Raça permitida? Deixa acontecer
  if (racaEPermitida(player, novaFaction)) return

  // Cancela a transformação
  event.cancel()

  const classe = global.getClasse(player)
  const cor = global.COR_POR_CLASSE[classe]

  // Aplica punição progressiva
  punir(player)
})

// ── Tick: verifica se player está na raça errada ──────────────
// Garante que nenhum bug deixou passar a restrição

PlayerEvents.tick(event => {
  const player = event.player
  if (player.age % 100 !== 0) return // A cada 5 segundos

  const classe = global.getClasse(player)
  if (classe === 'nenhum') return

  // Pega facção atual do player via Vampirism
  try {
    const faction = VampirismAPI.getFaction(player)
    if (!faction) return

    const factionId = faction.id
    if (!racaEPermitida(player, factionId)) {
      // Força volta pra humano
      VampirismAPI.setFaction(player, null)

      const cor = global.COR_POR_CLASSE[classe]
      player.tell(cor + '⚠ Sua raça foi revertida — você não pode ser essa raça!')
    }
  } catch(e) {
    // API não disponível ainda, ignora
  }
})

console.info('[Racas] systems/racas.js carregado.')
