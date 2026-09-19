# Design

## Context

See [proposal.md](proposal.md) for the user-facing problem. `App.jsx` owns the React Settings controls, `style.css` owns their presentation, and the Babylon Lite game layer receives setting changes through the existing bridge. The Settings corner is at the lower left with `pointer-events: auto`; its buttons include disabled Ambient and Zoom actions at their limits. The UI displays `R/M/F` on Torch and Player lighting and `O/B` on their separate Shadow controls. This work stays in the React UI layer.

## Goals / Non-Goals

**Goals:**

- Make one tooltip pattern usable by every Settings action, including disabled `+` and `-` buttons.
- Keep the short help readable near the hovered control at desktop and narrow viewport widths, without shifting the HUD.
- Keep descriptive text separate from the visible setting label and preserve the existing game bridge boundary.

**Non-Goals:**

- Change lighting formulas, profile values, camera modes, stored preferences, or the Windows launchers.
- Add a tooltip dependency or a new game-layer UI path.

## Decisions

### Use one lightweight React tooltip host

Keep the active help text and anchor rectangle as transient UI state in `App.jsx`. A small reusable wrapper around each Settings action supplies its description and receives hover events; wrapping the compact Ambient and Zoom buttons lets a disabled child still trigger help. Render one noninteractive tooltip host in the UI layer. Position it above the anchor when there is room, otherwise below, and clamp its horizontal position and width inside the viewport. Clear it when hover ends. Native `title` text was considered, but its timing, styling, and disabled-button behavior vary by browser; separate tooltip instances for every action add unnecessary duplicate state.

The tooltip host uses the existing dark/light HUD palette, wraps the longer lighting key, and has `pointer-events: none` so it cannot consume the click. The wrapper preserves each control's existing button element, id, visual label, and activation handler. Focus can show the same help when a control receives focus, without changing the current tab order.

### Centralize short copy in the UI layer

Define a shared `R Radius · M Maximum · F Falloff` key for Torch and Player lighting, and a shared `O Occlusion · B Bleed` key for Torch and Player Shadow. The surrounding sentence identifies the source and says the button cycles its profile. Fullscreen, Camera, Zoom, and Reset use short action phrases. Ambient increase and decrease each state the direction and `0 dark · 1 bright` scale. Expose the same description to assistive technology through the control's accessible description. The copy explains the current labels; it does not derive or alter lighting values.

## Risks / Trade-offs

- Long lighting help can overflow a small viewport → cap tooltip width, wrap the key, clamp placement, and manually inspect a narrow viewport.
- A disabled button cannot deliver ordinary pointer events → attach hover handling to its wrapper and keep the child disabled.
- Hover state can outlive a moved control or viewport resize → recompute placement while visible and clear it on pointer leave or component cleanup.

## Migration Plan

No saved data or API migration is needed. The UI addition can be reverted by removing the tooltip wrapper, host, and styles; setting state remains compatible.
