<p align="center">
  <img src="https://i.hizliresim.com/4l9u0a3.png" alt="Töre JS" width="280" />
</p>

**Töre JS** is an AST-based **architectural guardian** CLI for TypeScript and TSX: it encodes team-level rules (design-system boundaries, Next-style layout habits, no `any`, no inline styles, and more). It **complements ESLint and TypeScript**—use ESLint for general linting and Töre for constitution-style checks, especially when **AI-assisted** edits should still match your stack.

Scans TypeScript and TSX files and reports what breaks your rules (for example `style={{}}`, `any`, raw `<button>`). One config file: **`tore.config.json`**.

**Package:** [`@keazon/tore-js`](https://www.npmjs.com/package/@keazon/tore-js) — after install the command is **`tore`**. The npm name is scoped (`@keazon/...`); you still run `tore` in the terminal.

---

## Install

**Global:**

```bash
npm install -g @keazon/tore-js
```

**Without adding it to the project (recommended):**

```bash
npx --yes --package=@keazon/tore-js tore check
```

**Node 18+** is enough. You do **not** need Bun to run the tool (Bun is only for running tests in this repo).

---

## First run

1. Create a config at the project root:

   ```bash
   npx --yes --package=@keazon/tore-js tore init
   ```

   **Presets:** `tore init --preset next` (Next.js App Router–oriented) or `tore init --preset warn-first` (same shapes, severities mostly `warn` for gradual rollout). Omit `--preset` for the full default template (same as `tore init --preset default`).

   This copies the chosen template and sets `$schema` to the **published** JSON Schema on unpkg so your editor can autocomplete **without** copying `tore.config.schema.json` into your app.

   If `tore.config.json` already exists, use `tore init --force` to overwrite. If you do **not** use `tore init`, copy `tore.config.example.json` yourself and either keep `"$schema": "./tore.config.schema.json"` (and copy the schema file next to it) or set `$schema` to `https://unpkg.com/@keazon/tore-js@latest/tore.config.schema.json`.

2. Run the check:

   ```bash
   tore check
   ```

   Only some paths: `tore check "src/components/**/*.tsx"`

---

## From `package.json`

```json
{
  "scripts": {
    "tore": "npx --yes --package=@keazon/tore-js tore check"
  }
}
```

Then: `npm run tore`

---

## Commands (short)

| Command | What it does |
| --- | --- |
| `tore init` | Writes `tore.config.json` from the published example template (`--preset default`). |
| `tore init --preset next` | Next.js App Router–oriented preset (see `presets/` in the repo). |
| `tore init --preset warn-first` | Gradual rollout: key rules at `warn` severity. |
| `tore init --force` | Overwrites if the file already exists. |
| `tore check` | Scans and prints **JSON** to stdout. |
| `tore check --config path/to/tore.config.json` | Use another config file. |
| `tore check --format github` | Prints GitHub Actions workflow lines instead of JSON (for PR annotations). |

**Exit codes:** `0` = no `error`-severity issues, `1` = at least one `error`, `2` = bad CLI usage / config error / `tore init` without `--force` when the file exists.

---

## Output (JSON)

Shape: `ok`, `violations[]`, `summary`. Each violation has `ruleId`, `severity`, `message`, `file`, `line`, `column` (and sometimes `snippet`).

```json
{
  "ok": false,
  "violations": [
    {
      "ruleId": "no-inline-style",
      "severity": "error",
      "message": "…",
      "file": "/absolute/path/App.tsx",
      "line": 3,
      "column": 16
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

## Rules (config keys)

Full types and fields: **[tore.config.schema.json](./tore.config.schema.json)** and **[tore.config.example.json](./tore.config.example.json)**. More samples: **[examples/](./examples/)**.

| ruleId | Under `rules` | In short |
| --- | --- | --- |
| `no-inline-style` | `noInlineStyle` | No JSX `style={{…}}` |
| `no-explicit-any` | `noExplicitAny` | No `any` / `as any` |
| `forbidden-jsx-intrinsic` | `forbiddenIntrinsicElements` | Block listed intrinsic tags (e.g. `button`) |
| `component-file-location` | `componentFileLocation` | TSX paths must match allowed globs |

Each rule: `severity` is `"error"`, `"warn"`, or `"off"`.

---

## GitHub Actions (example)

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: "20"
    cache: "npm"
- run: npm ci
- run: npx --yes --package=@keazon/tore-js tore check
```

Add `--format github` to the last line if you want inline annotations on the PR. With pnpm/yarn, change only the install step; the `npx ... tore` line can stay the same.

---

## Programmatic API

None. CLI only: run it in a shell and read JSON (or use `--format github` in Actions).

---

## Limits (v0.1)

- Parser: ts-morph only (no SWC swap yet).
- Path rules: globs only; no full `@/` tsconfig alias resolution.
- Meant for **local / CI** checks, not as a production build hook.

---

## Roadmap (not a release promise)

Shipped: `tore init`, presets, GitHub output format, community templates. **Next directions** (detail: [docs/ROADMAP.md](./docs/ROADMAP.md)): optional **Node API**, **SARIF** and richer CI reporting, **performance** (large monorepos / changed-files mode; parser story in README limits). See [CHANGELOG.md](./CHANGELOG.md), [docs/RULE_BACKLOG.md](./docs/RULE_BACKLOG.md), and [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Source and contributing

Repo: [github.com/KeazoN/tore-js](https://github.com/KeazoN/tore-js). From a clone: `npm ci` → `npm run build` → `node dist/cli.mjs check`. Tests: `bun test` or `npm exec -- bun test`.

**Publishers:** bump version and [CHANGELOG.md](./CHANGELOG.md); run typecheck, build, tests; then `npm publish` — details in [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT — [LICENSE](./LICENSE).

[CONTRIBUTING](./CONTRIBUTING.md) · [CODE_OF_CONDUCT](./CODE_OF_CONDUCT.md) · [CHANGELOG](./CHANGELOG.md)
