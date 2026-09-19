# Design

## Context

The React UI owns Settings controls and communicates with the Babylon Lite
game layer through the existing bridge. The game layer currently computes a
logical viewport from browser dimensions and renders one sprite per visible
grid cell. See `proposal.md` and the delta specs for the user-visible
contract.

## Goals / Non-Goals

**Goals:**

- Keep zoom state in React while keeping world state authoritative in Babylon
  Lite.
- Change cell density without replacing the generated level or player state.
- Keep sprite-layer capacity sufficient for the most zoomed-out viewport.
- Render a fixed viewport window that never indexes beyond the fixed world.

**Non-Goals:**

- A camera that follows the player during movement.
- Smooth or continuous zoom between integer values.
- Persistent zoom preferences across reloads.
- A new rendering dependency or a second gameplay path.

## Decisions

- Use integer zoom values `1` through `10`, with `5` as the baseline. Cell
  dimensions scale by `zoom / 5`, preserving the existing `32 x 32` baseline.
  This gives direct, predictable density changes and keeps `upscale` as a
  separate logical-output setting.
- Send zoom changes through a narrow `setZoom` bridge command. React does not
  access world cells, sprites, or renderer internals.
- Generate a fixed `512 x 512` level at startup. This is larger than the
  default visible window and avoids regenerating terrain on zoom or resize.
- Keep a clamped fixed view origin. The origin is initially placed near the
  starting cell and does not change during movement. On zoom, first center the
  origin on the current player, then clamp it to valid world coordinates; this
  prioritizes player visibility and world bounds over orientation.
- Rebuild the sprite layer when viewport capacity changes, then redraw the
  visible world cells. This avoids exceeding the layer allocation at zoom `1`.
- Keep the existing world-generation border rule as the authoritative escape
  prevention: the outermost row and column are `W` and movement rejects both
  non-walkable cells and out-of-range coordinates.

## Risks / Trade-offs

- [Risk] A `512 x 512` procedural level costs more startup work and memory
  than a viewport-sized level. → [Mitigation] Generate it once per game start,
  retain the existing seed, and render only the visible window.
- [Risk] Without a following camera, the player can disappear from view. →
  [Mitigation] Keep the initial view near the start and make the fixed-camera
  behavior explicit in the requirements; a following camera remains a future
  change.
- [Risk] Very large displays could show the full fixed world at zoom `1`. →
  [Mitigation] Clamp viewport iteration to world dimensions and never render
  out-of-range cells.
