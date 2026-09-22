# Design

## Context

See proposal.md for motivation. The application already has a React modal pattern for Gameplay Settings, an ordered realm-generation pipeline, and Vite development middleware that atomically persists editable JSON data. The Babylon Lite layer owns world generation; React only owns the selected settings and UI.

## Goals / Non-Goals

**Goals:**

- Keep `Med` exactly aligned with each current generation default.
- Let developers evaluate draft selections against a deterministic preview before making them durable.
- Keep selected values explicit at the narrow React-to-game startup boundary.

**Non-Goals:**

- Runtime replacement of the active playable world without restarting it.
- Changing pass order, terrain-layer ownership, or publishing the local write endpoint.
- Adding a remote configuration service or dependency.

## Decisions

### Ordered data catalog

Store pass identity, title, order, and selected density in one settings document. This makes the UI order and persisted identity stable. The catalog records individual Heart, Trap, and Torch profiles, while their controls are grouped in one Object Distribution card. Player Position records its fixed `Med` baseline without exposing a density control.

### Med is the compatibility profile

Define explicit Low/Med/High mappings beside the settings store; Med maps to the current cave fill, water chance, per-object count, civilization chance, spawner limit, and walkability behavior. Low and High alter only the parameter owned by the corresponding pass. Player Position retains the centered baseline.

### Persistence mirrors existing editable data

During Vite development, load and atomically write the settings document through a local-only middleware endpoint. In deployed builds, use local storage. This matches existing palette/font behavior and avoids exposing file access from the browser. A production write endpoint was rejected because static Pages hosting cannot safely provide it.

### Draft, preview, and confirmation

The React modal owns a complete draft catalog initialized from the saved catalog on open. Density choices modify only that draft. Its left half contains the independently scrollable cards and one persistent action-row parent: Confirm/Cancel align at its left and an Overworld/Underworld toggle aligns at its right; its right half hosts a `settings-map-view` canvas. A narrow bridge invokes the Babylon Lite layer to generate and render exactly the selected deterministic, noninteractive preview realm from each draft or realm-toggle change. Reusing the game layer's generation/profile resolution preserves parity with the playable map while avoiding mutation of active world, quest, fog, and entity state.

`Confirm` atomically persists the complete validated draft catalog and then reloads the game to construct both playable realms. `Cancel` and closing the modal discard the draft without writes. Immediate persistence was rejected because it prevents comparison of alternatives and cannot support cancel semantics.

## Risks / Trade-offs

- [Changing density can make valid terrain harder to find] -> Keep existing bounded regeneration attempts and clamp profiles to safe parameter ranges.
- [High spawner limits may be constrained by viable regions] -> Preserve placement exclusions and treat the profile as an upper bound.
- [A selection restarts player progress] -> State this in the developer-facing behavior; the restart makes experimental results unambiguous.
- [Preview generation can overlap rapid selections] -> identify each preview request and render only its newest completed result.

## Migration Plan

1. Ship the catalog with all passes at `Med`.
2. Treat missing, malformed, or older persisted values as `Med` per pass; initialize an opened modal draft from that normalized catalog.
3. Removing the settings file or browser key returns the game to the current baseline.
