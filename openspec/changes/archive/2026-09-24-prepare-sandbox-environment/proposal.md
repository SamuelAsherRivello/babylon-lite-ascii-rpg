# Proposal

## Why

The repository currently assumes that OpenSpec CLI tooling and shared Codex
skills may exist outside the checkout. That makes a fresh Docker/Codex sandbox
less reproducible than the application itself, even though the application
dependencies are already represented by `package.json` and
`package-lock.json`.

## What Changes

- Vendor the selected repository-relevant Codex/OpenSpec skills under
  `.agents/skills/` and remove repository-local links to external skill
  locations.
- Add a pinned local OpenSpec CLI dependency and npm entry points for its
  doctor/validation commands.
- Pin and document the Node.js 24 runtime expected by the repository.
- Add a reproducible container or devcontainer setup for install, test, build,
  and OpenSpec checks.
- Add a clean-checkout smoke check and document optional browser/display
  support separately from the headless build/test path.
- Replace shared documentation assumptions that require Windows-specific
  `npm.cmd` invocation.
- Document writable development data paths, npm cache behavior, and the small
  set of intentionally external capabilities such as the npm registry and
  GitHub release credentials.

## Capabilities

### New Capabilities

None. This is a tooling, packaging, and documentation change with no new
runtime user-facing behavior.

### Modified Capabilities

None.

## Impact

Affected files will include package metadata and lockfile, repository agent
skills, container/development-environment configuration, npm scripts, and
setup documentation. The browser application API and runtime behavior should
remain unchanged. The change intentionally does not add release credentials,
secrets, or a public service endpoint.
