# Blue Water Tile Audit

## Approved runtime source

- PNG: `ascii-rpg/public/assets/images/Dungeons-and-Pixels-v1.4/Tilesets/Tileset_Dungeon.png`
- Tiled descriptor: `ascii-rpg/public/assets/images/Dungeons-and-Pixels-v1.4/Tiled_Examples/Tilesets/Tileset_Dungeon.tsx`
- Sheet geometry: 384 x 288px, 12 columns, 32 x 32px tiles, zero-based IDs.

## Selected animation

The blue water sequence starts at Tiled tile ID 79 and has four 400ms frames:

| Frame | Tile ID | Source rectangle |
| --- | ---: | --- |
| 0 | 79 | `(224, 192, 32, 32)` |
| 1 | 80 | `(256, 192, 32, 32)` |
| 2 | 81 | `(288, 192, 32, 32)` |
| 3 | 82 | `(320, 192, 32, 32)` |

`Tileset_Dungeon.tsx` declares this as the animation beginning at ID 79 with a
400ms duration for each frame. The neighboring animated sequences beginning at
IDs 67 and 91 are green and red respectively; neither is referenced at runtime.

## Attribution / distribution record

The source sheet and its Tiled descriptor were already checked into this
project under `Dungeons-and-Pixels-v1.4/`. No license or attribution manifest
is present in that supplied folder. This implementation copies no asset and
uses the same project-local sheet already approved for the existing dungeon
terrain presentation; an external redistribution or licensing claim is not
made by this audit.
