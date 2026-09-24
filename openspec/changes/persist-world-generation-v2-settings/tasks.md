# Tasks

## 1. Persistence contract

- [x] 1.1 Define and centralize V2 environment detection for generation-settings reads and writes, and verify V2/non-V2 branches with focused store tests
- [x] 1.2 Update the local JSON validation and serialization contract to retain every pass's enabled state and Low, Med, or High density, and verify invalid or incomplete payloads normalize safely
- [x] 1.3 Ensure V2 startup reads the JSON profile before world generation and never reads or writes this profile through browser local storage, verified by focused tests

## 2. World Generation confirmation flow

- [x] 2.1 Preserve in-memory draft updates for enabled/disabled and density controls, and verify preview changes do not write before Confirm
- [x] 2.2 Persist the complete normalized V2 profile only after Confirm, regenerate from the confirmed profile, and verify write failures do not publish an unpersisted profile
- [x] 2.3 Verify Cancel and close discard both enabled-state and density changes without changing the JSON file or reopening state
- [x] 2.4 Implement Reset so it restores all layers enabled, configurable densities to Med, and World Size to Med without writing until Confirm, verified by focused tests

## 3. Validation

- [x] 3.1 Extend focused generation-settings and server persistence tests for round-trip enabled/density restoration and legacy normalization
- [ ] 3.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root and resolve any regressions
- [ ] 3.3 Manually verify the V2 World Generation window with an explicit `randomSeed`: edit enabled states and Low/Med/High values, confirm, reload, inspect JSON-backed restoration, and confirm no relevant local-storage entry is written
- [x] 3.4 Run `openspec validate persist-world-generation-v2-settings --type change --strict`
