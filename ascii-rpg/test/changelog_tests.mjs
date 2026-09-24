import assert from "node:assert/strict";
import test from "node:test";
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
      assert.ok(item.trim().split(/\s+/).length >= 2 && item.trim().split(/\s+/).length <= 5, `v${release.version}: ${item}`);
    }
  }
});
