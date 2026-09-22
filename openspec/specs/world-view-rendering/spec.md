# world-view-rendering Specification

## Purpose
Provides one bounded, configurable world-view composition contract for the
game view and mini-map view so both present the same authoritative world and
fog state without duplicating view-specific rendering logic.

## Requirements

### Requirement: Shared bounded world composition

The client SHALL render a world view from an explicit source world rectangle
and destination rectangle. The composition SHALL include only cells inside the
source rectangle and SHALL resolve the world background and visible glyph for
each eligible cell through the same world-view pipeline for every view.

#### Scenario: Game view renders only its source rectangle
- **WHEN** the game view is given a bounded world rectangle and destination
  bounds
- **THEN** it renders only cells inside that source rectangle into the
  destination bounds and does not submit cells outside either bound

#### Scenario: Mini-map renders a different source rectangle
- **WHEN** the mini-map is given a source rectangle different from the game
  view
- **THEN** it renders its supplied crop through the same world-cell
  composition rules without changing the game view's crop or state

### Requirement: Shared fog eligibility

Every world-view instance SHALL apply the active realm's authoritative
per-cell fog visibility before rendering a world cell. A cell at `0` visibility
SHALL produce no world background, glyph, or glyph-background draw for either
the game view or the mini-map view. A cell with visibility above `0` SHALL
render its world content with opacity equal to its visibility divided by `100`.
Discovery SHALL be updated by gameplay state, not by an individual view
render. A game-view render pass SHALL reconcile the presentation slot for
every cell in its bounded source rectangle so a prior presentation cannot
remain visible when that slot now represents a `0`-visibility cell.

#### Scenario: Both views hide a fully fogged cell

- **WHEN** a world cell has `0` visibility in the active realm
- **THEN** neither view renders that cell's world content, and the game view
  hides any prior glyph or glyph-background presentation occupying that slot

#### Scenario: Both views hide an undiscovered cell

- **WHEN** a world cell is undiscovered in the active realm
- **THEN** neither view renders that cell's world content, and the game view
  hides any prior glyph or glyph-background presentation occupying that cell's
  screen slot

#### Scenario: Both views render partial visibility

- **WHEN** a world cell has `25`, `50`, or `75` visibility
- **THEN** both views render the cell's world content with the corresponding
  `25%`, `50%`, or `75%` opacity

#### Scenario: Fully visible cell renders normally

- **WHEN** a world cell has `100` visibility
- **THEN** both views may render the cell's world content at full opacity

#### Scenario: Both views render a discovered cell

- **WHEN** a world cell has positive visibility in the active realm
- **THEN** both views may render that cell's world content according to their
  supplied scale and target parameters

#### Scenario: Rendering does not reveal cells

- **WHEN** either view is rendered repeatedly or with a different crop
- **THEN** the fog visibility state remains unchanged unless gameplay invokes
  the shared discovery rule

#### Scenario: Viewport shift reconciles prior slots

- **WHEN** the game view changes its source rectangle and a screen slot now
  corresponds to a `0`-visibility cell
- **THEN** the slot is hidden during that render pass and does not retain the
  prior glyph or glyph-background presentation

### Requirement: Parameterized presentation capabilities

The world-view renderer SHALL accept view parameters that enable or disable
presentation capabilities such as target-layer submission, scale, lighting,
and optional overlays. Capability differences SHALL be expressed through
arguments while world-cell eligibility and glyph identity remain shared.
Facing presentation for directional actors SHALL be expressed as renderer
presentation state derived from the actor record, so the authoritative glyph
identity remains `🤺` for the player and `🕷️` for enemies while the rendered
visual may use a left- or right-facing raster.

#### Scenario: Game lighting is view-specific
- **WHEN** the game view enables its lighting parameters and the mini-map
  disables them
- **THEN** both views use the same eligible glyphs while only the game view
  applies its configured lighting presentation

#### Scenario: Mini-map GPU light pass is optional
- **WHEN** the GPU light pass is enabled and the mini-map has discovered cells
  with cached torch or player light contributions
- **THEN** the mini-map applies the corresponding additive light samples before
  its marker overlay, while leaving world eligibility and authoritative
  lighting unchanged

#### Scenario: Mini-map markers are optional
- **WHEN** the mini-map enables an overlay pass and the game view does not
- **THEN** markers render only after the mini-map's shared world content and
  do not appear in the game view

#### Scenario: Actor facing is shared across views
- **WHEN** the player or an enemy has a last horizontal travel direction
- **THEN** the game view and mini-map SHALL render the actor's glyph with the
  same left- or right-facing presentation while keeping palette lookup tied to
  the actor's base glyph identity

### Requirement: Stable world render pass order

The renderer SHALL perform any enabled opaque glyph-background composition before glyph composition, SHALL apply the cell's configured lighting to that combined world-view result, and SHALL perform any enabled overlay after world content. The game view and mini-map SHALL use the same enabled glyph/background visual source, adapted only to their destination scale. When the GPU light pass is enabled, the mini-map SHALL apply the same discovered-cell light samples and additive light color before its marker overlay.

