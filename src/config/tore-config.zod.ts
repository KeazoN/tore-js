import { z } from "zod";

const severitySchema = z.enum(["error", "warn", "off"]);

const noInlineStyleRuleSchema = z
  .object({
    severity: severitySchema.default("error"),
  })
  .default({ severity: "error" });

const noExplicitAnyRuleSchema = z
  .object({
    severity: severitySchema.default("error"),
  })
  .default({ severity: "error" });

const forbiddenIntrinsicElementsRuleSchema = z.object({
  severity: severitySchema.default("error"),
  elements: z.record(z.string()).default({}),
  allowedReplacements: z.record(z.string()).optional(),
});

const componentFileLocationRuleSchema = z.object({
  severity: severitySchema.default("error"),
  include: z.array(z.string()).default(["src/**/*.tsx"]),
  exclude: z.array(z.string()).default(["**/*.test.tsx", "**/*.spec.tsx"]),
  allowedPathGlobs: z.array(z.string()).default(["**/components/**/*.tsx"]),
});

export const toreConfigSchema = z.object({
  $schema: z.string().optional(),
  version: z.union([z.string(), z.number()]).optional(),
  include: z.array(z.string()).default(["src/**/*.{ts,tsx}"]),
  exclude: z.array(z.string()).default([
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
  ]),
  rules: z
    .object({
      noInlineStyle: noInlineStyleRuleSchema,
      noExplicitAny: noExplicitAnyRuleSchema,
      forbiddenIntrinsicElements:
        forbiddenIntrinsicElementsRuleSchema.optional(),
      componentFileLocation: componentFileLocationRuleSchema.optional(),
    })
    .default({
      noInlineStyle: { severity: "error" },
      noExplicitAny: { severity: "error" },
    }),
  security: z
    .object({
      maskEnvLikeStrings: z.boolean().default(false),
    })
    .default({ maskEnvLikeStrings: false }),
});

export type ToreConfig = z.infer<typeof toreConfigSchema>;

export function parseToreConfig(raw: unknown): ToreConfig {
  return toreConfigSchema.parse(raw);
}
