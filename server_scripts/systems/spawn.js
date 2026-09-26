// =============================================================
// systems/spawn.js — Teleporte inicial por classe
// Depende de: core/utils.js
// Coordenadas ajustadas para 1.20.1 Forge
// =============================================================

// Overworld  → Y64 é nível do mar, 68 garante que não spawna dentro do chão
// Aether     → dimensão começa em Y torno de 600 internamente mas o
//              teleportTo usa coordenadas locais da dim, 150 é seguro
// Nether     → teto de bedrock em Y127, chão em Y32 aprox, 40 é seguro

const SPAWNS = {
  engenheiro: { dim: 'minecraft:overworld',  x: 0, y: 68,  z: 0 },
  mago:       { dim: 'aether:the_aether',    x: 0, y: 150, z: 0 },
  alquimista: { dim: 'minecraft:the_nether', x: 0, y: 40,  z: 0 }
}

function getSpawnData(player) {
  if (!player.persistentData.spawnSystem) {
    player.persistentData.spawnSystem = {
      spawned: false,
      lastClass: null,
      lastRespawnKey: null
    }
  }
  return player.persistentData.spawnSystem
}

function getRespawnKey(player) {
  const r = player.getRespawnPosition ? player.getRespawnPosition() : null
  if (!r) return 'none'
  return r.dimension + '|' + r.x + '|' + r.y + '|' + r.z
}

// Ao respawnar: reseta flag para re-teleportar se não tiver cama/âncora
PlayerEvents.respawned(event => {
  const player = event.player
  const data = getSpawnData(player)
  data.spawned = false
  data.lastRespawnKey = getRespawnKey(player)
})

PlayerEvents.tick(event => {
  const player = event.player
  if (player.age % 20 !== 0) return

  const classe = global.getClasse(player)
  if (classe === 'nenhum') return

  const data = getSpawnData(player)
  const respawnAtual = getRespawnKey(player)

  // Se o player mudou o ponto de respawn (cama/âncora), permite re-teleportar
  if (data.lastRespawnKey !== respawnAtual) {
    data.spawned = false
    data.lastRespawnKey = respawnAtual
  }

  if (data.spawned && data.lastClass === classe) return

  const spawn = SPAWNS[classe]
  if (!spawn) return

  player.teleportTo(spawn.dim, spawn.x, spawn.y, spawn.z, 0, 0)

  data.spawned = true
  data.lastClass = classe
  data.lastRespawnKey = respawnAtual

  const cor = global.COR_POR_CLASSE[classe]
  player.tell(cor + 'Bem-vindo à sua dimensão, ' + classe + '!')
})

console.info('[Spawn] systems/spawn.js carregado.')
