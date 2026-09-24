# Tasks

- [x] 1. Vendor the selected Codex/OpenSpec skills under `.agents/skills/`,
  remove repository-local symlinks or junctions there, and verify no skill
  resolves through a user-global path.
- [x] 2. Add the pinned local OpenSpec CLI development dependency and update
  the lockfile without adding unrelated packages.
- [x] 3. Add npm scripts for OpenSpec doctor, strict validation, and the
  clean-checkout environment smoke check.
- [x] 4. Pin/document Node.js 24 and make setup instructions portable across
  Linux containers and Windows hosts.
- [x] 5. Add a Dockerfile or devcontainer configuration that installs the
  declared toolchain and uses the repository root as its work directory.
- [x] 6. Ensure the container setup runs `npm ci`, local OpenSpec doctor,
  `npm test`, and `npm run build` without global npm packages.
- [x] 7. Document optional browser/display/GPU requirements separately from
  the headless checks and preserve the no-Playwright-test default.
- [x] 8. Document writable Vite development data paths, ignored caches/output,
  and the boundary around secrets and external network access.
- [x] 9. Run the clean-checkout smoke validation and distinguish environment
  failures from repository failures.
- [x] 10. Run strict OpenSpec validation, inspect the scoped diff, and record
  any remaining intentional external dependency before handoff.
