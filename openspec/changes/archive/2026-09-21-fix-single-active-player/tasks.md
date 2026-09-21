# Tasks

## 1. Normalize the active player marker

- [x] 1.1 Add or refine the Babylon Lite world-layer helper that restores every stale `PLAYER_GLYPH` overlay in a realm to its underlying stair, torch, object, pickup, or terrain glyph, and verify its focused world-system test passes
- [x] 1.2 Invoke player-marker normalization during startup and destination realm activation before placing the authoritative arrival player, then verify the existing player movement and realm-transition paths still use that marker position

## 2. Add regression coverage

- [x] 2.1 Add focused tests for a generated realm containing a start-cell marker plus a non-start arrival cell, and verify normalization leaves exactly one player glyph at the arrival cell
- [x] 2.2 Add realm lifecycle regression coverage for Underground-to-Overground, Overground-to-Underground, and repeated transfers, verifying exactly one rendered player marker remains at the controllable player position after each activation

## 3. Verify the scoped fix

- [x] 3.1 Run the focused world-system and realm/player tests and verify all single-player assertions pass
- [x] 3.2 Run `npm.cmd test`, `npm.cmd run build`, `git diff --check`, and `openspec validate "fix-single-active-player" --strict`; verify failures, if any, are reported separately from this change
