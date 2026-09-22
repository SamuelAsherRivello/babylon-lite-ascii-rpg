import assert from "node:assert/strict";
import test from "node:test";
import { normalizeGenerationSettings } from "../../../src/client/ui-layer-react/generation-settings-store.js";

test("generation settings retain the ordered catalog and default malformed densities to Med", () => {
  const settings = normalizeGenerationSettings({
    passes: [
      { id: "water", density: "High" },
      { id: "cave-walls", density: "invalid" },
      { id: "unrecognized", density: "Low" },
    ],
  });

  assert.deepEqual(settings.passes.map((pass) => pass.order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(settings.passes.find((pass) => pass.id === "water").density, "High");
  assert.equal(settings.passes.find((pass) => pass.id === "cave-walls").density, "Med");
  assert.equal(settings.passes.find((pass) => pass.id === "enemy-spawner").density, "Med");
  assert.equal(settings.passes.find((pass) => pass.id === "player-position").configurable, false);
});
