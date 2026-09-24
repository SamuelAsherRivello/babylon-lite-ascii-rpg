# Design

## Scope

Prepare the repository so a fresh sandbox can perform normal agent-assisted
development with minimal host-global state. The application remains a
repository-root npm project whose Vite root is `ascii-rpg/`.

## Dependency Boundaries

- Runtime and development npm packages belong in `package.json` and
  `package-lock.json`.
- OpenSpec CLI belongs in local development dependencies, pinned to the
  repository's verified version 1.13.1.
- The selected Codex/OpenSpec skills belong under `.agents/skills/` as ordinary
  committed files. Repository-local symlinks or junctions must not be needed.
- Node.js 24 is supplied by the container/runtime contract rather than by npm.
- Browser binaries and display/GPU support are optional verification
  capabilities, not prerequisites for Node tests or production builds.

## Container Contract

The container or devcontainer should use the repository root as its working
directory, install dependencies with `npm ci`, and provide commands for
OpenSpec doctor, tests, and production build. It should not copy user home
directories, global npm modules, global skills, credentials, or browser
profiles into the project.

## Filesystem and Network

The sandbox checkout must be writable for development because the Vite plugin
can persist palette, font, and generation-settings data. Generated dependency
folders, npm caches, build output, and browser artifacts remain ignored or
outside the source tree. First-time dependency installation may require npm
registry access; ordinary tests and builds should not require application
secrets or external services.

## Verification

Validate the environment from a clean checkout with Node 24, `npm ci`, the
local OpenSpec version check and doctor command, the repository Node test
suite, the production build, and strict validation of this change. Browser
verification remains a separate opt-in check and must follow the repository's
manual-browser and seeded-run conventions.
