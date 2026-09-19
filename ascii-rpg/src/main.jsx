import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./runtime/ui-layer-react/App.jsx";
import { startGameLayer } from "./runtime/game-layer-babylon-lite/index.js";
import { sendFontSnapshot, sendPaletteSnapshot, sendTimeSnapshot, setGameController } from "./runtime/bridge-layer/game-bridge.js";
import { fontReady, getFontId, subscribeToFont } from "./runtime/ui-layer-react/font-store.js";
import { getPalette, paletteReady, subscribeToPalette } from "./runtime/ui-layer-react/palette-store.js";
import "./runtime/ui-layer-react/style.css";

const gameLayer = document.getElementById("game_layer");

void Promise.all([paletteReady, fontReady])
  .then(() => startGameLayer(gameLayer, getPalette(), getFontId()))
  .then((controller) => {
    setGameController(controller);
    sendPaletteSnapshot(getPalette());
    sendFontSnapshot(getFontId());
    sendTimeSnapshot(controller.getTime());
    controller.subscribeToTime((time) => sendTimeSnapshot(time));
    subscribeToPalette(sendPaletteSnapshot);
    subscribeToFont(sendFontSnapshot);
  })
  .catch((error) => {
    if (error.name === "AbortError") return;
    gameLayer.dataset.gameStatus = "unavailable";
    console.error(error);
  });

createRoot(document.getElementById("ui_layer")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
