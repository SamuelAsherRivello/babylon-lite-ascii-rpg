# Proposal

## Why

The selected Dungeons & Pixels art needs a playable visual test before extending the treatment to enemies and NPCs. A focused hero-only slice will let the user judge whether the 32×48 character scale, anchoring, and animation readability work against the existing 16×16 world grid.

## What Changes

- Add the selected `Hero_Warrior` art as a rendered player visual.
- Support right-facing side animations for idle, walking, attacking, and death.
- Use the existing 32×48 source frames at a display scale that preserves detail while keeping the hero footprint on one logical grid cell.
- Keep the hero’s gameplay occupancy and collision at one grid cell.
- Leave enemy, NPC, and minimap character rendering unchanged in this test.
- Keep the death pose visible and non-interactive after health reaches zero.

## Capabilities

### New Capabilities

- `hero-sprite-animation-test`: Render and exercise the selected hero sprite animation states in the game view.

### Modified Capabilities

- `world-view-rendering`: Change the player visual from glyph-only rendering to an anchored animated sprite for this test.

## Impact

- Affected Babylon Lite player rendering, animation state selection, health/death presentation, and asset loading under `ascii-rpg/public/assets/images/Dungeons-and-Pixels-v1.4/Characters/Hero_Warrior`.
- No new dependency or Tiled runtime loader is required.
- Existing movement, combat, occupancy, lighting, fog, and glyph-based enemy/NPC rendering remain in scope only where needed to drive the hero preview.
