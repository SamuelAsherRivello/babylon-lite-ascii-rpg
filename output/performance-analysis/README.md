# Performance Analysis Procedure

The monitoring API is opt-in and is available in the browser console after the
game client starts as `window.asciiRpgPerformance`.

For startup-to-playable timing, open the project with:

`?skipTutorial=true&performance=startup`

The startup report completes after the first valid world render and initial
reveal. Read it with:

```js
window.asciiRpgPerformance.report()
```

For post-start scenarios, run separate bounded sessions:

```js
window.asciiRpgPerformance.start({ scenario: "idle", durationMs: 10000 })
window.asciiRpgPerformance.start({ scenario: "movement", direction: "right", durationMs: 10000 })
window.asciiRpgPerformance.start({ scenario: "sprint", direction: "right", sprint: true, durationMs: 10000 })
window.asciiRpgPerformance.report()
```

Each completed scan gets one dated 10–100-word summary appended to
`performance-monitoring.md`. Raw reports are not stored automatically.
