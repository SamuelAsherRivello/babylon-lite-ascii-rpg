import test from "node:test";
import assert from "node:assert/strict";
import { getCharacterSlotPresentation, INITIAL_CHARACTER } from "../../../src/client/ui-layer-react/character-data.js";

test("character slot presentation shows an initial bomb stack without durability", () => {
  const presentation = getCharacterSlotPresentation(INITIAL_CHARACTER.slots[3], "Slot 04");
  assert.deepEqual(presentation, { glyph: "●", count: 50, showHealth: false });
});

test("character slot presentation follows bomb count changes, including zero", () => {
  const bomb = INITIAL_CHARACTER.slots[3];
  assert.equal(getCharacterSlotPresentation({ ...bomb, count: 49 }, "Slot 04").count, 49);
  assert.deepEqual(getCharacterSlotPresentation({ ...bomb, count: 0 }, "Slot 04"), { glyph: "●", count: 0, showHealth: false });
});
