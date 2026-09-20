export const CAMERA_MODES = Object.freeze(["center", "deadzone", "lock"]);
export const DEFAULT_CAMERA_MODE = "lock";
export const CAMERA_STORAGE_KEY = "babylon-lite-ascii-rpg.camera-mode";
export const CAMERA_MODE_LABELS = Object.freeze({
  center: "CameraMode (Center)",
  deadzone: "CameraMode (Deadzone)",
  lock: "CameraMode (Lock)",
});

export function normalizeCameraMode(value) {
  return CAMERA_MODES.includes(value) ? value : DEFAULT_CAMERA_MODE;
}

export function getCameraModeLabel(mode) {
  return CAMERA_MODE_LABELS[normalizeCameraMode(mode)];
}

export function getNextCameraMode(mode) {
  const current = normalizeCameraMode(mode);
  return CAMERA_MODES[(CAMERA_MODES.indexOf(current) + 1) % CAMERA_MODES.length];
}
