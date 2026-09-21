# Proposal

## Why

The player can already attack enemies, receive damage, spend stamina on
attacks, recover stamina through movement-driven time, and die or kill enemies.
However, the Offense and Defense HUD bars are still static and combat still
uses fixed damage values. This change makes those bars meaningful by deriving
temporary combat readiness from the existing stamina resource while preserving
the completed health and stamina rules.

## What Changes

- Add authoritative player combat-stat state for maximum and current Offense
  and Defense values without changing health or stamina ownership, limits,
  costs, or recovery.
- Derive current Offense and Defense from the existing stamina percentage
  using a proposed linear factor of `1`: when stamina is at 60% of its maximum,
  current Offense and Defense are 60% of their respective maximums.
- Publish immutable Offense and Defense snapshots through the existing narrow
  game-to-React bridge and render their current values in the existing
  three-color Character bars.
- Preserve each stat's permanent maximum as the bar maximum so future level
  progression can increase maximum values without redesigning the HUD.
- Replace the player's fixed combat damage with maximum attack damage scaled
  by current Offense relative to maximum Offense, while retaining a minimum
  damage of `1` for a valid attack.
- Replace the enemy's fixed player damage with maximum enemy damage reduced by
  the player's current Defense using a bounded, deterministic mitigation rule.
- Apply the same stamina-derived player damage calculation when the player
  attacks an enemy spawner, preserving the existing collision and time rules.
- Keep movement-only stamina recovery, attack stamina cost, health clamping,
  death transitions, enemy lifecycle, and existing combat timing unchanged.
- Add focused tests for stat snapshots, stamina-to-stat transitions, HUD
  presentation, player damage scaling, defensive mitigation, minimum damage,
  and preservation of existing health/stamina behavior.

## Capabilities

### New Capabilities

- `combat-stats`: Defines stamina-derived Offense and Defense values and the
  deterministic formulas used for player and enemy damage.

### Modified Capabilities

- `character-info`: Offense and Defense bars now render authoritative current
  and maximum values rather than static initial percentages.
- `game-layer-architecture`: The Babylon Lite game layer owns combat-stat
  calculation and React receives immutable stat snapshots only.

## Impact

- Affected runtime areas include the Babylon Lite combat, player lifecycle,
  enemy system, stamina integration, bridge snapshots, and React Character
  bar presentation.
- The existing `5` maximum damage values remain the initial tuning inputs; the
  new formulas determine the applied amount at the moment of impact.
- The starting stamina remains `50 / 50`, and the proposed initial Offense and
  Defense maximums are `25` each; exact future level-growth values remain an
  unresolved follow-up decision.
- The proposed defensive rule is bounded so full Defense cannot make the
  player invulnerable: mitigation is capped at 50% of incoming damage.
- No new dependency, persistence migration, health rule, stamina rule, or
  React-owned gameplay state is introduced.
