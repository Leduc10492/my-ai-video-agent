import { resolve } from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import tailwindcss from "@tailwindcss/vite";
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
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "ai-director-development-csp",
        apply: "serve",
        transformIndexHtml(html) {
          return html
            .replace(
              "script-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:*"
            )
            .replace(
              "connect-src 'none'",
              "connect-src 'self' ws://localhost:* http://localhost:*"
            );
        }
      }
    ]
  }
});
