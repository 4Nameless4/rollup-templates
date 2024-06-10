import type { Plugin } from "rollup";
import { rimrafSync } from "rimraf";

export default function cleanOutputPlugin(): Plugin {
  return {
    name: "clearPlugin",
    generateBundle({ dir }) {
      dir && rimrafSync(dir);
    },
  };
}
