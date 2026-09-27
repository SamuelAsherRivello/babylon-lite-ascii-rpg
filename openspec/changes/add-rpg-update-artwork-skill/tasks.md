# Tasks

## 1. Create the global skill

- [x] 1.1 Initialize `C:\Users\srive\.codex\skills\rpg-update-artwork\` with the skill creator and verify it contains `SKILL.md` and `agents/openai.yaml`.
- [x] 1.2 Write discriminating metadata for the `rpg-update-artwork` name and its existing-concept plus asset-path inputs; verify the default prompt invokes `$rpg-update-artwork`.

## 2. Capture the artwork workflow

- [x] 2.1 Document repository discovery for catalog semantics, generation pass, world renderer, and Procedural preview; verify the instructions require preserving gameplay and explicitly separate HUD uses by default.
- [x] 2.2 Document static, stateful-static, and animated-strip routes; verify the animated route covers frame-layout inspection, visible-region reconciliation, and shared-clock lifecycle.
- [x] 2.3 Document renderer-key and legacy-glyph safeguards; verify the instructions require supplied artwork in both live game and enabled generation preview, with no marker when the layer is disabled.

## 3. Validate and hand off

- [x] 3.1 Run `quick_validate.py` for the global skill and verify the result reports a valid skill with no scaffold placeholders.
- [x] 3.2 Review the skill against a static concept request and an animated concept request; verify each identifies an exact asset, preserves gameplay semantics, and requires fixed-seed browser verification.

## Validation notes

- Created the planned global skill with the skill-creator initializer, reusing
  the existing `.agents/skills/rpg-update-artwork/SKILL.md` instructions and
  adding explicit `randomSeed`, animation-clock cleanup/re-entry checks, and
  the Playwright test-file boundary. The existing `.agents` copy is unchanged.
- `quick_validate.py` reports `Skill is valid!`; generated metadata invokes
  `$rpg-update-artwork`, and no scaffold placeholders remain.
- `openspec validate add-rpg-update-artwork-skill --type change --strict` passes.
- Static walkthrough: a Health request supplying
  `ascii-rpg/public/assets/images/Dungeons-and-Pixels-v1.4/Items/Static/health_potion.png`
  resolves an exact raster, preserves pickup effects, density, seeded placement,
  and the separate HUD heart, and requires live/preview/disabled-layer checks
  with `?randomSeed=artwork-check`.
- Animated walkthrough: a Torch request supplying
  `ascii-rpg/public/assets/images/Dungeons-and-Pixels-v1.4/Props/Animated/torch_strip.png`
  resolves an exact strip, requires frame-layout and timing inspection, preserves
  generation and gameplay semantics, and checks visible-region reconciliation,
  shared-clock stop/disposal/re-entry, and a cropped preview frame using the same
  fixed-seed verification. An ambiguous asset directory requires exact-file input.
- These are instruction walkthroughs, not artwork replacements or browser runs.
  No game source or dependencies were changed by this implementation.