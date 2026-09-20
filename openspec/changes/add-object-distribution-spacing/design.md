# Design

## Context

See [proposal.md](proposal.md) for motivation. `world-system.js` currently
builds torch candidates with `isTorchCandidate`, shuffles them, and slices the
requested count in duplicated synchronous and cooperative selectors. The world
model publishes torch positions as `world.torches` and renders them as `T` in
the character layer.

## Goals / Non-Goals

**Goals:**

- Centralize selection in a typed distribution contract whose call site and
  diagnostics describe distributing an object of type `torch`.
- Keep the existing candidate predicate separate from generic distribution.
- Enforce a deterministic 25-cell Euclidean minimum separation in both
  generation modes while preserving the world data shape and options contract.

**Non-Goals:**

- Adding a user setting, changing density calculation, or adding a second
  object type.
- Changing torch glyph rendering, lighting, player movement, or terrain rules.

## Decisions

### Use a type-keyed distribution definition

Define object-specific rules through a `torch` distribution configuration and
invoke a generic operation described as distributing an object of type
`torch`. This keeps candidate eligibility, glyph output, requested count, and
minimum distance available as a single rule bundle when another object type is
added. The alternative—extending `selectTorchCells` with more special cases—
would preserve duplication and require each new object to recreate selection
semantics.

### Shuffle once, then greedily accept sufficiently distant candidates

Retain the seeded Fisher-Yates candidate shuffle, then walk it in order,
accepting a candidate only if its squared Euclidean distance from every
accepted instance meets the squared minimum distance. This preserves
repeatability, avoids square-root work, and distributes a deterministic subset.
If fewer than the requested count fit, return the deterministic accepted subset
rather than retrying world generation or weakening the spacing rule. This makes
the count a target on small maps while preserving the hard placement invariant.
Alternative packing algorithms could increase fill rate but would change
random-call order and make synchronous/cooperative equivalence harder to
preserve.

### Share the selection core across generation modes

Extract a synchronous selection core usable by the normal generator and adapt
the cooperative path to apply the same order and acceptance predicate while
retaining its checkpoints. This keeps completed seeded worlds identical across
the two modes. Fully materializing and then reusing an asynchronous iterator
was rejected because it would make the small deterministic core less direct.

## Risks / Trade-offs

- [Risk] Sparse valid wall-adjacent cells cannot satisfy both count and
  spacing. → Mitigation: return a deterministic valid subset and test both
  undersized and representative production-sized seeded worlds.
- [Risk] A refactor changes seeded outcomes unintentionally. → Mitigation:
  preserve one seeded shuffle order and assert repeated and cooperative worlds
  are equal.
- [Risk] Future object types need different eligibility rules. → Mitigation:
  keep type-specific candidate predicates at the typed rule boundary rather
  than broadening terrain or character-layer APIs.

## Migration Plan

No persisted data or external API migration is required. Regenerated worlds
will receive newly spaced deterministic torch placements for a given seed.
