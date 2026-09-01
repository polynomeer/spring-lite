import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const proxyTarget = process.env.VITE_PROXY_TARGET || "http://127.0.0.1:8080";
const compareLiteTarget = process.env.VITE_COMPARE_LITE_PROXY_TARGET || "http://127.0.0.1:18081";
const compareBootTarget = process.env.VITE_COMPARE_BOOT_PROXY_TARGET || "http://127.0.0.1:18082";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4173,
    proxy: {
      "/lab": {
        target: proxyTarget,
        changeOrigin: true
      },
      "/compare-lite": {
        target: compareLiteTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/compare-lite/, "")
      },
      "/compare-boot": {
        target: compareBootTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/compare-boot/, "")
      }
    }
  }
});
