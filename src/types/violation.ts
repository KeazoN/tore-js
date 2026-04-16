export type ViolationSeverity = "error" | "warn";

export interface Violation {
  ruleId: string;
  severity: ViolationSeverity;
  message: string;
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  snippet?: string;
}
