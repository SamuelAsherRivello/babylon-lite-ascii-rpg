# Tasks

## 1. Release history data and automation

- [x] 1.1 Add checked-in Changelog JSON seeded with the prior tagged-release history and concise summaries for each release.
- [x] 1.2 Add an updater that derives one to five concise summaries and version-pinned synced-feature links from newly archived changes without rewriting existing release records.
- [x] 1.3 Invoke the updater from the checked-in version-release workflow and commit the resulting JSON with the release version.

## 2. Developer Changelog window

- [x] 2.1 Add a `Changelog` launcher to the Dev panel and a window that uses the existing developer-window sizing and behavior.
- [x] 2.2 Render releases newest first with their version headings and one to five short, human-readable summaries.
- [x] 2.3 Make each summary an underlined, same-color link that opens its version-pinned synced OpenSpec feature file in a new tab.

## 3. Verification

- [x] 3.1 Add focused source and data tests for the Changelog records, launcher, ordering, links, and release updater behavior.
- [x] 3.2 Run the relevant Node test suite and production build, then manually verify the developer window and one feature-file link in the browser.
