import test from "node:test";
import assert from "node:assert/strict";
import {
  getPlatformSettingsDefaults,
  getStoredShowHud,
  getStoredAspectMode,
  getStoredBooleanValue,
  getMigratedStoredZoomValue,
  getStoredZoomValue,
  initializeHudHiddenDataset,
  isMobilePlatform,
  MOBILE_SETTINGS_DEFAULTS,
  PC_SETTINGS_DEFAULTS,
  SHOW_UI_STORAGE_KEY,
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
  assert.equal(getStoredZoomValue(null, MOBILE_SETTINGS_DEFAULTS.zoom, 1, 10), MOBILE_SETTINGS_DEFAULTS.zoom);
  assert.equal(getStoredBooleanValue(null, MOBILE_SETTINGS_DEFAULTS.showHud), false);
  assert.equal(getStoredZoomValue("4", MOBILE_SETTINGS_DEFAULTS.zoom, 1, 10), 4);
  assert.equal(getMigratedStoredZoomValue("5", MOBILE_SETTINGS_DEFAULTS.zoom), 5);
  assert.equal(getMigratedStoredZoomValue("9", MOBILE_SETTINGS_DEFAULTS.zoom, "2"), 9);
  assert.equal(getStoredBooleanValue("true", MOBILE_SETTINGS_DEFAULTS.showHud), true);
});

test("initializes the HUD hidden dataset from the persisted developer setting", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null };
  const documentRef = { documentElement: { dataset: {} } };

  initializeHudHiddenDataset(documentRef, storage, finePointer);
  assert.equal(documentRef.documentElement.dataset.hudHidden, "true");

  values.set(SHOW_UI_STORAGE_KEY, "true");
  initializeHudHiddenDataset(documentRef, storage, finePointer);
  assert.equal(documentRef.documentElement.dataset.hudHidden, "false");

  values.set(SHOW_UI_STORAGE_KEY, "false");
  initializeHudHiddenDataset(documentRef, storage, finePointer);
  assert.equal(documentRef.documentElement.dataset.hudHidden, "true");
  assert.equal(getStoredShowHud(storage, finePointer), false);
});

test("defaults an absent or invalid aspect selection to landscape", () => {
  assert.equal(getStoredAspectMode(null), "landscape");
  assert.equal(getStoredAspectMode("unexpected"), "landscape");
  assert.equal(getStoredAspectMode("portrait"), "portrait");
});
