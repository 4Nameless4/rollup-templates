import postcss from "postcss";
import type { AcceptedPlugin } from "postcss";
import postcssImport from "postcss-import";
import postcssModules from "postcss-modules";
import autoprefixer from "autoprefixer";
import { parse, serialize } from "parse5";
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname, extname, basename } from "path";
import { fileURLToPath } from "url";
import { rimrafSync } from "rimraf";
import type { Plugin, OutputChunk } from "rollup";
import { walk } from "nameless4-common";

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
          return {
            code: code.replace(_key, options.replace[key]),
            map: {
              mappings: "",
            },
          };
        }
      }
    },
  };
}

export function cleanOutputPlugin(): Plugin {
  return {
    name: "clearPlugin",
    generateBundle({ dir }) {
      dir && rimrafSync(dir);
    },
  };
}

interface t_node {
  childNodes?: [];
  nodeName: string;
  attrs?: {
    /** The name of the attribute. */
    name: string;
    /** The namespace of the attribute. */
    namespace?: string;
    /** The namespace-related prefix of the attribute. */
    prefix?: string;
    /** The value of the attribute. */
    value: string;
  }[];
}

function resolveHTML(htmlPath: string, mainJSPlace: string) {
  let mainJS = "";
  const html = readFileSync(htmlPath).toString();
  const fragment = parse(html);

  const nodes = fragment.childNodes as t_node[];
  function isElement(node: { nodeName: string }): boolean {
    const nodeName = node.nodeName;
    return !!(
      nodeName !== "#comment" &&
      nodeName !== "#text" &&
      nodeName !== "template" &&
      nodeName !== "#document" &&
      nodeName !== "#document-fragment" &&
      nodeName !== "#documentType"
    );
  }
  walk(
    nodes,
    (node) => {
      const nodeName = node.nodeName;
      if (nodeName !== "script") return;
      if (nodeName !== "script") return;
      if (nodeName !== "script") return;
      const attrMap = new Map();
      const attrs = node.attrs || [];
      attrs.forEach((d) => {
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
    (d) => {
      if (!isElement(d)) {
        return;
      }
      return d.childNodes;
    }
  );
  return { html: serialize(fragment), mainJS };
}
// support '1 html' : '1 main entry javascript' only
interface t_plugin_html {
  src: string;
  path: string;
  entryJSPath: string;
  jsName: string;
}

// the plugin entryHTMLResolve must put postcssResolve,publicResolve later
// becuse postcssResolve and publicResolve plugin will change 'htmlSrc'
// entryHTMLResolve create index.html by 'htmlSrc'
export const plugins = (function () {
  const htmls = new Map<string, t_plugin_html>();

  const publicMap: Record<string, string> = {};

  const getCSSPath = (html: t_plugin_html) => {
    return `assets/${html.jsName}.css`;
  };

  return {
    entryHTMLResolve(): Plugin {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const mainJSPlace = "%${mainjs}$%";

      return {
        name: "entryHTMLResolve",
        options(options) {
          let input = options.input;

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
          const entry = Object.values(bundle).filter(
            (d) => d.type === "chunk" && d.isEntry
          ) as OutputChunk[];
          if (!entry || !htmls.size) return;

          for (const d of entry) {
            const originName = d.facadeModuleId;
            const html = htmls.get(originName || "");
            if (!html) continue;
            // inject replace main javascript
            let src = html.src.replace(mainJSPlace, d.fileName);

            // public resource replace
            for (const origin in publicMap) {
              src = src.replace(origin, publicMap[origin]);
            }

            src = src.replace(
              /<\/head>/,
              `<link rel="stylesheet" href="${getCSSPath(html)}"/>\n</head>`
            );

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
      const cssStrs: Record<
        string,
        {
          str: string;
          fileName: string;
        }
      > = {};

      const entry: Record<string, string> = {};

      return {
        name: "postcssResolve",
        async resolveId(source, importer, options) {
          const resolvedId = await this.resolve(source, importer, options);

          if (!resolvedId) return;
          const srcID = resolvedId.id;
          if (!importer) {
            return;
          } else if (entry[importer]) {
            let entryImport = entry[importer];
            while (entry[entryImport]) {
              entryImport = entry[entryImport];
            }
            entry[srcID] = entryImport;
          } else {
            entry[srcID] = importer;
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

            const cssStr = post.css;

            let _code = `export default ${JSON.stringify(exportCssJSON)}`;

            if (inject) {
              _code =
                `import styleInject from "style-inject";\n` +
                `styleInject(${JSON.stringify(cssStr)});\n` +
                `export default ${JSON.stringify(exportCssJSON)}`;
            }

            if (!inject) {
              const entryJS = entry[file];
              const html = htmls.get(entryJS);
              if (html) {
                const fileName = getCSSPath(html);
                cssStrs[entryJS] ??= {
                  str: "",
                  fileName,
                };
                cssStrs[entryJS].str += cssStr;
              }
            }

            return {
              code: _code,
              map: {
                mappings: "",
              },
            };
          }
          return null;
        },
        generateBundle() {
          if (inject) return;

          for (const entryJS in cssStrs) {
            const css = cssStrs[entryJS];

            this.emitFile({
              type: "asset",
              source: css.str,
              fileName: css.fileName,
            });
          }
        },
      };
    },
    publicResolve(publicPath?: string): Plugin {
      const _publicPath = publicPath || "./public";
      return {
        name: "publicResolve",
        buildStart() {
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
            publicMap[fileName] = toFileName;
          });
        },
      };
    },
  };
})();
