import fg from "fast-glob";
import { createProject } from "./create-project";
import type { ToreConfig } from "../config/tore-config.zod";
import {
  applyMaskingToViolations,
  buildReport,
} from "../report/emit";
import type { CheckReport } from "../report/types";
import { applyRulesToSourceFile } from "../rules";
import type { Violation } from "../types/violation";

export async function runCheck(options: {
  cwd: string;
  config: ToreConfig;
  filePatterns?: string[];
}): Promise<CheckReport> {
  const { cwd, config } = options;
  const patterns =
    options.filePatterns && options.filePatterns.length > 0
      ? options.filePatterns
      : config.include;

  const absolutePaths = await fg(patterns, {
    cwd,
    ignore: config.exclude,
    absolute: true,
    onlyFiles: true,
    unique: true,
  });

  const project = createProject(absolutePaths);
  const violations: Violation[] = [];

  for (const sourceFile of project.getSourceFiles()) {
    applyRulesToSourceFile(sourceFile, config, cwd, violations);
  }

  const masked = applyMaskingToViolations(violations, config);
  return buildReport(masked, project.getSourceFiles().length);
}
