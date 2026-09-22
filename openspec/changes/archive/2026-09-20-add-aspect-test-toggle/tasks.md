# Tasks

## 1. Aspect setting and presentation framing

- [x] 1.1 Add a persisted two-state aspect setting to the React Settings UI, including the exact default label, tooltip, initial local-storage write, and Reset Settings behavior; verify with focused Node tests.
- [x] 1.2 Apply the selected aspect state to the game/UI presentation so landscape fills a wider-than-tall viewport, desktop portrait is a centered 9:16 frame, and mobile portrait fills its browser viewport; verify through focused Node tests and the existing build.

## 2. Agent guidance and regression coverage

- [x] 2.1 Update `AGENTS.md` to require the in-game aspect setting for agent-driven mobile-friendly testing instead of hardcoded browser dimensions or related screen-size workarounds; verify the guidance names both modes and the prohibition.
- [x] 2.2 Extend existing Node source/client regression checks for the setting label, persistence/reset contract, tooltip, and responsive framing markers; verify with `npm.cmd test`.
- [x] 2.3 Run `npm.cmd run build`, `openspec validate "add-aspect-test-toggle" --strict`, and `git diff --check`; verify all checks pass.
