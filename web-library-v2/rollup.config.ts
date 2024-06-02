import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import {
  cleanOutputPlugin,
  plugins,
  replaceStrPlugin,
  server,
} from "./rollup-plugins";
import type { RollupOptions, OutputOptions } from "rollup";

const isProduction = process.env.NODE_ENV !== "development";
const NODE_ENV = isProduction ? "production" : "development";
process.env.NODE_ENV = NODE_ENV;

const sourcemap = !isProduction && "inline";
const input = isProduction
  ? "src/index.ts"
  : ["./public/index.html", "./public/index2.html"];

const esOutput: OutputOptions = {
  dir: "dist",
  format: "esm",
  entryFileNames: "index.mjs",
  sourcemap,
};
const cjsOutput: OutputOptions = {
  dir: "dist",
  format: "cjs",
  entryFileNames: "index.cjs",
  sourcemap,
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
  typescript(),
  json(),
];

const rollup: RollupOptions = {
  input,
  output,
  plugins: [
    ...rollupPlugins,
    !isProduction &&
      server({
        contentBase: "dist",
        port: 8080,
        verbose: true,
      }),
    isProduction && terser(),
  ],
};

export default rollup;
