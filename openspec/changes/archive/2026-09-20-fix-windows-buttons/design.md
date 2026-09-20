# Design

## Context

See `proposal.md` for the user-visible problem. The verified architecture separates React UI in `ui_layer` from Babylon Lite gameplay in `game_layer`, with a narrow bridge for snapshots and commands. The current Windows section launches two modal React surfaces and one movable Lighting surface; the fix must preserve those boundaries and avoid treating a browser automation timeout as proof of success.

## Goals / Non-Goals

**Goals:** Identify the exact freeze trigger in the shared launcher path, make all three surfaces independently openable and closable, preserve existing editor and Lighting behavior, and add a repeatable regression check that observes browser responsiveness.

**Non-Goals:** Replacing Babylon Lite, removing Lighting, disabling the palette editor, changing game rules, changing persistent setting semantics, or modifying unrelated dirty work.

## Decisions

- Instrument and isolate the first launcher transition before changing behavior. Capture React errors, browser console errors, long tasks, and bridge/render calls so the repair targets the actual deadlock rather than adding another speculative z-index or timing workaround.
- Keep launcher state local to the React UI layer. Window open/close handlers SHALL not call game-layer commands unless an existing window control explicitly changes a game setting.
- Verify pointer ownership through computed stacking and hit-testing at the launcher and window controls in both presentation modes. If layering is involved, make the smallest CSS stacking-context correction and cover it with a source or browser assertion.
- Verify the Lighting mount lifecycle separately from the two modal lifecycles, including its resize/layout effect and saved-position update, because it is the only launcher that mounts a hook-based movable surface.
- Use one focused browser interaction harness that opens and closes each window repeatedly and records a responsiveness sentinel between actions. Keep the check out of the default Playwright test-file policy unless implementation explicitly adds a supported browser-test command.

## Risks / Trade-offs

- [Risk] The freeze may originate in the renderer or WebGPU event loop rather than React. → [Mitigation] Compare a UI-only render path with the full game path and record game-layer/bridge activity around the click before editing.
- [Risk] A stacking fix could make game input unreachable. → [Mitigation] Preserve `pointer-events: none` on the full UI layer and enable pointer events only on intended HUD/window surfaces; verify canvas movement input separately.
- [Risk] Existing dirty changes can confound reproduction. → [Mitigation] Do not revert or stage unrelated files; document the exact checkout state and use focused diffs/tests.
