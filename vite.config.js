import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so `dist/` works both at a domain root and in a
  // subfolder (GitHub Pages project sites, S3 prefixes, …) with no extra config.
  base: "./",
});
