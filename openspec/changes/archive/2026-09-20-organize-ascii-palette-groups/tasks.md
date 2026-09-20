# Tasks

## 1. Semantic group model

- [x] 1.1 Replace the current digit/letter/punctuation Group-sort classifier with ordered semantic group descriptors, including the agreed border, terrain, arrows, cards, weather, Greek, runes, dice, chess, Maps, and Status families; verify focused bridge-layer tests assert every agreed special glyph is assigned to its required group.
- [x] 1.2 Preserve Index and Alphabetical sorting and palette entry identity, color, alpha, and persistence behavior; verify the existing palette serialization and ordering tests pass.

## 2. Group view presentation

- [x] 2.1 Replace the zero-height Group-sort spacer with one full-width, accessible Palette Group Header before each visible group, and implement its 10pt visual style; verify source-level UI tests cover the header markup and stylesheet treatment.
- [x] 2.2 Keep headers exclusive to Group sorting and suppress empty groups after filters; verify focused tests cover Group, Index, Alphabetical, and filtered Group behavior.

## 3. Validation

- [x] 3.1 Run `npm.cmd test` from the repository root and verify all existing Node tests pass.
- [x] 3.2 Run `npm.cmd run build` from the repository root and verify the production Vite build completes successfully.
