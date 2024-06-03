import type { RollupOptions } from "rollup";
import { cleanOutputPlugin, server } from "./rollupPlugins";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-node-resolve";

const isProduction = (process.env.MODE || "").trim() === 'production'

const config: RollupOptions = {
  input: "src/index.ts",
  output: {
    format: "es",
    dir: "dist",
  },
  plugins: [
    cleanOutputPlugin(),
    // node_modules packages path resolve
    nodeResolve(),
    // commonjs module path resolve
    commonjs(),
    typescript(),
    !isProduction && server(),
  ],
};

export default config;
