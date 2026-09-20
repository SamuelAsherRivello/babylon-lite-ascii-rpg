# Tasks

## 1. Renderer behavior

- [x] 1.1 Gate the origin marker on exact-cell discovery and exact world-gridspot placement in the minimap marker collector; verify fogged origin cells produce no marker and discovered origin markers align with their glyph
- [x] 1.2 Gate the player marker on exact-cell discovery and exact world-gridspot placement in the minimap marker collector; verify the discovered yellow marker overlays the player `P` glyph

## 2. Regression coverage

- [x] 2.1 Update minimap renderer unit tests to cover hidden origin/player cells, partial coarse-area discovery, and marker appearance after exact discovery
- [x] 2.2 Run the focused minimap renderer tests and the repository's documented build/check command, verifying existing marker depth and torch-discovery behavior remains green
- [x] 2.3 Use a fixed `fogUnclearRadius` of 20 gridspots with line-of-sight discovery and verify the radius and wall-blocking regression tests pass
