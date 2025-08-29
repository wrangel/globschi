import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      // Tell the plugin to parse JSX also in .js files
      jsxInclude: ["**/*.jsx", "**/*.js"],
    }),
  ],
  server: {
    port: 3000, // fallback: match CRA port
    proxy: {
      // Forward frontend requests for /api to the backend on 8081
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "build", // optional: preserve CRA's default output folder
  },
  resolve: {
    alias: {
      // Optional: add shims or path aliases if needed later
    },
  },
  define: {
    global: "globalThis", // helpful if any library expects 'global'
  },
});
