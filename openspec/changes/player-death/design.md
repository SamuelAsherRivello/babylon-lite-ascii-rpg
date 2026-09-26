# Design

## Context

See proposal.md for motivation. The game layer already owns the authoritative zero-health transition, gameplay guards, hero death frame selection, and restart methods. It currently publishes the bridge's single dead boolean immediately, and React derives both the input block and recovery window from that boolean. The hero's existing death animation has a finite frame sequence and freezes at its final frame.

## Goals / Non-Goals

**Goals:**

- Represent death presentation separately from recovery-menu availability without changing the authoritative dead-run boundary.
- Base the 500 ms delay on confirmed completion of the existing death animation, not on the moment health reaches zero.
- Keep the bridge narrow and preserve React's ownership of window rendering.
- Make timers deterministic and safely disposable across restart, page teardown, and repeated damage attempts.

**Non-Goals:**

- Changing death artwork, its frame timing, hero-scale behavior, health values, checkpoint contents, or restart destinations.
- Pausing or disabling unrelated UI controls during the death presentation.
- Adding persistence, a new dependency, or Playwright coverage.

## Decisions

- Introduce an explicit presentation state that distinguishes `alive`, `dying` (animation plus delay), and `recovery-ready`. The existing lifecycle remains the sole authority for whether the run is dead. This avoids treating a dead boolean as both a simulation state and a menu-visibility signal.
- Detect the finite hero death animation's completion at the game-layer animation boundary, then begin one cancellable 500 ms timer. Starting the timer directly on health depletion was considered, but it would shorten or overlap the requested post-animation pause if animation timing changes.
- Publish a dedicated immutable recovery-ready snapshot through the existing bridge pattern. React will use it to render the modal and permit restart actions, while gameplay guards continue to use the authoritative dead state. Reusing the existing dead snapshot for both purposes was rejected because it necessarily makes the modal immediate.
- Scope the input event guards to recognized gameplay gestures and commands. Existing window controls retain their normal event handling; death-window controls only become available once recovery-ready is true.
- Make recovery readiness idempotent: only the first death transition can schedule it, and revive/restart/dispose cancels the pending completion callback. This prevents stale callbacks from reopening a menu in a new run.

## Risks / Trade-offs

- [Risk] Multiple render or damage callbacks schedule duplicate recovery timers. → Gate scheduling on the one-time lifecycle transition and clear the stored timer before scheduling or during cleanup.
- [Risk] A stale callback fires after restart or teardown. → Cancel it in each lifecycle reset/dispose path and verify it cannot publish recovery-ready afterward.
- [Risk] Broad document-level input blocking still prevents UI controls during the delay. → Restrict the block to gameplay targets and verify a representative non-gameplay control remains interactive.
- [Risk] Animation timing cannot be reliably observed in focused tests. → Isolate the completion-to-delay coordinator behind injectable clock/animation-completion seams, then perform a manual seeded-browser check for the visible sequence.

## Migration Plan

1. Deliver the behavior as a backward-compatible client-only change with no saved-state migration.
2. If recovery presentation regresses, remove the new readiness gate to restore the current immediate recovery prompt; the authoritative lifecycle and restart methods remain intact.
