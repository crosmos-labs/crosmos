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

**[Crosmos](https://crosmos.dev)** — Memory Layer for AI agents. Store, retrieve, and organize knowledge across sessions.

[Docs](https://docs.crosmos.dev) · [Console](https://console.crosmos.dev) · [X](https://x.com/crosmoslabs) · [GitHub](https://github.com/crosmos-labs) · [LinkedIn](https://linkedin.com/company/crosmos-ai)

**Turborepo · Bun · Next.js · shadcn/ui**

<img width="2000" height="0">
</td>
</tbody>
</table>
</div>

> [!IMPORTANT]
> Crosmos is currently in **beta**.

### Workspace

| Path | Description |
|---|---|
| `apps/app` | Console (port 3000) |
| `apps/web` | Landing page (port 3001) |
| `apps/docs` | Docs (Mintlify) |
| `packages/ui` | `@crosmos/ui` — shared components |
| `packages/graph` | `@crosmos/graph` — force-graph viz |
| `skills/` | Agent skills (Crosmos Memory) |

### Skills

Enables AI agents to automatically store and retrieve memories via the [Crosmos MCP](https://github.com/crosmos-labs/crosmos-mcp). Agents decide whether to ingest or search based on user intent — no explicit commands needed.

```bash
npx skills add crosmos-labs/crosmos      # add to project
npx skills add crosmos-labs/crosmos -g   # add globally
```

For details, see [skills/README.md](skills/README.md).

### Commands

```bash
bun install       # install
bun run dev       # dev servers
bun run build     # build all
bun run typecheck # typecheck all
bun run check:fix # lint + format
```
