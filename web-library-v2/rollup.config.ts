import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import serve from "rollup-plugin-serve";
import minimist from "minimist";
import { cleanOutputPlugin, plugins, replaceStrPlugin } from "./rollup-plugins";
import type { RollupOptions, OutputOptions } from "rollup";

const argv = minimist(process.argv.slice(2));
const isProduction = !argv.development;
const NODE_ENV = isProduction ? "production" : "development";
process.env.NODE_ENV = NODE_ENV;

const sourceMap = !isProduction;
const input = isProduction
  ? "src/index.ts"
  : ["./public/index.html", "./public/index2.html"];

const esOutput: OutputOptions = {
  dir: "dist",
  format: "esm",
  entryFileNames: "index.mjs",
  sourcemap: sourceMap,
};
const cjsOutput: OutputOptions = {
  dir: "dist",
  format: "cjs",
  entryFileNames: "index.cjs",
  sourcemap: sourceMap,
};
const output = isProduction ? [esOutput, cjsOutput] : esOutput;

const rollupPlugins = [
  !isProduction && cleanOutputPlugin(),
  plugins.entryHTMLResolve(),
  plugins.postcssResolve({ inject: isProduction }),
  !isProduction && plugins.publicResolve(),
  replaceStrPlugin({
    replace: {
      "process.env.NODE_ENV": `"${NODE_ENV}"`,
    },
  }),
  nodeResolve(),
  commonjs(),
  typescript({
    sourceMap,
  }),
  json(),
];

const rollup: RollupOptions = {
  input,
  output,
  plugins: [
    ...rollupPlugins,
    !isProduction && serve("dist"),
    isProduction && terser(),
  ],
};

export default rollup;
