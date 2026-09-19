import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { GameCanvas } from "./GameCanvas.jsx";
import "./style.css";

createRoot(document.getElementById("content_layer")).render(
  <StrictMode>
    <GameCanvas />
  </StrictMode>,
);

createRoot(document.getElementById("ui_layer")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
