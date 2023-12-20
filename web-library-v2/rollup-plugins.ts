import postcss from "postcss";
import type { AcceptedPlugin } from "postcss";
import postcssImport from "postcss-import";
import postcssModules from "postcss-modules";
import autoprefixer from "autoprefixer";
import { parse, serialize } from "parse5";
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname, extname, basename } from "path";
import { fileURLToPath } from "url";
import { rimraf } from "rimraf";
import type { Plugin, OutputChunk } from "rollup";

function walk<T>(
  data: T | T[],
  call: (data: T, deep: number, pre: T | null) => boolean | void | undefined,
  getChildren: (
    data: T,
    deep: number,
    pre: T | null
  ) => T[] | false | void | undefined
) {
  let deep = 0;
  let pre: T | null = null;
  function _walk(data: T) {
    const result = call(data, deep, pre);
    const children = getChildren(data, deep, pre);
    pre = data;
    deep++;
    if (children && !result) {
      children.forEach((d) => {
        _walk(d);
      });
    }
  }
  if (Array.isArray(data)) {
    data.forEach((d) => {
      _walk(d);
    });
  } else {
    _walk(data);
  }
}

export function replaceStrPlugin(options: {
  replace: Record<string, string>;
}): Plugin {
  return {
    name: "replaceStr",
    transform(code) {
      // 可以使用 @rollup/plugin-replace 插件
      for (const key in options.replace) {
        const _key = new RegExp(`\\b${key}\\b`, "g");
        if (_key.test(code)) {
          return code.replace(_key, options.replace[key]);
        }
      }
    },
  };
}

export function cleanOutputPlugin(): Plugin {
  return {
    name: "clearPlugin",
    async generateBundle({ dir }) {
      await (dir && rimraf(dir));
    },
  };
}

function resolveHTML(htmlPath: string, mainJSPlace: string) {
  let mainJS = "";
  let html = readFileSync(htmlPath).toString();
  const fragment = parse(html);
  const nodes = fragment.childNodes;
  walk(
    nodes,
    (node) => {
      const nodeName = node.nodeName;
      if (nodeName !== "script") return;
      const attrMap = new Map();
      node.attrs.forEach((d: any) => {
        attrMap.set(d.name, d);
      });
      if (attrMap.get("type").value === "module") {
        const src = attrMap.get("src");
        const originName = src.value;
        mainJS = resolve(dirname(htmlPath), originName);
        src.value = mainJSPlace;
        return true;
      }
    },
    (d: any) => d.childNodes
  );
  return { html: serialize(fragment), mainJS };
}
// support '1 html' : '1 main entry javascript' only
type t_plugin_html = {
  src: string;
  path: string;
  entryJSPath: string;
  jsName: string;
  css: string;
  publicMap: Record<string, string>;
};

