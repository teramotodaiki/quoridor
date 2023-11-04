/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: ["vitest.setup.ts"],
    environment: "jsdom",
    threads: false, // https://github.com/vitest-dev/vitest/issues/740
  },
});
