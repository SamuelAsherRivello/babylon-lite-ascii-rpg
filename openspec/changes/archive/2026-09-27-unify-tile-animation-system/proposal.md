# Proposal

## Why

The game currently renders static PNGs, sprite strips, sheet frames, and frame-file sequences through separate presentation paths with independently implemented clocks. A shared Tile / AnimatedTile model will make any approved PNG source renderable through the correct renderer while giving each animation an explicit loop and time-domain contract.

## What Changes

- Add one presentation-only tile asset model with `Tile` for one source rectangle and `AnimatedTile` for an ordered frame sequence.
- Require every animated presentation to explicitly declare whether it loops and whether its frame selection uses `realTime` or integer world `tickTime`.
- Add shared frame resolution and clock adapters, then migrate the current terrain, prop, actor, and particle PNG animation paths without changing their gameplay ownership, coordinates, collision, fog, or layering responsibilities.
- Keep the default/current continuous visuals on `realTime`: water, gold coins, torches, traps, hero states, spider states, particles, health bars, floating text, realm masks, and UI transitions. Reserve `tickTime` for explicitly configured deterministic, turn-stepped animation; the initial migration introduces the capability but does not silently change an existing animation to ticks.
- **BREAKING** Internal presentation constructors and callers that presently pass bespoke frame counts, elapsed-time calculations, or source-path assembly will move to the shared Tile / AnimatedTile contracts. No user-facing setting, saved data, or gameplay rule changes.

## Capabilities

### New Capabilities

- `tile-animation-presentation`: Defines reusable static and animated PNG tile presentation, explicit loop and timing semantics, renderer adapters, and the migration contract for current animations.

### Modified Capabilities

- None.

## Impact

- Affected game-layer presentation modules include terrain art, Torch and Trap overlays, hero and Spider overlays, particles, health/floating-text presentation, realm transitions, and React notification/status motion.
- The world-time system supplies integer ticks but remains the authoritative producer; this change must not add timers, ticks, or simulation mutation.
- No new runtime dependency, renderer replacement, asset download, persistence, or public network behavior is introduced.
- Verification will use focused Node tests, `npm.cmd test`, `npm.cmd run build`, strict OpenSpec validation, and manual fixed-seed browser inspection; no Playwright files are added.
