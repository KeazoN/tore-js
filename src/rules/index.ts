import type { SourceFile } from "ts-morph";
import type { ToreConfig } from "../config/tore-config.zod";
import type { Violation } from "../types/violation";
import { ruleComponentFileLocation } from "./component-location";
import { ruleForbiddenJsxIntrinsic } from "./forbidden-jsx-intrinsic";
import { ruleNoExplicitAny } from "./no-any";
import { ruleNoInlineStyle } from "./no-inline-style";

export function applyRulesToSourceFile(
  sourceFile: SourceFile,
  config: ToreConfig,
  cwd: string,
  violations: Violation[],
): void {
  ruleNoInlineStyle(sourceFile, config, violations);
  ruleNoExplicitAny(sourceFile, config, violations);
  ruleForbiddenJsxIntrinsic(sourceFile, config, violations);
  ruleComponentFileLocation(sourceFile, config, cwd, violations);
}
