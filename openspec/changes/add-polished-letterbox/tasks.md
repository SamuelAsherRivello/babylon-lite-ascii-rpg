# Tasks

## 1. Establish the owned presentation assets and layer

- [x] 1.1 Inspect the active `map.css` and responsive-layout working changes, then copy the confirmed Stealth & Steel backdrop and rail PNGs into a dedicated RPG source asset folder; verify both copied files are tracked project assets and no runtime URL references the other game.
- [x] 1.2 Add the independent presentation element as a sibling behind `#game_layer` and `#ui_layer`; verify it has no interactive semantics and cannot receive pointer input.

## 2. Render the desktop Portrait letterbox

- [x] 2.1 Add frame-relative backdrop, left rail, and horizontally mirrored right rail styling that reuses the current 9:16 Portrait frame measurements; verify the game frame and HUD dimensions are unchanged.
- [x] 2.2 Apply the established rail borders, inset finish, and outer drop shadows; verify the rails sit entirely outside the game frame and the background fills the variable left and right gutters.
- [x] 2.3 Gate the presentation to non-mobile Portrait mode only, preserving fullscreen and HUD-hidden visibility; verify landscape and coarse-pointer mobile Portrait do not render the presentation.
- [x] 2.4 Preserve natural viewport clipping for narrow desktop Portrait windows; verify artwork may leave the far outer edges while the 9:16 game frame neither shrinks nor receives an overlay.

## 3. Verify the presentation contract

- [x] 3.1 Add or update focused Node/source checks for the owned asset references, non-interactive layering, Portrait eligibility, and mobile/landscape exclusions; verify the affected checks pass without creating Playwright tests.
- [x] 3.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root; verify the results and distinguish unrelated pre-existing failures if present.
- [x] 3.3 Manually verify the served RPG in a non-mobile browser: landscape absent; Portrait visible; fullscreen Portrait visible; HUD-hidden Portrait visible; and a narrow Portrait viewport crops only outer art; verify game and HUD input remain usable.
- [ ] 3.4 Manually verify mobile/coarse-pointer Portrait fills its native viewport without gutters or rails; verify no mobile presentation regression.
