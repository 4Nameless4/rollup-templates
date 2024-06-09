import { rimrafSync } from "rimraf";
import type { Plugin } from "rollup";

export function cleanOutput(): Plugin {
  return {
    name: "clearPlugin",
    generateBundle({ dir }) {
      dir && rimrafSync(dir);
    },
  };
}
