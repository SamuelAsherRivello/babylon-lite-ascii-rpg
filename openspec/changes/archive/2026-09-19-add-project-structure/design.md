# Design

## Context

The current application is a Vite entry point with React UI code, Babylon Lite
game code, bridge modules, and tests located in a flatter `ascii-rpg/src/` and
`ascii-rpg/test/` layout. The existing `game-layer-architecture` capability
already establishes React as the UI owner and Babylon Lite as the gameplay and
rendering owner. See `proposal.md` for the motivation and scope.

## Goals / Non-Goals

**Goals:**

- Make the three runtime boundaries visible as sibling directories.
- Keep React-specific files in `.jsx` where JSX is used and keep Babylon Lite
  and bridge runtime modules in `.js`.
- Name systems consistently with the `*-system.js` convention.
- Provide representative templates and local guidance for contributors and AI
  agents.
- Mirror source paths under `ascii-rpg/test/`.
- Preserve the existing DOM mount points and narrow bridge behavior.

**Non-Goals:**

- Introducing TypeScript, a new framework, or a new runtime dependency.
- Changing the user-visible game, UI, palette, input, or timing behavior.
- Moving the repository-level package manifest into `ascii-rpg/`.
- Treating font and palette JSON as React components or generic UI assets.

## Decisions

### Runtime layers are siblings

Use `src/runtime/ui-layer-react/`, `src/runtime/bridge-layer/`, and
`src/runtime/game-layer-babylon-lite/`. This makes the bridge a first-class
boundary rather than a private subfolder of either endpoint. Alternatives
considered were placing the bridge under React or under Babylon Lite; both
would imply ownership that conflicts with the existing narrow communication
contract.

### File extensions follow technology boundaries

Use `.jsx` for React components that contain JSX and `.js` for Babylon Lite,
bridge, system, character, renderer, and utility modules. Use `.json` for
static font and palette data, stored under the Babylon layer's `data/` folder
as `font_data.json` and `palette_data.json`. A `.jsx` file is not used merely
because a module is part of the application; it indicates React/JSX ownership.

### Systems use explicit names

Place game systems in `game-layer-babylon-lite/systems/` and use names such as
`input-system.js`, `rendering-system.js`, `time-system.js`, and
`world-system.js`. Characters remain under `characters/`, with player-specific
modules under `characters/player/`.

### Templates are examples, not shared runtime dependencies

Each layer gets a representative `Template` file in the extension appropriate
to that layer, plus concise local guidance. New code may copy the pattern, but
production modules should not import templates. The React layer can include
`Template.jsx` and `Template.js`; the bridge and Babylon Lite layers use
`Template.js` because they are not React layers.

### Tests mirror implementation paths

Move or add tests under a path that mirrors `src/`, including `runtime/`, the
layer name, and the relevant module area. Test filenames add `_tests` before
the extension, for example `time-system_tests.js`. This keeps discovery
predictable and allows the existing Node test runner to retain explicit test
entry paths.

## Risks / Trade-offs

- [Risk] Relocating modules can break relative imports and Vite entry wiring
  → Mitigation: update imports systematically and run the existing build and
  test commands.
- [Risk] Template guidance can become stale or be mistaken for production code
  → Mitigation: document that templates are starting references and add focused
  structural checks for their presence and extension conventions.
- [Risk] Mirroring tests may require broad path updates
  → Mitigation: preserve test behavior and update only paths required by the
  source relocation.
