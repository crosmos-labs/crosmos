# @crosmos/graph — Production Readiness Report

Date: 2026-05-12
Auditor: OpenCode

## Executive Summary

`@crosmos/graph` delivers a polished, canvas-based force graph component with opinionated styling and interaction details. The codebase is readable, type-safe, and ships dual ESM/CJS bundles with type declarations, which makes it straightforward to consume in both app and library contexts. However, the package currently lacks automated testing, relies heavily on a mutable global config object, and has limited guidance around performance budgeting or accessibility, which collectively limit its enterprise readiness.

### Assessment Inputs
- Code review of `packages/graph/src/*`, `tsup.config.ts`, `package.json`, and generated `dist/` artifacts.
- Hands-on verification via the standalone `apps/graph-playground` Next.js app (build + runtime smoke checks).
- Tooling runs: `bun run typecheck`, `bun run build --filter=graph-playground`.

### Confidence
- **Medium** — based on source inspection and local builds; no formal benchmarking or production telemetry available.

## Scorecard

| Category | Score (0–5) | Evidence |
| --- | --- | --- |
| API Design & DX | **4.0** | `ForceGraph` + popovers expose minimal props, strong TS types (`src/index.tsx` exports). No per-instance config overrides or custom render hooks. |
| Code Quality & Maintainability | **4.2** | Strict compiler options, modular code, tsup bundling; lacks lint/tests. |
| Performance & Scalability | **3.5** | Custom hover animations + d3-force tuning in `force-graph.tsx`; no load tests or worker offloading. |
| Accessibility & UX | **2.8** | Popovers handle Esc; canvas lacks ARIA semantics, fixed color palette, no narration. |
| Testing & Reliability | **2.0** | No tests in package; depends on manual QA via playground. |
| Distribution & Tooling | **4.5** | Dual-format bundles, sourcemaps, `sideEffects: false`; semantic-release scaffold present but not enforced. |
| Documentation & Support | **3.8** | README covers usage and config; misses FAQ, troubleshooting, theming, perf guidance. |
| Security & Supply Chain | **3.5** | No runtime secrets, low attack surface; however no dependency audit or threat modeling. |

**Overall readiness:** 3.6 / 5 — suitable for controlled production pilots; add tests, perf guardrails, and accessibility hooks before broad GA.

## Detailed Findings

### API Design & DX
- ForceGraph exposes the essential callbacks and consumes plain data structures (`GraphNode`, `GraphEdge`), lowering integration effort.
- All configuration is centralized in a mutable singleton `GRAPH_CONFIG`, which is convenient but global. Instance-level overrides would be safer for multi-graph UIs.
- Popover components assume Tailwind utility classes and CSS variables from shadcn-like themes; consider exporting style-less primitives or documenting alternatives.

### Code Quality & Maintainability
- Source is fully typed with `noUncheckedIndexedAccess`, aiding correctness.
- Dynamic import of `react-force-graph-2d` prevents SSR crashes.
- There is no lint/test pipeline inside the package; issues must be caught by downstream apps.

### Performance & Scalability
- Uses d3-force with explicit charge/link tuning and reheating on mount, which is adequate for a few hundred nodes.
- Hover animations rely on `requestAnimationFrame` and state invalidation via `setRenderTick`; this is performant but undocumented. Consider clamping maximum animation loops for large graphs.
- Missing virtualization for popovers or partial rendering; large datasets may still hurt CPU.

### Accessibility & UX
- Canvas renders lack ARIA roles or fallback text; screen readers cannot interpret the graph.
- Color palette is hard-coded (OKLCH + white) with no contrast checks.
- Keyboard interaction exists only for closing popovers (Esc); no navigation between nodes.

### Testing & Reliability
- No unit or integration tests for interaction logic, hover animation, or data transformations.
- No Storybook/visual regression harness for popovers or graph states.
- Publishing pipeline uses tsup + semantic-release, but without smoke tests you risk regressions.

### Distribution & Tooling
- Bundles include ESM + CJS with declarations and sourcemaps, and mark `react`, `react-dom`, `d3-force` as externals.
- `sideEffects: false` enables tree-shaking.
- Peer dependency on Tailwind v4 is optional but undocumented regarding fallback styles.
- Semantic-release config exists, but there is no CI recipe in this repo to run it or publish artifacts.

### Documentation & Support
- README explains installation, peer deps, CSS requirements, and component usage, plus configurability hints.
- Missing sections: performance tips (node/edge limits), accessibility strategies, SSR caveats, FAQ/common errors.

## Recommendations
1. **Introduce automated testing** — start with unit tests covering hover/click handlers and utility functions, plus Playwright visual tests for canvas rendering.
2. **Instance-level configuration** — allow passing a `config` prop to ForceGraph to avoid reliance on global mutable state.
3. **Accessibility improvements** — add descriptive ARIA roles, keyboard navigation, and expose `ariaLabel` props for nodes/edges.
4. **Performance guidance** — document tested graph sizes, add optional worker-based layout or heuristics for large datasets.
5. **Styling flexibility** — expose className/style hooks for popovers and allow disabling built-in popovers entirely.
6. **Release hygiene** — add CHANGELOG generation (semantic-release config already present) and publish smoke tests prior to release.
7. **Security posture** — run dependency audits (e.g., `bun audit` or `npm audit`) in CI and document expected runtime sandboxing to reassure downstream users.

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Regression due to lack of automated testing | Medium | High | Introduce unit/e2e suites + CI gates before publishing. |
| Accessibility non-compliance in regulated environments | Medium | Medium | Add ARIA roles, focus management, and document accessibility guarantees. |
| Performance degradation on large datasets | Medium | Medium/High | Provide scalability benchmarks, expose layout tuning or worker delegation. |
| Global config collisions in multi-instance apps | Low/Medium | Medium | Support per-instance config or immutable config objects. |

## Evidence Log

- `tsup.config.ts` — verifies bundle formats, externals, sourcemap configuration.
- `src/components/force-graph.tsx` — demonstrates hover animation loops, d3-force tuning, and current rendering strategy.
- `apps/graph-playground` — builds successfully against npm-distributed artifact, proving portability outside the monorepo.
