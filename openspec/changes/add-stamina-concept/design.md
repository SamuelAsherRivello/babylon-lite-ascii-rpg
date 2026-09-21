# Design

## Context

Babylon Lite owns keyboard/canvas movement, the Time System exposes the HUD's
world-time value, and React renders the HTML Character box through narrow bridge
snapshots. The current Character box has four bars and 28px square resource
slots. See `proposal.md` and the spec deltas for the user-visible contract.

## Goals / Non-Goals

**Goals:**

- Keep stamina and sprint rules authoritative and testable in Babylon Lite.
- Separate movement costs from T-tick regeneration so sprinting can drain faster
  than walking even when both actions are frequent.
- Preserve the existing bar transition visual language and responsive HUD.
- Keep zero stamina playable while applying the agreed exhausted repeat timing.

**Non-Goals:**

- Attack, defense, damage, or other combat-stat penalties at zero stamina.
- Numeric stamina labels or a new visual language for the meter.
- Persistence across reloads or realm transitions.
- A new dependency or a React-owned gameplay scheduler.

## Decisions

1. **Use a dedicated bounded stamina system.** The system owns max `50`, current
   value, movement costs, T-tick recovery, clamping, and snapshots. This keeps
   React from becoming a second gameplay owner and makes future tuning local.

2. **Treat movement and T ticks as separate events.** Walking costs `1` and
   sprinting costs `2`; a T tick restores `10` and caps at `50`. If both happen
   in one event boundary, cost is applied first, then recovery. This preserves
   the requested ordering while allowing independent T ticks to make sprinting
   more expensive over time.

3. **Use Shift as the sprint modifier.** Shift changes the movement cadence to
   a faster cadence than walking and selects the `2`-stamina cost. The exact
   sprint timing remains a tuning point because the request establishes the
   relative speed, not exact milliseconds.

4. **Use a fixed exhausted repeat interval.** The initial movement remains
   immediate; while stamina is zero, the second and subsequent movement
   attempts use `0.375s` intervals. This is the confirmed interpretation of
   the approximately three-times-slower requirement.

5. **Extend the existing immutable snapshot and bar component.** React receives
   only current/max values, renders a visual-only progress bar, and reuses the
   current/delta/unfilled transition colors. The new row is inserted after
   Health. Resource/slot boxes use a hardcoded `22.4px` size to preserve room.

## Risks / Trade-offs

- **[Risk]** If T ticks remain coupled to every movement, both walking and
  sprinting will regenerate faster than they consume. → Keep T-tick emission
  distinct from movement in the stamina integration and test movement without
  a T tick separately.
- **[Risk]** An unspecified sprint cadence could produce inconsistent tuning.
  → Implement sprint through one centralized cadence decision and keep the
  exact constant explicit for later adjustment.
- **[Risk]** A fifth bar and smaller slots may still compress portrait HUD
  content. → Verify landscape and portrait presentations and retain the
  existing responsive overflow protections.
- **[Risk]** A delta transition can obscure the current value briefly. → Reuse
  the existing bar transition lifecycle and verify current/max accessibility
  values independently of the visual animation.

## Migration Plan

Implement the stamina system, sprint timing, T-tick integration, bridge fields,
and HUD row together. Update focused Node tests, run the repository test and
build commands, and manually verify walking, sprinting, zero-stamina cadence,
T-tick recovery, and both HUD orientations at the configured local Vite URL.
No persisted data migration is required; rollback is limited to the scoped
source and planning files.

## Open Questions

- What real-time or gameplay source should emit independent T ticks when the
  current game still advances displayed Time primarily through movement?
- What exact sprint intervals should be used while preserving a faster cadence
  than normal movement?
