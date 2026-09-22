# Design

## Context

See `proposal.md` for motivation and scope. The repository is a Vite and
React browser game with a repo-local OpenSpec root at `openspec/`. Existing
OpenSpecUI use serves the current checkout locally and requires the installed
OpenSpec CLI. The current Windows environment has a global OpenSpec CLI
`1.13.1`; OpenSpecUI can fail its automatic runner discovery when spawning
`where.exe`, so the dashboard's Execute Path must support a direct Node
invocation as a local recovery.

The game client, Vite development server, GitHub Pages deployment, and
OpenSpec planning files are separate concerns. Dashboard support must remain
developer tooling and must not become a client dependency of the game.

## Goals / Non-Goals

**Goals:**

- Make the repository's dashboard launch command deterministic and easy to
  find.
- Pass the actual repository root explicitly to OpenSpecUI.
- Use port `6001`, which is reachable in Chromium, and avoid automatic browser
  opening so the terminal owns process lifetime.
- Document the installed CLI compatibility line and the Windows Execute Path
  fallback.
- Keep dashboard use local, read-only by default, and independent of AI calls.

**Non-Goals:**

- Adding OpenSpecUI, Node, or another package as an application dependency.
- Embedding a dashboard into the shipped game or GitHub Pages site.
- Automatically running OpenSpec workflow mutations, changing specs, archiving,
  committing, or pushing from the launcher.
- Committing a user-specific absolute Node or npm path.

## Decisions

### Use a repository-local PowerShell launcher plus README guidance

Add a small PowerShell launcher under the repository's existing developer
script area, and document its equivalent command in `README.md`. The launcher
derives the repository root from its own location and runs
`openspecui serve <root> --web --port 6001 --no-open`. This keeps the command
rooted at the actual project while leaving OpenSpecUI optional.

An npm script alone is not sufficient because the request is explicitly about
calling the terminal and the repository's npm scripts are focused on the game.
A checked-in launcher is also easier to inspect than a user-global alias.

### Keep CLI Execute Path configuration local

The repository documentation will describe the direct Node form for the
Windows `where.exe EPERM` case, but the user-specific path will be entered in
OpenSpecUI's local Execute Path setting. The checked-in launcher will not
write `.openspecui.json` or embed a profile-specific absolute path.

This avoids making another developer depend on `C:\Users\srive` while still
documenting the recovery that was verified on Windows.

### Validate the contract without requiring the dashboard for game checks

Add a focused Node test or static contract check for the launcher and README
flags, then separately verify the running dashboard with a local HTTP request
and a browser check when OpenSpecUI is available. `npm test`, `npm run build`,
and OpenSpec validation remain repository checks; dashboard availability is an
optional developer-tool check and must not block the game build when the CLI is
not installed.

## Risks / Trade-offs

- **OpenSpecUI is not installed or is not on PATH** → Report the terminal
  error and preserve the game's normal build/test path; do not install it as an
  application dependency.
- **Windows child-process policy still returns EPERM** → Use the documented
  direct Node Execute Path and restart the local OpenSpecUI process from a
  terminal with the required permissions.
- **Port 6001 is already occupied** → Report the collision and allow an
  explicit alternate port only when the contributor chooses it; keep `6001` as
  the documented default.
- **Dashboard workflow actions mutate planning state** → Keep launch/read
  behavior separate from action controls and require explicit user selection.

## Migration Plan

Add the launcher and documentation without changing existing game commands or
saved data. Verify the dashboard contract locally, then roll back by removing
only the new launcher, documentation section, and focused checks if the
OpenSpecUI integration is not useful. No database, deployment, or package-lock
migration is required.

## Open Questions

None that change the specified behavior or implementation approach.
