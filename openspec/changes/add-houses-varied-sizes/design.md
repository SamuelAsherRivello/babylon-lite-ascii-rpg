# Design

## Context

See [proposal.md](proposal.md) for motivation. The current building system hard-codes `HOME_WIDTH = 20`, `HOME_HEIGHT = 10`, and a fixed Door column while sharing one candidate-footprint calculation between preview and runtime.

## Goals / Non-Goals

**Goals:**

- Make Home geometry data-driven while retaining the existing Building object contract.
- Keep seeded generation, placement reservations, reachability, rendering overlays, and dynamic-entity exclusion consistent for all sizes.
- Let compact walkable regions accept smaller Homes without weakening validation for larger Homes.

**Non-Goals:**

- No new player-facing size setting or density setting.
- No changes to Home glyphs, Door/Key mechanics, Underground structures, terrain generation, or save format.
- No guarantee that a generated world contains an exact count of each size; equal probability applies to each accepted size selection.

## Decisions

### Represent sizes as immutable geometry definitions

Replace scalar-only Home constants with an immutable size catalog containing the size name, width, height, and Door-column rule. The existing Home constructor and candidate collector consume the selected definition so walls, interiors, approach cells, bounding checks, and keys all derive from one source of truth.

Alternative considered: three separate Home constructors. Rejected because it would duplicate collision, rendering, and key-placement logic and make future variants harder to keep consistent.

### Select size before candidate validation, with deterministic retries

For each region/placement attempt, draw one of the three definitions from the seeded random source, then validate candidates for that size. If no candidate fits, reject that attempt rather than silently changing the requested size; this preserves equal selection probability and deterministic output. The region loop may continue considering later regions.

Alternative considered: collect all sizes and weight eligible candidates globally. Rejected because terrain availability would bias the observed distribution toward smaller houses and would change existing region-level generation semantics.

### Share the size-aware selector between runtime and preview

Keep preview and runtime on the same building-system API and pass equivalent seeded random streams and reservations. The preview continues to emit one origin marker per accepted Home, while the full runtime retains all cells and objects.

## Risks / Trade-offs

- [A 20-by-10 Home may become less common in fragmented terrain] -> Preserve equal selection at the attempt level and add deterministic tests for all three definitions and no-partial placement.
- [Changing random-call order can alter existing seeded worlds] -> Isolate the size draw in the Home placement stream and update focused fixtures to assert the new contract rather than relying on old unspoken coordinates.
- [Door placement could be invalid for narrow widths] -> Define the Door column relative to the selected width and assert it lies on the bottom edge and within the footprint for every size.

## Migration Plan

1. Add the immutable size catalog and route Home construction and candidate validation through it.
2. Update runtime and preview calls to use the shared seeded size-aware placement path.
3. Add focused tests, then run the repository Node suite and build.
4. Rollback is code-only: remove the size selection and restore the existing HIGH definition; no stored settings or save migration is needed.