// the plugin entryHTMLResolve must put postcssResolve,publicResolve later
// becuse postcssResolve and publicResolve plugin will change 'htmlSrc'
// entryHTMLResolve create index.html by 'htmlSrc'
export const plugins = (function () {
  const htmls: Map<string, t_plugin_html> = new Map();

  return {
    entryHTMLResolve(): Plugin {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const mainJSPlace = "%${mainjs}$%";

      return {
        name: "entryHTMLResolve",
        options(options) {
          let input = options.input;
          htmls.clear();

          const getJSEntry = (htmlPath: string) => {
            const rootHTML = resolve(__dirname, htmlPath);
            const resHTML = resolveHTML(rootHTML, mainJSPlace);
            const entry = resHTML.mainJS;
            if (!entry) {
              this.error(`Not Found main enter javascript in ${rootHTML}`);
            }
            htmls.set(entry, {
              src: resHTML.html,
              path: rootHTML,
              entryJSPath: entry,
              jsName: basename(entry).replace(extname(entry), ""),
              css: "",
              publicMap: {},
            });
            return entry;
          };

          if (!input) return;

          if (typeof input === "string") {
            extname(input) === ".html" && (input = getJSEntry(input));
          } else if (Array.isArray(input)) {
            input = input.map((d) => getJSEntry(d));
          } else {
            for (const d in input) {
              input[d] = getJSEntry(input[d]);
            }
          }
          return Object.assign(options, { input: input });
        },
        generateBundle(_, bundle) {
          // get entry info
          const entry: OutputChunk[] | undefined = Object.values(bundle).filter(
            (d) => d.type === "chunk" && d.isEntry
          ) as any;
          if (!entry || !htmls.size) return;

          for (const d of entry) {
            const originName = d.facadeModuleId;
            const html = htmls.get(originName || "");
            if (!html) continue;
            const src = html.src.replace(mainJSPlace, d.fileName);
            this.emitFile({
              type: "asset",
              fileName: basename(html.path),
              source: src,
            });
            this.addWatchFile(html.path);
          }
        },
      };
    },
    /**
     *
     * @param options fileName: string default: "style"
     * @returns
     */
    postcssResolve(
      options: {
        plugins?: AcceptedPlugin[];
        inject?: boolean;
      } = {}
    ): Plugin {
      const { plugins = [], inject = false } = options;

      const postPlugins: AcceptedPlugin[] = [
        autoprefixer(),
        postcssImport(),
        ...plugins,
      ] as AcceptedPlugin[];
      const cssFiles: Record<
        string,
        {
          path: string;
          code: string;
          css: string;
        }[]
      > = {};

      let entry: Record<string, string> = {};

      return {
        name: "postcssResolve",
        buildStart() {
          entry = {};
        },
        resolveId(src, importer) {
          if (!importer) {
            return;
          } else if (entry[importer]) {
            let entryImport = entry[importer];
            while (entry[entryImport]) {
              entryImport = entry[entryImport];
            }
            entry[src] = entryImport;
          } else {
            entry[src] = importer;
          }
        },
        async transform(code, file) {
          // 主要是解析css文件
          // 这些代码可以直接使用rollup-plugin-postcss
          if (/\.(css|less|sass|postcss|stylus)$/g.test(file)) {
            const _postPlugins: AcceptedPlugin[] = postPlugins.concat([]);

            let exportCssJSON;
            if (/\.module\.[^.]+$/.test(file)) {
              _postPlugins.push(
                postcssModules({
                  getJSON(_, json) {
                    exportCssJSON = json;
                  },
                })
              );
            }
            const post = await postcss(_postPlugins).process(code, {
              to: file,
              from: file,
            });

            let _code = `export default ${JSON.stringify(exportCssJSON)}`;

            if (inject) {
              _code =
                `import styleInject from "style-inject";\n` +
                `styleInject(${JSON.stringify(post.css)})`;
            }

            const entryJS = entry[file];
            cssFiles[entryJS] ??= [];
            cssFiles[entryJS].push({
              path: file,
              code: _code,
              css: post.css,
            });

            return _code;
          }
          return null;
        },
        generateBundle() {
          if (inject) return;

          for (const entryJS in cssFiles) {
            const html = htmls.get(entryJS);
            let cssStr = "";

            if (!html) return;
            cssFiles[entryJS].forEach((d) => {
              cssStr += d.css;
            });

            const cssFileName = `assets/${html.jsName}.css`;
            this.emitFile({
              type: "asset",
              source: cssStr,
              fileName: cssFileName,
            });

            html.src = html.src.replace(
              /<\/head>/,
              `<link rel="stylesheet" href="${cssFileName}"/>\n</head>`
            );
          }
        },
      };
    },
    publicResolve(publicPath?: string): Plugin {
      const _publicPath = publicPath || "./public";
      return {
        name: "publicResolve",
        generateBundle() {
          // generate public resource
          const dir = readdirSync(_publicPath);
          dir.forEach((fileName) => {
            const filePath = resolve(_publicPath, fileName);
            const fileSource = readFileSync(filePath).toString();

            // if (filePath === entryHTML) return;
            if (extname(filePath) === ".html") return;
            const toFileName = `assets/${fileName}`;
            this.emitFile({
              type: "asset",
              fileName: toFileName,
              source: fileSource,
            });

            this.addWatchFile(filePath);
            htmls.forEach((d) => {
              d.src = d.src.replace(fileName, toFileName);
            });
          });
        },
      };
    },
  };
})();
