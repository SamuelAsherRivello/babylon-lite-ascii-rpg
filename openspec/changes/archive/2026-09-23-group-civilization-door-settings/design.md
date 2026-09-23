# Design

## Context

The Procedural window already renders Object & NPC Distribution as a manual grouped card, while Civilization is rendered as a separate single-control card. The bundled settings catalog, normalization store, generation profile, live realm generation, and the Underworld settings-map preview currently share a single `civilization` density value. See [proposal.md](proposal.md) for motivation.

The preview uses the same deterministic Civilization-group factory as live Underground generation. Each accepted group provides one door and two keys, and preview markers are visual overlays that must not change the preview terrain or active realm.

## Goals / Non-Goals

**Goals:**

- Establish a reusable grouped-row Civilization Layer 8 with an initial Doors row that behaves consistently with Layer 7.
- Preserve legacy persisted density settings without changing the generated game's solvability rules.
- Make the closed door the recognizable preview marker while retaining both keys in the same generated group.

**Non-Goals:**

- Change door unlocking, fence placement, key distance rules, key inventory, or Overground restrictions.
- Add further Civilization sublayers or alter unrelated Object & NPC settings.
- Change the active map/minimap marker behavior; this change is limited to the Procedural settings-map preview.

## Decisions

### Canonical Doors setting with legacy migration

Use a dedicated `civilization-doors` catalog entry titled `Doors` as the first child of the Civilization group. Normalize a stored legacy `civilization` density into this new entry only when the new entry is absent; write the normalized complete catalog with the canonical entry after confirmation. This gives each future Civilization sublayer its own independent persisted profile without breaking existing users' selected density.

Keeping the legacy key as the permanent canonical setting was considered, but it would misrepresent its narrowed responsibility once later Civilization rows exist.

### Reuse the grouped-card presentation

Extract or parameterize the existing grouped-row rendering pattern so Layer 7 and Layer 8 share the same heading, row, Low/Med/High button, selected-state, realm-availability, and accessibility behavior. The Civilization group begins with the Doors row but accepts an ordered row catalog rather than requiring another bespoke card when a later row is introduced.

Adding a second one-off Civilization layout was considered, but it would create divergent control and accessibility behavior for equivalent grouped settings.

### Door-first preview overlay

Continue deriving preview Civilization groups from the deterministic group factory. Build the preview overlay from each group's door and its two keys, ensuring the door uses the closed-door glyph and primary Civilization marker styling while the key markers remain supplementary. The selected Doors density drives the same group-chance profile for preview and confirmed Underground generation.

Replacing the key markers with a single door marker was rejected because it would hide the existing two-key-per-door placement contract requested to remain visible.

## Risks / Trade-offs

- [Legacy configuration selects the wrong density after the key split] → Normalize the old `civilization` value only as a fallback and cover legacy and canonical catalog inputs with Node tests.
- [Preview and live generation diverge] → Use the same Doors profile multiplier and deterministic Civilization-group factory for both, with a marker-count regression assertion.
- [New grouped UI drifts from Layer 7] → Reuse shared rendering structure/classes and verify control labels, selected state, and Underworld-only availability.

## Migration Plan

1. Add the canonical Doors setting and compatibility normalization from the legacy Civilization setting.
2. Update the grouped UI, profile resolution, and preview marker rendering in one change.
3. Run the existing Node generation-settings and Civilization tests plus the project build; manually confirm the Underworld Procedural preview shows door-led groups with two keys.
4. Rollback is safe by restoring the prior application release; the fallback migration ensures old stored catalogs continue to be readable by the new release.
