const SURFACES = Object.freeze(["world", "minimap"]);

export function createVisualInvalidation() {
  const revisions = { world: 0, minimap: 0 };

  return Object.freeze({
    invalidate({ player = false, viewport = false, fog = false, lighting = false, palette = false, markers = false, gpuEffect = false } = {}) {
      const world = player || viewport || fog || lighting || palette || gpuEffect;
      const minimap = player || viewport || fog || palette || markers || gpuEffect;
      if (world) revisions.world += 1;
      if (minimap) revisions.minimap += 1;
      return Object.freeze({ ...revisions });
    },
    snapshot() { return Object.freeze({ ...revisions }); },
    changedSince(previous = {}) {
      return Object.freeze(Object.fromEntries(SURFACES.map((surface) => [surface, revisions[surface] !== previous[surface]])));
    },
  });
}
