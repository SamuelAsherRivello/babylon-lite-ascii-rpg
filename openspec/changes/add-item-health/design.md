# Design

## Context

See proposal.md and the capability deltas for the behavior contract. Babylon Lite currently owns character capabilities, combat resolution, mountain damage, player health, and the narrow character-state bridge. React owns the character-corner presentation and must remain a consumer of immutable snapshots.

## Goals / Non-Goals

**Goals:**

- Keep item health authoritative in the game layer and update it from the same damage results already used by gameplay.
- Preserve the existing Sword, Pickaxe, Shield, Offense, Defense, stamina, and health rules except for finite equipment durability.
- Reuse the character inventory-slot layout and existing bar presentation patterns for compact item-health bars.
- Make depletion remove only the affected item and immediately change capability resolution.

**Non-Goals:**

- No item repair, replacement, loot, persistence, or new inventory management UI.
- No changes to Shield behavior against non-enemy damage sources unless they are already routed through the incoming enemy-damage path.
- No new dependencies or Playwright test work.

## Decisions

1. **Store health on each item record.** Extend the existing immutable slot item shape with current and maximum health for the three durable items. This keeps the inventory and its presentation aligned; a separate parallel durability registry could drift from slot removal and is not needed for the current four-slot model.

2. **Apply wear from actual resolved damage.** Combat and mountain systems already calculate and clamp damage. The caller will use the returned applied damage rather than recomputing from Offense or target state, preventing durability from diverging on lethal or partially damaged targets.

3. **Use post-Defense damage for Shield wear.** The incoming-contact flow will calculate the shield-aware player damage, apply that same final amount to player health, and wear Shield by that amount. Once Shield is absent, capability resolution falls through to the body path and preserves existing damage handling.

4. **Remove depleted items through the existing character-state publication path.** A zero-health item becomes `null` in its slot, which naturally disables Sword/Pickaxe/Shield responders and renders the existing empty-slot placeholder. React will not own depletion decisions.

5. **Render item bars inside inventory cells.** The character-corner remains the existing six-cell grid. Item cells will expose an accessible current/max value and a compact bar, while empty and resource cells retain their current structure.

6. **Test at system boundaries.** Add focused pure/system tests for item normalization and depletion, combat and mountain wear, shield/body fallback, bridge cloning, and UI presentation. Keep existing repository-wide Node tests and build validation as the final checks.

## Risks / Trade-offs

- [Risk] Adding health fields to default and cloned slot records may affect exact object-shape assertions. -> Update focused fixtures and retain backward-compatible normalization for supplied items without health.
- [Risk] Multiple damage paths could accidentally wear equipment twice. -> Centralize wear at the boundary that receives the authoritative applied-damage result and test one event per hit.
- [Risk] Small inventory cells may become visually crowded. -> Use a compact bar with the existing character-bar color/segmentation conventions and verify desktop and portrait layouts manually.
- [Risk] A depleted Shield changes the meaning of the Defense stat. -> Keep the published Defense snapshot unchanged; only the incoming-damage responder selection changes when the Shield slot is absent.
