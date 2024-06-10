import type { Plugin } from "rollup";
import { IncomingMessage, Server, ServerResponse } from "http";
import serve from "rollup-plugin-serve";

export type t_serve_sever = Server<
  typeof IncomingMessage,
  typeof ServerResponse
>;
export interface t_serve_options {
  // Launch in browser (default: false)
  open?: boolean;

  // Page to navigate to when opening the browser.
  // Will not do anything if open=false.
  // Remember to start with a slash.
  openPage?: string;

  // Show server address in console (default: true)
  verbose?: boolean;

  // Multiple folders to serve from
  contentBase?: string | string[];

  // Set to true to return index.html (200) instead of error page (404)
  // historyApiFallback: boolean,

  // Path to fallback page
  historyApiFallback?: boolean | string;

  // Options used in setting up server
  host?: string;
  port?: number;

  // By default server will be served over HTTP (https: false). It can optionally be served over HTTPS
  https?: {
    key: string;
    cert: string;
    ca: string;
  };

  //set headers
  headers?: Record<string, any>;

  // set custom mime types, usage https://github.com/broofa/mime#mimedefinetypemap-force--false
  mimeTypes?: Record<string, any>;

  // execute function after server has begun listening
  onListening?: (sev: t_serve_sever) => void;

  onGenerated?: (sev: t_serve_sever) => void;
}

export function green(text: string) {
  return "\u001b[1m\u001b[32m" + text + "\u001b[39m\u001b[22m";
}

const defaultOptions: t_serve_options = {
  open: true,
  port: 8000,
  verbose: true,
  contentBase: "dist"
}

export default function server(options?: t_serve_options): Plugin {
  options = Object.assign({}, defaultOptions, options)
  const { onGenerated, onListening, verbose, https } = options;
  let httpSev: null | t_serve_sever = null;
  const server = serve({
    ...options,
    verbose: false,
    onListening(sev: t_serve_sever) {
      onListening && onListening(sev);
      httpSev = sev;
    },
  });

  return {
    ...server,
    generateBundle(...args) {
      server.generateBundle.apply(this, args);
      if (!httpSev) return;
      onGenerated && onGenerated.call(this, httpSev);
      if (verbose) {
        const address = httpSev.address();
        if (!address) return;
        if (typeof address === "string") {
          this.info(green(address));
          return;
        }
        const host = address.address === "::" ? "localhost" : address.address;
        // by using a bound function, we can access options as `this`
        const protocol = https ? "https" : "http";
        this.info("");
        this.info("************** Server ready **************");
        this.info("");
        this.info(`     ${green(`${protocol}://${host}:${address.port}`)}`);
        this.info("");
        this.info("************** Server ready **************");
        this.info("");
      }
    },
  };
}
