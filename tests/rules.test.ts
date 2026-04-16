import { describe, expect, test } from "bun:test";
import { Project, ts } from "ts-morph";
import { parseToreConfig } from "../src/config/tore-config.zod";
import { applyMaskingToViolations } from "../src/report/emit";
import { applyRulesToSourceFile } from "../src/rules";
import type { Violation } from "../src/types/violation";

const cwd = "/proj";

function cfg(overrides: Record<string, unknown>) {
  return parseToreConfig({
    include: ["**/*.{ts,tsx}"],
    exclude: [],
    ...overrides,
  });
}

function minimalRules(rules: Record<string, unknown>) {
  return cfg({ rules });
}

function createTsx(filePath: string, code: string) {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
    },
  });
  return project.createSourceFile(filePath, code, { overwrite: true });
}

function collect(
  filePath: string,
  code: string,
  config: ReturnType<typeof parseToreConfig>,
): Violation[] {
  const sf = createTsx(filePath, code);
  const violations: Violation[] = [];
  applyRulesToSourceFile(sf, config, cwd, violations);
  return violations;
}

describe("no-inline-style", () => {
  test("reports JSX style attribute", () => {
    const config = minimalRules({
      noInlineStyle: { severity: "error" },
      noExplicitAny: { severity: "off" },
    });
    const v = collect(
      `${cwd}/src/x.tsx`,
      `export function X() { return <div style={{ width: 1 }} />; }`,
      config,
    );
    expect(v.some((x) => x.ruleId === "no-inline-style")).toBe(true);
  });
});

describe("no-explicit-any", () => {
  test("reports explicit any in annotation", () => {
    const config = minimalRules({
      noInlineStyle: { severity: "off" },
      noExplicitAny: { severity: "error" },
    });
    const v = collect(`${cwd}/src/a.tsx`, "const x: any = 1;\n", config);
    expect(v.filter((x) => x.ruleId === "no-explicit-any").length).toBeGreaterThanOrEqual(1);
  });

  test("reports as any", () => {
    const config = minimalRules({
      noInlineStyle: { severity: "off" },
      noExplicitAny: { severity: "error" },
    });
    const v = collect(
      `${cwd}/src/b.tsx`,
      "const x = (1 as unknown) as any;\n",
      config,
    );
    expect(v.some((x) => x.ruleId === "no-explicit-any" && x.message.includes("as any"))).toBe(
      true,
    );
  });
});

describe("forbidden-jsx-intrinsic", () => {
  test("reports configured intrinsic tags", () => {
    const config = minimalRules({
      noInlineStyle: { severity: "off" },
      noExplicitAny: { severity: "off" },
      forbiddenIntrinsicElements: {
        severity: "error",
        elements: { button: "no raw button" },
        allowedReplacements: { button: "@/ui/Button" },
      },
    });
    const v = collect(
      `${cwd}/src/x.tsx`,
      `export function X() { return <button type="button" />; }`,
      config,
    );
    const hit = v.find((x) => x.ruleId === "forbidden-jsx-intrinsic");
    expect(hit).toBeDefined();
    expect(hit?.message).toContain("@/ui/Button");
  });
});

describe("component-file-location", () => {
  test("flags tsx under include that is not under allowed globs", () => {
    const config = minimalRules({
      noInlineStyle: { severity: "off" },
      noExplicitAny: { severity: "off" },
      componentFileLocation: {
        severity: "error",
        include: ["src/**/*.tsx"],
        exclude: [],
        allowedPathGlobs: ["**/components/**/*.tsx"],
      },
    });
    const v = collect(
      `${cwd}/src/pages/Home.tsx`,
      "export function Home() { return null; }\n",
      config,
    );
    expect(v.some((x) => x.ruleId === "component-file-location")).toBe(true);
  });

  test("allows tsx under components", () => {
    const config = minimalRules({
      noInlineStyle: { severity: "off" },
      noExplicitAny: { severity: "off" },
      componentFileLocation: {
        severity: "error",
        include: ["src/**/*.tsx"],
        exclude: [],
        allowedPathGlobs: ["**/components/**/*.tsx"],
      },
    });
    const v = collect(
      `${cwd}/src/components/Card.tsx`,
      "export function Card() { return null; }\n",
      config,
    );
    expect(v.some((x) => x.ruleId === "component-file-location")).toBe(false);
  });
});

describe("report masking", () => {
  test("redacts env-like snippets when enabled", () => {
    const config = parseToreConfig({
      include: ["**/*.ts"],
      exclude: [],
      rules: {
        noInlineStyle: { severity: "off" },
        noExplicitAny: { severity: "off" },
      },
      security: { maskEnvLikeStrings: true },
    });
    const masked = applyMaskingToViolations(
      [
        {
          ruleId: "x",
          severity: "error",
          message: "m",
          file: "/f.ts",
          line: 1,
          column: 1,
          snippet: "API_KEY=supersecret",
        },
      ],
      config,
    );
    expect(masked[0]?.snippet).toBe("[REDACTED]");
  });
});
