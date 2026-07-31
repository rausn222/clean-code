import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // DB-backed tests share tables; run files serially
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
