import type { RollupOptions } from "rollup";
import { cleanOutputPlugin } from "./rollupPlugins";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const config: RollupOptions = {
  input: "src/index.ts",
  output: [
    {
      dir: "lib",
      format: "esm",
      entryFileNames: "index.js",
    },
    {
      dir: "lib",
      format: "cjs",
      entryFileNames: "index.cjs",
    },
  ],
  plugins: [
    cleanOutputPlugin(),
    // node_modules packages path resolve
    nodeResolve(),
    // commonjs module path resolve
    commonjs(),
    typescript(),
    terser(),
  ],
};

export default config;
