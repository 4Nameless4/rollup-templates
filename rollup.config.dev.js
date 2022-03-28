import typescript from "rollup-plugin-typescript2";
import progress from "rollup-plugin-progress";
import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import serve from "rollup-plugin-serve";
import fs from "fs";
import os from "os";

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

if (!fs.existsSync("./dist")) {
  fs.mkdirSync("./dist");
}

const files = fs.readdirSync("./examples");

const input = [];
const htmls = [];

files.forEach((f) => {
  if (/.+\.demo\.ts$/g.test(f)) {
    const name = f.replace(/\.demo\.ts$/g, "");
    const fillname = f.replace(/\.ts$/g, ".js");
    input.push(`examples/${f}`);
    htmls.push(f);
    fs.writeFileSync(
      `./dist/${name}.html`,
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${name}</title>
          <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                width: 100%;
                height: 100vh;
            }

            #root {
                width: 100%;
                height: 100%;
            }
          </style>
        </head>
        <body>
          <div id="root">
          </div>
          <script src="./${fillname}" type="module"></script>
        </body>
      </html>
      `
    );
  }
});

fs.writeFileSync(
  "./dist/examples.json",
  `const examples = ${JSON.stringify(htmls)}`
);

const rollup = {
  input,
  output: {
    dir: dir,
    format: "esm",
  },
  plugins: [
    nodeResolve({
      extensions: [".js", ".ts"],
      modulesOnly: true,
    }),
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
  external: ["node_modules/*"],
  watch: {
    clearScreen: false,
  },
};

export default rollup;
