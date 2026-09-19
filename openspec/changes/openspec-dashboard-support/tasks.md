# Tasks

## 1. Add the deterministic dashboard launcher

- [ ] 1.1 Add a repository-local PowerShell launcher that derives the project
  root, invokes `openspecui serve <root> --web --port 6001 --no-open`, and
  verifies the script contains no AI, package-install, or workflow-mutation
  behavior.
- [ ] 1.2 Document the launcher, repository-root scope, OpenSpec CLI
  compatibility line, dashboard URL, and port-6001 rationale in `README.md`;
  verify the documented command matches the launcher exactly.

## 2. Document Windows runner recovery

- [ ] 2.1 Document the OpenSpecUI Execute Path recovery for Windows
  `where.exe EPERM`, including the direct Node invocation pattern and the rule
  that user-specific absolute paths stay local; verify the guidance is present
  and contains no credentials or machine-specific committed path.
- [ ] 2.2 Add or update a focused contract check for the launcher and dashboard
  documentation; verify it checks the explicit project-path, `--web`,
  `--port 6001`, and `--no-open` requirements without requiring OpenSpecUI to
  be installed in CI.

## 3. Verify the integrated developer workflow

- [ ] 3.1 Run the focused contract check and repository build/test checks;
  verify unrelated pre-existing failures remain outside this change.
- [ ] 3.2 Start the dashboard for the repository, verify
  `http://localhost:6001` returns HTTP 200, inspect the visible dashboard for
  the correct project scope and OpenSpec status, and run strict OpenSpec
  validation before marking the change complete.
