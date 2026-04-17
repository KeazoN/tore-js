import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolves tore.config.example.json next to the installed package (dist/) or dev tree (src/cli/).
 */
export function resolvePublishedExampleConfigPath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const fromDist = join(here, "..", "tore.config.example.json");
  const fromSrcCli = join(here, "..", "..", "tore.config.example.json");
  if (existsSync(fromDist)) {
    return fromDist;
  }
  if (existsSync(fromSrcCli)) {
    return fromSrcCli;
  }
  throw new Error(
    "Could not locate tore.config.example.json next to the CLI. Is the package installed correctly?",
  );
}

export function parseInitArgs(argv: string[]): { force: boolean } {
  let force = false;
  for (const arg of argv) {
    if (arg === "--force") {
      force = true;
      continue;
    }
    throw new Error(`Unknown init argument: ${arg}`);
  }
  return { force };
}

export async function runInit(options: { cwd: string; force: boolean }): Promise<void> {
  const target = join(options.cwd, "tore.config.json");
  if (existsSync(target) && !options.force) {
    throw new Error(`${target} already exists. Pass --force to overwrite.`);
  }
  const examplePath = resolvePublishedExampleConfigPath();
  const content = readFileSync(examplePath, "utf8");
  writeFileSync(target, content, "utf8");
}
