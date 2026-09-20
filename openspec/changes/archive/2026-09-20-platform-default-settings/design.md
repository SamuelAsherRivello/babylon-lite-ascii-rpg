# Design

## Context

The React UI layer currently initializes each setting from an individual
`localStorage` key and writes it through a state effect. Zoom defaults to `5`,
Show UI defaults to true, and the existing fullscreen control requests
fullscreen only when clicked. See `proposal.md` for motivation and the delta
specs for behavior.

## Goals / Non-Goals

**Goals:**

- Resolve absent values from one platform-aware default source while retaining
  the existing per-setting persistence and bridge snapshots.
- Make a single mobile fullscreen attempt from a real click gesture.
- Keep the existing manual Fullscreen control as the explicit fallback.

**Non-Goals:**

- Changing a previously saved player preference on platform changes.
- Automatically retrying fullscreen, forcing fullscreen after rejection, or
  changing desktop entry behavior.
- Adding browser-automation tests, dependencies, or a user-agent database.

## Decisions

### Use primary-input capability for Mobile classification

Use the browser's coarse-primary-pointer media capability to select Mobile
defaults; the inverse selects PC defaults. This is a capability signal suited
to touch-first interaction and avoids fragile user-agent parsing. The selected
default source must be available to the existing setting readers, including the
zoom reader, before React state initializes.

Alternative considered: viewport width/orientation. It is not selected because
resizing a desktop browser would unexpectedly change its first-run defaults.

### Apply defaults only for missing storage keys

Retain the current storage keys and validation/clamping. Each reader uses the
platform default only when its key is absent or invalid under the current
validation rules; normal initialization effects persist the resolved value.
This honors existing preferences and lets Reset Settings naturally reapply
defaults after reload.

Alternative considered: a separate settings-profile storage object. It is not
selected because it would migrate unrelated settings and duplicate the
established persistence path.

### Install a one-shot mobile click listener after load

Register a document-level click listener only for Mobile sessions. On the first
click it marks the attempt consumed before requesting fullscreen, then removes
itself. The listener must not call `preventDefault` or stop propagation, so the
clicked control or game target remains functional. The existing fullscreen
state listener stays responsible for reflecting actual browser state.

Alternative considered: triggering fullscreen during mount or a timer. It is
not selected because browsers require a user activation and commonly reject
those attempts.

## Risks / Trade-offs

- [Coarse-pointer detection can include some hybrid devices] → Use a stable
  input-capability signal and preserve each saved setting once chosen.
- [A browser can reject fullscreen even from a click] → Consume the one-shot
  attempt, keep gameplay active, and leave the manual control available.
- [A parent document or browser policy can prohibit fullscreen] → Treat it as
  unsupported without surfacing a blocking error or retry loop.

## Migration Plan

No storage migration is required. Existing keys and valid stored values remain
authoritative. Deploy as a normal client update; rollback restores the prior
common defaults while saved preferences remain intact.
