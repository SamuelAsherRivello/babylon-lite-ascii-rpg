# Design

## Context

See [proposal.md](proposal.md). The current generation-settings record persists an ordered pass catalog, while the game layer supplies fixed `WORLD_ROWS` and `WORLD_COLUMNS` values to `createWorldRealms`. The React modal renders its first six individual cards from the ordered pass collection and hardcodes the later semantic-card numbers. The settings-map preview independently supplies fixed dimensions. The generator already accepts explicit `rows` and `columns` for both named realms.

## Goals / Non-Goals

**Goals:**

- Make world size a normalized, persisted, draftable input used by the settings preview and live two-realm generation.
- Present World Settings as displayed pass 1 and retain the existing generation feature registry exclusively for terrain, placement, and dynamic-feature ownership.
- Preserve `256 x 256` per realm as the default behavior through Med.

**Non-Goals:**

- Do not make realm count, realm names, terrain profiles, or browser viewport dimensions configurable.
- Do not add a third realm, change relative ordering among the existing generation features, or reinterpret World Settings as an enabled/disabled terrain pass.
- Do not alter the current generation-size choices beyond the confirmed 128, 256, and 512 square dimensions.

## Decisions

### Store world size beside, not inside, the generation feature catalog

Add one normalized `worldSize` value to the persisted generation-settings record, with `Med` as the fallback for missing, malformed, or legacy records. Keep the `passes` catalog unchanged as the source of generation-feature order and enablement. This avoids manufacturing a feature declaration for static Realm Count or giving World Settings a density, checkbox, realm scope, or seed namespace it does not own.

The alternative—adding a `world-settings` feature to the registry—would blur the boundary between pre-generation configuration and a pass that creates or claims a world layer.

### Resolve one dimensions mapping at the generation boundary

Export a single immutable World Size mapping from the settings domain: Low to 128, Med to 256, High to 512. Both the preview and runtime shall resolve their `rows` and `columns` from that mapping immediately before calling the existing realm generator. The realm generator remains responsible for creating its two named realms from those explicit dimensions.

This central mapping prevents the preview, persisted selection, and live startup from drifting. Retaining separate hardcoded preview dimensions would make the draft visible at a scale different from the world it represents.

### Render World Settings as its own leading semantic card

Render a World Settings card before the ordered registry-derived cards. It contains a World Size control styled and selected like existing density choices, native tooltip/help text giving exact dimensions, and a static `Realm Count: 2` row. The tab and heading use the exact term `World Generation`. Existing semantic cards receive a displayed-number offset of one; feature-order values and their relative relationships do not change.

### Preserve the existing draft and confirmation lifecycle

World Size participates in the same local draft as pass selections. Draft changes redraw the preview only; Confirm persists the complete normalized record and triggers regeneration; Cancel and close discard the draft. Development persistence and deployed local storage continue to use their existing respective paths. Stored version-1 records migrate additively by receiving `worldSize: Med`.

### Validate the larger generation bounds proportionately

High creates four times the cells of Med in each realm. Focused tests must exercise all mappings and verify both generated realms share the selected dimensions, while the existing cooperative generation/cancellation behavior remains intact. Manual verification should compare all three preview sizes and a confirmed High generation before declaring performance acceptable.

## Risks / Trade-offs

- [High-size generation and preview increase CPU work and memory use] -> Retain cooperative scheduling and verify cancellation, preview replacement, and initial render at each supported size.
- [Legacy persisted settings lack World Size] -> Normalize absent or invalid values to Med without changing existing pass selections.
- [Displayed renumbering drifts from registry feature order] -> Derive displayed numbers from a World Settings offset and cover the ordered card labels in focused tests.
- [Preview and runtime resolve different dimensions] -> Use the same exported mapping at both call sites and test the exact rows and columns supplied to realm generation.

## Migration Plan

1. Add the normalized World Size mapping and backward-compatible settings migration.
2. Update the World Generation UI and its preview draft flow.
3. Route confirmed runtime generation through the resolved dimensions while retaining two fixed realms.
4. Add focused tests, run the repository's standard validation, and manually verify Low, Med, and High selections plus their hover descriptions.
5. Roll back by removing the additive `worldSize` field; legacy settings continue to normalize to Med and the fixed two-realm generator remains intact.
