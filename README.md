<p align="center">
  <img src="https://hizliresim.com/4l9u0a3.png" alt="Töre JS" width="280" />
</p>

**Töre JS** is an AST-based CLI that enforces architectural rules on TypeScript and TSX code—useful when AI-assisted workflows generate code that should still match your stack (React, Next.js-style layouts, design-system components, no `any`, no inline styles, and more).

**npm package:** [`@keazon/tore-js`](https://www.npmjs.com/package/@keazon/tore-js) (scoped name required by the registry: unscoped `tore-js` is rejected as too similar to the existing [`tore.js`](https://www.npmjs.com/package/tore.js) package). The **CLI command remains `tore`** after a global install.

Rules are driven by a single constitution file: **`tore.config.json`**.

---

## Features

- **AST analysis** via [ts-morph](https://github.com/dsherret/ts-morph) (not regex-only linting).
- **Configurable rules**: inline `style`, explicit `any`, forbidden JSX intrinsics (e.g. raw `<button>`, `<img>`), component path placement via globs.
- **Machine-readable reports**: JSON on stdout for agents and CI.
- **Optional redaction** of env-like strings in violation snippets.
- **Node 18+** runtime for the published CLI bundle; **Bun** recommended for local development and tests.

---

## Installation

### npm (global CLI)

```bash
npm install -g @keazon/tore-js
```

Then:

```bash
tore check
```

### npx (no global install)

```bash
npx --yes --package=@keazon/tore-js tore check
```

### From source (contributors)

Canonical repository: [github.com/KeazoN/tore-js](https://github.com/KeazoN/tore-js). If you publish from a fork, update `repository`, `bugs`, and `homepage` in `package.json` first.

```bash
git clone https://github.com/KeazoN/tore-js.git
cd tore-js
npm ci
npm run build
node dist/cli.mjs check
```

Unit tests require [Bun](https://bun.sh):

```bash
bun test
```

---

## Quick start

1. Copy the example constitution (or start from `{}`—defaults apply):

   ```bash
   cp tore.config.example.json tore.config.json
   ```

2. Point your editor at the JSON Schema (autocomplete and validation):

   ```json
   {
     "$schema": "https://unpkg.com/@keazon/tore-js@latest/tore.config.schema.json"
   }
   ```

   For a local clone, you can keep `"$schema": "./tore.config.schema.json"`.

3. Run the checker from your app root:

   ```bash
   tore check
   ```

4. Optionally scope paths:

   ```bash
   tore check "src/components/**/*.tsx"
   ```

---

## CLI reference

| Command | Description |
| --- | --- |
| `tore check` | Scan files (config `include` / `exclude`, or extra globs after `check`) and print a JSON report. |
| `tore check --config ./path/tore.config.json` | Use an explicit config file. |

### Exit codes

| Code | Meaning |
| --- | --- |
| `0` | No violations with severity `error`. |
| `1` | One or more `error` violations. |
| `2` | Misuse (e.g. unknown command) or thrown error (invalid config, missing file). |

---

## Report format

Stdout is a single JSON object:

```json
{
  "ok": true,
  "violations": [
    {
      "ruleId": "no-inline-style",
      "severity": "error",
      "message": "…",
      "file": "/absolute/path/to/File.tsx",
      "line": 12,
      "column": 5,
      "snippet": "…"
    }
  ],
  "summary": {
    "filesScanned": 42,
    "errorCount": 0,
    "warnCount": 0
  }
}
```

When `security.maskEnvLikeStrings` is `true`, snippets that look like secrets may be replaced with `[REDACTED]`.

---

## Configuration

Full schema: [`tore.config.schema.json`](./tore.config.schema.json) (also published in the npm package).

### Top-level fields

| Field | Purpose |
| --- | --- |
| `$schema` | Optional; IDE support for validation. |
| `version` | Your own config version string or number (informational). |
| `include` | Glob list when no CLI paths are passed (default: `["src/**/*.{ts,tsx}"]`). |
| `exclude` | Glob list ignored when expanding files (default ignores `node_modules`, `dist`, `.next`). |
| `rules` | Rule toggles and options (see below). |
| `security.maskEnvLikeStrings` | When `true`, redact env-like patterns in violation snippets. |

### Rules

| Rule ID | Config key | What it does |
| --- | --- | --- |
| `no-inline-style` | `rules.noInlineStyle` | Forbids JSX `style={{ … }}`. |
| `no-explicit-any` | `rules.noExplicitAny` | Flags `any`, `as any`, and explicit `any` type references. |
| `forbidden-jsx-intrinsic` | `rules.forbiddenIntrinsicElements` | Flags lowercase intrinsic tags you list (e.g. `button`, `img`) with optional `allowedReplacements` hints. |
| `component-file-location` | `rules.componentFileLocation` | If a file path matches `include` and not `exclude`, it must match at least one of `allowedPathGlobs` (posix paths, relative to the project cwd). |

Each rule supports `severity`: `"error"`, `"warn"`, or `"off"`.

### Examples

- **[tore.config.example.json](./tore.config.example.json)** — full-featured template.
- **[examples/](./examples/)** — minimal, Next.js App Router, and warn-only samples. See [examples/README.txt](./examples/README.txt).

---

## How it works

1. **Resolve config** — Walks up from the current working directory for `tore.config.json` unless `--config` is set.
2. **Discover files** — Uses [fast-glob](https://github.com/mrmlnc/fast-glob) with `include` / `exclude` (or CLI globs).
3. **Parse** — Builds one [ts-morph](https://github.com/dsherret/ts-morph) `Project` and adds each file.
4. **Run rules** — Each rule inspects the AST and appends violations.
5. **Emit** — JSON report and process exit code.

---

## Publishing checklist (maintainers)

1. Update `version` in `package.json` (semver).
2. Run `npm run typecheck`, `npm run build`, `bun test`, and `node dist/cli.mjs check`.
3. Ensure `repository` / `homepage` / `bugs` in `package.json` match the repo you publish from (canonical: `KeazoN/tore-js`).
4. `npm publish` — `publishConfig.access` is already `"public"` for the scoped name `@keazon/tore-js`. This runs `prepublishOnly` (build + smoke `check`).

The published package ships **`dist/cli.mjs`** plus `dependencies`; it does **not** ship TypeScript sources.

---

## Limitations (v0.1)

- No SWC parser swap yet (ts-morph only).
- Component paths are **filesystem glob** checks, not full `tsconfig` path-alias resolution for `@/`.
- Designed for **local / CI dev** workflows, not as a production build hook.

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
