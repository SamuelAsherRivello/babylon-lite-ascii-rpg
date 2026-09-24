# Design

## Context

The existing Overworld generation creates standalone level objects first, then creates variable-sized houses with walls, doors, keys, and reserved footprints. The object spawner already owns chest state, rewards, interaction, and events. See [proposal.md](proposal.md) and the capability deltas for the required behavior.

## Goals / Non-Goals

**Goals:**

- Keep chest behavior owned by the existing object-spawner system.
- Let house generation choose and reserve one valid interior corner before registering the house chest.
- Preserve deterministic seeded generation for runtime and procedural preview.
- Keep standalone chest density and placement semantics independent.

**Non-Goals:**

- No new object type, reward table, UI setting, save migration, or dependency.
- No changes to house size probabilities, door/key mechanics, or Underground generation.
- No requirement to alter the standalone chest count to compensate for house chests.

## Decisions

### Select from four inward corner cells

Derive the candidates from the selected house footprint: top-left, top-right, bottom-left, and bottom-right, each one cell inward from both walls. Choose one with the house placement random stream after the house candidate is otherwise valid.

Alternative: place a chest anywhere in the interior. Rejected because the requested behavior is a recognizable corner placement and corner candidates remain stable across house sizes.

### Treat the house chest as part of house acceptance

House placement validation will include the selected chest cell and its reservation. If no valid corner is available, the house is rejected before its walls, door, key, or chest are committed.

Alternative: generate the house first and fall back to a nearby interior cell. Rejected because it could violate the explicit corner requirement and create partial generation results.

### Reuse the existing chest object contract

The integration will call the existing object-spawner creation path with `type: "chest"`, the catalog definition, the house chest cell, the Overworld realm, and the house identifier. No parallel interaction logic will be introduced.

Alternative: add a house-specific chest interaction branch. Rejected because it would duplicate reward, event, and open-state behavior.

### Preserve separate generation streams

Standalone chest placement retains its existing feature and seed namespace. House chest selection uses the house-generation stream, so adding house chests does not perturb standalone chest density or require a new setting.

## Risks / Trade-offs

- [Small houses have fewer interior cells and can have corner candidates that coincide with other reservations] -> Validate all four candidates and reject only when no valid corner remains; never place outside the house.
- [Adding house chest random draws can alter later house positions for existing seeds] -> Define the draw order in focused deterministic tests and keep standalone object random streams independent.
- [A chest glyph could be hidden by the house overlay while outside] -> Preserve normal object-layer precedence and verify the chest becomes visible and interactive when the player enters the house.

## Migration Plan

1. Extend house placement data and validation with four corner candidates and one selected chest cell.
2. Register each selected chest through the existing object-spawner path during Overworld house generation.
3. Update runtime and procedural preview generation to represent house chest occupancy consistently.
4. Add focused deterministic, reservation, interaction, and additive-count tests; run the full Node suite and production build.

Rollback is code-only: remove the house-chest placement and registration while leaving standalone chest generation and existing house generation intact.
