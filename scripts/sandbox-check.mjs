import { execFileSync } from "node:child_process";

const major = Number.parseInt(process.versions.node.split(".")[0], 10);
if (major !== 24) {
  console.error(`Sandbox requires Node.js 24; found ${process.versions.node}.`);
  process.exit(1);
}

execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "openspec:doctor"], {
  stdio: "inherit",
});

console.log(`Sandbox prerequisites passed on Node.js ${process.versions.node}.`);
