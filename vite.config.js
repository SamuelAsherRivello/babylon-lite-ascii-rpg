import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repositoryRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/babylon-lite-ascii-rpg/",
  plugins: [react()],
  root: "ascii-rpg",
  server: {
    fs: {
      allow: [repositoryRoot],
    },
  },
});
