# Tasks

## 1. Persisted setting and bridge

- [x] 1.1 Add the default-`2` `Player GPU Shadow Bleed Range` click-through setting with values `0/1/2/3/4/6`, and set missing/reset Player Lighting, Player Shadow, and GPU Light Pass preferences to `X High`, `High`, and enabled; verify focused UI tests cover the complete cycle, default restore, and reset semantics.
- [x] 1.2 Add a cached, validated numeric shadow-bleed-range command and align missing-profile bridge defaults with Player Lighting `X High` and Player Shadow `High`; verify focused bridge tests reapply the latest values to a newly registered game controller without exposing renderer data.

## 2. Directional player penumbra

- [x] 2.1 Add read-only lighting helpers that identify the first straight-path unwalkable blocker and count grid steps behind it; verify focused lighting tests cover a clear path, first blocked cell, bounded range, closed corners, and no terrain mutation.
- [x] 2.2 Build a player-only simulated penumbra field from the selected range, player brightness, and falloff; verify focused tests prove direct clear light, rapidly fading in-range penumbra, no player contribution beyond the range at every ambient level, and ambient-only shadow-core visibility above `0`.
- [x] 2.3 Refactor the GPU light presentation to retain separate torch, direct-player, and player-penumbra inputs; bound direct-player and penumbra sprites to eligible cell bounds, and continuously scale the composite by `1 - ambient` without an ambient-value branch; verify focused rendering tests show no unrestricted player blur leak while an unobstructed torch still lights a player-shadowed cell.
- [x] 2.4 Refresh and dispose player penumbra resources on movement, zoom, resize, palette/lighting changes, toggle changes, and game-layer disposal; verify focused runtime/resource tests cover no former-player trail and correct visible-region alignment.

## 3. Integrated validation

- [ ] 3.1 Run `npm.cmd test`, `npm.cmd run build`, and `npx.cmd openspec validate add-player-gpu-shadow-bleed --strict` from the repository root; verify all commands succeed. (Blocked by an unrelated concurrent duplicate `playerShadowStart` declaration in `ascii-rpg/test/main_tests.mjs`.)
- [x] 3.2 Manually verify the live Vite game: a fresh or reset profile displays GPU Light Pass enabled, Player Lighting `X High`, Player Shadow `High`, and shadow-bleed range `2`; at ambient `0`, player light remains full in clear cells, uses only the selected dim bounded fringe behind walls, and has zero player glow beyond the range; above `0`, the hard-shadow core shows only ambient light; at ambient `1`, no lighting setting has a visible result; preserve valid torch light and restore saved choices after reload.
