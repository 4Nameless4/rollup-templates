import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import type { RollupOptions } from "rollup";
import dts from "rollup-plugin-dts";

const rollup: RollupOptions[] = [
  {
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
  },
  {
    input: "src/index.ts",
    output: [{ file: "lib/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

export default rollup;
