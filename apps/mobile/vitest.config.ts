import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    dedupe: ["@trpc/client", "@trpc/server"],
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["__tests__/**/*.{test,spec}.{ts,tsx}"],
  },
});
