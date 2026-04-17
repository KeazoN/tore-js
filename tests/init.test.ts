import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseInitArgs, runInit } from "../src/cli/init";

describe("parseInitArgs", () => {
  test("parses --force", () => {
    expect(parseInitArgs(["--force"])).toEqual({ force: true });
  });
  test("defaults force false", () => {
    expect(parseInitArgs([])).toEqual({ force: false });
  });
  test("rejects unknown flags", () => {
    expect(() => parseInitArgs(["--nope"])).toThrow(/Unknown init argument/);
  });
});

describe("runInit", () => {
  test("writes tore.config.json from published example template", async () => {
    const dir = mkdtempSync(join(tmpdir(), "tore-init-"));
    try {
      await runInit({ cwd: dir, force: false });
      const created = join(dir, "tore.config.json");
      expect(existsSync(created)).toBe(true);
      const text = readFileSync(created, "utf8");
      expect(text).toContain('"rules"');
      expect(text).toContain("$schema");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("refuses overwrite without --force", async () => {
    const dir = mkdtempSync(join(tmpdir(), "tore-init-"));
    try {
      writeFileSync(join(dir, "tore.config.json"), "{}", "utf8");
      await expect(runInit({ cwd: dir, force: false })).rejects.toThrow(/already exists/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("overwrites with --force", async () => {
    const dir = mkdtempSync(join(tmpdir(), "tore-init-"));
    try {
      writeFileSync(join(dir, "tore.config.json"), "{}", "utf8");
      await runInit({ cwd: dir, force: true });
      const text = readFileSync(join(dir, "tore.config.json"), "utf8");
      expect(text).toContain('"rules"');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
