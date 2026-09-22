# Design

## Context

The UI layer already owns persisted Settings state in `App.jsx` and uses
`style.css` for the fixed canvas, UI layer, and responsive HUD. Babylon owns
the canvas and follows its available dimensions through the existing resize
path. See `proposal.md` for motivation and the delta specs for behavior.

## Goals / Non-Goals

**Goals:**

- Add one local-storage-backed aspect value to the existing Settings state.
- Make desktop portrait testing use a real tall 9:16 presentation frame while
  preserving true mobile viewport filling.
- Give the control the existing Settings tooltip and reset behavior.
- Document the control as the required agent-facing way to test mobile layout.

**Non-Goals:**

- Simulating mobile browser user agents, hardware input, device pixel ratios,
  or browser chrome.
- Moving canvas ownership into React, adding dependencies, or changing the
  actual browser window size.

## Decisions

- Store a two-state aspect choice alongside existing Settings local-storage
  values. The absent value resolves to landscape and is written during initial
  render; this follows the repository's persistence contract. `localStorage`
  clearing remains the reset mechanism.
- Use `Aspect (Landscape)` as the landscape-state label exactly as requested;
  selected portrait displays `Aspect (Portrait)` so the button describes the
  current active presentation and remains a two-way test switch.
- Apply an aspect state marker at the UI/game presentation boundary. Landscape
  retains viewport-filling CSS with a width-greater-than-height constraint;
  desktop portrait centers a 9:16 frame; mobile portrait leaves dimensions
  viewport-filling. This changes available canvas geometry, so the existing
  Babylon resize observer remains authoritative instead of adding synthetic
  dimensions to game logic.
- Extend existing Node source/client checks and avoid Playwright, consistent
  with repository policy. Update `AGENTS.md` to make this control the required
  agent workflow for mobile-friendly visual testing.

## Risks / Trade-offs

- [A very short desktop viewport cannot contain a full-height 9:16 frame] →
  constrain the test frame to available viewport dimensions while preserving
  its tall ratio.
- [A persisted test mode surprises a returning user] → expose the active mode
  in the exact Settings label and reset it with Reset Settings.
- [CSS framing and canvas sizing diverge] → frame the actual canvas/container
  and rely on the existing resize observer rather than scaling an overlay.

## Migration Plan

No stored-data migration is needed. Missing values initialize to landscape;
invalid values also fall back to landscape. Removing the change would allow
the unknown key to remain harmlessly until Reset Settings clears it.
