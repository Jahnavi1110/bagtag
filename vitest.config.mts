import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: { alias: { "@": root, "server-only": `${root}tests/server-only-stub.ts` } },
  test: { include: ["tests/unit/**/*.test.ts"], environment: "node", fileParallelism: false },
});
