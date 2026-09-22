# Spec Delta

## Purpose

Provides a deterministic, local-only way for contributors to inspect this
repository's OpenSpec specifications, active changes, and task progress in a
browser dashboard without invoking an AI service or changing game client behavior.

## ADDED Requirements

### Requirement: Repository dashboard launch

The project SHALL provide a documented or scripted launch path that invokes
OpenSpecUI with the repository root as its project path, serves the web
dashboard on browser-safe port `6001`, and does not attempt to open an
uncontrolled system browser from the launcher.

#### Scenario: Launch the dashboard for this repository

- **WHEN** a contributor runs the supported dashboard launch path from the
  repository
- **THEN** OpenSpecUI serves the project at `http://localhost:6001`
- **AND** the dashboard resolves the project path to this repository root

#### Scenario: Port 6000 is avoided

- **WHEN** the dashboard launch path selects its listening port
- **THEN** it uses port `6001` rather than Chromium-blocked port `6000`

### Requirement: Read-only OpenSpec visibility

The dashboard support SHALL expose OpenSpec specs, active changes, artifact
status, and task progress as local read-only visibility by default. Launching
the dashboard SHALL NOT call an AI service, install packages, modify game
client files, or execute workflow actions such as Apply or Archive without an
explicit user action.

#### Scenario: Inspect current project status

- **WHEN** a contributor opens the dashboard
- **THEN** the visible project scope and OpenSpec status are derived from the
  repository's local files and installed OpenSpec CLI
- **AND** no AI request or package installation is initiated

#### Scenario: Workflow action remains explicit

- **WHEN** a contributor only launches or views the dashboard
- **THEN** Apply, Archive, Continue, Fast-forward, and Verify actions remain
  uninvoked until the contributor explicitly selects one

### Requirement: OpenSpec CLI compatibility and Windows recovery

The dashboard support SHALL target the installed OpenSpec CLI compatibility
line `>=1.13.0 <1.14.0` and SHALL document a local Execute Path recovery that
can invoke the CLI through Node directly when Windows `where.exe` discovery
fails with `EPERM`. Machine-specific executable paths SHALL remain local
configuration and SHALL NOT be committed as repository secrets or required
game dependencies.

#### Scenario: Compatible CLI is available

- **WHEN** OpenSpecUI checks the configured OpenSpec runner
- **THEN** it accepts the installed CLI when its version is within
  `>=1.13.0 <1.14.0`
- **AND** the dashboard can resolve the repository's OpenSpec context

#### Scenario: Windows discovery returns EPERM

- **WHEN** OpenSpecUI reports `where.exe EPERM` while checking the OpenSpec
  runner
- **THEN** the project guidance identifies the Execute Path setting and a
  direct Node invocation as the recovery
- **AND** saving the path is followed by a runner recheck before dashboard
  success is reported
