import * as esbuild from "esbuild";
import { chmodSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });

await esbuild.build({
  entryPoints: ["src/cli/index.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "dist/cli.mjs",
  banner: { js: "#!/usr/bin/env node\n" },
  /** Leave dependencies to Node's resolver (avoids CJS `require("os")` inside bundled fast-glob/ts-morph). */
  packages: "external",
  logLevel: "info",
});

chmodSync("dist/cli.mjs", 0o755);
