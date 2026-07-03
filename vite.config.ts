import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // During `vite dev`, forward share/OG API calls to `wrangler dev`
      "/api": "http://localhost:8787",
      "/og": "http://localhost:8787",
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
