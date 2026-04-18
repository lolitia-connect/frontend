import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

function copyAssetsDirectory(): Plugin {
  const assetsRoot = fileURLToPath(new URL("./assets", import.meta.url));

  async function collectFiles(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const resolvedPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          return collectFiles(resolvedPath);
        }
        return [resolvedPath];
      })
    );

    return files.flat();
  }

  return {
    apply: "build",
    name: "copy-payment-portal-assets",
    async generateBundle() {
      const files = await collectFiles(assetsRoot);

      await Promise.all(
        files.map(async (file) => {
          const source = await readFile(file);
          const relativePath = path
            .relative(assetsRoot, file)
            .split(path.sep)
            .join("/");

          this.emitFile({
            type: "asset",
            fileName: `assets/${relativePath}`,
            source,
          });
        })
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "./",
    plugins: [viteReact(), tailwindcss(), copyAssetsDirectory()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "https://api.ppanel.dev",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      assetsDir: "static",
    },
  };
});
