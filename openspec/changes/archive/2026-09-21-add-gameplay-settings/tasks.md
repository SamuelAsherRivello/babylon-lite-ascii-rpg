# Tasks

## 1. Quest selection and persistence

- [x] 1.1 Add a validated Default Quest storage key and select the saved valid quest, or persist and use the first quest definition as fallback, verifying the bootstrap starts the expected quest.
- [x] 1.2 Extend the narrow game bridge and controller with validated quest selection, verifying React can request a quest by ID without accessing mutable game state.
- [x] 1.3 Preserve ordered completion advancement and final completed-quest retention while allowing manual quest selection, verifying the quest-system tests cover next-quest and no-next-quest cases.

## 2. Gameplay Settings UI

- [x] 2.1 Add the Gameplay Settings launcher immediately beneath Ascii Settings and verify its label and ordering in the Windows HUD.
- [x] 2.2 Build the Gameplay Settings modal with a Quests heading, close/backdrop behavior, one selectable card per quest definition, and keyboard activation; verify the modal remains usable in landscape and portrait layouts.
- [x] 2.3 Refactor or share the quest title/task layout so catalog cards match the quest HUD progress and strike-through presentation; verify live completed state and static unstarted previews render correctly.
- [x] 2.4 Persist the selected Default Quest, visibly mark the selected card, and activate it in the current session; verify local storage and current HUD updates after selection.

## 3. Verification and documentation

- [x] 3.1 Update focused Node/source contract tests for the launcher, modal, persistence, initialization fallback, and quest progression; verify `npm.cmd test` passes from the repository root.
- [x] 3.2 Run the production build and manually inspect the live app at the configured Vite URL, verifying the Gameplay Settings window, quest selection, refresh restoration, responsive scrolling, and final completed quest HUD state.
- [x] 3.3 Run `openspec validate "add-gameplay-settings" --strict` and verify all change artifacts are valid and complete.
