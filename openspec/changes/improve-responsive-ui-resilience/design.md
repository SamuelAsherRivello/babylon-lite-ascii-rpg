# Design

## Context

See proposal.md for motivation and the responsive-ui-layout delta for the
behavior contract. The current UI is React markup in `App.jsx` and
`HudLayouts.jsx`, styled through a shared import entry point plus feature CSS
modules. Its four corner regions are absolutely positioned within `#ui_layer`.
Several tokens and surfaces use fixed point/pixel geometry, while some
Character-slot sizing relies on a size container and container-query units.
The current presentation frame already distinguishes desktop portrait testing
from coarse-pointer mobile portrait. Babylon Lite owns the game canvas,
rendering, input, and world state; React owns the HTML overlay and communicates
through the existing narrow bridge.

## Goals / Non-Goals

**Goals:**

- Make 100% Chrome zoom the intentional landscape density reference without
  treating its physical monitor pixels as a layout contract.
- Give every React-owned visual surface one bounded sizing vocabulary and
  predictable reflow behavior across ordinary viewport, zoom, and display-scale
  changes.
- Retain accessible semantic controls, keyboard focus behavior, persisted
  settings, corner roles, and the React/Babylon Lite ownership boundary.

**Non-Goals:**

- Change the game world, camera semantics, generated content, zoom-level
  mapping, or minimap gameplay behavior.
- Create a device-specific desktop/mobile user-agent layout fork, detect or
  persist Windows scaling, or override a user's Chrome zoom preference.
- Add a UI framework, a new rendering dependency, or Playwright test files.
- Guarantee pixel-identical screenshots at different browser zoom levels;
  browser zoom deliberately changes available CSS layout space.

## Decisions

### Use CSS viewport space as the sole layout coordinate system

React layout will treat CSS viewport width and height as authoritative.
`devicePixelRatio` is not a React layout breakpoint and Windows display scale
will not be read, inferred, stored, or used to select a layout. The existing
portrait presentation behavior remains, but all overlay bounds will be derived
from the active presentation frame rather than raw fixed screen assumptions.

CSS custom properties will define bounded `clamp()`-based values for the shared
inset, panel scale, type scale, gaps, control height, and safe visible height.
Use dynamic viewport units with fallbacks where browser UI affects visible
height. This makes 100% the reference density while allowing the same component
tree to adapt to the CSS viewport produced by 80%, 100%, and 125% Chrome zoom.

Alternative considered: query monitor resolution or device pixel ratio in
React. Rejected because those values describe physical density rather than
usable CSS layout space and would reproduce the user's scaling-specific bug.

### Refactor the HUD into role-based bounded regions

Keep the four `CornerLayout` roles and the current `HudBlockLayout` primitives.
Audit their markup only where a stable wrapper, label, or grouping is required
to reflow content. Use CSS grid/flex constraints, `minmax(0, ...)`, `min()`,
`max()`, and `clamp()` to reserve top panels and cap bottom regions. At smaller
width or height, compact internal groups and permit their designated internal
scroll surfaces; do not let a corner panel expand beyond the active frame.

The 100% baseline keeps matching top panels and the world center clear.
Constrained layouts preserve functional corner roles before ornamental spacing.

Alternative considered: a separate desktop JSX tree for every zoom and device
class. Rejected because zoom is continuous, duplicates accessibility behavior,
and makes visual regressions more likely.

### Make all React surfaces consume the same constraints

Apply the shared tokens and overflow rules across `hud.css`, `character.css`,
`map.css`, `windows.css`, `toasts.css`, and `floating-text.css`, with
`styles.css` as the token entry point. Panels, minimap, dialogs, lighting and
editor windows, tooltips, toasts, map controls, and floating text will use the
active presentation inset and bounded maximum dimensions. Bodies intended to
hold excess content will scroll internally; document-level scroll remains
disabled for the game shell.

Alternative considered: patch only the Character and minimap panels seen in
the screenshots. Rejected because dialogs and transient surfaces would retain
the same fixed-geometry failure mode.

### Preserve a robust square Character grid without size-container collapse

The Character resources remain a two-by-three grid. Size each cell with normal
grid track sizing and `aspect-ratio: 1 / 1`, bounded by the available panel
width and height. Do not make slot cell dimensions depend on `100cqh` inside a
container-size/flex combination, because that can collapse or push cells
offscreen under constrained geometry. Keep the five-bar order and preserve the
compact 100% baseline density.

Alternative considered: retain a fixed 22.4px cell size. Rejected because it
does not scale with available panel space and conflicts with the resilience
contract.

### Keep canvas density separate from the React layout change

This change does not move canvas ownership into React. If a separate rendering
change later adjusts backing-store density, it must be owned and validated in
the Babylon Lite layer. The responsive overlay will continue to position itself
in CSS pixels above the canvas regardless of physical display density.

## Risks / Trade-offs

- [Fluid values can drift from the preferred 100% appearance] → Establish the
  supplied 100% Chrome capture as the visual baseline and verify it before
  accepting constrained-layout changes.
- [Short or narrow viewports cannot show every informational detail at once] →
  Compact groups first and use intentional internal scrolling only for content
  surfaces; do not clip controls or create page overflow.
- [Broad CSS audit can accidentally alter editor behavior] → Implement by
  feature stylesheet, run focused source tests after each group, and manually
  exercise every React-owned window.
- [Current unrelated work modifies `App.jsx` and `windows.css`] → Preserve it
  and integrate only the relevant layout changes after inspecting the active
  diff during apply.

## Migration Plan

1. Implement the shared tokens and base presentation bounds without changing
   persisted setting names or defaults.
2. Convert the HUD, Character grid, and minimap to the bounded layout rules.
3. Convert all React-owned windows and transient surfaces to the same rules.
4. Run focused Node checks, build the project, and manually verify the Chrome
   zoom/viewport matrix at 80%, 100%, and 125%.
5. If a regression is found, revert the affected stylesheet or JSX slice; no
   storage migration or gameplay-data rollback is required.
