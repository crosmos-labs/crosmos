import { notFound } from "next/navigation";
import { DevGraph } from "@/components/graph/dev-graph";

/**
 * Dev-only mock-data sandbox for `@crosmos/graph`.
 *
 * Returns 404 in production builds via `process.env.NODE_ENV`, which Next.js
 * statically replaces at build time — so the route is unreachable on prod and
 * the dead branch is dropped before runtime. Local `bun run dev` serves it
 * normally.
 */
export default function DevGraphPage() {
	if (process.env.NODE_ENV === "production") {
		notFound();
	}
	return <DevGraph />;
}
