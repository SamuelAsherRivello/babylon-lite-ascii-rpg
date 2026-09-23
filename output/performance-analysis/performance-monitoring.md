# Performance Analysis

<!-- Append one dated 10–100-word result entry after each completed scan. -->

## 2026-09-23 — Initial browser baseline

In the 405×720, DPR 2.5 in-app browser, idle averaged 59.7 FPS, walking 59.8 FPS, and sprinting 59.0 FPS over 10 seconds. Startup reached input-ready in 3.59 seconds; generation took 0.70 seconds. Warm main-world and minimap passes stayed near 3–4 ms, but first-render warmup and the input-unlock gap dominate startup. Optimize startup scheduling and first-render cache warmup before pursuing steady-state frame rate.

## 2026-09-23 — Staged startup optimization

The active-realm startup path now renders and unlocks input in 628 ms on the 405×720, DPR 2.5 browser baseline. Startup generation uses a 256×256 world, while secondary fog, objects, mapview, and minimap metrics are deferred until after the first playable frame. This meets the 1-second target; follow-up scans should verify realm transitions and deferred work under movement.

## 2026-09-23 — Iris transition restored

The startup iris transition is restored as a visual-only opening after the first playable frame. A fresh startup scan completed in 350 ms on the same browser baseline, while the transition mask was confirmed active during reveal. Camera movement remains responsive during the iris, preserving the ≤1-second readiness target without sacrificing the original presentation effect.
