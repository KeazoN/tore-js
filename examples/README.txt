Töre JS — sample configuration files
Logo: https://i.hizliresim.com/4l9u0a3.png
====================================

minimal-tore.config.json
  Empty object "{}"; all defaults come from the built-in Zod schema. Quick start.

nextjs-app-router.config.json
  Strict defaults for a Next.js App Router layout with components under src/.

warn-only-tore.config.json
  Same rule shapes with severities set to "warn" only (useful for gradual rollout).

See also ../tore.config.example.json at the repository root for the most complete template.

CLI presets (same shapes as some files here):
  tore init --preset default   → full example (tore.config.example.json)
  tore init --preset next      → mirrors nextjs-app-router.config.json
  tore init --preset warn-first → mirrors warn-only-tore.config.json

Note: JSON does not support comments; this file carries human-readable notes only.
