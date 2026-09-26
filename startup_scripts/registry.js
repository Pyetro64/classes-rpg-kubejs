// =============================================================
// startup_scripts/registry.js
// Registro de itens customizados — roda UMA vez ao iniciar
// =============================================================

StartupEvents.registry('item', event => {

  // ── Contratos de classe ───────────────────────────────────

  event.create('contrato_engenheiro')
    .displayName('§6Contrato do Engenheiro')
    .tooltip('§7Clique direito para se tornar um Engenheiro.')
    .tooltip('§c⚠ Escolha permanente — não pode ser desfeita.')
    .maxStackSize(1)

  event.create('contrato_mago')
    .displayName('§bContrato do Mago')
    .tooltip('§7Clique direito para se tornar um Mago.')
    .tooltip('§c⚠ Escolha permanente — não pode ser desfeita.')
    .maxStackSize(1)

  event.create('contrato_alquimista')
    .displayName('§5Contrato do Alquimista')
    .tooltip('§7Clique direito para se tornar um Alquimista.')
    .tooltip('§c⚠ Escolha permanente — não pode ser desfeita.')
    .maxStackSize(1)

  // ── Portal de retorno ─────────────────────────────────────

  event.create('portal_overworld')
    .displayName('§aPortal do Retorno')
    .tooltip('§7Clique direito para retornar ao Overworld.')
    .tooltip('§e✦ Você encontrou seu caminho de volta.')
    .maxStackSize(1)

  console.info('[Registry] Itens customizados registrados.')
})
