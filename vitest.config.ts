import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // Mirrors the "@/*" -> "./*" mapping in tsconfig.json.
    // fileURLToPath, not new URL().pathname: on Windows the latter
    // returns "/D:/..." and the alias silently resolves nowhere.
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
