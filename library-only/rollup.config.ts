import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import minimist from "minimist";
import type { RollupOptions } from "rollup";

const argv = minimist(process.argv.slice(2));
const isProduction = !argv.development;
const NODE_ENV = isProduction ? "production" : "development";
process.env.NODE_ENV = NODE_ENV;

const output = {
  dir: "dist",
  entryFileNames: "[name]-[hash].js",
};

const rollup: RollupOptions = {
  input: "src/index.ts",
  output: [
    {
      ...output,
      format: "esm",
    },
    {
      ...output,
      format: "cjs",
    },
  ],
  plugins: [nodeResolve(), commonjs(), typescript(), json(), terser()],
};

export default rollup;
