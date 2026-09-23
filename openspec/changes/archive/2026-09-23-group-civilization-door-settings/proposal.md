# Proposal

## Why

Civilization is currently represented as a single density control even though its first player-facing feature is doors. Grouping its controls like Object & NPC Distribution makes the settings hierarchy consistent and leaves room for additional civilization feature controls without redefining the pass card later.

The Underworld settings-map preview must make the door, rather than a key, the primary recognizable Civilization marker while still showing the two keys that make each generated door solvable.

## What Changes

- Change Level Generation layer 8, `Civilization`, from a single control into a grouped layer that follows the Layer 7 row layout.
- Add the initial `Doors` sublayer with Low, Med, and High density/distribution choices; migrate the existing Civilization placement profile and persisted selection to this Doors control.
- Preserve deterministic Underground-only civilization generation and the existing rule that each accepted door group contains exactly two keys, one valid key placement on each side of the door.
- Render the closed-door glyph as the Civilization map-preview icon/primary marker, while retaining the two associated key markers in every previewed door group.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `procedural-generation-settings`: Change the ordered settings catalog so layer 8 is a grouped Civilization control with an independently selectable Doors row.
- `underground-civilization`: Define the Doors distribution profile and the door-led settings-map preview representation without changing the two-key solvability requirement.

## Impact

- Affected files will include the bundled generation-settings catalog, settings normalization/profile resolution, the React Procedural window, the game-layer preview marker construction, and their existing Node tests.
- Existing persisted `civilization` density selections require a compatibility migration to the new Doors setting key; no new dependencies or external APIs are needed.
