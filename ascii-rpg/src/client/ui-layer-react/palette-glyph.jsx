import { useEffect, useRef } from "react";
import { createGlyphRasterCanvas, rasterizeCompositeGlyph, getGlyphRasterSize } from "../game-layer-babylon-lite/glyph-visual-cache.js";
import { colorToLinearRgba } from "../game-layer-babylon-lite/palette-color-cache.js";
import { DEFAULT_ZOOM } from "../game-layer-babylon-lite/zoom-scale.js";

export function PaletteGlyph({ glyph, color, fontFamily, offsets = null, backgroundDarkness = 50 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const size = getGlyphRasterSize(DEFAULT_ZOOM, 32);
    const raster = rasterizeCompositeGlyph(glyph, fontFamily, size, colorToLinearRgba({ color, alpha: 1 }), backgroundDarkness, offsets ?? undefined);
    canvas.width = raster.width;
    canvas.height = raster.height;
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(createGlyphRasterCanvas(raster), 0, 0);
    return undefined;
  }, [backgroundDarkness, color, fontFamily, glyph, offsets?.offsetScale, offsets?.offsetX, offsets?.offsetY]);
  return <canvas ref={canvasRef} className="palette_glyph_canvas" aria-label={glyph} />;
}
