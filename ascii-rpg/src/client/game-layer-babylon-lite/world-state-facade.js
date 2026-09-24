// Public world boundary. Generation internals remain private to world-system;
// callers consume this stable facade while the implementation is decomposed.
export {
  createGeneratedSeed,
  createRandom,
  createWorld,
  createWorldCooperative,
  createWorldRealms,
  getRandomSeedFromSearch,
  getVisibleGlyph,
  getWorldGenerationLayersEnabledFromSearch,
  normalizePlayerMarkers,
  PROJECT_MAP_GLYPHS,
  PLAYER_GLYPH,
  GOLD_GLYPH,
  HEALTH_GLYPH,
  TRAP_GLYPH,
  CLOSED_CHEST_GLYPH,
  WALL_GLYPH,
  MOUNTAIN_GLYPH,
  TORCH_GLYPH,
  FIREPLACE_GLYPH,
  STAIR_GLYPH,
} from "./systems/world-system.js";
