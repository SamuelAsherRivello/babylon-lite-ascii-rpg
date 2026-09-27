# Proposal

## Why

Replacing authored world art currently requires rediscovering every connection
between an existing concept, its generated instances, and its Procedural
preview. That led to legacy heart glyphs appearing where the replacement Health
potion should have rendered.

## What Changes

- Add a global Codex skill named `rpg-update-artwork` for replacing artwork of an
  existing game concept from a supplied raster file or asset directory.
- Define a static-sprite route and an animated-strip route, including stateful
  art such as open and closed chests.
- Require the actual game and the matching Procedural generation layer to use
  supplied artwork, without rendering a legacy glyph or internal renderer key.
- Preserve the concept's gameplay semantics, seeded placement, density setting,
  and deliberately separate HUD representation unless the user asks to change
  them.

## Capabilities

### New Capabilities

None. This is reusable Codex instruction/tooling documentation, not a change
to the game's specified runtime behavior; `skip_specs: true` records that
scope.

### Modified Capabilities

None.

## Impact

- Adds global user-skill files under `C:\\Users\\srive\\.codex\\skills\\rpg-update-artwork\\`.
- No game source, project dependencies, public API, persistence format, or
  existing OpenSpec runtime specification changes.
- The skill directs future artwork changes to use focused Node tests, a build,
  and fixed-seed manual browser verification; it does not create Playwright
  tests by default.
