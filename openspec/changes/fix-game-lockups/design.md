# Design

## Context

The React HUD and Babylon Lite runtime are separate layers connected by a narrow bridge. Current continuous frame submission and resize/input work can contend with UI events.

## Goals / Non-Goals

**Goals:** Preserve Babylon Lite and every existing game system while bounding frame work, lifecycle transitions, and explicit fullscreen behavior.

**Non-Goals:** A legacy canvas renderer, permanently disabled lighting/minimap systems, or a gameplay fallback.

## Decisions

- Use a single coalesced frame scheduler owned by the game layer; it preserves the existing renderer while preventing duplicate queued presentation work.
- Treat resize, visibility, device loss, startup, and disposal as lifecycle transitions that cancel stale work before scheduling a valid current render.
- Keep React commands narrow and make fullscreen opt-in only. The alternative global first-click listener conflicts with every UI action.

## Risks / Trade-offs

- WebGPU device loss may still make the game unavailable; report that state rather than silently switching renderers.
- Demand-driven presentation requires every visible state mutation to schedule a frame; focused tests cover each command category.
