import bundledPalette from "../game-layer-babylon-lite/data/palette_data.json";
import {
  createPalette,
  createDefaultPalette,
  getPaletteStyle,
  getPaletteEntryId,
  isPaletteEntryCustomized,
  PALETTE_STORAGE_KEY,
  validatePaletteEntries,
} from "../bridge-layer/palette.js";

const channelName = "babylon-lite-ascii-rpg.palette";

function readLocalPalette() {
  if (import.meta.env.DEV || typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(PALETTE_STORAGE_KEY);
    return stored ? createPalette(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

let paletteEntries = readLocalPalette() ?? createPalette(bundledPalette);
const listeners = new Set();
const paletteChannel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(channelName);

export function getPalette() {
  return paletteEntries;
}

export function getPaletteEntry(entryId) {
  return paletteEntries.find((entry) => getPaletteEntryId(entry) === entryId) ?? null;
}

export function getStyleForGlyph(glyph) {
  return getPaletteStyle(paletteEntries, glyph);
}

export function isCustomized(entry) {
  return isPaletteEntryCustomized(entry);
}

export function subscribeToPalette(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function replacePalette(entries) {
  validatePaletteEntries(entries);
  paletteEntries = entries.map((entry) => ({ ...entry }));
  for (const listener of listeners) {
    listener(paletteEntries);
  }
}

function notifyPaletteChange() {
  paletteChannel?.postMessage({ type: "palette-changed" });
}

async function loadRemotePalette() {
  const response = await fetch(`/__ascii_palette?palette=${Date.now()}`);
  if (!response.ok) throw new Error("Unable to reload the palette file.");
  return createPalette(await response.json());
}

export const paletteReady = import.meta.env.DEV && typeof window !== "undefined"
  ? loadRemotePalette().then(replacePalette).catch(() => {})
  : Promise.resolve();

export async function commitPalette(entries) {
  validatePaletteEntries(entries);
  if (import.meta.env.DEV) {
    const response = await fetch("/__ascii_palette", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    });
    if (!response.ok) throw new Error("The local palette file could not be written.");
  } else {
    window.localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify({ version: 1, entries }));
  }
  replacePalette(entries);
  notifyPaletteChange();
}

async function reloadAfterNotification() {
  try {
    const nextPalette = import.meta.env.DEV ? await loadRemotePalette() : readLocalPalette();
    if (nextPalette) replacePalette(nextPalette);
  } catch {
    // Keep the last valid palette when another instance cannot be reloaded.
  }
}

paletteChannel?.addEventListener("message", (event) => {
  if (event.data?.type === "palette-changed") reloadAfterNotification();
});

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === PALETTE_STORAGE_KEY) reloadAfterNotification();
  });
}

export function resetPalette() {
  replacePalette(createDefaultPalette());
}
