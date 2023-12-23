import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import serve from "rollup-plugin-serve";
import { cleanOutputPlugin, plugins, replaceStrPlugin } from "./rollup-plugins";
import type { RollupOptions, OutputOptions } from "rollup";

const isProduction = process.env.NODE_ENV !== "development";
const NODE_ENV = isProduction ? "production" : "development";
process.env.NODE_ENV = NODE_ENV;

const sourceMap = !isProduction;
const input = isProduction ? "src/index.ts" : "./public/index.html";

const output: OutputOptions = {
  dir: "dist",
  format: "esm",
  entryFileNames: "index.mjs",
  sourcemap: sourceMap,
};

const rollupPlugins: RollupOptions["plugins"] = [
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
  external: isProduction ? ["react", "react-dom"] : [],
};

export default rollup;
