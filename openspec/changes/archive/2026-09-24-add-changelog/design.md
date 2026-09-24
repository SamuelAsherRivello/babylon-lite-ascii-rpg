# Design

## Context

The React developer panel already owns developer-only launchers and modal
windows. The release workflow owns version increments and release commits.

## Goals / Non-Goals

**Goals:**

- Keep a checked-in, readable history with a bounded set of summaries per release.
- Link each summary to the immutable feature contract for that version.
- Add only the next release record during a release workflow execution.

**Non-Goals:**

- Rebuild historical records during every release.
- Change release numbering, publish behavior, or player-facing game state.

## Decisions

1. **Use JSON as the checked-in history source.** The React window reads a
   static JSON file, allowing history to ship with the game and remain available
   without a network request. A release-time Node updater prepends one entry.
2. **Use version-pinned GitHub links.** Each item points to the corresponding
   OpenSpec feature file at `v<version>` and uses a new tab.
3. **Reuse the existing modal frame.** The Changelog uses the Procedural-sized
   modal frame, avoiding a new window geometry system.

## Risks / Trade-offs

- [A historical label may need a curated feature mapping] → Seed the known
  history explicitly and generate future links from archived feature artifacts.
- [An archived change may affect multiple capabilities] → Bound each release to
  five concise entries and associate a stable primary feature file per entry.

## Migration Plan

Seed tagged release history once. Future releases append one entry before the
release commit; rollback removes the new UI, JSON, updater, and workflow step
without changing prior tags.
