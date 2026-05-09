import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // NODE_ENV=test é setado automaticamente pelo Vitest
    // .env.test é carregado via dotenv-cli no script npm test
    // Cada arquivo de teste roda isolado — sem estado compartilhado entre suites
    isolate: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["services/**", "repositories/**", "controllers/**"],
      exclude: ["**/*.test.ts", "**/__tests__/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
