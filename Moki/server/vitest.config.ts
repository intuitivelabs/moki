/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";

console.log(path.resolve(__dirname, "src/lib/*"))

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      reporter: ["text", "text-summary", "json", "html", "cobertura"],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  }
});
