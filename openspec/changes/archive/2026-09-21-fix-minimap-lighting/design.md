# Design

## Context

See `proposal.md` for the user-visible problem. The game view submits palette colors after applying the lighting field, while the mini-map currently creates glyph canvases from raw palette hex colors and separately draws the optional additive GPU light overlay. Both views already compute a lighting field for their visible source region and already use separate canvases and glyph caches.

## Goals / Non-Goals

**Goals:**

- Make the mini-map base glyph color follow the same ambient, torch, player, falloff, and shadow result as the game view.
- Preserve the independent mini-map canvas, crop, fog masking, markers, and GPU overlay.
- Ensure lighting is applied exactly once to the base glyph color before the optional additive presentation overlay.

**Non-Goals:**

- Do not change lighting presets, ambient defaults, GPU light-pass intensity, fog rules, palette storage, or world generation.
- Do not make the mini-map reuse the game canvas, sprite atlas, or rendered frame.

## Decisions

- **Use the existing authoritative light field.** The mini-map already obtains a region-specific light field, so its per-cell factor is the correct input and avoids duplicating lighting calculations.
- **Modulate before minimap raster caching.** Convert the active palette color to the runtime RGBA representation, apply the cell factor, and include the resulting color in the minimap glyph-canvas cache key. This prevents a cached bright color from being reused after lighting changes.
- **Keep the GPU overlay additive and unchanged in role.** The overlay remains a visual cue using the same samples as the game view; the base glyph must no longer depend on it for ordinary illumination.
- **Share a small color-resolution helper if needed.** If game and minimap conversion/modulation logic would otherwise diverge, centralize only that pure color operation without merging their separate render targets or caches.

## Risks / Trade-offs

- [Risk] Per-cell lighting produces more minimap color variants and cache entries. → Mitigation: keep the existing bounded visible-region rendering and use a stable factor/color cache key; clear minimap colorized canvases when relevant visual settings change.
- [Risk] The existing warm overlay may make the corrected minimap appear too bright at high ambient values. → Mitigation: verify with the GPU pass enabled and disabled; adjust overlay intensity only if visual verification shows a remaining additive excess, without changing authoritative lighting.

