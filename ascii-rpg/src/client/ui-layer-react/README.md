# React UI layer

This layer owns React components, HTML user-interface state, dialogs, menus,
settings, and UI styling. Start new React work from `Template.jsx`; start a
non-component UI helper from `Template.js`. Treat both files as representative
examples, not production dependencies, and do not modify them for ordinary
feature work.

Communicate with the game through `../bridge-layer/`. Do not own the Babylon
Lite game loop, world state, input state, or in-world renderer here.
