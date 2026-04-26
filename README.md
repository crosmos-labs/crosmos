<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="apps/app/public/banner_dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="apps/app/public/banner_light.svg">
  <img alt="Crosmos" src="apps/app/public/banner_dark.svg" width="500">
</picture>

**[Crosmos](https://crosmos.dev)** — Memory Engine for AI agents. Store, retrieve, and organize knowledge across sessions.

[Docs](https://docs.crosmos.dev) · [Console](https://console.crosmos.dev) · [X](https://x.com/crosmoslabs) · [GitHub](https://github.com/crosmos-labs) · [LinkedIn](https://linkedin.com/company/crosmos-ai)

— Turborepo monorepo · Bun · Next.js · shadcn/ui

</div>

| Path | Description |
|---|---|
| `apps/app` | Console (port 3000) |
| `apps/web` | Landing page (port 3001) |
| `apps/docs` | Docs (Mintlify) |
| `packages/ui` | `@crosmos/ui` — shared components |
| `packages/graph` | `@crosmos/graph` — force-graph viz |

```bash
bun install       # install
bun run dev       # dev servers
bun run build     # build all
bun run typecheck # typecheck all
bun run check:fix  # lint + format
```