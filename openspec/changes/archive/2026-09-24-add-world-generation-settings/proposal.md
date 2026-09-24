# Proposal

## Why

The Procedural window currently starts at terrain generation and fixes the world dimensions in the game layer, so developers cannot see or choose the world-scale inputs that govern every later pass. Exposing those inputs first makes the resulting world size and fixed two-realm structure explicit before terrain generation begins.

## What Changes

- Rename the selected Procedural tab from `Level Generation` to `World Generation`.
- Add `World Settings` as displayed pass 1, ahead of Ground, and renumber every existing displayed pass/card from 2 through 10 without changing the relative order of later generation features.
- Add a persisted World Size selection with exact per-realm dimensions: Low `128 x 128`, Med `256 x 256`, and High `512 x 512`; Med is the default and preserves the present runtime dimensions.
- Show each World Size dimension as its hover explanation and use the confirmed selection to supply the dimensions for both realms before Ground executes. Draft selections update the settings preview without persisting.
- Show a non-interactive `Realm Count: 2` item in World Settings. The world continues to generate exactly Overground and Underground; realm count is not a configurable setting.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `procedural-generation-settings`: Rename the tab and make World Settings the first persisted, previewable configuration card.
- `procedural-level-generation`: Require selected per-realm dimensions to be supplied before terrain generation.
- `world-generation-passes`: Define World Settings as the first, pre-terrain configuration stage while retaining the existing later pass order.
- `world-realms`: Make the fixed two-realm count visible in World Settings without making realm membership configurable.

## Impact

Affected areas include the React Procedural modal, generation-settings normalization and persistence, settings preview sizing, runtime world-generation inputs, generation-pass metadata, focused Node tests, and the related OpenSpec specifications. No dependency, public service, or realm-count expansion is introduced.
