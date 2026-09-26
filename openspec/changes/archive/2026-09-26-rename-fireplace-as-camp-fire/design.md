# Design

## Context

See [proposal.md](proposal.md). Camp Fires are currently generated as persistent but walkable objects, whose contact effect updates an in-memory checkpoint revision. React observes that revision and emits the checkpoint toast. Existing signs demonstrate cardinal object interaction, and the bridge already supports a modal dialog with an `OK` choice that blocks game input until resolved.

## Goals / Non-Goals

**Goals:**

- Adopt `CampFire` as the one active code/data identity and `Camp Fire` as the one player-facing name.
- Route Camp Fire collision through the existing object interaction and modal dialog bridge while keeping checkpoint state authoritative in the game layer.
- Keep generated placement, color/glyph, determinism, and checkpoint recovery intact.

**Non-Goals:**

- Alter checkpoint persistence, death/restart behavior, Camp Fire distribution counts, or the shared dialog component.
- Rename archived OpenSpec changes or historical documentation.
- Add browser automation or dependencies.

## Decisions

### Model Camp Fires as persistent blocking interactive objects

The catalog's Camp Fire definition will explicitly be non-walkable, and its active object occupancy will remain rendered after contact. The same cardinal collision dispatch used for signs and chests will save the checkpoint and open the dialog before movement completes. This avoids treating the checkpoint as a terrain rewrite and preserves the existing object-layer ownership.

Making the Camp Fire walkable and opening a dialog after entry was rejected because the requested interaction is a blocking object with sign-style walk-in contact.

### Reuse the modal dialog bridge and remove only the checkpoint toast consumer

The game layer will retain a session-local set of reached Camp Fire identities. The first cardinal bump into a given Camp Fire saves/replaces the checkpoint and publishes a modal, single-choice `Camp Fire` dialog whose text is `You saved a checkpoint.`. A later bump into that same Camp Fire leaves the checkpoint unchanged and publishes the same required-acknowledgement dialog with `You already saved this checkpoint.`. The checkpoint snapshot remains necessary for restart availability, but the React effect that turns a checkpoint revision into a toast will be removed.

Adding a second notification channel was rejected because the dialog contract and bridge already support acknowledgement without exposing game state to React.

### Perform a scoped active-code rename

Rename catalog types, pass identifiers, seed namespaces, object ids, constants, runtime variables, preview markers, descriptions, and focused tests to the `CampFire` code identity, while translating all player-visible copy to `Camp Fire`. The implementation will retain no compatibility aliases because these are client-only generated world records and no saved object state exists across refreshes.

Retaining `fireplace` in machine identifiers was rejected because it conflicts with the explicit code-naming request.

## Risks / Trade-offs

- [Broad rename misses a generation or preview path] -> Search active source and focused tests for the legacy spelling, then prove the same seeded Camp Fire placement in runtime and preview paths.
- [A collision saves a Camp Fire twice or shows the wrong message] -> Cover first and repeat cardinal bumps with focused tests and manually confirm both blocking OK dialogs.
- [Modal input lock lingers after acknowledgement] -> Exercise `OK` and verify normal movement resumes with no time/stamina mutation from the blocked bump.

## Migration Plan

1. Update the active code/data and user-facing terminology together with the Camp Fire collision and dialog behavior.
2. Run focused Node tests and the repository build; manually verify a seeded Underground Camp Fire interaction with an explicit `randomSeed` URL parameter.
3. Roll back by reverting this change's scoped implementation if a regression is found; no persisted migration or cleanup is required.
