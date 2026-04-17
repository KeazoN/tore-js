# Rule backlog (prioritized)

Candidate **Töre** rules: architectural / policy checks that **complement ESLint**, not duplicate it. Each row lists a **rule id** (kebab-case target), **acceptance criteria** for implementation, and **notes**.

Priority is rough: **P0** = high value and tractable with the current ts-morph pipeline; **P1** = high value but needs path resolution or more design; **P2** = optional / opinionated.

## P0 — implement first (high signal, AST-friendly)

| rule id (proposed) | Intent | Acceptance criteria |
| --- | --- | --- |
| `no-dangerously-set-inner-html` | Flag `dangerouslySetInnerHTML` on JSX elements. | Violation at the prop identifier or opening tag; severity configurable; off by default or warn-first in presets is a product choice. |
| `no-debugger` | Flag `debugger` statements. | One violation per statement; respects file `include` / `exclude`. |
| `no-eval` | Flag `eval(` and `new Function(` | Parser-stable detection; optional allow-list comment escape documented if added later. |

## P1 — strong fit after tsconfig paths / imports

| rule id (proposed) | Intent | Acceptance criteria |
| --- | --- | --- |
| `forbidden-imports` | Block imports from modules (e.g. `moment`, internal server paths). | Config: list of forbidden specifiers or globs; violation on import declaration module string; **document** limitation until `paths` / monorepo resolution exists. |
| `jsx-component-import-whitelist` | Certain JSX tags must come from approved import paths (design system). | Config: map tag name → allowed import path globs; requires resolving named/default imports from local symbols. |
| `no-client-server-import` | In `'use client'` files, forbid imports matching server-only globs. | Configurable patterns; document false positives until alias resolution improves. |

## P2 — opinionated or overlap-risk

| rule id (proposed) | Intent | Acceptance criteria |
| --- | --- | --- |
| `no-console` | Disallow `console.*` outside tests/stories. | Configurable `include`/`exclude` per rule or rely on global exclude; severity default `warn`. |
| `no-default-export` | Enforce named exports in selected globs. | Clear docs; default `off`; team opt-in only. |
| `restricted-hooks` | e.g. ban `useEffect` under certain path globs. | Requires agreed directory convention and stable AST for hook name. |

## Process

1. Pick a row; open an issue using the **Feature or new rule** template.  
2. Implement per [CONTRIBUTING.md](../CONTRIBUTING.md) (rule file, Zod + JSON Schema, tests, README table).  
3. Prefer shipping new rules as **warn** in `warn-first` preset before promoting to **error** in `next` / default templates.
