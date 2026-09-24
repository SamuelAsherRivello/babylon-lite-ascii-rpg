# Design

## Context

See `proposal.md` for motivation. The existing React store already normalizes a complete generation catalog and the Vite server already exposes a local JSON GET/POST endpoint. The current boundary to preserve is that React owns draft and confirmation state, while Vite owns filesystem persistence; the gameplay layer consumes only the confirmed snapshot.

## Goals / Non-Goals

**Goals:**

- Make the V2 JSON file the authoritative source for confirmed enabled states and densities.
- Preserve preview-only draft behavior and atomic confirmation semantics.
- Validate and normalize the complete catalog before persistence and startup use.
- Keep local storage out of this World Generation persistence path in V2.

**Non-Goals:**

- No change to production/deployed persistence outside V2.
- No change to random seed handling, preview rendering rules, or generation algorithms.
- No new dependency or public server exposure.

## Decisions

- **Persist the complete catalog in one JSON document.** This keeps enabled state and density from drifting across separate stores and lets startup restore one authoritative profile. Separate keys or partial writes were rejected because they could produce mixed profiles.
- **Use the existing Vite JSON endpoint and atomic temporary-file rename.** This matches the verified local persistence architecture and avoids adding a new service or dependency.
- **Detect V2 through the existing local-development/runtime contract.** The implementation must centralize the decision so reads, writes, and the local-storage prohibition use the same environment classification. If V2 has a distinct runtime marker, implementation must use that marker rather than assuming every development build is V2.
- **Normalize before both read use and write.** Required passes remain enabled, invalid densities fall back to Med, and absent enabled values default to enabled. The normalized complete profile is what gets written after confirmation.

## Risks / Trade-offs

- [Risk] A V2 JSON write can fail because the file is read-only or unavailable → surface the existing confirmation error and leave the in-memory confirmed profile unchanged until the write succeeds.
- [Risk] Existing JSON files may contain only density or legacy fields → preserve normalization and migration compatibility, then write the complete shape on the next successful Confirm.
- [Risk] Misclassifying a deployed build as V2 could attempt a filesystem endpoint → centralize environment detection and test both V2 and non-V2 branches.
