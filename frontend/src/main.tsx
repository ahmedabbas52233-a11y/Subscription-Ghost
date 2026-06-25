import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

/* ── Remove splash screen once React has painted ──────────────── */
const removeSplash = () => {
  const splash = document.getElementById("splash");
  if (splash) {
    splash.classList.add("fade");
    setTimeout(() => splash.remove(), 420);
  }
};

/* ── Mount ────────────────────────────────────────────────────── */
const container = document.getElementById("root");
if (!container) throw new Error("#root element not found");

const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

/* ── Remove splash after first paint ─────────────────────────── */
requestAnimationFrame(() => {
  requestAnimationFrame(removeSplash);
});
