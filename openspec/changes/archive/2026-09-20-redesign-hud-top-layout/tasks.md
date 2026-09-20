# Tasks

## 1. HUD Structure

- [x] 1.1 Replace the upper-left and upper-right HUD markup with Character and Minimap boxes while preserving the existing minimap canvas and verifying both regions use the shared top-box class.
- [x] 1.2 Add shared equal-size border and responsive layout rules for the two top boxes, then verify landscape and portrait geometry stays inside the HUD inset without overflow.

## 2. Status Presentation

- [x] 2.1 Add `W: 1`, realm-derived `F: 1`/`F: -1`, and `Time: 0001` status formatting to the Minimap box and verify realm transfers update the floor label.
- [x] 2.2 Move time presentation to the Minimap box with four-digit padding below `10000`, preserve full values above that range, and verify successful movement updates the display.

## 3. Box Actions

- [x] 3.1 Make the entire Character box activate the bottom-edge `Details` action as a reserved no-op and make the entire Minimap box activate the bottom-edge `Zoom` action using the existing minimap zoom cycle.

## 4. Verification

- [x] 4.1 Update focused UI assertions for the new top-box structure and status labels, then run the existing Node test suite.
- [x] 4.2 Run the repository build and verify the top HUD source geometry and responsive rules for landscape and portrait sizes; confirm the Character box remains reserved for future content.
