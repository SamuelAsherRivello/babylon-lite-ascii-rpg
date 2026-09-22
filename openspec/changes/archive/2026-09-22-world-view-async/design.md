# Design

## Context

The shared world-view module currently exposes `createWorldViewComposition`,
`collectWorldViewGlyphs`, and `renderWorldViewComposition`. The render helper
draws background, every cell, and overlay synchronously. `renderMapview` uses
that helper with a full-realm source rectangle, so a large diagnostic map can
monopolize the browser event loop until the pass completes.

The client already uses browser frame scheduling for movement coalescing and a
`sliceMs` checkpoint pattern during world generation. This change can follow
those local timing patterns without adding dependencies or changing React HUD
boundaries.

## Goals / Non-Goals

**Goals:**

- Add a reusable cooperative world-view render path that can be adopted by any
  world-view caller later.
- Apply the cooperative path only to the fullscreen developer map window now.
- Preserve the completed map's visual result, marker order, diagnostic fog
  bypass, lighting factor, and cleanup behavior.
- Prevent stale render work from drawing after close, realm toggle, resize, or
  game-layer disposal.

**Non-Goals:**

- Do not change the normal game view or minimap to cooperative rendering in
  this change.
- Do not move rendering to a Web Worker or OffscreenCanvas.
- Do not change world generation, fog discovery, map markers, or glyph cache
  semantics.
- Do not add a visible progress meter or new user setting.

## Decisions

- Add an opt-in cooperative helper beside the synchronous renderer in
  `world-view.js`. It should accept the same draw callbacks plus scheduling and
  budget options, then process `composition.cells` in order while yielding when
  the budget expires. The existing `renderWorldViewComposition` remains the
  compatibility path for current callers.

- Preserve pass order by treating cooperative rendering as one logical render
  job: draw background once, draw cells incrementally, then draw overlay only
  after all cells complete. This avoids diagnostic markers appearing over a
  partially drawn or stale world.

- Use a caller-owned cancellation token or monotonically increasing job id for
  map-window renders. Every scheduled batch checks the token before drawing, and
  `renderMapview` cancels the current job before starting a replacement.
  Alternatives considered: relying only on `cancelAnimationFrame`, which is not
  sufficient once a batch is already running; clearing the canvas on every
  batch, which would create visual flashing and repeat completed work.

- Batch by elapsed time rather than a fixed row count. Row-major traversal still
  creates the upper-left to lower-right fill the user described, while a small
  time budget adapts to device speed, cell size, and cache warmup cost.

- Keep map-view glyph warmup before the cooperative cell loop for predictable
  raster availability, but measure during implementation whether that warmup is
  itself a meaningful stall. If warmup is too expensive, split glyph raster
  creation into the same cooperative job before cell drawing without changing
  the public behavior.

## Risks / Trade-offs

- First visual content may appear before all markers are available -> render
  markers only after all world cells complete.
- Glyph warmup may still take noticeable time before progressive drawing begins
  -> instrument or log local timings during implementation and, if needed,
  include warmup in the cooperative job.
- Cancellation bugs could draw stale realm content after a toggle or close ->
  use a job id/token checked before every scheduled batch and before overlay.
- Very small budgets may stretch total render time too far -> choose a default
  budget that protects input responsiveness while completing quickly on desktop,
  then verify manually in the browser.

## Migration Plan

Implement the cooperative helper as an additive API and migrate only
`renderMapview` to call it. Existing game-view and minimap callers continue
using the synchronous path, so rollback is simply returning `renderMapview` to
the synchronous helper and removing the unused cooperative helper.
