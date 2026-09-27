# Outdoor art trial

Open `Nature-and-Outdoor.tiled-project`, then `overworld-art-test.tmx` in Tiled 1.9 or newer. The `1. Grass and dirt` tileset exposes all 28 pieces from the supplied PNG: 18 square environment tiles and 10 centered props/objects.

`1. Grass and dirt.png` is 1672 by 941 pixels. The other nine numbered PNGs are each 1535 by 1024 pixels. These presentation sheets have title bands, transparent spacing, and irregular item sizes, so they are intentionally not declared as the dungeon's 32 by 32 grid.

Every tile uses a 212 by 212 source grid. Environment tiles are cropped tightly to their square artwork; props and objects are centered inside the same grid area. The dirt tile remains the exact 212 by 212 source rectangle at `(69,346)` that was used in the one-tile trial. The source PNG is not cropped, resampled, copied, or rewritten.

The finite map keeps its existing layer order and runtime isolation. It paints exactly one dirt tile in the upper-left cell of the visible Floor layer; every other layer and cell is empty. The browser renderer never reads this Tiled project or map.
