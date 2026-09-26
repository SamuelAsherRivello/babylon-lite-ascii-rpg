# Tasks

## 1. Presentation masking

- [x] 1.1 Add a Building-presentation predicate that identifies only concealed exterior roof cells, and verify existing exterior, Door-entry, and interior overlay tests still distinguish those states.
- [x] 1.2 Apply ambient-only base-glyph lighting to concealed roof cells without changing the cached terrain lighting field or opened-Door walkability, and verify the focused renderer/lighting check confirms an opened Door still transmits grid light.
- [x] 1.3 Exclude concealed roof cells from GPU light-pass submission while retaining normal GPU lighting for revealed interiors, and verify focused GPU sample coverage covers both states.

## 2. Regression coverage and validation

- [x] 2.1 Add focused Node tests for a source outside an opened Home, confirming concealed roof cells remain ambient-only with no GPU composite and that revealed Door/interior cells receive normal lighting.
- [x] 2.2 Run the affected Node test suites and `npm.cmd test` from the repository root; verify they pass without adding or running Playwright tests.
- [x] 2.3 Run `npm.cmd run build` and `openspec validate fix-open-door-roof-lighting --type change --strict` from the repository root; verify both succeed.
