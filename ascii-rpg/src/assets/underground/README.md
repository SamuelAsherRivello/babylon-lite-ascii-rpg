# Underground terrain source

`walls_floor.png` is a byte-for-byte copy from the user's
`World_1_Realm_-1_TileSet/Tiled_files` pack. On 2026-09-26 the user confirmed
full rights to include the assets in the game and its public repository.
This records the user's confirmation, not a new license grant to third parties.

Phase 1 uses two 16 x 16 frames (zero-based pixel coordinates):

| Logical kind | Source x,y | Appearance |
| --- | --- | --- |
| wall | 32,64 | Dark rounded stone blocks |
| dirt | 128,224 | Lighter flat stone paving |

Runtime code imports this project-local PNG through Vite. No Downloads path,
symlink, TMX map, PSD, parser, or additional dependency is used at runtime.
The full sheet is retained for the later, separately gated art qualification.
