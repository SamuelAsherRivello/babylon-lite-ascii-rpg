import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { startGameLayer } from "./game-layer.js";
import { sendFontSnapshot, sendPaletteSnapshot, sendTimeSnapshot, setGameController } from "./game-bridge.js";
import { getFontId, subscribeToFont } from "./font-store.js";
import { getPalette, subscribeToPalette } from "./palette-store.js";
import "./style.css";

const gameLayer = document.getElementById("game_layer");

void startGameLayer(gameLayer, getPalette(), getFontId())
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
    gameLayer.dataset.gameStatus = "unavailable";
    console.error(error);
  });

createRoot(document.getElementById("ui_layer")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
