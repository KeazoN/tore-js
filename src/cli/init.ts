import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Replaces the repo-relative schema in the example so consumer projects get IDE validation without copying the file. */
export const PUBLISHED_CONFIG_SCHEMA_URL =
  "https://unpkg.com/@keazon/tore-js@latest/tore.config.schema.json";

/** Presets shipped next to the CLI (`presets/<id>.json`). `default` uses the full example template. */
export const INIT_PRESET_IDS = ["default", "next", "warn-first"] as const;
export type InitPresetId = (typeof INIT_PRESET_IDS)[number];

function rewriteSchemaForInitOutput(content: string): string {
  return content.replace(
    /"\$schema"\s*:\s*"\.\/tore\.config\.schema\.json"/,
    `"$schema": "${PUBLISHED_CONFIG_SCHEMA_URL}"`,
  );
}

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

function resolvePresetFilePath(filename: string): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const fromDist = join(here, "..", "presets", filename);
  const fromSrcCli = join(here, "..", "..", "presets", filename);
  if (existsSync(fromDist)) {
    return fromDist;
  }
  if (existsSync(fromSrcCli)) {
    return fromSrcCli;
  }
  throw new Error(
    `Could not locate presets/${filename} next to the CLI. Is the package installed correctly?`,
  );
}

export function resolveInitTemplatePath(preset: InitPresetId): string {
  if (preset === "default") {
    return resolvePublishedExampleConfigPath();
  }
  const filename = preset === "next" ? "next.json" : "warn-first.json";
  return resolvePresetFilePath(filename);
}

export function parseInitArgs(argv: string[]): {
  force: boolean;
  preset: InitPresetId;
} {
  let force = false;
  let preset: InitPresetId = "default";
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) {
      continue;
    }
    if (arg === "--force") {
      force = true;
      continue;
    }
    if (arg === "--preset") {
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        throw new Error('--preset requires a value (e.g. "default", "next", "warn-first").');
      }
      if (!INIT_PRESET_IDS.includes(next as InitPresetId)) {
        throw new Error(
          `Unknown preset "${next}". Valid presets: ${INIT_PRESET_IDS.join(", ")}.`,
        );
      }
      preset = next as InitPresetId;
      i++;
      continue;
    }
    throw new Error(`Unknown init argument: ${arg}`);
  }
  return { force, preset };
}

export async function runInit(options: {
  cwd: string;
  force: boolean;
  preset?: InitPresetId;
}): Promise<{ preset: InitPresetId }> {
  const preset = options.preset ?? "default";
  const target = join(options.cwd, "tore.config.json");
  if (existsSync(target) && !options.force) {
    throw new Error(`${target} already exists. Pass --force to overwrite.`);
  }
  const templatePath = resolveInitTemplatePath(preset);
  const raw = readFileSync(templatePath, "utf8");
  const content = rewriteSchemaForInitOutput(raw);
  writeFileSync(target, content, "utf8");
  return { preset };
}
