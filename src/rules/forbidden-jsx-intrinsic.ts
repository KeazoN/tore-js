import { Node, type SourceFile } from "ts-morph";
import type { ToreConfig } from "../config/tore-config.zod";
import type { Violation } from "../types/violation";

const RULE_ID = "forbidden-jsx-intrinsic";

function collectIntrinsicOpens(
  sourceFile: SourceFile,
  callback: (tagName: string, node: { getStart: () => number; getText: () => string }) => void,
): void {
  for (const node of sourceFile.getDescendants()) {
    if (Node.isJsxOpeningElement(node) || Node.isJsxSelfClosingElement(node)) {
      const tag = node.getTagNameNode();
      if (Node.isIdentifier(tag)) {
        callback(tag.getText(), node);
      }
    }
  }
}

export function ruleForbiddenJsxIntrinsic(
  sourceFile: SourceFile,
  config: ToreConfig,
  violations: Violation[],
): void {
  const rule = config.rules.forbiddenIntrinsicElements;
  if (!rule || rule.severity === "off") {
    return;
  }

  const { severity, elements, allowedReplacements } = rule;
  const forbidden = new Map(
    Object.entries(elements).map(([k, v]) => [k.toLowerCase(), v]),
  );
  const replacements = allowedReplacements
    ? new Map(
        Object.entries(allowedReplacements).map(([k, v]) => [
          k.toLowerCase(),
          v,
        ]),
      )
    : undefined;
  if (forbidden.size === 0) {
    return;
  }

  const filePath = sourceFile.getFilePath();

  collectIntrinsicOpens(sourceFile, (tagName, node) => {
    const key = tagName.toLowerCase();
    if (!forbidden.has(key)) {
      return;
    }
    const start = node.getStart();
    const pos = sourceFile.getLineAndColumnAtPos(start);
    const baseMessage = forbidden.get(key) ?? `Intrinsic <${key}> is forbidden.`;
    const hint = replacements?.get(key);
    const message = hint ? `${baseMessage} Prefer: ${hint}.` : baseMessage;
    violations.push({
      ruleId: RULE_ID,
      severity,
      message,
      file: filePath,
      line: pos.line,
      column: pos.column,
      snippet: node.getText().slice(0, 160),
    });
  });
}
