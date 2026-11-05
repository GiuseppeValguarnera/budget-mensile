import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" rende la build funzionante su GitHub Pages con qualsiasi nome di repository
export default defineConfig({
  base: "./",
  plugins: [react()],
  test: { environment: "node" }
});
