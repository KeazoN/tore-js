# Roadmap (not a release promise)

Themes that matter for **adoption at scale** and for keeping Töre distinct from ESLint.

## Output and integrations

- **SARIF 2.1** export (or a dedicated `--format sarif`) so GitHub Advanced Security, Azure DevOps, and other consumers can ingest results without custom JSON parsers.
- **Stable programmatic API** (Node): export a small surface (e.g. `runCheck({ cwd, config, filePatterns })` returning the same report type as JSON stdout), semver-guarded, for custom CI and internal tooling.
- **Report metadata**: optional `ruleVersion` / `toolVersion` / `configHash` fields in JSON for caching, dashboards, and drift detection.

## Performance and scale

- **Large monorepos**: incremental or “changed files only” mode (e.g. git diff input) to avoid full-tree ts-morph cost on every run.
- **Parser strategy** (long term): evaluate faster parsers or hybrid pipelines while keeping rule authoring ergonomic; today’s constraint is documented in README (*Limits*).

## Configuration ergonomics

- **`extends` / shared presets**: compose org-wide base config from an npm package (`@org/tore-preset`) without copy-paste; `tore init --preset` is the first step; composition remains a follow-up.

## Relationship to other tools

- Stay **narrow and deep** on architecture and AI-sensitive patterns; defer generic style and import ordering to ESLint.
