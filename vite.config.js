import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { rename, writeFile } from "node:fs/promises";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { serializePalette, validatePaletteEntries } from "./ascii-rpg/src/palette.js";

const repositoryRoot = dirname(fileURLToPath(import.meta.url));

function palettePersistencePlugin() {
  const palettePath = `${repositoryRoot}/ascii-rpg/palette.json`;

  return {
    name: "ascii-palette-persistence",
    configureServer(server) {
      server.middlewares.use("/__ascii_palette", async (request, response, next) => {
        if (request.method !== "POST") {
          next();
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of request) chunks.push(chunk);
          const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          validatePaletteEntries(payload.entries);
          const temporaryPath = `${palettePath}.tmp`;
          await writeFile(temporaryPath, serializePalette(payload.entries), "utf8");
          await rename(temporaryPath, palettePath);
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ ok: true }));
        } catch (error) {
          response.statusCode = 400;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: error.message }));
        }
      });
    },
  };
}

export default defineConfig({
  base: "/babylon-lite-ascii-rpg/",
  plugins: [react(), palettePersistencePlugin()],
  root: "ascii-rpg",
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-colorful"],
  },
  server: {
    fs: {
      allow: [repositoryRoot],
    },
    watch: {
      ignored: ["**/palette.json"],
    },
  },
});
