import { defineConfig } from "vite";

// Vite is used ONLY as a dev server and reverse proxy.
//
// The proxy is what makes this project backend-agnostic: whichever BookStore
// implementation you started on :8080 (Go, Kotlin, Python or TypeScript), the
// browser sees the API at a same-origin /api path. No CORS, no backend change.
//
// Application code must not depend on Vite. No build step, no bundler
// features, no imports from node_modules at runtime.
// See .specify/memory/constitution.md.
export default defineConfig({
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
