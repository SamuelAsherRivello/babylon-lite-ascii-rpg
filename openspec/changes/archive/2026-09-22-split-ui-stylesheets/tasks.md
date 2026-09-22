# Tasks

## 1. Establish the stylesheet ownership layout

- [x] 1.1 Replace the provisional feature stylesheet names with `character.css`, `map.css`, `hud.css`, `windows.css`, and `toasts.css`, and verify all six expected files exist under `ascii-rpg/src/client/ui-layer-react/`.
- [x] 1.2 Rename the entry point to `styles.css`, update its ordered imports, and verify `ascii-rpg/src/main.jsx` imports only `styles.css`.

## 2. Move CSS rules without changing behavior

- [x] 2.1 Move character bars, slots, resources, and character detail rules into `character.css`, then verify their selectors and declarations remain unchanged.
- [x] 2.2 Move canvas, transition, minimap, presentation frame, and map-related responsive rules into `map.css`, then verify map selectors and declarations remain unchanged.
- [x] 2.3 Move corners, HUD blocks, quest tracker, links, settings, and zoom controls into `hud.css`, leaving variables and genuinely shared catch-all rules in `styles.css`.
- [x] 2.4 Keep lighting, tutorial, prompt, palette, and font editor window rules in `windows.css`, and verify modal/editor selectors remain available.
- [x] 2.5 Move toast layout, animation, reduced-motion, orientation, and portrait rules into `toasts.css`, and verify toast selectors and keyframes remain available.

## 3. Update checks and validate the bundle

- [x] 3.1 Update the stylesheet test helper to read the six-file bundle and verify all existing stylesheet contract assertions still pass.
- [ ] 3.2 Run `npm.cmd test` from the repository root and verify the complete test suite passes.
- [x] 3.3 Run `npm.cmd run build` from the repository root and verify the GitHub Pages Vite build succeeds.
- [x] 3.4 Run `git diff --check` and verify no whitespace errors or unrelated file changes are introduced by this refactor.