#### Scenario: Combined game and mini-map presentation

- **WHEN** a discovered cell is rendered with Glyph Background enabled
- **THEN** both views use the same opaque background-and-glyph composite, reduced or submitted according to the destination view's scale, before any view-specific overlay

#### Scenario: Mini-map GPU light pass

- **WHEN** the GPU light pass is enabled and a discovered mini-map cell has a cached torch or player light contribution
- **THEN** the mini-map SHALL apply the corresponding additive GPU light-pass sample before drawing markers

#### Scenario: Overlay remains above world content

- **WHEN** an enabled marker or presentation overlay occupies a rendered cell
- **THEN** the combined world background-and-glyph result SHALL be completed before the overlay renders

### Requirement: Cooperative world-view rendering

The world-view renderer SHALL provide an opt-in cooperative rendering mode for
long-running world-view jobs. Cooperative rendering SHALL preserve the same
world-cell eligibility, destination geometry, enabled pass order, opacity,
lighting treatment, and overlay ordering as the synchronous renderer once the
job completes, while yielding browser control between bounded batches of work.
Callers that do not opt in SHALL retain the established synchronous rendering
behavior.

#### Scenario: Cooperative output matches synchronous output
- **WHEN** a world-view composition is rendered cooperatively with the same
  source, destination, fog, lighting, and overlay parameters as a synchronous
  render
- **THEN** the completed view presents the same eligible cells, visual ordering,
  opacity, lighting, and overlays as the synchronous render

#### Scenario: Long render yields between batches
- **WHEN** a cooperative world-view job has more cells to render than fit within
  its configured frame budget
- **THEN** it yields browser control and resumes from the next unrendered cell
  or row without restarting completed work

#### Scenario: Existing callers remain synchronous
- **WHEN** a caller uses the established world-view rendering entrypoint without
  opting in to cooperative rendering
- **THEN** the render completes synchronously with the same return values and
  behavior as before this change

### Requirement: Cooperative render cancellation

The cooperative world-view renderer SHALL allow a caller to cancel a pending
render job. A cancelled job SHALL stop before drawing additional cells or
overlays, SHALL NOT report itself as completed, and SHALL leave ownership of
any cleanup or replacement render to the caller.

#### Scenario: Cancelled job stops drawing stale content
- **WHEN** a cooperative world-view render job is cancelled before all cells and
  overlays are rendered
- **THEN** no later batch from that job draws additional world content or
  overlays
- **AND** the caller can start a replacement render for the current state

### Requirement: Shared glyph offset presentation

The world-view renderer SHALL apply the confirmed per-glyph offset values whenever it renders a glyph in the game view or mini-map. Offsets SHALL affect only presentation within the destination cell; they SHALL NOT change world coordinates, collision, fog eligibility, actor occupancy, pickup collection, or authoritative glyph identity.

#### Scenario: Game view applies glyph offsets
- **WHEN** a discovered game-view cell renders a glyph with confirmed offset values
- **THEN** the glyph SHALL appear shifted and scaled within its grid cell according to those values
- **AND** the cell's world position and gameplay occupancy SHALL remain unchanged

#### Scenario: Mini-map applies glyph offsets
- **WHEN** the mini-map renders a discovered glyph with confirmed offset values
- **THEN** the mini-map SHALL apply the same offset semantics adapted to its destination cell scale
- **AND** the mini-map SHALL preserve the same fog, lighting, and overlay ordering as other world-view content

#### Scenario: Ascii previews share client cell rendering
- **WHEN** the Ascii Settings palette grid or glyph editor preview renders a glyph
- **THEN** it SHALL use the same composite cell rendering technology as the game view and mini-map for the glyph background, glyph pixels, offsets, and fully visible lighting treatment

#### Scenario: Facing and offsets combine
- **WHEN** the player or an enemy renders with a left- or right-facing presentation
- **THEN** the renderer SHALL apply the actor's facing presentation and the base glyph's confirmed offsets together
- **AND** palette lookup SHALL remain tied to the base glyph identity

### Requirement: Game-view-only floating text overlay

The game world view SHALL allow a floating text overlay after world content for visible signed health-change feedback. Floating text SHALL be a game-view-only overlay and SHALL NOT become part of shared world-cell composition, minimap world rendering, minimap markers, or map-window rendering.

#### Scenario: Floating text renders above game world content
- **WHEN** a rendered entity receives a visible health delta that creates floating text
- **THEN** the game world view presents the floating text above the completed world content for that frame

#### Scenario: Shared world composition excludes floating text
- **WHEN** the minimap or map window renders through shared world-view composition
- **THEN** it does not receive or render floating text records

#### Scenario: Floating text follows rendered grid geometry
- **WHEN** the game view cell size or visible region changes while floating text is active
- **THEN** each visible floating text instance remains positioned from the rendered entity cell's current top-edge anchor and its upward motion remains proportional to the current grid-cell width
