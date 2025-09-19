import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react({
      jsxInclude: ["**/*.jsx", "**/*.js"],
    }),
    visualizer({
      open: true,
      filename: "stats.html",
      gzipSize: true,
      brotliSize: true,
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // use package name as chunk id for better splitting
            const parts = id.split("node_modules/");
            if (parts.length > 1) {
              const pkgName = parts[1].split("/")[0];
              return `vendor_${pkgName}`;
            }
          }
        },
      },
    },
  },
  resolve: {
    alias: {},
  },
  define: {
    global: "globalThis",
  },
});
