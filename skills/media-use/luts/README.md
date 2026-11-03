# LUT library (authoring)

`index.json` is the agent-consumed catalog of color-grade looks. Each entry resolves
on demand — no `.cube` bodies are committed to the repo.

Each look has:

- `id`, `description`, `tags`, `intensity` — matching + application metadata.
- `url` (optional) — a hosted `.cube` downloaded, validated, and frozen at resolve
  time, exactly like bgm/image assets.
- `params` (optional) — a deterministic `buildCube` spec used offline (`--local-only`)
  or as a fallback if the `url` download/validation fails.

An entry needs at least one of `url` or `params`; prefer both (a hosted url with a params
fallback) so resolution is never blocked on the network.

## Adding a new look

1. Write the `params` spec for the look, or generate a `.cube` (e.g. `resolve -t lut --params '{...}'` or a graded export) and host it yourself.
2. Add an entry to `index.json`: `params` alone works offline; add a `url` to your hosted `.cube` only with `params` as the fallback.
