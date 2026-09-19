import assert from "node:assert/strict";
import test from "node:test";
import {
  createFontConfig,
  DEFAULT_FONT_ID,
  FONT_OPTIONS,
  getFontOption,
  serializeFontConfig,
  validateFontId,
} from "../../../src/runtime/bridge-layer/font.js";

test("defines exactly five stable font choices and a default", () => {
  assert.equal(FONT_OPTIONS.length, 5);
  assert.equal(DEFAULT_FONT_ID, "monospace");
  assert.ok(getFontOption(DEFAULT_FONT_ID));
  assert.deepEqual(FONT_OPTIONS.map(({ label }) => label), [
    "Monospace",
    "Consolas",
    "Courier New",
    "Lucida Console",
    "System Monospace",
  ]);
});

test("validates and serializes font configuration", () => {
  assert.equal(validateFontId("consolas"), "consolas");
  assert.deepEqual(createFontConfig({ fontId: "courier-new" }), { version: 1, fontId: "courier-new" });
  assert.equal(JSON.parse(serializeFontConfig("lucida-console")).fontId, "lucida-console");
  assert.throws(() => validateFontId("not-a-font"), /not supported/);
  assert.throws(() => createFontConfig({ fontId: "" }), /not supported/);
});
