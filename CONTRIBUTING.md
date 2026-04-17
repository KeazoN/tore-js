<p align="center">
  <img src="https://i.hizliresim.com/4l9u0a3.png" alt="Töre JS" width="200" />
</p>

# Contributing to Töre JS

## Prerequisites

- **Node.js** 18 or newer (for `npm`, `esbuild` build, and running `node dist/cli.mjs`).
- **Bun** (for `bun test` and optional `bun run src/cli/index.ts check` during development). If `bun` is not on your `PATH`, you can run tests with `npm exec -- bun test`.

## Workflow

1. Fork and clone the repository.
2. `npm ci`
3. `npm run build` — produces `dist/cli.mjs`.
4. `npm run typecheck` — strict TypeScript, no emit.
5. `bun test` — unit tests with in-memory ts-morph fixtures.
6. `node dist/cli.mjs check` — smoke test against the repo’s `tore.config.json`.

## Project layout

See [project-hierarchy.txt](./project-hierarchy.txt) for a concise map of directories and files.

## Pull requests

- Keep changes focused on a single concern.
- Ensure tests pass and the bundled CLI still runs `check` after your changes.
- Prefer English for user-facing strings, comments in shared config examples, and documentation.

This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Adding a new rule

1. **Implement the rule** in `src/rules/` as a function that receives a `ts-morph` `SourceFile`, the parsed `ToreConfig`, and pushes `Violation` objects (see [`src/types/violation.ts`](./src/types/violation.ts)). Register it from [`src/rules/index.ts`](./src/rules/index.ts) inside `applyRulesToSourceFile`.

2. **Configuration** — Extend [`src/config/tore-config.zod.ts`](./src/config/tore-config.zod.ts) with defaults and validation for your rule block, and mirror the same shape in [`tore.config.schema.json`](./tore.config.schema.json) so editors and `$schema` keep working.

3. **Tests** — Add focused cases in [`tests/rules.test.ts`](./tests/rules.test.ts) using in-memory `ts-morph` projects (see existing `createTsx` / `collect` helpers).

4. **Docs** — Document the rule id, config key, and behavior in [`README.md`](./README.md) (Configuration / Rules table) and mention notable options in [`tore.config.example.json`](./tore.config.example.json) if applicable.

5. **User-facing copy** — Keep violation `message` strings clear and in English.
