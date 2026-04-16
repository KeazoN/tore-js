import { Node, type SourceFile } from "ts-morph";
import type { ToreConfig } from "../config/tore-config.zod";
import type { Violation } from "../types/violation";

const RULE_ID = "no-inline-style";

export function ruleNoInlineStyle(
  sourceFile: SourceFile,
  config: ToreConfig,
  violations: Violation[],
): void {
  const severity = config.rules.noInlineStyle.severity;
  if (severity === "off") {
    return;
  }

  const filePath = sourceFile.getFilePath();

  for (const node of sourceFile.getDescendants()) {
    if (!Node.isJsxAttribute(node)) {
      continue;
    }
    const nameNode = node.getNameNode();
    if (nameNode.getText() !== "style") {
      continue;
    }
    const start = node.getStart();
    const pos = sourceFile.getLineAndColumnAtPos(start);
    const snippet = node.getText().slice(0, 200);
    violations.push({
      ruleId: RULE_ID,
      severity,
      message: "Inline JSX `style={{...}}` is forbidden; use Tailwind/className or your design tokens.",
      file: filePath,
      line: pos.line,
      column: pos.column,
      snippet,
    });
  }
}
