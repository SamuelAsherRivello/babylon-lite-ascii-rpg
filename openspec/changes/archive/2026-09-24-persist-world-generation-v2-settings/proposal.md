# Proposal

## Why

The World Generation window currently has a split persistence contract: density and diagnostic enablement changes can be represented in the draft, but V2 needs the complete confirmed profile to be the source of truth in a local JSON file. Keeping this page's confirmed settings out of browser local storage makes V2 configuration inspectable, reusable by the app on startup, and consistent across reloads.

## What Changes

- Persist every confirmed World Generation pass state, including enabled/disabled state and Low, Med, or High density, in the V2 local JSON settings file.
- Keep draft edits in memory until `Confirm`; `Cancel` or closing the window must not write the JSON file.
- Make V2 startup load the validated JSON profile before world generation, with normalization for missing or invalid values.
- Ensure this World Generation flow does not write these settings to browser `localStorage` in V2.
- Preserve the existing production/deployed persistence behavior unless explicitly outside V2.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `procedural-generation-settings`: change confirmation and restoration requirements so V2 persists the complete enabled/density profile to local JSON and does not use local storage for this page.

## Impact

- Affects the React generation-settings store and World Generation confirmation flow.
- Affects the Vite V2 persistence endpoint and the checked-in generation settings JSON data contract.
- Requires focused store/endpoint tests, existing Node test coverage, a production build, and strict OpenSpec validation. Live browser verification is deferred because the current browser surface does not expose usable DOM state.
- No new dependency is planned; no renderer or gameplay-layer replacement is required.

## Assumption

- This proposal treats “V2 environment” as the repository's local Vite development/V2 runtime that exposes the local generation-settings JSON endpoint. If V2 is a separate runtime selector, its detection contract must be supplied before implementation.
