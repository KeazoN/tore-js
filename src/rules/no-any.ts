import { Node, type SourceFile } from "ts-morph";
import type { ToreConfig } from "../config/tore-config.zod";
import type { Violation } from "../types/violation";

const RULE_ID = "no-explicit-any";

function push(
  violations: Violation[],
  severity: "error" | "warn",
  filePath: string,
  node: { getStart: () => number; getText: () => string },
  sourceFile: SourceFile,
  message: string,
): void {
  const start = node.getStart();
  const pos = sourceFile.getLineAndColumnAtPos(start);
  violations.push({
    ruleId: RULE_ID,
    severity,
    message,
    file: filePath,
    line: pos.line,
    column: pos.column,
    snippet: node.getText().slice(0, 120),
  });
}

export function ruleNoExplicitAny(
  sourceFile: SourceFile,
  config: ToreConfig,
  violations: Violation[],
): void {
  const severity = config.rules.noExplicitAny.severity;
  if (severity === "off") {
    return;
  }

  const filePath = sourceFile.getFilePath();

  for (const node of sourceFile.getDescendants()) {
    if (Node.isAnyKeyword(node)) {
      push(
        violations,
        severity,
        filePath,
        node,
        sourceFile,
        "Explicit `any` is forbidden; use a concrete type or `unknown` + narrowing.",
      );
      continue;
    }

    if (Node.isTypeReference(node)) {
      const typeName = node.getTypeName();
      if (typeName.getText() === "any") {
        push(
          violations,
          severity,
          filePath,
          node,
          sourceFile,
          "Explicit `any` type reference is forbidden.",
        );
      }
      continue;
    }

    if (Node.isAsExpression(node)) {
      const typeNode = node.getTypeNode();
      if (typeNode?.getText() === "any") {
        push(
          violations,
          severity,
          filePath,
          node,
          sourceFile,
          "`as any` is forbidden.",
        );
      }
    }
  }
}
