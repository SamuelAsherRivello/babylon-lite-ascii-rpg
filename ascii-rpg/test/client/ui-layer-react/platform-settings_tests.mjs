import test from "node:test";
import assert from "node:assert/strict";
import {
  getPlatformSettingsDefaults,
  getStoredInitialCameraMode,
  getStoredAspectMode,
  getStoredInitialZoom,
  getMigratedStoredZoomValue,
  getStoredZoomValue,
  isMobilePlatform,
  MOBILE_SETTINGS_DEFAULTS,
  PC_SETTINGS_DEFAULTS,
} from "../../../src/client/ui-layer-react/platform-settings.js";

const coarsePointer = (query) => ({ matches: query === "(pointer: coarse)" });
const finePointer = () => ({ matches: false });

test("selects platform defaults from the primary pointer capability", () => {
  assert.equal(isMobilePlatform(coarsePointer), true);
  assert.equal(isMobilePlatform(finePointer), false);
  assert.deepEqual(getPlatformSettingsDefaults(coarsePointer), MOBILE_SETTINGS_DEFAULTS);
  assert.deepEqual(getPlatformSettingsDefaults(finePointer), PC_SETTINGS_DEFAULTS);
});

test("uses mobile defaults only when zoom values are absent", () => {
  assert.equal(getStoredZoomValue(null, MOBILE_SETTINGS_DEFAULTS.zoom, 1, 10), MOBILE_SETTINGS_DEFAULTS.zoom);
  assert.equal(getStoredZoomValue("4", MOBILE_SETTINGS_DEFAULTS.zoom, 1, 10), 4);
  assert.equal(getMigratedStoredZoomValue("5", MOBILE_SETTINGS_DEFAULTS.zoom), 5);
  assert.equal(getMigratedStoredZoomValue("9", MOBILE_SETTINGS_DEFAULTS.zoom, "2"), 9);
});

test("uses platform camera defaults only when the preference is absent or invalid", () => {
  const emptyStorage = { getItem: () => null };
  const persistedStorage = { getItem: () => "lock" };
  const invalidStorage = { getItem: () => "unexpected" };

  assert.equal(getStoredInitialCameraMode({ storage: emptyStorage, matchMedia: coarsePointer }), "center");
  assert.equal(getStoredInitialCameraMode({ storage: emptyStorage, matchMedia: finePointer }), "deadzone");
  assert.equal(getStoredInitialCameraMode({ storage: persistedStorage, matchMedia: coarsePointer }), "lock");
  assert.equal(getStoredInitialCameraMode({ storage: invalidStorage, matchMedia: coarsePointer }), "center");
});

test("reads the persisted zoom for the initial game construction", () => {
  const desktopStorage = { getItem: () => null };
  const persistedStorage = {
    getItem(key) {
      return key === "babylon-lite-ascii-rpg.zoom" ? "7" : "2";
    },
  };

  assert.equal(getStoredInitialZoom({ storage: desktopStorage, matchMedia: finePointer }), PC_SETTINGS_DEFAULTS.zoom);
  assert.equal(getStoredInitialZoom({ storage: persistedStorage, matchMedia: finePointer }), 7);
});

test("defaults an absent or invalid aspect selection to landscape", () => {
  assert.equal(getStoredAspectMode(null), "landscape");
  assert.equal(getStoredAspectMode("unexpected"), "landscape");
  assert.equal(getStoredAspectMode("portrait"), "portrait");
});
