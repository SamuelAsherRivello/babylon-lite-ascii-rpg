# Design

## Context

See [proposal.md](proposal.md). Doors presently carry a glyph and open flag,
while supplied static-door art is selected during world-view rendering. Keys
are also represented as glyphs in the Babylon Lite view, the procedural
settings-map preview, and the React character panel.

## Goals / Non-Goals

**Goals:**

- Give every Door an explicit `locked`, `closed`, or `open` state while keeping
  orientation independent of state.
- Compose a locked Door from two independent graphics: its closed Door art and
  the supplied gold-padlock art.
- Reuse one gold-key asset selection across live canvas rendering, preview
  canvas rendering, and the HUD.
- Preserve deterministic seeded placement and the existing key-count bridge.

**Non-Goals:**

- Generate or add gameplay that transitions a Door into `closed`.
- Add a separate lock item, new inventory type, animation, or dependency.
- Change Door placement density, Home dimensions, or input controls.

## Decisions

### Model state separately from art selection

Doors will retain orientation (`horizontal`, `vertical`, or Home/front) and
receive an explicit state field. Rendering derives the appropriate Door image
from both fields. This avoids treating a generic closed glyph as both a locked
and future closed state. Retaining only the existing boolean was rejected
because it cannot represent all three required states.

### Generate locked Doors only

The fence and Home generation paths will assign `locked`; interaction changes
that state directly to `open` after one key is spent. `closed` stays available
to future content but has no generator or player action in this change. This
matches the requested present gameplay without creating an unused transition.

### Use image composition for lock and key presentation

The static-item rendering layer will rasterize the Door and gold padlock as
separate layers, bottom-aligning the Door and positioning the padlock visibly on
top. The same composition contract will be used by the settings preview; the
HUD will use the gold key as its resource icon. Baking a lock into duplicate
Door images was rejected because it would duplicate orientation/state assets
and prevent a separate padlock-on-door graphic.

### Keep logical glyph and palette compatibility

Object identity, collision, existing logs, palette validation, and inventory
counts remain logical values. Art selection is presentation metadata, so it
does not modify seeded placement, quest events, or the bridge snapshot.

## Risks / Trade-offs

- [Risk] Asset dimensions can cause an overlay to obscure the Door → Mitigation:
  define shared source and destination bounds, then visually verify each Door
  orientation at normal and zoomed views.
- [Risk] Canvas, preview, and React choose different asset paths → Mitigation:
  centralize the gold-key asset identifier and add surface-specific tests.
- [Risk] Existing code assumes `open` is the complete state model → Mitigation:
  update collision, lighting invalidation, and rendering consumers together
  and cover locked, closed, and open states with focused tests.

## Migration Plan

1. Convert generated Door records to `locked` while retaining compatibility for
   any legacy record that only supplies `open`.
2. Deliver focused state, rendering, preview, and HUD checks, then manually
   verify a fixed `randomSeed` world in both realms.
3. Roll back by restoring legacy state-to-glyph mapping; no persisted schema or
   external data migration is required.
