# Proposal

## Why

The Underground checkpoint object currently permits movement onto its cell and confirms every save with a transient toast, making it easy to miss and inconsistent with other blocking world interactions. It also exposes the legacy `Fireplace` name throughout code and the Procedural UI instead of the requested Camp Fire terminology.

## What Changes

- Rename the active Fireplace object identity to `CampFire` in code and data, and present it as `Camp Fire` in all player-facing labels, descriptions, and dialog text.
- Make each Camp Fire cell non-walkable; a cardinal bump keeps the player adjacent.
- On a Camp Fire bump, save/replace the session checkpoint and open the existing dialog surface with a required `OK` acknowledgement. Remove the checkpoint-saved toast path.
- Preserve Camp Fire placement scope, density behavior, seeded determinism, glyph, and checkpoint restart semantics.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `object-spawner-system`: Define the Camp Fire catalog identity and its persistent, blocking checkpoint interaction.
- `player-grid-movement`: Define cardinal Camp Fire collision as a non-movement interaction with required acknowledgement.
- `procedural-generation-settings`: Rename the Camp Fire procedural control and its player-facing density descriptions.

## Impact

Affected systems include the JSON object/generation catalogs, procedural registry and preview markers, Babylon Lite object placement and collision dispatch, checkpoint-to-UI feedback, and focused object/movement/settings tests. No dependencies, persistence format changes, or archived history rewrites are planned.
