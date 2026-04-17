# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `tore init` command to scaffold `tore.config.json` from the published example template.
- `tore init --preset default|next|warn-first` using shipped templates under `presets/`.
- `tore check --format github` for GitHub Actions workflow commands (annotations) on stdout.
- Community templates (issue forms, pull request template) and `CODE_OF_CONDUCT.md`.
- `CHANGELOG.md` and a public roadmap section in the README.
- `docs/RULE_BACKLOG.md` (prioritized candidate rules + acceptance criteria) and `docs/ROADMAP.md` (SARIF, Node API, performance, shared config).
- CONTRIBUTING guidance for adding new rules.
- Optional `npm audit` step in CI (high severity, non-blocking).

### Changed

- README: consumer GitHub Actions example, `package.json` script snippet, concrete violation JSON example, clearer Node vs Bun wording, and explicit **ESLint-complementing** product positioning.
- Issue and PR templates: scope reminder (Töre vs ESLint) where relevant.
- `package.json` description aligned with architectural-guardian positioning.
- `tore init` now rewrites `$schema` to the published unpkg URL so editors validate without a local `tore.config.schema.json` copy.

## [0.1.3]

### Added

- Published `@keazon/tore-js` with `tore check`, JSON reports, configurable rules (`no-inline-style`, `no-explicit-any`, `forbidden-jsx-intrinsic`, `component-file-location`), optional snippet masking, and JSON Schema for `tore.config.json`.
