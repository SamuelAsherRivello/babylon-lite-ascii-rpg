import bundledFont from "../game-layer-babylon-lite/data/font_data.json";
import {
  createFontConfig,
  DEFAULT_FONT_ID,
  FONT_STORAGE_KEY,
  validateFontId,
} from "../bridge-layer/font.js";

const channelName = "babylon-lite-ascii-rpg.font";
const listeners = new Set();
const fontChannel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(channelName);

function readStoredFont() {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(FONT_STORAGE_KEY);
    return stored ? createFontConfig(JSON.parse(stored)).fontId : null;
  } catch {
    return null;
  }
}

let savedFontId = readStoredFont() ?? createFontConfig(bundledFont).fontId ?? DEFAULT_FONT_ID;
let activeFontId = savedFontId;

function notify() {
  for (const listener of listeners) listener(activeFontId);
}

export function getFontId() {
  return activeFontId;
}

export function getSavedFontId() {
  return savedFontId;
}

export function subscribeToFont(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setActiveFont(fontId) {
  validateFontId(fontId);
  activeFontId = fontId;
  notify();
}

export function previewFont(fontId, broadcast = true) {
  setActiveFont(fontId);
  if (broadcast) fontChannel?.postMessage({ type: "font-preview", fontId });
}

export function restoreFontPreview(broadcast = true) {
  setActiveFont(savedFontId);
  if (broadcast) fontChannel?.postMessage({ type: "font-preview", fontId: savedFontId });
}

async function loadRemoteFont() {
  const response = await fetch(`/data/font_data.json?font=${Date.now()}`);
  if (!response.ok) throw new Error("Unable to reload the font configuration.");
  return createFontConfig(await response.json()).fontId;
}

export async function commitFont(fontId) {
  validateFontId(fontId);
  if (import.meta.env.DEV) {
    const response = await fetch("/__ascii_font", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fontId }),
    });
    if (!response.ok) throw new Error("The local font configuration could not be written.");
  } else {
    window.localStorage.setItem(FONT_STORAGE_KEY, JSON.stringify(createFontConfig({ fontId })));
  }
  savedFontId = fontId;
  setActiveFont(fontId);
  fontChannel?.postMessage({ type: "font-committed", fontId });
}

async function reloadAfterCommit(fontId) {
  try {
    const nextFontId = import.meta.env.DEV ? await loadRemoteFont() : readStoredFont() ?? fontId;
    savedFontId = validateFontId(nextFontId);
    setActiveFont(savedFontId);
  } catch {
    // Keep the last valid font when another instance cannot be reloaded.
  }
}

fontChannel?.addEventListener("message", (event) => {
  if (event.data?.type === "font-preview") {
    try { setActiveFont(event.data.fontId); } catch { /* Ignore invalid previews. */ }
  }
  if (event.data?.type === "font-committed") reloadAfterCommit(event.data.fontId);
});

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === FONT_STORAGE_KEY) reloadAfterCommit(readStoredFont() ?? DEFAULT_FONT_ID);
  });
}

export function resetFont() {
  savedFontId = DEFAULT_FONT_ID;
  setActiveFont(DEFAULT_FONT_ID);
}
