# Tasks

## 1. Tooltip content and presentation

- [x] 1.1 Define concise Settings help text in the React UI layer, with shared `R Radius / M Maximum / F Falloff` and `O Occlusion / B Bleed` keys and the Ambient `0 dark / 1 bright` scale; verify each phrase matches its current control action and the tooltip spec.
- [x] 1.2 Add one reusable tooltip host and hoverable action wrapper in `App.jsx`, including wrappers for disabled controls; verify a hovered action shows its text and leaving it hides the text.
- [x] 1.3 Style and position the tooltip in `style.css` without changing the Settings layout or intercepting clicks; verify the long lighting key wraps and the tooltip remains within both desktop and narrow viewports.

## 2. Settings integration

- [x] 2.1 Apply tooltip help and accessible descriptions to Fullscreen, Camera, Torch and Player lighting, Torch and Player Shadow, and Reset Settings; verify each control keeps its current visible label and still performs its existing action.
- [x] 2.2 Apply action-specific help to Ambient and Zoom `+` and `-`; verify both directions display the correct explanation, including while a button is disabled at its limit.

## 3. Verification

- [x] 3.1 Run `npm.cmd test` and `npm.cmd run build` from the repository root; verify both complete successfully.
- [x] 3.2 Manually hover every Settings action in the running browser, leave each action, and activate representative controls at desktop and narrow widths; verify the explanations, viewport placement, existing setting behavior, and disabled-button help match the spec.
