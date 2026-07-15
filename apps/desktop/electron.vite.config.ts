import { resolve } from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({
      exclude: [
        "@ai-director/agent-runtime",
        "@ai-director/domain",
        "@ai-director/import-export",
        "@ai-director/skill-runtime",
        "@ai-director/storage",
        "zod"
      ]
    })],
    build: {
      rollupOptions: {
        input: resolve(__dirname, "src/main/index.ts")
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ["zod"] })],
    build: {
      rollupOptions: {
        input: resolve(__dirname, "src/preload/index.ts")
      }
    }
  },
  renderer: {
    root: resolve(__dirname, "src/renderer"),
    resolve: {
      alias: {
        "@renderer": resolve(__dirname, "src/renderer/src"),
        "@shared": resolve(__dirname, "src/shared")
      }
    },
    plugins: [react()]
  }
});
