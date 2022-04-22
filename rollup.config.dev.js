import typescript from "rollup-plugin-typescript2";
import progress from "rollup-plugin-progress";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import serve from "rollup-plugin-serve";
import os from "os";
import glob from "glob";

const dir = "./dist";

const ip = [];
const port = 8080;
const inf = os.networkInterfaces();

for (let n in inf) {
  for (let i in inf[n]) {
    if (inf[n][i].family === "IPv4") {
      ip.push(inf[n][i].address);
    }
  }
}

function generateHtmlPlugin() {
  const demos = [];
  return {
    name: "generate-html",
    options(options) {
      const input = glob.sync(options.input);
      return {
        ...options,
        input,
      };
    },
    buildStart() {
      demos.splice(0);
    },
    load(id) {
      if (/\.demo\.(ts|js)$/g.test(id)) {
        const path = id.split("\\");
        demos.push(path[path.length - 1]);
      }
    },
    generateBundle() {
      demos.forEach((id) => {
        const fileName = `${id.replace(/ts|js$/g, "")}.html`;
        this.emitFile({
          type: "asset",
          fileName,
          source: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Title</title>
           </head>
          <body>
            <script src="${fileName}.js" type="module"></script>
          </body>
          </html>`,
        });
      });
    },
  };
}

const rollup = {
  input: "examples/*.demo.ts",
  output: {
    dir: dir,
    format: "esm",
    sourcemap: true,
  },
  external: ["d3"],
  plugins: [
    generateHtmlPlugin(),
    nodeResolve(),
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
    serve({
      contentBase: "",
      port,
      onListening: (serve) => {
        console.log();
        console.log("***************************************************");
        console.log();
        console.log("        serve start listen on:");
        ip.forEach((_ip) => {
          console.log(`        http://${_ip}:${port}`);
        });
        console.log();
        console.log("***************************************************");
        console.log();
      },
    }),
  ],
  watch: {
    clearScreen: false,
    buildDelay: 1000,
  },
};

export default rollup;
