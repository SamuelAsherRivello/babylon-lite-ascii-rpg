import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./client/ui-layer-react/App.jsx";
import { startGameLayer } from "./client/game-layer-babylon-lite/index.js";
import { getCameraModeSnapshot, getCharacterStateSnapshot, getCombatStatsSnapshot, getExperienceSnapshot, getGoldSnapshot, getHealthSnapshot, getLogSnapshot, getPlayerDeadSnapshot, getQuestSnapshot, getRealmDiscoverySnapshot, getRealmSnapshot, getStaminaSnapshot, getZoomSnapshot, getPerformanceReport, resetPerformanceSession, sendCharacterStateSnapshot, sendCheckpointSnapshot, sendCombatStatsSnapshot, sendExperienceSnapshot, sendFontSnapshot, sendGoldSnapshot, sendHealthSnapshot, sendLogSnapshot, sendMinimapZoomSnapshot, sendPaletteSnapshot, sendPlayerDeadSnapshot, sendQuestEvent, sendQuestSnapshot, sendRandomSeedSnapshot, sendRealmDiscoverySnapshot, sendRealmSnapshot, sendStaminaSnapshot, sendTimeSnapshot, setGameController, startPerformanceSession, stopPerformanceSession } from "./client/bridge-layer/game-bridge.js";
import { fontReady, getFontId, subscribeToFont } from "./client/ui-layer-react/font-store.js";
import { getPalette, paletteReady, subscribeToPalette } from "./client/ui-layer-react/palette-store.js";
import { generationSettingsReady, getGenerationSettings } from "./client/ui-layer-react/generation-settings-store.js";
import { PERFORMANCE_SCENARIOS, performanceMonitor } from "./client/game-layer-babylon-lite/performance-monitor.js";
import "./client/ui-layer-react/styles.css";

const gameLayer = document.getElementById("game_layer");
const performanceMode = new URL(window.location.href).searchParams.get("performance");
if (performanceMode === "startup" || performanceMode === "all") {
  performanceMonitor.start({ scenario: PERFORMANCE_SCENARIOS.STARTUP, durationMs: 120000 });
}
void Promise.all([paletteReady, fontReady, generationSettingsReady])
  .then(() => startGameLayer(gameLayer, getPalette(), getFontId(), getRealmSnapshot(), getCameraModeSnapshot(), getGenerationSettings(), getZoomSnapshot()))
  .then((controller) => {
    setGameController(controller);
    window.asciiRpgPerformance = Object.freeze({
      scenarios: PERFORMANCE_SCENARIOS,
      start: startPerformanceSession,
      stop: stopPerformanceSession,
      report: getPerformanceReport,
      reset: resetPerformanceSession,
    });
    if (performanceMode === "idle" || performanceMode === "movement" || performanceMode === "sprint") {
      startPerformanceSession({
        scenario: performanceMode,
        direction: "right",
        sprint: performanceMode === "sprint",
        durationMs: 10000,
      });
    }
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
    sendCharacterStateSnapshot(controller.getCharacterState?.() ?? getCharacterStateSnapshot());
    controller.subscribeToCharacterState?.(sendCharacterStateSnapshot);
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
    sendCheckpointSnapshot(controller.getCheckpointSnapshot?.());
    controller.subscribeToCheckpoint?.(sendCheckpointSnapshot);
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
