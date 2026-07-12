import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT;
const port = rawPort && !Number.isNaN(Number(rawPort)) ? Number(rawPort) : 3000;

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  // @ts-ignore — vite-react-ssg extends vite config with ssgOptions
  ssgOptions: {
    formatting: "minify",
    includedRoutes() {
      const pages = ["installment", "average-price", "privacy", "contact"];
      const routes: string[] = ["/ko", "/en"];
      for (const locale of ["ko", "en"]) {
        for (const page of pages) {
          routes.push(`/${locale}/${page}`);
        }
      }
      return routes;
    },
  },
});
