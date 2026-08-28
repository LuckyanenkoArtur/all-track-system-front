import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ui = path.resolve(__dirname, "src/components/ui");

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@primitive": path.join(ui, "primitives"),
      "@input": path.join(ui, "inputs"),
      "@layout": path.join(ui, "layout"),
      "@overlay": path.join(ui, "overlays"),
      "@table": path.join(ui, "tables"),
      "@nav": path.join(ui, "navigation"),
      "@feed": path.join(ui, "feed"),
      "@list": path.join(ui, "lists"),
    },
  },
});
