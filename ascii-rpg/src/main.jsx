import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./client/ui-layer-react/App.jsx";
import { startGameLayer } from "./client/game-layer-babylon-lite/index.js";
import { getCameraModeSnapshot, getCombatStatsSnapshot, getExperienceSnapshot, getGoldSnapshot, getHealthSnapshot, getLogSnapshot, getPlayerDeadSnapshot, getQuestSnapshot, getRealmDiscoverySnapshot, getRealmSnapshot, getStaminaSnapshot, sendCombatStatsSnapshot, sendExperienceSnapshot, sendFontSnapshot, sendGoldSnapshot, sendHealthSnapshot, sendLogSnapshot, sendMinimapZoomSnapshot, sendPaletteSnapshot, sendPlayerDeadSnapshot, sendQuestEvent, sendQuestSnapshot, sendRandomSeedSnapshot, sendRealmDiscoverySnapshot, sendRealmSnapshot, sendStaminaSnapshot, sendTimeSnapshot, setGameController } from "./client/bridge-layer/game-bridge.js";
import { fontReady, getFontId, subscribeToFont } from "./client/ui-layer-react/font-store.js";
import { getPalette, paletteReady, subscribeToPalette } from "./client/ui-layer-react/palette-store.js";
import { generationSettingsReady, getGenerationSettings } from "./client/ui-layer-react/generation-settings-store.js";
import "./client/ui-layer-react/styles.css";

const gameLayer = document.getElementById("game_layer");
void Promise.all([paletteReady, fontReady, generationSettingsReady])
  .then(() => startGameLayer(gameLayer, getPalette(), getFontId(), getRealmSnapshot(), getCameraModeSnapshot(), getGenerationSettings()))
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
    sendRealmDiscoverySnapshot(controller.getRealmDiscoverySnapshot?.() ?? getRealmDiscoverySnapshot());
    controller.subscribeToRealmDiscovery?.(sendRealmDiscoverySnapshot);
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
