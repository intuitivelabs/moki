import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import dsv from "@rollup/plugin-dsv";
import path from "path";
import { viteSingleFile } from "vite-plugin-singlefile";

// Without it dynamic require is not possible in config file
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  let plugins = [react(), dsv()];
  let input = undefined;
  let outDir = "build";

  const env = loadEnv(mode, process.cwd(), "");

  if (env.DIAGRAM) {
    plugins = [react(), dsv(), viteSingleFile()];
    outDir = "build-diagram"
    input = {
      diagram: path.resolve(__dirname, "diagram.html"),
    };
  }

  return {
    test: {
      globalSetup: "./test/global.ts",
      environment: "jsdom",
      coverage: {
        provider: "istanbul",
        reporter: ["text", "text-summary", "json", "html", "cobertura"],
      },
    },
    plugins: plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@charts": path.resolve(__dirname, "./src/js/charts"),
        "@hooks": path.resolve(__dirname, "./src/js/hooks"),
      },
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:5000/",
          changeOrigin: true,
          secure: false,
        },
        "/data": {
          target: "http://127.0.0.1:5000/",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: outDir,
      rollupOptions: {
        input: input,
      },
      // fix React minify issue: https://github.com/vitejs/vite/issues/2139
      commonjsOptions: {
        transformMixedEsModules: true,
        defaultIsModuleExports(id) {
          try {
            const module = require(id);
            if (module?.default) {
              return false;
            }
            return "auto";
          } catch (error) {
            return "auto";
          }
        },
      },
    },
  };
});
