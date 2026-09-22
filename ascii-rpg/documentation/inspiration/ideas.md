# Table of Contents

1. [Inspiration](#inspiration)
2. [Philosophy](#philosophy)
   1. [Embrace ASCII](#embrace-ascii)
      1. [DO](#do)
      2. [DON'T](#dont)
3. [Workflows](#workflows)
4. [Possible Features](#possible-features)

# Inspiration

- ASCII game inspiration: [watch video](https://www.youtube.com/watch?v=zjEDWA8uQEw)
- Dungeon management showcase: [watch video](https://www.youtube.com/watch?v=-JFaFDEq4e0)
- Gameplay systems reference: [watch video](https://www.youtube.com/watch?v=l7XApIq1x3w)
- Worldbuilding design reference: [watch video](https://www.youtube.com/watch?v=z4AKUS8xfMg)
- Combat design reference: [watch video](https://www.youtube.com/watch?v=SDAHRMDgqto)
- Visual style reference: [watch video](https://www.youtube.com/watch?v=pKw3U0gc-kA)
- OneBit Adventure reference: [view app](https://play.google.com/store/apps/details?id=com.GalacticSlice.OneBitAdventure)
- ASCII gameplay reference: [watch video](https://www.youtube.com/watch?v=QyBw8k6g6VU)
- Gameplay inspiration reference: [watch video](https://www.youtube.com/watch?v=VPvqiTWpDII)

# Philosophy

## Embrace ASCII

Maybe: Embrace the limitations of ASCII instead of trying to subvert them by breaking the illusion.

### DO

- Keep artwork aligned to a consistent character grid.
- Use ASCII glyphs as the primary language for characters, environments, effects, and UI.
- Make movement, scale, and rotation feel intentional within the grid.
- Express lighting and shadows through readable glyphs and contrast.
- Let ASCII limitations shape the gameplay, atmosphere, and interface.

### DON'T

- Using smooth, high-resolution artwork that does not follow the character grid.
- Rendering non-ASCII sprites, particles, or effects that clash with the glyph language.
- Allowing subpixel movement, rotation, or scaling that makes the grid feel incidental.
- Adding camera shakes, zooms, or transitions that ignore the established grid rhythm.
- Using lighting and shadows that imply more geometry than the ASCII symbols communicate.

# Possible Features

## Good First Tasks

- Achievements. ☐
- Audio. ☐
- Attack. ☐
- Character relationships. ☐
- Day-and-night cycles. ☑
- Developer-facing game map. ☑
- Dicerolls for actions. ☐
- Difficulty settings. ☐
- Enemy factions. ☐
- Fireplaces are checkpoints - die and return here. ☐
- Idle. ☐
- Move. ☐
- Save points and campfires. ☐
- Secret passages. ☐
- Status effects and conditions. ☐
- Take damage. ☐
- Tutorial. ☑
- Tutorial - add as a quest too. ☐
- User Settings. ☐
    - Clear Storage. ☐
    - Music control. ☐
    - SFX control. ☐
- User-facing game map. ☐
- View toggles (env only, enemies only, items only). ☐

1. Add text log. ☑
2. Audio. ☐
3. Difficulty settings. ☐
4. Environmental storytelling. ☐
5. Equipment durability. ☐
6. Experience and leveling.
    - XP - Earning. ☑
    - XP - Spending. ☐
7. Fog of war. ☑
8. Lighting and darkness mechanics. ☑
9. Minimap. ☑
10. Multiple endings. ☐
11. Multiple playable characters. ☐
12. Overarching story. ☐
13. Permadeath mode. ☐
14. Reputation with factions. ☐
15. Save points and campfires. ☐
    - Fireplaces are checkpoints - die and return here. ☐
16. Secret passages. ☐
17. Skill trees. ☐
18. View toggles (env only, enemies only, items only). ☐

## Animations

- Use x/y/scale/rotation to procedurally animate. ☐
- Idle. ☐
- Move. ☐
- Attack. ☐
- Take damage. ☐

## Database Integration

19. Supabase database. ☐
    - Cloud-synced world events. ☐
    - Highscore tables / speed runs. ☐
    - Player progress. ☐
    - Player settings and preferences. ☐
    - Save game (3 slots). ☐

## BIS integration ("Blockchain")

20. Achievements. ☐
21. Arcade assets. ☐
22. Arcade inventory. ☐
23. Arcade weapons. ☐

## Enemies

24. Boss phases. ☐
25. Dicerolls for actions. ☐
26. Enemies. ☑
27. Enemy factions. ☐
28. Melee combat. ☑
29. Ranged combat. ☐
30. Separate combat screen that opens for significant boss battles, with a different gameplay look and feel. ☐
31. Status effects and conditions. ☐

## NPCs

32. Character relationships. ☐
33. Companion loyalty systems. ☐
34. NPC pet that follows the player. ☐
35. Shops. ☐
36. Spoken Dialog prompt. ☐
    - Sign posts in the world. ☐
    - NPC static dialog "Hello!". ☐
    - NPC dialog trees with user choices. ☐
37. Traveling in a group of NPCs. ☐

## Objects and pickups

38. Add health item and log it. ☑
39. Add trap that damages health and log it. ☑
40. Boats and rafts that can float on water. ☐
41. Bombs. ☐
42. Disguises and disguisable identities. ☐
43. Door and key puzzles. ☑
44. Gold. ☑
45. Hidden treasure maps. ☐
46. Items and inventory. ☐
47. Man-made environments such as houses, homes, and buildings that can be entered. ☐
48. Pick axes. ☐
49. Spawn a few health items and traps around the world. ☑
50. Weapons and armor. ☐

## Player activities

51. Character building with traits. ☐
52. Cooking recipes. ☐
53. Crafting. ☐
54. Digging. ☐
55. Farming and gardening. ☐
56. Fishing. ☐
57. Magic spells. ☐
58. Minigames. ☐
59. Quests. ☑
60. Resource gathering. ☐
61. Stealing items. ☐
62. Terraforming. ☐
63. Update log for coin collection. ☑
64. Update log for realm entry. ☑
65. Vehicles. ☐
66. Working (Chop trees for wood, mine rocks for ore). ☐

## Procedural level generation

67. Day-and-night cycles. ☑
68. Overworld vs. world vs. underground. ☑
69. Procedural cafes. ☑
70. Procedural dungeons. ☐
71. Randomly generated story points. ☐
72. Weather that affects gameplay. ☐
