import path from "node:path";
import picomatch from "picomatch";
import type { SourceFile } from "ts-morph";
import type { ToreConfig } from "../config/tore-config.zod";
import type { Violation } from "../types/violation";

const RULE_ID = "component-file-location";

function toPosix(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

function matchesAny(relativePosix: string, patterns: string[]): boolean {
  return patterns.some((p) => picomatch.isMatch(relativePosix, p, { dot: true }));
}

export function ruleComponentFileLocation(
  sourceFile: SourceFile,
  config: ToreConfig,
  cwd: string,
  violations: Violation[],
): void {
  const rule = config.rules.componentFileLocation;
  if (!rule || rule.severity === "off") {
    return;
  }

  const abs = sourceFile.getFilePath();
  const rel = toPosix(path.relative(cwd, abs));
  if (rel.startsWith("..")) {
    return;
  }

  const { severity, include, exclude, allowedPathGlobs } = rule;

  if (!matchesAny(rel, include)) {
    return;
  }
  if (exclude.length > 0 && matchesAny(rel, exclude)) {
    return;
  }
  if (matchesAny(rel, allowedPathGlobs)) {
    return;
  }

  const start = sourceFile.getStart();
  const pos = sourceFile.getLineAndColumnAtPos(start);
  violations.push({
    ruleId: RULE_ID,
    severity,
    message: `File path must match one of allowed globs for components: ${allowedPathGlobs.join(", ")}`,
    file: abs,
    line: pos.line,
    column: pos.column,
    snippet: rel,
  });
}
