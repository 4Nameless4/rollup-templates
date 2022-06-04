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
  let dir;

  return {
    name: "generate-html",
    options(options) {
      const input = glob.sync(options.input);
      dir = options.input.split("/")[0];
      return {
        ...options,
        input,
      };
    },
    buildStart() {
      demos.splice(0);
      this.addWatchFile(dir);
    },
    load(id) {
      if (/\.demo\.(ts|js)$/g.test(id)) {
        const path = id.split("\\");
        demos.push(path[path.length - 1]);
      }
    },
    generateBundle() {
      demos.forEach((id) => {
        const fileName = `${id.replace(/\.ts|js$/g, "")}`;
        this.emitFile({
          type: "asset",
          fileName: `${fileName}.html`,
          source: `<!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>Title</title>
                <link rel="stylesheet" href="/index.css" />
              </head>
              <body>
                <div id="root"></div>
                <script src="./${fileName}.js" type="module"></script>
              </body>
            </html>`,
        });
      });
      let source = `
        const root = document.querySelector("#root");
        const list = document.querySelector(".list");
        const content = document.querySelector(".content");
        
        const demos = `;

      source += JSON.stringify(demos);

      source += `
      demos.forEach((es)=>{
        const name = es.replace(/\.demo\.(ts|js)$/g, "");
        const filename = es.replace(/\.(ts|js)$/g, "");
        
        const item = document.createElement("div");
        const link = document.createElement("a");
        
        item.classList.add(es);
        
        link.classList.add("link");
        
        link.text = name;
        
        link.href = 
        `;

      source += "`/dist/${filename}.html`";

      source += `
        link.target = "demoContent";
        
        item.appendChild(link);
        list.appendChild(item);
        
      })`;

      this.emitFile({
        type: "asset",
        fileName: "index.js",
        source,
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
  plugins: [
    generateHtmlPlugin(),
    nodeResolve(),
    commonjs(),
    progress(),
    json(),
    typescript(),
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
    // buildDelay: 1000,
  },
  // external: ["d3"],
};

export default rollup;
