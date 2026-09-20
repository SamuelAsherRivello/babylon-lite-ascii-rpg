# Tasks

## 1. Character model and UI bar contract

- [x] 1.1 Define the initial character data model with starting/current health, offense, defense, experience, gold, and carrying fields, and verify the model exposes 80%, 10%, 10%, 0%, `0`, and `0/0` initial values.
- [x] 1.2 Implement one reusable UI bar row driven by stat metadata, including current, pending, unfilled, label, glyph, and accessible progress semantics; verify all four bars use the same render path.
- [x] 1.2a Pass a base color into each UI bar and derive lighter delta and darker-but-not-black unfilled colors; verify the derived colors differ per bar and the unfilled colors are not `#000000`.
- [x] 1.3 Render the experience ordinal as `O1` and retain points-needed-for-next-level data; verify no leveling or update behavior is introduced.

## 2. Fixed-size character panel

- [x] 2.1 Replace the upper-left details placeholder with the Character panel and preserve the `Character` action label; verify its rendered width and height use the same square size as the minimap.
- [x] 2.2 Render gold and carrying resource rows with distinct text glyphs and the initial `0` and `0/0` values in the left two cells of a six-cell grid; render four empty `Slot 01`–`Slot 04` placeholders with no inventory logic.
- [x] 2.3 Add responsive containment rules for portrait and constrained landscape layouts; verify the panel contents remain inside the minimap-sized box without page overflow.

## 3. Verification

- [x] 3.1 Add or update focused static UI checks for the model values, four reusable bars, six glyphs, `Character` label, and fixed panel geometry.
- [x] 3.2 Run `npm.cmd test` from the repository root and verify the full Node suite passes.
- [x] 3.3 Run `npm.cmd run build` from the repository root and verify the Vite production build succeeds.
