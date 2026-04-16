import type { ToreConfig } from "../config/tore-config.zod";
import type { Violation } from "../types/violation";
import type { CheckReport } from "./types";

const envLikeSnippet = /(API_KEY|SECRET|TOKEN|PASSWORD|BEARER)\s*=\s*\S+/i;

export function maskSnippetIfNeeded(
  snippet: string | undefined,
  mask: boolean,
): string | undefined {
  if (!snippet || !mask) {
    return snippet;
  }
  if (envLikeSnippet.test(snippet)) {
    return "[REDACTED]";
  }
  return snippet;
}

export function applyMaskingToViolations(
  violations: Violation[],
  config: ToreConfig,
): Violation[] {
  const mask = config.security.maskEnvLikeStrings;
  if (!mask) {
    return violations;
  }
  return violations.map((v) => ({
    ...v,
    snippet: maskSnippetIfNeeded(v.snippet, true),
  }));
}

export function buildReport(violations: Violation[], filesScanned: number): CheckReport {
  const errorCount = violations.filter((v) => v.severity === "error").length;
  const warnCount = violations.filter((v) => v.severity === "warn").length;
  return {
    ok: errorCount === 0,
    violations,
    summary: {
      filesScanned,
      errorCount,
      warnCount,
    },
  };
}

export function emitReportJson(report: CheckReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
