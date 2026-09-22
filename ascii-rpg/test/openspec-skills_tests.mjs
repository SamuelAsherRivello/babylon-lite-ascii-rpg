import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../../", import.meta.url);

test("documents the bundled OpenSpec Codex skills without the completed template checklist", async () => {
  const agents = await readFile(new URL("AGENTS.md", repositoryRoot), "utf8");

  await assert.rejects(
    readFile(new URL("AGENTS_TEMPLATE_USAGE_CHECKLIST.md", repositoryRoot)),
    { code: "ENOENT" },
  );
  assert.doesNotMatch(agents, /AGENTS_TEMPLATE_USAGE_CHECKLIST/);
  assert.doesNotMatch(agents, /openspec update/);
  assert.match(agents, /openspec doctor --json/);
  assert.match(agents, /OpenSpec 1\.13\.1/);
  assert.match(agents, /\$openspec-\*/);
  assert.match(agents, /reopen Codex/i);
});
