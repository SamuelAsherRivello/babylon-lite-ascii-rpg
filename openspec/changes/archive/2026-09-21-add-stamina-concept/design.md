# Design

## Context

Babylon Lite owns keyboard/canvas movement, the Time System exposes the HUD's
world-time value, and React renders the HTML Character box through narrow bridge
snapshots. The current Character box has four bars and 28px square resource
slots. See `proposal.md` and the spec deltas for the user-visible contract.

## Goals / Non-Goals

**Goals:**

- Keep stamina, attack-cost, and sprint rules authoritative and testable in
  Babylon Lite.
- Leave walking and sprinting free while movement T ticks regenerate stamina.
- Charge stamina exactly once when a player attack resolves against an enemy.
- Apply one dynamic three-shade transition language to every Character bar and
  preserve the responsive HUD.
- Keep zero stamina playable while applying the agreed exhausted repeat timing.

**Non-Goals:**

- Attack, defense, damage, or other combat-stat penalties at zero stamina.
- Numeric stamina labels or a new visual language for the meter.
- Persistence across reloads or realm transitions.
- A new dependency or a React-owned gameplay scheduler.

## Decisions

1. **Use a dedicated bounded stamina system.** The system owns max `50`, current
   value, the `25`-point enemy-attack cost, T-tick recovery, clamping, and snapshots. This keeps
   React from becoming a second gameplay owner and makes future tuning local.

2. **Movement recovers without spending stamina.** Walking and sprinting have no
   stamina cost. Every successful movement advances HUD Time by one movement
   tick and restores `10`, capped at `50`.

3. **Use Shift as the sprint modifier.** Preserve the existing centralized
   Shift later-repeat interval of `100/3ms`; sprinting changes cadence only.

4. **Multiply the active later-repeat interval while exhausted.** The initial
   movement remains immediate. At zero stamina, walking uses `375ms`
   (`125ms × 3`) and sprinting uses `100ms` (`100/3ms × 3`).

5. **Charge resolved enemy attacks.** The shared player combat-turn resolver
   spends `25` stamina exactly once after recognizing a live enemy target. A
   stale or non-combat collision spends nothing. Attacks remain available below
   `25`, and the bounded stamina system clamps the result to `0`. The existing
   combat Time tick does not trigger movement-only stamina recovery.

6. **Extend the existing immutable snapshot and bar component.** React receives
   authoritative nominal values plus normalized presentation percentages. The
   generic bar performs no nominal-value math and renders only the supplied
   `0`-to-`100` percentages. The configured target color supplies the solid current shade, a
   lighter temporary delta shade, and a dark unfilled shade. A value change
   temporarily shows the changed interval as delta before it settles into the
   current or unfilled section. Stamina's gameplay current/max remain `50/50`,
   while its model supplies an initial visual of `50%` solid orange and `50%`
   dark orange. The new
   row is inserted after Health. Resource/slot boxes use a hardcoded `22.4px`
   size to preserve room.

## Risks / Trade-offs

- **[Risk]** Movement now only replenishes stamina, so repeated movement can
  refill combat expenditure quickly. → Preserve the requested `+10` per
  successful movement tick and centralize the recovery and attack constants.
- **[Risk]** A fifth bar and smaller slots may still compress portrait HUD
  content. → Verify landscape and portrait presentations and retain the
  existing responsive overflow protections.
- **[Risk]** A delta transition can obscure the current value briefly. → Keep
  gameplay current/max accessibility values independent from the `100`-unit
  visual capacity and transient animation.

## Migration Plan

Implement the stamina system, combat cost, sprint timing, T-tick integration,
bridge fields, and HUD row together. Update focused Node tests, run the
repository test and build commands, and manually verify free movement,
enemy-attack spending, T-tick recovery, and both HUD orientations at the
configured local Vite URL.
No persisted data migration is required; rollback is limited to the scoped
source and planning files.
