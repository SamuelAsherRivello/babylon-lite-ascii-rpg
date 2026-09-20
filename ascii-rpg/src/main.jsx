import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./runtime/ui-layer-react/App.jsx";
import { startGameLayer } from "./runtime/game-layer-babylon-lite/index.js";
import { getGoldSnapshot, getQuestSnapshot, getRealmSnapshot, sendFontSnapshot, sendGoldSnapshot, sendMinimapZoomSnapshot, sendPaletteSnapshot, sendQuestSnapshot, sendRealmSnapshot, sendTimeSnapshot, setGameController } from "./runtime/bridge-layer/game-bridge.js";
import { fontReady, getFontId, subscribeToFont } from "./runtime/ui-layer-react/font-store.js";
import { getPalette, paletteReady, subscribeToPalette } from "./runtime/ui-layer-react/palette-store.js";
import "./runtime/ui-layer-react/styles.css";

const gameLayer = document.getElementById("game_layer");

void Promise.all([paletteReady, fontReady])
  .then(() => startGameLayer(gameLayer, getPalette(), getFontId(), getRealmSnapshot()))
  .then((controller) => {
    setGameController(controller);
    controller.subscribeToMinimapZoom(sendMinimapZoomSnapshot);
    sendPaletteSnapshot(getPalette());
    sendFontSnapshot(getFontId());
    sendTimeSnapshot(controller.getTime());
    controller.subscribeToTime((time) => sendTimeSnapshot(time));
    sendQuestSnapshot(controller.getQuestSnapshot?.());
    controller.subscribeToQuest?.((quest) => sendQuestSnapshot(quest));
    sendGoldSnapshot(controller.getGold?.() ?? getGoldSnapshot());
    controller.subscribeToGold?.((gold) => sendGoldSnapshot(gold));
    sendRealmSnapshot(controller.getRealm());
    controller.subscribeToRealm((realm) => sendRealmSnapshot(realm));
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
