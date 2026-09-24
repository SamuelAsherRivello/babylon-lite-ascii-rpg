import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

if (process.platform === "linux" && !existsSync("/usr/bin/bash")) {
  console.error("Sandbox requires /usr/bin/bash for the Docker Desktop Codex CLI.");
  process.exit(1);
}

const major = Number.parseInt(process.versions.node.split(".")[0], 10);
if (major !== 24) {
  console.error(`Sandbox requires Node.js 24; found ${process.versions.node}.`);
  process.exit(1);
}

execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "openspec:doctor"], {
  stdio: "inherit",
});

console.log(`Sandbox prerequisites passed on Node.js ${process.versions.node}.`);
