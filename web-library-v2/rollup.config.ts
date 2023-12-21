import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import serve from "rollup-plugin-serve";
import minimist from "minimist";
import { cleanOutputPlugin, plugins, replaceStrPlugin } from "./rollup-plugins";
import type { RollupOptions } from "rollup";

const argv = minimist(process.argv.slice(2));
const isProduction = !argv.development;
const NODE_ENV = isProduction ? "production" : "development";
process.env.NODE_ENV = NODE_ENV;

const rollup: RollupOptions = {
  input: isProduction
    ? "src/index.ts"
    : ["./public/index.html", "./public/index2.html"],
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: "index.js",
    // sourcemap: !isProduction,
  },
  plugins: [
    cleanOutputPlugin(),
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
      sourceMap: !isProduction,
    }),
    json(),
    !isProduction && serve("dist"),
    isProduction && terser(),
  ],
};

export default rollup;
