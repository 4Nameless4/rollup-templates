import type { RollupOptions } from "rollup";
import server from "./rollupPlugins/server";
import clean from "./rollupPlugins/clean";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import html from "@rollup/plugin-html";
import json from "@rollup/plugin-json";
import livereload from "rollup-plugin-livereload";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import { extname } from "path";

const NODE_ENV = process.env.NODE_ENV;
const isDevelopment = NODE_ENV === "development";

const getFiles = (bundle: any): any => {
  const result = {} as ReturnType<typeof getFiles>;
  for (const file of Object.values(bundle)) {
    const { fileName } = file as any;
    const extension = extname(fileName).substring(1);

    result[extension] = (result[extension] || []).concat(file);
  }

  return result;
};
const config: RollupOptions = {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "es",
    entryFileNames: "[name]-[hash].js",
    sourcemap: isDevelopment,
  },
  plugins: [
    clean(),
    // node_modules packages path resolve
    nodeResolve(),
    // commonjs module path resolve
    commonjs(),
    typescript(),
    json(),
    postcss({
      extract: true,
      minimize: !isDevelopment,
      plugins: [autoprefixer()],
    }),
    html(),
    !isDevelopment && terser(),
    isDevelopment && server(),
    isDevelopment && livereload(),
  ],
};

export default config;
