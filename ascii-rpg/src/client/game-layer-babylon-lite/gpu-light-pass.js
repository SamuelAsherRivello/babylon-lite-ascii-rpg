export const GPU_LIGHT_PASS_COLOR = Object.freeze([1, 0.38, 0.12]);
export const GPU_LIGHT_PASS_FALLOFF_EXPONENT = 3;

export function getGpuLightPassAlpha(distanceRatio) {
  const boundedDistance = Math.min(1, Math.max(0, distanceRatio));
  return boundedDistance >= 1 ? 0 : (1 - boundedDistance) ** GPU_LIGHT_PASS_FALLOFF_EXPONENT;
}

/**
 * Converts the already shadow-aware light contributions into screen-local
 * emission samples. It deliberately reads only the cached field: the visual
 * pass cannot change simulation, terrain, palette, or base glyph lighting.
 */
export function buildGpuLightPassSamples(region, lightField, ambient = 0, samples = []) {
  const headroom = Math.max(0, Math.min(1, 1 - ambient));
  let sampleCount = 0;
  for (let y = 0; y < region.rows; y += 1) {
    for (let x = 0; x < region.columns; x += 1) {
      const slot = y * region.columns + x;
      const torch = lightField.torchContributions?.[slot] ?? 0;
      const player = lightField.playerGpuDirectContributions?.[slot] ?? lightField.playerContributions?.[slot] ?? 0;
      const penumbra = lightField.playerGpuPenumbraContributions?.[slot] ?? 0;
      const intensity = Math.min(1, Math.max(0, torch, player, penumbra)) * headroom;
      if (intensity > 0) {
        const sample = samples[sampleCount] ?? {};
        sample.slot = slot;
        sample.x = x;
        sample.y = y;
        sample.intensity = intensity;
        samples[sampleCount] = sample;
        sampleCount += 1;
      }
    }
  }
  samples.length = sampleCount;
  return samples;
}

/** Creates a small, pre-blurred radial source texture for GPU additive blending. */
export function createGpuLightPassFrame(size = 64) {
  const pixels = new Uint8Array(size * size * 4);
  const center = (size - 1) / 2;
  const radius = Math.max(1, center);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const distance = Math.hypot(x - center, y - center) / radius;
      const alpha = Math.round(getGpuLightPassAlpha(distance) * 255);
      const offset = (y * size + x) * 4;
      pixels[offset] = 255;
      pixels[offset + 1] = 255;
      pixels[offset + 2] = 255;
      pixels[offset + 3] = alpha;
    }
  }
  return { name: "gpu-light-pass-glow", pixels, width: size, height: size };
}
