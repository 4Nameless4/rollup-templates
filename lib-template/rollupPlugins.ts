import { rimrafSync } from "rimraf";
import type { Plugin } from "rollup";

export function cleanOutputPlugin(): Plugin {
  return {
    name: "clearPlugin",
    generateBundle({ dir }) {
      dir && rimrafSync(dir);
    },
  };
}
