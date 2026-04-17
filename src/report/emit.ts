import type { ToreConfig } from "../config/tore-config.zod";
import type { Violation } from "../types/violation";
import type { CheckReport } from "./types";

function escapeGitHubWorkflowMessage(message: string): string {
  return message.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

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

/**
 * GitHub Actions workflow commands for PR annotations (stdout).
 * See https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions
 */
export function emitGitHubWorkflowCommands(report: CheckReport): string {
  const lines = report.violations.map((v) => {
    const kind = v.severity === "error" ? "error" : "warning";
    const msg = escapeGitHubWorkflowMessage(v.message);
    return `::${kind} file=${v.file},line=${v.line},col=${v.column}::${msg}`;
  });
  return lines.length > 0 ? `${lines.join("\n")}\n` : "";
}
