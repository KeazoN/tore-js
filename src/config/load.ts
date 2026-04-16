import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parseToreConfig, type ToreConfig } from "./tore-config.zod";

function findConfigFile(startDir: string, filename: string): string | null {
  let dir = resolve(startDir);
  for (;;) {
    const candidate = join(dir, filename);
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      return null;
    }
    dir = parent;
  }
}

export function loadToreConfig(options: {
  cwd: string;
  configPath?: string;
}): { config: ToreConfig; configPath: string } {
  const filename = "tore.config.json";
  let path: string | null = null;
  if (options.configPath) {
    const resolved = resolve(options.cwd, options.configPath);
    if (!existsSync(resolved)) {
      throw new Error(`Config not found: ${resolved}`);
    }
    path = resolved;
  } else {
    path = findConfigFile(options.cwd, filename);
  }

  if (!path) {
    throw new Error(
      `Could not find ${filename} in ${options.cwd} or any parent directory.`,
    );
  }

  const text = readFileSync(path, "utf8");
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(`Invalid JSON in ${path}: ${message}`);
  }

  const config = parseToreConfig(json);
  return { config, configPath: path };
}
