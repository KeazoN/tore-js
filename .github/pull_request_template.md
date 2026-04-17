## What changed

<!-- Short description for reviewers. -->

## Checklist

- [ ] Focused change (single concern where possible).
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] `node dist/cli.mjs check` passes (smoke against this repo’s constitution).
- [ ] `bun test` passes.
- [ ] If you changed `tore.config.schema.json`, you updated the Zod mirror in `src/config/tore-config.zod.ts` (or vice versa) and kept examples consistent.

## Notes for maintainers

<!-- Optional: migration notes, follow-up issues, screenshots of JSON output. -->
