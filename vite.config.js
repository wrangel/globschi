import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic", // ensures React 18 automatic JSX transform is used
    }),
    eslint({
      failOnError: false,
      failOnWarning: false,
      emitError: true,
      emitWarning: true,
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "build",
    sourcemap: true, // enable source maps for build and dev
  },
  resolve: {
    alias: {},
  },
  define: {
    global: "globalThis",
  },
});
