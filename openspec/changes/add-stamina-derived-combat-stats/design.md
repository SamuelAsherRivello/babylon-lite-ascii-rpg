# Design

## Context

The completed stamina and enemy changes already provide the relevant runtime
boundaries. `stamina-system.js` owns a bounded player stamina value, spends
`25` stamina for a resolved attack, and restores `10` stamina only on
movement-caused time ticks. `combat-system.js` currently applies fixed player
collision damage and advances a combat tick. `enemy-system.js` currently
applies a fixed `5` damage when an eligible enemy reaches an adjacent player.
The React Character panel already has Offense and Defense rows, but their
values remain static in `character-data.js` and are not published through the
bridge.

See `proposal.md` and `specs/combat-stats/spec.md` for the user-visible
behavior and acceptance scenarios.

## Goals / Non-Goals

**Goals:**

- Establish one authoritative, pure calculation boundary for stamina-derived
  current Offense and Defense values.
- Preserve the existing stamina and health systems as inputs and owners rather
  than modifying their rules.
- Scale both player attacks and enemy attacks through the same explicit,
  deterministic combat-stat calculations.
- Publish narrow immutable snapshots for React so the existing three-color
  bars visibly track temporary combat readiness.
- Keep the initial maximum values and damage tuning centralized so later level
  progression can raise maximums without replacing the formulas.

**Non-Goals:**

- Changing stamina maximum, attack stamina cost, movement recovery, health
  maximum, health recovery, death behavior, or combat time advancement.
- Adding experience rewards, level-up behavior, equipment, critical hits,
  misses, resistances, damage types, or new enemy archetypes.
- Showing enemy Offense or Defense bars or exposing enemy state to React.
- Persisting combat stats across reloads or realms.

## Decisions

### Keep stamina as the only temporary combat resource

The game layer SHALL keep Offense and Defense maximums as persistent values
within the current session, but derive their current values from stamina rather
than maintaining separate depletion pools:

```text
staminaRatio = stamina.current / stamina.maximum
currentOffense = round(offenseMaximum * staminaRatio)
currentDefense = round(defenseMaximum * staminaRatio)
```

Values are clamped to their maximums and never fall below zero. This makes one
attack's stamina cost visible in all three bars without double-spending stamina
or introducing synchronization bugs between independent temporary resources.

A separate Offense/Defense stamina cost was rejected because the requested
player story is specifically that attacking lowers stamina and the other two
bars visibly follow it.

### Use normalized player damage with a minimum of one

The first tuning inputs remain maximum player damage `5`, starting stamina
`50 / 50`, and initial Offense maximum `25`. Player damage is calculated as:

```text
offenseRatio = currentOffense / offenseMaximum
damage = max(1, round(maxPlayerDamage * offenseRatio))
```

The same player calculation is used for enemy and enemy-spawner collision
targets. A minimum of one keeps exhausted attacks playable and avoids a state
where the player can spend time but never finish an enemy.

An unnormalized multiplication of maximum damage by the raw Offense value was
rejected because it would make an Offense value of `25` turn a maximum damage
of `20` into `500` damage and would couple tuning units unnecessarily.

### Use bounded Defense mitigation

The first tuning inputs remain maximum enemy attack damage `5`, starting
stamina `50 / 50`, and initial Defense maximum `25`. Defense reduces, rather
than divides, incoming damage:

```text
defenseRatio = currentDefense / defenseMaximum
mitigation = min(0.5, 0.5 * defenseRatio)
damage = max(1, ceil(maxEnemyDamage * (1 - mitigation)))
```

At full Defense, a `5`-damage enemy attack applies `3` after rounding up. At
zero Defense it applies the full `5`. This preserves a meaningful attack even
against a fully ready player and prevents Defense from creating invulnerability.

Direct division by Defense was rejected because zero Defense creates a special
case and high Defense can make damage collapse too quickly. A flat subtraction
was also rejected because its meaning would depend on matching the arbitrary
units of Defense and damage.

### Derive snapshots at the game-layer boundary

The Babylon Lite game layer will own a small combat-stats state/calculation
boundary. It will subscribe to the authoritative stamina system, recalculate
current Offense and Defense after stamina changes, and expose immutable
snapshots containing:

- `current`;
- `maximum`;
- normalized `currentPercent`;
- previous percentage and revision metadata for the existing bar transition.

The bridge will mirror the existing health and stamina snapshot pattern.
`main.jsx` will subscribe the UI to those snapshots, while React will only
provide them to the existing Character bar component. The bar's current fill
will use the normalized percentage, its pending fill will retain the existing
transition behavior, and its maximum ARIA value will use the stat maximum.

Keeping this state out of React avoids a second stamina calculation and keeps
damage resolution independent of UI render timing.

### Keep enemy maximum damage in the enemy system

Enemy AI remains responsible for deciding when an attack occurs and for
providing its configured maximum attack damage. The shared combat calculation
will apply the player's current Defense before calling the existing player
lifecycle. This preserves enemy tick cadence, logging, adjacency, and death
behavior while replacing only the fixed damage amount.

An enemy-owned Defense model is not part of this change; future enemy stat
profiles can reuse the same calculation boundary without changing the player
HUD contract.

## Risks / Trade-offs

- **[Risk]** The current stamina snapshot uses a nominal bar percentage tied to
  its existing `50`-unit HUD representation. -> Derive combat-stat percentages
  from `current / maximum` directly, without changing the existing stamina
  snapshot semantics.
- **[Risk]** Rounding can make adjacent stamina values deal equal damage. ->
  Specify rounding and minimum damage in pure tests; tune maximum damage later
  rather than adding random variance.
- **[Risk]** Full Defense may feel too strong or too weak after the first live
  combat pass. -> Keep mitigation capped at 50% and centralize the cap for a
  later balance adjustment.
- **[Risk]** Bridge updates could be emitted more often than visible combat
  changes. -> Publish only when the derived snapshot changes and reuse the
  existing revision-based bar transition.
- **[Risk]** Future level growth could change maximums while stamina is low. ->
  Recompute current values from the new maximum and current stamina, preserving
  the same normalized readiness ratio.

## Migration Plan

1. Add pure combat-stat calculation and snapshot tests using the existing
   `node:test` layout.
2. Add game-layer stat ownership and bridge subscriptions without changing
   stamina or health constants.
3. Update player collision damage and enemy player-damage resolution to use
   the pure formulas.
4. Connect the existing React Offense and Defense rows to authoritative
   snapshots and verify three-color transitions after attack and retreat.
5. Run focused Node tests, the full documented test suite, production build,
   and manual browser combat verification.

No persisted-state migration is required. Rollback is limited to the new
combat-stat boundary, bridge fields, HUD bindings, and combat calculation
call sites.
