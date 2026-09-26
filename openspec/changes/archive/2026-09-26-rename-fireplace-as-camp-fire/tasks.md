# Tasks

## 1. Camp Fire identity and generation

- [x] 1.1 Rename every active Fireplace code/data identity, generated-object identifier, pass identifier, seed namespace, preview marker, and focused test fixture to `CampFire`; update player-facing catalog and Procedural text to `Camp Fire`; verify active source and tests contain no legacy Fireplace spelling.
- [x] 1.2 Make the catalog-defined Camp Fire persistent and non-walkable without changing its glyph, Underground scope, seeded placement, density profile, or checkpoint restart behavior; verify focused object-spawner and generation-settings tests.

## 2. Blocking checkpoint acknowledgement

- [x] 2.1 Route cardinal Camp Fire bumps through the existing modal dialog bridge so the first bump at each Camp Fire saves the checkpoint and shows `You saved a checkpoint.` with an `OK` action; verify focused collision/dialog tests.
- [x] 2.2 Track reached Camp Fires for the session so repeat bumps into the same Camp Fire remain blocked, preserve the existing checkpoint, and show `You already saved this checkpoint.` with `OK`; verify focused repeat-interaction tests.
- [x] 2.3 Remove the checkpoint toast subscriber while retaining the checkpoint snapshot for death/restart UI; verify no checkpoint toast is emitted and the dialog closes only after `OK`.

## 3. Verification

- [x] 3.1 Run the relevant Node test files and `npm.cmd run build` from the repository root; verify all checks pass.
- [x] 3.2 Manually verify a seeded Underground Camp Fire with `?randomSeed=camp-fire-checkpoint`: bumping it blocks movement and opens the first-save dialog, clicking `OK` resumes movement, and a later bump shows the already-saved dialog without a toast.
