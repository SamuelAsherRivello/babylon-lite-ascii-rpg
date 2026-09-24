import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import changelog from "../src/client/ui-layer-react/data/changelog.json" with { type: "json" };

test("changelog retains release history in newest-first order", () => {
  assert.ok(changelog.releases.length >= 17);
  const versions = changelog.releases.map(({ version }) => version.split(".").map(Number));
  for (let index = 1; index < versions.length; index += 1) {
    assert.ok(versions[index - 1][2] > versions[index][2], "versions must be descending");
  }
});

test("each changelog release has concise human-readable items", () => {
  for (const release of changelog.releases) {
    assert.ok(release.items.length >= 1 && release.items.length <= 5, `v${release.version} item count`);
    for (const item of release.items) {
      const label = typeof item === "string" ? item : item?.label;
      assert.equal(typeof label, "string", `v${release.version} items must have a human-readable label`);
      assert.ok(label.trim().split(/\s+/).length >= 2 && label.trim().split(/\s+/).length <= 5, `v${release.version}: ${label}`);
    }
  }
});

test("release updater prepends only a bounded incremental entry", async () => {
  const updater = await readFile(new URL("../../scripts/update-changelog.mjs", import.meta.url), "utf8");
  assert.match(updater, /currentTag}\.\.HEAD/);
  assert.match(updater, /\.slice\(0, 5\)/);
  assert.match(updater, /changelog\.releases\.unshift/);
  assert.match(updater, /featurePath: featurePathFromProposalPath/);
  assert.match(updater, /openspec\/specs\/\$\{feature\}\/spec\.md/);
});
