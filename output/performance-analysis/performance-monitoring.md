# Performance Analysis

<!-- Append one dated 10–100-word result entry after each completed scan. -->

## 2026-09-23 — Initial browser baseline

In the 405×720, DPR 2.5 in-app browser, idle averaged 59.7 FPS, walking 59.8 FPS, and sprinting 59.0 FPS over 10 seconds. Startup reached input-ready in 3.59 seconds; generation took 0.70 seconds. Warm main-world and minimap passes stayed near 3–4 ms, but first-render warmup and the input-unlock gap dominate startup. Optimize startup scheduling and first-render cache warmup before pursuing steady-state frame rate.
