# Tasks

## 1. Lighting calculation

- [x] 1.1 Add a pure palette/grid lighting module with bounded ambient, source
  profile, radius, maximum, and falloff settings.
- [x] 1.2 Implement circular Euclidean distance, monotonic falloff, bounded
  overlap combination, and wall-independent behavior.
- [x] 1.3 Add unit tests for source distance, radius boundaries, overlap,
  configuration rejection, and deterministic results.

## 2. Palette modulation

- [x] 2.1 Add a pure helper that applies a cell lighting factor to base palette
  color and client-owned opacity without mutating the palette.
- [x] 2.2 Remove the Ascii Palette alpha control while retaining color editing,
  and update palette tests for client-owned opacity.
- [x] 2.3 Add tests proving ambient and lit values are bounded, hue-preserving,
  and transient.

## 3. Babylon Lite integration

- [x] 3.1 Apply the lighting factor to `renderCell` using the current world
  cell and stable `world.torches` positions.
- [x] 3.2 Include lighting inputs in visible sprite dirty-state comparisons and
  keep full-region and changed-cell rendering paths consistent.
- [x] 3.3 Recompute visible lighting on movement, resize, zoom, palette update,
  and initial world render without adding a Babylon light dependency.
- [x] 3.4 Add authoritative level ambient state with default `0.5`, bounds
  `0..1`, `0.05` adjustment steps, and source blending that makes sources
  inert at ambient `1`.
- [x] 3.5 Add independent torch and player source profiles with exact states
  `Off`, `Low`, `Med`, and `High`, and route their controls through the narrow
  bridge.
- [x] 3.6 Add the ambient control immediately above Zoom with the displayed
  form `Light Ambient + 0.5 -`, including endpoint clamping and rerender.

## 4. Verification and documentation

- [x] 4.1 Run focused tests, the full Node test suite, and the production build.
- [x] 4.2 Manually inspect zoom-5 browser output for circular torch fields,
  wall illumination without shadows, and stable torch positions after resize
  and zoom.
- [x] 4.3 Verify the ambient and source controls in the browser at zoom 5,
  including both endpoint behaviors and independent source cycling.
- [x] 4.4 Record the ambient range, source states, tuning values, and
  shadowless limitation in the completed change artifacts.
