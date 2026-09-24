# Proposal

## Why

Released features need a compact, in-game history so developers can see what changed in each version and open the corresponding accepted feature contract without leaving the game context.

## What Changes

- Add a developer-only Changelog window that lists releases newest first with one to five concise feature summaries per version.
- Store the seeded historical release history in checked-in JSON and make each summary open its version-pinned synced OpenSpec feature file in a new browser tab.
- Extend the checked-in release workflow to append only the next release's newly archived feature summaries, links, and version instead of rebuilding history.
- Standardize project links to retain surrounding text color while remaining underlined.

## Capabilities

### New Capabilities
- `changelog`: Provides the persisted, versioned release history and its developer window.

### Modified Capabilities
- `developer-corner`: Adds the Changelog launcher to the existing developer tools panel.

## Impact

- Affects the React developer UI, shared link styling, release workflow, release-history JSON, updater script, and focused Node tests.
- Adds no runtime dependencies and preserves normal release versioning, GitHub Pages, and unrelated settings behavior.