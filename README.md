<p align="center">
  <img src="https://i.hizliresim.com/4l9u0a3.png" alt="Töre JS" width="280" />
</p>

**Töre JS** is an AST-based CLI that enforces architectural rules on TypeScript and TSX code—useful when AI-assisted workflows generate code that should still match your stack (React, Next.js-style layouts, design-system components, no `any`, no inline styles, and more).

**npm package:** [`@keazon/tore-js`](https://www.npmjs.com/package/@keazon/tore-js) (scoped name required by the registry: unscoped `tore-js` is rejected as too similar to the existing [`tore.js`](https://www.npmjs.com/package/tore.js) package). The **CLI command remains `tore`** after a global install.

Rules are driven by a single constitution file: **`tore.config.json`**.

---

## Features

- **AST analysis** via [ts-morph](https://github.com/dsherret/ts-morph) (not regex-only linting).
- **Configurable rules**: inline `style`, explicit `any`, forbidden JSX intrinsics (e.g. raw `<button>`, `<img>`), component path placement via globs.
- **Machine-readable reports**: JSON on stdout by default; optional GitHub Actions workflow commands via `--format github` for PR annotations.
- **`tore init`**: scaffold `tore.config.json` from the published example template.
- **Optional redaction** of env-like strings in violation snippets.
- **Node 18+** runtime for the published CLI bundle. **Bun** is only needed to run the unit tests in this repository (`bun test`); you do **not** need Bun to install or run `tore` from npm.

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

If Bun is installed but not on your `PATH`, use:

```bash
npm exec -- bun test
```

---

## Quick start

1. Create a constitution file:

   **Option A — CLI scaffold** (after installing the package globally, or via `npx`):

   ```bash
   npx --yes --package=@keazon/tore-js tore init
   ```

   If `tore.config.json` already exists, use `tore init --force` to overwrite it.

   **Option B — copy manually** (or start from `{}`—defaults apply):

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

### Run from `package.json` scripts

```json
{
  "scripts": {
    "lint:constitution": "tore check"
  }
}
```

Then: `npm run lint:constitution` (or `pnpm` / `yarn` equivalent). To avoid a global install, use:

```json
{
  "scripts": {
    "lint:constitution": "npx --yes --package=@keazon/tore-js tore check"
  }
}
```

### CI (GitHub Actions)

Example job that installs your app dependencies, checks out the repo, and runs Töre with **npx** (no global `npm install -g`):

```yaml
jobs:
  tore:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - name: Architectural rules (Töre)
        run: npx --yes --package=@keazon/tore-js tore check
```

Add `--format github` to that command if you want GitHub Actions workflow annotations in the job log (see [Report format](#report-format)).

If you use **pnpm** or **Yarn**, replace `npm ci` with `pnpm install --frozen-lockfile` or `yarn install --frozen-lockfile` and keep the `npx ... tore check` step as shown (or call the local binary from your devDependencies if you add `@keazon/tore-js` to the project).

### Example: violation JSON shape

Given a component with an inline style:

```tsx
// src/App.tsx
export function App() {
  return <div style={{ color: "red" }}>Hello</div>;
}
```

A failing report uses **top-level** `line` and `column` on each violation (not a nested `loc` object), for example:

```json
{
  "ok": false,
  "violations": [
    {
      "ruleId": "no-inline-style",
      "severity": "error",
      "message": "…",
      "file": "/absolute/path/to/src/App.tsx",
      "line": 3,
      "column": 16,
      "snippet": "…"
    }
  ],
  "summary": {
    "filesScanned": 5,
    "errorCount": 1,
    "warnCount": 0
  }
}
```

---

## CLI reference

| Command | Description |
| --- | --- |
| `tore init` | Write `tore.config.json` in the current directory using the published [`tore.config.example.json`](./tore.config.example.json) template. Fails with exit code `2` if the file already exists unless you pass `--force`. |
| `tore check` | Scan files (config `include` / `exclude`, or extra globs after `check`) and print a report to stdout (see `--format`). |
| `tore check --config ./path/tore.config.json` | Use an explicit config file. |
| `tore check --format json` | Print the JSON report (this is the default). |
| `tore check --format github` | Print [GitHub Actions workflow commands](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions) (one line per violation) instead of JSON. Useful for PR annotations in CI. |

### Exit codes

| Code | Meaning |
| --- | --- |
| `0` | No violations with severity `error`. |
| `1` | One or more `error` violations. |
| `2` | Misuse (e.g. unknown command), thrown error (invalid config, missing file), or `tore init` when `tore.config.json` already exists without `--force`. |

---

## Report format

### JSON (default)

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

### GitHub Actions (`--format github`)

With `tore check --format github`, stdout contains one workflow command per violation (errors use `::error`, warnings use `::warning`), each including `file`, `line`, and `col`. There is no JSON payload in this mode. Example:

```text
::error file=/home/runner/work/app/src/App.tsx,line=3,col=16::Inline JSX styles are not allowed.
```

In a workflow job, a failing `tore check` step still fails the job when violations have severity `error`, while annotations show up on the PR diff when GitHub parses these lines from the log.

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
5. **Emit** — JSON report (default) or GitHub workflow commands (`--format github`) and process exit code.

---

## Roadmap

This is a direction of travel, not a release commitment.

- **Docs and discoverability** — Keep [CHANGELOG.md](./CHANGELOG.md) updated, expand CI and onboarding examples in the README, and keep the JSON report shape explicit for tooling authors.
- **Community** — Issue and pull request templates, a code of conduct, and clearer guidance for contributors who want to add rules (see [CONTRIBUTING.md](./CONTRIBUTING.md)).
- **Onboarding** — `tore init` to scaffold `tore.config.json` from the published example (see Quick start).
- **Enterprise-style CI** — Optional `tore check --format github` for GitHub Actions workflow commands (PR annotations).
- **Optional follow-ups** — A supported programmatic Node API could be added later; today the tool is **CLI-only** (see [Programmatic API](#programmatic-api)). CI may surface `npm audit` at high severity as a non-blocking signal.

---

## Publishing checklist (maintainers)

1. Update `version` in `package.json` (semver) and summarize user-visible changes in [CHANGELOG.md](./CHANGELOG.md).
2. Run `npm run typecheck`, `npm run build`, `bun test`, and `node dist/cli.mjs check`.
3. Ensure `repository` / `homepage` / `bugs` in `package.json` match the repo you publish from (canonical: `KeazoN/tore-js`).
4. `npm publish` — `publishConfig.access` is already `"public"` for the scoped name `@keazon/tore-js`. This runs `prepublishOnly` (build + smoke `check`).

The published package ships **`dist/cli.mjs`** plus `dependencies`; it does **not** ship TypeScript sources.

### Programmatic API

This package is distributed as a **CLI** (`tore` binary). There is **no** supported `import "@keazon/tore-js"` or `require("@keazon/tore-js")` API surface today. For automation, run `tore check` as a subprocess and parse JSON from stdout (or use `--format github` in GitHub Actions).

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

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
