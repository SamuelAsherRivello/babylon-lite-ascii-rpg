# Outdoor art trial

Open `Nature-and-Outdoor.tiled-project`, then `overworld-art-test.tmx` in
Tiled 1.9 or newer. All ten external image-collection tilesets reference the
original PNGs in place. Tile 0 in each tileset displays the full source sheet
for inspection; these full-sheet tiles are not painted into the test map.

`1. Grass and dirt.png` is 1672 by 941 pixels. The other nine numbered PNGs
are each 1535 by 1024 pixels. Unlike the dungeon's 384 by 288 source with its
32-pixel grid, these are illustrated presentation sheets with headers and
irregular spacing. They do not share that grid.

The grass/dirt tileset additionally defines two 192 by 192 image subrectangles:

| Local tile ID | Region | X | Y | Width | Height |
| --- | --- | --- | --- | --- | --- |
| 1 | Grass interior | 80 | 116 | 192 | 192 |
| 2 | Dirt interior | 80 | 356 | 192 | 192 |

These interior bounds exclude the first swatches' beveled borders and sheet
labels. The original PNGs are not cropped, resampled, copied, or rewritten.
Tiled supports these regions through its tile `x`, `y`, `width`, and `height`
attributes: https://doc.mapeditor.org/en/stable/reference/tmx-map-format/#tile

The finite 12 by 8 map uses 192-pixel cells. Dirt contains grass with a short
dirt path; Water, Rocks, Vegetation, and Details are empty, in that order.
The runtime scales the same grass region to its existing cell size and applies
it only to walkable `grass` terrain in the `Overground` realm. It never reads
this Tiled project or map. Terrain identity and generation remain authoritative.
