# Tasks

## 1. House chest placement model

- [x] 1.1 Add four size-aware inward corner candidates to the house placement model and verify focused building tests identify only valid interior corner cells.
- [x] 1.2 Extend house candidate validation and reservations to require one available corner chest cell and verify blocked, occupied, and all-corners-unavailable candidates are rejected without partial buildings.
- [x] 1.3 Select the house chest corner from the seeded house-generation stream and verify identical seeds reproduce house origins, sizes, keys, and chest cells.

## 2. Runtime object integration

- [x] 2.1 Register one selected chest per accepted Overworld house through the existing object-spawner catalog path with house ownership and verify the resulting realm object list contains exactly one house chest per building.
- [x] 2.2 Preserve standalone chest generation and its configured density while adding house chests, and verify additive counts and independent seeded placement with focused world-generation tests.
- [x] 2.3 Verify house chests use normal glyph, opening, reward, logging, event, quest, and opened-state behavior through focused object-spawner interaction tests.

## 3. Preview and rendering integration

- [x] 3.1 Update procedural Overworld preview generation to include the same deterministic house chest markers and verify preview/runtime house chest origins match for equivalent seeds and reservations.
- [x] 3.2 Verify house overlay, object-layer precedence, player entry/reveal behavior, and chest visibility/interactivity for each supported house size with focused rendering or generation tests.

## 4. Validation

- [x] 4.1 Run focused building, object-spawner, world-generation, preview, and interaction tests and verify all pass.
- [x] 4.2 Run `npm.cmd test` from the repository root and verify the complete Node suite passes.
- [x] 4.3 Run `npm.cmd run build` from the repository root and verify the production build succeeds.
