// =============================================================
// systems/retorno.js — Portal de retorno ao Overworld
// Depende de: core/utils.js
// Item registrado em: startup_scripts/registry.js
// =============================================================

// ── Uso do portal ─────────────────────────────────────────────

ItemEvents.rightClicked(event => {
  const player = event.player
  if (event.item.id !== 'kubejs:portal_overworld') return

  event.cancel()

  if (player.level.dimension === 'minecraft:overworld') {
    player.tell('§e✦ Você já está no Overworld!')
    return
  }

  // Teleporta e consome o item
  player.teleportTo('minecraft:overworld', 0, 100, 0, 0, 0)
  event.item.count = 0

  player.persistentData.retornou = true
  player.tell('§a✦ Você retornou ao Overworld!')
  player.tell('§7A partir de agora explore livremente.')
})

// ── Easter egg: morrer 10 vezes ganha o portal ───────────────

PlayerEvents.respawned(event => {
  const player = event.player
  const classe = global.getClasse(player)

  // Só vale pra quem nasceu fora do Overworld
  if (classe !== 'mago' && classe !== 'alquimista') return

  // Já retornou ao Overworld? Não precisa mais
  if (player.persistentData.retornou) return

  // Já ganhou o easter egg?
  if (player.persistentData.easterEggDado) return

  // Só conta mortes fora do Overworld
  if (player.level.dimension === 'minecraft:overworld') return

  if (!player.persistentData.mortes) player.persistentData.mortes = 0
  player.persistentData.mortes += 1

  const mortes = player.persistentData.mortes

  if (mortes === 5) {
    player.tell('§c💀 Você morreu 5 vezes... está bem aí?')
  } else if (mortes === 8) {
    player.tell('§c💀 Mais 2 mortes e talvez o destino te ajude...')
  } else if (mortes >= 10) {
    player.persistentData.easterEggDado = true

    const keepInv = player.level.getGameRules().getBoolean('keepInventory')
    if (keepInv) {
      player.give('kubejs:portal_overworld')
      player.tell('§e✦ O destino teve pena de você...')
      player.tell('§aVocê recebeu um Portal do Retorno.')
    } else {
      player.tell('§e✦ O destino tentou te ajudar...')
      player.tell('§c⚠ Mas keepInventory está desligado. Ative-o para receber o item.')
    }
  }
})

console.info('[Retorno] systems/retorno.js carregado.')
