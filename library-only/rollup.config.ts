import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";

const output = {
  dir: "lib",
  entryFileNames: "[name]-[hash].js",
};

const rollup = {
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
