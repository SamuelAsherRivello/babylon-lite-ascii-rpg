# Babylon Lite game layer

This layer owns the game loop, input, world state, systems, characters,
movement, collision, and in-world ASCII rendering. Start new runtime work from
`Template.js`; use `.js` for systems, characters, renderers, and utilities.

Systems belong in `systems/` and use the `*-system.js` naming convention.
Characters belong in `characters/`, with player code under `characters/player/`.
Keep React and HTML UI concerns outside this layer and communicate through
`../bridge-layer/`.
