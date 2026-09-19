# Proposal

## Why

The repository has an OpenSpec workflow, but contributors do not yet have a
repeatable, project-rooted way to open its visual dashboard. OpenSpecUI also
needs a browser-safe port and a Windows-specific CLI runner fallback when its
`where.exe` discovery fails with `EPERM`.

## What Changes

- Add a developer-facing OpenSpec dashboard support capability for this
  repository.
- Provide one local launch path that passes the repository root explicitly,
  uses browser-safe port `6001`, and opens the OpenSpecUI web surface without
  delegating work to an AI service.
- Document the dashboard URL, the required OpenSpec CLI compatibility line,
  and the Windows Execute Path recovery for `where.exe EPERM`.
- Keep machine-specific executable paths out of committed project files; the
  Windows fallback is configured locally in OpenSpecUI when required.
- Add focused validation for the launcher/documentation contract and the
  reachable local dashboard.

## Capabilities

### New Capabilities

- `openspec-dashboard-support`: Local, read-only visibility into this
  repository's OpenSpec specs, changes, task progress, and dashboard status.

### Modified Capabilities

None.

## Impact

- Affected developer tooling and documentation: the repository's OpenSpec
  usage guidance and a project-rooted dashboard launch helper or command.
- Affected local runtime: OpenSpecUI serves the current repository on
  `http://localhost:6001` and invokes the installed OpenSpec CLI `1.13.x`.
- No game runtime, public deployment, data format, credential, or production
  API changes are expected.
- No new application dependency is approved by this proposal. The dashboard
  remains an optional local developer tool and must not be required to build,
  test, or run the game.
