export function initializeDynamicGenerationFeatures(generationPlan, initializers) {
  generationPlan
    .filter((feature) => feature.owner === "dynamic" && feature.enabled)
    .sort((left, right) => left.order - right.order)
    .forEach((feature) => initializers[feature.id]?.());
}
