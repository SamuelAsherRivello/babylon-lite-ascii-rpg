# Proposal

## Why

The lower-left developer controls currently render as an unframed list whose
Developer checkbox is both visually inconsistent with the Log panel and the
only path to hide the HUD. Developers need the same compact, collapsible panel
pattern as Log without losing any existing lower-left tools.

## What Changes

- Replace the loose lower-left developer area with a `Dev` panel that uses the
  same open/closed React structure and open dimensions as the lower-right Log.
- Persist the Dev panel's open state in localStorage, with new sessions closed
  by default.
- Preserve the GitHub link plus every Windows, Info, and Settings control;
  remove only the bottom Developer checkbox.
- Retire the Show UI preference and HUD-hidden behavior that the removed
  checkbox controlled.
- Add scoped `developer-title` and `developer-body-text` typography at 8pt
  (80% of the current lower-left 10pt treatment), and keep the Dev body free
  of scrollbars.
- Preserve the four-corner HUD, lower-right Log, existing developer tool
  actions, and all unrelated persisted settings.

## Capabilities

### New Capabilities

- `developer-corner`: Collapsible lower-left developer panel behavior,
  contents, typography, and persistence.

### Modified Capabilities

- `responsive-ui-layout`: Define the lower-left Dev panel's Log-matched
  geometry and no-scroll layout while retaining usable lower-left controls.
- `platform-default-settings`: Remove the retired Show UI platform default and
  describe the independent Dev panel default.

## Impact

- Affects the React HUD composition, lower-left/Log CSS, platform settings,
  startup HUD initialization, and focused source-contract tests.
- Does not change game-layer systems, bridge APIs, dependencies, or the
  lower-right Log's data and scrolling behavior.
