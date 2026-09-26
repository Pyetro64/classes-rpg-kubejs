// =============================================================
// systems/teams.js — Integração FTB Teams com classes
// Depende de: core/utils.js
// =============================================================

const TIME_PARA_CLASSE = {
  'engenheiro': 'engenheiro',
  'mago':       'mago',
  'alquimista': 'alquimista'
}

function aplicarTagDeClasse(player, nomeTime) {
  const classe = TIME_PARA_CLASSE[nomeTime.toLowerCase()]
  if (!classe) return false

  player.removeTag('engenheiro')
  player.removeTag('mago')
  player.removeTag('alquimista')
  player.addTag(classe)

  const cor = global.COR_POR_CLASSE[classe]
  player.tell(cor + '⚔ Classe definida: ' + classe.toUpperCase() + '!')
  return true
}

// Player entrou num time
FTBTeamsEvents.playerJoinedTeam(event => {
  aplicarTagDeClasse(event.player, event.team.name)
})

// Player saiu de um time
FTBTeamsEvents.playerLeftTeam(event => {
  event.player.removeTag('engenheiro')
  event.player.removeTag('mago')
  event.player.removeTag('alquimista')
  event.player.tell('§7Você saiu do seu time. Classe removida.')
})

// Ao logar: reaplica tag caso servidor tenha reiniciado
PlayerEvents.loggedIn(event => {
  const player = event.player
  if (global.getClasse(player) !== 'nenhum') return

  // Busca time atual do player pelo FTB Teams
  try {
    const manager = FTBTeamsAPI.getManager()
    const team = manager.getTeamForPlayer(player.uuid)
    if (team) aplicarTagDeClasse(player, team.name)
  } catch(e) {
    console.warn('[Teams] Não foi possível recuperar time no login: ' + e)
  }
})

console.info('[Teams] systems/teams.js carregado.')
