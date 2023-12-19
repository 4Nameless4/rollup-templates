import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import type { RollupOptions } from "rollup";

const rollup: RollupOptions = {
  input: "src/index.ts",
  output: [
    {
      dir: "lib",
      entryFileNames: "index.mjs",
      format: "esm",
    },
    {
      dir: "lib",
      entryFileNames: "index.cjs",
      format: "cjs",
    },
  ],
  plugins: [nodeResolve(), commonjs(), typescript(), json(), terser()],
};

export default rollup;
