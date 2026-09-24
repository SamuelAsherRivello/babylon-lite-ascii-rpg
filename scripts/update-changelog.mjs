import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const changelogPath = "ascii-rpg/src/client/ui-layer-react/data/changelog.json";
const versionPath = "version.txt";

function runGit(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function previousPatch(version) {
  const parts = version.split(".").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) throw new Error(`Invalid version: ${version}`);
  if (parts[2] === 0) throw new Error(`Cannot derive a previous patch version from ${version}`);
  parts[2] -= 1;
  return parts.join(".");
}

function summaryFromProposalPath(path) {
  const match = path.match(/(?:archive\/)?\d{4}-\d{2}-\d{2}-(.+)\/proposal\.md$/);
  const slug = match?.[1] ?? path.match(/changes\/(.+)\/proposal\.md$/)?.[1];
  if (!slug) return null;
  const words = slug.split("-").filter((word) => !["add", "fix", "update", "improve", "refactor", "the", "and", "must", "be", "in"].includes(word));
  return words.slice(0, 5).map((word) => word === "ui" ? "UI" : word === "gpu" ? "GPU" : word).join(" ").replace(/^./, (letter) => letter.toUpperCase());
}

function featurePathFromProposalPath(path) {
  const specsPath = join(dirname(path), "specs");
  if (!existsSync(specsPath)) return "README.md";
  const feature = readdirSync(specsPath, { withFileTypes: true }).find((entry) => entry.isDirectory())?.name;
  return feature ? `openspec/specs/${feature}/spec.md` : "README.md";
}

const nextVersion = process.argv[2];
if (!nextVersion) throw new Error("Pass the newly bumped release version, for example: node scripts/update-changelog.mjs 0.0.20");
const currentVersion = previousPatch(nextVersion);
const versionFileValue = readFileSync(versionPath, "utf8").trim().replace(/^version=/, "");
if (versionFileValue !== nextVersion) throw new Error(`version.txt must contain ${nextVersion} before updating the Changelog.`);
const changelog = JSON.parse(readFileSync(changelogPath, "utf8"));
if (!Array.isArray(changelog.releases) || changelog.releases.some((release) => release.version === nextVersion)) {
  throw new Error(`Changelog already contains v${nextVersion}.`);
}

const currentTag = `v${currentVersion}`;
runGit("rev-parse", "--verify", currentTag);
const proposalPaths = runGit("diff", "--name-only", `${currentTag}..HEAD`, "--", "openspec/changes/archive/**/proposal.md")
  .split("\n")
  .filter(Boolean);
const items = proposalPaths.map((path) => ({ label: summaryFromProposalPath(path), featurePath: featurePathFromProposalPath(path) }))
  .filter((item) => item.label)
  .filter((item, index, all) => all.findIndex(({ label }) => label === item.label) === index)
  .slice(0, 5);
changelog.releases.unshift({ version: nextVersion, items: items.length ? items : [{ label: "Release maintenance", featurePath: "README.md" }] });
writeFileSync(changelogPath, `${JSON.stringify(changelog, null, 2)}\n`);
