import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./runtime/ui-layer-react/App.jsx";
import { startGameLayer } from "./runtime/game-layer-babylon-lite/index.js";
import { getCameraModeSnapshot, getCombatStatsSnapshot, getExperienceSnapshot, getGoldSnapshot, getHealthSnapshot, getLogSnapshot, getPlayerDeadSnapshot, getQuestSnapshot, getRealmSnapshot, getStaminaSnapshot, sendCombatStatsSnapshot, sendExperienceSnapshot, sendFontSnapshot, sendGoldSnapshot, sendHealthSnapshot, sendLogSnapshot, sendMinimapZoomSnapshot, sendPaletteSnapshot, sendPlayerDeadSnapshot, sendQuestEvent, sendQuestSnapshot, sendRandomSeedSnapshot, sendRealmSnapshot, sendStaminaSnapshot, sendTimeSnapshot, setGameController } from "./runtime/bridge-layer/game-bridge.js";
import { fontReady, getFontId, subscribeToFont } from "./runtime/ui-layer-react/font-store.js";
import { getPalette, paletteReady, subscribeToPalette } from "./runtime/ui-layer-react/palette-store.js";
import "./runtime/ui-layer-react/styles.css";

const gameLayer = document.getElementById("game_layer");

void Promise.all([paletteReady, fontReady])
  .then(() => startGameLayer(gameLayer, getPalette(), getFontId(), getRealmSnapshot(), getCameraModeSnapshot()))
  .then((controller) => {
    setGameController(controller);
    controller.subscribeToMinimapZoom(sendMinimapZoomSnapshot);
    sendPaletteSnapshot(getPalette());
    sendFontSnapshot(getFontId());
    sendRandomSeedSnapshot(controller.getRandomSeed?.());
    sendTimeSnapshot(controller.getTime());
    controller.subscribeToTime((time) => sendTimeSnapshot(time));
    sendQuestSnapshot(controller.getQuestSnapshot?.());
    controller.subscribeToQuest?.((quest) => sendQuestSnapshot(quest));
    controller.subscribeToQuestEvent?.(sendQuestEvent);
    sendGoldSnapshot(controller.getGold?.() ?? getGoldSnapshot());
    controller.subscribeToGold?.((gold) => sendGoldSnapshot(gold));
    sendHealthSnapshot(controller.getHealth?.() ?? getHealthSnapshot());
    controller.subscribeToHealth?.((health) => sendHealthSnapshot(health));
    sendStaminaSnapshot(controller.getStaminaSnapshot?.() ?? getStaminaSnapshot());
    controller.subscribeToStamina?.(sendStaminaSnapshot);
    sendExperienceSnapshot(controller.getExperienceSnapshot?.() ?? getExperienceSnapshot());
    controller.subscribeToExperience?.(sendExperienceSnapshot);
    sendCombatStatsSnapshot(controller.getCombatStatsSnapshot?.() ?? getCombatStatsSnapshot());
    controller.subscribeToCombatStats?.(sendCombatStatsSnapshot);
    sendPlayerDeadSnapshot(controller.getPlayerDead?.() ?? getPlayerDeadSnapshot());
    controller.subscribeToPlayerDead?.(() => sendPlayerDeadSnapshot(controller.getPlayerDead?.() === true));
    sendLogSnapshot(controller.getLogSnapshot?.() ?? getLogSnapshot());
    controller.subscribeToLog?.((entries) => sendLogSnapshot(entries));
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
