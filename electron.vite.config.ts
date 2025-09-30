import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@shared": resolve("src/shared"),
        "@core": resolve("src/main/core"),
        "@utils": resolve("src/main/utils"),
        "@windows": resolve("src/main/windows"),
        "@services": resolve("src/main/services"),
      },
    },
  },
  preload: {
    plugins: [],
    resolve: {
      alias: {
        "@shared": resolve("src/shared"),
      },
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, "src/preload/index.ts"),
        output: { entryFileNames: "[name].cjs", format: "cjs" },
      },
    },
  },
  renderer: {
    root: "src/renderer",
    build: {
      outDir: "out/renderer",
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/renderer/index.html"),
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve("src/renderer"),
        "@shared": resolve("src/shared"),
        "@lib": resolve("src/renderer/lib"),
        "@components": resolve("src/renderer/components"),
        "@hooks": resolve("src/renderer/hooks"),
        "@store": resolve("src/renderer/store"),
      },
      dedupe: ["react", "react-dom"],
    },
    plugins: [react(), tailwindcss()],
  },
});
