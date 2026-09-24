# Tasks

## 1. Dialog contract and bridge

- [x] 1.1 Define the immutable dialog request/result contract with `id`, `isModal`, speaker/text, choices, world anchor, and selected value, and verify focused bridge tests cover open, select, and close flows.
- [x] 1.2 Add game-to-React publication and React-to-game result handling while preserving game-layer ownership of world state, and verify React does not need to inspect NPC or object records.

## 2. React presentation and input

- [x] 2.1 Implement the modal dialog using the existing window system with a dark backdrop, no close button, and gameplay input blocking, and verify the NPC dialog is visibly modal.
- [x] 2.2 Implement the non-modal world overlay with anchor placement that avoids the player and nearest enemy where possible, and verify the Welcome Sign remains readable without pausing movement.
- [x] 2.3 Implement mouse/touch selection, Up/Down highlight navigation, Right acceptance, first-choice default selection, and automatic highlighting for one-choice messages, and verify each control path with focused UI tests.

## 3. World instances and gameplay state

- [x] 3.1 Add the `⚑` palette-backed Welcome Sign catalog entry and civilization-signs generation feature after stairs, and verify every individual stair receives one valid sign within 50 grid units.
- [x] 3.2 Add deterministic stair-associated town-number generation and verify the same seed, realm, stair, and sign identity produce the same displayed town number.
- [x] 3.3 Add cardinal Welcome Sign collision handling that opens a stateless, rereadable floating dialog without consuming or moving the sign, and verify repeated interactions display the message again.
- [x] 3.4 Add the NPC party-recruitment dialog with Yes/No outcomes and runtime recruitment state, and verify No preserves availability while Yes marks the NPC recruited.
- [x] 3.5 Make recruited NPCs passable and non-interactable while preserving the existing occupancy and player-driven tick contracts, and verify movement can pass through the recruited NPC.

## 4. Verification

- [x] 4.1 Add focused Node tests for dialog state transitions, cardinal collision entry, repeatable signs, NPC recruitment, and recruited passability, and verify they pass from the repository root.
- [x] 4.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root and verify no unrelated worktree files are modified.
- [x] 4.3 Manually verify modal NPC interaction and floating Welcome Sign placement in a browser using an explicit `randomSeed`, and record the exact observed behavior for desktop and mobile-sized layouts.
