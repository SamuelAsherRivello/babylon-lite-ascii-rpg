# Tasks

## 1. Create the global skill

- [ ] 1.1 Initialize `C:\Users\srive\.codex\skills\rpg-update-artwork\` with the skill creator and verify it contains `SKILL.md` and `agents/openai.yaml`.
- [ ] 1.2 Write discriminating metadata for the `rpg-update-artwork` name and its existing-concept plus asset-path inputs; verify the default prompt invokes `$rpg-update-artwork`.

## 2. Capture the artwork workflow

- [ ] 2.1 Document repository discovery for catalog semantics, generation pass, world renderer, and Procedural preview; verify the instructions require preserving gameplay and explicitly separate HUD uses by default.
- [ ] 2.2 Document static, stateful-static, and animated-strip routes; verify the animated route covers frame-layout inspection, visible-region reconciliation, and shared-clock lifecycle.
- [ ] 2.3 Document renderer-key and legacy-glyph safeguards; verify the instructions require supplied artwork in both live game and enabled generation preview, with no marker when the layer is disabled.

## 3. Validate and hand off

- [ ] 3.1 Run `quick_validate.py` for the global skill and verify the result reports a valid skill with no scaffold placeholders.
- [ ] 3.2 Review the skill against a static concept request and an animated concept request; verify each identifies an exact asset, preserves gameplay semantics, and requires fixed-seed browser verification.
