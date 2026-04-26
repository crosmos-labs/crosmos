<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="apps/app/public/banner_dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="apps/app/public/banner_light.svg">
  <img alt="Crosmos" src="apps/app/public/banner_dark.svg" width="360">
</picture>

<br>

<table>
<tbody>
<td align="center">
<img width="2000" height="0"><br>

**[Crosmos](https://crosmos.dev)** — Memory Engine for AI agents. Store, retrieve, and organize knowledge across sessions.

[Docs](https://docs.crosmos.dev) · [Console](https://console.crosmos.dev) · [X](https://x.com/crosmoslabs) · [GitHub](https://github.com/crosmos-labs) · [LinkedIn](https://linkedin.com/company/crosmos-ai)
**Turborepo · Bun · Next.js · shadcn/ui**

<img width="2000" height="0">
</td>
</tbody>
</table>
</div>

> [!IMPORTANT]
> Crosmos is currently in **beta**. Expect breaking changes and bugs.

### Workspace

| Path | Description |
|---|---|
| `apps/app` | Console (port 3000) |
| `apps/web` | Landing page (port 3001) |
| `apps/docs` | Docs (Mintlify) |
| `packages/ui` | `@crosmos/ui` — shared components |
| `packages/graph` | `@crosmos/graph` — force-graph viz |

### Commands

```bash
bun install       # install
bun run dev       # dev servers
bun run build     # build all
bun run typecheck # typecheck all
bun run check:fix # lint + format
```
