// Stable generation-layers boundary. The existing registry remains the single
// source of feature order, dependencies, realm scope, and semantic metadata.
export {
  GENERATION_FEATURES,
  GENERATION_DENSITY_DETAILS,
  GENERATION_PASS_DESCRIPTIONS,
  GENERATION_PASS_REALMS,
  GENERATION_SEMANTIC_CARDS,
  getGenerationSemanticCards,
  resolveGenerationPlan,
  validateGenerationRegistry,
} from "../world-feature-generation-registry.js";
