# Design

## Context

See `proposal.md` for motivation and `specs/in-world-health-bars/spec.md` for the behavior contract. The health-bar system retains damage-derived presentation values and a cell snapshot, while the Babylon Lite overlay renderer can resolve the current occupancy entity for an active bar. The current render path uses the retained snapshot for sprite geometry, allowing an enemy movement update to leave the bar behind.

## Goals / Non-Goals

**Goals:**

- Preserve health, maximum health, damage-delta, alpha, and visibility timing as health-bar presentation state.
- Resolve position from current world occupancy at render time so active bars track moving entities.
- Retain existing active-realm, visible-region, and fog filtering and hide bars whose entity can no longer be resolved.

**Non-Goals:**

- Adding other world-space UI, including floating text, nameplates, or player health bars.
- Changing enemy movement, collision, combat, health, world persistence, or the health-bar visual design.
- Adding a new renderer, dependency, or per-frame gameplay mutation.

## Decisions

### Separate damage presentation from the current world anchor

Keep the health-bar record keyed by entity identity and retain only the values that describe the damage presentation. At each health-bar render or animation update, resolve the matching entity from current active-world occupancy and use that entity's current cell for visibility checks and sprite geometry.

This aligns a presentation overlay with the authoritative moving entity without duplicating movement updates into the health-bar system. A bar that cannot resolve an entity will be excluded from the active render set, preventing a stale position.

Alternative considered: update the health-bar record at every enemy movement. Rejected because it couples movement simulation to a presentation-only system, risks missed move paths, and duplicates the world entity's authoritative position.

### Preserve timing and visual values across movement

Movement affects only anchor resolution. Existing damage-time timestamps, fill ratio inputs, and delta inputs remain in the health-bar record, so moving an enemy does not reset, extend, or otherwise alter the visibility cycle.

Alternative considered: re-record damage or recreate the bar after movement. Rejected because it would incorrectly restart fades and delta visibility without a new health change.

### Prove both state isolation and rendered anchoring

Add focused Node coverage for an active damaged enemy whose occupancy cell changes, asserting that the bar is rendered at the new grid center while its health-derived state remains unchanged. Keep existing health-bar system and geometry tests for timing and visual sizing. Complete manual browser verification against a seeded world where a damaged enemy takes a movement turn before the bar expires.

## Risks / Trade-offs

- [An entity is removed or changes realm while a bar is active] → Resolve occupancy and visibility at render time and hide unmatched or inactive-realm bars rather than using the last known cell.
- [A cached renderer path bypasses the active-bar render update] → Cover the movement-to-overlay position path with a focused integration assertion and verify it manually while the bar is visible.
- [Movement accidentally changes health-bar timing] → Retain the existing timing owner and assert that only the resolved anchor changes.

## Migration Plan

1. Update the presentation path without changing saved data or public interfaces.
2. Run focused health-bar tests, then the repository test and build checks.
3. Manually verify a seeded browser session with a damaged moving enemy.

Rollback consists of reverting the scoped implementation and tests; no data migration or compatibility action is required.
