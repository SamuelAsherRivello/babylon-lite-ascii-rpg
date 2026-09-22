# Tasks

## 1. Establish the shared responsive foundation

- [ ] 1.1 Inspect the active `App.jsx` and `windows.css` diff, preserve unrelated in-progress work, and inventory every React-owned UI surface and stylesheet before editing; verify the implementation scope is limited to the responsive layout change.
- [ ] 1.2 Define the shared CSS viewport tokens for presentation inset, panel bounds, typography, spacing, controls, and safe visible height in the React style entry point; verify no layout branch reads, persists, or selects behavior from device pixel ratio or Windows display scale.
- [ ] 1.3 Update the React presentation-frame and overlay bounds to use the shared tokens while retaining the existing desktop-portrait and coarse-pointer-mobile behavior; verify the game canvas remains behind a bounded UI layer in landscape and portrait.

## 2. Rebuild the persistent HUD for resilient density

- [ ] 2.1 Update `HudLayouts.jsx` and `hud.css` only where needed to give all four corner roles bounded grid/flex layout behavior; verify the 100%-zoom desktop baseline retains matching Character/minimap panels, established corner roles, and a clear central world area.
- [ ] 2.2 Rework Character-panel sizing and its two-by-three resource grid with normal grid tracks and square aspect-ratio cells; verify five bars plus all six cells remain square, contained, and onscreen at constrained dimensions without `100cqh` size-container collapse.
- [ ] 2.3 Update minimap, quest, project/developer, world-status, log, settings, and zoom-control styles to compact or internally scroll before clipping; verify all visible controls remain reachable without document-level horizontal overflow at 80%, 100%, and 125% Chrome zoom.

## 3. Apply the same rules to React-owned transient surfaces

- [ ] 3.1 Update `windows.css` and related React markup for dialogs, palette/font/editor, gameplay/procedural, tutorial/death, lighting, and map controls to use the shared inset and bounded internal-scroll rules; verify every open surface retains its title and required close, confirm, or cancel action at 125% zoom and portrait dimensions.
- [ ] 3.2 Update tooltip, toast, and floating-text placement styles so transient UI remains inside the active presentation and does not block its invoking control; verify edge-positioned transient surfaces remain readable and dismissible.
- [ ] 3.3 Audit each imported React stylesheet (`styles.css`, `hud.css`, `character.css`, `map.css`, `windows.css`, `toasts.css`, and `floating-text.css`) for fixed geometry that violates the shared layout contract; verify each retained fixed value is intentional visual detail rather than a viewport assumption.

## 4. Validate the responsive contract

- [ ] 4.1 Add or update focused Node/source tests for the responsive layout tokens, Character square-grid contract, and absence of device-pixel-ratio layout branching; verify the affected test files pass.
- [ ] 4.2 Run `npm.cmd test` and `npm.cmd run build`; verify the results and distinguish any pre-existing unrelated failures from this change.
- [ ] 4.3 Manually verify the local game in Chrome at 80%, 100%, and 125% zoom, using the preferred 100% landscape capture as the visual reference; verify no required control is clipped, overlapped, or causes horizontal page overflow.
- [ ] 4.4 Manually verify a compact 1366 x 768 desktop viewport and a 440 x 956 high-density portrait viewport, including an opened editor or lighting window; verify the world fills its presentation and every required React surface remains usable.
