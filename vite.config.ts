// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "public/manifest.json",
          dest: ".",
        },
        {
          src: "src/assets/icon*.png",
          dest: "icons",
        },
        {
          src: "src/content-scripts/style.css",
          dest: "content-scripts",
        },
        {
          src: "public/content-scripts/loader.js", // Copy the new loader script
          dest: "content-scripts",
        },
      ],
    }),
    tailwindcss(),
  ],
  build: {
    outDir: "build",
    sourcemap: process.env.NODE_ENV !== "production",
    minify: process.env.NODE_ENV === "production",
    modulePreload: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "index.html"),
        serviceWorker: resolve(__dirname, "src/background/service-worker.ts"),
        // This is the main content script module, dynamically imported by loader.js
        // Renamed from contentScript to contentScriptModule for clarity
        contentScriptModule: resolve(
          __dirname,
          "src/content-scripts/content.ts",
        ),
      },
      output: {
        format: "esm",
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "serviceWorker") {
            return "service-worker.js";
          }
          if (chunkInfo.name === "contentScriptModule") {
            // This is the ESModule that loader.js will import
            return "content-scripts/content.js";
          }
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (
            assetInfo.name === "style.css" &&
            assetInfo.type === "asset" &&
            typeof assetInfo.source === "string" &&
            assetInfo.source.includes(".reminder-box")
          ) {
            return "content-scripts/style.css";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
