<p align="center">
  <img src="https://i.hizliresim.com/4l9u0a3.png" alt="Töre JS" width="200" />
</p>

# Contributing to Töre JS

## Prerequisites

- **Node.js** 18 or newer (for `npm`, `esbuild` build, and running `node dist/cli.mjs`).
- **Bun** (for `bun test` and optional `bun run src/cli/index.ts check` during development).

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
