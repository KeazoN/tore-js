import type { Violation } from "../types/violation";

export interface CheckSummary {
  filesScanned: number;
  errorCount: number;
  warnCount: number;
}

export interface CheckReport {
  ok: boolean;
  violations: Violation[];
  summary: CheckSummary;
}
