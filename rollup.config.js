import typescript from "rollup-plugin-typescript2";
import progress from "rollup-plugin-progress";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import pkg from "./package.json";
import { terser } from "rollup-plugin-terser";

const dir = "./lib";

const name = pkg.main.match(/.+(?=.js$)/g)[0];

const file = `${dir}/${name}`;

const rollup = {
  input: "index.ts",
  output: [
    {
      file: `${file}.js`,
      format: "esm",
    },
    {
      file: `${file}.min.js`,
      format: "esm",
      plugins: [terser()],
    },
    {
      file: `${file}.cjs.js`,
      format: "cjs",
    },
    {
      file: `${file}.min.cjs.js`,
      format: "cjs",
      plugins: [terser()],
    },
  ],
  plugins: [
    nodeResolve({
      extensions: [".js", ".ts"],
      modulesOnly: true,
    }),
    commonjs(),
    progress(),
    json(),
    typescript({
      tsconfig: "tsconfig.json",
      tsconfigOverride: {
        compilerOptions: {
          emitDeclarationOnly: false,
          declaration: false,
        },
      },
    }),
  ],
  external: ["node_modules/*"],
};

export default rollup;
