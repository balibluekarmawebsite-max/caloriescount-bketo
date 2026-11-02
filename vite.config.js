import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works whether it is served from a domain root
// or a sub-folder on shared hosting (e.g. example.com/calories/).
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
