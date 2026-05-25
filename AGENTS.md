# Crosmos Monorepo — Agent Instructions

## Workspace Structure

Turborepo monorepo, package manager is **Bun** (`bun@1.2.21`).

| Path | Purpose |
|---|---|
| `apps/app` | Main Next.js app (console) — port 3000 |
| `apps/web` | Landing page Next.js app — port 3001 |
| `apps/docs` | Mintlify docs site |
| `packages/ui` | `@crosmos/ui` — shared shadcn/radix-nova component library |
| `packages/graph` | `@crosmos/graph` — force-graph visualization |
| `packages/typescript-config` | Shared `tsconfig` profiles (`base`, `nextjs`, `react-library`) |

## Commands

```bash
bun run dev          # turbo dev — all apps
bun run build        # turbo build
bun run typecheck    # turbo typecheck
bun run check:fix    # biome check --write —unsafe (lint + format + organize imports)
bun run check        # biome check — dry lint/format check
bun run clean        # turbo clean && rm -rf .turbo
```

### After every change: run `bun run check:fix && bun run typecheck`

To target a single package: `bun run dev --filter=app`, `bun run typecheck --filter=web`, etc.

## Code Style

- **Biome** (not ESLint/Prettier). Tab indentation, double quotes, trailing commas.
- Biome also handles import organization (enabled via `assist.actions.source.organizeImports`).
- TypeScript strict mode with `noUncheckedIndexedAccess`.

## UI / Components

- **shadcn** style `radix-nova`, icon library `tabler`.
- Shared UI components live in `packages/ui/src/components/` — import as `@crosmos/ui/components/button`.
- App-local components live in each app's `components/` dir (import as `@/components/...`).
- The `cn()` utility: `import { cn } from "@crosmos/ui/lib/utils"`.
- Shared CSS (Tailwind v4 + oklch color variables): `@crosmos/ui/globals.css`.
- Additional shadcn registries available: `@kibo-ui`, `@arc`, `@react-bits`.
- **Always use shadcn components for UI.** Use the shadcn skill when adding components. Ask the user about layout and design decisions for maximum configurability.

## App Patterns (`apps/app`)

- Next.js 16 App Router. Route groups: `(dashboard)` and `(auth)`.
- Server actions: `apps/app/actions/*.ts`.
- Client data fetching: **SWR** (not React Query). Hooks in `apps/app/hooks/`.
- Auth: server-side `verifyAuth()` from `@/lib/auth/session`.
- Path aliases: `@/*` → app root, `@crosmos/ui/*` → `packages/ui/src/*`.
- Dark mode via `next-themes` (`.dark` class strategy).
- Typecheck in apps: `next typegen && tsc --noEmit` (Next.js codegen runs first).

## Git & PR Workflow

- **Never push to `main`.** Never push to `dev` unless asked.
- Always ask the user before creating a branch or PR — including the branch name.
- Commit messages use **conventional commits with scope** — subject line only, no description/body: `feat(app): add login page`, `fix(web): fix hero layout`, `chore(ui): bump deps`. Scope matches the package (`app`, `web`, `docs`, `ui`, `graph`, `ts`). No scope needed for global/root changes. **Never use uppercase characters** in commit messages — all lowercase, including the first word after the colon.
- PR title format: concise and understandable, no conventional commit prefix.
- PR description format: Summary heading, then individual commit summaries. If >10 commits, write an overall summary in bullet points instead.

## Releasing (`packages/graph`)

Releases use a manual version-bump PR. No bot writes to the repo. The workflow only reads `packages/graph/package.json` and acts when the version changes.

### Flow

1. On `dev`, edit `packages/graph/package.json` and bump the version (you decide the semver bump). Commit: `chore(graph): release X.Y.Z`. Push.
2. Open a PR `dev → main` titled e.g. `release: graph X.Y.Z`. Merge as a **merge commit**.
3. `release.yml` fires on main. The `check-version` job sees the new version, the `create-release` job creates the git tag `@crosmos/graph@X.Y.Z` and a GitHub Release with auto-generated notes (`gh release create --generate-notes`).
4. The `publish-npm` job **pauses** on the `production-npm` environment.
5. Preview the GitHub Release in the UI. Edit the notes if you want polish. When happy → Actions tab → **Review deployments → Approve and deploy** → `npm publish --provenance` runs.
6. To abort instead: **Reject** the deployment, then `gh release delete '@crosmos/graph@X.Y.Z' --cleanup-tag`. npm is untouched.

Because the version bump originates on `dev`, no back-merge is needed — `dev` and `main` stay aligned after merging.

### Don't

- Bump the version directly on `main`. Always do it on `dev` and PR.
- Hand-create tags or GitHub Releases — the workflow owns them.
- Squash or rebase the release PR (use merge commit so the bump commit stays an anchor in history).

## Docs (`apps/docs`)

- Mintlify docs site. Pages are MDX with YAML frontmatter. Config in `docs.json`.
- Use the **mintlify** skill when creating or editing docs pages, navigation, or components.

## Web Research

- Use the **defuddle** skill when fetching web pages for research — it extracts clean markdown and removes clutter, saving tokens.
  - Run `defuddle parse <url> --md` instead of WebFetch for documentation, articles, and blog posts.
  - Use WebFetch only for URLs ending in `.md` (already markdown).

## Framework Documentation

- Refer to **context7 MCP** for any framework or toolkit docs (Next.js, shadcn, Tailwind, Radix, etc.) before making assumptions about APIs.