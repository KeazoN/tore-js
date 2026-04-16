import { loadToreConfig } from "../config/load";
import { runCheck } from "../engine/run-check";
import { emitReportJson } from "../report/emit";

function parseCheckArgs(argv: string[]): {
  filePatterns: string[];
  configPath?: string;
} {
  const filePatterns: string[] = [];
  let configPath: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) {
      continue;
    }
    if (arg === "--config") {
      const next = argv[i + 1];
      if (!next) {
        throw new Error("--config requires a path argument.");
      }
      configPath = next;
      i++;
      continue;
    }
    filePatterns.push(arg);
  }
  return { filePatterns, configPath };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = argv[0];
  if (command !== "check") {
    console.error("Usage: tore check [--config <path>] [globs-or-files...]");
    process.exit(2);
  }

  const cwd = process.cwd();
  const { filePatterns, configPath } = parseCheckArgs(argv.slice(1));
  const { config } = loadToreConfig({ cwd, configPath });

  const report = await runCheck({
    cwd,
    config,
    filePatterns: filePatterns.length > 0 ? filePatterns : undefined,
  });

  process.stdout.write(emitReportJson(report));
  process.exit(report.ok ? 0 : 1);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(2);
});
