import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseInitArgs, runInit } from "../src/cli/init";

describe("parseInitArgs", () => {
  test("parses --force", () => {
    expect(parseInitArgs(["--force"])).toEqual({ force: true, preset: "default" });
  });
  test("defaults force false and preset default", () => {
    expect(parseInitArgs([])).toEqual({ force: false, preset: "default" });
  });
  test("parses --preset next", () => {
    expect(parseInitArgs(["--preset", "next"])).toEqual({
      force: false,
      preset: "next",
    });
  });
  test("parses --preset warn-first with --force in either order", () => {
    expect(parseInitArgs(["--force", "--preset", "warn-first"])).toEqual({
      force: true,
      preset: "warn-first",
    });
    expect(parseInitArgs(["--preset", "warn-first", "--force"])).toEqual({
      force: true,
      preset: "warn-first",
    });
  });
  test("rejects unknown flags", () => {
    expect(() => parseInitArgs(["--nope"])).toThrow(/Unknown init argument/);
  });
  test("rejects unknown preset", () => {
    expect(() => parseInitArgs(["--preset", "nope"])).toThrow(/Unknown preset/);
  });
  test("rejects --preset without value", () => {
    expect(() => parseInitArgs(["--preset"])).toThrow(/--preset requires/);
    expect(() => parseInitArgs(["--preset", "--force"])).toThrow(
      /--preset requires/,
    );
  });
});

describe("runInit", () => {
  test("writes tore.config.json from published example template", async () => {
    const dir = mkdtempSync(join(tmpdir(), "tore-init-"));
    try {
      const { preset } = await runInit({ cwd: dir, force: false });
      expect(preset).toBe("default");
      const created = join(dir, "tore.config.json");
      expect(existsSync(created)).toBe(true);
      const text = readFileSync(created, "utf8");
      expect(text).toContain('"rules"');
      expect(text).toContain("unpkg.com/@keazon/tore-js@latest/tore.config.schema.json");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("writes next preset with App Router style include", async () => {
    const dir = mkdtempSync(join(tmpdir(), "tore-init-"));
    try {
      const { preset } = await runInit({ cwd: dir, force: false, preset: "next" });
      expect(preset).toBe("next");
      const text = readFileSync(join(dir, "tore.config.json"), "utf8");
      expect(text).toContain('"app/**/*.{ts,tsx}"');
      expect(text).toContain("unpkg.com/@keazon/tore-js@latest/tore.config.schema.json");
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
      await runInit({ cwd: dir, force: true, preset: "default" });
      const text = readFileSync(join(dir, "tore.config.json"), "utf8");
      expect(text).toContain('"rules"');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
