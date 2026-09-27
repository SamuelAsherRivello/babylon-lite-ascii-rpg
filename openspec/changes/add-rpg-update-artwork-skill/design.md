# Design

## Context

See [proposal.md](proposal.md). Existing RPG artwork replacements cross catalog
data, seeded world generation, the live Babylon Lite renderer, and the
Procedural window canvas. Static Health and Chest art use raster mappings;
Torch uses a visible-region animation overlay. The new skill captures those
already-established paths without coupling the skill to a single concept or
altering runtime code.

## Goals / Non-Goals

**Goals:**

- Accept an existing concept name and a raster file or directory path.
- Route the operator through a static, stateful-static, or animated-strip
  treatment based on inspected asset facts and existing renderer conventions.
- Make live game and Procedural-preview rendering coverage explicit, including
  disabled-layer absence and the absence of legacy-glyph fallback.
- Preserve gameplay, generation, and intentionally distinct HUD semantics by
  default.

**Non-Goals:**

- Creating a generic RPG renderer, a new animation framework, or an art asset.
- Renaming concepts or altering gameplay as an incidental result of artwork
  replacement.
- Requiring Playwright files, external services, or new project dependencies.

## Decisions

### Publish one global, instruction-only skill

Place `rpg-update-artwork` in the user's Codex skill directory with a concise
description and `agents/openai.yaml` metadata. A project-local skill was
rejected because the workflow is intended for recurring RPG artwork work across
checkouts; a plugin or helper script was rejected because the exact source
paths and renderer APIs must be discovered per project.

### Resolve an exact asset before editing

The skill accepts a file or directory path. It inspects a directory and asks
for the exact file when there is no unambiguous match. This prevents accidental
selection of another sprite in an asset pack and makes animation layout
inspection reproducible.

### Make artwork replacement renderer-wide

The workflow requires tracing the concept through catalog, generation pass,
runtime renderer, and Procedural preview before changing code. The renderer
art key remains internal; static and stateful artwork maps to rasters, while
animated strips use a reconciled visible-region presentation. This avoids the
rejected alternative of changing only the catalog glyph, which leaves text
fallbacks and preview drift.

### Preserve semantics and separately requested UI

The skill changes presentation only unless the user explicitly expands scope.
It preserves deterministic placement and settings behavior, and asks the
operator to identify deliberately separate UI (such as a health-meter heart)
before removing legacy symbols. This avoids treating a shared-looking glyph as
universal artwork.

## Risks / Trade-offs

- [An asset directory contains several plausible files] → Require exact-file
  clarification rather than guessing.
- [Runtime and preview draw different representations] → Verify both with the
  same generation pass and fixed seed; test layer disablement.
- [An animation creates stale/offscreen work] → Require visible-region
  reconciliation and shared-clock lifecycle checks.
- [The skill becomes stale as renderer APIs evolve] → Keep it workflow-focused
  and require live repository discovery instead of hard-coded source names.

## Migration Plan

1. Create and validate the global skill directory.
2. Make it available to Codex discovery on the next skill refresh.
3. Roll back by removing only the global skill directory; no game data or
   runtime migration is involved.
