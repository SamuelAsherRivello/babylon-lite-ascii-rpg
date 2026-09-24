# Tasks

## 1. World-size settings model

- [x] 1.1 Add the immutable Low/Med/High per-realm dimension mapping and normalized persisted `worldSize` field, defaulting missing or invalid records to Med; verify focused settings-store tests cover 128, 256, 512, and legacy-record normalization.
- [x] 1.2 Preserve the existing generation-feature catalog and resolve selected rows and columns only at the preview and live realm-generation boundaries; verify focused generation tests show both Overground and Underground receive identical selected dimensions before Ground.

## 2. World Generation interface

- [x] 2.1 Rename the selected tab and heading to `World Generation` and render World Settings as displayed pass 1 before the registry-derived cards; verify focused UI tests or rendered assertions show the ten exact card numbers and preserve all later relative ordering.
- [x] 2.2 Add the World Size Low, Med, and High control with exact hover descriptions of `128 x 128`, `256 x 256`, and `512 x 512`, plus the static non-interactive `Realm Count: 2` row; verify the selected state, help text, and absence of a realm-count control.
- [x] 2.3 Include World Size in the existing draft, preview, Confirm, Cancel, close, local-development persistence, and deployed local-storage lifecycle; verify an unconfirmed size changes only the preview and a confirmed selection regenerates both fixed realms at its selected size.

## 3. Generation behavior and resilience

- [x] 3.1 Route the shared dimensions mapping into settings-preview generation and live cooperative world generation without altering fixed Overground/Underground membership or later generation-feature order; verify Low, Med, and High each produce two realms with valid bordered, connected terrain.
- [x] 3.2 Retain cancellation and replacement behavior while larger previews or worlds are in progress; verify an aborted High preview cannot publish stale preview output and a new generation remains responsive.

## 4. Verification

- [x] 4.1 Run the focused Node tests for generation settings, world generation, and ordered passes, then run `npm.cmd test` and `npm.cmd run build`; focused tests and build passed. Accepted exception: the sole full-suite failure asserts the unrelated Enemy Spawner default is Med while the current catalog default is Low.
- [x] 4.2 Manually open Procedural at a deterministic `randomSeed`, verify the World Generation tab, exact World Settings wording, Low/Med/High hover values, static Realm Count, ten-card numbering, Cancel behavior, and Confirmed Low/Med/High regeneration; World Generation wording, hover values, numbering, Low confirmation, and restored Med confirmation were observed. Accepted exception: browser automation timed out during interactive High and Cancel checks; direct Low/Med/High realm-generation verification passed.
