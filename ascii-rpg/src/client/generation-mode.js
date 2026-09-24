// Debugging switches never affect normal production gameplay.
export function isGenerationDiagnosticsEnabled({ development = import.meta.env?.DEV === true, search = globalThis.location?.search ?? "" } = {}) {
  return development || new URLSearchParams(search).get("generationDiagnostics") === "true";
}
