import test from "node:test";
import assert from "node:assert/strict";
import {
  getPlatformSettingsDefaults,
  getStoredAspectMode,
  getStoredBooleanValue,
  getStoredZoomValue,
  isMobilePlatform,
  MOBILE_SETTINGS_DEFAULTS,
  PC_SETTINGS_DEFAULTS,
} from "../../../src/runtime/ui-layer-react/platform-settings.js";

const coarsePointer = (query) => ({ matches: query === "(pointer: coarse)" });
const finePointer = () => ({ matches: false });

test("selects platform defaults from the primary pointer capability", () => {
  assert.equal(isMobilePlatform(coarsePointer), true);
  assert.equal(isMobilePlatform(finePointer), false);
  assert.deepEqual(getPlatformSettingsDefaults(coarsePointer), MOBILE_SETTINGS_DEFAULTS);
  assert.deepEqual(getPlatformSettingsDefaults(finePointer), PC_SETTINGS_DEFAULTS);
});

test("uses mobile defaults only when zoom and HUD values are absent", () => {
  assert.equal(getStoredZoomValue(null, MOBILE_SETTINGS_DEFAULTS.zoom, 1, 10), 7);
  assert.equal(getStoredBooleanValue(null, MOBILE_SETTINGS_DEFAULTS.showHud), false);
  assert.equal(getStoredZoomValue("4", MOBILE_SETTINGS_DEFAULTS.zoom, 1, 10), 4);
  assert.equal(getStoredBooleanValue("true", MOBILE_SETTINGS_DEFAULTS.showHud), true);
});

test("defaults an absent or invalid aspect selection to landscape", () => {
  assert.equal(getStoredAspectMode(null), "landscape");
  assert.equal(getStoredAspectMode("unexpected"), "landscape");
  assert.equal(getStoredAspectMode("portrait"), "portrait");
});
