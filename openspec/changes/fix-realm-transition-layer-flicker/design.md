# Design

## Context

See proposal.md for the user-visible problem and requirements. The current
Babylon controller owns a game canvas, minimap canvas, transition mask, sprite
renderer, and active realm. At the covered callback it clears visible sprite
slots, renders the destination, and presents immediately; however, the normal
world-render path can still reconcile a changed glyph atlas by removing and
recreating the game sprite layer. The transition system and React bridge must
remain unchanged in ownership: Babylon Lite controls the handoff, while React
continues to receive only realm status and remains outside the mask.

## Goals / Non-Goals

**Goals:**

- Keep an attached game-layer presentation surface through the entire covered
  realm swap.
- Ensure destination glyphs, lighting, fog, and player placement are submitted
  before the transition system exposes the opening aperture.
- Preserve both stair-triggered and Settings-triggered transfers, paired
  arrival coordinates, input locking, bridge status updates, and UI stacking.
- Add a deterministic regression seam that observes renderer attachment and
  presentation ordering without requiring a browser screenshot for every test.

**Non-Goals:**

- No change to transition durations, iris appearance, camera behavior, realm
  generation, fog persistence, or React UI structure.
- No new renderer, atlas, or animation dependency.
- No broad renderer-layer refactor outside the realm-swap handoff.

## Decisions

### Reconcile the destination without a detach gap

The realm swap will use the already attached game sprite layer whenever its
existing atlas can render the destination frames. If the destination visual
cache reports a different atlas, the implementation will prepare the
replacement resource before the covered boundary is opened and keep a valid
attached presentation surface during the exchange. The implementation must
not perform a remove-then-add sequence after the mask begins opening.

The alternative of accepting the existing `rebuildLayer` path was rejected
because it allows an empty renderer interval even though the DOM mask is
opaque only until the next transition phase callback. A second overlay or
crossfade was rejected because the existing game-layer mask already defines
the required ownership and visual contract.

### Make readiness an explicit midpoint condition

The covered callback will not hand control back to the transition system until
the destination world has completed its synchronous submission and one
destination presentation has been issued. Any scheduled presentation caused
by world rendering will be canceled or coalesced so it cannot race the
covered-to-opening update.

### Test the ordering at the renderer seam

Focused tests will instrument the sprite-layer add/remove operations and
presentation calls around a realm swap. They will assert that the destination
presentation occurs while coverage is active and that no renderer detach is
observed between the covered callback and the first destination presentation.
Existing transition-system timing tests remain the authority for phase timing;
the new integration assertions cover the previously untested renderer gap.

## Risks / Trade-offs

- [Risk] A destination atlas may require resource preparation that is more
  expensive than the covered hold. -> Keep the mask fully covered until the
  synchronous destination submission is complete; do not reveal partially
  prepared content.
- [Risk] Reusing slots may leave stale cells visible when the destination view
  is smaller or fog-hidden. -> Explicitly reconcile every prior slot as hidden
  before submitting the destination composition, then verify the visible slot
  set in focused tests.
- [Risk] Renderer instrumentation may not model every WebGPU browser timing.
  -> Pair the deterministic seam test with manual browser checks in both realm
  directions and through Settings.

## Migration Plan

1. Add the focused renderer-handoff test seam and reproduce the current detach
   ordering.
2. Adjust the game-layer midpoint path to preserve attachment and present the
   destination before opening.
3. Run the focused Node tests, the repository test command, and production
   build; then manually verify the actual playable project-root URL.
4. If the change is rolled back, restore the prior covered swap behavior; no
   persisted-data migration is required.
