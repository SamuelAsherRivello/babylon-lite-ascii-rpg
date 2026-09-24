# Spec Delta

## MODIFIED Requirements

### Requirement: Complete visible glyph inventory

The palette SHALL contain one entry for every visible Code Page 437 value from 32 through 254, one entry for the Unicode bullet `•` (U+2022), and the following 65 text-style Unicode symbols:

- Arrows: `↑ ↓ ← → ↖ ↗ ↘ ↙ ↔ ↕ ⇧ ⇩ ↩ ↪`
- Suits and hearts: `♥ ♡ ♦ ♢ ♣ ♧ ♠ ♤`
- Map shapes and markers: `◇ ◆ ▲ ▼ △ ▽ ○ ● ◉ ◎ ⊙ ⌖ ⌑ ☆ ★ ✦ ✧ ✶`
- Nature and music: `♪ ♫ ☼ ☀ ☾ ☽ ☁ ☂ ☃ ❄ ♨`
- Gameplay symbols: `⚔ ⚒ ⚙ ⚑ ⚐ ⚠ ☠ ☘ ⚖ ⚗ ⚕ ✝ ☯ ☺`

Every entry SHALL expose its numeric or Unicode identity and its rendered glyph value. The game SHALL be permitted to use any entry without an allow-list.

#### Scenario: Code Page 437 inventory
- **WHEN** the palette is loaded
- **THEN** every value from 32 through 254 SHALL be present exactly once

#### Scenario: Bullet inventory
- **WHEN** the palette is loaded
- **THEN** the bullet entry U+2022 SHALL be present even though it is not a standard ASCII or Code Page 437 value

#### Scenario: Text symbol inventory
- **WHEN** the palette is loaded
- **THEN** all 65 text-style symbols SHALL be present exactly once with Unicode identities and default white styling unless customized

#### Scenario: Existing palette migration
- **WHEN** a palette saved before the NPC glyph was introduced is loaded
- **THEN** its existing styles SHALL be preserved and the `☺` entry SHALL be added with default white styling

### Requirement: Player, enemy, and spawner glyph palette coverage

The ASCII Palette SHALL retain entries for the `🤺` Player, `🕷️` Enemy, uppercase `S` Enemy Spawner, and `☺` NPC glyphs. It SHALL assign an explicit yellow base color for Player rendering and explicit red base colors for Enemy and Enemy Spawner rendering. The NPC entry SHALL expose the normal editable base-color control. Client lighting MAY adjust visible brightness, but every actor identity SHALL remain palette-driven.

#### Scenario: Player glyph is yellow
- **WHEN** the visible player renders as `🤺`
- **THEN** its base color SHALL come from the yellow `🤺` palette entry

#### Scenario: Enemy glyph is red
- **WHEN** a visible enemy renders as `🕷️`
- **THEN** its base color SHALL come from the red `🕷️` palette entry

#### Scenario: Spawner glyph is red
- **WHEN** a visible enemy spawner renders as `S`
- **THEN** its base color SHALL come from the red `S` palette entry

#### Scenario: NPC glyph color is editable
- **WHEN** a developer confirms a base-color edit for `☺` in Ascii Settings
- **THEN** visible NPCs SHALL render with the confirmed palette color and active client lighting
