// =============================================================
// systems/maldicoes.js — Maldições por classe
// Depende de: core/utils.js + dimensoes.js
// =============================================================

const DIM = {
  OVER:   'minecraft:overworld',
  NETHER: 'minecraft:the_nether',
  AETHER: 'aether:the_aether'
}

// ══════════════════════════════════════════════════════════════
// MALDIÇÃO DO ENGENHEIRO — A Besta Incontrolável
// Fúria aumenta no Nether quando não transformado
// ══════════════════════════════════════════════════════════════

function tickFuria(player) {
  const dim = player.level.dimension
  if (dim !== DIM.NETHER) {
    // Fora do Nether: fúria diminui gradualmente
    if (player.persistentData.furia > 0) {
      player.persistentData.furia = Math.max(
        0, player.persistentData.furia - 2
      )
    }
    return
  }

  // No Nether transformado: sem fúria incontrolável
  if (player.tags.contains('werewolves:transformed') ||
      player.tags.contains('werewolves:werewolf_form')) {
    return
  }

  // No Nether humano: fúria aumenta
  if (!player.persistentData.furia) player.persistentData.furia = 0
  player.persistentData.furia = Math.min(100, player.persistentData.furia + 1)

  const furia = player.persistentData.furia

  // Avisos progressivos
  if (furia === 25) {
    player.tell('§6⚠ Você sente a besta se agitar...')
  } else if (furia === 50) {
    player.tell('§c⚠ A fúria está crescendo. Saia logo ou transforme-se.')
    player.potionEffects.add('minecraft:strength', 100, 0, false, true)
  } else if (furia === 75) {
    player.tell('§c☠ A besta está quase no controle!')
    player.potionEffects.add('minecraft:strength', 100, 1, false, true)
  } else if (furia >= 100) {
    // Transformação forçada — ataca tudo incluindo ratos
    player.tell('§4☠ A BESTA TOMOU CONTROLE!')
    player.server.runCommandSilent(
      'werewolves:transform ' + player.username
    )
    // Reseta fúria após transformação forçada
    player.persistentData.furia = 0
  }
}

// ══════════════════════════════════════════════════════════════
// MALDIÇÃO DO ALQUIMISTA — Hidrofobia
// ══════════════════════════════════════════════════════════════

function tickHidrofobia(player) {
  const dim = player.level.dimension

  // Hidrofobia só no Overworld e Aether
  if (dim === DIM.NETHER) return

  // Verifica se está em água
  const inWater = player.isInWater()
  const raining = player.level.isRaining() &&
                  player.level.canSeeSky(player.blockPosition())

  if (inWater) {
    // Dentro da água: dano pesado
    player.hurt(player.damageSources().drown(), 3)
    player.potionEffects.add('minecraft:weakness', 60, 1, false, true)
    if (!player.persistentData.avisoAgua) {
      player.tell('§5☠ A água queima como ácido em suas veias!')
      player.persistentData.avisoAgua = true
    }
  } else {
    player.persistentData.avisoAgua = false
  }

  if (raining && !inWater) {
    // Chuva: dano leve contínuo
    player.hurt(player.damageSources().generic(), 0.5)
    if (!player.persistentData.avisoChuvra) {
      player.tell('§5⚠ A chuva te enfraquece. Procure abrigo.')
      player.persistentData.avisoChuvra = true
    }
  } else {
    player.persistentData.avisoChuvra = false
  }
}

// ══════════════════════════════════════════════════════════════
// MALDIÇÃO DO MAGO — Agonia da Luz
// Amplifica o dano solar do Vampirism no Overworld
// Cura passiva no Aether
// ══════════════════════════════════════════════════════════════

function tickAgoriaLuz(player) {
  const dim = player.level.dimension

  if (dim === DIM.AETHER) {
    // Lar celestial: cura passiva leve
    if (player.health < player.maxHealth) {
      player.heal(0.5)
    }
    return
  }

  if (dim === DIM.OVER) {
    // Overworld durante o dia com luz solar direta
    const isDay = player.level.dayTime < 13000
    const canSeeSky = player.level.canSeeSky(player.blockPosition())

    if (isDay && canSeeSky) {
      // Vampirism já aplica dano solar — amplificamos levemente
      player.potionEffects.add('minecraft:weakness', 60, 0, false, true)
    }
    return
  }

  if (dim === DIM.NETHER) {
    // Nether: magia sufocada — regeneração de mana mais lenta
    // Aplicado como fraqueza mágica (sem céu, sem estrelas)
    player.potionEffects.add('minecraft:mining_fatigue', 100, 0, false, true)
  }
}

// ══════════════════════════════════════════════════════════════
// TICK PRINCIPAL
// ══════════════════════════════════════════════════════════════

PlayerEvents.tick(event => {
  const player = event.player
  const classe = global.getClasse(player)

  // Fúria do Engenheiro — verifica a cada 5 segundos
  if (classe === 'engenheiro' && player.age % 100 === 0) {
    tickFuria(player)
  }

  // Hidrofobia do Alquimista — verifica a cada 1 segundo
  if (classe === 'alquimista' && player.age % 20 === 0) {
    tickHidrofobia(player)
  }

  // Agonia da Luz do Mago — verifica a cada 3 segundos
  if (classe === 'mago' && player.age % 60 === 0) {
    tickAgoriaLuz(player)
  }
})

console.info('[Maldicoes] systems/maldicoes.js carregado.')
