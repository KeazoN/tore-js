import { loadToreConfig } from "../config/load";
import { runCheck } from "../engine/run-check";
import { emitGitHubWorkflowCommands, emitReportJson } from "../report/emit";
import { parseInitArgs, runInit } from "./init";

type ReportFormat = "json" | "github";

function parseCheckArgs(argv: string[]): {
  filePatterns: string[];
  configPath?: string;
  format: ReportFormat;
} {
  const filePatterns: string[] = [];
  let configPath: string | undefined;
  let format: ReportFormat = "json";
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
    if (arg === "--format") {
      const next = argv[i + 1];
      if (!next) {
        throw new Error('--format requires "json" or "github".');
      }
      if (next !== "json" && next !== "github") {
        throw new Error('--format must be "json" or "github".');
      }
      format = next;
      i++;
      continue;
    }
    filePatterns.push(arg);
  }
  return { filePatterns, configPath, format };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = argv[0];
  if (command === "init") {
    const { force } = parseInitArgs(argv.slice(1));
    await runInit({ cwd: process.cwd(), force });
    console.error("Wrote tore.config.json");
    process.exit(0);
    return;
  }
  if (command !== "check") {
    console.error(
      "Usage: tore check [--config <path>] [--format json|github] [globs-or-files...]\n       tore init [--force]",
    );
    process.exit(2);
  }

  const cwd = process.cwd();
  const { filePatterns, configPath, format } = parseCheckArgs(argv.slice(1));
  const { config } = loadToreConfig({ cwd, configPath });

  const report = await runCheck({
    cwd,
    config,
    filePatterns: filePatterns.length > 0 ? filePatterns : undefined,
  });

  if (format === "github") {
    process.stdout.write(emitGitHubWorkflowCommands(report));
  } else {
    process.stdout.write(emitReportJson(report));
  }
  process.exit(report.ok ? 0 : 1);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(2);
});
