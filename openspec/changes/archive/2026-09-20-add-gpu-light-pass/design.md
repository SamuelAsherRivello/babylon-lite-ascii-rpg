# Design

## Context

See proposal.md for motivation. The game renders a visible grid through one
Babylon Lite sprite renderer on a WebGPU canvas. Its cached lighting field
already produces per-visible-cell torch and player contributions with
deterministic terrain shadows. React persists settings and sends narrow
snapshots through `game-bridge.js`; Babylon Lite owns the render lifecycle.

The installed `@babylonjs/lite` 1.30.x package exposes GPU sprite layers,
client texture atlases, and additive blending, so the feature can stay within
the existing rendering dependency and WebGPU requirement.

## Goals / Non-Goals

**Goals:**

- Make a default-off, persisted checkbox select a soft warm visual composite.
- Use the existing visible lighting result as the only source of the composite.
- Keep the final effect aligned with the viewport at movement, resize, zoom,
  palette, and lighting-setting updates.
- Allocate, resize, unregister, and dispose GPU work within the game layer.

**Non-Goals:**

- Do not implement radiance cascades, raymarching, color bounce, temporal
  accumulation, real-world physical light transport, or Babylon scene lights.
- Do not change the grid-lighting factor, shadow rule, game simulation, or
  source profile semantics.
- Do not add a WebGL/CPU fallback or a dependency.

## Decisions

### Use the existing light field as an emission mask

The game layer will derive a screen-aligned, low-resolution warm emission mask
from the current visible torch/player contributions. Cells with no source
contribution produce no emitted light; the mask is multiplied by the existing
bounded contribution after terrain shadows. This makes the composite a
presentation of authoritative data, rather than a second lighting model.

Alternative: derive circles only from source positions in a fragment shader.
Rejected because it would duplicate falloff and fail to respect the existing
terrain shadow/bleed rules.

### Add the mask through a GPU sprite layer

When enabled, the game layer creates a separate Babylon Lite `Sprite2DLayer`
after the ASCII glyph layer. A generated radial atlas frame supplies the
pre-blurred source shape; additive blending composites the warm samples over
the glyph scene on the GPU. Layer samples are positioned with the same viewport
cell centers as glyphs, and the layer grows with the visible-region capacity.

Alternative: add a second translucent HTML canvas. Rejected because it would
not be a GPU light pass, risks DOM/canvas alignment drift, and violates the
game-layer ownership boundary.

### Preserve a zero-cost-off path

With the toggle off, the renderer retains the existing direct sprite target
and does not create or execute the light mask/composite work. Toggling on
creates or activates the pass; toggling off releases or disables its temporary
targets and restores direct rendering immediately.

Alternative: allocate and run the pass continuously at zero intensity.
Rejected because a default-off presentation preference must preserve the
current rendering cost and behavior.

### Send one persisted boolean through the existing bridge

`App.jsx` owns the checkbox's local-storage value and initial default. A
`sendGpuLightPassSnapshot(boolean)` bridge command is cached before controller
registration, then applied by a `setGpuLightPass(boolean)` game-layer method.
The game layer alone decides whether and how the render resources exist.

Alternative: expose renderer state to React. Rejected by the established
narrow-bridge architecture.

## Risks / Trade-offs

- [A light layer may be expensive on large displays] -> use one tiny reused
  radial atlas, bounded visible-region capacity, and skip drawing while disabled.
- [Blur can wash out ASCII legibility] -> use a fixed restrained warm tint and
  intensity; the sprite texture remains the foreground layer.
- [Viewport changes can misalign the composite] -> update samples from the
  same visible region and cell centers used to place glyph sprites.
- [Movement can leave stale light] -> rebuild the mask in the same full-region
  refresh path that invalidates player lighting.
- [GPU resource leaks during renderer replacement] -> centralize teardown in
  the game layer's existing dispose/rebuild lifecycle and cover it with a
  focused fake-resource test.

## Migration Plan

1. Ship with no stored preference interpreted as unchecked.
2. Retain the current direct sprite renderer path as the unchecked behavior.
3. Reset Settings clears the preference with the rest of local storage.
4. Roll back by disabling the setting or removing the optional pass; no world
   data or user palette migration is required.
