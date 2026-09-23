# Gemini project instructions

Read and follow `AGENTS.md` before changing this repository. It is the
authoritative project guidance and safety policy for all work here.

## Project layout

- Run Git, npm, build, test, OpenSpec, and Vite commands from this repository
  root.
- The Vite application, source, tests, and assets are under `ascii-rpg/`.
- Keep application changes in `ascii-rpg/` unless the project structure is
  deliberately being changed.
- Work on `main`; do not create branches, rewrite history, or discard user
  changes.

## Existing agent setup

Use the existing shared OpenSpec skills as procedural guidance when their task
matches the user's request. Their instructions are located at:

`C:\Users\srive\.agents\skills\openspec-*\SKILL.md`

Read the matching `SKILL.md` in full before using it. In particular:

- `openspec-explore` and `openspec-grill-me` are planning-only.
- `openspec-propose` creates a coherent proposal, design, specs, and tasks.
- `openspec-apply-change` implements an existing change.
- `openspec-sync-specs` syncs delta specs without archiving.
- `openspec-finalize-sync-archive-commit-push` is only for a fully completed
  change and must keep unrelated dirty work out of scope.

Do not assume Codex-specific slash commands or skill invocation syntax works
in Gemini. Follow the skill files directly, use the `openspec` CLI from the
repository root, and keep the OpenSpec artifacts under `openspec/` coherent.

## Verification and browser work

- Prefer the existing Node tests and build checks; do not add or run Playwright
  tests unless the user explicitly requests Playwright work.
- Inspect actual configuration before reporting command, release, deployment,
  or runtime results.
- Add `?skipTutorial=true` to every README game screenshot URL.
- Preserve every user-facing setting in `localStorage` and ensure Reset
  Settings clears it.

## Before handing work back

Inspect `git status` and retain unrelated user changes. Do not commit, push,
or create a pull request unless the user explicitly asks.
