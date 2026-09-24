// Debugging switches never affect normal production gameplay.
export function isGenerationDiagnosticsEnabled({ development = import.meta.env?.DEV === true, search = globalThis.location?.search ?? "" } = {}) {
  const parameters = new URLSearchParams(search);
  return development || parameters.get("generationDiagnostics") === "true" || parameters.has("generationOverrides");
}

export function isGenerationUrlOverrideSession(search = globalThis.location?.search ?? "") {
  const parameters = new URLSearchParams(search);
  return parameters.get("generationDiagnostics") === "true" || parameters.has("generationOverrides");
}

// Format: generationOverrides=disable:7,11;low:8,16. Orders not listed keep
// their real persisted/bundled values, so this is safe for focused AI tests.
export function getGenerationOverridesFromSearch(search = globalThis.location?.search ?? "") {
  const value = new URLSearchParams(search).get("generationOverrides");
  if (!value) return undefined;
  const parseOrders = (text) => [...new Set(text.split(",").map((part) => Number.parseInt(part.trim(), 10)).filter((order) => Number.isInteger(order) && order > 0))];
  const overrides = {};
  for (const part of value.split(";")) {
    const [kind, orders] = part.split(":");
    if (["disable", "low"].includes(kind) && orders) overrides[kind] = parseOrders(orders);
  }
  return overrides.disable?.length || overrides.low?.length ? Object.freeze({
    disable: Object.freeze(overrides.disable ?? []),
    low: Object.freeze(overrides.low ?? []),
  }) : undefined;
}
