# Tasks

## 1. Aspect-correct rendering

- [ ] 1.1 Replace independent minimap cell width/height scaling with a uniform fit and centered letterbox offsets; verify landscape and portrait renderer tests preserve proportions.
- [ ] 1.2 Keep zoom 1/5/10 player-centered composition and marker placement correct inside the fitted map rectangle; verify canvas bounds remain unchanged.

## 2. Fog setting integration

- [ ] 2.1 Add persisted `Fog (Checkbox)` UI state with enabled default, refresh restoration, and Reset Settings cleanup; verify UI/settings tests.
- [ ] 2.2 Add bridge and game-layer fog-display snapshots/setter; verify toggling redraws only minimap presentation and does not mutate discovery state.
- [ ] 2.3 Apply fog visibility to world glyphs, background suppression, and markers while preserving background → glyph → marker order; verify enabled and disabled minimap scenarios.

## 3. Validation

- [ ] 3.1 Run focused minimap, bridge, and UI tests plus the full Node suite and production build; record results.
- [ ] 3.2 Manually inspect the minimap in landscape and portrait aspect modes with fog enabled and disabled, including refresh persistence; do not create or run Playwright tests.
