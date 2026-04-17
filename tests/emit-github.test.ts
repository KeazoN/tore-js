import { describe, expect, test } from "bun:test";
import { emitGitHubWorkflowCommands } from "../src/report/emit";
import type { CheckReport } from "../src/report/types";

describe("emitGitHubWorkflowCommands", () => {
  test("emits error and warning lines", () => {
    const report: CheckReport = {
      ok: false,
      violations: [
        {
          ruleId: "no-inline-style",
          severity: "error",
          message: "No inline styles",
          file: "/proj/src/App.tsx",
          line: 2,
          column: 10,
        },
        {
          ruleId: "x",
          severity: "warn",
          message: "Heads up",
          file: "/proj/src/B.tsx",
          line: 1,
          column: 1,
        },
      ],
      summary: { filesScanned: 2, errorCount: 1, warnCount: 1 },
    };
    const out = emitGitHubWorkflowCommands(report);
    expect(out).toContain("::error file=/proj/src/App.tsx,line=2,col=10::No inline styles");
    expect(out).toContain("::warning file=/proj/src/B.tsx,line=1,col=1::Heads up");
    expect(out.endsWith("\n")).toBe(true);
  });

  test("escapes percent and newlines in messages", () => {
    const report: CheckReport = {
      ok: false,
      violations: [
        {
          ruleId: "r",
          severity: "error",
          message: "100% bad\nnext",
          file: "/f.ts",
          line: 1,
          column: 1,
        },
      ],
      summary: { filesScanned: 1, errorCount: 1, warnCount: 0 },
    };
    const out = emitGitHubWorkflowCommands(report);
    expect(out).toContain("100%25 bad%0Anext");
  });

  test("returns empty string when there are no violations", () => {
    const report: CheckReport = {
      ok: true,
      violations: [],
      summary: { filesScanned: 0, errorCount: 0, warnCount: 0 },
    };
    expect(emitGitHubWorkflowCommands(report)).toBe("");
  });
});
